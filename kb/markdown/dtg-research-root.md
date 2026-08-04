---
title: "DTG Research Root"
section: "root"
source: "README.md"
built_from_commitish: "working-tree"
order: 0
---
# dtgwg-cred-spec-main_mage

**THE RESEARCH ROOT** — exploration of the DTG credential/ZKP ideas across the board, and their
integration into the agentprivacy system.

Related, not separate: `~/dtgwg-zkp-tf-mage` is **the workbench** — Mitch's direct work on the ToIP DTG
ZKP working group (co-chair). This root *draws from* the workbench (runtimes, coherence registers) and
*feeds* it (explorations promote to TF work when they mature); the workbench alone talks to upstream.
The full loop — draw from · promote · upstream · integrate — is in [Workflow — Workbench and Research Root](workflow.md).

## Attribution

- `dtgwg-cred-spec-main/` — **vendored upstream, others' work**: the ToIP DTG Working Group
  Credentials Core Specification (`trustoverip/dtgwg-cred-spec`, main branch snapshot,
  vendored 2026-07-16). Not edited here; spec changes go through the upstream repo / TF process.
- Everything else in this directory — the **mage method layer**: integration maps, coherence
  notes, and working documents that read the spec and route it into the agentprivacy system.

## What the spec defines (one screen)

Six W3C VC types under `DTGCredential`, three functional categories:

| Category | Type | Issuer → Subject | Role |
| --- | --- | --- | --- |
| Edge | **VRC** RelationshipCredential | R-DID/M-DID → R-DID/M-DID | peer relationship; 2 VRCs = 1 DTG edge |
| Edge | **VMC** MembershipCredential | C-DID → M-DID (or C-DID) | community membership; PHC = governance-qualified VMC |
| Invitation | **VIC** InvitationCredential | C-DID or M-DID (per policy) | authorizes onboarding via VTA/PEP |
| Annotation | **VPC** PersonaCredential | P-DID → counterparty DID | intentional correlation under holder control |
| Annotation | **VEC** EndorsementCredential | endorser DID → endorsed DID | community-governed reputation/skill |
| Annotation | **VWC** WitnessCredential | witness M-DID/VTA DID → observed DID | edge-formation attestation; `taskContext` REQUIRED |

Four official DID roles: **R-DID** (relationship, unique per counterparty), **M-DID** (membership),
**C-DID** (community), **P-DID** (persona). No W-DID.

Two ZK constructions (ZKP presentation SHOULD be the default):

1. **Pairwise ZKP** — any two VRC holders; disclose P-DIDs, hide R-DIDs; no community assurance.
2. **Community-anchored ZKP** — VRC + VMC + same-C-DID proof; carries the community's assurances
   (personhood, when the VMCs are PHCs) into the relationship proof.

Trust-task boundary: **credential** = true standing alone; **artifact** = only meaningful inside its
exchange (`threadId`-correlated). `taskContext` binds a credential to its ceremony; verifiers MUST NOT
read it as completion evidence without the reachable outcome artifact.

Detailed ZK protocols and registry-ZK interaction are **explicitly deferred by this spec** — that is
the DTG ZKP Task Force charter (our seat).

## Working documents (mage layer)

- `dtgwg-cred-spec-main/CONTEXT.md` — language crib for the spec's terms (coherence-pass vocabulary,
  `_Avoid_` list). Travels with the vendored copy so the terms stay next to their source.
- [Integration Map](integration-map.md) — where each spec concept lands across the agentprivacy system
  (master /model, harness runtimes, spellweb KG, docs canon, guide wiki). Status per surface tracked
  in the doc; the master/skills/spellweb rows executed 2026-07-16/17.
- [Decision — Overview](decision-overview.md) — **the decision baseline** (v0.1.0-draft, 2026-07-17,
  first-draft-for-task-force-review): MLP/EPP profile split, PR-* predicate register with paired
  assurance/disclosure boundaries, context as governed linkability domain, construction-selection gate.
  Binds everything in `explorations/`.
- `explorations/` — the expansion ideas built into design docs (O-series + VWC witness seat + the
  X-series), each aligned to the decision baseline. Start at [Explorations Index](explorations.md).
- [Briefing 2026-07-18 — ZKP Explorations](briefing-2026-07-18-zkp-explorations.md) — **DRAFT TF briefing note** (findings + runnable evidence
  + candidate contributions + open questions), prepared for Mitch's review; he circulates, or not.

## Related local work

- `dtgwg-zkp-tf` clone — ZKP-TF repo: runtimes 01–07 lab (local-only), predicate↔anchor matrix,
  CRED-SPEC-COHERENCE / OPPORTUNITIES / STRAWMAN-COHERENCE-EDITS docs.
- `dual-agent-harness` runtime 07 `trust-graph-formation` — models graph formation
  (collision→edge→propagation), reuses runtime 01 nullifier.
