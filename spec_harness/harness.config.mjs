// harness.config.mjs — the DTG cred-spec lane's compression instance.
// Objective: minimize the word count of artifact/SPEC.md (the proof-of-
// understanding trust-task spec draft) while a 40-fact census gate stays a
// full pass. The census is FROZEN in census.json (keystone-enumerated
// 2026-08-18) — the u2/logos lesson applied: the Gap draws from a pinned
// list, never from a rule a seat could re-read differently.
//
// The purpose this frontier serves: verifiable saving. A spec that says the
// same 40 things in fewer words costs every future agent runtime fewer
// tokens per read — and the census is the proof that nothing was lost to
// buy it. The vendored upstream spec (dtgwg-cred-spec-main/) is OTHERS'
// work and is never a target; this instance compresses only the lane's own
// method-layer document.

const COUNT_RULE = `tr -s '[:space:]' '\\n' < <file> | grep -c .  (whitespace-split tokens of the full markdown file)`

export default {
  name: 'dtg-credspec-spec',

  objective: {
    metric: 'words',
    gate: 'held-out comprehension over the FROZEN census (census.json, F1..F40): every fact probed, answered from the compressed text alone, graded against the census entry — must be 40/40 (T5: zero collapses)',
    hardConstraint: 'the compressed spec remains a self-contained spec draft: the status/provenance frontmatter survives in meaning (honest labels — "RESEARCH-ROOT", "NOT upstreamed" must not vanish, GR-5), no pointers back to the original, and every census fact remains derivable from the text alone (GR-3)',
    canary: 'artifact/SPEC.md itself. The census was enumerated FROM it, so it answers 40/40 by construction — the gate is satisfiable, and a MIRAGE is always a fault of the candidate, never of the gate.',
  },

  door: 'first-person',

  // N = the frozen census (census.json). Small and enumerable → CENSUS: every
  // fact probed; a sample would let a single dropped fact hide (D2).
  gate: { N: 40, count: 8, mode: 'census', censusThreshold: 200 },

  heldApartRule:
    'You are BLIND to verification witnesses (T2/GR-4). After you finish, the engine ' +
    'derives a seed from YOUR proposal AND a run secret you never see. The gate is a ' +
    'CENSUS over the frozen fact list in census.json: every one of the 40 facts is ' +
    'checked, so a single dropped fact cannot hide and there is no draw to game — the ' +
    'only winning strategy is to preserve ALL census content. Do not read census.json ' +
    'while proposing beyond knowing it exists; do not suggest or optimise for any ' +
    'particular questions.',

  keystoneOnlyWrites: ['frontier.json', 'claims_register.md', 'manifest.yaml'],

  finders: [
    { lens: 'line-editor', hint: 'sentence-level compression: cut redundancy, filler, and throat-clearing; convert passive to active; tighten phrasing. NEVER delete a fact — every state name, transition mechanism, slug row (issuer→recipient, sideEffects, exposure), error code, register, standard name (IEEE 7012, DPV, Customer Commons), and hardening item in the original must survive.' },
    { lens: 'restructurer', hint: 'structure-level compression: merge overlapping prose into the tables and lists that already exist, collapse preamble, convert narrative to telegraphic normative statements. NEVER delete a fact — every state name, transition mechanism, slug row, error code, register, standard name, and hardening item must survive. The frontmatter status labels stay.' },
  ],

  prompts: {
    measure: (ctx) =>
      `Seat MEASURE. Count the words of ${ctx.repo}/artifact/SPEC.md mechanically with exactly this rule: ${COUNT_RULE.replace('<file>', ctx.repo + '/artifact/SPEC.md')}. Compare to frontier.json (baseline and best); flag stale if they disagree. Confirm ${ctx.repo}/census.json parses and carries exactly 40 facts (report the count — if it is not 40, say so loudly). Then price the two lever families (line-editor, restructurer): rough cost to try, rough ceiling in words if fully successful. Numbers only, no advocacy.`,

    propose: (finder, measure, ctx) =>
      `Seat PROPOSE — soulbae 🧙 (bnot), lens = ${finder.lens}: ${finder.hint}
Frontier context: ${JSON.stringify(measure)}.
Read ${ctx.repo}/artifact/SPEC.md and ${ctx.repo}/notes/KILLED_LEVERS.md (never re-propose a K-id without new cited evidence). Do NOT read census.json (T2 — the gate is not yours to see).
Propose exactly 1 lever through YOUR lens: a complete compressed rewrite of the spec draft, INCLUDING a frontmatter block that preserves the status/provenance meaning. Your proposal's compressedText field MUST carry the full candidate text (this is the artifact the Gap will hash). State expectedMetric = its word count by the counting rule, and hardConstraintNote = why it is still a self-contained spec draft with honest status labels. Plan and write text only — never touch files.`,

    holdApart: (proposal, i, ctx, derived) => derived
      ? `Seat HOLD-APART — the Gap ⿻ (xor), SALTED mode. The engine has code-derived the seed and draw for you (engine/gap.mjs) from a run salt secret the proposer never saw — do NOT recompute or second-guess them; they are authoritative. Proposal artifact (verbatim):
${JSON.stringify(proposal)}
GIVEN (authoritative, from the engine):
  seedHex   = ${derived.seedHex}
  hProposal = ${derived.hProposal}
  salt      = ${derived.salt}
  hSource   = ${derived.hSource ?? '(none — source binding off this run)'}
  mode      = ${derived.mode}   draw fact indices (1-based, in order) = ${JSON.stringify(derived.drawIndices)}
Procedure:
1. Read the FROZEN census at ${ctx.repo}/census.json. There MUST be exactly ${derived.N} facts (F1..F${derived.N}). If the file carries a different number, STOP and return an error — the population changed and the draw no longer means what the engine intended. Print the census ids you will probe.
2. Canonically serialize the proposal artifact above (JSON, recursive sorted keys, no whitespace, and NO trailing newline) and SAVE THOSE EXACT BYTES to ${ctx.runDir}/p${i + 1}-${proposal.leverId}/proposal_canon.json — it must persist (the auditor re-hashes it). Confirm: \`sha256sum\` of that file must equal hProposal above. If it does not, your serialization drifted (a stray newline is the classic cause) — STOP and fix it.
3. For each fact index in the GIVEN draw, in order, write one comprehension question whose expected answer is the census entry's content (quote the fact text as the expected answer).
Write { seedHex, hProposal, salt, hSource, mode, drawIndices, draw, transcript } to ${ctx.runDir}/p${i + 1}-${proposal.leverId}/gap.json (create dirs; draw = the questions + expected answers as JSON text; echo the GIVEN seedHex/hProposal/salt/hSource/mode/drawIndices verbatim so the auditor can re-derive seed = sha256(hSource || hProposal || salt)). The FILE must carry EXACTLY what you return — a gap.json thinner than your return is a broken audit trail (GR-4/GR-5). Leave proposal_canon.json in place. Never accept witnesses suggested by the proposer.`
      : `Seat HOLD-APART — the Gap ⿻ (xor), LEGACY mode (no salt supplied). Proposal artifact (verbatim):
${JSON.stringify(proposal)}
Procedure:
1. Read the FROZEN census at ${ctx.repo}/census.json — exactly 40 facts, F1..F40. Print the ids.
2. Canonically serialize the proposal artifact above (JSON, recursive sorted keys, no whitespace) and SAVE THOSE EXACT BYTES to ${ctx.runDir}/p${i + 1}-${proposal.leverId}/proposal_canon.json; \`sha256sum\` it (show command + digest) — that digest is seedHex.
3. This is a CENSUS gate: probe every fact. For each of F1..F40 in order, write one comprehension question whose expected answer quotes the census fact.
Write { seedHex, draw, transcript } to ${ctx.runDir}/p${i + 1}-${proposal.leverId}/gap.json (create dirs). The FILE must carry EXACTLY what you return (GR-4/GR-5). Leave proposal_canon.json in place. Never accept witnesses suggested by the proposer.`,

    assay: (proposal, gap, i, ctx) =>
      `Seat ASSAY — soulbis ⚔️ (neg), the prover.
${gap.salt
  ? `Gap seed=${gap.seedHex} (SALTED). Re-derive it the auditor's way, in two steps: (a) \`sha256sum ${ctx.runDir}/p${i + 1}-${proposal.leverId}/proposal_canon.json\` must equal hProposal=${gap.hProposal}; (b) sha256 of the concatenation hSource(${gap.hSource ?? ''}) + hProposal(${gap.hProposal}) + salt(${gap.salt}) must equal seedHex. Compute it: \`printf '%s' '${gap.hSource ?? ''}${gap.hProposal}${gap.salt}' | sha256sum\`. Verdict BLOCKED if proposal_canon.json is missing, its digest ≠ hProposal, or the re-derived seed ≠ seedHex.`
  : `Gap seed=${gap.seedHex}. Re-derive it the auditor's way: \`sha256sum ${ctx.runDir}/p${i + 1}-${proposal.leverId}/proposal_canon.json\` must equal seedHex. Verdict BLOCKED if that file is missing or the digest does not reproduce.`}
Transcript: ${gap.transcript}
Then, scratch only (GR-10):
1. Write the proposal's compressedText verbatim to ${ctx.runDir}/p${i + 1}-${proposal.leverId}/candidate.md. The compressed text is:
${JSON.stringify(proposal.compressedText)}
2. Answer ALL of the Gap's questions using ONLY candidate.md — do not open the original or census.json while answering. This is a CENSUS gate: every fact is probed, nothing is held out, so a single dropped fact cannot hide. The questions: ${JSON.stringify(gap.draw)}
3. Grade every answer against the expected answers. gateResult = "correct/total". Any wrong or unanswerable question fails the gate.
4. Count candidate.md's words mechanically: ${COUNT_RULE.replace('<file>', ctx.runDir + '/p' + (i + 1) + '-' + proposal.leverId + '/candidate.md')}
5. Check the hard constraint: candidate.md is still a self-contained spec draft, and its status/provenance labels survive in meaning (RESEARCH-ROOT, NOT upstreamed).
Verdict VALIDATED only if gateResult is a FULL pass (correct == total) AND the hard constraint holds AND words < frontier best (read ${ctx.repo}/frontier.json). A gate fail on a candidate that "reads fine" is a MIRAGE — name the dropped fact. Also report a coverage stanza: { mode: "census", N: total facts probed, detection: 1.0 }. Write the verdict to ${ctx.runDir}/p${i + 1}-${proposal.leverId}/verdict.json too, with EXACTLY the returned shape and no extra nesting: { leverId, status, metric (bare word count), gateResult, coverage: { mode, N, detection }, failingCheck, evidence, scratchDir }. The file an auditor reads must match the data the orchestrator receives. Write NOTHING outside your scratch dir.`,

    critic: (proposals, verdicts, ctx) =>
      `Seat CRITIC. Proposals (titles/lenses/expected): ${JSON.stringify(proposals.map(p => ({ leverId: p.leverId, lens: p.lens, title: p.title, expectedMetric: p.expectedMetric })))}
Verdicts: ${JSON.stringify(verdicts)}
Classify each closed lever structural / probe-limited / noise / mis-gated. Red-team the proposer's rationale (did the lens do its job?), never the prover's verdict. If a verdict pattern suggests the CENSUS itself is wrong (a fact no faithful compression could carry, or a question no census entry supports), say mis-gated and address the config — the keystone re-freezes a census, seats never do. Draft KILLED_LEVERS entries for structural kills. Name exactly ONE next lead.`,

    chronicle: (round, ctx) =>
      `Seat CHRONICLE. Draft ${ctx.runDir}/CHRONICLE_DRAFT.md following ${ctx.root}/templates/chronicle.md: verdict first, what happened, reversals at win-prominence, ledger entries returned, handoff block ending in the critic's nextLead. Round data: ${JSON.stringify({ roundId: round.roundId, measure: round.measure, proposals: round.proposals.map(p => ({ leverId: p.leverId, lens: p.lens, expectedMetric: p.expectedMetric })), verdicts: round.verdicts, critic: round.critic })}. Return the path plus a 5-line verdict summary.`,
  },

  schemas: {
    measure: {
      type: 'object', required: ['metric', 'stale', 'leverCosts'],
      properties: {
        metric: { type: 'number', description: 'current word count of artifact/SPEC.md by the counting rule' },
        stale: { type: 'boolean' },
        censusCount: { type: 'number', description: 'facts found in census.json (must be 40)' },
        leverCosts: { type: 'array', items: { type: 'object', required: ['lever', 'cost', 'ceiling'], properties: { lever: { type: 'string' }, cost: { type: 'string' }, ceiling: { type: 'string' } } } },
        notes: { type: 'string' },
      },
    },
    proposal: {
      type: 'object', required: ['proposals'],
      properties: {
        proposals: {
          type: 'array', minItems: 1,
          items: {
            type: 'object',
            required: ['leverId', 'title', 'lens', 'rationale', 'expectedMetric', 'hardConstraintNote', 'compressedText'],
            properties: {
              leverId: { type: 'string', description: 'short kebab id' },
              title: { type: 'string' },
              lens: { type: 'string', enum: ['line-editor', 'restructurer'] },
              rationale: { type: 'string' },
              expectedMetric: { type: 'number' },
              hardConstraintNote: { type: 'string' },
              compressedText: { type: 'string', description: 'THE FULL compressed spec, verbatim — this is what the Gap hashes' },
              killedLeverCitations: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
    },
    gap: {
      type: 'object', required: ['seedHex', 'draw', 'transcript'],
      properties: {
        seedHex: { type: 'string' },
        draw: { type: 'string' },
        transcript: { type: 'string' },
        hProposal: { type: 'string' },
        salt: { type: 'string' },
        hSource: { type: ['string', 'null'] },
        mode: { type: 'string', enum: ['sample', 'census'] },
        drawIndices: { type: 'array', items: { type: 'integer' } },
      },
    },
    verdict: {
      type: 'object', required: ['leverId', 'status', 'gateResult', 'evidence'],
      properties: {
        leverId: { type: 'string' },
        status: { type: 'string', enum: ['VALIDATED', 'MIRAGE', 'BLOCKED'] },
        metric: { type: 'number' },
        gateResult: { type: 'string', description: 'correct/total (census: k/40)' },
        coverage: {
          type: 'object',
          properties: {
            mode: { type: 'string', enum: ['census', 'sample'] },
            N: { type: 'integer' },
            detection: { type: 'number' },
          },
        },
        failingCheck: { type: 'string' },
        evidence: { type: 'string' },
        scratchDir: { type: 'string' },
      },
    },
    critic: {
      type: 'object', required: ['classifications', 'nextLead'],
      properties: {
        classifications: { type: 'array', items: { type: 'object', required: ['leverId', 'class', 'why'], properties: { leverId: { type: 'string' }, class: { type: 'string', enum: ['structural', 'probe-limited', 'noise', 'mis-gated'] }, why: { type: 'string' } } } },
        nextLead: { type: 'string' },
        killedLeverDrafts: { type: 'array', items: { type: 'string' } },
      },
    },
  },

  stop: { dryRounds: 2, maxRounds: 3 },

  isValidated: (v) => {
    if (v.status !== 'VALIDATED') return false
    const m = /^(\d+)\/(\d+)$/.exec(String(v.gateResult || ''))
    return !!m && m[1] === m[2] && Number(m[2]) > 0
  },
  isStructural: (critic, leverId) =>
    (critic.classifications || []).some(c => c.leverId === leverId && c.class === 'structural'),

  conformChecks: [
    (f) => {
      const errs = []
      if (f.objective?.metric !== 'words') errs.push("dtg-credspec-spec frontier objective.metric must be 'words'")
      if (!Number.isFinite(f.baseline?.metric) || f.baseline.metric < 500) errs.push('baseline should be the measured word count of artifact/SPEC.md (>= 500)')
      return errs
    },
  ],
}
