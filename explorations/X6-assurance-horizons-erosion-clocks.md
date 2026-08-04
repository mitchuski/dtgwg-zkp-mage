# X6 — Assurance horizons and erosion clocks — the PVM reading

*The decision doc's assurance horizon (§5.9) is structurally the Privacy Value Model's erosion clock: a
proof's privacy guarantee is fixed at proof time, but the observer's background accumulates — the proof
does not leak more; it matters less.*

**Register:** none — X-series research bridge (agentprivacy research reaching *into* TF work, not a
register expansion) · leverage 🟡 · **Ladder:** reference built 2026-07-18 —
`~/dtgwg-zkp-tf-mage/runtimes/erosion-record/` 8/8: ten-clock sort as a closed validated list,
erosion-aware residual-risk record (overclaimed measurement structurally banned; rate-not-cliff
enforced), PR-UNQ worked example with §23-routed re-base accountability. See its NOTES.md
**Anchor (decision doc):** §5.9 assurance horizon · §5.10 cryptoperiod · §22.1 separate clocks · §10.6
reliance expiry · §2.4 "for how long" · §19/§20 disclosure surfaces and observable events · §26
residual-risk record.
**Anchor (PVM):** PVM V6 moving ceiling, C82 (WP-07 Def 3.9 + Cor 5.4b lineage): erosion form
R_inf(t) = Σε_i / H(X | B_t); two-clock thesis (certification clock vs erosion clock).

---

## What the decision doc offers

The decision doc already treats time as first-class. §2.4 makes **"for how long"** a mandatory parameter
of every material claim — "a claim missing one of these parameters is not merely incomplete
documentation. It is not yet a testable claim." §5.9 defines the **assurance horizon** as the period over
which claims "remain supportable, taking account of cryptographic assumptions, biometric threat
evolution, schema stability, governance validity, status freshness, retention, and operational controls."
§22.1 lists **ten distinct clocks** a profile MUST distinguish; §10.6 makes reliance expire at the
*earliest* of a mixed list; §19/§20 enumerate the accumulating observables — schema fields, status and
registry queries, presentation timing, retries, cross-proof composition — while ruling that "the
specification claims unlinkability, not undetectability."

What it does not yet offer is a *theory of why* some of those clocks behave differently from others.

## What the PVM offers

The PVM V6 moving-ceiling result (C82, proven-conditional, WP-07 Cor 5.4b lineage) is exactly that
theory. A ZK guarantee is **compute-saturated**: the per-show leakage ε_i is fixed at proof time and the
transcript never leaks more later. What moves is the denominator — the adversary's background
information B_t (linkage corpora, side priors, accumulated observables) grows on a calendar, so the
effective anonymity mass H(X | B_t) shrinks and the erosion ratio R_inf(t) = Σε_i / H(X | B_t) rises.
**The protection does not leak more; it matters less.** The drift is informational, not computational.
V6 names two clock families: the **certification clock** (an authority certifies a value and can
re-certify it) and the **erosion clock** (background accumulation nobody can renew — only re-base).

## The claim

1. **§5.9 is an erosion clock.** The assurance horizon is not another expiry an authority sets; it is
   the composite envelope of quantities that degrade as observables accumulate over the §19/§20
   surfaces. Verifier-side and observer-side B_t grows with every schema field revealed, every status
   query, every timing pattern, every cross-show composition — exactly the correlators §10.4 and §18.4
   already list.
2. **"For how long" should be stated as a rate, not a cliff.** A disclosure boundary (§5.4) needs an
   erosion analysis, not just an expiry date: how fast does the claim degrade as the named observables
   accumulate, and what accumulation level triggers re-base. The §10.6 earliest-of list stays — cliffs
   are still real for certification clocks — but the erosion-family entries get a rate statement.
3. **The ten clocks sort into the two families**, and the sort sharpens §22 conformance: certification
   clocks need renewal mechanisms; erosion clocks need monitoring plus re-base triggers (§22.3
   migration, re-enrolment). §22.2's ban on "permanent or unbounded" defaults is, in this reading, the
   requirement that no erosion clock be left unwatched.

## The ten clocks of §22.1, sorted

| §22.1 clock | Family | Who moves it | Renewal / re-base path |
|---|---|---|---|
| Proof-transcript lifetime | certification | profile | expires per transcript (§15) |
| Challenge/session lifetime | certification | verifier policy | new session |
| Attestation validity | certification | issuer | re-issuance |
| Status freshness | certification | status authority | refresh / snapshot (§12.4) |
| Nullifier epoch | certification | context authority (§6.7) | governed rollover (§5.8) |
| Enrolment-root cryptoperiod | certification | issuer/governance (§5.10) | rotation, migration (§22.3) |
| Policy & accreditation validity | certification | governance authority | re-accreditation |
| Log retention | **erosion** | retained observables accrue into B_t | deletion/segregation; §20 minimisation slows the rate |
| Proof-system security horizon | **erosion** (see honesty note) | cryptanalytic background accumulates | re-base by migration (§22.3) |
| Biometric assurance horizon | **erosion** | "biometric threat evolution" (§5.9) | re-base by re-enrolment under stronger policy |

The §5.9 assurance horizon is then the *minimum* over the erosion rows — the envelope clock. Honesty
note: the proof-system security horizon is erosion-family *operationally* (nobody renews it; only
migration re-bases it), but its driver is computational advance, whereas the PVM's R(t) drift is
strictly informational; the bridge is structural, not an identity.

## What exists

- The decision doc's complete time machinery (§2.4, §5.8–§5.10, §10.6, §22) — the TF side of the bridge.
- PVM V6: C82 proven-conditional with the erosion form and shelf life t* = sup{t : R(t) < 1}; C97
  (non-reconstruction as the ownability mechanism, "durable for the term the erosion clock permits").
- Appendix B's `for_how_long` block — the natural place a rate statement would slot beside the existing
  `assurance_horizon: 2 years` cliff value.

## Build plan

- **B1 — sort note.** The table above, expanded one paragraph per row, with the §19/§20 observable list
  cross-referenced as the B_t inputs per disclosure boundary. (This doc is B1's draft.)
- **B2 — erosion-aware residual-risk record.** A YAML extension of §26's residual-risk record: per
  disclosure boundary, the accumulating observables, an estimated erosion horizon, the monitoring
  signal, and the re-base trigger. Mirror Appendix B's shape.
- **B3 — worked example on PR-UNQ.** The nullifier's within-context pseudonym (§13.5) is the cleanest
  accumulating observable: state its erosion analysis alongside the existing epoch/cryptoperiod cliffs.

## Upstream surface

Careful — this is agentprivacy research reaching into TF work. The candidate surface is an **informative
research note** (an annex or appendix note beside §22 / §26), cited as external research (PVM V6 /
WP-07 Cor 5.4b lineage), offered through TF discussion — never normative text, and never a dependency of
any profile. The narrow language stays the decision doc's own; the note contributes the two-family sort
and the rate-not-cliff framing, nothing else.

## Open questions

- H(X | B_t) is mostly not measurable in deployment. What proxy observables (registry-query volume,
  presentation frequency, schema-variant rarity) are honest enough to drive a monitoring signal without
  overclaiming a quantity?
- Does log retention belong wholly to the erosion family, or is it a certification-set *parameter*
  (retention period) whose *effect* (correlation accumulation) is the erosion quantity? The record
  format may need both faces.
- Should the §26 residual-risk record require an erosion section, or offer it as an optional class? A
  MUST is premature before the TF has seen a worked example (B3).
- Where does re-base authority sit? Erosion clocks have no renewing authority by definition — but the
  migration/re-enrolment trigger still needs an accountable party in the §23 matrix.
