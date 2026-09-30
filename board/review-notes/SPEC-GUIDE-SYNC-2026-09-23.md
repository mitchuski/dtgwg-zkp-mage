# Specification and guide reconciliation — 23 September 2026

Local review draft. Nothing committed, pushed or posted by this reconciliation.

## Scan and ownership

Existing specification PR #11 is open on review-2026-09-21. The local guide-split and hidden-vetting branches start from that revision. No open task-force guide PR was found at the time of the scan. Both local specification checkouts now contain the same planned export; choose one contribution branch rather than publishing duplicate changes.

The scan found formal metadata only in the hidden-vetting specification worktree, a newer guide split in the main local checkout/evidence sources, and a stale numbering taxonomy in the former renderer. Reconciliation retained the guide split and stable-identifier wording, adopted the ten primitive formal records plus 023/024 updates, and synchronized schema, renderer and formal-metadata validation.

Private implementation sources, review findings, branches and model refinements are excluded from this public documentation contribution. Their separate work must not be staged with this one.

## Changes

- Eighteen construction records agree across the evidence board and both local spec checkouts; ten primitives carry formal metadata.
- Formal metadata describes model properties and assumptions; it does not promote evidence state or claim deployed implementation verification.
- Record 024 remains without a formal block: the earlier abstract model does not establish the revised Groth16 route. Applicant exclusion and implementation correspondence remain open.
- The guide now explains Lean coverage, small Clean kernels, remaining privacy/state-transition obligations, and the distinction between calculated compressed size and actual JSON size.
- Corrected obsolete pantry/recipes render paths and the exporter's Public Inputs adoption path.
- WG-16 has both an editorial question and an index entry.
- The guide's source map now distinguishes the original extraction revision from subsequent local additions.

## Validation

- Board: 54/54 passed after resolving the WG-16 index mismatch.
- Export check: zero additions/changes/removals, 69 unchanged files, against both local spec checkouts.
- Spec, guide and evidence-book render commands completed.
- Guide check: nine chapters; internal links and references resolved.
- Renderer warning: its child process could not resolve git and used main for source-link branch metadata. Review/source links need correcting before publication; successful rendering alone does not close this item.
- This run did not rebuild Lean or rerun cryptographic proofs; formal and runtime pass counts remain attributed to prior evidence.

## Publication requirements

1. Review and freeze the public-safe evidence subset at an immutable revision. Sources remain uncommitted; the current checkout commit is not a reproduction pin.
2. Replace local/uncommitted formal references with that evidence revision and verify the cited roots.
3. Finish review of the runtime's asynchronous spent-state/root handling; do not advertise deployment-level replay assurance from sequential-model results.
4. Retain explicit partial coverage for 024 and scoped privacy claims. H11 is a fixture, not an unlinkability proof.
5. Confirm rendered source links and preview the final output. Keep generated HTML/caches out of source commits where ignored.
6. Select the spec contribution branch, preserving PR #11's prior review scope; keep the companion guide in a separate task-force contribution.

## Cap-profile follow-up

Record 024 now consistently distinguishes stable-secret quotas from aggregate transferable-token budgets across its witness, inputs, disclosure, issuance and fixtures. The common invariant is no additional counted spend; identical retry acknowledgement is profile-specific. Policy-evaluator and atomic durable ledger obligations are explicit. The guide carries the same explanation. The public decision note uses only generic profile rationale; prior private rationale was preserved outside public repositories.

Checks: board 54/54, coverage 18 records / 59 clauses / ten formal records, nine drift mutations rejected, both exports zero drift. Local readers regenerated; no commits, pushes, PR edits or deployments. Existing Git-path/source-link renderer warning remains. This is a documentation update, not a new runtime or Lean verification claim.
