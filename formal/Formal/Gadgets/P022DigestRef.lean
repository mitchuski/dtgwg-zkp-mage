import Formal.Gadgets.P008Binder

/-!
# Record 022 — blinded digest references

> A verifier learns that a digest-valued reference carried by a presented credential names exactly
> the credential the enclosing record's clauses read …

Clause: the reference opens to `(canonical bytes, u)` under the declared digest, **and** the bytes
opened are the bytes the enclosing record's clauses read — one credential, not two.

* `reference_opens_once` — given **H-digest** (`h` injective as a pair), a reference names one
  credential (`reference-mismatch`).
* `two_credential_gap` — **the one-credential clause is necessary**: without it, the reference opens
  to credential 1 while the predicate is evaluated on credential 2, and the proof passes about a
  credential that is not the referenced one.
* `chain_sound_unsalted` — negative space 5: a chain reference re-checked against the presented
  parent is sound with **no** salt (given `h₀` injective); blinding serves enumeration resistance,
  not chain soundness.
* Negative space 3 (route 1 linkability) is record 008's `visible_value_links`.
-/

namespace Formal.Gadgets

variable {B U Ref : Type}

/-- The clause, with `read` the bytes the enclosing record's predicate reads. -/
def RefRel (h : B → U → Ref) (ref : Ref) (read : B) : Prop := ∃ u, h read u = ref

/-- **`reference-mismatch`: a reference names one credential.** -/
theorem reference_opens_once (h : B → U → Ref)
    (hH : ∀ b u b' u', h b u = h b' u' → b = b' ∧ u = u')
    (ref : Ref) (b b' : B) (h₁ : RefRel h ref b) (h₂ : RefRel h ref b') : b = b' := by
  obtain ⟨u, rfl⟩ := h₁
  obtain ⟨u', hu'⟩ := h₂
  exact (hH _ _ _ _ hu').1.symm

/-- **The one-credential clause is necessary.** Opening and predicate checked separately: the
reference opens to bytes `1`, the predicate "bytes = 2" is checked on bytes `2`; both pass, and the
predicate is false of the referenced credential. -/
theorem two_credential_gap :
    let h : Nat → Nat → Nat := fun b u => b + 100 * u
    let pred : Nat → Prop := (· = 2)
    (∃ u, h 1 u = 1) ∧ pred 2 ∧ ¬ pred 1 :=
  ⟨⟨0, rfl⟩, rfl, by decide⟩

/-- **Negative space 5 — chain soundness needs no salt.** If the verifier re-hashes the presented
parent and compares it with the child's unsalted reference, the presented parent is the referenced one. -/
theorem chain_sound_unsalted {D : Type} (h₀ : B → D) (hInj : ∀ b b', h₀ b = h₀ b' → b = b')
    (childRef : D) (referenced presented : B)
    (hRef : h₀ referenced = childRef) (hCheck : h₀ presented = childRef) : presented = referenced :=
  hInj _ _ (hCheck.trans hRef.symm)

end Formal.Gadgets
