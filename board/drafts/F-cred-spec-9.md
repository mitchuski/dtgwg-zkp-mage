# F · cred-spec #9 — the common-control linkage, answered from the proof layer (card 007)
chip: NAMED CROSS-TF WORK (#31)
thread: https://github.com/trustoverip/dtgwg-cred-spec/issues/9
note: geoffturk's WD02 merge plan (#31, 09-02) lists #9 as "stays open — and gains weight … the resolution is cross-TF work with the ZKP task force". Nobody has written the voucher-side asymmetry. This is the ZKP TF's half. Post after re-reading #31's row for #9.
ledger: 22
proverb: Two names from one hand are proven by the hand that holds them; the other hand must speak for its own.
---
#31 lists this issue as gaining weight after WD02: the community-anchored proof (both parties' identifiers `pairwise` by default under #30), the VAC's shared-subject rule and the VDC's delegation predicate all lean on a common-control linkage that no credential encodes. The proof layer's answer, written as a board card (007 in the evidence repo, `board/cards/007.json`):

**The proof.** Two identifiers open to one holder secret under their own salts; a different secret behind either is unsatisfiable. It adds no identifier to the disclosure set and mints no cross-presentation handle — the enclosing proof decides what is shown, this clause only says "same hand".

**What it needs from the credential layer** is a requirement, not a link: every identifier that may later be co-proven is, or carries, a ZK-openable commitment to the holder secret — a SNARK-native key, or a published commitment beside the Ed25519 key (the #17 shape, applied to identifiers). The credential never states which identifiers are linked; it makes the proof possible.

**The asymmetry the text should name.** A presenter can prove only linkages derived from a secret in their own hands. In the community-anchored proof, statement 3 concerns the *counterparty's* two identifiers — the one in their VMC and the one they issued the VRC from — and the presenter cannot prove those co-controlled. Two honest options, both already implied by #30: the counterparty used one `directed` identifier for both (WD02's stated default for intra-community edges), or the VRC carries its issuer's own co-control attestation to their VMC-side identifier, made at issuance — the vouch-under-community-credential shape in ePrint 2026/333, where a vouch that verifies under the community's key *is* that linkage. A one-line MAY on the VRC ("a VRC MAY carry its issuer's linkage proof") is the only member #9 would add. Without one of the two, statement 3 is unprovable, and a text that says otherwise over-promises.

Card 007 and the re-carded 010 are in the evidence repo's board; the cost line is labelled conjecture until one compile settles it.
