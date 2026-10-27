# The gadget library — the ten primitive records in Lean (G4)

*Built 2026-09-23 (historical write-up; current counts in README.md). Reproduce: `sh scripts/check-axioms.sh` → `AXIOM CHECK: PASS`, 40 theorems.*

Each primitive record's clause is a Lean definition in `Formal/Gadgets/`. Composed records are built from
these definitions: record 024's soundness is record 005's `owners_distinct` applied to record 002's tag.
Cryptographic properties are named hypotheses, never axioms. A theorem that only restates its premise is not
counted. Negative-space lines the model cannot express are marked *out of scope by construction*.

| record | file | proved | necessary (counter-deployment) | rests on |
|---|---|---|---|---|
| 001 membership | `P001Membership.lean` | Merkle path sound + complete; sound at fixed depth without domain separation | `no_domain_second_preimage` | H-leaf, H-node, H-domain *or* fixed depth |
| 002 nullifier | `P002Nullifier.lean` | one leaf → one nullifier per context; `nullifier-reused` refused | `unbound_nullifier_unsound`; DNE 1, 3 | H-leaf, spent set |
| 003 transcript | `P003Transcript.lean` | a proof moved to another transcript fails | `digest_reduction_collides` (0 and r give one BN254 scalar) | H-bind |
| 004 holder binding | `P004HolderBinding.lean` | the presenting key is the credential secret's key | `unbound_key_unsound` | H-com |
| 005 distinctness | `P005Distinct.lean` | duplicate unsatisfiable over `Fin n`, **no hypothesis**; k-ary `owners_distinct` | DNE 3 | one value per owner |
| 006 non-revocation | `P006NonRevocation.lean` | sorted adjacent neighbours prove absence | `unsorted_neighbours_unsound`; DNE 1 | H-sorted, 001 ×2 |
| 007 common control | `P007CommonControl.lean` | different secrets unsatisfiable; complete | — | H-com |
| 008 binder | `P008Binder.lean` | one commitment, one taskContext | `visible_value_links` (DNE 1) | H-com |
| 009 hidden equality | `P009HiddenEquality.lean` | `a − b = 0 ↔ a = b` in `Fin n`, **no hypothesis** | — | authenticated openings (enclosing record) |
| 022 digest reference | `P022DigestRef.lean` | a reference names one credential; chain sound unsalted | `two_credential_gap` | H-digest |

## What the proofs changed in the spec

- **001, new issuance requirement:** leaf/node domain separation or a fixed path depth.
- **006, new issuance requirement:** `rl_root` is committed over strictly sorted handles.
- **003:** negative-space line 3 is now exact. The proof binds the reduced scalar; the scalar stands for one
  request only through the digest's collision resistance.
- **002, 004, 022:** the clause that ties two witnesses together (same secret, commitment opening, one
  credential) is shown to be *necessary*. Each counter-deployment is the under-constrained composition bug the
  clause prevents.

## For the circuit gate (G8)

Checks the circom circuits must pass: which of domain separation or fixed depth `nullifier_membership` uses;
that the nullifier and the leaf read one secret signal; that the inverse witness exists for every `a ≠ b` (needs
the prime modulus: Mathlib territory).
