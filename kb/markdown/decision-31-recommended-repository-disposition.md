---
title: "Decision §31 — Recommended repository disposition"
section: "decision"
source: "predicate-assurance-boundary-decision.md"
built_from_commitish: "working-tree"
order: 36
---
## 31. Recommended repository disposition

This document should be maintained in the implementation-guide workspace as the authoritative synthesis that precedes and binds the existing boundary templates, predicate register, context record, ADRs, schema profile, threat model, and conformance fixtures.

Recommended path:

```text
docs/implementation-guide/boundaries/predicate-assurance-boundary-decision.md
```

The existing artefacts should remain, but their relationship should be clarified:

- this document records the Task Force's substantive decisions and system-level semantics;
- `context-decision-record.md` is the deployment/profile instantiation template;
- `assurance-boundary-template.md` and `disclosure-boundary-template.md` are per-predicate evidence templates;
- `predicate-boundary-register.md` is the compact traceability index;
- the ADRs record atomic architectural decisions and their consequences;
- the attestation-schema profile and field register operationalise the shared schema input;
- conformance fixtures prove that independent implementations instantiate the decisions consistently.

The implementation-guide README and boundary README should link to this document first and label it as the decision baseline. The upstream discussion can then be told that the repository already contains most of the required architecture in decomposed form, but it does not yet contain one complete, reviewable decision document that resolves the context question and presents the full per-predicate assurance and disclosure model as a single coherent first draft.
