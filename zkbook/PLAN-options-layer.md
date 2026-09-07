# PLAN — the construction-options layer: every recipe, every stack, hand-rolled included

*2026-09-05. Plan for turning each recipe's construction options into a comparable, sourced, vendor-spanning
layer of the ZK Book — ProveKit (World), the SIROS circuit catalog, PSE's Semaphore/zk-kit, the lab's own
Groth16, and a **hand-rolled series derived from the personhood-framework paper (ePrint 2026/333)** as the
co-chair's task-force contribution — and for generating all of it into the ZKP spec repo with Spec-Up-T.
Nothing here is built yet except what §0 lists. Posting, outreach, PRs and pushes are Mitch's acts.*

---

## 0. Where we stand (inputs this plan is built on)

| already exists | where |
|---|---|
| 12 recipe cards, each with a free-text `substitutions[]` (route · cost · measured · source) | `board/cards/*.json` |
| Spec-Up-T scaffold that renders the deck (`board.mjs spec`) | `zkbook/` (rendered `docs/index.html`) |
| the lab's measured Groth16/circom circuits (11,523 · 10,717 · 16,078 constraints) | `runtimes/circom-gadget`, `CIRCUITS.md` |
| the verification registry (independent reproduction rows 0002–0006) | `registry/` |
| the TF's construction-selection gate: 10 approvals + 16 evaluation considerations | requirements v0.4 §16.1 → decision doc §25 |
| the paper the ADR and cards 010/011 lean on | `~/Downloads/2026-333.pdf` — *A Cryptographic Framework for Proof of Personhood* (Choudhuri, Garg, Lee, Montgomery, Policharla, Sinha) |
| Mitch's #17 position: catalog (provenance) and registry (reproduction) are two halves; "first step: pilot one catalog entry through the acceptance flow" | zkp-tf #17, 2026-08-25 |

What was verified today about the two named vendors (fetched 2026-09-05):

**ProveKit** — provekit.org · github.com/worldfnd/provekit · MIT · "engineered by World, Atheon, Reilabs, and
Nethermind" · v1.0.0 described in the docs as "the current stable, audited release" · pipeline: **Noir → ACIR →
R1CS → Spartan-style prover with WHIR commitments**, Skyscraper hash on BN254, optional **gnark Groth16 recursive
wrapper** for on-chain verification · bindings Rust / JS-WASM (~340 KB) / Swift / Kotlin / Python / C · "used in
production by World, Atheon, and a handful of other partners". Published benchmarks (v1.0.0, statements *Passport
P1*, *WebAuthn*, *OPRF*): iPhone SE 3 **2.4–3.0 s**, Moto E15 (2 GB, 32-bit) **22–28 s**, proving payload
**~2.5 MB** (vs 270–1750 MB for Groth16/Barretenberg), **proof ~716 KB** (vs ~1 KB Groth16), peak RSS ~475 MB. No
trusted setup for the WHIR proof; the Groth16 wrapper reintroduces one. Example circuits ship in `noir-examples/`
(Poseidon preimage and larger). Contact listed: remco@world.org.

**SIROS** — siros.org (Leif Johansson, ED; Peter Altmann, Director of Research — per talltree on #17) ·
catalog **circuits.siros.org**, manifest `https://api.circuits.siros.org/v1/manifest.json` (v1, fetched: **14
entries**) · repo `sirosfoundation/go-zk-circuits`, BSD-2-Clause · every entry: `id, aliases, system,
systemVersion, docTypes, published, status, params, artifact{url, sha256, size, zstd, uncompressed}, source{origin,
toolchain, license, openSource}, publishedAt, notes` · **10 × Longfellow libzk v1** (systemVersion 6/7/8,
docTypes `org.iso.18013.5.1.mDL` + `eu.europa.ec.eudi.pid.1`, 1–4 attributes, ~300 KB artifacts) + **4 × vega-mc
P-256** prover/verifier keys (Microsoft vega-prover fork via `zk-cred-vega`, r11 deprecated / r12 active,
135–157 MB uncompressed) · "Every circuit here is experimental and unvetted" · submissions by PR via `circuitctl`;
CI + CODEOWNERS review; no reproduction field.

**Flock** — blog.succinct.xyz/introducing-flock (2026-06-25) · github.com/succinctlabs/flock (paper in-repo) · designed by Ron Rothblum (Technion), Benedikt Bünz (Espresso Systems, NYU), William Wang (NYU) · a SNARK for **batches of Boolean computations**, aimed at standard hash functions (Keccak, SHA-256, BLAKE3) · binary fields with ring-switching (Binius line), Ligerito hash-based polynomial commitment, transparent · built for the hash-based signatures (Lamport, Winternitz, XMSS) of Ethereum’s post-quantum transition · **< 250× the cost of computing the hash natively**: 82,100 BLAKE3 / 42,100 SHA-256 compressions/s and 30,700 Keccak-f permutations/s on one M4 Max core; > 660,000 BLAKE3/s on ten cores — “enough to prove the hashing for roughly 4,000 transactions per second” under Lean Ethereum’s leanVM · 8.4× Binius64 (SHA-256), 14× Binius64/Plonky3 (BLAKE3), 1.8× Hashcaster (Keccak) · its BLAKE3 R1CS prover is being optimised for Ethereum on x86 at yukon.org/flock, where a prebuilt, checksum-pinned verifier controls private inputs, timing and correctness and a score is the median of 100 fresh verified runs (Layr-Labs/flock-challenge, Apache-2.0/MIT) — the measurement discipline §2.4 adopts. Why it is in the book: it is the proof system that makes Ethereum’s post-quantum future computable, and the same property lets a trust graph keep its roots and digests on the hashes registries already publish.

The three are different animals, and the layer must say so: ProveKit is a **general proving stack** (any Noir
statement, issuer-agnostic); SIROS catalogs **as-signed legacy-rail circuits** (prove over an ECDSA-signed mDL/PID
as it already exists). Denys said the second half on #17; Mitch said the first. Both are true and both are columns.

---

## 1. The idea in one paragraph

Today a recipe's construction options are prose rows. The plan replaces them with two data objects — a **stack**
(a proving system + toolchain + its facts, one JSON per vendor/route, including *hand-rolled*) and an **option**
(this recipe on that stack: which gadgets it covers, at what measured or conjectured cost, with what provenance) —
whose fields are **exactly the §25 gate's evaluation considerations**, so filling a row *is* filling the gate. The
ZK Book then gains a generated **Stacks** chapter (one section per stack, comparable), each recipe gains a
generated **options table** (rows = stacks, columns = gate considerations), and a hand-written **Hand-rolled
constructions** chapter walks the paper's constructions into DTG recipes as a numbered series. Vendors can PR their
own stack file and option rows (self-description); the registry turns a self-described row into a *reproduced* one.
A row may not claim more than its source; a measured row needs a registry row or a lab transcript; everything else
is labelled conjecture. **The verification registry is built into every option and every recommendation**: each
option carries its reproduction state as a field, each stack ships the pinned manifest + re-derivation script the
registry's acceptance flow needs (the `verify-run.mjs` shape), and the spec's "recommendations for proving systems"
are generated from registry rows as a ladder — a construction is *recommended* only when strangers have rebuilt it
on their own machines, which is what requirements v0.4 §16.1 already demands in prose ("until independently
reproduced … MUST be labelled experimental").

---

## 2. Data model

### 2.1 `board/stacks/<id>.json` — one per proving stack

```json
{
  "id": "provekit",
  "name": "ProveKit (World)",
  "kind": "general-stack | as-signed-catalog | hand-rolled | library",
  "maintainer": "World Foundation · Atheon · Reilabs · Nethermind",
  "frontend": "Noir (ACIR → R1CS)",
  "proofSystem": "Spartan-style + WHIR polynomial commitment; optional Groth16 recursive wrapper (gnark)",
  "field": "BN254 scalar field (Skyscraper hash)",
  "setup": "transparent (WHIR) · trusted setup only for the Groth16 wrapper",
  "postQuantum": "hash-based commitment → migration path plausible; wrapper is pairing-based",
  "credentialModel": "issuer-agnostic — any statement Noir can express; as-signed ECDSA/RSA statements shipped as examples",
  "platforms": ["ios", "android", "browser-wasm", "rust", "python", "c-ffi"],
  "verifier": ["local", "server", "browser", "on-chain (Groth16 wrapper)"],
  "license": "MIT",
  "iprNote": "compatible with Apache-2.0 code / CC-BY-4.0 docs deliverable",
  "audit": { "claim": "v1.0.0 described as 'the current stable, audited release'", "reviewedCommit": null, "fileSet": null, "source": "docs.provekit.org" },
  "maturity": "production (World, Atheon, partners)",
  "independentImplementations": 0,
  "provenance": { "repo": "https://github.com/worldfnd/provekit", "version": "v1.0.0", "contentAddressed": false },
  "benchmarks": [
    { "statement": "Passport P1", "device": "iPhone SE 3", "proveS": 2.43, "payloadMB": 2.55, "proofKB": 716, "source": "provekit.org/benchmarks (v1.0.0)" },
    { "statement": "WebAuthn", "device": "Moto E15 2GB", "proveS": 27.9, "payloadMB": 2.39, "proofKB": 716, "source": "provekit.org/benchmarks (v1.0.0)" }
  ],
  "covers": { "set-membership": "yes (Poseidon Merkle in Noir)", "nullifier": "yes", "transcript-bind": "yes", "key-binding": "yes", "distinctness": "yes", "signature-verify": "yes (ECDSA/RSA examples)", "non-revocation": "yes (indexed tree)", "range": "yes", "commitment-open": "yes", "chain-resolve": "recursion via wrapper — unmeasured" },
  "notes": [ "proof size ~700× Groth16; payload ~100× smaller — the trade the §25 gate must weigh per profile" ],
  "verified": "2026-09-05 — provekit.org, docs.provekit.org, github README"
}
```

The audit object deliberately carries `reviewedCommit` + `fileSet` — the §16.1 amendment the zk-kit note asked for
("audited MUST name the reviewed commit and file set"); null means *claimed, not located*.

### 2.2 `options[]` on each card — replaces free-text `substitutions[]`

```json
{
  "stack": "provekit",
  "route": "Noir port of nullifier_membership (Poseidon Merkle depth 20 + domain-tagged nullifier + transcript bind)",
  "coversClauses": [1, 2, 3],
  "statementDelta": "none — same public-signal order; Skyscraper vs Poseidon changes the leaf commitment (issuer-side X3 note)",
  "cost": { "constraintsOrGates": null, "proveS": null, "verifyMs": null, "proofKB": null, "payloadMB": null, "peakMB": null, "device": null },
  "evidence": "conjecture | lab-transcript | registry-row",
  "confidence": 0.6,
  "source": "board/stacks/provekit.json · runtimes/circom-gadget for the statement",
  "setupDependency": "none (WHIR)", "keyDistribution": "prover payload ~2.5 MB class",
  "offlineVerify": true, "hardwareDependency": "none", "revocationRefreshCost": "recompute witness per epoch",
  "recursion": "wrapper only", "pqPath": "hash-based core", "diagnosability": "unknown", "fallback": "Groth16 lab route",
  "issuanceRequirement": "issuer commits with a hash the stack can open cheaply (Poseidon or Skyscraper) — X3",
  "registryRow": null
}
```

Field-to-gate mapping (why these fields and not others): §25 *evaluation* considerations → option fields
one-to-one — proof/verification size → `cost.proofKB`/`verifyMs`; proving time on consumer devices →
`cost.proveS` + `device`; verifier throughput → `verifyMs`; trusted setup/toxic waste → `setupDependency`;
parameter/key distribution → `keyDistribution` + `payloadMB`; browser/mobile viability → stack `platforms`;
library maturity/independent implementations → stack `maturity`/`independentImplementations`; deterministic
vectors → recipe `tasting.vectors`; offline verification → `offlineVerify`; secure hardware →
`hardwareDependency`; revocation/refresh cost → `revocationRefreshCost`; recursion/folding → `recursion`;
post-quantum path → `pqPath`; diagnosability → `diagnosability`; fallback → `fallback`; deployment complexity →
stack `notes`. The 10 *approvals* stay where they are — on the card (statement, negative meaning, pantry,
adversary, horizon, issuance, composition, fixtures); the accountability path is a profile matter, not an option's.

### 2.3 Validator rules (register strings, refusals as values)

`option-stack-missing` · `option-clause-out-of-range` · `option-measured-without-source` (evidence ≠ conjecture
and no lab transcript / registry row named) · `option-registry-row-not-found` · `stack-no-license` ·
`stack-audit-unlocated` (warning: audit claimed, reviewedCommit null) · `stack-covers-unknown-gadget` ·
`card-no-hand-rolled-option` (warning: every recipe should have at least one route a stranger can build from the
page — the hand-rolled row is the recipe's own kitchen) · `card-options-single-stack` (warning: one vendor only
= not yet an option) · `option-reproduction-claimed-without-row` (reproduction state above `lab-measured` with no
`registryRows[]`) · `stack-no-verify-manifest` (a stack offered above `self-described` without a pinned
required-artifact manifest and a re-derivation script) · `recommendation-below-ladder` (a Recommendations entry
whose ladder rung is not met by its rows — the spec may not recommend what the registry cannot show).

### 2.4 Reproduction is a field, not a footnote — the registry inside every option

The evidence repo already answers "does this run on someone else's machine": `registry/` holds rows 0002–0006
(seats `mt`, `seat-7f`, `gg-affinidi` — the first external run, byte-identical required digests across
win32/x64 ↔ darwin/arm64), an acceptance flow with named gates (A intake · B seat triage · C admission **HUMAN**
· D evidence reconstruction · E verdict by read-only re-derivation then `accept.mjs` · publication **HUMAN** ·
G closure of the intake issue after the row lives), a `verification-run` issue template, a CI verifier
(`verify-submission.yml` → `verify-run.mjs` against the pinned manifest), and the rule that setup-chain
divergence (ptau/zkeys/vkey) is advisory, never fatal — machine-local entropy is the expected signature of an
independent build. The options layer inherits all of it as data:

| field | on | meaning |
|---|---|---|
| `reproduction.state` | option | `self-described` (vendor's or author's word) → `lab-measured` (a transcript in this repo) → `reproduced-once` (one registry row, different hands) → `reproduced-cross-arch` (rows on ≥2 OS/arch pairs) → `reproduced-multi-seat` (≥2 seats, ≥2 arch) |
| `reproduction.registryRows[]` | option | the row ids (e.g. `0006-gg-affinidi`) — the only thing that moves the state past `lab-measured` |
| `reproduction.requiredArtifacts` | option | which digests the row must match (circuit/R1CS/wasm/vkey…) vs which are advisory (setup chain) — per stack, because a transparent stack (WHIR) has no setup chain and an as-signed catalog entry pins a downloaded artifact rather than a build |
| `verify.manifest` + `verify.script` | stack | the stack's `artifacts.manifest.json` + `verify-run.mjs` equivalents: what a stranger runs to produce a `report.json` the acceptance flow can re-derive. Without these the stack cannot rise above `self-described`, whoever it belongs to |
| `verify.catalogEntry` | option | for as-signed catalogs: the content-addressed entry (sha256) the run rebuilt from `source.origin` + `toolchain` — the registry ↔ catalog bridge Mitch proposed on #17 |
| `seatsRun[]` | option | derived from rows: who reproduced it, so the S6 rule (constructor ≠ runner) is checkable at a glance |

Consequences the plan commits to: (i) `board.mjs spec` reads `registry/data/submissions/` and fills
`registryRows`/`state` itself — nobody types a reproduction claim; (ii) the acceptance flow gains one optional
input, *which option row this run is for* (`--option <card>/<stack>`), so a row lands on the table it proves;
(iii) every pilot in §6 ends by filing through the flow, including the lab's own runs — a constructor's run
stays `lab-measured` until a different seat files (`run-same-hands` applies to stacks exactly as to cards);
(iv) the Stacks chapter shows the reproduction state as the first column, before any number.

---

## 3. Seed stacks (first registry, 10 entries)

| id | kind | what | facts to carry (sourced today) | fit |
|---|---|---|---|---|
| `lab-groth16-circom` | hand-rolled | the lab's circom 2 / snarkjs / Groth16 / BN254 / Poseidon | 11,523 · 10,717 · 16,078 constraints; ~680–830 ms prove; ~8–10 ms verify; 721–725 B; lab-only fixed-entropy setup; registry rows 0002–0006 | measured baseline for 001/002/003/005; **the only stack with reproduced rows** |
| `paper-blackbox` | hand-rolled | ePrint 2026/333 §8–9: Gro15 structure-preserving signatures + hiding KZG (§3.7) + Groth–Sahai (§3.6) + commit-and-prove SNARK for *f* | Table 1/2: 0.03 s/vouch, CRS 13.4 KB, 0.10 s verify vs Groth16 2.3 s/vouch, CRS 119 MB → 1 GB @ 10 | the algebraic route for 010/011/007; pairing-based; **issuer must sign with SPS on BLS12-381 (X3)** |
| `paper-construction-I-II` | hand-rolled | §7.1 Construction I (F_PoP) / §7.2 Construction II (user-unlinkability, PRF key k_{U,ctx}) — generic NIZK over the commit-and-prove languages L_* | costs by instantiation; §5.3 impossibility bounds what P4 can promise; §5.4 revocation *f* | the *reference semantics* every other row is checked against (002, 006, 008 route 2, 012) |
| `provekit` | general-stack | World's Noir → WHIR toolkit (facts in §0) | 2.4–3 s iPhone SE 3 · 22–28 s Moto E15 · 2.5 MB payload · 716 KB proof · MIT · v1.0.0 "audited" (commit unlocated) | mobile prover for every primitive; the proof-size/payload trade |
| `flock` | general-stack | Succinct · Espresso Systems · NYU (Rothblum, Bünz, Wang): binary-field SNARK for batched Boolean computation, Ligerito hash-based commitment, transparent, post-quantum rationale; standard hashes (SHA-256 · Keccak · BLAKE3) at < 250× native | 82,100 BLAKE3 compressions/s single core M4 Max; > 660,000 on ten cores (≈ hashing for ~4,000 TPS under leanVM); 8.4× Binius64 on SHA-256; proof ≈ 436–438 kB for 2^18 compressions; being optimised for Ethereum PQ throughput on x86 (yukon.org/flock) | the hash side of every recipe — roots, non-membership, transcript digest — on the hashes registries already publish; **the post-quantum row**; signature clauses over curve credentials = open cost |
| `siros-longfellow` | as-signed-catalog | Google Longfellow libzk v1 via SIROS catalog (10 entries, mDL + EUDI PID, 1–4 attributes) | content-addressed sha256 artifacts ~300 KB; origin/toolchain/license fields; "experimental and unvetted"; BSD-2 catalog | legacy rails: ECDSA-signed credentials **as already issued** — no issuer change; proves attribute disclosure over mDL, not DTG predicates; substrate input to the gate, not a DTG recipe route |
| `siros-vega` | as-signed-catalog | Microsoft vega-prover fork (`zk-cred-vega`), P-256 mDL, prover/verifier keys r12 | 135–157 MB keys; r11 deprecated; BSD-2 | same class as Longfellow; key-distribution cost is the story |
| `crescent` | as-signed-catalog | Microsoft Crescent (JWT / mDoc selective disclosure, as-signed) | **to verify before seeding** — numbers and license from its repo | legacy rails, second vendor; keep unmeasured until fetched |
| `semaphore-zk-kit` | library | PSE Semaphore v4 + zk-kit (Circom/Noir/Rust) — NOTE-2026-08-19 findings | audited `binary-merkle-root.circom` at commit `215dfb3` (2024-03) vs npm latest 2.0.0 interface drift; `MultiMux1` no booleanity; circomlib GPL-vs-LGPL flag | cite / lint / track; structurally conformant, byte-incompatible with the lab tree |
| `no-proof` | declaration | "declare `directed` and reuse one identifier" (WD02 §Choosing a scope) | zero cost; the cost is the declaration | the honest zero row on 007/012 — the gate must see it |

Not seeded yet, listed so the gap is visible: Aztec **Noir + Barretenberg (UltraHonk)** (ProveKit's own baseline;
16–21 KB proofs, 270 MB payload per the benchmarks), **arkworks/gnark** as generic backends for the paper route,
**Longfellow direct** (google/longfellow-zk) outside the catalog, **zk-kit.noir** (substrate-migration exemplar,
LIV-ALG-07).

---

## 4. The hand-rolled series — the co-chair's contribution

The paper is the base; the recipes are the application. Each item = one hand-written section in a new chapter
**"Hand-rolled constructions from the personhood framework"** + one `options[]` row (`stack: paper-*`) on the
recipe it realises + one lab target. The series is numbered so it can be posted and referred to as a body of work.

| # | paper | DTG recipe(s) | what is hand-rolled | lab target (measure, then registry) |
|---|---|---|---|---|
| HR-1 | §2.1–2.2, §5 ideal functionality F_PoP; §5.1 Sybil-resistance / authenticated personhood / unlinkability | the predicate set (cards 001, 002, 005) | the **mapping**: PHC → VMC-from-accredited-VTC; VRC ↔ VRC; F_PoP's contexts → §6.2 context descriptor; the paper's mis-issuance model (§2.1) → the assurance boundary | none — a table, argued |
| HR-2 | §6 vouchable credentials; §8 blackbox VC (Gro15 SPS) | 010 clause 1 & 3 (vouch verifies under the community key = voucher holds the community credential) | **the linkage that #9 needs**: a VRC issued *under* the community credential — the vouch-under-community-credential shape — vs the WD02 `directed` shortcut vs card 007 | Rust (arkworks) SPS sign/verify + GS proof of one vouch; reproduce Table 1 @ N=1 |
| HR-3 | §7.1 Construction I | 010 (composed), 001, 002 | the community-anchored proof as the paper writes it: membership + PRF nullifier + *f*; Theorem 5 product bound → card 010's horizon/G2 line | circom composition (buildable now, est. 35–45k constraints) **and** the blackbox route side by side — the ZK Book's first two-stack measured row |
| HR-4 | §7.2 Construction II (k_{U,ctx} = PRF_K(I‖ctx)); §5.3 impossibility | 002 route 2, 008 route 2, 012 | user-unlinkability *parameterised by context* (P4 trade curve); the impossibility result as the recipe's stated ceiling | PRF-key derivation gadget (Poseidon PRF in circom; Noir port for ProveKit) |
| HR-5 | §5.4 example *f* supporting revocation (RL membership check inside *f*, the linkability caveat) | 006, 010 C1–C3 | the set-root primitive done the paper's way vs the sorted-leaf non-membership tree vs an accumulator witness — three rows, one statement | indexed-tree non-membership in circom (≈2× card 001) — the priority pressure-test Scott named |
| HR-6 | §3.7 hiding KZG | 001 substitution, 007 | constant-size membership opening as the alternative to Merkle; where KZG's trusted setup sits in the gate | arkworks KZG open/verify; pairing verify cost on a phone (unknown → measure) |
| HR-7 | §9.1 L_PRF Schnorr proof of PRF-key ownership; §3.2 commitments | 004, 007, 008 route 1 | holder binding and common control as Σ-protocols (no SNARK) — the cheapest honest row for 007 | Schnorr/Σ implementation (Rust); +transcript binding as Fiat–Shamir tag (Def. 5 SE-NIZK) |
| HR-8 | Appendix B.1 AI-agent reputation; B.3 decentralized business networks; Appendix C generic construction | 020 (delegation), the VDC/VAC pair, cred-tf #40 | the paper's agent case read against ADR-001 §05 / VDC core-vs-profile; generic construction (App. C) as the substitution recipe | none until 020 has a runtime; write the mapping so the Berkeley call can react to it |

Rule for the series: every HR section states the paper's relation in the paper's notation, then the DTG binding,
then the gadget decomposition (which cards), then the adversary/horizon it inherits from the paper's theorem, then
what is *not* carried over (the paper assumes issuers who choose their commitments — legacy rails are outside it).
Conjecture labelled. The series is the answer to "how we apply the cryptography to the trust graph": not a survey
of proof systems, a walk from one framework into twelve recipes with numbers.

---

## 5. Pipeline changes (`board/tools/`)

| step | change | test |
|---|---|---|
| 5.1 | `stacks/` dir + `stack.schema.json`; `board.mjs stacks` validates | every stack has `license`, `kind`, `provenance.repo`, `verified` date; `covers` keys ⊆ GADGETS |
| 5.2 | card schema: `options[]` (as §2.2); one-shot `tools/patch-options.mjs` migrates each `substitutions[]` row to an option with `evidence` derived from `measured` (true → `lab-transcript` w/ CIRCUITS.md line; false → `conjecture`); keep `substitutions` for one release, then remove | `option-stack-missing` etc. fire live; T-migration: every old route appears as an option |
| 5.3 | `spec.mjs`: render **Stacks** chapter (`spec/stacks.md`, generated) + per-recipe **options table** (columns = gate considerations; `evidence` chip) + a generated **coverage matrix** (stacks × gadgets) | K4: every option's stack renders; K5: no measured cell without a source string |
| 5.4 | `spec/hand-rolled.md` hand-written (HR-1..8), inserted between pantry and recipes in `specs.json` | K6: every HR section names a paper § and a recipe id |
| 5.5 | site: **Stacks** section + option chips on cards; watch-map entries for vendor repos (worldfnd/provekit releases, sirosfoundation/go-zk-circuits manifest — `survey` gains a `manifests` step that diffs the SIROS manifest and ProveKit release tags) | W3: manifest diff lists new/deprecated entries |
| 5.6 | registry ↔ catalog bridge (Mitch's #17 proposal): registry row schema gains `artifacts[]` (content-addressed pins); acceptance flow gains an optional `catalogEntry` field | pilot in §6.3 |
| 5.7 | **registry → ZK Book**: `spec.mjs` reads `registry/data/submissions/*` and `seats.json`, derives each option's `reproduction.state`, `registryRows[]`, `seatsRun[]`; renders the reproduction state as the first column of every options table and of the Stacks chapter; generates the **Recommendations** chapter (§7.0) from the ladder | K7: a fabricated `state: reproduced-once` with no row is refused; K8: state derived for 001/002/003/005 equals the rows on disk (0002–0006) |
| 5.8 | **per-stack verify kit**: every stack file names `verify.manifest` + `verify.script`; `accept.mjs` learns `--option <card>/<stack>`; `verify-run.mjs` generalised to read a stack's manifest (required vs advisory digests per stack kind: build-from-source · transparent-no-setup · as-signed-download) | R1: a run filed against an option lands on that option's row; R2: a stack without a verify kit cannot be filed against (`stack-no-verify-manifest`) |

Zero new dependencies; everything stays `node board/tools/board.mjs …`.

---

## 6. Pilots that turn conjecture into rows (the only thing that earns "measured")

| pilot | what | why first | effort |
|---|---|---|---|
| 6.1 | **card 007 in circom** (two Poseidon openings, shared secret) → constructed | door D7; cheapest measured row; unblocks #9's cost sentence | ~30 min |
| 6.2 | **Noir port of `nullifier_membership` on ProveKit** (Poseidon Merkle depth 20 + nullifier + transcript bind), prove on a phone + browser | the ZK Book's first cross-stack measured row on the same statement; tests the "same public signals, different hash" X3 note | 1–2 days (Noir circuit ~150 lines; ProveKit CLI prepare/prove/verify; iOS or Android device) |
| 6.3 | **one SIROS catalog entry through the registry acceptance flow** (`longfellow-libzk-v1_8_1_4259_2945`: fetch artifact by sha256, re-derive digest, rebuild from `source.origin` commit + toolchain, compare) | Mitch's stated first step on #17; proves the catalog↔registry bridge; gives SIROS the vetting half they say is missing | 1 day (build Longfellow at the pinned commit; reproducibility unknown — that *is* the finding either way) |
| 6.4 | **HR-2/HR-3 blackbox mini-implementation** (arkworks: SPS + GS one-vouch proof) → reproduce Table 1 N=1 | the paper route gets its own measured row; the Berkeley authors can check it | 1–2 weeks; ask the authors for reference code first (8 Sept) |
| 6.5 | 006 indexed-tree non-membership (HR-5) | set-root primitive pressure-test = Scott's priority | 1 day in circom |

Each pilot ends with a registry row or a lab transcript pinned in the option's `source`, never with a sentence.

---

## 7. Generating it into the ZKP spec repo (Spec-Up-T) — sequence

### 7.0 The chapter the spec actually needs: *Recommendations for proving systems* = a ladder over registry rows

Sits in the spec beside the Stacks chapter and is **generated**, never hand-edited. One entry per (recipe,
stack) pair that has reached a rung, grouped by recipe. The rungs are the reproduction states of §2.4 and the
spec text for each is fixed:

| rung | evidence on disk | what the spec may say |
|---|---|---|
| `self-described` | stack file + option row, `source` fetchable | *listed* — "a construction exists; the task force has not run it" |
| `lab-measured` | a transcript in the evidence repo (`CIRCUITS.md` class) | *experimental* — §16.1 wording verbatim; numbers shown with device and date |
| `reproduced-once` | one registry row, seat ≠ constructor | *candidate* — "reproduced by an independent party on independent hardware" |
| `reproduced-cross-arch` | rows on ≥ 2 OS/arch pairs | *recommended for profile evaluation* — the §25 gate may take it as evidence |
| `reproduced-multi-seat` | ≥ 2 seats, ≥ 2 arch, fixtures green under the recipe's name | *recommended* — the only rung at which the spec uses RECOMMENDED |

Two rules ride with it. A recipe's state (`carded → … → vetted`) and an option's rung are independent axes
and the spec prints both — a `vetted` recipe on a `self-described` stack is a recipe whose lab route was
reproduced and whose vendor route was not. And a recommendation names its **horizon**: the rows it rests on
carry `version`/`commit`; when the stack ships a new version the rung drops one step until a row on the new
version lands (the audited-commit-vs-shipped-commit class from the zk-kit note, applied to reproduction). This
is how "recommendations for proving systems" live *inside* the spec without the spec ever asserting what the
registry cannot show — the same rule as the board's, one level up.

1. **Shape thread** (draft H, exists) — the ZK Book as the deliverable's construction section. Add one line: the
   options layer makes the §25 gate's evaluation considerations *fields*, so a stack vendor fills the gate by PR.
2. **Options + Stacks + Hand-rolled chapters land in the evidence repo first** (§5), rendered, linked from H.
3. **PR to trustoverip/dtgwg-zkp-spec** (the specification repository set up 2026-09-02): the template skeleton (`spec/header · intro · terms intro · body · appendix`, `specs.json`), the `conformance/` apparatus (records · requests · stacks · schema · validator · test) and its CI workflow — see `COMMIT-PLAN.md`. `dtgwg-zkp-tf` keeps requirements, drafting rules, the board and the discussions; PR #21 there is independent. DCO sign-off; no AI trailer. The generator stays in the evidence repository; the spec repository's CI checks that generated text matches the records by digest.
4. **Governance of rows**: a stack file or option row enters by PR with a `source` a stranger can fetch; `evidence:
   registry-row` only when the registry has the row; vendors (World, SIROS, PSE) invited to PR their own stack file —
   self-description is allowed and labelled, reproduction is ours. **A vendor cannot raise its own rung**: the
   registry's seat triage (gate B) and admission (gate C, HUMAN) decide who the task force accepts a run from, and
   `run-same-hands` refuses a maintainer's run of a maintainer's stack. The registry stays in the evidence repo; the
   spec cites row ids, never copies them. IPR: rows are facts and links (CC-BY-4.0); vendor
   code stays in vendor repos (MIT/BSD-2/Apache — all citable; the circomlib LGPL flag stays on the zk-kit row).
5. **Cross-refs**: cred-spec cites recipes by `[[xref: DTG_ZKP, recipe-010]]` once the upstream renders; requirements
   v0.4 §16.1 points at the Stacks chapter as "the gate's evidence table"; §19.2 items 1–5, 9–11 each map to an
   option column (write the mapping into the Stacks chapter intro so the backlog and the table are one thing).
6. **IIW #43 (3–5 Nov)**: Working Draft with at least three `measured` stacks per primitive recipe (lab Groth16,
   ProveKit, one paper route) and one as-signed row (SIROS) marked *substrate*, plus the HR series — that is the
   "which proof type per predicate" answer with numbers, which is the §4 deliverable.

---

## 8. Drafts this plan adds to the board (posting = Mitch)

| draft | thread | gist |
|---|---|---|
| J | zkp-tf #17 (SIROS) | manifest now v1 with 14 entries (10 Longfellow + 4 Vega); schema mapped one-to-one onto the stack registry; pilot 6.3 named with the exact entry id; ask Leif/Peter whether a `reproduction` field on entries is welcome |
| K | zkp-tf NEW or #18 | "Stacks: the §25 gate as a table" — the options layer, with ProveKit and SIROS as the first two vendor rows and the hand-rolled series as the TF's own row; invite vendors to PR their file |
| L | to Scott before 8 Sept (DM/email, not a thread) | the HR series table (§4) as the question list for the Berkeley authors: which of §7.1/§7.2/§8–9 they would instantiate for DTG, whether reference code exists, and their view of the legacy-rails boundary |
| M | outreach — World (remco@world.org) and SIROS (Leif Johansson / Peter Altmann) | invitation to self-describe a stack file + the pilot; Mitch's voice, not a template |

---

## 9. Timeline

| when | milestone |
|---|---|
| **this week (before 8 Sept)** | §2 schemas (incl. §2.4 reproduction fields) + 9 seed stacks + options migration on 12 cards + Stacks and Recommendations chapters rendered (rows 0002–0006 already put the lab stack at `reproduced-cross-arch` for 001/002/003/005 — the first generated recommendation entries); pilot 6.1 (007 measured); draft L to Scott with the HR table |
| **by 19 Sept** | pilots 6.2 (ProveKit port) + 6.3 (SIROS entry through registry) + 6.5 (006); HR-1..5 written; drafts J/K posted; vendor outreach M sent |
| **by 3 Oct** | HR-6..8; blackbox mini-implementation started (6.4); upstream PR of `spec/` + workflow opened (after #21 merges) |
| **Oct → IIW #43 (3–5 Nov)** | vendor self-PRs folded; ≥3 measured stacks per primitive; Working Draft cut; BGIN B15 (15–16 Oct) can carry the Stacks chapter as the evidence-table story |

---

## 10. Risks and honest unknowns

- **ProveKit's audit is a sentence, not a commit.** The stack file says so (`reviewedCommit: null`) until located.
- **SIROS artifacts may not rebuild** from `source.origin` + `toolchain` — that is pilot 6.3's finding either way,
  and the reproduction field proposal follows from it.
- **Proof size vs payload is a real fork**: 716 KB proofs are fine for a verifier service and wrong for an on-chain
  or QR-carried presentation; the option table must let the gate see both numbers, and profiles (MLP/EPP) will pick
  differently. Do not let one column become "the" score.
- **Legacy rails are substrate, not recipes.** Longfellow/Vega/Crescent prove statements over credentials as
  already signed; DTG recipes assume issuers who choose commitments (X3). The Stacks chapter must keep the two
  classes visibly apart or the gate compares apples to signatures.
- **Hand-rolled ≠ audited.** The HR series is reference semantics with measured numbers, published under the same
  rule as everything else: reproduction and behaviour are not review. Say it on every HR page.
- **Vendor self-description drift** — the audited-commit-vs-shipped-commit class from the zk-kit note applies to
  every vendor row; the `verified` date and `provenance.version` fields exist to make drift visible.
- **Reproduction is not audit, on every rung.** A `reproduced-multi-seat` row says the published source builds
  bit-identically elsewhere and its behavioural suites hold there. It does not say the circuit is sound. The
  Recommendations chapter prints that sentence once per rung so RECOMMENDED is never read as reviewed.
- **Transparent and as-signed stacks need their own notion of "required digest."** WHIR has no setup chain to
  mark advisory; a catalog entry is a downloaded artifact, so its "build" is the sha256 match plus a rebuild from
  `source.origin` — pilot 6.3 decides whether the rebuild is even possible. `verify-run.mjs` must be generalised
  per stack kind (5.8) before any vendor row can climb.

---

## 11. Decisions for Mitch before build starts

1. **Replace or add**: migrate `substitutions[]` → `options[]` (recommended; one source of truth) or run both for a
   release.
2. **Which pilot first after 6.1**: ProveKit port (cross-stack number, needs a device) or SIROS entry (bridge proof,
   needs a Longfellow build). Recommendation: SIROS first — it fulfils a public promise on #17 and needs no hardware.
3. **HR series naming**: keep "HR-n" internally and give the public chapter a plain title ("Constructions from the
   personhood framework"), or name the series after the contribution. Your call; the numbering stays.
4. **Outreach order**: Scott first (L, before 8 Sept) → J on #17 → K → vendor mail M.
5. **Upstream timing**: PR the `spec/` scaffold only after #21 merges, or bundle. Recommendation: after — one
   question per PR, and #21 is the door that makes the second PR legible.
6. **Ladder thresholds**: the rung table in §7.0 (one row → candidate; two arch pairs → recommended for
   evaluation; two seats + two arch → RECOMMENDED). Confirm or tighten; it is the one place the spec's normative
   word hangs on a number, so the task force should set it, not the tool.
