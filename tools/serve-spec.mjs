#!/usr/bin/env node
// serve-spec.mjs — serve the rendered specification (../dtgwg-zkp-spec/docs, Spec-Up-T output) on http://127.0.0.1:8426/
// Static, read-only, reads files per request (re-render with `npm run render` in the clone and refresh).
//   node tools/serve-spec.mjs [--dir <docs dir>]     SPEC_PORT env overrides the port
import { createServer } from 'node:http';
import { readFileSync, statSync } from 'node:fs';
import { join, dirname, extname, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = join(dirname(fileURLToPath(import.meta.url)), '..');
const i = process.argv.indexOf('--dir');
const DIR = resolve(i > 0 ? process.argv[i + 1] : join(REPO, '..', 'dtgwg-zkp-spec', 'docs'));
const PORT = Number(process.env.SPEC_PORT || 8426);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.md': 'text/markdown; charset=utf-8' };
createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const file = normalize(join(DIR, p));
  if (!file.startsWith(DIR)) { res.writeHead(403); return res.end(); }
  try {
    if (statSync(file).isDirectory()) { res.writeHead(302, { Location: p + '/' }); return res.end(); }
    res.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(readFileSync(file));
  } catch { res.writeHead(404, { 'content-type': 'text/plain' }); res.end('not found: ' + p); }
}).listen(PORT, '127.0.0.1', () => console.log(`spec → http://127.0.0.1:${PORT}/  (serving ${DIR})`));
