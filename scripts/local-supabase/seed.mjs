#!/usr/bin/env node
// Dados do Supabase local: o admin, um usuário sem papel, os 8 produtos da
// captura da lista do painel, as configurações e o cupom iniciais, sem banners.
// Rodar de novo zera o catálogo e repõe tudo.
//
//   node scripts/local-supabase/seed.mjs
import { createClient } from "@supabase/supabase-js";
import pg from "pg";
import { API_URL, DB_URL, SERVICE_ROLE_KEY } from "./config.mjs";

export const USERS = {
  admin: { email: "contato@onbind.com.br", password: "faclub-admin-123", app_metadata: { role: "admin" } },
  user: { email: "usuario@faclub.local", password: "faclub-user-123", app_metadata: {} },
};

// marca, nome, categoria, embalagem, preço, promo, estoque, visível, oferta
export const PRODUCTS = [
  ["mobil", "Super 5W-30 Sintético", "linha-leve", "Frasco 1L", 54.9, 49.9, 48, true, true, "5W-30", "Sintético"],
  ["shell", "Helix HX8 5W-30", "linha-leve", "Frasco 1L", 52.9, null, 32, true, false, "5W-30", "Sintético"],
  ["texaco", "Havoline 10W-40", "linha-leve", "Frasco 1L", 34.9, null, 4, true, false, "10W-40", "Semissintético"],
  ["lubrax", "Top Turbo 15W-40", "linha-pesada", "Balde 20L", 389.9, 349.9, 12, true, true, "15W-40", "Mineral"],
  ["shell", "Rimula R4 15W-40", "linha-pesada", "Balde 20L", 459.9, null, 9, true, false, "15W-40", "Mineral"],
  ["urania", "Urania 15W-40", "linha-pesada", "Balde 20L", 399.9, null, 3, true, false, "15W-40", "Mineral"],
  ["brutus", "Brutus 15W-40", "linha-pesada", "Balde 20L", 329.9, 299.9, 15, true, true, "15W-40", "Mineral"],
  ["mobil", "Filtro de óleo", "filtros", "Unidade", 39.9, null, 60, false, false, null, null],
];

const SEED_SQL = `
  truncate public.products, public.orders, public.banners restart identity cascade;
  delete from public.coupons where code <> 'FACLUB10';
  insert into public.coupons (code, percent, description, is_active)
  values ('FACLUB10', 10, '10% de desconto na troca feita na loja.', true)
  on conflict (code) do update set percent = 10, description = excluded.description, is_active = true;
  insert into public.settings (id, whatsapp, phone, email, address, hours_weekdays, hours_saturday,
    group_link, instagram, schedule_message)
  values (1, '1129545764', '(11) 2954-5764', 'contato@faclubrificantes.com.br',
    'Rua Cabo Antônio Alves, 50, Parque Novo Mundo, São Paulo', '7h às 18h', '8h às 13h',
    null, null, 'Olá! Quero agendar uma troca de óleo.')
  on conflict (id) do update set whatsapp = excluded.whatsapp, phone = excluded.phone, email = excluded.email,
    address = excluded.address, hours_weekdays = excluded.hours_weekdays, hours_saturday = excluded.hours_saturday,
    group_link = null, instagram = null, schedule_message = excluded.schedule_message;
  delete from public.categories where slug not in ('linha-leve', 'linha-pesada', 'filtros', 'aditivos-e-graxas');
  delete from public.brands where slug not in ('mobil', 'shell', 'texaco', 'lubrax', 'urania', 'brutus');
  insert into public.categories (slug, name, position) values
    ('linha-leve', 'Linha leve', 1), ('linha-pesada', 'Linha pesada', 2),
    ('filtros', 'Filtros', 3), ('aditivos-e-graxas', 'Aditivos e graxas', 4)
  on conflict (slug) do update set name = excluded.name, position = excluded.position;
  insert into public.brands (slug, name) values
    ('mobil', 'Mobil'), ('shell', 'Shell'), ('texaco', 'Texaco'),
    ('lubrax', 'Lubrax'), ('urania', 'Urania'), ('brutus', 'Brutus')
  on conflict (slug) do update set name = excluded.name, logo_path = null;
`;

async function users() {
  const admin = createClient(API_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw error;
  for (const u of Object.values(USERS)) {
    const found = data.users.find((x) => x.email === u.email);
    const attrs = { password: u.password, email_confirm: true, app_metadata: u.app_metadata };
    const res = found
      ? await admin.auth.admin.updateUserById(found.id, attrs)
      : await admin.auth.admin.createUser({ email: u.email, ...attrs });
    if (res.error) throw res.error;
  }
}

/** Zera o catálogo e os pedidos e repõe os dados da captura. */
export async function seed({ products = true } = {}) {
  const client = new pg.Client({ connectionString: DB_URL });
  await client.connect();
  try {
    await client.query(SEED_SQL);
    if (products) {
      for (const [brand, name, category, label, price, promo, stock, visible, isPromo, viscosity, type] of PRODUCTS) {
        await client.query(
          `select public.save_product(jsonb_build_object(
             'id', gen_random_uuid(), 'name', $1::text,
             'brand_id', (select id from public.brands where slug = $2),
             'category_id', (select id from public.categories where slug = $3),
             'stock', $4::int, 'is_visible', $5::boolean, 'is_promo', $6::boolean,
             'specs', jsonb_strip_nulls(jsonb_build_object('viscosity', $7::text, 'type', $8::text)),
             'variants', jsonb_build_array(jsonb_strip_nulls(jsonb_build_object(
               'label', $9::text, 'price', $10::numeric, 'promo_price', $11::numeric)))))`,
          [name, brand, category, stock, visible, isPromo, viscosity, type, label, price, promo],
        );
      }
    }
  } finally {
    await client.end();
  }
  await users();
}

if (process.argv[1]?.endsWith("seed.mjs")) {
  seed()
    .then(() => console.log("[seed] catálogo e usuários prontos"))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
