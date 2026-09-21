# AI · dtgwg-zkp-spec PR #8 (comment) — reply to the credential maintainer's review of 16 September; the answers are in PR #11
chip: REPLY TO THE REVIEW · LINKS PR #11 · SUPERSEDES Y
thread: https://github.com/trustoverip/dtgwg-zkp-spec/pull/8
note: geoffturk reviewed PR #8 on 16 Sept (10:44 UTC); the chair merged it at 21:07 UTC. The eight items are answered in the record, not in the thread — this comment maps each to where it landed and states the one finding. Y (second-commit note) is superseded by the merge. No direct address; the reviewer is "the review" / "the credential maintainer".
ledger: 46
proverb: Eight questions answered in eight threads is a conversation; answered in one record it is a specification.
---
The review of 16 September is answered in [PR #11](https://github.com/trustoverip/dtgwg-zkp-spec/pull/11), one commit on `main`, by item:

1. **Where the commitment lives** — record 007 now states the task force's preference: a verification method in the identifier's DID document (a `Multikey` entry carrying the commitment, or a SNARK-native key as the identifier's own key), not a member of any credential. One per identifier, shared by every credential that names it, resolved the way a verifier already resolves the signing key; it changes no credential schema and leaves the credential layer one requirement — which DID methods can carry it. A credential member is the fallback only where a method cannot carry a second verification method. Integration gains an *Identifier commitment profile* section, and the preference is WG-14.
2. **MUST** — yes, conditioned on the identifier's key profile rather than on a derivation the whole graph shares: the sentence binds an identifier minted under a profile that declares co-control provable. A secure-element key with no available scalar is outside that profile, and its co-control is established at issuance by the party who can prove it (record 010's issuance-time attestation route) or not at all. WG-02 selects the first profile; the sentence need not wait on it.
3. **A record for #38** — new primitive record **022**, blinded digest references: the five digest-valued members (and `taskDigestMultibase` once PR #56 merges), the two reference kinds of the 7 September scope note kept apart, three placements with conjectured costs; the disposition stays on #38 (WG-15). 008 remains the trust-task binder's record.
4. **The `taskContext` change** — filed as [cred-spec #58](https://github.com/trustoverip/dtgwg-cred-spec/issues/58), against PR #56's shape; 008 re-read against it.
5. **The catalogue** — the Introduction names the seven types, each an `xref` into the credential glossary.
6. **Issuer conformance** — target 5 now says this specification profiles the issuer-side requirement; the credential specification's Conformance is not extended, and its schema is unchanged unless the credential layer chooses to give a requirement a member.
7. **Document Status** — [DTG-CRED] is pinned to a minimum compatible Document Status, 0.4.0, read at `994a3d6`; this draft's own header is `Version 1.0 / Working Draft 0.1.0` under the same convention.
8. **Titles and xrefs** — the 34 merged-PR citations in live record fields are section titles now; 22 `DTG_CRED` cross-references render and resolve against the published glossary today. The two deleted term files are cross-referenced in the Terminology introduction.

The answer to question 2 of #23 carries a finding, now on the record in 007 and 010: an Ed25519 `did:key` carries no second verification method, so the WD02 example set cannot satisfy 007's issuance line as it stands; `did:peer` (numalgo 2/4) and `did:webvh` can. That is the first implementation's first task, and the conformance fixtures are its acceptance tests. Record 011's implicit answers on #9 are stated there today, citing 011. The PR description's #27 link is corrected — Round 1 runs on #23.

*eight questions answered in eight threads is a conversation; answered in one record it is a specification.*

⚔️⊥⿻⊥🧙
