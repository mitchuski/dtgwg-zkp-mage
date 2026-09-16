## Public Inputs — Shared Conventions

This section is informative in this Working Draft. Each convention names the construction record and the upstream thread it came from; the conventions are offered for ratification, not asserted.

Construction records share the concepts below. Their exact encodings, profile versions and verifier checks remain to be specified before cross-implementation compatibility can be claimed.

### Context descriptor

A structured description of the context a proof is made in — scope, purpose, epoch — whose digest is converted under an explicit profile into the field input of a context-scoped gadget. The nullifier binds to it (construction 002); the per-context pseudonym of the blinded binder derives from it (construction 008); the quiet-presentation leakage budget is stated against it. The descriptor is data a holder can read before presenting: the six questions of a context card are derived from it, not from prose beside it.

*Source: proof-of-liveness requirements v0.4 §6.1 (working context definition B1); evidence-repository instruments `canonical/` and `context-card/`.*

### Set roots

> **WG-05 — Discuss: registry contract.** Which authority, authenticated leaf format, root construction and witness-update policy does the first profile use? Agree maximum staleness and unavailable-registry behavior. Status: unresolved; a shared commitment interface does not settle the meaning of its leaves.


A [[ref: set root]] is a signed, published commitment to a set at a stated registry state. Three sets that the credentials specification treats separately are one object in these conventions:

- the **membership root** of a community — construction 001 proves a hidden leaf is under it;
- the **revocation root** at an epoch — construction 006 proves a hidden handle is *not* under it;
- the **accredited-issuer root** of a trust registry — construction 001 again, under its alias *issuer-as-predicate*: prove the issuer belongs to the set rather than naming it, because the observer is often a venue or event and therefore the most identifying element.

A presentation exposes the accepted root and a zero-knowledge proof of the relevant membership statement. Paths, openings and non-membership witnesses remain private proof inputs unless disclosure is explicitly declared. Self-contained evidence can avoid per-holder verifier lookups, but obtaining and refreshing roots and witnesses still requires a deployment policy describing its correlation surface. Roots, paths and status witnesses can be supplied by any party that holds them — a cache, a relay, the community's agent — so that no member need be online for another's presentation (the 8 September call named this ambient verifiability, after KERI); who supplies them is part of the registry-operator adversary a profile states, not of the proof.

**The registry profile determines the root construction.** A proving backend must support the published hash, leaf semantics and root authentication, or use an explicitly specified issuance/registry change. The lab uses Poseidon trees. Flock has author-reported standard-hash benchmarks, but those do not establish end-to-end costs for these credential constructions or resolve signature verification.

*Source: cred-tf #40 (the set-root unification, stormer78 2026-08-22; ScottJeezey 2026-08-24: "ours to pressure-test"); cred-tf #39 (ScottJeezey 2026-08-25).*

### Epoch and freshness

Three clocks, never collapsed: the proof artefact's freshness (the transcript's challenge), the credential's validity, and the status root's epoch. A construction's [[ref: horizon]] is the earliest of the clocks it depends on. "Current" in a fixture family means: the roots named as public inputs are the ones the verifier accepts for this epoch.

*Source: proof-of-liveness requirements v0.4 §8 (three freshness clocks), §10 (cryptoperiod and assurance horizon).*

### Transcript digest

A presentation binds a transcript containing the authenticated request context and declared disclosures. Its exact serialization, hash framing and scalar conversion belong to the selected profile. The current lab encoding and a credential-layer digestMultibase representation are different interfaces; they are not interchangeable merely because both use SHA-256.

#### Observed lab transcript encoding

The inspected reference implementation computes the following procedure. This documents the lab baseline, not an adopted cross-implementation profile:

1. Validate the transcript with the lab's current field-presence checks and serialize it with runtimes/canonical/canonical.mjs. That serializer sorts object keys and uses JSON serialization for primitive values. The existing fixtures do not establish full RFC 8785 conformance.
2. Let D be the UTF-8 bytes of the exact domain string dtg-zkp/transcript/v0 and J be the UTF-8 bytes of that serialized transcript.
3. Compute H = SHA-256(u32be(byteLength(D)) || D || u32be(byteLength(J)) || J), where u32be is an unsigned four-byte big-endian length and || denotes byte concatenation. Reject an input length that cannot be represented in four bytes.
4. The lab returns H as 64 hexadecimal characters. The circuit harness interprets those digest bytes as a big-endian unsigned integer and reduces that integer modulo the BN254 scalar prime p = 21888242871839275222246405745257275088548364400416034343698204186575808495617.
5. The resulting scalar is the circuit's public transcriptDigest input. It is not the full 256-bit digest and is not a digestMultibase string.

The context descriptor uses the same argument-framing pattern with the separate domain dtg-zkp/context-descriptor/v0. Changing the domain, framing, serializer or conversion changes the profile and requires versioned vectors. Do not silently replace the framed hash with plain SHA-256(J).

The observed component circuit has four public inputs in declaration order: context, root, nullifier, transcriptDigest. It does not supply the status-root and epoch inputs of a complete community-anchored profile. Check the compiled artifact manifest before claiming the same layout for another build.

#### Draft profile and verifier validation

For an interoperable profile, specify whether its canonical JSON is RFC 8785, how the domain-separated digest is serialized externally (including any Multibase/Multihash identifiers), and how external digest bytes map to circuit inputs. A change from the lab baseline is explicit and preserves old fixture versions. The verifier derives the expected context and transcript values from the authenticated request and compares them with the presented public inputs; it does not accept an independently supplied scalar as evidence of the request's meaning.

The reference gadget reports one additional constraint for binding an already supplied scalar. That measurement does not include JCS or SHA-256 computation inside the circuit, strict request validation, simulation extractability or same-request replay prevention.

> **WG-06a — Proposed encoding decision.** Preserve the documented domain-separated lab hash as a named versioned baseline, and select the external digest representation and strict payload schema explicitly. Confirm the canonicalization requirements and conversion vectors before adopting a wire profile. Status: draft proposal; current lab behavior is evidence, not group ratification.

*Evidence: local source review and probe, 8 September 2026; canonical.mjs, nullifier.mjs H function, circom-gadget/harness.mjs and nullifier_membership.circom. See research/transcript-profile-vector.json for the reproducible synthetic comparison. Credential-layer encoding references: cred-spec #17 and #31.*

### Declared correlation scope

Under the credentials specification's Working Draft 02, an identifier carries a holder-declared [correlation scope](https://github.com/trustoverip/dtgwg-cred-spec/pull/30) — `pairwise | directed | public`, monotonic — and roles come from credentials. The scope is a public input where a construction's disclosure depends on it: a `pairwise` identifier appears in a proof only behind a commitment; a `directed` persona identifier may be shown on purpose (construction 011); and whether a proof of common control is needed at all is decided by the declaration (constructions 007 and 012: no proof where one `directed` or `public` identifier was deliberately reused). Where a declaration is carried remains a profile dependency: the credentials specification has settled that the declaration lives in the credential, made by the issuer about its own identifier, but the property that carries it and its `@context` term are not yet named ([cred-spec #46](https://github.com/trustoverip/dtgwg-cred-spec/issues/46)); the verifier needs an authenticated source for the declaration, and its encoding can change the construction inputs.

*Source: cred-spec #22, PR #30 §Correlation Scope and §Choosing a scope; cred-tf #41; cred-spec #46 (the property and `@context` term, open).*

### Public-signal order (offered for ratification)

> **WG-06 — Evidence request before ratification: wire manifest.** Replace the logical sketch below with a versioned, fixed-arity manifest checked against the compiled circuit and cross-language vectors. Include digest conversion, audience binding and optional-nullifier variants. Status: the sketch is not an adopted wire format.


An earlier composite sketch listed the following logical inputs; it is not the measured reference gadget's wire manifest:

```
[context, root_C, rl_root, epoch, nullifier?, transcriptDigest]
```

This sketch does not define a wire order. Each circuit/profile publishes a fixed-arity ordered manifest, including types, encodings and domain separation. Profiles with and without a nullifier have distinct layouts; verifiers reject unknown layouts. Reconcile the manifest with the compiled circuit and canonical fixtures before claiming interoperability.

*Source: evidence-repository `circom-gadget` signal order; construction 010 public-signal expectation.*
