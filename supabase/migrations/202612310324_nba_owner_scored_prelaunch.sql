-- NBA owner-scored prelaunch test: Oct 23–31, one different game each Central day.
-- A distinct sport/schedule namespace prevents all public NBA season/championship reads
-- from including rehearsal results. UFC and Football are untouched.

alter table private.daily_challenge_schedule_versions drop constraint daily_challenge_schedule_versions_sport_check;
alter table private.daily_challenge_schedule_versions add constraint daily_challenge_schedule_versions_sport_check
  check (sport in ('ufc','football','nba','nba_preview'));

insert into private.daily_challenge_schedule_versions(version,time_zone,anchor_day,starts_on,game_cycle,sport)
values ('nba-daily-owner-prelaunch-v1','America/Chicago',date '2026-10-23',date '2026-10-23',
  array['average_fan','sports_feud','millionaire','who_am_i','find_leader','wavelength','bar_trivia','hit_the_number','higher_lower']::text[],
  'nba_preview') on conflict (version) do nothing;

CREATE OR REPLACE FUNCTION private.daily_challenge_schedule_for_day(p_day date, p_sport text)
 RETURNS text
 LANGUAGE plpgsql
 STABLE
 SET search_path TO ''
AS $function$
begin
  if p_sport is null or p_sport not in ('ufc', 'football', 'nba', 'nba_preview') then
    raise exception 'unsupported Daily Challenge sport %', coalesce(p_sport, '<null>');
  end if;

  return (
    select schedule.version
    from private.daily_challenge_schedule_versions schedule
    where schedule.starts_on <= p_day
      and schedule.sport = p_sport
    order by schedule.starts_on desc, schedule.created_at desc, schedule.version desc
    limit 1
  );
end;
$function$
;

-- This RPC is service-role only. It cannot materialize arbitrary future or public rounds.
CREATE OR REPLACE FUNCTION public.get_nba_owner_prelaunch_materialization_request()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_day date := private.daily_challenge_central_day(now());
  v_version text := 'nba-daily-owner-prelaunch-v1';
  v_game text;
  v_daily private.daily_challenges;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required';
  end if;
  if v_day < date '2026-10-23' or v_day >= date '2026-11-01' then
    raise exception 'NBA owner tests are available only October 23–31';
  end if;
  v_game := private.daily_challenge_expected_game(v_version,v_day);
  select * into v_daily from private.daily_challenges
  where central_day = v_day and schedule_version = v_version;
  return jsonb_build_object('required',v_daily.id is null,'central_day',v_day,
    'schedule_version',v_version,'expected_game',v_game,
    'daily_challenge_id',v_daily.id,'published_game',v_daily.game_type);
end;
$function$;
revoke all on function public.get_nba_owner_prelaunch_materialization_request() from public, anon, authenticated;
grant execute on function public.get_nba_owner_prelaunch_materialization_request() to service_role;

-- Keep all test score, completion, streak and result detail reads owner-only.
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
  if p_sport is null or p_sport not in ('ufc', 'football', 'nba', 'nba_preview') then
    raise exception 'unsupported Daily Challenge sport %', coalesce(p_sport, '<null>');
  end if;
  if p_sport = 'nba_preview' and not exists (
    select 1 from public.pick_control_owners owner_row
    join public.profiles profile on profile.id = owner_row.profile_id
    where owner_row.profile_id = auth.uid() and profile.normalized_name = 'CODY'
  ) then
    raise exception 'NBA prelaunch tests are restricted to the HQ owner';
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

CREATE OR REPLACE FUNCTION public.get_daily_challenge_standings(p_sport text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_profile uuid := auth.uid();
  v_today date := private.daily_challenge_central_day(now());
  v_week_start date := v_today - case when p_sport = 'football' then ((extract(isodow from v_today)::integer + 5) % 7) else (extract(isodow from v_today)::integer - 1) end;
  v_week_end date := v_week_start + 6;
  v_ufc_championship_start date := date '2026-08-10';
  v_football_championship_start date := date '2026-09-15';
  v_result jsonb;
begin
  if v_profile is null then
    raise exception 'sign in required';
  end if;
  if p_sport is null or p_sport not in ('ufc', 'football', 'nba', 'nba_preview') then
    raise exception 'unsupported Daily Challenge sport %', coalesce(p_sport, '<null>');
  end if;
  if p_sport = 'nba_preview' and not exists (
    select 1 from public.pick_control_owners owner_row
    join public.profiles profile on profile.id = owner_row.profile_id
    where owner_row.profile_id = auth.uid() and profile.normalized_name = 'CODY'
  ) then
    raise exception 'NBA prelaunch tests are restricted to the HQ owner';
  end if;

  with history as (
    select
      source.profile_id,
      source.central_day,
      source.game_type,
      source.normalized_score,
      private.daily_challenge_hit_number_distance(
        source.game_type,
        source.public_result
      ) as hit_number_distance,
      source.central_day - case when p_sport = 'football' then ((extract(isodow from source.central_day)::integer + 5) % 7) else (extract(isodow from source.central_day)::integer - 1) end as week_start
    from private.daily_challenge_history source
    join private.daily_challenge_schedule_versions schedule
      on schedule.version = source.schedule_version
    where schedule.sport = p_sport
  ),
  daily_top_scores as (
    select central_day, max(normalized_score) as winning_score
    from history
    group by central_day
  ),
  daily_winners as (
    select
      history.central_day,
      top_score.winning_score,
      min(history.hit_number_distance) filter (
        where history.game_type = 'hit_the_number'
          and history.normalized_score = top_score.winning_score
      ) as winning_hit_number_distance
    from history
    join daily_top_scores top_score using (central_day)
    group by history.central_day, top_score.winning_score
  ),
  distinct_days as (
    select distinct profile_id, central_day
    from history
  ),
  grouped_days as (
    select
      profile_id,
      central_day,
      (case when p_sport = 'nba'
        then (central_day - date '2026-11-01') / 2
        else central_day - date '2000-01-01'
      end) - (row_number() over (
        partition by profile_id order by central_day
      ))::integer as streak_group
    from distinct_days
  ),
  streak_runs as (
    select
      profile_id,
      max(central_day) as end_day,
      count(*)::integer as run_length
    from grouped_days
    group by profile_id, streak_group
  ),
  expected_days as (
    select
      profile.id as profile_id,
      case when p_sport = 'nba' then
        case when exists (
          select 1 from history
          where history.profile_id = profile.id
            and history.central_day = (date '2026-11-01' + ((greatest(v_today, date '2026-11-01') - date '2026-11-01') / 2) * 2)
        ) then (date '2026-11-01' + ((greatest(v_today, date '2026-11-01') - date '2026-11-01') / 2) * 2)
          else (date '2026-11-01' + ((greatest(v_today, date '2026-11-01') - date '2026-11-01') / 2) * 2) - 2 end
      when exists (
        select 1 from history
        where history.profile_id = profile.id
          and history.central_day = v_today
      ) then v_today else v_today - 1 end as expected_day
    from public.profiles profile
  ),
  streaks as (
    select
      expected.profile_id,
      coalesce(max(run.run_length), 0)::integer as best_streak,
      coalesce(max(run.run_length) filter (
        where run.end_day = expected.expected_day
      ), 0)::integer as current_streak
    from expected_days expected
    left join streak_runs run on run.profile_id = expected.profile_id
    group by expected.profile_id
  ),
  weekly_stats_base as (
    select
      history.profile_id,
      history.week_start,
      count(*)::integer as played,
      (
        count(*) filter (
          where history.normalized_score = daily_winners.winning_score
            and (
              history.game_type <> 'hit_the_number'
              or history.hit_number_distance = daily_winners.winning_hit_number_distance
            )
        )
        + case when p_sport = 'football' then (
          select count(*)
          from private.football_weekly_auction_results auction_result
          join private.football_weekly_auction_weeks auction_week
            on auction_week.week_start = auction_result.week_start
          where auction_result.profile_id = history.profile_id
            and auction_result.week_start = history.week_start
            and auction_result.is_winner
            and auction_week.subject_key = 'cfb-best-teams-since-2000'
        ) else 0 end
      )::integer as wins,
      round(avg(history.normalized_score)::numeric, 1) as average_score
    from history
    join daily_winners using (central_day)
    group by history.profile_id, history.week_start
  ),
  weekly_keys as (
    select base.profile_id, base.week_start
    from weekly_stats_base base

    union

    select adjustment.profile_id, adjustment.carry_week_start
    from private.football_daily_transition_adjustments adjustment
    where p_sport = 'football'
  ),
  weekly_stats as (
    select
      key.profile_id,
      key.week_start,
      coalesce(base.played, 0)::integer as played,
      (
        coalesce(base.wins, 0)
        + case when p_sport = 'football'
          then coalesce(adjustment.weekly_wins_bonus, 0)
          else 0
        end
      )::integer as wins,
      coalesce(base.average_score, 0)::numeric as average_score
    from weekly_keys key
    left join weekly_stats_base base
      on base.profile_id = key.profile_id
     and base.week_start = key.week_start
    left join private.football_daily_transition_adjustments adjustment
      on p_sport = 'football'
     and adjustment.profile_id = key.profile_id
     and adjustment.carry_week_start = key.week_start
  ),
  weekly_ranked as (
    select
      weekly.*,
      rank() over (
        partition by weekly.week_start
        order by weekly.wins desc, weekly.average_score desc, weekly.played desc
      )::integer as weekly_rank
    from weekly_stats weekly
  ),
  titles as (
    select
      profile_id,
      count(*) filter (
        where weekly_rank = 1
          and week_start < v_week_start
          and (
            (p_sport = 'ufc' and week_start >= v_ufc_championship_start)
            or (p_sport = 'football' and week_start >= v_football_championship_start)
          )
      )::integer as weekly_titles
    from weekly_ranked
    group by profile_id
  ),
  member_stats as (
    select
      profile.id as profile_id,
      profile.display_name,
      profile.initials,
      preference.avatar_photo_data,
      count(history.central_day)::integer as played,
      (
        count(history.central_day) filter (
          where history.normalized_score = daily_winners.winning_score
            and (
              history.game_type <> 'hit_the_number'
              or history.hit_number_distance = daily_winners.winning_hit_number_distance
            )
        )
        + case when p_sport = 'football' then (
          select count(*)
          from private.football_weekly_auction_results auction_result
          join private.football_weekly_auction_weeks auction_week
            on auction_week.week_start = auction_result.week_start
          where auction_result.profile_id = profile.id
            and auction_result.is_winner
            and auction_week.subject_key = 'cfb-best-teams-since-2000'
        ) else 0 end
      )::integer as wins,
      coalesce(round(avg(history.normalized_score)::numeric, 1), 0)::numeric as average_score,
      coalesce(max(history.normalized_score), 0)::integer as best_score,
      jsonb_build_object(
        'find_leader', round((avg(history.normalized_score) filter (where history.game_type = 'find_leader'))::numeric, 1),
        'wavelength', round((avg(history.normalized_score) filter (where history.game_type = 'wavelength'))::numeric, 1),
        'blind_resume', round((avg(history.normalized_score) filter (where history.game_type = 'blind_resume'))::numeric, 1),
        'blind_rank_5', round((avg(history.normalized_score) filter (where history.game_type = 'blind_rank_5'))::numeric, 1),
        'keep_4_cut_4', round((avg(history.normalized_score) filter (where history.game_type = 'keep_4_cut_4'))::numeric, 1),
        'hit_the_number', round((avg(history.normalized_score) filter (where history.game_type = 'hit_the_number'))::numeric, 1),
        'who_am_i', round((avg(history.normalized_score) filter (where history.game_type = 'who_am_i'))::numeric, 1),
        'millionaire', round((avg(history.normalized_score) filter (where history.game_type = 'millionaire'))::numeric, 1),
        'sports_feud', round((avg(history.normalized_score) filter (where history.game_type = 'sports_feud'))::numeric, 1),
        'bar_trivia', round((avg(history.normalized_score) filter (where history.game_type = 'bar_trivia'))::numeric, 1),
        'average_fan', round((avg(history.normalized_score) filter (where history.game_type = 'average_fan'))::numeric, 1),
        'higher_lower', round((avg(history.normalized_score) filter (where history.game_type = 'higher_lower'))::numeric, 1)
      ) as game_averages,
      coalesce(streaks.current_streak, 0)::integer as current_streak,
      coalesce(streaks.best_streak, 0)::integer as best_streak,
      coalesce(current_week.wins, 0)::integer as weekly_wins,
      coalesce(current_week.played, 0)::integer as weekly_played,
      coalesce(current_week.average_score, 0)::numeric as weekly_average_score,

      greatest(
        0,
        coalesce(titles.weekly_titles, 0)
        + case when p_sport = 'football' then coalesce((
          select sum(adjustment.weekly_titles_bonus)
          from private.football_daily_transition_adjustments adjustment
          where adjustment.profile_id = profile.id
        ), 0) else 0 end
        + coalesce((
          select title_adjustment.title_delta
          from private.daily_challenge_title_adjustments title_adjustment
          where title_adjustment.profile_id = profile.id
            and title_adjustment.sport = p_sport
        ), 0)
      )::integer as weekly_titles
    from public.profiles profile
    left join public.profile_preferences preference on preference.profile_id = profile.id
    left join history on history.profile_id = profile.id
    left join daily_winners on daily_winners.central_day = history.central_day
    left join streaks on streaks.profile_id = profile.id
    left join weekly_stats current_week
      on current_week.profile_id = profile.id and current_week.week_start = v_week_start
    left join titles on titles.profile_id = profile.id
    group by
      profile.id, profile.display_name, profile.initials, preference.avatar_photo_data,
      streaks.current_streak, streaks.best_streak,
      current_week.wins, current_week.played, current_week.average_score,
      titles.weekly_titles
  ),
  ranked as (
    select
      row_number() over (
        order by member.wins desc, member.average_score desc, member.played desc,
          member.display_name, member.profile_id
      )::integer as standing_rank,
      rank() over (
        order by member.weekly_wins desc, member.weekly_average_score desc,
          member.weekly_played desc
      )::integer as weekly_rank,
      member.*
    from member_stats member
  )
  select jsonb_build_object(
    'player_count', count(*)::integer,
    'current_user_rank', max(standing_rank) filter (where profile_id = v_profile),
    'current_user_wins', max(wins) filter (where profile_id = v_profile),
    'current_week_start', v_week_start,
    'current_week_end', v_week_end,
    'entries', coalesce(jsonb_agg(jsonb_build_object(
      'rank', standing_rank,
      'profile_id', profile_id,
      'display_name', display_name,
      'initials', initials,
      'avatar_photo_data', avatar_photo_data,
      'wins', wins,
      'played', played,
      'average_score', average_score,
      'best_score', best_score,
      'current_streak', current_streak,
      'best_streak', best_streak,
      'game_averages', game_averages,
      'is_current_user', profile_id = v_profile,
      'weekly_rank', weekly_rank,
      'weekly_wins', weekly_wins,
      'weekly_played', weekly_played,
      'weekly_average_score', weekly_average_score,
      'total_wins', wins,
      'all_time_played', played,
      'all_time_average_score', average_score,
      'longest_streak', best_streak,
      'weekly_titles', weekly_titles
    ) order by standing_rank), '[]'::jsonb)
  ) into v_result
  from ranked;

  return coalesce(v_result, jsonb_build_object(
    'player_count', 0,
    'current_user_rank', null,
    'current_user_wins', 0,
    'current_week_start', v_week_start,
    'current_week_end', v_week_end,
    'entries', '[]'::jsonb
  ));
end;
$function$
;

CREATE OR REPLACE FUNCTION public.get_my_daily_challenge_streak(p_sport text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_profile uuid := auth.uid();
  v_today date := private.daily_challenge_central_day(now());
  v_step integer := case when p_sport = 'nba' then 2 else 1 end;
  v_active_day date;
  v_day date;
  v_previous date;
  v_expected date;
  v_run integer := 0;
  v_best integer := 0;
  v_current integer := 0;
begin
  if v_profile is null then
    raise exception 'sign in required';
  end if;
  if p_sport is null or p_sport not in ('ufc', 'football', 'nba', 'nba_preview') then
    raise exception 'unsupported Daily Challenge sport %', coalesce(p_sport, '<null>');
  end if;
  if p_sport = 'nba_preview' and not exists (
    select 1 from public.pick_control_owners owner_row
    join public.profiles profile on profile.id = owner_row.profile_id
    where owner_row.profile_id = auth.uid() and profile.normalized_name = 'CODY'
  ) then
    raise exception 'NBA prelaunch tests are restricted to the HQ owner';
  end if;

  for v_day in
    select distinct history.central_day
    from private.daily_challenge_history history
    join private.daily_challenge_schedule_versions schedule
      on schedule.version = history.schedule_version
    where history.profile_id = v_profile
      and schedule.sport = p_sport
    order by history.central_day
  loop
    if v_previous is null or v_day = v_previous + v_step then
      v_run := v_run + 1;
    else
      v_run := 1;
    end if;
    v_best := greatest(v_best, v_run);
    v_previous := v_day;
  end loop;

  -- NBA official results are keyed to the first day of each 48-hour slot.
  -- Missing the second calendar day does not break a legitimate NBA streak.
  v_active_day := case when p_sport = 'nba' then (date '2026-11-01' + ((greatest(v_today, date '2026-11-01') - date '2026-11-01') / 2) * 2)
    else v_today end;
  if exists (
    select 1
    from private.daily_challenge_history history
    join private.daily_challenge_schedule_versions schedule
      on schedule.version = history.schedule_version
    where history.profile_id = v_profile
      and schedule.sport = p_sport
      and history.central_day = v_active_day
  ) then
    v_expected := v_active_day;
  else
    v_expected := v_active_day - v_step;
  end if;

  for v_day in
    select distinct history.central_day
    from private.daily_challenge_history history
    join private.daily_challenge_schedule_versions schedule
      on schedule.version = history.schedule_version
    where history.profile_id = v_profile
      and schedule.sport = p_sport
      and history.central_day <= v_expected
    order by history.central_day desc
  loop
    exit when v_day <> v_expected;
    v_current := v_current + 1;
    v_expected := v_expected - v_step;
  end loop;

  return jsonb_build_object(
    'current_streak', v_current,
    'best_streak', v_best
  );
end;
$function$
;

CREATE OR REPLACE FUNCTION public.list_member_daily_challenge_history(p_member_name text, p_sport text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_viewer uuid := auth.uid();
  v_member uuid;
begin
  if v_viewer is null then
    raise exception 'sign in required';
  end if;
  if p_sport is null or p_sport not in ('ufc', 'football', 'nba', 'nba_preview') then
    raise exception 'unsupported Daily Challenge sport %', coalesce(p_sport, '<null>');
  end if;
  if p_sport = 'nba_preview' and not exists (
    select 1 from public.pick_control_owners owner_row
    join public.profiles profile on profile.id = owner_row.profile_id
    where owner_row.profile_id = auth.uid() and profile.normalized_name = 'CODY'
  ) then
    raise exception 'NBA prelaunch tests are restricted to the HQ owner';
  end if;
  if nullif(trim(p_member_name), '') is null or length(p_member_name) > 120 then
    raise exception 'member name required';
  end if;

  select profile.id into v_member
  from public.profiles profile
  where profile.normalized_name = upper(regexp_replace(trim(p_member_name), '\s+', ' ', 'g'))
  limit 1;

  if v_member is null then
    raise exception 'member profile not found';
  end if;

  return coalesce((
    select jsonb_agg(
      jsonb_build_object(
        'day', history.central_day,
        'schedule_version', history.schedule_version,
        'game_type', history.game_type,
        'native_score', history.native_score,
        'normalized_score', history.normalized_score,
        'completed_at', history.completed_at,
        'content_version', history.content_version,
        'scoring_version', history.scoring_version,
        'public_result', history.public_result
      )
      order by history.central_day desc
    )
    from (
      select source.*
      from private.daily_challenge_history source
      join private.daily_challenge_schedule_versions schedule
        on schedule.version = source.schedule_version
      where source.profile_id = v_member
        and schedule.sport = p_sport
        and source.central_day <= (now() at time zone 'America/Chicago')::date
        and (
          source.profile_id = v_viewer
          or source.central_day < (now() at time zone 'America/Chicago')::date
          or exists (
            select 1
            from private.daily_challenge_history viewer_result
            where viewer_result.profile_id = v_viewer
              and viewer_result.central_day = source.central_day
              and viewer_result.schedule_version = source.schedule_version
          )
        )
      order by source.central_day desc
      limit 365
    ) history
  ), '[]'::jsonb);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.list_my_daily_challenge_history(p_sport text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_profile uuid := auth.uid();
begin
  if v_profile is null then
    raise exception 'sign in required';
  end if;
  if p_sport is null or p_sport not in ('ufc', 'football', 'nba', 'nba_preview') then
    raise exception 'unsupported Daily Challenge sport %', coalesce(p_sport, '<null>');
  end if;
  if p_sport = 'nba_preview' and not exists (
    select 1 from public.pick_control_owners owner_row
    join public.profiles profile on profile.id = owner_row.profile_id
    where owner_row.profile_id = auth.uid() and profile.normalized_name = 'CODY'
  ) then
    raise exception 'NBA prelaunch tests are restricted to the HQ owner';
  end if;

  return coalesce((
    select jsonb_agg(
      jsonb_build_object(
        'day', history.central_day,
        'schedule_version', history.schedule_version,
        'game_type', history.game_type,
        'native_score', history.native_score,
        'normalized_score', history.normalized_score,
        'completed_at', history.completed_at,
        'content_version', history.content_version,
        'scoring_version', history.scoring_version,
        'public_result', history.public_result
      )
      order by history.central_day desc
    )
    from (
      select source.*
      from private.daily_challenge_history source
      join private.daily_challenge_schedule_versions schedule
        on schedule.version = source.schedule_version
      where source.profile_id = v_profile
        and schedule.sport = p_sport
      order by source.central_day desc
      limit 365
    ) history
  ), '[]'::jsonb);
end;
$function$
;

-- Client attempt RPC must not accept a leaked preview challenge ID from non-owners.
CREATE OR REPLACE FUNCTION public.submit_my_daily_challenge_attempt(p_daily_challenge_id uuid, p_submission jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_profile uuid := auth.uid();
  v_today date := private.daily_challenge_central_day(now());
  v_daily private.daily_challenges;
  v_setup private.daily_challenge_setups;
  v_grade record;
  v_official private.daily_challenge_attempts;
  v_replay private.daily_challenge_attempts;
begin
  if v_profile is null then
    raise exception 'sign in required';
  end if;

  select *
  into v_daily
  from private.daily_challenges
  where id = p_daily_challenge_id;

  if v_daily.id is null then
    raise exception 'daily challenge not found';
  end if;
  if v_daily.schedule_version = 'nba-daily-owner-prelaunch-v1' and not exists (
    select 1 from public.pick_control_owners owner_row
    join public.profiles profile on profile.id = owner_row.profile_id
    where owner_row.profile_id = v_profile and profile.normalized_name = 'CODY'
  ) then
    raise exception 'NBA prelaunch attempts are owner-only';
  end if;
  if not (
    v_daily.central_day = v_today
    or (
      v_daily.central_day = v_today - 1
      and exists (select 1 from private.daily_challenge_schedule_versions schedule
        where schedule.version = v_daily.schedule_version and schedule.sport = 'nba')
    )
  ) then
    raise exception 'official daily submissions are accepted only for the current Central-time day';
  end if;

  select *
  into v_setup
  from private.daily_challenge_setups
  where id = v_daily.setup_id;

  select *
  into v_grade
  from private.grade_daily_challenge(
    v_daily.game_type,
    v_daily.scoring_version,
    coalesce(p_submission, '{}'::jsonb),
    v_setup.private_grading_evidence
  );

  insert into private.daily_challenge_attempts (
    daily_challenge_id,
    profile_id,
    attempt_kind,
    native_score,
    normalized_score,
    content_version,
    scoring_version,
    public_result,
    submission_evidence,
    grading_evidence_snapshot
  )
  values (
    v_daily.id,
    v_profile,
    'official_first',
    v_grade.native_score,
    v_grade.normalized_score,
    v_daily.content_version,
    v_daily.scoring_version,
    v_grade.public_result,
    coalesce(p_submission, '{}'::jsonb),
    v_grade.grading_snapshot
  )
  on conflict (daily_challenge_id, profile_id)
    where attempt_kind = 'official_first'
  do nothing
  returning * into v_official;

  if v_official.id is not null then
    return jsonb_build_object(
      'attempt_kind', 'official_first',
      'native_score', v_official.native_score,
      'normalized_score', v_official.normalized_score,
      'completed_at', v_official.completed_at,
      'content_version', v_official.content_version,
      'scoring_version', v_official.scoring_version,
      'public_result', v_official.public_result
    );
  end if;

  select *
  into v_official
  from private.daily_challenge_attempts
  where daily_challenge_id = v_daily.id
    and profile_id = v_profile
    and attempt_kind = 'official_first';

  insert into private.daily_challenge_attempts (
    daily_challenge_id,
    profile_id,
    attempt_kind,
    native_score,
    normalized_score,
    content_version,
    scoring_version,
    public_result,
    submission_evidence,
    grading_evidence_snapshot
  )
  values (
    v_daily.id,
    v_profile,
    'replay',
    v_grade.native_score,
    v_grade.normalized_score,
    v_daily.content_version,
    v_daily.scoring_version,
    v_grade.public_result,
    coalesce(p_submission, '{}'::jsonb),
    v_grade.grading_snapshot
  )
  returning * into v_replay;

  return jsonb_build_object(
    'attempt_kind', 'replay',
    'official_native_score', v_official.native_score,
    'official_normalized_score', v_official.normalized_score,
    'replay_native_score', v_replay.native_score,
    'replay_normalized_score', v_replay.normalized_score,
    'completed_at', v_replay.completed_at,
    'content_version', v_official.content_version,
    'scoring_version', v_official.scoring_version,
    'public_result', v_replay.public_result
  );
end;
$function$
;
