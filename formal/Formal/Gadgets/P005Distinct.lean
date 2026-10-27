import Formal.Gadgets.Lists

/-!
# Record 005 — distinct member / distinct issuer

> A verifier learns that two credentials in one proof come from two distinct members (or issuers),
> with the duplicate case unsatisfiable rather than merely rejected.

Clause: `leaf_a ≠ leaf_b` enforced as a non-zero inverse constraint, `(a − b) · inv = 1`.

* `inverse_unsat_on_equal` — the constraint has no witness when `a = b`, over any commutative
  structure where `x − x = 0`, `0 · y = 0` and `0 ≠ 1`; `FinOps` discharges those for the circuit
  field `Fin n`, `n > 1` (so the BN254 scalar field, and any other). The converse (every `a ≠ b`
  has an inverse) needs `n` prime and is left to the Clean gate (G8).
* `owners_distinct` — the k-ary form every composed record uses: pairwise-distinct values, each
  owned by someone under a rule that gives one owner one value, come from pairwise-distinct owners.
  Record 024's soundness is an instance.
* Negative space 3 (distinct persons): `distinct_leaves_not_distinct_persons`.
-/

namespace Formal.Gadgets

/-- The three facts about a circuit field the inverse gadget needs. -/
structure FieldOps (F : Type) [Sub F] [Mul F] [OfNat F 0] [OfNat F 1] : Prop where
  sub_self : ∀ a : F, a - a = 0
  zero_mul : ∀ b : F, (0 : F) * b = 0
  zero_ne_one : (0 : F) ≠ 1

/-- **Clause 1, soundness: the duplicate case is unsatisfiable.** No `inv` satisfies
`(a − b) · inv = 1` when `a = b`. -/
theorem inverse_unsat_on_equal {F : Type} [Sub F] [Mul F] [OfNat F 0] [OfNat F 1]
    (h : FieldOps F) (a b inv : F) (hab : a = b) : (a - b) * inv ≠ 1 := by
  subst hab
  rw [h.sub_self, h.zero_mul]
  exact h.zero_ne_one

/-- The circuit field `Fin n` (arithmetic mod `n`) has the three facts for every `n > 1`. -/
theorem FinOps (n : Nat) [NeZero n] (hn : 1 < n) : FieldOps (Fin n) where
  sub_self a := by
    apply Fin.ext
    simp
  zero_mul b := by
    apply Fin.ext
    simp [Fin.mul_def]
  zero_ne_one := by
    intro h
    have h1 : (0 : Fin n).val = (1 : Fin n).val := congrArg Fin.val h
    have e0 : (0 : Fin n).val = 0 % n := rfl
    have e1 : (1 : Fin n).val = 1 % n := rfl
    rw [e0, e1, Nat.zero_mod, Nat.mod_eq_of_lt hn] at h1
    exact absurd h1 (by decide)

/-- **The k-ary distinctness lemma.** `owns m t` — owner `m` produced value `t`; `oneEach` — an owner
produces at most one value. Pairwise-distinct values, each with an owner satisfying `P`, come from
as many pairwise-distinct owners, each satisfying `P` and owning one of the values. -/
theorem owners_distinct {M T : Type} (owns : M → T → Prop) (P : M → Prop)
    (oneEach : ∀ m t t', owns m t → owns m t' → t = t') :
    ∀ ts : List T, ts.Nodup → (∀ t ∈ ts, ∃ m, owns m t ∧ P m) →
      ∃ ms : List M, ms.length = ts.length ∧ ms.Nodup ∧ ∀ m ∈ ms, P m ∧ ∃ t ∈ ts, owns m t
  | [], _, _ => ⟨[], rfl, List.nodup_nil, by simp⟩
  | t :: ts, hnd, hown => by
    rw [List.nodup_cons] at hnd
    obtain ⟨ms, hlen, hmnd, hms⟩ := owners_distinct owns P oneEach ts hnd.2
      (fun t' ht' => hown t' (List.mem_cons_of_mem t ht'))
    obtain ⟨m, hmt, hP⟩ := hown t (List.mem_cons_self ..)
    have hnot : m ∉ ms := by
      intro hm
      obtain ⟨_, t', ht', hmt'⟩ := hms m hm
      exact hnd.1 (oneEach m t t' hmt hmt' ▸ ht')
    refine ⟨m :: ms, by simp [hlen], List.nodup_cons.mpr ⟨hnot, hmnd⟩, ?_⟩
    intro v hv
    rcases List.mem_cons.mp hv with rfl | hv
    · exact ⟨hP, t, List.mem_cons_self .., hmt⟩
    · obtain ⟨hPv, t', ht', ho⟩ := hms v hv
      exact ⟨hPv, t', List.mem_cons_of_mem t ht', ho⟩

/-- **Negative space 3 — disproved.** Two distinct leaves held by one person: the clause is satisfied
(the leaves differ) and the members are distinct, but the persons are not. -/
theorem distinct_leaves_not_distinct_persons :
    ∃ (leaf : Nat → Nat) (person : Nat → Unit),
      leaf 1 ≠ leaf 2 ∧ (1 : Nat) ≠ 2 ∧ person 1 = person 2 :=
  ⟨id, fun _ => (), by decide, by decide, rfl⟩

end Formal.Gadgets
