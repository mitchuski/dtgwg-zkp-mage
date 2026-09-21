#!/usr/bin/env node
// _cites-2026-09-21.mjs — one-shot, idempotent. The credential maintainer's review of PR #8 (2026-09-16, item 8):
// cite the credential specification's sections by title, not by merged pull-request number. Live fields only;
// `revisions` and `history` are dated notes and keep their wording. Open PRs (#18, #50, #56) stay PR cites.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const MAP = [
  ['cred-spec PR #30 §Correlation Scope / §Choosing a scope / §Community-Anchored Zero-Knowledge Proof (WD02 draft, 2026-09-02)', 'cred-spec §Correlation Scope / §Choosing a scope / §Community-Anchored Zero-Knowledge Proof (correlation-scope revision, merged 2026-09-05)'],
  ['cred-spec PR #30 §Community-Anchored Zero-Knowledge Proof (WD02 draft)', 'cred-spec §Community-Anchored Zero-Knowledge Proof'],
  ['cred-spec PR #30 §Choosing a scope / §Community-Anchored ZKP', 'cred-spec §Choosing a scope / §Community-Anchored Zero-Knowledge Proof'],
  ['cred-spec PR #30 §Community-Anchored ZKP', 'cred-spec §Community-Anchored Zero-Knowledge Proof'],
  ['cred-spec PR #30 §Community-Anchored:', 'cred-spec §Community-Anchored Zero-Knowledge Proof:'],
  ['cred-spec PR #30 §Choosing a scope (WD02 draft)', 'cred-spec §Choosing a scope'],
  ['cred-spec PR #30 §Choosing a scope', 'cred-spec §Choosing a scope'],
  ['cred-spec PR #30 §Correlation Scope', 'cred-spec §Correlation Scope'],
  ['(WD02 wording, PR #30)', '(WD02 wording)'],
  ['"source": "cred-spec PR #30"', '"source": "cred-spec §Choosing a scope"'],
  ['S7 (WD02, PR #30)', 'S7 (WD02 §Community-Anchored Zero-Knowledge Proof)'],
  ['(cred-spec PR #27)', '(cred-spec §Privacy Considerations: the effective disclosure of an edge)'],
  ['consented in the PR #12 sense', 'consented in the sense of §VMC (Verifiable Membership Credential), both directions'],
  ['cred-spec PR #12 pair; PR #26 carve-out', 'cred-spec §VMC, both directions; §Membership Edge Completion carve-out'],
  ['(PR #12 pair)', '(§VMC, the membership pair)'],
  ['cred-spec construction 2 (community-anchored ZKP)', 'cred-spec §Community-Anchored Zero-Knowledge Proof'],
  ['"by": "cred-spec construction 1"', '"by": "cred-spec §Pairwise Zero-Knowledge Proof"'],
  ['cred-spec #21 → PR #26 (edge verifiability w.r.t. a verifier)', 'cred-spec §Edge Verifiability (issue #21; merged 2026-09-05)'],
  ['cred-spec #8 → PR #12 (VMC pair)', 'cred-spec §VMC (Verifiable Membership Credential), both directions (issue #8; merged 2026-08-28)'],
  ['cred-spec PR #42 (merged 2026-09-10) §Zero-Knowledge and Selective Disclosure', 'cred-spec §Zero-Knowledge and Selective Disclosure (editor\'s note merged 2026-09-10)'],
  ['cred-spec PR #42 editor\'s note (merged 2026-09-10)', 'cred-spec §Zero-Knowledge and Selective Disclosure editor\'s note (merged 2026-09-10)'],
  ['cred-spec PR #42 editor\'s note (merged 09-10)', 'cred-spec §Zero-Knowledge and Selective Disclosure editor\'s note (merged 2026-09-10)'],
  ['cred-spec PR #42 editor\'s note (2026-09-10)', 'cred-spec §Zero-Knowledge and Selective Disclosure editor\'s note (2026-09-10)'],
  ['cred-spec PR #42 editor\'s note', 'cred-spec §Zero-Knowledge and Selective Disclosure editor\'s note'],
  ['(cred-spec #9, PR #42)', '(cred-spec #9; §Zero-Knowledge and Selective Disclosure editor\'s note)'],
  ['record: stormer78 (PR #19)', 'record: stormer78 (§VDC, merged 2026-09-06)'],
  ['cred-spec PR #19 open question 6', 'cred-spec §VDC (Verifiable Delegation Credential), open question 6 of its merge review'],
  ['(PR #19 over WD02)', '(over WD02)'],
  ['cred-spec §VAC (PR #29, #39, #40, #41, #42 merged 2026-09-10)', 'cred-spec §VAC (Verifiable Authority Credential) (merged 2026-09-10)'],
  ['§The `taskContext` Property (WD01)', '§The `taskContext` Property'],
];
const files = [...readdirSync(join(ROOT, 'board', 'cards')).filter(f => f.endsWith('.json')).map(f => join(ROOT, 'board', 'cards', f)), join(ROOT, 'board', 'records', 'ADR-001.json')];
let total = 0;
for (const file of files) {
  const doc = JSON.parse(readFileSync(file, 'utf8'));
  const keep = { revisions: doc.revisions, history: doc.history };
  delete doc.revisions; delete doc.history;
  let text = JSON.stringify(doc, null, 2), n = 0;
  for (const [from, to] of MAP) { const parts = text.split(from); n += parts.length - 1; text = parts.join(to); }
  const live = JSON.parse(text);
  const out = { ...live };
  if (keep.revisions) out.revisions = keep.revisions;
  if (keep.history) out.history = keep.history;
  // preserve original key order: revisions/history were last in every card
  if (n) { writeFileSync(file, JSON.stringify(out, null, 2) + '\n'); total += n; console.log(`${file.split(/[\/]/).pop()} ${n} cite(s)`); }
}
const left = files.flatMap(f => (readFileSync(f, 'utf8').match(/PR #(12|19|26|27|29|30|42)\b/g) || []).map(m => f.split(/[\/]/).pop() + ' ' + m));
console.log(`total ${total}; merged-PR cites left in dated notes only: ${left.length}`);
