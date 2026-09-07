# D · zkp-tf NEW discussion — Board item 010 · Community-Anchored Proof (ADR-001): construction detail
chip: AFTER BOARD EXISTS
thread: https://github.com/trustoverip/dtgwg-zkp-tf/discussions/new?category=ideas
note: Post once Scott’s board exists so the issue can link here (none visible as of 2026-09-05 — alternative: post as a standalone construction-detail thread and link it from #18). Body = the card 010 render (copy from the Cards section) preceded by this preamble. Trim at posting time.
ledger: 20
proverb: The hard clause was the cheap one; the missing clause is the one the thief would have used.
---
Construction detail for the first composed board item, ADR-001 *Community-Anchored Proof* (stormer78, Proposed 2026-08-25). Register: strongly convergent; the additions below are refinements, not objections. Full card (witness, public inputs, clauses bound to gadgets, disclosure set, negative space, adversary, horizon, fixtures, construction options with cost, issuance requirements): `board/cards/010.json` in github.com/mitchuski/dtgwg-zkp-mage — rendered below.

**Where the ADR and the reference paper meet.** Clause 3 ("the hard one") is native to the vouchable-credential model in ePrint 2026/333: a vouch that verifies under the community's key is the statement that the voucher holds that community's credential, so S2/S3 are vouch unforgeability and non-interactivity rather than new mechanism. S5 is the paper's tag-based SE-NIZK and the lab's +1-constraint transcript binding. C1–C3 are the paper's §5.4 nullifier/revocation-list construction, whose own caveat is C3 verbatim. D1 budgets can be seeded today from the paper's Table 1/2 and the lab's measured circuits.

**Refinements proposed for the record.**
1. Membership is now a mutually issued pair (cred-spec PR #12). Clause 3 proves the community-issued grant half; the acknowledgement is not in the presenter's hands and S3 forbids fetching it. Say so.
2. Add **S6 — the voucher is not the holder.** Without it a member with two R-DIDs can vouch for herself and clauses 1–3 verify. Provable as distinctness of the two membership leaves; the duplicate case is unsatisfiable in the lab's existing distinct-issuer gadget.
3. P4 is full show-unlinkability; per the trade curve it cannot coexist with any reuse detection in the same context. Parameterise: unlinkable across contexts; within a reuse-detecting context the scoped nullifier is the only link and it is declared.
4. X3, concretely: the VMC/VRC signature or a published commitment must be ZK-friendly (SPS on BLS12-381 for the blackbox route, a SNARK-native signature, or an additional Poseidon/KZG commitment beside `eddsa-jcs-2022` — cred-spec #17).
5. Name the adversary per privacy clause (verifier · verifiers colluding · community/registry colluding with the verifier) and the horizon (earliest of VRC/VMC validity, epoch rollover, status freshness, root cryptoperiod).
6. Add the "does not establish" list — the card carries seven lines.
7. Public-signal expectation: `[context, root_C, rl_root, epoch, nullifier?, transcriptDigest]`.
8. The four acceptance tests are fixture families; "cannot be produced" and "does not verify" are different negatives and the vectors should say which.

Construction options through the §25 gate, each with its cost, are in the card's substitutions table; the Groth16 composition is buildable now from measured components, the blackbox route is the paper's, and the legacy-rails route is the SIROS catalog's class.
