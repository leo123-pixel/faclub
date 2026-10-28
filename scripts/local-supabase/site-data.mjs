// Dados do site público para o e2e e o walk: os 12 produtos visíveis da
// captura do catálogo, um oculto, 4 destaques, o banner do topo e fotos
// geradas (embalagem na cor da marca sobre fundo claro) gravadas direto no
// Storage simulado.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { ROOT, STORAGE_DIR } from "./config.mjs";

const v = (label, price, promo_price = null) => ({ label, price, promo_price });

// Ordem de criação = ordem dos destaques na Home (Super, Top Turbo, Rimula, Filtro de óleo).
export const SITE_PRODUCTS = [
  { brand: "mobil", name: "Super 5W-30 Sintético", category: "linha-leve", stock: 48, promo: true, featured: true, sku: "MOB-SUP-1",
    specs: { viscosity: "5W-30", type: "Sintético", api: "API SP", application: "Carros flex e a gasolina" },
    description: "Óleo sintético para motores modernos a gasolina, etanol e flex.",
    variants: [v("Frasco 1L", 54.9, 49.9), v("Frasco 4L", 199.9, 179.9)] },
  { brand: "shell", name: "Helix HX8 5W-30", category: "linha-leve", stock: 32, sku: "SHE-HX8-1",
    specs: { viscosity: "5W-30", type: "Sintético", api: "API SN", application: "Carros flex e a gasolina" },
    variants: [v("Frasco 1L", 52.9)] },
  { brand: "texaco", name: "Havoline 10W-40", category: "linha-leve", stock: 4, sku: "TEX-HAV-1",
    specs: { viscosity: "10W-40", type: "Semissintético", api: "API SL", application: "Carros a gasolina" },
    variants: [v("Frasco 1L", 34.9)] },
  { brand: "lubrax", name: "Top Turbo 15W-40", category: "linha-pesada", stock: 12, promo: true, featured: true, sku: "LUB-TT-20",
    specs: { viscosity: "15W-40", type: "Mineral", api: "API CI-4", application: "Motores diesel" },
    description: "Lubrificante para motores diesel de caminhões, ônibus e máquinas.",
    variants: [v("Balde 20L", 389.9, 349.9), v("Frasco 1L", 39.9), v("Frasco 4L", 149.9)], photos: 4 },
  { brand: "shell", name: "Rimula R4 15W-40", category: "linha-pesada", stock: 9, featured: true, sku: "SHE-R4-20",
    specs: { viscosity: "15W-40", type: "Mineral", api: "API CI-4", application: "Motores diesel" },
    variants: [v("Balde 20L", 459.9)] },
  { brand: "urania", name: "Urania 15W-40", category: "linha-pesada", stock: 3, sku: "URA-15-20",
    specs: { viscosity: "15W-40", type: "Mineral", application: "Motores diesel" },
    variants: [v("Balde 20L", 399.9)] },
  { brand: "brutus", name: "Brutus 15W-40", category: "linha-pesada", stock: 15, promo: true, sku: "BRU-15-20",
    specs: { viscosity: "15W-40", type: "Mineral", application: "Motores diesel" },
    variants: [v("Balde 20L", 329.9, 299.9)] },
  { brand: "mobil", name: "Delvac 15W-40", category: "linha-pesada", stock: 6, sku: "MOB-DEL-20",
    specs: { viscosity: "15W-40", type: "Mineral", api: "API CK-4", application: "Motores diesel" },
    variants: [v("Balde 20L", 419.9)] },
  { brand: "mobil", name: "Filtro de óleo", category: "filtros", stock: 60, promo: true, featured: true, sku: "PSL-55",
    specs: { application: "Linha leve" }, variants: [v("Unidade", 39.9, 34.9)] },
  { brand: "mobil", name: "Filtro de ar", category: "filtros", stock: 20, sku: "ARL-21",
    specs: { application: "Linha leve" }, variants: [v("Unidade", 59.9)] },
  { brand: "lubrax", name: "Graxa multiuso", category: "aditivos-e-graxas", stock: 30, sku: "LUB-GRX-500",
    specs: { application: "Rolamentos e chassis" }, variants: [v("Pote 500g", 24.9)] },
  { brand: "texaco", name: "Fluido de direção", category: "aditivos-e-graxas", stock: 0, sku: "TEX-ATF-1",
    specs: { application: "Direção hidráulica" }, variants: [v("Frasco 1L", 29.9)] },
  { brand: "shell", name: "Helix Ultra 5W-40", category: "linha-leve", stock: 5, visible: false, sku: "SHE-ULT-1",
    specs: { viscosity: "5W-40", type: "Sintético" }, variants: [v("Frasco 1L", 69.9)] },
];

export const SITE_BANNER = {
  title: "Troca de óleo e filtros com quem entende do assunto",
  subtitle: "Óleos das principais marcas para carro, utilitário e linha pesada. Rápido, sem enrolação e com o registro da sua próxima troca.",
  link: "/produtos",
  image_path: "banners/seed-topo.webp",
};

const BRAND_COLORS = { mobil: "#1d4f91", shell: "#d8a400", texaco: "#c8102e", lubrax: "#0f7a3a", urania: "#5b2a86", brutus: "#33363d" };

let cache = null;

/** Fotos geradas uma vez por processo: uma embalagem por marca, em quatro ângulos. */
async function photos() {
  if (cache) return cache;
  cache = {};
  for (const [brand, color] of Object.entries(BRAND_COLORS)) {
    cache[brand] = [];
    for (let i = 0; i < 4; i++) {
      const w = 220 + i * 30;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200">
        <rect width="1200" height="1200" fill="#f2f4f8"/>
        <rect x="${600 - w}" y="${300 + i * 20}" width="${w * 2}" height="${640 - i * 40}" rx="48" fill="${color}"/>
        <rect x="${560 - i * 10}" y="${230 + i * 20}" width="${80 + i * 20}" height="90" rx="16" fill="#0b1020"/>
        <rect x="${600 - w + 40}" y="${520 + i * 10}" width="${w * 2 - 80}" height="180" rx="20" fill="#ffffff" opacity="0.9"/>
      </svg>`;
      cache[brand].push(await sharp(Buffer.from(svg)).webp({ quality: 80 }).toBuffer());
    }
  }
  cache.banner = await sharp(path.join(ROOT, "public/images/home/box-de-servico.jpg"))
    .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 78 })
    .toBuffer();
  return cache;
}

function store(key, body) {
  const target = path.join(STORAGE_DIR, "product-images", key);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, body);
  writeFileSync(`${target}.meta.json`, JSON.stringify({ contentType: "image/webp", size: body.length }));
}

/** Grava os produtos do site com `save_product`, as fotos no Storage e o banner. */
export async function seedSite(client) {
  const shots = await photos();
  for (const p of SITE_PRODUCTS) {
    const { rows } = await client.query("select gen_random_uuid() as id");
    const id = rows[0].id;
    const images = [];
    for (let i = 0; i < (p.photos ?? 1); i++) {
      const key = `products/${id}/seed-${i + 1}.webp`;
      store(key, shots[p.brand][i]);
      images.push({ path: key, is_cover: i === 0 });
    }
    await client.query(
      `select public.save_product($1::jsonb || jsonb_build_object(
         'brand_id', (select id from public.brands where slug = $2),
         'category_id', (select id from public.categories where slug = $3)))`,
      [
        JSON.stringify({
          id,
          name: p.name,
          description: p.description ?? "",
          sku: p.sku,
          stock: p.stock,
          specs: p.specs,
          is_visible: p.visible ?? true,
          is_promo: p.promo ?? false,
          is_featured: p.featured ?? false,
          variants: p.variants,
          images,
        }),
        p.brand,
        p.category,
      ],
    );
  }
  store(SITE_BANNER.image_path, shots.banner);
  await client.query(
    "insert into public.banners (image_path, title, subtitle, link, is_active, position) values ($1, $2, $3, $4, true, 1)",
    [SITE_BANNER.image_path, SITE_BANNER.title, SITE_BANNER.subtitle, SITE_BANNER.link],
  );
}
