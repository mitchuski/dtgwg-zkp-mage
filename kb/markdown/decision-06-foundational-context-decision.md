---
title: "Decision §6 — Foundational context decision"
section: "decision"
source: "predicate-assurance-boundary-decision.md"
built_from_commitish: "working-tree"
order: 11
---
## 6. Foundational context decision

### 6.1 Adopted working definition

For V1, a context SHALL be defined as:

> A versioned, governance-authorised linkability domain identified by a canonical context descriptor, within which specified actions may be linked for a declared purpose and bounded epoch, and across which the profile claims unlinkability or non-correlation against a named adversary and collusion model.

The context descriptor MUST be derived from governed semantic inputs rather than an opaque verifier-chosen label.

### 6.2 Required context descriptor inputs

A canonical context descriptor SHOULD include, directly or through an unambiguous digest:

- protocol identifier and version;
- profile identifier and version;
- context authority identifier;
- context policy identifier and version;
- purpose identifier;
- scope identifier;
- verifier audience or governed verifier-set identifier;
- ecosystem, registry, or accreditation domain where relevant;
- epoch identifier and epoch policy;
- nullifier and domain-separation version;
- applicable retention and rollover policy identifier.

The descriptor MUST be encoded canonically and MUST be included in conformance fixtures.

### 6.3 What delimits a context

The default context SHOULD be **purpose-and-governance bounded**, not automatically “per verifier,” “per application,” or “per ecosystem.” Those may be valid context boundaries only when the governance record demonstrates why they are proportionate and humanly legible.

A context may cover multiple verifiers when they genuinely perform the same governed purpose and participants are clearly informed that reuse detection spans that set. A context MUST NOT silently expand because of corporate ownership, vendor infrastructure, common analytics, merger, acquisition, federation, or use of the same registry.

### 6.4 Required resistance target

The Extended Personhood Profile SHOULD target cross-context unlinkability against:

- an honest-but-curious verifier;
- multiple colluding verifiers in different contexts; and
- an issuer colluding with a verifier,

subject to the explicit limitations created by issuer-held enrolment data, registry traffic, network observability, schema fields, presentation timing, and external identifiers.

A deployment that cannot resist issuer-verifier linkage MUST state that limitation plainly and MUST NOT describe its context boundary as issuer-verifier-collusion resistant.

The Task Force should treat issuer-verifier collusion resistance as the **target profile**, while allowing a separately identified reduced-privacy deployment class where technical or governance dependencies prevent it. Reduced resistance MUST result in a different profile or conformance declaration, not a hidden implementation caveat.

### 6.5 Intentionally linkable within a context

A profile MAY intentionally reveal or derive enough information to determine that:

- the same enrolled secret has already performed the same bounded action in the same scope and epoch;
- a rate or count threshold has been reached;
- a returning presenter is bound to the same enrolment or account context;
- a proof is a replay of the same challenge or transcript;
- a credential or attestation has been revoked, suspended, expired, or superseded.

No additional linkage is implied. In particular, linkability within a context MUST NOT be reused for advertising, general analytics, unrelated fraud scoring, cross-service identity resolution, or open-ended behavioural profiling unless such use is separately authorised, disclosed, and outside the claimed privacy profile.

### 6.6 Prohibited cross-context linkage

A conformant context design MUST NOT intentionally enable linkage across contexts through:

- a global stable nullifier;
- a stable holder identifier;
- a reusable enrolment-root identifier exposed to verifiers;
- issuer-local tracking numbers;
- globally unique status-list indices;
- exact issuance timestamps when a coarser proof is sufficient;
- rare schema or assurance variants that fingerprint the issuer or subject;
- deterministic proof encoding not domain-separated by context;
- common fallback or mediated-prover identifiers;
- shared logs, telemetry, or analytics that restore the correlation the proof prevents.

### 6.7 Context authority and change control

Every context MUST identify an authority responsible for:

- defining the context and its purpose;
- admitting or removing verifiers;
- setting epoch and retention rules;
- approving changes to scope;
- publishing effective times and migration rules;
- preventing silent expansion;
- providing a correction, appeal, and challenge route;
- maintaining evidence that the user-facing description matches the cryptographic domain.

A context change that expands linkability MUST be treated as a material privacy change. Existing nullifiers or pseudonyms MUST NOT be silently reinterpreted under the expanded context.

### 6.8 Human-legibility test

A context definition fails review unless an affected person can reasonably answer:

1. What activity is this proof for?
2. Which organisations or services can recognise repeat use within this context?
3. For how long is repeat use linkable?
4. What happens when the epoch changes?
5. Does using a fallback or mediated prover change who can observe the event?
6. How can the person challenge an incorrect reuse or uniqueness decision?

The interface need not expose cryptographic internals, but it MUST expose the operational meaning of the boundary.
