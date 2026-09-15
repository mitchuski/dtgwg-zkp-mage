// posted.mjs — which drafts already exist upstream. Zero dependencies, read-only.
//   detectPosted({ sv, drafts, receipts, me }) → { [letter]: { url, at, how: 'receipt' | 'match' | 'receipt+match', score } }
// A draft counts as posted when a receipt names it, or when a post by the maintainer in the draft's target thread
// (or, for a new-thread draft, a thread the maintainer opened in that repository) matches its body: the same opening,
// or a word-set overlap above the threshold. Edits made at posting time (an inserted link, an appended line) still match.
const norm = (s) => (s || '').toLowerCase().replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/https?:\/\/\S+/g, ' ').replace(/[`*_>#|]/g, ' ').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
const words = (s) => new Set(norm(s).split(' ').filter(w => w.length > 3));
export function similarity(a, b) {
  const A = words(a), B = words(b);
  if (!A.size || !B.size) return 0;
  let both = 0; for (const w of A) if (B.has(w)) both++;
  return both / Math.min(A.size, B.size);           // containment: a draft posted with additions still scores high
}
const sameOpening = (a, b) => { const x = norm(a).slice(0, 140), y = norm(b).slice(0, 140); return x.length > 60 && x === y; };
const repoOf = (url) => ((url || '').match(/github\.com\/[^/]+\/([^/?#]+)/) || [])[1] || null;
const keyOf = (url) => { const m = (url || '').match(/github\.com\/[^/]+\/([^/]+)\/(?:discussions|issues|pull)\/(\d+)/); return m ? `${m[1]}#${m[2]}` : null; };

// the maintainer's own posts upstream: [{ key, repo, url, at, body, kind }]
export function myPosts(sv, me) {
  const out = [];
  for (const [repo, r] of Object.entries(sv?.repos || {})) {
    if (r.error) continue;
    const push = (t, url, at, body, kind) => out.push({ key: `${repo}#${t.number}`, repo, url, at, body: body || '', kind });
    for (const d of r.discussions || []) {
      if (d.author === me) push(d, d.url, d.createdAt, d.body, 'discussion');
      for (const c of d.comments || []) { if (c.author === me) push(d, c.url, c.at, c.body, 'comment'); for (const x of c.replies || []) if (x.author === me) push(d, x.url, x.at, x.body, 'reply'); }
    }
    for (const i of r.issues || []) { if (i.author === me) push(i, i.url, i.createdAt, i.body, 'issue'); for (const c of i.comments || []) if (c.author === me) push(i, c.url, c.at, c.body, 'comment'); }
    for (const p of r.pulls || []) { if (p.author === me) push(p, p.url, p.createdAt, p.body, 'pr'); for (const c of p.comments || []) if (c.author === me) push(p, c.url, c.at, c.body, 'comment'); for (const v of p.reviews || []) if (v.author === me && v.body) push(p, v.url, v.at, v.body, 'review'); }
  }
  return out;
}

export function detectPosted({ sv, drafts, receipts = [], me = 'mitchuski', threshold = 0.6 }) {
  const posts = myPosts(sv, me);
  const out = {};
  for (const r of receipts) if (r.id && r.url) out[r.id] = { url: r.url, at: r.postedAt || r.verifiedAt || null, how: 'receipt', score: 1 };
  for (const d of drafts) {
    if (!d.body) continue;
    const key = keyOf(d.thread), repo = repoOf(d.thread);
    const isNewThread = !key && repo;                                   // …/discussions/new, …/compare/…
    const candidates = posts.filter(p => key ? p.key === key : (isNewThread && p.repo === repo && (p.kind === 'discussion' || p.kind === 'pr')));
    let best = null;
    for (const p of candidates) {
      const score = sameOpening(d.body, p.body) ? 1 : similarity(d.body, p.body);
      if (score >= threshold && (!best || score > best.score)) best = { url: p.url, at: p.at, how: 'match', score: Number(score.toFixed(2)) };
    }
    if (best) out[d.letter] = out[d.letter] ? { ...out[d.letter], how: 'receipt+match', score: best.score, matchUrl: best.url } : best;
  }
  return out;
}
