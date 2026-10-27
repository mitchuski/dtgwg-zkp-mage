/-!
# Record 001 — set membership over an accredited root

> A verifier learns that the holder's credential commitment is a leaf of a published membership
> root, without learning which leaf.

Clause: the committed leaf is in the tree at `root`. Modelled as a real Merkle tree: `hl` hashes a
leaf, `hn` hashes two children, a path is read root-to-leaf.

* `path_sound` — a path that hashes the leaf to the root proves the leaf is in the tree, given
  **H-node** (`hn` injective), **H-leaf** (`hl` injective) and **H-domain** (no leaf hash equals a
  node hash).
* `path_complete` — every leaf of the tree has such a path.
* `no_domain_second_preimage` — **H-domain is necessary**: without it, an internal node passes as a
  leaf (the second-preimage shape). The lab circuit's defence is a fixed path length (depth 20);
  `path_sound_fixed_depth` proves that defence too, for a tree of uniform depth, with no H-domain.
-/

namespace Formal.Gadgets

/-- A binary tree with leaves of type `α`. -/
inductive MTree (α : Type) where
  | leaf : α → MTree α
  | node : MTree α → MTree α → MTree α

variable {α D : Type}

def MTree.leaves : MTree α → List α
  | .leaf a => [a]
  | .node l r => l.leaves ++ r.leaves

def MTree.root (hl : α → D) (hn : D → D → D) : MTree α → D
  | .leaf a => hl a
  | .node l r => hn (l.root hl hn) (r.root hl hn)

/-- Recompute a root from a leaf hash and a root-to-leaf path of (went right?, sibling) steps. -/
def pathRoot (hn : D → D → D) : List (Bool × D) → D → D
  | [], x => x
  | (true, sib) :: rest, x => hn sib (pathRoot hn rest x)
  | (false, sib) :: rest, x => hn (pathRoot hn rest x) sib

/-- **Soundness of the membership clause.** -/
theorem path_sound (hl : α → D) (hn : D → D → D)
    (hLeaf : ∀ a b, hl a = hl b → a = b)
    (hNode : ∀ x y x' y', hn x y = hn x' y' → x = x' ∧ y = y')
    (hDomain : ∀ a x y, hl a ≠ hn x y) (a : α) :
    ∀ (t : MTree α) (p : List (Bool × D)), pathRoot hn p (hl a) = t.root hl hn → a ∈ t.leaves
  | .leaf b, [], h => by simp [pathRoot, MTree.root] at h; simp [MTree.leaves, hLeaf a b h]
  | .leaf b, (true, s) :: rest, h => absurd h.symm (hDomain b _ _)
  | .leaf b, (false, s) :: rest, h => absurd h.symm (hDomain b _ _)
  | .node l r, [], h => absurd h (hDomain a _ _)
  | .node l r, (true, s) :: rest, h => by
    have := (hNode _ _ _ _ h).2
    simp [MTree.leaves, path_sound hl hn hLeaf hNode hDomain a r rest this]
  | .node l r, (false, s) :: rest, h => by
    have := (hNode _ _ _ _ h).1
    simp [MTree.leaves, path_sound hl hn hLeaf hNode hDomain a l rest this]

/-- **Completeness:** every leaf has a path. -/
theorem path_complete (hl : α → D) (hn : D → D → D) (a : α) :
    ∀ t : MTree α, a ∈ t.leaves → ∃ p, pathRoot hn p (hl a) = t.root hl hn
  | .leaf b, h => by
    simp [MTree.leaves] at h; subst h; exact ⟨[], rfl⟩
  | .node l r, h => by
    simp only [MTree.leaves, List.mem_append] at h
    rcases h with h | h
    · obtain ⟨p, hp⟩ := path_complete hl hn a l h
      exact ⟨(false, r.root hl hn) :: p, by simp [pathRoot, MTree.root, hp]⟩
    · obtain ⟨p, hp⟩ := path_complete hl hn a r h
      exact ⟨(true, l.root hl hn) :: p, by simp [pathRoot, MTree.root, hp]⟩

/-- A tree whose every leaf sits at depth `d`. -/
def MTree.uniform : MTree α → Nat → Prop
  | .leaf _, d => d = 0
  | .node l r, d => ∃ d', d = d' + 1 ∧ l.uniform d' ∧ r.uniform d'

/-- **The fixed-depth defence.** For a uniform tree of depth `d` and a path of exactly `d` steps,
the path proves membership without H-domain — the shape of the lab circuit (depth 20). -/
theorem path_sound_fixed_depth (hl : α → D) (hn : D → D → D)
    (hLeaf : ∀ a b, hl a = hl b → a = b)
    (hNode : ∀ x y x' y', hn x y = hn x' y' → x = x' ∧ y = y') (a : α) :
    ∀ (t : MTree α) (p : List (Bool × D)), t.uniform p.length →
      pathRoot hn p (hl a) = t.root hl hn → a ∈ t.leaves
  | .leaf b, [], _, h => by simp [pathRoot, MTree.root] at h; simp [MTree.leaves, hLeaf a b h]
  | .leaf b, _ :: _, hu, _ => by simp [MTree.uniform] at hu
  | .node l r, [], hu, _ => by simp [MTree.uniform] at hu
  | .node l r, (true, s) :: rest, hu, h => by
    obtain ⟨d', hd, _, hr⟩ := hu
    simp at hd; subst hd
    simp [MTree.leaves, path_sound_fixed_depth hl hn hLeaf hNode a r rest hr (hNode _ _ _ _ h).2]
  | .node l r, (false, s) :: rest, hu, h => by
    obtain ⟨d', hd, hl', _⟩ := hu
    simp at hd; subst hd
    simp [MTree.leaves, path_sound_fixed_depth hl hn hLeaf hNode a l rest hl' (hNode _ _ _ _ h).1]

/-- Digests as a free structure: `hn` is `pair`, injective by construction. -/
inductive FreeDigest where
  | base : Nat → FreeDigest
  | pair : FreeDigest → FreeDigest → FreeDigest
  deriving DecidableEq

/-- **H-domain is necessary** (with variable-length paths). Leaves are digests hashed by the
identity; the tree's own root, presented as a "leaf" with the empty path, verifies — and is not a
leaf. Both hashes are injective; only the domains overlap. -/
theorem no_domain_second_preimage :
    let t : MTree FreeDigest := .node (.leaf (.base 1)) (.leaf (.base 2))
    let a : FreeDigest := .pair (.base 1) (.base 2)
    pathRoot FreeDigest.pair [] (id a) = t.root id FreeDigest.pair ∧ a ∉ t.leaves := by
  simp [pathRoot, MTree.root, MTree.leaves]

end Formal.Gadgets
