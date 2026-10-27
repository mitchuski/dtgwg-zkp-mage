/-!
# Record 009 — hidden-value equality across credentials

> A verifier learns that a hidden field of one authenticated credential equals a hidden field of
> another authenticated credential … without learning the value.

Clause: `field_a − field_b = 0` — a differing pair is unsatisfiable, neither value public.

* `sub_zero_iff_eq` — over the circuit field `Fin n` (any `n > 0`), `a − b = 0` holds exactly when
  `a = b`: the constraint is equality, both ways, with no primality needed.
* Negative space 1 (common control) and 2 (authenticity) are out of scope by construction: the
  clause compares two witnesses and nothing else.
-/

namespace Formal.Gadgets

/-- **The equality constraint is equality** in `Fin n`. -/
theorem sub_zero_iff_eq (n : Nat) [NeZero n] (a b : Fin n) : a - b = 0 ↔ a = b := by
  constructor
  · intro h
    have hv := congrArg Fin.val h
    rw [Fin.sub_def] at hv
    have e0 : (0 : Fin n).val = 0 := by simp
    simp only [e0] at hv
    apply Fin.ext
    have ha := a.isLt
    have hb := b.isLt
    by_cases hab : b.val ≤ a.val
    · have : n - b.val + a.val = n + (a.val - b.val) := by omega
      rw [this, Nat.add_mod_left, Nat.mod_eq_of_lt (by omega)] at hv
      omega
    · have : n - b.val + a.val < n := by omega
      rw [Nat.mod_eq_of_lt this] at hv
      omega
  · rintro rfl
    apply Fin.ext
    simp

end Formal.Gadgets
