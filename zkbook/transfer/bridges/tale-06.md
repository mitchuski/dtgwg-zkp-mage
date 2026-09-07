# Tale 6 — The Polynomial Riddle

Concepts: QAP (Quadratic Arithmetic Programs), Polynomial Conversion, Vanishing Polynomial

Source: The Zero Knowledge Spellbook (zk_grimoire v3.0), '#### Technical Bridge' of Tale 6 (source lines from 848); 4 lore lines dropped by rule.

---

**QAP Transformation:**

Given R1CS with n constraints and m wires:

1. Create polynomials for each wire and each position:
   - A_wire(i) = coefficient of wire in left side of constraint i
   - B_wire(i) = coefficient of wire in right side of constraint i  
   - C_wire(i) = coefficient of wire in output side of constraint i

2. Use Lagrange interpolation to extend these to full polynomials

3. Combine with witness values:
   - A(x) = Σ wᵢ · Aᵢ(x)
   - B(x) = Σ wᵢ · Bᵢ(x)
   - C(x) = Σ wᵢ · Cᵢ(x)

4. Vanishing polynomial: Z(x) = ∏ᵢ₌₁ⁿ (x - i)

5. QAP equation: A(x)·B(x) - C(x) = Z(x)·H(x)

**Verification:**
- Check equation at random point τ (chosen by setup)
- Use pairings to verify without revealing polynomials
- Soundness: cheating would require guessing τ (computationally infeasible)

**Degree Analysis:**
- A, B, C have degree ≤ n (number of constraints)
- Z has degree exactly n
- H has degree ≤ n (since A·B has degree ≤ 2n)

**Applied to:** Groth16, Pinocchio protocol, polynomial-based SNARKs
