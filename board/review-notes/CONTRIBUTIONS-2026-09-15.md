# Optional contributions, woven from the ZKP side — 15 September 2026

Every thread below is one the task force is not obliged to answer. Each note says what the proof layer would add,
which record it rests on, and which other thread it ties to. Five through-lines run across them; a reply on one
thread should name the through-line so the others can point back. Nothing here is posted; drafts exist only where a
letter is given.

## The five through-lines

| line | the claim | records | threads |
|---|---|---|---|
| **A · One controller, many identifiers** | linkage is proven, never read out of a field; equality of hidden values is a different relation from common control | 007 · 009 · 011 · 012 | cred-spec #9 (U) · cred-spec #25 · trust-tasks-spec PR #6 (AD) · htx-tf #11 · cred-spec #53 (AF) · zkp-tf #18 (AG) |
| **B · Evidence is not a decision** | an authenticated statement about a procedure is not the relation a proof establishes, and neither is the admission decision | 008 · 010 negative space · Implementation Guide step 5 | cred-spec PR #50 (W) · vds-spec PR #11 (AB) · trust-tasks-tf #8 (AC) · general #31 (AA) |
| **C · Bind exactly what you mean** | a transcript binds a byte-exact predicate identifier and a pinned accept-list revision; nothing is substituted afterwards | 003 · Implementation Guide step 4 | cred-spec #52 (X) · cred-spec #48 · cred-spec #51/#54 |
| **D · Authority is a chain, delegation is a chain, and they are not the same chain** | act ∈ scope_n ⊆ … ⊆ scope_root with bounded depth and per-link status; attenuation is the authority-side sibling | 020 · 021 | cred-tf #40 · general #32 · general #25 (Q) · cred-spec #53 (agent nodes) |
| **E · Continuity survives a key** | a relationship proof outlives the key that first bound it, through an attested rotation, without the counterparty re-vouching | 004 · exploration X9 · runtimes/guardian-recovery | general #23 (AE) |

## The notes

### A · One controller, many identifiers

**cred-spec #9 — draft U (approved, armed).** The four predicates of 10 September land on 007 (subject-or-issuer common control), 009 (hidden-value equality: a child's issuer equals its parent's subject, across credentials signed by different parties), 020 and 021. Ties to #25 (the shared-subject rule splits the same way) and to #18 (the voucher's linkage is 007 in the voucher's hands, or 009 by reuse).

**cred-spec #25 — no draft; record 013 answers it.** geoffturk recorded on 7 September that the vocabulary moved under WD02 and nothing merged answers the three questions. The reply: mutual edge admissibility is carded as record 013 at `requested` — the commit-before-reveal handshake noted on 25 August, stated as a predicate: both communities' admissibility policies accept the edge form, proven to each side without revealing membership in the other. Step one stays plain published fields, no proof machinery; the record exists so the proof-shaped step has an identifier when it is wanted. Ties to #52 and #48: the admissibility predicate is itself a registry term.

**trust-tasks-spec PR #6 — draft AD (short review comment).** The task layer's `identifierScope` (`pairwise | public | any`) meets the credential layer's declared scope (`pairwise | directed | public`) on one identifier inside one witnessed exchange. The pantry takes the declared scope as a public input; a proof discloses one scope or says nothing about scope. `any` has no proof meaning. Ask for the mapping to be stated so the scope a proof discloses is the scope the task document records. Ties to htx-tf #11 (where the declaration is made) and 011/012.

**htx-tf #11 — watch, one observation if it moves.** A "face" per world is a directed identifier per context (011). margeigh's point about minimising decisions has a proof-side reading: the number of identifiers a person keeps is the number of linkage proofs (007) a cross-context presentation needs, so fewer faces means cheaper proofs and more correlation, and the UX is where that trade is made. Ties to AD.

**cred-spec #53 — draft AF (two sentences).** Declaring `nodeType: person` establishes no personhood — that is 002/010's negative space — and a profile that keys policy on nodeType makes it a disclosed public input, which is fine if said. For `agent` nodes the property meets line D: an agent's acts trace to a principal through 020/021, not through its nodeType. Ties to general #25 (Q).

**zkp-tf #18 — draft AG (held for your read).** The chair's question on the offline linkage, answered as the three routes 010 already names: directed reuse (009), issuance-time attestation carried by the VRC (007 in the voucher's hands), the blind-signature vouch (conjecture, from the call). Each gives the two parties asked a record id to answer against.

### B · Evidence is not a decision

**cred-spec PR #50 — draft W (held).** The vetting statement's `identityCommitment` is a salted commitment to identity claims — record 008's first route — and not a holder-linkage commitment; `livenessConfirmed` cannot satisfy a missing membership or voucher-linkage clause. Carry the profile's PASS limits into any private presentation. The card-digest byte-input question belongs here and on vds-spec PR #11. Post now as a review comment, or after #47 settles.

**vds-spec PR #11 — draft AB (two paragraphs).** The Vetting Card is the artifact whose digest PR #50 binds. Two proof-side asks: (1) the digest is "taken over the exact form received" — say whether that is the received bytes or the JCS canonical form, because a proof that later binds the digest (003, 008) needs the verifier to reproduce the same bytes; (2) one `commitmentSalt` per application is the right retention rule — keep it, since a reused salt would let two vetters link applications. The `eddsa-jcs-2022` proof is the X3 issuance question again (cred-spec #17): ZK-friendly, or a parallel commitment. Ties to W.

**trust-tasks-tf #8 — draft AC.** dcondrey's process-attestation receipt with selectively disclosed fields is record 008's shape applied to an artifact: hide the fields, bind the receipt to the transcript. What it establishes — a captured process produced this artifact — and what it does not — who the creator is, that the process was sound, that the outcome should be accepted — is the negative-space list a record would carry. sankarshan's "context-bound evidence" is the right name; the trust task's outcome is the decision, the receipt is evidence for it. Ties to W and AB.

**general #31 — draft AA.** The Linux onboarding flow is ADR-001's use case and, per the 8 September call, the first proof's need; nobody has replied in three weeks. Map the flow's steps to records: membership (001 over an accredited root, 004 holder binding), relationship (010), status (006), with the credential-bound membership presentation (WG-01) as the first deliverable and PR #8 as where the text lives. The one open step is the offline voucher linkage — the same question as #18, so the two threads should cite each other.

### C · Bind exactly what you mean

**cred-spec #52 — draft X (held).** Two things the request profile needs from the registry: the identifier comparison rule (byte-exact IRI, RFC 3987 §3.1 as talltree proposed) and the pinned accept-list revision, both bound into the transcript before construction (Implementation Guide step 4). A valid digest does not make an unknown predicate meaningful; no alias or version substitution after binding. Post once geoffturk answers talltree, or now.

**cred-spec #48 — discuss, one comment.** From the proof side only two properties of the namespace matter: term immutability (a bound IRI must mean the same thing for the life of every transcript that binds it) and byte-exact comparability. Ownership is not a proof concern. albertoleon's note that `…/dtg/v1` is already deployed has a proof-layer consequence worth saying: changing the namespace changes every bound predicate IRI, which is a re-issuance event of the kind the call called non-swappable. Ties to X and to the semver line below.

**cred-spec #51 / PR #54 — maintain, one line.** The ZKP draft follows the convention once #54 merges: `_Version:_ 1.0`, `_Document Status:_ Working Draft 0.1.0`, and the cross-specification "minimum Document Status" line is exactly what the `[DTG-CRED]` reference will carry.

### D · Authority and delegation

**cred-tf #40 — no draft; closing the loop.** Scott's 24 August decomposition — act ∈ scope_n ⊆ … ⊆ scope_root, bounded depth, monotone validity, revocation as non-membership — is now record 020 on the branch, with 021 as the attenuation sibling. sankarshan's preference for verification without verifier-originated live lookups is 006's set-root convention: roots and witnesses fetched anonymously per epoch. Two sentences would close the thread; it has waited since August.

**general #32 — watch.** swatchen's dual-path actuation and sankarshan's "non-collapsibility of control" split exactly as 020 (delegation: who may act for whom) and 021 (authority: what the act may be, attenuated down the chain). A proof carries the authority path; capability enforcement is local and not a proof concern. Reply only if it moves toward the credential layer.

**general #25 — draft Q, re-targeted (held).** A VMC issued to an agent node establishes membership under the community's rules, not agenthood, and an agent's acts trace to a principal through 020/021. The agents-only VTC twin is the worked example. One disclosure at a time; post when the mages.city lane is ready to be cited.

### E · Continuity

**general #23 — draft AE.** The question — who inherits a relationship when a person dies or is incapacitated — has a worked proof-side answer in exploration X9 and `runtimes/guardian-recovery` (12/12): guardian attestations that expire and must be re-affirmed, issuer-blind reissuance, and the counterparty's edges either reforming or continuing under an attested rotation of the holder key (004). adligo's custodial-wallet suggestion is a custody-model choice and sits outside the proof; what no proof establishes is legal authority — the assurance boundary. Ties to line A: the rotation must preserve common control (007) or the relationship proofs break.

## Order, if all of them

Close the loops first (cred-tf #40, cred-spec #25 — both waited since August, both are two sentences), then the pair that shares the byte-input question (W, AB), then AA where the first proof's user is, then AD/AF/X as the vocabulary threads settle, then AC, AE, and the watches. AG goes after Z, on your read.
