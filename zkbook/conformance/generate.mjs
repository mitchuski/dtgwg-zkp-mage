// Self-contained generation: no dependency on the evidence repository at runtime.
import { readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { renderRecords, renderRecipes, renderStacks, renderPrivacyDerived, renderTerms } from './render-lib.mjs';
import { validateAll } from './validate.mjs';

export const canonical = value => value === null || typeof value !== 'object' ? JSON.stringify(value) : Array.isArray(value) ? '[' + value.map(canonical).join(',') + ']' : '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + canonical(value[k])).join(',') + '}';
export function loadSources(root) {
  const data = {}, hash = createHash('sha256');
  for (const d of ['records', 'requests', 'stacks']) {
    data[d] = [];
    for (const f of readdirSync(join(root, d)).filter(f => f.endsWith('.json')).sort()) {
      const v = JSON.parse(readFileSync(join(root, d, f), 'utf8')); data[d].push(v);
      hash.update(`${d}/${f}\n${canonical(v)}\n`);
    }
  }
  return { ...data, digest: hash.digest('hex') };
}
export function generatedSections(data) {
  return { requests: renderRecords(data.requests, data.records).trim(), constructions: renderRecipes(data.records).trim(),
    stacks: renderStacks(data.stacks).trim(), privacy: renderPrivacyDerived(data.records).trim() };
}
export function markedSection(name, text) {
  return `<!-- generated-section:${name}:start -->\n${text.trim()}\n<!-- generated-section:${name}:end -->`;
}
function findSection(body, name) {
  const start = `<!-- generated-section:${name}:start -->`, end = `<!-- generated-section:${name}:end -->`;
  if (body.split(start).length !== 2 || body.split(end).length !== 2) throw new Error(`generated-section-missing-or-duplicate:${name}`);
  const a = body.indexOf(start), b = body.indexOf(end) + end.length;
  if (b <= a) throw new Error(`generated-section-order:${name}`);
  return { a, b, text: body.slice(a, b) };
}
export function checkGenerated(root) {
  const data = loadSources(root), repo = join(root, '..'), body = readFileSync(join(repo, 'spec/body.md'), 'utf8').replace(/\r\n/g, '\n');
  const failures = [];
  const stamp = body.match(/<!-- generated-from: records-sha256=([0-9a-f]{64})/);
  if (!stamp || stamp[1] !== data.digest) failures.push('generated-source-digest-mismatch');
  for (const [name, text] of Object.entries(generatedSections(data))) {
    try { if (findSection(body, name).text !== markedSection(name, text)) failures.push(`generated-content-mismatch:${name}`); }
    catch (e) { failures.push(e.message); }
  }
  const terms = renderTerms(), dir = join(repo, 'spec/terms-definitions');
  for (const [file, text] of Object.entries(terms)) {
    if (!existsSync(join(dir, file)) || readFileSync(join(dir, file), 'utf8').replace(/\r\n/g, '\n') !== text) failures.push(`generated-term-mismatch:${file}`);
  }
  for (const file of existsSync(dir) ? readdirSync(dir) : []) if (file.startsWith('g-') && file.endsWith('.md') && !(file in terms)) failures.push(`generated-term-obsolete:${file}`);
  return failures;
}
export function regenerate(root) {
  const bad = validateAll(root).filter(r => r.refusals.length);
  if (bad.length) throw new Error('generation-refused-invalid-records');
  const data = loadSources(root), repo = resolve(root, '..'), file = join(repo, 'spec/body.md');
  let body = readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  // Validate every boundary before writing anything; editor sections are preserved.
  for (const [name, text] of Object.entries(generatedSections(data))) {
    const { a, b } = findSection(body, name); body = body.slice(0, a) + markedSection(name, text) + body.slice(b);
  }
  if (!/<!-- generated-from: records-sha256=[0-9a-f]{64}/.test(body)) throw new Error('generated-source-stamp-missing');
  body = body.replace(/(<!-- generated-from: records-sha256=)[0-9a-f]{64}/, '$1' + data.digest);
  const terms = renderTerms(), dir = join(repo, 'spec/terms-definitions'); mkdirSync(dir, { recursive: true });
  writeFileSync(file, body);
  for (const [name, text] of Object.entries(terms)) writeFileSync(join(dir, name), text);
  for (const name of readdirSync(dir)) if (name.startsWith('g-') && name.endsWith('.md') && !(name in terms)) unlinkSync(join(dir, name));
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = dirname(fileURLToPath(import.meta.url));
  try { regenerate(root); console.log('Generated sections and terms updated; editor sections preserved.'); }
  catch (e) { console.error(e.message); process.exitCode = 1; }
}
