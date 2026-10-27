import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {checkCoverage} from './check-coverage.mjs';
import {checkClauseReview} from './check-clause-review.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
export function validateAudit(output, expected) {
 if(!expected.length || new Set(expected).size!==expected.length) throw Error('empty or duplicate expected roots');
 if(/sorry|error:/i.test(output)) throw Error('Lean error or admitted proof');
 const rows=[...output.matchAll(/'([^']+)' (?:depends on axioms: \[([^\]]*)\]|(does not depend on any axioms))/g)].map(m=>({name:m[1],axioms:m[2]?m[2].split(',').map(x=>x.trim()):[]}));
 if(rows.length!==expected.length || new Set(rows.map(r=>r.name)).size!==rows.length || expected.some(n=>!rows.some(r=>r.name===n))) throw Error('root inventory mismatch');
 if(rows.some(r=>r.axioms.some(a=>!['propext','Classical.choice','Quot.sound'].includes(a)))) throw Error('forbidden axiom');
 return rows;
}
function sources(){const out={};function walk(dir){for(const d of fs.readdirSync(path.join(root,dir),{withFileTypes:true})){if(['.lake','evidence'].includes(d.name))continue;const p=dir?dir+'/'+d.name:d.name;if(d.isSymbolicLink())throw Error('symlink in audit sources');if(d.isDirectory())walk(p);else out[p]=sha(fs.readFileSync(path.join(root,p)));}}walk('');return Object.fromEntries(Object.entries(out).sort());}
function run(args){const r=spawnSync(process.platform==='win32'?'lake.exe':'lake',args,{cwd:root,encoding:'utf8',timeout:180000,maxBuffer:8*1024*1024});if(r.error||r.status!==0)throw Error(r.error?.message||r.stdout+r.stderr);return r.stdout+r.stderr;}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
 const receipt=path.join(root,'evidence/axiom-audit.json');fs.mkdirSync(path.dirname(receipt),{recursive:true});
 fs.writeFileSync(receipt,JSON.stringify({status:'RUNNING',startedAt:new Date().toISOString()})+'\n');
 checkCoverage(JSON.parse(fs.readFileSync(path.join(root,'coverage.json'))));
 checkClauseReview();
 const before=sources();const expected=[...fs.readFileSync(path.join(root,'Checks.lean'),'utf8').matchAll(/^#print axioms (\S+)/gm)].map(m=>m[1]);
 const build=run(['build']);const output=run(['env','lean','Checks.lean']);const rows=validateAudit(output,expected);
 // Review witnesses (counterexamples to over-claims, non-vacuity of hypotheses) compile under the same footprint rule; they are not construction roots.
 const witnesses=fs.readdirSync(path.join(root,'review')).filter(f=>f.endsWith('.lean')).sort().map(f=>{const out=run(['env','lean','review/'+f]);if(/sorry|error:/i.test(out))throw Error('review witness failed: '+f);const rs=[...out.matchAll(/'([^']+)' (?:depends on axioms: \[([^\]]*)\]|(does not depend on any axioms))/g)].map(m=>({name:m[1],axioms:m[2]?m[2].split(',').map(x=>x.trim()):[]}));if(!rs.length)throw Error('review witness prints no axioms: '+f);if(rs.some(r=>r.axioms.some(a=>!['propext','Classical.choice','Quot.sound'].includes(a))))throw Error('forbidden axiom in '+f);return {file:'review/'+f,rootCount:rs.length,roots:rs};});
 const after=sources();
 if(JSON.stringify(before)!==JSON.stringify(after))throw Error('sources changed during audit');
 const result={status:'PASS',finishedAt:new Date().toISOString(),scope:'Lean model roots only; no circuit/runtime equivalence or privacy certification',toolchain:fs.readFileSync(path.join(root,'lean-toolchain'),'utf8').trim(),leanVersion:run(['env','lean','--version']).trim(),rootCount:rows.length,roots:rows,reviewWitnesses:witnesses,sourceTreeSha256:sha(JSON.stringify(before)),sources:before,buildOutputSha256:sha(build),auditOutputSha256:sha(output)};
 fs.writeFileSync(receipt,JSON.stringify(result,null,2)+'\n');console.log('AXIOM CHECK: PASS — '+rows.length+' exact roots; '+witnesses.reduce((n,w)=>n+w.rootCount,0)+' review-witness theorems in '+witnesses.length+' files; receipt '+receipt);
 }catch(e){fs.writeFileSync(path.join(root,'evidence/axiom-audit.json'),JSON.stringify({status:'FAIL',error:e.message})+'\n');console.error(e.message);process.exitCode=1;}
}
