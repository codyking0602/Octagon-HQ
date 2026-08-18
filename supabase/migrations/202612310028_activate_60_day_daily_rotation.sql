-- Activate the approved six-game Today’s Challenge rotation beginning 2026-08-18.
-- Preserve every prior schedule row and published challenge; this is a forward-only schedule version.
do $$
declare
  v_constraint record;
begin
  for v_constraint in
    select namespace.nspname, relation.relname, constraint_row.conname
    from pg_constraint constraint_row
    join pg_class relation on relation.oid = constraint_row.conrelid
    join pg_namespace namespace on namespace.oid = relation.relnamespace
    where namespace.nspname = 'private'
      and relation.relname = 'daily_challenge_schedule_versions'
      and constraint_row.contype = 'c'
      and pg_get_constraintdef(constraint_row.oid) like '%game_cycle%'
      and pg_get_constraintdef(constraint_row.oid) like '%keep_4_cut_4%'
      and pg_get_constraintdef(constraint_row.oid) not like '%hit_the_number%'
  loop
    execute format(
      'alter table %I.%I drop constraint %I',
      v_constraint.nspname,
      v_constraint.relname,
      v_constraint.conname
    );
  end loop;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint constraint_row
    where constraint_row.conrelid = 'private.daily_challenge_schedule_versions'::regclass
      and constraint_row.conname = 'daily_challenge_schedule_versions_supported_games_check'
  ) then
    alter table private.daily_challenge_schedule_versions
      add constraint daily_challenge_schedule_versions_supported_games_check
      check (
        game_cycle <@ array[
          'find_leader',
          'blind_resume',
          'wavelength',
          'blind_rank_5',
          'keep_4_cut_4',
          'hit_the_number'
        ]::text[]
      );
  end if;
end
$$;

do $$
declare
  v_source_version constant text := 'play-rotation-v2';
  v_version constant text := 'play-rotation-v3';
  v_start constant date := date '2026-08-18';
  v_cycle constant text[] := array[
    'find_leader',
    'wavelength',
    'hit_the_number',
    'keep_4_cut_4',
    'blind_resume',
    'find_leader',
    'hit_the_number',
    'wavelength',
    'blind_rank_5',
    'blind_resume',
    'find_leader',
    'keep_4_cut_4',
    'hit_the_number',
    'wavelength',
    'blind_resume',
    'find_leader',
    'blind_rank_5',
    'hit_the_number',
    'blind_resume',
    'wavelength',
    'keep_4_cut_4',
    'find_leader',
    'hit_the_number',
    'blind_resume',
    'blind_rank_5',
    'wavelength',
    'hit_the_number',
    'find_leader',
    'keep_4_cut_4',
    'blind_resume',
    'hit_the_number',
    'wavelength',
    'find_leader',
    'blind_rank_5',
    'blind_resume',
    'hit_the_number',
    'keep_4_cut_4',
    'wavelength',
    'find_leader',
    'blind_resume',
    'hit_the_number',
    'blind_rank_5',
    'find_leader',
    'wavelength',
    'blind_resume',
    'keep_4_cut_4',
    'hit_the_number',
    'find_leader',
    'blind_resume',
    'wavelength',
    'blind_rank_5',
    'hit_the_number',
    'find_leader',
    'blind_resume',
    'keep_4_cut_4',
    'wavelength',
    'find_leader',
    'hit_the_number',
    'blind_resume',
    'blind_rank_5'
  ]::text[];
  v_source private.daily_challenge_schedule_versions;
  v_existing private.daily_challenge_schedule_versions;
  v_activation_day date;
  v_index integer;
begin
  if coalesce(array_length(v_cycle, 1), 0) <> 60 then
    raise exception 'Daily rotation v3 must contain exactly 60 days';
  end if;

  if (select count(*) from unnest(v_cycle) game where game = 'find_leader') <> 12
    or (select count(*) from unnest(v_cycle) game where game = 'blind_resume') <> 12
    or (select count(*) from unnest(v_cycle) game where game = 'hit_the_number') <> 12
    or (select count(*) from unnest(v_cycle) game where game = 'wavelength') <> 10
    or (select count(*) from unnest(v_cycle) game where game = 'blind_rank_5') <> 7
    or (select count(*) from unnest(v_cycle) game where game = 'keep_4_cut_4') <> 7 then
    raise exception 'Daily rotation v3 weights drifted from the approved 12/12/12/10/7/7 contract';
  end if;

  if exists (
    select 1
    from unnest(v_cycle) game
    where game not in (
      'find_leader',
      'blind_resume',
      'hit_the_number',
      'wavelength',
      'blind_rank_5',
      'keep_4_cut_4'
    )
  ) then
    raise exception 'Daily rotation v3 contains an unsupported game';
  end if;

  for v_index in 1..60 loop
    if v_cycle[v_index] = v_cycle[(v_index % 60) + 1] then
      raise exception 'Daily rotation v3 repeats % at cycle position %, including the cycle boundary',
        v_cycle[v_index],
        v_index;
    end if;
  end loop;

  select schedule.*
  into v_source
  from private.daily_challenge_schedule_versions schedule
  where schedule.version = v_source_version;

  if v_source.version is null then
    raise exception 'source Daily Challenge schedule % is missing', v_source_version;
  end if;

  -- Production's V2 began on August 17, so this resolves to the approved August 18 start.
  -- A future fresh-database replay may intentionally move historical V2 later; in that case V3
  -- follows that replay-safe boundary while retaining August 18 as the deterministic cycle anchor.
  v_activation_day := greatest(v_start, v_source.starts_on);

  select schedule.*
  into v_existing
  from private.daily_challenge_schedule_versions schedule
  where schedule.version = v_version;

  if v_existing.version is not null then
    if v_existing.time_zone <> 'America/Chicago'
      or v_existing.anchor_day <> v_start
      or v_existing.starts_on <> v_activation_day
      or v_existing.game_cycle is distinct from v_cycle then
      raise exception 'existing Daily rotation v3 does not match the approved contract: %', row_to_json(v_existing);
    end if;
    return;
  end if;

  if exists (
    select 1
    from private.daily_challenges daily
    where daily.central_day >= v_activation_day
      and daily.schedule_version <> v_version
  ) then
    raise exception 'refusing to activate Daily rotation v3 across an already-materialized day on or after %', v_activation_day;
  end if;

  insert into private.daily_challenge_schedule_versions (
    version,
    time_zone,
    anchor_day,
    starts_on,
    game_cycle
  )
  values (
    v_version,
    'America/Chicago',
    v_start,
    v_activation_day,
    v_cycle
  );
end
$$;
