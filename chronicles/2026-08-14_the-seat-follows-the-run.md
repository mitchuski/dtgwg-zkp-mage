# 2026-08-14 · The Seat Follows the Run

> **Provenance.** A chronicle — the narrative working record kept alongside the lab, reflected
> into this repo so collaborators can follow the arc with the runtime traces beside it. Voice:
> framework (master series). The maintainer’s master copy is the source of truth; this copy is
> adapted only in this header and in paths (home-directory references translated to repo-relative
> where the artefact lives here). Signed by the First Person: yes.
>
> **Runtime traces:**
> - issues [#1](https://github.com/mitchuski/dtgwg-zkp-mage/issues/1) (Chair ratification → agreed) + [#2](https://github.com/mitchuski/dtgwg-zkp-mage/issues/2) (the external run)
> - registry entry `0006-gg-affinidi` — first external row, live on the registry
> - `registry/ACCEPTANCE-FLOW.md` — the described agent process + the G.1 publication rite, both minted this day

*Three days after the registry learned to speak, someone answered. The first fully external
verification run arrived as an issue from a machine the lab had never touched — and it arrived
before its author had a seat, with a question attached: what is a seat-id, and how do I configure
it? The gate had worked exactly as built, and the day's work was teaching it to say so.*

**Scope:** issue [#2](https://github.com/mitchuski/dtgwg-zkp-mage/issues/2) (Glenn Gore, Affinidi
— seat `gg-affinidi`, position **ratify**, darwin/arm64 · Apple M5 Max · Node v26.7.0), registry
entry **0006-gg-affinidi** (ACCEPT, 12 advisory notes), the seat admission across all three
`seats.json` copies, the posted reply with its process note, the described acceptance flow
(`registry/ACCEPTANCE-FLOW.md`), and issue
[#1](https://github.com/mitchuski/dtgwg-zkp-mage/issues/1) — the Chair's on-record ratification
of the Lane 3 gate and the entropy rule, filed the day before, answered **agreed** today. Sixth
in the arc: dream-cycle (07-16) → first-circuit (07-18) → thread-returns (07-28) →
registry-opens (08-11) → both-faces (08-12) → this.

---

## 1. The visitor arrives with proof

The submission was complete before the conversation began: all three suites green on hardware the
lab has never run — 10/10 · 7/7 · 8/8 on Apple silicon, the registry's first non-Windows, first
arm64 row. The required digests — r1cs, wasm, constraint counts, the artifacts that are
deterministic *by construction* — came back byte-identical to a manifest minted on win32/x64.
That is a datum no amount of same-machine rebuilding could produce: the determinism claim that
survived the 08-11 refutation has now held **across operating system and processor architecture**.
The setup chain diverged in all twelve places, each divergence named and advisory, exactly as the
acceptance model predicts for any machine that is not the maintainer's.

## 2. The gate answers

The visitor's question — *putting values in doesn't seem to work* — was the fail-closed seat check
doing its job without explaining itself. `seat-not-admitted:<id>` is a correct answer but not a
welcoming one. The real answer, now said out loud on the issue: the seat is governance data, not
cryptography; it carries no ceremony-security claim; the evidence is the digests and the green
suites, and the seat only records *who the task force is accepting this from*. The template
already treated a self-chosen id as a seat request — the visitor had, sensibly, self-attested a
local seat to make the orchestrator print, then filed with the id he wanted. Admission followed:
`gg-affinidi` added to the admission list, the run accepted, the row filed.

The inversion this chronicle names: **the seat follows the run**. The designed sequence was
admission, then evidence; the first external participant arrived evidence-first, and the system
turned out not to care — because the seat was never load-bearing for the claim. A gate that
carries no security weight can afford to be granted retroactively. The gates that do carry weight
(acceptance, publication) never moved.

## 3. The agent operates the lane

This was also the first acceptance not performed by hand. The maintainer's agent reconstructed the
three report files from the issue's pinned sections, re-derived the verdict read-only before
filing anything (`verify-run: ACCEPT`, 12 advisory), filed `0006-gg-affinidi` with an explicit id
(the 0004 collision lesson, now habit), rebuilt the site, staged the seat in all three copies, and
posted the reply — with a process note declaring the agent's hand, because a registry built on
disclosure boundaries should disclose its own operators. The disclosure sits in the record twice:
in the comment's process note, and in the submission's `role` field ("reports reconstructed from
the issue's pinned sections by the maintainer's agent, verdict re-derived locally").

The witness discipline ladder gains a fourth rung: attest, never mint (the seat); orchestrate,
never be the entropy (the ceremony); say only what the tests hold (the telling); and now
**operate, never decide** — the agent runs every mechanical step of the lane, and the two acts
that constitute judgment (admitting a seat, publishing the table) remain human. The flow is
written down as `registry/ACCEPTANCE-FLOW.md` so the division is inspectable, not implicit.

## 4. What the table teaches now

The diptych became a triptych. Pinned-workbench (0005: zero advisory — the manifest's own
artifacts), cold clone (0003: twelve advisory — same OS, fresh randomness), and now external
(0006: twelve advisory — different OS, different silicon, same required digests). Three rows,
three provenances, one acceptance model, and the middle column of every row agreeing on what a
circuit *is*. The registry's argument for itself is complete in its own data: nothing matches
that shouldn't, nothing diverges that mustn't, and every divergence has a name.

## 5. The chair puts it on the record

The day before the visitor arrived, the Chair filed issue #1 — position **ratify** — naming the
two disciplines he wanted affirmed rather than nodded at: the **Lane 3 gate** (the per-circuit
production ceremony held shut *in code*, `phase2-gate-closed` asserted unconstructable, until
construction selection closes — because a ceremony run early would consecrate the benchmarking
vehicle as the product) and the **entropy rule** (agents orchestrate entropy, never are it; an
agent's context window is a §19 observer). His phrase for the first is worth keeping: *"keep
volume from becoming authority," enforced by the system itself.* He will point to it as the
reference pattern when a workstream gets ahead of a decision.

The co-chair's **agreed** went on the record today — with the observation that the ratification
acquired data within a day of filing: the discipline it affirms processed its first stranger
unchanged. And his offer landed in exactly the right seam: Realeyes shaping *where live human
input actually comes from* when Lane 2 opens. That is the same question the publication rite
opened this morning from the other end — proverb served, activation spoken, understanding bound
to the act. The chair-side offer and the maintainer-side rite are two approaches to one future
requirement: maintainer liveness.

## Why this is interesting

- **The first stranger validated the design by misusing it correctly.** Self-attesting a local
  seat to get the orchestrator to print was not a bypass — it was the admission-request path
  working before it was documented. When a user's workaround is the intended flow, the gate is
  placed right and labelled wrong; the fix is prose, not code.
- **Cross-architecture determinism is now evidence, not assumption.** "By construction" was an
  argument; win32/x64 and darwin/arm64 producing byte-identical r1cs and wasm is a measurement.
- **Agent operation with human judgment is a disclosure discipline, not a convenience.** The lane
  runs faster, but the reason it is *sound* is that the two decision points stayed human and the
  agent's role is declared in the artifacts it touches — the §19 observer analysis applied to the
  registry's own back office.
- **Retroactive admission is only safe because the seat is honest about its weight.** A seat that
  claimed security could never follow the run. Narrow claims, again, buying flexibility that
  strong claims cannot afford.

*Signed by the First Person, 2026-08-14 — and the signing minted a rite: from this push
forward, the agent serves a proverb before anything goes public, and the maintainer's spoken
activation is the proof of understanding that opens the gate. Presence, not credentials — the
first thread from this lane toward the maintainer-liveness question (PR-LIV) the ceremonies
will eventually have to answer.*
