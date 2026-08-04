// The log-field register — X4 M3, as data + validator.
//
// §6.6's last row: "shared logs, telemetry, or analytics that restore the
// correlation the proof prevents" is a prohibited linkage channel. The control
// is a register analogous to the §18.1 schema field register: every field a
// deployment logs — at verifier, mediator, registry, wallet, auditor — is
// recorded with purpose, retention, cardinality, correlation risk, and the
// responsible authority (§23's accountability route for excess correlation is
// "the party controlling the correlating surface").
//
// A field is admissible only if it is IN the register; a field on the
// prohibited list is rejected by name even if someone registers it. Both
// rejections are named — 'prohibited-log-field:<name>' and
// 'unregistered-log-field:<name>' — X1-register candidates for a future
// fixtures v2 (this lane does not edit the fixtures lane).

// --- prohibited by default (X4 telemetry-governance list) --------------------
export const PROHIBITED = Object.freeze([
  Object.freeze({
    field: 'exactPresentationTimestamp',
    why: 'exact event timing restores the correlation coarse timing prevents — coarsen to epoch/grid',
    anchor: '§6.6 (exact issuance timestamps instinct extended to events), §20, §10.4',
  }),
  Object.freeze({
    field: 'holderDeviceId',
    why: 'stable device identifier — a cross-context correlator',
    anchor: '§6.6 (stable holder identifier), §19 (device and network identifiers)',
  }),
  Object.freeze({
    field: 'stableHolderId',
    why: 'stable holder identifier — the exact linkage the proof prevents',
    anchor: '§6.6',
  }),
  Object.freeze({
    field: 'retryCountByPseudonym',
    why: 'retry counts keyed to a pseudonym — a behavioural fingerprint per subject',
    anchor: '§10.4 (retry count and failure mode), §20',
  }),
  Object.freeze({
    field: 'proofSizeBytes',
    why: 'proof size is a shape fingerprint; the tier pads it — logging it un-pads it',
    anchor: '§10.4, §19 (proof size, encoding, and timing fingerprints)',
  }),
  Object.freeze({
    field: 'internalReasonCode',
    why: 'reason codes beyond the uniform external surface — holder-routed only (M-ERROR)',
    anchor: '§19 (error codes and diagnostics), X4 M-ERROR',
  }),
  Object.freeze({
    field: 'mediatorSessionId',
    why: 'mediator session identifiers that outlive the session violate non-retention',
    anchor: '§21.2 (non-retention and deletion requirements), §6.6 (common fallback identifiers)',
  }),
]);

// --- the compliant register --------------------------------------------------
// entries: { field, purpose, retention, cardinality, correlationRisk, authority }
const entry = (field, purpose, retention, cardinality, correlationRisk, authority) =>
  Object.freeze({ field, purpose, retention, cardinality, correlationRisk, authority });

export const REGISTER = Object.freeze([
  entry(
    'presentationEpoch',
    'coarse occurrence accounting (which epoch, never which tick)',
    'epoch + 1 rollover',
    'low — epoch grid',
    'low by construction: coarse timing is declared residue, not a correlator',
    'verifier'
  ),
  entry(
    'bundleId',
    'which REGISTERED bundle was requested (governed vocabulary, X3)',
    'session',
    'low — registry-sized',
    'low: large anonymity set per bundle is the registry design goal',
    'verifier'
  ),
  entry(
    'profileVersion',
    'which profile version governed the presentation (shape/grid constants)',
    'profile lifetime',
    'very low — one per deployment cohort',
    'low unless rare variants exist (§6.6 rare-variant row — monitor)',
    'verifier'
  ),
  entry(
    'rootEpoch',
    'which registry root epoch the acceptance was evaluated against (§12.4)',
    'root validity window + audit horizon',
    'low — epoch grid',
    'low: cadence-scoped, decorrelated from shows by M-STATUS',
    'registry-operator'
  ),
  entry(
    'outcome',
    'accepted | rejected — the one-bit external result',
    'audit horizon',
    '2',
    'low alone; assessed alongside timing per §10.4 combination rule',
    'verifier'
  ),
  entry(
    'retryWithinBudget',
    'boolean: was the within-budget retry path exercised (never a count, never keyed)',
    'session',
    '2',
    'low: budget-uniform by M-RETRY; a count keyed to a pseudonym is PROHIBITED',
    'verifier'
  ),
  entry(
    'externalErrorSurface',
    'the uniform external failure string (cardinality 1 is the M-ERROR invariant)',
    'session',
    '1 — uniform',
    'none while cardinality stays 1; growth IS the error-surface-nonuniform failure',
    'verifier'
  ),
]);

const PROHIBITED_NAMES = new Set(PROHIBITED.map((p) => p.field));
const REGISTERED_NAMES = new Set(REGISTER.map((e) => e.field));

// --- validator ---------------------------------------------------------------
// fields: the list of field names a deployment intends to log.
export function validateLogSchema(fields) {
  const failures = [];
  for (const f of fields) {
    if (PROHIBITED_NAMES.has(f)) failures.push(`prohibited-log-field:${f}`);
    else if (!REGISTERED_NAMES.has(f)) failures.push(`unregistered-log-field:${f}`);
  }
  return { ok: failures.length === 0, failures };
}
