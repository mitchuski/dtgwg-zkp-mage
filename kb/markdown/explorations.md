---
title: "Explorations Index"
section: "explorations"
source: "explorations/README.md"
built_from_commitish: "working-tree"
order: 40
---
# Explorations — the expansion ideas, built out

**Status:** Local design docs in the research root (`~/dtgwg-cred-spec-main_mage`). Not upstream, never
pushed. These docs iterate freely here and **promote to the workbench** (`~/dtgwg-zkp-tf-mage` — Mitch's
direct ToIP WG work) when they mature: runtime code lands in its `runtimes/` lab, review-ready drafts land
in its tracked tree at their upstream path. Spec text only moves via PR/issue after TF discussion. Full
loop: [Workflow — Workbench and Research Root](workflow.md).

This directory expands the nine-item opportunity register
(`~/dtgwg-zkp-tf-mage/runtimes/CRED-SPEC-OPPORTUNITIES.md`) from register entries into **clear, buildable
design docs** — one per idea, each stating the claim to prove, what already exists, the build plan, and the
upstream surface it could become. The register stays the index of *why*; these docs are the *how*.

## The governing frame

Two documents bind every exploration here:

1. **The Credentials Core Spec** (vendored at `../dtgwg-cred-spec-main/`) — defines the objects the proofs
   are about (six credential types, four DIDs, trust registry, two ZK constructions) and defers the ZK layer.
2. **The Predicate & Assurance-Boundary Decision Document** ([Decision — Overview](decision-overview.md),
   v0.1.0-draft, 2026-07-17) — the TF-shaped decision baseline. Its rulings supersede looser framings in the
   register and the runtime NOTES wherever they conflict. The ones that bite here:
   - **Statement selection precedes construction selection** (§2.1, §25) — no construction is ratified until
     the exact proposition, negative meaning, boundaries, and fixtures are approved.
   - **Profile split:** Minimum Liveness Profile (MLP) vs Extended Personhood Profile (EPP) (§7).
   - **A nullifier establishes scoped reuse detection, not "one unique human"** (§5.12, §13) — the narrow
     language is mandatory.
   - **Context = a governed linkability domain** with a canonical descriptor (§6), not an opaque string.
   - **Every material predicate carries a paired assurance boundary + disclosure boundary** (§1, §9).
   - **Agent authority is separate structured evidence**, never inferred from holder-key control (§7.3, §17).
   - **A bare nonce is insufficient** — freshness means canonical-transcript binding (§15).

## The ladder

Every exploration climbs the same ladder; each doc states where it stands.

```
idea (register entry) → design doc (here) → reference runtime (property tests) → circuit → upstream proposal
```

The decision doc's construction-selection gate (§25) sits between "reference runtime" and "circuit": the
statement + boundary records must be ratified before a construction is locked. Our property-test suites are
early drafts of its **conformance fixtures and negative tests** (§26).

## Index

| Doc | Register | Decision-doc anchor | Leverage | Ladder | One line |
|---|---|---|---|---|---|
| [O1 — Deferred ZK Layer](o1-deferred-zk-layer.md) | O1 | §25 gate · §7 profiles | 🔴 | design doc | DTG ZKP V1.0 = *the* conformant binding for the spec's two ZK constructions |
| [O2 — PHC by Nullifier](o2-phc-by-nullifier.md) | O2 | PR-UNQ (§13) | 🔴 | 🟢 **CIRCUIT** ([Lab — circom-gadget](lab-circom-gadget.md) 8/8, groth16: 11.5k constraints · 640 ms prove · 8 ms verify) | scoped reuse detection is the cryptographic leg of a PHC — narrow claim, exactly stated |
| [O4 — Registry ZK Revocation](o4-registry-zk-revocation.md) | O4 | PR-ISS (§12) · §22 | 🟠 | design doc (+rt 07 rule) | how a ZK proof reads a trust registry — snapshots, revocation, edge-admissibility |
| [O3 — IDVC Assurance Profile](o3-idvc-assurance-profile.md) | O3 | PR-LIV (§10) · §18 schema | 🟠 | design doc | the IDVC as the MLP's qualifying attestation — schema as the shared boundary |
| [VWC — Witness Seat](vwc-witness-seat.md) | rt 07 next | §15 transcript · VWC | 🟠 | design doc → runtime ext | the third seat in the dream cycle — a transcript-bound witness on the collision |
| [O7 — Agent Card ZK](o7-agent-card-zk.md) | O7 | PR-DEL (§17) · §7.3 | 🟠 | design doc | proofs *over* Agent cards as PR-DEL delegation evidence — never key-control alone |
| [O9 — VRC Promise Bundle](o9-vrc-promise-bundle.md) | O9 | §18 schema governance | 🟠 | design doc | promise-theoretic / economic VRC semantics as an extension the minimal schema carries |
| [O5 O6 O8 — Supporting Notes](o5-o6-o8-supporting.md) | O5·O6·O8 | PR-FRE (§15) · §6.2 · §24/§29 | 🟡 | design notes | transcript conformance harness · pools cross-pollination · PQ path |

## The X-series (second wave, 2026-07-17 — exploration-born, beyond the O-register)

Where the O-series carried the opportunity register forward, the X-series explores what the **decision
baseline itself** opens: each doc develops a §-anchor the baseline rules but does not yet mechanise.

| Doc | Decision-doc anchor | Leverage | Ladder | One line |
|---|---|---|---|---|
| [X1 — Conformance Fixtures](x1-conformance-fixtures.md) | §26/§26.1 · §25 item 10 | 🔴 | 🟢 reference **v2** ([Lab — fixtures](lab-fixtures.md) 13/13 · register = 95 entries, one vocabulary lab-wide · §26.1 **11/11**) | the fixtures ARE the interop layer — vectors + a normative rejection-reason register + lint vectors for negative meanings |
| [X2 — Context Legibility Instrument](x2-context-legibility-instrument.md) | §6.8 · §2.5 · §27.4 | 🟠 | 🟢 instrument ([Lab — context-card](lab-context-card.md) 13/13) | the context card derived from the §6.2 descriptor itself — legibility as derivation, not audit; MyTerms' verifier-side twin |
| [X3 — Trust Task Composition](x3-trust-task-composition.md) | §2.6 · §27.2 · §15.2 | 🔴 | 🟢 reference ([Lab — show-composition](lab-show-composition.md) 10/10) | the show is one transcript — joint disclosure is wider than the union; governed bundle profiles over à-la-carte requests |
| [X4 — Observable Event Minimisation](x4-observable-event-minimisation.md) | §20 · §19 · §6.6 | 🟠 | 🟢 reference ([Lab — quiet-presentation](lab-quiet-presentation.md) 8/8) | per-observer leakage budgets, the "quiet presentation" tier, and a log-field register — pools traffic-analysis discipline imported |
| [X5 — Recovery and Rotation](x5-recovery-rotation.md) | §29 · §13.4 · §22 | 🔴 | 🟢 reference ([Lab — rotation](lab-rotation.md) 10/10) | routine rotation never touches enrolment; catastrophic recovery gets recovery-domain nullifiers — no old→new correlator |
| [X6 — Assurance Horizons and Erosion Clocks](x6-assurance-horizons-erosion-clocks.md) | §5.9 · §22.1 · §2.4 | 🟡 | 🟢 reference ([Lab — erosion-record](lab-erosion-record.md) 8/8) | §22.1's ten clocks sorted into certification vs erosion families; "for how long" as a rate, not a cliff — the PVM reading |

**Third wave (2026-07-18)** — the last uncovered §-anchors plus X5's deferred pattern:

| Doc | Decision-doc anchor | Leverage | Ladder | One line |
|---|---|---|---|---|
| [X7 — Mediated Proving Profile](x7-mediated-proving-profile.md) | §21 · §6.6 · §23 | 🟠 | 🟢 reference ([Lab — mediator](lab-mediator.md) 9/9) | mediator taxonomy (blind/semi-trusted/prohibited honeypot), the four-exit declared-downgrade state machine, P-ISOLATE/P-FORGET as testable controls — completes X4's deferred budget row |
| [X8 — Multi-Issuer Aggregation](x8-multi-issuer-aggregation.md) | §12.5 · §29 · §2.4 | 🟠 | 🟢 reference ([Lab — multi-issuer](lab-multi-issuer.md) 10/10) | ∏ε_i as a theorem with assumptions explicit; the independence register makes A2 checkable; k IS the disclosure (governed k-tiers); honest about PR-PER vs PR-LIV |
| [X9 — Guardian Recovery](x9-guardian-recovery.md) | §29 social leg · §13.4 · §22.2 | 🟠 | 🟢 reference ([Lab — guardian-recovery](lab-guardian-recovery.md) 12/12) | X5's deferred pattern 3: recovery-witness credential (VWC-shaped, own shape — threshold ≠ witness), expiring guardianship answers §22.2, personhood-gated guardians kill the Sybil-self-guardian attack, trust graph = guardian candidate set |

**Fourth wave (2026-08-11)** — operations, not spec: the CIRCUITS.md production-ceremony caveat made actionable:

| Doc | Decision-doc anchor | Leverage | Ladder | One line |
|---|---|---|---|---|
| [X10 — Ceremony as Trust Task](x10-ceremony-as-trust-task.md) | §15 · §19 · §25 · §7.3 | 🟠 | 📝 design doc | agents orchestrate entropy, never *are* the entropy (never-sees-the-secret guard inherited from the witness seat); three lanes — verification-transcript registry now, phase-1 powers-of-tau low-regret, phase-2 GATED behind §25; seat gating = governance, nullifier dedup advisory-only (the recursion labelled) |

**Fifth wave (2026-08-15)** — the deployment bridge: the TF work reaching *out* into a shipping product
(the reverse direction from X6):

| Doc | Decision-doc anchor | Leverage | Ladder | One line |
|---|---|---|---|---|
| [X11 — The Field Guide Deployment](x11-field-guide-deployment.md) | rt 07 (all of it) · rt 01 (by absence) · X1 §7 · X6 §6 · X4 §5 | 🟢 | 🟢 reference (`field_guide_privacymage/runtimes/`: lab-bridge 10/10 importing rt 07 + rt 01 directly · meet-overlay 54/54 · fixtures 8/8 · consumer-py 15/15) | runtime 07's first external consumer — a walking AR game (Hitchhikers Field Guide / OASIS): six gates survive the phone-to-phone substrate change, the street adds exactly four asserted gates, and the deployment found the hole — rt 07 gates every edge on personhood, modelling only the community-anchored construction; the conformant *pairwise* case had never been exercised |

Cross-links worth knowing: X1 is the format every other doc's fixtures inherit; X4's uniform-error rule
is in deliberate tension with X1's reason register (resolved by splitting internal vocabulary from the
external surface); X5 completes O2's open question; X6 is the research bridge to the PVM corpus
(informative only, never normative); X7 completes X4's deferred mediated-path row and gives X2's card
q5 its mechanism; X8 prices its k-disclosure with X3's degree-leakage calculus and stores ε_i on X6's
certification clock; X9 inherits the VWC seat's separation property (W4) one level up. The TF-facing
summary of the whole programme is [Briefing 2026-07-18 — ZKP Explorations](briefing-2026-07-18-zkp-explorations.md).

## Reading order

The decision document first — it is the baseline everything binds to. Then O1 (the charter frame: fill the
deferred layer, don't build a parallel scheme), O2 → O4 (the charter core, sharing one Poseidon-Merkle
gadget), O3 (the biometric-provider boundary, Chair's domain), VWC (nearest runnable extension), and O7/O9
(where agentprivacy reaches past the spec). O5/O6/O8 are cheap reuse.

## Shared build spine

Three explorations converge on **one circom gadget**: Poseidon nullifier + Merkle membership over an
epoch-rooted set. O2 uses it for PR-UNQ scoped reuse detection, O4 for PR-ISS registry set-membership,
VWC/rt 07 for the endpoint-personhood check inside edge-admissibility. Build it once, in the runtime-01
circom port — but per §25, only after the statement + boundary records for those predicates are drafted
(each exploration doc carries its draft).
