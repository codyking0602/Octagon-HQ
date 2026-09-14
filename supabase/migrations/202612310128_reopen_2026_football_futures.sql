-- Reopen 2026 Football Futures for late entries while keeping
-- public.football_futures_lock_at(p_season) as the single lock authority.
-- The September 17 deadline shown in the app is intentionally display-only.
-- Relock 2026 with a follow-up migration when entries should actually close.
create or replace function public.football_futures_lock_at(p_season integer)
returns timestamptz
language sql
immutable
set search_path = ''
as $$
  select case
    when p_season = 2026 then (
      timestamp '2099-12-31 23:59' at time zone 'America/Chicago'
    )
    else (
      make_date(p_season, 9, 1)
      + ((5 - extract(dow from make_date(p_season, 9, 1))::integer + 7) % 7)
      + time '23:59'
    ) at time zone 'America/Chicago'
  end
$$;

revoke all on function public.football_futures_lock_at(integer) from public;
notify pgrst, 'reload schema';
