# dtgwg-zkp-mage

Working lab + explorations for the [ToIP **DTG ZKP Task Force**](https://github.com/trustoverip/dtgwg-zkp-tf)
(Decentralized Trust Graph WG, ToIP/LFDT) — maintained by Mitchell Travers (co-chair, Soulbis).

This is **evidence, not spec**: runnable reference models, real circuits with benchmark numbers,
cross-language interop proofs, and design explorations — each anchored to the task force's
[Predicate & Assurance-Boundary decision frame](./predicate-assurance-boundary-decision.md) and the
[DTG Credentials Core Specification](https://trustoverip.github.io/dtgwg-cred-spec/). Spec text goes
through the upstream repositories and the TF process; this repo is the bench the proposals were tested on.

## Read the ZKP specification

The [DTG ZKP specification](https://github.com/trustoverip/dtgwg-zkp-spec) is the home for the specification, implementation guide, book and construction records. Start with the [current proposed working draft (PR #8)](https://github.com/trustoverip/dtgwg-zkp-spec/pull/8) and the [construction catalogue and navigation index](https://github.com/trustoverip/dtgwg-zkp-spec/discussions/9). The PR is open as of 8 September 2026; its changes are not yet merged or adopted. The [published document](https://trustoverip.github.io/dtgwg-zkp-spec/) follows the specification repository’s deployment and may not yet contain that proposal.

Use this Mage repository for runnable evidence, experiments and reproduction. Use the [ZKP task force](https://github.com/trustoverip/dtgwg-zkp-tf) for requirements, priorities and working-group decisions, and the [credential specification](https://github.com/trustoverip/dtgwg-cred-spec) for credential definitions.

## Three repositories, one rule — and the ZK Book edition

| repository | holds | what leaves it |
|---|---|---|
| [`trustoverip/dtgwg-zkp-tf`](https://github.com/trustoverip/dtgwg-zkp-tf) | requirements (v0.4), drafting rules, discussions, the board thread (#18), `AGENT-RUNTIMES.md` | decisions and requests |
| [`trustoverip/dtgwg-zkp-spec`](https://github.com/trustoverip/dtgwg-zkp-spec) | the specification as **construction records**, the requests they answer, public-input conventions, proving-system entries, considerations, conformance — and `conformance/`, the validator + CI that check the generated text against the records | the rendered specification; record ids others may `[[xref]]` |
| this repository | the evidence: runtimes with measured costs, fixtures, the verification registry, the **board** where records are written and advanced, the generator (`board/tools/board.mjs spec`) that renders records into specification text, and the **ZK Book** edition (`zkbook/`) | data — records, fixtures, registry row ids — never a dependency |
| `task-force-readers/` (this repository) | the 8 September meeting reader (26 questions, the nine shared Berkeley questions) and the contributor publication reader with its receipts — moved here from task-force PRs #22/#25/#26 on 15 September 2026 | contributor preparation material, not task-force policy |

`C`l`a`i`m`s` `i`n` `t`h`e` `s`p`e`c`i`f`i`c`a`t`i`o`n` `m`u`s`t` `b`e` `s`u`p`p`o`r`t`e`d` `b`y` `t`h`e`i`r` `r`e`c`o`r`d`s`,` `a`n`d` `m`e`a`s`u`r`e`d` `c`l`a`i`m`s` `m`u`s`t` `c`i`t`e` `r`e`p`r`o`d`u`c`i`b`l`e` `e`v`i`d`e`n`c`e`.` `T`h`e` `*`*`Z`K` `B`o`o`k`*`*` `i`n` `z`k`b`o`o`k`/` `i`s` `t`h`e` `l`o`c`a`l` `e`v`i`d`e`n`c`e`-`s`i`d`e` `r`e`n`d`e`r`i`n`g` `a`n`d` `w`o`r`k`i`n`g` `m`a`t`e`r`i`a`l`;` `i`t` `i`s` `n`o`t` `t`h`e` `a`u`t`h`o`r`i`t`a`t`i`v`e` `c`o`p`y` `o`f` `e`v`e`r`y` `s`p`e`c` `c`h`a`p`t`e`r`.` `T`h`e` `s`p`e`c`i`f`i`c`a`t`i`o`n` `r`e`p`o`s`i`t`o`r`y` `c`a`r`r`i`e`s` `e`d`i`t`o`r`-`a`u`t`h`o`r`e`d` `c`h`a`p`t`e`r`s` `t`h`a`t` `a`r`e` `n`o`t` `a`l`l` `m`i`r`r`o`r`e`d` `h`e`r`e`.` `R`e`v`i`e`w`e`d` `r`e`c`o`r`d`s` `a`n`d` `g`e`n`e`r`a`t`e`d` `s`e`c`t`i`o`n`s` `c`a`n` `b`e` `s`y`n`c`h`r`o`n`i`z`e`d` `w`i`t`h` `n`o`d`e` `t`o`o`l`s`/`z`k`b`o`o`k`-`e`x`p`o`r`t`.`m`j`s`;` `d`e`s`t`i`n`a`t`i`o`n` `e`d`i`t`s` `m`u`s`t` `b`e` `r`e`c`o`n`c`i`l`e`d` `r`a`t`h`e`r` `t`h`a`n` `o`v`e`r`w`r`i`t`t`e`n`.` `S`e`e` `[`t`h`e` `b`o`o`k` `R`E`A`D`M`E`]`(`.`/`z`k`b`o`o`k`/`R`E`A`D`M`E`.`m`d`)` `a`n`d` `[`t`r`a`n`s`f`e`r` `p`l`a`n`]`(`.`/`z`k`b`o`o`k`/`C`O`M`M`I`T`-`P`L`A`N`.`m`d`)`.`

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
