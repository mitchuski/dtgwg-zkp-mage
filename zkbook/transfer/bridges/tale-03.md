# Tale 3 — The Silent Messenger

Concepts: Fiat-Shamir Transformation, Random Oracle Model, Non-Interactivity

Source: The Zero Knowledge Spellbook (zk_grimoire v3.0), '#### Technical Bridge' of Tale 3 (source lines from 487); 4 lore lines dropped by rule.

---

**Fiat-Shamir Transformation:**
- Converts interactive ZKP to NIZK
- Replaces verifier's random challenge with hash output
- Security relies on Random Oracle Model (ROM)
- Common in practice: Groth16, PlonK, STARKs all use variants

**Hash Function Requirements:**
- Domain separation to prevent cross-protocol attacks
- Include all relevant context in hash
- Cryptographic hash (SHA-256, BLAKE2, Poseidon for in-circuit)

**Vulnerability:** Improper Fiat-Shamir can break soundness (see Frozen Heart vulnerability in Bulletproofs)

**Applied to:** NIZK construction, proof compression, asynchronous verification
