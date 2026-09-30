## Introduction

This section is informative.

The zero-knowledge layer supplies selective evidence about relationships in a Decentralized Trust Graph. Its privacy depends on both the proof construction and the surrounding disclosure, transport, registry and storage behavior. The [DTG Credentials Core Specification](https://trustoverip.github.io/dtgwg-cred-spec/) defines the credentials that form the graph's nodes and edges — seven types at Document Status 0.4.0: the edge credentials [[xref: DTG_CRED, VMC]], [[xref: DTG_CRED, VRC]] and [[xref: DTG_CRED, VDC]]; the [[xref: DTG_CRED, VIC]]; the annotation credentials [[xref: DTG_CRED, VPC]] and [[xref: DTG_CRED, VSC]] (of which the endorsement and witness credentials are now predicate profiles); and the [[xref: DTG_CRED, VAC]] — and names two zero-knowledge constructions over them, the pairwise proof and the community-anchored proof, while deferring their definition to this specification. The task force's [Privacy-Preserving Proof of Liveness — Requirements](https://github.com/trustoverip/dtgwg-zkp-tf/blob/main/proof-of-liveness-requirements.md) is an important source for the personhood and liveness use-case family and for reusable assurance-boundary concepts. It does not define the whole scope of this specification. Each construction identifies which requirements apply to its own trust-graph outcome.

This specification guides implementers from a required trust-graph outcome to a checkable zero-knowledge presentation. Use the separate companion Implementation Guide for the walkthrough: select the outcome, establish which credential and witness inputs exist, choose a compatible construction profile, and demonstrate both acceptance and rejection. The records that follow supply the technical detail and evidence boundaries. Its central object is the **construction record**: a structured statement of one zero-knowledge proof over DTG credentials, carrying twelve parts a reader can hold the construction to.

| part (rendered) | JSON field | what it holds |
|---|---|---|
| Statement | `statement` | what a verifier learns, from whom, without what — one sentence |
| Witness | `witness` | the credentials, secrets, paths and openings kept private from the verifier; any delegated prover access is declared |
| [[ref: public inputs]] | `publicInputs` | what the verifier supplies and sees: context descriptor, [[ref: set root]]s, epoch, revocation root, [[ref: transcript digest]], declared scope |
| Relation | `relation` | numbered clauses, each bound to a named [[ref: gadget]] and, once built, to a runtime |
| [[ref: disclosure set]] | `disclosureSet` | exactly the public signals plus anything the holder deliberately shows |
| Does not establish ([[ref: negative space]]) | `doesNotEstablish` | what the proof does not establish |
| Adversary | `adversary` | for each privacy claim: the verifier, verifiers colluding, issuer and verifier colluding, or the registry operator |
| Horizon | `horizon` | the earliest of the clocks that bound the claim |
| Conformance fixtures | `fixtures` | the fixture families that test the construction: accepts, rejects-unsatisfiable, rejects-verify, unlinkable, current |
| Construction options | `options` | candidate constructions, each evaluated against the task force's construction-selection criteria, with its measured or conjectured cost and its proving system |
| Issuance requirements | `issuance` | what the construction asks of issuers and registries |
| Provenance · Record history · Reviews | `provenance` · `history` · `reviews` | citations and commit; every state advance with its evidence; recorded reviewer sign-off on the record's clauses (scope, verdict, date) |

The JSON field is the rendered name in the specification's own terms; a record and its section read the same way, and the same table is kept in `conformance/README.md`.
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

The DTG Credentials Core Specification defines the credentials the constructions prove over. That specification versions its Working Drafts semantically (`_Document Status:_ Working Draft MAJOR.MINOR.PATCH`, adopted 15 September 2026), and this draft pins it the way that specification pins its own companions: a stated minimum compatible Document Status rather than a date.

> **Minimum compatible version:** the constructions in this draft are written to the vocabulary of [DTG-CRED] at Document Status **Working Draft 0.4.0** — the release that adopted semantic versioning, merged the [[xref: DTG_CRED, VSC]] and the declared [[xref: DTG_CRED, correlation scope]] — and require at least that Document Status of the credential specification. A concrete implementation profile pins and reconciles the exact credential revision. This draft adopts the same convention for itself (`_Version:_ 1.0` is the target the working group converges toward; `_Document Status:_` carries the semantic version of this Working Draft, and a MINOR bump may carry breaking changes while its MAJOR component is 0). An identifier carries a holder-declared correlation scope — `pairwise`, `directed` or `public` — and the retired identifier-type acronyms do not appear. The liveness requirements document contributes predicates, assurance boundaries and a construction-selection method for its use cases. This specification also draws requirements from the credential specification, Trust Tasks, registry governance, implementation needs and other recorded DTG use cases. Each construction identifies its applicable sources; common methods are reused without importing personhood-specific assumptions into unrelated proofs. The trust-registry and governance work of the working group supply the set roots, revocation state and community declarations the constructions take as public inputs.

### How to propose a construction

Open a discussion or issue in the task-force repository with a one-sentence statement of what the proof must establish and for which specification or deployment need. A constructor writes the record; the record enters this specification when it validates, at state `specified`, and rises through the states as evidence accumulates.

## Requirements Language

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [IETF RFC 2119](https://datatracker.ietf.org/doc/html/rfc2119). In this Working Draft they carry normative force only in sections that state "This section is normative."; elsewhere they are quotations from the threads a record cites. Construction records in this contribution are informative. Evidence maturity alone does not confer normative force; adopting normative construction clauses requires a separately recorded task-force decision.

### Structure and construction navigation

Read Public Inputs for shared conventions, Construction Records for the exact statements and dependencies, Integration for unresolved profile requirements, and Conformance for validation targets. The construction index gives stable identifiers, kinds and evidence states. The guide provides explanation; it does not define additional conformance requirements.

- Admission with multiple vouchers: 023; compare 010, which includes presenter membership.
- Relationship presentations: 010 and 011.
- Common control and equality: 007, 009 and 012.
- Context and digest binding: 003, 008 and 022.
- Delegation and authority: 020 and 021.
- Mutual edge admissibility: 013, still requested.

Constructions remain in this versioned specification. A separate construction registry has not been selected. Evidence registries and third-party artifact catalogues have different roles.

### Reading the formal evidence

Seventeen records carry optional formal metadata: the ten primitives (001–009 and 022) and the composed records 010, 011, 012, 020, 021, 023 and 024. Each block gives the Lean statement, named theorem roots, assumptions, reproduction command and a scope line. The scope line says which clauses the model covers and which it leaves to other records or to named hypotheses. These are machine-checked properties of abstract models. They do not establish implementation correspondence, zero knowledge, end-to-end admission correctness or task-force adoption, and do not advance a record's evidence state. The referenced evidence sources are currently local, uncommitted work; public reproduction requires a reviewed immutable revision.

Record 024's block models the counting rule for a class-credential construction, the reading of the construction named for the Linux Plumbers integration. It is not a proof of the Groth16 lab route or of any compiled circuit. Clause-by-clause correspondence, applicant exclusion, verifier state transitions and privacy arguments remain separate obligations.

> **WG-16 — Admission statement selection.** Review whether the requested admission flow needs construction 023 (vouches over relationship credentials), 024 (hidden vetting), or separate modes. A partial runtime or a model theorem does not establish interchangeability. Status: proposed; no decision recorded.

### Composition review and deferred circuit work

The composed records' models are built over the primitives' definitions: a composed model's soundness applies the primitives' theorems rather than restating them. The evidence audit checks 63 named roots and emits a source-hashed receipt. A formal block is not a coverage claim for every clause: the clause review distinguishes partial models (011's covers clauses 2 and 3), assumed signature relations and uncovered implementation obligations across 18 records and 59 clauses. Full circuit correspondence (G8) is deferred. Record 013 remains requested. Public reproduction still requires an immutable evidence revision; local receipt hashes alone are not a published pin.
