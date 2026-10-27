/-!
# Gadget · single use — a spent set

One machine for every "presented once" rule in the specification: record 002's nullifier set
(`nullifier-reused`), record 003's verifier replay policy, record 024's challenge and token serial.
A value is accepted once; over any run of presentations each value is accepted at most once.
-/

namespace Formal.Gadgets

/-- A spent set. -/
structure Spent (V : Type) where
  spent : List V

variable {V : Type} [DecidableEq V]

/-- Present `v`; `admissible` is everything else the verifier checked (for a challenge: the proof
verifies and the community minted `v`; for a serial: the token's blind signature verifies). -/
def Spent.present (st : Spent V) (v : V) (admissible : Bool) : Option (Spent V) :=
  if admissible = true ∧ v ∉ st.spent then some ⟨v :: st.spent⟩ else none

/-- **`challenge-replayed` / `token-serial-spent`.** Once accepted, the same value is refused. -/
theorem replay_refused (st st' : Spent V) (v : V) (b b' : Bool)
    (h : st.present v b = some st') : st'.present v b' = none := by
  unfold Spent.present at h ⊢
  split at h
  · cases h; simp
  · cases h

/-- Run a sequence of presentations; return the final state and the values accepted, in order. -/
def Spent.run (st : Spent V) : List (V × Bool) → Spent V × List V
  | [] => (st, [])
  | (v, b) :: rest =>
    match st.present v b with
    | some st' => let r := st'.run rest; (r.1, v :: r.2)
    | none => st.run rest

/-- **Counted at most once, over any run.** The accepted values are pairwise distinct and none was
already spent — however many times, and in whatever order, a value is presented. -/
theorem run_once : ∀ (subs : List (V × Bool)) (st : Spent V),
    (st.run subs).2.Nodup ∧ ∀ v ∈ (st.run subs).2, v ∉ st.spent
  | [], _ => ⟨List.nodup_nil, by simp [Spent.run]⟩
  | (v, b) :: rest, st => by
    unfold Spent.run
    cases hp : st.present v b with
    | none =>
      simp only
      exact run_once rest st
    | some st' =>
      simp only
      unfold Spent.present at hp
      split at hp
      · rename_i hc
        cases hp
        obtain ⟨hnd, hfresh⟩ := run_once rest ⟨v :: st.spent⟩
        refine ⟨List.nodup_cons.mpr ⟨fun hv => hfresh v hv (List.mem_cons_self ..), hnd⟩, ?_⟩
        intro w hw
        rcases List.mem_cons.mp hw with rfl | hw
        · exact hc.2
        · exact fun hs => hfresh w hw (List.mem_cons_of_mem v hs)
      · cases hp

end Formal.Gadgets
