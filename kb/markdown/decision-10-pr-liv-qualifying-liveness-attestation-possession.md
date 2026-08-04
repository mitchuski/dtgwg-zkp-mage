---
title: "Decision §10 — PR-LIV: qualifying liveness-attestation possession"
section: "decision"
source: "predicate-assurance-boundary-decision.md"
built_from_commitish: "working-tree"
order: 15
---
## 10. PR-LIV: qualifying liveness-attestation possession

### 10.1 Statement established

The prover possesses an attestation that:

- was signed by an issuer accepted under the relying policy;
- asserts a liveness outcome satisfying the requested predicate;
- was issued under an accepted policy identifier and version;
- carries an assurance class meeting the verifier's threshold;
- is within its validity period;
- is not revoked, suspended, or superseded according to the profile's status semantics;
- is bound to the holder secret or other subject-binding commitment required by the profile; and
- is bound to the current canonical transcript.

### 10.2 Negative meaning

PR-LIV does **not** establish:

- that the biometric determination was correct;
- that the sensor was uncompromised;
- that the issuer followed its process in the particular case;
- that the presenter has a civil identity;
- that the presenter is one unique natural person;
- that the holder key has never been transferred;
- that the person was uncoerced or understood the request;
- that an agent is authorised to act.

### 10.3 Intended disclosure

The verifier learns at minimum that the liveness predicate, accepted policy condition, assurance threshold, validity condition, status condition, and transcript-binding condition are satisfied.

The verifier MAY learn the accreditation framework, policy class, assurance class, profile version, and coarse validity information where the relying decision genuinely requires them.

### 10.4 Derived or incidental disclosure

Potential correlators include:

- rare assurance classes;
- exact policy versions;
- exact issuance or expiry times;
- issuer-specific schema variants;
- status-reference patterns;
- proof size or proving-time differences;
- retry count and failure mode;
- presentation timing and frequency;
- mediated-prover network traffic.

### 10.5 Accountability

- The issuer is accountable for the correctness and procedural integrity of the underlying determination.
- The accreditation or governance authority is accountable for qualification criteria, audit expectations, and recognition rules.
- The verifier is accountable for applying an appropriate relying policy and not overstating the proof.
- The holder software is accountable for correct request display, transcript formation, and protection of holder secrets.
- The proof implementation is accountable for cryptographic soundness, privacy, and conformance to the selected construction.

### 10.6 Horizon and dependencies

Reliance expires at the earliest of attestation expiry, status invalidation, policy deprecation, accreditation change, profile deprecation, assurance-horizon end, or failure of a required cryptographic assumption.
