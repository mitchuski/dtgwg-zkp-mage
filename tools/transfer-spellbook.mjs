#!/usr/bin/env node
// transfer-spellbook.mjs — carry the Zero Knowledge Spellbook's explanatory layer into the ZK Book. Zero-dep.
//   node tools/transfer-spellbook.mjs [--source <path to zk_grimoire_v3_0.md>] [--dry]
// Reads zkbook/transfer/spellbook-map.json, extracts each mapped tale's '#### Technical Bridge' (never 'The Story',
// never 'The Spell Inscription'), cleans lore lines, writes zkbook/transfer/bridges/tale-NN.md (raw, reviewable) and
// zkbook/spec/primer.md (the chapter). The narrative is excluded by construction, not by editing.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ZKBOOK = join(REPO, 'zkbook');
const MAP = JSON.parse(readFileSync(join(ZKBOOK, 'transfer', 'spellbook-map.json'), 'utf8'));
const argOf = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : undefined; };
const SOURCE = argOf('--source') || MAP.source.path;
const DRY = process.argv.includes('--dry');
if (!existsSync(SOURCE)) { console.log(`REFUSED source-missing:${SOURCE}`); process.exit(1); }

// sources: the v3.0 compilation + any frontier tales listed in the map (Zero Spellbook, Part VIII) — Technical Bridges only, same parser
const frontier = (MAP.source.frontier || []).filter(p => existsSync(p));
const missingFrontier = (MAP.source.frontier || []).filter(p => !existsSync(p));
const text = [readFileSync(SOURCE, 'utf8'), ...frontier.map(p => readFileSync(p, 'utf8'))].join('\n\n## FRONTIER SOURCE BOUNDARY\n\n').replace(/\r\n/g, '\n');
const lines = text.split('\n');
if (missingFrontier.length) console.log(`note: frontier sources missing, skipped: ${missingFrontier.join(', ')}`);

// ---- parse tales ----------------------------------------------------------------------------
const tales = {};
let cur = null;
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(/^### Tale (\d+):\s*(.+?)\s*$/);
  if (m) { cur = { n: Number(m[1]), title: m[2], start: i + 1, concepts: '', bridge: [], section: null }; tales[cur.n] = cur; continue; }
  if (!cur) continue;
  if (/^#{1,3} /.test(lines[i])) { cur = null; continue; }   // any H1–H3 ends the tale (an H1 reflection follows the last one in the source)
  const c = lines[i].match(/^\*\*Concepts:\*\*\s*(.+)$/); if (c) { cur.concepts = c[1].trim(); continue; }
  if (/^#### /.test(lines[i])) { cur.section = lines[i].replace(/^#### /, '').trim(); continue; }
  if (cur.section === 'Technical Bridge') cur.bridge.push({ i: i + 1, s: lines[i] });
}

// ---- clean: drop lore, keep knowledge ----------------------------------------------------------
const DROP_LINE = [
  /^\*\*Geometric Interpretation:?\*\*/i, /^\*\*Vertex/i, /^\*\*Lattice/i, /Vertex Coordinates/i, /^\[\[relationship proverb protocol/i,
  /^\*[“"].*[”"]\*\s*$/, /^\*[“"]/, /^Dimension \d/i, /^\*\*Dimensions? (activated|engaged)/i,
];
function clean(bridge) {
  const out = []; let dropPara = false; let dropped = 0;
  for (const { s } of bridge) {
    if (dropPara) { if (s.trim() === '') dropPara = false; dropped++; continue; }
    if (DROP_LINE.some(re => re.test(s.trim()))) { dropped++; dropPara = /^\*\*Geometric Interpretation/i.test(s.trim()); continue; }
    if (/^---\s*$/.test(s)) continue;
    out.push(s);
  }
  // collapse blank runs, trim
  const txt = out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  return { txt, dropped };
}

// ---- write bridges + primer -------------------------------------------------------------------
const bridgesDir = join(ZKBOOK, 'transfer', 'bridges');
if (!DRY) mkdirSync(bridgesDir, { recursive: true });
const report = [];
const mappedTales = new Set(MAP.sections.flatMap(s => s.tales));
for (const n of [...mappedTales].sort((a, b) => a - b)) {
  const t = tales[n];
  if (!t) { report.push({ n, error: 'tale-not-found' }); continue; }
  const { txt, dropped } = clean(t.bridge);
  report.push({ n, title: t.title, bridgeLines: t.bridge.length, kept: txt.split('\n').length, dropped });
  if (!DRY) writeFileSync(join(bridgesDir, `tale-${String(n).padStart(2, '0')}.md`), `# Tale ${n} — ${t.title}\n\nConcepts: ${t.concepts}\n\nSource: ${MAP.source.title}, '#### Technical Bridge' of Tale ${n} (source lines from ${t.bridge[0]?.i ?? '?'}); ${dropped} lore lines dropped by rule.\n\n---\n\n${txt}\n`);
}

const primer = `## Cryptographic Background

This section is informative.

${MAP.direction ? `> ${MAP.direction}

` : ''}This section gives the cryptographic background the construction records rely on, in the order a reader needs it: what a proof is and what a transcript binds; fields and curves; constraints, witnesses and public inputs; commitments and the setup question; transparent and hash-based proving; recursion and folding; the commit–membership–nullifier shape every construction inherits; how circuits fail in practice; and agents that prove. It is drawn from the editor's expository work in the agentprivacy body of work ([AGENTPRIVACY], see References), with the expository material carried and nothing else; provenance and licence are in Appendix A. Each subsection states which construction records, public-input conventions or proving-system entries lean on the idea, so a reader who wants only what a given construction needs can stop there.

${MAP.sections.map(sec => `### ${sec.id} · ${sec.title}

${sec.lead}

**Used by:** ${sec.uses.join(' · ')}
${sec.body ? `\n${sec.body.trim()}\n` : ''}
${sec.tales.filter(n => !(MAP.excludeFromSpec || []).includes(n)).map(n => {
  const t = tales[n]; if (!t) return `*(source ${n} not found)*`;
  let { txt } = clean(t.bridge);
  for (const [pat, flags, to] of (MAP.rewrites || [])) txt = txt.replace(new RegExp(pat, flags), to);   // spec-register rewrites, hand-kept in the map
  const topic = (MAP.topics && MAP.topics[n]) || t.title;
  return `#### ${topic}

*Covers: ${t.concepts}*

${txt}`;
}).join('\n\n')}
`).join('\n')}`;
if (!DRY) writeFileSync(join(ZKBOOK, 'spec', 'primer.md'), primer);
if (!DRY) writeFileSync(join(ZKBOOK, 'transfer', 'REPORT.md'), `# Transfer report — ${new Date().toISOString().slice(0, 10)}\n\nSource: ${SOURCE}\n\n| tale | title | bridge lines | kept | dropped (lore) |\n|---|---|---|---|---|\n${report.map(r => r.error ? `| ${r.n} | — | — | — | ${r.error} |` : `| ${r.n} | ${r.title} | ${r.bridgeLines} | ${r.kept} | ${r.dropped} |`).join('\n')}\n\nExcluded by map: ${MAP.excluded.map(x => x.tales ? x.tales.join(',') : x.parts.length + ' part kinds').join(' · ')}.\n`);
console.log(`${DRY ? '(dry) ' : ''}primer.md: ${MAP.sections.length} sections over ${mappedTales.size} tales; bridges written: ${report.filter(r => !r.error).length}; total lore lines dropped: ${report.reduce((a, r) => a + (r.dropped || 0), 0)}${report.some(r => r.error) ? '; MISSING: ' + report.filter(r => r.error).map(r => r.n).join(',') : ''}`);
