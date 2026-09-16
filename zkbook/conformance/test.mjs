#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 the contributors to the Trust over IP Foundation DTG ZKP Task Force. Contributed under the ToIP JDF charter.
// conformance/test.mjs — the two checks continuous integration runs on this repository. Zero dependencies.
//   1. every record / request / proving-system entry validates (validate.mjs)
//   2. the generated sections of spec/body.md are current: the digest stamped in body.md equals the digest of
//      conformance/records + requests + stacks as they are now (canonical JSON, sorted keys, sorted file order)
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { validateAll } from './validate.mjs';
import { checkGenerated } from './generate.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..');

export function canonical(v) {
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(canonical).join(',') + ']';
  return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canonical(v[k])).join(',') + '}';
}
export function recordsDigest(root = HERE) {
  const h = createHash('sha256');
  for (const d of ['records', 'requests', 'stacks']) {
    const dir = join(root, d);
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir).filter(f => f.endsWith('.json')).sort()) h.update(`${d}/${f}\n${canonical(JSON.parse(readFileSync(join(dir, f), 'utf8')))}\n`);
  }
  return h.digest('hex');
}

let fails = 0;
const results = validateAll(HERE);
for (const x of results) if (x.refusals.length) { fails++; console.log(`FAIL ${x.kind} ${x.file}: ${x.refusals.join(' ')}`); }
console.log(`ok   ${results.length - results.filter(x => x.refusals.length).length}/${results.length} conformance files validate`);

try {
  const errors = checkGenerated(HERE);
  for (const error of errors) { fails++; console.log(`FAIL ${error}`); }
  if (!errors.length) console.log('ok   generated sections and terms match regeneration from the current records');
} catch (error) { fails++; console.log(`FAIL ${error.message}`); }

console.log(fails ? `\n${fails} failure(s)` : '\nall conformance checks pass');
process.exit(fails ? 1 : 0);
