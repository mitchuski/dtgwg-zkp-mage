#!/usr/bin/env node
// build-kb.mjs — deterministic knowledge-base projection for the DTG research corpus.
//
// Projects the research root (dtgwg-cred-spec-main_mage), the workbench lab evidence
// (dtgwg-zkp-tf-mage/runtimes NOTES), and the two DTG chronicles into two portable
// carriers under kb/:
//   kb/fedwiki/   — Smallest-Federated-Wiki page JSON + sitemap.json
//   kb/markdown/  — front-mattered markdown bundle + INDEX.md (git / Confluence carrier)
//   kb/README.md  — how to use each output
//   kb/build-report.json — pages, unmanifested exclusions, gate summary (machine-readable)
//
// MANIFEST-FIRST: only files in SOURCES are projected. Any source-shaped file found in
// the scan roots that is NOT in the manifest is reported loudly as "unmanifested" and
// EXCLUDED. Nothing is ever silently included.
//
// DETERMINISM: no clocks, no randomness. Story-item ids = first 16 hex chars of
// sha256(`${slug}:${index}`) (a ':' separator is used so distinct (slug,index) pairs can
// never collide by concatenation). All dates pinned to 0. Re-runs are byte-identical.
//
// SECRET GATE: every projected page text is scanned for secret-shaped content before
// anything is written; any hit fails the build with a per-page report.
//
// Zero dependencies. Node >= 18, ESM. Corpus sources are READ-ONLY; kb/ is the only
// write target.

import { createHash } from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// ---------------------------------------------------------------------------
// Locations (derived from this script's position: <research-root>/tools/build-kb.mjs)
// ---------------------------------------------------------------------------

const TOOLS_DIR = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(TOOLS_DIR, '..');                              // research root
const WORKBENCH_RUNTIMES = path.resolve(ROOT, '..', 'dtgwg-zkp-tf-mage', 'runtimes');
const CHRONICLES_DIR = path.resolve(ROOT, '..', 'agentprivacy_master', 'docs', 'chronicles');
const KB_DIR = path.join(ROOT, 'kb');

// ---------------------------------------------------------------------------
// SOURCES manifest — the single authority on what is projected.
// path is relative to the research root (forward slashes). A file not listed here
// is never projected, no matter where the scanner finds it.
// ---------------------------------------------------------------------------

const LAB_DIRS = [
  '01-uniqueness-nullifier',
  '07-trust-graph-formation',
  'circom-gadget',
  'consumer-py',
  'context-card',
  'erosion-record',
  'fixtures',
  'guardian-recovery',
  'mediator',
  'multi-issuer',
  'quiet-presentation',
  'rotation',
  'show-composition',
  'witness-seat',
];

export const SOURCES = [
  // -- root ------------------------------------------------------------------
  { path: 'README.md', slug: 'dtg-research-root', section: 'root', title: 'DTG Research Root' },
  { path: 'WORKFLOW.md', slug: 'workflow', section: 'root', title: 'Workflow — Workbench and Research Root' },
  { path: 'INTEGRATION-MAP.md', slug: 'integration-map', section: 'root', title: 'Integration Map' },
  { path: 'BRIEFING-2026-07-18-zkp-explorations.md', slug: 'briefing-2026-07-18-zkp-explorations', section: 'root', title: 'Briefing 2026-07-18 — ZKP Explorations' },

  // -- decision (split per top-level § into multiple pages) ------------------
  { path: 'predicate-assurance-boundary-decision.md', slug: 'decision', section: 'decision', split: 'sections' },

  // -- explorations ----------------------------------------------------------
  { path: 'explorations/README.md', slug: 'explorations', section: 'explorations', title: 'Explorations Index' },
  { path: 'explorations/O1-deferred-zk-layer.md', slug: 'o1-deferred-zk-layer', section: 'explorations', title: 'O1 — Deferred ZK Layer' },
  { path: 'explorations/O2-phc-by-nullifier.md', slug: 'o2-phc-by-nullifier', section: 'explorations', title: 'O2 — PHC by Nullifier' },
  { path: 'explorations/O3-idvc-assurance-profile.md', slug: 'o3-idvc-assurance-profile', section: 'explorations', title: 'O3 — IDVC Assurance Profile' },
  { path: 'explorations/O4-registry-zk-revocation.md', slug: 'o4-registry-zk-revocation', section: 'explorations', title: 'O4 — Registry ZK Revocation' },
  { path: 'explorations/O5-O6-O8-supporting.md', slug: 'o5-o6-o8-supporting', section: 'explorations', title: 'O5 O6 O8 — Supporting Notes' },
  { path: 'explorations/O7-agent-card-zk.md', slug: 'o7-agent-card-zk', section: 'explorations', title: 'O7 — Agent Card ZK' },
  { path: 'explorations/O9-vrc-promise-bundle.md', slug: 'o9-vrc-promise-bundle', section: 'explorations', title: 'O9 — VRC Promise Bundle' },
  { path: 'explorations/SEMAPHORE-V4-CROSSCHECK.md', slug: 'semaphore-v4-crosscheck', section: 'explorations', title: 'Semaphore v4 Crosscheck' },
  { path: 'explorations/VWC-witness-seat.md', slug: 'vwc-witness-seat', section: 'explorations', title: 'VWC — Witness Seat' },
  { path: 'explorations/X1-conformance-fixtures.md', slug: 'x1-conformance-fixtures', section: 'explorations', title: 'X1 — Conformance Fixtures' },
  { path: 'explorations/X2-context-legibility-instrument.md', slug: 'x2-context-legibility-instrument', section: 'explorations', title: 'X2 — Context Legibility Instrument' },
  { path: 'explorations/X3-trust-task-composition.md', slug: 'x3-trust-task-composition', section: 'explorations', title: 'X3 — Trust Task Composition' },
  { path: 'explorations/X4-observable-event-minimisation.md', slug: 'x4-observable-event-minimisation', section: 'explorations', title: 'X4 — Observable Event Minimisation' },
  { path: 'explorations/X5-recovery-rotation.md', slug: 'x5-recovery-rotation', section: 'explorations', title: 'X5 — Recovery and Rotation' },
  { path: 'explorations/X6-assurance-horizons-erosion-clocks.md', slug: 'x6-assurance-horizons-erosion-clocks', section: 'explorations', title: 'X6 — Assurance Horizons and Erosion Clocks' },
  { path: 'explorations/X7-mediated-proving-profile.md', slug: 'x7-mediated-proving-profile', section: 'explorations', title: 'X7 — Mediated Proving Profile' },
  { path: 'explorations/X8-multi-issuer-aggregation.md', slug: 'x8-multi-issuer-aggregation', section: 'explorations', title: 'X8 — Multi-Issuer Aggregation' },
  { path: 'explorations/X9-guardian-recovery.md', slug: 'x9-guardian-recovery', section: 'explorations', title: 'X9 — Guardian Recovery' },
  { path: 'explorations/X10-ceremony-as-trust-task.md', slug: 'x10-ceremony-as-trust-task', section: 'explorations', title: 'X10 — Ceremony as Trust Task' },
  { path: 'explorations/X11-field-guide-deployment.md', slug: 'x11-field-guide-deployment', section: 'explorations', title: 'X11 — The Field Guide Deployment' },

  // -- lab (workbench evidence layer) ----------------------------------------
  { path: '../dtgwg-zkp-tf-mage/runtimes/README.md', slug: 'lab-runtimes', section: 'lab', title: 'Lab — Runtimes' },
  ...LAB_DIRS.map((d) => ({
    path: `../dtgwg-zkp-tf-mage/runtimes/${d}/NOTES.md`,
    slug: `lab-${d.toLowerCase()}`,
    section: 'lab',
    title: `Lab — ${d}`,
    labDir: d,
  })),

  // -- chronicles ------------------------------------------------------------
  {
    path: '../agentprivacy_master/docs/chronicles/2026-07-16_trust-graph-formation-dream-cycle.md',
    slug: 'chronicle-2026-07-16-trust-graph-formation-dream-cycle',
    section: 'chronicles',
    title: 'Chronicle 2026-07-16 — Trust-Graph Formation Dream Cycle',
  },
  {
    path: '../agentprivacy_master/docs/chronicles/2026-07-18_the-first-circuit.md',
    slug: 'chronicle-2026-07-18-the-first-circuit',
    section: 'chronicles',
    title: 'Chronicle 2026-07-18 — The First Circuit',
  },
];

const SECTION_ORDER = ['root', 'decision', 'explorations', 'lab', 'chronicles'];
const SECTION_LABEL = {
  root: 'Root — workflow, integration map, briefing',
  decision: 'Decision — Predicate & Assurance-Boundary Decision Document (split per §)',
  explorations: 'Explorations — O-series, X-series, crosschecks',
  lab: 'Lab — workbench runtime evidence (NOTES)',
  chronicles: 'Chronicles',
};

// ---------------------------------------------------------------------------
// Secret gate
// ---------------------------------------------------------------------------

// Returns an array of {pattern, match} hits for secret-shaped content.
// Tuned against the corpus so legitimate cryptographic material does not trip it:
//  - big decimal literals (BN254 field elements) and pure-hex digests are hashes/
//    public constants, not secrets, and are skipped in the blob check;
//  - "never-sees-the-secret = triple structural guard" style prose is excluded by
//    requiring a token-shaped literal value (>= 8 chars) after secret[:=] and a
//    non-word boundary before "secret".
export function scanText(text) {
  const hits = [];
  const push = (pattern, m) => hits.push({ pattern, match: String(m).slice(0, 80) });

  const password = text.match(/password/i);
  if (password) push('password', password[0]);

  const apiKey = text.match(/api[_-]?key/i);
  if (apiKey) push('api-key', apiKey[0]);

  const secretAssign = text.match(/(?:^|[^\w-])secret\s*[:=]\s*["'`]?[A-Za-z0-9_\-+/]{8,}/i);
  if (secretAssign) push('secret-assignment', secretAssign[0].trim());

  const soulbae = text.match(/soulbae/i);
  if (soulbae) push('soulbae', soulbae[0]);

  // base64-ish blobs: 40+ chars of base64 alphabet (slash excluded so file paths
  // never match). Skip pure decimals (field elements) and pure hex (digests).
  const blobRe = /[A-Za-z0-9+=]{40,}/g;
  for (const m of text.matchAll(blobRe)) {
    const tok = m[0];
    if (/^[0-9]+$/.test(tok)) continue;                       // decimal constant
    if (/^(0x)?[0-9a-fA-F]+$/.test(tok)) continue;            // hex digest
    push('base64-blob', tok);
  }
  return hits;
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

const sha16 = (s) => createHash('sha256').update(s, 'utf8').digest('hex').slice(0, 16);
const read = (abs) => fs.readFileSync(abs, 'utf8').replace(/\r\n/g, '\n');
const toPosix = (p) => p.split(path.sep).join('/');
const absOf = (rel) => path.resolve(ROOT, rel);

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/§/g, 's')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function yamlQuote(v) {
  if (typeof v === 'number') return String(v);
  return `"${String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

// Walk a directory collecting .md files (absolute paths), skipping noise dirs.
function walkMd(dir, skipNames = new Set(['node_modules', '.git', 'kb', 'tools'])) {
  const out = [];
  const rec = (d) => {
    let entries;
    try {
      entries = fs.readdirSync(d, { withFileTypes: true });
    } catch {
      return;
    }
    entries.sort((a, b) => a.name.localeCompare(b.name, 'en'));
    for (const e of entries) {
      if (e.isDirectory()) {
        if (!skipNames.has(e.name)) rec(path.join(d, e.name));
      } else if (e.isFile() && e.name.toLowerCase().endsWith('.md')) {
        out.push(path.join(d, e.name));
      }
    }
  };
  rec(dir);
  return out;
}

// ---------------------------------------------------------------------------
// Decision-document split (per top-level '## ' section)
// ---------------------------------------------------------------------------

// Fence-aware list of top-level '## ' heading line indices.
export function topLevelHeadings(text) {
  const lines = text.split('\n');
  const out = [];
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/^(```|~~~)/.test(l.trim())) inFence = !inFence;
    else if (!inFence && /^## /.test(l)) out.push({ index: i, text: l.slice(3).trim() });
  }
  return out;
}

function splitDecision(text) {
  const lines = text.split('\n');
  const heads = topLevelHeadings(text);
  const pages = [];
  // Preamble (title block before the first '## ') → overview page.
  const preEnd = heads.length ? heads[0].index : lines.length;
  pages.push({
    slug: 'decision-overview',
    title: 'Decision — Overview',
    body: lines.slice(0, preEnd).join('\n').trim() + '\n',
  });
  for (let h = 0; h < heads.length; h++) {
    const { index, text: heading } = heads[h];
    const end = h + 1 < heads.length ? heads[h + 1].index : lines.length;
    const numbered = heading.match(/^(\d+)\.\s+(.*)$/);
    let title, slug;
    if (numbered) {
      title = `Decision §${numbered[1]} — ${numbered[2]}`;
      slug = `decision-${numbered[1].padStart(2, '0')}-${slugify(numbered[2])}`;
    } else {
      title = `Decision — ${heading}`;
      slug = `decision-${slugify(heading)}`;
    }
    pages.push({ slug, title, body: lines.slice(index, end).join('\n').trim() + '\n' });
  }
  return pages;
}

// ---------------------------------------------------------------------------
// Cross-reference resolution + path normalization
// ---------------------------------------------------------------------------

// Build lookup structures over the expanded page list.
function buildResolver(pagesBySourcePath) {
  // basename → title (only when the basename is unique across the manifest and
  // not an always-ambiguous name).
  const ambiguous = new Set(['readme.md', 'notes.md', 'stub.md']);
  const byBase = new Map();
  const baseCounts = new Map();
  for (const src of SOURCES) {
    const base = path.posix.basename(src.path).toLowerCase();
    baseCounts.set(base, (baseCounts.get(base) || 0) + 1);
  }
  for (const src of SOURCES) {
    const base = path.posix.basename(src.path).toLowerCase();
    if (ambiguous.has(base) || baseCounts.get(base) > 1) continue;
    byBase.set(base, pagesBySourcePath.get(src.path)[0].title);
  }
  // The decision doc resolves to its overview page.
  byBase.set('predicate-assurance-boundary-decision.md', 'Decision — Overview');

  // README.md resolution by parent directory name.
  const readmeByParent = new Map([
    ['dtgwg-cred-spec-main_mage', 'DTG Research Root'],
    ['explorations', 'Explorations Index'],
    ['runtimes', 'Lab — Runtimes'],
  ]);
  // NOTES.md / bare lab-dir resolution.
  const labByDir = new Map(LAB_DIRS.map((d) => [d.toLowerCase(), `Lab — ${d}`]));

  return function resolveRef(rawTarget) {
    if (!rawTarget) return null;
    let t = rawTarget.trim();
    if (/^[a-z]+:\/\//i.test(t)) return null; // URLs are left alone
    t = t.replace(/[),.;:]+$/, '').replace(/#.*$/, '').replace(/\\/g, '/');
    t = t.replace(/\/+$/, '');
    if (!t) return null;
    const segs = t.split('/').filter((s) => s && s !== '.' && s !== '..' && s !== '~');
    if (!segs.length) return null;
    const last = segs[segs.length - 1];
    const lastLower = last.toLowerCase();
    const parent = segs.length > 1 ? segs[segs.length - 2].toLowerCase() : null;

    if (lastLower === 'readme.md' && parent && readmeByParent.has(segs[segs.length - 2]))
      return readmeByParent.get(segs[segs.length - 2]);
    if ((lastLower === 'notes.md') && parent && labByDir.has(parent)) return labByDir.get(parent);
    if (byBase.has(lastLower) && lastLower.endsWith('.md')) return byBase.get(lastLower);
    // bare lab dir reference like `runtimes/circom-gadget/`
    if (labByDir.has(lastLower) && segs.some((s) => s.toLowerCase() === 'runtimes'))
      return labByDir.get(lastLower);
    return null;
  };
}

const isLocalPathTarget = (t) =>
  /^(\.\.?\/|~\/|~\\|[A-Za-z]:[\\/])/.test(t) || /^[\w.-]+\.md$/i.test(t) || t.includes('/');

// Normalize one page body. mode = 'fedwiki' | 'markdown'.
// - markdown links / code spans / bare paths that resolve to a manifested page
//   become links: [[Title]] (fedwiki) or [Title](slug.md) (markdown);
// - unresolvable machine paths become / remain plain code spans;
// - fenced code blocks are left untouched.
function normalizeBody(body, resolveRef, titleToSlug, mode) {
  const mkLink = (title) =>
    mode === 'fedwiki' ? `[[${title}]]` : `[${title}](${titleToSlug.get(title)}.md)`;

  const barePathRe = /([A-Za-z]:[\\/][^\s`'")\]]+|~[\\/][^\s`'")\]]+)/g;

  // Pass 1 (whole line, so labels containing code spans stay intact):
  // markdown links with local targets.
  const replaceMdLinks = (line) =>
    line.replace(/\[([^\]\n]*)\]\(([^)\s]+)\)/g, (whole, label, target) => {
      if (/^[a-z]+:\/\//i.test(target) || target.startsWith('#')) return whole;
      const title = resolveRef(target);
      if (title) return mkLink(title);
      if (isLocalPathTarget(target)) return '`' + target + '`';
      return whole;
    });

  // Pass 2 (text outside inline code): bare machine paths → code spans / links.
  const processText = (text) =>
    text.replace(barePathRe, (m) => {
      const title = resolveRef(m);
      return title ? mkLink(title) : '`' + m + '`';
    });

  const lines = body.split('\n');
  let inFence = false;
  const out = lines.map((rawLine) => {
    if (/^(```|~~~)/.test(rawLine.trim())) {
      inFence = !inFence;
      return rawLine;
    }
    if (inFence) return rawLine;
    const line = replaceMdLinks(rawLine);
    // split on inline code spans; transform each part appropriately
    const parts = line.split(/(`[^`]*`)/);
    return parts
      .map((part) => {
        if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
          const inner = part.slice(1, -1);
          const title = resolveRef(inner);
          return title ? mkLink(title) : part;
        }
        return processText(part);
      })
      .join('');
  });
  return out.join('\n');
}

// If the source starts with YAML front-matter, refit it as a fenced yaml block so
// the projected page carries it as visible content rather than conflicting metadata.
function refitFrontMatter(text) {
  if (!text.startsWith('---\n')) return text;
  const end = text.indexOf('\n---', 4);
  if (end === -1) return text;
  const fm = text.slice(4, end);
  const rest = text.slice(text.indexOf('\n', end + 1) + 1);
  return '```yaml\n' + fm.trim() + '\n```\n\n' + rest;
}

function synopsisOf(text) {
  const clean = (line) =>
    line
      .replace(/^#+\s*/, '')
      .replace(/^\|.*\|$/, '')
      .replace(/[*`>]/g, '')
      .replace(/\[\[([^\]]+)\]\]/g, '$1')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .trim();
  const cut = (s) => (s.length > 160 ? s.slice(0, 157) + '...' : s);
  let inFence = false;
  let headingFallback = '';
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (/^(```|~~~)/.test(line)) { inFence = !inFence; continue; }
    if (inFence || !line || line === '---') continue;
    if (/^#/.test(line)) {
      // prefer the first prose line; keep the first heading as a fallback
      if (!headingFallback) headingFallback = clean(line);
      continue;
    }
    const c = clean(line);
    if (c) return cut(c);
  }
  return cut(headingFallback);
}

function storyItems(slug, body) {
  const lines = body.split('\n');
  const heads = topLevelHeadings(body);
  const cuts = [0, ...heads.map((h) => h.index), lines.length]
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort((a, b) => a - b);
  const chunks = [];
  for (let i = 0; i < cuts.length - 1; i++) {
    const chunk = lines.slice(cuts[i], cuts[i + 1]).join('\n').trim();
    if (chunk) chunks.push(chunk);
  }
  if (!chunks.length) chunks.push(body.trim() || '(empty)');
  return chunks.map((text, index) => ({
    type: 'markdown',
    id: sha16(`${slug}:${index}`),
    text,
  }));
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

export function build({ log = console.log } = {}) {
  // 1. Read + expand manifest into page records (raw bodies).
  const pagesBySourcePath = new Map(); // manifest path → [pages]
  const pages = []; // ordered
  for (const src of SOURCES) {
    const abs = absOf(src.path);
    if (!fs.existsSync(abs)) throw new Error(`manifested source missing: ${src.path}`);
    const text = refitFrontMatter(read(abs));
    let srcPages;
    if (src.split === 'sections') {
      srcPages = splitDecision(text).map((p) => ({ ...p, section: src.section, source: src.path }));
    } else {
      srcPages = [{ slug: src.slug, title: src.title, body: text, section: src.section, source: src.path }];
    }
    pagesBySourcePath.set(src.path, srcPages);
    pages.push(...srcPages);
  }

  // uniqueness checks (title + slug are the link keys)
  const seenSlug = new Set();
  const seenTitle = new Set();
  for (const p of pages) {
    if (seenSlug.has(p.slug)) throw new Error(`duplicate slug: ${p.slug}`);
    if (seenTitle.has(p.title)) throw new Error(`duplicate title: ${p.title}`);
    seenSlug.add(p.slug);
    seenTitle.add(p.title);
  }
  const titleToSlug = new Map(pages.map((p) => [p.title, p.slug]));

  // 2. Normalize bodies for both carriers.
  const resolveRef = buildResolver(pagesBySourcePath);
  for (const p of pages) {
    p.fedwikiBody = normalizeBody(p.body, resolveRef, titleToSlug, 'fedwiki');
    p.markdownBody = normalizeBody(p.body, resolveRef, titleToSlug, 'markdown');
    p.synopsis = synopsisOf(p.markdownBody);
  }

  // 3. Manifest-first scan: report every source-shaped file NOT in the manifest.
  const manifested = new Set(SOURCES.map((s) => absOf(s.path)));
  const scanned = [
    ...walkMd(ROOT), // includes the vendored dtgwg-cred-spec-main/ tree; skips kb/, tools/
    ...walkMd(WORKBENCH_RUNTIMES, new Set(['node_modules', '.git'])),
    ...fs
      .readdirSync(CHRONICLES_DIR)
      .filter((n) => n.toLowerCase().endsWith('.md'))
      .sort((a, b) => a.localeCompare(b, 'en'))
      .map((n) => path.join(CHRONICLES_DIR, n)),
  ];
  const unmanifested = [];
  for (const abs of scanned) {
    if (!manifested.has(abs)) unmanifested.push(toPosix(path.relative(ROOT, abs)));
  }
  unmanifested.sort((a, b) => a.localeCompare(b, 'en'));

  log('');
  log('UNMANIFESTED (reported + EXCLUDED — manifest-first; add to SOURCES to project):');
  const groups = new Map();
  for (const u of unmanifested) {
    const key = u.startsWith('dtgwg-cred-spec-main/')
      ? 'vendored dtgwg-cred-spec-main/ (upstream spec, others’ work)'
      : u.startsWith('../agentprivacy_master/docs/chronicles/')
        ? 'chronicles (other projects’ chronicles)'
        : u.startsWith('../dtgwg-zkp-tf-mage/runtimes/')
          ? 'workbench runtimes (registers + stubs)'
          : 'research root';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(u);
  }
  for (const [key, list] of groups) {
    log(`  [${key}] — ${list.length} excluded:`);
    for (const u of list) log(`    - ${u}`);
  }
  if (!unmanifested.length) log('  (none)');

  // 4. Secret gate — scan every projected text; fail on any hit.
  let gateHits = 0;
  const gateReport = [];
  for (const p of pages) {
    const hits = scanText(p.title + '\n' + p.fedwikiBody + '\n' + p.markdownBody);
    if (hits.length) {
      gateHits += hits.length;
      gateReport.push({ slug: p.slug, hits });
    }
  }
  log('');
  log(`GATE: ${pages.length} pages scanned, ${gateHits} secret-shaped hits`);
  if (gateHits) {
    for (const g of gateReport)
      for (const h of g.hits) log(`  FAIL ${g.slug}: [${h.pattern}] ${h.match}`);
    throw new Error(`secret gate tripped: ${gateHits} hit(s) — nothing written`);
  }

  // 5. Write outputs (clean rebuild for byte-identical determinism).
  fs.rmSync(path.join(KB_DIR, 'fedwiki'), { recursive: true, force: true });
  fs.rmSync(path.join(KB_DIR, 'markdown'), { recursive: true, force: true });
  fs.mkdirSync(path.join(KB_DIR, 'fedwiki'), { recursive: true });
  fs.mkdirSync(path.join(KB_DIR, 'markdown'), { recursive: true });

  // fedwiki pages
  for (const p of pages) {
    const story = storyItems(p.slug, p.fedwikiBody);
    const page = {
      title: p.title,
      story,
      journal: [{ type: 'create', item: { title: p.title, story }, date: 0 }],
    };
    fs.writeFileSync(
      path.join(KB_DIR, 'fedwiki', `${p.slug}.json`),
      JSON.stringify(page, null, 2) + '\n',
      'utf8'
    );
  }
  const sitemap = pages.map((p) => ({ slug: p.slug, title: p.title, synopsis: p.synopsis, date: 0 }));
  fs.writeFileSync(
    path.join(KB_DIR, 'fedwiki', 'sitemap.json'),
    JSON.stringify(sitemap, null, 2) + '\n',
    'utf8'
  );

  // markdown bundle
  pages.forEach((p, i) => {
    const fm = [
      '---',
      `title: ${yamlQuote(p.title)}`,
      `section: ${yamlQuote(p.section)}`,
      `source: ${yamlQuote(p.source)}`,
      `built_from_commitish: ${yamlQuote('working-tree')}`,
      `order: ${i}`,
      '---',
      '',
    ].join('\n');
    fs.writeFileSync(
      path.join(KB_DIR, 'markdown', `${p.slug}.md`),
      fm + p.markdownBody.trim() + '\n',
      'utf8'
    );
  });

  const indexLines = ['# DTG Knowledge Base — Index', ''];
  for (const section of SECTION_ORDER) {
    indexLines.push(`## ${SECTION_LABEL[section]}`, '');
    for (const p of pages.filter((q) => q.section === section)) {
      indexLines.push(`- [${p.title}](./${p.slug}.md) — ${p.synopsis}`);
    }
    indexLines.push('');
  }
  fs.writeFileSync(path.join(KB_DIR, 'markdown', 'INDEX.md'), indexLines.join('\n'), 'utf8');

  // kb/README.md
  const counts = {};
  for (const s of SECTION_ORDER) counts[s] = pages.filter((p) => p.section === s).length;
  fs.writeFileSync(path.join(KB_DIR, 'README.md'), kbReadme(counts, pages.length), 'utf8');

  // build report (machine-readable, deterministic)
  const report = {
    generator: 'tools/build-kb.mjs',
    built_from_commitish: 'working-tree',
    sections: counts,
    totalPages: pages.length,
    pages: pages.map((p, i) => ({ slug: p.slug, title: p.title, section: p.section, source: p.source, order: i })),
    sourcesManifested: SOURCES.map((s) => s.path),
    unmanifestedExcluded: unmanifested,
    gate: { pagesScanned: pages.length, hits: gateHits },
  };
  fs.writeFileSync(
    path.join(KB_DIR, 'build-report.json'),
    JSON.stringify(report, null, 2) + '\n',
    'utf8'
  );

  log('');
  log('PAGES EMITTED:');
  for (const s of SECTION_ORDER) log(`  ${s.padEnd(13)} ${counts[s]}`);
  log(`  ${'total'.padEnd(13)} ${pages.length}`);
  log('');
  log(`kb/fedwiki:  ${pages.length} pages + sitemap.json`);
  log(`kb/markdown: ${pages.length} pages + INDEX.md`);
  log('build OK');
  return report;
}

function kbReadme(counts, total) {
  return `# DTG Knowledge Base — portable projection

Built by \`tools/build-kb.mjs\` (zero-dep Node ESM, deterministic). **${total} pages**:
root ${counts.root} · decision ${counts.decision} · explorations ${counts.explorations} · lab ${counts.lab} · chronicles ${counts.chronicles}.

Rebuild any time with:

\`\`\`
node tools/build-kb.mjs
node tools/test-kb.mjs
\`\`\`

## The manifest-first rule

Only files listed in the \`SOURCES\` manifest at the top of \`tools/build-kb.mjs\` are
projected. Any source-shaped file the scanner finds that is NOT in the manifest is
reported as **unmanifested** and **excluded** — the fail-safe default. New corpus files
never leak into the KB silently; to include one, add it to \`SOURCES\` and rebuild.
A built-in secret gate scans every projected page and **fails the whole build** on any
secret-shaped hit; the gate summary is printed every run and recorded in
\`build-report.json\`.

## Output 1 — \`kb/fedwiki/\` (Smallest Federated Wiki)

One \`<slug>.json\` per page in SFW page format (\`title\`, \`story\` of markdown items,
single \`create\` journal entry, all dates pinned to 0), plus \`sitemap.json\`.

- **Drop-in:** copy the \`.json\` files into a farm site's \`pages/\` directory
  (e.g. \`.wiki/<host>/pages/\`) — the wiki serves them as-is.
- **Import:** \`sitemap.json\` lists \`{slug, title, synopsis, date}\` for every page and
  can drive a scripted import or coverage check.
- Story-item ids are deterministic (sha256 of slug + index), so re-imports are stable.

Note: wiring these pages into a live federation is a separate, human-gated step —
nothing in this build touches any wiki farm.

## Output 2 — \`kb/markdown/\` (git / Confluence / anything)

One \`<slug>.md\` per page with YAML front-matter
(\`title\`, \`section\`, \`source\`, \`built_from_commitish\`, \`order\`) and the normalized
markdown body, plus \`INDEX.md\` grouped by section with one-line synopses.

- **Git:** commit \`kb/markdown/\` as-is; \`INDEX.md\` is the entry point.
- **Confluence:** import the bundle via Confluence's markdown importers
  (e.g. the built-in import or a markdown-import app); the front-matter carries the
  space structure — \`section\` → parent page, \`order\` → sort, \`title\` → page title.
- **Self-hosted:** both outputs are static files; serve or sync them anywhere.

## Normalization applied to both outputs

- Local machine paths (\`C:\\Users\\...\`, \`~/...\`) become plain code spans — they are
  machine paths, not links.
- Cross-references between corpus documents become links **only when the target is in
  the manifest**: \`[[Title]]\` in the fedwiki output, \`[Title](slug.md)\` in the
  markdown output; otherwise they stay as code spans.
- The decision document is split per top-level \`##\` section into
  \`Decision §N — <heading>\` pages (plus an overview page), because it is too large
  for one page.
- Sources are never edited; the corpus is read-only to this builder.
`;
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

const isMain =
  process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isMain) {
  try {
    build();
  } catch (err) {
    console.error(`BUILD FAILED: ${err.message}`);
    process.exit(1);
  }
}
