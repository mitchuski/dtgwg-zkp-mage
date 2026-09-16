## Introduction

This section is informative.

The zero-knowledge layer supplies selective evidence about relationships in a Decentralized Trust Graph. Its privacy depends on both the proof construction and the surrounding disclosure, transport, registry and storage behavior. The [DTG Credentials Core Specification](https://trustoverip.github.io/dtgwg-cred-spec/) defines the credentials that form the graph's nodes and edges — membership, relationship, invitation, persona, endorsement and witness credentials — and names two zero-knowledge constructions over them, the pairwise proof and the community-anchored proof, while deferring their definition to this specification. The task force's [Privacy-Preserving Proof of Liveness — Requirements](https://github.com/trustoverip/dtgwg-zkp-tf/blob/main/proof-of-liveness-requirements.md) is an important source for the personhood and liveness use-case family and for reusable assurance-boundary concepts. It does not define the whole scope of this specification. Each construction identifies which requirements apply to its own trust-graph outcome.

This specification guides implementers from a required trust-graph outcome to a checkable zero-knowledge presentation. Start with the Implementation Guide: select the outcome, establish which credential and witness inputs exist, choose a compatible construction profile, and demonstrate both acceptance and rejection. The records that follow supply the technical detail and evidence boundaries. Its central object is the **construction record**: a structured statement of one zero-knowledge proof over DTG credentials, carrying twelve parts a reader can hold the construction to.

| part | what it holds |
|---|---|
| statement | what a verifier learns, from whom, without what — one sentence |
| witness | the credentials, secrets, paths and openings kept private from the verifier; any delegated prover access is declared |
| [[ref: public inputs]] | what the verifier supplies and sees: context descriptor, [[ref: set root]]s, epoch, revocation root, [[ref: transcript digest]], declared scope |
| relation | numbered clauses, each bound to a named [[ref: gadget]] and, once built, to a runtime |
| [[ref: disclosure set]] | exactly the public signals plus anything the holder deliberately shows |
| [[ref: negative space]] | what the proof does not establish |
| adversary | for each privacy claim: the verifier, verifiers colluding, issuer and verifier colluding, or the registry operator |
| horizon | the earliest of the clocks that bound the claim |
| conformance fixtures | the fixture families that test the construction: accepts, rejects-unsatisfiable, rejects-verify, unlinkable, current |
| construction options | candidate constructions, each evaluated against the task force's construction-selection criteria, with its measured or conjectured cost and its proving system |
| issuance requirements | what the construction asks of issuers and registries, stated early |
| provenance | the requests, records, registry rows and sources the construction rests on |

Construction records are of two kinds. A **primitive construction** binds exactly one gadget. A **composed construction** is a named conjunction of primitive constructions under one presentation transcript and one declared disclosure set; its disclosure set and negative space are written fresh rather than inherited, because proofs that are individually sound can leak jointly.

### Scope: zero-knowledge proofs for decentralized trust graphs

This specification addresses privacy-preserving statements about graph participants, credential attributes, relationships, authority and graph state. Participants may be people, organizations, devices or agents; a construction does not require personhood or liveness evidence unless its stated outcome and governance policy require it.

The use-case families include membership and eligibility, private relationship verification, selective disclosure and attribute predicates, holder binding and common control, context-scoped reuse detection, status and revocation, and delegated authority. Personhood and liveness are one family within this broader scope. The current records cover only part of that space; inclusion in scope is not a claim that a construction is already specified or implemented.

ADR-001 is an initial worked construction and implementation priority, not a boundary on future requests. Additional use cases can enter through credential, task, registry, implementation or working-group requirements, using the same statement, disclosure, adversary, horizon and evidence discipline.

> **WG-10 — Proposed for ratification: general DTG scope.** Confirm that this specification covers ZKP constructions for decentralized trust graphs generally, with personhood and liveness as one use-case family and source of requirements. Personhood assumptions apply only where a construction explicitly requires them. Status: proposed; no group decision recorded.

### How this specification is produced and checked

Every construction record in this document is generated from a machine-readable record (`conformance/records/*.json`) that is validated against a schema and a set of rules before it may render. The rules encode the task force's four drafting rules — every privacy claim names its adversary; every privacy claim names its horizon; every predicate states what it does not establish; conjecture is labelled as conjecture — so that a record lacking any of them does not appear in this specification. The same validation runs in this repository's continuous integration on every change. The generator, the schema and the rules are published under Apache-2.0 in the `conformance/` directory and originate in the task force's evidence repository, where reference runtimes, conformance fixtures and a verification registry of independent reproductions are maintained.

### States, and how much weight a record bears

A construction record carries a [[ref: record state]], and the state is printed at the head of its section. States above `constructed` require evidence from parties other than the constructor, recorded in the [[ref: verification registry]].

| state | what must exist | what the record may claim |
|---|---|---|
| `requested` | a thread or issue with a one-sentence statement | nothing — a placeholder |
| `specified` | a record that validates | an informative draft; costs are conjecture |
| `constructed` | a runtime and at least one measured construction option | informative; numbers are the constructor's |
| `run` | fixtures green on independent hardware, digests re-derived, by a party other than the constructor | reproduced once |
| `vetted` | a row in the verification registry | candidate normative clauses |
| `published` | the registry row and evidence publication | normative adoption requires a separate task-force decision |

The existing state history records advancement without skipped steps. A later defect can invalidate evidence or supersede a version without erasing that history. Editorial status, implemented scope, independent reproduction, security review and normative adoption are separate judgments. The state ladder alone does not establish all of them. Advancement refuses to skip: a record cannot be vetted by the party that constructed it, and the tool records the refusal as a value rather than an exception. Recommendations for proving systems are derived from the same evidence, on a ladder from self-described through reproduced by several parties on several architectures; this specification uses RECOMMENDED only at the top of that ladder.

### Relationship to other specifications

The DTG Credentials Core Specification defines the credentials the constructions prove over; this draft uses Working Draft 02 vocabulary as its editorial baseline; a concrete implementation profile pins and reconciles the exact credential revision. An identifier carries a holder-declared correlation scope — `pairwise`, `directed` or `public` — and the retired identifier-type acronyms do not appear. The liveness requirements document contributes predicates, assurance boundaries and a construction-selection method for its use cases. This specification also draws requirements from the credential specification, Trust Tasks, registry governance, implementation needs and other recorded DTG use cases. Each construction identifies its applicable sources; common methods are reused without importing personhood-specific assumptions into unrelated proofs. The trust-registry and governance work of the working group supply the set roots, revocation state and community declarations the constructions take as public inputs.

### How to propose a construction

Open a discussion or issue in the task-force repository with a one-sentence statement of what the proof must establish and for which specification or deployment need. A constructor writes the record; the record enters this specification when it validates, at state `specified`, and rises through the states as evidence accumulates.

## Requirements Language

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [IETF RFC 2119](https://datatracker.ietf.org/doc/html/rfc2119). In this Working Draft they carry normative force only in sections that state "This section is normative."; elsewhere they are quotations from the threads a record cites. Construction records in this contribution are informative. Evidence maturity alone does not confer normative force; adopting normative construction clauses requires a separately recorded task-force decision.
