import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const types = { '.html': 'text/html', '.js': 'text/javascript' };
export function startServer(port = 0, host = '127.0.0.1') {
  const server = createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      if (pathname !== '/' && !pathname.startsWith('/src/') && pathname !== '/node_modules/three/build/three.module.js' && pathname !== '/node_modules/three/build/three.core.js') { res.writeHead(404).end(); return; }
      const path = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
      if (!path.startsWith(root + sep)) { res.writeHead(403).end(); return; }
      const data = await readFile(path);
      res.writeHead(200, { 'Content-Type': types[extname(path)] || 'application/octet-stream' }).end(data);
    } catch { res.writeHead(404).end(); }
  });
  return new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, host, () => resolve(server)); });
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const server = await startServer(Number(process.env.PORT || 3000), '0.0.0.0');
  console.log(`Listening on port ${server.address().port}`);
}
