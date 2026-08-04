# DTG Knowledge Base — Index

## Root — workflow, integration map, briefing

- [DTG Research Root](./dtg-research-root.md) — Working lab + explorations for the ToIP DTG ZKP Task Force
- [Workflow — Workbench and Research Root](./workflow.md) — 2026-07-17. The two roots are related, not separated: one is the workbench for direct working-group
- [Integration Map](./integration-map.md) — 2026-07-16, status refreshed 2026-07-17. Mage layer. The display-surface rows (master, skills,
- [Briefing 2026-07-18 — ZKP Explorations](./briefing-2026-07-18-zkp-explorations.md) — Since the Credentials Core Specification (WD v1.0) and the Predicate & Assurance-Boundary Decision

## Decision — Predicate & Assurance-Boundary Decision Document (split per §)

- [Decision — Overview](./decision-overview.md) — Predicate & Assurance-Boundary Decision Document
- [Decision — Document status](./decision-document-status.md) — This document is a decision document, not a survey of zero-knowledge proof systems and not a retrospective description of choices already made. It defines th...
- [Decision §1 — Executive decision](./decision-01-executive-decision.md) — The Task Force should adopt the following system model for V1:
- [Decision §2 — Decision drivers](./decision-02-decision-drivers.md) — This document is driven by six constraints.
- [Decision §3 — Scope](./decision-03-scope.md) — This document decides or structures decisions concerning:
- [Decision §4 — Normative language](./decision-04-normative-language.md) — The key words MUST, MUST NOT, REQUIRED, SHALL, SHALL NOT, SHOULD, SHOULD NOT, RECOMMENDED, MAY, and OPTIONAL are to be interpreted as requirement-strength in...
- [Decision §5 — Core terminology](./decision-05-core-terminology.md) — A signed issuer statement containing or committing to facts, determinations, policy references, assurance metadata, subject-binding material, status informat...
- [Decision §6 — Foundational context decision](./decision-06-foundational-context-decision.md) — For V1, a context SHALL be defined as:
- [Decision §7 — Profile architecture](./decision-07-profile-architecture.md) — The MLP establishes that the presenter possesses a qualifying, current liveness attestation issued under an accepted policy and assurance class, controls the...
- [Decision §8 — Assurance allocation model](./decision-08-assurance-allocation-model.md) — The system allocates assurance across five layers.
- [Decision §9 — Predicate decision register](./decision-09-predicate-decision-register.md) — The following sections provide the required paired boundary analysis.
- [Decision §10 — PR-LIV: qualifying liveness-attestation possession](./decision-10-pr-liv-qualifying-liveness-attestation-possession.md) — The prover possesses an attestation that:
- [Decision §11 — PR-PER: personhood-policy satisfaction](./decision-11-pr-per-personhood-policy-satisfaction.md) — The attested subject satisfies a named personhood policy under the policy's stated evidence, enrolment, issuer, and governance assumptions.
- [Decision §12 — PR-ISS: issuer qualification](./decision-12-pr-iss-issuer-qualification.md) — The issuer that signed the attestation belongs to an accepted, current issuer set or satisfies an accepted accreditation predicate under a named governance f...
- [Decision §13 — PR-UNQ: scoped reuse detection](./decision-13-pr-unq-scoped-reuse-detection.md) — For a specified enrolled secret, context, scope, purpose, and epoch, the proof derives a deterministic nullifier such that a verifier or governed verifier se...
- [Decision §14 — PR-HLD: holder-secret control](./decision-14-pr-hld-holder-secret-control.md) — The prover demonstrates knowledge or control of the holder secret bound to the attestation and the current transcript.
- [Decision §15 — PR-FRE: freshness and canonical transcript binding](./decision-15-pr-fre-freshness-and-canonical-transcript-binding.md) — The proof is bound to a current, verifier-authorised, domain-separated transcript and cannot be replayed or transplanted into a materially different request ...
- [Decision §16 — PR-RNG: attested range predicate](./decision-16-pr-rng-attested-range-predicate.md) — A hidden, issuer-attested value falls within the requested range or satisfies the specified comparison.
- [Decision §17 — PR-DEL: delegated authority evidence](./decision-17-pr-del-delegated-authority-evidence.md) — Where separately supported, the evidence establishes that a named agent is authorised by a principal to perform the current action under declared scope, purp...
- [Decision §18 — Issuer attestation schema as the shared boundary determinant](./decision-18-issuer-attestation-schema-as-the-shared-boundary-determinant.md) — The issuer attestation schema SHALL be governed as the shared determinant of both assurance and disclosure boundaries.
- [Decision §19 — Disclosure-boundary model](./decision-19-disclosure-boundary-model.md) — For each predicate and profile, the implementation SHALL analyse at least the following observers:
- [Decision §20 — Observable event and behavioural leakage](./decision-20-observable-event-and-behavioural-leakage.md) — The specification claims unlinkability, not undetectability. A presentation event remains observable. The request pattern can itself disclose behaviour, incl...
- [Decision §21 — Mediated proving and fallback](./decision-21-mediated-proving-and-fallback.md) — A profile MAY support mediated proving when a holder device cannot generate the required proof, but the mediated path MUST be explicit and separately assessed.
- [Decision §22 — Lifecycle decisions](./decision-22-lifecycle-decisions.md) — The profile MUST distinguish:
- [Decision §23 — Accountability and redress matrix](./decision-23-accountability-and-redress-matrix.md) — A proof profile MUST define not only who is responsible but how a wrong decision is contested and how corrections propagate to verifiers, registries, logs, a...
- [Decision §24 — Prohibited claims and constructions](./decision-24-prohibited-claims-and-constructions.md) — V1 MUST NOT:
- [Decision §25 — Construction-selection gate](./decision-25-construction-selection-gate.md) — A cryptographic construction SHALL NOT be ratified for a predicate until the Task Force has approved:
- [Decision §26 — Conformance requirements](./decision-26-conformance-requirements.md) — A conformant profile or implementation MUST provide:
- [Decision §27 — Cross-workstream dependencies](./decision-27-cross-workstream-dependencies.md) — The Credentials workstream needs the context and disclosure decisions before stabilising attestation fields. Credential fields can defeat context separation ...
- [Decision §28 — Open decisions for Task Force ratification](./decision-28-open-decisions-for-task-force-ratification.md) — The following points should be explicitly ratified or revised at the working call:
- [Decision §29 — Conjectures and research items](./decision-29-conjectures-and-research-items.md) — The following should remain labelled as conjecture or open research until supported by evidence:
- [Decision §30 — Decision record](./decision-30-decision-record.md) — 30. Decision record
- [Decision §31 — Recommended repository disposition](./decision-31-recommended-repository-disposition.md) — This document should be maintained in the implementation-guide workspace as the authoritative synthesis that precedes and binds the existing boundary templat...
- [Decision — Appendix A. Per-predicate review checklist](./decision-appendix-a-per-predicate-review-checklist.md) — For each predicate, reviewers should be able to answer:
- [Decision — Appendix B. Compact boundary-record example for PR-UNQ](./decision-appendix-b-compact-boundary-record-example-for-pr-unq.md) — Appendix B. Compact boundary-record example for PR-UNQ
- [Decision — Appendix C. Source discussions and repository artefacts](./decision-appendix-c-source-discussions-and-repository-artefacts.md) — This draft is based on the Task Force launch discussion, the proof-construction and assurance-boundary discussion, the context-definition discussion, and the...

## Explorations — O-series, X-series, crosschecks

- [Explorations Index](./explorations.md) — Status: Local design docs in the research root (~/dtgwg-cred-spec-main_mage). Not upstream, never
- [O1 — Deferred ZK Layer](./o1-deferred-zk-layer.md) — DTG ZKP V1.0 is the conformant binding for the Credentials Core Spec's two ZK constructions — the missing
- [O2 — PHC by Nullifier](./o2-phc-by-nullifier.md) — The nullifier is the cryptographic leg of a Personhood Credential — it enforces scoped reuse detection
- [O3 — IDVC Assurance Profile](./o3-idvc-assurance-profile.md) — "Valid IDVC at assurance ≥ L from a registry-listed IDVP" — the standard liveness input contract, now
- [O4 — Registry ZK Revocation](./o4-registry-zk-revocation.md) — How a zero-knowledge proof reads a trust registry: snapshot semantics, issuer-set membership, revocation,
- [O5 O6 O8 — Supporting Notes](./o5-o6-o8-supporting.md) — Three lower-cost lines: the freshness/transcript conformance harness, the pools cross-pollination, and the
- [O7 — Agent Card ZK](./o7-agent-card-zk.md) — An agent proves capability and authority from its Agent card without revealing the principal or the full
- [O9 — VRC Promise Bundle](./o9-vrc-promise-bundle.md) — The spec's VRC is deliberately minimal. Agentprivacy's VRC carries promise-theoretic and economic
- [Semaphore v4 Crosscheck](./semaphore-v4-crosscheck.md) — Register: O2 · Milestone: M5 (Semaphore v4 cross-check) · Ladder: research note
- [VWC — Witness Seat](./vwc-witness-seat.md) — A third party attesting the collision: the Verifiable Witness Credential joins runtime 07 as the third
- [X1 — Conformance Fixtures](./x1-conformance-fixtures.md) — The fixtures are the interop layer. §26 already requires every conformant profile to ship positive,
- [X2 — Context Legibility Instrument](./x2-context-legibility-instrument.md) — The §6.8 six-question test made runnable: a context card derived from the canonical descriptor itself,
- [X3 — Trust Task Composition](./x3-trust-task-composition.md) — A real trust task never requests one predicate. It composes several PR- predicates into a single
- [X4 — Observable Event Minimisation](./x4-observable-event-minimisation.md) — The specification claims unlinkability, not undetectability (§20): a presentation event remains
- [X5 — Recovery and Rotation](./x5-recovery-rotation.md) — Enrolled secrets get lost, compromised, and time-bounded — §22.2 makes rotation mandatory, not
- [X6 — Assurance Horizons and Erosion Clocks](./x6-assurance-horizons-erosion-clocks.md) — The decision doc's assurance horizon (§5.9) is structurally the Privacy Value Model's erosion clock: a
- [X7 — Mediated Proving Profile](./x7-mediated-proving-profile.md) — §21 permits mediated proving only as an explicit, separately assessed path: "A profile MAY support
- [X8 — Multi-Issuer Aggregation](./x8-multi-issuer-aggregation.md) — §12.5 records, non-normatively, that when a show combines attestations from multiple issuers, "a
- [X9 — Guardian Recovery](./x9-guardian-recovery.md) — X5 named it pattern 3 and deferred it; the rotation build (10/10) deferred it again — "needs its own

## Lab — workbench runtime evidence (NOTES)

- [Lab — Runtimes](./lab-runtimes.md) — Status: Local experimental lab. Not part of the upstream trustoverip/dtgwg-zkp-tf repo — excluded via .git/info/exclude, never pushed. Spec-doc edits go upst...
- [Lab — 01-uniqueness-nullifier](./lab-01-uniqueness-nullifier.md) — Predicate (Section 4): Uniqueness within a context — "Nullifier-based scheme (deterministic per-context pseudonym) for duplicate / Sybil resistance without a...
- [Lab — 07-trust-graph-formation](./lab-07-trust-graph-formation.md) — What this runtime is. An agentprivacy-harness runtime that models how the DTG trust graph forms, run as
- [Lab — circom-gadget](./lab-circom-gadget.md) — What this is: the lab's first real circuit — the SHARED GADGET that O2 (PHC-by-nullifier,
- [Lab — consumer-py](./lab-consumer-py.md) — Python 3, stdlib only (hashlib, json, re, pathlib) — the fixtures lab's
- [Lab — context-card](./lab-context-card.md) — What this is. The decision document's six-question human-legibility test (§6.8) made runnable:
- [Lab — erosion-record](./lab-erosion-record.md) — The lightest of the X-builds: a record format + validator + one worked
- [Lab — fixtures](./lab-fixtures.md) — Implements the X1 exploration (X1 — Conformance Fixtures)
- [Lab — guardian-recovery](./lab-guardian-recovery.md) — Implements the X9 exploration
- [Lab — mediator](./lab-mediator.md) — Runnable reference for the mediated-proving profile — §21 of the
- [Lab — multi-issuer](./lab-multi-issuer.md) — Runnable reference for X8 — multi-issuer confidence aggregation
- [Lab — quiet-presentation](./lab-quiet-presentation.md) — Lab model of X4's design layer (research root: X4 — Observable Event Minimisation). Reference model of the decision rules over event traces — not real networ...
- [Lab — rotation](./lab-rotation.md) — Implements the X5 exploration
- [Lab — show-composition](./lab-show-composition.md) — Runnable reference for X3 — trust-task composition
- [Lab — witness-seat](./lab-witness-seat.md) — The third seat on the dream cycle: a VWC (Verifiable Witness Credential) attesting the

## Chronicles

- [Chronicle 2026-07-16 — Trust-Graph Formation Dream Cycle](./chronicle-2026-07-16-trust-graph-formation-dream-cycle.md) — The ToIP trust graph named our objects and left the ZK layer open. We cohered to its names and contributed a
- [Chronicle 2026-07-18 — The First Circuit](./chronicle-2026-07-18-the-first-circuit.md) — The lab crossed from reference models into real cryptography — and the interesting part is not the
