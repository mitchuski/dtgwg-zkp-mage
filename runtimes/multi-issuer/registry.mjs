// Issuer registry with independence register — X8 M2 data model as code shapes.
//
// §12.5 makes the multiplicative bound hang on assumption A2 (independence),
// which is "asserted, not derived from set membership alone". X8's remedy is a
// GOVERNED RECORD: the registry carries, per issuer, declared dependency
// classes (shared vendor, pipeline, corporate parent, jurisdiction, ...) and a
// documented one-sided error parameter ε with an effective time and an
// assurance horizon (the X6 certification-clock: an audit establishes ε at a
// time and it erodes rather than holds).
//
// Two issuers sharing ANY dependency class are correlated for that failure
// mode and collapse to one effective factor: effectiveK is the number of
// distinct independence classes represented in a show, and a collapsed
// group's ε is the group's shared-dependency bound (max ε in the group), not
// the product of its members — collapsing must WEAKEN the bound, never
// tighten it.
//
// Zero-dep, offline, deterministic. Times are compared with `>` only, so any
// consistently-ordered representation works (ISO-8601 strings or numbers);
// `now` is always an explicit argument — no Date.now anywhere.

import { H } from '../01-uniqueness-nullifier/src/nullifier.mjs';
import { canonicalize } from '../canonical/canonical.mjs';

export const DOMAIN_REGISTRY = 'dtg-zkp/issuer-registry/v0';

// --- M2 registry member shape (the fields a §27.3 registry profile carries) --
//   id                    issuer identifier within the registry
//   epsilon               one-sided mis-issuance error bound, 0 < ε < 1
//                         (set by the accreditation authority from audit
//                         evidence, never self-asserted — §18.2 extension)
//   epsilonEffectiveTime  when the audit established ε
//   epsilonHorizon        assurance horizon past which ε is STALE and no
//                         longer supports the multiplied bound (X6 clock)
//   dependencyClasses     declared correlated-failure classes, e.g.
//                         'vendor:X' | 'pipeline:Y' | 'parent:Z' |
//                         'jurisdiction:J' | 'enrolment-infra:W'
const MEMBER_FIELDS = [
  'id',
  'epsilon',
  'epsilonEffectiveTime',
  'epsilonHorizon',
  'dependencyClasses',
];

function validateMember(m) {
  for (const f of MEMBER_FIELDS) {
    if (m?.[f] === undefined || m[f] === null || m[f] === '') {
      throw new Error(`invalid-registry-member:missing:${f}`);
    }
  }
  if (typeof m.epsilon !== 'number' || !(m.epsilon > 0 && m.epsilon < 1)) {
    throw new Error(`invalid-epsilon:${m.id}`);
  }
  if (!Array.isArray(m.dependencyClasses)) {
    throw new Error(`invalid-dependency-classes:${m.id}`);
  }
}

// --- snapshot -----------------------------------------------------------------
// §12.4: qualification is evaluated against a NAMED snapshot with explicit
// effective time; the root is H over the canonicalized members so any two
// parties naming the same root name the same register contents (ε values and
// dependency classes included — the whole aggregation claim is evaluable at a
// named time).
export function makeIssuerRegistry({ epoch, effectiveTime, issuers }) {
  if (!epoch || effectiveTime === undefined || !Array.isArray(issuers)) {
    throw new Error('invalid-registry:missing-epoch-effectiveTime-or-issuers');
  }
  const seen = new Set();
  for (const m of issuers) {
    validateMember(m);
    if (seen.has(m.id)) throw new Error(`duplicate-registry-member:${m.id}`);
    seen.add(m.id);
  }
  const members = [...issuers]
    .map((m) => ({
      id: m.id,
      epsilon: m.epsilon,
      epsilonEffectiveTime: m.epsilonEffectiveTime,
      epsilonHorizon: m.epsilonHorizon,
      dependencyClasses: [...m.dependencyClasses].sort(),
    }))
    .sort((a, b) => (a.id < b.id ? -1 : 1));
  const root = H(DOMAIN_REGISTRY, canonicalize({ epoch, effectiveTime, members }));
  return Object.freeze({ epoch, effectiveTime, members, root });
}

export function getIssuer(snapshot, id) {
  return snapshot.members.find((m) => m.id === id);
}

// --- effectiveK ---------------------------------------------------------------
// Connected components over "shares at least one dependency class": issuers
// linked transitively through shared classes form ONE independence class. The
// show's effective k is the number of components — the number the verified
// statement reports, never the raw member count.
export function effectiveK(issuerIds, snapshot) {
  const ids = [...new Set(issuerIds)];
  for (const id of ids) {
    if (!getIssuer(snapshot, id)) throw new Error(`issuer-not-in-registry:${id}`);
  }
  const parent = new Map(ids.map((id) => [id, id]));
  const find = (x) => {
    while (parent.get(x) !== x) x = parent.get(x);
    return x;
  };
  const union = (a, b) => parent.set(find(a), find(b));
  const firstWithClass = new Map();
  for (const id of ids) {
    for (const c of getIssuer(snapshot, id).dependencyClasses) {
      if (firstWithClass.has(c)) union(id, firstWithClass.get(c));
      else firstWithClass.set(c, id);
    }
  }
  const byRoot = new Map();
  for (const id of ids) {
    const r = find(id);
    if (!byRoot.has(r)) byRoot.set(r, []);
    byRoot.get(r).push(id);
  }
  const groups = [...byRoot.values()]
    .map((g) => [...g].sort())
    .sort((a, b) => (a[0] < b[0] ? -1 : 1));
  return { effectiveK: groups.length, groups };
}

// --- aggregateBound -----------------------------------------------------------
// The §12.5 bound with A2 enforced through the register:
//   bound = ∏ over independence groups of (group ε),  group ε = max ε in group
// (the shared-dependency bound — a compromised shared vendor takes the whole
// group with it, so the group is only as strong as its weakest declared ε).
// A member whose ε is past its horizon at `now` is STALE and cannot support
// the bound. `opts.corrupted` models the §12.5 degradation clause: a corrupted
// or negligent issuer's factor is replaced by 1, degrading only its own
// contribution — the bound remains the product of the others.
export function aggregateBound(issuerIds, snapshot, now, opts = {}) {
  const { corrupted = [] } = opts;
  const { effectiveK: k, groups } = effectiveK(issuerIds, snapshot);
  const staleMembers = [];
  let bound = 1;
  for (const group of groups) {
    let groupEpsilon = 0;
    for (const id of group) {
      const m = getIssuer(snapshot, id);
      if (now > m.epsilonHorizon) staleMembers.push(id);
      const e = corrupted.includes(id) ? 1 : m.epsilon;
      if (e > groupEpsilon) groupEpsilon = e;
    }
    bound *= groupEpsilon;
  }
  return { bound, effectiveK: k, groups, staleMembers: staleMembers.sort() };
}
