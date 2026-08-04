// Nullifier / per-context pseudonym — reference construction for the
// "Uniqueness within a context" predicate (Section 4 of the strawman).
//
// This is a *reference model*, not the circuit. It demonstrates the ALGEBRA the
// ZKP will prove in zero knowledge; the circom circuit (next step) proves the
// same relations without revealing the secret.
//
// Hash choice: SHA-256 via Node crypto so this runs offline with zero deps. The
// SNARK version swaps this for a field-friendly hash (Poseidon). The security
// argument (determinism + collision/pre-image resistance) is identical; only the
// arithmetization changes. That swap is the one thing NOTES.md flags to the spec.

import { createHash } from 'node:crypto';

const H = (...parts) => {
  const h = createHash('sha256');
  // domain-separate + length-prefix each field so H(a,b) != H(a||b)
  for (const p of parts) {
    const b = Buffer.isBuffer(p) ? p : Buffer.from(String(p), 'utf8');
    const len = Buffer.alloc(4);
    len.writeUInt32BE(b.length);
    h.update(len);
    h.update(b);
  }
  return h.digest('hex');
};

// ---------------------------------------------------------------------------
// Enrolment. A deduplicating biometric enrolment maps ONE human -> ONE identity
// secret `s`. The strawman's design note is explicit: the anti-Sybil strength
// comes from this enrolment, NOT from the proof. We model that assumption here
// as `enrol(humanId)` being deterministic per human — the runtime's job is to
// show what the nullifier gives you *given* a sound enrolment.
// ---------------------------------------------------------------------------

const DOMAIN_SECRET = 'dtg-zkp/identity-secret/v0';
const DOMAIN_COMMIT = 'dtg-zkp/enrolment-commitment/v0';
const DOMAIN_NULL = 'dtg-zkp/nullifier/v0';

// One human -> one secret. In reality `s` is derived inside the accredited
// issuer from a biometric template that reliably maps a person to one value.
export function enrol(humanId) {
  const s = H(DOMAIN_SECRET, humanId); // the identity secret, never revealed
  const r = H('blinding', humanId, s); // enrolment blinding factor
  const commitment = H(DOMAIN_COMMIT, s, r); // published to the accredited set
  return { secret: s, blinding: r, commitment };
}

// The per-context pseudonym. Deterministic in (secret, context), unlinkable
// across contexts to anyone who does not know `secret`.
export function nullifier(secret, context) {
  return H(DOMAIN_NULL, secret, context);
}

// ---------------------------------------------------------------------------
// What the ZKP proves (modelled, not executed in ZK here):
//   public inputs : context c, nullifier N, accredited enrolment set root
//   private inputs: secret s, blinding r, membership path
//   statement     : commitment(s, r) is in the accredited set
//                   AND N == nullifier(s, c)
// A verifier learns N and that it was produced by *some* enrolled human for
// context c — never which human, never s.
// ---------------------------------------------------------------------------

// Verifier-side bookkeeping: one nullifier set per context. A repeat nullifier
// in the same context is a duplicate human (Sybil), detected without any global
// identifier and without learning identity.
export class ContextRegistry {
  constructor(context) {
    this.context = context;
    this.seen = new Set();
  }
  // returns { admitted, reason }
  present(nullifierValue) {
    if (this.seen.has(nullifierValue)) {
      return { admitted: false, reason: 'duplicate-human-in-context' };
    }
    this.seen.add(nullifierValue);
    return { admitted: true, reason: 'first-enrolment' };
  }
}

export { H };
