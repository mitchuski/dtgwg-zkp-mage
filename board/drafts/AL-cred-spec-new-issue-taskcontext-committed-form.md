# AL · cred-spec (new issue) — carry the trust-task citation in committed form: `taskContext` + `taskDigestMultibase` as durable correlators (record 008)
chip: FILED AT THE MAINTAINER'S REQUEST · REVIEW ITEM 4
thread: https://github.com/trustoverip/dtgwg-cred-spec/issues
note: The review of PR #8 (16 Sept, item 4) asked that record 008's taskContext change be an issue on dtgwg-cred-spec the Credentials TF can schedule; PR #18 is parked and is not it. Written against PR #56's shape (initiating-document id + task digest). Created with gh issue create (post-draft.mjs posts comments, not issues); receipt appended by hand.
ledger: 49
proverb: A correlator in the clear is a promise made to every verifier at once; commit to it, and it is made one verifier at a time.
---
**What is asked.** A credential that cites the exchange it was issued in carries the citation in the clear: under [PR #56](https://github.com/trustoverip/dtgwg-cred-spec/pull/56), `taskContext` (the initiating document's `id`) and `taskDigestMultibase` (its task digest). Both are stable across every presentation of that credential, so a credential presented twice is linked by its citation even where everything else about it is proven in zero knowledge. The ZKP specification's [record 008](https://trustoverip.github.io/dtgwg-zkp-spec/#construction-008-blinded-binder-taskcontext-hiding-presentation-correlation-unresolved) (blinded binder) asks the credential layer for one member: a committed form of the citation that a holder can open, in proof, to the exchange a verifier already holds.

**The shape.** Route 1 of record 008: the issuer carries `C = commit(taskContext, taskDigestMultibase; u)` with a blinding value `u` the holder keeps; a verifier that holds the exchange checks the opening, or in a proof the holder shows that `C` opens to the exchange the verifier names. Route 2 — a per-context pseudonym derived by a PRF from the holder secret and a context descriptor — is the fuller construction and stays on the ZKP side. The record also states what neither route gives: a visible `C` still links presentations of the same credential; hiding `C` inside the proof is what removes that.

**What is this specification's to decide**, so the Credentials TF can schedule it:

- whether the committed form replaces the pair or sits beside it under a profile;
- the member name(s), and that the value is `digestMultibase`-encoded per §Digest Encoding so both layers agree on the encoding;
- generation, distribution and retention of `u` — never published beside a low-entropy plaintext;
- how §Outcome Interpretability pairs a committed citation with outcome evidence: the verifier that holds the outcome evidence already holds the plaintext, so the opening is against what it holds, and nothing is lost there.

**What stays with the ZKP TF:** the proof that `C` opens to the exchange, its composition into the enclosing records, the per-context pseudonym — record 008 on `main`, re-read against PR #56 in [dtgwg-zkp-spec PR #11](https://github.com/trustoverip/dtgwg-zkp-spec/pull/11).

**Relation to #38.** `taskDigestMultibase` is a digest over a document, so the enumeration concern of #38 reaches it; record 022 (PR #11) covers the digest-valued members and would cover this one on the same terms. This issue is the citation's committed form, not its salt.

Filed at the credential maintainer's request on the ZKP working draft review (16 September). [PR #18](https://github.com/trustoverip/dtgwg-cred-spec/pull/18) is parked and is not this issue.

⚔️⊥⿻⊥🧙
