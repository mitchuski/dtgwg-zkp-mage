// Fixture schema — the vector shape and its validation. (X1 milestone M2.)
//
// One vector = one JSON object, the shape the X1 design doc sketches:
//
//   { "fixture":     "PR-UNQ/reject/duplicate-human-in-context/001",
//     "spec":        { "decisionDoc": "0.1.0-draft", "sections": ["§13", "§26.1"] },
//     "claimParams": { "againstWhom": …, "forHowLong": …, "alongsideWhat": … },
//     "inputs":      { …canonical §6.2 / §15.2 encodings + construction inputs… },
//     "expect":      { "outcome": "accept" | "reject" | "lint-fail",
//                      "reason":  …register code, mandatory for non-accept…,
//                      "claimCeiling": …optional narrow restatement… } }
//
// Load-bearing rules, each anchored:
//   - fixture id: <PR-family>/<class>/<reason-or-name>/<nnn>. Families group by
//     predicate (§9 register ids; PR-TGF is this lab's exploration-local id for
//     the runtime-07 trust-graph relations — flagged non-normative in NOTES).
//   - claimParams is REQUIRED (§2.4): a vector without against-whom /
//     for-how-long / alongside-what "is not yet a testable claim" — so it is
//     not yet a fixture either.
//   - a reject or lint-fail vector MUST name a reason from the register
//     (reasons.mjs): deterministic error semantics (§13.6) made comparable.
//   - an accept vector carries NO reason code; its path name (e.g.
//     'first-enrolment') is descriptive, not a register entry.
//   - the path class and expect.outcome must agree; the one asymmetry is the
//     lint class, which holds both must-fail texts (outcome 'lint-fail') and
//     the narrow-language must-PASS text (outcome 'accept') — a lint suite
//     with no passing sample cannot show its patterns are satisfiable.

import { isKnownReason } from './reasons.mjs';

export const SCHEMA_VERSION = 'x1-fixtures/v0';

export const FIXTURE_ID_RE = /^PR-[A-Z]{3}\/(accept|reject|lint)\/[a-z0-9]+(?:-[a-z0-9]+)*\/\d{3}$/;

const OUTCOMES = new Set(['accept', 'reject', 'lint-fail']);
const CLAIM_PARAM_KEYS = ['againstWhom', 'forHowLong', 'alongsideWhat'];
const EXPECT_KEYS = new Set(['outcome', 'reason', 'claimCeiling']);

const isNonEmptyString = (x) => typeof x === 'string' && x.length > 0;
const isPlainObject = (x) => x !== null && typeof x === 'object' && !Array.isArray(x);

// Validate one vector. Returns { ok, errors: [string] } — never throws, so a
// consumer can report every defect in a foreign suite, not just the first.
export function validateVector(v) {
  const errors = [];
  if (!isPlainObject(v)) return { ok: false, errors: ['vector-not-an-object'] };

  // --- fixture id ------------------------------------------------------------
  if (!isNonEmptyString(v.fixture) || !FIXTURE_ID_RE.test(v.fixture)) {
    errors.push(`fixture-id-malformed:${v.fixture}`);
  }
  const cls = isNonEmptyString(v.fixture) ? v.fixture.split('/')[1] : undefined;

  // --- spec pin --------------------------------------------------------------
  if (!isPlainObject(v.spec)) errors.push('spec-missing');
  else {
    if (!isNonEmptyString(v.spec.decisionDoc)) errors.push('spec-decisionDoc-missing');
    if (!Array.isArray(v.spec.sections) || v.spec.sections.length === 0 ||
        !v.spec.sections.every(isNonEmptyString)) {
      errors.push('spec-sections-missing');
    }
  }

  // --- §2.4 claim parameters (mandatory) -------------------------------------
  if (!isPlainObject(v.claimParams)) errors.push('claimParams-missing (§2.4)');
  else {
    for (const k of CLAIM_PARAM_KEYS) {
      if (!isNonEmptyString(v.claimParams[k])) errors.push(`claimParams-${k}-missing (§2.4)`);
    }
    for (const k of Object.keys(v.claimParams)) {
      if (!CLAIM_PARAM_KEYS.includes(k)) errors.push(`claimParams-unknown-key:${k}`);
    }
  }

  // --- inputs ----------------------------------------------------------------
  if (!isPlainObject(v.inputs) || Object.keys(v.inputs).length === 0) {
    errors.push('inputs-missing');
  }

  // --- expected outcome ------------------------------------------------------
  if (!isPlainObject(v.expect)) errors.push('expect-missing');
  else {
    if (!OUTCOMES.has(v.expect.outcome)) errors.push(`expect-outcome-invalid:${v.expect.outcome}`);
    for (const k of Object.keys(v.expect)) {
      if (!EXPECT_KEYS.has(k)) errors.push(`expect-unknown-key:${k}`);
    }
    // class/outcome agreement
    if (cls === 'accept' && v.expect.outcome !== 'accept') errors.push('class-outcome-mismatch:accept');
    if (cls === 'reject' && v.expect.outcome !== 'reject') errors.push('class-outcome-mismatch:reject');
    if (cls === 'lint' && v.expect.outcome !== 'lint-fail' && v.expect.outcome !== 'accept') {
      errors.push('class-outcome-mismatch:lint');
    }
    // reason discipline. Register v2: isKnownReason accepts exact codes AND
    // parameterized family matches (e.g. 'retention-violation:transcriptDigest'
    // matches the 'retention-violation:' family entry) — a vector may therefore
    // carry a parameterized reason and still be a conformance vector.
    if (v.expect.outcome === 'accept') {
      if (v.expect.reason !== undefined) errors.push('accept-vector-must-not-carry-reason-code');
    } else {
      if (!isNonEmptyString(v.expect.reason)) errors.push('reject-vector-missing-reason');
      else if (!isKnownReason(v.expect.reason)) {
        errors.push(`reason-not-in-register:${v.expect.reason}`);
      }
    }
  }

  return { ok: errors.length === 0, errors };
}

// Validate the manifest against its vectors (paths and count must agree —
// a manifest that undercounts is a silent cap on the suite).
export function validateManifest(manifest, vectorPaths) {
  const errors = [];
  if (!isPlainObject(manifest)) return { ok: false, errors: ['manifest-not-an-object'] };
  if (manifest.formatVersion !== SCHEMA_VERSION) errors.push(`manifest-formatVersion:${manifest.formatVersion}`);
  if (!isNonEmptyString(manifest.decisionDoc)) errors.push('manifest-decisionDoc-missing');
  if (!isNonEmptyString(manifest.reasonRegister)) errors.push('manifest-reasonRegister-missing');
  const listed = Object.values(manifest.families ?? {}).flat().sort();
  const found = [...vectorPaths].sort();
  if (manifest.vectorCount !== listed.length) errors.push('manifest-vectorCount-mismatch');
  if (JSON.stringify(listed) !== JSON.stringify(found)) errors.push('manifest-paths-diverge-from-vectors');
  return { ok: errors.length === 0, errors };
}

export function familyOf(v) {
  return v.fixture.split('/')[0];
}
export function classOf(v) {
  return v.fixture.split('/')[1];
}
