---
title: "Lab — fixtures"
section: "lab"
source: "../dtgwg-zkp-tf-mage/runtimes/fixtures/NOTES.md"
built_from_commitish: "working-tree"
order: 68
---
# Conformance fixtures — X1 as a runnable reference

Implements the X1 exploration ([X1 — Conformance Fixtures](x1-conformance-fixtures.md))
at milestones **M1** (reason register, now **v2**), **M2** (fixture schema), **M3** (extraction +
consumer), and **M4** (the missing negative vectors — closed 2026-07-18: §26.1 coverage is 11/11,
using the show-composition and context-card instruments as levers). **M5** (second-language
consumer) remains open.

## What this demonstrates

§26 makes fixtures mandatory but defines no format. This lab freezes the property tests of
runtimes 01 and 07 **as data**: canonically encoded inputs (§6.2 descriptors, §15.2
transcripts — the context fed to `nullifier()` *is* a descriptor digest, never an opaque
label), an expected outcome, and a named reason from a versioned register. The consumer
(`consume.mjs`) re-derives every digest, re-runs the constructions, and demands the same
outcome **and the same reason code** — the X1 claim that two implementations passing the
same suite instantiate the same §25-gated decisions, independent of language or hash.
Extraction is byte-deterministic across processes (no clocks, no randomness), which is the
§25 "deterministic test-vector support" criterion made checkable.

Three vector classes: **accept**, **reject**, and **lint** — the third tests §9's
"verifier must not infer" column as claim-language linting of verifier outputs (§26.1
already mandates rejecting "a verifier output implying biometric correctness").

## Files

| file | role |
|---|---|
| `reasons.mjs` | M1 — rejection-reason register **v2 (66 exact codes + 29 parameterized families)**: the v1 stratum byte-identical (26) + the six instrument builds absorbed byte-exactly (F10) + `REASON_FAMILIES` + `CONVERGENCES` |
| `schema.mjs` | M2 — vector shape + validation (incl. mandatory §2.4 claimParams); reason validation accepts family matches via `isKnownReason` |
| `extract.mjs` | M3/M4 — runs rt 01/07 **+ show-composition + context-card + canonical**, asserts each verdict, emits `vectors/` + manifest |
| `lint.mjs` | prohibited-pattern list (§9 / §24) + `lintVerifierOutput` — now incl. collusion-claim + disclosure-claim classes |
| `consume.mjs` | consumer harness: re-runs every vector against the real constructions |
| `test.mjs` | F1–F11 suite properties; prints the §26.1 coverage report; F10 = the v2 absorption harness, F11 = convergences |
| `vectors/` | the emitted suite: **40 vectors across 9 families** (PR-UNQ, PR-TGF, PR-LIV, PR-PER, PR-HLD, PR-SHW, PR-CTX, PR-FLB, PR-EPO) + `manifest.json` (`reasonRegister: "v2"`) |

## Reason register v2 (2026-07-18 — append-only over v1)

v2 absorbs the named failure codes of the **six instrument builds** that landed after v1:
context-card (X2), quiet-presentation (X4), rotation (X5), erosion-record (X6), mediator (X7),
multi-issuer (X8), guardian-recovery (X9). Every string was read from the emitting module's
SOURCE and absorbed byte-exactly; test **F10** triggers every one of them LIVE from the
emitting module (drives the failing path, captures the emitted string, compares bytes) — **all
69 v2 additions are method `triggered`; 0 fell back to source-text scanning.**

**Counts:** v1 = 26 exact codes. v2 = 26 + **40 new exact codes** = **66 exact**, plus
**29 parameterized families** = **95 register entries**. All v1 entries byte-identical
(append-only; F9 re-verifies the v0+show-composition strata every run).

### The family mechanism

A code with a `:<param>` suffix (`retention-violation:transcriptDigest`,
`stale-epsilon:issuer-x`, `incomplete-claim-form:verifier:forHowLong`) names ONE failure
class with a parameter — it registers once, in `REASON_FAMILIES`, as
`{ prefix, parameterized: true, source, decisionDocRef, retryAmbiguous }`.
`isKnownReason(code)` matches exact codes exactly, and a family iff
`code = prefix + <non-empty param>` (prefixes always end in `:`). Schema validation flows
through `isKnownReason`, so a vector may carry a parameterized reason and remain a
conformance vector. F10 asserts the two strata are disjoint: no family prefix is a prefix
of any other registered code (note `unknown-clock:` vs `unknown-clock-family:` — the `:`
boundary keeps them distinct).

### Convergences (one entry, dual sources — never a duplicate)

- **`silent-fallback`** — already in v1 as the §26.1-bullet-8 mandated code; the
  mediator/downgrade.mjs `validateTransition` now EMITS the same byte string for a
  transition not visible to both parties. Verified (F11): the emitted bytes equal the v1
  register key; the v1 entry is untouched (append-only), and the second source is recorded
  in the `CONVERGENCES` export, not by editing the entry. **Result: converged, one entry.**
- **`unknown-enrolment`** — rotation `recover` + guardian-recovery
  `recoverWithGuardians`/`reissue` (guardians reuses rotation's code byte-exact by design).
  F11 triggers both emitters and byte-compares.
- **`unbounded-clock:`**, **`unknown-clock-family:`**, **`unknown-clock-toucher:`**
  (families) — emitted by both rotation `validateClocks` and guardian-recovery
  `validateGuardianClocks`. F11 checks the family match from both.

### §13.6 retry-ambiguity judgments taken at v2 (8 additions marked)

- `recovery-rate-exceeded` — a k-th recovery in one recovery epoch may be legitimate repeated
  catastrophic loss or a retry after a partially-failed ceremony, not credential farming.
- `guardian-epoch-lapsed` — a lapsed guardian epoch may be an overdue re-affirmation ceremony
  (usability lapse, must be surfaced per §6.8) vs an attacker replaying stale attestations.
- `mediator-not-governed` — absence from the verifier-held snapshot may be registry lag
  (freshly accredited / snapshot not propagated) vs a rogue mediator; fail closed, but §13.6
  forbids reading the refusal as proof of malice.
- `unknown-enrolment` — a retried recovery after a SUCCESSFUL one presents a now-revoked
  reference; retry/race vs fabricated-reference attack are indistinguishable observably.
- `duplicate-live-enrolment` — the duplicate-human-in-context class: a person who lost a
  device may re-enrol not knowing the old enrolment is live; recovery/race/Sybil converge.
- `duplicate-guardian-seat` — the duplicate-edge parallel: a duplicated attestation in a
  bundle may be assembly error or re-submission race, not seat forgery.
- `contested-recovery` — by design: the freeze exists BECAUSE honest holder and attacker are
  observably indistinguishable; adjudication decides, the rejection never does.
- `stale-epsilon:` (family) — the stale-registry-snapshot shape one layer up: a re-audit may
  be scheduled but not landed — an accreditation refresh race.

### Absorption table (code | source | method | retry-ambiguous)

All methods are **triggered** (F10 drives the emitting module's failing path and
byte-compares). Families are marked `(family)`.

| code | source | method | retry-amb. |
|---|---|---|---|
| `digest-mismatch` | context-card `checkLegibility` | triggered | no |
| `unrendered-field:` (family) | context-card `checkLegibility` | triggered | no |
| `missing-narrow-language:` (family) | context-card `checkLegibility` | triggered | no |
| `broad-personhood-language:` (family) | context-card `checkLegibility` | triggered | no |
| `status-correlated-with-presentation` | quiet-presentation `checkQuietTier` | triggered | no |
| `per-show-authority-contact` | quiet-presentation `checkQuietTier` | triggered | no |
| `error-surface-nonuniform` | quiet-presentation `checkQuietTier` | triggered | no |
| `shape-fingerprint` | quiet-presentation `checkQuietTier` | triggered | no |
| `retry-off-grid` | quiet-presentation `checkQuietTier` | triggered | no |
| `retry-over-budget` | quiet-presentation `checkQuietTier` | triggered | no |
| `unknown-internal-reason:` (family) | quiet-presentation `checkQuietTier` | triggered | no |
| `prohibited-log-field:` (family) | quiet-presentation `validateLogSchema` | triggered | no |
| `unregistered-log-field:` (family) | quiet-presentation `validateLogSchema` | triggered | no |
| `missing-observer-row:` (family) | quiet-presentation `validateBudget` | triggered | no |
| `unknown-observer:` (family) | quiet-presentation `validateBudget` | triggered | no |
| `incomplete-claim-form:` (family, param `<observer>:<parameter>`) | quiet-presentation `validateBudget` | triggered | no |
| `empty-sees-claims-undetectability:` (family) | quiet-presentation `validateBudget` | triggered | no |
| `recovery-rate-exceeded` | rotation `recover` | triggered | **yes** |
| `duplicate-live-enrolment` | rotation `issuerEnrol` | triggered | **yes** |
| `epoch-descent-mismatch` | rotation `checkDescent` | triggered | no |
| `unknown-enrolment` | rotation `recover` **+** guardian-recovery (convergence) | triggered ×2 | **yes** |
| `unbounded-clock:` (family) | rotation **+** guardian-recovery clock validators (convergence) | triggered ×2 | no |
| `unknown-clock-family:` (family) | rotation **+** guardian-recovery clock validators | triggered | no |
| `unknown-clock-toucher:` (family) | rotation **+** guardian-recovery clock validators | triggered | no |
| `missing-clock:` (family) | erosion-record `validateSort` | triggered | no |
| `unsorted-clock:` (family) | erosion-record `validateSort` | triggered | no |
| `unknown-clock:` (family) | erosion-record `validateSort` | triggered | no |
| `erosion-clock-unwatched` | erosion-record `validateRecord` | triggered | no |
| `overclaimed-measurement` | erosion-record `validateRecord` | triggered | no |
| `cliff-only-erosion-claim` | erosion-record `validateRecord` | triggered | no |
| `claim-missing-parameter:` (family) | erosion-record `validateRecord` | triggered | no |
| `invalid-horizon-basis:` (family) | erosion-record `validateRecord` | triggered | no |
| `missing-field:` (family) | erosion-record `validateRecord` | triggered | no |
| `missing-clock-family:` (family) | erosion-record `validateRecord` | triggered | no |
| `erosion-missing-observables:` (family) | erosion-record `validateRecord` | triggered | no |
| `erosion-missing-monitoring-signal:` (family) | erosion-record `validateRecord` | triggered | no |
| `erosion-missing-horizon:` (family) | erosion-record `validateRecord` | triggered | no |
| `invalid-erosion-entry:` (family) | erosion-record `validateRecord` | triggered | no |
| `invalid-record:` (family) | erosion-record `validateRecord`/`serializeRecord` | triggered | no |
| `honeypot-prohibited` | mediator `makeProvingJob`/`executeJob` | triggered | no |
| `missing-holder-secret` | mediator `makeProvingJob` | triggered | no |
| `descriptor-transcript-mismatch` | mediator `makeProvingJob` | triggered | no |
| `missing-epoch` | mediator `executeJob` | triggered | no |
| `unknown-mediator-level:` (family) | mediator `makeProvingJob` | triggered | no |
| `retention-violation:` (family) | mediator `checkForget` | triggered | no |
| `job-transcript-mismatch` | mediator `verifyProofRecord` | triggered | no |
| `proof-invalid` | mediator `verifyProofRecord` | triggered | no |
| `silent-fallback` | §26.1 b8 (v1) **+** downgrade `validateTransition` (convergence) | triggered | no |
| `unnamed-target` | downgrade `makeTransition`/`validateTransition` | triggered | no |
| `mediator-not-governed` | downgrade `attemptProof` | triggered | **yes** |
| `unnamed-lower-profile` | downgrade `attemptProof` | triggered | no |
| `unnamed-channel` | downgrade `attemptProof` | triggered | no |
| `unknown-exit:` (family) | downgrade `attemptProof` | triggered | no |
| `duplicate-issuer-in-show` | multi-issuer `verifyAggregated` | triggered | no |
| `mixed-registry-roots` | multi-issuer `verifyAggregated` | triggered | no |
| `k-outside-tier` | multi-issuer `makeAggregatedShow`/`verifyAggregated` | triggered | no |
| `k-member-mismatch` | multi-issuer `makeAggregatedShow`/`verifyAggregated` | triggered | no |
| `nullifier-mismatch` | multi-issuer `verifyAggregated` | triggered | no |
| `issuer-not-in-registry` | multi-issuer `verifyAggregated` | triggered | no |
| `invalid-membership-proof` | multi-issuer `verifyAggregated` | triggered | no |
| `subject-commitment-mismatch` | multi-issuer `verifyAggregated` | triggered | no |
| `predicate-mismatch` | multi-issuer `verifyAggregated` | triggered | no |
| `stale-epsilon:` (family) | multi-issuer `verifyAggregated`/`aggregateBound` | triggered | **yes** |
| `guardian-threshold-not-met` | guardian-recovery `recoverWithGuardians` | triggered | no |
| `guardian-epoch-lapsed` | guardian-recovery `recoverWithGuardians` | triggered | **yes** |
| `duplicate-guardian-seat` | guardian-recovery `recoverWithGuardians` | triggered | **yes** |
| `guardian-not-in-committed-set` | guardian-recovery `recoverWithGuardians` | triggered | no |
| `guardian-not-personhood-anchored` | guardian-recovery `commitGuardianSet` | triggered | no |
| `contested-recovery` | guardian-recovery `recoverWithGuardians`/`reissue` | triggered | **yes** |
| `attestation-not-outcome-evidence` | guardian-recovery `completionEvidence` | triggered | no |

### What v2 deliberately did NOT absorb (and why)

- `invalid-descriptor:` / `invalid-transcript:` (canonical) and context-card's render-time
  re-throw of it — construction-time malformation guards on the caller's own input, the same
  class as `schema.mjs`'s own error strings; not conformance rejections of a presented artifact.
- multi-issuer `registry.mjs` construction throws (`invalid-registry-member:…`,
  `invalid-epsilon:…`, `invalid-dependency-classes:…`, `duplicate-registry-member:…`,
  `invalid-registry:…`, and `effectiveK`'s parameterized `issuer-not-in-registry:<id>` throw) —
  guards on building the verifier's OWN registry; the conformance surface is
  `verifyAggregated`, whose exact `issuer-not-in-registry` rejection IS registered. The
  parameterized internal throw is unreachable through the verify path (membership is checked
  before `aggregateBound` runs).
- guardian-recovery `invalid-threshold` and `not-an-authorization-input` — the source itself
  says "model guard, not a register code"; honoured.
- quiet-presentation `budgetFor`'s `unknown-profile:` throw — a lookup guard, not a rejection.
- OK-reasons (`verified`, `issuer-reissuance-is-the-outcome-artifact`) — the register is a
  REJECTION vocabulary; accept-side strings stay out (same rule as accept vectors carrying
  no reason code).

### The seam statement

With v2, **all six instrument builds and both foundation runtimes share one rejection
vocabulary**: every named failure any instrument emits is a register entry with a source, a
decision-doc anchor, and a §13.6 retry-ambiguity marker — the X1 interop claim ("two
implementations can compare *why* they rejected") now extends to the instrument layer.
quiet-presentation already consumes `isKnownReason` in the other direction (holder-routed
codes MUST be register vocabulary; an external surface drawn FROM the register is a leak),
so the seam is load-bearing both ways: the fixtures lane owns the vocabulary, the
instruments emit it, and F10/F11 keep the two sides byte-identical on every run.

## Reason register v1 stratum (26 codes — append-only over v0, unchanged at v2)

The seven **show-composition** strings, absorbed verbatim (F9 triggers each from the emitting
module and compares byte-exactly):

| code | source | retry-ambiguous (§13.6) |
|---|---|---|
| `partial-show-rejected` | verifyShow atomicity (member missing) | no |
| `member-transcript-mismatch` | verifyShow (member bound to a different transcript) | no |
| `bundle-outside-registry` | lookupBundle / matchBundle (à-la-carte, unknown id/version, surplus) | no |
| `stale-transcript` | verifyShow expiry vs explicit now | **yes** — clock skew vs replay |
| `transcript-invalid` | verifyShow (malformed / tampered digest) | no |
| `taskcontext-not-outcome-evidence` | completionEvidence (the credential/artifact wall) | no |
| `bundle-profile-mismatch` | makeShow (bundle vs descriptor profile disagree) | no |

The v0 codes, unchanged:

| code | source | ref | retry-ambiguous (§13.6) |
|---|---|---|---|
| `duplicate-human-in-context` | runtime-01 P4 | §13, §13.6, §26 | **yes** — retry, race, recovery, epoch disagreement, or attack |
| `endpoint-not-personhood-anchored` | runtime-07 G2 | §11, §13; PHC rule | no |
| `self-edge-forbidden` | runtime-07 G3 | §13; SPELLWEB 6B | no |
| `unilateral-no-mutual-consent` | runtime-07 G1 | cred-spec bilateral VRC | no |
| `r-did-mismatch` | runtime-07 G4 | cred-spec R-DID uniqueness | no |
| `vrc-commitment-forged` | runtime-07 G7 | §2.6, §25 | no |
| `duplicate-edge` | runtime-07 G6 | §13.6 by analogy | **yes** |
| `expired-or-revoked-attestation` | §26.1 b1 | §10.1, §10.6 | no |
| `overclaim-verifier-output` | §26.1 b2 | §9, §24 (lint class) | no |
| `replay-cross-transcript` | §26.1 b3 | §15, §15.2 | no |
| `nullifier-domain-reuse` | §26.1 b4 | §13, §2.3 | no |
| `undocumented-collusion-claim` | §26.1 b5 | §24, §2.4 | no |
| `unjustified-stable-correlator` | §26.1 b6 | §24 | no |
| `context-expansion-without-version` | §26.1 b7 | §24, §6.2 | no |
| `silent-fallback` | §26.1 b8 | §21, §27.4 | no |
| `key-control-as-authority` | §26.1 b9 | §14.2, §27.5 | no |
| `stale-registry-snapshot` | §26.1 b10 (registry facet) | §12.4 | **yes** — refresh race |
| `epoch-snapshot-inconsistent` | §26.1 b10 (epoch facet) | §12.4, §13.6 | **yes** |
| `disclosure-ignores-observables` | §26.1 b11 | §2.6, §2.4 | no |

## §26.1 coverage (v1 state: **11 covered, 0 partial, 0 gaps of 11**)

| bullet | status | via |
|---|---|---|
| 1 expired/revoked attestation | covered | PR-LIV reject ×3 (revoked / expired / unaccepted issuer) — *semantic* attestation object; the full lifecycle model is rt 02's future work |
| 2 output implying biometric correctness | covered | 3 lint vectors (PR-LIV/PR-PER/PR-UNQ) |
| 3 replay cross-transcript | covered | PR-SHW rejects ×4 via show-composition (transplant `member-transcript-mismatch`, `partial-show-rejected`, `bundle-outside-registry`, `stale-transcript`) |
| 4 nullifier-domain reuse | covered | PR-UNQ reject (nullifier computed under descriptor A, transcript binds B — consumer recomputes) + the v0 cross-context accept pair |
| 5 undocumented collusion claim | covered | PR-UNQ lint (collusion claim with no adversary model/test vs a §2.4-complete counterpart) |
| 6 unjustified stable correlator | covered | PR-UNQ reject (extra `stableHolderTag` field → canonical `validateDescriptor` rejects unknown fields) |
| 7 context expansion without version | covered | PR-CTX reject via context-card `diffCards` (expansion with no migration record) + compliant accept counterpart |
| 8 silent fallback | covered | PR-FLB reject (mediated proving occurred, no `provingMode` in transcript) + declared-mode accept |
| 9 key-control as authority | covered | PR-HLD lint vector (claim-language form) |
| 10 epoch/registry snapshot inconsistency | covered | PR-EPO rejects ×2 (`epoch-snapshot-inconsistent` epoch facet, `stale-registry-snapshot` root-age vs explicit now) |
| 11 disclosure ignores observables | covered | PR-SHW lint ×2 ("verifier learns nothing" fails; honest occurrence-and-timing statement passes) |

The coverage report is printed by `node test.mjs` (F8) on every run — the no-silent-caps rule holds:
if a future edit reopens a gap, it prints. Honest caveat: bullets 1 and 8 use *semantic* vectors —
minimal attestation / fallback objects modelling the decision rules, whose full constructions are
future runtimes (rt 02, the §21 mediated-proving profile).

## Decisions this build took that the design doc left open

- **`PR-TGF`** is an exploration-local family id for runtime 07's trust-graph relations
  (the §9 register has no trust-graph predicate). Non-normative; flagged for the TF.
- **Bullet 10 carries two codes** (`stale-registry-snapshot` / `epoch-snapshot-inconsistent`)
  because staleness and contradiction fail differently.
- **Accept vectors carry no reason code** — the register is a *rejection* vocabulary; the
  path name (`first-enrolment`) is descriptive only.
- **Witness opacity** (X1 open question 1): these vectors sit at the *semantic* layer —
  inputs are re-derivable model inputs (humanIds, descriptors), no construction witness yet.
- **Lint covers bullet 9 as claim language**, not just bullet 2 — "key control confirms the
  agent is authorised" is the §26.1 b9 failure expressed as verifier prose.
- **v1 additions (2026-07-18):** the seam to show-composition closed by absorbing its seven
  reason strings verbatim (append-only, F9-verified); bullets 1/8 modelled as semantic vectors
  (minimal attestation + fallback objects) rather than waiting for rt 02/§21 constructions;
  bullet 7 consumes context-card's `diffCards` — the first cross-instrument vector, which is
  the composition story working as designed (instruments feed the fixture suite).

## Upstream candidates (the §26.2 fixture-format proposal)

1. **§26.2 fixture format**: the M2 schema (fixture id grammar, mandatory §2.4 claimParams,
   accept/reject/lint classes, manifest) as the missing normative half of §26's
   "MUST provide … test vectors" — offered with `reasons.mjs` v0 for ratification
   alongside the §28 list.
2. **Reason-register governance**: reasons are append-only under a version tag, and each
   entry carries an explicit §13.6 `retryAmbiguous` marker so error semantics stay
   deterministic *and* redress-aware across implementations.
3. **Lint vectors as a conformance class**: the §9/§24 prohibited-pattern list as a shared
   artefact with Human Experience (§27.4) — the negative meanings tested where they
   actually leak: in verifier output text.
