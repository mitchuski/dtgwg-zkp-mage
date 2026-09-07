#!/usr/bin/env node
// push-rite.mjs — the proverb as the key to a push. Zero-dep. Companion to proverb-ledger.mjs.
//
//   node tools/push-rite.mjs serve  --ref "<what will be pushed>" --meaning "<what the act means>" --proverb "<fresh line>" [--type push|post]
//        → appends a SERVED entry (activated: null) and prints its seq + the as-served head. The runtime's act.
//   node tools/push-rite.mjs speak  <seq>            → marks the entry ACTIVATED today. The maintainer's act — run it yourself,
//                                                     after reading the proverb aloud. Prints the finalized head.
//   node tools/push-rite.mjs footer <seq>            → prints the commit-message footer lines for that act. REFUSES
//                                                     (`rite-not-spoken:<seq>`) until the entry is activated: the footer is the
//                                                     lock, the spoken proverb is the key. The proverb itself is never in the footer.
//   node tools/push-rite.mjs verify <head>           → re-derives the chain and compares (same as proverb-ledger.mjs --verify).
//
// Footer format (goes below the body, above Signed-off-by; no AI trailer on upstream commits — maintainer's ruling):
//   Ledger-Head: <sha256 head at activation>
//   Ledger-Seq: <seq>
//   Ledger-Domain: dtg-zkp/proverb-ledger/v0
// A reader who later sees the ledger can re-derive the head and match it to the commit. Until then the footer commits to
// the ledger without revealing it. Refusals are values (printed, exit 1), never exceptions.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const LEDGER = join(root, 'proverb-ledger.json');
const sha256hex = (s) => createHash('sha256').update(s, 'utf8').digest('hex');
function canonical(v) {
  if (v === null) return 'null';
  if (Array.isArray(v)) return '[' + v.map(canonical).join(',') + ']';
  if (typeof v === 'object') return '{' + Object.keys(v).sort().map((k) => JSON.stringify(k) + ':' + canonical(v[k])).join(',') + '}';
  return JSON.stringify(v);
}
export function head(ledger) {
  let chain = sha256hex(ledger.domain);
  for (const e of ledger.entries) chain = sha256hex(chain + sha256hex(canonical(e)));
  return chain;
}
const load = () => JSON.parse(readFileSync(LEDGER, 'utf8'));
const save = (L) => writeFileSync(LEDGER, JSON.stringify(L, null, 1) + '\n');
const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : undefined; };
const today = () => new Date().toISOString().slice(0, 10);
const refuse = (code) => { console.log(`REFUSED ${code}`); process.exit(1); };

export function footerFor(L, seq) {
  const e = L.entries.find((x) => x.seq === seq);
  if (!e) return { ok: false, refusal: `rite-no-entry:${seq}` };
  if (e.activated !== true) return { ok: false, refusal: `rite-not-spoken:${seq}` };
  return { ok: true, lines: [`Ledger-Head: ${head(L)}`, `Ledger-Seq: ${seq}`, `Ledger-Domain: ${L.domain}`] };
}

const [cmd, a1] = process.argv.slice(2);
if (cmd === 'serve') {
  const ref = arg('--ref'), meaning = arg('--meaning'), proverb = arg('--proverb'), type = arg('--type') || 'push';
  if (!ref || !meaning || !proverb) refuse('serve-missing-field (need --ref --meaning --proverb)');
  const L = load();
  if (L.entries.some((e) => e.proverb.trim() === proverb.trim())) refuse('serve-proverb-reused (a spell is spent in the casting)');
  const seq = Math.max(...L.entries.map((e) => e.seq)) + 1;
  L.entries.push({ seq, date: today(), actType: type, actRef: ref, actMeaning: meaning, proverb, servedBy: arg('--by') || 'agent runtime (push-rite.mjs)', activated: null, activatedDate: null });
  save(L);
  console.log(`served seq ${seq}\nas-served head ${head(L)}\nproverb: “${proverb}”\nnext: read it aloud, then  node tools/push-rite.mjs speak ${seq}`);
} else if (cmd === 'speak') {
  const seq = Number(a1); const L = load(); const e = L.entries.find((x) => x.seq === seq);
  if (!e) refuse(`rite-no-entry:${seq}`);
  if (e.activated === true) refuse(`rite-already-spoken:${seq}`);
  if (e.activated === false) refuse(`rite-retired:${seq}`);
  e.activated = true; e.activatedDate = today(); save(L);
  const f = footerFor(L, seq);
  console.log(`activated seq ${seq} on ${e.activatedDate}\nfinalized head ${head(L)}\n\n${f.lines.join('\n')}`);
} else if (cmd === 'footer') {
  const seq = Number(a1); const L = load(); const f = footerFor(L, seq);
  if (!f.ok) refuse(f.refusal);
  console.log(f.lines.join('\n'));
} else if (cmd === 'verify') {
  const L = load(); const h = head(L); const ok = (a1 || '').toLowerCase() === h;
  console.log(ok ? `VERIFIED head ${h}` : `MISMATCH expected ${a1 || '(none)'} got ${h}`); process.exit(ok ? 0 : 1);
} else if (cmd) {
  console.log('usage: push-rite.mjs serve --ref R --meaning M --proverb P [--type push|post] | speak <seq> | footer <seq> | verify <head>');
}
