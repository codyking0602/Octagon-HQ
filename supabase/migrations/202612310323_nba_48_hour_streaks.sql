-- Recalculate NBA Daily streaks using actual 48-hour publication slots.
-- UFC and Football remain on their historical one-calendar-day cadence.
-- This is a forward-only migration; existing official scores and history are unchanged.
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
  if p_sport is null or p_sport not in ('ufc', 'football', 'nba') then
    raise exception 'unsupported Daily Challenge sport %', coalesce(p_sport, '<null>');
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
  if p_sport is null or p_sport not in ('ufc', 'football', 'nba') then
    raise exception 'unsupported Daily Challenge sport %', coalesce(p_sport, '<null>');
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
