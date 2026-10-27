/-!
# Record 008 — blinded binder (taskContext hiding; presentation correlation unresolved)

> A verifier that holds a trust-task context learns that the presented credential was issued within
> that exchange, while the credential at rest … carry no plaintext binder.

Clause (route 1): commitment `C` opens to `(taskContext, u)` for the expected exchange.

* `binder_opens_once` — given **H-com**, `C` opens to one taskContext: a credential from another
  exchange is unsatisfiable (`binder-mismatch`).
* `visible_value_links` — negative space 1, the open design requirement: a value shown at
  presentation that depends on the credential alone is equal in every presentation of it, so
  equality correlates them. Hiding the plaintext does not change that. Record 022 route 1 is the
  same theorem.
-/

namespace Formal.Gadgets

variable {Tc U Cm : Type}

/-- The clause. -/
def BinderRel (com : Tc → U → Cm) (c : Cm) (tc : Tc) : Prop := ∃ u, com tc u = c

/-- **`binder-mismatch`: one commitment, one exchange.** -/
theorem binder_opens_once (com : Tc → U → Cm)
    (hCom : ∀ t u t' u', com t u = com t' u' → t = t' ∧ u = u')
    (c : Cm) (tc tc' : Tc) (h : BinderRel com c tc) (h' : BinderRel com c tc') : tc = tc' := by
  obtain ⟨u, rfl⟩ := h
  obtain ⟨u', hu'⟩ := h'
  exact (hCom _ _ _ _ hu').1.symm

/-- **Negative space 1 — disproved.** A shown value that is a function of the credential alone is
the same in any two presentations of that credential, whatever else differs between them. -/
theorem visible_value_links {Cred Pres V : Type} (cred : Pres → Cred) (shown : Cred → V)
    (p q : Pres) (same : cred p = cred q) : shown (cred p) = shown (cred q) := by
  rw [same]

end Formal.Gadgets
