#!/usr/bin/env node
// Sobe um Supabase local para o e2e (AD-010): Postgres 16 + Supabase Auth
// (GoTrue) + PostgREST + SMTP de captura + gateway com Storage simulado.
// Com --app também gera o build do Next e o serve na porta 3100.
//
//   node scripts/local-supabase/start.mjs [--app]
import { execFileSync, spawn, spawnSync } from "node:child_process";
import { chownSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import pg from "pg";
import {
  APP_ENV,
  DB_URL,
  JWT_SECRET,
  LOCAL,
  MAIL_DIR,
  PORTS,
  ROOT,
  STORAGE_DIR,
  API_URL,
  APP_URL,
} from "./config.mjs";
import { startGateway } from "./gateway.mjs";
import { startSmtp } from "./smtp.mjs";

const BIN = path.join(LOCAL, "bin");
const PG_BIN = process.env.PG_BIN ?? "/usr/lib/postgresql/16/bin";
const PG_DIR = path.join(LOCAL, "pg-e2e");
const asRoot = process.getuid?.() === 0;

const RELEASES = {
  postgrest: {
    url: "https://github.com/PostgREST/postgrest/releases/download/v12.2.3/postgrest-v12.2.3-linux-static-x64.tar.xz",
    bin: path.join(BIN, "postgrest"),
    untar: ["xJf"],
  },
  auth: {
    url: "https://github.com/supabase/auth/releases/download/v2.177.0/auth-v2.177.0-x86.tar.gz",
    bin: path.join(BIN, "auth", "auth"),
    untar: ["xzf"],
    dir: path.join(BIN, "auth"),
  },
};

const children = [];
const log = (msg) => console.log(`[local-supabase] ${msg}`);

function download() {
  mkdirSync(BIN, { recursive: true });
  for (const [name, r] of Object.entries(RELEASES)) {
    if (existsSync(r.bin)) continue;
    log(`baixando ${name}`);
    const archive = path.join(BIN, path.basename(r.url));
    execFileSync("curl", ["-sSfL", "-o", archive, r.url], { stdio: "inherit" });
    const dest = r.dir ?? BIN;
    mkdirSync(dest, { recursive: true });
    execFileSync("tar", [...r.untar, archive, "-C", dest]);
    rmSync(archive);
  }
}

function pgCmd(cmd, args) {
  const bin = path.join(PG_BIN, cmd);
  const res = asRoot
    ? spawnSync("runuser", ["-u", "postgres", "--", bin, ...args], { encoding: "utf8" })
    : spawnSync(bin, args, { encoding: "utf8" });
  if (res.status !== 0) throw new Error(`${cmd}: ${res.stderr || res.stdout}`);
}

function startPostgres() {
  if (existsSync(path.join(PG_DIR, "postmaster.pid"))) {
    try {
      pgCmd("pg_ctl", ["-D", PG_DIR, "-m", "immediate", "stop"]);
    } catch {
      // já parado
    }
  }
  rmSync(PG_DIR, { recursive: true, force: true });
  mkdirSync(PG_DIR, { recursive: true });
  if (asRoot) chownSync(PG_DIR, uid("postgres"), gid("postgres"));
  pgCmd("initdb", ["-D", PG_DIR, "-U", "postgres", "--auth=trust", "-E", "UTF8", "--locale=C.UTF-8"]);
  const logFile = path.join(PG_DIR, "log");
  writeFileSync(logFile, "");
  if (asRoot) chownSync(logFile, uid("postgres"), gid("postgres"));
  pgCmd("pg_ctl", [
    "-D", PG_DIR, "-l", logFile, "-w",
    "-o", `-p ${PORTS.pg} -k ${PG_DIR} -c listen_addresses=127.0.0.1 -c fsync=off`,
    "start",
  ]);
}

function uid(user) {
  return Number(execFileSync("id", ["-u", user]).toString().trim());
}
function gid(user) {
  return Number(execFileSync("id", ["-g", user]).toString().trim());
}

async function sql(text) {
  const client = new pg.Client({ connectionString: DB_URL });
  await client.connect();
  try {
    await client.query(text);
  } finally {
    await client.end();
  }
}

const read = (...p) => readFileSync(path.join(ROOT, ...p), "utf8");

const authEnv = {
  GOTRUE_API_HOST: "127.0.0.1",
  PORT: String(PORTS.auth),
  API_EXTERNAL_URL: `${API_URL}/auth/v1`,
  GOTRUE_DB_DRIVER: "postgres",
  GOTRUE_DB_DATABASE_URL: `${DB_URL}?search_path=auth`,
  GOTRUE_DB_NAMESPACE: "auth",
  GOTRUE_DB_MIGRATIONS_PATH: path.join(BIN, "auth", "migrations"),
  GOTRUE_SITE_URL: APP_URL,
  GOTRUE_URI_ALLOW_LIST: `${APP_URL}/**`,
  GOTRUE_JWT_SECRET: JWT_SECRET,
  GOTRUE_JWT_EXP: "3600",
  GOTRUE_JWT_AUD: "authenticated",
  GOTRUE_JWT_ADMIN_ROLES: "service_role",
  // ainda é o que põe role=authenticated no JWT, apesar do aviso de descontinuação
  GOTRUE_JWT_DEFAULT_GROUP_NAME: "authenticated",
  GOTRUE_DISABLE_SIGNUP: "false",
  GOTRUE_EXTERNAL_EMAIL_ENABLED: "true",
  GOTRUE_MAILER_AUTOCONFIRM: "true",
  GOTRUE_SMTP_HOST: "127.0.0.1",
  GOTRUE_SMTP_PORT: String(PORTS.smtp),
  GOTRUE_SMTP_USER: "local",
  GOTRUE_SMTP_PASS: "local",
  GOTRUE_SMTP_ADMIN_EMAIL: "nao-responda@faclub.local",
  GOTRUE_SMTP_SENDER_NAME: "FAC LUB",
  GOTRUE_MAILER_URLPATHS_RECOVERY: "/auth/v1/verify",
  GOTRUE_MAILER_URLPATHS_CONFIRMATION: "/auth/v1/verify",
  GOTRUE_RATE_LIMIT_EMAIL_SENT: "1000",
  GOTRUE_SMTP_MAX_FREQUENCY: "1s",
  GOTRUE_LOG_LEVEL: "warn",
  LOG_LEVEL: "warn",
};

// Os logs do Auth e do PostgREST só aparecem com E2E_DEBUG=1.
function run(name, cmd, args, env, { quiet = false } = {}) {
  const out = quiet && !process.env.E2E_DEBUG ? "ignore" : "inherit";
  const child = spawn(cmd, args, { env: { ...process.env, ...env }, stdio: ["ignore", out, out] });
  child.on("exit", (code) => {
    if (code !== null && code !== 0) log(`${name} saiu com código ${code}`);
  });
  children.push(child);
  return child;
}

async function waitFor(url, label, tries = 120) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url);
      if (res.status < 500) return;
    } catch {
      // ainda subindo
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`${label} não respondeu em ${url}`);
}

function stop() {
  for (const c of children) c.kill("SIGTERM");
  try {
    pgCmd("pg_ctl", ["-D", PG_DIR, "-m", "fast", "stop"]);
  } catch {
    // já parado
  }
}

async function main() {
  download();
  rmSync(MAIL_DIR, { recursive: true, force: true });
  rmSync(STORAGE_DIR, { recursive: true, force: true });
  mkdirSync(MAIL_DIR, { recursive: true });

  log("subindo Postgres");
  startPostgres();
  await sql(read("supabase", "tests", "roles.sql"));
  await sql("create schema if not exists auth;");
  await sql(read("supabase", "tests", "storage-shim.sql"));

  log("migrações do Supabase Auth");
  execFileSync(RELEASES.auth.bin, ["migrate"], { env: { ...process.env, ...authEnv }, stdio: "inherit" });
  await sql(`
    grant usage on schema auth to anon, authenticated, service_role;
    grant execute on all functions in schema auth to anon, authenticated, service_role;
  `);

  log("migrações do projeto");
  const migrations = readdirSync(path.join(ROOT, "supabase", "migrations")).filter((f) => f.endsWith(".sql")).sort();
  for (const f of migrations) await sql(read("supabase", "migrations", f));

  await startSmtp();
  run("auth", RELEASES.auth.bin, ["serve"], authEnv, { quiet: true });
  run("postgrest", RELEASES.postgrest.bin, [], {
    PGRST_DB_URI: `postgres://authenticator:postgres@127.0.0.1:${PORTS.pg}/postgres`,
    PGRST_DB_SCHEMAS: "public",
    PGRST_DB_ANON_ROLE: "anon",
    PGRST_JWT_SECRET: JWT_SECRET,
    PGRST_SERVER_HOST: "127.0.0.1",
    PGRST_SERVER_PORT: String(PORTS.postgrest),
    PGRST_LOG_LEVEL: "warn",
  }, { quiet: true });
  await startGateway();
  await waitFor(`http://127.0.0.1:${PORTS.auth}/health`, "Supabase Auth");
  await waitFor(`http://127.0.0.1:${PORTS.postgrest}/`, "PostgREST");
  log(`pronto em ${API_URL}`);

  if (process.argv.includes("--app")) {
    const env = { ...APP_ENV, NODE_ENV: "production" };
    if (!process.env.E2E_SKIP_BUILD) {
      log("next build");
      // assíncrono: o gateway roda neste processo e precisa responder às
      // consultas das páginas que o build pré-gera
      await new Promise((resolve, reject) => {
        const build = spawn("npx", ["next", "build"], { cwd: ROOT, env: { ...process.env, ...env }, stdio: "inherit" });
        build.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`next build saiu com ${code}`))));
      });
    }
    run("next", "npx", ["next", "start", "-p", String(PORTS.app)], env);
    await waitFor(APP_URL, "Next");
    log(`app em ${APP_URL}`);
  }
}

process.on("SIGINT", () => (stop(), process.exit(0)));
process.on("SIGTERM", () => (stop(), process.exit(0)));
main().catch((err) => {
  console.error(err);
  stop();
  process.exit(1);
});
