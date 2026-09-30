<!-- Moved from the DTG ZKP Implementation Guide (trustoverip/dtgwg-zkp-tf guide/spec/siros-review.md) on 2026-09-23, when the guide was restructured as a navigation companion to the specification. Kept verbatim as working material. -->

## SIROS reading and review pack — 29 September

Prepared after the 22 September meeting. Proposed review questions, not assignments or claims about SIROS capabilities. Confirm the session and participants with the chairs before sending.

### Fifteen-minute reading path

1. Read the specification Introduction and Public Inputs conventions: identify the exact statement, context and disclosed values.
2. Read construction 003 (transcript binding), 004 (holder binding) and 006 (status), including their negative space and witness requirements.
3. Compare 010 with 023. The immediate question is which parts of the admission statement an existing-credential route can implement; the complete composition is not yet demonstrated.
4. Read the guide’s implementation steps 2–3 and the cryptographic background’s P2 and P8. Separate credential authentication, holder-key access and circuit security.
5. Use the [SIROS catalogue repository](https://github.com/sirosfoundation/go-zk-circuits) and [manifest](https://api.circuits.siros.org/v1/manifest.json) to choose one exact artifact. Pin its identifier, digest, source revision and toolchain before comparing results.

Records: [003](https://github.com/trustoverip/dtgwg-zkp-spec/blob/315cf4466bfcfe3d70c88a6706d0a6ca633c60c9/conformance/records/003.json), [004](https://github.com/trustoverip/dtgwg-zkp-spec/blob/315cf4466bfcfe3d70c88a6706d0a6ca633c60c9/conformance/records/004.json), [006](https://github.com/trustoverip/dtgwg-zkp-spec/blob/315cf4466bfcfe3d70c88a6706d0a6ca633c60c9/conformance/records/006.json), [010](https://github.com/trustoverip/dtgwg-zkp-spec/blob/315cf4466bfcfe3d70c88a6706d0a6ca633c60c9/conformance/records/010.json), [023](https://github.com/trustoverip/dtgwg-zkp-spec/blob/315cf4466bfcfe3d70c88a6706d0a6ca633c60c9/conformance/records/023.json).

### Questions for Leif and the team

- Which credential formats, curves and signature suites does the selected artifact support today? Which inputs or credential changes would DTG need?
- How is holder/device binding established when keys are non-exportable? What is checked inside the proof versus by the verifier?
- Which audience, challenge and profile identifiers are authenticated? What are the replay and freshness checks?
- Can two independently signed credentials be linked privately to a common subject or issuer? If not, which new circuit or issuance artifact is required?
- What disclosure and timing remains visible to the verifier, issuer, registry and any delegated prover, and for how long?
- How are credential status and root freshness handled? Does witness retrieval reveal the presentation or holder?
- Which 023 clauses are implemented, which can be composed, and which are unsupported? What review or independent reproduction supports that answer?

### Requested comparison packet

Use the same acceptance statement and synthetic fixtures across routes. Return the circuit/artifact id and digest; source and tool versions; credential and public-input manifest; hardware and OS; security parameters and setup assumptions; cold and warm proving time; peak memory; verification time; proof bytes; proving/verifying artifact bytes; credential bytes; and end-to-end presentation bytes. Distinguish each size: a signing key, signature, proof and circuit artifact are different objects.

Include rejection cases for altered signature, wrong holder, wrong audience/challenge, unsupported profile, stale status and duplicate voucher. Identify mocks and external checks. Missing data is unknown, not zero. A catalogue digest establishes artifact identity, not correctness or security review. Do not reuse September 5 catalogue counts or artifact sizes as current measurements.

### Intended output of the session

Agree one representative artifact and workload, its relationship to 023, an implementation owner, a reviewer and a target date. Record unsupported clauses explicitly. Keep the candidate route separate from a recommendation or normative choice.

### The catalogue as read on 29 September (manifest v1, generated 2026-08-27, unchanged since the lab's 5 September read)

Fourteen entries, all marked experimental and unvetted by the catalogue itself. None proves a DTG statement: every entry proves a presentation over an ISO 18013-5 mDL or EUDI PID document exactly as its issuer signed it (ECDSA, P-256 rails). DTG credentials are W3C Verifiable Credentials under the credential specification's suites, so the existing-credential route needs the packet's first question answered before any 023 clause can be claimed.

| family | entries | statement | provenance | pick? |
|---|---|---|---|---|
| Longfellow libzk v1, systemVersion 6 and 7 | `longfellow-libzk-v1_6_{1..4}_*`, `longfellow-libzk-v1_7_{1..4}_*` (1 to 4 disclosed attributes; ~280 to 340 KB compressed, ~90 to 115 MB uncompressed) | selective disclosure of 1 to 4 mdoc/PID attributes with the issuer signature verified in zero knowledge | vendored from openwallet-foundation/multipaz at commit `bfb5a44f` (PR #1673), Apache-2.0, clean | **yes** — the candidate artifact for step 5 is `longfellow-libzk-v1_7_1_4151_4096` (one attribute, the smallest statement; `sha256:9016d173d8a579a1…`, circuit hash `8d079211…`). `v1_6_1_4096_2945` is the fallback if the session wants the older system version |
| Longfellow libzk v1, systemVersion 8 | `longfellow-libzk-v1_8_{1,2}_*` | same | bytes from a private fork (balfanz/multipaz, branch ppid); no public commit exists for these exact bytes | no — provenance cannot be re-derived |
| vega-mc P-256 | `vega-mc-p256-v1-{prover,verifier}-key-r12` (r11 deprecated) | mDL presentation, 4 claims, 176 bytes per claim | sirosfoundation/zk-cred-vega v0.0.5, BSD-2-Clause; the catalogue says "unreviewed, AI-generated code, not for relying-party trust decisions" | no |

What to pin before comparing: the entry id, the artifact `sha256`, the `circuit_hash` parameter, the upstream commit and the toolchain the entry records. What the packet will most likely record for this route: holder binding is the mdoc device key, not a DTG holder-binding clause (004); transcript binding is the system's own challenge (003 partially); set membership, distinctness and non-revocation over DTG roots (001, 005, 006) are not statements any catalogue circuit makes. That is a finding, not a failure; the pack asks for unsupported clauses to be recorded as such.
