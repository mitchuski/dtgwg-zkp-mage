# NOTE — The EF substrate pivot: hash-friendly SNARKs, not SNARK-friendly hashes

- **Date:** 2026-08-18
- **Status:** draft note for TF framing — local, unpushed; circulation = Mitch
- **Sources (verified):** Justin Drake post, 2026-08-13 (https://x.com/drakefjustin/status/2087905684180418733); Flock paper — Bünz, Rothblum, Wang — arXiv 2026-07-29; Binius (2023); EF L1 roadmap decision coverage (PANews / CryptoSlate / Cryptonomist / COINTURK).
- **Excluded by register discipline:** Drake's remarks on HAWK and SQIsign "suffering blows" / "more blood coming" — hearsay about unpublished cryptanalysis; do not carry into any TF artefact until citable.

## What actually happened

The Ethereum Foundation has concluded that the eight-year bet on SNARK-friendly hashes was solving the wrong side of the equation. Poseidon was designed to make hashing cheap inside proof systems that do arithmetic over large prime fields, where simulating XORs and bit shifts is brutally expensive. Binius (binary-field construction working naturally with 0s and 1s) and Flock (newer techniques applied to large batches of standard hash computations) invert the adaptation: instead of bending the hash to fit the field, they bend the field to fit the hash. Over GF(2) extensions, boolean operations are native, so SHA-2 and BLAKE become cheap to prove without bespoke design. Drake's line — "hash-friendly SNARKs, not SNARK-friendly hashes" — is the whole story in six words.

Flock benchmark anchor (M4 Max, single core): 82,000 BLAKE3 compressions / 42,000 SHA-256 compressions / 30,000 Keccak permutations proven per second.

**Two caveats for accurate register:**

1. **No break.** Drake reported no cryptanalytic result against Poseidon. Existing Poseidon deployments across zk-rollups and zkVMs are not required to change.
2. **Scope.** The decision affects Ethereum's own L1 roadmap only. This is a strategic retreat from an unbaked assumption, not a cryptanalytic event.

## Why it matters to the task force

Three threads, in descending order of directness.

**1 — Construction selection gains a substrate axis.** The construction-selection process (post-§25 gate, after B1/B2 ratification) has so far implicitly treated the proof-system substrate as settled background. This makes "prime field versus binary field" a live selection axis, not a fixed assumption. Any candidate construction for 2026/333-style proof of personhood that leans on Poseidon commitments or Poseidon-based nullifier derivation now carries a visible strategic horizon, even though nothing is broken today. Honest framing for members: cryptanalytic maturity of the hash and longevity of the surrounding proof-system ecosystem are **separate risks**, and the second one just moved.

**2 — The lab as benchmark, restated.** This strengthens, not weakens, the framing of `dtgwg-zkp-mage` as a benchmarking vehicle and not a conformant construction (CIRCUITS.md already says so). Groth16 over BN254 is prime-field, pairing-based, and not post-quantum. The transcript-binding result (exactly +1 constraint) is a finding about **circuit structure** that should port across substrates; the absolute constraint counts (11,523 / 10,717 / 16,078) are now explicitly **era-specific numbers**. Worth saying plainly in any readout: the lab measures the shape of the problem, and the substrate underneath the measurements has a shelf life the EF has just priced in publicly.

**3 — PQ posture and harvest-now.** Direct support for the PQ threat-model thread (O8 layer-separability table). Hash-based cryptography under minimal assumptions is exactly the conservative answer to harvest-now-reconstruct-later, and the EF has now committed institutional weight to it. For identity systems the argument transfers more severely than for payments: personhood credentials and nullifiers are **long-lived by design**, so they inherit the harvest-now exposure at full strength.

## Lab-local consequences (evidence hooks)

- **X6 erosion-record:** this is the first live external event on the **proof-system-horizon clock**. X6 already carries the honesty note that this horizon is computational-ecosystem, not informational — the EF decision is that clock visibly ticking, with no measurement change. Candidate example row for the erosion-record suite: substrate-longevity re-based by institutional decision, rate-not-cliff, basis stays `declared`.
- **X10 lane-2 claim needs narrowing:** the universal BN254 pot15+ phase-1 was proposed as "survives §25 either way." That holds **within the prime-field pairing family only** — a binary-field substrate selection voids a BN254 ceremony entirely. The claim should be narrowed to "survives §25 within the BN254-compatible candidate set" before the proposal circulates.
- **DOMAIN_TAG pins are substrate-portable by construction:** the tags are sha256-derived strings reduced mod p at the boundary; a substrate change re-derives the reduction, not the tag convention. The canonical §6.2/§15.2 digests are already plain sha256 — unaffected.

## One-line summary for a working call

The proof-system substrate has become a selection variable: binary-field, hash-based SNARKs now match SNARK-friendly hashes on performance while carrying strictly weaker assumptions, and the EF's L1 pivot is the first major institutional ratification of that trade. Constructions the TF evaluates should declare their substrate and their migration story.

## Disposition

- Local note only; nothing posted, nothing pushed.
- Upstream candidates (Mitch's call): short gated comment + detail self-reply in the two-comment style, on the construction-selection thread (C is deferred there — this is exactly the kind of input the deferral was waiting on).
- Lab follow-ups if picked up: X6 example row; X10 lane-2 claim narrowing; CIRCUITS.md one-line era-stamp on the constraint-count table.
