---
title: "X3 — Trust Task Composition"
section: "explorations"
source: "explorations/X3-trust-task-composition.md"
built_from_commitish: "working-tree"
order: 52
---
# X3 — Trust-task composition and joint leakage: the show is one transcript

*A real trust task never requests one predicate. It composes several PR-* predicates into a single
presentation — a **show** — and §27.2 states the danger plainly: "Bundled proofs that are individually
sound may leak jointly." This doc gives the composition its algebra, its joint disclosure boundary, and a
governed remedy: named bundle profiles instead of à-la-carte predicate requests.*

**Register:** X-series (new, beyond the nine-item register) · leverage 🔴 · **Ladder:** reference built
2026-07-17 — [Lab — show-composition](lab-show-composition.md) 10/10; bundle registry v0 (5 bundles);
M1 worksheet + M5 joint session remain design-doc work (see its NOTES.md)
**Anchor (cred-spec):** trust-task boundary — credential = true standing alone; artifact = `threadId`-
correlated exchange object; `taskContext` binds a credential to its ceremony, never completion evidence.
**Anchor (decision doc):** §2.6 composition can defeat an individually sound proof · §27.2 trust tasks ·
§15.2 canonical transcript ("requested predicates" is a required field) · §18.4 combination analysis ·
§19 disclosure-boundary observers · §20 observable events · §2.4 three-parameter claims.

---

## The gap the decision doc names but does not fill

Every PR-* entry in the register (§9) carries a *paired* boundary analysis — per predicate. But a
representative trust-task show composes PR-LIV + PR-ISS + PR-UNQ + PR-FRE, possibly + PR-DEL, and the
decision doc rules the failure mode without ruling the model: "an individually zero-knowledge transcript
can participate in a system that is correlatable or reconstructive" (§2.6); "leave proof composition
undocumented" is a prohibited construction (§24); "the transcript, purpose, scope, and multi-proof
composition model require joint definition" with Trust Tasks (§27.2). This doc drafts that joint model
from our side of the table.

## The claim

**A show's disclosure boundary is a property of the predicate set, and it is strictly wider than the
union of the per-predicate disclosure boundaries.** Three mechanisms, all already latent in the baseline:

1. **Intersection narrowing.** Each predicate's derived disclosure (assurance class, policy version,
   issuer-set choice, epoch, proof shape) is a population filter; the show intersects the filters. §18.4
   states the rule for schema fields — "non-identifying separately but identifying together" — and it
   applies unchanged to composed predicates.
2. **Request-pattern leakage.** The predicate set requested is itself an observable event: transcript
   fields "can reveal verifier, audience, purpose, requested predicates, risk posture" (§15.4), and "the
   request pattern can itself disclose behaviour" (§20). A rare combination (e.g. +PR-DEL, or PR-RNG with
   a narrow range) fingerprints the vertical, the verifier's risk posture, and hence the holder's activity.
3. **Cross-show correlation.** Two shows in different contexts sharing *no* identifiers still present a
   correlatable pair (bundle shape, proof sizes, timing, retry pattern) to the §19 observers — multiple
   verifiers colluding and the network observer foremost. Context separation (§6) can be defeated by
   bundle shape alone.

## The composition algebra, sketched

- **Atomicity.** All predicates in one show bind ONE canonical transcript — §15.2 already lists
  "requested predicates" as a required field, so the baseline quietly makes the show, not the predicate,
  the unit of freshness. Rule: a show verifies as a whole or fails as a whole; no partial acceptance, no
  transplanting a member proof into a different transcript (§15.1).
- **Boundary records at show level.** Per §26 each predicate carries assurance + disclosure records; a
  composed show additionally carries a **joint disclosure record** in three-parameter form (§2.4):
  against whom (the §19 observer list, per bundle), for how long (the longest-lived member linkage —
  PR-UNQ's epoch dominates), alongside what (the other members, explicitly enumerated).
- **Bundle profiles.** Instead of verifiers composing à la carte, the profile registers **named,
  versioned predicate bundles** — MLP-BASE = {PR-LIV, PR-ISS, PR-HLD, PR-FRE}, EPP-UNIQ = MLP-BASE ∪
  {PR-PER, PR-UNQ}, +DEL variants — exactly as cipher suites replaced à-la-carte algorithm negotiation.
  Small governed vocabulary, large anonymity set per bundle; a request outside the registry is a §26.1
  negative-test rejection. This is the same cardinality-control instinct as §18.3's prohibition on
  high-cardinality extensions, lifted to the request layer.
- **The credential/artifact wall.** Composition MUST NOT let a `taskContext`-bearing credential (VWC and
  kin) stand in for outcome evidence: a bundle may *include* a ceremony-bound credential but the show's
  established statement never crosses into task completion — that lives with the reachable outcome
  artifact, `threadId`-correlated, on the Trust Task side of the boundary. Negative meaning, stated: a
  valid show does not establish that any task was performed, completed, or performed well.

## What exists

- O9's "economic composition" note is the seed: n distinct-counterparty PR-PRM proofs reveal degree ≥ n —
  degree *is* the disclosure. This doc generalises that from one extension to the whole register.
- §15.2's transcript field list — the atomicity anchor is already normative text, not new machinery.
- rt 07 trust-graph-formation: shows are the edge-formation events; a bundle-profile field on the show
  object is a small extension with existing property-test scaffolding.
- O5's transcript conformance harness — the natural place for joint negative tests.

## Build plan

- **M1 — joint-disclosure worksheet:** for the four-predicate representative show, run the full §19
  observer × §19 surface matrix once, honestly; publish the delta over the union of per-predicate records.
- **M2 — bundle-profile registry draft:** named bundles, versioning, change control on the §6.7
  context-authority pattern; à-la-carte requests as a profile violation.
- **M3 — show-level boundary record schema** (extends Appendix B's compact form with `bundleId`,
  memberPredicates, joint three-parameter claim).
- **M4 — reference model in the lab:** show object binding one transcript; properties: atomicity
  (partial acceptance rejected), replay-across-transcript rejected (§26.1), bundle-outside-registry
  rejected, taskContext-as-outcome rejected.
- **M5 — joint session with Trust Tasks:** the composition model is explicitly a §27.2 co-owned
  deliverable; bring M1+M2 as the ZKP-side draft.

## Upstream surface

Joint work with the Trust Task workstream (§27.2): they own request semantics and outcome artifacts; we
own transcript binding and the disclosure calculus. The bundle-profile registry is the shared object —
proposed as a section of the profile spec plus a governed registry, mirroring the context-authority model.

## Open questions

- **Uniformity vs honesty:** padding proof sizes and coarsening timing (§20 minimisation) shrinks bundle
  fingerprints but costs mobile provers — where is the floor for the consumer-device envelope (§25)?
- **Recursive composition:** if folding makes an n-predicate show one proof (§29 open item), bundle shape
  collapses to one size — does that *solve* fingerprinting, or move it into proving-time side channels?
- **Bundle registry authority:** same body as context authority (§6.7), or Trust-Task-owned? The two
  registries interlock — a context descriptor may need to name its admissible bundles.
- **Cross-show budget:** should a profile state a linkage budget (how many shows per context per epoch
  before intersection narrowing defeats the anonymity-set claim)? §2.4's "for how long" hints yes.
