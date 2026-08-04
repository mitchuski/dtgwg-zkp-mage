// Proving pipeline for the dual-issuer sibling circuit (X8 k=2).
//
// Mirrors setup.mjs (check-then-skip caching, same LAB-ONLY trusted-setup
// caveat, same fixed entropy string) but REUSES the cached 2^14 powers-of-tau
// in build/ — only the new circuit is compiled and set up. The ptau block is
// replicated verbatim so a fresh clone still self-builds, but on this tree it
// is a cache hit and never re-runs.
//
// Compile flag decision: the dual circuit is compiled with --O2. Under the
// default --O1 the single gadget is 11,522 total constraints (5,427
// non-linear + 6,095 linear); doubling it (~23k) would overflow the 2^14 ptau
// (16,384-constraint cap). --O2 substitutes the linear constraints away,
// leaving the ~2x5.4k non-linear core, which fits. For a like-for-like
// constraint ratio, the single circuit is ALSO compiled once with --O2 into
// build/o2-ref/ (r1cs only, informative — its shipped O1 artifacts are
// untouched).

import { execSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const BUILD = path.join(DIR, 'build');
const ENTROPY = 'dtg-zkp-lab-entropy-v0';

export const DUAL_ARTIFACTS = {
  r1cs: path.join(BUILD, 'dual_issuer.r1cs'),
  wasm: path.join(BUILD, 'dual_issuer_js', 'dual_issuer.wasm'),
  ptauFinal: path.join(BUILD, 'pot14_final.ptau'), // SHARED with setup.mjs (cached, reused)
  zkey: path.join(BUILD, 'dual_issuer_final.zkey'),
  vkey: path.join(BUILD, 'dual_issuer_verification_key.json'),
  // informative: single gadget recompiled under --O2 for the D7 ratio
  singleO2R1cs: path.join(BUILD, 'o2-ref', 'nullifier_membership.r1cs'),
  // the shipped single-gadget r1cs (O1), for the headline comparison
  singleR1cs: path.join(BUILD, 'nullifier_membership.r1cs'),
};

function run(cmd, label) {
  process.stdout.write(`  .. ${label}\n`);
  execSync(cmd, { cwd: DIR, stdio: ['ignore', 'pipe', 'pipe'] });
}

export function ensureDualArtifacts() {
  // 1. compile (--O2 — see header)
  if (!existsSync(DUAL_ARTIFACTS.r1cs) || !existsSync(DUAL_ARTIFACTS.wasm)) {
    run(
      'circom circuits/dual_issuer.circom --r1cs --wasm --O2 -o build -l node_modules',
      'circom compile dual_issuer (r1cs + wasm, --O2)'
    );
  }

  // 1b. informative O2 reference compile of the single gadget (r1cs only,
  //     separate dir — existing build/ artifacts untouched)
  if (!existsSync(DUAL_ARTIFACTS.singleO2R1cs)) {
    mkdirSync(path.join(BUILD, 'o2-ref'), { recursive: true });
    run(
      'circom circuits/nullifier_membership.circom --r1cs --O2 -o build/o2-ref -l node_modules',
      'circom compile nullifier_membership --O2 (reference for ratio)'
    );
  }

  // 2. powers of tau — same files as setup.mjs; on this tree this is a cache
  //    hit (REUSED, not rebuilt)
  if (!existsSync(DUAL_ARTIFACTS.ptauFinal)) {
    const p0 = path.join(BUILD, 'pot14_0000.ptau');
    const p1 = path.join(BUILD, 'pot14_0001.ptau');
    run(`npx snarkjs powersoftau new bn128 14 "${p0}"`, 'ptau new (2^14)');
    run(
      `npx snarkjs powersoftau contribute "${p0}" "${p1}" --name="dtg-zkp-lab" -e="${ENTROPY}"`,
      'ptau contribute (fixed lab entropy)'
    );
    run(
      `npx snarkjs powersoftau prepare phase2 "${p1}" "${DUAL_ARTIFACTS.ptauFinal}"`,
      'ptau prepare phase2'
    );
  }

  // 3. groth16 setup -> zkey -> verification key
  if (!existsSync(DUAL_ARTIFACTS.zkey)) {
    const z0 = path.join(BUILD, 'dual_issuer_0000.zkey');
    run(
      `npx snarkjs groth16 setup "${DUAL_ARTIFACTS.r1cs}" "${DUAL_ARTIFACTS.ptauFinal}" "${z0}"`,
      'groth16 setup (dual)'
    );
    run(
      `npx snarkjs zkey contribute "${z0}" "${DUAL_ARTIFACTS.zkey}" --name="dtg-zkp-lab" -e="${ENTROPY}"`,
      'zkey contribute (fixed lab entropy)'
    );
  }
  if (!existsSync(DUAL_ARTIFACTS.vkey)) {
    run(
      `npx snarkjs zkey export verificationkey "${DUAL_ARTIFACTS.zkey}" "${DUAL_ARTIFACTS.vkey}"`,
      'export verification key (dual)'
    );
  }

  return DUAL_ARTIFACTS;
}

// standalone: node setup-dual.mjs
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  ensureDualArtifacts();
  process.stdout.write('dual-issuer artifacts ready in build/\n');
}
