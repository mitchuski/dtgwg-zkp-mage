#!/usr/bin/env node
// post-draft.mjs — publish one board draft to its GitHub destination and record the receipt. Zero-dep; uses `gh`.
//
//   node tools/post-draft.mjs <letter> [--dry] [--receipts <file>]
//
// Reads board/drafts/<letter>-*.md, takes the body after the first `---` line, and posts it to the draft's
// `thread:` URL: a discussion → a reply (GraphQL addDiscussionComment); an issue or pull request → a comment (REST).
// A receipt {id, url, nodeId, bodySha256, postedAt, ledger} is appended to the receipts file (default
// board/survey/publication-<today>.json). Refuses if a receipt for the letter already exists (no duplicate posts).
// Posting is the maintainer's act: run this only on the maintainer's explicit approval of that letter.
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..');
const DRAFTS = join(REPO, 'board', 'drafts');
const argv = process.argv.slice(2);
const letter = argv.find(a => /^[A-Z]{1,2}$/.test(a));
const dry = argv.includes('--dry');
const argOf = n => { const i = argv.indexOf(n); return i > 0 ? argv[i + 1] : undefined; };
const today = new Date().toISOString().slice(0, 10);
const RECEIPTS = argOf('--receipts') || join(REPO, 'board', 'survey', `publication-${today}.json`);
const refuse = code => { console.log(`REFUSED ${code}`); process.exit(1); };
if (!letter) refuse('no-letter');

const file = readdirSync(DRAFTS).find(f => f.startsWith(letter + '-') && f.endsWith('.md'));
if (!file) refuse(`no-draft:${letter}`);
const text = readFileSync(join(DRAFTS, file), 'utf8').replace(/\r\n/g, '\n');
const head = text.split('\n---\n')[0];
const body = text.slice(head.length + 5).trim() + '\n';
const thread = (head.match(/^thread:\s*(\S+)/m) || [])[1];
const ledger = (head.match(/^ledger:\s*(\d+)/m) || [])[1] || null;
if (!thread) refuse('draft-has-no-thread-line');
if (/\[[^\]]*(placeholder|TODO|insert)[^\]]*\]/i.test(body)) refuse('draft-has-placeholder');
const m = thread.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/(discussions|issues|pull)\/(\d+)/);
if (!m) refuse(`thread-not-github:${thread}`);
const [, owner, repo, kind, number] = m;
const sha = createHash('sha256').update(body, 'utf8').digest('hex');

const receipts = existsSync(RECEIPTS) ? JSON.parse(readFileSync(RECEIPTS, 'utf8')) : [];
if (receipts.some(r => r.id === letter)) refuse(`already-posted:${letter} (${receipts.find(r => r.id === letter).url})`);

console.log(`${letter} → ${kind} ${owner}/${repo}#${number} · ${body.length} chars · sha256 ${sha.slice(0, 16)}… · ledger ${ledger}`);
if (dry) { console.log('--- body ---\n' + body); process.exit(0); }

const gh = (args, input) => execFileSync('gh', args, { encoding: 'utf8', input, maxBuffer: 1 << 24 });
let url, nodeId;
if (kind === 'discussions') {
  const q1 = `query($o:String!,$r:String!,$n:Int!){repository(owner:$o,name:$r){discussion(number:$n){id}}}`;
  const d = JSON.parse(gh(['api', 'graphql', '-f', `query=${q1}`, '-F', `o=${owner}`, '-F', `r=${repo}`, '-F', `n=${number}`]));
  const discussionId = d.data.repository.discussion.id;
  const q2 = `mutation($d:ID!,$b:String!){addDiscussionComment(input:{discussionId:$d,body:$b}){comment{id url}}}`;
  const r = JSON.parse(gh(['api', 'graphql', '-f', `query=${q2}`, '-F', `d=${discussionId}`, '-F', 'b=@-'], body));
  if (!r.data?.addDiscussionComment?.comment) refuse(`graphql:${JSON.stringify(r).slice(0, 300)}`);
  ({ url, id: nodeId } = r.data.addDiscussionComment.comment);
} else {
  const r = JSON.parse(gh(['api', `repos/${owner}/${repo}/issues/${number}/comments`, '-X', 'POST', '-F', 'body=@-'], body));
  if (!r.html_url) refuse(`rest:${JSON.stringify(r).slice(0, 300)}`);
  url = r.html_url; nodeId = r.node_id;
}
receipts.push({ id: letter, url, nodeId, bodySha256: sha, postedAt: new Date().toISOString(), ledger: ledger ? Number(ledger) : null, draft: file });
writeFileSync(RECEIPTS, JSON.stringify(receipts, null, 1) + '\n');
console.log(`posted ${letter} → ${url}\nreceipt → ${RECEIPTS}`);
