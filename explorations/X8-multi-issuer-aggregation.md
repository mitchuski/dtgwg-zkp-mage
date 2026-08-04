# X8 — Multi-issuer confidence aggregation: making §12.5 decidable

*§12.5 records, non-normatively, that when a show combines attestations from multiple issuers, "a
verifier's confidence against mis-issuance increases multiplicatively with the number of honest,
independent issuers contributing to a show; a corrupted or negligent issuer degrades only its own
contribution" — and leaves whether and how a profile requires this as an open TF decision. This doc
develops the mechanism into a decidable profile choice: the bound stated as a theorem with its
assumptions explicit, an independence register that makes the load-bearing assumption checkable, a ZK
realization that composes with issuer concealment, and an honest account of what k costs to disclose.*

**Register:** X-series (second wave) · leverage 🟠 · **Ladder:** reference built 2026-07-18 —
`~/dtgwg-zkp-tf-mage/runtimes/multi-issuer/` 10/10: independence collapse as connected components
(always weakens the bound), statement carries effectiveK never raw k, tier enforcement at build AND
verify, §12.5 degradation clause executable. **k=2 NOW IN-CIRCUIT** (`runtimes/circom-gadget/`
dual-issuer 7/7: 10,717 constraints = exactly 2× + 1 distinctness constraint; a duplicate issuer
cannot produce a witness; showContext = §15.2 transcript digest; ISSUER_TAG pinned). Threshold
hiding + registry-side semantics stay out-of-circuit. See both NOTES.md
**Anchor (cred-spec):** trust registry (issuer/role/revocation authority) · multi-credential shows.
**Anchor (decision doc):** **§12.5** aggregation mechanism (the seed) · §12.1 PR-ISS stays binary ·
§12.3 concealment modes · §12.4 snapshots · §2.4 three-parameter claims · §29 "multi-issuer assurance"
open item · §8 assurance allocation · §10.4/§18.4 rarity and combination · §18.2 accreditation reference.

---

## The model made precise (theorem-shaped, assumptions explicit)

**Claim.** Model each issuer i's attribute-validation process as bounded by a one-sided error parameter
ε_i: the probability that issuer i attests the predicate when it is in fact false; a false attestation is
the only error mode counted (§12.5's "one-sided"). Then for a show carrying attestations from issuers
{1..k}, under assumptions A1–A4 below, the residual probability that the predicate is false yet every
issuer attested it is bounded by **∏ᵢ ε_i**. If issuer j is corrupted or negligent, its factor is replaced
by 1 and the bound degrades to ∏_{i≠j} ε_i — "a corrupted or negligent issuer degrades only its own
contribution and does not weaken the assurance carried by the other issuers involved" (§12.5, verbatim).

**A1 — one-sided error.** ε_i bounds mis-issuance only; availability/rejection errors are out of scope.
**A2 — independence.** The issuers' validation errors are statistically independent events. This is a
claim about *processes* (pipelines, vendors, operators), never about set membership — "issuer
independence is asserted, not derived from set membership alone" (§12.5); PR-ISS itself "does not
establish issuer independence" (§12.2).
**A3 — distinctness.** The k attestations come from k pairwise-distinct issuers in the accepted set.
**A4 — same proposition.** All k attest the same predicate over the same subject-binding commitment;
aggregating different predicates is composition (X3), not aggregation.

PR-ISS as stated in §12.1 remains a binary set-membership statement (§12.5's first sentence). The bound
is an *additional* profile-level statement layered on k instances of it. Negative meaning: the bound does
not establish determination correctness by any issuer (§2.2), equal assurance across the set (§12.2), or
anything about issuers outside the show.

## The independence register — making A2 checkable

A2 is load-bearing and undeclarable-by-cryptography, so it must be a *governed record*, not a vibe. The
registry (§27.3) maintains, per issuer, declared **dependency classes**: shared biometric vendor or model
version; shared identity-proofing pipeline or operator; common corporate parent; common jurisdiction or
legal-compulsion domain; shared enrolment infrastructure. Two issuers sharing a class are **correlated
for that failure mode and collapse to one effective factor**: the effective k of a show is the number of
distinct independence classes represented, and a class's ε is the class's shared-dependency bound, not
the product of its members. The verifier's independence assumption then becomes checkable against the
register — and is itself stated in §2.4 form: **against whom** (which dependency classes and collusion
sets the independence claim survives — it does not survive a compromised shared vendor), **for how long**
(the register snapshot's effective time and the shortest member assurance horizon), **alongside what**
(the named registry snapshot, the declared class list, and the show's other disclosed fields).

## The ZK realization — k distinct concealed issuers

Statement, informally: *k pairwise-distinct members of the accepted issuer set at named epoch root R each
signed an attestation over the same subject commitment attesting the predicate — without revealing which
members.* Build: k instances of the shared Poseidon-Merkle membership gadget (O2/O4) against the **same**
named root (§12.4; inconsistent snapshots are a §26.1 rejection), plus **distinctness via per-issuer,
per-show nullifiers**: N_i = H_domain(issuer_id_i, show-transcript digest). k distinct N_i prove k
distinct issuers while revealing none — the scoped-reuse discipline (§5.12) reused at the issuer level:
the nullifier establishes distinctness-within-this-show, not issuer identity, and the show-transcript
domain separation (§15.2) prevents cross-show issuer correlation. This slots into §12.3 as its fourth
listed mode ("multi-issuer or threshold assurance") and composes with the others: concealed-within-set
aggregation, or aggregation with coarse issuer-class disclosure per class-specific ε floors.

## The disclosure cost — k is the disclosure

k is public; the statement is k-of-n. As in X3's degree-leakage seed, **k IS the disclosure**: a rare k,
or a rare accepted-set/root choice, fingerprints the verifier's risk posture and narrows the holder
population (§10.4, §18.4) — k=7 against a boutique registry is nearly a name. Remedy, as in X3's bundle
profiles: a **small governed tier vocabulary, k ∈ {1, 2, 3}**, registered per profile; requests outside
the tiers are a §26.1 rejection. Each additional tier spends anonymity set to buy assurance — the same
trade-curve honesty as §2.3, and the joint record for an aggregated show is X3's joint disclosure record
with k and the root as enumerated members.

## The accreditation economics — ε as a certification clock

§12.5: this "gives an accreditation framework a purpose beyond maintaining a list." Concretely: extend
§18.2's issuer-accreditation-reference field class with a per-issuer **documented confidence parameter**
ε_i — set by the accreditation authority from audit evidence, never self-asserted; re-based on a governed
cadence. In X6's terms ε_i is a **certification-clock value with an assurance horizon**: an audit
establishes it at a time, and it erodes rather than holds — a profile MUST state the horizon past which a
stale ε_i no longer supports the multiplied bound, and registry snapshots (§12.4) carry ε values and
dependency classes with effective times so the whole aggregation claim is evaluable at a named time.

## Where aggregation is worth it — honestly

- **PR-PER: the natural home.** §29 pairs "multi-issuer assurance" with personhood; independent issuers
  running independent enrolment pipelines are genuinely independent evidence about the same durable
  proposition, so A2 is achievable and the multiplication is real.
- **PR-LIV: mostly not.** Liveness is one determination by one sensor at one moment. A second issuer
  re-attesting the same capture shares the determination layer (§8) — A2 fails there, effective k = 1,
  and the extra factor is decoration. Aggregation helps only for genuinely separate capture events, which
  is a freshness design, not an assurance multiplier.
- **Rule of thumb:** aggregate where issuers make independent *determinations*; never count issuers that
  countersign one.

## Build plan

- **M1 — boundary record:** assurance + disclosure pair for the aggregated statement (Appendix B form),
  including the A1–A4 register and the §2.4-form independence claim.
- **M2 — independence-register data model:** dependency classes, ε fields, effective times — drafted as a
  registry-profile note for the Credentials TF (§27.3), riding O4's M1 epoch-root model.
- **M3 — reference model:** k-membership + distinctness nullifiers in the lab; negatives: duplicate
  issuer rejected, mixed roots rejected, k outside tier rejected, stale ε rejected (§26.1 style).
- **M4 — decision memo:** the §12.5 open issue answered as options (not-required / MAY per profile /
  SHOULD for EPP PR-PER) with the trade curve priced; TF picks.

## Upstream surface

Decision input for §12.5's open issue ("whether and how... is a task-force decision") plus the
registry-field proposal (ε_i + dependency classes) to the Credentials TF along the §27.3 boundary — they
own institutional legitimacy of the register; we own the statement, the bound, and its fixtures.

## Open questions

- Who audits ε_i, and can two accreditation frameworks' ε values be compared at all, or only within one?
- Threshold variants (k-of-m attestations *held*, k shown) — does hiding m leak less or just differently?
- Does a corrupted issuer discovered later retroactively re-price past aggregated shows (O4's
  retroactivity question, §10.6/§23 row 2), and who propagates the re-priced bound?
- Jurisdiction as a dependency class: is legal compulsion a correlated *failure* or a separate adversary
  in the against-whom parameter? (Likely both; needs the §19 observer treatment.)
