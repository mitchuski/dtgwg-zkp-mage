---
title: "Decision §16 — PR-RNG: attested range predicate"
section: "decision"
source: "predicate-assurance-boundary-decision.md"
built_from_commitish: "working-tree"
order: 21
---
## 16. PR-RNG: attested range predicate

### 16.1 Statement established

A hidden, issuer-attested value falls within the requested range or satisfies the specified comparison.

### 16.2 Profile status

Range predicates SHOULD be an optional extension rather than a dependency of the Minimum Liveness Profile. Age and demographic predicates introduce separate issues of data minimisation, jurisdiction, discriminatory use, rarity, and inference.

### 16.3 Negative meaning

PR-RNG does not reveal or establish the exact value. It does not establish suitability for an unrelated purpose and MUST NOT be reused as a proxy for identity, reputation, or risk beyond the stated policy.

### 16.4 Disclosure

A narrow or rare range, especially when combined with assurance class, location, policy, device data, or other predicates, may materially identify or classify a person. Combination risk MUST be tested.
