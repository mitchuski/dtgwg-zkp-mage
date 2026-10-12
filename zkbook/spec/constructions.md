## Construction Records

This section is informative in this Working Draft: every record below is at state `specified` or `constructed`. Evidence maturity is printed at the head of each record. Normative adoption is a separate task-force decision; reproduction or publication alone does not confer it.

This section is generated from the machine-readable records in `conformance/records/`. Changes are made to a record, never to this text; a record that fails validation does not render. Each record states its adversary, its horizon and what it does not establish, and labels conjecture as conjecture, because the validator refuses records that do not.

### Index of constructions

Identifiers are stable handles, not a type taxonomy or contiguous sequence. The kind column identifies primitives and compositions. Records 020 and 021 concern chains, 022 is a digest-reference primitive, 023 and 024 concern admission, and 025 carries an enrolment across a secret rotation; unassigned numbers are not missing records.

**Primitive constructions** — one gadget each.

| # | construction | state | priority | gadget |
|---|---|---|---|---|
| [001](#construction-001-%C2%B7-set-membership-over-an-accredited-root) | Set membership over an accredited root | `constructed` | P1 | set-membership |
| [002](#construction-002-%C2%B7-scoped-nullifier-(reuse-detection)) | Scoped nullifier (reuse detection) | `constructed` | P1 | nullifier |
| [003](#construction-003-%C2%B7-transcript-binding) | Transcript binding | `constructed` | P1 | transcript-bind |
| [004](#construction-004-%C2%B7-holder-binding-(key-from-secret)) | Holder binding (key from secret) | `specified` | P2 | key-binding |
| [005](#construction-005-%C2%B7-distinct-member-%2F-distinct-issuer) | Distinct member / distinct issuer | `constructed` | P1 | distinctness |
| [006](#construction-006-%C2%B7-non-revocation-against-a-status-root) | Non-revocation against a status root | `specified` | P1 | non-revocation |
| [007](#construction-007-%C2%B7-common-control-across-identifiers) | Common control across identifiers | `specified` | P1 | key-binding |
| [008](#construction-008-%C2%B7-blinded-binder-(taskcontext-hiding%3B-presentation-correlation-unresolved)) | Blinded binder (taskContext hiding; presentation correlation unresolved) | `specified` | P2 | commitment-open |
| [009](#construction-009-%C2%B7-hidden-value-equality-across-credentials) | Hidden-value equality across credentials | `specified` | P1 | hidden-equality |
| [022](#construction-022-%C2%B7-blinded-digest-references-%E2%80%94-the-digest-valued-members-of-the-credential-specification%2C-unenumerable-at-rest-and-openable-in-proof) | Blinded digest references — the digest-valued members of the credential specification, unenumerable at rest and openable in proof | `specified` | P2 | commitment-open |

**Composed constructions** — a named conjunction under one transcript and one disclosure set.

| # | construction | state | priority | composes |
|---|---|---|---|---|
| [010](#construction-010-%C2%B7-community-anchored-proof-(adr-001)) | Community-Anchored Proof (ADR-001) | `specified` | P1 | 001 ∧ 002 ∧ 003 ∧ 004 ∧ 005 ∧ 006 ∧ 007 |
| [011](#construction-011-%C2%B7-pairwise-edge-(vrc-possession%2C-directed-personas-shown%2C-pairwise-identifiers-hidden)) | Pairwise edge (VRC possession, directed personas shown, pairwise identifiers hidden) | `specified` | P2 | 003 ∧ 004 ∧ 006 ∧ 007 |
| [012](#construction-012-%C2%B7-intentional-correlation-%E2%80%94-one-controller-across-k-credentials) | Intentional correlation — one controller across k credentials | `specified` | P2 | 003 ∧ 006 ∧ 007 |
| [013](#construction-013-%C2%B7-mutual-edge-admissibility-%E2%80%94-each-half-admissible-under-the-other-community%E2%80%99s-policy%2C-neither-policy-nor-member-revealed) | Mutual edge admissibility — each half admissible under the other community's policy, neither policy nor member revealed | `specified` | P3 | 001 ∧ 003 ∧ 022 |
| [020](#construction-020-%C2%B7-delegation-chain-(vdc)-%E2%80%94-agent-acts-for-a-member) | Delegation chain (VDC) — agent acts for a member | `specified` | P2 | 001 ∧ 003 ∧ 004 ∧ 006 ∧ 009 |
| [021](#construction-021-%C2%B7-authority-chain-(vac)-%E2%80%94-an-agent-or-device-acts-as-itself-under-attenuated-authority) | Authority chain (VAC) — an agent or device acts as itself under attenuated authority | `specified` | P2 | 001 ∧ 003 ∧ 004 ∧ 006 ∧ 009 |
| [023](#construction-023-%C2%B7-two-vouch-admission-proof-%E2%80%94-an-applicant-proves-k-%E2%89%A5-2-vouches-from-distinct-current-members-to-the-issuing-community%2C-without-disclosing-which-members) | Two-vouch admission proof — an applicant proves k ≥ 2 vouches from distinct current members to the issuing community, without disclosing which members | `specified` | P1 | 001 ∧ 003 ∧ 004 ∧ 005 ∧ 006 ∧ 007 |
| [024](#construction-024-%C2%B7-hidden-vetting-admission-%E2%80%94-an-applicant-proves-k-attestations-from-pairwise-distinct-eligible-vetters-of-the-issuing-community%2C-without-disclosing-which-vetters) | Hidden-vetting admission — an applicant proves k attestations from pairwise-distinct eligible vetters of the issuing community, without disclosing which vetters | `constructed` | P1 | 001 ∧ 002 ∧ 003 ∧ 004 ∧ 005 |
| [025](#construction-025-%C2%B7-secret-rotation-with-enrolment-continuity-%E2%80%94-a-member-replaces-the-secret-behind-its-enrolment-with-the-one-it-pre-committed%2C-retiring-the-old-enrolment-without-disclosing-which-it-was) | Secret rotation with enrolment continuity — a member replaces the secret behind its enrolment with the one it pre-committed, retiring the old enrolment without disclosing which it was | `specified` | P2 | 001 ∧ 002 ∧ 003 ∧ 006 |

### Construction 001 · Set membership over an accredited root

*This record is at state `constructed`: a runtime exists and has measured at least one construction option; no independent party has reproduced it. Informative.*

| | |
|---|---|
| kind | primitive |
| state | `constructed` |
| priority | P1 |
| constructor | mitchuski |
| requested by | talltree/ScottJeezey |
| request | zkp-tf #18 |

**Kind:** [[ref: primitive construction]] — binds the [[ref: set-membership]] gadget and nothing else.

#### Statement

A verifier learns that the holder's credential commitment is a leaf of a published membership root, without learning which leaf.

**Need.** the membership leg every DTG proof stands on (VMC from a VTC in the verifier's anchor set) · alias: issuer-as-predicate (ScottJeezey, cred-tf #39 2026-08-25) — prove an issuer belongs to an accredited set rather than naming it, because the observer is often a venue or event and therefore the most identifying element

#### Witness

*Never leaves the holder.*

- membership credential secret / commitment preimage (the VMC leaf)
- Merkle path (depth 20 ≈ 1M leaves) and path indices

#### Public inputs

- root — the accredited/membership root the verifier recognises (registry state)
- context descriptor digest

#### Relation

1. the committed leaf is in the tree at `root` — [[ref: set-membership]] · runtime `runtimes/circom-gadget/circuits/nullifier_membership.circom`

#### Disclosure set

- root
- context

#### Does not establish

- that the community's admission decision was correct (assurance boundary)
- that the leaf is current (see record 006)
- which member the holder is
- that the leaf authenticates an issuer-signed credential or binds its holder key; the enclosing profile must establish those facts and the registry leaf semantics

#### Adversary, per claim

- **verifier · verifiers-colluding** — leaf position hidden
- **registry-operator** — leaf hidden from the registry operator only if the root is fetched without a per-holder query

#### Horizon

- root cryptoperiod (root rotation)
- VMC validity

*Quantum horizon* — read against Security Considerations item 8:

- forgery: none inside the relation: hash membership holds under Grover at 256-bit output; the root's authenticity is the registry signature's, checked outside the proof — a curve-signed root is forgeable, a post-quantum-signed root is not; the KZG accumulator option: pairing-based binding falls
- confidentiality: none — a leaf commitment and a proof hide the path and the secret information-theoretically under the hash-based options; the Groth16 lab proof is perfectly zero-knowledge

#### Conformance fixtures

Families: `accepts` · `rejects-unsat` · `rejects-verify`

Vectors: `runtimes/fixtures/vectors`

Rejection codes: `root-unknown`, `path-invalid`

#### Construction options

*Candidate constructions, each evaluated against the construction-selection criteria ([DTG-ZKP-REQ] §16.1), with its cost as measured or as conjectured.*

| construction | cost | status | source |
|---|---|---|---|
| Groth16 / BN254 / Poseidon Merkle (lab) | 11,522 constraints · ~680 ms prove · ~8 ms verify · 721 B (with record 003 bound) | **measured** | CIRCUITS.md · registry 0002–0006 |
| KZG / accumulator membership (paper §3.7 hiding KZG) | constant-size opening; pairing verify | unmeasured | ePrint 2026/333 §3.7, §8 |
| Semaphore v4 tree (structurally conformant, byte-incompatible) | see cross-check | unmeasured | explorations/SEMAPHORE-V4-CROSSCHECK.md |
| Flock-class binary-field prover over a standard-hash (BLAKE3 or SHA-256) Merkle tree — the path is a batch of compressions, Flock’s native workload; removes the Poseidon requirement on the registry side and gives a post-quantum path (LIV-ALG-07) | unmeasured — conjecture: depth-20 path ≈ 20–40 compressions ≈ well under a millisecond of prover work per the published 82,100 compressions/s single-core figure; proof size in the hundreds of kB class | unmeasured | board/stacks/flock.json (blog.succinct.xyz/introducing-flock) |

#### Issuance requirements

- issuer publishes a ZK-friendly commitment per member (Poseidon leaf) or an accumulator
- the membership tree hashes leaves and internal nodes under separate domains, or every membership path has the tree's fixed depth (the lab's depth 20) — with neither, an internal node's preimage passes as a leaf (the formal model's counter-deployment `no_domain_second_preimage`)

#### Provenance

- cred-spec VMC
- liveness reqs v0.4 §13 (PR-UNQ membership leg)
- cred-tf #39 (ScottJeezey 2026-08-25): issuer-as-predicate named as a ZKP TF work item — this record
- registry: 0002–0006 (circuit reproduced, record-level run pending)
- commit: github.com/mitchuski/dtgwg-zkp-mage

#### Record history

| date | to | by | evidence |
|---|---|---|---|
| 2026-08-28 | `requested` | mitchuski | zkp-tf #18 (talltree 08-26 / Scott 08-27): seed set for the board |
| 2026-08-28 | `specified` | mitchuski | runtimes/01-uniqueness-nullifier NOTES + decision §13 |
| 2026-08-28 | `constructed` | mitchuski | circom-gadget nullifier_membership 10/10, numbers in CIRCUITS.md |

Revisions within a state:

| date | by | note |
|---|---|---|
| 2026-09-23 | mitchuski | formal model built (Lean, gadget library): the clause as a definition, its soundness, the counter-deployments that show which hypotheses are necessary, and the negative space classified; no state change |
| 2026-09-23 | mitchuski | issuance requirement added from the formal model: leaf/node domain separation or a fixed path depth; no state change |

#### Formal verification

*A machine-checked model of this record. It proves the listed properties of the abstract relation or policy model; it is not evidence of the construction's cryptography — the hypotheses name what remains to discharge against the construction. It confers no evidence state.*

- system: Lean 4.33.1, core library only (no Mathlib); axiom footprint within propext, Classical.choice and Quot.sound — no sorry, no added axiom
- location: formal/Formal/Gadgets/P001Membership.lean in the evidence repository (uncommitted at this revision)
- reproduce: sh formal/scripts/check-axioms.sh — builds, prints each theorem's axiom footprint, fails on sorry or a non-standard axiom
- statement: Formal.Gadgets.pathRoot over Formal.Gadgets.MTree — the membership clause as a Merkle path recomputation from the leaf hash to the root
- scope: the membership clause over abstract hashes; not the hash function's collision resistance, and not which registry state the root is (that the verifier recognises the root is registry policy)

| theorem | proves |
|---|---|
| `path_sound` | a path that hashes the leaf to the root proves the leaf is in the tree |
| `path_complete` | every leaf of the tree has such a path |
| `path_sound_fixed_depth` | for a tree of uniform depth d and a path of exactly d steps, soundness holds without leaf/node domain separation — the lab circuit's shape (depth 20) |
| `no_domain_second_preimage` | with variable-length paths and no domain separation, an internal node passes as a leaf (the second-preimage shape): the defence is required, not optional |

| hypothesis | carries |
|---|---|
| H-leaf, H-node | the leaf and node hashes are collision-free (modelled as injective) |
| H-domain or fixed depth | no leaf hash equals a node hash, or every path has the tree's fixed depth — one of the two must hold of the circuit (to discharge at the circuit gate) |


### Construction 002 · Scoped nullifier (reuse detection)

*This record is at state `constructed`: a runtime exists and has measured at least one construction option; no independent party has reproduced it. Informative.*

| | |
|---|---|
| kind | primitive |
| state | `constructed` |
| priority | P1 |
| constructor | mitchuski |
| requested by | ScottJeezey |
| request | zkp-tf #18 |

**Kind:** [[ref: primitive construction]] — binds the [[ref: nullifier]] gadget and nothing else.

#### Statement

A verifier learns a deterministic nullifier for this context so a second presentation in the same context is detectable, while presentations in other contexts stay unlinkable.

**Need.** PR-UNQ: one presentation per (context, scope, purpose, epoch) — not 'one unique human'

#### Witness

*Never leaves the holder.*

- holder secret (the same one behind the membership leaf)

#### Public inputs

- context descriptor (scope, purpose, epoch)
- root / enrolment population id
- nullifier — the output

#### Relation

1. nullifier = H(secret, root, scope, purpose, epoch) computed in-circuit from the same secret as the membership leaf — [[ref: nullifier]] · runtime `runtimes/circom-gadget/circuits/nullifier_membership.circom`

#### Disclosure set

- nullifier
- context

#### Does not establish

- one natural person globally
- one enrolment per issuer or ecosystem (second point of the trade curve — governance, not cryptography)
- cross-context uniqueness

#### Adversary, per claim

- **verifiers-colluding** — unlinkable across contexts
- **verifier** — linkable within a context by design (declared, governed)

#### Horizon

- epoch rollover
- enrolment-root cryptoperiod

*Quantum horizon* — read against Security Considerations item 8:

- forgery: none inside the relation: a Poseidon or standard-hash PRF keeps pseudorandomness; the paper's PRF_K route likewise
- confidentiality: none from the nullifier itself; a holder secret of fewer than 256 bits of entropy loses half its bits to Grover

#### Conformance fixtures

Families: `accepts` · `rejects-unsat` · `unlinkable`

Vectors: `runtimes/fixtures/vectors`

Rejection codes: `nullifier-reused`, `context-descriptor-mismatch`

#### Construction options

*Candidate constructions, each evaluated against the construction-selection criteria ([DTG-ZKP-REQ] §16.1), with its cost as measured or as conjectured.*

| construction | cost | status | source |
|---|---|---|---|
| Poseidon nullifier in the membership circuit (lab) | included in record 001's 11,523 | **measured** | CIRCUITS.md |
| PRF-derived context key k_{U,ctx} = PRF_K(I‖ctx) (paper §7.2) | one PRF evaluation in the commit-and-prove SNARK | unmeasured | ePrint 2026/333 §7.2.2 |

#### Issuance requirements

- none beyond the credential as specified

#### Provenance

- liveness reqs v0.4 PR-UNQ
- decision §13 scoped reuse detection
- ePrint 2026/333 §5.3 (impossibility → contexts)
- registry: 0002–0006
- commit: github.com/mitchuski/dtgwg-zkp-mage

#### Record history

| date | to | by | evidence |
|---|---|---|---|
| 2026-08-28 | `requested` | mitchuski | zkp-tf #18 (talltree 08-26 / Scott 08-27): seed set for the board |
| 2026-08-28 | `specified` | mitchuski | decision §13 + O2 PHC-by-nullifier |
| 2026-08-28 | `constructed` | mitchuski | same circuit as 001; scoped preimage tested 9/9 in runtime 01 |

Revisions within a state:

| date | by | note |
|---|---|---|
| 2026-09-23 | mitchuski | formal model built (Lean, gadget library): the clause as a definition, its soundness, the counter-deployments that show which hypotheses are necessary, and the negative space classified; no state change |

#### Formal verification

*A machine-checked model of this record. It proves the listed properties of the abstract relation or policy model; it is not evidence of the construction's cryptography — the hypotheses name what remains to discharge against the construction. It confers no evidence state.*

- system: Lean 4.33.1, core library only (no Mathlib); axiom footprint within propext, Classical.choice and Quot.sound — no sorry, no added axiom
- location: formal/Formal/Gadgets/P002Nullifier.lean in the evidence repository (uncommitted at this revision)
- reproduce: sh formal/scripts/check-axioms.sh — builds, prints each theorem's axiom footprint, fails on sorry or a non-standard axiom
- statement: Formal.Gadgets.NullifierRel — some secret behind this leaf gives this nullifier in this context
- scope: reuse detection over abstract hashes; unlinkability across contexts is a computational claim outside this model; does-not-establish 2 is governance

| theorem | proves |
|---|---|
| `one_leaf_one_nullifier` | one leaf has one nullifier per context |
| `reuse_refused` | nullifier-reused: once a leaf's nullifier is spent in a context, a second presentation of that leaf there is refused |
| `unbound_nullifier_unsound` | the same-secret clause is necessary: a nullifier taken from any secret lets one leaf yield two nullifiers in one context |
| `cross_context_not_detected` | does-not-establish 3: one secret gives different nullifiers in different contexts — no cross-context detection |
| `one_person_two_nullifiers` | does-not-establish 1: one person enrolled twice gives two accepted nullifiers in one context |

| hypothesis | carries |
|---|---|
| H-leaf | the leaf commitment binds its secret (modelled as injective) — carries the same-secret clause |
| spent set | the verifier keeps the context's spent nullifiers (Formal.Gadgets.Spent) |


### Construction 003 · Transcript binding

*This record is at state `constructed`: a runtime exists and has measured at least one construction option; no independent party has reproduced it. Informative.*

| | |
|---|---|
| kind | primitive |
| state | `constructed` |
| priority | P1 |
| constructor | mitchuski |
| requested by | ScottJeezey |
| request | zkp-tf #18 |

**Kind:** [[ref: primitive construction]] — binds the [[ref: transcript-bind]] gadget and nothing else.

#### Statement

A verifier checks that the proof binds the supplied transcript scalar. Interpreting that scalar as this authenticated request also requires the profile’s canonical encoding, digest conversion, audience and freshness checks.

**Need.** PR-FRE: a proof bound to this challenge and this presentation, unreplayable elsewhere

#### Witness

*Never leaves the holder.*

- nothing extra — the transcript digest is bound as a public input inside the proof

#### Public inputs

- transcriptDigest — profile-defined circuit scalar; the lab hashes domain-separated, length-prefixed canonical transcript bytes and reduces the digest modulo the BN254 scalar prime

#### Relation

1. the proof's public signals include transcriptDigest and the circuit constrains it (cannot be swapped post hoc) — [[ref: transcript-bind]] · runtime `runtimes/canonical + runtimes/circom-gadget (public signal 4)`

#### Disclosure set

- transcriptDigest

#### Does not establish

- freshness beyond what the challenge carries
- that the verifier's challenge was itself honest
- correct JCS/SHA-256 evaluation inside the circuit merely because a supplied scalar is constrained
- simulation extractability or equivalence to tag-based SE-NIZK
- rejection of reuse of the same transcript without a verifier replay policy
- strict transcript field types or expiry semantics from the lab field-presence validator; those require the selected payload schema and verifier policy
- that a bound predicate identifier is meaningful or accepted: the digest distinguishes strings (equal strings bind equally; NFC and decomposed spellings, and `v1` and `v2` identifiers, bind differently) but the reference encoder accepts an unknown predicate string structurally — which identifiers a verifier accepts, and under which comparison rule and definition revision, is the profile's decision before binding (cred-spec #52; probe of 2026-09-14)

#### Adversary, per claim

- **verifier · verifiers-colluding** — changing the constrained transcript scalar invalidates the proof; audience/time replay protection additionally assumes the verifier checks the authenticated request and its validity window

#### Horizon

- the transcript's own validity window

*Quantum horizon* — read against Security Considerations item 8:

- forgery: none: the digest is collision-resistant under Grover; binding a Groth16 public signal falls with Groth16 soundness, a hash-based prover's binding does not
- confidentiality: none — the transcript is public by design

#### Conformance fixtures

Families: `accepts` · `rejects-verify`

Vectors: `runtimes/fixtures/vectors`

Rejection codes: `transcript-digest-mismatch`, `bare-nonce-insufficient`

#### Construction options

*Candidate constructions, each evaluated against the construction-selection criteria ([DTG-ZKP-REQ] §16.1), with its cost as measured or as conjectured.*

| construction | cost | status | source |
|---|---|---|---|
| public-signal binding in Groth16 (lab) | +1 constraint (11,522 → 11,523) | **measured** | CIRCUITS.md |
| tag-based SE-NIZK: tag = transcript (paper Def. 5) | unmeasured; proof-system security requirement, not established by the lab public-input binding | unmeasured | ePrint 2026/333 §3.5 |
| Flock-class prover binding a SHA-256 digestMultibase transcript digest natively (no Poseidon detour for the canonical transcript) | unmeasured — one SHA-256 compression per 64-byte block of the canonical transcript | unmeasured | board/stacks/flock.json |

#### Issuance requirements

- none beyond the credential as specified

#### Provenance

- liveness reqs v0.4 PR-FRE
- decision §15 canonical transcript
- cred-spec #17 item 1 (JCS)
- 2026-09-14 predicate-binding probe over runtimes/canonical/canonical.mjs (sha256 d50fd9a3…): four assertions — equal/NFC-vs-NFD/v1-vs-v2/unknown-accepted; encoding evidence, not registry-aware verification (peer-lane research cycle 2026-09-14-vocabulary-binding)
- cred-spec #52 and #48 CLOSED 2026-09-28 (cred-spec PR #64, merged): a predicate is identified by `https://registry.trustoverip.org/dtg/vsc/<name>/<n>` — an integer revision per predicate — and the registry is `trustoverip/dtgwg-vsc-registry`; its first community profiles `vetted/1` and `presented/1` were admitted as drafts on 2026-09-30 (registry PR #19; cred-spec PR #70). The identifier a transcript binds now has a concrete form and a revision inside the string; which identifiers a verifier accepts is still the profile's
- registry: 0002–0006
- commit: github.com/mitchuski/dtgwg-zkp-mage

#### Record history

| date | to | by | evidence |
|---|---|---|---|
| 2026-08-28 | `requested` | mitchuski | zkp-tf #18 (talltree 08-26 / Scott 08-27): seed set for the board |
| 2026-08-28 | `specified` | mitchuski | X2 context legibility + canonical runtime 11/11 |
| 2026-08-28 | `constructed` | mitchuski | +1 constraint measured, CIRCUITS.md |

Revisions within a state:

| date | by | note |
|---|---|---|
| 2026-09-14 | mitchuski | cred-spec #52 (predicate registry): negative-space line — binding an identifier does not make it accepted or meaningful; probe cited in provenance. State unchanged (constructed). |
| 2026-09-23 | mitchuski | formal model built (Lean, gadget library): the clause as a definition, its soundness, the counter-deployments that show which hypotheses are necessary, and the negative space classified; no state change |
| 2026-09-30 | mitchuski | cred-spec #52/#48 closed (28 Sept): the predicate identifier has a registry form with the revision in the IRI, and a registry to resolve it against. Provenance line only; the negative-space line of 14 Sept stands as written (binding an identifier does not make it accepted). State unchanged (constructed). |

#### Formal verification

*A machine-checked model of this record. It proves the listed properties of the abstract relation or policy model; it is not evidence of the construction's cryptography — the hypotheses name what remains to discharge against the construction. It confers no evidence state.*

- system: Lean 4.33.1, core library only (no Mathlib); axiom footprint within propext, Classical.choice and Quot.sound — no sorry, no added axiom
- location: formal/Formal/Gadgets/P003Transcript.lean in the evidence repository (uncommitted at this revision)
- reproduce: sh formal/scripts/check-axioms.sh — builds, prints each theorem's axiom footprint, fails on sorry or a non-standard axiom
- statement: the proof's public transcript scalar; H-bind states that a verifying proof was made for the scalar it verifies against
- scope: binding of the scalar only; canonical encoding, audience, freshness and replay policy are the profile's (does-not-establish 1, 2, 5, 6, 7 out of scope by construction; the replay remedy is a verifier spent set)

| theorem | proves |
|---|---|
| `swap_fails` | a proof moved to another transcript scalar fails |
| `digest_reduction_collides` | the 256-bit digest reduced mod the BN254 scalar prime is not injective (0 and r collide): the proof binds the scalar, and the scalar stands for one request only through the digest's collision resistance — does-not-establish 3 made exact |

| hypothesis | carries |
|---|---|
| H-bind | soundness of the proof system with the transcript scalar as a public input |


### Construction 004 · Holder binding (key from secret)

*This record is at state `specified`: it is written and validates; no runtime has measured it. Costs marked conjecture are conjecture (drafting rule 4). Informative.*

| | |
|---|---|
| kind | primitive |
| state | `specified` |
| priority | P2 |
| constructor | mitchuski |
| requested by | ScottJeezey |
| request | zkp-tf #18 |

**Kind:** [[ref: primitive construction]] — binds the [[ref: key-binding]] gadget and nothing else.

#### Statement

A verifier learns that the presenting key is derived from the same secret the credentials were issued to, without learning the secret or any long-term key.

**Need.** PR-HLD / ADR-001 S4: the presenter is the subject, not a party holding a copy

#### Witness

*Never leaves the holder.*

- holder PRF key / secret
- derivation randomness

#### Public inputs

- presentation key or its commitment
- transcriptDigest

#### Relation

1. pk_presentation = PRF(secret, context) and the credential commitment opens to the same secret — [[ref: key-binding]]

#### Disclosure set

- presentation key (context-scoped)

#### Does not establish

- non-transfer of the secret
- absence of coercion or account sharing
- agent authority or consent
- compatibility with non-exportable keys or arbitrary credential key formats; the selected profile must bind the actual authenticated holder key to the available witness

#### Adversary, per claim

- **verifier · issuer-verifier-colluding** — long-term key hidden

#### Horizon

- key cryptoperiod
- credential validity

*Quantum horizon* — read against Security Considerations item 8:

- forgery: the EdDSA / Baby-Jubjub in-circuit option: a discrete-log key, falls; the PRF-image form of the relation does not; the paper's Schnorr proof of PRF-key ownership falls as a Schnorr proof over a group; the statement survives under a hash-based proof
- confidentiality: none — the presentation key is a PRF image and the secret is hidden information-theoretically

#### Conformance fixtures

Families: `accepts` · `rejects-unsat`

Rejection codes: `key-not-derived-from-secret`

#### Construction options

*Candidate constructions, each evaluated against the construction-selection criteria ([DTG-ZKP-REQ] §16.1), with its cost as measured or as conjectured.*

| construction | cost | status | source |
|---|---|---|---|
| EdDSA/Baby-Jubjub identity in-circuit (lab plan) | unmeasured | unmeasured | PATH-MAP P4 open item |
| L_PRF Schnorr proof of PRF-key ownership (paper §9.1) | one Schnorr proof | unmeasured | ePrint 2026/333 §7.2.2, §9.1 |

#### Issuance requirements

- issuer binds the credential to a commitment to the holder secret (pk_U ‖ com_att signed — paper §2.4)

#### Provenance

- liveness reqs v0.4 PR-HLD
- ADR-001 S4
- commit: github.com/mitchuski/dtgwg-zkp-mage (runtimes/04 = stub)

#### Record history

| date | to | by | evidence |
|---|---|---|---|
| 2026-08-28 | `requested` | mitchuski | zkp-tf #18 (talltree 08-26 / Scott 08-27): seed set for the board |
| 2026-08-28 | `specified` | mitchuski | runtimes/04-holder-binding STUB.md + paper §7.2 languages |

Revisions within a state:

| date | by | note |
|---|---|---|
| 2026-09-23 | mitchuski | formal model built (Lean, gadget library): the clause as a definition, its soundness, the counter-deployments that show which hypotheses are necessary, and the negative space classified; no state change |

#### Formal verification

*A machine-checked model of this record. It proves the listed properties of the abstract relation or policy model; it is not evidence of the construction's cryptography — the hypotheses name what remains to discharge against the construction. It confers no evidence state.*

- system: Lean 4.33.1, core library only (no Mathlib); axiom footprint within propext, Classical.choice and Quot.sound — no sorry, no added axiom
- location: formal/Formal/Gadgets/P004HolderBinding.lean in the evidence repository (uncommitted at this revision)
- reproduce: sh formal/scripts/check-axioms.sh — builds, prints each theorem's axiom footprint, fails on sorry or a non-standard axiom
- statement: Formal.Gadgets.HolderRel — pk = PRF(s, context) for an s the credential commitment opens to
- scope: derivation from the credential secret; non-transfer, coercion and sharing (does-not-establish 1, 2) are out of scope by construction — the relation reads a secret and names no party

| theorem | proves |
|---|---|
| `key_from_credential_secret` | every opening of the credential's commitment gives the same presentation key: the key is derived from the secret the credential was issued to |
| `unbound_key_unsound` | the commitment clause is necessary: without it a key from any secret passes |

| hypothesis | carries |
|---|---|
| H-com | the credential commitment is binding (modelled as injective in (secret, randomness)) |


### Construction 005 · Distinct member / distinct issuer

*This record is at state `constructed`: a runtime exists and has measured at least one construction option; no independent party has reproduced it. Informative.*

| | |
|---|---|
| kind | primitive |
| state | `constructed` |
| priority | P1 |
| constructor | mitchuski |
| requested by | mitchuski |
| request | zkp-tf #18 |

**Kind:** [[ref: primitive construction]] — binds the [[ref: distinctness]] gadget and nothing else.

#### Statement

A verifier learns that two credentials in one proof come from two distinct members (or issuers), with the duplicate case unsatisfiable rather than merely rejected.

**Need.** ADR-001 needs an S6: the voucher is not the holder; multi-issuer needs k distinct accredited issuers

#### Witness

*Never leaves the holder.*

- two credential leaves/secrets and their paths

#### Public inputs

- root(s)
- the two nullifiers or issuer ids as constrained public signals

#### Relation

1. leaf_a ≠ leaf_b (or issuer_a ≠ issuer_b) enforced as a non-zero inverse constraint — no witness exists for equality — [[ref: distinctness]] · runtime `runtimes/circom-gadget/circuits/dual_issuer.circom`

#### Disclosure set

- that the two are distinct — nothing about which two

#### Does not establish

- that the two parties are independent in the accreditation sense (declared, not proven — X8)
- that either is honest
- distinct natural persons or independent key controllers merely from distinct leaves, keys or issuer identifiers

#### Adversary, per claim

- **verifier · verifiers-colluding** — identities of both hidden

#### Horizon

- root cryptoperiod

*Quantum horizon* — read against Security Considerations item 8:

- forgery: none inside the relation: distinctness over hash leaves or tags holds
- confidentiality: none

#### Conformance fixtures

Families: `accepts` · `rejects-unsat`

Vectors: `runtimes/fixtures/vectors`

Rejection codes: `duplicate-issuer-unsatisfiable`, `duplicate-seat-unsatisfiable`

#### Construction options

*Candidate constructions, each evaluated against the construction-selection criteria ([DTG-ZKP-REQ] §16.1), with its cost as measured or as conjectured.*

| construction | cost | status | source |
|---|---|---|---|
| dual_issuer k=2 (lab) | 10,717 constraints (--O2) · ~740 ms · ~8 ms · 725 B | **measured** | CIRCUITS.md |
| guardian_threshold t=3 (lab) | 16,078 constraints · ~830 ms · ~10 ms | **measured** | CIRCUITS.md |
| f_distinct over context pseudonyms (paper §5.3) | predicate inside the commit-and-prove SNARK | unmeasured | ePrint 2026/333 §5.3 |

#### Issuance requirements

- none beyond the credential as specified

#### Provenance

- X8 multi-issuer aggregation
- ePrint 2026/333 §5.3 f_distinct
- registry: 0002–0006
- commit: github.com/mitchuski/dtgwg-zkp-mage

#### Record history

| date | to | by | evidence |
|---|---|---|---|
| 2026-08-28 | `requested` | mitchuski | zkp-tf #18 (talltree 08-26 / Scott 08-27): seed set for the board |
| 2026-08-28 | `specified` | mitchuski | X8 + dual_issuer design |
| 2026-08-28 | `constructed` | mitchuski | dual_issuer 7/7, guardian 8/8; duplicate = no witness |

Revisions within a state:

| date | by | note |
|---|---|---|
| 2026-09-23 | mitchuski | formal model built (Lean, gadget library): the clause as a definition, its soundness, the counter-deployments that show which hypotheses are necessary, and the negative space classified; no state change |

#### Formal verification

*A machine-checked model of this record. It proves the listed properties of the abstract relation or policy model; it is not evidence of the construction's cryptography — the hypotheses name what remains to discharge against the construction. It confers no evidence state.*

- system: Lean 4.33.1, core library only (no Mathlib); axiom footprint within propext, Classical.choice and Quot.sound — no sorry, no added axiom
- location: formal/Formal/Gadgets/P005Distinct.lean in the evidence repository (uncommitted at this revision)
- reproduce: sh formal/scripts/check-axioms.sh — builds, prints each theorem's axiom footprint, fails on sorry or a non-standard axiom
- statement: the inverse constraint (a − b) · inv = 1 over the circuit field Fin n; and Formal.Gadgets.owners_distinct, the k-ary form composed records use
- scope: unsatisfiability of the duplicate case, proved without cryptographic assumption; independence and honesty (does-not-establish 1, 2) are declarations outside any clause

| theorem | proves |
|---|---|
| `inverse_unsat_on_equal` | the duplicate case has no witness: (a − b) · inv ≠ 1 when a = b |
| `FinOps` | the three field facts the gadget needs hold for Fin n, n > 1 — so for the BN254 scalar field outright |
| `owners_distinct` | pairwise-distinct values, each owned under a one-value-per-owner rule, come from as many pairwise-distinct owners (record 024's soundness is an instance) |
| `distinct_leaves_not_distinct_persons` | does-not-establish 3: distinct leaves held by one person |

| hypothesis | carries |
|---|---|
| one value per owner | the issuer's enrolment gives each member one leaf — carries owners_distinct |
| inverse exists when a ≠ b | completeness of the constraint needs n prime; not proved here (circuit gate) |


### Construction 006 · Non-revocation against a status root

*This record is at state `specified`: it is written and validates; no runtime has measured it. Costs marked conjecture are conjecture (drafting rule 4). Informative.*

| | |
|---|---|
| kind | primitive |
| state | `specified` |
| priority | P1 |
| constructor | mitchuski |
| requested by | stormer78 (ADR-001 C1–C4) |
| request | zkp-tf #18 |

**Kind:** [[ref: primitive construction]] — binds the [[ref: non-revocation]] gadget and nothing else.

#### Statement

A verifier learns that the credential's nullifier is not in the revocation set at the stated registry state, without the registry learning who asked.

**Need.** a proof must not verify if any credential it relies on is revoked, and checking must not identify the holder

#### Witness

*Never leaves the holder.*

- the credential's revocation handle (scoped, never the static PHC attribute)
- non-membership witness against rl_root

#### Public inputs

- rl_root — revocation/status root at a stated epoch
- epoch

#### Relation

1. non-membership of the handle in the set committed by rl_root (sorted-leaf neighbours or accumulator non-witness) — [[ref: non-revocation]]

#### Disclosure set

- rl_root
- epoch

#### Does not establish

- that revocation is instantaneous — only that the handle was not revoked as of `epoch` (C4's published bound)
- that the registry's revocation decision was correct
- that the verifier performed no live lookup — the construction makes the presentation self-carrying (public root + ZK proof; witness remains private); whether a deployment still phones home is a profile statement, not a proof property

#### Adversary, per claim

- **registry-operator · issuer-verifier-colluding** — the status check does not identify the holder — requires bulk/anonymous root fetch, never a per-holder query

#### Horizon

- status freshness (C4 bound)
- epoch rollover

*Quantum horizon* — read against Security Considerations item 8:

- forgery: none inside the relation; the status root's authenticity is the registry signature's, outside the proof — the set-root primitive's signed root must carry a post-quantum suite; the RL-membership-inside-f route inherits the enclosing proof system's soundness
- confidentiality: none

#### Conformance fixtures

Families: `accepts` · `rejects-unsat` · `current`

Rejection codes: `rl-root-stale`, `handle-revoked`

#### Construction options

*Candidate constructions, each evaluated against the construction-selection criteria ([DTG-ZKP-REQ] §16.1), with its cost as measured or as conjectured.*

| construction | cost | status | source |
|---|---|---|---|
| sorted-leaf non-membership Merkle (indexed tree) | ≈ 2× record 001 | unmeasured | explorations/O4-registry-zk-revocation.md |
| RL membership check inside f with nullifier as PHC attribute (paper §5.4) — carries the paper's own linkability caveat | depends on RL representation | unmeasured | ePrint 2026/333 §5.4 |
| set-root primitive (cred-tf #40 unification): a signed, published set root + a membership or non-membership proof carried in the presentation — accumulator non-membership witness as a private proof input; the same public-input object serves anchoring (record 001), revocation status (this record) and registry membership | unmeasured — ScottJeezey: "ours to pressure-test", priority | unmeasured | cred-tf #40 (stormer78 08-22; ScottJeezey 08-24) · cred-tf #39 (ScottJeezey 08-25) |
| Flock-class prover over an indexed (sorted-leaf) non-membership tree built with the registry’s existing standard hash — the set-root primitive without a hash migration | unmeasured — conjecture ≈ 2× the standard-hash membership path | unmeasured | board/stacks/flock.json · cred-tf #40 (set-root primitive) |

#### Issuance requirements

- registry publishes rl_root per epoch, fetchable without identifying the fetcher (X4)
- the registry commits rl_root over strictly sorted handles — adjacent neighbours prove a handle absent only over a sorted list; over an unsorted one they can bracket a handle that is present (the formal model's counter-deployment `unsorted_neighbours_unsound`)

#### Provenance

- ADR-001 C1–C4, T2
- explorations/O4
- explorations/X4
- explorations/X6
- cred-tf #40 / #39: set-root-plus-proof as one primitive; "no live lookups" as the privacy-profile default (profile default, not absolute — Sankarshan)

#### Record history

| date | to | by | evidence |
|---|---|---|---|
| 2026-08-28 | `requested` | mitchuski | zkp-tf #18 (talltree 08-26 / Scott 08-27): seed set for the board |
| 2026-08-28 | `specified` | mitchuski | O4 + X6 explorations; ADR-001 C-clauses |

Revisions within a state:

| date | by | note |
|---|---|---|
| 2026-09-23 | mitchuski | formal model built (Lean, gadget library): the clause as a definition, its soundness, the counter-deployments that show which hypotheses are necessary, and the negative space classified; no state change |
| 2026-09-23 | mitchuski | issuance requirement added from the formal model: rl_root over strictly sorted handles; no state change |

#### Formal verification

*A machine-checked model of this record. It proves the listed properties of the abstract relation or policy model; it is not evidence of the construction's cryptography — the hypotheses name what remains to discharge against the construction. It confers no evidence state.*

- system: Lean 4.33.1, core library only (no Mathlib); axiom footprint within propext, Classical.choice and Quot.sound — no sorry, no added axiom
- location: formal/Formal/Gadgets/P006NonRevocation.lean in the evidence repository (uncommitted at this revision)
- reproduce: sh formal/scripts/check-axioms.sh — builds, prints each theorem's axiom footprint, fails on sorry or a non-standard axiom
- statement: Formal.Gadgets.Sorted and adjacent neighbours lo < h < hi in the committed revocation list
- scope: non-membership against the committed list; the registry's decision and live-lookup behaviour (does-not-establish 2, 3) are out of scope

| theorem | proves |
|---|---|
| `neighbours_sound` | two adjacent entries of a strictly sorted list bracketing h prove h is not in the list |
| `unsorted_neighbours_unsound` | sortedness is necessary: on an unsorted list adjacent neighbours bracket a present handle |
| `stale_root_passes` | does-not-establish 1: a handle revoked after the epoch still passes against the epoch's list |

| hypothesis | carries |
|---|---|
| H-sorted | the registry commits rl_root over strictly sorted leaves — a registry obligation, not a proof property |
| neighbour membership | the two neighbours are leaves under rl_root: record 001's clause, applied twice |


### Construction 007 · Common control across identifiers

*This record is at state `specified`: it is written and validates; no runtime has measured it. Costs marked conjecture are conjecture (drafting rule 4). Informative.*

| | |
|---|---|
| kind | primitive |
| state | `specified` |
| priority | P1 |
| constructor | mitchuski |
| requested by | sankarshanmukhopadhyay / geoffturk / stormer78 (spec side) — specified by the ZKP TF co-chair |
| request | cred-spec #9 (Sankarshan: identity linkages the ZKP constructions require; talltree 09-08 translation; geoffturk 09-10: subject-or-issuer, non-correlation carried in the requirement, chain predicates named separately) · cred-spec #31 (geoffturk 09-02: '#9 stays open — and gains weight') · cred-spec §Community-Anchored Zero-Knowledge Proof ('the proof must establish common control across them') · cred-spec §Zero-Knowledge and Selective Disclosure editor's note (merged 2026-09-10): of the four predicates listed as resting on the #9 primitive, two rest on this record — the community-anchored proof and the VMC+VAC shared-subject rule where the two identifiers differ; the two chain predicates are hidden-value equality (record 009) inside records 020 and 021 |

**Kind:** [[ref: primitive construction]] — binds the [[ref: key-binding]] gadget and nothing else.

#### Statement

A verifier checks that two identifiers appearing in DTG credentials — as subject or as issuer, whatever correlation scope each declares — are under one controller, through the selected shared-secret derivation relation, while the secret remains private under the construction assumptions. The proof introduces no value that correlates across presentations; any cross-presentation correlation depends on the enclosing disclosure set and context policy.

**Need.** under WD02's three correlation scopes, two `pairwise` identifiers of one controller differ by construction, so any proof that reads one party out of two credentials must first prove one holder controls both identifiers — whether the identifiers appear as credential subject or as credential issuer (the VRC-issuer case is statement 3 of record 010) — without a field that says so

#### Witness

*Never leaves the holder.*

- the holder secret s
- per-identifier derivation material: for each identifier, the salt or key-derivation path under which it was minted from s
- the two credentials that name the identifiers (their bytes stay with the holder; only what the enclosing record discloses is shown)

#### Public inputs

- the two identifiers exactly as the credentials carry them — or their ZK-openable commitments, when the identifiers themselves are hidden by the enclosing record
- transcriptDigest — the presentation transcript this proof is bound to

#### Relation

1. identifier A's public key or commitment opens to (s, salt_A) and identifier B's opens to (s, salt_B) for one and the same s — a different secret behind either identifier is unsatisfiable — [[ref: key-binding]]

#### Disclosure set

- the outcome (one controller / not shown)
- transcriptDigest
- the identifiers only as far as the enclosing record already discloses them — this record adds no identifier to the disclosure set

#### Does not establish

- that the controller is one natural person — two agents or two people sharing a secret satisfy the clause (that is record 002's uniqueness, under its own declaration)
- that either credential is currently valid or unrevoked (record 006)
- that the holder intended the two identifiers to be correlated beyond this verifier — the proof is a disclosure to the party it is made to, not a widening of either identifier's declared scope
- the counterparty's common control: a presenter can prove only what is derived from a secret in the presenter's hands; a counterparty's linkage needs the counterparty's witness or the counterparty's own attestation (see record 010)
- that arbitrary independently generated or hardware-protected keys derive from a shared available scalar; derivation and custody are profile requirements
- a chain predicate: that a child credential's `issuer` equals its parent's `credentialSubject.id` across credentials signed by different parties involves no holder secret and is hidden-value equality (record 009 inside records 020 and 021), not common control — the two must not be read as one primitive (cred-spec #9, geoffturk 2026-09-10)

#### Adversary, per claim

- **verifier · verifiers-colluding** — no cross-presentation handle: the proof is transcript-bound and emits no identifier-derived value; two verifiers comparing proofs learn only what the enclosing records disclosed to each
- **issuer-verifier-colluding** — the secret s is never revealed and no per-identifier salt is; an issuer who minted one identifier's credential learns nothing about the other from the proof

#### Horizon

- under a derived-key profile, the shorter of the two identifiers' key-validity periods — after a rotation the old key no longer opens to s under the recorded path and the clause must be re-proven against the rotated material; under the commitment-verification-method profile, a signing-key rotation leaves the commitment, and this clause, untouched — only a change of the secret behind the commitment restarts it (Integration §Rotation under the identifier commitment profile; record 025)
- the hash/commitment cryptoperiod of the derivation

*Quantum horizon* — read against Security Considerations item 8:

- forgery: none inside the relation: two hash openings sharing a secret hold; a Pedersen or KZG commitment in place of the hash opening falls (binding), as does a BabyJubJub or BLS12-381 SNARK-native key as the identifier's own key — the hash-commitment form of the identifier commitment profile is the post-quantum form
- confidentiality: none — hiding is information-theoretic in every option

#### Conformance fixtures

Families: `accepts` · `rejects-unsat` · `rejects-verify` · `unlinkable`

Rejection codes: `co-control-unproven (unsat: distinct secrets)`, `identifier-not-zk-openable (verify-fail: identifier carries no openable commitment — an issuance failure, X3)`

#### Construction options

*Candidate constructions, each evaluated against the construction-selection criteria ([DTG-ZKP-REQ] §16.1), with its cost as measured or as conjectured.*

| construction | cost | status | source |
|---|---|---|---|
| no proof — the holder declares one `directed` identifier and uses it in both credentials (WD02 §Choosing a scope: correlation evident on the face of the credentials) | zero constraints; the cost is the declaration itself | unmeasured | cred-spec §Choosing a scope / §Community-Anchored Zero-Knowledge Proof |
| Groth16/Poseidon: two Poseidon commitment openings sharing the secret input (the circom-gadget leaf commitment, twice) — conjecture ~500–600 constraints total (~65%), unmeasured; one compile settles it | unmeasured (conjecture ≈ 2 × the lab's Poseidon leaf commitment) | unmeasured | runtimes/circom-gadget (Poseidon commitment + nullifier already bind a leaf to a secret) |
| blackbox commit-and-prove: the same opening under the paper's hiding commitments (Construction II show, N=1) | paper Table 1 class | unmeasured | ePrint 2026/333 §7.2 |

#### Issuance requirements

- each identifier that may need to be proven co-controlled must be, or carry, a ZK-openable commitment to the holder secret: a SNARK-native key (e.g. a BabyJubJub or BLS12-381 Multikey) or a published Poseidon/KZG commitment beside an Ed25519 key — the X3 requirement of record 010 applied to identifiers rather than signatures (cred-spec #17)
- the credential layer carries the requirement to be able to prove co-control, never a field that states the link (cred-spec #9, the 08-25 position)
- the credential layer's candidate requirement (cred-spec #9, 2026-09-10): a party controlling more than one DID appearing in DTG credentials, as subject or issuer, regardless of each identifier's declared scope, MUST be able to prove in zero knowledge that those DIDs are under its control, without disclosing them and without the proof introducing a value that correlates across presentations — this record is the construction that requirement points at; the requirement text is the credential specification's to write
- a VRC MAY carry its issuer's linkage proof to its VMC-side identifier (the one-line MAY proposed on #9, 2026-08-25 and taken up 2026-09-10) — the credential layer's member, produced by the counterparty at issuance by running this record; record 010 consumes it
- where the commitment lives — the task force's preference, stated for the credential specification to give it a home: as a verification method in the identifier's DID document (a `Multikey` entry carrying the commitment or the SNARK-native key), not as a member of any credential. The commitment is a property of the identifier — one per identifier, shared by every credential that names it, resolved the way a verifier already resolves the signing key — so it changes no credential schema and leaves the credential layer one requirement (which DID methods can carry it) instead of a member on every type. A credential member is the fallback only for a profile whose DID method cannot carry a second verification method
- the WD02 example set read against this line (the credential maintainer's answer to question 2 of zkp-tf #23): `did:key` over Ed25519 carries exactly one key and cannot carry a second verification method, so an Ed25519 `did:key` identifier has no place for the commitment and cannot satisfy this record as it stands; `did:peer` (numalgo 2 and 4) and `did:webvh` can carry one. The first implementation should mint the narrow-scope identifiers that may be co-proven as `did:peer` with the commitment as a second verification method, or as `did:key` over a SNARK-native key type — and that is the first thing for it to find out (WG-14)
- whether the requirement can be a MUST: yes, conditioned on the identifier's key profile rather than on a derivation the whole graph shares. The sentence should bind an identifier minted under a profile that declares co-control provable (a derivable key with a published commitment, or a SNARK-native key); a key held in a secure element with no available scalar is outside that profile, and co-control for it is established at issuance by the party who can prove it (the issuance-time attestation route of record 010) or not at all. WG-02's decision on derivation selects the first profile; it does not need to precede the sentence

#### Provenance

- cred-spec §Correlation Scope / §Choosing a scope / §Community-Anchored Zero-Knowledge Proof (correlation-scope revision, merged 2026-09-05)
- cred-spec #9 (identity linkages required by the ZKP constructions)
- cred-spec #31 disposition table (#9 stays open and gains weight; cross-TF work with the ZKP TF)
- ADR-001 S4 (holder binding) — generalised to two identifiers
- cred-spec #9 comments of 2026-09-08 (talltree) and 2026-09-10 (geoffturk): the requirement sentence, the subject-or-issuer widening, the chain-predicate caveat, the xref path
- cred-spec §Zero-Knowledge and Selective Disclosure (editor's note merged 2026-09-10) editor's note — 'what is waiting on the ZKP task force'
- zkp-spec PR #8 review (geoffturk, 2026-09-16, the credential maintainer's reading of the interface): records 007, 009, 010 and 011 confirmed against cred-spec #9 as settled on 2026-09-10; two asks new to the credential layer — where the ZK-openable commitment lives, and whether the requirement can be a MUST — answered in the issuance lines above

#### Record history

| date | to | by | evidence |
|---|---|---|---|
| 2026-09-02 | `requested` | geoffturk / stormer78 (cred-spec #31, PR #30) · sankarshanmukhopadhyay (cred-spec #9) | cred-spec #31 disposition row for #9: 'four things lean on the unencoded common-control linkage … the resolution is cross-TF work with the ZKP task force' |
| 2026-09-05 | `specified` | mitchuski | specified from PR #30's §Community-Anchored text + #9 + the lab's key-binding gadget shape; cost line labelled conjecture per drafting rule 4 |

Revisions within a state:

| date | by | note |
|---|---|---|
| 2026-09-11 | mitchuski | cred-spec #9 (2026-09-10): statement widened to identifiers held as subject or issuer; the '#31 four dependants' line narrowed — the VDC/VAC chain predicates are hidden-value equality (new record 009), not common control; candidate requirement sentence and the VRC-carried issuer linkage MAY recorded as issuance lines. State unchanged. |
| 2026-09-21 | mitchuski | Review of 2026-09-16 (credential maintainer): the commitment's home stated as a task-force preference (DID-document verification method; credential member only as fallback); the requirement sentence conditioned on a key profile rather than on universal derivation; the WD02 example set found unable to satisfy this record as it stands (Ed25519 `did:key` cannot carry the commitment) — WG-14. Citations by section title. State unchanged. |
| 2026-09-23 | mitchuski | formal model built (Lean, gadget library): the clause as a definition, its soundness, the counter-deployments that show which hypotheses are necessary, and the negative space classified; no state change |
| 2026-10-02 | mitchuski | horizon split by key profile in answer to the task-force discussion of 2 October (a DID as the starting point; rotation): signing-key rotation does not restart the clause where the commitment is its own verification method; a secret rotation does, and record 025 carries an enrolment across it. State unchanged. |

#### Formal verification

*A machine-checked model of this record. It proves the listed properties of the abstract relation or policy model; it is not evidence of the construction's cryptography — the hypotheses name what remains to discharge against the construction. It confers no evidence state.*

- system: Lean 4.33.1, core library only (no Mathlib); axiom footprint within propext, Classical.choice and Quot.sound — no sorry, no added axiom
- location: formal/Formal/Gadgets/P007CommonControl.lean in the evidence repository (uncommitted at this revision)
- reproduce: sh formal/scripts/check-axioms.sh — builds, prints each theorem's axiom footprint, fails on sorry or a non-standard axiom
- statement: Formal.Gadgets.CommonControl — one secret behind both identifiers under the derivation
- scope: one secret behind two identifiers; one natural person, validity, intent, the counterparty's control and the chain predicate (does-not-establish 1–6) are out of scope by construction — the clause reads a secret

| theorem | proves |
|---|---|
| `distinct_secrets_unsat` | co-control-unproven: identifiers minted from different secrets have no witness |
| `common_control_complete` | identifiers minted from one secret always satisfy the clause |

| hypothesis | carries |
|---|---|
| H-com | the derivation binds (secret, salt) (modelled as injective) |

#### Reviews

Recorded reviewer sign-off on this record's clauses; a review is not a state advance and confers no evidence state.

| date | reviewer | scope | verdict | evidence |
|---|---|---|---|---|
| 2026-09-23 | Denys Popov (DenisPopov15) | clause 1's key-profile condition and the WG-14 finding | `refined` | PR #11 review on conformance/records/007.json: an Ed25519 did:key has no space for the commitment; did:peer (numalgo 2 and 4), did:web and did:webvh — and other methods with anchoring — can carry one |


### Construction 008 · Blinded binder (taskContext hiding; presentation correlation unresolved)

*This record is at state `specified`: it is written and validates; no runtime has measured it. Costs marked conjecture are conjecture (drafting rule 4). Informative.*

| | |
|---|---|
| kind | primitive |
| state | `specified` |
| priority | P2 |
| constructor | mitchuski (record) · ScottJeezey (named the work item) |
| requested by | ScottJeezey for the ZKP TF · bmiller59 (#39 postulate) · sankarshanmukhopadhyay |
| request | cred-tf #39 (ScottJeezey 08-25: 'a blinded, non-correlating form of the binder (taskContext), with salted commitments available now and PRF-derived per-context pseudonyms as the fuller construction') · cred-spec §Trust Task Context Binding · cred-spec PR #18 (parked) · cred-tf #40 (the artifact gap) |

**Kind:** [[ref: primitive construction]] — binds the [[ref: commitment-open]] gadget and nothing else.

#### Statement

A verifier that holds a trust-task context learns that the presented credential was issued within that exchange, while the credential at rest and every other presentation of it carry no plaintext binder that recognises the exchange or the holder.

**Need.** a credential bound to the trust-task exchange it was issued in currently carries the binder in the clear; the binder (id/threadId pairing) is then a durable correlator across every presentation of that credential

#### Witness

*Never leaves the holder.*

- the taskContext value — under cred-spec PR #56 (open, 2026-09-17) the `id` of the exchange's initiating document together with `taskDigestMultibase`, the task digest of that document; before it, the id/threadId pairing
- the blinding salt u the issuer used when committing to it
- the credential carrying the commitment

#### Public inputs

- Route 1 currently treats commitment C as visible (digestMultibase-encoded). Repeated C values can correlate presentations; hiding C in a proof or a verifiable rerandomization route remains an unresolved design requirement.
- what the verifier already holds of the exchange: the taskContext digest it expects (route 1) or the context descriptor for the per-context pseudonym (route 2)
- transcriptDigest

#### Relation

1. Route 1: prove that C opens to (taskContext, secret blinding value) for the expected exchange. Route 2 (proposed): the holder proves correct derivation of a context pseudonym from its secret key and context descriptor; the verifier checks that proof without learning or recomputing with the holder secret. Both routes still require binding to the issuer-authenticated credential. — [[ref: commitment-open]]

#### Disclosure set

- the outcome (bound to this exchange / not shown)
- transcriptDigest
- route 2 only: the per-context pseudonym, which is by construction the same value every time this holder presents in this context — a declared, context-scoped link and nothing wider
- route 1 as currently specified: visible C, which is stable for this credential and can correlate presentations

#### Does not establish

- unlinkability of presentations carrying the same visible commitment C; hiding plaintext alone does not prevent equality-based correlation
- that the trust task completed, or what was done in it — completion evidence is a framework artifact outside any credential (the artifact gap, cred-tf #39/#40)
- that the binder's plaintext is not held elsewhere — the framework holds it in the Trust Task documents; this record blinds only the copy the credential carries
- durable-versus-task-dependent status of the claim (Outcome Interpretability is the credential layer's statement, not this proof's)
- unlinkability of the presentations in which a detached citation is shown (cred-spec #58): the citation is a stable (credential digest, taskContext) pair under the issuer's signature; shown to two verifiers it links those two presentations exactly as a visible C would — the holder's choice of when to show it is the whole privacy of the detached design, and this record does not add to it

#### Adversary, per claim

- **verifier** — route 1 intends to hide a low-entropy taskContext from a verifier without the opening, assuming an independent uniformly random 128-bit secret blinding value and the commitment hash assumptions; a public or disclosed opening does not provide this protection
- **verifiers-colluding** — verifiers colluding across contexts can link any repeated visible C in route 1. Route 2 cross-context unlinkability is a design objective, not established by this record; it depends on PRF key secrecy, domain separation and the absence of other stable presentation identifiers
- **issuer-verifier-colluding** — the issuer that placed C and a verifier together can link C to the exchange (the issuer knows u) — stated, not hidden: issuer–verifier collusion is outside this record's protection

#### Horizon

- route 1 plaintext hiding lasts only while the opening remains secret from the named verifier and the hash assumptions hold. Closing a thread does not erase retained openings or prevent correlation through a retained visible C.
- route 2: the context descriptor's epoch; the pseudonym rotates with it
- the commitment's hash cryptoperiod

*Quantum horizon* — read against Security Considerations item 8:

- forgery: none inside the relation: route 1 opens a hash commitment, route 2 a PRF image; the binder's own authenticity is the issuer signature's (X3)
- confidentiality: none from the proof; a visible unsalted binder is enumerable today and Grover halves the enumeration cost (record 022)

#### Conformance fixtures

Families: `accepts` · `rejects-unsat` · `rejects-verify` · `unlinkable`

Rejection codes: `binder-mismatch (unsat: C does not open to the supplied taskContext)`, `binder-plaintext-present (lint: credential carries taskContext in the clear beside C)`

#### Construction options

*Candidate constructions, each evaluated against the construction-selection criteria ([DTG-ZKP-REQ] §16.1), with its cost as measured or as conjectured.*

| construction | cost | status | source |
|---|---|---|---|
| route 1 — proposed salted-commitment opening using available primitives; no record-specific measured implementation — superseded at the credential layer by the detached citation (cred-spec #58, 2026-09-25); kept as the shape a profile that must carry a committed form in-credential would use | unmeasured — one Poseidon opening, conjecture ≈ 250–300 constraints (~70%) | unmeasured | runtimes/canonical + runtimes/circom-gadget |
| route 2 — PRF-derived per-context pseudonym (the record-002 nullifier construction with the context descriptor as domain) | the lab's domain-tagged nullifier: measured inside the 11,523-constraint gadget; standalone unmeasured | unmeasured | runtimes/circom-gadget (nullifier binds context; record 002) |

#### Issuance requirements

- the credential carries no exchange citation at all — under the detached-citation proposal on cred-spec #58 (stormer78, the Trust Tasks editor, 2026-09-25; bmiller59 +1) `taskContext` and `taskDigestMultibase` leave the credential for a separate issuer-signed citation document (working name `credential-citation/0.1`: `credentialDigestMultibase` · `taskContext` · `taskDigestMultibase`; bearer; one per credential; `parentThreadId` MUST NOT be carried) that the holder shows only to a verifier that needs completion. That retires the committed-form ask this record filed as #58 on 2026-09-21 and meets the at-rest half of the statement with no proof: there is nothing in the credential to open. A proof that must reference the exchange (route 2) reads the citation as witness, never the credential. Context timing: the `v2` context at the Implementers Draft (#48 versioning plan)
- should a profile ever carry a committed form inside a credential, C is digestMultibase-encoded (WD02 D-A) so both layers agree on the encoding
- the framework (Trust Tasks) commits to the taskContext in a form the proof can open — 'we can only blind what the framework gives us a committed form of' (ScottJeezey, cred-tf #39)
- Specify generation, distribution and retention of the secret blinding value; do not publish it beside a low-entropy plaintext-hiding commitment.

#### Provenance

- cred-tf #39 (ScottJeezey 2026-08-25 — ZKP TF work items on the record)
- cred-tf #40 (the artifact gap; delegation as a design-time case)
- cred-spec §Trust Task Context Binding / §The `taskContext` Property
- cred-spec #31 D-A (digestMultibase settled) · trustoverip/dtgwg-trust-tasks-tf#236 (§4.9.3)
- DTG ZKP TF meeting notes 2026-09-08 (Arka Rai Choudhuri): two parties who interact again in the same context reuse the same pseudonyms and can be linked; breaking that needs a new mechanism — the one case in which freshness does not hold; route 2's per-context pseudonym is that case by construction
- cred-spec PR #50 (2026-09-12) §The identity commitment: a per-application 32-byte salt carried inside the card to vetters and never to the community; every vetter recomputes the same commitment; a fresh salt per application leaves separate applications unrelated — this record's route 1 shape with the profile's own retention caveat (a vetter who keeps a card can recognise the commitment later)
- cred-spec PR #56 (albertoleon7794, 2026-09-17, open): `taskContext` becomes the initiating document's `id` (not the threadId) and gains `taskDigestMultibase`, the task digest of that document, taken with `proof` removed — a sixth digest-valued member, and a second plaintext correlator beside the first
- zkp-spec PR #8 review (geoffturk, 2026-09-16, the credential maintainer's reading of the interface): this record is scoped to the trust-task binder; the five digest-valued members of cred-spec #38 are record 022; the taskContext change is to be filed against the credential specification as an issue
- cred-spec #58 (filed 2026-09-21): a committed form of the trust-task citation — what the credential layer decides (placement, member names, encoding, retention of the blinding value, pairing with outcome evidence) and what stays here
- cred-spec #58 (stormer78 2026-09-25, as Trust Tasks editor): resolve #58 by a detached citation — the credential stops carrying `taskContext` and `taskDigestMultibase`; the issuer signs a separate citation binding the credential's salted digest to the exchange; bearer, one per credential, no `parentThreadId`; a new Trust Task specification and a citation check in §Evidence That a Cited Exchange Completed; depends on #38's salt; fixes at-rest naming and the shared value, not repeat-presentation linkability ('that remains BBS or ZK work, record 008 route 2'); `v2` at the Implementers Draft. bmiller59 +1 (22:42 UTC); the credential maintainer's view awaited
- cred-spec PR #56 MERGED 2026-09-22 (`taskContext` = initiating document `id` + `taskDigestMultibase`); PR #18 closed the same day; cred-spec 0.5.0 (`2f802ba`)
- cred-spec #58 (geoffturk 2026-09-30, the credential maintainer): 'To be implemented as part of DTG Contexts v2' — the detached citation is the disposition; `taskContext` and `taskDigestMultibase` leave the credential at `v2` (the Implementers Draft), and until then a `v1` credential still carries the plaintext pair this record describes. cred-spec is at Working Draft 0.6.0 (`44d5084`)

#### Record history

| date | to | by | evidence |
|---|---|---|---|
| 2026-08-25 | `requested` | ScottJeezey (ZKP TF co-chair, cred-tf #39) | cred-tf #39 comment 2026-08-25T14:41Z: 'we are treating these as work items: a blinded, non-correlating form of the binder (taskContext)…' |
| 2026-09-05 | `specified` | mitchuski | specified from Scott's two routes + cred-spec §Trust Task Context Binding + the lab's descriptor-digest and nullifier shapes; costs labelled conjecture |

Revisions within a state:

| date | by | note |
|---|---|---|
| 2026-09-07 | reviewer (Codex; local editorial review) | Narrowed plaintext-hiding claims, made visible-C correlation explicit, corrected PRF verification and retention assumptions. Evidence state unchanged; design and implementation questions remain open. |
| 2026-09-11 | mitchuski | Provenance: the 8 September call's same-context pseudonym caveat recorded against route 2. State unchanged. |
| 2026-09-13 | mitchuski | Provenance: cred-spec PR #50's salted identity commitment recorded as an instance of route 1, with its retention caveat. State unchanged. |
| 2026-09-21 | mitchuski | Review of 2026-09-16: witness and issuance re-read against cred-spec PR #56 (initiating-document id + task digest); the #38 digest members moved to their own record, 022; the taskContext ask filed as a credential-specification issue. State unchanged. |
| 2026-09-23 | mitchuski | formal model built (Lean, gadget library): the clause as a definition, its soundness, the counter-deployments that show which hypotheses are necessary, and the negative space classified; no state change |
| 2026-09-27 | mitchuski | cred-spec #58 answered from the framework side: a detached, issuer-signed citation replaces any citation member in the credential (stormer78 2026-09-25; bmiller59 +1). Route 1 is superseded at the credential layer — the at-rest half of the statement is met with no proof; what stays here is route 2 and the visibility of a shown citation (new does-not-establish line). Issuance line 1 rewritten; provenance; state unchanged. The record's name follows the #58 disposition when the credential maintainer rules. |
| 2026-09-30 | mitchuski | cred-spec #58 ruled by the credential maintainer (30 Sept): detached citation, in the `v2` context. Route 1 stays superseded at the credential layer from `v2`; under `v1` the plaintext pair is still what a credential carries. Route 2 is unchanged and is what this record now holds. Provenance only; state unchanged. Whether the record is renamed for what remains is a Round 2 question (008 or 011 as the home of route 2). |

#### Formal verification

*A machine-checked model of this record. It proves the listed properties of the abstract relation or policy model; it is not evidence of the construction's cryptography — the hypotheses name what remains to discharge against the construction. It confers no evidence state.*

- system: Lean 4.33.1, core library only (no Mathlib); axiom footprint within propext, Classical.choice and Quot.sound — no sorry, no added axiom
- location: formal/Formal/Gadgets/P008Binder.lean in the evidence repository (uncommitted at this revision)
- reproduce: sh formal/scripts/check-axioms.sh — builds, prints each theorem's axiom footprint, fails on sorry or a non-standard axiom
- statement: Formal.Gadgets.BinderRel — the commitment C opens to the taskContext (route 1)
- scope: route 1 only; route 2 (context pseudonym) is proposed and unmodelled; completion, plaintext custody and outcome status (does-not-establish 2–4) are out of scope

| theorem | proves |
|---|---|
| `binder_opens_once` | binder-mismatch: one commitment opens to one taskContext |
| `visible_value_links` | does-not-establish 1 (the open design requirement): a shown value depending only on the credential is equal in every presentation, so equality correlates them — hiding the plaintext does not change that |

| hypothesis | carries |
|---|---|
| H-com | the commitment binds (taskContext, salt) (modelled as injective) |


### Construction 009 · Hidden-value equality across credentials

*This record is at state `specified`: it is written and validates; no runtime has measured it. Costs marked conjecture are conjecture (drafting rule 4). Informative.*

| | |
|---|---|
| kind | primitive |
| state | `specified` |
| priority | P1 |
| constructor | mitchuski |
| requested by | geoffturk / stormer78 (cred-spec #9; §Zero-Knowledge and Selective Disclosure editor's note) — specified by the ZKP TF co-chair |
| request | cred-spec #9 (geoffturk 2026-09-10, point 4: 'a child's issuer MUST equal its parent's subject, so proving chain validity without disclosing the chain is hidden-value equality across credentials signed by different parties. No holder secret is involved … name the chain predicates separately so they do not appear covered while having no stated primitive') · cred-spec §Zero-Knowledge and Selective Disclosure editor's note (merged 2026-09-10): the VDC chain, the VAC chain and 'two credentials presented together share a subject' listed as predicates waiting on the ZKP task force |

**Kind:** [[ref: primitive construction]] — binds the [[ref: hidden-equality]] gadget and nothing else.

#### Statement

A verifier learns that a hidden field of one authenticated credential equals a hidden field of another authenticated credential — the two signed by different parties — without learning the value, and without the proof introducing a value that correlates across presentations.

**Need.** three credential-layer predicates need a proof that a hidden value in one signed credential equals a hidden value in another signed credential — a child hop's `issuer` and its parent's `credentialSubject.id`; the subject of a VMC and the subject of a VAC presented together — with no holder secret in the relation, so record 007 does not apply and nothing else names it

#### Witness

*Never leaves the holder.*

- the two credentials (their bytes stay with the holder) and the openings of the two committed fields being compared
- the issuer signatures or the leaf commitments that authenticate each credential's content — whichever the enclosing record binds (the equality clause on its own compares two witnesses; the enclosing record's signature-verify or set-membership clauses are what make them authenticated)

#### Public inputs

- whatever the enclosing record discloses of the two credentials — this record adds no public input of its own
- transcriptDigest — the presentation transcript this proof is bound to

#### Relation

1. field_a (opened from credential A's authenticated content) equals field_b (opened from credential B's authenticated content): field_a − field_b = 0 — a differing pair is unsatisfiable, and neither value is a public signal — [[ref: hidden-equality]]

#### Disclosure set

- the outcome (equal / not shown)
- transcriptDigest
- nothing about the value: no digest, commitment or pseudonym derived from it leaves the proof — the enclosing record decides what else is shown

#### Does not establish

- common control: equal identifiers in two credentials say that the same DID appears in both, not that the presenter controls it — key control is record 004, and two different identifiers under one hand is record 007
- that either credential is authentic, valid or unrevoked on its own — the enclosing record's signature-verify (or set-membership) and non-revocation clauses establish that; this clause compares two witnesses those clauses have already bound
- that the two credentials were meant to be presented together — intentional correlation is the holder's declaration (record 012), and a shared subject widens no identifier's declared scope
- anything about the value's meaning: an equal `issuer` and `credentialSubject.id` across two hops establishes the link the chain rule requires (cred-spec §Delegation Edges, §Attenuation) and nothing about who that party is

#### Adversary, per claim

- **verifier · verifiers-colluding** — the compared value is not disclosed and no value derived from it is emitted; two verifiers comparing proofs learn only what the enclosing records disclosed to each
- **issuer-verifier-colluding** — the issuer of either credential learns nothing about the other credential from the proof — the equality is proven over openings the holder supplies, never over a value the issuer can recognise in a public signal

#### Horizon

- the shorter of the two credentials' validity periods — the equality is a statement about two credentials as issued, and a re-issued credential must be re-compared
- the hash/commitment cryptoperiod of the leaf or field commitments the openings are made against

*Quantum horizon* — read against Security Considerations item 8:

- forgery: none inside the relation under the Poseidon-openings option; the as-signed option inherits ECDSA / Ed25519 — the compared fields are authenticated by signatures that become forgeable
- confidentiality: none

#### Conformance fixtures

Families: `accepts` · `rejects-unsat` · `rejects-verify` · `unlinkable`

Rejection codes: `hidden-values-differ (unsat: the two openings are not equal)`, `field-not-openable (verify-fail: a compared field carries no commitment the proof can open — an issuance failure, X3 applied to the compared fields)`

#### Construction options

*Candidate constructions, each evaluated against the construction-selection criteria ([DTG-ZKP-REQ] §16.1), with its cost as measured or as conjectured.*

| construction | cost | status | source |
|---|---|---|---|
| Groth16/Poseidon: two Poseidon openings of the compared fields (the circom-gadget leaf commitment, twice) plus one equality constraint — conjecture: the openings are the whole cost, the equality is one constraint | unmeasured (conjecture ≈ 2 × the lab's Poseidon leaf commitment + 1; one compile settles it) | unmeasured | runtimes/circom-gadget (Poseidon commitment already binds a leaf to hidden content) |
| as-signed credentials (ECDSA/Ed25519 rails): equality of two signed fields inside a Longfellow-class or ProveKit circuit — the signature checks are the cost, the equality is free | unmeasured; dominated by two signature verifications | unmeasured | board/stacks/siros-longfellow.json · board/stacks/provekit.json |
| no proof — the shared value is disclosed and compared in the clear (the credential specification's stated fallback: 'every requirement here can be checked by presenting the credentials themselves … the cost is privacy rather than correctness') | zero constraints; the cost is the disclosure of the whole chain or both subjects | unmeasured | cred-spec §Zero-Knowledge and Selective Disclosure editor's note, 'What holds until this work lands' |

#### Issuance requirements

- each field that may be compared must be, or carry, a ZK-openable commitment inside the authenticated credential content: for the chain predicates that is `issuer` and `credentialSubject.id` on every hop; for the shared-subject rule it is `credentialSubject.id` on the VMC and the VAC — the X3 requirement applied to the compared fields rather than to signatures (cred-spec #17)
- a credential whose compared field is a `pairwise` identifier that differs from the identifier in the other credential cannot satisfy this record by construction; the holder either declared one `directed` identifier for both, or the enclosing record composes record 007 for that pair instead

#### Provenance

- cred-spec #9, geoffturk 2026-09-10 point 4 — the chain predicates as hidden-value equality, to be named separately
- cred-spec §Zero-Knowledge and Selective Disclosure (editor's note merged 2026-09-10) — the VDC chain, the VAC chain and the shared-subject predicates
- cred-spec §Delegation Edges (acceptance `issuer` = grant `credentialSubject.id`), §Delegation Chains, §Attenuation (child `issuer` = parent `credentialSubject.id`), §Authority and membership are separate credentials (shared-subject proof when both are proven with the subject withheld)
- record 005 (distinctness) — the dual: a non-zero-inverse constraint proves ≠, a zero-difference constraint proves =
- zkp-spec PR #8 review (geoffturk, 2026-09-16, the credential maintainer's reading of the interface): "Record 009 is the right separation" — the chain predicates and the shared-subject rule are hidden-value equality, not common control; the credential specification's editor's note is to be reworked to two primitives (007, 009) citing 009, 011, 012 and 021
- commit: github.com/mitchuski/dtgwg-zkp-mage

#### Record history

| date | to | by | evidence |
|---|---|---|---|
| 2026-09-10 | `requested` | geoffturk / stormer78 (cred-spec #9, PR #42) | cred-spec #9 comment 2026-09-10T11:40Z: 'the VDC and VAC chain predicates are not this primitive … name the chain predicates separately'; PR #42 editor's note lists the three predicates |
| 2026-09-11 | `specified` | mitchuski | specified from the merged VDC/VAC chain rules and the shared-subject rule; bound to the new `hidden-equality` gadget (the dual of record 005's distinctness); cost lines labelled conjecture per drafting rule 4 — DRAFT for review, drop to requested if the task force prefers to bind this to commitment-open |

Revisions within a state:

| date | by | note |
|---|---|---|
| 2026-09-23 | mitchuski | formal model built (Lean, gadget library): the clause as a definition, its soundness, the counter-deployments that show which hypotheses are necessary, and the negative space classified; no state change |

#### Formal verification

*A machine-checked model of this record. It proves the listed properties of the abstract relation or policy model; it is not evidence of the construction's cryptography — the hypotheses name what remains to discharge against the construction. It confers no evidence state.*

- system: Lean 4.33.1, core library only (no Mathlib); axiom footprint within propext, Classical.choice and Quot.sound — no sorry, no added axiom
- location: formal/Formal/Gadgets/P009HiddenEquality.lean in the evidence repository (uncommitted at this revision)
- reproduce: sh formal/scripts/check-axioms.sh — builds, prints each theorem's axiom footprint, fails on sorry or a non-standard axiom
- statement: the constraint field_a − field_b = 0 over the circuit field Fin n
- scope: the equality clause alone; common control, authenticity, intent and meaning (does-not-establish 1–4) are out of scope by construction — the clause compares two witnesses

| theorem | proves |
|---|---|
| `sub_zero_iff_eq` | a − b = 0 exactly when a = b in Fin n, any n > 0 — the constraint is equality, both ways, without primality |

| hypothesis | carries |
|---|---|
| authenticated openings | the compared fields are the openings the enclosing record's signature-verify or membership clauses bind — carried by the enclosing record |


### Construction 010 · Community-Anchored Proof (ADR-001)

*This record is at state `specified`: it is written and validates; no runtime has measured it. Costs marked conjecture are conjecture (drafting rule 4). Informative.*

| | |
|---|---|
| kind | composed |
| state | `specified` |
| priority | P1 |
| constructor | mitchuski + DenisPopov15 (construction) · stormer78 (record) |
| requested by | stormer78 — ADR-001 Proposed 2026-08-25, docs.fpp.storm.ws |
| request | zkp-tf #18 (Scott 08-27: 'a natural first one to seed it with') |

**Composes:** [001](#construction-001-%C2%B7-set-membership-over-an-accredited-root) ∧ [002](#construction-002-%C2%B7-scoped-nullifier-(reuse-detection)) ∧ [003](#construction-003-%C2%B7-transcript-binding) ∧ [004](#construction-004-%C2%B7-holder-binding-(key-from-secret)) ∧ [005](#construction-005-%C2%B7-distinct-member-%2F-distinct-issuer) ∧ [006](#construction-006-%C2%B7-non-revocation-against-a-status-root) ∧ [007](#construction-007-%C2%B7-common-control-across-identifiers) — a [[ref: composed construction]]: one transcript, one [[ref: disclosure set]], written fresh.

#### Statement

A maintainer checks authenticated evidence of a relationship between two distinct member credentials of community C, under the declared holder-linkage, validity and status assumptions. Hidden identifiers remain private against the verifier and colluding verifiers only under the stated construction assumptions, disclosure set and horizon; community roots, context, optional nullifier and other disclosed metadata remain visible.

**Need.** the first ZK use case against DTG credentials: a relationship exists inside a shared community, without revealing who is in it

#### Witness

*Never leaves the holder.*

- the VRC (the voucher → the presenter): the vouch, its statement, and the pairwise-scope identifier pair it was issued between
- the presenter's VMC from C — the community-issued grant (and the presenter’s acknowledgement half)
- the voucher's VMC grant from C as it sits in C's membership root (the leaf and its path — no copy of the voucher's acknowledgement exists on the presenter's side)
- the presenter's holder secret, and the derivation material linking the presenter’s VRC-side identifier to the presenter’s VMC-side identifier (record 007) — unless the presenter declared one `directed` identifier for both
- the voucher's linkage: either one `directed` identifier used in both the voucher’s VMC and the VRC (WD02's honest default for intra-community edges), or a co-control attestation the voucher issued alongside the VRC (record 007 run by the voucher at issuance — the vouch-under-community-credential shape of ePrint 2026/333); the presenter cannot derive this from the presenter’s own secret
- non-revocation witnesses for the VRC and both VMC handles

#### Public inputs

- context descriptor (scope, purpose, epoch)
- root_C — C's membership root at a stated registry state
- rl_root and epoch — revocation state
- nullifier (only if this context declares reuse detection; otherwise absent)
- transcriptDigest — one transcript for the whole show, including the maintainer's challenge

#### Relation

1. ADR clause 1 — the VRC verifies as a vouch made by the holder of the voucher's credential over the presenter's key — [[ref: signature-verify]]
2. ADR clause 2 — the presenter's VMC grant is a leaf of root_C — [[ref: set-membership]] ([[ref: construction record]] 001, [Set membership over an accredited root](#construction-001-%C2%B7-set-membership-over-an-accredited-root))
3. ADR clause 3 — the VRC issuer's VMC grant is a leaf of root_C (offline: proven from the root, not from the voucher) — [[ref: set-membership]] ([[ref: construction record]] 001, [Set membership over an accredited root](#construction-001-%C2%B7-set-membership-over-an-accredited-root))
4. S7 (WD02 §Community-Anchored Zero-Knowledge Proof) — the identifier the presenter used in the VRC and the identifier the presenter’s VMC grant names are controlled by one secret; likewise the voucher's VRC-issuing identifier and the voucher’s VMC-grant identifier (from the voucher’s linkage artifact, or trivially if the voucher used one `directed` identifier) — otherwise clauses 1–3 are about four unrelated identifiers — [[ref: key-binding]] ([[ref: construction record]] 007, [Common control across identifiers](#construction-007-%C2%B7-common-control-across-identifiers))
5. S6 — the two authenticated member leaves are distinct; this rejects reuse of one leaf, but does not by itself reject one controller with multiple memberships — [[ref: distinctness]] ([[ref: construction record]] 005, [Distinct member / distinct issuer](#construction-005-%C2%B7-distinct-member-%2F-distinct-issuer))
6. S4 — the presenter's presentation key derives from the secret the presenter’s VMC/VRC bind to — [[ref: key-binding]] ([[ref: construction record]] 004, [Holder binding (key from secret)](#construction-004-%C2%B7-holder-binding-(key-from-secret)))
7. C1–C3 — neither VMC handle nor the VRC handle is in the set under rl_root at epoch — [[ref: non-revocation]] ([[ref: construction record]] 006, [Non-revocation against a status root](#construction-006-%C2%B7-non-revocation-against-a-status-root))
8. P4 (parameterised) — if the context declares reuse detection, emit the scoped nullifier; else emit none — [[ref: nullifier]] ([[ref: construction record]] 002, [Scoped nullifier (reuse detection)](#construction-002-%C2%B7-scoped-nullifier-(reuse-detection)))
9. S5 — the whole show is bound to transcriptDigest — [[ref: transcript-bind]] ([[ref: construction record]] 003, [Transcript binding](#construction-003-%C2%B7-transcript-binding))

#### Disclosure set

- the outcome (verifies / does not)
- root_C, rl_root, epoch (registry state the show was made against — ADR C2)
- context descriptor
- transcriptDigest
- nullifier — only in contexts that declare reuse detection
- anything the presenter deliberately discloses (P3), e.g. an assurance class carried by C's governance (G2)

#### Does not establish

- that the voucher endorses this request — a VRC is standing, not per-request; S5 binds the proof, not the relationship
- that the presenter is one natural person (that is PR-UNQ in a different context, record 002 under its own declaration)
- that C's admission decision for either member was correct (assurance boundary — accreditation carries assurance)
- the voucher's consent to this disclosure — the VRC's effective disclosure is the wider of its two halves (cred-spec §Privacy Considerations: the effective disclosure of an edge)
- that the voucher's membership was consented in the sense of §VMC (Verifiable Membership Credential), both directions — clause 3 proves the community-issued grant only; the acknowledgement half is not in the presenter's hands
- key non-transfer, absence of coercion, agent authority
- that the voucher is still a member in any sense stronger than 'not revoked as of epoch'
- that the voucher's two identifiers are co-controlled when the voucher supplied no linkage and used pairwise identifiers for both — then clause 3 is unprovable by the presenter, and the record says so rather than reading a link out of a field (cred-spec #9)
- distinct humans or controllers merely from unequal member leaves
- a complete implementation from the existence of component runtimes
- unconditional anonymity against network observers, hosted provers or unique disclosed context
- the voucher linkage from vetting evidence: an identity-vetting statement's `identityCommitment` (a salted commitment to the applicant's identity claims) or `livenessConfirmed` flag (cred-spec PR #50) is not the voucher-to-membership relation clause 4 needs — committing to identity claims does not supply it, and a vetting statement's own pass establishes neither admission, current membership nor identity truth

#### Adversary, per claim

- **verifier · verifiers-colluding** — P1/P2 — no pairwise-scope identifier of the edge, no counterparty identifier
- **verifiers-colluding** — P4 — proposed cross-context proof unlinkability against colluding verifiers, conditional on the selected proof system and absence of correlatable disclosures; context nullifiers intentionally link reuse and registry/context metadata can also correlate presentations
- **registry-operator · issuer-verifier-colluding** — C3 — currency check does not identify the presenter; holds only if rl_root/root_C are fetched without a per-holder query

#### Horizon

- earliest of: VRC validity · either VMC validity · epoch rollover · status freshness (C4 bound) · root_C cryptoperiod

*Quantum horizon* — read against Security Considerations item 8:

- forgery: clause 1 (signature-verify) under any curve suite — eddsa-jcs-2022, SPS on BLS12-381, EdDSA on Baby Jubjub — falls: forged VRCs satisfy the clause; the published-commitment branch of X3 with a post-quantum-signed root replaces it; the blackbox option (Gro15 SPS, hiding KZG, Groth–Sahai) falls entirely; the legacy-rails option inherits ECDSA / Ed25519; the blind-signature vouch option inherits its signature scheme; the Groth16 composition's soundness falls; the post-quantum route (Flock-class over standard hashes) does not, on its hash side
- confidentiality: none — hidden membership paths, secrets and voucher identities stay hidden under every option; the proof is zero-knowledge information-theoretically in the Groth16 and hash-based options

#### Conformance fixtures

Families: `accepts` · `rejects-unsat` · `rejects-verify` · `unlinkable` · `current`

Rejection codes: `voucher-not-member (unsat)`, `self-vouch (unsat)`, `vrc-signature-invalid (verify)`, `transcript-digest-mismatch (verify)`, `handle-revoked (unsat at epoch)`, `rl-root-stale`, `vetting-evidence-not-linkage (unsat: a valid vetting statement and identity-claim commitment are presented, but no voucher-to-membership relation — a test requirement from the 2026-09-13 review, no vector yet)`, `liveness-flag-not-membership (lint: `livenessConfirmed` with no current membership evidence must not create a membership edge)`, `linkage-artifact-swapped (verify-fail: a correctly signed linkage artifact from another VRC issuer or membership credential is rejected under the selected linkage profile)`

#### Construction options

*Candidate constructions, each evaluated against the construction-selection criteria ([DTG-ZKP-REQ] §16.1), with its cost as measured or as conjectured.*

| construction | cost | status | source |
|---|---|---|---|
| Groth16 / BN254 / Poseidon — candidate composition, with credential authenticity, holder linkage and non-revocation still requiring implementation | unmeasured for the complete statement; component figures cannot be added into a validated end-to-end estimate | unmeasured | CIRCUITS.md numbers per component |
| blackbox: Gro15 SPS credentials + hiding KZG + Groth–Sahai for the algebraic part, commit-and-prove SNARK for f (paper §8–9) | paper-reported benchmark pointer only; exact revision, workload and applicability to ADR-001 require verification | unmeasured | ePrint 2026/333 §10 |
| legacy rails: ECDSA/Ed25519 credentials proven as-signed (Longfellow / Crescent → vouchable, paper App. A) | unmeasured for the selected credential format and complete ADR-001 statement | unmeasured | zkp-tf #17 (SIROS catalog), ePrint 2026/333 App. A |
| post-quantum route: Flock-class binary-field prover for the hash side (membership, non-revocation, transcript) — signature clauses over curve-based credentials remain the open cost | unmeasured; proof size hundreds of kB vs ~1 kB Groth16 — a profile trade (ADR-001 D3) | unmeasured | board/stacks/flock.json |
| blind-signature vouch — the voucher blind-signs at vouch time and the presenter later proves possession of the unblinded signature under the community's key, so clause 3 is answered without the presenter holding the voucher's membership path or the voucher being online (the Berkeley team's current build, described on the 8 September call; not in ePrint 2026/333) | unmeasured — no construction published; whether the vouch verifies under the community's key or the voucher's, and how it composes with clauses 4 and 7, is the open design question | unmeasured | DTG ZKP TF meeting notes 2026-09-08 (Sanjam Garg, Arka Rai Choudhuri); a follow-up paper modelling the community was described as forthcoming |

#### Issuance requirements

- X3, concretely: the VMC and VRC signatures or a published commitment must be ZK-friendly — either SPS on BLS12-381 (blackbox), a SNARK-native signature, or an additional Poseidon/KZG commitment alongside `eddsa-jcs-2022` (cred-spec #17)
- C publishes root_C and rl_root per epoch, fetchable anonymously (T2, C3)
- membership leaf = the community-issued grant (§VMC, the membership pair): the proof covers the grant half
- a VRC issued from a pairwise-scope identifier by a member who wants it usable in community-anchored proofs carries the issuer's co-control attestation to their VMC-side identifier (record 007 at issuance) — or the member declares `directed` and uses one identifier; the credential layer names the option, not the link (cred-spec #9)

#### Provenance

- ADR-001 Community-Anchored Proof (Proposed 2026-08-25)
- cred-spec §Community-Anchored Zero-Knowledge Proof
- cred-spec §Edge Verifiability (issue #21; merged 2026-09-05)
- cred-spec §VMC (Verifiable Membership Credential), both directions (issue #8; merged 2026-08-28)
- ePrint 2026/333 §2.3–2.4, §5.3–5.4, §7.2, §8–10
- cred-spec §Community-Anchored Zero-Knowledge Proof: "the proof must additionally establish common control" · cred-spec #31 row #9
- cred-spec §Community-Anchored Zero-Knowledge Proof (merged WD02): a verifier 'SHOULD treat statement 3 as establishing that the community attested the VRC issuer's membership, and SHOULD NOT treat it as establishing that the issuer acknowledged that membership' — the record's does-not-establish line, now in the credential specification's own words
- DTG ZKP TF meeting notes 2026-09-08: ADR-001 confirmed as the first proof; the blind-signature vouch alternative; same-context pseudonym reuse as the one case where freshness does not hold; the credential signature scheme as the non-swappable choice
- cred-spec PR #50 (2026-09-12, supersedes #49): identity vetting as a community statement predicate — its identityCommitment and livenessConfirmed are not the voucher linkage; the card-digest byte-input ambiguity (received bytes vs canonical form) is carried, not adopted (review of 2026-09-13)
- zkp-spec PR #8 review (geoffturk, 2026-09-16, the credential maintainer's reading of the interface) — the answer to question 2 of zkp-tf #23 (which credential, holder-key and offline-voucher artifacts the first implementation supports): the WD02 examples as they stand — `did:key` and `did:peer` Ed25519 identifiers, the VMC pair with the community-issued grant as the membership leaf, a VRC issued from a `pairwise` identifier carrying the issuer's linkage proof under the MAY. Read against record 007's issuance line the Ed25519 `did:key` half of that set cannot carry the commitment (record 007, WG-14)
- cred-spec §Community-Anchored Zero-Knowledge Proof: Governance Considerations 1 confirmed to carry the membership-pair rule; statement 3's negative space confirmed to match the SHOULD / SHOULD NOT wording (review of 2026-09-16)
- commit: github.com/mitchuski/dtgwg-zkp-mage

#### Record history

| date | to | by | evidence |
|---|---|---|---|
| 2026-08-28 | `requested` | mitchuski | zkp-tf #18 (talltree 08-26 / Scott 08-27): seed set for the board |
| 2026-08-28 | `specified` | mitchuski | ZKP_TF_RUN-2026-08-28.md §3 (ten refinements) + this record; method fully bound to gadgets; composed disclosure set and does-not-establish written fresh |

Revisions within a state:

| date | by | note |
|---|---|---|
| 2026-09-05 | mitchuski | WD02 three-scope vocabulary (PR #30); S7 common-control clause via record 007; voucher-side linkage stated as witness + issuance option — re-specified, state unchanged |
| 2026-09-11 | mitchuski | 8 September call and merged WD02 text: blind-signature vouch added as a construction option (conjecture; source = the call); provenance cites the merged §Community-Anchored ZKP whose SHOULD/SHOULD NOT on statement 3 matches this record's negative space. State unchanged. |
| 2026-09-13 | mitchuski | cred-spec PR #50 (vetting as a statement predicate, superseding #49): negative-space line — vetting evidence is not the voucher linkage; three fixture requirements recorded as rejection codes without vectors; provenance. State unchanged. |
| 2026-09-21 | mitchuski | Review of 2026-09-16: the credential maintainer's answer to question 2 of #23 recorded; the example set's Ed25519 `did:key` identifiers found unable to carry the commitment record 007 requires (WG-14). Citations by section title. State unchanged. |
| 2026-09-23 | mitchuski | formal model built (Lean, composed from the gadget library); no state change |

#### Formal verification

*A machine-checked model of this record. It proves the listed properties of the abstract relation or policy model; it is not evidence of the construction's cryptography — the hypotheses name what remains to discharge against the construction. It confers no evidence state.*

- system: Lean 4.33.1, core library only (no Mathlib); axiom footprint within propext, Classical.choice and Quot.sound — no sorry, no added axiom
- location: formal/Formal/Composed/R010.lean in the evidence repository (uncommitted at this revision)
- reproduce: sh formal/scripts/check-axioms.sh — builds, prints each theorem's axiom footprint, fails on sorry or a non-standard axiom
- statement: Formal.R010.Accepts and soundness — two distinct members, both grants under the membership root, every handle unrevoked, a VRC from the voucher over the presenter's key
- scope: clauses 1–5 and 7; the presentation key (clause 6), the nullifier (clause 8) and the transcript (clause 9) are records 004, 002 and 003; distinct controllers from unequal leaves (does-not-establish 9) is record 005's negative space

| theorem | proves |
|---|---|
| `Formal.R010.soundness` | clauses 1–5 and 7 as gadget relations establish two distinct current members related by a VRC (record 001 twice, record 006 per handle) |
| `Formal.R010.self_vouch_unsat` | the rejection code self-vouch: one member leaf in both roles is never accepted (contrast record 023) |

| hypothesis | carries |
|---|---|
| H-sig | clause 1: a verifying VRC is one the voucher issued over the presenter's key |
| H-leaf, H-node, H-domain (record 001) | the membership tree's hashes are collision-free and leaves and nodes are hashed under separate domains |
| H-sorted (record 006) | the revocation root is committed over strictly sorted handles |
| H-com (record 007) | the identifier derivation binds (secret, salt) |


### Construction 011 · Pairwise edge (VRC possession, directed personas shown, pairwise identifiers hidden)

*This record is at state `specified`: it is written and validates; no runtime has measured it. Costs marked conjecture are conjecture (drafting rule 4). Informative.*

| | |
|---|---|
| kind | composed |
| state | `specified` |
| priority | P2 |
| constructor | mitchuski |
| requested by | cred-spec §Pairwise Zero-Knowledge Proof |
| request | zkp-tf #18 |

**Composes:** [003](#construction-003-%C2%B7-transcript-binding) ∧ [004](#construction-004-%C2%B7-holder-binding-(key-from-secret)) ∧ [006](#construction-006-%C2%B7-non-revocation-against-a-status-root) ∧ [007](#construction-007-%C2%B7-common-control-across-identifiers) — a [[ref: composed construction]]: one transcript, one [[ref: disclosure set]], written fresh.

#### Statement

A verifier learns that two disclosed persona identifiers (declared `directed`) hold a valid relationship credential between them, without learning the pairwise-scope identifiers under it and without a handle that correlates this presentation with any other.

**Need.** prove two known personas have a relationship without exposing the private pairwise channel (cred-spec §Pairwise Zero-Knowledge Proof, WD02 wording: disclose the parties’ `directed` persona identifiers while hiding the underlying `pairwise` ones)

#### Witness

*Never leaves the holder.*

- the VRC and the pairwise-scope identifier pair it was issued between
- the co-control witnesses linking each disclosed `directed` persona identifier to its hidden pairwise identifier (record 007; cred-spec #9: co-control proven in ZK, never a field) — the counterparty’s half is theirs to supply
- the presenter’s holder secret

#### Public inputs

- the two `directed` persona identifiers (disclosed on purpose)
- rl_root, epoch
- transcriptDigest

#### Relation

1. the VRC verifies under the issuing pairwise identifier’s key — [[ref: signature-verify]]
2. each disclosed persona identifier is co-controlled with its hidden pairwise identifier (record 007) — the presenter’s from their own secret, the counterparty’s from the counterparty’s attestation — [[ref: key-binding]] ([[ref: construction record]] 007, [Common control across identifiers](#construction-007-%C2%B7-common-control-across-identifiers))
3. the presenter’s presentation key derives from the secret behind their pairwise identifier — [[ref: key-binding]] ([[ref: construction record]] 004, [Holder binding (key from secret)](#construction-004-%C2%B7-holder-binding-(key-from-secret)))
4. the VRC handle is not revoked at epoch — [[ref: non-revocation]] ([[ref: construction record]] 006, [Non-revocation against a status root](#construction-006-%C2%B7-non-revocation-against-a-status-root))
5. bound to one transcript — [[ref: transcript-bind]] ([[ref: construction record]] 003, [Transcript binding](#construction-003-%C2%B7-transcript-binding))

#### Disclosure set

- the two `directed` persona identifiers
- rl_root, epoch
- transcriptDigest

#### Does not establish

- any community-level assurance (that is record 010)
- that the personas are distinct natural persons
- the relationship's content beyond what the statement discloses
- the counterparty’s persona↔pairwise linkage without the counterparty’s attestation (record 007 negative space)

#### Adversary, per claim

- **verifier · verifiers-colluding** — pairwise identifiers hidden; no cross-presentation correlator minted by the linkage itself

#### Horizon

- VRC validity
- status freshness

*Quantum horizon* — read against Security Considerations item 8:

- forgery: clause 1 (signature-verify) under a curve suite falls; the Groth16 composition with an in-circuit signature check falls with both the signature and the proof system; the paper's Construction II show inherits its pairing-based credential
- confidentiality: none

#### Conformance fixtures

Families: `accepts` · `rejects-verify` · `unlinkable`

Rejection codes: `co-control-unproven`, `vrc-signature-invalid`

#### Construction options

*Candidate constructions, each evaluated against the construction-selection criteria ([DTG-ZKP-REQ] §16.1), with its cost as measured or as conjectured.*

| construction | cost | status | source |
|---|---|---|---|
| Groth16 composition of 004+006+003 with an in-circuit signature check | unmeasured — dominated by the signature gadget (X3 again) | unmeasured | board/README |
| paper Construction II show with N=1 vouch (§7.2) | paper Table 1 | unmeasured | ePrint 2026/333 §7.2 |

#### Issuance requirements

- as record 010's X3 line

#### Provenance

- cred-spec §Pairwise Zero-Knowledge Proof (WD02 wording)
- cred-spec #9 (F post: co-control as requirement, not field)
- cred-spec §Correlation Scope
- zkp-spec PR #8 review (geoffturk, 2026-09-16, the credential maintainer's reading of the interface): record 011 answers the first two questions of cred-spec #9 implicitly — the persona-to-pairwise link is a co-control witness (record 007 in the presenter's hands), and the VPC plays no part in the proof; the counterparty's persona-to-pairwise link needs the counterparty's attestation, the same asymmetry as statement 3 of the community-anchored proof. Stated on #9 on 2026-09-21

#### Record history

| date | to | by | evidence |
|---|---|---|---|
| 2026-08-28 | `requested` | mitchuski | zkp-tf #18 (talltree 08-26 / Scott 08-27): seed set for the board |
| 2026-08-28 | `specified` | mitchuski | cred-spec construction 1 + #9 F post |

Revisions within a state:

| date | by | note |
|---|---|---|
| 2026-09-05 | mitchuski | WD02 vocabulary; co-control routed through record 007 — re-specified, state unchanged |
| 2026-09-21 | mitchuski | Review of 2026-09-16: the record's implicit answers to cred-spec #9's first two questions made explicit in provenance and stated on the thread; the counterparty-attestation asymmetry noted. State unchanged. |
| 2026-09-23 | mitchuski | formal model built (Lean, composed from the gadget library); no state change |

#### Formal verification

*A machine-checked model of this record. It proves the listed properties of the abstract relation or policy model; it is not evidence of the construction's cryptography — the hypotheses name what remains to discharge against the construction. It confers no evidence state.*

- system: Lean 4.33.1, core library only (no Mathlib); axiom footprint within propext, Classical.choice and Quot.sound — no sorry, no added axiom
- location: formal/Formal/Composed/R011.lean in the evidence repository (uncommitted at this revision)
- reproduce: sh formal/scripts/check-axioms.sh — builds, prints each theorem's axiom footprint, fails on sorry or a non-standard axiom
- statement: clauses 2 and 3 composed: the presenter's key (record 004) and the persona ↔ pairwise linkage (record 007)
- scope: the composition of clauses 2 and 3; the VRC signature (1), revocation (4) and transcript (5) are records' own gadgets; the counterparty's linkage rests on its attestation

| theorem | proves |
|---|---|
| `Formal.R011.key_behind_persona` | the presenter's key is derived from the secret behind the disclosed persona, not only the hidden pairwise identifier |
| `Formal.R011.persona_linkage_needed` | without clause 2 the key check says nothing about the persona |

| hypothesis | carries |
|---|---|
| H-com (record 007) | the identifier derivation binds (secret, salt) |
| H-sig | clause 1: the VRC verifies under the issuing pairwise identifier's key (not modelled here) |


### Construction 012 · Intentional correlation — one controller across k credentials

*This record is at state `specified`: it is written and validates; no runtime has measured it. Costs marked conjecture are conjecture (drafting rule 4). Informative.*

| | |
|---|---|
| kind | composed |
| state | `specified` |
| priority | P2 |
| constructor | mitchuski |
| requested by | talltree / geoffturk / stormer78 |
| request | cred-spec #22 (talltree 08-29: 'the ZK proof simply needs to prove the same person controls the DIDs') · cred-spec §Choosing a scope |

**Composes:** [003](#construction-003-%C2%B7-transcript-binding) ∧ [006](#construction-006-%C2%B7-non-revocation-against-a-status-root) ∧ [007](#construction-007-%C2%B7-common-control-across-identifiers) — a [[ref: composed construction]]: one transcript, one [[ref: disclosure set]], written fresh.

#### Statement

A verifier learns that the k credentials in front of it — memberships, relationships, personas — name identifiers all controlled by the presenter, and that none is revoked, while learning no identifier the presenter did not choose to show and receiving no handle that recognises the presenter elsewhere.

**Need.** under three correlation scopes, a holder who used `pairwise` identifiers (distinct by definition) or distinct wider-scoped ones, and now wishes to be recognised as the same party across several communities or relationships, needs one proof — and no other case needs any

#### Witness

*Never leaves the holder.*

- the holder secret s and each identifier's derivation material
- the k credentials (VMCs, VRCs, VPCs) — the holder declares per presentation which of their identifiers are shown and which stay hidden behind commitments
- non-revocation witnesses for each credential handle

#### Public inputs

- the identifiers the holder chooses to disclose (possibly none — the proof can be over commitments alone)
- rl_root and epoch
- transcriptDigest — one transcript for the whole show

#### Relation

1. for each pair (identifier_1, identifier_i), i = 2..k: both open to the same s — k−1 common-control clauses sharing one witness — [[ref: key-binding]] ([[ref: construction record]] 007, [Common control across identifiers](#construction-007-%C2%B7-common-control-across-identifiers))
2. no credential handle is in the set under rl_root at epoch — [[ref: non-revocation]] ([[ref: construction record]] 006, [Non-revocation against a status root](#construction-006-%C2%B7-non-revocation-against-a-status-root))
3. the whole show is bound to transcriptDigest — [[ref: transcript-bind]] ([[ref: construction record]] 003, [Transcript binding](#construction-003-%C2%B7-transcript-binding))

#### Disclosure set

- the outcome (one controller / not shown)
- the holder-declared set of credentials shown to share a controller — a per-presentation choice, the disclosure this record exists to make
- the identifiers the holder chose to disclose, and no others
- rl_root, epoch, transcriptDigest

#### Does not establish

- that the presenter is one natural person (k credentials, one secret: an agent holding a person's secret satisfies every clause — record 002 under its own declaration establishes uniqueness)
- anything about credentials not in the show: intentional correlation is declared per presentation and does not widen any identifier's declared scope
- that the communities involved consented to be named together — the disclosure is the holder's
- what any of the credentials asserts beyond existence and non-revocation (a VPC's persona content, a VRC's statement) unless disclosed

#### Adversary, per claim

- **verifier · verifiers-colluding** — no identifier beyond the disclosed set, and no cross-presentation handle: two verifiers shown different subsets cannot join them through this proof
- **issuer-verifier-colluding · registry-operator** — the issuer of any one credential in the show learns nothing about the others from the proof; the revocation-state fetch must not be a per-holder query (record 006 C3)

#### Horizon

- earliest of: any shown credential's validity · epoch rollover · the shortest identifier key-validity among the k (record 007)

*Quantum horizon* — read against Security Considerations item 8:

- forgery: none inside the relation beyond record 007's: hash openings hold; the enclosing records' signature clauses are where the exposure sits
- confidentiality: none — a proof of common control discloses one bit to one verifier and, information-theoretically, nothing more

#### Conformance fixtures

Families: `accepts` · `rejects-unsat` · `rejects-verify` · `unlinkable` · `current`

Rejection codes: `co-control-unproven`, `handle-revoked`, `show-not-declared (lint: a credential in the witness set has no disclosure declaration)`

#### Construction options

*Candidate constructions, each evaluated against the construction-selection criteria ([DTG-ZKP-REQ] §16.1), with its cost as measured or as conjectured.*

| construction | cost | status | source |
|---|---|---|---|
| no proof — where the holder deliberately reused one `directed` or `public` identifier across the credentials, the correlation is on their face (WD02 §Choosing a scope) | zero | unmeasured | cred-spec §Choosing a scope |
| Groth16 composition: (k−1) × record-007 openings + k non-revocation legs + 1 transcript constraint | unmeasured; conjecture linear in k with the 007 and 006 per-leg costs | unmeasured | board/cards/007.json, 006.json |

#### Issuance requirements

- as record 007: every identifier that may later be co-proven is, or carries, a ZK-openable commitment to s (X3 applied to identifiers)

#### Provenance

- cred-spec #22 (talltree 2026-08-29T22:40Z: the three-scope ZK observation)
- cred-spec §Choosing a scope · Privacy Consideration 2 (intentional correlation via personas)
- cred-spec §VPC (Verifiable Persona Credential) — the credential-layer instrument for the same intent

#### Record history

| date | to | by | evidence |
|---|---|---|---|
| 2026-08-29 | `requested` | talltree (cred-spec #22) | cred-spec #22 comment 2026-08-29T22:40Z: 'it reduces the set of ZK proofs needed for intentional correlation … the ZK proof simply needs to prove the same person controls the DIDs' |
| 2026-09-05 | `specified` | mitchuski | composed from 007 + 006 + 003 under one transcript; disclosure set and negative space written fresh (composition rule) |

Revisions within a state:

| date | by | note |
|---|---|---|
| 2026-09-23 | mitchuski | formal model built (Lean, composed from the gadget library); no state change |

#### Formal verification

*A machine-checked model of this record. It proves the listed properties of the abstract relation or policy model; it is not evidence of the construction's cryptography — the hypotheses name what remains to discharge against the construction. It confers no evidence state.*

- system: Lean 4.33.1, core library only (no Mathlib); axiom footprint within propext, Classical.choice and Quot.sound — no sorry, no added axiom
- location: formal/Formal/Composed/R012.lean in the evidence repository (uncommitted at this revision)
- reproduce: sh formal/scripts/check-axioms.sh — builds, prints each theorem's axiom footprint, fails on sorry or a non-standard axiom
- statement: clause 1: k − 1 common-control clauses against identifier_1
- scope: clause 1; non-revocation (2) and the transcript (3) are records 006 and 003

| theorem | proves |
|---|---|
| `Formal.R012.star_to_clique` | with H-com and k ≥ 2, the k − 1 clauses give every pair of the k identifiers one controller |
| `Formal.R012.star_without_binding_not_clique` | without a binding derivation they do not — the record's 'sharing one witness' carries the statement then |

| hypothesis | carries |
|---|---|
| H-com (record 007) | the identifier derivation binds (secret, salt) |
| k ≥ 2 | at k = 1 there is no clause and nothing establishes a secret behind identifier_1 |


### Construction 013 · Mutual edge admissibility — each half admissible under the other community's policy, neither policy nor member revealed

*This record is at state `specified`: it is written and validates; no runtime has measured it. Costs marked conjecture are conjecture (drafting rule 4). Informative.*

| | |
|---|---|
| kind | composed |
| state | `specified` |
| priority | P3 |
| constructor | mitchuski |
| requested by | stormer78 (OpenVTC implementation, cred-spec #25) · geoffturk (WD02 restatement) — requested by the ZKP TF co-chair on the record |
| request | cred-spec #25 (stormer78 2026-08-24: forming a cross-community edge needs both communities' policies to admit it, and neither side can learn the other's policy before publishing a half; first signal of inadmissibility is a rejection after one half is already out) · cred-spec #25 (mitchuski 2026-08-25: step one is plain published admissibility predicates, no proof machinery; the stronger form — 'my half would be admissible under the counterparty's policy' proven without revealing the policy or the member — is future work for the ZKP task force) · cred-spec #25 (geoffturk 2026-09-07: the two predicates in WD02 vocabulary — which correlation scopes a community accepts for the subject of a VRC its members publish, and whether it admits a non-member subject) |

**Composes:** [001](#construction-001-%C2%B7-set-membership-over-an-accredited-root) ∧ [003](#construction-003-%C2%B7-transcript-binding) ∧ [022](#construction-022-%C2%B7-blinded-digest-references-%E2%80%94-the-digest-valued-members-of-the-credential-specification%2C-unenumerable-at-rest-and-openable-in-proof) — a [[ref: composed construction]]: one transcript, one [[ref: disclosure set]], written fresh.

#### Statement

Each party to a proposed cross-community edge learns that the counterparty's committed half would be admitted under this party's community's published admissibility policy — the half's form (its subject's correlation scope and whether it claims membership) is one the policy accepts, and where the form claims membership, the subject is a member of the counterparty's community — without learning the counterparty's identifier, membership or anything of its half beyond the yes; neither half is revealed until both answers are yes.

**Need.** turn a failed cross-community publish into a pre-flight check that reveals nothing about either membership: each party proves its half would be admissible under the other community's published policy commitment before either half is published, and the two proofs are exchanged commit-before-reveal so that whoever goes first has not already disclosed

#### Witness

*Never leaves the holder.*

- the prover's proposed half — the relationship credential half it would publish (its subject identifier, declared correlation scope and membership status) — as canonical bytes, and the salt u under which it was committed (record 022)
- the Merkle path of the half's form (correlation scope, membership claimed) to the counterparty community's policy root
- where the form claims membership: the subject's community-issued grant and its Merkle path to the prover's own community root (record 001)

#### Public inputs

- the counterparty community's published admissibility-policy root — a commitment to the forms it accepts, the two WD02 predicates (which correlation scopes it accepts for the subject of a VRC its members publish; whether it admits a non-member subject) as a committed set
- the prover's community membership root at a stated epoch, where the form claims membership
- C — the commitment to the prover's half, exchanged before either proof
- transcriptDigest — over both commitments and the exchange's challenge

#### Relation

1. C opens to the canonical bytes of the proposed half under the salt u — the half is fixed before either party answers, and the half later revealed is the one the proof was about — [[ref: commitment-open]] ([[ref: construction record]] 022, [Blinded digest references — the digest-valued members of the credential specification, unenumerable at rest and openable in proof](#construction-022-%C2%B7-blinded-digest-references-%E2%80%94-the-digest-valued-members-of-the-credential-specification%2C-unenumerable-at-rest-and-openable-in-proof))
2. the half's form (the subject's correlation scope, membership claimed or not) is a leaf of the counterparty community's policy root — [[ref: set-membership]] ([[ref: construction record]] 001, [Set membership over an accredited root](#construction-001-%C2%B7-set-membership-over-an-accredited-root))
3. where the form claims membership, the subject's grant is a leaf of the prover's own community root at the stated epoch — a claimed membership is real, never merely declared — [[ref: set-membership]] ([[ref: construction record]] 001, [Set membership over an accredited root](#construction-001-%C2%B7-set-membership-over-an-accredited-root))
4. the proof is bound to transcriptDigest over both commitments and the exchange's challenge, so an admissibility answer cannot be replayed against a different half or a different exchange — [[ref: transcript-bind]] ([[ref: construction record]] 003, [Transcript binding](#construction-003-%C2%B7-transcript-binding))

#### Disclosure set

- each direction's outcome (the counterparty's committed half has a form this community's policy accepts / not shown)
- the two commitments C and transcriptDigest
- the policy roots and the membership root, already published
- the halves themselves, only after both answers are yes — a rule of the exchange, not of either proof

#### Does not establish

- that the edge will be accepted once published — admissibility under a policy commitment is not acceptance by a community's verifier
- privacy of either policy — proving a form is in the counterparty's accepted set needs that set's path, so the policies are published (the request's step one); hiding a policy from prospective counterparties is not addressed
- fairness — after both answers are yes, nothing compels a party to reveal its half; a party can learn the yes and walk away (the formal model's no_fairness)
- that the half's declared correlation scope is honest beyond the form — a non-member form proves nothing about the subject, and the scope is the prover's declaration inside its own committed half
- that the policy root is current beyond the stated epoch or version
- that either party is a member of anything beyond what the policy's form asked

#### Adversary, per claim

- **verifier** — the counterparty learns that this party's half has a form its policy accepts, not the half, its subject identifier or the membership behind it — holds while C is hiding (the salt u) and while the policy accepts more than one form; a policy that accepts exactly one form turns yes into the form
- **verifier** — a party that answers first cannot be met by a counterparty that re-commits to a different half after seeing the answer — commitments are frozen once an answer exists (the formal model's commit_frozen)

#### Horizon

- earliest of: each community's policy root version, the prover's membership root epoch, and the exchange challenge
- the exchange itself: an unanswered exchange expires with its challenge; a new exchange needs new commitments

*Quantum horizon* — read against Security Considerations item 8:

- forgery: none inside the relation: hash membership against policy and membership roots and a hash opening; each root's authenticity is its community's signature, outside the proof
- confidentiality: none — the two predicates' commitments hide information-theoretically; the exchange reveals only what step one publishes

#### Conformance fixtures

Families: `accepts` · `rejects-unsat` · `rejects-verify`

Rejection codes: `half-inadmissible (unsat: the half's form is not a leaf of the counterparty's policy root)`, `membership-unproven (unsat: the form claims membership and no grant leaf exists under the prover's root)`, `commitment-mismatch (unsat: C does not open to the half the proof reads)`, `transcript-digest-mismatch (verify: the proof was made for another exchange)`, `answer-before-commitments (exchange: refused until both commitments are in)`, `reveal-before-both-yes (exchange: refused)`, `recommit-after-answer (exchange: refused)`

#### Construction options

*Candidate constructions, each evaluated against the construction-selection criteria ([DTG-ZKP-REQ] §16.1), with its cost as measured or as conjectured.*

| construction | cost | status | source |
|---|---|---|---|
| step one, no proof — the two predicates published as discoverable fields on the community profile (the proposed answer on #25; reveals nothing about membership) | zero; a pre-flight read | unmeasured | cred-spec #25 proposed answer · geoffturk 2026-09-07 WD02 restatement |
| Groth16 / BN254 / Poseidon composition — the lab's membership circuit (record 001) against the policy root and, where claimed, the membership root, with a Poseidon commitment opening (record 022) and transcript binding (record 003); the exchange runs outside the circuit | unmeasured | unmeasured | this record's clauses over the lab's components; record 001's runtime |

#### Issuance requirements

- a community publishes its admissibility predicates as a Merkle root over the forms it accepts (correlation scope × membership status), per policy version — the registry-ZK interaction the credential specification leaves to this task force
- the tree hashes forms and internal nodes under separate domains, or every path has the tree's fixed depth (record 001's requirement)
- the proposed half's canonical bytes are committed with a fresh salt before the exchange (record 022's route 1)
- the exchange runs in order — both commitments, then the proofs, then revelation only after both answers are yes; no commitment changes once an answer exists

#### Provenance

- cred-spec #25 — relationship policy discovery (stormer78 2026-08-24; mitchuski 2026-08-25; geoffturk 2026-09-07)
- cred-spec §Scope the holder cannot declare alone (WD02) — the pattern of a community stating a policy the holder cannot see, applied to a different fact
- docs.fpp.storm.ws DTG conformance review, item X4 'Across communities'
- commit: github.com/mitchuski/dtgwg-zkp-mage

#### Record history

| date | to | by | evidence |
|---|---|---|---|
| 2026-09-11 | `requested` | mitchuski (on cred-spec #25, 2026-08-25) — requested by stormer78's issue and geoffturk's 2026-09-07 restatement | cred-spec #25: 'There is a stronger form the ZKP task force can carry as future work: proving my half would be admissible under the counterparty's policy without revealing the policy or the member' — placed on the request register 2026-09-11 (open item D23); every field above is a placeholder until specified |
| 2026-09-23 | `specified` | mitchuski | statement, witness, public inputs, four clauses composed from 001 · 003 · 022, disclosure set, six doesNotEstablish lines (policy privacy and fairness named), two adversary claims, horizon, seven rejection codes (three for the exchange), two options, four issuance lines; formal model of one direction and of the exchange ordering |

#### Formal verification

*A machine-checked model of this record. It proves the listed properties of the abstract relation or policy model; it is not evidence of the construction's cryptography — the hypotheses name what remains to discharge against the construction. It confers no evidence state.*

- system: Lean 4.33.1, core library only (no Mathlib); axiom footprint within propext, Classical.choice and Quot.sound — no sorry, no added axiom
- location: formal/Formal/Composed/R013.lean in the evidence repository (uncommitted at this revision)
- reproduce: sh formal/scripts/check-axioms.sh — builds, prints each theorem's axiom footprint, fails on sorry or a non-standard axiom
- statement: Formal.R013.Accepts for one direction; the exchange as a state machine (Formal.R013.step, Safe)
- scope: clauses 1–3 as a model and the exchange ordering; clause 4 (transcript) is record 003's; the commitment's hiding and the policy's privacy are outside the model

| theorem | proves |
|---|---|
| `Formal.R013.soundness` | clauses 1–3: the committed half is the one whose form was proven, the form is a leaf of the counterparty's policy tree, and a claimed membership is a leaf of the prover's tree (records 022 and 001 twice) |
| `Formal.R013.exchange_safe` | over any sequence of events, a half is revealed only after both answers are yes, and no answer exists before both commitments |
| `Formal.R013.commit_frozen` | no commitment changes once an answer exists |
| `Formal.R013.no_fairness` | does-not-establish 3: after both yes answers the exchange can stop with nothing revealed |

| hypothesis | carries |
|---|---|
| H-digest (record 022) | clause 1: the commitment is collision-free over (bytes, salt) |
| H-leaf, H-node, H-domain (record 001) | clauses 2 and 3: both trees' hashes are collision-free, leaves and nodes under separate domains |


### Construction 020 · Delegation chain (VDC) — agent acts for a member

*This record is at state `specified`: it is written and validates; no runtime has measured it. Costs marked conjecture are conjecture (drafting rule 4). Informative.*

| | |
|---|---|
| kind | composed |
| state | `specified` |
| priority | P2 |
| constructor | construction: sankarshanmukhopadhyay · DenisPopov15 · mitchuski (per ScottJeezey, cred-tf #40) · record: stormer78 (§VDC, merged 2026-09-06) |
| requested by | stormer78 / sankarshanmukhopadhyay |
| request | cred-spec §VDC (Verifiable Delegation Credential), open question 6 of its merge review; ADR-001 §05 'deserves its own record once this one is proven' · cred-tf #40 (stormer78 08-22 design note; ScottJeezey 08-24: "on our list alongside Q2") · cred-spec #31 pre-merge list for #19 |

**Composes:** [001](#construction-001-%C2%B7-set-membership-over-an-accredited-root) ∧ [003](#construction-003-%C2%B7-transcript-binding) ∧ [004](#construction-004-%C2%B7-holder-binding-(key-from-secret)) ∧ [006](#construction-006-%C2%B7-non-revocation-against-a-status-root) ∧ [009](#construction-009-%C2%B7-hidden-value-equality-across-credentials) — a [[ref: composed construction]]: one transcript, one [[ref: disclosure set]], written fresh.

#### Statement

A verifier learns that the presenting agent holds a delegation chain rooted at a principal who is a member of a recognised community, with scope narrowing at every hop, no hop expired or revoked, and every hop accepted by its delegate — without learning the principal. (Profile case; the core single-hop VDC is verified by five local checks and no proof.)

**Need.** prove an agent may act for a principal within scope S until T, chain attenuation-only, without revealing the principal — in the chained PROFILE only: the WD02 core VDC is single-hop, principal-issued, delegate-countersigned and needs no chain proof (cred-tf #40 §1)

#### Witness

*Never leaves the holder.*

- the VDC chain (grant credentials), each hop's scope, validUntil, maxDepth
- the principal's membership leaf
- the agent's key secret
- each hop’s acceptance countersignature (`delegation.accepts` = SAID of the grant) — the acceptance is constitutive, not optional evidence (cred-tf #40 §3, KERI two-seal shape)

#### Public inputs

- root_C, rl_root, epoch
- the invoked scope term (disclosed)
- transcriptDigest

#### Relation

1. act ∈ scope_n ⊆ … ⊆ scope_root (set inclusion over exact matches), validUntil monotone along the chain, and depth bounded by every ancestor: a hop below a parent bearing `maxDepth` n bears at most n − 1, no hop lies more than n steps below an ancestor bearing n, and no hop exists below a parent that omits `maxDepth` or sets it to 0; the chain terminates in a root delegation issued by the principal (cred-spec §Delegation Chains, WD02, checks 2–5) — [[ref: chain-resolve]]
2. each hop's `issuer` equals its parent's `credentialSubject.id` — hidden-value equality across credentials signed by different parties, with no holder secret in the relation (cred-spec §Delegation Edges; #9 2026-09-10) — [[ref: hidden-equality]] ([[ref: construction record]] 009, [Hidden-value equality across credentials](#construction-009-%C2%B7-hidden-value-equality-across-credentials))
3. each hop’s delegate countersigned the grant: `accepts` matches the grant digest (digestMultibase, WD02 D-A) and verifies under the delegate’s key — [[ref: signature-verify]]
4. principal is a leaf of root_C — [[ref: set-membership]] ([[ref: construction record]] 001, [Set membership over an accredited root](#construction-001-%C2%B7-set-membership-over-an-accredited-root))
5. the agent's presentation key derives from the leaf-hop delegate secret — [[ref: key-binding]] ([[ref: construction record]] 004, [Holder binding (key from secret)](#construction-004-%C2%B7-holder-binding-(key-from-secret)))
6. no hop revoked at epoch — [[ref: non-revocation]] ([[ref: construction record]] 006, [Non-revocation against a status root](#construction-006-%C2%B7-non-revocation-against-a-status-root))
7. bound to one transcript — [[ref: transcript-bind]] ([[ref: construction record]] 003, [Transcript binding](#construction-003-%C2%B7-transcript-binding))

#### Disclosure set

- the invoked scope term
- root_C, rl_root, epoch
- transcriptDigest

#### Does not establish

- that the principal authorised this specific act (grant ≠ invocation — the invocation is a trust-task artifact)
- the principal's identity
- that the agent is not also acting for others
- that the principal has not declined renewal — in the core, revocation is non-renewal within one validUntil; the profile’s credentialStatus re-adds a live lookup and this record’s non-revocation leg is what lets the presentation carry it instead
- what the delegate actually did in the principal’s name — the invocation record lives on the framework side (the artifact gap, cred-tf #40 Q8)
- chain-length hiding without a validated fixed-shape or padded profile
- that the principal is the party the verifier intends to deal with — §Delegation Chains check 5 is the verifier's own check, outside the proof; the proof shows the root's issuer is a leaf of root_C, not that it is the intended party
- the delegate's demonstration of key control at the moment of the request (§Invocation Binding) beyond what clause 4 binds into this transcript — how the demonstration is requested and carried is the trust task's
- chain length: without a validated fixed-shape or padded profile the number of hops is disclosed by the proof's shape (cred-spec Privacy Considerations item 13)

#### Adversary, per claim

- **verifier · verifiers-colluding** — principal hidden under the selected proof assumptions and declared disclosure, against the verifier and colluding verifiers; hiding chain length additionally requires validated padding/fixed shape and metadata analysis, which are not established here

#### Horizon

- the shortest validUntil in the chain
- status freshness

*Quantum horizon* — read against Security Considerations item 8:

- forgery: clause 3 (every hop's countersignature verifies) under a curve suite falls: a forged acceptance satisfies the chain; the committed-hop form — each hop a commitment in a post-quantum-signed registry — is the replacement, and it is a credential-specification change; a recursive or folding proof per hop built on a pairing-based verifier falls; a hash-based recursion does not
- confidentiality: none — the undisclosed chain stays hidden

#### Conformance fixtures

Families: `accepts` · `rejects-unsat` · `rejects-verify`

Rejection codes: `scope-escalation (unsat)`, `depth-exceeded`, `hop-revoked`

#### Construction options

*Candidate constructions, each evaluated against the construction-selection criteria ([DTG-ZKP-REQ] §16.1), with its cost as measured or as conjectured.*

| construction | cost | status | source |
|---|---|---|---|
| bounded monolithic proof of a fixed maximum chain depth; padding semantics and authenticated hop checks to be defined | unmeasured | unmeasured | editorial alternative for review, 2026-09-08 |
| recursive/folding proof per hop | unmeasured | unmeasured | PATH-MAP P4 (PLONKish/folding counter-proposal welcome) |

#### Issuance requirements

- VDC as an edge credential type (cred-spec §VDC, merged WD02 2026-09-06) with ZK-friendly signatures — X3 applies
- the delegator issues from an identifier declared `directed` and scoped to the context in which the appointment is exercised (cred-spec Privacy Considerations item 10); the delegate accepts each principal's appointment under a distinct identifier
- grant and acceptance digests are digestMultibase (§Digest Encoding); the acceptance is REQUIRED and carries no scope of its own — the verifier reads scope from the grant (§Delegation Edges)
- `parent` and `maxDepth` exist only where re-delegation is explicitly authorised (absent or 0 = single hop, the default); `credentialStatus` is CONDITIONAL on every VDC, chained or not — REQUIRED where validity exceeds the governing freshness window, otherwise short validity and re-issuance (§VDC schema); this record's non-revocation leg is what lets a chained presentation carry status without a live lookup
- the chain is presented whole — a verifier MUST reject a chain it cannot complete from the presentation alone — which is exactly the disclosure this record removes (§Delegation Chains; Privacy Considerations item 13)

#### Provenance

- cred-spec §VDC (Verifiable Delegation Credential) — merged 2026-09-06 (over WD02): §Delegation Edges, §Delegation Chains (five chain checks; 'chain validity is a candidate for zero-knowledge presentation'), §Invocation Binding
- cred-spec §Zero-Knowledge and Selective Disclosure editor's note (2026-09-10): 'proving a VDC chain valid without disclosing it' named as a predicate waiting on the ZKP task force
- cred-spec #9 (geoffturk 2026-09-10): the chain predicates are hidden-value equality, not common control — record 009
- liveness reqs v0.4 delegation evidence
- ADR-001 §05
- ePrint 2026/333 App. B.1
- cred-tf #40 (delegation as a design-time case; the chain-resolution boundary) · cred-spec #31 (#19 pre-merge checklist)

#### Record history

| date | to | by | evidence |
|---|---|---|---|
| 2026-08-28 | `requested` | mitchuski | zkp-tf #18 (talltree 08-26 / Scott 08-27): seed set for the board |
| 2026-09-05 | `specified` | mitchuski | ScottJeezey accepted delegation-chain validity as a ZKP TF target (cred-tf #40, 2026-08-24); predicate shape + acceptance clause + core/profile split from stormer78’s note; issuance lines from cred-spec #31 |

Revisions within a state:

| date | by | note |
|---|---|---|
| 2026-09-11 | mitchuski | Door D17 — re-read against the merged VDC text (cred-spec main, 2026-09-06/10): depth restated as the per-ancestor bound; the issuer-equals-parent-subject clause added and bound to record 009 (hidden-value equality); `credentialStatus` corrected — conditional on every VDC, not only chained ones; issuance and provenance now cite the merged sections; three negative-space lines added (intended-party check, invocation demonstration, chain length). State unchanged. |
| 2026-09-23 | mitchuski | formal model built (Lean, composed from the gadget library); no state change |

#### Formal verification

*A machine-checked model of this record. It proves the listed properties of the abstract relation or policy model; it is not evidence of the construction's cryptography — the hypotheses name what remains to discharge against the construction. It confers no evidence state.*

- system: Lean 4.33.1, core library only (no Mathlib); axiom footprint within propext, Classical.choice and Quot.sound — no sorry, no added axiom
- location: formal/Formal/Chains/Records.lean (with Presentation.lean and Gadgets/ChainResolve.lean) in the evidence repository (uncommitted at this revision)
- reproduce: sh formal/scripts/check-axioms.sh — builds, prints each theorem's axiom footprint, fails on sorry or a non-standard axiom
- statement: Formal.Chains.Statement with the root's own depth — the act conferred and unexpired at every hop, depth within the root, every issuer its parent's subject, the root's issuer a member, no hop revoked
- scope: clauses 1–4 and 6; the agent's key (5) and the transcript (7) are records 004 and 003; chain-length hiding is a profile property

| theorem | proves |
|---|---|
| `Formal.Chains.r020_soundness` | the local per-hop checks establish the global statement |
| `Formal.Chains.escalation_unsat` | the rejection code scope-escalation: a hop that does not confer the act makes the chain unacceptable |
| `Formal.Chains.linked_of_constraint` | clause 2: the in-circuit constraint issuer − subject = 0 is equality (record 009) |
| `Formal.Gadgets.leaf_act_all` | clause 1: checking the act at the leaf gives it at every hop |
| `Formal.Gadgets.depth_within_every_ancestor` | clause 1: no hop lies more than n steps below any ancestor bearing n |
| `Formal.Gadgets.no_decrement_unbounded` | clause 1: without 'a child bears at most n − 1' a chain runs deeper than its root allows |

| hypothesis | carries |
|---|---|
| H-sig | clause 3: each hop's countersignature verifies |
| H-leaf, H-node, H-domain (record 001) | the membership tree's hashes are collision-free and leaves and nodes are hashed under separate domains |
| H-sorted (record 006) | the revocation root is committed over strictly sorted handles |


### Construction 021 · Authority chain (VAC) — an agent or device acts as itself under attenuated authority

*This record is at state `specified`: it is written and validates; no runtime has measured it. Costs marked conjecture are conjecture (drafting rule 4). Informative.*

| | |
|---|---|
| kind | composed |
| state | `specified` |
| priority | P2 |
| constructor | mitchuski |
| requested by | stormer78 / geoffturk (spec side) — specified by the ZKP TF co-chair |
| request | cred-spec §Zero-Knowledge and Selective Disclosure editor's note (merged 2026-09-10): 'Holder holds a VAC conferring action X at scope S, and its chain is valid and unrevoked: each link is issued by its parent's subject, narrows its parent, no link is revoked, depth is within every limit its links set, and the root is issued by the party governing S — without disclosing the chain' · cred-spec §VAC (Verifiable Authority Credential) (merged 2026-09-10): §Attenuation, §Invocation, §Withdrawal, §Authority and membership are separate credentials · cred-spec #9 (2026-09-10): the VAC chain predicate is hidden-value equality, not common control |

**Composes:** [001](#construction-001-%C2%B7-set-membership-over-an-accredited-root) ∧ [003](#construction-003-%C2%B7-transcript-binding) ∧ [004](#construction-004-%C2%B7-holder-binding-(key-from-secret)) ∧ [006](#construction-006-%C2%B7-non-revocation-against-a-status-root) ∧ [009](#construction-009-%C2%B7-hidden-value-equality-across-credentials) — a [[ref: composed construction]]: one transcript, one [[ref: disclosure set]], written fresh.

#### Statement

A verifier learns that the presenting party holds authority to perform action X at scope S, conferred through a chain of attenuations that starts with the party governing S, narrows at every link, respects every `maxAttenuation` and the depth ceiling, has no revoked link, and whose leaf subject is the presenter — without learning any link's identifiers or the chain's ancestry beyond what the presenter discloses.

**Need.** a VAC chain is presented whole on every use, so every verifier sees the identifier of the party that equipped the agent (cred-spec Privacy Considerations item 13); the credential specification names the zero-knowledge form as waiting on this task force and states what holds until it lands

#### Witness

*Never leaves the holder.*

- the VAC chain: every VAC from the presented leaf up to the one issued by the governing party (`authority.parent` digests, `scope`, `actions`, `validUntil`, `maxAttenuation` per link)
- the governing party's accreditation leaf and path for scope S, where S's governing party is itself proven from a registry root rather than disclosed
- the leaf subject's key secret (the presenter acts as itself and must demonstrate key control at invocation — §Invocation)
- non-revocation witnesses for every link that carries `credentialStatus`
- the presenter's VMC leaf and path, where the governing party requires the leaf subject to independently qualify (§Attenuation, 'Who may hold derived authority')

#### Public inputs

- root_G — the root under which the party governing S is accredited (or the governing party's identifier, where the profile discloses it)
- the invoked action X and scope term S (disclosed — the act is attributed to the presenter)
- rl_root and epoch — revocation state
- transcriptDigest — one transcript for the whole show, including the verifier's challenge

#### Relation

1. X ∈ actions_leaf ⊆ … ⊆ actions_root, scope never widened, validUntil monotone, depth ≤ 8 and within every `maxAttenuation` any link sets (a link below a parent bearing n bears at most n − 1; none exists below a parent bearing 0); the root is a VAC issued directly by the governing party (`authority.parent` absent) — cred-spec §Attenuation — [[ref: chain-resolve]]
2. each link's `issuer` equals its parent's `credentialSubject.id`, and each link's `authority.parent` equals the digest of its parent — hidden-value equality across differently-signed credentials — [[ref: hidden-equality]] ([[ref: construction record]] 009, [Hidden-value equality across credentials](#construction-009-%C2%B7-hidden-value-equality-across-credentials))
3. every link verifies as signed by its issuer over the hidden content the chain clauses read — [[ref: signature-verify]]
4. the governing party of S is a leaf of root_G — proven from the root, not disclosed — [[ref: set-membership]] ([[ref: construction record]] 001, [Set membership over an accredited root](#construction-001-%C2%B7-set-membership-over-an-accredited-root))
5. the presenter's key derives from the leaf subject's secret — the VAC is not a bearer credential (§Invocation) — [[ref: key-binding]] ([[ref: construction record]] 004, [Holder binding (key from secret)](#construction-004-%C2%B7-holder-binding-(key-from-secret)))
6. no link carrying `credentialStatus` is in the set under rl_root at epoch — revocation of an ancestor cascades, so the check runs on every link that carries status (§Withdrawal) — [[ref: non-revocation]] ([[ref: construction record]] 006, [Non-revocation against a status root](#construction-006-%C2%B7-non-revocation-against-a-status-root))
7. where the governing party requires it, the leaf subject is also a leaf of the scope's membership root — authority and membership stay separate credentials, and when both are proven with the subject withheld the presentation includes a shared-subject proof: record 009 where one identifier is used in both, record 007 where the two identifiers differ (§Authority and membership are separate credentials) — [[ref: set-membership]] ([[ref: construction record]] 001, [Set membership over an accredited root](#construction-001-%C2%B7-set-membership-over-an-accredited-root))
8. the whole show is bound to transcriptDigest — [[ref: transcript-bind]] ([[ref: construction record]] 003, [Transcript binding](#construction-003-%C2%B7-transcript-binding))

#### Disclosure set

- the outcome (holds authority for X at S / does not)
- X and S — the act is performed as the presenter and attributed to the presenter
- root_G, rl_root, epoch
- transcriptDigest
- the presenter's own identifier, where the profile discloses it (the presenter acts as itself); nothing about any ancestor

#### Does not establish

- that the presenter is someone the scope will deal with — a valid chain establishes narrowing by parties entitled to narrow, not that the leaf subject independently qualifies; that is the governing party's policy call (§Attenuation) and clause 7 is present only where the policy asks for it
- delegation: the presenter acts as itself, and nothing here appoints it to act in anyone's name (§Authority is not delegation — that is record 020)
- that the governing party's own permission to govern S is current beyond 'accredited under root_G at the stated state'
- chain length: the number of links is disclosed by the proof's shape unless a fixed-shape or padded profile is validated — hiding it is a profile property this record does not claim
- that the action was performed, or performed within scope — the invocation and its receipt are trust-task artifacts (the artifact gap)
- unconditional hiding from the governing party: where the root carries `credentialStatus`, the status fetch tells the root's status host that some verifier checked the chain, and when (cred-spec Privacy Considerations item 14) — a profile that fetches rl_root without a per-chain query is the mitigation, not this proof
- distinct controllers along the chain: a party attenuating to itself under a second identifier satisfies every clause

#### Adversary, per claim

- **verifier · verifiers-colluding** — no ancestor identifier is disclosed — the verifier learns the leaf's authority, not who equipped the presenter or through whom; against colluding verifiers the chain contributes no cross-presentation handle beyond what the presenter discloses of itself
- **registry-operator** — the status check on links that carry `credentialStatus` does not identify the presenter or the chain when rl_root is fetched without a per-chain query; the root-status timing leak of item 14 is stated, not hidden
- **issuer-verifier-colluding** — an issuer of one link learns from the proof nothing about the links below it — attenuations it never saw stay unseen, as the credential specification intends ('a governing party withdraws derivations it never saw')

#### Horizon

- the shortest `validUntil` in the chain (attenuation never extends validity; REQUIRED on every VAC)
- status freshness for links that carry `credentialStatus` (the governing party's freshness window)
- root_G cryptoperiod

*Quantum horizon* — read against Security Considerations item 8:

- forgery: clause 3 (every link verifies as signed by its issuer) under a curve suite falls; the committed-link form in a post-quantum-signed registry is the replacement; a recursive or folding proof per link built on a pairing-based verifier falls; a hash-based recursion does not
- confidentiality: none — the undisclosed chain stays hidden

#### Conformance fixtures

Families: `accepts` · `rejects-unsat` · `rejects-verify`

Rejection codes: `action-not-conferred (unsat: X absent from the leaf's actions)`, `attenuation-widens (unsat: a link confers an action, scope or validity its parent did not)`, `attenuation-limit-exceeded (unsat: a link lies below a `maxAttenuation` bound or below a link bearing 0)`, `depth-ceiling-exceeded (unsat: more than 8 links)`, `link-issuer-mismatch (unsat: a link's issuer is not its parent's subject — record 009)`, `link-revoked (unsat at epoch)`, `root-not-governing (unsat: the root's issuer is not a leaf of root_G)`, `leaf-key-mismatch (verify-fail: the presenter's key does not derive from the leaf subject's secret)`

#### Construction options

*Candidate constructions, each evaluated against the construction-selection criteria ([DTG-ZKP-REQ] §16.1), with its cost as measured or as conjectured.*

| construction | cost | status | source |
|---|---|---|---|
| bounded monolithic proof of a fixed maximum chain depth (≤ 8, the credential specification's ceiling), padded to a fixed shape so chain length is not disclosed; hop checks over Poseidon-committed VAC content | unmeasured — conjecture: 8 × (signature-verify + two openings) dominates; the chain arithmetic is cheap | unmeasured | record 020's editorial alternative (2026-09-08), applied with the VAC's fixed ceiling |
| recursive/folding proof per link — one step per attenuation, the leaf proof carrying the accumulated statement | unmeasured | unmeasured | PATH-MAP P4 (PLONKish/folding counter-proposal welcome) |
| no proof — the chain is presented whole and every check is performed on disclosed credentials (the credential specification's stated fallback, at the cost of Privacy Considerations item 13) | zero constraints; the cost is disclosing the ancestry | unmeasured | cred-spec §Zero-Knowledge and Selective Disclosure editor's note, 'What holds until this work lands' |

#### Issuance requirements

- VAC content that the chain clauses read — `issuer`, `credentialSubject.id`, `authority.scope`, `authority.actions`, `authority.parent`, `authority.maxAttenuation`, `validUntil` — must be ZK-openable inside the authenticated credential: X3 applied to the VAC (cred-spec #17)
- `authority.parent` is a digestMultibase digest of the parent (§Digest Encoding); the unsalted-digest concern of cred-spec #38 applies to it — record 022 (blinded digest references) is the construction for that member and the four others; record 008's blinding question is the trust-task binder's
- the governing party publishes rl_root per epoch, fetchable without a per-chain query; where the root carries `credentialStatus` the governing party states the timing correlation it accepts (cred-spec Privacy Considerations item 14)
- a governing party that requires derived subjects to independently qualify says so in its governance framework, so a profile knows whether clause 7 is in the statement (§Attenuation)

#### Provenance

- cred-spec §VAC (Verifiable Authority Credential), merged 2026-09-10: §Attenuation (by default; `maxAttenuation`; depth ceiling 8; 'Who may hold derived authority'), §Invocation (not a bearer credential), §Withdrawal (cascade), §Authority is not delegation, §Relationship to the VDC, §Authority and membership are separate credentials
- cred-spec §Zero-Knowledge and Selective Disclosure editor's note (2026-09-10): the VAC chain predicate waiting on the ZKP task force; 'implementations SHOULD NOT defer shipping a rule of this specification on the grounds that its zero-knowledge form is unspecified'
- cred-spec #9 (geoffturk 2026-09-10): chain predicates are hidden-value equality — record 009
- cred-spec Privacy Considerations items 13 (chain disclosure) and 14 (status on a root)
- record 020 (delegation chain) — the sibling record; the two differ in default (attenuation by default vs re-delegation opt-in), in attribution (as itself vs in another's name) and in cascade
- commit: github.com/mitchuski/dtgwg-zkp-mage

#### Record history

| date | to | by | evidence |
|---|---|---|---|
| 2026-09-10 | `requested` | stormer78 / geoffturk (cred-spec PR #29 → #42) | cred-spec PR #42 merged 2026-09-10: the VAC chain predicate listed as waiting on the ZKP task force; cred-spec #9 2026-09-10 names it separately from common control |
| 2026-09-11 | `specified` | mitchuski | specified from the merged §VAC rules (attenuation, invocation, withdrawal, shared subject) as a sibling of record 020; composition and negative space written fresh; every cost line conjecture — DRAFT for review |

Revisions within a state:

| date | by | note |
|---|---|---|
| 2026-09-23 | mitchuski | formal model built (Lean, composed from the gadget library); no state change |

#### Formal verification

*A machine-checked model of this record. It proves the listed properties of the abstract relation or policy model; it is not evidence of the construction's cryptography — the hypotheses name what remains to discharge against the construction. It confers no evidence state.*

- system: Lean 4.33.1, core library only (no Mathlib); axiom footprint within propext, Classical.choice and Quot.sound — no sorry, no added axiom
- location: formal/Formal/Chains/Records.lean (with Presentation.lean and Gadgets/ChainResolve.lean) in the evidence repository (uncommitted at this revision)
- reproduce: sh formal/scripts/check-axioms.sh — builds, prints each theorem's axiom footprint, fails on sorry or a non-standard axiom
- statement: Formal.Chains.Statement with the depth ceiling 8, plus clause 7's leaf membership where the governing party requires it
- scope: clauses 1–4, 6 and 7; the presenter's key (5) and the transcript (8) are records 004 and 003; distinct controllers along the chain (does-not-establish 7) are outside any clause

| theorem | proves |
|---|---|
| `Formal.Chains.r021_soundness` | the local per-link checks establish the global statement, and the leaf subject's membership where required |
| `Formal.Chains.r021_ceiling_unsat` | the rejection code depth-ceiling-exceeded: more than 8 links is never accepted, whatever maxAttenuation says |
| `Formal.Chains.escalation_unsat` | the rejection code action-not-conferred |
| `Formal.Chains.linked_of_constraint` | clause 2: the in-circuit constraint issuer − subject = 0 is equality (record 009) |
| `Formal.Gadgets.scope_within_every_ancestor` | clause 1: no link widens its parent's scope, across the whole chain |

| hypothesis | carries |
|---|---|
| H-sig | clause 3: every link's signature verifies over the content the chain clauses read |
| H-leaf, H-node, H-domain (record 001) | the membership tree's hashes are collision-free and leaves and nodes are hashed under separate domains |
| H-sorted (record 006) | the revocation root is committed over strictly sorted handles |


### Construction 022 · Blinded digest references — the digest-valued members of the credential specification, unenumerable at rest and openable in proof

*This record is at state `specified`: it is written and validates; no runtime has measured it. Costs marked conjecture are conjecture (drafting rule 4). Informative.*

| | |
|---|---|
| kind | primitive |
| state | `specified` |
| priority | P2 |
| constructor | mitchuski |
| requested by | geoffturk / stormer78 (cred-spec #38) · ScottJeezey (cred-tf #39) — specified by the ZKP TF co-chair on the maintainer's request of 2026-09-16 |
| request | cred-spec #38 (geoffturk 2026-09-05: every digest-valued binder is an unsalted JCS-SHA-256 digest over often low-entropy content — enumerable where the referenced credential is not disclosed; blinding deferred from WD02) · cred-spec #38 (stormer78 2026-09-07: five members, of two kinds — the acknowledgement, the acceptance and the statement adopt the exact content they name; the VDC's and VAC's `parent` are chain references re-checked against a presented parent) · cred-tf #40 E3 (stormer78: forty published scope strings, a committed subset matched by enumeration in milliseconds) · cred-tf #39 (ScottJeezey 2026-08-25: salted commitments now, PRF-derived pseudonyms later) · zkp-spec PR #8 review (geoffturk 2026-09-16, request 3: 'give #38 a record' — widen 008 or open a sibling; the disposition of which members carry a salt and where it lives stays on #38) |

**Kind:** [[ref: primitive construction]] — binds the [[ref: commitment-open]] gadget and nothing else.

#### Statement

A verifier learns that a digest-valued reference carried by a presented credential names exactly the credential the enclosing record's clauses read — the community-issued grant a member-issued VMC acknowledges, the appointment a VDC accepts, the credential a VSC's statement is about, the parent a VDC or a VAC derives from — while the reference value is not enumerable by a party not shown the referenced credential and, where the enclosing record hides the reference, is not shown at all.

**Need.** a verifier shown a digest-valued reference but not the credential it names must not be able to recover that credential by trying the plausible values; and a proof that reads the referenced credential (an acknowledged grant, an accepted appointment, an attested object, a parent in a chain) must be able to open the reference to it without the reference becoming a durable correlator of the presenting credential

#### Witness

*Never leaves the holder.*

- the referenced credential's canonical bytes — its JSON representation without the top-level `proof`, canonicalized per JCS (RFC 8785), as §Digest Encoding prescribes — or, where the enclosing record needs only the digest, the digest itself
- the blinding value u under which the digest was taken (a 32-byte random salt), held by whoever holds the referenced credential
- the referencing credential that carries the reference (its bytes stay with the holder; only what the enclosing record discloses is shown)

#### Public inputs

- the reference value as the referencing credential carries it (route 1: a salted digest, visible; route 2: nothing — the reference is opened inside the proof and the enclosing record's public inputs stand in for it)
- transcriptDigest — the presentation transcript this proof is bound to
- the hash algorithm the reference declares in its Multihash header (`sha2-256` unless a governing VTC or VTN permits another), so verifier and circuit agree on the function being opened

#### Relation

1. the reference opens to (canonical bytes of the referenced credential, u) under the declared digest function: reference = Multibase(Multihash(H(bytes ∥ u))) — a different credential or a different salt is unsatisfiable; and when the enclosing record reads the referenced credential (the grant's fields in record 010, the parent's fields in records 020 and 021, the object in a VSC-based record) the bytes opened here are the bytes those clauses read — one credential, not one for the digest and another for the predicate — [[ref: commitment-open]]

#### Disclosure set

- the outcome (the reference names the credential the clauses read / not shown)
- transcriptDigest
- the reference value only as far as the enclosing record already discloses it — route 1 shows the salted digest, which is stable for the referencing credential; route 2 adds nothing to the disclosure set

#### Does not establish

- that the referenced credential is currently valid, unrevoked or accepted (record 006; the enclosing record's own clauses)
- that the party issuing the referencing credential was entitled to reference that credential — an acknowledgement by a non-member, an acceptance by the wrong delegate, a witness with no standing: governance and the enclosing record decide that, not the opening
- unlinkability of presentations that show the same salted digest (route 1): hiding the plaintext behind a salt stops enumeration and nothing else; a stable visible reference still links every presentation of the referencing credential, exactly as record 008 says of a visible commitment C
- which digest-valued members carry a salt and where the salt lives — that disposition is the credential specification's (cred-spec #38); this record states what the proof needs of whichever placement is chosen
- that a chain reference (a VDC's or VAC's `parent`) needs blinding for safety: the credential specification re-checks every link against the parent actually presented, so a chain reference is unforgeable within a presented chain without a salt; blinding it serves uniformity and enumeration resistance, not chain soundness

#### Adversary, per claim

- **verifier** — a verifier shown the reference but not the referenced credential learns nothing about that credential's content that it could not have guessed without the reference — the salt removes the enumeration oracle
- **verifiers-colluding** — route 2 only: two verifiers comparing what they were shown cannot link two presentations of the referencing credential through the reference, because neither saw a reference value

#### Horizon

- the salt's confidentiality: the claim fails for any party that holds u and the schema — the referencing credential's holder, the referenced credential's holder, and whoever either gave the salt to; the disposition on #38 decides who those are
- the digest function: opening a SHA-256 digest in-circuit is the cost horizon of route 2; a profile that permits another Multihash algorithm changes the gadget, not the record
- the validity horizon of the enclosing record — this record adds none of its own

*Quantum horizon* — read against Security Considerations item 8:

- forgery: none inside the relation: a salted hash opening holds; the SNARK-native Pedersen commitment option falls (binding) and the Poseidon one does not
- confidentiality: none from the proof; a salt shorter than 256 bits loses half its bits to Grover — ETSI's guidance for salted-hash credentials is to double the salt

#### Conformance fixtures

Families: `accepts` · `rejects-unsat`

Rejection codes: `reference-mismatch (unsat: no (bytes, u) opens the presented reference to the credential the clauses read)`, `reference-unsalted (lint: a profile that requires blinding presented a reference whose hashed representation carries no salt)`

#### Construction options

*Candidate constructions, each evaluated against the construction-selection criteria ([DTG-ZKP-REQ] §16.1), with its cost as measured or as conjectured.*

| construction | cost | status | source |
|---|---|---|---|
| salt in the referenced credential's hashed block (an ACDC-style `u` member: 32 random bytes the issuer places in the credential, so every digest of that credential is unpredictable without the credential itself). Route 1: no change to the digest computation of §Digest Encoding beyond the bytes it hashes; a verifier shown the referenced credential recomputes as today; enumeration is defeated for every reference to that credential at once, and the salt travels with the credential that owns it | zero outside a proof; inside a proof, a SHA-256 preimage over the canonical bytes — on the order of 25–30k R1CS constraints per 64-byte block in circom's sha256 (conjecture for this record, not measured); a 1.5 KB credential is roughly 24 blocks | unmeasured | cred-spec #38 (the ACDC `u` salty-nonce placement named in the issue); KERI/ACDC specification, blinding of SAIDs by a `u` field; circomlib sha256 constraint counts as commonly reported |
| salt held beside the reference, outside the credential at rest (record 008's route 1 shape): the referencing credential carries H(bytes ∥ u) and the two parties to the reference hold u; the referenced credential is unchanged. Blinds one reference rather than every reference to a credential, and requires a distribution and retention rule for u | as above in-circuit; a retention rule outside it | unmeasured | cred-tf #39 (salted commitments available now); record 008 route 1 and its retention caveat |
| a SNARK-native commitment (Poseidon or Pedersen over a field encoding of the digest) as the reference — cheap to open in-circuit, but a second hashed representation beside §Digest Encoding's, which is the encoding migration #38 was scoped to avoid; recorded as the not-preferred option | a few hundred constraints to open; a second encoding for every consumer | unmeasured | cred-spec #38 ('so a blinding scheme can later change what is hashed without a second encoding migration') |

#### Issuance requirements

- the members this record covers are the five §Digest Encoding names — the member-issued VMC's `digestMultibase`, a VSC's `object.digestMultibase`, a VDC's `delegation.parent` and `delegation.accepts`, a VAC's `authority.parent` — and, under cred-spec #58's detached citation (2026-09-25), the citation document's `credentialDigestMultibase`, a digest over the salted credential, in place of the `taskDigestMultibase` member PR #56 (merged 2026-09-22) put in the credential; record 008 covers the citation itself
- the hashed representation of a referenced credential must contain a salt the proof can treat as a witness; the proof-side preference is the first option above (a salt member inside the referenced credential), because it blinds every reference at once, moves with the credential, and changes neither the referencing credential nor the encoding — the disposition is #38's — adopted in that shape on #38 (stormer78 2026-09-25; bmiller59 +1): a REQUIRED top-level `salt` on every DTG credential, exactly 32 bytes from a CSPRNG, fresh per credential, base-58-btc multibase, covered by the digest and the proof; mandatory-disclosure under selective-disclosure suites; no change to §Digest Encoding; defined from the `v2` context at the Implementers Draft and not emitted under `v1`
- content-binding references (acknowledgement, acceptance, statement object) must stay bound to the exact content they name: a salted digest preserves that binding, a re-randomizable commitment would not without a further opening
- chain references (a VDC's and a VAC's `parent`) are re-checked by the verifier against the parent presented, so a profile may leave them unsalted where the whole chain is disclosed, and must salt them where a chain is proven without disclosure (records 020 and 021)
- the encoding of the reference is unchanged: Multibase base-58-btc over a Multihash of the salted digest, compared as decoded bytes, as §Digest Encoding requires

#### Provenance

- cred-spec #38 — 'Digest-valued binders are unsalted and enumerable; blinding is deferred from WD02' (geoffturk 2026-09-05; stormer78 2026-09-07 scope note: five members, two kinds; mitchuski 2026-09-08: record 008's reading)
- cred-spec §Digest Encoding — the five members, the JCS-SHA-256-Multihash-Multibase procedure, and the editor's note pointing at this task force for the blinding construction
- cred-spec §Zero-Knowledge and Selective Disclosure editor's note (merged 2026-09-10): 'none of the digest-valued members … is salted … blinding them is cross-cutting work with the same task force'
- cred-tf #39 (ScottJeezey 2026-08-25: salted commitments now; PRF-derived per-context pseudonyms as the fuller construction) · cred-tf #40 E3 (stormer78: enumeration of a committed scope subset)
- cred-spec PR #56 (open, 2026-09-17): `taskDigestMultibase` — a task digest over the initiating document, the same encoding, a sixth member
- zkp-spec PR #8 review (geoffturk 2026-09-16, request 3): give #38 a record, widen 008 or open a sibling; the disposition stays on #38
- records 020 and 021: the chain clauses already read `parent` inside the relation; this record is the opening they compose
- cred-spec #38 (stormer78 2026-09-25): settle the first tracked question now — a `salt` member inside the hashed block of every DTG credential, 'matching record 022's preferred placement'; REQUIRED; 32 bytes CSPRNG; base-58-btc; mandatory-disclosure under `ecdsa-sd-2023`/BBS; out of scope: presentation linking and blinding the VSC `predicate` (stay with this task force); profile-defined digests (`cardDigestMultibase`, `identityCommitment`, `attestationTextDigest`) must reference something salted or say why guessing is no concern. bmiller59 +1 (22:42 UTC). Timing per #48: `v2`
- cred-spec #58 (stormer78 2026-09-25): the detached citation's `credentialDigestMultibase` is a digest over the salted credential — 'only safe from guessing if the credential carries a `salt`' — so this record's option 1 is what makes the citation unguessable by a party holding exchange records alone
- cred-spec #48 (geoffturk 2026-09-25; stormer78, bmiller59 +1): context `https://registry.trustoverip.org/dtg/context/v1` (byte-frozen; digest pinned normatively) and vocabulary `https://registry.trustoverip.org/dtg/credentials#`; `v1` = 0.5.0 shape + `issuerScope` (#46); one `v2` at the Implementers Draft carries `salt` (#38) and drops `taskContext`/`taskDigestMultibase` (#58); dtgwg-vsc-registry PR #7 open
- cred-spec #38 (geoffturk 2026-09-30, the credential maintainer): 'To be implemented as part of DTG Contexts v2' — the REQUIRED in-credential `salt` lands with the `v2` context at the Implementers Draft; under `v1` the digest-valued members remain unsalted and the enumeration this record describes still applies. cred-spec #48 closed via PR #64 (2026-09-28): the context, vocabulary and predicate IRIs are in the specification text
- commit: github.com/mitchuski/dtgwg-zkp-mage

#### Record history

| date | to | by | evidence |
|---|---|---|---|
| 2026-09-07 | `requested` | geoffturk / stormer78 (cred-spec #38) · ScottJeezey (cred-tf #39) | cred-spec #38 scope note: five digest-valued members of two kinds; the issue's third tracked item is coordination with the ZKP task force's blinded-binder work |
| 2026-09-21 | `specified` | mitchuski | the credential maintainer's review of PR #8 (2026-09-16) asked for a record a reader coming from #38 will find; this record: statement, witness, public inputs, one clause bound to commitment-open (the opening, with the opened bytes tied to what the enclosing record reads), the two reference kinds kept apart in the issuance lines, three placements with their costs (conjecture), the disposition left to #38 |

Revisions within a state:

| date | by | note |
|---|---|---|
| 2026-09-23 | mitchuski | formal model built (Lean, gadget library): the clause as a definition, its soundness, the counter-deployments that show which hypotheses are necessary, and the negative space classified; no state change |
| 2026-09-27 | mitchuski | cred-spec #38 adopted this record's option 1 as written — a REQUIRED in-credential `salt`, 32 bytes, base-58-btc, mandatory-disclosure under SD suites, `v2` timing (stormer78 2026-09-25; bmiller59 +1); nothing for the proof side to change. The sixth-member line narrows: `taskDigestMultibase` leaves the credential under #58 and the citation's `credentialDigestMultibase` takes its place. Provenance carries the #48 context decision. State unchanged. |
| 2026-09-30 | mitchuski | cred-spec #38 ruled by the credential maintainer (30 Sept): option 1 lands in the `v2` context. Until `v2`, a `v1` credential's digest references are still enumerable, which is the horizon an implementer should read. Provenance only; state unchanged. |

#### Formal verification

*A machine-checked model of this record. It proves the listed properties of the abstract relation or policy model; it is not evidence of the construction's cryptography — the hypotheses name what remains to discharge against the construction. It confers no evidence state.*

- system: Lean 4.33.1, core library only (no Mathlib); axiom footprint within propext, Classical.choice and Quot.sound — no sorry, no added axiom
- location: formal/Formal/Gadgets/P022DigestRef.lean in the evidence repository (uncommitted at this revision)
- reproduce: sh formal/scripts/check-axioms.sh — builds, prints each theorem's axiom footprint, fails on sorry or a non-standard axiom
- statement: Formal.Gadgets.RefRel — the reference opens to (the bytes the enclosing clauses read, u)
- scope: the opening and the one-credential clause; validity, entitlement and salt placement (does-not-establish 1, 2, 4) are out of scope; route 1 linkability (line 3) is record 008's visible_value_links

| theorem | proves |
|---|---|
| `reference_opens_once` | reference-mismatch: a reference names one credential |
| `two_credential_gap` | the one-credential clause is necessary: opened and read separately, the proof passes about a credential that is not the referenced one |
| `chain_sound_unsalted` | does-not-establish 5: a chain reference re-checked against the presented parent is sound with no salt — blinding serves enumeration resistance, not chain soundness |

| hypothesis | carries |
|---|---|
| H-digest | the declared digest is collision-free over (bytes, salt) (modelled as injective) |


### Construction 023 · Two-vouch admission proof — an applicant proves k ≥ 2 vouches from distinct current members to the issuing community, without disclosing which members

*This record is at state `specified`: it is written and validates; no runtime has measured it. Costs marked conjecture are conjecture (drafting rule 4). Informative.*

| | |
|---|---|
| kind | composed |
| state | `specified` |
| priority | P1 |
| constructor | mitchuski |
| requested by | ScottJeezey (chair, on the record for Round 1) · Arka Rai Choudhuri / Berkeley (the construction being built) · Glenn Gore (the Linux Plumbers integration) — specified by the ZKP TF co-chair on the chair's request |
| request | zkp-spec PR #11 review (ScottJeezey 2026-09-21, Round 1 position, 'Build'): 'we need a record for the two-vouch admission proof. Per Arka, what Berkeley is building and Glenn is integrating for Linux Plumbers is an admission proof (a non-member proves two vouches from distinct members to the issuer), which is a different statement from record 010. That's the LPC-relevant construction and it has no home yet. Proposing we add it and reference Berkeley's reference code as the constructor.' · general #31 (stormer78 2026-08-26): the Phase 4 join — one member invite, vouched connections with at least two other members, an ID check, presented once to the community, whose rules engine decides |

**Composes:** [001](#construction-001-%C2%B7-set-membership-over-an-accredited-root) ∧ [003](#construction-003-%C2%B7-transcript-binding) ∧ [004](#construction-004-%C2%B7-holder-binding-(key-from-secret)) ∧ [005](#construction-005-%C2%B7-distinct-member-%2F-distinct-issuer) ∧ [006](#construction-006-%C2%B7-non-revocation-against-a-status-root) ∧ [007](#construction-007-%C2%B7-common-control-across-identifiers) — a [[ref: composed construction]]: one transcript, one [[ref: disclosure set]], written fresh.

#### Statement

The issuing community learns that the applicant — the subject named in a pending join request — holds relationship credentials issued by at least k distinct current members of this community (k = 2 in the reference policy), each naming the applicant's identifier as subject and each issued by a member whose community-issued grant is a leaf of the community's current membership root, without learning which members issued them and without any voucher taking part in the presentation.

**Need.** the join moment of an open-source community's onboarding: an applicant who is not yet a member presents evidence that at least two distinct current members vouch for them, to the community that will issue the membership, without the community learning which members vouched and without the vouchers being online — a different statement from record 010, where a member shows a verifier a relationship with an offline voucher

#### Witness

*Never leaves the holder.*

- the k relationship credentials (VRCs) the vouchers issued to the applicant, with their signatures
- for each voucher: the voucher's community-issued VMC grant and its Merkle path to root_C (the voucher's membership, proven from the root, not from the voucher)
- for each voucher: the linkage between the identifier the voucher used as VRC issuer and the identifier the voucher's grant names — one `directed` identifier reused, or the voucher's co-control attestation carried by the VRC (record 007 run by the voucher at issuance; the MAY of cred-spec #9)
- the applicant's holder secret and the derivation of the identifier(s) the VRCs name (record 004); where the applicant used a different `pairwise` identifier toward each voucher, the openings that prove them one controller's (record 007)
- non-revocation witnesses for each voucher's membership handle under rl_root at the epoch

#### Public inputs

- root_C and rl_root at a stated epoch — the community's membership and revocation roots, fetched by the applicant without a per-applicant query
- k — the vouch threshold the community's admission policy declares (the reference policy: 2)
- the applicant's admission identifier — the subject the join request names and the VMC would be issued to; disclosed by construction, since the applicant is applying
- context descriptor — the community and the join-request exchange (the Trust Tasks `vtc/join-requests` submission), so the proof cannot be replayed to another community or another request
- transcriptDigest — the presentation transcript, bound to the join request

#### Relation

1. each of the k VRCs verifies as issued by its voucher's VRC-side identifier over a subject equal to the applicant's admission identifier, or to an identifier the applicant proves co-controlled with it (clause 5) — [[ref: signature-verify]]
2. each voucher's community-issued VMC grant is a leaf of root_C — the voucher is a current member, proven from the root while the voucher is offline — [[ref: set-membership]] ([[ref: construction record]] 001, [Set membership over an accredited root](#construction-001-%C2%B7-set-membership-over-an-accredited-root))
3. for each voucher, the identifier that issued the VRC and the identifier the voucher's grant names are one controller's — reused `directed` identifier, or the voucher's issuance-time attestation opened here — [[ref: key-binding]] ([[ref: construction record]] 007, [Common control across identifiers](#construction-007-%C2%B7-common-control-across-identifiers))
4. the k authenticated member leaves are pairwise distinct — the same member cannot be counted twice under two identifiers or two credentials — [[ref: distinctness]] ([[ref: construction record]] 005, [Distinct member / distinct issuer](#construction-005-%C2%B7-distinct-member-%2F-distinct-issuer))
5. the applicant's presentation key derives from the secret the VRCs' subject identifier(s) bind to; where the VRCs name different `pairwise` identifiers of the applicant, those identifiers open to the same secret — [[ref: key-binding]] ([[ref: construction record]] 004, [Holder binding (key from secret)](#construction-004-%C2%B7-holder-binding-(key-from-secret)))
6. no voucher's membership handle is in the set under rl_root at the epoch — a vouch from a revoked member does not count — [[ref: non-revocation]] ([[ref: construction record]] 006, [Non-revocation against a status root](#construction-006-%C2%B7-non-revocation-against-a-status-root))
7. the whole show is bound to transcriptDigest and to the context descriptor of this community and this join request — [[ref: transcript-bind]] ([[ref: construction record]] 003, [Transcript binding](#construction-003-%C2%B7-transcript-binding))

#### Disclosure set

- the outcome (at least k distinct current members vouch for this applicant / not shown)
- k, root_C, rl_root, epoch — the policy threshold and the registry state the proof was made against
- the applicant's admission identifier and the context descriptor of the join request
- transcriptDigest
- under a community policy that requires it, the vouchers' identities as a deliberate disclosure — then this record's privacy claims do not apply to that presentation and the flow is the credentials themselves

#### Does not establish

- that any voucher consented to be counted toward this admission — a relationship credential is evidence of a relationship, and whether it is a vouch is the community's reading under its rules (general #31: 'vouching is social, not technical')
- that the applicant is not already a member — a member can hold k VRCs; if the policy needs 'not a member', the statement gains a non-membership clause against root_C (record 006's gadget applied to the membership set), which this record does not include
- that no voucher is the applicant — the statement has no clause excluding it, and an applicant who is already a member can vouch for itself through its own grant, so one of the k counted members is the applicant (the formal model's counter-deployment `self_vouch_counted`); the refusal is the community's admission check, which must refuse an applicant who is already a member (record 024 carries the key-level exclusion as its clause 7)
- that the k vouchers are k distinct natural persons — distinct member leaves, not distinct people (record 002's negative space; personhood is never inferred)
- the invitation or the identity check — the VIC and the vetting statement are presented as credentials beside this proof, not proven inside it (the vetting statement's PASS limits carry: cred-spec PR #50)
- that the community will admit the applicant — the proof's outcome is one input to the community's policy engine; verifying it, accepting it under policy and issuing the VMC are three acts (WG-04)
- what the VRCs say beyond naming the applicant as subject — attributes, scopes and the relationship's own terms are outside the statement
- that a community's admission path mints the witness this record needs — an admission that issues no relationship credentials has no VRC to prove over; record 024 states the hidden-vetting statement such a path can run
- a commitment in the applicant's identifier — under the blind-signature (PCS) route the voucher linkage is bound to an enrolment secret inside the credential system and no DID verification-method commitment (component 007, WG-14) is exercised; nothing ties the proof to the applicant's DID beyond what the credential itself binds. Whether the admission path must satisfy 007 is a Round 2 question (PR #11 review, 2026-09-28)

#### Adversary, per claim

- **verifier** — the issuing community learns nothing about which members vouched beyond the count reaching k — no voucher identifier, VRC-side or VMC-side, no path position, no leaf
- **verifiers-colluding** — two join requests by one applicant to two communities, or a repeated request to one, cannot be linked through this proof beyond the disclosed admission identifier — the proof emits no identifier-derived value; the admission identifier is disclosed by the applicant's own act
- **registry-operator · issuer-verifier-colluding** — fetching root_C and rl_root does not identify the applicant or the vouchers — holds only if roots are fetched without a per-applicant query

#### Horizon

- earliest of: each VRC's validity · each voucher's membership validity · epoch rollover · status freshness (the community's published bound) · root_C cryptoperiod
- the join request's own validity — a proof bound to a withdrawn or decided request (Trust Tasks `vtc/join-requests/withdraw`, `decide`) is not replayable to the next one

*Quantum horizon* — read against Security Considerations item 8:

- forgery: clause 1 (each VRC verifies) under a curve suite falls; the blind-signature admission option (PCS, Σ-PS over BLS12-381) falls entirely — credential, Schnorr proofs and tag injectivity; the Groth16 composition falls with its proof system; vouchers-disclosed is a signature check in the clear and falls with the signature
- confidentiality: under option 1 the Tag_DDH pseudonym stream becomes linkable once DDH falls — with record 024 option 1, the one confidentiality exposure in this catalogue; under the hash-based options, none

#### Conformance fixtures

Families: `accepts` · `rejects-unsat` · `rejects-verify` · `unlinkable` · `current`

Rejection codes: `voucher-not-member (unsat: a VRC issuer with no grant leaf under root_C)`, `voucher-duplicate (unsat: one member leaf behind two VRCs)`, `vouch-count-below-k (unsat: fewer than k distinct vouchers)`, `subject-mismatch (unsat: a VRC naming a subject the applicant cannot open to the admission identifier)`, `voucher-linkage-missing (unsat: a `pairwise` VRC issuer with no co-control attestation and no directed reuse — the offline-linkage question of zkp-tf #18)`, `voucher-revoked (unsat at epoch)`, `vrc-signature-invalid (verify)`, `transcript-digest-mismatch (verify)`, `join-request-context-mismatch (verify: the proof was made for another community or another request)`, `rl-root-stale`

#### Construction options

*Candidate constructions, each evaluated against the construction-selection criteria ([DTG-ZKP-REQ] §16.1), with its cost as measured or as conjectured.*

| construction | cost | status | source |
|---|---|---|---|
| blind-signature admission — the construction the chair named on PR #11 (Berkeley, Glenn Gore integrating) and the blind-signature vouch of the 2026-09-08 call are one construction: membership by possession of a blind signature rather than by Merkle inclusion, which is the Predicate Credential System (PCS) and is record 024's option 1 with the five public Trust Tasks as its issuance lines. Recorded there, not here: 024 admits on k distinct attestations from a hidden vetter set; this record admits on k distinct vouching members of a known set over relationship credentials, and its own constructions are membership ones. Under the PCS route the voucher linkage rests on a secret bound at enrolment inside the credential system, so component 007 is bypassed rather than satisfied (see does-not-establish) | not recorded here — see record 024 option 1 (PCS source public at OpenVTC/predicate-credential-system 4f4edf5 since 2026-09-28; sizes constructor-reported, unmeasured) | unmeasured | zkp-spec PR #11 inline review (DenisPopov15 2026-09-28) folding the two rows; the chair on PR #11 (2026-09-21); DTG ZKP TF call 2026-09-08 (Sanjam Garg); record 024 · OpenVTC/predicate-credential-system 4f4edf5 |
| Groth16 / BN254 / Poseidon composition — k parallel instances of record 010's clauses 1–3, 6, 7 (VRC authenticity, voucher membership, voucher linkage, non-revocation) sharing one holder-binding clause (004), one distinctness clause over the k leaves (005) and one transcript binding (003); the applicant's own membership clause of 010 dropped, since the applicant is not a member | unmeasured for the complete statement; roughly k × the voucher-side share of record 010 plus one shared binding — component figures cannot be added into a measurement | unmeasured | this record's composition of 001 · 003 · 004 · 005 · 006 · 007; record 010's option 1 |
| vouchers disclosed — the applicant presents the k VRCs and the vouchers' membership evidence in the clear; the community checks distinctness and membership against its registry. No proof; the privacy claims above do not apply | zero | unmeasured | general #31 (the flow as drawn); a community policy that requires knowing its vouchers |

#### Issuance requirements

- as record 010's X3 line: the VRCs' signatures must be provable in-circuit, or a ZK-openable commitment must sit beside each (cred-spec #17); the signature scheme is the non-swappable choice
- the community publishes root_C and rl_root per epoch, fetchable anonymously, and declares k in its admission policy (Governance Considerations 4; WG-05)
- each voucher's VRC-side identifier must be linkable to the voucher's VMC-side identifier offline: the voucher reuses one `directed` identifier, or the VRC carries the voucher's co-control attestation (the MAY of cred-spec #9; record 007 at issuance) — the same offline-linkage requirement as record 010, now on k vouchers
- the applicant's identifier(s) named in the VRCs must be, or carry, a ZK-openable commitment to the applicant's secret where they differ from the admission identifier (record 007; WG-14) — or the applicant uses one `directed` identifier toward every voucher and the community, in which case clause 5 is holder binding alone
- the join request (Trust Tasks `vtc/join-requests/submit`, with `supplement` for a deferred answer) carries the presentation, and its exchange is the context descriptor the proof binds — the citation of that exchange on the VMC later issued is record 008's concern (cred-spec #58)
- the invitation (VIC) and the identity check (the vetting statement) travel beside the proof as credentials; the policy engine combines them with the proof's outcome under the community's rules (WG-04)
- the context the proof binds should include a challenge the community mints per applicant and spends when the proof is counted — a proof verifies as often as it is submitted, so a join-request context alone lets the same bytes count twice; an applicant answering `requestMore` obtains a fresh challenge

#### Provenance

- zkp-spec PR #11 review (ScottJeezey 2026-09-21, Round 1 position): the build ask — an admission proof, a different statement from 010, Berkeley's reference code as constructor, LPC-relevant
- general #31 (stormer78 2026-08-26) — the Phase 4 join: 1 member invite + 2 member vouches + ID check, presented once; 'rules do the gatekeeping, not people'; mapped to records in the reply of 2026-09-21 (AA)
- DTG ZKP TF call 2026-09-08 (Arka Rai Choudhuri): the community-modelling follow-up to ePrint 2026/333 is what the Linux-kernel work ties to; the blind-signature vouch (Sanjam Garg)
- cred-spec §VMC (Verifiable Membership Credential), both directions; §Membership Edge Completion — the voucher's membership is the community-issued grant half (Governance Considerations 1)
- cred-spec §Community-Anchored Zero-Knowledge Proof — statement 3's offline-linkage requirement, applied here to each voucher
- trust-tasks-tf `vtc/join-requests` (submit · supplement #526 · withdraw #518 · decide) and #543 (a community can ask an applicant to tell it about themselves) — the exchange the proof binds
- record 010 — the sibling statement (a member shows a verifier a relationship with an offline voucher); this record drops the presenter's own membership and multiplies the voucher side by k
- commit: github.com/mitchuski/dtgwg-zkp-mage

#### Record history

| date | to | by | evidence |
|---|---|---|---|
| 2026-09-21 | `requested` | ScottJeezey (chair) on zkp-spec PR #11, for the record on zkp-tf #23 | Round 1 position, 'Build': the two-vouch admission proof has no home; add it and reference Berkeley's reference code as the constructor |
| 2026-09-21 | `specified` | mitchuski | statement, witness, public inputs, seven clauses composed from 001 · 003 · 004 · 005 · 006 · 007, disclosure set, negative space, three adversary claims, horizon, ten rejection codes, four options (the reference code named, unmeasured); written from the chair's ask, the Phase 4 flow and record 010's sibling statement — the constructor's own figures are the next evidence |

Revisions within a state:

| date | by | note |
|---|---|---|
| 2026-09-23 | mitchuski | doesNotEstablish line added from the formal model: no clause excludes a self-vouch by an applicant who is already a member; the refusal is placed on the admission check; no state change |
| 2026-09-23 | mitchuski | formal model built (Lean, composed from the gadget library); no state change |
| 2026-09-29 | mitchuski | PR #11 inline review (DenisPopov15, 28 Sept): options 0 and 3 folded into one blind-signature option that points to record 024; new does-not-establish line for the 007 bypass under that route; figures unchanged (none recorded). State unchanged. |

#### Formal verification

*A machine-checked model of this record. It proves the listed properties of the abstract relation or policy model; it is not evidence of the construction's cryptography — the hypotheses name what remains to discharge against the construction. It confers no evidence state.*

- system: Lean 4.33.1, core library only (no Mathlib); axiom footprint within propext, Classical.choice and Quot.sound — no sorry, no added axiom
- location: formal/Formal/R023/Soundness.lean (with Model.lean, NegativeSpace.lean) in the evidence repository (uncommitted at this revision)
- reproduce: sh formal/scripts/check-axioms.sh — builds, prints each theorem's axiom footprint, fails on sorry or a non-standard axiom
- statement: Formal.R023.Statement — at least k pairwise-distinct members, each with its grant leaf in the membership tree and its handle unrevoked, each linked through one controller to a VRC whose subject is the applicant's admission identifier or opens to it
- scope: clauses 1–6 as a counting model; clause 7 (transcript) is record 003's; consent, invitation, identity check and admission are outside any clause

| theorem | proves |
|---|---|
| `Formal.R023.soundness` | the verifier's relation (clauses 1–6 as gadget relations) establishes the statement, through record 001's path_sound, record 005's distinct-leaves lemma and record 006's neighbours_sound |
| `Formal.R023.no_vrc_no_statement` | does-not-establish 8: an admission path that issues no VRC can never satisfy the statement, for any k ≥ 1 |
| `Formal.R023.self_vouch_counted` | does-not-establish 3: an applicant who is already a member vouches for itself through its own grant — the relation accepts k = 2 and the statement holds |

| hypothesis | carries |
|---|---|
| H-sig | clause 1: a verifying VRC is one a member issued |
| H-leaf, H-node, H-domain (record 001) | the membership tree's hashes are collision-free and leaves and nodes are hashed under separate domains |
| H-sorted (record 006) | the revocation root is committed over strictly sorted handles |
| H-com (record 007) | the identifier derivation binds (secret, salt) |


### Construction 024 · Hidden-vetting admission — an applicant proves k attestations from pairwise-distinct eligible vetters of the issuing community, without disclosing which vetters

*This record is at state `constructed`: a runtime exists and has measured at least one construction option; no independent party has reproduced it. Informative.*

| | |
|---|---|
| kind | composed |
| state | `constructed` |
| priority | P1 |
| constructor | mitchuski |
| requested by | specified and constructed by the ZKP TF co-chair |
| request | zkp-spec PR #11 (ScottJeezey 2026-09-21, Round 1 position, 'Build'): the admission proof being built for the Linux Plumbers integration · trust-tasks-tf `vtc/join-requests/manifest/0.2`: `vetting.ext` / `vetting.extCritical`, with `org.openvtc.hidden-vetting` as the example namespace of a criterion that must not receive named statements · general #31 (stormer78 2026-08-26): the Phase 4 join, whose identity check is the vetting step |

**Composes:** [001](#construction-001-%C2%B7-set-membership-over-an-accredited-root) ∧ [002](#construction-002-%C2%B7-scoped-nullifier-(reuse-detection)) ∧ [003](#construction-003-%C2%B7-transcript-binding) ∧ [004](#construction-004-%C2%B7-holder-binding-(key-from-secret)) ∧ [005](#construction-005-%C2%B7-distinct-member-%2F-distinct-issuer) — a [[ref: composed construction]]: one transcript, one [[ref: disclosure set]], written fresh.

#### Statement

The issuing community learns that k pairwise-distinct eligible vetters of the live period each attested this applicant's per-application identifier with the stated facts, without learning which of its vetters attested, any vetter's DID, or whether a vetter has attested for anyone else.

**Need.** the identity-vetting step of a community's join: the criterion needs k statements from distinct eligible vetters, and a community running hidden vetting counts them without learning which of its vetters made them — so no vetter's DID reaches the community

#### Witness

*Never leaves the holder.*

- for each attesting vetter: its secret and the evidence that it is an eligible vetter of the live period (in the Groth16 route, the opening of its enrolled commitment and its Merkle path)
- for each attestation: the profile-specific spend witness — either a secret-derived slot within the cap, or a valid blind-issued token and its opening
- the applicant's per-application secret, from which the attested identifier derives

#### Public inputs

- the community, eligible-vetter set commitment and live period, plus the selected cap profile and its parameters: per-vetter quota or aggregate token budget for a defined vetter set and accounting interval
- k — the criterion's `minStatements`, with its per-method floors and independence caps
- the requirements digest of the criterion version the applicant started under
- the applicant's per-application identifier and join DID — disclosed by construction, since the applicant is applying
- the challenge — minted by the community for this applicant and spent when the proof is counted
- transcriptDigest over the challenge, the requirements digest, the join DID and every attestation's public values

#### Relation

1. each attester is an eligible vetter of the live period, proven without its identifier — [[ref: set-membership]] ([[ref: construction record]] 001, [Set membership over an accredited root](#construction-001-%C2%B7-set-membership-over-an-accredited-root)) · runtime `runtimes/circom-gadget/circuits/vetting_attest.circom`
2. each attestation carries a tag derived from its vetter's secret and the applicant's identifier — deterministic for one vetter and one applicant, unlinkable across applicants, and not recomputable from anything public — [[ref: nullifier]] ([[ref: construction record]] 002, [Scoped nullifier (reuse detection)](#construction-002-%C2%B7-scoped-nullifier-(reuse-detection))) · runtime `runtimes/circom-gadget/circuits/vetting_attest.circom`
3. the k tags are pairwise distinct, so one vetter attesting twice counts once — [[ref: distinctness]] ([[ref: construction record]] 005, [Distinct member / distinct issuer](#construction-005-%C2%B7-distinct-member-%2F-distinct-issuer)) · runtime `runtimes/circom-gadget/harness-vetting.mjs`
4. each attestation consumes an authorized serial in the declared community, profile and accounting interval; the same spend cannot increase the count twice. A profile may derive serials from a stable vetter secret with bounded slots, or use blind-issued transferable tokens under an aggregate issuance budget. A conflicting reuse is refused; a profile may acknowledge an identical resubmission without adding a counted attestation — [[ref: nullifier]] ([[ref: construction record]] 002, [Scoped nullifier (reuse detection)](#construction-002-%C2%B7-scoped-nullifier-(reuse-detection))) · runtime `runtimes/circom-gadget/circuits/vetting_attest.circom`
5. the attested identifier derives from the applicant's per-application secret, which the applicant holds — [[ref: key-binding]] ([[ref: construction record]] 004, [Holder binding (key from secret)](#construction-004-%C2%B7-holder-binding-(key-from-secret))) · runtime `runtimes/circom-gadget/circuits/vetting_bind.circom`
6. the submission is bound to transcriptDigest — the community's challenge, the requirements digest, the join DID and every attestation's public values — [[ref: transcript-bind]] ([[ref: construction record]] 003, [Transcript binding](#construction-003-%C2%B7-transcript-binding)) · runtime `runtimes/circom-gadget/circuits/vetting_bind.circom`
7. no attester is the applicant — [[ref: distinctness]] ([[ref: construction record]] 005, [Distinct member / distinct issuer](#construction-005-%C2%B7-distinct-member-%2F-distinct-issuer))

#### Disclosure set

- the outcome (k distinct eligible vetters attested this applicant / not shown)
- k tags — one per attestation, standing in the community's counting facts where a vetter DID stands on the named path
- per statement: the facts the community's counting rule reads (method, verified claim types, validity window, identity commitment)
- serials and their declared spend scope, checked against the community ledger; a profile defines whether identical resubmissions are refused or acknowledged without increasing the count
- the vetter-set commitment, period, selected cap profile and accounting parameters; the requirements digest, join DID, challenge and transcriptDigest

#### Does not establish

- that the k attesters are k distinct people — distinct tags mean distinct vetter secrets; a vetter who hands its secret to another lets one person attest under two tags
- that a transferable-token budget limits each vetter: vetters can pool tokens. A per-vetter quota requires a profile that binds authorized spends to a stable enrolled secret and bounds slots, or another construction demonstrating equivalent enforcement. Neither profile bounds distinct people or prevents sharing a secret (DG-024-4)
- that no attester is the applicant, in the Groth16 route — clause 7 is not built there; it holds only while applicants are outside the vetter set
- that the vetting session happened as attested — the vetter's check of the person is outside the proof, as on the named path
- anything to a party other than the issuing community — it keeps the vetter set and verifies the proof; no third party can audit that admission followed the criterion
- that the applicant is admitted — verifying the proof, counting it under policy and issuing the membership grant are three acts (WG-04)
- any relationship between the applicant and the vetters — no relationship credential (VRC) is involved; a policy requiring a VRC pair with the vetters would disclose what this proof withholds
- that proof acceptance enforces the complete admission policy: per-method floors, independence caps, statement validity and eligibility checks belong to the named policy evaluator. The lab harness checks total tag count and returns method facts; it does not implement the complete evaluator
- that sequential replay tests establish concurrent or durable single-use behavior: the ledger must atomically prevent additional counting across requests, retries and restarts; the current asynchronous lab harness requires further review
- the size of the anonymity set under an event label: a spend under `event-mode` narrows 'some vetter in this community' to 'some vetter at this event'; the framework's three mitigations — group floor, expiry, an `eventId` that names a gathering — are all MUST for the consumer (trust-tasks-tf PR #620) and bound that narrowing; the proof does not
- a commitment in the applicant's identifier — the PCS binds voucher and attestation linkage to an enrolment secret inside the credential system, not to a DID verification-method commitment; component 007 (WG-14) is bypassed by this route, and a community admitting over it gets no 007 property (PR #11 review, 2026-09-28)

#### Adversary, per claim

- **verifier · issuer-verifier-colluding** — the community learns which of its eligible vetters attested no better than chance over the vetter set, less whatever the disclosed per-statement facts narrow that set
- **verifier** — one vetter's attestations for two applicants cannot be linked through their tags or serials

#### Horizon

- earliest of: the vetter-set period · the vetter-set commitment in force (a vetter removed from the set cannot attest under the new commitment) · each statement's validity and the criterion's `maxStatementAge` · the requirements digest's `requirementsGrace`
- the challenge — single use: spent when the proof is counted, so an applicant answering `requestMore` obtains a fresh challenge
- under an event label, the event's expiry — tokens live and die with their label, so an event's stockpile cannot be spent under the monthly key (trust-tasks-tf PR #620)

*Quantum horizon* — read against Security Considerations item 8:

- forgery: option 1 (PCS: Σ-PS credential base, Tag_DDH, Schnorr proofs over BLS12-381) falls entirely — a quantum vetter forges credentials and opens its tag to any value, so once-per-tick counting stops holding; option 3 (the lab's hash-based vetting_attest and vetting_bind) holds on the hash side and falls only with Groth16's soundness, which a hash-based prover removes; option 2 (vetters named) falls with the vetters' signatures
- confidentiality: option 1: harvested tags become linkable to vetter keys once DDH falls; options 2 and 3: none

#### Conformance fixtures

Families: `accepts` · `rejects-unsat` · `rejects-verify` · `unlinkable` · `current`

Rejection codes: `tag-duplicate (two attestations from one vetter)`, `token-serial-spent (conflicting or additional counted reuse; the lab profile refuses every repeat)`, `vetter-not-enrolled (unsat)`, `vetter-cap-exceeded (secret-derived profile only: a slot at or above the cap)`, `vetter-root-stale (verify: an attestation made under a replaced vetter-set commitment)`, `statement-metadata-mismatch (verify)`, `requirements-digest-mismatch (verify)`, `join-did-mismatch (verify: an attestation made for another applicant)`, `binding-proof-invalid (unsat: a binding made without the applicant secret)`, `challenge-replayed (verify)`, `challenge-not-minted (verify)`, `attestation-count-below-k`, `unsupported-extension (the criterion's `extCritical` names a namespace the client does not implement: it stops before gathering named statements)`

#### Construction options

*Candidate constructions, each evaluated against the construction-selection criteria ([DTG-ZKP-REQ] §16.1), with its cost as measured or as conjectured.*

| construction | cost | status | source |
|---|---|---|---|
| the construction the chair named on PR #11 for the Linux Plumbers integration (Berkeley, with Glenn Gore integrating) — the Predicate Credential System (PCS): Σ-PS (Pointcheval–Sanders) credential base with the key-injective PRF Tag_DDH over BLS12-381, generalized Schnorr proofs under strong Fiat–Shamir; the applicant proves it holds attestations from k pairwise-distinct credentialed vetters, none of them itself, and receives a credential. SOURCE PUBLIC since 2026-09-28: OpenVTC/predicate-credential-system (MIT, arkworks 0.6, research artifact, not audited) at main 4f4edf5 — crate plus the demo pcs-vetting-prototype (Σ-PS + Tag_DDH; end-to-end tests: admission from two hidden vetters with no member id or vetter id in the facts; requestMore then resubmission counts once; one vetter counts once across submissions; a double-spent token does not count and the VTC cannot name anyone). Its five Trust Tasks are public (issuance lines; trust-tasks-tf PR #618/#620, 2026-09-23). Under this route the attestation linkage is bound to the vetter secret usk inside the credential system, not to a DID verification-method commitment (component 007 bypassed — see does-not-establish) | constructor-reported, from the repository README and asserted by its tests (fixed-format encoding over BLS12-381, not measured here): Σ-PS attestation 240 B, proof 1,392 B at k = 5, credential 96 B; Σ-BBS 416 / 2,272 / 112 B; Σ-EQ 480 / 2,512 / 192 B. Running times: criterion benches exist (benches/pcs.rs at k = 5) but no figures are published in the repository; the ~12 ms prove-and-verify quoted in review is unsourced here and is not recorded | unmeasured | OpenVTC/predicate-credential-system main 4f4edf5 (2026-09-28: import, demo, CI) — README §Instantiations, docs/testing-and-benchmarks.md, demo/README.md · zkp-spec PR #11 (ScottJeezey 2026-09-21) · trust-tasks-tf PR #618 and PR #620 (stormer78 2026-09-23) · OpenVTC/governance PR #25 (2026-09-24) · zkp-spec PR #11 inline review (DenisPopov15 2026-09-28/29: options 0 and 3 of record 023 are this construction; a local run of a reference flow confirmed, on a commit not on any public branch, so the record pins the public main) |
| vetters named — the named path: each vetter issues a signed vetting statement and the community counts vetter DIDs. No proof; the privacy claims above do not apply | zero | unmeasured | trust-tasks-tf `vtc/join-requests/manifest/0.2` (VettingRequirements) |
| Groth16 / BN254 / Poseidon (lab) — each vetter proves its own attestation (vetting_attest: leaf of the vetter-set root, tag = Poseidon(tag, secret, applicantId), serial = Poseidon(tag, secret, period, slot) with slot < cap, statement bound) and the applicant proves one binding (vetting_bind: applicantId from the applicant secret, transcript over the challenge, requirements digest, join DID and every attestation). The tag must come from the vetter's secret — a tag derived from anything public the community could recompute for every vetter — and the applicant does not hold vetters' secrets, so the route takes k + 1 proofs. Removing one vetter is a new root with nobody re-enrolled; the cap is per vetter and in-circuit, with no token issuance; tag distinctness is checked by the community over the public tags; clause 7 is not built | vetting_attest 5,677 constraints, vetting_bind 238 (--O2); one attestation proof ~813 ms, made by each vetter at its own time, the binding ~123 ms (snarkjs/wasm, Node 22, win32/x64); community verification at k = 5 ~110 ms; submission at k = 5 1,376 B with compressed points (2,144 B uncompressed), computed from point sizes, 7,009 B as snarkjs JSON; lab-only trusted setup (one contributor, fixed entropy) | **measured** | evidence repository runtimes/circom-gadget/test-vetting.mjs, run 2026-09-23 — H1–H12 12/12 |

#### Issuance requirements

- the community publishes the eligible-vetter set, live-period policy and selected cap profile. A secret-derived profile specifies a stable enrolled secret and bounded slots per accounting interval. A transferable-token profile specifies the exact vetter set, total issuance budget, quota/tick rules, token expiry and carry-over treatment; it does not imply a cap on each holder
- the criterion publishes its parameters under `vetting.ext` in a namespace the community controls and names that namespace in `vetting.extCritical` (trust-tasks-tf `vtc/join-requests/manifest/0.2`), so a client that does not implement it refuses instead of gathering named statements
- the community mints a challenge per applicant, keeps it, and spends it when the proof is counted — the wire is `vtc/vetting/pcs-challenge/0.1` (trust-tasks-tf PR #618, merged 2026-09-23): the challenge is 16 bytes as lowercase hex, compared for equality and never parsed; at most one open challenge per applicant (asking again replaces it); an `expiresAt`; spent when the proof is counted; a community that publishes no hidden-vetting criterion answers `notHiddenVetting`; the request carries a proof so no one consumes another applicant's open challenge
- no signed vetting statement and no relationship credential is issued on this path
- the requirements digest binds the cap profile, community, accounting interval and policy parameters. Define the serial namespace and identity of an identical spend; ledger updates and counting must be atomic and durable. An acknowledged retry adds neither a spend nor an attestation, and does not reuse a consumed challenge
- name the admission policy evaluator and version: it applies per-method floors, independence caps, validity and eligibility rules to verified facts before a separate issuance decision. Assign these checks explicitly when the proof harness does not implement them
- the vetter side of option 1 has a public wire (trust-tasks-tf PR #618 and PR #620, merged 2026-09-23): `vtc/vetting/vetters/pcs-root/0.1` — enrolment for a class label; the community checks a live vetter grant, no credential under this label yet and the identifier this member was bound to, then signs a commitment it cannot open · `vtc/vetting/vetters/pcs-tokens/0.1` — one tick of an unconditional token drip at the community's published rate (a fetch that happened only when someone was busy would announce that they were busy; the quota is the community's to refuse) · `vetting/attestation/0.1` — vetter to applicant, the facts of the session with no issuer; `identifierScope: any`; the applicant MUST NOT record the delivering `issuer` beside it; dates, not timestamps, on the validity window · `vtc/vetting/vetters/event-mode/0.1` — a separate token label for a named event with its own rate, expiry and a group floor, requested by the vetter and approved by someone else (no Trust Task for the approval, by design). These are the framework's obligations behind clauses 2–5 and the challenge; the proof reads their outputs as witness and adds nothing to their semantics
- DID-rooted enrolment (WG-17): where a vetter's or an applicant's enrolment secret is to be bound to a DID, the binding is made once, at enrolment — the enrolling party proves the secret is the one behind the commitment verification method of its DID document (record 007's relation, run against that document version). Signing-key rotations then leave the vetter-set commitment untouched; a vetter's secret rotation takes effect at the next vetter-set period, which this record's horizon already bounds; a hidden enrolment that must survive a secret rotation inside a period is record 025's

#### Provenance

- zkp-spec PR #11 (ScottJeezey 2026-09-21): the admission proof for the Linux Plumbers integration; record 023 is the vouch-shaped statement specified from that ask
- trust-tasks-tf `vtc/join-requests/manifest/0.2`: `VettingRequirements` (`minStatements`, `minByMethod`, `eligibleVetters.role`, `independence`), `ext` and `extCritical`
- general #31 (stormer78 2026-08-26): the Phase 4 join — invite, vouches, identity check
- record 023 — the sibling admission statement over member-issued relationship credentials
- trust-tasks-tf PR #618 (stormer78 2026-09-23, merged): 'the four tasks hidden-vetter admission needs' — pcs-root, pcs-tokens, vetting/attestation, pcs-challenge; three decisions for review: the drip is unconditional; `vetting/attestation` declares `identifierScope: any` and a consumer MUST NOT record the delivering issuer beside it; dates not timestamps on the attested validity window. 'Implemented against these schemas in both halves of a VTC deployment'
- trust-tasks-tf PR #620 (stormer78 2026-09-23, merged): `vtc/vetting/vetters/event-mode/0.1` — not self-service, not a bigger number under the same key, not free; the response carries a count (`groupSize`, `groupFloor`), never a group
- trust-tasks-tf PR #603 (2026-09-22, merged): `vtc/vetting/vetters/show/0.1` — by-DID vetter status (`live`/`revoked`/`expired`/`none`, `listed`); the answer is not evidence and costs the same whatever the status; the spec half of OpenVTC VTI #1651
- OpenVTC/governance PR #25 (stormer78 2026-09-24) 'adding PCS' → `OpenVTC/predicate-credential-system` (public; README only at `e6a7bd3`)
- OpenVTC/predicate-credential-system main 4f4edf5 (2026-09-28): the PCS source, MIT, with sizes asserted by tests and the pcs-vetting-prototype demo — option 1 now names a revision; figures are constructor-reported until a run on independent hardware (state stays constructed)
- cred-spec PR #70 (merged 2026-09-30) with dtgwg-vsc-registry PR #19: the identity-vetting statement profile is published as the registry predicate `https://registry.trustoverip.org/dtg/vsc/vetted/1` (normative there, the specification's worked example informative); values in lowerCamelCase; `attestationTextDigest` optional. trust-tasks-tf PR #691 (stormer78 2026-09-30, draft): on the named-statement path the Vetting Statement becomes a `StatementCredential` under that predicate, vetter eligibility a community-issued authority credential (`actions: ["role:vetter"]`, `maxAttenuation: 0`), and `eligibleVetters.role` is matched as `role:<role>`. This record's path issues no signed statement; what it reads from that change is the eligible-vetter set, whose source credential changes type, not meaning
- commit: github.com/mitchuski/dtgwg-zkp-mage

#### Record history

| date | to | by | evidence |
|---|---|---|---|
| 2026-09-23 | `specified` | mitchuski | statement, witness, public inputs, seven clauses composed from 001 · 002 · 003 · 004 · 005, disclosure set, negative space, two adversary claims, horizon, rejection codes, three options — from the chair's ask and the trust-tasks vetting requirements |
| 2026-09-23 | `constructed` | mitchuski | Groth16 route built in the evidence repository's lab (vetting_attest + vetting_bind + the community's admission check), H1–H12 12/12; clauses 1–6 carry runtimes, clause 7 is not built |

Revisions within a state:

| date | by | note |
|---|---|---|
| 2026-09-23 | mitchuski | clause 4 loosened to admit blind, transferable serials capped per vetter set, alongside serials derived from the vetter's secret; doesNotEstablish line added for the per-vetter cap (decision gate DG-024-4, zkbook/DECISION-024-clause4.md); no state change |
| 2026-09-23 | mitchuski | Local draft: align witness, public inputs, disclosure, issuance and fixtures with the two cap profiles; distinguish idempotent acknowledgement from double counting and identify external policy and atomic-ledger obligations. No state promotion or task-force adoption; no new runtime or formal conformance claim. |
| 2026-09-23 | mitchuski | formal model built (Lean, composed from the gadget library); no state change |
| 2026-09-27 | mitchuski | the framework side of option 1 landed in public: five Trust Tasks (pcs-root, pcs-tokens, vetting/attestation, pcs-challenge, event-mode; trust-tasks-tf PR #618/#620, 2026-09-23) and a public OpenVTC repository for the PCS (README only). Issuance lines carry the wire; the challenge line carries its shape; a does-not-establish line and a horizon line for the event-label anonymity set; option 1 renamed to what it is. No figures yet; state unchanged. |
| 2026-09-29 | mitchuski | PR #11 inline review on 023 (DenisPopov15, 28 Sept) read across: does-not-establish line for the 007 bypass under option 1; 023's blind-signature rows now point here. Figures still held. State unchanged. |
| 2026-09-29 | mitchuski | PCS source public at OpenVTC/predicate-credential-system 4f4edf5 (28 Sept): option 1 pinned to that revision with the README sizes (1,392 B proof at k = 5) as constructor-reported, running times not recorded; provenance line. State unchanged (constructed, unmeasured). |
| 2026-09-30 | mitchuski | the named-statement path beside this record moved to registry predicates (cred-spec PR #70, registry `vetted/1`; trust-tasks-tf PR #691 in draft): the eligible-vetter set is derived from community-issued authority credentials rather than role endorsements. Provenance only; no clause, option or figure changes. State unchanged. |
| 2026-10-02 | mitchuski | an issuance line for DID-rooted enrolment (task-force discussion of 2 October; DenisPopov15's 28 September point that the PCS secret is set at enrolment with no DID verification-method commitment): the binding is an enrolment-time act, rotation lands at the period boundary, record 025 for rotation inside a period. No clause, option or figure changes. State unchanged. |

#### Formal verification

*A machine-checked model of this record. It proves the listed properties of the abstract relation or policy model; it is not evidence of the construction's cryptography — the hypotheses name what remains to discharge against the construction. It confers no evidence state.*

- system: Lean 4.33.1, core library only (no Mathlib); axiom footprint within propext, Classical.choice and Quot.sound — no sorry, no added axiom
- location: formal/Formal/R024/Soundness.lean (with Model.lean, SingleUse.lean, NegativeSpace.lean) in the evidence repository (uncommitted at this revision)
- reproduce: sh formal/scripts/check-axioms.sh — builds, prints each theorem's axiom footprint, fails on sorry or a non-standard axiom
- statement: Formal.R024.Statement, read for a class-credential construction — at least k pairwise-distinct members, none the applicant, each holding a credential under a live label whose tag on the applicant's identifier is among those counted
- scope: the counting rule and the single-use rules over abstract primitives; not the construction's cryptography, unlinkability or the adversary claims; per-vetter cap attribution (DG-024-4) is not modelled

| theorem | proves |
|---|---|
| `Formal.R024.soundness` | if the counting rule accepts (tags extractable, pairwise distinct, at least k), the statement holds — through record 005's owners_distinct with record 002's tag as the value |
| `Formal.R024.completeness` | k pairwise-distinct honest vetters give k pairwise-distinct tags — clause 3 does not over-collapse |
| `Formal.Gadgets.run_once` | clause 4 and the challenge: over any run of presentations a spent value is counted at most once |
| `Formal.R024.not_minted_refused` | a challenge the community did not issue is refused |
| `Formal.R024.batch_over_cap_refused` | an issuance batch over the cap is refused (DG-024-4: both cap profiles share this) |
| `Formal.R024.distinct_members_not_distinct_people` | does-not-establish 1: one person holding two memberships — the rule accepts and the statement holds |
| `Formal.R024.rekey_counts_twice` | where one proof mixes periods, a vetter whose secret changes between them counts twice: the secret must be stable across periods |

| hypothesis | carries |
|---|---|
| H-Σ (Extractable) | clauses 1, 2 and 7: soundness of the construction's proof — every accepted tag comes from a credential issued under a live label, not under the applicant's key |
| H-stable (SecretStable) | a vetter's secret is one across periods, where a proof mixes them |
| H-applicant (ApplicantSecret) | an applicant holding a credential holds it over its own key; vacuous for one holding none |
| H-fresh, H-tag | completeness only: two members never share a secret; tags do not collide for one applicant |


### Construction 025 · Secret rotation with enrolment continuity — a member replaces the secret behind its enrolment with the one it pre-committed, retiring the old enrolment without disclosing which it was

*This record is at state `specified`: it is written and validates; no runtime has measured it. Costs marked conjecture are conjecture (drafting rule 4). Informative.*

| | |
|---|---|
| kind | composed |
| state | `specified` |
| priority | P2 |
| constructor | mitchuski |
| requested by | ScottJeezey (chair, task-force discussion, 2026-10-02) — specified by the ZKP TF co-chair |
| request | the chair's question on the admission proof and DIDs (task-force discussion, 2026-10-02): whether the admission proof starts from a DID, and what a DID as the starting point would need — DIDs let a controller keep several identifiers and rotate keys over time, while the proofs are rooted in a holder secret · record 007's horizon (a rotation restarts the co-control clause) · zkp-spec PR #11 inline review on record 023 (DenisPopov15, 2026-09-28): the PCS secret is set at enrolment and no DID verification-method commitment is involved |

**Composes:** [001](#construction-001-%C2%B7-set-membership-over-an-accredited-root) ∧ [002](#construction-002-%C2%B7-scoped-nullifier-(reuse-detection)) ∧ [003](#construction-003-%C2%B7-transcript-binding) ∧ [006](#construction-006-%C2%B7-non-revocation-against-a-status-root) — a [[ref: composed construction]]: one transcript, one [[ref: disclosure set]], written fresh.

#### Statement

The issuing community learns that the presenter holds the secret behind an unrevoked enrolment leaf under its current membership root, that this leaf pre-committed to the replacement leaf now presented, and the rotation tag of that secret — so the community can retire the old secret by its tag and admit the replacement leaf, without learning which leaf rotated or linking the replacement to it.

**Need.** an enrolment rooted in a holder secret must outlive the loss or compromise of that secret, as a DID outlives a key rotation: the member keeps its standing, the old secret stops presenting, and — where the community must not know which enrolment is whose — the community learns neither which enrolment rotated nor a link between the old leaf and the new one

#### Witness

*Never leaves the holder.*

- the current secret s and the enrolment leaf L = Com(s, N; r) it opens, where N = H(L′) is the pre-rotation digest committed when L was minted
- the Merkle path of L to root_C
- the non-revocation witness of L's membership handle under rl_root at the epoch

#### Public inputs

- root_C and rl_root at a stated epoch — the community's membership and revocation roots
- the replacement leaf L′ = Com(s′, N′; r′), as the holder minted it — the next secret s′ and the next pre-rotation digest N′ stay inside it
- the rotation tag t, compared by the community against its spent-tag set in the clear
- transcriptDigest — the rotation request this proof is bound to

#### Relation

1. L opens to (s, N; r) and is a leaf under root_C — [[ref: set-membership]] ([[ref: construction record]] 001, [Set membership over an accredited root](#construction-001-%C2%B7-set-membership-over-an-accredited-root))
2. L's membership handle is not revoked under rl_root at the epoch — a member removed by the community cannot rotate into a fresh leaf — [[ref: non-revocation]] ([[ref: construction record]] 006, [Non-revocation against a status root](#construction-006-%C2%B7-non-revocation-against-a-status-root))
3. H(L′) = N: the replacement presented is the one L pre-committed — any other replacement is unsatisfiable, so a party holding a stolen s can move the enrolment only to the leaf the member chose, whose secret it does not hold — [[ref: commitment-open]]
4. t = PRF(s; rotation context ‖ community): one tag per secret per community, so a second rotation from the same secret repeats t and is refused — [[ref: nullifier]] ([[ref: construction record]] 002, [Scoped nullifier (reuse detection)](#construction-002-%C2%B7-scoped-nullifier-(reuse-detection)))
5. the proof is bound to this rotation request's transcriptDigest — [[ref: transcript-bind]] ([[ref: construction record]] 003, [Transcript binding](#construction-003-%C2%B7-transcript-binding))

#### Disclosure set

- the outcome (rotation admitted / not shown)
- the rotation tag t — added to the community's spent-tag set
- the replacement leaf L′ — appended at the next root
- root_C, rl_root and the epoch
- transcriptDigest

#### Does not establish

- that the presenter is the member who enrolled: anyone holding s can rotate. Pre-rotation limits a thief to moving the enrolment to the replacement the member committed, which the thief cannot open; it does not stop the thief presenting under s until the rotation lands
- that the holder can open L′ — the replacement is accepted as committed; a member who loses s′ as well has no route but re-enrolment
- that the old secret stops presenting: that holds only where the enclosing presentation records prove the leaf's rotation tag absent from the community's spent-tag set (issuance)
- uniqueness within one context across the rotation: per-context nullifiers (record 002) derive from the secret, so a context whose epoch spans the rotation can see one nullifier from s and one from s′. The default closes this by making a rotation take effect from the next context epoch (issuance); nullifiers derived from a value the leaf carries forward are the alternative left to WG-17
- unlinkability against timing and counts: the spent-tag set shows how many rotations a community has admitted, and a rotation admitted alone in its epoch is identifiable by its timing. The old leaf is hidden among the leaves under root_C, and a replacement among the replacements admitted in the same batch — the anonymity set is that batch (issuance)
- any relationship to a DID — the leaf may be bound to a DID's commitment verification method at enrolment or to none; this record reads the leaf only
- rotation of a public identifier: where the community may know which DID is enrolled, rotation is the DID method's (a pre-rotation digest in a did:webvh log or a KERI event log) and needs no proof (option 3)
- unlinkability of a DID-bound enrolment's rotation, read across the layers together: where the leaf's secret is bound to the commitment verification method of a public DID, a secret rotation also changes that commitment in the public DID log. A community that saw the DID at enrolment can match the log entry to the rotation and link L, L′ and the DID. The claim against the registry operator above does not hold for such an enrolment unless the two updates are decorrelated — the DID log change and the leaf rotation published in different epochs, the leaf rotation inside a batch — or the rotation is accepted as public (option 3)
- unlinkability across communities that hold one binding: an enrolment bound to the same DID commitment in several communities lets those communities link the memberships through that commitment. Binding to an identifier used with one community only, or to a community-scoped commitment Com(PRF(s, community)), keeps each binding to its community (Integration §Rotation under the identifier commitment profile)

#### Adversary, per claim

- **registry-operator · verifier** — for an enrolment not bound to a public DID, the community operating the roots learns which secret rotated only as its tag t — not which leaf under root_C, and not a link from L′ to L beyond the batch the rotation was admitted in
- **verifiers-colluding** — verifiers comparing per-context nullifiers from before and after a rotation learn no link between them: t is scoped to the rotation context, which no presentation context shares

#### Horizon

- one rotation per pre-rotation digest — L′ carries N′, which the next rotation spends
- the root epoch: the replacement leaf presents once the community publishes a root containing it, and the old secret stops presenting once the spent-tag set the enclosing records read contains t
- the commitment, hash and PRF cryptoperiod

*Quantum horizon* — read against Security Considerations item 8:

- forgery: none inside the relation: Poseidon commitments, a Poseidon PRF and hash membership hold; the DID method's own rotation (option 3) is as strong as its signature suite; a pre-rotation digest is a hash and holds
- confidentiality: none

#### Conformance fixtures

Families: `accepts` · `rejects-unsat` · `rejects-verify` · `unlinkable`

Rejection codes: `replacement-not-precommitted (unsat: H(L′) ≠ N)`, `leaf-revoked (unsat: the enrolment's membership handle is revoked under rl_root)`, `rotation-tag-spent (verify-fail: t is already in the community's spent-tag set — a second rotation from one secret)`

#### Construction options

*Candidate constructions, each evaluated against the construction-selection criteria ([DTG-ZKP-REQ] §16.1), with its cost as measured or as conjectured.*

| construction | cost | status | source |
|---|---|---|---|
| Poseidon commitments and a Poseidon PRF inside the membership circuit — the lab's set-membership and scoped-nullifier gadgets (records 001, 002) with one added hash opening for N | a membership proof plus one hash and one PRF evaluation — of the order of the lab's runtime 01–03 membership circuit (conjecture for this record, not measured) | unmeasured | evidence repository runtimes 01–03 (Poseidon-Merkle membership, scoped nullifier) |
| pre-rotation as KERI specifies it for key event logs — an inception or rotation event commits the digest of the next key set, which only a later rotation reveals — applied to the enrolment leaf, so the same discipline holds for an enrolment the community must not identify | as option 1; this option names the discipline, not a separate circuit | unmeasured | Trust over IP KERI specification (pre-rotation); did:webvh specification (`nextKeyHashes`) |
| no proof — public identifiers: the DID method's own rotation (a did:webvh log entry honouring `nextKeyHashes`, or a KERI rotation event) carries the commitment verification method forward or replaces it, and the community re-reads the DID document. Usable where the community may know which DID is enrolled — the vetters of record 024, a public organisation | zero constraints; the cost is the identifier's public enrolment | unmeasured | did:webvh specification; Integration §Rotation under the identifier commitment profile |

#### Issuance requirements

- under a rotation-capable profile every enrolment leaf carries a pre-rotation digest N; a leaf minted without one cannot rotate under this record, and its member re-enrols
- the presentation and admission records that read an enrolment leaf (010, 023, 024) gain one non-revocation clause under a rotation-capable profile: the leaf's rotation tag is absent from the community's spent-tag set at the epoch. Without it a rotated-away secret still presents
- the rotation context string is fixed by the profile and differs from every presentation context, so a rotation tag never equals a presentation nullifier
- where the leaf is bound to a DID, the binding is made once, at enrolment: the applicant proves that the leaf's secret s is the secret behind the commitment verification method of its DID document (record 007's relation, run against that DID document version). Signing-key rotations of the DID then leave the leaf untouched; only a change of the secret runs this record (Integration §Rotation under the identifier commitment profile)
- rotations are admitted in batches at the root epoch: the community collects rotation requests, appends their replacement leaves together and publishes the spent tags together, and states the batch size it waits for; a rotation is not admitted alone unless the member accepts the timing linkage
- default for per-context nullifiers: a rotation admitted at an epoch takes effect in each presentation context from that context's next epoch — presentations under s′ in a context are accepted only after the context epoch in which s was last usable has closed (WG-17 may replace this with nullifiers carried forward by the leaf)

#### Provenance

- task-force discussion of the admission proof (2026-10-02): the chair's question whether the admission proof starts from a DID, and key rotation over time as what DIDs give that secret-rooted proofs lack
- Integration §Identifier commitment profile and WG-14: the commitment lives in the DID document as a verification method
- record 007 horizon: a rotation restarts the co-control clause under a derived-key profile
- zkp-spec PR #11 inline review on record 023 (DenisPopov15, 2026-09-28): the PCS secret is set at enrolment, with no DID verification-method commitment
- Trust over IP KERI specification — pre-rotation of the next key-set digest
- did:webvh specification — `nextKeyHashes` pre-rotation in the DID log
- commit: github.com/mitchuski/dtgwg-zkp-mage

#### Record history

| date | to | by | evidence |
|---|---|---|---|
| 2026-10-02 | `requested` | ScottJeezey (chair, task-force discussion) | the chair's question on a DID as the starting point of the admission proof: DIDs carry several identifiers and key rotation; the proofs are rooted in a holder secret |
| 2026-10-02 | `specified` | mitchuski | statement, witness, public inputs and five clauses bound to the lab gadget set (membership, non-revocation, a pre-rotation opening, a rotation tag, transcript binding); three options including the no-proof DID-method route for public identifiers; the enclosing records' spent-tag clause stated as an issuance line; the cross-rotation nullifier question left open as WG-17; privacy read across the DID log, the enrolment root and the presentations together: the registry-operator claim scoped to enrolments not bound to a public DID, batching and the next-epoch nullifier default stated as issuance lines, cross-community binding named |

