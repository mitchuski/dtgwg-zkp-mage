// one-shot: serve ledger entry 30 for draft M; door D14; link M from H
import { readFileSync, writeFileSync } from 'node:fs';
const L = JSON.parse(readFileSync('proverb-ledger.json', 'utf8'));
if (!L.entries.some(e => e.seq === 30)) L.entries.push({ seq: 30, date: '2026-09-05', actType: 'post', actRef: 'trustoverip/dtgwg-zkp-tf discussion #14 (draft M — three repositories, one rule; the ZK Book edition)', actMeaning: 'State once how the task-force, specification and evidence repositories relate, what crosses (records, never dependency), and why the evidence repository keeps the specification as a book with the working shown.', proverb: 'Three rooms, one door each; what passes between them is a record, never a dependency.', servedBy: 'agent runtime (Claude Fable 5.1), session of 2026-09-05 (draft M)', activated: null, activatedDate: null });
writeFileSync('proverb-ledger.json', JSON.stringify(L, null, 1) + '\n');
const doors = JSON.parse(readFileSync('board/doors.json', 'utf8'));
if (!doors.some(d => d.id === 'D14')) doors.push({ id: 'D14', title: 'zkp-tf #14 — three repositories, one rule; the ZK Book edition (after H)', where: 'https://github.com/trustoverip/dtgwg-zkp-tf/discussions/14', what: 'M lays out the TF / spec / evidence relationship, the path a claim takes, what crosses (records, fixtures, row ids) and what never does (dependency), and why the evidence repository keeps the specification as the ZK Book with the working shown.', status: 'drafted', draft: 'M', cards: [], actor: 'Mitch posts after H' });
writeFileSync('board/doors.json', JSON.stringify(doors, null, 2) + '\n');
let h = readFileSync('board/drafts/H-zkp-tf-new-zkbook.md', 'utf8');
if (!h.includes('laid out on #14')) h = h.replace('Runtimes, fixtures, the verification registry and the generator stay in the evidence repository, which the specification cites and never depends on.', 'Runtimes, fixtures, the verification registry and the generator stay in the evidence repository, which the specification cites and never depends on. The relationship between the three, and the evidence repository\'s book edition of the same records, is laid out on #14.');
writeFileSync('board/drafts/H-zkp-tf-new-zkbook.md', h);
console.log('ledger', L.entries.length, '| doors', doors.length, '| H links #14:', h.includes('laid out on #14'));
