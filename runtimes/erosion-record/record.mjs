// X6 B2 — the erosion-aware residual-risk record.
//
// Extends the decision doc's Appendix B compact boundary-record shape (§26
// residual-risk record) with the X6 two-family `for_how_long` block:
//   certification — cliffs an authority sets and can renew (§10.6 stays);
//   erosion       — accumulating observables (§19/§20 surfaces feeding B_t),
//                   a monitoring signal, an estimated horizon, and a re-base
//                   trigger (§22.3 migration / re-enrolment).
//
// HONESTY RULE (the whole point of X6): H(X | B_t) is not measurable in
// deployment. An estimated horizon's basis may be 'declared' or 'estimated'
// — NEVER 'measured'. The structure makes overclaiming a validation failure,
// not a review comment.
//
// §22.2 reading: an erosion clock without a re-base trigger is the
// "permanent or unbounded" default the doc prohibits — no erosion clock may
// be left unwatched.

import { canonicalize } from '../canonical/canonical.mjs';

export const HORIZON_BASES = ['declared', 'estimated']; // 'measured' is banned

// Appendix B top-level shape, §2.4 parameters called out separately below.
const REQUIRED_FIELDS = [
  'boundary_id',
  'predicate',
  'profile',
  'statement_established',
  'negative_meaning',
  'accountable_parties',
  'redress',
];

// §2.4 — every material claim states against whom / for how long /
// alongside what; a claim missing one "is not yet a testable claim".
const CLAIM_PARAMETERS = ['against_whom', 'for_how_long', 'alongside_what'];

const isNonEmptyString = (v) => typeof v === 'string' && v.length > 0;
const isNonEmptyArray = (v) => Array.isArray(v) && v.length > 0;
const isPlainObject = (v) =>
  v !== null && typeof v === 'object' && !Array.isArray(v);

function validateErosionEntry(entry, i, failures) {
  const at = `erosion[${i}]`;
  if (!isPlainObject(entry)) {
    failures.push(`invalid-erosion-entry:${at}`);
    return;
  }
  const hasObservables = isNonEmptyArray(entry.accumulatingObservables);

  // (e) rate-not-cliff: a bare expiry date with no named observables is a
  // cliff wearing an erosion label — §5.9 is a rate, not another expiry.
  if (!hasObservables) {
    if (entry.expiry !== undefined) failures.push('cliff-only-erosion-claim');
    else failures.push(`erosion-missing-observables:${at}`);
  }

  // (b) §22.2 — an erosion clock without a re-base trigger is the unbounded
  // default the doc prohibits: nobody renews it, so somebody must watch it.
  if (!isNonEmptyString(entry.rebaseTrigger)) {
    failures.push('erosion-clock-unwatched');
  }

  if (!isNonEmptyString(entry.monitoringSignal)) {
    failures.push(`erosion-missing-monitoring-signal:${at}`);
  }

  // (c) the X6 honesty rule.
  const h = entry.estimatedHorizon;
  if (!isPlainObject(h) || h.value === undefined || h.value === null) {
    failures.push(`erosion-missing-horizon:${at}`);
  } else if (h.basis === 'measured') {
    failures.push('overclaimed-measurement');
  } else if (!HORIZON_BASES.includes(h.basis)) {
    failures.push(`invalid-horizon-basis:${at}`);
  }
}

export function validateRecord(record) {
  const failures = [];
  if (!isPlainObject(record)) {
    return { ok: false, failures: ['invalid-record:not-an-object'] };
  }

  for (const f of REQUIRED_FIELDS) {
    const v = record[f];
    const present = Array.isArray(v)
      ? v.length > 0
      : isPlainObject(v)
        ? Object.keys(v).length > 0
        : isNonEmptyString(v);
    if (!present) failures.push(`missing-field:${f}`);
  }

  // (d) §2.4 completeness — the three claim parameters.
  for (const p of CLAIM_PARAMETERS) {
    const v = record[p];
    const present = Array.isArray(v)
      ? v.length > 0
      : isPlainObject(v)
        ? Object.keys(v).length > 0
        : false;
    if (!present) failures.push(`claim-missing-parameter:${p}`);
  }

  // (a) both clock families, always.
  const fhl = record.for_how_long;
  if (isPlainObject(fhl)) {
    if (
      !isPlainObject(fhl.certification) ||
      !isPlainObject(fhl.certification.cliffs) ||
      Object.keys(fhl.certification.cliffs).length === 0
    ) {
      failures.push('missing-clock-family:certification');
    }
    const erosion = Array.isArray(fhl.erosion)
      ? fhl.erosion
      : isPlainObject(fhl.erosion)
        ? [fhl.erosion] // a single entry is accepted and normalised
        : null;
    if (!isNonEmptyArray(erosion)) {
      failures.push('missing-clock-family:erosion');
    } else {
      erosion.forEach((e, i) => validateErosionEntry(e, i, failures));
    }
  }

  return { ok: failures.length === 0, failures };
}

// Canonical serialization (sorted keys, deterministic) — records compare and
// diff byte-for-byte. Throws on an invalid record; a record that cannot state
// its clocks honestly does not get a canonical form.
export function serializeRecord(record) {
  const v = validateRecord(record);
  if (!v.ok) throw new Error(`invalid-record:${v.failures.join(',')}`);
  return canonicalize(record);
}
