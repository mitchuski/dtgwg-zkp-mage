// report.mjs — structured run record + artifact digests (X10 lane 1).
//
// Emits build/report.<circuit>.json for every circuit whose artifacts exist:
//   pinned      — what must match across machines: sha256 + raw byte size per
//                 artifact, constraint/var/public-input counts. NO timestamps,
//                 NO machine-local values, fixed key order (byte-comparable).
//   informative — machine-local context: tool versions, platform, ISO date.
//                 NEVER consulted by acceptance (ceremony-orchestrator CO8).
//
// Maintainer mode: `node report.mjs --pin` additionally writes
// artifacts.manifest.json — the canonical digest set verify-run.mjs checks
// submissions against.
//
// EMPIRICAL RESULT (2026-08-11, same-machine full rebuild — see NOTES.md):
// snarkjs mixes its own CSPRNG randomness into powersoftau/zkey contributions
// REGARDLESS of the fixed -e entropy string, so ptau_final and everything
// derived from it (zkey_0000, zkey_final, vkey) are machine-local — they
// diverged even between two builds on the SAME machine. Only the compiled
// circuit (r1cs, wasm) is byte-exact across builds. Acceptance therefore
// requires r1cs/wasm digest + constraint-count identity, records the setup
// chain as advisory, and leans on the volunteer's own green suites (real
// proofs verified against their own build) for the proving-system claim.
//
// Zero new deps: snarkjs is already confined to this dir.

import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as snarkjs from 'snarkjs';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const BUILD = path.join(DIR, 'build');

export const FORMAT_VERSION = 'x10-verification/v0';

// Per-circuit artifact map. Keys inside `artifacts` are the manifest vocabulary;
// order here IS the emitted key order (byte-determinism of `pinned`).
export const CIRCUITS = {
  nullifier_membership: {
    compileFlags: '--O1',
    artifacts: {
      r1cs: path.join(BUILD, 'nullifier_membership.r1cs'),
      ptau_final: path.join(BUILD, 'pot14_final.ptau'),
      zkey_0000: path.join(BUILD, 'nullifier_membership_0000.zkey'),
      zkey_final: path.join(BUILD, 'nullifier_membership_final.zkey'),
      vkey: path.join(BUILD, 'verification_key.json'),
      wasm: path.join(BUILD, 'nullifier_membership_js', 'nullifier_membership.wasm'),
    },
  },
  dual_issuer: {
    compileFlags: '--O2',
    artifacts: {
      r1cs: path.join(BUILD, 'dual_issuer.r1cs'),
      ptau_final: path.join(BUILD, 'pot14_final.ptau'),
      zkey_0000: path.join(BUILD, 'dual_issuer_0000.zkey'),
      zkey_final: path.join(BUILD, 'dual_issuer_final.zkey'),
      vkey: path.join(BUILD, 'dual_issuer_verification_key.json'),
      wasm: path.join(BUILD, 'dual_issuer_js', 'dual_issuer.wasm'),
    },
  },
  guardian_threshold: {
    compileFlags: '--O2',
    artifacts: {
      r1cs: path.join(BUILD, 'guardian_threshold.r1cs'),
      ptau_final: path.join(BUILD, 'pot14_final.ptau'),
      zkey_0000: path.join(BUILD, 'guardian_threshold_0000.zkey'),
      zkey_final: path.join(BUILD, 'guardian_threshold_final.zkey'),
      vkey: path.join(BUILD, 'guardian_threshold_verification_key.json'),
      wasm: path.join(BUILD, 'guardian_threshold_js', 'guardian_threshold.wasm'),
    },
  },
};

// The setup chain is machine-local (contribution randomness — refuted
// empirically, see header); only the compiled circuit is byte-exact.
const ADVISORY_KEYS = new Set(['ptau_final', 'zkey_0000', 'zkey_final', 'vkey']);

export function sha256File(p) {
  return createHash('sha256').update(readFileSync(p)).digest('hex');
}

function toolVersions() {
  let circom = 'unavailable';
  try {
    circom = execSync('circom --version', { cwd: DIR, stdio: ['ignore', 'pipe', 'pipe'] })
      .toString().trim();
  } catch { /* circom not on PATH — report says so rather than failing */ }
  let snarkjsVersion = 'unavailable';
  try {
    snarkjsVersion = JSON.parse(
      readFileSync(path.join(DIR, 'node_modules', 'snarkjs', 'package.json'), 'utf8')
    ).version;
  } catch { /* dep dir absent */ }
  return { node: process.version, circom, snarkjs: snarkjsVersion };
}

export async function buildReport(circuitName) {
  const spec = CIRCUITS[circuitName];
  if (!spec) throw new Error(`unknown circuit: ${circuitName}`);
  const missing = Object.entries(spec.artifacts).filter(([, p]) => !existsSync(p));
  if (missing.length) {
    return { skipped: circuitName, missing: missing.map(([k]) => k) };
  }

  const artifacts = {};
  for (const [key, p] of Object.entries(spec.artifacts)) {
    artifacts[key] = { sha256: sha256File(p), bytes: statSync(p).size };
  }
  const info = await snarkjs.r1cs.info(spec.artifacts.r1cs);

  const pinned = {
    formatVersion: FORMAT_VERSION,
    circuit: circuitName,
    compileFlags: spec.compileFlags,
    constraints: {
      nConstraints: info.nConstraints,
      nVars: info.nVars,
      nPubInputs: info.nPubInputs,
    },
    artifacts,
  };
  const informative = {
    tools: toolVersions(),
    platform: { os: os.platform(), arch: os.arch(), cpu: os.cpus()[0]?.model ?? 'unknown' },
    date: new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC',
  };
  return { pinned, informative };
}

export function pinnedJson(report) {
  // canonical serialization of the pinned section alone (CO1 compares this)
  return JSON.stringify(report.pinned, null, 2) + '\n';
}

export function manifestFromReports(reports) {
  const circuits = {};
  for (const r of reports) {
    const entries = {};
    for (const [key, val] of Object.entries(r.pinned.artifacts)) {
      entries[key] = {
        sha256: val.sha256,
        bytes: val.bytes,
        acceptance: ADVISORY_KEYS.has(key) ? 'advisory' : 'required',
        determinism: ADVISORY_KEYS.has(key) ? 'machine-local (contribution randomness — refuted 2026-08-11)' : 'by-construction',
      };
    }
    circuits[r.pinned.circuit] = {
      compileFlags: r.pinned.compileFlags,
      constraints: r.pinned.constraints,
      artifacts: entries,
    };
  }
  return {
    formatVersion: FORMAT_VERSION,
    entropy: 'dtg-zkp-lab-entropy-v0 (lab fixture — see setup.mjs header)',
    ptau: 'pot14 (2^14), local fixed-entropy chain, shared across circuits',
    circuits,
  };
}

async function main() {
  const pin = process.argv.includes('--pin');
  const reports = [];
  for (const name of Object.keys(CIRCUITS)) {
    const r = await buildReport(name);
    if (r.skipped) {
      process.stdout.write(`  -- ${name}: skipped (missing: ${r.missing.join(', ')})\n`);
      continue;
    }
    const out = path.join(BUILD, `report.${name}.json`);
    writeFileSync(out, JSON.stringify(r, null, 2) + '\n');
    process.stdout.write(`  ok  report.${name}.json (${Object.keys(r.pinned.artifacts).length} artifacts digested)\n`);
    reports.push(r);
  }
  if (pin) {
    if (reports.length !== Object.keys(CIRCUITS).length) {
      process.stderr.write('refusing --pin: not all circuits built — run the three setups first\n');
      process.exit(1);
    }
    const manifest = manifestFromReports(reports);
    writeFileSync(path.join(DIR, 'artifacts.manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
    process.stdout.write('  ok  artifacts.manifest.json pinned from this build\n');
  }
  process.exit(0);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  main().catch((e) => {
    process.stderr.write(`fatal: ${e.stack}\n`);
    process.exit(1);
  });
}
