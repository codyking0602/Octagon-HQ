-- Emergency UFC Daily content hotfix for September 17, 2026.
-- Replace the confusing/leaky "UFC divisions with a win" Find the Leader board with a
-- previously validated closed-window submission-wins board. Keep the game type and
-- rotation unchanged, and reset only the small set of players who touched the bad board.
do $$
declare
  v_target_day constant date := date '2026-09-17';
  v_schedule_version constant text := 'play-rotation-v7';
  v_bad_setup_key constant text := 'find-leader-daily-v2:2026-09-17:divisions-with-ufc-win';
  v_replacement_setup_key constant text := 'find-leader-daily-v2:2026-09-17:hotfix-submission-wins-2013-2019';
  v_daily_id uuid;
  v_existing_game text;
  v_existing_setup_key text;
  v_touched_profiles integer := 0;
  v_replacement_setup_id uuid;
begin
  if private.daily_challenge_schedule_for_day(v_target_day, 'ufc') is distinct from v_schedule_version
    or private.daily_challenge_expected_game(v_schedule_version, v_target_day) is distinct from 'find_leader' then
    raise exception 'UFC Daily September 17 schedule changed unexpectedly';
  end if;

  select daily.id, daily.game_type, setup.setup_key
  into v_daily_id, v_existing_game, v_existing_setup_key
  from private.daily_challenges daily
  join private.daily_challenge_setups setup on setup.id = daily.setup_id
  where daily.schedule_version = v_schedule_version
    and daily.central_day = v_target_day;

  if v_daily_id is not null then
    if v_existing_game is distinct from 'find_leader'
      or v_existing_setup_key is distinct from v_bad_setup_key then
      raise exception 'refusing UFC Daily hotfix because September 17 is already published as % / %',
        v_existing_game,
        v_existing_setup_key;
    end if;

    select count(*)::integer
    into v_touched_profiles
    from (
      select attempt.profile_id
      from private.daily_challenge_attempts attempt
      where attempt.daily_challenge_id = v_daily_id
      union
      select progress.profile_id
      from private.daily_challenge_progress progress
      where progress.daily_challenge_id = v_daily_id
    ) touched;

    -- Cody and Shane were the only two players on the bad board when the hotfix was prepared.
    -- Refuse to wipe a third player's Daily result if traffic expands before deployment.
    if v_touched_profiles > 2 then
      raise exception 'refusing UFC Daily hotfix because % distinct profiles now touched the bad board',
        v_touched_profiles;
    end if;
  end if;

  if exists (
    select 1
    from private.daily_challenge_setups setup
    where setup.game_type = 'find_leader'
      and setup.setup_key = v_replacement_setup_key
      and setup.content_version = 'find-leader-daily-v2'
      and setup.scoring_version = 'play-official-score-v1'
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
  ) values (
    'find_leader',
    v_replacement_setup_key,
    'find-leader-daily-v2',
    'play-official-score-v1',
    $json${
      "family": "era",
      "context": "Highest UFC submission wins from 2013 through 2019 among the ten fighters shown. The overall UFC record holder does not have to appear.",
      "question": "Who leads this group in UFC submission wins from 2013 through 2019?",
      "candidates": [
        {"id":"amanda-nunes","name":"Amanda Nunes","division":"BW / FW","thumb_url":"/assets/fighters/amanda-nunes-thumb.webp"},
        {"id":"carla-esparza","name":"Carla Esparza","division":"SW","thumb_url":"/assets/fighters/carla-esparza-thumb.webp"},
        {"id":"daniel-cormier","name":"Daniel Cormier","division":"LHW / HW","thumb_url":"/assets/fighters/daniel-cormier-thumb.webp"},
        {"id":"max-holloway","name":"Max Holloway","division":"FW / LW","thumb_url":"/assets/fighters/max-holloway-thumb.webp"},
        {"id":"demetrious-johnson","name":"Demetrious Johnson","division":"FLW","thumb_url":"/assets/fighters/demetrious-johnson-thumb.webp"},
        {"id":"benson-henderson","name":"Benson Henderson","division":"Lightweight / Welterweight","thumb_url":"/assets/fighters/benson-henderson-thumb.webp"},
        {"id":"rose-namajunas","name":"Rose Namajunas","division":"SW / FLW","thumb_url":"/assets/fighters/rose-namajunas-thumb.webp"},
        {"id":"tony-ferguson","name":"Tony Ferguson","division":"LW / WW","thumb_url":"/assets/fighters/tony-ferguson-thumb.webp"},
        {"id":"anthony-pettis","name":"Anthony Pettis","division":"LW / FW / WW","thumb_url":"/assets/fighters/anthony-pettis-thumb.webp"},
        {"id":"glover-teixeira","name":"Glover Teixeira","division":"Light Heavyweight","thumb_url":"/assets/fighters/glover-teixeira-thumb.webp"}
      ],
      "stat_label": "UFC submission wins from 2013 through 2019",
      "short_label": "SUBMISSIONS",
      "initial_state": {"complete":false,"eliminated_ids":[],"native_progress":0},
      "runtime_version": "official-daily-runtime-v1"
    }$json$::jsonb,
    $json${
      "leader_id": "tony-ferguson",
      "candidates": [
        {"id":"amanda-nunes","name":"Amanda Nunes","value":2,"division":"BW / FW","thumb_url":"/assets/fighters/amanda-nunes-thumb.webp"},
        {"id":"carla-esparza","name":"Carla Esparza","value":1,"division":"SW","thumb_url":"/assets/fighters/carla-esparza-thumb.webp"},
        {"id":"daniel-cormier","name":"Daniel Cormier","value":4,"division":"LHW / HW","thumb_url":"/assets/fighters/daniel-cormier-thumb.webp"},
        {"id":"max-holloway","name":"Max Holloway","value":2,"division":"FW / LW","thumb_url":"/assets/fighters/max-holloway-thumb.webp"},
        {"id":"demetrious-johnson","name":"Demetrious Johnson","value":5,"division":"FLW","thumb_url":"/assets/fighters/demetrious-johnson-thumb.webp"},
        {"id":"benson-henderson","name":"Benson Henderson","value":2,"division":"Lightweight / Welterweight","thumb_url":"/assets/fighters/benson-henderson-thumb.webp"},
        {"id":"rose-namajunas","name":"Rose Namajunas","value":3,"division":"SW / FLW","thumb_url":"/assets/fighters/rose-namajunas-thumb.webp"},
        {"id":"tony-ferguson","name":"Tony Ferguson","value":6,"division":"LW / WW","thumb_url":"/assets/fighters/tony-ferguson-thumb.webp"},
        {"id":"anthony-pettis","name":"Anthony Pettis","value":4,"division":"LW / FW / WW","thumb_url":"/assets/fighters/anthony-pettis-thumb.webp"},
        {"id":"glover-teixeira","name":"Glover Teixeira","value":4,"division":"Light Heavyweight","thumb_url":"/assets/fighters/glover-teixeira-thumb.webp"}
      ],
      "leader_value": 6
    }$json$::jsonb,
    '{"leader_id":"tony-ferguson","candidate_ids":["amanda-nunes","carla-esparza","daniel-cormier","max-holloway","demetrious-johnson","benson-henderson","rose-namajunas","tony-ferguson","anthony-pettis","glover-teixeira"]}'::jsonb,
    '{"leader_id":"tony-ferguson","candidate_ids":["amanda-nunes","carla-esparza","daniel-cormier","max-holloway","demetrious-johnson","benson-henderson","rose-namajunas","tony-ferguson","anthony-pettis","glover-teixeira"]}'::jsonb
  )
  returning id into v_replacement_setup_id;

  if v_daily_id is not null then
    alter table private.daily_challenge_attempts
      disable trigger daily_challenge_attempts_immutable;
    alter table private.daily_challenges
      disable trigger daily_challenges_immutable;

    delete from private.daily_challenge_progress progress
    where progress.daily_challenge_id = v_daily_id;

    delete from private.daily_challenge_attempts attempt
    where attempt.daily_challenge_id = v_daily_id;

    update private.daily_challenges daily
    set setup_id = v_replacement_setup_id,
        content_version = 'find-leader-daily-v2',
        scoring_version = 'play-official-score-v1',
        fallback_reason = null
    where daily.id = v_daily_id
      and daily.schedule_version = v_schedule_version
      and daily.central_day = v_target_day;

    if not found then
      raise exception 'September 17 UFC Daily disappeared during hotfix';
    end if;

    alter table private.daily_challenge_attempts
      enable trigger daily_challenge_attempts_immutable;
    alter table private.daily_challenges
      enable trigger daily_challenges_immutable;
  else
    insert into private.daily_challenges (
      central_day,
      schedule_version,
      game_type,
      setup_id,
      content_version,
      scoring_version,
      fallback_reason
    ) values (
      v_target_day,
      v_schedule_version,
      'find_leader',
      v_replacement_setup_id,
      'find-leader-daily-v2',
      'play-official-score-v1',
      null
    )
    returning id into v_daily_id;
  end if;

  if not exists (
    select 1
    from private.daily_challenges daily
    join private.daily_challenge_setups setup on setup.id = daily.setup_id
    where daily.id = v_daily_id
      and daily.central_day = v_target_day
      and daily.schedule_version = v_schedule_version
      and daily.game_type = 'find_leader'
      and daily.fallback_reason is null
      and setup.setup_key = v_replacement_setup_key
      and setup.public_setup->>'question' = 'Who leads this group in UFC submission wins from 2013 through 2019?'
      and setup.reveal_setup->>'leader_id' = 'tony-ferguson'
      and setup.reveal_setup->>'leader_value' = '6'
  ) then
    raise exception 'September 17 UFC Daily replacement verification failed';
  end if;
end
$$;
