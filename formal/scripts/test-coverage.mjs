import assert from 'node:assert/strict';
import { snapshot, checkCoverage } from './check-coverage.mjs';
const expected = snapshot();
checkCoverage(expected, expected);
const mutations = [
  x => x.pendingModels = [],
  x => x.pendingModels[0].sources[0].sha256 = "stale",
  x => x.pendingModels[0].roots.pop(),
  x => x.records.pop(),
  x => x.records[0].clauses.pop(),
  x => x.records[0].clauses.push(x.records[0].clauses[0]),
  x => x.records[0].clauses[0].statement += ' changed',
  x => x.records[0].recordSha256 = 'stale',
  x => x.auditSha256 = 'stale',
  x => x.records[0].artifacts[0].sha256 = 'stale',
  x => x.records[0].formalRoots = [],
  x => x.records[0].clauses[0].status = 'verified'
];
for (const mutate of mutations) {
  const copy = structuredClone(expected); mutate(copy);
  assert.throws(() => checkCoverage(copy, expected), /coverage drift/);
}
console.log(`Coverage tests PASS: baseline plus ${mutations.length} rejected mutations.`);
