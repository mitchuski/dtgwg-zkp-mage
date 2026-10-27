/-! # List facts the gadget library shares (core Lean has no `Finset`; everything here is on lists). -/

namespace Formal.Gadgets

/-- A map injective on a list's members preserves `Nodup`. -/
theorem nodup_map_of_inj {α β : Type} (f : α → β) :
    ∀ l : List α, l.Nodup → (∀ x ∈ l, ∀ y ∈ l, f x = f y → x = y) → (l.map f).Nodup
  | [], _, _ => List.nodup_nil
  | x :: xs, hnd, hinj => by
    rw [List.nodup_cons] at hnd
    rw [List.map_cons, List.nodup_cons]
    refine ⟨?_, nodup_map_of_inj f xs hnd.2
      (fun a ha b hb => hinj a (List.mem_cons_of_mem x ha) b (List.mem_cons_of_mem x hb))⟩
    intro hmem
    obtain ⟨y, hy, hfy⟩ := List.mem_map.mp hmem
    have : y = x := hinj y (List.mem_cons_of_mem x hy) x (List.mem_cons_self ..) hfy
    exact hnd.1 (this ▸ hy)

/-- If the images are pairwise distinct, so are the originals. -/
theorem nodup_of_map_nodup {α β : Type} (f : α → β) :
    ∀ l : List α, (l.map f).Nodup → l.Nodup
  | [], _ => List.nodup_nil
  | x :: xs, h => by
    rw [List.map_cons, List.nodup_cons] at h
    exact List.nodup_cons.mpr ⟨fun hx => h.1 (List.mem_map_of_mem hx), nodup_of_map_nodup f xs h.2⟩

/-- A pairwise-distinct list whose members all equal one value has at most one member. -/
theorem length_le_one_of_const {α : Type} (c : α) :
    ∀ l : List α, l.Nodup → (∀ v ∈ l, v = c) → l.length ≤ 1
  | [], _, _ => by simp
  | [_], _, _ => by simp
  | x :: y :: _, hnd, hall => by
    rw [List.nodup_cons] at hnd
    have hx := hall x (List.mem_cons_self ..)
    have hy := hall y (List.mem_cons_of_mem x (List.mem_cons_self ..))
    exact absurd (hx ▸ hy ▸ List.mem_cons_self ..) hnd.1

end Formal.Gadgets
