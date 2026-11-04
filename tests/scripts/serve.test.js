import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { request } from "node:http";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";

const PORT = 8799;
let server;

before(async () => {
  server = spawn(process.execPath, [fileURLToPath(new URL("../../scripts/serve.js", import.meta.url))], {
    env: { ...process.env, PORT: String(PORT) },
    stdio: ["ignore", "pipe", "inherit"],
  });
  await new Promise((resolve) => server.stdout.once("data", resolve));
});

after(() => server.kill());

/** Requisição crua (sem normalizar o caminho, para testar path traversal). */
function get(path, method = "GET") {
  return new Promise((resolve, reject) => {
    const req = request({ host: "127.0.0.1", port: PORT, path, method }, (res) => {
      res.resume();
      res.on("end", () => resolve(res));
    });
    req.on("error", reject);
    req.end();
  });
}

test("serve a página com os cabeçalhos de segurança", async () => {
  const res = await get("/");
  assert.equal(res.statusCode, 200);
  assert.match(res.headers["content-security-policy"], /frame-ancestors 'none'/);
  assert.match(res.headers["content-security-policy"], /require-trusted-types-for 'script'/);
  assert.equal(res.headers["x-content-type-options"], "nosniff");
  assert.equal(res.headers["x-frame-options"], "DENY");
});

test("bloqueia path traversal, arquivos ocultos e pastas fora do site", async () => {
  for (const path of [
    "/../package.json",
    "/%2e%2e/package.json",
    "/css/..%2f..%2fpackage.json",
    "/.git/config",
    "/package.json",
    "/tests/helpers.js",
    "/scripts/serve.js",
    "/_headers",
    "/%00",
  ]) {
    const res = await get(path);
    assert.equal(res.statusCode, 404, path);
  }
});

test("só aceita GET e HEAD", async () => {
  assert.equal((await get("/", "POST")).statusCode, 405);
  assert.equal((await get("/", "HEAD")).statusCode, 200);
});
