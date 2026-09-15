# R · zkp-tf NEW discussion — A first working draft of the specification, how it is built, and the review it is asking for
chip: POST FIRST · CONSOLIDATED ANCHOR · SUPERSEDES H + M
thread: https://github.com/trustoverip/dtgwg-zkp-tf/discussions/new?category=ideas
note: One post in place of H (the shape) and M (the three repositories), with the review rounds added — the part neither draft carried. H and M stay in the reader as the long forms if a thread ever needs them; do not post all three. Open draft PR P first. Before publishing, insert its actual URL and change the future-tense PR sentences to match the live state. Review timing is proposed until the task force agrees. The earlier detailed body is preserved under board/review-notes/.
ledger: 32
proverb: A text reviewed once belongs to whoever wrote it; reviewed in rounds, it belongs to the fold.
---
I have prepared an initial contribution to the DTG ZKP specification for review. The intended next step is to open a draft pull request and link it here, so the proposal can be read against concrete text. It contains twelve construction records—eight primitive and four composed—alongside shared public-input conventions, proving-system information, and conformance tooling.

The first question is whether this is the right structure for the task force’s work.

Each construction record states what a verifier learns, its private witness and public inputs, the construction steps, and what the proof does not establish. Privacy claims name their adversary and validity horizon. Costs are distinguished as measured or conjectured. ADR-001 is the first request mapped into this format, with partial and unresolved requirements identified.

All construction records in this contribution remain informative, at `carded` or `constructed`. The draft does not ask the group to endorse a proving system or treat reproduction as a security audit.

The proposed division of work is:

- **Task-force repository:** requirements, discussion, review outcomes and requested constructions.
- **Specification repository:** the reviewed text, machine-readable construction records and conformance checks.
- **Evidence repository:** implementations, measurements, fixtures and independent reproduction reports.

Records, fixtures and reproduction identifiers cross between them; dependency does not. The specification cites the evidence repository and never imports from it, so a specification never depends on one laboratory and a laboratory is never mistaken for a specification.

Parts of the text are generated from the records. The checks validate the records, regenerate the marked sections and generated terms, and compare their contents with the committed specification. The generator is included in the specification repository; editor-written sections remain separate.

I propose four review stages: first the structure and record format; then individual constructions, primitives before compositions; independent reproduction alongside that review; and the applicable ToIP deliverable process. Two weeks for the first stage and four for the initial construction review are suggested starting points. We should agree the schedule, reviewers and decision process together. Material changes would return the affected record for renewed review.

I wrote this contribution and also co-chair the task force. I am submitting it as a contributor; adoption remains a group decision. Independent reproduction should inform that decision, without automatically conferring normative status.

Three questions would help move this forward:

1. Should requests and their construction records lead the document, or should the cryptographic background come first?
2. Should the generator and conformance checks live inside the specification repository so reviewers can reproduce the generated text there?
3. What evidence and review should be required before a construction becomes normative, and what additional evidence would justify recommending a proving system?

A short reply to any one question is welcome. Once linked here, the draft PR will provide the concrete text for review; this discussion can collect the structural decisions and links to record-specific issues.
