// Property tests for the witness seat (VWC on the dream cycle).
// Run: node test.mjs   — exits nonzero on any failure.
//
// W1-W4 are the design-doc properties (VWC-witness-seat exploration); W5-W7 are
// the seat's extensions: the witness's view stays secret-free, the witness must
// be personhood-anchored, and rt07's own 11-property suite is the regression
// gate (run unmodified, in a subprocess).

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  joinCommunity,
  encounter,
  Mage,
  TrustGraph,
  roster,
} from '../07-trust-graph-formation/src/trust-graph.mjs';
import { H } from '../01-uniqueness-nullifier/src/nullifier.mjs';
import { descriptorDigest } from '../canonical/canonical.mjs';
import {
  makeWitness,
  witnessRoster,
  attestEncounter,
  verifyAttestation,
  proveWitnessedEdge,
} from './witness.mjs';

let passed = 0;
let failed = 0;
function check(name, cond) {
  if (cond) {
    passed++;
    console.log(`  ok  ${name}`);
  } else {
    failed++;
    console.log(`  FAIL ${name}`);
  }
}

console.log('\nwitness-seat — the third seat on the dream cycle\n');

// --- fixed, deterministic fixtures -------------------------------------------

const VTC = 'vtc:alpha';
const nodeA = joinCommunity('human-1', VTC);
const nodeB = joinCommunity('human-2', VTC);
const members = roster([nodeA, nodeB]);

const witness = makeWitness('human-9', VTC); // the witness is itself a member
const witnesses = witnessRoster([witness]);

// §15.2 canonical transcript — the full field set, not a bare nonce.
const descriptor = {
  protocol: 'dtg-zkp/0.1',
  profile: 'mlp/1',
  contextAuthority: 'authority:alpha',
  contextPolicy: 'policy:alpha/1',
  purpose: 'purpose:trust-edge-formation',
  scope: 'scope:vtc-alpha',
  verifierSet: 'verifiers:vtc-alpha',
  epoch: 'epoch:2026-Q3',
  epochPolicy: 'epoch-policy:quarterly',
  nullifierVersion: 'dtg-zkp/nullifier/v0',
  retentionPolicy: 'retention:minimal',
};
function makeTranscript(sessionId) {
  return {
    protocol: 'dtg-zkp/0.1',
    profile: 'mlp/1',
    verifier: 'verifier:swordsman',
    contextDescriptorDigest: descriptorDigest(descriptor),
    purpose: 'purpose:trust-edge-formation',
    scope: 'scope:vtc-alpha',
    challenge: `challenge:${sessionId}`, // necessary, NOT sufficient (§15.2)
    sessionId,
    requestedPredicates: ['PR-FRE', 'PR-PHC'],
    policyRequirements: 'policy:alpha/1',
    expiry: 'epoch:2026-Q3/end',
    snapshotRequirements: 'snapshot:epoch-2026-Q3',
    encodingVersion: 'dtg-zkp/canonical/v0',
  };
}

// One full witnessed formation, reused across properties.
function witnessedSetup(salt, sessionId) {
  const shared = encounter(nodeA, nodeB, salt);
  const candidate = Mage.propose(nodeA, nodeB, shared, true, true);
  const transcript = makeTranscript(sessionId);
  const attestation = attestEncounter(witness, {
    collisionCommitment: candidate.claimedVrc, // public commitment only
    rdidA: candidate.rdidA,
    rdidB: candidate.rdidB,
    transcript,
  });
  return { shared, candidate, transcript, attestation };
}

// --- W1: a witnessed edge carries the attestation, re-verifiable later --------
{
  const g = new TrustGraph();
  const { candidate, transcript, attestation } = witnessedSetup('meet-w1', 'session-w1');
  const r = proveWitnessedEdge({ candidate, attestation, transcript, graph: g, members, witnesses });
  check('W1a a witnessed edge forms and carries the witness attestation',
    r.grew === true && r.witnessed === true && g.edges.length === 1 && g.edges[0].attestation === attestation);
  // later, independently: only the stored edge, the retained transcript, and the registry
  const stored = g.edges[0];
  const later = verifyAttestation(stored.attestation, {
    transcript,
    collisionCommitment: stored.vrc,
    witnesses,
  });
  check('W1b the stored attestation independently re-verifies later', later.ok === true);
}

// --- W2: an unwitnessed edge still forms (optional evidence, never a gate) ----
{
  const g = new TrustGraph();
  const { candidate, transcript } = witnessedSetup('meet-w2', 'session-w2');
  const r = proveWitnessedEdge({ candidate, transcript, graph: g, members, witnesses });
  check('W2 an unwitnessed edge forms exactly as rt07 forms it today',
    r.grew === true && r.witnessed === false && g.edges.length === 1 && g.edges[0].attestation === undefined);
}

// --- W3: forged / transplanted / mis-bound attestations rejected by name ------
{
  const g = new TrustGraph();
  const { candidate, transcript, attestation } = witnessedSetup('meet-w3', 'session-w3-A');

  const forged = { ...attestation, sig: H('forged', attestation.sig) };
  const r1 = proveWitnessedEdge({ candidate, attestation: forged, transcript, graph: g, members, witnesses });
  check("W3a a forged witness signature is rejected 'witness-signature-invalid'",
    r1.grew === false && r1.reason === 'witness-signature-invalid');

  // attested under session A, presented for session B — must not transplant (§15.1)
  const transcriptB = makeTranscript('session-w3-B');
  const r2 = proveWitnessedEdge({ candidate, attestation, transcript: transcriptB, graph: g, members, witnesses });
  check("W3b a transplanted attestation (session A -> session B) is rejected 'witness-transcript-mismatch'",
    r2.grew === false && r2.reason === 'witness-transcript-mismatch');

  // attestation naming different R-DIDs than the candidate's fresh ones
  const wrongRdids = attestEncounter(witness, {
    collisionCommitment: candidate.claimedVrc,
    rdidA: H('some-other-rdid-a'),
    rdidB: H('some-other-rdid-b'),
    transcript,
  });
  const r3 = proveWitnessedEdge({ candidate, attestation: wrongRdids, transcript, graph: g, members, witnesses });
  check("W3c an attestation over foreign R-DIDs is rejected 'witness-rdid-mismatch'",
    r3.grew === false && r3.reason === 'witness-rdid-mismatch');

  check('W3d every rejected attestation left the graph unchanged', g.edges.length === 0);
}

// --- W4: a witness cannot mint an edge alone (the separation property) --------
{
  const g = new TrustGraph();
  // a perfectly valid attestation exists, but consent is not bilateral
  const shared = encounter(nodeA, nodeB, 'meet-w4');
  const candidate = Mage.propose(nodeA, nodeB, shared, true, false); // B never consented
  const transcript = makeTranscript('session-w4');
  const attestation = attestEncounter(witness, {
    collisionCommitment: candidate.claimedVrc,
    rdidA: candidate.rdidA,
    rdidB: candidate.rdidB,
    transcript,
  });
  const r = proveWitnessedEdge({ candidate, attestation, transcript, graph: g, members, witnesses });
  check("W4a a valid witness cannot override missing consent ('unilateral-no-mutual-consent')",
    r.grew === false && r.reason === 'unilateral-no-mutual-consent' && g.edges.length === 0);

  // no Mage proposal at all: the witness forges a candidate itself — it cannot
  // mint the parties' fresh per-counterparty R-DIDs (it never holds their secrets)
  const selfMade = {
    a: nodeA.member,
    b: nodeB.member,
    rdidA: H('witness-guess-a'),
    rdidB: H('witness-guess-b'),
    shared,
    consentA: true,
    consentB: true,
    claimedVrc: candidate.claimedVrc,
  };
  const att2 = attestEncounter(witness, {
    collisionCommitment: selfMade.claimedVrc,
    rdidA: selfMade.rdidA,
    rdidB: selfMade.rdidB,
    transcript,
  });
  const r2 = proveWitnessedEdge({ candidate: selfMade, attestation: att2, transcript, graph: g, members, witnesses });
  check('W4b a witness-forged proposal never grows the graph (witness != consent != proposal)',
    r2.grew === false && r2.reason === 'r-did-mismatch' && g.edges.length === 0);
}

// --- W5: the witness never learns the secret ----------------------------------
{
  const w5witness = makeWitness('human-10', VTC); // fresh witness with an empty view
  const shared = encounter(nodeA, nodeB, 'meet-w5');
  const candidate = Mage.propose(nodeA, nodeB, shared, true, true);
  const transcript = makeTranscript('session-w5');

  // structural refusal: handing the witness the shared secret throws before any view/attestation
  let refused = false;
  try {
    attestEncounter(w5witness, {
      collisionCommitment: candidate.claimedVrc,
      rdidA: candidate.rdidA,
      rdidB: candidate.rdidB,
      transcript,
      shared, // the encounter secret — must never reach the witness
    });
  } catch (e) {
    refused = e.message === 'witness-view-violation:shared';
  }
  check('W5a the witness structurally refuses the shared secret (view violation, by name)',
    refused && w5witness.view.length === 0);

  // the transcript cannot smuggle it either: canonical schema rejects unknown fields
  let smuggleRefused = false;
  try {
    attestEncounter(w5witness, {
      collisionCommitment: candidate.claimedVrc,
      rdidA: candidate.rdidA,
      rdidB: candidate.rdidB,
      transcript: { ...transcript, sharedSecret: shared },
    });
  } catch (e) {
    smuggleRefused = e.message.startsWith('invalid-transcript:') && e.message.includes('unknown:sharedSecret');
  }
  check('W5b the transcript cannot smuggle the secret (canonical schema rejects it)',
    smuggleRefused && w5witness.view.length === 0);

  // full scan: the witness's entire lifetime view + the attestation it produced
  // contain no derivable trace of the secret material
  const attestation = attestEncounter(w5witness, {
    collisionCommitment: candidate.claimedVrc,
    rdidA: candidate.rdidA,
    rdidB: candidate.rdidB,
    transcript,
  });
  const witnessWorld = JSON.stringify({ view: w5witness.view, attestation });
  const secrets = [shared, nodeA.secret, nodeB.secret, 'meet-w5'];
  check("W5c the witness's entire view and attestation carry no trace of the encounter secret",
    w5witness.view.length === 1 && secrets.every((s) => !witnessWorld.includes(s)));
}

// --- W6: the witness must be personhood-anchored -------------------------------
{
  const g = new TrustGraph();
  const { candidate, transcript, attestation } = witnessedSetup('meet-w6', 'session-w6');

  // a real witness's attestation with the membership ref swapped off-registry
  const detached = { ...attestation, witnessMembershipRef: H('nobody') };
  const r1 = proveWitnessedEdge({ candidate, attestation: detached, transcript, graph: g, members, witnesses });
  check("W6a an off-registry membership ref is rejected 'witness-not-personhood-anchored'",
    r1.grew === false && r1.reason === 'witness-not-personhood-anchored');

  // a fully fabricated "witness": self-minted key, never enrolled, never joined
  const rogue = { node: { member: H('rogue-member') }, key: H('rogue-key'), community: VTC, view: [] };
  const rogueAtt = attestEncounter(rogue, {
    collisionCommitment: candidate.claimedVrc,
    rdidA: candidate.rdidA,
    rdidB: candidate.rdidB,
    transcript,
  });
  const r2 = proveWitnessedEdge({ candidate, attestation: rogueAtt, transcript, graph: g, members, witnesses });
  check('W6b a self-minted, unanchored witness is rejected (registry is the anchor)',
    r2.grew === false && r2.reason === 'witness-not-personhood-anchored' && g.edges.length === 0);
}

// --- W7: rt07's own 11 properties still hold (regression gate, unmodified) -----
{
  const rt07dir = fileURLToPath(new URL('../07-trust-graph-formation/', import.meta.url));
  const r = spawnSync(process.execPath, ['test.mjs'], { cwd: rt07dir, encoding: 'utf8' });
  const clean = (r.stdout ?? '').replace(/\x1b\[[0-9;]*m/g, '');
  check("W7 rt07's own suite passes 11/11, byte-untouched (subprocess)",
    r.status === 0 && /\b11 passed, 0 failed\b/.test(clean));
}

console.log(`\nwitness-seat: ${passed}/${passed + failed} pass\n`);
process.exit(failed === 0 ? 0 : 1);
