// Property tests for the mediated-proving reference model (X7 M2/M3).
import { enrol } from '../01-uniqueness-nullifier/src/nullifier.mjs';
import { descriptorDigest, transcriptDigest } from '../canonical/canonical.mjs';
import {
  makeProvingJob,
  makeMediator,
  mediatorFacingId,
  deriveBlindedInputs,
  checkForget,
  verifyProofRecord,
  AUDIT_FIELDS,
} from './mediator.mjs';
import {
  attemptProof,
  validateTransition,
  __unsafeSilentTransition,
  EXITS,
} from './downgrade.mjs';

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

// --- fixtures (explicit epochs, no Date.now) ---------------------------------
const EPOCH = 1_760_000_000; // arbitrary fixed second count

const descriptorA = {
  protocol: 'dtg-zkp/0.1',
  profile: 'mlp/1',
  contextAuthority: 'authority:example',
  contextPolicy: 'ctx-policy/1',
  purpose: 'age-over-threshold',
  scope: 'checkout',
  verifierSet: 'verifier-set:retail',
  epoch: '2026-Q3',
  epochPolicy: 'quarterly-rollover',
  nullifierVersion: 'null/v0',
  retentionPolicy: 'retention/none/v0',
};
const descriptorB = { ...descriptorA, contextPolicy: 'ctx-policy/2', purpose: 'account-recovery', scope: 'support' };
const dDigestA = descriptorDigest(descriptorA);
const dDigestB = descriptorDigest(descriptorB);

const makeTranscript = (dDigest, over = {}) => ({
  protocol: 'dtg-zkp/0.1',
  profile: 'mlp/1',
  verifier: 'verifier:acme',
  contextDescriptorDigest: dDigest,
  purpose: 'age-over-threshold',
  scope: 'checkout',
  challenge: 'chal-0001',
  sessionId: 'sess-0001',
  requestedPredicates: ['PR-HLD', 'PR-FRE'],
  policyRequirements: 'assurance/mlp-baseline',
  expiry: 'epoch+600s',
  snapshotRequirements: 'registry@2026-Q3',
  encodingVersion: 'canon/v0',
  provingMode: 'mediated/T0',
});

const holderA = enrol('human-alpha');
const holderB = enrol('human-beta');

const transcript1 = makeTranscript(dDigestA);
const transcript2 = makeTranscript(dDigestA, {}); // second, distinct transcript
transcript2.challenge = 'chal-0002';
transcript2.sessionId = 'sess-0002';
const tDigest1 = transcriptDigest(transcript1);
const tDigest2 = transcriptDigest(transcript2);

const jobA = makeProvingJob({
  holderSecret: holderA.secret,
  descriptor: descriptorA,
  transcript: transcript1,
  level: 'T0',
});

// M1 — T0 job construction: blinded inputs derivable only WITH the holder
// secret; the serialized job contains no witness/secret material.
const rederived = deriveBlindedInputs(holderA.secret, tDigest1);
const wrongSecret = deriveBlindedInputs(holderB.secret, tDigest1);
const serialized = JSON.stringify(jobA);
t(
  'M1 T0 job: blinded inputs need the secret; job carries no secret material',
  rederived.witnessCommitment === jobA.blindedInputs.witnessCommitment &&
    rederived.bindingCommitment === jobA.blindedInputs.bindingCommitment &&
    wrongSecret.witnessCommitment !== jobA.blindedInputs.witnessCommitment &&
    !serialized.includes(holderA.secret) &&
    !serialized.includes(holderA.blinding) &&
    jobA.statement.contextDescriptorDigest === dDigestA &&
    jobA.commitments === undefined // T0 carries no commitments
);

// M2 — the honeypot cannot be constructed: level 'T2' throws, and so does a
// job smuggling witnesses/biometrics/credentials in the payload.
let t2Threw = '';
try {
  makeProvingJob({ holderSecret: holderA.secret, descriptor: descriptorA, transcript: transcript1, level: 'T2' });
} catch (e) {
  t2Threw = e.message;
}
let smuggleThrew = '';
try {
  makeProvingJob({
    holderSecret: holderA.secret,
    descriptor: descriptorA,
    transcript: transcript1,
    level: 'T0',
    witnesses: { raw: 'the-witness' },
  });
} catch (e) {
  smuggleThrew = e.message;
}
t(
  "M2 'T2' construction throws honeypot-prohibited (also for smuggled witnesses)",
  t2Threw === 'honeypot-prohibited' && smuggleThrew === 'honeypot-prohibited'
);

// M3 — P-ISOLATE: B's execution output is identical whether or not A's job ran
// first. Fresh mediator with only B vs mediator that ran A then B.
const jobB = makeProvingJob({
  holderSecret: holderB.secret,
  descriptor: descriptorA,
  transcript: transcript2,
  level: 'T0',
});
const medOnlyB = makeMediator();
const recordBAlone = medOnlyB.executeJob(jobB, { epoch: EPOCH });
const medBoth = makeMediator();
medBoth.executeJob(jobA, { epoch: EPOCH });
const recordBAfterA = medBoth.executeJob(jobB, { epoch: EPOCH });
t(
  'M3 P-ISOLATE: B output independent of whether A ran first',
  JSON.stringify(recordBAlone) === JSON.stringify(recordBAfterA)
);

// M4 — P-FORGET: post-job snapshot equals pre-job modulo the frozen audit
// fields; a variant retaining transcript digests fails BY NAME.
const medForget = makeMediator();
const pre = medForget.stateSnapshot();
medForget.executeJob(jobA, { epoch: EPOCH });
const post = medForget.stateSnapshot();
const forgetOk = checkForget(pre, post);
const auditMoved =
  post.audit.jobCount === pre.audit.jobCount + 1 && AUDIT_FIELDS.includes('epochBucket');
const medRetentive = makeMediator({ retain: ['transcriptDigest'] });
const preR = medRetentive.stateSnapshot();
medRetentive.executeJob(jobA, { epoch: EPOCH });
const postR = medRetentive.stateSnapshot();
const forgetFail = checkForget(preR, postR);
t(
  'M4 P-FORGET: clean modulo audit fields; retentive variant fails retention-violation:transcriptDigest',
  forgetOk.ok &&
    auditMoved &&
    !forgetFail.ok &&
    forgetFail.failures.includes('retention-violation:transcriptDigest')
);

// M5 — per-context mediator pseudonyms: same holder, two contexts → two ids
// with no derivable relation; same holder+context → stable id (§6.5 in-context
// linkage is intentional).
const idA1 = mediatorFacingId(holderA.secret, dDigestA);
const idA1again = mediatorFacingId(holderA.secret, dDigestA);
const idA2 = mediatorFacingId(holderA.secret, dDigestB);
t(
  'M5 pseudonyms: fresh per context, stable within one, unrelated across',
  idA1 === idA1again &&
    idA1 !== idA2 &&
    !idA1.includes(idA2) &&
    !idA2.includes(idA1) &&
    !idA1.includes(holderA.secret)
);

// M6 — downgrade machine: all four exits reachable, each with full-visibility
// transition records.
const snapshot = { members: ['mediator:cloud-vta-1'], effectiveTime: EPOCH - 100 };
const runs = [
  attemptProof({ localCapable: false, policy: { onLocalFailure: 'fail', redressRoute: 'redress/13.6' }, now: EPOCH }),
  attemptProof({ localCapable: false, policy: { onLocalFailure: 'lower-profile', lowerProfileId: 'mlp-lite/1' }, now: EPOCH }),
  attemptProof({
    localCapable: false,
    policy: { onLocalFailure: 'mediator', mediatorId: 'mediator:cloud-vta-1', registrySnapshot: snapshot },
    now: EPOCH,
  }),
  attemptProof({ localCapable: false, policy: { onLocalFailure: 'channel-switch', channel: 'in-person/branch' }, now: EPOCH }),
];
const exitsSeen = runs.map((r) => r.exit);
const allVisible = runs.every(
  (r) =>
    r.transitions.length > 0 &&
    r.transitions.every((rec) => validateTransition(rec).ok && rec.target)
);
t(
  'M6 downgrade: all four exits reachable with full visibility records',
  EXITS.every((e) => exitsSeen.includes(e)) && allVisible
);

// M7 — the silent transition (buildable only via the deliberately-wrong
// helper) is rejected as 'silent-fallback'.
const silent = __unsafeSilentTransition('LOCAL-PROVING-FAILED', 'GOVERNED-MEDIATOR', 'mediator:cloud-vta-1', []);
const partial = __unsafeSilentTransition('LOCAL-PROVING-FAILED', 'NAMED-LOWER-PROFILE', 'mlp-lite/1', ['verifier']);
t(
  "M7 silent/partial transitions rejected as 'silent-fallback'",
  validateTransition(silent).failures.includes('silent-fallback') &&
    validateTransition(partial).failures.includes('silent-fallback') &&
    validateTransition(runs[2].transitions[0]).ok
);

// M8 — de-listed mediator fails closed: 'mediator-not-governed', and the
// failure itself is a visible FAIL transition.
const delisted = attemptProof({
  localCapable: false,
  policy: {
    onLocalFailure: 'mediator',
    mediatorId: 'mediator:rogue',
    registrySnapshot: snapshot, // rogue is not a member
  },
  now: EPOCH,
});
const noSnapshot = attemptProof({
  localCapable: false,
  policy: { onLocalFailure: 'mediator', mediatorId: 'mediator:cloud-vta-1' }, // no snapshot at all
  now: EPOCH,
});
t(
  "M8 de-listed/unsnapshotted mediator fails closed 'mediator-not-governed'",
  delisted.exit === 'FAIL' &&
    delisted.reason === 'mediator-not-governed' &&
    validateTransition(delisted.transitions[0]).ok &&
    noSnapshot.exit === 'FAIL' &&
    noSnapshot.reason === 'mediator-not-governed'
);

// M9 — transcript binding: a proofRecord verifies only against its own
// transcript digest; re-targeting fails 'job-transcript-mismatch'.
const med9 = makeMediator();
const record1 = med9.executeJob(jobA, { epoch: EPOCH });
const own = verifyProofRecord(record1, tDigest1);
const retargeted = verifyProofRecord(record1, tDigest2);
const tampered = verifyProofRecord({ ...record1, transcriptDigest: tDigest2 }, tDigest2);
t(
  "M9 transcript binding: own digest verifies; re-target fails 'job-transcript-mismatch'; tamper fails 'proof-invalid'",
  own.ok &&
    !retargeted.ok &&
    retargeted.reason === 'job-transcript-mismatch' &&
    !tampered.ok &&
    tampered.reason === 'proof-invalid'
);

console.log(`mediator: ${pass}/${pass + fail} pass`);
if (fail > 0) process.exit(1);
