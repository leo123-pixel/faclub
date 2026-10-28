import { describe, expect, it } from "vitest";
import { ADMIN, tx, USER } from "./setup/db";

const insert = "insert into storage.objects (bucket_id, name) values ('product-images', $1)";

describe("bucket product-images", () => {
  it("admin envia e remove foto", async () => {
    await tx(async (db) => {
      await db.as("authenticated", ADMIN);
      expect(await db.error(insert, ["products/p1/a.webp"])).toBeNull();
      const removed = await db.query(
        "delete from storage.objects where bucket_id = 'product-images' and name = 'products/p1/a.webp' returning id",
      );
      expect(removed).toHaveLength(1);
    });
  });

  it("anon não envia foto", async () => {
    await tx(async (db) => {
      await db.as("anon");
      expect(await db.error(insert, ["products/p1/a.webp"])).toMatch(/row-level security/);
    });
  });

  it("autenticado sem papel admin não envia nem remove foto", async () => {
    await tx(async (db) => {
      await db.query(insert, ["products/p1/a.webp"]);
      await db.as("authenticated", USER);
      expect(await db.error(insert, ["products/p1/b.webp"])).toMatch(/row-level security/);
      expect(await db.query("delete from storage.objects where name = 'products/p1/a.webp' returning id")).toEqual([]);
    });
  });

  it("qualquer um lê as fotos do bucket", async () => {
    await tx(async (db) => {
      await db.query(insert, ["products/p1/a.webp"]);
      await db.as("anon");
      const rows = await db.query<{ name: string }>(
        "select name from storage.objects where bucket_id = 'product-images'",
      );
      expect(rows.map((r) => r.name)).toEqual(["products/p1/a.webp"]);
    });
  });
});
