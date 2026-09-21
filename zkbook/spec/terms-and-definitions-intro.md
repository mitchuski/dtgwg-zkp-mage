## Terminology

This section is informative.

The terms below are the vocabulary the construction records are written in: the gadgets a relation clause may bind to, the roles in the evidence process, and the parts and states of a construction record. Terms whose source file is prefixed `g-` are generated from the validator's constant tables, so that a gadget cannot appear in a record without a definition here. Credential-layer terms (VRC, VMC, VPC, VTC, correlation scope, persona) are defined by the DTG Credentials Core Specification and are used here with that meaning.

Any hyperlinked term not included in this section is referenced from one of the following glossaries:

- [ToIP Main Glossary](https://glossary.trustoverip.org)
- [ToIP General IT Glossary](https://trustoverip.github.io/ctwg-general-glossary)
- [DTG Credentials Core Specification](https://trustoverip.github.io/dtgwg-cred-spec/) (terms section)

The credential-layer terms this specification relies on are defined there and cross-referenced as the external specification `DTG_CRED` rather than redefined here: [[xref: DTG_CRED, VC]], [[xref: DTG_CRED, VTC]], [[xref: DTG_CRED, VTA]], [[xref: DTG_CRED, VMC]], [[xref: DTG_CRED, VRC]], [[xref: DTG_CRED, VDC]], [[xref: DTG_CRED, VAC]], [[xref: DTG_CRED, VSC]], [[xref: DTG_CRED, VIC]], [[xref: DTG_CRED, VPC]], [[xref: DTG_CRED, correlation scope]], [[xref: DTG_CRED, persona]], [[xref: DTG_CRED, PHC]].

[[def: gadget]]

~ A reusable circuit fragment that proves one kind of relation over hidden values — set membership, a nullifier derivation, a signature check, a range. A construction record's relation binds each clause to exactly one gadget so the clause can be located in a runtime and its cost measured.
