// Inventory consistency only: this tool does not certify semantic coverage or run Lean.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const read = p => fs.readFileSync(path.join(root, p), 'utf8').replace(/\r\n/g, '\n');
const canonical = v => Array.isArray(v) ? `[${v.map(canonical)}]` : v && typeof v === 'object'
  ? `{${Object.keys(v).sort().map(k => `${JSON.stringify(k)}:${canonical(v[k])}`).join(',')}}` : JSON.stringify(v);
const safe = p => typeof p === 'string' && !path.isAbsolute(p) && !p.includes('..') && /^(formal\/|runtimes\/)/.test(p);

export function snapshot() {
  const audit = [...read('formal/Checks.lean').matchAll(/^#print axioms (\S+)/gm)].map(m => m[1]);
  if (!audit.length || new Set(audit).size !== audit.length) throw Error('empty or duplicate axiom inventory');
  const records = fs.readdirSync(path.join(root, 'board/cards')).filter(f => f.endsWith('.json')).sort().map(f => {
    const card = JSON.parse(read(`board/cards/${f}`));
    const names = (card.formal?.theorems ?? []).map(t => {
      const candidates = audit.filter(n => n === t.name || n.endsWith(`.${t.name}`));
      if (candidates.length !== 1) throw Error(`record ${card.id}: unresolved or ambiguous audit root ${t.name}`);
      return candidates[0];
    });
    const model = card.formal?.location?.match(/formal\/[^\s]+\.lean/)?.[0];
    // Prose runtime descriptions remain on clauses; only concrete files are hashed.
    const artifactPaths = [model, ...card.relation.map(c => c.runtime)].filter(p => typeof p === 'string' && !/\s/.test(p) && /\.[A-Za-z0-9]+$/.test(p));
    const artifacts = [...new Set(artifactPaths)].map(p => {
      if (!safe(p)) throw Error(`unsupported artifact path ${p}`);
      return { path: p, sha256: hash(read(p)) };
    });
    return {
      id: card.id, recordSha256: hash(canonical(card)),
      formalRoots: names, hypotheses: card.formal?.hypotheses ?? [], artifacts,
      clauses: card.relation.map((c, i) => ({
        number: i + 1, statement: c.clause, status: 'pending-semantic-review',
        candidateFormalRoots: names, implementation: c.runtime ?? null,
        tests: [], obligation: c.runtime
          ? 'Review implementation and test correspondence; a source path is not a proof.'
          : 'No clause-level implementation reference supplied; establish coverage or record an explicit deferral.'
      }))
    };
  });
  const pendingModels = JSON.parse(read('formal/pending-models.json')).map(m => {
    if (!records.some(r => r.id === m.record) || !['model-built-record-fold-pending-ruling', 'model-built-finding-folded-coverage-pending', 'model-built-semantic-review-pending'].includes(m.status)) throw Error('invalid pending model');
    if (!m.roots.length || new Set(m.roots).size !== m.roots.length || m.roots.some(r => !audit.includes(r))) throw Error('pending model root missing from audit');
    if (!m.sources.length || !m.obligation) throw Error('pending model evidence incomplete');
    return { ...m, sources: m.sources.map(p => {
      if (!safe(p)) throw Error('unsafe pending source path');
      return { path: p, sha256: hash(read(p)) };
    }) };
  });
  return { schemaVersion: 2, pendingModels, auditRoots: audit, scope: 'Public-bound inventory; no semantic or cryptographic certification.',
    auditSha256: hash(read('formal/Checks.lean')), records };
}

export function checkCoverage(actual, expected = snapshot()) {
  // Exact comparison intentionally freezes the initial conservative inventory. Semantic promotion
  // needs a reviewed schema/checker extension, not a manual status edit that CI silently accepts.
  if (canonical(actual) !== canonical(expected)) throw Error('coverage drift: records, clauses, audit or artifacts differ; review before regenerating');
  return { records: actual.records.length, clauses: actual.records.reduce((n, r) => n + r.clauses.length, 0),
    formalRecords: actual.records.filter(r => r.formalRoots.length).length };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const file = path.join(root, 'formal/coverage.json');
    if (process.argv.includes('--write')) {
      fs.writeFileSync(file, JSON.stringify(snapshot(), null, 2) + '\n');
      console.log('Coverage inventory written; every clause remains pending semantic review.');
    } else console.log('Coverage consistency PASS', checkCoverage(JSON.parse(fs.readFileSync(file, 'utf8'))));
  } catch (e) { console.error(e.message); process.exitCode = 1; }
}
