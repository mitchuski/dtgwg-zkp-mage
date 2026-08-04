// Aggregated multi-issuer show — X8 M3 reference model of the §12.5 statement:
//
//   "k pairwise-distinct members of the accepted issuer set at named epoch
//    root R each signed an attestation over the same subject commitment
//    attesting the predicate — without revealing which members."
//
// This models the ACCOUNTING the circuit will prove, not the ZK itself: k
// instances of the membership gadget against the SAME named root (§12.4 —
// inconsistent snapshots are a §26.1 rejection), plus distinctness via
// per-issuer, per-show nullifiers N_i = H(domain, issuer_id_i, transcript
// digest). k distinct N_i prove k distinct issuers while revealing none —
// the §5.12 scoped-reuse discipline reused at the issuer level: the nullifier
// establishes distinctness-within-this-show, not issuer identity, and the
// show-transcript domain separation (§15.2) prevents cross-show issuer
// correlation.
//
// In this model each member carries its issuerId as a MODELLED PRIVATE
// WITNESS: the verifier function plays the circuit's role and may see it, but
// the emitted STATEMENT must not contain it (test A8 scans structurally). The
// statement reports {effectiveK, bound}, never raw k as confidence — the
// independence register (registry.mjs) decides how many factors actually
// multiply.
//
// k itself is public and IS a disclosure (§10.4/§18.4: a rare k fingerprints
// the verifier and narrows the holder population), so k is confined to a
// small governed tier vocabulary; requests outside it are a §26.1 rejection.

import { H } from '../01-uniqueness-nullifier/src/nullifier.mjs';
import { transcriptDigest } from '../canonical/canonical.mjs';
import { getIssuer, aggregateBound } from './registry.mjs';

export const DOMAIN_ISSUER_SHOW_NULLIFIER = 'dtg-zkp/issuer-show-nullifier/v0';
export const DOMAIN_ISSUER_MEMBERSHIP = 'dtg-zkp/issuer-membership/v0';

// Governed tier vocabulary — registered per profile (X3 bundle-profile move).
export const K_TIERS = [1, 2, 3];

export function issuerShowNullifier(issuerId, tDigest) {
  return H(DOMAIN_ISSUER_SHOW_NULLIFIER, issuerId, tDigest);
}

// One member of the aggregated show. membershipProof models the Merkle
// inclusion gadget: root + a digest binding the issuer into that root. The
// issuerId field inside it is the modelled private witness (concealed by the
// real circuit).
export function makeMember(issuerId, { snapshot, tDigest, subjectCommitment, predicate }) {
  return {
    membershipProof: {
      root: snapshot.root,
      issuerId, // modelled private witness — never copied into the statement
      inclusion: H(DOMAIN_ISSUER_MEMBERSHIP, snapshot.root, issuerId),
    },
    distinctnessNullifier: issuerShowNullifier(issuerId, tDigest),
    attestation: { subjectCommitment, predicate },
  };
}

export function makeAggregatedShow({
  k,
  issuerIds,
  snapshot,
  transcript,
  subjectCommitment,
  predicate = 'PR-PER/1',
}) {
  if (!K_TIERS.includes(k)) throw new Error('k-outside-tier');
  if (!Array.isArray(issuerIds) || issuerIds.length !== k) {
    throw new Error('k-member-mismatch');
  }
  const tDigest = transcriptDigest(transcript);
  const members = issuerIds.map((id) =>
    makeMember(id, { snapshot, tDigest, subjectCommitment, predicate })
  );
  return { k, transcript, subjectCommitment, predicate, members };
}

// --- verifier -----------------------------------------------------------------
// Atomic accept/reject. Named rejections (fixture-register candidates):
//   'mixed-registry-roots'          members proved against ≠ roots (§12.4/§26.1)
//   'issuer-not-in-registry'        a member's issuer is outside the snapshot
//   'invalid-membership-proof'      inclusion digest does not recompute
//   'k-outside-tier'                k not in the governed tier vocabulary
//   'k-member-mismatch'             declared k ≠ member count
//   'nullifier-mismatch'            a nullifier does not recompute over this
//                                   show's transcript digest (replay shape)
//   'duplicate-issuer-in-show'      nullifier collision — A3 distinctness fails
//   'subject-commitment-mismatch'   members bind different subjects — A4 fails
//   'predicate-mismatch'            members attest different predicates — that
//                                   is composition (X3), not aggregation
//   'stale-epsilon:<issuerId>'      a member's ε is past its horizon at `now`
export function verifyAggregated(show, snapshot, now) {
  const reject = (code) => ({ ok: false, rejection: code });
  const members = Array.isArray(show?.members) ? show.members : [];
  if (members.length === 0) return reject('k-member-mismatch');

  // 1. Same named root, and it is THIS snapshot's root (§12.4).
  const roots = new Set(members.map((m) => m.membershipProof?.root));
  if (roots.size !== 1 || !roots.has(snapshot.root)) {
    return reject('mixed-registry-roots');
  }

  // 2. Membership: every issuer in the registry, inclusion recomputes.
  for (const m of members) {
    const id = m.membershipProof.issuerId;
    if (!getIssuer(snapshot, id)) return reject('issuer-not-in-registry');
    if (m.membershipProof.inclusion !== H(DOMAIN_ISSUER_MEMBERSHIP, snapshot.root, id)) {
      return reject('invalid-membership-proof');
    }
  }

  // 3. k: governed tier, and the declared k is the member count.
  if (!K_TIERS.includes(show.k)) return reject('k-outside-tier');
  if (members.length !== show.k) return reject('k-member-mismatch');

  // 4. Distinctness: k distinct per-show nullifiers, each recomputing over
  //    THIS show's transcript digest.
  const tDigest = transcriptDigest(show.transcript);
  const nullifiers = new Set();
  for (const m of members) {
    const expected = issuerShowNullifier(m.membershipProof.issuerId, tDigest);
    if (m.distinctnessNullifier !== expected) return reject('nullifier-mismatch');
    if (nullifiers.has(m.distinctnessNullifier)) {
      return reject('duplicate-issuer-in-show');
    }
    nullifiers.add(m.distinctnessNullifier);
  }

  // 5. Same proposition (A4): one subject commitment, one predicate.
  for (const m of members) {
    if (m.attestation.subjectCommitment !== show.subjectCommitment) {
      return reject('subject-commitment-mismatch');
    }
    if (m.attestation.predicate !== show.predicate) {
      return reject('predicate-mismatch');
    }
  }

  // 6. The bound, evaluated at the named time: independence collapse via the
  //    register, staleness via the ε horizon (X6 clock).
  const issuerIds = members.map((m) => m.membershipProof.issuerId);
  const { bound, effectiveK, staleMembers } = aggregateBound(issuerIds, snapshot, now);
  if (staleMembers.length > 0) return reject(`stale-epsilon:${staleMembers[0]}`);

  // The verified statement: reports effectiveK and the bound — NOT raw k as
  // confidence — and carries no issuer identifiers (§12.3 concealment mode 4).
  return {
    ok: true,
    statement: {
      predicate: show.predicate,
      subjectCommitment: show.subjectCommitment,
      root: snapshot.root,
      epoch: snapshot.epoch,
      effectiveK,
      bound,
      evaluatedAt: now,
    },
  };
}
