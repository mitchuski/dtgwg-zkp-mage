---
title: "O7 — Agent Card ZK"
section: "explorations"
source: "explorations/O7-agent-card-zk.md"
built_from_commitish: "working-tree"
order: 46
---
# O7 — Agent-card ZK proofs

*An agent proves capability and authority from its Agent card without revealing the principal or the full
card — built on PR-DEL's rule that authority is separate structured evidence, never key control.*

**Register:** O7 · leverage 🟠 · **Ladder:** design doc (runtime 08 candidate)
**Anchor (cred-spec):** planned DTG Verifiable Data Structures — **r-card** (self-updating vCard analog
carrying a VRC) and **Agent card** (modeled on the A2A AgentCard discovery document) · **VTA** (Verifiable
Trust Agent, local/cloud) · VPC/P-DID.
**Anchor (decision doc):** **PR-DEL** (§17) · §7.3 delegation extension · §14.2 (holder-key control is not
agent authority).

---

## Why this is the agentprivacy reach

This is where DTG ZKP meets the agent-sovereignty thesis: agents acting on a principal's behalf without
eroding the principal's privacy. The cred-spec gestures at Agent cards; the decision doc supplies the
discipline that makes the ZK version *safe to want*:

> Agent authority SHALL NOT be inferred from holder-key control. (§7.3)

So an agent-card ZK proof is not "the agent has a key" — it is a proof over **separate delegation
evidence**, §7.3's list made hidden-but-verifiable: principal, agent, delegated capability, scope, purpose,
validity window, conditions, revocation status, step-up requirements, and coverage of the *current action*.

## The statement

The presenting VTA proves, bound to the current canonical transcript (§15):

1. it possesses an Agent card issued/endorsed under an accepted policy (registry-anchored — O4);
2. the card's delegation evidence covers **capability c for the current action's scope and purpose**,
   within validity, not revoked;
3. the card is bound to a **P-DID/VPC** whose principal holds a personhood anchor (PHC leg — O2) —
   *without revealing the principal, the P-DID linkage, or the card's other capabilities*.

Rides the **pairwise (VRC-based) construction** + holder binding (rt 04's seat), with the card's fields
selectively disclosed as predicates.

**Negative meaning, carried verbatim** (§17.3): not that the principal is currently present; not that the
principal would approve every implementation detail; not that the agent is trustworthy outside the
delegation; not human intent or non-coercion (out of scope per §3.2).

## Design sketch

**Card as commitment tree.** The Agent card is Merkleized per field-class (identity binding, capability
list, scope/purpose grants, validity, conditions, step-up rules). A proof opens only the path for the
queried capability + validity + binding — the discovery-document *shape* stays A2A-compatible in the clear
form, while the ZK presentation reveals one branch.

**Two-sided minimality:** the verifier learns "an authorized agent for action X under policy P" — not who
the agent serves. The principal-side unlinkability is the point: across verifiers, the same agent serving
the same principal must not be correlatable via the card (fresh presentation randomness; no stable card
identifiers — §6.6's prohibited-linkage list applies to card fields exactly as to credentials).

**Revocation is first-class:** delegation is the credential class *most* likely to be revoked mid-life
(§17.1 lists revocation state in the evidence). The O4 status patterns apply, with tighter freshness — a
relying policy for delegated actions should demand a younger registry snapshot than one for personhood.

**Step-up:** §7.3's step-up requirements map to the transcript: a card may grant capability c only with an
accompanying fresh PR-LIV proof from the *principal* — composable because all our predicates bind the same
canonical transcript (composition surface per §2.6 must be analysed jointly).

## What exists

- rt 04 STUB (holder/agent binding, VPC/P-DID + VTA presenter) — the binding seat this composes onto.
- The agentprivacy lineage: hearthold/harness agent roles, the myterms/blade browser-agent line, and the
  r-card already in canon — real surfaces that would *use* this profile.
- A2A AgentCard as the interop target for the clear form.

## Build plan

- **M1 — card schema sketch:** field classes + §18.1 per-field register (each card field gets a disclosure
  mode; capability lists are high-cardinality and fingerprint-prone — coarse capability classes preferred).
- **M2 — boundary records:** PR-DEL assurance + disclosure pair for the card construction (the disclosure
  record must cover the agent-traffic observer: *when* an agent proves is itself behavioural leakage, §20).
- **M3 — runtime 08:** reference model — Merkleized card, capability query, transcript binding, negative
  tests (revoked delegation fails; capability outside scope fails; key-control-only presentation fails
  **by name** — the §26.1 "holder-key control as sufficient agent authority" rejection).
- **M4 — TF/WG surface:** a short "ZK presentations of Agent cards" note where the cred-spec's Verifiable
  Data Structures section invites future work; frame as the delegation extension's proof layer.

## Open questions

- Who issues the Agent card — the principal (self-issued delegation, anchored by the principal's PHC) or a
  governance layer (registered agents)? Likely both, as distinct profiles with different PR-ISS postures.
- Chained delegation (agent delegates to sub-agent): §7.3's evidence list composes, but depth bounds and
  transitive revocation need semantics — park for V2, note in the card schema.
