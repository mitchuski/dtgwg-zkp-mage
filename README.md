# dtgwg-zkp-mage

Working lab + explorations for the [ToIP **DTG ZKP Task Force**](https://github.com/trustoverip/dtgwg-zkp-tf)
(Decentralized Trust Graph WG, ToIP/LFDT) — maintained by Mitchell Travers (co-chair, Soulbis).

This is **evidence, not spec**: runnable reference models, real circuits with benchmark numbers,
cross-language interop proofs, and design explorations — each anchored to the task force's
[Predicate & Assurance-Boundary decision frame](./predicate-assurance-boundary-decision.md) and the
[DTG Credentials Core Specification](https://trustoverip.github.io/dtgwg-cred-spec/). Spec text goes
through the upstream repo and TF process; this repo is the bench the proposals were tested on.

**Browse it as a wiki:** [`kb/markdown/INDEX.md`](./kb/markdown/INDEX.md) — the whole corpus
(decision document §-split, explorations, lab notes, chronicles) as a deterministic, manifest-first
knowledge-base projection. Same content also ships as FedWiki page JSON in `kb/fedwiki/`.

## The lab — `runtimes/`

17 suites, 170 properties, all green. 14 suites are **zero-dependency** (Node stdlib + Python stdlib) —
clone and run, nothing to install:

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
| Circuits | `circom-gadget` (needs `npm install` + `node setup.mjs`) | **real Groth16**: nullifier+membership+transcript-binding 11,523 constraints / ~640 ms prove / 722 B proof; dual-issuer k=2 (10,717); guardian t=3 (16,078). Lab-only trusted setup — stated, not hidden. |

## The decision layer

- [`predicate-assurance-boundary-decision.md`](./predicate-assurance-boundary-decision.md) — the
  decision baseline (adopted as the TF's first-work-item frame): MLP/EPP profile split, PR-* predicate
  register with paired assurance/disclosure boundaries, context as governed linkability domain,
  nullifier = scoped reuse detection *not* "one unique human", construction-selection gate.
- [`explorations/`](./explorations/README.md) — O-series (charter register), VWC witness seat, and
  X1–X9 (conformance fixtures, context legibility, show composition, observable-event minimisation,
  recovery/rotation, assurance horizons, mediated proving, multi-issuer aggregation, guardian
  recovery) — every §-anchor of the decision doc has an exploration, and every exploration that
  matured has a runnable suite in `runtimes/`.
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
