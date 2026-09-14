begin;

select set_config('request.jwt.claim.role', 'service_role', true);

do $nfl_divisions_sim$
declare
  v_min numeric;
  v_max numeric;
  v_avg numeric;
begin
  if (select count(*) from private.draft_room_nfl_divisions_pool) <> 128 then
    raise exception 'NFL Divisions simulation contract requires 128 team-seasons';
  end if;

  if (select count(distinct team_code) from private.draft_room_nfl_divisions_pool) <> 32
    or exists (
      select 1 from private.draft_room_nfl_divisions_pool
      group by team_code
      having count(*) <> 4
    )
  then
    raise exception 'NFL Divisions franchise coverage drifted';
  end if;

  if (select count(distinct division_label) from private.draft_room_nfl_divisions_pool) <> 8
    or exists (
      select 1 from private.draft_room_nfl_divisions_pool
      group by division_label
      having count(*) <> 16
    )
  then
    raise exception 'NFL Divisions division coverage drifted';
  end if;

  if exists (
    select 1
    from (
      select division_label, team_code, count(*) season_count
      from private.draft_room_nfl_divisions_pool
      group by division_label, team_code
    ) franchise
    where season_count <> 4
  ) then
    raise exception 'NFL Divisions does not keep four curated seasons per franchise';
  end if;

  select min(hidden_grade), max(hidden_grade), avg(hidden_grade)
  into v_min, v_max, v_avg
  from private.draft_room_nfl_divisions_pool;

  if v_min <> 78 or v_max <> 100 or v_avg not between 85 and 92 then
    raise exception 'NFL Divisions grading distribution drifted: min %, max %, avg %', v_min, v_max, v_avg;
  end if;

  if not exists (
    select 1 from private.draft_room_nfl_divisions_pool
    where season_reference = 'nfl-division-ne-2016' and hidden_grade = 100
  ) or not exists (
    select 1 from private.draft_room_nfl_divisions_pool
    where season_reference = 'nfl-division-sea-2013' and hidden_grade >= 98
  ) or not exists (
    select 1 from private.draft_room_nfl_divisions_pool
    where season_reference = 'nfl-division-bal-2019'
  ) or not exists (
    select 1 from private.draft_room_nfl_divisions_pool
    where season_reference = 'nfl-division-dal-2016'
  ) then
    raise exception 'NFL Divisions representative season anchors drifted';
  end if;

  if exists (
    select 1
    from private.draft_room_nfl_divisions_pool
    where season_year < 1999 or season_year > 2025
  ) then
    raise exception 'NFL Divisions population escaped the pinned completed-season window';
  end if;
end $nfl_divisions_sim$;

rollback;
