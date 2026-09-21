## References

This section is informative.

### Normative References

- **[DTG-CRED]** DTG Credentials Core Specification, Version 1.0, Document Status **Working Draft 0.4.0** — the minimum compatible Document Status for this draft (see Introduction, *Relationship to other specifications*). Read at `main` commit `994a3d63fe27d77ca6023f5a4aae8013272a6646` (2026-09-15: semantic versioning adopted, the VSC merged, the VDC, VAC and correlation-scope text). Sections are cited by title; the glossary is cross-referenced as the external specification `DTG_CRED`. The exact revision an implementation profile pins remains a profile decision. Trust over IP Foundation. <https://trustoverip.github.io/dtgwg-cred-spec/> · source: <https://github.com/trustoverip/dtgwg-cred-spec>
- **[DTG-ZKP-RULES]** Drafting rules of the DTG ZKP Task Force. <https://github.com/trustoverip/dtgwg-zkp-tf/blob/main/DRAFTING-RULES.md>
- **[RFC2119]** S. Bradner, "Key words for use in RFCs to Indicate Requirement Levels", BCP 14, RFC 2119, March 1997. <https://datatracker.ietf.org/doc/html/rfc2119>
- **[RFC8785]** A. Rundgren, B. Jordan, S. Erdtman, "JSON Canonicalization Scheme (JCS)", RFC 8785, June 2020. <https://datatracker.ietf.org/doc/html/rfc8785>
- **[VC-DI]** Verifiable Credential Data Integrity 1.0, W3C Recommendation — §2.6 (`digestMultibase`). <https://www.w3.org/TR/vc-data-integrity/>
- **[VC-DM]** Verifiable Credentials Data Model v2.0, W3C Recommendation. <https://www.w3.org/TR/vc-data-model-2.0/>

### Informative References

- **[DTG-ZKP-REQ]** Privacy-Preserving Proof of Liveness — Requirements, v0.4 (Proposed Task Force Working Draft). DTG ZKP Task Force. <https://github.com/trustoverip/dtgwg-zkp-tf/blob/main/proof-of-liveness-requirements.md> Source for the personhood/liveness use-case family and explicitly reused concepts; not a universal requirement for every DTG construction.

- **[AGENTPRIVACY]** M. Travers (privacymage), *agentprivacy* — the body of work from which this specification's Cryptographic Background is drawn and its root of understanding: the Zero Knowledge Spellbook (thirty expository chapters on zero-knowledge proof systems and their frontier addenda, 2026), the privacymage grimoire and explanatory material on privacy-preserving delegation. <https://agentprivacy.ai> · <https://github.com/mitchuski>
- **[ADR-001]** G. Gore, "Community-Anchored Proof — Choosing the first zero-knowledge use case to implement against DTG credentials", ADR-001, Proposed 2026-08-25. <https://docs.fpp.storm.ws/>
- **[PoP-2026]** A. R. Choudhuri, S. Garg, K. Lee, H. Montgomery, G. V. Policharla, R. Sinha, "A Cryptographic Framework for Proof of Personhood", IACR ePrint 2026/333. <https://eprint.iacr.org/2026/333>
- **[Groth16]** J. Groth, "On the Size of Pairing-based Non-interactive Arguments", EUROCRYPT 2016.
- **[Semaphore]** Semaphore protocol and zk-kit (Privacy & Scaling Explorations). <https://semaphore.pse.dev/> · <https://github.com/zk-kit>
- **[Flock]** R. Rothblum, B. Bünz, W. Wang, "Flock" — a SNARK for batches of Boolean computation (Succinct / Espresso Systems, June 2026). <https://blog.succinct.xyz/introducing-flock/> · <https://github.com/succinctlabs/flock>
- **[ProveKit]** ProveKit — client-side zero-knowledge proving toolkit (World Foundation, Atheon, Reilabs, Nethermind). <https://provekit.org/> · <https://github.com/worldfnd/provekit>
- **[SIROS-CAT]** SIROS Foundation ZK Circuit Catalog. <https://circuits.siros.org/> · <https://github.com/sirosfoundation/go-zk-circuits>
- **[Longfellow]** Google Longfellow ZK (libzk). <https://github.com/google/longfellow-zk>
- **[Circomspect]** Trail of Bits, Circomspect — static analyzer for Circom. <https://github.com/trailofbits/circomspect>
- **[DTG-ZKP-EVIDENCE]** DTG ZKP evidence repository — reference runtimes, conformance fixtures, verification registry, construction records. Apache-2.0 code, CC BY 4.0 documents. <https://github.com/mitchuski/dtgwg-zkp-mage> · the commit this revision was exported from is named in Appendix B.
- **[DTG-CRED-TF-39]** "Privacy: Appropriately supporting unlinkability, ZKP and selective disclosure", dtgwg-cred-tf discussion #39. <https://github.com/trustoverip/dtgwg-cred-tf/discussions/39>
- **[DTG-CRED-TF-40]** "Delegation as a case study in the design-time window", dtgwg-cred-tf discussion #40. <https://github.com/trustoverip/dtgwg-cred-tf/discussions/40>
- **[DTG-CRED-31]** "WD02 merge plan: sequencing the five outstanding PRs into a consistent whole", dtgwg-cred-spec issue #31 (closed 2026-09-10). <https://github.com/trustoverip/dtgwg-cred-spec/issues/31>
- **[DTG-CRED-9]** "Define the identity linkages required by the ZKP constructions", dtgwg-cred-spec issue #9 — the common-control requirement, the subject-or-issuer widening and the chain-predicate distinction (2026-09-10). <https://github.com/trustoverip/dtgwg-cred-spec/issues/9>
- **[DTG-CRED-38]** "Digest-valued binders are unsalted and enumerable; blinding is deferred from WD02", dtgwg-cred-spec issue #38. <https://github.com/trustoverip/dtgwg-cred-spec/issues/38>
- **[DTG-CRED-42]** "docs: say plainly what the ZK predicates are waiting on", dtgwg-cred-spec PR #42 (merged 2026-09-10) — the editor's note in §Zero-Knowledge and Selective Disclosure. <https://github.com/trustoverip/dtgwg-cred-spec/pull/42>
- **[DTG-TT]** DTG Core Trust Task Protocols — the Trust Tasks framework specification (draft; the revision a profile pins is a profile decision). <https://github.com/trustoverip/dtgwg-trust-tasks-tf/blob/main/SPEC.md>
- **[OPENVTC]** OpenVTC verifiable trust infrastructure — a candidate integration target, revision to be pinned. <https://github.com/OpenVTC/verifiable-trust-infrastructure>
- **[AKITA]** Lattice Jolt / Akita — a Module-SIS-based polynomial commitment scheme announced 2026-09-09 as a post-quantum proving route; research software, zero knowledge in a forthcoming companion paper. <https://a16zcrypto.com/posts/article/lattice-snarks-jolt-post-quantum-faster> · <https://github.com/LayerZero-Labs/akita>
- **[LONGFELLOW-PQCA]** Google, "Donating the Longfellow ZKP library to the Post-Quantum Cryptography Alliance" (Linux Foundation Europe), 2026-09-02 — library stewardship and provenance, distinct from the SIROS catalogue's artefact provenance. <https://blog.google/products-and-platforms/platforms/google-pay/zero-knowledge-proof-library-linux-foundation/>
- **[DTG-ZKP-TF-CALL-2026-09-08]** DTG ZKP Task Force meeting notes, 2026-09-08 (ToIP Confluence) — ADR-001 confirmed as the first proof; the blind-signature vouch alternative; the same-context pseudonym caveat; the credential signature scheme as the non-swappable choice. <https://lf-toip.atlassian.net/wiki/spaces/HOME/pages/1132953601>
