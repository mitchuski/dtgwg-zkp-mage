// Property tests for the canonical encodings (§6.2 descriptor, §15.2 transcript).
import {
  canonicalize,
  validateDescriptor,
  descriptorDigest,
  validateTranscript,
  transcriptDigest,
} from './canonical.mjs';

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

// C1 determinism: same object, same digest
t('C1 descriptor digest deterministic', descriptorDigest(D) === descriptorDigest({ ...D }));

// C2 key-order independence
const shuffled = Object.fromEntries(Object.entries(D).reverse());
t('C2 key order does not change digest', descriptorDigest(D) === descriptorDigest(shuffled));

// C3 any field change changes the digest
t(
  'C3 field change changes digest',
  descriptorDigest(D) !== descriptorDigest({ ...D, epoch: 'epoch:2026-08' })
);

// C4 missing required field rejected by name
const v = validateDescriptor({ ...D, purpose: undefined });
t('C4 missing purpose rejected by name', !v.ok && v.missing.includes('purpose'));

// C5 unknown field rejected (no covert extension channel — §18.3 instinct)
const v2 = validateDescriptor({ ...D, vendorTag: 'x' });
t('C5 unknown field rejected', !v2.ok && v2.unknown.includes('vendorTag'));

// C6 optional registryDomain accepted and digest-relevant
const withReg = { ...D, registryDomain: 'registry:example' };
t(
  'C6 optional field accepted + digest-relevant',
  validateDescriptor(withReg).ok && descriptorDigest(withReg) !== descriptorDigest(D)
);

const T = {
  protocol: 'dtg-zkp/0.1',
  profile: 'epp/1',
  verifier: 'verifier:vote-teller-3',
  contextDescriptorDigest: descriptorDigest(D),
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

// C7 transcript determinism + order independence
t(
  'C7 transcript digest deterministic + order-independent',
  transcriptDigest(T) === transcriptDigest(Object.fromEntries(Object.entries(T).reverse()))
);

// C8 a bare nonce is insufficient — nonce-only "transcript" is invalid (§15.2)
const bare = validateTranscript({ challenge: 'nonce:8f2a' });
t('C8 bare nonce rejected', !bare.ok && bare.missing.length >= 10);

// C9 predicate-set change changes digest (the show is the unit — X3)
t(
  'C9 predicate set is digest-relevant',
  transcriptDigest(T) !==
    transcriptDigest({ ...T, requestedPredicates: ['PR-LIV', 'PR-ISS', 'PR-FRE'] })
);

// C10 descriptor and transcript domains are separated
t(
  'C10 domain separation descriptor vs transcript',
  descriptorDigest(D) !== transcriptDigest(T) && canonicalize(D) !== canonicalize(T)
);

// C11 non-finite numbers refuse to canonicalize
let threw = false;
try {
  canonicalize({ a: Infinity });
} catch {
  threw = true;
}
t('C11 non-finite number rejected', threw);

console.log(`\ncanonical: ${pass}/${pass + fail} pass`);
process.exit(fail ? 1 : 0);
