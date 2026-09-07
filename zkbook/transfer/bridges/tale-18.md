# Tale 18 — The Toxic Waste Dragon

Concepts: Security Vulnerabilities, Trusted Setup Failures, Circuit Bugs, Audit Practices

Source: The Zero Knowledge Spellbook (zk_grimoire v3.0), '#### Technical Bridge' of Tale 18 (source lines from 3313); 4 lore lines dropped by rule.

---

**Setup Vulnerabilities:**

**Attack Model:**
```
Attacker possesses τ from compromised ceremony
Can compute:
- g^(φ(τ)) for any polynomial φ
- Valid proofs for any statement (true or false)
```

**Detection:** Impossible (zero-knowledge property hides forgery)

**Mitigation:**
- Multi-party computation (1-of-N trust)
- Transparent systems (no τ exists)

**Parameter Vulnerabilities:**

**Common Weaknesses:**
- Insufficient FRI queries (STARK soundness)
- Small field size (brute force attacks)
- Weak Fiat-Shamir hash (domain separation issues)
- Reduced security parameters for performance

**Example: FRI Soundness**
```
Claimed degree: d
Domain size: n
Queries: k

Soundness error ≈ (d/n)^k

Required: (d/n)^k < 2^(-λ) for λ-bit security
```

**Circuit Vulnerabilities:**

**Under-Constraint Example:**
```circom
template Multiplier() {
    signal input a;
    signal input b;
    signal output c;
    
    c <-- a * b;  // BUG: only assignment, no constraint
}

// Fix:
c <== a * b;  // constraint with automatic witness
// or explicitly:
c === a * b;
```

**Audit Checklist:**
- [ ] All signals properly constrained
- [ ] Range checks on all bounded values
- [ ] No overflow/underflow possible
- [ ] Private inputs truly private
- [ ] Public inputs properly exposed
- [ ] Edge cases tested
- [ ] Malicious prover tests

**Cryptanalytic Risks:**

**Current Assumptions:**
- Discrete Log Problem (DLP)
- Computational Diffie-Hellman (CDH)
- Decisional Diffie-Hellman (DDH)
- q-Strong Diffie-Hellman (q-SDH)
- Knowledge of Exponent (KEA)

**Post-Quantum Status:**
- Pairing-based SNARKs: Broken by Shor's algorithm
- Hash-based (FRI): Quantum-resistant
- IPA/Bulletproofs: Broken by Shor's algorithm

**Applied to:** Security audits, production deployment, risk assessment, long-term system design
