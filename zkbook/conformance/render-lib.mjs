// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 the contributors to the Trust over IP Foundation DTG ZKP Task Force. Contributed under the ToIP JDF charter.
// Pure specification renderer, also shipped in conformance/render-lib.mjs.
// the vocabulary the construction records are written in — one term file per entry, generated
export const GADGET_DEFS = {
  'set-membership': 'A gadget proving that a hidden leaf is a member of the set committed to by a public root, at a stated registry state, without revealing which leaf.',
  'nullifier': 'A gadget deriving a deterministic, context-scoped pseudonym from a holder secret and a context descriptor, so reuse within one declared context is detectable and nothing links across contexts.',
  'transcript-bind': 'A gadget binding a proof to the digest of one canonical presentation transcript — challenge, disclosed fields, context — so the proof cannot be replayed into another show.',
  'key-binding': 'A gadget proving that a public key or commitment opens to a holder secret under a stated derivation, so the party presenting is the party the credential binds to; with a shared secret across two identifiers it proves common control.',
  'distinctness': 'A gadget proving that two hidden leaves, issuers or members are not the same, so a self-vouch, a duplicated issuer or a duplicated seat is unsatisfiable rather than merely discouraged.',
  'signature-verify': 'A gadget verifying an issuer or counterparty signature over hidden credential content, in-circuit, so possession of a validly signed credential is proven without disclosing it.',
  'non-revocation': 'A gadget proving that a hidden credential handle is not a member of the set committed to by a public revocation root at a stated epoch.',
  'range': 'A gadget proving that a hidden attested attribute lies within a stated interval without disclosing it.',
  'commitment-open': 'A gadget proving that a public commitment opens to stated hidden values under a hidden blinding, so a value can be bound at issuance and checked at presentation without ever travelling in the clear.',
  'chain-resolve': 'A gadget proving that a chain of hidden grants nests — each hop’s scope within its parent’s, validity monotone, depth bounded — and terminates at a stated root.',
  'hidden-equality': 'A gadget proving that a hidden field of one authenticated credential equals a hidden field of another, the two signed by different parties, with no holder secret in the relation — the dual of distinctness: a differing pair is unsatisfiable and neither value is disclosed.',
};
export const ROLE_DEFS = {
  'requester': 'The party who asks for a proof in a task-force thread or issue: what it must prove, for which specification or market need, at what priority. A requester never writes a record’s claims.',
  'constructor': 'The party who writes a record, binds each clause to a gadget, builds the runtime and records its measurements. A constructor never vets their own construction.',
  'runner': 'The party who reproduces a runtime on independent hardware: fixtures green, digests re-derived. A runner is never the constructor of the same record.',
  'registry verifier': 'The acceptance flow that turns an independent run into a registry row. Not a reviewer of the circuit: reproduction and behaviour are not audit.',
  'maintainer': 'The human who publishes: updates the register row, pushes, and records the publication decision. Admission and publication are judgment and are never delegated.',
};
export const RECORD_DEFS = {
  'construction record': 'One section of this specification: a requested zero-knowledge proof over DTG credentials, stated as what a verifier learns, from whom, without what — with its witness, public inputs, clauses bound to gadgets, disclosure set, negative space, adversary, horizon, conformance fixtures, construction options and issuance requirements. Generated from a machine-checked record.',
  'primitive construction': 'A construction record that binds exactly one gadget. Primitive constructions are the components composed constructions are made of.',
  'composed construction': 'A construction record that is a named conjunction of primitive constructions under one presentation transcript and one declared disclosure set. Its disclosure set and negative space are written fresh, never inherited, because proofs that are individually sound can leak jointly.',
  'disclosure set': 'Exactly the public signals of a proof plus anything the holder deliberately shows in the same presentation.',
  'negative space': 'What a proof does not establish, stated in the record. The third drafting rule.',
  'horizon': 'The earliest of the clocks that bound a privacy claim: credential validity, epoch rollover, status freshness, root cryptoperiod, key validity. A bound with no horizon is not a bound.',
  'public inputs': 'What the verifier supplies and sees when a construction is presented: context descriptor, set roots, epoch, revocation root, transcript digest, declared correlation scope. Shared conventions for these are given in the Public Inputs section.',
  'set root': 'A signed, published commitment to a set at a stated registry state — a membership root, a revocation root, an accredited-issuer root — against which membership or non-membership is proven in the presentation itself, so the verifier performs no live lookup.',
  'transcript digest': 'The digest of the canonical presentation transcript (challenge, disclosed fields, context descriptor), canonicalised under RFC 8785 JCS and encoded as digestMultibase, that every proof in a presentation is bound to.',
  'record state': 'The evidence state of a construction record — requested, specified, constructed, run, vetted, published — advanced monotonically as evidence accumulates; evidence maturity does not confer normative status; adoption requires a separate task-force decision.',
  'verification registry': 'The register of independent reproductions maintained in the evidence repository: rows recording that a party other than the constructor rebuilt a construction on independent hardware with fixtures green and required digests re-derived.',
};

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
// Spec-Up-T (markdown-it-anchor's default slugify, after markdown-it's typographer) derives a heading's id from its text;
// in-document links must derive theirs the same way — an apostrophe inside a word becomes ’ before the slug is taken
const anchor = (heading) => encodeURIComponent(String(heading).replace(/(\w)'(\w)/g, '$1’$2').trim().toLowerCase().replace(/\s+/g, '-'));
const constructionAnchor = (c) => anchor(`Construction ${c.id} · ${c.name}`);
const stackAnchor = (s) => anchor(`Proving system · ${s.name}`);
const li = (xs) => (xs || []).map(x => `- ${x}`).join('\n');
const ref = (term) => `[[ref: ${term}]]`;

export function renderConstruction(record, all) {
  const byId = Object.fromEntries(all.map(c => [c.id, c]));
  const stateNote = {
    requested: 'This record is at state `requested`: the construction has been asked for and not yet written. Every line below is a placeholder until a constructor writes the record.',
    specified: 'This record is at state `specified`: it is written and validates; no runtime has measured it. Costs marked conjecture are conjecture (drafting rule 4). Informative.',
    constructed: 'This record is at state `constructed`: a runtime exists and has measured at least one construction option; no independent party has reproduced it. Informative.',
    run: 'This record is at state `run`: reproduced on independent hardware by a party other than the constructor; not yet vetted into the verification registry. Informative.',
    vetted: 'This record is at state `vetted`: a verification-registry row records an independent reproduction. Its clauses are candidates for normative text.',
    published: 'This record is at state `published`: its evidence has been vetted and published. Evidence publication alone does not confer normative status.',
  }[record.state];
  const method = record.relation.map((m, i) => `${i + 1}. ${m.clause} — ${ref(m.gadget)}${m.component ? ` (${ref('construction record')} ${m.component}, [${byId[m.component]?.name || m.component}](#${byId[m.component] ? constructionAnchor(byId[m.component]) : m.component}))` : ''}${m.runtime ? ` · runtime \`${m.runtime}\`` : ''}`).join('\n');
  const adv = record.adversary.map(a => `- **${a.against.join(' · ')}** — ${a.claim}`).join('\n');
  const subs = record.options.map(s => `| ${s.construction} | ${s.cost || '—'} | ${s.measured ? '**measured**' : 'unmeasured'} | ${s.source || ''} |`).join('\n');
  const prov = record.provenance || {};
  const hist = record.history.map(h => `| ${h.date} | \`${h.to}\` | ${h.by} | ${h.evidence} |`).join('\n');
  const rev = (record.revisions || []).map(r => `| ${r.date} | ${r.by} | ${r.note} |`).join('\n');
  const reviews = (record.reviews || []).map(r => `| ${r.date} | ${r.by} | ${r.scope} | \`${r.verdict}\` | ${r.evidence || ''} |`).join('\n');
  const composes = record.components?.length ? `\n**Composes:** ${record.components.map(c => `[${c}](#${byId[c] ? constructionAnchor(byId[c]) : c})`).join(' ∧ ')} — a ${ref('composed construction')}: one transcript, one ${ref('disclosure set')}, written fresh.` : `\n**Kind:** ${ref('primitive construction')} — binds the ${ref(record.relation[0]?.gadget || 'gadget')} gadget and nothing else.`;
  return `### Construction ${record.id} · ${record.name}

*${stateNote}*

| | |
|---|---|
| kind | ${record.kind} |
| state | \`${record.state}\` |
| priority | ${record.priority || '—'} |
| constructor | ${record.owner || '—'} |
| requested by | ${record.request?.by || '—'} |
| request | ${record.request?.issue || '—'} |
${composes}

#### Statement

${record.statement}

${record.request?.need ? `**Need.** ${record.request.need}\n` : ''}
#### Witness

*Never leaves the holder.*

${li(record.witness)}

#### Public inputs

${li(record.publicInputs)}

#### Relation

${method}

#### Disclosure set

${li(record.disclosureSet)}

#### Does not establish

${li(record.doesNotEstablish)}

#### Adversary, per claim

${adv}

#### Horizon

${li(record.horizon)}

#### Conformance fixtures

Families: ${record.fixtures.families.map(f => `\`${f}\``).join(' · ')}${record.fixtures.vectors ? `\n\nVectors: \`${record.fixtures.vectors}\`` : ''}${record.fixtures.rejectionCodes?.length ? `\n\nRejection codes: ${record.fixtures.rejectionCodes.map(c => `\`${c}\``).join(', ')}` : ''}

#### Construction options

*Candidate constructions, each evaluated against the construction-selection criteria ([DTG-ZKP-REQ] §16.1), with its cost as measured or as conjectured.*

| construction | cost | status | source |
|---|---|---|---|
${subs}

#### Issuance requirements

${li(record.issuance) || '- none beyond the credential as specified'}

#### Provenance

${prov.spec?.length ? li(prov.spec) + '\n' : ''}${prov.catalog ? `- catalog: ${prov.catalog}\n` : ''}${prov.registry ? `- registry: ${prov.registry}\n` : ''}${prov.commit ? `- commit: ${prov.commit}\n` : ''}${!prov.spec?.length && !prov.catalog && !prov.registry && !prov.commit ? '- none recorded yet\n' : ''}
#### Record history

| date | to | by | evidence |
|---|---|---|---|
${hist}
${rev ? `\nRevisions within a state:\n\n| date | by | note |\n|---|---|---|\n${rev}\n` : ''}${reviews ? `\n#### Reviews\n\nRecorded reviewer sign-off on this record's clauses; a review is not a state advance and confers no evidence state.\n\n| date | reviewer | scope | verdict | evidence |\n|---|---|---|---|---|\n${reviews}\n` : ''}
`;
}

export function renderConstructions(records) {
  const prim = records.filter(c => c.kind === 'primitive'), comp = records.filter(c => c.kind === 'composed');
  const index = (xs) => xs.map(c => `| [${c.id}](#${constructionAnchor(c)}) | ${c.name} | \`${c.state}\` | ${c.priority || '—'} | ${c.components ? c.components.join(' ∧ ') : c.relation.map(m => m.gadget).join(', ')} |`).join('\n');
  return `## Construction Records

This section is informative in this Working Draft: every record below is at state \`specified\` or \`constructed\`. Evidence maturity is printed at the head of each record. Normative adoption is a separate task-force decision; reproduction or publication alone does not confer it.

This section is generated from the machine-readable records in \`conformance/records/\`. Changes are made to a record, never to this text; a record that fails validation does not render. Each record states its adversary, its horizon and what it does not establish, and labels conjecture as conjecture, because the validator refuses records that do not.

### Index of constructions

Identifiers are stable handles, not a sequence: 001–009 are primitive constructions; 010–019 are compositions over community and relationship credentials; 020–029 are delegation and authority chains. Unused numbers in a range are unassigned, not missing.

**Primitive constructions** — one gadget each.

| # | construction | state | priority | gadget |
|---|---|---|---|---|
${index(prim)}

**Composed constructions** — a named conjunction under one transcript and one disclosure set.

| # | construction | state | priority | composes |
|---|---|---|---|---|
${index(comp)}

${records.map(c => renderConstruction(c, records)).join('\n')}`;
}

// ---- privacy considerations derived from the records ----------------------------------------
export function renderPrivacyDerived(records) {
  const rows = [];
  for (const c of records) {
    for (const a of c.adversary) rows.push(`- **Construction ${c.id}** — against ${a.against.join(', ')}: ${a.claim}`);
  }
  const neg = records.map(c => `- **Construction ${c.id}** does not establish: ${c.doesNotEstablish.slice(0, 3).join('; ')}${c.doesNotEstablish.length > 3 ? '; …' : ''}`);
  return `### Privacy claims as recorded, per construction

*Generated from the \`adversary\` field of every construction record. A claim appears here only against the party it is made against; a claim absent here is not made.*

${rows.join('\n')}

### Negative space as recorded, per construction

*Generated from the \`doesNotEstablish\` field of every construction record (first three items each; the full list is in the record).*

${neg.join('\n')}
`;
}

// ---- requests: the requests the constructions answer, in the requester's own form ----------------
export function validateRequest(rec, records) {
  const r = [];
  for (const k of ['id', 'title', 'author', 'status', 'date', 'record', 'clauses']) if (!rec[k]) r.push(`request-missing-field:${k}`);
  if (rec.record && !records.some(c => c.id === rec.record)) r.push(`request-construction-missing:${rec.record}`);
  for (const c of rec.clauses || []) {
    if (!c.id || !c.text || !c.status) r.push(`request-clause-incomplete:${c.id || '?'}`);
    if (c.status && !['covered', 'refined', 'added', 'partial', 'open'].includes(c.status)) r.push(`request-clause-bad-status:${c.id}`);
    if (['refined', 'added', 'partial', 'open'].includes(c.status) && !c.refinement && c.status !== 'open') r.push(`request-clause-no-refinement:${c.id}`);
  }
  return r;
}
export function renderRequest(rec, records) {
  const answered = records.find(c => c.id === rec.record);
  const link = answered ? `[Construction ${answered.id} · ${answered.name}](#${constructionAnchor(answered)})` : rec.record;
  const counts = {}; for (const c of rec.clauses) counts[c.status] = (counts[c.status] || 0) + 1;
  const rows = rec.clauses.map(c => `| ${c.id} | ${c.group} | ${c.text} | ${c.boundTo || '—'} | **${c.status}** | ${c.refinement || ''} |`).join('\n');
  const tests = (rec.acceptanceTests || []).map(t => `| ${t.name} | ${t.text} | \`${t.family}\` |`).join('\n');
  const asks = Object.entries(rec.workingGroupAsks || {}).map(([g, a]) => `| ${g} | ${a} |`).join('\n');
  return `### Request ${rec.id} · ${rec.title}

*${rec.subtitle || ''}*

| | |
|---|---|
| kind | ${rec.kind} |
| author | ${rec.author} |
| status | ${rec.status} · ${rec.date} |
| audience | ${rec.audience || '—'} |
| source | ${rec.source?.url || '—'}${rec.source?.named ? ` · named in ${rec.source.named}` : ''} |
| answered by | ${link} |

${rec.source?.note ? `> ${rec.source.note}\n` : ''}
**Decision.** ${rec.decision}

${rec.statement ? `**The statement the holder makes.** “${rec.statement}”\n` : ''}
${rec.mustProve?.length ? `**What must be proven, together, in one proof.**\n\n${rec.mustProve.map(m => `${m.n}. ${m.text}`).join('\n')}\n` : ''}
#### Crosswalk — where each clause lands in the construction record

Status: **covered** (the record carries it as written) · **refined** (carried with a precision the request did not state) · **added** (a clause the task force found missing) · **partial** (carried in part; the gap is named) · **open** (belongs to another group or a profile). Counts: ${Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(' · ')}.

| clause | group | requirement (paraphrase) | where the record carries it | status | refinement |
|---|---|---|---|---|---|
${rows}

${tests ? `#### Acceptance tests → fixture families\n\n| test | the record's words | family |\n|---|---|---|\n${tests}\n` : ''}
${rec.outOfScope?.length ? `#### Explicitly out of scope in the record\n\n${li(rec.outOfScope)}\n` : ''}
${asks ? `#### What the record asks of each group\n\n| group | ask |\n|---|---|\n${asks}\n` : ''}
${rec.consequencesNamed?.length ? `#### Consequences the record names\n\n${li(rec.consequencesNamed)}\n` : ''}`;
}
export function renderRequests(requests, records) {
  return `## Requests Answered

This section is informative.

A request is kept in the requester's own form — an architecture decision record, an issue, a decision taken on a call — so that a construction can be checked against what was actually asked rather than against the construction's own paraphrase of it. Every request names the construction record that answers it; every clause of the request says where in that record it landed, or that it did not. This section is generated from the machine-readable requests in \`conformance/requests/\`.

The first request is Glenn Gore's ADR-001, *Community-Anchored Proof*, named by the task force as its first construction to seed the work: it defines what must be proven and what any implementation must satisfy, and deliberately does not choose how. The construction record is the how. Requests are ordered by date.

${requests.slice().sort((a, b) => (a.date || '').localeCompare(b.date || '')).map(r => renderRequest(r, records)).join('\n')}`;
}

export function renderTermFile(term, def, aliases = []) {
  return `[[def: ${[term, ...aliases].join(', ')}]]\n\n~ ${def}\n`;
}

// ---- stacks: the proving systems a construction may run on, as comparable facts ---------------
export const STACK_KINDS = ['general-stack', 'as-signed-catalog', 'hand-rolled', 'library', 'declaration'];
export function validateStack(s, gadgets) {
  const r = [];
  for (const k of ['id', 'name', 'kind', 'proofSystem', 'setup', 'license', 'provenance', 'verified']) if (!s[k]) r.push(`stack-missing-field:${k}`);
  if (s.kind && !STACK_KINDS.includes(s.kind)) r.push(`stack-bad-kind:${s.kind}`);
  if (!s.audit || typeof s.audit.claim !== 'string') r.push('stack-no-audit-statement');
  // an audit claim without a located commit is NOT a refusal — the renderer prints "claimed; not located" beside it (§16.1)
  for (const g of Object.keys(s.covers || {})) if (gadgets && !gadgets.includes(g)) r.push(`stack-covers-unknown-gadget:${g}`);
  for (const b of s.benchmarks || []) if (!b.source) r.push(`stack-benchmark-no-source:${b.statement}`);
  return r;
}
export function renderStack(s) {
  const bench = (s.benchmarks || []).length ? `| statement | device | figure | source |\n|---|---|---|---|\n${s.benchmarks.map(b => `| ${b.statement} | ${b.device || '—'} | ${b.rate} | ${b.source} |`).join('\n')}` : '*No benchmark figures recorded.*';
  const covers = Object.entries(s.covers || {}).map(([g, t]) => `| ${ref(g)} | ${t} |`).join('\n');
  const auditWarn = s.audit?.claim && /audit/i.test(s.audit.claim) && !/none|no audit|unvetted|not/i.test(s.audit.claim) && !s.audit.reviewedCommit ? ' — *claimed; reviewed commit and file set not located (§16.1 audit-scope rule)*' : '';
  return `### Proving system · ${s.name}

| | |
|---|---|
| id | \`${s.id}\` |
| kind | ${s.kind} |
| maintainer | ${s.maintainer || '—'} |
| frontend | ${s.frontend || '—'} |
| proof system | ${s.proofSystem} |
| field | ${s.field || '—'} |
| setup | ${s.setup} |
| post-quantum | ${s.postQuantum || '—'} |
| credential model | ${s.credentialModel || '—'} |
| platforms | ${(s.platforms || []).join(' · ') || '—'} |
| verifier | ${(s.verifier || []).join(' · ') || '—'} |
| licence | ${s.license}${s.iprNote ? ` — ${s.iprNote}` : ''} |
| audit | ${s.audit?.claim || '—'}${auditWarn} |
| maturity | ${s.maturity || '—'} |
| independent implementations | ${s.independentImplementations ?? '—'} |
| provenance | ${Object.entries(s.provenance || {}).filter(([k]) => k !== 'contentAddressed').map(([k, v]) => `${k}: ${v}`).join(' · ')}${s.provenance?.contentAddressed ? ' · content-addressed' : ''} |
| verified | ${s.verified} |

#### Published figures (the proving system's own, or the evidence repository's — never this specification's)

${bench}

#### What it covers, per gadget

| gadget | coverage |
|---|---|
${covers}

${(s.notes || []).length ? `#### Notes\n\n${li(s.notes)}\n` : ''}`;
}
export function renderStacks(stacks) {
  const byKind = {}; for (const s of stacks) (byKind[s.kind] = byKind[s.kind] || []).push(s);
  const KIND_NOTE = {
    'general-stack': 'general-purpose proving systems — any statement the frontend expresses; issuer-agnostic',
    'hand-rolled': 'constructions written and measured in the evidence repository as reference implementations',
    'as-signed-catalog': 'catalogs of circuits that prove over credentials exactly as already signed — substrate for the legacy-rails route, not DTG construction routes',
    'library': 'circuit libraries a construction may cite, lint against or track',
    'declaration': 'the zero-cost row: no proof, a declared correlation scope',
  };
  return `## Proving Systems

This section is informative.

A proving-system entry records facts a reader can check — proof system, field, setup, licence, audit statement, published figures with their source and a verification date — and never a recommendation. Recommendations require separate task-force review informed by the reproduction ladder over verification-registry rows; a figure in this section is the proving system's own or the evidence repository's, and says so. Entries of different kinds are not comparable rows: a catalog of circuits over credentials as already signed and a general-purpose prover answer different questions, and the kind is stated first. This section is generated from \`conformance/stacks/\`.

| kind | entries | what the kind means |
|---|---|---|
${Object.entries(byKind).map(([k, ss]) => `| ${k} | ${ss.map(s => `[${s.id}](#${stackAnchor(s)})`).join(' · ')} | ${KIND_NOTE[k] || ''} |`).join('\n')}

${stacks.slice().sort((a, b) => a.kind.localeCompare(b.kind) || a.id.localeCompare(b.id)).map(renderStack).join('\n')}`;
}

export function renderTerms() {
  const terms = {};
  for (const [t, d] of Object.entries(GADGET_DEFS)) terms[`g-gadget-${slug(t)}.md`] = renderTermFile(t, d, [`${t} gadget`]);
  for (const [t, d] of Object.entries(ROLE_DEFS)) terms[`g-role-${slug(t)}.md`] = renderTermFile(t, d);
  for (const [t, d] of Object.entries(RECORD_DEFS)) terms[`g-${slug(t)}.md`] = renderTermFile(t, d, t === 'horizon' ? ['Horizon'] : []);
  return terms;
}
