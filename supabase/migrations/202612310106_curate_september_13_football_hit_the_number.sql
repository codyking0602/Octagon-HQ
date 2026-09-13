-- One-time same-day Football Daily reset so September 13 uses the capped,
-- curated Football Hit the Number board contract instead of the prior open roster.
do $$
declare
  v_target_day constant date := date '2026-09-13';
  v_source_version constant text := 'football-daily-v6-question-refresh';
  v_replacement_version constant text := 'football-daily-v7-curated-hit-number';
  v_central_today date := private.daily_challenge_central_day(now());
  v_existing_daily_id uuid;
  v_existing_game text;
  v_existing_metric text;
  v_existing_candidate_count integer;
begin
  if not exists (
    select 1
    from private.daily_challenge_schedule_versions schedule
    where schedule.version = v_source_version
      and schedule.sport = 'football'
  ) then
    raise exception 'source Football Daily schedule % is missing', v_source_version;
  end if;

  if private.daily_challenge_expected_game(v_source_version, v_target_day) is distinct from 'hit_the_number' then
    raise exception 'expected source Football Daily to be Hit the Number on %', v_target_day;
  end if;

  select
    daily.id,
    daily.game_type,
    setup.public_setup->>'metric_id',
    jsonb_array_length(coalesce(setup.public_setup->'candidates', '[]'::jsonb))
  into
    v_existing_daily_id,
    v_existing_game,
    v_existing_metric,
    v_existing_candidate_count
  from private.daily_challenges daily
  join private.daily_challenge_setups setup on setup.id = daily.setup_id
  where daily.schedule_version = v_source_version
    and daily.central_day = v_target_day;

  if v_existing_daily_id is not null then
    if v_central_today <> v_target_day then
      raise exception 'September 13 Football Daily reset is only safe on %, current Central day is %',
        v_target_day,
        v_central_today;
    end if;

    if v_existing_game is distinct from 'hit_the_number' then
      raise exception 'refusing to reset unexpected published Football Daily game % on %',
        v_existing_game,
        v_target_day;
    end if;

    if v_existing_metric is distinct from 'nfl-season-passing-yards' then
      raise exception 'refusing to replace unexpected Football Hit the Number metric % on %',
        coalesce(v_existing_metric, '<none>'),
        v_target_day;
    end if;

    if coalesce(v_existing_candidate_count, 0) <= 16 then
      raise exception 'source Football Hit the Number board is already capped at % candidates; refusing destructive reset',
        v_existing_candidate_count;
    end if;
  end if;

  if exists (
    select 1
    from private.daily_challenge_schedule_versions schedule
    where schedule.version = v_replacement_version
  ) then
    raise exception 'replacement Football Daily schedule % already exists', v_replacement_version;
  end if;

  insert into private.daily_challenge_schedule_versions (
    version,
    time_zone,
    anchor_day,
    starts_on,
    game_cycle,
    sport
  )
  select
    v_replacement_version,
    source.time_zone,
    source.anchor_day,
    v_target_day,
    source.game_cycle,
    source.sport
  from private.daily_challenge_schedule_versions source
  where source.version = v_source_version
    and source.sport = 'football';

  if not found then
    raise exception 'source Football Daily schedule % disappeared during reset', v_source_version;
  end if;

  if private.daily_challenge_schedule_for_day(v_target_day, 'football') is distinct from v_replacement_version
    or private.daily_challenge_expected_game(v_replacement_version, v_target_day) is distinct from 'hit_the_number' then
    raise exception 'replacement Football Daily schedule did not preserve Hit the Number on %', v_target_day;
  end if;

  if v_existing_daily_id is not null then
    alter table private.daily_challenge_attempts
      disable trigger daily_challenge_attempts_immutable;
    alter table private.daily_challenges
      disable trigger daily_challenges_immutable;

    delete from private.daily_challenge_progress progress
    where progress.daily_challenge_id = v_existing_daily_id;

    delete from private.daily_challenge_attempts attempt
    where attempt.daily_challenge_id = v_existing_daily_id;

    delete from private.daily_challenges daily
    where daily.id = v_existing_daily_id
      and daily.schedule_version = v_source_version
      and daily.central_day = v_target_day;

    alter table private.daily_challenge_attempts
      enable trigger daily_challenge_attempts_immutable;
    alter table private.daily_challenges
      enable trigger daily_challenges_immutable;
  end if;
end
$$;
