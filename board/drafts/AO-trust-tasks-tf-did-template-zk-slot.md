# AO · trust-tasks-tf (new Ideas discussion, or comment on #508) — a key slot for the ZK-openable commitment in DID templates (WG-14)
chip: NEW 21 SEPT · THE WG-14 HOOK · FINDS THE FIRST IMPLEMENTATION'S OWNER
thread: https://github.com/trustoverip/dtgwg-trust-tasks-tf/discussions/544
note: #508 (merged 17 Sept) gave templates a keys block: purpose ∈ {signing, keyAgreement}, algorithms ∈ {ed25519, x25519, p256, mldsa44, mldsa65}, most preferred first; templates also carry `methods` and a `document`. VTI mints did:peer (vta-service/src/did_peer.rs; numalgo in vta-sdk vm_resolver). Target = a new Ideas discussion (post-draft.mjs cannot create one; GraphQL createDiscussion) or a comment on the merged PR — Mitch's pick.
ledger: 53
proverb: A template that names the key it will mint has already answered what the proof can bind; one that does not has answered too.
---
[#508](https://github.com/trustoverip/dtgwg-trust-tasks-tf/pull/508) gave a DID template a `keys` block in which each slot names its purpose (`signing`, `keyAgreement`) and its acceptable algorithms, most preferred first — `mldsa44` where the implementation can, `ed25519` otherwise. That is the shape the ZKP task force's first open question needs, so it is put here, where the templates are built.

**The question (WG-14, [dtgwg-zkp-spec PR #11](https://github.com/trustoverip/dtgwg-zkp-spec/pull/11)).** Every construction that proves two identifiers are one controller's — record 007, and the community-anchored proof (010) whenever a member declared `pairwise` toward the community and toward a counterparty — needs each identifier to be, or carry, a ZK-openable commitment to the holder secret: a SNARK-native key (BabyJubJub, BLS12-381) or a Poseidon/KZG commitment published beside an Ed25519 key. The task force's proposed answer to *where it lives* is a verification method in the identifier's DID document, not a member of any credential. The consequence the credential maintainer asked the task force to find out first: an Ed25519 `did:key` carries exactly one key and cannot carry it; `did:peer` (numalgo 2 and 4) and `did:webvh` can.

**Two asks of the template shape.**

1. A third slot purpose — `zkCommitment` (or `proofBinding`) — whose algorithms list can name `babyjubjub`, `bls12381g1`, or a commitment scheme, with the same most-preferred-first semantics. A template that lists the slot mints identifiers under the profile WG-14 calls *co-control provable*; one that does not is honestly outside it, and a verifier can tell which from the template rather than from a failed proof.
2. Whether a `did:peer` template can carry that second verification method today. VTI already mints `did:peer` (`vta-service/src/did_peer.rs`), so the first implementation's first finding may be a template, not a new method.

Nothing here touches a shipped 1.0 or 2.0 spec; it is a candidate for `_shared/0.3` if the group wants the slot. The task force will carry the answer as WG-14's disposition.

*a template that names the key it will mint has already answered what the proof can bind; one that does not has answered too.*

⚔️⊥⿻⊥🧙
