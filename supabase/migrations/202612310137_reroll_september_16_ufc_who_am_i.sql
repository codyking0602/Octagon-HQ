-- Same-day UFC Daily replacement for the September 16, 2026 Who Am I factual defect.
-- The published Charles Oliveira board counted catchweight labels as UFC divisions.
-- Preserve the UFC rotation while advancing the immutable schedule identity so the
-- corrected Who Am I runtime materializes a fresh board for everyone.
do $$
declare
  v_target_day constant date := date '2026-09-16';
  v_source_version constant text := 'play-rotation-v7';
  v_replacement_version constant text := 'play-rotation-v8';
  v_central_today date := private.daily_challenge_central_day(now());
  v_existing_daily_id uuid;
  v_existing_game text;
  v_existing_subject text;
begin
  if not exists (
    select 1
    from private.daily_challenge_schedule_versions schedule
    where schedule.version = v_source_version
      and schedule.sport = 'ufc'
  ) then
    raise exception 'source UFC Daily schedule % is missing', v_source_version;
  end if;

  if private.daily_challenge_expected_game(v_source_version, v_target_day) is distinct from 'who_am_i' then
    raise exception 'expected source UFC Daily to be Who Am I on %', v_target_day;
  end if;

  select
    daily.id,
    daily.game_type,
    setup.private_setup_evidence->>'hidden_subject_id'
  into
    v_existing_daily_id,
    v_existing_game,
    v_existing_subject
  from private.daily_challenges daily
  join private.daily_challenge_setups setup on setup.id = daily.setup_id
  where daily.schedule_version = v_source_version
    and daily.central_day = v_target_day;

  if v_existing_daily_id is not null then
    if v_central_today <> v_target_day then
      raise exception 'September 16 UFC Daily replacement is only safe on %, current Central day is %',
        v_target_day,
        v_central_today;
    end if;

    if v_existing_game is distinct from 'who_am_i' then
      raise exception 'refusing to replace unexpected published UFC Daily game % on %',
        v_existing_game,
        v_target_day;
    end if;

    if v_existing_subject is distinct from 'ufc:charles-oliveira' then
      raise exception 'refusing to replace unexpected UFC Who Am I subject % on %',
        coalesce(v_existing_subject, '<none>'),
        v_target_day;
    end if;
  end if;

  if exists (
    select 1
    from private.daily_challenge_schedule_versions schedule
    where schedule.version = v_replacement_version
  ) then
    raise exception 'replacement UFC Daily schedule % already exists', v_replacement_version;
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
    and source.sport = 'ufc';

  if not found then
    raise exception 'source UFC Daily schedule % disappeared during replacement', v_source_version;
  end if;

  if private.daily_challenge_schedule_for_day(v_target_day, 'ufc') is distinct from v_replacement_version
    or private.daily_challenge_expected_game(v_replacement_version, v_target_day) is distinct from 'who_am_i' then
    raise exception 'replacement UFC Daily schedule did not preserve Who Am I on %', v_target_day;
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
