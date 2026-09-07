# Tale 11 — The FRI Oracle

Concepts: Fast Reed-Solomon IOP, Low-Degree Testing, Proximity Proofs, STARKs

Source: The Zero Knowledge Spellbook (zk_grimoire v3.0), '#### Technical Bridge' of Tale 11 (source lines from 1697); 9 lore lines dropped by rule.

---

**FRI Protocol Formally:**

Given claimed polynomial φ(x) of degree ≤ d over domain D:

**Commit Phase:**
```
Round 0: Commit to φ₀(x) = φ(x) evaluations via Merkle
For i = 0 to log(d):
    Receive random challenge αᵢ
    Compute φᵢ₊₁(x) = φᵢ_even(x) + αᵢ · φᵢ_odd(x)
    Commit to φᵢ₊₁ evaluations via Merkle
Until φ_final is constant
```

**Query Phase:**
```
For j = 1 to num_queries:
    Choose random index r
    For each layer i:
        Request φᵢ(r) and φᵢ(-r) with Merkle proofs
        Verify: φᵢ₊₁(r²) = (φᵢ(r) + φᵢ(-r))/2 + αᵢ·(φᵢ(r) - φᵢ(-r))/(2r)
```

**Security:**
- Soundness error: (d/|D|)^num_queries
- Typical: 20-40 queries for 100+ bit security
- Proof size: O(n · log(n) · log(d)) where n = |D|

**STARK Stack:**
- **AIR (Algebraic Intermediate Representation):** Constraint system for execution traces
- **Trace polynomial:** Encodes computation as polynomial
- **Quotient polynomial:** Proves constraints satisfied
- **FRI:** Proves all polynomials are low-degree

**Performance (Fibonacci 1M iterations):**
- Proving time: ~2-5 seconds
- Proof size: ~150 KB
- Verification: ~10-30 ms
- **No setup required**

**Real Systems:**
- StarkWare: StarkNet, StarkEx
- Polygon: Polygon Miden (zkVM)
- RiscZero: Rust zkVM
- Winterfell: STARK library

**Applied to:** STARKs, quantum-resistant ZKP, long-term archival, trustless systems
