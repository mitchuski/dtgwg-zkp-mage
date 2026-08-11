// ceremony-orchestrator property tests (X10 lane 1).
//
// CO1 pinned report section is byte-identical across two separate processes
// CO2 tampered digests: required artifact -> fatal named mismatch; advisory
//     artifact (zkey) -> named advisory note, acceptance unchanged
// CO3 seat admission: unknown seat / revoked seat fail closed by name
// CO4 no phase-2 contribution path exists in this suite's source, and the
//     single lane-3 entry point throws phase2-gate-closed unconditionally
// CO5 the lifetime-view scan trips on a planted secret (raw AND encoded)
// CO6 acceptance verdict is reproducible from report + manifest objects alone
// CO7 a submission body never carries an absolute local path
// CO8 informative fields never enter the acceptance decision
//
// Requires: circom-gadget build/ present (run its setups first). Zero deps.

import { execSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanView, assertClean } from './scan.mjs';
import { checkSeat, contributePhase2, acceptSubmission, buildSubmission } from './orchestrate.mjs';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const GADGET = path.join(DIR, '..', 'circom-gadget');

const results = [];
async function check(id, msg, fn) {
  try {
    await fn();
    process.stdout.write(`  ok  ${id} ${msg}\n`);
    results.push(true);
  } catch (e) {
    process.stdout.write(`  FAIL ${id} ${msg}\n       ${e.message}\n`);
    results.push(false);
  }
}
function assert(cond, msg) { if (!cond) throw new Error(msg); }
function assertThrows(fn, prefix, msg) {
  try { fn(); } catch (e) {
    assert(e.message.startsWith(prefix), `${msg} — got: ${e.message}`);
    return;
  }
  throw new Error(`${msg} — did not throw`);
}

const CIRCUIT_NAMES = ['nullifier_membership', 'dual_issuer', 'guardian_threshold'];
function readReports() {
  return CIRCUIT_NAMES.map((c) =>
    JSON.parse(readFileSync(path.join(GADGET, 'build', `report.${c}.json`), 'utf8'))
  );
}

async function main() {
  const manifest = JSON.parse(readFileSync(path.join(GADGET, 'artifacts.manifest.json'), 'utf8'));

  // --- CO1: two-process byte identity of `pinned` (fixtures-F1 style) --------
  await check('CO1', 'pinned report section byte-identical across two processes', () => {
    execSync('node report.mjs', { cwd: GADGET, stdio: ['ignore', 'pipe', 'pipe'] });
    const a = readReports().map((r) => JSON.stringify(r.pinned));
    execSync('node report.mjs', { cwd: GADGET, stdio: ['ignore', 'pipe', 'pipe'] });
    const b = readReports().map((r) => JSON.stringify(r.pinned));
    a.forEach((s, i) => assert(s === b[i], `pinned diverged across processes for ${CIRCUIT_NAMES[i]}`));
  });

  const reports = readReports();

  // --- CO2: tampering is named, and tiered required/advisory ----------------
  await check('CO2', 'tampered required digest -> fatal named mismatch; advisory zkey -> note only', () => {
    const tampered = JSON.parse(JSON.stringify(reports[0]));
    tampered.pinned.artifacts.r1cs.sha256 = tampered.pinned.artifacts.r1cs.sha256.replace(/^./, (c) => (c === '0' ? '1' : '0'));
    const v1 = acceptSubmission([tampered], manifest);
    assert(!v1.accept, 'tampered required artifact was accepted');
    assert(v1.results[0].findings.some((f) => f.code === 'artifact-hash-mismatch:r1cs' && f.fatal),
      'mismatch not named artifact-hash-mismatch:r1cs');

    const advisory = JSON.parse(JSON.stringify(reports[0]));
    advisory.pinned.artifacts.zkey_final.sha256 = advisory.pinned.artifacts.zkey_final.sha256.replace(/^./, (c) => (c === '0' ? '1' : '0'));
    const v2 = acceptSubmission([advisory], manifest);
    assert(v2.accept, 'advisory zkey divergence rejected the run (should be a note)');
    assert(v2.results[0].findings.some((f) => f.code === 'artifact-hash-advisory:zkey_final' && !f.fatal),
      'advisory divergence not named artifact-hash-advisory:zkey_final');
  });

  // --- CO3: seat admission fails closed, by name ----------------------------
  await check('CO3', 'unknown seat -> seat-not-admitted; revoked seat -> seat-revoked (fail closed)', () => {
    const seats = { seats: [
      { id: 'ok', name: 'A', affiliation: 'B', status: 'active' },
      { id: 'gone', name: 'C', affiliation: 'D', status: 'revoked' },
    ] };
    assert(checkSeat('ok', seats).id === 'ok', 'active seat rejected');
    assertThrows(() => checkSeat('nobody', seats), 'seat-not-admitted:', 'unknown seat admitted');
    assertThrows(() => checkSeat('gone', seats), 'seat-revoked:', 'revoked seat admitted');
  });

  // --- CO4: lane-3 is unconstructable here (T2-honeypot pattern) ------------
  await check('CO4', 'no phase-2 contribution path in this suite; gate throws phase2-gate-closed', () => {
    assertThrows(() => contributePhase2(), 'phase2-gate-closed', 'phase-2 gate did not throw');
    // needles built by concatenation so this test's own source never matches
    const needles = ['powersoftau ' + 'contribute', 'zkey ' + 'contribute'];
    for (const f of readdirSync(DIR).filter((n) => n.endsWith('.mjs'))) {
      const src = readFileSync(path.join(DIR, f), 'utf8');
      for (const n of needles) {
        assert(!src.includes(n), `contribution command found in ${f}`);
      }
    }
  });

  // --- CO5: the lifetime-view scan trips on a planted secret ----------------
  await check('CO5', 'view scan trips on a planted secret in raw and encoded forms', () => {
    const secret = 'synthetic-toxic-waste-3f9a';
    const cleanView = ['setup output', { note: 'nothing secret here' }];
    assert(scanView(cleanView, [secret]).length === 0, 'clean view flagged');
    assertClean(cleanView, [secret]);
    const dirtyRaw = ['prefix ' + secret + ' suffix'];
    assertThrows(() => assertClean(dirtyRaw, [secret]), 'secret-in-view:raw@0', 'raw leak not caught');
    const dirtyB64 = [{ log: Buffer.from(secret, 'utf8').toString('base64') }];
    assertThrows(() => assertClean(dirtyB64, [secret]), 'secret-in-view:base64@0', 'base64 leak not caught');
  });

  // --- CO6: acceptance is pure over report + manifest -----------------------
  await check('CO6', 'verdict reproducible from report + manifest objects alone', () => {
    const detachedReports = JSON.parse(JSON.stringify(reports));
    const detachedManifest = JSON.parse(JSON.stringify(manifest));
    const v = acceptSubmission(detachedReports, detachedManifest);
    assert(v.accept, 'genuine reports rejected');
    assert(v.results.length === 3 && v.results.every((r) => r.accept), 'per-circuit verdicts wrong');
  });

  // --- CO7: submissions carry no absolute local paths -----------------------
  await check('CO7', 'submission body contains no absolute local path; planted path fails closed', () => {
    const seat = { id: 'mt', name: 'Maintainer', affiliation: 'lab' };
    const body = buildSubmission({ seat, reports, tallies: '10/10 · 7/7 · 8/8' });
    assert(!/[A-Za-z]:\\|\/(?:Users|home)\//.test(body), 'absolute path leaked into submission');
    assert(body.includes('nullifier_membership') && body.includes('sha256'), 'submission missing digest content');
    const poisoned = JSON.parse(JSON.stringify(reports));
    poisoned[0].informative.tools.circom = 'C:\\Users\\somebody\\circom.exe';
    assertThrows(
      () => buildSubmission({ seat, reports: poisoned, tallies: 'x' }),
      'submission-contains-local-path', 'planted path not caught'
    );
  });

  // --- CO8: informative never enters the acceptance decision ----------------
  await check('CO8', 'informative fields never enter the acceptance decision', () => {
    const mutated = JSON.parse(JSON.stringify(reports));
    for (const r of mutated) {
      r.informative = { tools: { node: 'v0.0.0', circom: 'nonsense', snarkjs: 'nonsense' },
        platform: { os: 'unknown', arch: 'unknown', cpu: 'unknown' }, date: '1970-01-01' };
    }
    const v = acceptSubmission(mutated, manifest);
    assert(v.accept, 'informative mutation changed the verdict');
  });

  const pass = results.filter(Boolean).length;
  process.stdout.write(`ceremony-orchestrator: ${pass}/${results.length} pass\n`);
  process.exit(pass === results.length ? 0 : 1);
}

main().catch((e) => {
  process.stderr.write(`fatal: ${e.stack}\n`);
  process.exit(1);
});
