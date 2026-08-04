# X1 — Conformance fixtures and the negative-test vector suite

*The fixtures are the interop layer. §26 already requires every conformant profile to ship positive,
negative, and cross-context test vectors; §25 makes deterministic test-vector support a construction-
evaluation criterion; §24 prohibits verifier-only formats "without interoperable test vectors." This
exploration takes those three rulings at their word: the Task Force's conformance fixture suite is a
first-class deliverable — canonical, serialized, implementation-independent vectors that let two
independent implementations prove they instantiate the same decisions, not just the same math.*

**Register:** cross-cutting (feeds every O-item; the ladder's own rungs) · leverage 🔴 · **Ladder:**
reference at **v2** 2026-07-18 — `~/dtgwg-zkp-tf-mage/runtimes/fixtures/` 13/13; reason register v2 =
**66 exact codes + 29 parameterized families (95 entries)** absorbing all six instrument builds, every
addition triggered live from its emitting module (F10, 0 source-scanned); convergences recorded
(silent-fallback dual-source, one entry); **§26.1 coverage 11/11, 0 gaps**. One vocabulary across the
whole lab — the interop claim extended to the instrument layer. **M5 DONE 2026-07-18** —
`runtimes/consumer-py/` 6/6: a stdlib-only Python consumer, no shared code, consumes all 39 vectors
with matching outcomes and byte-identical reason codes, and re-derives **29/29 embedded canonical
digests byte-exactly** cross-language. Zero JS↔data divergences found. The X1 claim is now an
existence proof: the fixtures carry the decisions, not the JavaScript
**Anchor (cred-spec):** the deferred ZK layer's interop story — two constructions, many implementers.
**Anchor (decision doc):** **§26** conformance requirements · **§26.1** minimum negative tests · §25 gate
item 10 + "deterministic test-vector support" · §2.4 three-parameter claims · §9 register ("must not infer").

---

## What the decision doc already decided (and what it leaves open)

§26 makes fixtures mandatory: a conformant profile MUST provide "a canonical transcript fixture," a
"nullifier scope-and-epoch fixture where applicable," a registry-snapshot fixture, and "positive, negative,
and cross-context test vectors." §26.1 then names eleven rejections the test programme MUST produce. What
the doc does *not* yet define is a **fixture format**: how a vector is serialized, how a rejection is named,
and how two implementations compare results. The explorations README already observes that our property-test
suites "are early drafts of its conformance fixtures and negative tests (§26)." This doc designs the step
from property test to fixture: today the tests live as executable JS assertions inside runtimes 01 and 07;
a fixture is the same assertion **frozen as data** — canonically encoded inputs, an expected outcome, and a
named reason — runnable by any implementation in any language, with no shared code.

## The claim

> Two implementations that accept the same positive vectors, reject the same negative vectors **for the
> same named reasons**, and keep cross-context vectors unlinkable, instantiate the same §25-gated decisions
> — independent of proving system, hash choice, or language.

The narrow part, stated on purpose: fixtures prove *decision conformance*, not security. A fixture suite
cannot show a construction is sound (that is the §25 adversary-model work); it shows an implementation has
not silently *re-decided* a settled question — the failure mode §26.1 is aimed at. And per §2.4, each
fixture family must carry the claim's three parameters (against whom / for how long / alongside what) as
metadata, or the vector tests something untestable.

## Design sketch — the fixture format

Each vector is one JSON object; families group by predicate (PR-UNQ, PR-FRE, …) and by profile (MLP/EPP):

```
{ "fixture": "PR-UNQ/negative/duplicate-human-in-context/001",
  "spec": { "decision-doc": "0.1.0-draft", "sections": ["§13", "§26.1"] },
  "inputs": { "contextDescriptor": { …canonical §6.2 fields… },
              "transcript": { …canonical §15.2 fields… },
              "witness": "…construction-specific, MAY be opaque…" },
  "expect": { "outcome": "reject",
              "reason": "duplicate-human-in-context",
              "claimCeiling": "scoped reuse detection (§5.12) — not one unique human" } }
```

Three commitments make it implementation-independent: **(1) Canonical encodings are the fixture's spine.**
Inputs are full §6.2 context descriptors ("MUST be included in conformance fixtures" — §6.2) and §15.2
canonical transcripts, never opaque strings — so a fixture simultaneously tests the predicate *and* the
encoding. **(2) A normative rejection-reason vocabulary.** The runtimes already name their rejections —
rt 01's `duplicate-human-in-context` (P4), rt 07's `unilateral-no-mutual-consent` (G1) and its G2–G7 kin —
and §26.1's eleven mandatory rejections give the vocabulary its required spine (one reason code per bullet,
e.g. `replay-cross-transcript`, `nullifier-domain-reuse`, `stale-registry-snapshot`, `silent-fallback`).
Deterministic error semantics are already required by §13.6; a shared reason register is that requirement
made interoperable. **(3) A third vector class: lint vectors.** §9's "verifier must not infer" column cannot
be tested cryptographically, but it CAN be tested as claim-language linting of verifier *outputs* — §26.1
already mandates rejecting "a verifier output implying biometric correctness." A lint vector pairs a
verifier output document with prohibited claim patterns (from §9's column and §24's prohibited-claims list:
"one-human-one-record," global uniqueness, civil identity). This is how the fixtures encode the NEGATIVE
meanings, which are decisions just as binding as the positive statements (§2.1's structure).

## What exists

- `~/dtgwg-zkp-tf-mage/runtimes/01-uniqueness-nullifier/` — 9/9 properties; P4 self-Sybil is a ready-made
  §26.1 negative vector; P2/P5 are the cross-context class; versioned domain tag `dtg-zkp/nullifier/v0`.
- `~/dtgwg-zkp-tf-mage/runtimes/07-trust-graph-formation/` — 11/11; G1–G7 are seven named rejections
  (consent, personhood anchor, self-edge, R-DID reuse, unsigned proposal, duplicate VRC, forged commitment).
- The gaps, per §26.1: no expired/revoked-attestation vector, no epoch/snapshot-inconsistency vector, no
  fallback-downgrade vector, no lint vectors at all — the suite is seeded, not covering.

## Build plan

- **M1 — reason register draft.** Map every rt 01/07 rejection name + all eleven §26.1 bullets into one
  versioned rejection-reason vocabulary; note which reasons are retry-vs-attack ambiguous (§13.6).
- **M2 — fixture schema.** JSON schema for vector/family/manifest incl. §2.4 claim-parameter metadata and
  the three classes (accept / reject / lint); canonical-encoding rules deferred to §6.2/§15.2.
- **M3 — extraction.** Emit rt 01 + rt 07 property tests as serialized vectors; re-run both runtimes as
  *consumers* of their own emitted fixtures (the determinism check §25 asks constructions to support).
- **M4 — coverage table.** §26.1 bullet × fixture-family matrix; write the missing negative vectors
  (expired attestation, epoch mismatch, silent fallback, key-control-as-authority).
- **M5 — cross-implementation exchange.** Second consumer in another language (Python) passes the suite
  untouched — the existence proof that the fixtures, not the code, carry the decisions.

## Upstream surface

- To the TF: a proposed **§26.2 fixture format** (schema + reason register) — the missing normative half of
  §26's "MUST provide … test vectors"; the reason vocabulary offered for ratification alongside §28's list.
- The §25 gate gains teeth: item 10 ("conformance fixtures and negative tests") becomes checkable — a
  construction proposal arrives *with* its vector families or is not gate-ready.
- Every other exploration inherits the format: O2's boundary record (M1 there) ships with PR-UNQ vectors,
  O4 with snapshot vectors, VWC with witness-transcript vectors. One format, per-predicate families.

## Open questions

- How opaque may `witness` be? Fully opaque keeps fixtures construction-neutral but weakens the negative
  tests; construction-specific witnesses fork the suite per proving system. A two-layer answer (semantic
  vectors normative, construction vectors informative) needs TF appetite.
- Lint vectors judge prose — who owns the prohibited-pattern list, and in which languages? (§27.4: Human
  Experience work owns legibility; the lint list is a shared artefact with them.)
- Should a fixture-suite version pin to the decision-doc version (vectors as the doc's executable diff),
  so a context expansion without version and migration (§26.1) is caught by the suite failing to load?
