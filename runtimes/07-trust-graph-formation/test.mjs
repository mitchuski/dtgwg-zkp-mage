// Property tests for trust-graph formation (the dream-agent cycle).
// Run: node test.mjs   — exits nonzero on any failure.

import {
  joinCommunity,
  encounter,
  Mage,
  Swordsman,
  TrustGraph,
  dreamCycleTurn,
  roster,
  rdid,
} from './src/trust-graph.mjs';

let passed = 0;
let failed = 0;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
function check(name, cond) {
  if (cond) {
    passed++;
    console.log(`  ${green('PASS')} ${name}`);
  } else {
    failed++;
    console.log(`  ${red('FAIL')} ${name}`);
  }
}

console.log('\ntrust-graph formation — dream-agent cycle properties\n');

const VTC = 'vtc:alpha';
const n1 = joinCommunity('human-1', VTC);
const n2 = joinCommunity('human-2', VTC);
const n3 = joinCommunity('human-3', VTC);
const n4 = joinCommunity('human-4', VTC); // deliberately kept OUT of the roster
const members = roster([n1, n2, n3]); // n4 is not personhood-anchored in this community view

// G1 — bilateral consent: an edge forms only when BOTH parties consent.
{
  const g = new TrustGraph();
  const uni = dreamCycleTurn(members, g, n1, n2, 'meet-1', true, false);
  const both = dreamCycleTurn(members, g, n1, n2, 'meet-1', true, true);
  check('G1a unilateral consent is rejected (no edge)', uni.grew === false && uni.reason === 'unilateral-no-mutual-consent');
  check('G1b mutual consent forms the edge', both.grew === true && g.edges.length === 1);
}

// G2 — personhood anchor: both endpoints must be members (PHC / VMC-from-VTC).
{
  const g = new TrustGraph();
  const r = dreamCycleTurn(members, g, n1, n4, 'meet-2', true, true);
  check('G2 non-personhood-anchored endpoint is rejected', r.grew === false && r.reason === 'endpoint-not-personhood-anchored');
}

// G3 — no self-edge: a VRC with oneself is self-Sybil, not a relationship.
{
  const g = new TrustGraph();
  const r = dreamCycleTurn(members, g, n1, n1, 'meet-3', true, true);
  check('G3 self-edge is forbidden', r.grew === false && r.reason === 'self-edge-forbidden');
}

// G4 — R-DID uniqueness: one node's R-DID differs per counterparty (unlinkable).
{
  const toward2 = rdid(n1, n2.member);
  const toward3 = rdid(n1, n3.member);
  check('G4 R-DIDs are fresh per counterparty (no reuse)', toward2 !== toward3);
}

// G5 — the fold advances only on a signature: a proposal alone does not grow the graph.
{
  const g = new TrustGraph();
  const shared = encounter(n1, n2, 'meet-5');
  Mage.propose(n1, n2, shared, true, true); // proposed but never proved
  check('G5a a bare proposal does not touch the graph', g.edges.length === 0);
  const r = dreamCycleTurn(members, g, n1, n2, 'meet-5', true, true);
  check('G5b a signed proposal advances the graph by one', r.grew === true && g.edges.length === 1);
}

// G6 — one VRC per pair: a duplicate edge is rejected (idempotent).
{
  const g = new TrustGraph();
  dreamCycleTurn(members, g, n1, n2, 'meet-6', true, true);
  const dup = dreamCycleTurn(members, g, n1, n2, 'meet-6b', true, true);
  check('G6 duplicate edge is rejected', dup.grew === false && dup.reason === 'duplicate-edge' && g.edges.length === 1);
}

// G7 — the Gap: a forged VRC commitment is caught (prover recomputes, never trusts).
{
  const g = new TrustGraph();
  const shared = encounter(n1, n2, 'meet-7');
  const candidate = Mage.propose(n1, n2, shared, true, true);
  candidate.claimedVrc = 'forged-commitment-value';
  const verdict = Swordsman(members, g).prove(candidate);
  check('G7 forged VRC commitment is rejected across the Gap', verdict.signed === false && verdict.reason === 'vrc-commitment-forged');
}

// G8 — propagation: trust reaches transitively; an edgeless node stays unreachable.
{
  const g = new TrustGraph();
  dreamCycleTurn(members, g, n1, n2, 'e12', true, true);
  dreamCycleTurn(members, g, n2, n3, 'e23', true, true);
  check('G8a trust propagates n1 -> n3 via n2', g.connected(n1.member, n3.member) === true);
  const lone = joinCommunity('human-5', VTC);
  check('G8b an edgeless member is unreachable', g.connected(n1.member, lone.member) === false);
}

console.log(`\n  ${passed} passed, ${failed} failed\n`);
process.exit(failed === 0 ? 0 : 1);
