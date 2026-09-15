## Presentation Profiles and Cross-Specification Integration

This section is informative. The following profile requirements are design questions to resolve before claiming interoperability.

### Versioned presentation profile

A concrete profile identifies the credential specification revision and serialization, authenticated issuer fields and key-resolution rules, construction and circuit version, proof-system parameters, witness custody, public-signal manifest and external verifier checks. Its request binds the audience, purpose, challenge, correlation scope, accepted roots and freshness policy. Its response identifies the request and selected profile without silently accepting a weaker alternative.

The profile specifies canonical bytes, transcript coverage, domain separators, hash algorithms, byte order, field conversion, scalar range checks and signal arity. A Multibase/Multihash digest string is not itself a field element. Optional nullifiers require explicitly versioned layouts; a verifier rejects a layout or digest encoding it does not implement. Binding an externally supplied digest to a proof does not prove that the digest encodes the intended authenticated request.

A registry profile identifies the root authority, signed leaf semantics, tree/accumulator construction, publication and update rules, historical acceptance and maximum staleness. The prover uses the registry's selected root construction; it cannot substitute a cheaper hash while claiming to verify the same root. Membership, issuer accreditation and revocation can share a commitment interface while retaining different leaf meanings and trust assumptions.

Freshness includes challenge expiry, credential validity, status/root freshness and the policy version applied by the verifier. Define clock skew, unavailable-registry behavior and concurrent replay handling. Local acceptance of a proof does not establish a globally unique use; a reuse-detection policy needs an explicit scope and state-management mechanism.

### Strict validation before proof acceptance

This draft proposes a stricter presentation boundary than the current lab field-presence validator. Define required types, allowed values, size limits and semantic relationships in the selected profile. Reject malformed input rather than coercing it into a hashable representation.

- Challenge: a nonempty string in the profile's specified encoding, with a defined entropy and size policy; numeric and object values are rejected.
- Expiry: an explicitly specified time representation and validity rule. A proposed concrete task profile can use an RFC 3339 timestamp with a timezone, bounded clock skew and expiry checks. The lab's symbolic expiry labels are test-model inputs, not evidence of an implemented timestamp validator.
- Requested predicates: a nonempty array of supported nonempty identifier strings. Specify ordering and duplicate handling before hashing; reject non-string or unsupported entries. Specify the identifier comparison rule (byte-exact, or a profiled canonical form) and how the verifier pins the definition and accept-list revision before binding; lookup and transcript construction use the same accepted statement, with no alias or version substitution after binding (the Implementation Guide, step 4).
- Context: validate the descriptor and require the transcript's descriptor digest, purpose, scope, protocol and profile to agree with the authenticated request under the selected profile. Audience authorization and accepted registry state require explicit checks.
- Public inputs: reject noncanonical or out-of-range scalar encodings and unsupported arity/profile combinations. Derive expected digest reductions locally; do not silently reduce an arbitrary malformed supplied scalar.

The observed lab validator accepts challenge = 42 and expiry = {unexpected:true}. Its canonical suite passes 11/11, but does not cover these strict boundary rules. This is a documented validation gap, not evidence that a deployed service accepts malformed presentations; a higher-level caller may impose further checks.

Required new negative vectors include numeric/object challenge, object or malformed expiry, expired request, non-string/unknown predicate identifiers, mismatched descriptor/transcript context, wrong audience, malformed public scalar and reuse of the same challenge. Keep serializer checks, schema rejection, cryptographic verification and policy/replay rejection as separate outcomes. Do not report these vectors as passing until their enforcing implementation is supplied.

### Trust Tasks binding

> **WG-07 — Discuss: task and implementation binding.** Pin the Trust Tasks and OpenVTC revisions, select the request/presentation/result schemas, and identify which parts of the demonstration are real services. Status: integration target, not demonstrated interoperability.


The [Trust Tasks framework](https://github.com/trustoverip/dtgwg-trust-tasks-tf/blob/main/SPEC.md) supplies a versioned document model and task-specific payload definitions. The framework revision inspected during this review is a draft. A profile pins its selected revision before relying on its requirements.

A task document's integrity `proof` and a ZKP presentation serve different purposes. Define the presentation in the selected task payload, and specify how the authenticated task or transport binds its request and response. Do not overload the document-integrity field with a different proof type without an explicit specification change.

The task profile defines payload schemas, request correlation, expiry, failures, retries and idempotency. Reserved response names are not evidence that a response schema or implementation already exists. Verification result, policy acceptance, execution consent and action receipt remain separately identifiable outcomes.

### OpenVTC implementation boundary

The [OpenVTC implementation](https://github.com/OpenVTC/verifiable-trust-infrastructure) is a candidate integration target. Pin its revision and inspect the relevant task definitions, key custody, membership state and policy interfaces before specifying an adapter. Repository descriptions alone do not demonstrate a working ZKP exchange.

Document which component issues credentials, stores witnesses, obtains registry state, generates proofs, verifies proofs and evaluates policy. Non-exportable holder keys may rule out constructions that assume an available master scalar. A hosted prover's access to private inputs belongs in the adversary model.

An integration demonstration identifies real and simulated components, runs the versioned task exchange and preserves failure evidence. For later state-changing operations, durable operation identifiers and reconciliation prevent ambiguous retries from being mistaken for permission to repeat an action. A simulated receipt is not a cryptographically verified service receipt.

### Decisions still needed

- Pin compatible credential, task and implementation revisions and reconcile their terminology.
- Select the first credential format, issuer-authentication route and holder-key capabilities.
- Define the root authority, leaf encoding and revocation/freshness policy.
- Verify the selected construction's formal assumptions against its implementation.
- Publish interoperable request/presentation vectors before describing a profile as implemented.
