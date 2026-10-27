/-!
# Record 006 — non-revocation against a status root

> A verifier learns that the credential's nullifier is not in the revocation set at the stated
> registry state, without the registry learning who asked.

Clause: non-membership of the handle in the set committed by `rl_root`, by sorted-leaf neighbours.
Modelled on the committed list itself (that the list is the one under `rl_root` is record 001's
membership, applied twice for the two neighbours).

* `neighbours_sound` — two **adjacent** entries `lo < h < hi` of a **strictly sorted** list prove
  `h` is not in it; with sentinels at the ends, every handle has such a pair.
* `unsorted_neighbours_unsound` — **H-sorted is necessary**: on an unsorted list, adjacent
  neighbours bracket a handle that is present.
* `stale_root_passes` — negative space 1: a proof against the epoch's list says nothing about a
  revocation after it.
-/

namespace Formal.Gadgets

/-- Strictly increasing. -/
def Sorted (l : List Nat) : Prop := l.Pairwise (· < ·)

/-- **Soundness of the neighbour clause.** -/
theorem neighbours_sound (pre post : List Nat) (lo hi h : Nat)
    (hs : Sorted (pre ++ lo :: hi :: post)) (hlo : lo < h) (hhi : h < hi) :
    h ∉ pre ++ lo :: hi :: post := by
  unfold Sorted at hs
  rw [List.pairwise_append] at hs
  obtain ⟨_, hmid, hcross⟩ := hs
  rw [List.pairwise_cons] at hmid
  obtain ⟨hloAll, hmid'⟩ := hmid
  rw [List.pairwise_cons] at hmid'
  obtain ⟨hhiAll, _⟩ := hmid'
  intro hmem
  rcases List.mem_append.mp hmem with hp | hq
  · have := hcross h hp lo (List.mem_cons_self ..); omega
  · rcases List.mem_cons.mp hq with rfl | hq
    · omega
    · rcases List.mem_cons.mp hq with rfl | hq
      · omega
      · have := hhiAll h hq; omega

/-- **H-sorted is necessary.** In `[1, 5, 3]` the adjacent pair `(1, 5)` brackets `3`, which is present. -/
theorem unsorted_neighbours_unsound :
    ¬ Sorted [1, 5, 3] ∧ (1 < 3 ∧ 3 < 5) ∧ 3 ∈ [1, 5, 3] := by
  refine ⟨?_, by decide, by decide⟩
  unfold Sorted; decide

/-- **Negative space 1 — disproved (by design).** Handle `3` is not in the epoch's list, so the
neighbour proof passes; it was revoked after the epoch. The proof speaks for the epoch only. -/
theorem stale_root_passes :
    let atEpoch := [1, 5]
    let now := [1, 3, 5]
    Sorted atEpoch ∧ 3 ∉ atEpoch ∧ 3 ∈ now := by
  refine ⟨?_, by decide, by decide⟩
  unfold Sorted; decide

end Formal.Gadgets
