pragma circom 2.0.0;

// Sibling circuit: DUAL-ISSUER AGGREGATION — X8's k=2 tier, in-circuit.
//
// Realizes the §12.5 ZK statement (X8 "ZK realization" section) for k=2:
//
//   "2 pairwise-distinct members of the accepted issuer set at named epoch
//    root R each contribute to this show — without revealing which members."
//
//   public:   showContext — the §15.2 canonical show-transcript digest,
//             reduced to a BN254 field element (the show IS the scope: the
//             per-issuer nullifier is show-scoped, X8 / §15.2)
//             root       — Merkle root of the accepted issuer set (one root
//             for BOTH legs — §12.4: mixed snapshots are a §26.1 rejection)
//             nullifier1, nullifier2 — per-issuer per-show distinctness
//             pseudonyms
//   private:  secret_i, blinding_i, pathElements_i[20], pathIndices_i[20]
//             for i in {1,2}
//   statement:
//     Poseidon(secret_i, blinding_i) ∈ root                    (both i)
//     nullifier_i = Poseidon(ISSUER_TAG, secret_i, showContext) (both i)
//     nullifier1 ≠ nullifier2                                   (in-circuit)
//
// The distinctness constraint is the new move: (nullifier1 - nullifier2)
// must have a multiplicative inverse. The prover witnesses inv = 1/(n1-n2)
// and the circuit constrains (n1-n2)*inv === 1. If the same issuer secret is
// used twice, n1 == n2, the difference is 0, no inverse exists, and NO
// WITNESS SATISFIES THE CIRCUIT — a duplicate issuer cannot even produce a
// proof, as opposed to the reference model's named 'duplicate-issuer-in-show'
// rejection which happens verifier-side after the fact.
//
// ISSUER_TAG derivation (same sha256-mod-p pattern as DOMAIN_TAG in
// nullifier_membership.circom; tag string matches the multi-issuer reference
// model's DOMAIN_ISSUER_SHOW_NULLIFIER):
//   tag string : 'dtg-zkp/issuer-show-nullifier/v0'
//   sha256(tag)= 790b4d621ed2069a7dc95786678c4a3ed0a5e86ae4b100a9a2c585f5de5d0c77
//   ISSUER_TAG = sha256(tag) mod p  (p = BN254 scalar field prime)
//              = 10973338332398489381181448044177053429928920939795168163925594436592914467957
// Node one-liner to re-derive:
//   BigInt('0x' + sha256('dtg-zkp/issuer-show-nullifier/v0')) %
//     21888242871839275222246405745257275088548364400416034343698204186575808495617n
//
// NOTE: compiled with --O2 (see setup-dual.mjs) so the doubled circuit stays
// under the cached 2^14 powers-of-tau; --O1 total would be ~23k constraints.

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

// One issuer leg: commitment opens + sits under the root; show-scoped
// nullifier recomputes from the issuer secret.
template IssuerLeg(depth) {
    signal input secret;
    signal input blinding;
    signal input pathElements[depth];
    signal input pathIndices[depth];
    signal input showContext;
    signal input root;
    signal output nullifierOut;

    // ISSUER_TAG = sha256('dtg-zkp/issuer-show-nullifier/v0') mod p — header.
    var ISSUER_TAG = 10973338332398489381181448044177053429928920939795168163925594436592914467957;

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

    // nullifier = Poseidon(ISSUER_TAG, secret, showContext)
    component nul = Poseidon(3);
    nul.inputs[0] <== ISSUER_TAG;
    nul.inputs[1] <== secret;
    nul.inputs[2] <== showContext;
    nullifierOut <== nul.out;
}

template DualIssuer(depth) {
    // private — issuer 1
    signal input secret1;
    signal input blinding1;
    signal input pathElements1[depth];
    signal input pathIndices1[depth];
    // private — issuer 2
    signal input secret2;
    signal input blinding2;
    signal input pathElements2[depth];
    signal input pathIndices2[depth];
    // public (declared in main below)
    signal input showContext; // §15.2 transcript digest reduced mod p
    signal input root;        // ONE accepted-issuer-set root for both legs
    signal input nullifier1;  // issuer 1's show-scoped pseudonym
    signal input nullifier2;  // issuer 2's show-scoped pseudonym

    component leg1 = IssuerLeg(depth);
    leg1.secret <== secret1;
    leg1.blinding <== blinding1;
    for (var i = 0; i < depth; i++) {
        leg1.pathElements[i] <== pathElements1[i];
        leg1.pathIndices[i] <== pathIndices1[i];
    }
    leg1.showContext <== showContext;
    leg1.root <== root;
    leg1.nullifierOut === nullifier1;

    component leg2 = IssuerLeg(depth);
    leg2.secret <== secret2;
    leg2.blinding <== blinding2;
    for (var i = 0; i < depth; i++) {
        leg2.pathElements[i] <== pathElements2[i];
        leg2.pathIndices[i] <== pathIndices2[i];
    }
    leg2.showContext <== showContext;
    leg2.root <== root;
    leg2.nullifierOut === nullifier2;

    // Distinctness (assumption A3, in-circuit): nullifier1 != nullifier2,
    // enforced by witnessing the inverse of the difference. If the two legs
    // use the same issuer secret the difference is 0, 0 has no inverse, and
    // diff * inv === 1 is UNSATISFIABLE — witness generation fails; there is
    // no proof to reject. (The `!= 0 ? 1/diff : 0` hint keeps the witness
    // calculator from dividing by zero; the honest-case value is 1/diff and
    // the constraint is what enforces it.)
    signal diff;
    diff <== leg1.nullifierOut - leg2.nullifierOut;
    signal inv;
    inv <-- diff != 0 ? 1 / diff : 0;
    diff * inv === 1;
}

component main {public [showContext, root, nullifier1, nullifier2]} = DualIssuer(20);
