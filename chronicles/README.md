# Chronicles — the lab's narrative record, with its runtime traces

The lab keeps two kinds of record. The suites and registers are the **evidence** — every claim
a property test, every rejection a named string. These files are the **telling**: a chronicle
per significant day, written in the maintainer's working suite and reflected here so
collaborators can follow *why* the lab moved the way it did, with the runnable traces beside
each claim. Each chronicle opens with a provenance header listing its **runtime traces** — the
suites, registry entries, issues, and documents that carry its claims — so nothing in the
narrative asks to be taken on faith: run the trace.

Chronicles follow the same discipline as everything else here (see `AGENTS.md` /
`DRAFTING-RULES.md`): say only what the tests already hold. A chronicle is *not* normative and
*not* a spec artifact — it is the working record of a research programme, kept honest by
pointing at its evidence.

## The arc so far

Each chronicle names one inversion — the thing that happened in the opposite of the usual order,
and why that ordering is the method.

| date | chronicle | inversion | evidence spine |
|---|---|---|---|
| 2026-07-16 | [Trust-Graph Formation as a Dream-Agent Cycle](2026-07-16_trust-graph-formation-dream-cycle.md) | **formation before verification** — model how the graph grows before proving predicates about it | `runtimes/07-trust-graph-formation/` 11/11 |
| 2026-07-18 | [The First Circuit](2026-07-18_the-first-circuit.md) | **meaning before constraints** — the circuit came last; by then it had nothing to decide but arithmetic | `runtimes/circom-gadget/`, `explorations/`, the decision doc |
| 2026-07-28 | [The Thread Returns](2026-07-28_the-thread-returns.md) | **evidence before ratification** — every frame item on the first call's agenda already had a suite that would fail if it were false | upstream [#10](https://github.com/trustoverip/dtgwg-zkp-tf/discussions/10), `runtimes/README.md` |
| 2026-08-11 | [The Registry Opens](2026-08-11_the-registry-opens.md) | **refutation before publication** — the registry's first finding falsified its own maker's claim, hours before going live | `explorations/X10-…`, `runtimes/ceremony-orchestrator/` 8/8, `CIRCUITS.md` |
| 2026-08-12 | [Both Faces on the Table](2026-08-12_both-faces-on-the-table.md) | **speech after proof** — nothing said to the group claims what a green suite or public row doesn't already hold | registry entries `0004`/`0005`, [RAHP #8](https://github.com/trustoverip/dtgwg-rahp-tf/discussions/8) |
| 2026-08-14 | [The Seat Follows the Run](2026-08-14_the-seat-follows-the-run.md) | **admission after evidence** — the first external participant arrived proof-first; the seat could follow because it carries no security weight | issues [#1](https://github.com/mitchuski/dtgwg-zkp-mage/issues/1)/[#2](https://github.com/mitchuski/dtgwg-zkp-mage/issues/2), entry `0006`, `registry/ACCEPTANCE-FLOW.md` |
| 2026-08-18 | [The Clock Ticks Without a Break](2026-08-18_the-clock-ticks-without-a-break.md) | **the horizon moved before the mathematics** — a substrate lost its future while keeping its soundness; the erosion clock ticked with no break anywhere | `explorations/NOTE-2026-08-18-ef-substrate-pivot.md`, `runtimes/erosion-record/` 8/8, `CIRCUITS.md` |
| 2026-08-18 | [Ancestry Under the Register](2026-08-18_ancestry-under-the-register.md) | **lineage qualifies like evidence** — the lab's own ancestry is cited only where a stranger can follow it; private and uncommitted work is hearsay about oneself | [agentprivacy-harness](https://github.com/mitchuski/agentprivacy-harness), [kyra_gatehouse](https://github.com/mitchuski/kyra_gatehouse), [uor-kappa-mage](https://github.com/mitchuski/uor-kappa-mage), [agentprivacy.ai/model](https://agentprivacy.ai/model) |
| 2026-08-28 | [The Board Is the Book](2026-08-28_the-board-is-the-book.md) | **the list needed a kitchen** — a board that cannot be cooked from is a survey; the card makes the row checkable, and the rule that vets a proof (voucher ≠ holder) is the rule that vets the process (constructor ≠ runner ≠ verifier) | `board/` 28/28, card `010`, upstream [PR #20](https://github.com/trustoverip/dtgwg-zkp-tf/pull/21), [#18](https://github.com/trustoverip/dtgwg-zkp-tf/discussions/18) |
| 2026-09-05 | [The Book Takes a Name](2026-09-05_the-book-takes-a-name.md) | **the story stays home; the teaching travels** — the spellbook contributed exactly the part of itself that is not a story, by rule not by editing; what survived as more than text was its protocol: the proverb that precedes every lesson now precedes every push | `board/` 43/43, `zkbook/` (records · primer · pantry · stacks · recipes, rendered), `board/records/ADR-001.json`, `board/stacks/`, `tools/push-rite.mjs`, upstream [#31](https://github.com/trustoverip/dtgwg-cred-spec/issues/31), [PR #30](https://github.com/trustoverip/dtgwg-cred-spec/pull/30), [cred-tf #39](https://github.com/trustoverip/dtgwg-cred-tf/discussions/39) |
| 2026-09-05 | [The Text Cannot Outrun Its Records](2026-09-05_the-text-cannot-outrun-its-records.md) | **the text cannot outrun its records** — the drafting rules became a validator and the validator became the specification's own refutation of its prose: generated sections carry a digest of their sources and the repository's CI fails when they drift; the kitchen words were scaffolding and left by script; the rule that excludes narrative caught the tool | `board/` 47/47, `zkbook/conformance/` (17/17 valid, stamp current in the spec clone), `tools/zkbook-export.mjs`, `zkbook/COMMIT-PLAN.md`, drafts H/P/G/J/K/L/M, upstream [dtgwg-zkp-spec](https://github.com/trustoverip/dtgwg-zkp-spec) |

## How these are produced (the reflection system)

One event, many tellings, one invariant core. The maintainer's suite keeps several chronicle
voices — a framework-voice master series (the source of these), a knowledge-graph dream record,
a city ledger, and others — and a chronicle is *reflected* between them: rewritten to match each
destination's register while compressing back to the same facts. The copies here are the
**collaborator-facing type**: paths repo-relative, every claim traced to something in this repo
or on the public record, no vocabulary that `AGENTS.md` doesn't gloss. The master copy remains
the source of truth; a divergence between a reflection and its source is a defect in the
reflection.

Reflections land here only after the maintainer has read (and for load-bearing entries, signed)
the master — the same acceptance-before-publication separation the registry itself uses.
