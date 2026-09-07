# dtgwg-zkp-mage

Working lab + explorations for the [ToIP **DTG ZKP Task Force**](https://github.com/trustoverip/dtgwg-zkp-tf)
(Decentralized Trust Graph WG, ToIP/LFDT) — maintained by Mitchell Travers (co-chair, Soulbis).

This is **evidence, not spec**: runnable reference models, real circuits with benchmark numbers,
cross-language interop proofs, and design explorations — each anchored to the task force's
[Predicate & Assurance-Boundary decision frame](./predicate-assurance-boundary-decision.md) and the
[DTG Credentials Core Specification](https://trustoverip.github.io/dtgwg-cred-spec/). Spec text goes
through the upstream repositories and the TF process; this repo is the bench the proposals were tested on.

## Three repositories, one rule — and the ZK Book edition

| repository | holds | what leaves it |
|---|---|---|
| [`trustoverip/dtgwg-zkp-tf`](https://github.com/trustoverip/dtgwg-zkp-tf) | requirements (v0.4), drafting rules, discussions, the board thread (#18), `AGENT-RUNTIMES.md` | decisions and requests |
| [`trustoverip/dtgwg-zkp-spec`](https://github.com/trustoverip/dtgwg-zkp-spec) | the specification as **construction records**, the requests they answer, public-input conventions, proving-system entries, considerations, conformance — and `conformance/`, the validator + CI that check the generated text against the records | the rendered specification; record ids others may `[[xref]]` |
| this repository | the evidence: runtimes with measured costs, fixtures, the verification registry, the **board** where records are written and advanced, the generator (`board/tools/board.mjs spec`) that renders records into specification text, and the **ZK Book** edition (`zkbook/`) | data — records, fixtures, registry row ids — never a dependency |

The rule: nothing in the specification says more than a record shows; no record says more than a runtime
measured; no runtime says more than a stranger reproduced. The **ZK Book** (`zkbook/`) is this repository's
edition of the same records in the same chapters, kept beside what a specification cannot carry — the board
with each record's state and history, the drafts and the rite that gates them, the watch over upstream
threads, the run notes and the chronicles. Reading the specification is reading the book with the working
removed. `node tools/zkbook-export.mjs` writes the specification into a clone of the spec repository in its
own skeleton; see `zkbook/README.md` and `zkbook/COMMIT-PLAN.md`.

**Task force members, start here:** [`THE-WORK-SO-FAR.md`](./THE-WORK-SO-FAR.md) is the
4-minute human summary. Point your AI assistant at [`AGENTS.md`](./AGENTS.md) (its
introduction to this knowledge base) and [`PATH-MAP.md`](./PATH-MAP.md) (the research
paths + the position protocol for registering what you'd ratify, refine, refute, or build).

**Browse it as a wiki:** [`kb/markdown/INDEX.md`](./kb/markdown/INDEX.md) — the whole corpus
(decision document §-split, explorations, lab notes, chronicles) as a deterministic, manifest-first
knowledge-base projection. Same content also ships as FedWiki page JSON in `kb/fedwiki/`.

## The lab — `runtimes/`

18 suites, 178 properties, all green. 14 suites are **zero-dependency** (Node stdlib + Python stdlib) —
clone and run, nothing to install (`ceremony-orchestrator` is zero-dep too, but verifies the circuit
build, so it runs after the circom setups):

```sh
cd runtimes/canonical      && node test.mjs   # §6.2 descriptor + §15.2 transcript encodings, 11/11
cd runtimes/fixtures       && node test.mjs   # 26-code rejection register + 39 vectors, 13/13
cd runtimes/consumer-py    && python test.py  # second-language consumer: 29/29 digests byte-exact
```

| Area | Suites | What it proves |
| --- | --- | --- |
| Predicates | `01-uniqueness-nullifier` · `07-trust-graph-formation` (+ stubs 02–06) | scoped nullifier w/ self-Sybil rejection; graph formation = collision→edge→propagation |
| Canonical layer | `canonical` | context descriptor + transcript digests; bare nonce insufficient is a *failing test* |
| Conformance | `fixtures` · `consumer-py` | byte-deterministic vectors; register v2 (95 entries, all triggered live); Python consumer = interop existence proof |
| Presentation | `context-card` · `show-composition` · `quiet-presentation` | context legibility; atomic bundle shows; observer leakage budget |
| Lifecycle | `rotation` · `guardian-recovery` · `erosion-record` · `multi-issuer` · `mediator` · `witness-seat` | key rotation w/o re-enrolment; t-of-n guardian recovery; assurance horizons; issuer independence collapse; mediated proving tiers; VWC witness seat |
| Circuits | `circom-gadget` (needs `npm install` + `node setup.mjs`) | **real Groth16**: nullifier+membership+transcript-binding 11,523 constraints / ~680 ms prove / 721 B proof; dual-issuer k=2 (10,717); guardian t=3 (16,078). Lab-only trusted setup — stated, not hidden. **Full answer + run transcript: [`CIRCUITS.md`](./CIRCUITS.md)** |
| Verification (X10 lane 1) | `ceremony-orchestrator` | seat-gated volunteer flow: rebuild → suites → digest report → acceptance vs the pinned manifest; lane-3 ceremony endpoint structurally unconstructable (`phase2-gate-closed`); lifetime-view secret scan ready for lane 2 |

## The verification registry

Independent runs of the three circuits are logged publicly on this repo's **GitHub Pages registry**
(`registry/` — prebuilt, deterministic, deployed by `.github/workflows/pages.yml`). File your own run
with the [verification-run issue template](.github/ISSUE_TEMPLATE/verification-run.yml) — the
orchestrator prints the submission body for you:

```sh
cd runtimes/ceremony-orchestrator && node orchestrate.mjs <your-seat-id>
```

Acceptance is decided by `runtimes/circom-gadget/verify-run.mjs` against `artifacts.manifest.json`:
the **compiled circuit** (r1cs / wasm / constraint counts) must match byte-exact; the **setup chain**
(ptau / zkeys / vkey) is machine-local — snarkjs mixes its own randomness into every contribution
regardless of the fixed entropy string (established empirically 2026-08-11) — so those digests are
recorded as advisory and your own green suites carry the proving-system claim. The wider frame
(ceremony-as-trust-task, the three lanes, why phase-2 is gated behind §25) is
[`explorations/X10-ceremony-as-trust-task.md`](./explorations/X10-ceremony-as-trust-task.md).

## The decision layer

- [`predicate-assurance-boundary-decision.md`](./predicate-assurance-boundary-decision.md) — the
  decision baseline (adopted as the TF's first-work-item frame): MLP/EPP profile split, PR-* predicate
  register with paired assurance/disclosure boundaries, context as governed linkability domain,
  nullifier = scoped reuse detection *not* "one unique human", construction-selection gate.
- [`explorations/`](./explorations/README.md) — O-series (charter register), VWC witness seat, and
  X1–X10 (conformance fixtures, context legibility, show composition, observable-event minimisation,
  recovery/rotation, assurance horizons, mediated proving, multi-issuer aggregation, guardian
  recovery, ceremony-as-trust-task) — every §-anchor of the decision doc has an exploration, and
  every exploration that matured has a runnable suite in `runtimes/`.
- [`WORKFLOW.md`](./WORKFLOW.md) — how this repo relates to the upstream task force: draw-from ·
  promote · upstream · integrate. Only the TF process talks to upstream.

## Attribution

- The **DTG Credentials Core Specification** is the ToIP DTG WG's work
  (`trustoverip/dtgwg-cred-spec`); a vendored reading copy lives locally but is **not republished
  here** (git-excluded). All spec text: upstream.
- The **ZKP TF upstream** (`trustoverip/dtgwg-zkp-tf`) carries the requirements draft, drafting
  rules, and discussions this repo's evidence feeds into.
- Everything committed here is the mage method layer: reference models, circuits, registers,
  explorations, and working documents.

## License

Code: Apache-2.0 · Documents: CC-BY-4.0 — matching the task force's IPR posture
(W3C-mode patents / Apache-2.0 code / CC-BY-4.0 docs).
