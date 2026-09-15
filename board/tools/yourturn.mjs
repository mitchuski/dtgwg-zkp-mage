// yourturn.mjs — the reader's first panel: only the items the maintainer must act on, each labelled with the action.
//   yourTurn({ sv, contribute, watchMap, draftsDir, receiptsDir, legacyReceipts, posted, me })
//     → { post, reply, maintain, contribute, discuss, stale, posted, … }
//   yourTurnHtml(data) → the panel as HTML
// Categories (the label says what the act is):
//   post        an approved draft with no post upstream yet — one command each
//   reply       someone spoke after the maintainer's last word in a thread of theirs, one they are in, or one naming them
//   maintain    keep the maintainer's own artifacts current (the PR, the header, the ledger, records under revision)
//   contribute  bring a record or a draft into a thread the maintainer is not in yet
//   discuss     weigh in on an open question; no artifact needed
// Computed from the full survey snapshot, the drafts' thread lines, the queue (contribute.json), the receipts and the
// upstream-match map from posted.mjs. Read-only; nothing here posts.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const BOTS = /^(dependabot|linux-foundation-easycla|copilot|github-actions)/;
const CATS = ['reply', 'maintain', 'contribute', 'discuss'];
const snip = (s, n = 200) => (s || '').replace(/\r?\n+/g, ' ').replace(/\s+/g, ' ').replace(/<[^>]+>/g, '').trim().slice(0, n);
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const short = (repo) => repo.replace('dtgwg-', '');
const when = (iso) => (iso || '').slice(0, 16).replace('T', ' ');
const threadKey = (url) => { const m = (url || '').match(/github\.com\/[^/]+\/([^/]+)\/(?:discussions|issues|pull)\/(\d+)/); return m ? `${m[1]}#${m[2]}` : null; };

export function loadDrafts(draftsDir) {
  const out = [];
  if (!existsSync(draftsDir)) return out;
  for (const f of readdirSync(draftsDir).filter(f => /^[A-Z]{1,2}-.*\.md$/.test(f))) {
    const t = readFileSync(join(draftsDir, f), 'utf8').replace(/\r\n/g, '\n');
    const head = t.split('\n---\n')[0];
    const letter = f.match(/^([A-Z]{1,2})-/)[1];
    const thread = (head.match(/^thread:\s*(\S+)/m) || [])[1] || '';
    out.push({ letter, file: f, title: (head.match(/^# (.*)$/m) || [])[1] || f, thread, key: threadKey(thread), ledger: (head.match(/^ledger:\s*(\d+)/m) || [])[1] || null, note: (head.match(/^note:\s*(.*)$/m) || [])[1] || '', body: t.split('\n---\n').slice(1).join('\n---\n') });
  }
  return out;
}
export function loadReceipts(surveyDir) {
  const out = [];
  if (!existsSync(surveyDir)) return out;
  for (const f of readdirSync(surveyDir).filter(f => /^publication-\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort())
    for (const r of JSON.parse(readFileSync(join(surveyDir, f), 'utf8'))) out.push({ ...r, day: f.slice(12, 22) });
  return out;
}

// every thread in the snapshot, flattened: who spoke last, whether I am in it, whether I was named after my last word
function threads(sv, me) {
  const out = [];
  const named = new RegExp(`@${me}\\b|zkp (task force|tf)\\b|zkp-tf\\b`, 'i');
  for (const [repo, r] of Object.entries(sv.repos || {})) {
    if (r.error) continue;
    const walk = (kind, t) => {
      const ev = [{ at: t.createdAt, who: t.author, text: t.body || '', url: t.url }];
      for (const c of t.comments || []) { ev.push({ at: c.at, who: c.author, text: c.body || '', url: c.url }); for (const x of c.replies || []) ev.push({ at: x.at, who: x.author, text: x.body || '', url: x.url }); }
      for (const v of t.reviews || []) if (v.at) ev.push({ at: v.at, who: v.author, text: v.body || '', url: v.url, review: v.state });
      const events = ev.filter(e => e.who && !BOTS.test(e.who)).sort((a, b) => a.at.localeCompare(b.at));
      const last = events[events.length - 1];
      const myLast = [...events].reverse().find(e => e.who === me);
      const afterMe = myLast ? events.filter(e => e.at > myLast.at && e.who !== me) : events.filter(e => e.who !== me);
      out.push({ repo, kind, number: t.number, title: t.title, url: t.url, state: t.state || (t.category ? 'discussion' : ''), merged: !!t.mergedAt,
        key: `${repo}#${t.number}`, mine: t.author === me, participant: events.some(e => e.who === me), last, myLast, afterMe,
        namedAfterMe: afterMe.some(e => named.test(e.text)), lastAt: last ? last.at : t.updatedAt });
    };
    for (const d of r.discussions || []) walk('discussion', d);
    for (const i of r.issues || []) walk('issue', i);
    for (const p of r.pulls || []) if (!BOTS.test(p.author)) walk('pr', p);
  }
  return out;
}

export function yourTurn({ sv, contribute, watchMap = {}, draftsDir, receiptsDir, legacyReceipts = [], posted = {}, me = 'mitchuski', staleDays = 30 }) {
  const drafts = loadDrafts(draftsDir);
  const receipts = loadReceipts(receiptsDir);
  const postedLetters = new Set([...receipts.map(r => r.id), ...Object.keys(posted)]);
  for (const f of legacyReceipts) if (existsSync(f)) for (const r of JSON.parse(readFileSync(f, 'utf8'))) postedLetters.add(r.id);
  // the single-letter drafts A–S are the 5–8 September generation: posted or superseded unless the queue still names them
  const queued = new Set([...(contribute?.ready || []), ...(contribute?.held || [])].map(r => r.draft));
  const live = (d) => !postedLetters.has(d.letter) && (queued.has(d.letter) || !/^[A-S]$/.test(d.letter));
  const draftsFor = (key) => drafts.filter(d => d.key === key && live(d));
  const all = sv ? threads(sv, me) : [];
  const byKey = Object.fromEntries(all.map(t => [t.key, t]));
  const isDone = (s) => /^DONE\b|^posted\b/i.test(s || '');
  const isHeld = (s) => /^HELD\b/i.test(s || '');
  const cat = (c, fallback) => CATS.includes(c) ? c : fallback;
  // post: the approved queue, minus what the receipts or an upstream match say went out
  const post = (contribute?.ready || []).filter(r => !isDone(r.status) && !isHeld(r.status) && !(r.draft && postedLetters.has(r.draft)))
    .map(r => ({ ...r, key: threadKey(r.url), command: r.draft && r.draft !== '—' ? `node tools/post-draft.mjs ${r.draft}` : (r.status || '').replace(/^.*run:\s*/, '') }));
  // reply: threads where the last word is someone else's and it is mine, I am in it, or I was named
  const cutoff = new Date(Date.parse(sv?.fetchedAt || Date.now()) - staleDays * 86400e3).toISOString();
  const waiting = all.filter(t => t.last && t.last.who !== me && t.afterMe.length && (t.mine || t.participant || t.namedAfterMe) && !t.merged && t.state !== 'CLOSED' && t.state !== 'MERGED')
    .map(t => ({ ...t, category: 'reply', drafts: draftsFor(t.key), reason: t.namedAfterMe ? 'named after your last word' : t.mine ? 'your thread' : 'you are in it',
      action: draftsFor(t.key).length ? `reply with draft ${draftsFor(t.key).map(d => d.letter).join(' or ')}` : 'reply — no draft yet' }))
    .sort((a, b) => b.lastAt.localeCompare(a.lastAt));
  const reply = waiting.filter(t => t.lastAt >= cutoff), stale = waiting.filter(t => t.lastAt < cutoff);
  const replyKeys = new Set(waiting.map(t => t.key));
  // the queue's own items, by their declared category: held drafts, candidates, maintenance
  const queueItems = [];
  for (const r of (contribute?.ready || []).filter(r => isHeld(r.status))) queueItems.push({ category: cat(r.category, 'contribute'), where: r.where, url: r.url, key: threadKey(r.url), why: r.why, draft: r.draft, ledger: r.ledger, action: r.action || `ruling: ${r.status}`, held: true });
  for (const r of (contribute?.held || [])) queueItems.push({ category: cat(r.category, 'contribute'), where: r.where, url: r.url, key: threadKey(r.url), why: r.reason, draft: r.draft, ledger: r.ledger, action: r.action || 'ruling needed', held: true });
  for (const r of (contribute?.candidates || [])) queueItems.push({ category: cat(r.category, /watch/i.test(r.suggest || '') ? 'discuss' : 'contribute'), where: r.where, url: r.url, key: threadKey(r.url), why: r.why, records: r.records, action: r.action || r.suggest || '' });
  for (const r of (contribute?.maintain || [])) queueItems.push({ category: 'maintain', where: r.where, url: r.url, key: threadKey(r.url), why: r.why, action: r.action || '', draft: r.draft });
  // relevant mapped threads that moved since the watermark with nobody from here in them, not already queued
  const since = sv?.since || '';
  const queuedKeys = new Set(queueItems.map(q => q.key).filter(Boolean));
  for (const t of all.filter(t => !t.participant && watchMap[t.key] && t.lastAt >= since && !t.merged && t.state !== 'CLOSED' && !queuedKeys.has(t.key)))
    queueItems.push({ category: (watchMap[t.key].cards || []).length ? 'contribute' : 'discuss', where: `${short(t.repo)} ${t.kind} #${t.number} — ${t.title}`, url: t.url, key: t.key, why: `${t.last.who} ${when(t.last.at)}: ${snip(t.last.text, 160)}`, records: (watchMap[t.key].cards || []).join(' '), action: (watchMap[t.key].cards || []).length ? 'bring the record in' : 'weigh in', moved: true, lastAt: t.lastAt });
  // a queue item on a thread that is also waiting on a reply is a reply
  for (const q of queueItems) { if (q.key && replyKeys.has(q.key) && !q.held) q.category = 'reply'; q.drafts = q.key ? draftsFor(q.key) : []; q.live = byKey[q.key]; }
  const bucket = (c) => queueItems.filter(q => q.category === c);
  const posted_ = receipts.slice().sort((a, b) => (b.postedAt || '').localeCompare(a.postedAt || ''));
  return { me, weave: contribute?.weave || '', checkedAt: sv?.fetchedAt || null, post, reply, stale, staleDays, maintain: bucket('maintain'), contribute: bucket('contribute'), discuss: bucket('discuss'), replyQueue: bucket('reply'), posted: posted_, postedMap: posted, threadCount: all.length };
}

export function yourTurnHtml(d) {
  const chip = (c) => `<span class="chip cat cat-${esc(c)}">${esc(c)}</span>`;
  const link = (t) => `<a href="${esc(t.url)}">${esc(short(t.repo))} ${esc(t.kind)} #${t.number}</a> ${esc(t.title)}`;
  const draftChips = (ds) => ds.length ? ds.map(x => ` <a class="chip draftref" href="#draft-${esc(x.letter)}">draft ${esc(x.letter)}</a> <code>node tools/post-draft.mjs ${esc(x.letter)}</code>`).join('') : '';
  const postedChip = (letter) => d.postedMap[letter] ? ` <a class="chip posted" href="${esc(d.postedMap[letter].url)}">✓ posted ${esc((d.postedMap[letter].at || '').slice(0, 10))}</a>` : '';
  const postRows = d.post.length ? '<ol>' + d.post.map(r => `<li>${chip('post')} <b>${esc(r.draft)}</b>${r.ledger == null ? '' : ` <span class="muted">ledger ${r.ledger}</span>`} → <a href="${esc(r.url)}">${esc(r.where)}</a> — ${esc(r.why)}<br><code>${esc(r.command)}</code></li>`).join('') + '</ol>' : '<p class="muted">Nothing approved is waiting.</p>';
  const replyRows = d.reply.length ? '<ul>' + d.reply.map(t => `<li>${chip('reply')} <span class="act">${esc(t.action)}</span> · ${link(t)} <span class="chip">${esc(t.reason)}</span><br><b>${esc(t.last.who)}</b> · ${esc(when(t.last.at))} UTC — ${esc(snip(t.last.text))} <a href="${esc(t.last.url)}">↗</a>${draftChips(t.drafts)}</li>`).join('') + '</ul>' : '<p class="muted">Nobody is waiting on a reply from you.</p>';
  const qRow = (q) => `<li>${chip(q.category)} <span class="act">${esc(q.action)}</span>${q.held ? ' <span class="chip">held</span>' : ''}${q.draft && q.draft !== '—' ? ` <a class="chip draftref" href="#draft-${esc(q.draft)}">draft ${esc(q.draft)}</a>${postedChip(q.draft)}` : ''}${q.ledger ? ` <span class="muted">ledger ${q.ledger}</span>` : ''} · <a href="${esc(q.url)}">${esc(q.where)}</a><br>${esc(q.why)}${q.records ? ` <span class="muted">[records ${esc(q.records)}]</span>` : ''}${q.live && q.live.last ? ` <span class="muted">· last: ${esc(q.live.last.who)} ${esc(when(q.live.last.at))}</span>` : ''}${draftChips(q.moved ? (q.drafts || []) : [])}</li>`;
  const section = (title, items, empty) => `<h4>${esc(title)} (${items.length})</h4>` + (items.length ? '<ul>' + items.map(qRow).join('') + '</ul>' : `<p class="muted">${esc(empty)}</p>`);
  const postedRows = d.posted.length ? '<ul>' + d.posted.map(r => `<li class="muted"><b>${esc(r.id)}</b> → <a href="${esc(r.url)}">${esc(r.url.replace('https://github.com/trustoverip/', ''))}</a> · ${esc(when(r.postedAt))} UTC</li>`).join('') + '</ul>' : '';
  return `<div class="panel" id="yourturn"><h3>Your turn — what to do, labelled by the act</h3>
<p class="muted">Computed ${esc(when(d.checkedAt))} UTC from the survey (${d.threadCount} open threads across the watched repositories), the drafts' thread lines, the queue, the receipts and an upstream match of every draft against your own posts. Re-run <code>board.mjs survey</code> then <code>board.mjs site</code> to refresh. Posting is your act: each command posts one letter and writes its receipt.</p>
<p>${chip('post')} an approved draft, one command · ${chip('reply')} someone spoke after your last word · ${chip('maintain')} keep your own artifacts current · ${chip('contribute')} bring a record or draft into a thread you are not in · ${chip('discuss')} weigh in on an open question, no artifact needed. <b>✓ posted</b> next to a letter means it already exists upstream — do not post it again.</p>
<h4>Post — approved, not yet out (${d.post.length})</h4>${postRows}
<h4>Reply — someone spoke after you (${d.reply.length + d.replyQueue.length})</h4>${replyRows}${d.replyQueue.length ? '<ul>' + d.replyQueue.map(qRow).join('') + '</ul>' : ''}
${section('Maintain — your own artifacts', d.maintain, 'Nothing of yours needs upkeep.')}
${section('Contribute — threads you are not in where a record or draft fits', d.contribute, 'Nothing relevant to bring in.')}${d.weave ? `<p class="muted"><b>Woven:</b> ${esc(d.weave)}</p>` : ''}
${section('Discuss — open questions to weigh in on', d.discuss, 'No open question is waiting.')}
${d.stale.length ? `<details><summary class="muted">Older — spoken after you, quiet for more than ${d.staleDays} days (${d.stale.length})</summary><ul>${d.stale.map(t => `<li class="muted">${link(t)} — ${esc(t.last.who)} ${esc(when(t.last.at))}</li>`).join('')}</ul></details>` : ''}
${d.posted.length ? `<h4>Posted from here</h4>${postedRows}` : ''}</div>`;
}
