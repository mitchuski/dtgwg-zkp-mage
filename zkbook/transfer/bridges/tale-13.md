# Tale 13 — The Sumcheck Riddle

Concepts: Sumcheck Protocol, Interactive Proofs, GKR Protocol, Multilinear Extensions

Source: The Zero Knowledge Spellbook (zk_grimoire v3.0), '#### Technical Bridge' of Tale 13 (source lines from 2095); 4 lore lines dropped by rule.

---

**Sumcheck Protocol:**

Prover claims: H = Σ_{x∈{0,1}ⁿ} g(x₁, ..., xₙ)

```
For i = 1 to n:
    Prover sends: gᵢ(Xᵢ) = Σ_{xᵢ₊₁,...,xₙ ∈ {0,1}} g(r₁,...,rᵢ₋₁,Xᵢ,xᵢ₊₁,...,xₙ)
    
    Verifier checks: 
        gᵢ(0) + gᵢ(1) = previous_sum (or H if i=1)
        
    Verifier sends: random challenge rᵢ ← 𝔽
    
    Update: previous_sum ← gᵢ(rᵢ)
    
End: Verifier checks g(r₁,...,rₙ) = gₙ(rₙ) by evaluating directly
```

**Complexity:**
- Rounds: n
- Communication: n polynomials of degree d
- Verifier time: O(n · d)
- Soundness error: n · d / |𝔽|

**Multilinear Extension:**

Any f: {0,1}ⁿ → 𝔽 extends uniquely to f̃: 𝔽ⁿ → 𝔽 where:
```
f̃(x₁,...,xₙ) = Σ_{b∈{0,1}ⁿ} f(b) · ∏ᵢ χᵢ(xᵢ, bᵢ)
χᵢ(x,0) = 1-x, χᵢ(x,1) = x
```

**Applications:**
- **GKR:** Verifiable circuit evaluation
- **Spartan:** SNARK based on sumcheck
- **Hyrax:** Doubly-efficient IPs
- **HyperNova:** Used in folding
- **zkVMs:** Memory consistency checks

**Performance Example (2²⁰ sum):**
- Direct computation: 1M evaluations
- Sumcheck rounds: 20
- Verifier work: ~100 field operations
- **~10,000x speedup**

**Applied to:** Polynomial verification, GKR protocol, zkVMs, memory checking
