# Y · dtgwg-zkp-spec PR #8 (comment) — second commit: what changed since 8 September, and what did not
chip: SUPERSEDED by the merge (16 Sept) and AI (21 Sept) · AFTER THE PUSH · FIRST IN THE QUEUE · MAKES U/T/V/W/X CITABLE
thread: https://github.com/trustoverip/dtgwg-zkp-spec/pull/8
note: Post immediately after `git push origin zk-book` lands the second commit; sha e1afc3f inserted 2026-09-14. Five lines, no argument — the arguments are in the records and in the threads U/T/W/X reply to. Keep the PR a draft until the editors line is confirmed (door D21); this comment does not change that.
ledger: 40
proverb: A branch that moved says so at the top of the thread, or the thread reads a draft that no longer exists.
---
Second commit pushed to `zk-book` (`e1afc3f`), folding the review since the draft was opened:

- **Records 007 and 020 revised** against the credential specification's merged VDC and VAC text and the common-control thread ([cred-spec #9](https://github.com/trustoverip/dtgwg-cred-spec/issues/9)): identifiers held as subject or issuer; the chain predicates named as hidden-value equality rather than common control.
- **Three records added**: 009 (hidden-value equality, a new primitive and gadget), 021 (VAC attenuation chain, the sibling of 020) and 013 (mutual edge admissibility, at `requested`).
- **Records 010, 008 and 003 touched** by the 8 September call and the credential threads since: the blind-signature vouch as an option on 010; vetting evidence ([PR #50](https://github.com/trustoverip/dtgwg-cred-spec/pull/50)) is not the voucher linkage; binding a predicate identifier does not make it accepted ([#52](https://github.com/trustoverip/dtgwg-cred-spec/issues/52)).
- **Chapters**: Implementation Guide steps 4 and 5, integration, Research and Book (10, 13, 14 September notes), Security Considerations 5, Internationalization hedged to WG-06a, the conformance vector count corrected, references completed, and **Appendix E** — an index of every numbered working-group note, which is the list Round 1 is deciding.

Evidence states are unchanged; nothing is proposed as adopted. The generated sections regenerate from `conformance/` and match; the validator reports 20/20. The record identifiers cited on the credential threads this week (007, 009, 020, 021) now resolve here.
