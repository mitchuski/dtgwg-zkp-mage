#!/usr/bin/env node
// test-kb.mjs — property tests for the KB projection (K1–K8). Zero-dep Node ESM.

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanText, topLevelHeadings, SOURCES, ROOT } from './build-kb.mjs';

const KB = path.join(ROOT, 'kb');
const FEDWIKI = path.join(KB, 'fedwiki');
const MARKDOWN = path.join(KB, 'markdown');
const BUILD = path.join(ROOT, 'tools', 'build-kb.mjs');

let pass = 0;
let fail = 0;
function ok(name, cond, detail = '') {
  if (cond) {
    pass++;
    console.log(`  ok  ${name}`);
  } else {
    fail++;
    console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`);
  }
}

const runBuild = () =>
  execFileSync(process.execPath, [BUILD], { cwd: ROOT, encoding: 'utf8' });

function hashTree(dir) {
  const map = new Map();
  const rec = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) rec(p);
      else map.set(path.relative(dir, p), createHash('sha256').update(fs.readFileSync(p)).digest('hex'));
    }
  };
  rec(dir);
  return map;
}

// --------------------------------------------------------------------------
// K1 — build runs green; every manifested source produced >= 1 page;
//      unmanifested files reported by name and are exactly the deliberate
//      exclusions (vendored dir, root spec drafts, workbench registers/stubs,
//      other chronicles).
// --------------------------------------------------------------------------
let report = null;
try {
  runBuild();
  report = JSON.parse(fs.readFileSync(path.join(KB, 'build-report.json'), 'utf8'));
  ok('K1 build runs green and writes build-report.json', true);
} catch (e) {
  ok('K1 build runs green and writes build-report.json', false, e.message);
}

if (report) {
  const producedBy = new Map();
  for (const p of report.pages) producedBy.set(p.source, (producedBy.get(p.source) || 0) + 1);
  const missing = SOURCES.filter((s) => !producedBy.get(s.path));
  ok('K1 every manifested source produced >= 1 page', missing.length === 0,
    missing.map((s) => s.path).join(', '));

  const un = report.unmanifestedExcluded;
  const allowed = [
    /^dtgwg-cred-spec-main\//,                                    // vendored upstream spec
    /^SPEC-DRAFT-proof-of-understanding-trust-task\.md$/,          // root drafts kept out of scope
    /^TRUST-TASKS-FIT-MAP-2026-07-18\.md$/,
    /^\.\.\/dtgwg-zkp-tf-mage\/runtimes\/(CRED-SPEC-COHERENCE|CRED-SPEC-OPPORTUNITIES|STRAWMAN-COHERENCE-EDITS)\.md$/,
    /^\.\.\/dtgwg-zkp-tf-mage\/runtimes\/[^/]+\/STUB\.md$/,        // stub predicates (no evidence yet)
    /^\.\.\/agentprivacy_master\/docs\/chronicles\/(?!2026-07-16_trust-graph-formation-dream-cycle\.md$|2026-07-18_the-first-circuit\.md$).+\.md$/,
  ];
  const unexpected = un.filter((u) => !allowed.some((re) => re.test(u)));
  ok('K1 unmanifested report exists and is non-empty', Array.isArray(un) && un.length > 0);
  ok('K1 unmanifested list = only the deliberate exclusions', unexpected.length === 0,
    unexpected.slice(0, 5).join(', '));
  ok('K1 vendored dtgwg-cred-spec-main/ is excluded (reported, not projected)',
    un.some((u) => u.startsWith('dtgwg-cred-spec-main/')) &&
      report.pages.every((p) => !p.source.startsWith('dtgwg-cred-spec-main/')));
}

// --------------------------------------------------------------------------
// K2 — determinism: two builds byte-identical across kb/
// --------------------------------------------------------------------------
try {
  const h1 = hashTree(KB);
  runBuild();
  const h2 = hashTree(KB);
  let same = h1.size === h2.size;
  if (same) for (const [k, v] of h1) if (h2.get(k) !== v) { same = false; break; }
  ok('K2 two builds are byte-identical across kb/', same);
} catch (e) {
  ok('K2 two builds are byte-identical across kb/', false, e.message);
}

// --------------------------------------------------------------------------
// K3 — every fedwiki page: valid JSON, non-empty title + story, 16-hex ids,
//      dates pinned to 0
// --------------------------------------------------------------------------
{
  const files = fs.readdirSync(FEDWIKI).filter((f) => f.endsWith('.json') && f !== 'sitemap.json');
  let bad = [];
  for (const f of files) {
    try {
      const page = JSON.parse(fs.readFileSync(path.join(FEDWIKI, f), 'utf8'));
      const goodStory =
        Array.isArray(page.story) &&
        page.story.length > 0 &&
        page.story.every(
          (it) => it.type === 'markdown' && /^[0-9a-f]{16}$/.test(it.id) && typeof it.text === 'string' && it.text.length > 0
        );
      const goodJournal =
        Array.isArray(page.journal) &&
        page.journal.length === 1 &&
        page.journal[0].type === 'create' &&
        page.journal[0].date === 0 &&
        page.journal[0].item.title === page.title;
      if (!(typeof page.title === 'string' && page.title.length > 0 && goodStory && goodJournal)) bad.push(f);
    } catch {
      bad.push(f);
    }
  }
  ok(`K3 all ${files.length} fedwiki pages parse with title/story/16-hex ids/date 0`, files.length > 0 && bad.length === 0, bad.slice(0, 5).join(', '));
}

// --------------------------------------------------------------------------
// K4 — sitemap covers exactly the emitted pages
// --------------------------------------------------------------------------
{
  const sitemap = JSON.parse(fs.readFileSync(path.join(FEDWIKI, 'sitemap.json'), 'utf8'));
  const slugsOnDisk = new Set(
    fs.readdirSync(FEDWIKI).filter((f) => f.endsWith('.json') && f !== 'sitemap.json').map((f) => f.replace(/\.json$/, ''))
  );
  const slugsInMap = new Set(sitemap.map((e) => e.slug));
  const coversAll = slugsOnDisk.size === slugsInMap.size && [...slugsOnDisk].every((s) => slugsInMap.has(s));
  const shape = sitemap.every((e) => e.title && e.date === 0 && typeof e.synopsis === 'string');
  ok('K4 sitemap covers exactly the emitted pages (with title/synopsis/date 0)', coversAll && shape);
}

// --------------------------------------------------------------------------
// K5 — markdown bundle: front-matter parses; INDEX.md links resolve; every
//      page is listed in INDEX.md
// --------------------------------------------------------------------------
{
  const files = fs.readdirSync(MARKDOWN).filter((f) => f.endsWith('.md') && f !== 'INDEX.md');
  let badFm = [];
  for (const f of files) {
    const text = fs.readFileSync(path.join(MARKDOWN, f), 'utf8');
    const m = text.match(/^---\n([\s\S]*?)\n---\n/);
    if (!m) { badFm.push(f); continue; }
    const fm = {};
    for (const line of m[1].split('\n')) {
      const kv = line.match(/^([\w_]+):\s*(.*)$/);
      if (kv) fm[kv[1]] = kv[2].replace(/^"|"$/g, '');
    }
    if (!(fm.title && fm.section && fm.source && fm.built_from_commitish === 'working-tree' && /^\d+$/.test(fm.order ?? ''))) badFm.push(f);
  }
  ok(`K5 all ${files.length} markdown pages carry parseable front-matter`, files.length > 0 && badFm.length === 0, badFm.slice(0, 5).join(', '));

  const index = fs.readFileSync(path.join(MARKDOWN, 'INDEX.md'), 'utf8');
  const linked = [...index.matchAll(/\]\(\.\/([^)]+\.md)\)/g)].map((m) => m[1]);
  const broken = linked.filter((l) => !fs.existsSync(path.join(MARKDOWN, l)));
  const unlisted = files.filter((f) => !linked.includes(f));
  ok('K5 INDEX.md links all resolve and cover every page', broken.length === 0 && unlisted.length === 0,
    [...broken, ...unlisted].slice(0, 5).join(', '));
}

// --------------------------------------------------------------------------
// K6 — the decision doc's § split covers ALL its top-level sections
// --------------------------------------------------------------------------
{
  const src = fs.readFileSync(path.join(ROOT, 'predicate-assurance-boundary-decision.md'), 'utf8').replace(/\r\n/g, '\n');
  const heads = topLevelHeadings(src);
  const decisionPages = report ? report.pages.filter((p) => p.section === 'decision') : [];
  ok(`K6 decision split: ${heads.length} '## ' sections -> ${decisionPages.length} pages (sections + overview)`,
    decisionPages.length === heads.length + 1);
  const titles = decisionPages.map((p) => p.title);
  const uncovered = heads.filter((h) => {
    const expected = h.text.replace(/^(\d+)\.\s+/, '');
    return !titles.some((t) => t.endsWith(`— ${expected}`) || t === `Decision — ${h.text}`);
  });
  ok('K6 every top-level heading has its own titled page', uncovered.length === 0,
    uncovered.map((h) => h.text).slice(0, 5).join(', '));
}

// --------------------------------------------------------------------------
// K7 — gate: corpus scan is clean, and a synthetic secret DOES trip the gate
// --------------------------------------------------------------------------
{
  ok('K7 gate reports 0 secret hits over the real corpus',
    report && report.gate.hits === 0 && report.gate.pagesScanned === report.totalPages);
  const synthetic = scanText('# synthetic page\nlogin config\npassword: hunter2\n');
  ok('K7 synthetic page with "password: hunter2" trips the gate', synthetic.length > 0);
  const alsoSecret = scanText('deploy notes\nsecret = "sk_live_ABCDEFGH12345678"\n');
  ok('K7 synthetic secret-assignment trips the gate', alsoSecret.length > 0);
}

// --------------------------------------------------------------------------
// K8 — cross-links: at least one [[...]] resolves to a manifested title, and
//      no [[...]] link targets an unmanifested page
// --------------------------------------------------------------------------
{
  const titles = new Set(report ? report.pages.map((p) => p.title) : []);
  const links = [];
  for (const f of fs.readdirSync(FEDWIKI)) {
    if (!f.endsWith('.json') || f === 'sitemap.json') continue;
    const page = JSON.parse(fs.readFileSync(path.join(FEDWIKI, f), 'utf8'));
    for (const it of page.story) for (const m of it.text.matchAll(/\[\[([^\]]+)\]\]/g)) links.push(m[1]);
  }
  const resolved = links.filter((l) => titles.has(l));
  const dangling = links.filter((l) => !titles.has(l));
  ok(`K8 at least one [[...]] link resolves to a manifested title (${resolved.length}/${links.length} resolve)`, resolved.length >= 1);
  ok('K8 no [[...]] link targets an unmanifested page', dangling.length === 0,
    [...new Set(dangling)].slice(0, 5).join(', '));
}

console.log('');
console.log(`kb: ${pass}/${pass + fail} pass`);
process.exit(fail ? 1 : 0);
