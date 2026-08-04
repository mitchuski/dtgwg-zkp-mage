// Property tests for the conformance-fixture suite (X1: M1 register, M2
// schema, M3 extraction + consumer). Run: node test.mjs — exits nonzero on
// any failure.
//
// F1 determinism is checked the strong way: two SEPARATE node processes emit
// the suite into two directories and every byte is compared — a Date.now(),
// an unseeded random, or an unsorted directory listing anywhere in the
// pipeline fails here, not in a code review.

import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { REASONS, REASON_REGISTER_VERSION, REASON_FAMILIES, CONVERGENCES, isKnownReason } from './reasons.mjs';
import { validateVector } from './schema.mjs';
import { lintVerifierOutput } from './lint.mjs';
import { loadSuite, consumeAll, runVector, coverage26_1 } from './consume.mjs';
import { REGISTRY, lookupBundle } from '../show-composition/bundles.mjs';
import { makeShow, verifyShow, completionEvidence } from '../show-composition/show.mjs';
// F10/F11 — the six v2 emitting modules (READ-ONLY dependencies; imported to
// trigger each rejection live and compare the emitted bytes to the register).
import { renderCard, checkLegibility } from '../context-card/card.mjs';
import { makeQuietDeployment, makeNaiveDeployment, checkQuietTier } from '../quiet-presentation/quiet.mjs';
import { validateBudget } from '../quiet-presentation/budget.mjs';
import { validateLogSchema } from '../quiet-presentation/logregister.mjs';
import {
  createIssuer, issuerEnrol, checkDescent, recover, createRecoveryDomain,
  makeRecoveryDescriptor, validateClocks,
} from '../rotation/rotation.mjs';
import { CLOCKS as EROSION_CLOCKS, validateSort } from '../erosion-record/clocks.mjs';
import { validateRecord } from '../erosion-record/record.mjs';
import { makeProvingJob, makeMediator, checkForget, verifyProofRecord } from '../mediator/mediator.mjs';
import { validateTransition, __unsafeSilentTransition, attemptProof } from '../mediator/downgrade.mjs';
import { makeIssuerRegistry } from '../multi-issuer/registry.mjs';
import { makeAggregatedShow, makeMember, verifyAggregated } from '../multi-issuer/aggregate.mjs';
import {
  createPersonhoodRegistry, anchorPerson, commitGuardianSet, attest, createCeremony,
  recoverWithGuardians, createRecoveryIssuer, validateGuardianClocks,
  completionEvidence as guardianCompletionEvidence,
} from '../guardian-recovery/guardians.mjs';
import { descriptorDigest, transcriptDigest } from '../canonical/canonical.mjs';

const here = dirname(fileURLToPath(import.meta.url));

let passCount = 0, failCount = 0;
const ok = (name, cond) => {
  if (cond) { passCount++; console.log(`  ok  ${name}`); }
  else { failCount++; console.log(`FAIL  ${name}`); }
};

console.log('\nconformance fixtures — suite properties\n');

// Fresh extraction into the canonical vectors/ dir (what ships) — a separate
// process, same as any consumer would run.
execFileSync(process.execPath, [join(here, 'extract.mjs')], { cwd: here });

// ---------------------------------------------------------------------------
// F1 — extraction is deterministic: two runs, two processes, identical bytes.
// ---------------------------------------------------------------------------
const walk = (dir, base = dir) => {
  const out = [];
  for (const name of readdirSync(dir).sort()) {
    const abs = join(dir, name);
    if (statSync(abs).isDirectory()) out.push(...walk(abs, base));
    else out.push(abs.slice(base.length + 1).replaceAll('\\', '/'));
  }
  return out;
};
{
  const a = join(here, '.tmp-f1-a');
  const b = join(here, '.tmp-f1-b');
  execFileSync(process.execPath, [join(here, 'extract.mjs'), '--out', a], { cwd: here });
  execFileSync(process.execPath, [join(here, 'extract.mjs'), '--out', b], { cwd: here });
  const la = walk(a), lb = walk(b);
  let identical = JSON.stringify(la) === JSON.stringify(lb);
  if (identical) {
    for (const rel of la) {
      if (!readFileSync(join(a, rel)).equals(readFileSync(join(b, rel)))) {
        identical = false;
        break;
      }
    }
  }
  rmSync(a, { recursive: true, force: true });
  rmSync(b, { recursive: true, force: true });
  ok(`F1 extraction is deterministic — two processes, ${la.length} files, identical bytes`, identical);
}

const root = join(here, 'vectors');
const { manifest, vectors: wrapped } = loadSuite(root);
const vectors = wrapped.map((w) => w.vector);

// ---------------------------------------------------------------------------
// F2 — every reject / lint-fail vector names a reason from the register.
// ---------------------------------------------------------------------------
{
  const nonAccept = vectors.filter((v) => v.expect.outcome !== 'accept');
  ok(`F2 every reject reason is in the register (${nonAccept.length} vectors, register=${Object.keys(REASONS).length} codes)`,
    nonAccept.length > 0 && nonAccept.every((v) => isKnownReason(v.expect.reason)));
}

// ---------------------------------------------------------------------------
// F3 — the consumer passes 100% of the emitted vectors (the round trip).
// ---------------------------------------------------------------------------
{
  const report = consumeAll(root);
  for (const f of report.failures) console.log(`      consumer FAIL ${f.fixture}: ${f.detail}`);
  ok(`F3 consumer re-runs the whole suite — ${report.passed}/${report.total} vectors, manifest ok`,
    report.manifestOk && report.failed === 0 && report.total === vectors.length);
}

// ---------------------------------------------------------------------------
// F4 — a tampered vector fails consumption: flip one byte of a governed input
// (the descriptor's epoch) and the transcript binding must catch it.
// ---------------------------------------------------------------------------
{
  const src = vectors.find((v) => v.fixture === 'PR-UNQ/accept/first-enrolment/001');
  const tampered = structuredClone(src);
  tampered.inputs.contextDescriptor.epoch = 'epoch:2026-08'; // one byte flipped: 7 -> 8
  const r = runVector(tampered);
  ok('F4 tampered vector fails consumption (descriptor byte flip breaks transcript binding)',
    src !== undefined && r.pass === false && runVector(src).pass === true);
}

// ---------------------------------------------------------------------------
// F5 — an unknown reason code fails schema validation.
// ---------------------------------------------------------------------------
{
  const src = vectors.find((v) => v.expect.outcome === 'reject');
  const bad = structuredClone(src);
  bad.expect.reason = 'not-a-registered-reason';
  const r = validateVector(bad);
  ok('F5 unknown reason code fails schema validation',
    !r.ok && r.errors.some((e) => e.startsWith('reason-not-in-register')));
}

// ---------------------------------------------------------------------------
// F6 — a vector missing §2.4 claim parameters fails validation: a claim
// without against-whom / for-how-long / alongside-what is not testable.
// ---------------------------------------------------------------------------
{
  const src = vectors[0];
  const noParams = structuredClone(src);
  delete noParams.claimParams;
  const partial = structuredClone(src);
  delete partial.claimParams.alongsideWhat;
  ok('F6 missing §2.4 claimParams fails validation (absent and partial)',
    !validateVector(noParams).ok && !validateVector(partial).ok);
}

// ---------------------------------------------------------------------------
// F7 — the lint catches every prohibited sample and passes narrow language.
// ---------------------------------------------------------------------------
{
  const lintVectors = vectors.filter((v) => v.fixture.split('/')[1] === 'lint');
  const mustFail = lintVectors.filter((v) => v.expect.outcome === 'lint-fail');
  const mustPass = lintVectors.filter((v) => v.expect.outcome === 'accept');
  ok(`F7 lint — ${mustFail.length} prohibited samples caught, ${mustPass.length} narrow-language samples pass (incl. collusion + disclosure classes)`,
    mustFail.length >= 7 && mustPass.length >= 3 &&
    mustFail.every((v) => !lintVerifierOutput(v.inputs.verifierOutput).ok) &&
    mustPass.every((v) => lintVerifierOutput(v.inputs.verifierOutput).ok) &&
    mustFail.every((v) =>
      lintVerifierOutput(v.inputs.verifierOutput).hits.some((h) => h.reason === v.expect.reason)));
}

// ---------------------------------------------------------------------------
// F8 — §26.1 FULL coverage report: all eleven bullets accounted for, and at
// v1 every bullet must be covered or partial; anything remaining is printed
// honestly (the no-silent-caps rule — a gap would be allowed if reported,
// but the v1 target is zero).
// ---------------------------------------------------------------------------
{
  const rows = coverage26_1(vectors);
  const covered = rows.filter((r) => r.status === 'covered');
  const partial = rows.filter((r) => r.status === 'partial');
  const gaps = rows.filter((r) => r.status === 'gap');
  console.log('\n      §26.1 minimum negative tests — coverage:');
  for (const r of rows) {
    const tag = r.status === 'covered' ? 'covered' : r.status === 'partial' ? 'PARTIAL' : 'GAP    ';
    const via = r.via.length ? `  <- ${r.via.join(', ')}` : '';
    console.log(`        ${String(r.bullet).padStart(2)} ${tag}  ${r.text}${via}`);
  }
  console.log(`      ${covered.length} covered + ${partial.length} partial, ${gaps.length} gaps of 11\n`);
  ok(`F8 §26.1 coverage — ${covered.length} covered, ${partial.length} partial, ${gaps.length} gaps, 11 total (v1 target: no gaps)`,
    rows.length === 11 && covered.length + partial.length + gaps.length === 11 &&
    covered.length + partial.length === 11 && gaps.length === 0 &&
    // bullet 10 must exercise BOTH facet codes, each with at least one vector
    vectors.some((v) => v.expect.reason === 'epoch-snapshot-inconsistent') &&
    vectors.some((v) => v.expect.reason === 'stale-registry-snapshot'));
}

// The v0 stratum, shared by F9 (append-only audit) and F10 (v2 delta).
const V0_CODES = [
  'duplicate-human-in-context', 'endpoint-not-personhood-anchored', 'self-edge-forbidden',
  'unilateral-no-mutual-consent', 'r-did-mismatch', 'vrc-commitment-forged', 'duplicate-edge',
  'expired-or-revoked-attestation', 'overclaim-verifier-output', 'replay-cross-transcript',
  'nullifier-domain-reuse', 'undocumented-collusion-claim', 'unjustified-stable-correlator',
  'context-expansion-without-version', 'silent-fallback', 'key-control-as-authority',
  'stale-registry-snapshot', 'epoch-snapshot-inconsistent', 'disclosure-ignores-observables',
];

// ---------------------------------------------------------------------------
// F9 — register v1 absorbs the show-composition rejection strings BYTE-
// EXACTLY: trigger every rejection the emitting module can produce, collect
// the reason strings it actually returns, and demand (a) each is a register
// code whose source names show-composition, and (b) the triggered set equals
// the register's show-composition stratum exactly — no paraphrase, no drift.
// Also: v1 is append-only over v0 (all 19 v0 codes still present).
// ---------------------------------------------------------------------------
{
  const D_EPP = {
    protocol: 'dtg-zkp/0.1', profile: 'epp/1',
    contextAuthority: 'authority:f9', contextPolicy: 'policy:f9/1',
    purpose: 'purpose:f9', scope: 'scope:f9', verifierSet: 'verifiers:f9',
    epoch: 'epoch:2026-07', epochPolicy: 'rollover:30d',
    nullifierVersion: 'dtg-zkp/nullifier/v0', retentionPolicy: 'retention:35d',
  };
  const D_MLP = { ...D_EPP, profile: 'mlp/1' };
  const EXP = 1800000000, NOW = 1752750000;
  const base = {
    bundleId: 'EPP-UNIQ', bundleVersion: '1', descriptor: D_EPP,
    verifier: 'verifier:f9', challenge: 'nonce:f9-a', sessionId: 'session:f9-a',
    expiry: EXP, registry: REGISTRY,
  };
  const mA = makeShow(base);
  const mB = makeShow({ ...base, challenge: 'nonce:f9-b' });

  const emitted = new Set();
  const take = (r) => { if (!r.ok) emitted.add(r.reason); return r; };

  take(lookupBundle(REGISTRY, 'NOT-A-BUNDLE', '1')); //                bundle-outside-registry
  take(makeShow({ ...base, bundleId: 'EPP-UNIQ', descriptor: D_MLP })); //  bundle-profile-mismatch
  take(verifyShow({ ...mA.show, members: mA.show.members.slice(1) }, REGISTRY, NOW)); // partial-show-rejected
  take(verifyShow({
    ...mA.show,
    members: mA.show.members.map((m, i) => (i === 0 ? mB.show.members[0] : m)),
  }, REGISTRY, NOW)); //                                               member-transcript-mismatch
  take(verifyShow(mA.show, REGISTRY, EXP + 1)); //                     stale-transcript
  take(verifyShow({ ...mA.show, transcriptDigest: 'f'.repeat(64) }, REGISTRY, NOW)); // transcript-invalid
  take(completionEvidence(mA.show)); //                                taskcontext-not-outcome-evidence

  const registeredShowCodes = Object.keys(REASONS)
    .filter((c) => REASONS[c].source.startsWith('show-composition'))
    .sort();
  const emittedSorted = [...emitted].sort();
  // v2 bookkeeping: the v1 stratum (v0 codes + 7 show-composition codes) must
  // survive byte-identically; v2 appends V2_ADDED_EXACT exact codes on top
  // (families live in REASON_FAMILIES, counted separately in F10).
  const V1_EXACT_COUNT = V0_CODES.length + 7; // 26
  const V2_ADDED_EXACT = 40;
  ok(`F9 register ${REASON_REGISTER_VERSION} absorbs show-composition byte-exactly — ${emitted.size} strings triggered from the emitting module, append-only over v0+v1 (${Object.keys(REASONS).length} exact codes)`,
    REASON_REGISTER_VERSION === 'v2' &&
    emitted.size === 7 &&
    JSON.stringify(emittedSorted) === JSON.stringify(registeredShowCodes) &&
    emittedSorted.every((c) => isKnownReason(c)) &&
    REASONS['stale-transcript'].retryAmbiguous === true &&
    V0_CODES.every((c) => isKnownReason(c)) &&
    Object.keys(REASONS).length === V1_EXACT_COUNT + V2_ADDED_EXACT);
}

// ---------------------------------------------------------------------------
// F10 — register v2 absorbs the SIX instrument builds byte-exactly. Every v2
// code — exact and family — is triggered LIVE from its emitting module (no
// source-text scanning was needed: all 68 codes proved triggerable); the
// emitted string must match the register byte-for-byte (exact) or be a
// prefix+parameter family match. Every string ANY trigger emits must be
// register vocabulary — absorption leaves no leftovers — and no family prefix
// may collide with any other registered code (the two strata stay disjoint).
// ---------------------------------------------------------------------------
{
  const thrown = (fn) => { try { fn(); return '(no-throw)'; } catch (e) { return e.message; } };

  // Shared canonical fixtures for the triggers (explicit clocks, no Date.now).
  const D = {
    protocol: 'dtg-zkp/0.1', profile: 'epp/1',
    contextAuthority: 'authority:f10', contextPolicy: 'policy:f10/1',
    purpose: 'purpose:f10', scope: 'scope:f10', verifierSet: 'verifiers:f10',
    epoch: 'epoch:2026-07', epochPolicy: 'rollover:30d',
    nullifierVersion: 'dtg-zkp/nullifier/v0', retentionPolicy: 'retention:35d',
  };
  const dDigest = descriptorDigest(D);
  const T = {
    protocol: 'dtg-zkp/0.1', profile: 'epp/1', verifier: 'verifier:f10',
    contextDescriptorDigest: dDigest, purpose: 'purpose:f10', scope: 'scope:f10',
    challenge: 'nonce:f10', sessionId: 'session:f10',
    requestedPredicates: ['PR-PER', 'PR-UNQ'], policyRequirements: 'policy:f10',
    expiry: 1800000000, snapshotRequirements: 'snapshot:f10',
    encodingVersion: 'dtg-zkp/canonical/v0',
  };

  // context-card
  const card = renderCard(D);
  const tamperQ = (q, text) => {
    const c = structuredClone(card);
    c.questions[q] = text;
    return c;
  };

  // quiet-presentation
  const naive = makeNaiveDeployment({ horizon: 32, grid: 4, presentations: [{ t: 6, cause: 'duplicate-human-in-context' }] });
  const quietIdle = makeQuietDeployment({ horizon: 32, period: 8, grid: 4 });
  const overBudgetTrace = [
    { type: 'error', t: 4, shape: 's', surface: 'x' },
    { type: 'retry', t: 8, shape: 's', surface: 'x' },
    { type: 'retry', t: 12, shape: 's', surface: 'x' },
  ];
  const budgetRow = (over) => ({
    observer: 'verifier',
    claimForm: { againstWhom: 'verifier', forHowLong: 'session', alongsideWhat: ['transcript'] },
    seesPerPresentation: ['presentation-occurrence'],
    ...over,
  });

  // rotation
  const recDesc = makeRecoveryDescriptor('epoch:recovery-f10');
  const rateExceeded = () => {
    const iss = createIssuer();
    const first = issuerEnrol(iss, 'human:f10-r', 'nonce:0', 0);
    const domain = createRecoveryDomain();
    const r1 = recover({ registry: iss, recoveryDomain: domain, oldCommitment: first.commitment, humanId: 'human:f10-r', recoveryDescriptor: recDesc, enrolmentNonce: 'nonce:1', now: 1 });
    const r2 = recover({ registry: iss, recoveryDomain: domain, oldCommitment: r1.commitment, humanId: 'human:f10-r', recoveryDescriptor: recDesc, enrolmentNonce: 'nonce:2', now: 2 });
    return [r2.reason];
  };

  // erosion-record — a valid Appendix-B/X6 record, then one break per code
  const baseRecord = () => ({
    boundary_id: 'boundary:f10', predicate: 'PR-UNQ', profile: 'epp/1',
    statement_established: 'scoped reuse detection within the governed context',
    negative_meaning: 'no biometric correctness implied',
    accountable_parties: ['authority:f10'], redress: 'challenge route (§6.7)',
    against_whom: ['verifier'], alongside_what: ['transcript fields'],
    for_how_long: {
      certification: { cliffs: { 'attestation-validity': 'issuance-to-expiry' } },
      erosion: [{
        accumulatingObservables: ['verifier logs feeding B_t'],
        rebaseTrigger: 'migration (§22.3)',
        monitoringSignal: 'quarterly cryptanalysis review',
        estimatedHorizon: { value: '5y', basis: 'declared' },
      }],
    },
  });
  const brokeRecord = (mutate) => {
    const r = baseRecord();
    mutate(r);
    return validateRecord(r).failures;
  };
  ok('F10 sanity — the erosion-record base record validates clean before the breaks',
    validateRecord(baseRecord()).ok === true);

  // mediator
  const job = makeProvingJob({ holderSecret: 'secret:f10', descriptor: D, transcript: T, level: 'T0' });
  const retentionFailures = () => {
    const bad = makeMediator({ retain: ['transcriptDigest'] });
    const pre = bad.stateSnapshot();
    bad.executeJob(job, { epoch: 1000 });
    return checkForget(pre, bad.stateSnapshot()).failures;
  };
  const goodRecord = makeMediator().executeJob(job, { epoch: 1000 });

  // multi-issuer
  const snap = makeIssuerRegistry({
    epoch: 'epoch:reg-f10', effectiveTime: 0, issuers: [
      { id: 'issuer:a', epsilon: 0.01, epsilonEffectiveTime: 0, epsilonHorizon: 1000, dependencyClasses: ['vendor:va'] },
      { id: 'issuer:b', epsilon: 0.02, epsilonEffectiveTime: 0, epsilonHorizon: 1000, dependencyClasses: ['vendor:vb'] },
      { id: 'issuer:c', epsilon: 0.05, epsilonEffectiveTime: 0, epsilonHorizon: 5, dependencyClasses: ['vendor:vc'] },
    ],
  });
  const aggShow = makeAggregatedShow({ k: 2, issuerIds: ['issuer:a', 'issuer:b'], snapshot: snap, transcript: T, subjectCommitment: 'subject:s1' });
  ok('F10 sanity — the aggregated two-issuer show verifies clean before the breaks',
    verifyAggregated(aggShow, snap, 10).ok === true);
  const brokeShow = (mutate) => {
    const s = structuredClone(aggShow);
    mutate(s);
    return [verifyAggregated(s, snap, 10).rejection];
  };

  // guardian-recovery
  const preg = createPersonhoodRegistry();
  for (const g of ['g1', 'g2', 'g3', 'g4']) anchorPerson(preg, g);
  const gdesc = makeRecoveryDescriptor('epoch:guardian-f10');
  const gset = commitGuardianSet('holder:h1', ['g1', 'g2', 'g3'], 2, gdesc, 'gepoch:1', preg);
  const mkAtt = (gid, nc) => attest(gid, { newCommitment: nc, revokedRef: 'ref:old1', recoveryDescriptor: gdesc, epoch: 'gepoch:1', transcriptDigest: 'td:ceremony-f10' });
  const a1 = mkAtt('g1', 'nc:new1');
  const a2 = mkAtt('g2', 'nc:new1');
  const gRecover = (over) => [recoverWithGuardians({ attestations: [a1, a2], set: gset, recoveryDescriptor: gdesc, epoch: 'gepoch:1', ...over }).reason];
  const contested = () => {
    const cer = createCeremony();
    recoverWithGuardians({ attestations: [a1, a2], set: gset, recoveryDescriptor: gdesc, epoch: 'gepoch:1', ceremony: cer });
    return [recoverWithGuardians({ attestations: [mkAtt('g1', 'nc:new2'), mkAtt('g2', 'nc:new2')], set: gset, recoveryDescriptor: gdesc, epoch: 'gepoch:1', ceremony: cer }).reason];
  };

  // The absorption table: one row per v2 code; run() returns the strings the
  // emitting module actually produced. Every row is method TRIGGERED.
  const rows = [
    // context-card (X2)
    { code: 'digest-mismatch', family: false, run: () => checkLegibility(D, { ...card, digest: 'f'.repeat(64) }).failures },
    { code: 'unrendered-field:', family: true, run: () => checkLegibility(D, tamperQ('q1', 'nothing here')).failures },
    { code: 'missing-narrow-language:', family: true, run: () => checkLegibility(D, tamperQ('q2', `The verifiers in "${D.verifierSet}", governed by "${D.contextAuthority}", can see repeat use.`)).failures },
    { code: 'broad-personhood-language:', family: true, run: () => checkLegibility(D, tamperQ('q1', card.questions.q1 + ' This proves one unique human.')).failures },
    // quiet-presentation (X4) — quiet.mjs
    { code: 'status-correlated-with-presentation', family: false, run: () => checkQuietTier(naive.trace, { idleTrace: quietIdle.trace, k: 2, grid: 4, retryBudget: 1 }).failures },
    { code: 'per-show-authority-contact', family: false, run: () => checkQuietTier(naive.trace, { idleTrace: quietIdle.trace, k: 2, grid: 4, retryBudget: 1 }).failures },
    { code: 'error-surface-nonuniform', family: false, run: () => checkQuietTier(naive.trace, { idleTrace: quietIdle.trace, k: 2, grid: 4, retryBudget: 1 }).failures },
    { code: 'shape-fingerprint', family: false, run: () => checkQuietTier(naive.trace, { idleTrace: quietIdle.trace, k: 2, grid: 4, retryBudget: 1 }).failures },
    { code: 'retry-off-grid', family: false, run: () => checkQuietTier(naive.trace, { idleTrace: quietIdle.trace, k: 2, grid: 4, retryBudget: 1 }).failures },
    { code: 'retry-over-budget', family: false, run: () => checkQuietTier(overBudgetTrace, { idleTrace: [], grid: 4, retryBudget: 1 }).failures },
    { code: 'unknown-internal-reason:', family: true, run: () => checkQuietTier([], { idleTrace: [], holderLog: [{ t: 0, code: 'not-a-code-anywhere' }] }).failures },
    // quiet-presentation (X4) — logregister.mjs
    { code: 'prohibited-log-field:', family: true, run: () => validateLogSchema(['stableHolderId']).failures },
    { code: 'unregistered-log-field:', family: true, run: () => validateLogSchema(['definitelyNotRegistered']).failures },
    // quiet-presentation (X4) — budget.mjs
    { code: 'missing-observer-row:', family: true, run: () => validateBudget({ rows: [] }).failures },
    { code: 'unknown-observer:', family: true, run: () => validateBudget({ rows: [budgetRow({ observer: 'martian', claimForm: { againstWhom: 'martian', forHowLong: 'x', alongsideWhat: ['y'] } })] }).failures },
    { code: 'incomplete-claim-form:', family: true, run: () => validateBudget({ rows: [budgetRow({ claimForm: { againstWhom: 'verifier', alongsideWhat: ['y'] } })] }).failures },
    { code: 'empty-sees-claims-undetectability:', family: true, run: () => validateBudget({ rows: [budgetRow({ seesPerPresentation: [] })] }).failures },
    // rotation (X5)
    { code: 'epoch-descent-mismatch', family: false, run: () => [checkDescent('deadbeef', 'epoch:1', 'cafe').reason] },
    { code: 'duplicate-live-enrolment', family: false, run: () => { const i = createIssuer(); issuerEnrol(i, 'human:d', 'n1', 0); return [issuerEnrol(i, 'human:d', 'n2', 1).reason]; } },
    { code: 'unknown-enrolment', family: false, run: () => [recover({ registry: createIssuer(), recoveryDomain: createRecoveryDomain(), oldCommitment: 'ref:none', humanId: 'human:u', recoveryDescriptor: recDesc, enrolmentNonce: 'n', now: 0 }).reason] },
    { code: 'recovery-rate-exceeded', family: false, run: rateExceeded },
    { code: 'unbounded-clock:', family: true, run: () => validateClocks([{ clock: 'test-clock', family: 'certification', touchedBy: 'neither', bound: 'permanent' }]).failures },
    { code: 'unknown-clock-family:', family: true, run: () => validateClocks([{ clock: 'test-clock', family: 'wat', touchedBy: 'neither', bound: 'bounded' }]).failures },
    { code: 'unknown-clock-toucher:', family: true, run: () => validateClocks([{ clock: 'test-clock', family: 'erosion', touchedBy: 'sometimes', bound: 'bounded' }]).failures },
    // erosion-record (X6) — clocks.mjs
    { code: 'missing-clock:', family: true, run: () => validateSort([]).failures },
    { code: 'unsorted-clock:', family: true, run: () => { const c = structuredClone(EROSION_CLOCKS); c[0].family = 'nope'; return validateSort(c).failures; } },
    { code: 'unknown-clock:', family: true, run: () => validateSort([{ clock: 'martian-clock', family: 'erosion' }]).failures },
    // erosion-record (X6) — record.mjs
    { code: 'erosion-clock-unwatched', family: false, run: () => brokeRecord((r) => { delete r.for_how_long.erosion[0].rebaseTrigger; }) },
    { code: 'overclaimed-measurement', family: false, run: () => brokeRecord((r) => { r.for_how_long.erosion[0].estimatedHorizon.basis = 'measured'; }) },
    { code: 'cliff-only-erosion-claim', family: false, run: () => brokeRecord((r) => { delete r.for_how_long.erosion[0].accumulatingObservables; r.for_how_long.erosion[0].expiry = '2030-01-01'; }) },
    { code: 'claim-missing-parameter:', family: true, run: () => brokeRecord((r) => { delete r.against_whom; }) },
    { code: 'invalid-horizon-basis:', family: true, run: () => brokeRecord((r) => { r.for_how_long.erosion[0].estimatedHorizon.basis = 'guessed'; }) },
    { code: 'missing-field:', family: true, run: () => brokeRecord((r) => { delete r.boundary_id; }) },
    { code: 'missing-clock-family:', family: true, run: () => brokeRecord((r) => { r.for_how_long.certification = {}; }) },
    { code: 'erosion-missing-observables:', family: true, run: () => brokeRecord((r) => { delete r.for_how_long.erosion[0].accumulatingObservables; }) },
    { code: 'erosion-missing-monitoring-signal:', family: true, run: () => brokeRecord((r) => { delete r.for_how_long.erosion[0].monitoringSignal; }) },
    { code: 'erosion-missing-horizon:', family: true, run: () => brokeRecord((r) => { delete r.for_how_long.erosion[0].estimatedHorizon; }) },
    { code: 'invalid-erosion-entry:', family: true, run: () => brokeRecord((r) => { r.for_how_long.erosion = [null]; }) },
    { code: 'invalid-record:', family: true, run: () => validateRecord(null).failures },
    // mediator (X7) — mediator.mjs
    { code: 'honeypot-prohibited', family: false, run: () => [thrown(() => makeProvingJob({ holderSecret: 's', descriptor: D, transcript: T, level: 'T2' }))] },
    { code: 'unknown-mediator-level:', family: true, run: () => [thrown(() => makeProvingJob({ holderSecret: 's', descriptor: D, transcript: T, level: 'T9' }))] },
    { code: 'missing-holder-secret', family: false, run: () => [thrown(() => makeProvingJob({ descriptor: D, transcript: T, level: 'T0' }))] },
    { code: 'descriptor-transcript-mismatch', family: false, run: () => [thrown(() => makeProvingJob({ holderSecret: 's', descriptor: D, transcript: { ...T, contextDescriptorDigest: 'f'.repeat(64) }, level: 'T0' }))] },
    { code: 'missing-epoch', family: false, run: () => [thrown(() => makeMediator().executeJob(job, {}))] },
    { code: 'retention-violation:', family: true, run: retentionFailures },
    { code: 'job-transcript-mismatch', family: false, run: () => [verifyProofRecord(goodRecord, 'e'.repeat(64)).reason] },
    { code: 'proof-invalid', family: false, run: () => [verifyProofRecord({ ...goodRecord, proof: '0'.repeat(64) }, goodRecord.transcriptDigest).reason] },
    // mediator (X7) — downgrade.mjs
    { code: 'silent-fallback', family: false, run: () => validateTransition(__unsafeSilentTransition('LOCAL-PROVING-FAILED', 'GOVERNED-MEDIATOR', 'mediator:m1', ['verifier'])).failures },
    { code: 'unnamed-target', family: false, run: () => validateTransition(__unsafeSilentTransition('LOCAL-PROVING-FAILED', 'FAIL', undefined)).failures },
    { code: 'mediator-not-governed', family: false, run: () => [attemptProof({ localCapable: false, policy: { onLocalFailure: 'mediator', mediatorId: 'mediator:m1', registrySnapshot: { members: ['mediator:other'], effectiveTime: 0 } }, now: 10 }).reason] },
    { code: 'unnamed-lower-profile', family: false, run: () => [thrown(() => attemptProof({ localCapable: false, policy: { onLocalFailure: 'lower-profile' } }))] },
    { code: 'unnamed-channel', family: false, run: () => [thrown(() => attemptProof({ localCapable: false, policy: { onLocalFailure: 'channel-switch' } }))] },
    { code: 'unknown-exit:', family: true, run: () => [thrown(() => attemptProof({ localCapable: false, policy: { onLocalFailure: 'wat' } }))] },
    // multi-issuer (X8)
    { code: 'k-outside-tier', family: false, run: () => [thrown(() => makeAggregatedShow({ k: 7, issuerIds: Array(7).fill('issuer:a'), snapshot: snap, transcript: T, subjectCommitment: 's' }))] },
    { code: 'k-member-mismatch', family: false, run: () => brokeShow((s) => { s.members = []; }) },
    { code: 'mixed-registry-roots', family: false, run: () => brokeShow((s) => { s.members[0].membershipProof.root = 'f'.repeat(64); }) },
    { code: 'issuer-not-in-registry', family: false, run: () => brokeShow((s) => { s.members[1] = makeMember('issuer:ghost', { snapshot: snap, tDigest: transcriptDigest(T), subjectCommitment: 'subject:s1', predicate: 'PR-PER/1' }); }) },
    { code: 'invalid-membership-proof', family: false, run: () => brokeShow((s) => { s.members[0].membershipProof.inclusion = '0'.repeat(64); }) },
    { code: 'nullifier-mismatch', family: false, run: () => brokeShow((s) => { s.members[0].distinctnessNullifier = '1'.repeat(64); }) },
    { code: 'duplicate-issuer-in-show', family: false, run: () => [verifyAggregated(makeAggregatedShow({ k: 2, issuerIds: ['issuer:a', 'issuer:a'], snapshot: snap, transcript: T, subjectCommitment: 'subject:s1' }), snap, 10).rejection] },
    { code: 'subject-commitment-mismatch', family: false, run: () => brokeShow((s) => { s.members[1].attestation.subjectCommitment = 'subject:other'; }) },
    { code: 'predicate-mismatch', family: false, run: () => brokeShow((s) => { s.members[1].attestation.predicate = 'PR-LIV/1'; }) },
    { code: 'stale-epsilon:', family: true, run: () => [verifyAggregated(makeAggregatedShow({ k: 1, issuerIds: ['issuer:c'], snapshot: snap, transcript: T, subjectCommitment: 'subject:s1' }), snap, 10).rejection] },
    // guardian-recovery (X9)
    { code: 'guardian-not-personhood-anchored', family: false, run: () => [commitGuardianSet('holder:h1', ['g1', 'ghost'], 1, gdesc, 'gepoch:1', preg).reason] },
    { code: 'guardian-threshold-not-met', family: false, run: () => [recoverWithGuardians({ attestations: [a1], set: gset, recoveryDescriptor: gdesc, epoch: 'gepoch:1' }).reason] },
    { code: 'guardian-epoch-lapsed', family: false, run: () => gRecover({ epoch: 'gepoch:2' }) },
    { code: 'guardian-not-in-committed-set', family: false, run: () => gRecover({ attestations: [a1, mkAtt('g4', 'nc:new1')] }) },
    { code: 'duplicate-guardian-seat', family: false, run: () => gRecover({ attestations: [a1, a1] }) },
    { code: 'contested-recovery', family: false, run: contested },
    { code: 'attestation-not-outcome-evidence', family: false, run: () => [guardianCompletionEvidence(a1).reason] },
  ];

  const allEmitted = [];
  let rowsOk = true;
  for (const row of rows) {
    let strings;
    try { strings = row.run(); } catch (e) { strings = [`(trigger-threw:${e.message})`]; }
    allEmitted.push(...strings);
    const hit = strings.find((s) => (row.family
      ? typeof s === 'string' && s.startsWith(row.code) && s.length > row.code.length
      : s === row.code));
    if (hit === undefined || !isKnownReason(hit)) {
      rowsOk = false;
      console.log(`      F10 MISS ${row.code} — emitted: ${JSON.stringify(strings)}`);
    }
  }

  // Coverage: the trigger table must cover EVERY v2 addition — exact and family.
  const showCodes = Object.keys(REASONS).filter((c) => REASONS[c].source.startsWith('show-composition'));
  const v1Codes = new Set([...V0_CODES, ...showCodes]);
  const v2Exact = Object.keys(REASONS).filter((c) => !v1Codes.has(c));
  const v2Families = Object.keys(REASON_FAMILIES);
  const rowCodes = new Set(rows.map((r) => r.code));
  const uncovered = [...v2Exact, ...v2Families].filter((c) => !rowCodes.has(c));
  for (const c of uncovered) console.log(`      F10 UNCOVERED ${c}`);

  // Strata stay disjoint: no family prefix is a prefix of any other entry.
  const allKeys = [...Object.keys(REASONS), ...v2Families];
  const prefixCollision = v2Families.some((p) => allKeys.some((k) => k !== p && k.startsWith(p)));

  ok(`F10 register v2 absorbs the six instrument builds byte-exactly — ${rows.length} rows (${v2Exact.length} exact + ${v2Families.length} families) all TRIGGERED live, 0 source-scanned; ${allEmitted.length} emitted strings, all register vocabulary`,
    rowsOk && uncovered.length === 0 && !prefixCollision &&
    v2Families.every((p) => REASON_FAMILIES[p].prefix === p && REASON_FAMILIES[p].parameterized === true && p.endsWith(':')) &&
    v2Exact.length === 40 && v2Families.length === 29 &&
    // +1: the 'silent-fallback' row — a v1 code re-triggered here from its
    // SECOND emitter (downgrade.mjs); the convergence proper is F11's job.
    rows.length === v2Exact.length + v2Families.length + 1 &&
    allEmitted.every((s) => isKnownReason(s)) &&
    // the §13.6 retry-ambiguity judgments taken at v2
    REASONS['recovery-rate-exceeded'].retryAmbiguous === true &&
    REASONS['duplicate-live-enrolment'].retryAmbiguous === true &&
    REASONS['unknown-enrolment'].retryAmbiguous === true &&
    REASONS['mediator-not-governed'].retryAmbiguous === true &&
    REASONS['guardian-epoch-lapsed'].retryAmbiguous === true &&
    REASONS['duplicate-guardian-seat'].retryAmbiguous === true &&
    REASONS['contested-recovery'].retryAmbiguous === true &&
    REASON_FAMILIES['stale-epsilon:'].retryAmbiguous === true);
}

// ---------------------------------------------------------------------------
// F11 — convergences: a string emitted by more than one module (or by a module
// AND mandated by §26.1) is ONE register entry with dual sources, never a
// duplicate. 'silent-fallback': the v1 §26.1-bullet-8 entry is byte-identical
// AND the mediator/downgrade emission matches it byte-for-byte; the second
// source lives in CONVERGENCES, not in an edit to the v1 entry (append-only).
// Ditto 'unknown-enrolment' (rotation + guardian-recovery, same bytes) and the
// 'unbounded-clock:' family (both §22.2 clock validators).
// ---------------------------------------------------------------------------
{
  // silent-fallback: emitted by downgrade.mjs...
  const emittedSF = validateTransition(
    __unsafeSilentTransition('LOCAL-PROVING-FAILED', 'NAMED-LOWER-PROFILE', 'mlp/1', ['person'])
  ).failures.find((f) => f === 'silent-fallback');
  // ...and the v1 entry is untouched (byte-identical fields, no duplicate key —
  // object keys are unique by construction, so ONE entry is structural).
  const sf = REASONS['silent-fallback'];
  const sfV1Intact =
    sf.source === 'decision-doc §26.1 bullet 8' &&
    sf.decisionDocRef === '§26.1; §21 (mediated proving), §27.4 (fallback legibility)' &&
    sf.retryAmbiguous === false && sf.note === undefined;
  const sfConv = CONVERGENCES.find((c) => c.code === 'silent-fallback');

  // unknown-enrolment from BOTH emitters, byte-compared.
  const fromRotation = recover({
    registry: createIssuer(), recoveryDomain: createRecoveryDomain(),
    oldCommitment: 'ref:none', humanId: 'human:f11',
    recoveryDescriptor: makeRecoveryDescriptor('epoch:recovery-f11'),
    enrolmentNonce: 'n', now: 0,
  }).reason;
  const fromGuardians = createRecoveryIssuer().reissue(
    { kind: 'recovery-authorization-input', revokedRef: 'ref:none', epoch: 'e', newCommitment: 'nc' },
    createCeremony(), 0
  ).reason;

  // unbounded-clock: family from BOTH clock validators.
  const ubRotation = validateClocks(
    [{ clock: 'test-clock', family: 'certification', touchedBy: 'neither', bound: 'permanent' }]
  ).failures[0];
  const ubGuardian = validateGuardianClocks(
    [{ clock: 'guardian-attestation-epoch', family: 'certification', touchedBy: ['re-affirmation'], bound: 'permanent guardianship' }]
  ).failures[0];

  ok('F11 silent-fallback convergence — one entry, dual sources (§26.1 b8 + downgrade.mjs), same bytes; unknown-enrolment and unbounded-clock: likewise',
    emittedSF === 'silent-fallback' && isKnownReason(emittedSF) && sfV1Intact &&
    sfConv !== undefined && sfConv.emitters.length === 2 &&
    sfConv.emitters.some((e) => e.includes('downgrade')) &&
    fromRotation === 'unknown-enrolment' && fromGuardians === 'unknown-enrolment' &&
    fromRotation === fromGuardians && isKnownReason(fromRotation) &&
    ubRotation === 'unbounded-clock:test-clock' &&
    ubGuardian === 'unbounded-clock:guardian-attestation-epoch' &&
    isKnownReason(ubRotation) && isKnownReason(ubGuardian) &&
    CONVERGENCES.some((c) => c.code === 'unknown-enrolment') &&
    CONVERGENCES.some((c) => c.code === 'unbounded-clock:'));
}

console.log(`\nfixtures: ${passCount}/${passCount + failCount} pass`);
process.exit(failCount === 0 ? 0 : 1);
