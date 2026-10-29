import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { Client } from "pg";

// Postgres local para os testes (AD-010): um cluster descartável em .local/,
// com o esquema mínimo do Supabase e todas as migrações aplicadas.

const BIN = process.env.PG_BIN ?? "/usr/lib/postgresql/16/bin";
const ROOT = path.resolve(__dirname, "../../..");
const asRoot = process.getuid?.() === 0;

function pg(cmd: string, args: string[]) {
  const bin = path.join(BIN, cmd);
  const res = asRoot
    ? spawnSync("runuser", ["-u", "postgres", "--", bin, ...args], { encoding: "utf8" })
    : spawnSync(bin, args, { encoding: "utf8" });
  if (res.status !== 0) throw new Error(`${cmd} falhou: ${res.stderr || res.stdout}`);
}

export type Cluster = { url: string; stop: () => void };

export async function startCluster(name: string, port: number): Promise<Cluster> {
  const dir = path.join(ROOT, ".local", name);
  if (existsSync(path.join(dir, "postmaster.pid"))) {
    try {
      pg("pg_ctl", ["-D", dir, "-m", "immediate", "stop"]);
    } catch {
      // cluster antigo já parado
    }
  }
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  if (asRoot) execFileSync("chown", ["-R", "postgres:postgres", path.join(ROOT, ".local")]);

  pg("initdb", ["-D", dir, "-U", "postgres", "--auth=trust", "-E", "UTF8", "--locale=C.UTF-8"]);
  writeFileSync(path.join(dir, "log"), "");
  if (asRoot) execFileSync("chown", ["postgres:postgres", path.join(dir, "log")]);
  pg("pg_ctl", [
    "-D", dir, "-l", path.join(dir, "log"), "-w",
    "-o", `-p ${port} -k ${dir} -c listen_addresses=127.0.0.1 -c fsync=off`,
    "start",
  ]);

  const url = `postgres://postgres@127.0.0.1:${port}/postgres`;
  return { url, stop: () => pg("pg_ctl", ["-D", dir, "-m", "fast", "stop"]) };
}

export function migrationFiles(): string[] {
  const dir = path.join(ROOT, "supabase", "migrations");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .map((f) => path.join(dir, f));
}

export async function applySql(url: string, files: string[]) {
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    for (const file of files) {
      try {
        await client.query(readFileSync(file, "utf8"));
      } catch (err) {
        throw new Error(`${path.relative(ROOT, file)}: ${(err as Error).message}`);
      }
    }
  } finally {
    await client.end();
  }
}

export const shimFiles = (...names: string[]) =>
  names.map((n) => path.join(ROOT, "supabase", "tests", n));
