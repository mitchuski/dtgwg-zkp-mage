---
title: The LAN Ceremony — a portable proof-of-understanding trust task
version: 0.1.0-draft
date: 2026-07-18
status: RESEARCH-ROOT SPEC DRAFT — promotes the 2026-06-28 LAN workshop chronicle;
  NOT upstreamed; upstream design note only after the Wave 1–2 notes land (see
  TRUST-TASKS-FIT-MAP-2026-07-18.md)
provenance:
  - ~/.wiki/chronicles/2026-06-28_lan_workshop_mage_sync_networking_reflection.md (§5, §5½–5¾)
  - memory project_lan_ceremony_mage_mesh (2026-07-10 promotion; cited in
    dual-agent-harness FLEET.md §2 / ERRATA.md E-2 as the worked design of THE trust task)
  - ~/myterms/PRESENTATION_BRIEF_MYTERMS_STANDARDS_2026-07-01.md (IEEE 7012 grounding)
siblings:
  - Gatehouse WP3 understanding-as-key gate (supervised/regulator variant)
  - agentprivacy-guide-gatehouse sigil-gates (asynchronous/document variant)
---

# The LAN Ceremony: a portable proof-of-understanding trust task

## 1. Rule

Access is earned by understanding, not credential: the ceremony tests that the party at
the door has read and understood the room's terms, then opens graduated access. Lintel
(Gödel-deepened; Mitch's correction: the danger of "perfect" is structural, not
pragmatic):

> A trust that certifies itself is the one you cannot trust. Trust, like truth, always
> waits on a witness from beyond the system that holds it.

The seal is never self-issued: something outside the two parties — witness artifact,
broker, externally-anchored record — MUST attest the ceremony happened, without becoming
the authority for what it means.

## 2. Ceremony: per-participant state machine

Five states, monotone, no skips (Game-of-42 TRUST-PROTOCOL group-seal shape at
`p=sealed`):

```
unresolved → resolved → handshook → exchanged → sealed
```

1. **→ resolved — naming.** The joining agent ("joiner") OFFERS its address (consent,
   not scan); host resolves it deterministically: carried resolver, never venue mDNS;
   one name per instance, everything else a path. A name that resolves sometimes is
   worse than never — the david.local proof.
2. **→ handshook — gateway page.** Joiner is pointed at a gateway document stating the
   room's terms; reading it IS the handshake — understanding begins here, not at a
   login form. Front door serves a catch-all: near-misses degrade soft (302 to the
   gateway), never hard-fail.
3. **→ exchanged — understanding demonstrated.** Joiner answers from gateway content
   (comprehension, not copy) — the Gatehouse understanding-challenge /
   sigil-gate-proverb primitive, consent-first peer form.
4. **→ sealed — agreement.** Seal = bilateral MyTerms (IEEE Std 7012-2025) agreement:
   strictly two-party, First Person ↔ Second Party; agents/devices/credentials = the
   fabric, never parties. The individual PROPOSES terms from a standard roster
   (acceptance-before-proposal invitation pattern); three registers stay in
   correspondence: plain language · legal (Customer Commons canonical) ·
   machine-readable (JSON-LD/W3C DPV).
5. **sealed → graduated access — the cookie jar.** Host-scoped, MEDIATED: a broker
   holds the raw credential, issues delegated scoped grants; joiner never sees the
   secret (the existing cookie-broker, re-aimed).

## 3. As a Trust Task (registry terms)

Each transition: one finite unit of verifiable inter-party work, natural envelope
mapping. Step 5's pattern already exists — `vault/proxy-login` ("exercise a credential
without releasing it") is the broker move, its `exposure.discloses` separating session
outcome from released secret material. Candidate family sketch (NOT claimed; no
registry.json collisions as of 2026-07-18):

| Candidate slug | issuer → recipient | sideEffects | exposure |
|---|---|---|---|
| `understanding/offer` | joining agent → host | none | metadata (offered address) |
| `understanding/gateway` | host → joining agent | none | metadata (terms document ref) |
| `understanding/exchange` | joining agent → host | mutating | metadata (answers; scored) |
| `understanding/seal` | both (bilateral) | mutating | metadata (7012 agreement ref) |
| `understanding/grant` | host/broker → joining agent | mutating | secret (scoped delegated grant) — `actsAsSubject: false` |

Named rejections, as error codes: `name-resolves-sometimes` (intermittent resolution =
refusal, not retry) · `copy-not-comprehension` · `self-issued-seal` ·
`grant-without-seal` · `raw-credential-requested`.

## 4. Vs the admission ceremony (Wave 2 note)

Same primitive, two postures:

- **agent-admission/*** — SUPERVISED: regulator/supervisor gate; two-gate rule (human
  approval ∧ understanding); derived scope; bilateral VRC; audit chain.
- **understanding/*** — CONSENT-FIRST PEER: no supervisor; host's terms and joiner's
  proposal meet as equals under 7012; seal = agreement, not credential; scope =
  brokered grant, not deployment manifest.

Convergence claim (MyTerms study): VRCs measure relationship fidelity FROM OUTSIDE the
agreement = the Gödel witness; a mature ecosystem uses both — agreement inside,
credential outside, neither substituting — the credential/artifact wall seen from the
agreement side.

## 5. Harden before an upstream design note

1. **Seal format.** Pin the machine-readable register: which roster (SD-BASE/PDC-AI…),
   which DPV terms, how `understanding/seal` references the agreement (by digest,
   presumably — same-bytes-same-hash).
2. **Understanding scoring.** Peer variant trusts host judgment; the admission
   ceremony's witness-draw (criteria drawn from the hash of the joiner's own
   submission) ports cleanly, removing the grooming vector.
3. **Broker generalisation.** State grant-mediation abstractly enough that
   `vault/proxy-login` (their spec) and the cookie jar (ours) read as two instances —
   the interop story, not the cookie.
4. **State machine as normative text** — five states, monotone, both 502 lessons
   (soft-degrade front door; intermittent resolution = refusal) as MUSTs.
5. **Naming contract stays OUT of the upstream note** — per-instance naming is our
   posture, not an interop requirement; a fixed universal name is the "completeness"
   the lintel warns against — never canonise `mage.mesh` anywhere, upstream included.

## 6. Cross-references

Feeds on: [[project-lan-ceremony-mage-mesh]] · [[project-fedwiki-cohere-sync]] (broker)
· [[project-game42-visualization]] (group seal) · Gatehouse WP3 · guide sigil-gates.
Feeds into: TRUST-TASKS-FIT-MAP wave 3→4; the admission note's open question 2
(challenge portability) gets its second data point here.
