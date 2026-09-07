# Tale 1 — The Monastery of Hidden Knowledge

Concepts: ZKP Definition, NIZK, Core Properties, Interactive vs Non-Interactive

Source: The Zero Knowledge Spellbook (zk_grimoire v3.0), '#### Technical Bridge' of Tale 1 (source lines from 331); 6 lore lines dropped by rule.

---

**ZKP Definition:** For a statement S, a protocol between Prover P and Verifier V satisfies:
1. **Completeness:** If S is true, P convinces V with probability ≈ 1
2. **Soundness:** If S is false, P cannot convince V except with negligible probability
3. **Zero-Knowledge:** V learns only that S is true, nothing more

**NIZK:** When V needs no interaction with P—just receives and verifies a proof.

**Historical Note:** First formalized in "The Knowledge Complexity of Interactive Proof Systems" (1985).

**Applied to:** Any ZKP system, sovereignty protocols, privacy architectures
