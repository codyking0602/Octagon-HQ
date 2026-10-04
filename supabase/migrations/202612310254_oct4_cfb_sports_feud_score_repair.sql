-- Correct Cody's October 4, 2026 CFB Sports Feud run after the authored
-- coach-board rerank and natural Texas-Oklahoma rivalry shorthand repair.
-- The original submission evidence is preserved. No other completed result is changed.

do $oct4_cody$
declare
  v_profile uuid;
  v_daily uuid;
  v_attempt uuid;
  v_score integer;
  v_state jsonb;
  v_first_board jsonb;
  v_second_board jsonb;
  v_fast_results jsonb;
begin
  select profile.id
  into v_profile
  from public.profiles profile
  where profile.normalized_name = 'CODY'
  limit 1;

  if v_profile is null then
    return;
  end if;

  select daily.id
  into v_daily
  from private.daily_challenges daily
  join private.daily_challenge_schedule_versions schedule
    on schedule.version = daily.schedule_version
  where daily.central_day = date '2026-10-04'
    and schedule.sport = 'football'
    and daily.game_type = 'sports_feud'
  limit 1;

  if v_daily is null then
    return;
  end if;

  select attempt.id, attempt.normalized_score
  into v_attempt, v_score
  from private.daily_challenge_attempts attempt
  where attempt.daily_challenge_id = v_daily
    and attempt.profile_id = v_profile
    and attempt.attempt_kind = 'official_first'
  limit 1;

  if v_attempt is null then
    return;
  end if;

  if v_score not in (68, 76) then
    raise exception 'Oct. 4 Cody Sports Feud score changed before correction: %', v_score;
  end if;

  select progress.public_state
  into v_state
  from private.daily_challenge_progress progress
  where progress.daily_challenge_id = v_daily
    and progress.profile_id = v_profile;

  if v_state is null then
    raise exception 'Oct. 4 Cody Sports Feud progress is missing';
  end if;

  if not exists (
    select 1
    from jsonb_array_elements(coalesce(v_state->'fast_money'->'results', '[]'::jsonb)) result
    where result->>'question_id' = 'cfb-fast3-04-3'
      and lower(result->>'submitted_answer') = 'ou-texas'
      and coalesce((result->>'points')::integer, 0) in (0, 6)
  ) then
    raise exception 'Oct. 4 Cody Sports Feud rivalry correction evidence changed';
  end if;

  if v_score = 68 then
    execute 'alter table private.daily_challenge_attempts disable trigger daily_challenge_attempts_immutable';
    begin
      update private.daily_challenge_attempts
      set native_score = 76,
          normalized_score = 76,
          public_result = public_result
            || jsonb_build_object(
              'score', 76,
              'main_points', 49,
              'fast_money_points', 27,
              'score_correction', '2026-10-04-cfb-feud-board-and-alias-repair'
            ),
          grading_evidence_snapshot = grading_evidence_snapshot
            || jsonb_build_object(
              'score_correction',
              jsonb_build_object(
                'reason', 'reranked coach board plus natural OU-Texas rivalry alias',
                'original_score', 68,
                'corrected_score', 76,
                'corrected_main_points', 49,
                'corrected_fast_money_points', 27,
                'coach_board', jsonb_build_array(
                  'Mike Leach 10',
                  'Steve Spurrier 8',
                  'Chip Kelly 7',
                  'Urban Meyer 5',
                  'Art Briles 5',
                  'Lincoln Riley 4',
                  'Gus Malzahn 4',
                  'Lane Kiffin 3'
                ),
                'ou_texas_points', 6
              )
            )
      where id = v_attempt
        and normalized_score = 68;
    exception when others then
      execute 'alter table private.daily_challenge_attempts enable trigger daily_challenge_attempts_immutable';
      raise;
    end;
    execute 'alter table private.daily_challenge_attempts enable trigger daily_challenge_attempts_immutable';
  end if;

  v_first_board := (v_state->'main_boards'->0)
    || jsonb_build_object(
      'strikes', 0,
      'slots', jsonb_build_array(
        jsonb_build_object(
          'found', true,
          'entity', jsonb_build_object('id', 'cfb-main-10-4:a3', 'display_name', 'Chip Kelly'),
          'points', 7,
          'revealed', true,
          'slot_index', 0
        ),
        jsonb_build_object(
          'found', true,
          'entity', jsonb_build_object('id', 'cfb-main-10-4:a6', 'display_name', 'Lincoln Riley'),
          'points', 4,
          'revealed', true,
          'slot_index', 1
        ),
        jsonb_build_object(
          'found', true,
          'entity', jsonb_build_object('id', 'cfb-main-10-4:a5', 'display_name', 'Art Briles'),
          'points', 5,
          'revealed', true,
          'slot_index', 2
        ),
        jsonb_build_object(
          'found', true,
          'entity', jsonb_build_object('id', 'cfb-main-10-4:a8', 'display_name', 'Lane Kiffin'),
          'points', 3,
          'revealed', true,
          'slot_index', 3
        )
      ),
      'answer_reveal', jsonb_build_array(
        jsonb_build_object('found', false, 'entity', jsonb_build_object('id', 'cfb-main-10-4:a1', 'display_name', 'Mike Leach'), 'points', 10),
        jsonb_build_object('found', false, 'entity', jsonb_build_object('id', 'cfb-main-10-4:a2', 'display_name', 'Steve Spurrier'), 'points', 8),
        jsonb_build_object('found', true, 'entity', jsonb_build_object('id', 'cfb-main-10-4:a3', 'display_name', 'Chip Kelly'), 'points', 7),
        jsonb_build_object('found', false, 'entity', jsonb_build_object('id', 'cfb-main-10-4:a4', 'display_name', 'Urban Meyer'), 'points', 5),
        jsonb_build_object('found', true, 'entity', jsonb_build_object('id', 'cfb-main-10-4:a5', 'display_name', 'Art Briles'), 'points', 5),
        jsonb_build_object('found', true, 'entity', jsonb_build_object('id', 'cfb-main-10-4:a6', 'display_name', 'Lincoln Riley'), 'points', 4),
        jsonb_build_object('found', false, 'entity', jsonb_build_object('id', 'cfb-main-10-4:a7', 'display_name', 'Gus Malzahn'), 'points', 4),
        jsonb_build_object('found', true, 'entity', jsonb_build_object('id', 'cfb-main-10-4:a8', 'display_name', 'Lane Kiffin'), 'points', 3)
      )
    );

  v_second_board := v_state->'main_boards'->1;

  select jsonb_agg(
    case
      when result.value->>'question_id' = 'cfb-fast3-04-3'
        and lower(result.value->>'submitted_answer') = 'ou-texas'
        then result.value || jsonb_build_object(
          'points', 6,
          'counted', true,
          'board_rank', 3,
          'accepted_as', 'Texas-Oklahoma'
        )
      else result.value
    end
    order by result.ordinality
  )
  into v_fast_results
  from jsonb_array_elements(coalesce(v_state->'fast_money'->'results', '[]'::jsonb))
    with ordinality as result(value, ordinality);

  update private.daily_challenge_progress
  set public_state =
    v_state
    || jsonb_build_object(
      'hq_score', 76,
      'raw_points', 76,
      'main_points', 49,
      'score_correction', '2026-10-04-cfb-feud-board-and-alias-repair',
      'main_boards', jsonb_build_array(v_first_board, v_second_board),
      'fast_money',
        (v_state->'fast_money')
        || jsonb_build_object(
          'points', 27,
          'results', coalesce(v_fast_results, '[]'::jsonb)
        )
    )
  where daily_challenge_id = v_daily
    and profile_id = v_profile;
end
$oct4_cody$;
