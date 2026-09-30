#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 the contributors to the Trust over IP Foundation DTG ZKP Task Force. Contributed under the ToIP JDF charter.
// conformance/validate.mjs — validate construction records, requests and proving-system entries. Zero dependencies.
//   node conformance/validate.mjs            → prints one line per file; exit 1 on any refusal
// Refusals are register strings, never prose. The rules encode the DTG ZKP Task Force's drafting rules:
// every privacy claim names its adversary; every privacy claim names its horizon; every predicate states what it
// does not establish; conjecture is labelled as conjecture. Origin: the evidence repository's board/tools/board.mjs
// (github.com/mitchuski/dtgwg-zkp-mage), copied here so this repository is self-contained.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
export const STATES = ['requested', 'specified', 'constructed', 'run', 'vetted', 'published'];
export const GADGETS = ['set-membership', 'nullifier', 'transcript-bind', 'key-binding', 'distinctness', 'signature-verify', 'non-revocation', 'range', 'commitment-open', 'chain-resolve', 'hidden-equality'];
export const ADVERSARIES = ['verifier', 'verifiers-colluding', 'issuer-verifier-colluding', 'registry-operator'];
export const FAMILIES = ['accepts', 'rejects-unsat', 'rejects-verify', 'unlinkable', 'current'];
export const STACK_KINDS = ['general-stack', 'as-signed-catalog', 'hand-rolled', 'library', 'declaration'];
export const REQUEST_STATUSES = ['covered', 'refined', 'added', 'partial', 'open'];

const loadDir = (d) => existsSync(d) ? readdirSync(d).filter(f => f.endsWith('.json')).sort().map(f => ({ file: f, json: JSON.parse(readFileSync(join(d, f), 'utf8')) })) : [];

export function validateRecord(record, all) {
  const r = [];
  const ids = new Set(all.map(c => c.id));
  const nonEmpty = (k) => Array.isArray(record[k]) && record[k].length > 0;
  for (const k of ['id', 'name', 'kind', 'state', 'statement']) if (!record[k]) r.push(`record-missing-field:${k}`);
  if (record.id && !/^[0-9]{3}$/.test(record.id)) r.push('record-bad-id');
  if (record.kind && !['primitive', 'composed'].includes(record.kind)) r.push('record-bad-kind');
  if (record.state && !STATES.includes(record.state)) r.push('record-bad-state');
  if (record.statement && record.statement.length < 20) r.push('record-statement-too-short');
  if (!nonEmpty('witness')) r.push('record-no-witness');
  if (!nonEmpty('publicInputs')) r.push('record-no-public-inputs');
  if (!nonEmpty('relation')) r.push('record-no-relation');
  else record.relation.forEach((m, i) => {
    if (!m.clause) r.push(`record-clause-empty:${i + 1}`);
    if (!m.gadget || !GADGETS.includes(m.gadget)) r.push(`record-clause-unbound:${i + 1}`);
    if (m.component && !ids.has(m.component)) r.push(`record-component-missing:${m.component}`);
  });
  if (!nonEmpty('disclosureSet')) r.push('record-no-disclosure-set');
  if (!nonEmpty('doesNotEstablish')) r.push('record-no-does-not-establish');
  if (!nonEmpty('adversary')) r.push('record-no-adversary');
  else record.adversary.forEach((a, i) => {
    if (!a.claim || !Array.isArray(a.against) || !a.against.length) r.push(`record-adversary-unnamed:${i + 1}`);
    else a.against.forEach(x => { if (!ADVERSARIES.includes(x)) r.push(`record-adversary-unknown:${x}`); });
  });
  if (!nonEmpty('horizon')) r.push('record-no-horizon');
  if (!record.fixtures || !Array.isArray(record.fixtures.families) || !record.fixtures.families.length) r.push('record-no-fixtures');
  else record.fixtures.families.forEach(f => { if (!FAMILIES.includes(f)) r.push(`record-fixture-family-unknown:${f}`); });
  if (!nonEmpty('options')) r.push('record-no-options');
  else record.options.forEach((s, i) => { if (s.measured && !s.source) r.push(`option-measured-without-source:${i + 1}`); });
  if (!Array.isArray(record.history)) r.push('record-no-history');
  if (record.formal !== undefined) {
    const f = record.formal;
    for (const k of ['system', 'location', 'reproduce', 'statement', 'scope']) if (!f?.[k]) r.push(`record-formal-no-${k}`);
    if (!Array.isArray(f?.theorems) || !f.theorems.length || f.theorems.some(t => !t.name || !t.proves)) r.push('record-formal-theorems-incomplete');
    // a formal part must name what it rests on: no hypotheses would read as an unconditional claim
    if (!Array.isArray(f?.hypotheses) || !f.hypotheses.length || f.hypotheses.some(h => !h.name || !h.carries)) r.push('record-formal-hypotheses-incomplete');
  }
  if (record.kind === 'composed') {
    if (!nonEmpty('components')) r.push('record-composed-no-components');
    else {
      for (const c of record.components) {
        if (!ids.has(c)) r.push(`record-component-missing:${c}`);
        const comp = all.find(x => x.id === c);
        if (comp && comp.kind !== 'primitive') r.push(`record-component-not-primitive:${c}`);
      }
      const union = new Set(record.components.flatMap(c => (all.find(x => x.id === c)?.disclosureSet) || []));
      const mine = new Set(record.disclosureSet || []);
      if (mine.size && [...mine].every(y => union.has(y)) && [...union].every(y => mine.has(y))) r.push('record-composed-disclosure-is-union');
      const unionDNE = new Set(record.components.flatMap(c => (all.find(x => x.id === c)?.doesNotEstablish) || []));
      if ((record.doesNotEstablish || []).every(d => unionDNE.has(d))) r.push('record-composed-dne-is-union');
      if (!(record.publicInputs || []).some(p => /transcript/i.test(p))) r.push('record-composed-no-single-transcript');
    }
  } else if (record.kind === 'primitive') {
    if (new Set((record.relation || []).map(m => m.gadget)).size > 1) r.push('record-primitive-multi-gadget');
    if (record.components && record.components.length) r.push('record-primitive-has-components');
  }
  const si = STATES.indexOf(record.state);
  if (si >= STATES.indexOf('constructed')) {
    if (!record.relation.some(m => m.runtime)) r.push('construct-no-runtime');
    if (!record.options.some(s => s.measured)) r.push('construct-no-measurement');
  }
  if (si >= STATES.indexOf('run') && !(record.fixtures.vectors)) r.push('run-vectors-missing');
  if (si >= STATES.indexOf('vetted') && !(record.provenance && record.provenance.registry)) r.push('vet-no-registry-row');
  if (Array.isArray(record.history)) {
    let last = -1;
    for (const h of record.history) {
      const i = STATES.indexOf(h.to);
      if (i < 0) r.push(`history-bad-state:${h.to}`);
      if (i <= last) r.push(`history-not-monotone:${h.to}`);
      if (!h.evidence) r.push(`history-no-evidence:${h.to}`);
      last = i;
    }
    if (record.history.length && record.history[record.history.length - 1].to !== record.state) r.push('history-does-not-end-at-state');
  }
  // retired identifier-type acronyms (Credentials Core Specification WD02) may not appear in a record's body
  if (/\b[RMCP]-DIDs?\b/.test(JSON.stringify([record.statement, record.witness, record.publicInputs, record.relation, record.disclosureSet, record.doesNotEstablish, record.adversary, record.issuance]))) r.push('record-retired-vocabulary');
  return r;
}

export function validateRequest(rec, all) {
  const r = [];
  for (const k of ['id', 'title', 'author', 'status', 'date', 'record', 'clauses']) if (!rec[k]) r.push(`request-missing-field:${k}`);
  if (rec.record && !all.some(c => c.id === rec.record)) r.push(`request-construction-missing:${rec.record}`);
  for (const c of rec.clauses || []) {
    if (!c.id || !c.text || !c.status) r.push(`request-clause-incomplete:${c.id || '?'}`);
    if (c.status && !REQUEST_STATUSES.includes(c.status)) r.push(`request-clause-bad-status:${c.id}`);
    if (['refined', 'added', 'partial'].includes(c.status) && !c.refinement) r.push(`request-clause-no-refinement:${c.id}`);
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
  const all = records.map(x => x.json);
  const out = [];
  for (const { file, json } of records) out.push({ kind: 'record', file, refusals: validateRecord(json, all) });
  for (const { file, json } of requests) out.push({ kind: 'request', file, refusals: validateRequest(json, all) });
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
