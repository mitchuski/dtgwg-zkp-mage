# Contributions map — 27 September 2026

Survey `board/survey/2026-09-27T17-47-19-130Z.json` (since 22 Sept 14:00 UTC; 123 threads moved across eleven repositories). Nothing of ours moved upstream; the week beside us decided four things on the credential side, published the hidden-vetting wire on the framework side, and closed both OpenVTC doors.

## Ours — unchanged since 23 September

| artifact | state | waiting on |
|---|---|---|
| dtgwg-zkp-spec [PR #11](https://github.com/trustoverip/dtgwg-zkp-spec/pull/11) review revision (3 commits) | open · green · reviewers ScottJeezey + geoffturk | merge (the chair). DenisPopov15 inline on 007 (23 Sept 06:23 UTC): `did:key` has no space; `did:peer` 2/4, `did:web`, `did:webvh` and anchored methods can carry the commitment — already recorded as `refined` in 007's reviews part |
| dtgwg-zkp-spec [PR #12](https://github.com/trustoverip/dtgwg-zkp-spec/pull/12) Round 2 (4 commits, stacked on #11) | open · green · no reviewers requested | AP (the opener) and the round's reviewers |
| dtgwg-zkp-tf [PR #28](https://github.com/trustoverip/dtgwg-zkp-tf/pull/28) guide as navigation companion (fork branch) | open · DCO/CLA green · render workflow not run (needs approval) | merge first |
| trust-tasks-tf [#544](https://github.com/trustoverip/dtgwg-trust-tasks-tf/discussions/544) zk slot in DID templates | 0 replies | — |
| Evidence repo (72 uncommitted paths) | I5 not done | publication/provenance ruling |

## The week beside us

### cred-spec — four decisions on 25 September, all by end of day

| issue | decision | who | what it changes here |
|---|---|---|---|
| [#48](https://github.com/trustoverip/dtgwg-cred-spec/issues/48) namespace | context `https://registry.trustoverip.org/dtg/context/v1` (byte-frozen, digest pinned normatively; First Person IRI scoped out); vocabulary `https://registry.trustoverip.org/dtg/credentials#`; `v1` = 0.5.0 + `issuerScope`; **one `v2` at the Implementers Draft** carries `salt` in and `taskContext`/`taskDigestMultibase` out; pre-ID credentials not conformant. Registry [PR #7](https://github.com/trustoverip/dtgwg-vsc-registry/pull/7) open | geoffturk proposed; stormer78 +1 (3 points); bmiller59 +1 ("ship it"; process note on same-day turnaround) | Our [DTG-CRED] pin (0.4.0 minimum) holds. 008/022 provenance carry the versioning plan. Re-pin at `v2`. |
| [#46](https://github.com/trustoverip/dtgwg-cred-spec/issues/46) correlation scope | top-level `issuerScope` ∈ {`pairwise`,`directed`,`public`}, REQUIRED, each credential declares only its issuer's scope; enum validation spec-level | geoffturk; stormer78 +1; bmiller59 +1 | Disclosed declaration; no proof member. 007/011 unaffected. |
| [#38](https://github.com/trustoverip/dtgwg-cred-spec/issues/38) salt | REQUIRED top-level `salt` inside every DTG credential's hashed block, 32 bytes CSPRNG, base-58-btc, mandatory-disclosure under SD suites, no change to §Digest Encoding, `v2` timing — "matching record 022's preferred placement" | stormer78; bmiller59 +1 | **= record 022 option 1 as written.** Provenance + issuance updated; AW drafted (hold). |
| [#58](https://github.com/trustoverip/dtgwg-cred-spec/issues/58) ours | **detached citation**: the credential carries no `taskContext`/`taskDigestMultibase`; an issuer-signed `credential-citation/0.1` (bearer; one per credential; no `parentThreadId`) binds the salted credential digest to the exchange; shown only to a verifier that needs completion; fixes at-rest naming + shared value, not repeat-presentation linkage; "#58 no longer depends on the ZKP task force" | stormer78 (as Trust Tasks editor); bmiller59 +1; geoffturk awaited | **008 route 1 superseded at the credential layer.** Route 2 stays. 008 amended (issuance 1, does-not-establish, options, provenance, revision). AV drafted (ready). |

Also merged 22–25 Sept: PR #56 (taskContext = initiating id + taskDigestMultibase; AN folded), PR #55 (categories dropped), PR #50 (identity vetting predicate as a worked VSC profile), PR #59–#63 (0.5.0, title "DTG Credentials Core Specification", editors). PR #18 closed. #53 `nodeType` deferred to `v2`.

### trust-tasks-tf — the hidden-vetting wire (record 024's framework side)

| PR | what | proof-side reading |
|---|---|---|
| [#618](https://github.com/trustoverip/dtgwg-trust-tasks-tf/pull/618) (23 Sept) | `vtc/vetting/vetters/pcs-root/0.1` (class-label enrolment; community signs a commitment it cannot open) · `vtc/vetting/vetters/pcs-tokens/0.1` (unconditional drip) · `vetting/attestation/0.1` (vetter → applicant, no issuer, `identifierScope: any`, MUST NOT record deliverer, dates not timestamps) · `vtc/vetting/pcs-challenge/0.1` (16-byte hex nonce, one open per applicant, expiry, spent on count) | the framework obligations behind 024 clauses 2–5 and the challenge; recorded in issuance; the three "decisions worth review" are privacy claims the proof relies on and does not establish |
| [#620](https://github.com/trustoverip/dtgwg-trust-tasks-tf/pull/620) (23 Sept) | `vtc/vetting/vetters/event-mode/0.1` — separate token label per named event; own rate/expiry; group floor; not self-service | narrows the anonymity set to "some vetter at this event" — new does-not-establish + horizon lines on 024 |
| [#603](https://github.com/trustoverip/dtgwg-trust-tasks-tf/pull/603) (22 Sept) | `vtc/vetting/vetters/show/0.1` by-DID vetter status (spec half of VTI #1651) | not evidence; constant-cost answer; provenance on 024 |
| #600 / spec #23 | `extCritical` on vetting requirements | already read by 024 (`org.openvtc.hidden-vetting` namespace) |

Framework 0.7.0 released (spec #21); baseline cryptosuite (#22); proofPurpose checks (#24, tf #637). Release train 0.21.7 → 0.23.x.

### OpenVTC

- **`OpenVTC/predicate-credential-system`** created 24 Sept (governance PR #25 "adding PCS"); README only at `e6a7bd3`; no license yet. Record 024 option 1 now names it. Watch for source; nothing source-derived enters public records until then.
- **vti-setup**: #40 and #41 CLOSED 23 Sept. Our PR #42 (links + markdown lint) MERGED `718ff79`. Our PR #43 (release-pin guard) CLOSED — geoffturk removed the release flow instead (PR #45 fetches the setup script from `main`), and PR #46 reframed the two-VRC join policy as an example. Lane complete.
- **verifiable-trust-infrastructure**: #1652 CLOSED 22 Sept (stormer78 PR #1774) and #1651 CLOSED 23 Sept (spec half #603). Both doors closed by the maintainer. ~40 PRs merged 25–27 Sept (everything becomes Trust Tasks over TSP/DIDComm/HTTPS). Local checkout 87 behind.
- `dtg-credentials` 0.11.0 (taskDigestMultibase, 22 Sept) — will change again under #58.

### Elsewhere

- vds-spec PR #11 Vetting Card: ScottJeezey (22 Sept) "deferring to the cryptographers on the ZK members, no concerns on shape". AB stands.
- vti-spec: #33 (validity vs completion) MERGED 22 Sept; chapters + Appendix E normative (#36); divergence register churn (#35, #37–#45).
- dtgwg-general #33 spec links (talltree). #31 quiet since AA.
- vsc-registry: new repo 24 Sept — predicate registry (endorses/witnessed as draft) + context host; Cloudflare Pages deploy.

## What changed in the records (local, Round 2 worktree, uncommitted)

| record | change | state |
|---|---|---|
| 008 | issuance 1 rewritten (no citation in the credential; route 2 reads the citation as witness); route 1 option marked superseded; new does-not-establish (a shown citation is a stable pair); provenance (#58 proposal, PR #56 merged, PR #18 closed); revision 27 Sept | `specified`, unchanged |
| 022 | issuance 1 (members: five + the citation's `credentialDigestMultibase`, not `taskDigestMultibase`); issuance 2 (adopted on #38 in that shape); provenance (#38, #58, #48); revision | `specified`, unchanged |
| 024 | challenge line carries `pcs-challenge/0.1`'s shape; new issuance line for the four vetter-side tasks; does-not-establish + horizon for the event label; option 1 renamed to the PCS with the public repo; provenance (#618 #620 #603, governance #25); revision | `constructed`, unchanged |

## Drafts

- **AV** (ready) — cred-spec #58: accept the detached citation from the proof side; 008's disposition; two notes; the #38 dependency.
- **AP** (ready; date = Mitch) — zkp-tf #23 Round 2 opener, refreshed with the week.
- **AW** (hold) — cred-spec #38: 022 option 1 as written.
- Held from before: AQ (#25), AR (cred-tf #40), AS (general #25), Q, D.
