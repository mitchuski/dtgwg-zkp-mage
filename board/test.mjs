// board/test.mjs — the suite. Zero deps. Run: node board/test.mjs
import { loadCards, validateCard, advance, renderCard, renderIssue, renderIndex, buildSite, STATES, TASKS, GADGETS } from './tools/board.mjs';
import { digestSurvey } from './tools/watch.mjs';
import { renderRecipes, GADGET_DEFS, loadRecords, validateRecord, renderRecords, loadStacks, renderStacks } from './tools/spec.mjs';
import { ROOT } from './tools/board.mjs';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

let n = 0, fails = 0;
const t = (name, fn) => { n++; try { const r = fn(); if (r !== true) throw new Error(String(r)); console.log(`ok   ${name}`); } catch (e) { fails++; console.log(`FAIL ${name} — ${e.message}`); } };
const has = (arr, s) => arr.includes(s) || `expected ${s} in [${arr.join(' ')}]`;

const cards = loadCards();

t('T1 every seeded card validates', () => { const bad = cards.map(c => [c.id, validateCard(c, cards)]).filter(([, r]) => r.length); return bad.length === 0 || JSON.stringify(bad); });
t('T2 seed set present (001-006, 010, 011, 020)', () => { const ids = cards.map(c => c.id); return ['001', '002', '003', '004', '005', '006', '010', '011', '020'].every(i => ids.includes(i)) || ids.join(','); });
t('T3 010 is composed of primitives that exist', () => { const c = cards.find(x => x.id === '010'); return c.kind === 'composed' && c.components.every(k => cards.find(x => x.id === k && x.kind === 'primitive')) || 'bad composition'; });

// refusals, each triggered live
const base = structuredClone(cards.find(x => x.id === '010'));
t('R1 card-clause-unbound', () => { const c = structuredClone(base); c.method[0].gadget = 'magic'; return has(validateCard(c, cards), 'card-clause-unbound:1'); });
t('R2 card-no-does-not-establish', () => { const c = structuredClone(base); c.doesNotEstablish = []; return has(validateCard(c, cards), 'card-no-does-not-establish'); });
t('R3 card-no-adversary', () => { const c = structuredClone(base); c.adversary = []; return has(validateCard(c, cards), 'card-no-adversary'); });
t('R4 card-adversary-unknown', () => { const c = structuredClone(base); c.adversary[0].against = ['the-void']; return has(validateCard(c, cards), 'card-adversary-unknown:the-void'); });
t('R5 card-no-horizon', () => { const c = structuredClone(base); c.horizon = []; return has(validateCard(c, cards), 'card-no-horizon'); });
t('R6 card-component-missing', () => { const c = structuredClone(base); c.components.push('999'); return has(validateCard(c, cards), 'card-component-missing:999'); });
t('R7 card-composed-yield-is-union (composition must declare its own disclosure set)', () => {
  const c = structuredClone(base); c.yield = [...new Set(c.components.flatMap(k => cards.find(x => x.id === k).yield))];
  return has(validateCard(c, cards), 'card-composed-yield-is-union');
});
t('R8 card-composed-no-single-transcript', () => { const c = structuredClone(base); c.pantry = c.pantry.filter(p => !/transcript/i.test(p)); return has(validateCard(c, cards), 'card-composed-no-single-transcript'); });
t('R9 card-primitive-multi-gadget', () => { const c = structuredClone(cards.find(x => x.id === '001')); c.method.push({ clause: 'x', gadget: 'range' }); return has(validateCard(c, cards), 'card-primitive-multi-gadget'); });
t('R10 construct-no-measurement when state says constructed', () => { const c = structuredClone(base); c.state = 'constructed'; c.history.push({ to: 'constructed', by: 'x', date: 'd', evidence: 'e' }); c.substitutions.forEach(s => s.measured = false); c.method.forEach(m => m.runtime = 'r'); return has(validateCard(c, cards), 'construct-no-measurement'); });
t('R11 history-not-monotone', () => { const c = structuredClone(base); c.history.push({ to: 'requested', by: 'x', date: 'd', evidence: 'e' }); return has(validateCard(c, cards), 'history-not-monotone:requested'); });

// the state machine as a trust task
t('S1 advance refuses a skipped state', () => { const r = advance(structuredClone(base), 'run', { by: 'a', evidence: 'e' }); return !r.ok && r.refusal === 'advance-skips-state' || JSON.stringify(r); });
t('S2 advance refuses without evidence', () => { const r = advance(structuredClone(base), 'constructed', { by: 'a' }); return !r.ok && r.refusal === 'advance-no-evidence' || JSON.stringify(r); });
t('S3 advance refuses without actor', () => { const r = advance(structuredClone(base), 'constructed', { evidence: 'e' }); return !r.ok && r.refusal === 'advance-no-actor' || JSON.stringify(r); });
t('S4 carded → constructed needs runtime + measurement (refused on bare evidence)', () => { const r = advance(structuredClone(base), 'constructed', { by: 'mitchuski', evidence: 'runtimes/circom-gadget' }); return (!r.ok && r.refusal === 'construct-no-runtime') || (r.ok ? 'accepted without runtime' : r.refusal); });
t('S5 full happy path 001: constructed → run → vetted → published, different hands', () => {
  let c = structuredClone(cards.find(x => x.id === '001'));
  c.tasting.vectors = 'runtimes/fixtures/vectors';
  let r = advance(c, 'run', { by: 'runner-7f', evidence: 'fixtures 13/13 on darwin/arm64' }); if (!r.ok) return 'run: ' + r.refusal;
  r = advance(r.card, 'vetted', { by: 'verifier', evidence: 'registry 0007-seat-7f-card001' }); if (!r.ok) return 'vet: ' + r.refusal;
  r.card.provenance.registry = '0007-seat-7f-card001';
  r = advance(r.card, 'published', { by: 'mitchuski', evidence: 'rite activated 2026-08-xx; board row updated' }); if (!r.ok) return 'pub: ' + r.refusal;
  return r.card.state === 'published' && r.card.history.length === 6 && r.card.history.map(h => h.to).join('>') === 'requested>carded>constructed>run>vetted>published' || 'bad end state: ' + r.card.history.map(h => h.to).join('>');
});
t('S6 run-same-hands: the constructor may not be the runner', () => { let c = structuredClone(cards.find(x => x.id === '001')); c.tasting.vectors = 'v'; const r = advance(c, 'run', { by: 'mitchuski', evidence: 'ran it myself' }); return !r.ok && r.refusal === 'run-same-hands' || JSON.stringify(r); });
t('S7 vet-self-vouch: a runner who constructed cannot be vetted', () => {
  let c = structuredClone(cards.find(x => x.id === '001')); c.tasting.vectors = 'v';
  c.history.push({ to: 'run', by: 'mitchuski', date: 'd', evidence: 'e' }); c.state = 'run';
  const r = advance(c, 'vetted', { by: 'verifier', evidence: 'registry 0007' }); return !r.ok && r.refusal === 'vet-self-vouch' || JSON.stringify(r);
});
t('S8 publish-without-rite', () => {
  let c = structuredClone(cards.find(x => x.id === '001')); c.tasting.vectors = 'v'; c.provenance.registry = '0007';
  c.history.push({ to: 'run', by: 'r', date: 'd', evidence: 'e' }, { to: 'vetted', by: 'v', date: 'd', evidence: 'registry 0007' }); c.state = 'vetted';
  const r = advance(c, 'published', { by: 'mitchuski', evidence: 'pushed' }); return !r.ok && r.refusal === 'publish-without-rite' || JSON.stringify(r);
});
t('S9 every transition carries a trust-task envelope', () => STATES.every(s => TASKS[s] && TASKS[s].task && TASKS[s].issuer && TASKS[s].recipient && TASKS[s].sideEffects && TASKS[s].exposure) || 'envelope missing');

// rendering
t('P1 render is deterministic', () => renderCard(base) === renderCard(structuredClone(base)) || 'nondeterministic');
t('P2 rendered card names every clause gadget and the does-not list', () => { const md = renderCard(base); return base.method.every(m => md.includes('`' + m.gadget + '`')) && md.includes('## Does not establish') || 'missing sections'; });
t('P3 issue body is short and links the card', () => { const b = renderIssue(base); return b.length < 2500 && b.includes('board/cards/010.json') || 'bad issue body'; });
t('P4 index lists every card', () => { const i = renderIndex(cards); return cards.every(c => i.includes(`| ${c.id} |`)) || 'missing row'; });
t('P5 site builds, embeds every card and the drafts, no absolute local paths', () => { const h = buildSite(cards); return cards.every(c => h.includes(`data-k="card-${c.id}"`)) && h.includes('id="drafts"') && !/C:\\Users|\/Users\/mitch/.test(h) || 'site incomplete or leaks a path'; });

// 2026-09-05 — WD02 vocabulary, the watch, the cookbook
t('T4 seed set grew (007, 008, 012 present; 020 carded)', () => { const ids = cards.map(c => c.id); const c020 = cards.find(c => c.id === '020'); return ['007', '008', '012'].every(i => ids.includes(i)) && c020.state === 'carded' || ids.join(','); });
t('V1 no retired identifier acronyms (R/M/C/P-DID) in any card body', () => {
  const bad = cards.filter(c => /\b[RMCP]-DIDs?\b/.test(JSON.stringify([c.dish, c.ingredients, c.pantry, c.method, c.yield, c.doesNotEstablish, c.adversary, c.issuance]))).map(c => c.id);
  return bad.length === 0 || 'retired vocabulary in ' + bad.join(',');
});
t('V2 010 and 011 route common control through card 007', () => ['010', '011'].every(id => { const c = cards.find(x => x.id === id); return c.components.includes('007') && c.method.some(m => m.component === '007'); }) || 'missing 007');
t('V3 a re-carded card records the change as a revision, not a second history entry', () => { const c = cards.find(x => x.id === '010'); return c.revisions?.length >= 1 && c.history.filter(h => h.to === 'carded').length === 1 || 'revision missing or history duplicated'; });
t('W1 digest lists only threads with events after the watermark, newest first', () => {
  const sv = { fetchedAt: '2026-09-05T00:00:00Z', since: '2026-09-01T00:00:00Z', repos: { r: { discussions: [
    { number: 1, title: 'old', url: 'u1', author: 'a', createdAt: '2026-08-01T00:00:00Z', updatedAt: '2026-08-02T00:00:00Z', comments: [] },
    { number: 2, title: 'new proof thread', url: 'u2', author: 'b', createdAt: '2026-08-01T00:00:00Z', updatedAt: '2026-09-03T00:00:00Z', comments: [{ author: 'c', at: '2026-09-03T00:00:00Z', url: 'u2c', body: 'a nullifier note', replies: [] }] },
    { number: 3, title: 'newer', url: 'u3', author: 'b', createdAt: '2026-09-04T00:00:00Z', updatedAt: '2026-09-04T00:00:00Z', body: 'x', comments: [] } ], pulls: [], issues: [] } } };
  const d = digestSurvey(sv); return d.length === 2 && d[0].number === 3 && d[1].number === 2 && d[1].relevant === true && d[1].events.length === 1 || JSON.stringify(d.map(x => [x.number, x.relevant]));
});
t('W2 site renders the watch, doors and cookbook sections and a ledger-posted draft is marked', () => { const h = buildSite(cards); return h.includes('id="watch"') && h.includes('id="doors"') && h.includes('id="cookbook"') && /data-posted="2026-08-29"/.test(h) || 'section or ledger state missing'; });
t('K1 construction records render once each with state note, negative space and adversary sections', () => { const md = renderRecipes(cards); return cards.every(c => (md.match(new RegExp(`^### Construction ${c.id} · `, 'mg')) || []).length === 1) && (md.match(/#### Does not establish/g) || []).length === cards.length && (md.match(/#### Adversary, per claim/g) || []).length === cards.length || 'construction sections incomplete'; });
t('K1b specification register: generated text carries no kitchen vocabulary and no emoji in headings', () => { const md = renderRecipes(cards) + renderRecords(loadRecords(), cards) + renderStacks(loadStacks()); const kitchen = md.match(/\b(recipe|recipes|pantry|dish|ingredients|tasting|kitchen|cookbook)\b/gi) || []; const emojiHeads = md.split('\n').filter(l => /^#{2,4} /.test(l) && /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(l)); return kitchen.length === 0 && emojiHeads.length === 0 || `kitchen words: ${[...new Set(kitchen)].join(',')} · emoji headings: ${emojiHeads.length}`; });
t('K2 every gadget a card binds has a generated term', () => { const g = new Set(cards.flatMap(c => c.method.map(m => m.gadget))); return [...g].every(x => GADGET_DEFS[x]) || 'undefined gadget: ' + [...g].filter(x => !GADGET_DEFS[x]).join(','); });
t('K3 recipes.md carries no retired acronyms and no absolute local paths', () => { const md = renderRecipes(cards); return !/\b[RMCP]-DIDs?\b/.test(md.replace(/R\/M\/C\/P-DID/g, '')) && !/C:\\Users|\/Users\/mitch/.test(md) || 'leak'; });

// records (ADR-001 first) and the primer (spellbook Technical Bridges only)
t('Q1 ADR-001 record validates and answers recipe 010 with every clause bound', () => { const recs = loadRecords(); const adr = recs.find(r => r.id === 'ADR-001'); if (!adr) return 'ADR-001 missing'; const v = validateRecord(adr, cards); return v.length === 0 && adr.recipe === '010' && adr.clauses.length >= 26 && adr.clauses.every(c => c.boundTo) || JSON.stringify(v); });
t('Q2 requests render ADR-001 first with the crosswalk and the four acceptance tests', () => { const md = renderRecords(loadRecords(), cards); return md.indexOf('### Request ADR-001') > 0 && /\| S6 \|/.test(md) && /\| S7 \|/.test(md) && /Accepts/.test(md) && /Unlinkable/.test(md) && /Current/.test(md) || 'requests render incomplete'; });
t('E1 exported body (spec-repo skeleton) has the template\'s required sections, each declared normative or informative', () => {
  const p = join(ROOT, '..', '..', 'dtgwg-zkp-spec', 'spec', 'body.md'); if (!existsSync(p)) return 'export not run — node tools/zkbook-export.mjs';
  const md = readFileSync(p, 'utf8');
  const need = ['## Requests Answered', '## Cryptographic Background', '## Public Inputs', '## Construction Records', '## Proving Systems', '## Security Considerations', '## Privacy Considerations', '## Governance Considerations', '## Internationalization Considerations', '## Accessibility Considerations', '## Conformance', '### Conformance Targets', '### Conformance Tests', '## References', '### Normative References', '### Informative References'];
  const missing = need.filter(h => !md.includes('\n' + h) && !md.startsWith(h));
  const lines = md.split('\n'); const undeclared = [];
  lines.forEach((l, i) => { if (/^## /.test(l)) { const next = lines.slice(i + 1, i + 6).join(' '); if (!/This section is (normative|informative)/.test(next)) undeclared.push(l); } });
  const stamp = /<!-- generated-from: records-sha256=[0-9a-f]{64}/.test(md);
  return missing.length === 0 && undeclared.length === 0 && stamp || `missing: ${missing.join(' | ')} · undeclared: ${undeclared.join(' | ')} · stamp: ${stamp}`;
});
t('E3 exported body carries no tale / spellbook / privacymage framing above References (the source is cited once, at the bottom)', () => {
  const p = join(ROOT, '..', '..', 'dtgwg-zkp-spec', 'spec', 'body.md'); if (!existsSync(p)) return 'export not run';
  const md = readFileSync(p, 'utf8'); const cut = md.indexOf('\n## References'); const above = cut > 0 ? md.slice(0, cut) : md;
  const hits = above.match(/\bTales?\b|Spellbook|privacymage|spellbook|grimoire|Swordsman|\bMage\b|Soulb|Drake|zkLogin|x402|Intel Pools?|First Person VRC|Soulbound/g) || []; const refHas = /\[AGENTPRIVACY\]/.test(md.slice(cut));
  return hits.length === 0 && refHas || `above-references hits: ${[...new Set(hits)].join(',')} (${hits.length}) · references cite AGENTPRIVACY: ${refHas}`;
});
t('E2 the exported conformance apparatus validates itself and finds body.md current (runs conformance/test.mjs in the clone)', () => {
  const clone = join(ROOT, '..', '..', 'dtgwg-zkp-spec'); if (!existsSync(join(clone, 'conformance', 'test.mjs'))) return 'export not run';
  try { const out = execSync('node conformance/test.mjs', { cwd: clone, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); return /all conformance checks pass/.test(out) || out.slice(-300); }
  catch (e) { return (e.stdout || e.message || '').toString().slice(-400); }
});
// stacks (facts a stranger can check; never a recommendation)
const specMod = await import('./tools/spec.mjs');
t('X1 every stack file validates (licence, setup, provenance, audit statement, known gadgets, sourced figures)', () => { const ss = specMod.loadStacks(); const bad = ss.map(s => [s.id, specMod.validateStack(s, GADGETS)]).filter(([, v]) => v.length); return ss.length >= 4 && bad.length === 0 || JSON.stringify(bad) || 'fewer than 4 stacks'; });
t('X2 Flock is a stack: binary-field, transparent, standard hashes; the lab stack is the only one with registry evidence', () => { const ss = specMod.loadStacks(); const f = ss.find(s => s.id === 'flock'); const lab = ss.find(s => s.id === 'lab-groth16-circom'); return !!f && /binary/i.test(f.field) && /transparent/i.test(f.setup) && /BLAKE3|SHA-256/.test(f.credentialModel) && !!lab && /registry/i.test(JSON.stringify(lab.benchmarks)) || 'flock or lab stack facts missing'; });
t('X3 stacks.md renders every stack under its kind and carries no leaderboard or solver talk', () => { const md = specMod.renderStacks(specMod.loadStacks()); return specMod.loadStacks().every(s => md.includes(`\`${s.id}\``)) && /\| kind \|/.test(md) && !/leaderboard|autoresearch|Hilbert|solver rank|compressions\/s by/i.test(md) || 'stacks render incomplete or off-topic text present'; });
t('Q3 primer.md exists, has nine sections, and carries no narrative (Story/Inscription/lattice/persona names)', () => {
  const p = join(ROOT, '..', 'zkbook', 'spec', 'primer.md'); if (!existsSync(p)) return 'primer.md missing — run tools/transfer-spellbook.mjs';
  const md = readFileSync(p, 'utf8'); const secs = (md.match(/^### P\d/mg) || []).length;
  return secs === 9 && !/Soulbis|Soulbae|#### The Story|#### The Spell Inscription|Vertex Coordinates|\*\*Geometric Interpretation|\[\[relationship proverb/i.test(md) || `sections=${secs} or narrative leaked`;
});


// ---- the run: the ordered posting sequence must stay honest -----------------------------------
const runPath = join(ROOT, 'run.json');
const run = existsSync(runPath) ? JSON.parse(readFileSync(runPath, 'utf8')) : null;
const runSteps = run ? run.phases.flatMap(p => p.steps) : [];
const draftFiles = readdirSync(join(ROOT, 'drafts')).filter(f => f.endsWith('.md'));
const draftKeys = new Set(draftFiles.map(f => f.split('-')[0]));

t('Y1 run.json exists, its steps are numbered 1..N without gaps, and every phase and step is complete', () => {
  if (!run) return 'run.json missing';
  const ns = runSteps.map(s => s.n);
  const seq = ns.every((v, i) => v === i + 1);
  return (seq && run.phases.every(p => p.id && p.title && p.why && p.steps.length) && runSteps.every(s => s.act && s.where && s.gate && s.state && s.why))
    || `numbering ${ns.join(',')} or a phase/step field is missing`;
});

t('Y2 every draft a run step names exists, and its ledger seq is served', () => {
  const missing = runSteps.filter(s => s.draft && !draftKeys.has(s.draft)).map(s => `${s.n}:${s.draft}`);
  const ledger = JSON.parse(readFileSync(join(ROOT, '..', 'proverb-ledger.json'), 'utf8'));
  const seqs = new Set(ledger.entries.map(e => String(e.seq)));
  const unserved = runSteps.filter(s => s.draft && draftKeys.has(s.draft)).map(s => {
    const txt = readFileSync(join(ROOT, 'drafts', draftFiles.find(f => f.startsWith(s.draft + '-'))), 'utf8');
    const m = txt.match(/^ledger:[ 	]*(\d+)[ 	]*$/m);
    return m && !seqs.has(m[1]) ? `${s.draft}:${m[1]}` : null;
  }).filter(Boolean);
  return (missing.length === 0 && unserved.length === 0) || `missing drafts [${missing}] unserved ledger [${unserved}]`;
});

t('Y3 the run renders into the site with every phase, every step and no local path', () => {
  const h = buildSite(cards);
  const phases = (h.match(/class="phase"/g) || []).length;
  const steps = (h.match(/class="step st-/g) || []).length;
  return (h.includes('id="run"') && phases === run.phases.length && steps === runSteps.length
    && runSteps.filter(s => s.draft).every(s => h.includes(`id="draft-${s.draft}"`)) && !/C:\Users|\/Users\/mitch/.test(h))
    || `phases=${phases}/${run.phases.length} steps=${steps}/${runSteps.length} or a draft anchor is missing`;
});

console.log(`\n${n - fails}/${n} passed`);
process.exit(fails ? 1 : 0);
