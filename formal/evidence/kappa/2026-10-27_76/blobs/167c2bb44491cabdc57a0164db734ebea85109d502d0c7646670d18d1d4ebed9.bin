import Formal.Gadgets.P001Membership
import Formal.Gadgets.P006NonRevocation
import Formal.Gadgets.P007CommonControl

/-!
# Record 010 — Community-Anchored Proof (ADR-001)

> A maintainer checks authenticated evidence of a relationship between two distinct member
> credentials of community C …

The presenter `P` and the voucher `V` are two members. Composed from the library:

| clause | gadget | here |
|---|---|---|
| 1 VRC verifies (voucher → presenter's key) | signature-verify | `(vrcIssuer, presenterKey) ∈ vrcs` — **H-sig** |
| 2, 3 both grants under `root_C` | 001 ×2 | two paths |
| 4 presenter's VRC identifier ↔ presenter's grant | 007 | `CommonControl` |
| 5 the two member leaves distinct | 005 | `leafP ≠ leafV` |
| 7 no handle revoked | 006 ×3 | the presenter's, the voucher's, the VRC's |
| 6, 8, 9 key, nullifier, transcript | 004, 002, 003 | outside the counting model |

* `soundness` — accepted ⇒ two **distinct**, current members related by a VRC.
* `self_vouch_unsat` — the record's rejection code `self-vouch`: clause 5 makes it unsatisfiable at the
  leaf level. **Contrast with record 023**, which has no such clause (`Formal.R023.self_vouch_counted`).
* doesNotEstablish 9 (distinct humans or controllers from unequal leaves) is record 005's
  `distinct_leaves_not_distinct_persons`.
-/

namespace Formal.R010

open Formal.Gadgets

variable {Leaf D S Salt Id : Type}

/-- The published state: the membership tree, the revoked handles, the VRCs members issued. -/
structure Community (Leaf Id : Type) where
  tree    : MTree Leaf
  revoked : List Nat
  vrcs    : List (Id × Id)

/-- A handle and its neighbour witness (record 006). -/
structure Handle where
  h : Nat
  pre : List Nat
  lo : Nat
  hi : Nat
  post : List Nat

def HandleOK (revoked : List Nat) (x : Handle) : Prop :=
  revoked = x.pre ++ x.lo :: x.hi :: x.post ∧ x.lo < x.h ∧ x.h < x.hi

/-- The presentation's hidden witness. -/
structure Witness (Leaf D Id : Type) where
  leafP : Leaf
  leafV : Leaf
  pathP : List (Bool × D)
  pathV : List (Bool × D)
  vrcIssuer : Id
  presenterKey : Id
  presenterVrcId : Id
  presenterGrantId : Id
  handles : List Handle

/-- **The verifier's relation** (clauses 1–5, 7). -/
def Accepts (C : Community Leaf Id) (hl : Leaf → D) (hn : D → D → D) (der : S → Salt → Id)
    (w : Witness Leaf D Id) : Prop :=
  (w.vrcIssuer, w.presenterKey) ∈ C.vrcs ∧
  pathRoot hn w.pathP (hl w.leafP) = C.tree.root hl hn ∧
  pathRoot hn w.pathV (hl w.leafV) = C.tree.root hl hn ∧
  CommonControl der w.presenterVrcId w.presenterGrantId ∧
  w.leafP ≠ w.leafV ∧
  (∀ x ∈ w.handles, HandleOK C.revoked x)

/-- **Soundness.** Two distinct current members, every handle unrevoked, a VRC between them. -/
theorem soundness (C : Community Leaf Id) (hl : Leaf → D) (hn : D → D → D) (der : S → Salt → Id)
    (w : Witness Leaf D Id)
    (hLeaf : ∀ a b, hl a = hl b → a = b)
    (hNode : ∀ x y x' y', hn x y = hn x' y' → x = x' ∧ y = y')
    (hDomain : ∀ a x y, hl a ≠ hn x y) (hSorted : Sorted C.revoked)
    (hAcc : Accepts C hl hn der w) :
    w.leafP ∈ C.tree.leaves ∧ w.leafV ∈ C.tree.leaves ∧ w.leafP ≠ w.leafV ∧
      (w.vrcIssuer, w.presenterKey) ∈ C.vrcs ∧ CommonControl der w.presenterVrcId w.presenterGrantId ∧
      (∀ x ∈ w.handles, x.h ∉ C.revoked) := by
  obtain ⟨hvrc, hP, hV, hlink, hne, hh⟩ := hAcc
  refine ⟨path_sound hl hn hLeaf hNode hDomain _ C.tree _ hP,
    path_sound hl hn hLeaf hNode hDomain _ C.tree _ hV, hne, hvrc, hlink, ?_⟩
  intro x hx
  obtain ⟨heq, hlo, hhi⟩ := hh x hx
  rw [heq]
  exact neighbours_sound x.pre x.post x.lo x.hi _ (heq ▸ hSorted) hlo hhi

/-- **`self-vouch` is unsatisfiable**: one member leaf in both roles is never accepted. -/
theorem self_vouch_unsat (C : Community Leaf Id) (hl : Leaf → D) (hn : D → D → D)
    (der : S → Salt → Id) (w : Witness Leaf D Id) (hsame : w.leafP = w.leafV) :
    ¬ Accepts C hl hn der w := by
  rintro ⟨_, _, _, _, hne, _⟩
  exact hne hsame

end Formal.R010
