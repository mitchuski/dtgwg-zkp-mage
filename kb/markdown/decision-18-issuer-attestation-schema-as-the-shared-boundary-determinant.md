---
title: "Decision §18 — Issuer attestation schema as the shared boundary determinant"
section: "decision"
source: "predicate-assurance-boundary-decision.md"
built_from_commitish: "working-tree"
order: 23
---
## 18. Issuer attestation schema as the shared boundary determinant

### 18.1 Decision

The issuer attestation schema SHALL be governed as the shared determinant of both assurance and disclosure boundaries.

For every field, the profile MUST record:

- semantic purpose;
- assurance proposition supported;
- disclosure mode;
- whether it is disclosed, selectively disclosed, committed, derived in proof, verifier-resolved, or prohibited;
- cardinality and rarity;
- stability across sessions, contexts, and epochs;
- correlation and reconstruction risk;
- retention and lifecycle;
- migration and deprecation behaviour;
- responsible authority;
- conformance evidence.

### 18.2 Minimum semantic field classes

A profile will commonly require:

| Field class | Assurance purpose | Preferred disclosure treatment |
|---|---|---|
| Schema/profile version | Interpretation and negotiation | Disclose at coarse profile granularity; prevent issuer fingerprinting |
| Policy identifier/version | Define relying semantics | Prove accepted value or disclose coarse accepted class |
| Assurance class | Support verifier risk decision | Minimise cardinality; avoid issuer-specific values |
| Issuance/expiry bounds | Validity and freshness | Prove interval membership where feasible |
| Holder-binding commitment | Subject continuity | Hidden witness or commitment |
| Status reference | Revocation/suspension | Privacy-preserving status mechanism or bounded cache |
| Issuer accreditation reference | Qualification | Set-membership proof or explicit disclosure per profile |
| Enrolment-root reference | Scoped reuse detection | Committed, context-governed, never a global public identifier |
| Determination result | Predicate input | Hidden, with only required predicate disclosed |
| Determination-policy metadata | Meaning and accountability | Coarsened or proved where possible |

### 18.3 Prohibited schema practices

A schema MUST NOT include stable issuer-local identifiers, raw biometrics, reversible templates, exact timestamps, unique status indices, or high-cardinality extensions merely for operational convenience where they are not essential to the relying proposition.

Schema versions and extension ordering MUST NOT become covert issuer or subject identifiers.

### 18.4 Combination analysis

Fields MUST be assessed individually and in combination. A policy version, assurance class, issuance time, status index, proof size, and issuer-set choice may be non-identifying separately but identifying together.
