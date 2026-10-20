# Complete-cost comparison report (optional lab tool)

Copy [template.json](./template.json), then run `python3 check.py REPORT.json`.
Run the synthetic positive and negative cases with `python3 test.py`; no install
or prover is needed. The template's numbers are invented nanoseconds, not a
benchmark, security result, independent run or reproduction claim.

This is an optional worksheet for the [WG-03 common-workload comparison](https://github.com/trustoverip/dtgwg-zkp-spec/blob/main/spec/implementation-guide.md).
Its `lab-comparison-report/v0` format is local lab tooling, not an adopted WG schema.
It neither selects a construction nor defines conformance or registry admission.
It follows the existing `pinned` / `informative` split and can reference the
[circuit artifact reports](../circom-gadget/report.mjs); it does not change their
format, required/advisory digest rules or verification-registry acceptance.

## Fill the boundary before comparing

- Pin the same statement, inputs, accepted outputs, disclosure, security settings,
  workload, source/builds and configuration. Name the privacy adversary and horizon,
  and what the predicate does not establish. A computation given private witnesses
  or greater disclosure is `computation-reference-only`, even if faster.
- Record all-thread, all-process CPU separately from elapsed time. State timer
  scope, paired order, repeated runs, cache conditions, uncertainty method, failed
  runs, exclusions and justified amortization. Include required setup, preprocessing,
  witness construction, proof construction, export verification, final verification,
  serialization, parsing, and credential/status/request checks in their proper rows.
- Each required cost component is either `included` or `excluded` with a reason.
  A component that is unnecessary has zero cost but remains included in the boundary;
  explain why in `informative.exclusions`. Any excluded component makes the report
  incomplete. The checker never subtracts setup or amortizes a cost automatically.
- Reference public artifact identities and accepted/rejected-case evidence in a real
  report; keep private witnesses and credentials out. `measured` is a declaration,
  not something this arithmetic checker verifies. Disclose assistant involvement
  in `role`, following [AGENT-RUNTIMES](https://github.com/trustoverip/dtgwg-zkp-tf/blob/main/AGENT-RUNTIMES.md).

For `n` readers and `m` required proofs, the calculation is:

```text
C_recompute = G + nR
C_proof     = G + mP + nV
margin      = n(R - V) - mP
```

`G` is genuinely shared producer CPU. `P` is additional CPU **per proof**, with
`G` excluded. If the prover timer includes `G`, reconcile it from the same paired
work rather than subtracting an unrelated run. `R` and `V` include complete reader
paths. One reusable proof requires compatible audience, freshness, request binding
and privacy policy; recipient-bound proofs require `m = n`. Other batching or
heterogeneous cost models need a separate explicit account, not invented reuse.
A reader saving (`V < R`) alone does not establish a positive total margin.

`cpuNs` and `elapsedNs` are nonnegative closed integer intervals. The checker
propagates the CPU endpoints conservatively, cancels the same `G` once, and reports
whether the margin is positive, negative, zero, or includes zero. Input run ranges
are not confidence intervals. No confidence level or statistical significance is
inferred, and the supplied bounds' measurement validity is not checked. Values and
derived totals stay within the cross-language safe-integer range `0..2^53-1`
(signed for savings); files are limited to 64 KiB and duplicate JSON keys are refused.

Keep resident peaks, live heap, allocation volume, accelerator memory and serialized
proof bytes in distinct resource records. Name processes, concurrency and coverage
of witnesses, tables, caches and scratch; mark partial scope and observed versus
enforced limits. The checker never sums unlike metrics or combines configurations.
An observed value below a declared limit is not a full-resource qualification.
An empty resource list makes no memory claim. Combined speed, memory and security
claims need the same configuration and supporting evidence outside this worksheet.

Prepared with AI assistance for human review. Synthetic tests exercise accounting
and metadata mistakes; they do not prove that a declared privacy match, security
assumption, measurement, resource scope or reuse policy is true.
