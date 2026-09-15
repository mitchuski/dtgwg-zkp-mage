#!/usr/bin/env node
// ledger-receipts.mjs — DRY RUN ONLY. Reconcile the proverb ledger with the reader's publication receipts.
//
// The 8 September posts left the machine under the reader's revision receipts (task-force-readers/outputs/
// publication-results.json in the workbench) while their ledger entries stayed unspoken with no actRef. This tool
// prints, for every ledger entry that a board draft names, whether a receipt exists — and the patch that a
// backfill WOULD apply. It writes nothing. The ruling on which gate is canonical (door D22) is the maintainer's;
// once made, apply the printed patch by hand or with push-rite.mjs, never by this tool.
//
//   node tools/ledger-receipts.mjs            report
//   node tools/ledger-receipts.mjs --json     the proposed patch as JSON (still nothing written)
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..');
const LEDGER = join(REPO, 'proverb-ledger.json');
const DRAFTS = join(REPO, 'board', 'drafts');
const RECEIPTS = join(REPO, '..', 'dtgwg-zkp-tf-mage', 'task-force-readers', 'outputs', 'publication-results.json');

const ledger = JSON.parse(readFileSync(LEDGER, 'utf8'));
const bySeq = new Map(ledger.entries.map(e => [String(e.seq), e]));

// letter → ledger seq, from the drafts' own `ledger:` lines
const letterSeq = new Map();
for (const f of readdirSync(DRAFTS).filter(f => /^[A-Z]-.*\.md$/.test(f))) {
  const txt = readFileSync(join(DRAFTS, f), 'utf8');
  const m = txt.match(/^ledger:[ \t]*(\d+)[ \t]*$/m);
  if (m) letterSeq.set(f[0], m[1]);
}

const receipts = existsSync(RECEIPTS) ? JSON.parse(readFileSync(RECEIPTS, 'utf8')) : [];
const receiptByLetter = new Map(receipts.map(r => [r.id, r]));

const rows = [], patch = [];
for (const [letter, seq] of [...letterSeq].sort((a, b) => Number(a[1]) - Number(b[1]))) {
  const e = bySeq.get(seq); if (!e) { rows.push({ letter, seq, state: 'LEDGER-ENTRY-MISSING' }); continue; }
  const r = receiptByLetter.get(letter);
  const spoken = !!e.activated;
  const state = r && spoken ? 'spoken+receipt' : r ? 'RECEIPT-BUT-UNSPOKEN' : spoken ? 'spoken, no receipt' : 'unspoken, no receipt';
  rows.push({ letter, seq, state, url: r ? r.url : '', verifiedAt: r ? r.verifiedAt : '', reviewRevision: r ? (r.reviewRevision || '').slice(0, 12) : '' });
  if (r && !spoken) patch.push({ seq: Number(seq), set: { activated: true, activatedDate: r.verifiedAt.slice(0, 10), activatedBy: 'reader revision receipt (backfill candidate — not a spoken rite)', publication: r.url, reviewRevision: r.reviewRevision || null } });
}

if (process.argv.includes('--json')) { console.log(JSON.stringify({ dryRun: true, patch }, null, 2)); process.exit(0); }
console.log(`ledger ${LEDGER}\nreceipts ${existsSync(RECEIPTS) ? RECEIPTS : '(none found)'}\n`);
console.log('letter | seq | state | receipt');
for (const r of rows) console.log(`${r.letter} | ${r.seq} | ${r.state} | ${r.url || '—'}${r.verifiedAt ? ' · ' + r.verifiedAt.slice(0, 16) + 'Z' : ''}`);
const unspokenWithReceipt = rows.filter(r => r.state === 'RECEIPT-BUT-UNSPOKEN');
console.log(`\n${unspokenWithReceipt.length} entr${unspokenWithReceipt.length === 1 ? 'y' : 'ies'} posted under a receipt but never spoken: ${unspokenWithReceipt.map(r => r.seq).join(' ')}`);
console.log('Nothing written. Door D22: rule whether the receipt is the gate (then apply --json by hand) or the rite is (then speak them, late, or leave them as the record of what happened).');
