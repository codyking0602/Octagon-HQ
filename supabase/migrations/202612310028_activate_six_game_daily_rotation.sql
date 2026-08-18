-- Activate the approved six-game 60-day Today’s Challenge rotation through the
-- existing immutable schedule-version owner. Published Daily history remains untouched;
-- the new version begins no earlier than the next Central day and after every already-
-- materialized Daily Challenge.
--
-- Hit the Number's runtime release deliberately widened setup/publication support without
-- changing the active schedule. Widen the canonical schedule-version game-cycle constraint
-- here, at the release that actually activates Hit the Number in the rotation.
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
  v_version constant text := 'play-rotation-v3';
  v_central_today date := private.daily_challenge_central_day(now());
  v_starts_on date;
begin
  select greatest(
    v_central_today + 1,
    coalesce(max(daily.central_day) + 1, v_central_today + 1)
  )
  into v_starts_on
  from private.daily_challenges daily;

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
    date '2026-08-06',
    v_starts_on,
    array[
      'hit_the_number',
      'blind_resume',
      'find_leader',
      'wavelength',
      'blind_rank_5',
      'keep_4_cut_4',
      'hit_the_number',
      'blind_resume',
      'find_leader',
      'wavelength',
      'blind_rank_5',
      'hit_the_number',
      'blind_resume',
      'find_leader',
      'keep_4_cut_4',
      'wavelength',
      'hit_the_number',
      'blind_resume',
      'find_leader',
      'wavelength',
      'blind_rank_5',
      'keep_4_cut_4',
      'hit_the_number',
      'blind_resume',
      'find_leader',
      'wavelength',
      'hit_the_number',
      'blind_resume',
      'find_leader',
      'blind_rank_5',
      'keep_4_cut_4',
      'hit_the_number',
      'blind_resume',
      'find_leader',
      'wavelength',
      'hit_the_number',
      'blind_resume',
      'find_leader',
      'blind_rank_5',
      'wavelength',
      'keep_4_cut_4',
      'hit_the_number',
      'blind_resume',
      'find_leader',
      'wavelength',
      'blind_rank_5',
      'keep_4_cut_4',
      'hit_the_number',
      'blind_resume',
      'find_leader',
      'wavelength',
      'hit_the_number',
      'blind_resume',
      'find_leader',
      'blind_rank_5',
      'keep_4_cut_4',
      'wavelength',
      'hit_the_number',
      'blind_resume',
      'find_leader'
    ]::text[]
  )
  on conflict (version) do nothing;
end
$$;
