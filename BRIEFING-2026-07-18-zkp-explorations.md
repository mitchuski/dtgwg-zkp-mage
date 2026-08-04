---
title: Briefing — ZKP exploration programme: findings and runnable evidence
date: 2026-07-18
audience: DTG ZKP Task Force (with seams noted for the Credentials, Trust Task, Registry/Governance, and Human Experience workstreams)
from: Mitch (co-chair, Soulbis)
status: DRAFT — local working document, prepared for co-chair review before any circulation; nothing in it has been submitted upstream
---

# Briefing — ZKP exploration programme: findings and runnable evidence

## 1. What this reports

Since the Credentials Core Specification (WD v1.0) and the *Predicate & Assurance-Boundary Decision
Document* (v0.1.0-draft) landed, a local research programme has been run against them: **nineteen design
explorations**, an ecosystem cross-check against Semaphore v4, and **sixteen runnable reference suites
totalling 162 property tests, all passing** — including the programme's first real circuits (groth16,
end-to-end) and a second-language consumer that proves the conformance fixtures are
implementation-independent. Every
reference is zero-dependency, offline, and deterministic. Nothing here is a product or a proposed
normative text; it is **evidence prepared for the group's decisions** — each item traceable to a section
of the decision document, built in the order that document requires: statement first, construction
after (§2.1, §25).

The framing claim the programme tests: the Credentials Core Spec deliberately deferred its ZK protocol
details and registry-ZK interactions; **DTG ZKP V1.0 can be written as the conformant binding for the
spec's two named constructions** — the missing layer, not a parallel scheme.

## 2. Evidence highlights

**Predicates (the strawman §4 seed).** A nullifier reference (9/9 properties) whose decisive test is
the *user-as-adversary* self-Sybil case, and a trust-graph-formation reference (11/11) contributing a
candidate **edge-admissibility rule** for the deferred registry-ZK interaction. Both use the narrow
language throughout: a nullifier establishes **scoped reuse detection**, never "one unique human."
The formation model now also carries its **witness seat** (15/15): a personhood-anchored third party
attests that a collision occurred — transcript-bound, never seeing the encounter's content, and
structurally unable to mint or unlock an edge (the separation property the VWC pattern requires).

**Canonical encodings.** The §6.2 context descriptor and §15.2 canonical transcript exist as one shared
runnable encoding (11/11), where "a bare nonce is insufficient" is literally a failing test, unknown
fields are rejected (no covert extension channels), and the requested-predicate set is digest-relevant.

**Conformance fixtures (§26).** The largest single result: a fixture *format* — canonical vectors in
three classes (**accept / reject / lint**), a versioned **rejection-reason register (now v2: 66 exact
codes + 29 parameterized families, append-only, every runtime-emitted code absorbed byte-exactly and
triggered live from its emitting module)**, extraction that freezes the reference suites as data, and a
consumer that re-runs every vector demanding the same outcome *and the same named reason*. §26.1
coverage is **11 of 11 bullets, no gaps** (two bullets via minimal semantic models, honestly flagged).
The lint class is worth the group's attention: the register's "verifier must not infer" column cannot
be tested cryptographically, but it *can* be tested as claim-language linting of verifier outputs —
§26.1 already mandates one such rejection, so the class has a normative foothold.

**The fixtures are now proven implementation-independent.** A second consumer, written in Python with
standard library only and **zero shared code** (it parses the reason register out of the JavaScript as
text, never executing it), consumes all 39 vectors with matching outcomes and byte-identical reason
codes, and re-derives all 29 embedded canonical digests byte-exactly across languages. Zero
divergences found. This is §26's "independent implementations instantiate the decisions consistently"
demonstrated, and the strongest exhibit for adopting the fixture format.

**Context legibility (§6.8).** The six-question human-legibility test is runnable as a **context card
generated from the canonical descriptor itself** — the §26 evidence requirement ("user-facing
description matches the cryptographic configuration") becomes a *derivation*, not an audit; silent
context expansion (§6.6) becomes structurally impossible to hide because the card version is the
descriptor digest. (13/13; seam to the Human Experience workstream, §27.4.)

**Composition (§2.6, §27.2).** A show — several predicates in one presentation — is modelled as **one
atomic canonical transcript**: partial acceptance, member transplant across transcripts, and
à-la-carte predicate requests are all named rejections (10/10). Two findings for the group: a show's
joint disclosure is *strictly wider* than the union of per-predicate boundaries (intersection
narrowing, request-pattern leakage, bundle-shape correlation), and the constructive remedy is
**governed bundle profiles** — named, versioned predicate bundles, as cipher suites replaced
à-la-carte negotiation. (Seam to the Trust Task workstream; the credential/artifact wall holds: a show
never yields completion evidence.)

**Observable events (§20).** The ruling "unlinkability, not undetectability" made testable: a
per-observer leakage budget (all §19 observers, in §2.4 three-parameter form), a **"quiet
presentation" conformance tier** (status-schedule independence from presentations, one uniform
external error surface with reason codes holder-routed, profile-constant proof shape, on-grid
retries), and a **log-field register** with a prohibited list implementing §6.6's telemetry rule
(8/8). Honest deferrals stated: distribution-level indistinguishability needs real traffic, not a
reference model.

**Recovery and rotation (§29).** The open research item "biometric-derived secret rotation" is
answered as a **decidable profile choice** (10/10): *routine* epoch rotation is holder-side key
derivation and never touches enrolment; only *catastrophic* loss re-enters enrolment, via issuer-blind
replacement with a structural audit that no old→new pair survives in issuer state, rate-limited by a
**recovery-domain nullifier** (§13.4's input, given semantics). The trust-graph consequence is worked:
edge re-formation vs bridged continuity, with the bridge visible only inside the edge's own context
(§6.5/§6.6).

**Lifecycle (§22).** The ten §22.1 clocks sort into **two families**: *certification clocks* (an
authority sets and can renew) and *erosion clocks* (nobody renews; only monitoring plus re-base). An
**erosion-aware residual-risk record** extends Appendix B so "for how long" can be stated as a rate
rather than a cliff — with overclaiming structurally banned (a claimed *measured* erosion horizon is a
validation failure; only *declared*/*estimated* are admissible) (8/8). Offered strictly as an
informative lens, never normative.

**Mediated proving (§21).** The §21.2 control checklist as mechanism (9/9): a three-level mediator
taxonomy where the prohibited honeypot is *unbuildable at the constructor*, session-isolation and
non-retention as state-diff property tests against a frozen audit-field list, per-context
mediator-facing pseudonyms closing the §6.6 correlation-hub risk, and the §21.3 downgrade rule as a
four-exit state machine in which a silent transition cannot be constructed — even a de-listed
mediator fails closed *visibly*.

**Multi-issuer aggregation (§12.5).** The non-normative multiplicative-confidence mechanism made
executable (10/10): the ∏ε bound with its independence assumption enforced through a registry of
declared **dependency classes** — issuers sharing a vendor, pipeline, parent, or jurisdiction collapse
to one effective factor, which always *weakens* the bound; the verified statement reports the collapsed
effective k, never the raw count; k itself is governed by a small tier vocabulary because k is a
disclosure. Honest scoping: aggregation multiplies assurance for personhood, not for liveness.

**Guardian recovery (§29, social leg).** The recovery pattern that never re-touches the biometric and
survives issuer death (12/12): t-of-n attestations over a committed, personhood-gated guardian set
(a fabricated guardian cannot join — the Sybil-self-guardian attack dies at commit time), seat
nullifiers per recovery context and epoch, guardianship that *expires* and is re-affirmed (§22.2), a
contested recovery that freezes re-issuance with issuer state provably untouched, and the rule that
attestations are never completion evidence — the issuer's re-issuance is the outcome artifact. The
correlator trade is stated in full: resistance to issuer and verifier is bought at the price of t
colluding guardians and a social-graph disclosure, both named.

**Circuits (the deferred layer, in constraints).** The nullifier-membership gadget is real: Poseidon
commitment, depth-20 Merkle inclusion, domain-tagged nullifier, groth16 over BN254, proofs verifying
end-to-end. **11,523 constraints · ~630 ms proving on a consumer desktop · ~8 ms verification · 725-byte
proof** (including the one-constraint in-circuit transcript binding added after the cross-check —
proofs are now cryptographically single-presentation while the nullifier's per-context stability is
preserved and tested) — the first concrete datapoints for the performance envelope (§25) and the strawman's
claim-ceiling question. The hash-pinning requirement is made concrete (domain tag =
`sha256('dtg-zkp/nullifier/v0') mod p`, derivation documented), and the circuit's context input is the
§6.2 canonical descriptor digest — the same bytes the legibility card renders and the fixtures
serialize. A sibling circuit realizes the k=2 multi-issuer tier: two memberships under one root plus
in-circuit nullifier distinctness at a cost of exactly **2× + 1 constraint**, where a duplicate issuer
cannot even produce a witness. Setup caveat stated plainly: the trusted setup is a local, lab-only
ceremony, not production.

**Ecosystem position (Semaphore v4).** A source-verified cross-check finds the construction
**structurally conformant** with Semaphore v4 — same skeleton, same narrow nullifier semantics (their
documentation and ours both describe scoped reuse detection) — but **byte-incompatible at every
preimage**, each divergence tagged deliberate (the §13.4 version tag, commitment blinding, governed
context vs free scope) or flagged. The one accidental gap it found — no in-circuit transcript binding,
which Semaphore achieves for a single constraint — has been closed in the lab reference (a public
transcript-digest input; the input layout is offered for the group's ratification). Two strategic
questions fall out for the group: whether to define an optional **Semaphore-compatibility profile**
(their audited circuit and production ceremony, with scope set to our governed descriptor digest), and
whether **EdDSA-based identity** is worth adopting for holder-binding synergy.

## 3. Candidate contributions, in discussion order

1. **E1–E7** — seven coherence edits interlocking the liveness strawman with the Credentials Core Spec
   (normative reference, per-predicate anchor table, "accredited set" → trust registry, the two
   constructions named, PHC/IDVC framing, taskContext freshness, concrete Credentials-TF alignment).
2. **A §26.2 fixture format** — the vector schema, the reason register (append-only, versioned, with
   §13.6 retry-ambiguity marked per code), and the lint class, offered for ratification alongside §28.
3. **The PHC-realization note** — how a VTC's one-membership-per-person governance rule becomes
   enforceable in-context via the nullifier (governance dedupes the enrolment; the proof makes the
   dedup binding), stated in PR-UNQ's narrow language.
4. **The recovery profile choice** — the routine/catastrophic split plus the recovery-domain nullifier,
   turning §29's open item into options with stated trades.
5. **Bundle profiles** — joint work with Trust Tasks (§27.2).
6. **The context card** — joint work with Human Experience (§27.4).
7. **The Semaphore position** — ratify the deliberate divergences, decide the transcript-binding input
   layout, and choose whether a Semaphore-compatibility profile ships as an optional second profile
   (audited circuits + production ceremony for deployments that want them; the native gadget stays the
   reference for the full §13.4 binding).

## 4. Open questions surfaced for the group

Beyond the §28 ratification list (which stands), the programme surfaced these:

- **Log retention's clock family has two faces**: as a set bound it is a certification parameter; as
  correlation accumulation it is erosion. The record format may need both; unresolved by design.
- **Bundle-registry authority**: the context authority (§6.7), the Trust Task workstream, or a shared
  body? The registries interlock.
- **Fixture witness opacity**: semantic vectors (construction-neutral) vs construction vectors
  (per proving system) — proposed two-layer answer needs appetite.
- **Assurance-class vocabulary** for the IDVC boundary object: whose enumeration, with cardinality
  minimised (§18.2)?
- **Witness membership scope** (VWC seat): same-VTC witnesses only, or any registry-anchored witness?
- **Transcript-binding input layout**: the lab reference now binds the §15.2 canonical transcript
  digest into the proof (closing the cross-check's one accidental-gap finding); the public-signal
  layout needs ratification before any circuit text is proposed.
- **EdDSA identity**: Semaphore's signing-capable enrolment secret enables holder-binding and
  off-circuit ownership proofs ours cannot; adopting it (with our blinding retained) is a real
  capability question, not a cosmetic one.

## 5. Disposition

All work is local. The tracked working tree of the TF clone carries only one pending two-line README
edit; reference code lives in an excluded lab; design documents live in a separate research root.
Anything above moves upstream only as individual PRs/issues after group discussion — beginning, if the
group agrees, with E1–E7 and the fixture-format proposal.
