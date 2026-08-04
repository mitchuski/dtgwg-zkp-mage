// The quiet-presentation tier, modelled over event traces — X4 M2.
//
// A deployment is modelled as an emitter of typed events
//   { type: 'status-fetch'|'presentation'|'error'|'retry',
//     t,       logical tick — EXPLICIT, no Date.now() anywhere,
//     shape,   size class (a string standing in for proof/packet shape),
//     surface  the EXTERNALLY observable message string }
// plus a holder-routed internal log (M-ERROR: detailed reason codes go to the
// holder ONLY; the codes are the v1 reason register's — the fixtures lane owns
// that vocabulary, this lane only consumes it).
//
// Two reference deployments:
//   makeQuietDeployment — status roots fetched on a fixed schedule INDEPENDENT
//     of presentations (M-STATUS: no per-show authority contact), shapes padded
//     to a profile constant (M-SHAPE), ONE uniform external error string with
//     reasons holder-routed (M-ERROR), retries bounded and on the timing grid
//     (M-RETRY).
//   makeNaiveDeployment — the anti-model: fetches status per presentation,
//     leaks per-presentation shape, surfaces the internal reason code
//     externally, retries immediately off-grid.
//
// checkQuietTier tests the tier properties that are honestly modelable at
// this altitude (event traces, not packet captures). It NEVER claims
// undetectability: every result — pass or fail — carries a non-empty residue
// list (§20; §3.2 excludes "eliminate all observability" from scope).

import { isKnownReason } from '../fixtures/reasons.mjs';

export const UNIFORM_ERROR_SURFACE = 'presentation-unavailable';
export const PROFILE_SHAPE = 'shape:profile-const/v0';

// The tier's honest residue — what the verifier and co-resident observers
// still see when EVERY check passes. Declared, frozen, never empty.
export const RESIDUE = Object.freeze([
  'presentation-occurrence', // §20: a presentation event remains observable
  'coarse-timing', // grid-quantised, not eliminated (M-BATCH)
  'status-fetch-cadence', // the schedule itself is visible, just uninformative
  'co-resident-app-signals-bounded-not-eliminated', // §19 last row, X4 open q.
]);

const nextGridTick = (t, grid) => (Math.floor(t / grid) + 1) * grid;

// --- quiet deployment --------------------------------------------------------
// config: { horizon, period, offset, grid, retryBudget, padShape,
//           presentations: [{ t, shape?, cause? }] }
//   cause — an INTERNAL v1 register reason code when the presentation fails;
//   shape — the un-padded size class (only observable when padShape:false,
//           which exists so the shape-fingerprint check can be demonstrated).
export function makeQuietDeployment({
  horizon = 64,
  period = 8,
  offset = 0,
  grid = 4,
  retryBudget = 1,
  padShape = true,
  presentations = [],
} = {}) {
  const events = [];
  const holderLog = [];

  // M-STATUS: fixed schedule, computed from (offset, period, horizon) ONLY —
  // the presentations list is not consulted. Same config minus presentations
  // yields the identical status pattern (tier property 1).
  for (let t = offset; t <= horizon; t += period) {
    events.push({ type: 'status-fetch', t, shape: PROFILE_SHAPE, surface: 'status-root-refresh' });
  }

  for (const p of presentations) {
    const shape = padShape ? PROFILE_SHAPE : (p.shape ?? `shape:raw@${p.t}`);
    events.push({ type: 'presentation', t: p.t, shape, surface: 'presentation' });
    if (p.cause) {
      // M-ERROR: one external surface whatever the cause; the real reason is
      // routed to the holder, who decides what to escalate (§13.6/§23 routes
      // preserved without making the error channel a fingerprint).
      events.push({ type: 'error', t: p.t, shape, surface: UNIFORM_ERROR_SURFACE });
      holderLog.push({ t: p.t, code: p.cause });
      // M-RETRY: bounded, on-grid, uniform surface.
      for (let i = 0; i < retryBudget; i++) {
        const tr = nextGridTick(p.t, grid) + i * grid;
        events.push({ type: 'retry', t: tr, shape, surface: UNIFORM_ERROR_SURFACE });
      }
    }
  }

  events.sort((a, b) => a.t - b.t);
  return { trace: events, holderLog, config: { horizon, period, offset, grid, retryBudget } };
}

// --- naive deployment (the anti-model) ---------------------------------------
export function makeNaiveDeployment({
  horizon = 64,
  grid = 4,
  presentations = [],
} = {}) {
  const events = [];
  // No schedule: status is fetched exactly when (and because) a show happens —
  // the registry operator reads presentation occurrence off its own logs.
  for (const [i, p] of presentations.entries()) {
    events.push({
      type: 'status-fetch',
      t: p.t,
      shape: p.shape ?? `shape:lookup-${i}`,
      surface: 'status-lookup',
    });
    events.push({
      type: 'presentation',
      t: p.t,
      shape: p.shape ?? `shape:bundle-${i}`, // per-show shape: a fingerprint
      surface: 'presentation',
    });
    if (p.cause) {
      // Internal vocabulary leaked straight onto the external surface.
      events.push({ type: 'error', t: p.t, shape: p.shape ?? `shape:err-${i}`, surface: p.cause });
      // Immediate retry: off-grid whenever grid > 1 divides nothing.
      events.push({
        type: 'retry',
        t: p.t + 1,
        shape: p.shape ?? `shape:err-${i}`,
        surface: p.cause,
      });
    }
  }
  events.sort((a, b) => a.t - b.t);
  return { trace: events, holderLog: [], config: { horizon, grid } };
}

// --- checkQuietTier ----------------------------------------------------------
// trace — the mixed trace under test (presentations + idle windows).
// opts.idleTrace — the SAME deployment's trace with zero presentations: tier
//   property 1 is a comparison, not a property of one trace.
// opts.holderLog — the holder-routed internal log (M-ERROR's private half).
// opts.k — correlation window in ticks for the schedule-independence check.
//
// Named failures:
//   status-correlated-with-presentation  status-fetch tick pattern differs
//                                        from the idle window's pattern
//   per-show-authority-contact           an off-schedule status-fetch within
//                                        k ticks of a presentation (M-STATUS
//                                        rule: no per-show contact with any
//                                        authority; on-schedule ticks that
//                                        happen to land near a show are exempt
//                                        — that is what independence means)
//   error-surface-nonuniform             >1 distinct external error string, or
//                                        an external string drawn from the
//                                        internal reason register (leak)
//   shape-fingerprint                    >1 distinct shape across the trace
//   retry-off-grid                       a retry at a tick not on the grid
//   retry-over-budget                    more retries than budget x errors
//   unknown-internal-reason:<code>       holder-routed code not in the v1
//                                        register (fixtures lane vocabulary)
export function checkQuietTier(
  trace,
  { idleTrace = [], holderLog = [], k = 2, grid = 4, retryBudget = 1 } = {}
) {
  const failures = new Set();
  const of = (type, evts) => evts.filter((e) => e.type === type);

  // (1) status pattern identical with and without presentations in the window.
  const statusTicks = of('status-fetch', trace).map((e) => e.t);
  const idleTicks = of('status-fetch', idleTrace).map((e) => e.t);
  if (statusTicks.join(',') !== idleTicks.join(',')) {
    failures.add('status-correlated-with-presentation');
  }

  // (2) schedule independence: no OFF-schedule status-fetch within k ticks of
  // a presentation — per-show authority contact, §12.4's lookup-pattern rule.
  const idleSet = new Set(idleTicks);
  const presTicks = of('presentation', trace).map((e) => e.t);
  for (const t of statusTicks) {
    if (!idleSet.has(t) && presTicks.some((pt) => Math.abs(pt - t) <= k)) {
      failures.add('per-show-authority-contact');
    }
  }

  // (3) uniform external error surface; internal codes distinct + holder-routed.
  const errorEvents = of('error', trace);
  const surfaces = new Set(errorEvents.map((e) => e.surface));
  if (surfaces.size > 1) failures.add('error-surface-nonuniform');
  for (const s of surfaces) {
    // The external surface must not be drawn from the internal vocabulary —
    // that is the fixture-visible/external separation X4's M-ERROR requires.
    if (isKnownReason(s)) failures.add('error-surface-nonuniform');
  }
  for (const entry of holderLog) {
    if (!isKnownReason(entry.code)) failures.add(`unknown-internal-reason:${entry.code}`);
  }

  // (4) shape constant per profile — one size class across ALL event types.
  const shapes = new Set(trace.map((e) => e.shape));
  if (shapes.size > 1) failures.add('shape-fingerprint');

  // (5) retries on-grid and within budget.
  const retryEvents = of('retry', trace);
  for (const r of retryEvents) {
    if (r.t % grid !== 0) failures.add('retry-off-grid');
  }
  if (retryEvents.length > retryBudget * Math.max(1, errorEvents.length)) {
    failures.add('retry-over-budget');
  }

  // The result NEVER claims undetectability: pass or fail, the residue rides
  // along, and it is structurally non-empty (§20 — occurrence is observable).
  return { ok: failures.size === 0, failures: [...failures], residue: RESIDUE };
}
