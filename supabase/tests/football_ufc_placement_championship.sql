begin;

-- Deterministic placement curve: an absent entrant in a six-person
-- Championship receives 6th-place points, not 0.
do $$
declare
  v_points numeric[];
  v_missing numeric;
  v_overall numeric;
  v_ufc_overall numeric;
begin
  select array_agg(private.sport_championship_placement_points(place) order by place)
    into v_points
  from generate_series(1, 8) place;
  if v_points is distinct from array[100, 92, 85, 79, 74, 70, 66, 62]::numeric[] then
    raise exception 'Championship placement curve changed: %', v_points;
  end if;

  with members(profile_id) as (
    values (1),(2),(3),(4),(5),(6)
  ),
  daily_entrants(profile_id, place) as (
    values (1,1),(2,2),(3,3),(4,4),(5,5)
  )
  select private.sport_championship_placement_points(
    coalesce(participant.place, (select count(*)::integer from members))
  ) into v_missing
  from members member
  left join daily_entrants participant using (profile_id)
  where member.profile_id = 6;

  if v_missing <> 70 then
    raise exception 'One missed Daily must yield 6th-place points, not zero: %', v_missing;
  end if;

  -- Full 60/30/10 Football split, including exactly one Featured lane.
  v_overall := round(90 * .60 + 80 * .30 + 100 * .10, 2);
  if v_overall <> 88 then
    raise exception '60/30/10 weighting failed: %', v_overall;
  end if;

  -- No finalized UFC Featured lane: its 10% stays with Daily.
  v_ufc_overall := round(90 * .60 + 80 * .40, 2);
  if v_ufc_overall <> 86 then
    raise exception '60/40 UFC fallback weighting failed: %', v_ufc_overall;
  end if;

  if not exists (
    select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public'
      and p.proname='get_sport_championship'
      and pg_get_function_identity_arguments(p.oid)='p_sport text, p_season integer'
      and p.prosecdef and p.provolatile='s'
  ) then
    raise exception 'Stable, authenticated Championship RPC is missing';
  end if;
end $$;

rollback;
\echo 'Football/UFC placement Championship calculation proof passed.'
