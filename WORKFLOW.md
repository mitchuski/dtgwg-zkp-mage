# Workflow — how the two DTG directories work together

*2026-07-17. The two roots are related, not separated: one is the workbench for direct working-group
work, the other is the research root that draws from it and feeds it. This doc is the sorting.*

## The two roles

**`~/dtgwg-zkp-tf-mage` — THE WORKBENCH (Mitch's direct ToIP WG work).**
The upstream clone of `trustoverip/dtgwg-zkp-tf`, maintained by Mitch as co-chair. Everything in it is
TF-deliverable-shaped:

- the **tracked tree** carries only changes Mitch intends to PR (currently: the 2-line README edit);
- the **`runtimes/` lab** (git-excluded) is the evidence bench — reference implementations + property
  tests that back TF positions with runnable behaviour (rt 01 9/9, rt 07 11/11), plus the TF-facing
  registers (CRED-SPEC-COHERENCE, CRED-SPEC-OPPORTUNITIES, STRAWMAN-COHERENCE-EDITS E1–E7);
- its **exit is upstream**: PR / issue to ToIP, by Mitch, never automatic.

**`~/dtgwg-cred-spec-main_mage` — THE RESEARCH ROOT (exploration of the ideas).**
No upstream discipline; iterate freely. It holds the vendored cred-spec (untouched, others' work), the
integration map, the decision-document working draft, and `explorations/` — the ideas built out across
the board. It **draws from** the workbench (cites the runtimes, the coherence map, the register) and
**feeds** two directions: back into the workbench when an idea matures into TF work, and outward into
the agentprivacy corpus.

## The loop

```
                    ToIP upstream (dtgwg-zkp-tf · dtgwg-cred-spec)
                         ▲                        │
                 (3) PR/issue — Mitch only        │ new spec material
                         │                        ▼
              ┌──────────┴───────────┐   vendored into
              │  dtgwg-zkp-tf-mage   │   the research root
              │  WORKBENCH           │
              │  direct WG work      │
              └──────────┬───────────┘
                 ▲       │
     (2) promote │       │ (1) draw from
                 │       ▼
              ┌──────────┴───────────────┐
              │ dtgwg-cred-spec-main_mage │
              │ RESEARCH ROOT             │
              │ explorations of the ideas │
              └──────────┬───────────────┘
                         │ (4) integrate
                         ▼
        agentprivacy corpus (master · spellweb · docs · guide)
```

**(1) Draw from.** Explorations cite the workbench freely — runtimes, coherence map, E-register. The
workbench is the source of *evidence*; the research root is where its meaning is stretched.

**(2) Promote.** An exploration graduates to the workbench when it stops being an idea and becomes TF
work — concretely, when it needs one of the workbench's two lanes:
- **needs runnable evidence** → build the runtime / extend property tests in `runtimes/` (the design doc
  stays in `explorations/` as the source; the lab gets the code and a NOTES pointer back);
- **needs TF review** → the document moves into the workbench as a PR-shaped tracked change at its
  upstream path, and the research-root copy becomes frozen lineage (or a pointer).

**(3) Upstream.** Only from the workbench, only by Mitch, only via PR/issue after TF discussion. The
research root never touches upstream directly — the workbench is the airlock.

**(4) Integrate.** Explorations also project outward into the corpus via `INTEGRATION-MAP.md`
(master /model, skills, spellweb KG, docs canon via the pipeline, guide federation). That lane rides
the existing display/re-sync trains and Mitch's G-M gate — independent of the upstream lane.

## Placement rules (what lives where)

| Artefact class | Home | Why |
|---|---|---|
| Reference implementations, property tests | workbench `runtimes/` | evidence bench; future conformance fixtures |
| Predicate↔anchor registers, E1–E7 candidate edits | workbench `runtimes/` | TF-facing, PR-adjacent |
| PR-shaped spec-text changes | workbench tracked tree | the only thing that leaves the machine |
| Vendored upstream specs | research root (`dtgwg-cred-spec-main/`) | others' work, read-only |
| Exploration/design docs (O-items, VWC seat, …) | research root `explorations/` | free iteration |
| TF deliverable drafts **while being written** | research root | drafting is exploration |
| TF deliverable drafts **once review is requested** | promote → workbench (then upstream path) | it has become direct WG work |
| Corpus integration maps / status | research root | the outward lane's ledger |

## Current dispositions under these rules

- **`predicate-assurance-boundary-decision.md`** — stays here while it iterates (v0.1.0-draft). Its own
  §31 names its upstream home (`docs/implementation-guide/boundaries/…` in the TF repo); when Mitch calls
  it review-ready, it promotes to the workbench as a tracked, PR-shaped addition at that path — the first
  full pass through lane (2)→(3).
- **`explorations/`** — home is correct. Each doc's "build plan" M-items that create code (O2 M2/M3,
  VWC M1/M2, O3 M3, O7 M3) execute in the workbench lab per lane (2); the doc itself stays here.
- **CRED-SPEC-COHERENCE / OPPORTUNITIES / STRAWMAN-COHERENCE-EDITS** — stay in the workbench lab: they
  are TF work product (the register keeps a pointer here; the explorations cite them — lane (1) both ways).
- **Versioning:** the research root is fast-and-loose (no git today; give it its own local git later if
  the lineage starts mattering). The workbench's tracked tree stays clean enough that `git status` always
  answers "what am I about to propose to the TF?"
