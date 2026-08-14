# 2026-07-28 · The Thread Returns

> **Provenance.** A chronicle — the narrative working record kept alongside the lab, reflected
> into this repo so collaborators can follow the arc with the runtime traces beside it. Voice:
> framework (master series). The maintainer’s master copy is the source of truth; this copy is
> adapted only in this header and in paths (home-directory references translated to repo-relative
> where the artefact lives here). Signed by the First Person: not yet.
>
> **Runtime traces:**
> - upstream: [trustoverip/dtgwg-zkp-tf#10](https://github.com/trustoverip/dtgwg-zkp-tf/discussions/10) — the ratification thread
> - `runtimes/README.md` — the suite table; every A/B item’s evidence suite named in §2–3 runs from here
> - `predicate-assurance-boundary-decision.md` — the §28 points the thread restates

*The decision document went out as a first draft; it came back as the agenda. Scott's ratification
thread for the first working call is the §28 list restated — and every item on it already has a
runnable answer in the lab.*

**Scope:** upstream discussion [trustoverip/dtgwg-zkp-tf#10](https://github.com/trustoverip/dtgwg-zkp-tf/discussions/10)
("Decisions to ratify — first call, Tue 28 July"), read against the workbench lab
(`runtimes/`, 17 suites / 170 properties, all green) and the decision baseline
(`predicate-assurance-boundary-decision.md`). Continues the 2026-07-16
dream-cycle and 2026-07-18 first-circuit chronicles.

---

## 1. What came back

Ahead of the first working call (Tue 28 July, 11:00 ET), the Chair posted the ratification thread:
seven foundational frame items **[Ratify]** (A1–A7), ten open decisions (B1–B10, two of them
**[Discuss]**), and one explicit deferral (C: construction selection waits for boundary ratification
plus benchmarking). Replies of agree / object / amend are due **Friday 31 July**; silence on a
[Ratify] item after that counts as assent.

The notable thing is provenance: A1–A7 are the decision document's own ratification points, returned
in the Chair's voice. The first-draft-for-TF-review pattern worked — the draft did not get discussed,
it got *adopted as the frame for discussion*.

## 2. The frame items, each with its evidence

What makes this call different from most first calls: none of the seven frame items is an aspiration.
Each one is a property somewhere in the lab that either passes or fails.

- **A1 — predicates over an attestation, not correctness of the determination.** The fixture register
  is rejection-only by construction; construction guards and model guards were deliberately excluded
  from the vocabulary. §26.1-b1 exists as a semantic vector for exactly this split.
- **A2 — context-dependent unlinkability, not full unlinkability.** Runtime 01 and the circuit hold
  both halves: same context → same nullifier (detectable), different context → unlinkable values.
  Cross-context unlinkability is a named test (also G6c in the guardian circuit).
- **A3 — Minimum Liveness Profile / Extended Personhood Profile split.** The split is load-bearing
  through the lab: the show-composition bundle registry (MLP-BASE … EPP-RANGE), the
  quiet-presentation leakage budgets tabled ×MLP/EPP, the governed K-tiers in multi-issuer.
- **A4 — paired assurance + disclosure boundary per predicate.** The decision document's PR-* register
  itself, plus the erosion-record validator enforcing reliance records that erode as rates, never
  cliffs.
- **A5 — every claim states against whom, for how long, alongside what.** Executable three ways:
  per-§19-observer budgets (quiet-presentation), the ten-clock table (erosion-record), the
  jointDisclosureRecord (show-composition).
- **A6 — a nullifier means scoped reuse detection, not "one unique human."** The narrow language
  survived from prose into constraints (first-circuit chronicle, §3); the context card enforces it as
  named lint failures.
- **A7 — holder-key control ≠ agent authority.** The O7 agent-card exploration on PR-DEL and the
  fixtures PR-DEL family carry delegation as separate structured evidence, out of the crypto.

## 3. The two [Discuss] items are where the lab speaks loudest

**B1 — context delimiter.** The thread asks what bounds a context. The canonical module is a working
answer in bytes: context = the §6.2 descriptor digest, purpose-and-governance-bounded because the
descriptor *contains* scope, purpose, epoch, and versions — and the context card renders that same
digest into six human-legible questions. One object, machine-bound and human-read.

**B2 — collusion target.** The multi-issuer runtime is the concrete position: k-of-n concealed
membership, an independence register where correlated issuers collapse to one factor via connected
components, and a ∏ε bound whose assumptions (A1–A4) are explicit rather than implied. The weaker
deployments B2 wants named are exactly the degraded tiers the runtime can execute (ε→1).

Among the [Ratify]-tagged B items, the instruments line up the same way: B4 issuer concealment — the
dual-issuer statement never exposes raw k or issuer identities (a structural scan asserts it); B7
lifecycle — rotation's epoch derivation never consumes the master secret, enrolment-root
cryptoperiods and assurance horizons are fields, not prose; B9 mediated proving — the mediator
runtime makes the honeypot tier unbuildable at the constructor and carries P-ISOLATE / P-FORGET as
tests; B10 human legibility — the context card re-verifies coverage from the card *text*, so
legibility is conformance, not courtesy.

## 4. Section C is the door left open

The deferral is worded as a gate: constructions are selected "only after boundary ratification +
benchmarking." The benchmarking half already exists — 11,523 / 10,717 / 16,078 constraints across the
circuit family, ~640–1110 ms to prove, ~8–11 ms to verify, 722-byte proofs, depth-20 ≈ 1M capacity,
plus the Semaphore v4 cross-check that found the closest deployed system's accidental gap (no
in-circuit transcript binding) and fixed it locally for +1 constraint. Nothing to push on the first
call; when the boundaries ratify, the data is waiting.

## 5. What is on our list but not the thread

Six decision items from the workbench are absent from A/B/C: the transcript-binding signal layout,
the Semaphore-compat profile, EdDSA identity for PR-HLD, the log-retention two-faces question, the
§26.2 fixture format, and enrolment-root-in-preimage. B1 and B9 graze some of them, but none is up
for ratification. The transcript-binding item matters most — it is a live gap in the closest deployed
system and the fix is one constraint — so it is the natural first amendment, raised on the call or as
a thread reply before the Friday assent deadline.

## 6. Why this is the interesting moment

The first-circuit chronicle closed on "meaning first, constraints last." This is the next inversion:
**evidence first, ratification second.** The usual standards failure mode is ratifying language that
nothing can test, then discovering the gaps in implementation years later. Here the thread's every
frame item already has a suite that would fail if the item were false — the vote is not on hopes but
on properties that have been green for ten days. Silence-counts-as-assent is normally a hazard;
against a lab this shape, it is merely efficient.

---

*Disposition: chronicle only — nothing posted to the thread, nothing pushed. Thread replies and
amendments are Mitch's to make before Friday 31 July.*
