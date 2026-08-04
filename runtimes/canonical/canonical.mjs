// Canonical encodings — the shared spine for the X-series reference models.
//
// Two objects the decision document makes load-bearing:
//   §6.2  canonical context descriptor — "MUST be encoded canonically and MUST
//         be included in conformance fixtures"; derived from governed semantic
//         inputs, never an opaque verifier-chosen label.
//   §15.2 canonical transcript — "a bare nonce is insufficient"; freshness means
//         binding to the full request semantics.
//
// One encoding, three consumers: fixtures (X1) serialize these as vector inputs,
// the context card (X2) is render(descriptor) with a matching digest, the show
// (X3) binds all requested predicates to one transcript digest.
//
// Zero-dep, offline, SHA-256 via runtime 01's H (same hash discipline; the
// circuit swaps Poseidon — the spec must pin the hash, rt 01 NOTES item 2).

import { H } from '../01-uniqueness-nullifier/src/nullifier.mjs';

export const DOMAIN_DESCRIPTOR = 'dtg-zkp/context-descriptor/v0';
export const DOMAIN_TRANSCRIPT = 'dtg-zkp/transcript/v0';

// --- canonical JSON: sorted keys, primitives + plain objects/arrays only ------
export function canonicalize(value) {
  if (value === null || typeof value === 'number' || typeof value === 'boolean') {
    if (typeof value === 'number' && !Number.isFinite(value)) {
      throw new Error('non-finite-number');
    }
    return JSON.stringify(value);
  }
  if (typeof value === 'string') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`;
  if (typeof value === 'object') {
    const keys = Object.keys(value).filter((k) => value[k] !== undefined).sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalize(value[k])}`).join(',')}}`;
  }
  throw new Error(`uncanonicalizable-type:${typeof value}`);
}

// --- §6.2 context descriptor --------------------------------------------------
// Field names follow §6.2's list, one key per required input.
export const DESCRIPTOR_FIELDS = [
  'protocol', // protocol identifier and version, e.g. "dtg-zkp/0.1"
  'profile', // profile identifier and version, e.g. "mlp/1" | "epp/1"
  'contextAuthority', // §6.7 authority responsible for the domain
  'contextPolicy', // context policy identifier and version
  'purpose', // purpose identifier (§5.7 — never verifier free text)
  'scope', // scope identifier (§5.6)
  'verifierSet', // verifier audience or governed verifier-set identifier
  'epoch', // epoch identifier (§5.8)
  'epochPolicy', // epoch policy (rollover rule)
  'nullifierVersion', // nullifier and domain-separation version
  'retentionPolicy', // applicable retention and rollover policy identifier
];
export const DESCRIPTOR_OPTIONAL = ['registryDomain']; // "where relevant" (§6.2)

export function validateDescriptor(d) {
  const missing = DESCRIPTOR_FIELDS.filter(
    (f) => d?.[f] === undefined || d[f] === null || d[f] === ''
  );
  const known = new Set([...DESCRIPTOR_FIELDS, ...DESCRIPTOR_OPTIONAL]);
  const unknown = Object.keys(d ?? {}).filter((k) => !known.has(k));
  return { ok: missing.length === 0 && unknown.length === 0, missing, unknown };
}

export function descriptorDigest(d) {
  const v = validateDescriptor(d);
  if (!v.ok) {
    throw new Error(
      `invalid-descriptor:${[...v.missing.map((m) => `missing:${m}`), ...v.unknown.map((u) => `unknown:${u}`)].join(',')}`
    );
  }
  return H(DOMAIN_DESCRIPTOR, canonicalize(d));
}

// --- §15.2 canonical transcript ----------------------------------------------
export const TRANSCRIPT_FIELDS = [
  'protocol', // protocol identifier and version
  'profile', // profile identifier and version
  'verifier', // verifier or audience identifier
  'contextDescriptorDigest', // the governed context descriptor (by digest)
  'purpose',
  'scope',
  'challenge', // challenge or nonce — necessary, NOT sufficient (§15.2)
  'sessionId',
  'requestedPredicates', // array of PR-* ids — the show's bundle (X3)
  'policyRequirements', // policy and assurance requirements
  'expiry', // expiry boundary and accepted clock rules
  'snapshotRequirements', // status or registry snapshot requirements (§12.4)
  'encodingVersion', // canonical encoding and domain-separation version
];
export const TRANSCRIPT_OPTIONAL = [
  'delegationRef', // where applicable (PR-DEL)
  'provingMode', // fallback or mediated-proving mode when material (§21)
];

export function validateTranscript(t) {
  const missing = TRANSCRIPT_FIELDS.filter(
    (f) => t?.[f] === undefined || t[f] === null || t[f] === ''
  );
  if (t?.requestedPredicates !== undefined && !Array.isArray(t.requestedPredicates)) {
    missing.push('requestedPredicates:not-a-list');
  }
  const known = new Set([...TRANSCRIPT_FIELDS, ...TRANSCRIPT_OPTIONAL]);
  const unknown = Object.keys(t ?? {}).filter((k) => !known.has(k));
  return { ok: missing.length === 0 && unknown.length === 0, missing, unknown };
}

export function transcriptDigest(t) {
  const v = validateTranscript(t);
  if (!v.ok) {
    throw new Error(
      `invalid-transcript:${[...v.missing.map((m) => `missing:${m}`), ...v.unknown.map((u) => `unknown:${u}`)].join(',')}`
    );
  }
  return H(DOMAIN_TRANSCRIPT, canonicalize(t));
}

export { H };
