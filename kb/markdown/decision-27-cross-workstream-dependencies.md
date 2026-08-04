---
title: "Decision §27 — Cross-workstream dependencies"
section: "decision"
source: "predicate-assurance-boundary-decision.md"
built_from_commitish: "working-tree"
order: 32
---
## 27. Cross-workstream dependencies

### 27.1 Credentials work

The Credentials workstream needs the context and disclosure decisions before stabilising attestation fields. Credential fields can defeat context separation even when the proof construction is sound.

### 27.2 Trust Tasks work

Trust tasks compose predicates and determine request semantics. The transcript, purpose, scope, and multi-proof composition model require joint definition. Bundled proofs that are individually sound may leak jointly.

### 27.3 Registry and governance work

Issuer qualification, policy recognition, status, snapshot semantics, context authority, and change control depend on registries and governance. The ZKP profile consumes these decisions but does not define their institutional legitimacy.

### 27.4 Human Experience work

Human Experience participation is required for context legibility, consent and notice, fallback and downgrade behaviour, accessibility, assisted use, error handling, challenge, correction, and redress.

### 27.5 Agent and delegation work

Delegation semantics require a separate structured evidence model and lifecycle. The ZKP profile should bind to that evidence but not invent authority semantics inside a key-control predicate.
