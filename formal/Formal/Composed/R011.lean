import Formal.Gadgets.P004HolderBinding
import Formal.Gadgets.P007CommonControl

/-!
# Record 011 — pairwise edge (VRC possession, directed personas shown, pairwise identifiers hidden)

> A verifier learns that two disclosed persona identifiers (declared `directed`) hold a valid
> relationship credential between them, without learning the pairwise-scope identifiers under it …

Clause 2 (007) links each disclosed persona to its hidden pairwise identifier; clause 3 (004) derives
the presenter's key from the secret behind the pairwise identifier. Composed:

* `key_behind_persona` — given **H-com**, the presenter's key is derived from the secret behind the
  **disclosed persona**, not only the hidden pairwise identifier: the verifier's key check speaks
  about the identifier it can see.
* `persona_linkage_needed` — without clause 2, a key bound to a pairwise identifier says nothing
  about the persona: a counter-deployment where the key is the pairwise secret's and the persona is
  another secret's.

Identifiers are their own commitments here (`der` plays record 004's `com`).
-/

namespace Formal.R011

open Formal.Gadgets

variable {S Salt Ctx K Id : Type}

/-- **The key is the disclosed persona's.** -/
theorem key_behind_persona (prf : S → Ctx → K) (der : S → Salt → Id)
    (hDer : ∀ s a s' a', der s a = der s' a' → s = s' ∧ a = a')
    (persona pairwise : Id) (c : Ctx) (pk : K)
    (hKey : HolderRel prf der pairwise c pk)            -- clause 3 (004)
    (hLink : CommonControl der persona pairwise)         -- clause 2 (007)
    (s : S) (b : Salt) (hs : der s b = persona) : pk = prf s c := by
  obtain ⟨s₁, r₁, hpw, rfl⟩ := hKey
  obtain ⟨s₂, x, y, hpers, hpw'⟩ := hLink
  have h12 : s₁ = s₂ := (hDer _ _ _ _ (hpw.trans hpw'.symm)).1
  have h2s : s₂ = s := (hDer _ _ _ _ (hpers.trans hs.symm)).1
  rw [h12, h2s]

/-- **Clause 2 is necessary.** Pairwise identifier `(1, 0)` (secret 1) carries the key; the persona
`(2, 0)` is secret 2's. The key check passes and the key is not the persona's. -/
theorem persona_linkage_needed :
    let der : Nat → Nat → Nat × Nat := fun s a => (s, a)
    let prf : Nat → Unit → Nat := fun s _ => s
    HolderRel prf der (1, 0) () 1 ∧ ¬ CommonControl der (2, 0) (1, 0) ∧ prf 2 () ≠ 1 := by
  refine ⟨⟨1, 0, rfl, rfl⟩, ?_, by decide⟩
  rintro ⟨s, a, b, ha, hb⟩
  simp only [Prod.mk.injEq] at ha hb
  omega

end Formal.R011
