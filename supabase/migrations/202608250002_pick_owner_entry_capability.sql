-- Expose the existing Picks control-owner decision to the signed-in identity owner.
-- public.is_pick_control_owner(uuid) remains the sole authorization rule.

create or replace function public.get_my_pick_control_capability()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_pick_control_owner(auth.uid());
$$;

revoke all on function public.get_my_pick_control_capability()
  from public, anon, authenticated;
grant execute on function public.get_my_pick_control_capability()
  to authenticated, service_role;

comment on function public.get_my_pick_control_capability() is
  'Returns whether the authenticated profile belongs to the canonical Picks control-owner allowlist without exposing that allowlist.';
