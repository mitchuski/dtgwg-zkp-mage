# Contributions map — 29 September 2026

Survey `board/survey/2026-09-29T10-31-09-125Z.json` (since 27 Sept 17:47 UTC; 38 threads moved). One review comment landed on ours. The credential side closed its namespace and registry threads. The Trust Tasks registry opened a door this week: the first large external family contribution is being reviewed in public, and the bar is now written down.

## Ours — what moved

| artifact | state | what is new |
|---|---|---|
| dtgwg-zkp-spec [PR #11](https://github.com/trustoverip/dtgwg-zkp-spec/pull/11) | open · green | **DenisPopov15 inline on `conformance/records/023.json` (28 Sept 06:13 UTC)**: (1) options[0] and options[3] look like one construction (membership by possession of a blind signature, not Merkle inclusion) — merge or cross-reference; (2) it bypasses component 007 rather than satisfying it (PCS secret bound at enrolment, no DID verification-method commitment) — say so explicitly; (3) hold measured figures until the code is public (candidates for later: ~1,392 B at k=5, ~12 ms) |
| dtgwg-zkp-spec [PR #12](https://github.com/trustoverip/dtgwg-zkp-spec/pull/12) | open · green | main took the spec-up-t 1.9.0 → 2.3.0 bump (PR #15, 28 Sept) — check the render on rebase before the fifth commit |
| dtgwg-zkp-tf [PR #28](https://github.com/trustoverip/dtgwg-zkp-tf/pull/28) | open · unreviewed | — |
| cred-spec [#58](https://github.com/trustoverip/dtgwg-cred-spec/issues/58) | geoffturk still awaited | — |
| trust-tasks-tf [#544](https://github.com/trustoverip/dtgwg-trust-tasks-tf/discussions/544) | 0 replies | — |

Answer shape for the 023 comment: point 1 → 023 options[0]/[3] cross-reference **record 024** (already the PCS-named hidden-vetting record; 023 stays the vouch-admission statement); point 2 → add the explicit line to 023 and 024 does-not-establish: "no 007 commitment; voucher linkage rests on the enrolment-bound PCS secret"; point 3 → agree, the records already carry `measured: false` and constructor-reported sizes; nothing changes until OpenVTC/predicate-credential-system has source. Draft = **AX** (not yet written). Record edits ride PR #12's fifth commit.

### cred-spec — closed this week

- [#48](https://github.com/trustoverip/dtgwg-cred-spec/issues/48) closed via PR #64 (28 Sept): `@context` `https://registry.trustoverip.org/dtg/context/v1` (frozen per version) · vocabulary `https://registry.trustoverip.org/dtg/credentials#` (unversioned) · predicates `https://registry.trustoverip.org/dtg/vsc/<name>/<n>` (integer per predicate).
- [#52](https://github.com/trustoverip/dtgwg-cred-spec/issues/52) closed (28 Sept): the predicate registry is `dtgwg-vsc-registry` (GOVERNANCE §1–§5; bare name answers 406). Record 003's identity/comparison rule now has a concrete target.
- [#46](https://github.com/trustoverip/dtgwg-cred-spec/issues/46) closed via PR #68: `issuerScope` named and the v1 context pinned.
- Effect here: re-pin [DTG-CRED] to 0.5.0 and carry the three IRIs into 003/008/022 provenance — the fifth commit of PR #12 (commit/push = Mitch).

### trust-tasks-tf beside us

- [#647](https://github.com/trustoverip/dtgwg-trust-tasks-tf/pull/647) sender-delegation CLOSED at the maintainer's request (branch kept). Its pairwise-delegate privacy line was the one record 011 would have cited; moot for now.
- Framework 0.7.0 · release train to 0.23.x · trust-task-discovery 0.3 (acceptance window) · authenticate 0.2/0.3 (session key) · spec-meta: a specification declares its own document size bound (#679, spec #26).

## The Trust Tasks door — what changed since the July fit map

The July fit map recorded a single-author registry (166 tasks, every PR by @stormer78, the one outside proposal closed). That is no longer the social reality:

- **`process-attestation/0.1` (David Condrey, first commit 10 Sept, merged; category `provenance`)** — the first external Trust Task specification in the registry. Front matter carries `authors:` and `knownImplementations:` (proof-of-effort, writersproof.com). This is the pattern for naming an outside implementation inside the repo.
- **javruben ("Mujo") — 28 families / 416+ specs** filtered from 43 candidates, now being admitted as a split series: [#672](https://github.com/trustoverip/dtgwg-trust-tasks-tf/pull/672) (ten new category values, 17 → 27: `temporal-coordination`, `automation`, `media`, `communications`, …) and [#674](https://github.com/trustoverip/dtgwg-trust-tasks-tf/pull/674) `social-recovery` (4 specs) as the **shape template**; the remaining families wait on the maintainer's view of the shape. Alberto Leon has two commits.
- **The bar, as stormer78 wrote it on #672**: DCO `-s` · EasyCLA · conventional-commit title `feat(<slug>): …` (squash-merged, title = changelog) · `payload.schema.json` beside every `spec.md` (build finds specs by one, generators by the other) · both taxonomy files move together (`spec.meta.schema.json` enum + `website/assets/data.js`) · one PR per family so CODEOWNERS routes by slug · §4.10 lowerCamelCase for closed-set values and member names · worked examples round-trip verified against the implementation · findings that point back at the registry are welcomed separately.
- **Registry today**: 635 specs (all with payload schemas), framework 0.7.0, a `/ceremony/` subtree (`ceremonies/<slug>/<version>/ceremony.json`, meta schema mirrors the task one: roles · steps (partial order, `prev`, `optional`, `terminal`) · completion · evidence `{level: receipt, recorders}` · enactmentPrivacy · exposure), `trust-ceremony-receipt/0.1` (recorder attests completeness and ordering, never content; terminal marker against truncation), `persona/correlation/analyze/1.1`, the `vetting/*` family (record 024's wire), §12 Security & Privacy sub-headings lint, §7.3 item 17 `issuedAtRequirement`, item 19 `maxLength` on free text.
- **trusttask.org (singular) answers Cloudflare 525** today; **trusttasks.org** (plural) is the live registry and is the repo's `website/` build. The repo is the source.

## Our ten specs, re-validated against today's registry

Workbench `~/dtgwg-trust-tasks-tf-mage` fast-forwarded 3bda18b4 → `aa70b008` (92 commits; our two families and two design notes are untracked and untouched). `npm run validate`: **11 errors + 10 warnings, all mechanical, no structural rejection**:

| gap | rule | specs |
|---|---|---|
| `issuedAtRequirement` block missing on a consequential task | SPEC §7.3 item 17 | agent-admission apply · approve · issue · respond · revoke; understanding exchange · grant · offer · seal (9) |
| free-text member without `maxLength` | §7.3 item 19 (pattern: `task-consent/request` `note` ≤ 500, optional, untrusted) | agent-admission/approve `note` · agent-admission/revoke `reason` (2) |
| Security & Privacy sub-headings `### Data carried` · `### Correlation` · `### Retention` · `### Consent/purpose` missing | §12 + §7.3 (CONTRIBUTING-SPECS.md carries the template) | all 10 (warning; strict mode fails) |

One pass fixes all of it; the July design (5 ordered rules, two gates, closed verdict lexicon, bilateral seal) is untouched by the framework's growth.

## Candidate contributions — ranked

### On the Trust Tasks side

1. **Ceremony definitions first, task families second.** The `/ceremony/` subtree is exactly what KY-A admission and the LAN understanding rite are: ordered steps with roles, a recorder and a completion rule. `ceremonies/agent-admission/0.1` (two gates: understanding gate + human gate; `issue` terminal; recorders = community + supervisor) and `ceremonies/understanding/0.1` (offer → exchange → seal → grant; `seal` terminal) cite existing upstream tasks wherever one fits (`vtc/join-requests/*`, `task-consent/*`, `consent/*`, `credential-exchange/*`, `vetting/attestation`) and keep only the genuine gaps as new task specs — likely `agent-admission/respond` (the understanding gate: witness drawn from the submission digest) and `agent-admission/issue`, plus `understanding/seal` (IEEE 7012 bilateral). Ten specs shrink to about three plus two ceremony files, and each ceremony yields a `trust-ceremony-receipt` for free. Category stays `ai-agents` / `consent`; nothing depends on #672.
2. **The harness as a provenance profile, not a new namespace.** The dual-agent loop (Measure → Propose → Hold-apart → Assay → Critic → Chronicle) maps onto what the registry already has: the Gap's `proposal_canon.json` digest is `process-attestation`'s `artifact.digest`; the Assay's drawn witness is the Verifier-supplied `challenge` (echoed verbatim, bound in the proof); the Chronicle is a `trust-ceremony-receipt` whose recorder attests ordering, never content — which is the harness's own T2 separation bound stated in their words. Shape: `ceremonies/dual-agent-harness/0.1` with steps `propose` (artifact + canon digest) → `hold-apart` (task-consent-style effects pinned to a digest) → `assay` (`process-attestation` request/response bound to the drawn challenge) → `chronicle` (terminal; receipt). No new task spec unless the drawn-witness answer cannot ride `process-attestation`'s `disclosed` categories; if it cannot, one task `harness/assay/0.1` (category `provenance`, sideEffects none, exposure metadata) is the generalisation of `agent-admission/respond`. `related:` → `process-attestation` (David Condrey's proof-of-effort is the same instinct: captured process → artifact) and `trust-ceremony-receipt`.
3. **Name agentprivacy inside the repo via front matter.** `process-attestation` shows the accepted pattern: `authors:` and `knownImplementations:` are first-class members. The Gatehouse trust-task bridge (envelope mint/verify, byte-exact canon parity, 200 checks) is a known implementation of `agent-admission/*`; the dual-agent harness repo is a known implementation of item 2. That is the cheapest integration and it needs no new category.
4. **Findings that point back at the registry** (posted as issues, no PR): `persona/correlation/analyze/1.1` read against records 011/012 (what the analyzer can and cannot establish about issuer-scope linkage); `process-attestation`'s challenge echo read against record 003's transcript binding; `trust-ceremony-receipt` as the framework-side twin of record 008 route 2 (a completion receipt is a citation the credential does not carry). The maintainer explicitly welcomed this class of contribution on #672.
5. **Shape discipline learned from #674**: open the smallest family first as the template, say what is not round-trip verified rather than hide it, and hold the rest until the maintainer speaks. Our order: fix the ten specs (mechanical) → the two ceremony files → one PR for `understanding` (smallest, four steps) → wait.

### On the ZKP side (gated, unchanged owners)

| # | item | owner |
|---|---|---|
| 1 | **AX** reply to DenisPopov15 on PR #11 (023 options cross-reference to 024; explicit 007-bypass line; figures held) | draft = lane · post = Mitch |
| 2 | 023 + 024 amendment (cross-reference, does-not-establish line) → PR #12 fifth commit with the registry IRIs and the 0.5.0 re-pin; rebase check on spec-up-t 2.3.0 | edit = lane · commit/push = Mitch |
| 3 | AV (#58) · AP (Round 2 opener, date) · AW (#38, hold) | gate = Mitch |
| 4 | SIROS pack dated today — confirm the session | Mitch |
| 5 | Evidence I5 commit + tag | Mitch |

Nothing committed, pushed or posted. Read-only survey; the workbench fast-forward is the only state change.

## Done the same day (local, uncommitted; Mitch: "this is a good path of work to follow, let's do this")

| lane | what | check |
|---|---|---|
| trust-tasks workbench `~/dtgwg-trust-tasks-tf-mage` | ten specs brought to the current bar: `issuedAtRequirement` on all ten (REQUIRED ×9, RECOMMENDED on `status`), `retention` blocks, `maxLength: 500` on `approve.note` and `revoke.reason`, Security & Privacy rewritten under the four §12 sub-headings, `targetFrameworkVersion` 0.2 → 0.5.0 with payload `$ref` → `_framework/0.3`, `knownImplementations` (kyra_gatehouse) on the six admission specs | `npm run validate`: 645 specs, 0 errors, 0 warnings on ours; freshness floor 368/368; free-text bounds 0 unbounded |
| same | three ceremony definitions: `ceremonies/agent-admission/0.1` (4 steps, 3 roles, receipt; two gates as a partial order, denial is a complete enactment) · `ceremonies/understanding/0.1` (4 steps, 4 roles incl. an evidentiary `witness`, receipt; aggregate `secret` because of the optional grant) · `ceremonies/dual-agent-harness/0.1` (3 steps over `process-attestation` + `confirm/request` + `confirm/response`, receipt; the derived challenge is the hold-apart seed; no new task minted) | `validate-ceremonies`: 6 definitions ok, 0 warnings. The upstream validator derives its root from `import.meta.url.pathname` and fails on Windows; a path shim copy lives in the scratchpad, not the repo |
| same | design notes: §9 appended to `agent-admission-ceremony.md`; new `dual-agent-harness-ceremony.md` (phase → registry surface table, the derived challenge, what the receipt does not say, two open questions) | — |
| board | cards 023 + 024 amended for the PR #11 review (023 options 0 and 3 folded into one blind-signature option pointing to 024; 007-bypass does-not-establish line on both; revisions dated); door **D28**; draft **AX** (ledger 63, ready) | `board.mjs validate` ok |
| spec worktree `~/dtgwg-zkp-spec-hv` (`round-2-2026-09-23`) | 023/024 exported (cards were byte-equal to the worktree before today's edits), sections regenerated | `validate` 23/23 · `test` all pass; 5 files modified, uncommitted = PR #12 fifth commit (with the registry IRIs and the 0.5.0 re-pin still to write) |

Not done: the registry-IRI / 0.5.0 re-pin edits to 003/008/022 provenance (needs the fifth-commit pass with the rebase check); the findings issues (item 4); the `understanding` family PR (fork, branch, DCO, EasyCLA, `feat(understanding): …` title, one PR) — PR mechanics = Mitch. Full `npm run build` (bindings codegen) was started after validate; its result is in the run note.


## Afternoon survey (14:31 UTC, since 10:31; 4 threads)

| thread | what landed | our move |
|---|---|---|
| cred-spec [#9](https://github.com/trustoverip/dtgwg-cred-spec/issues/9) | geoffturk 14:11: "@mitchuski Anything we should follow up on this or shall we close out this issue now?" | **AY** (ledger 64, ready): close; records 007/009/020/021 are the home; the VRC MAY and the specs.json / editor's-note cross-reference are the credential side's small leftovers; WG-14 stays ours. Door D29 |
| zkp-spec [PR #11](https://github.com/trustoverip/dtgwg-zkp-spec/pull/11) | DenisPopov15 13:44 on the 023 thread: confirmed from a local run (`cargo run -p openvtc-core --example zkp_reference_flow`, branch `zkp-pcs`, commit 108c496): DID, labels and shapes of all 11 steps match with fresh signatures | Noted in AX; the commit is on no public branch (VTI's public `zkp-pcs` head is 3332ac5, 29 Sept, and carries a `vti-vetting-pcs` crate), so the record pins the public main instead |
| **OpenVTC/predicate-credential-system** | found PUBLIC with source since 28 Sept (main `4f4edf5`, MIT, arkworks 0.6; README sizes asserted by tests: Σ-PS attestation 240 B, proof 1,392 B at k=5, credential 96 B; `pcs-vetting-prototype` demo with four end-to-end claims; benches present, no published timings) | 024 option 1 pinned to the revision, sizes constructor-reported, `measured: false`; 023's folded option points there; AX point 3 rewritten; exported to the worktree, generate + test + validate pass. Door D30. |
| cred-spec [#25](https://github.com/trustoverip/dtgwg-cred-spec/issues/25) | label `defer` applied 14:17, body unchanged | AQ stays held; record 013 (mutual edge admissibility, specified in the worktree by the other session) is unaffected |
| trust-tasks-tf [#674](https://github.com/trustoverip/dtgwg-trust-tasks-tf/pull/674) | head moved to 594c2d5 (force-push), no comments | watch |
