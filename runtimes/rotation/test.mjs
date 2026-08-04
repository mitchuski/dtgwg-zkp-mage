// Property tests for X5 — recovery and rotation without correlators.
//
// The claim under test (X5, decision-doc language): rotation and recovery
// preserve the PR-UNQ guarantee (§13.1) across the secret change, without
// giving any party a persistent identifier that links pre- and post-event
// presentations across contexts. Run: node test.mjs
//
// Deterministic: no Date.now, no randomness — all epoch ids, nonces and `now`
// values are explicit.

import {
  deriveEpochSecret, epochNullifier, commitEpoch, checkDescent,
  createIssuer, issuerEnrol, recover, auditNoLink,
  makeRecoveryDescriptor, createRecoveryDomain,
  CLOCKS, validateClocks,
} from './rotation.mjs';
import {
  epochNode, formEdge, reformEdge, continueEdge,
  edgeValues, outsideView,  bridgeUnderivable,
} from './edges.mjs';
import { ContextRegistry } from '../01-uniqueness-nullifier/src/nullifier.mjs';
import { TrustGraph, roster } from '../07-trust-graph-formation/src/trust-graph.mjs';

let pass = 0, fail = 0;
const ok = (name, cond) => {
  if (cond) { pass++; console.log(`  ok  ${name}`); }
  else { fail++; console.log(`  FAIL ${name}`); }
};

console.log('\nrotation — recovery and rotation without correlators (X5)\n');

const serializeIssuer = (issuer) => JSON.stringify({
  commitments: [...issuer.commitments.entries()].sort(),
  templates: [...issuer.templates.entries()].sort(),
  events: issuer.events,
});

// ---------------------------------------------------------------------------
// R1. Routine rotation never touches enrolment: issuer state is byte-identical
// across N epoch rotations. Rotation is holder-side, full stop.
// ---------------------------------------------------------------------------
{
  const issuer = createIssuer();
  const alice = issuerEnrol(issuer, 'human:alice', 'nonce:0', 't0');
  const before = serializeIssuer(issuer);
  for (let e = 1; e <= 5; e++) {
    epochNullifier(alice.secret, `epoch:${e}`, 'service:dating-app');
    commitEpoch(alice.secret, `epoch:${e}`);
  }
  ok('R1 routine rotation leaves issuer/enrolment state unchanged across 5 epochs',
     serializeIssuer(issuer) === before);
}

// ---------------------------------------------------------------------------
// R2. Rotation preserves P4 within the new epoch: the same human's SECOND
// action in one context+epoch is still rejected (PR-UNQ §13.1 survives).
// ---------------------------------------------------------------------------
{
  const issuer = createIssuer();
  const alice = issuerEnrol(issuer, 'human:alice', 'nonce:0', 't0');
  const ctx = 'service:dating-app|epoch:2';
  const reg = new ContextRegistry(ctx);
  const n = epochNullifier(alice.secret, 'epoch:2', ctx);
  const first = reg.present(n);
  const second = reg.present(epochNullifier(alice.secret, 'epoch:2', ctx));
  ok('R2 P4 preserved in new epoch — second action rejected duplicate-human-in-context',
     first.admitted === true && second.admitted === false &&
     second.reason === 'duplicate-human-in-context');
}

// ---------------------------------------------------------------------------
// R3. Cross-epoch unlinkability: same human + context, epochs e1/e2 — the
// nullifiers differ, the descent commitments differ, and the only derivation
// path between them consumes the MASTER (epoch-1 material does not stand in).
// ---------------------------------------------------------------------------
{
  const issuer = createIssuer();
  const alice = issuerEnrol(issuer, 'human:alice', 'nonce:0', 't0');
  const ctx = 'service:dating-app';
  const n1 = epochNullifier(alice.secret, 'epoch:1', ctx);
  const n2 = epochNullifier(alice.secret, 'epoch:2', ctx);
  const s1 = deriveEpochSecret(alice.secret, 'epoch:1');
  const crossCheck = checkDescent(commitEpoch(alice.secret, 'epoch:2'), 'epoch:2', s1);
  ok('R3 cross-epoch unlinkability — nullifiers and commitments differ; epoch-1 secret cannot answer for epoch 2',
     n1 !== n2 &&
     commitEpoch(alice.secret, 'epoch:1') !== commitEpoch(alice.secret, 'epoch:2') &&
     crossCheck.ok === false && crossCheck.reason === 'epoch-descent-mismatch');
}

// ---------------------------------------------------------------------------
// R4. Descent check: honest derivation verifies against the commitment; a
// forged epoch secret (another master's derivation) is rejected. The check
// consumes commitment + epoch + candidate — never the master.
// ---------------------------------------------------------------------------
{
  const issuer = createIssuer();
  const alice = issuerEnrol(issuer, 'human:alice', 'nonce:0', 't0');
  const mallory = issuerEnrol(issuer, 'human:mallory', 'nonce:0', 't0');
  const c = commitEpoch(alice.secret, 'epoch:3');
  const honest = checkDescent(c, 'epoch:3', deriveEpochSecret(alice.secret, 'epoch:3'));
  const forged = checkDescent(c, 'epoch:3', deriveEpochSecret(mallory.secret, 'epoch:3'));
  ok('R4 descent check — honest epoch secret passes, forged one fails epoch-descent-mismatch',
     honest.ok === true && forged.ok === false && forged.reason === 'epoch-descent-mismatch');
}

// ---------------------------------------------------------------------------
// R5. Catastrophic recovery leaves NO old→new pair in issuer state — asserted
// STRUCTURALLY over every record the issuer holds. The issuer knows "a
// revocation happened, an enrolment happened" — never who replaced whom.
// ---------------------------------------------------------------------------
const issuerA = createIssuer();
const recoveryDomainA = createRecoveryDomain();
const aliceOld = issuerEnrol(issuerA, 'human:alice', 'nonce:0', 't0');
const rec = recover({
  registry: issuerA, recoveryDomain: recoveryDomainA,
  oldCommitment: aliceOld.commitment, humanId: 'human:alice',
  recoveryDescriptor: makeRecoveryDescriptor('repoch:2026-H2'),
  enrolmentNonce: 'nonce:1', now: 't1',
});
{
  const audit = auditNoLink(issuerA, aliceOld.commitment, rec.commitment);
  ok('R5 issuer-blind replacement — recovery succeeds, new commitment fresh, no record pairs old with new',
     rec.recovered === true &&
     rec.commitment !== aliceOld.commitment &&
     issuerA.commitments.get(aliceOld.commitment) === 'revoked' &&
     issuerA.commitments.get(rec.commitment) === 'live' &&
     audit.ok === true && audit.records.length > 0);
}

// ---------------------------------------------------------------------------
// R6. Recovery rate limit: a second recovery in the SAME recovery epoch fires
// the recovery-domain nullifier (§6.5 rate limiting; §13.4 recovery domain) —
// and leaves issuer state untouched. A new recovery epoch admits again.
// ---------------------------------------------------------------------------
{
  const before = serializeIssuer(issuerA);
  const again = recover({
    registry: issuerA, recoveryDomain: recoveryDomainA,
    oldCommitment: rec.commitment, humanId: 'human:alice',
    recoveryDescriptor: makeRecoveryDescriptor('repoch:2026-H2'), // same epoch
    enrolmentNonce: 'nonce:2', now: 't2',
  });
  const untouchedAfterRefusal = serializeIssuer(issuerA) === before;
  const nextEpoch = recover({
    registry: issuerA, recoveryDomain: recoveryDomainA,
    oldCommitment: rec.commitment, humanId: 'human:alice',
    recoveryDescriptor: makeRecoveryDescriptor('repoch:2027-H1'), // new epoch
    enrolmentNonce: 'nonce:3', now: 't3',
  });
  ok('R6 rate limit — 2nd recovery in same recovery epoch rejected recovery-rate-exceeded, state untouched; new epoch admits',
     again.recovered === false && again.reason === 'recovery-rate-exceeded' &&
     untouchedAfterRefusal &&
     nextEpoch.recovered === true);
}

// ---------------------------------------------------------------------------
// R7. Dedup, not a link, prevents two live enrolments: the same human
// re-enrolling while the old enrolment is still live is caught by the
// biometric matcher.
// ---------------------------------------------------------------------------
{
  const issuer = createIssuer();
  issuerEnrol(issuer, 'human:bob', 'nonce:0', 't0');
  const dup = issuerEnrol(issuer, 'human:bob', 'nonce:1', 't1'); // no revocation
  ok('R7 biometric dedup — re-enrolment while old enrolment live rejected duplicate-live-enrolment',
     dup.admitted === false && dup.reason === 'duplicate-live-enrolment');
}

// ---------------------------------------------------------------------------
// Edge re-key setup (M5): alice and bob hold a VRC edge in epoch 1; alice
// rotates to epoch 2.
// ---------------------------------------------------------------------------
const community = 'community:drake-island';
const alice1 = epochNode('human:alice', community, 'epoch:1');
const alice2 = epochNode('human:alice', community, 'epoch:2');
const bob1 = epochNode('human:bob', community, 'epoch:1');

// ---------------------------------------------------------------------------
// R8. reformEdge — the old edge dies; the new encounter's edge shares NO value
// attributable to the rotated member with the old edge (only the unrotated
// counterparty's own member id persists, which is bob's identity, not a link
// between alice's epochs).
// ---------------------------------------------------------------------------
{
  const graph = new TrustGraph();
  const members = roster([alice1, bob1]);
  const old = formEdge(members, graph, alice1, bob1, 'salt:meet-1');
  const re = reformEdge({ members, graph, rotatedNode: alice2, counterparty: bob1, salt: 'salt:meet-2' });
  const sharedValues = [...edgeValues(old.edge)].filter((v) => edgeValues(re.newEdge).has(v));
  ok('R8 re-formation — new edge formed, old and new share only the counterparty\'s own id, nothing of the rotator',
     old.grew === true && re.newEdge !== null &&
     re.newEdge.vrc !== old.edge.vrc &&
     sharedValues.length === 1 && sharedValues[0] === bob1.member);
}

// ---------------------------------------------------------------------------
// R9. continueEdge — the bridge ("same enrolment, new key") is visible ONLY
// inside the edge context (§6.5): the disclosure record states it explicitly,
// the out-of-context view of the graph carries neither the bridge value nor
// the disclosure, and the bridge is not derivable from public edge values
// (§6.6 — it is scoped by the pair-only shared compression).
// ---------------------------------------------------------------------------
{
  const graph = new TrustGraph();
  const members = roster([alice1, bob1]);
  const old = formEdge(members, graph, alice1, bob1, 'salt:meet-1');
  const edgeContext = { records: [] }; // the pair's private context, not the graph
  const cont = continueEdge({
    members, graph, edgeContext,
    oldNode: alice1, rotatedNode: alice2, counterparty: bob1,
    shared: old.shared, salt: 'salt:meet-2',
  });
  const view = outsideView(graph);
  const publicValues = [old.edge.vrc, cont.newEdge.vrc, alice1.member, alice2.member, bob1.member];
  ok('R9 continuity — disclosure record says same-enrolment-new-key; outside view carries no bridge; bridge underivable from public values',
     cont.disclosureRecord.disclosure === 'same-enrolment-new-key' &&
     edgeContext.records.length === 1 &&
     !view.includes(cont.bridge) && !view.includes('same-enrolment-new-key') &&
     bridgeUnderivable(cont.bridge, publicValues, alice1.member, alice2.member));
}

// ---------------------------------------------------------------------------
// R10. Clock table (M1, §22.1/§22.2): every clock bounded and family-assigned;
// removing a bound fires unbounded-clock:<name>.
// ---------------------------------------------------------------------------
{
  const valid = validateClocks(CLOCKS);
  const familiesAssigned = CLOCKS.every((c) => c.family === 'certification' || c.family === 'erosion');
  const touchersAssigned = CLOCKS.every((c) => ['routine', 'catastrophic', 'neither'].includes(c.touchedBy));
  const broken = CLOCKS.map((c) => c.clock === 'nullifier epoch' ? { ...c, bound: '' } : c);
  const caught = validateClocks(broken);
  ok('R10 clock table — 11 clocks bounded + family-assigned; removing a bound fires unbounded-clock:nullifier epoch',
     valid.ok === true && CLOCKS.length === 11 && familiesAssigned && touchersAssigned &&
     caught.ok === false && caught.failures.includes('unbounded-clock:nullifier epoch'));
}

console.log(`\nrotation: ${pass}/${pass + fail} pass\n`);
process.exit(fail === 0 ? 0 : 1);
