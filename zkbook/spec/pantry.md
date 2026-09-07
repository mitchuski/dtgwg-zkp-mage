## Public Inputs — Shared Conventions

This section is informative in this Working Draft. Each convention names the construction record and the upstream thread it came from; the conventions are offered for ratification, not asserted.

Every construction takes its public inputs from the same set of conventions. Naming them once means a verifier implements one canonicaliser, one encoding, one notion of "current" and one mismatch class instead of one per proof.

### Context descriptor

A structured description of the context a proof is made in — scope, purpose, epoch — whose digest is the field element every context-scoped gadget takes as input. The nullifier binds to it (construction 002); the per-context pseudonym of the blinded binder derives from it (construction 008); the quiet-presentation leakage budget is stated against it. The descriptor is data a holder can read before presenting: the six questions of a context card are derived from it, not from prose beside it.

*Source: proof-of-liveness requirements v0.4 §6.1 (working context definition B1); evidence-repository instruments `canonical/` and `context-card/`.*

### Set roots

A [[ref: set root]] is a signed, published commitment to a set at a stated registry state. Three sets that the credentials specification treats separately are one object in these conventions:

- the **membership root** of a community — construction 001 proves a hidden leaf is under it;
- the **revocation root** at an epoch — construction 006 proves a hidden handle is *not* under it;
- the **accredited-issuer root** of a trust registry — construction 001 again, under its alias *issuer-as-predicate*: prove the issuer belongs to the set rather than naming it, because the observer is often a venue or event and therefore the most identifying element.

A presentation carries the root and the (non-)membership witness, so the verifier performs no live lookup. "No live lookups" is the privacy profile's default, not an absolute; any deployment that still fetches states the correlation surface it thereby opens.

**Which hash builds the root is a proving-system decision, not a convention of this section.** The evidence repository’s roots are Poseidon trees because pairing-based provers price standard hashes dearly; binary-field provers built for Ethereum's post-quantum transition (the Flock proving system) prove SHA-256 and BLAKE3 at under 250× native cost, so a registry may publish roots over the hashes it already uses and a proof may still be cheap. This section therefore names the root and its registry state, and leaves the hash to the option row — where the X3 issuance requirement for the hash side either appears or is relieved.

*Source: cred-tf #40 (the set-root unification, stormer78 2026-08-22; ScottJeezey 2026-08-24: "ours to pressure-test"); cred-tf #39 (ScottJeezey 2026-08-25).*

### Epoch and freshness

Three clocks, never collapsed: the proof artefact's freshness (the transcript's challenge), the credential's validity, and the status root's epoch. A construction's [[ref: horizon]] is the earliest of the clocks it depends on. "Current" in a fixture family means: the roots named as public inputs are the ones the verifier accepts for this epoch.

*Source: proof-of-liveness requirements v0.4 §8 (three freshness clocks), §10 (cryptoperiod and assurance horizon).*

### Transcript digest

Every proof in a show is bound to one [[ref: transcript digest]]: the digest of the canonical presentation transcript — the verifier's challenge, the disclosed fields, the context descriptor — canonicalised under RFC 8785 (JSON Canonicalization Scheme) and encoded as a Multibase/Multihash `digestMultibase` value. Naming the same canonicalisation the credentials layer names (WD02 D-A) gives an implementation one canonicaliser. Binding costs one constraint in the reference gadget: the proof binds the transcript, the nullifier binds the context, and the two are different bindings.

*Source: cred-spec #17 (RFC 8785 JCS named; 2026-08-29 note), cred-spec #31 D-A (digestMultibase settled); evidence-repository `circom-gadget` (+1 constraint, 11,523 total).*

### Declared correlation scope

Under the credentials specification's Working Draft 02, an identifier carries a holder-declared [correlation scope](https://github.com/trustoverip/dtgwg-cred-spec/pull/30) — `pairwise | directed | public`, monotonic — and roles come from credentials. The scope is a public input where a construction's disclosure depends on it: a `pairwise` identifier appears in a proof only behind a commitment; a `directed` persona identifier may be shown on purpose (construction 011); and whether a proof of common control is needed at all is decided by the declaration (constructions 007 and 012: no proof where one `directed` or `public` identifier was deliberately reused). Where a declaration is carried — credential or DID document — is open upstream and does not change the constructions.

*Source: cred-spec #22, PR #30 §Correlation Scope and §Choosing a scope; cred-tf #41.*

### Public-signal order (offered for ratification)

For Groth16-class constructions the reference gadget's public signals are ordered

```
[context, root_C, rl_root, epoch, nullifier?, transcriptDigest]
```

with `nullifier` present only in contexts that declare reuse detection. Construction records list their disclosure set in words; this is the wire order a verifier of the reference construction expects. It is a proposal of the evidence repository, not a decision of the task force.

*Source: evidence-repository `circom-gadget` signal order; construction 010 public-signal expectation.*
