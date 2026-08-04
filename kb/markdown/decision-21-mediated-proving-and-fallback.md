---
title: "Decision §21 — Mediated proving and fallback"
section: "decision"
source: "predicate-assurance-boundary-decision.md"
built_from_commitish: "working-tree"
order: 26
---
## 21. Mediated proving and fallback

### 21.1 Decision

A profile MAY support mediated proving when a holder device cannot generate the required proof, but the mediated path MUST be explicit and separately assessed.

### 21.2 Required controls

A mediated-proving profile MUST define:

- data sent to the mediator;
- whether the mediator sees witnesses, biometrics, commitments, or credentials;
- non-retention and deletion requirements;
- isolation between sessions and tenants;
- authentication and authorisation;
- transcript binding;
- audit and incident response;
- whether the mediator can link contexts;
- user-visible indication that mediation is occurring;
- equivalent or downgraded assurance semantics;
- failure and fallback behaviour.

A mediated prover MUST NOT become the biometric or credential honeypot the privacy architecture was intended to avoid.

### 21.3 Downgrade decision

When the preferred proof cannot be produced, the system MUST NOT silently step down. It MUST either fail, invoke an explicitly identified lower-assurance profile, use a governed mediator, or switch channel according to a relying policy visible to the person and verifier.
