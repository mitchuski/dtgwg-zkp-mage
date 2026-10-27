import Formal.Gadgets.P007CommonControl

/-!
# Record 012 — intentional correlation: one controller across k credentials

> A verifier learns that the k credentials in front of it … name identifiers all controlled by the
> presenter, and that none is revoked …

Clause 1: for each pair `(identifier_1, identifier_i)`, i = 2..k, both open to the same `s` — k − 1
common-control clauses sharing one witness. Clause 2 is record 006 per handle (as in 020/021);
clause 3 is record 003.

* `star_to_clique` — given **H-com** and k ≥ 2, the k − 1 clauses against `identifier_1` give common
  control of **every** pair, even if each clause were proven with its own witness. (At k = 1 there
  is no clause, and nothing establishes a secret behind `identifier_1`.)
* `star_without_binding_not_clique` — **H-com is necessary**: with a derivation that is not
  binding, the k − 1 clauses hold and two of the identifiers share no controller. Sharing one
  witness across the clauses — the record's wording — is what carries the statement then.
-/

namespace Formal.R012

open Formal.Gadgets

variable {S Salt Id : Type}

/-- **Star to clique.** -/
theorem star_to_clique (der : S → Salt → Id)
    (hDer : ∀ s a s' a', der s a = der s' a' → s = s' ∧ a = a')
    (id₁ : Id) (ids : List Id) (hk : ids ≠ []) (hstar : ∀ i ∈ ids, CommonControl der id₁ i) :
    ∀ i ∈ id₁ :: ids, ∀ j ∈ id₁ :: ids, CommonControl der i j := by
  -- every identifier of the show opens under the one secret behind id₁
  have hstar' : ∀ i ∈ id₁ :: ids, ∃ s a b, der s a = id₁ ∧ der s b = i := by
    intro i hi
    rcases List.mem_cons.mp hi with rfl | hi
    · cases ids with
      | nil => exact absurd rfl hk
      | cons x xs =>
        obtain ⟨s, a, _, h1, _⟩ := hstar x (List.mem_cons_self ..)
        exact ⟨s, a, a, h1, h1⟩
    · exact hstar i hi
  intro i hi j hj
  obtain ⟨s, a, b, h1, hi'⟩ := hstar' i hi
  obtain ⟨s', a', b', h1', hj'⟩ := hstar' j hj
  have : s = s' := (hDer _ _ _ _ (h1.trans h1'.symm)).1
  subst this
  exact ⟨s, b, b', hi', hj'⟩

/-- A derivation that is not binding: salt `0` gives the same identifier `0` for every secret. -/
def weakDer : Nat → Nat → Nat := fun s a => if a = 0 then 0 else s

/-- **H-com is necessary.** Identifiers `[0, 1, 2]`: `0` is co-controlled with `1` (secret 1) and with
`2` (secret 2), yet `1` and `2` share no controller. -/
theorem star_without_binding_not_clique :
    CommonControl weakDer 0 1 ∧ CommonControl weakDer 0 2 ∧ ¬ CommonControl weakDer 1 2 := by
  refine ⟨⟨1, 0, 1, rfl, rfl⟩, ⟨2, 0, 1, rfl, rfl⟩, ?_⟩
  rintro ⟨s, a, b, ha, hb⟩
  simp only [weakDer] at ha hb
  split at ha <;> split at hb <;> omega

end Formal.R012
