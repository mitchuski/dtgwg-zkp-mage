# AK · cred-spec #9 (comment) — the four points of 10 September; what record 011 answers; the two new asks, answered
chip: SUPERSEDES U · AFTER PR #11 · CITES 007 009 011 020 021
thread: https://github.com/trustoverip/dtgwg-cred-spec/issues/9
note: U (approved 15 Sept, never posted) answered the 10 Sept points against PR #8's branch. The 16 Sept review confirmed 007/009/010/011 against this thread, asked that 011's implicit answers be stated here, and raised two asks new to the credential layer. This folds U and answers both; the records it cites are on `main` (PR #8) and in PR #11.
ledger: 48
proverb: The proof reads what the credential carries; the credential must carry what the proof reads, or the sentence is a wish.
---
The four points of 10 September, from the proof side, now that the working draft is on `main` and the review revision is open as [dtgwg-zkp-spec PR #11](https://github.com/trustoverip/dtgwg-zkp-spec/pull/11). Records cited by number resolve on the [published page](https://trustoverip.github.io/dtgwg-zkp-spec/); nothing there is adopted.

**1. Subject or issuer — yes.** Record 007 states it that way: two identifiers appearing in DTG credentials, as subject or as issuer, whatever scope each declares, under one controller. The VRC-issuer case is statement 3 of the community-anchored record (010).

**2. The VRC MAY is the credential layer's — agreed.** 007 carries it as an issuance line, not a clause: the counterparty produces the linkage at issuance by running 007 in its own hands; 010 consumes it. The artifact's format, authenticated statement and private composition are still to be specified and tested.

**3. Non-correlation is a design requirement of the record**, against the verifier and colluding verifiers: transcript-bound, no identifier-derived value emitted. A disclosed linking field would violate it.

**4. The chain predicates are a different primitive — named.** A child's `issuer` equalling its parent's `credentialSubject.id` across credentials signed by different parties, with no holder secret in the relation, is hidden-value equality: record **009**, composed by **020** (the VDC chain) and **021** (the VAC chain). The shared-subject rule splits the same way: 009 where one identifier appears in both credentials, 007 where the holder used two. Of the editor's-note predicates, two rest on common control and two on equality.

**What record 011 answers, stated here as the review asked.** The persona-to-pairwise link is a co-control witness — 007 in the presenter's hands — and the VPC plays no part in the proof. The counterparty's persona-to-pairwise link needs the counterparty's attestation: the same asymmetry as statement 3.

**The two new asks.**

- *Where the ZK-openable commitment lives.* The task force's preference, for this specification to give a home: a verification method in the identifier's DID document (a `Multikey` entry with the commitment, or a SNARK-native key), not a credential member — one per identifier, shared by every credential naming it, resolved as the signing key is; no schema change here. The consequence for the WD02 examples is a finding, now WG-14: an Ed25519 `did:key` carries no second verification method and cannot satisfy 007 as it stands; `did:peer` (numalgo 2/4) and `did:webvh` can.
- *Can the requirement be a MUST.* Yes, conditioned on the identifier's key profile: it binds an identifier minted under a profile that declares co-control provable (a derivable key with a published commitment, or a SNARK-native key). A secure-element key with no available scalar is outside the profile; its co-control is established at issuance by the party who can prove it, or not at all. WG-02 selects the first profile; the sentence need not wait on it.

On the xref path: the record identifiers to cite from here are 007, 009, 011, 020, 021 and, for #38, 022; the reverse entries resolve as `DTG_CRED` cross-references in PR #11.

*the proof reads what the credential carries; the credential must carry what the proof reads, or the sentence is a wish.*

⚔️⊥⿻⊥🧙
