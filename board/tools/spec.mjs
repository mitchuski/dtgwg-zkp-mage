// spec.mjs — the ZK Book: render the deck of cards as Spec-Up-T markdown. Zero dependencies.
//   writeCookbook(cards, ctx) → zkbook/spec/recipes.md + records.md + zkbook/spec/terms-definitions/<generated>.md
// Static chapters (header, intro, pantry, appendix) are hand-written and never touched here.
// Rule of the book: a recipe may not say more than its card. Everything below is derived.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const ZKBOOK = join(REPO, 'zkbook');
const SPEC = join(ZKBOOK, 'spec');
const TERMS = join(SPEC, 'terms-definitions');

export * from './spec-render.mjs';
import { GADGET_DEFS, renderRecipes, renderRecords, validateRecord, renderStacks, validateStack, renderPrivacyDerived, renderTerms } from './spec-render.mjs';
const RECORDS = join(REPO, 'board', 'records');
export function loadRecords() {
  if (!existsSync(RECORDS)) return [];
  return readdirSync(RECORDS).filter(f => f.endsWith('.json')).sort().map(f => JSON.parse(readFileSync(join(RECORDS, f), 'utf8')));
}
const STACKS = join(REPO, 'board', 'stacks');
export function loadStacks() {
  if (!existsSync(STACKS)) return [];
  return readdirSync(STACKS).filter(f => f.endsWith('.json')).sort().map(f => JSON.parse(readFileSync(join(STACKS, f), 'utf8')));
}
export function writeCookbook(cards, gadgets = null) {
  writeFileSync(join(ZKBOOK, 'conformance', 'render-lib.mjs'), readFileSync(join(REPO, 'board', 'tools', 'spec-render.mjs')));
  mkdirSync(TERMS, { recursive: true });
  writeFileSync(join(SPEC, 'recipes.md'), renderRecipes(cards));
  const records = loadRecords();
  const bad = records.map(r => [r.id, validateRecord(r, cards)]).filter(([, v]) => v.length);
  if (bad.length) return { refusal: bad.map(([id, v]) => `${id}: ${v.join(' ')}`).join('; ') };
  writeFileSync(join(SPEC, 'records.md'), renderRecords(records, cards));
  const stacks = loadStacks();
  const badS = stacks.map(s => [s.id, validateStack(s, gadgets || Object.keys(GADGET_DEFS))]).filter(([, v]) => v.length);
  if (badS.length) return { refusal: badS.map(([id, v]) => `${id}: ${v.join(' ')}`).join('; ') };
  writeFileSync(join(SPEC, 'stacks.md'), renderStacks(stacks));
  writeFileSync(join(SPEC, 'privacy-derived.md'), renderPrivacyDerived(cards));
  // generated terms: prefixed g- so hand-written terms can live beside them
  for (const f of readdirSync(TERMS)) if (f.startsWith('g-')) unlinkSync(join(TERMS, f));
  const terms = renderTerms();
  for (const [file, text] of Object.entries(terms)) writeFileSync(join(TERMS, file), text);
  const written = Object.keys(terms);
  return { recipes: join(SPEC, 'recipes.md'), records: records.length, stacks: stacks.length, terms: written.length, cards: cards.length, exists: existsSync(join(ZKBOOK, 'specs.json')) };
}
export const writeZkBook = writeCookbook;
