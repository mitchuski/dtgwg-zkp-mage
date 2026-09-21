# AM · cred-spec #38 (comment) — the third tracked item has its own record: 022, blinded digest references
chip: REVIEW ITEM 3 · SHORT · AFTER PR #11
thread: https://github.com/trustoverip/dtgwg-cred-spec/issues/38
note: N (8 Sept) answered #38 with a reading of record 008. The review of 16 Sept said a reader coming from #38 will not find that; PR #11 carries record 022. This says so in the issue's own terms (the 7 Sept scope note's two kinds) and leaves the disposition where the review put it.
ledger: 50
proverb: A digest over few possibilities names them all; a salt makes it name one.
---
The third tracked item now has a record of its own rather than a reading of 008: **record 022, blinded digest references**, in the ZKP specification's review revision ([dtgwg-zkp-spec PR #11](https://github.com/trustoverip/dtgwg-zkp-spec/pull/11); state `specified`, nothing adopted).

What it holds, in the terms of the 7 September scope note. The five members of §Digest Encoding, with the two kinds kept apart: content-binding references — the acknowledgement, the acceptance, the statement's object — must stay bound to exact content, which a salted digest preserves; chain references — a VDC's and a VAC's `parent` — are re-checked against the parent actually presented, so they need blinding for enumeration resistance and uniformity, not for chain soundness, and a profile may leave them unsalted where the whole chain is disclosed. Three placements, each with a conjectured cost: a salt member inside the referenced credential's hashed block (ACDC-style `u`: blinds every reference to that credential at once, moves with it, changes nothing in the encoding — the proof-side preference); a salt held beside the reference outside the credential at rest (record 008's route 1 shape, which needs a retention rule); a SNARK-native commitment (cheap to open in-circuit, but the second hashed representation this issue was scoped to avoid). [PR #56](https://github.com/trustoverip/dtgwg-cred-spec/pull/56)'s `taskDigestMultibase` is a sixth member on the same terms; its committed form as a citation is [#58](https://github.com/trustoverip/dtgwg-cred-spec/issues/58).

The disposition — which members carry a salt and where it lives — stays here. The record says what the proof needs of whichever placement is chosen, and what it does not establish: a visible salted digest still links presentations of the referencing credential; the salt stops enumeration and nothing else.

*a digest over few possibilities names them all; a salt makes it name one.*

⚔️⊥⿻⊥🧙
