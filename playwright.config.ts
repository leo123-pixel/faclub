import { defineConfig, devices } from "@playwright/test";
import { APP_URL } from "./scripts/local-supabase/config.mjs";

// O e2e roda contra o Supabase local de scripts/local-supabase (AD-010).
// O banco é compartilhado, então os testes rodam um por vez.
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: process.env.CI ? "github" : "list",
  timeout: 30_000,
  use: {
    baseURL: APP_URL,
    locale: "pt-BR",
    viewport: { width: 1440, height: 900 },
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } }],
  webServer: {
    command: "node scripts/local-supabase/start.mjs --app",
    url: APP_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    stdout: "pipe",
    gracefulShutdown: { signal: "SIGTERM", timeout: 10_000 },
  },
});
