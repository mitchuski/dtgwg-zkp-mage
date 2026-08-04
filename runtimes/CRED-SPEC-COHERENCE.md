# Coherence — DTG ZKP predicates ↔ DTG Credentials Core Spec

**Status:** Local coherence map. Not upstream. This is the single source the other runtime docs
reference; when the strawman's Section 4 predicates are cited against a credential type or DID, the
mapping lives here.

**Sibling spec:** *Decentralized Trust Graph Credentials — Core Specification*, DTGWG / ToIP, Working
Draft v1.0 — <https://trustoverip.github.io/dtgwg-cred-spec/>. It defines the credentials our proofs are
*about*. This lab defines the ZK layer the cred-spec deliberately leaves open.

---

## Why this map exists

The cred-spec is **format-agnostic on ZK by design**: *"Specification remains format-agnostic regarding
ZKP implementations — no binding to specific schemes… Detailed ZK protocols and registry-ZK interactions
deferred to future work."* That deferred layer is this task force's charter. But the strawman and this
lab currently share only *predicate* vocabulary (liveness, nullifier, set-membership, …) with the
cred-spec — they never name the credential types (VRC/VMC/…), the DID types (R/M/C/P-DID), or the
registry the proofs stand on. This map closes that gap so each predicate points at the concrete
cred-spec object it operates over.

## The two constructions we plug into

The cred-spec names exactly two ZKP constructions. Every predicate below rides one of them; our
reference constructions are **one conformant realization** of these, not a competing scheme.

- **Pairwise ZKP (VRC-based)** — any two entities holding a VRC prove possession + selectively disclose
  attributes/DIDs/predicates without revealing underlying R-DIDs. No community context required.
- **Community-anchored ZKP (VMC-based)** — when both parties hold VMCs from the same C-DID, prove VRC
  possession *and* VMC possession *and* the counterparty's VMC from the identical C-DID — relationship
  existence within a shared governance context, no DIDs revealed.

## Predicate → cred-spec anchor

| # | Predicate (strawman §4) | Cred-spec anchor | Rides construction |
|---|---|---|---|
| 01 | Uniqueness / nullifier | **R-DID uniqueness** (each entity MUST mint a new unique R-DID per counterparty) + **PHC** pattern ("real human + exactly-one-membership-per-person") | community-anchored (VMC / same C-DID) |
| 02 | Liveness attestation | **IDVC** — the biometric provider's signed determination *is* an Identity Verification Credential (spec's IDVC: "any W3C VC satisfying VTC/VTN identity-proofing"; issuers Veriff/Jumio/Yoti/Onfido/…) | signature-in-circuit over the IDVC |
| 03 | Personhood / set-membership | **VMC from a recognized VTC** — spec's own example predicate "Holder has valid VMC from recognized VTC" | community-anchored (VMC-based) |
| 04 | Holder / agent binding | **VPC / P-DID** (persona) + **VTA** (the agent that presents) + subject-DID key binding | pairwise (VRC-based) |
| 05 | Freshness | **taskContext** binding + validity window (`validFrom`/`validUntil`) + the **outcome-interpretability** rule; the freshness nonce ↔ `witnessContext.sessionId` | constraint layered on 01/02/04 |
| 06 | Demographic range | **VEC** / `credentialSubject` attribute exposed as a **selective-disclosure predicate** (spec: minimal schemas enable common predicates) | range proof composed with 02 |

## Terminology reconciliation

- **"accredited (issuer) set" → trust registry.** Where the strawman/lab say "accredited set" / "accredited
  enrolment set," the cred-spec's term is **trust registry** — the authoritative source that maps DIDs to
  roles, determines acceptable issuers, and handles revocations. Runtime 03's Merkle root *is* a ZK view of
  the trust registry's authorized-issuer list; runtime 01's enrolment set is the VTC membership the registry
  governs. Keep "accredited set" only where it names the *cryptographic* object (the Merkle set); use "trust
  registry" for the *governance* object.
- **PHC is not a schema type — it's a governed VMC.** The cred-spec: any VMC from a VTC whose governance
  enforces personhood + one-membership-per-person *is* a PHC, no extra fields. So predicate 01 (nullifier)
  is the ZK mechanism that *enforces the "one-membership-per-person" rule* a PHC asserts, and predicate 03
  proves "holder has a VMC from a VTC the registry recognizes as a PHC issuer."
- **IDVCs are not DTG credential subtypes.** They are the identity-proofing input (predicate 02), governed
  by VTC/VTN policy + trust registries. The proof reveals "valid IDVC at assurance ≥ L," never the IDVC.
- **VTA definition check.** This lab's README defines VTA = "verifiable trust agent." The cred-spec defines
  **VTA = Verifiable Trust Agent** (a DTG node's digital agent; subtypes: local VTA on edge devices, cloud
  VTA on servers; personal vs community VTA networks). Same expansion — align capitalization to *Verifiable
  Trust Agent* and note the local/cloud split where predicate 04 binds the presenting agent.
- **Not yet used, introduce cleanly:** VRC, VMC, VIC, VPC, VEC, VWC, R/M/C/P-DID, VID, VTC, VTN, taskContext,
  trust registry — none collide with existing lab vocabulary; adopt the spec's spelling verbatim.

## Format relationship (selective disclosure)

The cred-spec is format-agnostic; it does not bind BBS+/SD-JWT-VC. Our constructions realize selective
disclosure at the ZK layer (predicates 02/06 reveal "≥ L" / "in range," never the value). Where a relying
party already speaks SD-JWT-VC or BBS+, those are the *credential-format* selective-disclosure carriers;
our ZK predicates are the *proof-layer* realization the spec leaves to us. Note the relationship; do not
claim to replace them.

## What stays open (cred-spec's deferred layer = our deliverable)

The cred-spec explicitly defers **detailed ZK protocols** and **registry-ZK interactions** (how a ZK proof
reads/authorizes against a trust registry, incl. revocation) to future work. Runtimes 01/03 + the
revocation question (§9 Q5) are exactly that interaction. See `CRED-SPEC-OPPORTUNITIES.md`.
