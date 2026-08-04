---
title: "Decision §15 — PR-FRE: freshness and canonical transcript binding"
section: "decision"
source: "predicate-assurance-boundary-decision.md"
built_from_commitish: "working-tree"
order: 20
---
## 15. PR-FRE: freshness and canonical transcript binding

### 15.1 Statement established

The proof is bound to a current, verifier-authorised, domain-separated transcript and cannot be replayed or transplanted into a materially different request without detection.

### 15.2 Required transcript fields

The canonical transcript MUST bind at least:

- protocol identifier and version;
- profile identifier and version;
- verifier or audience identifier;
- governed context descriptor;
- purpose and scope identifiers;
- challenge or nonce;
- session identifier;
- requested predicates;
- policy and assurance requirements;
- delegation reference where applicable;
- expiry boundary and accepted clock rules;
- status or registry snapshot requirements;
- fallback or mediated-proving mode when material;
- canonical encoding and domain-separation version.

A bare nonce is insufficient.

### 15.3 Negative meaning

PR-FRE does not establish liveness, personhood, identity, authority, or non-coercion. It establishes only that the proved statement is bound to the current transcript under the accepted freshness rules.

### 15.4 Disclosure

Transcript fields can reveal verifier, audience, purpose, requested predicates, risk posture, timing, session patterns, and step-up frequency. These are observable even when the witness remains hidden.
