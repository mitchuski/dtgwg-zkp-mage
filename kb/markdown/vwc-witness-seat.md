---
title: "VWC — Witness Seat"
section: "explorations"
source: "explorations/VWC-witness-seat.md"
built_from_commitish: "working-tree"
order: 49
---
# VWC — the witness seat on the dream cycle

*A third party attesting the collision: the Verifiable Witness Credential joins runtime 07 as the third
seat — transcript-bound, optional, and never a substitute for consent.*

**Register:** runtime 07 "next steps" item 1 (not an O-item) · leverage 🟠 · **Ladder:** **BUILT
2026-07-18** — [Lab — witness-seat](lab-witness-seat.md) 15/15 (W1–W7 incl. the separation
property enforced attestation-after-Swordsman, the never-sees-the-secret triple guard, and rt07's
11/11 as an executable regression gate). The oldest open thread of the 07-16 dream cycle, closed.
Same-VTC question + weighted propagation stay parked
**Anchor (cred-spec):** **VWC** (witness annotation credential) · `taskContext` · outcome-interpretability
rule.
**Anchor (decision doc):** §15 canonical transcript (a bare nonce is insufficient) · §7.3/§17 separation
discipline (a witness attests, it does not authorize) · §19 observer analysis (the witness is an observer).

---

## What it is

Runtime 07 grows the trust graph through the fold: Mage proposes the smallest edge, Swordsman proves
personhood + consent + freshness + non-collusion across the Gap. The cred-spec provides a third role the
cycle doesn't seat yet: a **VWC** — a third party's signed attestation that the encounter (the collision)
occurred, bound to a `taskContext`.

The seat matters because it upgrades edge *evidence* without touching edge *admissibility*: a witnessed
edge carries independent corroboration of the collision; an unwitnessed edge still forms on bilateral
consent alone. That separation mirrors the decision doc's discipline exactly — the witness contributes to
the assurance side, never replaces a required proof, and must never become a hidden authority.

## Design

**The witness object:**

```
attestation = sign(witness_key, {
  collision_commitment,    // H over the encounter's public parts — witness never learns the shared secret
  rdid_a, rdid_b,          // the fresh per-counterparty R-DIDs on the candidate edge
  transcript_digest,       // §15 canonical transcript, NOT a bare nonce: protocol/profile versions,
                           // context descriptor, purpose, scope, session, epoch — canonically encoded
  witness_membership_ref   // the witness's own personhood anchor (M-DID in a VTC, via rt 01)
})
```

**Swordsman changes:** accepts an *optional* witness attestation on a candidate edge; verifies the witness
signature, the witness's own personhood anchor, and that `transcript_digest` matches the transcript the
edge is forming under (a witness statement from another session/context must not transplant — §15.1 replay
discipline applied to witnesses).

**Properties to add to the 11 (target 15/15):**
- **W1** — a witnessed edge carries the witness attestation; verifiable independently later.
- **W2** — an unwitnessed edge still forms (the witness is optional evidence, not a gate).
- **W3** — a forged or transcript-mismatched witness attestation is rejected by name.
- **W4** — a witness cannot mint an edge alone: witness ≠ consent ≠ proposal. (The separation property —
  the witness seat must not collapse into a third signing authority.)

## Boundary notes (the paired records, drafted)

**Assurance boundary:** a verifier of a witnessed edge may rely on: a registry-anchored third party signed
a statement binding this collision commitment to this transcript. It must NOT infer: that the collision's
*content* was as claimed (the witness saw an encounter, not the shared secret); that the witness was
honest; that a witnessed edge is more *consensual* than an unwitnessed one. Accountability: the witness for
its attestation; the context authority for who may witness.

**Disclosure boundary:** the witness is an **observer** (§19's list gains a row) — it learns that two
R-DIDs collided at a time, under a context. It must not learn the shared secret or either party's M-DID.
Witness *patterns* (who witnesses whom, how often) are themselves correlatable — a busy witness becomes a
traffic-analysis hub; retention rules for witness logs belong in the profile (§20 minimisation applies).

## The dream-cycle reading

The fold gains its third seat: 🧙 proposes, ⚔️ proves, and the witness stands at the edge of the Gap —
seeing that a meeting happened, never what it meant. `witnessed_by` was already in the spellweb grammar
(SPELLWEB spec §6B); this makes it mechanical, with the same honesty the rest of the cycle carries: the
witness adds evidence, the Gap still decides.

## Build plan

- **M1 —** implement the witness channel in rt 07 (`src/trust-graph.mjs` + 4 new properties), reusing
  rt 01 for the witness's own personhood anchor. Zero-dep, offline, like the rest.
- **M2 —** upgrade `taskContext` handling to a §15-shaped canonical transcript digest (shared with O5's
  freshness harness — same mechanism, one implementation).
- **M3 —** boundary records (the two drafts above, completed in Appendix-B format).
- **M4 —** feed rt 07's NOTES candidate-note 3 upstream: "a VWC slots straight in" now has a runnable
  reference + a separation property (W4) worth stating normatively.

## Open questions

- Must a witness hold a VMC in the *same* VTC as the parties, or is any registry-anchored witness
  acceptable? (Same-community witnessing is stronger for the community-anchored construction but shrinks
  the witness pool and increases intra-community traffic analysis.)
- Does a witnessed edge earn different weight in propagation? Tempting, but weight semantics belong to
  trust-task protocols, not the formation layer — park it, note it.
