## Requests Answered

This section is informative.

A request is kept in the requester's own form — an architecture decision record, an issue, a decision taken on a call — so that a construction can be checked against what was actually asked rather than against the construction's own paraphrase of it. Every request names the construction record that answers it; every clause of the request says where in that record it landed, or that it did not. This section is generated from the machine-readable requests in `conformance/requests/`.

The first request is Glenn Gore's ADR-001, *Community-Anchored Proof*, named by the task force as its first construction to seed the work: it defines what must be proven and what any implementation must satisfy, and deliberately does not choose how. The construction record is the how. Requests are ordered by date.

### Request ADR-001 · Community-Anchored Proof

*Choosing the first zero-knowledge use case to implement against DTG credentials — and what any implementation of it must satisfy.*

| | |
|---|---|
| kind | architecture-decision-record |
| author | Glenn Gore (stormer78), First Person Project |
| status | Proposed · 2026-08-25 |
| audience | Four working groups: DTG Credentials · ZKP · Trust Registry · Governance |
| source | https://docs.fpp.storm.ws/ (ADR-001) · named on the board: zkp-tf #18 — ScottJeezey 2026-08-27: 'a natural first one to seed it with' |
| answered by | [Construction 010 · Community-Anchored Proof (ADR-001)](#construction-010-community-anchored-proof-adr-001) |

> Clause texts below are close paraphrases for crosswalk purposes; the record of authority is Glenn's document. The ADR is deliberately format-agnostic and 'does not choose how to build it' — the construction record is the how.

**Decision.** The first zero-knowledge proof implemented against DTG credentials is the Community-Anchored Proof the Credentials Core Specification already describes: a relationship exists inside a shared community, without revealing who is in it.

**The statement the holder makes.** “A member of community C has a working relationship with me, and I am also a member of community C.”

**What must be proven, together, in one proof.**

1. the holder possesses a valid relationship credential
2. the holder possesses a valid membership credential from community C
3. the party who issued that relationship credential also holds a valid membership credential from the same community C — 'the hard one': a statement about someone else's credential, proven without the other party online, asked, or aware

#### Crosswalk — where each clause lands in the construction record

Status: **covered** (the record carries it as written) · **refined** (carried with a precision the request did not state) · **added** (a clause the task force found missing) · **partial** (carried in part; the gap is named) · **open** (belongs to another group or a profile). Counts: covered 15 · refined 4 · added 2 · open 4 · partial 3.

| clause | group | requirement (paraphrase) | where the record carries it | status | refinement |
|---|---|---|---|---|---|
| P1 | privacy | reveals no relationship identifier from the relationship credential | 010 adversary (verifier · verifiers-colluding) | **covered** |  |
| P2 | privacy | reveals no identifier of the counterparty who issued it | 010 adversary | **covered** |  |
| P3 | privacy | reveals no identifier of the holder beyond attributes the holder deliberately discloses | 010 yield (deliberate disclosure line) | **covered** |  |
| P4 | privacy | two proofs from the same credentials cannot be linked — by one verifier or by verifiers comparing notes | 010 method (nullifier clause, parameterised) · adversary (verifiers-colluding) | **refined** | full show-unlinkability cannot coexist with reuse detection in the same context (ePrint 2026/333 §5.3); parameterise by context: unlinkable across contexts, the declared nullifier the only link within a reuse-detecting one |
| P5 | privacy | a verifier learns the outcome and deliberately disclosed attributes, nothing further | 010 yield | **covered** |  |
| S1 | soundness | a party lacking the required credentials cannot produce a verifying proof | 010 method 1–3 · conformance fixtures rejects-unsat / rejects-verify | **covered** |  |
| S2 | soundness | clause 3 cannot be satisfied unless the counterparty genuinely holds a membership credential from the same community | 010 method (set-membership on the voucher's grant leaf, card 001) | **refined** | proves the community-issued grant half only (cred-spec PR #12 pair; PR #26 carve-out) — the acknowledgement is not in the presenter's hands |
| S3 | soundness | the counterparty need not be online, consulted, or aware | 010 witness (proven from root_C, not from the voucher) | **refined** | under WD02 pairwise identifiers the voucher's linkage (VRC-side ↔ VMC-side identifier) must have been supplied at issuance or avoided by one directed identifier — card 007 / HR-2; otherwise clause 3 is unprovable offline |
| S4 | soundness | the presenter proves they are the subject of the credentials, not merely a holder of copies | 010 method (key-binding, card 004) | **covered** |  |
| S5 | soundness | bound to a verifier challenge; not replayable to another verifier or time | 010 method (transcript-bind, card 003) · public inputs transcriptDigest | **covered** |  |
| S6 | soundness | (added by the ZKP TF) the voucher is not the holder — a self-vouch is unsatisfiable | 010 method (distinctness, card 005) | **added** | without it a member with two identifiers vouches for themselves and clauses 1–3 verify |
| S7 | soundness | (added, WD02) the identifiers a party used in the VRC and in their VMC are controlled by one secret | 010 method (key-binding, card 007) | **added** | cred-spec PR #30 §Community-Anchored: 'the proof must additionally establish common control' |
| C1 | currency | does not verify if any relied-on credential is revoked or suspended | 010 method (non-revocation, card 006) | **covered** |  |
| C2 | currency | states the registry state it was made against; the verifier judges recency | 010 public inputs (root_C, rl_root, epoch) · yield | **covered** |  |
| C3 | currency | establishing currency must not itself identify the holder | 010 adversary (registry-operator · issuer-verifier-colluding) | **covered** | holds only if roots are fetched without a per-holder query — stated as the condition |
| C4 | currency | the delay between a change and proofs reflecting it is bounded and published | 010 horizon (status freshness, C4 bound) | **open** | the bound is a registry/governance publication, not a proof property — construction carries it as a horizon input |
| T1 | registry | a verifier confirms the community is one it recognises without learning which member | 010 public inputs (root_C at a stated registry state) | **covered** |  |
| T2 | registry | whatever the proof relies on from a registry is independently checkable by a party that did not create it | 006 set-root primitive route · public inputs set roots | **refined** | the set-root primitive (cred-tf #40): signed published root + (non-)membership witness carried in the presentation; no live lookup |
| T3 | registry | two verifiers checking against the same registry state reach the same verdict | 010 conformance fixtures (current family) · fixtures determinism | **covered** |  |
| T4 | registry | a registry's obligations are stated as an interface so any conformant registry can serve these proofs | — (Trust Registry TF) | **open** |  |
| D1 | deployment | proving is feasible on the devices that hold credentials — a phone or an agent — within a stated time and memory budget | 010 substitutions (Groth16 est. ≈35–45k constraints ~2 s; blackbox 0.03 s/vouch) · stacks layer (ProveKit phone numbers) | **partial** | budgets not yet stated by the TF; the options layer supplies measured numbers per stack for the gate to set them |
| D2 | deployment | verification is cheap enough to run inline | lab: ~8–10 ms verify (Groth16) | **covered** |  |
| D3 | deployment | a proof fits the transports DTG credentials already travel over | stacks layer: proof size column (721 B Groth16 vs ~716 KB WHIR) | **open** | a profile decision; the options table shows both numbers |
| X1 | conformance | published test vectors covering proofs that must verify and proofs that must fail | 010 conformance fixtures families · runtimes/fixtures format (accept/reject/lint vectors, rejection-reason register) | **partial** | format exists and is consumed cross-language; 010's own vector family not yet cut |
| X2 | conformance | an independent implementation can verify another's proofs | registry (independent reproduction) · consumer-py (zero-shared-code consumer) | **partial** | reproduced for cards 001/002/003/005; 010 composition not yet built |
| X3 | conformance | any requirement on how credentials are issued is stated explicitly and early | 010 issuance (ZK-friendly signature or published commitment; issuer linkage MAY) · cred-spec #17 | **covered** |  |
| G1 | governance | a community declares whether private presentation is required, default, or optional | — (Governance; cred-spec §Governance Considerations) | **open** |  |
| G2 | governance | the assurance a proof carries is traceable to the governance of the issuing community | 010 yield (assurance class via C's governance) · doesNotEstablish (admission correctness) | **covered** |  |

#### Acceptance tests → fixture families

| test | the record's words | family |
|---|---|---|
| Accepts | a valid proof verifies and a written analysis shows the verifier learned the outcome and nothing more | `accepts` |
| Rejects | with the voucher not a member of C the proof cannot be produced or does not verify — clause 3 does real work | `rejects-unsat / rejects-verify (the construction distinguishes the two)` |
| Unlinkable | two proofs from the same credentials given to two verifiers who compare cannot be linked | `unlinkable` |
| Current | after the voucher's membership is revoked a proof relying on it stops verifying within the published bound | `current` |

#### Explicitly out of scope in the record

- the proof system (format-agnostic)
- the construction — how the three clauses combine into one proof (the construction record's method)
- how a registry publishes what proofs rely on (the set-root primitive is one answer)
- encodings and wire formats
- identity proofing itself
- delegation chains — 'the natural next case' → construction 020

#### What the record asks of each group

| group | ask |
|---|---|
| DTG Credentials | confirm the three clauses match the specified Community-Anchored Proof; identify issuance requirements |
| ZKP | choose the construction, build a reference prover and verifier, publish X1/X2 vectors |
| Trust Registry | define what a registry exposes for a proof to rely on; how currency and revocation are expressed |
| Governance | how a community declares private presentation policy; how assurance traces to governance |

#### Consequences the record names

- requirements on issuance reach every issuer — hence X3 early
- registries gain a new obligation; revocation must be rethought so currency checks do not undo privacy
- real cost on holder devices — hence D1
- a harder first milestone by intent
