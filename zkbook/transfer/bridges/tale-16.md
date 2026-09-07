# Tale 16 — The Cyclic Ceremony

Concepts: Cyclic Recursive ZKP, Self-Referential Circuits, Circuit Identity Verification

Source: The Zero Knowledge Spellbook (zk_grimoire v3.0), '#### Technical Bridge' of Tale 16 (source lines from 2803); 1 lore lines dropped by rule.

---

**Cyclic Recursion Construction:**

```
Circuit C {
    Inputs:
        - new_state: current computation
        - prev_proof: previous proof from C
        - circuit_identity: claimed hash of C
        
    Constraints:
        1. Verify prev_proof is valid SNARK proof
        2. Extract "circuit_hash" from prev_proof's public inputs
        3. Check: circuit_hash = circuit_identity
        4. Check: circuit_identity = hash(description of C)
        5. Compute new state from old state
        6. Output new_state and circuit_identity as public inputs
}
```

**Why It Works:**

- Circuit hash is a fixed value once circuit is defined
- Hash verification can be embedded without changing the hash
- Public inputs carry circuit identity forward
- Each proof attests to circuit identity, creating trust chain

**Performance:**

- Additional cost: ~30,000-50,000 constraints for hash verification
- Typically uses Poseidon hash (ZK-friendly)
- Amortized over many iterations

**Real Systems:**

**Mina Protocol:**
- Uses cyclic Pickles proving system
- Constant-size blockchain (~22 KB)
- Each block proves entire history
- Circuit: validate block + verify previous proof

**Incrementally Verifiable Computation:**
- Same circuit, different inputs each step
- Final proof validates entire computation
- Used in some zkVM designs

**Limitations:**

1. **Homogeneous computation:** All steps must fit same circuit
2. **No circuit upgrades:** Changing circuit breaks the cycle
3. **Initial proof:** Need base case (can use dummy proof)

**Applied to:** Blockchain compression, homogeneous state machines, constant-space verification
