# Decentralized Trust Graph — Zero-Knowledge Proof Specification

The specification of the DTG ZKP Task Force (Trust over IP Foundation, DTG Working Group): the zero-knowledge
layer of the Decentralized Trust Graph, written as **construction records** — one per proof the trust graph needs —
each stating what a verifier learns, from whom, without what, with its witness, public inputs, method clauses bound
to named gadgets, disclosure set, what it does not establish, adversary and horizon per privacy claim, conformance
fixtures, construction options across proving systems, and issuance requirements.

Rendered specification: <https://trustoverip.github.io/dtgwg-zkp-spec/>

## How this repository is organised

| path | what |
|---|---|
| `spec/` | the specification, rendered by [Spec-Up-T](https://trustoverip.github.io/spec-up-t-website/) (the ordered files in `specs.json`; operational material precedes the cryptographic background) |
| `spec/body.md` | **partly generated** — the Requests Answered, Construction Records, Proving Systems and derived Privacy Considerations sections are rendered from `conformance/`; the stamp at the top names the source digest |
| `conformance/` | the machine-readable half: construction records, requests, proving-system entries, the schema, the validator, and the test CI runs |
| `.github/workflows/` | render-and-deploy (Spec-Up-T → GitHub Pages) and `validate-conformance` (records validate; generated text is current) |

## Working on it

- **Change a construction:** edit `conformance/records/<id>.json`, run `node conformance/validate.mjs`, regenerate the
  specification text with `node conformance/generate.mjs`, then run `node conformance/test.mjs`,
  commit both. A pull request that edits generated text without its record fails CI.
- **Render locally:** `npm install && npm run render` → `docs/index.html` (never committed).
- **Propose a construction:** open a discussion in [trustoverip/dtgwg-zkp-tf](https://github.com/trustoverip/dtgwg-zkp-tf)
  with a one-sentence statement of what the proof must establish; a constructor writes the record.

## How the three repositories relate

| repository | holds | what leaves it |
|---|---|---|
| [trustoverip/dtgwg-zkp-tf](https://github.com/trustoverip/dtgwg-zkp-tf) | requirements, drafting rules, discussions, the working board thread | decisions and requests — a request becomes a construction record |
| **this repository** | the specification and its `conformance/` apparatus | the rendered specification; record ids others may cite |
| [mitchuski/dtgwg-zkp-mage](https://github.com/mitchuski/dtgwg-zkp-mage) | reference runtimes with measured costs, conformance fixtures, the verification registry of independent reproductions, the board where records are written and advanced, and the generator that renders records into this specification's text | data — records, fixtures, registry row ids — never a dependency |

A claim travels one way: discussion → record → runtime → independent run → registry row → record state → regenerated
text → pull request here. Nothing in this specification says more than a record shows; no record says more than a
runtime measured; no runtime says more than a stranger reproduced. The evidence repository also publishes the same
records in the same chapters as the **ZK Book**, its edition with the working shown — the board, the drafts, the watch,
the run notes and the chronicles beside the text.

- Credentials the constructions prove over: [trustoverip/dtgwg-cred-spec](https://github.com/trustoverip/dtgwg-cred-spec)

## Intellectual property

Documentation CC BY 4.0; code (`conformance/`) Apache-2.0; patents W3C Mode — per the DTG Working Group's charter under
the Joint Development Foundation.

## Local review and book maintenance

The trust-graph lifecycle is in `spec/trust-graph.md`; unresolved protocol and implementation boundaries are in `spec/integration.md`; the continuous research, discussion-comment traceability and book process are in `spec/research-and-book.md`. The explanatory primer is preserved in `spec/cryptographic-background.md`.

Edit construction definitions here and regenerate locally. Treat later evidence-repository imports as reviewed changes, not an overwrite operation. Research can narrow or supersede a claim; published history, independent reproduction, security review and normative adoption remain distinct.

### Editorial language

Use protocol roles throughout specification prose and construction records: presenter, holder, voucher, issuer, verifier, registry operator and delegated agent. Do not introduce fictional personal names or narrative personas, including in examples. Define role relationships explicitly. Preserve actual author attribution and repository URLs as provenance.

The implementation reading path starts in `spec/implementation-guide.md`. WG-01 through WG-09 mark proposed decisions, discussion points and evidence requests; they do not record ratification. The optional research-loop method is confined to the maintenance note at the end of the specification.

Scope: ZKP implementation for decentralized trust graphs generally. Personhood/liveness requirements are a source for one use-case family, not the universal requirements baseline. WG-10 records the proposed general-scope clarification.
