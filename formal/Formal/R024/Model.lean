/-!
# Record 024 — hidden-vetting admission: the model

Record 024 of the DTG ZKP draft (hidden-vetting admission, 2026-09-23):

> The issuing community learns that k pairwise-distinct eligible vetters of the live period each
> attested this applicant's per-application identifier with the stated facts, without learning
> which of its vetters attested, any vetter's DID, or whether a vetter has attested for anyone else.

The record is construction-neutral. This model reads it for a class-credential construction: an
eligible vetter is a member holding a credential under a live vetter class label, and "none of them
is the applicant" (clause 7) is read as "no attester's secret is the applicant's". Clause numbers
below are the record's.

The construction (Σ-PS with Tag_DDH over BLS12-381) is not in this file. Its cryptography is
abstract: each primitive is a function, and each property the construction is claimed to have is a
**named hypothesis** a theorem takes as an argument — never an axiom. So every theorem here reads
"if the construction has properties A…, the community's counting rule yields the record's
statement", and each hypothesis is one obligation to discharge against the construction's source.
-/

namespace Formal.R024

/-- What the community has issued and publishes.

* `cred m L` — the secret identifier inside member `m`'s class credential under label `L`.
  A *function*: at most one class credential per member per label (the issuance rule), which the
  community keeps as a record in its own store before it blind-signs.
* `live L` — `L` is a live vetter class label (clause 1).
* `tag s a` — the tag an attestation by secret `s` carries for applicant identifier `a` (clause 2):
  deterministic in both. -/
structure Deployment (Member Secret Label Ident Tag : Type) where
  cred : Member → Label → Option Secret
  live : Label → Prop
  tag  : Secret → Ident → Tag

variable {Member Secret Label Ident Tag : Type}

/-- **The record's statement** as a definition: at least `k` pairwise-distinct members, none of
them the applicant, each holding a live class credential whose tag on this applicant's identifier
is among the tags the community counted. -/
def Statement (D : Deployment Member Secret Label Ident Tag)
    (applicant : Member) (a : Ident) (tags : List Tag) (k : Nat) : Prop :=
  ∃ vs : List Member, k ≤ vs.length ∧ vs.Nodup ∧
    ∀ v ∈ vs, v ≠ applicant ∧ ∃ L s, D.live L ∧ D.cred v L = some s ∧ D.tag s a ∈ tags

/-! ## Hypotheses — the obligations the construction must discharge -/

/-- **H-Σ (clauses 1, 2, 7 — soundness of the proof system).** Every tag in an accepted proof was
produced by a class credential the community actually issued under a live label, and its secret is
not the applicant's per-application secret `aSec`. Discharging it takes the construction's knowledge
soundness AND credential unforgeability (an accepted credential was issued, not forged), AND
validation that every received tag is in the prime-order group: a tag with a small-order component
is a different point for the same key, so without that check one attester counts as two — an
overcount, which is why it belongs here and not in the completeness-only `TagInjective`. -/
def Extractable (D : Deployment Member Secret Label Ident Tag)
    (aSec : Secret) (a : Ident) (tags : List Tag) : Prop :=
  ∀ t ∈ tags, ∃ m L s, D.live L ∧ D.cred m L = some s ∧ D.tag s a = t ∧ s ≠ aSec

/-- **H-stable (issuance: "the epoch rides in the class label, not in the key").** A member's class
credentials under different labels carry the same secret identifier. Needed only when one proof
mixes attestations across a rotation; `NegativeSpace.rekey_counts_twice` shows what fails without it. -/
def SecretStable (D : Deployment Member Secret Label Ident Tag) : Prop :=
  ∀ m L L' s s', D.cred m L = some s → D.cred m L' = some s' → s = s'

/-- **H-applicant (clause 7's premise).** If the applicant holds any class credential, its secret is
the applicant's own secret `aSec` — so "no attester's secret equals the applicant's" means
"no attester is the applicant". Vacuous for a first-time joiner, who holds none. -/
def ApplicantSecret (D : Deployment Member Secret Label Ident Tag)
    (applicant : Member) (aSec : Secret) : Prop :=
  ∀ L s, D.cred applicant L = some s → s = aSec

/-- **H-fresh (completeness: blind issuance).** Two members never hold the same secret under one label. -/
def SecretFresh (D : Deployment Member Secret Label Ident Tag) (L : Label) : Prop :=
  ∀ m m' s, D.cred m L = some s → D.cred m' L = some s → m = m'

/-- **H-tag (completeness: Tag_DDH is collision-free for a fixed applicant).** -/
def TagInjective (D : Deployment Member Secret Label Ident Tag) (a : Ident) : Prop :=
  ∀ s s', D.tag s a = D.tag s' a → s = s'

/-- **The community's counting rule (clause 3).** The proof verifies with every tag extractable, the
tags are pairwise distinct, and there are at least `k` of them. -/
def Counts (D : Deployment Member Secret Label Ident Tag)
    (aSec : Secret) (a : Ident) (tags : List Tag) (k : Nat) : Prop :=
  Extractable D aSec a tags ∧ tags.Nodup ∧ k ≤ tags.length

end Formal.R024
