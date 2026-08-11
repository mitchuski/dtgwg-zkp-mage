// verify-run.mjs — acceptance check for a submitted verification run (X10 lane 1).
//
//   node verify-run.mjs build/report.nullifier_membership.json [more reports...]
//
// Compares each report's `pinned` section against artifacts.manifest.json.
// Verdict vocabulary (register-string style, named not numeric):
//   artifact-hash-mismatch:<key>   — digest differs on a required artifact (FATAL)
//   artifact-hash-advisory:<key>   — digest differs on an advisory artifact
//                                    (the setup chain: ptau/zkeys/vkey are
//                                    machine-local by snarkjs contribution
//                                    randomness — recorded, not fatal; NOTES.md)
//   artifact-bytes-mismatch:<key>  — size differs (FATAL — a different build)
//   constraints-mismatch           — constraint counts differ (FATAL)
//   format-version-mismatch        — report from a different format (FATAL)
//   unknown-circuit:<name>         — circuit not in the manifest (FATAL)
//
// Exit code 0 = ACCEPT (no fatal findings across all reports), 1 = REJECT.
// The decision consumes ONLY `pinned` + the manifest — never `informative`
// (ceremony-orchestrator CO6/CO8 assert this file's behaviour).

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));

export function verifyReport(report, manifest) {
  const findings = []; // {code, fatal}
  const pinned = report.pinned;
  if (!pinned) return { findings: [{ code: 'format-version-mismatch', fatal: true }], accept: false };
  if (pinned.formatVersion !== manifest.formatVersion) {
    findings.push({ code: 'format-version-mismatch', fatal: true });
  }
  const canon = manifest.circuits?.[pinned.circuit];
  if (!canon) {
    findings.push({ code: `unknown-circuit:${pinned.circuit}`, fatal: true });
    return { findings, accept: false };
  }
  const c = pinned.constraints, k = canon.constraints;
  if (!c || c.nConstraints !== k.nConstraints || c.nVars !== k.nVars || c.nPubInputs !== k.nPubInputs) {
    findings.push({ code: 'constraints-mismatch', fatal: true });
  }
  for (const [key, canonEntry] of Object.entries(canon.artifacts)) {
    const got = pinned.artifacts?.[key];
    if (!got) {
      findings.push({ code: `artifact-hash-mismatch:${key}`, fatal: true });
      continue;
    }
    if (got.sha256 !== canonEntry.sha256) {
      if (canonEntry.acceptance === 'advisory') {
        findings.push({ code: `artifact-hash-advisory:${key}`, fatal: false });
      } else {
        findings.push({ code: `artifact-hash-mismatch:${key}`, fatal: true });
      }
    } else if (got.bytes !== canonEntry.bytes) {
      findings.push({ code: `artifact-bytes-mismatch:${key}`, fatal: true });
    }
  }
  return { findings, accept: !findings.some((f) => f.fatal) };
}

function main() {
  const files = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  if (!files.length) {
    process.stderr.write('usage: node verify-run.mjs <report.json> [more...]\n');
    process.exit(1);
  }
  const manifest = JSON.parse(readFileSync(path.join(DIR, 'artifacts.manifest.json'), 'utf8'));
  let allAccept = true;
  for (const f of files) {
    const report = JSON.parse(readFileSync(f, 'utf8'));
    const { findings, accept } = verifyReport(report, manifest);
    const name = report.pinned?.circuit ?? path.basename(f);
    if (accept && !findings.length) {
      process.stdout.write(`  ok  ${name}: all pinned artifacts match the manifest\n`);
    } else {
      for (const fd of findings) {
        process.stdout.write(`  ${fd.fatal ? 'FAIL' : 'note'} ${name}: ${fd.code}\n`);
      }
      process.stdout.write(`  ${accept ? 'ok  ' : 'FAIL'} ${name}: ${accept ? 'ACCEPT (advisory notes recorded)' : 'REJECT'}\n`);
    }
    if (!accept) allAccept = false;
  }
  process.stdout.write(`verify-run: ${allAccept ? 'ACCEPT' : 'REJECT'}\n`);
  process.exit(allAccept ? 0 : 1);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  main();
}
