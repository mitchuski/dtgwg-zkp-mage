---
title: "Lab — 01-uniqueness-nullifier"
section: "lab"
source: "../dtgwg-zkp-tf-mage/runtimes/01-uniqueness-nullifier/NOTES.md"
built_from_commitish: "working-tree"
order: 60
---
# 01 — Uniqueness within a context (nullifier) — notes

**Predicate (Section 4):** *Uniqueness within a context* — "Nullifier-based scheme (deterministic per-context pseudonym) for duplicate / Sybil resistance without a global identifier — cf. privacy-pool / Semaphore-style nullifiers."

**Cred-spec anchor** (`../CRED-SPEC-COHERENCE.md`): this nullifier is the ZK mechanism that *enforces* two Credentials-Core-Spec rules — **R-DID uniqueness** ("each entity MUST generate a new, unique R-DID for every counterparty; no reuse") and the **PHC pattern** ("a VMC whose governance enforces real human personhood **and exactly-one-membership-per-person**"). One deterministic pseudonym per person per context is precisely the "one membership per person" a PHC asserts. Rides the spec's **community-anchored (VMC-based) construction** — the "context" scoping is the shared C-DID. Where notes below say "accredited enrolment set," the spec's governance term is **trust registry** (the VTC membership the registry governs); "set" is kept only for the cryptographic Merkle object.

**Stack decision for this predicate:** Node reference model now (zero-dep, offline) → circom/Semaphore circuit next. Rationale: the reference model pins down the *relations* and the property set cheaply; the circuit only needs to prove those same relations in ZK, so getting the algebra and the adversary tests right first de-risks the circuit.

## What the runtime demonstrates

Construction:
- `enrol(human)` → `secret s`, blinding `r`, public `commitment = H(s, r)` (goes in the accredited enrolment set).
- `nullifier(s, context) = H(s, context)` — the per-context pseudonym.
- ZKP (modelled, not yet in ZK): public = (context, nullifier, enrolment-set root); private = (s, r, membership path); statement = `commitment(s,r) ∈ set  ∧  nullifier == H(s, context)`.

Properties verified by `test.mjs` (9/9):
- **Determinism** (P1), **cross-context unlinkability** (P2), **distinctness of real humans** (P3).
- **User-as-adversary / self-Sybil** (P4): the same human's second account in one context is rejected as `duplicate-human-in-context`, without the registry learning identity.
- **Context isolation** (P5), **grinding resistance** (P6), **commitment hiding + stability** (P7).

## Feedback to the strawman (candidate upstream edits)

1. **The nullifier is necessary but not sufficient — and the runtime makes that concrete.** P4 only holds *because* `enrol` is assumed to map one human to one `secret`. The strawman's Section 4 design note already says this ("anti-Sybil strength comes from the deduplicating enrolment, not the proof"); the runtime is a runnable demonstration of exactly that dependency. Suggest citing a reference construction next to the prose so the WG's first decision has something executable attached.

2. **Hash agility is a spec-level requirement, not an implementation detail.** The reference uses SHA-256; the circuit will use Poseidon. Both give the same security argument, but the *nullifier value differs by hash*, so the spec should pin the hash (and a versioned domain-separation tag — the runtime already uses `dtg-zkp/nullifier/v0`) to keep nullifiers stable and interoperable across implementations. Propose adding a "nullifier binding = H_domain(secret, context)" definition with the hash named.

3. **"Context" needs a canonical encoding.** Unlinkability (P2) and isolation (P5) depend on two verifiers deriving *different* context strings and one verifier deriving a *stable* one. That makes context canonicalization a conformance requirement — worth a line in Section 5 (Context) or an open question in Section 9.

## Next steps for this runtime

- [ ] Port to a circom circuit (Poseidon nullifier + Merkle membership over the accredited set); prove `commitment ∈ set ∧ N == Poseidon(s, ctx)`.
- [ ] Measure proof-gen cost on a consumer device (feeds Section 9 Q4, "claim ceiling per presentation").
- [ ] Cross-check the nullifier definition against Semaphore v4 so we can say "conformant with / diverges from" precisely.
