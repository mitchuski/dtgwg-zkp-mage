# Tale 8 — The Plonkish Revolution

Concepts: PlonK, Custom Gates, Lookup Tables, Copy Constraints, Permutation Arguments

Source: The Zero Knowledge Spellbook (zk_grimoire v3.0), '#### Technical Bridge' of Tale 8 (source lines from 1167); 9 lore lines dropped by rule.

---

**PlonK Gate Equation:**
```
qL·a + qR·b + qO·c + qM·(a·b) + qC = 0
```

Where q values are public selectors that configure gate behavior.

**Ultra PlonK Extensions:**
- Higher-degree gates: q₁·a² + q₂·b³ + ... = 0
- Custom gates: Specialized equations for common operations
- Lookup arguments: Plookup, LogUp for table queries

**Permutation Argument (Copy Constraints):**
- Mark wires that should be equal: {w₁, w₅, w₁₂}
- Prove they form a permutation of their values
- Uses polynomial identity testing
- Much cheaper than constraint-per-equality

**Lookup Tables (Plookup):**
1. Prover claims lookups in table T
2. Create sorted list of lookups
3. Prove sorted list is a subset of T using permutation
4. Single polynomial check verifies all lookups

**Efficiency Gains:**
- Poseidon hash: 20x fewer constraints vs R1CS
- Range checks: 100x fewer constraints with lookups
- Bit operations: 10x fewer constraints with custom gates
- Universal setup: One ceremony for all circuits

**PlonK Variants:**
- TurboPLONK: Higher-degree custom gates
- UltraPLONK: + lookup tables
- PlonKup: Lookup-optimized
- Halo2: PlonKish + IPA backend

**Applied to:** Modern zkEVM, hash-heavy circuits, bit operations, range proofs
