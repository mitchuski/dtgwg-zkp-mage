// X6 B1 — the §22.1 ten-clock sort as DATA.
//
// Source: explorations/X6-assurance-horizons-erosion-clocks.md (research root),
// table "The ten clocks of §22.1, sorted". Two families (PVM V6 two-clock
// thesis, C82 / WP-07 Cor 5.4b lineage):
//   certification — an authority certifies a value and can re-certify it;
//   erosion       — background accumulation nobody can renew, only re-base.
//
// The §5.9 assurance horizon is the minimum over the erosion rows — the
// envelope clock. Zero-dep, offline, deterministic.

export const FAMILIES = ['certification', 'erosion'];

export const CLOCKS = [
  {
    clock: 'proof-transcript-lifetime',
    family: 'certification',
    mover: 'profile',
    renewalOrRebase: 'expires per transcript (§15)',
  },
  {
    clock: 'challenge-session-lifetime',
    family: 'certification',
    mover: 'verifier policy',
    renewalOrRebase: 'new session',
  },
  {
    clock: 'attestation-validity',
    family: 'certification',
    mover: 'issuer',
    renewalOrRebase: 're-issuance',
  },
  {
    clock: 'status-freshness',
    family: 'certification',
    mover: 'status authority',
    renewalOrRebase: 'refresh / snapshot (§12.4)',
  },
  {
    clock: 'nullifier-epoch',
    family: 'certification',
    mover: 'context authority (§6.7)',
    renewalOrRebase: 'governed rollover (§5.8)',
  },
  {
    clock: 'enrolment-root-cryptoperiod',
    family: 'certification',
    mover: 'issuer/governance (§5.10)',
    renewalOrRebase: 'rotation, migration (§22.3)',
  },
  {
    clock: 'policy-accreditation-validity',
    family: 'certification',
    mover: 'governance authority',
    renewalOrRebase: 're-accreditation',
  },
  {
    clock: 'log-retention',
    family: 'erosion',
    mover: 'retained observables accrue into B_t',
    renewalOrRebase: 'deletion/segregation; §20 minimisation slows the rate',
  },
  {
    clock: 'proof-system-security-horizon',
    family: 'erosion',
    mover: 'cryptanalytic background accumulates',
    renewalOrRebase: 're-base by migration (§22.3)',
    // X6 honesty note: erosion-family OPERATIONALLY (no renewing authority;
    // only migration re-bases it), but the driver is computational advance,
    // whereas the PVM R(t) drift is strictly informational.
    driver: 'computational',
    bridgeCaveat: true,
    caveat:
      'erosion-family operationally (nobody renews it; only §22.3 migration ' +
      're-bases it), but its driver is computational advance, not the ' +
      'informational accumulation that drives the PVM erosion ratio R(t) — ' +
      'the bridge is structural, not an identity',
  },
  {
    clock: 'biometric-assurance-horizon',
    family: 'erosion',
    mover: 'biometric threat evolution (§5.9)',
    renewalOrRebase: 're-base by re-enrolment under stronger policy',
  },
];

export const CLOCK_NAMES = CLOCKS.map((c) => c.clock);

// --- validator ---------------------------------------------------------------
// Exactly the ten §22.1 clocks, each carrying a valid family.
//   missing-clock:<name>  — a §22.1 clock is absent from the sort
//   unsorted-clock:<name> — a clock is present but has no (or an invalid) family
//   unknown-clock:<name>  — a clock not in §22.1 (the list is closed)
export function validateSort(clocks) {
  const failures = [];
  const byName = new Map();
  for (const c of clocks ?? []) {
    if (!CLOCK_NAMES.includes(c?.clock)) {
      failures.push(`unknown-clock:${c?.clock}`);
      continue;
    }
    byName.set(c.clock, c);
  }
  for (const name of CLOCK_NAMES) {
    const c = byName.get(name);
    if (!c) {
      failures.push(`missing-clock:${name}`);
    } else if (!FAMILIES.includes(c.family)) {
      failures.push(`unsorted-clock:${name}`);
    }
  }
  return { ok: failures.length === 0, failures };
}

// --- honesty surface ---------------------------------------------------------
// Every bridge caveat in the sort, surfaced by name. The proof-system
// security-horizon row carries the X6 honesty note (driver: computational).
export function getCaveats(clocks = CLOCKS) {
  return (clocks ?? [])
    .filter((c) => c?.bridgeCaveat === true)
    .map((c) => ({ clock: c.clock, driver: c.driver, caveat: c.caveat }));
}
