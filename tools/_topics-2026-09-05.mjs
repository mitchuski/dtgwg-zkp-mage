// one-shot: plain technical titles for the background subsections (replaces tale titles in the spec text)
import { readFileSync, writeFileSync } from 'node:fs';
const p = 'zkbook/transfer/spellbook-map.json';
const map = JSON.parse(readFileSync(p, 'utf8'));
map.topics = {
  1: 'Zero-knowledge proofs: completeness, soundness and zero knowledge',
  2: 'Setup and the common reference string',
  3: 'Non-interactivity: the Fiat–Shamir transformation',
  4: 'Finite fields, elliptic curves and pairing-friendly curves',
  5: 'Arithmetic circuits and rank-1 constraint systems',
  6: 'From constraints to polynomials: quadratic arithmetic programs',
  7: 'Witness and instance; knowledge soundness',
  8: 'PLONKish arithmetisation: custom gates, lookups and permutation arguments',
  9: 'Pairings, Groth16 and KZG commitments',
  10: 'Polynomial commitment schemes: binding, hiding and their trade-offs',
  11: 'FRI and hash-based low-degree testing',
  12: 'Folding schemes and incrementally verifiable computation',
  13: 'The sumcheck protocol and GKR',
  14: 'Inner-product arguments and transparent setups',
  15: 'Recursive proof composition and cycles of curves',
  16: 'Cyclic recursion and circuit identity',
  17: 'Universal setups and powers-of-tau ceremonies',
  18: 'Trusted-setup failure modes and toxic waste',
  21: 'Circom: signals, templates and R1CS compilation',
  23: 'Shielded transactions: commitments, nullifiers and Merkle trees (Zcash)',
  24: 'Mixers: anonymity sets, deposit–withdraw and set non-membership',
  26: 'Vulnerability classes and audit practice',
  30: 'Proof-carrying agents and verifiable delegation',
  32: 'Binary-field SNARKs for standard hash functions (Flock)',
};
map.source.specRegister = 'In the specification text the source is not named as a spellbook or by tale: subsections carry the plain titles in `topics`, the source work is cited once in References as the agentprivacy body of work, and the licence statement lives in the appendix. The tale machinery below is internal to this repository.';
writeFileSync(p, JSON.stringify(map, null, 2) + '\n');
const missing = [...new Set(map.sections.flatMap(s => s.tales))].filter(n => !map.topics[n]);
console.log('topics set for', Object.keys(map.topics).length, 'sources; missing:', missing.join(',') || 'none');
