import http from 'node:http';
import { createReadStream, existsSync } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { handleAnalyzeRequest } from './analyze.mjs';
import { handleMp4Request } from './mp4.mjs';

const root = path.resolve(fileURLToPath(new URL('../dist/', import.meta.url)));
const port = Number(process.env.PORT || 4173);
const hostname = process.env.HOST || '127.0.0.1';
const types = { '.html': 'text/html', '.js':'text/javascript', '.css':'text/css', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.mp3':'audio/mpeg', '.mp4':'video/mp4', '.webp':'image/webp', '.svg':'image/svg+xml', '.json':'application/json', '.ico':'image/x-icon' };

if (!existsSync(root)) { console.error('First run: npm run build'); process.exit(1); }
http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/api/analyze') return handleAnalyzeRequest(req, res);
  if (url.pathname === '/api/convert-mp4') return handleMp4Request(req, res);
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
  let pathname;
  try { pathname = decodeURIComponent(url.pathname); } catch { res.writeHead(400); return res.end(); }
  const absolute = path.resolve(root, '.' + pathname);
  if (!absolute.startsWith(root + path.sep) && absolute !== root) { res.writeHead(403); return res.end(); }
  const file = absolute === root ? path.join(root, 'index.html') : absolute;
  try {
    const details = await stat(file);
    if (!details.isFile()) throw Error('not file');
    res.writeHead(200, { 'Content-Type': (types[path.extname(file)] || 'application/octet-stream') + (['.html','.css','.js','.json'].includes(path.extname(file)) ? '; charset=utf-8' : ''), 'X-Content-Type-Options': 'nosniff' });
    if (req.method === 'HEAD') return res.end();
    createReadStream(file).pipe(res);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(port, hostname, () => console.log(`MEMENTO: http://${hostname}:${port} (AI: ${process.env.OPENAI_API_KEY ? 'configured' : 'offline/local mode'})`));
