// Bundle-profile registry v0 — X3 M2 made concrete.
//
// "Instead of verifiers composing à la carte, the profile registers named,
// versioned predicate bundles ... exactly as cipher suites replaced à-la-carte
// algorithm negotiation." (X3) Small governed vocabulary, large anonymity set
// per bundle; a request outside the registry is a §26.1 negative-test
// rejection ('bundle-outside-registry').
//
// Membership follows §7: MLP = {PR-LIV, PR-ISS, PR-HLD, PR-FRE} (§7.1 —
// possession + issuer qualification + holder control + transcript binding,
// no population dedup); EPP composes MLP with personhood + scoped uniqueness
// (§7.2 → + PR-PER, PR-UNQ); +DEL variants carry the §7.3 delegation
// extension as SEPARATE evidence (PR-DEL), never inferred from PR-HLD.

const bundle = (id, version, profile, predicates) =>
  Object.freeze({ id, version, profile, predicates: Object.freeze([...predicates]) });

const MLP = ['PR-LIV', 'PR-ISS', 'PR-HLD', 'PR-FRE'];
const EPP = [...MLP, 'PR-PER', 'PR-UNQ'];

export const REGISTRY = Object.freeze(
  new Map(
    [
      bundle('MLP-BASE', '1', 'mlp', MLP),
      bundle('MLP-BASE+DEL', '1', 'mlp', [...MLP, 'PR-DEL']),
      bundle('EPP-UNIQ', '1', 'epp', EPP),
      bundle('EPP-UNIQ+DEL', '1', 'epp', [...EPP, 'PR-DEL']),
      bundle('EPP-RANGE', '1', 'epp', [...EPP, 'PR-RNG']),
    ].map((b) => [`${b.id}@${b.version}`, b])
  )
);

const setKey = (predicates) => [...predicates].sort().join(',');

// Lookup by id + version. Unknown id, unknown version, or a registry the
// bundle is simply not in — all one named rejection.
export function lookupBundle(registry, id, version) {
  const b = registry.get(`${id}@${version}`);
  return b ? { ok: true, bundle: b } : { ok: false, reason: 'bundle-outside-registry' };
}

// À-la-carte defence: a bare predicate list is admissible only if it is
// EXACTLY some registered bundle's set (order-insensitive). Anything else —
// subset, superset, novel mix — is a profile violation.
export function matchBundle(registry, predicates) {
  const key = setKey(predicates);
  for (const b of registry.values()) {
    if (setKey(b.predicates) === key) return { ok: true, bundle: b };
  }
  return { ok: false, reason: 'bundle-outside-registry' };
}
