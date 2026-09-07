# P · dtgwg-zkp-spec PULL REQUEST — Working Draft 0.1: construction records, conformance apparatus, front matter
chip: AFTER H · THE PR BODY
thread: https://github.com/trustoverip/dtgwg-zkp-spec/compare/main...zk-book
note: Push branch `zk-book` from ~/dtgwg-zkp-spec, then open the compare link. Three commits per COMMIT-PLAN (C1 front matter · C2 conformance/ + CI · C3 body + terms), each with the rite footer and DCO sign-off, no AI trailer. Preconditions: the relicensing line in Appendix A and the editors line confirmed with Scott. Paste this as the PR description; the title is the heading after the dash.
ledger: 26
proverb: What is offered to the fold is offered with its checks; the text may not say what the records cannot show.
---
This pull request replaces the template placeholders with the first Working Draft of the DTG Zero-Knowledge Proof Specification and adds the machine-readable apparatus the text is generated from and checked against. It is proposed for discussion, not for ratification of any construction: every construction record in it is at state `carded` or `constructed` and is marked informative.

**Three commits, each readable alone.**

1. *Front matter and repository description* — `specs.json` (title, description, the DTG Credentials Core Specification as an external glossary; everything else unchanged), `README.md`, `spec/header.md` (Working Draft 0.1, IPR per the DTG Working Group charter), `spec/intro.md`, `spec/terms-and-definitions-intro.md`, `spec/appendix.md`; the two placeholder terms are removed.
2. *Conformance apparatus* — `conformance/records/*.json` (twelve construction records), `conformance/requests/ADR-001.json`, `conformance/stacks/*.json` (four proving-system entries), `conformance/schema/construction-record.schema.json`, `conformance/validate.mjs`, `conformance/test.mjs`, `conformance/README.md`, and `.github/workflows/validate-conformance.yml`. Apache-2.0. The validator's refusals are register strings; the test fails when generated text is stale.
3. *Body and terminology* — `spec/body.md` and `spec/terms-definitions/g-*.md`, generated from commit 2's records (the digest is stamped at the top of the body and re-checked by CI), plus the editor-written sections: Cryptographic Background, Public Inputs, the Considerations, Conformance, References.

**What is generated and what is written.** Requests Answered, Construction Records, Proving Systems, the derived list in Privacy Considerations, and the `g-*` terms are generated. To change any of them, change the record; a pull request that edits generated text without its record fails `conformance/test.mjs`. The rest is written by the editors.

**What this draft does not do.** It does not select a construction — the Proving Systems section records facts with sources, and recommendations arrive only through the reproduction ladder in a later pull request. It does not claim soundness for any record — reproduction and behaviour are not audit, and the Security Considerations say so. It does not carry narrative: the Cryptographic Background is adapted from the editor's own earlier expository work, cited once in References, with the relicensing statement in Appendix A.

**How to review.** The record form and chapter order: read commit 1 and the Introduction. The apparatus: read commit 2 and run `node conformance/test.mjs`. The constructions: read commit 3 against commit 2 — each record's section prints its state first. Objections to a particular construction are best filed as issues naming the record id; objections to the shape belong in the task-force discussion thread that announced this pull request.

**Relationship to other work.** Requirements v0.4, the drafting rules and the working board remain in `trustoverip/dtgwg-zkp-tf`; PR #21 there (`AGENT-RUNTIMES.md`) is independent. Runtimes, fixtures and the verification registry remain in the evidence repository the records cite. The Credentials Core Specification's Working Draft 02 vocabulary (three correlation scopes) is the vocabulary these records are written in; a test refuses the retired identifier-type acronyms.

Rendered preview: the `render-and-deploy` workflow publishes on merge; until then, `npm install && npm run render` on this branch.
