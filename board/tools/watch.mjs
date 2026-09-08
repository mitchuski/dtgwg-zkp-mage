// watch.mjs — the board's upstream eye. Zero dependencies.
//   survey({ since })  → board/survey/latest.json (+ dated copy) from GitHub GraphQL, token via
//                        `git credential fill` held in-process only (never written, never logged)
//   digestSurvey(json) → the list of threads that moved since the watermark, newest first
//   renderWatchMd / watchHtml → the digest as markdown (tracked) and as the site's Watch section
// Read-only against GitHub. Nothing here posts.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const SURVEY_DIR = join(ROOT, 'survey');
export const REPOS = ['dtgwg-zkp-spec', 'dtgwg-zkp-tf', 'dtgwg-cred-spec', 'dtgwg-cred-tf', 'dtgwg-rahp-tf'];
export const OWNER = 'trustoverip';
const RELEVANCE = /\bZK\b|ZKP|zero-knowledge|\bproofs?\b|nullifier|correlat|\bscope|digest|delegat|privacy|unlinkab|commitment|revocat|registry|liveness|biometric|pseudonym|anchor|common control|disclos/i;

const PAGE = 'pageInfo{hasNextPage endCursor}';
const REPLY = 'id author{login} createdAt updatedAt url body';
const COMMENT = `${REPLY} replies(first:30){${PAGE} nodes{${REPLY}}}`;
const REVIEW = 'id author{login} state submittedAt body url';
const DISCUSSION = `id number title url body category{name} author{login} createdAt updatedAt isAnswered comments(first:30){${PAGE} nodes{${COMMENT}}}`;
const PULL = `id number title url state author{login} createdAt updatedAt mergedAt headRefName body reviews(first:30){${PAGE} nodes{${REVIEW}}} comments(first:30){${PAGE} nodes{${REPLY}}}`;
const ISSUE = `id number title url state author{login} createdAt updatedAt body labels(first:100){${PAGE} nodes{name}} comments(first:30){${PAGE} nodes{${REPLY}}}`;
const SPECS = { discussions: DISCUSSION, pullRequests: PULL, issues: ISSUE };
const Q = `query($o:String!,$n:String!){ repository(owner:$o,name:$n){ nameWithOwner pushedAt
  defaultBranchRef{ name target{ ... on Commit{ oid committedDate message } } }
  discussions(first:30,orderBy:{field:UPDATED_AT,direction:DESC}){${PAGE} nodes{${DISCUSSION}}}
  pullRequests(first:30,orderBy:{field:UPDATED_AT,direction:DESC}){${PAGE} nodes{${PULL}}}
  issues(first:30,orderBy:{field:UPDATED_AT,direction:DESC}){${PAGE} nodes{${ISSUE}}}
} }`;

// Complete every connection, including nested comment/reply and review pages. A failure
// aborts this repository's snapshot; it must never advance that repository's watermark.
export async function drainConnection(initial, nextPage) {
  if (!initial?.pageInfo || !Array.isArray(initial.nodes)) throw new Error('survey-incomplete-connection');
  const nodes = [...initial.nodes]; let page = initial; const cursors = new Set();
  while (page.pageInfo.hasNextPage) {
    const cursor = page.pageInfo.endCursor;
    if (!cursor || cursors.has(cursor)) throw new Error('survey-pagination-stalled');
    cursors.add(cursor); page = await nextPage(cursor);
    if (!page?.pageInfo || !Array.isArray(page.nodes)) throw new Error('survey-incomplete-page');
    nodes.push(...page.nodes);
  }
  return { nodes };
}
export async function collectRepository(request, name) {
  const repo = (await request(Q, { o: OWNER, n: name })).repository;
  if (!repo) throw new Error('survey-repository-unavailable');
  for (const [field, selection] of Object.entries(SPECS)) {
    repo[field] = await drainConnection(repo[field], async cursor => {
      const q = `query($o:String!,$n:String!,$after:String!){repository(owner:$o,name:$n){${field}(first:30,after:$after,orderBy:{field:UPDATED_AT,direction:DESC}){${PAGE} nodes{${selection}}}}}`;
      return (await request(q, { o: OWNER, n: name, after: cursor })).repository?.[field];
    });
  }
  async function nested(parent, type, field, selection) {
    parent[field] = await drainConnection(parent[field], async cursor => {
      const q = `query($id:ID!,$after:String!){node(id:$id){... on ${type}{${field}(first:30,after:$after){${PAGE} nodes{${selection}}}}}`;
      return (await request(q, { id: parent.id, after: cursor })).node?.[field];
    });
  }
  for (const d of repo.discussions.nodes) {
    await nested(d, 'Discussion', 'comments', COMMENT);
    for (const c of d.comments.nodes) await nested(c, 'DiscussionComment', 'replies', REPLY);
  }
  for (const p of repo.pullRequests.nodes) { await nested(p, 'PullRequest', 'comments', REPLY); await nested(p, 'PullRequest', 'reviews', REVIEW); }
  for (const i of repo.issues.nodes) { await nested(i, 'Issue', 'comments', REPLY); await nested(i, 'Issue', 'labels', 'name'); }
  return repo;
}
export function repositoryWatermark(previous, name, explicit, fallback) {
  return explicit || previous?.repos?.[name]?.lastSuccessfulAt ||
    (previous?.repos?.[name]?.error ? previous.repos[name].since || previous.since : previous?.fetchedAt) || fallback;
}

function token() {
  try {
    const cred = execFileSync(process.env.DTG_GIT_EXECUTABLE || 'git', ['credential', 'fill'], { input: 'protocol=https\nhost=github.com\n\n', encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'], env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'never' } });
    return (cred.match(/^password=(.+)$/m) || [])[1] || null;
  } catch { return null; }
}
const trim = (s, n) => (s || '').replace(/\r/g, '').slice(0, n);
const login = (a) => (a && a.login) || 'ghost';

function compact(repo) {
  return {
    pushedAt: repo.pushedAt,
    head: repo.defaultBranchRef ? { branch: repo.defaultBranchRef.name, oid: repo.defaultBranchRef.target.oid, at: repo.defaultBranchRef.target.committedDate, subject: (repo.defaultBranchRef.target.message || '').split('\n')[0] } : null,
    discussions: repo.discussions.nodes.map(d => ({
      number: d.number, title: d.title, url: d.url, category: d.category?.name, author: login(d.author), createdAt: d.createdAt, updatedAt: d.updatedAt, answered: d.isAnswered, body: trim(d.body, 2500),
      comments: d.comments.nodes.map(c => ({ author: login(c.author), at: c.updatedAt || c.createdAt, url: c.url, body: trim(c.body, 2000), replies: c.replies.nodes.map(r => ({ author: login(r.author), at: r.updatedAt || r.createdAt, url: r.url, body: trim(r.body, 2000) })) })),
    })),
    pulls: repo.pullRequests.nodes.map(p => ({
      number: p.number, title: p.title, url: p.url, state: p.state, author: login(p.author), createdAt: p.createdAt, updatedAt: p.updatedAt, mergedAt: p.mergedAt, head: p.headRefName, body: trim(p.body, 2000),
      reviews: p.reviews.nodes.map(v => ({ author: login(v.author), state: v.state, at: v.submittedAt, url: v.url, body: trim(v.body, 1500) })),
      comments: p.comments.nodes.map(c => ({ author: login(c.author), at: c.updatedAt || c.createdAt, url: c.url, body: trim(c.body, 1500) })),
    })),
    issues: repo.issues.nodes.map(i => ({
      number: i.number, title: i.title, url: i.url, state: i.state, author: login(i.author), createdAt: i.createdAt, updatedAt: i.updatedAt, labels: i.labels.nodes.map(l => l.name), body: trim(i.body, 2000),
      comments: i.comments.nodes.map(c => ({ author: login(c.author), at: c.updatedAt || c.createdAt, url: c.url, body: trim(c.body, 1500) })),
    })),
  };
}

export async function survey({ since, repos = REPOS } = {}) {
  const tok = token();
  if (!tok) return { ok: false, refusal: 'survey-no-token' };
  const prev = loadLatestSurvey();
  const fallback = new Date(Date.now() - 14 * 864e5).toISOString();
  const startedAt = new Date().toISOString();
  const watermarks = Object.fromEntries(repos.map(n => [n, repositoryWatermark(prev, n, since, fallback)]));
  const out = { fetchedAt: startedAt, since: Object.values(watermarks).sort()[0], owner: OWNER, repos: {} };
  async function request(query, variables) {
    const response = await fetch('https://api.github.com/graphql', { method: 'POST', signal: AbortSignal.timeout(30000), headers: { Authorization: `bearer ${tok}`, 'Content-Type': 'application/json', 'User-Agent': 'dtg-reader-survey' }, body: JSON.stringify({ query, variables }) });
    if (!response.ok) throw new Error(`survey-http-${response.status}`);
    const result = await response.json();
    if (result.errors?.length || !result.data) throw new Error('survey-graphql-error');
    return result.data;
  }
  for (const n of repos) {
    try {
      const repo = await collectRepository(request, n);
      out.repos[n] = { ...compact(repo), since: watermarks[n], lastSuccessfulAt: startedAt, complete: true };
    } catch (error) {
      // Retain the last successful time, including across repeated failures.
      out.repos[n] = { error: error.message, since: watermarks[n], lastSuccessfulAt: watermarks[n], complete: false };
    }
  }
  mkdirSync(SURVEY_DIR, { recursive: true });
  const text = JSON.stringify(out, null, 1) + '\n';
  writeFileSync(join(SURVEY_DIR, `${startedAt.replace(/[:.]/g, '-')}.json`), text);
  writeFileSync(join(SURVEY_DIR, 'latest.json'), text);
  writeFileSync(join(SURVEY_DIR, 'WATCH.md'), renderWatchMd(digestSurvey(out), out, loadWatchMap()));
  return { ok: true, fetchedAt: startedAt, since: out.since, repos: Object.keys(out.repos), incomplete: Object.keys(out.repos).filter(n => !out.repos[n].complete) };
}

export function loadLatestSurvey() {
  const p = join(SURVEY_DIR, 'latest.json');
  return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null;
}
export function loadWatchMap() {
  const p = join(ROOT, 'watch-map.json');
  return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : {};
}

// ---- digest: what moved since the watermark ------------------------------------------------
const snip = (s, n = 280) => (s || '').replace(/\r?\n+/g, ' ').replace(/\s+/g, ' ').replace(/<[^>]+>/g, '').trim().slice(0, n);
export function digestSurvey(sv, overrideSince) {
  const items = [];
  for (const [repo, r] of Object.entries(sv.repos)) {
    const since = overrideSince || r.since || sv.since;
    if (r.error) { items.push({ repo, kind: 'error', title: r.error, lastAt: sv.fetchedAt, events: [] }); continue; }
    for (const d of r.discussions) {
      const ev = [];
      if (d.createdAt >= since) ev.push({ at: d.createdAt, who: d.author, kind: 'opened', text: snip(d.body), url: d.url });
      for (const c of d.comments) { if (c.at >= since) ev.push({ at: c.at, who: c.author, kind: 'comment', text: snip(c.body), url: c.url }); for (const x of c.replies) if (x.at >= since) ev.push({ at: x.at, who: x.author, kind: 'reply', text: snip(x.body), url: x.url }); }
      if (ev.length || d.updatedAt >= since) items.push(mk(repo, 'discussion', d, ev, d.category));
    }
    for (const p of r.pulls) {
      const ev = [];
      if (p.createdAt >= since) ev.push({ at: p.createdAt, who: p.author, kind: 'opened', text: snip(p.body), url: p.url });
      if (p.mergedAt && p.mergedAt >= since) ev.push({ at: p.mergedAt, who: '—', kind: 'merged', text: '', url: p.url });
      for (const c of p.comments) if (c.at >= since && !/^(dependabot|linux-foundation-easycla|copilot)/.test(c.author)) ev.push({ at: c.at, who: c.author, kind: 'comment', text: snip(c.body), url: c.url });
      for (const v of p.reviews) if ((v.at || '') >= since) ev.push({ at: v.at, who: v.author, kind: `review:${v.state}`, text: snip(v.body), url: v.url });
      if ((ev.length || p.updatedAt >= since) && !/^dependabot/.test(p.author)) items.push(mk(repo, 'pr', p, ev, p.state + (p.mergedAt ? ' · merged' : '')));
    }
    for (const i of r.issues) {
      const ev = [];
      if (i.createdAt >= since) ev.push({ at: i.createdAt, who: i.author, kind: 'opened', text: snip(i.body), url: i.url });
      for (const c of i.comments) if (c.at >= since) ev.push({ at: c.at, who: c.author, kind: 'comment', text: snip(c.body), url: c.url });
      if (ev.length || i.updatedAt >= since) items.push(mk(repo, 'issue', i, ev, i.state));
    }
  }
  return items.sort((a, b) => b.lastAt.localeCompare(a.lastAt));
}
function mk(repo, kind, t, events, tag) {
  events.sort((a, b) => a.at.localeCompare(b.at));
  const last = events[events.length - 1];
  const text = [t.title, ...events.map(e => e.text)].join(' ');
  return { repo, kind, number: t.number, title: t.title, url: t.url, tag: tag || '', author: t.author, lastAt: last && last.at > t.updatedAt ? last.at : t.updatedAt, lastBy: last ? last.who : '', events, relevant: RELEVANCE.test(text), key: `${repo}#${t.number}` };
}

// ---- renderers -------------------------------------------------------------------------------
export function renderWatchMd(items, sv, map = {}) {
  const rows = items.map(it => {
    if (it.kind === 'error') return `| ${it.repo} | Refresh incomplete — retry from last successful watermark | ERROR | — | — | — | ${it.title} |`;
    const m = map[it.key];
    const cards = m?.cards?.length ? m.cards.map(c => `card ${c}`).join(', ') : '';
    return `| ${it.repo.replace('dtgwg-', '')} | [${it.kind} #${it.number}](${it.url}) ${it.title.replace(/\|/g, '\\|')} | ${it.tag} | ${it.events.length} | ${it.lastAt.slice(0, 16).replace('T', ' ')} ${it.lastBy} | ${it.relevant ? '●' : ''} | ${cards}${m?.note ? (cards ? ' — ' : '') + m.note : ''} |`;
  }).join('\n');
  return `# WATCH — upstream threads that moved (generated by \`board.mjs survey\`, do not edit)

Fetched ${sv.fetchedAt.slice(0, 16).replace('T', ' ')} UTC · watermark ${sv.since.slice(0, 16).replace('T', ' ')} UTC · repos: ${Object.keys(sv.repos).join(', ')}.
● = text matches the ZKP relevance filter. The card column comes from \`board/watch-map.json\` (hand-kept: which thread feeds which card).

| repo | thread | tag | new | last | ● | feeds |
|---|---|---|---|---|---|---|
${rows}

Read-only: nothing here posts. Posting is the maintainer's act.
`;
}
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export function watchHtml(items, sv, map = {}) {
  if (!sv) return `<div class="panel">No survey yet — run <code>node board/tools/board.mjs survey</code> (needs a GitHub token in the git credential store; the token never touches disk).</div>`;
  const groups = {};
  for (const it of items) (groups[it.repo] = groups[it.repo] || []).push(it);
  const repoHtml = Object.entries(groups).map(([repo, its]) => `
<h3 class="repo">${esc(repo)} <span class="muted">(${its.length} retrieved · since ${esc(sv.repos[repo]?.since || sv.since)})</span></h3>
${its.map(it => {
  if (it.kind === 'error') return `<div class="thread"><b>Refresh incomplete: ${esc(it.repo)}</b><p>${esc(it.title)}. Retry starts at ${esc(sv.repos[it.repo].since || sv.since)}; this failure does not advance its watermark.</p></div>`;
  const m = map[it.key];
  const last = it.events[it.events.length - 1];
  return `<div class="thread${it.relevant ? ' rel' : ''}">
  <div class="thead"><span class="chip kind">${esc(it.kind)} #${it.number}</span><a class="ttl" target="_blank" href="${esc(it.url)}">${esc(it.title)}</a>${it.tag ? `<span class="chip">${esc(it.tag)}</span>` : ''}${it.relevant ? '<span class="chip zk">ZKP</span>' : ''}${m?.cards?.map(c => `<a class="chip card-ref" href="#card-${c}">→ card ${c}</a>`).join('') || ''}</div>
  <div class="tmeta">${it.events.length} new · last ${esc(it.lastAt.slice(0, 16).replace('T', ' '))} by <b>${esc(it.lastBy || it.author)}</b>${m?.note ? ` · <i>${esc(m.note)}</i>` : ''}</div>
  ${last && last.text ? `<div class="tsnip">${esc(last.who)} (${esc(last.kind)}): ${esc(last.text)}${last.text.length >= 280 ? '…' : ''}</div>` : ''}
  ${it.events.length > 1 ? `<details><summary>all ${it.events.length} events</summary><ul class="evl">${it.events.map(e => `<li><a target="_blank" href="${esc(e.url)}">${esc(e.at.slice(0, 16).replace('T', ' '))}</a> <b>${esc(e.who)}</b> <span class="muted">${esc(e.kind)}</span> — ${esc(e.text)}</li>`).join('')}</ul></details>` : ''}
</div>`;
}).join('\n')}`).join('\n');
  return `<div class="panel watch"><div class="muted">fetched ${esc(sv.fetchedAt.slice(0, 16).replace('T', ' '))} UTC · watermark ${esc(sv.since.slice(0, 16).replace('T', ' '))} UTC · ${items.length} retrieved changes · snippets only; open the target before posting · read-only</div>${repoHtml}</div>`;
}
