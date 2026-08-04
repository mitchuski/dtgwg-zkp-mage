---
title: "O1 — Deferred ZK Layer"
section: "explorations"
source: "explorations/O1-deferred-zk-layer.md"
built_from_commitish: "working-tree"
order: 41
---
# O1 — Fill the deferred ZK layer

*DTG ZKP V1.0 is the conformant binding for the Credentials Core Spec's two ZK constructions — the missing
layer, not a parallel scheme.*

**Register:** O1 · leverage 🔴 (charter-defining) · **Ladder:** design doc
**Anchor (cred-spec):** "Specification remains format-agnostic regarding ZKP implementations… detailed ZK
protocols and registry-ZK interactions deferred to future work."
**Anchor (decision doc):** §2.1 statement-before-construction · §7 profile architecture · §25
construction-selection gate.

---

## What the spec offers and defers

The Credentials Core Spec fixed everything *around* the proofs: six credential types, four DID types, the
trust registry, `taskContext`, and — critically — the **shapes** of exactly two ZK constructions:

- **Pairwise (VRC-based):** two VRC holders prove possession + selectively disclose without revealing R-DIDs.
- **Community-anchored (VMC-based):** two members of one C-DID prove relationship existence within a shared
  governance context, no DIDs revealed.

Then it stopped, on purpose. The protocol details of those two constructions and their interaction with the
trust registry are deferred to future work. The sibling WG cut a hole exactly our shape.

## What the decision doc adds

The Predicate & Assurance-Boundary Decision Document (v0.1.0-draft) resolves *how* the hole gets filled:

- **Statement selection precedes construction selection** (§2.1): naming a nullifier or set-membership
  proof tells nobody what proposition is exchanged. The deliverable's spine is the PR-* predicate register
  (§9) — each with a positive statement, a **negative meaning**, and paired assurance/disclosure boundaries.
- **Two profiles, not one ladder** (§7): the **Minimum Liveness Profile** ships without population
  deduplication or the Sybil/unlinkability trade; the **Extended Personhood Profile** composes onto it and
  must declare its position on that trade curve.
- **The construction gate** (§25): no construction is ratified until statement, negative meaning, context
  inputs, adversary model, horizons, schema fields, composition assumptions, accountability, performance
  envelope, and fixtures are approved.

## The claim

**DTG ZKP V1.0 should be written as the binding that fills the deferred layer** — for each predicate, a
conformant realization of one of the spec's two constructions, never a third scheme. Concretely, every
normative statement in our draft should be traceable as:

```
PR-* predicate (decision doc §9)  →  cred-spec anchor (credential/DID/registry object)  →  construction it rides  →  protocol detail we specify
```

The first two arrows exist (`~/dtgwg-zkp-tf-mage/runtimes/CRED-SPEC-COHERENCE.md` + the decision doc's
register); our deliverable is the fourth column — entered only through the §25 gate.

## Positioning rules (what "not a parallel scheme" means in practice)

1. **Adopt the spec's objects verbatim** — VRC/VMC/VIC/VPC/VEC/VWC, R/M/C/P-DID, trust registry, PHC,
   IDVC, taskContext. No synonyms, no new credential types (reserved for higher-layer trust-task protocols).
2. **Adopt the decision doc's narrow language verbatim** — "scoped reuse detection" not "unique human";
   "possession of and predicates over an attestation" not "proof of liveness"; holder-key control ≠ agent
   authority. §24's prohibited-claims list is a style guide as much as a rule set.
3. **Every predicate names its construction.** Uniqueness/personhood ride community-anchored; holder/agent
   binding rides pairwise; freshness and range are constraints/compositions layered on those.
4. **Format-agnosticism is preserved downward, not upward.** We bind to the spec's constructions (upward),
   but stay agnostic on credential *formats* (SD-JWT-VC, BBS+) the way the spec does — our predicates are
   the proof-layer realization, complementary to format-level selective disclosure.
5. **Registry interaction is shared work.** The registry-ZK interaction (O4) is the one place our text and
   the Credentials TF's must co-evolve — co-author, don't fork (decision doc §27.1/§27.3).

## What exists

- The coherence map + anchor blocks on all seven runtimes (the first two arrows).
- The decision doc itself — the §9 register with paired boundary analyses is the statement layer the §25
  gate requires, drafted.
- E1–E7 (`~/dtgwg-zkp-tf-mage/runtimes/STRAWMAN-COHERENCE-EDITS.md`) — the strawman-side edits making the
  interlock explicit; E1 (normative reference) and E4 (name the two constructions) are the first upstream move.
- Reference constructions with property tests for the two hardest predicates (rt 01 nullifier 9/9,
  rt 07 edge-admissibility 11/11) — early drafts of §26 conformance fixtures.

## Build plan

- **M1 — ratify the statement layer.** Bring the decision doc to the TF (§28's ten ratification points);
  land E1–E7 as issues/PRs so the strawman and the cred-spec interlock.
- **M2 — boundary records per predicate.** For each PR-* we build, complete the assurance-boundary +
  disclosure-boundary pair (Appendix B format) — the runtimes' NOTES.md are the drafts.
- **M3 — constructions through the gate.** Only now: per-predicate binding profiles (statement,
  public/private inputs, construction, reference runtime, cost) → the shared circom gadget.
- **M4 — the working draft.** Assemble into DTG ZKP V1.0 WD for IIW #43 (Nov 2026), MLP first, EPP behind
  it, registry-ZK section co-authored with the Credentials TF.

## Open questions

- One document (binding spec) or a profile-per-predicate series? The decision doc's §31 disposition
  (decision baseline → templates → registers → fixtures) suggests one baseline + per-predicate records.
- The cred-spec is itself WD v1.0 — track its churn; our normative reference needs a version/date pin.
- Where the decision doc should live upstream: its §31 recommends `docs/implementation-guide/boundaries/`;
  currently it's here in the exploration root awaiting TF review.
