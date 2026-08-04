---
title: "Decision §26 — Conformance requirements"
section: "decision"
source: "predicate-assurance-boundary-decision.md"
built_from_commitish: "working-tree"
order: 31
---
## 26. Conformance requirements

A conformant profile or implementation MUST provide:

- a completed context decision record;
- one assurance-boundary record per supported predicate;
- one disclosure-boundary record per supported predicate;
- a versioned attestation schema and field register;
- a canonical transcript fixture;
- nullifier scope-and-epoch fixture where applicable;
- issuer-set or registry-snapshot fixture where applicable;
- lifecycle and cryptoperiod profile;
- mediated-proving declaration where applicable;
- implementation conformance statement;
- positive, negative, and cross-context test vectors;
- evidence that user-facing context descriptions match the cryptographic configuration;
- residual-risk record.

### 26.1 Minimum negative tests

The test programme MUST reject at least the following:

- a valid proof over an expired, revoked, or unaccepted attestation;
- a verifier output implying biometric correctness;
- replay into another verifier, context, purpose, scope, or transcript;
- reuse of a nullifier domain across distinct contexts;
- an issuer-verifier-collusion-resistance claim with no defined adversary or test;
- a schema containing an unjustified stable correlator;
- a context expansion without version and migration;
- a silent fallback to a lower-assurance or mediated path;
- acceptance of holder-key control as sufficient agent authority;
- inconsistent epoch or registry snapshots;
- a disclosure claim that ignores observable events or accompanying fields.
