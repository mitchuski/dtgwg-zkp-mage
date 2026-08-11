# The circuits — what's here, what they prove, how to run them

*The most-asked question about this repository, answered once. Companion to
[`PATH-MAP.md`](./PATH-MAP.md) path P4; evidence appendix at the bottom is a
verbatim run transcript.*

## Are the circuits in this repo?

**Yes — source-complete.** Three circuits live in
[`runtimes/circom-gadget/circuits/`](./runtimes/circom-gadget/circuits/), with
their setup scripts, test harnesses, and a pinned `package-lock.json`. What is
*not* committed is regenerable build output (compiled R1CS, proving/verification
keys, witness wasm) — the setup scripts rebuild all of it deterministically.

## Which proof system?

**Groth16 over BN254**, circuits written in **circom 2.x**, proved and verified
with **snarkjs**, **Poseidon** for all in-circuit hashing. The test suites
generate and verify real proof objects — no simulation.

Why this stack: it is the most mature toolchain available, which makes it the
right *benchmarking vehicle*. It is **not** the task force's construction
selection — that decision is deliberately sequenced behind boundary ratification
(decision document §25). These circuits exist so that when the selection
conversation happens, it happens against measured numbers instead of adjectives.
A PLONKish or folding-scheme counter-proposal pushed through the same §25 gate
would be a welcome contribution (see PATH-MAP § P4).

## The three circuits

| Circuit | Statement proved | Constraints | Prove | Verify | Proof |
|---|---|---|---|---|---|
| `nullifier_membership` | "I hold a secret whose commitment is in the enrolment tree (depth 20 ≈ 1M), and my nullifier for *this context* is correctly derived" — with **in-circuit transcript binding** | **11,523** | ~680 ms | ~8 ms | 721 B |
| `dual_issuer` | "I hold attestations from **two distinct** accredited issuers" — a duplicate issuer is *unsatisfiable*: no witness exists | **10,717** (--O2) | ~740 ms | ~8 ms | 725 B |
| `guardian_threshold` | "**t = 3 distinct** committed guardians authorized this recovery claim" — seat nullifiers scoped per recovery context; duplicate seat unsatisfiable | **16,078** (--O2) | ~830 ms | ~10 ms | 723 B |

Three structural facts worth repeating aloud:

- **Transcript binding costs exactly +1 constraint** (11,522 → 11,523). The
  proof binds the presentation transcript; the nullifier binds the context.
  Replaying a proof under a different transcript fails *cryptographically*,
  not by verifier policy.
- **The public signal layout is `[context, root, nullifier, transcriptDigest]`**
  — offered upstream for ratification, not assumed.
- **Circuit negatives are unsatisfiability, not rejection codes.** A duplicate
  issuer or duplicate guardian seat cannot *produce a witness* — there is
  nothing to reject because nothing can be constructed.

## Can I run them?

Yes. This is the only part of the lab that needs installs (everything else is
stdlib-only). Prerequisites: Node ≥ 20, and the
[circom 2.x compiler](https://docs.circom.io/getting-started/installation/) on PATH.

```sh
git clone https://github.com/mitchuski/dtgwg-zkp-mage
cd dtgwg-zkp-mage/runtimes/circom-gadget
npm install                 # circomlib, circomlibjs, snarkjs — confined to this dir

node setup.mjs              # one-time: compile + local ptau 2^14 + zkey (a few minutes)
node test.mjs               # 10/10 — real Groth16 proofs, prints measurements

node setup-dual.mjs     && node test-dual.mjs       # 7/7
node setup-guardian.mjs && node test-guardian.mjs   # 8/8
```

Dependency versions reproduce exactly from the committed lockfile.

## The caveat that must travel with the numbers

The trusted setup is a **lab fixture with fixed entropy** — deliberately, so
the pipeline is reproducible end-to-end from a clean clone. Two precision notes,
the second established empirically on 2026-08-11: the fixture makes the proving
keys **unusable for production** (anyone holding this setup's toxic waste could
forge proofs; a real deployment requires a proper multi-party ceremony), and
byte-exact reproduction holds for the **compiled circuit only** — r1cs, witness
wasm, and constraint counts match across independent builds, while the setup
chain (ptau, zkeys, vkey) is machine-local because snarkjs mixes its own CSPRNG
randomness into every contribution regardless of the fixed entropy string.
Independent verification therefore compares circuit digests and re-runs the
suites (real proofs against your own build); setup-chain digests are recorded
as advisory. This is the difference between "envelope data for construction
selection" and "ship it" — drafting rule four applies: this paragraph is the
label on the conjecture-free part.

---

## Evidence appendix — autoresearch run transcript

Verbatim suite output, run 2026-08-04 on the maintainer's machine (Windows,
Node v22). The `ERROR` line inside the single-circuit run is **expected and
labelled**: it is test Z5 proving that a non-member *cannot* generate a witness.

```text
=== nullifier_membership (single) ===
ERROR:  4 Error in template NullifierMembership_141 line: 111

  ok  Z5 non-member cannot prove (witness fails or proof rejected)
  ok  Z6 flipped public nullifier -> verify false
  ok  Z7 proof for context A fails against public context B
  ok  Z9 proof bound to transcript A fails against public transcript B
  ok  Z10 same secret+context, transcripts A/B -> same nullifier, both proofs verify
       constraints : 11523 (vars 11548, public inputs 4)
                     (pre-transcript-binding baseline was 11,522 — expect ~+1 for the dummy-square)
       prove time  : 683 ms (groth16 fullProve, this machine)
       verify time : 8.2 ms
       proof size  : 721 bytes (JSON)
       vkey size   : 3473 bytes (JSON)
       zkey size   : 5.0 MB · witness wasm 2174 KB
  ok  Z8 measurements (informative)
circom-gadget: 10/10 pass

=== dual_issuer (X8, k=2) ===
       constraints : 10717 (vars 10762, public inputs 4) [dual, --O2]
       vs single   : 5358 (--O2 like-for-like) -> ratio 2.000x
       distinctness overhead: 1 constraints over 2x the O2 single
       prove time  : 738 ms (groth16 fullProve, this machine)
       verify time : 8.0 ms
       proof size  : 725 bytes (JSON)
       vkey size   : 3476 bytes (JSON)
       zkey size   : 6.1 MB · witness wasm 2219 KB
  ok  D7 measurements (informative)
circom-gadget-dual: 7/7 pass

=== guardian_threshold (X9, t=3) ===
       vs single   : 5358 (--O2 like-for-like) -> ratio 3.001x
       vs dual     : 10717 (--O2, NOTES 10,717) -> ratio 1.500x
       overhead    : 4 constraints over 3x the O2 single (3 distinctness + 1 claim binding expected)
       ptau headroom: 306 constraints under the cached 2^14 cap (16,384)
       prove time  : 830 ms (groth16 fullProve, this machine)
       verify time : 9.7 ms
       proof size  : 723 bytes (JSON)
       vkey size   : 3840 bytes (JSON)
       zkey size   : 8.6 MB · witness wasm 2240 KB
  ok  G8c measurements (informative)
circom-gadget-guardian: 8/8 pass
```

Reproduce it yourself with the commands above — an independent transcript from
a second machine, matching or refuting these numbers, is exactly the kind of
contribution the position protocol welcomes. **File your run** through the
`verification-run` issue template (the `runtimes/ceremony-orchestrator/` flow
prints a paste-ready submission); accepted runs are logged publicly on the
repo's Pages registry. Circuit digests must match; setup-chain digests will
legitimately differ (see the caveat section above).
