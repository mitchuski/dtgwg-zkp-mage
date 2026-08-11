// orchestrate.mjs — the lane-1 volunteer flow (X10 ceremony-as-trust-task).
//
// What this does: drives a volunteer's independent verification run end-to-end
// — prerequisites → circuit setups + suites → report.mjs digests → acceptance
// check against the pinned manifest → a paste-ready submission body for the
// GitHub issue template. The agent-facing entry point: an assistant can run
// this whole file and never touches anything secret, because lane 1 HAS no
// secrets — and the structure keeps it that way for lane 2 (see the gate).
//
// What this does NOT do, structurally:
//   - no phase-2 / production ceremony path exists here. The single lane-3
//     entry point below throws 'phase2-gate-closed' unconditionally — the
//     mediator suite's T2-honeypot pattern: the prohibited thing cannot be
//     built, not merely rejected (X10 C6). It opens only by a TF decision
//     through the §25 gate, in a future change that will be reviewed as such.
//   - no entropy handling. Lane-2 contribution flows, when they come, source
//     entropy from the OS CSPRNG inside the contribution subprocess and are
//     scanned by scan.mjs (assertClean) over the orchestrator's lifetime view.
//
// Acceptance consumes ONLY report.pinned + the manifest (CO6/CO8).

import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyReport } from '../circom-gadget/verify-run.mjs';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const GADGET = path.join(DIR, '..', 'circom-gadget');

export const SEATS_FILE = path.join(DIR, 'seats.json');

// ---------------------------------------------------------------------------
// seats — admission is governance data (§7.3), revocation fails closed VISIBLY
// ---------------------------------------------------------------------------
export function checkSeat(seatId, seatsDoc) {
  const seat = seatsDoc.seats.find((s) => s.id === seatId);
  if (!seat) throw new Error(`seat-not-admitted:${seatId}`);
  if (seat.status !== 'active') throw new Error(`seat-revoked:${seatId}`);
  return seat;
}

// ---------------------------------------------------------------------------
// lane-3 gate — unconditionally closed until the §25 gate opens upstream
// ---------------------------------------------------------------------------
export function contributePhase2() {
  throw new Error(
    'phase2-gate-closed: construction selection (decision doc §25) has not closed; ' +
    'a per-circuit production ceremony would consecrate the benchmarking vehicle. ' +
    'This endpoint opens only by task-force decision.'
  );
}

// ---------------------------------------------------------------------------
// acceptance — pure: report object + manifest object → verdict (CO6)
// ---------------------------------------------------------------------------
export function acceptSubmission(reports, manifest) {
  const results = reports.map((r) => ({
    circuit: r.pinned?.circuit ?? 'unknown',
    ...verifyReport(r, manifest),
  }));
  return { results, accept: results.every((r) => r.accept) };
}

// ---------------------------------------------------------------------------
// submission body — paste-ready for the verification-run issue template.
// Carries pinned digests + suite tallies + coarse platform info only.
// Deliberately excluded: any filesystem path, hostname, username (CO7).
// ---------------------------------------------------------------------------
export function buildSubmission({ seat, reports, tallies, position = 'ratify' }) {
  const lines = [];
  lines.push(`### Verification run — ${seat.name} (${seat.affiliation})`);
  lines.push('');
  lines.push(`**Position:** ${position}`);
  const info = reports[0]?.informative;
  if (info) {
    lines.push(`**Toolchain:** node ${info.tools.node} · circom ${info.tools.circom} · snarkjs ${info.tools.snarkjs}`);
    lines.push(`**Platform:** ${info.platform.os}/${info.platform.arch} · ${info.platform.cpu}`);
    lines.push(`**Date:** ${info.date}`);
  }
  if (tallies) lines.push(`**Suites:** ${tallies}`);
  lines.push('');
  for (const r of reports) {
    lines.push(`#### \`${r.pinned.circuit}\` (${r.pinned.compileFlags}) — ${r.pinned.constraints.nConstraints} constraints`);
    for (const [key, a] of Object.entries(r.pinned.artifacts)) {
      lines.push(`- \`${key}\` · ${a.bytes} B · sha256 \`${a.sha256}\``);
    }
    lines.push('');
  }
  lines.push('<details><summary>report.json pinned sections</summary>');
  lines.push('');
  lines.push('```json');
  lines.push(JSON.stringify(reports.map((r) => r.pinned), null, 2));
  lines.push('```');
  lines.push('</details>');
  const body = lines.join('\n') + '\n';
  // CO7 fail-closed: no absolute path may leave this machine in a submission
  if (/[A-Za-z]:\\|\/(?:Users|home)\//.test(body)) {
    throw new Error('submission-contains-local-path');
  }
  return body;
}

// ---------------------------------------------------------------------------
// CLI — the volunteer flow. Child output is captured into `view` so the run
// itself can be scanned (lane-2 inheritance; trivially clean in lane 1).
// ---------------------------------------------------------------------------
function sh(cmd, view) {
  const out = execSync(cmd, { cwd: GADGET, stdio: ['ignore', 'pipe', 'pipe'] }).toString();
  view.push(out);
  return out;
}

async function main() {
  const seatId = process.argv[2];
  if (!seatId) {
    process.stderr.write('usage: node orchestrate.mjs <seat-id> [position]\n');
    process.exit(1);
  }
  const view = [];
  const seatsDoc = JSON.parse(readFileSync(SEATS_FILE, 'utf8'));
  const seat = checkSeat(seatId, seatsDoc);
  process.stdout.write(`  ok  seat ${seat.id} (${seat.name}) admitted\n`);

  process.stdout.write('  .. setups (cached steps skip)\n');
  sh('node setup.mjs', view);
  sh('node setup-dual.mjs', view);
  sh('node setup-guardian.mjs', view);

  process.stdout.write('  .. suites\n');
  const tallies = [];
  for (const t of ['test.mjs', 'test-dual.mjs', 'test-guardian.mjs']) {
    const out = sh(`node ${t}`, view);
    const tail = out.trim().split('\n').pop();
    tallies.push(tail);
    process.stdout.write(`       ${tail}\n`);
  }

  process.stdout.write('  .. reports + acceptance\n');
  sh('node report.mjs', view);
  const manifest = JSON.parse(readFileSync(path.join(GADGET, 'artifacts.manifest.json'), 'utf8'));
  const reports = Object.keys(manifest.circuits).map((c) =>
    JSON.parse(readFileSync(path.join(GADGET, 'build', `report.${c}.json`), 'utf8'))
  );
  const { results, accept } = acceptSubmission(reports, manifest);
  for (const r of results) {
    process.stdout.write(`       ${r.accept ? 'ok  ' : 'FAIL'} ${r.circuit}${r.findings.length ? ' — ' + r.findings.map((f) => f.code).join(', ') : ''}\n`);
  }

  const body = buildSubmission({ seat, reports, tallies: tallies.join(' · '), position: process.argv[3] });
  process.stdout.write('\n--- submission body (paste into the verification-run issue) ---\n\n');
  process.stdout.write(body);
  process.stdout.write(`\n--- verdict: ${accept ? 'ACCEPT' : 'REJECT'} ---\n`);
  process.exit(accept ? 0 : 1);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  main().catch((e) => {
    process.stderr.write(`fatal: ${e.message}\n`);
    process.exit(1);
  });
}
