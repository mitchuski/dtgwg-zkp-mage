# X10 — Ceremony-as-trust-task: the contribution site

*Raised on the 2026-08-11 call companion's tail: "would it make sense to host a site that allows our
working group's agent runtimes to be submitted as entropy to the circuits?" Yes — with one reframing
and one sequencing gate. The reframing: **agents orchestrate entropy; they are never the entropy.**
The gate: **no phase-2 ceremony before §25 closes.** Everything else in this design follows from
those two sentences.*

**Register:** new entry (post-X9) · the production-ceremony caveat in `CIRCUITS.md` made actionable ·
leverage 🟠 (unblocks nothing until §25, but the verification lane pays for itself now)
**Ladder:** idea → **design doc (here)**. No runtime yet. Candidate runtime: `runtimes/ceremony-orchestrator/`
(the never-sees-the-secret guard as property tests, kin to witness-seat's W-series). Hosting plan = separate
workbench decision, not this doc.
**Anchor (cred-spec):** VWC pattern (attestation over an act, `taskContext` REQUIRED) · trust registry
(admission list) · credential-vs-artifact test (a contribution attestation is true standing alone =
credential; the growing zkey chain is an artifact).
**Anchor (decision doc):** §15 canonical transcript (the contribution record is transcript-bound) ·
§19 observers (the agent's context window is a NEW observer class — see hazard below) · §25
construction-selection gate (phase-2 sequencing) · §7.3 structured evidence (seat admission) ·
§6.2 descriptor (ceremony identity as a governed context) · drafting rule four (the recursion label).

---

## The claim to prove

A trusted-setup contribution is a **trust task**: an act performed under a transcript, producing an
attestation whose accountability lives in governance, while the cryptography carries only what it can —
the verifiable chain of contributions. An agent runtime can *drive* that task end-to-end (fetch chain
head, verify, contribute, file the attestation) while being **structurally incapable of observing the
contribution secret** — the same separation the witness seat proves for edges (W-series: a witness
attests, never mints). If that separation cannot be enforced as a testable property, agent-mediated
contributions should not exist.

## The security frame, stated first

A ceremony's soundness needs **one honest participant who destroys their toxic waste**. It does not
need "good" entropy from anyone in particular. Three consequences:

1. **Entropy source = the contributing machine's OS CSPRNG**, piped directly into the contribution
   tool. Never derived from agent output, transcripts, model samples, or anything an agent generated —
   all of that is observable, logged, and replayable by construction.
2. **The agent's context window is an observer** (§19, new row): everything the agent sees persists in
   session logs, telemetry, and provider retention. A beacon value that transits the agent's context is
   a **compromised contribution** — the toxic waste survived in a log. This is the log-leak hazard X4's
   log-field register exists to name; here it is fatal rather than corrosive.
3. Therefore the orchestrator gets a **never-sees-the-secret structural guard**: the secret is read from
   the CSPRNG inside the contribution subprocess; the orchestrator's whole lifetime view (arguments,
   environment, captured output, filed attestation) is scanned to prove the secret's bytes appear
   nowhere. Witness-seat already demonstrates the pattern (whitelist + lifetime-view scan); this
   runtime inherits it verbatim.

## The three lanes, in sequencing order

**Lane 1 — verification-transcript registry (build now, zero ceremony risk).** The call companion
already asks volunteers to clone, run the three suites, and file transcripts against the 2026-08-04
run. A submission lane that accepts `{run transcript, artifact hashes, machine profile, position record
(ratify/refine/refute/build)}` is the same machinery a ceremony needs later — queue, public log,
attestation per submission — with nothing secret anywhere. Byte-exact artifact matching is the
acceptance test (deterministic lockfile + fixed-entropy setup make it decidable). This lane is where
the position protocol becomes infrastructure.

**Lane 2 — phase-1 powers-of-tau on BN254 (low-regret, admission-gated).** Phase 1 is universal:
it survives every circuit change, serves any future Groth16 phase 2, and a KZG-based PLONKish
counter-proposal consumes the same SRS — useful whichever way §25 goes, which is rare for ceremony
work. Size pot15+ (the guardian circuit's t=4 already breaks the 2^14 cap). Contribution chain =
standard snarkjs/perpetual-powers-of-tau flow; the site is a thin coordinator (queue, chain-head
pointer, per-contribution verification, public transcript log), not new cryptography — the
p0tion/DefinitelySetup shape, self-hosted small.

**Lane 3 — phase-2 per-circuit ceremony (GATED: after §25 + circuit freeze).** A per-circuit Groth16
ceremony consecrates the benchmarking vehicle as the product — the exact failure the CIRCUITS.md
caveat paragraph exists to prevent — and is invalidated by any circuit edit. It does not open until
the TF selects a construction and freezes the circuit. **The fixed-entropy lab fixture is untouched
by all three lanes**: byte-exact reproducibility IS lane 1's acceptance test; the ceremony lanes run
beside it, never through it.

## The contribution as a credential

Each accepted contribution files, publicly: `{ceremony descriptor (§6.2 canonical — ceremony id, phase,
parameter set, governing body), chain position, prior-head hash, new-head hash, contributor seat ref,
orchestrator attestation ("secret sourced from CSPRNG inside the subprocess; lifetime-view scan clean"),
transcript digest (§15.2), timestamp}`. By the cred-spec's test this attestation is a **credential**
(true standing alone: "seat N extended chain H₁→H₂ under ceremony D") and it is VWC-shaped — an
attestation over an act, taskContext required. The *chain* itself is an artifact. Accountability for
"I destroyed my waste" is a governance claim carried by the seat's admission, not a cryptographic one —
say so in the record (drafting rule one: name the adversary the record does NOT bind).

## Seat gating — where our primitives recurse, carefully

One-contribution-per-member via personhood-gated seat nullifiers is the obvious recursive story, and it
must be handled honestly: **you cannot security-critically gate a ceremony with a circuit whose setup
depends on that ceremony.** The rule:

- Seat admission = **governance layer**: WG membership list / trust-registry entry, revocable,
  auditable — §7.3 structured evidence, never a soundness assumption.
- Nullifier-based one-seat-one-contribution MAY run as an *advisory* dedup signal using the lab-fixture
  circuit, labelled as such. It contributes convenience, not soundness. If the lab fixture were
  malicious, the ceremony's security is untouched — only the dedup signal degrades.
- The recursion is stated in the ceremony descriptor itself (drafting rule four: label the conjecture-
  free boundary). A reader must be able to see that no ceremony-security claim rests on artifacts the
  ceremony produces.

## What the orchestrator runtime must prove (property-test sketch)

- C1 contribution secret is generated inside the subprocess from the OS CSPRNG; orchestrator lifetime
  view scanned — secret bytes appear nowhere (witness-seat pattern, inherited).
- C2 the orchestrator verifies the chain head before contributing; a tampered prior contribution is
  rejected by name.
- C3 the filed attestation binds the §15.2 transcript; replay under a different ceremony descriptor
  fails (kin to Z9).
- C4 a seat not on the admission list cannot file (governance gate); a revoked seat fails closed,
  visibly (mediator's de-listing pattern).
- C5 duplicate seat submission is *detected* (advisory nullifier) but the record states detection is
  advisory — the register string names the tier.
- C6 lane-3 endpoints are unconstructable while the §25 flag is unset (the T2-honeypot pattern: the
  prohibited thing cannot be built, not merely rejected).
- C7 lane-1 acceptance = byte-exact artifact match against the pinned run; a near-miss fails with the
  differing hash named.

New register candidates: `ceremony-secret-observed`, `chain-head-mismatch`, `seat-not-admitted`,
`seat-revoked`, `duplicate-seat-advisory`, `phase2-gate-closed`, `artifact-hash-mismatch:`.

## Upstream surface

Not spec text. This is TF *operations*: a proposal in the upstream repo (discussion or short doc) that
the WG run lane 1 now and lane 2 as a named WG activity, with lane 3 explicitly deferred behind §25 —
plus the §19 observer-row addition (agent context windows) which IS decision-doc material and should go
in with the next boundary-register batch.

## Honest unknowns

- Whether ToIP/LFDT process wants a ceremony run under WG colours at all, or under a neutral banner
  with WG participation — governance question, Mitch/chairs, not this doc.
- Contribution liveness: agent-orchestrated seats make contributing cheap; cheap contributions invite
  low-effort seats. Whether seat count or seat diversity is the metric worth governing is open.
- Whether lane 2 should anchor to an existing perpetual-powers-of-tau chain (import its head, extend
  under WG governance) instead of starting fresh — fewer contributions to bootstrap trust, one more
  provenance dependency to document.
