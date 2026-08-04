---
title: "Lab — circom-gadget"
section: "lab"
source: "../dtgwg-zkp-tf-mage/runtimes/circom-gadget/NOTES.md"
built_from_commitish: "working-tree"
order: 62
---
# circom-gadget — the shared nullifier + membership circuit — notes

**What this is:** the lab's first real circuit — the SHARED GADGET that O2 (PHC-by-nullifier,
its **M3**), O4 (registry membership), multi-issuer (k-of-n seat), and guardian-recovery (set
membership) all converge on. Groth16 over bn128, circom 2.2.3 + circomlib Poseidon, proofs
generated and verified for real by `test.mjs` (10/10).

## The statement (exactly as proved)

```
public:   context          — the §6.2 canonical descriptor digest, reduced to a BN254
                             field element (never an opaque string)
          root             — Merkle root of the accredited enrolment set (Poseidon, depth 20)
          nullifier        — claimed per-context pseudonym
          transcriptDigest — the §15.2 canonical transcript digest, reduced mod p
                             (proof binding only — NOT in the nullifier preimage)
private:  secret s, blinding r, pathElements[20], pathIndices[20]
statement: Poseidon(s, r) ∈ root   ∧   nullifier = Poseidon(DOMAIN_TAG, s, context)
         ∧ transcriptSquare = transcriptDigest²   (dummy-square binding, 1 constraint)
```

**Public signal order** (groth16 `publicSignals`, declaration order):
`[context, root, nullifier, transcriptDigest]`. This layout is offered for TF ratification —
the lab applies; the group ratifies.

A verifier learns the nullifier and that it was produced by *some* enrolled member for this
context — never which member, never `s`. Same secret + same context ⇒ same nullifier (the
registry-side duplicate check, test Z4); different context ⇒ unlinkable nullifier (Z3).
The claim stays PR-UNQ-narrow (§13.1/§13.2): scoped reuse detection, **not** unique-human.

## Hash pinning (rt01 NOTES item 2, now concrete)

The reference model (runtime 01) uses SHA-256; this circuit uses **Poseidon over the BN254
scalar field, circomlib parameters**. Nullifier values **differ by hash**, so the spec MUST pin
the hash + parameters + the versioned domain tag — otherwise two conformant implementations
produce incompatible nullifiers. This gadget's pin is:

- Hash: Poseidon (circomlib 2.0.5 constants), arity 2 for commitment/tree, arity 3 for the
  nullifier.
- Domain tag (field constant, hardcoded in the circuit and re-derived + asserted in
  `harness.mjs`):
  ```
  tag        = 'dtg-zkp/nullifier/v0'          (same versioned tag as runtime 01)
  sha256(tag)= a4bcf045cf5929f088f9c19edf3d60c208f8278f931511df6336864b02fea8b8
  DOMAIN_TAG = sha256(tag) mod p
             = 8848404101512072295265332932144711420998576661229779766032777478684075272373
  p          = 21888242871839275222246405745257275088548364400416034343698204186575808495617
  ```
- nullifier = Poseidon(DOMAIN_TAG, secret, context); commitment = Poseidon(secret, blinding);
  tree nodes = Poseidon(left, right); zero leaf = 0, zeros[i+1] = Poseidon(zeros[i], zeros[i]).

## Context input (closes rt01 NOTES item 3 via the canonical module)

`context` is **not** chosen here — it is `descriptorDigest(descriptor)` from
`../canonical/canonical.mjs` (the §6.2 canonical context descriptor: 11 required fields,
sorted-key canonical JSON, domain-separated SHA-256), reduced mod p. Two verifiers that govern
different contexts derive different field elements (Z3/Z7); one verifier derives a stable one
(Z4). The circuit and the canonical module are now one loop: change the descriptor encoding
and every nullifier moves — which is exactly why §6.2 makes the encoding a conformance object.

### §13.4 binding list — what is in vs. out of the context digest

§13.4 says the nullifier MUST bind: enrolment-root id, context descriptor, scope, purpose,
epoch, versions, recovery domain. Status here:

| §13.4 input | status |
|---|---|
| context descriptor | **in** — it *is* the `context` input |
| scope, purpose | **in** the digest (`scope`, `purpose` fields) |
| epoch | **in** the digest (`epoch` + `epochPolicy` fields) — but as a digest field, not a separate circuit input; epoch rollover today means a new descriptor digest. A separate public `epoch` field input (so registries can enforce §22.2 bounded cryptoperiods without re-issuing descriptors) is a candidate v1 change. |
| versions (protocol/profile/nullifier) | **in** the digest (`protocol`, `profile`, `nullifierVersion`) |
| enrolment-root id | **partially** — the root is a public input of the *same proof* (so the statement binds it), but it is **not** an input to the nullifier hash itself: a secret enrolled under two roots yields the same nullifier in one context. Whether that is desired (common-root semantics, §13.3) or the root-id should enter the Poseidon preimage is an open decision — **out** for now. |
| recovery domain | **out** — deferred to the rotation/guardian-recovery work; no recovery-domain input yet. |

## Transcript binding (2026-07-18)

The **Semaphore v4 cross-check** (O2 M5, [Semaphore v4 Crosscheck](semaphore-v4-crosscheck.md) in the
research root) found exactly one **accidental** gap in this gadget (its divergence 7 /
recommendation 4): no in-circuit transcript/message binding. Semaphore binds a public
`message` via `signal dummySquare <== message * message` (1 constraint); we had nothing —
so a captured proof could be replayed under a different §15.2 transcript within the same
context/epoch, stopped only registry-side once the nullifier was recorded.

**Fix applied** (same dummy-square idiom): the circuit gains a public `transcriptDigest`
input (the §15.2 canonical transcript digest via `transcriptField` in `harness.mjs`,
mirroring `contextField`) bound by `signal transcriptSquare <== transcriptDigest *
transcriptDigest;` — measured cost **exactly +1 constraint** (11,522 → 11,523).

**The binding distinction, said plainly:**

- The **transcript binds the PROOF, not the nullifier.** The nullifier preimage is
  **unchanged** — still `Poseidon(3)([DOMAIN_TAG, secret, context])` — so the nullifier
  stays stable per context across presentations. That is its job: scoped reuse detection
  (test Z10 asserts two proofs under different transcripts in the same context carry the
  SAME nullifier, both verifying).
- The **proof becomes single-presentation**: verifying against a different public
  transcriptDigest fails cryptographically (test Z9) — the §15.1/§26.1
  replay-cross-transcript rejection is now enforced by the verifier equation, not only by
  registry bookkeeping.

**The dual circuit needs no equivalent fix — recorded as a deliberate asymmetry:** the
dual-issuer circuit's nullifiers already bind the show-transcript digest **in their
preimages** (`nullifier_i = Poseidon(ISSUER_TAG, secret_i, showContext)` where
`showContext` IS the §15.2 transcript digest). Single gadget: the transcript binds the
proof only, because the nullifier must stay stable across presentations within a context.
Dual gadget: the transcript sits in the nullifier preimage, because the show IS the scope
— issuer distinctness is a per-show property. Same governed object, two deliberately
different bindings. (Informative note: `build/o2-ref/` still holds the pre-binding --O2
reference r1cs (5,358) used by the dual measurement ratio; deleting `build/` regenerates
it at the post-binding count.)

**TF ratification:** the public-input layout `[context, root, nullifier, transcriptDigest]`
is applied here as the lab's proposal; the input layout is offered to the Task Force for
ratification (the lab applies; the group ratifies).

## Measurements (test Z8, this machine — Windows 11, Node 22)

| metric | value |
|---|---|
| constraints (r1cs) | **11,523** (5,428 non-linear + 6,095 linear; 11,548 wires) — was 11,522 pre-transcript-binding (**+1** for the dummy-square) |
| tree depth | 20 (≈1M enrolment capacity) |
| powers-of-tau | 2^14, local (cache REUSED across the transcript-binding rebuild — ptau is circuit-independent) |
| proving time | **~630 ms** (snarkjs groth16 fullProve, wasm witness) |
| verification time | **~8 ms** |
| proof size | 725 bytes (JSON) |
| verification key | 3,473 bytes (JSON — 4 public inputs now) |
| proving key (zkey) | ~5.0 MB · witness wasm ~2.1 MB |

These are the §25 performance-envelope / strawman §9 Q4 numbers: sub-second proving on a
consumer machine leaves generous headroom in any realistic claim-ceiling-per-presentation
budget; the ~5 MB proving key is the artifact a wallet must hold per circuit.

## What this unlocks

- **O2 M3 done**; M4 (cost data) is captured in the table above as a first datapoint.
- The **membership leg is now portable**: O4 registry membership, the multi-issuer k-of-n
  seat, and guardian-recovery set membership are the *same* MerkleInclusion template with a
  different set semantics — only the nullifier leg's domain tag / context changes per use.
- rt01's P4 self-Sybil property now holds **in ZK** (Z4/Z5), not just in the reference model.

## Deferred

- ~~**Semaphore v4 cross-check = O2 M5**~~ — **DONE 2026-07-18**
  ([Semaphore v4 Crosscheck](semaphore-v4-crosscheck.md), research root); its one accidental-gap finding
  (no in-circuit transcript binding) is fixed above.
- **§13.4 leftovers** — separate epoch field input; root-id-in-preimage decision; recovery/
  rotation domain (see table above).
- **Failure/redress semantics (§13.6)** — a repeated nullifier may be a retry, race, recovery,
  or epoch disagreement; that logic lives registry-side, above this circuit.

## Deviations + caveats

- **npm deviation (recorded per lab rule):** the lab's reference models are zero-dep; a
  circuit build legitimately needs npm deps — `circomlib` (Poseidon circuits), `circomlibjs`
  (JS-side Poseidon mirror), `snarkjs` (prove/verify). All of it is confined to
  [Lab — circom-gadget](lab-circom-gadget.md) (own `package.json`, own `node_modules/`); everything else in the
  lab stays zero-dep. The harness *reads* `../canonical/canonical.mjs` (zero-dep) unmodified.
- **Trusted-setup caveat, said plainly:** `setup.mjs` runs a *local* powers-of-tau ceremony
  and a single zkey contribution with a fixed entropy string (`dtg-zkp-lab-entropy-v0`). That
  is a lab measurement rig, **NOT a production ceremony**. Anyone holding this setup's toxic
  waste could forge proofs; a real deployment needs a multi-party ceremony or a well-known
  audited ptau (e.g. the Hermez/perpetual-powers-of-tau files) plus a public phase-2.
- **Caching:** artifacts live in `build/` and every pipeline step is check-then-skip; a fresh
  clone rebuilds identically apart from proof randomness (and snarkjs's internal contribution
  randomness). Delete `build/` to force a full rebuild. Since 2026-07-18 `setup.mjs` is also
  staleness-aware: a circuit source newer than the cached r1cs invalidates r1cs/wasm/zkey/vkey
  automatically — the ptau files are circuit-independent and are never invalidated.
- Test Z5 intentionally triggers a witness-generation constraint failure; snarkjs prints an
  `ERROR ... line: 111` (the `mt.root === root` constraint) — expected, and labelled in the
  test output.

## Files

- `circuits/nullifier_membership.circom` — the gadget (MerkleInclusion + NullifierMembership).
- `harness.mjs` — deterministic JS mirror: `enrolField`, `buildTree`, `contextField`,
  `transcriptField`, `nullifierField`, `makeInput`.
- `setup.mjs` — compile + ptau + groth16 setup pipeline (cached + staleness-aware;
  standalone or imported).
- `test.mjs` — Z1–Z10; run `node test.mjs` (first run builds everything, ~2–3 min).

## Sibling circuit: dual-issuer (X8 k=2)

**What it is:** the first sibling of the shared gadget — `circuits/dual_issuer.circom` realizes
X8's k=2 tier IN-CIRCUIT: *two pairwise-distinct members of the accepted issuer set at one named
root each contribute to this show, without revealing which members* (§12.5 / X8 ZK-realization).
New files only (`setup-dual.mjs`, `harness-dual.mjs`, `test-dual.mjs` — D1–D7, 7/7); the single
gadget and its artifacts were untouched at the time (re-verified 8/8; since the 2026-07-18
transcript-binding change the single suite is 10/10 and dual remains 7/7 — the dual circuit
needs no equivalent fix, see the Transcript binding section).

### The statement (exactly as proved)

```
public:   showContext — the §15.2 canonical show-TRANSCRIPT digest mod p (the show is the
                        scope, per X8 — NOT the §6.2 descriptor digest the single gadget uses;
                        matches the multi-issuer reference's issuerShowNullifier input)
          root        — ONE accepted-issuer-set Merkle root for BOTH legs (§12.4: mixed
                        snapshots are a §26.1 rejection — here they are simply unprovable)
          nullifier1, nullifier2 — per-issuer per-show distinctness pseudonyms
private:  secret_i, blinding_i, pathElements_i[20], pathIndices_i[20]   (i ∈ {1,2})
statement: Poseidon(secret_i, blinding_i) ∈ root                         (both i)
         ∧ nullifier_i = Poseidon(ISSUER_TAG, secret_i, showContext)     (both i)
         ∧ nullifier1 ≠ nullifier2                                       (in-circuit)
```

### ISSUER_TAG derivation (same sha256-mod-p pattern as DOMAIN_TAG)

```
tag        = 'dtg-zkp/issuer-show-nullifier/v0'   (SAME string as the multi-issuer
             reference model's DOMAIN_ISSUER_SHOW_NULLIFIER — one governed name, two
             hash pins: SHA-256 there, Poseidon here)
sha256(tag)= 790b4d621ed2069a7dc95786678c4a3ed0a5e86ae4b100a9a2c585f5de5d0c77
ISSUER_TAG = sha256(tag) mod p
           = 10973338332398489381181448044177053429928920939795168163925594436592914467957
```

Hardcoded in the circuit, re-derived + asserted in `harness-dual.mjs`.

### The in-circuit distinctness trick

Distinctness (X8 assumption A3) is one constraint: witness `inv = 1/(nullifier1 − nullifier2)`
(hint: `inv <-- diff != 0 ? 1/diff : 0`) and constrain `diff * inv === 1`. If the same issuer
secret drives both legs, the difference is 0, zero has no inverse, and the constraint is
**unsatisfiable — a duplicate issuer cannot even produce a witness** (test D3 asserts the
witness-generation failure at that constraint).

### Measurements (test D7, same machine)

| metric | dual (--O2) | single | ratio |
|---|---|---|---|
| constraints (r1cs) | **10,717** | 5,358 (--O2 like-for-like) | **2.000×** |
| | | 11,522 (--O1, as shipped above) | 0.930× |
| distinctness overhead | **+1 constraint** over 2× the O2 single | | |
| proving time | ~1,110 ms | ~640 ms | ~1.7× |
| verification time | ~16 ms | ~10 ms | |
| proof size | 725 bytes | 722 bytes | flat (groth16) |
| zkey | ~6.1 MB · wasm ~2.2 MB | ~5.0 MB · ~2.1 MB | |

**Compile-flag note:** the dual circuit is compiled `--O2`. Under the default `--O1` the doubled
circuit would be ~23k total constraints and overflow the cached 2^14 ptau (16,384 cap); `--O2`
substitutes the linear constraints away and the non-linear core (2×5,358 + 1) fits, so the
cached `build/pot14_final.ptau` is REUSED unchanged. For the honest ratio, `setup-dual.mjs`
also compiles an `--O2` reference r1cs of the single gadget into `build/o2-ref/` (informative
only; the shipped O1 artifacts are not regenerated).

### What this demonstrates for X8

- **The k=2 tier of X8's governed vocabulary (k ∈ {1,2,3}) is realizable in-circuit** at ~2×
  the single gadget's cost plus one constraint, with sub-second-order proving and flat
  groth16 proof size. **k=3 is the same pattern**: three legs + pairwise distinctness
  (3 inverse constraints); cost extrapolates linearly in k, C(k,2) in distinctness.
- **Threshold hiding is still future work** — k is public here (k IS the disclosure, X8):
  hiding k, or proving k-of-m held, needs a different circuit shape, not more legs.
- The multi-issuer reference's `'duplicate-issuer-in-show'` rejection now has a
  **circuit-level counterpart with a different failure shape**: the reference verifier sees a
  nullifier collision and returns a NAMED rejection after the fact; the circuit makes the
  duplicate **unsatisfiable** — there is no artifact to reject and no name attached. For the
  X1 fixture story this matters: reference-model negative fixtures carry rejection codes,
  circuit negative fixtures can only carry "no valid proof exists for these inputs" — a
  fixture format for circuit negatives has to encode unprovability, not a code.
- What the circuit does NOT carry (stays registry-side, per the reference model): the
  independence register / effectiveK collapse, ε staleness, tier enforcement, and A4
  same-proposition binding — the circuit proves distinct set-members, the register decides
  how many factors actually multiply.

### Sibling files

- `circuits/dual_issuer.circom` — IssuerLeg ×2 + inverse-distinctness (MerkleInclusion
  re-declared verbatim; the original file ends in its own `component main`, so it cannot be
  `include`d).
- `harness-dual.mjs` — issuer enrolment, `showContextField` (transcript digest),
  `issuerNullifierField`, `makeDualInput`; reuses `harness.mjs` helpers read-only.
- `setup-dual.mjs` — compile (`--O2`) + groth16 setup, ptau cache reused; `build/o2-ref/`.
- `test-dual.mjs` — D1–D7; run `node setup-dual.mjs` then `node test-dual.mjs`.

## Third circuit: guardian threshold (X9 t-of-n)

**What it is:** `circuits/guardian_threshold.circom` realizes X9's threshold-recovery mitigation
IN-CIRCUIT for t=3: *three pairwise-distinct guardians from the committed guardian set each
attest THIS continuity claim in THIS recovery context — without revealing which guardians* (X9
"guardian-set commitments" + "k-out-of-n distinctness discipline"; the circuit leg the
guardian-recovery reference model `runtimes/guardian-recovery/guardians.mjs` deferred by name).
New files only (`setup-guardian.mjs`, `harness-guardian.mjs`, `test-guardian.mjs` — G1c–G8c,
8/8); single (10/10) and dual (7/7) re-verified untouched.

### The statement (exactly as proved)

```
public:   recoveryContext — the §6.2 RECOVERY-DOMAIN descriptor digest mod p; the guardian
                            EPOCH lives INSIDE the descriptor (its `epoch` field) — epoch
                            rollover = new digest = fresh seat nullifiers (§22.2 behaviour)
          guardianRoot    — Merkle root over guardian commitments Poseidon(secret, blinding):
                            the COMMITTED set. ONE root for all three legs.
          claimDigest     — the continuity claim (newCommitment + revokedRef + §15.2 ceremony
                            transcript, hashed harness-side under 'dtg-zkp/recovery-claim/v0',
                            reduced mod p)
          nullifiers[3]   — per-guardian recovery-seat pseudonyms
private:  secret_i, blinding_i, pathElements_i[20], pathIndices_i[20]   (i ∈ {1..3})
statement: Poseidon(secret_i, blinding_i) ∈ guardianRoot                       (all i)
         ∧ nullifier_i = Poseidon(GUARDIAN_TAG, secret_i, recoveryContext)     (all i)
         ∧ nullifier_i ≠ nullifier_j  ∀ i<j     (C(3,2)=3 inverse constraints, in-circuit)
         ∧ claimSquare = claimDigest²           (dummy-square binding, 1 constraint)
```

**Public signal order:** `[recoveryContext, guardianRoot, claimDigest, nullifiers[0..2]]`
(asserted in G4c). Template is `GuardianThreshold(depth, t)` with
`main = GuardianThreshold(20, 3)` — t is FIXED at 3 in this artifact; the parameter shows the
generalization (legs scale linearly in t, distinctness as C(t,2)).

### GUARDIAN_TAG derivation (same sha256-mod-p pattern as DOMAIN_TAG / ISSUER_TAG)

```
tag         = 'dtg-zkp/guardian-seat-nullifier/v0'
sha256(tag) = 73b6cd8dbb162c686520d25d94d5b3daf378f4e32d817fabd0de983f2517339b
GUARDIAN_TAG= sha256(tag) mod p
            = 8562476688242842477897907163240902665687518953395242745930442724180399436697
```

Hardcoded in the circuit, re-derived + asserted in `harness-guardian.mjs`. This is the
**circuit-level pin of the reference model's string-domain convention** — guardians.mjs scopes
the seat as `nullifier(secret, 'guardian/' + descriptorDigest + '/' + epoch)`; here the same
governed scope (recovery context + epoch) enters a Poseidon preimage as
`(GUARDIAN_TAG, secret, recoveryContext)` with the epoch inside the descriptor digest. One
governed name, two hash pins (SHA-256 string domain there, Poseidon field preimage here) —
the same move as ISSUER_TAG / rt01 NOTES item 2.

### The two bindings, kept distinct (the seat property)

- **Seat nullifier binds the RECOVERY CONTEXT** — claim-independent: the same guardian in the
  same recovery context+epoch produces the SAME nullifier under two rival claims (G4c), so
  double-vouching across competing replacement commitments is DETECTABLE registry-side (§6.5
  intentional in-context linkage; feeds the reference model's contested-recovery path). Across
  recovery contexts the nullifiers are unrelated (G6c, §6.6).
- **claimDigest binds the PROOF** (dummy-square, the ratified pattern) — a guardian bundle
  proved for claim A fails verification against public claim B in both directions (G5c): the
  bundle cannot be transplanted to authorize a different replacement.

### Signer-set hiding, said precisely

The verifier of a threshold proof learns: the committed set (by `guardianRoot`), that t=3
distinct members of it signed (by the circuit shape + 3 distinct nullifiers), the recovery
context (with epoch), and the continuity claim — **never which guardians signed**, never a
guardian secret or commitment. The seat nullifiers are pseudonyms scoped to the recovery
context: they expose reuse WITHIN the context, nothing across contexts, and no leaf position.
This is the circuit-grade version of the reference model's `auditSignerSetHidden` (which is
structural: it checks guardian material is absent from the authorization object; here the
hiding is cryptographic).

### What stays OUT of the circuit (reference-model / promote-lane territory)

- **Set commitment vs Merkle root — two representations, unreconciled.** guardians.mjs commits
  the set as a FLAT hash (`setCommitment` = H over sorted commitments + descriptor + epoch +
  t + n); the circuit needs provable inclusion, so it uses a Merkle root over the same guardian
  commitments. A verifier holding a reference-model `setCommitment` cannot check it against
  this circuit's `guardianRoot` without the registry publishing both against one enrolment
  event. **Reconciling the two representations (or replacing the flat hash with the root) is
  the promote-lane task.**
- **Epoch lapse checking** — the circuit proves against whatever descriptor digest it is
  handed; that the epoch inside it is the LIVE guardian epoch (`guardian-epoch-lapsed`) is a
  registry-side check against the live clock (guardians.mjs steps 0/2, GUARDIAN_CLOCKS/§22.2).
- **Personhood-gating of guardians at set-commit time** — the rt01 leg
  (`guardian-not-personhood-anchored`): the Sybil-self-guardian kill happens when the set is
  COMMITTED, not when the proof is made. Reference model's job.
- **Contest/freeze semantics** — rival claims in one epoch (`contested-recovery`, the ceremony
  freeze, §13.6 challenge route) are registry state above the proof; the circuit's contribution
  is that the seat nullifiers make rival-claim double-vouching visible (G4c).
- **t as a profile parameter** — fixed 3 in this artifact; who sets t/n and whether a
  below-floor t is a conformance failure stays a §6.7/profile question (X9 open questions).
- Also inherited from the reference model: threshold-met-is-not-completion (the issuer's
  re-issuance record is the outcome artifact), and n (the committed-set size) — the circuit
  exposes t, never n.

### Measurements (test G8c, same machine)

| metric | guardian (--O2) | vs | ratio |
|---|---|---|---|
| constraints (r1cs) | **16,078** (16,145 vars, 6 public) | 5,358 single --O2 | **3.001×** |
| | | 11,523 single --O1 (as shipped) | 1.395× |
| | | 10,717 dual --O2 | 1.500× |
| overhead | **+4 constraints** over 3× the O2 single (3 distinctness + 1 claim binding — exactly as designed) | | |
| ptau headroom | 306 constraints under the 2^14 cap (16,384) | | |
| proving time | ~790 ms | single ~640 ms | ~1.2× |
| verification time | ~11 ms | | |
| proof size | 723 bytes (flat, groth16) | | |
| zkey | ~8.6 MB · wasm ~2.2 MB | | |

**Compile-flag note:** compiled `--O2` like dual — under `--O1` the tripled circuit would be
~34k constraints and overflow the cached 2^14 ptau; at `--O2` the non-linear core
(3×5,358 + 3 + 1 = 16,078) fits with **306 constraints of headroom**, so `build/pot14_final.ptau`
is REUSED unchanged. This is the ceiling: **t=4 at depth 20 does NOT fit 2^14** (~21.4k) — a
larger t (or a deeper tree) needs a pot15 ceremony, which is the natural break point at which
t stops being "add a leg" and becomes a real profile/setup decision.

### The fixture-story note (same pattern as dual, one hop over)

The reference model refuses a duplicate guardian BY NAME (`'duplicate-guardian-seat'`, a
checker-side rejection with a code); the circuit makes the duplicate **UNSATISFIABLE** — with
two legs on one guardian secret some nullifier difference is 0, zero has no inverse, and
`diff * inv === 1` cannot be witnessed (G2c asserts the witness-generation throw). There is no
artifact to reject and no name attached. Circuit negative fixtures must therefore encode
**unprovability** ("no valid proof exists for these inputs"), not a rejection code — the same
X1 fixture-format consequence the dual circuit recorded for `'duplicate-issuer-in-show'`.

### Guardian files

- `circuits/guardian_threshold.circom` — GuardianLeg ×3 + pairwise inverse-distinctness +
  claim dummy-square (MerkleInclusion re-declared verbatim; the originals end in their own
  `component main`, so they cannot be `include`d).
- `harness-guardian.mjs` — guardian enrolment, `recoveryContextField` (descriptor digest,
  epoch inside), `claimDigestField`, `guardianNullifierField`, `makeGuardianInput`; reuses
  `harness.mjs` helpers read-only.
- `setup-guardian.mjs` — compile (`--O2`) + groth16 setup, staleness-aware like `setup.mjs`;
  ptau cache reused.
- `test-guardian.mjs` — G1c–G8c; run `node setup-guardian.mjs` then `node test-guardian.mjs`.
