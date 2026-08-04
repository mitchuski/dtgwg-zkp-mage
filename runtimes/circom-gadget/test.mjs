// circom-gadget test suite — proofs must actually verify (groth16 / bn128).
//
// Z1 honest member proof verifies       Z6  tampered public nullifier fails
// Z2 harness/circuit algebra mirror     Z7  wrong-context transplant fails
// Z3 cross-context unlinkability        Z8  measurements (informative)
// Z4 self-Sybil -> same nullifier       Z9  transcript binding (swap fails)
// Z5 non-member fails                   Z10 nullifier stable across transcripts
//
// No Date.now in test logic; performance.now appears only in Z8's informative
// measurement prints.

import { statSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import * as snarkjs from 'snarkjs';
import { ensureArtifacts } from './setup.mjs';
import {
  enrolField,
  buildTree,
  contextField,
  transcriptField,
  nullifierField,
  makeInput,
  FIELD_PRIME,
} from './harness.mjs';
import { descriptorDigest } from '../canonical/canonical.mjs';

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

// Two real §6.2 descriptors (all 11 required fields; canonical module validates).
const descriptorA = {
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
const descriptorB = {
  ...descriptorA,
  contextAuthority: 'did:example:library-authority',
  contextPolicy: 'ctx-policy/library/1',
  purpose: 'purpose:borrow-quota',
  scope: 'scope:library-2026',
  verifierSet: 'verifier-set:library-desk',
};

// Two real §15.2 canonical transcripts (all 13 required fields; canonical
// module validates). Both are presentations IN CONTEXT A — same descriptor
// digest — differing only in per-presentation fields (challenge, sessionId),
// which is exactly the replay-cross-transcript shape Z9/Z10 exercise.
function makeTranscript(descriptor, challenge, sessionId) {
  return {
    protocol: 'dtg-zkp/0.1',
    profile: 'epp/1',
    verifier: 'verifier:assembly-gate/desk-1',
    contextDescriptorDigest: descriptorDigest(descriptor),
    purpose: descriptor.purpose,
    scope: descriptor.scope,
    challenge,
    sessionId,
    requestedPredicates: ['PR-UNQ'],
    policyRequirements: 'policy:assembly-admission/1',
    expiry: 'expiry:transcript-ttl-300s/utc',
    snapshotRequirements: 'snapshot:registry-head/1',
    encodingVersion: 'dtg-zkp/transcript/v0',
  };
}
const transcriptA = makeTranscript(descriptorA, 'challenge:0xaaaa', 'session:0001');
const transcriptB = makeTranscript(descriptorA, 'challenge:0xbbbb', 'session:0002');

const measurements = {};

async function main() {
  process.stdout.write('circom-gadget — nullifier + membership (groth16/bn128)\n');
  const art = ensureArtifacts();

  const prove = async (input) => {
    const t0 = performance.now();
    const out = await snarkjs.groth16.fullProve(input, art.wasm, art.zkey);
    out.ms = performance.now() - t0;
    return out;
  };
  const vkey = JSON.parse(
    (await import('node:fs')).readFileSync(art.vkey, 'utf8')
  );
  const verify = async (proof, publicSignals) => {
    const t0 = performance.now();
    const res = await snarkjs.groth16.verify(vkey, publicSignals, proof);
    measurements.verifyMs = performance.now() - t0;
    return res;
  };

  // enrol 4 humans, build the accredited-set tree
  const humans = ['ada', 'grace', 'hedy', 'mitch'];
  const enrolled = [];
  for (const h of humans) enrolled.push(await enrolField(h));
  const tree = await buildTree(enrolled.map((e) => e.commitment));

  const ctxA = contextField(descriptorA);
  const ctxB = contextField(descriptorB);
  const tdA = transcriptField(transcriptA);
  const tdB = transcriptField(transcriptB);

  // --- Z1: honest member proof verifies --------------------------------------
  let z1 = null;
  await check('Z1', 'honest member proof verifies (real §6.2 descriptor context)', async () => {
    const { input, nullifier } = await makeInput({
      secret: enrolled[1].secret,
      blinding: enrolled[1].blinding,
      tree,
      leafIndex: 1,
      context: ctxA,
      transcriptDigest: tdA,
    });
    const { proof, publicSignals, ms } = await prove(input);
    measurements.proveMs = ms;
    const v = await verify(proof, publicSignals);
    assert(v === true, 'proof did not verify');
    z1 = { proof, publicSignals, nullifier, input };
  });

  // --- Z2: JS harness mirrors the circuit algebra -----------------------------
  await check('Z2', 'harness nullifier equals circuit public nullifier', async () => {
    assert(z1, 'Z1 fixture missing');
    // public signal order: [context, root, nullifier, transcriptDigest]
    // (declaration order)
    assert(BigInt(z1.publicSignals[0]) === ctxA, 'context slot mismatch');
    assert(BigInt(z1.publicSignals[1]) === tree.root, 'root slot mismatch');
    assert(BigInt(z1.publicSignals[2]) === z1.nullifier, 'nullifier mirror mismatch');
    assert(BigInt(z1.publicSignals[3]) === tdA, 'transcriptDigest slot mismatch');
  });

  // --- Z3: cross-context unlinkability ----------------------------------------
  let z3b = null;
  await check('Z3', 'same secret, two descriptors -> two nullifiers; both verify', async () => {
    assert(ctxA !== ctxB, 'descriptor digests collided');
    const b = await makeInput({
      secret: enrolled[1].secret,
      blinding: enrolled[1].blinding,
      tree,
      leafIndex: 1,
      context: ctxB,
      transcriptDigest: tdA,
    });
    assert(b.nullifier !== z1.nullifier, 'nullifiers linkable across contexts');
    const { proof, publicSignals } = await prove(b.input);
    assert(await verify(proof, publicSignals), 'context-B proof did not verify');
    z3b = { proof, publicSignals };
  });

  // --- Z4: self-Sybil -> same nullifier both times ----------------------------
  await check('Z4', 'same secret + same context proved twice -> SAME nullifier', async () => {
    const again = await makeInput({
      secret: enrolled[1].secret,
      blinding: enrolled[1].blinding,
      tree,
      leafIndex: 1,
      context: ctxA,
      transcriptDigest: tdA,
    });
    const { proof, publicSignals } = await prove(again.input);
    assert(await verify(proof, publicSignals), 'second proof did not verify');
    assert(
      BigInt(publicSignals[2]) === z1.nullifier,
      'duplicate action produced a different nullifier — registry dedup would miss it'
    );
  });

  // --- Z5: non-member fails ---------------------------------------------------
  await check('Z5', 'non-member cannot prove (witness fails or proof rejected)', async () => {
    const outsider = await enrolField('eve-not-enrolled');
    const { pathElements, pathIndices } = tree.path(0); // a path, but not hers
    const nullifier = await nullifierField(outsider.secret, ctxA);
    const input = {
      secret: outsider.secret.toString(),
      blinding: outsider.blinding.toString(),
      pathElements: pathElements.map(String),
      pathIndices: pathIndices.map(String),
      context: ctxA.toString(),
      root: tree.root.toString(),
      nullifier: nullifier.toString(),
      transcriptDigest: tdA.toString(),
    };
    process.stdout.write(
      '       (a witness-generation constraint ERROR printed by snarkjs here is EXPECTED)\n'
    );
    let witnessFailed = false;
    let verified = null;
    try {
      const { proof, publicSignals } = await prove(input);
      verified = await verify(proof, publicSignals);
    } catch {
      witnessFailed = true; // constraint assert during witness generation
    }
    assert(
      witnessFailed || verified === false,
      'non-member produced a verifying membership proof'
    );
  });

  // --- Z6: tampered public nullifier fails ------------------------------------
  await check('Z6', 'flipped public nullifier -> verify false', async () => {
    const tampered = [...z1.publicSignals];
    tampered[2] = ((BigInt(tampered[2]) + 1n) % FIELD_PRIME).toString();
    const v = await snarkjs.groth16.verify(vkey, tampered, z1.proof);
    assert(v === false, 'tampered nullifier still verified');
  });

  // --- Z7: wrong-context transplant fails -------------------------------------
  await check('Z7', 'proof for context A fails against public context B', async () => {
    const transplanted = [...z1.publicSignals];
    transplanted[0] = ctxB.toString();
    const v = await snarkjs.groth16.verify(vkey, transplanted, z1.proof);
    assert(v === false, 'context transplant still verified');
    // and the reverse: context-B proof against context A
    const rev = [...z3b.publicSignals];
    rev[0] = ctxA.toString();
    assert(
      (await snarkjs.groth16.verify(vkey, rev, z3b.proof)) === false,
      'reverse transplant still verified'
    );
  });

  // --- Z9: transcript binding — swapped transcriptDigest fails ----------------
  // The §15.1/§26.1 replay-cross-transcript rejection, now cryptographic: a
  // proof generated against transcript A does NOT verify when presented under
  // transcript B's public digest.
  await check('Z9', 'proof bound to transcript A fails against public transcript B', async () => {
    assert(z1, 'Z1 fixture missing');
    assert(tdA !== tdB, 'transcript digests collided');
    const replayed = [...z1.publicSignals];
    replayed[3] = tdB.toString();
    const v = await snarkjs.groth16.verify(vkey, replayed, z1.proof);
    assert(v === false, 'replayed proof verified under a different transcript');
    // sanity: same proof still verifies against its own transcript
    assert(
      (await snarkjs.groth16.verify(vkey, z1.publicSignals, z1.proof)) === true,
      'original proof no longer verifies'
    );
  });

  // --- Z10: nullifier unchanged across transcripts in the same context --------
  // The binding distinction: the PROOF binds the transcript (Z9); the
  // NULLIFIER binds the context only — two presentations of the same secret in
  // the same context under different transcripts yield the SAME nullifier
  // (registry dedup still works), while each proof verifies only against its
  // own transcript.
  await check('Z10', 'same secret+context, transcripts A/B -> same nullifier, both proofs verify', async () => {
    assert(z1, 'Z1 fixture missing');
    const underB = await makeInput({
      secret: enrolled[1].secret,
      blinding: enrolled[1].blinding,
      tree,
      leafIndex: 1,
      context: ctxA,
      transcriptDigest: tdB,
    });
    assert(
      underB.nullifier === z1.nullifier,
      'nullifier moved with the transcript — transcript leaked into the nullifier preimage'
    );
    const { proof, publicSignals } = await prove(underB.input);
    assert(await verify(proof, publicSignals), 'transcript-B proof did not verify');
    assert(BigInt(publicSignals[2]) === z1.nullifier, 'public nullifier differs across transcripts');
    assert(BigInt(publicSignals[3]) === tdB, 'transcript-B digest slot mismatch');
  });

  // --- Z8: measurements (informative — always passes, prints numbers) ---------
  await check('Z8', 'measurements (informative)', async () => {
    const r1cs = await snarkjs.r1cs.info(art.r1cs);
    const proofBytes = Buffer.byteLength(JSON.stringify(z1.proof), 'utf8');
    const vkeyBytes = statSync(art.vkey).size;
    const zkeyBytes = statSync(art.zkey).size;
    const wasmBytes = statSync(art.wasm).size;
    process.stdout.write(
      [
        `       constraints : ${r1cs.nConstraints} (vars ${r1cs.nVars}, public inputs ${r1cs.nPubInputs})`,
        `                     (pre-transcript-binding baseline was 11,522 — expect ~+1 for the dummy-square)`,
        `       prove time  : ${measurements.proveMs.toFixed(0)} ms (groth16 fullProve, this machine)`,
        `       verify time : ${measurements.verifyMs.toFixed(1)} ms`,
        `       proof size  : ${proofBytes} bytes (JSON)`,
        `       vkey size   : ${vkeyBytes} bytes (JSON)`,
        `       zkey size   : ${(zkeyBytes / 1024 / 1024).toFixed(1)} MB · witness wasm ${(wasmBytes / 1024).toFixed(0)} KB`,
      ].join('\n') + '\n'
    );
  });

  const pass = results.filter(Boolean).length;
  process.stdout.write(`circom-gadget: ${pass}/${results.length} pass\n`);
  process.exit(pass === results.length ? 0 : 1);
}

main().catch((e) => {
  process.stderr.write(`fatal: ${e.stack}\n`);
  process.exit(1);
});
