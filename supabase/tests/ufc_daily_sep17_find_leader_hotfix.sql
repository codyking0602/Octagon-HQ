begin;

do $$
declare
  v_daily_id uuid;
begin
  if private.daily_challenge_schedule_for_day(date '2026-09-17', 'ufc') is distinct from 'play-rotation-v7'
    or private.daily_challenge_expected_game('play-rotation-v7', date '2026-09-17') is distinct from 'find_leader' then
    raise exception 'September 17 UFC Daily rotation must remain Find the Leader';
  end if;

  select daily.id
  into v_daily_id
  from private.daily_challenges daily
  join private.daily_challenge_setups setup on setup.id = daily.setup_id
  where daily.central_day = date '2026-09-17'
    and daily.schedule_version = 'play-rotation-v7'
    and daily.game_type = 'find_leader'
    and daily.fallback_reason is null
    and setup.setup_key = 'find-leader-daily-v2:2026-09-17:hotfix-submission-wins-2013-2019'
    and setup.public_setup->>'question' = 'Who leads this group in UFC submission wins from 2013 through 2019?'
    and setup.public_setup->>'stat_label' = 'UFC submission wins from 2013 through 2019'
    and setup.reveal_setup->>'leader_id' = 'tony-ferguson'
    and setup.reveal_setup->>'leader_value' = '6';

  if v_daily_id is null then
    raise exception 'September 17 UFC Daily must publish the replacement submission-wins board';
  end if;

  if exists (
    select 1
    from private.daily_challenge_attempts attempt
    where attempt.daily_challenge_id = v_daily_id
  ) then
    raise exception 'September 17 UFC Daily hotfix must reset stale attempts';
  end if;

  if exists (
    select 1
    from private.daily_challenge_progress progress
    where progress.daily_challenge_id = v_daily_id
  ) then
    raise exception 'September 17 UFC Daily hotfix must reset stale progress';
  end if;
end
$$;

rollback;
