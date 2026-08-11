# ceremony-orchestrator — X10 lane 1, runnable

**What this is.** The lane-1 slice of exploration **X10 (ceremony-as-trust-task)** as a runtime:
the volunteer verification flow (setups → suites → digests → acceptance → paste-ready submission),
seat admission as governance data, the lifetime-view secret scan lane 2 will inherit, and the
lane-3 gate as an unconstructable path. 8/8 property tests, zero deps (shells into
`../circom-gadget/` for builds; imports its `verify-run.mjs` verdict logic unmodified).

**Run:** `node test.mjs` (needs circom-gadget's `build/` present) · volunteer flow:
`node orchestrate.mjs <seat-id> [position]`.

## The empirical finding this suite forced (2026-08-11)

Building CO1 required answering the determinism question the setup header had hedged
("modulo snarkjs's own internal randomness"). A full same-machine fresh rebuild settled it:
**r1cs + wasm byte-identical; ptau/zkeys/vkey all divergent** — snarkjs mixes CSPRNG randomness
into every `contribute` regardless of the fixed `-e` string. So the acceptance model is:

- `required` — compiled-circuit identity: r1cs digest, wasm digest, constraint counts.
- `advisory` — the setup chain (ptau_final, zkey_0000, zkey_final, vkey): machine-local,
  divergence recorded by name (`artifact-hash-advisory:<key>`), never fatal.
- The proving-system claim rides the volunteer's own suites running green — real proofs
  verified against their own build.

Full record: `../circom-gadget/NOTES.md` (Deviations + caveats). The earlier "any two machines
build byte-identical artifacts" phrasing was an overclaim, corrected in CIRCUITS.md and the
2026-08-11 call companion. This is the registry's first finding, produced by building the
registry — the loop working.

## X10 C-property coverage (stated, not implied)

| X10 | Status | Where |
|---|---|---|
| C1 secret sourced in-subprocess, lifetime view scanned | **groundwork** — `scan.mjs` built + tested (CO5); no live secret exists in lane 1 | scan.mjs |
| C2 chain/artifact verification before use | **implemented** for lane 1 artifacts (manifest check precedes acceptance) | verify-run.mjs via acceptSubmission |
| C3 attestation binds §15.2 transcript | **lane-2 deferred** — lane-1 submissions bind digests, not a ceremony transcript | — |
| C4 seat admission fails closed, revocation visible | **implemented** (CO3) | orchestrate.mjs `checkSeat` |
| C5 advisory duplicate-seat nullifier | **lane-2 deferred** (and advisory-only by X10 ruling when it comes) | — |
| C6 lane-3 unconstructable | **implemented** (CO4: gate throws `phase2-gate-closed`; source scan proves no contribution command in the suite) | orchestrate.mjs `contributePhase2` |
| C7 acceptance = byte comparison, misses named | **implemented** (CO2, CO6) | verify-run.mjs |
| — leak hygiene: no local paths leave the machine | **implemented** (CO7, fail-closed `submission-contains-local-path`) | orchestrate.mjs `buildSubmission` |
| — informative/pinned wall | **implemented** (CO8) | report.mjs + verify-run.mjs |

## Register candidates (fixtures v3 backlog — all triggered live here)

`artifact-hash-mismatch:` · `artifact-hash-advisory:` · `artifact-bytes-mismatch:` ·
`constraints-mismatch` · `format-version-mismatch` · `unknown-circuit:` · `seat-not-admitted:` ·
`seat-revoked:` · `phase2-gate-closed` · `secret-in-view:` · `submission-contains-local-path`

## Consumers

- `registry/` in the research root (public repo): `build-registry.mjs` renders the accepted
  submissions + pinned manifest into the GitHub Pages site; the issue template
  (`.github/ISSUE_TEMPLATE/verification-run.yml`) carries what `buildSubmission` prints.
- Lane 2, when the TF assents upstream: inherits `scan.mjs` (assertClean over the orchestrator's
  whole captured view) and the seat model; adds the snarkjs MPC hand-off pair + `powersoftau verify`.
