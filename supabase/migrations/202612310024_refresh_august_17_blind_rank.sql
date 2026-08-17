-- One-time Today’s Challenge identity roll for the August 17 Blind Rank refresh.
-- Published daily/setup rows remain immutable. A new schedule identity makes the old
-- board unreachable through the canonical current-day resolver, then the existing
-- daily runtime rematerializes the day with the currently deployed Blind Rank engine.
do $$
declare
  v_previous private.daily_challenge_schedule_versions;
  v_refresh_day constant date := date '2026-08-17';
  v_starts_on date;
  v_old_daily private.daily_challenges;
begin
  select schedule.*
  into v_previous
  from private.daily_challenge_schedule_versions schedule
  where schedule.version = 'play-rotation-v1';

  if v_previous.version is null then
    raise exception 'play-rotation-v1 must exist before the August 17 refresh';
  end if;

  if private.daily_challenge_expected_game(v_previous.version, v_refresh_day) <> 'blind_rank_5' then
    raise exception 'August 17 is no longer a Blind Rank day under play-rotation-v1';
  end if;

  select daily.*
  into v_old_daily
  from private.daily_challenges daily
  where daily.schedule_version = v_previous.version
    and daily.central_day = v_refresh_day;

  if v_old_daily.id is not null then
    if v_old_daily.game_type <> 'blind_rank_5' then
      raise exception 'the published August 17 challenge is not Blind Rank';
    end if;

    if exists (
      select 1
      from private.daily_challenge_attempts attempt
      where attempt.daily_challenge_id = v_old_daily.id
        and attempt.attempt_kind = 'official_first'
    ) then
      raise exception 'cannot refresh August 17 after an official attempt has completed';
    end if;
  end if;

  -- On production v1 already predates August 17, so v2 starts on the refresh day.
  -- On a fresh database installed later, never let the newer schedule begin before v1.
  v_starts_on := greatest(v_previous.starts_on, v_refresh_day);

  insert into private.daily_challenge_schedule_versions (
    version,
    time_zone,
    anchor_day,
    starts_on,
    game_cycle
  )
  values (
    'play-rotation-v2',
    v_previous.time_zone,
    v_previous.anchor_day,
    v_starts_on,
    v_previous.game_cycle
  )
  on conflict (version) do nothing;

  if private.daily_challenge_expected_game('play-rotation-v2', v_refresh_day) <> 'blind_rank_5' then
    raise exception 'play-rotation-v2 changed the August 17 game assignment';
  end if;

  if private.daily_challenge_schedule_for_day(v_starts_on) <> 'play-rotation-v2' then
    raise exception 'play-rotation-v2 did not become the canonical schedule at its start';
  end if;
end
$$;

-- Queue the existing canonical scheduled materializer after the migration commits.
-- Fresh/local databases do not carry the production scheduler token, so they skip this.
do $$
declare
  v_scheduler_token text;
begin
  if private.daily_challenge_central_day(now()) <> date '2026-08-17'
    or private.daily_challenge_schedule_for_day(date '2026-08-17') <> 'play-rotation-v2' then
    return;
  end if;

  select secret.decrypted_secret
  into v_scheduler_token
  from vault.decrypted_secrets secret
  where secret.name = 'octagon_pick_monitoring_scheduler_token'
  limit 1;

  if nullif(v_scheduler_token, '') is null then
    return;
  end if;

  perform net.http_post(
    url := 'https://rvbspcjvebgwqzssayts.supabase.co/functions/v1/daily-challenge-runtime',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-octagon-scheduler-token', v_scheduler_token
    ),
    body := '{"mode":"scheduled"}'::jsonb,
    timeout_milliseconds := 60000
  );
end
$$;
