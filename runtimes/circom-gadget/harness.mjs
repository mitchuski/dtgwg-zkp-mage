// JS-side mirror of the circuit algebra (circomlibjs Poseidon).
//
// Everything here is DETERMINISTIC — enrolment secrets derive from seeded
// strings via sha256-reduced-to-field, never randomness — so the harness and
// the circuit can be cross-checked value-for-value (test Z2).
//
// The context input is the §6.2 canonical descriptor digest from the lab's
// canonical module, reduced to a BN254 field element. This closes rt01 NOTES
// item 3 (context canonicalization) through the canonical module rather than
// re-inventing an encoding here.
//
// The transcriptDigest input (added 2026-07-18) is the §15.2 canonical
// transcript digest, same reduction (transcriptField mirrors contextField).
// It binds the PROOF to one presentation; the nullifier preimage is unchanged.

import { createHash } from 'node:crypto';
import { buildPoseidon } from 'circomlibjs';
import { descriptorDigest, transcriptDigest } from '../canonical/canonical.mjs';

// BN254 scalar field prime (the field circom/snarkjs bn128 circuits live in).
export const FIELD_PRIME =
  21888242871839275222246405745257275088548364400416034343698204186575808495617n;

// Versioned domain tags — same strings as runtime 01.
export const DOMAIN_SECRET = 'dtg-zkp/identity-secret/v0';
export const DOMAIN_NULL = 'dtg-zkp/nullifier/v0';

// DOMAIN_TAG_FIELD = sha256('dtg-zkp/nullifier/v0') mod p — must equal the
// constant hardcoded in circuits/nullifier_membership.circom (asserted below).
export const DOMAIN_TAG_FIELD = fieldFromSha256Raw(DOMAIN_NULL);
const EXPECTED_TAG =
  8848404101512072295265332932144711420998576661229779766032777478684075272373n;
if (DOMAIN_TAG_FIELD !== EXPECTED_TAG) {
  throw new Error('domain-tag-derivation-drift: harness and circuit disagree');
}

export const TREE_DEPTH = 20;

// --- sha256 -> field helpers -------------------------------------------------

function fieldFromSha256Raw(s) {
  const h = createHash('sha256').update(s, 'utf8').digest('hex');
  return BigInt('0x' + h) % FIELD_PRIME;
}

// Length-prefixed multi-part sha256 (same discipline as rt01's H) reduced mod p.
export function fieldFromParts(...parts) {
  const h = createHash('sha256');
  for (const part of parts) {
    const b = Buffer.from(String(part), 'utf8');
    const len = Buffer.alloc(4);
    len.writeUInt32BE(b.length);
    h.update(len);
    h.update(b);
  }
  return BigInt('0x' + h.digest('hex')) % FIELD_PRIME;
}

// --- Poseidon (async singleton) ----------------------------------------------

let _poseidon = null;
export async function getPoseidon() {
  if (!_poseidon) _poseidon = await buildPoseidon();
  return _poseidon;
}

export async function poseidonHash(inputs) {
  const poseidon = await getPoseidon();
  return poseidon.F.toObject(poseidon(inputs.map((x) => BigInt(x))));
}

// --- enrolment ----------------------------------------------------------------
// One human -> one secret, deterministically (the lab models sound enrolment;
// anti-Sybil strength comes from the deduplicating enrolment, not the proof).

export async function enrolField(humanId) {
  const secret = fieldFromParts(DOMAIN_SECRET, humanId);
  const blinding = fieldFromParts('blinding', humanId, secret.toString());
  const commitment = await poseidonHash([secret, blinding]);
  return { secret, blinding, commitment };
}

// --- nullifier mirror ----------------------------------------------------------

export async function nullifierField(secret, context) {
  return poseidonHash([DOMAIN_TAG_FIELD, secret, context]);
}

// --- context ------------------------------------------------------------------
// §6.2 canonical descriptor -> digest (canonical module, sha256 hex) -> field.

export function contextField(descriptor) {
  return BigInt('0x' + descriptorDigest(descriptor)) % FIELD_PRIME;
}

// --- transcript ---------------------------------------------------------------
// §15.2 canonical transcript -> digest (canonical module, sha256 hex) -> field.
// Mirrors contextField. This is the public transcriptDigest input the circuit
// binds via the dummy-square constraint (proof-binding, NOT part of the
// nullifier preimage).

export function transcriptField(transcript) {
  return BigInt('0x' + transcriptDigest(transcript)) % FIELD_PRIME;
}

// --- Merkle tree (Poseidon internal nodes, zero-leaf padding) ------------------
// zeros[0] = 0; zeros[i+1] = Poseidon(zeros[i], zeros[i]).

export async function buildTree(commitments, depth = TREE_DEPTH) {
  if (commitments.length === 0) throw new Error('empty-tree');
  if (commitments.length > 2 ** depth) throw new Error('tree-overflow');

  const zeros = [0n];
  for (let i = 0; i < depth; i++) {
    zeros.push(await poseidonHash([zeros[i], zeros[i]]));
  }

  // levels[0] = leaves (sparse: only occupied prefix), levels[d] = [root]
  const levels = [commitments.map((c) => BigInt(c))];
  for (let d = 0; d < depth; d++) {
    const cur = levels[d];
    const next = [];
    for (let j = 0; j < Math.ceil(cur.length / 2); j++) {
      const l = cur[2 * j];
      const r = 2 * j + 1 < cur.length ? cur[2 * j + 1] : zeros[d];
      next.push(await poseidonHash([l, r]));
    }
    levels.push(next);
  }

  const root = levels[depth][0];

  function path(leafIndex) {
    if (leafIndex < 0 || leafIndex >= commitments.length) {
      throw new Error('leaf-index-out-of-range');
    }
    const pathElements = [];
    const pathIndices = [];
    let idx = leafIndex;
    for (let d = 0; d < depth; d++) {
      const sib = idx ^ 1;
      pathElements.push(sib < levels[d].length ? levels[d][sib] : zeros[d]);
      pathIndices.push(idx & 1);
      idx = idx >> 1;
    }
    return { pathElements, pathIndices };
  }

  return { root, path, zeros, levels };
}

// --- witness input -------------------------------------------------------------
// Produces the input JSON the circuit's witness generator consumes.

export async function makeInput({ secret, blinding, tree, leafIndex, context, transcriptDigest }) {
  const { pathElements, pathIndices } = tree.path(leafIndex);
  const nullifier = await nullifierField(secret, context);
  if (transcriptDigest === undefined || transcriptDigest === null) {
    throw new Error('missing-transcriptDigest: pass transcriptField(transcript)');
  }
  return {
    input: {
      secret: secret.toString(),
      blinding: blinding.toString(),
      pathElements: pathElements.map((x) => x.toString()),
      pathIndices: pathIndices.map((x) => x.toString()),
      context: context.toString(),
      root: tree.root.toString(),
      nullifier: nullifier.toString(),
      transcriptDigest: transcriptDigest.toString(),
    },
    nullifier,
  };
}
