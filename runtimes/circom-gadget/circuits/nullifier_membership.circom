pragma circom 2.0.0;

// Shared gadget: Poseidon nullifier + Merkle set membership (depth 20).
//
// This is the circuit that O2 (PHC-by-nullifier, M3), O4 (registry
// membership), multi-issuer (k-of-n seat), and guardian-recovery (set
// membership) all converge on. It proves, in zero knowledge:
//
//   public:   context (the §6.2 canonical descriptor digest, reduced to a
//             BN254 field element — never an opaque string), root R,
//             nullifier N, transcriptDigest T (the §15.2 canonical transcript
//             digest, reduced mod p)
//   private:  secret s, blinding r, Merkle path (elements + indices)
//   statement: Poseidon(s, r) ∈ R  ∧  N = Poseidon(DOMAIN_TAG, s, context)
//              ∧  T is bound into the proof (dummy-square, 1 constraint)
//
// Public signal order (groth16 publicSignals, declaration order):
//   [context, root, nullifier, transcriptDigest]
//
// Transcript binding (added 2026-07-18, per the Semaphore v4 cross-check,
// divergence 7 / recommendation 4): transcriptDigest is bound with the
// dummy-square idiom Semaphore uses for its `message` input — one quadratic
// constraint that makes the proof valid ONLY against the exact public
// transcript digest it was generated for. THE DISTINCTION: the transcript
// binds the PROOF, not the nullifier. The nullifier preimage is UNCHANGED —
// still Poseidon(3)([DOMAIN_TAG, secret, context]) — so the nullifier stays
// stable per context across presentations (that is its job: scoped reuse
// detection, §13). The PROOF becomes single-presentation: replaying a
// captured proof under a different §15.2 transcript (the §15.1/§26.1
// replay-cross-transcript rejection) now fails cryptographically at verify
// time, not just registry-side.
//
// Hash pinned: Poseidon over BN254 (circomlib parameters). rt01 NOTES item 2
// ("the spec must pin the hash — nullifier values differ by hash") is answered
// concretely here: this circuit's nullifiers are Poseidon nullifiers, and the
// versioned domain tag below is part of the pin.
//
// DOMAIN_TAG derivation (documented, reproducible):
//   tag string : 'dtg-zkp/nullifier/v0'   (same tag as runtime 01)
//   sha256(tag) = a4bcf045cf5929f088f9c19edf3d60c208f8278f931511df6336864b02fea8b8
//   DOMAIN_TAG  = sha256(tag) mod p  (p = BN254 scalar field prime)
//               = 8848404101512072295265332932144711420998576661229779766032777478684075272373
// Node one-liner to re-derive:
//   BigInt('0x' + sha256('dtg-zkp/nullifier/v0')) %
//     21888242871839275222246405745257275088548364400416034343698204186575808495617n

include "circomlib/circuits/poseidon.circom";

// Standard selector-based Poseidon Merkle inclusion.
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

        // 2-way selector (one multiplication each, quadratic-safe):
        //   idx = 0: left = cur,  right = sibling
        //   idx = 1: left = sibling, right = cur
        left[i]  <== cur[i] + pathIndices[i] * (pathElements[i] - cur[i]);
        right[i] <== pathElements[i] + pathIndices[i] * (cur[i] - pathElements[i]);

        hashers[i] = Poseidon(2);
        hashers[i].inputs[0] <== left[i];
        hashers[i].inputs[1] <== right[i];
        cur[i + 1] <== hashers[i].out;
    }

    root <== cur[depth];
}

template NullifierMembership(depth) {
    // private
    signal input secret;
    signal input blinding;
    signal input pathElements[depth];
    signal input pathIndices[depth];
    // public (declared in main below)
    signal input context;          // §6.2 descriptor digest reduced mod p
    signal input root;             // enrolment-set / registry Merkle root
    signal input nullifier;        // claimed per-context pseudonym
    signal input transcriptDigest; // §15.2 canonical transcript digest mod p

    // DOMAIN_TAG = sha256('dtg-zkp/nullifier/v0') mod p — derivation in header.
    var DOMAIN_TAG = 8848404101512072295265332932144711420998576661229779766032777478684075272373;

    // commitment = Poseidon(secret, blinding)
    component commit = Poseidon(2);
    commit.inputs[0] <== secret;
    commit.inputs[1] <== blinding;

    // commitment ∈ root
    component mt = MerkleInclusion(depth);
    mt.leaf <== commit.out;
    for (var i = 0; i < depth; i++) {
        mt.pathElements[i] <== pathElements[i];
        mt.pathIndices[i] <== pathIndices[i];
    }
    mt.root === root;

    // nullifier = Poseidon(DOMAIN_TAG, secret, context)
    component nul = Poseidon(3);
    nul.inputs[0] <== DOMAIN_TAG;
    nul.inputs[1] <== secret;
    nul.inputs[2] <== context;
    nul.out === nullifier;

    // Transcript binding — dummy-square idiom (Semaphore v4's `message`
    // binding, 1 constraint). Binds the §15.2 transcript digest into the
    // PROOF only; the nullifier preimage above is deliberately unchanged
    // (nullifier binds the CONTEXT, transcript binds the PRESENTATION).
    signal transcriptSquare <== transcriptDigest * transcriptDigest;
}

component main {public [context, root, nullifier, transcriptDigest]} = NullifierMembership(20);
