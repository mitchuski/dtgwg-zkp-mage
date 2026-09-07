# Tale 14 — The IPA Chronicle

Concepts: Inner Product Arguments, Bulletproofs, Halo2, Transparent Setups

Source: The Zero Knowledge Spellbook (zk_grimoire v3.0), '#### Technical Bridge' of Tale 14 (source lines from 2300); 4 lore lines dropped by rule.

---

**IPA Protocol (Simplified):**

Given commitment C to vector a, claim ⟨a,b⟩ = z:

```
Setup: G = (G₁,...,Gₙ), H (random curve points)
Commitment: C = Σ aᵢGᵢ + rH

For k = 1 to log₂(n):
    Split: a = (aₗ || aᵣ), b = (bₗ || bᵣ)
    
    Compute: L = ⟨aₗ,bᵣ⟩·G + random·H
             R = ⟨aᵣ,bₗ⟩·G + random·H
    
    Send L, R to verifier
    
    Receive challenge: u
    
    Fold: a ← aₗ + u⁻¹aᵣ
          b ← ubₗ + bᵣ  
          G ← Gₗ + uGᵣ
          
Final: Send (a,b) (now scalars), verify ⟨a,b⟩ matches folded relation
```

**Complexity:**
- Proof size: 2·log₂(n) curve points + 2 scalars
- Prover time: O(n log n)
- Verifier time: O(n) (must reconstruct G through folding)

**Bulletproofs Range Proof:**
- Claim: v ∈ [0, 2ⁿ)
- Prove v = Σ vᵢ2ⁱ where vᵢ ∈ {0,1}
- Convert to inner product relation using Hadamard product
- Size: 2log₂(n) + 7 curve points

**Halo 2 Stack:**
- Circuits: PlonKish (custom gates, lookup tables)
- Polynomial commitment: IPA
- Curves: Pasta (Pallas/Vesta pair)
- Recursion: Cycle between Pallas and Vesta

**Real Systems:**
- Monero: Uses Bulletproofs for confidential amounts
- Zcash: Halo 2 in Orchard shielded pool  
- Mina: Previous recursion (now transitioning)
- Scroll: Halo 2 variant for zkEVM

**Applied to:** Transparent SNARKs, range proofs, recursive composition without pairings
