import Formal.Gadgets.P001Membership
import Formal.Gadgets.P022DigestRef

/-!
# Record 013 — mutual edge admissibility (cred-spec #25)

> Each party learns that the counterparty's committed half of a proposed cross-community edge would be
> admitted under this party's community's published admissibility policy … neither half is revealed
> until both answers are yes.

Two parts, both checked here:

**One direction's proof** (clauses 1–3), composed from the library: the half is committed (record 022's
salted opening); its *form* — the subject's correlation scope and whether it claims membership — is a
leaf of the counterparty's policy tree (record 001); where the form claims membership, the subject's
grant is a leaf of the prover's own community tree (record 001 again). `soundness`.

**The exchange** (the ordering the request asks for): commitments first, answers only after both
commitments, revelation only after both answers are yes, and no commitment changes once an answer
exists. `exchange_safe` holds over **any** sequence of events.
-/

namespace Formal.R013

open Formal.Gadgets

/-- The half's form, as a community's policy reads it: correlation scope, and membership claimed. -/
structure Form (Scope : Type) where
  scope  : Scope
  member : Bool
  deriving DecidableEq

variable {Scope Leaf D B U R : Type}

/-- One direction: the prover's half `bytes` (salt `u`) is committed as `c`; its form lies in the
counterparty's policy tree; if it claims membership, the subject's leaf lies in the prover's tree. -/
def Accepts (h : B → U → R) (hl : Form Scope → D) (hn : D → D → D) (hm : Leaf → D)
    (policy : MTree (Form Scope)) (own : MTree Leaf)
    (c : R) (bytes : B) (u : U) (form : Form Scope) (subjectLeaf : Leaf)
    (pPolicy pOwn : List (Bool × D)) : Prop :=
  h bytes u = c ∧
  pathRoot hn pPolicy (hl form) = policy.root hl hn ∧
  (form.member = true → pathRoot hn pOwn (hm subjectLeaf) = own.root hm hn)

/-- **Soundness of one direction.** The committed half is the one whose form was proven, the form is
one the counterparty's policy accepts, and a claimed membership is real. -/
theorem soundness (h : B → U → R) (hl : Form Scope → D) (hn : D → D → D) (hm : Leaf → D)
    (policy : MTree (Form Scope)) (own : MTree Leaf)
    (c : R) (bytes : B) (u : U) (form : Form Scope) (subjectLeaf : Leaf) (pPolicy pOwn : List (Bool × D))
    (hH : ∀ b u b' u', h b u = h b' u' → b = b' ∧ u = u')
    (hlInj : ∀ a b, hl a = hl b → a = b) (hmInj : ∀ a b, hm a = hm b → a = b)
    (hNode : ∀ x y x' y', hn x y = hn x' y' → x = x' ∧ y = y')
    (hDomF : ∀ a x y, hl a ≠ hn x y) (hDomM : ∀ a x y, hm a ≠ hn x y)
    (hAcc : Accepts h hl hn hm policy own c bytes u form subjectLeaf pPolicy pOwn) :
    (∀ b', RefRel h c b' → b' = bytes) ∧ form ∈ policy.leaves ∧
      (form.member = true → subjectLeaf ∈ own.leaves) := by
  obtain ⟨hc, hp, ho⟩ := hAcc
  refine ⟨fun b' hb' => reference_opens_once h hH c b' bytes hb' ⟨u, hc⟩,
    path_sound hl hn hlInj hNode hDomF form policy pPolicy hp, ?_⟩
  intro hmem
  exact path_sound hm hn hmInj hNode hDomM subjectLeaf own pOwn (ho hmem)

/-! ## The exchange -/

/-- Events of the two-party exchange. `answer` records whether the other party's proof verified. -/
inductive Ev (C : Type) where
  | commitA : C → Ev C
  | commitB : C → Ev C
  | answerA : Bool → Ev C
  | answerB : Bool → Ev C
  | reveal  : Ev C

structure St (C : Type) where
  cA : Option C := none
  cB : Option C := none
  aA : Option Bool := none
  aB : Option Bool := none
  revealed : Bool := false

variable {C : Type}

/-- The exchange rule. `none` = the event is refused. -/
def step (st : St C) : Ev C → Option (St C)
  | .commitA c => if st.cA = none ∧ st.aA = none ∧ st.aB = none then some { st with cA := some c } else none
  | .commitB c => if st.cB = none ∧ st.aA = none ∧ st.aB = none then some { st with cB := some c } else none
  | .answerA b => if st.cA.isSome ∧ st.cB.isSome ∧ st.aA = none then some { st with aA := some b } else none
  | .answerB b => if st.cA.isSome ∧ st.cB.isSome ∧ st.aB = none then some { st with aB := some b } else none
  | .reveal    => if st.aA = some true ∧ st.aB = some true then some { st with revealed := true } else none

/-- Run a sequence of events; refused events are skipped (a party retries or gives up). -/
def run : St C → List (Ev C) → St C
  | st, [] => st
  | st, e :: es => run ((step st e).getD st) es

/-- The exchange's safety invariant. -/
def Safe (st : St C) : Prop :=
  (st.revealed = true → st.aA = some true ∧ st.aB = some true) ∧
  ((st.aA.isSome ∨ st.aB.isSome) → st.cA.isSome ∧ st.cB.isSome)

theorem safe_init : Safe ({} : St C) := by
  constructor <;> simp

theorem safe_step (st : St C) (e : Ev C) (hs : Safe st) : Safe ((step st e).getD st) := by
  obtain ⟨hr, ha⟩ := hs
  cases e with
  | commitA c =>
    simp only [step]; split
    · rename_i hc; refine ⟨fun h => hr h, ?_⟩; simp_all
    · exact ⟨hr, ha⟩
  | commitB c =>
    simp only [step]; split
    · rename_i hc; refine ⟨fun h => hr h, ?_⟩; simp_all
    · exact ⟨hr, ha⟩
  | answerA b =>
    simp only [step]; split
    · rename_i hc
      refine ⟨fun h => ?_, fun _ => ⟨hc.1, hc.2.1⟩⟩
      obtain ⟨h1, h2⟩ := hr h
      simp_all
    · exact ⟨hr, ha⟩
  | answerB b =>
    simp only [step]; split
    · rename_i hc
      refine ⟨fun h => ?_, fun _ => ⟨hc.1, hc.2.1⟩⟩
      obtain ⟨h1, h2⟩ := hr h
      simp_all
    · exact ⟨hr, ha⟩
  | reveal =>
    simp only [step]; split
    · rename_i hc; exact ⟨fun _ => hc, ha⟩
    · exact ⟨hr, ha⟩

/-- **The exchange is safe over any run**: a half is revealed only after both answers are yes, and no
answer exists before both commitments. -/
theorem exchange_safe : ∀ (es : List (Ev C)) (st : St C), Safe st → Safe (run st es)
  | [], _, hs => hs
  | e :: es, st, hs => exchange_safe es _ (safe_step st e hs)

/-- **Commitments are frozen once an answer exists**: whoever answers first cannot have its
counterparty re-commit to a different half afterwards. -/
theorem commit_frozen (st : St C) (c : C) (hans : st.aA.isSome ∨ st.aB.isSome) :
    step st (.commitA c) = none ∧ step st (.commitB c) = none := by
  constructor <;> simp only [step] <;> split <;> (try rfl) <;>
    (rename_i h; rcases hans with hans | hans <;> simp_all)

/-- **No fairness**: after both answers are yes, nothing makes a party reveal — a run that stops
there is safe and leaves the half unrevealed. -/
theorem no_fairness :
    let st : St Nat := run {} [.commitA 1, .commitB 2, .answerA true, .answerB true]
    Safe st ∧ st.aA = some true ∧ st.aB = some true ∧ st.revealed = false := by
  refine ⟨exchange_safe _ _ safe_init, ?_⟩
  decide

end Formal.R013
