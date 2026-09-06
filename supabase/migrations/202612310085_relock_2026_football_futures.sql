-- Relock 2026 Football Futures by restoring the canonical Central lock schedule.
create or replace function public.football_futures_lock_at(p_season integer)
returns timestamptz
language sql
immutable
set search_path = ''
as $$
  select (
    make_date(p_season, 9, 1)
    + ((5 - extract(dow from make_date(p_season, 9, 1))::integer + 7) % 7)
    + time '23:59'
  ) at time zone 'America/Chicago'
$$;

revoke all on function public.football_futures_lock_at(integer) from public;
notify pgrst, 'reload schema';
