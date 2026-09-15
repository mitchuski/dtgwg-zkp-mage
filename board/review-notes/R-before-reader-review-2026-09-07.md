# R · zkp-tf NEW discussion — A first working draft of the specification, how it is built, and the review it is asking for
chip: POST FIRST · CONSOLIDATED ANCHOR · SUPERSEDES H + M
thread: https://github.com/trustoverip/dtgwg-zkp-tf/discussions/new?category=ideas
note: One post in place of H (the shape) and M (the three repositories), with the review rounds added — the part neither draft carried. H and M stay in the reader as the long forms if a thread ever needs them; do not post all three. Title as in the heading. Add the pull-request link once P is open, and post the round-1 questions as the first reply if the post runs long for the thread.
ledger: 32
proverb: A text reviewed once belongs to whoever wrote it; reviewed in rounds, it belongs to the fold.
---
The working group's specification repository for this task force — `trustoverip/dtgwg-zkp-spec`, set up on 2 September on the ToIP Spec-Up-T template — now has a first working draft proposed against it. This post is the one place to read what that draft contains, what kind of document it is, and the review it is asking for. The review is the part worth arguing with first: the draft is offered in rounds, and each round is meant to take something different away from it.

## What is in the draft

**Twelve construction records** — one per zero-knowledge proof the trust graph needs, eight primitive and four composed. Each record states what a verifier learns, from whom, without what; the witness that never leaves the holder; the public inputs; numbered method clauses, each bound to a named gadget; the disclosure set; **what the proof does not establish**; the adversary each privacy claim is made against and the horizon that bounds it; the conformance fixture families; the construction options across proving systems, with cost marked as measured or conjectured; what the construction requires of issuers; and its provenance. The task force's four drafting rules are fields of the record rather than advice about it.

**The requests those records answer**, ADR-001 first, in its author's own form, with a clause-by-clause crosswalk into the construction that answers it: seventeen clauses covered, five refined, two added by the task force (the voucher is not the holder; common control across a party's identifiers), three partial, four left open to the registry and governance groups.

**Shared conventions for public inputs** — context descriptor, set roots, epoch, transcript digest under RFC 8785 with `digestMultibase` encoding, the declared correlation scope from Credentials Working Draft 02, and a public-signal order offered for ratification.

**Four proving-system entries** — the reference Groth16 laboratory, ProveKit, the SIROS catalog, and Flock — written as facts with sources and a verification date. Not recommendations, and deliberately not a comparison table.

**The considerations, conformance and references chapters** the template requires, with the Privacy Considerations partly generated from the records' own adversary fields.

**A `conformance/` directory that travels with the text**: the records, requests and proving-system entries as JSON, the schema, a zero-dependency validator whose refusals are register strings, and a continuous-integration check that fails when the generated sections no longer match the records they were generated from. A digest of the records is stamped in the body. Changes go to records; a pull request that edits generated prose without its record fails the build.

## What kind of document it is

**Generated, and checkable against its own sources.** Requests, construction records, proving-system entries and the derived privacy list are produced from machine-readable data. The rest is written by editors. The digest stamp means the difference between the two is not a matter of trust.

**Informative until it is earned.** A record's state says how much weight it bears: `requested → carded → constructed → run → vetted → published`. Everything in this draft is at `carded` or `constructed`, and is marked informative. Normative language enters at `vetted`, which requires a verification-registry row filed by a party other than the constructor. RECOMMENDED for a proving system arrives later still, and only through independent reproduction across architectures.

**It selects nothing and audits nothing.** No construction is chosen; no soundness is claimed. Reproduction and behaviour are not audit, and the Security Considerations say so in those words.

**It carries no narrative.** The Cryptographic Background is adapted from the editor's own earlier expository work, cited once in the References and with the relicensing statement in the appendix.

## Where it lives, and what it does not depend on

| repository | what it holds | what leaves it |
|---|---|---|
| `trustoverip/dtgwg-zkp-tf` | requirements v0.4, the drafting rules, these discussions, the working board thread (#18) | decisions and requests — a request becomes a construction record |
| `trustoverip/dtgwg-zkp-spec` | the specification and the `conformance/` apparatus | the rendered specification; record identifiers other specifications may cite |
| the evidence repository | reference runtimes with measured costs, conformance fixtures, the verification registry of independent reproductions, the board, the generator | data — records, fixtures, row identifiers — and never a dependency |

Records, fixtures and row identifiers cross between them. Dependency does not: the specification cites the evidence repository and never imports from it, so a specification never depends on one laboratory and a laboratory is never mistaken for a specification. The evidence repository renders the same records into the same chapters as one volume that reads front to back, and keeps beside it what a specification cannot carry — each record's state and history, the run notes, and a watch over the threads that feed the records. Nothing in the specification says more than a record shows; no record says more than a runtime measured; no runtime says more than a stranger reproduced.

## Who wrote it, and why that is worth saying

I wrote this draft, and I co-chair this task force. Those two facts should not reinforce each other. The draft is a contribution and is asking to be treated as one: **nothing in it should be adopted because of the seat**, and the review below is designed so that it cannot be. A record's editor need not be its author — any reviewer who wants a record can take it, and the record's history will say so. The apparatus exists partly for this reason: a reader who distrusts the prose can read the records instead, run the validator, and see for themselves which claims the text is entitled to make.

## The review this is asking for, in rounds

Four rounds. Each decides one kind of question and explicitly refuses the others, because the common failure of a draft this size is that everything gets argued at once and nothing closes.

**Round 1 — the shape.** Two weeks from this post. Decides: chapter order; the fields of the record form; whether the `conformance/` apparatus belongs inside the specification repository or beside it; whether the state ladder is the right gate for normative language; and the public-signal order offered for ratification. Does not decide whether any particular construction is right — content objections raised in this round will be logged and carried into round 2 rather than answered. Closes when the form is either ratified as it stands or amended by pull request and the twelve records are regenerated under the amended form. This round is first because the form is cheap to change at twelve records and expensive at fifty.

**Round 2 — record by record.** Four weeks, in two batches: the eight primitives, then the four composed constructions. Each record gets its own issue, named by its identifier. The useful attack is on two fields — the adversary a privacy claim is made against, and the list of what the proof does not establish — because those are the fields that make a record falsifiable rather than merely plausible. Needed here: the construction side on gadget choices and constraint counts; the biometric side on enrolment and dependency assumptions; the credentials task force on the issuance clauses each record asks of it; and the paper's authors on the reductions, particularly the ADR-001 clause that proves a voucher's community membership while the voucher is offline. Closes per record, not globally: each record either stands with its objections recorded, gains clauses, or drops back to `requested`.

**Round 3 — the evidence.** Not time-boxed, because it depends on other people's hardware rather than on anyone's attention. A record rises to `vetted` only with a runtime whose cost is measured and an independent reproduction filed through the registry's acceptance flow — a different party, ideally a different operating system and processor architecture. Nothing rises on argument. This round is what makes the Recommendations chapter possible for the first time, and it is the round that will take the longest; it should start in parallel with round 2 rather than after it.

**Round 4 — the deliverable process.** The ToIP approved-deliverable path: intellectual-property review, editorial, the working group's own review, and the move from a versioned working draft to a numbered deliverable. Closes when the working group has something it can vote on.

**Rounds re-run.** A record that changes materially in round 3 goes back through round 2 for that record alone. The digest stamp makes the divergence between text and records visible rather than a matter of anyone noticing.

## What would help most in this thread now

Round 1 is open with this post. Three questions are the ones I would most like answered, and a short reply to any one of them is more useful than a long reply to all three:

1. **Chapter order** — should the requests answered lead the document, or should the cryptographic background come first for a reader arriving cold?
2. **The apparatus** — does the validator and its continuous-integration check belong inside the specification repository, or beside it in the evidence repository with the specification merely citing it?
3. **The gate** — is an independent registry row the right threshold for normative language, or is it too strict for a first deliverable and too loose for a later one?

The pull request is drafted and will open once the shape has been argued with; its description carries the commit-by-commit reading order for anyone who prefers to review the diff rather than the proposal.
