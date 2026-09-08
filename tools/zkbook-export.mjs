#!/usr/bin/env node
// zkbook-export.mjs — write the specification into a clone of trustoverip/dtgwg-zkp-spec, in that repository's own
// Spec-Up-T skeleton (header · intro · terms intro · body · appendix · terms-definitions), with the conformance
// apparatus (records, requests, stacks, schema, validator, test, CI workflow). Zero-dep. Nothing is committed.
//   node tools/zkbook-export.mjs [--to <clone dir>] [--check]     default clone: ../dtgwg-zkp-spec
//   --check   report added / changed / unchanged / removed files against the clone's working tree; write nothing
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, existsSync, copyFileSync, unlinkSync } from 'node:fs';
import { join, dirname, resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { markedSection } from '../zkbook/conformance/generate.mjs';
import { renderTerms, renderRecords, renderRecipes, renderStacks, renderPrivacyDerived } from '../board/tools/spec-render.mjs';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ZKBOOK = join(REPO, 'zkbook');
const SPEC = join(ZKBOOK, 'spec');
const argOf = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : undefined; };
const CHECK = process.argv.includes('--check');
const ADOPT = process.argv.includes('--adopt');   // take the clone's edits back into this repository's sources
const FORCE = process.argv.includes('--force');   // overwrite a clone-side edit deliberately
// Files a person may legitimately edit on either side. The export refuses to overwrite one that has diverged,
// because the clone is where review happens: an edit there is work, not drift. --adopt copies it back here.
const authored = new Map();   // relative path in the clone → the file in this repository it came from
const TO = resolve(argOf('--to') || join(REPO, '..', 'dtgwg-zkp-spec'));
if (!existsSync(join(TO, 'specs.json'))) { console.log(`REFUSED export-target-not-a-spec-repo:${TO} (clone trustoverip/dtgwg-zkp-spec there first)`); process.exit(1); }

const sha = (s) => createHash('sha256').update(s).digest('hex');
const planned = new Map(); // relative path → Buffer|string
const plan = (rel, content) => planned.set(rel.replace(/\\/g, '/'), content);
const read = (p) => readFileSync(p, 'utf8').replace(/\r\n/g, '\n');

// ---- 1. the template skeleton: header · intro · terms intro · body · appendix ---------------------------------------
for (const f of ['header.md', 'intro.md', 'terms-and-definitions-intro.md', 'appendix.md']) {
  plan(`spec/${f}`, read(join(SPEC, f)));
  authored.set(`spec/${f}`, join(SPEC, f));   // hand-written: a clone-side edit is review work, not drift
}

// body.md = the chapters between the terminology and the appendices, in specification order
// The Cryptographic Background is its own chapter file in the spec repo (specs.json lists it), so it is written
// separately below rather than inlined here — inlining it as well would render the chapter twice.
const BODY_ORDER = ['records.md', 'pantry.md', 'recipes.md', 'stacks.md', 'considerations.md', 'conformance.md', 'references.md'];
// derived privacy list is spliced into Privacy Considerations, after the editors' numbered items
function assembleBody() {
  const parts = [];
  for (const f of BODY_ORDER) {
    const p = join(SPEC, f);
    if (!existsSync(p)) { console.log(`REFUSED body-chapter-missing:${f} (run board.mjs spec / transfer-spellbook.mjs first)`); process.exit(1); }
    const key = { 'records.md': 'requests', 'recipes.md': 'constructions', 'stacks.md': 'stacks' }[f];
    let t = key ? markedSection(key, generated[key]) : read(p).trim();
    if (f === 'considerations.md') {
      const derived = markedSection('privacy', generated.privacy);
      t = t.replace(/\n## Governance Considerations/, `\n${derived}\n\n## Governance Considerations`);
    }
    parts.push(t);
  }
  return parts.join('\n\n');
}

// ---- 2. conformance apparatus ------------------------------------------------------------------------------------
const CONF_SRC = { records: join(REPO, 'board', 'cards'), requests: join(REPO, 'board', 'records'), stacks: join(REPO, 'board', 'stacks') };
const canonical = (v) => v === null || typeof v !== 'object' ? JSON.stringify(v) : Array.isArray(v) ? '[' + v.map(canonical).join(',') + ']' : '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canonical(v[k])).join(',') + '}';
const digestH = createHash('sha256');
const data = { records: [], requests: [], stacks: [] };
for (const [d, src] of Object.entries(CONF_SRC)) {
  for (const f of readdirSync(src).filter(f => f.endsWith('.json')).sort()) {
    const txt = read(join(src, f));
    data[d].push(JSON.parse(txt));
    plan(`conformance/${d}/${f}`, txt.endsWith('\n') ? txt : txt + '\n');
    authored.set(`conformance/${d}/${f}`, join(src, f));
    digestH.update(`${d}/${f}\n${canonical(JSON.parse(txt))}\n`);
  }
}
const recordsDigest = digestH.digest('hex');
const generated = { requests: renderRecords(data.requests, data.records), constructions: renderRecipes(data.records), stacks: renderStacks(data.stacks), privacy: renderPrivacyDerived(data.records) };
for (const [rel, src] of [
  ['conformance/schema/construction-record.schema.json', join(REPO, 'board', 'card.schema.json')],
  ['conformance/validate.mjs', join(ZKBOOK, 'conformance', 'validate.mjs')],
  ['conformance/test.mjs', join(ZKBOOK, 'conformance', 'test.mjs')],
  ['conformance/generate.mjs', join(ZKBOOK, 'conformance', 'generate.mjs')],
  ['conformance/render-lib.mjs', join(REPO, 'board', 'tools', 'spec-render.mjs')],
  ['conformance/README.md', join(ZKBOOK, 'conformance', 'README.md')],
]) { plan(rel, read(src)); authored.set(rel, src); }

const body = `<!-- generated-from: records-sha256=${recordsDigest} — the Requests Answered, Construction Records, Proving Systems and derived Privacy Considerations sections are generated from conformance/{records,requests,stacks}; conformance/test.mjs compares this stamp, the marked generated sections and generated terms with fresh generation from these files. Edit the records, not the generated text. -->\n\n` + assembleBody() + '\n';
plan('spec/body.md', body);
// generated the same way body.md is: its source is the hand-kept transfer map in this repository, so an edit made in
// the clone is overwritten here rather than adopted. Change zkbook/transfer/spellbook-map.json and re-run the transfer.
plan('spec/cryptographic-background.md', read(join(SPEC, 'primer.md')).trimEnd() + '\n\n');

// ---- 3. terms ------------------------------------------------------------------------------------------------------
const TERMS = join(SPEC, 'terms-definitions');
for (const f of readdirSync(TERMS).filter(f => f.endsWith('.md') && !f.startsWith('g-')).sort()) plan(`spec/terms-definitions/${f}`, read(join(TERMS, f)));
for (const [file, text] of Object.entries(renderTerms())) plan(`spec/terms-definitions/${file}`, text);
// the template's two placeholder terms are superseded by the generated vocabulary; stale generated terms (g-*) not in this
// export are removed too, so a renamed term cannot leave a dangling definition behind in the clone
const REMOVE = ['spec/terms-definitions/verifiable_credential.md', 'spec/terms-definitions/verifiable_trust_community.md'];
const cloneTerms = join(TO, 'spec', 'terms-definitions');
if (existsSync(cloneTerms)) for (const f of readdirSync(cloneTerms)) if (f.startsWith('g-') && !planned.has(`spec/terms-definitions/${f}`)) REMOVE.push(`spec/terms-definitions/${f}`);

// ---- 4. repository files: specs.json (theirs, with our title/description/external spec), README, CI ---------------
const specs = JSON.parse(read(join(TO, 'specs.json')));
const ours = JSON.parse(read(join(ZKBOOK, 'specs.json'))).specs[0];
const s0 = specs.specs[0];
s0.title = 'Decentralized Trust Graph — Zero-Knowledge Proof Specification';
s0.description = ours.description;
s0.author = 'Trust over IP Foundation — DTG Working Group, ZKP Task Force';
// The chapter list belongs to the clone: chapters are added there as the specification grows, and replacing the list
// here would silently drop them from the render. Only seed it when the clone has none.
const DEFAULT_PATHS = ['header.md', 'intro.md', 'terms-and-definitions-intro.md', 'body.md', 'appendix.md'];
if (!Array.isArray(s0.markdown_paths) || s0.markdown_paths.length === 0) s0.markdown_paths = DEFAULT_PATHS;
const pathsMissing = DEFAULT_PATHS.filter(f => !s0.markdown_paths.includes(f));
const pathsAbsent = s0.markdown_paths.filter(f => !existsSync(join(TO, 'spec', f)));
if (!(s0.external_specs || []).some(x => x.external_spec === 'DTG_CRED')) s0.external_specs = [...(s0.external_specs || []), { external_spec: 'DTG_CRED', gh_page: 'https://trustoverip.github.io/dtgwg-cred-spec/', url: 'https://github.com/trustoverip/dtgwg-cred-spec' }];
plan('specs.json', JSON.stringify(specs, null, 2) + '\n');

// the spec repo README is authored in both places: it carries the editorial rules editors add there
plan('README.md', read(join(ZKBOOK, 'spec-repo-README.md')));
authored.set('README.md', join(ZKBOOK, 'spec-repo-README.md'));

plan('.github/workflows/validate-conformance.yml', `name: Validate conformance records

# Every push and pull request: the construction records, requests and proving-system entries must validate, and the
# generated sections of spec/body.md must have been produced from the records as they are now.
on:
  push:
    branches: [main, master]
    paths: ["conformance/**", "spec/**", ".github/workflows/validate-conformance.yml"]
  pull_request:
    paths: ["conformance/**", "spec/**"]
  workflow_dispatch:

permissions:
  contents: read

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0
        with:
          node-version: '22'
      - name: Validate records, requests and proving-system entries
        run: node conformance/validate.mjs
      - name: Generated text is current
        run: node conformance/test.mjs
`);


// The clone's spec/body.md is a weave: marked generated regions, and editor-written chapters between them. Editors work
// on it there, so --adopt has to unpick it — strip the marked regions, split what remains on its chapter headings, and
// write each editor-owned chapter back to zkbook/spec/. Refuses rather than guesses if a marker or heading has moved.
const BODY_CHAPTERS = [
  ['## Public Inputs', 'pantry.md'],
  ['## Security Considerations', 'considerations.md'],
  ['## Conformance', 'conformance.md'],
  ['## References', 'references.md'],
];
const NL = String.fromCharCode(10);
const trimNL = (s, end) => {
  let i = end ? s.length : 0;
  if (end) { while (i > 0 && (s[i - 1] === NL || s[i - 1] === ' ')) i--; return s.slice(0, i); }
  while (i < s.length && (s[i] === NL || s[i] === ' ')) i++;
  return s.slice(i);
};
function adoptBodyChapters() {
  const dst = join(TO, 'spec', 'body.md');
  if (!existsSync(dst)) return [];
  let t = read(dst);
  const stampEnd = t.indexOf('-->');
  if (t.startsWith('<!-- generated-from:') && stampEnd > 0) t = t.slice(stampEnd + 3).trimStart();
  for (const m of ['requests', 'constructions', 'stacks', 'privacy']) {
    const s0 = `<!-- generated-section:${m}:start -->`, e0 = `<!-- generated-section:${m}:end -->`;
    const a = t.indexOf(s0), z = t.indexOf(e0);
    if (a < 0 || z < 0) { console.log(`REFUSED body-marker-missing:${m} (cannot separate editor text from generated text)`); process.exit(1); }
    // close the seam to exactly one blank line, so re-splicing the generated region reproduces the clone byte for byte
    t = trimNL(t.slice(0, a), true) + NL + NL + trimNL(t.slice(z + e0.length), false);
  }
  const at = BODY_CHAPTERS.map(([h]) => {
    const i = t.indexOf(NL + h);
    if (i < 0) { console.log(`REFUSED body-chapter-heading-missing:${h}`); process.exit(1); }
    return i + 1;
  });
  const adopted = [];
  BODY_CHAPTERS.forEach(([, file], k) => {
    const text = t.slice(at[k], k + 1 < at.length ? at[k + 1] : t.length).trim() + NL;
    const target = join(SPEC, file);
    if (!existsSync(target) || read(target).trim() !== text.trim()) { writeFileSync(target, text); adopted.push(file); }
  });
  return adopted;
}

// ---- 5. the diverged-authored gate ---------------------------------------------------------------------------------
// An authored file whose clone copy differs from what this repository would write is a clone-side edit. Overwriting it
// silently is how review work disappears, so the export refuses and names them. --adopt takes them back; --force wins.
const diverged = [];
for (const [rel, src] of authored) {
  const dst = join(TO, rel);
  if (!existsSync(dst)) continue;
  if (sha(readFileSync(dst)) !== sha(Buffer.from(planned.get(rel)))) diverged.push({ rel, src, dst });
}

if (ADOPT) {
  const bodyAdopted = adoptBodyChapters();
  for (const f of bodyAdopted) console.log(`  adopted spec/body.md → zkbook/spec/${f}   (editor-written chapter)`);
  if (!diverged.length && !bodyAdopted.length) { console.log(`ADOPT -> nothing to take back: every authored file and editor chapter matches ${TO}`); process.exit(0); }
  for (const { rel, src, dst } of diverged) { copyFileSync(dst, src); console.log(`  adopted ${rel}  ->  ${relative(REPO, src).split(sep).join('/')}`); }
  console.log(`ADOPT -> ${diverged.length + bodyAdopted.length} clone-side edit(s) taken into this repository. Re-run the generators, then export:`);
  console.log('  node board/tools/board.mjs spec && node tools/transfer-spellbook.mjs && node tools/zkbook-export.mjs --check');
  process.exit(0);
}
if (diverged.length && !CHECK && !FORCE) {
  console.log(`REFUSED destination-authored-file-diverged (${diverged.length}) - the clone has edits this export would overwrite:`);
  for (const { rel } of diverged) console.log(`  ${rel}`);
  console.log('  node tools/zkbook-export.mjs --adopt    take those edits into this repository (then regenerate and export)');
  console.log('  node tools/zkbook-export.mjs --force    overwrite them deliberately');
  process.exit(1);
}

// ---- 6. write or check -------------------------------------------------------------------------------------------
const report = { added: [], changed: [], unchanged: [], removed: [] };
for (const [rel, content] of planned) {
  const dst = join(TO, rel);
  const exists = existsSync(dst);
  const same = exists && sha(readFileSync(dst)) === sha(Buffer.from(content));
  if (!exists) report.added.push(rel); else if (!same) report.changed.push(rel); else report.unchanged.push(rel);
  if (!CHECK && !same) { mkdirSync(dirname(dst), { recursive: true }); writeFileSync(dst, content); }
}
for (const rel of REMOVE) { const p = join(TO, rel); if (existsSync(p)) { report.removed.push(rel); if (!CHECK) unlinkSync(p); } }

console.log(`${CHECK ? 'CHECK' : 'EXPORT'} → ${TO}`);
console.log(`  added ${report.added.length} · changed ${report.changed.length} · unchanged ${report.unchanged.length} · removed ${report.removed.length}`);
for (const k of ['added', 'changed', 'removed']) for (const f of report[k]) console.log(`  ${k.padEnd(8)} ${f}`);
console.log(`  records digest ${recordsDigest.slice(0, 16)}… stamped in spec/body.md`);
if (diverged.length) console.log(`  ${diverged.length} authored file(s) diverged in the clone${CHECK ? ' - the clone is the newer side; --adopt takes them back' : ' - OVERWRITTEN by --force'}: ${diverged.map(d => d.rel).join(' ')}`);
if (pathsMissing.length) console.log(`  note: specs.json markdown_paths does not list ${pathsMissing.join(' ')} - the render will skip that chapter`);
if (pathsAbsent.length) console.log(`  note: specs.json markdown_paths lists ${pathsAbsent.join(' ')}, absent under spec/`);
console.log(CHECK ? '  (nothing written)' : '  nothing committed — commits ride the rite (tools/push-rite.mjs); see zkbook/COMMIT-PLAN.md');
