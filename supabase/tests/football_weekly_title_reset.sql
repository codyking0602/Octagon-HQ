begin;

select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_definition text;
  v_titles_now integer;
  v_titles_next_week integer;
  v_ufc_titles integer;
begin
  select pg_get_functiondef('public.get_daily_challenge_standings(text)'::regprocedure::oid)
  into v_definition;

  if position('v_ufc_championship_start date := date ''2026-08-10''' in v_definition) = 0 then
    raise exception 'Football Tuesday cadence changed or removed the UFC championship cutoff';
  end if;

  if position('v_football_championship_start date := date ''2026-09-07''' in v_definition) = 0 then
    raise exception 'Football Tuesday championship cutoff is missing';
  end if;

  if position('(p_sport = ''ufc'' and week_start >= v_ufc_championship_start)' in v_definition) = 0
    or position('(p_sport = ''football'' and week_start >= v_football_championship_start)' in v_definition) = 0 then
    raise exception 'weekly title cutoff is not explicitly sport-scoped';
  end if;

  if position('''who_am_i''' in v_definition) = 0 then
    raise exception 'Football title reset regressed the existing Who Am I standings projection';
  end if;

  with weekly_ranked(profile_id, week_start, weekly_rank) as (
    values
      ('cody', date '2026-09-01', 1),
      ('cody', date '2026-09-08', 1)
  )
  select count(*) filter (
    where weekly_rank = 1
      and week_start < date '2026-09-08'
      and week_start >= date '2026-09-08'
  )::integer
  into v_titles_now
  from weekly_ranked;

  if v_titles_now <> 0 then
    raise exception 'Football titles were not zeroed during the active reset week: %', v_titles_now;
  end if;

  with weekly_ranked(profile_id, week_start, weekly_rank) as (
    values
      ('cody', date '2026-09-01', 1),
      ('cody', date '2026-09-08', 1)
  )
  select count(*) filter (
    where weekly_rank = 1
      and week_start < date '2026-09-15'
      and week_start >= date '2026-09-08'
  )::integer
  into v_titles_next_week
  from weekly_ranked;

  if v_titles_next_week <> 1 then
    raise exception 'first Tuesday-cadence Football title is not awarded after this week: %', v_titles_next_week;
  end if;

  with weekly_ranked(profile_id, week_start, weekly_rank) as (
    values
      ('cody', date '2026-08-03', 1),
      ('cody', date '2026-08-10', 1),
      ('cody', date '2026-08-17', 1)
  )
  select count(*) filter (
    where weekly_rank = 1
      and week_start < date '2026-09-08'
      and week_start >= date '2026-08-10'
  )::integer
  into v_ufc_titles
  from weekly_ranked;

  if v_ufc_titles <> 2 then
    raise exception 'UFC weekly-title era changed during Football-only reset: %', v_ufc_titles;
  end if;
end
$$;

rollback;

\echo 'Football-only weekly title reset proof passed.'
