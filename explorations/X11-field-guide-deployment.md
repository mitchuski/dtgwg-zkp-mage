# X11 — The Field Guide deployment — runtime 07 meets a walking AR game

*Runtime 07 has been a reference model with no consumer. A production AR client needed exactly its
relations — collision → edge → propagation, bilateral consent, fresh R-DIDs, the Gap — to replace a
hard-coded peer fixture with real one-hop trust. Most of 07 survived contact. One gate has no analogue
in the deployment and cannot be given one. One property the deployment deliberately declined to use,
and the reason is a finding rather than a shortcut.*

**Register:** none — X-series deployment bridge (TF work reaching *out* into a shipping product, the
reverse direction from X6) · leverage 🟢 · **Ladder:** reference built 2026-08-15 —
`/Volumes/24mitchuski/field_guide_privacymage/runtimes/` : `meet-overlay` 54/54, `fixtures` 8/8,
`consumer-py` 15/15, **`lab-bridge` 10/10 importing this repo's `07-trust-graph-formation` and
`01-uniqueness-nullifier` directly**. Run: `cd runtimes && node verify.mjs`.
**Anchor (this repo):** `runtimes/07-trust-graph-formation` (all of it) · `runtimes/01-uniqueness-nullifier`
(by absence — see §4) · X1 conformance fixtures (§7) · X6 erosion clocks (§6) · X4 observable-event
minimisation (§5).
**Anchor (external):** Hitchhikers Field Guide (Unity AR World) + OASIS ONODE `TrustGraphController`;
handoff `MITCH_ARWORLD_FIELD_GUIDE_HANDOFF.md`, 2026-08-15, from Max.
**Counter-spec produced:** `field_guide_privacymage/COUNTER-SPEC-meet-and-overlay.md`.

---

## 1. Why this is evidence and not a side project

The lab's working principle is that before the group decides anything there should be something you can
run that makes the decision concrete. Runtime 07 does that for trust-graph formation — but only against
itself. Every gate in it is justified by an argument, and arguments are cheap until something outside
the argument needs them.

The Field Guide is that outside thing. It is a walking AR client where "multiplayer" means you witness a
place, that fact lands in Knowledge, Promise decides what a peer may see, and Trust decides whose
Knowledge you may query at all. Its overlay ships today with the Trust side stubbed: `fromGraph` returns
two invented players from a JSON file. The ask was for the smallest honest thing that replaces them.

The answer turned out to be runtime 07, almost unchanged. That is the first result, and it is worth
stating plainly because it could easily have gone the other way.

## 2. What survived, asserted rather than claimed

`runtimes/lab-bridge/test.mjs` imports this repo and runs the same scenarios through both models. It is
a dependency, not a correspondence table: if a gate or a rejection name changes here, it goes red.

| Property | Both models | Bridge |
|---|---|---|
| A consenting meet forms exactly one edge | ✓ | B1 |
| Unilateral consent refused, *same rejection name* | ✓ | B2 |
| Self-edge refused, same name | ✓ | B3 |
| The edge is idempotent per pair | ✓ | B4 |
| **The Gap** — the prover recomputes the commitment and refuses the proposer's claim | ✓ | B5 |
| R-DID freshness per counterparty | ✓ | B6 |

The Gap surviving is the one I would highlight to the task force. In the lab it is an algebraic
commitment about non-collusion between proposer and prover. In the game it is a phone that has just
scanned a QR code asserting a value to the phone that displayed it, and the displaying phone recomputing
it instead. Same structure, entirely different substrate, no adjustment required.

## 3. The delta is four gates, and it is bounded

The deployment adds four rejections to 07's core and no others (B8 asserts the count, so a fifth added
quietly turns the suite red):

- `meet-offer-expired` — an offer is a moment. TTL 120 s.
- `meet-offer-replayed` — the nonce is single-use, so a photographed QR is spent.
- `meet-not-colocated` — the two devices were within 50 m.
- `offer-not-mine` — a routing check that exists only because the rite crosses an HTTP endpoint rather
  than two co-present processes.

The first three are what "the encounter is physical" costs. 07's `encounter()` produces a shared matching
compression that only two parties can derive; it does not care *how*, and it is right not to. When the
how is two people in a street, freshness and replay and proximity are exactly the three questions that
appear. **Proposed refinement to 07's NOTES:** name these as the deployment surface of `encounter()`, so
the next consumer knows which three questions it owns rather than rediscovering them.

## 4. The gate with no analogue — and the honest finding

Runtime 07 gate **G2** requires both endpoints to be personhood-anchored: a member of a VTC with an
M-DID, one node per human per community, via runtime 01's nullifier. It is the PHC rule made mechanical
and it is load-bearing for everything the trust graph claims about Sybil resistance.

The Field Guide has nothing to anchor to. OASIS avatar creation is not personhood-gated. So:

> **B7 — an OASIS avatar presented to this repo's own Swordsman is rejected with
> `endpoint-not-personhood-anchored`.**

That check passes, which is to say the boundary is real and now lives in a test rather than in a caveat.
The consequence, stated for the record: **the Field Guide trust graph is a pseudonym graph, not a
personhood graph.** One human can hold many avatars and mint edges between them. Every privacy property
of the deployment survives that — pairwise references, per-edge disclosure, the absence of a score — but
no Sybil-resistance property does, and none is claimed.

This is the negative space the drafting rules ask for. It also names precisely where runtime 01 would
enter if the deployment ever needs it: not as a nice addition, but as the only thing that would make
G2 satisfiable.

### 4.1 Correction — G2 is stricter than the cred-spec, and the deployment found that

*Added after reading the vendored cred-spec (`dtgwg-cred-spec-main/spec/body.md`) rather than working
from the coherence map.* My first draft of §4 framed the personhood gap as the deployment falling
short. That framing is wrong, and the error is on the lab's side, not the game's.

The cred-spec defines **two** constructions, and is explicit that the first needs no community:

> "Community membership is **not** a precondition for issuing, holding, or presenting a VRC; two
> entities that do not share (or do not hold) a VMC can still exchange VRCs, and the resulting edges
> are valid trust attestations standing on their cryptographic signatures and on whatever real-world
> context the parties bring to them."

And of the pairwise ZKP: "It does not by itself confer any community-level assurance (e.g.,
personhood)."

So the Field Guide is not a deficient community-anchored deployment. It is a **conformant pairwise
(VRC-based) deployment**, which the spec names and permits.

**The finding for this lab:** `runtime 07` gates *every* edge on personhood anchoring (G2), which
models only the **community-anchored (VMC-based)** construction. It does not model the pairwise one at
all — and the pairwise one is the construction available to any two parties, with no VTC in sight.
That is a coverage gap in the lab's own evidence, and it took an external deployment to surface it:
the lab had no consumer standing outside a community, so nothing ever exercised the case.

**Proposed build:** a `07b` variant, or a flag on `Swordsman`, that omits G2 and models pairwise VRC
formation. Every other gate — consent, no self-edge, R-DID freshness, the Gap, idempotence — applies
unchanged, which the bridge already demonstrates. B7 then changes meaning from "the deployment fails
the gate" to "the deployment uses the construction where the gate does not apply," and stays valuable
either way because it pins which construction is in play.

This supersedes the framing in §4 above wherever the two disagree.

## 5. What the deployment declined to use, and why that is a finding

Runtime 07 models **propagation** — `connected()`, transitive reachability — and it is right to. "Does
trust reach from A to C" is a genuine question about a trust graph, and G8 is a correct property.

The overlay declined it. Peers appear on your map at one hop only; two hops contributes nothing, not a
reduced tier. B9 asserts the divergence directly: the lab reports `connected() === true` across two hops
while the game reports that nothing is visible.

The reason is not performance and not caution. The two models are answering different questions:

- 07 asks **does trust reach** — a property of the graph.
- The overlay asks **who may see** — a disclosure decision about a person's data.

Answering the second with the first is how a trust score gets built by accident. The moment
friend-of-friend leaks in at a reduced tier, graph distance has become a currency, every player's
incentive turns into edge farming, and the "no central trust score" commitment is gone without anyone
deciding to remove it.

**Proposed refinement:** 07's NOTES currently presents propagation as the third arrow of
collision → edge → propagation without distinguishing these two readings. Naming them separately would
cost two sentences and would protect the next consumer from the same conflation. This is the one place
where the deployment thinks the lab's framing, though correct, is under-specified — a *refine*, not a
refute. It also connects to discussion #11's list-inflation question: edge admissibility is one answer,
and "reachability is not visibility" is a second, cheaper one that does not require a threshold.

## 6. Erosion, arriving independently at X6

The deployment needed a recency rule for overlay pins — the product spec proposed "witnessed in the last
90 days". It ended up at a half-life with a floor rather than a cliff, and the same asymmetry X6 argues
for: a peer's old enthusiasm should weigh less over time, while your own record of having been somewhere
does not decay at all.

That is X6's rate-not-cliff ruling reached from a completely different direction, by someone solving a
map-rendering problem. Weak evidence, but the good kind: the shape was not imported, it was arrived at.

**Gap in the deployment, recorded here so it is not lost:** the *edge* does not erode and there is no
revocation path. A meet from four years ago currently weighs exactly what a meet from Tuesday weighs.
The machinery exists; it is simply not applied to the edge. X6's ten-clock sort is the obvious place to
go for what kind of clock a relationship should be on.

## 7. A second instance of the X1 instrument — and what it caught

The deployment reproduced this repo's conformance pattern from scratch in a different domain: a closed
rejection register (22 codes, every one triggered live), deterministic vectors, and a zero-shared-code
Python consumer re-deriving every projection digest byte-exactly (15/15).

Within an hour of existing, the consumer caught a real divergence that no amount of review would have
found. The public disclosure tier coarsens geography to ~100 m. JavaScript rounds a midpoint up; Python
and **C# round to even**. Same pin, ~110 m apart, opposite sides of a street, both implementations
passing their own tests. The rule now names its rounding mode and a vector sits exactly on the boundary.

For the task force this is worth more than the bug. **X1's thesis is that the fixture set is the real
interop artefact, and P5 asks for a third-language consumer.** Here the instrument was rebuilt by the
same author in an unrelated domain and immediately earned its keep. That is not proof, but it is the
second data point, and it is the kind of thing that should be cited when §26.2 fixture-format adoption
comes up rather than argued from first principles again.

The relevant detail for spec text: it is not enough to say a value is coarsened. **A coarsening rule
that does not name its rounding mode is not a rule** — and the same applies to any numeric field in a
canonical encoding. This generalises directly to the descriptor and transcript encodings in P2.

## 8. Draft position record

Filed here as a draft. Per the protocol, positions on TF decisions go upstream under Mitch's own name;
nothing below has been posted.

```markdown
### Position — P10 · Trust-graph formation
- **Member:** Mitchell Travers, Soulbis
- **Position:** ratify (core), refine (two framings)
- **On what, exactly:** `runtimes/07-trust-graph-formation` gates G1, G3, G4, G5, G6, G7 —
  ratify. Runtime 07 NOTES' presentation of propagation (the third arrow) and of
  `encounter()`'s deployment surface — refine.
- **Reasoning:** the six ratified gates were re-derived, unaltered, by an external
  deployment (Hitchhikers Field Guide / OASIS ONODE) that needed them for a shipping
  product rather than for an argument, including the Gap surviving a substrate change
  from agent-to-agent to phone-to-phone. Adversary named: a tampered client attempting
  to talk a counterparty into an edge (B5), and a player attempting to farm visibility
  through graph distance (B9). Horizon: none claimed for the edge — the deployment has
  no edge erosion or revocation, which is stated negative space, not an implied
  permanence claim. Conjecture: that "reachability is not visibility" generalises beyond
  map overlays is untested.
- **Evidence:** `field_guide_privacymage/runtimes/lab-bridge/` 10/10, importing this
  repo's runtime 07 and 01 directly, so drift breaks the suite. B7 is a live check that
  an OASIS avatar fails G2 — the deployment is a pseudonym graph, not a personhood
  graph, and says so.
- **What I/we could bring:** a deployment consumer of runtime 07, kept running against
  this repo; a second instance of the X1 conformance instrument with a cross-language
  divergence it caught; and the pseudonym-vs-personhood boundary as a worked example for
  the decision document's negative space.
```

## 9. What this does not establish

- **Not zero knowledge.** Same standing as runtime 07: it models the relations a ZK construction would
  prove. Nothing here bears on §25 construction selection.
- **Not location integrity.** Co-location is asserted by a client's own GPS. Two colluding players can
  mint an edge from opposite ends of the country. Acceptable *in the deployment* because an edge exposes
  only what the owner's policy allows and there is no score to farm — but that argument is local to this
  product and must not be carried into the spec.
- **Not personhood, and not Sybil resistance.** §4. This is the boundary, and it is the point.
- **Not a claim about scale.** One deployment, one author, and that author wrote both sides. An
  independent consumer of runtime 07 would be worth more than this document, and remains the ask.
