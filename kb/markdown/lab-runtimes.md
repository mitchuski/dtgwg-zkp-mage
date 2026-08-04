---
title: "Lab — Runtimes"
section: "lab"
source: "../dtgwg-zkp-tf-mage/runtimes/README.md"
built_from_commitish: "working-tree"
order: 59
---
# DTG ZKP — Local Runtime Prototypes

**Status:** Local experimental lab. **Not** part of the upstream `trustoverip/dtgwg-zkp-tf` repo — excluded via `.git/info/exclude`, never pushed. Spec-doc edits go upstream via PR; this directory stays here.

**Sibling spec:** these predicates prove things *about* the credentials in the [DTG Credentials Core Specification](http`s://trustoverip.github.io/dtgwg-cred-spec/`) (VRC/VMC/VIC/VPC/VEC/VWC, R/M/C/P-DID). That spec is format-agnostic on ZK and defers the ZK layer to us; `./CRED-SPEC-COHERENCE.md` maps each predicate to its credential anchor.

**Workbench ↔ research root (2026-07-17):** this clone is **the workbench** — Mitch's direct ToIP WG
work: this evidence lab (excluded), plus PR-shaped spec edits in the tracked tree; the only path to
upstream. The **research root** is `~/dtgwg-cred-spec-main_mage` — the vendored cred-spec, the
Predicate & Assurance-Boundary Decision Document (working draft), and `explorations/` (the expansion
ideas as buildable design docs). Ideas iterate there and *promote* here when they become TF work
(runtime code lands in this lab; review-ready drafts land in the tracked tree at their upstream path).
The loop is written down in [Workflow — Workbench and Research Root](workflow.md).

**Purpose:** turn Section 4 of `../proof-of-liveness-requirements.md` — *"which ZK proof type(s) to use per predicate"*, the task force's **first substantive decision** — from prose candidates into **runnable reference constructions**. A co-chair showing up with working code per predicate lets the group converge on that decision against behaviour, not just intuition.

Each runtime answers one question for one predicate: *does this construction actually give the properties the strawman claims, and what does it cost?*

## The six predicates (Section 4)

| # | Predicate | Candidate construction | Anchor (cred-spec) | State |
|---|-----------|------------------------|--------------------|-------|
| 01 | **Uniqueness within a context** | Nullifier / Semaphore-style deterministic per-context pseudonym | R-DID uniqueness + PHC "one-per-person" | 🟢 reference + property tests |
| 02 | **Liveness attestation** | ZKP of a valid issuer signature over a hidden attestation | IDVC (identity-verification credential) | ⚪ stub |
| 03 | **Personhood / accredited issuer** | One-of-many (set-membership) over an accredited issuer set | VMC from a recognized VTC · trust registry | ⚪ stub |
| 04 | **Holder / agent binding** | PoK of holder key, bound to the session | VPC / P-DID · VTA presenter | ⚪ stub |
| 05 | **Freshness** | Binding to a verifier challenge / nonce / transcript | taskContext + outcome-interpretability | ⚪ stub |
| 06 | **Demographic range** (if in scope) | Range proof over an attested attribute | VEC attribute · selective-disclosure predicate | ⚪ stub |
| 07 | **Trust-graph formation** (dream-agent cycle) | Mage⊥Swordsman fold minting VRC edges on personhood + mutual consent | VRC edge · community-anchored propagation | 🟢 reference + property tests |

The stack decision is still made **per predicate** as each runtime is built, not committed globally up front (see each `NOTES.md`/`STUB.md`). The **Anchor** column names the DTG Credentials Core Spec object each proof operates over — the full mapping, the two constructions each rides, and the "accredited set → trust registry" reconciliation are in `./CRED-SPEC-COHERENCE.md`.

Runtime **07** is not a Section-4 predicate but a **bridge runtime**: it composes 01's personhood anchor into *how the trust graph forms* — an agentprivacy-harness dream-agent cycle (Mage⊥Swordsman across the Gap) minting VRC edges on personhood + mutual consent. It is where the spec's two ZK constructions (pairwise edge, community-anchored propagation) get an operational edge-admissibility rule.

## Cross-cutting instruments (X-series promotions, 2026-07-17)

Named (non-numbered) dirs = instruments that serve every predicate, promoted from the research root's
X-series design docs (`~/dtgwg-cred-spec-main_mage/explorations/`) via the WORKFLOW promote lane:

| Dir | From | What it is | State |
|---|---|---|---|
| `canonical/` | shared spine | §6.2 context-descriptor + §15.2 canonical-transcript encodings & digests ("a bare nonce is insufficient" as a failing test) | 🟢 11/11 |
| `fixtures/` | X1 | conformance-fixture format: rejection-reason register **v2 (66 exact + 29 families = 95 entries — one vocabulary across all six instruments, every addition triggered live)**, vector schema (accept/reject/**lint**), extraction, consumer harness, §26.1 coverage **11/11 — 0 gaps** | 🟢 13/13 + 40 vectors |
| `context-card/` | X2 | `render(descriptor) → card`: the §6.8 six questions derived from the descriptor itself, legibility conformance checks, expansion-visible diffs, narrow-language enforcement | 🟢 13/13 |
| `show-composition/` | X3 | the atomic show: bundle-profile registry v0 (5 governed bundles), one transcript binding all members, transplant/partial/à-la-carte/taskContext-as-outcome rejections by name, §2.4 joint-disclosure records as data | 🟢 10/10 |
| `quiet-presentation/` | X4 | §19 per-observer leakage budget as data (§2.4 claim form per row), quiet-vs-naive deployments over logical-tick traces, 5 tier checks (schedule independence, uniform error surface, constant shape, on-grid retries), log-field register + prohibited list, structural residue — undetectability unclaimable | 🟢 8/8 |
| `rotation/` | X5 | the two-case split runnable: routine epoch derivation (never touches enrolment; descent check without the master), issuer-blind recovery (structural no-old→new-pair audit), rate-limited recovery-domain nullifier over a governed §6.2 descriptor, reform-vs-continue edge rekey over rt 07 | 🟢 10/10 |
| `erosion-record/` | X6 | the ten-clock sort (closed list, certification/erosion families) + the erosion-aware residual-risk record (`basis:'measured'` structurally banned; rate-not-cliff enforced) + PR-UNQ worked example | 🟢 8/8 |
| `mediator/` | X7 | §21 as mechanism: T0/T1 jobs (T2 honeypot unbuildable), P-ISOLATE/P-FORGET state checks against a frozen audit list, per-context mediator pseudonyms (§6.6), four-exit §21.3 downgrade machine — silent transitions unconstructable, de-listed mediator fails closed *visibly* | 🟢 9/9 |
| `multi-issuer/` | X8 | §12.5 executable: issuer registry with ε + dependency classes, independence collapse (connected components, always weakens the bound), per-show distinctness nullifiers, k-tier vocabulary at build AND verify, statement reports effectiveK never raw k, corrupted-issuer degradation | 🟢 10/10 |
| `guardian-recovery/` | X9 | t-of-n recovery over committed guardian sets: personhood-gated seats (Sybil-self-guardian killed), seat nullifiers per recovery context+epoch, expiring guardianship (§22.2), contest-freeze with issuer state provably untouched, authorization ≠ completion, rt07 trust-graph candidates | 🟢 12/12 |
| `circom-gadget/` | O2 M3 (the shared spine, in circuit form) | **the lab's first real circuit**: Poseidon commitment + depth-20 Merkle inclusion + domain-tagged nullifier over BN254; context input = §6.2 descriptor digest as field; **in-circuit transcript binding added 2026-07-18** (the cross-check's one accidental gap, closed: public `transcriptDigest` + dummy-square, **exactly +1 constraint → 11,523**; proof binds transcript, nullifier binds context — Z9/Z10; signal order offered for TF ratification); groth16 end-to-end with local (lab-only) setup; ~630 ms prove · ~8 ms verify · 725 B proof. npm deps confined to this dir. **+ dual-issuer sibling (X8 k=2): 10,717 constraints = 2× + 1 distinctness; duplicate issuer cannot produce a witness; needs no transcript fix — its nullifiers already bind the show transcript (deliberate asymmetry, documented)** | 🟢 10/10 + 7/7 |
| `witness-seat/` | VWC seat (the 07-16 dream cycle's oldest thread, closed) | the third seat: personhood-anchored witness attests the collision, transcript-bound via canonical §15.2; separation enforced attestation-after-Swordsman (a witness can never mint or unlock an edge); never-sees-the-secret = triple structural guard + lifetime-view scan; rt07 imported untouched, its 11/11 run as an executable regression gate (W7) | 🟢 15/15 |
| `consumer-py/` | X1 M5 (the interop existence proof) | stdlib-only **Python** consumer, zero shared code with the JS: all 39 vectors consumed with matching outcomes + byte-identical reason codes; **29/29 embedded canonical digests re-derived byte-exactly cross-language**; register parsed from reasons.mjs as text, never executed; zero JS↔data divergences. The fixtures carry the decisions, not the JavaScript | 🟢 6/6 |

Seam (closed 2026-07-18, extended at v2): show-composition's seven rejection strings were absorbed
byte-exactly at register v1 (F9); register **v2** then absorbed ALL six instrument builds — 40 new
exact codes + 29 parameterized families, every addition triggered live from its emitting module (F10),
with convergences recorded rather than duplicated (F11: silent-fallback, unknown-enrolment, the shared
clock families). One rejection vocabulary across the whole lab; fixtures also consume context-card's
`diffCards` for the context-expansion vectors — the instruments feed the fixture suite by construction.

## Design stance (inherited from the strawman)

- **Vendor-neutral.** Reference constructions, not a product.
- **User-as-adversary.** The presenter is often the adversary; the proof must be hard for the *presenter* to game, not only a third party. Property tests must include a self-Sybil attack, not just a happy path.
- **No biometric honeypot.** Binding artefacts must not be reversible to a template.
- **Unlinkable** across presentations and across verifiers.
- **Pre-quantum acceptable for v1**, with a documented PQ path.

## Toolchain present on this machine

- Node `v22.20.0`, npm `10.9.3`
- circom `2.2.3` (Semaphore-style circuits available when we move past the reference model)
- Noir/`nargo`: not installed (install later if a predicate wants it)

## Run

Each runtime is self-contained and dependency-free where possible so it runs offline:

```
cd runtimes/01-uniqueness-nullifier && node test.mjs
```

## Map back to the spec

Every runtime's `NOTES.md` records what it demonstrated and what it means for the Section 4 mapping — that feedback is what turns into proposed edits to `proof-of-liveness-requirements.md` (the only thing that goes upstream).
