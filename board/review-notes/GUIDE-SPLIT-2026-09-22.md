# Guide split — local review checkpoint

Based on the 22 September meeting notes and TF discussion 23. No new post, PR, commit or push from this preparation.

1. Review local guide on port 8428, especially attribution, source map and SIROS path.
2. Before publishing, announce the exact guide PR scope. Use a personal-fork branch and DCO sign-off; include preview artifact. Guide builds under guide/ in the TF repository.
3. Merge/publish guide before removing explanatory content from the core. Core extraction is based on PR #11 snapshot 315cf4466bfcfe3d70c88a6706d0a6ca633c60c9; rebase after that PR merges. Do not expand PR #11 with this split.
4. Commit the reviewed evidence source changes, export again, validate the true provenance pin, then prepare the focused core PR. Do not move the older wd-0.1.0 tag. The current local core preview explicitly labels uncommitted provenance.
5. Post a concise update in TF discussion 23 linking actual PRs, after giving Mitchell advance notice. Prepare but do not silently send the SIROS reading pack.

## Proposed guide PR text

Following the 22 September discussion, add an informative Spec-Up-T implementation guide under guide/ in this task-force repository. Move the explanatory walkthrough, trust-graph context, research chapter and Cryptographic Background from a pinned PR #11 snapshot; retain attribution and a source map. Include a focused SIROS reviewer reading path and a build-only workflow producing a preview artifact. Construction records and evidence states remain owned by the core spec. Hosting requires a separate maintainer step.

## Proposed core PR text

Once the guide is available, replace the explanatory chapters with short pointers and retain the WG decision notes. Add an outcome-to-construction navigation map and correct the obsolete number-range taxonomy. Preserve all records and conformance semantics. Coordinate the evidence exporter so future regeneration preserves this separation.

## Proposed discussion update — draft only

Following today’s discussion, I have prepared the implementation guide in the ZKP task-force repository using the existing Spec-Up-T toolchain. It holds the walkthrough and cryptographic background; the specification keeps the construction definitions and conformance. I’ll link the reviewed guide and coordinated extraction PRs here. A deeper book can evolve later. The SIROS pre-read focuses on credential and holder-key support, transcript/status checks and a clause-by-clause comparison with 023, without treating a candidate implementation as a selected backend. Geoff’s help or review would be welcome.

## Local validation

- Board suite: 54/54 pass; reader/review suite: 12/12 pass.
- Core conformance: 22/22 records, requests and stack files validate; generated sections match.
- Export check: 0 changed, 0 diverged. Construction JSON unchanged; record digest c5b5a1856566687c remains unchanged.
- Both Spec-Up-T builds succeed. Guide guard passes for 9 chapters and all internal links; both previews return HTTP 200.
- Outstanding publication check: core render has 13 unresolved DTG_CRED glossary fragments. External reference refresh also matched zero references. Investigate Spec-Up-T external-reference configuration before calling the core extraction ready to merge. Guide internal links pass.
- Local core provenance explicitly warns that the checkout base does not reproduce uncommitted edits. Commit/export sequencing remains required before publication.
