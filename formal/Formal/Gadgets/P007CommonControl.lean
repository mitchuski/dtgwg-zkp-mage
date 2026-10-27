/-!
# Record 007 — common control across identifiers

> A verifier checks that two identifiers … are under one controller, through the selected
> shared-secret derivation relation, while the secret remains private.

Clause: identifier A opens to `(s, salt_A)` and identifier B to `(s, salt_B)` for one and the same
`s` — a different secret behind either identifier is unsatisfiable.

* `distinct_secrets_unsat` — given **H-com** (`der` binding as a pair), if A was minted from `s₁`
  and B from `s₂ ≠ s₁`, no witness exists (`co-control-unproven`).
* `common_control_complete` — completeness: identifiers minted from one secret always satisfy the
  clause. Negative space 1 (one natural person) is out of scope by construction: the clause reads a
  secret, not a person, so two parties sharing it satisfy it alike.
-/

namespace Formal.Gadgets

variable {S Salt Id : Type}

/-- The clause: one secret behind both identifiers. -/
def CommonControl (der : S → Salt → Id) (idA idB : Id) : Prop :=
  ∃ s sa sb, der s sa = idA ∧ der s sb = idB

/-- **A different secret behind either identifier is unsatisfiable.** -/
theorem distinct_secrets_unsat (der : S → Salt → Id)
    (hDer : ∀ s a s' a', der s a = der s' a' → s = s' ∧ a = a')
    (s₁ s₂ : S) (a b : Salt) (hne : s₁ ≠ s₂) :
    ¬ CommonControl der (der s₁ a) (der s₂ b) := by
  rintro ⟨s, sa, sb, hA, hB⟩
  exact hne ((hDer _ _ _ _ hA).1.symm.trans (hDer _ _ _ _ hB).1)

/-- **Completeness.** Two identifiers minted from one secret satisfy the clause. -/
theorem common_control_complete (der : S → Salt → Id) (s : S) (a b : Salt) :
    CommonControl der (der s a) (der s b) :=
  ⟨s, a, b, rfl, rfl⟩

end Formal.Gadgets
