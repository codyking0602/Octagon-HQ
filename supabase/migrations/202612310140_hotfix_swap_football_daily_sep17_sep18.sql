-- Emergency Football Daily schedule hotfix for September 17, 2026.
-- Move the Keep 4 / Blind 5 comparison slot from September 17 to September 18
-- by swapping it with September 18 Hit the Number. Preserve every later slot.
--
-- September 17 had already been materialized and completed only by the product owner
-- before this hotfix. Replace that stale Daily row so all players see the new canonical game.
do $$
declare
  v_target_day constant date := date '2026-09-17';
  v_next_day constant date := date '2026-09-18';
  v_source_version constant text := 'football-daily-v7-hit-number-pool-cleanup';
  v_replacement_version constant text := 'football-daily-v8-sep17-swap';
  v_central_today date := private.daily_challenge_central_day(now());
  v_source_cycle text[];
  v_replacement_cycle text[];
  v_existing_daily_id uuid;
  v_existing_game text;
  v_attempt_count integer;
begin
  if v_central_today <> v_target_day then
    raise exception 'September 17 Football Daily hotfix is only safe on %, current Central day is %',
      v_target_day,
      v_central_today;
  end if;

  select schedule.game_cycle
  into v_source_cycle
  from private.daily_challenge_schedule_versions schedule
  where schedule.version = v_source_version
    and schedule.sport = 'football';

  if v_source_cycle is null then
    raise exception 'source Football Daily schedule % is missing', v_source_version;
  end if;

  if private.daily_challenge_schedule_for_day(v_target_day, 'football') is distinct from v_source_version
    or private.daily_challenge_expected_game(v_source_version, v_target_day) is distinct from 'keep_4_cut_4'
    or private.daily_challenge_expected_game(v_source_version, v_next_day) is distinct from 'hit_the_number' then
    raise exception 'source Football Daily September 17/18 mapping changed unexpectedly';
  end if;

  -- v7 keeps the September 12 anchor. September 17/18 are cycle slots 6/7.
  v_replacement_cycle := v_source_cycle;
  v_replacement_cycle[6] := 'hit_the_number';
  v_replacement_cycle[7] := 'keep_4_cut_4';

  select daily.id, daily.game_type
  into v_existing_daily_id, v_existing_game
  from private.daily_challenges daily
  where daily.schedule_version = v_source_version
    and daily.central_day = v_target_day;

  if v_existing_daily_id is not null then
    if v_existing_game is distinct from 'keep_4_cut_4' then
      raise exception 'refusing to replace unexpected published Football Daily game % on %',
        v_existing_game,
        v_target_day;
    end if;

    select count(*)::integer
    into v_attempt_count
    from private.daily_challenge_attempts attempt
    where attempt.daily_challenge_id = v_existing_daily_id;

    -- One owner playtest existed when this hotfix was prepared. Refuse to erase a second
    -- player's completed result if traffic reaches the old game before deployment finishes.
    if v_attempt_count > 1 then
      raise exception 'refusing Football Daily hotfix because % completed attempts now exist', v_attempt_count;
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
    v_replacement_cycle,
    source.sport
  from private.daily_challenge_schedule_versions source
  where source.version = v_source_version
    and source.sport = 'football';

  if not found then
    raise exception 'source Football Daily schedule % disappeared during hotfix', v_source_version;
  end if;

  if private.daily_challenge_schedule_for_day(v_target_day, 'football') is distinct from v_replacement_version
    or private.daily_challenge_expected_game(v_replacement_version, v_target_day) is distinct from 'hit_the_number'
    or private.daily_challenge_expected_game(v_replacement_version, v_next_day) is distinct from 'keep_4_cut_4'
    or private.daily_challenge_expected_game(v_replacement_version, date '2026-09-19')
      is distinct from private.daily_challenge_expected_game(v_source_version, date '2026-09-19') then
    raise exception 'replacement Football Daily schedule did not preserve the intended September 17/18 swap';
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
