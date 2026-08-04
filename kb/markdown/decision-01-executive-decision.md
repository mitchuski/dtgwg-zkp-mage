---
title: "Decision §1 — Executive decision"
section: "decision"
source: "predicate-assurance-boundary-decision.md"
built_from_commitish: "working-tree"
order: 6
---
## 1. Executive decision

The Task Force should adopt the following system model for V1:

> A DTG zero-knowledge proof establishes possession of, and selected predicates over, an issuer attestation. It does not establish that the issuer's underlying biometric, personhood, or liveness determination was correct. The cryptographic layer carries proof integrity, selective disclosure, and the privacy properties expressly defined by the profile. The issuer, accreditation, policy, audit, and governance layers carry assurance in the underlying determination.

The V1 architecture should therefore be split into two profiles along the natural boundary created by the relationship between Sybil resistance and unlinkability:

- a **Minimum Liveness Profile**, which does not require population-level deduplication or scoped linkability and can be implemented and benchmarked independently; and
- an **Extended Personhood Profile**, which introduces issuer qualification, personhood-policy satisfaction, scoped uniqueness or reuse detection, and context-dependent unlinkability.

The Task Force should further adopt paired system-level records for every material predicate:

- an **assurance boundary**, describing what a verifier may rely on, what remains outside the proof, and who is accountable when the relied-on proposition is wrong; and
- a **disclosure boundary**, describing what each participant can observe or reconstruct, to whom it is exposed, how long it persists, and which accompanying artefacts can make it correlatable.

The two boundaries share one controlling input: **the issuer attestation schema**. A field required to support assurance, such as policy version, assurance class, issuance context, or accreditation reference, can simultaneously become a correlation surface. The schema must therefore be governed as both an interoperability artefact and a privacy artefact.
