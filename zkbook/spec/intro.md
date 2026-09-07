## Introduction

This section is informative.

A Decentralized Trust Graph is only private if the proofs made over it are. The [DTG Credentials Core Specification](https://trustoverip.github.io/dtgwg-cred-spec/) defines the credentials that form the graph's nodes and edges — membership, relationship, invitation, persona, endorsement and witness credentials — and names two zero-knowledge constructions over them, the pairwise proof and the community-anchored proof, while deferring their definition to this specification. The task force's [Privacy-Preserving Proof of Liveness — Requirements](https://github.com/trustoverip/dtgwg-zkp-tf/blob/main/proof-of-liveness-requirements.md) states what any such construction must and must not establish, and asks in its section 4 which zero-knowledge proof type to use for each predicate.

This specification answers that question one construction at a time, in a form that can be checked. Its central object is the **construction record**: a structured statement of one zero-knowledge proof over DTG credentials, carrying twelve parts a reader can hold the construction to.

| part | what it holds |
|---|---|
| statement | what a verifier learns, from whom, without what — one sentence |
| witness | the credentials, secrets, paths and openings that never leave the holder |
| [[ref: public inputs]] | what the verifier supplies and sees: context descriptor, [[ref: set root]]s, epoch, revocation root, [[ref: transcript digest]], declared scope |
| method | numbered clauses, each bound to a named [[ref: gadget]] and, once built, to a runtime |
| [[ref: disclosure set]] | exactly the public signals plus anything the holder deliberately shows |
| [[ref: negative space]] | what the proof does not establish |
| adversary | for each privacy claim: the verifier, verifiers colluding, issuer and verifier colluding, or the registry operator |
| horizon | the earliest of the clocks that bound the claim |
| conformance fixtures | the fixture families that test the construction: accepts, rejects-unsatisfiable, rejects-verify, unlinkable, current |
| construction options | routes through the task force's construction-selection gate, each with its measured or conjectured cost and its proving system |
| issuance requirements | what the construction asks of issuers and registries, stated early |
| provenance | the requests, records, registry rows and sources the construction rests on |

Construction records are of two kinds. A **primitive construction** binds exactly one gadget. A **composed construction** is a named conjunction of primitive constructions under one presentation transcript and one declared disclosure set; its disclosure set and negative space are written fresh rather than inherited, because proofs that are individually sound can leak jointly.

### How this specification is produced and checked

Every construction record in this document is generated from a machine-readable record (`conformance/records/*.json`) that is validated against a schema and a set of rules before it may render. The rules encode the task force's four drafting rules — every privacy claim names its adversary; every privacy claim names its horizon; every predicate states what it does not establish; conjecture is labelled as conjecture — so that a record lacking any of them does not appear in this specification. The same validation runs in this repository's continuous integration on every change. The generator, the schema and the rules are published under Apache-2.0 in the `conformance/` directory and originate in the task force's evidence repository, where reference runtimes, conformance fixtures and a verification registry of independent reproductions are maintained.

### States, and how much weight a record bears

A construction record carries a [[ref: record state]], and the state is printed at the head of its section. States above `constructed` require evidence from parties other than the constructor, recorded in the [[ref: verification registry]].

| state | what must exist | what the record may claim |
|---|---|---|
| `requested` | a thread or issue with a one-sentence statement | nothing — a placeholder |
| `carded` | a record that validates | an informative draft; costs are conjecture |
| `constructed` | a runtime and at least one measured construction option | informative; numbers are the constructor's |
| `run` | fixtures green on independent hardware, digests re-derived, by a party other than the constructor | reproduced once |
| `vetted` | a row in the verification registry | candidate normative clauses |
| `published` | the registry row and publication by the task force | normative |

Advancement is monotone and refuses to skip: a record cannot be vetted by the party that constructed it, and the tool records the refusal as a value rather than an exception. Recommendations for proving systems are derived from the same evidence, on a ladder from self-described through reproduced by several parties on several architectures; this specification uses RECOMMENDED only at the top of that ladder.

### Relationship to other specifications

The DTG Credentials Core Specification defines the credentials the constructions prove over; this specification follows its Working Draft 02 vocabulary, in which an identifier carries a holder-declared correlation scope — `pairwise`, `directed` or `public` — and the retired identifier-type acronyms do not appear. The requirements document defines the predicates, the assurance boundary and the construction-selection gate; each construction record's options table is that gate's evidence table for one predicate. The trust-registry and governance work of the working group supply the set roots, revocation state and community declarations the constructions take as public inputs.

### How to propose a construction

Open a discussion or issue in the task-force repository with a one-sentence statement of what the proof must establish and for which specification or deployment need. A constructor writes the record; the record enters this specification when it validates, at state `carded`, and rises through the states as evidence accumulates.

## Requirements Language

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [IETF RFC 2119](https://datatracker.ietf.org/doc/html/rfc2119). In this Working Draft they carry normative force only in sections that state "This section is normative." and, within construction records, only in records at state `vetted` or `published`. Elsewhere they are quotations from the threads a record cites.
