import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
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
    expect(upload?.with).toMatchObject({ path: "backup/", "retention-days": 90, "if-no-files-found": "error" });
  });
});
