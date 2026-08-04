// Trust-graph synergy (X9's agentprivacy angle) — the graph the person already
// built IS the guardian candidate set.
//
// Standing VRC counterparties (rt 07 edges) are personhood-checkable
// (community-anchored construction: every rt 07 node is a personhood-anchored
// M-DID), have proven-collision history (the encounter that formed the edge),
// and their edges are exactly the relationships a guardian claim rides on.
// Edge formation becomes guardianship substrate: recovery bootstraps from
// relationships, not from re-enrolment.
//
// A guardian is a witness (VWC seat) whose authority is over RECOVERY, never
// over EDGES — the seat's separation carried up one level: nothing here can
// mint or touch an edge; it only READS the graph rt 07 already signed.
//
// Small and demonstrative by design. rt 07 is imported unchanged (READ-ONLY
// dependency — lab rule; see NOTES.md).

// Candidate guardians for a member: its VRC counterparties, filtered to those
// whose personhood anchor is admitted in the accredited set. The candidate
// list is the HOLDER's own view (the holder knows their counterparties); no
// new disclosure crosses any verifier boundary here — selection metadata only
// becomes the social-graph disclosure X9 names once a set is COMMITTED, and
// the set commitment (guardians.mjs) is what hides it.
export function candidateGuardians(node, graph, members, personhoodRegistry) {
  const out = [];
  for (const m of graph.neighbours(node.member)) {
    const counterparty = members.get(m);
    if (!counterparty) continue; // not a roster member — cannot be checked
    if (!personhoodRegistry.has(counterparty.commitment)) continue; // not anchored — not a candidate
    out.push({
      member: m, // the counterparty's M-DID in this community
      humanId: counterparty.humanId, // holder-side knowledge (they met this person)
      commitment: counterparty.commitment, // the rt 01 personhood anchor the set commits over
    });
  }
  return out;
}
