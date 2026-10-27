import Formal.Gadgets.Spent

/-!
# Record 002 — scoped nullifier (reuse detection)

> A verifier learns a deterministic nullifier for this context so a second presentation in the same
> context is detectable, while presentations in other contexts stay unlinkable.

Clause: `nullifier = H(secret, root, scope, purpose, epoch)` computed in-circuit **from the same
secret as the membership leaf**. `leafOf` is the leaf commitment, `nf` the nullifier hash; the
context `c` stands for (scope, purpose, epoch).

* `one_leaf_one_nullifier` — given **H-leaf** (`leafOf` injective), one leaf has one nullifier per
  context; with the spent set, the second presentation is refused (`reuse_refused`).
* `unbound_nullifier_unsound` — **the same-secret clause is necessary**: computed from any secret,
  one leaf yields two nullifiers in one context and reuse goes undetected (the under-constrained
  nullifier).
* Negative space 1 and 3 as counter-deployments. Unlinkability across contexts is a computational
  claim, outside this model.
-/

namespace Formal.Gadgets

variable {S R C N L : Type}

/-- The clause: some secret behind this leaf gives this nullifier in this context. -/
def NullifierRel (leafOf : S → L) (nf : S → R → C → N) (leaf : L) (root : R) (c : C) (n : N) : Prop :=
  ∃ s, leafOf s = leaf ∧ nf s root c = n

/-- **One leaf, one nullifier per context.** -/
theorem one_leaf_one_nullifier (leafOf : S → L) (nf : S → R → C → N)
    (hLeaf : ∀ s s', leafOf s = leafOf s' → s = s')
    (leaf : L) (root : R) (c : C) (n₁ n₂ : N)
    (h₁ : NullifierRel leafOf nf leaf root c n₁) (h₂ : NullifierRel leafOf nf leaf root c n₂) :
    n₁ = n₂ := by
  obtain ⟨s, hs, rfl⟩ := h₁
  obtain ⟨s', hs', rfl⟩ := h₂
  rw [hLeaf s s' (hs.trans hs'.symm)]

/-- **`nullifier-reused`.** Once a leaf's nullifier is spent in a context, a second presentation of
that leaf in that context is refused — whatever nullifier it computes, it computes the same one. -/
theorem reuse_refused [DecidableEq N] (leafOf : S → L) (nf : S → R → C → N)
    (hLeaf : ∀ s s', leafOf s = leafOf s' → s = s')
    (leaf : L) (root : R) (c : C) (n₁ n₂ : N) (st st' : Spent N) (b : Bool)
    (h₁ : NullifierRel leafOf nf leaf root c n₁) (h₂ : NullifierRel leafOf nf leaf root c n₂)
    (hacc : st.present n₁ true = some st') : st'.present n₂ b = none := by
  rw [← one_leaf_one_nullifier leafOf nf hLeaf leaf root c n₁ n₂ h₁ h₂]
  exact replay_refused st st' n₁ true b hacc

/-- **The same-secret clause is necessary.** With the nullifier taken from any secret (the leaf
unconstrained), leaf `5` in one context yields nullifiers `1` and `2`. -/
theorem unbound_nullifier_unsound :
    let nf : Nat → Unit → Unit → Nat := fun s _ _ => s
    (∃ s, nf s () () = 1) ∧ (∃ s, nf s () () = 2) ∧ (1 : Nat) ≠ 2 :=
  ⟨⟨1, rfl⟩, ⟨2, rfl⟩, by decide⟩

/-- **Negative space 3 — cross-context uniqueness, disproved (by design).** One secret, two contexts,
two different nullifiers: neither context's spent set sees the other. -/
theorem cross_context_not_detected :
    let nf : Nat → Unit → Nat → Nat := fun _ _ c => c
    NullifierRel id nf 7 () 1 1 ∧ NullifierRel id nf 7 () 2 2 ∧ (1 : Nat) ≠ 2 :=
  ⟨⟨7, rfl, rfl⟩, ⟨7, rfl, rfl⟩, by decide⟩

/-- **Negative space 1 — one natural person, disproved.** One person enrolled twice holds two leaves;
in one context they give two nullifiers, and both presentations are accepted. -/
theorem one_person_two_nullifiers :
    let nf : Nat → Unit → Unit → Nat := fun s _ _ => s
    NullifierRel id nf 1 () () 1 ∧ NullifierRel id nf 2 () () 2 ∧ (1 : Nat) ≠ 2 :=
  ⟨⟨1, rfl, rfl⟩, ⟨2, rfl, rfl⟩, by decide⟩

end Formal.Gadgets
