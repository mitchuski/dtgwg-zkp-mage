import Formal.Composed.R013
-- I2 review witness; not a new construction root or a repaired model.
namespace Review.R013Binding
open Formal.Gadgets Formal.R013
inductive Digest where
  | form : Form Bool → Digest
  | member : Nat → Digest
  | node : Digest → Digest → Digest
-- Toy canonical bytes explicitly carry a form and subject; the model ignores their projections.
abbrev Bytes := Form Bool × Nat
def claimed : Form Bool := ⟨true, true⟩
def supplied : Form Bool := ⟨false, false⟩
def bytes : Bytes := (claimed, 999)
def commit (b : Bytes) (u : Nat) := (b, u)
example : ∀ b u b' u', commit b u = commit b' u' → b = b' ∧ u = u' := by
  intro b u b' u' h; exact Prod.mk.inj h
example : ∀ a b, Digest.form a = Digest.form b → a = b := by
  intro a b h; cases h; rfl
example : ∀ a b, Digest.member a = Digest.member b → a = b := by
  intro a b h; cases h; rfl
example : ∀ x y x' y', Digest.node x y = Digest.node x' y' → x = x' ∧ y = y' := by
  intro x y x' y' h; cases h; exact ⟨rfl, rfl⟩
example : ∀ a x y, Digest.form a ≠ Digest.node x y := by
  intro a x y h; cases h
example : ∀ a x y, Digest.member a ≠ Digest.node x y := by
  intro a x y h; cases h
-- All hash hypotheses above hold, but committed member=true is checked as member=false.
theorem unbound_form_accepts :
    Accepts commit Digest.form Digest.node Digest.member
      (.leaf supplied) (.leaf 0) (commit bytes 0) bytes 0 supplied 999 [] [] ∧
    bytes.1 ≠ supplied ∧ bytes.2 ∉ (MTree.leaf 0).leaves := by
  constructor
  · refine ⟨rfl, rfl, ?_⟩; intro h; cases h
  · decide
-- Even member=true can prove an unrelated member, without connecting it to the bytes' subject.
theorem unbound_subject_accepts :
    Accepts commit Digest.form Digest.node Digest.member
      (.leaf claimed) (.leaf 0) (commit bytes 0) bytes 0 claimed 0 [] [] ∧
    bytes.2 ≠ 0 := by
  exact ⟨⟨rfl, rfl, fun _ => rfl⟩, by decide⟩
#print axioms unbound_form_accepts
#print axioms unbound_subject_accepts
end Review.R013Binding
