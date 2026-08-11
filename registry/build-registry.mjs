// build-registry.mjs — static site builder for the lane-1 verification registry.
//
//   node registry/build-registry.mjs [outDir]     (default: registry/site)
//
// Zero dependencies. Deterministic (fixtures discipline): sorted inputs, no
// timestamps in output except the per-submission dates carried in the data
// files themselves. Inputs:
//   registry/data/submissions/*.json   — accepted submissions (added manually
//                                        after verify-run.mjs accepts; the
//                                        acceptance flow is X10 lane 1)
//   registry/data/seats.json           — admission list (governance data)
//   runtimes/circom-gadget/artifacts.manifest.json — the pinned digests
//
// Output: three pages (index, participate, ceremony) in the call companion's
// visual language. Published via GitHub Pages (.github/workflows/pages.yml).

import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(DIR, '..');
const OUT = path.resolve(process.argv[2] ?? path.join(DIR, 'site'));

const REPO_URL = 'https://github.com/mitchuski/dtgwg-zkp-mage';
const ISSUE_URL = `${REPO_URL}/issues/new?template=verification-run.yml`;

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ---------------------------------------------------------------------------
// load data (sorted, loudly)
// ---------------------------------------------------------------------------
const manifestPath = path.join(REPO, 'runtimes', 'circom-gadget', 'artifacts.manifest.json');
let manifest;
try {
  manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
} catch {
  process.stderr.write(`missing ${manifestPath} — sync the lab (runtimes/) before building the registry\n`);
  process.exit(1);
}
const seats = JSON.parse(readFileSync(path.join(DIR, 'data', 'seats.json'), 'utf8'));
const subDir = path.join(DIR, 'data', 'submissions');
const submissions = readdirSync(subDir)
  .filter((f) => f.endsWith('.json'))
  .sort()
  .map((f) => ({ file: f, ...JSON.parse(readFileSync(path.join(subDir, f), 'utf8')) }));

// ---------------------------------------------------------------------------
// shared shell
// ---------------------------------------------------------------------------
const CSS = `
:root{--ink:#1a1a1a;--silver:#7a7a82;--paper:#fbfaf7;--card:#ffffff;--hairline:#e4e2db;
--proved:#1e6f50;--proved-soft:#e8f2ec;--open:#8a6d1f;--open-soft:#f5efdc;
--serif:'EB Garamond',Georgia,serif;--mono:'IBM Plex Mono',ui-monospace,monospace}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--paper);color:var(--ink);font-family:var(--serif);font-size:18px;line-height:1.55}
a{color:var(--proved);text-decoration:none;border-bottom:1px solid rgba(30,111,80,.35)}
a:hover{border-bottom-color:var(--proved)}
.wrap{max-width:820px;margin:0 auto;padding:0 22px}
header{padding:44px 0 24px;border-bottom:1px solid var(--hairline)}
.kicker{font-family:var(--mono);font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--silver)}
h1{font-size:clamp(28px,5vw,38px);font-weight:500;line-height:1.14;margin:12px 0 8px}
h1 em{font-style:italic;font-weight:400}
nav.jump{font-family:var(--mono);font-size:12.5px;border-bottom:1px solid var(--hairline)}
nav.jump .wrap{display:flex;gap:20px;padding:11px 22px;overflow-x:auto;white-space:nowrap}
nav.jump a{color:var(--silver);border:none}nav.jump a:hover{color:var(--ink)}
nav.jump a.here{color:var(--proved)}
section{padding:34px 0 6px}
h2{font-size:24px;font-weight:600;margin-bottom:12px}
.card{background:var(--card);border:1px solid var(--hairline);border-radius:8px;padding:18px 20px 15px;margin-bottom:20px}
.card h3{font-size:20px;font-weight:600;margin-bottom:10px}
.card ul{list-style:none;margin:2px 0 12px}
.card li{padding-left:16px;position:relative;margin-bottom:7px;font-size:16px}
.card li::before{content:"\\B7";position:absolute;left:2px;color:var(--silver);font-weight:700}
code,pre{font-family:var(--mono)}
code{font-size:.84em;background:#f2f1ec;padding:1px 5px;border-radius:3px}
pre{font-size:12.5px;line-height:1.6;background:#f2f1ec;border:1px solid var(--hairline);border-radius:6px;
padding:12px 14px;margin:4px 0 14px;overflow-x:auto}
pre code{background:none;padding:0}
table{width:100%;border-collapse:collapse;font-size:14px;margin:6px 0 14px}
th{font-family:var(--mono);font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--silver);
text-align:left;padding:6px 10px 6px 0;border-bottom:1px solid var(--hairline);font-weight:500}
td{padding:7px 10px 7px 0;border-bottom:1px solid var(--hairline);vertical-align:top}
.mono{font-family:var(--mono);font-size:12.5px}
.digest{font-family:var(--mono);font-size:11px;word-break:break-all;color:#3a3a3a}
.tag{font-family:var(--mono);font-size:11px;padding:2.5px 8px;border-radius:99px}
.tag.r{background:var(--proved-soft);color:var(--proved)}
.tag.o{background:var(--open-soft);color:var(--open)}
.pf{background:var(--card);border:1px solid var(--hairline);border-left:3px solid var(--open);
border-radius:0 8px 8px 0;padding:14px 18px;margin:6px 0 24px;font-size:16px}
.pf .lab{font-family:var(--mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--open);display:block;margin-bottom:5px}
.note{font-size:15.5px;color:#3a3a3a;margin:0 0 12px}
.proverb{font-style:italic;color:var(--silver);font-size:15.5px;border-top:1px dashed var(--hairline);padding-top:9px}
.proverb::before{content:"\\2767  ";color:var(--silver)}
footer{padding:28px 0 56px;border-top:1px solid var(--hairline);margin-top:36px;
font-family:var(--mono);font-size:12.5px;color:var(--silver)}
`;

function page({ title, active, body }) {
  const tabs = [
    ['index.html', 'Registry'],
    ['participate.html', 'Participate'],
    ['ceremony.html', 'Ceremony lanes'],
  ].map(([href, label]) =>
    `<a href="${href}"${active === href ? ' class="here"' : ''}>${label}</a>`
  ).join('\n    ');
  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>${CSS}</style>
</head>
<body>
<header><div class="wrap">
  <div class="kicker">ToIP · DTG ZKP Task Force · experimental lab · evidence, not spec</div>
  <h1>Verification registry<br><em>independent runs of the lab circuits</em></h1>
</div></header>
<nav class="jump"><div class="wrap">
    ${tabs}
    <a href="${REPO_URL}">repo ↗</a>
</div></nav>
${body}
<footer><div class="wrap">
  lane 1 of X10 ceremony-as-trust-task · evidence lives in the lab, spec text lives upstream ·
  positions welcome: ratify · refine · refute · build
</div></footer>
</body>
</html>
`;
}

// ---------------------------------------------------------------------------
// index — the registry
// ---------------------------------------------------------------------------
function circuitCells(sub) {
  return Object.keys(manifest.circuits).map((c) => {
    const rep = sub.reports.find((r) => r.pinned.circuit === c);
    if (!rep) return '<td class="mono">—</td>';
    const findings = (sub.verdict.findings || []).filter((f) => f.circuit === c);
    const advisory = findings.some((f) => String(f.code || f).includes('advisory'));
    return `<td class="mono">${advisory ? '✓*' : '✓'}</td>`;
  }).join('');
}

const registryRows = submissions.map((s) => `
      <tr>
        <td><strong>${esc(s.seat.name)}</strong><br><span class="mono">${esc(s.seat.affiliation)}</span></td>
        <td class="mono" style="white-space:nowrap">${esc(s.date)}</td>
        <td><span class="tag ${s.position === 'refute' ? 'o' : 'r'}">${esc(s.position)}</span></td>
        ${circuitCells(s)}
        <td class="mono">${esc(s.role ?? '')}</td>
      </tr>`).join('');

const indexBody = `
<section><div class="wrap">
  <div class="card">
    <h3>What this is</h3>
    <p class="note">The <a href="${REPO_URL}">experimental lab</a> ships three Groth16/BN254 circuits with
    a <strong>deterministic, fixed-entropy lab setup</strong> so that independent machines can rebuild them and
    compare artifacts. This registry records those independent runs: who ran the suites, on what, and whether
    their artifact digests match the pinned manifest. It is the working machinery behind the task force ask
    for verification volunteers &mdash; and deliberately the same machinery a future ceremony lane would need
    (queue, public log, per-seat attestation), built where nothing secret exists yet.</p>
    <ul>
      <li>Acceptance is decided by <code>verify-run.mjs</code> against <code>artifacts.manifest.json</code>
        &mdash; named verdicts, never adjectives. Wall-clock timings are informative only and never enter the decision.</li>
      <li>The <strong>compiled circuit</strong> (r1cs, wasm, constraint counts) must match byte-exactly
        &mdash; that is deterministic by construction. The <strong>setup chain</strong> (ptau, zkeys, vkey) is
        machine-local: snarkjs mixes its own randomness into every contribution regardless of the fixed
        entropy string (established empirically, 2026-08-11, by same-machine rebuild). Setup digests are
        recorded as advisory; the proving-system claim comes from the volunteer's own suites running green
        &mdash; real proofs verified against their own build.</li>
      <li>Submissions carry digests and a run record &mdash; never artifacts (a full rebuild is ~92&nbsp;MB;
        a report is a few KB).</li>
    </ul>
  </div>

  <h2>Accepted runs</h2>
  <table>
    <thead><tr><th>Seat</th><th>Date</th><th>Position</th><th>single</th><th>dual</th><th>guardian</th><th>Note</th></tr></thead>
    <tbody>${registryRows}
    </tbody>
  </table>
  <p class="note">✓ = all required digests match the manifest · ✓* = required match with an advisory
  zkey divergence recorded. <a href="participate.html">File your own run →</a></p>

  <div class="pf"><span class="lab">the caveat that travels with everything here</span>
  The trusted setup is a lab fixture with fixed entropy &mdash; honest, reproducible benchmarks; proving keys
  unusable for production. Nothing in this registry is a production ceremony. See <a href="ceremony.html">ceremony lanes</a>
  for what is gated and why.</div>

  <p class="proverb">the fastest way to disagree is a failing test</p>
</div></section>`;

// ---------------------------------------------------------------------------
// participate — commands + canonical digests
// ---------------------------------------------------------------------------
const digestTables = Object.entries(manifest.circuits).map(([name, c]) => `
  <h3 class="mono">${esc(name)} (${esc(c.compileFlags)}) — ${c.constraints.nConstraints} constraints</h3>
  <table>
    <thead><tr><th>Artifact</th><th>Bytes</th><th>Acceptance</th><th>sha256</th></tr></thead>
    <tbody>${Object.entries(c.artifacts).map(([k, a]) => `
      <tr><td class="mono">${esc(k)}</td><td class="mono">${a.bytes}</td>
      <td><span class="tag ${a.acceptance === 'required' ? 'r' : 'o'}">${esc(a.acceptance)}</span></td>
      <td class="digest">${esc(a.sha256)}</td></tr>`).join('')}
    </tbody>
  </table>`).join('\n');

const participateBody = `
<section><div class="wrap">
  <div class="card">
    <h3>Run it yourself</h3>
    <p class="note">Prerequisites: Node ≥ 20, the <a href="https://docs.circom.io/getting-started/installation/">circom 2.x compiler</a>
    on PATH, and Python 3 for the cross-language consumer. Everything else pins from the committed lockfile.</p>
<pre><code>git clone ${REPO_URL}
cd dtgwg-zkp-mage/runtimes/circom-gadget
npm install

node setup.mjs          &amp;&amp; node test.mjs            # 10/10
node setup-dual.mjs     &amp;&amp; node test-dual.mjs       # 7/7
node setup-guardian.mjs &amp;&amp; node test-guardian.mjs   # 8/8

node report.mjs                                     # digests + run record
node verify-run.mjs build/report.*.json             # verdict vs the manifest
</code></pre>
    <p class="note">Or let the orchestrator drive the whole flow and print a paste-ready submission
    (seat ids are the task force admission list &mdash; ask in the upstream Discord channel or an issue):</p>
<pre><code>cd ../ceremony-orchestrator
node orchestrate.mjs &lt;your-seat-id&gt;
</code></pre>
    <ul>
      <li>File the printed submission via the <a href="${ISSUE_URL}">verification-run issue template</a>.</li>
      <li>Timings vary by machine and are informative. The circuit digests (r1cs/wasm) are the byte-exact
        claim; your setup-chain digests will legitimately differ (contribution randomness) and are recorded
        as advisory.</li>
      <li>A <strong>mismatch is a contribution</strong>: a reproducible divergence on a required artifact is
        exactly the kind of finding the position protocol wants (position: refute, with your report attached).</li>
    </ul>
  </div>

  <h2>Canonical digests (pinned manifest)</h2>
  <p class="note">Minted from the maintainer build; entropy fixture <code>${esc(manifest.entropy)}</code>.</p>
  ${digestTables}
</div></section>`;

// ---------------------------------------------------------------------------
// ceremony — the lanes and the gates
// ---------------------------------------------------------------------------
const ceremonyBody = `
<section><div class="wrap">
  <div class="card">
    <h3>Lane 1 — verification registry (live)</h3>
    <p class="note">This site. Independent rebuilds, digest matching, public log. No secrets exist anywhere
    in this lane; the fixed-entropy fixture is the point, not a flaw.</p>
  </div>
  <div class="card">
    <h3>Lane 2 — phase-1 powers-of-tau (proposed, not live)</h3>
    <ul>
      <li>A universal BN254 phase-1 ceremony (pot15+) survives every circuit change, serves any future
        Groth16 phase 2, and a KZG-based PLONKish counter-proposal consumes the same SRS &mdash; useful
        whichever way construction selection goes.</li>
      <li>Contribution rule, fixed in advance: <strong>agents orchestrate entropy; they are never the
        entropy.</strong> Contribution randomness comes from the contributing machine's OS CSPRNG inside the
        contribution subprocess. An orchestrating agent's whole captured view is scanned to prove the secret
        appears nowhere &mdash; an agent context window is an observer, and a beacon value that transits it is a
        compromised contribution.</li>
      <li>Seat admission is governance data (revocable, auditable), never a soundness assumption. Any
        nullifier-based dedup runs advisory-only: no ceremony-security claim may rest on artifacts the
        ceremony produces.</li>
    </ul>
    <p class="note">Opens only as a named working-group activity after the upstream proposal is discussed.</p>
  </div>
  <div class="card">
    <h3>Lane 3 — phase-2 per-circuit ceremony (gated)</h3>
    <p class="note">Closed until construction selection (decision document §25) closes and the circuit is
    frozen. A per-circuit production ceremony before that would consecrate the benchmarking vehicle as the
    product. The orchestrator's lane-3 entry point does not exist as runnable code &mdash; it throws
    <code>phase2-gate-closed</code> unconditionally, and a property test asserts no contribution path can be
    constructed in the suite.</p>
  </div>
  <div class="pf"><span class="lab">drafting rule four, applied to this page</span>
  Everything above the gate line is operational today and conjecture-free. Everything below it is a proposal
  awaiting task-force process. The recursion (using lab circuits to gate a ceremony the circuits depend on)
  is named, bounded to advisory duty, and never load-bearing.</div>
  <p class="proverb">a ceremony is a trust task: the transcript is the attestation</p>
</div></section>`;

// ---------------------------------------------------------------------------
// emit
// ---------------------------------------------------------------------------
mkdirSync(OUT, { recursive: true });
const pages = [
  ['index.html', page({ title: 'DTG ZKP lab — verification registry', active: 'index.html', body: indexBody })],
  ['participate.html', page({ title: 'DTG ZKP lab — participate', active: 'participate.html', body: participateBody })],
  ['ceremony.html', page({ title: 'DTG ZKP lab — ceremony lanes', active: 'ceremony.html', body: ceremonyBody })],
];
for (const [name, html] of pages) {
  writeFileSync(path.join(OUT, name), html);
  process.stdout.write(`  ok  ${name} (${Buffer.byteLength(html)} B)\n`);
}
writeFileSync(path.join(OUT, '.nojekyll'), '');
process.stdout.write(`registry site: ${pages.length} pages + .nojekyll -> ${OUT}\n`);
