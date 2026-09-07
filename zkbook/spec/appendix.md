## Appendices

### Appendix A: How this specification is produced

The Requests Answered, Construction Records, Proving Systems and derived Privacy Considerations sections, and every glossary term whose source file is prefixed `g-`, are generated from the machine-readable records in this repository's `conformance/` directory: `records/*.json` (construction records), `requests/*.json` (requests in the requester's own form), `stacks/*.json` (proving-system entries). The generator runs in the task force's evidence repository (`board/tools/board.mjs spec`, Apache-2.0) and the output is committed here by a person; the digest of the records it was generated from is stamped at the head of the generated text and re-checked by `conformance/test.mjs` on every change. To change a construction, change its record; a record that fails `conformance/validate.mjs` does not render.

The Introduction, Public Inputs, Security, Governance, Internationalization and Accessibility Considerations, Conformance, References and these appendices are written by the editors.

The Cryptographic Background is adapted from the editor's earlier expository work in the agentprivacy body of work [AGENTPRIVACY] — the explanatory material of the Zero Knowledge Spellbook, with its narrative, inscriptions and lattice deliberately not carried — and is regenerated from a hand-kept map in the evidence repository. That work is published under its own terms; its author's statement relicensing the adapted text under CC BY 4.0 for this specification is recorded here when made. Until then the section is a draft.

Render locally with Spec-Up-T: `npm install && npm run render`; output in `docs/`, which this repository never commits.

### Appendix B: Relationship to the evidence repository

The task force keeps reference runtimes, conformance fixtures, a verification registry of independent reproductions and the working board from which construction records are promoted in a separate public repository, [DTG-ZKP-EVIDENCE]. That repository is deliberately not part of this specification: a specification should never depend on one laboratory, and a laboratory should never be mistaken for a specification. What crosses the boundary is data — records, fixtures, registry row identifiers — and the rule that nothing in this document claims more than that data shows.

### Appendix C: Acknowledgements

The constructions in this specification rest on discussions in the DTG ZKP Task Force, the DTG Credentials Task Force and the DTG Credentials Core Specification repository. The editors thank Scott Jones for the working board and the work items placed on the record; Sankarshan Mukhopadhyay for the pressure tests that became negative-space clauses and for the requirements document's v0.4 draft; Glenn Gore for ADR-001 and the delegation design note; Geoff Turk and Drummond Reed for the correlation-scope resolution and the Working Draft 02 merge plan; Brendan Miller and Alberto Leon for the privacy-seam postulate and the implementation feedback that shaped the edge-verifiability definition; Denys Popov for the construction-detail work; and the authors of [PoP-2026] for the vouchable-credential model that construction 010 leans on.

### Appendix D: Changelog

- **0.1 (2026-09-05)** — first Working Draft scaffold: twelve construction records (eight primitive, four composed) at states `carded` and `constructed`; one request (ADR-001) with crosswalk; cryptographic background; public-input conventions; four proving-system entries; considerations; conformance targets and tests; the `conformance/` validation apparatus with continuous integration.

Copyright © 2026 Trust Over IP (ToIP) Contributors  
This work is licensed under a Creative Commons Attribution 4.0 International License.
