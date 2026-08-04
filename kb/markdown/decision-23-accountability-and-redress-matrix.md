---
title: "Decision §23 — Accountability and redress matrix"
section: "decision"
source: "predicate-assurance-boundary-decision.md"
built_from_commitish: "working-tree"
order: 28
---
## 23. Accountability and redress matrix

| Failure | Primary accountable party | Supporting parties | Required remedy path |
|---|---|---|---|
| False liveness or personhood determination | Issuer | biometric provider, accreditation authority | contest determination, re-evaluation, correction, status propagation |
| Incorrect issuer qualification | registry/accreditation authority | governance authority, verifier | correct registry state, publish effective time, re-evaluate affected decisions |
| Cryptographic acceptance of invalid proof | proof implementation/operator | profile maintainer, verifier | patch, revoke parameters or profiles, incident notice, reprocessing |
| False duplicate or nullifier collision | profile/operator and context authority | issuer, verifier state operator | investigate, restore access, correct state, appeal |
| Silent context expansion | context authority/governance | verifiers, registry | suspend expansion, notify, migrate, reset or segregate identifiers where possible |
| Excess disclosure or correlation | party controlling the correlating surface | issuer, wallet, verifier, mediator, registry | stop processing, delete or segregate data, schema/profile correction, incident handling |
| Invalid delegation decision | delegation issuer/authority and verifier | wallet/agent operator | revoke, correct authority state, reverse or halt action where possible |
| Silent fallback or assurance downgrade | verifier and wallet/operator | mediator | disclose, re-run under correct profile, remediate affected decisions |
| Inaccessible or misleading context presentation | wallet/verifier experience owner | governance authority | accessible alternative, correction, process redesign, redress |

A proof profile MUST define not only who is responsible but how a wrong decision is contested and how corrections propagate to verifiers, registries, logs, and downstream decisions.
