-- One-time same-day replacement for the August 17, 2026 official Daily Challenge.
-- Keep the canonical rotation/runtime owner: a new immutable schedule identity makes the
-- existing runtime materialize a fresh Blind Rank Five setup under the current generator.
-- Fresh database replays may create play-rotation-v1 after the historical target day; in that
-- case preserve the same rotation and activate the replacement when that source rotation starts.
do $$
declare
  v_target_day constant date := date '2026-08-17';
  v_source_version constant text := 'play-rotation-v1';
  v_replacement_version constant text := 'play-rotation-v2';
  -- Keep this historical release guard replay-safe without introducing another runtime owner.
  -- The canonical Daily backend also uses America/Chicago; this inline expression only protects
  -- fresh migration replay if the helper function is not yet available in that transient stack.
  v_central_today date := (now() at time zone 'America/Chicago')::date;
  v_source_starts_on date;
  v_replacement_starts_on date;
  v_active_version text;
  v_expected_game text;
  v_existing_daily_id uuid;
  v_existing_game text;
begin
  select schedule.starts_on
  into v_source_starts_on
  from private.daily_challenge_schedule_versions schedule
  where schedule.version = v_source_version;

  if v_source_starts_on is null then
    raise exception 'source Daily Challenge schedule % is missing', v_source_version;
  end if;

  v_replacement_starts_on := greatest(v_target_day, v_source_starts_on);
  v_expected_game := private.daily_challenge_expected_game(v_source_version, v_target_day);
  if v_expected_game is distinct from 'blind_rank_5' then
    raise exception 'expected Blind Rank Five on %, found %',
      v_target_day,
      coalesce(v_expected_game, '<none>');
  end if;

  select daily.id, daily.game_type
  into v_existing_daily_id, v_existing_game
  from private.daily_challenges daily
  where daily.schedule_version = v_source_version
    and daily.central_day = v_target_day;

  -- Production has this rotation active before the target day. Only that path may remove the
  -- already-published day, and it must still be the intended same-day Blind Rank Five reroll.
  if v_source_starts_on <= v_target_day then
    if v_central_today <> v_target_day then
      raise exception 'August 17 Daily Challenge replacement is only safe on %, current Central day is %',
        v_target_day,
        v_central_today;
    end if;

    v_active_version := private.daily_challenge_schedule_for_day(v_target_day);
    if v_active_version is distinct from v_source_version then
      raise exception 'expected active Daily Challenge schedule % for %, found %',
        v_source_version,
        v_target_day,
        coalesce(v_active_version, '<none>');
    end if;

    if v_existing_daily_id is null then
      raise exception 'expected an already-published Daily Challenge for % under %',
        v_target_day,
        v_source_version;
    end if;

    if v_existing_game is distinct from 'blind_rank_5' then
      raise exception 'refusing to replace unexpected published Daily Challenge game % on %',
        v_existing_game,
        v_target_day;
    end if;
  elsif v_existing_daily_id is not null then
    raise exception 'fresh database replay unexpectedly contains historical Daily Challenge % for %',
      v_existing_daily_id,
      v_target_day;
  end if;

  if exists (
    select 1
    from private.daily_challenge_schedule_versions schedule
    where schedule.version = v_replacement_version
  ) then
    raise exception 'replacement Daily Challenge schedule % already exists', v_replacement_version;
  end if;

  insert into private.daily_challenge_schedule_versions (
    version,
    time_zone,
    anchor_day,
    starts_on,
    game_cycle
  )
  select
    v_replacement_version,
    source.time_zone,
    source.anchor_day,
    v_replacement_starts_on,
    source.game_cycle
  from private.daily_challenge_schedule_versions source
  where source.version = v_source_version;

  if not found then
    raise exception 'source Daily Challenge schedule % disappeared during replacement', v_source_version;
  end if;

  if v_source_starts_on <= v_target_day then
    -- The old official row is immutable by design. This narrowly scoped release migration is
    -- the sole owner of the one-day replacement, so disable only the two mutation guards that
    -- block removal and restore them inside the same transaction.
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
