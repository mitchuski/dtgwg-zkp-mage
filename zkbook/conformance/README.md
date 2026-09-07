# conformance/ — the machine-readable half of this specification

This directory holds the data the specification's generated sections are rendered from, and the checks that keep
the prose honest to that data. Apache-2.0.

| path | what it is |
|---|---|
| `records/*.json` | construction records — one per zero-knowledge construction; the source of the *Construction Records* section |
| `requests/*.json` | requests in the requester's own form (ADR-001 first); the source of *Requests Answered* |
| `stacks/*.json` | proving-system entries; the source of *Proving Systems* |
| `schema/construction-record.schema.json` | JSON Schema for a construction record |
| `validate.mjs` | the rules, as register strings: every privacy claim names its adversary and horizon; every record states what it does not establish; composed records declare their own disclosure set; measured claims name a source; states advance monotonically |
| `test.mjs` | what CI runs: validation + "the generated text is current" (a digest of these files is stamped in `spec/body.md`) |

Refusals are values, not exceptions. A record that fails validation does not render into the specification.

## Provenance

The records are promoted from the DTG ZKP Task Force's evidence repository
(github.com/mitchuski/dtgwg-zkp-mage — `board/cards/`, `board/records/`, `board/stacks/`), where the reference
runtimes, conformance fixtures (`runtimes/fixtures/`, register v2) and the verification registry of independent
reproductions live. The generator that renders these files into `spec/` runs there (`board/tools/board.mjs spec`);
the rendered text is committed here by a person and its source digest is stamped so that this repository's CI can
tell when prose and data disagree.

## Changing a construction

Edit the record, run `node conformance/validate.mjs`, regenerate the specification text from the evidence
repository, commit both. A pull request that edits generated text without its record fails `conformance/test.mjs`.
