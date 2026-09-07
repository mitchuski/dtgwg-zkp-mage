# Tale 24 — The Tornado's Eye

Concepts: Mixing Services, Anonymity Sets, Deposit/Withdraw, Sanctions, Decentralized Privacy

Source: The Zero Knowledge Spellbook (zk_grimoire v3.0), '#### Technical Bridge' of Tale 24 (source lines from 5248); 4 lore lines dropped by rule.

---

**Tornado Smart Contract (Simplified):**

```solidity
contract TornadoCash {
    uint256 public denomination;  // Fixed: 1 ETH
    uint32 public levels = 20;    // Merkle tree depth
    
    // Merkle tree
    bytes32[] public filledSubtrees;
    bytes32 public currentRootIndex;
    mapping(bytes32 => bool) public roots;  // Historical roots
    
    // Deposits and withdrawals
    mapping(bytes32 => bool) public commitments;
    mapping(bytes32 => bool) public nullifierHashes;
    
    IVerifier public verifier;  // Groth16 verifier contract
    
    function deposit(bytes32 _commitment) external payable {
        require(msg.value == denomination);
        require(!commitments[_commitment]);
        
        uint32 insertedIndex = _insert(_commitment);
        commitments[_commitment] = true;
        
        emit Deposit(_commitment, insertedIndex, block.timestamp);
    }
    
    function withdraw(
        bytes calldata _proof,
        bytes32 _root,
        bytes32 _nullifierHash,
        address payable _recipient,
        address payable _relayer,
        uint256 _fee
    ) external {
        require(!nullifierHashes[_nullifierHash]);
        require(isKnownRoot(_root));
        require(verifier.verifyProof(
            _proof,
            [uint256(_root), uint256(_nullifierHash),
             uint256(_recipient), uint256(_relayer), _fee]
        ));
        
        nullifierHashes[_nullifierHash] = true;
        _recipient.transfer(denomination - _fee);
        if (_fee > 0) _relayer.transfer(_fee);
        
        emit Withdrawal(_recipient, _nullifierHash, _relayer, _fee);
    }
}
```

**Circuit Constraints:**

```
Tornado Circuit (Circom):
- Poseidon hash: ~150 constraints per hash
- Merkle proof (depth 20): 20 × 150 = 3,000 constraints
- Nullifier computation: ~150 constraints
- Commitment verification: ~150 constraints
Total: ~4,000 constraints

Proof time: ~1-2 seconds
Proof size: 128 bytes (Groth16 on BN254)
Gas cost: ~300,000 gas to verify
```

**Anonymity Set Analysis:**

```
Pool with N deposits:
- Each withdrawal is 1 of N
- Anonymity: N-1 others
- Probability of identification: 1/N

But timing analysis can reduce:
- Deposit → immediate withdraw: Obvious
- Deposit → wait for 100+ deposits → Good
- Use multiple pools → Better

Best practice: Wait for large anonymity set
```

**Real Statistics (Before Sanctions):**

- Total volume: ~$7-10 billion
- Number of deposits: ~500,000+
- Average per-pool size: 5,000-50,000 deposits
- Typical anonymity set: 1,000-10,000 (good)
- Relayer fee: 0.3-0.5%

**Applied to:** Privacy mixers, anonymity sets, decentralized privacy, compliance challenges
