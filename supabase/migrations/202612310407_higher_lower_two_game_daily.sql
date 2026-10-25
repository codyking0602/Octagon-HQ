-- Future-only Official Daily Higher or Lower two-game scoring and gated drilldowns.
-- This changes no existing challenge, progress, result or Daily schedule.
-- Reapply the current canonical scorer/leaderboard functions without changing
-- their unrelated modes; the historical higher_lower v1 single board is retained.
CREATE OR REPLACE FUNCTION private.grade_daily_challenge(p_game_type text, p_scoring_version text, p_submission jsonb, p_grading_evidence jsonb)
 RETURNS TABLE(native_score integer, normalized_score integer, public_result jsonb, grading_snapshot jsonb)
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO ''
AS $function$
declare
  v_format constant text := 'daily-two-game-average-v1';
  v_scoring constant text := 'daily-two-game-average-score-v1';
  v_submissions jsonb;
  v_rounds jsonb;
  v_round_one record;
  v_round_two record;
  v_average integer;
begin
  if p_game_type = 'higher_lower' and p_scoring_version = 'play-official-score-v1' then
    return query select * from private.grade_nba_higher_lower_daily(p_submission,p_grading_evidence);
    return;
  end if;
  if p_scoring_version = v_scoring then
    if p_game_type not in ('find_leader', 'wavelength', 'hit_the_number', 'higher_lower')
      or jsonb_typeof(p_submission) <> 'object'
      or jsonb_typeof(p_grading_evidence) <> 'object'
      or p_grading_evidence->>'format_version' <> v_format then
      raise exception 'Two-game Daily grading evidence is invalid';
    end if;

    v_submissions := p_submission->'rounds';
    v_rounds := p_grading_evidence->'rounds';

    if jsonb_typeof(v_submissions) <> 'array'
      or jsonb_array_length(v_submissions) <> 2
      or jsonb_typeof(v_rounds) <> 'array'
      or jsonb_array_length(v_rounds) <> 2 then
      raise exception 'Two-game Daily requires exactly two completed games';
    end if;

    if p_game_type = 'higher_lower' then
      -- Reuse the existing exact-ID ten-answer grader for UFC, NBA and Football.
      -- Child score fields, public-state correctness and client-supplied
      -- normalized_score never authorize either the board or the average.
      if (v_rounds->0->>'scoring_version') is distinct from 'play-official-score-v1'
        or (v_rounds->1->>'scoring_version') is distinct from 'play-official-score-v1' then
        raise exception 'Higher or Lower Daily child scoring contract is invalid';
      end if;
      select * into v_round_one from private.grade_nba_higher_lower_daily(
        v_submissions->0, v_rounds->0->'private_grading_evidence'
      );
      select * into v_round_two from private.grade_nba_higher_lower_daily(
        v_submissions->1, v_rounds->1->'private_grading_evidence'
      );
    else
      select *
      into v_round_one
      from private.grade_daily_challenge_pre_two_game(
        p_game_type,
        nullif(v_rounds->0->>'scoring_version', ''),
        v_submissions->0,
        v_rounds->0->'private_grading_evidence'
      );
  
      select *
      into v_round_two
      from private.grade_daily_challenge_pre_two_game(
        p_game_type,
        nullif(v_rounds->1->>'scoring_version', ''),
        v_submissions->1,
        v_rounds->1->'private_grading_evidence'
      );
    end if;

    v_average := round(
      (v_round_one.normalized_score + v_round_two.normalized_score) / 2.0
    )::integer;

    native_score := v_round_two.native_score;
    normalized_score := v_average;
    public_result := v_round_two.public_result || jsonb_build_object(
      'daily_series', jsonb_build_object(
        'format_version', v_format,
        'round_scores', jsonb_build_array(
          v_round_one.normalized_score,
          v_round_two.normalized_score
        ),
        'average_score', v_average,
        'rounds', jsonb_build_array(
          v_round_one.public_result || jsonb_build_object(
            'native_score', v_round_one.native_score,
            'normalized_score', v_round_one.normalized_score
          ),
          v_round_two.public_result || jsonb_build_object(
            'native_score', v_round_two.native_score,
            'normalized_score', v_round_two.normalized_score
          )
        )
      )
    );
    grading_snapshot := p_grading_evidence;
    return next;
    return;
  end if;

  -- Preserve the canonical grade_daily_challenge_pre_combo ownership through
  -- the complete pre-two-game wrapper, including Football Blind Resume and
  -- the Daily Rank/Keep combo.
  return query
  select *
  from private.grade_daily_challenge_pre_two_game(
    p_game_type,
    p_scoring_version,
    p_submission,
    p_grading_evidence
  );
end;
$function$
;

CREATE OR REPLACE FUNCTION public.get_daily_challenge_leaderboard(p_day date, p_schedule_version text, p_sport text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_profile uuid := auth.uid();
  v_entries jsonb;
  v_count integer;
begin
  if v_profile is null then
    raise exception 'sign in required';
  end if;
  if p_day is null or nullif(trim(p_schedule_version), '') is null then
    raise exception 'daily leaderboard identity required';
  end if;
  if p_sport is null or p_sport not in ('ufc', 'football', 'nba') then
    raise exception 'unsupported Daily Challenge sport %', coalesce(p_sport, '<null>');
  end if;
  if not exists (
    select 1
    from private.daily_challenge_schedule_versions schedule
    where schedule.version = p_schedule_version
      and schedule.sport = p_sport
  ) then
    raise exception 'daily leaderboard schedule does not belong to sport %', p_sport;
  end if;

  if not exists (
    select 1
    from private.daily_challenge_history history
    join private.daily_challenge_schedule_versions schedule
      on schedule.version = history.schedule_version
    where history.profile_id = v_profile
      and history.central_day = p_day
      and history.schedule_version = p_schedule_version
      and schedule.sport = p_sport
  ) then
    return jsonb_build_object(
      'unlocked', false,
      'player_count', 0,
      'entries', '[]'::jsonb
    );
  end if;

  with ranked as (
    select
      history.profile_id,
      profile.display_name,
      profile.initials,
      preference.avatar_photo_data,
      history.game_type,
      history.native_score,
      history.normalized_score,
      history.completed_at,
      history.public_result,
      coalesce(progress.revision, 0) as progress_revision,
      case
        when history.game_type = 'keep_4_cut_4'
          and progress.public_state ? 'keep_4_cut_4'
          and progress.public_state ? 'blind_rank_5'
        then coalesce(progress.public_state -> 'keep_4_cut_4', '{}'::jsonb)
          || jsonb_build_object(
            'combo_blind_rank_result',
            coalesce(progress.public_state -> 'blind_rank_5', '{}'::jsonb)
          )
        else coalesce(progress.public_state, '{}'::jsonb)
      end as public_state,
      case
        when history.game_type = 'millionaire' then
          jsonb_build_object(
            'action_history',
            coalesce((
              select jsonb_agg(
                jsonb_strip_nulls(jsonb_build_object(
                  'type', action ->> 'type',
                  'choice_id', action ->> 'choice_id',
                  'lifeline', action ->> 'lifeline',
                  'time_remaining_ms', action -> 'time_remaining_ms'
                ))
                order by ordinality
              )
              from jsonb_array_elements(
                case
                  when jsonb_typeof(progress.submission_state -> 'action_history') = 'array'
                    then progress.submission_state -> 'action_history'
                  else '[]'::jsonb
                end
              ) with ordinality as action_rows(action, ordinality)
            ), '[]'::jsonb)
          )
        when history.game_type = 'sports_feud' then
          jsonb_build_object(
            'fast_money_results',
            coalesce((
              select jsonb_agg(
                jsonb_strip_nulls(jsonb_build_object(
                  'question_id', result ->> 'questionId',
                  'submitted_text', result ->> 'submittedText'
                ))
                order by ordinality
              )
              from jsonb_array_elements(
                case
                  when jsonb_typeof(progress.submission_state #> '{engine_state,fastMoneyResults}') = 'array'
                    then progress.submission_state #> '{engine_state,fastMoneyResults}'
                  else '[]'::jsonb
                end
              ) with ordinality as result_rows(result, ordinality)
            ), '[]'::jsonb)
          )
        when history.game_type = 'find_leader'
          and progress.public_state ->> 'format_version' = 'daily-two-game-average-v1' then
          jsonb_build_object(
            'setup_rounds',
              case
                when jsonb_typeof(setup.public_setup -> 'rounds') = 'array'
                  then setup.public_setup -> 'rounds'
                else '[]'::jsonb
              end,
            'reveal_rounds',
              case
                when jsonb_typeof(setup.reveal_setup -> 'rounds') = 'array'
                  then setup.reveal_setup -> 'rounds'
                else '[]'::jsonb
              end
          )
        when history.game_type = 'wavelength'
          and progress.public_state ->> 'format_version' = 'daily-two-game-average-v1' then
          jsonb_build_object(
            'rounds',
            coalesce((
              select jsonb_agg(
                jsonb_build_object(
                  'target',
                    case
                      when (setup.private_setup_evidence -> 'rounds' -> (ordinality - 1)::integer
                        -> 'private_setup_evidence' ->> 'target') ~ '^[0-9]+$'
                      then (setup.private_setup_evidence -> 'rounds' -> (ordinality - 1)::integer
                        -> 'private_setup_evidence' ->> 'target')::integer
                      else null
                    end,
                  'clue_ids',
                    case
                      when jsonb_typeof(round_row -> 'clue_ids') = 'array'
                        then round_row -> 'clue_ids'
                      else '[]'::jsonb
                    end
                )
                order by ordinality
              )
              from jsonb_array_elements(
                case
                  when jsonb_typeof(progress.submission_state -> 'rounds') = 'array'
                    then progress.submission_state -> 'rounds'
                  else '[]'::jsonb
                end
              ) with ordinality as wavelength_rows(round_row, ordinality)
            ), '[]'::jsonb)
          )
        when history.game_type = 'who_am_i' then
          jsonb_build_object(
            'rounds',
            coalesce((
              select jsonb_agg(
                jsonb_strip_nulls(jsonb_build_object(
                  'outcome', round_row ->> 'outcome',
                  'revealed_count', round_row -> 'revealed_count',
                  'natural_guesses', case
                    when jsonb_typeof(round_row -> 'natural_guesses') = 'array'
                      then round_row -> 'natural_guesses'
                    else '[]'::jsonb
                  end,
                  'recovery_choices', case
                    when jsonb_typeof(round_row -> 'recovery_choices') = 'array'
                      then round_row -> 'recovery_choices'
                    else '[]'::jsonb
                  end,
                  'recovery_guesses', case
                    when jsonb_typeof(round_row -> 'recovery_guesses') = 'array'
                      then round_row -> 'recovery_guesses'
                    else '[]'::jsonb
                  end
                ))
                order by ordinality
              )
              from jsonb_array_elements(
                case
                  when jsonb_typeof(progress.submission_state #> '{final_submission,rounds}') = 'array'
                    then progress.submission_state #> '{final_submission,rounds}'
                  when jsonb_typeof(progress.submission_state -> 'final_submission') = 'object'
                    then jsonb_build_array(progress.submission_state -> 'final_submission')
                  else '[]'::jsonb
                end
              ) with ordinality as who_rows(round_row, ordinality)
            ), '[]'::jsonb)
          )
        when history.game_type = 'bar_trivia' then
          jsonb_build_object(
            'answers',
            coalesce((
              select jsonb_agg(
                jsonb_strip_nulls(jsonb_build_object(
                  'question_id', answer ->> 'questionId',
                  'choice', answer ->> 'choice',
                  'correct', answer -> 'correct',
                  'points', answer -> 'points',
                  'raw_points', answer -> 'rawPoints',
                  'base_points', answer -> 'basePoints',
                  'double_round_bonus', answer -> 'doubleRoundBonus',
                  'streak_bonus', answer -> 'streakBonus',
                  'wager_delta', answer -> 'wagerDelta',
                  'round_multiplier', answer -> 'roundMultiplier',
                  'streak_multiplier', answer -> 'streakMultiplier'
                ))
                order by ordinality
              )
              from jsonb_array_elements(
                case
                  when jsonb_typeof(progress.public_state -> 'answers') = 'array'
                    then progress.public_state -> 'answers'
                  else '[]'::jsonb
                end
              ) with ordinality as answer_rows(answer, ordinality)
            ), '[]'::jsonb),
            'double_round', progress.public_state ->> 'double_round',
            'wager', progress.public_state -> 'wager'
          )
        when history.game_type = 'higher_lower'
          and history.scoring_version = 'daily-two-game-average-score-v1'
          and progress.public_state ->> 'format_version' = 'daily-two-game-average-v1' then
          jsonb_build_object(
            'setup_rounds', coalesce(setup.public_setup->'rounds', '[]'::jsonb),
            'reveal_rounds', coalesce(setup.reveal_setup->'rounds', '[]'::jsonb)
          )
        when history.game_type = 'higher_lower' then
          jsonb_build_object(
            'answers', coalesce(progress.submission_state->'answers','[]'::jsonb),
            'reveal_questions', coalesce(setup.reveal_setup->'questions','[]'::jsonb)
          )
        when history.game_type = 'average_fan' then
          jsonb_build_object(
            'fan', progress.public_state ->> 'fan',
            'resolved', coalesce(progress.public_state -> 'resolved', '[]'::jsonb),
            'board_score', progress.public_state -> 'board_score',
            'final_subject', progress.public_state ->> 'final_subject',
            'final_outcome', progress.public_state ->> 'final_outcome',
            'final_score', progress.public_state -> 'final_score',
            'final_question', progress.public_state -> 'final_question',
            'final_player_answer', progress.public_state ->> 'final_player_answer',
            'final_correct_answer', progress.public_state ->> 'final_correct_answer',
            'final_explanation', progress.public_state ->> 'final_explanation'
          )
        else '{}'::jsonb
      end as result_detail,
      rank() over (
        order by
          history.normalized_score desc,
          case when history.game_type = 'hit_the_number'
            then private.daily_challenge_hit_number_distance(
              history.game_type,
              history.public_result
            )
            else null
          end asc nulls last
      )::integer as score_rank
    from private.daily_challenge_history history
    join private.daily_challenge_schedule_versions schedule
      on schedule.version = history.schedule_version
    join private.daily_challenges daily
      on daily.id = history.daily_challenge_id
    join private.daily_challenge_setups setup
      on setup.id = daily.setup_id
    join public.profiles profile
      on profile.id = history.profile_id
    left join public.profile_preferences preference
      on preference.profile_id = history.profile_id
    left join private.daily_challenge_progress progress
      on progress.daily_challenge_id = history.daily_challenge_id
     and progress.profile_id = history.profile_id
    where history.central_day = p_day
      and history.schedule_version = p_schedule_version
      and schedule.sport = p_sport
  )
  select
    count(*)::integer,
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'rank', ranked.score_rank,
          'profile_id', ranked.profile_id,
          'display_name', ranked.display_name,
          'initials', ranked.initials,
          'avatar_photo_data', ranked.avatar_photo_data,
          'game_type', ranked.game_type,
          'native_score', ranked.native_score,
          'normalized_score', ranked.normalized_score,
          'completed_at', ranked.completed_at,
          'public_result', ranked.public_result,
          'progress_revision', ranked.progress_revision,
          'public_state', ranked.public_state,
          'result_detail', ranked.result_detail,
          'official_score', case
            when ranked.game_type = 'find_leader' then ranked.native_score
            else ranked.normalized_score
          end,
          'is_current_user', ranked.profile_id = v_profile
        )
        order by ranked.score_rank, ranked.display_name
      ),
      '[]'::jsonb
    )
  into v_count, v_entries
  from ranked;

  return jsonb_build_object(
    'unlocked', true,
    'player_count', coalesce(v_count, 0),
    'entries', coalesce(v_entries, '[]'::jsonb)
  );
end;
$function$
;
