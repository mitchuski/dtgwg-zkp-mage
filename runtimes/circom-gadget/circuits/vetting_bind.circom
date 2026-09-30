pragma circom 2.0.0;

// Fifth circuit: HIDDEN-VETTING BINDING — the applicant's proof of record 024
// (Groth16 route). Binds k vetter legs (vetting_attest.circom) to the
// community's single-use challenge, the requirements digest and the join DID,
// and proves the applicant holds the secret behind the applicantId the legs
// attest (record 004 holder binding + record 003 transcript binding).
//
//   public:   applicantId      — Poseidon(APPLICANT_TAG, appSecret)
//             transcriptDigest — harness-side hash over the challenge, the
//                                requirements digest, the join DID and every
//                                leg's public signals; dummy-square bound
//   private:  appSecret
//
// Whoever holds the k leg proofs without appSecret cannot submit them: the
// binding proof for that applicantId is unsatisfiable without the secret.
//
// APPLICANT_TAG = sha256('dtg-zkp/applicant-id/v0') mod p
//               = 7434054201767092397859473897144320119247247662147169725073439840466139704

include "circomlib/circuits/poseidon.circom";

template VettingBind() {
    signal input appSecret;
    signal input applicantId;
    signal input transcriptDigest;

    var APPLICANT_TAG = 7434054201767092397859473897144320119247247662147169725073439840466139704;

    component id = Poseidon(2);
    id.inputs[0] <== APPLICANT_TAG;
    id.inputs[1] <== appSecret;
    id.out === applicantId;

    signal transcriptSquare <== transcriptDigest * transcriptDigest;
}

component main {public [applicantId, transcriptDigest]} = VettingBind();
