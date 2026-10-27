import Formal.Gadgets.Spent

/-!
# Record 024 — the single-use rules: challenges, token serials, the drip

One machine covers two rejection families. A **spent set** accepts a value once: the community's
challenge (horizon line 2; codes `challenge-replayed`, `challenge-not-minted`) and each token serial
(clause 4; code `token-serial-spent`) are both instances. The drip (the construction's token issuance; codes
`token-batch-over-cap`, `token-tick-repeated`) is a separate guard on issuance.
-/

namespace Formal.R024

open Formal.Gadgets

variable {V : Type} [DecidableEq V]

/-- The community's challenge check: the proof verifies, and the community minted this challenge. -/
def challengeAdmissible (minted : List V) (ch : V) (verifies : Bool) : Bool :=
  verifies && decide (ch ∈ minted)

/-- **`challenge-not-minted`.** A challenge the community did not issue is refused, whatever the proof. -/
theorem not_minted_refused (st : Spent V) (minted : List V) (ch : V) (verifies : Bool)
    (h : ch ∉ minted) : st.present ch (challengeAdmissible minted ch verifies) = none := by
  simp [Spent.present, challengeAdmissible, h]

/-- The drip: at most `cap` tokens per batch, one batch per tick. -/
def drip (cap asked : Nat) (tickUsed : Bool) : Option Nat :=
  if tickUsed = false ∧ asked ≤ cap then some asked else none

/-- **`token-batch-over-cap`.** -/
theorem batch_over_cap_refused (cap asked : Nat) (t : Bool) (h : cap < asked) :
    drip cap asked t = none := by
  simp [drip]; omega

/-- **`token-tick-repeated`.** -/
theorem tick_repeated_refused (cap asked : Nat) : drip cap asked true = none := by
  simp [drip]

/-- A drip of 3 a tick refuses a request for 8. -/
example : drip 3 8 false = none := batch_over_cap_refused 3 8 false (by decide)

end Formal.R024
