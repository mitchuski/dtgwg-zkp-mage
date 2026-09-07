# Tale 5 — The Constraint Forge

Concepts: Arithmetic Circuits, R1CS, Gates, Constraints, Witnesses

Source: The Zero Knowledge Spellbook (zk_grimoire v3.0), '#### Technical Bridge' of Tale 5 (source lines from 719); 4 lore lines dropped by rule.

---

**Arithmetic Circuit:**
- Variables: wires carrying field elements
- Gates: operations (× and + over finite field)
- Constraint: equation that must hold

**R1CS (Rank-1 Constraint System):**
- Standard form: `a × b = c` where a, b, c are linear combinations of wires
- Full form: `(Σ aᵢ·wᵢ) × (Σ bⱼ·wⱼ) = Σ cₖ·wₖ`
- Matrix representation: (A·w) ∘ (B·w) = C·w where ∘ is element-wise product

**Key Concepts:**
- **Witness:** Private values assigned to wires
- **Instance:** Public inputs/outputs visible to verifier
- **Satisfying Assignment:** Witness values that make all constraints hold
- **Constraint Count:** Directly affects prover computation time

**Performance Impact:**
- More constraints → longer proving time
- Expensive operations in circuits:
  - Bit operations (AND, OR, XOR): 1-3 constraints each
  - Hash functions: 20,000-100,000 constraints
  - Signature verification: 50,000-150,000 constraints
  - Range proofs: ~300 constraints per bit

**Applied to:** Circuit design, ZKP optimization, constraint minimization
