---
title: "Decision — Appendix B. Compact boundary-record example for PR-UNQ"
section: "decision"
source: "predicate-assurance-boundary-decision.md"
built_from_commitish: "working-tree"
order: 38
---
## Appendix B. Compact boundary-record example for PR-UNQ

```yaml
boundary_id: AB-PR-UNQ-001
predicate: PR-UNQ
profile: extended-personhood-v1
statement_established: >
  The same enrolled secret cannot produce two accepted actions in the
  declared context, scope, purpose, and epoch without producing the same
  nullifier.
negative_meaning:
  - does not establish one natural person globally
  - does not establish one enrolment across issuers
  - does not establish non-transfer of the enrolled secret
against_whom:
  - honest-but-curious verifier
  - colluding verifiers across distinct contexts
  - issuer and verifier collusion, subject to declared issuer-data limits
for_how_long:
  epoch: 30 days
  enrolment_root_cryptoperiod: 2 years
  nullifier_retention: 35 days
  assurance_horizon: 2 years
alongside_what:
  - attestation schema v1
  - canonical transcript v1
  - registry snapshot no older than 24 hours
  - no stable external account identifier shared across contexts
accountable_parties:
  enrolment_correctness: issuer
  context_definition: context authority
  nullifier_state: verifier-set operator
  cryptographic_correctness: proof implementation
redress:
  - duplicate-decision challenge endpoint
  - issuer re-evaluation
  - verifier state correction
  - appeal to context authority
```
