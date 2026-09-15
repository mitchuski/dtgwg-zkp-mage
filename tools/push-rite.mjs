#!/usr/bin/env node
// speak records approval, not completed publication. New approvals freeze a snapshot.
import { readFileSync, writeFileSync, existsSync, openSync, closeSync, unlinkSync, renameSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { head, saveSnapshot, loadSnapshot, footerFor } from './ledger-history.mjs';
export { head, footerFor } from './ledger-history.mjs';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const LEDGER = join(root, 'proverb-ledger.json'), HISTORY = join(root, '.ledger-history');
const load = () => JSON.parse(readFileSync(LEDGER, 'utf8'));
const arg = name => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : undefined; };
const refuse = code => { throw new Error(code); };
function save(ledger) {
  saveSnapshot(HISTORY, ledger);
  const temporary = LEDGER + '.tmp'; writeFileSync(temporary, JSON.stringify(ledger, null, 1) + '\n'); renameSync(temporary, LEDGER);
}
function mutate(fn) {
  const lock = LEDGER + '.lock'; let fd;
  try { fd = openSync(lock, 'wx'); } catch { refuse('ledger-busy'); }
  try { const ledger = load(); saveSnapshot(HISTORY, ledger); return fn(ledger); }
  finally { closeSync(fd); unlinkSync(lock); }
}
function frozenApproval(seq) {
  const file = join(HISTORY, `approval-${seq}.json`);
  if (!existsSync(file)) return null;
  const record = JSON.parse(readFileSync(file, 'utf8'));
  if (record.seq !== seq) refuse('rite-approval-reference-invalid');
  return loadSnapshot(HISTORY, record.head);
}
function main() {
  const [cmd, value] = process.argv.slice(2), seq = Number(value);
  if (cmd === 'serve') return mutate(ledger => {
    const ref = arg('--ref'), meaning = arg('--meaning'), proverb = arg('--proverb'), type = arg('--type') || 'push';
    if (!ref || !meaning || !proverb) refuse('serve-missing-field');
    if (!['push', 'post'].includes(type)) refuse('serve-bad-type');
    if (ledger.entries.some(e => e.proverb.trim() === proverb.trim())) refuse('serve-proverb-reused');
    const seq = Math.max(0, ...ledger.entries.map(e => e.seq)) + 1;
    ledger.entries.push({ seq, date: new Date().toISOString().slice(0, 10), actType: type, actRef: ref, actMeaning: meaning, proverb, servedBy: arg('--by') || 'agent runtime (push-rite.mjs)', activated: null, activatedDate: null });
    save(ledger); console.log(`served seq ${seq}\nas-served head ${head(ledger)}\nproverb: “${proverb}”\nThe maintainer reviews the act before running speak ${seq}. Nothing is published.`);
  });
  if (cmd === 'speak') return mutate(ledger => {
    const entry = ledger.entries.find(e => e.seq === seq);
    if (!entry) refuse(`rite-no-entry:${seq}`);
    if (entry.activated === true) refuse(`rite-already-spoken:${seq}`);
    if (entry.activated === false) refuse(`rite-retired:${seq}`);
    entry.activated = true; entry.activatedDate = new Date().toISOString().slice(0, 10);
    const digest = saveSnapshot(HISTORY, ledger);
    const file = join(HISTORY, `approval-${seq}.json`), record = { seq, head: digest };
    if (existsSync(file)) { if (JSON.stringify(JSON.parse(readFileSync(file, 'utf8'))) !== JSON.stringify(record)) refuse('rite-approval-snapshot-conflict'); }
    else writeFileSync(file, JSON.stringify(record) + '\n', { flag: 'wx' });
    save(ledger); console.log(`approved seq ${seq}; publication not confirmed\n${footerFor(ledger, seq, ledger).lines.join('\n')}`);
  });
  if (cmd === 'footer') {
    const result = footerFor(load(), seq, frozenApproval(seq));
    if (!result.ok) refuse(result.refusal);
    console.log(result.lines.join('\n')); return;
  }
  if (cmd === 'verify') {
    const expected = (value || '').toLowerCase(), current = load();
    const snapshot = head(current) === expected ? current : loadSnapshot(HISTORY, expected);
    console.log(`VERIFIED head ${head(snapshot)}${snapshot === current ? ' (current)' : ' (historical snapshot)'}`); return;
  }
  console.log('usage: push-rite.mjs serve --ref R --meaning M --proverb P [--type push|post] | speak <seq> | footer <seq> | verify <head>');
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(`REFUSED ${error.message}`); process.exitCode = 1; }
}
