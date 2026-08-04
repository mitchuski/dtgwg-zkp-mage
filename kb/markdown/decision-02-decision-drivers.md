---
title: "Decision §2 — Decision drivers"
section: "decision"
source: "predicate-assurance-boundary-decision.md"
built_from_commitish: "working-tree"
order: 7
---
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
