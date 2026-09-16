# The board — how a requested ZK proof becomes a vetted, published record

*Lane for zkp-tf discussion #18 (talltree 08-26 · Scott 08-27): a prioritised list of requested
ZK proofs, kept on a GitHub Projects board, where every row links to enough substance that a
stranger can take it to the registry and rebuild the circuit. The board is the book; each row
is a record; this directory is where records are written, constructed, run and vetted before the
row says so. Zero dependencies: `node board/tools/board.mjs`.*

## The rule

**A row on the board may not claim more than its record can show.** A record may not claim more
than a runtime has measured. A runtime may not claim more than an independent run has
reproduced. Each step is a trust task with a named issuer, recipient, side effect, exposure
and evidence — the same envelope the DTG trust-task registry uses — so the process itself is
inspectable in the format the task force is specifying.

## Roles

| role | holds | never does |
|---|---|---|
| **requester** | the ask (an issue on the board: what, for which spec/market need, priority) | writes the record's claims |
| **constructor** (Mitchell / Denys per #18) | the record, the runtime, the measurements | vets their own construction |
| **runner** (any team member, independent hardware) | a reproduction: fixtures green, digests re-derived | admits seats, publishes |
| **verifier** (registry acceptance flow, gates A–F) | the registry row | — |
| **maintainer — HUMAN** (Scott = board; publication rite per repo) | the board row's state, the push, the G.1 rite | delegates admission or publication |

## The state machine (monotone, no skips)

```
requested → specified → constructed → run → vetted → published
```

| transition | trust task | issuer → recipient | sideEffects | exposure | evidence required | named refusals |
|---|---|---|---|---|---|---|
| — → requested | `board/request` | requester → task force | none | metadata (the ask) | issue URL, priority | `request-no-statement` (an ask with no one-sentence statement is a survey, not a request) |
| requested → specified | `board/specify` | constructor → task force | none | metadata (the record) | record validates (`board.mjs validate`) | `record-clause-unbound` · `record-no-does-not-establish` · `record-no-adversary` · `record-no-horizon` · `record-composed-disclosure-is-union` · `record-component-missing` |
| specified → constructed | `board/construct` | constructor → task force | mutating (runtime added) | metadata (measurements) | runtime path + measured cost per construction option offered | `construct-no-measurement` · `construct-option-untested` |
| constructed → run | `board/run` | runner → task force | none | metadata (run report) | fixtures green on independent hardware, digests re-derived | `run-vectors-missing` · `run-negatives-unlabelled` (unsat vs verify-fail not distinguished) · `run-same-hardware` |
| run → vetted | `board/vet` | verifier → maintainer | mutating (registry row) | metadata (row id) | registry acceptance flow A–F, row id | `vet-self-vouch` (runner is the constructor — the S6 rule applied to the process) · anything the acceptance flow refuses |
| vetted → published | `board/publish` | maintainer → public | mutating (board row, push) | public | G.1 rite spoken + activated; board row updated; issue closed with pointer | `publish-without-rite` · `publish-before-vet` |

Every advance is recorded in the record's `history[]` by `board.mjs advance` — who, when, which
evidence — and the tool refuses transitions whose evidence is missing or whose actor breaks a
rule. Refusals are values, not exceptions: the register string is the record.

## The record

One record per proof. **Primitive** records bind one gadget; **composed** records are a named
conjunction of primitives under **one transcript and one declared disclosure set** — a
composition's `disclosureSet` and `doesNotEstablish` are written fresh, never inherited, because proofs
that are individually sound can leak jointly. Fields (schema in `card.schema.json`, published as
`conformance/schema/construction-record.schema.json`; the cookbook's field names — dish · ingredients ·
pantry · method · yield · tasting · substitutions — were retired on 2026-09-16 in favour of these):

| field | what it holds |
|---|---|
| `statement` | one sentence: what a verifier learns, from whom, without what |
| `witness` | credentials, secrets, paths, openings; never leaves the holder |
| `publicInputs` | context, roots, epoch, transcript digest, declared scope |
| `relation` | numbered clauses, each bound to a `gadget` and (when built) a `runtime` |
| `disclosureSet` | exactly the public signals plus anything deliberately shown |
| `doesNotEstablish` | the drafting rule's negative space |
| `adversary` | per privacy clause: verifier · verifiers colluding · issuer+verifier · registry operator |
| `horizon` | earliest of credential validity · epoch rollover · status freshness · root cryptoperiod |
| `fixtures` | fixture families: accepts · rejects-unsat · rejects-verify · unlinkable · current; vector paths; rejection codes |
| `options` | construction options, each a `construction` evaluated against the §25 criteria, with measured or conjectured cost |
| `issuance` | what the record requires of issuers (ADR-001 X3) |
| `provenance` | catalog entry · registry row · audited commit |
| `components` | composed records only: the primitive record ids conjoined |

Gadget vocabulary (closed list, extend by PR): `set-membership` · `nullifier` ·
`transcript-bind` · `key-binding` · `distinctness` · `signature-verify` · `non-revocation` ·
`range` · `commitment-open` · `chain-resolve` · `hidden-equality` (added 2026-09-11: equality of two hidden fields across differently-signed credentials — the dual of `distinctness`; cred-spec #9).

## Commands

```
node board/tools/board.mjs validate            # every record; refusals by register string
node board/tools/board.mjs render 010          # record → markdown (the linked detail page)
node board/tools/board.mjs issue 010           # record → GitHub issue body for the board row
node board/tools/board.mjs index               # writes BOARD.md (the row table)
node board/tools/board.mjs advance 010 constructed --by mitchuski --evidence runtimes/circom-gadget
node board/tools/board.mjs site                # writes site/index.html (the local viewer: watch · doors · drafts · process · records · ZK Book)
node board/tools/board.mjs survey [--since ISO] # READ-ONLY: pulls the four upstream repos → survey/latest.json + survey/WATCH.md (what moved)
node board/tools/board.mjs spec                # writes ../zkbook/spec/constructions.md + generated terms (the records as a Spec-Up-T draft)
node board/test.mjs                            # the suite
```

## The watch (added 2026-09-05)

`survey` asks GitHub's GraphQL for every discussion, pull request and issue in
trustoverip/dtgwg-zkp-tf, dtgwg-cred-spec, dtgwg-cred-tf and dtgwg-rahp-tf, using the token in the
git credential store (held in process memory only — never written, never logged), and keeps a compact
snapshot in `survey/latest.json` (git-ignored; public data, but bulky) plus a tracked digest
`survey/WATCH.md`: every thread with events after the watermark, newest first, with a relevance mark
and the hand-kept `watch-map.json` link from thread to the records it feeds. The viewer's **Watch**
section is the same digest with snippets. Nothing here posts; posting is the maintainer's act.

`doors.json` is the curated list of places the co-chair can add value now — each with the thread,
the status (`open` · `drafted` · `waiting` · `done`), the draft letter and the records it touches. The
viewer's **Doors** section renders it. Drafts carry a `ledger:` line naming their proverb-ledger entry;
the viewer treats legacy ledger activation as history, never as confirmation of the current revision. Review acknowledgment is bound to the exact text, destination, proverb, metadata and prerequisite list. A manually entered publication URL is labelled reported and unverified.

## The ZK Book (added 2026-09-05)

`spec` renders the records as Spec-Up-T markdown in `../zkbook/` — one section per record, primitive
and composed indexed separately, the state printed at the top of every record, and a generated term
for every gadget, role and record part (`terms-definitions/g-*.md`). Hand-written chapters (header,
intro, public-inputs, appendix) sit beside it. `cd zkbook && npm install && npm run render` builds
`docs/index.html`. `node tools/zkbook-export.mjs` writes the specification into a clone of `trustoverip/dtgwg-zkp-spec`
(template skeleton + `conformance/` + CI); `--check` shows the diff first. Rule: a record may not say more than a runtime
has measured. See `zkbook/README.md`, `zkbook/COMMIT-PLAN.md` and draft R; P is the draft-PR body.

## Seed set

| record | kind | state |
|---|---|---|
| 001 set membership over an accredited root | primitive | constructed (runtime 01 · `nullifier_membership`, 11,523 c.) |
| 002 scoped nullifier (reuse detection) | primitive | constructed (same circuit; decision §13) |
| 003 transcript binding | primitive | constructed (+1 constraint) |
| 004 holder binding | primitive | specified (runtime 04 = stub) |
| 005 distinct member / distinct issuer | primitive | constructed (`dual_issuer`, duplicate unsatisfiable) |
| 006 non-revocation against a status root | primitive | specified (O4 exploration; set-root primitive route added 09-05 — cred-tf #40) |
| 007 common control across identifiers | primitive | specified 09-05; revised 09-11 (cred-spec #9 09-10: subject-or-issuer; two of the four #42 predicates rest here, the chain predicates are 009) |
| 008 blinded binder (taskContext) | primitive | specified 09-05 (Scott's work item, cred-tf #39) |
| 009 hidden-value equality across credentials | primitive | specified 09-11 DRAFT (cred-spec #9 09-10 + PR #42: the chain predicates' primitive; new `hidden-equality` gadget) |
| **010 Community-Anchored Proof (ADR-001)** | composed | specified — first board item; method fully bound; re-specified 09-05 in WD02 vocabulary + S7 common control |
| 011 pairwise edge (directed personas shown, pairwise identifiers hidden) | composed | specified; re-specified 09-05 (WD02 vocabulary, co-control via 007) |
| 012 intentional correlation — one controller across k credentials | composed | specified 09-05 (talltree, cred-spec #22) |
| 020 delegation chain (VDC, chained profile) | composed | specified 09-05; re-read 09-11 against the merged VDC (door D17: per-ancestor depth, issuer = parent subject via 009, status conditional on every VDC) |
| 021 authority chain (VAC attenuation) | composed | specified 09-11 DRAFT (cred-spec §VAC merged 09-10 + PR #42; 020's sibling — as itself, attenuation by default, cascade) |

Vocabulary: records are written to the credentials specification's Working Draft 02 — three
correlation scopes (`pairwise | directed | public`); the R/M/C/P-DID acronyms are retired and the
suite refuses them in any record body (test V1).

Records 001/002/003/005 are `constructed`, not `run`: the registry rows 0002–0006 reproduce the
*circuits*, and a record's run needs its own fixture family consumed under the record's name. That
is the first honest gap the board makes visible.

## Where this sits

Research root lane (`WORKFLOW.md` placement rules: drafting is exploration). Promotion path:
when Scott's board exists, `issue 010` output becomes the first board issue; the rendered record
is the linked detail page (this repo, public). The upstream repo never carries the lab;
the board row links here. Pushes = maintainer, with the rite.

## Reader review and publication records (7 September 2026)

The active queue follows `run.json`; held, superseded and historically activated drafts are grouped as reference material. Read the source-check time, live destination and prerequisites before approving. The acknowledgment is local to this browser and revision; editing the text or destination invalidates it. Export a review receipt to retain the acknowledgment and any publication report outside browser storage. The reader does not call a publishing API or infer publication from copying.

The watch paginates repository lists and nested comments/replies/reviews. Every repository retains its own last successful watermark; errors are visible and retried across the missed interval. Snippets are a navigation aid: read the full live target before posting.

Generated-content tests now regenerate marked specification sections and generated terms using a portable renderer. Evidence maturity and normative adoption are separate. Material corrections should be recorded as revisions with renewed review, preserving earlier evidence history.

Run both reader suites after a change: `node board/test.mjs` and `node --test board/review.test.mjs`. The second includes negative publication, pagination, historical-ledger and generated-content regression cases. If Git is not on the process PATH, set `DTG_GIT_EXECUTABLE` to its absolute executable path for the survey. Missing credentials refuse the refresh without replacing the last snapshot.
