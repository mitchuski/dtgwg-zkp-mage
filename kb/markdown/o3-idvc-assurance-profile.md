---
title: "O3 — IDVC Assurance Profile"
section: "explorations"
source: "explorations/O3-idvc-assurance-profile.md"
built_from_commitish: "working-tree"
order: 43
---
# O3 — The IDVC as the MLP's qualifying attestation

*"Valid IDVC at assurance ≥ L from a registry-listed IDVP" — the standard liveness input contract, now
shaped by PR-LIV and the attestation-schema discipline.*

**Register:** O3 · leverage 🟠 · **Ladder:** design doc
**Anchor (cred-spec):** **IDVC** — any W3C VC satisfying VTC/VTN identity-proofing; named issuers
Veriff/Jumio/Yoti/Onfido/ID.me/Socure/Trulioo. Not a DTG credential subtype.
**Anchor (decision doc):** **PR-LIV** (§10) · MLP (§7.1) · §18 attestation schema as the shared boundary
determinant · §8 assurance allocation.

---

## What changed with the decision doc

The original register entry proposed inventing an "IDVC assurance-level predicate profile." The decision doc
has now *built the frame for it*: PR-LIV is exactly that predicate, stated with its negative meaning, and
the MLP is the profile it ships in. What remains for this exploration is the **binding**: mapping the
cred-spec's IDVC onto the decision doc's attestation-schema requirements so a biometric provider knows
precisely what to sign.

The controlling insight (§18): **the issuer attestation schema determines both boundaries at once.** A
field added for assurance (policy version, assurance class, accreditation reference) is simultaneously a
correlation surface. The IDVC profile is therefore a schema-governance exercise, not just a predicate.

## The statement (PR-LIV, instantiated for IDVCs)

The prover possesses an IDVC that: was signed by an IDVP accepted under the relying policy (via the trust
registry — O4); asserts a liveness/identity-proofing outcome satisfying the requested predicate; was issued
under an accepted policy id+version; carries an **assurance class ≥ L**; is within validity; is not revoked
per the profile's status semantics; is bound to the holder secret; and is bound to the current canonical
transcript (§15).

**Negative meaning, carried verbatim** (§10.2): not that the biometric determination was correct; not that
the sensor was uncompromised; not civil identity; not global uniqueness; not non-transfer of the key; not
consent or comprehension. The issuer stays accountable for the determination (§8, §10.5) — the proof carries
possession + predicates, never correctness.

## Schema mapping (IDVC fields → §18.2 field classes)

| IDVC content | §18.2 field class | Disclosure treatment |
|---|---|---|
| IDVP identity | issuer accreditation reference | set-membership proof (concealment within registry set) or explicit — profile-specific (§12.3) |
| assurance level L | assurance class | disclose the *threshold met*, minimise cardinality — rare classes fingerprint (§10.4) |
| identity-proofing policy | policy identifier/version | prove accepted value or coarse class |
| issuance/expiry | validity bounds | interval-membership proof, never exact timestamps (§18.3) |
| subject binding | holder-binding commitment | hidden witness |
| determination result | determination result | hidden; only the predicate disclosed |
| status entry | status reference | privacy-preserving status / bounded cache (→ O4 revocation patterns) |

Prohibited (§18.3): stable issuer-local identifiers, raw biometrics, reversible templates, exact timestamps,
unique status indices. **The no-biometric-honeypot stance is now a schema rule, not just a design stance.**

## Why this is the Chair's boundary object

The MLP is deliberately shippable without the Sybil/unlinkability trade (§7.1) — it is the profile a
biometric provider (Realeyes included) can implement and benchmark first. This exploration gives the
provider side one page: *what your attestation must contain, what treatment each field gets, what the
verifier may rely on, and what you remain accountable for.* The assurance-class enumeration needs a
registry field — coordinate with the Credentials TF (§27.1: credential fields can defeat context separation
even when the proof is sound).

## What exists

- rt 02 STUB (ZKP of a valid issuer signature over a hidden attestation) — the construction seat.
- The decision doc's PR-LIV boundary analysis (§10) — the assurance side, done.
- The named-IDVP ecosystem in the cred-spec — the real-world issuer set.

## Build plan

- **M1 — schema profile draft:** the field table above as a versioned attestation-schema profile with the
  §18.1 per-field register (purpose, disclosure mode, cardinality, stability, correlation risk, lifecycle).
- **M2 — disclosure-boundary record** for PR-LIV-over-IDVC (§10.3/§10.4 instantiated: which correlators an
  actual IDVP schema introduces — rare assurance classes, proving-time fingerprints, status patterns).
- **M3 — rt 02 reference model:** signature-in-circuit over a mock IDVC with the M1 schema; negative tests
  from §26.1 (expired/revoked accepted attestation must fail; output implying biometric correctness must be
  rejected as a *claim*).
- **M4 — provider one-pager** for TF review with the Chair.

## Open questions

- Signature scheme reality: named IDVPs sign classical W3C VCs (ECDSA/EdDSA) — signature-in-circuit cost vs
  issuer re-signing in a ZK-friendly scheme vs format-level selective disclosure (BBS+/SD-JWT) as the
  carrier with our predicate layered on. §25's evaluation list decides.
- Assurance-class vocabulary: whose enumeration — ours, the registry's, or an external framework
  (NIST IAL/…)? Cardinality-minimisation (§18.2) argues for a small mapped set.
