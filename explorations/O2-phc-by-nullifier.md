# O2 — PHC supported by scoped reuse detection

*The nullifier is the cryptographic leg of a Personhood Credential — it enforces scoped reuse detection
within a governed context. The "one person" part stays with enrolment governance, and the claim is stated
that narrowly on purpose.*

**Register:** O2 · leverage 🔴 · **Ladder:** **CIRCUIT BUILT 2026-07-18 (M3 done)** —
`~/dtgwg-zkp-tf-mage/runtimes/circom-gadget/` 8/8 with real groth16 proofs: Poseidon/BN254, depth-20
Merkle, domain tag pinned (sha256('dtg-zkp/nullifier/v0') mod p), context = §6.2 descriptor digest as
field. **M4 first datapoint: 11,523 constraints (incl. the +1 transcript-binding constraint added
2026-07-18 per the cross-check's recommendation — proof now cryptographically bound to the §15.2
transcript; nullifier preimage unchanged) · ~630 ms prove · ~8 ms verify · 725 B proof.** Suite 10/10
(Z9 transplant rejection now cryptographic, Z10 nullifier-stability distinction).
Lab-only trusted setup (not a production ceremony). **M5 DONE** — `SEMAPHORE-V4-CROSSCHECK.md` (this
dir): structurally conformant, byte-incompatible at every preimage; one accidental gap found (no
in-circuit transcript binding — ~1-constraint fix recommended); Semaphore-compat profile sketched.
Remaining: M1 boundary record · the transcript-binding input decision · epoch-as-separate-input (§22.2)
**Anchor (cred-spec):** PHC pattern (a VMC whose governance enforces real-human + one-membership-per-person)
· R-DID uniqueness rule · community-anchored construction.
**Anchor (decision doc):** **PR-UNQ** (§13) · §5.12 nullifier definition · §6 context · EPP only (§7.2).

---

## The narrow claim (decision-doc language, adopted verbatim)

> The same enrolled secret cannot produce two accepted actions in the same context, scope, purpose, and
> epoch without producing the same nullifier, assuming correct enrolment binding and construction
> implementation. (§13.1)

What it does **not** establish (§13.2, and our docs must never imply otherwise): one unique human globally;
one enrolment per issuer or ecosystem; that two secrets can't belong to one person; that one secret can't be
shared; cross-context identity. **Only scoped reuse detection is primarily cryptographic** — one-enrolment-
per-issuer is a biometric/governance property, and global uniqueness is outside the V1 claim entirely (§13.3).

## How this still realizes the PHC

The cred-spec's PHC asserts one-membership-per-person at the governance layer. The decision doc splits the
enforcement honestly:

- **Governance + enrolment** (issuer, biometric dedup, accreditation) make one human ↔ one enrolled secret.
- **The nullifier** makes that binding *hold at proof time*: within the governed context, a second accepted
  action from the same secret is detected — without a global identifier, without the registry learning who.

So the exploration's contribution to the Credentials TF is unchanged in substance but sharper in language:
*the ZK mechanism by which a VTC's PHC governance becomes enforceable within a context* — the cryptographic
leg, never the whole PHC.

## The statement (proof form)

```
public:   canonical context descriptor (→ §6.2, not an opaque string), nullifier N,
          enrolment-root R (epoch-bounded, cryptoperiod-governed — §22.2)
private:  enrolled secret s, blinding r, Merkle path π
statement: commitment(s, r) ∈ R   ∧   N = H_domain(s, ctx)
```

Decision-doc upgrades over the runtime-01 model:
- **Context is a descriptor, not a string** (§6.2): protocol/profile versions, context authority, policy,
  purpose, scope, verifier-set, epoch, nullifier version, retention policy — canonically encoded. Runtime
  01's "context canonicalization" note (NOTES item 3) anticipated this; §6.2 is the full answer.
- **The nullifier MUST bind** enrolment-root id, context descriptor, scope, purpose, epoch, versions, and
  recovery domain (§13.4) — our `H(s, context)` becomes `H_domain(s, descriptor-digest)` with each input
  explicit.
- **Bounded epochs are conformance requirements** (§22.2): an unbounded nullifier is non-conformant.

## What exists

- `~/dtgwg-zkp-tf-mage/runtimes/01-uniqueness-nullifier/` — zero-dep reference model, **9/9 property
  tests**, including **P4 user-as-adversary self-Sybil** (the presenter is the adversary; their second
  action in one context is refused) — a direct fixture for §26.1's negative tests.
- Domain separation already versioned: `dtg-zkp/nullifier/v0`.
- Lineage: privacy-pools / mana-pools nullifier discipline (see O6 in `O5-O6-O8-supporting.md`).
- §13.6 adds what the runtime lacks: **failure/redress semantics** — a repeated nullifier may be a retry,
  race, recovery, or epoch disagreement, not only an attack; deterministic error semantics + a challenge
  route are part of the profile.

## Build plan

- **M1 — boundary record.** Complete the PR-UNQ assurance + disclosure boundary pair for our construction
  (Appendix B of the decision doc is the worked example for exactly this predicate — start from it).
- **M2 — descriptor + epoch upgrade** of the reference model: replace the string context with a canonical
  descriptor digest; add epoch input + rollover test; add the retry-vs-attack error semantics.
- **M3 — circom port** (the shared gadget): Poseidon nullifier + Merkle membership (depth ~20). Toolchain
  present: circom 2.2.3. Only after M1 clears the §25 gate posture.
- **M4 — cost measurement** on a consumer device (§25's performance envelope; feeds "claim ceiling per
  presentation").
- **M5 — Semaphore v4 cross-check** — state precisely "conformant with / diverges from."

## Upstream surface

- The strawman's uniqueness row gains a runnable reference + the narrow PR-UNQ statement.
- To the Credentials TF: an informative note — *how a VTC's PHC governance is made enforceable in-context* —
  with the honest split (governance dedupes the enrolment; the nullifier makes the dedup binding at proof
  time), citing §13.3's assurance-dependency list.
- The spec must pin the hash (nullifier values differ by hash) + the versioned domain tag — rt 01 NOTES
  item 2, now reinforced by §13.4's version-binding requirement.

## Open questions

- Cross-VTC uniqueness is deliberately *not* provable (unlinkability working as designed) — but §13.3's
  "issuer coordination and common-root semantics" leaves room for governed multi-issuer roots; position?
- Recovery/rotation domain (§13.4) — how the pools lineage's note on secret rotation maps onto §29's
  "biometric-derived secret rotation" open question.
