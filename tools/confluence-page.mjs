#!/usr/bin/env node
// confluence-page.mjs — pull a ToIP Confluence page (anonymous v2 API) and render its storage XML to markdown.
// Read-only: it fetches and writes local files. It never writes to Confluence. Zero-dep.
//
//   node tools/confluence-page.mjs pull <pageId> <outDir>     # → page-<id>.json, page-<id>.storage.xml, page-<id>.md
//   node tools/confluence-page.mjs render <storage.xml>       # → markdown on stdout
//
// The renderer covers what these meeting-notes pages use: h1–h4, p, ul/ol/li, strong/em/code, a, tables with
// colgroup, ac:task-list (Decisions / Action Items), ac:link → ri:page, hr, and HTML entities. Anything it does
// not know is dropped to text rather than guessed at, so a surprise in the source shows up as plain prose.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const BASE = 'https://lf-toip.atlassian.net/wiki';
const [, , cmd, a1, a2] = process.argv;

const ENT = { quot: '"', amp: '&', lt: '<', gt: '>', nbsp: ' ', mdash: '—', ndash: '–', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', hellip: '…', middot: '·', deg: '°', eacute: 'é' };
const unent = (s) => s
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&([a-z]+);/gi, (m, n) => (n in ENT ? ENT[n] : m));

// ---- tiny tag walker -------------------------------------------------------------------------
function tokenize(xml) {
  const out = [];
  const re = /<(\/?)([a-zA-Z0-9:_-]+)((?:\s+[^<>]*?)?)(\/?)>/g;
  let last = 0, m;
  while ((m = re.exec(xml))) {
    if (m.index > last) out.push({ t: 'text', v: xml.slice(last, m.index) });
    out.push({ t: m[1] ? 'close' : (m[4] ? 'self' : 'open'), name: m[2].toLowerCase(), attrs: m[3] || '' });
    last = re.lastIndex;
  }
  if (last < xml.length) out.push({ t: 'text', v: xml.slice(last) });
  return out;
}
const attr = (attrs, name) => {
  const m = attrs.match(new RegExp(`${name.replace(':', '\\:')}="([^"]*)"`, 'i'));
  return m ? unent(m[1]) : null;
};

function render(xml) {
  const toks = tokenize(xml);
  const md = [];               // block lines
  let buf = '';                // current inline buffer
  const listStack = [];        // 'ul' | 'ol'
  let inTable = false, row = null, table = null, cell = null, headerDone = false;
  let taskListDepth = 0, taskStatus = null, inTaskBody = false;
  let hLevel = 0;
  let linkHref = null, inLinkBody = false, pendingPageLink = null, linkCut = 0;

  const flush = () => {
    const s = buf.replace(/[ \t]+/g, ' ').trim();
    buf = '';
    return s;
  };
  const emit = (line) => { md.push(line); };

  for (const tk of toks) {
    if (tk.t === 'text') { buf += unent(tk.v).replace(/\n+/g, ' '); continue; }
    const n = tk.name;

    // --- inline ---------------------------------------------------------
    if (n === 'strong' || n === 'b') { buf += '**'; continue; }
    if (n === 'em' || n === 'i') { buf += '*'; continue; }
    if (n === 'code') { buf += '`'; continue; }
    if (n === 'br') { buf += '  \n'; continue; }
    if (n === 'a') {
      if (tk.t === 'open') { linkHref = attr(tk.attrs, 'href'); buf += '['; }
      else if (tk.t === 'close') { buf += `](${linkHref || ''})`; linkHref = null; }
      continue;
    }
    if (n === 'ac:link') {
      if (tk.t === 'open') { pendingPageLink = null; linkCut = buf.length; }
      else if (tk.t === 'close') { if (pendingPageLink) { buf = buf.slice(0, linkCut) + `[${pendingPageLink}](${BASE}/search?text=${encodeURIComponent(pendingPageLink)})`; } pendingPageLink = null; linkCut = 0; }
      continue;
    }
    if (n === 'ri:page') { pendingPageLink = attr(tk.attrs, 'ri:content-title'); continue; }
    if (n === 'ac:link-body') { if (tk.t === 'open') inLinkBody = true; else inLinkBody = false; continue; }

    // --- headings -------------------------------------------------------
    if (/^h[1-6]$/.test(n)) {
      if (tk.t === 'open') { flush(); hLevel = Number(n[1]); }
      else { const s = flush(); if (s) { emit(''); emit('#'.repeat(hLevel + 1) + ' ' + s); emit(''); } hLevel = 0; }
      continue;
    }

    // --- tables ---------------------------------------------------------
    if (n === 'table') { if (tk.t === 'open') { inTable = true; table = []; headerDone = false; } else { if (table && table.length) { emit(''); for (const r of table) emit(r); emit(''); } inTable = false; table = null; } continue; }
    if (n === 'tr') { if (tk.t === 'open') row = []; else { if (row) { table.push('| ' + row.join(' | ') + ' |'); if (!headerDone) { table.push('|' + row.map(() => '---').join('|') + '|'); headerDone = true; } } row = null; } continue; }
    if (n === 'td' || n === 'th') {
      if (tk.t === 'open') { cell = []; }
      else { const s = flush(); if (s) cell.push(s); if (row) row.push(cell.join('<br>').replace(/\|/g, '\\|')); cell = null; }
      continue;
    }

    // --- task lists (Decisions / Action Items) ---------------------------
    if (n === 'ac:task-list') { if (tk.t === 'open') { taskListDepth++; emit(''); } else { taskListDepth--; emit(''); } continue; }
    if (n === 'ac:task') { if (tk.t === 'open') taskStatus = null; continue; }
    if (n === 'ac:task-status') { if (tk.t === 'open') { flush(); } else { taskStatus = flush(); } continue; }
    if (n === 'ac:task-body') {
      if (tk.t === 'open') { inTaskBody = true; flush(); }
      else { const s = flush(); inTaskBody = false; if (s) emit(`- [${taskStatus === 'complete' ? 'x' : ' '}] ${s}`); }
      continue;
    }
    if (n === 'ac:task-id' || n === 'ac:task-uuid' || n === 'ac:task-list-id') { if (tk.t === 'close') flush(); continue; }

    // --- blocks ----------------------------------------------------------
    if (n === 'p') {
      if (tk.t === 'close') {
        const s = flush();
        if (!s) continue;
        if (inTable) { if (cell) cell.push(s); continue; }
        if (inTaskBody) { buf = s; continue; }
        if (listStack.length) {
          const cur = md[md.length - 1] || '';
          const bare = /^\s*(?:-|\d+\.)\s*$/.test(cur);          // the bullet marker alone: first paragraph of the item
          md[md.length - 1] = cur + (bare ? '' : '<br>') + s;
          continue;
        }
        emit(''); emit(s);
      }
      continue;
    }
    if (n === 'ul' || n === 'ol') { if (tk.t === 'open') { flush(); listStack.push(n); emit(''); } else { listStack.pop(); emit(''); } continue; }
    if (n === 'li') {
      if (tk.t === 'open') { flush(); emit('  '.repeat(Math.max(0, listStack.length - 1)) + (listStack[listStack.length - 1] === 'ol' ? '1. ' : '- ')); }
      else { const s = flush(); if (s) md[md.length - 1] += s; if (!md[md.length - 1].trim().replace(/^[-1.]+\s*$/, '')) md.pop(); }
      continue;
    }
    if (n === 'hr') { flush(); emit(''); emit('---'); emit(''); continue; }
    // colgroup/col/tbody/time/span/div and unknown macros: ignore structurally
  }
  const s = flush(); if (s) { emit(''); emit(s); }
  return md.join('\n').replace(/\n{3,}/g, '\n\n').replace(/[ \t]+$/gm, '').trim() + '\n';
}

// ---- commands ---------------------------------------------------------------------------------
if (cmd === 'render') {
  process.stdout.write(render(readFileSync(a1, 'utf8')));
} else if (cmd === 'pull') {
  const id = a1, outDir = a2 || '.';
  const res = await fetch(`${BASE}/api/v2/pages/${id}?body-format=storage`);
  if (!res.ok) { console.log(`REFUSED confluence-fetch:${res.status}`); process.exit(1); }
  const j = await res.json();
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, `page-${id}.json`), JSON.stringify(j, null, 1) + '\n');
  writeFileSync(join(outDir, `page-${id}.storage.xml`), j.body.storage.value);
  const head = `<!-- pulled ${new Date().toISOString()} from ${BASE}/spaces/HOME/pages/${id} — version ${j.version.number} of ${j.version.createdAt}; regenerate with tools/confluence-page.mjs, do not hand-edit -->\n\n# ${j.title}\n\n*Faithful local rendering of the live page. Source of truth is Confluence; this copy is for review and drafting.*\n`;
  writeFileSync(join(outDir, `page-${id}.md`), head + '\n' + render(j.body.storage.value));
  console.log(`pulled "${j.title}" v${j.version.number} (${j.version.createdAt}) → ${outDir}/page-${id}.{json,storage.xml,md}`);
} else if (cmd === 'push') {
  // push <pageId> <storage.xml> — replace the page body. Requires the maintainer's own Atlassian credentials in the
  // environment (CONFLUENCE_EMAIL + CONFLUENCE_API_TOKEN); refuses without them and never reads a token from a file.
  // Optionally version-checked: set CONFLUENCE_EXPECT_VERSION to the version you reviewed and it refuses if the live
  // page moved since, so a concurrent edit by someone else is never silently overwritten.
  const id = a1, file = a2;
  const email = process.env.CONFLUENCE_EMAIL, token = process.env.CONFLUENCE_API_TOKEN;
  if (!email || !token) { console.log('REFUSED confluence-no-credentials (set CONFLUENCE_EMAIL and CONFLUENCE_API_TOKEN in this shell only)'); process.exit(1); }
  if (!id || !file) { console.log('REFUSED push-missing-arg (need <pageId> <storage.xml>)'); process.exit(1); }
  const auth = 'Basic ' + Buffer.from(`${email}:${token}`).toString('base64');
  const live = await (await fetch(`${BASE}/api/v2/pages/${id}?body-format=storage`, { headers: { Authorization: auth } })).json();
  const expected = process.env.CONFLUENCE_EXPECT_VERSION;
  if (expected && String(live.version.number) !== expected) {
    console.log(`REFUSED confluence-version-moved (live v${live.version.number}, expected v${expected} — re-pull, re-build, re-read)`); process.exit(1);
  }
  const body = readFileSync(file, 'utf8');
  const res = await fetch(`${BASE}/api/v2/pages/${id}`, {
    method: 'PUT',
    headers: { Authorization: auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, status: 'current', title: live.title, body: { representation: 'storage', value: body }, version: { number: live.version.number + 1, message: process.env.CONFLUENCE_MESSAGE || 'agenda update' } }),
  });
  if (!res.ok) { console.log(`REFUSED confluence-put:${res.status} ${(await res.text()).slice(0, 300)}`); process.exit(1); }
  const j = await res.json();
  console.log(`pushed "${j.title}" → version ${j.version.number}`);
} else {
  console.log('usage: confluence-page.mjs pull <pageId> <outDir> | render <storage.xml> | push <pageId> <storage.xml>');
  process.exit(1);
}
