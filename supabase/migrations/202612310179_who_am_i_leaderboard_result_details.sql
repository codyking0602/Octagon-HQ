-- Expose only the sanitized completed-game evidence needed by the Daily leaderboard
-- result viewer. The caller must still have completed the same Daily before the
-- leaderboard unlocks. Do not expose the full private submission_state.
create or replace function public.get_daily_challenge_leaderboard(
  p_day date,
  p_schedule_version text,
  p_sport text
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
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
  if p_sport is null or p_sport not in ('ufc', 'football') then
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
$$;

revoke all on function public.get_daily_challenge_leaderboard(date, text, text)
  from public, anon;
grant execute on function public.get_daily_challenge_leaderboard(date, text, text)
  to authenticated;
