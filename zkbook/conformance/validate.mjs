#!/usr/bin/env node
// conformance/validate.mjs — validate construction records, requests and proving-system entries. Zero dependencies.
//   node conformance/validate.mjs            → prints one line per file; exit 1 on any refusal
// Refusals are register strings, never prose. The rules encode the DTG ZKP Task Force's drafting rules:
// every privacy claim names its adversary; every privacy claim names its horizon; every predicate states what it
// does not establish; conjecture is labelled as conjecture. Origin: the evidence repository's board/tools/board.mjs
// (github.com/mitchuski/dtgwg-zkp-mage), copied here so this repository is self-contained. Apache-2.0.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
export const STATES = ['requested', 'carded', 'constructed', 'run', 'vetted', 'published'];
export const GADGETS = ['set-membership', 'nullifier', 'transcript-bind', 'key-binding', 'distinctness', 'signature-verify', 'non-revocation', 'range', 'commitment-open', 'chain-resolve'];
export const ADVERSARIES = ['verifier', 'verifiers-colluding', 'issuer-verifier-colluding', 'registry-operator'];
export const FAMILIES = ['accepts', 'rejects-unsat', 'rejects-verify', 'unlinkable', 'current'];
export const STACK_KINDS = ['general-stack', 'as-signed-catalog', 'hand-rolled', 'library', 'declaration'];
export const REQUEST_STATUSES = ['covered', 'refined', 'added', 'partial', 'open'];

const loadDir = (d) => existsSync(d) ? readdirSync(d).filter(f => f.endsWith('.json')).sort().map(f => ({ file: f, json: JSON.parse(readFileSync(join(d, f), 'utf8')) })) : [];

export function validateRecord(card, cards) {
  const r = [];
  const ids = new Set(cards.map(c => c.id));
  const nonEmpty = (k) => Array.isArray(card[k]) && card[k].length > 0;
  for (const k of ['id', 'name', 'kind', 'state', 'dish']) if (!card[k]) r.push(`card-missing-field:${k}`);
  if (card.id && !/^[0-9]{3}$/.test(card.id)) r.push('card-bad-id');
  if (card.kind && !['primitive', 'composed'].includes(card.kind)) r.push('card-bad-kind');
  if (card.state && !STATES.includes(card.state)) r.push('card-bad-state');
  if (card.dish && card.dish.length < 20) r.push('card-dish-too-short');
  if (!nonEmpty('ingredients')) r.push('card-no-ingredients');
  if (!nonEmpty('pantry')) r.push('card-no-pantry');
  if (!nonEmpty('method')) r.push('card-no-method');
  else card.method.forEach((m, i) => {
    if (!m.clause) r.push(`card-clause-empty:${i + 1}`);
    if (!m.gadget || !GADGETS.includes(m.gadget)) r.push(`card-clause-unbound:${i + 1}`);
    if (m.component && !ids.has(m.component)) r.push(`card-component-missing:${m.component}`);
  });
  if (!nonEmpty('yield')) r.push('card-no-yield');
  if (!nonEmpty('doesNotEstablish')) r.push('card-no-does-not-establish');
  if (!nonEmpty('adversary')) r.push('card-no-adversary');
  else card.adversary.forEach((a, i) => {
    if (!a.claim || !Array.isArray(a.against) || !a.against.length) r.push(`card-adversary-unnamed:${i + 1}`);
    else a.against.forEach(x => { if (!ADVERSARIES.includes(x)) r.push(`card-adversary-unknown:${x}`); });
  });
  if (!nonEmpty('horizon')) r.push('card-no-horizon');
  if (!card.tasting || !Array.isArray(card.tasting.families) || !card.tasting.families.length) r.push('card-no-tasting');
  else card.tasting.families.forEach(f => { if (!FAMILIES.includes(f)) r.push(`card-tasting-unknown:${f}`); });
  if (!nonEmpty('substitutions')) r.push('card-no-substitutions');
  else card.substitutions.forEach((s, i) => { if (s.measured && !s.source) r.push(`option-measured-without-source:${i + 1}`); });
  if (!Array.isArray(card.history)) r.push('card-no-history');
  if (card.kind === 'composed') {
    if (!nonEmpty('components')) r.push('card-composed-no-components');
    else {
      for (const c of card.components) {
        if (!ids.has(c)) r.push(`card-component-missing:${c}`);
        const comp = cards.find(x => x.id === c);
        if (comp && comp.kind !== 'primitive') r.push(`card-component-not-primitive:${c}`);
      }
      const union = new Set(card.components.flatMap(c => (cards.find(x => x.id === c)?.yield) || []));
      const mine = new Set(card.yield || []);
      if (mine.size && [...mine].every(y => union.has(y)) && [...union].every(y => mine.has(y))) r.push('card-composed-yield-is-union');
      const unionDNE = new Set(card.components.flatMap(c => (cards.find(x => x.id === c)?.doesNotEstablish) || []));
      if ((card.doesNotEstablish || []).every(d => unionDNE.has(d))) r.push('card-composed-dne-is-union');
      if (!(card.pantry || []).some(p => /transcript/i.test(p))) r.push('card-composed-no-single-transcript');
    }
  } else if (card.kind === 'primitive') {
    if (new Set((card.method || []).map(m => m.gadget)).size > 1) r.push('card-primitive-multi-gadget');
    if (card.components && card.components.length) r.push('card-primitive-has-components');
  }
  const si = STATES.indexOf(card.state);
  if (si >= STATES.indexOf('constructed')) {
    if (!card.method.some(m => m.runtime)) r.push('construct-no-runtime');
    if (!card.substitutions.some(s => s.measured)) r.push('construct-no-measurement');
  }
  if (si >= STATES.indexOf('run') && !(card.tasting.vectors)) r.push('run-vectors-missing');
  if (si >= STATES.indexOf('vetted') && !(card.provenance && card.provenance.registry)) r.push('vet-no-registry-row');
  if (Array.isArray(card.history)) {
    let last = -1;
    for (const h of card.history) {
      const i = STATES.indexOf(h.to);
      if (i < 0) r.push(`history-bad-state:${h.to}`);
      if (i <= last) r.push(`history-not-monotone:${h.to}`);
      if (!h.evidence) r.push(`history-no-evidence:${h.to}`);
      last = i;
    }
    if (card.history.length && card.history[card.history.length - 1].to !== card.state) r.push('history-does-not-end-at-state');
  }
  // retired identifier-type acronyms (Credentials Core Specification WD02) may not appear in a record's body
  if (/\b[RMCP]-DIDs?\b/.test(JSON.stringify([card.dish, card.ingredients, card.pantry, card.method, card.yield, card.doesNotEstablish, card.adversary, card.issuance]))) r.push('card-retired-vocabulary');
  return r;
}

export function validateRequest(rec, cards) {
  const r = [];
  for (const k of ['id', 'title', 'author', 'status', 'date', 'recipe', 'clauses']) if (!rec[k]) r.push(`record-missing-field:${k}`);
  if (rec.recipe && !cards.some(c => c.id === rec.recipe)) r.push(`request-construction-missing:${rec.recipe}`);
  for (const c of rec.clauses || []) {
    if (!c.id || !c.text || !c.status) r.push(`record-clause-incomplete:${c.id || '?'}`);
    if (c.status && !REQUEST_STATUSES.includes(c.status)) r.push(`record-clause-bad-status:${c.id}`);
    if (['refined', 'added', 'partial'].includes(c.status) && !c.refinement) r.push(`record-clause-no-refinement:${c.id}`);
  }
  return r;
}

export function validateStack(s) {
  const r = [];
  for (const k of ['id', 'name', 'kind', 'proofSystem', 'setup', 'license', 'provenance', 'verified']) if (!s[k]) r.push(`stack-missing-field:${k}`);
  if (s.kind && !STACK_KINDS.includes(s.kind)) r.push(`stack-bad-kind:${s.kind}`);
  if (!s.audit || typeof s.audit.claim !== 'string') r.push('stack-no-audit-statement');
  for (const g of Object.keys(s.covers || {})) if (!GADGETS.includes(g)) r.push(`stack-covers-unknown-gadget:${g}`);
  for (const b of s.benchmarks || []) if (!b.source) r.push(`stack-benchmark-no-source:${b.statement}`);
  return r;
}

export function validateAll(root = HERE) {
  const records = loadDir(join(root, 'records'));
  const requests = loadDir(join(root, 'requests'));
  const stacks = loadDir(join(root, 'stacks'));
  const cards = records.map(x => x.json);
  const out = [];
  for (const { file, json } of records) out.push({ kind: 'record', file, refusals: validateRecord(json, cards) });
  for (const { file, json } of requests) out.push({ kind: 'request', file, refusals: validateRequest(json, cards) });
  for (const { file, json } of stacks) out.push({ kind: 'stack', file, refusals: validateStack(json) });
  return out;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const results = validateAll();
  let bad = 0;
  for (const x of results) { if (x.refusals.length) { bad++; console.log(`${x.kind} ${x.file} REFUSED ${x.refusals.join(' ')}`); } else console.log(`${x.kind} ${x.file} ok`); }
  console.log(`${results.length - bad}/${results.length} valid`);
  process.exit(bad ? 1 : 0);
}
