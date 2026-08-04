// Proving pipeline: circom compile -> local powers-of-tau -> groth16 setup.
//
// LAB-ONLY trusted setup. The ptau ceremony and zkey contribution below are a
// single local contribution with a FIXED entropy string — fine for a lab
// measurement rig, NOT a production ceremony (a real deployment needs a
// multi-party ceremony or a well-known ptau like Hermez's). See NOTES.md.
//
// Artifacts are cached in build/: each step is check-then-skip, so re-runs are
// fast and a fresh clone rebuilds identically (apart from proof randomness at
// prove time — the artifacts themselves are deterministic given the fixed
// entropy, modulo snarkjs's own internal randomness in contributions).

import { execSync } from 'node:child_process';
import { existsSync, statSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const BUILD = path.join(DIR, 'build');
const ENTROPY = 'dtg-zkp-lab-entropy-v0';
const CIRCUIT = path.join(DIR, 'circuits', 'nullifier_membership.circom');

export const ARTIFACTS = {
  r1cs: path.join(BUILD, 'nullifier_membership.r1cs'),
  wasm: path.join(BUILD, 'nullifier_membership_js', 'nullifier_membership.wasm'),
  ptauFinal: path.join(BUILD, 'pot14_final.ptau'),
  zkey: path.join(BUILD, 'nullifier_membership_final.zkey'),
  vkey: path.join(BUILD, 'verification_key.json'),
};

function run(cmd, label) {
  process.stdout.write(`  .. ${label}\n`);
  execSync(cmd, { cwd: DIR, stdio: ['ignore', 'pipe', 'pipe'] });
}

// Staleness: a circuit-source change MUST invalidate r1cs/wasm and everything
// derived from them (zkey/vkey). The ptau files are circuit-independent and
// are deliberately NEVER invalidated here (reusable cache).
function newerThan(a, b) {
  return statSync(a).mtimeMs > statSync(b).mtimeMs;
}

export function ensureArtifacts() {
  // 0. invalidate stale artifacts (circuit edited after last compile)
  if (existsSync(ARTIFACTS.r1cs) && newerThan(CIRCUIT, ARTIFACTS.r1cs)) {
    process.stdout.write('  .. circuit source newer than r1cs — invalidating r1cs/wasm/zkey/vkey (ptau kept)\n');
    for (const p of [
      ARTIFACTS.r1cs,
      path.join(BUILD, 'nullifier_membership_js'),
      path.join(BUILD, 'nullifier_membership_0000.zkey'),
      ARTIFACTS.zkey,
      ARTIFACTS.vkey,
    ]) {
      rmSync(p, { recursive: true, force: true });
    }
  }

  // 1. compile
  if (!existsSync(ARTIFACTS.r1cs) || !existsSync(ARTIFACTS.wasm)) {
    run(
      'circom circuits/nullifier_membership.circom --r1cs --wasm -o build -l node_modules',
      'circom compile (r1cs + wasm)'
    );
    // fresh r1cs -> any existing zkey/vkey are stale by construction
    rmSync(path.join(BUILD, 'nullifier_membership_0000.zkey'), { force: true });
    rmSync(ARTIFACTS.zkey, { force: true });
    rmSync(ARTIFACTS.vkey, { force: true });
  }

  // 2. powers of tau (bn128, 2^14 — circuit is ~5.3k constraints)
  if (!existsSync(ARTIFACTS.ptauFinal)) {
    const p0 = path.join(BUILD, 'pot14_0000.ptau');
    const p1 = path.join(BUILD, 'pot14_0001.ptau');
    run(`npx snarkjs powersoftau new bn128 14 "${p0}"`, 'ptau new (2^14)');
    run(
      `npx snarkjs powersoftau contribute "${p0}" "${p1}" --name="dtg-zkp-lab" -e="${ENTROPY}"`,
      'ptau contribute (fixed lab entropy)'
    );
    run(
      `npx snarkjs powersoftau prepare phase2 "${p1}" "${ARTIFACTS.ptauFinal}"`,
      'ptau prepare phase2'
    );
  }

  // 3. groth16 setup -> zkey -> verification key
  if (!existsSync(ARTIFACTS.zkey)) {
    const z0 = path.join(BUILD, 'nullifier_membership_0000.zkey');
    run(
      `npx snarkjs groth16 setup "${ARTIFACTS.r1cs}" "${ARTIFACTS.ptauFinal}" "${z0}"`,
      'groth16 setup'
    );
    run(
      `npx snarkjs zkey contribute "${z0}" "${ARTIFACTS.zkey}" --name="dtg-zkp-lab" -e="${ENTROPY}"`,
      'zkey contribute (fixed lab entropy)'
    );
  }
  if (!existsSync(ARTIFACTS.vkey)) {
    run(
      `npx snarkjs zkey export verificationkey "${ARTIFACTS.zkey}" "${ARTIFACTS.vkey}"`,
      'export verification key'
    );
  }

  return ARTIFACTS;
}

// standalone: node setup.mjs
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  ensureArtifacts();
  process.stdout.write('artifacts ready in build/\n');
}
