## Appendices

### Appendix A: How this specification is produced

The Requests Answered, Construction Records, Proving Systems and derived Privacy Considerations sections, and every glossary term whose source file is prefixed `g-`, are generated from the machine-readable records in this repository's `conformance/` directory: `records/*.json` (construction records), `requests/*.json` (requests in the requester's own form), `stacks/*.json` (proving-system entries). The portable generator runs here with `node conformance/generate.mjs` (Apache-2.0), and its output is reviewed with its source records; the digest of the records it was generated from is stamped at the head of the generated text and re-checked by `conformance/test.mjs` on every change. To change a construction, change its record; a record that fails `conformance/validate.mjs` does not render.

The Introduction, Trust-Graph Operations, Public Inputs, Integration, Research and Book, Security, Governance, Internationalization and Accessibility Considerations, Conformance, References and these appendices are written by the editors. External evidence-repository imports require review so they do not overwrite local changes.

The Cryptographic Background is adapted from the editor's earlier expository work in the agentprivacy body of work [AGENTPRIVACY] — the explanatory material of the Zero Knowledge Spellbook, with its narrative, inscriptions and lattice deliberately not carried — and is regenerated from a hand-kept map in the evidence repository. On 8 September 2026, Mitchell Travers authorized inclusion of this adapted text under the Creative Commons Attribution 4.0 International licence (CC BY 4.0) for this specification. This grant applies to the adapted text included here; it does not change the terms of the wider source work.

Render locally with Spec-Up-T: `npm install && npm run render`; output in `docs/`, which this repository never commits.

### Appendix B: Relationship to the evidence repository

The task force keeps reference runtimes, conformance fixtures, a verification registry of independent reproductions and the working board from which construction records are promoted in a separate public repository, [DTG-ZKP-EVIDENCE]. That repository is deliberately not part of this specification: a specification should never depend on one laboratory, and a laboratory should never be mistaken for a specification. What crosses the boundary is data — records, fixtures, registry row identifiers — and the rule that nothing in this document claims more than that data shows.

### Appendix C: Acknowledgements

The constructions in this specification rest on discussions in the DTG ZKP Task Force, the DTG Credentials Task Force and the DTG Credentials Core Specification repository. The editors thank Scott Jones for the working board and the work items placed on the record; Sankarshan Mukhopadhyay for the pressure tests that became negative-space clauses and for the requirements document's v0.4 draft; Glenn Gore for ADR-001 and the delegation design note; Geoff Turk and Drummond Reed for the correlation-scope resolution and the Working Draft 02 merge plan; Brendan Miller and Alberto Leon for the privacy-seam postulate and the implementation feedback that shaped the edge-verifiability definition; Denys Popov for the construction-detail work; and the authors of [PoP-2026] for the vouchable-credential model that construction 010 leans on.

### Appendix D: Changelog

- **Local review revision (2026-09-08)** — operational trust-graph reading path; presentation/integration design boundaries; continuous research and book process; narrowed transcript, membership, privacy, delegation and benchmark claims. Background moved after operational content. Existing evidence states retained; no new proof implementation, paper equivalence or normative adoption asserted.

- **0.1 (2026-09-05)** — first Working Draft scaffold: twelve construction records (eight primitive, four composed) at states `carded` and `constructed`; one request (ADR-001) with crosswalk; cryptographic background; public-input conventions; four proving-system entries; considerations; conformance targets and tests; the `conformance/` validation apparatus with continuous integration.

### Maintenance Note: Research Across the DTG Workspace

> **WG-09 — Proposed for discussion: maintenance method.** Does the group want this survey-and-research process for preparing reviewable updates? Confirm source scope and decision-record practice. Status: optional editorial proposal, not a protocol requirement.


This note is informative. It proposes how the specification and its companion book may be maintained; it creates no protocol or conformance requirements.

The editors may use a recurring research loop to survey the DTG workspace, including credential and ZKP specifications, task-force discussions and comments, Trust Tasks, relevant verifiable trust community (VTC) implementations, and related Trust over IP and First Person Project work. Maintain an explicit source inventory with repository or document locations, selected revisions, retrieval dates and authority. Participation in that inventory does not imply endorsement, compatibility or adoption. Private implementation material is not made public merely because it informed research.

Each cycle may identify changes, map them to trust-graph use cases and construction assumptions, investigate a bounded question, and prepare corresponding changes to the specification, book and evidence. Preserve the original comments, attribution, contrary findings and unresolved questions. Distinguish a paper claim from its proposed DTG interpretation and distinguish a local experiment from independent reproduction. Validate affected records and generated sections, and run the relevant construction or integration checks before reporting a result.

Keep a resumable record of source revisions, processed changes, findings, proposed edits, test evidence and the next question. Source retrieval, integration, publication and adoption are separate states: a fetched comment is not necessarily addressed, and a generated edit is not an accepted requirement. Review imports against local edits rather than overwriting them automatically.

An update should explain what changed, which use case it affects, what evidence supports it and what decision remains. Link substantive discussion comments to their proposed disposition, spec change and response. The reader may present these findings as agenda questions or discussion drafts; any proverb-based reflection accompanies the exact revision under review and carries no normative authority. Public updates and working-group decisions remain subject to their respective authorization and review processes. Record explicit decisions and release references; a separate narrative chronicle is optional and is not a source of requirements.

### Agent Handoff: Construction Verification Worklist

This section is informative. It turns the researched options in the book and proving-system entries into a proposed work queue for the evidence verifier instance. These are tasks to run or implement, not claims that those experiments have passed. The current catalogue is not exhaustive; newly surveyed options enter through the same fit and evidence checks.

The machine-readable companion is **research/verifier-worklist.json** in this repository. Existing runnable commands below are relative to the pinned evidence repository, not this specification checkout. Build/setup steps follow that repository's instructions. This handoff does not require a particular agent persona or make the evidence instance a protocol participant.

> **WG-11 — Proposed for discussion: verification priorities.** Review the use-case fit, dependencies and acceptance evidence below. Confirm the first full-statement comparison and identify independent reproduction support. Status: proposed queue; no assignments or results implied.

For each attempt, record task ID, input revisions, hypothesis, commands, environment, artifact digests, observed results, limitations and next action. Keep blocked, failed, locally demonstrated and independently reproduced outcomes distinct. A daily cycle may complete one bounded task or resolve one blocker; do not rerun unchanged work merely to produce activity.

#### V01 — Freeze the comparison baseline

- **Status:** ready for source review.
- **Trust-graph fit:** All trust-graph outcomes.
- **Depends on:** no earlier task.
- **To do:** Pin the credential, task, registry, paper, implementation and proving-stack revisions. Record supported signature/credential formats, key custody, disclosure and setup assumptions for each candidate.
- **Evidence to return:** A source manifest and compatibility matrix that marks unknowns and incompatible routes explicitly.

#### V02 — Re-run canonical and rejection fixtures

- **Status:** existing runnable checks.
- **Trust-graph fit:** Request binding and interpretable failure outcomes.
- **Depends on:** V01.
- **To do:** In the evidence repository, run node test.mjs from runtimes/canonical and runtimes/fixtures; run python test.py from runtimes/consumer-py. Capture commands, environment, outputs and fixture digests.
- **Evidence to return:** Actual run evidence with matching canonical values and rejection outcomes; failures retained. This checks fixture interoperability, not a complete credential proof.

#### V03 — Reproduce the existing circuit baseline

- **Status:** existing checks; circuit build required.
- **Trust-graph fit:** Membership, reuse detection, distinctness and transcript components.
- **Depends on:** V01.
- **To do:** Follow the pinned runtimes/circom-gadget setup instructions. Run node test.mjs, node test-dual.mjs and node test-guardian.mjs there after their respective setups. Capture the manifest and actual proof-verification results; compare reports using verify-run.mjs separately.
- **Evidence to return:** A reproducible component report distinguishing manifest acceptance, actual proof verification and locally observed test execution. Lab setup is labelled; a run by the same operator is not independent reproduction.

#### V04 — Implement credential authenticity and holder binding

- **Status:** implementation needed.
- **Trust-graph fit:** Credential-bound membership eligibility; records 001 and 004.
- **Depends on:** V01, V03.
- **To do:** Select an actual credential format. Bind issuer-authenticated fields and the holder key to the proof inputs. Identify in-circuit checks, external checks and unsupported hardware/non-exportable-key cases.
- **Evidence to return:** Accepted genuine credential plus rejected altered fields/signature, wrong issuer and wrong holder. All acceptance dependencies are explicit.

#### V05 — Implement the root and status profile

- **Status:** profile decision and implementation needed.
- **Trust-graph fit:** Membership and non-revocation; records 001 and 006.
- **Depends on:** V01.
- **To do:** Pin signed root authority, leaf/hash format, witness updates and accepted staleness. Test revoked, unknown, expired and stale-state cases and unavailable-registry behavior.
- **Evidence to return:** Root/status vectors and privacy notes covering the actual update path. Private witnesses are not exposed merely to avoid a live lookup.

#### V06 — Test complete transcript semantics

Follow-up from the 8 September probe: resolve WG-06a and implement strict transcript field/semantic validation. The lab uses a domain-separated, length-prefixed digest; current field-presence validation accepts numeric challenges and object expiry values. Existing fixture success does not close those gaps.

- **Status:** profile and additional checks needed.
- **Trust-graph fit:** Every composed presentation; record 003.
- **Depends on:** V02, V03.
- **To do:** Publish fixed public-input layouts and digest conversion. Test audience, challenge, context, profile and disclosure tampering, same-request replay and malformed encodings. Check the claimed proof-system property independently of scalar binding.
- **Evidence to return:** Byte-exact manifests and negative vectors with a documented verifier replay policy. No claim of simulation extractability from a public-input test alone.

#### V07 — Evaluate each researched proving route

- **Status:** comparative experiments needed.
- **Trust-graph fit:** Select a compatible backend for the same credential-bound statement.
- **Depends on:** V04, V05, V06.
- **To do:** Evaluate the lab Groth16/Circom route, ProveKit, the SIROS/Longfellow route and the paper-derived construction against the same input contract. Evaluate Flock separately for standard-hash subworkloads before attempting a full credential comparison. Pin each artifact and record issuer changes, memory, time, proof size, security and setup assumptions.
- **Evidence to return:** A fit matrix and matched measurements, or a documented incompatibility/blocker per route. Source-author benchmarks remain separate from local measurements; no claimed winner from unequal workloads.

#### V08 — Demonstrate the full community-anchored outcome

- **Status:** composition and offline-linkage work needed.
- **Trust-graph fit:** ADR-001; record 010.
- **Depends on:** V04, V05, V06.
- **To do:** Resolve and implement the offline voucher linkage artifact. Compose authenticated relationship evidence, both membership legs, control/linkage and accepted status. Exercise missing linkage, reused leaf, wrong relationship signer and changed request.
- **Evidence to return:** A complete credential-bound presentation with explicit disclosures and all negative cases. Component tests and a narrower membership demonstration do not close this task.

#### V09 — Exercise privacy and common-control alternatives

- **Status:** profile-specific implementations needed.
- **Trust-graph fit:** Blinded binders, pairwise relationships and intentional correlation; 007, 008, 011, 012.
- **Depends on:** V04, V06.
- **To do:** Test binder openings, incorrect openings and repeated public commitments; test available common-control relations and counterparty-supplied linkage. Compare declared public outputs across presentations.
- **Evidence to return:** Positive and negative fixtures for each implemented profile, plus a leakage record. Repeated commitments are identified as correlators; finite trace checks are not a proof of general unlinkability.

#### V10 — Verify bounded delegated authority

- **Status:** credential/profile decision and implementation needed.
- **Trust-graph fit:** Delegated trust-graph authority; record 020.
- **Depends on:** V04, V05, V06.
- **To do:** Start with a bounded monolithic profile before comparing recursion. Verify grants, acceptances, holder control, scope narrowing, depth and status. Test escalation, missing acceptance, expired/revoked hop and depth overflow.
- **Evidence to return:** A bounded authority result with explicit chain-length disclosure. Invocation and completion remain separate; hidden length is claimed only with supporting construction analysis.

#### V11 — Run a real task and VTC integration

- **Status:** adapter implementation needed.
- **Trust-graph fit:** Use proof evidence in an actual trust-graph policy decision.
- **Depends on:** V04, V05, V06.
- **To do:** Use pinned Trust Tasks and OpenVTC/VTC interfaces to request, present and verify the selected proof. Identify real versus simulated services, policy outcomes, failure stages and retry behavior.
- **Evidence to return:** A repeatable service-level exchange with no silent downgrade. If actions are added, verify durable idempotency and receipts separately from proof acceptance.

#### V12 — Return evidence to the book and the group

- **Status:** per-result editorial work.
- **Trust-graph fit:** Every completed or failed experiment.
- **Depends on:** V01.
- **To do:** Update only the affected option/claim with its exact artifact references, measurement conditions and limitations. Draft the corresponding book explanation and targeted discussion response. Request an independent runner and cryptographic reviewer where appropriate.
- **Evidence to return:** A reviewable spec/book/evidence change with recorded failures, open questions and source comments. No automatic promotion to adopted or independently reproduced status.

Use the resulting evidence to refine the book's fit assessments and the affected construction records. Preserve attribution and dissent in linked discussions. A successful run establishes only its tested statement and conditions; broader security conclusions and normative adoption require their own review.

Copyright © 2026 Trust Over IP (ToIP) Contributors  
This work is licensed under a Creative Commons Attribution 4.0 International License.
