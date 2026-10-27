import Formal.Gadgets.P001Membership
import Formal.Gadgets.P002Nullifier
import Formal.Gadgets.P006NonRevocation

/-!
# Record 025 — secret rotation with enrolment continuity

> The issuing community learns that the presenter holds the secret behind an unrevoked enrolment
> leaf under its current membership root, that this leaf pre-committed to the replacement leaf now
> presented, and the rotation tag of that secret.

Composed from the library: the enrolment leaf `L = com s N r` is a leaf of the community tree
(record 001) whose handle sits between sorted revocation neighbours (record 006); the replacement
`L′` hashes to the pre-rotation digest `N` that `L` carries (clause 3); the rotation tag is
`tag s` (clause 4, record 002's shape). Clause 5 (transcript) is record 003's.

* `soundness` — clauses 1–4: an enrolled, unrevoked leaf whose pre-rotation digest names `L′`.
* `replacement_fixed` — given **H-com** and **H-pre**, one enrolment leaf admits one replacement and
  one tag: a party holding a stolen `s` moves the enrolment only to the leaf the member chose.
* `colliding_predigest_two_replacements` — **H-pre is necessary**: with a colliding digest, one `N`
  names two replacements.
* `second_rotation_refused` — with the spent-tag set, a second rotation from the same secret is
  refused, whichever leaf it opens.
* `rotated_secret_retired` / `rotated_leaf_still_member` — does-not-establish 3: membership alone
  still accepts a rotated-away leaf (the tree is append-only); the issuance clause "tag absent from
  the spent-tag set" is what retires it.
* `tag_not_nullifier` — issuance 3: with the rotation context distinct from every presentation
  context and **H-prf**, a rotation tag never equals a presentation nullifier.
* `straddling_epoch_two_nullifiers` / `next_epoch_one_nullifier` — does-not-establish 4 and its
  default: a context epoch spanning the rotation sees two nullifiers; gating `s′` to the next epoch
  leaves one live secret per epoch.

Unlinkability (batch anonymity, timing) and the PRF's pseudorandomness are computational claims,
outside this model.
-/

namespace Formal.R025

open Formal.Gadgets

variable {S Dg Rn L D T : Type}

/-- Clauses 1–4. `com` is the leaf commitment, `hpre` the pre-rotation hash, `tag` the rotation
PRF at the profile's rotation context, `handleOf` the leaf's membership handle. -/
def Rotates (com : S → Dg → Rn → L) (hl : L → D) (hn : D → D → D) (hpre : L → Dg) (tag : S → T)
    (handleOf : L → Nat) (tree : MTree L) (rl : List Nat) (L' : L) (t : T) : Prop :=
  ∃ s N r p pre lo hi post,
    pathRoot hn p (hl (com s N r)) = tree.root hl hn ∧
    rl = pre ++ lo :: hi :: post ∧ lo < handleOf (com s N r) ∧ handleOf (com s N r) < hi ∧
    hpre L' = N ∧ tag s = t

/-- **Soundness (clauses 1–4).** The presenter's leaf is enrolled, its handle is not revoked, its
pre-rotation digest names the replacement presented, and the tag is its secret's. -/
theorem soundness (com : S → Dg → Rn → L) (hl : L → D) (hn : D → D → D) (hpre : L → Dg)
    (tag : S → T) (handleOf : L → Nat) (tree : MTree L) (rl : List Nat) (L' : L) (t : T)
    (hLeaf : ∀ a b, hl a = hl b → a = b)
    (hNode : ∀ x y x' y', hn x y = hn x' y' → x = x' ∧ y = y')
    (hDomain : ∀ a x y, hl a ≠ hn x y) (hSorted : Sorted rl)
    (hRot : Rotates com hl hn hpre tag handleOf tree rl L' t) :
    ∃ s N r, com s N r ∈ tree.leaves ∧ handleOf (com s N r) ∉ rl ∧ hpre L' = N ∧ tag s = t := by
  obtain ⟨s, N, r, p, pre, lo, hi, post, hp, hrl, hlo, hhi, hN, ht⟩ := hRot
  subst hrl
  exact ⟨s, N, r, path_sound hl hn hLeaf hNode hDomain _ tree p hp,
    neighbours_sound pre post lo hi _ hSorted hlo hhi, hN, ht⟩

/-- **One leaf, one replacement, one tag.** Two rotations that open the same enrolment leaf present
the same replacement and the same tag. -/
theorem replacement_fixed (com : S → Dg → Rn → L) (hpre : L → Dg) (tag : S → T)
    (hCom : ∀ s N r s' N' r', com s N r = com s' N' r' → s = s' ∧ N = N' ∧ r = r')
    (hPre : ∀ a b, hpre a = hpre b → a = b)
    (s₁ s₂ : S) (N₁ N₂ : Dg) (r₁ r₂ : Rn) (L₁ L₂ : L)
    (hsame : com s₁ N₁ r₁ = com s₂ N₂ r₂) (h₁ : hpre L₁ = N₁) (h₂ : hpre L₂ = N₂) :
    L₁ = L₂ ∧ tag s₁ = tag s₂ := by
  obtain ⟨hs, hN, _⟩ := hCom _ _ _ _ _ _ hsame
  exact ⟨hPre _ _ (h₁.trans (hN.trans h₂.symm)), by rw [hs]⟩

/-- **H-pre is necessary.** With a pre-rotation hash that collides (`fun _ => 0`), the digest `0`
names both replacements `2` and `3`. -/
theorem colliding_predigest_two_replacements :
    let hpre : Nat → Nat := fun _ => 0
    hpre 2 = 0 ∧ hpre 3 = 0 ∧ (2 : Nat) ≠ 3 := by
  decide

/-- **`rotation-tag-spent`.** Once a rotation's tag is accepted, any rotation from the same secret
— through whichever leaf it opens — repeats the tag and is refused. -/
theorem second_rotation_refused [DecidableEq T] (tag : S → T) (s : S) (st st' : Spent T) (b : Bool)
    (hacc : st.present (tag s) true = some st') : st'.present (tag s) b = none :=
  replay_refused st st' (tag s) true b hacc

/-- **Membership alone does not retire the old secret.** After admission the append-only tree holds
both the rotated-away leaf `1` and its replacement `2`; a path for `1` still recomputes the root. -/
theorem rotated_leaf_still_member (hl : Nat → Nat) (hn : Nat → Nat → Nat) :
    let t : MTree Nat := .node (.leaf 1) (.leaf 2)
    pathRoot hn [(false, hl 2)] (hl 1) = t.root hl hn ∧ 1 ∈ t.leaves ∧ 2 ∈ t.leaves := by
  refine ⟨rfl, ?_, ?_⟩ <;> simp [MTree.leaves]

/-- **The issuance clause retires it.** Where a presentation requires its secret's rotation tag to be
absent from the spent-tag set, a secret whose rotation was admitted no longer presents. -/
theorem rotated_secret_retired (tag : S → T) (spentTags : List T) (s : S)
    (hadmitted : tag s ∈ spentTags) : ¬ (tag s ∉ spentTags) :=
  fun h => h hadmitted

/-- **A rotation tag is never a presentation nullifier** (issuance 3), given **H-prf** (the PRF is
collision-free over (secret, context)) and a rotation context outside every presentation context. -/
theorem tag_not_nullifier {Ctx : Type} (prf : S → Ctx → T)
    (hPrf : ∀ s c s' c', prf s c = prf s' c' → s = s' ∧ c = c')
    (rotCtx c : Ctx) (hctx : rotCtx ≠ c) (s s' : S) : prf s rotCtx ≠ prf s' c :=
  fun h => hctx (hPrf _ _ _ _ h).2

/-- **Does-not-establish 4.** In one context epoch spanning the rotation, secret `1` and its
replacement secret `2` give two nullifiers, and both presentations pass. -/
theorem straddling_epoch_two_nullifiers :
    let nf : Nat → Unit → Unit → Nat := fun s _ _ => s
    NullifierRel id nf 1 () () 1 ∧ NullifierRel id nf 2 () () 2 ∧ (1 : Nat) ≠ 2 :=
  ⟨⟨1, rfl, rfl⟩, ⟨2, rfl, rfl⟩, by decide⟩

/-- The default rule: `s` is live through context epoch `eLast`, `s′` only after it. -/
def LiveAt (s s' : S) (eLast e : Nat) (x : S) : Prop :=
  (x = s ∧ e ≤ eLast) ∨ (x = s' ∧ eLast < e)

/-- **The next-epoch default restores one nullifier per context epoch**: any two secrets live in the
same epoch give the same nullifier there. -/
theorem next_epoch_one_nullifier {C N : Type} (nf : S → C → Nat → N) (s s' : S) (eLast e : Nat)
    (c : C) (x y : S) (hx : LiveAt s s' eLast e x) (hy : LiveAt s s' eLast e y) :
    nf x c e = nf y c e := by
  rcases hx with ⟨rfl, h₁⟩ | ⟨rfl, h₁⟩ <;> rcases hy with ⟨rfl, h₂⟩ | ⟨rfl, h₂⟩ <;>
    first | rfl | (exfalso; omega)

end Formal.R025
