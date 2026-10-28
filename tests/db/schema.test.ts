import { describe, expect, it } from "vitest";
import { tx, type Tx } from "./setup/db";

async function newProduct(db: Tx) {
  const [p] = await db.query<{ id: string }>(
    `insert into products (slug, name, brand_id, category_id)
     select 'teste', 'Teste', b.id, c.id from brands b, categories c
     where b.slug = 'lubrax' and c.slug = 'linha-pesada' returning id`,
  );
  return p.id;
}

describe("esquema do MVP", () => {
  it("recusa preço promocional maior ou igual ao preço da embalagem", async () => {
    await tx(async (db) => {
      const id = await newProduct(db);
      const sql = "insert into product_variants (product_id, label, price, promo_price) values ($1, $2, 100, $3)";
      expect(await db.error(sql, [id, "Balde 20L", 100])).toMatch(/check constraint/);
      expect(await db.error(sql, [id, "Frasco 1L", 120])).toMatch(/check constraint/);
      expect(await db.error(sql, [id, "Frasco 4L", 99.9])).toBeNull();
    });
  });

  it("recusa embalagem com preço zero", async () => {
    await tx(async (db) => {
      const id = await newProduct(db);
      expect(
        await db.error("insert into product_variants (product_id, label, price) values ($1, 'Balde 20L', 0)", [id]),
      ).toMatch(/check constraint/);
    });
  });

  it("recusa estoque negativo", async () => {
    await tx(async (db) => {
      const id = await newProduct(db);
      expect(await db.error("update products set stock = -1 where id = $1", [id])).toMatch(/check constraint/);
    });
  });

  it("recusa uma segunda capa no mesmo produto", async () => {
    await tx(async (db) => {
      const id = await newProduct(db);
      const sql = "insert into product_images (product_id, path, is_cover) values ($1, $2, true)";
      expect(await db.error(sql, [id, "products/a.webp"])).toBeNull();
      expect(await db.error(sql, [id, "products/b.webp"])).toMatch(/product_images_one_cover/);
    });
  });

  it("recusa categoria com nome repetido em outra caixa", async () => {
    await tx(async (db) => {
      expect(
        await db.error("insert into categories (slug, name) values ('linha-leve-2', 'LINHA LEVE')"),
      ).toMatch(/categories_name_key/);
    });
  });

  it("recusa marca com nome repetido", async () => {
    await tx(async (db) => {
      expect(await db.error("insert into brands (slug, name) values ('shell-2', 'shell')")).toMatch(
        /brands_name_key/,
      );
    });
  });

  it("CONF-01.7: aceita só uma linha em settings", async () => {
    await tx(async (db) => {
      expect(await db.error("insert into settings (id, whatsapp) values (2, '11999999999')")).toMatch(
        /check constraint/,
      );
    });
  });

  it("traz as 4 categorias iniciais na ordem", async () => {
    await tx(async (db) => {
      const rows = await db.query<{ name: string }>("select name from categories order by position");
      expect(rows.map((r) => r.name)).toEqual(["Linha leve", "Linha pesada", "Filtros", "Aditivos e graxas"]);
    });
  });

  it("traz as 6 marcas iniciais", async () => {
    await tx(async (db) => {
      const rows = await db.query<{ name: string }>("select name from brands order by name");
      expect(rows.map((r) => r.name)).toEqual(["Brutus", "Lubrax", "Mobil", "Shell", "Texaco", "Urania"]);
    });
  });

  it("traz o cupom FACLUB10 ativo e as configurações da loja", async () => {
    await tx(async (db) => {
      const [c] = await db.query<{ percent: number; is_active: boolean }>(
        "select percent, is_active from coupons where code = 'FACLUB10'",
      );
      expect(c).toEqual({ percent: 10, is_active: true });
      const [s] = await db.query<Record<string, string>>(
        "select whatsapp, phone, email, hours_weekdays, hours_saturday from settings",
      );
      expect(s).toEqual({
        whatsapp: "1129545764",
        phone: "(11) 2954-5764",
        email: "contato@faclubrificantes.com.br",
        hours_weekdays: "7h às 18h",
        hours_saturday: "8h às 13h",
      });
    });
  });
});
