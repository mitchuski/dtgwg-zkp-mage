# COMMIT PLAN — the specification into trustoverip/dtgwg-zkp-spec

*The split, ruled 2026-09-05: **specification content → `trustoverip/dtgwg-zkp-spec`** (the Spec-Up-T repository Geoff
Turk and Ry Jones set up on 2026-09-02 and wired through 09-05); **task-force comments, requirements, drafting rules,
the working board and the discussions → `trustoverip/dtgwg-zkp-tf`**; **runtimes, fixtures, the verification registry and
the generator → the evidence repository** (`mitchuski/dtgwg-zkp-mage`). The validation system rides into the spec repo
as its `conformance/` directory and CI. The fold is local; the commits are the maintainer's. Nothing below is
committed by a tool.*

## Staging

Clone: `~/dtgwg-zkp-spec`, branch `zk-book` from `main` (6c296d3).

**The clone is where review happens**, so the traffic runs both ways and the export refuses to overwrite work done
there. Files a person may edit on either side — the spec skeleton (`header · intro · terms-and-definitions-intro ·
appendix`), the README, the conformance records, requests, proving-system entries and code, and the editor-written
chapters woven into `body.md` — are *authored*. If an authored file in the clone differs from what the export would
write, the export stops with `REFUSED destination-authored-file-diverged` and names them.

```
node tools/zkbook-export.mjs --check     # what would change in the clone; names any divergence
node tools/zkbook-export.mjs --adopt     # take the clone's edits back here (unpicks body.md into its chapters), then stop
node board/tools/board.mjs spec && node tools/transfer-spellbook.mjs      # regenerate from the adopted records
node tools/zkbook-export.mjs             # write (refuses if anything still diverges; --force overrides deliberately)
cd ~/dtgwg-zkp-spec && npm ci && npm run render && node conformance/test.mjs
```

A clean loop ends with `--check` reporting **0 changed**: the evidence repository and the clone then hold the same
specification, and the records the text is generated from are the ones that were reviewed.

The export writes the chapter files `specs.json` orders — `spec/header.md · intro.md · terms-and-definitions-intro.md ·
body.md · cryptographic-background.md · appendix.md · terms-definitions/g-*.md` — plus `specs.json` itself (their file;
title, description and external glossary are ours, and **the chapter list stays theirs**, so chapters added in the clone
are never dropped), `README.md`, `conformance/` and `.github/workflows/validate-conformance.yml`. It removes the
template's two placeholder terms and any stale generated term. Chapters that live only in the clone
(`implementation-guide.md`, `trust-graph.md`, `integration.md`, `research-and-book.md`) are left alone: the export
neither writes nor removes them, and they are not yet mirrored in the book edition. Their workflows
(`render-and-deploy`, `menu`, `set-gh-pages`), `package.json`, lockfile, `.npmrc`, `static/`, `assets/` and
`.gitignore` are left as they are.

## Preconditions

- `node board/test.mjs` green (incl. E1: exported body has every template-required section, each declared normative or
  informative, and the records digest stamp); `node conformance/test.mjs` green inside the clone; `npm run render` succeeds
  there with their config.
- The **relicensing line** for the Cryptographic Background (the adapted Technical Bridges are the author's text under the
  spellbook's proverb protocol; CC BY 4.0 here is the author's act) — written into `spec/appendix.md` before C3.
- **Editors line** in `spec/header.md` confirmed with the co-chair (currently: Mitchell Travers as editor; Scott Jones
  listed under contributors — adjust as the task force decides).
- DCO `Signed-off-by` on every commit (`git commit -s`); no AI co-author trailer (ruling 2026-08-28).
- `trustoverip/dtgwg-zkp-tf` PR #21 (`AGENT-RUNTIMES.md`) is independent of this PR; neither waits for the other now that
  the repositories are split.

## The rite, per commit

```
node tools/push-rite.mjs serve --type push --ref "dtgwg-zkp-spec@zk-book: <subject>" --meaning "<one sentence>" --proverb "<fresh line>"
node tools/push-rite.mjs speak <seq>          # after reading it aloud
node tools/push-rite.mjs footer <seq>         # → Ledger-Head / Ledger-Seq / Ledger-Domain, above Signed-off-by
```

## Commits, in order — one pull request

| # | subject | files | body says |
|---|---|---|---|
| C1 | `spec: title, front matter and repository description for the DTG ZKP specification` | `specs.json` · `README.md` · `spec/header.md` · `spec/intro.md` · `spec/terms-and-definitions-intro.md` · `spec/appendix.md` · removal of the two template placeholder terms | what the specification is (construction records, states, the split between the three repositories); how it is produced; that generated sections carry a source digest |
| C2 | `conformance: machine-readable records, validator and CI` | `conformance/records/*.json` · `conformance/requests/ADR-001.json` · `conformance/stacks/*.json` · `conformance/schema/construction-record.schema.json` · `conformance/validate.mjs` · `conformance/test.mjs` · `conformance/README.md` · `.github/workflows/validate-conformance.yml` | the validation system: rules as register strings; states; the digest stamp; Apache-2.0; origin in the evidence repository |
| C3 | `spec: body — requests, background, public inputs, construction records, proving systems, considerations, conformance, references` | `spec/body.md` · `spec/terms-definitions/g-*.md` | generated from C2's records (stamp matches); twelve constructions at `carded`/`constructed` = informative; ADR-001 first; Cryptographic Background adapted from the author's own material (licence line in appendix); Flock, ProveKit, SIROS, lab Groth16 as proving-system entries; Conformance targets and tests |

Reviewers who distrust generated text read C3 against C2 and run `node conformance/test.mjs`; reviewers who want only
the apparatus read C2. C1 is readable alone.

## Second pull request (after the options layer is built)

- `spec(stacks): construction options with reproduction state; Recommendations chapter` — the ladder over registry rows
  (`PLAN-options-layer.md` §2.4, §7.0). RECOMMENDED appears only then.

## What the PR body must say

- Not a construction selection; not an audit (the requirements document's §16.1 words).
- Every generated section names its source and its digest; changes go to records, never to the text.
- The Cryptographic Background's provenance and licence.
- Records at `carded` and `constructed` are informative; the normative ladder is the second PR.
- Ask: shape objections first (chapter order, record form, the conformance apparatus); content objections per construction
  as issues in the evidence repository or discussions in `dtgwg-zkp-tf`.

## After merge

- `render-and-deploy` publishes to <https://trustoverip.github.io/dtgwg-zkp-spec/>; confirm the first render.
- Ledger anchors table: one row per commit (head at activation → commit sha).
- `dtgwg-cred-spec` may cite constructions by `[[xref: DTG_ZKP, …]]` once terms render; the reverse external spec is already
  in `specs.json`.
- The evidence repository's `board.mjs survey` watches `dtgwg-zkp-spec` from now on.
