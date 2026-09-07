### Privacy claims as recorded, per construction

*Generated from the `adversary` field of every construction record. A claim appears here only against the party it is made against; a claim absent here is not made.*

- **Construction 001** — against verifier, verifiers-colluding: leaf position hidden
- **Construction 001** — against registry-operator: leaf hidden from the registry operator only if the root is fetched without a per-holder query
- **Construction 002** — against verifiers-colluding: unlinkable across contexts
- **Construction 002** — against verifier: linkable within a context by design (declared, governed)
- **Construction 003** — against verifier, verifiers-colluding: replay to another verifier or time fails
- **Construction 004** — against verifier, issuer-verifier-colluding: long-term key hidden
- **Construction 005** — against verifier, verifiers-colluding: identities of both hidden
- **Construction 006** — against registry-operator, issuer-verifier-colluding: the status check does not identify the holder — requires bulk/anonymous root fetch, never a per-holder query
- **Construction 007** — against verifier, verifiers-colluding: no cross-presentation handle: the proof is transcript-bound and emits no identifier-derived value; two verifiers comparing proofs learn only what the enclosing cards disclosed to each
- **Construction 007** — against issuer-verifier-colluding: the secret s is never revealed and no per-identifier salt is; an issuer who minted one identifier's credential learns nothing about the other from the proof
- **Construction 008** — against verifier: route 1: a verifier not party to the exchange learns nothing from C; a verifier party to it learns only what it already held
- **Construction 008** — against verifiers-colluding: verifiers in different contexts cannot link presentations through the binder — route 1 emits nothing reusable, route 2 emits a value scoped to one context descriptor
- **Construction 008** — against issuer-verifier-colluding: the issuer that placed C and a verifier together can link C to the exchange (the issuer knows u) — stated, not hidden: issuer–verifier collusion is outside this card's protection
- **Construction 010** — against verifier, verifiers-colluding: P1/P2 — no pairwise-scope identifier of the edge, no counterparty identifier
- **Construction 010** — against verifiers-colluding: P4 — unlinkable across contexts; within a reuse-detecting context the nullifier is the only link and it is declared
- **Construction 010** — against registry-operator, issuer-verifier-colluding: C3 — currency check does not identify Nia; holds only if rl_root/root_C are fetched without a per-holder query
- **Construction 011** — against verifier, verifiers-colluding: pairwise identifiers hidden; no cross-presentation correlator minted by the linkage itself
- **Construction 012** — against verifier, verifiers-colluding: no identifier beyond the disclosed set, and no cross-presentation handle: two verifiers shown different subsets cannot join them through this proof
- **Construction 012** — against issuer-verifier-colluding, registry-operator: the issuer of any one credential in the show learns nothing about the others from the proof; the revocation-state fetch must not be a per-holder query (card 006 C3)
- **Construction 020** — against verifier, verifiers-colluding: principal hidden; chain length hidden up to maxDepth

### Negative space as recorded, per construction

*Generated from the `doesNotEstablish` field of every construction record (first three items each; the full list is in the record).*

- **Construction 001** does not establish: that the community's admission decision was correct (assurance boundary); that the leaf is current (see card 006); which member the holder is
- **Construction 002** does not establish: one natural person globally; one enrolment per issuer or ecosystem (second point of the trade curve — governance, not cryptography); cross-context uniqueness
- **Construction 003** does not establish: freshness beyond what the challenge carries; that the verifier's challenge was itself honest
- **Construction 004** does not establish: non-transfer of the secret; absence of coercion or account sharing; agent authority or consent
- **Construction 005** does not establish: that the two parties are independent in the accreditation sense (declared, not proven — X8); that either is honest
- **Construction 006** does not establish: that revocation is instantaneous — only that the handle was not revoked as of `epoch` (C4's published bound); that the registry's revocation decision was correct; that the verifier performed no live lookup — the card makes the presentation self-carrying (root + witness); whether a deployment still phones home is a profile statement, not a proof property
- **Construction 007** does not establish: that the controller is one natural person — two agents or two people sharing a secret satisfy the clause (that is card 002's uniqueness, under its own declaration); that either credential is currently valid or unrevoked (card 006); that the holder intended the two identifiers to be correlated beyond this verifier — the proof is a disclosure to the party it is made to, not a widening of either identifier's declared scope; …
- **Construction 008** does not establish: that the trust task completed, or what was done in it — completion evidence is a framework artifact outside any credential (the artifact gap, cred-tf #39/#40); that the binder's plaintext is not held elsewhere — the framework holds it in the Trust Task documents; this card blinds only the copy the credential carries; durable-versus-task-dependent status of the claim (Outcome Interpretability is the credential layer's statement, not this proof's)
- **Construction 010** does not establish: that Omar endorses this request — a VRC is standing, not per-request; S5 binds the proof, not the relationship; that Nia is one natural person (that is PR-UNQ in a different context, card 002 under its own declaration); that C's admission decision for either member was correct (assurance boundary — accreditation carries assurance); …
- **Construction 011** does not establish: any community-level assurance (that is card 010); that the personas are distinct natural persons; the relationship's content beyond what the statement discloses; …
- **Construction 012** does not establish: that the presenter is one natural person (k credentials, one secret: an agent holding a person's secret satisfies every clause — card 002 under its own declaration establishes uniqueness); anything about credentials not in the show: intentional correlation is declared per presentation and does not widen any identifier's declared scope; that the communities involved consented to be named together — the disclosure is the holder's; …
- **Construction 020** does not establish: that the principal authorised this specific act (grant ≠ invocation — the invocation is a trust-task artifact); the principal's identity; that the agent is not also acting for others; …
