pragma circom 2.0.0;

// Fourth circuit: HIDDEN-VETTING ATTESTATION — one vetter's leg of record 024
// (hidden-vetting admission), the Groth16 route (record 024 option 3).
//
// Each vetter proves its OWN leg; the applicant later binds k legs to the
// community's challenge with vetting_bind.circom. The split is forced, not
// chosen: the distinctness tag must be derived from the vetter's secret (a tag
// derived from anything public — the vetter's leaf, its DID — the community
// could recompute for every enrolled vetter and so de-anonymise), and the
// applicant does not hold the vetters' secrets. A circuit route therefore gets
// k leg proofs plus one binding proof, unless it adds recursion or aggregation
// (not built here).
//
//   "The holder of a leaf of the current enrolled-vetter set attests THIS
//    applicant's identifier with THIS statement, spending one of its `cap`
//    attestation slots for THIS period — without revealing which vetter."
//
//   public:   vetterRoot      — Merkle root over enrolled-vetter commitments
//                               Poseidon(secret, blinding) for the live period.
//                               Revoking one vetter = removing its leaf and
//                               publishing a new root; nobody else is re-issued.
//             applicantId     — the applicant's per-application identifier,
//                               Poseidon(APPLICANT_TAG, appSecret) (vetting_bind)
//             period          — the vetter class label's period, as a field
//             cap             — attestations each vetter may make per period
//             statementDigest — the attested statement's facts (method, claims,
//                               date-granular window, identity commitment,
//                               requirements digest), hashed harness-side;
//                               bound to the PROOF by the dummy-square idiom
//             tag             — Poseidon(VETTING_TAG, secret, applicantId):
//                               one per vetter per applicant (record 002 with
//                               the applicant as scope), unlinkable across
//                               applicants
//             serial          — Poseidon(SERIAL_TAG, secret, period, slot),
//                               slot < cap: the token serial, checked against
//                               the community's spent set. A vetter has exactly
//                               `cap` serials per period, derived from its own
//                               secret — a PER-VETTER velocity cap with no token
//                               issuance at all (nothing issued, so no
//                               issuance pattern to hide).
//   private:  secret, blinding, pathElements[20], pathIndices[20], slot
//
// Domain tags (sha256(tag string) mod p, BN254 scalar field; re-derived and
// asserted in harness-vetting.mjs):
//   'dtg-zkp/vetting-tag/v0'    = 4606132320895005879334951217389072920298855076140507235083831243602269062142
//   'dtg-zkp/vetting-serial/v0' = 2061066891966156053102580143390250433203275977903845741267834221286187527707

include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/bitify.circom";

// Same selector-based Poseidon Merkle inclusion as the other lab circuits.
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
        pathIndices[i] * (1 - pathIndices[i]) === 0;
        left[i]  <== cur[i] + pathIndices[i] * (pathElements[i] - cur[i]);
        right[i] <== pathElements[i] + pathIndices[i] * (cur[i] - pathElements[i]);
        hashers[i] = Poseidon(2);
        hashers[i].inputs[0] <== left[i];
        hashers[i].inputs[1] <== right[i];
        cur[i + 1] <== hashers[i].out;
    }
    root <== cur[depth];
}

template VettingAttest(depth) {
    signal input secret;
    signal input blinding;
    signal input pathElements[depth];
    signal input pathIndices[depth];
    signal input slot;

    signal input vetterRoot;
    signal input applicantId;
    signal input period;
    signal input cap;
    signal input statementDigest;
    signal input tag;
    signal input serial;

    var VETTING_TAG = 4606132320895005879334951217389072920298855076140507235083831243602269062142;
    var SERIAL_TAG = 2061066891966156053102580143390250433203275977903845741267834221286187527707;

    // enrolled: Poseidon(secret, blinding) is a leaf of vetterRoot
    component commit = Poseidon(2);
    commit.inputs[0] <== secret;
    commit.inputs[1] <== blinding;
    component mt = MerkleInclusion(depth);
    mt.leaf <== commit.out;
    for (var i = 0; i < depth; i++) {
        mt.pathElements[i] <== pathElements[i];
        mt.pathIndices[i] <== pathIndices[i];
    }
    mt.root === vetterRoot;

    // tag: one per vetter per applicant
    component t = Poseidon(3);
    t.inputs[0] <== VETTING_TAG;
    t.inputs[1] <== secret;
    t.inputs[2] <== applicantId;
    t.out === tag;

    // slot < cap, both range-checked to 8 bits so LessThan is sound
    component slotBits = Num2Bits(8);
    slotBits.in <== slot;
    component capBits = Num2Bits(8);
    capBits.in <== cap;
    component lt = LessThan(8);
    lt.in[0] <== slot;
    lt.in[1] <== cap;
    lt.out === 1;

    // serial: one of this vetter's `cap` serials for this period
    component s = Poseidon(4);
    s.inputs[0] <== SERIAL_TAG;
    s.inputs[1] <== secret;
    s.inputs[2] <== period;
    s.inputs[3] <== slot;
    s.out === serial;

    // statement binding — dummy-square idiom (1 constraint)
    signal statementSquare <== statementDigest * statementDigest;
}

component main {public [vetterRoot, applicantId, period, cap, statementDigest, tag, serial]} = VettingAttest(20);
