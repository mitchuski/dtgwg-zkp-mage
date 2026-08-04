// Fixture extraction — property tests frozen as data. (X1 milestone M3.)
//
// Every vector below is emitted by RUNNING the actual constructions (runtimes
// 01 and 07) and asserting the observed verdict before serializing it: a
// fixture this file writes is a fixture this lab has already reproduced. If a
// runtime changes behaviour, extraction throws — the suite cannot silently
// drift from the code it froze.
//
// Canonical encodings are the spine (X1 commitment 1): wherever a context is
// involved, the vector carries a full §6.2 context descriptor and the context
// *string* fed to the construction is that descriptor's digest — never an
// opaque verifier-chosen label. rt 01 presentations additionally carry a §15.2
// canonical transcript bound to the descriptor digest, so each vector tests
// the predicate AND the encoding at once.
//
// Determinism (§25 "deterministic test-vector support"): every input below is
// a fixed literal — fixed humanIds, fixed salts, fixed nonces, a fixed expiry
// STRING (a fixture constant, not a clock read). No Date.now(), no randomness.
// Running extraction twice must produce byte-identical files (test F1 proves
// it across two separate processes).
//
// Run: node extract.mjs [--out <dir>]   (default: ./vectors)

import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { descriptorDigest, transcriptDigest, validateDescriptor } from '../canonical/canonical.mjs';
import { enrol, nullifier, ContextRegistry } from '../01-uniqueness-nullifier/src/nullifier.mjs';
import {
  joinCommunity, encounter, Mage, Swordsman, TrustGraph, dreamCycleTurn, roster,
} from '../07-trust-graph-formation/src/trust-graph.mjs';
import { REGISTRY } from '../show-composition/bundles.mjs';
import { makeShow, verifyShow, memberCommitment } from '../show-composition/show.mjs';
import { renderCard, diffCards } from '../context-card/card.mjs';
import { validateVector, SCHEMA_VERSION } from './schema.mjs';
import { REASON_REGISTER_VERSION } from './reasons.mjs';
import { lintVerifierOutput } from './lint.mjs';
import { runVector } from './consume.mjs';

const DECISION_DOC = '0.1.0-draft';

// Extraction self-check: never emit an expectation the construction did not
// just produce in front of us.
const must = (cond, msg) => {
  if (!cond) throw new Error(`extraction-self-check-failed: ${msg}`);
};

// --- governed contexts (§6.2 descriptors — full, never opaque strings) --------
// Two service contexts under one authority (the cross-context pair) and one
// community context for trust-graph formation. Plausible, fully-populated
// governed descriptors in the canonical field set.
const DESC_ALPHA = {
  protocol: 'dtg-zkp/0.1',
  profile: 'epp/1',
  contextAuthority: 'authority:fixture-vtc',
  contextPolicy: 'policy:one-account/1',
  purpose: 'purpose:account-registration',
  scope: 'scope:service-alpha',
  verifierSet: 'verifiers:service-alpha-registrars',
  epoch: 'epoch:2026-07',
  epochPolicy: 'rollover:30d',
  nullifierVersion: 'dtg-zkp/nullifier/v0',
  retentionPolicy: 'retention:35d',
};
const DESC_BETA = {
  ...DESC_ALPHA,
  contextPolicy: 'policy:one-listing-account/1',
  purpose: 'purpose:marketplace-registration',
  scope: 'scope:service-beta',
  verifierSet: 'verifiers:service-beta-registrars',
};
const DESC_VTC = {
  ...DESC_ALPHA,
  contextPolicy: 'policy:community-membership/1',
  purpose: 'purpose:trust-graph-formation',
  scope: 'scope:vtc-alpha',
  verifierSet: 'verifiers:vtc-alpha-swordsmen',
};

// §15.2 canonical transcript for a presentation in a governed context. The
// expiry is a fixture constant (a boundary the vector pins), not wall clock.
const transcriptFor = (desc, verifier, n) => ({
  protocol: desc.protocol,
  profile: desc.profile,
  verifier,
  contextDescriptorDigest: descriptorDigest(desc),
  purpose: desc.purpose,
  scope: desc.scope,
  challenge: `nonce:fixture-${n}`,
  sessionId: `session:fixture-${n}`,
  requestedPredicates: ['PR-UNQ', 'PR-FRE'],
  policyRequirements: 'assurance>=L2',
  expiry: '2026-08-01T00:00:00Z/clock:ntp-60s',
  snapshotRequirements: 'root-age<=24h',
  encodingVersion: 'dtg-zkp/canonical/v0',
});

// §2.4 claim parameters — mandatory on every vector or it "is not yet a
// testable claim" (and so not yet a fixture).
const CLAIM_UNQ = {
  againstWhom:
    'the verifier set of this governed context (verifiers:service-*-registrars); ' +
    'issuer-verifier collusion NOT claimed resisted — EPP trade curve per §2.3',
  forHowLong:
    'one epoch (epoch:2026-07) under rollover:30d; reliance ends at epoch ' +
    'rollover or enrolment-root cryptoperiod end (§10.6 horizon discipline)',
  alongsideWhat:
    'the canonical §15.2 transcript only — credential fields, registry ' +
    'traffic, timing and network metadata are OUT of this reference model ' +
    'and re-open the analysis when present (§2.6)',
};
const CLAIM_TGF = {
  againstWhom:
    'other community members and the community verifier set; the counterparty ' +
    'is assumed adversarial (user-as-adversary stance); proposer/prover ' +
    'non-collusion per the Gap',
  forHowLong:
    'the life of the VRC edge within epoch:2026-07; membership pseudonyms ' +
    'roll with the community epoch policy',
  alongsideWhat:
    'the serialized candidate and prior signed edges only; encounter timing ' +
    'and out-of-band channels are out of model (§2.6)',
};
const CLAIM_LIV = {
  againstWhom:
    'the verifier set of the governed context; the attestation issuer is ' +
    'relied on for issuance only — issuer accountability is §10.5, never ' +
    'transferred to the proof',
  forHowLong:
    'until attestation validUntil or a status revocation, whichever first ' +
    '(§10.1); never past the §10.6 cryptoperiod horizon',
  alongsideWhat:
    'the minimal attestation status fields carried in this vector only; full ' +
    'status-list and accreditation-snapshot constructions are runtime-02 ' +
    'future work (§2.6)',
};
const CLAIM_SHW = {
  againstWhom:
    'the §19 observer list of the show — verifier, issuer, colluding sets, ' +
    'mediated prover, network observer (X3 joint disclosure record)',
  forHowLong:
    'the transcript session; the PR-UNQ member linkage persists for the ' +
    'context epoch and dominates the session-lived members (X3 M3)',
  alongsideWhat:
    'the other member proofs of the same governed bundle, explicitly ' +
    'enumerated — the joint boundary is wider than the union of the members ' +
    '(§2.6; X3 M1 worksheet)',
};
const CLAIM_CTX = {
  againstWhom:
    'current AND future members of the recognition set — a widened ' +
    'verifierSet is a new against-whom, which is exactly why silent widening ' +
    'is forbidden (§6.6, §6.7)',
  forHowLong:
    'the epoch and retention windows the context card renders (q3); a ' +
    'migration record marks where the old window\'s meaning ends',
  alongsideWhat:
    'the §6.8 context card derived from the same descriptor digest the ' +
    'transcript binds, so description and configuration cannot diverge (§26)',
};
const CLAIM_FLB = {
  againstWhom:
    'the mediated prover as an ADDITIONAL observer of the proving event ' +
    '(§21.2) — the exact observer a silent fallback hides',
  forHowLong:
    'the mediation event; mediator non-retention rules apply thereafter (§21.2)',
  alongsideWhat:
    'the §15.2 transcript whose optional provingMode field is the declaration ' +
    'surface — an absent field is an undeclared observer (§21, §27.4)',
};
const CLAIM_EPO = {
  againstWhom:
    'the governed verifier set relying on shared registry state; a stale or ' +
    'contradictory snapshot shifts what "current" means between verifiers (§12.4)',
  forHowLong:
    'one epoch under the descriptor\'s epochPolicy; snapshot validity per the ' +
    'transcript\'s snapshotRequirements root-age bound (§12.4)',
  alongsideWhat:
    'the §15.2 transcript, the carried registry snapshot, and the §6.2 ' +
    'descriptor\'s epoch fields (§12.4; §13.6 epoch disagreement)',
};
const CLAIM_LINT = {
  againstWhom:
    'any reader of the verifier output — end users, auditors, downstream ' +
    'relying parties who inherit the overclaim',
  forHowLong: 'for as long as the output text is displayed, logged, or quoted',
  alongsideWhat:
    'the §9 "must not infer" register and the §24 prohibited-claims list the ' +
    'text is linted against (lint list v0, English only — §27.4 shared artefact)',
};

const vec = (fixture, sections, claimParams, inputs, expect) => ({
  fixture,
  spec: { decisionDoc: DECISION_DOC, sections },
  claimParams,
  inputs,
  expect,
});

// =============================================================================
// Build every vector by running the constructions.
// =============================================================================
export function buildVectors() {
  const vectors = [];

  // --------------------------------------------------------------------------
  // PR-UNQ — runtime 01 (uniqueness nullifier).
  // --------------------------------------------------------------------------
  const alice = enrol('human:fixture-alice');
  const ctxAlpha = descriptorDigest(DESC_ALPHA);
  const ctxBeta = descriptorDigest(DESC_BETA);
  const nAliceAlpha = nullifier(alice.secret, ctxAlpha);
  const nAliceBeta = nullifier(alice.secret, ctxBeta);

  // accept — first presentation in a fresh context registry (rt 01 P4a).
  {
    const reg = new ContextRegistry(ctxAlpha);
    const res = reg.present(nAliceAlpha);
    must(res.admitted === true && res.reason === 'first-enrolment', 'PR-UNQ accept');
    const transcript = transcriptFor(DESC_ALPHA, 'verifier:service-alpha-gate', '0001');
    vectors.push(vec(
      'PR-UNQ/accept/first-enrolment/001',
      ['§13', '§5.12', '§6.2', '§15.2', '§26'],
      CLAIM_UNQ,
      {
        contextDescriptor: DESC_ALPHA,
        transcript,
        transcriptDigest: transcriptDigest(transcript),
        subject: { humanId: 'human:fixture-alice' },
        priorPresentations: [],
        nullifier: nAliceAlpha,
      },
      { outcome: 'accept' }
    ));
  }

  // reject — the P4 self-Sybil negative: the SAME human's second account in
  // the SAME context. §26.1's spirit made concrete; §13.6 marks the reason
  // retry-ambiguous, hence the claim ceiling.
  {
    const reg = new ContextRegistry(ctxAlpha);
    must(reg.present(nAliceAlpha).admitted === true, 'PR-UNQ reject precondition');
    const res = reg.present(nAliceAlpha);
    must(res.admitted === false && res.reason === 'duplicate-human-in-context', 'PR-UNQ reject');
    const transcript = transcriptFor(DESC_ALPHA, 'verifier:service-alpha-gate', '0002');
    vectors.push(vec(
      'PR-UNQ/reject/duplicate-human-in-context/001',
      ['§13', '§13.6', '§26.1'],
      CLAIM_UNQ,
      {
        contextDescriptor: DESC_ALPHA,
        transcript,
        transcriptDigest: transcriptDigest(transcript),
        subject: { humanId: 'human:fixture-alice' },
        priorPresentations: ['human:fixture-alice'],
        nullifier: nAliceAlpha,
      },
      {
        outcome: 'reject',
        reason: 'duplicate-human-in-context',
        claimCeiling:
          'scoped reuse detection (§5.12) — not one unique human, and per ' +
          '§13.6 not proof of malice: retry, race, recovery, and epoch ' +
          'disagreement produce the same observable',
      }
    ));
  }

  // accept — the cross-context pair (rt 01 P2 + P5): same human, two governed
  // contexts, DIFFERENT unlinkable nullifiers, and the second context admits
  // her. This is §26's mandatory cross-context vector class; it demonstrates
  // the accept side of nullifier-domain separation (§26.1 bullet 4's reject
  // side is a reported gap — rt 01's registry has no domain check to trip).
  {
    must(nAliceAlpha !== nAliceBeta, 'cross-context nullifiers differ');
    const regA = new ContextRegistry(ctxAlpha);
    regA.present(nAliceAlpha);
    const regB = new ContextRegistry(ctxBeta);
    const res = regB.present(nAliceBeta);
    must(res.admitted === true, 'cross-context admit');
    vectors.push(vec(
      'PR-UNQ/accept/cross-context-unlinkable/001',
      ['§2.3', '§13', '§26', '§26.1'],
      CLAIM_UNQ,
      {
        crossContext: true,
        subject: { humanId: 'human:fixture-alice' },
        descriptorA: DESC_ALPHA,
        descriptorB: DESC_BETA,
        nullifierA: nAliceAlpha,
        nullifierB: nAliceBeta,
      },
      { outcome: 'accept' }
    ));
  }

  // --------------------------------------------------------------------------
  // PR-TGF — runtime 07 (trust-graph formation). Exploration-local family id;
  // the community context string is the §6.2 digest of DESC_VTC.
  // --------------------------------------------------------------------------
  const community = descriptorDigest(DESC_VTC);
  const f1 = joinCommunity('human:fixture-1', community);
  const f2 = joinCommunity('human:fixture-2', community);
  const f3 = joinCommunity('human:fixture-3', community);
  const f4 = joinCommunity('human:fixture-4', community); // deliberately unanchored
  const rosterHumanIds = ['human:fixture-1', 'human:fixture-2', 'human:fixture-3'];
  const members = roster([f1, f2, f3]);

  const TGF = (name, sections, inputs, expect) =>
    vec(`PR-TGF/${expect.outcome === 'accept' ? 'accept' : 'reject'}/${name}/001`,
      sections, CLAIM_TGF,
      { communityDescriptor: DESC_VTC, rosterHumanIds, ...inputs }, expect);

  // accept — mutual consent, anchored endpoints, honest commitment (G1b).
  {
    const cand = Mage.propose(f1, f2, encounter(f1, f2, 'salt:fixture-meet-accept'), true, true);
    const verdict = Swordsman(members, new TrustGraph()).prove(cand);
    must(verdict.signed === true, 'PR-TGF accept');
    vectors.push(TGF('mutual-consent-edge', ['§25', '§26'],
      { candidate: cand }, { outcome: 'accept' }));
  }

  // reject — unilateral consent (G1a): the shared graph grows ONLY on mutual consent.
  {
    const cand = Mage.propose(f1, f2, encounter(f1, f2, 'salt:fixture-meet-uni'), true, false);
    const verdict = Swordsman(members, new TrustGraph()).prove(cand);
    must(!verdict.signed && verdict.reason === 'unilateral-no-mutual-consent', 'PR-TGF unilateral');
    vectors.push(TGF('unilateral-no-mutual-consent', ['§26.1'],
      { candidate: cand },
      { outcome: 'reject', reason: 'unilateral-no-mutual-consent' }));
  }

  // reject — self-edge (G3): a VRC with oneself is self-Sybil, not a relationship.
  {
    const cand = Mage.propose(f1, f1, encounter(f1, f1, 'salt:fixture-meet-self'), true, true);
    const verdict = Swordsman(members, new TrustGraph()).prove(cand);
    must(!verdict.signed && verdict.reason === 'self-edge-forbidden', 'PR-TGF self-edge');
    vectors.push(TGF('self-edge-forbidden', ['§13', '§26.1'],
      { candidate: cand },
      { outcome: 'reject', reason: 'self-edge-forbidden' }));
  }

  // reject — forged VRC commitment (G7, the Gap): the prover recomputes,
  // never trusts the proposer's claimed commitment.
  {
    const cand = Mage.propose(f1, f2, encounter(f1, f2, 'salt:fixture-meet-forge'), true, true);
    cand.claimedVrc = 'f'.repeat(64); // deterministic forgery
    const verdict = Swordsman(members, new TrustGraph()).prove(cand);
    must(!verdict.signed && verdict.reason === 'vrc-commitment-forged', 'PR-TGF forged');
    vectors.push(TGF('vrc-commitment-forged', ['§2.6', '§25', '§26.1'],
      { candidate: cand },
      { outcome: 'reject', reason: 'vrc-commitment-forged' }));
  }

  // reject — unanchored endpoint (G2): both endpoints must be personhood-
  // anchored members of the community view.
  {
    const cand = Mage.propose(f1, f4, encounter(f1, f4, 'salt:fixture-meet-anchor'), true, true);
    const verdict = Swordsman(members, new TrustGraph()).prove(cand);
    must(!verdict.signed && verdict.reason === 'endpoint-not-personhood-anchored', 'PR-TGF anchor');
    vectors.push(TGF('endpoint-not-personhood-anchored', ['§11', '§26.1'],
      { candidate: cand },
      { outcome: 'reject', reason: 'endpoint-not-personhood-anchored' }));
  }

  // reject — R-DID mismatch (G4 uniqueness): the candidate must carry the
  // fresh per-counterparty R-DIDs; swapping them is a reuse attempt.
  {
    const cand = Mage.propose(f1, f2, encounter(f1, f2, 'salt:fixture-meet-rdid'), true, true);
    const swapped = { ...cand, rdidA: cand.rdidB, rdidB: cand.rdidA };
    const verdict = Swordsman(members, new TrustGraph()).prove(swapped);
    must(!verdict.signed && verdict.reason === 'r-did-mismatch', 'PR-TGF rdid');
    vectors.push(TGF('r-did-mismatch', ['§26.1'],
      { candidate: swapped },
      { outcome: 'reject', reason: 'r-did-mismatch' }));
  }

  // reject — duplicate edge (G6): one VRC per pair; the pre-state (the already
  // signed edge) travels in the vector so the consumer reconstructs the graph.
  {
    const g = new TrustGraph();
    const first = dreamCycleTurn(members, g, f1, f2, 'salt:fixture-e12', true, true);
    must(first.grew === true, 'PR-TGF duplicate precondition');
    const cand = Mage.propose(f1, f2, encounter(f1, f2, 'salt:fixture-e12-retry'), true, true);
    const verdict = Swordsman(members, g).prove(cand);
    must(!verdict.signed && verdict.reason === 'duplicate-edge', 'PR-TGF duplicate');
    vectors.push(TGF('duplicate-edge', ['§13.6', '§26'],
      { existingEdges: [first.edge], candidate: cand },
      { outcome: 'reject', reason: 'duplicate-edge' }));
  }

  // --------------------------------------------------------------------------
  // PR-UNQ v1 — §26.1 bullet 4 reject side + bullet 6 (descriptor schema).
  // --------------------------------------------------------------------------

  // reject — nullifier-domain reuse (bullet 4): the presented nullifier was
  // computed under descriptor ALPHA but the transcript binds descriptor BETA.
  // The consumer recomputes under the BOUND context and the mismatch (with
  // non-epoch fields differing) is named. Extraction verifies the facet here.
  {
    const transcript = transcriptFor(DESC_BETA, 'verifier:service-beta-gate', '0003');
    must(nullifier(alice.secret, ctxBeta) !== nAliceAlpha, 'domain-reuse mismatch holds');
    vectors.push(vec(
      'PR-UNQ/reject/nullifier-domain-reuse/001',
      ['§2.3', '§13', '§26.1'],
      CLAIM_UNQ,
      {
        contextDescriptor: DESC_BETA,
        presentedUnderDescriptor: DESC_ALPHA,
        transcript,
        transcriptDigest: transcriptDigest(transcript),
        subject: { humanId: 'human:fixture-alice' },
        nullifier: nAliceAlpha,
      },
      {
        outcome: 'reject',
        reason: 'nullifier-domain-reuse',
        claimCeiling:
          'a nullifier is meaningful only under the context descriptor whose ' +
          'digest fed it (§2.3); presenting it under another governed context ' +
          'is domain reuse, not evidence about the presenter',
      }
    ));
  }

  // reject — unjustified stable correlator (bullet 6): a descriptor carrying
  // an extra field (stableHolderTag) the §6.2 register never justified. The
  // canonical layer's validateDescriptor rejecting unknown fields IS the
  // check; extraction asserts the rejection it is about to freeze.
  {
    const tagged = { ...DESC_ALPHA, stableHolderTag: 'holder:global-tag-77' };
    const check = validateDescriptor(tagged);
    must(!check.ok && check.unknown.includes('stableHolderTag'), 'stable correlator rejected');
    vectors.push(vec(
      'PR-UNQ/reject/unjustified-stable-correlator/001',
      ['§6.2', '§24', '§26.1'],
      CLAIM_UNQ,
      {
        descriptorCheck: true,
        contextDescriptor: tagged,
        subject: { humanId: 'human:fixture-alice' },
      },
      {
        outcome: 'reject',
        reason: 'unjustified-stable-correlator',
        claimCeiling:
          'the §6.2 field register is closed: every descriptor field is ' +
          'governed or justified-optional; an unregistered field is a stable ' +
          'correlator until proven otherwise (§24)',
      }
    ));
  }

  // accept — the justified counterpart: registryDomain is the one OPTIONAL
  // field §6.2 admits ("where relevant"); a descriptor carrying it validates,
  // digests, and admits a first presentation.
  {
    const withOptional = { ...DESC_ALPHA, registryDomain: 'registry:fixture-accreditation' };
    must(validateDescriptor(withOptional).ok, 'optional field validates');
    const ctxOpt = descriptorDigest(withOptional);
    const nOpt = nullifier(alice.secret, ctxOpt);
    must(new ContextRegistry(ctxOpt).present(nOpt).admitted === true, 'optional-field accept');
    vectors.push(vec(
      'PR-UNQ/accept/justified-optional-field/001',
      ['§6.2', '§24', '§26'],
      CLAIM_UNQ,
      {
        descriptorCheck: true,
        contextDescriptor: withOptional,
        subject: { humanId: 'human:fixture-alice' },
        nullifier: nOpt,
      },
      { outcome: 'accept' }
    ));
  }

  // --------------------------------------------------------------------------
  // PR-LIV — §26.1 bullet 1: attestation lifecycle (semantic vectors).
  // Minimal model {issuer, validFrom, validUntil, status} + EXPLICIT now
  // (epoch seconds, a fixture constant — no clock). The full attestation
  // construction (status lists, accreditation snapshots) is rt 02 future
  // work; these vectors freeze the bullet-1 DECISION.
  // --------------------------------------------------------------------------
  {
    const ACCEPTED_ISSUERS = ['issuer:accredited-liveness-1', 'issuer:accredited-liveness-2'];
    const NOW_ATT = 1752750000; // explicit evaluation time for every PR-LIV vector
    const att = (fixture, attestation, expect) =>
      vec(fixture, ['§10.1', '§10.6', '§26.1'], CLAIM_LIV,
        { attestation, acceptedIssuers: ACCEPTED_ISSUERS, now: NOW_ATT }, expect);
    const CEIL_1 =
      'a proof over an attestation is only as alive as the attestation: ' +
      'validity window, status, and issuer acceptance are checked at ' +
      'presentation time, never assumed from proof validity (§10.1)';

    vectors.push(att('PR-LIV/reject/expired-or-revoked-attestation/001',
      { issuer: 'issuer:accredited-liveness-1', validFrom: 1740000000, validUntil: 1750000000, status: 'active' },
      { outcome: 'reject', reason: 'expired-or-revoked-attestation', claimCeiling: CEIL_1 })); // expired
    vectors.push(att('PR-LIV/reject/expired-or-revoked-attestation/002',
      { issuer: 'issuer:accredited-liveness-1', validFrom: 1740000000, validUntil: 1760000000, status: 'revoked' },
      { outcome: 'reject', reason: 'expired-or-revoked-attestation', claimCeiling: CEIL_1 })); // revoked
    vectors.push(att('PR-LIV/reject/expired-or-revoked-attestation/003',
      { issuer: 'issuer:unaccredited-labs', validFrom: 1740000000, validUntil: 1760000000, status: 'active' },
      { outcome: 'reject', reason: 'expired-or-revoked-attestation', claimCeiling: CEIL_1 })); // unaccepted
    vectors.push(att('PR-LIV/accept/valid-attestation/001',
      { issuer: 'issuer:accredited-liveness-1', validFrom: 1740000000, validUntil: 1760000000, status: 'active' },
      { outcome: 'accept' }));
  }

  // --------------------------------------------------------------------------
  // PR-SHW — §26.1 bullet 3 family, run through the REAL show-composition
  // verifier. Exploration-local family id (like PR-TGF; flagged in NOTES).
  // Every expected reason below is a string show.mjs itself emits, absorbed
  // verbatim into register v1.
  // --------------------------------------------------------------------------
  {
    const SHOW_EXPIRY = 1800000000; // explicit epoch-seconds boundary
    const NOW_SHOW = 1752750000; //    < expiry: fresh
    const showBase = {
      bundleId: 'EPP-UNIQ',
      bundleVersion: '1',
      descriptor: DESC_ALPHA,
      verifier: 'verifier:service-alpha-gate',
      challenge: 'nonce:fixture-shw-a',
      sessionId: 'session:fixture-shw-a',
      expiry: SHOW_EXPIRY,
      registry: REGISTRY,
    };
    const mA = makeShow(showBase);
    const mB = makeShow({ ...showBase, challenge: 'nonce:fixture-shw-b', sessionId: 'session:fixture-shw-b' });
    must(mA.ok && mB.ok, 'PR-SHW shows build');
    const shw = (fixture, sections, inputs, expect) =>
      vec(fixture, sections, CLAIM_SHW, inputs, expect);

    // accept — the complete EPP-UNIQ show verifies fresh and whole.
    must(verifyShow(mA.show, REGISTRY, NOW_SHOW).ok === true, 'PR-SHW accept');
    vectors.push(shw('PR-SHW/accept/complete-show/001', ['§15.2', '§26'],
      { show: mA.show, now: NOW_SHOW }, { outcome: 'accept' }));

    // reject — transplant: a member built for show B's transcript grafted
    // into show A. Replay into another transcript, §26.1 bullet 3 verbatim.
    const grafted = {
      ...mA.show,
      members: mA.show.members.map((m) =>
        m.predicate === 'PR-FRE' ? mB.show.members.find((x) => x.predicate === 'PR-FRE') : m),
    };
    must(verifyShow(grafted, REGISTRY, NOW_SHOW).reason === 'member-transcript-mismatch', 'PR-SHW transplant');
    vectors.push(shw('PR-SHW/reject/member-transcript-mismatch/001', ['§15.1', '§15.2', '§26.1'],
      { show: grafted, now: NOW_SHOW },
      {
        outcome: 'reject',
        reason: 'member-transcript-mismatch',
        claimCeiling:
          'a member proof is evidence only inside the one transcript it is ' +
          'bound to; under any other transcript it is a replay (§15.1)',
      }));

    // reject — partial show: one member missing; atomicity (bullet 3 family).
    const partial = { ...mA.show, members: mA.show.members.filter((m) => m.predicate !== 'PR-ISS') };
    must(verifyShow(partial, REGISTRY, NOW_SHOW).reason === 'partial-show-rejected', 'PR-SHW partial');
    vectors.push(shw('PR-SHW/reject/partial-show-rejected/001', ['§15.2', '§26.1'],
      { show: partial, now: NOW_SHOW },
      { outcome: 'reject', reason: 'partial-show-rejected' }));

    // reject — à-la-carte: a predicate set that is no registered bundle,
    // smuggled under a real bundleId. Cipher-suite discipline (§18.3).
    const alacartePreds = ['PR-LIV', 'PR-FRE'];
    const forgedTranscript = { ...mA.show.transcript, requestedPredicates: alacartePreds };
    const forgedDigest = transcriptDigest(forgedTranscript);
    const forged = {
      bundleId: 'EPP-UNIQ',
      bundleVersion: '1',
      transcript: forgedTranscript,
      transcriptDigest: forgedDigest,
      members: alacartePreds.map((p) => ({
        predicate: p,
        transcriptDigest: forgedDigest,
        commitment: memberCommitment(p, forgedDigest),
      })),
    };
    must(verifyShow(forged, REGISTRY, NOW_SHOW).reason === 'bundle-outside-registry', 'PR-SHW alacarte');
    vectors.push(shw('PR-SHW/reject/bundle-outside-registry/001', ['§18.3', '§26.1'],
      { show: forged, now: NOW_SHOW },
      { outcome: 'reject', reason: 'bundle-outside-registry' }));

    // reject — stale transcript: the same complete show evaluated past its
    // expiry under an EXPLICIT later now. Retry-ambiguous (§13.6 clock skew).
    must(verifyShow(mA.show, REGISTRY, SHOW_EXPIRY + 1).reason === 'stale-transcript', 'PR-SHW stale');
    vectors.push(shw('PR-SHW/reject/stale-transcript/001', ['§15.2', '§13.6', '§26.1'],
      { show: mA.show, now: SHOW_EXPIRY + 1 },
      {
        outcome: 'reject',
        reason: 'stale-transcript',
        claimCeiling:
          'staleness is a property of the transcript under the verifier\'s ' +
          'declared clock rules, not proof of replay — §13.6 routes it to ' +
          'challenge, never to a malice log',
      }));
  }

  // --------------------------------------------------------------------------
  // PR-CTX — §26.1 bullet 7: context expansion without version and migration.
  // Both descriptors render through the real context-card instrument;
  // diffCards judges the widened verifierSet an expansion. Without a
  // migration record naming both derived card versions the change is the
  // silent expansion §24 forbids; with it, the same expansion is compliant.
  // --------------------------------------------------------------------------
  {
    const DESC_WIDE = {
      ...DESC_ALPHA,
      verifierSet: 'verifiers:service-alpha-registrars+partner-network',
    };
    const cardBefore = renderCard(DESC_ALPHA);
    const cardAfter = renderCard(DESC_WIDE);
    const diff = diffCards(cardBefore, cardAfter);
    must(diff.expansion === true, 'PR-CTX widened verifierSet is an expansion');
    const ctxInputs = { descriptorBefore: DESC_ALPHA, descriptorAfter: DESC_WIDE };

    vectors.push(vec('PR-CTX/reject/context-expansion-without-version/001',
      ['§6.6', '§6.7', '§24', '§26.1'], CLAIM_CTX,
      { ...ctxInputs },
      {
        outcome: 'reject',
        reason: 'context-expansion-without-version',
        claimCeiling:
          'a recognition set may widen only as a versioned, migrated change ' +
          '(§6.7 material privacy change); the card re-versions with the ' +
          'digest, and the migration record is the missing half',
      }));

    vectors.push(vec('PR-CTX/accept/context-expansion-with-migration/001',
      ['§6.6', '§6.7', '§26'], CLAIM_CTX,
      {
        ...ctxInputs,
        migration: {
          fromCardVersion: cardBefore.version,
          toCardVersion: cardAfter.version,
          note:
            'verifierSet widened to include partner-network registrars; §6.7 ' +
            'material-privacy-change notice issued; consent re-collected at ' +
            'next presentation; prior-epoch nullifiers are NOT migrated into ' +
            'the widened recognition set',
        },
      },
      { outcome: 'accept' }));
  }

  // --------------------------------------------------------------------------
  // PR-FLB — §26.1 bullet 8: silent fallback. The vector declares mediated
  // proving OCCURRED; the transcript either carries the §15.2-optional
  // provingMode declaration (§21) or it does not. Semantic vectors — the
  // mediated prover itself is future runtime work.
  // --------------------------------------------------------------------------
  {
    const MEDIATED = 'mediated:prover:relay-1';

    const tSilent = transcriptFor(DESC_ALPHA, 'verifier:service-alpha-gate', 'flb-1');
    must(tSilent.provingMode === undefined, 'PR-FLB silent transcript has no provingMode');
    vectors.push(vec('PR-FLB/reject/silent-fallback/001',
      ['§21', '§27.4', '§26.1'], CLAIM_FLB,
      {
        contextDescriptor: DESC_ALPHA,
        transcript: tSilent,
        transcriptDigest: transcriptDigest(tSilent),
        proving: { mediated: true, mode: MEDIATED },
      },
      {
        outcome: 'reject',
        reason: 'silent-fallback',
        claimCeiling:
          'mediation adds an observer (§21.2); a transcript that does not ' +
          'declare the proving mode hides that observer from the §2.4 record ' +
          '— the fallback itself may be legitimate, its silence is not',
      }));

    const tDeclared = {
      ...transcriptFor(DESC_ALPHA, 'verifier:service-alpha-gate', 'flb-2'),
      provingMode: MEDIATED,
    };
    vectors.push(vec('PR-FLB/accept/declared-mediated-proving/001',
      ['§21', '§21.2', '§26'], CLAIM_FLB,
      {
        contextDescriptor: DESC_ALPHA,
        transcript: tDeclared,
        transcriptDigest: transcriptDigest(tDeclared),
        proving: { mediated: true, mode: MEDIATED },
      },
      { outcome: 'accept' }));
  }

  // --------------------------------------------------------------------------
  // PR-EPO — §26.1 bullet 10, both facets, each code used at least once.
  // --------------------------------------------------------------------------
  {
    const NOW_EPO = 1752750000; // explicit evaluation time (epoch seconds)

    // reject — epoch facet: the presented nullifier was computed under the
    // JUNE epoch of the same context while the transcript binds the JULY
    // descriptor. Descriptors differ ONLY in epoch → the inconsistency is
    // named as such (retry-ambiguous: §13.6 lists epoch disagreement).
    const DESC_JUNE = { ...DESC_ALPHA, epoch: 'epoch:2026-06' };
    const nJune = nullifier(alice.secret, descriptorDigest(DESC_JUNE));
    must(nJune !== nAliceAlpha, 'epoch change separates nullifiers');
    const tEpo1 = transcriptFor(DESC_ALPHA, 'verifier:service-alpha-gate', 'epo-1');
    vectors.push(vec('PR-EPO/reject/epoch-snapshot-inconsistent/001',
      ['§12.4', '§13.6', '§26.1'], CLAIM_EPO,
      {
        contextDescriptor: DESC_ALPHA,
        presentedUnderDescriptor: DESC_JUNE,
        transcript: tEpo1,
        transcriptDigest: transcriptDigest(tEpo1),
        subject: { humanId: 'human:fixture-alice' },
        nullifier: nJune,
      },
      {
        outcome: 'reject',
        reason: 'epoch-snapshot-inconsistent',
        claimCeiling:
          'epoch disagreement is a legitimate cause of this observable ' +
          '(§13.6) — the rejection is deterministic, the diagnosis is not; ' +
          'route to challenge',
      }));

    // reject — registry facet: the transcript demands root-age<=24h; the
    // carried snapshot is 100h old at the explicit now. Retry-ambiguous
    // (refresh race).
    const tEpo2 = transcriptFor(DESC_ALPHA, 'verifier:service-alpha-gate', 'epo-2');
    must(tEpo2.snapshotRequirements === 'root-age<=24h', 'snapshot requirement pinned');
    vectors.push(vec('PR-EPO/reject/stale-registry-snapshot/001',
      ['§12.4', '§26.1'], CLAIM_EPO,
      {
        contextDescriptor: DESC_ALPHA,
        transcript: tEpo2,
        transcriptDigest: transcriptDigest(tEpo2),
        subject: { humanId: 'human:fixture-alice' },
        nullifier: nAliceAlpha,
        registrySnapshot: { root: 'root:fixture-enrolment-set', timestamp: NOW_EPO - 100 * 3600 },
        now: NOW_EPO,
      },
      {
        outcome: 'reject',
        reason: 'stale-registry-snapshot',
        claimCeiling:
          'a snapshot older than the transcript\'s declared bound may be a ' +
          'refresh race, not an attack — reject deterministically, challenge ' +
          'route open',
      }));

    // accept — fresh snapshot, consistent epoch: the same machinery admits.
    const tEpo3 = transcriptFor(DESC_ALPHA, 'verifier:service-alpha-gate', 'epo-3');
    vectors.push(vec('PR-EPO/accept/fresh-snapshot/001',
      ['§12.4', '§26'], CLAIM_EPO,
      {
        contextDescriptor: DESC_ALPHA,
        transcript: tEpo3,
        transcriptDigest: transcriptDigest(tEpo3),
        subject: { humanId: 'human:fixture-alice' },
        nullifier: nAliceAlpha,
        registrySnapshot: { root: 'root:fixture-enrolment-set', timestamp: NOW_EPO - 3600 },
        now: NOW_EPO,
      },
      { outcome: 'accept' }));
  }

  // --------------------------------------------------------------------------
  // Lint vectors — verifier-output texts against the §9/§24 prohibited list.
  // Three must fail on overclaims, one must fail on key-control-as-authority
  // (§26.1 bullet 9), and one narrow-language text must PASS — a lint suite
  // whose patterns nothing satisfies proves only that the lint is unusable.
  // --------------------------------------------------------------------------
  const lintVec = (fixture, sections, text, expect) =>
    vec(fixture, sections, CLAIM_LINT, { verifierOutput: text }, expect);

  const lintCases = [
    lintVec('PR-LIV/lint/overclaim-verifier-output/001', ['§9', '§10.2', '§26.1'],
      'Proof verified: the subject is present and the biometric determination was correct.',
      {
        outcome: 'lint-fail',
        reason: 'overclaim-verifier-output',
        claimCeiling:
          'PR-LIV establishes possession of a qualifying attestation under ' +
          'named policy and assurance predicates — never correctness of the ' +
          'underlying biometric determination (§10.2)',
      }),
    lintVec('PR-UNQ/lint/overclaim-verifier-output/001', ['§9', '§13', '§24', '§26.1'],
      'This proof establishes the presenter is a unique human, globally unique across all services.',
      {
        outcome: 'lint-fail',
        reason: 'overclaim-verifier-output',
        claimCeiling:
          'PR-UNQ establishes scoped reuse detection within one governed ' +
          'context, scope, purpose, and epoch — never one natural person ' +
          'globally (§9 register)',
      }),
    lintVec('PR-PER/lint/overclaim-verifier-output/001', ['§9', '§11.2', '§24', '§26.1'],
      'Personhood check passed: one-human-one-record enforced and civil identity confirmed.',
      {
        outcome: 'lint-fail',
        reason: 'overclaim-verifier-output',
        claimCeiling:
          'PR-PER establishes satisfaction of a named personhood policy under ' +
          'its stated assumptions — never civil identity or a ' +
          'one-human-one-record property (§11.2, §24)',
      }),
    lintVec('PR-HLD/lint/key-control-as-authority/001', ['§9', '§14.2', '§26.1'],
      'Holder key control confirms the agent is authorised to act for the user.',
      {
        outcome: 'lint-fail',
        reason: 'key-control-as-authority',
        claimCeiling:
          'PR-HLD establishes control of the holder secret bound to the ' +
          'transcript — never agent authority, consent, intent, or presence ' +
          '(§14.2; delegation is separate structured evidence, §27.5)',
      }),
    lintVec('PR-UNQ/lint/narrow-language-pass/001', ['§5.12', '§9'],
      'Scoped reuse detection within this context: a repeated nullifier under ' +
      'the same context, scope, purpose, and epoch indicates reuse of one ' +
      'enrolled secret; nothing is established beyond this scope, and a ' +
      'repeat may be a legitimate retry — see the challenge route.',
      { outcome: 'accept' }),

    // §26.1 bullet 5 — collusion-resistance claims. The undocumented form
    // (no adversary, no test) must fail; the fully-parameterised §2.4 form
    // (against whom, for what, alongside what, tested by which fixture) must
    // pass — the same claim CLASS, separated by its documentation.
    lintVec('PR-UNQ/lint/undocumented-collusion-claim/001', ['§2.4', '§24', '§26.1'],
      'This deployment is resistant to issuer-verifier collusion.',
      {
        outcome: 'lint-fail',
        reason: 'undocumented-collusion-claim',
        claimCeiling:
          'a collusion-resistance claim is testable only with a named ' +
          'adversary and a named test (§2.4 "against whom"; §24); without ' +
          'them it is marketing, not a boundary',
      }),
    lintVec('PR-UNQ/lint/collusion-narrow-language-pass/001', ['§2.4', '§24'],
      'Collusion resistance is claimed against the issuer-verifier pair for ' +
      'the current context epoch alongside the canonical transcript only, ' +
      'tested by fixture PR-UNQ/reject/duplicate-human-in-context/001.',
      { outcome: 'accept' }),

    // §26.1 bullet 11 — disclosure claims that ignore observable events.
    // "Learns nothing" is false at the event layer: occurrence, timing, and
    // the transcript's accompanying fields are always observed (§2.6). The
    // honest counterpart names the observables and passes.
    lintVec('PR-SHW/lint/disclosure-ignores-observables/001', ['§2.4', '§2.6', '§26.1'],
      'The verifier learns nothing from this presentation.',
      {
        outcome: 'lint-fail',
        reason: 'disclosure-ignores-observables',
        claimCeiling:
          'the verifier always observes occurrence, timing, and the ' +
          'accompanying transcript fields (§2.6); a disclosure claim that ' +
          'omits them is an overclaim about silence',
      }),
    lintVec('PR-SHW/lint/disclosure-ignores-observables/002', ['§2.4', '§2.6', '§26.1'],
      'No information is revealed by presentation of this proof.',
      {
        outcome: 'lint-fail',
        reason: 'disclosure-ignores-observables',
        claimCeiling:
          'presentation itself is information: the event, its timing, and ' +
          'its accompanying fields compose with everything else the observer ' +
          'holds (§2.6)',
      }),
    lintVec('PR-SHW/lint/disclosure-narrow-language-pass/001', ['§2.4', '§2.6'],
      'The verifier observes occurrence and timing of this presentation and ' +
      'the transcript fields accompanying it; the witness remains hidden.',
      { outcome: 'accept' }),
  ];
  for (const lv of lintCases) {
    const res = lintVerifierOutput(lv.inputs.verifierOutput);
    if (lv.expect.outcome === 'lint-fail') {
      must(!res.ok, `lint must fail: ${lv.fixture}`);
    } else {
      must(res.ok, `lint must pass: ${lv.fixture}`);
    }
    vectors.push(lv);
  }

  // --- schema self-validation: never emit an invalid vector -------------------
  for (const v of vectors) {
    const check = validateVector(v);
    must(check.ok, `schema: ${v.fixture} -> ${check.errors.join('; ')}`);
  }
  const ids = new Set(vectors.map((v) => v.fixture));
  must(ids.size === vectors.length, 'fixture ids unique');

  // --- consumer round-trip at build time --------------------------------------
  // Every vector is run through the REAL consumer before it is serialized:
  // extraction cannot emit an expectation the constructions do not reproduce.
  for (const v of vectors) {
    const r = runVector(v);
    must(r.pass, `consumer: ${v.fixture} -> ${r.detail}`);
  }

  return vectors;
}

// =============================================================================
// Serialization: vectors/<family>/<class>-<name>-<nnn>.json + manifest.json.
// Byte-deterministic: fixed key-insertion order, two-space indent, LF, sorted
// manifest listings. No timestamps anywhere.
// =============================================================================
export function buildFiles() {
  const vectors = buildVectors();
  const files = new Map();
  const families = {};
  for (const v of vectors) {
    const [fam, cls, name, nnn] = v.fixture.split('/');
    const rel = `${fam}/${cls}-${name}-${nnn}.json`;
    files.set(rel, JSON.stringify(v, null, 2) + '\n');
    (families[fam] ??= []).push(rel);
  }
  const manifest = {
    formatVersion: SCHEMA_VERSION,
    decisionDoc: DECISION_DOC,
    reasonRegister: REASON_REGISTER_VERSION,
    vectorCount: vectors.length,
    families: Object.fromEntries(
      Object.keys(families).sort().map((f) => [f, families[f].sort()])
    ),
  };
  files.set('manifest.json', JSON.stringify(manifest, null, 2) + '\n');
  return files;
}

export function emit(outDir) {
  const files = buildFiles();
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  for (const [rel, content] of files) {
    const abs = join(outDir, rel);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, content, 'utf8');
  }
  return files;
}

// --- CLI ----------------------------------------------------------------------
const here = dirname(fileURLToPath(import.meta.url));
const isMain =
  process.argv[1] &&
  resolve(process.argv[1]).toLowerCase() === fileURLToPath(import.meta.url).toLowerCase();

if (isMain) {
  const i = process.argv.indexOf('--out');
  const outDir = i !== -1 ? resolve(process.argv[i + 1]) : join(here, 'vectors');
  const files = emit(outDir);
  console.log(`extracted ${files.size - 1} vectors + manifest -> ${outDir}`);
}
