// yourturn.mjs — the reader's first panel: only the items the maintainer must reply to or post. Zero dependencies.
//   yourTurn({ sv, contribute, watchMap, draftsDir, receiptsDir, me })  → { post, reply, held, consider, posted }
//   yourTurnHtml(data)                                                   → the panel as HTML
// Computed from the full survey snapshot (every open thread with its comments), the drafts' `thread:` lines,
// the Contribute panel's queue, and the day's publication receipts. Read-only; nothing here posts.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const BOTS = /^(dependabot|linux-foundation-easycla|copilot|github-actions)/;
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
    out.push({ letter, file: f, title: (head.match(/^# (.*)$/m) || [])[1] || f, thread, key: threadKey(thread), ledger: (head.match(/^ledger:\s*(\d+)/m) || [])[1] || null, note: (head.match(/^note:\s*(.*)$/m) || [])[1] || '' });
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

export function yourTurn({ sv, contribute, watchMap = {}, draftsDir, receiptsDir, legacyReceipts = [], me = 'mitchuski', staleDays = 30 }) {
  const drafts = loadDrafts(draftsDir);
  const receipts = loadReceipts(receiptsDir);
  const postedLetters = new Set(receipts.map(r => r.id));
  for (const f of legacyReceipts) if (existsSync(f)) for (const r of JSON.parse(readFileSync(f, 'utf8'))) postedLetters.add(r.id);
  // the single-letter drafts A–S are the 5–8 September generation: posted or superseded unless the queue still names them
  const queued = new Set([...(contribute?.ready || []), ...(contribute?.held || [])].map(r => r.draft));
  const live = (d) => !postedLetters.has(d.letter) && (queued.has(d.letter) || !/^[A-S]$/.test(d.letter));
  const draftsFor = (key) => drafts.filter(d => d.key === key && live(d));
  const all = sv ? threads(sv, me) : [];
  const isDone = (s) => /^DONE\b|^posted\b/i.test(s || '');
  const isHeld = (s) => /^HELD\b/i.test(s || '');
  // 1 · post: the approved queue, minus what the receipts say went out
  const post = (contribute?.ready || []).filter(r => !isDone(r.status) && !isHeld(r.status) && !(r.draft && postedLetters.has(r.draft)))
    .map(r => ({ ...r, key: threadKey(r.url), command: r.draft && r.draft !== '—' ? `node tools/post-draft.mjs ${r.draft}` : (r.status || '').replace(/^.*run:\s*/, '') }));
  // 2 · reply: threads where the last word is someone else's and it is mine, I am in it, or I was named
  const cutoff = new Date(Date.parse(sv?.fetchedAt || Date.now()) - staleDays * 86400e3).toISOString();
  const waiting = all.filter(t => t.last && t.last.who !== me && t.afterMe.length && (t.mine || t.participant || t.namedAfterMe) && !t.merged && t.state !== 'CLOSED' && t.state !== 'MERGED')
    .map(t => ({ ...t, drafts: draftsFor(t.key), reason: t.namedAfterMe ? 'named after your last word' : t.mine ? 'your thread' : 'you are in it' }))
    .sort((a, b) => b.lastAt.localeCompare(a.lastAt));
  const reply = waiting.filter(t => t.lastAt >= cutoff), stale = waiting.filter(t => t.lastAt < cutoff);
  // 3 · held: the queue items that need a ruling
  const held = [...(contribute?.ready || []).filter(r => isHeld(r.status)).map(r => ({ draft: r.draft, ledger: r.ledger, where: r.where, url: r.url, reason: r.status })), ...(contribute?.held || [])];
  // 4 · consider: relevant, mapped threads that moved since the watermark, with nobody from here in them
  const since = sv?.since || '';
  const consider = all.filter(t => !t.participant && watchMap[t.key] && t.lastAt >= since && !t.merged && t.state !== 'CLOSED')
    .map(t => ({ ...t, feeds: watchMap[t.key], drafts: draftsFor(t.key) })).sort((a, b) => b.lastAt.localeCompare(a.lastAt)).slice(0, 8);
  const posted = receipts.slice().sort((a, b) => (b.postedAt || '').localeCompare(a.postedAt || ''));
  return { me, checkedAt: sv?.fetchedAt || null, post, reply, stale, staleDays, held, consider, posted, threadCount: all.length };
}

export function yourTurnHtml(d) {
  const link = (t) => `<a href="${esc(t.url)}">${esc(short(t.repo))} ${esc(t.kind)} #${t.number}</a> ${esc(t.title)}`;
  const draftChips = (ds) => ds.length ? ds.map(x => ` <a class="chip draftref" href="#draft-${esc(x.letter)}">draft ${esc(x.letter)}</a> <code>node tools/post-draft.mjs ${esc(x.letter)}</code>`).join('') : ' <span class="muted">no draft yet</span>';
  const postRows = d.post.length ? '<ol>' + d.post.map(r => `<li><b>${esc(r.draft)}</b>${r.ledger == null ? '' : ` <span class="muted">ledger ${r.ledger}</span>`} → <a href="${esc(r.url)}">${esc(r.where)}</a> — ${esc(r.why)}<br><code>${esc(r.command)}</code></li>`).join('') + '</ol>' : '<p class="muted">Nothing approved is waiting.</p>';
  const replyRows = d.reply.length ? '<ul>' + d.reply.map(t => `<li>${link(t)} <span class="chip">${esc(t.reason)}</span><br><b>${esc(t.last.who)}</b> · ${esc(when(t.last.at))} UTC — ${esc(snip(t.last.text))} <a href="${esc(t.last.url)}">↗</a>${draftChips(t.drafts)}</li>`).join('') + '</ul>' : '<p class="muted">Nobody is waiting on a reply from you.</p>';
  const heldRows = d.held.length ? '<ul>' + d.held.map(r => `<li><b>${esc(r.draft)}</b>${r.ledger == null ? '' : ` <span class="muted">ledger ${r.ledger}</span>`} · <a href="${esc(r.url)}">${esc(r.where)}</a> — ${esc(r.reason)}</li>`).join('') + '</ul>' : '';
  const considerRows = d.consider.length ? '<ul>' + d.consider.map(t => `<li>${link(t)} — <b>${esc(t.last.who)}</b> ${esc(when(t.last.at))}: ${esc(snip(t.last.text, 140))} <span class="muted">[cards ${esc((t.feeds.cards || []).join(' ') || '—')}]</span>${draftChips(t.drafts)}</li>`).join('') + '</ul>' : '<p class="muted">Nothing relevant moved without you.</p>';
  const postedRows = d.posted.length ? '<ul>' + d.posted.map(r => `<li class="muted"><b>${esc(r.id)}</b> → <a href="${esc(r.url)}">${esc(r.url.replace('https://github.com/trustoverip/', ''))}</a> · ${esc(when(r.postedAt))} UTC</li>`).join('') + '</ul>' : '';
  return `<div class="panel" id="yourturn"><h3>Your turn — reply or post. Nothing else.</h3>
<p class="muted">Computed ${esc(when(d.checkedAt))} UTC from the survey (${d.threadCount} open threads across the watched repositories), the drafts' thread lines, the approved queue and the receipts. Re-run <code>board.mjs survey</code> then <code>board.mjs site</code> to refresh. Posting is your act: each command below posts one letter and writes its receipt.</p>
<h4>1 · Post — approved, not yet out (${d.post.length})</h4>${postRows}
<h4>2 · Reply — someone spoke after you (${d.reply.length})</h4>${replyRows}
${d.held.length ? `<h4>3 · Held — needs your ruling (${d.held.length})</h4>${heldRows}` : ''}
<h4>${d.held.length ? 4 : 3} · Consider — relevant threads that moved without you (${d.consider.length})</h4>${considerRows}
${d.stale.length ? `<details><summary class="muted">Older — spoken after you, quiet for more than ${d.staleDays} days (${d.stale.length})</summary><ul>${d.stale.map(t => `<li class="muted">${link(t)} — ${esc(t.last.who)} ${esc(when(t.last.at))}</li>`).join('')}</ul></details>` : ''}
${d.posted.length ? `<h4>Posted from here</h4>${postedRows}` : ''}</div>`;
}
