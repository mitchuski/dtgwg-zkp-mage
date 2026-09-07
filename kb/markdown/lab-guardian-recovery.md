---
title: "Lab — guardian-recovery"
section: "lab"
source: "../dtgwg-zkp-tf-mage/runtimes/guardian-recovery/NOTES.md"
built_from_commitish: "working-tree"
order: 69
---
# Guardian recovery — the social-threshold pattern (X9 as a runnable reference)

Implements the X9 exploration
([X9 — Guardian Recovery](x9-guardian-recovery.md)) at milestones
**M1** (guardian-set commitment + t-of-n check), **M2** (boundary pair, drafted below as
prose), **M3** (guardian clock row + validator), **M4** (named failure codes). 12/12
properties (G1–G12), zero-dep, offline, deterministic (no `Date.now` — explicit guardian
epochs, recovery epochs and `now` values throughout).

## What it demonstrates

X5's pattern 3, made mechanical: t-of-n **personhood-anchored** guardians attest a
continuity claim ("this new commitment belongs to the person we knew under the old one"),
the biometric is never re-touched, and the correlator moves from the issuer to the
guardian set — with every trade that move creates stated in §2.4 form (M2 below). The
scope guard is kept verbatim: guardians are a **catastrophic-loss mechanism only**;
routine rotation stays in [Lab — rotation](lab-rotation.md) and never touches them.

The load-bearing separations, each with a property:

- **Attestation ≠ outcome.** t attestations are an *authorization input*; only the
  issuer's re-issuance record closes the ceremony (`completionEvidence`, G1/G8 — the
  outcome-interpretability rule and the VWC seat's W4 separation: no set of witnesses
  mints anything alone; §7.3 discipline — guardians attest, the issuer authorizes, the
  holder's new key does the rest).
- **Personhood-gated guardians.** The Sybil-self-guardian kill happens at **commit
  time**: a fabricated guardian without an admitted rt 01 anchor cannot join the set
  (G6), so a sock-puppet quorum is unreachable rather than merely detectable.
- **One seat per human per recovery context+epoch.** `guardianNullifier =
  nullifier(secret, 'guardian/' + descriptorDigest + '/' + epoch)` — k-of-n distinctness
  reduces to k distinct nullifiers (G4); intentional in-context linkage (§6.5, a count
  threshold), unlinkable across recovery contexts and across epochs (G10, §6.6).
- **Signer-set hiding.** The authorization input exposes `{setCommitment, count, epoch}`
  about the signers and nothing else — G7 scans it structurally for guardian humanIds,
  secrets, commitments, nullifiers and membershipRefs (for **all** n guardians, not just
  the signers: absence is also information). "The issuer sees a threshold met, not who
  vouched."
- **Expiring guardianship.** Attestations and sets are epoch-scoped; a stale attestation
  *or a stale set* fails `guardian-epoch-lapsed` (G3) — §22.2's deferred guardian-epoch
  question answered: guardianship expires and MUST be re-affirmed.
- **Contested recovery freezes, nothing reissues.** Two bundles claiming different
  `newCommitment`s over the same `revokedRef` in one epoch → `contested-recovery`, the
  ceremony key freezes, and even the *first* authorization can no longer reach
  `reissue` — issuer state provably untouched (G9; §13.6 challenge route; the §23 redress
  row X9 adds).
- **No old→new pair at the issuer.** The issuer is rotation's flat-atom state, imported
  unchanged, and G1 runs rotation's `auditNoLink` structural audit over the post-reissue
  state. The reissuance record itself carries no commitments (status semantics only,
  §10.1), so the outcome artifact is not a correlator either.
- **Trust-graph synergy.** `candidates.mjs` (G11): a member's standing VRC
  counterparties (rt 07) *are* the guardian candidate set — personhood-checkable,
  proven-collision history — and the candidate list feeds directly into
  `commitGuardianSet`. Recovery bootstraps from relationships, not re-enrolment. The
  module only READS the graph: guardian authority is over recovery, never over edges
  (the VWC seat's separation carried up one level).

## M2 — boundary pair for "recovery by guardian attestation" (drafted, prose)

**Assurance record.** What a successful guardian recovery establishes: *t distinct
personhood-anchored humans, each holding a live (unexpired, re-affirmed) guardian seat in
the committed guardian set for this governed recovery context, attested within the live
guardian epoch to the same continuity claim over the same ceremony transcript; the
issuer's re-issuance policy accepted that input and the reissuance record — not the
attestation bundle — evidences completion.* In §13.2-style negative form, it does **not**
establish: that the new commitment belongs to the same natural person beyond what t
humans' social knowledge carries (guardians can be deceived, coerced, or colluding — no
biometric re-check backs them); that the old secret was destroyed rather than held by an
attacker (the attacker-racing-the-guardians freshness question, X9 open, inherits X5's
attacker window); that the guardians judged independently; or one-unique-human globally.

The three parameters (§2.4):

- **Against whom.** Resistant to issuer and verifier as linkers — neither ever holds an
  old→new pair (G1's structural audit) and the issuer sees a threshold met, not who
  vouched (G7). **Not resistant to t colluding guardians**, who can jointly link the
  pre- and post-recovery commitments and know the person behind both — the guardian set
  is a new §19 observer class (add the row): it learns that a recovery happened, when,
  and for whom. The collusion threshold is exactly t: the profile's t is a privacy
  parameter, not only a liveness one.
- **For how long.** One guardian epoch. The attestation, the seat nullifier, and the
  set commitment are all epoch-scoped; guardianship expires and MUST be re-affirmed —
  "permanent"/"unbounded" refused by name (G12, §22.2). What the *epoch* cannot bound:
  the guardians' human memory of the recovery — stated honestly, that residue is
  unbounded and is the §19 row's substance. Usability cost, also honest: re-affirmation
  is a recurring human ceremony, and a lapsed set is a silently lost recovery path — the
  profile MUST surface lapse (§6.8 legibility) rather than discover it at recovery time.
- **Alongside what.** Guardian-selection metadata IS a social graph — who guards whom is
  who trusts whom, and with `candidates.mjs` it is *literally* a subgraph of the rt 07
  trust graph. Mitigations modelled: the **guardian-set commitment** (the set is a
  digest, membership proved not enumerated) and the **k-distinct-nullifier discipline**
  (one human cannot occupy two seats). Residuals to evaluate together: the authorization's
  `count` field (reveals how many signed, by design, §6.5); ceremony timing adjacency at
  the issuer (X4-class, same mitigation family as rotation's M4 note); and the
  re-affirmation cadence itself as an observable event (§20 — see open questions).

## M3 — the guardian clock row (§22.1 extension)

Additive to rotation's `CLOCKS` (imported table untouched):

| clock | family | touched by | bound |
|---|---|---|---|
| **guardian-attestation-epoch** | certification | **catastrophic + re-affirmation** | guardian epoch — expires unless re-affirmed (§22.2); a stale set cannot attest a live recovery |

`touchedBy` gains the value `re-affirmation` — the recurring ceremony that renews
guardianship is a clock-toucher in its own right, distinct from both of X5's cases.
`validateGuardianClocks` enforces §22.2: missing/`permanent`/`unbounded` bounds fail
`unbounded-clock:guardian-attestation-epoch` (G12) — a lifelong guardian is exactly the
implicit default §22.2 prohibits.

## M4 — named failure codes (fixture-register candidates)

| code | source | ref |
|---|---|---|
| `guardian-threshold-not-met` | `recoverWithGuardians()` count gate | X9 M4 |
| `guardian-epoch-lapsed` | stale attestation OR stale set vs live epoch | §22.2, X9 M4 |
| `duplicate-guardian-seat` | guardian-nullifier collision in one bundle | §6.5, X9 M4 |
| `guardian-not-in-committed-set` | membershipRef ∉ committed set | X9 (set commitment) |
| `guardian-not-personhood-anchored` | `commitGuardianSet()` at commit time | X9 (personhood gating), rt 01 |
| `contested-recovery` | conflicting claims (in-bundle or cross-bundle) → freeze + challenge route | §13.6, §23 row, X9 M4 |
| `attestation-not-outcome-evidence` | `completionEvidence()` on anything but a reissuance record | X9 ceremony rule, §7.3 |
| `unbounded-clock:guardian-attestation-epoch` | `validateGuardianClocks()` | §22.2 |

Reused byte-exact from rotation: `unknown-enrolment` (revokedRef not live at the issuer).
Model guards **not** proposed for the register: `invalid-threshold` (t outside 1..n at
commit), `not-an-authorization-input` (`reissue` handed something other than an
authorization). Note: `contested-recovery` covers both a *mixed* bundle (attestations to
two different claims presented together) and the cross-bundle conflict — both are
"conflicting attestations" routed to challenge, nothing reissued.

## Deviation from the design doc (additive, not modify)

X9's M1 says "guardian-set commitment + t-of-n check **in [Lab — rotation](lab-rotation.md)**
(additive)". The lab rule refines this: rotation's suite (like rt 01 and rt 07) is a
**byte-stable dependency** — other lanes re-derive against it — so this build lives in
its own directory, [Lab — guardian-recovery](lab-guardian-recovery.md), and IMPORTS the neighbours unchanged:
rt 01 (`enrol`/`nullifier`/`H` — guardian personhood anchors + seat nullifiers), rt 07
(`joinCommunity`/`TrustGraph`/`dreamCycleTurn` — the candidate-set demo), `canonical`
(§6.2 descriptor digests), and rotation itself (`createIssuer` flat-atom state,
`makeRecoveryDescriptor`, `auditNoLink`). Same construction, different home — rotation's
own precedent (its NOTES documents the identical refinement of X5's "add to runtime 01").
Rotation's 10/10 re-verified green after this build.

Two smaller signature notes against X9/M1's sketch: `commitGuardianSet` takes `t`
explicitly (threshold is a profile parameter, not a descriptor field — §6.2 has no slot
for it, and X9's open question about who sets t belongs to §6.7, not to the encoding);
and `recoverWithGuardians` takes the whole committed-set object (`set`) plus a `ceremony`
state, since contest detection is stateful by nature.

## Deferred (honest edges)

- **Real threshold signatures / ZK set-membership** — circuit work. `membershipRef =
  H(guardianCommitment, descriptorDigest)` is *modelled* inclusion: anyone holding the
  accredited commitment list can link a membershipRef back to a guardian. The real
  construction proves membership + threshold in zero knowledge (the attestations
  themselves never reach the issuer; here they reach `recoverWithGuardians` and only the
  authorization crosses onward — the hiding property is enforced at that boundary, G7).
- **Re-affirmation ceremony UX** (§27.4) — modelled only as "commit a fresh set at the
  new epoch"; the human ceremony, lapse surfacing (§6.8) and cadence are profile/UX work.
- **X9's open questions**, untouched by design: same-VTC requirement for guardians;
  the §6.7 authority for t/n floors; re-affirmation piggybacking on live VRC activity
  without turning edge traffic into a guardianship signal (§20); the attacker racing the
  guardians during a ceremony (freshness rule, extends X5's attacker window).
- The **§19 guardian-observer row** and the **recovery-witness credential shape** for the
  Credentials TF are prose surfaces (X9 upstream), not runnable here.

## Files

| file | role |
|---|---|
| `guardians.mjs` | personhood registry; guardian-set commitment; attestation (seat nullifier + membershipRef + claim digest); atomic t-of-n check → authorization input; ceremony state + contest freeze; modelled issuer `reissue`; `completionEvidence`; signer-set hiding audit; `GUARDIAN_CLOCKS` + validator |
| `candidates.mjs` | trust-graph synergy: rt 07 VRC counterparties → personhood-checked guardian candidates (read-only over the graph) |
| `test.mjs` | G1–G12 (`node test.mjs` → `guardian-recovery: 12/12 pass`) |

## Upstream surface (§29)

The social leg of §29's recovery item moves from "named and deferred" to a runnable
profile choice: the full §2.4 statement (M2 above), the §22.2 guardian-epoch answer
(expiring, re-affirmed, validator-enforced), fixture-ready failure codes, the §23
contested-recovery redress row exercised as a property (G9), and — to the Credentials
TF — the candidate recovery-witness credential shape: VWC-structured per attestation,
threshold semantics at the profile layer, `taskContext` = the recovery-domain descriptor,
with X9's credential-vs-artifact argument for why it is not a VWC subtype.

Design doc: [X9 — Guardian Recovery](x9-guardian-recovery.md).
