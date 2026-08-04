# show-composition — the show is one transcript (X3, M2 + M4)

Runnable reference for **X3 — trust-task composition**
(`dtgwg-cred-spec-main_mage/explorations/X3-trust-task-composition.md`, research root).
Zero-dep Node ESM; imports the shared §15.2/§6.2 encodings from `../canonical/canonical.mjs`.
Run: `node test.mjs` → `show-composition: 10/10 pass`.

## What it demonstrates

A trust task never requests one predicate — it presents a **show**: several PR-*
member proofs bound to ONE canonical transcript (`requestedPredicates` is a
required §15.2 field, so the baseline already makes the show the unit of
freshness — canonical C9 is the same fact at digest level, S7/S8 here at show
level). The model enforces the X3 composition algebra:

- **Atomicity** — a show verifies as a whole or fails as a whole; every member
  must be present and bound to the same transcript digest.
- **Bundle profiles, not à-la-carte** — requests name a governed
  `{bundleId, version}`; any other predicate set is rejected (cipher-suite
  instinct; §18.3 cardinality control lifted to the request layer).
- **The credential/artifact wall** — a `taskContext`-bearing credential may ride
  along, but the verified statement never contains a `taskCompletion` claim and
  a completion query is refused. Outcome evidence is a `threadId`-correlated
  artifact on the Trust Task side of the boundary.
- **Joint disclosure record** (M3 shape, §2.4 three-parameter form, as data):
  `againstWhom` = the §19 observer list; `forHowLong` = longest-lived member
  linkage (PR-UNQ's epoch dominates session); `alongsideWhat` = the member list.

The joint boundary is **wider than the union** of per-predicate boundaries
(intersection narrowing, request-pattern leakage, cross-show correlation) —
that quantitative worksheet is X3 **M1**, design-doc work, not code here.

## Bundle registry v0 (`bundles.mjs`)

| id | version | profile | predicates |
|---|---|---|---|
| MLP-BASE | 1 | mlp | PR-LIV, PR-ISS, PR-HLD, PR-FRE |
| MLP-BASE+DEL | 1 | mlp | MLP-BASE + PR-DEL |
| EPP-UNIQ | 1 | epp | MLP-BASE + PR-PER, PR-UNQ |
| EPP-UNIQ+DEL | 1 | epp | EPP-UNIQ + PR-DEL |
| EPP-RANGE | 1 | epp | EPP-UNIQ + PR-RNG |

+DEL variants carry §7.3 delegation as separate evidence (transcript gains the
optional `delegationRef` field); PR-DEL is never inferred from PR-HLD.

## Named rejection reasons (the seam to the X1 fixture reason register)

| reason | meaning |
|---|---|
| `bundle-outside-registry` | unknown id/version, à-la-carte set, surplus members |
| `partial-show-rejected` | atomicity: a member proof missing |
| `member-transcript-mismatch` | member bound to a different transcript (transplant/replay, §15.1/§26.1) |
| `stale-transcript` | expiry vs an explicitly supplied `now` (no `Date.now()` anywhere) |
| `transcript-invalid` | malformed transcript or tampered digest |
| `taskcontext-not-outcome-evidence` | completion asked of a show — category error |
| `bundle-profile-mismatch` | (makeShow) bundle profile vs descriptor profile disagree |

These strings are intended verbatim as X1 fixture expected-reasons.

## Upstream surface

§27.2 joint session with the Trust Task workstream: they own request semantics
and outcome artifacts; we own transcript binding and the disclosure calculus.
The bundle registry is the shared object (M2 draft here; authority question —
context authority §6.7 vs Trust-Task-owned — is open in X3).
