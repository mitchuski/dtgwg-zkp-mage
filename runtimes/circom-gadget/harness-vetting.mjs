// JS-side mirror of the hidden-vetting circuits (record 024, Groth16 route)
// plus the COMMUNITY's side: challenge minting, spent sets, and the admission
// check that turns k leg proofs + one binding proof into counted facts.
//
// Reuses harness.mjs's field helpers, Poseidon singleton and tree builder
// unmodified (read-only import), as harness-guardian.mjs does.

import { createHash } from 'node:crypto';
import { FIELD_PRIME, fieldFromParts, poseidonHash, buildTree, TREE_DEPTH } from './harness.mjs';

export { FIELD_PRIME, buildTree, TREE_DEPTH, fieldFromParts };

function fieldFromSha256Raw(s) {
  return BigInt('0x' + createHash('sha256').update(s, 'utf8').digest('hex')) % FIELD_PRIME;
}

// Domain tags — must equal the constants hardcoded in the circuits (asserted).
export const VETTING_TAG = fieldFromSha256Raw('dtg-zkp/vetting-tag/v0');
export const SERIAL_TAG = fieldFromSha256Raw('dtg-zkp/vetting-serial/v0');
export const APPLICANT_TAG = fieldFromSha256Raw('dtg-zkp/applicant-id/v0');
const PINNED = [
  [VETTING_TAG, 4606132320895005879334951217389072920298855076140507235083831243602269062142n],
  [SERIAL_TAG, 2061066891966156053102580143390250433203275977903845741267834221286187527707n],
  [APPLICANT_TAG, 7434054201767092397859473897144320119247247662147169725073439840466139704n],
];
for (const [a, b] of PINNED) if (a !== b) throw new Error('vetting-tag-derivation-drift: harness and circuit disagree');

// --- parties ------------------------------------------------------------------

export async function enrolVetter(vetterId) {
  const secret = fieldFromParts('dtg-zkp/vetter-secret/v0', vetterId);
  const blinding = fieldFromParts('vetter-blinding', vetterId, secret.toString());
  return { id: vetterId, secret, blinding, commitment: await poseidonHash([secret, blinding]) };
}

export async function startApplication(applicationId) {
  const appSecret = fieldFromParts('dtg-zkp/application-secret/v0', applicationId);
  return { appSecret, applicantId: await poseidonHash([APPLICANT_TAG, appSecret]) };
}

export const periodField = (label) => fieldFromParts('dtg-zkp/vetter-period/v0', label);

// The attested statement's facts. Dates only, never a time of day.
export function statementDigestField(s) {
  return fieldFromParts('dtg-zkp/vetting-statement/v0', s.method, s.claims.join(','), s.validFrom, s.validUntil, s.identityCommitment, s.requirementsDigest);
}

export const tagField = (secret, applicantId) => poseidonHash([VETTING_TAG, secret, applicantId]);
export const serialField = (secret, period, slot) => poseidonHash([SERIAL_TAG, secret, period, BigInt(slot)]);

// --- inputs -------------------------------------------------------------------

export async function makeAttestInput({ vetter, tree, leafIndex, applicantId, period, cap, slot, statementDigest }) {
  const p = tree.path(leafIndex);
  return {
    secret: vetter.secret.toString(),
    blinding: vetter.blinding.toString(),
    pathElements: p.pathElements.map(String),
    pathIndices: p.pathIndices.map(String),
    slot: String(slot),
    vetterRoot: tree.root.toString(),
    applicantId: applicantId.toString(),
    period: period.toString(),
    cap: String(cap),
    statementDigest: statementDigest.toString(),
    tag: (await tagField(vetter.secret, applicantId)).toString(),
    serial: (await serialField(vetter.secret, period, slot)).toString(),
  };
}

// Public-signal order of vetting_attest (circom: public inputs in declaration order).
export const ATTEST_SIGNALS = ['vetterRoot', 'applicantId', 'period', 'cap', 'statementDigest', 'tag', 'serial'];
export const attestSignals = (ps) => Object.fromEntries(ATTEST_SIGNALS.map((k, i) => [k, ps[i]]));

// The applicant's transcript: the community's challenge, the criterion version,
// the join DID and every leg's public signals, in submission order.
export function transcriptDigestField({ challenge, requirementsDigest, joinDid, legs }) {
  return fieldFromParts('dtg-zkp/vetting-transcript/v0', challenge, requirementsDigest, joinDid, ...legs.map((l) => l.publicSignals.join(':')));
}

export function makeBindInput({ appSecret, applicantId, transcriptDigest }) {
  return { appSecret: appSecret.toString(), applicantId: applicantId.toString(), transcriptDigest: transcriptDigest.toString() };
}

// --- the community ------------------------------------------------------------
// Holds the live root, period and cap, mints single-use challenges, keeps the
// spent sets, and counts. Rejection codes are record 024's.

export class Community {
  constructor({ tree, period, cap, k, requirementsDigest, verifyAttest, verifyBind }) {
    Object.assign(this, { tree, period, cap, k, requirementsDigest, verifyAttest, verifyBind });
    this.challenges = new Map(); // challenge -> { applicantId, spent }
    this.spentSerials = new Set();
    this.n = 0;
  }
  rotateRoot(tree) { this.tree = tree; } // per-vetter revocation: new root, nobody re-issued
  mintChallenge(applicantId) {
    const c = `challenge:${createHash('sha256').update(`${this.n++}:${applicantId}`).digest('hex').slice(0, 32)}`;
    this.challenges.set(c, { applicantId: String(applicantId), spent: false });
    return c;
  }
  async admit({ challenge, joinDid, applicantId, legs, bind, statements }) {
    const ch = this.challenges.get(challenge);
    if (!ch) return { ok: false, code: 'challenge-not-minted' };
    if (ch.spent) return { ok: false, code: 'challenge-replayed' };
    if (ch.applicantId !== String(applicantId)) return { ok: false, code: 'challenge-not-minted' };
    if (legs.length < this.k) return { ok: false, code: 'attestation-count-below-k' };
    const expected = transcriptDigestField({ challenge, requirementsDigest: this.requirementsDigest, joinDid, legs });
    if (bind.publicSignals[0] !== String(applicantId)) return { ok: false, code: 'join-did-mismatch' };
    if (bind.publicSignals[1] !== expected.toString()) return { ok: false, code: 'transcript-digest-mismatch' };
    if (!(await this.verifyBind(bind.proof, bind.publicSignals))) return { ok: false, code: 'binding-proof-invalid' };
    const tags = new Set(), serials = new Set();
    for (let i = 0; i < legs.length; i++) {
      const s = attestSignals(legs[i].publicSignals);
      if (s.vetterRoot !== this.tree.root.toString()) return { ok: false, code: 'vetter-root-stale', leg: i };
      if (s.applicantId !== String(applicantId)) return { ok: false, code: 'join-did-mismatch', leg: i };
      if (s.period !== this.period.toString() || s.cap !== String(this.cap)) return { ok: false, code: 'vetter-label-not-live', leg: i };
      if (s.statementDigest !== statementDigestField(statements[i]).toString()) return { ok: false, code: 'statement-metadata-mismatch', leg: i };
      if (statements[i].requirementsDigest !== this.requirementsDigest) return { ok: false, code: 'requirements-digest-mismatch', leg: i };
      if (!(await this.verifyAttest(legs[i].proof, legs[i].publicSignals))) return { ok: false, code: 'attestation-proof-invalid', leg: i };
      if (tags.has(s.tag)) return { ok: false, code: 'tag-duplicate', leg: i };
      if (serials.has(s.serial) || this.spentSerials.has(s.serial)) return { ok: false, code: 'token-serial-spent', leg: i };
      tags.add(s.tag);
      serials.add(s.serial);
    }
    ch.spent = true;
    for (const s of serials) this.spentSerials.add(s);
    // the counted facts: tags where the named path has vetter DIDs
    return { ok: true, facts: legs.map((l, i) => ({ issuer: attestSignals(l.publicSignals).tag, method: statements[i].method })) };
  }
}
