---
title: "Semaphore v4 Crosscheck"
section: "explorations"
source: "explorations/SEMAPHORE-V4-CROSSCHECK.md"
built_from_commitish: "working-tree"
order: 48
---
# SEMAPHORE V4 CROSS-CHECK — nullifier-membership gadget vs Semaphore v4

**Register:** O2 · **Milestone:** M5 (Semaphore v4 cross-check) · **Ladder:** research note
**Date:** 2026-07-18
**Our construction (ground truth):** `~/dtgwg-zkp-tf-mage/runtimes/circom-gadget/circuits/nullifier_membership.circom`
(+ `harness.mjs`, `NOTES.md` — 8/8 real groth16 proofs, 11,522 constraints)
**Anchors:** O2 exploration ([O2 — PHC by Nullifier](o2-phc-by-nullifier.md)) ·
decision doc PR-UNQ §13 (narrow claim: **scoped reuse detection, not unique-human**) · §6.2 canonical
context descriptor · §13.4 binding list · §15.2 canonical transcript · rt01 NOTES item "cross-check
the nullifier definition against Semaphore v4 so we can say conformant-with / diverges-from precisely."
**Semaphore v4 ground truth:** `packages/circuits/src/semaphore.circom` @ semaphore-protocol/semaphore
`main` (v4 line), verified 2026-07-18 against the sources listed at the end.

---

## 0. The two statements, exactly

**Ours** (`NullifierMembership(20)`, circom 2.2.3, groth16/bn128):

```
public:  context (§6.2 canonical descriptor digest mod p), root, nullifier
private: secret s, blinding r, pathElements[20], pathIndices[20]
statement: Poseidon(2)([s, r]) ∈ root  ∧  nullifier = Poseidon(3)([DOMAIN_TAG, s, context])
DOMAIN_TAG = sha256('dtg-zkp/nullifier/v0') mod p
           = 8848404101512072295265332932144711420998576661229779766032777478684075272373
```

**Semaphore v4** (`Semaphore(MAX_DEPTH)`, verbatim from the circuit source):

```
private: secret, merkleProofLength, merkleProofIndex, merkleProofSiblings[MAX_DEPTH]
public in:  message, scope
public out: merkleRoot, nullifier
statement: secret < l   (l = Baby Jubjub prime subgroup order
                          = 2736030358979909402780800718157159386076813972158567259200215660948447373041,
                          enforced via LessThan(251))
           (Ax, Ay) = BabyPbk()(secret)          // EdDSA pubkey point from secret scalar
           identityCommitment = Poseidon(2)([Ax, Ay])
           merkleRoot <== BinaryMerkleRoot(MAX_DEPTH)(identityCommitment,
                              merkleProofLength, merkleProofIndex, merkleProofSiblings)
           nullifier <== Poseidon(2)([scope, secret])   // scope FIRST, then secret
           signal dummySquare <== message * message      // binds message into the proof
```

JS side (verified in `@semaphore-protocol/identity` + `@zk-kit/eddsa-poseidon`): the user-held
private key is an arbitrary byte string; `secretScalar = (leBufferToBigInt(pruneBuffer(hash(privateKey)
.slice(0,32))) >> 3) mod subOrder` (BLAKE by default, BLAKE2 optional — EdDSA key clamping);
`publicKey = mulPointEscalar(Base8, secretScalar)` on Baby Jubjub; `commitment = Poseidon(2)(publicKey)`.
The circuit's `secret` input IS this secret scalar.

## 1. Side-by-side

| Dimension | Semaphore v4 | DTG gadget (ours) | Match? |
|---|---|---|---|
| Identity secret | EdDSA private key → derived **secret scalar** (BLAKE-hash, pruned, `>>3`, mod Baby Jubjub suborder); circuit range-checks `secret < l` via `LessThan(251)` | Raw BN254 field element `s` + independent **blinding** `r` (no key structure, no range check beyond field) | ✗ |
| Identity commitment | `Poseidon(2)([Ax, Ay])` — hash of the **public key** point derived in-circuit by `BabyPbk()` | `Poseidon(2)([s, r])` — hash of **secret + blinding** directly | ✗ (same hash, same arity, different preimage semantics) |
| Hiding of commitment | No blinding factor; hiding rests on unpredictability of the pubkey (preimage resistance over the keyspace) | Explicit blinding `r` — commitment is hiding even if `s` is low-entropy or structured | ✗ (deliberate on our side) |
| Group tree | **LeanIMT**: binary Poseidon(2) tree, **dynamic depth** (grows with leaf count), **no zero padding** — a node missing its right child *adopts the left child's value unhashed*; proof carries `merkleProofLength` | Fixed **depth 20** Poseidon(2) tree, **zero-leaf padding** (`zeros[0]=0`, `zeros[i+1]=Poseidon(zeros[i],zeros[i])`) | ✗ (same node hash; different shape, padding, and proof format) |
| Nullifier | `Poseidon(2)([scope, secret])` — **arity 2, scope first, no domain tag** | `Poseidon(3)([DOMAIN_TAG, secret, context])` — **arity 3, versioned tag first, context last** | ✗ — order AND arity differ; values can never coincide |
| Scope vs context | `scope` is an **arbitrary app-chosen field element** ("each user may only generate one valid proof" per scope); no canonical encoding mandated | `context` is the **§6.2 canonical governed descriptor digest** (11 required fields — protocol/profile versions, authority, policy, purpose, scope, verifier-set, epoch, nullifier version, retention — sorted-key canonical JSON, domain-separated SHA-256, reduced mod p). Governance of the scope IS the decision doc's point | ✗ (protocol-layer; their circuit would accept our digest as a scope) |
| Epoch | None — scope is the only scoping mechanism | Epoch + epochPolicy inside the descriptor digest (§22.2 bounded cryptoperiods); separate epoch input is a candidate v1 change | ✗ |
| Message / action binding | Public `message` input bound in-circuit via `dummySquare <== message * message` (1 constraint) — proof is bound to an arbitrary payload | **No in-circuit message input.** Presentation binding deferred to the protocol layer (§15.2 canonical transcript) | ✗ — see WHY-FLAG below |
| Proof system | groth16 over BN254 (snarkjs); `SemaphoreVerifier.sol` = extended snarkjs groth16 verifier holding VK parameters for every `MAX_DEPTH` 1–32 | groth16 over BN254 (snarkjs), single circuit instance at depth 20 | ✓ |
| Trusted setup | Real **MPC phase-2 ceremony** ("Semaphore V4 Ceremony", p0tion/DefinitelySetup infrastructure; completed 13 July 2024, 400+ participants); artifacts distributed via the snark-artifacts mechanism | **Lab-only** local ptau + single contribution with fixed entropy — explicitly NOT a production ceremony (NOTES caveat) | ✓ in kind, ✗ in maturity |
| Sizes | Depths 1–32 supported; v4 adds `BabyPbk` + `LessThan(251)` over v3's hash-only identity ("slightly slower… by a few milliseconds"). Published constraint counts: **unconfirmed** — the docs benchmarks page renders charts as images (env: MacBook M2 Pro); numbers live in the linked benchmark repo, not verified here | **11,522 constraints** (5,427 non-linear) at depth 20; ~640 ms prove, ~10 ms verify, 722 B proof (Windows 11 consumer machine) | n/a |

## 2. Conformant with

We are a **compatible member of the Semaphore family of constructions** — the shape is identical:

1. **Same skeleton.** A Poseidon-committed identity, enrolled as a leaf in a Poseidon binary Merkle
   group, proving membership + a deterministic per-scope nullifier in one groth16/BN254 statement.
   Same hash family (circomlib Poseidon), same node arity (2), same proof system, same curve.
2. **Same nullifier semantics.** Deterministic function of (secret, scoping value); same secret +
   same scope ⇒ same nullifier (their per-scope one-proof property = our Z4 duplicate check);
   different scope ⇒ unlinkable (our Z3 = their cross-scope unlinkability). Semaphore's docs state
   the nullifier is "used to check whether a proof with that scope has already been generated by that
   user" — exactly our decision-doc language: **scoped reuse detection**, not unique-human. Both
   constructions leave one-person-one-leaf to enrolment governance.
3. **Same anonymity-set logic.** Verifier learns membership-in-root + nullifier, never which leaf.
4. **Their `scope` and our `context` occupy the same slot in the algebra.** Our §6.2 digest is a
   valid Semaphore scope value; we govern what they leave free.

## 3. Diverges from

Each divergence tagged **WHY** (deliberate, per the decision doc) or **WHY-FLAG** (accidental /
needs a TF decision).

1. **Explicit domain tag in the nullifier preimage** — ours `Poseidon(3)([TAG, s, ctx])`, theirs
   `Poseidon(2)([scope, secret])` with no tag. **WHY:** §13.4 requires the nullifier to bind
   protocol/profile/nullifier **versions**; the versioned tag (`dtg-zkp/nullifier/v0`) is the hash
   pin made explicit in-circuit, and gives explicit domain separation from the commitment hash
   (Semaphore separates commitment vs nullifier only structurally — both are arity-2 Poseidon).
   Nuance for the TF: our §6.2 digest already contains `protocol`/`profile`/`nullifierVersion`
   fields, so the in-preimage tag is partially redundant with the digest — the tag is still the
   only version binding that survives a descriptor-encoding change.
2. **Blinding in the commitment** — ours `Poseidon(s, r)`, theirs `Poseidon(Ax, Ay)` unblinded.
   **WHY:** deliberate hiding independent of secret entropy/structure; matters if enrolment secrets
   are ever derived (e.g. biometric-derived, §29) rather than uniformly random.
3. **EdDSA identity — what we give up.** Semaphore's secret is a signing key: the same identity can
   sign and verify messages **outside the circuit**, enabling ownership/holder-binding proofs and
   off-circuit auth with no extra machinery. Our raw field secret can do nothing but be hashed.
   **WHY (for now):** simplicity + zero-dep discipline; but this is a real capability gap with
   PR-HLD synergy — see recommendation 3.
4. **Fixed depth 20 + zero padding vs LeanIMT dynamic depth, no padding.** LeanIMT propagates a
   lone left child upward unhashed and carries `merkleProofLength` in the proof; ours pads with an
   explicit zeros chain at fixed depth. Proof formats and roots are incompatible even for identical
   leaf sets. **WHY:** a fixed, pinned tree shape is simpler to specify as a conformance object and
   costs nothing at our scale; LeanIMT's wins are dynamic-group gas/insert costs (v4 release: ~$8000
   → <$1000 for a 1000-member on-chain migration) which we don't yet need.
5. **Governed context vs free scope.** Theirs: any field element, app's problem. Ours: the §6.2
   canonical descriptor digest — canonicalization is a **conformance requirement** because
   unlinkability (Z3) and stability (Z4) hinge on it. **WHY:** this is the decision doc's central
   move; not a gap on their side so much as a layer they don't standardize.
6. **No epoch machinery on their side.** §22.2 bounded cryptoperiods have no Semaphore equivalent;
   an unbounded nullifier is non-conformant for us. **WHY:** deliberate (governance requirement).
7. **No in-circuit message binding on our side.** Semaphore binds an arbitrary `message` into the
   proof for one constraint (`message * message`); our circuit has no such input, so a DTG proof is
   not cryptographically bound to the action payload it authorizes — replay of a captured proof
   within the same context/epoch is only stopped registry-side once the nullifier is recorded, and
   the §15.2 canonical transcript binding currently lives entirely outside the proof. **WHY-FLAG:**
   this looks accidental, not chosen. Adding a public `transcriptDigest` (or `message`) input with
   the dummy-square idiom costs ~1 constraint and closes it. TF decision needed.
8. **Setup maturity.** Their artifacts come from a real 400+-participant MPC ceremony; ours from a
   lab rig with fixed entropy. **WHY:** known and documented (NOTES caveat); becomes a WHY-FLAG the
   moment anything leaves the lab.

## 4. Interop verdict

**No — in both directions, as-is.** Said plainly:

- A Semaphore verifier (JS or `SemaphoreVerifier.sol`) cannot verify a DTG proof: different circuit,
  different verification key, and their VK set only covers their own circuit at depths 1–32.
- Even at the value level nothing lines up: our commitment `Poseidon(s,r)` is not a Semaphore
  identity commitment `Poseidon(Ax,Ay)`; our zero-padded depth-20 root is not a LeanIMT root for the
  same leaves; our arity-3 tagged nullifier can never equal their arity-2 untagged one.
- A Semaphore identity cannot enrol in our tree or vice versa without re-deriving everything.

**What a compatibility profile would require** (cheapest path first):
adopt **unmodified Semaphore v4** — circuit, ceremony artifacts, LeanIMT, EdDSA identities — and set
`scope := §6.2 descriptor digest mod p`. Because their scope is app-defined, ALL of our context
governance (§6.2 canonicalization, epoch-in-digest, version fields) survives at the protocol layer;
what we lose is the explicit in-preimage domain tag (version binding then rests solely on the
digest's version fields) and the commitment blinding. Anything short of wholesale adoption (e.g.
keeping our preimages but their tree) buys no interop at all — preimage layout is the whole game.

## 5. Recommendations for the TF

1. **Keep the explicit domain tag; document the divergence as deliberate.** §13.4's version-binding
   requirement is our named reason; record the nuance that the §6.2 digest also carries versions, so
   the tag's unique job is surviving descriptor-encoding changes. Do not silently adopt Semaphore's
   `(scope, secret)` layout — that would trade a stated conformance property for ecosystem
   compatibility we can get another way (see 2).
2. **Define a "Semaphore-compat profile" as a second, optional profile** rather than converging the
   native gadget: unmodified Semaphore v4 with `scope = descriptorDigest mod p`. This gets audited
   circuits + a real trusted-setup ceremony + existing tooling for deployments that want them, while
   the native gadget remains the reference for the full §13.4 binding list. A one-page mapping
   (descriptor→scope, enrolment→identity) is the entire spec cost.
3. **Evaluate EdDSA-based identity for v1** (PR-HLD synergy): a signing-capable enrolment secret
   gives holder-binding and off-circuit ownership proofs for the cost of `BabyPbk` + `LessThan(251)`
   in-circuit. If adopted, keep our blinding: `commitment = Poseidon(Ax, Ay, r)` (arity 3) preserves
   hiding — noting that this is again a deliberate divergence from Semaphore's unblinded commitment.
4. **Add an in-circuit `transcriptDigest` public input now** (the dummy-square idiom, ~1 constraint)
   to bind the §15.2 canonical transcript into the proof — this closes the one accidental gap this
   cross-check found (divergence 7).
5. **LeanIMT: defer.** Revisit only if an on-chain, dynamically-growing registry becomes a
   requirement; for spec-pinned enrolment sets, fixed depth-20 + zeros chain is easier to make a
   conformance object.

## 6. Honesty notes / unconfirmed

- Semaphore v4 **constraint counts were not confirmed** from a primary text source (benchmarks page
  charts are images; numbers live in the external benchmark repo). Do not cite v4 constraint numbers
  until read from that repo.
- Ceremony details verified only to: MPC phase-2, completed 13 July 2024, 400+ participants,
  artifacts via the snark-artifacts distribution mechanism. Contribution count / transcript hash not
  independently verified.
- The `hashInput` default in `@zk-kit/eddsa-poseidon` is "BLAKE by default, BLAKE2 if specified"
  (README); the exact BLAKE variant naming (BLAKE-1 512) is inferred from the EdDSA convention and
  the 32-byte slice — treat the variant name as unconfirmed, the pipeline (hash → prune → `>>3` →
  mod subOrder) as confirmed from source.
- Throughout, the claim stays PR-UNQ-narrow: both constructions provide **scoped reuse detection**;
  neither proves unique-human — that is enrolment governance in both ecosystems.

## Sources

**Ours (local):**
- `C:\Users\mitch\dtgwg-zkp-tf-mage\runtimes\circom-gadget\circuits\nullifier_membership.circom`
- [Lab — circom-gadget](lab-circom-gadget.md) (measurements, §13.4 table)
- `C:\Users\mitch\dtgwg-zkp-tf-mage\runtimes\circom-gadget\harness.mjs`
- [Lab — 01-uniqueness-nullifier](lab-01-uniqueness-nullifier.md)
- [O2 — PHC by Nullifier](o2-phc-by-nullifier.md)

**Semaphore v4 (primary):**
- Circuit source (all quoted lines): http`s://github.com/semaphore-protocol/semaphore/blob/main/packages/circuits/src/semaphore.circom`
- v4.0.0 release notes (EdDSA, LeanIMT left-child rule, signal→message / externalNullifier→scope, gas numbers, "not backward compatible"): http`s://github.com/semaphore-protocol/semaphore/releases/tag/v4.0.0`
- Identity guide ("EdDSA to generate the identity keys"; identity = private key, public key, commitment): http`s://docs.semaphore.pse.dev/guides/identities`
- Identity package ("commitment… is the Poseidon hash of the public key"): http`s://github.com/semaphore-protocol/semaphore/tree/main/packages/identity`
- Proofs guide (scope semantics, nullifier = f(scope, private key)): http`s://docs.semaphore.pse.dev/guides/proofs`
- Circuits technical reference (three parts; nullifier = hash of secret with scope; dummy square): http`s://docs.semaphore.pse.dev/technical-reference/circuits`
- Contracts reference (`SemaphoreVerifier.sol` = extended snarkjs groth16 verifier; VKs for MAX_DEPTH 1–32): http`s://docs.semaphore.pse.dev/technical-reference/contracts`
- Benchmarks page (env; depths 1–32 vs v3's 16–32; identity "slightly slower"): http`s://docs.semaphore.pse.dev/benchmarks`
- LeanIMT (dynamic depth; "directly adopts the left child's value when a node lacks a right counterpart"; no zero values): http`s://github.com/privacy-scaling-explorations/zk-kit/tree/main/packages/lean-imt`
- EdDSA-Poseidon source (secret-scalar derivation: hash → slice(0,32) → pruneBuffer → `>>3` → mod subOrder; `mulPointEscalar(Base8, s)`): http`s://github.com/privacy-scaling-explorations/zk-kit/blob/main/packages/eddsa-poseidon/src/eddsa-poseidon-factory.ts`
- Ceremony attestation (Semaphore V4 Ceremony, MPC phase 2): http`s://gist.github.com/NicoSerranoP/10b09d0539cb87445fee2d3d98cda96a` · completion (13 July 2024, 400+ participants): http`s://semaphore.pse.dev/`
- snark-artifacts distribution: http`s://github.com/privacy-ethereum/snark-artifacts`
