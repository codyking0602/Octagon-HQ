-- Extend the one canonical Daily Challenge standings projection with weekly competition.
-- Existing cumulative fields and ranking remain unchanged for the currently deployed client.
create or replace function public.get_daily_challenge_standings()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_profile uuid := auth.uid();
  v_today date := private.daily_challenge_central_day(now());
  v_week_start date;
  v_week_end date;
  v_last_week_start date;
  v_last_week_end date;
  v_result jsonb;
begin
  if v_profile is null then
    raise exception 'sign in required';
  end if;

  -- ISO day-of-week is Monday=1 through Sunday=7. Daily Challenge days are
  -- already owned by America/Chicago through daily_challenge_central_day().
  v_week_start := v_today - (extract(isodow from v_today)::integer - 1);
  v_week_end := v_week_start + 6;
  v_last_week_start := v_week_start - 7;
  v_last_week_end := v_week_start - 1;

  with history as (
    select
      source.profile_id,
      source.central_day,
      source.game_type,
      source.normalized_score
    from private.daily_challenge_history source
  ),
  daily_winners as (
    select
      central_day,
      max(normalized_score) as winning_score
    from history
    group by central_day
  ),
  distinct_days as (
    select distinct profile_id, central_day
    from history
  ),
  grouped_days as (
    select
      profile_id,
      central_day,
      central_day - (row_number() over (
        partition by profile_id
        order by central_day
      ))::integer as streak_group
    from distinct_days
  ),
  streak_runs as (
    select
      profile_id,
      min(central_day) as start_day,
      max(central_day) as end_day,
      count(*)::integer as run_length
    from grouped_days
    group by profile_id, streak_group
  ),
  expected_days as (
    select
      profile.id as profile_id,
      case
        when exists (
          select 1
          from history
          where history.profile_id = profile.id
            and history.central_day = v_today
        ) then v_today
        else v_today - 1
      end as expected_day
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
    left join streak_runs run
      on run.profile_id = expected.profile_id
    group by expected.profile_id
  ),
  member_stats as (
    select
      profile.id as profile_id,
      profile.display_name,
      profile.initials,
      preference.avatar_photo_data,
      count(history.central_day)::integer as played,
      count(history.central_day) filter (
        where history.normalized_score = daily_winners.winning_score
      )::integer as wins,
      coalesce(round(avg(history.normalized_score)::numeric, 1), 0)::numeric as average_score,
      jsonb_build_object(
        'find_leader', round((avg(history.normalized_score) filter (
          where history.game_type = 'find_leader'
        ))::numeric, 1),
        'wavelength', round((avg(history.normalized_score) filter (
          where history.game_type = 'wavelength'
        ))::numeric, 1),
        'blind_resume', round((avg(history.normalized_score) filter (
          where history.game_type = 'blind_resume'
        ))::numeric, 1),
        'blind_rank_5', round((avg(history.normalized_score) filter (
          where history.game_type = 'blind_rank_5'
        ))::numeric, 1),
        'keep_4_cut_4', round((avg(history.normalized_score) filter (
          where history.game_type = 'keep_4_cut_4'
        ))::numeric, 1)
      ) as game_averages,
      coalesce(streaks.current_streak, 0)::integer as current_streak,
      coalesce(streaks.best_streak, 0)::integer as best_streak
    from public.profiles profile
    left join public.profile_preferences preference
      on preference.profile_id = profile.id
    left join history
      on history.profile_id = profile.id
    left join daily_winners
      on daily_winners.central_day = history.central_day
    left join streaks
      on streaks.profile_id = profile.id
    group by
      profile.id,
      profile.display_name,
      profile.initials,
      preference.avatar_photo_data,
      streaks.current_streak,
      streaks.best_streak
  ),
  current_week_stats as (
    select
      profile.id as profile_id,
      profile.display_name,
      profile.initials,
      preference.avatar_photo_data,
      count(history.central_day)::integer as played,
      count(history.central_day) filter (
        where history.normalized_score = daily_winners.winning_score
      )::integer as wins,
      round(avg(history.normalized_score)::numeric, 1)::numeric as average_score
    from history
    join public.profiles profile
      on profile.id = history.profile_id
    left join public.profile_preferences preference
      on preference.profile_id = profile.id
    left join daily_winners
      on daily_winners.central_day = history.central_day
    where history.central_day between v_week_start and v_today
    group by
      profile.id,
      profile.display_name,
      profile.initials,
      preference.avatar_photo_data
  ),
  current_week_ranked as (
    select
      rank() over (
        order by
          member.wins desc,
          member.average_score desc,
          member.played desc
      )::integer as weekly_rank,
      member.*
    from current_week_stats member
  ),
  completed_week_stats as (
    select
      history.central_day
        - (extract(isodow from history.central_day)::integer - 1) as week_start,
      history.profile_id,
      count(history.central_day)::integer as played,
      count(history.central_day) filter (
        where history.normalized_score = daily_winners.winning_score
      )::integer as wins,
      round(avg(history.normalized_score)::numeric, 1)::numeric as average_score
    from history
    left join daily_winners
      on daily_winners.central_day = history.central_day
    where history.central_day < v_week_start
    group by
      history.central_day
        - (extract(isodow from history.central_day)::integer - 1),
      history.profile_id
  ),
  completed_week_ranked as (
    select
      week.week_start,
      week.profile_id,
      week.played,
      week.wins,
      week.average_score,
      rank() over (
        partition by week.week_start
        order by
          week.wins desc,
          week.average_score desc,
          week.played desc
      )::integer as weekly_rank
    from completed_week_stats week
  ),
  weekly_title_counts as (
    select
      week.profile_id,
      count(*)::integer as weekly_titles
    from completed_week_ranked week
    where week.weekly_rank = 1
    group by week.profile_id
  ),
  career_with_titles as (
    select
      member.*,
      coalesce(title.weekly_titles, 0)::integer as weekly_titles
    from member_stats member
    left join weekly_title_counts title
      on title.profile_id = member.profile_id
  ),
  ranked as (
    select
      row_number() over (
        order by
          member.wins desc,
          member.average_score desc,
          member.played desc,
          member.display_name,
          member.profile_id
      )::integer as standing_rank,
      rank() over (
        order by
          member.weekly_titles desc,
          member.wins desc,
          member.average_score desc,
          member.played desc
      )::integer as championship_rank,
      member.*
    from career_with_titles member
  )
  select jsonb_build_object(
    -- Legacy cumulative contract: preserved additively for the deployed client.
    'player_count', count(*)::integer,
    'current_user_rank', max(standing_rank) filter (
      where profile_id = v_profile
    ),
    'current_user_wins', max(wins) filter (
      where profile_id = v_profile
    ),
    -- Weekly competition contract.
    'week_start', v_week_start,
    'week_end', v_week_end,
    'current_user_week_rank', (
      select max(weekly_rank)
      from current_week_ranked
      where profile_id = v_profile
    ),
    'current_user_week_wins', coalesce((
      select max(wins)
      from current_week_ranked
      where profile_id = v_profile
    ), 0),
    'current_user_weekly_titles', coalesce(max(weekly_titles) filter (
      where profile_id = v_profile
    ), 0),
    'current_user_championship_rank', max(championship_rank) filter (
      where profile_id = v_profile
    ),
    'weekly_entries', (
      select coalesce(jsonb_agg(
        jsonb_build_object(
          'rank', weekly_rank,
          'profile_id', profile_id,
          'display_name', display_name,
          'initials', initials,
          'avatar_photo_data', avatar_photo_data,
          'wins', wins,
          'played', played,
          'average_score', average_score,
          'is_current_user', profile_id = v_profile
        )
        order by weekly_rank, display_name, profile_id
      ), '[]'::jsonb)
      from current_week_ranked
    ),
    'last_completed_week', jsonb_build_object(
      'week_start', v_last_week_start,
      'week_end', v_last_week_end,
      'winning_wins', coalesce((
        select max(wins)
        from completed_week_ranked
        where week_start = v_last_week_start
      ), 0),
      'champions', (
        select coalesce(jsonb_agg(
          jsonb_build_object(
            'profile_id', week.profile_id,
            'display_name', profile.display_name,
            'initials', profile.initials,
            'avatar_photo_data', preference.avatar_photo_data
          )
          order by profile.display_name, week.profile_id
        ), '[]'::jsonb)
        from completed_week_ranked week
        join public.profiles profile
          on profile.id = week.profile_id
        left join public.profile_preferences preference
          on preference.profile_id = profile.id
        where week.week_start = v_last_week_start
          and week.weekly_rank = 1
      )
    ),
    'entries', coalesce(jsonb_agg(
      jsonb_build_object(
        'rank', standing_rank,
        'championship_rank', championship_rank,
        'profile_id', profile_id,
        'display_name', display_name,
        'initials', initials,
        'avatar_photo_data', avatar_photo_data,
        'wins', wins,
        'played', played,
        'average_score', average_score,
        'weekly_titles', weekly_titles,
        'current_streak', current_streak,
        'best_streak', best_streak,
        'game_averages', game_averages,
        'is_current_user', profile_id = v_profile
      )
      order by standing_rank
    ), '[]'::jsonb)
  )
  into v_result
  from ranked;

  return coalesce(v_result, jsonb_build_object(
    'player_count', 0,
    'current_user_rank', null,
    'current_user_wins', 0,
    'week_start', v_week_start,
    'week_end', v_week_end,
    'current_user_week_rank', null,
    'current_user_week_wins', 0,
    'current_user_weekly_titles', 0,
    'current_user_championship_rank', null,
    'weekly_entries', '[]'::jsonb,
    'last_completed_week', jsonb_build_object(
      'week_start', v_last_week_start,
      'week_end', v_last_week_end,
      'winning_wins', 0,
      'champions', '[]'::jsonb
    ),
    'entries', '[]'::jsonb
  ));
end;
$$;

revoke all on function public.get_daily_challenge_standings()
  from public, anon;
grant execute on function public.get_daily_challenge_standings()
  to authenticated;
