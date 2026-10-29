import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

type Step = { name?: string; uses?: string; run?: string; with?: Record<string, unknown>; "continue-on-error"?: unknown };
type Job = { steps: Step[]; "continue-on-error"?: unknown };

const workflow = parse(readFileSync(".github/workflows/backup.yml", "utf8")) as { jobs: Record<string, Job> };
const job = workflow.jobs.backup;

describe("workflow de backup", () => {
  it("BKP-01.2: uma falha deixa o job vermelho e o script sai com erro quando o pg_dump falha", () => {
    expect(Object.keys(workflow.jobs)).toEqual(["backup"]);
    expect(job).not.toHaveProperty("continue-on-error");
    for (const step of job.steps) expect(step, step.name ?? step.uses).not.toHaveProperty("continue-on-error");

    const script = job.steps.find((s) => s.run?.includes("node scripts/backup.mjs"));
    expect(script?.run?.trimStart().startsWith("set -euo pipefail")).toBe(true);

    // banco fora do ar: o pg_dump falha, o script sai com 1 e não mostra a senha
    const out = mkdtempSync(path.join(tmpdir(), "faclub-backup-"));
    const run = spawnSync("node", ["scripts/backup.mjs", out], {
      encoding: "utf8",
      env: {
        ...process.env,
        SUPABASE_DB_URL: "postgres://postgres:senha-secreta@127.0.0.1:1/postgres?connect_timeout=2",
        SUPABASE_URL: "http://127.0.0.1:1",
        SUPABASE_SERVICE_ROLE_KEY: "chave",
      },
    });
    expect(run.status).toBe(1);
    expect(run.stderr).toContain("backup falhou: pg_dump saiu com código");
    expect(`${run.stdout}${run.stderr}`).not.toContain("senha-secreta");
  });

  it("BKP-01.3: o backup fica guardado por 90 dias", () => {
    const upload = job.steps.find((s) => s.uses?.startsWith("actions/upload-artifact@"));
    expect(upload?.with).toMatchObject({ "retention-days": 90, "if-no-files-found": "error" });
  });

  it("BKP-02.1: só o arquivo cifrado vai para o artefato, a senha do README o abre e sem senha o job falha", () => {
    const upload = job.steps.find((s) => s.uses?.startsWith("actions/upload-artifact@"));
    expect(upload?.with?.path).toBe("cifrado/");
    const encrypt = job.steps.find((s) => s.run?.includes("openssl enc"));
    expect(encrypt?.run?.trimStart().startsWith("set -euo pipefail")).toBe(true);
    const order = job.steps.indexOf(encrypt!);
    expect(order).toBeGreaterThan(job.steps.findIndex((s) => s.run?.includes("node scripts/backup.mjs")));
    expect(order).toBeLessThan(job.steps.indexOf(upload!));

    // roda o passo de verdade sobre um backup de exemplo
    const work = mkdtempSync(path.join(tmpdir(), "faclub-cifra-"));
    const photo = Buffer.from([0x52, 0x49, 0x46, 0x46, 0, 1, 2, 255]);
    const files: Record<string, Buffer> = {
      "public.sql": Buffer.from("CREATE TABLE public.orders (name text);\nJoão da Oficina"),
      "auth.sql": Buffer.from("COPY auth.users (email) FROM stdin;\ncontato@onbind.com.br"),
      "storage/product-images/products/p/seed-1.webp": photo,
    };
    for (const [name, body] of Object.entries(files)) {
      mkdirSync(path.dirname(path.join(work, "backup", name)), { recursive: true });
      writeFileSync(path.join(work, "backup", name), body);
    }
    const step = (env: Record<string, string>) =>
      spawnSync("bash", ["-c", encrypt!.run!], { cwd: work, encoding: "utf8", env: { ...process.env, ...env } });

    const noSecret = mkdtempSync(path.join(tmpdir(), "faclub-cifra-"));
    mkdirSync(path.join(noSecret, "backup"));
    const failed = spawnSync("bash", ["-c", encrypt!.run!], { cwd: noSecret, encoding: "utf8", env: { ...process.env, BACKUP_PASSPHRASE: "" } });
    expect(failed.status).not.toBe(0);
    expect(readdirSync(noSecret)).not.toContain("cifrado");

    expect(step({ BACKUP_PASSPHRASE: "senha de teste" }).status).toBe(0);
    expect(readdirSync(work).sort()).toEqual(["cifrado"]);
    const [encrypted] = readdirSync(path.join(work, "cifrado"));
    expect(encrypted).toMatch(/^faclub-backup-\d{4}-\d{2}-\d{2}\.tar\.gz\.enc$/);
    const sealed = readFileSync(path.join(work, "cifrado", encrypted));
    for (const text of ["CREATE TABLE", "João", "onbind", "public.sql"]) expect(sealed.includes(text), text).toBe(false);

    // o comando do README abre o arquivo; senha errada não
    const readme = readFileSync("README.md", "utf8").split("\n").find((l) => l.includes("openssl enc -d"))!;
    const command = readme.replace(/^BACKUP_PASSPHRASE='[^']*' /, "").replace("faclub-backup-AAAA-MM-DD.tar.gz.enc", `cifrado/${encrypted}`);
    const open = (passphrase: string) => {
      const dir = path.join(work, `restaurado-${passphrase.length}`);
      mkdirSync(dir);
      const run = spawnSync("bash", ["-o", "pipefail", "-c", command.replace("-C restaurado", `-C ${dir}`)], {
        cwd: work,
        encoding: "utf8",
        env: { ...process.env, BACKUP_PASSPHRASE: passphrase },
      });
      return { status: run.status, dir };
    };
    expect(open("senha errada!").status).not.toBe(0);
    const ok = open("senha de teste");
    expect(ok.status).toBe(0);
    for (const [name, body] of Object.entries(files)) expect(readFileSync(path.join(ok.dir, name)).equals(body), name).toBe(true);
  });
});
