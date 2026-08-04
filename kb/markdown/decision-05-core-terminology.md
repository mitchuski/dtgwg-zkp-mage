---
title: "Decision §5 — Core terminology"
section: "decision"
source: "predicate-assurance-boundary-decision.md"
built_from_commitish: "working-tree"
order: 10
---
## 5. Core terminology

### 5.1 Attestation

A signed issuer statement containing or committing to facts, determinations, policy references, assurance metadata, subject-binding material, status information, and other values needed by a proof profile.

### 5.2 Predicate

A precisely stated proposition evaluated over an attestation, holder secret, transcript, registry state, or other profile input and presented to a verifier as true or false without unnecessary disclosure of the underlying witness.

### 5.3 Assurance boundary

The boundary between what a verifier is entitled to rely on from the proof and associated evidence, and what remains an upstream assumption, governance dependency, operational condition, or accountable determination outside the proof.

### 5.4 Disclosure boundary

The boundary describing what is deliberately revealed, what can be inferred or reconstructed, who receives or observes it, how long it persists, and what accompanying information can defeat the intended privacy property.

### 5.5 Context

A **governed linkability domain** within which a profile intentionally permits specified presentations or actions to be linked for a defined purpose, scope, and epoch, and across which the profile claims resistance to linkage under a named adversary model.

A context is not merely an arbitrary string supplied to a nullifier function. It is a policy-governed domain with an authority, human-readable meaning, lifecycle, permitted uses, retention rules, migration process, and conformance evidence.

### 5.6 Scope

The bounded operation, resource, service, entitlement, or action class to which a predicate or nullifier applies within a context.

### 5.7 Purpose

The declared reason for requesting and evaluating the proof. Purpose is part of the semantic and privacy boundary and MUST NOT be represented only as free text controlled by a verifier.

### 5.8 Epoch

A bounded interval or counter domain within which a scoped pseudonym or nullifier remains stable enough to support the intended reuse-detection or rate-limiting function. Epoch rollover changes the accepted linkage window according to a governed rule.

### 5.9 Assurance horizon

The period over which the profile asserts that its assurance and privacy claims remain supportable, taking account of cryptographic assumptions, biometric threat evolution, schema stability, governance validity, status freshness, retention, and operational controls.

### 5.10 Cryptoperiod

The authorised lifetime of a cryptographic key, proving parameter, enrolment root, or related long-lived cryptographic artefact before rotation, migration, retirement, or re-establishment is required.

### 5.11 Enrolment root

A committed or otherwise privacy-preserving population or subject-binding artefact used to support same-enrolment or scoped uniqueness functions. It MUST NOT be treated as proof of global natural-person uniqueness.

### 5.12 Nullifier

A deterministic, domain-separated value used to detect repeated use of the same enrolled secret within a defined context, scope, purpose, and epoch. A nullifier establishes scoped reuse detection, not “one unique human.”
