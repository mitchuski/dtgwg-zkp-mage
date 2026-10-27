import fs from 'node:fs';
import assert from 'node:assert/strict';
import {checkClauseReview} from './check-clause-review.mjs';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url)));
const inv=read('coverage.json'), rev=read('clause-review.json');
checkClauseReview(inv,rev);
const mutations=[r=>r.records.pop(),r=>r.records[0].recordSha256='stale',r=>r.records[0].clauses.pop(),r=>r.records[0].clauses.push(r.records[0].clauses[0]),r=>r.records[0].clauses[0].roots.push('Not.Checked'),r=>r.records[0].clauses[0].disposition='fully-verified',r=>r.records[0].clauses[0].finding=''];
for(const mutate of mutations){const r=structuredClone(rev);mutate(r);assert.throws(()=>checkClauseReview(inv,r));}
console.log('Clause review: baseline + 7 rejection cases PASS');
