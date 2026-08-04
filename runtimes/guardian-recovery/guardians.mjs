// Guardian recovery — the social-threshold pattern (X9 as a runnable reference).
//
// X5 named guardians pattern 3 and deferred them; the rotation build deferred
// them again. This runtime is that deferral closed: t-of-n guardians attest a
// CONTINUITY CLAIM ("this new commitment belongs to the person we knew under
// the old one") — the biometric is never re-touched, and the correlator moves
// from the issuer to the guardian set (X9 §2.4 statement drafted in NOTES.md).
//
// Scope guard, kept from X5/X9 verbatim: guardians are a CATASTROPHIC-LOSS
// mechanism only. Routine rotation stays holder-side derivation (runtimes/
// rotation) and never touches guardians — a profile that routes routine
// rotation through guardians has built a periodic social correlator into its
// lifecycle.
//
// The load-bearing separations:
//   * a guardian attestation — even t of them — is NOT completion evidence;
//     the issuer's re-issuance is the outcome artifact (X9 ceremony rule,
//     §7.3 discipline: guardians attest, the issuer authorizes, the holder's
//     new key does the rest). completionEvidence() enforces it by name.
//   * guardians MUST themselves be personhood-anchored (rt 01 — the
//     Sybil-self-guardian kill: a fabricated guardian cannot join the set).
//   * one guardian seat per human per recovery context+epoch: a guardian
//     nullifier scoped 'guardian/<descriptorDigest>/<epoch>' — intentional
//     in-context linkage (§6.5, a count threshold), MUST NOT link across
//     contexts (§6.6).
//   * guardianship EXPIRES (§22.2): attestations are epoch-scoped, a stale
//     guardian set cannot attest a live recovery, and an unbounded guardian
//     epoch fails validation by name.
//
// ADDITIVE deviation from X9's M1 wording: the design doc says "in
// runtimes/rotation (additive)". The lab rule refines this — rotation's suite
// is a byte-stable dependency, so this build lives in its OWN directory and
// IMPORTS rotation/rt01/rt07 unchanged. See NOTES.md.

import { enrol, nullifier, H } from '../01-uniqueness-nullifier/src/nullifier.mjs';
import { descriptorDigest, canonicalize } from '../canonical/canonical.mjs';
import { createIssuer } from '../rotation/rotation.mjs';

// --- domains -----------------------------------------------------------------
export const DOMAIN_GUARDIAN_SET = 'dtg-zkp/guardian-set/v0';
export const DOMAIN_GUARDIAN_MEMBER = 'dtg-zkp/guardian-member/v0';
export const DOMAIN_RECOVERY_CLAIM = 'dtg-zkp/recovery-claim/v0';
export const GUARDIAN_CONTEXT_PREFIX = 'guardian/'; // §13.4 recovery-domain input, reused

// ============================================================================
// Personhood anchoring (rt 01) — the accredited enrolment set, modelled
// ============================================================================
// Being "personhood-anchored" = the guardian's rt 01 enrolment commitment is in
// the accredited set. rt 01's enrol() is the derivation; ADMISSION is what the
// registry models. A sock-puppet humanId can call enrol() but is not admitted.
export function createPersonhoodRegistry() {
  return new Set(); // enrolment commitments admitted by the accredited issuer set
}

export function anchorPerson(registry, humanId) {
  const id = enrol(humanId);
  registry.add(id.commitment);
  return id;
}

// ============================================================================
// The committed guardian set (X9: guardian-set commitments hide who guards whom)
// ============================================================================
// The holder commits to a guardian set with threshold t at a guardian epoch.
// Every guardian MUST be personhood-anchored at commit time — refused by name
// otherwise (the naive-social-recovery Sybil attack dies here, not at recovery
// time). The commitment is H over the canonicalized SORTED guardian personhood
// commitments + the recovery-domain descriptor digest + the epoch, so the set
// is order-independent, context-bound, and epoch-bound.
//
// memberRefs models ZK set-membership: a per-context derived reference the
// checker can test inclusion against without the raw commitments appearing in
// any authorization output. (Real construction: membership + threshold proved
// in zero knowledge — circuit work, deferred; NOTES.md.)
export function commitGuardianSet(holderId, guardianHumanIds, t, recoveryDescriptor, epoch, personhoodRegistry) {
  const d = descriptorDigest(recoveryDescriptor); // governed §6.2 context, never an opaque label
  const commits = [];
  for (const gid of guardianHumanIds) {
    const g = enrol(gid);
    if (!personhoodRegistry.has(g.commitment)) {
      return { ok: false, reason: 'guardian-not-personhood-anchored' };
    }
    commits.push(g.commitment);
  }
  const n = commits.length;
  if (!Number.isInteger(t) || t < 1 || t > n) {
    return { ok: false, reason: 'invalid-threshold' }; // model guard, not a register code
  }
  const sorted = [...commits].sort();
  const setCommitment = H(
    DOMAIN_GUARDIAN_SET,
    canonicalize({ holder: H('holder', holderId), guardians: sorted, descriptor: d, epoch, t, n })
  );
  const memberRefs = new Set(sorted.map((c) => H(DOMAIN_GUARDIAN_MEMBER, c, d)));
  return { ok: true, setCommitment, n, t, epoch, descriptorDigest: d, memberRefs };
}

// ============================================================================
// The guardian attestation (X9: a recovery-witness credential, VWC-structured)
// ============================================================================
// One guardian signs, individually: {newCommitment, revokedRef, recovery
// descriptor, epoch, transcriptDigest}. Structurally a taskContext-bound
// witness-class credential over the recovery ceremony — true standing alone;
// the AGGREGATE at threshold t is gate power and lives at the profile layer
// (recoverWithGuardians), never inside the credential shape.
//
//   guardianNullifier — one seat per human per recovery context+epoch
//                       (k-out-of-n distinctness reduces to k distinct
//                       nullifiers — mechanical).
//   membershipRef     — modelled inclusion proof against the committed set.
//   claimDigest       — binds the attestation to ONE continuity claim + one
//                       ceremony transcript (§15.2 discipline, one hop over).
export function attest(guardianHumanId, { newCommitment, revokedRef, recoveryDescriptor, epoch, transcriptDigest }) {
  const g = enrol(guardianHumanId); // guardian's own personhood anchor (rt 01)
  const d = descriptorDigest(recoveryDescriptor);
  const guardianNullifier = nullifier(g.secret, GUARDIAN_CONTEXT_PREFIX + d + '/' + epoch);
  const membershipRef = H(DOMAIN_GUARDIAN_MEMBER, g.commitment, d);
  const claimDigest = H(DOMAIN_RECOVERY_CLAIM, newCommitment, revokedRef, d, epoch, transcriptDigest);
  return {
    kind: 'guardian-attestation',
    guardianNullifier,
    membershipRef,
    newCommitment,
    revokedRef,
    epoch,
    transcriptDigest,
    descriptorDigest: d,
    claimDigest,
  };
}

// ============================================================================
// The ceremony state — where contested recovery is caught (§13.6, §23 row)
// ============================================================================
// claims : "<revokedRef>|<epoch>" -> the newCommitment a bundle authorized.
// frozen : keys where two bundles claimed DIFFERENT newCommitments in one
//          epoch — re-issuance freezes, the challenge route adjudicates,
//          nothing is reissued (X9's contested-recovery redress row).
export function createCeremony() {
  return { claims: new Map(), frozen: new Set() };
}

// ============================================================================
// t-of-n check — atomic; every defect refused BY NAME (X9 M4)
// ============================================================================
// On success returns an AUTHORIZATION INPUT — not a completed recovery. The
// issuer's re-issuance policy acts on it (issuer.reissue below); the bundle
// alone is never completion evidence (completionEvidence()).
//
// Signer-set hiding at model level: the authorization exposes, about the
// signers, only {setCommitment, count, epoch} — no guardian id, commitment,
// nullifier, or membershipRef crosses into it (auditSignerSetHidden checks
// structurally). The claim fields (newCommitment, revokedRef, transcript) it
// carries are the holder's, not the guardians'.
export function recoverWithGuardians({ attestations, set, t, recoveryDescriptor, epoch, issuer, ceremony }) {
  const refuse = (reason) => ({ ok: false, reason });
  const threshold = t ?? set.t;

  // stale guardian set: guardianship expired without re-affirmation (§22.2)
  if (set.epoch !== epoch) return refuse('guardian-epoch-lapsed');

  // 1. threshold — ≥ t attestations presented
  if (!Array.isArray(attestations) || attestations.length < threshold) {
    return refuse('guardian-threshold-not-met');
  }
  // 2. epoch — every attestation minted at the LIVE guardian epoch
  for (const a of attestations) {
    if (a.epoch !== epoch) return refuse('guardian-epoch-lapsed');
  }
  // 3. membership — every attestation from the committed set (modelled inclusion)
  for (const a of attestations) {
    if (!set.memberRefs.has(a.membershipRef)) return refuse('guardian-not-in-committed-set');
  }
  // 4. distinctness — k distinct guardian nullifiers: one seat per human (§6.5)
  const nulls = new Set(attestations.map((a) => a.guardianNullifier));
  if (nulls.size !== attestations.length) return refuse('duplicate-guardian-seat');
  // 5. one claim — all bound to the same continuity claim + transcript
  const claims = new Set(attestations.map((a) => a.claimDigest));
  if (claims.size !== 1) return refuse('contested-recovery');

  const { newCommitment, revokedRef, transcriptDigest } = attestations[0];

  // 6. the old commitment must be live at the issuer this bundle addresses
  if (issuer && issuer.state.commitments.get(revokedRef) !== 'live') {
    return refuse('unknown-enrolment'); // rotation's code, reused byte-exact
  }

  // 7. contest detection: two bundles, same revokedRef + epoch, DIFFERENT
  //    newCommitments -> freeze re-issuance, route to challenge (§13.6, §23)
  const key = `${revokedRef}|${epoch}`;
  if (ceremony) {
    if (ceremony.frozen.has(key)) return refuse('contested-recovery');
    const prior = ceremony.claims.get(key);
    if (prior !== undefined && prior !== newCommitment) {
      ceremony.frozen.add(key);
      return refuse('contested-recovery');
    }
    ceremony.claims.set(key, newCommitment);
  }

  return {
    ok: true,
    authorization: {
      kind: 'recovery-authorization-input',
      setCommitment: set.setCommitment, // which committed set authorized — never which members
      count: attestations.length, // §6.5 intentional in-context disclosure: a count threshold
      epoch,
      newCommitment,
      revokedRef,
      transcriptDigest,
    },
  };
}

// ============================================================================
// The modelled issuer — re-issuance is the outcome artifact
// ============================================================================
// State = rotation's flat tables (atoms only; no composite record can pair
// old and new — rotation's auditNoLink stays the structural check). The
// reissuance record carries NO commitments: status semantics only (§10.1),
// so the outcome artifact itself is not an old→new correlator.
export function createRecoveryIssuer() {
  const state = createIssuer(); // { commitments, templates, events } — rt rotation, unchanged
  return {
    state,
    admit(commitment) {
      state.commitments.set(commitment, 'live');
    },
    reissue(authorization, ceremony, now) {
      if (authorization?.kind !== 'recovery-authorization-input') {
        return { ok: false, reason: 'not-an-authorization-input' }; // model guard
      }
      const key = `${authorization.revokedRef}|${authorization.epoch}`;
      if (ceremony?.frozen.has(key)) {
        return { ok: false, reason: 'contested-recovery' }; // frozen: challenge route owns it
      }
      if (state.commitments.get(authorization.revokedRef) !== 'live') {
        return { ok: false, reason: 'unknown-enrolment' };
      }
      state.commitments.set(authorization.revokedRef, 'revoked');
      state.commitments.set(authorization.newCommitment, 'live');
      state.events.push({ kind: 'revocation', at: now });
      state.events.push({ kind: 'reissuance', at: now });
      return {
        ok: true,
        record: { kind: 'reissuance-record', status: 'live', epoch: authorization.epoch, at: now },
      };
    },
  };
}

// The outcome-interpretability rule, mechanical: only the issuer's reissuance
// record closes the ceremony. An attestation, a bundle of attestations, or an
// authorization input answers NO by name — verifiers MUST NOT read guardian
// attestations as completion evidence (X9 ceremony-as-trust-task rule).
export function completionEvidence(artifact) {
  if (artifact?.kind === 'reissuance-record') {
    return { ok: true, reason: 'issuer-reissuance-is-the-outcome-artifact' };
  }
  return { ok: false, reason: 'attestation-not-outcome-evidence' };
}

// Structural audit for signer-set hiding: serialize the authorization input and
// assert none of the guardian-side material (human ids, personhood commitments,
// secrets, nullifiers, membershipRefs) appears in it. The checkable form of
// "the issuer sees a threshold met, not who vouched" (X9 §2.4 against-whom).
export function auditSignerSetHidden(authorization, guardianMaterial) {
  const s = canonicalize(authorization);
  const offending = guardianMaterial.filter((m) => s.includes(m));
  return { ok: offending.length === 0, offending };
}

// ============================================================================
// M3 — the guardian clock row (§22.1 extension; §22.2 enforced)
// ============================================================================
// Additive to rotation's CLOCKS: guardian attestations get their OWN epoch.
// touchedBy gains 're-affirmation' — the recurring human ceremony that renews
// guardianship (usability cost stated in NOTES; lapse MUST be surfaced, §6.8).
export const GUARDIAN_CLOCKS = [
  {
    clock: 'guardian-attestation-epoch',
    family: 'certification',
    touchedBy: ['catastrophic', 're-affirmation'],
    bound: 'guardian epoch — guardianship expires unless re-affirmed (§22.2); a stale set cannot attest a live recovery',
  },
];

// §22.2 validator: "permanent" or "unbounded" MUST NOT be an implicit default —
// a lifelong guardian is exactly such a default (X9 for-how-long row).
export function validateGuardianClocks(table) {
  const failures = [];
  const touchers = new Set(['routine', 'catastrophic', 're-affirmation', 'neither']);
  for (const row of table) {
    if (!row.bound || /\bunbounded\b|\bpermanent\b/i.test(row.bound)) {
      failures.push(`unbounded-clock:${row.clock}`);
    }
    if (row.family !== 'certification' && row.family !== 'erosion') {
      failures.push(`unknown-clock-family:${row.clock}`);
    }
    const t = Array.isArray(row.touchedBy) ? row.touchedBy : [row.touchedBy];
    if (t.length === 0 || t.some((x) => !touchers.has(x))) {
      failures.push(`unknown-clock-toucher:${row.clock}`);
    }
  }
  return { ok: failures.length === 0, failures };
}

export { H, descriptorDigest };
