---
title: "Decision §20 — Observable event and behavioural leakage"
section: "decision"
source: "predicate-assurance-boundary-decision.md"
built_from_commitish: "working-tree"
order: 25
---
## 20. Observable event and behavioural leakage

The specification claims unlinkability, not undetectability. A presentation event remains observable. The request pattern can itself disclose behaviour, including:

- which verifier requested a proof;
- when and how often step-up occurs;
- whether an action triggered risk controls;
- how many retries occurred;
- whether local proving failed;
- whether a mediated or lower-assurance path was used;
- whether an agent encountered intent drift or permission escalation.

Profiles MUST identify observable-event leakage and SHOULD provide minimisation measures such as batching, coarse timing, local caching, private status checks, uniform error behaviour, and strict telemetry controls where practical.
