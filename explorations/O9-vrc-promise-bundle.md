# O9 — VRC as promise bundle: the economic extension

*The spec's VRC is deliberately minimal. Agentprivacy's VRC carries promise-theoretic and economic
semantics. Propose the richer reading as an extension the minimal schema can carry — a contribution, not a
fork of the name.*

**Register:** O9 · leverage 🟠 · **Ladder:** design doc
**Anchor (cred-spec):** VRC minimal schema (bare relationship attestation between two R-DIDs) · "minimal
schemas enable common predicates" · extension room in `credentialSubject`.
**Anchor (decision doc):** §18 schema governance (every field = assurance surface + correlation surface) ·
§2.4 three-parameter claims · §27.2 (trust tasks compose predicates; bundled proofs may leak jointly).

---

## The drift that becomes a contribution

The coherence pass flagged it as Gap 2: agentprivacy's whitepapers define VRC richer than the spec —
**promise bundle** (promise-theory: what each party has voluntarily promised the other), **mutual
comprehension** ("proof of bilateral comprehension without central authority"), and **ERC-7812 bilateral
commitment** anchoring. The ruling then: don't rewrite our canon to match; the richness is a *contribution
surface*. This doc is that contribution, shaped.

The spec kept the VRC minimal so predicates stay simple — correct instinct, and the extension must honor
it: **the base VRC stays untouched; the bundle rides as an extension block, and every base-level predicate
keeps working on an extended VRC.**

## The extension, sketched

```
credentialSubject: {
  …minimal VRC fields (untouched)…,
  ext_promiseBundle: {
    version,
    promises: [ { promiseType, scope, direction (a→b | b→a | mutual), commitment } ],
    comprehension: { commitment },        // the mutual-comprehension attestation, committed not disclosed
    anchor: { scheme: "erc7812" | …, ref } // optional on-chain bilateral commitment
  }
}
```

Design rules, from §18 discipline:
- **Committed, not disclosed.** Promise contents are commitments; presentations reveal *predicates over*
  the bundle ("a promise of type T with scope ⊇ S exists, mutual, unexpired"), never the bundle. The
  economic layer must not become the correlation layer.
- **Cardinality control.** `promiseType` is a small governed vocabulary, not free text — rare promise
  types fingerprint a relationship exactly the way rare assurance classes fingerprint an issuer (§18.4).
- **The anchor is optional and one-way.** An on-chain ERC-7812 reference must not become a stable
  cross-context identifier for the pair (§6.6) — the anchor is a commitment the parties can *open toward a
  chain record*, not a pointer a verifier can follow.

## The ZK predicates the extension enables

Riding the **pairwise construction**, same as the base VRC:

- **PR-PRM (promise existence):** a promise of type T, direction d, scope ⊇ S exists in the bundle and is
  unexpired. *Negative meaning:* not that the promise was kept; not the promise's terms; not the bundle's
  size. (Promise-*keeping* is outcome evidence — the spec's outcome-interpretability rule applies: a
  taskContext-bearing credential is not evidence of completion. Kept-ness lives in trust-task protocols,
  §27.2 — out of scope here, on purpose.)
- **PR-CMP (comprehension):** the mutual-comprehension commitment verifies against both parties'
  contributions — the ZK form of the whitepaper's "bilateral comprehension without central authority."
  This is vrc-identity SKILL open problem #5 ("bilateral proverb as ZK proof of shared context") given its
  predicate name.
- **Economic composition:** a trust-task can require "≥ n mutual promises of type T across distinct
  counterparties" — composed from PR-PRM instances. §27.2's warning governs: individually sound bundle
  proofs may leak jointly (n distinct-counterparty proofs reveal degree ≥ n — degree *is* the disclosure;
  state it in the boundary record, three-parameter form per §2.4).

## What exists

- The promise protocol: `agentprivacy-docs/specs/vrc_promise_protocol_v3_3.md` + the swordsman/mage
  whitepaper's VRC semantics — the *source* semantics this extension carries.
- The dual-agent harness promise-theory lineage (promises as the harness's trust substrate).
- rt 07: an extended VRC is still one edge — G1–G8 hold unchanged over an extended VRC (worth one
  regression property when the extension lands in the reference model).

## Build plan

- **M1 — mapping table:** our-VRC-fields → spec-minimal-fields → extension block; confirm zero collisions
  with the base schema (the "extends, never redefines" proof).
- **M2 — extension schema draft** + §18.1 field register (each extension field: purpose, disclosure mode,
  cardinality, correlation risk).
- **M3 — PR-PRM/PR-CMP boundary records** (assurance + disclosure pairs; the degree-leakage analysis).
- **M4 — reference predicates** over the extended VRC in the lab (extend rt 07's edge object; one new
  property: base predicates unaffected by the extension).
- **M5 — Credentials TF surface:** propose as a registered extension ("relationship semantics" extension
  class) — the cred-spec reserves new credential *types* for trust-task protocols, but an extension block
  on an existing type is the door it leaves open.

## Open questions

- Extension registry: does the cred-spec want a governed extension vocabulary (like the context-authority
  model, §6.7) or per-ecosystem extensions? Our proposal should offer the governed shape.
- Promise expiry vs VRC validity: separate clocks (§22.1 discipline) — a promise may lapse inside a live
  relationship; the extension carries its own validity fields.
