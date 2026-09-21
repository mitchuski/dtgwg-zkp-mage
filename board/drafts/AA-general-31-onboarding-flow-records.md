# AA · general #31 (reply) — the Phase 4 onboarding flow read as construction records; the identifier decision the flow makes first (WG-14)
chip: FOUR WEEKS UNANSWERED · THE FIRST PROOF'S USER · CITES 001 002 005 006 007 010
thread: https://github.com/trustoverip/dtgwg-general/discussions/31
note: stormer78's baseline (26 Aug, 0 replies): Phase 4 = 1 member invite + 2 member vouches + ID check → present once → VMC. "Gather-then-present" is where the proof layer lives. Mapped from the attached kernel-onboarding-summary.html. Links: the draft on main; PR #11; trust-tasks-tf #544 (AO).
ledger: 56
proverb: A flow is a list of moments someone must be believed; a record says what each moment can be believed about.
---
The Phase 4 flow is the ZKP task force's first target, so here it is read as construction records — what each *present* moment can be believed about, and the one decision the flow makes before any of it. Records are in the [working draft on `main`](https://trustoverip.github.io/dtgwg-zkp-spec/) (revision in [PR #11](https://github.com/trustoverip/dtgwg-zkp-spec/pull/11)); nothing is adopted.

**Gather-then-present, record by record.**

- *Vouch* — a VRC between the newcomer and an existing member, presented as the community-anchored proof (record 010): the voucher holds a community-issued membership (001, over the registry's root), the relationship credential exists, the voucher is not the newcomer under another name (005), and the identifiers the voucher used with the newcomer and with the community are one controller's (007). Two vouches from *distinct* members is 005 across the two proofs, or one scoped nullifier per voucher within the join context (002).
- *Invite* — the VIC is presented as a credential; no proof is needed.
- *ID check* — the vetting statement ([cred-spec PR #50](https://github.com/trustoverip/dtgwg-cred-spec/pull/50) / [vds-spec PR #11](https://github.com/trustoverip/dtgwg-vds-spec/pull/11)) is presented, and its PASS limits carry: it establishes that a procedure was recorded, not admission and not personhood.
- *Rules check* — the policy engine consumes proof outcomes; verifying a proof, accepting it under policy and issuing the VMC stay three distinct acts (WG-04), and the trust registry supplies the roots the proofs were made against, with revocation as non-membership against a status root (006; WG-05).

**The decision the flow makes first.** Every 010 needs the newcomer's identifier toward each voucher and toward the community to be either one `directed` identifier or two `pairwise` ones provably co-controlled — and co-control needs the identifier to carry a ZK-openable commitment, which an Ed25519 `did:key` cannot (WG-14; now a template question on [trust-tasks-tf #544](https://github.com/trustoverip/dtgwg-trust-tasks-tf/discussions/544)). So the member identity the newcomer mints at the invitation decides whether the vouches can be proven privately at the join. That is the lever the experience study is looking for: mint the right identifier at step 1 and the scavenger hunt yields proofs; mint the wrong one and it yields disclosures.

*a flow is a list of moments someone must be believed; a record says what each moment can be believed about.*

⚔️⊥⿻⊥🧙
