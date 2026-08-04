// Rejection-reason register — v1. (X1 milestone M1; v1 absorbs the X3 seam.)
//
// §13.6 requires deterministic error semantics; §26.1 names eleven rejections
// every conformant test programme MUST produce. This register is that
// requirement made interoperable: one versioned vocabulary in which every
// rejection a construction emits has a name, a source, and a decision-doc
// anchor — so two implementations can compare *why* they rejected, not just
// that they rejected. A reject fixture whose reason is not in this register is
// not a conformance vector; it is an implementation detail leaking out.
//
// Two strata, one namespace:
//   runtime-emitted  — the exact strings runtimes 01 and 07 already return,
//                      PLUS (v1) the seven strings the show-composition lab
//                      emits (read from their sources, not paraphrased; the
//                      fixture suite must match them byte-for-byte — test F9
//                      triggers each show-composition rejection and compares).
//   §26.1-mandated   — one kebab-case code per bullet of the eleven minimum
//                      negative tests. Bullet 10 ("inconsistent epoch or
//                      registry snapshots") carries two codes because the two
//                      facets fail differently: a snapshot that is merely OLD
//                      (stale-registry-snapshot) vs. two snapshots that
//                      CONTRADICT each other (epoch-snapshot-inconsistent).
//
// v0 -> v1 (append-only; no v0 code renamed or removed):
//   + partial-show-rejected, member-transcript-mismatch,
//     bundle-outside-registry, stale-transcript, transcript-invalid,
//     taskcontext-not-outcome-evidence, bundle-profile-mismatch
//     (all verbatim from ../show-composition/show.mjs + bundles.mjs).
//   'stale-transcript' is marked retry-ambiguous: a transcript past its expiry
//   under the verifier's clock may be clock skew or a slow network, not a
//   replay — §13.6 forbids treating that observable as proof of malice.
//
// retryAmbiguous marks the §13.6 ambiguity: the same observable rejection may
// be a legitimate retry, a race, a recovery flow, an epoch disagreement, or an
// attack. A verifier MUST NOT treat a retry-ambiguous rejection as proof of
// malice, and MUST route it to the challenge/redress path §13.6 requires.
//
// v1 -> v2 (append-only; no v1 code renamed, removed, or re-typed; every v1
// entry byte-identical):
//   Absorbs the named failure codes of the six instrument builds that landed
//   after v1 — context-card (X2), quiet-presentation (X4: quiet + budget +
//   logregister), rotation (X5), erosion-record (X6: clocks + record),
//   mediator (X7: mediator + downgrade), multi-issuer (X8: registry +
//   aggregate), guardian-recovery (X9) — read byte-exact from their sources;
//   test F10 triggers each from the emitting module and compares bytes.
//   Two new mechanisms:
//     * FAMILIES (REASON_FAMILIES) — a code with a ':<param>' suffix registers
//       once as { prefix, parameterized: true }; isKnownReason matches any
//       'prefix' + non-empty parameter (e.g. 'retention-violation:transcriptDigest'
//       matches the 'retention-violation:' family). Exact codes stay exact.
//     * CONVERGENCES — a string emitted by more than one module (or emitted by
//       a module AND already §26.1-mandated) is ONE entry with every emitter
//       recorded; nothing is duplicated. The v1 'silent-fallback' entry is
//       byte-identical; mediator/downgrade.mjs's emission converges on it
//       (test F11 verifies the bytes agree).

export const REASON_REGISTER_VERSION = 'v2';

const R = (source, decisionDocRef, retryAmbiguous, note) =>
  Object.freeze(note === undefined
    ? { source, decisionDocRef, retryAmbiguous }
    : { source, decisionDocRef, retryAmbiguous, note });

export const REASONS = Object.freeze({
  // --- runtime-emitted: runtime 01 (uniqueness nullifier) --------------------
  'duplicate-human-in-context': R(
    'runtime-01 ContextRegistry.present (P4 self-Sybil)',
    '§13, §13.6, §26',
    true,
    '§13.6 names this exact ambiguity: legitimate retry, race condition, ' +
      'recovery, epoch disagreement, verifier duplication, or malicious reuse. ' +
      'A challenge route is mandatory; permanent opaque exclusion is forbidden.'
  ),

  // --- runtime-emitted: runtime 07 (trust-graph formation) -------------------
  'endpoint-not-personhood-anchored': R(
    'runtime-07 Swordsman.prove check 1 (G2)',
    '§11 (PR-PER), §13 (PR-UNQ anchor); cred-spec PHC membership rule',
    false
  ),
  'self-edge-forbidden': R(
    'runtime-07 Swordsman.prove check 2 (G3)',
    '§13 (self-Sybil surface); SPELLWEB spec 6B',
    false
  ),
  'unilateral-no-mutual-consent': R(
    'runtime-07 Swordsman.prove check 3 (G1)',
    'cred-spec bilateral VRC; SPELLWEB spec 6B (mutual consent)',
    false
  ),
  'r-did-mismatch': R(
    'runtime-07 Swordsman.prove check 4 (G4 uniqueness)',
    'cred-spec R-DID uniqueness ("new, unique R-DID for every counterparty")',
    false
  ),
  'vrc-commitment-forged': R(
    'runtime-07 Swordsman.prove check 5 (G7, the Gap)',
    '§2.6 (composition), §25 item 4 (adversary model)',
    false
  ),
  'duplicate-edge': R(
    'runtime-07 Swordsman.prove check 6 (G6 idempotence)',
    '§13.6 by analogy (repeated presentation of an already-formed edge)',
    true,
    'A re-presented edge may be a retry or a race, not an attack; idempotent ' +
      'rejection is safe but MUST NOT be logged as malice.'
  ),

  // --- runtime-emitted: show-composition (X3 M4) — absorbed verbatim at v1 ---
  'partial-show-rejected': R(
    'show-composition verifyShow (atomicity: a member proof missing)',
    '§15.2 (requestedPredicates is required — the show is the unit); §26.1 bullet 3 family',
    false
  ),
  'member-transcript-mismatch': R(
    'show-composition verifyShow (member bound to a different transcript)',
    '§15.1, §15.2; §26.1 bullet 3 (replay/transplant across transcripts)',
    false
  ),
  'bundle-outside-registry': R(
    'show-composition lookupBundle / matchBundle / verifyShow (à-la-carte, unknown id/version, surplus members)',
    '§18.3 cardinality control at the request layer; §26.1 bullet 3 family (atomicity spirit)',
    false
  ),
  'stale-transcript': R(
    'show-composition verifyShow (expiry vs an EXPLICIT now — no Date.now())',
    '§15.2 expiry and accepted clock rules; §13.6',
    true,
    'A transcript past expiry under the verifier\'s clock may be clock skew, ' +
      'a slow network, or a genuine replay — indistinguishable at the ' +
      'observable. §13.6: route to challenge, never log as malice.'
  ),
  'transcript-invalid': R(
    'show-composition verifyShow (malformed transcript or tampered digest)',
    '§15.2 canonical transcript; §6.2 encoding discipline',
    false
  ),
  'taskcontext-not-outcome-evidence': R(
    'show-composition completionEvidence (the credential/artifact wall)',
    'X3 boundary; §27.2 (outcome evidence lives on the Trust Task side)',
    false
  ),
  'bundle-profile-mismatch': R(
    'show-composition makeShow (bundle profile vs descriptor profile disagree)',
    '§7 profile composition; §6.2 descriptor profile field',
    false
  ),

  // --- §26.1-mandated: one code per bullet (bullet 10 carries two) -----------
  'expired-or-revoked-attestation': R(
    'decision-doc §26.1 bullet 1',
    '§26.1; §10.1 (validity/status), §10.6 (horizon)',
    false
  ),
  'overclaim-verifier-output': R(
    'decision-doc §26.1 bullet 2 — the lint class',
    '§26.1; §9 "must not infer" column; §24 prohibited claims',
    false
  ),
  'replay-cross-transcript': R(
    'decision-doc §26.1 bullet 3',
    '§26.1; §15 (PR-FRE), §15.2 canonical transcript',
    false
  ),
  'nullifier-domain-reuse': R(
    'decision-doc §26.1 bullet 4',
    '§26.1; §13 (PR-UNQ), §2.3 context-dependent unlinkability',
    false
  ),
  'undocumented-collusion-claim': R(
    'decision-doc §26.1 bullet 5',
    '§26.1; §24 (collusion-resistance claims); §2.4 "against whom"',
    false
  ),
  'unjustified-stable-correlator': R(
    'decision-doc §26.1 bullet 6',
    '§26.1; §24 (global stable identifiers)',
    false
  ),
  'context-expansion-without-version': R(
    'decision-doc §26.1 bullet 7',
    '§26.1; §24 ("a context boundary that can expand silently"); §6.2',
    false
  ),
  'silent-fallback': R(
    'decision-doc §26.1 bullet 8',
    '§26.1; §21 (mediated proving), §27.4 (fallback legibility)',
    false
  ),
  'key-control-as-authority': R(
    'decision-doc §26.1 bullet 9',
    '§26.1; §14.2 (PR-HLD negative meaning), §27.5 (delegation)',
    false
  ),
  'stale-registry-snapshot': R(
    'decision-doc §26.1 bullet 10 (registry facet)',
    '§26.1; §12.4 registry and snapshot semantics',
    true,
    'A snapshot older than policy allows may be a refresh race, not an attack.'
  ),
  'epoch-snapshot-inconsistent': R(
    'decision-doc §26.1 bullet 10 (epoch facet)',
    '§26.1; §12.4; §13.6 (epoch disagreement as legitimate cause)',
    true,
    '§13.6 lists epoch disagreement among the legitimate causes of a repeated ' +
      'nullifier; inconsistency is retry-ambiguous until challenged.'
  ),
  'disclosure-ignores-observables': R(
    'decision-doc §26.1 bullet 11',
    '§26.1; §2.6 (composition), §2.4 "alongside what"',
    false
  ),

  // ==========================================================================
  // v2 additions — the six instrument builds, absorbed byte-exact (test F10).
  // Parameterized codes live in REASON_FAMILIES below, NOT here.
  // ==========================================================================

  // --- runtime-emitted: context-card (X2) — checkLegibility ------------------
  'digest-mismatch': R(
    'context-card checkLegibility (card digest ≠ descriptorDigest(descriptor))',
    '§26 (descriptions provably match configuration); §6.2/§15.2 digest binding',
    false
  ),

  // --- runtime-emitted: quiet-presentation (X4) — checkQuietTier -------------
  'status-correlated-with-presentation': R(
    'quiet-presentation checkQuietTier (status-fetch pattern differs from idle window)',
    '§12.4 lookup-pattern rule; §19/§20 (M-STATUS)',
    false
  ),
  'per-show-authority-contact': R(
    'quiet-presentation checkQuietTier (off-schedule status-fetch within k ticks of a show)',
    '§12.4; §19 (registry-operator observer); X4 M-STATUS',
    false
  ),
  'error-surface-nonuniform': R(
    'quiet-presentation checkQuietTier (>1 external error string, or internal vocabulary leaked externally)',
    '§19 (error codes and diagnostics); §13.6 (detail is holder-routed); X4 M-ERROR',
    false
  ),
  'shape-fingerprint': R(
    'quiet-presentation checkQuietTier (>1 distinct size class across the trace)',
    '§19 (proof size/encoding/timing fingerprints); §10.4; X4 M-SHAPE',
    false
  ),
  'retry-off-grid': R(
    'quiet-presentation checkQuietTier (a retry at a tick not on the timing grid)',
    '§10.4 (retry count and failure mode); §20; X4 M-RETRY',
    false
  ),
  'retry-over-budget': R(
    'quiet-presentation checkQuietTier (more retries than budget × errors)',
    '§10.4; §20; X4 M-RETRY',
    false
  ),

  // --- runtime-emitted: rotation (X5) ----------------------------------------
  'recovery-rate-exceeded': R(
    'rotation recover (recovery-domain nullifier gate: k-th recovery in one recovery epoch)',
    '§13.4, §6.5 (rate/count thresholds are intentional in-context linkage); §13.6',
    true,
    'A repeated recovery in one recovery epoch may be legitimate repeated ' +
      'catastrophic loss (a device destroyed twice) or a retry after a ' +
      'partially-failed ceremony, not credential farming — §13.6: route to ' +
      'challenge, never log as malice.'
  ),
  'duplicate-live-enrolment': R(
    'rotation issuerEnrol (biometric dedup matcher: a second live enrolment by the same human)',
    '§13 (one live enrolment per human); X5 pattern 1',
    true,
    'The same observable class as duplicate-human-in-context: a person who ' +
      'lost their device may re-enrol without knowing their old enrolment is ' +
      'still live — recovery, race, or Sybil are indistinguishable at the ' +
      'observable; the §13.6 challenge route is mandatory.'
  ),
  'epoch-descent-mismatch': R(
    'rotation checkDescent (presented epoch secret is not the one committed)',
    '§5.8 epoch rollover; §22.1 (nullifier-epoch clock); X5 M2',
    false
  ),
  'unknown-enrolment': R(
    'rotation recover (old commitment not at the issuer) + guardian-recovery ' +
      'recoverWithGuardians / reissue (revokedRef not live) — same bytes, dual emitters',
    '§10.1 status semantics; §13.6',
    true,
    'A retried recovery after a SUCCESSFUL recovery presents a now-revoked ' +
      'reference — retry/race and fabricated-reference attack are ' +
      'indistinguishable at the observable (§13.6).'
  ),

  // --- runtime-emitted: erosion-record (X6) — validateRecord -----------------
  'erosion-clock-unwatched': R(
    'erosion-record validateRecord (erosion entry with no re-base trigger)',
    '§22.2 (an unwatched erosion clock is the prohibited unbounded default); §22.3',
    false
  ),
  'overclaimed-measurement': R(
    'erosion-record validateRecord (estimatedHorizon.basis === "measured")',
    'X6 honesty rule (H(X|B_t) is not measurable in deployment); §5.9',
    false
  ),
  'cliff-only-erosion-claim': R(
    'erosion-record validateRecord (bare expiry with no named observables)',
    '§5.9 (assurance horizon is a rate, not another expiry)',
    false
  ),

  // --- runtime-emitted: mediator (X7) — mediator.mjs + downgrade.mjs ---------
  'honeypot-prohibited': R(
    'mediator makeProvingJob / executeJob (T2, or witnesses/biometrics/credentials in a job — fails closed both sides of the wire)',
    '§21.2 closing sentence; §24 (the honeypot cannot be constructed)',
    false
  ),
  'missing-holder-secret': R(
    'mediator makeProvingJob (job construction without the holder secret)',
    '§14 PR-HLD (holder-side preparation; the secret never leaves the holder); §21.2',
    false
  ),
  'descriptor-transcript-mismatch': R(
    'mediator makeProvingJob (transcript.contextDescriptorDigest ≠ descriptorDigest(descriptor))',
    '§15.2 (the transcript binds the descriptor digest); §6.2',
    false
  ),
  'missing-epoch': R(
    'mediator executeJob (no explicit epoch — no Date.now in the lab)',
    '§21.2 (audit epoch bucket); lab determinism rule (explicit clocks only)',
    false
  ),
  'job-transcript-mismatch': R(
    'mediator verifyProofRecord (proofRecord re-targeted to another transcript digest)',
    '§15 / §21.2 transcript binding',
    false
  ),
  'proof-invalid': R(
    'mediator verifyProofRecord (proof does not recompute over the record fields)',
    '§21.2 (the proof is a pure function of the job)',
    false
  ),
  'unnamed-target': R(
    'mediator/downgrade makeTransition / validateTransition (a transition with no named target)',
    '§21.3 (explicit means NAMED)',
    false
  ),
  'mediator-not-governed': R(
    'mediator/downgrade attemptProof (mediator absent from the registry snapshot — fails closed)',
    '§21.3 (governed mediator = registry-listed under §12.4 snapshot semantics); §13.6',
    true,
    'A mediator missing from the verifier-held snapshot may be registry lag — ' +
      'freshly accredited, or a snapshot not yet propagated — not a rogue ' +
      'mediator; failing closed is correct, but §13.6 forbids reading the ' +
      'refusal as proof of malice.'
  ),
  'unnamed-lower-profile': R(
    'mediator/downgrade attemptProof (lower-profile exit without a disclosed profile id)',
    '§21.3 (explicitly identified lower-assurance profile)',
    false
  ),
  'unnamed-channel': R(
    'mediator/downgrade attemptProof (channel-switch exit without a named channel)',
    '§21.3 (channel switch per a relying policy visible to both parties)',
    false
  ),

  // --- runtime-emitted: multi-issuer (X8) — verifyAggregated / makeAggregatedShow
  'duplicate-issuer-in-show': R(
    'multi-issuer verifyAggregated (per-show issuer-nullifier collision — A3 distinctness fails)',
    '§12.5 ("k pairwise-distinct members"); §5.12 scoped-reuse discipline at the issuer level',
    false
  ),
  'mixed-registry-roots': R(
    'multi-issuer verifyAggregated (members proved against different registry roots)',
    '§12.4; §26.1 bullet 10 (inconsistent snapshots)',
    false
  ),
  'k-outside-tier': R(
    'multi-issuer makeAggregatedShow / verifyAggregated (k not in the governed tier vocabulary)',
    '§10.4/§18.4 (a rare k fingerprints verifier and holder); governed tier vocabulary',
    false
  ),
  'k-member-mismatch': R(
    'multi-issuer makeAggregatedShow / verifyAggregated (declared k ≠ member count)',
    '§12.5 (the declared k is the member count)',
    false
  ),
  'nullifier-mismatch': R(
    'multi-issuer verifyAggregated (a distinctness nullifier does not recompute over THIS transcript digest)',
    '§15.2 domain separation (per-show issuer nullifiers; replay shape)',
    false
  ),
  'issuer-not-in-registry': R(
    'multi-issuer verifyAggregated (a member\'s issuer is outside the named snapshot)',
    '§12.4 (accepted issuer set at a named root)',
    false
  ),
  'invalid-membership-proof': R(
    'multi-issuer verifyAggregated (a member\'s inclusion digest does not recompute against the root)',
    '§12.4/§12.5 (membership gadget against the named root)',
    false
  ),
  'subject-commitment-mismatch': R(
    'multi-issuer verifyAggregated (members bind different subjects — A4 fails)',
    '§12.5 A4 (same subject commitment)',
    false
  ),
  'predicate-mismatch': R(
    'multi-issuer verifyAggregated (members attest different predicates)',
    '§12.5 A4 (one proposition — cross-predicate assembly is composition, X3)',
    false
  ),

  // --- runtime-emitted: guardian-recovery (X9) -------------------------------
  'guardian-threshold-not-met': R(
    'guardian-recovery recoverWithGuardians (fewer than t attestations presented)',
    'X9 t-of-n gate; §7.3 discipline (gate power lives at the profile layer)',
    false
  ),
  'guardian-epoch-lapsed': R(
    'guardian-recovery recoverWithGuardians (stale guardian set, or an attestation minted off the live epoch)',
    '§22.2 (guardianship expires; a stale set cannot attest a live recovery); §13.6',
    true,
    'A lapsed guardian epoch may be an overdue re-affirmation ceremony — a ' +
      'usability lapse the holder must be surfaced to fix (§6.8) — or an ' +
      'attacker replaying stale attestations; indistinguishable at the ' +
      'observable, so §13.6 routes it to challenge.'
  ),
  'duplicate-guardian-seat': R(
    'guardian-recovery recoverWithGuardians (guardian-nullifier collision — one seat per human per context+epoch)',
    '§6.5 (a count threshold is intentional in-context linkage); §13.6 by analogy',
    true,
    'The duplicate-edge parallel: a duplicated attestation in a bundle may be ' +
      'assembly error or a re-submission race, not a seat forgery; idempotent ' +
      'rejection is safe but MUST NOT be logged as malice.'
  ),
  'guardian-not-in-committed-set': R(
    'guardian-recovery recoverWithGuardians (attestation from outside the committed set)',
    'X9 committed guardian set (membership proved against the set commitment)',
    false
  ),
  'guardian-not-personhood-anchored': R(
    'guardian-recovery commitGuardianSet (a guardian without an admitted rt 01 enrolment)',
    '§11 (PR-PER), §13 (the Sybil-self-guardian kill happens at commit time)',
    false
  ),
  'contested-recovery': R(
    'guardian-recovery recoverWithGuardians / reissue (two bundles claim different newCommitments — frozen)',
    '§13.6, §23 (freeze re-issuance; the challenge route adjudicates)',
    true,
    'By design: the freeze exists BECAUSE honest holder and attacker are ' +
      'indistinguishable at the observable — adjudication, not the rejection, ' +
      'decides; treating either party as proven-malicious inverts §13.6.'
  ),
  'attestation-not-outcome-evidence': R(
    'guardian-recovery completionEvidence (an attestation/bundle/authorization is not a reissuance record)',
    'X9 ceremony rule; §7.3; §27.2 (the issuer\'s re-issuance is the outcome artifact)',
    false
  ),
});

// --- the eleven bullets, verbatim intent, mapped to their codes ---------------
// The coverage report (test F8) walks this table: a bullet with no vector is a
// GAP and is printed as one — the no-silent-caps rule. Hiding a gap would be
// exactly the silent re-deciding §26.1 exists to catch.
export const SECTION_26_1 = Object.freeze([
  Object.freeze({ bullet: 1, text: 'a valid proof over an expired, revoked, or unaccepted attestation', codes: Object.freeze(['expired-or-revoked-attestation']) }),
  Object.freeze({ bullet: 2, text: 'a verifier output implying biometric correctness', codes: Object.freeze(['overclaim-verifier-output']) }),
  // Bullet 3 (v1): the show-composition strings are the OPERATIONAL codes for
  // this family — a transplanted member IS replay into another transcript; a
  // partial show and an à-la-carte set violate the same atomicity the bullet
  // protects; a stale transcript is the freshness facet. The v0 placeholder
  // 'replay-cross-transcript' stays registered (append-only) but is superseded
  // by the runtime-emitted strings and carries no vectors.
  Object.freeze({ bullet: 3, text: 'replay into another verifier, context, purpose, scope, or transcript', codes: Object.freeze(['replay-cross-transcript', 'member-transcript-mismatch', 'partial-show-rejected', 'bundle-outside-registry', 'stale-transcript']) }),
  Object.freeze({ bullet: 4, text: 'reuse of a nullifier domain across distinct contexts', codes: Object.freeze(['nullifier-domain-reuse']) }),
  Object.freeze({ bullet: 5, text: 'an issuer-verifier-collusion-resistance claim with no defined adversary or test', codes: Object.freeze(['undocumented-collusion-claim']) }),
  Object.freeze({ bullet: 6, text: 'a schema containing an unjustified stable correlator', codes: Object.freeze(['unjustified-stable-correlator']) }),
  Object.freeze({ bullet: 7, text: 'a context expansion without version and migration', codes: Object.freeze(['context-expansion-without-version']) }),
  Object.freeze({ bullet: 8, text: 'a silent fallback to a lower-assurance or mediated path', codes: Object.freeze(['silent-fallback']) }),
  Object.freeze({ bullet: 9, text: 'acceptance of holder-key control as sufficient agent authority', codes: Object.freeze(['key-control-as-authority']) }),
  Object.freeze({ bullet: 10, text: 'inconsistent epoch or registry snapshots', codes: Object.freeze(['epoch-snapshot-inconsistent', 'stale-registry-snapshot']) }),
  Object.freeze({ bullet: 11, text: 'a disclosure claim that ignores observable events or accompanying fields', codes: Object.freeze(['disclosure-ignores-observables']) }),
]);

// --- v2: parameterized code FAMILIES ------------------------------------------
// A runtime that emits 'retention-violation:transcriptDigest' is naming ONE
// failure class with a parameter, not minting a new vocabulary item per field.
// Such codes register once, as a family: { prefix, parameterized: true, ... }.
// isKnownReason(code) matches a family iff code = prefix + <non-empty param>.
// Prefixes always end in ':' — and no family prefix is a prefix of another
// registered code or family (checked by test F10), so exact and family strata
// cannot collide.
// The family entry helper — the prefix itself is the key of the entry below
// and is stamped onto each entry after construction (single source of truth).
const F = (source, decisionDocRef, retryAmbiguous, note) =>
  note === undefined
    ? { parameterized: true, source, decisionDocRef, retryAmbiguous }
    : { parameterized: true, source, decisionDocRef, retryAmbiguous, note };

const FAMILY_DEFS = {
  // --- context-card (X2) — checkLegibility ----------------------------------
  'unrendered-field:': F(
    'context-card checkLegibility (field neither interpolated into a mapped question nor justified)',
    '§6.8 (six-question coverage; an omission must be RECORDED, never silent)',
    false
  ),
  'missing-narrow-language:': F(
    'context-card checkLegibility (q2/q3 lost the §5.12 verbatim narrow phrase)',
    '§5.12 mandatory narrow language ("scoped reuse detection")',
    false
  ),
  'broad-personhood-language:': F(
    'context-card checkLegibility (a question uses the forbidden broad personhood claim)',
    '§5.12; §24 (prohibited broad claims in user-facing text)',
    false
  ),

  // --- quiet-presentation (X4) — quiet + budget + logregister ---------------
  'unknown-internal-reason:': F(
    'quiet-presentation checkQuietTier (holder-routed code not in this register)',
    '§13.6 deterministic error semantics; X4 M-ERROR (holder-routed codes are register vocabulary)',
    false
  ),
  'prohibited-log-field:': F(
    'quiet-presentation validateLogSchema (a field on the prohibited list, even if registered)',
    '§6.6 (logs/telemetry restoring the prevented correlation); §10.4; §19',
    false
  ),
  'unregistered-log-field:': F(
    'quiet-presentation validateLogSchema (a logged field absent from the log-field register)',
    '§6.6; §18.1 register discipline extended to log fields; §23 (accountable surface)',
    false
  ),
  'missing-observer-row:': F(
    'quiet-presentation validateBudget (a §19 observer with no budget row)',
    '§19 (observer-by-observer analysis); §26.1 bullet 11 spirit (no silent rows)',
    false
  ),
  'unknown-observer:': F(
    'quiet-presentation validateBudget (a row for an observer outside the §19 list)',
    '§19 (the observer list is closed — show-composition OBSERVERS export)',
    false
  ),
  'incomplete-claim-form:': F(
    'quiet-presentation validateBudget (a row missing one of the three §2.4 parameters; param = <observer>:<parameter>)',
    '§2.4 (a claim missing one parameter "is not yet a testable claim")',
    false
  ),
  'empty-sees-claims-undetectability:': F(
    'quiet-presentation validateBudget (an empty sees-list would claim undetectability)',
    '§20 (unlinkability, not undetectability); §3.2 (observability elimination is out of scope)',
    false
  ),

  // --- rotation (X5) + guardian-recovery (X9) — clock-table validators ------
  'unbounded-clock:': F(
    'rotation validateClocks + guardian-recovery validateGuardianClocks — same bytes, dual emitters',
    '§22.2 ("permanent or unbounded" is non-conformant by default)',
    false
  ),
  'unknown-clock-family:': F(
    'rotation validateClocks + guardian-recovery validateGuardianClocks — same bytes, dual emitters',
    '§22.1 (two families: certification | erosion)',
    false
  ),
  'unknown-clock-toucher:': F(
    'rotation validateClocks + guardian-recovery validateGuardianClocks — same bytes, dual emitters',
    '§22.1; X5 M1 (routine vs catastrophic separation; X9 adds re-affirmation)',
    false
  ),

  // --- erosion-record (X6) — clocks.mjs validateSort ------------------------
  'missing-clock:': F(
    'erosion-record validateSort (a §22.1 clock absent from the sort)',
    '§22.1 (the ten clocks — the list is closed)',
    false
  ),
  'unsorted-clock:': F(
    'erosion-record validateSort (a clock present but with no or an invalid family)',
    '§22.1 two-family sort',
    false
  ),
  'unknown-clock:': F(
    'erosion-record validateSort (a clock not in §22.1)',
    '§22.1 (closed list)',
    false
  ),

  // --- erosion-record (X6) — record.mjs validateRecord ----------------------
  'claim-missing-parameter:': F(
    'erosion-record validateRecord (a §2.4 claim parameter absent; param = against_whom | for_how_long | alongside_what)',
    '§2.4',
    false
  ),
  'invalid-horizon-basis:': F(
    'erosion-record validateRecord (estimatedHorizon.basis outside declared|estimated; param = erosion[<i>])',
    'X6 honesty rule (HORIZON_BASES: declared | estimated; "measured" is a separate named failure)',
    false
  ),
  'missing-field:': F(
    'erosion-record validateRecord (a required Appendix-B field absent; param = field name)',
    '§26 residual-risk record (Appendix B compact boundary-record shape)',
    false
  ),
  'missing-clock-family:': F(
    'erosion-record validateRecord (for_how_long lacks a family; param = certification | erosion)',
    '§22.1 (both clock families, always)',
    false
  ),
  'erosion-missing-observables:': F(
    'erosion-record validateRecord (an erosion entry names no accumulating observables; param = erosion[<i>])',
    '§19/§20 (the observables feeding B_t must be named)',
    false
  ),
  'erosion-missing-monitoring-signal:': F(
    'erosion-record validateRecord (an erosion entry has no monitoring signal; param = erosion[<i>])',
    '§22.2 (nobody renews an erosion clock, so somebody must watch it)',
    false
  ),
  'erosion-missing-horizon:': F(
    'erosion-record validateRecord (an erosion entry has no estimated horizon; param = erosion[<i>])',
    '§5.9 (estimated horizon with an honest basis)',
    false
  ),
  'invalid-erosion-entry:': F(
    'erosion-record validateRecord (an erosion entry is not an object; param = erosion[<i>])',
    'X6 B2 record shape',
    false
  ),
  'invalid-record:': F(
    'erosion-record validateRecord / serializeRecord (record not an object, or refused a canonical form; param = defect list)',
    'Appendix B; §26 (a record that cannot state its clocks honestly gets no canonical form)',
    false
  ),

  // --- mediator (X7) --------------------------------------------------------
  'retention-violation:': F(
    'mediator checkForget (post-job state ≠ pre-job state beyond the frozen audit fields; param = field | session | unknown-field)',
    '§21.2 non-retention (P-FORGET); §6.6 (mediator-side correlators)',
    false
  ),
  'unknown-mediator-level:': F(
    'mediator makeProvingJob (level outside T0|T1 — T2 is a prohibition, not a level)',
    '§21.2 taxonomy',
    false
  ),
  'unknown-exit:': F(
    'mediator/downgrade attemptProof (relying policy names an exit outside the four §21.3 exits)',
    '§21.3 (exactly four exits from LOCAL-PROVING-FAILED)',
    false
  ),

  // --- multi-issuer (X8) ----------------------------------------------------
  'stale-epsilon:': F(
    'multi-issuer verifyAggregated / aggregateBound (a member\'s ε past its assurance horizon at the explicit now; param = issuerId)',
    '§12.5 A2 via the independence register; X6 certification clock (an audit establishes ε and it erodes)',
    true,
    'A stale ε is the stale-registry-snapshot shape one layer up: the re-audit ' +
      'may be scheduled but not yet landed — an accreditation refresh race, ' +
      'not evidence the issuer went bad; §13.6 routes it to challenge.'
  ),
};

export const REASON_FAMILIES = Object.freeze(Object.fromEntries(
  Object.entries(FAMILY_DEFS).map(([prefix, def]) => [prefix, Object.freeze({ prefix, ...def })])
));

// --- v2: convergences ----------------------------------------------------------
// Strings emitted by MORE THAN ONE module (or by a module AND mandated by
// §26.1) are ONE register entry; the emitters are recorded here so the seam is
// auditable. Byte-exactness across emitters is test F11's job. The
// 'silent-fallback' entry above is the v1 §26.1-bullet-8 entry, byte-identical
// (append-only discipline); this table — not an edit to that entry — is where
// its second source lives.
export const CONVERGENCES = Object.freeze([
  Object.freeze({
    code: 'silent-fallback',
    emitters: Object.freeze([
      'decision-doc §26.1 bullet 8 (v1 entry — unchanged)',
      'mediator/downgrade.mjs validateTransition (a transition not visible to both parties)',
    ]),
  }),
  Object.freeze({
    code: 'unknown-enrolment',
    emitters: Object.freeze([
      'rotation/rotation.mjs recover',
      'guardian-recovery/guardians.mjs recoverWithGuardians + reissue (reused byte-exact by design)',
    ]),
  }),
  Object.freeze({
    code: 'unbounded-clock:',
    emitters: Object.freeze([
      'rotation/rotation.mjs validateClocks',
      'guardian-recovery/guardians.mjs validateGuardianClocks',
    ]),
  }),
  Object.freeze({
    code: 'unknown-clock-family:',
    emitters: Object.freeze([
      'rotation/rotation.mjs validateClocks',
      'guardian-recovery/guardians.mjs validateGuardianClocks',
    ]),
  }),
  Object.freeze({
    code: 'unknown-clock-toucher:',
    emitters: Object.freeze([
      'rotation/rotation.mjs validateClocks',
      'guardian-recovery/guardians.mjs validateGuardianClocks',
    ]),
  }),
]);

const FAMILY_PREFIXES = Object.freeze(Object.keys(REASON_FAMILIES));

// Exact match against REASONS, or a family match: prefix + non-empty parameter.
export function isKnownReason(code) {
  if (Object.prototype.hasOwnProperty.call(REASONS, code)) return true;
  if (typeof code !== 'string') return false;
  return FAMILY_PREFIXES.some((p) => code.startsWith(p) && code.length > p.length);
}
