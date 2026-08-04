// The witness seat — VWC (Verifiable Witness Credential) on the dream cycle.
//
// Runtime 07 grows the trust graph in two seats: the Mage proposes the smallest
// edge, the Swordsman proves it across the Gap. The cred-spec provides a third
// seat the cycle didn't hold yet: a WITNESS — a registry-anchored third party
// whose signed attestation says the collision OCCURRED, bound to a §15.2
// canonical transcript. The witness sees THAT a meeting happened, never what it
// meant: it receives the collision's public commitment, never the shared
// encounter secret.
//
// Seat discipline (VWC-witness-seat exploration + decision doc §7.3/§17/§19):
//   - the witness attests, it does not authorize: a witnessed edge carries
//     independent corroboration; an unwitnessed edge forms exactly as rt07
//     forms it today. Optional evidence, never a gate.
//   - transcript-bound (§15): a witness statement from another session/context
//     must not transplant — the attestation binds transcriptDigest over the
//     full canonical transcript, not a bare nonce.
//   - the witness is itself personhood-anchored (rt01 enrol -> rt07
//     joinCommunity): an unanchored "witness" is not a witness.
//
// ADDITIVE: runtime 07 is a byte-stability dependency of the fixtures suite.
// This module IMPORTS rt07 and calls Swordsman.prove UNCHANGED; it never
// modifies it. Same for rt01 (H, enrolment) and canonical (§15.2 transcript).
// Zero-dep, offline, deterministic — like the rest of the lab.

import { joinCommunity, Swordsman } from '../07-trust-graph-formation/src/trust-graph.mjs';
import { H } from '../01-uniqueness-nullifier/src/nullifier.mjs';
import { transcriptDigest, canonicalize } from '../canonical/canonical.mjs';

const DOMAIN_WITNESS_KEY = 'dtg-zkp/vwc-witness-key/v0';
const DOMAIN_WITNESS_SIG = 'dtg-zkp/vwc-witness-sig/v0';

// What a witness is ALLOWED to receive about an encounter. Anything else —
// above all the shared "matching compression" secret — is a view violation and
// is refused structurally, before any attestation is formed.
const WITNESS_VIEW_ALLOWED = new Set(['collisionCommitment', 'rdidA', 'rdidB', 'transcript']);

// --- the witness ------------------------------------------------------------
// A witness is itself a personhood-anchored member of a community: rt01 enrols
// the human, rt07's joinCommunity mints the M-DID pseudonym. Its signing key is
// derived from its own identity secret (model key — the circuit swaps a real
// signature scheme; the binding argument is identical).
// `view` records everything this witness has ever been shown — the W5 property
// scans it: no derivable trace of any encounter secret may appear there.
export function makeWitness(humanId, community) {
  const node = joinCommunity(humanId, community); // rt01 enrol + rt07 M-DID
  const key = H(DOMAIN_WITNESS_KEY, node.secret, community);
  return { node, key, community, view: [] };
}

// The witness registry: member -> { member, key }. The model's stand-in for
// "registry-anchored": a verifier resolves witnessMembershipRef here. Holding
// the key in the registry is the same modelling honesty as rt07's `roster`
// holding nodes — the reference model verifies MAC-style; the circuit uses a
// public verification key.
export function witnessRoster(witnesses) {
  const m = new Map();
  for (const w of witnesses) m.set(w.node.member, { member: w.node.member, key: w.key });
  return m;
}

// --- attestation ------------------------------------------------------------
// The witness signs: this collision commitment, between these two fresh R-DIDs,
// under this canonical transcript, in its own registry-anchored name.
//
// Structural W5 guard, three layers:
//   1. key whitelist — a request carrying ANY field beyond the four public ones
//      (e.g. `shared`, `secret`, `salt`) throws 'witness-view-violation:<key>'
//      before the witness's view is touched;
//   2. the transcript is schema-validated by canonical's transcriptDigest —
//      an unknown field smuggled into the transcript throws invalid-transcript;
//   3. everything that DOES reach the witness is appended to witness.view, so
//      the test suite can scan the witness's entire lifetime view for secrets.
export function attestEncounter(witness, request) {
  for (const k of Object.keys(request)) {
    if (!WITNESS_VIEW_ALLOWED.has(k)) {
      throw new Error(`witness-view-violation:${k}`);
    }
  }
  const { collisionCommitment, rdidA, rdidB, transcript } = request;
  const td = transcriptDigest(transcript); // §15.2 — validates + digests; throws on smuggled fields
  witness.view.push({ collisionCommitment, rdidA, rdidB, transcript });
  const body = {
    collisionCommitment, // the candidate's public VRC commitment — NOT the shared secret
    rdidA,
    rdidB,
    transcriptDigest: td, // §15 canonical transcript, not a bare nonce
    witnessMembershipRef: witness.node.member, // the witness's own personhood anchor
  };
  const sig = H(DOMAIN_WITNESS_SIG, witness.key, canonicalize(body));
  return { ...body, sig };
}

// --- verification -----------------------------------------------------------
// Independently re-verifiable: anyone holding the witness registry, the
// transcript, and the edge's public parts can re-run this later (W1). Checks in
// order; each failure is rejected BY NAME (fixture-register v3 candidates):
//   witness-not-personhood-anchored  — ref does not resolve in the registry
//   witness-signature-invalid        — sig does not verify over the canonical body
//   witness-transcript-mismatch      — attestation made under a different session/
//                                      context (§15.1 replay discipline for witnesses)
//   witness-rdid-mismatch            — attestation names different R-DIDs than the
//                                      candidate's fresh per-counterparty ones
//   witness-collision-mismatch       — attestation binds a different collision
//                                      commitment than the edge's recomputed VRC
// rdidA/rdidB/collisionCommitment are checked when provided (edge formation
// always provides them; a later verifier checks what it retained).
export function verifyAttestation(attestation, { transcript, rdidA, rdidB, collisionCommitment, witnesses }) {
  const fail = (reason) => ({ ok: false, reason });
  const w = witnesses.get(attestation.witnessMembershipRef);
  if (!w) return fail('witness-not-personhood-anchored');
  const { sig, ...body } = attestation;
  if (H(DOMAIN_WITNESS_SIG, w.key, canonicalize(body)) !== sig) {
    return fail('witness-signature-invalid');
  }
  if (transcriptDigest(transcript) !== attestation.transcriptDigest) {
    return fail('witness-transcript-mismatch');
  }
  if (rdidA !== undefined && (attestation.rdidA !== rdidA || attestation.rdidB !== rdidB)) {
    return fail('witness-rdid-mismatch');
  }
  if (collisionCommitment !== undefined && attestation.collisionCommitment !== collisionCommitment) {
    return fail('witness-collision-mismatch');
  }
  return { ok: true };
}

// --- the witnessed turn -----------------------------------------------------
// Wrapper around rt07's cycle. The Swordsman proves the candidate UNCHANGED —
// personhood, no self-edge, bilateral consent, fresh R-DIDs, the Gap recompute,
// idempotence — imported and called as-is. Only THEN, if an attestation is
// present, is it verified and recorded on the edge.
//
// Separation (W4): the attestation is never consulted before, or instead of,
// the Swordsman's verdict. A witness holding a perfectly valid attestation
// cannot move an unconsented, unproposed, or forged candidate past the
// Swordsman — witness ≠ consent ≠ proposal. And absence of a witness changes
// nothing (W2): the unwitnessed path is byte-for-byte rt07's path.
export function proveWitnessedEdge({ candidate, attestation, transcript, graph, members, witnesses }) {
  const verdict = Swordsman(members, graph).prove(candidate); // rt07, unchanged
  if (!verdict.signed) return { grew: false, ...verdict };

  if (attestation === undefined) {
    // unwitnessed: forms exactly as rt07 forms it today
    graph.addEdge(verdict.edge);
    return { grew: true, witnessed: false, ...verdict };
  }

  const v = verifyAttestation(attestation, {
    transcript,
    rdidA: candidate.rdidA,
    rdidB: candidate.rdidB,
    collisionCommitment: verdict.edge.vrc,
    witnesses: witnesses ?? new Map(),
  });
  if (!v.ok) return { grew: false, signed: false, reason: v.reason };

  const edge = { ...verdict.edge, attestation }; // the witnessed edge carries its corroboration
  graph.addEdge(edge);
  return { grew: true, witnessed: true, signed: true, edge };
}
