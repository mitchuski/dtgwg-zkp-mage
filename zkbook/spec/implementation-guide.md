## Implementation Guide: From a Trust-Graph Outcome to a Proof

This section is informative. It is the starting point for implementers. The construction records provide the technical detail; unresolved profiles are explicitly identified rather than presented as working implementations.

Personhood or liveness is not a universal prerequisite. Begin with the graph operation and its policy: membership, relationship evidence, credential attributes, identifier control, status or delegated authority may require no personhood predicate. Import such a predicate only when the selected use case explicitly needs it.

### Choose the outcome first

Start with the decision the receiving application needs to make. Specify the facts needed for that decision and the information that the holder is willing to disclose. Select a construction only after checking whether the available credentials, keys and registry evidence can supply its inputs.

| Application outcome | Evidence to establish | Construction path | Current implementation boundary |
|---|---|---|---|
| Accept a private membership eligibility result | Authenticated membership, holder control, accepted validity/status and request binding | 001 + 004 + 006 + 003, plus credential authenticity | Some component evidence exists; the complete credential-bound profile is not yet demonstrated |
| Accept a relationship within a community while the voucher is offline | Relationship authenticity, both memberships, linkage, distinct member credentials and accepted status | 010, including its declared dependencies | Specified; the offline voucher artifact and complete composition need validation |
| Verify a relationship while revealing selected directed identifiers | Relationship possession and authenticated control of the declared identifiers | 011 + its dependencies | Specified; disclosure and counterparty linkage must be specified |
| Check an attested attribute without revealing its full value | Authenticated attribute and a stated equality, range or other predicate | A use-case-specific construction using the relevant gadgets | Within scope; no dedicated complete attribute profile is supplied by the current records |
| Evaluate personhood or liveness evidence when required by policy | The selected attestation and its issuer, freshness, privacy and assurance assumptions | A profile derived from the applicable personhood/liveness requirements | One use-case family; cryptographic verification does not establish real-world truth or unique humanity by itself |
| Detect repeat use within an explicitly declared context | A context-bound nullifier and the policy for checking prior use | 002 within a presentation profile | Component evidence exists; uniqueness of humans is not established |
| Establish intentional common control across credentials | Authenticated credential identifiers and an available control witness | 007 / 012 | Specified; key derivation, custody and intentional correlation need a concrete profile |
| Evaluate delegated authority within a bounded scope | Authenticated grants and acceptances, scope narrowing, holder binding, validity and status | 020 + its dependencies | Specified; authority evidence does not demonstrate action execution |

> **WG-01 — Proposed for ratification: outcome and first milestone.** Use credential-bound private membership eligibility as the first implementation milestone supporting ADR-001, while retaining construction 010 as the flagship complete use case. Does the group accept this sequence and the stated distinction? Status: proposed; no decision recorded.

### Step 1: Write the acceptance statement

State the intended outcome in application terms, then express the exact facts the verifier needs. For membership eligibility: the presenter controls an authenticated credential admitted under an accepted community root, the credential satisfies the selected validity/status policy, and the proof is bound to this verifier request. The verifier learns only the declared public inputs and disclosures under the construction's stated assumptions and horizon.

Also state what a successful result cannot establish: truthful real-world admission, unique humanity, general authorization, or completed work. These limits belong beside the result, not only in a distant security section.

### Step 2: Check that the inputs exist

Inventory the credential format and version, issuer authentication, holder key capability, membership/status evidence, and any counterparty linkage artifact. Identify who creates each input, who retains it and who can access it during proving. An unavailable witness is an implementation blocker; it cannot be replaced by a statement in the credential text.

For the offline-voucher outcome, establish the link between the voucher's relationship-signing identifier and membership before attempting the composed proof. Distinct membership leaves alone do not establish distinct people or independent controllers.

> **WG-02 — Discuss before implementation: issuance and witness contract.** Which credential format, issuer-signature route, holder-key capability and offline linkage artifact does the first profile support? Required output: a pinned input contract and an explicit list of unavailable or unsupported inputs. Status: unresolved technical dependency.

### Step 3: Select the compatible construction profile

Choose a route that can authenticate the actual credentials and use the holder's available keys. Compare setup assumptions, disclosure, security requirements, proving time, memory and verification cost for the same workload. A fast component benchmark is not evidence that the full profile is compatible or affordable.

Define exactly which checks occur inside the proof and which the verifier performs outside it. Both sets of checks contribute to the acceptance statement. Name the profile and its version so a different circuit, root encoding or public-input layout cannot silently be substituted.

> **WG-03 — Evidence request: construction choice.** Select a common workload and target device for comparing compatible routes. Request a reproducible result for the full statement, including credential authentication and status checks. Status: no backend recommendation adopted by this draft.

### Step 4: Implement the request and presentation exchange

The authenticated request supplies the audience, purpose, challenge, selected profile, disclosure request and accepted registry/freshness policy. The holder checks these conditions, obtains the necessary private inputs and produces a proof. The presentation supplies the selected profile, proof, public inputs and deliberately disclosed material.

The verifier checks request binding, canonical encoding, profile/circuit identity, root authority and freshness, the cryptographic proof, and every declared external check. A rejected or unsupported input remains a failure; do not silently select a weaker profile. The Presentation Profiles section identifies the wire-format decisions still required.

Before constructing or accepting a proof request, the selected profile defines how predicate identifiers are represented and compared, and which definitions the verifier accepts. Bind the accepted identifiers and the applicable profile/policy revision into the transcript. A valid digest or proof does not make an unknown predicate meaningful. A registry entry, alias or replacement recommendation does not automatically authorize a verifier to substitute another predicate. If identifier normalization is selected, apply the same specified rule before policy lookup and transcript construction, and reject inputs outside that profile rather than silently changing the statement after it has been bound. This is proposed guidance pending the credential specification's vocabulary decision ([cred-spec #52](https://github.com/trustoverip/dtgwg-cred-spec/issues/52), a repo-driven predicate registry); it selects no URI conversion, NFC rewriting or other normalization algorithm.

### Step 5: Return an interpretable result

Represent at least three separate concepts in the application: proof verification result, policy decision and action outcome. The exact response schema belongs to the selected task profile; these conceptual stages are not newly defined wire fields.

Successful verification reports the statement/profile and accepted state against which it was checked. Policy may still decline the operation. If an action is subsequently authorized, execution and its receipt are handled separately, with idempotency and reconciliation appropriate to that task.

A profile distinguishes an authenticated statement about a vetting procedure from the relationship a proof establishes and the admission decision a community makes. Where an identity-vetting statement is used (the community predicate proposed in [cred-spec PR #50](https://github.com/trustoverip/dtgwg-cred-spec/pull/50)), its verification result retains the predicate's stated inference limits. A commitment to identity claims is not a holder-linkage commitment unless the selected construction explicitly defines and authenticates that relation. The mere presence of a liveness flag, commitment or valid signature cannot satisfy a missing membership or voucher-linkage clause.

> **WG-04 — Proposed for ratification: result boundary.** Keep proof verification, policy acceptance and action completion distinct in the spec and implementation examples. Status: proposed wording; record the group's resolution and source discussion before treating it as adopted.

### Step 6: Demonstrate the outcome and its failure cases

Provide synthetic credential and registry fixtures, pinned source/tool versions, commands, public-input manifests and verification artifacts. Show the accepted outcome and failures for changed credential/signature, wrong holder, wrong root, expired or revoked credential, stale state, altered audience/context and reused challenge. Record the expected failure stage so a successful schema check is not mistaken for successful proof verification.

Use the same fixture set across the prover, verifier and selected task adapter where applicable. Identify mocked services. Independent reproduction, circuit security review and working-group adoption are separate evidence and decision processes.

### What an implementation contribution should deliver

Submit the selected use case and acceptance statement; credential/witness contract; profile version and encoding manifest; construction dependencies; reproducible proof and rejection fixtures; task/implementation binding; disclosure and operational limits; and unresolved decisions. A reader should be able to start from the intended graph outcome and reach a runnable example with the same claim.

### How to use the working-group review notes

The numbered WG notes are editorial signposts. **Proposed for ratification** identifies wording or direction on which an explicit group decision is sought. **Discuss** identifies an unresolved design question. **Evidence request** identifies work needed to assess a claim. None records approval by itself.

When a note is resolved, attach the decision date, authority, source discussion/comment or meeting record, and resulting revision. Retain objections or deferred scope. Do not turn an editor's acknowledgment into group ratification.
