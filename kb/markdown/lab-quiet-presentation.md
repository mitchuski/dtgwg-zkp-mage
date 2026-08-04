---
title: "Lab — quiet-presentation"
section: "lab"
source: "../dtgwg-zkp-tf-mage/runtimes/quiet-presentation/NOTES.md"
built_from_commitish: "working-tree"
order: 70
---
# quiet-presentation — X4 observable-event minimisation as a runnable reference

*Lab model of X4's design layer (research root: [X4 — Observable Event Minimisation](x4-observable-event-minimisation.md)). Reference model of the decision rules over event traces — not real networking, not crypto.*

## What it demonstrates

**Unlinkability, not undetectability — made testable.** §20 rules the narrow claim: a presentation
event remains observable, and the request pattern itself discloses behaviour. This lane does not
weaken that ruling; it turns §20's SHOULD-level minimisation measures into checkable properties and
makes the honest part structural: `checkQuietTier` **never returns without a non-empty residue
list** (`presentation-occurrence`, `coarse-timing`, `status-fetch-cadence`,
`co-resident-app-signals-bounded-not-eliminated`). The tier is a **posture, not a promise** — a
declared, testable deployment class in the §6.4 spirit, and a passing result still says what the
verifier sees.

Two deployments over logical-tick event traces (`{type, t, shape, surface}`, no `Date.now()`
anywhere):

- **quiet** — status roots fetched on a fixed schedule *independent of presentations* (M-STATUS),
  shapes padded to a profile constant (M-SHAPE), ONE uniform external error string with detailed
  reason codes routed to the holder only (M-ERROR), retries bounded and on the timing grid
  (M-RETRY);
- **naive** — the anti-model: per-show status lookup, per-show proof shape, internal reason codes
  on the external surface, immediate off-grid retries. It fails the tier by name.

## Budget table summary (budget.mjs — M1)

One row per §19 observer (imported from show-composition's `OBSERVERS` — the list is not
restated), for MLP and EPP, each row in §2.4 three-parameter form
(`{againstWhom, forHowLong, alongsideWhat}`):

| Observer | Sees per presentation (quiet tier holding) | Horizon (MLP → EPP) |
|---|---|---|
| verifier | occurrence, coarse time on grid, bundle id, step-up frequency, uniform error surface, constant shape | session → epoch (nullifier dominates) |
| issuer | nothing per-show (local mirror) | root-cache validity window |
| issuer+verifier colluding | occurrence + issuer class; EPP adds within-context nullifier join | session → epoch-within-context |
| multiple verifiers colluding | timing intersection; EPP adds shared-context nullifier linkage (by design, §2.3) | session → epoch-within-context |
| registry operator | scheduled cadence only, not shows | root-cache window |
| accreditation authority | nothing per-show (mirrored snapshot) | snapshot window |
| mediated prover | where used: full stream under §21.2; switch never silent (§21.3) | session only (non-retention) |
| wallet/agent operator | full local view incl. holder-routed reason codes | holder retention policy |
| network observer | fixed-cadence contact pattern, padded sizes, grid timing | profile version lifetime |
| auditor/log processor | exactly the log-field register fields (§6.6) | per-field retention |
| co-resident app | occurrence via device signals — **declared residue, bounded not eliminated** | co-residency period |

`validateBudget` requires every §19 observer to have a row (`missing-observer-row:<name>`), all
three §2.4 parameters per row (`incomplete-claim-form:...`), and refuses an empty "sees" list
(`empty-sees-claims-undetectability:...`) — an empty row would claim undetectability.

## Tier properties (quiet.mjs — M2)

X4 names 7 required properties. Modelled here, at event-trace altitude:

1. **status pattern presentation-independent** — the mixed trace's status-fetch tick pattern must
   equal the same deployment's idle-window pattern (a comparison of two traces, not a property of
   one) → `status-correlated-with-presentation`;
2. **no per-show authority contact** — no *off-schedule* status-fetch within k ticks of a
   presentation; on-schedule ticks that land near a show are exempt (that is what independence
   means) → `per-show-authority-contact`;
3. **uniform external error surface** — one distinct external string, and never a string drawn from
   the internal v1 reason register; internal codes stay distinct and holder-routed →
   `error-surface-nonuniform`, `unknown-internal-reason:<code>`;
4. **shape constant per profile** → `shape-fingerprint`;
5. **retries within budget and on-grid** → `retry-off-grid`, `retry-over-budget`.

**Deferred — could not be modelled honestly at this altitude:** the *statistical* halves of tier
properties 1 and 3 (traffic-trace **distribution** indistinguishability across credential choices,
and error **timing** indistinguishability over the §26.1 negative corpus — those need real traces
and a distinguisher, not tick equality); tier property 6 (mediated path §21.2 controls — no
mediator is modelled here; it appears only as a budget row); packet-level network shape (the
`shape` field is a size-class stand-in). Named as gaps, not silently capped.

## Named failure codes emitted (the X1 seam)

`missing-observer-row:<observer>` · `unknown-observer:<name>` · `incomplete-claim-form:<observer>:<param>` ·
`empty-sees-claims-undetectability:<observer>` · `status-correlated-with-presentation` ·
`per-show-authority-contact` · `error-surface-nonuniform` · `shape-fingerprint` · `retry-off-grid` ·
`retry-over-budget` · `unknown-internal-reason:<code>` · `prohibited-log-field:<name>` ·
`unregistered-log-field:<name>`

These are **fixture-register candidates for a future v2** of the fixtures lane's reason register
(v1 is append-only; this lane does NOT edit `../fixtures/`). The consumption direction today is the
reverse: quiet.mjs *imports* `isKnownReason` to require holder-routed codes to be register vocabulary
and to forbid register vocabulary on the external surface — the fixture-visible internal vocabulary
vs. external surface separation X4's M-ERROR requires.

## Prohibited log fields (logregister.mjs — M3)

`exactPresentationTimestamp` (coarsen; §6.6/§20) · `holderDeviceId` · `stableHolderId` (§6.6) ·
`retryCountByPseudonym` (§10.4) · `proofSizeBytes` (§10.4/§19 — logging it un-pads the padding) ·
`internalReasonCode` (holder-routed only) · `mediatorSessionId` (§21.2 non-retention).

The compliant register carries 7 fields (`presentationEpoch`, `bundleId`, `profileVersion`,
`rootEpoch`, `outcome`, `retryWithinBudget`, `externalErrorSurface`) each with purpose, retention,
cardinality, correlation risk, and responsible authority — the §23 accountability route for excess
correlation is the party controlling the correlating surface.

## Pointers

- **Research root:** [X4 — Observable Event Minimisation](x4-observable-event-minimisation.md)
  (M1 budget → budget.mjs; M2 property tests → quiet.mjs; M3 register → logregister.mjs; M4 tier
  declaration text = upstream work, not lab code).
- **Upstream surface:** §25 gate item 7 — "composition and observable-event assumptions". The tier
  declaration plus these fixtures are the gate input; the budget rows are §19 disclosure-boundary
  record rows in §2.4 form, ready to be quoted.
- **Siblings:** `../show-composition/` (OBSERVERS, the presentations being wrapped),
  `../fixtures/reasons.mjs` (v1 internal vocabulary, READ-ONLY), `../canonical/` (shared encodings).

Run: `node test.mjs` → 8/8.
