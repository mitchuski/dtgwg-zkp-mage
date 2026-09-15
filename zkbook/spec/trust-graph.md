## Trust-Graph Operations and the First Proof

This section is informative. It describes the integration target and open design decisions; it does not define an adopted wire protocol.

### From a relationship to a verifiable decision

A trust graph records relationships with meaning supplied by credential issuance, acceptance and governance. A proof provides selected evidence about those relationships. It does not create an authoritative relationship merely by verifying.

The lifecycle has six stages:

1. **Issue and accept.** Parties issue and, where the credential specification requires it, acknowledge the credentials describing membership or a relationship. Issuer authentication and acceptance have separate meanings.
2. **Retain private evidence.** The holder retains credentials, openings and linkage artifacts needed for a later presentation. An offline counterparty cannot supply a missing secret during that presentation.
3. **Request a statement.** The verifier identifies the purpose, audience, challenge, accepted profile, disclosure and registry-state policy. The holder can inspect those conditions before presenting.
4. **Prove and verify.** A construction binds authenticated credential facts and the available witnesses to the requested statement. The verifier checks the proof and the external checks declared by that profile.
5. **Apply policy and perform work.** The application decides whether the verified statement meets its policy. Authorization, execution and verification of an action receipt remain separate events.
6. **Maintain the relationship.** Expiry, revocation, key rotation and root updates change the evidence that a later presentation can use.

Proof soundness does not establish that an issuer's real-world assertion was correct, that separate credentials represent separate humans, or that an authorized action actually occurred. Privacy also depends on disclosed context, transport, timing, storage and registry access; hiding a witness from the verifier does not hide it from a hosted prover entrusted with that witness.

### ADR-001 as the flagship use case

The **presenter** is the party submitting the proof. The **voucher** is the counterparty that issued the relationship credential. Community C is the community whose membership evidence is being checked.

Construction 010 asks whether the presenter can present evidence of a relationship with the voucher inside community C while the voucher is offline. Its witness inventory includes authenticated membership evidence for both parties, the relationship credential, the required holder/linkage material and accepted status evidence.

The difficult step is connecting the voucher’s relationship-signing identifier to the voucher’s community membership. A membership path alone does not establish that connection. Depending on the credential profile and intended disclosure, a shared directed identifier with authenticated bindings or an issuance-time linkage artifact may supply it. the presenter cannot derive the voucher’s control from the presenter’s own secret. The representation and security of that artifact remain a construction-selection question.

The first technical milestone is a credential-bound private-membership presentation supporting this larger use case. It combines membership, holder binding, transcript binding and accepted validity/revocation state, together with credential authenticity. This is a subset of ADR-001, not evidence that all of construction 010 has been implemented.

The evidence-repository membership/nullifier/transcript circuit and canonical fixtures provide existing component evidence. The complete profile needs negative cases for altered credential fields or signatures, wrong holder or issuer, wrong root, stale or revoked credentials, changed audience/context and replayed challenges. Its success result initially supplies eligibility evidence to a policy evaluator; it does not mint a relationship or execute a delegated action.

### Use-case traceability

For each use case, maintain the actors, credential revision and format, statement, disclosure, witness custody, construction dependencies, implementation version, evidence and unresolved decisions. Link the original discussion comments as well as the containing thread. A comment can motivate a draft without becoming an adopted requirement.

The near-term sequence is private membership eligibility, the complete community-anchored proof, pairwise relationship presentation, and a bounded delegation profile. This is an editorial implementation proposal for review, not an assignment or delivery commitment.
