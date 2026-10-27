# Formal models of the DTG ZKP construction records

Lean 4 models of the construction records in the [DTG ZKP specification](https://github.com/trustoverip/dtgwg-zkp-spec), with the gates that keep the records and the models in step. The run register, findings and sealed evidence roots are in the implementation guide's *Formal verification review* chapter.

## What kind of verification this is

**Model-level, machine-checked proofs.** Each record's verifier relation is written as a Lean definition over abstract primitives. Hashes, commitments and PRFs are functions, Merkle trees are an inductive type, and revocation lists are sorted lists. Theorems about those definitions are checked by Lean's kernel. A theorem holds for every instance of the primitives that satisfies its named hypotheses.

**What it is not:**

- **Not a cryptographic proof.** There are no security reductions, no probabilities and no adversary running times. A hypothesis such as "the leaf hash is collision-free" is stated as injectivity on the values the theorem reads. Real hashes are not injective. The informal reading is that a counterexample to the conclusion would exhibit a collision, but that reduction is not itself formalised.
- **Not circuit verification.** No Circom circuit, R1CS or compiled verifier is modelled. Correspondence between a circuit and its record's relation is deferred work (G8).
- **Not implementation verification.** The runtimes in `runtimes/` are hashed into the inventory so that drift is detected. Their behaviour is not proved to match the models.
- **Not a privacy proof.** Zero knowledge, hiding, unlinkability and anonymity sets are computational claims and are outside every model.

**What a reader still has to trust:**

- the Lean 4.33.1 kernel and toolchain;
- the three standard axioms (`propext`, `Classical.choice`, `Quot.sound`);
- that each definition says what the record's prose says.

The last point is the real gap in any model-level work. The clause review (`clause-review.json`) records a human disposition for every clause. Each record's scope line says what its model leaves open, and the review witnesses in `review/` show where an earlier scope line claimed more than the model encodes.

## Checks the gate runs

| check | what it guards | command |
|---|---|---|
| inventory | every record, clause, runtime reference and model file is hashed; any change since the last reviewed inventory fails | `node formal/scripts/check-coverage.mjs` |
| clause review | every clause has a disposition, bound to its record's hash | `node formal/scripts/check-clause-review.mjs` |
| guard tests | the inventory, review and audit checkers reject 12, 7 and 8 planted mutations | `node formal/scripts/test-*.mjs` |
| kernel and axioms | builds the package; every cited root is printed and must sit within the standard axioms; no `sorry`; the printed roots must equal the cited roots exactly | `sh formal/scripts/check-axioms.sh` |
| review witnesses | `review/*.lean` compile under the same footprint rule: counterexamples to over-claims (`R013Binding.lean`) and non-vacuity witnesses that apply every soundness theorem to concrete data satisfying all its hypotheses (`NonVacuity.lean`) | run by `check-axioms.sh` |
| independent replay | `leanchecker` replays every declaration, and the whole dependency chain, through the kernel again | `cd formal && lake env leanchecker --fresh Formal` |
| seal | sources, receipt and per-theorem footprints minted as a content-addressed evidence bundle (`evidence/kappa/`); verifiable from the bundle alone with `verify_bundle.py` from [kappa-evidence-mage](https://github.com/mitchuski/kappa-evidence-mage) (checked at `025015b`), which the minter also expects as a sibling checkout | `python formal/scripts/mint_kappa.py` |

The audit writes `evidence/axiom-audit.json`. It records the source-tree hash before and after the build, and it fails if any source changed during the run. The CI workflow `.github/workflows/formal.yml` runs every check above except the seal on Linux, on each push or pull request that touches `formal/` or `board/cards/`.

## Layout

- `Formal/Gadgets/` — the primitives (records 001–009, 022), the spent set and chain resolution.
- `Formal/Composed/`, `Formal/R023/`, `Formal/R024/`, `Formal/Chains/` — the composed records, built from the gadgets' theorems.
- `Checks.lean` — the cited roots.
- `coverage.json`, `clause-review.json`, `pending-models.json` — the inventory, the clause review and the models still awaiting the record owner's review.
- `review/` — review witnesses and run notes.
- `evidence/` — the audit receipt and sealed bundles.
- `GADGETS.md`, `G6.md`, `R023.md`, `R024.md`, `COVERAGE.md` — historical write-ups from when each part was built. Their theorem counts are as of that date.

Core Lean only: no Mathlib, and nothing is downloaded beyond the toolchain named in `lean-toolchain`.

## Authorship

The models, clause reviews and review witnesses were prepared with agent assistance under the editor's direction and reviewed by the editor. Every claim above is kernel-checked and reproducible from this repository; none rests on who or what wrote it.
