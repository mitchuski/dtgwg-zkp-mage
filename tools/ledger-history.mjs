// Historical commitments retain the v0 digest algorithm and preserve old entries.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
export const canonical = v => v === null ? 'null' : Array.isArray(v) ? '[' + v.map(canonical).join(',') + ']' : typeof v === 'object' ? '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canonical(v[k])).join(',') + '}' : JSON.stringify(v);
const hash = s => createHash('sha256').update(s, 'utf8').digest('hex');
export function head(ledger) {
  let chain = hash(ledger.domain);
  for (const entry of ledger.entries) chain = hash(chain + hash(canonical(entry)));
  return chain;
}
export function saveSnapshot(directory, ledger) {
  const digest = head(ledger); mkdirSync(directory, { recursive: true });
  const file = join(directory, digest + '.json');
  if (existsSync(file)) {
    if (head(JSON.parse(readFileSync(file, 'utf8'))) !== digest) throw new Error('ledger-snapshot-corrupt');
  } else writeFileSync(file, JSON.stringify(ledger, null, 1) + '\n', { flag: 'wx' });
  return digest;
}
export function loadSnapshot(directory, digest) {
  if (!/^[0-9a-f]{64}$/.test(digest || '')) throw new Error('ledger-head-invalid');
  const snapshot = JSON.parse(readFileSync(join(directory, digest + '.json'), 'utf8'));
  if (head(snapshot) !== digest) throw new Error('ledger-snapshot-corrupt');
  return snapshot;
}
export function footerFor(ledger, seq, approvalSnapshot) {
  const entry = ledger.entries.find(e => e.seq === seq);
  if (!entry) return { ok: false, refusal: `rite-no-entry:${seq}` };
  if (entry.activated !== true) return { ok: false, refusal: `rite-not-spoken:${seq}` };
  if (!approvalSnapshot) return { ok: false, refusal: `rite-approval-snapshot-missing:${seq}` };
  const approved = approvalSnapshot.entries.find(e => e.seq === seq);
  if (approvalSnapshot.domain !== ledger.domain || !approved || canonical(approved) !== canonical(entry)) return { ok: false, refusal: `rite-approved-entry-changed:${seq}` };
  return { ok: true, lines: [`Ledger-Head: ${head(approvalSnapshot)}`, `Ledger-Seq: ${seq}`, `Ledger-Domain: ${ledger.domain}`] };
}
