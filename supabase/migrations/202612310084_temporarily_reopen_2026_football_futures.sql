-- Temporarily reopen 2026 Football Futures while keeping the existing lock function
-- as the single owner for both reads and saves. Remove this season override when
-- Cody is ready to relock Futures.
create or replace function public.football_futures_lock_at(p_season integer)
returns timestamptz
language sql
immutable
set search_path = ''
as $$
  select case
    when p_season = 2026 then (
      timestamp '2026-12-31 23:59' at time zone 'America/Chicago'
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
