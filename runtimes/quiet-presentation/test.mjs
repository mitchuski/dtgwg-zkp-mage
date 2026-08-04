// Property tests for the quiet-presentation tier (X4 M1–M3).
import { OBSERVERS } from '../show-composition/show.mjs';
import { isKnownReason } from '../fixtures/reasons.mjs';
import { budgetFor, validateBudget } from './budget.mjs';
import {
  makeQuietDeployment,
  makeNaiveDeployment,
  checkQuietTier,
  UNIFORM_ERROR_SURFACE,
  RESIDUE,
} from './quiet.mjs';
import { REGISTER, validateLogSchema } from './logregister.mjs';

let pass = 0,
  fail = 0;
const t = (name, cond) => {
  if (cond) {
    pass++;
    console.log(`  ok  ${name}`);
  } else {
    fail++;
    console.log(`FAIL  ${name}`);
  }
};

// Q1 — budget completeness: every §19 observer has an MLP and an EPP row;
// removing one fails BY NAME; an unknown profile is refused.
const mlpBudget = budgetFor('mlp');
const eppBudget = budgetFor('epp');
let unknownProfileThrew = false;
try {
  budgetFor('vip');
} catch {
  unknownProfileThrew = true;
}
const gutted = {
  profile: 'mlp',
  rows: mlpBudget.rows.filter((r) => r.observer !== 'registry-operator'),
};
t(
  'Q1 budget completeness: all 11 observers x {MLP,EPP}; missing row named',
  validateBudget(mlpBudget).ok &&
    validateBudget(eppBudget).ok &&
    mlpBudget.rows.length === OBSERVERS.length &&
    eppBudget.rows.length === OBSERVERS.length &&
    validateBudget(gutted).failures.includes('missing-observer-row:registry-operator') &&
    unknownProfileThrew
);

// --- shared quiet fixture: mixed trace (shows + errors + idle windows) -------
const quietCfg = {
  horizon: 64,
  period: 8,
  offset: 0,
  grid: 4,
  retryBudget: 1,
  presentations: [
    { t: 5 },
    { t: 11, cause: 'stale-registry-snapshot' },
    { t: 37, cause: 'silent-fallback' },
    { t: 50 },
  ],
};
const quiet = makeQuietDeployment(quietCfg);
const quietIdle = makeQuietDeployment({ ...quietCfg, presentations: [] });
const quietResult = checkQuietTier(quiet.trace, {
  idleTrace: quietIdle.trace,
  holderLog: quiet.holderLog,
  grid: 4,
  retryBudget: 1,
});

// Q2 — the quiet deployment passes the tier on a mixed trace.
t(
  'Q2 quiet deployment passes checkQuietTier on mixed trace',
  quietResult.ok && quietResult.failures.length === 0
);

// Q3 — the naive deployment fails, with the two required failures at minimum.
const naiveCfg = {
  horizon: 64,
  grid: 4,
  presentations: [
    { t: 11, cause: 'stale-registry-snapshot' },
    { t: 37, cause: 'silent-fallback' },
  ],
};
const naive = makeNaiveDeployment(naiveCfg);
const naiveIdle = makeNaiveDeployment({ ...naiveCfg, presentations: [] });
const naiveResult = checkQuietTier(naive.trace, {
  idleTrace: naiveIdle.trace,
  holderLog: naive.holderLog,
  grid: 4,
  retryBudget: 1,
});
t(
  'Q3 naive deployment fails: status-correlated + error-surface-nonuniform',
  !naiveResult.ok &&
    naiveResult.failures.includes('status-correlated-with-presentation') &&
    naiveResult.failures.includes('error-surface-nonuniform') &&
    naiveResult.failures.includes('per-show-authority-contact')
);

// Q4 — error surface: external strings collapse to ONE uniform string while
// the internal reason codes stay distinct, register-known, and holder-routed.
const externalErrorSurfaces = new Set(
  quiet.trace.filter((e) => e.type === 'error').map((e) => e.surface)
);
const holderCodes = new Set(quiet.holderLog.map((h) => h.code));
t(
  'Q4 uniform external error surface; internal codes preserved for holder',
  externalErrorSurfaces.size === 1 &&
    externalErrorSurfaces.has(UNIFORM_ERROR_SURFACE) &&
    !isKnownReason(UNIFORM_ERROR_SURFACE) &&
    holderCodes.size === 2 &&
    [...holderCodes].every(isKnownReason)
);

// Q5 — shape fingerprint caught when padding is disabled (and it is the ONLY
// failure: everything else about the deployment stays quiet).
const unpadded = makeQuietDeployment({
  ...quietCfg,
  padShape: false,
  presentations: [
    { t: 5, shape: 'shape:mlp-small' },
    { t: 21, shape: 'shape:epp-large' },
  ],
});
const unpaddedResult = checkQuietTier(unpadded.trace, {
  idleTrace: quietIdle.trace,
  holderLog: unpadded.holderLog,
  grid: 4,
  retryBudget: 1,
});
t(
  'Q5 shape fingerprint caught when padding disabled',
  !unpaddedResult.ok &&
    unpaddedResult.failures.length === 1 &&
    unpaddedResult.failures[0] === 'shape-fingerprint'
);

// Q6 — retry off the timing grid caught (a single doctored retry spliced into
// an otherwise-quiet trace; grid 4, tick 23).
const doctored = [
  ...quiet.trace,
  { type: 'retry', t: 23, shape: 'shape:profile-const/v0', surface: UNIFORM_ERROR_SURFACE },
].sort((a, b) => a.t - b.t);
const doctoredResult = checkQuietTier(doctored, {
  idleTrace: quietIdle.trace,
  holderLog: quiet.holderLog,
  grid: 4,
  retryBudget: 1,
});
t(
  'Q6 retry off-grid caught',
  !doctoredResult.ok && doctoredResult.failures.includes('retry-off-grid')
);

// Q7 — log register: prohibited field rejected BY NAME, unregistered field
// rejected by name, the compliant register passes.
const prohibited = validateLogSchema(['presentationEpoch', 'holderDeviceId']);
const unregistered = validateLogSchema(['freeTextNote']);
const compliant = validateLogSchema(REGISTER.map((e) => e.field));
t(
  'Q7 log register: prohibited + unregistered named, compliant passes',
  !prohibited.ok &&
    prohibited.failures.includes('prohibited-log-field:holderDeviceId') &&
    !unregistered.ok &&
    unregistered.failures.includes('unregistered-log-field:freeTextNote') &&
    compliant.ok &&
    compliant.failures.length === 0
);

// Q8 — honest residue: undetectability is NEVER claimed. A PASSING result
// still carries a non-empty residue (occurrence + coarse timing observable),
// a failing result carries it too, and the list is frozen data.
t(
  'Q8 honest residue: ok result carries non-empty residue; never undetectability',
  quietResult.ok &&
    Array.isArray(quietResult.residue) &&
    quietResult.residue.length > 0 &&
    quietResult.residue.includes('presentation-occurrence') &&
    quietResult.residue.includes('coarse-timing') &&
    naiveResult.residue.length > 0 &&
    Object.isFrozen(RESIDUE)
);

console.log(`\nquiet-presentation: ${pass}/${pass + fail} pass`);
process.exit(fail ? 1 : 0);
