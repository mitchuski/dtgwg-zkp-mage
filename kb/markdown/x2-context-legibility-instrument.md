---
title: "X2 — Context Legibility Instrument"
section: "explorations"
source: "explorations/X2-context-legibility-instrument.md"
built_from_commitish: "working-tree"
order: 51
---
# X2 — the context human-legibility instrument

*The §6.8 six-question test made runnable: a context card derived from the canonical descriptor itself,
so the user-facing description provably matches the cryptographic configuration — and its person-side
twin is a MyTerms-shaped consent instrument.*

**Register:** not an O-item — expansion from §6.8/§2.5 · leverage 🟠 · **Ladder:** instrument built
2026-07-17 — [Lab — context-card](lab-context-card.md) 13/13 + demo card (see its NOTES.md)
**Anchor (decision doc):** §2.5 legibility is part of the context boundary · §6.2 canonical descriptor ·
§6.7 change control · §6.8 human-legibility test · §21.2 user-visible mediation · §23 redress row
"inaccessible or misleading context presentation" · §26 conformance evidence · §27.4 Human Experience.
**Anchor (agentprivacy):** MyTerms (IEEE 7012 machine-readable personal terms) · PVM Δ-axis — value is
the appropriation share the consent interface lets the subject keep.

---

## What it is

The decision document makes human legibility a **conformance property of a context**, not a UI nicety:
"a context boundary that is cryptographically exact but cannot be understood by an affected person is
operationally defective" (§2.5), and a context definition *fails review* unless an affected person can
answer six questions — what the proof is for, who can recognise repeat use, for how long, what an epoch
change does, whether fallback changes who observes, and how to challenge a wrong decision (§6.8).

Today that test is prose. This exploration turns it into an **instrument**: a *context card* — a
canonical human-readable rendering **generated from the §6.2 canonical context descriptor itself**. The
§26 requirement for "evidence that user-facing context descriptions match the cryptographic
configuration" then becomes a **derivation, not an audit**: the card and the proof transcript embed the
same descriptor digest, so a mismatch is a build failure, not a finding.

## Design

**1. The card is a function, not a document.** `card = render(descriptor)` where `descriptor` is the
canonically encoded §6.2 object (protocol/profile versions, context authority, policy, purpose, scope,
verifier set, epoch policy, nullifier and domain-separation version, retention/rollover policy). The
card carries the descriptor digest it was rendered from; the verifier's transcript (§15) binds the same
digest. Provenance is structural.

**2. The six §6.8 questions as structured fields**, each mapped to named descriptor inputs:

| Q | Card field | Descriptor inputs (§6.2) |
|---|---|---|
| 1 | What is this proof for? | purpose identifier · scope identifier |
| 2 | Who can recognise repeat use? | verifier audience / governed verifier-set · context authority |
| 3 | For how long is repeat use linkable? | epoch identifier and epoch policy · retention policy |
| 4 | What happens when the epoch changes? | epoch policy · nullifier and domain-separation version |
| 5 | Does fallback change who observes? | mediated-proving declaration (§21.2 "user-visible indication") |
| 6 | How do I challenge a decision? | context authority's correction/appeal/challenge route (§6.7) |

The repeat-use answers use the mandatory narrow language verbatim: a nullifier establishes **scoped
reuse detection**, never "one unique human."

**3. Legibility conformance check (runnable).** Every descriptor field either (a) appears on the card,
or (b) carries a recorded non-materiality justification. An unrendered, unjustified field fails the
check — the card cannot silently omit part of the linkability domain. Per §6.8: the card need not
expose cryptographic internals, but it MUST expose the operational meaning of the boundary.

**4. Expansion made visible.** §6.6 prohibits silent context expansion; §6.7 makes an expanding change
a material privacy change whose existing nullifiers MUST NOT be silently reinterpreted. On the card
this is a **versioned diff**: descriptor change → digest change → new card version, with Q2/Q3 deltas
highlighted ("the set of services that can recognise repeat use grew from X to Y"). What silent
expansion *looks like to a person* is precisely a card that didn't change when the domain did — which
the derivation makes impossible. This directly serves the §23 remedy row (notify, migrate, segregate)
and the §26.1 negative test "a context expansion without version and migration."

**5. The MyTerms twin.** The context card is the **verifier-side half** of a two-sided contract surface.
MyTerms is the person-side half: machine-readable personal terms the person carries. Matching is then
term-to-field: the person's retention term against the card's retention policy, their observability term
against the verifier set and mediation declaration. In PVM terms, the card is what makes the Δ-axis
evaluable at proof time — the consent interface sets the appropriation share, and it can only do so
over a boundary it can read.

## Boundary notes (the paired records, drafted)

**Assurance boundary:** a person relying on a card may rely on: this rendering was derived from the
same canonical descriptor the proof transcript binds. They must NOT infer: that verifiers *behave*
within the described boundary (the card states the governed domain, not runtime compliance); that the
context authority's policy is fair; that an accurate card implies informed consent. Accountability:
the wallet/verifier experience owner for the rendering (§23), the context authority for descriptor
truth and change control (§6.7).

**Disclosure boundary:** the card itself is a surface. Fetching a card can signal which context a
person is about to enter (a §20-style observable event — serve cards from the wallet or cache-bundled,
never as a per-presentation remote lookup). Rare descriptor combinations can fingerprint a deployment
(§6.6's rare-variant concern applies to cards too); renderings should be uniform per profile.

## Build plan

- **M1 —** descriptor schema + canonical encoding as data (reuse rt 07's `taskContext` / O5 transcript
  work — one encoding, shared).
- **M2 —** `render(descriptor) → card` reference implementation (zero-dep, offline, like the runtimes),
  emitting the six fields + digest; golden-fixture cards join the §26 conformance fixtures.
- **M3 —** the legibility conformance check as property tests: coverage (design point 3), digest match
  (card ↔ transcript), diff-on-change (design point 4) — early drafts of §26.1-style negative tests:
  a card whose digest mismatches its descriptor MUST be rejected by name.
- **M4 —** MyTerms mapping table (card field ↔ IEEE 7012 term) as a worked example, one context from
  rt 07's trust-graph formation rendered end-to-end.
- **M5 —** upstream surface: a Human Experience workstream contribution (§27.4) — "the §6.8 test as a
  derivation instrument," with the runnable checker as evidence. Local research doc until then.

## Open questions

- Reading level and accessibility: §27.4 names accessibility and assisted use — what is the conformance
  bar for the *rendering* itself (plain-language register, translation, screen-reader structure), and
  who owns it, the profile or the wallet?
- Q6 needs a live route, not a string: should the challenge route be a resolvable, governed endpoint
  the card verifies exists, or is a policy reference enough for V1?
- Can a card be *counter-signed* by the person's agent as evidence of presentation (tying into O7's
  delegation evidence), or does that create a new correlatable receipt — exactly the §6.6 shared-log
  risk the card exists to expose?
