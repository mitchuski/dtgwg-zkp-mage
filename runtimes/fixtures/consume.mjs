// Fixture consumer — the constructions re-run their own frozen suite.
// (X1 milestone M3, consumer half; the §25 determinism check in motion.)
//
// The consumer trusts NOTHING in a vector beyond its declared inputs: it
// re-derives every digest from the carried §6.2 descriptor, re-checks the
// §15.2 transcript binding, re-runs the construction, and only then compares
// the observed verdict with the expected one — outcome AND reason code. Two
// implementations that both pass this loop instantiate the same decisions
// (the X1 claim); an implementation that accepts a reject vector, or rejects
// it for a DIFFERENT reason, has silently re-decided a settled question.
//
// A second implementation in another language (X1 milestone M5) would rewrite
// exactly this file and nothing else — the vectors carry the decisions.
//
// Run: node consume.mjs [--root <vectors-dir>]

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { descriptorDigest, transcriptDigest, validateDescriptor } from '../canonical/canonical.mjs';
import { enrol, nullifier, ContextRegistry } from '../01-uniqueness-nullifier/src/nullifier.mjs';
import { joinCommunity, Swordsman, TrustGraph, roster } from '../07-trust-graph-formation/src/trust-graph.mjs';
import { REGISTRY } from '../show-composition/bundles.mjs';
import { verifyShow } from '../show-composition/show.mjs';
import { renderCard, checkLegibility, diffCards } from '../context-card/card.mjs';
import { validateVector, validateManifest, familyOf, classOf } from './schema.mjs';
import { SECTION_26_1 } from './reasons.mjs';
import { lintVerifierOutput } from './lint.mjs';

// --- loading ------------------------------------------------------------------
export function loadSuite(root) {
  const manifest = JSON.parse(readFileSync(join(root, 'manifest.json'), 'utf8'));
  const paths = Object.values(manifest.families ?? {}).flat();
  const vectors = paths.map((rel) => ({
    rel,
    vector: JSON.parse(readFileSync(join(root, rel), 'utf8')),
  }));
  return { manifest, vectors };
}

// --- runners ------------------------------------------------------------------
const fail = (detail) => ({ pass: false, detail });
const pass = () => ({ pass: true, detail: 'ok' });

// --- shared checks -----------------------------------------------------------

// Nullifier provenance (§26.1 bullets 4 and 10, epoch facet). The vector
// declares which descriptor the presented nullifier was ACTUALLY computed
// under; the consumer re-derives it under both that descriptor and the one
// the transcript binds. A mismatch against the bound context is named by its
// facet: descriptors differing ONLY in epoch fields are an epoch/snapshot
// inconsistency; any other difference is nullifier-domain reuse.
function nullifierProvenance(inputs) {
  const boundCtx = descriptorDigest(inputs.contextDescriptor);
  const presentedCtx = descriptorDigest(inputs.presentedUnderDescriptor);
  const secret = enrol(inputs.subject.humanId).secret;
  if (nullifier(secret, presentedCtx) !== inputs.nullifier) {
    return { error: 'presented-nullifier-does-not-rederive-under-declared-descriptor' };
  }
  if (nullifier(secret, boundCtx) === inputs.nullifier) return { observed: null };
  const fields = new Set([
    ...Object.keys(inputs.contextDescriptor),
    ...Object.keys(inputs.presentedUnderDescriptor),
  ]);
  const diff = [...fields].filter(
    (f) => inputs.contextDescriptor[f] !== inputs.presentedUnderDescriptor[f]
  );
  const epochOnly = diff.length > 0 && diff.every((f) => f === 'epoch' || f === 'epochPolicy');
  return { observed: epochOnly ? 'epoch-snapshot-inconsistent' : 'nullifier-domain-reuse', diff };
}

// §12.4 snapshot age against the transcript's snapshotRequirements, parsed
// from the transcript itself ('root-age<=24h') and evaluated against the
// vector's EXPLICIT now — never a clock read.
const SNAPSHOT_REQ_RE = /^root-age<=(\d+(?:\.\d+)?)(h|d)$/;
function snapshotStale(requirement, snapshotTimestamp, now) {
  const m = SNAPSHOT_REQ_RE.exec(String(requirement ?? ''));
  if (!m) return { error: `unparseable-snapshot-requirement:${requirement}` };
  if (typeof now !== 'number' || typeof snapshotTimestamp !== 'number') {
    return { error: 'snapshot-times-must-be-explicit-numbers' };
  }
  const limitSeconds = Number(m[1]) * (m[2] === 'h' ? 3600 : 86400);
  return { stale: now - snapshotTimestamp > limitSeconds };
}

const transcriptBindingError = (inputs) => {
  const ctx = descriptorDigest(inputs.contextDescriptor);
  if (inputs.transcript.contextDescriptorDigest !== ctx) return 'transcript-not-bound-to-descriptor';
  if (transcriptDigest(inputs.transcript) !== inputs.transcriptDigest) {
    return 'transcript-digest-does-not-rederive';
  }
  return null;
};

// PR-UNQ / runtime 01. Rebuild the context from the carried descriptor,
// re-check the transcript binding, replay prior presentations, present.
function runRt01(v) {
  const { inputs, expect } = v;

  // Descriptor-schema check (§26.1 bullet 6): the canonical layer's
  // validateDescriptor rejecting unknown fields IS the unjustified-stable-
  // correlator check — an extra field (e.g. stableHolderTag) is a correlator
  // the §6.2 field register never justified. The accept counterpart carries
  // the one OPTIONAL field the register does justify (registryDomain).
  if (inputs.descriptorCheck) {
    const d = validateDescriptor(inputs.contextDescriptor);
    if (!d.ok && d.unknown.length > 0) {
      if (expect.outcome !== 'reject') {
        return fail(`descriptor rejected: unknown:${d.unknown.join(',')}`);
      }
      return expect.reason === 'unjustified-stable-correlator'
        ? pass()
        : fail(`reason mismatch: expected ${expect.reason}, got unjustified-stable-correlator`);
    }
    if (!d.ok) return fail(`descriptor-invalid: missing:${d.missing.join(',')}`);
    const ctx = descriptorDigest(inputs.contextDescriptor);
    const n = nullifier(enrol(inputs.subject.humanId).secret, ctx);
    if (n !== inputs.nullifier) return fail('nullifier-does-not-rederive');
    const res = new ContextRegistry(ctx).present(n);
    return expect.outcome === 'accept' && res.admitted === true
      ? pass()
      : fail('descriptor-clean vector must accept');
  }

  // Nullifier-domain provenance (§26.1 bullet 4): the presented nullifier was
  // computed under descriptor A while the transcript binds descriptor B.
  if (inputs.presentedUnderDescriptor) {
    const bind = transcriptBindingError(inputs);
    if (bind) return fail(bind);
    const p = nullifierProvenance(inputs);
    if (p.error) return fail(p.error);
    if (p.observed === null) return fail('expected a domain violation, nullifier rederives under bound context');
    if (expect.outcome !== 'reject') return fail(`expected accept, observed ${p.observed}`);
    return p.observed === expect.reason
      ? pass()
      : fail(`reason mismatch: expected ${expect.reason}, got ${p.observed}`);
  }

  if (inputs.crossContext) {
    // Cross-context pair: same human, two governed contexts. The nullifiers
    // must re-derive, must DIFFER (unlinkability), and the second context must
    // admit a human already seen in the first (context isolation).
    const ctxA = descriptorDigest(inputs.descriptorA);
    const ctxB = descriptorDigest(inputs.descriptorB);
    const secret = enrol(inputs.subject.humanId).secret;
    const nA = nullifier(secret, ctxA);
    const nB = nullifier(secret, ctxB);
    if (nA !== inputs.nullifierA) return fail('nullifierA-does-not-rederive');
    if (nB !== inputs.nullifierB) return fail('nullifierB-does-not-rederive');
    if (nA === nB) return fail('nullifier-domains-not-separated');
    const regA = new ContextRegistry(ctxA);
    regA.present(nA);
    const regB = new ContextRegistry(ctxB);
    const res = regB.present(nB);
    if (expect.outcome !== 'accept') return fail('cross-context-vector-must-expect-accept');
    return res.admitted === true ? pass() : fail(`expected accept, got ${res.reason}`);
  }

  const ctx = descriptorDigest(inputs.contextDescriptor);
  if (inputs.transcript.contextDescriptorDigest !== ctx) {
    return fail('transcript-not-bound-to-descriptor');
  }
  if (transcriptDigest(inputs.transcript) !== inputs.transcriptDigest) {
    return fail('transcript-digest-does-not-rederive');
  }
  const subjectN = nullifier(enrol(inputs.subject.humanId).secret, ctx);
  if (subjectN !== inputs.nullifier) return fail('nullifier-does-not-rederive');

  const reg = new ContextRegistry(ctx);
  for (const h of inputs.priorPresentations) {
    reg.present(nullifier(enrol(h).secret, ctx));
  }
  const res = reg.present(subjectN);

  if (expect.outcome === 'accept') {
    return res.admitted === true ? pass() : fail(`expected accept, got ${res.reason}`);
  }
  if (res.admitted !== false) return fail('expected reject, construction accepted');
  if (res.reason !== expect.reason) {
    return fail(`reason mismatch: expected ${expect.reason}, got ${res.reason}`);
  }
  return pass();
}

// PR-TGF / runtime 07. Rebuild the community from the carried descriptor,
// re-anchor the roster, replay pre-state edges, prove the candidate.
function runRt07(v) {
  const { inputs, expect } = v;
  const community = descriptorDigest(inputs.communityDescriptor);
  const nodes = inputs.rosterHumanIds.map((h) => joinCommunity(h, community));
  const members = roster(nodes);
  const g = new TrustGraph();
  for (const e of inputs.existingEdges ?? []) g.addEdge(e);
  const verdict = Swordsman(members, g).prove(inputs.candidate);

  if (expect.outcome === 'accept') {
    if (verdict.signed !== true) return fail(`expected sign, got ${verdict.reason}`);
    if (verdict.edge.vrc !== inputs.candidate.claimedVrc) {
      return fail('signed-vrc-does-not-match-candidate');
    }
    return pass();
  }
  if (verdict.signed !== false) return fail('expected reject, Swordsman signed');
  if (verdict.reason !== expect.reason) {
    return fail(`reason mismatch: expected ${expect.reason}, got ${verdict.reason}`);
  }
  return pass();
}

// PR-LIV / attestation lifecycle (§26.1 bullet 1). A minimal semantic model:
// { issuer, validFrom, validUntil, status } checked against the vector's
// EXPLICIT now and accepted-issuer list. Revoked, out-of-window, and
// unaccepted-issuer all fail with the one bullet-1 code. The full attestation
// model (status lists, accreditation snapshots) is rt 02's future work; this
// runner freezes the DECISION — a valid proof over a dead attestation is
// rejected — not the construction.
function runAttestation(v) {
  const { inputs, expect } = v;
  const a = inputs.attestation;
  if (!a || typeof inputs.now !== 'number') return fail('attestation-and-explicit-now-required');
  let observed = null;
  if (a.status !== 'active') {
    observed = 'expired-or-revoked-attestation';
  } else if (
    typeof a.validFrom !== 'number' || typeof a.validUntil !== 'number' ||
    inputs.now < a.validFrom || inputs.now > a.validUntil
  ) {
    observed = 'expired-or-revoked-attestation';
  } else if (!Array.isArray(inputs.acceptedIssuers) || !inputs.acceptedIssuers.includes(a.issuer)) {
    observed = 'expired-or-revoked-attestation'; // unaccepted facet, same bullet-1 code
  }
  if (observed === null) {
    return expect.outcome === 'accept' ? pass() : fail('expected reject, attestation checks passed');
  }
  if (expect.outcome !== 'reject') return fail(`expected accept, observed ${observed}`);
  return observed === expect.reason
    ? pass()
    : fail(`reason mismatch: expected ${expect.reason}, got ${observed}`);
}

// PR-SHW / show composition (§26.1 bullet 3 family). The consumer runs the
// REAL verifier — show-composition's verifyShow against its governed bundle
// registry, under the vector's explicit now — and demands the same verdict
// and the same (v1-absorbed) reason string.
function runShow(v) {
  const { inputs, expect } = v;
  if (typeof inputs.now !== 'number') return fail('explicit-now-required');
  const res = verifyShow(inputs.show, REGISTRY, inputs.now);
  if (expect.outcome === 'accept') {
    return res.ok ? pass() : fail(`expected accept, got ${res.reason}`);
  }
  if (res.ok) return fail('expected reject, show verified');
  return res.reason === expect.reason
    ? pass()
    : fail(`reason mismatch: expected ${expect.reason}, got ${res.reason}`);
}

// PR-CTX / context expansion (§26.1 bullet 7). Both descriptors are rendered
// through the real context-card instrument; diffCards must judge the change
// an EXPANSION (q2 recognition-set widening). The vector then either carries
// no migration record — the silent expansion §24 forbids — or a record that
// names both derived card versions, which is exactly the "version and
// migration" the bullet demands.
function runContextExpansion(v) {
  const { inputs, expect } = v;
  const before = renderCard(inputs.descriptorBefore);
  const after = renderCard(inputs.descriptorAfter);
  if (!checkLegibility(inputs.descriptorBefore, before).ok) return fail('before-card-illegible');
  if (!checkLegibility(inputs.descriptorAfter, after).ok) return fail('after-card-illegible');
  const d = diffCards(before, after);
  if (!d.expansion) return fail('vector-must-describe-an-expansion');
  const m = inputs.migration;
  const migrated =
    m !== null && typeof m === 'object' &&
    m.fromCardVersion === before.version &&
    m.toCardVersion === after.version &&
    typeof m.note === 'string' && m.note.length > 0;
  if (!migrated) {
    if (expect.outcome !== 'reject') return fail('expansion without migration must reject');
    return expect.reason === 'context-expansion-without-version'
      ? pass()
      : fail(`reason mismatch: expected ${expect.reason}, got context-expansion-without-version`);
  }
  return expect.outcome === 'accept' ? pass() : fail('expected reject, migration record is valid');
}

// PR-FLB / silent fallback (§26.1 bullet 8). The vector declares that
// mediated proving OCCURRED; the §15.2 transcript either carries the optional
// provingMode field (§21 declaration — accept) or does not (the fallback was
// silent — reject). Semantic vector: the mediated prover itself is future
// runtime work; the transcript-level declaration is what this freezes.
function runFallback(v) {
  const { inputs, expect } = v;
  const bind = transcriptBindingError(inputs);
  if (bind) return fail(bind);
  if (!inputs.proving || inputs.proving.mediated !== true) {
    return fail('vector-must-declare-mediated-proving-occurred');
  }
  const declared =
    typeof inputs.transcript.provingMode === 'string' && inputs.transcript.provingMode.length > 0;
  if (!declared) {
    if (expect.outcome !== 'reject') return fail('silent fallback must reject');
    return expect.reason === 'silent-fallback'
      ? pass()
      : fail(`reason mismatch: expected ${expect.reason}, got silent-fallback`);
  }
  if (inputs.transcript.provingMode !== inputs.proving.mode) {
    return fail('transcript-provingMode-does-not-match-declared-mode');
  }
  return expect.outcome === 'accept' ? pass() : fail('expected reject, provingMode is declared');
}

// PR-EPO / epoch + registry snapshots (§26.1 bullet 10, both facets). The
// epoch facet reuses the provenance check (descriptors differing only in
// epoch fields); the registry facet parses the transcript's own
// snapshotRequirements and ages the carried snapshot against the explicit now.
function runEpoch(v) {
  const { inputs, expect } = v;
  const bind = transcriptBindingError(inputs);
  if (bind) return fail(bind);
  let observed = null;
  if (inputs.presentedUnderDescriptor) {
    const p = nullifierProvenance(inputs);
    if (p.error) return fail(p.error);
    observed = p.observed;
  }
  if (observed === null && inputs.registrySnapshot) {
    const s = snapshotStale(
      inputs.transcript.snapshotRequirements, inputs.registrySnapshot.timestamp, inputs.now
    );
    if (s.error) return fail(s.error);
    if (s.stale) observed = 'stale-registry-snapshot';
  }
  if (observed === null) {
    const ctx = descriptorDigest(inputs.contextDescriptor);
    const n = nullifier(enrol(inputs.subject.humanId).secret, ctx);
    if (n !== inputs.nullifier) return fail('nullifier-does-not-rederive');
    if (new ContextRegistry(ctx).present(n).admitted !== true) return fail('fresh-registry-refused');
    return expect.outcome === 'accept'
      ? pass()
      : fail(`expected ${expect.reason}, construction found no violation`);
  }
  if (expect.outcome !== 'reject') return fail(`expected accept, observed ${observed}`);
  return observed === expect.reason
    ? pass()
    : fail(`reason mismatch: expected ${expect.reason}, got ${observed}`);
}

// Lint class: the verifier-output text against the prohibited-pattern list.
function runLint(v) {
  const res = lintVerifierOutput(v.inputs.verifierOutput);
  if (v.expect.outcome === 'lint-fail') {
    // The text must trip, and at least one hit must carry the EXPECTED reason
    // code — a text failing only for some other reason has not reproduced the
    // decision this vector froze.
    return !res.ok && res.hits.some((h) => h.reason === v.expect.reason)
      ? pass()
      : fail(res.ok
        ? 'prohibited text passed the lint'
        : `lint tripped, but not for ${v.expect.reason} (got ${res.hits.map((h) => h.reason).join(',')})`);
  }
  return res.ok
    ? pass()
    : fail(`narrow language tripped: ${res.hits.map((h) => h.id).join(',')}`);
}

// Dispatch one vector to its runner. Exported so a test can consume a single
// (possibly tampered) vector without touching disk.
export function runVector(v) {
  const schema = validateVector(v);
  if (!schema.ok) return fail(`schema: ${schema.errors.join('; ')}`);
  if (classOf(v) === 'lint') return runLint(v);
  switch (familyOf(v)) {
    case 'PR-UNQ': return runRt01(v);
    case 'PR-TGF': return runRt07(v);
    case 'PR-LIV': return runAttestation(v);
    case 'PR-SHW': return runShow(v);
    case 'PR-CTX': return runContextExpansion(v);
    case 'PR-FLB': return runFallback(v);
    case 'PR-EPO': return runEpoch(v);
    default: return fail(`no-runner-for-family:${familyOf(v)}`);
  }
}

// --- the harness --------------------------------------------------------------
export function consumeAll(root) {
  const { manifest, vectors } = loadSuite(root);
  const m = validateManifest(manifest, vectors.map((x) => x.rel));
  const report = {
    manifestOk: m.ok,
    manifestErrors: m.errors,
    total: vectors.length,
    passed: 0,
    failed: 0,
    perFamily: {},
    failures: [],
  };
  for (const { vector } of vectors) {
    const fam = familyOf(vector);
    report.perFamily[fam] ??= { pass: 0, fail: 0 };
    const r = runVector(vector);
    if (r.pass) {
      report.passed++;
      report.perFamily[fam].pass++;
    } else {
      report.failed++;
      report.perFamily[fam].fail++;
      report.failures.push({ fixture: vector.fixture, detail: r.detail });
    }
  }
  if (!m.ok) report.failures.push({ fixture: 'manifest.json', detail: m.errors.join('; ') });
  return report;
}

// --- §26.1 coverage -----------------------------------------------------------
// Which of the eleven mandatory rejections have at least one vector? A gap,
// were one ever to reappear, MUST be reported, never hidden — a coverage
// table that undercounts its own gaps is a silent cap. (The bullet-4 partial
// fallback below is kept for honesty: if the domain-reuse reject vector were
// dropped, the cross-context accept pair would again count only as partial.)
export function coverage26_1(vectors) {
  return SECTION_26_1.map(({ bullet, text, codes }) => {
    const via = vectors
      .filter((v) => v.expect.reason && codes.includes(v.expect.reason))
      .map((v) => v.fixture);
    if (via.length > 0) return { bullet, text, status: 'covered', via };
    if (bullet === 4) {
      const cc = vectors.filter((v) => v.inputs.crossContext).map((v) => v.fixture);
      if (cc.length > 0) return { bullet, text, status: 'partial', via: cc };
    }
    return { bullet, text, status: 'gap', via: [] };
  });
}

// --- CLI ----------------------------------------------------------------------
const here = dirname(fileURLToPath(import.meta.url));
const isMain =
  process.argv[1] &&
  resolve(process.argv[1]).toLowerCase() === fileURLToPath(import.meta.url).toLowerCase();

if (isMain) {
  const i = process.argv.indexOf('--root');
  const root = i !== -1 ? resolve(process.argv[i + 1]) : join(here, 'vectors');
  const report = consumeAll(root);
  console.log('\nfixture consumer — re-running the frozen suite\n');
  for (const fam of Object.keys(report.perFamily).sort()) {
    const { pass: p, fail: f } = report.perFamily[fam];
    console.log(`  ${fam}  ${p}/${p + f} pass`);
  }
  for (const f of report.failures) console.log(`  FAIL ${f.fixture}: ${f.detail}`);
  console.log(`\nvectors: ${report.passed}/${report.total} pass`);
  process.exit(report.failed === 0 && report.manifestOk ? 0 : 1);
}
