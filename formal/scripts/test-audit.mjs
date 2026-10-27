import assert from 'node:assert/strict';
import {validateAudit} from './audit.mjs';
const ok="'A' depends on axioms: [propext, Quot.sound]\n'B' does not depend on any axioms\n";
assert.equal(validateAudit(ok,['A','B']).length,2);
for(const [out,roots] of [[ok,[]],['',['A']], [ok,['A']], [ok,['A','C']], [ok+ok,['A','B']], [ok.replace('propext','sorryAx'),['A','B']], [ok.replace('propext','Custom'),['A','B']], [ok,['A','A']]])assert.throws(()=>validateAudit(out,roots));
console.log('Audit tests PASS: baseline and eight rejected invalid audits.');
