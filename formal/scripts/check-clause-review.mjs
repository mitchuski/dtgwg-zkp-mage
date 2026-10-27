import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p)));
export function checkClauseReview(inv=read('coverage.json'),rev=read('clause-review.json')) {
if(rev.records.length!==inv.records.length||new Set(rev.records.map(r=>r.id)).size!==inv.records.length)throw Error('review record mismatch');
for(const r of inv.records){const x=rev.records.find(x=>x.id===r.id);if(!x||x.recordSha256!==r.recordSha256||x.clauses.length!==r.clauses.length)throw Error('stale review '+r.id);const ids=new Set();for(const c of x.clauses){if(ids.has(c.number)||!r.clauses.some(t=>t.number===c.number)||!c.finding||!['partial-model','partial-model-or-open','assumed-relation','outside-model','outside-current-model','unspecified'].includes(c.disposition)||c.roots.some(n=>!inv.auditRoots.includes(n)))throw Error('invalid review '+r.id);ids.add(c.number);}}
return {records:rev.records.length,clauses:rev.records.reduce((n,r)=>n+r.clauses.length,0)};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log('Clause review consistency PASS',checkClauseReview());
