# Tale 10 — The Commitment Ceremony

Concepts: Polynomial Commitment Schemes, Hiding vs Binding, PCS Properties

Source: The Zero Knowledge Spellbook (zk_grimoire v3.0), '#### Technical Bridge' of Tale 10 (source lines from 1517); 4 lore lines dropped by rule.

---

**PCS Interface:**
```
Setup(λ, n) → pp (public parameters)
Commit(pp, φ(x), r) → C (commitment)  
Open(pp, φ, a, C, r) → (y, π) where y = φ(a)
Verify(pp, C, a, y, π) → accept/reject
```

**Properties Required:**
1. **Binding:** Cannot open to different y' ≠ φ(a)
2. **Hiding:** C reveals nothing about φ (computational or information-theoretic)
3. **Evaluation binding:** Cannot produce valid proof for wrong evaluation

**Comparison Table:**

| PCS | Commit | Proof | Verify | Setup | Quantum-Safe |
|-----|--------|-------|--------|-------|--------------|
| KZG | O(n log n) | O(1) 48B | O(1) pairing | Trusted | ✗ |
| IPA | O(n) | O(log n) | O(log n) | Transparent | ✗ |
| FRI | O(n log n) | O(log²n) | O(log²n) | Transparent | ✓ |

**Where n = degree of polynomial**

**Used In:**
- KZG: PlonK, Groth16, most Ethereum L2s
- IPA: Halo2, Bulletproofs
- FRI: STARKs (StarkNet, Polygon Miden, Risc Zero)

**Applied to:** All modern SNARKs, data availability, verifiable secret sharing
