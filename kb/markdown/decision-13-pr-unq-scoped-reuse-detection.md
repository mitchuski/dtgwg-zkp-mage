---
title: "Decision §13 — PR-UNQ: scoped reuse detection"
section: "decision"
source: "predicate-assurance-boundary-decision.md"
built_from_commitish: "working-tree"
order: 18
---
## 13. PR-UNQ: scoped reuse detection

### 13.1 Statement established

For a specified enrolled secret, context, scope, purpose, and epoch, the proof derives a deterministic nullifier such that a verifier or governed verifier set can detect a repeated accepted action within that domain.

The narrow assurance statement is:

> The same enrolled secret cannot produce two accepted actions in the same context, scope, purpose, and epoch without producing the same nullifier, assuming correct enrolment binding and construction implementation.

### 13.2 Negative meaning

PR-UNQ does not establish:

- one unique human globally;
- one enrolment per issuer or ecosystem;
- that the biometric commitment cannot be duplicated or fraudulently issued;
- that two different secrets cannot belong to the same natural person;
- that one secret cannot be controlled by multiple people;
- cross-context identity;
- absence of coercion or account sharing.

### 13.3 Assurance dependencies

The strength of the uniqueness claim depends on:

- biometric match and deduplication quality;
- resistance to re-enrolment;
- recovery, rotation, and exception rules;
- issuer coordination and common-root semantics;
- binding between the committed secret and enrolment root;
- nullifier domain separation;
- epoch authority and rollover;
- verifier acceptance and state consistency;
- compromise and collusion assumptions.

Only scoped reuse detection is primarily cryptographic. One enrolment per issuer or ecosystem is a biometric and governance property. One natural person globally is outside the default V1 claim.

### 13.4 Nullifier input requirements

The nullifier statement MUST unambiguously bind:

- enrolment-root or population commitment identifier;
- canonical context descriptor;
- scope identifier;
- purpose identifier;
- epoch identifier;
- profile and construction version;
- recovery or rotation domain where applicable;
- holder or enrolment secret.

### 13.5 Disclosure

The verifier learns a stable pseudonymous value within the defined domain. This intentionally enables within-domain linkage. The profile MUST state who retains the nullifier, for how long, and whether multiple verifiers share the same state.

The nullifier MUST be unlinkable across contexts to the degree asserted by the declared adversary model. Schema fields, status traffic, issuer-held data, network identifiers, and exact timing may weaken that claim and MUST be evaluated together.

### 13.6 Failure handling and redress

A repeated nullifier may result from legitimate retry, race conditions, recovery, epoch disagreement, verifier duplication, or malicious reuse. The profile MUST define deterministic error semantics and a challenge route. A person MUST NOT be permanently excluded by an opaque uniqueness result without correction and appeal mechanisms.
