import { describe, expect, it } from "vitest";
import { tx, USER } from "./setup/db";

describe("harness do Postgres local", () => {
  it("auth.uid() devolve o sub das claims", async () => {
    await tx(async (db) => {
      await db.as("authenticated", USER);
      const [row] = await db.query<{ uid: string }>("select auth.uid() as uid");
      expect(row.uid).toBe(USER.sub);
    });
  });

  it("anon não é superusuário", async () => {
    await tx(async (db) => {
      await db.as("anon");
      const [row] = await db.query<{ su: string }>("select current_setting('is_superuser') as su");
      expect(row.su).toBe("off");
    });
  });
});
