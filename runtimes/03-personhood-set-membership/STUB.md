# 03 — Personhood / accredited issuer — stub

**Predicate:** One-of-many (set-membership) proof that the issuer ∈ an accredited set, without revealing which issuer.

**Cred-spec anchor** ([`../CRED-SPEC-COHERENCE.md`](../CRED-SPEC-COHERENCE.md)): this is the ZK realization of the Credentials-Core-Spec's own example predicate — **"Holder has a valid VMC from a recognized VTC."** The "accredited set" is the **trust registry**'s authorized-issuer list (the recognized VTCs / PHC issuers); the Merkle root is a ZK view of it. Rides the spec's **community-anchored (VMC-based) construction**. The set-update / revocation question below *is* the "registry-ZK interaction" the cred-spec explicitly defers to future work — i.e. squarely our deliverable.

**Statement to prove (ZK):** `issuerCommitment ∈ accreditedSet` (Merkle root public), issuer identity private. Composes directly with 01's enrolment membership and 02's signature check.

**Stack candidates:** Merkle-tree membership in circom (Poseidon) — same primitive 01 needs, so build once and share. Alternative: accumulator / vector commitment if the accredited set churns often (revocation, Section 9 Q5).

- [ ] Shared Poseidon-Merkle gadget usable by 01 and 03.
- [ ] Decide set-update / revocation model (feeds Section 9 Q5).
