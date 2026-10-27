/-!
# Record 004 — holder binding (key from secret)

> A verifier learns that the presenting key is derived from the same secret the credentials were
> issued to, without learning the secret or any long-term key.

Clause: `pk = PRF(secret, context)` **and** the credential commitment opens to the same secret.
`com s r` is the credential commitment under randomness `r`.

* `key_from_credential_secret` — given **H-com** (the commitment is binding: `com` injective as a
  pair), every opening of the credential's commitment gives the same presentation key: the key is
  derived from *the* secret the credential was issued to.
* `unbound_key_unsound` — **the commitment clause is necessary**: without it, a key derived from any
  secret passes (`key-not-derived-from-secret` never fires).
* Negative space 1 and 2 (non-transfer, sharing) are out of scope by construction: the relation
  reads the secret and names no party.
-/

namespace Formal.Gadgets

variable {S Rn Ctx K Cm : Type}

/-- The clause, for credential commitment `cm`. -/
def HolderRel (prf : S → Ctx → K) (com : S → Rn → Cm) (cm : Cm) (c : Ctx) (pk : K) : Prop :=
  ∃ s r, com s r = cm ∧ prf s c = pk

/-- **The presenting key is the credential secret's key.** -/
theorem key_from_credential_secret (prf : S → Ctx → K) (com : S → Rn → Cm)
    (hCom : ∀ s r s' r', com s r = com s' r' → s = s' ∧ r = r')
    (s₀ : S) (r₀ : Rn) (c : Ctx) (pk : K)
    (h : HolderRel prf com (com s₀ r₀) c pk) : pk = prf s₀ c := by
  obtain ⟨s, r, hcm, rfl⟩ := h
  rw [(hCom s r s₀ r₀ hcm).1]

/-- **The commitment clause is necessary.** Credential issued to secret `1`; a key from secret `2`
satisfies `pk = PRF(s, c)` for *some* `s`, and is not the credential's key. -/
theorem unbound_key_unsound :
    let prf : Nat → Unit → Nat := fun s _ => s
    (∃ s, prf s () = 2) ∧ prf 1 () ≠ 2 :=
  ⟨⟨2, rfl⟩, by decide⟩

end Formal.Gadgets
