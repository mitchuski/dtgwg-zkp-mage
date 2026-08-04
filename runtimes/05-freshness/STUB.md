# 05 — Freshness — stub

**Predicate:** Binding to a verifier challenge / nonce / session transcript. "A constraint layered on the above," not a standalone proof.

**Cred-spec anchor** ([`../CRED-SPEC-COHERENCE.md`](../CRED-SPEC-COHERENCE.md)): freshness is where our proofs meet the Credentials-Core-Spec's **`taskContext`** binding and its **outcome-interpretability rule** — "verifiers MUST NOT interpret a `taskContext`-bearing credential as evidence of task completion unless matching, reachable outcome evidence is also verified." Our verifier-chosen nonce ↔ the spec's `witnessContext.sessionId`; the validity window ↔ `validFrom`/`validUntil`. This runtime's replay harness is the natural **conformance harness** for that rule.

**Statement (constraint):** the proof commits to a fresh, verifier-chosen `nonce`/transcript as a public input, so a captured proof cannot be replayed. Defeats replay of an old liveness event (Section 3).

**Stack:** none of its own — this is a public-input + domain-separation discipline applied to 01/02/04. This runtime is a **conformance harness**: replay an old proof against a new challenge and assert rejection.

- [ ] Cross-runtime replay test: proof from 02/04 under nonce N₁ must fail under N₂.
- [ ] Define freshness window / clock-skew tolerance (relates to Section 9 Q5 refresh cadence).
