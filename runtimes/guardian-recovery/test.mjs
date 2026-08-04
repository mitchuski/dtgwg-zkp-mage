// Guardian recovery — properties G1–G12 (X9 milestones M1/M3/M4 as tests).
// Zero-dep, offline, deterministic: explicit epochs and `now` values, no Date.now.

import {
  createPersonhoodRegistry,
  anchorPerson,
  commitGuardianSet,
  attest,
  createCeremony,
  recoverWithGuardians,
  createRecoveryIssuer,
  completionEvidence,
  auditSignerSetHidden,
  GUARDIAN_CLOCKS,
  validateGuardianClocks,
  H,
  descriptorDigest,
} from './guardians.mjs';
import { candidateGuardians } from './candidates.mjs';
import { makeRecoveryDescriptor, auditNoLink } from '../rotation/rotation.mjs';
import { enrol, nullifier } from '../01-uniqueness-nullifier/src/nullifier.mjs';
import {
  joinCommunity,
  TrustGraph,
  roster,
  dreamCycleTurn,
} from '../07-trust-graph-formation/src/trust-graph.mjs';

// --- tiny harness ------------------------------------------------------------
const results = [];
function test(name, fn) {
  try {
    fn();
    results.push({ name, ok: true });
  } catch (e) {
    results.push({ name, ok: false, err: e.message });
  }
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

// --- shared fixtures (deterministic) ----------------------------------------
const DESC = makeRecoveryDescriptor('recovery-epoch-1'); // governed §6.2 descriptor (rotation, unchanged)
const EPOCH = 'guardian-epoch-1'; // the guardian-attestation epoch — its OWN clock
const GUARDIANS = ['guardian-ana', 'guardian-bo', 'guardian-cai', 'guardian-dee', 'guardian-eli'];
const HOLDER = 'holder-mira';
const OLD = enrol(HOLDER).commitment; // the revoked-commitment ref
const NEW = enrol(HOLDER + '/recovered/1').commitment; // the continuity claim's new commitment
const TRANSCRIPT = H('dtg-zkp/transcript/v0', 'recovery-ceremony-1'); // modelled ceremony transcript digest
const CLAIM = { newCommitment: NEW, revokedRef: OLD, recoveryDescriptor: DESC, epoch: EPOCH, transcriptDigest: TRANSCRIPT };

function anchoredRegistry() {
  const r = createPersonhoodRegistry();
  for (const g of GUARDIANS) anchorPerson(r, g);
  return r;
}
function committedSet(registry, epoch = EPOCH, t = 3) {
  const set = commitGuardianSet(HOLDER, GUARDIANS, t, DESC, epoch, registry);
  assert(set.ok, `set commit failed: ${set.reason}`);
  return set;
}
function bundle(guardianIds, claim = CLAIM) {
  return guardianIds.map((g) => attest(g, claim));
}
function freshIssuer() {
  const issuer = createRecoveryIssuer();
  issuer.admit(OLD);
  return issuer;
}

// ============================================================================

test('G1 t-of-n happy path: 3-of-5 authorize; issuer reissues; no old→new pair in issuer state', () => {
  const registry = anchoredRegistry();
  const set = committedSet(registry);
  assert(set.n === 5 && set.t === 3, 'set is 3-of-5');
  const issuer = freshIssuer();
  const ceremony = createCeremony();
  const res = recoverWithGuardians({
    attestations: bundle(['guardian-ana', 'guardian-bo', 'guardian-cai']),
    set, recoveryDescriptor: DESC, epoch: EPOCH, issuer, ceremony,
  });
  assert(res.ok, `expected authorization, got ${res.reason}`);
  assert(res.authorization.kind === 'recovery-authorization-input', 'authorization input, not a completed recovery');
  const rec = issuer.reissue(res.authorization, ceremony, 't1');
  assert(rec.ok, `reissue failed: ${rec.reason}`);
  assert(issuer.state.commitments.get(OLD) === 'revoked', 'old revoked');
  assert(issuer.state.commitments.get(NEW) === 'live', 'new live');
  assert(completionEvidence(rec.record).ok, 'the reissuance record IS the outcome artifact');
  const audit = auditNoLink(issuer.state, OLD, NEW); // X5's structural audit, inherited
  assert(audit.ok, `issuer holds an old→new pairing record: ${audit.offending.join(';')}`);
});

test('G2 t-1 attestations → guardian-threshold-not-met', () => {
  const registry = anchoredRegistry();
  const set = committedSet(registry);
  const res = recoverWithGuardians({
    attestations: bundle(['guardian-ana', 'guardian-bo']),
    set, recoveryDescriptor: DESC, epoch: EPOCH, issuer: freshIssuer(), ceremony: createCeremony(),
  });
  assert(!res.ok && res.reason === 'guardian-threshold-not-met', `got ${res.reason}`);
});

test('G3 stale epoch → guardian-epoch-lapsed (stale attestation AND stale set)', () => {
  const registry = anchoredRegistry();
  // stale attestation against a live set
  const set = committedSet(registry);
  const stale = attest('guardian-ana', { ...CLAIM, epoch: 'guardian-epoch-0' });
  const res = recoverWithGuardians({
    attestations: [stale, ...bundle(['guardian-bo', 'guardian-cai'])],
    set, recoveryDescriptor: DESC, epoch: EPOCH, issuer: freshIssuer(), ceremony: createCeremony(),
  });
  assert(!res.ok && res.reason === 'guardian-epoch-lapsed', `got ${res.reason}`);
  // stale SET: guardianship lapsed without re-affirmation — cannot attest a live recovery
  const staleSet = committedSet(registry, 'guardian-epoch-0');
  const res2 = recoverWithGuardians({
    attestations: bundle(['guardian-ana', 'guardian-bo', 'guardian-cai']),
    set: staleSet, recoveryDescriptor: DESC, epoch: EPOCH, issuer: freshIssuer(), ceremony: createCeremony(),
  });
  assert(!res2.ok && res2.reason === 'guardian-epoch-lapsed', `got ${res2.reason}`);
});

test('G4 one guardian signing twice → duplicate-guardian-seat (nullifier collision)', () => {
  const registry = anchoredRegistry();
  const set = committedSet(registry);
  const res = recoverWithGuardians({
    attestations: bundle(['guardian-ana', 'guardian-ana', 'guardian-bo']),
    set, recoveryDescriptor: DESC, epoch: EPOCH, issuer: freshIssuer(), ceremony: createCeremony(),
  });
  assert(!res.ok && res.reason === 'duplicate-guardian-seat', `got ${res.reason}`);
});

test('G5 outsider attestation → guardian-not-in-committed-set', () => {
  const registry = anchoredRegistry();
  anchorPerson(registry, 'guardian-zed'); // personhood-anchored — but NOT in the committed set
  const set = committedSet(registry);
  const res = recoverWithGuardians({
    attestations: bundle(['guardian-ana', 'guardian-bo', 'guardian-zed']),
    set, recoveryDescriptor: DESC, epoch: EPOCH, issuer: freshIssuer(), ceremony: createCeremony(),
  });
  assert(!res.ok && res.reason === 'guardian-not-in-committed-set', `got ${res.reason}`);
});

test('G6 non-anchored guardian refused at COMMIT time → guardian-not-personhood-anchored (Sybil-self-guardian kill)', () => {
  const registry = anchoredRegistry();
  // a fabricated guardian: enrol() is reachable, but the accredited set never admitted it
  const res = commitGuardianSet(HOLDER, [...GUARDIANS.slice(0, 4), 'sock-puppet-7'], 3, DESC, EPOCH, registry);
  assert(!res.ok && res.reason === 'guardian-not-personhood-anchored', `got ${res.reason}`);
});

test('G7 authorization input hides the signer set (structural scan)', () => {
  const registry = anchoredRegistry();
  const set = committedSet(registry);
  const signers = ['guardian-ana', 'guardian-bo', 'guardian-cai'];
  const atts = bundle(signers);
  const res = recoverWithGuardians({
    attestations: atts, set, recoveryDescriptor: DESC, epoch: EPOCH,
    issuer: freshIssuer(), ceremony: createCeremony(),
  });
  assert(res.ok, `expected authorization, got ${res.reason}`);
  // everything guardian-side that could identify who vouched — for ALL five,
  // not only the signers (absence of non-signers is also information)
  const material = GUARDIANS.flatMap((g) => {
    const id = enrol(g);
    return [g, id.secret, id.commitment];
  }).concat(atts.flatMap((a) => [a.guardianNullifier, a.membershipRef]));
  const scan = auditSignerSetHidden(res.authorization, material);
  assert(scan.ok, `authorization leaks signer material: ${scan.offending.join(';')}`);
  assert(res.authorization.setCommitment === set.setCommitment, 'exposes the set commitment');
  assert(res.authorization.count === 3 && res.authorization.epoch === EPOCH, 'exposes count + epoch only');
});

test('G8 attestation bundle is never completion evidence → attestation-not-outcome-evidence', () => {
  const registry = anchoredRegistry();
  const set = committedSet(registry);
  const atts = bundle(['guardian-ana', 'guardian-bo', 'guardian-cai']);
  const res = recoverWithGuardians({
    attestations: atts, set, recoveryDescriptor: DESC, epoch: EPOCH,
    issuer: freshIssuer(), ceremony: createCeremony(),
  });
  assert(res.ok, `expected authorization, got ${res.reason}`);
  for (const artifact of [atts[0], { attestations: atts }, res.authorization]) {
    const ev = completionEvidence(artifact);
    assert(!ev.ok && ev.reason === 'attestation-not-outcome-evidence', `got ${ev.reason}`);
  }
});

test('G9 contested recovery: conflicting bundles → contested-recovery; issuer state untouched', () => {
  const registry = anchoredRegistry();
  const set = committedSet(registry);
  const issuer = freshIssuer();
  const ceremony = createCeremony();
  const auth1 = recoverWithGuardians({
    attestations: bundle(['guardian-ana', 'guardian-bo', 'guardian-cai']),
    set, recoveryDescriptor: DESC, epoch: EPOCH, issuer, ceremony,
  });
  assert(auth1.ok, `first bundle should authorize, got ${auth1.reason}`);
  // second bundle: same revokedRef, same epoch, DIFFERENT newCommitment
  const rivalNew = enrol('attacker/replacement').commitment;
  const res2 = recoverWithGuardians({
    attestations: bundle(['guardian-cai', 'guardian-dee', 'guardian-eli'], { ...CLAIM, newCommitment: rivalNew }),
    set, recoveryDescriptor: DESC, epoch: EPOCH, issuer, ceremony,
  });
  assert(!res2.ok && res2.reason === 'contested-recovery', `got ${res2.reason}`);
  // re-issuance is FROZEN — even the first authorization no longer reissues
  const rec = issuer.reissue(auth1.authorization, ceremony, 't1');
  assert(!rec.ok && rec.reason === 'contested-recovery', `got ${rec.reason}`);
  // nothing reissued: issuer state untouched
  assert(issuer.state.commitments.get(OLD) === 'live', 'old still live');
  assert(!issuer.state.commitments.has(NEW) && !issuer.state.commitments.has(rivalNew), 'no new commitment admitted');
  assert(issuer.state.events.length === 0, 'no issuer events written');
});

test('G10 cross-context guardian nullifiers unlinkable (§6.6)', () => {
  const descB = { ...DESC, contextAuthority: 'authority:recovery-governance-b', contextPolicy: 'policy:recovery-b/1' };
  const a1 = attest('guardian-ana', CLAIM);
  const a2 = attest('guardian-ana', { ...CLAIM, recoveryDescriptor: descB });
  assert(descriptorDigest(DESC) !== descriptorDigest(descB), 'two distinct recovery contexts');
  assert(a1.guardianNullifier !== a2.guardianNullifier, 'same guardian, two contexts → unrelated nullifiers');
  // and across epochs within one context (§22.2: epoch is part of the seat scope)
  const a3 = attest('guardian-ana', { ...CLAIM, epoch: 'guardian-epoch-2' });
  assert(a1.guardianNullifier !== a3.guardianNullifier, 'epoch rollover rotates the seat nullifier');
  // determinism within one context+epoch (the seat is ONE per human there — §6.5)
  const d = descriptorDigest(DESC);
  assert(a1.guardianNullifier === nullifier(enrol('guardian-ana').secret, 'guardian/' + d + '/' + EPOCH), 'seat nullifier deterministic in context');
});

test('G11 candidates demo: VRC counterparties emerge as anchored candidates; edgeless member has none', () => {
  const community = 'community:harbour';
  const humans = ['guardian-ana', 'guardian-bo', 'guardian-cai', 'guardian-dee'];
  const nodes = humans.map((h) => joinCommunity(h, community));
  const [ana, bo, cai, dee] = nodes;
  const members = roster(nodes);
  const graph = new TrustGraph();
  assert(dreamCycleTurn(members, graph, ana, bo, 'salt-1', true, true).grew, 'edge ana-bo forms');
  assert(dreamCycleTurn(members, graph, ana, cai, 'salt-2', true, true).grew, 'edge ana-cai forms');
  const registry = anchoredRegistry(); // anchors the same humanIds → same rt 01 commitments
  const cands = candidateGuardians(ana, graph, members, registry);
  assert(cands.length === 2, `ana has 2 candidates, got ${cands.length}`);
  const memberIds = new Set(cands.map((c) => c.member));
  assert(memberIds.has(bo.member) && memberIds.has(cai.member), 'candidates are exactly the VRC counterparties');
  for (const c of cands) assert(registry.has(c.commitment), 'every candidate is personhood-anchored');
  assert(candidateGuardians(dee, graph, members, registry).length === 0, 'edgeless member has no candidates');
  // the synergy closed: the candidate list feeds straight into a committed set
  const set = commitGuardianSet('guardian-ana', cands.map((c) => c.humanId), 2, DESC, EPOCH, registry);
  assert(set.ok && set.n === 2 && set.t === 2, 'graph-derived guardian set commits');
});

test('G12 clock validator fires on an unbounded guardian epoch', () => {
  const good = validateGuardianClocks(GUARDIAN_CLOCKS);
  assert(good.ok, `canonical row must validate: ${good.failures.join(';')}`);
  const bad = validateGuardianClocks([{ ...GUARDIAN_CLOCKS[0], bound: 'unbounded' }]);
  assert(!bad.ok && bad.failures.includes('unbounded-clock:guardian-attestation-epoch'), `got ${bad.failures.join(';')}`);
  const lifelong = validateGuardianClocks([{ ...GUARDIAN_CLOCKS[0], bound: 'permanent guardianship' }]);
  assert(!lifelong.ok, 'a lifelong guardian is the §22.2 implicit default, refused');
});

// --- report ------------------------------------------------------------------
let pass = 0;
for (const r of results) {
  if (r.ok) {
    pass += 1;
    console.log(`  ok  ${r.name}`);
  } else {
    console.log(` FAIL ${r.name}\n      ${r.err}`);
  }
}
console.log(`guardian-recovery: ${pass}/${results.length} pass`);
if (pass !== results.length) process.exit(1);
