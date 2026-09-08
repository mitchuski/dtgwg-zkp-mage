# The board — how a requested ZK proof becomes a vetted, published card

*Lane for zkp-tf discussion #18 (talltree 08-26 · Scott 08-27): a prioritised list of requested
ZK proofs, kept on a GitHub Projects board, where every row links to enough substance that a
stranger can take it to the registry and rebuild the circuit. The board is the book; each row
is a card; this directory is where cards are written, constructed, run and vetted before the
row says so. Zero dependencies: `node board/tools/board.mjs`.*

## The rule

**A row on the board may not claim more than its card can show.** A card may not claim more
than a runtime has measured. A runtime may not claim more than an independent run has
reproduced. Each step is a trust task with a named issuer, recipient, side effect, exposure
and evidence — the same envelope the DTG trust-task registry uses — so the process itself is
inspectable in the format the task force is specifying.

## Roles

| role | holds | never does |
|---|---|---|
| **requester** | the ask (an issue on the board: what, for which spec/market need, priority) | writes the card's claims |
| **constructor** (Mitchell / Denys per #18) | the card, the runtime, the measurements | vets their own construction |
| **runner** (any team member, independent hardware) | a reproduction: fixtures green, digests re-derived | admits seats, publishes |
| **verifier** (registry acceptance flow, gates A–F) | the registry row | — |
| **maintainer — HUMAN** (Scott = board; publication rite per repo) | the board row's state, the push, the G.1 rite | delegates admission or publication |

## The state machine (monotone, no skips)

```
requested → carded → constructed → run → vetted → published
```

| transition | trust task | issuer → recipient | sideEffects | exposure | evidence required | named refusals |
|---|---|---|---|---|---|---|
| — → requested | `board/request` | requester → task force | none | metadata (the ask) | issue URL, priority | `request-no-statement` (an ask with no one-sentence statement is a survey, not a request) |
| requested → carded | `board/card` | constructor → task force | none | metadata (the card) | card validates (`board.mjs validate`) | `card-clause-unbound` · `card-no-does-not-establish` · `card-no-adversary` · `card-no-horizon` · `card-composed-yield-is-union` · `card-component-missing` |
| carded → constructed | `board/construct` | constructor → task force | mutating (runtime added) | metadata (measurements) | runtime path + measured cost per substitution offered | `construct-no-measurement` · `construct-substitution-untested` |
| constructed → run | `board/run` | runner → task force | none | metadata (run report) | fixtures green on independent hardware, digests re-derived | `run-vectors-missing` · `run-negatives-unlabelled` (unsat vs verify-fail not distinguished) · `run-same-hardware` |
| run → vetted | `board/vet` | verifier → maintainer | mutating (registry row) | metadata (row id) | registry acceptance flow A–F, row id | `vet-self-vouch` (runner is the constructor — the S6 rule applied to the process) · anything the acceptance flow refuses |
| vetted → published | `board/publish` | maintainer → public | mutating (board row, push) | public | G.1 rite spoken + activated; board row updated; issue closed with pointer | `publish-without-rite` · `publish-before-vet` |

Every advance is recorded in the card's `history[]` by `board.mjs advance` — who, when, which
evidence — and the tool refuses transitions whose evidence is missing or whose actor breaks a
rule. Refusals are values, not exceptions: the register string is the record.

## The card (the recipe)

One card per proof. **Primitive** cards bind one gadget; **composed** cards are a named
conjunction of primitives under **one transcript and one declared disclosure set** — a
composition's `yield` and `doesNotEstablish` are written fresh, never inherited, because proofs
that are individually sound can leak jointly. Fields (schema in `card.schema.json`):

| field | the recipe word | what it holds |
|---|---|---|
| `dish` | dish | one sentence: what a verifier learns, from whom, without what |
| `ingredients` | ingredients | the witness — credentials, secrets, paths; never leaves the holder |
| `pantry` | pantry | public inputs — context, roots, epoch, transcript digest, declared scope |
| `method` | method | numbered clauses, each bound to a `gadget` and (when built) a `runtime` |
| `yield` | yield | the disclosure set — exactly the public signals plus anything deliberately shown |
| `doesNotEstablish` | — | the drafting rule's negative space |
| `adversary` | — | per privacy clause: verifier · verifiers colluding · issuer+verifier |
| `horizon` | — | earliest of credential validity · epoch rollover · status freshness · root cryptoperiod |
| `tasting` | tasting | fixture families: accepts · rejects-unsat · rejects-verify · unlinkable · current; vector paths; rejection codes |
| `substitutions` | substitutions | construction options through the §25 gate with measured cost |
| `issuance` | — | what the card requires of issuers (ADR-001 X3) |
| `provenance` | — | catalog entry · registry row · audited commit |
| `components` | — | composed cards only: the primitive card ids conjoined |

Gadget vocabulary (closed list, extend by PR): `set-membership` · `nullifier` ·
`transcript-bind` · `key-binding` · `distinctness` · `signature-verify` · `non-revocation` ·
`range` · `commitment-open` · `chain-resolve`.

## Commands

```
node board/tools/board.mjs validate            # every card; refusals by register string
node board/tools/board.mjs render 010          # card → markdown (the linked detail page)
node board/tools/board.mjs issue 010           # card → GitHub issue body for the board row
node board/tools/board.mjs index               # writes BOARD.md (the row table)
node board/tools/board.mjs advance 010 constructed --by mitchuski --evidence runtimes/circom-gadget
node board/tools/board.mjs site                # writes site/index.html (the local viewer: watch · doors · drafts · process · cards · ZK Book)
node board/tools/board.mjs survey [--since ISO] # READ-ONLY: pulls the four upstream repos → survey/latest.json + survey/WATCH.md (what moved)
node board/tools/board.mjs spec                # writes ../zkbook/spec/recipes.md + generated terms (the deck as a Spec-Up-T draft)
node board/test.mjs                            # the suite
```

## The watch (added 2026-09-05)

`survey` asks GitHub's GraphQL for every discussion, pull request and issue in
trustoverip/dtgwg-zkp-tf, dtgwg-cred-spec, dtgwg-cred-tf and dtgwg-rahp-tf, using the token in the
git credential store (held in process memory only — never written, never logged), and keeps a compact
snapshot in `survey/latest.json` (git-ignored; public data, but bulky) plus a tracked digest
`survey/WATCH.md`: every thread with events after the watermark, newest first, with a relevance mark
and the hand-kept `watch-map.json` link from thread to the cards it feeds. The viewer's **Watch**
section is the same digest with snippets. Nothing here posts; posting is the maintainer's act.

`doors.json` is the curated list of places the co-chair can add value now — each with the thread,
the status (`open` · `drafted` · `waiting` · `done`), the draft letter and the cards it touches. The
viewer's **Doors** section renders it. Drafts carry a `ledger:` line naming their proverb-ledger entry;
the viewer treats legacy ledger activation as history, never as confirmation of the current revision. Review acknowledgment is bound to the exact text, destination, proverb, metadata and prerequisite list. A manually entered publication URL is labelled reported and unverified.

## The ZK Book (added 2026-09-05)

`spec` renders the deck as Spec-Up-T markdown in `../zkbook/` — one section per card, primitive
and composed indexed separately, the state printed at the top of every recipe, and a generated term
for every gadget, role and recipe part (`terms-definitions/g-*.md`). Hand-written chapters (header,
intro, pantry, appendix) sit beside it. `cd zkbook && npm install && npm run render` builds
`docs/index.html`. `node tools/zkbook-export.mjs` writes the specification into a clone of `trustoverip/dtgwg-zkp-spec`
(template skeleton + `conformance/` + CI); `--check` shows the diff first. Rule: a record may not say more than a runtime
has measured. See `zkbook/README.md`, `zkbook/COMMIT-PLAN.md` and draft R; P is the draft-PR body.

## Seed set

| card | kind | state |
|---|---|---|
| 001 set membership over an accredited root | primitive | constructed (runtime 01 · `nullifier_membership`, 11,523 c.) |
| 002 scoped nullifier (reuse detection) | primitive | constructed (same circuit; decision §13) |
| 003 transcript binding | primitive | constructed (+1 constraint) |
| 004 holder binding | primitive | carded (runtime 04 = stub) |
| 005 distinct member / distinct issuer | primitive | constructed (`dual_issuer`, duplicate unsatisfiable) |
| 006 non-revocation against a status root | primitive | carded (O4 exploration; set-root primitive route added 09-05 — cred-tf #40) |
| 007 common control across identifiers | primitive | carded 09-05 (cred-spec #9 / #31 / PR #30 — the linkage four things lean on) |
| 008 blinded binder (taskContext) | primitive | carded 09-05 (Scott's work item, cred-tf #39) |
| **010 Community-Anchored Proof (ADR-001)** | composed | carded — first board item; method fully bound; re-carded 09-05 in WD02 vocabulary + S7 common control |
| 011 pairwise edge (directed personas shown, pairwise identifiers hidden) | composed | carded; re-carded 09-05 (WD02 vocabulary, co-control via 007) |
| 012 intentional correlation — one controller across k credentials | composed | carded 09-05 (talltree, cred-spec #22) |
| 020 delegation chain (VDC, chained profile) | composed | carded 09-05 (Scott accepted on cred-tf #40; core/profile split; acceptance clause) |

Vocabulary: cards are written to the credentials specification's Working Draft 02 — three
correlation scopes (`pairwise | directed | public`); the R/M/C/P-DID acronyms are retired and the
suite refuses them in any card body (test V1).

Cards 001/002/003/005 are `constructed`, not `run`: the registry rows 0002–0006 reproduce the
*circuits*, and a card's run needs its own fixture family consumed under the card's name. That
is the first honest gap the board makes visible.

## Where this sits

Research root lane (`WORKFLOW.md` placement rules: drafting is exploration). Promotion path:
when Scott's board exists, `issue 010` output becomes the first board issue; the rendered card
is the linked detail page (this repo, public). The upstream repo never carries the lab;
the board row links here. Pushes = maintainer, with the rite.

## Reader review and publication records (7 September 2026)

The active queue follows `run.json`; held, superseded and historically activated drafts are grouped as reference material. Read the source-check time, live destination and prerequisites before approving. The acknowledgment is local to this browser and revision; editing the text or destination invalidates it. Export a review receipt to retain the acknowledgment and any publication report outside browser storage. The reader does not call a publishing API or infer publication from copying.

The watch paginates repository lists and nested comments/replies/reviews. Every repository retains its own last successful watermark; errors are visible and retried across the missed interval. Snippets are a navigation aid: read the full live target before posting.

Generated-content tests now regenerate marked specification sections and generated terms using a portable renderer. Evidence maturity and normative adoption are separate. Material corrections should be recorded as revisions with renewed review, preserving earlier evidence history.

Run both reader suites after a change: `node board/test.mjs` and `node --test board/review.test.mjs`. The second includes negative publication, pagination, historical-ledger and generated-content regression cases. If Git is not on the process PATH, set `DTG_GIT_EXECUTABLE` to its absolute executable path for the survey. Missing credentials refuse the refresh without replacing the last snapshot.
