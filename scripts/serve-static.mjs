import { createReadStream, existsSync, statSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);

function getArg(name, fallback) {
  const index = argv.findIndex((item) => item === `--${name}`);
  if (index >= 0 && argv[index + 1]) {
    return argv[index + 1];
  }
  return fallback;
}

const rootDir = path.resolve(getArg('root', path.resolve(__dirname, '../admin-web/dist')));
const port = Number(getArg('port', '4174'));
const host = getArg('host', '0.0.0.0');
const spaFallback = getArg('spa', 'true') !== 'false';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

function safeResolve(urlPath) {
  const normalized = decodeURIComponent(urlPath.split('?')[0]).replace(/^\/+/, '');
  const targetPath = path.resolve(rootDir, normalized || 'index.html');
  if (!targetPath.startsWith(rootDir)) {
    return null;
  }
  return targetPath;
}

async function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const type = MIME_TYPES[ext] || 'application/octet-stream';
  res.writeHead(200, {
    'Content-Type': type,
    'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
  });
  createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const resolvedPath = safeResolve(req.url || '/');
  if (!resolvedPath) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  try {
    if (existsSync(resolvedPath) && statSync(resolvedPath).isFile()) {
      await sendFile(res, resolvedPath);
      return;
    }

    const indexPath = path.join(resolvedPath, 'index.html');
    if (existsSync(indexPath) && statSync(indexPath).isFile()) {
      await sendFile(res, indexPath);
      return;
    }

    if (spaFallback) {
      const spaIndex = path.join(rootDir, 'index.html');
      await readFile(spaIndex);
      await sendFile(res, spaIndex);
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`Internal Server Error: ${error instanceof Error ? error.message : 'unknown error'}`);
  }
});

server.listen(port, host, () => {
  console.warn(
    `[serve-static] root=${rootDir} host=${host} port=${port} spaFallback=${spaFallback}`,
  );
});
