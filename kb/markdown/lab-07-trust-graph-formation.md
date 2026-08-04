---
title: "Lab — 07-trust-graph-formation"
section: "lab"
source: "../dtgwg-zkp-tf-mage/runtimes/07-trust-graph-formation/NOTES.md"
built_from_commitish: "working-tree"
order: 61
---
# 07 — Trust-graph formation (the dream-agent cycle) — notes

**What this runtime is.** An agentprivacy-harness runtime that models *how the DTG trust graph forms*, run as
a **dream-agent cycle** (Mage proposes ⊥ Swordsman proves, across the Gap). It is the bridge runtime: it takes
the personhood anchor from runtime 01 and shows the graph growing on top of it, with every object named in
both the **agentprivacy framework** and the **DTG Credentials Core Spec**. Reference model, not a circuit —
like runtime 01 it demonstrates the *relations* a ZK trust-graph would prove, zero-dep and offline.

**Run:** `node test.mjs` → 11/11 (see below). **Reuses:** `../01-uniqueness-nullifier` (enrol + nullifier).

---

## The spec: how the graph forms, one collision at a time

The spellweb grammar states it in five words — **collision → edge → propagation** — "the trust graph grows one
collision at a time." This runtime makes each arrow mechanical and names it on both sides:

| Step | Framework (agentprivacy) | Cred-spec (DTG) | In this runtime |
|---|---|---|---|
| **Node** | personhood-anchored member; three-layer identity's *principal* + *data* layers | member of a **VTC** with an **M-DID**; personhood via the **PHC** rule | `joinCommunity()` → `member = nullifier(secret, community)`; one node per human per community |
| **Collision** | an *encounter* producing a *matching compression* (proverb/spell match) | the out-of-band event a **VRC** attests | `encounter()` → a shared value only the two parties can derive |
| **Edge** | a **VRC** (relationship layer): bilateral commitment, "proof of bilateral comprehension without central authority" | a **VRC** between two fresh **R-DIDs**; the pairwise construction | `Mage.propose()` → candidate carrying each side's `rdid()` + consent |
| **Consent gate** | the shared graph grows only on mutual consent (SPELLWEB spec §6B) | holder MUST present unaltered; bilateral issuance | Swordsman rejects `unilateral-no-mutual-consent` |
| **Propagation** | trust reaches transitively; value lives in the Gap (max betweenness) | **community-anchored** ZKP: two members of one **VTC** prove relationship existence | `TrustGraph.connected()` (BFS reachability) |

The two **cred-spec ZK constructions** appear exactly here: **pairwise (VRC-based)** is the single edge; the
**community-anchored (VMC-based)** is propagation within a shared C-DID. See `../CRED-SPEC-COHERENCE.md`.

## The dream-agent cycle (why it is a harness runtime, not just a graph)

The graph does not grow by fiat — it grows through the harness's dual-agent fold, which is the anti-Sybil
discipline made structural:

- **Mage (proposer, `bnot`)** — proposes the *smallest* edge: "these two members share a matching compression;
  here is the candidate VRC." Conceal/reduce: it asserts, minimally.
- **Swordsman (prover, `neg`)** — proves before signing: both endpoints personhood-anchored (PHC), no self-edge
  (self-Sybil), mutual consent, fresh per-counterparty R-DIDs, and — **across the Gap** — it *recomputes* the
  VRC commitment from the candidate's own public parts rather than trusting the Mage's claim (Fiat-Shamir
  reseed, non-collusion). Signs only a validated edge; names and rejects every mirage.
- **The Gap (`⊕`)** — the proposal and the proof are held apart. `neg(bnot(x)) = succ(x)`: the graph advances
  by exactly one edge only when a *reduction* (the Mage's minimal proposal) is signed by a *proof* (the
  Swordsman) that did not collude with it. A bare proposal never touches the graph (property G5a).

This is the same algebra as the shareable dual-agent harness; here the "artifact being made cheaper" is the
trust graph itself, and the "held-out gate" is edge validity.

## Properties verified by `test.mjs` (11/11)

- **G1** bilateral consent (unilateral rejected; mutual forms the edge).
- **G2** personhood anchor required (a non-member endpoint is rejected — PHC/VMC gate).
- **G3** no self-edge (self-Sybil forbidden).
- **G4** R-DID uniqueness — one node's R-DID differs per counterparty (unlinkable, cred-spec R-DID rule).
- **G5** the fold advances only on a signature (a bare Mage proposal does not grow the graph).
- **G6** one VRC per pair (duplicate edge rejected, idempotent).
- **G7** the Gap catches a forged VRC commitment (prover recomputes, never trusts the proposer).
- **G8** community-anchored propagation (trust reaches transitively; an edgeless member stays unreachable).

## Feedback to the strawman / cred-spec (candidate notes)

1. **Trust-graph formation is where our two ZK constructions get their operational definition.** The cred-spec
   names pairwise and community-anchored ZKP but does not say *when* an edge may be minted. This runtime's
   Swordsman checks (personhood + mutual consent + fresh R-DIDs + non-collusion recompute) are a candidate
   **edge-admissibility rule** for the "registry-ZK interaction" the spec defers — worth raising as a profile.
2. **The consent gate is a normative requirement, not a UX detail.** G1 shows the shared graph must not grow on
   unilateral action. Suggest the spec state bilateral-consent-to-edge explicitly (it currently implies it via
   two-sided VRC issuance).
3. **A VWC slots straight in.** A third party witnessing an encounter is a **VWC** (taskContext-bound); adding a
   witness channel to the cycle is the natural next extension (a Swordsman that also accepts a witness's
   signed attestation of the collision). Not built here; flagged.

## Next steps for this runtime

- [ ] Add a **witness (VWC)** channel: an optional third-party attestation of the encounter, taskContext-bound.
- [ ] Add **VPC/P-DID personas** (runtime 04) so a node can present different personas per edge.
- [ ] Port the edge-admissibility statement to the circom gadget once 01/03 land (Poseidon nullifier + Merkle
      membership prove the endpoints without revealing the members).
