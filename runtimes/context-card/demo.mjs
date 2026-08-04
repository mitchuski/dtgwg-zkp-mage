// X2 M4 worked example — the rt 07 trust-graph-formation context, rendered
// end-to-end as a context card. One community (a VTC), one governed vote-like
// purpose; the card is what an affected member would read before presenting.
// (The MyTerms term↔field mapping table stays in the X2 design doc.)
import { renderCard, checkLegibility } from './card.mjs';

// The §6.2 canonical descriptor for rt 07's community: members of one VTC
// voting on a proposal, tellers as the governed verifier set, monthly epoch.
const descriptor = {
  protocol: 'dtg-zkp/0.1',
  profile: 'epp/1',
  contextAuthority: 'authority:first-city-vtc',
  contextPolicy: 'policy:one-vote/1',
  purpose: 'purpose:community-vote',
  scope: 'scope:proposal-42',
  verifierSet: 'verifiers:vote-tellers',
  epoch: 'epoch:2026-07',
  epochPolicy: 'rollover:30d',
  nullifierVersion: 'dtg-zkp/nullifier/v0',
  retentionPolicy: 'retention:35d',
};

const card = renderCard(descriptor); // no provingMode option: local proving only

const QUESTION_TITLES = {
  q1: 'What activity is this proof for?',
  q2: 'Who can recognise repeat use?',
  q3: 'For how long is repeat use linkable?',
  q4: 'What happens when the epoch changes?',
  q5: 'Does fallback change who observes?',
  q6: 'How do I challenge a decision?',
};

console.log('CONTEXT CARD — trust-graph formation (rt 07), community vote');
console.log('='.repeat(64));
console.log(`version : ${card.version}`);
console.log(`digest  : ${card.digest}`);
console.log('  (the proof transcript binds this same digest — §15.2)');
console.log('');
for (const [q, title] of Object.entries(QUESTION_TITLES)) {
  console.log(`${q.toUpperCase()} — ${title}`);
  console.log(`  ${card.questions[q]}`);
  console.log('');
}
console.log('coverage (§6.8 legibility conformance):');
console.log(`  rendered  : ${card.coverage.rendered.join(', ')}`);
console.log(`  justified : ${Object.keys(card.coverage.justified).join(', ')}`);
console.log(`  unrendered: ${card.coverage.unrendered.length ? card.coverage.unrendered.join(', ') : '(none)'}`);

const check = checkLegibility(descriptor, card);
console.log(`\nlegibility check: ${check.ok ? 'PASS' : `FAIL ${check.failures.join(', ')}`}`);
