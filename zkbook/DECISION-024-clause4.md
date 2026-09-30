# DG-024-4: cap profiles and counted spends

Status: co-chair's local draft choice, pending task-force review. No adoption or complete construction conformance is implied.

The draft permits two profiles. A secret-derived profile binds bounded slots to a stable enrolled secret. A transferable-token profile limits aggregate authorized issuance for a defined vetter set and accounting interval; pooling does not violate that aggregate bound but prevents an individual-holder cap.

Each profile must specify community, set, interval, budget, expiry, carry-over, serial namespace and retry semantics. Secret-derived serials are one way to enforce an individual quota, not the only possible construction. Neither profile establishes distinct people or prevents key sharing.

The common invariant is no additional counted spend. Conflicting reuse is refused. A profile may refuse every repeat or acknowledge an identical resubmission without changing counts; a consumed challenge remains unusable. Atomic durable ledger behavior is a separate implementation obligation.

The lab route implements bounded secret-derived slots and rejects repeated serials. Its existing tests do not establish a transferable-token implementation, complete admission policy, concurrent ledger correctness or unlinkability. The earlier sequential Lean model does not prove equivalence to either complete deployment.

Review gate: confirm cap-profile semantics, external policy ownership and evidence per clause before claiming conformance. A constructor choosing stronger individual enforcement does not automatically change the common specification. Any stricter common requirement returns to task-force review.
