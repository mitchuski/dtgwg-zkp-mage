#!/usr/bin/env node
// board.mjs — the board lane's one tool. Zero dependencies.
//   validate | render <id> | issue <id> | index | advance <id> <state> --by X --evidence Y | site
// Refusals are returned as register strings, never thrown as prose.
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { loadLatestSurvey, loadWatchMap, digestSurvey, watchHtml, survey as runSurvey } from './watch.mjs';
import { writeCookbook } from './spec.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
export const ROOT = resolve(HERE, '..');
const CARDS = join(ROOT, 'cards');
const REPO = resolve(ROOT, '..');

export const STATES = ['requested', 'carded', 'constructed', 'run', 'vetted', 'published'];
export const GADGETS = ['set-membership', 'nullifier', 'transcript-bind', 'key-binding', 'distinctness', 'signature-verify', 'non-revocation', 'range', 'commitment-open', 'chain-resolve', 'hidden-equality'];
export const ADVERSARIES = ['verifier', 'verifiers-colluding', 'issuer-verifier-colluding', 'registry-operator'];
export const FAMILIES = ['accepts', 'rejects-unsat', 'rejects-verify', 'unlinkable', 'current'];

// transition → trust-task envelope (the public trust-task format, mimicked)
export const TASKS = {
  requested:   { task: 'board/request',   issuer: 'requester',   recipient: 'task-force', sideEffects: 'none',     exposure: 'metadata' },
  carded:      { task: 'board/card',      issuer: 'constructor', recipient: 'task-force', sideEffects: 'none',     exposure: 'metadata' },
  constructed: { task: 'board/construct', issuer: 'constructor', recipient: 'task-force', sideEffects: 'mutating', exposure: 'metadata' },
  run:         { task: 'board/run',       issuer: 'runner',      recipient: 'task-force', sideEffects: 'none',     exposure: 'metadata' },
  vetted:      { task: 'board/vet',       issuer: 'verifier',    recipient: 'maintainer', sideEffects: 'mutating', exposure: 'metadata' },
  published:   { task: 'board/publish',   issuer: 'maintainer',  recipient: 'public',     sideEffects: 'mutating', exposure: 'public' },
};

export function loadCards() {
  return readdirSync(CARDS).filter(f => f.endsWith('.json')).sort()
    .map(f => JSON.parse(readFileSync(join(CARDS, f), 'utf8')));
}
export function loadCard(id) {
  const p = join(CARDS, `${id}.json`);
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, 'utf8'));
}
function saveCard(card) {
  writeFileSync(join(CARDS, `${card.id}.json`), JSON.stringify(card, null, 2) + '\n');
}

// ---- validation: every refusal is a register string ------------------------------------
export function validateCard(card, all = null) {
  const r = [];
  const cards = all || loadCards();
  const ids = new Set(cards.map(c => c.id));
  const nonEmpty = (k) => Array.isArray(card[k]) && card[k].length > 0;
  for (const k of ['id', 'name', 'kind', 'state', 'dish']) if (!card[k]) r.push(`card-missing-field:${k}`);
  if (card.id && !/^[0-9]{3}$/.test(card.id)) r.push('card-bad-id');
  if (card.kind && !['primitive', 'composed'].includes(card.kind)) r.push('card-bad-kind');
  if (card.state && !STATES.includes(card.state)) r.push('card-bad-state');
  if (card.dish && card.dish.length < 20) r.push('card-dish-too-short');
  if (!nonEmpty('ingredients')) r.push('card-no-ingredients');
  if (!nonEmpty('pantry')) r.push('card-no-pantry');
  if (!nonEmpty('method')) r.push('card-no-method');
  else card.method.forEach((m, i) => {
    if (!m.clause) r.push(`card-clause-empty:${i + 1}`);
    if (!m.gadget || !GADGETS.includes(m.gadget)) r.push(`card-clause-unbound:${i + 1}`);
    if (m.component && !ids.has(m.component)) r.push(`card-component-missing:${m.component}`);
  });
  if (!nonEmpty('yield')) r.push('card-no-yield');
  if (!nonEmpty('doesNotEstablish')) r.push('card-no-does-not-establish');
  if (!nonEmpty('adversary')) r.push('card-no-adversary');
  else card.adversary.forEach((a, i) => {
    if (!a.claim || !Array.isArray(a.against) || !a.against.length) r.push(`card-adversary-unnamed:${i + 1}`);
    else a.against.forEach(x => { if (!ADVERSARIES.includes(x)) r.push(`card-adversary-unknown:${x}`); });
  });
  if (!nonEmpty('horizon')) r.push('card-no-horizon');
  if (!card.tasting || !Array.isArray(card.tasting.families) || !card.tasting.families.length) r.push('card-no-tasting');
  else card.tasting.families.forEach(f => { if (!FAMILIES.includes(f)) r.push(`card-tasting-unknown:${f}`); });
  if (!nonEmpty('substitutions')) r.push('card-no-substitutions');
  if (!Array.isArray(card.history)) r.push('card-no-history');
  // composition rules
  if (card.kind === 'composed') {
    if (!nonEmpty('components')) r.push('card-composed-no-components');
    else {
      for (const c of card.components) {
        if (!ids.has(c)) r.push(`card-component-missing:${c}`);
        const comp = cards.find(x => x.id === c);
        if (comp && comp.kind !== 'primitive') r.push(`card-component-not-primitive:${c}`);
      }
      // yield must be declared fresh, not the union of parts
      const union = new Set(card.components.flatMap(c => (cards.find(x => x.id === c)?.yield) || []));
      const mine = new Set(card.yield || []);
      if (mine.size && [...mine].every(y => union.has(y)) && [...union].every(y => mine.has(y))) r.push('card-composed-yield-is-union');
      const unionDNE = new Set(card.components.flatMap(c => (cards.find(x => x.id === c)?.doesNotEstablish) || []));
      if ((card.doesNotEstablish || []).every(d => unionDNE.has(d))) r.push('card-composed-dne-is-union');
      if (!(card.pantry || []).some(p => /transcript/i.test(p))) r.push('card-composed-no-single-transcript');
    }
  } else if (card.kind === 'primitive') {
    const gadgets = new Set((card.method || []).map(m => m.gadget));
    if (gadgets.size > 1) r.push('card-primitive-multi-gadget');
    if (card.components && card.components.length) r.push('card-primitive-has-components');
  }
  // state ↔ evidence coherence
  const si = STATES.indexOf(card.state);
  if (si >= STATES.indexOf('constructed')) {
    if (!card.method.some(m => m.runtime)) r.push('construct-no-runtime');
    if (!card.substitutions.some(s => s.measured)) r.push('construct-no-measurement');
  }
  if (si >= STATES.indexOf('run') && !(card.tasting.vectors)) r.push('run-vectors-missing');
  if (si >= STATES.indexOf('vetted') && !(card.provenance && card.provenance.registry)) r.push('vet-no-registry-row');
  // history must be monotone and end at the current state
  if (Array.isArray(card.history)) {
    let last = -1;
    for (const h of card.history) {
      const i = STATES.indexOf(h.to);
      if (i < 0) r.push(`history-bad-state:${h.to}`);
      if (i <= last) r.push(`history-not-monotone:${h.to}`);
      if (!h.evidence) r.push(`history-no-evidence:${h.to}`);
      last = i;
    }
    if (card.history.length && card.history[card.history.length - 1].to !== card.state) r.push('history-does-not-end-at-state');
  }
  return r;
}

// ---- advance: the trust-task step -------------------------------------------------------
export function advance(card, to, { by, evidence, date } = {}) {
  const from = STATES.indexOf(card.state), ti = STATES.indexOf(to);
  if (ti < 0) return { ok: false, refusal: `advance-bad-state:${to}` };
  if (ti !== from + 1) return { ok: false, refusal: ti <= from ? 'advance-not-monotone' : 'advance-skips-state' };
  if (!by) return { ok: false, refusal: 'advance-no-actor' };
  if (!evidence) return { ok: false, refusal: 'advance-no-evidence' };
  const constructors = new Set(card.history.filter(h => h.to === 'carded' || h.to === 'constructed').map(h => h.by));
  if (to === 'run' && constructors.has(by)) return { ok: false, refusal: 'run-same-hands' };
  if (to === 'vetted') {
    const runners = new Set(card.history.filter(h => h.to === 'run').map(h => h.by));
    for (const rnr of runners) if (constructors.has(rnr)) return { ok: false, refusal: 'vet-self-vouch' };
    if (!/registry|[0-9]{4}-/.test(evidence)) return { ok: false, refusal: 'vet-no-registry-row' };
  }
  if (to === 'published' && !/rite|proverb|activated/i.test(evidence)) return { ok: false, refusal: 'publish-without-rite' };
  const probe = structuredClone(card);
  probe.state = to;
  probe.history.push({ to, by, date: date || new Date().toISOString().slice(0, 10), evidence, task: TASKS[to].task });
  const v = validateCard(probe).filter(x => !x.startsWith('history-'));
  if (v.length) return { ok: false, refusal: v[0], all: v };
  return { ok: true, card: probe, task: TASKS[to] };
}

// ---- rendering ---------------------------------------------------------------------------
const li = (xs) => (xs || []).map(x => `- ${x}`).join('\n');
export function renderCard(card) {
  const m = card.method.map((x, i) => `${i + 1}. ${x.clause} → \`${x.gadget}\`${x.component ? ` (card ${x.component})` : ''}${x.runtime ? ` · runtime \`${x.runtime}\`` : ''}`).join('\n');
  const adv = card.adversary.map(a => `- ${a.claim} — against: ${a.against.join(', ')}`).join('\n');
  const subs = card.substitutions.map(s => `| ${s.route} | ${s.cost || '—'} | ${s.measured ? 'measured' : 'unmeasured'} | ${s.source || ''} |`).join('\n');
  const hist = card.history.map(h => `| ${h.date} | ${h.to} | ${h.task || TASKS[h.to].task} | ${h.by} | ${h.evidence} |`).join('\n');
  const prov = card.provenance || {};
  return `# CARD ${card.id} · ${card.name}

**kind:** ${card.kind} · **state:** \`${card.state}\`${card.priority ? ` · **priority:** ${card.priority}` : ''}${card.owner ? ` · **owner:** ${card.owner}` : ''}${card.components ? ` · **composes:** ${card.components.join(' ∧ ')}` : ''}

## Dish
${card.dish}

## Ingredients (witness — never leaves the holder)
${li(card.ingredients)}

## Pantry (public inputs)
${li(card.pantry)}

## Method
${m}

## Yield (the disclosure set)
${li(card.yield)}

## Does not establish
${li(card.doesNotEstablish)}

## Adversary
${adv}

## Horizon
${li(card.horizon)}

## Tasting
families: ${card.tasting.families.join(' · ')}${card.tasting.vectors ? `\nvectors: \`${card.tasting.vectors}\`` : ''}${card.tasting.rejectionCodes?.length ? `\nrejection codes: ${card.tasting.rejectionCodes.map(c => `\`${c}\``).join(', ')}` : ''}

## Substitutions (through the §25 gate)
| route | cost | status | source |
|---|---|---|---|
${subs}

## Issuance (what this card requires of issuers)
${li(card.issuance) || '- none beyond the credential as specified'}

## Provenance
${prov.spec?.length ? `- spec: ${prov.spec.join(' · ')}\n` : ''}${prov.catalog ? `- catalog: ${prov.catalog}\n` : ''}${prov.registry ? `- registry: ${prov.registry}\n` : ''}${prov.commit ? `- commit: ${prov.commit}\n` : ''}
## History (trust-task record)
| date | to | task | by | evidence |
|---|---|---|---|---|
${hist}
${card.revisions?.length ? `
## Revisions (within a state — the card changed, the state did not)
| date | by | note |
|---|---|---|
${card.revisions.map(r => `| ${r.date} | ${r.by} | ${r.note} |`).join('\n')}
` : ''}`;
}
export function renderIssue(card) {
  const need = card.request?.need ? `\n**Need:** ${card.request.need}` : '';
  return `### ${card.id} · ${card.name}

**Statement.** ${card.dish}
${need}
**Proves over:** ${card.ingredients.filter(x => /credential|VMC|VRC|VDC|PHC|attestation/i.test(x)).join('; ') || card.ingredients[0]}

**Does not establish:** ${card.doesNotEstablish.slice(0, 3).join('; ')}${card.doesNotEstablish.length > 3 ? '; …' : ''}

**State:** \`${card.state}\`${card.components ? ` · composes cards ${card.components.join(', ')}` : ''}
**Card (full detail, rebuildable):** \`board/cards/${card.id}.json\` · rendered: \`board/render/${card.id}.md\`
**Construction options:** ${card.substitutions.map(s => `${s.route.length > 90 ? s.route.slice(0, 87).trimEnd() + '…' : s.route}${s.measured ? ` (${s.cost})` : ' (unmeasured)'}`).join(' · ')}
`;
}
export function renderIndex(cards) {
  const rows = cards.map(c => `| ${c.id} | ${c.name} | ${c.kind} | ${c.priority || '—'} | \`${c.state}\` | ${c.owner || '—'} | ${c.components ? c.components.join('+') : '—'} | ${c.method.some(m => m.runtime) ? 'yes' : 'no'} |`).join('\n');
  return `# BOARD — requested ZK proofs (generated by \`board.mjs index\`, do not edit)

| id | name | kind | priority | state | owner | composes | runtime |
|---|---|---|---|---|---|---|---|
${rows}

States: ${STATES.join(' → ')}. A row may not claim more than its card; a card no more than its runtime; a runtime no more than an independent run.
`;
}

// ---- site --------------------------------------------------------------------------------
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }

// ---- the run: the ordered posting sequence, from board/run.json -------------------------------
function runHtml() {
  const rp = join(ROOT, 'run.json');
  if (!existsSync(rp)) return '';
  const r = JSON.parse(readFileSync(rp, 'utf8'));
  const stateChip = (st) => {
    const label = { ready: 'ready for review', 'ready-for-review': 'ready for review', blocked: 'blocked — author', 'ready-after-A': 'review after phase A', optional: 'optional', held: 'held', done: 'done' }[st] || st;
    return `<span class="chip st-${esc(st)}">${esc(label)}</span>`;
  };
  const step = (s) => `<li class="step st-${esc(s.state)}"><span class="stepn">${s.n}</span><div class="stepbody">
    <div class="act">${esc(s.act)}${s.draft ? ` <a class="chip draftref" href="#draft-${esc(s.draft)}">draft ${esc(s.draft)}</a>` : ''}${stateChip(s.state)}${s.supersedes ? `<span class="chip retired">supersedes ${esc(s.supersedes)}</span>` : ''}</div>
    <div class="where"><code>${esc(s.where)}</code></div>
    <div class="gate">gate: ${esc(s.gate)}</div>
    <div class="stepwhy">${esc(s.why)}</div></div></li>`;
  const phase = (p) => `<div class="phase"><h3>${esc(p.id)} · ${esc(p.title)}</h3><p class="phasewhy">${esc(p.why)}</p><ol class="steps">${p.steps.map(step).join('')}</ol></div>`;
  return `<div class="ritedef">🧭 <b>${esc(r.title)}</b> — ${esc(r.dates)}.<br>${esc(r.lead)}</div>
<div class="panel run">${r.phases.map(phase).join('')}
<div class="phase after"><h3>Afterwards</h3><ul class="evl">${(r.afterwards || []).map(a => `<li>${esc(a)}</li>`).join('')}</ul></div></div>`;
}

export function draftRevision(draft) {
  return createHash('sha256').update(JSON.stringify(draft)).digest('hex');
}
export function exactTarget(value) {
  try { const u = new URL(value); return u.protocol === 'https:' && u.hostname === 'github.com' && !u.username && !u.password && !u.port && !/\s/.test(value) ? u.href : ''; } catch { return ''; }
}
export function buildSite(cards) {
  const draftsDir = join(ROOT, 'drafts');
  const drafts = existsSync(draftsDir) ? readdirSync(draftsDir).filter(f => f.endsWith('.md')).sort().map(f => {
    const txt = readFileSync(join(draftsDir, f), 'utf8').replace(/\r\n/g, '\n');
    const head = txt.split('\n')[0].replace(/^#\s*/, '');
    const meta = {};
    for (const l of txt.split('\n---\n')[0].split('\n').slice(1)) { const m = l.match(/^(\w+):\s*(.+)$/); if (m) meta[m[1]] = m[2]; }
    const body = txt.split('\n---\n').slice(1).join('\n---\n').trim();
    return { key: f.split('-')[0], file: f, head, meta, body };
  }) : [];
  const readme = readFileSync(join(ROOT, 'README.md'), 'utf8');
  const ledgerPath = join(REPO, 'proverb-ledger.json');
  const ledger = existsSync(ledgerPath) ? JSON.parse(readFileSync(ledgerPath, 'utf8')) : null;
  const ledgerEntry = (seq) => ledger && seq ? (ledger.entries || []).find(e => String(e.seq) === String(seq)) : null;
  const doorsPath = join(ROOT, 'doors.json');
  const doors = existsSync(doorsPath) ? JSON.parse(readFileSync(doorsPath, 'utf8')) : [];
  const sv = loadLatestSurvey();
  const watchMap = loadWatchMap();
  const moved = sv ? digestSurvey(sv) : [];
  const watchSection = watchHtml(moved, sv, watchMap);
  const runSection = runHtml();
  const contributePath = join(ROOT, 'survey', 'contribute.json');
  const contribute = existsSync(contributePath) ? JSON.parse(readFileSync(contributePath, 'utf8')) : null;
  const cLink = (r) => r.url ? '<a href="' + esc(r.url) + '">' + esc(r.where) + '</a>' : esc(r.where);
  const contributeHtml = contribute ? '<div class="panel" id="contribute"><h3>' + esc(contribute.title) + '</h3><p class="muted">Checked ' + esc(contribute.checkedAt) + '</p><p>' + esc(contribute.lead) + '</p>'
    + '<h4>Span</h4><ul>' + ['watched', 'added', 'seen_not_added'].map(k => '<li><b>' + k.replace(/_/g, ' ') + ':</b> ' + (contribute.span[k] || []).map(esc).join(' · ') + '</li>').join('') + '<li><b>mentions:</b> ' + esc(contribute.span.mentions || '') + '</li></ul>'
    + '<h4>Ready — approve and they post, in this order</h4><table class="ct"><tr><th>#</th><th>draft</th><th>ledger</th><th>where</th><th>why</th><th>records</th></tr>' + contribute.ready.map(r => '<tr><td>' + r.order + '</td><td><b>' + esc(r.draft) + '</b></td><td>' + (r.ledger == null ? '—' : r.ledger) + '</td><td>' + cLink(r) + '</td><td>' + esc(r.why) + '</td><td class="muted">' + esc(r.records) + '</td></tr>').join('') + '</table>'
    + '<h4>Held — with the reason</h4><ul>' + contribute.held.map(r => '<li><b>' + esc(r.draft) + '</b>' + (r.ledger == null ? '' : ' (ledger ' + r.ledger + ')') + ' · ' + cLink(r) + ' — ' + esc(r.reason) + '</li>').join('') + '</ul>'
    + '<h4>Candidates — threads worth a contribution, no draft yet (say which to draft)</h4><ul>' + contribute.candidates.map(r => '<li>' + cLink(r) + ' — ' + esc(r.why) + ' <span class="muted">[records ' + esc(r.records) + ' · ' + esc(r.suggest) + ']</span></li>').join('') + '</ul>'
    + '<h4>Nothing to do</h4><ul>' + (contribute.nothing_to_do || []).map(x => '<li class="muted">' + esc(x) + '</li>').join('') + '</ul></div>' : '';
  const integrationReviewPath = join(ROOT, 'survey', 'integration-review.json');
  const integrationReview = existsSync(integrationReviewPath) ? JSON.parse(readFileSync(integrationReviewPath, 'utf8')) : null;
  const syncPanel = (r, cls) => '<div class="' + cls + '"><h3>' + esc(r.title) + '</h3><p class="muted">Checked ' + esc(r.checkedAt) + (r.note ? ' · ' + esc(r.note) : '') + '</p><ul>' + r.items.map(item => '<li>' + esc(item) + '</li>').join('') + '</ul></div>';
  const integrationReviewHtml = integrationReview ? '<div class="panel" id="sync-review">' + syncPanel(integrationReview, 'sync-current') + ((integrationReview.previous || []).length ? '<details class="sync-history"><summary>Earlier syncs (' + integrationReview.previous.length + ') — historical, superseded above</summary>' + integrationReview.previous.map(r => syncPanel(r, 'sync-previous')).join('') + '</details>' : '') + '</div>' : '';
  const doorsHtml = doors.length ? `<div class="panel"><table><tr><th>#</th><th>door</th><th>what</th><th>status</th><th>draft</th><th>cards</th><th>actor</th></tr>${doors.map(d => `<tr class="door-${esc(d.status)}"><td>${esc(d.id)}</td><td><a target="_blank" href="${esc(d.where)}">${esc(d.title)}</a></td><td>${esc(d.what)}</td><td><span class="chip">${esc(d.status)}</span></td><td>${d.draft ? `<a href="#draft-${esc(d.draft)}">${esc(d.draft)}</a>` : '—'}</td><td>${(d.cards || []).map(c => `<a href="#card-${c}">${c}</a>`).join(' ') || '—'}</td><td>${esc(d.actor || '')}</td></tr>`).join('')}</table></div>` : '<div class="panel">No doors file.</div>';
  const cardHtml = cards.map(c => `
<div class="card" data-k="card-${c.id}"><div class="head"><span class="ord">${c.id}</span>
  <span class="title">${esc(c.name)}</span><span class="chip">${c.kind}</span><span class="chip state">${c.state}</span></div>
<div class="note">${esc(c.dish)}</div>
<div class="body"><pre>${esc(renderCard(c))}</pre></div>
<div class="bar"><button onclick="cp(this)">Copy card markdown</button><span class="copied">copied ✓</span>
<button class="ghost" onclick="cpIssue(this)">Copy board-issue body</button><pre class="hidden">${esc(renderIssue(c))}</pre></div></div>`).join('\n');
  const runPath = join(ROOT, 'run.json');
  const run = existsSync(runPath) ? JSON.parse(readFileSync(runPath, 'utf8')) : { phases: [] };
  const steps = run.phases.flatMap(p => p.steps);
  const order = steps.filter(s => s.draft).map(s => s.draft);
  drafts.sort((a, b) => (order.includes(a.key) ? order.indexOf(a.key) : 999) - (order.includes(b.key) ? order.indexOf(b.key) : 999) || a.key.localeCompare(b.key));
  const readerData = [];
  const active = [], archived = [];
  for (const d of drafts) {
    const le = ledgerEntry(d.meta.ledger);
    const step = steps.find(s => s.draft === d.key);
    const historic = le?.activated === true;
    const target = exactTarget(d.meta.thread);
    const targetParts = target ? new URL(target).pathname.split('/').filter(Boolean) : [];
    const sourceRepo = sv?.repos?.[targetParts[1]];
    const collection = { discussions: 'discussions', issues: 'issues', pull: 'pulls' }[targetParts[2]];
    const sourceThread = collection && sourceRepo?.[collection]?.find(t => String(t.number) === targetParts[3]);
    const sourceContext = { head: sourceRepo?.head?.oid || null, threadUpdatedAt: sourceThread?.updatedAt || null, error: sourceRepo?.error || null };
    const sourceCheckedAt = sourceRepo?.lastSuccessfulAt || (sourceRepo?.error ? sourceRepo.since : sourceRepo ? sv.fetchedAt : null);
    const blocked = /SUPERSEDED|FOLDED/i.test(d.meta.chip || '') ? 'Superseded — reference only' :
      le?.activated === false ? 'Retired — reference only' : historic ? 'Historical activation — publication unverified' :
      step?.state === 'held' || d.meta.status === 'held' || !step && /waits|WAIT/i.test(d.meta.chip || '') ? 'Held — reference only' :
      !le || !d.meta.proverb ? 'A served proverb is required before review' : !exactTarget(d.meta.thread) ? 'Choose an exact GitHub destination' : '';
    const binding = { id: d.key, title: d.head, body: d.body, target, sourceContext, proverb: d.meta.proverb || '', ledger: le?.seq || null,
      action: d.meta.action || 'publication', blocked, guidance: d.meta.note || '', prerequisites: step?.requires || [] };
    const revision = draftRevision(binding);
    const data = { ...binding, body: undefined, revision, sourceCheckedAt };
    readerData.push(data);
    const html = `
<article class="card${blocked ? ' retired' : ''}" id="draft-${esc(d.key)}" data-k="${esc(d.key)}" data-revision="${revision}"><div class="head">
  <span class="ord">${esc(d.key)}</span><span class="title">${esc(d.head)}</span><span class="chip review-status">${esc(blocked || 'Needs your review')}</span>
  ${d.meta.chip ? `<span class="chip">${esc(d.meta.chip)}</span>` : ''}
  ${binding.target ? `<a class="thread" target="_blank" rel="noopener noreferrer" href="${esc(binding.target)}">Open destination ↗</a>` : ''}</div>
<div class="note">${esc(d.meta.note || '')}<br><b>Destination:</b> ${esc(binding.target || 'Not selected')}<br><b>Purpose:</b> ${esc(le?.actMeaning || 'Review the draft and select its intended publication.')}<br><b>Revision:</b> <code>${revision.slice(0, 12)}</code> · <b>Last successful source check:</b> ${esc(sourceCheckedAt || 'No source snapshot')}${sourceRepo?.error ? ' — latest refresh failed; re-read the live target' : ''}<br><b>Before publishing:</b> ${esc(step?.requires?.length ? step.requires.join(' · ') : 'Re-read the live target and resolve relevant changes since the source snapshot.')}</div>
<div class="body"><pre>${esc(d.body)}</pre></div>
<div class="rite"><div><b>Review this publication</b><p class="proverb">${esc(d.meta.proverb || 'No proverb served for this draft.')}</p><p>Read the proverb alongside the exact text and destination. Approval records your acknowledgment of this revision; it does not publish it.</p></div><button data-action="approve"${blocked ? ' disabled' : ''}>I have reviewed this version</button></div>
<div class="bar"><button data-action="copy" disabled>Copy approved text</button><button class="ghost" data-action="export" disabled>Export review receipt</button><span class="publication-status">Publication not recorded</span></div>
<div class="bar"><label for="receipt-${esc(d.key)}">After posting, paste the exact GitHub post or comment URL</label><input class="receipt-url" id="receipt-${esc(d.key)}" type="url" placeholder="https://github.com/…"><button class="ghost" data-action="report" disabled>Record reported publication</button></div>
<p class="reader-message note" role="status" aria-live="polite"></p></article>`;
    (blocked ? archived : active).push(html);
  }
  const draftHtml = active.join('\n') + (archived.length ? `<details class="archive"><summary>Held, superseded and historical drafts (${archived.length}) — reference only</summary>${archived.join('\n')}</details>` : '');
  const stateRows = STATES.map(s => { const t = TASKS[s]; return `<tr><td>→ <code>${s}</code></td><td><code>${t.task}</code></td><td>${t.issuer} → ${t.recipient}</td><td>${t.sideEffects}</td><td>${t.exposure}</td></tr>`; }).join('');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>ZKP Board · the book</title>
<style>
:root{--bg:#f6f4ef;--card:#fff;--ink:#1c2430;--muted:#5b6675;--accent:#3a7c6f;--accent2:#7c5c3a;--line:#d9d4c8;--chip:#eef2ee;--pre:#f3f6f4;--done:#9db8a5}
@media (prefers-color-scheme:dark){:root{--bg:#151a1f;--card:#1e252c;--ink:#e8e4da;--muted:#9aa4ae;--accent:#6fbfae;--accent2:#c9a06a;--line:#333c44;--chip:#243029;--pre:#181f24;--done:#3e5747}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.55 "Segoe UI",system-ui,sans-serif;padding:2rem 1rem 4rem}
.wrap{max-width:960px;margin:0 auto}h1{font-size:1.5rem;margin:0 0 .25rem}h2.sec{font-size:1.1rem;color:var(--accent);margin:2rem 0 .8rem;border-bottom:1px solid var(--line);padding-bottom:.3rem}
.sub{color:var(--muted);margin-bottom:1.2rem}nav a{color:var(--accent);margin-right:1rem;text-decoration:none;font-weight:600}
.panel{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:1rem 1.25rem;margin-bottom:1.2rem;font-size:.9rem}
.panel table{border-collapse:collapse;width:100%;font-size:.85rem}.panel td,.panel th{border-bottom:1px solid var(--line);padding:.3rem .5rem;text-align:left;vertical-align:top}
.card{background:var(--card);border:1px solid var(--line);border-radius:10px;margin-bottom:1.2rem;overflow:hidden}.card.done{opacity:.55;border-color:var(--done)}
.head{display:flex;flex-wrap:wrap;align-items:center;gap:.6rem;padding:.8rem 1.1rem;border-bottom:1px solid var(--line)}.ord{font-weight:700;color:var(--accent2);min-width:1.6rem}.title{font-weight:600;flex:1}
.chip{background:var(--chip);color:var(--accent);border-radius:99px;padding:.1rem .6rem;font-size:.75rem;font-weight:600;white-space:nowrap}.chip.state{color:var(--accent2)}
a.thread{color:var(--accent);text-decoration:none;font-size:.85rem}.note{padding:.6rem 1.1rem;color:var(--muted);font-size:.85rem;border-bottom:1px dashed var(--line)}
pre{margin:0;padding:1rem 1.1rem;background:var(--pre);overflow-x:auto;font:13px/1.5 Consolas,"Cascadia Mono",monospace;white-space:pre-wrap;max-height:28rem;overflow-y:auto}
.hidden{display:none}.bar{display:flex;gap:.6rem;align-items:center;padding:.55rem 1.1rem;border-top:1px solid var(--line);flex-wrap:wrap}
button{background:var(--accent);color:#fff;border:0;border-radius:6px;padding:.4rem .9rem;font-weight:600;cursor:pointer;font-size:.85rem}button.ghost{background:var(--chip);color:var(--accent)}button:hover{filter:brightness(1.1)}
label.posted{font-size:.85rem;color:var(--muted);cursor:pointer}.copied,.gatemsg{color:var(--accent);font-size:.85rem;display:none}
.rite{display:flex;gap:.8rem;align-items:center;padding:.7rem 1.1rem;border-top:1px dashed var(--line);background:var(--chip);flex-wrap:wrap}.proverb{font-style:italic;flex:1}
.ritemark{display:none;color:var(--accent2);font-size:.8rem}.card.activated .ritemark{display:inline}.card.activated .activate{display:none}button.activate{background:var(--accent2)}
.ritedef{background:var(--card);border:1px solid var(--line);border-left:4px solid var(--accent2);border-radius:8px;padding:.85rem 1.1rem;margin:0 0 1.2rem;font-size:.9rem}
.foot{color:var(--muted);font-size:.8rem;margin-top:2rem}
.chip.done{background:var(--done);color:#fff}.chip.retired{background:var(--line);color:var(--muted)}.chip.ledger{background:transparent;border:1px dashed var(--line);color:var(--muted)}.chip.zk{background:var(--accent2);color:#fff}.chip.kind{background:var(--pre);color:var(--muted)}.chip.card-ref{text-decoration:none}
.card.retired{opacity:.6}.muted{color:var(--muted);font-size:.85rem}
.watch h3.repo{font-size:.95rem;margin:1rem 0 .4rem;color:var(--accent2)}.thread{border-top:1px dashed var(--line);padding:.5rem 0}.thread.rel{border-left:3px solid var(--accent2);padding-left:.6rem}
.thead{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center}.ttl{font-weight:600;color:var(--ink);text-decoration:none}.ttl:hover{color:var(--accent)}.tmeta{font-size:.8rem;color:var(--muted);margin:.2rem 0}.tsnip{font-size:.85rem;margin:.2rem 0 .3rem}
ul.evl{margin:.3rem 0 0;padding-left:1.2rem;font-size:.82rem}ul.evl li{margin:.2rem 0}details summary{cursor:pointer;font-size:.8rem;color:var(--accent)}
table.ct{border-collapse:collapse;width:100%;font-size:.85rem}table.ct th,table.ct td{border-top:1px solid var(--line);padding:.35rem .4rem;vertical-align:top;text-align:left}#contribute h4{margin:1rem 0 .3rem;font-size:.95rem}
.run .phase{border-top:1px solid var(--line);padding:.9rem 0 .2rem}.run .phase:first-child{border-top:0;padding-top:0}
.run h3{font-size:.98rem;margin:0 0 .3rem;color:var(--accent2)}.run .phasewhy{color:var(--muted);font-size:.85rem;margin:0 0 .7rem}
ol.steps{list-style:none;margin:0;padding:0}li.step{display:flex;gap:.7rem;padding:.55rem 0;border-top:1px dashed var(--line)}
li.step:first-child{border-top:0}.stepn{font-weight:700;color:var(--accent2);min-width:1.5rem;text-align:right}.stepbody{flex:1}
.act{font-weight:600;display:flex;flex-wrap:wrap;gap:.45rem;align-items:center}.where{font-size:.8rem;color:var(--muted);margin:.15rem 0}
.where code{background:var(--pre);padding:.05rem .3rem;border-radius:4px}.gate{font-size:.78rem;color:var(--accent);margin:.1rem 0}
.stepwhy{font-size:.85rem;color:var(--ink);margin-top:.2rem}
.chip.st-ready{background:var(--accent);color:#fff}.chip.st-blocked{background:var(--accent2);color:#fff}
.chip.st-ready-after-A{background:var(--chip);color:var(--accent2);border:1px dashed var(--accent2)}
.chip.st-optional,.chip.st-held{background:var(--line);color:var(--muted)}
.chip.st-ready-for-review{background:var(--chip);color:var(--accent);border:1px solid var(--accent)}.chip.draftref{text-decoration:none}
li.step.st-blocked .stepn{color:var(--accent2)}li.step.st-held,li.step.st-optional{opacity:.75}
tr.door-done td{opacity:.55}tr.door-drafted td .chip{background:var(--accent);color:#fff}tr.door-waiting td .chip{background:var(--line)}
button:disabled{opacity:.45;cursor:not-allowed}.receipt-url{flex:1;min-width:180px;max-width:100%;padding:.5rem;background:var(--bg);color:var(--ink);border:1px solid var(--line)}.rite p{margin:.4rem 0}.publication-status{font-size:.85rem}.archive>summary{padding:1rem;cursor:pointer}.reader-message:empty{display:none}.card.activated button[data-action="approve"]{background:var(--line);color:var(--ink)}
.wrap{overflow-wrap:anywhere}.panel{overflow-x:auto}.stepbody,.title,.rite>div{min-width:0}.chip{max-width:100%;white-space:normal}pre{overflow-wrap:anywhere}@media(max-width:600px){.panel{padding:.8rem}.bar{align-items:stretch}.receipt-url{width:100%}.bar button{max-width:100%}}
</style></head><body><div class="wrap">
<h1>ZKP Board · the book 📖</h1>
<div class="sub">zkp-tf #18 lane — requested proofs as cards; drafts to post; the process as a trust task. Local, private, generated ${new Date().toISOString().slice(0, 10)} by <code>board.mjs site</code>.</div>
<nav><a href="#run">Run</a><a href="#watch">Watch (${moved.length})</a><a href="#doors">Doors (${doors.length})</a><a href="#drafts">Drafts</a><a href="#process">Process</a><a href="#cards">Cards (${cards.length})</a><a href="#cookbook">ZK Book</a></nav>

<h2 class="sec" id="run">Run — step by step, in the order it leaves the machine</h2>
${contributeHtml}
${integrationReviewHtml}
${runSection}

<h2 class="sec" id="watch">Watch — upstream threads that moved</h2>
<div class="ritedef">👁️ <b>Read-only.</b> <code>board.mjs survey</code> pulls the eleven trustoverip DTG repositories listed in watch.mjs (zkp-spec, zkp-tf, cred-spec, cred-tf, rahp-tf, trust-tasks-tf, trust-tasks-spec, vti-spec, vds-spec, general, htx-tf) over GraphQL (token from the git credential store, held in memory only) and lists retrieved changes after each repository’s last successful watermark, including edits and review activity. Failed repositories are marked for retry. <b>ZKP</b> = relevance filter hit; <b>→ card</b> = the hand-kept mapping in <code>watch-map.json</code>. Nothing here posts.</div>
${watchSection}

<h2 class="sec" id="doors">Doors — where the co-chair can add value now</h2>
${doorsHtml}

<h2 class="sec" id="drafts">Publication queue — run order, then follow-ups</h2>
<div class="ritedef"><b>The proverb is your review pause.</b> Acknowledgment applies to the exact draft revision and destination. Copying does not publish. Publication URLs entered here are your reports, explicitly unverified. Records are stored in this browser; export receipts to preserve them. Earlier ledger activations do not confirm publication of a revised draft.</div>
${draftHtml}

<h2 class="sec" id="process">Process — the board as a trust task</h2>
<div class="panel">
<p><b>Rule.</b> A row may not claim more than its card; a card no more than a runtime has measured; a runtime no more than an independent run has reproduced. States are monotone: <code>${STATES.join(' → ')}</code>.</p>
<table><tr><th>transition</th><th>trust task</th><th>issuer → recipient</th><th>sideEffects</th><th>exposure</th></tr>${stateRows}</table>
<p style="margin-top:.8rem">Refusals are register strings (<code>card-clause-unbound</code>, <code>card-composed-yield-is-union</code>, <code>run-same-hands</code>, <code>vet-self-vouch</code>, <code>publish-without-rite</code> …). The runner may not be the constructor. Evidence fields currently record declared references; these transitions are not themselves independent verification of those references. Full text: <code>board/README.md</code>.</p>
<details><summary>README</summary><pre>${esc(readme)}</pre></details>
</div>

<h2 class="sec" id="cards">Cards — the recipes</h2>
${cardHtml}

<h2 class="sec" id="cookbook">ZK Book — the deck as a Spec-Up-T draft</h2>
<div class="panel"><p><code>board.mjs spec</code> renders every card into <code>zkbook/spec/recipes.md</code> (one section per recipe; primitive and composed indexed separately) and generates a term for every gadget, role and recipe part. Hand-written chapters: header · intro · <b>pantry</b> (context descriptor, set roots, epoch, transcript digest, declared scope, public-signal order) · appendix. Render: <code>cd zkbook &amp;&amp; npm install &amp;&amp; npm run render</code> → <code>docs/index.html</code>. The state printed at the top of each recipe says how much weight the page can bear; evidence maturity does not confer normative status; adoption remains a task-force decision.</p><p>Offered upstream as draft R (the consolidated anchor) with the pull request body in draft P; the run above is the order. The specification repository is <code>trustoverip/dtgwg-zkp-spec</code> and the apparatus rides in as <code>conformance/</code>.</p></div>

<div class="foot">Generated from <code>board/cards/*.json</code> and <code>board/drafts/*.md</code>. Nothing here is posted or pushed by the tool; posting and publication are the maintainer's acts.</div>
</div>
<script type="application/json" id="reader-data">${JSON.stringify(readerData).replace(/</g, '\\u003c')}</script>
<script>
${readFileSync(join(HERE, 'reader-state.mjs'), 'utf8').replace(/^export /gm, '')}
${readFileSync(join(HERE, 'reader-ui.js'), 'utf8')}
</script></div></body></html>`.replace(/^[ \t]+$/gm, '');
}

// ---- CLI ---------------------------------------------------------------------------------
function arg(name) { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : undefined; }
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [cmd, a1, a2] = process.argv.slice(2);
  const cards = loadCards();
  if (cmd === 'validate') {
    let bad = 0;
    for (const c of cards) { const r = validateCard(c, cards); if (r.length) { bad++; console.log(`${c.id} REFUSED ${r.join(' ')}`); } else console.log(`${c.id} ok (${c.kind}, ${c.state})`); }
    process.exit(bad ? 1 : 0);
  } else if (cmd === 'render' || cmd === 'issue') {
    const c = loadCard(a1); if (!c) { console.log(`card-not-found:${a1}`); process.exit(1); }
    process.stdout.write(cmd === 'render' ? renderCard(c) : renderIssue(c));
  } else if (cmd === 'index') {
    writeFileSync(join(ROOT, 'BOARD.md'), renderIndex(cards));
    mkdirSync(join(ROOT, 'render'), { recursive: true });
    for (const c of cards) writeFileSync(join(ROOT, 'render', `${c.id}.md`), renderCard(c));
    console.log(`BOARD.md + render/ written (${cards.length} cards)`);
  } else if (cmd === 'advance') {
    const c = loadCard(a1); if (!c) { console.log(`card-not-found:${a1}`); process.exit(1); }
    const res = advance(c, a2, { by: arg('--by'), evidence: arg('--evidence'), date: arg('--date') });
    if (!res.ok) { console.log(`REFUSED ${res.refusal}`); process.exit(1); }
    saveCard(res.card); console.log(`${a1} → ${a2} via ${res.task.task} (${res.task.issuer} → ${res.task.recipient})`);
  } else if (cmd === 'site') {
    mkdirSync(join(ROOT, 'site'), { recursive: true });
    writeFileSync(join(ROOT, 'site', 'index.html'), buildSite(cards));
    const sv = loadLatestSurvey();
    if (sv) { const { renderWatchMd } = await import('./watch.mjs'); writeFileSync(join(ROOT, 'survey', 'WATCH.md'), renderWatchMd(digestSurvey(sv), sv, loadWatchMap())); }
    console.log(`site/index.html written${sv ? ' (+ survey/WATCH.md re-digested from latest.json)' : ''}`);
  } else if (cmd === 'survey') {
    const r = await runSurvey({ since: arg('--since') });
    if (!r.ok) { console.log(`REFUSED ${r.refusal}`); process.exit(1); }
    const moved = digestSurvey(loadLatestSurvey());
    console.log(`survey/latest.json + WATCH.md written — fetched ${r.fetchedAt}, since ${r.since}, ${moved.length} threads moved across ${r.repos.join(', ')}`);
  } else if (cmd === 'spec') {
    const r = writeCookbook(cards, GADGETS);
    if (r.refusal) { console.log(`REFUSED ${r.refusal}`); process.exit(1); }
    console.log(`zkbook/spec: recipes.md (${r.cards}) + records.md (${r.records}) + stacks.md (${r.stacks}) + ${r.terms} generated terms written${r.exists ? '' : ' — zkbook/specs.json missing'}`);
  } else {
    console.log('usage: board.mjs validate | render <id> | issue <id> | index | advance <id> <state> --by X --evidence Y | site | survey [--since ISO] | spec');
  }
}
