import Formal.Gadgets.P001Membership
import Formal.Gadgets.P002Nullifier
import Formal.Gadgets.P006NonRevocation
import Formal.Gadgets.P022DigestRef
import Formal.Composed.R010
import Formal.Composed.R011
import Formal.Composed.R012
import Formal.Composed.R013
import Formal.Composed.R025
import Formal.R023.Soundness
import Formal.R024.Soundness
import Formal.Chains.Records

/-!
# Review witness — non-vacuity of the soundness theorems

Review witness; not a new construction root, not a repaired model, not cited by `Checks.lean`.

For each main soundness-style theorem, a concrete deployment is built (types, hash functions,
trees, revocation lists, witnesses) such that **every hash/sorting hypothesis holds and the main
premise (`Accepts`, `Rotates`, `Counts`, …) holds**. Each `*_nonvacuous` theorem states the
hypotheses and the premise as one conjunction; each `*_applied` theorem then applies the target
theorem to that data — the application itself must supply every argument, so it type-checks only
because the theorem is not vacuously true.

Hashes are free constructors (`Dig.lf` for leaves, `Dig.nd` for nodes): injective and
domain-separated by construction, as in `review/R013Binding.lean`. Trees have two leaves, the
revocation list `[1, 5, 9]` is non-empty, and multi-element lists are used for k-ary records.

## Findings

No target is vacuous: every hypothesis set is jointly satisfiable with its premise, non-degenerately
(two-leaf trees, three-entry revocation lists, k = 2, chains of two hops, infinite carrier types).
Observations recorded for the working group (not vacuity):

* N1 (P002 `one_leaf_one_nullifier`, P022 `reference_opens_once`, R025 `replacement_fixed`): these
  are uniqueness theorems, so their two premises are necessarily witnessed with equal outputs —
  that is the theorem's content, not degeneracy. The hypotheses themselves are witnessed on
  infinite types with injective, non-trivial functions.
* N2 (Chains): `VHop.sigOK` is a `Prop` field carried in the prover-side structure, so "H-sig"
  is witnessed by setting it to `True`; the model does not tie it to any signature function.
  Non-vacuity holds; whether the field is a faithful stand-in for signature verification is a
  modelling question, not checked here.
* N3 (R024): witnessed with the applicant holding a class credential (secret `aSec = 0`), so
  H-applicant is exercised non-vacuously (not only the first-time-joiner case), and H-stable is
  exercised across two live labels.
-/

namespace Review.NonVacuity

open Formal.Gadgets

/-! ## Shared free digest -/

/-- Free digests over leaf type `α`: `lf` hashes a leaf, `nd` hashes two children. -/
inductive Dig (α : Type) where
  | lf : α → Dig α
  | nd : Dig α → Dig α → Dig α

theorem lf_inj {α : Type} : ∀ a b : α, Dig.lf a = Dig.lf b → a = b := by
  intro a b h; cases h; rfl

theorem nd_inj {α : Type} :
    ∀ x y x' y' : Dig α, Dig.nd x y = Dig.nd x' y' → x = x' ∧ y = y' := by
  intro x y x' y' h; cases h; exact ⟨rfl, rfl⟩

theorem lf_ne_nd {α : Type} : ∀ (a : α) (x y : Dig α), Dig.lf a ≠ Dig.nd x y := by
  intro a x y h; cases h

/-- A two-leaf membership tree. -/
def tree2 : MTree Nat := .node (.leaf 10) (.leaf 20)

/-- The path for leaf `10` (left child; sibling `lf 20`). -/
def path10 : List (Bool × Dig Nat) := [(false, .lf 20)]
/-- The path for leaf `20` (right child; sibling `lf 10`). -/
def path20 : List (Bool × Dig Nat) := [(true, .lf 10)]

theorem path10_ok : pathRoot Dig.nd path10 (Dig.lf 10) = tree2.root Dig.lf Dig.nd := rfl
theorem path20_ok : pathRoot Dig.nd path20 (Dig.lf 20) = tree2.root Dig.lf Dig.nd := rfl

/-- A non-empty revocation list. -/
def revoked : List Nat := [1, 5, 9]

theorem revoked_sorted : Sorted revoked := by unfold Sorted revoked; decide

/-! ## P001 `path_sound` -/

theorem P001_path_sound_nonvacuous :
    (∀ a b : Nat, Dig.lf a = Dig.lf b → a = b) ∧
    (∀ x y x' y' : Dig Nat, Dig.nd x y = Dig.nd x' y' → x = x' ∧ y = y') ∧
    (∀ (a : Nat) x y, Dig.lf a ≠ Dig.nd x y) ∧
    pathRoot Dig.nd path20 (Dig.lf 20) = tree2.root Dig.lf Dig.nd :=
  ⟨lf_inj, nd_inj, lf_ne_nd, path20_ok⟩

theorem P001_path_sound_applied : (20 : Nat) ∈ tree2.leaves :=
  path_sound Dig.lf Dig.nd lf_inj nd_inj lf_ne_nd 20 tree2 path20 path20_ok

/-! ## P002 `one_leaf_one_nullifier` -/

/-- Nullifier over (secret, root, context). -/
def nf2 (s r c : Nat) : Nat := 1000 * s + 10 * r + c

theorem P002_one_leaf_one_nullifier_nonvacuous :
    (∀ s s' : Nat, id s = id s' → s = s') ∧
    NullifierRel id nf2 7 3 1 7031 ∧ NullifierRel id nf2 7 3 1 7031 :=
  ⟨fun _ _ h => h, ⟨7, rfl, rfl⟩, ⟨7, rfl, rfl⟩⟩

theorem P002_one_leaf_one_nullifier_applied : (7031 : Nat) = 7031 :=
  one_leaf_one_nullifier id nf2 (fun _ _ h => h) 7 3 1 7031 7031 ⟨7, rfl, rfl⟩ ⟨7, rfl, rfl⟩

/-! ## P006 `neighbours_sound` -/

theorem P006_neighbours_sound_nonvacuous :
    Sorted ([1] ++ 5 :: 9 :: []) ∧ 5 < 6 ∧ 6 < 9 :=
  ⟨by unfold Sorted; decide, by decide, by decide⟩

theorem P006_neighbours_sound_applied : (6 : Nat) ∉ [1] ++ 5 :: 9 :: [] :=
  neighbours_sound [1] [] 5 9 6 P006_neighbours_sound_nonvacuous.1 (by decide) (by decide)

/-! ## P022 `reference_opens_once` -/

def h22 : Nat → Nat → Nat × Nat := Prod.mk

theorem h22_inj : ∀ b u b' u', h22 b u = h22 b' u' → b = b' ∧ u = u' := by
  intro b u b' u' h; exact Prod.mk.inj h

theorem P022_reference_opens_once_nonvacuous :
    (∀ b u b' u', h22 b u = h22 b' u' → b = b' ∧ u = u') ∧
    RefRel h22 (5, 42) 5 ∧ RefRel h22 (5, 42) 5 :=
  ⟨h22_inj, ⟨42, rfl⟩, ⟨42, rfl⟩⟩

theorem P022_reference_opens_once_applied : (5 : Nat) = 5 :=
  reference_opens_once h22 h22_inj (5, 42) 5 5 ⟨42, rfl⟩ ⟨42, rfl⟩

/-! ## R010 `soundness` -/

section R010
open Formal.R010

abbrev Id2 := Nat × Nat

/-- Identifier derivation: free pair (secret, salt). -/
def der : Nat → Nat → Id2 := Prod.mk

theorem der_inj : ∀ s a s' a', der s a = der s' a' → s = s' ∧ a = a' := by
  intro s a s' a' h; exact Prod.mk.inj h

def C10 : Community Nat Id2 :=
  { tree := tree2, revoked := revoked, vrcs := [((1, 0), (7, 0)), ((2, 0), (8, 0))] }

def w10 : Witness Nat (Dig Nat) Id2 :=
  { leafP := 10, leafV := 20, pathP := path10, pathV := path20,
    vrcIssuer := (1, 0), presenterKey := (7, 0),
    presenterVrcId := (7, 0), presenterGrantId := (7, 1),
    handles := [⟨3, [], 1, 5, [9]⟩, ⟨6, [1], 5, 9, []⟩, ⟨7, [1], 5, 9, []⟩] }

theorem R010_accepts : Accepts C10 Dig.lf Dig.nd der w10 := by
  refine ⟨by decide, path10_ok, path20_ok, ⟨7, 0, 1, rfl, rfl⟩, by decide, ?_⟩
  intro x hx
  simp only [w10, List.mem_cons, List.mem_nil_iff, or_false] at hx
  rcases hx with rfl | rfl | rfl <;> exact ⟨rfl, by decide, by decide⟩

theorem R010_soundness_nonvacuous :
    (∀ a b : Nat, Dig.lf a = Dig.lf b → a = b) ∧
    (∀ x y x' y' : Dig Nat, Dig.nd x y = Dig.nd x' y' → x = x' ∧ y = y') ∧
    (∀ (a : Nat) x y, Dig.lf a ≠ Dig.nd x y) ∧ Sorted C10.revoked ∧
    Accepts C10 Dig.lf Dig.nd der w10 :=
  ⟨lf_inj, nd_inj, lf_ne_nd, revoked_sorted, R010_accepts⟩

theorem R010_soundness_applied :
    w10.leafP ∈ C10.tree.leaves ∧ w10.leafV ∈ C10.tree.leaves ∧ w10.leafP ≠ w10.leafV ∧
      (w10.vrcIssuer, w10.presenterKey) ∈ C10.vrcs ∧
      CommonControl der w10.presenterVrcId w10.presenterGrantId ∧
      (∀ x ∈ w10.handles, x.h ∉ C10.revoked) :=
  soundness C10 Dig.lf Dig.nd der w10 lf_inj nd_inj lf_ne_nd revoked_sorted R010_accepts

end R010

/-! ## R011 `key_behind_persona` -/

section R011
open Formal.R011

def prf11 (s c : Nat) : Nat := 100 * s + c

theorem R011_key_behind_persona_nonvacuous :
    (∀ s a s' a', der s a = der s' a' → s = s' ∧ a = a') ∧
    HolderRel prf11 der (7, 1) 3 703 ∧ CommonControl der (7, 0) (7, 1) ∧ der 7 0 = (7, 0) :=
  ⟨der_inj, ⟨7, 1, rfl, rfl⟩, ⟨7, 0, 1, rfl, rfl⟩, rfl⟩

theorem R011_key_behind_persona_applied : (703 : Nat) = prf11 7 3 :=
  key_behind_persona prf11 der der_inj (7, 0) (7, 1) 3 703
    ⟨7, 1, rfl, rfl⟩ ⟨7, 0, 1, rfl, rfl⟩ 7 0 rfl

end R011

/-! ## R012 `star_to_clique` -/

section R012
open Formal.R012

def ids12 : List Id2 := [(7, 1), (7, 2)]

theorem R012_star : ∀ i ∈ ids12, CommonControl der (7, 0) i := by
  intro i hi
  simp only [ids12, List.mem_cons, List.mem_nil_iff, or_false] at hi
  rcases hi with rfl | rfl
  · exact ⟨7, 0, 1, rfl, rfl⟩
  · exact ⟨7, 0, 2, rfl, rfl⟩

theorem R012_star_to_clique_nonvacuous :
    (∀ s a s' a', der s a = der s' a' → s = s' ∧ a = a') ∧ ids12 ≠ [] ∧
    (∀ i ∈ ids12, CommonControl der (7, 0) i) :=
  ⟨der_inj, by decide, R012_star⟩

theorem R012_star_to_clique_applied :
    ∀ i ∈ ((7, 0) : Id2) :: ids12, ∀ j ∈ ((7, 0) : Id2) :: ids12, CommonControl der i j :=
  star_to_clique der der_inj (7, 0) ids12 (by decide) R012_star

end R012

/-! ## R013 `soundness` -/

section R013
open Formal.R013

abbrev L13 := Sum (Form Bool) Nat

def hl13 (f : Form Bool) : Dig L13 := .lf (.inl f)
def hm13 (n : Nat) : Dig L13 := .lf (.inr n)

def policy13 : MTree (Form Bool) := .node (.leaf ⟨true, true⟩) (.leaf ⟨false, false⟩)
def own13 : MTree Nat := .node (.leaf 10) (.leaf 20)
def form13 : Form Bool := ⟨true, true⟩
def pPolicy13 : List (Bool × Dig L13) := [(false, hl13 ⟨false, false⟩)]
def pOwn13 : List (Bool × Dig L13) := [(true, hm13 10)]

theorem hl13_inj : ∀ a b, hl13 a = hl13 b → a = b := by intro a b h; cases h; rfl
theorem hm13_inj : ∀ a b, hm13 a = hm13 b → a = b := by intro a b h; cases h; rfl
theorem hl13_dom : ∀ a x y, hl13 a ≠ Dig.nd x y := by intro a x y h; cases h
theorem hm13_dom : ∀ a x y, hm13 a ≠ Dig.nd x y := by intro a x y h; cases h

/-- Membership is claimed (`form13.member = true`), so the own-tree clause is exercised. -/
theorem R013_accepts :
    Accepts h22 hl13 Dig.nd hm13 policy13 own13 (h22 99 4) 99 4 form13 20 pPolicy13 pOwn13 :=
  ⟨rfl, rfl, fun _ => rfl⟩

theorem R013_soundness_nonvacuous :
    (∀ b u b' u', h22 b u = h22 b' u' → b = b' ∧ u = u') ∧
    (∀ a b, hl13 a = hl13 b → a = b) ∧ (∀ a b, hm13 a = hm13 b → a = b) ∧
    (∀ x y x' y' : Dig L13, Dig.nd x y = Dig.nd x' y' → x = x' ∧ y = y') ∧
    (∀ a x y, hl13 a ≠ Dig.nd x y) ∧ (∀ a x y, hm13 a ≠ Dig.nd x y) ∧
    form13.member = true ∧
    Accepts h22 hl13 Dig.nd hm13 policy13 own13 (h22 99 4) 99 4 form13 20 pPolicy13 pOwn13 :=
  ⟨h22_inj, hl13_inj, hm13_inj, nd_inj, hl13_dom, hm13_dom, rfl, R013_accepts⟩

theorem R013_soundness_applied :
    (∀ b', RefRel h22 (h22 99 4) b' → b' = 99) ∧ form13 ∈ policy13.leaves ∧
      (form13.member = true → (20 : Nat) ∈ own13.leaves) :=
  soundness h22 hl13 Dig.nd hm13 policy13 own13 (h22 99 4) 99 4 form13 20 pPolicy13 pOwn13
    h22_inj hl13_inj hm13_inj nd_inj hl13_dom hm13_dom R013_accepts

end R013

/-! ## R025 `soundness` and `replacement_fixed` -/

section R025
open Formal.R025

/-- Leaves are (secret, pre-rotation digest, randomness); digests are lists. -/
abbrev L25 := Nat × List Nat × Nat

def com25 (s : Nat) (N : List Nat) (r : Nat) : L25 := (s, N, r)
def hpre25 : L25 → List Nat
  | (s, N, r) => s :: r :: N
def tag25 (s : Nat) : Nat := s + 100
def handle25 (l : L25) : Nat := l.1 + 1

/-- The replacement leaf (secret 8) and the enrolled leaf (secret 7) pre-committing to it. -/
def L'25 : L25 := (8, [], 0)
def N25 : List Nat := hpre25 L'25
def enrolled25 : L25 := com25 7 N25 1
def tree25 : MTree L25 := .node (.leaf enrolled25) (.leaf (3, [], 0))
def path25 : List (Bool × Dig L25) := [(false, .lf (3, [], 0))]

theorem com25_inj :
    ∀ s N r s' N' r', com25 s N r = com25 s' N' r' → s = s' ∧ N = N' ∧ r = r' := by
  intro s N r s' N' r' h
  simp only [com25, Prod.mk.injEq] at h
  exact h

theorem hpre25_inj : ∀ a b, hpre25 a = hpre25 b → a = b := by
  intro ⟨s, N, r⟩ ⟨s', N', r'⟩ h
  simp only [hpre25, List.cons.injEq] at h
  obtain ⟨rfl, rfl, rfl⟩ := h
  rfl

/-- Handle `8` sits between neighbours `5` and `9` of `[1, 5, 9]`. -/
theorem R025_rotates :
    Rotates com25 Dig.lf Dig.nd hpre25 tag25 handle25 tree25 revoked L'25 107 :=
  ⟨7, N25, 1, path25, [1], 5, 9, [], rfl, rfl, by decide, by decide, rfl, rfl⟩

theorem R025_soundness_nonvacuous :
    (∀ a b : L25, Dig.lf a = Dig.lf b → a = b) ∧
    (∀ x y x' y' : Dig L25, Dig.nd x y = Dig.nd x' y' → x = x' ∧ y = y') ∧
    (∀ (a : L25) x y, Dig.lf a ≠ Dig.nd x y) ∧ Sorted revoked ∧
    Rotates com25 Dig.lf Dig.nd hpre25 tag25 handle25 tree25 revoked L'25 107 :=
  ⟨lf_inj, nd_inj, lf_ne_nd, revoked_sorted, R025_rotates⟩

theorem R025_soundness_applied :
    ∃ s N r, com25 s N r ∈ tree25.leaves ∧ handle25 (com25 s N r) ∉ revoked ∧
      hpre25 L'25 = N ∧ tag25 s = 107 :=
  soundness com25 Dig.lf Dig.nd hpre25 tag25 handle25 tree25 revoked L'25 107
    lf_inj nd_inj lf_ne_nd revoked_sorted R025_rotates

theorem R025_replacement_fixed_nonvacuous :
    (∀ s N r s' N' r', com25 s N r = com25 s' N' r' → s = s' ∧ N = N' ∧ r = r') ∧
    (∀ a b, hpre25 a = hpre25 b → a = b) ∧
    com25 7 N25 1 = com25 7 N25 1 ∧ hpre25 L'25 = N25 ∧ hpre25 L'25 = N25 :=
  ⟨com25_inj, hpre25_inj, rfl, rfl, rfl⟩

theorem R025_replacement_fixed_applied : L'25 = L'25 ∧ tag25 7 = tag25 7 :=
  replacement_fixed com25 hpre25 tag25 com25_inj hpre25_inj 7 7 N25 N25 1 1 L'25 L'25 rfl rfl rfl

end R025

/-! ## R023 `soundness` -/

section R023
open Formal.R023

/-- Members `0, 1, 2`; member `m` has grant leaf `10 (m+1)`, grant id `(m+1, 1)`, handle `3m + 3`. -/
def C23 : Community Nat Id2 Nat :=
  { grantLeaf := fun m => 10 * (m + 1)
    grantId := fun m => (m + 1, 1)
    handle := fun m => 3 * m + 3
    tree := tree2
    revoked := revoked
    vrcs := [((1, 0), (50, 0)), ((2, 0), (50, 0))] }

def adm23 : Id2 := (50, 0)

def ws23 : List (Vouch Nat Id2 (Dig Nat)) :=
  [⟨0, path10, [], 1, 5, [9], (1, 0), (50, 0)⟩,
   ⟨1, path20, [1], 5, 9, [], (2, 0), (50, 0)⟩]

theorem R023_accepts : Accepts C23 Dig.lf Dig.nd der adm23 2 ws23 := by
  refine ⟨?_, by decide, by decide⟩
  intro w hw
  simp only [ws23, List.mem_cons, List.mem_nil_iff, or_false] at hw
  rcases hw with rfl | rfl
  · exact ⟨rfl, rfl, by decide, by decide, by decide, ⟨1, 0, 1, rfl, rfl⟩, Or.inl rfl⟩
  · exact ⟨rfl, rfl, by decide, by decide, by decide, ⟨2, 0, 1, rfl, rfl⟩, Or.inl rfl⟩

theorem R023_soundness_nonvacuous :
    (∀ a b : Nat, Dig.lf a = Dig.lf b → a = b) ∧
    (∀ x y x' y' : Dig Nat, Dig.nd x y = Dig.nd x' y' → x = x' ∧ y = y') ∧
    (∀ (a : Nat) x y, Dig.lf a ≠ Dig.nd x y) ∧ Sorted C23.revoked ∧
    Accepts C23 Dig.lf Dig.nd der adm23 2 ws23 :=
  ⟨lf_inj, nd_inj, lf_ne_nd, revoked_sorted, R023_accepts⟩

theorem R023_soundness_applied : Statement C23 der adm23 2 :=
  soundness C23 Dig.lf Dig.nd der adm23 2 ws23 lf_inj nd_inj lf_ne_nd revoked_sorted R023_accepts

end R023

/-! ## R024 `soundness` and `completeness` -/

section R024
open Formal.R024

/-- Labels `0, 1` live; every member `m` holds secret `100 m` under both (H-stable across labels).
The applicant is member `0`, whose secret is `aSec = 0`. -/
def D24 : Deployment Nat Nat Nat Nat (Nat × Nat) :=
  { cred := fun m L => if L ≤ 1 then some (100 * m) else none
    live := fun L => L ≤ 1
    tag := fun s a => (s, a) }

def tags24 : List (Nat × Nat) := [(100, 9), (200, 9)]

theorem D24_stable : SecretStable D24 := by
  intro m L L' s s' h h'
  simp only [D24] at h h'
  split at h <;> split at h' <;> simp_all

theorem D24_applicant : ApplicantSecret D24 0 0 := by
  intro L s h
  simp only [D24] at h
  split at h
  · simp at h; omega
  · cases h

theorem D24_counts : Counts D24 0 9 tags24 2 := by
  refine ⟨?_, by decide, by decide⟩
  intro t ht
  simp only [tags24, List.mem_cons, List.mem_nil_iff, or_false] at ht
  rcases ht with rfl | rfl
  · exact ⟨1, 1, 100, Nat.le_refl 1, rfl, rfl, by decide⟩
  · exact ⟨2, 0, 200, Nat.zero_le 1, rfl, rfl, by decide⟩

/-- The applicant really holds a credential (H-applicant is not vacuous here). -/
theorem D24_applicant_holds : D24.cred 0 1 = some 0 := rfl

theorem R024_soundness_nonvacuous :
    SecretStable D24 ∧ ApplicantSecret D24 0 0 ∧ D24.cred 0 1 = some 0 ∧
    Counts D24 0 9 tags24 2 :=
  ⟨D24_stable, D24_applicant, rfl, D24_counts⟩

theorem R024_soundness_applied : Statement D24 0 9 tags24 2 :=
  soundness D24 0 0 9 tags24 2 D24_stable D24_applicant D24_counts

theorem D24_fresh : SecretFresh D24 1 := by
  intro m m' s h h'
  simp only [D24] at h h'
  split at h
  · simp at h h'; omega
  · cases h

theorem D24_taginj : TagInjective D24 9 := by
  intro s s' h
  simp only [D24, Prod.mk.injEq] at h
  exact h.1

def vs24 : List (Nat × Nat) := [(1, 100), (2, 200), (3, 300)]

theorem vs24_cred : ∀ p ∈ vs24, D24.cred p.1 1 = some p.2 := by
  intro p hp
  simp only [vs24, List.mem_cons, List.mem_nil_iff, or_false] at hp
  rcases hp with rfl | rfl | rfl <;> rfl

theorem R024_completeness_nonvacuous :
    SecretFresh D24 1 ∧ TagInjective D24 9 ∧ (vs24.map Prod.fst).Nodup ∧
    (∀ p ∈ vs24, D24.cred p.1 1 = some p.2) :=
  ⟨D24_fresh, D24_taginj, by decide, vs24_cred⟩

theorem R024_completeness_applied :
    (vs24.map (fun p => D24.tag p.2 9)).Nodup ∧
      (vs24.map (fun p => D24.tag p.2 9)).length = vs24.length :=
  completeness D24 9 1 D24_fresh D24_taginj vs24 (by decide) vs24_cred

end R024

/-! ## Chains: `soundness`, `r020_soundness`, `r021_soundness` -/

section Chains
open Formal.Chains

/-- Identifiers live in `Fin 8`; identifier `i` has grant leaf `10 (i+1)`. -/
def leafOf (i : Fin 8) : Nat := 10 * (i.val + 1)

/-- Root hop: confers `{1, 2}` until `100`, `maxDepth 2`; issuer `0` (leaf 10), subject `1`. -/
def rootHop : VHop Nat 8 :=
  { hop := ⟨[1, 2], 100, 2⟩, issuer := 0, subject := 1, hasStatus := true,
    handle := 3, pre := [], lo := 1, hi := 5, post := [9], sigOK := True }

/-- Child hop: confers `{1}` until `50`, `maxDepth 1`; issuer `1` (= root subject), subject `2`. -/
def childHop : VHop Nat 8 :=
  { hop := ⟨[1], 50, 1⟩, issuer := 1, subject := 2, hasStatus := true,
    handle := 6, pre := [1], lo := 5, hi := 9, post := [], sigOK := True }

def restC : List (VHop Nat 8) := [childHop]

theorem chain_accepts (ceiling : Nat) (hc : 1 ≤ ceiling) :
    Accepts Dig.lf Dig.nd tree2 leafOf revoked ceiling 1 10 rootHop restC path10 := by
  refine ⟨?_, ?_, ?_, hc, ?_, ?_, rfl, ?_⟩
  · exact ⟨⟨by decide, by decide, by decide, by decide⟩, trivial⟩
  · show (1 : Nat) ∈ [1]; decide
  · show (10 : Nat) ≤ 50; decide
  · exact ⟨by decide, trivial⟩
  · intro h hh
    simp only [restC, List.mem_cons, List.mem_nil_iff, or_false] at hh
    rcases hh with rfl | rfl <;> trivial
  · intro h hh _
    simp only [restC, List.mem_cons, List.mem_nil_iff, or_false] at hh
    rcases hh with rfl | rfl <;> exact ⟨rfl, by decide, by decide⟩

theorem Chains_soundness_nonvacuous :
    (∀ a b : Nat, Dig.lf a = Dig.lf b → a = b) ∧
    (∀ x y x' y' : Dig Nat, Dig.nd x y = Dig.nd x' y' → x = x' ∧ y = y') ∧
    (∀ (a : Nat) x y, Dig.lf a ≠ Dig.nd x y) ∧ Sorted revoked ∧
    Accepts Dig.lf Dig.nd tree2 leafOf revoked 2 1 10 rootHop restC path10 :=
  ⟨lf_inj, nd_inj, lf_ne_nd, revoked_sorted, chain_accepts 2 (by decide)⟩

theorem Chains_soundness_applied : Statement tree2 leafOf revoked 2 1 10 rootHop restC :=
  soundness Dig.lf Dig.nd tree2 leafOf revoked 2 1 10 rootHop restC path10
    lf_inj nd_inj lf_ne_nd revoked_sorted (chain_accepts 2 (by decide))

theorem allStatus : ∀ h ∈ rootHop :: restC, h.hasStatus = true := by
  intro h hh
  simp only [restC, List.mem_cons, List.mem_nil_iff, or_false] at hh
  rcases hh with rfl | rfl <;> rfl

theorem Chains_r020_soundness_nonvacuous :
    (∀ a b : Nat, Dig.lf a = Dig.lf b → a = b) ∧
    (∀ x y x' y' : Dig Nat, Dig.nd x y = Dig.nd x' y' → x = x' ∧ y = y') ∧
    (∀ (a : Nat) x y, Dig.lf a ≠ Dig.nd x y) ∧ Sorted revoked ∧
    (∀ h ∈ rootHop :: restC, h.hasStatus = true) ∧
    Accepts Dig.lf Dig.nd tree2 leafOf revoked rootHop.hop.maxDepth 1 10 rootHop restC path10 :=
  ⟨lf_inj, nd_inj, lf_ne_nd, revoked_sorted, allStatus, chain_accepts 2 (by decide)⟩

theorem Chains_r020_soundness_applied :
    Statement tree2 leafOf revoked rootHop.hop.maxDepth 1 10 rootHop restC ∧
      ∀ h ∈ rootHop :: restC, h.handle ∉ revoked :=
  r020_soundness Dig.lf Dig.nd tree2 leafOf revoked 1 10 rootHop restC path10
    lf_inj nd_inj lf_ne_nd revoked_sorted allStatus (chain_accepts 2 (by decide))

/-- The scope's own tree for clause 7: leaf subject `2` has grant leaf `30`. -/
def treeS : MTree Nat := .node (.leaf 30) (.leaf 40)
def pathS : List (Bool × Dig Nat) := [(false, .lf 40)]

theorem leafSubj : leafSubject (rootHop :: restC) = some 2 := rfl

theorem subjMember : true = true →
    pathRoot Dig.nd pathS (Dig.lf (leafOf 2)) = treeS.root Dig.lf Dig.nd := fun _ => rfl

theorem Chains_r021_soundness_nonvacuous :
    (∀ a b : Nat, Dig.lf a = Dig.lf b → a = b) ∧
    (∀ x y x' y' : Dig Nat, Dig.nd x y = Dig.nd x' y' → x = x' ∧ y = y') ∧
    (∀ (a : Nat) x y, Dig.lf a ≠ Dig.nd x y) ∧ Sorted revoked ∧
    Accepts Dig.lf Dig.nd tree2 leafOf revoked 8 1 10 rootHop restC path10 ∧
    leafSubject (rootHop :: restC) = some 2 ∧
    (true = true → pathRoot Dig.nd pathS (Dig.lf (leafOf 2)) = treeS.root Dig.lf Dig.nd) :=
  ⟨lf_inj, nd_inj, lf_ne_nd, revoked_sorted, chain_accepts 8 (by decide), leafSubj, subjMember⟩

theorem Chains_r021_soundness_applied :
    Statement tree2 leafOf revoked 8 1 10 rootHop restC ∧
      (true = true → leafSubject (rootHop :: restC) = some 2 ∧ leafOf 2 ∈ treeS.leaves) :=
  r021_soundness Dig.lf Dig.nd tree2 treeS leafOf revoked 1 10 rootHop restC path10 pathS true 2
    lf_inj nd_inj lf_ne_nd revoked_sorted (chain_accepts 8 (by decide)) leafSubj subjMember

end Chains

end Review.NonVacuity

#print axioms Review.NonVacuity.P001_path_sound_applied
#print axioms Review.NonVacuity.P002_one_leaf_one_nullifier_applied
#print axioms Review.NonVacuity.P006_neighbours_sound_applied
#print axioms Review.NonVacuity.P022_reference_opens_once_applied
#print axioms Review.NonVacuity.R010_soundness_nonvacuous
#print axioms Review.NonVacuity.R010_soundness_applied
#print axioms Review.NonVacuity.R011_key_behind_persona_applied
#print axioms Review.NonVacuity.R012_star_to_clique_applied
#print axioms Review.NonVacuity.R013_soundness_nonvacuous
#print axioms Review.NonVacuity.R013_soundness_applied
#print axioms Review.NonVacuity.R025_soundness_nonvacuous
#print axioms Review.NonVacuity.R025_soundness_applied
#print axioms Review.NonVacuity.R025_replacement_fixed_applied
#print axioms Review.NonVacuity.R023_soundness_nonvacuous
#print axioms Review.NonVacuity.R023_soundness_applied
#print axioms Review.NonVacuity.R024_soundness_nonvacuous
#print axioms Review.NonVacuity.R024_soundness_applied
#print axioms Review.NonVacuity.R024_completeness_nonvacuous
#print axioms Review.NonVacuity.R024_completeness_applied
#print axioms Review.NonVacuity.Chains_soundness_nonvacuous
#print axioms Review.NonVacuity.Chains_soundness_applied
#print axioms Review.NonVacuity.Chains_r020_soundness_applied
#print axioms Review.NonVacuity.Chains_r021_soundness_applied
#print axioms Review.NonVacuity.P001_path_sound_nonvacuous
#print axioms Review.NonVacuity.P002_one_leaf_one_nullifier_nonvacuous
#print axioms Review.NonVacuity.P006_neighbours_sound_nonvacuous
#print axioms Review.NonVacuity.P022_reference_opens_once_nonvacuous
#print axioms Review.NonVacuity.R011_key_behind_persona_nonvacuous
#print axioms Review.NonVacuity.R012_star_to_clique_nonvacuous
#print axioms Review.NonVacuity.R025_replacement_fixed_nonvacuous
#print axioms Review.NonVacuity.Chains_r020_soundness_nonvacuous
#print axioms Review.NonVacuity.Chains_r021_soundness_nonvacuous
