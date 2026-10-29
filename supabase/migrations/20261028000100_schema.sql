-- Esquema do MVP (PRD seção 7), com preço só nas embalagens (AD-003, AD-009).

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null check (btrim(name) <> ''),
  position integer not null default 0,
  created_at timestamptz not null default now()
);
create unique index categories_name_key on public.categories (lower(name));

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null check (btrim(name) <> ''),
  logo_path text,
  created_at timestamptz not null default now()
);
create unique index brands_name_key on public.brands (lower(name));

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null check (btrim(name) <> ''),
  brand_id uuid not null references public.brands (id) on delete restrict,
  category_id uuid not null references public.categories (id) on delete restrict,
  description text not null default '',
  is_visible boolean not null default false,
  is_promo boolean not null default false,
  is_featured boolean not null default false,
  sku text,
  specs jsonb not null default '{}'::jsonb
    check (coalesce(specs ->> 'type', 'Mineral') in ('Mineral', 'Semissintético', 'Sintético')),
  stock integer not null default 0 check (stock >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_brand_idx on public.products (brand_id);
create index products_category_idx on public.products (category_id);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  label text not null check (btrim(label) <> ''),
  price numeric(10, 2) not null check (price > 0),
  promo_price numeric(10, 2) check (promo_price is null or (promo_price > 0 and promo_price < price)),
  position integer not null default 0,
  unique (product_id, label)
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  path text not null,
  position integer not null default 0,
  is_cover boolean not null default false
);
create index product_images_product_idx on public.product_images (product_id);
create unique index product_images_one_cover on public.product_images (product_id) where is_cover;

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code = upper(code) and code !~ '\s' and code <> ''),
  percent integer not null check (percent between 1 and 100),
  description text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.banners (
  id uuid primary key default gen_random_uuid(),
  image_path text not null,
  title text not null check (btrim(title) <> ''),
  subtitle text not null default '',
  link text,
  is_active boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.orders (
  id bigint generated always as identity primary key,
  items jsonb not null,
  total_estimated numeric(10, 2) not null check (total_estimated >= 0),
  customer_name text check (char_length(customer_name) <= 80),
  vehicle text check (char_length(vehicle) <= 40),
  coupon_code text,
  status text not null default 'Novo' check (status in ('Novo', 'Atendido', 'Cancelado')),
  source_url text,
  created_at timestamptz not null default now()
);
create index orders_created_idx on public.orders (created_at desc);

create table public.settings (
  id integer primary key default 1 check (id = 1),
  whatsapp text not null,
  phone text not null default '',
  email text not null default '',
  address text not null default '',
  hours_weekdays text not null default '',
  hours_saturday text not null default '',
  group_link text,
  instagram text,
  schedule_message text not null default 'Olá! Quero agendar uma troca de óleo.',
  updated_at timestamptz not null default now()
);

create function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end
$$;

create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();
create trigger settings_touch before update on public.settings
  for each row execute function public.touch_updated_at();

-- Dados iniciais (PRD seção 7 e Decisões).
insert into public.categories (slug, name, position) values
  ('linha-leve', 'Linha leve', 1),
  ('linha-pesada', 'Linha pesada', 2),
  ('filtros', 'Filtros', 3),
  ('aditivos-e-graxas', 'Aditivos e graxas', 4);

insert into public.brands (slug, name) values
  ('mobil', 'Mobil'), ('shell', 'Shell'), ('texaco', 'Texaco'),
  ('lubrax', 'Lubrax'), ('urania', 'Urania'), ('brutus', 'Brutus');

insert into public.coupons (code, percent, description) values
  ('FACLUB10', 10, '10% de desconto na troca feita na loja.');

insert into public.settings (id, whatsapp, phone, email, address, hours_weekdays, hours_saturday) values
  (1, '1129545764', '(11) 2954-5764', 'contato@faclubrificantes.com.br',
   'Rua Cabo Antônio Alves, 50, Parque Novo Mundo, São Paulo', '7h às 18h', '8h às 13h');
