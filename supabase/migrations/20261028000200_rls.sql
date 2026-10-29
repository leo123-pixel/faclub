-- Acesso por linha (PRD seção 7, AD-011): visitantes leem só o que é público;
-- toda escrita e a leitura de pedidos exigem o papel admin no JWT.

create function public.is_admin() returns boolean
language sql stable
set search_path = ''
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
$$;

alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.coupons enable row level security;
alter table public.banners enable row level security;
alter table public.orders enable row level security;
alter table public.settings enable row level security;

-- Leitura pública
create policy categories_read on public.categories for select to anon, authenticated using (true);
create policy brands_read on public.brands for select to anon, authenticated using (true);
create policy settings_read on public.settings for select to anon, authenticated using (true);
create policy products_read on public.products for select to anon, authenticated
  using (is_visible or public.is_admin());
create policy product_variants_read on public.product_variants for select to anon, authenticated
  using (exists (
    select 1 from public.products p
    where p.id = product_id and (p.is_visible or public.is_admin())
  ));
create policy product_images_read on public.product_images for select to anon, authenticated
  using (exists (
    select 1 from public.products p
    where p.id = product_id and (p.is_visible or public.is_admin())
  ));
create policy banners_read on public.banners for select to anon, authenticated
  using (is_active or public.is_admin());
create policy coupons_read on public.coupons for select to anon, authenticated
  using (is_active or public.is_admin());
create policy orders_read on public.orders for select to authenticated using (public.is_admin());

-- Escrita só para admin
create policy categories_admin on public.categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy brands_admin on public.brands for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy products_admin on public.products for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy product_variants_admin on public.product_variants for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy product_images_admin on public.product_images for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy coupons_admin on public.coupons for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy banners_admin on public.banners for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy settings_admin on public.settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy orders_admin_update on public.orders for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy orders_admin_delete on public.orders for delete to authenticated
  using (public.is_admin());
