# Witness seat — notes

*The third seat on the dream cycle: a VWC (Verifiable Witness Credential) attesting the
collision, transcript-bound, optional, and never a substitute for consent.*

Source design: `~/dtgwg-cred-spec-main_mage/explorations/VWC-witness-seat.md`. This build
closes the oldest open thread in the lab — runtime 07's "next steps" item 1 / candidate-note 3
("a VWC slots straight in"), flagged in the 2026-07-16 dream-cycle chronicle.

## What it demonstrates

Runtime 07 grows the trust graph in two seats: 🧙 the Mage proposes the smallest edge, ⚔️ the
Swordsman proves it across the Gap. This runtime seats the third role the cred-spec provides
but the cycle didn't hold: a **witness** — a registry-anchored third party who sees THAT a
meeting happened, never what it meant. The witness receives only the collision's public
commitment (the candidate's VRC commitment), the two fresh R-DIDs, and the §15.2 canonical
transcript; it signs an attestation binding those four together in its own
personhood-anchored name.

The seat upgrades edge **evidence** without touching edge **admissibility**:

- a witnessed edge carries independent corroboration of the collision, re-verifiable later
  from the stored edge + the retained transcript + the witness registry alone (W1);
- an unwitnessed edge forms exactly as rt07 forms it today — the unwitnessed path is
  byte-for-byte rt07's path (W2);
- **W4 is the separation property**: the attestation is never consulted before, or instead
  of, the Swordsman's verdict. A witness holding a perfectly valid attestation cannot move an
  unconsented candidate past the consent gate, and cannot forge a proposal (it never holds
  the parties' secrets, so it cannot mint their fresh per-counterparty R-DIDs). Witness ≠
  consent ≠ proposal — the seat must not collapse into a third signing authority. This is the
  same separation discipline X9's guardian doc states one level up (guardians attest
  recovery, they do not authorize identity), inherited here at the edge-formation level.

## Boundary notes (recap from the design doc)

**Assurance boundary** — a verifier of a witnessed edge may rely on: *a registry-anchored
third party signed a statement binding this collision commitment to this transcript.* It
must NOT infer: that the collision's *content* was as claimed (the witness saw an encounter,
not the shared secret); that the witness was honest; that a witnessed edge is more
*consensual* than an unwitnessed one. Accountability: the witness for its attestation; the
context authority for who may witness.

**Disclosure boundary** — the witness is a **§19 observer** (the observer list gains a row):
it learns that two R-DIDs collided at a time, under a context. It must not learn the shared
secret or either party's M-DID — enforced structurally here (W5: view whitelist + canonical
transcript schema + lifetime-view scan). Witness *patterns* (who witnesses whom, how often)
are themselves correlatable — a busy witness becomes a traffic-analysis hub; retention rules
for witness logs belong in the profile (§20 minimisation applies).

## Named failure codes (fixture-register v3 candidates)

Checked in this order; append-only candidates for `../fixtures/reasons.mjs` v3:

| code | meaning |
|---|---|
| `witness-not-personhood-anchored` | membership ref does not resolve in the witness registry (W6) |
| `witness-signature-invalid` | signature does not verify over the canonicalized attestation body (W3) |
| `witness-transcript-mismatch` | attestation made under a different session/context — §15.1 replay discipline applied to witnesses (W3) |
| `witness-rdid-mismatch` | attestation names different R-DIDs than the candidate's fresh per-counterparty ones (W3) |
| `witness-collision-mismatch` | attestation binds a different collision commitment than the edge's recomputed VRC |
| `witness-view-violation:<key>` | thrown (not returned): an encounter secret was offered to the witness — refused before the view is touched (W5) |

Design note: an *invalid* attestation rejects the witnessed-edge operation by name (an
active forgery is a mirage, like a forged VRC commitment — the Swordsman's posture), while an
*absent* attestation changes nothing (W2). Absence ≠ forgery.

## The additive refinement

The exploration's M1 wording ("implement the witness channel in rt 07") is refined to
**own-directory-importing**: runtime 07 is a byte-stability dependency of the fixtures suite
(its rejection strings are pinned in the reasons register, byte-for-byte), so this build
lives in `runtimes/witness-seat/`, imports rt07's `joinCommunity` / `Swordsman` / `Mage` /
`encounter` and calls `Swordsman.prove` UNCHANGED — the lab's established precedent
(show-composition, quiet-presentation, guardian-recovery all wrap rather than edit). W7 makes
the byte-stability contract executable: rt07's own `test.mjs` runs in a subprocess and must
still report 11/11.

Other deliberate model choices:

- **Signature model**: H-based MAC-style signature (`H(domain, key, canonicalize(body))`),
  same modelling honesty as rt07's `roster` holding node secrets — the witness registry holds
  the verification key; the circuit swaps a real signature scheme, the binding argument is
  identical.
- **Collision commitment** = the candidate's public VRC commitment (`claimedVrc`), which the
  wrapper cross-checks against the Swordsman's independently recomputed `vrc` — the witness
  binds to the recomputed value, never to the Mage's bare claim.
- **Transcript** = the shared `canonical/canonical.mjs` §15.2 implementation (the design
  doc's M2: one mechanism, shared with the freshness harness — a bare nonce is insufficient).

## Deferred (parked per the design doc)

- **Same-VTC-witness question**: must a witness hold a VMC in the *same* VTC as the parties,
  or is any registry-anchored witness acceptable? Same-community witnessing is stronger for
  the community-anchored construction but shrinks the witness pool and increases
  intra-community traffic analysis. (This build anchors the witness in a community via
  rt07's `joinCommunity` but does not require it to be the *parties'* community.)
- **Weighted propagation**: does a witnessed edge earn different weight? Weight semantics
  belong to trust-task protocols, not the formation layer — parked, noted.

## Pointers

- Design doc: `~/dtgwg-cred-spec-main_mage/explorations/VWC-witness-seat.md` (M1–M4; this
  build = M1 + M2, boundary recap above = M3 draft carried; M4 = the upstream candidate-note
  feed, now backed by a runnable reference + W4 stated as a property).
- Thread closed: rt07 `NOTES.md` "next steps" item 1 + candidate-note 3, flagged in the
  2026-07-16 dream-cycle chronicle.
- Decision doc anchors: §15/§15.1/§15.2 (canonical transcript, replay), §17.2/§7.3
  (separation discipline — attestation ≠ authority), §19 (observer analysis), §20
  (minimisation of witness logs).
- Tests: `node test.mjs` → 15/15 (W1–W7; W7 = rt07 regression subprocess).
