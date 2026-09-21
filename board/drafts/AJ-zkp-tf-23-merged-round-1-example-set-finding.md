# AJ · zkp-tf #23 (reply) — merged as the working draft; Round 1 to 22 September; question 2 answered, and the answer's finding (WG-14)
chip: AFTER THE MERGE · SUPERSEDES T AND V · ANCHOR THREAD
thread: https://github.com/trustoverip/dtgwg-zkp-tf/discussions/23
note: PR #8 merged 16 Sept 21:07 UTC (chair). T (after-call note) and V (Round 1 nudge) were approved 15 Sept but never posted; thirteen days on, under a merged draft, they read stale — this one carries what still matters from both (the reading path, the date, the silence line) plus the merge and the finding. Post before 22 Sept.
ledger: 47
proverb: A merge closes a branch, not a question; the round runs where the questions are.
---
**Merged.** The working draft went into `main` on 16 September ([PR #8](https://github.com/trustoverip/dtgwg-zkp-spec/pull/8), merged by the chair); the [published page](https://trustoverip.github.io/dtgwg-zkp-spec/) renders from `main`. Round 1 — the shape of the draft — runs here to 22 September, as the anchor above proposed. A review revision is open as [PR #11](https://github.com/trustoverip/dtgwg-zkp-spec/pull/11): nothing adopted, evidence states unchanged.

**Question 2 has an answer, and the answer has a finding.** The credential maintainer answered the second of the four questions in the PR review: the artifacts the first implementation should support are the WD02 examples as they stand — `did:key` and `did:peer` Ed25519 identifiers, the VMC pair with the community-issued grant as the membership leaf, a VRC issued from a `pairwise` identifier carrying the issuer's linkage proof under the MAY — with the caveat that if that set cannot satisfy record 007's issuance line, that is the first thing to find out. Read against the record, it cannot, as it stands: an Ed25519 `did:key` carries exactly one key and has no place for the ZK-openable commitment 007 requires; `did:peer` (numalgo 2 and 4) and `did:webvh` can carry one. PR #11 states the task force's preference — the commitment as a verification method in the identifier's DID document, not a member of any credential — conditions the co-control MUST on a key profile rather than on universal derivation, and puts the finding on the record as **WG-14**: the first implementation's first task.

**Also in PR #11:** record 022 (blinded digest references) gives cred-spec #38 a record; the credential catalogue is corrected to the seven types; the credential specification is pinned by Document Status (0.4.0), cited by section title and cross-referenced by glossary term; Conformance target 5 says which specification profiles the issuer-side requirement; the `taskContext` change is filed as [cred-spec #58](https://github.com/trustoverip/dtgwg-cred-spec/issues/58).

**Reading path**, unchanged: the Implementation Guide, one primitive record (001), one composed record (010), then Appendix E — sixteen records now, fifteen numbered notes (WG-01 to WG-15), which is the list Round 1 is deciding. A position record in the shape the evidence repository's `PATH-MAP.md` describes — ratify · refine · refute · build, on which item, with a reason — is the most useful reply; a refutation with a reason moves the draft further than an approval.

Silence by 22 September records no response; it does not establish agreement, ratification or acceptance of any construction. The next round examines records individually; WG-14 and the example-set finding are proposed as its first item.

*a merge closes a branch, not a question; the round runs where the questions are.*

⚔️⊥⿻⊥🧙
