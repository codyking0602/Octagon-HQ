begin;
-- Protect the approved 2026 Championship start windows across all projections.
do $$
declare
  season_def text := pg_get_functiondef('public.get_sport_championship(text,integer)'::regprocedure);
  week_def text := pg_get_functiondef('private.sport_championship_week_projection(text,integer,date,date)'::regprocedure);
  archive_def text := pg_get_functiondef('public.get_sport_championship_weekly(text,integer)'::regprocedure);
begin
  if position('2026-09-15' in season_def) = 0
    or position('2026-09-15' in week_def) = 0
    or position('2026-09-15' in archive_def) = 0 then
    raise exception 'Football season start must remain September 15, 2026';
  end if;
  if position('2026-09-07' in season_def) = 0
    or position('2026-09-07' in week_def) = 0
    or position('2026-09-07' in archive_def) = 0
    or position('2026-08-10' in season_def) > 0
    or position('2026-08-10' in week_def) > 0
    or position('2026-08-10' in archive_def) > 0 then
    raise exception 'UFC Championship must begin September 7, 2026 across season and weekly rankings';
  end if;
  if position('and starts_at >= (v_daily_start::timestamp at time zone ''America/Chicago'')' in season_def) = 0 then
    raise exception 'Season Picks must exclude starts before the season start';
  end if;
  if position('and starts_at >= (greatest(v_daily_start, p_week_start)::timestamp at time zone ''America/Chicago'')' in week_def) = 0
    or position('and event.starts_at >= (v_daily_start::timestamp at time zone ''America/Chicago'')' in week_def) = 0 then
    raise exception 'Weekly Picks and historical participant cohort must enforce approved season start';
  end if;
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
do $$
declare
  v jsonb;
  v_weekly jsonb;
begin
  for v in select public.get_sport_championship('ufc',2026) loop
    if exists (
      select 1 from jsonb_array_elements(v->'entries') e,
      lateral jsonb_array_elements(e->'event_results') ev
      where (ev->>'date')::date < date '2026-09-07'
    ) then
      raise exception 'Pre-season UFC event included in 2026 Championship';
    end if;
  end loop;
  v_weekly := public.get_sport_championship_weekly('ufc',2026);
  if exists (
    select 1 from jsonb_array_elements(v_weekly->'weeks') w
    where (w->>'week_start')::date < date '2026-09-07'
  ) then
    raise exception 'Pre-season UFC weekly winner included after season reset';
  end if;
end $$;
rollback;
