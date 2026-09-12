-- Stage 11 Slice 5: activate the approved future Today’s Challenge mixes at the
-- first unmaterialized Central day. Historical schedules and published Daily rows stay immutable.

-- Slice 4 added Who Am I to the canonical Daily setup/challenge constraints. Extend the
-- existing schedule-table constraint too before a future rotation is allowed to reference it.
-- The original generalized-backend check was unnamed, so replace any stale supported-game
-- check structurally instead of assuming a constraint name.
do $$
declare
  v_constraint record;
begin
  for v_constraint in
    select constraint_row.conname
    from pg_constraint constraint_row
    where constraint_row.conrelid = 'private.daily_challenge_schedule_versions'::regclass
      and constraint_row.contype = 'c'
      and pg_get_constraintdef(constraint_row.oid) like '%game_cycle%'
      and pg_get_constraintdef(constraint_row.oid) like '%keep_4_cut_4%'
      and pg_get_constraintdef(constraint_row.oid) not like '%who_am_i%'
  loop
    execute format(
      'alter table private.daily_challenge_schedule_versions drop constraint %I',
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
      check (game_cycle <@ array[
        'find_leader',
        'blind_resume',
        'wavelength',
        'blind_rank_5',
        'keep_4_cut_4',
        'hit_the_number',
        'who_am_i'
      ]::text[]);
  end if;
end
$$;

do $schedule$
declare
  v_cutover constant date := date '2026-09-12';
  v_ufc_version constant text := 'play-rotation-v7';
  v_football_version constant text := 'football-daily-v4';
  v_ufc_cycle constant text[] := array[
    'find_leader','wavelength','blind_resume','hit_the_number','who_am_i',
    'find_leader','wavelength','blind_resume','hit_the_number','who_am_i',
    'find_leader','wavelength','keep_4_cut_4','blind_resume','hit_the_number','who_am_i',
    'find_leader','wavelength','blind_resume','hit_the_number','who_am_i',
    'find_leader','wavelength','keep_4_cut_4'
  ]::text[];
  v_football_cycle constant text[] := array[
    'find_leader','wavelength','hit_the_number','who_am_i',
    'find_leader','wavelength','keep_4_cut_4','hit_the_number','who_am_i',
    'find_leader','wavelength','hit_the_number','who_am_i',
    'find_leader','wavelength','keep_4_cut_4','hit_the_number','who_am_i',
    'find_leader','wavelength'
  ]::text[];
  v_has_ufc boolean;
  v_has_football boolean;
begin
  select exists (
    select 1 from private.daily_challenge_schedule_versions where version = v_ufc_version
  ) into v_has_ufc;
  select exists (
    select 1 from private.daily_challenge_schedule_versions where version = v_football_version
  ) into v_has_football;

  if v_has_ufc is distinct from v_has_football then
    raise exception 'Stage 11 future Daily schedule identities are only partially installed';
  end if;

  if not v_has_ufc then
    if exists (
      select 1
      from private.daily_challenges challenge
      join private.daily_challenge_schedule_versions schedule
        on schedule.version = challenge.schedule_version
      where schedule.sport in ('ufc', 'football')
        and challenge.central_day >= v_cutover
    ) then
      raise exception 'refusing Stage 11 cutover because Daily content is already materialized on or after %', v_cutover;
    end if;

    insert into private.daily_challenge_schedule_versions (
      version, time_zone, anchor_day, starts_on, game_cycle, sport
    )
    values
      (v_ufc_version, 'America/Chicago', v_cutover, v_cutover, v_ufc_cycle, 'ufc'),
      (v_football_version, 'America/Chicago', v_cutover, v_cutover, v_football_cycle, 'football');
  end if;

  if not exists (
    select 1 from private.daily_challenge_schedule_versions schedule
    where schedule.version = v_ufc_version
      and schedule.sport = 'ufc'
      and schedule.time_zone = 'America/Chicago'
      and schedule.anchor_day = v_cutover
      and schedule.starts_on = v_cutover
      and schedule.game_cycle = v_ufc_cycle
  ) then
    raise exception 'UFC Stage 11 future schedule identity is not immutable/exact';
  end if;

  if not exists (
    select 1 from private.daily_challenge_schedule_versions schedule
    where schedule.version = v_football_version
      and schedule.sport = 'football'
      and schedule.time_zone = 'America/Chicago'
      and schedule.anchor_day = v_cutover
      and schedule.starts_on = v_cutover
      and schedule.game_cycle = v_football_cycle
  ) then
    raise exception 'Football Stage 11 future schedule identity is not immutable/exact';
  end if;

  if private.daily_challenge_schedule_for_day(v_cutover - 1, 'ufc') <> 'play-rotation-v6'
    or private.daily_challenge_schedule_for_day(v_cutover, 'ufc') <> v_ufc_version
    or private.daily_challenge_schedule_for_day(v_cutover - 1, 'football') <> 'football-daily-v3'
    or private.daily_challenge_schedule_for_day(v_cutover, 'football') <> v_football_version then
    raise exception 'Stage 11 future schedule cutover does not preserve the September 11/12 boundary';
  end if;

  if private.daily_challenge_expected_game('football-daily-v3', date '2026-09-07') <> 'blind_resume' then
    raise exception 'historical Football Blind Resume mapping changed';
  end if;
end
$schedule$;

-- Patch the existing standings RPC in place rather than introducing another projection owner.
do $standings$
declare
  v_signature constant regprocedure := 'public.get_daily_challenge_standings(text)'::regprocedure;
  v_definition text;
  v_marker constant text := $old$
        'hit_the_number', round((avg(history.normalized_score) filter (where history.game_type = 'hit_the_number'))::numeric, 1)
      ) as game_averages,
$old$;
  v_replacement constant text := $new$
        'hit_the_number', round((avg(history.normalized_score) filter (where history.game_type = 'hit_the_number'))::numeric, 1),
        'who_am_i', round((avg(history.normalized_score) filter (where history.game_type = 'who_am_i'))::numeric, 1)
      ) as game_averages,
$new$;
begin
  select pg_get_functiondef(v_signature::oid) into v_definition;
  if position('''who_am_i''' in v_definition) > 0 then
    return;
  end if;
  if position(v_marker in v_definition) = 0 then
    raise exception 'canonical Daily standings game-average projection changed unexpectedly';
  end if;
  execute replace(v_definition, v_marker, v_replacement);
end
$standings$;
