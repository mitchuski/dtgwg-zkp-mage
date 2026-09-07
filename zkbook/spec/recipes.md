## Construction Records

This section is informative in this Working Draft: every record below is at state `carded` or `constructed`. A record becomes a candidate for normative text at state `vetted` and normative at `published`; the state is printed at the head of each record.

This section is generated from the machine-readable records in `conformance/records/`. Changes are made to a record, never to this text; a record that fails validation does not render. Each record states its adversary, its horizon and what it does not establish, and labels conjecture as conjecture, because the validator refuses records that do not.

### Index of constructions

**Primitive constructions** — one gadget each.

| # | construction | state | priority | gadget |
|---|---|---|---|---|
| [001](#construction-001-set-membership-over-an-accredited-root) | Set membership over an accredited root | `constructed` | P1 | set-membership |
| [002](#construction-002-scoped-nullifier-reuse-detection) | Scoped nullifier (reuse detection) | `constructed` | P1 | nullifier |
| [003](#construction-003-transcript-binding) | Transcript binding | `constructed` | P1 | transcript-bind |
| [004](#construction-004-holder-binding-key-from-secret) | Holder binding (key from secret) | `carded` | P2 | key-binding |
| [005](#construction-005-distinct-member-distinct-issuer) | Distinct member / distinct issuer | `constructed` | P1 | distinctness |
| [006](#construction-006-non-revocation-against-a-status-root) | Non-revocation against a status root | `carded` | P1 | non-revocation |
| [007](#construction-007-common-control-across-identifiers) | Common control across identifiers | `carded` | P1 | key-binding |
| [008](#construction-008-blinded-binder-taskcontext-without-a-durable-correlator) | Blinded binder (taskContext without a durable correlator) | `carded` | P2 | commitment-open |

**Composed constructions** — a named conjunction under one transcript and one disclosure set.

| # | construction | state | priority | composes |
|---|---|---|---|---|
| [010](#construction-010-community-anchored-proof-adr-001) | Community-Anchored Proof (ADR-001) | `carded` | P1 | 001 ∧ 002 ∧ 003 ∧ 004 ∧ 005 ∧ 006 ∧ 007 |
| [011](#construction-011-pairwise-edge-vrc-possession-directed-personas-shown-pairwise-identifiers-hidden) | Pairwise edge (VRC possession, directed personas shown, pairwise identifiers hidden) | `carded` | P2 | 003 ∧ 004 ∧ 006 ∧ 007 |
| [012](#construction-012-intentional-correlation-one-controller-across-k-credentials) | Intentional correlation — one controller across k credentials | `carded` | P2 | 003 ∧ 006 ∧ 007 |
| [020](#construction-020-delegation-chain-vdc-agent-acts-for-a-member) | Delegation chain (VDC) — agent acts for a member | `carded` | P2 | 001 ∧ 003 ∧ 004 ∧ 006 |

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

#### Method

1. the committed leaf is in the tree at `root` — [[ref: set-membership]] · runtime `runtimes/circom-gadget/circuits/nullifier_membership.circom`

#### Disclosure set

- root
- context

#### Does not establish

- that the community's admission decision was correct (assurance boundary)
- that the leaf is current (see card 006)
- which member the holder is

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

*Routes through the construction-selection gate ([DTG-ZKP-REQ] §16.1), each with its cost as measured or as conjectured.*

| route | cost | status | source |
|---|---|---|---|
| Groth16 / BN254 / Poseidon Merkle (lab) | 11,522 constraints · ~680 ms prove · ~8 ms verify · 721 B (with card 003 bound) | **measured** | CIRCUITS.md · registry 0002–0006 |
| KZG / accumulator membership (paper §3.7 hiding KZG) | constant-size opening; pairing verify | unmeasured | ePrint 2026/333 §3.7, §8 |
| Semaphore v4 tree (structurally conformant, byte-incompatible) | see cross-check | unmeasured | explorations/SEMAPHORE-V4-CROSSCHECK.md |
| Flock-class binary-field prover over a standard-hash (BLAKE3 or SHA-256) Merkle tree — the path is a batch of compressions, Flock’s native workload; removes the Poseidon requirement on the registry side and gives a post-quantum path (LIV-ALG-07) | unmeasured — conjecture: depth-20 path ≈ 20–40 compressions ≈ well under a millisecond of prover work per the published 82,100 compressions/s single-core figure; proof size in the hundreds of kB class | unmeasured | board/stacks/flock.json (blog.succinct.xyz/introducing-flock) |

#### Issuance requirements

- issuer publishes a ZK-friendly commitment per member (Poseidon leaf) or an accumulator

#### Provenance

- cred-spec VMC
- liveness reqs v0.4 §13 (PR-UNQ membership leg)
- cred-tf #39 (ScottJeezey 2026-08-25): issuer-as-predicate named as a ZKP TF work item — this card
- registry: 0002–0006 (circuit reproduced, card-level run pending)
- commit: github.com/mitchuski/dtgwg-zkp-mage

#### Record history

| date | to | by | evidence |
|---|---|---|---|
| 2026-08-28 | `requested` | mitchuski | zkp-tf #18 (talltree 08-26 / Scott 08-27): seed set for the board |
| 2026-08-28 | `carded` | mitchuski | runtimes/01-uniqueness-nullifier NOTES + decision §13 |
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

#### Method

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

*Routes through the construction-selection gate ([DTG-ZKP-REQ] §16.1), each with its cost as measured or as conjectured.*

| route | cost | status | source |
|---|---|---|---|
| Poseidon nullifier in the membership circuit (lab) | included in card 001's 11,523 | **measured** | CIRCUITS.md |
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
| 2026-08-28 | `carded` | mitchuski | decision §13 + O2 PHC-by-nullifier |
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

A verifier learns that this proof was made for exactly this presentation transcript (their challenge included), so replay under any other transcript fails cryptographically.

**Need.** PR-FRE: a proof bound to this challenge and this presentation, unreplayable elsewhere

#### Witness

*Never leaves the holder.*

- nothing extra — the transcript digest is bound as a public input inside the proof

#### Public inputs

- transcriptDigest — JCS-canonicalised digest of the presentation transcript including the verifier's challenge

#### Method

1. the proof's public signals include transcriptDigest and the circuit constrains it (cannot be swapped post hoc) — [[ref: transcript-bind]] · runtime `runtimes/canonical + runtimes/circom-gadget (public signal 4)`

#### Disclosure set

- transcriptDigest

#### Does not establish

- freshness beyond what the challenge carries
- that the verifier's challenge was itself honest

#### Adversary, per claim

- **verifier · verifiers-colluding** — replay to another verifier or time fails

#### Horizon

- the transcript's own validity window

#### Conformance fixtures

Families: `accepts` · `rejects-verify`

Vectors: `runtimes/fixtures/vectors`

Rejection codes: `transcript-digest-mismatch`, `bare-nonce-insufficient`

#### Construction options

*Routes through the construction-selection gate ([DTG-ZKP-REQ] §16.1), each with its cost as measured or as conjectured.*

| route | cost | status | source |
|---|---|---|---|
| public-signal binding in Groth16 (lab) | +1 constraint (11,522 → 11,523) | **measured** | CIRCUITS.md |
| tag-based SE-NIZK: tag = transcript (paper Def. 5) | no circuit cost; property of the proof system | unmeasured | ePrint 2026/333 §3.5 |
| Flock-class prover binding a SHA-256 digestMultibase transcript digest natively (no Poseidon detour for the canonical transcript) | unmeasured — one SHA-256 compression per 64-byte block of the canonical transcript | unmeasured | board/stacks/flock.json |

#### Issuance requirements

- none beyond the credential as specified

#### Provenance

- liveness reqs v0.4 PR-FRE
- decision §15 canonical transcript
- cred-spec #17 item 1 (JCS)
- registry: 0002–0006
- commit: github.com/mitchuski/dtgwg-zkp-mage

#### Record history

| date | to | by | evidence |
|---|---|---|---|
| 2026-08-28 | `requested` | mitchuski | zkp-tf #18 (talltree 08-26 / Scott 08-27): seed set for the board |
| 2026-08-28 | `carded` | mitchuski | X2 context legibility + canonical runtime 11/11 |
| 2026-08-28 | `constructed` | mitchuski | +1 constraint measured, CIRCUITS.md |


### Construction 004 · Holder binding (key from secret)

*This record is at state `carded`: it is written and validates; no runtime has measured it. Costs marked conjecture are conjecture (drafting rule 4). Informative.*

| | |
|---|---|
| kind | primitive |
| state | `carded` |
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

#### Method

1. pk_presentation = PRF(secret, context) and the credential commitment opens to the same secret — [[ref: key-binding]]

#### Disclosure set

- presentation key (context-scoped)

#### Does not establish

- non-transfer of the secret
- absence of coercion or account sharing
- agent authority or consent

#### Adversary, per claim

- **verifier · issuer-verifier-colluding** — long-term key hidden

#### Horizon

- key cryptoperiod
- credential validity

#### Conformance fixtures

Families: `accepts` · `rejects-unsat`

Rejection codes: `key-not-derived-from-secret`

#### Construction options

*Routes through the construction-selection gate ([DTG-ZKP-REQ] §16.1), each with its cost as measured or as conjectured.*

| route | cost | status | source |
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
| 2026-08-28 | `carded` | mitchuski | runtimes/04-holder-binding STUB.md + paper §7.2 languages |


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

#### Method

1. leaf_a ≠ leaf_b (or issuer_a ≠ issuer_b) enforced as a non-zero inverse constraint — no witness exists for equality — [[ref: distinctness]] · runtime `runtimes/circom-gadget/circuits/dual_issuer.circom`

#### Disclosure set

- that the two are distinct — nothing about which two

#### Does not establish

- that the two parties are independent in the accreditation sense (declared, not proven — X8)
- that either is honest

#### Adversary, per claim

- **verifier · verifiers-colluding** — identities of both hidden

#### Horizon

- root cryptoperiod

#### Conformance fixtures

Families: `accepts` · `rejects-unsat`

Vectors: `runtimes/fixtures/vectors`

Rejection codes: `duplicate-issuer-unsatisfiable`, `duplicate-seat-unsatisfiable`

#### Construction options

*Routes through the construction-selection gate ([DTG-ZKP-REQ] §16.1), each with its cost as measured or as conjectured.*

| route | cost | status | source |
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
| 2026-08-28 | `carded` | mitchuski | X8 + dual_issuer design |
| 2026-08-28 | `constructed` | mitchuski | dual_issuer 7/7, guardian 8/8; duplicate = no witness |


### Construction 006 · Non-revocation against a status root

*This record is at state `carded`: it is written and validates; no runtime has measured it. Costs marked conjecture are conjecture (drafting rule 4). Informative.*

| | |
|---|---|
| kind | primitive |
| state | `carded` |
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

#### Method

1. non-membership of the handle in the set committed by rl_root (sorted-leaf neighbours or accumulator non-witness) — [[ref: non-revocation]]

#### Disclosure set

- rl_root
- epoch

#### Does not establish

- that revocation is instantaneous — only that the handle was not revoked as of `epoch` (C4's published bound)
- that the registry's revocation decision was correct
- that the verifier performed no live lookup — the card makes the presentation self-carrying (root + witness); whether a deployment still phones home is a profile statement, not a proof property

#### Adversary, per claim

- **registry-operator · issuer-verifier-colluding** — the status check does not identify the holder — requires bulk/anonymous root fetch, never a per-holder query

#### Horizon

- status freshness (C4 bound)
- epoch rollover

#### Conformance fixtures

Families: `accepts` · `rejects-unsat` · `current`

Rejection codes: `rl-root-stale`, `handle-revoked`

#### Construction options

*Routes through the construction-selection gate ([DTG-ZKP-REQ] §16.1), each with its cost as measured or as conjectured.*

| route | cost | status | source |
|---|---|---|---|
| sorted-leaf non-membership Merkle (indexed tree) | ≈ 2× card 001 | unmeasured | explorations/O4-registry-zk-revocation.md |
| RL membership check inside f with nullifier as PHC attribute (paper §5.4) — carries the paper's own linkability caveat | depends on RL representation | unmeasured | ePrint 2026/333 §5.4 |
| set-root primitive (cred-tf #40 unification): a signed, published set root + a membership or non-membership proof carried in the presentation — accumulator non-membership witness as the ZK-friendly form; the same public-input object serves anchoring (card 001), revocation status (this card) and registry membership | unmeasured — ScottJeezey: "ours to pressure-test", priority | unmeasured | cred-tf #40 (stormer78 08-22; ScottJeezey 08-24) · cred-tf #39 (ScottJeezey 08-25) |
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
| 2026-08-28 | `carded` | mitchuski | O4 + X6 explorations; ADR-001 C-clauses |


### Construction 007 · Common control across identifiers

*This record is at state `carded`: it is written and validates; no runtime has measured it. Costs marked conjecture are conjecture (drafting rule 4). Informative.*

| | |
|---|---|
| kind | primitive |
| state | `carded` |
| priority | P1 |
| constructor | mitchuski |
| requested by | sankarshanmukhopadhyay / geoffturk / stormer78 (spec side) — carded by the ZKP TF co-chair |
| request | cred-spec #9 (Sankarshan: identity linkages the ZKP constructions require) · cred-spec #31 (geoffturk 09-02: '#9 stays open — and gains weight'; four things lean on the unencoded common-control linkage) · cred-spec PR #30 §Community-Anchored ZKP ('the proof must establish common control across them') |

**Kind:** [[ref: primitive construction]] — binds the [[ref: key-binding]] gadget and nothing else.

#### Statement

A verifier learns that two identifiers named in two credentials — declared pairwise, or otherwise distinct — are controlled by one holder secret, without learning that secret and without the proof minting a handle that recognises the holder in any other presentation.

**Need.** under WD02's three correlation scopes, two `pairwise` identifiers differ by construction, so any proof that reads one party out of two credentials must first prove one holder controls both identifiers — without a field that says so

#### Witness

*Never leaves the holder.*

- the holder secret s
- per-identifier derivation material: for each identifier, the salt or key-derivation path under which it was minted from s
- the two credentials that name the identifiers (their bytes stay with the holder; only what the enclosing card discloses is shown)

#### Public inputs

- the two identifiers exactly as the credentials carry them — or their ZK-openable commitments, when the identifiers themselves are hidden by the enclosing card
- transcriptDigest — the presentation transcript this proof is bound to

#### Method

1. identifier A's public key or commitment opens to (s, salt_A) and identifier B's opens to (s, salt_B) for one and the same s — a different secret behind either identifier is unsatisfiable — [[ref: key-binding]]

#### Disclosure set

- the outcome (one controller / not shown)
- transcriptDigest
- the identifiers only as far as the enclosing card already discloses them — this card adds no identifier to the disclosure set

#### Does not establish

- that the controller is one natural person — two agents or two people sharing a secret satisfy the clause (that is card 002's uniqueness, under its own declaration)
- that either credential is currently valid or unrevoked (card 006)
- that the holder intended the two identifiers to be correlated beyond this verifier — the proof is a disclosure to the party it is made to, not a widening of either identifier's declared scope
- the counterparty's common control: a presenter can prove only what is derived from a secret in the presenter's hands; a counterparty's linkage needs the counterparty's witness or the counterparty's own attestation (see card 010)

#### Adversary, per claim

- **verifier · verifiers-colluding** — no cross-presentation handle: the proof is transcript-bound and emits no identifier-derived value; two verifiers comparing proofs learn only what the enclosing cards disclosed to each
- **issuer-verifier-colluding** — the secret s is never revealed and no per-identifier salt is; an issuer who minted one identifier's credential learns nothing about the other from the proof

#### Horizon

- the shorter of the two identifiers' key-validity periods — after a rotation the old key no longer opens to s under the recorded path and the clause must be re-proven against the rotated material
- the hash/commitment cryptoperiod of the derivation

#### Conformance fixtures

Families: `accepts` · `rejects-unsat` · `rejects-verify` · `unlinkable`

Rejection codes: `co-control-unproven (unsat: distinct secrets)`, `identifier-not-zk-openable (verify-fail: identifier carries no openable commitment — an issuance failure, X3)`

#### Construction options

*Routes through the construction-selection gate ([DTG-ZKP-REQ] §16.1), each with its cost as measured or as conjectured.*

| route | cost | status | source |
|---|---|---|---|
| no proof — the holder declares one `directed` identifier and uses it in both credentials (WD02 §Choosing a scope: correlation evident on the face of the credentials) | zero constraints; the cost is the declaration itself | unmeasured | cred-spec PR #30 §Choosing a scope / §Community-Anchored ZKP |
| Groth16/Poseidon: two Poseidon commitment openings sharing the secret input (the circom-gadget leaf commitment, twice) — conjecture ~500–600 constraints total (~65%), unmeasured; one compile settles it | unmeasured (conjecture ≈ 2 × the lab's Poseidon leaf commitment) | unmeasured | runtimes/circom-gadget (Poseidon commitment + nullifier already bind a leaf to a secret) |
| blackbox commit-and-prove: the same opening under the paper's hiding commitments (Construction II show, N=1) | paper Table 1 class | unmeasured | ePrint 2026/333 §7.2 |

#### Issuance requirements

- each identifier that may need to be proven co-controlled must be, or carry, a ZK-openable commitment to the holder secret: a SNARK-native key (e.g. BabyJubJub did:key) or a published Poseidon/KZG commitment beside an Ed25519 key — the X3 requirement of card 010, now applied to identifiers rather than signatures (cred-spec #17)
- the credential layer carries the requirement to be able to prove co-control, never a field that states the link (cred-spec #9, the 08-25 position)

#### Provenance

- cred-spec PR #30 §Correlation Scope / §Choosing a scope / §Community-Anchored Zero-Knowledge Proof (WD02 draft, 2026-09-02)
- cred-spec #9 (identity linkages required by the ZKP constructions)
- cred-spec #31 disposition table (#9 stays open and gains weight; cross-TF work with the ZKP TF)
- ADR-001 S4 (holder binding) — generalised to two identifiers

#### Record history

| date | to | by | evidence |
|---|---|---|---|
| 2026-09-02 | `requested` | geoffturk / stormer78 (cred-spec #31, PR #30) · sankarshanmukhopadhyay (cred-spec #9) | cred-spec #31 disposition row for #9: 'four things lean on the unencoded common-control linkage … the resolution is cross-TF work with the ZKP task force' |
| 2026-09-05 | `carded` | mitchuski | carded from PR #30's §Community-Anchored text + #9 + the lab's key-binding gadget shape; cost line labelled conjecture per drafting rule 4 |


### Construction 008 · Blinded binder (taskContext without a durable correlator)

*This record is at state `carded`: it is written and validates; no runtime has measured it. Costs marked conjecture are conjecture (drafting rule 4). Informative.*

| | |
|---|---|
| kind | primitive |
| state | `carded` |
| priority | P2 |
| constructor | mitchuski (card) · ScottJeezey (named the work item) |
| requested by | ScottJeezey for the ZKP TF · bmiller59 (#39 postulate) · sankarshanmukhopadhyay |
| request | cred-tf #39 (ScottJeezey 08-25: 'a blinded, non-correlating form of the binder (taskContext), with salted commitments available now and PRF-derived per-context pseudonyms as the fuller construction') · cred-spec §Trust Task Context Binding · cred-spec PR #18 (parked) · cred-tf #40 (the artifact gap) |

**Kind:** [[ref: primitive construction]] — binds the [[ref: commitment-open]] gadget and nothing else.

#### Statement

A verifier that holds a trust-task context learns that the presented credential was issued within that exchange, while the credential at rest and every other presentation of it carry no plaintext binder that recognises the exchange or the holder.

**Need.** a credential bound to the trust-task exchange it was issued in currently carries the binder in the clear; the binder (id/threadId pairing) is then a durable correlator across every presentation of that credential

#### Witness

*Never leaves the holder.*

- the taskContext value (the id/threadId pairing the framework assigned to the exchange)
- the blinding salt u the issuer used when committing to it
- the credential carrying the commitment

#### Public inputs

- the binder commitment C as the credential carries it (digestMultibase-encoded per WD02 D-A)
- what the verifier already holds of the exchange: the taskContext digest it expects (route 1) or the context descriptor for the per-context pseudonym (route 2)
- transcriptDigest

#### Method

1. C opens to (taskContext, u) for the taskContext the verifier supplies — route 1; or C opens to a PRF of (holder secret, context descriptor) that the verifier can recompute for this context and no other — route 2 — [[ref: commitment-open]]

#### Disclosure set

- the outcome (bound to this exchange / not shown)
- transcriptDigest
- route 2 only: the per-context pseudonym, which is by construction the same value every time this holder presents in this context — a declared, context-scoped link and nothing wider

#### Does not establish

- that the trust task completed, or what was done in it — completion evidence is a framework artifact outside any credential (the artifact gap, cred-tf #39/#40)
- that the binder's plaintext is not held elsewhere — the framework holds it in the Trust Task documents; this card blinds only the copy the credential carries
- durable-versus-task-dependent status of the claim (Outcome Interpretability is the credential layer's statement, not this proof's)

#### Adversary, per claim

- **verifier** — route 1: a verifier not party to the exchange learns nothing from C; a verifier party to it learns only what it already held
- **verifiers-colluding** — verifiers in different contexts cannot link presentations through the binder — route 1 emits nothing reusable, route 2 emits a value scoped to one context descriptor
- **issuer-verifier-colluding** — the issuer that placed C and a verifier together can link C to the exchange (the issuer knows u) — stated, not hidden: issuer–verifier collusion is outside this card's protection

#### Horizon

- route 1: the lifetime of the exchange's thread — once the thread is closed the verifier's copy of taskContext is the only thing that can open C
- route 2: the context descriptor's epoch; the pseudonym rotates with it
- the commitment's hash cryptoperiod

#### Conformance fixtures

Families: `accepts` · `rejects-unsat` · `rejects-verify` · `unlinkable`

Rejection codes: `binder-mismatch (unsat: C does not open to the supplied taskContext)`, `binder-plaintext-present (lint: credential carries taskContext in the clear beside C)`

#### Construction options

*Routes through the construction-selection gate ([DTG-ZKP-REQ] §16.1), each with its cost as measured or as conjectured.*

| route | cost | status | source |
|---|---|---|---|
| route 1 — salted commitment, Poseidon in-circuit opening (available now; the lab's canonical §6.2 descriptor digest is the input shape) | unmeasured — one Poseidon opening, conjecture ≈ 250–300 constraints (~70%) | unmeasured | runtimes/canonical + runtimes/circom-gadget |
| route 2 — PRF-derived per-context pseudonym (the card-002 nullifier construction with the context descriptor as domain) | the lab's domain-tagged nullifier: measured inside the 11,523-constraint gadget; standalone unmeasured | unmeasured | runtimes/circom-gadget (nullifier binds context; card 002) |

#### Issuance requirements

- issuers place the commitment C in `taskContext` (or beside it) instead of the plaintext pairing — a change to cred-spec §The `taskContext` Property, and the one member this card asks the credential layer for
- C is digestMultibase-encoded (WD02 D-A) so both layers agree on the encoding
- the framework (Trust Tasks) commits to the taskContext in a form the proof can open — 'we can only blind what the framework gives us a committed form of' (ScottJeezey, cred-tf #39)

#### Provenance

- cred-tf #39 (ScottJeezey 2026-08-25 — ZKP TF work items on the record)
- cred-tf #40 (the artifact gap; delegation as a design-time case)
- cred-spec §Trust Task Context Binding / §The `taskContext` Property (WD01)
- cred-spec #31 D-A (digestMultibase settled) · trustoverip/dtgwg-trust-tasks-tf#236 (§4.9.3)

#### Record history

| date | to | by | evidence |
|---|---|---|---|
| 2026-08-25 | `requested` | ScottJeezey (ZKP TF co-chair, cred-tf #39) | cred-tf #39 comment 2026-08-25T14:41Z: 'we are treating these as work items: a blinded, non-correlating form of the binder (taskContext)…' |
| 2026-09-05 | `carded` | mitchuski | carded from Scott's two routes + cred-spec §Trust Task Context Binding + the lab's descriptor-digest and nullifier shapes; costs labelled conjecture |


### Construction 010 · Community-Anchored Proof (ADR-001)

*This record is at state `carded`: it is written and validates; no runtime has measured it. Costs marked conjecture are conjecture (drafting rule 4). Informative.*

| | |
|---|---|
| kind | composed |
| state | `carded` |
| priority | P1 |
| constructor | mitchuski + DenisPopov15 (construction) · stormer78 (record) |
| requested by | stormer78 — ADR-001 Proposed 2026-08-25, docs.fpp.storm.ws |
| request | zkp-tf #18 (Scott 08-27: 'a natural first one to seed it with') |

**Composes:** [001](#construction-001-set-membership-over-an-accredited-root) ∧ [002](#construction-002-scoped-nullifier-reuse-detection) ∧ [003](#construction-003-transcript-binding) ∧ [004](#construction-004-holder-binding-key-from-secret) ∧ [005](#construction-005-distinct-member-distinct-issuer) ∧ [006](#construction-006-non-revocation-against-a-status-root) ∧ [007](#construction-007-common-control-across-identifiers) — a [[ref: composed construction]]: one transcript, one [[ref: disclosure set]], written fresh.

#### Statement

A maintainer learns that a member of community C has a working relationship with the presenter, that the presenter is also a member of C, and that the two are different members — and learns nothing else: not who vouched, not the pairwise identifiers under the edge, and nothing that recognises the presenter next time in another context.

**Need.** the first ZK use case against DTG credentials: a relationship exists inside a shared community, without revealing who is in it

#### Witness

*Never leaves the holder.*

- the VRC (Omar → Nia): the vouch, its statement, and the pairwise-scope identifier pair it was issued between
- Nia's VMC from C — the community-issued grant (and her own acknowledgement half)
- Omar's VMC grant from C as it sits in C's membership root (the leaf and its path — no copy of Omar's acknowledgement exists on Nia's side)
- Nia's holder secret, and the derivation material linking her VRC-side identifier to her VMC-side identifier (card 007) — unless she declared one `directed` identifier for both
- Omar's linkage: either one `directed` identifier used in both his VMC and the VRC (WD02's honest default for intra-community edges), or a co-control attestation Omar issued alongside the VRC (card 007 run by the voucher at issuance — the vouch-under-community-credential shape of ePrint 2026/333); Nia cannot derive this from her own secret
- non-revocation witnesses for the VRC and both VMC handles

#### Public inputs

- context descriptor (scope, purpose, epoch)
- root_C — C's membership root at a stated registry state
- rl_root and epoch — revocation state
- nullifier (only if this context declares reuse detection; otherwise absent)
- transcriptDigest — one transcript for the whole show, including the maintainer's challenge

#### Method

1. ADR clause 1 — the VRC verifies as a vouch made by the holder of Omar's credential over Nia's key — [[ref: signature-verify]]
2. ADR clause 2 — Nia's VMC grant is a leaf of root_C — [[ref: set-membership]] ([[ref: construction record]] 001, [Set membership over an accredited root](#construction-001-set-membership-over-an-accredited-root))
3. ADR clause 3 — the VRC issuer's VMC grant is a leaf of root_C (offline: proven from the root, not from Omar) — [[ref: set-membership]] ([[ref: construction record]] 001, [Set membership over an accredited root](#construction-001-set-membership-over-an-accredited-root))
4. S7 (WD02, PR #30) — the identifier Nia used in the VRC and the identifier her VMC grant names are controlled by one secret; likewise Omar's VRC-issuing identifier and his VMC-grant identifier (from his linkage artifact, or trivially if he used one `directed` identifier) — otherwise clauses 1–3 are about four unrelated identifiers — [[ref: key-binding]] ([[ref: construction record]] 007, [Common control across identifiers](#construction-007-common-control-across-identifiers))
5. S6 (added) — clause-2 leaf ≠ clause-3 leaf: the voucher is not the holder (self-vouch is unsatisfiable) — [[ref: distinctness]] ([[ref: construction record]] 005, [Distinct member / distinct issuer](#construction-005-distinct-member-distinct-issuer))
6. S4 — Nia's presentation key derives from the secret her VMC/VRC bind to — [[ref: key-binding]] ([[ref: construction record]] 004, [Holder binding (key from secret)](#construction-004-holder-binding-key-from-secret))
7. C1–C3 — neither VMC handle nor the VRC handle is in the set under rl_root at epoch — [[ref: non-revocation]] ([[ref: construction record]] 006, [Non-revocation against a status root](#construction-006-non-revocation-against-a-status-root))
8. P4 (parameterised) — if the context declares reuse detection, emit the scoped nullifier; else emit none — [[ref: nullifier]] ([[ref: construction record]] 002, [Scoped nullifier (reuse detection)](#construction-002-scoped-nullifier-reuse-detection))
9. S5 — the whole show is bound to transcriptDigest — [[ref: transcript-bind]] ([[ref: construction record]] 003, [Transcript binding](#construction-003-transcript-binding))

#### Disclosure set

- the outcome (verifies / does not)
- root_C, rl_root, epoch (registry state the show was made against — ADR C2)
- context descriptor
- transcriptDigest
- nullifier — only in contexts that declare reuse detection
- anything Nia deliberately discloses (P3), e.g. an assurance class carried by C's governance (G2)

#### Does not establish

- that Omar endorses this request — a VRC is standing, not per-request; S5 binds the proof, not the relationship
- that Nia is one natural person (that is PR-UNQ in a different context, card 002 under its own declaration)
- that C's admission decision for either member was correct (assurance boundary — accreditation carries assurance)
- Omar's consent to this disclosure — the VRC's effective disclosure is the wider of its two halves (cred-spec PR #27)
- that Omar's membership was consented in the PR #12 sense — clause 3 proves the community-issued grant only; the acknowledgement half is not in Nia's hands
- key non-transfer, absence of coercion, agent authority
- that Omar is still a member in any sense stronger than 'not revoked as of epoch'
- that Omar's two identifiers are co-controlled when he supplied no linkage and used pairwise identifiers for both — then clause 3 is unprovable by Nia, and the card says so rather than reading a link out of a field (cred-spec #9)

#### Adversary, per claim

- **verifier · verifiers-colluding** — P1/P2 — no pairwise-scope identifier of the edge, no counterparty identifier
- **verifiers-colluding** — P4 — unlinkable across contexts; within a reuse-detecting context the nullifier is the only link and it is declared
- **registry-operator · issuer-verifier-colluding** — C3 — currency check does not identify Nia; holds only if rl_root/root_C are fetched without a per-holder query

#### Horizon

- earliest of: VRC validity · either VMC validity · epoch rollover · status freshness (C4 bound) · root_C cryptoperiod

#### Conformance fixtures

Families: `accepts` · `rejects-unsat` · `rejects-verify` · `unlinkable` · `current`

Rejection codes: `omar-not-member (unsat)`, `self-vouch (unsat)`, `vrc-signature-invalid (verify)`, `transcript-digest-mismatch (verify)`, `handle-revoked (unsat at epoch)`, `rl-root-stale`

#### Construction options

*Routes through the construction-selection gate ([DTG-ZKP-REQ] §16.1), each with its cost as measured or as conjectured.*

| route | cost | status | source |
|---|---|---|---|
| Groth16 / BN254 / Poseidon — compose cards 001+001+005+003 (+006, +004) in one circuit (lab, buildable now) | est. ≈ 2×11,523 + 10,717 + non-revocation ≈ 35–45k constraints · ~2 s prove · ~10 ms verify · one 721 B proof — to be measured | unmeasured | CIRCUITS.md numbers per component |
| blackbox: Gro15 SPS credentials + hiding KZG + Groth–Sahai for the algebraic part, commit-and-prove SNARK for f (paper §8–9) | 0.03 s prove @1 vouch, CRS 13.4 KB, 0.10 s verify (paper Table 1/2; N=1 vouch + 2 memberships is the smallest instance) | unmeasured | ePrint 2026/333 §10 |
| legacy rails: ECDSA/Ed25519 credentials proven as-signed (Longfellow / Crescent → vouchable, paper App. A) | seconds; large circuits; no issuer change | unmeasured | zkp-tf #17 (SIROS catalog), ePrint 2026/333 App. A |
| post-quantum route: Flock-class binary-field prover for the hash side (membership, non-revocation, transcript) — signature clauses over curve-based credentials remain the open cost | unmeasured; proof size hundreds of kB vs ~1 kB Groth16 — a profile trade (ADR-001 D3) | unmeasured | board/stacks/flock.json |

#### Issuance requirements

- X3, concretely: the VMC and VRC signatures or a published commitment must be ZK-friendly — either SPS on BLS12-381 (blackbox), a SNARK-native signature, or an additional Poseidon/KZG commitment alongside `eddsa-jcs-2022` (cred-spec #17)
- C publishes root_C and rl_root per epoch, fetchable anonymously (T2, C3)
- membership leaf = the community-issued grant (PR #12 pair): the proof covers the grant half
- a VRC issued from a pairwise-scope identifier by a member who wants it usable in community-anchored proofs carries the issuer's co-control attestation to their VMC-side identifier (card 007 at issuance) — or the member declares `directed` and uses one identifier; the credential layer names the option, not the link (cred-spec #9)

#### Provenance

- ADR-001 Community-Anchored Proof (Proposed 2026-08-25)
- cred-spec construction 2 (community-anchored ZKP)
- cred-spec #21 → PR #26 (edge verifiability w.r.t. a verifier)
- cred-spec #8 → PR #12 (VMC pair)
- ePrint 2026/333 §2.3–2.4, §5.3–5.4, §7.2, §8–10
- cred-spec PR #30 §Community-Anchored Zero-Knowledge Proof (WD02 draft): "the proof must additionally establish common control" · cred-spec #31 row #9
- commit: github.com/mitchuski/dtgwg-zkp-mage

#### Record history

| date | to | by | evidence |
|---|---|---|---|
| 2026-08-28 | `requested` | mitchuski | zkp-tf #18 (talltree 08-26 / Scott 08-27): seed set for the board |
| 2026-08-28 | `carded` | mitchuski | ZKP_TF_RUN-2026-08-28.md §3 (ten refinements) + this card; method fully bound to gadgets; composed yield and does-not written fresh |

Revisions within a state:

| date | by | note |
|---|---|---|
| 2026-09-05 | mitchuski | WD02 three-scope vocabulary (PR #30); S7 common-control clause via card 007; voucher-side linkage stated as ingredient + issuance option — re-carded, state unchanged |


### Construction 011 · Pairwise edge (VRC possession, directed personas shown, pairwise identifiers hidden)

*This record is at state `carded`: it is written and validates; no runtime has measured it. Costs marked conjecture are conjecture (drafting rule 4). Informative.*

| | |
|---|---|
| kind | composed |
| state | `carded` |
| priority | P2 |
| constructor | mitchuski |
| requested by | cred-spec construction 1 |
| request | zkp-tf #18 |

**Composes:** [003](#construction-003-transcript-binding) ∧ [004](#construction-004-holder-binding-key-from-secret) ∧ [006](#construction-006-non-revocation-against-a-status-root) ∧ [007](#construction-007-common-control-across-identifiers) — a [[ref: composed construction]]: one transcript, one [[ref: disclosure set]], written fresh.

#### Statement

A verifier learns that two disclosed persona identifiers (declared `directed`) hold a valid relationship credential between them, without learning the pairwise-scope identifiers under it and without a handle that correlates this presentation with any other.

**Need.** prove two known personas have a relationship without exposing the private pairwise channel (cred-spec §Pairwise Zero-Knowledge Proof, WD02 wording: disclose the parties’ `directed` persona identifiers while hiding the underlying `pairwise` ones)

#### Witness

*Never leaves the holder.*

- the VRC and the pairwise-scope identifier pair it was issued between
- the co-control witnesses linking each disclosed `directed` persona identifier to its hidden pairwise identifier (card 007; cred-spec #9: co-control proven in ZK, never a field) — the counterparty’s half is theirs to supply
- the presenter’s holder secret

#### Public inputs

- the two `directed` persona identifiers (disclosed on purpose)
- rl_root, epoch
- transcriptDigest

#### Method

1. the VRC verifies under the issuing pairwise identifier’s key — [[ref: signature-verify]]
2. each disclosed persona identifier is co-controlled with its hidden pairwise identifier (card 007) — the presenter’s from their own secret, the counterparty’s from the counterparty’s attestation — [[ref: key-binding]] ([[ref: construction record]] 007, [Common control across identifiers](#construction-007-common-control-across-identifiers))
3. the presenter’s presentation key derives from the secret behind their pairwise identifier — [[ref: key-binding]] ([[ref: construction record]] 004, [Holder binding (key from secret)](#construction-004-holder-binding-key-from-secret))
4. the VRC handle is not revoked at epoch — [[ref: non-revocation]] ([[ref: construction record]] 006, [Non-revocation against a status root](#construction-006-non-revocation-against-a-status-root))
5. bound to one transcript — [[ref: transcript-bind]] ([[ref: construction record]] 003, [Transcript binding](#construction-003-transcript-binding))

#### Disclosure set

- the two `directed` persona identifiers
- rl_root, epoch
- transcriptDigest

#### Does not establish

- any community-level assurance (that is card 010)
- that the personas are distinct natural persons
- the relationship's content beyond what the statement discloses
- the counterparty’s persona↔pairwise linkage without the counterparty’s attestation (card 007 negative space)

#### Adversary, per claim

- **verifier · verifiers-colluding** — pairwise identifiers hidden; no cross-presentation correlator minted by the linkage itself

#### Horizon

- VRC validity
- status freshness

#### Conformance fixtures

Families: `accepts` · `rejects-verify` · `unlinkable`

Rejection codes: `co-control-unproven`, `vrc-signature-invalid`

#### Construction options

*Routes through the construction-selection gate ([DTG-ZKP-REQ] §16.1), each with its cost as measured or as conjectured.*

| route | cost | status | source |
|---|---|---|---|
| Groth16 composition of 004+006+003 with an in-circuit signature check | unmeasured — dominated by the signature gadget (X3 again) | unmeasured | board/README |
| paper Construction II show with N=1 vouch (§7.2) | paper Table 1 | unmeasured | ePrint 2026/333 §7.2 |

#### Issuance requirements

- as card 010's X3 line

#### Provenance

- cred-spec §Pairwise Zero-Knowledge Proof (WD02 wording, PR #30)
- cred-spec #9 (F post: co-control as requirement, not field)
- cred-spec PR #30 §Correlation Scope

#### Record history

| date | to | by | evidence |
|---|---|---|---|
| 2026-08-28 | `requested` | mitchuski | zkp-tf #18 (talltree 08-26 / Scott 08-27): seed set for the board |
| 2026-08-28 | `carded` | mitchuski | cred-spec construction 1 + #9 F post |

Revisions within a state:

| date | by | note |
|---|---|---|
| 2026-09-05 | mitchuski | WD02 vocabulary; co-control routed through card 007 — re-carded, state unchanged |


### Construction 012 · Intentional correlation — one controller across k credentials

*This record is at state `carded`: it is written and validates; no runtime has measured it. Costs marked conjecture are conjecture (drafting rule 4). Informative.*

| | |
|---|---|
| kind | composed |
| state | `carded` |
| priority | P2 |
| constructor | mitchuski |
| requested by | talltree / geoffturk / stormer78 |
| request | cred-spec #22 (talltree 08-29: 'the ZK proof simply needs to prove the same person controls the DIDs') · cred-spec PR #30 §Choosing a scope |

**Composes:** [003](#construction-003-transcript-binding) ∧ [006](#construction-006-non-revocation-against-a-status-root) ∧ [007](#construction-007-common-control-across-identifiers) — a [[ref: composed construction]]: one transcript, one [[ref: disclosure set]], written fresh.

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

#### Method

1. for each pair (identifier_1, identifier_i), i = 2..k: both open to the same s — k−1 common-control clauses sharing one witness — [[ref: key-binding]] ([[ref: construction record]] 007, [Common control across identifiers](#construction-007-common-control-across-identifiers))
2. no credential handle is in the set under rl_root at epoch — [[ref: non-revocation]] ([[ref: construction record]] 006, [Non-revocation against a status root](#construction-006-non-revocation-against-a-status-root))
3. the whole show is bound to transcriptDigest — [[ref: transcript-bind]] ([[ref: construction record]] 003, [Transcript binding](#construction-003-transcript-binding))

#### Disclosure set

- the outcome (one controller / not shown)
- the holder-declared set of credentials shown to share a controller — a per-presentation choice, the disclosure this card exists to make
- the identifiers the holder chose to disclose, and no others
- rl_root, epoch, transcriptDigest

#### Does not establish

- that the presenter is one natural person (k credentials, one secret: an agent holding a person's secret satisfies every clause — card 002 under its own declaration establishes uniqueness)
- anything about credentials not in the show: intentional correlation is declared per presentation and does not widen any identifier's declared scope
- that the communities involved consented to be named together — the disclosure is the holder's
- what any of the credentials asserts beyond existence and non-revocation (a VPC's persona content, a VRC's statement) unless disclosed

#### Adversary, per claim

- **verifier · verifiers-colluding** — no identifier beyond the disclosed set, and no cross-presentation handle: two verifiers shown different subsets cannot join them through this proof
- **issuer-verifier-colluding · registry-operator** — the issuer of any one credential in the show learns nothing about the others from the proof; the revocation-state fetch must not be a per-holder query (card 006 C3)

#### Horizon

- earliest of: any shown credential's validity · epoch rollover · the shortest identifier key-validity among the k (card 007)

#### Conformance fixtures

Families: `accepts` · `rejects-unsat` · `rejects-verify` · `unlinkable` · `current`

Rejection codes: `co-control-unproven`, `handle-revoked`, `show-not-declared (lint: a credential in the witness set has no disclosure declaration)`

#### Construction options

*Routes through the construction-selection gate ([DTG-ZKP-REQ] §16.1), each with its cost as measured or as conjectured.*

| route | cost | status | source |
|---|---|---|---|
| no proof — where the holder deliberately reused one `directed` or `public` identifier across the credentials, the correlation is on their face (WD02 §Choosing a scope) | zero | unmeasured | cred-spec PR #30 |
| Groth16 composition: (k−1) × card-007 openings + k non-revocation legs + 1 transcript constraint | unmeasured; conjecture linear in k with the 007 and 006 per-leg costs | unmeasured | board/cards/007.json, 006.json |

#### Issuance requirements

- as card 007: every identifier that may later be co-proven is, or carries, a ZK-openable commitment to s (X3 applied to identifiers)

#### Provenance

- cred-spec #22 (talltree 2026-08-29T22:40Z: the three-scope ZK observation)
- cred-spec PR #30 §Choosing a scope (WD02 draft) · Privacy Consideration 2 (intentional correlation via personas)
- cred-spec §VPC (Verifiable Persona Credential) — the credential-layer instrument for the same intent

#### Record history

| date | to | by | evidence |
|---|---|---|---|
| 2026-08-29 | `requested` | talltree (cred-spec #22) | cred-spec #22 comment 2026-08-29T22:40Z: 'it reduces the set of ZK proofs needed for intentional correlation … the ZK proof simply needs to prove the same person controls the DIDs' |
| 2026-09-05 | `carded` | mitchuski | composed from 007 + 006 + 003 under one transcript; yield and negative space written fresh (composition rule) |


### Construction 020 · Delegation chain (VDC) — agent acts for a member

*This record is at state `carded`: it is written and validates; no runtime has measured it. Costs marked conjecture are conjecture (drafting rule 4). Informative.*

| | |
|---|---|
| kind | composed |
| state | `carded` |
| priority | P2 |
| constructor | construction: sankarshanmukhopadhyay · DenisPopov15 · mitchuski (per ScottJeezey, cred-tf #40) · record: stormer78 (PR #19) |
| requested by | stormer78 / sankarshanmukhopadhyay |
| request | cred-spec PR #19 open question 6; ADR-001 §05 'deserves its own record once this one is proven' · cred-tf #40 (stormer78 08-22 design note; ScottJeezey 08-24: "on our list alongside Q2") · cred-spec #31 pre-merge list for #19 |

**Composes:** [001](#construction-001-set-membership-over-an-accredited-root) ∧ [003](#construction-003-transcript-binding) ∧ [004](#construction-004-holder-binding-key-from-secret) ∧ [006](#construction-006-non-revocation-against-a-status-root) — a [[ref: composed construction]]: one transcript, one [[ref: disclosure set]], written fresh.

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

#### Method

1. act ∈ scope_n ⊆ … ⊆ scope_root, depth ≤ maxDepth, validUntil monotone along the chain, root hop signed by the principal (Scott’s predicate shape, cred-tf #40) — [[ref: chain-resolve]]
2. each hop’s delegate countersigned the grant: `accepts` matches the grant digest (digestMultibase, WD02 D-A) and verifies under the delegate’s key — [[ref: signature-verify]]
3. principal is a leaf of root_C — [[ref: set-membership]] ([[ref: construction record]] 001, [Set membership over an accredited root](#construction-001-set-membership-over-an-accredited-root))
4. the agent's presentation key derives from the leaf-hop delegate secret — [[ref: key-binding]] ([[ref: construction record]] 004, [Holder binding (key from secret)](#construction-004-holder-binding-key-from-secret))
5. no hop revoked at epoch — [[ref: non-revocation]] ([[ref: construction record]] 006, [Non-revocation against a status root](#construction-006-non-revocation-against-a-status-root))
6. bound to one transcript — [[ref: transcript-bind]] ([[ref: construction record]] 003, [Transcript binding](#construction-003-transcript-binding))

#### Disclosure set

- the invoked scope term
- root_C, rl_root, epoch
- transcriptDigest

#### Does not establish

- that the principal authorised this specific act (grant ≠ invocation — the invocation is a trust-task artifact)
- the principal's identity
- that the agent is not also acting for others
- that the principal has not declined renewal — in the core, revocation is non-renewal within one validUntil; the profile’s credentialStatus re-adds a live lookup and this card’s non-revocation leg is what lets the presentation carry it instead
- what the delegate actually did in the principal’s name — the invocation record lives on the framework side (the artifact gap, cred-tf #40 Q8)

#### Adversary, per claim

- **verifier · verifiers-colluding** — principal hidden; chain length hidden up to maxDepth

#### Horizon

- the shortest validUntil in the chain
- status freshness

#### Conformance fixtures

Families: `accepts` · `rejects-unsat` · `rejects-verify`

Rejection codes: `scope-escalation (unsat)`, `depth-exceeded`, `hop-revoked`

#### Construction options

*Routes through the construction-selection gate ([DTG-ZKP-REQ] §16.1), each with its cost as measured or as conjectured.*

| route | cost | status | source |
|---|---|---|---|
| recursive/folding proof per hop | unmeasured | unmeasured | PATH-MAP P4 (PLONKish/folding counter-proposal welcome) |

#### Issuance requirements

- VDC as an edge credential type (cred-spec PR #19, rebased over WD02 vocabulary) with ZK-friendly signatures — X3 applies
- the delegator’s identifier is `directed`, a context-scoped identifier per delegation, not `pairwise` (cred-spec #31 pre-merge note for #19)
- grant and acceptance digests are digestMultibase (WD02 D-A); the acceptance is REQUIRED (cred-tf #40; review feedback folded per #31)
- chaining (`parent`, `maxDepth`, `credentialStatus`) exists only in the opt-in profile, visible to the verifier, costs stated (cred-tf #40 §1)

#### Provenance

- cred-spec PR #19 (VDC draft)
- liveness reqs v0.4 delegation evidence
- ADR-001 §05
- ePrint 2026/333 App. B.1
- cred-tf #40 (delegation as a design-time case; the chain-resolution boundary) · cred-spec #31 (#19 pre-merge checklist)

#### Record history

| date | to | by | evidence |
|---|---|---|---|
| 2026-08-28 | `requested` | mitchuski | zkp-tf #18 (talltree 08-26 / Scott 08-27): seed set for the board |
| 2026-09-05 | `carded` | mitchuski | ScottJeezey accepted delegation-chain validity as a ZKP TF target (cred-tf #40, 2026-08-24); predicate shape + acceptance clause + core/profile split from stormer78’s note; issuance lines from cred-spec #31 |

