# X7 — The mediated-proving profile

*§21 permits mediated proving only as an explicit, separately assessed path: "A profile MAY support
mediated proving when a holder device cannot generate the required proof, but the mediated path MUST be
explicit and separately assessed" (§21.1). This doc designs that profile — the mediator taxonomy, the
declared-downgrade state machine, and the mediator's observer row made testable — so the §21.2 control
list stops being a checklist and becomes a mechanism.*

**Register:** new (X-series; completes X4's deferred budget row — `runtimes/quiet-presentation/` tier
property 6 defers the mediated path here) · leverage 🟠 · **Ladder:** reference built 2026-07-18 —
`~/dtgwg-zkp-tf-mage/runtimes/mediator/` 9/9: T2 unbuildable at the constructor, P-ISOLATE/P-FORGET
state checks, per-context mediator pseudonyms, four-exit machine with silent transitions
unconstructable. M1 skeleton + M4 assurance table remain design-doc work. See its NOTES.md
**Anchor (decision doc):** §21 mediated proving · §19 mediated-prover observer · §20 behavioural leakage ·
§6.6 "common fallback or mediated-prover identifiers" · §23 silent-fallback redress row · §24 prohibitions.
**Anchor (cred-spec):** VTA local/cloud split — the local VTA is the holder-device prover; the cloud VTA
is the natural mediator seat; the trust registry is where approved mediators get listed.

---

## What the decision doc rules and leaves open

§21.1 rules that mediation is admissible only as an explicit path. §21.2 lists eleven things a
mediated-proving profile MUST define — data sent; whether the mediator sees witnesses, biometrics,
commitments, or credentials; non-retention and deletion; session/tenant isolation; authentication;
transcript binding; audit; context-linkage capability; user-visible indication; assurance semantics;
failure behaviour — and closes with the hard floor: "A mediated prover MUST NOT become the biometric or
credential honeypot the privacy architecture was intended to avoid." §24 makes the same floor a
prohibited construction ("permit mediated proving without non-retention and correlation controls").
§21.3 bans the silent step-down. What no section supplies is the *design*: which mediator shapes exist,
which controls each shape satisfies structurally vs operationally, and how the downgrade is surfaced.
This doc supplies that layer.

## The mediator taxonomy

Three levels, ordered by what the mediator sees — each level answers §21.2's second item by construction.

| Level | Sees | §21.2 items satisfied structurally | Status |
|---|---|---|---|
| **T0 blind mediator** | a prepared, witness-free proving job: blinded/committed circuit inputs + public statement; never witnesses, biometrics, credentials, or raw attributes | data-sent (minimal), sees-what (none of the four), non-retention (nothing sensitive to retain), context-linkage (only via job metadata — see §6.6 section) | preferred |
| **T1 semi-trusted mediator** | commitments and the public statement; never witnesses or biometrics | sees-what (commitments only); non-retention, isolation, audit become *operational* controls that must be attested and tested | admissible with full §21.2 controls |
| **T2 honeypot** | witnesses, biometrics, raw credentials | none — this is the construction §21.2's closing sentence and §24 prohibit | **prohibited** |

The remaining §21.2 items (authentication, transcript binding, user-visible indication, assurance
semantics, failure behaviour) bind at every admissible level: the proving job carries the same canonical
transcript binding as local proving (§15), so a mediator cannot re-target a proof to another verifier or
session.

## The declared-downgrade state machine (§21.3)

"When the preferred proof cannot be produced, the system MUST NOT silently step down. It MUST either
fail, invoke an explicitly identified lower-assurance profile, use a governed mediator, or switch channel
according to a relying policy visible to the person and verifier." (§21.3) — rendered as a state machine
with exactly four exits from `LOCAL-PROVING-FAILED`:

```
LOCAL-PROVING-FAILED ──1──▶ FAIL                      (deterministic error, §13.6-style redress route)
                     ──2──▶ NAMED-LOWER-PROFILE        (profile identifier disclosed to person + verifier)
                     ──3──▶ GOVERNED-MEDIATOR          (T0/T1, registry-listed; mediation indicated to person + verifier)
                     ──4──▶ CHANNEL-SWITCH             (per relying policy, visible to both parties)
```

Every transition is EXPLICIT: it names its target (a profile identifier, a mediator identifier class, a
channel), and both the person and the verifier can observe which transition fired. This is X2's context
card q5 — "Does fallback change who observes?" — answered mechanically: transition 3 adds the mediated
prover to the §19 observer list, and the §21.2 "user-visible indication" is the card's q5 answer changing
in front of the person. Silent-downgrade accountability is already assigned: §23's row makes the verifier
and wallet/operator primarily accountable, mediator supporting, remedy "disclose, re-run under correct
profile, remediate affected decisions." X4's M-RETRY rule composes here: the switch is never silent, but
its *external* observability is minimised to the parties the relying policy requires.

## The mediator's §19 observer row, made testable

Per job, even a T0 mediator learns: that a proving job occurred; its timing; the requesting context
(unless verifier-blinded); the public transcript fields it computes over; retry count. That is the
irreducible residue. The §21.2 controls become two testable properties over a reference mediator model:

- **P-ISOLATE (session/tenant isolation):** two jobs from different holders share no derivable state —
  no common cache keys, session tokens, or timing-correlated storage. Test: run jobs A and B, diff the
  mediator's reachable state; nothing in B's execution is a function of A's inputs.
- **P-FORGET (non-retention):** mediator state after job completion contains nothing derivable from the
  job's inputs beyond the audit record the profile declares. Test: post-job state snapshot equals
  pre-job snapshot modulo the declared audit fields — which themselves obey X4's log-field register
  (no mediator session identifiers that outlive the session).

Claim form (§2.4): a completed job is uninformative about the holder's witnesses and credentials —
against the mediator and mediator-colluding-with-verifier, for the mediator's declared retention window
(target: zero beyond audit fields), alongside the job metadata, network traffic (§10.4's
"mediated-prover network traffic"), and audit log the profile declares.

## The mediator as correlation hub (§6.6)

A shared mediator sees jobs from many contexts; §6.6 prohibits "common fallback or mediated-prover
identifiers." Rule: the holder authenticates to the mediator under a **per-context mediator-facing
pseudonym** — the R-DID discipline (unique identifier per counterparty) applied with the mediator as
counterparty *per context*, never one account across contexts. Claim: two jobs from one holder in
different contexts are unlinkable at the mediator — against the mediator and any log processor, for the
context epoch, alongside network metadata (which therefore also needs decorrelation: X4's M-BATCH/M-SHAPE
apply to the holder↔mediator channel, not only holder↔verifier).

## Does mediation change what the verifier may rely on?

Honestly: it can. PR-HLD establishes "knowledge or control of the holder secret bound to the attestation
and the current transcript" (§14.1), and §14.3 already flags that mediated proving "may reveal additional
information and require separate analysis." The profile's honest split: **witness preparation stays
holder-side** (the holder derives commitments/blinded inputs using the holder secret and binds the
canonical transcript); **the mediator computes the proof over prepared inputs it cannot open**. Under
that split PR-HLD's statement survives, because the secret never leaves the holder. Where the circuit
cannot be split this way, T0 is not achievable and the profile MUST declare "equivalent or downgraded
assurance semantics" (§21.2) — the verifier is told it is relying on T1 operational controls, not
cryptography. Fully blind delegated proving for arbitrary circuits (collaborative/MPC-assisted SNARK
proving, witness-encrypted proving jobs) is a live research area — this doc flags it as a §29-class
research item and claims only what the prepared-input split actually gives.

## VTA mapping and mediator governance

The cred-spec's local VTA (edge device, PNM) is the preferred prover; the cloud VTA — "highly available
... routing private channel messages and other trust tasks" — is the natural **governed mediator** seat,
already present in personal VTA networks. Governance reuses PR-ISS's shape (§12): the trust registry
lists approved mediators with accreditation state and effective times; "governed mediator" in §21.3
means *registry-listed under the relying policy's mediator class*, with snapshot semantics (§12.4) so a
de-listed mediator fails closed. The mediator's registry lookups inherit O4's leakage discipline.

## What exists

- `~/dtgwg-zkp-tf-mage/runtimes/quiet-presentation/` (8/8) — tier property 6 ("mediated path, where
  supported, satisfies §21.2 and adds no cross-context identifier") deferred to a budget row; this doc
  is that row's design. X4's §19 mediated-prover budget line is the starting observer row.
- X2's context card q5 slot — the user-visible-indication surface already has a home.
- Cred-spec VTA term definitions (local/cloud/PNM/personal VTA network) — the deployment vocabulary.

## Build plan

- **M1 — profile skeleton:** the eleven §21.2 items answered per taxonomy level, as a fill-in profile
  document; T2 marked prohibited with §24 citation.
- **M2 — reference mediator model:** zero-dep runtime with P-ISOLATE and P-FORGET as property tests,
  plus the four-exit downgrade machine with transition-visibility assertions (fixture: silent transition
  = test failure, mapped to §26.1 negative tests).
- **M3 — correlation fixtures:** per-context mediator pseudonym model; two-context linkage test at the
  mediator (extends rt 01's nullifier discipline to mediator-facing identifiers).
- **M4 — assurance-semantics table:** per predicate (PR-LIV, PR-UNQ, PR-HLD, PR-FRE), what T0 vs T1
  mediation preserves or downgrades — input to the §25 gate's boundary records.

## Upstream surface

- The §21 profile text the TF will need: the taxonomy table, the four-exit downgrade machine, and the
  P-ISOLATE/P-FORGET conformance properties — offered as the "explicit profile" §21.1 requires.
- Joint seam with Human Experience (§27.4): the §21.2 "user-visible indication" is a shared deliverable —
  this doc supplies what must be indicated (which transition fired, who now observes); HX owns how.
- To the Credentials TF: an informative note seating the cloud VTA as the governed-mediator deployment
  class, with registry listing as the governance mechanism.

## Open questions

- Can T0 be achieved for the shared Poseidon/Merkle gadget (O2/O4) specifically — is the prepared-input
  split implementable there today, making T0 concrete rather than aspirational for the charter core?
- Does transition 3 need its own clock in §22.1's list (mediator-session lifetime vs challenge/session
  lifetime), and does the audit-record retention window get a §22.2-style bound?
- Verifier-blinding at the mediator (mediator learns *that* a job ran but not *for whom it verifies*) —
  worth the routing cost, or declared residue like X4's co-resident-app row?
- When a lower-assurance profile (exit 2) and a governed mediator (exit 3) are both available, who
  ranks them — relying policy, context authority (§6.7), or the person?
