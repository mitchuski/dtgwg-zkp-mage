// dual-issuer circuit test suite — proofs must actually verify (groth16/bn128).
//
// D1 honest 2-distinct-issuer proof verifies    D5 tampered public nullifier fails
// D2 harness/circuit nullifier mirror           D6 member-of-wrong-tree fails
// D3 SAME issuer twice -> witness UNSATISFIABLE D7 measurements + ratio vs single
// D4 different shows -> different pairs, verify
//
// No Date.now in test logic; performance.now appears only in D7's informative
// measurement prints.

import { statSync, readFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import * as snarkjs from 'snarkjs';
import { ensureDualArtifacts } from './setup-dual.mjs';
import { descriptorDigest } from '../canonical/canonical.mjs';
import {
  enrolIssuerField,
  buildTree,
  showContextField,
  issuerNullifierField,
  makeDualInput,
  FIELD_PRIME,
} from './harness-dual.mjs';

const results = [];
function ok(id, msg) {
  results.push(true);
  process.stdout.write(`  ok  ${id} ${msg}\n`);
}
function fail(id, msg) {
  results.push(false);
  process.stdout.write(`  FAIL ${id} ${msg}\n`);
}
async function check(id, msg, fn) {
  try {
    await fn();
    ok(id, msg);
  } catch (e) {
    fail(id, `${msg} — ${e.message}`);
  }
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

// --- fixtures -----------------------------------------------------------------

// A real §6.2 descriptor (feeds the transcript's contextDescriptorDigest).
const descriptor = {
  protocol: 'dtg-zkp/0.1',
  profile: 'epp/1',
  contextAuthority: 'did:example:assembly-authority',
  contextPolicy: 'ctx-policy/assembly/1',
  purpose: 'purpose:admit-once',
  scope: 'scope:assembly-2026',
  verifierSet: 'verifier-set:assembly-gate',
  epoch: 'epoch:2026-Q3',
  epochPolicy: 'epoch-policy:quarterly/1',
  nullifierVersion: 'dtg-zkp/nullifier/v0',
  retentionPolicy: 'retention:epoch-end-purge/1',
};

// Two real §15.2 transcripts — same governed context, different SHOW
// (challenge + sessionId differ): the per-show fields are what scope the
// issuer nullifiers (D4's cross-show unlinkability hangs on this).
const transcriptA = {
  protocol: 'dtg-zkp/0.1',
  profile: 'epp/1',
  verifier: 'verifier-set:assembly-gate',
  contextDescriptorDigest: descriptorDigest(descriptor),
  purpose: 'purpose:admit-once',
  scope: 'scope:assembly-2026',
  challenge: 'challenge:7f3a-show-A',
  sessionId: 'session:dual-issuer-001',
  requestedPredicates: ['PR-PER/1'],
  policyRequirements: 'policy:epp-baseline/1',
  expiry: 'expiry:2026-07-18T23:59:59Z',
  snapshotRequirements: 'snapshot:issuer-registry@epoch:2026-Q3',
  encodingVersion: 'dtg-zkp/canonical/v0',
};
const transcriptB = {
  ...transcriptA,
  challenge: 'challenge:9c1e-show-B',
  sessionId: 'session:dual-issuer-002',
};

const measurements = {};

async function main() {
  process.stdout.write('circom-gadget-dual — dual-issuer aggregation, X8 k=2 (groth16/bn128)\n');
  const art = ensureDualArtifacts();

  const prove = async (input) => {
    const t0 = performance.now();
    const out = await snarkjs.groth16.fullProve(input, art.wasm, art.zkey);
    out.ms = performance.now() - t0;
    return out;
  };
  const vkey = JSON.parse(readFileSync(art.vkey, 'utf8'));
  const verify = async (proof, publicSignals) => {
    const t0 = performance.now();
    const res = await snarkjs.groth16.verify(vkey, publicSignals, proof);
    measurements.verifyMs = performance.now() - t0;
    return res;
  };

  // enrol 4 accredited issuers, build the accepted-issuer-set tree
  const issuerIds = ['issuer-alexandria', 'issuer-bologna', 'issuer-cordoba', 'issuer-dublin'];
  const issuers = [];
  for (const id of issuerIds) issuers.push(await enrolIssuerField(id));
  const tree = await buildTree(issuers.map((e) => e.commitment));

  const showA = showContextField(transcriptA);
  const showB = showContextField(transcriptB);

  // --- D1: honest 2-distinct-issuer proof verifies -----------------------------
  let d1 = null;
  await check('D1', 'honest proof, 2 distinct issuers under one root, verifies', async () => {
    const made = await makeDualInput({
      issuers: [issuers[0], issuers[2]],
      tree,
      leafIndices: [0, 2],
      showContext: showA,
    });
    const { proof, publicSignals, ms } = await prove(made.input);
    measurements.proveMs = ms;
    const v = await verify(proof, publicSignals);
    assert(v === true, 'proof did not verify');
    d1 = { ...made, proof, publicSignals };
  });

  // --- D2: JS harness mirrors the circuit algebra ------------------------------
  await check('D2', 'mirror nullifiers equal circuit public signals', async () => {
    assert(d1, 'D1 fixture missing');
    // public signal order: [showContext, root, nullifier1, nullifier2]
    assert(BigInt(d1.publicSignals[0]) === showA, 'showContext slot mismatch');
    assert(BigInt(d1.publicSignals[1]) === tree.root, 'root slot mismatch');
    assert(BigInt(d1.publicSignals[2]) === d1.nullifier1, 'nullifier1 mirror mismatch');
    assert(BigInt(d1.publicSignals[3]) === d1.nullifier2, 'nullifier2 mirror mismatch');
    assert(d1.nullifier1 !== d1.nullifier2, 'distinct issuers produced equal nullifiers');
  });

  // --- D3: same issuer twice -> witness generation UNSATISFIABLE ---------------
  await check('D3', 'SAME issuer in both legs -> witness generation FAILS (distinctness)', async () => {
    const dup = await makeDualInput({
      issuers: [issuers[1], issuers[1]], // duplicate — harness allows, circuit must not
      tree,
      leafIndices: [1, 1],
      showContext: showA,
    });
    assert(dup.nullifier1 === dup.nullifier2, 'fixture broken: duplicate issuer nullifiers differ');
    process.stdout.write(
      '       (a witness-generation constraint ERROR printed by snarkjs here is EXPECTED)\n'
    );
    let witnessFailed = false;
    try {
      await prove(dup.input);
    } catch {
      witnessFailed = true; // diff * inv === 1 unsatisfiable when diff = 0
    }
    assert(
      witnessFailed,
      'duplicate issuer PRODUCED a proof — in-circuit distinctness did not hold'
    );
  });

  // --- D4: different show contexts -> different pairs, both verify -------------
  await check('D4', 'different show -> different nullifier pair, proof verifies (no cross-show correlation)', async () => {
    assert(showA !== showB, 'transcript digests collided');
    const b = await makeDualInput({
      issuers: [issuers[0], issuers[2]], // SAME two issuers as D1
      tree,
      leafIndices: [0, 2],
      showContext: showB,
    });
    assert(b.nullifier1 !== d1.nullifier1, 'issuer 1 linkable across shows');
    assert(b.nullifier2 !== d1.nullifier2, 'issuer 2 linkable across shows');
    // and no cross-pairing either
    assert(b.nullifier1 !== d1.nullifier2 && b.nullifier2 !== d1.nullifier1, 'cross-pair collision');
    const { proof, publicSignals } = await prove(b.input);
    assert(await verify(proof, publicSignals), 'show-B proof did not verify');
  });

  // --- D5: tampered public nullifier fails -------------------------------------
  await check('D5', 'flipped public nullifier -> verify false (both slots)', async () => {
    const t1 = [...d1.publicSignals];
    t1[2] = ((BigInt(t1[2]) + 1n) % FIELD_PRIME).toString();
    assert(
      (await snarkjs.groth16.verify(vkey, t1, d1.proof)) === false,
      'tampered nullifier1 still verified'
    );
    const t2 = [...d1.publicSignals];
    t2[3] = ((BigInt(t2[3]) + 1n) % FIELD_PRIME).toString();
    assert(
      (await snarkjs.groth16.verify(vkey, t2, d1.proof)) === false,
      'tampered nullifier2 still verified'
    );
  });

  // --- D6: member-of-wrong-tree fails ------------------------------------------
  await check('D6', 'issuer from another tree cannot prove against this root', async () => {
    // a different accepted set (rogue registry) — issuer 1 leg valid, issuer 2
    // leg is an outsider carrying a path from the OTHER tree
    const outsider = await enrolIssuerField('issuer-rogue');
    const otherTree = await buildTree([outsider.commitment, issuers[3].commitment]);
    const made = await makeDualInput({
      issuers: [issuers[0], outsider],
      tree, // paths taken from the accepted tree...
      leafIndices: [0, 1], // ...position 1 is issuer-bologna's, not the outsider's
      showContext: showA,
    });
    // splice in the outsider's real path from the OTHER tree (root stays ours)
    const op = otherTree.path(0);
    made.input.pathElements2 = op.pathElements.map(String);
    made.input.pathIndices2 = op.pathIndices.map(String);
    process.stdout.write(
      '       (a witness-generation constraint ERROR printed by snarkjs here is EXPECTED)\n'
    );
    let witnessFailed = false;
    let verified = null;
    try {
      const { proof, publicSignals } = await prove(made.input);
      verified = await verify(proof, publicSignals);
    } catch {
      witnessFailed = true; // mt.root === root fails for leg 2
    }
    assert(
      witnessFailed || verified === false,
      'wrong-tree member produced a verifying dual proof'
    );
  });

  // --- D7: measurements (informative — always passes, prints numbers) ----------
  await check('D7', 'measurements (informative)', async () => {
    const dual = await snarkjs.r1cs.info(art.r1cs);
    const singleO1 = await snarkjs.r1cs.info(art.singleR1cs); // shipped gadget (--O1)
    const singleO2 = await snarkjs.r1cs.info(art.singleO2R1cs); // like-for-like ref (--O2)
    const proofBytes = Buffer.byteLength(JSON.stringify(d1.proof), 'utf8');
    const vkeyBytes = statSync(art.vkey).size;
    const zkeyBytes = statSync(art.zkey).size;
    const wasmBytes = statSync(art.wasm).size;
    const rO2 = Number(dual.nConstraints) / Number(singleO2.nConstraints);
    const rO1 = Number(dual.nConstraints) / Number(singleO1.nConstraints);
    process.stdout.write(
      [
        `       constraints : ${dual.nConstraints} (vars ${dual.nVars}, public inputs ${dual.nPubInputs}) [dual, --O2]`,
        `       vs single   : ${singleO2.nConstraints} (--O2 like-for-like) -> ratio ${rO2.toFixed(3)}x`,
        `                     ${singleO1.nConstraints} (--O1 as shipped/NOTES 11,522) -> ratio ${rO1.toFixed(3)}x`,
        `       distinctness overhead: ${Number(dual.nConstraints) - 2 * Number(singleO2.nConstraints)} constraints over 2x the O2 single`,
        `       prove time  : ${measurements.proveMs.toFixed(0)} ms (groth16 fullProve, this machine)`,
        `       verify time : ${measurements.verifyMs.toFixed(1)} ms`,
        `       proof size  : ${proofBytes} bytes (JSON)`,
        `       vkey size   : ${vkeyBytes} bytes (JSON)`,
        `       zkey size   : ${(zkeyBytes / 1024 / 1024).toFixed(1)} MB · witness wasm ${(wasmBytes / 1024).toFixed(0)} KB`,
      ].join('\n') + '\n'
    );
    measurements.dualConstraints = Number(dual.nConstraints);
    measurements.singleO2 = Number(singleO2.nConstraints);
    measurements.singleO1 = Number(singleO1.nConstraints);
  });

  const pass = results.filter(Boolean).length;
  process.stdout.write(`circom-gadget-dual: ${pass}/${results.length} pass\n`);
  process.exit(pass === results.length ? 0 : 1);
}

main().catch((e) => {
  process.stderr.write(`fatal: ${e.stack}\n`);
  process.exit(1);
});
