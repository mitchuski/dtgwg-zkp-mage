---
title: "Decision §17 — PR-DEL: delegated authority evidence"
section: "decision"
source: "predicate-assurance-boundary-decision.md"
built_from_commitish: "working-tree"
order: 22
---
## 17. PR-DEL: delegated authority evidence

### 17.1 Statement established

Where separately supported, the evidence establishes that a named agent is authorised by a principal to perform the current action under declared scope, purpose, conditions, duration, and revocation state.

### 17.2 Separation requirement

Delegation evidence MUST remain structurally separate from proof of holder-key control. The ZKP may prove possession of or predicates over delegation evidence and bind it to the transcript, but the semantic authority comes from the delegation instrument and its governance.

### 17.3 Negative meaning

PR-DEL does not establish that the principal is currently present, that the principal would approve every implementation detail, or that the agent is trustworthy outside the delegation.
