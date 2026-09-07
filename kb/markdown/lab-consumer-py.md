---
title: "Lab — consumer-py"
section: "lab"
source: "../dtgwg-zkp-tf-mage/runtimes/consumer-py/NOTES.md"
built_from_commitish: "working-tree"
order: 65
---
# consumer-py — the second-language consumer (X1 milestone M5)

Python 3, stdlib only (`hashlib`, `json`, `re`, `pathlib`) — the fixtures lab's
zero-dep rule, in a second language. Run from this directory:

```
python consume.py   # re-run the frozen suite     -> vectors: 39/39 pass
python test.py      # the P1–P6 property suite    -> consumer-py: 6/6 pass
```

## What this proves

Two implementations — `../fixtures/consume.mjs` (JavaScript) and this
`consume.py` (Python) — share **no code**. They share only the data: the 39
vectors under `../fixtures/vectors/`, the manifest, and the reason-register
vocabulary. Both consumers load the same vectors, re-derive every digest,
re-run the constructions, and reach the **same outcome and the same reason
code, byte for byte**, on every vector (P1), including the same per-family
counts (PR-CTX 2, PR-EPO 3, PR-FLB 2, PR-HLD 1, PR-LIV 5, PR-PER 1, PR-SHW 8,
PR-TGF 7, PR-UNQ 10 = 39).

That is the X1 interop claim demonstrated, and §26's requirement instantiated:
*independent implementations instantiate the decisions consistently*. The
fixtures — not the JavaScript — carry the decisions. X1's M5 milestone
("a second implementation in another language would rewrite exactly this file
and nothing else" — consume.mjs header) is discharged by this directory.

Suite size note: the vector count is **39** (9 families), exactly as
`manifest.json` pins (`vectorCount: 39`); the 40th `.json` file in the vectors
tree is the manifest itself.

## Canonical-JSON byte-compatibility — what actually mattered

P3 is the critical property: all **29 embedded digests** (descriptor digests
bound into transcripts, transcript digests, the show transcript digest, the
six member commitments of the accept show, and the two `card:<digest[:12]>`
versions in the PR-CTX migration record) re-derive byte-identically from the
Python canonical encoding. What had to match the JS `canonicalize()`:

- **Separators**: exactly `{"k":v,"k2":v2}` and `[a,b]` — no spaces anywhere.
  (Python's `json.dumps` default of `', '` / `': '` would break every digest;
  the encoder here builds the string by hand like the JS does.)
- **Key sorting**: JS `Object.keys(...).sort()` sorts UTF-16 code units;
  Python `sorted()` sorts code points. Identical for ASCII keys — and every
  key in the suite is ASCII. A key containing astral-plane characters would
  diverge; recorded here as the known boundary of the port.
- **String escaping**: `JSON.stringify` escapes `"` and `\`, uses the short
  escapes `\b \t \n \f \r` for those controls, `\u00XX` for other chars
  < 0x20, and leaves non-ASCII **raw**. `json.dumps(s, ensure_ascii=False)`
  produces exactly that. (With the default `ensure_ascii=True`, any non-ASCII
  byte would diverge — the suite's canonicalized objects happen to be pure
  ASCII, but the port does not rely on that.)
- **Numbers**: all numbers in the canonicalized data are integers (epoch
  seconds); JS prints them without a decimal point and so does Python for
  `int`. The port also renders integral **floats** the JS way (`1` not `1.0`)
  and rejects non-finite numbers, but no vector exercises a float — untested
  path, flagged honestly.
- **`undefined` filtering**: the JS drops `undefined`-valued keys. JSON-loaded
  Python dicts cannot contain such a value, so no code was needed — noted so a
  future non-JSON caller does not assume the filter exists.
- **Hash discipline**: runtime 01's `H` = SHA-256 over parts, each prefixed
  with its 4-byte big-endian byte length (so `H(a,b) != H(a||b)`), parts UTF-8
  encoded; domain-tag strings copied byte-exact from the sources.

## The register port (`reasons.py`)

The register is treated as **data**: the 66 exact codes and 29 family prefixes
are parsed out of `../fixtures/reasons.mjs` as text (never imported or
executed), and the vectors' own `expect.reason` codes (22 distinct across the
suite) are collected alongside. Only the *mechanism* is re-implemented: exact
stratum + family stratum (`isKnownReason` = exact match, or family prefix +
non-empty parameter). P2 confirms every non-accept reason in the suite is
known to the port. Parsed counts (66 + 29 = 95, version `v2`) agree with the
JS suite's own F10 result.

## What was NOT ported (nothing any vector exercises)

- **rt01**: nothing omitted — enrol / nullifier / ContextRegistry all used.
- **rt07**: `encounter()`, `Mage.propose()`, `dreamCycleTurn()`,
  `TrustGraph.neighbours/connected` — vectors carry the candidate and the
  shared compression pre-computed; only `joinCommunity`, `rdid`,
  `Swordsman.prove`, `roster`, and edge add/has are needed.
- **show-composition**: `makeShow` (and so `bundle-profile-mismatch`),
  `matchBundle`, `completionEvidence` (`taskcontext-not-outcome-evidence`),
  `jointDisclosureRecord`, `STATEMENTS`/`OBSERVERS` content — `verifyShow`
  never consults them for a verdict. The `transcript-invalid` branch of
  `verifyShow` IS ported (it is reachable), but no vector triggers it.
- **context-card**: the `provingMode` q5 branch and custom-justification
  merging are ported but unexercised; `checkLegibility`'s failure families
  (`unrendered-field:` etc.) can fire but no vector makes them fire.
- **canonical**: transcripts with `delegationRef` (no PR-DEL vector).
- **Register-wide**: the 29 family-prefixed codes and the v2 instrument codes
  (quiet-presentation, rotation, erosion, mediator, multi-issuer, guardian)
  exist only as *vocabulary* here — no vector exercises those constructions,
  so no Python port of those six labs was attempted (that is the JS suite's
  F10 live-trigger job, out of M5's scope).

## Divergences found between the JS and the data

**None.** Every embedded digest re-derives (P3: 29/29), every outcome and
reason matches (P1: 39/39), the manifest agrees with the tree, and the lint
regex ports reproduce all 7 prohibited hits with the frozen reason codes while
passing all 3 narrow-language samples (P5) — including the `unless`-guarded
collusion pattern. The JS suite (`node ../fixtures/test.mjs`) still passes
13/13 untouched. One near-miss worth recording: JS `\s` and Python `\s` differ
slightly at the Unicode margins (JS includes `\v` and some exotic spaces in
both engines — they agree on everything the lint texts contain), so the lint
port's equivalence is demonstrated on the frozen samples, not proven in
general.

## Pointer

X1 exploration doc:
[X1 — Conformance Fixtures](x1-conformance-fixtures.md) —
milestone M5, "second-language consumer": this directory discharges it.
Counterpart consumer:
`../fixtures/consume.mjs`; vector producer: `../fixtures/extract.mjs`;
register: `../fixtures/reasons.mjs` (v2); suite: `../fixtures/test.mjs`
(13/13, unchanged by this build).
