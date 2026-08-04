// Per-observer leakage budget — X4 M1, as DATA.
//
// §19 requires an observer-by-observer disclosure analysis; §20 rules the
// narrow claim (unlinkability, not undetectability): even with a PERFECT ZK
// transcript, each observer still sees something per presentation. This module
// is that residue written down, one row per §19 observer, for the MLP and EPP
// presentations, each row carrying its §2.4 three-parameter claim form
// (against whom / for how long / alongside what) — a claim missing one of the
// three "is not yet a testable claim".
//
// The rows assume the quiet-presentation tier's mechanisms hold (M-STATUS,
// M-ERROR, M-SHAPE, M-RETRY, M-BATCH from X4): status served from a local
// mirror on a presentation-independent schedule, one uniform external error
// surface, profile-constant proof shape, on-grid bounded retries. Without the
// tier, every row grows — that delta is what quiet.mjs makes testable.
//
// The observer list is imported, not restated: show-composition's OBSERVERS
// export IS the §19 list. A budget missing an observer row is a NAMED failure
// ('missing-observer-row:<observer>') — no silent rows, in the same spirit as
// the fixtures lane's no-silent-caps rule.

import { OBSERVERS } from '../show-composition/show.mjs';

const CLAIM_PARAMS = ['againstWhom', 'forHowLong', 'alongsideWhat'];

const row = (observer, seesPerPresentation, forHowLong, alongsideWhat) =>
  Object.freeze({
    observer,
    seesPerPresentation: Object.freeze([...seesPerPresentation]),
    claimForm: Object.freeze({
      againstWhom: observer,
      forHowLong,
      alongsideWhat: Object.freeze([...alongsideWhat]),
    }),
  });

// --- MLP: {PR-LIV, PR-ISS, PR-HLD, PR-FRE} — no population dedup, no
// nullifier; nothing outlives the transcript session (X3 joint record).
const MLP_ROWS = [
  row(
    'verifier',
    [
      'presentation-occurrence',
      'coarse-time-on-grid',
      'requested-bundle-id+version',
      'step-up-frequency',
      'uniform-error-surface-only',
      'profile-constant-proof-shape',
      'within-budget-retry-indistinct-from-first-attempt',
    ],
    'session (nothing outlives the transcript)',
    ['transcript fields', 'timing grid', 'padded proof shape', 'log-field register fields']
  ),
  row(
    'issuer',
    ['nothing-per-show (status served from local mirror, M-STATUS)'],
    'root-cache validity window (<= relying policy max root age, §12.4/§22.1)',
    ['scheduled status cadence independent of presentations']
  ),
  row(
    'issuer+verifier-colluding',
    ['presentation-occurrence', 'issuer-class-of-accepted-attestation', 'coarse-time-on-grid'],
    'session (no shared per-show correlator under §6.6)',
    ['issuer-side issuance records', 'verifier-side transcript', 'both log registers jointly']
  ),
  row(
    'multiple-verifiers-colluding',
    ['per-verifier occurrence streams', 'coarse-timing-intersection'],
    'session (no stable cross-verifier correlator in MLP)',
    ['timing-grid coincidence across verifiers', 'shared log processors (§6.6 last row)']
  ),
  row(
    'registry-operator',
    ['scheduled root-fetch cadence only (not which credential, not whether a show occurred)'],
    'root-cache validity window',
    ['lookup schedule decorrelated from presentation events (M-STATUS)']
  ),
  row(
    'accreditation-authority',
    ['nothing-per-show (framework membership checked against mirrored snapshot)'],
    'accreditation snapshot validity window',
    ['batched snapshot refresh traffic']
  ),
  row(
    'mediated-prover',
    [
      'where-used: full event stream (occurrence, timing, verifier, retries) under §21.2 controls',
      'path-switch-never-silent (§21.3) but externally minimised',
    ],
    'session only (§21.2 non-retention; session ids MUST NOT outlive the session)',
    ['§21.2 control set', 'no cross-context identifier (§6.6 common fallback ids prohibited)']
  ),
  row(
    'wallet-or-agent-operator',
    ['full local view: occurrence, bundle, internal reason codes (holder-routed by M-ERROR)'],
    'holder-side retention policy',
    ['holder-routed diagnostic channel — the ONE place detailed reasons land']
  ),
  row(
    'network-observer',
    [
      'endpoint-contact-pattern-on-fixed-cadence',
      'padded-constant packet sizes (M-SHAPE)',
      'coarse-timing-on-grid (M-BATCH)',
    ],
    'profile version lifetime (padding constants pinned per profile)',
    ['padded transport channel', 'status cadence indistinct from idle cadence']
  ),
  row(
    'auditor-or-log-processor',
    ['exactly the log-field register fields, nothing else (§6.6 surface, M3)'],
    'per-field registered retention',
    ['the log-field register (logregister.mjs) — prohibited fields absent']
  ),
  row(
    'malicious-co-resident-app',
    [
      'presentation-occurrence via device signals (network activity, prover CPU burst, step-up UI)',
      'DECLARED RESIDUE — bounded, not eliminated (X4 open question)',
    ],
    'device co-residency period',
    ['OS isolation assumptions — outside this profile, honestly declared']
  ),
];

// --- EPP: MLP + {PR-PER, PR-UNQ} — the nullifier is intentionally linkable
// within the governed context (§2.3 trade curve); its epoch horizon dominates
// the session-lived members (X3 jointDisclosureRecord).
const EPP_DELTAS = Object.freeze({
  verifier: {
    add: ['per-context-nullifier (intentionally linkable within context/scope/purpose/epoch)'],
    forHowLong: 'epoch (nullifier horizon dominates the session-lived members)',
  },
  'issuer+verifier-colluding': {
    add: ['nullifier joinable WITHIN the governed context only (§2.3, §6.6 no global nullifier)'],
    forHowLong: 'epoch within context; session across contexts',
  },
  'multiple-verifiers-colluding': {
    add: ['shared-context verifiers: nullifier links presentations inside that context by design'],
    forHowLong: 'epoch within a shared context; no cross-context correlator (§6.6)',
  },
});

const EPP_ROWS = MLP_ROWS.map((r) => {
  const d = EPP_DELTAS[r.observer];
  if (!d) return r;
  return row(
    r.observer,
    [...r.seesPerPresentation, ...d.add],
    d.forHowLong ?? r.claimForm.forHowLong,
    r.claimForm.alongsideWhat
  );
});

const BUDGETS = Object.freeze({
  mlp: Object.freeze({ profile: 'mlp', rows: Object.freeze(MLP_ROWS) }),
  epp: Object.freeze({ profile: 'epp', rows: Object.freeze(EPP_ROWS) }),
});

export function budgetFor(profile) {
  const b = BUDGETS[profile];
  if (!b) throw new Error(`unknown-profile:${profile}`);
  return b;
}

// Every §19 observer MUST have a row; a missing observer is a named failure —
// an absent row would be exactly the silent re-deciding §26.1 bullet 11
// ("a disclosure claim that ignores observable events") exists to catch.
// A row's claim form must carry all three §2.4 parameters, or it "is not yet
// a testable claim".
export function validateBudget(budget) {
  const failures = [];
  const byObserver = new Map((budget?.rows ?? []).map((r) => [r.observer, r]));
  for (const o of OBSERVERS) {
    if (!byObserver.has(o)) failures.push(`missing-observer-row:${o}`);
  }
  for (const r of budget?.rows ?? []) {
    if (!OBSERVERS.includes(r.observer)) failures.push(`unknown-observer:${r.observer}`);
    for (const p of CLAIM_PARAMS) {
      const v = r.claimForm?.[p];
      if (v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)) {
        failures.push(`incomplete-claim-form:${r.observer}:${p}`);
      }
    }
    if (!Array.isArray(r.seesPerPresentation) || r.seesPerPresentation.length === 0) {
      // §20: a presentation event remains observable — an empty "sees" list
      // would claim undetectability, which the tier never claims.
      failures.push(`empty-sees-claims-undetectability:${r.observer}`);
    }
  }
  return { ok: failures.length === 0, failures };
}
