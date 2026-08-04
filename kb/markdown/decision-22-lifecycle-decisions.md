---
title: "Decision §22 — Lifecycle decisions"
section: "decision"
source: "predicate-assurance-boundary-decision.md"
built_from_commitish: "working-tree"
order: 27
---
## 22. Lifecycle decisions

### 22.1 Separate clocks

The profile MUST distinguish:

- proof-transcript lifetime;
- challenge/session lifetime;
- attestation validity;
- status freshness;
- nullifier epoch;
- enrolment-root cryptoperiod;
- policy and accreditation validity;
- log retention;
- proof-system security horizon;
- biometric assurance horizon.

### 22.2 Unbounded values prohibited

A nullifier without a bounded epoch and an enrolment root without a cryptoperiod are non-conformant unless the profile provides an explicit, reviewed exception. “Permanent” or “unbounded” MUST NOT be accepted as an implicit default.

### 22.3 Migration

Algorithm agility MUST be supported by a concrete migration mechanism, including profile identifiers, version negotiation, overlap periods, deprecation, downgrade protection, fixture updates, and treatment of long-lived enrolment artefacts. Merely stating that algorithms are replaceable is insufficient.
