#!/usr/bin/env node
// reflect-chronicle.mjs — reflect ONE master chronicle into this repo's chronicles/ (collaborator type). Zero-dep.
//   node tools/reflect-chronicle.mjs <master path> --signed yes|no --traces <file with bullet lines> [--row "<README arc-table row>"]
// Body verbatim from the master; provenance header + runtime traces prepended; home paths translated longest-first
// where the artefact exists here, glossed otherwise; FAILS CLOSED on any surviving home path. README arc row appended.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const argOf = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : undefined; };
const master = process.argv[2];
if (!master || !existsSync(master)) { console.log(`REFUSED reflect-master-missing:${master}`); process.exit(1); }
const signed = argOf('--signed') === 'yes';
const traces = argOf('--traces') ? readFileSync(argOf('--traces'), 'utf8').trim() : '';
const row = argOf('--row');

let body = readFileSync(master, 'utf8').replace(/\r\n/g, '\n');
// translations, longest first
const T = [
  ['`~/dtgwg-cred-spec-main_mage/ZKP_TF_RUN-2026-09-05.md` (git-excluded)', 'the maintainer\'s run note (git-excluded working record, not in this repo)'],
  ['`~/dtgwg-cred-spec-main_mage/zkbook/`', '`zkbook/`'],
  ['`~/dtgwg-cred-spec-main_mage/`', 'this repository\'s root'],
  ['`~/dtgwg-zkp-tf-mage-zkbook`', 'a git worktree of the task-force repository (maintainer\'s machine)'],
  ['`~/dtgwg-zkp-spec`', 'a local clone of `trustoverip/dtgwg-zkp-spec` (maintainer\'s machine)'],
  ['~/dtgwg-zkp-spec', 'a local clone of trustoverip/dtgwg-zkp-spec'],
  ['`~/dtgwg-cred-spec-main_mage/ZKP_TF_RUN-2026-09-05.md` §§9–10 (git-excluded)', 'the maintainer\'s run note §§9–10 (git-excluded working record, not in this repo)'],
  ['`~/agentprivacy-docs/grimoires/zk_grimoire_tale-31-the-flock.md`', 'the withdrawn "Tale 31" draft (maintainer\'s private canon)'],
  ['`~/zero spells/32-tale-32.md`', 'Zero Tale 32, *The Flock* (the maintainer\'s Zero Knowledge Spellbook — private canon; its Technical Bridge is `zkbook/transfer/tale-32-the-flock.md`)'],
  ['`~/agentprivacy_master/docs/ZERO_FRONTIER_TALE_ATTACHMENT_METHOD_2026-09-05.md`', 'the frontier-tale attachment method (maintainer\'s master docs, private)'],
  ['~/dtgwg-cred-spec-main_mage/', ''],
];
for (const [a, b] of T) body = body.split(a).join(b);
const leak = body.match(/~\/[^\s)`]+|C:\\[^\s)`]+|\/Users\/mitch[^\s)`]*/g);
if (leak) { console.log(`REFUSED reflect-untranslated-path: ${[...new Set(leak)].join(' , ')}`); process.exit(1); }

const [titleLine, ...rest] = body.split('\n');
const header = `
> **What this is.** A *chronicle* is the maintainer's narrative working record of one significant day: what moved, in
> what order, and why the order is the method. This copy is the **collaborator telling**: the body is verbatim from the
> master series in the maintainer's private suite (framework voice), adapted only in this header and in paths, which are
> repo-relative or glossed. The master copy is the source of truth; a divergence here is a defect in the reflection.
> **Signed by the First Person: ${signed ? 'yes' : 'not yet'}.**
>
> **Runtime traces** — what carries this chronicle's claims, so a reader can run the narrative rather than take it:
${traces.split('\n').map(l => '> ' + l).join('\n')}
`;
const out = join(REPO, 'chronicles', basename(master));
writeFileSync(out, [titleLine, header, ...rest].join('\n'));
console.log(`reflected → chronicles/${basename(master)} (signed: ${signed ? 'yes' : 'not yet'})`);

if (row) {
  const rp = join(REPO, 'chronicles', 'README.md');
  let r = readFileSync(rp, 'utf8');
  if (!r.includes(basename(master))) {
    const marker = '\n## How these are produced';
    const i = r.indexOf(marker);
    if (i < 0) { console.log('REFUSED readme-marker-missing'); process.exit(1); }
    // insert the row at the end of the arc table (just before the blank line preceding the marker)
    const before = r.slice(0, i).replace(/\s+$/, '');
    r = before + '\n' + row + '\n' + r.slice(i);
    writeFileSync(rp, r);
    console.log('README arc row added');
  } else console.log('README already lists it');
}
