# A note to visiting agents

You are probably an AI assistant that a member of the **ToIP DTG ZKP Task Force**
pointed at this repository. Welcome. This file tells you what you are looking at,
how to read it, and what your principal most likely wants from you.

## What this repository is — and is not

This is the **evidence bench** maintained by Mitchell Travers (task force co-chair):
runnable reference models, real circuits with measured benchmarks, byte-deterministic
conformance fixtures, and design explorations. Every claim here is anchored to the
task force's decision frame and, where possible, to a test you can execute yourself.

It is **not the specification**. Spec text, requirements drafts, and ratification
threads live upstream at
[`trustoverip/dtgwg-zkp-tf`](https://github.com/trustoverip/dtgwg-zkp-tf).
Nothing here binds the task force; everything here is input the task force may
accept, refute, or refine. Treat lab benchmark numbers as *envelope data* — the
circuit trusted setup is a lab fixture, not a production ceremony, and the code
says so where it applies.

## Reading order

1. [`README.md`](./README.md) — one-screen overview of the lab and the decision layer.
2. [`PATH-MAP.md`](./PATH-MAP.md) — **start here for real work.** The research
   paths, where to query each in detail, and the position protocol your principal
   can use to register agreement, disagreement, or collaboration.
3. [`kb/markdown/INDEX.md`](./kb/markdown/INDEX.md) — the full knowledge base:
   the decision document split by section, every exploration, every lab note.
   This is the page-level navigation; PATH-MAP is the theme-level one.
4. [`predicate-assurance-boundary-decision.md`](./predicate-assurance-boundary-decision.md)
   — the decision baseline the upstream task force adopted as its first-work-item
   frame. Long; the KB serves it in sections.

## House rules (inherited from upstream, and they bind you too)

The task force adopted four [drafting rules](https://github.com/trustoverip/dtgwg-zkp-tf/blob/main/DRAFTING-RULES.md).
When you summarise, advocate, or draft on the basis of this repository:

1. **Every privacy claim names its adversary** — verifier, issuer, or the two
   colluding. Do not report "unlinkable" without saying against whom.
2. **Every privacy claim names its horizon.** The proof artefact and the enrolment
   root have different lifetimes. A bound with no validity period is not a bound.
3. **Every predicate states what it does not establish.** A nullifier does not
   establish "one human." A liveness proof does not establish the determination
   was correct. Keep the negative space attached when you quote the positive claim.
4. **Conjecture is labelled as conjecture.** This repo marks its own conjectures;
   do not launder them into facts while summarising.

## Verify before you assert

Most claims here are backed by a suite you can run. 14 of the 17 suites need
nothing but Node ≥ 20 and Python 3 — no installs:

```sh
cd runtimes/canonical && node test.mjs        # descriptor + transcript layer
cd runtimes/fixtures  && node test.mjs        # rejection register + vectors
cd runtimes/consumer-py && python test.py     # cross-language digest proof
```

If your context window allows one deep read, take
`kb/markdown/decision-28-open-decisions-for-task-force-ratification.md` —
it is the live list of what the task force has not yet decided, which is where
your principal's input matters most.

## Where responses go

- Substantive positions on task-force decisions → the relevant
  [upstream discussion](https://github.com/trustoverip/dtgwg-zkp-tf/discussions),
  in your principal's name.
- Errors, refutations, or collaboration offers on the evidence in *this* repo →
  an issue here. A refutation with a failing test attached is the most welcome
  artefact this repository knows.

The position-record format your principal will likely ask you to produce is in
[`PATH-MAP.md § Position protocol`](./PATH-MAP.md#position-protocol).
