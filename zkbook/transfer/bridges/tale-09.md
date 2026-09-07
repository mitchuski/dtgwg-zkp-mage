# Tale 9 — The Pairing Dance

Concepts: Bilinear Pairings, Groth16, KZG Commitments, Pairing-Based SNARKs

Source: The Zero Knowledge Spellbook (zk_grimoire v3.0), '#### Technical Bridge' of Tale 9 (source lines from 1346); 4 lore lines dropped by rule.

---

**Pairing Properties:**
```
e(P + P', Q) = e(P, Q) · e(P', Q)   (left linearity)
e(P, Q + Q') = e(P, Q) · e(P, Q')   (right linearity)  
e(aP, bQ) = e(P, Q)^(ab)            (bilinearity)
e(P, Q) = 1_GT ⟺ P = O or Q = O    (non-degeneracy)
```

**Groth16 Proof:**
- Proof = ([A], [B], [C]) ∈ G₁ × G₂ × G₁
- Size: 128 bytes (BN254) or 192 bytes (BLS12-381)
- Verification: 3 pairings + small arithmetic
- Setup: Circuit-specific, requires τ destruction

**KZG Polynomial Commitment:**
```
Commit:  C = g^φ(τ)
Open:    q(x) = (φ(x) - y)/(x - a)
Proof:   π = g^q(τ)
Verify:  e(C / g^y, g) = e(π, g^τ / g^a)
```

**Security:**
- Relies on q-SDH (q-Strong Diffie-Hellman) assumption
- Trusted setup: τ must be destroyed
- Multi-party ceremony: safe if ≥1 participant is honest

**Practical Curves:**
- **BN254:** ~100-128 bit security, Ethereum's choice, faster
- **BLS12-381:** 128-bit security, future-proof, Ethereum 2.0

**Applied to:** Groth16, KZG, PlonK with KZG backend, Ethereum L2s
