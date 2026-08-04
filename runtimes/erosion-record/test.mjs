// Property tests for the erosion-record reference (X6: B1 clock sort, B2
// record format, B3 PR-UNQ worked example). Run: node test.mjs — exits
// nonzero on any failure. Zero-dep, offline, deterministic (no Date.now).

import { CLOCKS, validateSort, getCaveats } from './clocks.mjs';
import { validateRecord, serializeRecord } from './record.mjs';
import { PR_UNQ_EROSION_RECORD } from './example.mjs';

let passCount = 0,
  failCount = 0;
const ok = (name, cond, detail = '') => {
  if (cond) {
    passCount++;
    console.log(`  ok  ${name}`);
  } else {
    failCount++;
    console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
  }
};

const clone = (v) => JSON.parse(JSON.stringify(v));

console.log('\nerosion-record — X6 properties\n');

// ---------------------------------------------------------------------------
// E1 — the ten-clock sort validates; removing a clock or a family fails by
// name.
// ---------------------------------------------------------------------------
{
  const base = validateSort(CLOCKS);
  const removed = clone(CLOCKS).filter((c) => c.clock !== 'log-retention');
  const rMissing = validateSort(removed);
  const unfamilied = clone(CLOCKS);
  delete unfamilied.find((c) => c.clock === 'biometric-assurance-horizon')
    .family;
  const rUnsorted = validateSort(unfamilied);
  ok(
    'E1 ten-clock sort validates; missing-clock + unsorted-clock fail by name',
    base.ok &&
      CLOCKS.length === 10 &&
      !rMissing.ok &&
      rMissing.failures.includes('missing-clock:log-retention') &&
      !rUnsorted.ok &&
      rUnsorted.failures.includes('unsorted-clock:biometric-assurance-horizon'),
    JSON.stringify({ base, rMissing, rUnsorted })
  );
}

// ---------------------------------------------------------------------------
// E2 — the PR-UNQ example record validates.
// ---------------------------------------------------------------------------
{
  const r = validateRecord(PR_UNQ_EROSION_RECORD);
  ok('E2 PR-UNQ worked example validates', r.ok, r.failures.join(','));
}

// ---------------------------------------------------------------------------
// E3 — an erosion entry without a rebaseTrigger is the §22.2 unbounded
// failure: erosion-clock-unwatched.
// ---------------------------------------------------------------------------
{
  const bad = clone(PR_UNQ_EROSION_RECORD);
  delete bad.for_how_long.erosion[0].rebaseTrigger;
  const r = validateRecord(bad);
  ok(
    'E3 erosion entry without rebaseTrigger -> erosion-clock-unwatched',
    !r.ok && r.failures.includes('erosion-clock-unwatched'),
    r.failures.join(',')
  );
}

// ---------------------------------------------------------------------------
// E4 — basis 'measured' is structurally impossible: overclaimed-measurement.
// H(X | B_t) is not measurable in deployment.
// ---------------------------------------------------------------------------
{
  const bad = clone(PR_UNQ_EROSION_RECORD);
  bad.for_how_long.erosion[0].estimatedHorizon.basis = 'measured';
  const r = validateRecord(bad);
  ok(
    "E4 basis 'measured' -> overclaimed-measurement",
    !r.ok && r.failures.includes('overclaimed-measurement'),
    r.failures.join(',')
  );
}

// ---------------------------------------------------------------------------
// E5 — §2.4: a claim missing "for how long" is not yet a testable claim.
// ---------------------------------------------------------------------------
{
  const bad = clone(PR_UNQ_EROSION_RECORD);
  delete bad.for_how_long;
  const r = validateRecord(bad);
  ok(
    'E5 missing §2.4 parameter -> claim-missing-parameter:for_how_long',
    !r.ok && r.failures.includes('claim-missing-parameter:for_how_long'),
    r.failures.join(',')
  );
}

// ---------------------------------------------------------------------------
// E6 — rate-not-cliff: an erosion entry that is only an expiry date with no
// named observables is a cliff wearing an erosion label.
// ---------------------------------------------------------------------------
{
  const bad = clone(PR_UNQ_EROSION_RECORD);
  bad.for_how_long.erosion[0] = {
    clock: 'log-retention',
    expiry: '2028-07-18',
    monitoringSignal: 'none',
    estimatedHorizon: { value: '2 years', basis: 'declared' },
    rebaseTrigger: 'epoch rollover',
  };
  const r = validateRecord(bad);
  ok(
    'E6 cliff-only erosion claim (expiry, no observables) -> cliff-only-erosion-claim',
    !r.ok && r.failures.includes('cliff-only-erosion-claim'),
    r.failures.join(',')
  );
}

// ---------------------------------------------------------------------------
// E7 — serialization is canonical and deterministic: two serializations are
// byte-identical, and key order in the source object does not matter.
// ---------------------------------------------------------------------------
{
  const a = serializeRecord(PR_UNQ_EROSION_RECORD);
  const b = serializeRecord(PR_UNQ_EROSION_RECORD);

  // Rebuild the record with every object's keys in reverse insertion order.
  const reversed = (v) => {
    if (Array.isArray(v)) return v.map(reversed);
    if (v !== null && typeof v === 'object') {
      const out = {};
      for (const k of Object.keys(v).reverse()) out[k] = reversed(v[k]);
      return out;
    }
    return v;
  };
  const c = serializeRecord(reversed(PR_UNQ_EROSION_RECORD));
  ok(
    'E7 canonical serialization: repeat-identical and key-order independent',
    a === b && a === c && a.length > 0
  );
}

// ---------------------------------------------------------------------------
// E8 — the honesty flag: the proof-system security-horizon row carries the
// bridgeCaveat and getCaveats() surfaces it. The bridge is structural, not
// an identity — the caveat must say the driver is computational.
// ---------------------------------------------------------------------------
{
  const row = CLOCKS.find((c) => c.clock === 'proof-system-security-horizon');
  const caveats = getCaveats();
  const surfaced = caveats.find(
    (c) => c.clock === 'proof-system-security-horizon'
  );
  ok(
    'E8 bridgeCaveat on proof-system row, surfaced by getCaveats(), mentions computational',
    row?.bridgeCaveat === true &&
      row?.driver === 'computational' &&
      surfaced !== undefined &&
      typeof surfaced.caveat === 'string' &&
      surfaced.caveat.includes('computational'),
    JSON.stringify(caveats)
  );
}

// ---------------------------------------------------------------------------
console.log(`\nerosion-record: ${passCount}/${passCount + failCount} pass\n`);
if (failCount > 0) process.exit(1);
