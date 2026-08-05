-- Cumulative Daily Challenge Standings.
-- One server-owned projection ranks members by daily wins and returns the approved
-- participation, scoring, streak, and per-game average details.
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
  v_result jsonb;
begin
  if v_profile is null then
    raise exception 'sign in required';
  end if;

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
      member.*
    from member_stats member
  )
  select jsonb_build_object(
    'player_count', count(*)::integer,
    'current_user_rank', max(standing_rank) filter (
      where profile_id = v_profile
    ),
    'current_user_wins', max(wins) filter (
      where profile_id = v_profile
    ),
    'entries', coalesce(jsonb_agg(
      jsonb_build_object(
        'rank', standing_rank,
        'profile_id', profile_id,
        'display_name', display_name,
        'initials', initials,
        'avatar_photo_data', avatar_photo_data,
        'wins', wins,
        'played', played,
        'average_score', average_score,
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
    'entries', '[]'::jsonb
  ));
end;
$$;

revoke all on function public.get_daily_challenge_standings()
  from public, anon;
grant execute on function public.get_daily_challenge_standings()
  to authenticated;
