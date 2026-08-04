// Reference mediator model — X7 M2/M3 (mediated-proving profile, §21).
//
// Models the DECISION RULES, not real delegated proving:
//   §21.2  the control list as mechanism — what a job may carry per taxonomy
//          level (T0 blind / T1 semi-trusted / T2 prohibited honeypot);
//   §21.2 closing sentence + §24: a job carrying witnesses, biometrics, or
//          credentials cannot be CONSTRUCTED — 'honeypot-prohibited';
//   P-ISOLATE (§21.2 isolation): two jobs from different holders share no
//          derivable state — execution is a pure function of the job;
//   P-FORGET (§21.2 non-retention): post-job state equals pre-job state
//          modulo the declared, frozen audit fields;
//   §6.6   no common mediated-prover identifier — the holder faces the
//          mediator under a per-context pseudonym (rt 01's nullifier with
//          the mediator seated as counterparty per context);
//   §15/§21.2 transcript binding — a proofRecord verifies only against its
//          own transcript digest ('job-transcript-mismatch' otherwise).
//
// Zero-dep, offline, deterministic. No Date.now — epochs are explicit.

import { H, canonicalize, descriptorDigest, transcriptDigest } from '../canonical/canonical.mjs';
import { nullifier } from '../01-uniqueness-nullifier/src/nullifier.mjs';

const DOMAIN_BLIND = 'dtg-zkp/mediator/blinded-input/v0';
const DOMAIN_COMMIT = 'dtg-zkp/mediator/commitment/v0';
const DOMAIN_PROOF = 'dtg-zkp/mediator/proof/v0';

export const MEDIATOR_LEVELS = Object.freeze(['T0', 'T1']); // T2 is not a level; it is a prohibition.

// The §21.2 "audit and incident response" record, declared and FROZEN.
// Deliberately minimal: a job counter and a coarse epoch bucket. No session
// ids, no timestamps, no transcript digests — those are the correlators §6.6
// and X4's log-field register exclude.
export const AUDIT_FIELDS = Object.freeze(['jobCount', 'epochBucket']);
export const EPOCH_BUCKET_SECONDS = 86400; // one-day coarseness

// --- per-context mediator-facing pseudonym (§6.6) ---------------------------
// R-DID discipline with the mediator as counterparty PER CONTEXT: fresh id per
// context descriptor, stable within one (the §6.5 intentional in-context
// linkage), never one account across contexts.
export function mediatorFacingId(holderSecret, contextDescriptorDigest) {
  return nullifier(holderSecret, 'mediator/' + contextDescriptorDigest);
}

// --- holder-side witness preparation ----------------------------------------
// The honest split (X7 "Does mediation change what the verifier may rely on?"):
// the holder derives commitments/blinded inputs USING the holder secret; the
// mediator computes over prepared inputs it cannot open. The secret never
// leaves the holder — PR-HLD's statement survives.
export function deriveBlindedInputs(holderSecret, tDigest) {
  return Object.freeze({
    witnessCommitment: H(DOMAIN_BLIND, holderSecret, tDigest, 'witness'),
    bindingCommitment: H(DOMAIN_BLIND, holderSecret, tDigest, 'binding'),
  });
}

// Keys that mark a job as the §24-prohibited construction. Checked at
// construction AND at execution (defence on both sides of the wire).
const HONEYPOT_KEYS = Object.freeze([
  'witness',
  'witnesses',
  'biometric',
  'biometrics',
  'credential',
  'credentials',
  'rawAttributes',
  'holderSecret',
  'secret',
]);

function scanForHoneypotKeys(obj, path = '') {
  if (obj === null || typeof obj !== 'object') return null;
  for (const k of Object.keys(obj)) {
    if (HONEYPOT_KEYS.includes(k)) return path ? `${path}.${k}` : k;
    const hit = scanForHoneypotKeys(obj[k], path ? `${path}.${k}` : k);
    if (hit) return hit;
  }
  return null;
}

// --- the proving job (§21.2 "data sent to the mediator") --------------------
// T0: statement (public transcript fields) + blinded inputs + transcript digest.
// T1: additionally the (stable) enrolment commitment — which is exactly why T1
//     is only admissible with full operational controls: a stable commitment is
//     a cross-context correlator at the mediator.
// T2: cannot be built. The honeypot is prohibited at the constructor.
export function makeProvingJob({ holderSecret, descriptor, transcript, level, ...rest }) {
  if (level === 'T2') throw new Error('honeypot-prohibited');
  if (!MEDIATOR_LEVELS.includes(level)) throw new Error(`unknown-mediator-level:${level}`);
  if (!holderSecret) throw new Error('missing-holder-secret');
  const extraHit = scanForHoneypotKeys(rest);
  if (extraHit) throw new Error('honeypot-prohibited'); // witnesses/biometrics/credentials in the payload
  const dDigest = descriptorDigest(descriptor);
  if (transcript.contextDescriptorDigest !== dDigest) {
    throw new Error('descriptor-transcript-mismatch');
  }
  const tDigest = transcriptDigest(transcript);
  // The statement = public transcript fields the mediator computes over.
  // Deliberately EXCLUDES challenge and sessionId: the digest binds them, and
  // session identifiers at the mediator are the §6.6/X4 correlator to avoid.
  const statement = Object.freeze({
    protocol: transcript.protocol,
    profile: transcript.profile,
    verifier: transcript.verifier,
    contextDescriptorDigest: transcript.contextDescriptorDigest,
    purpose: transcript.purpose,
    scope: transcript.scope,
    requestedPredicates: Object.freeze([...transcript.requestedPredicates]),
    expiry: transcript.expiry,
  });
  const job = {
    level,
    mediatorFacingId: mediatorFacingId(holderSecret, dDigest),
    statement,
    blindedInputs: deriveBlindedInputs(holderSecret, tDigest),
    transcriptDigest: tDigest,
  };
  if (level === 'T1') {
    // Commitments only — never witnesses or biometrics (§21.2 row two).
    job.commitments = Object.freeze([H(DOMAIN_COMMIT, holderSecret, 'enrolment')]);
  }
  return Object.freeze(job);
}

// --- the reference mediator --------------------------------------------------
// makeMediator()                      → conformant (P-ISOLATE + P-FORGET)
// makeMediator({ retain: ['transcriptDigest'] }) → deliberately-wrong variant
//   for tests: retains the named field past job completion, so checkForget
//   fails BY NAME ('retention-violation:transcriptDigest').
export function makeMediator({ retain = [] } = {}) {
  const state = {
    audit: { jobCount: 0, epochBucket: null },
    sessions: {}, // per-session working state — MUST be empty between jobs
    retained: {}, // populated only by the misbehaving variant
  };

  function stateSnapshot() {
    return JSON.parse(JSON.stringify(state));
  }

  function executeJob(job, { epoch } = {}) {
    if (typeof epoch !== 'number') throw new Error('missing-epoch'); // no Date.now in the lab
    if (!MEDIATOR_LEVELS.includes(job?.level)) throw new Error('honeypot-prohibited');
    const hit = scanForHoneypotKeys(job);
    if (hit) throw new Error('honeypot-prohibited'); // fail closed at execution too
    // P-ISOLATE: state keyed per-session; the session key derives only from
    // THIS job. No cross-job caches — nothing here reads another session.
    const sessionKey = H('dtg-zkp/mediator/session/v0', job.mediatorFacingId, job.transcriptDigest);
    state.sessions[sessionKey] = { working: true };
    // The "proof": a pure function of the job's own fields — the model of
    // "the mediator computes over prepared inputs it cannot open".
    const proof = H(
      DOMAIN_PROOF,
      job.transcriptDigest,
      canonicalize(job.blindedInputs),
      job.mediatorFacingId,
      job.level
    );
    const proofRecord = Object.freeze({
      proof,
      level: job.level,
      mediatorFacingId: job.mediatorFacingId,
      statement: job.statement,
      blindedInputs: job.blindedInputs,
      transcriptDigest: job.transcriptDigest,
    });
    // P-FORGET: complete the job — session state is dropped; only the frozen
    // audit fields move (job counter + coarse epoch bucket).
    delete state.sessions[sessionKey];
    state.audit.jobCount += 1;
    state.audit.epochBucket = Math.floor(epoch / EPOCH_BUCKET_SECONDS);
    // The deliberately-wrong retention path (test fixture only).
    for (const field of retain) {
      if (!state.retained[field]) state.retained[field] = [];
      state.retained[field].push(job[field]);
    }
    return proofRecord;
  }

  return { executeJob, stateSnapshot };
}

// --- P-FORGET checker --------------------------------------------------------
// Post-job snapshot MUST equal pre-job snapshot modulo AUDIT_FIELDS. Any other
// difference is a named retention violation.
export function checkForget(pre, post) {
  const failures = [];
  for (const key of Object.keys(post.retained ?? {})) {
    if ((post.retained[key]?.length ?? 0) > (pre.retained?.[key]?.length ?? 0)) {
      failures.push(`retention-violation:${key}`);
    }
  }
  if (Object.keys(post.sessions ?? {}).length > 0) {
    failures.push('retention-violation:session');
  }
  const strip = (s) => {
    const c = JSON.parse(JSON.stringify(s));
    for (const f of AUDIT_FIELDS) delete c.audit[f];
    delete c.retained;
    delete c.sessions;
    return c;
  };
  if (failures.length === 0 && canonicalize(strip(pre)) !== canonicalize(strip(post))) {
    failures.push('retention-violation:unknown-field');
  }
  return { ok: failures.length === 0, failures };
}

// --- transcript binding (§15 / §21.2) ----------------------------------------
// A proofRecord verifies ONLY against its own transcript digest; re-targeting
// to another transcript fails by name.
export function verifyProofRecord(record, expectedTranscriptDigest) {
  if (record.transcriptDigest !== expectedTranscriptDigest) {
    return { ok: false, reason: 'job-transcript-mismatch' };
  }
  const recomputed = H(
    DOMAIN_PROOF,
    record.transcriptDigest,
    canonicalize(record.blindedInputs),
    record.mediatorFacingId,
    record.level
  );
  if (recomputed !== record.proof) return { ok: false, reason: 'proof-invalid' };
  return { ok: true, reason: 'verified' };
}
