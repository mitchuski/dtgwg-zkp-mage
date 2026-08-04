# X4 — Observable-event minimisation

*The specification claims unlinkability, not undetectability (§20): a presentation event remains
observable, and the request pattern itself discloses behaviour. This doc develops §20's SHOULD-level
minimisation measures into a concrete design layer with a testable conformance tier.*

**Register:** new (X-series; feeds §25 gate item 7 — "composition and observable-event assumptions")
· leverage 🟠 · **Ladder:** reference built 2026-07-18 — `~/dtgwg-zkp-tf-mage/runtimes/quiet-presentation/`
8/8: §19 budget as data, 5 of 7 tier properties at trace altitude (the two statistical
distribution-halves + §21.2 mediation honestly deferred), log-field register, structural residue
(undetectability unclaimable). See its NOTES.md
**Anchor (decision doc):** §20 observable events · §19 observer list · §10.4 incidental disclosure ·
§12.4 registry lookup patterns · §21 mediated proving · §6.6 shared logs/telemetry.

---

## What the decision doc rules and leaves open

§20 rules the narrow claim — the specification claims unlinkability, not undetectability — and lists what
the request pattern alone discloses: which verifier requested a proof, when and how often step-up occurs,
whether an action triggered risk controls, retry counts, local-proving failure, mediated or lower-assurance
path use. §10.4 adds the transcript-adjacent fingerprints: proof size or proving-time differences, retry
count and failure mode, presentation timing and frequency, mediated-prover network traffic. §12.4 rules
that network lookup patterns revealing the issuer or holder MUST be included in the disclosure analysis.
But the minimisation measures themselves — batching, coarse timing, local caching, private status checks,
uniform error behaviour, strict telemetry controls — are SHOULDs with no mechanism. This exploration
supplies the mechanism layer, without weakening the ruling: nothing here promises undetectability (§3.2
excludes "eliminate all observability of a presentation event" from scope).

## The observer-by-observer leakage budget

Per §19, assume a **perfect ZK transcript** (witness reveals nothing) and budget what each observer still
sees per presentation. Each row is the residue the mechanisms below must shrink; each becomes a
disclosure-boundary record row (§19), and every minimisation claim states against whom / for how long /
alongside what (§2.4).

| Observer (§19) | Sees per presentation, even with perfect ZK |
|---|---|
| Verifier | occurrence, exact time, requested predicates, step-up frequency, retries, error mode, proof size/latency, fallback vs local proving (§15.4, §10.4) |
| Issuer | nothing per-show *unless* status/refresh traffic reaches it — then presentation-rate side-channel (§12.4) |
| Registry operator | lookup timing + which root/status object queried → issuer class, presentation frequency (§12.4) |
| Mediated prover | full event stream: occurrence, timing, verifier, retries; can link contexts unless §21.2 controls hold |
| Network observer | endpoints, packet sizes/timing → verifier identity, proving-time fingerprint, retry bursts (§10.4) |
| Auditor / log processor | whatever fields the log register admits — the §6.6 surface |
| Co-resident app | presentation occurrence via device signals (network activity, prover CPU burst, UI step-up events) |

## Mechanisms

**M-STATUS — private status checks.** Rank O4's three revocation patterns by lookup-leakage: (1) *short
epochs, positive membership* — holder fetches the epoch root on a schedule **independent of presentations**
(mirrored/broadcast roots, local cache), so the registry operator sees only cadence, not shows: best;
(2) *accumulator non-membership* — same property if witnesses refresh on-schedule, worst if refreshed
per-show; (3) *out-of-circuit status checks* — worst; admissible only batched over cover sets with coarse
timing (§20). Rule: **no per-show contact with any authority.** Registry roots are mirrored or pushed;
lookups that must occur are batched and decorrelated from presentation times. Claim form: status traffic
is uninformative about which credential was shown — against the registry operator and issuer, for the
root-cache validity window (≤ the relying policy's maximum root age, §12.4/§22.1), alongside a lookup
schedule independent of presentation events.

**M-ERROR — uniform error behaviour.** Externally, one rejection surface: a single failure message with
profile-constant shape and timing, whatever the cause (stale root, revoked attestation, predicate failure,
transcript mismatch). Detailed reason codes route **only to the holder**, who decides what to escalate —
preserving the §13.6/§23 challenge routes without making the error channel a fingerprint (§19: "error codes
and diagnostics"). *Tension to resolve at the §25 gate:* §26 conformance fixtures need a reason-code
vocabulary to test negative cases (X1's register); the design must separate the fixture-visible internal
vocabulary from the externally observable surface — the fixtures test that the external surface stays
uniform.

**M-SHAPE — proof-shape uniformity.** Proof size, encoding, and proving time are fingerprints (§10.4,
§19). Rule: pad proofs to a profile-constant size and quantise proving/response time to a profile-declared
grid, so "which predicate bundle, which issuer variant, which device class" is not readable from shape.
Claim: proof shape is constant per profile version — against verifier and network observer, for the profile
version's lifetime, alongside a padded transport channel.

**M-RETRY — retry discipline.** Retry count and failure mode are §10.4 correlators and §20 behaviour
signals. Rule: bounded retry budget, uniform inter-retry delay from the same timing grid, and no observable
distinction between first-attempt success and within-budget retry success at the verifier surface.
Downgrade to mediated or lower-assurance paths stays governed by §21.3 — never silent — but the *external*
observability of the switch is minimised to the parties the relying policy requires (per §6.6, no common
fallback identifiers).

**M-BATCH — batching and coarse timing.** Where flows tolerate latency, presentations and status refreshes
are batched into epochs with coarse timestamps (§20; §6.6 already prohibits exact issuance timestamps when
a coarser proof is sufficient — extend the same instinct to event timing). This is the pools discipline
imported (O6): association-set reasoning, batched inclusion, deposit/withdraw timing decorrelation — the
classical traffic-analysis defences, applied to presentation and lookup traffic instead of withdrawals.

## The "quiet presentation" profile

A named conformance tier — **quiet presentation** — for deployments claiming observable-event
minimisation. Not a new privacy promise (unlinkability, not undetectability, still) but a declared,
testable posture, in the same spirit as §6.4's separately identified deployment classes. Required,
testable properties:

1. status-check traffic independent of which credential is shown, and of whether a presentation occurred
   in the window (test: traffic trace distributions indistinguishable across credential choices);
2. no per-presentation network contact with issuer or registry (root age served from local mirror);
3. external error surface uniform across all failure causes (test: shape + timing indistinguishability
   over the §26.1 negative-test corpus);
4. proof size and response time constant per profile version;
5. retry behaviour within declared budget and grid;
6. mediated path, where supported, satisfies §21.2 and adds no cross-context identifier (§6.6);
7. a completed log-field register (below) with no prohibited field present.

Each property ships as a conformance fixture; the tier declaration states its residue honestly — the
verifier still observes occurrence and coarse timing; the co-resident-app row is bounded, not eliminated.

## Telemetry governance — the log-field register

§6.6 rules that shared logs, telemetry, or analytics can restore the correlation the proof prevents. The
control is a **log-field register** analogous to the §18.1 schema field register: for every logged field —
at verifier, mediator, registry, wallet, auditor — record semantic purpose, retention, rarity/cardinality,
correlation risk, responsible authority, and conformance evidence. Prohibited by default: exact
presentation timestamps (coarsen), stable holder/device identifiers, retry counts keyed to a pseudonym,
proof sizes, reason codes beyond the uniform external surface, mediator session identifiers that outlive
the session (§21.2 non-retention). The register is the §26 conformance artefact for §6.6's last row, and
the accountability route for a violation is §23's "excess disclosure or correlation" row — the party
controlling the correlating surface.

## Build plan

- **M1 — budget tables:** the §19 observer budget completed for MLP and EPP presentations, as
  disclosure-boundary record rows (§2.4 form throughout).
- **M2 — quiet-presentation property tests:** traffic-trace and error-surface indistinguishability
  fixtures, drafted as §26 conformance fixtures; reuses O4's rt 03 status patterns and O5's transcript
  harness for the error-surface corpus.
- **M3 — log-field register template** + prohibited-field list, offered alongside the §18.1 register.
- **M4 — §25 gate input:** the tier declaration text and its fixtures, feeding gate item 7.

## Open questions

- Padding/quantisation cost on consumer devices vs §25's performance envelope — where does M-SHAPE's grid
  collide with proving-time budgets?
- Can the co-resident-app row (§19) be budgeted at all without OS-level attestation, or is it declared
  residue in every tier?
- Does the quiet tier need its own epoch clock (§22.1) for status-refresh cadence, or does it inherit the
  registry's root epoch?
