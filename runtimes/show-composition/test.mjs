// Property tests for the show reference model (X3 M4).
import { transcriptDigest } from '../canonical/canonical.mjs';
import { REGISTRY, lookupBundle, matchBundle } from './bundles.mjs';
import {
  makeShow,
  verifyShow,
  completionEvidence,
  jointDisclosureRecord,
  memberCommitment,
} from './show.mjs';

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

const descriptor = (profile) => ({
  protocol: 'dtg-zkp/0.1',
  profile,
  contextAuthority: 'authority:example-vtc',
  contextPolicy: 'policy:one-vote/1',
  purpose: 'purpose:community-vote',
  scope: 'scope:proposal-42',
  verifierSet: 'verifiers:vote-tellers',
  epoch: 'epoch:2026-07',
  epochPolicy: 'rollover:30d',
  nullifierVersion: 'dtg-zkp/nullifier/v0',
  retentionPolicy: 'retention:35d',
});
const D_MLP = descriptor('mlp/1');
const D_EPP = descriptor('epp/1');

const EXPIRY = 1800000000; // explicit epoch-seconds boundary
const NOW = 1752750000; //   < EXPIRY: fresh
const base = {
  descriptor: D_MLP,
  verifier: 'verifier:vote-teller-3',
  challenge: 'nonce:8f2a',
  sessionId: 'session:71c',
  expiry: EXPIRY,
  registry: REGISTRY,
};

// S1 — a complete MLP-BASE show verifies (fresh, whole, in-registry)
const m1 = makeShow({ ...base, bundleId: 'MLP-BASE', bundleVersion: '1' });
const r1 = m1.ok && verifyShow(m1.show, REGISTRY, NOW);
t(
  'S1 complete MLP-BASE show verifies',
  r1 && r1.ok && Object.keys(r1.statement.establishedClaims).length === 4
);

// S2 — atomicity: removing one member proof -> partial-show-rejected
const partial = { ...m1.show, members: m1.show.members.filter((m) => m.predicate !== 'PR-ISS') };
const r2 = verifyShow(partial, REGISTRY, NOW);
t('S2 partial show rejected (atomicity)', !r2.ok && r2.reason === 'partial-show-rejected');

// S3 — transplant: member from a show over transcript A inserted into a show
// over transcript B -> member-transcript-mismatch (§15.1 / §26.1 replay)
const mA = makeShow({ ...base, bundleId: 'MLP-BASE', bundleVersion: '1', sessionId: 'session:AAA' });
const grafted = {
  ...m1.show,
  members: m1.show.members.map((m) =>
    m.predicate === 'PR-FRE' ? mA.show.members.find((x) => x.predicate === 'PR-FRE') : m
  ),
};
t(
  'S3 transplanted member rejected (replay across transcripts)',
  verifyShow(grafted, REGISTRY, NOW).reason === 'member-transcript-mismatch'
);

// S4 — à-la-carte predicate list matching no bundle -> bundle-outside-registry
// (both at the registry match level and for a forged show under a real bundleId)
const alacarte = matchBundle(REGISTRY, ['PR-LIV', 'PR-FRE']);
const forgedTranscript = { ...m1.show.transcript, requestedPredicates: ['PR-LIV', 'PR-FRE'] };
const forgedDigest = transcriptDigest(forgedTranscript);
const forged = {
  bundleId: 'MLP-BASE',
  bundleVersion: '1',
  transcript: forgedTranscript,
  transcriptDigest: forgedDigest,
  members: ['PR-LIV', 'PR-FRE'].map((p) => ({
    predicate: p,
    transcriptDigest: forgedDigest,
    commitment: memberCommitment(p, forgedDigest),
  })),
};
t(
  'S4 a-la-carte predicate list rejected',
  !alacarte.ok &&
    alacarte.reason === 'bundle-outside-registry' &&
    verifyShow(forged, REGISTRY, NOW).reason === 'bundle-outside-registry'
);

// S5 — EPP-UNIQ verifies; joint record forHowLong reflects PR-UNQ's epoch
// (dominates session); MLP-BASE record stays session-lived
const m5 = makeShow({ ...base, descriptor: D_EPP, bundleId: 'EPP-UNIQ', bundleVersion: '1' });
const rec5 = jointDisclosureRecord(lookupBundle(REGISTRY, 'EPP-UNIQ', '1').bundle);
const recMlp = jointDisclosureRecord(lookupBundle(REGISTRY, 'MLP-BASE', '1').bundle);
t(
  'S5 EPP-UNIQ verifies + joint record: PR-UNQ epoch dominates session',
  m5.ok &&
    verifyShow(m5.show, REGISTRY, NOW).ok &&
    rec5.forHowLong.horizon === 'epoch' &&
    rec5.forHowLong.dominatedBy === 'PR-UNQ' &&
    recMlp.forHowLong.horizon === 'session' &&
    rec5.alongsideWhat.length === 6 &&
    rec5.againstWhom.includes('network-observer')
);

// S6 — the credential/artifact wall: a taskContext credential rides along,
// the show still verifies, but it NEVER yields completion evidence
const m6 = makeShow({
  ...base,
  bundleId: 'MLP-BASE',
  bundleVersion: '1',
  taskContextCredential: {
    kind: 'vwc-demo',
    taskContext: { threadId: 'thread:9', ceremony: 'ceremony:witness-2026-07' },
  },
});
const r6 = verifyShow(m6.show, REGISTRY, NOW);
const q6 = completionEvidence(m6.show);
t(
  'S6 taskContext attached: show verifies, completion query refused',
  r6.ok &&
    r6.statement.establishedClaims.taskCompletion === undefined &&
    !Object.hasOwn(r6.statement.establishedClaims, 'taskCompletion') &&
    !q6.ok &&
    q6.reason === 'taskcontext-not-outcome-evidence'
);

// S7 — bundle predicate-set is transcript-digest-relevant: two bundles under
// identical request inputs -> two transcripts (canonical C9 at show level)
const m7 = makeShow({ ...base, bundleId: 'MLP-BASE+DEL', bundleVersion: '1' });
t(
  'S7 two bundles -> two transcript digests',
  m7.ok && m7.show.transcriptDigest !== m1.show.transcriptDigest
);

// S8 — freshness: same content under two challenges -> different transcripts,
// and members do not cross-verify
const m8 = makeShow({ ...base, bundleId: 'MLP-BASE', bundleVersion: '1', challenge: 'nonce:0b1e' });
const crossed = { ...m8.show, members: m1.show.members };
t(
  'S8 challenge change -> new transcript, members do not cross-verify',
  m8.show.transcriptDigest !== m1.show.transcriptDigest &&
    verifyShow(crossed, REGISTRY, NOW).reason === 'member-transcript-mismatch'
);

// S9 — version discipline: right id, wrong version -> bundle-outside-registry
// (at make time, and for a show whose claimed version is tampered)
const m9 = makeShow({ ...base, bundleId: 'MLP-BASE', bundleVersion: '9' });
t(
  'S9 wrong bundle version rejected',
  !m9.ok &&
    m9.reason === 'bundle-outside-registry' &&
    verifyShow({ ...m1.show, bundleVersion: '9' }, REGISTRY, NOW).reason ===
      'bundle-outside-registry'
);

// S10 — expiry is checked against the EXPLICIT now (no Date.now() anywhere):
// same show, later clock -> stale-transcript; missing now -> refused
let threw = false;
try {
  verifyShow(m1.show, REGISTRY, undefined);
} catch {
  threw = true;
}
t(
  'S10 stale transcript rejected under explicit now',
  verifyShow(m1.show, REGISTRY, EXPIRY + 1).reason === 'stale-transcript' && threw
);

console.log(`\nshow-composition: ${pass}/${pass + fail} pass`);
process.exit(fail ? 1 : 0);
