import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { ADMIN, tx, type Tx } from "./setup/db";

async function ids(db: Tx) {
  const [row] = await db.query<{ brand: string; category: string }>(
    `select (select id from brands where slug = 'lubrax') as brand,
            (select id from categories where slug = 'linha-pesada') as category`,
  );
  return row;
}

function payload(base: { brand: string; category: string }, extra: Record<string, unknown> = {}) {
  return {
    id: randomUUID(),
    name: "Top Turbo 15W-40",
    brand_id: base.brand,
    category_id: base.category,
    description: "Para motores diesel",
    stock: 12,
    specs: { viscosity: "15W-40", type: "Mineral" },
    is_visible: true,
    is_promo: false,
    is_featured: false,
    variants: [
      { label: "Balde 20L", price: 389.9, promo_price: 349.9 },
      { label: "Frasco 1L", price: 39.9 },
    ],
    images: [
      { path: "products/a.webp", is_cover: true },
      { path: "products/b.webp", is_cover: false },
    ],
    ...extra,
  };
}

/** Roda a checagem adiada da transação, como o commit faria. */
const commitCheck = (db: Tx) => db.error("set constraints all immediate");

describe("funções e gatilhos do catálogo", () => {
  it("make_slug tira acentos, caixa e símbolos", async () => {
    await tx(async (db) => {
      const [row] = await db.query<{ s: string }>("select make_slug('Óleo Câmbio 75W-90') as s");
      expect(row.s).toBe("oleo-cambio-75w-90");
    });
  });

  it("PFORM-01.17: nomes que geram o mesmo slug recebem -2 e -3", async () => {
    await tx(async (db) => {
      const base = await ids(db);
      await db.as("authenticated", ADMIN);
      const slugs: string[] = [];
      for (const name of ["Top Turbo 15W-40", "TOP TURBO 15w 40", "Top Turbo · 15W 40"]) {
        const [r] = await db.query<{ id: string }>("select save_product($1) as id", [
          JSON.stringify(payload(base, { name })),
        ]);
        const [p] = await db.query<{ slug: string }>("select slug from products where id = $1", [r.id]);
        slugs.push(p.slug);
      }
      expect(slugs).toEqual(["top-turbo-15w-40", "top-turbo-15w-40-2", "top-turbo-15w-40-3"]);
    });
  });

  it("save_product grava produto, embalagens e fotos e na edição troca as embalagens", async () => {
    await tx(async (db) => {
      const base = await ids(db);
      await db.as("authenticated", ADMIN);
      const data = payload(base);
      await db.query("select save_product($1)", [JSON.stringify(data)]);
      const variants = await db.query<{ label: string; price: string; promo_price: string | null; position: number }>(
        "select label, price, promo_price, position from product_variants where product_id = $1 order by position",
        [data.id],
      );
      expect(variants).toEqual([
        { label: "Balde 20L", price: "389.90", promo_price: "349.90", position: 0 },
        { label: "Frasco 1L", price: "39.90", promo_price: null, position: 1 },
      ]);
      const images = await db.query<{ path: string; is_cover: boolean }>(
        "select path, is_cover from product_images where product_id = $1 order by position",
        [data.id],
      );
      expect(images).toEqual([
        { path: "products/a.webp", is_cover: true },
        { path: "products/b.webp", is_cover: false },
      ]);

      await db.query("select save_product($1)", [
        JSON.stringify({ ...data, name: "Top Turbo 15W-40 Novo", variants: [{ label: "Frasco 4L", price: 149.9 }] }),
      ]);
      const [p] = await db.query<{ name: string; slug: string }>("select name, slug from products where id = $1", [
        data.id,
      ]);
      expect(p).toEqual({ name: "Top Turbo 15W-40 Novo", slug: "top-turbo-15w-40" });
      const after = await db.query<{ label: string }>("select label from product_variants where product_id = $1", [
        data.id,
      ]);
      expect(after.map((v) => v.label)).toEqual(["Frasco 4L"]);
    });
  });

  it("save_product como anon falha", async () => {
    await tx(async (db) => {
      const base = await ids(db);
      await db.as("anon");
      expect(await db.error("select save_product($1)", [JSON.stringify(payload(base))])).toMatch(
        /row-level security|permission denied/,
      );
    });
  });

  it("oferta sem preço promocional em nenhuma embalagem falha com promo_requires_price", async () => {
    await tx(async (db) => {
      const base = await ids(db);
      await db.as("authenticated", ADMIN);
      const data = payload(base, { is_promo: true, variants: [{ label: "Balde 20L", price: 389.9 }] });
      await db.query("select save_product($1)", [JSON.stringify(data)]);
      expect(await commitCheck(db)).toMatch(/promo_requires_price/);
    });
  });

  it("oferta com preço promocional passa na checagem", async () => {
    await tx(async (db) => {
      const base = await ids(db);
      await db.as("authenticated", ADMIN);
      await db.query("select save_product($1)", [JSON.stringify(payload(base, { is_promo: true }))]);
      expect(await commitCheck(db)).toBeNull();
    });
  });

  it("excluir categoria com 3 produtos falha com category_in_use:3", async () => {
    await tx(async (db) => {
      const base = await ids(db);
      await db.as("authenticated", ADMIN);
      for (let i = 0; i < 3; i++) await db.query("select save_product($1)", [JSON.stringify(payload(base))]);
      expect(await db.error("delete from categories where id = $1", [base.category])).toMatch(/category_in_use:3/);
    });
  });

  it("excluir marca em uso falha com brand_in_use:N", async () => {
    await tx(async (db) => {
      const base = await ids(db);
      await db.as("authenticated", ADMIN);
      for (let i = 0; i < 2; i++) await db.query("select save_product($1)", [JSON.stringify(payload(base))]);
      expect(await db.error("delete from brands where id = $1", [base.brand])).toMatch(/brand_in_use:2/);
    });
  });

  it("excluir categoria vazia funciona", async () => {
    await tx(async (db) => {
      await db.as("authenticated", ADMIN);
      const deleted = await db.query("delete from categories where slug = 'filtros' returning id");
      expect(deleted).toHaveLength(1);
    });
  });

  it("categoria nova recebe o slug do nome e vai para o fim da ordem", async () => {
    await tx(async (db) => {
      await db.as("authenticated", ADMIN);
      const [c] = await db.query<{ slug: string; position: number }>(
        "insert into categories (name) values ('Arla 32') returning slug, position",
      );
      expect(c).toEqual({ slug: "arla-32", position: 5 });
    });
  });
});

describe("limite de envios de pedido", () => {
  it("aceita 5 envios por chave em 10 minutos e recusa o 6º; outra chave passa", async () => {
    await tx(async (db) => {
      await db.as("service_role");
      const take = async (key: string) =>
        (await db.query<{ ok: boolean }>("select public.take_order_slot($1) as ok", [key]))[0].ok;
      for (let i = 0; i < 5; i++) expect(await take("chave-a")).toBe(true);
      expect(await take("chave-a")).toBe(false);
      expect(await take("chave-b")).toBe(true);
    });
  });

  it("envio de mais de 10 minutos atrás não conta e é apagado", async () => {
    await tx(async (db) => {
      for (let i = 0; i < 5; i++) {
        await db.query("insert into order_throttle (key, created_at) values ('chave-a', now() - interval '11 minutes')");
      }
      await db.as("service_role");
      const [row] = await db.query<{ ok: boolean }>("select public.take_order_slot('chave-a') as ok");
      expect(row.ok).toBe(true);
      await db.asSuper();
      const [count] = await db.query<{ n: string }>("select count(*) as n from order_throttle where key = 'chave-a'");
      expect(count.n).toBe("1");
    });
  });

  it("anon e usuário logado não executam a função nem leem a tabela", async () => {
    await tx(async (db) => {
      await db.query("insert into order_throttle (key) values ('chave-a')");
      for (const [role, claims] of [["anon", undefined], ["authenticated", ADMIN]] as const) {
        await db.as(role, claims);
        expect(await db.error("select public.take_order_slot('x')")).toMatch(/permission denied/);
        expect(await db.error("select * from order_throttle")).toMatch(/permission denied/);
      }
    });
  });
});
