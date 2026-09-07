// one-shot, 2026-09-05: specification register in the JSON data that becomes the spec repo's conformance/ files,
// and the register-string rename record-recipe-missing → request-construction-missing everywhere it is spelled.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const SUBS = [
  [/\b010 tasting\b/g, '010 conformance fixtures'], [/\b010 ingredients\b/g, '010 witness'], [/\b010 pantry\b/g, '010 public inputs'],
  [/\(the recipe's method\)/g, "(the construction record's method)"], [/→ recipe (\d{3})/g, '→ construction $1'],
  [/The recipe is the how\./g, 'The construction record is the how.'], [/the recipe is the how/gi, 'the construction record is the how'],
  [/\bDTG recipes\b/g, 'DTG constructions'], [/the pantry's canonical transcript/g, 'the canonical transcript'],
  [/useful for the recipes\b/g, 'useful for the constructions'], [/\bfor recipes (\d{3})/g, 'for constructions $1'],
  [/Why it is in the book\b/g, 'Why it is in this specification'], [/this book's reproduction ladder/g, "this specification's reproduction ladder"],
  [/the same pantry object serves/g, 'the same public-input object serves'], [/\bpantry\b/g, 'public inputs'],
  [/\bthe recipes'\b/g, "the constructions'"], [/\brecipes\b/g, 'constructions'], [/\brecipe\b/g, 'construction'],
  [/\bcard-no-hand-rolled-option\b/g, 'record-no-hand-rolled-option'],
];
const KEEP_KEYS = new Set(['dish', 'ingredients', 'pantry', 'tasting', 'yield']); // field NAMES stay; only string VALUES change
function walk(v) {
  if (typeof v === 'string') { let s = v; for (const [re, to] of SUBS) s = s.replace(re, to); return s; }
  if (Array.isArray(v)) return v.map(walk);
  if (v && typeof v === 'object') { const o = {}; for (const [k, x] of Object.entries(v)) o[k] = walk(x); return o; }
  return v;
}
let changed = 0;
for (const dir of ['board/cards', 'board/records', 'board/stacks']) {
  for (const f of readdirSync(dir).filter(f => f.endsWith('.json'))) {
    const p = join(dir, f); const before = readFileSync(p, 'utf8'); const after = JSON.stringify(walk(JSON.parse(before)), null, 2) + '\n';
    if (after !== before) { writeFileSync(p, after); changed++; console.log('vocab:', p); }
  }
}
// register string rename
for (const p of ['board/tools/spec.mjs', 'zkbook/conformance/validate.mjs', 'zkbook/spec/conformance.md', 'board/test.mjs']) {
  const t = readFileSync(p, 'utf8'); const u = t.replace(/record-recipe-missing/g, 'request-construction-missing');
  if (u !== t) { writeFileSync(p, u); console.log('rename:', p); }
}
console.log(`json files changed: ${changed}`);
// residual scan over the data
let hits = [];
for (const dir of ['board/cards', 'board/records', 'board/stacks']) for (const f of readdirSync(dir).filter(f => f.endsWith('.json'))) {
  const t = readFileSync(join(dir, f), 'utf8'); const m = t.match(/\b(recipe|recipes|pantry|kitchen|cookbook|this book)\b/gi);
  if (m) hits.push(`${dir}/${f}: ${[...new Set(m)].join(',')}`);
}
console.log(hits.length ? 'RESIDUAL (field names excluded below):\n' + hits.join('\n') : 'no residual kitchen words in data values');
