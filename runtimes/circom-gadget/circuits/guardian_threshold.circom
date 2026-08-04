pragma circom 2.0.0;

// Third circuit: GUARDIAN t-of-n THRESHOLD — X9's threshold recovery, in-circuit.
//
// Realizes the X9 mitigation ("guardian-set commitments ... recovery proves
// t-of-n attestations from the committed set without revealing which guardians
// signed — membership + threshold in zero knowledge; plus the k-out-of-n
// distinctness discipline") for t = 3:
//
//   "3 pairwise-distinct guardians from the committed guardian set each
//    attest THIS continuity claim in THIS recovery context — without
//    revealing which guardians."
//
//   public:   recoveryContext — the §6.2 recovery-domain descriptor digest,
//             reduced to a BN254 field element. The guardian EPOCH lives
//             INSIDE the descriptor (its `epoch` field), matching the
//             reference model's 'guardian/<descriptorDigest>/<epoch>' scope:
//             one seat per human per recovery context+epoch (§13.4 recovery-
//             domain input, reused; §6.5 intentional in-context linkage).
//             guardianRoot — Merkle root over guardian commitments
//             Poseidon(secret_i, blinding_i): the COMMITTED set (X9 "the
//             holder commits to a guardian set"). One root for ALL legs.
//             claimDigest — the continuity claim: a harness-side hash binding
//             newCommitment + revokedRef + ceremony transcript (the reference
//             model's claimDigest, reduced mod p). Bound to the PROOF only.
//             nullifiers[3] — per-guardian recovery-seat pseudonyms.
//   private:  secret_i, blinding_i, pathElements_i[20], pathIndices_i[20]
//             for i in {1..3}
//   statement:
//     Poseidon(secret_i, blinding_i) ∈ guardianRoot                  (all i)
//     nullifier_i = Poseidon(GUARDIAN_TAG, secret_i, recoveryContext) (all i)
//     nullifier_i ≠ nullifier_j  for all i < j                    (in-circuit)
//     claimSquare = claimDigest²                    (dummy-square, 1 constraint)
//
// Distinctness is the dual-issuer inverse trick, generalized to all C(3,2)=3
// pairs: witness inv = 1/(n_i - n_j), constrain (n_i - n_j) * inv === 1. A
// duplicate guardian seat makes some difference 0, zero has no inverse, and
// the circuit is UNSATISFIABLE — a duplicate guardian cannot even produce a
// proof (vs the reference model's named 'duplicate-guardian-seat' rejection,
// which happens checker-side after the fact).
//
// Claim binding is the ratified dummy-square idiom (nullifier_membership's
// transcriptDigest binding): claimDigest binds the PROOF, not the nullifiers.
// The seat nullifier preimage carries only (tag, secret, recoveryContext) —
// stable per guardian per recovery context+epoch across claims (that is the
// seat property: one seat per context, reuse detectable registry-side) —
// while the proof itself is valid for exactly ONE continuity claim: a
// guardian bundle cannot be transplanted to authorize a different
// replacement commitment.
//
// GUARDIAN_TAG derivation (same sha256-mod-p pattern as DOMAIN_TAG and
// ISSUER_TAG; the circuit-level pin of the reference model's 'guardian/'
// string-domain convention — one governed name, two hash pins):
//   tag string  : 'dtg-zkp/guardian-seat-nullifier/v0'
//   sha256(tag) = 73b6cd8dbb162c686520d25d94d5b3daf378f4e32d817fabd0de983f2517339b
//   GUARDIAN_TAG= sha256(tag) mod p  (p = BN254 scalar field prime)
//               = 8562476688242842477897907163240902665687518953395242745930442724180399436697
// Node one-liner to re-derive:
//   BigInt('0x' + sha256('dtg-zkp/guardian-seat-nullifier/v0')) %
//     21888242871839275222246405745257275088548364400416034343698204186575808495617n
//
// t is FIXED at 3 here (the template parameter shows the generalization; t as
// a profile parameter — who sets it, §6.7 — stays a profile/register question,
// X9 open questions). NOTE: compiled with --O2 (see setup-guardian.mjs) so the
// tripled circuit stays under the cached 2^14 powers-of-tau.

include "circomlib/circuits/poseidon.circom";

// Same selector-based Poseidon Merkle inclusion as nullifier_membership.circom
// (re-declared here because that file closes with its own `component main`).
// pathIndices[i] = 0 -> current node is the LEFT child (sibling on the right)
// pathIndices[i] = 1 -> current node is the RIGHT child (sibling on the left)
template MerkleInclusion(depth) {
    signal input leaf;
    signal input pathElements[depth];
    signal input pathIndices[depth];
    signal output root;

    signal cur[depth + 1];
    cur[0] <== leaf;

    component hashers[depth];
    signal left[depth];
    signal right[depth];

    for (var i = 0; i < depth; i++) {
        // path index must be a bit
        pathIndices[i] * (1 - pathIndices[i]) === 0;

        // 2-way selector (one multiplication each, quadratic-safe)
        left[i]  <== cur[i] + pathIndices[i] * (pathElements[i] - cur[i]);
        right[i] <== pathElements[i] + pathIndices[i] * (cur[i] - pathElements[i]);

        hashers[i] = Poseidon(2);
        hashers[i].inputs[0] <== left[i];
        hashers[i].inputs[1] <== right[i];
        cur[i + 1] <== hashers[i].out;
    }

    root <== cur[depth];
}

// One guardian leg: commitment opens + sits under the committed guardian root;
// recovery-seat nullifier recomputes from the guardian secret.
template GuardianLeg(depth) {
    signal input secret;
    signal input blinding;
    signal input pathElements[depth];
    signal input pathIndices[depth];
    signal input recoveryContext;
    signal input guardianRoot;
    signal output nullifierOut;

    // GUARDIAN_TAG = sha256('dtg-zkp/guardian-seat-nullifier/v0') mod p — header.
    var GUARDIAN_TAG = 8562476688242842477897907163240902665687518953395242745930442724180399436697;

    // commitment = Poseidon(secret, blinding)
    component commit = Poseidon(2);
    commit.inputs[0] <== secret;
    commit.inputs[1] <== blinding;

    // commitment ∈ guardianRoot
    component mt = MerkleInclusion(depth);
    mt.leaf <== commit.out;
    for (var i = 0; i < depth; i++) {
        mt.pathElements[i] <== pathElements[i];
        mt.pathIndices[i] <== pathIndices[i];
    }
    mt.root === guardianRoot;

    // nullifier = Poseidon(GUARDIAN_TAG, secret, recoveryContext)
    component nul = Poseidon(3);
    nul.inputs[0] <== GUARDIAN_TAG;
    nul.inputs[1] <== secret;
    nul.inputs[2] <== recoveryContext;
    nullifierOut <== nul.out;
}

template GuardianThreshold(depth, t) {
    // private — one set per guardian leg
    signal input secret[t];
    signal input blinding[t];
    signal input pathElements[t][depth];
    signal input pathIndices[t][depth];
    // public (declared in main below)
    signal input recoveryContext; // §6.2 recovery-domain descriptor digest mod p (epoch inside)
    signal input guardianRoot;    // ONE committed-guardian-set root for all legs
    signal input claimDigest;     // the continuity claim (newCommitment + revokedRef + transcript)
    signal input nullifiers[t];   // per-guardian recovery-seat pseudonyms

    component legs[t];
    for (var i = 0; i < t; i++) {
        legs[i] = GuardianLeg(depth);
        legs[i].secret <== secret[i];
        legs[i].blinding <== blinding[i];
        for (var j = 0; j < depth; j++) {
            legs[i].pathElements[j] <== pathElements[i][j];
            legs[i].pathIndices[j] <== pathIndices[i][j];
        }
        legs[i].recoveryContext <== recoveryContext;
        legs[i].guardianRoot <== guardianRoot;
        legs[i].nullifierOut === nullifiers[i];
    }

    // Pairwise distinctness (X9's k-out-of-n distinctness discipline,
    // in-circuit) for all C(t,2) pairs, via the dual-issuer inverse trick:
    // each difference must have a multiplicative inverse. A duplicate guardian
    // seat gives some diff = 0, which has no inverse, so diff * inv === 1 is
    // UNSATISFIABLE — witness generation fails; there is no proof to reject.
    // (The `!= 0 ? 1/diff : 0` hint keeps the witness calculator from dividing
    // by zero; the honest-case value is 1/diff and the constraint enforces it.)
    var npairs = t * (t - 1) / 2;
    signal diff[npairs];
    signal inv[npairs];
    var k = 0;
    for (var i = 0; i < t; i++) {
        for (var j = i + 1; j < t; j++) {
            diff[k] <== legs[i].nullifierOut - legs[j].nullifierOut;
            inv[k] <-- diff[k] != 0 ? 1 / diff[k] : 0;
            diff[k] * inv[k] === 1;
            k++;
        }
    }

    // Claim binding — dummy-square idiom (the ratified pattern from
    // nullifier_membership.circom's transcript binding, 1 constraint). Binds
    // the continuity claim into the PROOF only; the seat nullifier preimages
    // above are deliberately unchanged (nullifier binds the RECOVERY CONTEXT,
    // claim binds the PRESENTATION — a guardian bundle proves for exactly one
    // replacement and cannot be transplanted).
    signal claimSquare <== claimDigest * claimDigest;
}

component main {public [recoveryContext, guardianRoot, claimDigest, nullifiers]} = GuardianThreshold(20, 3);
