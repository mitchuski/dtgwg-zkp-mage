# K · cred-tf #39 — the four ZKP TF work items now have construction records; one proving system is new
chip: BEFORE 8 SEPT · SCOTT'S THREAD
thread: https://github.com/trustoverip/dtgwg-cred-tf/discussions/39
note: Scott placed four work items on the record here on 25 August and is taking the artifact gap to the Berkeley authors on 8 September. This gives each item its record id and adds the one proving-system entry that changes the hash-side conversation. Post before the call; send Scott the records as well.
ledger: 28
proverb: Four asks were spoken in one thread; each now has a record that can fail.
---
The four work items placed on the record on 25 August each have a construction record in the ZKP specification draft (`trustoverip/dtgwg-zkp-spec`, pull request forthcoming), so each can now be argued against something that fails.

- **The blinded binder** is record 008. Route 1, a salted commitment to `taskContext`, is available now; route 2, a PRF-derived per-context pseudonym, is the fuller construction. The one member it asks of the credential layer is a `digestMultibase`-encoded commitment in place of the plaintext pairing. Its negative space is the artifact gap stated plainly: it blinds the copy the credential carries, not the copy the framework holds.
- **Issuer-as-predicate** is the alias of record 001 — membership over an accredited root, with the issuer proven to belong to the set rather than named.
- **Delegation-chain validity** is record 020, carded from the #40 decomposition: act ∈ scope_n ⊆ … ⊆ scope_root, bounded depth, monotone expiry, non-membership revocation, with the delegate's acceptance countersignature as a clause. The core/profile split is respected: the single-hop core needs no chain proof; the record proves the chained profile.
- **The set-root primitive** is a construction option on record 006 and a public-input convention: a signed, published root plus a membership or non-membership witness carried in the presentation, with no live lookup as the privacy profile's default and any remaining fetch stated as a correlation surface.

One proving-system entry is new since 25 August and belongs in the Berkeley conversation. Flock — the binary-field SNARK for batched Boolean computation built for Ethereum's post-quantum transition — proves standard hashes at under 250× the cost of computing them. That lets a registry keep SHA-256 or BLAKE3 roots and relieves the hash side of the X3 issuance requirement entirely; the signature side stays open. The question the records leave for the paper's authors is the one this thread already framed: whether committing `taskContext` at the framework layer closes the artifact gap, or only moves it.
