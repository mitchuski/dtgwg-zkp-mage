# DTG Knowledge Base — portable projection

Built by `tools/build-kb.mjs` (zero-dep Node ESM, deterministic). **78 pages**:
root 4 · decision 36 · explorations 21 · lab 15 · chronicles 2.

Rebuild any time with:

```
node tools/build-kb.mjs
node tools/test-kb.mjs
```

## The manifest-first rule

Only files listed in the `SOURCES` manifest at the top of `tools/build-kb.mjs` are
projected. Any source-shaped file the scanner finds that is NOT in the manifest is
reported as **unmanifested** and **excluded** — the fail-safe default. New corpus files
never leak into the KB silently; to include one, add it to `SOURCES` and rebuild.
A built-in secret gate scans every projected page and **fails the whole build** on any
secret-shaped hit; the gate summary is printed every run and recorded in
`build-report.json`.

## Output 1 — `kb/fedwiki/` (Smallest Federated Wiki)

One `<slug>.json` per page in SFW page format (`title`, `story` of markdown items,
single `create` journal entry, all dates pinned to 0), plus `sitemap.json`.

- **Drop-in:** copy the `.json` files into a farm site's `pages/` directory
  (e.g. `.wiki/<host>/pages/`) — the wiki serves them as-is.
- **Import:** `sitemap.json` lists `{slug, title, synopsis, date}` for every page and
  can drive a scripted import or coverage check.
- Story-item ids are deterministic (sha256 of slug + index), so re-imports are stable.

Note: wiring these pages into a live federation is a separate, human-gated step —
nothing in this build touches any wiki farm.

## Output 2 — `kb/markdown/` (git / Confluence / anything)

One `<slug>.md` per page with YAML front-matter
(`title`, `section`, `source`, `built_from_commitish`, `order`) and the normalized
markdown body, plus `INDEX.md` grouped by section with one-line synopses.

- **Git:** commit `kb/markdown/` as-is; `INDEX.md` is the entry point.
- **Confluence:** import the bundle via Confluence's markdown importers
  (e.g. the built-in import or a markdown-import app); the front-matter carries the
  space structure — `section` → parent page, `order` → sort, `title` → page title.
- **Self-hosted:** both outputs are static files; serve or sync them anywhere.

## Normalization applied to both outputs

- Local machine paths (`C:\Users\...`, `~/...`) become plain code spans — they are
  machine paths, not links.
- Cross-references between corpus documents become links **only when the target is in
  the manifest**: `[[Title]]` in the fedwiki output, `[Title](slug.md)` in the
  markdown output; otherwise they stay as code spans.
- The decision document is split per top-level `##` section into
  `Decision §N — <heading>` pages (plus an overview page), because it is too large
  for one page.
- Sources are never edited; the corpus is read-only to this builder.
