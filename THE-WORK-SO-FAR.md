# The work so far — a companion for humans

*The spoken companion to [`AGENTS.md`](./AGENTS.md) and [`PATH-MAP.md`](./PATH-MAP.md).
Those two are for your AI assistant; this one is for you. Reading time ~4 minutes.*

---

Since this task force formed, I've kept a lab running beside the spec work, on
one working principle: **before we ask the group to decide anything, there
should be something you can run that makes the decision concrete.** A privacy
claim you can't test is a mood. So the drafting rules we adopted upstream —
name the adversary, name the horizon, write what a predicate does *not*
establish, label conjecture — weren't written as etiquette. They fell out of
building this lab and watching which claims survived contact with executable
form.

Here's what exists, in the order it grew.

**First, a decision baseline.** The predicate & assurance-boundary document —
now the frame for our first work item — names eight predicates, and for each
one: what it establishes, what it refuses to establish, what it discloses and
to whom. The most consequential narrowing in it: a nullifier gives you *scoped
reuse detection*, not "one unique human." Per the root paper, full unlinkability
and Sybil resistance cannot coexist — so where we sit on that trade curve is a
decision we make in the open, not a property we get for free.

**Second, the explorations.** Nineteen design studies covering the ground the
decision document opens: what a context *is* as bytes, what a presentation
transcript must bind, what a show leaks to each observer, what survives key
loss and guardian churn, when k issuers actually mean k, what happens when a
phone can't make the proof, and how assurance decays over time — as a rate,
not a cliff.

**Third — and this is the part I'd most like you to poke at — the runnable
evidence.** Seventeen test suites, 170 properties, all green. Fourteen of them
need nothing but Node and Python — no installs, clone and run. The properties
aren't demos; they're the claims themselves. "A bare nonce is insufficient" is
a *failing test* in the canonical suite. "A witness can never mint an edge" is
a property with a number next to it. "Silent downgrade to a weaker proof is
unconstructable" is enforced by a state machine you can try to break.

Three of those suites are **real circuits** with measured numbers: the core
nullifier-plus-membership circuit at 11,523 constraints — about 640 milliseconds
to prove, 8 milliseconds to verify, proof 722 bytes — plus a dual-issuer
variant and a t-of-3 guardian-recovery variant. When we reach construction
selection, we're not choosing from adjectives; the envelope data already exists.
One honest caveat that I'll keep repeating: the trusted setup is a lab fixture,
not a production ceremony.

Two findings from the wider world are worth a sentence each. We cross-checked
against **Semaphore v4** — the closest deployed relative — and found it
structurally conformant with our shape but byte-incompatible, with one
accidental gap: no in-circuit transcript binding. Closing that gap in our own
circuit cost exactly **one constraint**. And a stdlib-only **Python consumer**,
sharing zero code with the JavaScript, re-derives all 29 canonical digests
byte-for-byte — which is the difference between "we wrote a spec" and "two
strangers can agree."

**What this is, and isn't.** None of it binds the task force. It's input —
built to be ratified, refined, or refuted. The fastest way to disagree with me
is not a comment thread; it's a failing test, and I will genuinely celebrate
receiving one. The decision document exists *because* the earlier drafts
contradicted themselves, and it was review that caught it. That's the loop
working.

**The ask.** Point your AI assistant at the repository —
`github.com/mitchuski/dtgwg-zkp-mage` — it will find its own instructions
there. Then ask it to walk the path map with you and produce a position record:
which parts you'd ratify, which you'd refine or refute, and where you could
build. The seams where help matters most right now: a third-language
conformance consumer, circuit engineers willing to attack the constraint
counts, anyone with production telemetry to collide with the observer-leakage
budget, real-world knowledge of issuer infrastructure sharing, and a
statistician's eye on the sampling proposal in discussion #11.

The boundary is the pedagogy. Come collide with it.
