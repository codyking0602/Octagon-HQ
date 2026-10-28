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

-- First scheduled regular-season tip-off is Celtics at Pistons on October 20,
-- 2026 at 3:00 PM Eastern / 2:00 PM Central. Lock everyone simultaneously.
create or replace function public.nba_futures_lock_at(p_season integer)
returns timestamptz language sql immutable set search_path = '' as $nba_lock$
  select case when p_season = 2026 then timestamptz '2026-10-20 19:00:00+00' else null end
$nba_lock$;
revoke all on function public.nba_futures_lock_at(integer) from public;

notify pgrst, 'reload schema';
