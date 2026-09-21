# Contributions — woven, 21 September 2026

After the merge (PR #8 → `main`, 16 Sept), the credential maintainer's review (16 Sept) and today's answer (PR #11 + five posts). Supersedes CONTRIBUTIONS-2026-09-15.md. Every item is optional and yours; the reader's first panel (:8425) shows the same list with commands.

## The map — where things live

| repository | local | role | today |
|---|---|---|---|
| trustoverip/dtgwg-zkp-tf | `~/dtgwg-zkp-tf-mage` (main) | the task force's home: README, requirements v0.4, DRAFTING-RULES, AGENT-RUNTIMES, discussions (#18 board thread, #23 Round 1 anchor) — decisions and requests | 0 open PRs; AJ posted on #23; Round 1 closes 22 Sept |
| trustoverip/dtgwg-zkp-spec | `~/dtgwg-zkp-spec` (main; branch `review-2026-09-21`) | the specification (Spec-Up-T; `conformance/` records → generated body; published from `main`) — a request becomes a record here | PR #8 merged; **PR #11 open** (2 commits, checks green, reviewers requested); AI posted on #8 |
| mitchuski/dtgwg-zkp-mage | `~/dtgwg-cred-spec-main_mage` (branch `publication-review-2026-09-08`, PR #3) | the evidence: `board/` (cards → records), `zkbook/` (the spec SOURCE, exported by `tools/zkbook-export.mjs`), runtimes, explorations, drafts, tools, `task-force-readers/` — never a dependency of either upstream | `29bcb69` pushed; Appendix B of PR #11 pins it |
| trustoverip/dtgwg-cred-spec | vendored `dtgwg-cred-spec-main/` (stale) + scratch tarball at `994a3d6` | the credential specification the records prove over — Document Status Working Draft 0.4.0 since 15 Sept | AK on #9, AM on #38, **#58 filed**; PR #55 (categories) and #56 (taskContext + Data Integrity) open |
| trustoverip/dtgwg-trust-tasks-tf | `~/dtgwg-trust-tasks-tf-mage` (main, 82 commits pulled) | the task framework and OpenVTC's specs; the release train | #508 did-template key algorithms = where WG-14 lands; #531 vetting travels in the presentation |

Order of work, unchanged: commit the evidence repo → `node tools/zkbook-export.mjs` (stamps HEAD) → commit the clone → push → PR. Posting: `node tools/post-draft.mjs <L>` from the evidence root; receipts to `board/survey/publication-<date>.json`.

## What went out today (21 Sept)

| draft | where | what it does | ledger |
|---|---|---|---|
| AI | zkp-spec PR #8 (comment) | the review answered by item; each mapped into PR #11; the example-set finding | 46 |
| AJ | zkp-tf #23 (reply) | merged; Round 1 to 22 Sept; question 2's answer and its finding (WG-14); reading path; the silence line — supersedes T, V | 47 |
| AK | cred-spec #9 (comment) | the four points of 10 Sept; what 011 answers; the two new asks answered — supersedes U | 48 |
| AL | cred-spec **#58** (new issue) | the trust-task citation in committed form, against PR #56's shape; theirs vs ours | 49 |
| AM | cred-spec #38 (comment) | record 022 exists; two reference kinds; three placements; disposition stays on #38 | 50 |

Retired without posting: T, U, V, Y (folded or overtaken), AH (#27 deleted).

## The five through-lines, re-woven

**A · One controller, many identifiers** (007 009 011 012) — *now with a finding.* The commitment lives in the DID document; the MUST is conditioned on a key profile; an Ed25519 `did:key` cannot carry it. Open: **AO** on the trust-tasks side (#508's key slots are the profile's home; ask whether `did:peer` numalgo 2/4 with a second verification method is mintable in VTI today); htx #11's faces-per-context is 011 — watch.

**B · Evidence is not a decision** (010 001 004 006 008) — W (+ AB) on the vetting card's byte input, sharper after #531; AA on general #31 where the first proof's user still has no reply after four weeks.

**C · Bind exactly what you mean** (003 008 022) — *now with a record.* 022 for #38; #58 for the citation; **AN** on PR #56 before it merges; X on #52 (flat integer versioning satisfies immutability + byte-exact comparability); PR #55 → one wording line in the Introduction after merge.

**D · Authority is a chain, delegation is a chain** (020 021 013) — the two August loops: two sentences each on cred-spec #25 (013) and cred-tf #40 (020/021; the artifact gap is trust-tasks-spec #15's now); Q on general #25.

**E · Continuity survives a key** — AC, AE, AF on your pick; AD retired (identifierScope merged 19 Sept).

## Nothing to do

VSC (#47) and semver (#54) merged 15 Sept — PR #11 follows both. The trust-tasks release train (0.21.2 → 0.21.7) is noise. rahp-tf quiet since 10 Aug. #46/#48 no ask. cred-tf #39, zkp-tf #17 answered.

## Maintain

PR #11 reviews as they land · **AP on 23 Sept: the Round 2 opener on #23 (WG-14 first, then 022/WG-15)** · ledger: speak 41 42 44 45 46 47 48 49 50, retire 34 35 36 40 43 · PR #3 merge · after #56 merges tighten 008/022's "once PR #56 merges" lines · WG-14 needs an owner (AO finds one).
