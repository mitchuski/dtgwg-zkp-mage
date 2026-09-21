## Construction Records

This section is informative in this Working Draft: every record below is at state `specified` or `constructed`. Evidence maturity is printed at the head of each record. Normative adoption is a separate task-force decision; reproduction or publication alone does not confer it.

This section is generated from the machine-readable records in `conformance/records/`. Changes are made to a record, never to this text; a record that fails validation does not render. Each record states its adversary, its horizon and what it does not establish, and labels conjecture as conjecture, because the validator refuses records that do not.

### Index of constructions

Identifiers are stable handles, not a sequence: 001–009 are primitive constructions; 010–019 are compositions over community and relationship credentials; 020–029 are delegation and authority chains. Unused numbers in a range are unassigned, not missing.

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
| [013](#construction-013-%C2%B7-mutual-edge-admissibility-%E2%80%94-each-half-admissible-under-the-other-community%E2%80%99s-policy%2C-neither-policy-nor-member-revealed) | Mutual edge admissibility — each half admissible under the other community's policy, neither policy nor member revealed | `requested` | P3 | 001 ∧ 003 |
| [020](#construction-020-%C2%B7-delegation-chain-(vdc)-%E2%80%94-agent-acts-for-a-member) | Delegation chain (VDC) — agent acts for a member | `specified` | P2 | 001 ∧ 003 ∧ 004 ∧ 006 ∧ 009 |
| [021](#construction-021-%C2%B7-authority-chain-(vac)-%E2%80%94-an-agent-or-device-acts-as-itself-under-attenuated-authority) | Authority chain (VAC) — an agent or device acts as itself under attenuated authority | `specified` | P2 | 001 ∧ 003 ∧ 004 ∧ 006 ∧ 009 |

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

- the shorter of the two identifiers' key-validity periods — after a rotation the old key no longer opens to s under the recorded path and the clause must be re-proven against the rotated material
- the hash/commitment cryptoperiod of the derivation

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

#### Adversary, per claim

- **verifier** — route 1 intends to hide a low-entropy taskContext from a verifier without the opening, assuming an independent uniformly random 128-bit secret blinding value and the commitment hash assumptions; a public or disclosed opening does not provide this protection
- **verifiers-colluding** — verifiers colluding across contexts can link any repeated visible C in route 1. Route 2 cross-context unlinkability is a design objective, not established by this record; it depends on PRF key secrecy, domain separation and the absence of other stable presentation identifiers
- **issuer-verifier-colluding** — the issuer that placed C and a verifier together can link C to the exchange (the issuer knows u) — stated, not hidden: issuer–verifier collusion is outside this record's protection

#### Horizon

- route 1 plaintext hiding lasts only while the opening remains secret from the named verifier and the hash assumptions hold. Closing a thread does not erase retained openings or prevent correlation through a retained visible C.
- route 2: the context descriptor's epoch; the pseudonym rotates with it
- the commitment's hash cryptoperiod

#### Conformance fixtures

Families: `accepts` · `rejects-unsat` · `rejects-verify` · `unlinkable`

Rejection codes: `binder-mismatch (unsat: C does not open to the supplied taskContext)`, `binder-plaintext-present (lint: credential carries taskContext in the clear beside C)`

#### Construction options

*Candidate constructions, each evaluated against the construction-selection criteria ([DTG-ZKP-REQ] §16.1), with its cost as measured or as conjectured.*

| construction | cost | status | source |
|---|---|---|---|
| route 1 — proposed salted-commitment opening using available primitives; no record-specific measured implementation | unmeasured — one Poseidon opening, conjecture ≈ 250–300 constraints (~70%) | unmeasured | runtimes/canonical + runtimes/circom-gadget |
| route 2 — PRF-derived per-context pseudonym (the record-002 nullifier construction with the context descriptor as domain) | the lab's domain-tagged nullifier: measured inside the 11,523-constraint gadget; standalone unmeasured | unmeasured | runtimes/circom-gadget (nullifier binds context; record 002) |

#### Issuance requirements

- issuers carry a committed form of the exchange citation in place of the plaintext pair — under cred-spec PR #56 that pair is `taskContext` (the initiating document's `id`) and `taskDigestMultibase` (its task digest), both durable correlators of the credential across presentations; this is a change to cred-spec §The `taskContext` Property and §The `taskDigestMultibase` Property, and the one member this record asks the credential layer for. Filed against the credential specification as its own issue on 2026-09-21 (the review asked that it be an issue the Credentials TF can schedule; PR #18 is parked and is not it)
- C is digestMultibase-encoded (WD02 D-A) so both layers agree on the encoding
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


### Construction 013 · Mutual edge admissibility — each half admissible under the other community's policy, neither policy nor member revealed

*This record is at state `requested`: the construction has been asked for and not yet written. Every line below is a placeholder until a constructor writes the record.*

| | |
|---|---|
| kind | composed |
| state | `requested` |
| priority | P3 |
| constructor | mitchuski |
| requested by | stormer78 (OpenVTC implementation, cred-spec #25) · geoffturk (WD02 restatement) — requested by the ZKP TF co-chair on the record |
| request | cred-spec #25 (stormer78 2026-08-24: forming a cross-community edge needs both communities' policies to admit it, and neither side can learn the other's policy before publishing a half; first signal of inadmissibility is a rejection after one half is already out) · cred-spec #25 (mitchuski 2026-08-25: step one is plain published admissibility predicates, no proof machinery; the stronger form — 'my half would be admissible under the counterparty's policy' proven without revealing the policy or the member — is future work for the ZKP task force) · cred-spec #25 (geoffturk 2026-09-07: the two predicates in WD02 vocabulary — which correlation scopes a community accepts for the subject of a VRC its members publish, and whether it admits a non-member subject) |

**Composes:** [001](#construction-001-%C2%B7-set-membership-over-an-accredited-root) ∧ [003](#construction-003-%C2%B7-transcript-binding) — a [[ref: composed construction]]: one transcript, one [[ref: disclosure set]], written fresh.

#### Statement

Placeholder at state `requested`: each party learns that the counterparty's half of a proposed cross-community edge would be admitted under this party's own community policy — subject scope and non-member admission — without learning the counterparty's identifier, membership or policy beyond the yes, and with neither half published until both answers are yes.

**Need.** turn a failed cross-community publish into a pre-flight check that reveals nothing about either membership: each party proves its half would be admissible under the other community's published policy commitment before either half is published, and the two proofs are exchanged commit-before-reveal so that whoever goes first has not already disclosed

#### Witness

*Never leaves the holder.*

- to be specified: this party's proposed half (identifier, declared scope, membership evidence) and the opening of its commitment; the counterparty's published policy commitment and this party's satisfying witness under it

#### Public inputs

- to be specified: each community's published admissibility-policy commitment (the two WD02 predicates as a committed set); the commitment to each half; transcriptDigest for the exchange

#### Relation

1. to be specified — commit to this party's half before anything is published (commit-before-reveal ordering, cred-spec #25 question 3) — [[ref: commitment-open]]
2. to be specified — this half's subject scope and membership status are members of the counterparty community's accepted-forms set, proven against its published policy commitment — [[ref: set-membership]] ([[ref: construction record]] 001, [Set membership over an accredited root](#construction-001-%C2%B7-set-membership-over-an-accredited-root))
3. to be specified — bound to one exchange transcript so an admissibility answer cannot be replayed against a different half — [[ref: transcript-bind]] ([[ref: construction record]] 003, [Transcript binding](#construction-003-%C2%B7-transcript-binding))

#### Disclosure set

- to be specified: the two yes/no answers and the transcript digest; the halves themselves only after both answers are yes

#### Does not establish

- to be specified: that the edge will be accepted once published — admissibility under a policy commitment is not acceptance by a community's verifier; that either party is a member of anything beyond what the policy predicate asked; that the policy commitment is current

#### Adversary, per claim

- **verifier** — to be specified: the counterparty learns only the admissibility answer, not the half, the identifier or the membership behind it

#### Horizon

- to be specified: the validity of each community's published policy commitment; the exchange transcript's challenge

#### Conformance fixtures

Families: `accepts` · `rejects-unsat`

Rejection codes: `half-inadmissible (unsat: the half's form is not in the counterparty's accepted set)`

#### Construction options

*Candidate constructions, each evaluated against the construction-selection criteria ([DTG-ZKP-REQ] §16.1), with its cost as measured or as conjectured.*

| construction | cost | status | source |
|---|---|---|---|
| step one, no proof — the two predicates published as discoverable fields on the community profile (the proposed answer on #25; reveals nothing about membership) | zero; a pre-flight read | unmeasured | cred-spec #25 proposed answer · geoffturk 2026-09-07 WD02 restatement |
| to be specified — membership of the half's form in a committed policy set, exchanged commit-before-reveal | unmeasured | unmeasured | cred-spec #25 (mitchuski 2026-08-25): 'mutual admissibility as a zero-knowledge predicate' |

#### Issuance requirements

- to be specified: a community publishes its admissibility predicates as a commitment the proof can open against (the registry-ZK interaction the credential specification leaves to this task force)

#### Provenance

- cred-spec #25 — relationship policy discovery (stormer78 2026-08-24; mitchuski 2026-08-25; geoffturk 2026-09-07)
- cred-spec §Scope the holder cannot declare alone (WD02) — the pattern of a community stating a policy the holder cannot see, applied to a different fact
- docs.fpp.storm.ws DTG conformance review, item X4 'Across communities'
- commit: github.com/mitchuski/dtgwg-zkp-mage

#### Record history

| date | to | by | evidence |
|---|---|---|---|
| 2026-09-11 | `requested` | mitchuski (on cred-spec #25, 2026-08-25) — requested by stormer78's issue and geoffturk's 2026-09-07 restatement | cred-spec #25: 'There is a stronger form the ZKP task force can carry as future work: proving my half would be admissible under the counterparty's policy without revealing the policy or the member' — placed on the request register 2026-09-11 (open item D23); every field above is a placeholder until specified |


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

- the members this record covers are the five §Digest Encoding names — the member-issued VMC's `digestMultibase`, a VSC's `object.digestMultibase`, a VDC's `delegation.parent` and `delegation.accepts`, a VAC's `authority.parent` — and, once cred-spec PR #56 merges, `taskDigestMultibase` as a sixth; record 008 covers the trust-task citation itself
- the hashed representation of a referenced credential must contain a salt the proof can treat as a witness; the proof-side preference is the first option above (a salt member inside the referenced credential), because it blinds every reference at once, moves with the credential, and changes neither the referencing credential nor the encoding — the disposition is #38's
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
- commit: github.com/mitchuski/dtgwg-zkp-mage

#### Record history

| date | to | by | evidence |
|---|---|---|---|
| 2026-09-07 | `requested` | geoffturk / stormer78 (cred-spec #38) · ScottJeezey (cred-tf #39) | cred-spec #38 scope note: five digest-valued members of two kinds; the issue's third tracked item is coordination with the ZKP task force's blinded-binder work |
| 2026-09-21 | `specified` | mitchuski | the credential maintainer's review of PR #8 (2026-09-16) asked for a record a reader coming from #38 will find; this record: statement, witness, public inputs, one clause bound to commitment-open (the opening, with the opened bytes tied to what the enclosing record reads), the two reference kinds kept apart in the issuance lines, three placements with their costs (conjecture), the disposition left to #38 |

