# AV · dtgwg-cred-spec issue #58 (comment) — the detached citation accepted from the proof side; record 008's disposition; two notes on what the citation still shows
chip: REPLY ON OUR OWN ISSUE · THE FRAMEWORK EDITOR ANSWERED · THE CREDENTIAL MAINTAINER RULED 30 SEPT (CONTEXTS v2) · RECORD 008 AMENDED IN PR #12
thread: https://github.com/trustoverip/dtgwg-cred-spec/issues/58
note: stormer78 (Trust Tasks editor) proposed on 25 Sept that the credential carry no citation at all — an issuer-signed `credential-citation/0.1` binds the salted credential digest to the exchange; bmiller59 +1'd; geoffturk's view is awaited. We filed #58 asking for a committed form (record 008 route 1). The detached citation does what route 1 asked for by other means, so the proof side accepts it and amends 008. Two proof-side notes only: a shown citation is a stable pair; proving possession of a citation without showing it is a signature-in-circuit, which is why route 2 stays the ZK item. No direct address.
ledger: 60
proverb: What the framework can carry beside the credential, the proof need not hide inside it.
---
From the proof side, now that the detached citation is assigned to Contexts `v2`: it does what #58 asked for, by other means, and the record that filed this issue is amended to say so.

**What route 1 wanted.** Record 008 asked the credential layer for a committed form of the exchange citation so that a credential at rest and its other presentations carry no plaintext that names the exchange. A credential that carries *no* citation meets that with no commitment to open and no blinding value for the holder to keep. The at-rest half of 008's statement is satisfied at the credential layer, and route 1 (a committed form inside the credential) is superseded. The record now says this in its issuance lines and provenance ([dtgwg-zkp-spec PR #12](https://github.com/trustoverip/dtgwg-zkp-spec/pull/12), Round 2 branch), with the horizon stated: until `v2`, a `v1` credential still carries the plaintext pair.

**What stays with the task force.** Two things, both already named in the before/after table. First, per-context pseudonyms (route 2): the case where a holder must show the same verifier it is the same holder in the same context, and no one else. Second, repeated presentations of one credential remain linked by its signature and identifiers; that is BBS or ZK work over the credential, not over the citation.

**Note 1 — a shown citation is a stable pair.** `credentialDigestMultibase` and `taskContext` do not change between showings, and the citation carries the issuer's signature. Two verifiers each shown the citation can link those two presentations to each other and to the exchange, which is exactly what a visible commitment C did in route 1. The table's row *"only when the holder chooses to show the citation"* is right, and the holder's choice is the entire privacy of the design; worth one sentence in the citation specification so a wallet does not attach it by default.

**Note 2 — why not prove possession instead.** A holder could prove in zero knowledge that it holds a valid citation for the expected exchange over the presented credential, without showing the citation. That is a signature verification inside the circuit (eddsa-jcs-2022 → Ed25519 over the canonical bytes), on the order of tens of thousands of constraints for the signature alone, against a verifier that already holds the exchange and learns nothing from the plaintext. The plaintext showing is the right default; the record notes the in-circuit form as a not-preferred option.

**Two small dependencies, stated so they are checked together.** The citation's digest is only unguessable because of #38's `salt` over the credential (record 022's option 1, adopted there as written). And `parentThreadId` MUST NOT be carried, as proposed, or the citation names the enclosing request exchange to every verifier shown it.

When the Trust Tasks specification lands `credential-citation/0.1` and the `v2` context drops the two members, #58 can close as resolved by the detached citation; record 008 already reads that way.

*What the framework can carry beside the credential, the proof need not hide inside it.*
