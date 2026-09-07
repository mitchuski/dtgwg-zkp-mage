# 2026-09-05 · The Text Cannot Outrun Its Records

> **What this is.** A *chronicle* is the maintainer's narrative working record of one significant day: what moved, in
> what order, and why the order is the method. This copy is the **collaborator telling**: the body is verbatim from the
> master series in the maintainer's private suite (framework voice), adapted only in this header and in paths, which are
> repo-relative or glossed. The master copy is the source of truth; a divergence here is a defect in the reflection.
> **Signed by the First Person: not yet.**
>
> **Runtime traces** — what carries this chronicle's claims, so a reader can run the narrative rather than take it:
> - `node board/test.mjs` — 47 checks green on 2026-09-05, including E1 (exported body has every template-required section, each declared normative or informative, with the records digest stamp), E2 (the spec clone's own `conformance/test.mjs` passes), E3 (no tale / spellbook / privacymage / grimoire above References; `[AGENTPRIVACY]` cited below), K1b (no kitchen vocabulary or emoji headings in generated specification text)
> - `zkbook/conformance/validate.mjs` + `test.mjs` — the apparatus exported to the specification repository; in the clone: 17/17 files validate, `spec/body.md` stamp current
> - `tools/zkbook-export.mjs` (`--check` then write) — 37 paths staged in the clone of `trustoverip/dtgwg-zkp-spec` on branch `zk-book`; nothing committed
> - `zkbook/spec/{header,intro,terms-and-definitions-intro,records,primer,pantry,recipes,stacks,considerations,privacy-derived,conformance,references,appendix}.md` — the chapters; `zkbook/transfer/spellbook-map.json` (`topics`, `specRegister`)
> - `zkbook/COMMIT-PLAN.md` — C1 front matter · C2 conformance/ + CI · C3 body + terms, one pull request; `tools/push-rite.mjs` footers
> - `board/drafts/{H,P,G,J,K,L,M}-*.md` — the seven posts; `proverb-ledger.json` 30 entries (as-served head in the run note)
> - upstream: [trustoverip/dtgwg-zkp-spec](https://github.com/trustoverip/dtgwg-zkp-spec) (created 2026-09-02; Pages at trustoverip.github.io/dtgwg-zkp-spec) · [PR #21](https://github.com/trustoverip/dtgwg-zkp-tf/pull/21) (independent) · [cred-spec #31](https://github.com/trustoverip/dtgwg-cred-spec/issues/31) · [cred-tf #39](https://github.com/trustoverip/dtgwg-cred-tf/discussions/39) · [zkp-tf #17](https://github.com/trustoverip/dtgwg-zkp-tf/discussions/17) · [zkp-tf #14](https://github.com/trustoverip/dtgwg-zkp-tf/discussions/14)


*The evening the book found its second home. A specification repository the working group had opened
three days earlier turned out to be a blank template with the right skeleton and a live page; by
night it held the task force's specification in its own form — construction records generated from
machine-checked data, a conformance directory that refuses a record without an adversary and fails
the build when prose drifts from the records it claims to describe, and no metaphor left in the text.
Nothing committed, posted or pushed. Thirteenth in the ZK arc; the same day as the twelfth.*

**Scope:** `trustoverip/dtgwg-zkp-spec` (created 2026-09-02 on the ToIP Spec-Up-T template by Geoff
Turk and Ry Jones, wired through 09-05, Pages live) read in full — configuration, workflows, template
placeholders; the keeper's four rulings of the evening; the register switch in the generator; the
new chapters; the `conformance/` apparatus; the export rewritten to the template's skeleton and a
clone at a local clone of `trustoverip/dtgwg-zkp-spec` (maintainer's machine) on branch `zk-book`; the removal of the tale framing from the background;
seven discussion posts drafted into the reader (H rewritten, P, G rewritten, J, K, L, M); the run note
the maintainer's run note §§9–10 (git-excluded working record, not in this repo).

---

## 1. Four rulings, in the order they arrived

The keeper came back to the DTG side with one instruction — make the book "really well synced" and
able to be written into the specification repository in that repository's style — and then, as the
work moved, three more. *Clear but serious: something Trust over IP contributors can dig into.* *Split
the specification work from the task-force comments and work, and merge the mage validation system
into the specification.* *No tale terminology in the specification; it is a book now; reference the
agentprivacy work at the bottom as the root of understanding.* Each ruling arrived mid-build and each
redirected without stopping, the way the seven-word corrections had on the twenty-eighth.

## 2. What the repository was

A template instance. `specs.json` pointed at itself since the fifth; `spec/header.md` still carried
its double-brace editorial instructions; `body.md` was the template's outline — every top-level
section must declare itself normative or informative; Security, Privacy, Governance,
Internationalization and Accessibility Considerations required; Conformance with Targets and Tests
required; References required. Two placeholder terms. A render-and-deploy workflow that publishes to
a `gh-pages` branch and never commits `docs/`, with a comment warning that a concurrency group named
"pages" collides with GitHub's own. A README describing the template project rather than any
specification. The skeleton was exactly right and entirely empty.

## 3. The register

The recipe words had done their work — they made the form legible to the keeper while it was being
invented — and now they had to leave. In the generator, `dish` became Statement, `ingredients`
Witness, `pantry` Public inputs, `yield` Disclosure set, `tasting` Conformance fixtures,
`substitutions` Construction options; a recipe became a construction record, the pantry chapter
Public Inputs — Shared Conventions, the primer Cryptographic Background, the stacks Proving Systems,
the records Requests Answered. The JSON field names stayed as they were, because they are internal
identifiers and the machine does not care what they are called; every string value that reaches a
reader was rewritten, by a script that walked the data rather than by hand. A test now refuses kitchen
vocabulary and emoji in headings anywhere in generated specification text. The book keeps its name in
the evidence repository. The specification keeps none of the kitchen.

## 4. The checks travel with the text

The ruling to merge the validation system into the specification became a `conformance/` directory
in the specification repository itself: the twelve construction records, the one request, the four
proving-system entries, the schema, a zero-dependency validator whose refusals are register strings
(`card-no-adversary`, `card-no-horizon`, `card-composed-yield-is-union`, `construct-no-measurement`,
`history-not-monotone` …), and a test that recomputes a digest over the records and compares it to a
stamp at the head of `spec/body.md`. A pull request that edits generated prose without its record
fails continuous integration. The Conformance chapter — the template's required normative section —
was written around that apparatus: six conformance targets (the record, the constructor, the prover,
the verifier, the issuer and registry, the proving-system entry) and five tests (record validation,
generated text is current, the fixture format with its versioned rejection-reason register and its
second-language consumer, independent reproduction through the registry's gates A–G, and the
reproduction ladder that alone may produce the word RECOMMENDED). The section ends by saying what
conformance does not establish: reproduction and behaviour are not audit.

## 5. The export, and what it caught

The export was rewritten to produce the template's skeleton — header, introduction, terminology
intro, one assembled body, appendix, generated terms — and a `--check` mode that reports what would
change against the clone before writing anything. It stamps the body with the records' digest, keeps
the repository's own workflows and lockfile untouched, rewrites only the title, description and
external glossary in `specs.json`, replaces the template README, adds one workflow, and removes the two
placeholder terms. The clone installed the repository's pinned dependencies, rendered a two-megabyte
document under the repository's own configuration, and passed its own conformance test.

Four things broke on the way and each broke usefully. The freshness test's regular expression demanded
the stamp end where the comment ended, and the comment carried a sentence; the test failed against a
correct stamp until the expression was loosened. A term named with parentheses could not be resolved
by the renderer; the role became *registry verifier*. Twice a shell ate the backticks inside a script
passed on the command line and the script silently did nothing, or worse, wrote an empty path into a
memory line — after the second time every multi-line edit became a file. And the test that refused
tale words found, in the last background subsection, a paragraph beginning "You've journeyed through
30 tales": the source parser had stopped only at second- and third-level headings, and the author's
first-level reflection at the end of the compilation had ridden into the final subsection. The rule
that no narrative crosses caught the narrative the tool had let through.

## 6. The book with the working removed

The tale framing left the specification the way the kitchen had: the background subsections took
plain titles — *Zero-knowledge proofs: completeness, soundness and zero knowledge*; *Setup and the
common reference string*; *Binary-field SNARKs for standard hash functions (Flock)* — kept in a
hand-editable map; the section opens by saying what it covers and that it is drawn from the
agentprivacy body of work, cited once at the bottom of the References as the root of understanding;
the provenance and the pending relicensing statement moved to the appendix. A test refuses *tale*,
*spellbook*, *privacymage* and *grimoire* anywhere above References and requires the citation below.

Then the relationship between the three repositories was written once, as a post for the evidence
repository's own thread: the task-force repository holds requirements, drafting rules, discussions and
the board thread, and yields decisions and requests; the specification repository holds the
specification and its conformance apparatus, and yields rendered text and record identifiers others may
cite; the evidence repository holds runtimes, fixtures, the registry, the board where records are
written and advanced, and the generator, and yields data — records, fixtures, row identifiers — and
never a dependency. A claim travels one way through them. And the evidence repository keeps the same
records in the same chapters as the ZK Book, with what a specification cannot carry beside them: the
board with each record's state, the drafts and the rite that gates them, the watch, the run notes, the
chronicles. Reading the specification is reading the book with the working removed. Reading the book
is reading the specification with the working shown.

A last pass, at the keeper's prompting, found one more thing the rule had not yet caught: the corpus's
own agent architecture — Swordsman and Mage, Reflect and Connect and Capital, with an implementation
checklist and performance targets — riding whole inside the background's subsection on agents, because
its source had been mapped as background when it is a roadmap. It left the specification. What it had
drawn was rewritten in the specification's own words as two processes held apart: the one that acts —
composes, chooses what to disclose, asks for signatures — and the one that holds the secret and signs
only what is in scope, chained, and not already signed, refusing the rest as values. What passes between
them is a request and a signature; what never passes is the secret. The test that guards the body now
refuses those names too.

## 7. The posts

Seven drafts now sit in the reader with their proverbs served. H, rewritten, is the anchor: the
specification's shape, put to the task force before the pull request opens. P is the pull request's
own body — three commits, how to review each, what is generated and what is written, what the draft
does not do. M is the map of the three repositories and the book edition. G places the seed set as
record form. J points the credentials specification's merge plan at construction 007. K gives Scott's
four work items their record identifiers before his call with the paper's authors on the eighth, and
puts Flock's hash-side relief of X3 on the table. L seats the SIROS catalog as an as-signed entry and
names the pilot. Thirty ledger entries; the as-served head printed in the run note; every commit to
the specification repository will carry a head it cannot obtain until its proverb is spoken.

## 8. Why this is interesting

- **The text cannot outrun its records.** A specification whose generated sections carry a digest
  of their sources, checked by the repository's own continuous integration, cannot drift from the data
  it describes without failing its build. The drafting rules became a validator; the validator became
  the specification's own refutation of its prose.
- **The kitchen was scaffolding.** The recipe words made the form legible while it was being found and
  were removed the moment it was — by a script, so that nothing legible to a reader kept a word the
  machine did not need. Internal names stayed; every reader-facing string changed.
- **The rule that excludes narrative caught the tool.** The tale-word test found a paragraph the parser
  had let through. A rule stated as a test is a rule that catches its own author.
- **Three rooms, one door each.** Decisions in one repository, specification in the second, evidence in
  the third; records cross, dependency never does. The separation is the same one the registry keeps
  between acceptance and publication, one level up again.
- **The book kept its name where the working is shown.** The specification kept none of it. Both are
  generated from the same records, and the records are what a reviewer should argue with.

*Uncommitted, as ever — the First Person's read comes first.*
