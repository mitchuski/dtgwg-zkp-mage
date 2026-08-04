---
title: Fit map — agentprivacy trust-task constructions × trustoverip/dtgwg-trust-tasks-tf
date: 2026-07-18
status: RESEARCH-ROOT WORKING DOCUMENT — drawing lane only; never upstreamed verbatim
lanes: draw-from (this doc) → promote (workbench design notes) → upstream (Mitch-only PR)
workbench: ~/dtgwg-trust-tasks-tf-mage (clone of trustoverip/dtgwg-trust-tasks-tf @ 894fcc6)
---

# Fit map: where our trust-task constructions land in the Trust Tasks registry

## 1. The upstream space, observed (2026-07-18)

**What it is.** A registry of Trust Task specifications — self-contained, transport-agnostic
JSON documents each describing one finite unit of verifiable inter-party work. Live at
trusttasks.org (`registry.json` = machine index, **166 tasks**). Framework `SPEC.md` **v0.2
working draft** — not yet a DTGWG deliverable; §7 (minimum requirements), §8 (errors),
§9 (bindings), §10 (security) explicitly still moving. Rust + TS client libraries are
code-generated from the specs and auto-published on merge.

**Envelope.** `id, type, payload, issuer, recipient, threadId, issuedAt, expiresAt, proof,
@context`. Request/response via `#response` type fragment + `$anchor: "response"`; failures
always `trust-task-error`; W3C Data Integrity proofs; VIDs = any verifier-resolvable
identifier string; audience-binding rule (proof present ⇒ in-band `recipient` unless the
spec declares `bearer: true`).

**Front-matter contract** (`spec.meta.schema.json`, meta 2.0): slug, MAJOR.MINOR version,
status (draft→candidate→standard→retired), closed **category enum** (15 values incl.
`ai-agents`, `consent`, `governance`, `reputation`), parties (role→issuer/recipient member),
`proofRequirement` + rationale, **`sideEffects`** (none/mutating/destructive + rationale) and
**`exposure`** (discloses none/metadata/secret + `actsAsSubject`) — both DESCRIPTIVE, NOT
PRESCRIPTIVE (consent policy is the consumer's, derived from the compiled handler, never the
registry), `subjectPath` JSON pointer, namespaced errorCodes, `related`, `methodExtensions`
(ext conventions pinned to shared schemas), `bearer`.

**Registry contents.** acl/*, auth/* (passkey, step-up), chat, consent/* + task-consent/*,
device/*, did-management/* (25 tasks), git-trust/*, governance/capability/*, messaging/*,
policy/* (evaluate/upsert/list — PolicyDecision incl. `requireConsent`), push/*, registry/*
(incl. TRQP v2.0 authorization/recognition queries), sync, vault/*, **vta/*** ("Verifiable
Trust Agent": credentials issue/revoke, did-templates, memory put/list/delete, passkey-vms),
webvh/*. Everything is `draft`.

**The flagship design note** — `docs/design-notes/delegated-trust-task-execution.md`:
consent-gated delegated execution ("what the human approves must be what executes,
cryptographically"). Salted type-bound payloadDigest, effects from dry-running the real
handler, state pinning, single-use grants, cross-device digest matching for destructive
tasks. Normative surface: `task-consent/{request,decision}/0.1` + `policy/_shared/0.3`.
Honest §16 gap list (enforcement off by default, one handler has dry-run, recovery unsolved).

**Social reality.** Effectively a **single-author registry**: every one of the 166 tasks and
all 115 merged PRs are Glenn Gore (@stormer78). Issue creation restricted; the one outside
task proposal (#7) was closed. Entry must therefore be coordinated (DTGWG channel, co-chair
to co-chair), design-note-first — which is also the repo's own pattern (PR #116 upstreamed
the delegated-execution design note). Contribution mechanics: fork + branch, own namespace
only (CODEOWNERS routes by slug), `npm run build` green, DCO `git commit -s`, OWF CLA.

## 2. Our constructions and their landing zones

| # | Construction | Source (drawing lane) | Maturity | Landing zone upstream |
|---|---|---|---|---|
| 1 | **X3 show-composition + governed bundle profiles** | `explorations/X3-trust-task-composition.md`; lab `~/dtgwg-zkp-tf-mage/runtimes/show-composition/` 10/10 | tested reference | `docs/design-notes/predicate-shows-and-bundle-profiles.md` → later a bundle-profile registry object (their shared-schema + change-control conventions fit) |
| 2 | **Credential/artifact wall** | `predicate-assurance-boundary-decision.md` §27.2 + X3 §"wall"; VWC witness seat | spec draft | Same design note, framed as a framework consideration for SPEC.md §7.3 (a proof show is never completion evidence; completion artifact = threadId-correlated response) |
| 3 | **KY-A two-gate agent admission** | ~/gatehouse-kya (runtime 05-vrc-two-gates 14/14; ERC-8004 adapter "evidence, never authority"; Act II minimised pooling) | live prototype | `docs/design-notes/agent-admission-ceremony.md` → candidate `agent-admission/*` family, category `ai-agents` (no slug collisions in registry.json today) |
| 4 | **Proof-of-understanding ceremony (LAN/MyTerms)** | memory `project_lan_ceremony_mage_mesh` + `~/.wiki/chronicles/2026-06-28_lan_workshop_...` + myterms briefs | design captured | Research-root spec draft first (this cycle); upstream design note only after 1–3 land |
| 5 | **Proof-packet ↔ trusttasks.org correspondence** | `agentprivacy_master/docs/experience/CHRONICLE_trust_tasks_browser_compute_integration_2026-06-11.md` | built | Feeds narrative framing of notes 1 and 3; not a standalone contribution |

**Why the seam is real, in their own terms.** Their `policy/evaluate` returns
`requireConsent`; their task-consent flow binds *what executes* to *what was approved*. Our
X3 binds *what is proven* to *one atomic transcript* and governs *what may be requested*
(bundle profiles vs à-la-carte). The two are the same instinct — closed vocabularies against
composition attacks — applied on either side of the request/proof boundary. Their
`registry/authorization` already carries TRQP; a bundle-profile registry is the ZKP-side
twin. And their `sideEffects`/`exposure` descriptive-not-prescriptive doctrine is exactly
where the credential/artifact wall docks: evidence class is one more thing the registry
describes and the consumer derives.

**Namespace discipline.** Candidate slugs checked against registry.json 2026-07-18: nothing
under `agent-admission/*`, `bundle-profile/*`, or `understanding/*` exists. The `vta/*` and
`consent/*` namespaces are Glenn's active surface — we do NOT propose inside them; adjacency
is stated in `related:` links instead.

## 3. Wave state

- **Wave 0 DONE** — workbench cloned (`~/dtgwg-trust-tasks-tf-mage`, no fork remote yet,
  no git identity configured for it), `npm run validate` green: 166 specs, 33 shared
  schemas. **Windows gotcha:** the yaml parser fails on CRLF checkouts (`related: []` +
  `\r` → YAMLParseError); fixed with repo-local `core.autocrlf false` + re-checkout —
  keep LF endings in this workbench or validation lies. House style read
  (task-consent/request, registry/authorization, spec.meta.schema.json, CLAUDE.md).
- **Wave 1** — this fit map + `predicate-shows-and-bundle-profiles.md` design note
  (workbench, PR-shaped, upstream-clean language).
- **Wave 2** — `agent-admission-ceremony.md` design note (workbench). Gatehouse git ruling
  holds: content re-expressed, no repo links, no code.
- **Wave 3** — proof-of-understanding standalone spec draft (research root, not upstreamed).
- **Wave 4 (Mitch-only)** — circulate notes to Glenn via DTGWG alongside the ZKP TF
  BRIEFING-2026-07-18 (its §3 item 5 already names bundle profiles as joint §27.2 work);
  agree scope; then design-note PR (DCO, own paths only); spec PRs a later cycle.

## 4. Open questions to carry into the joint session

- Bundle-registry authority: context authority (§6.7), Trust Task TF, or shared body?
  (Also open in BRIEFING §4.)
- Does the framework want an *evidence class* axis next to `sideEffects`/`exposure`
  (descriptive: what a successful `#response` may be relied on to establish, for how long)?
- Uniformity vs honesty: padded bundle shapes on consumer devices (§25 envelope).
- Whether `agent-admission` belongs in `ai-agents` or wants the `reputation` category once
  ERC-8004 anchoring enters (currently empty in the registry).
