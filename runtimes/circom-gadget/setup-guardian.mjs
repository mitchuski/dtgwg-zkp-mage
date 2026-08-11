// Proving pipeline for the guardian-threshold circuit (X9 t-of-n, t=3).
//
// Mirrors setup-dual.mjs (check-then-skip caching, same LAB-ONLY trusted-setup
// caveat, same fixed entropy string) and is staleness-aware like the updated
// setup.mjs: a circuit source newer than the cached r1cs invalidates
// r1cs/wasm/zkey/vkey (the ptau files are circuit-independent and are NEVER
// invalidated). The cached 2^14 powers-of-tau in build/ is REUSED — only the
// new circuit is compiled and set up; the ptau block is replicated verbatim so
// a fresh clone still self-builds, but on this tree it is a cache hit.
//
// Compile flag decision: --O2, same reason as dual scaled up. Under --O1 the
// tripled circuit would be ~34k total constraints and overflow the 2^14 ptau
// (16,384-constraint cap); --O2 substitutes the linear constraints away,
// leaving the ~3x5.4k non-linear core + 3 distinctness + 1 claim binding,
// which fits (barely — see NOTES; t=4 at depth 20 would need pot15). The
// build/o2-ref/ single-gadget --O2 reference from setup-dual.mjs is reused
// for the like-for-like ratio (regenerated here if absent).

import { execSync } from 'node:child_process';
import { existsSync, statSync, rmSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const BUILD = path.join(DIR, 'build');
const ENTROPY = 'dtg-zkp-lab-entropy-v0';
const CIRCUIT = path.join(DIR, 'circuits', 'guardian_threshold.circom');

export const GUARDIAN_ARTIFACTS = {
  r1cs: path.join(BUILD, 'guardian_threshold.r1cs'),
  wasm: path.join(BUILD, 'guardian_threshold_js', 'guardian_threshold.wasm'),
  ptauFinal: path.join(BUILD, 'pot14_final.ptau'), // SHARED with setup.mjs/setup-dual.mjs (cached, reused)
  zkey: path.join(BUILD, 'guardian_threshold_final.zkey'),
  vkey: path.join(BUILD, 'guardian_threshold_verification_key.json'),
  // informative --O2 reference of the single gadget (shared with setup-dual.mjs)
  singleO2R1cs: path.join(BUILD, 'o2-ref', 'nullifier_membership.r1cs'),
  // the shipped single-gadget r1cs (O1) and the dual r1cs, for the G8c ratios
  singleR1cs: path.join(BUILD, 'nullifier_membership.r1cs'),
  dualR1cs: path.join(BUILD, 'dual_issuer.r1cs'),
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

export function ensureGuardianArtifacts() {
  mkdirSync(BUILD, { recursive: true }); // fresh clone: build/ is gitignored

  // 0. invalidate stale artifacts (circuit edited after last compile)
  if (existsSync(GUARDIAN_ARTIFACTS.r1cs) && newerThan(CIRCUIT, GUARDIAN_ARTIFACTS.r1cs)) {
    process.stdout.write('  .. circuit source newer than r1cs — invalidating r1cs/wasm/zkey/vkey (ptau kept)\n');
    for (const p of [
      GUARDIAN_ARTIFACTS.r1cs,
      path.join(BUILD, 'guardian_threshold_js'),
      path.join(BUILD, 'guardian_threshold_0000.zkey'),
      GUARDIAN_ARTIFACTS.zkey,
      GUARDIAN_ARTIFACTS.vkey,
    ]) {
      rmSync(p, { recursive: true, force: true });
    }
  }

  // 1. compile (--O2 — see header)
  if (!existsSync(GUARDIAN_ARTIFACTS.r1cs) || !existsSync(GUARDIAN_ARTIFACTS.wasm)) {
    run(
      'circom circuits/guardian_threshold.circom --r1cs --wasm --O2 -o build -l node_modules',
      'circom compile guardian_threshold (r1cs + wasm, --O2)'
    );
    // fresh r1cs -> any existing zkey/vkey are stale by construction
    rmSync(path.join(BUILD, 'guardian_threshold_0000.zkey'), { force: true });
    rmSync(GUARDIAN_ARTIFACTS.zkey, { force: true });
    rmSync(GUARDIAN_ARTIFACTS.vkey, { force: true });
  }

  // 1b. informative --O2 reference compile of the single gadget (r1cs only;
  //     normally already present from setup-dual.mjs — cache hit)
  if (!existsSync(GUARDIAN_ARTIFACTS.singleO2R1cs)) {
    mkdirSync(path.join(BUILD, 'o2-ref'), { recursive: true });
    run(
      'circom circuits/nullifier_membership.circom --r1cs --O2 -o build/o2-ref -l node_modules',
      'circom compile nullifier_membership --O2 (reference for ratio)'
    );
  }

  // 2. powers of tau — same files as setup.mjs; on this tree this is a cache
  //    hit (REUSED, not rebuilt)
  if (!existsSync(GUARDIAN_ARTIFACTS.ptauFinal)) {
    const p0 = path.join(BUILD, 'pot14_0000.ptau');
    const p1 = path.join(BUILD, 'pot14_0001.ptau');
    run(`npx snarkjs powersoftau new bn128 14 "${p0}"`, 'ptau new (2^14)');
    run(
      `npx snarkjs powersoftau contribute "${p0}" "${p1}" --name="dtg-zkp-lab" -e="${ENTROPY}"`,
      'ptau contribute (fixed lab entropy)'
    );
    run(
      `npx snarkjs powersoftau prepare phase2 "${p1}" "${GUARDIAN_ARTIFACTS.ptauFinal}"`,
      'ptau prepare phase2'
    );
  }

  // 3. groth16 setup -> zkey -> verification key
  if (!existsSync(GUARDIAN_ARTIFACTS.zkey)) {
    const z0 = path.join(BUILD, 'guardian_threshold_0000.zkey');
    run(
      `npx snarkjs groth16 setup "${GUARDIAN_ARTIFACTS.r1cs}" "${GUARDIAN_ARTIFACTS.ptauFinal}" "${z0}"`,
      'groth16 setup (guardian)'
    );
    run(
      `npx snarkjs zkey contribute "${z0}" "${GUARDIAN_ARTIFACTS.zkey}" --name="dtg-zkp-lab" -e="${ENTROPY}"`,
      'zkey contribute (fixed lab entropy)'
    );
  }
  if (!existsSync(GUARDIAN_ARTIFACTS.vkey)) {
    run(
      `npx snarkjs zkey export verificationkey "${GUARDIAN_ARTIFACTS.zkey}" "${GUARDIAN_ARTIFACTS.vkey}"`,
      'export verification key (guardian)'
    );
  }

  return GUARDIAN_ARTIFACTS;
}

// standalone: node setup-guardian.mjs
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  ensureGuardianArtifacts();
  process.stdout.write('guardian-threshold artifacts ready in build/\n');
}
