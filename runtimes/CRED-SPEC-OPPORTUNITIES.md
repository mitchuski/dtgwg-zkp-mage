# Opportunities — what to carry from the Credentials Core Spec, and where to innovate

**Status:** Local research register. Not upstream. Companion to `CRED-SPEC-COHERENCE.md` (which does the
terminology alignment); this doc is the forward-looking read — where the *DTG Credentials Core Specification*
(WD v1.0, <https://trustoverip.github.io/dtgwg-cred-spec/>) creates leverage for the ZKP Task Force and the
wider agentprivacy work.

> **2026-07-17 — built out.** Each item below now has a full design doc in the exploration root:
> `~/dtgwg-cred-spec-main_mage/explorations/` (O1/O2/O3/O4/O7/O9 + VWC witness seat + O5/O6/O8), aligned
> to the **Predicate & Assurance-Boundary Decision Document** (`~/dtgwg-cred-spec-main_mage/
> predicate-assurance-boundary-decision.md`) — whose narrow language (e.g. nullifier = scoped reuse
> detection, not "one unique human") supersedes looser phrasing in this register. This file stays the
> compact index; the explorations are the how.

**Frame.** *Carry* = adopt the spec's objects so our proofs interlock with it (done in the coherence pass).
*Innovate* = the deferred layer the spec explicitly hands us, plus places our existing lineage already reaches
further than the spec. Each entry: **what the spec offers · what we carry · where we innovate · leverage**.

Leverage scale: 🔴 highest (charter-defining) · 🟠 high · 🟡 useful.

---

## O1 — Fill the deferred ZK layer  🔴
- **Spec offers:** two named constructions (pairwise VRC-based, community-anchored VMC-based) but is
  *deliberately format-agnostic* and states "detailed ZK protocols and registry-ZK interactions deferred to
  future work."
- **Carry:** our six predicates already ride those two constructions (see coherence map).
- **Innovate:** make DTG ZKP V1.0 *the* conformant binding for the spec's two constructions — the missing
  layer, not a parallel scheme. This is the cleanest possible charter fit: the sibling spec has cut a hole
  exactly our shape.
- **Leverage:** every other item depends on this framing landing.

## O2 — PHC realized by nullifier  🔴
- **Spec offers:** the **PHC pattern** — a VMC whose governance enforces "real human + exactly-one-membership-
  per-person" — but leaves the *mechanism* that enforces one-per-person unspecified (governance + registry).
- **Carry:** runtime 01 already implements exactly one deterministic pseudonym per person per context, with the
  self-Sybil (P4) test proving the user-as-adversary case.
- **Innovate:** contribute the **ZK realization of PHC** — the nullifier is how a VTC *cryptographically*
  enforces the one-membership rule its PHC governance asserts, without a global identifier. Bridges the spec's
  governance-level PHC to a proof.
- **Leverage:** turns our most-mature runtime into a direct spec contribution.

## O3 — IDVC-anchored liveness profile  🟠
- **Spec offers:** **IDVC** as a first-class concept (any W3C VC satisfying VTC/VTN identity-proofing; named
  issuers Veriff/Jumio/Yoti/Onfido/ID.me/Socure/Trulioo) — but no assurance-level predicate profile.
- **Carry:** predicate 02 is "valid issuer signature over a hidden attestation."
- **Innovate:** define an **IDVC assurance-level predicate profile** — "valid IDVC at assurance ≥ L from a
  registry-listed IDVP" — as the standard liveness/personhood input contract. Gives biometric providers
  (Realeyes included) a concrete boundary object to sign.
- **Leverage:** aligns the biometric-provider side (Chair's domain) with a spec-named credential.

## O4 — Community-anchored ZKP = set-membership over the trust registry (+ revocation)  🟠
- **Spec offers:** community-anchored ZKP + trust registries (issuer/role/revocation authority), but explicitly
  defers the **registry-ZK interaction**.
- **Carry:** runtime 03 (set-membership over the accredited/registry set) + the revocation question (§9 Q5).
- **Innovate:** specify how a ZK proof reads/authorizes against a trust registry and handles revocation
  (accumulator / vector commitment when the set churns) — the deferred "registry-ZK interaction" by name.
- **Leverage:** fills a gap the spec flags in its own text; co-authorable with the Credentials TF.

## O5 — taskContext-bound freshness as a conformance harness  🟡
- **Spec offers:** `taskContext` binding + the **outcome-interpretability rule** (a `taskContext`-bearing
  credential is not evidence of task completion without reachable, verified outcome evidence).
- **Carry:** runtime 05's replay/freshness harness.
- **Innovate:** offer runtime 05 as the **conformance harness** for the spec's context-collapse-prevention
  requirement — freshness nonce ↔ `witnessContext.sessionId`, replay-under-new-nonce must fail.
- **Leverage:** cheap, concrete, testable contribution to the spec's verification section.

## O6 — Correlation architecture (R/M/C/P-DID) ↔ privacy-pools / mana-pools  🟡
- **Spec offers:** a four-DID correlation model with mandatory R-DID uniqueness and deliberate-only
  correlation.
- **Carry:** our privacy-pools / mana-pools nullifier + unlinkability lineage ([[project_tig_zk_loop]],
  [[project_dual_agent_harness]]) is the same unlinkability discipline.
- **Innovate:** cross-pollinate — the pools' pseudonym/unlinkability constructions inform R/M/C/P-DID derivation;
  the spec's correlation taxonomy sharpens our pools' domain-separation story.
- **Leverage:** reuse of an existing, battle-tested code lineage.

## O7 — r-card / Agent card ZK proofs  🟠
- **Spec offers:** planned DTG Verifiable Data Structures — **r-card** (self-updating vCard analog carrying a
  VRC) and **Agent card** (modeled on the A2A AgentCard discovery document for AI agents).
- **Carry:** RCard is already in our canon; agentprivacy has a running agent-identity line.
- **Innovate:** ZK proofs *over* agent cards — an agent proving capabilities/authority from its Agent card
  without revealing the principal or full card. This is where DTG ZKP meets agentprivacy's agent-sovereignty
  thesis (the "how do agents act on your behalf without eroding sovereignty" question).
- **Leverage:** distinctive to Soulbis/agentprivacy; opens the agent-privacy surface the spec only gestures at.

## O8 — Post-quantum ZK path  🟡
- **Spec offers:** nothing on PQ (its security section notes key-compromise resilience only).
- **Carry:** strawman §8 already commits to "pre-quantum acceptable for v1, documented PQ path."
- **Innovate:** let the ZKP TF *lead* the PQ-ZK story for the DTG stack; connect to the ecdsa.fail / quantum-ECC
  lineage ([[project_shor_mage_gokit]]) for a credible threat model.
- **Leverage:** first-mover on a gap the whole DTG stack shares.

## O9 — VRC-as-promise-bundle economic layer  🟠
- **Spec offers:** a **minimal** VRC schema (a bare relationship attestation) — intentionally small so
  predicates stay simple.
- **Carry:** our whitepapers already define VRC richer — "promise bundle," "mutual comprehension," ERC-7812
  bilateral commitment (see `CRED-SPEC-COHERENCE-NOTES.md` Gap 2).
- **Innovate:** propose the **promise-theoretic / economic VRC semantics as an extension** the spec's minimal
  schema can carry (not a fork of the name). Ties to the dual-agent promise-theory work
  ([[project_dual_agent_harness]]).
- **Leverage:** turns a coherence "drift" into a spec contribution — we bring economics the spec left open.

---

## Reading of the whole

The spec's most valuable move for us is what it **declined to specify**: it fixed the credential/DID/registry
model and the two ZK construction *shapes*, then deferred every ZK protocol detail and the registry-ZK
interaction. That is the ZKP Task Force's entire deliverable, pre-scoped by an upstream WG. O1–O2–O4 are the
charter core (fill the layer, realize PHC, bind to the registry); O3 aligns the biometric-provider boundary;
O7 + O9 are where agentprivacy's own thesis reaches past the spec (agent-card ZK, VRC economics); O5/O6/O8 are
lower-cost reuse of what we already have. Next concrete step remains the circom port of runtime 01 (Poseidon
nullifier + Merkle membership) — which is simultaneously O2's PHC realization and O4's registry-membership
primitive.
