-- NBA 2026-27 Futures close at the first 2026-27 NBA regular-season tip.
-- Celtics at Pistons: Oct 20, 2026, 3:00 PM Eastern / 2:00 PM Central.
-- Server-owned deadline applies to every member, including saved draft revisions.
create or replace function public.nba_futures_lock_at(p_season integer)
returns timestamptz language sql immutable set search_path = '' as $$
  select case when p_season = 2026
    then timestamptz '2026-10-20 19:00:00+00' else null end
$$;
revoke all on function public.nba_futures_lock_at(integer) from public;
notify pgrst, 'reload schema';
