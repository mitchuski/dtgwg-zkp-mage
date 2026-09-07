## Proving Systems

This section is informative.

A proving-system entry records facts a reader can check — proof system, field, setup, licence, audit statement, published figures with their source and a verification date — and never a recommendation. Recommendations are derived separately, from the reproduction ladder over verification-registry rows; a figure in this section is the proving system's own or the evidence repository's, and says so. Entries of different kinds are not comparable rows: a catalog of circuits over credentials as already signed and a general-purpose prover answer different questions, and the kind is stated first. This section is generated from `conformance/stacks/`.

| kind | entries | what the kind means |
|---|---|---|
| general-stack | [flock](#stack-flock-binary-field-snark-for-batched-boolean-computation-standard-hashes) · [provekit](#stack-provekit-world-noir-whir-client-side-proving) | general-purpose proving systems — any statement the frontend expresses; issuer-agnostic |
| hand-rolled | [lab-groth16-circom](#stack-lab-groth16-circom-2-snarkjs-bn254-poseidon) | constructions written and measured in the evidence repository as reference implementations |
| as-signed-catalog | [siros-longfellow](#stack-siros-circuit-catalog-longfellow-libzk-v1-mdl-eudi-pid-as-signed) | catalogs of circuits that prove over credentials exactly as already signed — substrate for the legacy-rails route, not DTG construction routes |

### Proving system · SIROS circuit catalog — Longfellow libzk v1 (mDL / EUDI PID, as signed)

| | |
|---|---|
| id | `siros-longfellow` |
| kind | as-signed-catalog |
| maintainer | SIROS Foundation (catalog); Google (Longfellow libzk) |
| frontend | prebuilt circuits for ISO 18013-5 mDL and EUDI PID presentations over ECDSA-signed documents |
| proof system | Longfellow libzk v1 (Google) — ZK over existing ECDSA/mdoc rails; also catalogued: Microsoft vega-prover fork (zk-cred-vega, P-256 mDL prover/verifier keys) |
| field | as required by the signed document's curve (P-256) |
| setup | per artifact — the catalog pins downloaded artifacts by sha256, not builds |
| post-quantum | no (ECDSA rails) |
| credential model | as-signed: proves statements over credentials exactly as issuers already issue them — no issuer change, no commitment choice; this is substrate for the legacy-rails route, not a DTG construction route |
| platforms | as published per artifact |
| verifier | per system |
| licence | BSD-2-Clause (catalog repo); per-entry `source.license` field — citable; artifacts stay in the catalog, the book cites entry ids |
| audit | 'Every circuit here is experimental and unvetted' |
| maturity | experimental catalog — 14 entries (manifest v1, 2026-09-05): 10 Longfellow libzk v1 (systemVersion 6/7/8, 1–4 attributes, ~300 KB each) + 4 vega-mc P-256 keys (r11 deprecated, r12 active, 135–157 MB) |
| independent implementations | 0 |
| provenance | repo: https://github.com/sirosfoundation/go-zk-circuits · manifest: https://api.circuits.siros.org/v1/manifest.json · version: manifestVersion 1 · entrySchema: id · aliases · system · systemVersion · docTypes · published · status · params · artifact{url, sha256, size, zstd, uncompressed} · source{origin, toolchain, license, openSource} · publishedAt · notes · content-addressed |
| verified | 2026-09-05 — api.circuits.siros.org/v1/manifest.json, go-zk-circuits README |

#### Published figures (the stack's own, or the lab's — never this book's)

*No benchmark figures recorded.*

#### What it covers, per gadget

| gadget | coverage |
|---|---|
| [[ref: set-membership]] | no (not a DTG statement) |
| [[ref: nullifier]] | no |
| [[ref: transcript-bind]] | challenge binding per system |
| [[ref: key-binding]] | device binding per mdoc |
| [[ref: distinctness]] | no |
| [[ref: signature-verify]] | yes — ECDSA over the signed document (the whole point) |
| [[ref: non-revocation]] | per system |
| [[ref: range]] | attribute predicates (age) — yes |
| [[ref: commitment-open]] | no |
| [[ref: chain-resolve]] | no |

#### Notes

- Legacy rails: prove over what was already signed. The DTG constructions assume issuers who can choose commitments; the two classes must stay visibly apart in any comparison.
- The catalog records provenance (content-addressed bytes, origin commit, toolchain, licence) and declines to claim correctness; the registry records independent reproduction — complementary halves (zkp-tf #17, 2026-08-25). Pilot: run one entry (`longfellow-libzk-v1_8_1_4259_2945`) through the acceptance flow.

### Proving system · Flock — binary-field SNARK for batched Boolean computation (standard hashes)

| | |
|---|---|
| id | `flock` |
| kind | general-stack |
| maintainer | Succinct · Espresso Systems · NYU — designers Ron Rothblum (Technion), Benedikt Bünz (Espresso Systems, NYU), William Wang (NYU) |
| frontend | R1CS over binary fields; batches of Boolean circuits — standard hash functions (SHA-256, Keccak-f[1600], BLAKE3) are the native workload |
| proof system | Flock: a SNARK for proving batches of Boolean computations; Ligerito (Reed–Solomon, hash-based) polynomial commitment; ring-switching from the Binius line of work |
| field | binary fields (GF(2^k) towers) — no prime-field arithmetic, no elliptic curve in the prover |
| setup | transparent — no trusted setup, no toxic waste |
| post-quantum | plausibly post-quantum: security rests on hash functions; designed for the hash-based signature schemes (Lamport, Winternitz, XMSS) Ethereum's post-quantum transition targets |
| credential model | hash-native: proves standard hashes at under 250× the cost of computing them, so a Merkle root, a revocation tree or a transcript digest built with SHA-256 or BLAKE3 is provable without moving issuers and registries to SNARK-friendly hashes — a direct relief of the X3 pressure the Poseidon-based routes create |
| platforms | rust · x86_64 · apple-silicon |
| verifier | local · server |
| licence | Apache-2.0 / MIT (benchmark repository, dual-licensed); check LICENSE in succinctlabs/flock before citing the core as such — compatible with an Apache-2.0 code / CC BY 4.0 docs deliverable |
| audit | none claimed — research release with a paper (June 2026) |
| maturity | research release (2026-06-25), under active optimisation for Ethereum's post-quantum throughput; not yet a credential-presentation toolkit |
| independent implementations | 0 |
| provenance | repo: https://github.com/succinctlabs/flock · paper: https://github.com/succinctlabs/flock/blob/main/paper/flock-paper.pdf · benchmarkRepo: https://github.com/Layr-Labs/flock-challenge (Apache-2.0 / MIT) · optimisedAt: https://www.yukon.org/flock — the BLAKE3 R1CS prover being made fast for Ethereum on x86; a prebuilt, checksum-pinned verifier controls private inputs, timing, correctness and score |
| verified | 2026-09-05 — blog.succinct.xyz/introducing-flock, Layr-Labs/flock-challenge README (local clone), yukon.org/flock |

#### Published figures (the stack's own, or the lab's — never this book's)

| statement | device | figure | source |
|---|---|---|---|
| BLAKE3 compressions | Apple M4 Max, single core | 82,100 compressions/s | blog.succinct.xyz/introducing-flock (2026-06-25) |
| SHA-256 compressions | Apple M4 Max, single core | 42,100 compressions/s | same |
| Keccak-f[1600] permutations | Apple M4 Max, single core | 30,700 permutations/s | same |
| BLAKE3 compressions | Apple M4 Max, ten cores | > 660,000 compressions/s — 'enough to prove the hashing for roughly 4,000 transactions per second' under Lean Ethereum's leanVM design | same |
| 2^18 = 262,144 BLAKE3 compressions, one proof | official benchmark runner (Apple M3 Max 10P / c7i.4xlarge x86) | proof ≈ 436–438 kB; timing = median of 100 fresh, verified runs | Layr-Labs/flock-challenge README (measurement contract) |
| relative | — | 8.4× Binius64 on SHA-256; 14× Binius64 and Plonky3 on BLAKE3; 1.8× Hashcaster on Keccak (single core) | blog.succinct.xyz/introducing-flock |

#### What it covers, per gadget

| gadget | coverage |
|---|---|
| [[ref: set-membership]] | yes — a Merkle path over BLAKE3/SHA-256 is a batch of compressions, Flock's native shape (unmeasured for our tree) |
| [[ref: nullifier]] | yes where the PRF is a standard hash (BLAKE3-keyed) — the Poseidon nullifier would be re-specified |
| [[ref: transcript-bind]] | yes — a SHA-256 digestMultibase transcript digest is provable natively (the canonical transcript needs no Poseidon detour) |
| [[ref: key-binding]] | as commitment-open over hash commitments; curve-based key derivation would be a Boolean circuit — cost unknown |
| [[ref: distinctness]] | yes — Boolean comparison is cheap in binary fields |
| [[ref: signature-verify]] | hash-based signatures (XMSS/Winternitz) natively; ECDSA/Ed25519 as Boolean circuits — cost unknown, likely the expensive case |
| [[ref: non-revocation]] | yes — indexed (sorted-leaf) tree over a standard hash |
| [[ref: range]] | yes — Boolean comparison |
| [[ref: commitment-open]] | yes — hash commitments |
| [[ref: chain-resolve]] | unmeasured — no recursion story published for the credential case |

#### Notes

- Why it is in this specification: it is the proof system built for Ethereum's post-quantum transition — proving the hashing behind hash-based signature aggregation fast enough to keep the chain's throughput — and the same property (standard hashes at near-native cost) is what a trust graph needs if its roots, digests and commitments are to stay on the hashes registries already publish.
- Where it is useful for the constructions: any clause that is 'a hash chain over standard hashes' — set membership (001), non-revocation (006), transcript binding (003) — and therefore the composed community-anchored proof (010) on its hash side; signature clauses over curve-based credentials are the open cost.
- The trade the §25 gate must weigh: hundreds of kilobytes of proof against Groth16's ~1 kB, in exchange for no trusted setup, no pairing assumption, and no issuer-side hash migration.
- The measurement discipline of its benchmark harness — a pinned verifier that decides correctness and timing, many fresh runs, a median — is the same shape as this specification's reproduction ladder and is cited in PLAN §2.4 as prior art for how a cost row earns 'measured'.

### Proving system · ProveKit (World) — Noir → WHIR client-side proving

| | |
|---|---|
| id | `provekit` |
| kind | general-stack |
| maintainer | World Foundation · Atheon · Reilabs · Nethermind |
| frontend | Noir (ACIR → R1CS lowering) |
| proof system | Spartan-style prover with WHIR polynomial commitments; Skyscraper hash for BN254 commitments; optional Groth16 recursive wrapper (Go/gnark) for on-chain verification |
| field | BN254 scalar field |
| setup | transparent for the WHIR proof; the Groth16 wrapper reintroduces a trusted setup |
| post-quantum | hash-based core — migration path plausible; the pairing-based wrapper is not |
| credential model | issuer-agnostic: any statement Noir expresses; shipped statements prove over existing credentials (passport, WebAuthn) as signed |
| platforms | rust · javascript-wasm (~340 KB) · swift (iOS) · kotlin (Android) · python · c-ffi |
| verifier | local · server · browser · on-chain (Groth16 wrapper) |
| licence | MIT — compatible with an Apache-2.0 code / CC BY 4.0 docs deliverable |
| audit | v1.0.0 described as 'the current stable, audited release' — *claimed; reviewed commit and file set not located (§16.1 audit-scope rule)* |
| maturity | production — 'used in production by World, Atheon, and a handful of other partners' (v1.0.0) |
| independent implementations | 0 |
| provenance | repo: https://github.com/worldfnd/provekit · version: v1.0.0 |
| verified | 2026-09-05 — provekit.org, docs.provekit.org, github README |

#### Published figures (the stack's own, or the lab's — never this book's)

| statement | device | figure | source |
|---|---|---|---|
| Passport P1 | iPhone SE 3 | 2.43 s prove · 2.55 MB payload · 716 KB proof | provekit.org/benchmarks (v1.0.0) |
| WebAuthn | Moto E15 (2 GB, 32-bit) | 27.9 s prove · 2.39 MB payload · 716 KB proof · ~494 MB peak RSS | same |
| OPRF | iPhone SE 3 | 1.20 s prove · 1.65 MB payload · 635 KB proof | same |
| baselines quoted by the vendor | same devices | Circom+Groth16 payload 27–1754 MB, proof ~1 KB; Noir+Barretenberg payload ~271 MB, proof 16–21 KB | same |

#### What it covers, per gadget

| gadget | coverage |
|---|---|
| [[ref: set-membership]] | yes (Poseidon/Skyscraper Merkle in Noir) — unmeasured for our tree |
| [[ref: nullifier]] | yes — unmeasured |
| [[ref: transcript-bind]] | yes — unmeasured |
| [[ref: key-binding]] | yes — unmeasured |
| [[ref: distinctness]] | yes — unmeasured |
| [[ref: signature-verify]] | yes — ECDSA/RSA examples shipped (passport, WebAuthn) |
| [[ref: non-revocation]] | yes (indexed tree) — unmeasured |
| [[ref: range]] | yes |
| [[ref: commitment-open]] | yes |
| [[ref: chain-resolve]] | recursion via the Groth16 wrapper — unmeasured |

#### Notes

- Proof size ~700× Groth16; proving payload ~100× smaller — the trade the §25 gate weighs per profile (ADR-001 D1/D3).
- The 'audited' claim names no commit or file set; the stack file says so until located (the §16.1 audit-scope rule).

### Proving system · Lab Groth16 (circom 2 · snarkjs · BN254 · Poseidon)

| | |
|---|---|
| id | `lab-groth16-circom` |
| kind | hand-rolled |
| maintainer | the evidence repository (mitchuski) — benchmarking vehicle, not the task force's selection |
| frontend | circom 2.x → R1CS |
| proof system | Groth16 over BN254 (snarkjs); Poseidon for all in-circuit hashing |
| field | BN254 scalar field; Baby Jubjub for in-circuit keys (planned) |
| setup | trusted setup per circuit — lab-only fixed-entropy setup, unusable for production, reproducible from a clean clone; production ceremony = an open item |
| post-quantum | no — pairing-based; migration path is a different stack (LIV-ALG-07) |
| credential model | issuer-chosen commitments: Poseidon leaf commitments; ZK-friendly signatures or an additional Poseidon/KZG commitment beside the credential signature (X3) |
| platforms | node · browser-wasm (snarkjs) · x86_64 · darwin-arm64 |
| verifier | local · server · browser · on-chain (Solidity verifier) |
| licence | Apache-2.0 (lab code); circomlib LGPL-3.0 in repo LICENSE vs GPL-3.0 declared in npm metadata — flagged — circomlib licence ambiguity is material for an Apache-2.0 deliverable; noted in NOTE-2026-08-19 |
| audit | none — reproduction and behaviour are not review |
| maturity | most mature toolchain available; the lab's three circuits are source-complete with deterministic setup scripts |
| independent implementations | 1 |
| provenance | repo: github.com/mitchuski/dtgwg-zkp-mage — runtimes/circom-gadget · version: artifacts.manifest.json (pinned required digests) · content-addressed |
| verified | 2026-09-05 — CIRCUITS.md, registry/data |

#### Published figures (the stack's own, or the lab's — never this book's)

| statement | device | figure | source |
|---|---|---|---|
| nullifier_membership (depth-20 Merkle + domain-tagged nullifier + in-circuit transcript binding) | lab machine | 11,523 constraints · ~680 ms prove · ~8 ms verify · 721 B proof | CIRCUITS.md; registry rows 0002–0006 (independent reproduction, win32/x64 ↔ darwin/arm64 byte-identical required digests) |
| dual_issuer k=2 (two distinct accredited issuers; duplicate unsatisfiable) | lab machine | 10,717 constraints (--O2) · ~740 ms · ~8 ms · 725 B | CIRCUITS.md |
| guardian_threshold t=3 | lab machine | 16,078 constraints · ~830 ms · ~10 ms · 723 B | CIRCUITS.md |

#### What it covers, per gadget

| gadget | coverage |
|---|---|
| [[ref: set-membership]] | measured (11,523 with nullifier + binding) |
| [[ref: nullifier]] | measured (inside the same circuit) |
| [[ref: transcript-bind]] | measured (+1 constraint) |
| [[ref: key-binding]] | planned (Baby Jubjub identity) — unmeasured |
| [[ref: distinctness]] | measured (dual_issuer, guardian_threshold) |
| [[ref: signature-verify]] | unmeasured — the X3 case; EdDSA-on-Baby-Jubjub feasible, Ed25519/ECDSA expensive |
| [[ref: non-revocation]] | unmeasured — indexed tree ≈ 2× set membership (conjecture) |
| [[ref: range]] | cheap — unmeasured |
| [[ref: commitment-open]] | Poseidon opening — measured as the leaf commitment inside 001 |
| [[ref: chain-resolve]] | unmeasured |

#### Notes

- The only stack with registry rows today: the reproduction ladder places it at reproduced-cross-arch for constructions 001/002/003/005.
- Chosen for toolchain maturity so the selection conversation happens against measured numbers; a PLONKish or folding counter-proposal through the same gate is invited (PATH-MAP P4).
