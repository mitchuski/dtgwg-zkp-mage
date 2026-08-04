# Path map — where the work lives, and where you could stand in it

This document is for task force members and their AI assistants. Point your
assistant here (it should read [`AGENTS.md`](./AGENTS.md) first) and ask it to
walk the paths that touch your expertise, then compile a **position record**
(protocol at the bottom): which aspects you ratify, which you'd refine, which
you refute, and which you could build with us.

The task force outcomes this maps onto: the **Predicate & Assurance-Boundary
decision document** (ratification in progress, upstream
[discussion #10](https://github.com/trustoverip/dtgwg-zkp-tf/discussions/10)),
**construction selection** (sequenced behind boundary ratification), and the
**DTG ZKP V1.0 Working Draft for IIW #43 (3–5 Nov 2026)**.

Deep navigation: every path below has fuller pages in
[`kb/markdown/INDEX.md`](./kb/markdown/INDEX.md). Every 🟢 is a suite you can run.

---

## P1 · The decision frame

**Question:** what does each predicate establish, not establish, disclose, and to whom — decided, not surveyed.
**Read:** [decision §1 executive](./kb/markdown/decision-01-executive-decision.md) · [§6 foundational context decision](./kb/markdown/decision-06-foundational-context-decision.md) · [§28 open ratification points](./kb/markdown/decision-28-open-decisions-for-task-force-ratification.md) · upstream [DRAFTING-RULES](https://github.com/trustoverip/dtgwg-zkp-tf/blob/main/DRAFTING-RULES.md)
**Open:** B1 context delimiter · B2 issuer–verifier collusion target · the §28 list.
**Collaborate if:** you hold governance, accreditation-framework, or legal-accountability expertise — the frame allocates accountability, and that allocation needs adversarial review.

## P2 · The canonical layer — context and transcript

**Question:** what *is* a context, as bytes; what must a presentation transcript bind.
**Read:** [lab canonical](./kb/markdown/lab-runtimes.md) · [X2 context legibility](./kb/markdown/x2-context-legibility-instrument.md) — **Run:** `runtimes/canonical` 11/11 · `runtimes/context-card` 13/13
**Claim under test:** a bare nonce is insufficient (it's a *failing test*, not an opinion); the §6.8 "six questions" derive mechanically from the descriptor.
**Open:** descriptor field set ratification; the context card as a conformance artefact.
**Collaborate if:** you run verifier infrastructure — tell us which descriptor fields your logs could actually honour.

## P3 · Uniqueness and nullifiers (PR-UNQ)

**Question:** scoped reuse detection — *not* "one unique human" — and what that narrowing buys.
**Read:** [decision §13 PR-UNQ](./kb/markdown/decision-13-pr-unq-scoped-reuse-detection.md) · [O2 PHC-by-nullifier](./kb/markdown/o2-phc-by-nullifier.md) · [Semaphore v4 cross-check](./kb/markdown/semaphore-v4-crosscheck.md) — **Run:** `runtimes/01-uniqueness-nullifier` 9/9
**Open:** enrolment-root-in-nullifier-preimage · Semaphore-compat as optional second profile.
**Collaborate if:** you've deployed Semaphore/anon-credential systems — we found their circuits structurally conformant but byte-incompatible, and one accidental gap (no in-circuit transcript binding); a second pair of eyes on that cross-check is valuable.

## P4 · Circuits and benchmarks (construction selection)

**Question:** what does the §25 construction-selection gate admit, at what measured cost.
**Read:** [`CIRCUITS.md`](./CIRCUITS.md) (the full which-proofs/which-circuits/how-to-run answer, with a verbatim run transcript) · [lab circom-gadget](./kb/markdown/lab-circom-gadget.md) · [decision §25](./kb/markdown/decision-25-construction-selection-gate.md) — **Run:** `runtimes/circom-gadget` (needs npm install; 10/10 + 7/7 + 8/8)
**Evidence in hand:** three real Groth16 circuits — single nullifier+membership+transcript-binding (**11,523 constraints, ~640 ms prove, ~8 ms verify, 722 B proof**), dual-issuer k=2 (10,717), guardian t=3 (16,078). Transcript binding cost exactly +1 constraint.
**Open:** public signal layout `[context, root, nullifier, transcriptDigest]` ratification · production trusted-setup ceremony · EdDSA identity for PR-HLD.
**Collaborate if:** you are a circuit engineer — refute a constraint count, propose a PLONKish or folding alternative through the §25 gate, or pressure-test the lab ceremony caveat.

## P5 · Conformance and interop

**Question:** can two independent implementations agree, byte for byte, on accept/reject and *why*.
**Read:** [X1 fixtures](./kb/markdown/x1-conformance-fixtures.md) · [lab consumer-py](./kb/markdown/lab-consumer-py.md) — **Run:** `runtimes/fixtures` 13/13 · `runtimes/consumer-py` 6/6
**Evidence in hand:** 95-entry rejection-reason register (every entry triggered live), 39 vectors, and a zero-shared-code Python consumer re-deriving **29/29 digests byte-exactly**.
**Open:** §26.2 fixture-format adoption upstream.
**Collaborate if:** you can write a **third** consumer in any language — each independent implementation is an interop proof the spec can cite.

## P6 · The presentation surface

**Question:** what a show *is* (atomic, one transcript) and what a presentation *leaks* to each observer.
**Read:** [X3 composition](./kb/markdown/x3-trust-task-composition.md) · [X4 observable events](./kb/markdown/x4-observable-event-minimisation.md) — **Run:** `runtimes/show-composition` 10/10 · `runtimes/quiet-presentation` 8/8
**Open:** who governs the bundle-profile registry · the log-retention "two faces" question (certification clock or erosion clock — genuinely unresolved).
**Collaborate if:** you operate anything with production telemetry — the §19 observer budget needs collision with real logging practice.

## P7 · Lifecycle — rotation, recovery, erosion

**Question:** what survives key loss, guardian churn, and time itself.
**Read:** [X5 rotation](./kb/markdown/x5-recovery-and-rotation.md) · [X9 guardian recovery](./kb/markdown/x9-guardian-recovery.md) · [X6 erosion clocks](./kb/markdown/x6-assurance-horizons-and-erosion-clocks.md) — **Run:** `rotation` 10/10 · `guardian-recovery` 12/12 · `erosion-record` 8/8
**Design position:** routine rotation never touches enrolment; catastrophic recovery is issuer-blind; guardianship expires and re-affirms; assurance decays as a **rate, not a cliff**.
**Open:** guardian t/n as profile parameters · the ten-clock sort.
**Collaborate if:** you've run credential recovery at scale — contested-recovery is our hardest honest case (honest user and attacker are observably identical at the freeze).

## P8 · Multi-issuer aggregation and collusion (B2's evidence)

**Question:** when do k issuer attestations actually mean k, and what does issuer–verifier collusion get.
**Read:** [X8 multi-issuer](./kb/markdown/x8-multi-issuer-aggregation.md) — **Run:** `runtimes/multi-issuer` 10/10
**Design position:** issuer independence is *declared* (dependency classes in a registry); correlated issuers collapse to one component and the bound always weakens; the collusion target should be stated as an (adversary, horizon, ε-register) triple.
**Open:** ε-register fields · who certifies dependency classes.
**Collaborate if:** you know real issuer ecosystems — the dependency-class taxonomy needs grounding in how issuers actually share infrastructure.

## P9 · Mediated proving and fallback

**Question:** what happens when the holder's device can't produce the preferred proof.
**Read:** [X7 mediated proving](./kb/markdown/x7-mediated-proving-profile.md) · [decision §21](./kb/markdown/decision-21-mediated-proving-and-fallback.md) — **Run:** `runtimes/mediator` 9/9
**Design position:** honeypot-tier mediators are unbuildable at the constructor; downgrade is a declared four-exit state machine — silent step-down is structurally unconstructable.
**Open:** mediation tiers in profiles · delegated proving (flagged research, not settled).
**Collaborate if:** you build mobile/browser provers — the T0/T1 split needs testing against real device constraints.

## P10 · The trust graph, witnesses, and sampling

**Question:** how edges form (bilateral consent + personhood gate), what a witness may attest, and whether sampling can scale verification over big VRC collections ([discussion #11](https://github.com/trustoverip/dtgwg-zkp-tf/discussions/11)).
**Read:** [lab 07 trust-graph](./kb/markdown/lab-07-trust-graph-formation.md) · [VWC witness seat](./kb/markdown/vwc-witness-seat.md) — **Run:** `runtimes/07-trust-graph-formation` 11/11 · `runtimes/witness-seat` 15/15
**Open:** #11's four questions — commitment binding (our transcript is a candidate), list inflation (edge admissibility is a candidate answer), identifier privacy (per-show nullifiers are a candidate answer), and the (p, δ) policy thresholds (a governance decision, not a math one).
**Collaborate if:** you have statistics or election-audit background — #11's hypergeometric model deserves independent verification before it shapes scope.

---

## Position protocol

Ask your assistant to produce one record per path you care about, in this shape:

```markdown
### Position — P4 · Circuits and benchmarks
- **Member:** <name, affiliation>
- **Position:** ratify | refine | refute | build
- **On what, exactly:** <the specific claim, decision item, or artefact — cite the file or § >
- **Reasoning:** <bound by the drafting rules: name the adversary, name the horizon,
  keep the negative space, label conjecture>
- **Evidence:** <optional but golden: a failing test, a paper, deployment data, prior art>
- **What I/we could bring:** <review · independent implementation · circuit work ·
  deployment data · governance/accreditation expertise · standards liaison · nothing yet>
```

Routing:
- Positions on **task-force decisions** (ratify/refine/refute on P1–P10 "Open" items) →
  the relevant [upstream discussion](https://github.com/trustoverip/dtgwg-zkp-tf/discussions),
  under your own name. Silence on ratification items reads as assent — a filed
  position is worth more than either.
- Findings about **this repository's evidence** (a bug, a refutation, a broken
  vector, an offer to build) → [an issue here](https://github.com/mitchuski/dtgwg-zkp-mage/issues).
  A refutation with a failing test attached is the most useful thing you can send.

Disagreement is not friction here — the decision document exists *because* the
earlier drafts contradicted themselves, and the correction came from review. A
well-formed "refute, because, evidence" moves the task force faster than three
unqualified approvals.
