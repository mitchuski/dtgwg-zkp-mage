---
title: "Lab — erosion-record"
section: "lab"
source: "../dtgwg-zkp-tf-mage/runtimes/erosion-record/NOTES.md"
built_from_commitish: "working-tree"
order: 67
---
# erosion-record — X6 assurance horizons and erosion clocks (the PVM reading)

The lightest of the X-builds: a **record format + validator + one worked
example**, not a simulation. Honesty is the whole point — H(X | B_t) is not
measurable in deployment, so the deliverable is *structure*: a record shape in
which overclaiming a measurement is a validation failure, not a review comment.

Zero-dep Node ESM, offline, deterministic. Run: `node test.mjs` (8/8),
`node example.mjs` (prints the PR-UNQ record canonically serialized).

## What it demonstrates

1. **Two clock families as validatable structure.** The §22.1 ten-clock list
   sorts into the PVM V6 two-clock thesis: *certification* clocks (an
   authority certifies a value and can re-certify it) and *erosion* clocks
   (background accumulation nobody can renew — only re-base). The sort is
   data (`clocks.mjs`), and its validator enforces exactly the ten clocks,
   each with a family.
2. **Rate-not-cliff, enforced.** "For how long" (§2.4) keeps its §10.6 cliffs
   for the certification family, but every erosion entry must name its
   accumulating observables (the §19/§20 surfaces feeding B_t), a monitoring
   signal, and a re-base trigger. A bare expiry date wearing an erosion label
   fails (`cliff-only-erosion-claim`); an erosion clock with no re-base
   trigger is the §22.2 "permanent or unbounded" default the decision doc
   prohibits (`erosion-clock-unwatched`).
3. **Overclaim structurally impossible.** An estimated horizon's basis may be
   `declared` or `estimated` — never `measured`. The X6 honesty rule is a
   schema constraint (`overclaimed-measurement`).

## The ten clocks of §22.1, sorted (from X6, B1)

| §22.1 clock | Family | Who moves it | Renewal / re-base path |
|---|---|---|---|
| proof-transcript-lifetime | certification | profile | expires per transcript (§15) |
| challenge-session-lifetime | certification | verifier policy | new session |
| attestation-validity | certification | issuer | re-issuance |
| status-freshness | certification | status authority | refresh / snapshot (§12.4) |
| nullifier-epoch | certification | context authority (§6.7) | governed rollover (§5.8) |
| enrolment-root-cryptoperiod | certification | issuer/governance (§5.10) | rotation, migration (§22.3) |
| policy-accreditation-validity | certification | governance authority | re-accreditation |
| log-retention | **erosion** | retained observables accrue into B_t | deletion/segregation; §20 minimisation slows the rate |
| proof-system-security-horizon | **erosion** (honesty note) | cryptanalytic background accumulates | re-base by migration (§22.3) |
| biometric-assurance-horizon | **erosion** | biometric threat evolution (§5.9) | re-base by re-enrolment under stronger policy |

The §5.9 assurance horizon is the minimum over the erosion rows — the
envelope clock. **Honesty note** (carried as `bridgeCaveat: true` +
`driver: 'computational'` on the proof-system row, surfaced by
`getCaveats()`): the proof-system security horizon is erosion-family
*operationally* (nobody renews it; only migration re-bases it), but its
driver is computational advance, whereas the PVM's R(t) drift is strictly
informational — the bridge is structural, not an identity.

## The worked example (B3): PR-UNQ

`example.mjs` extends Appendix B's compact boundary-record for PR-UNQ:

- **Certification cliffs** — Appendix B's own: epoch 30 days, enrolment-root
  cryptoperiod 2 years, nullifier retention 35 days.
- **Erosion entry** (clock: log-retention) — accumulating observables: the
  **within-context pseudonym** (§13.5 — every accepted show adds one stable
  pseudonymous point to verifier-side B_t), the registry-query pattern, and
  schema-variant rarity (§19). Monitoring signal: `nullifier-set-size ×
  presentation-frequency proxy`. Estimated horizon: 2 years, basis
  **declared** (restating Appendix B's `assurance_horizon`, not measuring
  H(X | B_t)). Re-base trigger: epoch rollover / re-enrolment under §22.3
  migration.
- Accountable parties gain `erosion_monitoring` and `rebase_execution` —
  the X6 open question "where does re-base authority sit" answered the §23
  way: the trigger has a named party even though the clock has no renewer.

## PVM anchor

C82 (WP-07 Def 3.9 + Cor 5.4b lineage): erosion form
R_inf(t) = Σε_i / H(X | B_t) — the proof does not leak more; it matters less.
**Upstream posture: informative-only** — the candidate surface is an
informative research note beside §22/§26, cited as external research, offered
through TF discussion. Never normative text, never a dependency of any
profile. The narrow language stays the decision doc's own; this build
contributes only the two-family sort and the rate-not-cliff record shape.

## Named failure codes (fixture-register candidates)

| Code | Meaning |
|---|---|
| `missing-clock:<name>` | a §22.1 clock is absent from the sort |
| `unsorted-clock:<name>` | a clock present without a valid family |
| `unknown-clock:<name>` | a clock outside the closed §22.1 list |
| `erosion-clock-unwatched` | erosion entry with no re-base trigger (§22.2 unbounded failure) |
| `overclaimed-measurement` | horizon basis claims `measured` — H(X|B_t) is not measurable |
| `cliff-only-erosion-claim` | erosion entry is a bare expiry with no observables |
| `claim-missing-parameter:<which>` | §2.4 parameter absent (against_whom / for_how_long / alongside_what) |
| `missing-clock-family:<family>` | for_how_long lacks the certification or erosion side |
| `erosion-missing-observables` / `-monitoring-signal` / `-horizon` | erosion entry incomplete |
| `invalid-horizon-basis` | basis outside {declared, estimated} (and not the measured overclaim) |
| `missing-field:<name>` | Appendix B top-level field absent |

## Files

- `clocks.mjs` — B1: the ten-clock sort as data + `validateSort` + `getCaveats`
- `record.mjs` — B2: erosion-aware residual-risk record, `validateRecord` +
  `serializeRecord` (canonical, via `../canonical/canonical.mjs`)
- `example.mjs` — B3: `PR_UNQ_EROSION_RECORD`
- `test.mjs` — E1–E8

Design doc: [X6 — Assurance Horizons and Erosion Clocks](x6-assurance-horizons-erosion-clocks.md)
(research root). Decision doc anchors: §2.4, §5.9/§5.10, §13.5, §19/§20,
§22.1–§22.3, §26, Appendix B.
