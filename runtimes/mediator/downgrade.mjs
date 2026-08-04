// The declared-downgrade state machine — X7 M2 / §21.3.
//
// "When the preferred proof cannot be produced, the system MUST NOT silently
//  step down. It MUST either fail, invoke an explicitly identified
//  lower-assurance profile, use a governed mediator, or switch channel
//  according to a relying policy visible to the person and verifier." (§21.3)
//
// Rendered as exactly four exits from LOCAL-PROVING-FAILED. Every transition
// EMITS a visibility record naming its target and visible to BOTH parties;
// a partial/empty visibleTo is the §26.1/§23 'silent-fallback' case and can
// only be built via the deliberately-wrong test helper below. "Governed
// mediator" means registry-listed under snapshot semantics (§12.4-style):
// a de-listed or unlisted mediator FAILS CLOSED — 'mediator-not-governed'.
//
// Zero-dep, deterministic. No Date.now — `now` is an explicit input.

export const STATES = Object.freeze([
  'LOCAL-PROVING',
  'LOCAL-PROVING-FAILED',
  'FAIL',
  'NAMED-LOWER-PROFILE',
  'GOVERNED-MEDIATOR',
  'CHANNEL-SWITCH',
]);

export const EXITS = Object.freeze([
  'FAIL',
  'NAMED-LOWER-PROFILE',
  'GOVERNED-MEDIATOR',
  'CHANNEL-SWITCH',
]);

// §21.3: the relying policy is visible to the person AND the verifier —
// both must appear on every transition record.
export const VISIBLE_PARTIES = Object.freeze(['person', 'verifier']);

export function makeTransition(from, to, target) {
  if (!target) throw new Error('unnamed-target'); // explicit means NAMED
  return Object.freeze({
    transition: `${from}->${to}`,
    target,
    visibleTo: Object.freeze([...VISIBLE_PARTIES]),
  });
}

// Deliberately-wrong constructor, FOR TESTS ONLY: builds the silent step-down
// the machine itself cannot produce (§26.1 negative fixture).
export function __unsafeSilentTransition(from, to, target, visibleTo = []) {
  return Object.freeze({ transition: `${from}->${to}`, target, visibleTo: Object.freeze([...visibleTo]) });
}

export function validateTransition(rec) {
  const failures = [];
  const seen = new Set(rec?.visibleTo ?? []);
  if (!VISIBLE_PARTIES.every((p) => seen.has(p))) failures.push('silent-fallback');
  if (!rec?.target) failures.push('unnamed-target');
  return { ok: failures.length === 0, failures };
}

// Registry snapshot semantics: a mediator is governed iff it appears in the
// members list of a well-formed snapshot whose effectiveTime is not in the
// future of `now`. Anything else — missing snapshot, malformed snapshot,
// future snapshot, de-listed mediator — is NOT governed. Fails closed.
export function isGoverned(mediatorId, snapshot, now) {
  if (!snapshot || !Array.isArray(snapshot.members)) return false;
  if (typeof snapshot.effectiveTime !== 'number') return false;
  if (typeof now === 'number' && snapshot.effectiveTime > now) return false;
  return snapshot.members.includes(mediatorId);
}

// The machine. policy is the EXPLICIT relying policy object:
//   { onLocalFailure: 'fail' | 'lower-profile' | 'mediator' | 'channel-switch',
//     redressRoute?, lowerProfileId?, mediatorId?, registrySnapshot?, channel? }
// Returns { exit, target, transitions, reason? }. Every emitted transition is
// internally validated — the machine physically cannot emit a silent one.
export function attemptProof({ localCapable, policy, now }) {
  const transitions = [];
  const emit = (to, target) => {
    const rec = makeTransition('LOCAL-PROVING-FAILED', to, target);
    const v = validateTransition(rec);
    if (!v.ok) throw new Error(v.failures.join(','));
    transitions.push(rec);
    return rec;
  };

  if (localCapable) {
    return { exit: 'LOCAL-PROVING', target: 'local-proof', transitions };
  }

  switch (policy?.onLocalFailure) {
    case 'fail': {
      // Exit 1: deterministic error with a §13.6-style redress route.
      const target = policy.redressRoute ?? 'deterministic-error';
      emit('FAIL', target);
      return { exit: 'FAIL', target, transitions };
    }
    case 'lower-profile': {
      // Exit 2: the profile identifier is DISCLOSED, never implicit.
      if (!policy.lowerProfileId) throw new Error('unnamed-lower-profile');
      emit('NAMED-LOWER-PROFILE', policy.lowerProfileId);
      return { exit: 'NAMED-LOWER-PROFILE', target: policy.lowerProfileId, transitions };
    }
    case 'mediator': {
      // Exit 3: governed mediator only — registry-listed under snapshot
      // semantics. De-listed → fail closed, and the failure is itself a
      // visible FAIL transition (no silent anything).
      if (!isGoverned(policy.mediatorId, policy.registrySnapshot, now)) {
        emit('FAIL', 'mediator-not-governed');
        return { exit: 'FAIL', target: 'mediator-not-governed', reason: 'mediator-not-governed', transitions };
      }
      emit('GOVERNED-MEDIATOR', policy.mediatorId);
      return { exit: 'GOVERNED-MEDIATOR', target: policy.mediatorId, transitions };
    }
    case 'channel-switch': {
      // Exit 4: per relying policy, visible to both parties.
      if (!policy.channel) throw new Error('unnamed-channel');
      emit('CHANNEL-SWITCH', policy.channel);
      return { exit: 'CHANNEL-SWITCH', target: policy.channel, transitions };
    }
    default:
      throw new Error(`unknown-exit:${policy?.onLocalFailure}`);
  }
}
