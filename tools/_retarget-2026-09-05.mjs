// one-shot, 2026-09-05: retarget README / draft H / door D3 / PLAN §7.3 / board README to trustoverip/dtgwg-zkp-spec
import { readFileSync, writeFileSync } from 'node:fs';
const rw = (p, fn) => { const t = readFileSync(p, 'utf8'); const u = fn(t); writeFileSync(p, u); return u !== t; };

console.log('zkbook/README.md', rw('zkbook/README.md', r => r.replace(/## Promotion path[\s\S]*?(?=\n## Plan)/, `## Promotion path — the split (2026-09-05)

**Specification content → \`trustoverip/dtgwg-zkp-spec\`** (the Spec-Up-T repository set up on 2026-09-02 by Geoff Turk
and Ry Jones; Pages live at trustoverip.github.io/dtgwg-zkp-spec). \`node tools/zkbook-export.mjs\` writes the
specification into a clone of that repository in its own skeleton (header · intro · terms intro · body · appendix), with
the validation system as \`conformance/\` and a CI workflow; \`--check\` reports what would change without writing.
**Task-force comments, requirements, drafting rules, the board and the discussions stay in \`trustoverip/dtgwg-zkp-tf\`**;
runtimes, fixtures, the registry and this generator stay here.

Register: the specification text uses plain words — construction record, witness, public inputs, disclosure set,
conformance fixtures, proving system — and no metaphor; a test refuses kitchen vocabulary and emoji headings in
generated spec text. The card fields (\`dish\`, \`ingredients\`, \`pantry\`, \`tasting\`) remain the internal names in the
JSON. Commits ride the rite; see \`COMMIT-PLAN.md\`.
`)));

console.log('draft H', rw('board/drafts/H-zkp-tf-new-zkbook.md', h => h
  .replace('# H · zkp-tf NEW discussion — ZK Book: a Spec-Up-T scaffold for DTG ZKP V1.0, generated from the board', '# H · zkp-tf NEW discussion — the DTG ZKP specification in dtgwg-zkp-spec: construction records, generated and machine-checked')
  .replace(/\*\*Where it lives\.\*\* Generated in the evidence repo for now[\s\S]*?(?=\n\nThe format is cheap)/, `**Where it lives.** The specification repository the working group set up on 2 September — \`trustoverip/dtgwg-zkp-spec\`, the ToIP Spec-Up-T template — is the home. A pull request there carries the template's own skeleton (header, introduction, terminology, body, appendices) with the body generated from machine-readable construction records, and a \`conformance/\` directory holding those records, the requests they answer (ADR-001 first), the proving-system entries, the schema, a validator whose refusals are register strings, and a CI check that fails when the generated text no longer matches the records it claims to describe. Requirements, drafting rules and this board stay in this repository; runtimes, fixtures and the verification registry stay in the evidence repository (github.com/mitchuski/dtgwg-zkp-mage). Cred-spec can then cite a construction by \`[[xref]]\` where it currently defers the ZK layer to prose.`)
  .replace('cheap to change while there are twelve recipes and expensive at fifty', 'cheap to change while there are twelve construction records and expensive at fifty')
  .replace(/recipes generated from cards, pantry chapter/g, 'construction records generated from machine-checked records, a public-inputs chapter')
  .replace(/\brecipes?\b/g, (m) => m === 'recipes' ? 'construction records' : 'construction record')
  .replace(/pantry chapter/g, 'public-inputs chapter').replace(/\*pantry\*/g, '*public inputs*')));

console.log('doors D3', rw('board/doors.json', s => { const doors = JSON.parse(s); const d3 = doors.find(d => d.id === 'D3');
  d3.title = 'dtgwg-zkp-spec — the specification PR (construction records + conformance apparatus)';
  d3.where = 'https://github.com/trustoverip/dtgwg-zkp-spec';
  d3.what = 'The spec repo exists since 09-02 (Geoff + Ry; Pages live). The export writes the template skeleton + conformance/ + CI into ~/dtgwg-zkp-spec on branch zk-book; three commits, one PR (COMMIT-PLAN.md). Post H first (shape), then open the PR. Needs the relicensing line and the editors line confirmed.';
  d3.actor = 'Mitch posts H; commits C1–C3 with the rite; opens the PR';
  return JSON.stringify(doors, null, 2) + '\n'; }));

console.log('PLAN §7.3', rw('zkbook/PLAN-options-layer.md', pl => pl.replace(/3\. \*\*PR to trustoverip\/dtgwg-zkp-tf\*\* after #21:[\s\S]*?committed by a person\./, `3. **PR to trustoverip/dtgwg-zkp-spec** (the specification repository set up 2026-09-02): the template skeleton (\`spec/header · intro · terms intro · body · appendix\`, \`specs.json\`), the \`conformance/\` apparatus (records · requests · stacks · schema · validator · test) and its CI workflow — see \`COMMIT-PLAN.md\`. \`dtgwg-zkp-tf\` keeps requirements, drafting rules, the board and the discussions; PR #21 there is independent. DCO sign-off; no AI trailer. The generator stays in the evidence repository; the spec repository's CI checks that generated text matches the records by digest.`)));

console.log('board README', rw('board/README.md', b => b.replace(/`cd zkbook && npm install && npm run render` builds\n`docs\/index\.html`\. Rule of the book: a recipe may not say more than its card\. See `zkbook\/README\.md`\nand draft H for the offer upstream\./, '`cd zkbook && npm install && npm run render` builds\n`docs/index.html`. `node tools/zkbook-export.mjs` writes the specification into a clone of `trustoverip/dtgwg-zkp-spec`\n(template skeleton + `conformance/` + CI); `--check` shows the diff first. Rule: a record may not say more than a runtime\nhas measured. See `zkbook/README.md`, `zkbook/COMMIT-PLAN.md` and draft H.')));
