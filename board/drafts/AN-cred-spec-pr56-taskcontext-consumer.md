# AN · cred-spec PR #56 (comment) — record 008's consumer: the citation pair is a durable correlator; #58 asks for its committed form; 022 reaches taskDigestMultibase; eddsa-jcs-2022 is fine with the commitment beside it
chip: NEW 21 SEPT · BEFORE THE MERGE · NO OBJECTION TO THE SHAPE
thread: https://github.com/trustoverip/dtgwg-cred-spec/pull/56
note: albertoleon7794 opened #56 on 17 Sept (the credential half of the #18 split; merge order trust-tasks-spec #15 first). No comments, no reviews. It re-anchors taskContext (initiating document's id), adds taskDigestMultibase, and RECOMMENDS DataIntegrityProof + eddsa-jcs-2022. Three notes; nothing asked of the PR itself beyond a pointer to #58.
ledger: 52
proverb: Name the exchange and you can find it again; commit to the name and only the one who was there can.
---
From the proof side, reading this as record 008's consumer ([the ZKP specification](https://trustoverip.github.io/dtgwg-zkp-spec/) on `main`, re-read against this PR in [PR #11](https://github.com/trustoverip/dtgwg-zkp-spec/pull/11)). No objection to the shape; three notes.

**The pair is a durable correlator.** `taskContext` (the initiating document's `id`) and `taskDigestMultibase` are stable across every presentation of the credential, so a credential presented twice is linked by its citation even where everything else about it is proven in zero knowledge. That is the reason for [#58](https://github.com/trustoverip/dtgwg-cred-spec/issues/58): a committed form of the citation that the holder opens, in proof, to the exchange a verifier already holds. Nothing here needs to wait on it — the committed form is a member beside these two, or a profile that replaces them — but a reader of §The `taskContext` Property should find the pointer.

**`taskDigestMultibase` is a sixth digest-valued member.** It takes the §Digest Encoding form, so the enumeration concern of #38 reaches it wherever the cited document is low-entropy; record 022 (PR #11) covers it on the same terms as the five.

**`eddsa-jcs-2022` as the RECOMMENDED proof is compatible with the constructions** as long as the identifier-side commitment sits beside it (record 010's issuance line; the identifier commitment profile in PR #11). The signature scheme is the non-swappable choice — a proof system can be replaced by a software update, a credential signature cannot without re-issuance — so recommending the Ed25519 suite now means the ZK-openable commitment must live with the identifier, not in the signature. That is what WG-14 proposes.

*name the exchange and you can find it again; commit to the name and only the one who was there can.*

⚔️⊥⿻⊥🧙
