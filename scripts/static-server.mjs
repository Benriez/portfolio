// scripts/static-server.mjs
//
// Tiny static-file server for CI E2E tests. Serves the contents of
// `dist/` at `http://127.0.0.1:<port>/`, stripping the configured base
// path from the URL so the request paths match the on-disk layout.
//
// Usage: node scripts/static-server.mjs [port] [basePath]
//   port     — TCP port to listen on (default 4321)
//   basePath — request URL prefix to strip (default "/portfolio")

import { createServer } from "node:http";
import { existsSync, statSync, createReadStream } from "node:fs";
import { join, extname } from "node:path";

const port = Number.parseInt(process.argv[2] ?? "4321", 10);
const basePath = process.argv[3] ?? "/portfolio";
const root = join(process.cwd(), "dist");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
};

function resolvePath(urlPath) {
  let p = urlPath.split("?")[0] ?? "/";
  if (basePath && p.startsWith(basePath)) {
    p = p.slice(basePath.length) || "/";
  }
  if (p === "/") return join(root, "index.html");
  return join(root, p);
}

const server = createServer((req, res) => {
  const filePath = resolvePath(req.url ?? "/");
  let resolved = filePath;
  if (!existsSync(resolved) || !statSync(resolved).isFile()) {
    resolved = join(root, "index.html");
  }
  const mime = MIME[extname(resolved).toLowerCase()] ?? "text/plain";
  res.writeHead(200, { "Content-Type": mime });
  createReadStream(resolved).pipe(res);
});

server.listen(port, "127.0.0.1", () => {
  console.warn(`Static server on http://127.0.0.1:${port} (basePath=${basePath}, root=${root})`);
});
