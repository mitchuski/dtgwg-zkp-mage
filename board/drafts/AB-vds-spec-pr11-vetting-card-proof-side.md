# AB · vds-spec PR #11 (comment) — the Vetting Card from the proof side: received bytes as witness; the two stable values are correlators
chip: PAIR WITH W · REVISED 21 SEPT · TWO NOTES, NO ASK
thread: https://github.com/trustoverip/dtgwg-vds-spec/pull/11
note: The candidate said "the same two asks as W, on the Vetting Card itself" — but the PR answers the byte-input question (Card Digest: computed over the card exactly as received; identityCommitment over a JCS-canonical object). So this does not ask it again; it says the rule answers #50's question and adds the two things a proof needs from the profile. stormer78 marked the PR ready for WG review 12 Sept (is vds-spec the home?); no reviews yet.
ledger: 51
proverb: A digest over what was received binds the hand that received it; a digest over what was meant binds nobody.
---
Two notes from the proof side, on the members a zero-knowledge presentation would have to carry.

**The received-bytes rule answers a question open on cred-spec #50.** The card digest is computed over the card exactly as received, not a re-serialisation; the identity commitment is over a JCS-canonical object. Both are right for a verifier, and neither costs a circuit anything extra — a digest is over an opaque byte string either way — but they put an obligation on the holder: a presentation that opens the card digest in proof needs the received bytes as witness, and a wallet that keeps a parsed model of the card and re-serialises it will not verify. Worth one sentence under Card Digest.

**The two stable values are the profile's correlators.** A vetter's statement carries `identityCommitment` and `cardDigestMultibase`; the community receives the statements, never the card or the salt. Within one application the commitment is meant to be the same across vetters — a declared link, and the profile says so. Across presentations of a statement both values are stable, so a statement presented twice is linked by them even where everything else is proven in zero knowledge; a private presentation of a vetting statement would hide both (record 022's shape, [dtgwg-zkp-spec PR #11](https://github.com/trustoverip/dtgwg-zkp-spec/pull/11)). Not a change to this profile — a line for its Privacy Considerations.

⚔️⊥⿻⊥🧙
