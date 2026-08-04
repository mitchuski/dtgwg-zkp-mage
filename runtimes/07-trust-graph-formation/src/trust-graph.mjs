// Trust-graph formation — reference construction for HOW the DTG trust graph
// forms, run as a *dream-agent cycle*: the Mage proposes the smallest edge, the
// Swordsman proves it before signing, and the two are held apart across the Gap.
//
// This is a reference model (like runtime 01), not the circuit. It demonstrates
// the RELATIONS a ZK trust-graph would prove; it does not run them in zero
// knowledge. Hash = SHA-256 via runtime 01's H so this stays zero-dep and offline.
//
// Coherence (see ../CRED-SPEC-COHERENCE.md and ./NOTES.md):
//   node    = a personhood-anchored member of a community (VTC) — an M-DID
//             pseudonym, one per human per community, via runtime 01's nullifier
//             (the PHC "exactly-one-membership-per-person" rule made mechanical).
//   edge    = a VRC (Verifiable Relationship Credential): a bilateral commitment
//             minted from a shared "matching compression", each side carrying a
//             fresh, unique R-DID (cred-spec R-DID uniqueness) and its consent.
//   growth  = collision -> edge -> propagation. The graph grows one collision at
//             a time, and ONLY on mutual consent (SPELLWEB spec 6B).
//   cycle   = Mage (bnot, proposer) . Swordsman (neg, prover) across the Gap.
//             neg(bnot(x)) = succ(x): the graph advances one edge only when a
//             reduction (the Mage's minimal proposal) is signed by a proof (the
//             Swordsman) held apart from it.

import { enrol, nullifier, H } from '../../01-uniqueness-nullifier/src/nullifier.mjs';

const DOMAIN_RDID = 'dtg-zkp/r-did/v0';
const DOMAIN_VRC = 'dtg-zkp/vrc-commitment/v0';
const DOMAIN_ENCOUNTER = 'dtg-zkp/encounter/v0';

// A node = a personhood-anchored member of a community. Its in-community identity
// is a nullifier of the identity secret against the community context: one node
// per human per community (the M-DID / PHC pseudonym), unlinkable across
// communities to anyone who does not hold the secret.
export function joinCommunity(humanId, community) {
  const id = enrol(humanId); // personhood anchor (runtime 01)
  const member = nullifier(id.secret, community); // M-DID pseudonym
  return { humanId, community, secret: id.secret, commitment: id.commitment, member };
}

// Each party mints a FRESH, unique R-DID per counterparty (cred-spec: "each
// entity MUST generate a new, unique R-DID for every counterparty"). Deterministic
// to the holder, unlinkable across relationships to everyone else.
function rdid(node, counterpartyMember) {
  return H(DOMAIN_RDID, node.secret, counterpartyMember);
}

// An ENCOUNTER yields the shared "matching compression" — a value both parties
// can derive from the meeting and nobody else can (models the proverb/spell
// match). Symmetric in the two members so both compute the same value.
export function encounter(nodeA, nodeB, salt) {
  const [x, y] = [nodeA.member, nodeB.member].sort();
  return H(DOMAIN_ENCOUNTER, x, y, salt);
}

// Mage (proposer, bnot): propose the smallest edge — a candidate VRC between two
// members who share a matching compression, carrying each side's R-DID + consent.
// The Mage asserts a commitment; the Swordsman never trusts it (see the Gap).
export const Mage = {
  propose(nodeA, nodeB, shared, consentA, consentB) {
    return {
      a: nodeA.member,
      b: nodeB.member,
      rdidA: rdid(nodeA, nodeB.member),
      rdidB: rdid(nodeB, nodeA.member),
      shared,
      consentA,
      consentB,
      claimedVrc: H(DOMAIN_VRC, ...[nodeA.member, nodeB.member].sort(), shared),
    };
  },
};

// Swordsman (prover, neg): prove the edge before signing. Reject every mirage;
// sign only a validated edge. `members` maps member-id -> node.
export function Swordsman(members, graph) {
  return {
    prove(c) {
      const reject = (reason) => ({ signed: false, reason });
      const A = members.get(c.a);
      const B = members.get(c.b);

      // 1. both endpoints personhood-anchored members (PHC / VMC-from-VTC)
      if (!A || !B) return reject('endpoint-not-personhood-anchored');
      // 2. no self-edge: a VRC with oneself is self-Sybil, not a relationship
      if (c.a === c.b) return reject('self-edge-forbidden');
      // 3. bilateral consent: the shared graph grows ONLY on mutual consent
      if (!c.consentA || !c.consentB) return reject('unilateral-no-mutual-consent');
      // 4. the R-DIDs must be the fresh per-counterparty ones (uniqueness holds)
      if (c.rdidA !== rdid(A, B.member) || c.rdidB !== rdid(B, A.member)) {
        return reject('r-did-mismatch');
      }
      // 5. the Gap: recompute the VRC commitment independently from the
      //    candidate's own public parts — do not trust the Mage's claimedVrc
      //    (Fiat-Shamir reseed; non-collusion between proposer and prover).
      const vrc = H(DOMAIN_VRC, ...[c.a, c.b].sort(), c.shared);
      if (vrc !== c.claimedVrc) return reject('vrc-commitment-forged');
      // 6. one VRC per pair (idempotent edge)
      if (graph.hasEdge(c.a, c.b)) return reject('duplicate-edge');

      return { signed: true, edge: { a: c.a, b: c.b, vrc } };
    },
  };
}

// The trust graph: an accumulating set of signed VRC edges.
export class TrustGraph {
  constructor() {
    this.adj = new Map();
    this.edges = [];
  }
  _key(a, b) {
    return [a, b].sort().join('|');
  }
  hasEdge(a, b) {
    return this.adj.has(this._key(a, b));
  }
  addEdge(edge) {
    const k = this._key(edge.a, edge.b);
    if (this.adj.has(k)) return false;
    this.adj.set(k, edge);
    this.edges.push(edge);
    return true;
  }
  neighbours(m) {
    const out = [];
    for (const e of this.edges) {
      if (e.a === m) out.push(e.b);
      else if (e.b === m) out.push(e.a);
    }
    return out;
  }
  // Community-anchored propagation: is there a trust path a -> b?
  connected(a, b) {
    if (a === b) return true;
    const seen = new Set([a]);
    const q = [a];
    while (q.length) {
      const x = q.shift();
      for (const n of this.neighbours(x)) {
        if (n === b) return true;
        if (!seen.has(n)) {
          seen.add(n);
          q.push(n);
        }
      }
    }
    return false;
  }
}

// One turn of the dream-agent cycle: Mage proposes, Swordsman proves across the
// Gap, and the graph advances by exactly one edge ONLY if the proof signs
// (neg(bnot(x)) = succ(x)). Returns { grew, ... }.
export function dreamCycleTurn(members, graph, nodeA, nodeB, salt, consentA, consentB) {
  const shared = encounter(nodeA, nodeB, salt);
  const candidate = Mage.propose(nodeA, nodeB, shared, consentA, consentB);
  const verdict = Swordsman(members, graph).prove(candidate);
  if (verdict.signed) {
    graph.addEdge(verdict.edge);
    return { grew: true, ...verdict };
  }
  return { grew: false, ...verdict };
}

// Helper: build the members lookup from a list of nodes.
export function roster(nodes) {
  const m = new Map();
  for (const n of nodes) m.set(n.member, n);
  return m;
}

export { rdid };
