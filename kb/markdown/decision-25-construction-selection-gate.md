---
title: "Decision §25 — Construction-selection gate"
section: "decision"
source: "predicate-assurance-boundary-decision.md"
built_from_commitish: "working-tree"
order: 30
---
## 25. Construction-selection gate

A cryptographic construction SHALL NOT be ratified for a predicate until the Task Force has approved:

1. the exact positive statement;
2. the negative meaning;
3. the context, scope, purpose, and epoch inputs;
4. the adversary and collusion model;
5. the assurance horizon and cryptoperiod;
6. the issuer-attestation fields and disclosure modes;
7. the composition and observable-event assumptions;
8. the accountability and redress path;
9. the required performance envelope;
10. conformance fixtures and negative tests.

Construction evaluation SHOULD then consider:

- proof and verification size;
- proving time on representative consumer devices;
- verifier throughput;
- trusted-setup and toxic-waste assumptions;
- parameter and proving-key distribution;
- browser and mobile SDK viability;
- library maturity and independent implementations;
- deterministic test-vector support;
- offline verification;
- secure-hardware dependencies;
- revocation and refresh cost;
- recursive or folded composition feasibility;
- post-quantum migration path;
- error diagnosability;
- fallback behaviour;
- deployment and operational complexity.
