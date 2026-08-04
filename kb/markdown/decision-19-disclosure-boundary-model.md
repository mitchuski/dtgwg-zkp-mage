---
title: "Decision §19 — Disclosure-boundary model"
section: "decision"
source: "predicate-assurance-boundary-decision.md"
built_from_commitish: "working-tree"
order: 24
---
## 19. Disclosure-boundary model

For each predicate and profile, the implementation SHALL analyse at least the following observers:

- verifier;
- issuer;
- issuer and verifier colluding;
- multiple verifiers colluding;
- registry operator;
- accreditation authority;
- mediated prover;
- wallet or agent operator;
- network observer;
- auditor or log processor;
- malicious application co-resident on the device.

The analysis SHALL cover:

- deliberately disclosed values;
- derived values and rarity;
- persistent pseudonyms and nullifiers;
- proof size, encoding, and timing fingerprints;
- status and registry queries;
- presentation occurrence, timing, retries, and frequency;
- fallback and downgrade path;
- mediator retention;
- device and network identifiers;
- cross-proof and cross-credential composition;
- error codes and diagnostics;
- human interaction and step-up events.
