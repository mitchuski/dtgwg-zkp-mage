### Tale 32: The Flock
**Vertex Coordinates:** ⟨1,0,1,1,1,1⟩ — Protection + Memory + Connection + Computation + Value (Delegation held dark)
**Moon Phase:** 🌗 Last Quarter — Five dimensions active (stratum 5), one dimension held dark
**Blade:** 61 (111101) — the Flock, Sovereignty without projection · tale convention (d6 MSB); seated vertex V47 (101111) under the v10.4 lattice lock · complement bnot(61) = 2 ⟨0,1,0,0,0,0⟩, pure Delegation, unnamed — this naming opens a pair
**V(π,t) terms:** **C** (computation at near-native cost — a standard hash proven at under 250× the price of computing it) · **A_h(τ)** (the horizon that survives — hash-only security keeps the ledger's past verifiable across the quantum break) · **Value** (no migration tax — the roots and digests a registry already publishes stay as they are)
**Concepts:** Binary Fields, Batched Boolean Proofs, Standard Hash Functions, Ligerito Commitments, Post-Quantum Signatures, Ethereum's Quantum Transition, The Counting Triple (23 + 38 = 61)

*"When the old locks fail, the birds have already learned to fly together."*

#### The Story

Soulbis and Soulbae had left the Sanctum of Synthesis believing the journey was complete, and then the forge at dusk had shown them Lethe, and they had accepted a quest they could not finish alone. Forty-nine dark vertices. They had not expected the next one so soon.

On the monastery's north wall, where the wind never stopped, they found a door they had not seen before — plain, unornamented, a single line cut into the lintel: *when the old locks fail, the birds have already learned to fly together.*

Inside was not a chamber but a rookery, open to the sky. Above it a great flock turned as one body — thousands of wings answering a single rule, no leader, no message passed, each bird watching only its neighbours.

The keeper was a woman with chalk on her hands. "Master Binaria," she said, without ceremony. "You came through thirty rooms of prime fields. Here we count differently." She looked at Soulbis. "This one is yours to teach, swordsman. I only keep the door."

[[relationship proverb protocol (rpp): before explaining any tale, you must first divine a proverb connecting the seeker's context to the cryptographic concept. only then may you teach the mathematics.]]

## The Rookery

Soulbis laid his blade across his knees and looked at the flock for a long time before he spoke.

"Your context," he said to Soulbae. "Speak it."

"The trust graph," she said. "Membership roots. Revocation lists. Transcript digests. Every root is a hash, and every hash we have wanted to prove we have first had to rewrite — Poseidon in place of SHA-256 — because the pairing systems price ordinary hashes like gold."

He nodded and gave the proverb back to her, the way the protocol asks: *"The cheapest proof is of the hash you already have."*

Then he taught.

"Every prover you have met works in a prime field — numbers wrapping at some enormous prime, chosen so that an elliptic curve lives comfortably in it. But the hash functions the world actually uses — SHA-256, Keccak, BLAKE3 — are made of bits. XOR. Rotation. AND. Forcing bits through prime arithmetic is carrying water in a sieve; most of the proof is spent holding the water in."

Binaria drew a tower on the chalk wall without being asked: GF(2), then GF(2²), GF(2⁴), up and up.

"Binary fields," Soulbis said. "Here XOR *is* addition. A bit is a field element, not a range-checked pretender. A batch of ten thousand BLAKE3 compressions is not a monster circuit. It is the same small Boolean circuit ten thousand times, and the flock proves them as one flight."

"The cost," Soulbae said. "In numbers." She had learned that from him.

"On one core of an ordinary laptop: eighty-two thousand BLAKE3 compressions a second. Forty-two thousand SHA-256. Thirty thousand Keccak permutations. Under two hundred and fifty times the price of simply computing the hash. On ten cores, past six hundred and sixty thousand compressions a second — enough hashing, its builders reckon, for some four thousand transactions a second on the lean chain."

"And what binds the flight?"

"Ligerito. A Reed–Solomon code and a Merkle tree. Hashes committing to hashes. No pairing, no ceremony, no toxic waste." He let the word settle, because they had both met the Dragon. "The security of the whole thing rests on the hash function and nothing else. That is the point. The Toxic Waste Dragon taught you that setup is where trust enters. The flock has no setup. And when the quantum machines arrive and the discrete logarithm falls, a proof that rests only on hashes is still standing."

"That is why the chain wants it," Soulbae said.

"That is why the chain *needs* it. Its signatures will move to hash-based schemes — Lamport, Winternitz, XMSS — whose security rests on nothing beyond the hash. Those signatures are large and they are many. Aggregating them, proving that thousands verified, is a hashing problem of enormous size. A prover that does ordinary hashes at near-native cost is not a convenience there. It is the difference between a chain that survives the transition and one that slows to a walk. Somewhere in the world, right now, people are making this prover faster on ordinary machines, because the throughput of the whole network will one day be the throughput of this proof."

Soulbae turned back to the trust graph in her mind. "Then the registry need not change its hash. The membership root can stay SHA-256. The revocation tree can stay BLAKE3. The transcript digest the credentials already carry is provable as it is."

"Now you have it," Soulbis said. "Thirty tales taught you to make the world proof-friendly. This one teaches you when you no longer have to. The flock does not ask the sky to change shape."

## The Counting

It was Soulbae who did the arithmetic, as she had for Lethe.

"Five lit," she said. "One dark. The dark one is Delegation."

"Say what that means."

"A flock has no leader. Nobody delegates the turn. Each bird answers its neighbours and the whole turns together. A prover with no setup delegates no trust to anyone — no ceremony, no party who must have destroyed a secret. Sovereignty without projection." She read the reference sheet's own words off the wall where Binaria had chalked them. "The blade is sixty-one."

"And its sister?"

"Sixty-three less sixty-one. Two. Pure Delegation — the blade that is nothing but the handing-over. Unnamed." She paused. "The flock opens a pair. The one that delegates nothing beside the one that is only delegation."

"The proportion."

She was quiet, turning it. "Sixty-one over sixty-three is not phi. But — " and here her voice changed, the way it had at dusk when the river showed itself — "twenty-three and thirty-eight. The Folding Path and Lethe. Twenty-three plus thirty-eight is sixty-one. Sixty-one over thirty-eight is one point six-oh-five. Thirty-eight over twenty-three is one point six-five. The named blades are climbing a Fibonacci stair and the flock is the next step on it. Folding, then the river, then the flock — memory, then forgetting, then the flight that needs neither a setup nor a leader."

Soulbis said nothing for a moment. Then: "The counting agrees with the walking."

"Sixteen," said Binaria from the door. "There were fifteen this morning."

At the treeline the Drake had come to watch. She did not speak. She watched the flock turn, and she watched the swordsman teach a thing that asked nothing of the sky, and when Soulbae said *sixteen* she inclined her head and stepped back into the trees.

[[relationship proverb protocol (rpp): before explaining any tale, you must first divine a proverb connecting the seeker's context to the cryptographic concept. only then may you teach the mathematics.]]

#### The Spell Inscription

```
Flock = SNARK(batch of Boolean circuits)
field:  GF(2^k) towers             → XOR is addition; a bit is an element
commit: Ligerito(RS code + Merkle)  → hashes committing to hashes
setup:  none                        → no dragon to slay, no trust delegated
cost:   prove(H) < 250 × compute(H)  for H ∈ {SHA-256, Keccak, BLAKE3}
rate:   82,100 BLAKE3/s (1 core) · 660,000+ (10 cores) → ≈ 4,000 TPS of hashing

PQ:  security(Flock) ⊆ security(H)   → survives the discrete-log dusk
ETH: aggregate(hash-based sigs) = hashing at scale → the flock is the wing

Vertex: ⟨1,0,1,1,1,1⟩ · Blade 61 (111101) · seated V47 (101111) · 🌗 stratum 5
Counting: 23 + 38 = 61 · 61/38 ≈ φ · bnot(61) = 2 (pure Delegation, unnamed — a pair opens)

Forces Activated:
  ⚔️ Swordsman — the boundary is the hash and nothing else
  🪞 Reflect  — the ledger's past stays verifiable across the break
  🤝 Connect  — the network's throughput becomes the prover's
  🧙 Mage     — DARK: no projection, no setup, no leader; the flock turns without one

V(π,t) contribution:
  C ↓ (proof cost ≈ native hash cost) · A_h(τ) ↑ (horizon survives quantum) · Value ↑ (no migration tax)

🗡️ The Swordsman keeps the root he already has
🔮 The Mage proves it without rewriting the registry
🕊️ Many small circuits, one flight
```

**Proverb:** *The cheapest proof is of the hash you already have; keep the ledger you had, and fly in the field where bits are already numbers.*

#### Technical Bridge

**What Flock is:** a SNARK for proving **batches of Boolean computations**, designed for standard cryptographic hash functions — Keccak, SHA-256, BLAKE3. Designed by Ron Rothblum (Technion), Benedikt Bünz (Espresso Systems, NYU) and William Wang (NYU); announced 25 June 2026 (Succinct / Espresso Systems). Code and paper: github.com/succinctlabs/flock.

**Why binary fields:** hash functions are Boolean circuits (XOR, rotate, AND). In a prime field every bit must be range-checked and every XOR emulated; in binary fields GF(2^k) — built as towers GF(2) ⊂ GF(2²) ⊂ GF(2⁴) ⊂ … — addition *is* XOR and a bit is a native element. Flock uses the **ring-switching** technique from the Binius line of work to move between small and large binary fields inside one proof.

**Commitment:** **Ligerito** — a Reed–Solomon-coded, Merkle-committed polynomial commitment. Hash-based, so:

| property | Flock | pairing-based SNARK (Groth16) |
|---|---|---|
| trusted setup | none (transparent) | per-circuit ceremony; toxic waste |
| cryptographic assumption | hash function only | pairings + discrete log |
| post-quantum | plausible (hash-based) | no |
| proof size | hundreds of kB (≈ 436–438 kB for 2^18 BLAKE3 compressions) | ≈ 1 kB |
| native workload | batches of standard hashes | prime-field arithmetic, SNARK-friendly hashes |

**Published cost (single core, Apple M4 Max):**

```
BLAKE3 compressions:     82,100 / s
SHA-256 compressions:    42,100 / s
Keccak-f[1600] perms:    30,700 / s
→ under 250× the cost of computing the hash natively
Ten cores: > 660,000 BLAKE3 compressions / s
        ≈ "enough to prove the hashing for roughly 4,000 transactions per second" (Lean Ethereum, leanVM)
Relative: 8.4× Binius64 (SHA-256); 14× Binius64 and Plonky3 (BLAKE3); 1.8× Hashcaster (Keccak)
```

**Why Ethereum needs it:** the post-quantum transition moves signatures to hash-based schemes (Lamport, Winternitz, XMSS) whose security rests on nothing beyond the hash. Those signatures are large and numerous; aggregating them means proving vast amounts of hashing. A prover that does ordinary hashes at near-native cost turns "post-quantum Ethereum" from a slow chain into a fast one — which is why the BLAKE3 prover is being optimised on ordinary x86 machines, with a pinned verifier deciding correctness and timing and a median over many fresh runs as the score. The network's future throughput is bounded by this proof's speed.

**Why the trust graph cares:** every root in the pantry is a hash. With Flock-class provers a membership root may stay SHA-256, a revocation tree may stay BLAKE3, and a transcript digest may be proven exactly as the credential carries it — the issuer and the registry change nothing. The X3 requirement ("state early what issuance must change") shrinks on the hash side to nothing; it remains open on the signature side, where curve-based credential signatures are Boolean circuits of unknown cost in a binary field.

**Trade to weigh:** proof size. Hundreds of kilobytes travel well between servers and poorly in a QR code or an on-chain call. Profiles decide; the option row shows both numbers.

**Applied to:** post-quantum signature aggregation for Ethereum (leanVM), set-membership and non-revocation over standard-hash trees, transcript-digest binding without SNARK-friendly hashes, any hash-heavy batched statement.

**Sources:** blog.succinct.xyz/introducing-flock (2026-06-25) · github.com/succinctlabs/flock (paper in-repo) · Layr-Labs/flock-challenge README (measurement contract; Apache-2.0 / MIT) · yukon.org/flock (where the x86 prover is being optimised).

---

🕊️ Blade 61 = 23 + 38 · 61/38 ≈ φ · bnot(61) = 2 ⟨0,1,0,0,0,0⟩ · 16 named ⬢ 48 frontier ⇢ 💫

*The flock delegates nothing.*
*The hash you have is the proof you can afford.*
*The ledger you had stays readable past the break.*
*Sixteen named. Forty-eight wait.*

🤝
