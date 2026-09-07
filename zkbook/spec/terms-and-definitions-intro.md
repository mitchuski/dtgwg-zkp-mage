## Terminology

This section is informative.

The terms below are the vocabulary the construction records are written in: the gadgets a method clause may bind to, the roles in the evidence process, and the parts and states of a construction record. Terms whose source file is prefixed `g-` are generated from the validator's constant tables, so that a gadget cannot appear in a record without a definition here. Credential-layer terms (VRC, VMC, VPC, VTC, correlation scope, persona) are defined by the DTG Credentials Core Specification and are used here with that meaning.

Any hyperlinked term not included in this section is referenced from one of the following glossaries:

- [ToIP Main Glossary](https://glossary.trustoverip.org)
- [ToIP General IT Glossary](https://trustoverip.github.io/ctwg-general-glossary)
- [DTG Credentials Core Specification](https://trustoverip.github.io/dtgwg-cred-spec/) (terms section)

[[def: gadget]]

~ A reusable circuit fragment that proves one kind of relation over hidden values — set membership, a nullifier derivation, a signature check, a range. A construction record's method binds each clause to exactly one gadget so the clause can be located in a runtime and its cost measured.
