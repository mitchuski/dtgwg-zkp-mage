import Formal.Gadgets.P001Membership
import Formal.Gadgets.P006NonRevocation
import Formal.Gadgets.P007CommonControl
import Formal.Gadgets.Lists

/-!
# Record 023 — two-vouch admission: the model, composed from the gadget library

> The issuing community learns that the applicant — the subject named in a pending join request —
> holds relationship credentials issued by at least k distinct current members of this community,
> each naming the applicant's identifier as subject and each issued by a member whose
> community-issued grant is a leaf of the community's current membership root, without learning
> which members issued them and without any voucher taking part in the presentation.

The verifier's relation `Accepts` is a conjunction of the gadget relations, one per clause:

| clause | gadget | here |
|---|---|---|
| 1 VRC verifies, issuer → subject | signature-verify | `(idV, subj) ∈ C.vrcs` — **H-sig**: a verifying VRC is one the community's members issued (the list `vrcs`) |
| 2 grant leaf under `root_C` | 001 | `pathRoot` to the tree's root |
| 3 VRC issuer and grant name one controller | 007 | `CommonControl der idV (grantId member)` |
| 4 member leaves pairwise distinct | 005 | `(leaves).Nodup` |
| 5 VRC subject opens to the applicant | 004 / 007 | `subj = adm ∨ CommonControl der subj adm` |
| 6 handle not revoked at the epoch | 006 | adjacent neighbours in the revoked list |
| 7 transcript and context | 003 | outside the counting model (record 003's `swap_fails`) |
-/

namespace Formal.R023

open Formal.Gadgets

/-- What the community has issued and published at the epoch. Handles are `Nat` (record 006's
sorted list). `grantLeaf` is a function: one community-issued grant per member. -/
structure Community (Member Id Leaf : Type) where
  grantLeaf : Member → Leaf
  grantId   : Member → Id
  handle    : Member → Nat
  tree      : MTree Leaf
  revoked   : List Nat
  vrcs      : List (Id × Id)

variable {Member Id Leaf D S Salt : Type}

/-- **The record's statement** as a definition: at least `k` pairwise-distinct members, each current
(grant leaf in the membership tree, handle not revoked) and each linked — through one controller —
to a VRC whose subject is the applicant's admission identifier or opens to it. -/
def Statement (C : Community Member Id Leaf) (der : S → Salt → Id) (adm : Id) (k : Nat) : Prop :=
  ∃ vs : List Member, k ≤ vs.length ∧ vs.Nodup ∧
    ∀ v ∈ vs, C.grantLeaf v ∈ C.tree.leaves ∧ C.handle v ∉ C.revoked ∧
      ∃ idV subj, (idV, subj) ∈ C.vrcs ∧ CommonControl der idV (C.grantId v) ∧
        (subj = adm ∨ CommonControl der subj adm)

/-- One voucher's witness, as the applicant presents it (hidden from the verifier). `member` is the
voucher the grant belongs to — what extraction from the proof yields. -/
structure Vouch (Member Id D : Type) where
  member : Member
  path   : List (Bool × D)
  pre    : List Nat
  lo     : Nat
  hi     : Nat
  post   : List Nat
  idV    : Id
  subj   : Id

/-- One voucher's clauses 1, 2, 3, 5, 6. -/
def VouchOK (C : Community Member Id Leaf) (hl : Leaf → D) (hn : D → D → D) (der : S → Salt → Id)
    (adm : Id) (w : Vouch Member Id D) : Prop :=
  pathRoot hn w.path (hl (C.grantLeaf w.member)) = C.tree.root hl hn ∧
  C.revoked = w.pre ++ w.lo :: w.hi :: w.post ∧ w.lo < C.handle w.member ∧ C.handle w.member < w.hi ∧
  (w.idV, w.subj) ∈ C.vrcs ∧ CommonControl der w.idV (C.grantId w.member) ∧
  (w.subj = adm ∨ CommonControl der w.subj adm)

/-- **The verifier's relation**: every voucher's clauses, the member leaves pairwise distinct
(clause 4), and at least `k` vouchers. -/
def Accepts (C : Community Member Id Leaf) (hl : Leaf → D) (hn : D → D → D) (der : S → Salt → Id)
    (adm : Id) (k : Nat) (ws : List (Vouch Member Id D)) : Prop :=
  (∀ w ∈ ws, VouchOK C hl hn der adm w) ∧ (ws.map (fun w => C.grantLeaf w.member)).Nodup ∧ k ≤ ws.length

end Formal.R023
