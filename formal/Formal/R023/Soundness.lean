import Formal.R023.Model

/-!
# Record 023 — soundness, composed

`soundness`: if the verifier's relation accepts, the record's statement holds. The proof is the
gadget library's theorems in sequence: record 005's `nodup_of_map_nodup` turns distinct leaves into
distinct members, record 001's `path_sound` turns each path into tree membership, record 006's
`neighbours_sound` turns each neighbour pair into non-revocation. Clauses 1, 3 and 5 pass through
as the record states them.
-/

namespace Formal.R023

open Formal.Gadgets

variable {Member Id Leaf D S Salt : Type}

/-- **Soundness.** Given record 001's hash hypotheses (H-leaf, H-node, H-domain) and record 006's
H-sorted, an accepted presentation establishes the statement. -/
theorem soundness (C : Community Member Id Leaf) (hl : Leaf → D) (hn : D → D → D)
    (der : S → Salt → Id) (adm : Id) (k : Nat) (ws : List (Vouch Member Id D))
    (hLeaf : ∀ a b, hl a = hl b → a = b)
    (hNode : ∀ x y x' y', hn x y = hn x' y' → x = x' ∧ y = y')
    (hDomain : ∀ a x y, hl a ≠ hn x y)
    (hSorted : Sorted C.revoked)
    (hAcc : Accepts C hl hn der adm k ws) :
    Statement C der adm k := by
  obtain ⟨hok, hnd, hk⟩ := hAcc
  refine ⟨ws.map (·.member), by simpa using hk, ?_, ?_⟩
  · -- clause 4 through record 005: distinct leaves, and one leaf per member, give distinct members
    have : ((ws.map (·.member)).map C.grantLeaf).Nodup := by
      rw [List.map_map]; exact hnd
    exact nodup_of_map_nodup C.grantLeaf _ this
  · intro v hv
    obtain ⟨w, hw, rfl⟩ := List.mem_map.mp hv
    obtain ⟨hpath, hrev, hlo, hhi, hvrc, hlink, hsubj⟩ := hok w hw
    refine ⟨?_, ?_, w.idV, w.subj, hvrc, hlink, hsubj⟩
    · -- clause 2 through record 001
      exact path_sound hl hn hLeaf hNode hDomain _ C.tree w.path hpath
    · -- clause 6 through record 006
      rw [hrev]
      exact neighbours_sound w.pre w.post w.lo w.hi _ (hrev ▸ hSorted) hlo hhi

end Formal.R023
