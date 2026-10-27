import Formal.Gadgets.Spent

/-!
# Record 003 — transcript binding

> A verifier checks that the proof binds the supplied transcript scalar. Interpreting that scalar
> as this authenticated request also requires the profile's canonical encoding, digest conversion,
> audience and freshness checks.

Clause: the public signals include `transcriptDigest` and the circuit constrains it.

* `swap_fails` — given **H-bind** (a verifying proof was made for the scalar it verifies against:
  the proof system's soundness with the scalar as a public input), a proof moved to another
  transcript fails.
* `digest_reduction_collides` — the scalar is a 256-bit digest reduced mod the BN254 scalar prime
  `r`: two different digests (`0` and `r`) give one scalar. The proof binds the **scalar**; that
  the scalar stands for one request rests on the digest's collision resistance over ~254 bits —
  the formal content of negative-space line 3.
* Negative space 5 (reuse without a replay policy) is out of scope by construction: verification is
  a function of (proof, transcript). The remedy is a verifier spent set — `Spent.lean`, `replay_refused`.
-/

namespace Formal.Gadgets

variable {Pf T : Type}

/-- **Swap fails.** -/
theorem swap_fails (verify : Pf → T → Bool) (madeFor : Pf → T)
    (hBind : ∀ π t, verify π t = true → madeFor π = t)
    (π : Pf) (t t' : T) (hmade : madeFor π = t) (hne : t' ≠ t) : verify π t' = false := by
  cases h : verify π t' with
  | false => rfl
  | true => exact absurd ((hBind π t' h).symm.trans hmade) hne

/-- The BN254 scalar field prime. -/
def bn254r : Nat := 21888242871839275222246405745257275088548364400416034343698204186575808495617

/-- **The digest-to-scalar reduction is not injective on 256-bit digests.** -/
theorem digest_reduction_collides :
    (0 : Nat) < 2 ^ 256 ∧ bn254r < 2 ^ 256 ∧ (0 : Nat) ≠ bn254r ∧ 0 % bn254r = bn254r % bn254r := by
  refine ⟨by decide, by decide, by decide, ?_⟩
  simp [Nat.mod_self]

end Formal.Gadgets
