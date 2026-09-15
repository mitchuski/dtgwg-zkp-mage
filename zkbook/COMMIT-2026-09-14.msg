spec: records 009, 013, 021; revisions to 003, 007, 008, 010, 020 against merged credential text and review threads

Second commit of the working draft, folding the review since 8 September:

- Records 007 and 020 revised against the credential specification's merged VDC and VAC
  text and the common-control thread (cred-spec #9, 10 September): identifiers held as
  subject or issuer; the chain predicates named as hidden-value equality rather than
  common control; depth restated per ancestor; status conditional on every VDC.
- New primitive record 009 (hidden-value equality across credentials) and the
  `hidden-equality` gadget it binds; new composed record 021 (VAC attenuation chain);
  record 013 (mutual edge admissibility, cred-spec #25) at state requested.
- Record 010: the blind-signature vouch from the 8 September call as a construction
  option; vetting evidence (cred-spec PR #50) is not the voucher linkage.
- Record 003: binding a predicate identifier does not make it accepted or meaningful
  (cred-spec #52).
- Implementation Guide steps 4 and 5, the integration chapter, the Research and Book
  chapter (research notes of 10, 13 and 14 September), Security Considerations 5,
  Internationalization hedged to WG-06a, conformance vector count corrected to the
  manifest, references pinned and completed, Appendix E review-notes index.

Evidence states are unchanged; no construction or proving system is proposed as adopted.
Generated sections regenerate from conformance/ and match; validator 20/20.

Review-Receipt-SHA256: <fill from the reader's revision receipt, or delete this line>
Review-Proverb: One hand proves two names; two hands prove one name is the same — and the second is not the first.
