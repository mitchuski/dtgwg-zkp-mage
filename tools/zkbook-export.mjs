#!/usr/bin/env node
// zkbook-export.mjs — write the specification into a clone of trustoverip/dtgwg-zkp-spec, in that repository's own
// Spec-Up-T skeleton (header · intro · terms intro · body · appendix · terms-definitions), with the conformance
// apparatus (records, requests, stacks, schema, validator, test, CI workflow). Zero-dep. Nothing is committed.
//   node tools/zkbook-export.mjs [--to <clone dir>] [--check]     default clone: ../dtgwg-zkp-spec
//   --check   report added / changed / unchanged / removed files against the clone's working tree; write nothing
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, existsSync, copyFileSync, unlinkSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ZKBOOK = join(REPO, 'zkbook');
const SPEC = join(ZKBOOK, 'spec');
const argOf = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : undefined; };
const CHECK = process.argv.includes('--check');
const TO = resolve(argOf('--to') || join(REPO, '..', 'dtgwg-zkp-spec'));
if (!existsSync(join(TO, 'specs.json'))) { console.log(`REFUSED export-target-not-a-spec-repo:${TO} (clone trustoverip/dtgwg-zkp-spec there first)`); process.exit(1); }

const sha = (s) => createHash('sha256').update(s).digest('hex');
const planned = new Map(); // relative path → Buffer|string
const plan = (rel, content) => planned.set(rel.replace(/\\/g, '/'), content);
const read = (p) => readFileSync(p, 'utf8').replace(/\r\n/g, '\n');

// ---- 1. the template skeleton: header · intro · terms intro · body · appendix ---------------------------------------
plan('spec/header.md', read(join(SPEC, 'header.md')));
plan('spec/intro.md', read(join(SPEC, 'intro.md')));
plan('spec/terms-and-definitions-intro.md', read(join(SPEC, 'terms-and-definitions-intro.md')));
plan('spec/appendix.md', read(join(SPEC, 'appendix.md')));

// body.md = the chapters between the terminology and the appendices, in specification order
const BODY_ORDER = ['records.md', 'primer.md', 'pantry.md', 'recipes.md', 'stacks.md', 'considerations.md', 'conformance.md', 'references.md'];
// derived privacy list is spliced into Privacy Considerations, after the editors' numbered items
function assembleBody() {
  const parts = [];
  for (const f of BODY_ORDER) {
    const p = join(SPEC, f);
    if (!existsSync(p)) { console.log(`REFUSED body-chapter-missing:${f} (run board.mjs spec / transfer-spellbook.mjs first)`); process.exit(1); }
    let t = read(p).trim();
    if (f === 'considerations.md') {
      const derived = existsSync(join(SPEC, 'privacy-derived.md')) ? read(join(SPEC, 'privacy-derived.md')).trim() : '';
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
for (const [d, src] of Object.entries(CONF_SRC)) {
  for (const f of readdirSync(src).filter(f => f.endsWith('.json')).sort()) {
    const txt = read(join(src, f));
    plan(`conformance/${d}/${f}`, txt.endsWith('\n') ? txt : txt + '\n');
    digestH.update(`${d}/${f}\n${canonical(JSON.parse(txt))}\n`);
  }
}
const recordsDigest = digestH.digest('hex');
plan('conformance/schema/construction-record.schema.json', read(join(REPO, 'board', 'card.schema.json')));
plan('conformance/validate.mjs', read(join(ZKBOOK, 'conformance', 'validate.mjs')));
plan('conformance/test.mjs', read(join(ZKBOOK, 'conformance', 'test.mjs')));
plan('conformance/README.md', read(join(ZKBOOK, 'conformance', 'README.md')));

const body = `<!-- generated-from: records-sha256=${recordsDigest} — the Requests Answered, Construction Records, Proving Systems and derived Privacy Considerations sections are generated from conformance/{records,requests,stacks}; conformance/test.mjs fails if this stamp no longer matches those files. Edit the records, not the generated text. -->\n\n` + assembleBody() + '\n';
plan('spec/body.md', body);

// ---- 3. terms ------------------------------------------------------------------------------------------------------
const TERMS = join(SPEC, 'terms-definitions');
for (const f of readdirSync(TERMS).filter(f => f.endsWith('.md')).sort()) plan(`spec/terms-definitions/${f}`, read(join(TERMS, f)));
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
s0.markdown_paths = ['header.md', 'intro.md', 'terms-and-definitions-intro.md', 'body.md', 'appendix.md'];
if (!(s0.external_specs || []).some(x => x.external_spec === 'DTG_CRED')) s0.external_specs = [...(s0.external_specs || []), { external_spec: 'DTG_CRED', gh_page: 'https://trustoverip.github.io/dtgwg-cred-spec/', url: 'https://github.com/trustoverip/dtgwg-cred-spec' }];
plan('specs.json', JSON.stringify(specs, null, 2) + '\n');

plan('README.md', `# Decentralized Trust Graph — Zero-Knowledge Proof Specification

The specification of the DTG ZKP Task Force (Trust over IP Foundation, DTG Working Group): the zero-knowledge
layer of the Decentralized Trust Graph, written as **construction records** — one per proof the trust graph needs —
each stating what a verifier learns, from whom, without what, with its witness, public inputs, method clauses bound
to named gadgets, disclosure set, what it does not establish, adversary and horizon per privacy claim, conformance
fixtures, construction options across proving systems, and issuance requirements.

Rendered specification: <https://trustoverip.github.io/dtgwg-zkp-spec/>

## How this repository is organised

| path | what |
|---|---|
| \`spec/\` | the specification, rendered by [Spec-Up-T](https://trustoverip.github.io/spec-up-t-website/) (\`header · intro · terms · body · appendix\`) |
| \`spec/body.md\` | **partly generated** — the Requests Answered, Construction Records, Proving Systems and derived Privacy Considerations sections are rendered from \`conformance/\`; the stamp at the top names the source digest |
| \`conformance/\` | the machine-readable half: construction records, requests, proving-system entries, the schema, the validator, and the test CI runs |
| \`.github/workflows/\` | render-and-deploy (Spec-Up-T → GitHub Pages) and \`validate-conformance\` (records validate; generated text is current) |

## Working on it

- **Change a construction:** edit \`conformance/records/<id>.json\`, run \`node conformance/validate.mjs\`, regenerate the
  specification text (the generator lives in the task force's evidence repository — see \`conformance/README.md\`),
  commit both. A pull request that edits generated text without its record fails CI.
- **Render locally:** \`npm install && npm run render\` → \`docs/index.html\` (never committed).
- **Propose a construction:** open a discussion in [trustoverip/dtgwg-zkp-tf](https://github.com/trustoverip/dtgwg-zkp-tf)
  with a one-sentence statement of what the proof must establish; a constructor writes the record.

## How the three repositories relate

| repository | holds | what leaves it |
|---|---|---|
| [trustoverip/dtgwg-zkp-tf](https://github.com/trustoverip/dtgwg-zkp-tf) | requirements, drafting rules, discussions, the working board thread | decisions and requests — a request becomes a construction record |
| **this repository** | the specification and its \`conformance/\` apparatus | the rendered specification; record ids others may cite |
| [mitchuski/dtgwg-zkp-mage](https://github.com/mitchuski/dtgwg-zkp-mage) | reference runtimes with measured costs, conformance fixtures, the verification registry of independent reproductions, the board where records are written and advanced, and the generator that renders records into this specification's text | data — records, fixtures, registry row ids — never a dependency |

A claim travels one way: discussion → record → runtime → independent run → registry row → record state → regenerated
text → pull request here. Nothing in this specification says more than a record shows; no record says more than a
runtime measured; no runtime says more than a stranger reproduced. The evidence repository also publishes the same
records in the same chapters as the **ZK Book**, its edition with the working shown — the board, the drafts, the watch,
the run notes and the chronicles beside the text.

- Credentials the constructions prove over: [trustoverip/dtgwg-cred-spec](https://github.com/trustoverip/dtgwg-cred-spec)

## Intellectual property

Documentation CC BY 4.0; code (\`conformance/\`) Apache-2.0; patents W3C Mode — per the DTG Working Group's charter under
the Joint Development Foundation.
`);

plan('.github/workflows/validate-conformance.yml', `name: Validate conformance records

# Every push and pull request: the construction records, requests and proving-system entries must validate, and the
# generated sections of spec/body.md must have been produced from the records as they are now.
on:
  push:
    branches: [main, master]
    paths: ["conformance/**", "spec/body.md", ".github/workflows/validate-conformance.yml"]
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

// ---- 5. write or check -------------------------------------------------------------------------------------------
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
console.log(CHECK ? '  (nothing written)' : '  nothing committed — commits ride the rite (tools/push-rite.mjs); see zkbook/COMMIT-PLAN.md');
