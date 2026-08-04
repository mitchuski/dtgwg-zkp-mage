---
title: "Decision §24 — Prohibited claims and constructions"
section: "decision"
source: "predicate-assurance-boundary-decision.md"
built_from_commitish: "working-tree"
order: 29
---
## 24. Prohibited claims and constructions

V1 MUST NOT:

- claim that a valid ZKP establishes correctness of the biometric determination;
- claim full unlinkability while also claiming Sybil resistance;
- describe a nullifier as proof of one-human-one-record;
- expose global stable identifiers or nullifiers;
- place raw biometrics or reversible templates in the proof flow;
- require civil-identity disclosure for the minimum profile;
- require issuer concealment in every profile;
- conflate holder-key control with human continuity, consent, or agent authority;
- leave proof composition undocumented;
- use proprietary verifier-only formats without interoperable test vectors;
- require global personhood or uniqueness before the minimum profile can ship;
- hard-code one algorithm into the semantic model;
- make post-quantum support a blocker for the first implementable release;
- permit mediated proving without non-retention and correlation controls;
- use a context boundary that can expand silently;
- claim issuer-verifier-collusion resistance without testing and documenting the full correlation surface.
