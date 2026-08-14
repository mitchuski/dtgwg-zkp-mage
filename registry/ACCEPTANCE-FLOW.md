# Acceptance flow — lane-1 submission review, described as an agent process

*How a filed verification run becomes a registry row. Written so the maintainer can hand the
mechanical steps to an agent and the process stays inspectable: every step names its evidence,
every refusal has a register-string code, and the two acts that constitute judgment — admitting
a seat, publishing the table — are marked **HUMAN** and never delegated.*

**Posture (autoresearch):** the agent operates, the maintainer decides. No claim enters the
registry that was not re-derived locally from the submission's own pinned sections; no verdict
is taken on the submitter's word — including their own `--- verdict: ACCEPT ---` line, which is
treated as a prediction to check, not a result to record. Agent involvement is disclosed in the
issue reply (a process note) and in the submission record's `role` field.

## Roles

| role | holds | never does |
|---|---|---|
| **submitter** | their own build, their suites, a self-chosen seat id if unadmitted | — |
| **agent operator** | reconstruction, re-derivation, filing, site rebuild, the reply | admit seats, push, edit the manifest, mint submission ids implicitly |
| **maintainer (HUMAN)** | seat admission, publication (push), revocation | — |

## The gates

### A · Intake
Enumerate open issues labelled `verification-run` (public read, no auth). One issue = one
candidate submission. An issue with no pasted pinned sections is answered, not processed
(ask for the orchestrator's printed submission; nothing can be re-derived from prose).

### B · Seat triage
Look the seat id up in `registry/data/seats.json` (the acceptance-side authority — the
orchestrator's copy under `runtimes/ceremony-orchestrator/` is the volunteer-side mirror).

- **present + active** → proceed to D.
- **absent** → the filing *is* the seat request (the issue template's seat field is optional by
  design; a self-chosen id is the intended request path). Go to C.
- **revoked** → reply naming `seat-revoked:<id>`; do not process. Revocation is visible, not
  silent (X10 C4).

Note the honest edge: a submitter can self-attest a seat *locally* to make `orchestrate.mjs`
print — that is harmless and expected, because the seat check that bites is this one, at
acceptance. The seat carries **no ceremony-security claim** (decision doc §7.3); it answers
"who is the task force accepting this from," nothing else. That is precisely why it can be
granted after the run: retroactive admission is only safe because the seat is honest about its
weight.

### C · Admission — **HUMAN**
The maintainer assents to the new seat (or declines). On assent the agent stages the row
(`{id, name, affiliation, status: "active"}` — pseudonymous is precedent, see `seat-7f`) in
**both** repo copies (`registry/data/` and `runtimes/ceremony-orchestrator/`), plus any
workbench mirror. Admission is an ordinary-process governance act; it travels in the same
commit as the acceptance it enables, so the public history shows seat and row arriving
together.

### D · Evidence reconstruction
From the issue's `<details>` pinned-sections block, rebuild one `report.<circuit>.json` per
circuit in a scratch `build/` dir: `{ pinned: <section verbatim>, informative: { tools,
platform, date } }` with informative fields taken from the submission header. Refuse by name:

- pinned sections absent or unparseable → reply asking for the orchestrator output
  (nothing to re-derive);
- absolute local paths in the body → `submission-contains-local-path` (the orchestrator strips
  these by construction, so their presence means a hand-built submission — ask for a re-run).

### E · Verdict
Two invocations, deliberately:

1. **Read-only re-derivation first:** `node runtimes/circom-gadget/verify-run.mjs
   <the three reports>`. Nothing is filed on a REJECT; a reproducible required-artifact
   mismatch is a *contribution* — draft the reply inviting position `refute`.
2. **File on ACCEPT:** `node registry/accept.mjs --from <scratch-dir> --seat <id>
   --position <verb> --id NNNN-<slug> --note "<provenance + agent disclosure>"`.
   Always pass `--id` explicitly (the auto-id counts files and has collided before; the
   script fails closed on collision, but the habit is to never invoke the ambiguity).
   The `--note` must state how the reports were obtained (e.g. "reconstructed from the
   issue's pinned sections by the maintainer's agent, verdict re-derived locally").

`accept.mjs` re-checks the seat, re-runs the same verdict logic, refuses REJECTs and
overwrites, and rebuilds the site. Advisory findings (the setup chain: ptau / zkeys / vkey)
are recorded by name and are never fatal — machine-local divergence is the *expected*
signature of an independent build (the 2026-08-11 determinism finding).

### F · The telling
Reply on the issue. The reply must carry:

- the verdict and the advisory-note count, with the one-paragraph explanation of
  required-vs-advisory (so twelve advisory notes read as independence, not failure);
- the seat outcome (admitted / already active / declined);
- what publishes when ("row NNNN goes live with the next push");
- a **process note disclosing agent involvement** — mandatory whenever an agent drafted the
  reply or derived the verdict. The registry's own disclosure discipline (§19 observers named,
  nothing silent) applies to its back office.

### G · Chronicle + publication — **HUMAN**
The run is chronicled in the maintainer's working record before it is published. The push —
seats, submission, rebuilt site — is the maintainer's act alone. Acceptance and publication
are separate on purpose: the row exists and is inspectable locally before anything is public,
and the public history shows exactly one deciding hand.

Once the row is live, the submission issue is **closed with a pointer** (on maintainer
authorization, never silently and never before publication): a short comment carrying the
verdict, the link to the published row, and the link to this flow. The issue is the intake
vehicle; the registry row is the durable record. The lifecycle stays legible at a glance —
**open = pending review, closed = processed, row = the record.** Position issues (ratify /
refine / refute records that aren't verification submissions) are *not* closed on
processing — they stay open as standing threads others can add positions to.

**G.1 · The publication rite (explorative trust task).** Before the push, the agent serves
the maintainer a **proverb** — one line that compresses what this specific publication means
— and the maintainer answers with a spoken (or typed) **activation** as proof of
understanding. The exchange is a challenge–response at the human gate: the proverb is fresh
per push (it names *this* push's meaning, so a stale or replayed activation answers the wrong
challenge), and the activation proves presence and comprehension, not possession of a
credential. Instituted at the first external acceptance (0006, 2026-08-14). The explorative
claim worth pursuing: this is a low-assurance, high-legibility ancestor of the
**maintainer-liveness requirement** these ceremonies will eventually need — the same shape as
PR-LIV (a fresh challenge, a live response, bound to the act it authorizes), enforced today
by rite rather than biometric, with the transcript of the exchange as the §15.2-style record.
When lane 2's real ceremony arrives, "who may operate the maintainer's gate" should inherit
whatever this rite teaches about binding *understanding* — not just identity — to the act of
publication.

## Invariants (the agent's own gate)

- never edit `artifacts.manifest.json` in this flow — a manifest change is a different act
  with its own review;
- never file without an explicit `--id`;
- never push; never close an issue before its row is published or without maintainer
  authorization (closure is gate G's final step, always with the pointer comment);
- never post without the process note;
- never treat the submitter's verdict line as the verdict.

## Worked example

Entry `0006-gg-affinidi` (2026-08-14, issue #2): first external run, first darwin/arm64.
Seat absent → filing treated as request → admitted on maintainer assent; reports
reconstructed from pinned sections; re-derived verdict ACCEPT with 12 advisory notes
(required digests byte-identical across win32/x64 → darwin/arm64 — the by-construction
determinism claim holding across architectures); filed, site rebuilt, reply posted with
process note. The verbatim re-derivation transcript:

```
  note nullifier_membership: artifact-hash-advisory:ptau_final
  note nullifier_membership: artifact-hash-advisory:zkey_0000
  note nullifier_membership: artifact-hash-advisory:zkey_final
  note nullifier_membership: artifact-hash-advisory:vkey
  ok   nullifier_membership: ACCEPT (advisory notes recorded)
  note dual_issuer: artifact-hash-advisory:ptau_final
  note dual_issuer: artifact-hash-advisory:zkey_0000
  note dual_issuer: artifact-hash-advisory:zkey_final
  note dual_issuer: artifact-hash-advisory:vkey
  ok   dual_issuer: ACCEPT (advisory notes recorded)
  note guardian_threshold: artifact-hash-advisory:ptau_final
  note guardian_threshold: artifact-hash-advisory:zkey_0000
  note guardian_threshold: artifact-hash-advisory:zkey_final
  note guardian_threshold: artifact-hash-advisory:vkey
  ok   guardian_threshold: ACCEPT (advisory notes recorded)
verify-run: ACCEPT
```

## Register candidates raised by this flow

`report-unreconstructable` (pinned sections absent/unparseable — currently handled as a
reply, named here for the fixtures register when the flow itself grows a suite) ·
`seat-admission-pending` (submission valid, human gate C not yet passed — the holding state
between B and C).

## Open refinement (position: refine)

**Seat minted on first accepted run:** fold gate C into gate E — acceptance auto-appends the
self-chosen seat row in the same commit that files the submission. Fail-closed is preserved
(nothing publishes without the maintainer's accept + push) and the awkward pre-step
disappears. This is a TF-visible governance change; it rides the position protocol as a
`refine`, it does not land quietly.
