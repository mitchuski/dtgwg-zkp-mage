# Conformance data and generated text

The records, requests and proving-system entries are the machine-readable source. `validate.mjs` checks their structure and declared evidence. It does not independently establish the truth of those declarations.

`generate.mjs` and the pure `render-lib.mjs` ship with this repository. Edit the JSON source, then run:

```
node conformance/validate.mjs
node conformance/generate.mjs
node conformance/test.mjs
```

Generation replaces the four marked sections of `spec/body.md`, updates its source digest and regenerates `g-*.md` terms. Editor-written sections and non-generated terms are preserved. Missing or duplicate section boundaries cause refusal before writing.

CI compares the actual generated sections and terms with fresh generation, checks their exact term-file set, and checks the JSON source digest. Keeping the old stamp while editing generated prose does not pass. These checks establish correspondence with the generator and records; security review and task-force adoption remain separate.

The generator and data originate in the DTG ZKP evidence repository. Reproduction of generated text needs only this specification repository and Node; it does not import the evidence repository at runtime.

## The parts of a record

The JSON field names are the specification's own terms, so a record and its rendered section read the same way. Every part below is required; `validate.mjs` refuses a record that lacks one.

| JSON field | rendered as | holds |
|---|---|---|
| `statement` | Statement | one sentence: what a verifier learns, from whom, without what |
| `witness` | Witness | credentials, secrets, paths and openings kept private from the verifier |
| `publicInputs` | Public inputs | what the verifier supplies and sees |
| `relation` | Relation | numbered clauses, each bound to a `gadget` and, once built, to a `runtime` |
| `disclosureSet` | Disclosure set | exactly the public signals plus anything deliberately shown |
| `doesNotEstablish` | Does not establish | what the proof does not establish (negative space) |
| `adversary` | Adversary, per claim | each privacy claim and the parties it is made against |
| `horizon` | Horizon | the earliest of the clocks that bound the claims |
| `fixtures` | Conformance fixtures | fixture families, vector path, rejection codes |
| `options` | Construction options | each option's `construction`, its `cost`, whether `measured`, and its `source` |
| `issuance` | Issuance requirements | what the construction asks of issuers and registries |
| `provenance` | Provenance | specification citations, registry rows, commit |
| `history` | Record history | every state advance: date, state, actor, evidence |
| `reviews` | Reviews | optional: recorded reviewer sign-off — reviewer, date, scope (which clauses), verdict (`signed-off` · `refined` · `refuted` · `pending`), evidence |

State names: `requested` → `specified` → `constructed` → `run` → `vetted` → `published`. Refusal codes are `record-*` for construction records, `request-*` for requests and `stack-*` for proving-system entries.
