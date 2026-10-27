import Formal.R023.Soundness

/-!
# Record 023 — the negative space, and the comparison with 024 (WG-16)

* `no_vrc_no_statement` — doesNotEstablish 7 made exact: a community whose admission path issues no
  relationship credentials can never satisfy the statement, for any `k ≥ 1`. Record 024's statement
  needs no VRC (`Formal.R024.twoVetters_statement` holds with none).
* `self_vouch_counted` — **found for WG-16**: 023 has no "voucher is not the applicant" clause. An
  applicant who is already a member (doesNotEstablish 2 allows it) vouches for itself through its
  own grant: the verifier's relation accepts k = 2, the statement holds, and one voucher's grant is
  controlled by the applicant's own secret. Record 024 carries that exclusion as clause 7.

The counter-deployment reaches the statement through `soundness`, with every hash hypothesis
discharged: digests are `FreeDigest` (`base` for leaves, `pair` for nodes: injective, disjoint).
-/

namespace Formal.R023

open Formal.Gadgets

/-- **doesNotEstablish 7.** No VRC issued, no statement, for any `k ≥ 1`. -/
theorem no_vrc_no_statement {Member Id Leaf S Salt : Type} (C : Community Member Id Leaf)
    (der : S → Salt → Id) (adm : Id) (k : Nat) (hk : 1 ≤ k) (hnone : C.vrcs = []) :
    ¬ Statement C der adm k := by
  rintro ⟨vs, hlen, _, hvs⟩
  cases vs with
  | nil => simp at hlen; omega
  | cons v _ =>
    obtain ⟨_, _, idV, subj, hmem, _⟩ := hvs v (List.mem_cons_self ..)
    rw [hnone] at hmem
    simp at hmem

/-- Identifiers are `(secret, salt)` pairs: the derivation is injective by construction. -/
def der : Nat → Nat → Nat × Nat := fun s a => (s, a)

/-- Member `0` is the applicant's own membership (secret `7`, the applicant's admission identifier
is `(7, 0)`); member `1` is someone else (secret `8`). Each issued a VRC naming `(7, 0)`. -/
def selfVouch : Community Nat (Nat × Nat) Nat where
  grantLeaf m := m
  grantId m := (if m = 0 then 7 else 8, 1)
  handle m := m + 5
  tree := .node (.leaf 0) (.leaf 1)
  revoked := [0, 1000]
  vrcs := [((7, 1), (7, 0)), ((8, 1), (7, 0))]

/-- The two vouchers' witnesses. -/
def selfVouchWs : List (Vouch Nat (Nat × Nat) FreeDigest) :=
  [⟨0, [(false, .base 1)], [], 0, 1000, [], (7, 1), (7, 0)⟩,
   ⟨1, [(true, .base 0)], [], 0, 1000, [], (8, 1), (7, 0)⟩]

theorem selfVouch_accepts :
    Accepts selfVouch FreeDigest.base FreeDigest.pair der (7, 0) 2 selfVouchWs := by
  refine ⟨?_, by decide, by decide⟩
  intro w hw
  simp only [selfVouchWs, List.mem_cons, List.not_mem_nil, or_false] at hw
  rcases hw with rfl | rfl
  · exact ⟨rfl, rfl, by decide, by decide, by decide, ⟨7, 1, 1, rfl, rfl⟩, Or.inl rfl⟩
  · exact ⟨rfl, rfl, by decide, by decide, by decide, ⟨8, 1, 1, rfl, rfl⟩, Or.inl rfl⟩

/-- **Found for WG-16: a self-vouch is counted.** The relation accepts, the statement holds (through
`soundness`, every hypothesis discharged), and voucher `0`'s grant identifier is under the
applicant's own secret — one of the k "distinct current members" is the applicant. -/
theorem self_vouch_counted :
    Accepts selfVouch FreeDigest.base FreeDigest.pair der (7, 0) 2 selfVouchWs ∧
      Statement selfVouch der (7, 0) 2 ∧
      CommonControl der (selfVouch.grantId 0) (7, 0) := by
  refine ⟨selfVouch_accepts, ?_, ⟨7, 1, 0, rfl, rfl⟩⟩
  exact soundness selfVouch FreeDigest.base FreeDigest.pair der (7, 0) 2 selfVouchWs
    (fun a b h => by cases h; rfl)
    (fun x y x' y' h => by cases h; exact ⟨rfl, rfl⟩)
    (fun a x y h => by cases h)
    (by unfold Sorted; decide)
    selfVouch_accepts

end Formal.R023
