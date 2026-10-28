-- Regras de integridade do catálogo (AD-011) e gravação atômica do produto.

create schema if not exists extensions;
create extension if not exists unaccent with schema extensions;
grant usage on schema extensions to anon, authenticated, service_role;

create function public.make_slug(value text) returns text
language sql stable
set search_path = public, extensions
as $$
  select trim(both '-' from regexp_replace(lower(unaccent(coalesce(value, ''))), '[^a-z0-9]+', '-', 'g'))
$$;

-- Categoria e marca recebem o slug do nome na criação; depois ele não muda,
-- para não quebrar links.
create function public.set_slug_from_name() returns trigger
language plpgsql as $$
begin
  if new.slug is null or new.slug = '' then
    new.slug := public.make_slug(new.name);
  end if;
  return new;
end
$$;

create trigger categories_slug before insert on public.categories
  for each row execute function public.set_slug_from_name();
create trigger brands_slug before insert on public.brands
  for each row execute function public.set_slug_from_name();

-- Categoria nova vai para o fim da ordem.
create function public.category_position() returns trigger
language plpgsql as $$
begin
  if new.position is null or new.position = 0 then
    select coalesce(max(position), 0) + 1 into new.position from public.categories;
  end if;
  return new;
end
$$;

create trigger categories_position before insert on public.categories
  for each row execute function public.category_position();

-- Excluir categoria ou marca com produtos é recusado com a contagem.
create function public.guard_category_delete() returns trigger
language plpgsql as $$
declare n integer;
begin
  select count(*) into n from public.products where category_id = old.id;
  if n > 0 then
    raise exception 'category_in_use:%', n;
  end if;
  return old;
end
$$;

create function public.guard_brand_delete() returns trigger
language plpgsql as $$
declare n integer;
begin
  select count(*) into n from public.products where brand_id = old.id;
  if n > 0 then
    raise exception 'brand_in_use:%', n;
  end if;
  return old;
end
$$;

create trigger categories_delete_guard before delete on public.categories
  for each row execute function public.guard_category_delete();
create trigger brands_delete_guard before delete on public.brands
  for each row execute function public.guard_brand_delete();

-- Oferta exige preço promocional em ao menos uma embalagem. A checagem fica
-- para o fim da transação, para save_product poder trocar as embalagens.
create function public.check_promo_price() returns trigger
language plpgsql as $$
declare pid uuid;
begin
  if tg_table_name = 'products' then
    pid := new.id;
  elsif tg_op = 'DELETE' then
    pid := old.product_id;
  else
    pid := new.product_id;
  end if;

  if exists (select 1 from public.products p where p.id = pid and p.is_promo)
     and not exists (select 1 from public.product_variants v where v.product_id = pid and v.promo_price is not null)
  then
    raise exception 'promo_requires_price';
  end if;
  return null;
end
$$;

create constraint trigger products_promo_guard after insert or update of is_promo on public.products
  deferrable initially deferred
  for each row execute function public.check_promo_price();
create constraint trigger variants_promo_guard after insert or update or delete on public.product_variants
  deferrable initially deferred
  for each row execute function public.check_promo_price();

-- Slug único de produto: sufixo -2, -3...
create function public.unique_product_slug(name text, product_id uuid) returns text
language plpgsql stable as $$
declare
  base text := public.make_slug(name);
  candidate text := base;
  n integer := 1;
begin
  while exists (select 1 from public.products p where p.slug = candidate and p.id <> product_id) loop
    n := n + 1;
    candidate := base || '-' || n;
  end loop;
  return candidate;
end
$$;

-- Grava produto, embalagens e fotos numa transação. Roda com os direitos de
-- quem chama, então o RLS decide quem pode.
create function public.save_product(p jsonb) returns uuid
language plpgsql
security invoker
as $$
declare
  pid uuid := (p ->> 'id')::uuid;
begin
  if exists (select 1 from public.products where id = pid) then
    update public.products set
      name = p ->> 'name',
      brand_id = (p ->> 'brand_id')::uuid,
      category_id = (p ->> 'category_id')::uuid,
      description = coalesce(p ->> 'description', ''),
      sku = nullif(p ->> 'sku', ''),
      stock = coalesce((p ->> 'stock')::integer, 0),
      specs = coalesce(p -> 'specs', '{}'::jsonb),
      is_visible = coalesce((p ->> 'is_visible')::boolean, false),
      is_promo = coalesce((p ->> 'is_promo')::boolean, false),
      is_featured = coalesce((p ->> 'is_featured')::boolean, false)
    where id = pid;
  else
    insert into public.products (
      id, slug, name, brand_id, category_id, description, sku, stock, specs, is_visible, is_promo, is_featured
    ) values (
      pid,
      public.unique_product_slug(p ->> 'name', pid),
      p ->> 'name',
      (p ->> 'brand_id')::uuid,
      (p ->> 'category_id')::uuid,
      coalesce(p ->> 'description', ''),
      nullif(p ->> 'sku', ''),
      coalesce((p ->> 'stock')::integer, 0),
      coalesce(p -> 'specs', '{}'::jsonb),
      coalesce((p ->> 'is_visible')::boolean, false),
      coalesce((p ->> 'is_promo')::boolean, false),
      coalesce((p ->> 'is_featured')::boolean, false)
    );
  end if;

  if not found then
    raise exception 'product_not_saved';
  end if;

  delete from public.product_variants where product_id = pid;
  insert into public.product_variants (product_id, label, price, promo_price, position)
  select pid, v ->> 'label', (v ->> 'price')::numeric, nullif(v ->> 'promo_price', '')::numeric, ord - 1
  from jsonb_array_elements(coalesce(p -> 'variants', '[]'::jsonb)) with ordinality as t (v, ord);

  delete from public.product_images where product_id = pid;
  insert into public.product_images (product_id, path, is_cover, position)
  select pid, i ->> 'path', coalesce((i ->> 'is_cover')::boolean, false), ord - 1
  from jsonb_array_elements(coalesce(p -> 'images', '[]'::jsonb)) with ordinality as t (i, ord);

  return pid;
end
$$;
