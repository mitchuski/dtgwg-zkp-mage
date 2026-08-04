# consume.py — the SECOND-LANGUAGE consumer of the X1 conformance-fixture
# suite (X1 milestone M5). Python 3, stdlib only (hashlib, json, re, pathlib).
#
# This file re-implements, independently of the JavaScript, everything the 39
# frozen vectors exercise: the canonical §6.2/§15.2 encodings and digests, the
# runtime-01 nullifier algebra, the runtime-07 trust-graph relations, the
# show-composition verifier, the context-card render/diff instrument, the
# attestation-lifecycle / fallback / epoch semantic runners, and the
# prohibited-pattern lint. It shares NO code with the .mjs sources — only the
# vectors and the register vocabulary (see reasons.py) are common ground.
#
# The claim under test (§26; X1 M5): two implementations with no shared code,
# fed the same vectors, must reach the SAME outcome AND the SAME reason code,
# byte for byte. If they do, the fixtures — not the JavaScript — carry the
# decisions.
#
# Run: python consume.py  (cwd = this directory; reads ../fixtures/vectors)

import hashlib
import json
import re
from pathlib import Path

from reasons import is_known_reason

# =============================================================================
# Hash spine — runtime 01's H: SHA-256 over 4-byte big-endian length-prefixed
# UTF-8 parts (domain separation + length prefix so H(a,b) != H(a||b)).
# =============================================================================


def H(*parts):
    h = hashlib.sha256()
    for p in parts:
        b = p if isinstance(p, bytes) else str(p).encode('utf-8')
        h.update(len(b).to_bytes(4, 'big'))
        h.update(b)
    return h.hexdigest()


# =============================================================================
# Canonical JSON — must byte-match the JS canonicalize():
#   * object keys sorted (JS sorts UTF-16 code units; identical for ASCII keys,
#     which is all the suite uses — recorded in NOTES.md)
#   * separators exactly '{"k":v,"k2":v2}' / '[a,b]' — no whitespace
#   * strings escaped as JSON.stringify does: ", \, and control chars only,
#     non-ASCII left raw (json.dumps(ensure_ascii=False) matches)
#   * integers rendered without a decimal point; integral floats rendered the
#     JS way ("1" not "1.0"); non-finite numbers rejected
# =============================================================================


def _canon_number(x):
    if isinstance(x, float):
        if x != x or x in (float('inf'), float('-inf')):
            raise ValueError('non-finite-number')
        if x.is_integer() and abs(x) < 1e16:
            return str(int(x))  # JS prints 1.0 as "1"
        return repr(x)  # shortest round-trip, same as JS for doubles in range
    return str(x)


def _canon_string(s):
    return json.dumps(s, ensure_ascii=False)


def canonicalize(value):
    if value is None:
        return 'null'
    if value is True:
        return 'true'
    if value is False:
        return 'false'
    if isinstance(value, (int, float)):
        return _canon_number(value)
    if isinstance(value, str):
        return _canon_string(value)
    if isinstance(value, list):
        return '[' + ','.join(canonicalize(x) for x in value) + ']'
    if isinstance(value, dict):
        keys = sorted(value.keys())
        return '{' + ','.join(
            _canon_string(k) + ':' + canonicalize(value[k]) for k in keys
        ) + '}'
    raise ValueError(f'uncanonicalizable-type:{type(value).__name__}')


# =============================================================================
# §6.2 context descriptor + §15.2 canonical transcript (canonical.mjs port)
# =============================================================================

DOMAIN_DESCRIPTOR = 'dtg-zkp/context-descriptor/v0'
DOMAIN_TRANSCRIPT = 'dtg-zkp/transcript/v0'

DESCRIPTOR_FIELDS = [
    'protocol', 'profile', 'contextAuthority', 'contextPolicy', 'purpose',
    'scope', 'verifierSet', 'epoch', 'epochPolicy', 'nullifierVersion',
    'retentionPolicy',
]
DESCRIPTOR_OPTIONAL = ['registryDomain']

TRANSCRIPT_FIELDS = [
    'protocol', 'profile', 'verifier', 'contextDescriptorDigest', 'purpose',
    'scope', 'challenge', 'sessionId', 'requestedPredicates',
    'policyRequirements', 'expiry', 'snapshotRequirements', 'encodingVersion',
]
TRANSCRIPT_OPTIONAL = ['delegationRef', 'provingMode']


def _absent(d, f):
    # JS: d?.[f] === undefined || d[f] === null || d[f] === ''
    return f not in d or d[f] is None or d[f] == ''


def validate_descriptor(d):
    dd = d if isinstance(d, dict) else {}
    missing = [f for f in DESCRIPTOR_FIELDS if _absent(dd, f)]
    known = set(DESCRIPTOR_FIELDS) | set(DESCRIPTOR_OPTIONAL)
    unknown = [k for k in dd if k not in known]
    return {'ok': not missing and not unknown, 'missing': missing, 'unknown': unknown}


def descriptor_digest(d):
    v = validate_descriptor(d)
    if not v['ok']:
        defects = [f'missing:{m}' for m in v['missing']] + [f'unknown:{u}' for u in v['unknown']]
        raise ValueError('invalid-descriptor:' + ','.join(defects))
    return H(DOMAIN_DESCRIPTOR, canonicalize(d))


def validate_transcript(t):
    tt = t if isinstance(t, dict) else {}
    missing = [f for f in TRANSCRIPT_FIELDS if _absent(tt, f)]
    if 'requestedPredicates' in tt and not isinstance(tt['requestedPredicates'], list):
        missing.append('requestedPredicates:not-a-list')
    known = set(TRANSCRIPT_FIELDS) | set(TRANSCRIPT_OPTIONAL)
    unknown = [k for k in tt if k not in known]
    return {'ok': not missing and not unknown, 'missing': missing, 'unknown': unknown}


def transcript_digest(t):
    v = validate_transcript(t)
    if not v['ok']:
        defects = [f'missing:{m}' for m in v['missing']] + [f'unknown:{u}' for u in v['unknown']]
        raise ValueError('invalid-transcript:' + ','.join(defects))
    return H(DOMAIN_TRANSCRIPT, canonicalize(t))


# =============================================================================
# Runtime 01 — uniqueness nullifier (nullifier.mjs port)
# =============================================================================

DOMAIN_SECRET = 'dtg-zkp/identity-secret/v0'
DOMAIN_COMMIT = 'dtg-zkp/enrolment-commitment/v0'
DOMAIN_NULL = 'dtg-zkp/nullifier/v0'


def enrol(human_id):
    s = H(DOMAIN_SECRET, human_id)
    r = H('blinding', human_id, s)
    return {'secret': s, 'blinding': r, 'commitment': H(DOMAIN_COMMIT, s, r)}


def nullifier(secret, context):
    return H(DOMAIN_NULL, secret, context)


class ContextRegistry:
    def __init__(self, context):
        self.context = context
        self.seen = set()

    def present(self, nullifier_value):
        if nullifier_value in self.seen:
            return {'admitted': False, 'reason': 'duplicate-human-in-context'}
        self.seen.add(nullifier_value)
        return {'admitted': True, 'reason': 'first-enrolment'}


# =============================================================================
# Runtime 07 — trust-graph formation (trust-graph.mjs port, vector-exercised
# subset: joinCommunity / rdid / Swordsman.prove / TrustGraph / roster)
# =============================================================================

DOMAIN_RDID = 'dtg-zkp/r-did/v0'
DOMAIN_VRC = 'dtg-zkp/vrc-commitment/v0'


def join_community(human_id, community):
    ident = enrol(human_id)
    member = nullifier(ident['secret'], community)
    return {
        'humanId': human_id, 'community': community,
        'secret': ident['secret'], 'commitment': ident['commitment'],
        'member': member,
    }


def rdid(node, counterparty_member):
    return H(DOMAIN_RDID, node['secret'], counterparty_member)


class TrustGraph:
    def __init__(self):
        self.adj = {}
        self.edges = []

    @staticmethod
    def _key(a, b):
        return '|'.join(sorted([a, b]))

    def has_edge(self, a, b):
        return self._key(a, b) in self.adj

    def add_edge(self, edge):
        k = self._key(edge['a'], edge['b'])
        if k in self.adj:
            return False
        self.adj[k] = edge
        self.edges.append(edge)
        return True


def swordsman_prove(members, graph, c):
    def reject(reason):
        return {'signed': False, 'reason': reason}

    a_node = members.get(c['a'])
    b_node = members.get(c['b'])
    # 1. both endpoints personhood-anchored members
    if not a_node or not b_node:
        return reject('endpoint-not-personhood-anchored')
    # 2. no self-edge
    if c['a'] == c['b']:
        return reject('self-edge-forbidden')
    # 3. bilateral consent
    if not c.get('consentA') or not c.get('consentB'):
        return reject('unilateral-no-mutual-consent')
    # 4. fresh per-counterparty R-DIDs
    if c['rdidA'] != rdid(a_node, b_node['member']) or c['rdidB'] != rdid(b_node, a_node['member']):
        return reject('r-did-mismatch')
    # 5. the Gap: recompute the VRC commitment independently
    vrc = H(DOMAIN_VRC, *sorted([c['a'], c['b']]), c['shared'])
    if vrc != c['claimedVrc']:
        return reject('vrc-commitment-forged')
    # 6. one VRC per pair
    if graph.has_edge(c['a'], c['b']):
        return reject('duplicate-edge')
    return {'signed': True, 'edge': {'a': c['a'], 'b': c['b'], 'vrc': vrc}}


def roster(nodes):
    return {n['member']: n for n in nodes}


# =============================================================================
# Show composition — bundle registry + verifyShow (bundles.mjs/show.mjs port)
# =============================================================================

DOMAIN_MEMBER = 'dtg-zkp/show-member/v0'

_MLP = ['PR-LIV', 'PR-ISS', 'PR-HLD', 'PR-FRE']
_EPP = _MLP + ['PR-PER', 'PR-UNQ']

REGISTRY = {
    f"{b['id']}@{b['version']}": b
    for b in [
        {'id': 'MLP-BASE', 'version': '1', 'profile': 'mlp', 'predicates': _MLP},
        {'id': 'MLP-BASE+DEL', 'version': '1', 'profile': 'mlp', 'predicates': _MLP + ['PR-DEL']},
        {'id': 'EPP-UNIQ', 'version': '1', 'profile': 'epp', 'predicates': _EPP},
        {'id': 'EPP-UNIQ+DEL', 'version': '1', 'profile': 'epp', 'predicates': _EPP + ['PR-DEL']},
        {'id': 'EPP-RANGE', 'version': '1', 'profile': 'epp', 'predicates': _EPP + ['PR-RNG']},
    ]
}


def lookup_bundle(registry, bundle_id, version):
    b = registry.get(f'{bundle_id}@{version}')
    if b:
        return {'ok': True, 'bundle': b}
    return {'ok': False, 'reason': 'bundle-outside-registry'}


def member_commitment(predicate, t_digest):
    return H(DOMAIN_MEMBER, predicate, t_digest)


def _is_number(x):
    return isinstance(x, (int, float)) and not isinstance(x, bool)


def verify_show(show, registry, now):
    if not _is_number(now):
        raise ValueError('now-required: pass the evaluation time explicitly')

    found = lookup_bundle(registry, show.get('bundleId'), show.get('bundleVersion'))
    if not found['ok']:
        return {'ok': False, 'reason': 'bundle-outside-registry'}
    bundle = found['bundle']

    v = validate_transcript(show.get('transcript'))
    if not v['ok']:
        return {'ok': False, 'reason': 'transcript-invalid'}
    t_digest = transcript_digest(show['transcript'])
    if t_digest != show.get('transcriptDigest'):
        return {'ok': False, 'reason': 'transcript-invalid'}

    def set_key(ps):
        return ','.join(sorted(ps))

    if set_key(show['transcript']['requestedPredicates']) != set_key(bundle['predicates']):
        return {'ok': False, 'reason': 'bundle-outside-registry'}

    expiry = show['transcript'].get('expiry')
    if not _is_number(expiry) or now > expiry:
        return {'ok': False, 'reason': 'stale-transcript'}

    members = show.get('members') or []
    by_predicate = {m['predicate']: m for m in members}
    for p in bundle['predicates']:
        if p not in by_predicate:
            return {'ok': False, 'reason': 'partial-show-rejected'}
    if len(members) != len(bundle['predicates']):
        return {'ok': False, 'reason': 'bundle-outside-registry'}

    for m in members:
        if m.get('transcriptDigest') != t_digest or \
                m.get('commitment') != member_commitment(m['predicate'], t_digest):
            return {'ok': False, 'reason': 'member-transcript-mismatch'}

    return {'ok': True}


# =============================================================================
# Context card — render / checkLegibility / diffCards (card.mjs port, as far
# as the PR-CTX vectors exercise it)
# =============================================================================

FIELD_QUESTION_MAP = {
    'purpose': ['q1'],
    'scope': ['q1'],
    'verifierSet': ['q2'],
    'contextAuthority': ['q2', 'q6'],
    'epoch': ['q3'],
    'epochPolicy': ['q3', 'q4'],
    'retentionPolicy': ['q3'],
    'nullifierVersion': ['q4'],
}

DEFAULT_JUSTIFICATIONS = {
    'protocol':
        'version pin — cryptographic internal (§6.8: internals need not be exposed); '
        'any change re-versions this card via the digest',
    'profile':
        'profile version pin — its operational meaning is fully rendered through q1–q6; '
        'a profile change re-versions this card via the digest',
    'contextPolicy':
        'policy identifier — the policy CONTENT is what q1–q4 and q6 render; '
        'the identifier itself is a governance internal, surfaced via the digest',
    'registryDomain':
        'accreditation-domain scoping of the verifier set — recognition meaning is '
        'carried by q2; the identifier is a governance internal, surfaced via the digest',
}

Q_IDS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6']
NARROW = 'recognise repeat use (scoped reuse detection)'
NARROW_LANGUAGE = 'scoped reuse detection'
BROAD_LANGUAGE = re.compile(r'unique human|one unique|one person per', re.IGNORECASE)


def render_card(descriptor, options=None):
    options = options or {}
    v = validate_descriptor(descriptor)
    if not v['ok']:
        defects = [f'missing:{m}' for m in v['missing']] + [f'unknown:{u}' for u in v['unknown']]
        raise ValueError('invalid-descriptor:' + ','.join(defects))
    digest = descriptor_digest(descriptor)
    d = descriptor

    proving_mode = options.get('provingMode')
    questions = {
        'q1': (
            f'This proof is for the activity "{d["purpose"]}" within the scope "{d["scope"]}". '
            f'It shows you are eligible for that one activity and nothing else.'
        ),
        'q2': (
            f'Only the verifiers in "{d["verifierSet"]}", governed by "{d["contextAuthority"]}", '
            f'can {NARROW} within this context. No service outside that governed set is '
            f'granted recognition, and recognition never crosses into other contexts (§6.6).'
        ),
        'q3': (
            f'Repeat use is linkable during the epoch "{d["epoch"]}", which rolls over under '
            f'"{d["epochPolicy"]}"; verifier records fall under "{d["retentionPolicy"]}". Within '
            f'that window the governed verifiers can {NARROW}; when the window closes, the '
            f'linkage ends.'
        ),
        'q4': (
            f'When the epoch rolls over under "{d["epochPolicy"]}", the reuse-detection value '
            f'(nullifier, "{d["nullifierVersion"]}") changes with it: what you did before the '
            f'change and what you do after it cannot be linked to each other.'
        ),
        'q5': (
            f'Yes — if your device cannot prove on its own, a mediated prover '
            f'("{proving_mode}") helps, and that mediating service becomes an '
            f'additional observer of the event. Mediation is shown to you while it '
            f'happens (§21.2), and the mediator is bound by non-retention rules.'
            if proving_mode else
            'No — local proving only — no additional observer. The proof is generated '
            'on your own device; no extra service sees that this event happened.'
        ),
        'q6': (
            f'A wrong reuse or uniqueness decision can be challenged through '
            f'"{d["contextAuthority"]}", which is required (§6.7) to provide a correction, '
            f'appeal, and challenge route for this context.'
        ),
    }

    justified = {}
    merged_just = {**DEFAULT_JUSTIFICATIONS, **(options.get('justifications') or {})}
    present = [f for f in DESCRIPTOR_FIELDS + DESCRIPTOR_OPTIONAL if f in d]
    rendered = [f for f in present if f in FIELD_QUESTION_MAP]
    unrendered = []
    for f in present:
        if f in FIELD_QUESTION_MAP:
            continue
        if f in merged_just:
            justified[f] = merged_just[f]
        else:
            unrendered.append(f)

    return {
        'digest': digest,
        'version': f'card:{digest[:12]}',
        'questions': questions,
        'coverage': {'rendered': rendered, 'justified': justified, 'unrendered': unrendered},
        'linkability': {
            'verifierSet': d['verifierSet'],
            'contextAuthority': d['contextAuthority'],
            'epoch': d['epoch'],
            'epochPolicy': d['epochPolicy'],
            'retentionPolicy': d['retentionPolicy'],
        },
    }


def check_legibility(descriptor, card, justifications=None):
    failures = []
    card = card or {}
    if card.get('digest') != descriptor_digest(descriptor):
        failures.append('digest-mismatch')

    merged_just = {
        **DEFAULT_JUSTIFICATIONS,
        **((card.get('coverage') or {}).get('justified') or {}),
        **(justifications or {}),
    }
    questions = card.get('questions') or {}
    present = [f for f in DESCRIPTOR_FIELDS + DESCRIPTOR_OPTIONAL if f in descriptor]
    for f in present:
        qs = FIELD_QUESTION_MAP.get(f)
        rendered_here = bool(qs) and any(
            str(descriptor[f]) in str(questions.get(q, '')) for q in qs
        )
        if not rendered_here and f not in merged_just:
            failures.append(f'unrendered-field:{f}')

    for q in ['q2', 'q3']:
        if NARROW_LANGUAGE not in str(questions.get(q, '')):
            failures.append(f'missing-narrow-language:{q}')
    for q in Q_IDS:
        if BROAD_LANGUAGE.search(str(questions.get(q, ''))):
            failures.append(f'broad-personhood-language:{q}')

    return {'ok': not failures, 'failures': failures}


_DURATION = re.compile(r'(\d+(?:\.\d+)?)\s*(h|d|w|y)\b')
_DAYS = {'h': 1 / 24, 'd': 1, 'w': 7, 'y': 365}


def _parse_window_days(s):
    m = _DURATION.search(str(s if s is not None else ''))
    return float(m.group(1)) * _DAYS[m.group(2)] if m else None


def _window_widened(old_link, new_link):
    old_link = old_link or {}
    new_link = new_link or {}
    widened = False
    for f in ['epochPolicy', 'retentionPolicy']:
        if old_link.get(f) == new_link.get(f):
            continue
        a = _parse_window_days(old_link.get(f))
        b = _parse_window_days(new_link.get(f))
        if a is None or b is None:
            widened = True
        elif b > a:
            widened = True
    return widened


def diff_cards(old_card, new_card):
    old_card = old_card or {}
    new_card = new_card or {}
    deltas = []
    for q in Q_IDS:
        before = (old_card.get('questions') or {}).get(q)
        after = (new_card.get('questions') or {}).get(q)
        if before != after:
            deltas.append({'question': q, 'before': before, 'after': after})
    changed = bool(deltas) or old_card.get('digest') != new_card.get('digest')
    q2_delta = any(d['question'] == 'q2' for d in deltas)
    q3_delta = any(d['question'] == 'q3' for d in deltas)
    expansion = q2_delta or (
        q3_delta and _window_widened(old_card.get('linkability'), new_card.get('linkability'))
    )
    return {'changed': changed, 'deltas': deltas, 'expansion': expansion}


# =============================================================================
# Lint — the prohibited-pattern list (lint.mjs port, Python re)
# =============================================================================

LINT_LIST_VERSION = 'v1'


def _p(pat_id, pattern, source, reason, unless=None):
    return {
        'id': pat_id,
        're': re.compile(pattern, re.IGNORECASE),
        'source': source,
        'reason': reason,
        'unless': re.compile(unless, re.IGNORECASE) if unless else None,
    }


PROHIBITED_PATTERNS = [
    _p('one-human-one-record', r'one[\s-]human[\s-]one[\s-](record|vote|account)',
       '§24 prohibited claims', 'overclaim-verifier-output'),
    _p('global-uniqueness', r'global(ly)?[\s-]unique(ness)?',
       '§9 PR-LIV, PR-PER, PR-UNQ "must not infer"', 'overclaim-verifier-output'),
    _p('civil-identity', r'civil identity',
       '§9 PR-LIV, PR-PER "must not infer"; §24', 'overclaim-verifier-output'),
    _p('unique-human', r'unique (natural )?(human|person)',
       '§9 PR-UNQ "must not infer"', 'overclaim-verifier-output'),
    _p('one-natural-person', r'one natural person',
       '§9 PR-UNQ "must not infer"', 'overclaim-verifier-output'),
    _p('biometric-correctness', r'biometric[^.]{0,60}(correct|accurate|verified)',
       '§26.1 bullet 2; §10.2 negative meaning', 'overclaim-verifier-output'),
    _p('liveness-proof-overclaim', r'proof (of|that)[^.]*(was|is) (live|alive)',
       '§10.2 (PR-LIV proves attestation possession, not liveness fact)',
       'overclaim-verifier-output'),
    _p('cross-context-identity', r'same (person|user|human) across (contexts|services|verifiers)',
       '§9 PR-UNQ "must not infer"; §2.3', 'overclaim-verifier-output'),
    _p('key-control-authority', r'key[\s-](control|possession)[^.]{0,80}(authori[sz]|consent|intent|presen)',
       '§9 PR-HLD "must not infer"; §14.2; §26.1 bullet 9', 'key-control-as-authority'),
    _p('undocumented-collusion-claim',
       r'(collusion[\s-]resistan(t|ce)|resistant to [^.]{0,80}collusion)',
       '§26.1 bullet 5; §24 collusion-resistance claims; §2.4 "against whom"',
       'undocumented-collusion-claim',
       r'claimed against [^.]+ for [^.]+ alongside [^.]+ tested by'),
    _p('verifier-learns-nothing', r'verifier[^.]{0,40}learns nothing',
       '§26.1 bullet 11; §2.6 composition; §2.4 "alongside what"',
       'disclosure-ignores-observables'),
    _p('no-information-revealed',
       r'no (information|data) is (revealed|disclosed|leaked|learned)',
       '§26.1 bullet 11; §2.6 (occurrence and timing are always observable)',
       'disclosure-ignores-observables'),
]


def lint_verifier_output(text):
    if not isinstance(text, str):
        return {'ok': False, 'hits': [{
            'id': 'not-a-text', 'source': 'lint port',
            'reason': 'overclaim-verifier-output', 'match': str(text)}]}
    hits = []
    for p in PROHIBITED_PATTERNS:
        m = p['re'].search(text)
        if m and not (p['unless'] and p['unless'].search(text)):
            hits.append({'id': p['id'], 'source': p['source'],
                         'reason': p['reason'], 'match': m.group(0)})
    return {'ok': not hits, 'hits': hits}


# =============================================================================
# Vector schema (schema.mjs port)
# =============================================================================

SCHEMA_VERSION = 'x1-fixtures/v0'
FIXTURE_ID_RE = re.compile(r'^PR-[A-Z]{3}/(accept|reject|lint)/[a-z0-9]+(?:-[a-z0-9]+)*/\d{3}$')
_OUTCOMES = {'accept', 'reject', 'lint-fail'}
_CLAIM_PARAM_KEYS = ['againstWhom', 'forHowLong', 'alongsideWhat']
_EXPECT_KEYS = {'outcome', 'reason', 'claimCeiling'}


def _non_empty_str(x):
    return isinstance(x, str) and len(x) > 0


def _plain_obj(x):
    return isinstance(x, dict)


def validate_vector(v):
    errors = []
    if not _plain_obj(v):
        return {'ok': False, 'errors': ['vector-not-an-object']}

    if not _non_empty_str(v.get('fixture')) or not FIXTURE_ID_RE.match(v.get('fixture') or ''):
        errors.append(f'fixture-id-malformed:{v.get("fixture")}')
    cls = v['fixture'].split('/')[1] if _non_empty_str(v.get('fixture')) else None

    spec = v.get('spec')
    if not _plain_obj(spec):
        errors.append('spec-missing')
    else:
        if not _non_empty_str(spec.get('decisionDoc')):
            errors.append('spec-decisionDoc-missing')
        sections = spec.get('sections')
        if not isinstance(sections, list) or not sections or \
                not all(_non_empty_str(s) for s in sections):
            errors.append('spec-sections-missing')

    cp = v.get('claimParams')
    if not _plain_obj(cp):
        errors.append('claimParams-missing (§2.4)')
    else:
        for k in _CLAIM_PARAM_KEYS:
            if not _non_empty_str(cp.get(k)):
                errors.append(f'claimParams-{k}-missing (§2.4)')
        for k in cp:
            if k not in _CLAIM_PARAM_KEYS:
                errors.append(f'claimParams-unknown-key:{k}')

    if not _plain_obj(v.get('inputs')) or not v['inputs']:
        errors.append('inputs-missing')

    expect = v.get('expect')
    if not _plain_obj(expect):
        errors.append('expect-missing')
    else:
        if expect.get('outcome') not in _OUTCOMES:
            errors.append(f'expect-outcome-invalid:{expect.get("outcome")}')
        for k in expect:
            if k not in _EXPECT_KEYS:
                errors.append(f'expect-unknown-key:{k}')
        if cls == 'accept' and expect.get('outcome') != 'accept':
            errors.append('class-outcome-mismatch:accept')
        if cls == 'reject' and expect.get('outcome') != 'reject':
            errors.append('class-outcome-mismatch:reject')
        if cls == 'lint' and expect.get('outcome') not in ('lint-fail', 'accept'):
            errors.append('class-outcome-mismatch:lint')
        if expect.get('outcome') == 'accept':
            if 'reason' in expect:
                errors.append('accept-vector-must-not-carry-reason-code')
        else:
            reason = expect.get('reason')
            if not _non_empty_str(reason):
                errors.append('reject-vector-missing-reason')
            elif not is_known_reason(reason):
                errors.append(f'reason-not-in-register:{reason}')

    return {'ok': not errors, 'errors': errors}


def validate_manifest(manifest, vector_paths):
    errors = []
    if not _plain_obj(manifest):
        return {'ok': False, 'errors': ['manifest-not-an-object']}
    if manifest.get('formatVersion') != SCHEMA_VERSION:
        errors.append(f'manifest-formatVersion:{manifest.get("formatVersion")}')
    if not _non_empty_str(manifest.get('decisionDoc')):
        errors.append('manifest-decisionDoc-missing')
    if not _non_empty_str(manifest.get('reasonRegister')):
        errors.append('manifest-reasonRegister-missing')
    listed = sorted(p for fam in (manifest.get('families') or {}).values() for p in fam)
    found = sorted(vector_paths)
    if manifest.get('vectorCount') != len(listed):
        errors.append('manifest-vectorCount-mismatch')
    if listed != found:
        errors.append('manifest-paths-diverge-from-vectors')
    return {'ok': not errors, 'errors': errors}


def family_of(v):
    return v['fixture'].split('/')[0]


def class_of(v):
    return v['fixture'].split('/')[1]


# =============================================================================
# Runners — one per family, mirroring the decisions the vectors freeze.
# Each returns (passed: bool, detail: str).
# =============================================================================


def _fail(detail):
    return (False, detail)


def _pass():
    return (True, 'ok')


def _nullifier_provenance(inputs):
    bound_ctx = descriptor_digest(inputs['contextDescriptor'])
    presented_ctx = descriptor_digest(inputs['presentedUnderDescriptor'])
    secret = enrol(inputs['subject']['humanId'])['secret']
    if nullifier(secret, presented_ctx) != inputs['nullifier']:
        return {'error': 'presented-nullifier-does-not-rederive-under-declared-descriptor'}
    if nullifier(secret, bound_ctx) == inputs['nullifier']:
        return {'observed': None}
    fields = set(inputs['contextDescriptor']) | set(inputs['presentedUnderDescriptor'])
    diff = [f for f in fields
            if inputs['contextDescriptor'].get(f) != inputs['presentedUnderDescriptor'].get(f)]
    epoch_only = len(diff) > 0 and all(f in ('epoch', 'epochPolicy') for f in diff)
    return {'observed': 'epoch-snapshot-inconsistent' if epoch_only else 'nullifier-domain-reuse',
            'diff': diff}


_SNAPSHOT_REQ_RE = re.compile(r'^root-age<=(\d+(?:\.\d+)?)(h|d)$')


def _snapshot_stale(requirement, snapshot_timestamp, now):
    m = _SNAPSHOT_REQ_RE.match(str(requirement if requirement is not None else ''))
    if not m:
        return {'error': f'unparseable-snapshot-requirement:{requirement}'}
    if not _is_number(now) or not _is_number(snapshot_timestamp):
        return {'error': 'snapshot-times-must-be-explicit-numbers'}
    limit_seconds = float(m.group(1)) * (3600 if m.group(2) == 'h' else 86400)
    return {'stale': now - snapshot_timestamp > limit_seconds}


def _transcript_binding_error(inputs):
    ctx = descriptor_digest(inputs['contextDescriptor'])
    if inputs['transcript'].get('contextDescriptorDigest') != ctx:
        return 'transcript-not-bound-to-descriptor'
    if transcript_digest(inputs['transcript']) != inputs['transcriptDigest']:
        return 'transcript-digest-does-not-rederive'
    return None


def run_rt01(v):
    inputs, expect = v['inputs'], v['expect']

    if inputs.get('descriptorCheck'):
        d = validate_descriptor(inputs['contextDescriptor'])
        if not d['ok'] and d['unknown']:
            if expect['outcome'] != 'reject':
                return _fail('descriptor rejected: unknown:' + ','.join(d['unknown']))
            if expect['reason'] == 'unjustified-stable-correlator':
                return _pass()
            return _fail(f'reason mismatch: expected {expect["reason"]}, '
                         f'got unjustified-stable-correlator')
        if not d['ok']:
            return _fail('descriptor-invalid: missing:' + ','.join(d['missing']))
        ctx = descriptor_digest(inputs['contextDescriptor'])
        n = nullifier(enrol(inputs['subject']['humanId'])['secret'], ctx)
        if n != inputs['nullifier']:
            return _fail('nullifier-does-not-rederive')
        res = ContextRegistry(ctx).present(n)
        if expect['outcome'] == 'accept' and res['admitted'] is True:
            return _pass()
        return _fail('descriptor-clean vector must accept')

    if 'presentedUnderDescriptor' in inputs:
        bind = _transcript_binding_error(inputs)
        if bind:
            return _fail(bind)
        p = _nullifier_provenance(inputs)
        if 'error' in p:
            return _fail(p['error'])
        if p['observed'] is None:
            return _fail('expected a domain violation, nullifier rederives under bound context')
        if expect['outcome'] != 'reject':
            return _fail(f'expected accept, observed {p["observed"]}')
        if p['observed'] == expect['reason']:
            return _pass()
        return _fail(f'reason mismatch: expected {expect["reason"]}, got {p["observed"]}')

    if inputs.get('crossContext'):
        ctx_a = descriptor_digest(inputs['descriptorA'])
        ctx_b = descriptor_digest(inputs['descriptorB'])
        secret = enrol(inputs['subject']['humanId'])['secret']
        n_a = nullifier(secret, ctx_a)
        n_b = nullifier(secret, ctx_b)
        if n_a != inputs['nullifierA']:
            return _fail('nullifierA-does-not-rederive')
        if n_b != inputs['nullifierB']:
            return _fail('nullifierB-does-not-rederive')
        if n_a == n_b:
            return _fail('nullifier-domains-not-separated')
        reg_a = ContextRegistry(ctx_a)
        reg_a.present(n_a)
        reg_b = ContextRegistry(ctx_b)
        res = reg_b.present(n_b)
        if expect['outcome'] != 'accept':
            return _fail('cross-context-vector-must-expect-accept')
        if res['admitted'] is True:
            return _pass()
        return _fail(f'expected accept, got {res["reason"]}')

    ctx = descriptor_digest(inputs['contextDescriptor'])
    if inputs['transcript'].get('contextDescriptorDigest') != ctx:
        return _fail('transcript-not-bound-to-descriptor')
    if transcript_digest(inputs['transcript']) != inputs['transcriptDigest']:
        return _fail('transcript-digest-does-not-rederive')
    subject_n = nullifier(enrol(inputs['subject']['humanId'])['secret'], ctx)
    if subject_n != inputs['nullifier']:
        return _fail('nullifier-does-not-rederive')

    reg = ContextRegistry(ctx)
    for h in inputs['priorPresentations']:
        reg.present(nullifier(enrol(h)['secret'], ctx))
    res = reg.present(subject_n)

    if expect['outcome'] == 'accept':
        if res['admitted'] is True:
            return _pass()
        return _fail(f'expected accept, got {res["reason"]}')
    if res['admitted'] is not False:
        return _fail('expected reject, construction accepted')
    if res['reason'] != expect['reason']:
        return _fail(f'reason mismatch: expected {expect["reason"]}, got {res["reason"]}')
    return _pass()


def run_rt07(v):
    inputs, expect = v['inputs'], v['expect']
    community = descriptor_digest(inputs['communityDescriptor'])
    nodes = [join_community(h, community) for h in inputs['rosterHumanIds']]
    members = roster(nodes)
    g = TrustGraph()
    for e in inputs.get('existingEdges') or []:
        g.add_edge(e)
    verdict = swordsman_prove(members, g, inputs['candidate'])

    if expect['outcome'] == 'accept':
        if verdict['signed'] is not True:
            return _fail(f'expected sign, got {verdict.get("reason")}')
        if verdict['edge']['vrc'] != inputs['candidate']['claimedVrc']:
            return _fail('signed-vrc-does-not-match-candidate')
        return _pass()
    if verdict['signed'] is not False:
        return _fail('expected reject, Swordsman signed')
    if verdict['reason'] != expect['reason']:
        return _fail(f'reason mismatch: expected {expect["reason"]}, got {verdict["reason"]}')
    return _pass()


def run_attestation(v):
    inputs, expect = v['inputs'], v['expect']
    a = inputs.get('attestation')
    if not a or not _is_number(inputs.get('now')):
        return _fail('attestation-and-explicit-now-required')
    observed = None
    if a.get('status') != 'active':
        observed = 'expired-or-revoked-attestation'
    elif not _is_number(a.get('validFrom')) or not _is_number(a.get('validUntil')) or \
            inputs['now'] < a['validFrom'] or inputs['now'] > a['validUntil']:
        observed = 'expired-or-revoked-attestation'
    elif not isinstance(inputs.get('acceptedIssuers'), list) or \
            a.get('issuer') not in inputs['acceptedIssuers']:
        observed = 'expired-or-revoked-attestation'
    if observed is None:
        if expect['outcome'] == 'accept':
            return _pass()
        return _fail('expected reject, attestation checks passed')
    if expect['outcome'] != 'reject':
        return _fail(f'expected accept, observed {observed}')
    if observed == expect['reason']:
        return _pass()
    return _fail(f'reason mismatch: expected {expect["reason"]}, got {observed}')


def run_show(v):
    inputs, expect = v['inputs'], v['expect']
    if not _is_number(inputs.get('now')):
        return _fail('explicit-now-required')
    res = verify_show(inputs['show'], REGISTRY, inputs['now'])
    if expect['outcome'] == 'accept':
        if res['ok']:
            return _pass()
        return _fail(f'expected accept, got {res["reason"]}')
    if res['ok']:
        return _fail('expected reject, show verified')
    if res['reason'] == expect['reason']:
        return _pass()
    return _fail(f'reason mismatch: expected {expect["reason"]}, got {res["reason"]}')


def run_context_expansion(v):
    inputs, expect = v['inputs'], v['expect']
    before = render_card(inputs['descriptorBefore'])
    after = render_card(inputs['descriptorAfter'])
    if not check_legibility(inputs['descriptorBefore'], before)['ok']:
        return _fail('before-card-illegible')
    if not check_legibility(inputs['descriptorAfter'], after)['ok']:
        return _fail('after-card-illegible')
    d = diff_cards(before, after)
    if not d['expansion']:
        return _fail('vector-must-describe-an-expansion')
    m = inputs.get('migration')
    migrated = (
        isinstance(m, dict) and
        m.get('fromCardVersion') == before['version'] and
        m.get('toCardVersion') == after['version'] and
        _non_empty_str(m.get('note'))
    )
    if not migrated:
        if expect['outcome'] != 'reject':
            return _fail('expansion without migration must reject')
        if expect['reason'] == 'context-expansion-without-version':
            return _pass()
        return _fail(f'reason mismatch: expected {expect["reason"]}, '
                     f'got context-expansion-without-version')
    if expect['outcome'] == 'accept':
        return _pass()
    return _fail('expected reject, migration record is valid')


def run_fallback(v):
    inputs, expect = v['inputs'], v['expect']
    bind = _transcript_binding_error(inputs)
    if bind:
        return _fail(bind)
    proving = inputs.get('proving')
    if not proving or proving.get('mediated') is not True:
        return _fail('vector-must-declare-mediated-proving-occurred')
    proving_mode = inputs['transcript'].get('provingMode')
    declared = _non_empty_str(proving_mode)
    if not declared:
        if expect['outcome'] != 'reject':
            return _fail('silent fallback must reject')
        if expect['reason'] == 'silent-fallback':
            return _pass()
        return _fail(f'reason mismatch: expected {expect["reason"]}, got silent-fallback')
    if proving_mode != proving.get('mode'):
        return _fail('transcript-provingMode-does-not-match-declared-mode')
    if expect['outcome'] == 'accept':
        return _pass()
    return _fail('expected reject, provingMode is declared')


def run_epoch(v):
    inputs, expect = v['inputs'], v['expect']
    bind = _transcript_binding_error(inputs)
    if bind:
        return _fail(bind)
    observed = None
    if 'presentedUnderDescriptor' in inputs:
        p = _nullifier_provenance(inputs)
        if 'error' in p:
            return _fail(p['error'])
        observed = p['observed']
    if observed is None and 'registrySnapshot' in inputs:
        s = _snapshot_stale(
            inputs['transcript'].get('snapshotRequirements'),
            inputs['registrySnapshot'].get('timestamp'),
            inputs.get('now'),
        )
        if 'error' in s:
            return _fail(s['error'])
        if s['stale']:
            observed = 'stale-registry-snapshot'
    if observed is None:
        ctx = descriptor_digest(inputs['contextDescriptor'])
        n = nullifier(enrol(inputs['subject']['humanId'])['secret'], ctx)
        if n != inputs['nullifier']:
            return _fail('nullifier-does-not-rederive')
        if ContextRegistry(ctx).present(n)['admitted'] is not True:
            return _fail('fresh-registry-refused')
        if expect['outcome'] == 'accept':
            return _pass()
        return _fail(f'expected {expect.get("reason")}, construction found no violation')
    if expect['outcome'] != 'reject':
        return _fail(f'expected accept, observed {observed}')
    if observed == expect['reason']:
        return _pass()
    return _fail(f'reason mismatch: expected {expect["reason"]}, got {observed}')


def run_lint(v):
    res = lint_verifier_output(v['inputs']['verifierOutput'])
    if v['expect']['outcome'] == 'lint-fail':
        if not res['ok'] and any(h['reason'] == v['expect']['reason'] for h in res['hits']):
            return _pass()
        if res['ok']:
            return _fail('prohibited text passed the lint')
        got = ','.join(h['reason'] for h in res['hits'])
        return _fail(f'lint tripped, but not for {v["expect"]["reason"]} (got {got})')
    if res['ok']:
        return _pass()
    return _fail('narrow language tripped: ' + ','.join(h['id'] for h in res['hits']))


def run_vector(v):
    schema = validate_vector(v)
    if not schema['ok']:
        return _fail('schema: ' + '; '.join(schema['errors']))
    if class_of(v) == 'lint':
        return run_lint(v)
    fam = family_of(v)
    runner = {
        'PR-UNQ': run_rt01,
        'PR-TGF': run_rt07,
        'PR-LIV': run_attestation,
        'PR-SHW': run_show,
        'PR-CTX': run_context_expansion,
        'PR-FLB': run_fallback,
        'PR-EPO': run_epoch,
    }.get(fam)
    if runner is None:
        return _fail(f'no-runner-for-family:{fam}')
    return runner(v)


# =============================================================================
# Suite loading + harness
# =============================================================================

HERE = Path(__file__).resolve().parent
DEFAULT_ROOT = HERE.parent / 'fixtures' / 'vectors'


def load_suite(root=DEFAULT_ROOT):
    root = Path(root)
    manifest = json.loads((root / 'manifest.json').read_text(encoding='utf-8'))
    paths = [p for fam in (manifest.get('families') or {}).values() for p in fam]
    vectors = [
        {'rel': rel, 'vector': json.loads((root / rel).read_text(encoding='utf-8'))}
        for rel in paths
    ]
    return manifest, vectors


def consume_all(root=DEFAULT_ROOT):
    manifest, vectors = load_suite(root)
    m = validate_manifest(manifest, [x['rel'] for x in vectors])
    report = {
        'manifestOk': m['ok'],
        'manifestErrors': m['errors'],
        'total': len(vectors),
        'passed': 0,
        'failed': 0,
        'perFamily': {},
        'failures': [],
    }
    for x in vectors:
        v = x['vector']
        fam = family_of(v)
        report['perFamily'].setdefault(fam, {'pass': 0, 'fail': 0})
        ok, detail = run_vector(v)
        if ok:
            report['passed'] += 1
            report['perFamily'][fam]['pass'] += 1
        else:
            report['failed'] += 1
            report['perFamily'][fam]['fail'] += 1
            report['failures'].append({'fixture': v.get('fixture'), 'detail': detail})
    if not m['ok']:
        report['failures'].append({'fixture': 'manifest.json', 'detail': '; '.join(m['errors'])})
    return report


if __name__ == '__main__':
    import sys
    report = consume_all()
    print('\nconsumer-py — the second-language consumer re-running the frozen suite\n')
    for fam in sorted(report['perFamily']):
        c = report['perFamily'][fam]
        print(f'  {fam}  {c["pass"]}/{c["pass"] + c["fail"]} pass')
    for f in report['failures']:
        print(f'  FAIL {f["fixture"]}: {f["detail"]}')
    print(f'\nvectors: {report["passed"]}/{report["total"]} pass')
    sys.exit(0 if report['failed'] == 0 and report['manifestOk'] else 1)
