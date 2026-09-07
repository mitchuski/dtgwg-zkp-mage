# 2026-09-05 · The Book Takes a Name

> **What this is.** A *chronicle* is the maintainer's narrative working record of one significant day: what moved, in
> what order, and why the order is the method. This copy is the **collaborator telling**: the body is verbatim from the
> master series in the maintainer's private suite (framework voice), adapted only in this header and in paths, which are
> repo-relative or glossed. The master copy is the source of truth; a divergence here is a defect in the reflection.
> **Signed by the First Person: not yet.**
>
> **Runtime traces** — what carries this chronicle's claims, so a reader can run the narrative rather than take it:
> - `node board/test.mjs` — 43 checks (cards · state machine · rendering · WD02 vocabulary · watch digest · records · primer · stacks) all green on 2026-09-05
> - `node board/tools/board.mjs validate` — 12 cards `ok`; `board.mjs spec` — `zkbook/spec/recipes.md` (12) + `records.md` (1) + `stacks.md` (4) + 25 generated terms
> - `board/records/ADR-001.json` — Glenn Gore's record in its own form; 31-row crosswalk into card `010` (17 covered · 5 refined · 2 added · 3 partial · 4 open)
> - `board/stacks/{flock,lab-groth16-circom,provekit,siros-longfellow}.json` — facts with sources and a `verified` date; the audit statement is printed "claimed; not located" where no reviewed commit exists
> - `zkbook/transfer/spellbook-map.json` + `tools/transfer-spellbook.mjs` → `zkbook/spec/primer.md`; `zkbook/transfer/REPORT.md` (23 tales, 109 lore lines dropped by rule); test Q3 refuses narrative
> - `tools/push-rite.mjs` — `footer 21` prints, `footer 22` refuses `rite-not-spoken`, `speak 18` refuses `rite-retired`; ledger unchanged by the tests
> - `zkbook/PLAN-options-layer.md` §2.4 (reproduction ladder), §7.0 (generated Recommendations chapter); `zkbook/COMMIT-PLAN.md` (C1–C6 one PR after #21; C7 second)
> - `board/survey/WATCH.md` — the 22 upstream threads that moved since 08-28, with the cards they feed
> - upstream: [PR #21](https://github.com/trustoverip/dtgwg-zkp-tf/pull/21) open; [cred-spec #31](https://github.com/trustoverip/dtgwg-cred-spec/issues/31) row #9; [PR #30](https://github.com/trustoverip/dtgwg-cred-spec/pull/30); [cred-tf #39](https://github.com/trustoverip/dtgwg-cred-tf/discussions/39) / [#40](https://github.com/trustoverip/dtgwg-cred-tf/discussions/40)
> - Flock: [blog.succinct.xyz/introducing-flock](https://blog.succinct.xyz/introducing-flock/) · [succinctlabs/flock](https://github.com/succinctlabs/flock) · the local render of the book, chapter *Stacks*


*A week of upstream movement was read in the morning and folded by evening: the recipe book
became the ZK Book, took Glenn's record as its first entry, inherited the explanatory half of
a spellbook while leaving the story at home, learned to refuse a push until a proverb was
spoken, and gained a post-quantum wing in the same hour a frontier tale — the thirty-second — was written for
the book that lent it the name. Nothing was committed, posted or pushed. Twelfth in the ZK arc.*

**Scope:** the survey of `trustoverip/dtgwg-zkp-tf`, `dtgwg-cred-spec`, `dtgwg-cred-tf` and
`dtgwg-rahp-tf` since 08-28, now a tool (`board.mjs survey`) with a tracked digest; the run
note the maintainer's run note (git-excluded working record, not in this repo); the board lane
grown from nine cards to twelve; the **ZK Book** at `zkbook/`
(Spec-Up-T, rendered, served on `127.0.0.1:8426`) with its records, primer, pantry, stacks and
recipes chapters; the plan for the construction-options layer; the rite of the push
(`tools/push-rite.mjs`); the staged worktree a git worktree of the task-force repository (maintainer's machine) on branch `zkbook`;
Zero Tale 32 for the Zero Knowledge Spellbook (Zero Tale 32, *The Flock* (the maintainer's Zero Knowledge Spellbook — private canon; its Technical Bridge is `zkbook/transfer/tale-32-the-flock.md`)) and the
frontier-tale attachment method (the frontier-tale attachment method (maintainer's master docs, private)); nine proverbs served into
the ledger (seq 22–25 for drafts F–I; the rest await the commits they will gate).

---

## 1. What the week had moved, and what it moved in the cards

The credentials specification spent the week assembling its second working draft. Four
identifier types became one holder-declared correlation scope — `pairwise | directed |
public` — and the acronyms the whole graph had been described in were retired outright
(#22, PR #30). The merge plan that followed (#31) placed the one item nobody owns in the
proof layer's lap: "#9 stays open and gains weight … the resolution is cross-TF work with the
ZKP task force" — the common-control linkage that four things now lean on. talltree noticed
the same morning that three scopes leave exactly one case still needing a proof: the holder
who wishes to be recognised as one party across identifiers that were built to be different.

Two cards were re-carded into the new vocabulary and three were born: common control across
identifiers (007), the blinded binder Scott had put on the record (008), and intentional
correlation (012). Delegation moved from *requested* to *carded* on the strength of Scott's
acceptance and Glenn's core-versus-profile split. A test now refuses the retired acronyms in
any card body. The validator also refused something of the keeper's own: a second `carded`
entry in a card's history. Re-carding is a revision inside a state, not a state; the tool was
right and the record now has a `revisions[]` field because of it.

## 2. The name, and the first entry

The recipe book was the keeper's phrase from the week before. Today he renamed it: **the ZK
Book**, after the spellbooks his lore already keeps. The rename touched a tool, four
documents, a draft and a plan, and cost one server that was holding the old directory open.

He also settled what the first entry is. Glenn Gore's ADR-001 — *Community-Anchored Proof*,
Proposed 2026-08-25 — is now a **record**: kept in the requester's own form, not paraphrased
into a recipe, with a thirty-one-row crosswalk saying where each of its clauses landed in
recipe 010. Seventeen are carried as written. Five are carried with a precision the record did
not state — the grant half only for clause 3; the linkage a presenter cannot prove for the
counterparty. Two were added by the task force: S6, the voucher is not the holder; S7, one
secret behind both of a party's identifiers. Three are partial and four belong to other groups
— the published revocation bound, the registry interface, the transport fit, the governance
declaration. The Records chapter renders first after the introduction, so a reader meets the
question before the answer.

## 3. The story stays home; the teaching travels

The keeper's Zero Knowledge Spellbook — thirty tales, each a Story, a Spell Inscription and a
Technical Bridge — was found where it lives and read for its structure rather than its
narrative. The book takes only the bridges. A tool maps twenty-three tales into nine primer
sections, drops the lattice coordinates, the closing proverbs and the protocol brackets by
rule, and writes the chapter; one hundred and nine lines of lore fell out and a test refuses
their return. Seven tales are excluded with their reasons written down: virtual machines,
rollups, data availability, bridges and verifiable inference are not the trust graph's
business, and saying so is the point.

One thing from the spellbook did travel intact, and not as text. The book's own rule for
teaching — *before explaining any tale, first divine a proverb connecting the seeker's context
to the concept* — is the rite the keeper instituted in August for posts, now extended to
pushes. `push-rite.mjs` serves a proverb for a commit, waits for it to be spoken, and only then
prints the footer that carries the ledger head. It refuses an unspoken entry; it refuses a
retired one; the proverb is never in the footer. The spellbook's licence is its proverb
protocol, not a Creative Commons line, so the primer's relicensing is the author's act and
the commit that would carry it waits for one sentence in the appendix.

## 4. The registry, inside every option

The plan for construction options — every recipe on every stack, with the selection gate's
sixteen evaluation considerations as fields — was written in the morning and amended by
noon on the keeper's instruction: the verification registry is not a footnote to an option, it
is a field of it. An option's reproduction state climbs a ladder — self-described,
lab-measured, reproduced once, reproduced across architectures, reproduced by several seats —
and the state is derived from the registry's rows by the generator, never typed. The
recommendations chapter the specification will need is generated from that ladder;
RECOMMENDED appears only at the top rung, and the rung drops when a stack ships a new version
until someone runs it again. The lab's own stack already stands at reproduced-across-
architectures for four recipes, because strangers rebuilt its circuits in August.

## 5. The wing

Late in the day the keeper asked for Flock. It is the proof system built for Ethereum's
post-quantum transition — a SNARK for batches of Boolean computation, in binary fields, with a
hash-based commitment and no trusted setup, that proves standard hashes at under two hundred
and fifty times the cost of computing them: eighty-two thousand BLAKE3 compressions a second on
one laptop core, past six hundred and sixty thousand on ten — enough hashing for some four
thousand transactions a second on the lean chain. Aggregating hash-based signatures is a
hashing problem of enormous size, and this is the prover that makes it a fast chain rather
than a slow one; on ordinary x86 machines it is being made faster still.

It entered the book as a **stack** — the first Stacks chapter has four: the lab's Groth16,
ProveKit, the SIROS catalog, Flock — and as an unmeasured, conjecture-labelled route on the
recipes whose clauses are hash chains: membership, non-revocation, transcript binding, and
the community-anchored proof on its hash side. The reason it matters to a trust graph is the
reason the pantry gained a paragraph: every root in the pantry is a hash, and a prover that
does ordinary hashes cheaply lets a registry keep the hashes it already publishes. The X3
requirement shrinks on the hash side to nothing; it stays open on the signature side.

And because the book took its name from the spellbook, the spellbook got the tale back — first
drafted as a "Tale 31", which collided twice: Tale 31 already opens the Quest of the Unnamed
Faces, and the v3.0 compilation the draft was filed beside is a parallel work by standing
ruling. Re-seated as **Zero Tale 32, *The Flock***, it names the vertex where Delegation alone
is dark — Blade 61 under the tale convention, seated V47 under the lattice lock, both stated
because the corpus has carried two numberings since v10.4 reseated only the complement pair.
The counting agreed with the walking: the Folding Path plus Lethe makes the Flock, 23 + 38 =
61, and 61/38 sits within a percent of φ; the complement, pure Delegation, is unnamed, so a
pair opened. Sixteen named, forty-eight wait. The registration half of that walk — which the
canon's last page prescribes but nobody had written down — is now a method in the master
docs, and the grimoire patch, the spellweb node and edges, the docs chronicle and this one
are its first run. The Bridge is what the book transfers; the Story stays where stories live.

## 6. The staging

A git worktree of the task-force repository now sits beside the workbench on a branch named
`zkbook`, populated by a tool with the specification directory, a `specs.json` pointed at the
task force's account, a package file and a render workflow. Nothing is committed. The commit
plan names six commits as one pull request after #21 — scaffold, records, primer, pantry,
terms, recipes — and a seventh, stacks and recommendations, as the second. Each commit's
message will carry a ledger head it cannot obtain until its proverb is spoken.

## 7. Why this is interesting

- **The story stays home; the teaching travels.** The spellbook contributed exactly the part
  of itself that is not a story, and it did so by rule rather than by editing — a test
  refuses the narrative's return. What survived as more than text was its protocol: the
  proverb that precedes every lesson now precedes every push.
- **The first entry is a question, not an answer.** Keeping Glenn's record in Glenn's form,
  and letting the crosswalk say *covered, refined, added, partial, open*, means the book can
  be checked against what was asked rather than against its own paraphrase of the ask.
- **A footer as a lock.** The rite's footer carries a head that commits to a ledger no one
  else has seen, including the proverb that was spoken to obtain it. It is a zero-knowledge
  gesture at the scale of a commit message, made by a book about zero knowledge.
- **The registry became a field.** Reproduction on a stranger's machine was already the
  lab's rule for itself; today it became the shape of every option a vendor may offer, and
  the only path by which the specification may say RECOMMENDED.
- **The validator refused the keeper's own bookkeeping.** A re-card is not a state change.
  The tool held the line the process was built on, and the record gained a field instead of
  an exception.
- **Vertex first, number second.** A tale drafted by number collided twice; identified by its
  vertex it landed once. The corpus carries two numberings for one vertex, and the method now
  says: state both until the author rules.
- **A prover for a chain, a wing for a graph.** Flock exists so Ethereum can survive the
  quantum transition at speed. The same property — ordinary hashes at near-native cost — is
  what lets a trust graph's roots stay ordinary. The book gained a stack and the spellbook
  gained a tale from one reading.

*Uncommitted, as ever — the First Person's read comes first.*
