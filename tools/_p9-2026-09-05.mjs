// one-shot: the agents subsection — drop source 30's architecture/roadmap sketch from the specification, write the
// separation of proving from acting in plain terms, and add spec-register rewrites for the remaining "Applied to" lines.
import { readFileSync, writeFileSync } from 'node:fs';
const p = 'zkbook/transfer/spellbook-map.json';
const map = JSON.parse(readFileSync(p, 'utf8'));

map.excludeFromSpec = [30];
map.excludeFromSpecNote = 'Source 30 is a system-architecture and roadmap sketch (implementation checklist, performance targets, product components) in the corpus\'s own vocabulary; it is not cryptographic background and does not enter the specification. P9 carries a hand-written body instead. The source remains mapped so the transfer report still lists it.';

map.rewrites = [
  ['sovereignty protocols', 'g', 'self-sovereign identity protocols'],
  ['financial sovereignty', 'g', 'financial privacy'],
  ['sovereign history', 'g', 'verifiable history'],
  ['near-complete sovereignty architectures', 'g', 'large recursive-proof architectures'],
  ['agent sovereignty', 'g', 'agent accountability'],
];

const p9 = map.sections.find(s => s.id === 'P9');
p9.title = 'Agents that prove: the separation of proving from acting';
p9.lead = 'An agent acting for a person can carry proofs the person could make, within a scope the person granted, without the verifier learning who the person is. That is construction 020\'s statement and the reason the task force answers delegation early: chain resolution is a disclosure boundary of the same kind as completion evidence, and an agent that cannot prove its bounds is an agent nobody should accept a presentation from. The tooling that produced this specification runs under the same rule at a different scale: an assistant composes, reconstructs and drafts; a person signs, admits and publishes.';
p9.uses = ['construction 020 (delegation chain)', 'construction 004 (holder binding)', 'cred-tf #40 (delegation as a design-time case)', 'the mediator instrument of the evidence repository (proving tiers; the four exits from a failed local proof)', 'AGENT-RUNTIMES.md (dtgwg-zkp-tf PR #21)', 'ePrint 2026/333 App. B.1 (AI agent reputation)'];
p9.body = `#### The separation of proving from acting

An agent presents on a person's behalf in two roles, and the constructions in this specification assume the two are held by two distinct processes.

\`\`\`
principal — holds the credentials and the holder secret
   │  issues a delegation: scope, validity, and an acceptance the delegate countersigns
   ▼
acting process ── composes presentations, chooses what to disclose, requests signatures ──▶ verifier
   │              never holds the holder secret; sees only what it composes
   ▼
boundary process ── holds the holder secret and keys; signs only acts that are in scope, chained to the
                    delegation, and not already signed; keeps an append-only record of what it signed;
                    refuses everything else — as values, never as errors
\`\`\`

The boundary process is the party that can be held to the drafting rules. It knows the adversary it protects against — the acting process itself and everything the acting process talks to — the horizon of every key it holds, and what it does not establish: that an act was wise, only that it was in scope. The acting process is the party that can be delegated, replaced, or run by a third party without the secret leaving the holder. What passes between them is a request and a signature; what never passes is the secret. A verifier sees a proof that an agent acting for a member of a recognised community did so within a stated scope before a stated time — construction 020 — and learns neither which member nor what else the agent may do.

Construction records use this separation without naming it. The witness of every record is what the boundary process holds; the disclosure set is what the acting process is permitted to compose; holder binding (construction 004) is the clause that ties the two to one secret. The mediator instrument in the evidence repository specifies the tiers at which a third party may run the acting process — a mediator that proves on the holder's behalf must be unable to learn the witness or to correlate presentations — and the four exits from a failed local proving attempt, none of them silent.`;

writeFileSync(p, JSON.stringify(map, null, 2) + '\n');
console.log('P9 rewritten; excludeFromSpec', map.excludeFromSpec, '; rewrites', map.rewrites.length);
