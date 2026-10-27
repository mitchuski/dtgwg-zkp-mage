import Formal.R024.Model
import Formal.Gadgets.P005Distinct

/-!
# Record 024 — soundness and completeness of the counting rule

`soundness`: whatever the community counts, the record's statement holds.
`completeness`: k honest distinct vetters are never collapsed below k counted tags.
-/

namespace Formal.R024

open Formal.Gadgets

variable {Member Secret Label Ident Tag : Type}

/-- The inductive core — **record 005's k-ary distinctness gadget** (`owners_distinct`) with record
002's tag as the value: an owner is a member, it owns the tag its live class credential gives this
applicant, and H-stable makes that one tag per member. -/
theorem members_of_tags (D : Deployment Member Secret Label Ident Tag)
    (applicant : Member) (aSec : Secret) (a : Ident)
    (hStable : SecretStable D) (hApp : ApplicantSecret D applicant aSec)
    (tags : List Tag) (hnd : tags.Nodup) (hext : Extractable D aSec a tags) :
    ∃ vs : List Member, vs.length = tags.length ∧ vs.Nodup ∧
      ∀ v ∈ vs, v ≠ applicant ∧ ∃ L s, D.live L ∧ D.cred v L = some s ∧ D.tag s a ∈ tags := by
  let owns : Member → Tag → Prop := fun m t => ∃ L s, D.live L ∧ D.cred m L = some s ∧ D.tag s a = t
  have oneEach : ∀ m t t', owns m t → owns m t' → t = t' := by
    rintro m t t' ⟨L, s, _, hc, rfl⟩ ⟨L', s', _, hc', rfl⟩
    rw [hStable m L L' s s' hc hc']
  have hown : ∀ t ∈ tags, ∃ m, owns m t ∧ m ≠ applicant := by
    intro t ht
    obtain ⟨m, L, s, hl, hc, htag, hne⟩ := hext t ht
    refine ⟨m, ⟨L, s, hl, hc, htag⟩, ?_⟩
    rintro rfl
    exact hne (hApp L s hc)
  obtain ⟨vs, hlen, hvnd, hvs⟩ := owners_distinct owns (· ≠ applicant) oneEach tags hnd hown
  refine ⟨vs, hlen, hvnd, fun v hv => ?_⟩
  obtain ⟨hne, t, ht, L, s, hl, hc, htag⟩ := hvs v hv
  exact ⟨hne, L, s, hl, hc, htag ▸ ht⟩

/-- **Soundness.** If the community's counting rule accepts, record 024's statement holds —
given H-Σ (inside `Counts`), H-stable and H-applicant. -/
theorem soundness (D : Deployment Member Secret Label Ident Tag)
    (applicant : Member) (aSec : Secret) (a : Ident) (tags : List Tag) (k : Nat)
    (hStable : SecretStable D) (hApp : ApplicantSecret D applicant aSec)
    (hCounts : Counts D aSec a tags k) :
    Statement D applicant a tags k := by
  obtain ⟨hext, hnd, hk⟩ := hCounts
  obtain ⟨vs, hlen, hvnd, hvs⟩ := members_of_tags D applicant aSec a hStable hApp tags hnd hext
  exact ⟨vs, hlen ▸ hk, hvnd, hvs⟩

/-- **Completeness (clause 3 does not over-collapse).** `k` pairwise-distinct honest vetters, each
holding a class credential under label `L`, produce `k` pairwise-distinct tags — so the counting
rule's distinctness and length conditions hold. Given H-fresh and H-tag. (That each honest tag is
extractable is the Σ-protocol's own completeness, outside this file.) -/
theorem completeness (D : Deployment Member Secret Label Ident Tag) (a : Ident) (L : Label)
    (hFresh : SecretFresh D L) (hTag : TagInjective D a)
    (vs : List (Member × Secret)) (hnd : (vs.map Prod.fst).Nodup)
    (hcred : ∀ p ∈ vs, D.cred p.1 L = some p.2) :
    (vs.map (fun p => D.tag p.2 a)).Nodup ∧ (vs.map (fun p => D.tag p.2 a)).length = vs.length := by
  refine ⟨?_, by simp⟩
  -- distinct members ⇒ distinct pairs; equal tags ⇒ equal secrets ⇒ equal members ⇒ equal pairs
  have hpairs : vs.Nodup := by
    induction vs with
    | nil => exact List.nodup_nil
    | cons p ps ih =>
      rw [List.map_cons, List.nodup_cons] at hnd
      rw [List.nodup_cons]
      refine ⟨fun hp => hnd.1 (List.mem_map_of_mem hp), ih hnd.2 ?_⟩
      exact fun q hq => hcred q (List.mem_cons_of_mem p hq)
  apply nodup_map_of_inj _ vs hpairs
  intro x hx y hy hxy
  have hs : x.2 = y.2 := hTag x.2 y.2 hxy
  have hm : x.1 = y.1 := hFresh x.1 y.1 x.2 (hcred x hx) (hs ▸ hcred y hy)
  exact Prod.ext hm hs

end Formal.R024
