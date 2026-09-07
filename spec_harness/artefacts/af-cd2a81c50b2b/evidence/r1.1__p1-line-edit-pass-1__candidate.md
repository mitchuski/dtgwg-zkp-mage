---
title: The LAN Ceremony — a portable proof-of-understanding trust task
version: 0.1.0-draft
date: 2026-07-18
status: RESEARCH-ROOT SPEC DRAFT — promotes the 2026-06-28 LAN workshop chronicle;
  NOT upstreamed; upstream design note only after the Wave 1–2 notes land (see
  TRUST-TASKS-FIT-MAP-2026-07-18.md)
provenance:
  - ~/.wiki/chronicles/2026-06-28_lan_workshop_mage_sync_networking_reflection.md (§5, §5½–5¾)
  - memory project_lan_ceremony_mage_mesh (2026-07-10 promotion: cited in
    dual-agent-harness FLEET.md §2 / ERRATA.md E-2 as the worked design of THE trust task)
  - ~/myterms/PRESENTATION_BRIEF_MYTERMS_STANDARDS_2026-07-01.md (IEEE 7012 grounding)
siblings:
  - Gatehouse WP3 understanding-as-key gate (supervised/regulator variant)
  - agentprivacy-guide-gatehouse sigil-gates (asynchronous/document variant)
---

# The LAN Ceremony: a portable proof-of-understanding trust task

## 1. The rule

**Access is earned by understanding, not credential.** Any agent can hold a key; the
ceremony tests whether the party at the door has read and understood the room's terms,
then opens graduated access. The lintel over the door (Gödel-deepened — Mitch's
correction: the danger of "perfect" is structural, not pragmatic):

> A trust that certifies itself is the one you cannot trust. Trust, like truth, always
> waits on a witness from beyond the system that holds it.

Operationally: the seal is never self-issued. Something outside the two parties — a
witness artifact, broker, or externally-anchored record — must attest the ceremony
happened without becoming the authority for its meaning.

## 2. The ceremony (per-participant state machine)

Five states, monotone, no skips (borrowing the Game-of-42 TRUST-PROTOCOL group-seal
shape at `p=sealed`):

```
unresolved → resolved → handshook → exchanged → sealed
```

1. **unresolved → resolved** — *naming*. The joining agent OFFERS its address (consent,
   not scan); the host resolves it deterministically (carried resolver, never venue
   mDNS; one name per instance, everything else a path). A name that resolves sometimes
   is worse than never — the david.local case proves it.
2. **resolved → handshook** — *the gateway page*. The host points the agent at a
   gateway document stating the room's terms; reading it is the handshake —
   understanding begins here, not at a login form. A catch-all front door degrades
   near-misses soft (302 to the gateway), never hard-fail.
3. **handshook → exchanged** — *understanding demonstrated*. The agent answers from the
   gateway's content (comprehension, not copy) — the Gatehouse understanding-challenge
   and sigil-gate-proverb primitive in its consent-first peer form.
4. **exchanged → sealed** — *the agreement*. The seal is a **bilateral MyTerms
   (IEEE Std 7012-2025) agreement**: strictly two-party, First Person ↔ Second Party
   (agents/devices/credentials are fabric, never parties). The individual PROPOSES
   terms from a standard roster (acceptance-before-proposal invitation pattern);
   three registers correspond — plain language, legal (Customer Commons canonical),
   machine-readable (JSON-LD/W3C DPV).
5. **sealed → graduated access** — *the cookie jar*. Access is host-scoped and
   MEDIATED: a broker holds the raw credential and issues delegated, scoped grants; the
   agent never sees the underlying secret. (The existing cookie-broker, re-aimed.)

## 3. Why this is a Trust Task, in the registry's own terms

Each transition is one finite unit of verifiable inter-party work with a natural
envelope mapping — and the registry already holds the pattern for step 5:
`vault/proxy-login` ("exercise a credential without releasing it") is precisely the
broker move, with `exposure.discloses` separating session outcome from released
secret material. Candidate family sketch (NOT claimed; no collisions in registry.json
as of 2026-07-18):

| Candidate slug | issuer → recipient | sideEffects | exposure |
|---|---|---|---|
| `understanding/offer` | joining agent → host | none | metadata (the offered address) |
| `understanding/gateway` | host → joining agent | none | metadata (the terms document ref) |
| `understanding/exchange` | joining agent → host | mutating | metadata (answers; scored) |
| `understanding/seal` | both (bilateral) | mutating | metadata (the 7012 agreement ref) |
| `understanding/grant` | host/broker → joining agent | mutating | secret (scoped delegated grant) — `actsAsSubject: false` |

Named rejections carried as error codes: `name-resolves-sometimes` (intermittent
resolution is a refusal, not a retry), `copy-not-comprehension`, `self-issued-seal`,
`grant-without-seal`, `raw-credential-requested`.

## 4. Relation to the admission ceremony (Wave 2 note)

Same primitive, two postures:

- **agent-admission/*** — SUPERVISED: a regulator/supervisor gate, two-gate rule
  (human approval ∧ understanding), derived scope, bilateral VRC, audit chain.
- **understanding/*** — CONSENT-FIRST PEER: no supervisor; the host's terms and the
  joiner's proposal meet as equals under 7012; the seal is an agreement, not a
  credential; scope is a brokered grant, not a deployment manifest.

The convergence claim (from the MyTerms study): VRCs measure relationship fidelity FROM
OUTSIDE the agreement = the Gödel witness. A mature ecosystem uses both — agreement
inside, credential outside, neither substituting for the other. The credential/artifact
wall again, seen from the agreement side.

## 5. What must harden before an upstream design note

1. **Seal format.** Pin the machine-readable register: which roster (SD-BASE/PDC-AI…),
   which DPV terms, how `understanding/seal` references the agreement (by digest,
   presumably — same-bytes-same-hash).
2. **Understanding scoring.** The peer variant currently trusts the host's judgment;
   the admission ceremony's witness-draw mechanism (criteria drawn from the hash of
   the joiner's own submission) ports cleanly and removes the grooming vector.
3. **Broker generalisation.** State grant-mediation abstractly enough that
   `vault/proxy-login` reads as one instance (their spec) and the cookie jar as
   another (ours) — that's the interop story, not the cookie.
4. **The state machine as normative text** — five states, monotone, the two 502
   lessons (soft-degrade front door; intermittent resolution = refusal) as MUSTs.
5. **Naming contract** stays OUT of the upstream note (per-instance naming is our
   posture, not an interop requirement; a fixed universal name is the "completeness"
   the lintel warns against — don't canonise `mage.mesh` anywhere, including upstream).

## 6. Cross-references

Feeds on: [[project-lan-ceremony-mage-mesh]] · [[project-fedwiki-cohere-sync]] (broker)
· [[project-game42-visualization]] (group seal) · Gatehouse WP3 · guide sigil-gates.
Feeds into: TRUST-TASKS-FIT-MAP wave 3→4; the admission note's open question 2
(challenge portability) gets its second data point here.
