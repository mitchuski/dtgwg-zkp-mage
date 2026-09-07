#!/usr/bin/env node
// confluence-build-agenda.mjs — build the proposed 2026-09-08 meeting-notes body in Confluence storage format,
// by editing the pulled page rather than writing one from scratch: the agenda table and the Reference Links list are
// replaced, everything else (antitrust text, Zoom section, screenshots, existing task lists) is carried through
// byte-for-byte. Zero-dep. Writes a file; never touches Confluence.
//
//   node tools/confluence-build-agenda.mjs calls/2026-09-08
//
// Output: <dir>/confluence-update.storage.xml  — the whole page body, ready for an authenticated PUT
//         (tools/confluence-page.mjs push) or for a reviewer to diff against page-1132953601.storage.xml.

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

const DIR = process.argv[2] || 'calls/2026-09-08';
const SRC = join(DIR, 'page-1132953601.storage.xml');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// inline markup for cell text: **bold**, *italic*, [text](url), `code`
function inline(s) {
  let t = esc(s);
  t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, txt, url) => `<a href="${esc(url)}">${txt}</a>`);
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/(^|[\s(])\*([^*]+)\*/g, '$1<em>$2</em>');
  t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
  return t;
}
const cell = (paras, highlight) =>
  `<td${highlight ? ' data-highlight-colour="#f0f0f0"' : ''}>${paras.map((p) => `<p>${inline(p)}</p>`).join('')}</td>`;
const rowOf = (cells, highlight) => `<tr>${cells.map((c) => cell(Array.isArray(c) ? c : [c], highlight)).join('')}</tr>`;

// ---- the antitrust cell is carried through verbatim from the source ---------------------------
const src = readFileSync(SRC, 'utf8');
const antiAt = src.indexOf('Antitrust Policy Notice');
const antiFrom = antiAt < 0 ? -1 : src.lastIndexOf('<td', antiAt);
const antiTo = antiAt < 0 ? -1 : src.indexOf('</td>', antiAt) + '</td>'.length;   // <td> is not nested in this page
if (antiAt < 0 || antiFrom < 0 || antiTo <= antiFrom) { console.log('REFUSED antitrust-cell-not-found (source page changed shape — check before building)'); process.exit(1); }
const antitrustCell = src.slice(antiFrom, antiTo).replace(/\s(ac:)?local-id="[^"]*"/g, '');

// ---- rows ------------------------------------------------------------------------------------
const R = [
  ['3 min',
    ['Start recording', 'Welcome & antitrust notice', 'Introduction of new members', 'Agenda review'],
    'Chairs', null],
  ['5 min',
    ['Welcome the Berkeley team and frame the session'],
    'Scott / Mitchell',
    ['Introductions. Goal today: agree the first proof to build and how a construction gets chosen for it.',
     'The prioritized list of requested proofs is [discussion #18](https://github.com/trustoverip/dtgwg-zkp-tf/discussions/18). The written form of each request is now a **construction record** in the specification draft: statement, witness, public inputs, method, disclosure set, what it does not establish, adversary, horizon, fixtures, construction options. Today\'s decisions go back into both.']],
  ['8 min',
    ['First proof: ADR-001 Community-Anchored Proof'],
    'Scott',
    ['Validated as the first step: small enough to build, specific enough that passing it proves something real.',
     'Written up as **request ADR-001** — a 31-row crosswalk from Glenn\'s clauses to the record\'s fields — and **construction record 010**, state *carded*: the form is complete, the costs are labelled conjecture rather than measurement.',
     'The hard clause, proving the voucher\'s community membership while they are offline, is answered by set membership over an accredited root plus issuance evidence, not by the voucher\'s live participation. It is the genuine test and the sharpest thing to put to the authors.']],
  ['12 min',
    ['Construction selection'],
    'Mitchell / Denys',
    ['Four candidates, now written on one form so they compare field by field — what the entry claims, what it was measured on, who measured it, whether anyone else reproduced it:',
     '**Hand-roll** against [ePrint 2026/333](https://eprint.iacr.org/2026/333) · **Longfellow via SIROS** ([#17](https://github.com/trustoverip/dtgwg-zkp-tf/discussions/17)), entered *as signed* rather than as verified by us · **Circom/Groth16**, the only candidate needing a per-circuit ceremony · **ProveKit** (World), client-side and mobile-first, which fits the ADR-001 requirement that a phone can produce the proof.',
     'Proposed fifth candidate: **Flock**, a binary-field system that proves *standard* hashes at under 250× native. It matters because the credential side settled on JCS-SHA-256 digests, and a standard hash opened inside a circuit is the cost driver we have been calling X3.',
     'Denys to walk through the prior investigation and the zk-kit read. Ties to [#12](https://github.com/trustoverip/dtgwg-zkp-tf/discussions/12).',
     '**Proposed rule to ratify:** no proving system is written as RECOMMENDED in the specification until its result has been reproduced on a second machine by an independent party.']],
  ['8 min',
    ['Modifications and specific questions'],
    'Mitchell',
    ['What the framework or construction would need to change to carry ADR-001. Work through the curated questions from the Berkeley questions package, each tied to the record field it would change.']],
  ['6 min',
    ['Where the work lands: three repositories and a draft specification'],
    'Mitchell',
    ['`dtgwg-zkp-tf` holds requirements, drafting rules and decisions. **`dtgwg-zkp-spec`** holds the specification and its conformance apparatus; a populated draft is ready to open as a pull request. The evidence repository holds runtimes, fixtures, the reproduction registry and the generator. Records travel between them; dependencies do not.',
     'Generated sections carry a digest of the records they were produced from, and continuous integration fails if the prose drifts from the data it claims to describe.',
     '**Ask of the task force: shape objections first** — chapter order, record form, the conformance apparatus. Content objections per construction go to issues or discussions.']],
  ['5 min',
    ['Cross-task-force item: blinded binders'],
    'Mitchell',
    ['[cred-spec #38](https://github.com/trustoverip/dtgwg-cred-spec/issues/38), filed 5 September, says every digest-valued binder is an unsalted digest over often low-entropy content, and asks for coordination with this task force\'s Q2. That is **record 008**, carded from the two routes Scott put on the record in [cred-tf #39](https://github.com/trustoverip/dtgwg-cred-tf/discussions/39).',
     'Three things the credential layer must decide before it is buildable: enough entropy in the preimage, the salt inside the hashed block, one agreed encoding. One sentence worth adding to WD03: a credential must not carry a blinded binder **and** its plaintext.']],
  ['5 min',
    ['Open Items'],
    'All',
    ['Denys probabilistic-sampling prototype.',
     'Verified Trust Agents: an agent proves it acts for a member within a granted scope, without revealing which member — **record 020**. Its credential merged 6 September ([cred-spec PR #19](https://github.com/trustoverip/dtgwg-cred-spec/pull/19), acceptance required, directed delegator identifier). [PR #21](https://github.com/trustoverip/dtgwg-zkp-tf/pull/21) `AGENT-RUNTIMES.md` has had no reviewer since 29 August — **asking for one**.',
     'Measurement queue: construction 001 over a BLAKE3 Merkle tree; construction 007\'s compile. Both are cost lines the records currently label as conjecture.']],
  ['4 min',
    ['Close'],
    'Mitchell',
    ['Review decisions and action items; agree next step.']],
];

const header = `<tr>${['Time', 'Agenda Item', 'Lead', 'Notes'].map((h) => cell([h], true)).join('')}</tr>`;
const body = R.map(([time, item, lead, notes], i) => {
  const cells = [cell([time]), cell(item), cell([lead])];
  cells.push(i === 0 ? antitrustCell : cell(notes || ['']));   // row 0's notes cell is the source's own, bio-page line included
  return `<tr>${cells.join('')}</tr>`;
}).join('');

const colgroup = '<colgroup><col style="width: 74.0px;" /><col style="width: 304.0px;" /><col style="width: 177.0px;" /><col style="width: 853.0px;" /></colgroup>';
const newTable = `<table data-table-width="1408" data-layout="center">${colgroup}<tbody>${header}${body}</tbody></table>`;

// ---- reference links -------------------------------------------------------------------------
const REFS = [
  'Task force repository: [https://github.com/trustoverip/dtgwg-zkp-tf](https://github.com/trustoverip/dtgwg-zkp-tf)',
  '**Specification repository:** [https://github.com/trustoverip/dtgwg-zkp-spec](https://github.com/trustoverip/dtgwg-zkp-spec) — set up 2 September on the ToIP Spec-Up-T template; rendered output publishes to [https://trustoverip.github.io/dtgwg-zkp-spec/](https://trustoverip.github.io/dtgwg-zkp-spec/)',
  'Requirements draft (**v0.4**): [https://github.com/trustoverip/dtgwg-zkp-tf/blob/main/proof-of-liveness-requirements.md](https://github.com/trustoverip/dtgwg-zkp-tf/blob/main/proof-of-liveness-requirements.md)',
  'Drafting rules: [https://github.com/trustoverip/dtgwg-zkp-tf/blob/main/DRAFTING-RULES.md](https://github.com/trustoverip/dtgwg-zkp-tf/blob/main/DRAFTING-RULES.md)',
  'Decisions to ratify: [https://github.com/trustoverip/dtgwg-zkp-tf/discussions/10](https://github.com/trustoverip/dtgwg-zkp-tf/discussions/10)',
  'Prioritized list of requested proofs: [https://github.com/trustoverip/dtgwg-zkp-tf/discussions/18](https://github.com/trustoverip/dtgwg-zkp-tf/discussions/18)',
  '"What counts as a context?": [https://github.com/trustoverip/dtgwg-zkp-tf/discussions/8](https://github.com/trustoverip/dtgwg-zkp-tf/discussions/8)',
  'SIROS work on ZKP circuits: [https://github.com/trustoverip/dtgwg-zkp-tf/discussions/17](https://github.com/trustoverip/dtgwg-zkp-tf/discussions/17)',
  'Agent runtimes, open and needing a reviewer: [https://github.com/trustoverip/dtgwg-zkp-tf/pull/21](https://github.com/trustoverip/dtgwg-zkp-tf/pull/21)',
  'Predicate & Assurance-Boundary decision document (first draft) — *link needed*',
  'Cross-task-force: ZKP work items on the record [cred-tf #39](https://github.com/trustoverip/dtgwg-cred-tf/discussions/39) · the artifact gap and delegation [cred-tf #40](https://github.com/trustoverip/dtgwg-cred-tf/discussions/40) · blinded binders [cred-spec #38](https://github.com/trustoverip/dtgwg-cred-spec/issues/38) · verifiable delegation credential, merged [cred-spec #19](https://github.com/trustoverip/dtgwg-cred-spec/pull/19)',
  'Normative reference: *A Cryptographic Framework for Proof of Personhood* — IACR ePrint 2026/333, [https://eprint.iacr.org/2026/333](https://eprint.iacr.org/2026/333)',
  'Construction candidates: [ProveKit](https://provekit.org/) · [SIROS](https://siros.org/) · [Flock](https://www.yukon.org/flock)',
  'Task force wiki page: [DTG ZKP Task Force](https://lf-toip.atlassian.net/wiki/spaces/HOME/pages/948240390/DTG+ZKP+Task+Force)',
];
// the Books item carries a nested list, so take it as the tail of the source's Reference Links list
const refsH = src.indexOf('>Reference Links<');
const srcUlStart = src.indexOf('<ul', refsH);
const srcNextH = src.indexOf('<h1', refsH + 10);
const srcUlEnd = src.lastIndexOf('</ul>', srcNextH);
const booksAt = src.indexOf('Books from Denys Popov');
const booksLi = booksAt < 0 ? -1 : src.lastIndexOf('<li', booksAt);
const booksBlock = (booksLi > srcUlStart && srcUlEnd > booksLi) ? [src.slice(booksLi, srcUlEnd)] : null;
const newRefs = `<ul>${REFS.map((r) => `<li><p>${inline(r)}</p></li>`).join('')}${booksBlock ? booksBlock[0].replace(/\s(ac:)?local-id="[^"]*"/g, '') : ''}</ul>`;

// ---- splice --------------------------------------------------------------------------------
let out = src;
const tableStart = out.indexOf('<table');
const tableEnd = out.indexOf('</table>') + '</table>'.length;
if (tableStart < 0 || tableEnd < tableStart) { console.log('REFUSED agenda-table-not-found'); process.exit(1); }
out = out.slice(0, tableStart) + newTable + out.slice(tableEnd);

const refsHeading = out.match(/<h1[^>]*>Reference Links<\/h1>/);
if (!refsHeading) { console.log('REFUSED reference-links-heading-not-found'); process.exit(1); }
const refsFrom = out.indexOf(refsHeading[0]) + refsHeading[0].length;
const ulStart = out.indexOf('<ul', refsFrom);
// the Reference Links list ends at the last </ul> before the Screenshots heading
const shots = out.indexOf('<h1', refsFrom);
const ulEnd = out.lastIndexOf('</ul>', shots) + '</ul>'.length;
if (ulStart < 0 || ulEnd <= ulStart) { console.log('REFUSED reference-links-list-not-found'); process.exit(1); }
out = out.slice(0, ulStart) + newRefs + out.slice(ulEnd);

// ---- decisions and action items ---------------------------------------------------------------
// The template's "Sample Decision Item" is replaced by the five decisions this call can actually ratify or refuse;
// the existing action items are left untouched and the new ones are appended after them, ids continuing the page's own.
const DECISIONS = [
  'ADR-001 Community-Anchored Proof is the first proof the task force implements, recorded as construction record 010.',
  'Construction selection is deferred pending measurement: five candidates are entered on one form; none is recommended today.',
  'No proving system is written as RECOMMENDED in the specification until its result has been reproduced on a second machine by an independent party, through the reproduction registry.',
  'The repository split stands: specification content in dtgwg-zkp-spec, requirements and task-force decisions in dtgwg-zkp-tf, runtimes and fixtures and the registry in the evidence repository.',
  'Delegation is its own construction record (020) rather than only a design-time case in the requirements document.',
];
const ACTIONS = [
  'Mitchell: open the first pull request against dtgwg-zkp-spec — front matter, conformance apparatus, body.',
  'Scott: name a reviewer for PR #21 (AGENT-RUNTIMES.md), open since 29 August.',
  'Mitchell: reply on cred-spec #38 with record 008 and the three things WD03 must decide.',
  "Berkeley team: the hard clause — proving a voucher's community membership while the voucher is offline.",
  'Mitchell: measure construction 001 over a BLAKE3 Merkle tree and compile construction 007; both are cost lines the records currently label as conjecture.',
  'Scott / Mitchell: decide whether the prioritized list of proofs stays in discussion #18 or becomes records.',
  'Scott: where reading material is shared — proposed answer, a READING.md in the task force repository, so it is versioned rather than in a thread.',
];
let nextId = Math.max(...[...out.matchAll(/<ac:task-id>(\d+)<\/ac:task-id>/g)].map((m) => Number(m[1]))) + 1;
const task = (text) => `<ac:task><ac:task-id>${nextId++}</ac:task-id><ac:task-uuid>${randomUUID()}</ac:task-uuid><ac:task-status>incomplete</ac:task-status><ac:task-body><span class="placeholder-inline-tasks">${esc(text)}</span></ac:task-body></ac:task>`;

// decisions: replace the sample task
const sample507 = out.search(/<ac:task>\s*<ac:task-id>507</);
const sampleFrom = sample507;
const sampleTo = sampleFrom < 0 ? -1 : out.indexOf('</ac:task>', sampleFrom) + '</ac:task>'.length;
if (sampleFrom < 0 || sampleTo <= sampleFrom) { console.log('REFUSED sample-decision-task-not-found'); process.exit(1); }
out = out.slice(0, sampleFrom) + DECISIONS.map(task).join('') + out.slice(sampleTo);

// action items: append inside the last task list on the page
const lastListEnd = out.lastIndexOf('</ac:task-list>');
if (lastListEnd < 0) { console.log('REFUSED action-task-list-not-found'); process.exit(1); }
out = out.slice(0, lastListEnd) + ACTIONS.map(task).join('') + out.slice(lastListEnd);

const dest = join(DIR, 'confluence-update.storage.xml');
writeFileSync(dest, out);
console.log(`built ${dest} — ${out.length} bytes (source ${src.length}); agenda rows: ${R.length}; decisions: ${DECISIONS.length}; action items added: ${ACTIONS.length}; reference links: ${REFS.length}${booksBlock ? ' + the books item, carried through' : ' (books item NOT found — check)'}`);
