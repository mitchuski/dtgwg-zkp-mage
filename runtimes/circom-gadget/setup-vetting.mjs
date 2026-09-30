// Proving pipeline for the hidden-vetting circuits (record 024, Groth16 route):
// vetting_attest (one vetter leg) and vetting_bind (the applicant's binding).
//
// Same discipline as setup-guardian.mjs: check-then-skip caching, staleness-
// aware (a circuit source newer than its r1cs invalidates r1cs/wasm/zkey/vkey;
// the ptau is circuit-independent and never invalidated), the SHARED cached
// 2^14 powers-of-tau, fixed lab entropy. LAB-ONLY trusted setup: a single
// contributor with a fixed entropy string is not a ceremony (X10 / CIRCUITS.md).
// Compiled --O2 like dual/guardian.

import { execSync } from 'node:child_process';
import { existsSync, statSync, rmSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const BUILD = path.join(DIR, 'build');
const ENTROPY = 'dtg-zkp-lab-entropy-v0';
const PTAU = path.join(BUILD, 'pot14_final.ptau');

function run(cmd, label) {
  process.stdout.write(`  .. ${label}\n`);
  execSync(cmd, { cwd: DIR, stdio: ['ignore', 'pipe', 'pipe'] });
}

function artifacts(name) {
  return {
    source: path.join(DIR, 'circuits', `${name}.circom`),
    r1cs: path.join(BUILD, `${name}.r1cs`),
    wasm: path.join(BUILD, `${name}_js`, `${name}.wasm`),
    zkey0: path.join(BUILD, `${name}_0000.zkey`),
    zkey: path.join(BUILD, `${name}_final.zkey`),
    vkey: path.join(BUILD, `${name}_verification_key.json`),
    ptauFinal: PTAU,
  };
}

function ensurePtau() {
  if (existsSync(PTAU)) return;
  const p0 = path.join(BUILD, 'pot14_0000.ptau');
  const p1 = path.join(BUILD, 'pot14_0001.ptau');
  run(`npx snarkjs powersoftau new bn128 14 "${p0}"`, 'ptau new (2^14)');
  run(`npx snarkjs powersoftau contribute "${p0}" "${p1}" --name="dtg-zkp-lab" -e="${ENTROPY}"`, 'ptau contribute (fixed lab entropy)');
  run(`npx snarkjs powersoftau prepare phase2 "${p1}" "${PTAU}"`, 'ptau prepare phase2');
}

function ensureCircuit(name) {
  const a = artifacts(name);
  if (existsSync(a.r1cs) && statSync(a.source).mtimeMs > statSync(a.r1cs).mtimeMs) {
    process.stdout.write(`  .. ${name}: circuit source newer than r1cs — invalidating (ptau kept)\n`);
    for (const p of [a.r1cs, path.join(BUILD, `${name}_js`), a.zkey0, a.zkey, a.vkey]) rmSync(p, { recursive: true, force: true });
  }
  if (!existsSync(a.r1cs) || !existsSync(a.wasm)) {
    run(`circom circuits/${name}.circom --r1cs --wasm --O2 -o build -l node_modules`, `circom compile ${name} (--O2)`);
    for (const p of [a.zkey0, a.zkey, a.vkey]) rmSync(p, { force: true });
  }
  if (!existsSync(a.zkey)) {
    run(`npx snarkjs groth16 setup "${a.r1cs}" "${PTAU}" "${a.zkey0}"`, `groth16 setup (${name})`);
    run(`npx snarkjs zkey contribute "${a.zkey0}" "${a.zkey}" --name="dtg-zkp-lab" -e="${ENTROPY}"`, `zkey contribute (${name}, fixed lab entropy)`);
  }
  if (!existsSync(a.vkey)) {
    run(`npx snarkjs zkey export verificationkey "${a.zkey}" "${a.vkey}"`, `export verification key (${name})`);
  }
  return a;
}

export function ensureVettingArtifacts() {
  mkdirSync(BUILD, { recursive: true });
  ensurePtau();
  return { attest: ensureCircuit('vetting_attest'), bind: ensureCircuit('vetting_bind') };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  ensureVettingArtifacts();
  process.stdout.write('hidden-vetting artifacts ready in build/\n');
}
