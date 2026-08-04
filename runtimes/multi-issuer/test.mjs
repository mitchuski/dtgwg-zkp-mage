// Property tests for the multi-issuer aggregation reference (X8 M3: the
// §12.5 bound with A1–A4 enforced structurally; negatives in §26.1 style).
// Run: node test.mjs — exits nonzero on any failure. Zero-dep, offline,
// deterministic (no Date.now; every time is an explicit argument).

import { enrol } from '../01-uniqueness-nullifier/src/nullifier.mjs';
import { descriptorDigest, transcriptDigest } from '../canonical/canonical.mjs';
import { makeIssuerRegistry, effectiveK, aggregateBound } from './registry.mjs';
import {
  K_TIERS,
  makeMember,
  makeAggregatedShow,
  verifyAggregated,
  issuerShowNullifier,
} from './aggregate.mjs';

let passCount = 0,
  failCount = 0;
const ok = (name, cond, detail = '') => {
  if (cond) {
    passCount++;
    console.log(`  ok  ${name}`);
  } else {
    failCount++;
    console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
  }
};
const near = (a, b) => Math.abs(a - b) <= 1e-12 * Math.max(1, Math.abs(a), Math.abs(b));

console.log('\nmulti-issuer — X8 properties\n');

// --- fixtures ----------------------------------------------------------------
const NOW = '2026-07-18T00:00:00Z';

const descriptor = {
  protocol: 'dtg-zkp/0.1',
  profile: 'epp/1',
  contextAuthority: 'authority:demo',
  contextPolicy: 'ctx-policy/1',
  purpose: 'purpose:aggregated-personhood',
  scope: 'scope:demo',
  verifierSet: 'verifier-set:demo',
  epoch: 'epoch:2026-Q3',
  epochPolicy: 'quarterly-rollover/1',
  nullifierVersion: 'dtg-zkp/issuer-show-nullifier/v0',
  retentionPolicy: 'retention:none/1',
};

const makeTranscript = (challenge, sessionId) => ({
  protocol: 'dtg-zkp/0.1',
  profile: 'epp/1',
  verifier: 'verifier:demo',
  contextDescriptorDigest: descriptorDigest(descriptor),
  purpose: 'purpose:aggregated-personhood',
  scope: 'scope:demo',
  challenge,
  sessionId,
  requestedPredicates: ['PR-PER'],
  policyRequirements: 'epp/1-baseline',
  expiry: '2026-07-18T01:00:00Z',
  snapshotRequirements: 'registry-epoch:2026-Q3',
  encodingVersion: 'canonical/v0',
});

const transcript = makeTranscript('challenge-0001', 'session-0001');
const subjectCommitment = enrol('subject-demo-1').commitment;

// Independence register: alpha/beta/gamma pairwise independent; delta and
// echo share 'vendor:acme'; stale's ε horizon has already passed at NOW.
const ISSUERS = [
  { id: 'iss:alpha', epsilon: 0.01, epsilonEffectiveTime: '2026-07-01T00:00:00Z', epsilonHorizon: '2027-01-01T00:00:00Z', dependencyClasses: ['pipeline:alpha', 'jurisdiction:AA'] },
  { id: 'iss:beta', epsilon: 0.02, epsilonEffectiveTime: '2026-07-01T00:00:00Z', epsilonHorizon: '2027-01-01T00:00:00Z', dependencyClasses: ['pipeline:beta', 'jurisdiction:BB'] },
  { id: 'iss:gamma', epsilon: 0.05, epsilonEffectiveTime: '2026-07-01T00:00:00Z', epsilonHorizon: '2027-01-01T00:00:00Z', dependencyClasses: ['pipeline:gamma', 'jurisdiction:CC'] },
  { id: 'iss:delta', epsilon: 0.03, epsilonEffectiveTime: '2026-07-01T00:00:00Z', epsilonHorizon: '2027-01-01T00:00:00Z', dependencyClasses: ['pipeline:delta', 'vendor:acme'] },
  { id: 'iss:echo', epsilon: 0.04, epsilonEffectiveTime: '2026-07-01T00:00:00Z', epsilonHorizon: '2027-01-01T00:00:00Z', dependencyClasses: ['pipeline:echo', 'vendor:acme'] },
  { id: 'iss:stale', epsilon: 0.02, epsilonEffectiveTime: '2026-01-01T00:00:00Z', epsilonHorizon: '2026-06-01T00:00:00Z', dependencyClasses: ['pipeline:stale'] },
];

const snapshot = makeIssuerRegistry({
  epoch: 'epoch:2026-Q3',
  effectiveTime: '2026-07-01T00:00:00Z',
  issuers: ISSUERS,
});

// ---------------------------------------------------------------------------
// A1 — honest 3-issuer independent show verifies; bound = ε1·ε2·ε3,
// effectiveK = 3.
// ---------------------------------------------------------------------------
let a1Statement;
{
  const show = makeAggregatedShow({
    k: 3,
    issuerIds: ['iss:alpha', 'iss:beta', 'iss:gamma'],
    snapshot,
    transcript,
    subjectCommitment,
  });
  const r = verifyAggregated(show, snapshot, NOW);
  a1Statement = r.ok ? r.statement : null;
  ok(
    'A1 honest 3-issuer independent show verifies; bound = ε1·ε2·ε3, effectiveK = 3',
    r.ok && r.statement.effectiveK === 3 && near(r.statement.bound, 0.01 * 0.02 * 0.05),
    JSON.stringify(r)
  );
}

// ---------------------------------------------------------------------------
// A2 — shared 'vendor:acme' collapses delta+echo: effectiveK = 2, group ε =
// max within the group, and the bound is LARGER (weaker) than the naive
// product — the honesty property of the collapse.
// ---------------------------------------------------------------------------
{
  const show = makeAggregatedShow({
    k: 3,
    issuerIds: ['iss:alpha', 'iss:delta', 'iss:echo'],
    snapshot,
    transcript,
    subjectCommitment,
  });
  const r = verifyAggregated(show, snapshot, NOW);
  const grouped = effectiveK(['iss:alpha', 'iss:delta', 'iss:echo'], snapshot);
  const naive = 0.01 * 0.03 * 0.04;
  const collapsed = 0.01 * Math.max(0.03, 0.04);
  ok(
    'A2 shared vendor collapses: effectiveK = 2, group ε = max, bound weaker than naive product',
    r.ok &&
      r.statement.effectiveK === 2 &&
      grouped.groups.length === 2 &&
      near(r.statement.bound, collapsed) &&
      r.statement.bound > naive,
    JSON.stringify({ r, grouped })
  );
}

// ---------------------------------------------------------------------------
// A3 — duplicate issuer (same id twice) is caught as a nullifier collision.
// ---------------------------------------------------------------------------
{
  const show = makeAggregatedShow({
    k: 2,
    issuerIds: ['iss:alpha', 'iss:alpha'],
    snapshot,
    transcript,
    subjectCommitment,
  });
  const r = verifyAggregated(show, snapshot, NOW);
  ok(
    'A3 duplicate issuer in show rejected via nullifier collision',
    !r.ok && r.rejection === 'duplicate-issuer-in-show',
    JSON.stringify(r)
  );
}

// ---------------------------------------------------------------------------
// A4 — members proved against two different snapshot roots (§12.4 named-root
// discipline; inconsistent snapshots are a §26.1 rejection).
// ---------------------------------------------------------------------------
{
  const otherSnapshot = makeIssuerRegistry({
    epoch: 'epoch:2026-Q4',
    effectiveTime: '2026-10-01T00:00:00Z',
    issuers: ISSUERS,
  });
  const show = makeAggregatedShow({
    k: 2,
    issuerIds: ['iss:alpha', 'iss:beta'],
    snapshot,
    transcript,
    subjectCommitment,
  });
  const tDigest = transcriptDigest(transcript);
  show.members[1] = makeMember('iss:beta', {
    snapshot: otherSnapshot,
    tDigest,
    subjectCommitment,
    predicate: show.predicate,
  });
  const r = verifyAggregated(show, snapshot, NOW);
  ok(
    'A4 members against two different registry roots rejected',
    otherSnapshot.root !== snapshot.root && !r.ok && r.rejection === 'mixed-registry-roots',
    JSON.stringify(r)
  );
}

// ---------------------------------------------------------------------------
// A5 — k = 4 is outside the governed tier vocabulary {1,2,3}: rejected at
// build AND at verify (a hand-built 4-member show must not pass).
// ---------------------------------------------------------------------------
{
  let buildThrow = null;
  try {
    makeAggregatedShow({
      k: 4,
      issuerIds: ['iss:alpha', 'iss:beta', 'iss:gamma', 'iss:delta'],
      snapshot,
      transcript,
      subjectCommitment,
    });
  } catch (e) {
    buildThrow = e.message;
  }
  const tDigest = transcriptDigest(transcript);
  const members = ['iss:alpha', 'iss:beta', 'iss:gamma', 'iss:delta'].map((id) =>
    makeMember(id, { snapshot, tDigest, subjectCommitment, predicate: 'PR-PER/1' })
  );
  const handBuilt = { k: 4, transcript, subjectCommitment, predicate: 'PR-PER/1', members };
  const r = verifyAggregated(handBuilt, snapshot, NOW);
  ok(
    'A5 k=4 outside tiers {1,2,3} rejected at build and at verify',
    K_TIERS.length === 3 &&
      buildThrow === 'k-outside-tier' &&
      !r.ok &&
      r.rejection === 'k-outside-tier',
    JSON.stringify({ buildThrow, r })
  );
}

// ---------------------------------------------------------------------------
// A6 — an ε past its assurance horizon at the explicit `now` cannot support
// the bound (X6 certification clock).
// ---------------------------------------------------------------------------
{
  const show = makeAggregatedShow({
    k: 2,
    issuerIds: ['iss:alpha', 'iss:stale'],
    snapshot,
    transcript,
    subjectCommitment,
  });
  const r = verifyAggregated(show, snapshot, NOW);
  ok(
    'A6 stale ε (past horizon at now) rejected by name',
    !r.ok && r.rejection === 'stale-epsilon:iss:stale',
    JSON.stringify(r)
  );
}

// ---------------------------------------------------------------------------
// A7 — distinctness nullifiers are show-scoped: the same issuer across two
// different transcripts yields different nullifiers (no cross-show issuer
// correlation — §15.2 domain separation at the issuer level).
// ---------------------------------------------------------------------------
{
  const t1 = transcriptDigest(makeTranscript('challenge-0001', 'session-0001'));
  const t2 = transcriptDigest(makeTranscript('challenge-0002', 'session-0002'));
  const n1 = issuerShowNullifier('iss:alpha', t1);
  const n2 = issuerShowNullifier('iss:alpha', t2);
  const n1Again = issuerShowNullifier('iss:alpha', t1);
  ok(
    'A7 nullifiers show-scoped: same issuer, different transcripts, different nullifiers',
    n1 !== n2 && n1 === n1Again,
    JSON.stringify({ n1, n2 })
  );
}

// ---------------------------------------------------------------------------
// A8 — concealment shape: the verified statement exposes {effectiveK, bound,
// root} and structurally contains NO issuer identifier (§12.3 mode 4 — the
// members are concealed; the collapsed count and the bound are the public
// residue).
// ---------------------------------------------------------------------------
{
  const s = a1Statement;
  const serialized = JSON.stringify(s);
  const leaked = ISSUERS.filter((m) => serialized.includes(m.id)).map((m) => m.id);
  const keys = Object.keys(s ?? {});
  ok(
    'A8 statement exposes {effectiveK, bound, root}, contains no issuer ids',
    s !== null &&
      keys.includes('effectiveK') &&
      keys.includes('bound') &&
      keys.includes('root') &&
      !keys.includes('members') &&
      !serialized.includes('issuerId') &&
      leaked.length === 0,
    JSON.stringify({ keys, leaked })
  );
}

// ---------------------------------------------------------------------------
// A9 — corrupted-issuer degradation (§12.5 verbatim clause): replacing ε_j by
// 1 weakens the bound but leaves it the product of the OTHERS' ε — a
// corrupted issuer degrades only its own contribution.
// ---------------------------------------------------------------------------
{
  const honest = aggregateBound(['iss:alpha', 'iss:beta', 'iss:gamma'], snapshot, NOW);
  const degraded = aggregateBound(['iss:alpha', 'iss:beta', 'iss:gamma'], snapshot, NOW, {
    corrupted: ['iss:beta'],
  });
  ok(
    'A9 corrupted issuer j (ε_j→1): bound weakens to the product of the others',
    near(honest.bound, 0.01 * 0.02 * 0.05) &&
      near(degraded.bound, 0.01 * 0.05) &&
      degraded.bound > honest.bound &&
      degraded.effectiveK === 3,
    JSON.stringify({ honest, degraded })
  );
}

// ---------------------------------------------------------------------------
// A10 — A4-same-proposition: members binding different subject commitments
// are not one aggregated show (different subjects would be composition or
// fraud, never aggregation).
// ---------------------------------------------------------------------------
{
  const show = makeAggregatedShow({
    k: 2,
    issuerIds: ['iss:alpha', 'iss:beta'],
    snapshot,
    transcript,
    subjectCommitment,
  });
  show.members[1] = {
    ...show.members[1],
    attestation: {
      ...show.members[1].attestation,
      subjectCommitment: enrol('subject-demo-2').commitment,
    },
  };
  const r = verifyAggregated(show, snapshot, NOW);
  ok(
    'A10 mismatched subject commitment across members rejected',
    !r.ok && r.rejection === 'subject-commitment-mismatch',
    JSON.stringify(r)
  );
}

// ---------------------------------------------------------------------------
console.log(`\nmulti-issuer: ${passCount}/${passCount + failCount} pass\n`);
process.exit(failCount === 0 ? 0 : 1);
