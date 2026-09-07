# S · zkp-tf — side note: an agent-first verifiable trust agent implementation, offered as a testbed for record 020
chip: SIDE NOTE · POST LAST · DISCLOSURE
thread: https://github.com/trustoverip/dtgwg-zkp-tf/pull/21 (as a comment) — alternate: a short reply under R once the anchor is up
note: A side note, deliberately. It discloses a project of mine and offers it as somewhere the delegation record can be run and fail; it proposes nothing and asks for nothing to be adopted. Post after R and after the pull request is open, so it reads as a footnote to the delegation lane rather than as a pitch. The credentials-side long form is draft Q; do not post both into the same week.
ledger: 33
proverb: A record that has never been run is a promise; give it somewhere to break.
---
A side note on the delegation lane, offered as disclosure rather than as a proposal.

Record 020 and the agent-runtimes document both describe an agent that acts for a member within a granted scope. Neither has an implementation to fail against. I have been building one, and it is my own project rather than task-force work, so it is worth naming here rather than surfacing later as a surprise.

**What it is.** A verifiable trust community whose *members are agents* — verifiable trust agents in the infrastructure's own sense — with humans as community trust anchors and sponsors and never as members. It runs on the OpenVTC verifiable trust infrastructure unmodified; the only unusual thing is that policy. Today it is a local twin on one machine passing a sixty-eight-row acceptance check. It is not on the internet, and there is nothing to join.

**Why it is relevant to this task force.** It is an *agent-first* reading of the delegation lane: the agent is the principal being admitted, rather than an accessory to a human who is really the member. That inverts the question record 020 asks. The record proves that an agent acts for a member within a scope; this asks what it means for the agent to *be* the member, and what a verifier is then entitled to learn about the human behind it. Both readings need the same machinery — a chain that resolves, a scope that bounds, an expiry that is monotone, an acceptance the delegate countersigns — and an implementation is where the difference between them shows up.

**What it can return here, if anything.** Three things the records currently assume without evidence: whether an agent-held credential needs any field the construction records do not have; whether a role credential should lapse together with the graph evidence that justified it, or outlive it; and whether a single carried key over a canonical form is the right shape for a proof carrier that walks between communities, or whether it is a correlator wearing a better name. Those are answerable by running something, not by drafting.

**What it is not.** Not proposed for adoption in any form. Not a product, and nothing in the specification draft depends on it or cites it. If it produces anything the task force can use, it will arrive the way everything else does — as a record with an adversary, a fixture, and a run someone else can reproduce. Until then it is a testbed, and this note exists so that its author is on the record as its author.
