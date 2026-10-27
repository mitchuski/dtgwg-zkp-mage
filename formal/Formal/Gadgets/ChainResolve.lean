/-!
# Gadget · chain-resolve (records 020 and 021, clause 1)

> act ∈ scope_n ⊆ … ⊆ scope_root, validUntil monotone along the chain, and depth bounded by every
> ancestor: a hop below a parent bearing `maxDepth` n bears at most n − 1, no hop lies more than n
> steps below an ancestor bearing n, and no hop exists below a parent that omits `maxDepth` or sets
> it to 0.

The clause states global properties; a verifier checks each parent–child pair (`Step`). The theorems
here are the bridge: **the local checks imply the global properties**, for every ancestor at once.

* `scope_within_every_ancestor` — every descendant's scope is inside every ancestor's.
* `validity_within_every_ancestor` — no descendant outlives an ancestor.
* `depth_within_every_ancestor` — no hop lies more than n steps below an ancestor bearing n.
* `no_decrement_unbounded` — **the "at most n − 1" rule is necessary**: with only "a parent must bear
  at least 1", a chain runs deeper than its root allows.

A chain is a list, root first. `maxDepth = 0` stands for both "omitted" and "0": nothing below.
-/

namespace Formal.Gadgets

/-- One hop: the actions or scope it confers, its expiry, its depth allowance. -/
structure Hop (A : Type) where
  scope      : List A
  validUntil : Nat
  maxDepth   : Nat

variable {A : Type}

/-- What a verifier checks for one parent–child pair. -/
def Step (p c : Hop A) : Prop :=
  (∀ a ∈ c.scope, a ∈ p.scope) ∧ c.validUntil ≤ p.validUntil ∧ 1 ≤ p.maxDepth ∧ c.maxDepth ≤ p.maxDepth - 1

/-- Every adjacent pair passes `Step`. -/
def ChainOK : List (Hop A) → Prop
  | [] => True
  | [_] => True
  | p :: c :: rest => Step p c ∧ ChainOK (c :: rest)

theorem ChainOK.tail {h : Hop A} {rest : List (Hop A)} (hc : ChainOK (h :: rest)) : ChainOK rest := by
  match rest, hc with
  | [], _ => trivial
  | _ :: _, hc => exact hc.2

/-- **Scope narrows**: every descendant of `h` confers only what `h` confers. -/
theorem scope_within_every_ancestor :
    ∀ (h : Hop A) (rest : List (Hop A)), ChainOK (h :: rest) → ∀ c ∈ rest, ∀ a ∈ c.scope, a ∈ h.scope
  | _, [], _, _, hc, _, _ => absurd hc List.not_mem_nil
  | h, c :: rest, hok, d, hd, a, ha => by
    obtain ⟨hstep, htail⟩ := hok
    rcases List.mem_cons.mp hd with rfl | hd
    · exact hstep.1 a ha
    · exact hstep.1 a (scope_within_every_ancestor c rest htail d hd a ha)

/-- **Validity is monotone**: no descendant of `h` outlives it. -/
theorem validity_within_every_ancestor :
    ∀ (h : Hop A) (rest : List (Hop A)), ChainOK (h :: rest) → ∀ c ∈ rest, c.validUntil ≤ h.validUntil
  | _, [], _, _, hc => absurd hc List.not_mem_nil
  | h, c :: rest, hok, d, hd => by
    obtain ⟨hstep, htail⟩ := hok
    rcases List.mem_cons.mp hd with rfl | hd
    · exact hstep.2.1
    · exact Nat.le_trans (validity_within_every_ancestor c rest htail d hd) hstep.2.1

/-- **Depth is bounded by the hop itself**: below a hop bearing n there are at most n hops. -/
theorem depth_below :
    ∀ (h : Hop A) (rest : List (Hop A)), ChainOK (h :: rest) → rest.length ≤ h.maxDepth
  | _, [], _ => Nat.zero_le _
  | h, c :: rest, hok => by
    obtain ⟨hstep, htail⟩ := hok
    have := depth_below c rest htail
    have := hstep.2.2
    simp only [List.length_cons]
    omega

/-- **Depth is bounded by every ancestor**: no hop lies more than n steps below any ancestor bearing
n — `depth_below` applied at every position of the chain. -/
theorem depth_within_every_ancestor :
    ∀ (pre : List (Hop A)) (h : Hop A) (rest : List (Hop A)),
      ChainOK (pre ++ h :: rest) → rest.length ≤ h.maxDepth
  | [], h, rest, hok => depth_below h rest hok
  | _ :: pre, h, rest, hok => depth_within_every_ancestor pre h rest (ChainOK.tail hok)

/-- The weaker check, without "at most n − 1": a parent need only bear at least 1. -/
def WeakStep (p c : Hop A) : Prop :=
  (∀ a ∈ c.scope, a ∈ p.scope) ∧ c.validUntil ≤ p.validUntil ∧ 1 ≤ p.maxDepth

/-- **The decrement rule is necessary.** Three hops each bearing `maxDepth` 1 pass the weak check
pairwise, yet the leaf lies 2 steps below a root that allows 1 — and the real check refuses it. -/
theorem no_decrement_unbounded :
    let h : Hop Nat := ⟨[1], 10, 1⟩
    WeakStep h h ∧ WeakStep h h ∧ ¬ ([h, h] : List (Hop Nat)).length ≤ h.maxDepth ∧ ¬ ChainOK [h, h, h] := by
  refine ⟨⟨fun a ha => ha, Nat.le_refl _, by decide⟩, ⟨fun a ha => ha, Nat.le_refl _, by decide⟩, by decide, ?_⟩
  rintro ⟨⟨_, _, _, hd⟩, _⟩
  simp at hd

/-- The last hop of the chain satisfies `P` (the leaf's property, as a verifier checks it once). -/
def LastHas (P : Hop A → Prop) : List (Hop A) → Prop
  | [] => True
  | [x] => P x
  | _ :: rest => LastHas P rest

/-- **An action the leaf confers is conferred by every hop** (the leaf check suffices). -/
theorem leaf_act_all (act : A) :
    ∀ l : List (Hop A), ChainOK l → LastHas (fun h => act ∈ h.scope) l → ∀ h ∈ l, act ∈ h.scope
  | [], _, _, _, hh => absurd hh List.not_mem_nil
  | [x], _, hl, h, hh => by simp at hh; subst hh; exact hl
  | p :: c :: rest, hok, hl, h, hh => by
    obtain ⟨hstep, htail⟩ := hok
    have ih := leaf_act_all act (c :: rest) htail hl
    rcases List.mem_cons.mp hh with rfl | hh
    · exact hstep.1 act (ih c (List.mem_cons_self ..))
    · exact ih h hh

/-- **A leaf that has not expired means no hop has** (validity is monotone). -/
theorem leaf_valid_all (now : Nat) :
    ∀ l : List (Hop A), ChainOK l → LastHas (fun h => now ≤ h.validUntil) l → ∀ h ∈ l, now ≤ h.validUntil
  | [], _, _, _, hh => absurd hh List.not_mem_nil
  | [x], _, hl, h, hh => by simp at hh; subst hh; exact hl
  | p :: c :: rest, hok, hl, h, hh => by
    obtain ⟨hstep, htail⟩ := hok
    have ih := leaf_valid_all now (c :: rest) htail hl
    rcases List.mem_cons.mp hh with rfl | hh
    · exact Nat.le_trans (ih c (List.mem_cons_self ..)) hstep.2.1
    · exact ih h hh

end Formal.Gadgets
