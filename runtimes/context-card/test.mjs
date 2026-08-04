// Property tests for the context human-legibility instrument (X2 M3).
// L1–L9 are the legibility conformance properties: derivation not audit,
// determinism, six answered questions, coverage, named rejections, narrow
// language, and expansion-made-visible.
import {
  DESCRIPTOR_FIELDS,
  descriptorDigest,
  transcriptDigest,
} from '../canonical/canonical.mjs';
import {
  renderCard,
  checkLegibility,
  diffCards,
  FIELD_QUESTION_MAP,
  NARROW_LANGUAGE,
  BROAD_LANGUAGE,
} from './card.mjs';

let pass = 0,
  fail = 0;
const t = (name, cond) => {
  if (cond) {
    pass++;
    console.log(`  ok  ${name}`);
  } else {
    fail++;
    console.log(`FAIL  ${name}`);
  }
};

// The worked context — rt 07 trust-graph formation's community-vote shape,
// same family as the canonical fixtures.
const D = {
  protocol: 'dtg-zkp/0.1',
  profile: 'epp/1',
  contextAuthority: 'authority:example-vtc',
  contextPolicy: 'policy:one-vote/1',
  purpose: 'purpose:community-vote',
  scope: 'scope:proposal-42',
  verifierSet: 'verifiers:vote-tellers',
  epoch: 'epoch:2026-07',
  epochPolicy: 'rollover:30d',
  nullifierVersion: 'dtg-zkp/nullifier/v0',
  retentionPolicy: 'retention:35d',
};

const card = renderCard(D);

// L1 — the card digest matches the descriptor digest (derivation, not audit)
t('L1 card digest = descriptor digest (derivation, not audit)', card.digest === descriptorDigest(D));

// L2 — rendering is deterministic (same descriptor, key order irrelevant, same card)
const shuffled = Object.fromEntries(Object.entries(D).reverse());
t(
  'L2 rendering deterministic + key-order independent',
  JSON.stringify(renderCard(D)) === JSON.stringify(renderCard(shuffled))
);

// L3 — all six §6.8 questions answered, non-empty, for a full descriptor
t(
  'L3 all six §6.8 questions non-empty',
  ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'].every(
    (q) => typeof card.questions[q] === 'string' && card.questions[q].length > 0
  )
);

// L4 — coverage: every DESCRIPTOR_FIELDS member is rendered or justified
t(
  'L4a coverage: every §6.2 field rendered or justified',
  DESCRIPTOR_FIELDS.every(
    (f) => card.coverage.rendered.includes(f) || f in card.coverage.justified
  ) && checkLegibility(D, card).ok
);
// ...and removing a field's contribution makes checkLegibility fail BY NAME.
// (a) strip a mapped field's value out of its question text → unrendered-field:epoch
const tamperedQ3 = {
  ...card,
  questions: { ...card.questions, q3: card.questions.q3.replaceAll(D.epoch, 'redacted') },
};
const r4a = checkLegibility(D, tamperedQ3);
t(
  'L4b stripped mapping fails by name (unrendered-field:epoch)',
  !r4a.ok && r4a.failures.includes('unrendered-field:epoch')
);
// (b) a justified-but-unmapped field with its justification removed also fails by name
const noJustCard = { ...card, coverage: { ...card.coverage, justified: {} } };
const r4b = checkLegibility(D, noJustCard, { protocol: '' , profile: '', contextPolicy: '' });
t(
  'L4c withdrawn justification fails by name (unrendered-field:protocol)',
  !r4b.ok && r4b.failures.includes('unrendered-field:protocol')
);

// L5 — a card whose digest mismatches its descriptor is rejected by name (§26.1)
const otherD = { ...D, epoch: 'epoch:2026-08' };
const wrongDigestCard = { ...card, digest: descriptorDigest(otherD) };
const r5 = checkLegibility(D, wrongDigestCard);
t('L5 digest-mismatch card rejected by name', !r5.ok && r5.failures.includes('digest-mismatch'));

// L6 — narrow language holds (§5.12): 'scoped reuse detection' present in the
// repeat-use answers; a regex sweep of ALL card text finds no broad claim.
const allText = Object.values(card.questions).join('\n');
t(
  'L6 narrow language: scoped reuse detection, no broad personhood claim',
  card.questions.q2.includes(NARROW_LANGUAGE) &&
    card.questions.q3.includes(NARROW_LANGUAGE) &&
    !BROAD_LANGUAGE.test(allText) &&
    !/unique human|one unique|one person per/i.test(allText)
);

// L7 — expansion made visible: widen the verifier set → new digest, and
// diffCards flags expansion=true with a q2 delta (§6.6 silent expansion made
// impossible; §6.7 material privacy change).
const widerD = { ...D, verifierSet: 'verifiers:vote-tellers-and-registrars' };
const widerCard = renderCard(widerD);
const d7 = diffCards(card, widerCard);
t(
  'L7 verifier-set widening: new digest + expansion with q2 delta',
  widerCard.digest !== card.digest &&
    d7.changed &&
    d7.expansion === true &&
    d7.deltas.some((x) => x.question === 'q2')
);

// L8 — an epoch-policy change surfaces as a q3/q4 delta, but expansion only if
// linkability WIDENED. Shrinking the rollover window is a delta, not expansion;
// growing it is both.
const narrowerD = { ...D, epochPolicy: 'rollover:7d' };
const d8a = diffCards(card, renderCard(narrowerD));
t(
  'L8a epoch-policy shrink: q3+q4 deltas, expansion=false',
  d8a.changed &&
    d8a.deltas.some((x) => x.question === 'q3') &&
    d8a.deltas.some((x) => x.question === 'q4') &&
    d8a.expansion === false
);
const widerEpochD = { ...D, epochPolicy: 'rollover:90d' };
const d8b = diffCards(card, renderCard(widerEpochD));
t(
  'L8b epoch-policy widening: q3 delta and expansion=true',
  d8b.deltas.some((x) => x.question === 'q3') && d8b.expansion === true
);

// L9 — cross-check with the §15.2 transcript: a transcript built over
// descriptor A does not digest-match a card over descriptor B. The card and
// the transcript bind the SAME digest or the pair fails — provenance is
// structural on both surfaces.
const T = {
  protocol: 'dtg-zkp/0.1',
  profile: 'epp/1',
  verifier: 'verifier:vote-teller-3',
  contextDescriptorDigest: descriptorDigest(D), // over descriptor A
  purpose: D.purpose,
  scope: D.scope,
  challenge: 'nonce:8f2a',
  sessionId: 'session:71c',
  requestedPredicates: ['PR-LIV', 'PR-ISS', 'PR-UNQ', 'PR-FRE'],
  policyRequirements: 'assurance>=L2',
  expiry: '2026-07-17T12:00:00Z/clock:ntp-60s',
  snapshotRequirements: 'root-age<=24h',
  encodingVersion: 'dtg-zkp/canonical/v0',
};
const cardB = renderCard(otherD); // card over descriptor B
t(
  'L9 transcript over A does not match a card over B (and does match A)',
  typeof transcriptDigest(T) === 'string' && // transcript itself is canonical + valid
    T.contextDescriptorDigest !== cardB.digest &&
    T.contextDescriptorDigest === card.digest
);

// sanity: the field→question map only names real §6.2 fields
t(
  'L10 field→question map covers only known §6.2 fields',
  Object.keys(FIELD_QUESTION_MAP).every((f) => DESCRIPTOR_FIELDS.includes(f))
);

console.log(`\ncontext-card: ${pass}/${pass + fail} pass`);
process.exit(fail ? 1 : 0);
