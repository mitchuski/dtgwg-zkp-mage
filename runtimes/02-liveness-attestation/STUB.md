# 02 — Liveness attestation — stub

**Predicate:** ZKP of a valid issuer signature over a liveness attestation, without revealing the attestation.

**Cred-spec anchor** ([`../CRED-SPEC-COHERENCE.md`](../CRED-SPEC-COHERENCE.md)): the biometric provider's signed liveness determination *is* an **IDVC** (Identity Verification Credential) in Credentials-Core-Spec terms — "any W3C VC satisfying VTC/VTN identity-proofing," issued by an accredited IDVP (Veriff/Jumio/Yoti/Onfido/…). IDVCs are *not* DTG credential subtypes; they are the identity-proofing input. The proof reveals only "a valid IDVC at assurance ≥ L exists," never the IDVC. The acceptable-IDVP list is held by the **trust registry**.

**Statement to prove (ZK):** `verifySig(issuerPubKey, attestation) == true`, where `attestation` (pass + assurance level + session binding) stays private; only "a valid attestation exists, at assurance ≥ L" is revealed.

**Stack candidates (decide when built):** signature-in-circuit (EdDSA/Poseidon in circom — cheap, needs issuer to sign with a SNARK-friendly scheme) vs. ECDSA-in-circuit (interop with existing issuers, expensive). This tension is the real decision here.

**Open (ties to Section 6 open question):** how to encode the proprietary-model determination so the proof carries its assurance without revealing the model. Likely: issuer signs a compact attestation; the model never enters the circuit.

- [ ] Pick signature scheme; prototype verify-in-circuit.
- [ ] Decide what's public (assurance level, issuer-set membership) vs. private (the attestation).
