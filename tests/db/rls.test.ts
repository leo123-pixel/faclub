import { describe, expect, it } from "vitest";
import { ADMIN, SELF_DECLARED_ADMIN, tx, USER, type Claims, type Tx } from "./setup/db";

type Fixture = { visible: string; hidden: string; brand: string; category: string };

async function fixture(db: Tx): Promise<Fixture> {
  const [b] = await db.query<{ id: string }>("insert into brands (slug, name) values ('rls', 'RLS') returning id");
  const [c] = await db.query<{ id: string }>(
    "insert into categories (slug, name) values ('rls', 'RLS') returning id",
  );
  const insert = `insert into products (slug, name, brand_id, category_id, is_visible)
                  values ($1, $1, $2, $3, $4) returning id`;
  const [v] = await db.query<{ id: string }>(insert, ["visivel", b.id, c.id, true]);
  const [h] = await db.query<{ id: string }>(insert, ["oculto", b.id, c.id, false]);
  for (const id of [v.id, h.id]) {
    await db.query("insert into product_variants (product_id, label, price) values ($1, 'Balde 20L', 100)", [id]);
    await db.query("insert into product_images (product_id, path, is_cover) values ($1, 'p.webp', true)", [id]);
  }
  return { visible: v.id, hidden: h.id, brand: b.id, category: c.id };
}

// Cada tabela do catálogo: um insert, um update e um delete que só admin pode fazer.
const writes: Record<string, (f: Fixture) => { insert: string; update: string; del: string }> = {
  products: (f) => ({
    insert: `insert into products (slug, name, brand_id, category_id) values ('novo', 'Novo', '${f.brand}', '${f.category}')`,
    update: `update products set name = 'Mudou' where id = '${f.visible}' returning id`,
    del: `delete from products where id = '${f.visible}' returning id`,
  }),
  product_variants: (f) => ({
    insert: `insert into product_variants (product_id, label, price) values ('${f.visible}', 'Frasco 1L', 10)`,
    update: `update product_variants set price = 1 where product_id = '${f.visible}' returning id`,
    del: `delete from product_variants where product_id = '${f.visible}' returning id`,
  }),
  product_images: (f) => ({
    insert: `insert into product_images (product_id, path) values ('${f.visible}', 'x.webp')`,
    update: `update product_images set path = 'y.webp' where product_id = '${f.visible}' returning id`,
    del: `delete from product_images where product_id = '${f.visible}' returning id`,
  }),
  categories: (f) => ({
    insert: "insert into categories (slug, name) values ('nova', 'Nova')",
    update: `update categories set name = 'Mudou' where id = '${f.category}' returning id`,
    del: `delete from categories where slug = 'linha-leve' returning id`,
  }),
  brands: (f) => ({
    insert: "insert into brands (slug, name) values ('nova', 'Nova')",
    update: `update brands set name = 'Mudou' where id = '${f.brand}' returning id`,
    del: `delete from brands where slug = 'mobil' returning id`,
  }),
};

async function expectNoWrite(db: Tx, role: "anon" | "authenticated", claims: Claims | undefined, table: string) {
  await db.asSuper();
  const f = await fixture(db);
  const w = writes[table](f);
  await db.as(role, claims);
  expect(await db.error(w.insert)).toMatch(/row-level security|permission denied/);
  expect(await db.query(w.update)).toEqual([]);
  expect(await db.query(w.del)).toEqual([]);
}

describe("RLS do catálogo", () => {
  for (const table of Object.keys(writes)) {
    it(`AUTH-01.8: anon não insere, altera nem exclui em ${table}`, async () => {
      await tx((db) => expectNoWrite(db, "anon", undefined, table));
    });

    it(`AUTH-01.8: autenticado sem papel admin não insere, altera nem exclui em ${table}`, async () => {
      await tx((db) => expectNoWrite(db, "authenticated", USER, table));
    });

    it(`AUTH-01.8: role admin em user_metadata não dá acesso de escrita em ${table}`, async () => {
      await tx((db) => expectNoWrite(db, "authenticated", SELF_DECLARED_ADMIN, table));
    });

    it(`admin insere, altera e exclui em ${table}`, async () => {
      await tx(async (db) => {
        const f = await fixture(db);
        const w = writes[table](f);
        await db.as("authenticated", ADMIN);
        expect(await db.error(w.insert)).toBeNull();
        expect((await db.query(w.update)).length).toBeGreaterThan(0);
        // categoria e marca semeadas sem produtos podem ser excluídas
        expect((await db.query(w.del)).length).toBeGreaterThan(0);
      });
    });
  }

  it("anon lê só o produto visível, com suas embalagens e fotos", async () => {
    await tx(async (db) => {
      const f = await fixture(db);
      await db.as("anon");
      const products = await db.query<{ id: string }>("select id from products where slug in ('visivel', 'oculto')");
      expect(products.map((p) => p.id)).toEqual([f.visible]);
      const variants = await db.query<{ product_id: string }>(
        "select product_id from product_variants where product_id in ($1, $2)",
        [f.visible, f.hidden],
      );
      expect(variants.map((v) => v.product_id)).toEqual([f.visible]);
      const images = await db.query<{ product_id: string }>(
        "select product_id from product_images where product_id in ($1, $2)",
        [f.visible, f.hidden],
      );
      expect(images.map((i) => i.product_id)).toEqual([f.visible]);
    });
  });

  it("admin lê o produto oculto", async () => {
    await tx(async (db) => {
      const f = await fixture(db);
      await db.as("authenticated", ADMIN);
      const rows = await db.query<{ id: string }>("select id from products where id = $1", [f.hidden]);
      expect(rows).toHaveLength(1);
    });
  });

  it("ORD-01.4: só admin lê pedidos", async () => {
    await tx(async (db) => {
      await db.query("insert into orders (items, total_estimated) values ('[]', 10)");
      await db.as("anon");
      expect(await db.query("select id from orders")).toEqual([]);
      await db.as("authenticated", USER);
      expect(await db.query("select id from orders")).toEqual([]);
      await db.as("authenticated", ADMIN);
      expect(await db.query("select id from orders")).toHaveLength(1);
    });
  });
});
