# 2026-08-12 · Both Faces on the Table

> **Provenance.** A chronicle — the narrative working record kept alongside the lab, reflected
> into this repo so collaborators can follow the arc with the runtime traces beside it. Voice:
> framework (master series). The maintainer’s master copy is the source of truth; this copy is
> adapted only in this header and in paths (home-directory references translated to repo-relative
> where the artefact lives here). Signed by the First Person: not yet.
>
> **Runtime traces:**
> - registry entries `0004-seat-7f` + `0005-seat-7f-second` — the diptych §3 reads
> - sibling TF: [trustoverip/dtgwg-rahp-tf#8](https://github.com/trustoverip/dtgwg-rahp-tf/discussions/8)
> - `registry/verify-run.mjs` semantics via `runtimes/circom-gadget/verify-run.mjs`

*The day after the registry opened was the day of telling: the built thing had to learn to speak.
Notes for the group, a quote list for the call, a sibling task force asking the same question in
prose — and a second nameless run that landed with zero advisory notes, so the public table now
teaches its own acceptance model: one row that matched everything, one row that honestly didn't.*

**Scope:** the discussion drafts (`DISCUSSION-DRAFTS-2026-08-11.md` (a local draft file, git-excluded until circulated),
git-excluded until posted), the spoken quote list, the RAHP pressure-test reading
([trustoverip/dtgwg-rahp-tf#8](https://github.com/trustoverip/dtgwg-rahp-tf/discussions/8)), and
registry entry **0005** (seat-7f, 2026-08-12 15:19 UTC, ACCEPT, zero advisory notes) — pushed live
as `450f8e9` and deployed to
[mitchuski.github.io/dtgwg-zkp-mage](https://mitchuski.github.io/dtgwg-zkp-mage/). Fifth in the
arc: dream-cycle (07-16) → first-circuit (07-18) → thread-returns (07-28) → registry-opens (08-11)
→ this.

---

## 1. The work learns to speak

Everything yesterday built was true and none of it was yet *sayable*. Today's first artifact was
recovery and compression: the two upstream drafts pulled out of scrollback into one durable file —
the Show & Tell that explains itself to a cold reader (prose can't keep privacy promises; the lab
is the spec's test suite written first, in public, while it's still cheap to be wrong) and the
ratification-thread comment that files the registry announcement with its own correction attached.
Then the quote list: eight lines for the call, ordered purpose → credibility → ask. The credibility
line is the one that matters — *"it caught me first"* — because a registry introduced by its
maker's own refuted claim needs no other argument for why it should exist.

And the question that will actually be asked got its answer fixed in advance: **the runtime does
not review the circuit — it proves the circuit I published is the circuit you built, and that it
behaves as claimed on your hardware.** Reproduction and behavior, not audit. A registry row's claim
is deliberately narrow, and the narrowness is the honesty: whether the circuit is *right* is
exactly the conversation the group is for.

## 2. The sibling echo

The same week, the Risk Assessment & Harms Prevention task force pressure-tested the DTG Core
Credentials draft with one governing question: *what can an implementer build that is
cryptographically valid but still produces an unsafe, misleading, or invalid outcome?* That is the
lab's question, asked from the other side of the working group. RAHP writes down what must never
happen; the lab makes "it happened" a test failure.

The mapping is not thematic, it is item-by-item: their finding 5 — ZKP constructions lack defined
inputs, statements, verification algorithms — is addressed to this task force, and the lab is what
the answer looks like when it executes. Revocation-after-expiry is X6's erosion clocks; agent
authority and delegated action are A7 plus the PR-DEL fixture family; personhood firewalls are A6's
narrow nullifier enforced as lint. A harms register and a rejection register are the two halves of
one object: a RAHP finding that graduates becomes a fixture, and a fixture makes the RAHP control
testable rather than aspirational.

## 3. The second nameless run, and what the table now teaches

Entry 0005: seat-7f again, minted mid-conversation, verdict ACCEPT — and this time **zero advisory
notes**, because the run reused the workbench's pinned build, the very artifacts the manifest was
minted from. Next to it sits the cold clone's row with its twelve advisory divergences, named one
by one. The table now demonstrates the acceptance model without a word of documentation: circuit
digests match everywhere (required), setup chains diverge across machines (advisory, machine-local
by construction), and both outcomes are ACCEPT because the model was built on what determinism
actually holds — the claim that survived 08-11's refutation, now visible as data.

Small honest wrinkle, recorded: the acceptance script numbers entries by counting files and
proposed an id that already existed — and refused to overwrite. Fail-closed even in its clerical
habits. The entry filed explicitly as `0005-seat-7f-second`, disclosure note in the record: run on
maintainer hardware as a demonstration of admission-without-identity, not as independent
verification.

The push went out as `450f8e9` and the row was live on the public site inside a minute — and the
demo script for the call is the whole system in three commands: run (verdict computed locally,
depending on no one), accept (the row exists on localhost before anything is public), push (the
only step that publishes). Acceptance and publication are separate, deliberately, and the demo is
staged so the group watches the separation.

## 4. Where this sits in the narrative

The arc has a shape now, and each chronicle names one inversion. The dream-cycle put *formation
before verification*; the first circuit put *meaning before constraints*; the thread-returns put
*evidence before ratification*; the registry-opens put *refutation before publication*. This one is
smaller and completes them: **speech after proof**. Nothing said to the group today — the drafts,
the quote list, the RAHP reply-in-waiting — makes a claim that isn't already carried by a green
suite or a public row. The witness seat's discipline has climbed three levels in three weeks:
attest, never mint (the seat); orchestrate, never be the entropy (the ceremony); and now *say only
what the tests already hold* (the telling).

For the City's ledger: this is the ZK mage's lane running the full course the workshops were built
to teach — artefact forged, artefact tested against its own maker, artefact shown, and the showing
itself disciplined by the artefact. The nameless seat is the thesis made a table row;
the sibling task force is the first outside proof that the question the lab answers is the
question the whole working group is converging on.

## Why this is interesting

- **The table is the documentation.** Two rows — twelve advisory notes and zero — teach
  required-versus-advisory better than the paragraph that defines it. Evidence design *is*
  pedagogy design.
- **The narrow claim is the strong claim.** "We are all provably looking at the same circuit"
  survives every attack that "the circuit is correct" invites. The registry is credible precisely
  because of what it refuses to assert.
- **Convergence arrived unprompted.** RAHP asked the lab's question in prose without knowing the
  lab existed. When two task forces independently reach *what can be validly built that is still
  wrong*, that question is the working group's real center of mass.
- **Speech after proof.** The quote list contains no aspiration — every line is backed by a suite,
  a row, or a refutation already on the record. That's what it looks like when the telling is
  downstream of the evidence.

*Uncommitted, as ever — the First Person's read comes first.*
