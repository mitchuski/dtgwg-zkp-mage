// Embedded after reader-state.mjs in the static reader; no network writes.
const readerDrafts = JSON.parse(document.getElementById('reader-data').textContent);
const readerStates = new Map();
function readState(draft) {
  try { const value = JSON.parse(localStorage.getItem(storageKey(draft)) || '{}'); return value && typeof value === 'object' ? value : {}; }
  catch { return {}; }
}
function readerMessage(card, message) { card.querySelector('.reader-message').textContent = message; }
function persist(draft, state, card) {
  readerStates.set(draft.id, state);
  try { localStorage.setItem(storageKey(draft), JSON.stringify(state)); }
  catch { readerMessage(card, 'Browser storage is unavailable. This acknowledgment lasts only for this page; export the receipt to keep it.'); }
}
function refreshDraft(draft, card) {
  const state = readerStates.get(draft.id) || {};
  const approved = isApproved(draft, state);
  card.classList.toggle('activated', approved);
  card.querySelector('[data-action="approve"]').disabled = !!draft.blocked;
  card.querySelector('[data-action="copy"]').disabled = !approved;
  card.querySelector('[data-action="report"]').disabled = !approved;
  card.querySelector('[data-action="export"]').disabled = !approved;
  const pub = state.publication?.revision === draft.revision ? state.publication : null;
  card.querySelector('.review-status').textContent = draft.blocked || (approved ? 'Reviewed — this revision' : 'Needs your review');
  const status = card.querySelector('.publication-status'); status.replaceChildren();
  if (pub && publicationUrl(pub.url, draft.target)) {
    status.append('Reported posted — unverified · ');
    const a = document.createElement('a'); a.href = pub.url; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = 'Open reported publication'; status.append(a);
    card.querySelector('.receipt-url').value = pub.url;
  } else status.textContent = 'Publication not recorded for this revision';
}
for (const draft of readerDrafts) {
  const card = document.getElementById('draft-' + draft.id);
  readerStates.set(draft.id, readState(draft));
  const prefix = 'dtg-reader-v2:' + draft.id + ':';
  try {
    const older = Object.keys(localStorage).some(key => key.startsWith(prefix) && key !== storageKey(draft));
    const legacy = localStorage.getItem('board-rite-' + draft.id) || localStorage.getItem('board-post-' + draft.id);
    if (older || legacy) readerMessage(card, 'Earlier browser records are retained. They do not approve or confirm publication of this revision.');
  } catch {}
  card.querySelector('[data-action="approve"]').addEventListener('click', () => {
    try { persist(draft, { ...readerStates.get(draft.id), approval: approveRevision(draft) }, card); refreshDraft(draft, card); }
    catch (e) { readerMessage(card, e.message); }
  });
  card.querySelector('[data-action="copy"]').addEventListener('click', async () => {
    if (!isApproved(draft, readerStates.get(draft.id))) return;
    try {
      await navigator.clipboard.writeText(card.querySelector('.body pre').textContent);
      persist(draft, { ...readerStates.get(draft.id), copiedAt: new Date().toISOString() }, card);
      readerMessage(card, 'Approved text copied. Nothing has been published by the reader.');
    } catch { readerMessage(card, 'Clipboard unavailable. The reviewed text remains visible for manual copying.'); }
  });
  card.querySelector('[data-action="report"]').addEventListener('click', () => {
    try {
      const next = reportPublication(draft, readerStates.get(draft.id), card.querySelector('.receipt-url').value.trim());
      persist(draft, next, card); refreshDraft(draft, card);
      readerMessage(card, 'Saved your report. This static reader has not fetched GitHub to verify the text or publication time.');
    } catch (e) { readerMessage(card, e.message); }
  });
  card.querySelector('[data-action="export"]').addEventListener('click', () => {
    const state = readerStates.get(draft.id); if (!isApproved(draft, state)) return;
    const approvedDraft = { ...draft, body: card.querySelector('.body pre').textContent };
    const blob = new Blob([JSON.stringify({ schema: 'dtg-reader-receipt/v2', draft: approvedDraft, state }, null, 2) + '\n'], { type: 'application/json' });
    const href = URL.createObjectURL(blob), a = document.createElement('a'); a.href = href; a.download = draft.id + '-' + draft.revision.slice(0, 12) + '-receipt.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  });
  refreshDraft(draft, card);
}
async function cp(btn) {
  try { await navigator.clipboard.writeText(btn.closest('.card').querySelector('.body pre').textContent); btn.parentElement.querySelector('.copied').textContent = 'Copied'; btn.parentElement.querySelector('.copied').style.display = 'inline'; }
  catch { btn.parentElement.querySelector('.copied').textContent = 'Clipboard unavailable; copy the visible text.'; btn.parentElement.querySelector('.copied').style.display = 'inline'; }
}
async function cpIssue(btn) {
  try { await navigator.clipboard.writeText(btn.parentElement.querySelector('pre.hidden').textContent); btn.parentElement.querySelector('.copied').textContent = 'Copied'; btn.parentElement.querySelector('.copied').style.display = 'inline'; }
  catch { btn.parentElement.querySelector('.copied').textContent = 'Clipboard unavailable.'; btn.parentElement.querySelector('.copied').style.display = 'inline'; }
}
