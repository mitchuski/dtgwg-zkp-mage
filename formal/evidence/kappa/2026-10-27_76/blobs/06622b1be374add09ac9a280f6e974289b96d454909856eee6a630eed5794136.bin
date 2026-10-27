import Lake
open Lake DSL

-- The formal layer of the ZK Book (zkbook/PLAN-formal-layer.md).
-- A record's statement is a Lean definition; a construction may not claim
-- more than a theorem relating it to that definition has proved.
-- Core Lean only: no Mathlib, so the trusted base is the kernel plus the
-- three standard axioms, and nothing is downloaded to build it.

package Formal where
  leanOptions := #[
    ⟨`autoImplicit, false⟩,
    ⟨`relaxedAutoImplicit, false⟩]

@[default_target]
lean_lib Formal where

-- Axiom-footprint guard: every theorem the handover cites is printed here;
-- scripts/check-axioms.sh fails on sorryAx or any non-standard axiom.
lean_lib Checks where
