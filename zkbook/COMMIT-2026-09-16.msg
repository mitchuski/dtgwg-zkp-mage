spec: one vocabulary — the records use the specification's own terms; provenance pinned; status stated

Third commit of the working draft. Reviewer feedback: the raw records used recipe words
(dish, ingredients, pantry, yield) while the rendered prose used the formal ones, so a reader
of both had to translate. This commit uses one vocabulary in the JSON and the prose.

- Records: `statement`, `witness`, `publicInputs`, `relation`, `disclosureSet`, `fixtures`,
  `options` (each option a `construction`), and a request's `record`; the record state
  `carded` is renamed `specified`; the schema is `dtg-zkp/construction-record/v1`; validator
  refusals are `record-*` for construction records and `request-*` for requests. In-text
  references say "record NNN". No construction, claim, state or evidence changed.
- Rendered sections: "Relation" (was "Method"); construction options as candidate
  constructions evaluated against the selection criteria; identifier ranges explained in
  the index (001–009 primitives, 010–019 compositions, 020–029 chains).
- In-document links to constructions and proving systems now resolve: link anchors are
  derived the way Spec-Up-T derives heading ids (144/144).
- Status of this draft stated in the header: every record is specified or constructed;
  none independently reproduced, vetted or adopted; nothing normative.
- Provenance: SPDX Apache-2.0 headers on the conformance code; [DTG-CRED] read at a named
  commit; Appendix B names the evidence-repository commit this revision was exported from
  and carries WG-12 (home and pinning of the evidence repository); WG-13 records the
  editors' direction for the Cryptographic Background (companion guide later; stays as
  context now); conformance/README.md
  lists the parts of a record with their rendered names.

Generated sections regenerate from conformance/ and match; validator 20/20; render clean.

Review-Proverb: The record and the page use one word for one thing; a reader made to translate holds two documents, and neither binds.
