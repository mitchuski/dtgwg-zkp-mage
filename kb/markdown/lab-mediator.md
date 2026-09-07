---
title: "Lab — mediator"
section: "lab"
source: "../dtgwg-zkp-tf-mage/runtimes/mediator/NOTES.md"
built_from_commitish: "working-tree"
order: 70
---
# Mediated-proving reference model (X7 · M2 + M3)

Runnable reference for the mediated-proving profile — §21 of the
predicate-assurance boundary decision, designed in
[X7 — Mediated Proving Profile](x7-mediated-proving-profile.md).
This runtime turns the §21.2 checklist into mechanism: the controls are
constructors, property checks, and named failures — not prose.

Run: `node test.mjs` → 9/9.

## What it demonstrates

**The taxonomy, enforced at the constructor** (`mediator.mjs`):

- **T0 (blind mediator)** — a job carries ONLY the public statement (a subset
  of §15.2 transcript fields — deliberately excluding `challenge` and
  `sessionId`, which the transcript digest binds but which would be session
  correlators at the mediator), H-blinded inputs derived holder-side from the
  holder secret, and the transcript digest.
- **T1 (semi-trusted)** — additionally carries commitments. The reference
  makes the cost visible: the enrolment commitment is *stable*, i.e. a
  cross-context correlator, which is exactly why T1 is only admissible with
  the full operational §21.2 controls.
- **T2 (honeypot)** — cannot be constructed. `level: 'T2'`, or any job payload
  smuggling `witnesses`/`biometrics`/`credentials`, throws
  `honeypot-prohibited` (§21.2 closing sentence; §24 "permit mediated proving
  without non-retention and correlation controls"). The mediator also rescans
  at execution — prohibited on both sides of the wire.

**The honest split** (X7 "Does mediation change what the verifier may rely
on?"): witness preparation stays holder-side — `deriveBlindedInputs` needs
the secret; the mediator computes a pure function of the prepared job. The
secret never appears in the serialized job (M1 does a structural scan).

**P-ISOLATE** (§21.2 session/tenant isolation): execution is a pure function
of the job; state is keyed per-session and dropped at completion; no
cross-job caches. Test M3: holder B's proof record is byte-identical whether
or not holder A's job ran first.

**P-FORGET** (§21.2 non-retention): post-job state equals pre-job state
modulo the declared audit fields. Test M4, with a deliberately-wrong variant
(`makeMediator({ retain: ['transcriptDigest'] })`) failing by name.

**Per-context mediator pseudonym** (§6.6 "common fallback or mediated-prover
identifiers" prohibited): `mediatorFacingId(secret, contextDescriptorDigest)
= nullifier(secret, 'mediator/' + digest)` — runtime 01's nullifier
discipline with the mediator seated as counterparty *per context*. Fresh per
context, stable within one (the §6.5 intentional in-context linkage), no
derivable relation across contexts (M5).

**Transcript binding** (§15 / §21.2): a proof record verifies only against
its own transcript digest — a mediator cannot re-target a proof to another
verifier or session (M9).

**The four-exit downgrade machine** (`downgrade.mjs`, §21.3): exactly four
exits from `LOCAL-PROVING-FAILED` — FAIL, NAMED-LOWER-PROFILE,
GOVERNED-MEDIATOR, CHANNEL-SWITCH — per an explicit relying policy object.
Every transition emits a visibility record
`{transition, target, visibleTo: ['person','verifier']}`; the machine
validates its own emissions, so it physically cannot produce a silent
step-down. The silent record exists only via `__unsafeSilentTransition`
(test fixture for the §26.1 negative test / §23 redress row) and is rejected
as `silent-fallback` (M7). "Governed mediator" means registry-listed under
snapshot semantics: missing, malformed, or future snapshots and de-listed
mediators all fail closed as `mediator-not-governed` — and the failure is
itself a *visible* FAIL transition (M8).

## The declared audit record

`AUDIT_FIELDS = ['jobCount', 'epochBucket']` — frozen. A job counter and a
coarse (one-day) epoch bucket. **No** session ids, **no** timestamps, **no**
transcript digests: those are the correlators §6.6 and X4's log-field
register exclude. Epochs are explicit inputs (`executeJob(job, { epoch })`)
— no `Date.now` anywhere in this runtime.

## Honest residue (§19 mediator observer row)

Even a conformant T0 mediator still learns, per job: that a proving job
occurred; its (coarse) timing; the requesting context via the statement and
descriptor digest (unless verifier-blinded — X7 open question); the public
transcript fields it computes over. That residue is irreducible in this
model and must appear in the profile's disclosure-boundary record; X4's
M-BATCH/M-SHAPE apply to the holder↔mediator channel for the network side.

## Named failure codes (fixture-register candidates)

- `honeypot-prohibited` — T2 construction or smuggled witness material
- `silent-fallback` — transition not visible to both person and verifier
- `mediator-not-governed` — mediator absent from a valid registry snapshot
- `retention-violation:*` — post-job state kept a non-audit field
  (e.g. `retention-violation:transcriptDigest`, `retention-violation:session`)
- `job-transcript-mismatch` — proof record re-targeted to another transcript
- also emitted: `proof-invalid`, `descriptor-transcript-mismatch`,
  `unknown-mediator-level:*`, `unnamed-lower-profile`, `unnamed-channel`,
  `unnamed-target`, `unknown-exit:*`, `missing-epoch`

## What stays design-doc / research work

- **M1 (profile skeleton)** — the eleven §21.2 items answered per taxonomy
  level as a fill-in profile document: design-doc work in X7.
- **M4 (assurance-semantics table)** — per predicate (PR-LIV, PR-UNQ,
  PR-HLD, PR-FRE), what T0 vs T1 preserves or downgrades: design-doc work,
  input to the §25 gate.
- **Real blind delegated proving** — collaborative/MPC-assisted SNARK
  proving, witness-encrypted jobs: a §29-class research item. This runtime
  models the prepared-input split's *rules*, not its cryptography; where the
  circuit cannot be split, T0 is not achievable and the profile must declare
  downgraded assurance semantics.
- Verifier-blinding at the mediator, the mediator-session clock (§22.1), and
  exit-2-vs-exit-3 ranking: X7 open questions.

## Pointers

- Design doc: [X7 — Mediated Proving Profile](x7-mediated-proving-profile.md)
- Decision anchors: §21 (21.1/21.2/21.3), §19, §20, §6.5/§6.6, §23, §24, §26.1
- Spine: `../canonical/canonical.mjs` (§6.2 descriptor, §15.2 transcript);
  `../01-uniqueness-nullifier/src/nullifier.mjs` (H, nullifier)
- Sibling: `../quiet-presentation/` — tier property 6 deferred the mediated
  path to this runtime's design row.

## Upstream surface

For the TF's §21 profile text: the T0/T1/T2 taxonomy with constructor
enforcement, the four-exit machine with mandatory two-party visibility, the
P-ISOLATE/P-FORGET conformance properties with the frozen audit-field list,
and the named failure codes above as §26.1 negative-test fixtures. The
per-context mediator pseudonym is the §6.6 compliance mechanism to offer
alongside. Joint seam with Human Experience (§27.4): this runtime supplies
*what* must be indicated (which transition fired, who now observes); HX owns
*how*.
