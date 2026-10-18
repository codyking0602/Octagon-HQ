-- Open NBA Futures to every signed-in HQ member without changing the locked
-- scoring, published win-total board, or the existing profile-specific picks.
-- The retained function name keeps the existing get/save RPCs compatible.
create or replace function public.nba_futures_owner_preview_allowed(p_profile uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select p_profile is not null
    and exists (select 1 from public.profiles profile where profile.id = p_profile);
$$;

revoke all on function public.nba_futures_owner_preview_allowed(uuid)
  from public, anon, authenticated;

comment on function public.nba_futures_owner_preview_allowed(uuid)
  is 'Backwards-compatible NBA Futures access predicate; public launch allows all signed-in profiles.';

notify pgrst, 'reload schema';
