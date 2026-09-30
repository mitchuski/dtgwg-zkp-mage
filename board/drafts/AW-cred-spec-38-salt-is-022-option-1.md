# AW · dtgwg-cred-spec issue #38 (comment) — the REQUIRED salt is record 022's option 1 as written; nothing more for the proof side
chip: THREAD MOVED 30 SEPT (geoffturk: Contexts v2) · STILL ASKS NOTHING OF THE ZKP SIDE · THREE SENTENCES + THE v1 HORIZON · POST OR HOLD = MITCH
thread: https://github.com/trustoverip/dtgwg-cred-spec/issues/38
note: stormer78 proposed (25 Sept) a REQUIRED top-level `salt` inside every DTG credential — 32 bytes CSPRNG, base-58-btc, mandatory-disclosure under SD suites, `v2` timing — and named it as "matching record 022's preferred placement". bmiller59 +1'd. The thread asks nothing of us. Record 022 amended in PR #12 (provenance + issuance). Three sentences if it is posted at all. No direct address.
ledger: 61
proverb: A salt the credential carries blinds every reference at once; a salt held beside one reference blinds one.
---
Record 022 was written for exactly this placement: a salt inside the referenced credential's hashed block blinds every reference to that credential at once, moves with the credential, and changes neither the referencing credential nor §Digest Encoding. The proof side needs nothing further from the proposal as written; the mandatory-disclosure rule under selective-disclosure suites is the same requirement stated from the witness side (a derived credential without the salt cannot be opened to its digest). Until the `v2` context carries the salt, a `v1` credential's digest references remain enumerable, and the record states that horizon. Its provenance now carries the proposal and the `v2` assignment ([dtgwg-zkp-spec PR #12](https://github.com/trustoverip/dtgwg-zkp-spec/pull/12)); with `taskDigestMultibase` leaving the credential under #58, the members it covers are the five §Digest Encoding names plus the citation's `credentialDigestMultibase`, which this salt is what protects.

*A salt the credential carries blinds every reference at once; a salt held beside one reference blinds one.*
