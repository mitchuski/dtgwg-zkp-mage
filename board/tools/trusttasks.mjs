// trusttasks.mjs — two read-only panels for the reader:
//   trustTasksHtml()     the Trust Task proposals the co-chair is making upstream, read LIVE from the
//                        workbench (specs + ceremonies) and framed by the hand-kept board/trust-tasks.json
//   linuxPlumbersHtml()  the Linux Plumbers status and scenarios, from board/linux-plumbers.json
// Zero dependencies. Nothing here posts or writes.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
const expand = (p) => { const s = String(p || ''); const home = homedir().split('\\').join('/'); return s === '~' ? home : s.startsWith('~/') ? home + s.slice(1) : s; };

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const loadJson = (p) => existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null;

// Minimal front-matter reader: top-level scalars, plus the one nested scalar each block is read for.
export function readFrontMatter(specPath) {
  const src = readFileSync(specPath, 'utf8');
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(src);
  if (!m) return null;
  const lines = m[1].split(/\r?\n/);
  const fm = {};
  let block = null;
  for (const line of lines) {
    const top = /^([A-Za-z][A-Za-z0-9]*):\s*(.*)$/.exec(line);
    if (top) { block = top[1]; if (top[2] !== '' && top[2] !== '>-' && top[2] !== '|') fm[top[1]] = top[2].replace(/^"(.*)"$/, '$1'); continue; }
    const sub = /^  ([A-Za-z]+):\s*(.+)$/.exec(line);
    if (sub && block) { fm[block + '.' + sub[1]] = fm[block + '.' + sub[1]] ?? sub[2].replace(/^"(.*)"$/, '$1'); continue; }
    const item = /^  - (\S.*)$/.exec(line);
    if (item && block === 'knownImplementations') (fm.knownImplementations = fm.knownImplementations || []).push(item[1]);
  }
  return fm;
}

function readFamily(workbench, slug) {
  const dir = join(workbench, 'specs', slug);
  if (!existsSync(dir)) return [];
  const out = [];
  for (const name of readdirSync(dir)) {
    if (name.startsWith('_')) continue;
    const vdir = join(dir, name);
    let versions = [];
    try { versions = readdirSync(vdir).filter(v => /^\d+\.\d+$/.test(v)); } catch { continue; }
    for (const v of versions) {
      const spec = join(vdir, v, 'spec.md');
      if (!existsSync(spec)) continue;
      const fm = readFrontMatter(spec) || {};
      out.push({ slug: `${slug}/${name}`, version: v, fm, hasPayload: existsSync(join(vdir, v, 'payload.schema.json')) });
    }
  }
  return out.sort((a, b) => a.slug.localeCompare(b.slug));
}

function readCeremony(workbench, slug) {
  const dir = join(workbench, 'ceremonies', slug);
  if (!existsSync(dir)) return null;
  const versions = readdirSync(dir).filter(v => /^\d+\.\d+$/.test(v)).sort();
  const v = versions[versions.length - 1];
  if (!v) return null;
  const j = loadJson(join(dir, v, 'ceremony.json'));
  if (!j) return null;
  const steps = Object.entries(j.steps || {});
  return {
    slug: j.slug, version: j.version, title: j.title, summary: j.summary, status: j.status,
    roles: Object.keys(j.roles || {}),
    evidentiary: Object.entries(j.roles || {}).filter(([, r]) => r.evidentiary).map(([n]) => n),
    steps: steps.map(([n, s]) => `${n}${s.optional ? '?' : ''}${s.terminal ? ' ⏹' : ''} → ${String(s.type || s.ceremony || '').replace('https://trusttasks.org/spec/', '')}`),
    completion: JSON.stringify(j.completion),
    evidence: `${j.evidence?.level}${j.evidence?.recorders ? ' · recorders ' + j.evidence.recorders.join(', ') : ''}`,
    maxDuration: j.maxDuration, exposure: `${j.exposure?.discloses} · subject ${j.exposure?.actsAsSubject}`, sideEffects: j.sideEffects?.level,
    ext: j.ext,
  };
}

function prBody(p, specs) {
  const n = specs.length;
  const cats = [...new Set(specs.map(s => s.fm.category))].join(', ');
  return `feat(${p.slug}): add the ${p.slug} task family (${n} specs)

## What is here

- ${n} specs, each with a payload.schema.json: ${specs.map(s => `\`${s.slug}/${s.version}\``).join(', ')}.
- Category used: **${cats}** — already in the enum. This PR does not depend on #672.
- Additions only under \`specs/${p.slug}/\`; no shared schema, binding or CHANGELOG changes.

## What it proposes

${p.proposes}

## Validation

\`npm run validate\` green against the unpatched meta-schema (645 specs incl. these); every spec declares errorCodes, issuedAtRequirement (§7.3 item 17), retention, bounded free text (item 19) and the four §12 Security & Privacy sub-headings. \`npm run build\` (bindings codegen) exits 0.

## Known-open, stated rather than hidden

- ${p.knownOpen || 'None recorded.'}

Design note: ${p.source}
`;
}

export function trustTasksHtml() {
  const cfg = loadJson(join(ROOT, 'trust-tasks.json'));
  if (!cfg) return '';
  const wb = expand(cfg.workbench);
  const rows = cfg.proposals.map(p => {
    let live = '';
    let pr = '';
    if (p.kind === 'task family') {
      const specs = readFamily(wb, p.slug);
      live = specs.length ? `<table class="ct"><tr><th>spec</th><th>title</th><th>cat</th><th>effects</th><th>discloses</th><th>issuedAt</th><th>retention</th><th>payload</th><th>impl</th></tr>${specs.map(s => `<tr><td><code>${esc(s.slug)}/${esc(s.version)}</code></td><td>${esc(s.fm.title)}</td><td>${esc(s.fm.category)}</td><td>${esc(s.fm['sideEffects.level'])}</td><td>${esc(s.fm['exposure.discloses'])}</td><td>${esc(s.fm['issuedAtRequirement.requirement'] || '—')}</td><td>${esc(s.fm['retention.class'] || '—')}</td><td>${s.hasPayload ? '✓' : '✗'}</td><td>${(s.fm.knownImplementations || []).map(u => `<a target="_blank" href="${esc(u)}">${esc(u.replace(/^https?:\/\/(github\.com\/)?/, ''))}</a>`).join('<br>') || '—'}</td></tr>`).join('')}</table>` : '<p class="muted">no specs found in the workbench</p>';
      pr = specs.length ? `<details><summary>PR title + body (draft, on the #674 shape)</summary><pre>${esc(prBody(p, specs))}</pre></details>` : '';
    } else if (p.kind === 'ceremony') {
      const c = readCeremony(wb, p.slug);
      live = c ? `<ul class="tt-cer"><li><b>${esc(c.title)}</b> <code>${esc(c.slug)}/${esc(c.version)}</code> · ${esc(c.status)}</li><li>roles: ${c.roles.map(esc).join(', ')}${c.evidentiary.length ? ` (evidentiary: ${c.evidentiary.map(esc).join(', ')})` : ''}</li><li>steps: ${c.steps.map(esc).join(' · ')}</li><li>completion <code>${esc(c.completion)}</code> · evidence ${esc(c.evidence)} · window ${esc(c.maxDuration)} · exposure ${esc(c.exposure)} · effects ${esc(c.sideEffects)}</li>${c.ext ? `<li>ext: <code>${esc(JSON.stringify(c.ext)).slice(0, 220)}…</code></li>` : ''}</ul>` : '<p class="muted">no ceremony found in the workbench</p>';
    }
    return `<div class="thread"><div class="thead"><span class="chip kind">${esc(p.id)}</span><b>${esc(p.kind)}</b> · <code>${esc(p.slug)}</code><span class="chip">${esc(p.state)}</span>${p.prOrder ? `<span class="chip">PR ${p.prOrder}</span>` : ''}</div>
<p>${esc(p.proposes)}</p>
<div class="tmeta">builds on: ${(p.buildsOn || []).map(b => `<code>${esc(b)}</code>`).join(' ')} · source: ${esc(p.source)}</div>
${p.knownOpen ? `<div class="tmeta">known open: ${esc(p.knownOpen)}</div>` : ''}
${live}${pr}</div>`;
  }).join('\n');
  return `<div class="panel" id="trust-tasks"><h3>${esc(cfg.title)}</h3><p class="muted">Checked ${esc(cfg.checkedAt)} · live from <code>${esc(cfg.workbench)}</code> (specs and ceremonies read from disk at build time)</p><p>${esc(cfg.lead)}</p>
<h4>The bar (as the maintainer wrote it on #672)</h4><ul>${cfg.bar.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
<h4>Order</h4><ol>${cfg.order.map(o => `<li>${esc(o)}</li>`).join('')}</ol>
<h4>Proposals</h4>${rows}</div>`;
}

export function linuxPlumbersHtml() {
  const cfg = loadJson(join(ROOT, 'linux-plumbers.json'));
  if (!cfg) return '';
  return `<div class="panel" id="linux-plumbers"><h3>${esc(cfg.title)}</h3><p class="muted">Checked ${esc(cfg.checkedAt)}</p>
${cfg.context.map(c => `<p>${esc(c)}</p>`).join('')}
<h4>What we have</h4><table class="ct"><tr><th>item</th><th>state</th><th>detail</th></tr>${cfg.have.map(h => `<tr><td><b>${esc(h.item)}</b></td><td>${esc(h.state)}</td><td>${esc(h.detail)}</td></tr>`).join('')}</table>
<h4>How it can play out</h4>${cfg.scenarios.map(s => `<div class="thread"><div class="thead"><b>${esc(s.name)}</b></div><div class="tmeta"><b>when:</b> ${esc(s.when)}</div><p><b>our part:</b> ${esc(s.ourPart)}</p><div class="tmeta"><b>risk:</b> ${esc(s.risk)}</div></div>`).join('')}
<h4>Negative space to carry into any Linux Plumbers policy text</h4><ul>${cfg.carry.map(c => `<li>${esc(c)}</li>`).join('')}</ul>
<h4>Decisions the demo needs</h4><ol>${cfg.decisions.map(d => `<li>${esc(d)}</li>`).join('')}</ol>
<h4>Next moves</h4><ol>${cfg.next.map(n => `<li>${esc(n)}</li>`).join('')}</ol></div>`;
}

// The SIROS reading and review pack, rendered from board/review-notes/SIROS-REVIEW-PACK-<date>.md (latest by name).
export function sirosHtml() {
  const dir = join(ROOT, 'review-notes');
  if (!existsSync(dir)) return '';
  const packs = readdirSync(dir).filter(f => /^SIROS-REVIEW-PACK-\d{4}-\d{2}-\d{2}\.md$/.test(f)).sort();
  const file = packs[packs.length - 1];
  if (!file) return '';
  const md = readFileSync(join(dir, file), 'utf8').replace(/<!--[\s\S]*?-->\s*/g, '');
  const inline = (t) => esc(t).replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a target="_blank" href="$2">$1</a>').replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  const out = [];
  let list = null;
  const flush = () => { if (list) { out.push(`<${list.tag}>${list.items.map(i => `<li>${inline(i)}</li>`).join('')}</${list.tag}>`); list = null; } };
  for (const raw of md.split(/\r?\n/)) {
    const line = raw.trimEnd();
    let m;
    if ((m = /^(#{2,4})\s+(.*)$/.exec(line))) { flush(); out.push(`<h${Math.min(m[1].length + 1, 5)}>${inline(m[2])}</h${Math.min(m[1].length + 1, 5)}>`); }
    else if ((m = /^\d+\.\s+(.*)$/.exec(line))) { if (!list || list.tag !== 'ol') { flush(); list = { tag: 'ol', items: [] }; } list.items.push(m[1]); }
    else if ((m = /^[-*]\s+(.*)$/.exec(line))) { if (!list || list.tag !== 'ul') { flush(); list = { tag: 'ul', items: [] }; } list.items.push(m[1]); }
    else if (line === '') { flush(); }
    else { flush(); out.push(`<p>${inline(line)}</p>`); }
  }
  flush();
  return `<div class="panel" id="siros"><p class="muted">From <code>board/review-notes/${esc(file)}</code> · proposed review questions, not assignments or claims about SIROS capabilities · the same questions are slide 3 of the meeting page on :8427</p>${out.join('\n')}</div>`;
}
