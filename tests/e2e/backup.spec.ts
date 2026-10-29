import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import pg from "pg";
import { parse } from "yaml";
import { API_URL, DB_URL, ROOT, SERVICE_ROLE_KEY, STORAGE_DIR } from "../../scripts/local-supabase/config.mjs";
import { cartLine } from "./support/cart";
import { seedSite } from "./support/site";

const OUT = path.join(ROOT, "test-results", "backup");
const RESTORE_DB = "faclub_restauro";
const RESTORE_URL = DB_URL.replace(/\/postgres$/, `/${RESTORE_DB}`);
const TABLES = ["public.products", "public.product_variants", "public.product_images", "public.orders", "public.brands", "public.settings", "auth.users", "auth.identities"];

/** Arquivos de uma pasta, relativos a ela, sem os .meta.json do Storage simulado. */
function files(dir: string, base = dir): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return files(full, base);
    return name.endsWith(".meta.json") ? [] : [path.relative(base, full)];
  });
}

const psql = (url: string, args: string[], input?: string) =>
  execFileSync("psql", ["-v", "ON_ERROR_STOP=1", "-q", "-X", url, ...args], { input, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });

async function counts(url: string) {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    const result: Record<string, number> = {};
    for (const table of TABLES) result[table] = Number((await client.query(`select count(*) from ${table}`)).rows[0].count);
    return result;
  } finally {
    await client.end();
  }
}

test.beforeEach(async () => {
  await seedSite();
  rmSync(OUT, { recursive: true, force: true });
});

test.describe("backup", () => {
  test("BKP-01.1: o script exporta o banco e copia o bucket, o dump restaurado num banco novo tem os mesmos dados e roda toda segunda às 3h", async ({ request }) => {
    const order = await request.post("/api/pedidos", {
      data: {
        lines: [{ productId: (await cartLine("top-turbo-15w-40", "Balde 20L", 1)).productId, label: "Balde 20L", qty: 1 }],
        name: "Backup",
        vehicle: "",
        coupon: false,
        sourceUrl: "http://localhost:3100/carrinho",
      },
    });
    expect(order.status()).toBe(200);

    execFileSync("node", ["scripts/backup.mjs", OUT], {
      cwd: ROOT,
      env: { ...process.env, SUPABASE_DB_URL: DB_URL, SUPABASE_URL: API_URL, SUPABASE_SERVICE_ROLE_KEY: SERVICE_ROLE_KEY },
      stdio: "pipe",
    });

    // fotos: as mesmas, byte a byte
    const bucket = path.join(STORAGE_DIR, "product-images");
    const original = files(bucket).sort();
    expect(original.length).toBeGreaterThan(12);
    expect(files(path.join(OUT, "storage", "product-images")).sort()).toEqual(original);
    for (const key of original) {
      expect(readFileSync(path.join(OUT, "storage", "product-images", key)).equals(readFileSync(path.join(bucket, key))), key).toBe(true);
    }

    // banco novo como um projeto novo do Supabase: schemas auth, extensions e storage prontos
    psql(DB_URL, ["-c", `drop database if exists ${RESTORE_DB}`, "-c", `create database ${RESTORE_DB}`]);
    psql(RESTORE_URL, ["-c", "create schema extensions"]);
    psql(RESTORE_URL, ["-f", path.join(ROOT, "supabase", "tests", "storage-shim.sql")]);
    psql(RESTORE_URL, [], execFileSync("pg_dump", ["--schema-only", "--schema=auth", "--no-owner", DB_URL], { encoding: "utf8" }));

    // restauração, na ordem do README
    psql(RESTORE_URL, ["-f", path.join(OUT, "public.sql")]);
    psql(RESTORE_URL, ["-f", path.join(OUT, "auth.sql")]);
    psql(RESTORE_URL, ["-f", path.join(ROOT, "supabase", "migrations", "20261028000300_storage.sql")]);

    const before = await counts(DB_URL);
    expect(before["public.orders"]).toBe(1);
    expect(before["auth.users"]).toBeGreaterThan(0);
    expect(await counts(RESTORE_URL)).toEqual(before);

    // o GitHub Actions roda o mesmo script toda segunda às 3h de Brasília (06:00 UTC)
    const workflow = parse(readFileSync(path.join(ROOT, ".github", "workflows", "backup.yml"), "utf8"));
    expect(workflow.on.schedule).toEqual([{ cron: "0 6 * * 1" }]);
    expect(workflow.on).toHaveProperty("workflow_dispatch");
    const steps: { run?: string }[] = workflow.jobs.backup.steps;
    expect(steps.some((s) => s.run?.includes("node scripts/backup.mjs"))).toBe(true);
  });
});
