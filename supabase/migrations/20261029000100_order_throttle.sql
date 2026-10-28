-- Limite de envios de pedido: 5 por visitante a cada 10 minutos (CART-04 AC 7).
-- A chave é o HMAC do IP feito no servidor; o banco nunca vê o IP, e cada
-- linha some em 10 minutos. Só a rota de pedidos (service role) usa.

create table public.order_throttle (
  key text not null,
  created_at timestamptz not null default now()
);
create index order_throttle_key_idx on public.order_throttle (key, created_at);

alter table public.order_throttle enable row level security;
revoke all on public.order_throttle from anon, authenticated;

create function public.take_order_slot(p_key text) returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.order_throttle where created_at < now() - interval '10 minutes';
  if (select count(*) from public.order_throttle where key = p_key) >= 5 then
    return false;
  end if;
  insert into public.order_throttle (key) values (p_key);
  return true;
end
$$;

revoke execute on function public.take_order_slot(text) from public, anon, authenticated;
grant execute on function public.take_order_slot(text) to service_role;
