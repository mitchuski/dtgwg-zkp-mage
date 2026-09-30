# AP · dtgwg-zkp-tf discussion #23 (reply) — Round 2 opens: what Round 1 left, what PR #12 adds, what moved beside us, and the four questions
chip: ROUND 2 OPENER · PROPOSED 23 SEPT, REFRESHED 27 SEPT AND 30 SEPT · DATE FOR THE ROUND = MITCH · MERGE ORDER #28 → #11 → #12
thread: https://github.com/trustoverip/dtgwg-zkp-tf/discussions/23
note: Round 1 (shape) closed 22 Sept with the chair's position answered on PR #11 (AT) and Denys Popov's inline review of 007 recorded as `refined` in the record's reviews part. Round 2 = the content the chair asked to build plus what the credential and framework sides decided since. 30 Sept refresh: the second inline review (023's options, the 007 bypass) is folded; the PCS source is public and pinned on 024; cred-spec is at 0.6.0 with the registry IRIs; #38 and #58 are assigned to Contexts v2; #9 is closing. The four questions are WG-14 (identifier profile), WG-16 with the 007-on-admission question, 008 after #58, and the merge order. [DATE] is Mitch's. No direct address.
ledger: 62
proverb: The first round asks whether the house is the right shape; the second asks who lives in each room.
---
Round 1 closed on 22 September. The chair's position (ratify · refine · build · scope) is answered by move on [PR #11](https://github.com/trustoverip/dtgwg-zkp-spec/pull/11), and the first cryptographer's readings are in: an Ed25519 `did:key` has no space for record 007's commitment while `did:peer` (numalgo 2 and 4), `did:web` and `did:webvh` can carry one; and record 023's blind-signature options are one construction, which walks around 007 rather than satisfying it. Round 2 opens here and runs to **[DATE]**.

**What Round 2 reviews — [PR #12](https://github.com/trustoverip/dtgwg-zkp-spec/pull/12), stacked on #11.**

- **Record 024, hidden vetting at admission** — the construction named for the Linux Plumbers integration, as a record: an applicant proves to the community that k distinct eligible vetters attested, and the community never learns which. Two routes. The lab Groth16 route is at `constructed` with measured figures. The named route is now public source ([OpenVTC/predicate-credential-system](https://github.com/OpenVTC/predicate-credential-system), 28 September) and is pinned by revision, with its sizes recorded as constructor-reported and unmeasured until a run on independent hardware. Its wire is five published Trust Tasks, named in the issuance lines.
- **Record 023 amended** — the vouch-admission statement keeps its Merkle-membership constructions; its blind-signature rows fold into one pointer to 024. Both records now say that the blind-signature route establishes no 007 property.
- **Record 013 specified** — mutual edge admissibility (cred-spec #25's question, in proof form).
- **Formal parts on the records** — each statement as a Lean definition, the theorems proved against it, the hypotheses named, the axiom footprint checked in CI.
- **WG-13, the guide split** — the explanatory chapters move to a companion guide ([dtgwg-zkp-tf PR #28](https://github.com/trustoverip/dtgwg-zkp-tf/pull/28)), which merges first.

**What moved beside us, and what it changes here.**

- **The credential specification is at Working Draft 0.6.0.** The context is frozen at `https://registry.trustoverip.org/dtg/context/v1`; predicates are registry IRIs with the revision in the string (`…/dtg/vsc/<name>/<n>`), which gives record 003's predicate binding a concrete identifier; `issuerScope` is in. Every section title this draft cites still resolves; the minimum compatible version stays 0.4.0.
- **#38 and #58 are assigned to Contexts `v2`** (30 September). The REQUIRED in-credential salt is record 022's option 1 as written. The detached citation replaces the citation members in the credential, so record 008's route 1 is superseded at the credential layer and route 2 (per-context pseudonyms) stays here. Until `v2`, a `v1` credential carries unsalted digests and the plaintext pair; the records state that horizon.
- **cred-spec #9 is closing**: its question has a home in records 007, 009, 020 and 021. What it leaves on this side is question 1 below.

**Four questions for the round.**

1. **WG-14 — the identifier profile.** Which does the first implementation mint for identifiers that may be co-proven: `did:peer` (2 or 4) with the commitment as a second verification method, or a SNARK-native key type? [trust-tasks-tf #544](https://github.com/trustoverip/dtgwg-trust-tasks-tf/discussions/544) asks whether a did:peer template can carry the slot.
2. **WG-16 — the admission proof, and whether it needs 007.** 023 (vouches from members) and 024 (hidden vetters) are different statements with different disclosure. Does 023 stay beside 024? And is the task force content with linkage bound inside the credential system on the admission path, or does it want the identifier commitment exercised there too?
3. **008 after #58.** Does 008 stay as the home of route 2, or does route 2 fold into 011 (directed identifiers per context), which it resembles?
4. **Merge order and the review that gates it.** #28 → #11 → #12. The crypto-internal clauses (007's key-profile line, 009, 022, 024's clause 4) carry a *Reviews* part waiting for the sign-off the chair asked to have recorded.

Positions in the ratify · refine · refute · build form land in Appendix E's table, as in Round 1.

*The first round asks whether the house is the right shape; the second asks who lives in each room.*

⚔️⊥⿻⊥🧙
