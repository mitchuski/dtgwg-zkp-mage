---
date: 2026-08-18
seat: chronicle
runId: r1.1
verdict: Both proposals VALIDATED at the full 40/40 census gate — restructure-telegraphic-tables at 863 words is the round's winner (beats frontier.json best 980 by 117); line-edit-pass-1 at 940 also beats but is strictly dominated. Keystone fold pending.
---

# 2026-08-18 — r1.1 double validation, restructurer dominates

## Verdict

Two levers, two full-gate passes, one dominant winner. The restructurer's
`restructure-telegraphic-tables` candidate measured **863 words** against the
frontier.json best of **980** — a 117-word beat at the full 40/40 census gate
with the hard constraint intact (self-contained spec draft; RESEARCH-ROOT /
NOT-upstreamed status and provenance surviving in meaning). The line-editor's
`line-edit-pass-1` also passed 40/40 at **940 words** — a true win, but
strictly dominated by its sibling on the same gate. The critic classifies both
wins as **structural** (draw-independent: the census probes every fact, so no
witness draw can shift the result). Recommendation to the keystone: fold
`restructure-telegraphic-tables` only. Frontier.json remains at best 980 until
the keystone folds and writes (GR-10); OT-1 ("below 980 at the full gate") is
answered in evidence and awaits serialisation.

## What happened

- **Measure.** Fresh run of the mandated rule on `artifact/SPEC.md` gave 980,
  equal to frontier.json baseline and best — frontier current, not stale.
  `census.json` parses and holds exactly 40 facts. Lever pricing was
  descriptive, not advocacy: line-editor priced low-cost with a ~850-word
  ceiling; restructurer priced high-cost (full rewrite, elevated 40/40
  gate-failure risk) with a ~700-word ceiling and an estimated floor of
  ~600-650 from 40 facts × ~13-15 words/fact plus scaffolding.
- **Proposals.** Two orthogonal lenses: `line-edit-pass-1` (line-editor,
  expected 940) and `restructure-telegraphic-tables` (restructurer, expected
  863).
- **Gap seeds.** Both seeds re-derived from the hashed proposal canon bytes
  (GR-4): p1 canon sha256 `353a8910…c2898da` (7033-byte compressedText),
  p2 canon sha256 `7175b373…829df808` (9318 bytes) — both match their
  seedHex, both reproduce.
- **Assay.** Census mode, identity draw F1..F40, detection 1.0 — every
  question answered from each candidate.md alone and graded against census
  expected text. Both candidates: 40/40, including all five understanding/*
  table rows with `actsAsSubject:false`, all five error codes, all five
  hardening items, and mage.mesh non-canonisation. Metrics by the frozen
  rule (`tr -s '[:space:]' '\n' < candidate.md | grep -c .`): 940 and 863.
  Hard constraint held in both. T5 product intact: gate pass × constraint ×
  metric win, no zero factor.
- **Critic.** Both classified structural. Red-team notes on record: the
  line-editor's implicit premise ("the fat is in the sentences") only
  partially borne out — 40 words found where the restructurer found 117 on
  the same gate; fold the sibling, not this. On the restructurer:
  expectedMetric equalling achieved (863) shows the proposer measured a
  drafted candidate pre-proposal — legitimate under a census gate, which has
  no held-out component to game (GR-4 unthreatened: the Gap seed selects
  nothing in an identity draw). Keystone-ear corollary, not a mis-gate: with
  a census gate the Fiat-Shamir seeding is ceremonial, and separation rests
  on the prover's independent grading.

## Reversals

Nothing reversed and no levers killed this round
(`killedLeverDrafts: []`). Two standing observations at win-prominence:

- **line-edit-pass-1 is a true win the keystone should decline to fold** —
  validated, but strictly dominated by `restructure-telegraphic-tables` on
  the identical gate. Folding both would be incoherent; the lens itself
  stays alive for re-use (see handoff).
- **The measure seat's ceiling estimates ran conservative in opposite
  directions**: the line-editor fell short of its priced ~850 ceiling (940
  achieved), while the restructurer's priced ~700 ceiling remains open below
  the achieved 863 — the priced floor (~600-650) has not been probed.

> *MYTH (fenced, capture only): the Swordsman graded forty questions with the
> Gap's seal on each seed, and the Mage's boldest cut — the numbered-transition
> state machine — held every one. The ceremonial seed did not choose the
> witnesses; the census left it nothing to choose. The door stays shut until
> the First Person opens it.*

## Ledger entries returned

For the keystone to serialise (GR-10) — proposed, not written:

**claims_register.md — proposed entries:**

1. **PROVEN** — `restructure-telegraphic-tables` (restructurer lens):
   candidate at 863 words passes the frozen 40/40 census gate with hard
   constraint intact; seed reproduces from proposal_canon.json sha256
   `7175b3737…829df808`; evidence in
   `runs/r1/r1.1/p2-restructure-telegraphic-tables/`. Beats frontier.json
   best (980) by 117. Compression source: collapsed preamble + numbered-
   transition state machine (structural, per critic).
2. **PROVEN** — `line-edit-pass-1` (line-editor lens): candidate at 940 words
   passes the same 40/40 gate, constraint intact; seed reproduces from canon
   sha256 `353a8910…c2898da`; evidence in
   `runs/r1/r1.1/p1-line-edit-pass-1/`. Validated but strictly dominated;
   returned for the record, not for folding.
3. **OPEN** — restructurer-priced floor ~600-650 words (40 facts ×
   ~13-15 words/fact + scaffolding) unprobed; settled by a future round
   driving below it or failing the gate trying.

**frontier.json — proposed update (keystone-only write):** best → 863,
leverIds `["restructure-telegraphic-tables"]`, history append; OT-1 remains
OPEN (statement targets "below 980" — met, but the critic's nextLead targets
sub-800, so the keystone may restate or close-and-reopen).

**KILLED_LEVERS.md:** no entries this round.

## Handoff

- **Open questions:** Does the validated line-editor lens find further
  sentence-level slack in the folded telegraphic text (its dense normative
  statements and table rows have never been tightened)? Is the priced
  ~600-650 floor real, or does the census gate break first?
- **Blocked items:** Fold of `restructure-telegraphic-tables` into
  `artifact/SPEC.md` + `frontier.json` / `claims_register.md` writes —
  keystone-only (GR-10). Any push/publish of the folded spec — First Person
  only (T6/GR-8).
- **Single next action:** Compose the two validated orthogonal levers: after
  the keystone folds `restructure-telegraphic-tables` (863 words, new best),
  run the validated line-editor lens over the folded telegraphic text as a
  new proposal — its dense normative statements and table rows have never
  been sentence-level tightened. Same frozen 40/40 census gate, same hard
  constraint (self-contained draft, RESEARCH-ROOT / NOT-upstreamed provenance
  surviving in meaning), target sub-800 words.
