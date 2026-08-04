---
title: "X5 — Recovery and Rotation"
section: "explorations"
source: "explorations/X5-recovery-rotation.md"
built_from_commitish: "working-tree"
order: 54
---
# X5 — Recovery and rotation without correlators

*Enrolled secrets get lost, compromised, and time-bounded — §22.2 makes rotation mandatory, not
exceptional. But naive recovery (re-enrol via biometric → issuer links old and new) creates exactly the
reusable enrolment-root correlator §6.6 prohibits. This doc separates the cases and states the trades.*

**Register:** §29 research item ("biometric-derived secret rotation") · O2 open question · leverage 🔴
**Ladder:** reference built 2026-07-18 — [Lab — rotation](lab-rotation.md) 10/10: routine
derivation + descent check, issuer-blind recovery with structural no-old→new audit, rate-limited
recovery-domain nullifier, reform-vs-continue edge rekey over rt 07. Built ADDITIVE (rt 01 imported,
never modified — its byte-stability is a fixtures dependency). Guardian recovery + PQ migration
deferred. See its NOTES.md
**Anchor (cred-spec):** PHC/VMC enrolment lifecycle · R-DID per-counterparty freshness (rotation must not
break it).
**Anchor (decision doc):** §29 · §22 lifecycle (§22.2 unbounded prohibited, §22.3 migration) · §13.3
("recovery, rotation, and exception rules") · §13.4 ("recovery or rotation domain" nullifier input) ·
§13.6 failure/redress · §5.11 enrolment root · §6.6 prohibited cross-context linkage.

---

## The tension (decision-doc language, adopted verbatim)

Recovery requires *some* continuity: the issuer must know a new enrolment replaces an old one, or the
person walks away holding two live PHCs — a Sybil the nullifier cannot see, because a nullifier is "a
deterministic, domain-separated value used to detect repeated use of the same enrolled secret" (§5.12) and
a recovered person holds a *different* secret. But continuity is a correlator: a stored old→new link is "a
reusable enrolment-root identifier" in issuer hands, prohibited at the verifier surface (§6.6) and a §2.4
claim-killer under issuer-verifier collusion (§6.4). The claim to design for:

> Rotation and recovery preserve the PR-UNQ guarantee (§13.1) across the secret change, without giving any
> party a persistent identifier that links pre- and post-event presentations across contexts.

§22.2 sets the stakes: an enrolment root without a cryptoperiod is non-conformant, so *every* conformant
deployment rotates — this is lifecycle, not an edge case.

## First cut: two cases that must never share a mechanism

- **Routine epoch rotation (holder-side, no enrolment contact).** Derive epoch keys from a master secret by
  one-way, domain-separated derivation (pools-lineage discipline): `s_epoch = H_domain(s_master, epoch-id)`,
  with the commitment scheme proving consistent descent from the enrolled commitment. Epoch rollover (§5.8,
  §22.1's separate clocks) then *never* touches the issuer or the biometric. The enrolment-root cryptoperiod
  (§5.10) and the nullifier epoch rotate on different clocks by construction.
- **Catastrophic loss/compromise (enrolment-level recovery).** Only when the master secret itself is lost or
  compromised does anyone re-enter enrolment. Patterns below are for this case alone. A profile that routes
  routine rotation through re-enrolment has built a periodic biometric correlator into its lifecycle.

## Recovery patterns and their trade positions

1. **Issuer-blind replacement.** Holder revokes the old credential (status change, §10.1 semantics), then
   fresh-enrols; the biometric deduplication — not a stored link — is what prevents the person holding two
   live enrolments. The issuer learns "someone re-enrolled" but not who replaced whom. Trade: the whole
   anti-duplication burden shifts onto dedup quality and resistance to re-enrolment — exactly §13.3's
   assurance-dependency list — and revocation-then-enrolment timing correlation at the issuer must be
   assessed (§19: issuer as observer; coarse timing per §20).
2. **Recovery-domain nullifiers.** §13.4 already requires the nullifier statement to bind a "recovery or
   rotation domain where applicable." Scope a nullifier to the *recovery event itself*: same enrolled
   biometric commitment, context = the governed recovery domain, so repeated recovery is reuse-detected and
   rate-limited (§6.5: rate/count thresholds are intentional in-context linkage) without any persistent
   old→new link. This bounds pattern 1's dedup dependency: even if dedup misses, the recovery domain catches
   high-frequency abuse. Retention of the recovery nullifier is epoch-bounded like any other (§22.2).
3. **Social/threshold recovery.** Guardians attest continuity ("this new commitment belongs to the person
   we knew under the old one"); the biometric is never re-touched. The correlator does not vanish — it moves
   from issuer to guardian set. Stated in §2.4 form: *against whom* — resistant to issuer and verifier, not
   to t-of-n colluding guardians; *for how long* — the guardian set's memory, unbounded unless the
   attestation is epoch-scoped; *alongside what* — guardian-selection metadata (who guards whom is itself a
   social graph). Fits the cred-spec's community-anchored construction; the guardian attestation is
   structured evidence, kept separate from holder-key control (§7.3 discipline).
4. **Edge continuity vs edge re-formation (standing VRCs/VMCs).** Rotation changes what counterparties see.
   Two honest options: (a) *re-formation* — old edges die with the old secret and trust is re-established;
   costly but leak-free. (b) *continuity* — a bridging proof ("new secret descends from / replaces the
   enrolment behind the old edge") re-keys the edge; but the counterparty then learns "same person, new
   key," which is precisely a cross-epoch link, tolerable only *within* the edge's own governed context
   (§6.5), never exportable across contexts (§6.6). A profile MUST pick per edge type and state it; silent
   continuity is a silent context expansion (§6.7).

## What exists

- Runtime 01 ([Lab — 01-uniqueness-nullifier](lab-01-uniqueness-nullifier.md)) — the construction being recovered:
  `enrol → (s, r, commitment)`, nullifier `H_domain(s, ctx)`, 9/9 properties. No rotation story yet; P4
  (self-Sybil) is the property recovery must *preserve*.
- O2's statement already carries the §13.4 recovery-domain input as an explicit nullifier binding — unfilled.
- Pools lineage (O6 in [O5 O6 O8 — Supporting Notes](o5-o6-o8-supporting.md)): one-way domain-separated key derivation for rotation is
  proven discipline there; the mapping onto §29 was flagged as O2's open question and is this doc.
- §13.6 gives the redress frame: a repeated nullifier "may result from … recovery" — recovery must be a
  named, deterministic error-semantics branch, not an anomaly (§26.1 negative-test material).

## Build plan

- **M1 — lifecycle record.** Draft the §22.1 clock table for rt 01: nullifier epoch vs enrolment-root
  cryptoperiod vs recovery-domain retention; state which clock each pattern touches.
- **M2 — hierarchical derivation in the reference model.** Add `s_epoch = H_domain(s_master, epoch)` to
  runtime 01 with two new properties: rotation preserves P4 within the new epoch; pre/post-rotation
  nullifiers are unlinkable across epochs (extends P2).
- **M3 — recovery-domain nullifier.** Model the recovery context as a governed §6.2 descriptor; property:
  k recoveries in one recovery epoch are reuse-detected; recovery leaves no old→new value in issuer state.
- **M4 — boundary pair for the recovery event.** Assurance + disclosure records (§26) for "credential
  replaced": against whom, for how long, alongside what — including the issuer's revocation/enrolment
  timing view and the guardian-set variant.
- **M5 — edge-rekey note.** With rt 07 (trust-graph formation): what a VRC counterparty observes under
  re-formation vs continuity; feed the per-edge-type decision into O9's schema extension discussion.

## Upstream surface

- A direct contribution to §29's open research item: the case split (routine rotation never touches
  enrolment; only catastrophic loss does) plus the recovery-domain nullifier turn "open question" into a
  decidable profile choice with stated trades.
- Fills the §13.4 "recovery or rotation domain" input with concrete semantics and a fixture.
- Feeds §13.6: recovery as a named cause of repeated nullifiers, with deterministic error semantics and a
  challenge route.
- To the Credentials TF: rotation must not break R-DID per-counterparty freshness — the edge-rekey analysis
  (pattern 4) is the shared surface.

## Open questions

- Can descent-from-enrolment be proved *without* the issuer learning rotation cadence (proof shape or
  status traffic may fingerprint rotators — §10.4/§20 class leakage)?
- Guardian-set attestations: do they need their own epoch/cryptoperiod under §22.2, and who is the §6.7
  authority for the recovery context?
- Compromise (attacker holds the old secret) vs loss (nobody does): does the old-secret-revocation race in
  pattern 1 need a freshness rule of its own, and what does the attacker's window look like in §2.4 terms?
- Post-quantum migration (§22.3, §29): is enrolment-level recovery the natural vehicle for migrating
  long-lived enrolment artefacts, or must migration be holder-side like routine rotation?
