# 06 — Demographic range (if in scope) — stub

**Predicate:** Range proof over an attested attribute (e.g. age ≥ 18) — marked "if in scope" in the strawman.

**Cred-spec anchor** ([`../CRED-SPEC-COHERENCE.md`](../CRED-SPEC-COHERENCE.md)): the attested value rides an **IDVC** (age from identity-proofing) or a **VEC** (`credentialSubject` attribute); the range check is exactly the kind of **selective-disclosure predicate** the Credentials-Core-Spec says its minimal schemas exist to enable — disclose "≥ threshold," never the value. Composes with 02's IDVC signature check. Still gated on the WG scope call.

**Statement to prove (ZK):** `low ≤ attestedValue ≤ high` (or `≥ threshold`), value private, bound to the same issuer attestation as 02. Context: age-gated access (Section 5).

**Stack candidates:** Bulletproofs-style range proof, or a bit-decomposition range check in circom composed with the attestation signature check (02). Prefer the latter for a single-circuit story.

**Scope flag:** confirm with the WG whether demographic range is in v1 at all before investing (Section 4 says "if in scope").

- [ ] Confirm scope with WG.
- [ ] If in: bit-decomposition range check composed with 02's signature check.
