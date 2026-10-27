import Formal.Gadgets.ChainResolve
import Formal.Gadgets.P001Membership
import Formal.Gadgets.P006NonRevocation
import Formal.Gadgets.P009HiddenEquality

/-!
# A chain presentation — the shared core of records 020 (VDC) and 021 (VAC)

Both records prove a chain of grants, root first, whose leaf is the presenter's. The verifier's
relation `Accepts` is the conjunction of the gadget relations:

| clause (020 / 021) | gadget | here |
|---|---|---|
| 1 / 1 chain resolves | chain-resolve | `ChainOK` on the hops, the act and `now` checked at the leaf only, depth ≤ `ceiling` |
| 2 / 2 issuer = parent's subject | 009 hidden-equality | the in-circuit constraint `issuer − subject = 0` over `Fin n` |
| 3 / 3 each hop signed / countersigned | signature-verify | `sigOK` — **H-sig**, a Prop the signature check establishes |
| 4 / 4 root's issuer under the root | 001 | `pathRoot` to the tree's root |
| 6 / 6 no hop revoked | 006 | adjacent neighbours, on every hop that carries status |
| 5 / 5 presenter's key | 004 | outside this file (record 004's `key_from_credential_secret`) |

`soundness` turns `Accepts` into the global statement: the act is conferred and unexpired at every
hop, depth within the root and the ceiling, every link an equality, the root a member, no hop revoked.
-/

namespace Formal.Chains

open Formal.Gadgets

/-- One hop as the proof carries it: the chain fields, the two identifiers as circuit-field
elements, the status handle and its non-revocation witness, and whether its signature verified. -/
structure VHop (A : Type) (n : Nat) where
  hop     : Hop A
  issuer  : Fin n
  subject : Fin n
  hasStatus : Bool
  handle  : Nat
  pre     : List Nat
  lo      : Nat
  hi      : Nat
  post    : List Nat
  sigOK   : Prop

variable {A : Type} {n : Nat} {Leaf D : Type}

/-- Clause 2 as the circuit constrains it: each hop's issuer minus its parent's subject is zero. -/
def LinkedConstraint [NeZero n] : List (VHop A n) → Prop
  | [] => True
  | [_] => True
  | p :: c :: rest => c.issuer - p.subject = 0 ∧ LinkedConstraint (c :: rest)

/-- Clause 2 as the record states it: each hop's issuer equals its parent's subject. -/
def Linked : List (VHop A n) → Prop
  | [] => True
  | [_] => True
  | p :: c :: rest => c.issuer = p.subject ∧ Linked (c :: rest)

/-- **Record 009 carries clause 2**: the constraint form is the equality form, hop by hop. -/
theorem linked_of_constraint [NeZero n] : ∀ l : List (VHop A n), LinkedConstraint l → Linked l
  | [], _ => trivial
  | [_], _ => trivial
  | p :: c :: rest, ⟨h, hrest⟩ =>
    ⟨(sub_zero_iff_eq n c.issuer p.subject).mp h, linked_of_constraint (c :: rest) hrest⟩

/-- One hop's non-revocation witness (clause 6), required where the hop carries status. -/
def NotRevokedOK (revoked : List Nat) (h : VHop A n) : Prop :=
  h.hasStatus = true →
    revoked = h.pre ++ h.lo :: h.hi :: h.post ∧ h.lo < h.handle ∧ h.handle < h.hi

/-- **The verifier's relation.** `root :: rest` is the chain; `leafOf` maps an identifier to its
grant leaf; `path` is the root issuer's membership path. -/
def Accepts [NeZero n] (hl : Leaf → D) (hn : D → D → D) (tree : MTree Leaf) (leafOf : Fin n → Leaf)
    (revoked : List Nat) (ceiling : Nat) (act : A) (now : Nat)
    (root : VHop A n) (rest : List (VHop A n)) (path : List (Bool × D)) : Prop :=
  let hs := (root :: rest).map (·.hop)
  ChainOK hs ∧ LastHas (fun h => act ∈ h.scope) hs ∧ LastHas (fun h => now ≤ h.validUntil) hs ∧
  rest.length ≤ ceiling ∧
  LinkedConstraint (root :: rest) ∧
  (∀ h ∈ root :: rest, h.sigOK) ∧
  pathRoot hn path (hl (leafOf root.issuer)) = tree.root hl hn ∧
  (∀ h ∈ root :: rest, NotRevokedOK revoked h)

/-- **The statement both records make of a chain**, in global form. -/
def Statement (tree : MTree Leaf) (leafOf : Fin n → Leaf) (revoked : List Nat) (ceiling : Nat)
    (act : A) (now : Nat) (root : VHop A n) (rest : List (VHop A n)) : Prop :=
  (∀ h ∈ root :: rest, act ∈ h.hop.scope ∧ now ≤ h.hop.validUntil ∧ h.sigOK ∧
      (h.hasStatus = true → h.handle ∉ revoked)) ∧
  rest.length ≤ root.hop.maxDepth ∧ rest.length ≤ ceiling ∧
  Linked (root :: rest) ∧
  leafOf root.issuer ∈ tree.leaves

/-- **Soundness of a chain presentation.** Given record 001's hash hypotheses and record 006's
H-sorted, the local checks establish the global statement. -/
theorem soundness [NeZero n] (hl : Leaf → D) (hn : D → D → D) (tree : MTree Leaf)
    (leafOf : Fin n → Leaf) (revoked : List Nat) (ceiling : Nat) (act : A) (now : Nat)
    (root : VHop A n) (rest : List (VHop A n)) (path : List (Bool × D))
    (hLeaf : ∀ a b, hl a = hl b → a = b)
    (hNode : ∀ x y x' y', hn x y = hn x' y' → x = x' ∧ y = y')
    (hDomain : ∀ a x y, hl a ≠ hn x y)
    (hSorted : Sorted revoked)
    (hAcc : Accepts hl hn tree leafOf revoked ceiling act now root rest path) :
    Statement tree leafOf revoked ceiling act now root rest := by
  obtain ⟨hchain, hact, hnow, hceil, hlink, hsig, hpath, hrev⟩ := hAcc
  refine ⟨?_, ?_, hceil, linked_of_constraint _ hlink, path_sound hl hn hLeaf hNode hDomain _ tree path hpath⟩
  · intro h hh
    have hm : h.hop ∈ (root :: rest).map (·.hop) := List.mem_map_of_mem hh
    refine ⟨leaf_act_all act _ hchain hact _ hm, leaf_valid_all now _ hchain hnow _ hm, hsig h hh, ?_⟩
    intro hs
    obtain ⟨heq, hlo, hhi⟩ := hrev h hh hs
    rw [heq]
    exact neighbours_sound h.pre h.post h.lo h.hi _ (heq ▸ hSorted) hlo hhi
  · have := depth_below root.hop (rest.map (·.hop)) (by simpa using hchain)
    simpa using this

end Formal.Chains
