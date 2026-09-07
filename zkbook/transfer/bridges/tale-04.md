# Tale 4 — The Fields of Finite Wisdom

Concepts: Finite Fields, Elliptic Curves, Group Theory, Pairing-Friendly Curves

Source: The Zero Knowledge Spellbook (zk_grimoire v3.0), '#### Technical Bridge' of Tale 4 (source lines from 584); 7 lore lines dropped by rule.

---

**Finite Field 𝔽_q:**
- q = p^k elements (p prime)
- Addition and multiplication (mod q)
- Every non-zero element has inverse

**Elliptic Curve Group:**
- Points satisfy y² = x³ + ax + b
- Point addition: geometric line-and-reflect
- Identity element: point at infinity (𝒪)
- Order n: n·P = 𝒪 for all points P

**Pairing e: G₁ × G₂ → G_T:**
- Bilinearity enables equation verification
- Used in Groth16, KZG commitments
- Requires pairing-friendly curves (BN254, BLS12-381)

**Curve Examples:**
- BN254: ~100-128 bit security, common in Ethereum
- BLS12-381: 128-bit security, used in Zcash, Ethereum 2.0
- Pasta (Pallas/Vesta): Recursive-friendly pair

**Applied to:** All pairing-based SNARKs, commitment schemes, recursive proof systems
