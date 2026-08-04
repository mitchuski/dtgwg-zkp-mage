---
title: "Decision §12 — PR-ISS: issuer qualification"
section: "decision"
source: "predicate-assurance-boundary-decision.md"
built_from_commitish: "working-tree"
order: 17
---
## 12. PR-ISS: issuer qualification

### 12.1 Statement established

The issuer that signed the attestation belongs to an accepted, current issuer set or satisfies an accepted accreditation predicate under a named governance framework and snapshot or effective time.

### 12.2 Negative meaning

PR-ISS does not establish:

- that the issuer's individual determination was correct;
- that all issuers in the set provide equal assurance;
- issuer independence;
- absence of collusion;
- that issuer identity must always be concealed.

### 12.3 Issuer concealment decision

Issuer concealment SHALL be profile-specific. A verifier may legitimately need to know the accreditation framework, policy version, assurance class, or jurisdiction while not needing the specific issuer identity.

A profile MAY support:

- explicit issuer disclosure;
- issuer concealment within a named set;
- disclosure of a coarse issuer class;
- multi-issuer or threshold assurance.

The selected mode MUST be justified by the relying purpose and correlation analysis.

### 12.4 Registry and snapshot semantics

Issuer qualification MUST be evaluated against a named registry, set commitment, or governance snapshot with explicit effective time, cache rules, update semantics, and failure behaviour. Network lookup patterns that reveal the issuer or holder MUST be included in the disclosure analysis.

### 12.5 Multi-issuer assurance aggregation (non-normative)

PR-ISS as stated in §12.1 is a binary set-membership statement and remains so. Where a show combines credentials or attestations from multiple named issuers, a profile MAY additionally reason about aggregate confidence rather than treating membership as a single pass/fail signal.

The normative reference models each issuer's attribute-validation process as bounded by a one-sided error parameter and shows that, when issuers validate independently, a verifier's confidence against mis-issuance increases multiplicatively with the number of honest, independent issuers contributing to a show; a corrupted or negligent issuer degrades only its own contribution and does not weaken the assurance carried by the other issuers involved (see `../appendices/REFERENCES.md`).

This gives an accreditation framework a purpose beyond maintaining a list: a profile MAY define, per issuer, a documented confidence parameter and MAY require or permit a verifier to combine that parameter with independence assumptions when a show cites more than one issuer. A profile that does this MUST still satisfy the disclosure requirements of §12.3 and MUST state the independence assumption itself as a claim under §2.4 (against whom, for how long, alongside what) — issuer independence is asserted, not derived from set membership alone.

Open issue: whether, and how, multi-issuer confidence aggregation is required by any profile is a task-force decision. This subsection records the mechanism as decision input; it does not select or mandate it.
