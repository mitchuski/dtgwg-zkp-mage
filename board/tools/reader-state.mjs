// Pure reader rules, shared by the generated browser UI and Node tests.
export function storageKey(draft) {
  return `dtg-reader-v2:${draft.id}:${draft.revision}`;
}
export function isApproved(draft, state) {
  return !draft.blocked && !!draft.proverb && !!draft.ledger && !!draft.target &&
    state?.approval?.revision === draft.revision && typeof state.approval.at === 'string';
}
export function approveRevision(draft, at = new Date().toISOString()) {
  if (draft.blocked || !draft.proverb || !draft.ledger || !draft.target) throw new Error('draft-not-reviewable');
  return { revision: draft.revision, at };
}
export function publicationUrl(value, target) {
  try {
    const url = new URL(value), dest = new URL(target);
    if (url.protocol !== 'https:' || url.hostname !== 'github.com' || url.username || url.password || url.port || url.search) return null;
    const path = url.pathname.split('/').filter(Boolean), to = dest.pathname.split('/').filter(Boolean);
    if (path[0] !== to[0] || path[1] !== to[1] || !['discussions', 'issues', 'pull', 'commit'].includes(path[2])) return null;
    const expectedKind = to[2] === 'compare' ? 'pull' : to[2];
    if (path[2] !== expectedKind) return null;
    if (path[2] === 'commit') return /^[0-9a-f]{40}$/i.test(path[3] || '') && path.length === 4 ? url.href : null;
    if (path.length !== 4 || !/^\d+$/.test(path[3])) return null;
    if (['discussions', 'issues', 'pull'].includes(to[2]) && /^\d+$/.test(to[3] || '') && (path[2] !== to[2] || path[3] !== to[3])) return null;
    // Replies must identify the actual comment, not just the parent thread.
    if (/^\d+$/.test(to[3] || '') && !/^#(?:discussioncomment-|issuecomment-|discussion_r)\d+$/.test(url.hash)) return null;
    if (url.hash && !/^#(?:discussioncomment-|issuecomment-|discussion_r)\d+$/.test(url.hash)) return null;
    return url.href;
  } catch { return null; }
}
export function reportPublication(draft, state, url, at = new Date().toISOString()) {
  if (!isApproved(draft, state)) throw new Error('review-this-revision-first');
  const exactUrl = publicationUrl(url, draft.target);
  if (!exactUrl) throw new Error('use-the-exact-GitHub-post-or-comment-URL-in-the-target-repository');
  return { ...state, publication: { revision: draft.revision, url: exactUrl, reportedAt: at, verification: 'unverified' } };
}
