# Tale 17 — The Universal Setup

Concepts: Universal vs Circuit-Specific Setup, Trusted Setup Ceremonies, Powers of Tau, MPC

Source: The Zero Knowledge Spellbook (zk_grimoire v3.0), '#### Technical Bridge' of Tale 17 (source lines from 3023); 4 lore lines dropped by rule.

---

**Powers of Tau Structure:**

Setup produces:
```
G₁: [g^1, g^τ, g^(τ²), ..., g^(τ^N)]
G₂: [h^1, h^τ, h^(τ²), ..., h^(τ^N)]
```

**Circuit-Specific Key Derivation (PlonK):**

Given universal parameters and circuit description:
```
1. Compute selector polynomials: q_L, q_R, q_O, q_M, q_C
2. Compute permutation polynomial: σ
3. Derive: [q_L(τ)], [q_R(τ)], [σ(τ)], etc. using universal params
4. All computation public—no secrets needed!
```

**Security Analysis:**

**Trust Assumptions:**
- Groth16: Trust all 6 ceremony participants
- Universal (1-of-N): Trust ≥1 of N participants
- Transparent: Trust cryptographic assumptions only

**Probability of Compromise:**
- If p = probability any single participant is honest
- n participants
- Probability of compromise: (1-p)^n

Example: p=0.1 (only 10% honest), n=100
→ Compromise probability: 0.9^100 ≈ 0.000026 (extremely low)

**Real Ceremonies:**

**Perpetual Powers of Tau:**
- Phase 1: 87 contributors (2017-2018)
- Phase 2: 300+ contributors (ongoing)
- Total entropy: 400+ independent randomness sources
- Supports up to 2^28 (~268M) constraints
- Used by: Aztec, Hermez, Tornado Cash, zkSync

**Circuit-Specific Examples:**
- Zcash Sprout: 6 participants
- Zcash Sapling: 90+ participants  
- Loopring: Separate ceremony

**Applied to:** Practical SNARK deployment, production systems, ceremony planning
