// JS-side mirror of the guardian-threshold circuit algebra (X9 t-of-n, t=3).
//
// Reuses harness.mjs's field helpers, Poseidon singleton, and tree builder
// unmodified (read-only import); adds the guardian-side pieces:
//   - guardian enrolment (secret/blinding/commitment, deterministic)
//   - GUARDIAN_TAG_FIELD (derived + asserted against the circuit constant)
//   - recoveryContextField (§6.2 recovery-domain descriptor digest mod p)
//   - claimDigestField (the continuity claim, computed harness-side)
//   - guardianNullifierField + makeGuardianInput
//
// recoveryContext choice (documented): the seat-scope input is the §6.2
// RECOVERY-DOMAIN descriptor digest (descriptorDigest from ../canonical/),
// with the guardian EPOCH carried INSIDE the descriptor (its `epoch` field).
// This is the circuit-level pin of the reference model's string-domain
// convention nullifier(secret, 'guardian/' + descriptorDigest + '/' + epoch)
// (runtimes/guardian-recovery/guardians.mjs): one governed name — the
// recovery context+epoch seat scope — two hash pins (SHA-256 string domain
// there, Poseidon field preimage here; rt01 NOTES item 2 discipline, same
// move as ISSUER_TAG). Epoch rollover = a new descriptor digest = a fresh
// seat nullifier, exactly the §22.2 guardian-epoch behaviour.
//
// claimDigest choice (documented): the continuity claim is computed
// HARNESS-SIDE — fieldFromParts over (newCommitment, revokedRef, §15.2
// ceremony-transcript digest) under the reference model's recovery-claim
// domain — and enters the circuit as ONE public field element bound by the
// dummy-square idiom. The circuit binds the proof to the claim; it does not
// recompute the claim's internals (they stay checker-side, like the reference
// model's recoverWithGuardians step 5 "one claim" check).

import { createHash } from 'node:crypto';
import {
  FIELD_PRIME,
  fieldFromParts,
  poseidonHash,
  buildTree,
  TREE_DEPTH,
} from './harness.mjs';
import { descriptorDigest, transcriptDigest } from '../canonical/canonical.mjs';

export { FIELD_PRIME, buildTree, TREE_DEPTH };

export const GUARDIAN_COUNT = 3; // t, fixed by `main = GuardianThreshold(20, 3)`

// Versioned domain tags. The seat-nullifier tag is the circuit-level pin of
// the guardian-recovery reference model's 'guardian/' context-prefix
// convention (see header); the secret/claim domains mirror harness-dual's
// issuer discipline and the reference model's DOMAIN_RECOVERY_CLAIM.
export const DOMAIN_GUARDIAN_SECRET = 'dtg-zkp/guardian-secret/v0';
export const DOMAIN_GUARDIAN_SEAT_NULLIFIER = 'dtg-zkp/guardian-seat-nullifier/v0';
export const DOMAIN_RECOVERY_CLAIM = 'dtg-zkp/recovery-claim/v0'; // same string as guardians.mjs

// GUARDIAN_TAG_FIELD = sha256('dtg-zkp/guardian-seat-nullifier/v0') mod p —
// must equal the constant hardcoded in circuits/guardian_threshold.circom
// (asserted).
function fieldFromSha256Raw(s) {
  const h = createHash('sha256').update(s, 'utf8').digest('hex');
  return BigInt('0x' + h) % FIELD_PRIME;
}
export const GUARDIAN_TAG_FIELD = fieldFromSha256Raw(DOMAIN_GUARDIAN_SEAT_NULLIFIER);
const EXPECTED_GUARDIAN_TAG =
  8562476688242842477897907163240902665687518953395242745930442724180399436697n;
if (GUARDIAN_TAG_FIELD !== EXPECTED_GUARDIAN_TAG) {
  throw new Error('guardian-tag-derivation-drift: harness and circuit disagree');
}

// --- guardian enrolment --------------------------------------------------------
// One guardian -> one secret, deterministically (same discipline as enrolField/
// enrolIssuerField). The committed guardian set is the holder's Merkle tree
// over these commitments; personhood-gating of the guardians at set-commit
// time is the reference model's job (rt 01 leg), OUT of this circuit.

export async function enrolGuardianField(guardianId) {
  const secret = fieldFromParts(DOMAIN_GUARDIAN_SECRET, guardianId);
  const blinding = fieldFromParts('guardian-blinding', guardianId, secret.toString());
  const commitment = await poseidonHash([secret, blinding]);
  return { secret, blinding, commitment };
}

// --- recovery context -----------------------------------------------------------
// §6.2 recovery-domain descriptor -> digest (canonical module, sha256 hex) ->
// field. Epoch INSIDE the descriptor (see header).

export function recoveryContextField(descriptor) {
  return BigInt('0x' + descriptorDigest(descriptor)) % FIELD_PRIME;
}

// --- continuity claim -----------------------------------------------------------
// The reference model's claimDigest, one hop over: binds newCommitment +
// revokedRef + the §15.2 ceremony transcript under the recovery-claim domain,
// reduced mod p. (The reference's separate d + epoch parts live inside the
// transcript's contextDescriptorDigest here — the descriptor carries the
// epoch, the transcript carries the descriptor.)

export function claimDigestField({ newCommitment, revokedRef, transcript }) {
  return fieldFromParts(
    DOMAIN_RECOVERY_CLAIM,
    String(newCommitment),
    String(revokedRef),
    transcriptDigest(transcript)
  );
}

// --- nullifier mirror -----------------------------------------------------------

export async function guardianNullifierField(secret, recoveryContext) {
  return poseidonHash([GUARDIAN_TAG_FIELD, secret, recoveryContext]);
}

// --- witness input --------------------------------------------------------------
// Produces the input JSON the guardian circuit's witness generator consumes.
// guardians = [g1, g2, g3] (enrolGuardianField outputs), leafIndices their
// positions in the ONE committed-set tree. Note: makeGuardianInput does NOT
// forbid duplicate guardians — the CIRCUIT does (pairwise distinctness, G2c).

export async function makeGuardianInput({ guardians, tree, leafIndices, recoveryContext, claimDigest }) {
  if (guardians.length !== GUARDIAN_COUNT || leafIndices.length !== GUARDIAN_COUNT) {
    throw new Error(`guardian-count-mismatch: circuit is t=${GUARDIAN_COUNT}`);
  }
  const paths = leafIndices.map((i) => tree.path(i));
  const nullifiers = [];
  for (const g of guardians) {
    nullifiers.push(await guardianNullifierField(g.secret, recoveryContext));
  }
  return {
    input: {
      secret: guardians.map((g) => g.secret.toString()),
      blinding: guardians.map((g) => g.blinding.toString()),
      pathElements: paths.map((p) => p.pathElements.map((x) => x.toString())),
      pathIndices: paths.map((p) => p.pathIndices.map((x) => x.toString())),
      recoveryContext: recoveryContext.toString(),
      guardianRoot: tree.root.toString(),
      claimDigest: claimDigest.toString(),
      nullifiers: nullifiers.map((n) => n.toString()),
    },
    nullifiers,
  };
}
