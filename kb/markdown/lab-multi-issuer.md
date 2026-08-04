---
title: "Lab — multi-issuer"
section: "lab"
source: "../dtgwg-zkp-tf-mage/runtimes/multi-issuer/NOTES.md"
built_from_commitish: "working-tree"
order: 69
---
# multi-issuer — X8 M3 reference model

Runnable reference for **X8 — multi-issuer confidence aggregation**
([X8 — Multi-Issuer Aggregation](x8-multi-issuer-aggregation.md)):
§12.5's non-normative aggregation mechanism made mechanical, with its four
assumptions enforced structurally rather than assumed. Zero-dep Node ESM,
offline, deterministic (`now` is always an explicit argument; no `Date.now`).

Run: `node test.mjs` → 10 properties (A1–A10), exit 1 on failure.

## What it demonstrates — §12.5 made mechanical

The §12.5 claim: k honest, **independent** issuers attesting the same
proposition bound residual mis-issuance by **∏ ε_i**; a corrupted issuer
degrades only its own factor. The model enforces X8's A1–A4 in code:

- **A1 (one-sided ε)** — `registry.mjs` carries ε as the mis-issuance bound
  only; nothing else is derived from it.
- **A2 (independence)** — never assumed: the **independence register**
  (dependency classes per issuer) is consulted on every bound. Issuers
  transitively sharing any class collapse into one group; a group's ε is the
  **max** ε in the group (the shared-dependency bound), so collapsing always
  *weakens* the bound — tested as the honesty property (A2: collapsed bound >
  naive product).
- **A3 (distinctness)** — per-issuer, per-show nullifiers
  `H('dtg-zkp/issuer-show-nullifier/v0', issuerId, transcriptDigest)`: k
  distinct nullifiers prove k distinct issuers while naming none (§5.12
  scoped-reuse at the issuer level); a duplicate issuer is a nullifier
  collision (A3), and transcript scoping prevents cross-show issuer
  correlation (A7).
- **A4 (same proposition)** — one subject commitment and one predicate across
  all members, else rejection (A10); different predicates are composition
  (X3), not aggregation.

The verified statement reports **{effectiveK, bound, root}** — the collapsed
number of independence classes, **never raw k as confidence** — and contains
no issuer identifiers (A8 scans it structurally; §12.3 concealment mode 4).
k itself is confined to the governed tier vocabulary `K_TIERS = [1, 2, 3]`
because k is a disclosure (§10.4/§18.4: a rare k fingerprints the verifier
and narrows the holder population); k outside the tiers is a §26.1-style
rejection. The §12.5 degradation clause is executable: `aggregateBound(...,
{corrupted: [j]})` replaces ε_j with 1 and the bound remains the product of
the others (A9).

## M2 registry data model — as implemented shapes

`makeIssuerRegistry({epoch, effectiveTime, issuers})` → frozen snapshot with
`root = H('dtg-zkp/issuer-registry/v0', canonicalize({epoch, effectiveTime,
members}))`, so naming the root names the whole register contents — ε values
and dependency classes included — and the aggregation claim is evaluable at a
named time (§12.4). Per-issuer member shape (the §27.3 registry-profile
fields, drafted here as code):

```
{
  id:                   'iss:alpha',
  epsilon:              0.01,                    // 0 < ε < 1, one-sided; set by the
                                                // accreditation authority from audit
                                                // evidence, never self-asserted (§18.2)
  epsilonEffectiveTime: '2026-07-01T00:00:00Z', // when the audit established ε
  epsilonHorizon:       '2027-01-01T00:00:00Z', // X6 certification clock: past this,
                                                // ε is stale and supports no bound
  dependencyClasses:    ['pipeline:alpha', 'vendor:acme', 'jurisdiction:AA', ...]
}
```

`effectiveK(issuerIds, snapshot)` → `{effectiveK, groups}` (connected
components over shared classes). `aggregateBound(issuerIds, snapshot, now,
{corrupted})` → `{bound, effectiveK, groups, staleMembers}`.

## Named failure codes (fixture-register candidates → X1)

| code | property | meaning |
| --- | --- | --- |
| `duplicate-issuer-in-show` | A3 | nullifier collision — same issuer twice |
| `mixed-registry-roots` | A4 | members proved against different named roots (§12.4/§26.1) |
| `k-outside-tier` | A5 | k not in the governed tier vocabulary {1,2,3} |
| `stale-epsilon:<issuerId>` | A6 | member ε past its assurance horizon at `now` |
| `issuer-not-in-registry` | — | member's issuer outside the snapshot |
| `subject-commitment-mismatch` | A10 | members bind different subjects (A4-same-proposition) |
| `invalid-membership-proof` · `k-member-mismatch` · `nullifier-mismatch` · `predicate-mismatch` | — | supporting structural rejections |

## Honest limits

- **This models the accounting, not the ZK.** Members carry `issuerId` as a
  modelled private witness that the verifier function (playing the circuit)
  sees; the real build is k instances of the Poseidon-Merkle membership
  gadget (O2/O4) against one root plus in-circuit nullifier derivation.
  **Concealed k-of-n membership and threshold hiding (k-of-m held, k shown)
  are the circuit's future work.**
- **ε values are governance inputs, never measured here.** Who audits ε, and
  whether two accreditation frameworks' ε values are comparable at all,
  stays an X8 open question.
- The register itself is asserted governance data: a shared dependency
  nobody declared still correlates failures — the register makes A2
  *checkable*, not *true*.
- Aggregation is worth it where issuers make independent determinations
  (PR-PER); countersigning one determination leaves effective k = 1 (PR-LIV).

## Pointers

- Design doc: [X8 — Multi-Issuer Aggregation](x8-multi-issuer-aggregation.md)
  (M1 boundary record, M2 registry-profile note, M4 decision memo remain
  design-doc work; this runtime is M3).
- Decision doc: [Decision — Overview](decision-overview.md) §12 (esp. 12.4,
  12.5), §2.4, §10.4/§18.4, §26.1.
- Shared spine: `../canonical/canonical.mjs` (transcripts/descriptors),
  `../01-uniqueness-nullifier/src/nullifier.mjs` (H, enrolment commitment).

## Upstream surface

Decision input for the §12.5 open issue, answered as options priced by this
model's trade curve (M4): **not-required** / **MAY per profile** / **SHOULD
for EPP PR-PER**; plus the registry-field proposal (ε + dependency classes +
horizons) to the Credentials TF along the §27.3 boundary — they own the
register's institutional legitimacy; we own the statement, the bound, and
these fixtures.
