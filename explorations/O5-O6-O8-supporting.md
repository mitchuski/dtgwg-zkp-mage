# O5 · O6 · O8 — Supporting explorations

*Three lower-cost lines: the freshness/transcript conformance harness, the pools cross-pollination, and the
post-quantum path. Each is mostly reuse of what already exists.*

**Register:** O5, O6, O8 · leverage 🟡 · **Ladder:** design notes

---

## O5 — Runtime 05 as the transcript-conformance harness

**Anchor:** cred-spec `taskContext` + outcome-interpretability · decision doc **PR-FRE** (§15).

The decision doc upgraded this exploration's target. The original idea bound the freshness nonce to
`witnessContext.sessionId`; §15.2 now rules that **a bare nonce is insufficient** — freshness means binding
to a **canonical transcript**: protocol/profile versions, verifier/audience, governed context descriptor,
purpose, scope, challenge, session, requested predicates, policy requirements, delegation reference, expiry,
snapshot requirements, proving mode, encoding version.

So runtime 05 becomes the **conformance harness for PR-FRE**:

- implement canonical-transcript formation + digest (one implementation, shared with the VWC seat's
  `transcript_digest` and O7's step-up binding);
- property tests from §26.1's negative list: replay into another verifier/context/purpose/scope/transcript
  must fail; a materially different transcript with the same nonce must fail; transcript-field observation
  is recorded as disclosure (§15.4), not treated as free.

Cheapest full deliverable in the lab: PR-FRE is required by both MLP and EPP, so the harness serves every
profile. **Negative meaning** carried: PR-FRE establishes only binding-to-current-transcript — never
liveness, personhood, identity, or authority (§15.3).

## O6 — Correlation architecture ↔ privacy-pools / mana-pools lineage

**Anchor:** cred-spec four-DID model (R/M/C/P) with mandatory R-DID uniqueness · decision doc §6
(context = governed linkability domain) · §6.6 prohibited cross-context linkage.

The pools lineage (privacy-pools withdraw folding, mana-pools, the runtime-01 nullifier itself) is the same
unlinkability discipline the spec's correlation architecture demands. Two directions of transfer:

- **Pools → DTG:** domain-separated derivation as the R/M/C/P-DID minting discipline — each R-DID is a
  per-counterparty derivation from the holder secret, exactly the pools' per-context pseudonym pattern;
  the pools' association-set reasoning maps to registry epoch roots (O4).
- **DTG → pools:** the decision doc's context machinery (§6.2 canonical descriptors, §6.7 context
  authority + change control, §6.6 prohibited-linkage list) is a *governance* layer the pools story never
  formalized — "which withdrawals may be linked, by whom, under whose authority" is a context decision
  record. The 0xbow/ASP world would recognize every row of it.

Deliverable: a two-page derivation-discipline note (how one holder secret safely mints R/M/C/P-DIDs with
provable non-correlation, pools-style) — feeds O2's descriptor upgrade and any TF question about DID
derivation. Low urgency; write when O2's M2 lands.

## O8 — The post-quantum path

**Anchor:** strawman §8 ("pre-quantum acceptable for v1, documented PQ path") · decision doc §24 ("MUST NOT
make post-quantum support a blocker for the first implementable release") + §29 (PQ migration = an
implementation question "requiring layer separability and evidence, not only algorithm identifiers") +
§22.3 (migration must be a concrete mechanism).

The TF can lead the PQ story for the whole DTG stack precisely because the decision doc keeps it out of
V1's critical path. The deliverable is a **layer-separability analysis**, not a scheme swap:

| Layer | PQ status |
|---|---|
| Hash commitments, nullifiers, Merkle roots (the shared gadget) | already PQ-safe (symmetric/hash assumptions) |
| Proof system (Groth16/PLONK-class over pairings) | not PQ; the layer that must be swappable (STARK-class successors) |
| Issuer signatures on attestations (IDVC, VWC, delegation) | migrate with issuer PKI (ML-DSA et al.) — an O3 schema-versioning concern, not a circuit concern |
| Long-lived artefacts (enrolment roots, §22.2 cryptoperiods) | the real exposure: harvest-now-decrypt-later applies to anything retained; cryptoperiods are the control |

Threat-model credibility comes from the ecdsa.fail / quantum-ECC lineage (shor_mage): concrete cost models
for the classical-breaks timeline rather than hand-waving. Deliverable: a "PQ considerations" section for
the V1 draft doing §22.3 properly — profile identifiers, version negotiation, overlap periods, downgrade
protection, and what happens to enrolment roots at migration. Write once the construction gate (§25) has
named actual proof systems; before that it has nothing concrete to separate.
