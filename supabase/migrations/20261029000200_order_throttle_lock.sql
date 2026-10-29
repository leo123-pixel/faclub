-- O limite de envios precisa valer com pedidos simultâneos do mesmo visitante:
-- a trava por chave faz a contagem e a gravação acontecerem uma de cada vez.
create or replace function public.take_order_slot(p_key text) returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  perform pg_advisory_xact_lock(hashtext('order_throttle:' || p_key));
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
