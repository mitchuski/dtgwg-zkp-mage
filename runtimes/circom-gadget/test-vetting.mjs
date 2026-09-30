// hidden-vetting test suite — record 024, Groth16 route (groth16/bn128).
// Proofs must actually verify; the community's admission check must count.
//
// H1  honest 5-of-10 admission: 5 leg proofs + 1 binding proof, counted
// H2  same vetter twice (two slots) -> tag-duplicate
// H3  non-enrolled 'vetter' cannot prove a leg (witness fails)
// H4  slot >= cap -> unsatisfiable: the per-vetter velocity cap is in-circuit
// H5  a serial spent for one applicant cannot be spent for another -> token-serial-spent
// H6  tampered statement digest -> statement-metadata-mismatch / proof invalid
// H7  a leg transplanted to another applicant fails verification
// H8  challenge replayed / not minted -> refused
// H9  someone holding the legs but not appSecret cannot bind them
// H10 per-vetter revocation by root update: stale root refused, revoked vetter
//     cannot prove, the others re-prove without re-issuance
// H11 unlinkability: one vetter's tags for two applicants differ, and no tag is
//     recomputable from anything public
// H12 measurements (informative)
//
// No Date.now in test logic; performance.now only in H12's measurement prints.

import { readFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import * as snarkjs from 'snarkjs';
import { ensureVettingArtifacts } from './setup-vetting.mjs';
import {
  enrolVetter, startApplication, periodField, statementDigestField, tagField, serialField,
  makeAttestInput, transcriptDigestField, makeBindInput, attestSignals, buildTree, Community,
  VETTING_TAG,
} from './harness-vetting.mjs';
import { poseidonHash } from './harness.mjs';

const results = [];
const ok = (id, msg) => { results.push(true); process.stdout.write(`  ok  ${id} ${msg}\n`); };
const fail = (id, msg) => { results.push(false); process.stdout.write(`  FAIL ${id} ${msg}\n`); };
async function check(id, msg, fn) {
  try { await fn(); ok(id, msg); } catch (e) { fail(id, `${msg} — ${e.message}`); }
}
function assert(c, m) { if (!c) throw new Error(m); }

const K = 5, CAP = 3, N = 10;
const REQ = 'zQmdmF2WvyXF9dgZeb2W2VxxwYeSzqN3fBykoLTkru5QUYE';
const statement = (method, i) => ({
  method, claims: ['name.legal', 'person.birthDate'], validFrom: '2026-09-23', validUntil: '2026-12-22',
  identityCommitment: 'zQm-identity-commitment-bob', requirementsDigest: REQ, session: i,
});

async function main() {
  process.stdout.write(`circom-gadget-vetting — hidden-vetting admission, record 024 Groth16 route (k=${K} of n=${N}, cap ${CAP})\n`);
  const art = ensureVettingArtifacts();
  const vkA = JSON.parse(readFileSync(art.attest.vkey, 'utf8'));
  const vkB = JSON.parse(readFileSync(art.bind.vkey, 'utf8'));
  const verifyAttest = (p, s) => snarkjs.groth16.verify(vkA, s, p);
  const verifyBind = (p, s) => snarkjs.groth16.verify(vkB, s, p);
  const timings = { attestProve: [], attestVerify: [], bindProve: 0, bindVerify: 0 };
  const proveAttest = async (input) => {
    const t0 = performance.now();
    const out = await snarkjs.groth16.fullProve(input, art.attest.wasm, art.attest.zkey);
    timings.attestProve.push(performance.now() - t0);
    return out;
  };
  const proveBind = async (input) => {
    const t0 = performance.now();
    const out = await snarkjs.groth16.fullProve(input, art.bind.wasm, art.bind.zkey);
    timings.bindProve = performance.now() - t0;
    return out;
  };
  const expectUnsat = async (input) => {
    try { await snarkjs.groth16.fullProve(input, art.attest.wasm, art.attest.zkey); } catch { return true; }
    return false;
  };

  const vetters = [];
  for (let i = 1; i <= N; i++) vetters.push(await enrolVetter(`vetter-${String(i).padStart(2, '0')}`));
  const tree = await buildTree(vetters.map((v) => v.commitment));
  const period = periodField('vetter/2026-09');
  const community = new Community({ tree, period, cap: CAP, k: K, requirementsDigest: REQ, verifyAttest, verifyBind });

  const bob = await startApplication('bob/application-1');
  const carol = await startApplication('carol/application-1');
  const chosen = [2, 4, 5, 7, 9]; // vetters 03 05 06 08 10 — the run's bookkeeping, never sent
  const methods = ['inPerson', 'video', 'inPerson', 'inPerson', 'video'];

  async function legFor(vIdx, applicant, slot, st, t = community.tree, leafIndex = vIdx) {
    const input = await makeAttestInput({
      vetter: vetters[vIdx], tree: t, leafIndex, applicantId: applicant.applicantId,
      period, cap: CAP, slot, statementDigest: statementDigestField(st),
    });
    return proveAttest(input);
  }
  async function bindFor(applicant, challenge, legs, joinDid = 'did:key:z6Mkn1vNVEZYu4dKzmXsX3BGuT3PGaKuCtWJ1kqxQTuuVMNc') {
    const td = transcriptDigestField({ challenge, requirementsDigest: REQ, joinDid, legs });
    return proveBind(makeBindInput({ appSecret: applicant.appSecret, applicantId: applicant.applicantId, transcriptDigest: td }));
  }
  const JOIN = 'did:key:z6Mkn1vNVEZYu4dKzmXsX3BGuT3PGaKuCtWJ1kqxQTuuVMNc';

  // --- H1 ----------------------------------------------------------------------
  const statements = chosen.map((_, i) => statement(methods[i], i));
  let legs = [], bobChallenge, bind;
  await check('H1', `honest ${K}-of-${N}: ${K} leg proofs + 1 binding proof verify and are counted`, async () => {
    for (let i = 0; i < K; i++) legs.push(await legFor(chosen[i], bob, 0, statements[i]));
    for (const l of legs) {
      const t0 = performance.now();
      assert(await verifyAttest(l.proof, l.publicSignals), 'leg did not verify');
      timings.attestVerify.push(performance.now() - t0);
    }
    bobChallenge = community.mintChallenge(bob.applicantId);
    bind = await bindFor(bob, bobChallenge, legs);
    const t0 = performance.now();
    assert(await verifyBind(bind.proof, bind.publicSignals), 'binding proof did not verify');
    timings.bindVerify = performance.now() - t0;
    const r = await community.admit({ challenge: bobChallenge, joinDid: JOIN, applicantId: bob.applicantId, legs, bind, statements });
    assert(r.ok, `admission refused: ${r.code}`);
    assert(r.facts.length === K && new Set(r.facts.map((f) => f.issuer)).size === K, 'not K distinct counted tags');
    const leaves = new Set(vetters.map((v) => v.commitment.toString()));
    assert(r.facts.every((f) => !leaves.has(f.issuer)), 'a tag equals an enrolled commitment');
  });

  // --- H2 ----------------------------------------------------------------------
  await check('H2', 'same vetter attesting twice (slots 1 and 2) -> tag-duplicate', async () => {
    const a = await startApplication('dave/application-1');
    const two = [await legFor(0, a, 1, statement('inPerson', 0)), await legFor(0, a, 2, statement('video', 1))];
    const rest = [];
    for (const [j, v] of [1, 3, 6].entries()) rest.push(await legFor(v, a, 1, statement('inPerson', j + 2)));
    const ls = [...two, ...rest];
    const sts = [statement('inPerson', 0), statement('video', 1), statement('inPerson', 2), statement('inPerson', 3), statement('inPerson', 4)];
    const c = community.mintChallenge(a.applicantId);
    const b = await bindFor(a, c, ls);
    const r = await community.admit({ challenge: c, joinDid: JOIN, applicantId: a.applicantId, legs: ls, bind: b, statements: sts });
    assert(!r.ok && r.code === 'tag-duplicate', `expected tag-duplicate, got ${r.ok ? 'ok' : r.code}`);
  });

  // --- H3 ----------------------------------------------------------------------
  await check('H3', 'non-enrolled vetter cannot prove a leg (witness generation fails)', async () => {
    const outsider = await enrolVetter('sockpuppet');
    const input = await makeAttestInput({ vetter: outsider, tree: community.tree, leafIndex: 0, applicantId: bob.applicantId, period, cap: CAP, slot: 0, statementDigest: statementDigestField(statements[0]) });
    process.stdout.write('       (a witness-generation constraint ERROR printed by snarkjs here is EXPECTED)\n');
    assert(await expectUnsat(input), 'an outsider PRODUCED a leg proof');
  });

  // --- H4 ----------------------------------------------------------------------
  await check('H4', `slot = cap (${CAP}) is unsatisfiable: at most ${CAP} serials per vetter per period`, async () => {
    const input = await makeAttestInput({ vetter: vetters[1], tree: community.tree, leafIndex: 1, applicantId: carol.applicantId, period, cap: CAP, slot: CAP, statementDigest: statementDigestField(statements[0]) });
    process.stdout.write('       (a witness-generation constraint ERROR printed by snarkjs here is EXPECTED)\n');
    assert(await expectUnsat(input), 'slot >= cap PRODUCED a proof');
  });

  // --- H5 ----------------------------------------------------------------------
  await check('H5', 'a serial spent for Bob cannot be spent again for Carol -> token-serial-spent', async () => {
    const cl = [];
    for (let i = 0; i < K; i++) cl.push(await legFor(chosen[i], carol, i === 0 ? 0 : 1, statements[i])); // leg 0 reuses slot 0
    const c = community.mintChallenge(carol.applicantId);
    const b = await bindFor(carol, c, cl);
    const r = await community.admit({ challenge: c, joinDid: JOIN, applicantId: carol.applicantId, legs: cl, bind: b, statements });
    assert(!r.ok && r.code === 'token-serial-spent', `expected token-serial-spent, got ${r.ok ? 'ok' : r.code}`);
  });

  // --- H6 ----------------------------------------------------------------------
  await check('H6', 'changed statement facts are refused; a forged statementDigest signal fails verification', async () => {
    const edited = statements.map((s, i) => (i === 0 ? { ...s, method: 'video' } : s));
    const c = community.mintChallenge(bob.applicantId);
    const r = await community.admit({ challenge: c, joinDid: JOIN, applicantId: bob.applicantId, legs, bind: await bindFor(bob, c, legs), statements: edited });
    assert(!r.ok && r.code === 'statement-metadata-mismatch', `expected statement-metadata-mismatch, got ${r.ok ? 'ok' : r.code}`);
    const forged = [...legs[0].publicSignals];
    forged[4] = statementDigestField(edited[0]).toString();
    assert(!(await verifyAttest(legs[0].proof, forged)), 'a proof verified with a substituted statement digest');
  });

  // --- H7 ----------------------------------------------------------------------
  await check('H7', "a leg made for Bob does not verify as Carol's", async () => {
    const moved = [...legs[0].publicSignals];
    moved[1] = carol.applicantId.toString();
    moved[5] = (await tagField(vetters[chosen[0]].secret, carol.applicantId)).toString(); // even with the right tag
    assert(!(await verifyAttest(legs[0].proof, moved)), 'a transplanted leg verified');
  });

  // --- H8 ----------------------------------------------------------------------
  await check('H8', 'challenge replayed -> challenge-replayed; self-minted -> challenge-not-minted', async () => {
    const r1 = await community.admit({ challenge: bobChallenge, joinDid: JOIN, applicantId: bob.applicantId, legs, bind, statements });
    assert(!r1.ok && r1.code === 'challenge-replayed', `replay: got ${r1.ok ? 'ok' : r1.code}`);
    const own = 'challenge:self-minted-by-bob';
    const r2 = await community.admit({ challenge: own, joinDid: JOIN, applicantId: bob.applicantId, legs, bind: await bindFor(bob, own, legs), statements });
    assert(!r2.ok && r2.code === 'challenge-not-minted', `self-minted: got ${r2.ok ? 'ok' : r2.code}`);
  });

  // --- H9 ----------------------------------------------------------------------
  await check('H9', "holding Bob's legs without his appSecret, a binding proof cannot be made", async () => {
    const td = transcriptDigestField({ challenge: community.mintChallenge(bob.applicantId), requirementsDigest: REQ, joinDid: JOIN, legs });
    let failed = false;
    process.stdout.write('       (a witness-generation constraint ERROR printed by snarkjs here is EXPECTED)\n');
    try { await snarkjs.groth16.fullProve(makeBindInput({ appSecret: carol.appSecret, applicantId: bob.applicantId, transcriptDigest: td }), art.bind.wasm, art.bind.zkey); } catch { failed = true; }
    assert(failed, 'a binding proof was made without the applicant secret');
  });

  // --- H10 ---------------------------------------------------------------------
  await check('H10', 'revoke vetter 03 by root update: stale-root leg refused, 03 cannot prove, others re-prove unchanged', async () => {
    const kept = vetters.filter((_, i) => i !== 2);
    const newTree = await buildTree(kept.map((v) => v.commitment));
    community.rotateRoot(newTree);
    const eve = await startApplication('eve/application-1');
    const oldLeg = await legFor(2, eve, 1, statements[0], tree, 2); // made under the old root
    const others = [];
    for (const [j, v] of [3, 4, 6, 8].entries()) others.push(await legFor(v, eve, 2, statements[j + 1], newTree, v - 1));
    const ls = [oldLeg, ...others];
    const c = community.mintChallenge(eve.applicantId);
    const r = await community.admit({ challenge: c, joinDid: JOIN, applicantId: eve.applicantId, legs: ls, bind: await bindFor(eve, c, ls), statements });
    assert(!r.ok && r.code === 'vetter-root-stale', `expected vetter-root-stale, got ${r.ok ? 'ok' : r.code}`);
    const input = await makeAttestInput({ vetter: vetters[2], tree: newTree, leafIndex: 1, applicantId: eve.applicantId, period, cap: CAP, slot: 1, statementDigest: statementDigestField(statements[0]) });
    process.stdout.write('       (a witness-generation constraint ERROR printed by snarkjs here is EXPECTED)\n');
    assert(await expectUnsat(input), 'the revoked vetter PRODUCED a proof under the new root');
    const fresh = [await legFor(1, eve, 2, statements[0], newTree, 1), ...others];
    const c2 = community.mintChallenge(eve.applicantId);
    const r2 = await community.admit({ challenge: c2, joinDid: JOIN, applicantId: eve.applicantId, legs: fresh, bind: await bindFor(eve, c2, fresh), statements });
    assert(r2.ok, `re-proved admission refused: ${r2.code}`);
  });

  // --- H11 ---------------------------------------------------------------------
  await check('H11', "one vetter's tags for two applicants differ; no tag is recomputable from public data", async () => {
    const tb = await tagField(vetters[4].secret, bob.applicantId);
    const tc = await tagField(vetters[4].secret, carol.applicantId);
    assert(tb !== tc, 'tags linked across applicants');
    const counted = new Set(legs.map((l) => attestSignals(l.publicSignals).tag));
    for (const v of vetters) {
      const guess = await poseidonHash([VETTING_TAG, v.commitment, bob.applicantId]);
      assert(!counted.has(guess.toString()), 'a tag was recomputed from an enrolled commitment');
    }
  });

  // --- H12 ---------------------------------------------------------------------
  await check('H12', 'measurements (informative)', async () => {
    const ia = await snarkjs.r1cs.info(art.attest.r1cs);
    const ib = await snarkjs.r1cs.info(art.bind.r1cs);
    const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
    const jsonBytes = (o) => Buffer.byteLength(JSON.stringify(o));
    // binary: Groth16/BN254 proof = 2 G1 + 1 G2 = 128 B compressed, 256 B uncompressed.
    // Wire at k: per leg proof + its 3 leg-unique signals (statementDigest, tag, serial);
    // shared once: vetterRoot, applicantId, period, cap; binding proof (its 2 signals
    // are the applicantId and a digest the community recomputes).
    const wire = (k, proofB) => k * (proofB + 3 * 32) + 4 * 32 + proofB;
    const lines = [
      `constraints : vetting_attest ${ia.nConstraints} (public ${ia.nPubInputs + ia.nOutputs}) · vetting_bind ${ib.nConstraints} [--O2]`,
      `prove       : leg mean ${mean(timings.attestProve.slice(0, K)).toFixed(0)} ms · bind ${timings.bindProve.toFixed(0)} ms · applicant-side total at k=${K}: bind only (legs are proved by the vetters, in parallel, at their own times)`,
      `verify      : leg mean ${mean(timings.attestVerify).toFixed(0)} ms · bind ${timings.bindVerify.toFixed(0)} ms · community total at k=${K} ${(K * mean(timings.attestVerify) + timings.bindVerify).toFixed(0)} ms`,
      `snarkjs JSON: leg proof ${jsonBytes(legs[0].proof)} B + signals ${jsonBytes(legs[0].publicSignals)} B · submission at k=${K} ${jsonBytes({ legs: legs.map((l) => ({ p: l.proof, s: l.publicSignals })), bind })} B`,
      `binary wire : k=${K} ${wire(K, 128)} B compressed / ${wire(K, 256)} B uncompressed (computed from point sizes, not a serializer)`,
      `node ${process.version} · ${process.platform}/${process.arch} · lab-only trusted setup`,
    ];
    for (const l of lines) process.stdout.write(`       ${l}\n`);
  });

  const passed = results.filter(Boolean).length;
  process.stdout.write(`\n${passed}/${results.length} passed\n`);
  process.exit(passed === results.length ? 0 : 1);
}

main().catch((e) => { process.stdout.write(`FATAL ${e.stack}\n`); process.exit(1); });
