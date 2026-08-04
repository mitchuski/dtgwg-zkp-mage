// The show reference model — X3 M4.
//
// A show is ONE canonical transcript (§15.2 lists requestedPredicates as a
// required field — the baseline quietly makes the show, not the predicate,
// the unit of freshness) plus one member proof per bundle predicate, every
// member bound to the SAME transcript digest. A show verifies as a whole or
// fails as a whole (X3 atomicity); no partial acceptance, no transplanting a
// member into a different transcript (§15.1, §26.1 replay rejection).
//
// Reference model, not crypto: a member "proof" is a deterministic
// commitment H(domain, predicate, transcriptDigest). The POINT is the
// binding relations (like rt 01 / rt 07), not the proving system — the
// construction-selection gate (§25) comes after the statement is fixed.
//
// Named rejection reasons emitted here (the seam to the X1 fixture register):
//   bundle-outside-registry            à-la-carte / unknown id / wrong version
//   partial-show-rejected              atomicity: a member is missing
//   member-transcript-mismatch         transplant / replay across transcripts
//   stale-transcript                   expiry vs an EXPLICIT now (no Date.now())
//   transcript-invalid                 malformed or digest-tampered transcript
//   taskcontext-not-outcome-evidence   the credential/artifact wall
//   bundle-profile-mismatch            (makeShow) bundle vs descriptor profile

import {
  descriptorDigest,
  transcriptDigest,
  validateTranscript,
  H,
} from '../canonical/canonical.mjs';
import { lookupBundle } from './bundles.mjs';

export const DOMAIN_MEMBER = 'dtg-zkp/show-member/v0';
export const ENCODING_VERSION = 'dtg-zkp/canonical/v0';

// §19 observer list — the "against whom" axis of the joint record.
export const OBSERVERS = Object.freeze([
  'verifier',
  'issuer',
  'issuer+verifier-colluding',
  'multiple-verifiers-colluding',
  'registry-operator',
  'accreditation-authority',
  'mediated-prover',
  'wallet-or-agent-operator',
  'network-observer',
  'auditor-or-log-processor',
  'malicious-co-resident-app',
]);

// Per-predicate established statements (§9.1 register, compressed). These are
// the ONLY claims a verified show enumerates — note what is absent.
export const STATEMENTS = Object.freeze({
  'PR-LIV': 'presenter possesses an unexpired, non-revoked liveness attestation under the named policy and assurance class',
  'PR-PER': 'attested subject satisfies the named personhood policy under its stated assumptions',
  'PR-ISS': 'attestation issuer is accepted under the named accreditation framework (snapshot-consistent)',
  'PR-UNQ': 'same enrolled secret cannot act twice in this context/scope/purpose/epoch without a repeated nullifier',
  'PR-HLD': 'prover controls the secret bound to the attestation and this transcript',
  'PR-FRE': 'proof is bound to the current canonical transcript and cannot replay into a materially different one',
  'PR-RNG': 'hidden attested value satisfies the requested range',
  'PR-DEL': 'named agent is authorised for the current action within declared scope and time (separate evidence, not PR-HLD)',
});

// Member proof commitment — verifier-recomputable in the model; a real
// construction replaces this with a proof verifying against the digest.
export const memberCommitment = (predicate, tDigest) => H(DOMAIN_MEMBER, predicate, tDigest);

// --- makeShow ----------------------------------------------------------------
// Builds the one canonical transcript for the bundle, then one member per
// bundle predicate, each bound to that transcript's digest.
export function makeShow({
  bundleId,
  bundleVersion,
  descriptor, // §6.2 governed context descriptor object
  verifier,
  challenge,
  sessionId,
  expiry, // explicit epoch-seconds boundary — no Date.now() anywhere
  registry,
  policyRequirements = 'assurance>=L2',
  snapshotRequirements = 'root-age<=24h',
  delegationRef, // required semantics only when the bundle carries PR-DEL
  taskContextCredential, // optional attached ceremony-bound credential (VWC-ish)
}) {
  const found = lookupBundle(registry, bundleId, bundleVersion);
  if (!found.ok) return found; // 'bundle-outside-registry'
  const bundle = found.bundle;

  // The bundle's profile and the governed descriptor's profile must agree —
  // an EPP bundle presented under an MLP context descriptor is incoherent.
  if (!String(descriptor.profile).startsWith(bundle.profile)) {
    return { ok: false, reason: 'bundle-profile-mismatch' };
  }

  const transcript = {
    protocol: descriptor.protocol,
    profile: descriptor.profile,
    verifier,
    contextDescriptorDigest: descriptorDigest(descriptor),
    purpose: descriptor.purpose,
    scope: descriptor.scope,
    challenge,
    sessionId,
    requestedPredicates: [...bundle.predicates], // the bundle IS the request
    policyRequirements,
    expiry,
    snapshotRequirements,
    encodingVersion: ENCODING_VERSION,
  };
  if (bundle.predicates.includes('PR-DEL')) {
    transcript.delegationRef = delegationRef ?? 'delegation:demo-ref';
  }

  const tDigest = transcriptDigest(transcript);
  const members = bundle.predicates.map((predicate) => ({
    predicate,
    transcriptDigest: tDigest,
    commitment: memberCommitment(predicate, tDigest),
  }));

  const show = { bundleId, bundleVersion, transcript, transcriptDigest: tDigest, members };
  if (taskContextCredential !== undefined) show.attachments = { taskContextCredential };
  return { ok: true, show };
}

// --- verifyShow --------------------------------------------------------------
// Atomic. Order of checks: registry → transcript → predicate set → freshness
// → member completeness → member binding. First failure names the reason.
export function verifyShow(show, registry, now) {
  if (typeof now !== 'number') {
    throw new Error('now-required: pass the evaluation time explicitly (no Date.now())');
  }

  const found = lookupBundle(registry, show.bundleId, show.bundleVersion);
  if (!found.ok) return { ok: false, reason: 'bundle-outside-registry' };
  const bundle = found.bundle;

  const v = validateTranscript(show.transcript);
  if (!v.ok) return { ok: false, reason: 'transcript-invalid' };
  const tDigest = transcriptDigest(show.transcript);
  if (tDigest !== show.transcriptDigest) return { ok: false, reason: 'transcript-invalid' };

  // The transcript's predicate set must be EXACTLY the registered bundle —
  // an à-la-carte set smuggled under a registered bundleId is still outside
  // the registry (§18.3's cardinality-control instinct at the request layer).
  const key = (ps) => [...ps].sort().join(',');
  if (key(show.transcript.requestedPredicates) !== key(bundle.predicates)) {
    return { ok: false, reason: 'bundle-outside-registry' };
  }

  if (typeof show.transcript.expiry !== 'number' || now > show.transcript.expiry) {
    return { ok: false, reason: 'stale-transcript' };
  }

  // Atomicity: exactly one member per bundle predicate, nothing partial.
  const members = show.members ?? [];
  const byPredicate = new Map(members.map((m) => [m.predicate, m]));
  for (const p of bundle.predicates) {
    if (!byPredicate.has(p)) return { ok: false, reason: 'partial-show-rejected' };
  }
  if (members.length !== bundle.predicates.length) {
    // surplus or duplicate members — the effective set is not the bundle
    return { ok: false, reason: 'bundle-outside-registry' };
  }

  // Every member bound to THE SAME transcript digest — the transplant /
  // replay-across-transcript rejection (§15.1, §26.1).
  for (const m of members) {
    if (m.transcriptDigest !== tDigest || m.commitment !== memberCommitment(m.predicate, tDigest)) {
      return { ok: false, reason: 'member-transcript-mismatch' };
    }
  }

  // The verified statement enumerates established claims PER PREDICATE and
  // nothing else. The credential/artifact wall: taskCompletion is never a
  // key here — a valid show does not establish that any task was performed,
  // completed, or performed well (X3; cred-spec taskContext binding).
  const establishedClaims = {};
  for (const p of bundle.predicates) establishedClaims[p] = STATEMENTS[p];
  return {
    ok: true,
    statement: Object.freeze({
      bundleId: bundle.id,
      bundleVersion: bundle.version,
      profile: bundle.profile,
      transcriptDigest: tDigest,
      establishedClaims: Object.freeze(establishedClaims),
    }),
  };
}

// --- the credential/artifact wall, queried directly --------------------------
// Asking the show for completion evidence is a category error, whatever
// credentials it carries: taskContext binds a credential to its ceremony;
// outcome evidence is a threadId-correlated artifact on the Trust Task side.
export function completionEvidence(_show) {
  return { ok: false, reason: 'taskcontext-not-outcome-evidence' };
}

// --- joint disclosure record -------------------------------------------------
// X3 M3 made concrete: the show-level record in §2.4 three-parameter form —
// data, not prose. "For how long" is the longest-lived member linkage:
// PR-UNQ's nullifier persists for the context epoch and dominates the
// session-lived members; without PR-UNQ nothing outlives the transcript.
export function jointDisclosureRecord(bundle) {
  const hasUnq = bundle.predicates.includes('PR-UNQ');
  return Object.freeze({
    bundleId: bundle.id,
    bundleVersion: bundle.version,
    againstWhom: OBSERVERS,
    forHowLong: Object.freeze(
      hasUnq
        ? { horizon: 'epoch', dominatedBy: 'PR-UNQ' }
        : { horizon: 'session', dominatedBy: 'transcript-session' }
    ),
    alongsideWhat: bundle.predicates, // the other members, explicitly enumerated
  });
}
