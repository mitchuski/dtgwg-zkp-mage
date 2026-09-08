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
