# X9 — Guardian recovery: the social-threshold pattern

*X5 named it pattern 3 and deferred it; the rotation build (10/10) deferred it again — "needs its own
boundary pair + §22.2 guardian-epoch answer." This is that design: guardians attest continuity, the
correlator moves from issuer to guardian set, and every trade that move creates is stated in §2.4 form.*

**Register:** X5 pattern 3 (deferred) · §29 recovery research item, social leg · leverage 🟠
**Ladder:** **CIRCUIT BUILT 2026-07-18** — `runtimes/circom-gadget/` guardian-threshold 8/8:
GuardianThreshold(20, 3), **16,078 constraints** (= 3 membership legs + 3 distinctness + 1 claim
binding; 306 headroom under ptau 2^14 — t=4 needs pot15), ~790 ms prove; duplicate seat =
unsatisfiable witness; seat nullifiers claim-independent in-context (rival-claim double-vouch
detectable) + cross-context unlinkable; GUARDIAN_TAG pinned. Out-of-circuit: set-commitment↔Merkle
reconciliation (the promote-lane task), epoch lapse, personhood gating, contest/freeze, t as profile
parameter. Reference: `runtimes/guardian-recovery/` 12/12:
committed sets with personhood-gated seats, t-of-n → authorization input (never completion),
contest-freeze provably leaves issuer state untouched, signer-set hiding audited for all n,
guardian-attestation epoch as its own clock, rt07-candidates demo. Boundary pair drafted in its
NOTES.md; threshold signatures/ZK membership = circuit work
**Anchor (cred-spec):** VWC (witness credential, `taskContext` REQUIRED) · VEC · community-anchored
construction · credential-vs-artifact test · `explorations/VWC-witness-seat.md` (the witness seat X9's
guardian is structurally kin to — authority over recovery, never over edges).
**Anchor (decision doc):** §13.3 ("recovery, rotation, and exception rules") · §13.4 recovery-domain
input · §13.6 redress · §22.2 bounded epochs · §2.4 three parameters · §6.5/§6.6 · §7.3 structured
evidence · §19 observers · §23 redress matrix · §29.

---

## Scope guard (X5's case split, kept verbatim)

Routine epoch rotation is holder-side one-way derivation and **never touches issuer, biometric, or
guardians**. Guardians are a **catastrophic-loss mechanism only**: the master secret is gone or
compromised, and t-of-n guardians attest "this new commitment belongs to the person we knew under the
old one" — the biometric is never re-touched. A profile that routes routine rotation through guardians
has built a periodic social correlator into its lifecycle, the same defect X5 names for re-enrolment.

## The guardian attestation as a credential

Each guardian signs, individually: `{new_commitment, revoked_commitment_ref, recovery_domain_descriptor
(§13.4/§6.2 canonical — context authority, purpose, scope, recovery epoch), guardian_membership_ref
(the guardian's own personhood anchor), transcript_digest}`. Structurally this is a **taskContext-bound
witness-class credential over the recovery ceremony** — the VWC pattern, one hop over: a witness attests
that an encounter *occurred*; a guardian attests that a *continuity claim holds*.

Does it want to be a VWC subtype or its own shape? The cred-spec's test: **credential** = true standing
alone; **artifact** = only meaningful inside its exchange. One guardian attestation *is* true standing
alone ("I attest this continuity claim") — credential, and VWC-shaped (witness M-DID → observed DID,
`taskContext` REQUIRED). But the *aggregate* is not a bigger witness statement: at threshold t it becomes
an input the issuer's re-issuance policy acts on — gate power, exactly what the VWC seat's separation
property (W4: a witness cannot mint anything alone) exists to forbid. Verdict: **its own shape** — a
*recovery-witness credential*, VWC-structured per attestation, with threshold semantics defined at the
profile layer, never smuggled into VWC. It is structured evidence kept separate from holder-key control
(§7.3 discipline): guardians attest, the issuer authorizes, the holder's new key does the rest.

## The correlator trade, stated fully (§2.4)

- **Against whom.** Resistant to issuer and verifier as linkers — neither ever holds an old→new pair;
  the issuer sees a threshold met, not who vouched. **Not resistant to t colluding guardians**, who can
  jointly link pre- and post-recovery commitments and know the person behind both. Guardians are a new
  §19 observer class (add the row): they learn that a recovery happened, when, and for whom.
- **For how long.** The guardian set's memory — unbounded, **unless the attestation is epoch-scoped**.
  Answering §22.2's deferred question: guardian attestations get their own epoch/cryptoperiod.
  Guardianship *expires* and MUST be re-affirmed; a stale guardian set cannot attest a live recovery.
  "Permanent" or "unbounded" MUST NOT be accepted as an implicit default (§22.2) — a lifelong guardian
  is exactly such a default. Usability cost, stated honestly: re-affirmation is a recurring human
  ceremony, and a person who lets it lapse has silently lost their recovery path — the profile MUST
  surface lapse (§6.8 legibility) rather than discover it at recovery time.
- **Alongside what.** Guardian-selection metadata IS a social graph — who guards whom is who trusts
  whom. Mitigations: **guardian-set commitments** — the holder commits to a guardian set; recovery
  proves t-of-n attestations from the committed set *without revealing which guardians signed*
  (membership + threshold in zero knowledge); plus the **k-out-of-n distinctness discipline** — k
  distinct guardian nullifiers, so one guardian cannot sign twice under two seats.

## Personhood-gating the guardians

The attack that breaks naive social recovery: a Sybil enrols sock-puppet guardians and self-recovers —
the guardian set is only as real as its members. So each guardian MUST themselves be personhood-anchored
(the PHC leg, rt 01), and each carries a **guardian nullifier scoped to the recovery domain** (§13.4's
recovery-domain input, reused): one guardian seat per human per recovery context. Within that governed
context this is intentional linkage (§6.5 — a count threshold); across contexts the guardian nullifier
MUST NOT link (§6.6). Distinctness of the k signatures reduces to k distinct nullifiers — mechanical.

## The ceremony as a trust task

Recovery is a governed trust task under the recovery-domain descriptor as `taskContext`. The
outcome-interpretability rule applies with force: a guardian attestation — even t of them — **is not
evidence that recovery completed**. Verifiers MUST NOT read it as completion evidence; the **issuer's
re-issuance is the outcome artifact**, and only its reachability closes the ceremony. Redress (§23 gains
a row):

| Failure | Primary accountable party | Supporting parties | Required remedy path |
|---|---|---|---|
| Contested recovery (guardians disagree, stale set attests, or holder disputes) | recovery-context authority | issuer, guardian set, verifier state operator | freeze re-issuance, adjudicate via challenge route, correct state, restore or re-run ceremony |

Per §13.6, adopted verbatim: a person MUST NOT be permanently excluded by an opaque uniqueness result
without correction and appeal mechanisms — a person whose guardians are dead, lapsed, or hostile still
gets the challenge route (falling back to pattern 1's issuer-blind re-enrolment where dedup permits).

## Against X5's patterns 1–2

| | 1 issuer-blind | 2 recovery-domain nullifier | 3 guardians |
|---|---|---|---|
| re-touches biometric | yes | yes (dedup) | **no — the template is never re-touched** |
| survives issuer death | no | no | **yes — issuer-independence is the unique property** |
| correlator holder | issuer (timing residual) | issuer (rate view) | t colluding guardians |
| new disclosure | timing adjacency | recovery frequency | social graph (who guards whom) |
| liveness dependency | issuer up | issuer up | t guardians alive, affirmed, willing |

Guardians WIN when the biometric must not be re-presented or the issuer is gone; they LOSE on collusion
surface, social-graph disclosure, and guardian-set liveness. A profile picks per threat model — and says so.

## Trust-graph synergy (the agentprivacy angle)

The trust graph the person already built IS the guardian candidate set: standing VRC counterparties are
personhood-checkable (community-anchored construction), have proven-collision history (rt 07), and their
edges are exactly the relationships a guardian claim rides on. A guardian is a witness (VWC seat) whose
authority is over *recovery*, never over *edges* — the seat's separation carried up one level. Edge
formation becomes guardianship substrate: recovery bootstraps from relationships, not from re-enrolment.

## Build plan

- **M1 —** guardian-set commitment + t-of-n check in `runtimes/rotation` (additive; imports rt 01 for
  guardian personhood, rt 07 for candidate edges); properties: threshold met, signer-set hidden,
  duplicate-guardian-nullifier refused, stale-epoch attestation refused by name.
- **M2 —** the boundary pair the build deferred: assurance + disclosure records for "recovery by
  guardian attestation," Appendix-B format, §19 guardian-observer row included.
- **M3 —** clock-table extension: `guardian-attestation epoch` row (certification family; touched by
  catastrophic + by re-affirmation), wired into `validateClocks` (§22.2).
- **M4 —** failure codes: `guardian-threshold-not-met`, `guardian-epoch-lapsed`,
  `duplicate-guardian-seat`, `contested-recovery` → §13.6 challenge route.

## Upstream surface

- §29's recovery item, social leg: pattern 3 moves from "named and deferred" to a decidable profile
  choice with the full §2.4 statement and the §22.2 guardian-epoch answer.
- To the Credentials TF: candidate **recovery-witness credential** shape — VWC-structured per
  attestation, threshold semantics profile-level, `taskContext` = the recovery-domain descriptor;
  plus the credential-vs-artifact argument for why it is not a VWC subtype.
- §23: the contested-recovery redress row; §19: the guardian-set observer row.

## Open questions

- Must guardians hold VMCs in the *same* VTC as the recovering person (stronger community anchoring,
  smaller pool — the VWC seat's same question, inherited)?
- Threshold choice t, n as profile parameters: who is the §6.7 authority that sets them, and is a
  holder-chosen t below the profile floor a conformance failure or a disclosed weaker claim?
- Can re-affirmation piggyback on live VRC activity (an active edge as implicit affirmation) without
  turning edge traffic into a guardianship signal — a §20 observable-event question?
- Compromise (old secret held by an attacker) during a guardian ceremony: does the attacker racing the
  guardians need its own freshness rule, extending X5's attacker-window open question?
