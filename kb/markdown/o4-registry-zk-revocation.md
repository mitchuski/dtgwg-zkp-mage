---
title: "O4 — Registry ZK Revocation"
section: "explorations"
source: "explorations/O4-registry-zk-revocation.md"
built_from_commitish: "working-tree"
order: 44
---
# O4 — Registry-ZK interaction and revocation

*How a zero-knowledge proof reads a trust registry: snapshot semantics, issuer-set membership, revocation,
and the edge-admissibility rule — the deferred interaction, by name.*

**Register:** O4 · leverage 🟠 · **Ladder:** design doc (+ rt 07's edge-admissibility rule, 11/11)
**Anchor (cred-spec):** trust registry (issuer/role/revocation authority) · "registry-ZK interactions
deferred to future work."
**Anchor (decision doc):** **PR-ISS** (§12) · §22 lifecycle clocks · §12.4 registry and snapshot semantics.

---

## What the spec defers and the decision doc structures

The cred-spec names the trust registry as the governance object (acceptable issuers, roles, revocations)
and defers how a ZK proof interacts with it. The decision doc supplies the missing requirements without
picking a construction:

- **PR-ISS is a snapshot statement** (§12.4): issuer qualification is evaluated against "a named registry,
  set commitment, or governance snapshot with explicit effective time, cache rules, update semantics, and
  failure behaviour." Not "the registry" in the abstract — a versioned root at a time.
- **Issuer concealment is profile-specific** (§12.3): explicit disclosure, concealment within a named set,
  coarse issuer class, or threshold/multi-issuer assurance — chosen per relying purpose + correlation
  analysis, never hard-coded.
- **Registry traffic is a disclosure surface** (§12.4, §19): status lookups and network patterns can reveal
  the issuer or holder even when the proof reveals nothing — the interaction design carries its own
  disclosure-boundary record.
- **Lifecycle clocks are separate** (§22.1): status freshness ≠ attestation validity ≠ nullifier epoch ≠
  enrolment-root cryptoperiod. "Registry snapshot no older than 24 hours" (Appendix B) is the shape of a
  conformant freshness rule.

## The design sketch

**Registry as epoch-rooted commitments.** The registry authority publishes, per epoch, signed roots over its
governed sets — accepted-issuer set, membership set(s), revocation set — each with effective time and epoch
policy. Proofs are made **against a named root**, and the verifier's relying policy states the maximum
acceptable root age.

**Membership** = the shared Poseidon-Merkle gadget (one circuit with O2): `commitment ∈ root(epoch)`.

**Revocation** — three candidate patterns, to be selected through the §25 gate:
1. **Short epochs, positive membership only** — the set is re-rooted often enough that removal *is*
   revocation. Simplest; cost = re-issuance of paths each epoch.
2. **Accumulator / vector-commitment non-membership** — prove absence from the revocation set at a named
   root. Stronger freshness; heavier circuits.
3. **Privacy-preserving status mechanism** (§18.2's "status reference" row) — bounded-cache status checks
   outside the circuit, with the lookup pattern itself minimised (batching, coarse timing — §20).

**The edge-admissibility rule** (runtime 07's contribution): registry interaction is not only *reading* —
it governs when the graph may *grow*. Runtime 07's Swordsman checks (both endpoints personhood-anchored in
the registry-governed set, mutual consent, fresh R-DIDs, non-collusion recompute) are a candidate profile
for "when may an edge be minted against a registry snapshot" — the write-side of the deferred interaction.

## What exists

- rt 03 STUB (set-membership over the accredited set) + rt 07 (11/11, the admissibility rule).
- The coherence reconciliation: "accredited set" = the cryptographic Merkle object; **trust registry** = the
  governance object. The proof's set-membership is a ZK *view* of the registry's authorized list.
- §12.5's multi-issuer aggregation note — independent honest issuers multiply confidence — gives the
  registry a purpose beyond list-keeping; composable with concealment-within-a-set.

## Build plan

- **M1 — data model note:** epoch-rooted registry (roots, effective times, epoch policy, failure behaviour)
  written as a short profile the Credentials TF can review — this is the co-authored piece (§27.3).
- **M2 — rt 03 reference model:** set-membership against a named epoch root + negative tests (stale root
  rejected; revoked issuer rejected; inconsistent snapshots rejected — §26.1).
- **M3 — revocation selection:** cost out patterns 1–3 against the §25 evaluation list (refresh cost,
  offline verification, mobile viability); recommend one per profile.
- **M4 — circuit:** the shared gadget instantiated for PR-ISS; edge-admissibility statement ported once
  01/03 land.

## Upstream surface

- The one deliverable the cred-spec *asks for by name*. Frame as joint work: our TF specifies the proof
  side; the Credentials TF owns registry governance/institutional legitimacy (§27.3 boundary).
- E3 (trust-registry terminology) is already staged; this exploration is its continuation into mechanism.

## Open questions

- Who operates nullifier/state storage when a context spans a governed verifier *set* (§13.5) — the
  registry, a verifier-set operator, or per-verifier state with reconciliation?
- Does revocation of an *issuer* retroactively invalidate proofs made against roots where it was accepted?
  (§10.6 says reliance expires on accreditation change — propagation semantics needed; ties to the
  redress matrix §23 row 2.)
