import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, cpSync, readFileSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { draftRevision, exactTarget, buildSite, loadCards } from './tools/board.mjs';
import { storageKey, approveRevision, isApproved, publicationUrl, reportPublication } from './tools/reader-state.mjs';
import { drainConnection, collectRepository, repositoryWatermark, digestSurvey, watchHtml } from './tools/watch.mjs';
import { head, footerFor, saveSnapshot, loadSnapshot } from '../tools/ledger-history.mjs';
const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const temp = mkdtempSync(join(tmpdir(), 'dtg-reader-review-'));
test.after(() => { if (!resolve(temp).startsWith(resolve(tmpdir()) + sep) || !temp.includes('dtg-reader-review-')) throw new Error('unsafe-test-cleanup'); rmSync(temp, { recursive: true }); });
const base = { id: 'R', body: 'first version', title: 'proposal', target: 'https://github.com/trustoverip/dtgwg-zkp-tf/discussions/new', proverb: 'Review what travels.', ledger: 32, blocked: '' };
const bind = draft => ({ ...draft, revision: draftRevision(draft) });
test('approval is invalidated by changed text, target, proverb and prerequisites', () => {
  const draft = bind(base), state = { approval: approveRevision(draft) }; assert.ok(isApproved(draft, state));
  for (const change of [{ body: 'different' }, { title: 'different' }, { target: 'https://github.com/trustoverip/dtgwg-cred-tf/discussions/new' }, { proverb: 'Different intent.' }, { prerequisites: ['new prerequisite'] }, { sourceContext: { threadUpdatedAt: 'new activity' } }]) {
    const next = bind({ ...base, ...change }); assert.notEqual(storageKey(next), storageKey(draft)); assert.equal(isApproved(next, state), false);
  }
});
test('held, unserved and destinationless drafts cannot be approved', () => {
  for (const change of [{ blocked: 'Held' }, { ledger: null }, { proverb: '' }, { target: '' }]) assert.throws(() => approveRevision(bind({ ...base, ...change })));
});
test('approval and copying never imply publication; reports remain unverified', () => {
  const draft = bind(base), state = { approval: approveRevision(draft), copiedAt: new Date().toISOString() };
  assert.equal(state.publication, undefined);
  const next = reportPublication(draft, state, 'https://github.com/trustoverip/dtgwg-zkp-tf/discussions/90'); assert.equal(next.publication.verification, 'unverified');
  assert.throws(() => reportPublication(draft, {}, next.publication.url));
});
test('receipt rejects wrong repo, wrong kind, wrong thread, parent-only comment and unsafe URLs', () => {
  const target = 'https://github.com/trustoverip/dtgwg-cred-spec/issues/38';
  for (const url of ['https://github.com/trustoverip/dtgwg-cred-spec/issues/39#issuecomment-1', 'https://github.com/trustoverip/dtgwg-cred-spec/issues/38', 'https://github.com/other/repo/issues/38#issuecomment-1', 'https://github.com/trustoverip/dtgwg-cred-spec/pull/38#issuecomment-1', 'javascript:alert(1)', 'https://github.com@evil.test/trustoverip/dtgwg-cred-spec/issues/38#issuecomment-1']) assert.equal(publicationUrl(url, target), null);
  assert.ok(publicationUrl(target + '#issuecomment-123', target));
  assert.equal(publicationUrl('https://github.com/trustoverip/dtgwg-zkp-tf/issues/90', base.target), null);
  assert.equal(exactTarget(base.target + ' (as a comment)'), '');
});
test('reader follows P/R/K/N order, archives superseded drafts and embeds no approval from ledger', () => {
  const html = buildSite(loadCards());
  const positions = ['P', 'R', 'K', 'N'].map(id => html.indexOf('id="draft-' + id + '"'));
  assert.ok(positions.every((n,i) => n > 0 && (!i || n > positions[i-1])));
  const data = JSON.parse(html.match(/id="reader-data">([\s\S]*?)<\/script>/)[1]);
  assert.match(data.find(d => d.id === 'H').blocked, /Superseded/);
  assert.match(data.find(d => d.id === 'Q').blocked, /reference/);
  assert.equal(html.includes('data-posted='), false);
  assert.ok(data.every(d => d.blocked || exactTarget(d.target)));
});
test('pagination traverses all pages and refuses stalled cursors', async () => {
  const result = await drainConnection({ nodes: [1], pageInfo: { hasNextPage: true, endCursor: 'a' } }, async cursor => { assert.equal(cursor, 'a'); return { nodes: [2], pageInfo: { hasNextPage: false } }; });
  assert.deepEqual(result.nodes, [1,2]);
  await assert.rejects(drainConnection({ nodes: [], pageInfo: { hasNextPage: true, endCursor: 'a' } }, async () => ({ nodes: [], pageInfo: { hasNextPage: true, endCursor: 'a' } })), /stalled/);
});
test('collector follows nested reply, comment and outer repository pages', async () => {
  const conn = (nodes, cursor) => ({ nodes, pageInfo: { hasNextPage: !!cursor, endCursor: cursor } });
  const calls = [];
  const repo = await collectRepository(async (query, vars) => {
    calls.push(vars);
    if (!vars.after) return { repository: { discussions: conn([{ id: 'd1', comments: conn([{ id: 'c1', replies: conn([], 'r2') }], 'c2') }], 'd2'), pullRequests: conn([]), issues: conn([]) } };
    if (vars.after === 'd2') return { repository: { discussions: conn([{ id: 'd2', comments: conn([]) }]) } };
    if (vars.after === 'c2') return { node: { comments: conn([{ id: 'c2', replies: conn([]) }]) } };
    if (vars.after === 'r2') return { node: { replies: conn([{ id: 'r2' }]) } };
    throw new Error('unexpected query');
  }, 'test');
  assert.equal(repo.discussions.nodes.length, 2); assert.equal(repo.discussions.nodes[0].comments.nodes.length, 2);
  assert.equal(repo.discussions.nodes[0].comments.nodes[0].replies.nodes[0].id, 'r2'); assert.equal(calls.length, 4);
});
test('failed repositories retain the successful watermark across repeated failures', () => {
  const previous = { fetchedAt: '2026-09-07', since: '2026-09-01', repos: { failed: { error: 'network', since: '2026-09-02', lastSuccessfulAt: '2026-09-02' }, good: { lastSuccessfulAt: '2026-09-07' } } };
  assert.equal(repositoryWatermark(previous, 'failed', null, 'fallback'), '2026-09-02');
  assert.equal(repositoryWatermark(previous, 'good', null, 'fallback'), '2026-09-07');
  assert.equal(repositoryWatermark(previous, 'failed', '2026-08-01', 'fallback'), '2026-08-01');
  const failedOnly = { ...previous, repos: { failed: previous.repos.failed } };
  const items = digestSurvey(failedOnly); assert.match(watchHtml(items, failedOnly), /Refresh incomplete/);
});
test('PR edits without new comments remain in the watch', () => {
  const sv = { since: '2026-09-05', fetchedAt: '2026-09-07', repos: { r: { discussions: [], issues: [], pulls: [{ number: 1, title: 'proof', url: 'u', author: 'a', state: 'OPEN', createdAt: '2026-09-01', updatedAt: '2026-09-06', comments: [], reviews: [] }] } } };
  assert.equal(digestSurvey(sv).length, 1);
});
test('historical approval footer stays stable and refuses edited approved entries', () => {
  const ledger = { domain: 'test', entries: [{ seq: 1, proverb: 'first', activated: true }, { seq: 2, proverb: 'second', activated: null }] };
  const snapshot = structuredClone(ledger), first = footerFor(ledger, 1, snapshot).lines;
  ledger.entries[1].activated = true; assert.deepEqual(footerFor(ledger, 1, snapshot).lines, first);
  assert.notEqual(head(ledger), head(snapshot)); const digest = saveSnapshot(temp, snapshot); assert.deepEqual(loadSnapshot(temp, digest), snapshot);
  ledger.entries[0].proverb = 'rewritten'; assert.equal(footerFor(ledger, 1, snapshot).ok, false);
  assert.equal(footerFor(snapshot, 1).ok, false);
});
test('CLI snapshots new approvals and verifies an old head after a later activation', () => {
  const dir = join(temp, 'ledger-cli'); mkdirSync(join(dir, 'tools'), { recursive: true });
  for (const f of ['push-rite.mjs', 'ledger-history.mjs']) cpSync(join(root, 'tools', f), join(dir, 'tools', f));
  writeFileSync(join(dir, 'proverb-ledger.json'), JSON.stringify({ domain: 'test', entries: [{ seq: 1, proverb: 'first', activated: null }, { seq: 2, proverb: 'second', activated: null }] }));
  const cli = (...args) => execFileSync(process.execPath, [join(dir, 'tools/push-rite.mjs'), ...args], { encoding: 'utf8' });
  cli('speak', '1'); const first = cli('footer', '1'); cli('speak', '2'); assert.equal(cli('footer', '1'), first);
  assert.match(cli('verify', first.match(/Ledger-Head: (\w+)/)[1]), /historical/);
});
test('conformance refuses edited generated prose, missing body and tampered/obsolete terms; regeneration restores consistency', async () => {
  const dir = join(temp, 'spec'); const source = resolve(root, '../dtgwg-zkp-spec');
  cpSync(join(source, 'conformance'), join(dir, 'conformance'), { recursive: true }); cpSync(join(source, 'spec'), join(dir, 'spec'), { recursive: true });
  const run = () => spawnSync(process.execPath, [join(dir, 'conformance/test.mjs')], { encoding: 'utf8' });
  assert.equal(run().status, 0);
  const bodyPath = join(dir, 'spec/body.md'), original = readFileSync(bodyPath, 'utf8');
  writeFileSync(bodyPath, original.replace('### Construction 001', '### EDITED Construction 001')); assert.notEqual(run().status, 0);
  execFileSync(process.execPath, [join(dir, 'conformance/generate.mjs')]); assert.equal(run().status, 0);
  writeFileSync(bodyPath, original.split('\n')[0] + '\nUnrelated text'); assert.notEqual(run().status, 0); writeFileSync(bodyPath, original);
  writeFileSync(join(dir, 'spec/terms-definitions/g-horizon.md'), 'tampered'); assert.notEqual(run().status, 0);
  writeFileSync(join(dir, 'spec/terms-definitions/g-obsolete.md'), 'obsolete'); assert.notEqual(run().status, 0);
  execFileSync(process.execPath, [join(dir, 'conformance/generate.mjs')]); assert.equal(run().status, 0);
  // Editing an editor-written paragraph is allowed and must survive regeneration. The heading has to be one that is
  // still in body.md and outside every generated region: the Cryptographic Background is its own chapter file now,
  // and an edit made to a heading that is not there is a silent no-op rather than a test.
  const anchor = '## Governance Considerations';
  assert.ok(original.includes(anchor), `editor-owned anchor missing from body.md: ${anchor}`);
  const edited = original.replace(anchor, `${anchor}\n\nEditor-owned clarification.`); writeFileSync(bodyPath, edited);
  execFileSync(process.execPath, [join(dir, 'conformance/generate.mjs')]); assert.ok(readFileSync(bodyPath, 'utf8').includes('Editor-owned clarification.')); assert.equal(run().status, 0);
});
