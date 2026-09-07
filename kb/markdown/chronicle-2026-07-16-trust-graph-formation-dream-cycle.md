---
title: "Chronicle 2026-07-16 — Trust-Graph Formation Dream Cycle"
section: "chronicles"
source: "../agentprivacy_master/docs/chronicles/2026-07-16_trust-graph-formation-dream-cycle.md"
built_from_commitish: "working-tree"
order: 76
---
# 2026-07-16 · Trust-Graph Formation as a Dream-Agent Cycle

*The ToIP trust graph named our objects and left the ZK layer open. We cohered to its names and contributed a
harness runtime that makes how the graph forms runnable.*

**Scope:** a coherence pass against the ToIP **DTG Credentials Core Specification**, and a new harness runtime
(`07-trust-graph-formation`) that models graph formation as a Mage ⊥ Swordsman cycle. This is a stub chronicle;
the substance lives in the runtime and in the spellweb dream record.

**Companion artefacts:**
- Runtime + forms-spec: [Lab — 07-trust-graph-formation](lab-07-trust-graph-formation.md) (NOTES.md + src + 11/11 tests)
- Coherence map: `~/dtgwg-zkp-tf-mage/runtimes/CRED-SPEC-COHERENCE.md`
- Opportunity register: `~/dtgwg-zkp-tf-mage/runtimes/CRED-SPEC-OPPORTUNITIES.md`
- Dream-cycle record (KG voice): `~/spellweb/chronicles/DREAM-2026-07-16.md`

---

## 1. The turn

The DTG Credentials Core Spec (Working Draft) fixes the credential/DID/registry model — VRC/VMC/VIC/VPC/VEC/VWC,
the R/M/C/P-DIDs, two ZK constructions, PHC and IDVC, the trust registry — and then, deliberately, defers "the
detailed ZK protocols and registry-ZK interactions to future work." That deferred layer is the ZKP Task Force's
charter, and it is exactly the layer our framework already occupies. So the work was not to invent, but to
**cohere**: name our objects the spec's way, then show the graph forming on top of them.

## 2. How the trust graph forms (matched both ways)

The framework's three-layer identity — **data GUID → relationship VRC → principal DID** — maps cleanly onto the
spec's model, and the growth loop is the same one the whitepaper already carries: *matching compression → VRC
formation → trust-graph growth*. The runtime states it as **collision → edge → propagation**:

- **Node** = a personhood-anchored member (principal + data layers) → the spec's **M-DID in a VTC**, personhood
  by the **PHC** one-per-person rule (mechanised by runtime 01's nullifier).
- **Edge** = a **VRC** (relationship layer), "proof of bilateral comprehension without central authority" → a
  VRC between two fresh, unique **R-DIDs** (pairwise ZK construction).
- **Propagation** = trust reaching transitively → the spec's **community-anchored** ZK construction (two members
  of one VTC prove a path without revealing themselves).

## 3. The dream-agent cycle

The graph grows through the harness fold, not by fiat — the anti-Sybil discipline made structural:

- **🧙 Mage** (`bnot`, proposer) proposes the smallest edge — a candidate VRC with each side's R-DID + consent.
- **⚔️ Swordsman** (`neg`, prover) proves before signing: personhood on both endpoints, no self-edge, mutual
  consent, fresh R-DIDs, and — across the Gap — recomputes the VRC commitment rather than trusting the proposer.
- **⿻ The Gap** holds them apart. `neg(bnot(x)) = succ(x)`: one edge is added only when a reduction is signed by
  a proof that did not collude with it. A bare proposal never grows the graph.

Eleven properties hold (bilateral consent, personhood gate, no self-Sybil, R-DID uniqueness, sign-to-advance,
idempotent edge, the Gap catching a forged commitment, community propagation).

## 4. What remains open

- A **witness seat (VWC)**: a third party attesting the collision, taskContext-bound — the natural next edge.
- **Persona edges (VPC/P-DID)** so a node presents different personas per relationship.
- Porting the edge-admissibility statement to circom once 01/03 land (endpoints prove membership without
  revealing the member).

Nothing committed or pushed. Runtime and coherence work sit local in the ZKP-TF lab; this chronicle and the
spellweb dream record are the framework-side and KG-side records of the same cycle.

---

## 5. Addendum — 2026-07-17 · integration executed

The staged display integration crossed into this repo's working tree (uncommitted, G-M):

- `src/app/model/page.tsx:255` re-anchored the VRC delegation line to the DTG Credentials Core Spec,
  naming the pairwise construction.
- `agentprivacy-skills/.../privacy-layer/agentprivacy-vrc-identity/SKILL.md` gained the DTG spec section,
  with open problem #5 tied to the TF charter; `persona/agentprivacy-ambassador/SKILL.md` gained the
  DTG WG/TF line.
- `src/app/guide/the-dual-agent-harness/page.tsx` fleet list now names trust-graph formation — "the DTG
  credentials seam."
- Two federation re-sync trains carried these into the guide snapshot (gate + verify PASS); deploy pending.

The exploration side moved to its own root: `~/dtgwg-cred-spec-main_mage` now holds the **Predicate &
Assurance-Boundary Decision Document** (first draft for TF review — MLP/EPP profile split, paired
assurance/disclosure boundaries per predicate, nullifier = scoped reuse detection) and `explorations/`
(O1–O9 + the VWC witness seat as design docs, aligned to that baseline). The TF clone stays git-clean;
per-surface status lives in [Integration Map](integration-map.md).

(⚔️⊥⿻⊥🧙)😊
