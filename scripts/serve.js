/**
 * Servidor local de desenvolvimento, sem dependências.
 * - aplica os mesmos cabeçalhos de segurança do arquivo _headers;
 * - só responde GET/HEAD, só escuta em 127.0.0.1;
 * - bloqueia path traversal, arquivos ocultos e pastas que não são do site.
 *
 * Uso: npm start  (ou PORT=3000 npm start)
 */
import { createReadStream, readFileSync } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const PORT = Number(process.env.PORT ?? 8000);
const HOST = "127.0.0.1";

/** Somente o que faz parte do site é servido. */
const PUBLIC_ENTRIES = new Set(["index.html", "css", "src", "assets"]);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".woff2": "font/woff2",
};

/** Lê os cabeçalhos do bloco "/*" do arquivo _headers. */
function loadSecurityHeaders() {
  const headers = {};
  let inBlock = false;
  for (const line of readFileSync(join(ROOT, "_headers"), "utf8").split("\n")) {
    if (line.startsWith("#") || !line.trim()) continue;
    if (!line.startsWith(" ")) {
      inBlock = line.trim() === "/*";
      continue;
    }
    if (!inBlock) continue;
    const index = line.indexOf(":");
    const name = line.slice(0, index).trim();
    // HSTS e upgrade-insecure-requests não fazem sentido em http://localhost.
    if (name === "Strict-Transport-Security") continue;
    headers[name] = line.slice(index + 1).trim().replace("; upgrade-insecure-requests", "");
  }
  return headers;
}

const SECURITY_HEADERS = loadSecurityHeaders();

/** @param {string} urlPath */
function resolveSafePath(urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath);
  } catch {
    return null;
  }
  if (decoded.includes("\0")) return null;

  const relative = normalize(decoded === "/" ? "/index.html" : decoded).replace(/^[/\\]+/, "");
  const segments = relative.split(/[/\\]/);
  if (!PUBLIC_ENTRIES.has(segments[0])) return null;
  if (segments.some((segment) => segment.startsWith(".") || segment === "")) return null;

  const absolute = resolve(ROOT, relative);
  return absolute.startsWith(ROOT + sep) ? absolute : null;
}

/**
 * @param {import("node:http").ServerResponse} res
 * @param {number} status
 * @param {string} message
 */
function sendError(res, status, message) {
  res.writeHead(status, { ...SECURITY_HEADERS, "Content-Type": "text/plain; charset=utf-8" });
  res.end(message);
}

const server = createServer(async (req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return sendError(res, 405, "Método não permitido.");
  }

  const { pathname } = new URL(req.url ?? "/", `http://${HOST}`);
  const filePath = resolveSafePath(pathname);
  const type = filePath ? MIME[extname(filePath).toLowerCase()] : undefined;
  if (!filePath || !type) return sendError(res, 404, "Não encontrado.");

  try {
    const info = await stat(filePath);
    if (!info.isFile()) return sendError(res, 404, "Não encontrado.");
    res.writeHead(200, {
      ...SECURITY_HEADERS,
      "Content-Type": type,
      "Content-Length": info.size,
      "Cache-Control": "no-cache",
    });
    if (req.method === "HEAD") return res.end();
    createReadStream(filePath).pipe(res);
  } catch {
    sendError(res, 404, "Não encontrado.");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`ELLAS rodando em http://localhost:${PORT}`);
});
