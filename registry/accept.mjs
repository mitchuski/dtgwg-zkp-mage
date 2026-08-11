// accept.mjs — maintainer acceptance: reports → registry entry → site rebuild.
//
//   node registry/accept.mjs --from <circom-gadget-dir> --seat <id> \
//        [--position ratify|refine|refute|build] [--id NNNN-slug] [--note "..."]
//
// The manual lane-1 acceptance step, as one command (demo-friendly): reads the
// three report.<circuit>.json from the given build dir, runs the SAME verdict
// logic as verify-run.mjs against the repo's pinned manifest, refuses to file
// a REJECT, writes registry/data/submissions/<id>.json, and rebuilds the site.
// Refresh localhost (or push + Pages) and the row is live.

import { execSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyReport } from '../runtimes/circom-gadget/verify-run.mjs';

const DIR = path.dirname(fileURLToPath(import.meta.url));

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
}

const from = arg('from');
const seatId = arg('seat');
const position = arg('position', 'ratify');
const note = arg('note', '');
if (!from || !seatId) {
  process.stderr.write('usage: node registry/accept.mjs --from <circom-gadget-dir> --seat <id> [--position p] [--id NNNN-slug] [--note "..."]\n');
  process.exit(1);
}

const seatsDoc = JSON.parse(readFileSync(path.join(DIR, 'data', 'seats.json'), 'utf8'));
const seat = seatsDoc.seats.find((s) => s.id === seatId);
if (!seat) { process.stderr.write(`seat-not-admitted:${seatId}\n`); process.exit(1); }
if (seat.status !== 'active') { process.stderr.write(`seat-revoked:${seatId}\n`); process.exit(1); }

const manifest = JSON.parse(readFileSync(path.join(DIR, '..', 'runtimes', 'circom-gadget', 'artifacts.manifest.json'), 'utf8'));
const buildDir = path.join(from, 'build');
const reports = Object.keys(manifest.circuits).map((c) => {
  const p = path.join(buildDir, `report.${c}.json`);
  if (!existsSync(p)) { process.stderr.write(`missing ${p} — run report.mjs first\n`); process.exit(1); }
  return JSON.parse(readFileSync(p, 'utf8'));
});

const results = reports.map((r) => ({ circuit: r.pinned.circuit, ...verifyReport(r, manifest) }));
const findings = results.flatMap((r) => r.findings.map((f) => ({ circuit: r.circuit, code: f.code, fatal: f.fatal })));
for (const f of findings) process.stdout.write(`  ${f.fatal ? 'FAIL' : 'note'} ${f.circuit}: ${f.code}\n`);
const accept = results.every((r) => r.accept);
if (!accept) { process.stderr.write('REJECT — not filing. A reproducible required-artifact mismatch is a finding: file it as an issue with position refute.\n'); process.exit(1); }

const existing = readdirSync(path.join(DIR, 'data', 'submissions')).filter((f) => f.endsWith('.json')).sort();
const nextNum = String(existing.length).padStart(4, '0');
const id = arg('id', `${nextNum}-${seatId}`);

const submission = {
  formatVersion: 'x10-submission/v0',
  seat: { id: seat.id, name: seat.name, affiliation: seat.affiliation },
  date: reports[0].informative.date,
  position,
  tallies: 'accepted via accept.mjs — verify-run verdict ACCEPT',
  ...(note ? { role: note } : {}),
  verdict: { accept: true, findings },
  reports,
};
const outPath = path.join(DIR, 'data', 'submissions', `${id}.json`);
if (existsSync(outPath)) { process.stderr.write(`refusing to overwrite existing submission ${id}\n`); process.exit(1); }
writeFileSync(outPath, JSON.stringify(submission, null, 2) + '\n');
process.stdout.write(`  ok  filed ${path.relative(process.cwd(), outPath)} (ACCEPT, ${findings.length} advisory notes)\n`);

execSync(`node "${path.join(DIR, 'build-registry.mjs')}"`, { stdio: 'inherit' });
process.stdout.write('registry rebuilt — refresh the site\n');
