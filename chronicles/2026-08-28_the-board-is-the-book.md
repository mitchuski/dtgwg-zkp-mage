# 2026-08-28 · The Board Is the Book

> **Provenance.** A chronicle — the narrative working record kept alongside the lab, reflected
> into this repo so collaborators can follow the arc with the runtime traces beside it. Voice:
> framework (master series). The maintainer's master copy is the source of truth; this copy is
> adapted only in this header and in paths (home-directory references translated to repo-relative
> where the artefact lives here). Signed by the First Person: not yet.
>
> **Runtime traces:**
> - `board/test.mjs` 28/28 — every refusal of the board lane triggered live; `board/BOARD.md` the generated row table
> - `board/cards/010.json` — ADR-001 as the first composed card, eight clauses bound to gadgets, S6 added
> - `board/drafts/A–E.md` — the posts and the PR body; `proverb-ledger.json` seq 17–21 (seq 21 activated)
> - upstream [PR #20](https://github.com/trustoverip/dtgwg-zkp-tf/pull/21) (`AGENT-RUNTIMES.md` + README link; supersedes #19/#20) · [discussion #18](https://github.com/trustoverip/dtgwg-zkp-tf/discussions/18) · cred-spec [PR #26](https://github.com/trustoverip/dtgwg-cred-spec/pull/26), [#17](https://github.com/trustoverip/dtgwg-cred-spec/issues/17), [#8](https://github.com/trustoverip/dtgwg-cred-spec/issues/8)
> - ADR-001 *Community-Anchored Proof* (docs.fpp.storm.ws, Proposed 2026-08-25) · [ePrint 2026/333](https://eprint.iacr.org/2026/333) §2.3–2.4, §5.3–5.4, §7.2, §8–10
*The task force asked for a list, and the list turned out to need a kitchen. Between a survey
of two upstream repositories, the first submitted proof record from a stranger, a sixty-page
paper read to its last appendix, and one metaphor the keeper corrected mid-sentence, the day
produced a lane where a requested proof becomes a card, a card becomes a runtime, a runtime is
run by other hands, and only then does the board say so — and, at its close, the co-chair's
first commit into the upstream fold, authored by him alone.*

**Scope:** the survey of `trustoverip/dtgwg-zkp-tf` and `trustoverip/dtgwg-cred-spec` since the
08-25 posting run; Glenn Gore's ADR-001 *Community-Anchored Proof* (Proposed 2026-08-25) read
against ePrint 2026/333 in full and against the lab; the run note
the run note (maintainer's private working record, git-excluded); the new **board lane**
`board/` (cards, tool, suite 28/28, drafts A–E, hosted viewer on
`127.0.0.1:8425`); five proverbs served into the ledger (seq 17–21); and the upstream branch
`agent-runtimes-doc` — `AGENT-RUNTIMES.md` + README link — as **PR #20** on the task-force
repository (PR #19 opened first and closed the same hour). Eleventh in the ZK arc.

---

## 1. What the survey found, and the one collision nobody had named

Three things had moved. Discussion **#18** (talltree, 08-26) asked for a prioritised list of
requested ZK proofs; Scott answered that a list is only buildable if every row links to
substance — *what it proves, over which credentials, what it does not establish* — and named
Glenn's ADR-001 as the template and Mitchell + Denys as the construction-detail half. On the
credentials side Glenn had turned the 08-25 Q2 answer into text (**PR #26**, edge verifiability
defined with respect to a verifier, disclosure or proof accepted equally, the M-DID requirement
dropped), and **#8 had closed**: a membership credential is now a mutually issued pair, grant
and acknowledgement.

The fourth finding was the one that mattered because no one had said it. Glenn's **#17**
proposes `eddsa-jcs-2022` as the default proof suite — Ed25519, neither pairing-algebraic nor
native to the SNARK curves. His own ADR asks (clause X3) that any requirement the proof places
on issuance be stated early. That requirement exists, it is this one, and the two threads he
authored contradict each other on it. The cheap resolution — keep the suite for transport,
require issuers to publish a ZK-friendly commitment beside it — was already the lab's posture
from the 08-25 catalog post. Draft C says it in one paragraph.

## 2. The hard clause was the cheap one; the missing clause was the thief's

ADR-001's third clause — *the party who issued the relationship credential also holds a
membership credential from the same community, proven offline* — is the one the record calls
"the hard one". Read against ePrint 2026/333 it is the cheap one: in the paper's vouchable-
credential model a vouch is verified against the **community's** key, so a vouch that verifies
*is* the statement that the voucher holds that community's credential. Soundness is vouch
unforgeability; the offline property is that a vouch is non-interactive; the challenge binding
is the paper's tag-based NIZK and the lab's one extra constraint. The paper's revocation sketch
(§5.4) even carries the ADR's C3 caveat verbatim — reveal a nullifier at issuance and the
issuer can recognise you later.

What the ADR lacks is the clause a thief would use. A member of C with two relationship
identifiers can vouch for herself: clauses one to three all verify. The paper's `f_distinct`
predicate is exactly this — the very predicate that forces contexts to exist — and the lab's
distinct-issuer circuit already makes the duplicate case *unsatisfiable*: no witness, not a
rejection code. The chronicle names it **S6**: the voucher is not the holder. Beside it, three
smaller corrections: the membership pair means clause three can only prove the *grant* half
(the acknowledgement is not in the presenter's hands and clause S3 forbids fetching it); P4 as
written is full show-unlinkability, which the paper proves cannot coexist with any reuse
detection, so it must be parameterised by context; and the record has no adversary column and
no "does not establish" list — the two drafting rules the task force adopted for itself.

## 3. The metaphor corrected

The keeper's ask used the phrase "recipe book style approach to proofing the graph". The suite
was searched for a house term and none existed; the run note stated the assumption — one card
per proof, in a fixed format a stranger can cook from — and proceeded. The keeper's reply fixed
it in seven words: *the book is the board.* Not a metaphor to be located in the corpus; a
metaphor to be built. The card format (dish, ingredients, pantry, method bound to gadgets,
yield, does-not-establish, adversary, horizon, tasting, substitutions, issuance, provenance)
is what Scott's sentence looks like when it has to compile.

## 4. The lane

`board/` is the smallest system that makes the rule enforceable: **a row on the board may not
claim more than its card can show; a card no more than a runtime has measured; a runtime no
more than an independent run has reproduced.** Six states, monotone, no skips — requested,
carded, constructed, run, vetted, published — and each transition is a trust task with the
DTG envelope: issuer to recipient, side effects, exposure, evidence. Refusals are register
strings. Two of them are S6 turned on the process itself: `run-same-hands` (the constructor may
not be the runner) and `vet-self-vouch` (a run by the constructor cannot be vetted). A third,
`publish-without-rite`, makes the G.1 proverb a precondition in code.

A composed card may not inherit its disclosure set from its parts (`card-composed-yield-is-
union`), because proofs individually sound can leak jointly — the convergence note's §7.3 rule,
now a failing test. Nine cards seed it: four primitives constructed with the lab's measured
numbers, two carded, the ADR as card **010** with all eight clauses bound to gadgets, the
pairwise edge, and the delegation chain the ADR defers to its own future record. The suite runs
28/28; every refusal is triggered live. The generated `BOARD.md` shows the first honest gap at a
glance: circuits have been reproduced by strangers, but no *card* has yet had its own
independent run.

## 5. Into the fold, by his own hand

The keeper asked for a commit on the task-force repository so that he is listed among its
participants — linking the evidence repository, with a document on how members and their
assistants can work it. `AGENT-RUNTIMES.md` is a companion to the drafting rules: the lanes in
one line each, three rules of the practice (the assistant operates and the member decides;
disclose the assistant; say only what the tests hold), the path from a discussion to a runnable
claim with the human seats marked, and what it is not — not a construction selection, not an
audit, not a requirement on anyone.

He spoke the served proverb — *what is shared into the fold is shared with its traces; the
gift is the method, not the answer* — and the push and the PR followed (#19). Then a second
correction, as precise as the first: the assistant's co-author trailer belongs on the evidence
repository's commits, never on the task force's. The commit was amended to his name alone; the
organisation's branch protection refused the force-push, so the amended commit went up as a
fresh branch and **PR #20** superseded #19 within the hour, the old one closed with a comment
saying why. The disclosure moved from the commit trailer to where it belongs upstream: a
sentence in the PR body.

## 6. Why this is interesting

- **The requested list needed a kitchen.** A board that cannot be cooked from is a survey.
  The card format is not decoration on Scott's sentence; it is the sentence made checkable,
  and the tool refuses a row that outruns its card.
- **S6 twice.** The clause the ADR is missing (voucher ≠ holder) and the rule the process
  needed (constructor ≠ runner ≠ verifier) are the same rule. A proof system and the process
  that vets it fail the same way, to the same thief.
- **Reading to the last appendix paid.** The "hard" clause being native to the paper's model,
  and the revocation caveat matching C3 word for word, were both in sections a summary would
  have skipped.
- **Two corrections, seven words each.** *The book is the board* and *not on the root repo*
  — each redirected a build without stopping it. The method survives correction because it
  states its assumptions before it acts on them.
- **Authorship is a claim about the record.** The assistant's name on a mage commit is
  disclosure; the same name on a task-force commit would be a different claim about who spoke
  in the fold. The keeper drew that line before anyone else had to.

*Uncommitted, as ever — the First Person's read comes first.*
