// JS-side mirror of the dual-issuer circuit algebra (X8 k=2).
//
// Reuses harness.mjs's field helpers, Poseidon singleton, and tree builder
// unmodified (read-only import); adds the issuer-side pieces:
//   - issuer enrolment (secret/blinding/commitment, deterministic)
//   - ISSUER_TAG_FIELD (derived + asserted against the circuit constant)
//   - showContextField
//   - issuerNullifierField + makeDualInput
//
// showContext choice (documented): the show-scope input is the §15.2
// canonical TRANSCRIPT digest (transcriptDigest from ../canonical/), NOT the
// §6.2 descriptor digest the single gadget uses. Per X8, the issuer
// distinctness nullifier is N_i = H(tag, issuer_secret, show-transcript
// digest): the SHOW is the scope — distinctness holds within this show, and
// the transcript's per-show fields (challenge, sessionId, ...) are exactly
// what prevents cross-show issuer correlation (§15.2 domain separation).
// This also matches the multi-issuer reference model (aggregate.mjs), whose
// issuerShowNullifier hashes over transcriptDigest(transcript).

import { createHash } from 'node:crypto';
import {
  FIELD_PRIME,
  fieldFromParts,
  poseidonHash,
  buildTree,
  TREE_DEPTH,
} from './harness.mjs';
import { transcriptDigest } from '../canonical/canonical.mjs';

export { FIELD_PRIME, buildTree, TREE_DEPTH };

// Versioned domain tags. The nullifier tag string is the SAME string as the
// multi-issuer reference model's DOMAIN_ISSUER_SHOW_NULLIFIER (aggregate.mjs)
// — one governed name, two hash pins (SHA-256 there, Poseidon here; rt01
// NOTES item 2 discipline).
export const DOMAIN_ISSUER_SECRET = 'dtg-zkp/issuer-secret/v0';
export const DOMAIN_ISSUER_SHOW_NULLIFIER = 'dtg-zkp/issuer-show-nullifier/v0';

// ISSUER_TAG_FIELD = sha256('dtg-zkp/issuer-show-nullifier/v0') mod p — must
// equal the constant hardcoded in circuits/dual_issuer.circom (asserted).
function fieldFromSha256Raw(s) {
  const h = createHash('sha256').update(s, 'utf8').digest('hex');
  return BigInt('0x' + h) % FIELD_PRIME;
}
export const ISSUER_TAG_FIELD = fieldFromSha256Raw(DOMAIN_ISSUER_SHOW_NULLIFIER);
const EXPECTED_ISSUER_TAG =
  10973338332398489381181448044177053429928920939795168163925594436592914467957n;
if (ISSUER_TAG_FIELD !== EXPECTED_ISSUER_TAG) {
  throw new Error('issuer-tag-derivation-drift: harness and circuit disagree');
}

// --- issuer enrolment ----------------------------------------------------------
// One issuer -> one secret, deterministically (same discipline as enrolField;
// the accepted-issuer set is the accreditation registry's deduplicating
// enrolment — §18.2).

export async function enrolIssuerField(issuerId) {
  const secret = fieldFromParts(DOMAIN_ISSUER_SECRET, issuerId);
  const blinding = fieldFromParts('issuer-blinding', issuerId, secret.toString());
  const commitment = await poseidonHash([secret, blinding]);
  return { secret, blinding, commitment };
}

// --- show context ---------------------------------------------------------------
// §15.2 canonical transcript -> digest (canonical module, sha256 hex) -> field.

export function showContextField(transcript) {
  return BigInt('0x' + transcriptDigest(transcript)) % FIELD_PRIME;
}

// --- nullifier mirror -----------------------------------------------------------

export async function issuerNullifierField(secret, showContext) {
  return poseidonHash([ISSUER_TAG_FIELD, secret, showContext]);
}

// --- witness input --------------------------------------------------------------
// Produces the input JSON the dual circuit's witness generator consumes.
// issuers = [issuer1, issuer2] (enrolIssuerField outputs), leafIndices their
// positions in the ONE shared tree. Note: makeDualInput does NOT forbid
// issuer1 === issuer2 — the CIRCUIT does (distinctness constraint, test D3).

export async function makeDualInput({ issuers, tree, leafIndices, showContext }) {
  const [a, b] = issuers;
  const [ia, ib] = leafIndices;
  const pa = tree.path(ia);
  const pb = tree.path(ib);
  const nullifier1 = await issuerNullifierField(a.secret, showContext);
  const nullifier2 = await issuerNullifierField(b.secret, showContext);
  return {
    input: {
      secret1: a.secret.toString(),
      blinding1: a.blinding.toString(),
      pathElements1: pa.pathElements.map((x) => x.toString()),
      pathIndices1: pa.pathIndices.map((x) => x.toString()),
      secret2: b.secret.toString(),
      blinding2: b.blinding.toString(),
      pathElements2: pb.pathElements.map((x) => x.toString()),
      pathIndices2: pb.pathIndices.map((x) => x.toString()),
      showContext: showContext.toString(),
      root: tree.root.toString(),
      nullifier1: nullifier1.toString(),
      nullifier2: nullifier2.toString(),
    },
    nullifier1,
    nullifier2,
  };
}
