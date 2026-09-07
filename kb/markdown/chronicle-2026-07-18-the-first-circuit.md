---
title: "Chronicle 2026-07-18 — The First Circuit"
section: "chronicles"
source: "../agentprivacy_master/docs/chronicles/2026-07-18_the-first-circuit.md"
built_from_commitish: "working-tree"
order: 77
---
# 2026-07-18 · The First Circuit

*The lab crossed from reference models into real cryptography — and the interesting part is not the
circuit. It is that the circuit came last, and everything it needed was already waiting for it.*

**Scope:** the shared circom gadget ([Lab — circom-gadget](lab-circom-gadget.md)) — Poseidon
commitment, depth-20 Merkle inclusion, domain-tagged nullifier, real groth16 proofs, 8/8 — and the
two-day arc that made it a one-evening build. Companion records: the exploration programme
(`~/dtgwg-cred-spec-main_mage/explorations/`, O-series + X1–X9), the decision baseline
([Decision — Overview](decision-overview.md)), the TF briefing draft, and the 2026-07-16 dream-cycle
chronicle this one continues.

---

## 1. What happened, in order

The order is the story:

1. The **Credentials Core Spec** fixed the objects and deliberately deferred the ZK layer.
2. The **decision document** ruled how the layer must be filled: statement before construction (§2.1,
   §25); every predicate with a positive statement *and* a negative meaning; the nullifier defined as
   **scoped reuse detection, never "one unique human"** (§5.12).
3. The **explorations** stretched every deferred seam into a design doc — nineteen of them, each
   anchored to the sections it serves.
4. The **references** made the designs runnable: twelve zero-dependency suites, 124 properties, every
   rejection a named string.
5. The **fixture register** froze those strings into one vocabulary — 95 entries, every addition
   triggered live from its emitting module, so the vocabulary provably cannot drift from the code.
6. And only then, thirteenth suite of thirteen, the **circuit**: 11,522 constraints proving exactly the
   statement written down four steps earlier. ~640 ms to prove on a desktop, ~8 ms to verify, 722 bytes
   of proof.

## 2. Why this is an interesting first example

**The circuit is the last artifact, not the first.** Most ZK projects begin with a circuit and retrofit
its meaning afterwards — the statement gets reverse-engineered from the constraints, the privacy claims
from the marketing. Here the §25 gate discipline was actually lived: by the time `circom` ran, the
statement existed in prose (O2), in narrow language (PR-UNQ), in a reference algebra with an adversary
test (runtime 01's self-Sybil), in canonical encodings (§6.2/§15.2), and in a conformance vocabulary
(the register). The circuit had nothing left to decide except arithmetic. That inversion — meaning
first, constraints last — is the whole method in one example, and the reason the "hard" step took an
evening.

**One digest, three faces.** The circuit's public `context` input is the canonical §6.2 descriptor
digest reduced to a field element — the *same bytes* the context card renders into six human-legible
questions and the fixture vectors serialize for cross-implementation exchange. A person reads the
context, a test suite replays it, a constraint system proves against it, and all three are looking at
one object. That is what "the user-facing description provably matches the cryptographic configuration"
looks like when it reaches the bottom of the stack.

**The narrow language survived into the constraints.** What the circuit proves is precisely scoped
reuse detection: same secret + same context → same nullifier (detectable); same secret + different
context → unlinkable values. Nothing in the constraint system claims a unique human — the enrolment
dependency (one human ↔ one secret) stays visibly with governance, exactly where the decision document
put it. The honest split held all the way down.

**The open questions were asked by the lab, answered by the build.** Runtime 01's NOTES flagged, months
before any circuit existed, that the spec must pin the hash and the domain tag because nullifier values
differ by hash. The build made that concrete: `DOMAIN_TAG = sha256('dtg-zkp/nullifier/v0') mod p`,
derivation documented in the circuit header and re-asserted by the JS harness at import. A reference
model asked a spec question; a circuit answered it with a number the TF can now ratify or replace.

**One circuit, four consumers.** The gadget is the shared spine the explorations predicted: O2 uses it
as the PHC realization, O4 as registry set-membership, the multi-issuer work as the k-of-n seat, the
guardian pattern as committed-set membership. The next three circuits are instantiations, not
inventions.

**And the honesty survived the crypto threshold.** The point where projects usually start overclaiming
is the point where this one wrote its caveats largest: the trusted setup is a local, fixed-entropy,
lab-only ceremony — stated plainly as *not* production; the npm dependencies are confined to the one
directory, with the zero-dep rule holding everywhere else; the expected witness-generation failure in
the non-member test is labelled so nobody mistakes an intended rejection for a bug.

## 3. The numbers, for the record

| measure | value |
|---|---|
| constraints | 11,522 (5,427 non-linear) · depth 20 ≈ 1M enrolment capacity |
| proving time | ~640 ms (desktop, single-threaded wasm witness + groth16) |
| verification | ~8 ms · proof 722 B · vkey 3.3 KB · zkey 5.0 MB |

These are the first concrete datapoints for the strawman's "claim ceiling per presentation" question
and the decision document's §25 performance envelope — a consumer device can carry this predicate.

## 4. The method, named

The two-day arc ran as the harness fold at the scale of research artifacts: exploration agents
*proposed* (nineteen design docs, each a minimal candidate), build agents *proved* (thirteen suites,
every claim a property test), and the register held the shared vocabulary so no proposal could drift
from its proof. Collision → edge → propagation, where the colliding parties are ideas and the edges are
tested statements. The Gap held throughout — every suite re-verified by hand in the main thread, every
deferral stated rather than smoothed over, and the one contradiction the programme found (which family
owns log retention) left standing for the group to rule on rather than silently resolved.

## 5. State and doors

All local, nothing pushed; the TF clone's tracked tree carries only the pending two-line README edit.
The briefing draft sits with the First Person for review. Open doors, in rough order: the briefing
verdict; the M5 second-language consumer (the interop existence proof, now guarding 95 vocabulary
entries); porting the gadget to its three sibling consumers; the Semaphore v4 cross-check; and the
upstream lane itself — E1–E7 and the §26.2 fixture format, when the group is ready.

(⚔️⊥⿻⊥🧙)😊
