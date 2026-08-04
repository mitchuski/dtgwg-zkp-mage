---
title: "Decision §14 — PR-HLD: holder-secret control"
section: "decision"
source: "predicate-assurance-boundary-decision.md"
built_from_commitish: "working-tree"
order: 19
---
## 14. PR-HLD: holder-secret control

### 14.1 Statement established

The prover demonstrates knowledge or control of the holder secret bound to the attestation and the current transcript.

### 14.2 Negative meaning

PR-HLD does not establish:

- that the key was not transferred, copied, or delegated;
- that a particular natural person is physically present;
- that the key is stored in secure hardware;
- that the holder understood or consented to the request;
- that an agent has authority for the action;
- continuity of civil identity.

### 14.3 Disclosure

The proof may reveal continuity of a holder-bound pseudonym within a profile or account context. Device attestation, secure-hardware signals, error modes, mediated proving, and network behaviour may reveal additional information and require separate analysis.

### 14.4 Accountability

Wallet and holder-software implementers are accountable for key protection, correct binding, request display, and recovery behaviour. Verifiers are accountable for not interpreting key control as human intent or agent authority.
