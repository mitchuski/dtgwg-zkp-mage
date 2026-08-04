# 04 — Holder / agent binding — stub

**Predicate:** Proof of knowledge of the holder key, bound to the session.

**Cred-spec anchor** ([`../CRED-SPEC-COHERENCE.md`](../CRED-SPEC-COHERENCE.md)): binds the presenter to a Credentials-Core-Spec **subject DID** — for the persona case a **P-DID** carried by a **VPC** (Verifiable Persona Credential), for the agent case the **VTA** (Verifiable Trust Agent, local or cloud) acting for a principal. This is the spec's holder→credential binding, and the "agent-binding envelope" decision below is the VTA/delegated-key distinction (local VTA vs cloud VTA presenting on the principal's behalf). Rides the **pairwise (VRC-based) construction**.

**Statement to prove (ZK):** PoK of `sk` s.t. `pk = derive(sk)` AND the proof is bound to `sessionTranscript`. This is the agent-authorisation hook (Section 5: "human anchoring / authorising an AI agent" — day-zero and step-up).

**Stack candidates:** Schnorr/EdDSA PoK bound to a session challenge; cheapest of the six. Binding = include the session transcript hash as a public input the proof commits to.

- [ ] Prototype session-bound PoK; verify the same proof fails under a different transcript.
- [ ] Define the agent-binding envelope (which key: holder vs. delegated agent key).
