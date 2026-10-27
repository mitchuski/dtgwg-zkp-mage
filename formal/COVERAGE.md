# Coverage inventory

Run from the evidence repository root:

```sh
node formal/scripts/check-coverage.mjs
node formal/scripts/test-coverage.mjs
```

The manifest inventories every construction relation clause, record-level candidate theorem roots, hypotheses and concrete source-file hashes. Every clause is pending semantic review. Candidates are not proof-to-clause mappings; runtime descriptions are not implementation correctness certificates. Tests are deliberately empty until reviewed at clause level.

The checker compares against current cards, artifact bytes (normalized LF), and Checks.lean. It checks cited roots against the audit list; Lean compilation remains a separate gate. It does not hash the whole Lean dependency closure or freeze a toolchain environment.

After reviewing a source change, use `node formal/scripts/check-coverage.mjs --write` to regenerate this initial inventory. Never use regeneration to claim semantic coverage: unsupported status changes fail the checker. The next gate must introduce reviewed clause-specific mappings and corresponding validation.

See [the integration plan](../zkbook/PLAN-spec-evidence-integration.md). No private implementation sources are included.
