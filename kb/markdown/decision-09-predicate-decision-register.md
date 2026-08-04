---
title: "Decision §9 — Predicate decision register"
section: "decision"
source: "predicate-assurance-boundary-decision.md"
built_from_commitish: "working-tree"
order: 14
---
## 9. Predicate decision register

### 9.1 Summary register

| ID | Predicate | Profile | Verifier may rely on | Verifier must not infer |
|---|---|---|---|---|
| PR-LIV | Qualifying liveness-attestation possession | MLP, EPP | Presenter possesses an unexpired, non-revoked attestation satisfying named policy and assurance predicates | That the underlying liveness decision was correct; that the presenter is globally unique; civil identity |
| PR-PER | Personhood-policy satisfaction | EPP | Attested subject satisfies the named personhood policy under its stated assumptions | Civil identity; global uniqueness; incorruptibility of issuer; current liveness unless separately proved |
| PR-ISS | Issuer qualification | MLP/EPP as required | Attestation issuer is accepted under a named accreditation or governance framework | Correctness of issuer decision; issuer independence unless proved; hidden issuer in every profile |
| PR-UNQ | Scoped reuse detection | EPP | Same enrolled secret cannot produce multiple accepted actions under the same context, scope, purpose, and epoch without a repeated nullifier | One natural person globally; one enrolment across all issuers; cross-context identity |
| PR-HLD | Holder-secret control | MLP, EPP | Prover controls the secret or key bound to the attestation and transcript | Non-transferability; physical presence of a particular human; agent authority; informed consent |
| PR-FRE | Freshness and transcript binding | MLP, EPP | Proof was generated for the current canonical request and cannot be replayed into a materially different transcript | Anything about liveness, personhood, identity, or authority beyond bound inputs |
| PR-RNG | Attested range | Optional extension | Hidden attested value satisfies the requested range | Exact value; suitability for unrelated purposes; absence of inference from a narrow range |
| PR-DEL | Delegated authority evidence | Extension, separate evidence | Named agent is authorised for the current action within declared scope and time | Holder identity; human presence; non-coercion; authority outside the delegation |

The following sections provide the required paired boundary analysis.
