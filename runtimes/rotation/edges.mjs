// Edge re-key under rotation — X5 M5, demonstrated over runtime 07.
//
// Rotation changes what a standing-VRC counterparty sees. Two HONEST options,
// per X5 pattern 4 — a profile MUST pick per edge type and state it; silent
// continuity is a silent context expansion (§6.7):
//
//   reformEdge   — the old edge dies with the old epoch key; trust is
//                  re-established by a NEW encounter. Costly but leak-free:
//                  nothing attributable to the rotated member is shared
//                  between the old and new edge.
//   continueEdge — a bridging proof INSIDE the edge's own context re-keys the
//                  edge. The counterparty learns "same enrolment, new key" —
//                  a cross-epoch link, tolerable ONLY within the edge's
//                  governed bilateral context (§6.5), never exportable (§6.6).
//                  Modelled as an explicit disclosure record the pair holds;
//                  the shared graph never carries the bridge.

import { enrol, nullifier, H } from '../01-uniqueness-nullifier/src/nullifier.mjs';
import { encounter, dreamCycleTurn } from '../07-trust-graph-formation/src/trust-graph.mjs';
import { deriveEpochSecret } from './rotation.mjs';

export const DOMAIN_BRIDGE = 'dtg-zkp/edge-bridge/v0';

// An epoch-aware community member: rt 07's node shape, with the in-community
// pseudonym (M-DID) taken over the DERIVED epoch secret. rt 07's rdid() reads
// node.secret, so R-DIDs rotate with the epoch automatically.
export function epochNode(humanId, community, epochId) {
  const id = enrol(humanId); // personhood anchor (rt 01) — master secret
  const secret = deriveEpochSecret(id.secret, epochId);
  const member = nullifier(secret, community);
  return { humanId, community, epochId, secret, commitment: id.commitment, member };
}

// Form a VRC edge via rt 07's full dream-agent cycle (Mage proposes, Swordsman
// proves). Returns the signed edge plus the shared matching compression — the
// value ONLY the two parties can derive, which is what scopes the bridge.
export function formEdge(members, graph, nodeA, nodeB, salt) {
  const shared = encounter(nodeA, nodeB, salt);
  const verdict = dreamCycleTurn(members, graph, nodeA, nodeB, salt, true, true);
  return { ...verdict, shared };
}

// The linkable value set of a signed edge as an outside observer sees it.
export function edgeValues(edge) {
  return new Set([edge.a, edge.b, edge.vrc]);
}

// --- option (a): re-formation ------------------------------------------------
// The old edge dies (its endpoint key is retired with the epoch); a NEW
// encounter — new salt, new consent — forms a fresh edge. No bridge exists:
// old and new edge share no value attributable to the rotated member (only the
// counterparty's own unrotated member id persists, which is the counterparty's
// identity, not a link between the rotator's epochs).
export function reformEdge({ members, graph, rotatedNode, counterparty, salt }) {
  members.set(rotatedNode.member, rotatedNode);
  const verdict = dreamCycleTurn(members, graph, rotatedNode, counterparty, salt, true, true);
  return { oldEdgeDead: true, newEdge: verdict.signed ? verdict.edge : null, verdict };
}

// --- option (b): continuity --------------------------------------------------
// A bridging proof inside the edge's context: "the new key descends from the
// same enrolment behind the old edge." The bridge value is scoped by the
// edge's shared matching compression — a value derivable ONLY by the two
// parties (rt 07's encounter discipline) — so no out-of-context observer can
// compute or verify it (§6.6). The disclosure is made EXPLICIT as a record in
// the pair's private edge context (§6.5 in-context linkage), and the shared
// graph receives only an ordinary new edge.
export function continueEdge({ members, graph, edgeContext, oldNode, rotatedNode, counterparty, shared, salt }) {
  members.set(rotatedNode.member, rotatedNode);
  const bridge = H(DOMAIN_BRIDGE, shared, oldNode.member, rotatedNode.member);
  const disclosureRecord = {
    scope: 'edge-context', // §6.5: intentional linkage WITHIN this edge only
    disclosure: 'same-enrolment-new-key',
    oldMember: oldNode.member,
    newMember: rotatedNode.member,
    counterparty: counterparty.member,
    bridge,
  };
  edgeContext.records.push(disclosureRecord); // held by the pair, not the graph
  const verdict = dreamCycleTurn(members, graph, rotatedNode, counterparty, salt, true, true);
  return { bridge, disclosureRecord, newEdge: verdict.signed ? verdict.edge : null, verdict };
}

// What an OUT-OF-CONTEXT observer sees: the shared graph's edges, nothing
// else. R9 asserts this view carries no bridge and no continuity disclosure.
export function outsideView(graph) {
  return JSON.stringify({ edges: graph.edges });
}

// Model-level negative for §6.6: an observer holding only public edge values
// (members, vrc) cannot reconstruct the bridge — every public substitution for
// the shared compression yields a different value. Returns true if the bridge
// is NOT derivable from the given public values.
export function bridgeUnderivable(bridge, publicValues, oldMember, newMember) {
  return publicValues.every(
    (v) => H(DOMAIN_BRIDGE, v, oldMember, newMember) !== bridge
  );
}
