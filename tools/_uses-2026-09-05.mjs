// one-shot: no tale framing in the background's "Used by" lines
import { readFileSync, writeFileSync } from 'node:fs';
const p = 'zkbook/transfer/spellbook-map.json';
const map = JSON.parse(readFileSync(p, 'utf8'));
let n = 0;
for (const s of map.sections) {
  s.uses = s.uses.map(u => {
    const v = u
      .replace(/Zero Tale 32 · The Flock \(frontier tale, Blade 61 \/ V47\) — its Technical Bridge is this section's post-quantum case/, 'the Flock subsection below — this section’s post-quantum case')
      .replace(/\bfrontier tale\b/g, 'frontier addendum').replace(/\bTale (\d+)\b/g, 'subsection $1');
    if (v !== u) n++; return v;
  });
}
writeFileSync(p, JSON.stringify(map, null, 2) + '\n');
console.log('uses lines changed:', n, '| residual tale mentions in sections:', (JSON.stringify(map.sections).match(/\bTales?\b/g) || []).length);
