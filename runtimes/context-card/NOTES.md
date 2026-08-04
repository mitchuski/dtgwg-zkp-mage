# context-card — the §6.8 human-legibility instrument (X2)

**What this is.** The decision document's six-question human-legibility test (§6.8) made runnable:
a *context card* generated from the §6.2 canonical context descriptor itself, so the user-facing
description provably matches the cryptographic configuration. The §26 requirement — "evidence that
user-facing context descriptions match the cryptographic domain" (§6.7 last authority duty) — becomes
a **derivation, not an audit**: the card carries the descriptor digest, the §15.2 transcript binds the
same digest, and a mismatch is a named build failure (`digest-mismatch`), not a finding.

**Run:** `node test.mjs` → 13/13 · `node demo.mjs` → the rt 07 trust-graph-formation community-vote
context rendered end-to-end (X2 M4 worked example; the MyTerms term↔field table stays in the design doc).
**Reuses:** `../canonical/canonical.mjs` (§6.2 encoding + digest — one encoding, shared).

## The field → question map (X2 design point 2)

| Q | §6.8 question | §6.2 descriptor inputs |
|---|---|---|
| q1 | What activity is this proof for? | `purpose` · `scope` |
| q2 | Who can recognise repeat use? | `verifierSet` · `contextAuthority` |
| q3 | For how long is repeat use linkable? | `epoch` · `epochPolicy` · `retentionPolicy` |
| q4 | What happens when the epoch changes? | `epochPolicy` · `nullifierVersion` |
| q5 | Does fallback change who observes? | `provingMode` render *option* (§21.2) — not a §6.2 field; absent ⇒ "local proving only — no additional observer" |
| q6 | How do I challenge a decision? | `contextAuthority` (§6.7 correction/appeal/challenge route) |

`protocol`, `profile`, `contextPolicy` (and optional `registryDomain`) carry recorded
non-materiality justifications instead: version/identifier pins whose operational content is already
rendered through q1–q6, surfaced via the digest (§6.8: internals need not be exposed — but the
omission is recorded, never silent). `checkLegibility` re-verifies coverage from the card *text*
(each mapped field's value must appear in its question), so a stripped mapping fails by name
(`unrendered-field:<name>`).

**Narrow language (§5.12).** The repeat-use answers use the mandatory phrase verbatim — verifiers
"recognise repeat use (scoped reuse detection)" — and the checker sweeps all card text for the
forbidden broad-personhood phrasing as a named failure.

**Expansion made visible (§6.6/§6.7).** `diffCards` versions the card by digest and flags
`expansion=true` when q2 (recognition set — conservatively, any change: opaque identifiers can't
prove a subset) or q3 (linkability window — duration-compared; a shrink is a delta, not an
expansion) widened. What silent expansion looks like to a person is a card that didn't change when
the domain did — which the derivation makes impossible.

## Boundary notes (recap from X2)

A person relying on a card may rely on: *this rendering was derived from the same canonical
descriptor the proof transcript binds*. They must **not** infer that verifiers *behave* within the
described boundary — **the card states the governed domain, not runtime compliance** — nor that the
authority's policy is fair, nor that an accurate card implies informed consent. The card is itself a
surface: serve from the wallet or cache-bundled, never as a per-presentation remote lookup (§20).

## Pointers

- Design doc: `dtgwg-cred-spec-main_mage/explorations/X2-context-legibility-instrument.md` (research root — M1–M4 here, M5 pending).
- Candidate upstream surface: a §27.4 Human Experience workstream note — "the §6.8 test as a
  derivation instrument," with this checker as evidence.
