// guardian-threshold circuit test suite — proofs must actually verify (groth16/bn128).
//
// G1c honest 3-of-5 committed set verifies      G5c claim transplant fails verification
// G2c SAME guardian twice -> UNSATISFIABLE      G6c cross-context unlinkability
// G3c non-member 'guardian' fails inclusion     G7c tampered public nullifier fails
// G4c mirror + seat property (same context,     G8c measurements + ratios vs single/dual
//     two claims -> SAME nullifiers)
//
// No Date.now in test logic; performance.now appears only in G8c's informative
// measurement prints.

import { statSync, readFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import * as snarkjs from 'snarkjs';
import { ensureGuardianArtifacts } from './setup-guardian.mjs';
import { descriptorDigest } from '../canonical/canonical.mjs';
import {
  enrolGuardianField,
  buildTree,
  recoveryContextField,
  claimDigestField,
  guardianNullifierField,
  makeGuardianInput,
  FIELD_PRIME,
} from './harness-guardian.mjs';

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

// A plausible §6.2 RECOVERY-DOMAIN descriptor (X9/§13.4: the recovery domain
// is its own governed context; the guardian EPOCH lives INSIDE it — epoch
// rollover means a new descriptor digest, hence a fresh seat nullifier).
const recoveryDescriptorA = {
  protocol: 'dtg-zkp/0.1',
  profile: 'epp/1',
  contextAuthority: 'did:example:recovery-authority',
  contextPolicy: 'ctx-policy/recovery/1',
  purpose: 'purpose:continuity-recovery',
  scope: 'scope:recovery-domain-alpha',
  verifierSet: 'verifier-set:recovery-checkers',
  epoch: 'guardian-epoch:2026-A',
  epochPolicy: 'epoch-policy:guardian-reaffirmation/1',
  nullifierVersion: 'dtg-zkp/guardian-seat-nullifier/v0',
  retentionPolicy: 'retention:epoch-end-purge/1',
};
// A second recovery domain (different scope + epoch): G6c's unlinkability.
const recoveryDescriptorB = {
  ...recoveryDescriptorA,
  scope: 'scope:recovery-domain-beta',
  epoch: 'guardian-epoch:2026-B',
};

// §15.2 ceremony transcripts — one per continuity claim (per-ceremony
// challenge + sessionId). The transcript carries the recovery descriptor by
// digest; the claim digest binds newCommitment + revokedRef + transcript.
function ceremonyTranscript(descriptor, challenge, sessionId) {
  return {
    protocol: 'dtg-zkp/0.1',
    profile: 'epp/1',
    verifier: 'verifier-set:recovery-checkers',
    contextDescriptorDigest: descriptorDigest(descriptor),
    purpose: 'purpose:continuity-recovery',
    scope: descriptor.scope,
    challenge,
    sessionId,
    requestedPredicates: ['PR-UNQ/1'],
    policyRequirements: 'policy:guardian-threshold-3of5/1',
    expiry: 'expiry:2026-07-18T23:59:59Z',
    snapshotRequirements: 'snapshot:guardian-set@guardian-epoch:2026-A',
    encodingVersion: 'dtg-zkp/canonical/v0',
  };
}

// Two DIFFERENT continuity claims in recovery domain A (different replacement
// commitment, own ceremony transcript) — G4c's seat property + G5c's transplant.
const claimA = {
  newCommitment: 'commit:new-0xaaaa-replacement',
  revokedRef: 'commit:old-0x1111-lost',
  transcript: ceremonyTranscript(recoveryDescriptorA, 'challenge:3f9a-ceremony-A', 'session:recovery-001'),
};
const claimB = {
  newCommitment: 'commit:new-0xbbbb-attacker-swap',
  revokedRef: 'commit:old-0x1111-lost',
  transcript: ceremonyTranscript(recoveryDescriptorA, 'challenge:b2e4-ceremony-B', 'session:recovery-002'),
};

const measurements = {};

async function main() {
  process.stdout.write('circom-gadget-guardian — guardian threshold, X9 t-of-n t=3 (groth16/bn128)\n');
  const art = ensureGuardianArtifacts();

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

  // enrol 5 guardians, build the COMMITTED guardian-set tree (n=5; the circuit
  // proves t=3 of them, signer subset hidden)
  const guardianIds = [
    'guardian-anselm',
    'guardian-brigid',
    'guardian-cormac',
    'guardian-deirdre',
    'guardian-eamon',
  ];
  const guardians = [];
  for (const id of guardianIds) guardians.push(await enrolGuardianField(id));
  const tree = await buildTree(guardians.map((g) => g.commitment));

  const ctxA = recoveryContextField(recoveryDescriptorA);
  const ctxB = recoveryContextField(recoveryDescriptorB);
  const digestA = claimDigestField(claimA);
  const digestB = claimDigestField(claimB);

  // --- G1c: honest 3-of-5 from the committed set verifies ----------------------
  let g1 = null;
  await check('G1c', 'honest proof, 3 distinct guardians of committed 5, verifies', async () => {
    const made = await makeGuardianInput({
      guardians: [guardians[0], guardians[2], guardians[4]],
      tree,
      leafIndices: [0, 2, 4],
      recoveryContext: ctxA,
      claimDigest: digestA,
    });
    const { proof, publicSignals, ms } = await prove(made.input);
    measurements.proveMs = ms;
    const v = await verify(proof, publicSignals);
    assert(v === true, 'proof did not verify');
    g1 = { ...made, proof, publicSignals };
  });

  // --- G2c: same guardian in two legs -> witness UNSATISFIABLE -----------------
  await check('G2c', 'SAME guardian in two legs -> witness generation FAILS (distinctness)', async () => {
    const dup = await makeGuardianInput({
      guardians: [guardians[1], guardians[1], guardians[3]], // duplicate seat — harness allows, circuit must not
      tree,
      leafIndices: [1, 1, 3],
      recoveryContext: ctxA,
      claimDigest: digestA,
    });
    assert(dup.nullifiers[0] === dup.nullifiers[1], 'fixture broken: duplicate guardian nullifiers differ');
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
      'duplicate guardian seat PRODUCED a proof — in-circuit distinctness did not hold'
    );
  });

  // --- G3c: non-member 'guardian' fails inclusion ------------------------------
  await check('G3c', "non-member 'guardian' (outside the committed set) cannot prove", async () => {
    const outsider = await enrolGuardianField('guardian-sockpuppet');
    const otherTree = await buildTree([outsider.commitment, guardians[3].commitment]);
    const made = await makeGuardianInput({
      guardians: [guardians[0], guardians[2], outsider],
      tree, // paths taken from the committed tree...
      leafIndices: [0, 2, 4], // ...position 4 is guardian-eamon's, not the outsider's
      recoveryContext: ctxA,
      claimDigest: digestA,
    });
    // splice in the outsider's real path from the OTHER tree (root stays ours)
    const op = otherTree.path(0);
    made.input.pathElements[2] = op.pathElements.map(String);
    made.input.pathIndices[2] = op.pathIndices.map(String);
    process.stdout.write(
      '       (a witness-generation constraint ERROR printed by snarkjs here is EXPECTED)\n'
    );
    let witnessFailed = false;
    let verified = null;
    try {
      const { proof, publicSignals } = await prove(made.input);
      verified = await verify(proof, publicSignals);
    } catch {
      witnessFailed = true; // mt.root === guardianRoot fails for leg 3
    }
    assert(
      witnessFailed || verified === false,
      'non-member guardian produced a verifying threshold proof'
    );
  });

  // --- G4c: mirror + the seat property ----------------------------------------
  let g4 = null;
  await check('G4c', 'mirror nullifiers = circuit publics; same context, two claims -> SAME seat nullifiers, both verify', async () => {
    assert(g1, 'G1c fixture missing');
    // public signal order: [recoveryContext, guardianRoot, claimDigest, nullifiers[0..2]]
    assert(BigInt(g1.publicSignals[0]) === ctxA, 'recoveryContext slot mismatch');
    assert(BigInt(g1.publicSignals[1]) === tree.root, 'guardianRoot slot mismatch');
    assert(BigInt(g1.publicSignals[2]) === digestA, 'claimDigest slot mismatch');
    for (let i = 0; i < 3; i++) {
      assert(BigInt(g1.publicSignals[3 + i]) === g1.nullifiers[i], `nullifier[${i}] mirror mismatch`);
    }
    // SAME guardians + SAME recoveryContext, DIFFERENT continuity claim:
    assert(digestA !== digestB, 'claim digests collided');
    const b = await makeGuardianInput({
      guardians: [guardians[0], guardians[2], guardians[4]],
      tree,
      leafIndices: [0, 2, 4],
      recoveryContext: ctxA,
      claimDigest: digestB,
    });
    for (let i = 0; i < 3; i++) {
      // the SEAT property: one seat per human per recovery context+epoch —
      // the nullifier is claim-independent, so double-vouching across rival
      // claims in one context is DETECTABLE registry-side (§6.5 intentional
      // in-context linkage; the reference model's contested-recovery path)
      assert(b.nullifiers[i] === g1.nullifiers[i], `seat nullifier[${i}] moved across claims`);
    }
    const { proof, publicSignals } = await prove(b.input);
    assert(await verify(proof, publicSignals), 'claim-B proof did not verify');
    g4 = { ...b, proof, publicSignals };
  });

  // --- G5c: claim transplant fails ---------------------------------------------
  await check('G5c', 'proof for claim A fails verification against public claim B (no bundle transplant)', async () => {
    assert(g1 && g4, 'fixtures missing');
    const t = [...g1.publicSignals];
    t[2] = digestB.toString(); // transplant the guardian bundle onto the rival claim
    assert(
      (await snarkjs.groth16.verify(vkey, t, g1.proof)) === false,
      'claim-transplanted proof still verified — dummy-square binding did not hold'
    );
    // and the reverse: claim-B proof cannot serve claim A
    const t2 = [...g4.publicSignals];
    t2[2] = digestA.toString();
    assert(
      (await snarkjs.groth16.verify(vkey, t2, g4.proof)) === false,
      'reverse claim transplant still verified'
    );
  });

  // --- G6c: cross-context unlinkability ----------------------------------------
  await check('G6c', 'same guardians, different recovery context -> unrelated nullifiers, proof verifies', async () => {
    assert(ctxA !== ctxB, 'recovery descriptor digests collided');
    const b = await makeGuardianInput({
      guardians: [guardians[0], guardians[2], guardians[4]], // SAME three as G1c
      tree,
      leafIndices: [0, 2, 4],
      recoveryContext: ctxB,
      claimDigest: digestA, // claim held fixed: only the context moves
    });
    for (const nb of b.nullifiers) {
      for (const na of g1.nullifiers) {
        assert(nb !== na, 'guardian seat linkable across recovery contexts (§6.6 violation)');
      }
    }
    const { proof, publicSignals } = await prove(b.input);
    assert(await verify(proof, publicSignals), 'context-B proof did not verify');
  });

  // --- G7c: tampered public nullifier fails ------------------------------------
  await check('G7c', 'flipped public nullifier -> verify false (all three slots)', async () => {
    for (let i = 0; i < 3; i++) {
      const t = [...g1.publicSignals];
      t[3 + i] = ((BigInt(t[3 + i]) + 1n) % FIELD_PRIME).toString();
      assert(
        (await snarkjs.groth16.verify(vkey, t, g1.proof)) === false,
        `tampered nullifier[${i}] still verified`
      );
    }
  });

  // --- G8c: measurements (informative — always passes, prints numbers) ---------
  await check('G8c', 'measurements (informative)', async () => {
    const guardian = await snarkjs.r1cs.info(art.r1cs);
    const singleO1 = await snarkjs.r1cs.info(art.singleR1cs); // shipped gadget (--O1)
    const singleO2 = await snarkjs.r1cs.info(art.singleO2R1cs); // like-for-like ref (--O2)
    const dual = await snarkjs.r1cs.info(art.dualR1cs); // sibling (--O2)
    const proofBytes = Buffer.byteLength(JSON.stringify(g1.proof), 'utf8');
    const vkeyBytes = statSync(art.vkey).size;
    const zkeyBytes = statSync(art.zkey).size;
    const wasmBytes = statSync(art.wasm).size;
    const n = Number(guardian.nConstraints);
    const rO2 = n / Number(singleO2.nConstraints);
    const rO1 = n / Number(singleO1.nConstraints);
    const rDual = n / Number(dual.nConstraints);
    process.stdout.write(
      [
        `       constraints : ${n} (vars ${guardian.nVars}, public inputs ${guardian.nPubInputs}) [guardian, --O2]`,
        `       vs single   : ${singleO2.nConstraints} (--O2 like-for-like) -> ratio ${rO2.toFixed(3)}x`,
        `                     ${singleO1.nConstraints} (--O1 as shipped/NOTES 11,523) -> ratio ${rO1.toFixed(3)}x`,
        `       vs dual     : ${dual.nConstraints} (--O2, NOTES 10,717) -> ratio ${rDual.toFixed(3)}x`,
        `       overhead    : ${n - 3 * Number(singleO2.nConstraints)} constraints over 3x the O2 single (3 distinctness + 1 claim binding expected)`,
        `       ptau headroom: ${16384 - n} constraints under the cached 2^14 cap (16,384)`,
        `       prove time  : ${measurements.proveMs.toFixed(0)} ms (groth16 fullProve, this machine)`,
        `       verify time : ${measurements.verifyMs.toFixed(1)} ms`,
        `       proof size  : ${proofBytes} bytes (JSON)`,
        `       vkey size   : ${vkeyBytes} bytes (JSON)`,
        `       zkey size   : ${(zkeyBytes / 1024 / 1024).toFixed(1)} MB · witness wasm ${(wasmBytes / 1024).toFixed(0)} KB`,
      ].join('\n') + '\n'
    );
    measurements.guardianConstraints = n;
  });

  const pass = results.filter(Boolean).length;
  process.stdout.write(`circom-gadget-guardian: ${pass}/${results.length} pass\n`);
  process.exit(pass === results.length ? 0 : 1);
}

main().catch((e) => {
  process.stderr.write(`fatal: ${e.stack}\n`);
  process.exit(1);
});
