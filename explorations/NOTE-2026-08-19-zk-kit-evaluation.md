# NOTE — zk-kit as TF tooling: the audit badge and the artefact it does not cover

- **Date:** 2026-08-19
- **Status:** draft note for TF framing — local, unpushed; circulation = Mitch
- **Question asked:** does recommending **zk-kit** as tooling make sense for the DTG WG / ZKP TF?
- **Verdict:** cite it, lint with it, track its Noir line. **Do not put it in the circuit's include path on this evidence.**
- **Ladder:** research note (second cross-check in the series; the first was `SEMAPHORE-V4-CROSSCHECK.md`, O2 M5)
- **Our construction (ground truth):** `~/dtgwg-zkp-tf-mage/runtimes/circom-gadget/circuits/nullifier_membership.circom`
- **Sources (verified, primary):** audited commit `215dfb30ba548918181419df5598d0a652901b7c`; Semaphore PSE audit PDF (13 pp, March 2024); npm registry metadata; GitHub API; circomlib `mux1.circom`. Full list at the end.
- **Excluded by register discipline:** no claim here about whether Semaphore is or was exploitable. This note compares *templates and provenance*, not deployments.

---

## 0. Naming collision — resolve this before the conversation starts

Two different projects sit one hyphen apart, and only one of them is what the TF wants.

| | **zkit** (`dl-solarity`) | **zk-kit** |
|---|---|---|
| What | Hardhat plugin — a build tool wrapping circom + snarkjs | Monorepo of reusable circuits/libraries — primitives |
| Org | Distributed Lab (single vendor, 2 core contributors) | Own `zk-kit` GitHub org (created 2025-03-21, 9 repos); ex-`privacy-scaling-explorations`, old paths 301 |
| Languages | Circom only | Circom **+ Noir + Rust + Solidity**, parallel repos |
| Last push | 2026-05-18 | zk-kit 2026-07-21 · `.circom` 2026-07-20 · **`.noir` 2026-08-08** |
| Adoption (npm, 30 d) | `hardhat-zkit` **629** | `@zk-kit/utils` **127,575** · `lean-imt` 28,078 · `eddsa-poseidon` 30,780 |
| Host framework | peer dep `hardhat ^2.16.0`; Hardhat is now **3.13.0** and npm tags 2.x as legacy `hh2` | n/a — no framework binding |
| Licence | MIT | MIT |

If "zkit" is said on a call, **ask which**. The evaluation below is of **zk-kit**.

The `dl-solarity` tool is separately declined, for one reason that bears directly on our evidence gate: it resolves the circom compiler per-platform — iden3 official on amd64, but **`distributed-lab` vendor forks on arm and on wasm**. Entry 0006 (Affinidi, darwin/arm64) carried §16.1 on cross-architecture digest identity. Adopting that tool would silently make the maintainer and the arm64 volunteer compile with *different compiler builds*, converting a verified result into an unverified one.

## 1. What zk-kit is

Seven Circom packages (`binary-merkle-root`, `ecdh`, `lazytower`, `lean-imt-plus`, `poseidon-cipher`, `poseidon-proof`, `utils`), with parallel Noir, Rust and Solidity monorepos. MIT. Their own repo table marks **exactly one** package audited: `binary-merkle-root.circom`.

That is also the one that would touch our gadget, since the Merkle leg is the portable part — O4 registry membership, the X8 multi-issuer seat, and the X9 guardian set are the same `MerkleInclusion` template with different set semantics.

So the naive move is obvious: replace our thrice-duplicated hand-rolled template with the audited external one, and buy third-party review for the open half of the §16.1 gate.

**That move does not survive checking.**

## 2. Finding 1 — the audit does not cover the artefact npm installs

The badge cites the Semaphore 4.0.0 PSE audit (retrieved, 13 pages). Its scope section names the artefact exactly:

```
Zk-kit
Github repo: .../zk-kit/tree/imt.sol-v2.0.0-beta.8
Commit Hash: 215dfb30ba548918181419df5598d0a652901b7c
Files: InternalLeanIMT.sol, binary-merkle-root.circom, and related Typescript files.
```

Audit date: **March 2024**, by Mridul, Yufei Li, Kyle Charbonnet, published under PSE's own name.

Publication history for `@zk-kit/binary-merkle-root.circom`:

| version | published | status |
|---|---|---|
| 1.0.0 | 2024-05-13 | closest published version to the audited commit |
| **2.0.0** | **2025-06-30** | **`latest` — 15 months after the audit** |

The 1.0.0 → 2.0.0 diff is not cosmetic. It changes the security-critical input:

```diff
-    signal input leaf, depth, indices[MAX_DEPTH], siblings[MAX_DEPTH];
+    signal input leaf, depth, index, siblings[MAX_DEPTH];
+    signal indices[MAX_DEPTH] <== Num2Bits(MAX_DEPTH)(index);
```

I fetched the file **at the audited commit** to establish which side of that diff was reviewed:

```
215dfb3 : signal input leaf, depth, indices[MAX_DEPTH], siblings[MAX_DEPTH];
          var childNodes[2] = MultiMux1(2)(c, indices[i]);
```

The audited artefact is the **caller-supplied `indices[]`** interface. And from circomlib source, `MultiMux1` is:

```circom
out[i] <== (c[i][1] - c[i][0])*s + c[i][0];   // no booleanity constraint on s
```

A selector outside {0,1} yields an arbitrary affine blend of the two children rather than a choice between them. In the audited version the template does not constrain that; the obligation sits with the calling circuit. In the shipped version `Num2Bits` removes the freedom by construction.

**Said plainly: the safer version is the unaudited one, and the audited version is an interface that neither npm nor Semaphore ships any more** — our own `SEMAPHORE-V4-CROSSCHECK` recorded Semaphore `main` passing a singular `merkleProofIndex`, i.e. the post-audit v2 interface. The badge is attached to a commit, and the commit has moved on underneath it.

This is the §16.1 concern arriving from upstream: an assurance claim whose scope is narrower than its presentation.

## 3. Finding 2 — the dynamic-depth behaviour is an audit finding, closed by comment

Current source carries:

```
// NOTE: This circuit will successfully verify `out = 0` for `depth > MAX_DEPTH`.
// Make sure to enforce `depth <= MAX_DEPTH` outside the circuit.
```

That comment *is* the audit's disposition. Informational finding 2, quoted in full:

> **2. binary-merkle-root verifies zero root for depth > MAX_DEPTH**
> Context: binary-merkle-root.circom#L40-L42
> Description: For depth > MAX_DEPTH, root and isDepth below is calculated as 0. Thus, out = 0 will be always be verified successfully.
> **Recommendation: Add a warning in comments for integrators.**
> Implemented fix: PR 211.

The behaviour was not changed; the obligation was **transferred to integrators**. For us that is not a footnote — if this template enters our include path, that transferred obligation becomes a normative MUST in the spec, plus a conformance object and a negative fixture. Under drafting rule 3 it is exactly the kind of thing that has to be written into the negative space rather than inherited silently.

Our template has no such obligation because it is fixed-depth: `depth` is a compile-time parameter, not a signal.

## 4. Finding 3 — our template is stricter than the audited one on the axis that matters

`nullifier_membership.circom`, in the loop:

```circom
// path index must be a bit
pathIndices[i] * (1 - pathIndices[i]) === 0;
```

We constrain booleanity explicitly, in-template. On this axis our unaudited hand-rolled template is **stricter than the audited zk-kit v1.0.0**, and equivalent in effect to the unaudited v2.0.0.

This inverts the instinct that motivated the question. The swap would not trade unreviewed code for reviewed code. It would trade a stricter template carrying no external obligations for a looser one whose review covers a different interface and whose current interface ships an audit-acknowledged integrator obligation.

## 5. Side-by-side

| Dimension | zk-kit `BinaryMerkleRoot` (2.0.0) | DTG `MerkleInclusion(20)` | Match? |
|---|---|---|---|
| Depth | **Dynamic** — `depth` is a signal input, `MAX_DEPTH` a parameter | **Fixed** — depth 20 is a parameter only | ✗ |
| Out-of-range depth | `out = 0` verifies; enforcement pushed outside the circuit (audit informational 2) | Not expressible | ✗ (ours has no such surface) |
| Path index | v2: single `index` decomposed via `Num2Bits` (booleanity by construction) · **v1 (audited): caller-supplied `indices[]`, unconstrained in-template** | `pathIndices[]` with explicit `idx*(1-idx)===0` | ✗ v1 · ≈ v2 |
| Tree shape | LeanIMT-oriented — single-child nodes promoted unhashed, no zero padding | Zero-padded fixed depth, `zeros[i+1] = Poseidon(zeros[i], zeros[i])` | ✗ |
| Output | Returns computed root as an output signal | Returns root; equality to the public root asserted by the caller | ≈ |
| Node hash | Poseidon(2), circomlib | Poseidon(2), circomlib | ✓ |
| Audit | Named audit, **scoped to commit `215dfb3` (March 2024)**, not to `latest` | None | n/a |
| Licence of the include chain | MIT template, but `include "poseidon.circom"` → circomlib | same circomlib dependency | ✓ (both — see §7) |

## 6. Costs of a swap

**6.1 Constraint budget — possibly decisive.** zk-kit's dynamic depth costs a per-level `IsEqual` and `MultiMux1`, plus one `Num2Bits`, none of which we pay today. Estimate **~110 extra constraints per Merkle leg** at depth 20, so **~330 for the three-leg guardian circuit**. Guardian currently has **306 constraints of headroom** under the 2^14 ptau cap (16,078 of 16,384).

> **Conjecture, ~65%:** the swap pushes the guardian circuit past 2^14 and forces a pot15. It is marginal enough to fall either way. **One compile settles it (~30 min); this is the single outstanding measurement in this note.**

**6.2 Every published root moves.** A different tree construction gives different roots for the same leaf set, so every enrolment root and every manifest digest changes. Bounded, though: because the root is **not** in the nullifier preimage (§13.4, recorded "out for now"), **nullifiers survive a tree swap unchanged**.

**6.3 Sequencing consequence — worth carrying into the decision doc regardless of the swap.** 6.2 holds only while root-id stays out of the preimage. If §13.4 resolves toward putting root-id *in*, a tree-construction change becomes **nullifier-breaking**. Therefore any tree swap must land **before** that decision, not after. This is a real ordering constraint between two open items currently being treated as independent.

## 7. IPR flag — pre-existing, not caused by zk-kit, but unresolved

`circomlib` declares **`GPL-3.0`** in its npm metadata and in its per-file headers, while its repository `LICENSE` file is the **GNU Lesser General Public License v3**. Those are materially different answers for a deliverable whose source-code terms are Apache-2.0 under the DTGWG JDF charter.

This is already true of our gadget today — we depend on circomlib for Poseidon. zk-kit does not fix it: their MIT covers their own lines, while their templates `include "poseidon.circom"` from the same source. Flagged here because a tooling discussion is the natural moment to raise it, and because a WG-level *recommendation* would propagate the ambiguity further than a lab dependency does.

## 8. What to take from zk-kit instead

**8.1 Adopt Circomspect into the acceptance flow.** zk-kit lints with Circomspect (Trail of Bits) in CI. `cargo install circomspect`; it is a named third-party static-analysis step and it adds a gate to A–G at essentially no cost. **Highest value per unit effort in this note**, and it speaks to the half of §16.1 that reproduction cannot close.

**8.2 Run this as the second cross-check, and publish the divergence register.** The method already paid for itself once — Semaphore v4 divergence 7 produced the transcript binding at exactly +1 constraint. This note is the raw material for the zk-kit equivalent: four divergences (audit scope, dynamic depth, selector constraint, tree shape) plus one ordering constraint. The output is a register, not a dependency.

**8.3 Cite `zk-kit.noir` in the substrate gate.** The Noir monorepo carries `binary-merkle-root`, `lean-imt-plus`, `merkle-trees`, `ecdh`, `lazytower` — the same primitives in a second substrate, and it is the most recently active repo in the family (2026-08-08). That is a **worked example** of the "declare substrate + migration story" requirement added to the construction-selection gate on 2026-08-18, and it pairs with the EF-pivot note: an artefact rather than an aspiration, and live support for LIV-ALG-07's agility-mandatory language.

**8.4 Keep the audit-scope discipline as a spec object.** "Audited" is a claim with a **version, a commit, and a file list**. This is a clean case where the badge outruns all three. Proposed language for the evidence gate:

> An assurance claim carried by an external artefact MUST name the reviewed commit and the reviewed file set, and MUST state whether the artefact in use is that artefact.

We would have caught this at the gate. Most integrators will not.

## 9. What this note does not establish

- **Not** that zk-kit is unsound, or that Semaphore is or was exploitable. The v1 selector observation is about *where the constraint lives*, not about any deployment. Semaphore's calling circuit and TypeScript layer were not examined.
- **Not** that our template is correct — only that it is stricter on one named axis. It remains unaudited, and that is still the open half of §16.1.
- **Not** a verdict on zk-kit's JS libraries (`@zk-kit/utils`, `lean-imt`, `eddsa-poseidon`), which are widely used and were not evaluated. The scope of this note is the Circom include path.
- **Not** a constraint measurement. §6.1 is an estimate at stated confidence.

## 10. Honesty notes / unconfirmed

- The audit PDF was read for scope and for informational finding 2. Its methodology section, limitations/disclaimer text, and the other 16 findings were **not** read in full.
- Whether the three named reviewers are PSE staff or external was **not** established; the document is titled a PSE audit and published on a PSE domain. Whether that satisfies "independently verified" under §16.1 is a judgement for the group, not an assumption for this note.
- The ~110-constraints-per-leg estimate is derived from template structure, not measured.
- The LeanIMT tree-shape divergence is carried forward from `SEMAPHORE-V4-CROSSCHECK` (verified there); not re-verified here.
- npm metadata for the package still points `repository` at the retired `privacy-scaling-explorations` org. Cosmetic, but noted since provenance is the subject.

## One-line summary for a working call

zk-kit is worth citing, linting with, and tracking into Noir — but its one audited Circom template is audited at a March 2024 commit whose interface neither npm nor Semaphore ships today, its current interface carries an audit-acknowledged obligation to enforce depth bounds outside the circuit, and on the constrained-selector axis our own template is already stricter; so the recommendation is **pins and checks, not dependencies**.

## Disposition

- Local note only; nothing posted, nothing pushed.
- **Outstanding measurement (Mitch's call to run or skip):** compile the guardian circuit against zk-kit's template and settle §6.1 with a number rather than a 65%.
- Upstream candidates (Mitch's call): the Circomspect gate proposal (8.1) and the audit-scope language (8.4) are both small, self-contained, and land on live threads — #12, or the §16.1 evidence-format ask carried on 2026-08-18.
- Lab follow-ups if picked up: divergence register per 8.2; §13.4 ordering constraint per 6.3 into the decision doc; circomlib licence ambiguity raised at WG level per §7.

## Sources

**Ours (local):**
- `C:\Users\mitch\dtgwg-zkp-tf-mage\runtimes\circom-gadget\circuits\nullifier_membership.circom`
- `C:\Users\mitch\dtgwg-zkp-tf-mage\runtimes\circom-gadget\NOTES.md` (measurements; §13.4 table; 306-constraint guardian headroom)
- `C:\Users\mitch\dtgwg-cred-spec-main_mage\explorations\SEMAPHORE-V4-CROSSCHECK.md` (LeanIMT shape; Semaphore `merkleProofIndex` interface)
- `C:\Users\mitch\dtgwg-cred-spec-main_mage\explorations\NOTE-2026-08-18-ef-substrate-pivot.md` (substrate axis)

**zk-kit (primary):**
- Current template: https://github.com/zk-kit/zk-kit.circom/blob/main/packages/binary-merkle-root/src/binary-merkle-root.circom
- **Audited commit** `215dfb30ba548918181419df5598d0a652901b7c` (tag `imt.sol-v2.0.0-beta.8`): https://github.com/zk-kit/zk-kit/blob/215dfb30ba548918181419df5598d0a652901b7c/packages/circuits/circom/binary-merkle-root.circom
- Audit PDF (13 pp, March 2024; Mridul, Yufei Li, Kyle Charbonnet; scope + informational finding 2): https://semaphore.pse.dev/Semaphore_4.0.0_Audit.pdf
- Package versions/dates: npm registry `@zk-kit/binary-merkle-root.circom` — 1.0.0 (2024-05-13), 2.0.0 (2025-06-30)
- Noir monorepo (packages list; pushed 2026-08-08): https://github.com/zk-kit/zk-kit.noir
- Circomspect (Trail of Bits): https://github.com/trailofbits/circomspect

**circomlib (primary):**
- `MultiMux1` (no booleanity constraint on the selector): https://github.com/iden3/circomlib/blob/master/circuits/mux1.circom
- Licence inconsistency: npm metadata `GPL-3.0` vs repository `LICENSE` = LGPL-3.0 — https://github.com/iden3/circomlib/blob/master/LICENSE

**dl-solarity zkit (for the naming collision only):**
- https://github.com/dl-solarity/hardhat-zkit — compiler resolution constants (`COMPILER_AMD_REPOSITORY_URL` = iden3; `COMPILER_ARM_` / `COMPILER_WASM_REPOSITORY_URL` = distributed-lab forks) read from the published package `dist/src/constants.js` @ 0.5.18
