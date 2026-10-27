import Formal.R024.Soundness

/-!
# Record 024 — the negative space, as theorems

A `doesNotEstablish` line is either **disproved** here by a concrete counter-deployment the counting
rule accepts, with the hypothesis that would close it **proved** beside it, or classified out of
scope in `R024.md`. Two lines are theorems below, plus `rekey_counts_twice`, found while writing the
soundness proof and folded into the record as issuance requirement 3.

Every counter-deployment uses members `Nat`, applicant `0` holding no credential, and the tag = the
secret, and reaches the record's statement *through* `soundness` — the same theorem a real
admission leans on.
-/

namespace Formal.R024

open Formal.Gadgets

/-- Two vetters, members `1` and `2`, one live label. -/
def twoVetters : Deployment Nat Nat Unit Unit Nat where
  cred m _ := if m = 1 ∨ m = 2 then some m else none
  live _ := True
  tag s _ := s

theorem twoVetters_counts : Counts twoVetters 0 () [1, 2] 2 := by
  refine ⟨?_, by decide, by decide⟩
  intro t ht
  simp only [List.mem_cons, List.not_mem_nil, or_false] at ht
  rcases ht with rfl | rfl
  · exact ⟨1, (), 1, trivial, by simp [twoVetters], rfl, by decide⟩
  · exact ⟨2, (), 2, trivial, by simp [twoVetters], rfl, by decide⟩

theorem twoVetters_statement : Statement twoVetters 0 () [1, 2] 2 :=
  soundness twoVetters 0 0 () [1, 2] 2
    (fun m L L' s s' h h' => by simp [twoVetters] at h h'; omega)
    (fun L s h => by simp [twoVetters] at h)
    twoVetters_counts

/-! ## doesNotEstablish 1 — "that the k attesters are k distinct people" -/

/-- The statement strengthened to people: the attesters' controllers are pairwise distinct. -/
def StatementPeople {Member Secret Label Ident Tag P : Type}
    (D : Deployment Member Secret Label Ident Tag) (ctrl : Member → P)
    (applicant : Member) (a : Ident) (tags : List Tag) (k : Nat) : Prop :=
  ∃ vs : List Member, k ≤ vs.length ∧ vs.Nodup ∧ (vs.map ctrl).Nodup ∧
    ∀ v ∈ vs, v ≠ applicant ∧ ∃ L s, D.live L ∧ D.cred v L = some s ∧ D.tag s a ∈ tags

/-- **Disproved without an enrolment hypothesis.** Members 1 and 2 are one person. The counting
rule accepts k = 2 and the record's statement holds, but no two attesters are distinct people. -/
theorem distinct_members_not_distinct_people :
    Counts twoVetters 0 () [1, 2] 2 ∧ Statement twoVetters 0 () [1, 2] 2 ∧
      ¬ StatementPeople twoVetters (fun _ => ()) 0 () [1, 2] 2 := by
  refine ⟨twoVetters_counts, twoVetters_statement, ?_⟩
  rintro ⟨vs, hk, _, hpeople, _⟩
  have := length_le_one_of_const () (vs.map fun _ => ()) hpeople (by simp)
  simp at this
  omega

/-- **Proved with it.** If the community's enrolment gives each person at most one membership
(`ctrl` injective on members), the record's statement is a statement about people. -/
theorem people_of_members {Member Secret Label Ident Tag P : Type}
    (D : Deployment Member Secret Label Ident Tag) (ctrl : Member → P)
    (hEnrol : ∀ m m', ctrl m = ctrl m' → m = m')
    (applicant : Member) (a : Ident) (tags : List Tag) (k : Nat)
    (h : Statement D applicant a tags k) : StatementPeople D ctrl applicant a tags k := by
  obtain ⟨vs, hk, hnd, hvs⟩ := h
  exact ⟨vs, hk, hnd, nodup_map_of_inj ctrl vs hnd (fun x _ y _ hxy => hEnrol x y hxy), hvs⟩

/-! ## Class-credential reading — "that an attester's vetter role is still current inside the period" -/

/-- The statement strengthened to vetters whose role is current. -/
def StatementCurrent {Member Secret Label Ident Tag : Type}
    (D : Deployment Member Secret Label Ident Tag) (current : Member → Prop)
    (applicant : Member) (a : Ident) (tags : List Tag) (k : Nat) : Prop :=
  ∃ vs : List Member, k ≤ vs.length ∧ vs.Nodup ∧
    ∀ v ∈ vs, current v ∧ v ≠ applicant ∧ ∃ L s, D.live L ∧ D.cred v L = some s ∧ D.tag s a ∈ tags

/-- **Disproved.** Member 2's vetter role was withdrawn mid-period; its class credential stays live
until the label rotates. The counting rule accepts k = 2 and the statement holds, but there are not
two current vetters among the attesters. (No hypothesis on the proof closes this: the record's
answer is label rotation, or a per-vetter non-revocation clause as in record 023 clause 6.) -/
theorem live_label_not_current_role :
    Counts twoVetters 0 () [1, 2] 2 ∧ Statement twoVetters 0 () [1, 2] 2 ∧
      ¬ StatementCurrent twoVetters (· = 1) 0 () [1, 2] 2 := by
  refine ⟨twoVetters_counts, twoVetters_statement, ?_⟩
  rintro ⟨vs, hk, hnd, hvs⟩
  have := length_le_one_of_const 1 vs hnd (fun v hv => (hvs v hv).1)
  omega

/-! ## Issuance requirement 3 — a re-keyed vetter counted twice across a rotation -/

/-- One vetter, member `1`, holding class credentials under two live labels (either side of a
rotation) with a **different** secret identifier under each. -/
def rekeyed : Deployment Nat Nat Bool Unit Nat where
  cred m L := if m = 1 then some (if L then 2 else 1) else none
  live _ := True
  tag s _ := s

/-- **Found: without H-stable, one vetter counts twice.** The record lets one proof mix
attestations made either side of a rotation. If a vetter's secret identifier changes at the
rotation, its two tags are distinct, the counting rule accepts k = 2 — and there are not two
distinct vetters. So `SecretStable` is not a modelling convenience: it is the property the
construction must have (or the rule must forbid two labels per vetter in one proof). -/
theorem rekey_counts_twice :
    Counts rekeyed 0 () [1, 2] 2 ∧ ¬ Statement rekeyed 0 () [1, 2] 2 ∧ ¬ SecretStable rekeyed := by
  refine ⟨⟨?_, by decide, by decide⟩, ?_, ?_⟩
  · intro t ht
    simp only [List.mem_cons, List.not_mem_nil, or_false] at ht
    rcases ht with rfl | rfl
    · exact ⟨1, false, 1, trivial, by simp [rekeyed], rfl, by decide⟩
    · exact ⟨1, true, 2, trivial, by simp [rekeyed], rfl, by decide⟩
  · rintro ⟨vs, hk, hnd, hvs⟩
    have hone : ∀ v ∈ vs, v = 1 := by
      intro v hv
      obtain ⟨_, L, s, _, hc, _⟩ := hvs v hv
      simp only [rekeyed] at hc
      split at hc
      · assumption
      · cases hc
    have := length_le_one_of_const 1 vs hnd hone
    omega
  · intro h
    have := h 1 false true 1 2 (by simp [rekeyed]) (by simp [rekeyed])
    omega

end Formal.R024
