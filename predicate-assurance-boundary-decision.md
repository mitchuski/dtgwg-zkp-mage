---
title: Predicate and Assurance-Boundary Decision Document
short_title: Predicate & Assurance-Boundary Decision Document
version: 0.1.0-draft
status: first-draft-for-task-force-review
normative_status: decision input; not yet a ratified specification
owner: DTG ZKP Task Force
last_reviewed: 2026-07-17
---

# Predicate & Assurance-Boundary Decision Document

## Document status

This document is a **decision document**, not a survey of zero-knowledge proof systems and not a retrospective description of choices already made. It defines the system-level propositions that a DTG ZKP profile is intended to establish, the propositions it must not be read as establishing, the information it deliberately or incidentally discloses, the adversaries and time horizons against which its claims are asserted, and the parties accountable when an upstream determination is wrong.

The document is intended to become the stable input to:

1. proof-system and construction selection;
2. attestation-schema design;
3. profile definition;
4. conformance tests and interoperability fixtures;
5. threat and privacy analysis;
6. cross-task-force alignment on credentials, trust tasks, registries, governance, delegation, and human experience.

This first draft resolves the principal architectural ambiguity that otherwise leaves every candidate construction underdetermined: **what counts as a context, what is intentionally linkable within it, and what a context boundary must resist.**

## 1. Executive decision

The Task Force should adopt the following system model for V1:

> A DTG zero-knowledge proof establishes possession of, and selected predicates over, an issuer attestation. It does not establish that the issuer's underlying biometric, personhood, or liveness determination was correct. The cryptographic layer carries proof integrity, selective disclosure, and the privacy properties expressly defined by the profile. The issuer, accreditation, policy, audit, and governance layers carry assurance in the underlying determination.

The V1 architecture should therefore be split into two profiles along the natural boundary created by the relationship between Sybil resistance and unlinkability:

- a **Minimum Liveness Profile**, which does not require population-level deduplication or scoped linkability and can be implemented and benchmarked independently; and
- an **Extended Personhood Profile**, which introduces issuer qualification, personhood-policy satisfaction, scoped uniqueness or reuse detection, and context-dependent unlinkability.

The Task Force should further adopt paired system-level records for every material predicate:

- an **assurance boundary**, describing what a verifier may rely on, what remains outside the proof, and who is accountable when the relied-on proposition is wrong; and
- a **disclosure boundary**, describing what each participant can observe or reconstruct, to whom it is exposed, how long it persists, and which accompanying artefacts can make it correlatable.

The two boundaries share one controlling input: **the issuer attestation schema**. A field required to support assurance, such as policy version, assurance class, issuance context, or accreditation reference, can simultaneously become a correlation surface. The schema must therefore be governed as both an interoperability artefact and a privacy artefact.

## 2. Decision drivers

This document is driven by six constraints.

### 2.1 Construction selection cannot precede statement selection

Naming a nullifier, signature proof, set-membership proof, range proof, or proof system does not tell an issuer, wallet, biometric provider, verifier, registry, or auditor what proposition is being exchanged. Independent implementers can use the same primitive while producing materially different systems.

A construction is conformant only when it realises a defined statement, leakage profile, adversary model, lifecycle, and accountability allocation.

### 2.2 Proof validity is not determination correctness

A verifier may correctly verify a proof over a false or defective issuer attestation. The proof can establish that an accepted issuer signed an attestation under a named policy and that specified predicates over that attestation hold. It cannot, by itself, establish that the biometric model, enrolment process, operator, sensor, or decision procedure reached a correct conclusion.

Any specification language that allows “proof of liveness” to be read as “cryptographic proof that the person was live” overstates what V1 can deliver.

### 2.3 Sybil resistance and full unlinkability cannot both be promised

The architecture must not simultaneously require deduplication strong enough to support Sybil resistance and full unlinkability across all presentations and verifiers. The attainable target is **context-dependent unlinkability**: intentionally linkable within a governed context where reuse detection is needed, and resistant to linkage across contexts under the adversary model declared by the profile.

The architecture must treat this as a trade curve, not as a maturity ladder. Stronger deduplication spends unlinkability.

### 2.4 Privacy claims require three parameters

Every material privacy, assurance, security, or interoperability claim must state:

1. **Against whom** the claim holds, including relevant collusion assumptions.
2. **For how long** the claim holds, including session, epoch, credential lifetime, cryptoperiod, retention period, and assurance horizon.
3. **Alongside what** the claim remains valid, including credential fields, registry traffic, network metadata, proof shape, logs, observable events, fallback paths, and other proofs.

A claim missing one of these parameters is not merely incomplete documentation. It is not yet a testable claim.

### 2.5 Human legibility is part of the context boundary

A context boundary that is cryptographically exact but cannot be understood by an affected person is operationally defective. A person must be able to determine, at a meaningful level, whether two relying parties share a linkability context, what repeated presentation within that context means, and whether a fallback or mediated proving path changes disclosure or assurance.

Human experience is therefore an input to context design, not a downstream interface concern.

### 2.6 Composition can defeat an individually sound proof

A proof is presented alongside credentials, protocol messages, timing, registry lookups, device and network metadata, other proofs, and human-visible events. An individually zero-knowledge transcript can participate in a system that is correlatable or reconstructive. The specification must therefore evaluate the complete presentation surface, not inherit system privacy from the proof-system definition.

## 3. Scope

### 3.1 In scope

This document decides or structures decisions concerning:

- predicate semantics;
- verifier-reliance propositions;
- negative meanings and prohibited overclaims;
- disclosure and reconstruction surfaces;
- context, scope, purpose, and epoch semantics;
- adversary and collusion models;
- assurance horizons and cryptoperiods;
- issuer-attestation schema requirements;
- accountability, correction, challenge, and redress routing;
- minimum and extended profile boundaries;
- required evidence for construction selection and conformance;
- separation of holder binding from agent authority;
- the system consequences of local, mediated, or fallback proving.

### 3.2 Out of scope

This document does not:

- select or ratify a specific proving system;
- define biometric liveness algorithms or their correctness criteria;
- define an accreditation or governance framework;
- establish civil identity;
- establish global one-person-one-record uniqueness;
- define a complete agent-delegation protocol;
- define the Trust Task Protocol or credential formats owned by other groups;
- claim that zkML is part of the V1 deployment profile;
- eliminate all observability of a presentation event;
- guarantee coercion resistance, non-transferability of a holder key, or human intent.

## 4. Normative language

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** are to be interpreted as requirement-strength indicators once this document is adopted into a normative specification. In this first draft they identify the intended force of proposed decisions.

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

## 7. Profile architecture

### 7.1 Minimum Liveness Profile (MLP)

The MLP establishes that the presenter possesses a qualifying, current liveness attestation issued under an accepted policy and assurance class, controls the required holder secret, and generated a proof bound to the current verifier request and transcript.

The MLP MUST NOT require population-level deduplication, scoped nullifiers, or a claim of personhood uniqueness. It therefore does not depend on the Sybil-resistance/unlinkability trade curve.

The MLP includes:

- qualifying liveness-attestation possession;
- accepted policy and assurance predicates;
- issuer qualification where required by the relying policy;
- holder-key or holder-secret control;
- canonical transcript and freshness binding;
- expiry, status, and revocation evaluation;
- disclosure and observable-event analysis;
- local or mediated proving rules where supported.

### 7.2 Extended Personhood Profile (EPP)

The EPP composes the MLP with one or more of:

- personhood-policy satisfaction;
- issuer-set membership or multi-issuer assurance;
- same-human-as-enrolment evidence;
- scoped uniqueness or reuse detection;
- context-dependent unlinkability;
- rate limitation or n-show behaviour;
- optional attested demographic predicates.

The EPP MUST state where it sits on the Sybil-resistance/unlinkability trade curve. It MUST identify the context, scope, purpose, epoch, enrolment population, issuer coordination assumptions, recovery rules, and collusion target.

### 7.3 Delegation extension

Agent authority SHALL NOT be inferred from holder-key control. Where an agent presents or triggers a proof on behalf of a principal, the presentation MUST be accompanied by separate delegation evidence sufficient to establish:

- principal;
- agent;
- delegated capability or action;
- scope and purpose;
- start and expiry time;
- conditions and limits;
- revocation or suspension status;
- step-up requirements;
- evidence that the current action is covered.

The ZKP profile may bind the delegation evidence to the transcript, but the profile MUST NOT represent delegation semantics as a property of the holder-key proof alone.

## 8. Assurance allocation model

The system allocates assurance across five layers.

| Layer | What it contributes | What it does not contribute by itself |
|---|---|---|
| Biometric or determination layer | sensor capture, liveness or personhood determination, match or enrolment result | cryptographic privacy; governance legitimacy |
| Issuer-attestation layer | signed representation of the determination, policy, assurance class, subject binding, validity, status | proof that the determination was factually correct |
| Cryptographic proof layer | possession, predicate satisfaction, integrity, selective disclosure, transcript binding, scoped linkage properties | accreditation, biometric correctness, civil identity, user intent |
| Governance and registry layer | issuer qualification, policy meaning, recognition, audit, accountability, status authority | proof generation or witness secrecy |
| Deployment and human-experience layer | request comprehension, context legibility, fallback behaviour, accessibility, operational controls, correction and redress | cryptographic soundness |

A verifier decision is supportable only when all required layers are in force. A proof may be cryptographically valid while the relying decision is invalid because policy, accreditation, status, context, retention, or deployment conditions are not satisfied.

## 9. Predicate decision register

### 9.1 Summary register

| ID | Predicate | Profile | Verifier may rely on | Verifier must not infer |
|---|---|---|---|---|
| PR-LIV | Qualifying liveness-attestation possession | MLP, EPP | Presenter possesses an unexpired, non-revoked attestation satisfying named policy and assurance predicates | That the underlying liveness decision was correct; that the presenter is globally unique; civil identity |
| PR-PER | Personhood-policy satisfaction | EPP | Attested subject satisfies the named personhood policy under its stated assumptions | Civil identity; global uniqueness; incorruptibility of issuer; current liveness unless separately proved |
| PR-ISS | Issuer qualification | MLP/EPP as required | Attestation issuer is accepted under a named accreditation or governance framework | Correctness of issuer decision; issuer independence unless proved; hidden issuer in every profile |
| PR-UNQ | Scoped reuse detection | EPP | Same enrolled secret cannot produce multiple accepted actions under the same context, scope, purpose, and epoch without a repeated nullifier | One natural person globally; one enrolment across all issuers; cross-context identity |
| PR-HLD | Holder-secret control | MLP, EPP | Prover controls the secret or key bound to the attestation and transcript | Non-transferability; physical presence of a particular human; agent authority; informed consent |
| PR-FRE | Freshness and transcript binding | MLP, EPP | Proof was generated for the current canonical request and cannot be replayed into a materially different transcript | Anything about liveness, personhood, identity, or authority beyond bound inputs |
| PR-RNG | Attested range | Optional extension | Hidden attested value satisfies the requested range | Exact value; suitability for unrelated purposes; absence of inference from a narrow range |
| PR-DEL | Delegated authority evidence | Extension, separate evidence | Named agent is authorised for the current action within declared scope and time | Holder identity; human presence; non-coercion; authority outside the delegation |

The following sections provide the required paired boundary analysis.

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

## 11. PR-PER: personhood-policy satisfaction

### 11.1 Statement established

The attested subject satisfies a named personhood policy under the policy's stated evidence, enrolment, issuer, and governance assumptions.

### 11.2 Negative meaning

PR-PER does not establish:

- civil or legal identity;
- global uniqueness;
- absence of duplicate enrolment at another issuer;
- present liveness unless PR-LIV is also proved;
- trustworthiness, reputation, eligibility, or authority beyond the named policy;
- that every issuer interprets personhood identically.

### 11.3 Disclosure

The verifier learns that a named or accepted personhood-policy class is satisfied. Depending on profile design, disclosure may reveal the policy version, issuer set, jurisdiction, assurance class, or population from which membership is proved.

Rare policies or small issuer sets may materially narrow the subject population and MUST be assessed as a reconstruction risk.

### 11.4 Accountability

The personhood-policy authority is accountable for the policy definition. The issuer is accountable for applying it. The accreditation framework is accountable for recognising the issuer. The verifier is accountable for using the result only for the stated purpose.

## 12. PR-ISS: issuer qualification

### 12.1 Statement established

The issuer that signed the attestation belongs to an accepted, current issuer set or satisfies an accepted accreditation predicate under a named governance framework and snapshot or effective time.

### 12.2 Negative meaning

PR-ISS does not establish:

- that the issuer's individual determination was correct;
- that all issuers in the set provide equal assurance;
- issuer independence;
- absence of collusion;
- that issuer identity must always be concealed.

### 12.3 Issuer concealment decision

Issuer concealment SHALL be profile-specific. A verifier may legitimately need to know the accreditation framework, policy version, assurance class, or jurisdiction while not needing the specific issuer identity.

A profile MAY support:

- explicit issuer disclosure;
- issuer concealment within a named set;
- disclosure of a coarse issuer class;
- multi-issuer or threshold assurance.

The selected mode MUST be justified by the relying purpose and correlation analysis.

### 12.4 Registry and snapshot semantics

Issuer qualification MUST be evaluated against a named registry, set commitment, or governance snapshot with explicit effective time, cache rules, update semantics, and failure behaviour. Network lookup patterns that reveal the issuer or holder MUST be included in the disclosure analysis.

### 12.5 Multi-issuer assurance aggregation (non-normative)

PR-ISS as stated in §12.1 is a binary set-membership statement and remains so. Where a show combines credentials or attestations from multiple named issuers, a profile MAY additionally reason about aggregate confidence rather than treating membership as a single pass/fail signal.

The normative reference models each issuer's attribute-validation process as bounded by a one-sided error parameter and shows that, when issuers validate independently, a verifier's confidence against mis-issuance increases multiplicatively with the number of honest, independent issuers contributing to a show; a corrupted or negligent issuer degrades only its own contribution and does not weaken the assurance carried by the other issuers involved (see [`appendices/REFERENCES.md`](../appendices/REFERENCES.md)).

This gives an accreditation framework a purpose beyond maintaining a list: a profile MAY define, per issuer, a documented confidence parameter and MAY require or permit a verifier to combine that parameter with independence assumptions when a show cites more than one issuer. A profile that does this MUST still satisfy the disclosure requirements of §12.3 and MUST state the independence assumption itself as a claim under §2.4 (against whom, for how long, alongside what) — issuer independence is asserted, not derived from set membership alone.

Open issue: whether, and how, multi-issuer confidence aggregation is required by any profile is a task-force decision. This subsection records the mechanism as decision input; it does not select or mandate it.

## 13. PR-UNQ: scoped reuse detection

### 13.1 Statement established

For a specified enrolled secret, context, scope, purpose, and epoch, the proof derives a deterministic nullifier such that a verifier or governed verifier set can detect a repeated accepted action within that domain.

The narrow assurance statement is:

> The same enrolled secret cannot produce two accepted actions in the same context, scope, purpose, and epoch without producing the same nullifier, assuming correct enrolment binding and construction implementation.

### 13.2 Negative meaning

PR-UNQ does not establish:

- one unique human globally;
- one enrolment per issuer or ecosystem;
- that the biometric commitment cannot be duplicated or fraudulently issued;
- that two different secrets cannot belong to the same natural person;
- that one secret cannot be controlled by multiple people;
- cross-context identity;
- absence of coercion or account sharing.

### 13.3 Assurance dependencies

The strength of the uniqueness claim depends on:

- biometric match and deduplication quality;
- resistance to re-enrolment;
- recovery, rotation, and exception rules;
- issuer coordination and common-root semantics;
- binding between the committed secret and enrolment root;
- nullifier domain separation;
- epoch authority and rollover;
- verifier acceptance and state consistency;
- compromise and collusion assumptions.

Only scoped reuse detection is primarily cryptographic. One enrolment per issuer or ecosystem is a biometric and governance property. One natural person globally is outside the default V1 claim.

### 13.4 Nullifier input requirements

The nullifier statement MUST unambiguously bind:

- enrolment-root or population commitment identifier;
- canonical context descriptor;
- scope identifier;
- purpose identifier;
- epoch identifier;
- profile and construction version;
- recovery or rotation domain where applicable;
- holder or enrolment secret.

### 13.5 Disclosure

The verifier learns a stable pseudonymous value within the defined domain. This intentionally enables within-domain linkage. The profile MUST state who retains the nullifier, for how long, and whether multiple verifiers share the same state.

The nullifier MUST be unlinkable across contexts to the degree asserted by the declared adversary model. Schema fields, status traffic, issuer-held data, network identifiers, and exact timing may weaken that claim and MUST be evaluated together.

### 13.6 Failure handling and redress

A repeated nullifier may result from legitimate retry, race conditions, recovery, epoch disagreement, verifier duplication, or malicious reuse. The profile MUST define deterministic error semantics and a challenge route. A person MUST NOT be permanently excluded by an opaque uniqueness result without correction and appeal mechanisms.

## 14. PR-HLD: holder-secret control

### 14.1 Statement established

The prover demonstrates knowledge or control of the holder secret bound to the attestation and the current transcript.

### 14.2 Negative meaning

PR-HLD does not establish:

- that the key was not transferred, copied, or delegated;
- that a particular natural person is physically present;
- that the key is stored in secure hardware;
- that the holder understood or consented to the request;
- that an agent has authority for the action;
- continuity of civil identity.

### 14.3 Disclosure

The proof may reveal continuity of a holder-bound pseudonym within a profile or account context. Device attestation, secure-hardware signals, error modes, mediated proving, and network behaviour may reveal additional information and require separate analysis.

### 14.4 Accountability

Wallet and holder-software implementers are accountable for key protection, correct binding, request display, and recovery behaviour. Verifiers are accountable for not interpreting key control as human intent or agent authority.

## 15. PR-FRE: freshness and canonical transcript binding

### 15.1 Statement established

The proof is bound to a current, verifier-authorised, domain-separated transcript and cannot be replayed or transplanted into a materially different request without detection.

### 15.2 Required transcript fields

The canonical transcript MUST bind at least:

- protocol identifier and version;
- profile identifier and version;
- verifier or audience identifier;
- governed context descriptor;
- purpose and scope identifiers;
- challenge or nonce;
- session identifier;
- requested predicates;
- policy and assurance requirements;
- delegation reference where applicable;
- expiry boundary and accepted clock rules;
- status or registry snapshot requirements;
- fallback or mediated-proving mode when material;
- canonical encoding and domain-separation version.

A bare nonce is insufficient.

### 15.3 Negative meaning

PR-FRE does not establish liveness, personhood, identity, authority, or non-coercion. It establishes only that the proved statement is bound to the current transcript under the accepted freshness rules.

### 15.4 Disclosure

Transcript fields can reveal verifier, audience, purpose, requested predicates, risk posture, timing, session patterns, and step-up frequency. These are observable even when the witness remains hidden.

## 16. PR-RNG: attested range predicate

### 16.1 Statement established

A hidden, issuer-attested value falls within the requested range or satisfies the specified comparison.

### 16.2 Profile status

Range predicates SHOULD be an optional extension rather than a dependency of the Minimum Liveness Profile. Age and demographic predicates introduce separate issues of data minimisation, jurisdiction, discriminatory use, rarity, and inference.

### 16.3 Negative meaning

PR-RNG does not reveal or establish the exact value. It does not establish suitability for an unrelated purpose and MUST NOT be reused as a proxy for identity, reputation, or risk beyond the stated policy.

### 16.4 Disclosure

A narrow or rare range, especially when combined with assurance class, location, policy, device data, or other predicates, may materially identify or classify a person. Combination risk MUST be tested.

## 17. PR-DEL: delegated authority evidence

### 17.1 Statement established

Where separately supported, the evidence establishes that a named agent is authorised by a principal to perform the current action under declared scope, purpose, conditions, duration, and revocation state.

### 17.2 Separation requirement

Delegation evidence MUST remain structurally separate from proof of holder-key control. The ZKP may prove possession of or predicates over delegation evidence and bind it to the transcript, but the semantic authority comes from the delegation instrument and its governance.

### 17.3 Negative meaning

PR-DEL does not establish that the principal is currently present, that the principal would approve every implementation detail, or that the agent is trustworthy outside the delegation.

## 18. Issuer attestation schema as the shared boundary determinant

### 18.1 Decision

The issuer attestation schema SHALL be governed as the shared determinant of both assurance and disclosure boundaries.

For every field, the profile MUST record:

- semantic purpose;
- assurance proposition supported;
- disclosure mode;
- whether it is disclosed, selectively disclosed, committed, derived in proof, verifier-resolved, or prohibited;
- cardinality and rarity;
- stability across sessions, contexts, and epochs;
- correlation and reconstruction risk;
- retention and lifecycle;
- migration and deprecation behaviour;
- responsible authority;
- conformance evidence.

### 18.2 Minimum semantic field classes

A profile will commonly require:

| Field class | Assurance purpose | Preferred disclosure treatment |
|---|---|---|
| Schema/profile version | Interpretation and negotiation | Disclose at coarse profile granularity; prevent issuer fingerprinting |
| Policy identifier/version | Define relying semantics | Prove accepted value or disclose coarse accepted class |
| Assurance class | Support verifier risk decision | Minimise cardinality; avoid issuer-specific values |
| Issuance/expiry bounds | Validity and freshness | Prove interval membership where feasible |
| Holder-binding commitment | Subject continuity | Hidden witness or commitment |
| Status reference | Revocation/suspension | Privacy-preserving status mechanism or bounded cache |
| Issuer accreditation reference | Qualification | Set-membership proof or explicit disclosure per profile |
| Enrolment-root reference | Scoped reuse detection | Committed, context-governed, never a global public identifier |
| Determination result | Predicate input | Hidden, with only required predicate disclosed |
| Determination-policy metadata | Meaning and accountability | Coarsened or proved where possible |

### 18.3 Prohibited schema practices

A schema MUST NOT include stable issuer-local identifiers, raw biometrics, reversible templates, exact timestamps, unique status indices, or high-cardinality extensions merely for operational convenience where they are not essential to the relying proposition.

Schema versions and extension ordering MUST NOT become covert issuer or subject identifiers.

### 18.4 Combination analysis

Fields MUST be assessed individually and in combination. A policy version, assurance class, issuance time, status index, proof size, and issuer-set choice may be non-identifying separately but identifying together.

## 19. Disclosure-boundary model

For each predicate and profile, the implementation SHALL analyse at least the following observers:

- verifier;
- issuer;
- issuer and verifier colluding;
- multiple verifiers colluding;
- registry operator;
- accreditation authority;
- mediated prover;
- wallet or agent operator;
- network observer;
- auditor or log processor;
- malicious application co-resident on the device.

The analysis SHALL cover:

- deliberately disclosed values;
- derived values and rarity;
- persistent pseudonyms and nullifiers;
- proof size, encoding, and timing fingerprints;
- status and registry queries;
- presentation occurrence, timing, retries, and frequency;
- fallback and downgrade path;
- mediator retention;
- device and network identifiers;
- cross-proof and cross-credential composition;
- error codes and diagnostics;
- human interaction and step-up events.

## 20. Observable event and behavioural leakage

The specification claims unlinkability, not undetectability. A presentation event remains observable. The request pattern can itself disclose behaviour, including:

- which verifier requested a proof;
- when and how often step-up occurs;
- whether an action triggered risk controls;
- how many retries occurred;
- whether local proving failed;
- whether a mediated or lower-assurance path was used;
- whether an agent encountered intent drift or permission escalation.

Profiles MUST identify observable-event leakage and SHOULD provide minimisation measures such as batching, coarse timing, local caching, private status checks, uniform error behaviour, and strict telemetry controls where practical.

## 21. Mediated proving and fallback

### 21.1 Decision

A profile MAY support mediated proving when a holder device cannot generate the required proof, but the mediated path MUST be explicit and separately assessed.

### 21.2 Required controls

A mediated-proving profile MUST define:

- data sent to the mediator;
- whether the mediator sees witnesses, biometrics, commitments, or credentials;
- non-retention and deletion requirements;
- isolation between sessions and tenants;
- authentication and authorisation;
- transcript binding;
- audit and incident response;
- whether the mediator can link contexts;
- user-visible indication that mediation is occurring;
- equivalent or downgraded assurance semantics;
- failure and fallback behaviour.

A mediated prover MUST NOT become the biometric or credential honeypot the privacy architecture was intended to avoid.

### 21.3 Downgrade decision

When the preferred proof cannot be produced, the system MUST NOT silently step down. It MUST either fail, invoke an explicitly identified lower-assurance profile, use a governed mediator, or switch channel according to a relying policy visible to the person and verifier.

## 22. Lifecycle decisions

### 22.1 Separate clocks

The profile MUST distinguish:

- proof-transcript lifetime;
- challenge/session lifetime;
- attestation validity;
- status freshness;
- nullifier epoch;
- enrolment-root cryptoperiod;
- policy and accreditation validity;
- log retention;
- proof-system security horizon;
- biometric assurance horizon.

### 22.2 Unbounded values prohibited

A nullifier without a bounded epoch and an enrolment root without a cryptoperiod are non-conformant unless the profile provides an explicit, reviewed exception. “Permanent” or “unbounded” MUST NOT be accepted as an implicit default.

### 22.3 Migration

Algorithm agility MUST be supported by a concrete migration mechanism, including profile identifiers, version negotiation, overlap periods, deprecation, downgrade protection, fixture updates, and treatment of long-lived enrolment artefacts. Merely stating that algorithms are replaceable is insufficient.

## 23. Accountability and redress matrix

| Failure | Primary accountable party | Supporting parties | Required remedy path |
|---|---|---|---|
| False liveness or personhood determination | Issuer | biometric provider, accreditation authority | contest determination, re-evaluation, correction, status propagation |
| Incorrect issuer qualification | registry/accreditation authority | governance authority, verifier | correct registry state, publish effective time, re-evaluate affected decisions |
| Cryptographic acceptance of invalid proof | proof implementation/operator | profile maintainer, verifier | patch, revoke parameters or profiles, incident notice, reprocessing |
| False duplicate or nullifier collision | profile/operator and context authority | issuer, verifier state operator | investigate, restore access, correct state, appeal |
| Silent context expansion | context authority/governance | verifiers, registry | suspend expansion, notify, migrate, reset or segregate identifiers where possible |
| Excess disclosure or correlation | party controlling the correlating surface | issuer, wallet, verifier, mediator, registry | stop processing, delete or segregate data, schema/profile correction, incident handling |
| Invalid delegation decision | delegation issuer/authority and verifier | wallet/agent operator | revoke, correct authority state, reverse or halt action where possible |
| Silent fallback or assurance downgrade | verifier and wallet/operator | mediator | disclose, re-run under correct profile, remediate affected decisions |
| Inaccessible or misleading context presentation | wallet/verifier experience owner | governance authority | accessible alternative, correction, process redesign, redress |

A proof profile MUST define not only who is responsible but how a wrong decision is contested and how corrections propagate to verifiers, registries, logs, and downstream decisions.

## 24. Prohibited claims and constructions

V1 MUST NOT:

- claim that a valid ZKP establishes correctness of the biometric determination;
- claim full unlinkability while also claiming Sybil resistance;
- describe a nullifier as proof of one-human-one-record;
- expose global stable identifiers or nullifiers;
- place raw biometrics or reversible templates in the proof flow;
- require civil-identity disclosure for the minimum profile;
- require issuer concealment in every profile;
- conflate holder-key control with human continuity, consent, or agent authority;
- leave proof composition undocumented;
- use proprietary verifier-only formats without interoperable test vectors;
- require global personhood or uniqueness before the minimum profile can ship;
- hard-code one algorithm into the semantic model;
- make post-quantum support a blocker for the first implementable release;
- permit mediated proving without non-retention and correlation controls;
- use a context boundary that can expand silently;
- claim issuer-verifier-collusion resistance without testing and documenting the full correlation surface.

## 25. Construction-selection gate

A cryptographic construction SHALL NOT be ratified for a predicate until the Task Force has approved:

1. the exact positive statement;
2. the negative meaning;
3. the context, scope, purpose, and epoch inputs;
4. the adversary and collusion model;
5. the assurance horizon and cryptoperiod;
6. the issuer-attestation fields and disclosure modes;
7. the composition and observable-event assumptions;
8. the accountability and redress path;
9. the required performance envelope;
10. conformance fixtures and negative tests.

Construction evaluation SHOULD then consider:

- proof and verification size;
- proving time on representative consumer devices;
- verifier throughput;
- trusted-setup and toxic-waste assumptions;
- parameter and proving-key distribution;
- browser and mobile SDK viability;
- library maturity and independent implementations;
- deterministic test-vector support;
- offline verification;
- secure-hardware dependencies;
- revocation and refresh cost;
- recursive or folded composition feasibility;
- post-quantum migration path;
- error diagnosability;
- fallback behaviour;
- deployment and operational complexity.

## 26. Conformance requirements

A conformant profile or implementation MUST provide:

- a completed context decision record;
- one assurance-boundary record per supported predicate;
- one disclosure-boundary record per supported predicate;
- a versioned attestation schema and field register;
- a canonical transcript fixture;
- nullifier scope-and-epoch fixture where applicable;
- issuer-set or registry-snapshot fixture where applicable;
- lifecycle and cryptoperiod profile;
- mediated-proving declaration where applicable;
- implementation conformance statement;
- positive, negative, and cross-context test vectors;
- evidence that user-facing context descriptions match the cryptographic configuration;
- residual-risk record.

### 26.1 Minimum negative tests

The test programme MUST reject at least the following:

- a valid proof over an expired, revoked, or unaccepted attestation;
- a verifier output implying biometric correctness;
- replay into another verifier, context, purpose, scope, or transcript;
- reuse of a nullifier domain across distinct contexts;
- an issuer-verifier-collusion-resistance claim with no defined adversary or test;
- a schema containing an unjustified stable correlator;
- a context expansion without version and migration;
- a silent fallback to a lower-assurance or mediated path;
- acceptance of holder-key control as sufficient agent authority;
- inconsistent epoch or registry snapshots;
- a disclosure claim that ignores observable events or accompanying fields.

## 27. Cross-workstream dependencies

### 27.1 Credentials work

The Credentials workstream needs the context and disclosure decisions before stabilising attestation fields. Credential fields can defeat context separation even when the proof construction is sound.

### 27.2 Trust Tasks work

Trust tasks compose predicates and determine request semantics. The transcript, purpose, scope, and multi-proof composition model require joint definition. Bundled proofs that are individually sound may leak jointly.

### 27.3 Registry and governance work

Issuer qualification, policy recognition, status, snapshot semantics, context authority, and change control depend on registries and governance. The ZKP profile consumes these decisions but does not define their institutional legitimacy.

### 27.4 Human Experience work

Human Experience participation is required for context legibility, consent and notice, fallback and downgrade behaviour, accessibility, assisted use, error handling, challenge, correction, and redress.

### 27.5 Agent and delegation work

Delegation semantics require a separate structured evidence model and lifecycle. The ZKP profile should bind to that evidence but not invent authority semantics inside a key-control predicate.

## 28. Open decisions for Task Force ratification

The following points should be explicitly ratified or revised at the working call:

1. **Context delimiter:** adopt purpose-and-governance bounded context as the default rather than per-verifier or per-ecosystem context.
2. **Collusion target:** make issuer-verifier collusion resistance the target for the Extended Personhood Profile, with any weaker deployment clearly identified as a separate privacy class.
3. **Profile split:** ratify Minimum Liveness and Extended Personhood as the primary structural split.
4. **Issuer concealment:** keep it profile-specific.
5. **Boundary pairing:** require assurance and disclosure records for every material predicate.
6. **Schema governance:** treat the attestation schema as the shared determinant of both boundaries.
7. **Lifecycle:** require bounded epochs, enrolment-root cryptoperiods, and assurance horizons.
8. **Delegation:** keep agent authority as separate structured evidence.
9. **Mediated proving:** permit only through an explicit profile with non-retention and disclosure controls.
10. **Human legibility:** make it a context conformance requirement.

## 29. Conjectures and research items

The following should remain labelled as conjecture or open research until supported by evidence:

- **zkML deployability:** high-confidence conjecture that proving the proprietary liveness model's execution is not deployable at consumer-device scale for V1.
- **Recursive or folded composition:** open question whether the prover cost is acceptable for a mobile multi-predicate profile.
- **Biometric-derived secret rotation:** open question how recovery, reissue, and epoch rotation can be achieved without creating reusable biometric correlators.
- **Issuer-verifier collusion resistance:** construction-specific question whose answer depends on issuer-held data, schema, status, network, and enrolment design, not only the nullifier.
- **Multi-issuer assurance:** open question whether and how independent issuer contributions can be composed into a useful assurance bound.
- **Post-quantum migration:** implementation question requiring layer separability and evidence, not only algorithm identifiers.

## 30. Decision record

| Decision | Proposed status | Consequence |
|---|---|---|
| Proof establishes predicates over an attestation, not correctness of the underlying determination | Accept | Assurance accountability remains with issuer and governance framework |
| Context is a governed linkability domain | Accept | Context needs authority, purpose, epoch, human meaning, and change control |
| Context-dependent unlinkability replaces full unlinkability | Accept | Extended profile must declare trade position and collusion model |
| Minimum Liveness and Extended Personhood are structurally separate | Accept | Minimum profile can ship without population deduplication |
| Assurance and disclosure boundaries are paired | Accept | Every predicate has reliance and leakage records |
| Attestation schema sets both boundaries | Accept | Schema design precedes construction lock-in |
| Claims require against whom, for how long, alongside what | Accept | Privacy and assurance claims become testable |
| Nullifier means scoped reuse detection, not unique human | Accept | Verifier outputs and documentation must use narrow language |
| Holder control is not agent authority | Accept | Delegation remains separate structured evidence |
| Human legibility is a conformance property | Accept | Context definition requires Human Experience review |
| Mediated proving requires a separate profile | Accept | No silent privacy or assurance downgrade |
| Specific cryptographic constructions | Deferred | Selected only after boundary ratification and benchmarking |

## 31. Recommended repository disposition

This document should be maintained in the implementation-guide workspace as the authoritative synthesis that precedes and binds the existing boundary templates, predicate register, context record, ADRs, schema profile, threat model, and conformance fixtures.

Recommended path:

```text
docs/implementation-guide/boundaries/predicate-assurance-boundary-decision.md
```

The existing artefacts should remain, but their relationship should be clarified:

- this document records the Task Force's substantive decisions and system-level semantics;
- `context-decision-record.md` is the deployment/profile instantiation template;
- `assurance-boundary-template.md` and `disclosure-boundary-template.md` are per-predicate evidence templates;
- `predicate-boundary-register.md` is the compact traceability index;
- the ADRs record atomic architectural decisions and their consequences;
- the attestation-schema profile and field register operationalise the shared schema input;
- conformance fixtures prove that independent implementations instantiate the decisions consistently.

The implementation-guide README and boundary README should link to this document first and label it as the decision baseline. The upstream discussion can then be told that the repository already contains most of the required architecture in decomposed form, but it does not yet contain one complete, reviewable decision document that resolves the context question and presents the full per-predicate assurance and disclosure model as a single coherent first draft.

## Appendix A. Per-predicate review checklist

For each predicate, reviewers should be able to answer:

1. What exact proposition is proved?
2. What does it explicitly not establish?
3. What attestation fields and external state are required?
4. What is deliberately disclosed?
5. What can be inferred or reconstructed?
6. Who can observe it, alone or in collusion?
7. How long do the proof, pseudonym, root, metadata, and logs remain relevant?
8. Alongside what other fields, proofs, events, and traffic does the claim remain valid?
9. Who is accountable for an incorrect upstream determination?
10. How is an incorrect relying decision contested and corrected?
11. What context, scope, purpose, and epoch bind the statement?
12. What construction and performance evidence is required?
13. What positive and negative conformance tests demonstrate the boundary?
14. Can an affected person understand the operational meaning of the context and fallback path?

## Appendix B. Compact boundary-record example for PR-UNQ

```yaml
boundary_id: AB-PR-UNQ-001
predicate: PR-UNQ
profile: extended-personhood-v1
statement_established: >
  The same enrolled secret cannot produce two accepted actions in the
  declared context, scope, purpose, and epoch without producing the same
  nullifier.
negative_meaning:
  - does not establish one natural person globally
  - does not establish one enrolment across issuers
  - does not establish non-transfer of the enrolled secret
against_whom:
  - honest-but-curious verifier
  - colluding verifiers across distinct contexts
  - issuer and verifier collusion, subject to declared issuer-data limits
for_how_long:
  epoch: 30 days
  enrolment_root_cryptoperiod: 2 years
  nullifier_retention: 35 days
  assurance_horizon: 2 years
alongside_what:
  - attestation schema v1
  - canonical transcript v1
  - registry snapshot no older than 24 hours
  - no stable external account identifier shared across contexts
accountable_parties:
  enrolment_correctness: issuer
  context_definition: context authority
  nullifier_state: verifier-set operator
  cryptographic_correctness: proof implementation
redress:
  - duplicate-decision challenge endpoint
  - issuer re-evaluation
  - verifier state correction
  - appeal to context authority
```

## Appendix C. Source discussions and repository artefacts

This draft is based on the Task Force launch discussion, the proof-construction and assurance-boundary discussion, the context-definition discussion, and the implementation-guide architecture already present in the repository. It should be reviewed against the latest version of those materials before ratification.
