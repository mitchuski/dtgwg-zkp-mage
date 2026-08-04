# Integration Map — DTG Credentials Core Spec → agentprivacy system

*2026-07-16, status refreshed 2026-07-17. Mage layer. The display-surface rows (master, skills,
spellweb) were **EXECUTED 2026-07-16/17** as part of the display & distribution cycle — working-tree
edits, uncommitted, carried into the guide snapshot by the two re-sync trains. Per-surface status
below. Guardrails unchanged: `agentprivacy-docs/papers/` is READ-ONLY pipeline canon (fix inputs,
rebuild); docs public `origin` FROZEN (gated rollout paused at G1); commits/pushes/deploys are Mitch's.*

This directory now holds the **first local copy of the spec** (`dtgwg-cred-spec-main/`,
vendored 2026-07-16). Until now the ZKP-TF coherence docs referenced it only by URL
(`trustoverip.github.io/dtgwg-cred-spec/`). The predicate↔anchor matrix and opportunity
register live in the TF clone: `~/dtgwg-zkp-tf-mage/runtimes/CRED-SPEC-COHERENCE.md`,
`CRED-SPEC-OPPORTUNITIES.md` (O1–O9), `STRAWMAN-COHERENCE-EDITS.md` (E1–E7).

## Predicate ↔ anchor matrix (from the TF coherence pass)

| # | Predicate (liveness-strawman §4) | Cred-spec anchor | ZK construction |
|---|---|---|---|
| 01 | Uniqueness / nullifier | R-DID uniqueness + PHC one-per-person | community-anchored (VMC, same C-DID) |
| 02 | Liveness attestation | IDVC issuer signature over hidden attestation | signature-in-circuit |
| 03 | Personhood / set-membership | VMC from recognized VTC | community-anchored |
| 04 | Holder / agent binding | VPC / P-DID + VTA presenter + key binding | pairwise (VRC) |
| 05 | Freshness | `taskContext` + validity window + outcome-interpretability | constraint on 01/02/04 |
| 06 | Demographic range | VEC attribute predicate | range proof composed with 02 |
| 07* | Trust-graph formation (bridge, non-§4) | node = PHC-anchored M-DID; edge = VRC between fresh R-DIDs; propagation = community-anchored | runtime 07, reuses runtime 01 nullifier |

## Integration points by surface

### 1. dtgwg-zkp-tf (upstream — the only surface that leaves the machine) — ⏳ PENDING (Mitch)
- Commit the pending 2-line README coherence edit (VTA capitalization + normative cred-spec link). **Only tracked dirty file in the clone.**
- Land E1–E7 (`STRAWMAN-COHERENCE-EDITS.md`) into `proof-of-liveness-requirements.md` via PR/issues —
  now framed by `predicate-assurance-boundary-decision.md` (the decision baseline; its §28 lists the ten
  ratification points for the TF call).
- `runtimes/` stays local (excluded via `.git/info/exclude`). Per the 2026-07-17 directory division, new
  design-doc mass goes to this exploration root (`explorations/`), keeping the clone git-clean.

### 2. agentprivacy-docs (canon — route via pipeline, never hand-edit `papers/`) — ⏳ ROUTED to docs agent (G-DOCS)
- **Gap 1**: E7-C26 (`papers/Programme/pipeline/extractions/E7-identity-vrc.md`) asserts "six types" without defining VMC/VIC/VPC/VEC/VWC → fix the *input source* (hearthold-build README / tome-x), rebuild the extraction.
- **Gap 2**: `specs/vrc_promise_protocol_v3_3.md` + `papers/whitepapers/swordsman_mage_whitepaper_v6_3.md` — add one-line note: same VRC acronym as the DTG spec; agentprivacy *extends* with promise-theoretic / ERC-7812 economics (contribution surface = O9, do not rewrite to match).
- **Gap 4**: `reference/GLOSSARY_MASTER_v4_0.md` — split PHC (governed VMC) vs IDVC (identity-proofing input, not a DTG subtype).
- **Gaps 3/4/5** (non-canon, directly editable on approval): `research/privacymage-response-fpp-zkp-progress.md` — expand R/M/C/P-DID in canonical order (L103), distinguish First-Person→PHC + IDVC pointer (L23/L27), expand VTA/VTC/VTN at first use.
- Routing table already staged in `agentprivacy-docs/CRED-SPEC-COHERENCE-NOTES.md`.

### 3. agentprivacy_master (display) — ✅ EXECUTED 2026-07-16/17 (uncommitted working tree)
- `src/app/model/page.tsx:255` — ✅ re-anchored to the DTG Credentials Core Spec, pairwise construction named.
- `privacy-layer/agentprivacy-vrc-identity/SKILL.md` — ✅ DTG spec section added; open problem #5 tied to
  the TF charter (two ZK constructions + PHC/IDVC split). `persona/agentprivacy-ambassador/SKILL.md` — ✅
  DTG WG/TF line added.
- `src/app/guide/the-dual-agent-harness/page.tsx` — ✅ fleet row added for trust-graph formation
  ("collision→edge→propagation, personhood-gated by the runtime-01 nullifier; the DTG credentials seam").
- tsc clean; carried into the guide snapshot by the re-sync trains. Commit = Mitch (G-M).

### 4. Harness runtimes (build direction) — 📐 DESIGN DOCS BUILT 2026-07-17
- The expansion ideas are now design docs in `explorations/` (this root), aligned to the decision
  baseline: O1 charter frame, O2 PR-UNQ/scoped-reuse (circom port = shared gadget), O4 registry-ZK +
  revocation, O3 IDVC/MLP schema profile, VWC witness seat (rt 07 → 15/15 target), O7 agent-card ZK
  (runtime 08 candidate), O9 VRC promise-bundle extension, O5/O6/O8 supporting.
- Build order per `explorations/README.md`: boundary records first (§25 gate posture), then the shared
  Poseidon-Merkle gadget in the runtime-01 circom port.

### 5. spellweb KG — ◐ PARTIAL (uncommitted working tree)
- ✅ `concept-dtg-credentials` node enriched (six types / R-M-C-P / two ZK constructions / TF deferral).
- ⏳ Still open: tag `con-vrc` (L250), `proto-vrc` (L365), `con-three-layer-identity` (L442),
  `skill-trust-graph-formation` (L591) with cred-spec anchors; optionally mint VMC / VTC / PHC / IDVC
  concept nodes.

### 6. Guide wiki federation — ◐ PARTIAL
- ✅ Two re-sync trains run (2026-07-16 + 2026-07-17): snapshot → gate → verify → manifest PASS; the
  updated skills + master content (incl. the DTG re-anchors) are in the snapshot. Deploy = Mitch (G-M).
- ⏳ Still open: extend `~/.wiki/atlas.localhost/pages/the-decentralized-trust-graph-dtg` with the
  six-type / two-construction / trust-registry model; re-mirror `research.localhost`'s privacymage
  response after the Gap 3–5 edits (G-DOCS), then one more train.

## Sequencing note

The cred-spec integration rode the display & distribution re-sync trains as planned: master + skills
edits landed 2026-07-16/17, and the federation re-syncs (`resync.js` → `snapshot.mjs` → `gate.mjs` →
`verify`) carried everything — soil ruling, harness publicity, skills gap, and the trust-graph
credential model — into the guide snapshot. What remains is Mitch's G-M pass (per-repo commits +
`wrangler deploy`), the G-DOCS canon routing, and the atlas-page + spellweb-tagging leftovers above.
