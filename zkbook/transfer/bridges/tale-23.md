# Tale 23 — The Private Coin of ZCash

Concepts: Shielded Transactions, JoinSplit, Sapling, Orchard, Privacy Pools

Source: The Zero Knowledge Spellbook (zk_grimoire v3.0), '#### Technical Bridge' of Tale 23 (source lines from 4916); 4 lore lines dropped by rule.

---

**Note Structure (Sapling):**

```
Note = (value, addr, rho, rcm)
- value: amount (64 bits)
- addr: payment address (diversified)
- rho: unique to prevent linkability
- rcm: commitment randomness

Commitment: cm = PedersenCommit(value, addr, rho, rcm)
Nullifier: nf = PRF(spending_key, rho)
```

**Spend Circuit (Sapling):**

```
Public inputs:
- rt: Merkle root (commitment tree)
- nf: nullifier
- rk: randomized verification key
- cv: value commitment

Private inputs:
- path: Merkle path
- value: note value
- addr: payment address
- rho, rcm: note secrets
- alpha: randomness

Constraints:
1. Commitment valid: cm = COMM(value, addr, rho, rcm)
2. Merkle path valid: path leads from cm to rt
3. Nullifier correct: nf = PRF(sk, rho)
4. Value commitment: cv = PedersenCommit(value, rcm_v)
5. Signature key: rk = SpendAuthSig(sk, alpha)

Total: ~170,000 constraints
```

**Privacy Pool Proof:**

```
Public inputs:
- pool_root: Merkle root of approved addresses
- tx_proof: Normal shielded tx proof

Private inputs:
- source_address: where funds actually came from
- membership_path: Merkle path proving source_address ∈ approved set

Constraints:
1. tx_proof.verify() == true (valid shielded transaction)
2. MerkleVerify(source_address, membership_path, pool_root) == true
3. Bind source_address to transaction (via commitment)

Result: Privacy maintained, compliance proven
```

**Performance Comparison:**

| Version | Circuit Size | Proof Time | Setup | Year |
|---------|--------------|------------|-------|------|
| Sprout | 2.3M | ~60s | Trusted (6) | 2016 |
| Sapling | 170K | ~7s | Trusted (90) | 2018 |
| Orchard | ~100K | ~3s | Transparent | 2021 |

**Real-World Impact:**

- ZEC market cap: ~$500M-1B
- Shielded transactions: ~5-20% of volume
- Privacy adoption: Growing but still minority
- Regulatory pressure: Delisting from some exchanges
- Technical legacy: Influenced Tornado Cash, Aztec, many privacy protocols

**Applied to:** Privacy protocols, compliant anonymity, financial sovereignty, note-based privacy systems
