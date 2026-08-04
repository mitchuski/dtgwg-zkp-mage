# test.py — properties of the second-language consumer (X1 milestone M5).
#
# P1  all vectors consumed with matching outcome + reason (per-family counts)
# P2  every reject/lint-fail reason is known to the register port
# P3  digest re-derivation: every embedded descriptor/transcript/card digest
#     equals the Python canonical digest — the cross-language canonical-
#     encoding proof, THE critical property
# P4  a tampered vector (one byte of one input flipped in memory) fails
# P5  lint: all prohibited samples caught with the frozen reason; narrow-
#     language samples pass — Python regex ports
# P6  determinism: two full consumption runs produce identical summaries
#
# Run: python test.py   (cwd = this directory). Exit 1 on any failure.

import copy
import json
import sys

import consume
import reasons

try:  # Windows consoles may default to a legacy codepage
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

RESULTS = []


def check(name, ok, detail=''):
    ok = bool(ok)
    RESULTS.append(ok)
    mark = 'ok  ' if ok else 'FAIL'
    line = f'  {mark}  {name}'
    if detail:
        line += f' {detail}'
    print(line)


manifest, vectors = consume.load_suite()
vs = [x['vector'] for x in vectors]

# --- P1: full consumption, outcome + reason match ----------------------------
report = consume.consume_all()
fam_counts = ', '.join(
    f'{fam} {c["pass"]}/{c["pass"] + c["fail"]}'
    for fam, c in sorted(report['perFamily'].items())
)
p1_ok = report['failed'] == 0 and report['manifestOk'] and report['total'] == len(vs)
check('P1', p1_ok,
      f'all {report["passed"]}/{report["total"]} vectors consumed, '
      f'outcome+reason match ({fam_counts})')
for f in report['failures']:
    print(f'        FAIL {f["fixture"]}: {f["detail"]}')

# --- P2: every non-accept reason is known to the register port ---------------
unknown = []
n_reasons = 0
for v in vs:
    reason = v['expect'].get('reason')
    if v['expect']['outcome'] != 'accept':
        n_reasons += 1
        if not reasons.is_known_reason(reason):
            unknown.append((v['fixture'], reason))
check('P2', not unknown and n_reasons > 0,
      f'{n_reasons} reject/lint-fail reasons all known to the register port '
      f'({len(reasons.EXACT_CODES)} exact + {len(reasons.FAMILY_PREFIXES)} families, '
      f'{reasons.REGISTER_VERSION})'
      + (f'; UNKNOWN: {unknown}' if unknown else ''))

# --- P3: digest re-derivation (cross-language canonical-encoding proof) ------
# Every digest a vector EMBEDS is re-derived here from the carried canonical
# object and must match byte-for-byte. Pairs collected:
#   contextDescriptor -> transcript.contextDescriptorDigest
#   transcript        -> inputs.transcriptDigest
#   show.transcript   -> show.transcriptDigest (+ member commitments where the
#                        vector intends them to bind, i.e. the accept show)
#   PR-CTX descriptors -> migration from/toCardVersion (digest-prefix versions)
pairs = []  # (fixture, label, embedded, derived)


def add(fx, label, embedded, derived):
    pairs.append((fx, label, embedded, derived))


for v in vs:
    fx = v['fixture']
    inp = v['inputs']
    if 'contextDescriptor' in inp and 'transcript' in inp:
        add(fx, 'descriptor-digest', inp['transcript']['contextDescriptorDigest'],
            consume.descriptor_digest(inp['contextDescriptor']))
    if 'transcript' in inp and 'transcriptDigest' in inp:
        add(fx, 'transcript-digest', inp['transcriptDigest'],
            consume.transcript_digest(inp['transcript']))
    if 'show' in inp:
        show = inp['show']
        add(fx, 'show-transcript-digest', show['transcriptDigest'],
            consume.transcript_digest(show['transcript']))
        if v['expect']['outcome'] == 'accept':
            for m in show['members']:
                add(fx, f'member-commitment:{m["predicate"]}', m['commitment'],
                    consume.member_commitment(m['predicate'], show['transcriptDigest']))
    if 'descriptorBefore' in inp and isinstance(inp.get('migration'), dict):
        add(fx, 'from-card-version', inp['migration']['fromCardVersion'],
            'card:' + consume.descriptor_digest(inp['descriptorBefore'])[:12])
        add(fx, 'to-card-version', inp['migration']['toCardVersion'],
            'card:' + consume.descriptor_digest(inp['descriptorAfter'])[:12])

mismatches = [(fx, label, e, d) for fx, label, e, d in pairs if e != d]
check('P3', not mismatches and len(pairs) > 0,
      f'{len(pairs)} embedded digests re-derived byte-identically from Python '
      f'canonical JSON (descriptor, transcript, show, member, card-version)')
for fx, label, e, d in mismatches:
    print(f'        MISMATCH {fx} [{label}]: embedded {e} != derived {d}')

# --- P4: tamper detection ----------------------------------------------------
# Flip one byte of one input in memory; the consumer must refuse the vector.
base = next(v for v in vs if v['fixture'] == 'PR-UNQ/accept/first-enrolment/001')

t1 = copy.deepcopy(base)  # transcript field byte-flip -> digest must not rederive
t1['inputs']['transcript']['challenge'] = 'monce:fixture-0001'  # n -> m
ok1, d1 = consume.run_vector(t1)

t2 = copy.deepcopy(base)  # nullifier byte-flip -> construction must not rederive
n = t2['inputs']['nullifier']
t2['inputs']['nullifier'] = ('0' if n[0] != '0' else '1') + n[1:]
ok2, d2 = consume.run_vector(t2)

tgf = next(v for v in vs if v['fixture'] == 'PR-TGF/accept/mutual-consent-edge/001')
t3 = copy.deepcopy(tgf)  # shared-compression byte-flip -> VRC forgery caught
s = t3['inputs']['candidate']['shared']
t3['inputs']['candidate']['shared'] = ('0' if s[0] != '0' else '1') + s[1:]
ok3, d3 = consume.run_vector(t3)

check('P4', (not ok1) and (not ok2) and (not ok3),
      f'tampered vectors refused (transcript: "{d1}"; nullifier: "{d2}"; '
      f'vrc-shared: "{d3}")')

# --- P5: lint vectors through the Python regex ports -------------------------
lint_vs = [v for v in vs if consume.class_of(v) == 'lint']
must_fail = [v for v in lint_vs if v['expect']['outcome'] == 'lint-fail']
must_pass = [v for v in lint_vs if v['expect']['outcome'] == 'accept']
p5_errors = []
for v in must_fail:
    res = consume.lint_verifier_output(v['inputs']['verifierOutput'])
    if res['ok']:
        p5_errors.append(f'{v["fixture"]}: prohibited text passed')
    elif not any(h['reason'] == v['expect']['reason'] for h in res['hits']):
        got = ','.join(h['reason'] for h in res['hits'])
        p5_errors.append(f'{v["fixture"]}: tripped for {got}, not {v["expect"]["reason"]}')
for v in must_pass:
    res = consume.lint_verifier_output(v['inputs']['verifierOutput'])
    if not res['ok']:
        ids = ','.join(h['id'] for h in res['hits'])
        p5_errors.append(f'{v["fixture"]}: narrow language tripped {ids}')
check('P5', not p5_errors and must_fail and must_pass,
      f'{len(must_fail)} prohibited samples caught with frozen reasons, '
      f'{len(must_pass)} narrow-language samples pass (Python re ports)')
for e in p5_errors:
    print(f'        {e}')

# --- P6: determinism ---------------------------------------------------------
r1 = json.dumps(consume.consume_all(), sort_keys=True)
r2 = json.dumps(consume.consume_all(), sort_keys=True)
check('P6', r1 == r2, 'two full consumption runs produce identical summaries')

# --- verdict -----------------------------------------------------------------
passed = sum(RESULTS)
print(f'\nconsumer-py: {passed}/{len(RESULTS)} pass')
sys.exit(0 if passed == len(RESULTS) else 1)
