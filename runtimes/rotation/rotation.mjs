// Recovery and rotation without correlators — X5 as a runnable reference.
//
// Implements the X5 exploration's two-case split as a reference model (like
// runtimes 01/07: the ALGEBRA, not the circuit):
//
//   ROUTINE epoch rotation   — holder-side, one-way domain-separated derivation
//                              from a master secret. Never touches the issuer,
//                              never touches the biometric.
//   CATASTROPHIC recovery    — issuer-blind replacement: revoke + fresh enrol,
//                              deduplicated by the biometric matcher (not by a
//                              stored old→new link), rate-limited by a
//                              recovery-domain nullifier (§13.4, §6.5).
//
// The two cases NEVER share a mechanism (X5: "a profile that routes routine
// rotation through re-enrolment has built a periodic biometric correlator into
// its lifecycle").
//
// ADDITIVE deviation from X5's M2 wording: the design doc says "add s_epoch to
// runtime 01". The lab rule is additive — rt 01 is a fixtures dependency and
// byte-stable, so the derivation layer lives HERE and imports rt 01 unchanged.
// See NOTES.md.

import { enrol, nullifier, H, ContextRegistry } from '../01-uniqueness-nullifier/src/nullifier.mjs';
import { descriptorDigest } from '../canonical/canonical.mjs';

// --- domains -----------------------------------------------------------------
export const DOMAIN_EPOCH_SECRET = 'dtg-zkp/epoch-secret/v0';
export const DOMAIN_EPOCH_COMMIT = 'dtg-zkp/epoch-commit/v0';
export const DOMAIN_TEMPLATE = 'dtg-zkp/biometric-template/v0';
export const DOMAIN_RECOVERY_SECRET = 'dtg-zkp/recovery-secret/v0';
export const DOMAIN_ENROL_INSTANCE = 'dtg-zkp/enrol-instance/v0';

// ============================================================================
// ROUTINE — hierarchical epoch derivation (X5 M2; pools-lineage discipline)
// ============================================================================

// One-way, domain-separated: knowing s_epoch reveals nothing about s_master or
// about any other epoch's secret. Epoch rollover (§5.8) rotates the nullifier
// clock WITHOUT touching the enrolment-root cryptoperiod (§5.10) — the two
// clocks are separate by construction (§22.1).
export function deriveEpochSecret(masterSecret, epochId) {
  return H(DOMAIN_EPOCH_SECRET, masterSecret, epochId);
}

// The per-context pseudonym for an epoch: rt 01's nullifier over the DERIVED
// secret. P4 (self-Sybil rejection) holds within each epoch; across epochs the
// nullifiers share no derivable relation without the master.
export function epochNullifier(masterSecret, epochId, context) {
  return nullifier(deriveEpochSecret(masterSecret, epochId), context);
}

// Descent commitment. The holder publishes commitEpoch(master, e) for epoch e;
// a verifier-side check confirms a presented epoch secret is the one committed
// — consuming ONLY the commitment + epoch + candidate secret, never the master.
// (Model level: the real construction proves s_epoch = H(master, e) descends
// from the ENROLLED commitment in zero knowledge; here the commitment binds the
// derived secret, and the derivation itself is only reachable through
// deriveEpochSecret, which requires the master as input.)
export function commitEpoch(masterSecret, epochId) {
  return H(DOMAIN_EPOCH_COMMIT, deriveEpochSecret(masterSecret, epochId), epochId);
}

export function checkDescent(commitment, epochId, candidateEpochSecret) {
  if (commitment === H(DOMAIN_EPOCH_COMMIT, candidateEpochSecret, epochId)) {
    return { ok: true };
  }
  return { ok: false, reason: 'epoch-descent-mismatch' };
}

// ============================================================================
// CATASTROPHIC — issuer-blind replacement (X5 pattern 1 + 2; M3)
// ============================================================================

// The modelled issuer set. Three flat tables, NO composite records: a stored
// (oldCommitment, newCommitment) pair would be exactly the "reusable
// enrolment-root identifier" §6.6 prohibits. What prevents two live enrolments
// is the biometric dedup matcher (the templates table), not a link.
//
//   commitments : commitment -> 'live' | 'revoked'   (§10.1 status semantics)
//   templates   : biometricTemplate -> 'live' | 'released'  (the dedup matcher)
//   events      : { kind, at }  — the issuer's OBSERVABLE timing view. Records
//                 carry no commitments; the revocation→enrolment timing
//                 correlation is the residual X4-class observable (NOTES M4).
export function createIssuer() {
  return { commitments: new Map(), templates: new Map(), events: [] };
}

// The dedup matcher, modelled deterministically: one human -> one template.
export function biometricTemplate(humanId) {
  return H(DOMAIN_TEMPLATE, humanId);
}

// Fresh enrolment through the issuer. rt 01's enrol() is deterministic per
// humanId (it models "biometric -> one secret"); a REPLACEMENT enrolment must
// yield a fresh secret, so we seed rt 01 with a per-instance value (modelling
// issuer-side entropy at enrolment) — rt 01 itself stays untouched.
export function issuerEnrol(issuer, humanId, enrolmentNonce, now) {
  const t = biometricTemplate(humanId);
  if (issuer.templates.get(t) === 'live') {
    // The dedup matcher — not any stored link — catches a second live
    // enrolment by the same human (X5 pattern 1's whole burden).
    return { admitted: false, reason: 'duplicate-live-enrolment' };
  }
  const id = enrol(H(DOMAIN_ENROL_INSTANCE, humanId, enrolmentNonce));
  issuer.commitments.set(id.commitment, 'live');
  issuer.templates.set(t, 'live');
  issuer.events.push({ kind: 'enrolment', at: now });
  return { admitted: true, secret: id.secret, blinding: id.blinding, commitment: id.commitment };
}

// The recovery-domain nullifier input: stable per HUMAN (biometric-derived),
// not per secret — that is what makes repeated recovery reuse-detectable even
// though the enrolled secret changed (§5.12 alone cannot see it: a recovered
// person holds a *different* secret).
export function recoverySecretInput(humanId) {
  return H(DOMAIN_RECOVERY_SECRET, biometricTemplate(humanId));
}

// The recovery context is a GOVERNED §6.2 descriptor (X5 M3), never an opaque
// label. Its epoch field is the recovery epoch: a new epoch -> new digest ->
// fresh registry; within one epoch the rate limit holds (§6.5: rate/count
// thresholds are intentional in-context linkage).
export function makeRecoveryDescriptor(recoveryEpoch) {
  return {
    protocol: 'dtg-zkp/0.1',
    profile: 'epp/1',
    contextAuthority: 'authority:recovery-governance',
    contextPolicy: 'policy:recovery/1',
    purpose: 'purpose:enrolment-recovery',
    scope: 'scope:credential-replacement',
    verifierSet: 'issuer-set:accredited',
    epoch: recoveryEpoch,
    epochPolicy: 'rollover:recovery-epoch',
    nullifierVersion: 'dtg-zkp/nullifier/v0',
    retentionPolicy: 'retention:recovery-epoch-bounded',
  };
}

// One ContextRegistry per recovery context digest — the recovery domain's own
// verifier-side state, epoch-bounded like any other nullifier state (§22.2).
export function createRecoveryDomain() {
  return new Map(); // contextDigest -> ContextRegistry
}

// Issuer-blind replacement. Order matters:
//   1. rate-limit via the recovery-domain nullifier (no state change if it
//      fires — a k-th recovery in the same recovery epoch is refused);
//   2. revoke the old commitment (status change ONLY — no old→new pair is
//      ever written) and release the dedup template (the human is present;
//      the biometric MATCH selects the template row, not a stored link);
//   3. fresh enrolment (dedup admits because the template was released).
// The issuer learns "someone recovered" — never who replaced whom.
export function recover({ registry, recoveryDomain, oldCommitment, humanId, recoveryDescriptor, enrolmentNonce, now }) {
  const issuer = registry; // the modelled issuer set

  // 1. recovery-domain nullifier (X5 pattern 2 bounds pattern 1's dedup dependency)
  const ctx = descriptorDigest(recoveryDescriptor);
  if (!recoveryDomain.has(ctx)) recoveryDomain.set(ctx, new ContextRegistry(ctx));
  const n = nullifier(recoverySecretInput(humanId), ctx);
  const gate = recoveryDomain.get(ctx).present(n);
  if (!gate.admitted) {
    return { recovered: false, reason: 'recovery-rate-exceeded' };
  }

  // 2. revoke old (status change, §10.1 semantics) + release the template row
  if (!issuer.commitments.has(oldCommitment)) {
    return { recovered: false, reason: 'unknown-enrolment' };
  }
  issuer.commitments.set(oldCommitment, 'revoked');
  issuer.templates.set(biometricTemplate(humanId), 'released');
  issuer.events.push({ kind: 'revocation', at: now });

  // 3. fresh enrolment — biometric dedup, not a link, guards duplication
  const fresh = issuerEnrol(issuer, humanId, enrolmentNonce, now);
  if (!fresh.admitted) return { recovered: false, reason: fresh.reason };

  return {
    recovered: true,
    commitment: fresh.commitment,
    secret: fresh.secret,
    recoveryNullifier: n,
  };
}

// Structural audit for R5: serialize EVERY record the issuer holds and assert
// no single record references both the old and the new commitment. The state
// is flat maps of atoms by construction, so no record CAN pair them — the
// audit makes that checkable rather than asserted.
export function auditNoLink(issuer, oldCommitment, newCommitment) {
  const records = [
    ...[...issuer.commitments.entries()].map(([k, v]) => `commitment:${k}=${v}`),
    ...[...issuer.templates.entries()].map(([k, v]) => `template:${k}=${v}`),
    ...issuer.events.map((e) => `event:${e.kind}@${e.at}`),
  ];
  const offending = records.filter(
    (r) => r.includes(oldCommitment) && r.includes(newCommitment)
  );
  return { ok: offending.length === 0, offending, records };
}

// ============================================================================
// M1 — the §22.1 clock table for this construction (X5 M1)
// ============================================================================
// family: certification = a governed validity period someone grants and can
//                         renew (X6 language);
//         erosion       = a horizon that decays regardless of governance.
// touchedBy: which X5 case moves the clock — 'routine' | 'catastrophic' |
//            'neither'. The load-bearing rows: routine rotation touches ONLY
//            the nullifier epoch; only catastrophic recovery touches the
//            enrolment-root cryptoperiod. Different clocks by construction.
export const CLOCKS = [
  { clock: 'proof-transcript lifetime',      family: 'certification', touchedBy: 'neither',      bound: 'single presentation (§15.2 expiry field)' },
  { clock: 'challenge/session lifetime',     family: 'certification', touchedBy: 'neither',      bound: 'session policy expiry' },
  { clock: 'attestation validity',           family: 'certification', touchedBy: 'catastrophic', bound: 'issuance-to-expiry; recovery revokes and reissues' },
  { clock: 'status freshness',               family: 'certification', touchedBy: 'catastrophic', bound: 'snapshot rule (§12.4); revocation must propagate within it' },
  { clock: 'nullifier epoch',                family: 'certification', touchedBy: 'routine',      bound: 'epochPolicy rollover (§5.8) — the clock routine rotation turns' },
  { clock: 'enrolment-root cryptoperiod',    family: 'certification', touchedBy: 'catastrophic', bound: '§5.10 authorised lifetime — only recovery re-establishes the root' },
  { clock: 'recovery-domain retention',      family: 'certification', touchedBy: 'catastrophic', bound: 'recovery epoch (§22.2: epoch-bounded like any nullifier state)' },
  { clock: 'policy and accreditation validity', family: 'certification', touchedBy: 'neither',   bound: 'governance review cycle' },
  { clock: 'log retention',                  family: 'certification', touchedBy: 'neither',      bound: 'retention policy identifier (§6.2 retentionPolicy)' },
  { clock: 'proof-system security horizon',  family: 'erosion',       touchedBy: 'neither',      bound: 'cryptanalysis horizon — migration is §22.3, out of X5 scope' },
  { clock: 'biometric assurance horizon',    family: 'erosion',       touchedBy: 'catastrophic', bound: 'biometric threat-evolution horizon — recovery re-enters enrolment under the CURRENT horizon' },
];

// §22.2 validator: "permanent" or "unbounded" is non-conformant by default.
export function validateClocks(table) {
  const failures = [];
  for (const row of table) {
    if (!row.bound || /\bunbounded\b|\bpermanent\b/i.test(row.bound)) {
      failures.push(`unbounded-clock:${row.clock}`);
    }
    if (row.family !== 'certification' && row.family !== 'erosion') {
      failures.push(`unknown-clock-family:${row.clock}`);
    }
    if (!['routine', 'catastrophic', 'neither'].includes(row.touchedBy)) {
      failures.push(`unknown-clock-toucher:${row.clock}`);
    }
  }
  return { ok: failures.length === 0, failures };
}
