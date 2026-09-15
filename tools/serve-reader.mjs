#!/usr/bin/env node
// serve-reader.mjs — serve board/site/index.html on 127.0.0.1:8425, read from disk on every request (no cache),
// so `node board/tools/board.mjs site` shows up on refresh without restarting. Read-only; nothing else is served.
import { createServer } from 'node:http';
import { createReadStream, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const SITE = join(dirname(fileURLToPath(import.meta.url)), '..', 'board', 'site', 'index.html');
const PORT = Number(process.env.READER_PORT || 8425);
createServer((req, res) => {
  const p = new URL(req.url, 'http://127.0.0.1').pathname;
  if (p !== '/' && p !== '/index.html') { res.writeHead(404); res.end('Not found'); return; }
  if (!existsSync(SITE)) { res.writeHead(503); res.end('site not built: node board/tools/board.mjs site'); return; }
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
  createReadStream(SITE).pipe(res);
}).listen(PORT, '127.0.0.1', () => console.log(`Mage reader: http://127.0.0.1:${PORT}/  (serving ${SITE})`));
