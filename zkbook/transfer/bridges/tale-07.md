# Tale 7 — The Witness and the Instance

Concepts: Public vs Private Inputs, Proof Structure, Knowledge Soundness

Source: The Zero Knowledge Spellbook (zk_grimoire v3.0), '#### Technical Bridge' of Tale 7 (source lines from 990); 4 lore lines dropped by rule.

---

**Formal Definitions:**

**Instance (x):** Public values visible to verifier
- Verification key (vk)
- Public inputs/outputs
- Statement parameters

**Witness (w):** Private values known only to prover  
- Secret inputs
- Intermediate computation values
- Randomness used in proof

**Relation R:** Set of valid (instance, witness) pairs
- R = {(x, w) : C(x, w) = 1} where C is the circuit

**Knowledge Soundness:** For any prover P* that convinces V with probability ε, there exists an **extractor** that can extract a valid witness w with probability ≈ ε.

This is stronger than regular soundness (which just says false statements can't be proven).

**Zero-Knowledge Simulation:** There exists a simulator that can produce proofs indistinguishable from real proofs, without knowing the witness.

**Practical Implications:**
- Witness size doesn't affect proof size (in SNARKs)
- Multiple provers with same witness produce different proofs (randomization)
- Verifier learns only: "statement is true"

**Applied to:** All ZKP systems, credential design, privacy protocols
