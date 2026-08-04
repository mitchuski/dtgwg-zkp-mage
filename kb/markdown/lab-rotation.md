---
title: "Lab — rotation"
section: "lab"
source: "../dtgwg-zkp-tf-mage/runtimes/rotation/NOTES.md"
built_from_commitish: "working-tree"
order: 71
---
# Rotation — recovery and rotation without correlators (X5 as a runnable reference)

Implements the X5 exploration
([X5 — Recovery and Rotation](x5-recovery-rotation.md)) at milestones
**M1** (clock table), **M2** (hierarchical epoch derivation), **M3** (recovery-domain
nullifier), **M4** (boundary pair, drafted below as prose), **M5** (edge-rekey over rt 07).
10/10 properties (R1–R10), zero-dep, offline, deterministic (no `Date.now` — explicit
epoch ids, nonces and `now` values throughout).

## The two-case split (never share a mechanism)

| case | mechanism | touches issuer? | touches biometric? |
|---|---|---|---|
| **routine epoch rotation** | holder-side one-way derivation `s_epoch = H('dtg-zkp/epoch-secret/v0', s_master, epoch)` (pools-lineage discipline) | **never** (R1: issuer state byte-identical across 5 rotations) | never |
| **catastrophic recovery** | issuer-blind replacement: revoke (status change) → fresh enrol, guarded by biometric dedup + recovery-domain nullifier | yes | yes (dedup match) |

A profile that routes routine rotation through re-enrolment has built a periodic biometric
correlator into its lifecycle (X5). Here the routine path *cannot* reach the issuer: it is
pure derivation. PR-UNQ (§13.1) survives rotation (R2), epochs are unlinkable without the
master (R3), and descent from the enrolled commitment is checkable without the master ever
crossing the verifier boundary (R4 — the check consumes commitment + epoch + candidate
epoch secret only; the ZK version proves the derivation as a relation).

Recovery stores **no old→new pair**: the issuer state is three flat tables of atoms
(commitments→status, templates→status, timing events), and R5 audits *every* record
structurally for a pairing. Duplication is prevented by the dedup matcher (R7) bounded by
the recovery-domain nullifier (R6) — §13.3's assurance-dependency list made mechanical.
The recovery context is a governed §6.2 descriptor (built via `runtimes/canonical`), never
an opaque label; its `epoch` field is the recovery epoch, so the rate limit (§6.5) is
epoch-scoped and the recovery-domain state is epoch-bounded like any nullifier state
(§22.2).

## M1 — the §22.1 clock table

Families follow the X6 erosion-clocks split: **certification** = a governed validity
period someone grants and can renew; **erosion** = a horizon that decays regardless of
governance. `touchedBy` records which X5 case moves the clock — the load-bearing rows are
in bold.

| clock | family | touched by |
|---|---|---|
| proof-transcript lifetime | certification | neither |
| challenge/session lifetime | certification | neither |
| attestation validity | certification | catastrophic |
| status freshness | certification | catastrophic |
| **nullifier epoch** | certification | **routine** |
| **enrolment-root cryptoperiod** | certification | **catastrophic** |
| recovery-domain retention | certification | catastrophic |
| policy and accreditation validity | certification | neither |
| log retention | certification | neither |
| proof-system security horizon | erosion | neither (migration is §22.3, out of X5 scope) |
| biometric assurance horizon | erosion | catastrophic (recovery re-enters enrolment under the *current* horizon) |

The nullifier epoch and the enrolment-root cryptoperiod rotate on different clocks **by
construction** — routine rotation turns only the first, recovery only the second.
`validateClocks` enforces §22.2: a missing/`permanent`/`unbounded` bound fails
`unbounded-clock:<name>` (R10).

## M4 — boundary pair for "credential replaced" (drafted, prose)

**Assurance record.** What a successful recovery establishes: *a person whose biometric
matched a live template, within an unexhausted recovery epoch of the governed recovery
context, now holds exactly one live enrolment; the previously live commitment is revoked;
the recovery event is reuse-detected within its epoch.* In §13.2-style negative form, it
does **not** establish: that the new commitment belongs to the *same natural person* as
the old one beyond dedup-match strength (the whole continuity claim rides on biometric
match quality and resistance to fraudulent presentation — §13.3); that the old secret was
destroyed rather than merely abandoned (compromise vs loss — the attacker-window question
X5 leaves open); that no recovery happened in *other* recovery epochs; or one-unique-human
globally. Against whom: resistant to issuer and verifier as linkers (no stored pair);
**not** resistant to an adversary who defeats the dedup matcher. For how long: the
recovery nullifier persists one recovery epoch; the revoked status persists per status
policy.

**Disclosure record.** The issuer's view of a recovery is a revocation event and an
enrolment event, close in time. Even with no stored pair, that **revocation→enrolment
timing adjacency is an X4-class observable** (traffic-shape, §20/§19 issuer-as-observer):
an issuer processing one recovery a week trivially reconstructs old→new by timing alone.
Mitigations are X4's, not X5's: batching, coarse timestamps, uniform event handling — the
model keeps `events` records commitment-free to make the *residual* leak (timing only)
explicit. The **guardian/threshold variant** (X5 pattern 3 — correlator moves from issuer
to guardian set, guardian-selection metadata as a social graph) is **deferred**: not
modelled here; needs its own boundary pair and a §22.2 answer for guardian-attestation
epochs.

## Deviation from the design doc (additive, not modify)

X5's M2 says "add `s_epoch = H_domain(s_master, epoch)` **to runtime 01**". Runtime 01 is
a byte-stability dependency of the fixtures lane ([Lab — fixtures](lab-fixtures.md) re-derives its
digests), so the lab rule is **additive**: rt 01 is untouched; the derivation layer lives
here and imports rt 01's `enrol`/`nullifier`/`H`/`ContextRegistry`. Same construction,
different home. One knock-on: rt 01's `enrol(humanId)` is deterministic per human (it
models biometric→secret), so a *replacement* enrolment seeds it with a per-instance value
`H('dtg-zkp/enrol-instance/v0', humanId, nonce)` — modelling issuer-side entropy at
enrolment without changing rt 01.

## M5 — edge re-key over rt 07 (per-edge-type choice, §6.7)

Two honest options, both runnable (`edges.mjs`); a profile MUST pick per edge type and
state it — silent continuity is a silent context expansion (§6.7):

- **`reformEdge`** — the old edge dies with the epoch key; a new encounter forms a fresh
  edge. R8 asserts the old and new edge share *only* the unrotated counterparty's own
  member id — nothing attributable to the rotator bridges the epochs.
- **`continueEdge`** — a bridging value scoped by the edge's shared matching compression
  (derivable only by the two parties — rt 07's `encounter` discipline). The counterparty
  learns `same-enrolment-new-key` as an **explicit disclosure record** held in the pair's
  private edge context (§6.5 intentional in-context linkage). R9 asserts the shared
  graph's outside view carries neither the bridge nor the disclosure, and that the bridge
  is not derivable from public edge values (§6.6). Feeds O9's schema-extension discussion.

## Named failure codes (fixture-register v2 candidates)

| code | source | ref |
|---|---|---|
| `recovery-rate-exceeded` | `recover()` recovery-domain gate | §6.5, §13.4, §22.2 |
| `duplicate-live-enrolment` | `issuerEnrol()` dedup matcher | §13.3, X5 pattern 1 |
| `epoch-descent-mismatch` | `checkDescent()` | X5 M2, §5.10 |
| `unknown-enrolment` | `recover()` on a commitment the issuer never issued | §10.1 status semantics |
| `unbounded-clock:<name>` | `validateClocks()` | §22.2 |

Reused unchanged: `duplicate-human-in-context` (rt 01, byte-exact — R2). Per §13.6,
`duplicate-human-in-context` remains retry-ambiguous and **recovery is one of its named
legitimate causes**: a verifier seeing a repeated nullifier during a recovery window
needs the challenge route, not a permanent exclusion.

## Files

| file | role |
|---|---|
| `rotation.mjs` | routine derivation + descent commitment; issuer-blind recovery + recovery domain; `CLOCKS` + validator |
| `edges.mjs` | M5 — epoch-aware rt 07 nodes, `reformEdge` / `continueEdge`, outside-view check |
| `test.mjs` | R1–R10 (`node test.mjs` → `rotation: 10/10 pass`) |

## Upstream surface (§29)

Direct contribution to §29's open item ("biometric-derived secret rotation … without
creating reusable biometric correlators"): the case split + recovery-domain nullifier turn
the open question into a decidable profile choice with stated trades; fills §13.4's
"recovery or rotation domain" input with concrete semantics and fixture-ready codes; feeds
§13.6 (recovery as a named cause of repeated nullifiers); the M5 analysis is the shared
surface with the Credentials TF (rotation must not break R-DID per-counterparty freshness
— R-DIDs here rotate with the epoch automatically because rt 07 derives them from
`node.secret`).
