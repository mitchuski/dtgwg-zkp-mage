"""Optional cost-report arithmetic; never a conformance or registry verdict."""

import json
import os
from pathlib import Path
import stat
import sys

MAX_INTEGER = (1 << 53) - 1
MAX_BYTES = 64 << 10
COMPONENTS = {
    'G': {'shared-producer'},
    'P': {'setup', 'preprocessing', 'parsing', 'witness', 'proof-construction', 'export-verification', 'serialization', 'credential-status-request-checks'},
    'R': {'setup', 'parsing', 'recomputation', 'credential-status-request-checks'},
    'V': {'setup', 'proof-parsing', 'final-verifier-or-decider', 'credential-status-request-checks'},
}
METRICS = {'peak-live-heap', 'allocation-volume', 'peak-resident', 'accelerator-memory', 'serialized-proof'}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def members(value, keys, label):
    require(type(value) is dict and set(value) == set(keys), label + ': unexpected or missing fields')


def text(value, label):
    require(type(value) is str and 0 < len(value.strip()) <= 2048, label + ': nonempty bounded text required')


def integer(value, label, minimum=0):
    require(type(value) is int and minimum <= value <= MAX_INTEGER, label + ': safe integer required')
    return value


def interval(value, label):
    require(type(value) is list and len(value) == 2, label + ': two endpoints required')
    low, high = (integer(x, label) for x in value)
    require(low <= high, label + ': reversed interval')
    return low, high


def texts(value, label, minimum=0):
    require(type(value) is list and minimum <= len(value) <= 32, label + ': bounded list required')
    for item in value:
        text(item, label)
    require(len(set(value)) == len(value), label + ': duplicate entries')


def sign(bounds):
    low, high = bounds
    return 'positive' if low > 0 else 'negative' if high < 0 else 'zero' if low == high == 0 else 'includes-zero'


def assess(report):
    members(report, ['pinned', 'informative', 'readers', 'proofs', 'costs', 'resources'], 'report')
    pinned = report['pinned']
    members(pinned, ['formatVersion', 'configuration', 'statement', 'workload', 'inputs', 'acceptedOutputs', 'disclosure', 'adversary', 'horizon', 'security', 'sourceBuilds', 'artifactReports', 'doesNotEstablish', 'comparator'], 'pinned')
    require(pinned['formatVersion'] == 'lab-comparison-report/v0', 'unknown formatVersion')
    for key in ['configuration', 'statement', 'workload', 'inputs', 'acceptedOutputs', 'disclosure', 'adversary', 'horizon', 'security', 'sourceBuilds']:
        text(pinned[key], 'pinned.' + key)
    texts(pinned['artifactReports'], 'artifactReports', 1)
    texts(pinned['doesNotEstablish'], 'doesNotEstablish', 1)
    require(pinned['comparator'] in ['privacy-matched', 'computation-reference-only'], 'comparator must disclose privacy mismatch')
    info = report['informative']
    members(info, ['evidenceKind', 'platform', 'tools', 'conditions', 'order', 'uncertainty', 'exclusions', 'amortization', 'role'], 'informative')
    require(info['evidenceKind'] in ['synthetic', 'measured'], 'evidenceKind must distinguish synthetic data')
    for key in ['platform', 'tools', 'conditions', 'order', 'uncertainty', 'exclusions', 'amortization', 'role']:
        text(info[key], 'informative.' + key)
    readers = integer(report['readers'], 'readers', 1)
    require(readers <= 1_000_000, 'reader count outside bounded report scope')
    proofs = report['proofs']
    members(proofs, ['binding', 'count', 'producerAccounting', 'reuseBasis'], 'proofs')
    require(proofs['binding'] in ['reusable', 'recipient-bound'], 'unknown proof binding')
    count = integer(proofs['count'], 'proof count', 1)
    require(count == (1 if proofs['binding'] == 'reusable' else readers), 'proof multiplicity does not match binding')
    require(proofs['producerAccounting'] == 'additional-to-G-per-proof', 'P must exclude genuinely shared G and be paid per proof')
    text(proofs['reuseBasis'], 'proof reuse basis')
    costs = report['costs']
    members(costs, COMPONENTS, 'costs')
    bounds, excluded = {}, []
    for name, components in COMPONENTS.items():
        cost = costs[name]
        members(cost, ['cpuNs', 'elapsedNs', 'configuration', 'cpuScope', 'included', 'excluded'], name)
        require(cost['configuration'] == pinned['configuration'], 'cost configurations differ')
        require(cost['cpuScope'] == 'all-threads-and-processes', 'CPU scope must include all relevant threads/processes')
        bounds[name] = interval(cost['cpuNs'], name + '.cpuNs')
        interval(cost['elapsedNs'], name + '.elapsedNs')
        texts(cost['included'], name + '.included')
        require(type(cost['excluded']) is dict and len(cost['excluded']) <= len(components), name + ': excluded component reasons required')
        for component, reason in cost['excluded'].items():
            text(reason, name + '.excluded reason')
            excluded.append(name + ':' + component)
        included, missing = set(cost['included']), set(cost['excluded'])
        require(not included & missing and included | missing == components, name + ': each required component must be included or explicitly excluded')
    resources = report['resources']
    require(type(resources) is list and len(resources) <= 32, 'bounded separate resource records required')
    resource_status, seen = [], set()
    for item in resources:
        members(item, ['metric', 'bytes', 'scope', 'concurrency', 'configuration', 'covers', 'scopeComplete', 'limitBytes', 'limitKind'], 'resource')
        require(type(item['metric']) is str and item['metric'] in METRICS, 'resource metric must remain distinct')
        require(item['configuration'] == pinned['configuration'], 'resource and cost configurations differ')
        text(item['scope'], 'resource scope')
        integer(item['concurrency'], 'resource concurrency', 1)
        texts(item['covers'], 'resource covers', 1)
        require(type(item['scopeComplete']) is bool, 'resource completeness must be explicit')
        value = integer(item['bytes'], 'resource bytes')
        key = (item['metric'], item['scope'], item['concurrency'])
        require(key not in seen, 'duplicate resource scope')
        seen.add(key)
        if item['limitBytes'] is None:
            require(item['limitKind'] == 'none', 'absent resource limit must say none')
            below = None
        else:
            limit = integer(item['limitBytes'], 'resource limit', 1)
            require(item['limitKind'] in ['observed', 'enforced'], 'resource limit kind required')
            below = value < limit
        resource_status.append({'metric': item['metric'], 'scope': item['scope'], 'scopeComplete': item['scopeComplete'], 'concurrency': item['concurrency'], 'bytes': value, 'limitBytes': item['limitBytes'], 'belowDeclaredLimit': below, 'limitKind': item['limitKind']})
    g, p, r, v = (bounds[name] for name in 'GPRV')
    totals = {
        'recompute': [g[i] + readers * r[i] for i in (0, 1)],
        'proofRoute': [g[i] + count * p[i] + readers * v[i] for i in (0, 1)],
        'readerSaving': [r[0] - v[1], r[1] - v[0]],
        'totalSaving': [readers * (r[0] - v[1]) - count * p[1], readers * (r[1] - v[0]) - count * p[0]],
    }
    require(all(abs(value) <= MAX_INTEGER for values in totals.values() for value in values), 'derived total exceeds safe integer range')
    status = 'arithmetic-only-synthetic' if info['evidenceKind'] == 'synthetic' else 'incomplete-costs' if excluded else 'computation-reference-only' if pinned['comparator'] != 'privacy-matched' else 'declared-complete-comparison'
    return {
        'evidenceKind': info['evidenceKind'], 'status': status, 'comparator': pinned['comparator'], 'completeCosts': not bool(excluded), 'cpuNs': totals,
        'readerSavingSign': sign(totals['readerSaving']), 'totalSavingSign': sign(totals['totalSaving']),
        'excludedComponents': excluded, 'resources': resource_status,
        'scope': 'Arithmetic over supplied bounds only; no confidence, privacy, security, measurement-validity or registry verdict. Elapsed time and resource metrics are not added to CPU.',
    }


def load_report(path):
    path = Path(path)
    require(not path.is_symlink(), 'regular report file without symlink required')
    flags = os.O_RDONLY | getattr(os, 'O_NOFOLLOW', 0) | getattr(os, 'O_NONBLOCK', 0)
    with os.fdopen(os.open(path, flags), 'rb') as stream:
        opened = os.fstat(stream.fileno())
        require(stat.S_ISREG(opened.st_mode), 'opened report must be a regular file')
        require(opened.st_size <= MAX_BYTES, 'report exceeds 64 KiB')
        data = stream.read(MAX_BYTES + 1)
    require(len(data) <= MAX_BYTES, 'report exceeds 64 KiB')
    def parse_integer(raw):
        require(len(raw.lstrip('-')) <= 16, 'integer token exceeds safe range')
        value = int(raw)
        require(abs(value) <= MAX_INTEGER, 'integer token exceeds safe range')
        return value
    def reject_number(raw):
        raise ValueError('only integer numeric tokens are accepted')
    def unique(pairs):
        result = {}
        for key, value in pairs:
            require(key not in result, 'duplicate JSON object key')
            result[key] = value
        return result
    return json.loads(data, parse_int=parse_integer, parse_float=reject_number, parse_constant=reject_number, object_pairs_hook=unique)


if __name__ == '__main__':
    try:
        require(len(sys.argv) == 2, 'usage: python3 check.py REPORT.json')
        print(json.dumps(assess(load_report(sys.argv[1])), indent=2))
    except ValueError as error:
        print('invalid comparison report: ' + str(error), file=sys.stderr)
        sys.exit(1)
    except (OSError, UnicodeError, RecursionError):
        print('invalid or unreadable comparison report', file=sys.stderr)
        sys.exit(1)
