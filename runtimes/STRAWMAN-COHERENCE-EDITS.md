# Candidate edits — cohere the strawman to the DTG Credentials Core Spec

**Status:** Co-chair review notes. **Not applied** to the tracked `../proof-of-liveness-requirements.md`
(Scott Jones' doc) and **not pushed** — these are proposals to bring to the TF, in the same spirit as the
"candidate upstream edits" in `01-uniqueness-nullifier/NOTES.md`. Each item is a reviewable diff we can
discuss on the weekly call / as GitHub issues before any spec text changes.

**Why:** the strawman shares *predicate* vocabulary with the Credentials Core Spec (WD v1.0,
<https://trustoverip.github.io/dtgwg-cred-spec/>) but names none of its credential types, DID types, or its
"trust registry." Since the cred-spec is upstream of us and format-agnostic on ZK, our requirements should
point explicitly at its objects so the two specs interlock. Full mapping in `CRED-SPEC-COHERENCE.md`.

---

## E1 — Add the Credentials Core Spec as a normative reference (front matter / §1)
The strawman says a proof must let a verifier rely on an assertion "of DTG credentials" but never cites the
spec that defines them. **Proposed:** add a normative reference to the *DTG Credentials Core Specification*
(WD v1.0) and a one-line note that this doc specifies the ZK layer that spec defers.

## E2 — §3/§4: name each predicate's credential anchor (the alignment table)
The predicates float free of the credential model. **Proposed:** add an alignment column/table so each
predicate names the cred-spec object it proves over:

| Predicate | Cred-spec anchor |
|---|---|
| Liveness attestation | **IDVC** (Identity Verification Credential) — the biometric provider's signed determination |
| Personhood / accredited issuer | **VMC from a recognized VTC** (spec's own predicate: "Holder has valid VMC from recognized VTC") |
| Uniqueness within a context | **R-DID uniqueness** + the **PHC** "exactly-one-membership-per-person" rule |
| Holder / agent binding | **VPC / P-DID** (persona) + **VTA** (presenting agent) |
| Freshness | **taskContext** + validity window + outcome-interpretability rule |
| Demographic range | **VEC** / attribute as a selective-disclosure predicate |

## E3 — §2/§3/§6/§7: "accredited (issuer) set" → **trust registry**
"Accredited set" (§3 personhood, §6 signed by "the accredited issuer", §7 "the set the issuer belongs to")
is our name for what the cred-spec calls the **trust registry** — the authoritative source of acceptable
issuers, roles, and revocations. **Proposed:** use "trust registry" for the governance object and reserve
"accredited set" for the cryptographic Merkle set the ZK proof runs over; add a sentence noting the proof's
set-membership is a ZK view of the trust registry's authorized-issuer list.

## E4 — §4: cite the spec's two ZKP constructions and say which predicates ride which
The cred-spec defines exactly two constructions — **pairwise (VRC-based)** and **community-anchored
(VMC-based)**. **Proposed:** add a design note that our per-predicate constructions are *one conformant
realization* of these two, mapping: personhood/uniqueness → community-anchored (VMC / shared C-DID);
holder/agent binding → pairwise (VRC-based). This positions our output as the binding for the spec's
deferred ZK layer rather than a parallel scheme.

## E5 — §3/§6: reframe the personhood target as the **PHC pattern**, the liveness input as an **IDVC**
- §3 "attested by an accredited issuer" → tie "personhood" to the cred-spec **PHC pattern**: a VMC from a
  VTC whose governance enforces real-human + one-membership-per-person. No new schema — a governed VMC.
- §6 "signed as an attestation by the accredited issuer" → name it an **IDVC** (spec: "any W3C VC satisfying
  VTC/VTN identity-proofing"; not a DTG subtype). Clarifies the boundary object the biometric provider ships.

## E6 — §5/§8: bind freshness/context to **taskContext** + outcome-interpretability
§5's context table and §8's "compose with credential and trust-task proofs" line map onto the cred-spec's
**`taskContext`** binding and its rule that a `taskContext`-bearing credential is not evidence of task
completion without reachable, verified outcome evidence. **Proposed:** add a freshness note referencing
`taskContext` (nonce ↔ `witnessContext.sessionId`) so our replay/freshness requirement and the spec's
context-collapse-prevention requirement are the same mechanism.

## E7 — §10 step 3: make "align with the Credentials TF" concrete
Step 3 already says "align predicates with the Credentials TF." **Proposed:** point it at the specific spec
+ the E2 alignment table, and note the cred-spec's open items we touch (registry-ZK interaction, revocation)
as shared work — see `CRED-SPEC-OPPORTUNITIES.md`.

---

## Not proposed (deliberately out of scope for a coherence pass)
- No change to the six predicates themselves or the §4 stack-TBD stance — that's the WG's first decision.
- No new credential types — the cred-spec reserves that for higher-layer trust-task protocols.
- VTA capitalization aligned to *Verifiable Trust Agent* in our README already (cred-spec spelling); the
  strawman doesn't use VTA, so nothing to change there.
