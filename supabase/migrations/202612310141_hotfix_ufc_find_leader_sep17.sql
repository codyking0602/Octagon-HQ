-- Emergency UFC Daily hotfix for September 17, 2026.
-- Replace the confusing/leaky "UFC divisions with a win" Find the Leader board with
-- an already-authoritative UFC decision-wins board, while preserving the Daily game type.
--
-- Production had exactly two player attempts when this hotfix was prepared. The replacement
-- deliberately receives a new Daily Challenge id so those affected players can replay cleanly.
do $$
declare
  v_target_day constant date := date '2026-09-17';
  v_bad_setup_key constant text := 'find-leader-daily-v2:2026-09-17:divisions-with-ufc-win';
  v_source_setup_key constant text := 'find-leader-v2-20260724:2026-08-08:decision-wins-all-time';
  v_replacement_setup_key constant text := 'find-leader-daily-v2:2026-09-17:decision-wins-hotfix';
  v_central_today date := private.daily_challenge_central_day(now());
  v_existing_daily_id uuid;
  v_existing_setup_id uuid;
  v_schedule_version text;
  v_content_version text;
  v_scoring_version text;
  v_attempt_count integer;
  v_player_count integer;
  v_source_setup_id uuid;
  v_replacement_setup_id uuid;
  v_replacement_daily_id uuid;
begin
  select daily.id,
         daily.setup_id,
         daily.schedule_version,
         daily.content_version,
         daily.scoring_version
  into v_existing_daily_id,
       v_existing_setup_id,
       v_schedule_version,
       v_content_version,
       v_scoring_version
  from private.daily_challenges daily
  join private.daily_challenge_setups setup
    on setup.id = daily.setup_id
  where daily.central_day = v_target_day
    and daily.game_type = 'find_leader'
    and setup.setup_key = v_bad_setup_key;

  -- Fresh database replays do not contain the already-materialized production board.
  if v_existing_daily_id is null then
    return;
  end if;

  if v_central_today <> v_target_day then
    raise exception 'September 17 UFC Find the Leader hotfix is only safe on %, current Central day is %',
      v_target_day,
      v_central_today;
  end if;

  if v_content_version is distinct from 'find-leader-daily-v2'
      or v_scoring_version is distinct from 'play-official-score-v1' then
    raise exception 'refusing UFC Find the Leader hotfix because the published runtime versions changed';
  end if;

  select count(*)::integer,
         count(distinct attempt.profile_id)::integer
  into v_attempt_count,
       v_player_count
  from private.daily_challenge_attempts attempt
  where attempt.daily_challenge_id = v_existing_daily_id;

  -- Cody and Shane were the only two players on the defective board when this was prepared.
  -- Refuse to erase additional players if traffic reaches the old board before deployment.
  if v_attempt_count > 2 or v_player_count > 2 then
    raise exception 'refusing UFC Find the Leader hotfix because % attempts across % players now exist',
      v_attempt_count,
      v_player_count;
  end if;

  select setup.id
  into v_source_setup_id
  from private.daily_challenge_setups setup
  where setup.game_type = 'find_leader'
    and setup.setup_key = v_source_setup_key
    and setup.public_setup ->> 'question' = 'Who leads this group in UFC decision wins?'
    and setup.reveal_setup ->> 'leader_id' = 'alexander-volkanovski';

  if v_source_setup_id is null then
    raise exception 'authoritative UFC decision-wins source setup is missing or changed';
  end if;

  if exists (
    select 1
    from private.daily_challenge_setups setup
    where setup.game_type = 'find_leader'
      and setup.setup_key = v_replacement_setup_key
      and setup.content_version = v_content_version
      and setup.scoring_version = v_scoring_version
  ) then
    raise exception 'replacement UFC Find the Leader setup already exists';
  end if;

  insert into private.daily_challenge_setups (
    game_type,
    setup_key,
    content_version,
    scoring_version,
    public_setup,
    reveal_setup,
    private_setup_evidence,
    private_grading_evidence
  )
  select
    'find_leader',
    v_replacement_setup_key,
    v_content_version,
    v_scoring_version,
    source.public_setup,
    source.reveal_setup,
    source.private_setup_evidence,
    source.private_grading_evidence
  from private.daily_challenge_setups source
  where source.id = v_source_setup_id
  returning id into v_replacement_setup_id;

  if v_replacement_setup_id is null then
    raise exception 'failed to create replacement UFC Find the Leader setup';
  end if;

  if (
    select setup.public_setup ->> 'question'
    from private.daily_challenge_setups setup
    where setup.id = v_replacement_setup_id
  ) is distinct from 'Who leads this group in UFC decision wins?' then
    raise exception 'replacement UFC Find the Leader question is not the intended decision-wins prompt';
  end if;

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
    and daily.setup_id = v_existing_setup_id
    and daily.central_day = v_target_day;

  if not found then
    raise exception 'defective September 17 UFC Daily row disappeared during hotfix';
  end if;

  insert into private.daily_challenges (
    central_day,
    schedule_version,
    game_type,
    setup_id,
    content_version,
    scoring_version,
    fallback_reason,
    published_at
  )
  values (
    v_target_day,
    v_schedule_version,
    'find_leader',
    v_replacement_setup_id,
    v_content_version,
    v_scoring_version,
    null,
    now()
  )
  returning id into v_replacement_daily_id;

  alter table private.daily_challenge_attempts
    enable trigger daily_challenge_attempts_immutable;
  alter table private.daily_challenges
    enable trigger daily_challenges_immutable;

  if v_replacement_daily_id is null
      or v_replacement_daily_id = v_existing_daily_id then
    raise exception 'replacement UFC Daily did not receive a fresh challenge identity';
  end if;

  if exists (
    select 1
    from private.daily_challenge_attempts attempt
    where attempt.daily_challenge_id = v_existing_daily_id
  ) or exists (
    select 1
    from private.daily_challenge_progress progress
    where progress.daily_challenge_id = v_existing_daily_id
  ) then
    raise exception 'defective UFC Daily attempts/progress survived the hotfix';
  end if;

  if not exists (
    select 1
    from private.daily_challenges daily
    join private.daily_challenge_setups setup
      on setup.id = daily.setup_id
    where daily.id = v_replacement_daily_id
      and daily.central_day = v_target_day
      and daily.game_type = 'find_leader'
      and setup.setup_key = v_replacement_setup_key
      and setup.public_setup ->> 'question' = 'Who leads this group in UFC decision wins?'
      and setup.reveal_setup ->> 'leader_id' = 'alexander-volkanovski'
  ) then
    raise exception 'replacement September 17 UFC Daily failed final verification';
  end if;
end
$$;
