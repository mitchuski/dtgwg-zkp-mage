---
title: "Decision §7 — Profile architecture"
section: "decision"
source: "predicate-assurance-boundary-decision.md"
built_from_commitish: "working-tree"
order: 12
---
## 7. Profile architecture

### 7.1 Minimum Liveness Profile (MLP)

The MLP establishes that the presenter possesses a qualifying, current liveness attestation issued under an accepted policy and assurance class, controls the required holder secret, and generated a proof bound to the current verifier request and transcript.

The MLP MUST NOT require population-level deduplication, scoped nullifiers, or a claim of personhood uniqueness. It therefore does not depend on the Sybil-resistance/unlinkability trade curve.

The MLP includes:

- qualifying liveness-attestation possession;
- accepted policy and assurance predicates;
- issuer qualification where required by the relying policy;
- holder-key or holder-secret control;
- canonical transcript and freshness binding;
- expiry, status, and revocation evaluation;
- disclosure and observable-event analysis;
- local or mediated proving rules where supported.

### 7.2 Extended Personhood Profile (EPP)

The EPP composes the MLP with one or more of:

- personhood-policy satisfaction;
- issuer-set membership or multi-issuer assurance;
- same-human-as-enrolment evidence;
- scoped uniqueness or reuse detection;
- context-dependent unlinkability;
- rate limitation or n-show behaviour;
- optional attested demographic predicates.

The EPP MUST state where it sits on the Sybil-resistance/unlinkability trade curve. It MUST identify the context, scope, purpose, epoch, enrolment population, issuer coordination assumptions, recovery rules, and collusion target.

### 7.3 Delegation extension

Agent authority SHALL NOT be inferred from holder-key control. Where an agent presents or triggers a proof on behalf of a principal, the presentation MUST be accompanied by separate delegation evidence sufficient to establish:

- principal;
- agent;
- delegated capability or action;
- scope and purpose;
- start and expiry time;
- conditions and limits;
- revocation or suspension status;
- step-up requirements;
- evidence that the current action is covered.

The ZKP profile may bind the delegation evidence to the transcript, but the profile MUST NOT represent delegation semantics as a property of the holder-key proof alone.
