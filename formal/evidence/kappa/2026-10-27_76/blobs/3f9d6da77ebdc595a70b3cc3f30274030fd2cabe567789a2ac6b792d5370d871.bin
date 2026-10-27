import Formal.Chains.Presentation

/-!
# Records 020 (VDC delegation chain) and 021 (VAC authority chain)

Both are the chain presentation of `Presentation.lean`, with different parameters:

* **020**: the ceiling is the root's own `maxDepth`; every hop carries status (the profile case);
  `sigOK` is the delegate's countersignature over the grant digest (clause 3).
* **021**: the ceiling is 8 (the depth ceiling) and `maxAttenuation` is `maxDepth`; status is checked
  on the links that carry it; `sigOK` is the issuer's signature (clause 3); clause 7 adds, where the
  governing party requires it, the leaf subject's own membership under the scope's root.

Rejection codes proved unsatisfiable: `scope-escalation` (020), `action-not-conferred` and
`depth-ceiling-exceeded` (021).
-/

namespace Formal.Chains

open Formal.Gadgets

variable {A : Type} {n : Nat} {Leaf D : Type}

/-- **020 soundness.** Record 020's statement is the chain statement with the root's own depth. -/
theorem r020_soundness [NeZero n] (hl : Leaf → D) (hn : D → D → D) (tree : MTree Leaf)
    (leafOf : Fin n → Leaf) (revoked : List Nat) (act : A) (now : Nat)
    (root : VHop A n) (rest : List (VHop A n)) (path : List (Bool × D))
    (hLeaf : ∀ a b, hl a = hl b → a = b)
    (hNode : ∀ x y x' y', hn x y = hn x' y' → x = x' ∧ y = y')
    (hDomain : ∀ a x y, hl a ≠ hn x y) (hSorted : Sorted revoked)
    (hAllStatus : ∀ h ∈ root :: rest, h.hasStatus = true)
    (hAcc : Accepts hl hn tree leafOf revoked root.hop.maxDepth act now root rest path) :
    Statement tree leafOf revoked root.hop.maxDepth act now root rest ∧
      ∀ h ∈ root :: rest, h.handle ∉ revoked := by
  have hs := soundness hl hn tree leafOf revoked _ act now root rest path hLeaf hNode hDomain hSorted hAcc
  exact ⟨hs, fun h hh => (hs.1 h hh).2.2.2 (hAllStatus h hh)⟩

/-- **`scope-escalation` / `action-not-conferred` is unsatisfiable.** If any hop of the chain does
not confer the act, no presentation of it is accepted — whatever the ceiling. -/
theorem escalation_unsat [NeZero n] (hl : Leaf → D) (hn : D → D → D) (tree : MTree Leaf)
    (leafOf : Fin n → Leaf) (revoked : List Nat) (ceiling : Nat) (act : A) (now : Nat)
    (root : VHop A n) (rest : List (VHop A n)) (path : List (Bool × D))
    (bad : VHop A n) (hbad : bad ∈ root :: rest) (hnot : act ∉ bad.hop.scope) :
    ¬ Accepts hl hn tree leafOf revoked ceiling act now root rest path := by
  rintro ⟨hchain, hact, _⟩
  exact hnot (leaf_act_all act _ hchain hact _ (List.mem_map_of_mem hbad))

/-- **021: `depth-ceiling-exceeded` is unsatisfiable.** A chain with more than 8 links below its
root is never accepted, whatever `maxAttenuation` its links bear. -/
theorem r021_ceiling_unsat [NeZero n] (hl : Leaf → D) (hn : D → D → D) (tree : MTree Leaf)
    (leafOf : Fin n → Leaf) (revoked : List Nat) (act : A) (now : Nat)
    (root : VHop A n) (rest : List (VHop A n)) (path : List (Bool × D)) (hlong : 8 < rest.length) :
    ¬ Accepts hl hn tree leafOf revoked 8 act now root rest path := by
  rintro ⟨_, _, _, hceil, _⟩
  omega

/-- The leaf subject of a chain. -/
def leafSubject : List (VHop A n) → Option (Fin n)
  | [] => none
  | [x] => some x.subject
  | _ :: rest => leafSubject rest

/-- **021 soundness**, with clause 7: where the governing party requires it, the leaf subject is also
a member under the scope's own root (`treeS`), proven by record 001 a second time. -/
theorem r021_soundness [NeZero n] (hl : Leaf → D) (hn : D → D → D) (treeG treeS : MTree Leaf)
    (leafOf : Fin n → Leaf) (revoked : List Nat) (act : A) (now : Nat)
    (root : VHop A n) (rest : List (VHop A n)) (pathG pathS : List (Bool × D))
    (requireMember : Bool) (subj : Fin n)
    (hLeaf : ∀ a b, hl a = hl b → a = b)
    (hNode : ∀ x y x' y', hn x y = hn x' y' → x = x' ∧ y = y')
    (hDomain : ∀ a x y, hl a ≠ hn x y) (hSorted : Sorted revoked)
    (hAcc : Accepts hl hn treeG leafOf revoked 8 act now root rest pathG)
    (hLeafSubj : leafSubject (root :: rest) = some subj)
    (hMember : requireMember = true → pathRoot hn pathS (hl (leafOf subj)) = treeS.root hl hn) :
    Statement treeG leafOf revoked 8 act now root rest ∧
      (requireMember = true → leafSubject (root :: rest) = some subj ∧ leafOf subj ∈ treeS.leaves) := by
  refine ⟨soundness hl hn treeG leafOf revoked 8 act now root rest pathG hLeaf hNode hDomain hSorted hAcc, ?_⟩
  intro hr
  exact ⟨hLeafSubj, path_sound hl hn hLeaf hNode hDomain _ treeS pathS (hMember hr)⟩

end Formal.Chains
