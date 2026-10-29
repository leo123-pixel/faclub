// Gateway do Supabase local: /auth/v1 → GoTrue, /rest/v1 → PostgREST e um
// Storage simulado em disco com a mesma regra do bucket (só admin escreve).
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import http from "node:http";
import path from "node:path";
import { PORTS, STORAGE_DIR, verifyJwt } from "./config.mjs";

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  "access-control-allow-headers": "*",
  "access-control-expose-headers": "*",
};

function proxy(req, res, port, prefix) {
  const upstream = http.request(
    { host: "127.0.0.1", port, method: req.method, path: req.url.slice(prefix.length) || "/", headers: req.headers },
    (up) => {
      const headers = { ...up.headers, ...CORS };
      res.writeHead(up.statusCode ?? 502, headers);
      up.pipe(res);
    },
  );
  upstream.on("error", (err) => send(res, 502, { message: err.message }));
  req.pipe(upstream);
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, { "content-type": "application/json", ...CORS, ...headers });
  res.end(JSON.stringify(body));
}

const readBody = (req) =>
  new Promise((resolve) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
  });

function isAdmin(req) {
  const token = (req.headers.authorization ?? "").replace(/^Bearer\s+/i, "");
  const claims = verifyJwt(token);
  return claims?.role === "service_role" || claims?.app_metadata?.role === "admin";
}

const file = (bucket, key) => path.join(STORAGE_DIR, bucket, key);
const denied = { statusCode: "403", error: "Unauthorized", message: "new row violates row-level security policy" };

async function storage(req, res) {
  const url = new URL(req.url, "http://x");
  const parts = url.pathname.replace(/^\/storage\/v1\//, "").split("/").map(decodeURIComponent);

  if (req.method === "GET" && parts[0] === "object" && parts[1] === "public") {
    const target = file(parts[2], parts.slice(3).join("/"));
    if (!existsSync(target)) return send(res, 404, { message: "Object not found" });
    const meta = JSON.parse(readFileSync(`${target}.meta.json`, "utf8"));
    res.writeHead(200, { "content-type": meta.contentType, ...CORS });
    return res.end(readFileSync(target));
  }

  if (!isAdmin(req)) return send(res, 400, denied);

  // Listagem de uma "pasta" do bucket, como a do Storage: pastas com id null.
  if (req.method === "POST" && parts[0] === "object" && parts[1] === "list") {
    const body = JSON.parse((await readBody(req)).toString() || "{}");
    const dir = file(parts[2], body.prefix ?? "");
    const entries = existsSync(dir) ? readdirSync(dir, { withFileTypes: true }) : [];
    const items = entries
      .filter((e) => !e.name.endsWith(".meta.json"))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((e) => {
        if (e.isDirectory()) return { name: e.name, id: null, metadata: null };
        const meta = JSON.parse(readFileSync(path.join(dir, `${e.name}.meta.json`), "utf8"));
        return { name: e.name, id: randomUUID(), metadata: { size: meta.size, mimetype: meta.contentType } };
      });
    const offset = body.offset ?? 0;
    return send(res, 200, items.slice(offset, offset + (body.limit ?? 100)));
  }

  if (req.method === "GET" && parts[0] === "object") {
    const target = file(parts[1], parts.slice(2).join("/"));
    if (!existsSync(target)) return send(res, 404, { message: "Object not found" });
    const meta = JSON.parse(readFileSync(`${target}.meta.json`, "utf8"));
    res.writeHead(200, { "content-type": meta.contentType, ...CORS });
    return res.end(readFileSync(target));
  }

  if (req.method === "POST" && parts[0] === "object" && parts[1] === "copy") {
    const body = JSON.parse((await readBody(req)).toString() || "{}");
    const from = file(body.bucketId, body.sourceKey);
    if (!existsSync(from)) return send(res, 404, { message: "Object not found" });
    const to = file(body.bucketId, body.destinationKey);
    mkdirSync(path.dirname(to), { recursive: true });
    writeFileSync(to, readFileSync(from));
    writeFileSync(`${to}.meta.json`, readFileSync(`${from}.meta.json`));
    return send(res, 200, { Key: `${body.bucketId}/${body.destinationKey}` });
  }

  if ((req.method === "POST" || req.method === "PUT") && parts[0] === "object") {
    const bucket = parts[1];
    const key = parts.slice(2).join("/");
    const target = file(bucket, key);
    if (req.method === "POST" && existsSync(target) && req.headers["x-upsert"] !== "true") {
      return send(res, 400, { statusCode: "409", error: "Duplicate", message: "The resource already exists" });
    }
    let body = await readBody(req);
    let contentType = req.headers["content-type"] ?? "application/octet-stream";
    if (contentType.startsWith("multipart/form-data")) {
      // supabase-js envia Blob e File como formulário; o arquivo é o campo com nome vazio
      const form = await new Request("http://x", { method: "POST", headers: { "content-type": contentType }, body })
        .formData();
      const part = [...form.values()].find((v) => typeof v !== "string");
      contentType = part.type || "application/octet-stream";
      body = Buffer.from(await part.arrayBuffer());
    }
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, body);
    writeFileSync(`${target}.meta.json`, JSON.stringify({ contentType, size: body.length }));
    return send(res, 200, { Key: `${bucket}/${key}`, Id: randomUUID() });
  }

  if (req.method === "DELETE" && parts[0] === "object") {
    const bucket = parts[1];
    const body = JSON.parse((await readBody(req)).toString() || "{}");
    const removed = [];
    for (const key of body.prefixes ?? []) {
      const target = file(bucket, key);
      if (existsSync(target)) {
        rmSync(target);
        rmSync(`${target}.meta.json`, { force: true });
        removed.push({ name: key, bucket_id: bucket });
      }
    }
    return send(res, 200, removed);
  }

  return send(res, 404, { message: `rota de storage não simulada: ${req.method} ${url.pathname}` });
}

export function startGateway() {
  mkdirSync(STORAGE_DIR, { recursive: true });
  const server = http.createServer((req, res) => {
    if (req.method === "OPTIONS") {
      res.writeHead(204, CORS);
      return res.end();
    }
    if (req.url === "/health") return send(res, 200, { ok: true });
    if (req.url.startsWith("/auth/v1")) return proxy(req, res, PORTS.auth, "/auth/v1");
    if (req.url.startsWith("/rest/v1")) return proxy(req, res, PORTS.postgrest, "/rest/v1");
    if (req.url.startsWith("/storage/v1")) {
      return storage(req, res).catch((err) => send(res, 500, { message: err.message }));
    }
    return send(res, 404, { message: "not found" });
  });
  return new Promise((resolve) => server.listen(PORTS.gateway, "127.0.0.1", () => resolve(server)));
}
