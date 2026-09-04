-- PR3: extend the one canonical Daily Challenge persistence/competition owner to Football.
-- Existing rows are UFC by default; Football receives its own schedule identity while attempts,
-- progress, history, streaks, standings, and leaderboards continue to use the shared tables/RPCs.

alter table private.daily_challenge_schedule_versions
  add column if not exists sport text not null default 'ufc';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'private.daily_challenge_schedule_versions'::regclass
      and conname = 'daily_challenge_schedule_versions_sport_check'
  ) then
    alter table private.daily_challenge_schedule_versions
      add constraint daily_challenge_schedule_versions_sport_check
      check (sport in ('ufc', 'football'));
  end if;
end
$$;

create index if not exists daily_challenge_schedule_versions_sport_starts
  on private.daily_challenge_schedule_versions(sport, starts_on desc, created_at desc, version desc);

-- Preserve every historical schedule as UFC. The default populated existing rows when the
-- column was added, and this assertion prevents a future migration from silently reclassifying them.
do $$
begin
  if exists (
    select 1
    from private.daily_challenge_schedule_versions
    where version not in ('football-daily-v1', 'football-daily-v2', 'football-daily-v3')
      and sport <> 'ufc'
  ) then
    raise exception 'pre-Football Daily Challenge schedules must remain UFC-owned';
  end if;
end
$$;

insert into private.daily_challenge_schedule_versions (
  version,
  time_zone,
  anchor_day,
  starts_on,
  game_cycle,
  sport
)
values (
  'football-daily-v1',
  'America/Chicago',
  date '2026-08-22',
  date '2026-08-22',
  array[
    'find_leader',
    'blind_resume',
    'wavelength',
    'keep_4_cut_4',
    'hit_the_number'
  ]::text[],
  'football'
)
on conflict (version) do nothing;

do $$
begin
  if not exists (
    select 1
    from private.daily_challenge_schedule_versions
    where version = 'football-daily-v1'
      and sport = 'football'
      and time_zone = 'America/Chicago'
      and anchor_day = date '2026-08-22'
      and starts_on = date '2026-08-22'
      and game_cycle = array[
        'find_leader',
        'blind_resume',
        'wavelength',
        'keep_4_cut_4',
        'hit_the_number'
      ]::text[]
  ) then
    raise exception 'football-daily-v1 exists with an unexpected immutable identity';
  end if;
end
$$;

-- The historical one-argument resolver remains the UFC owner so adding Football can never
-- steal the active UFC daily. The overload is the shared sport-aware resolver.
create or replace function private.daily_challenge_schedule_for_day(
  p_day date,
  p_sport text
)
returns text
language plpgsql
stable
set search_path = ''
as $$
begin
  if p_sport is null or p_sport not in ('ufc', 'football') then
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
$$;

create or replace function private.daily_challenge_schedule_for_day(p_day date)
returns text
language sql
stable
set search_path = ''
as $$
  select private.daily_challenge_schedule_for_day(p_day, 'ufc');
$$;

revoke all on function private.daily_challenge_schedule_for_day(date, text)
  from public, anon, authenticated;
revoke all on function private.daily_challenge_schedule_for_day(date)
  from public, anon, authenticated;

create or replace function public.list_my_daily_challenge_history(p_sport text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_profile uuid := auth.uid();
begin
  if v_profile is null then
    raise exception 'sign in required';
  end if;
  if p_sport is null or p_sport not in ('ufc', 'football') then
    raise exception 'unsupported Daily Challenge sport %', coalesce(p_sport, '<null>');
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
$$;

create or replace function public.list_my_daily_challenge_history()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select public.list_my_daily_challenge_history('ufc');
$$;

create or replace function public.get_my_daily_challenge_streak(p_sport text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_profile uuid := auth.uid();
  v_today date := private.daily_challenge_central_day(now());
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
  if p_sport is null or p_sport not in ('ufc', 'football') then
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
    if v_previous is null or v_day = v_previous + 1 then
      v_run := v_run + 1;
    else
      v_run := 1;
    end if;
    v_best := greatest(v_best, v_run);
    v_previous := v_day;
  end loop;

  if exists (
    select 1
    from private.daily_challenge_history history
    join private.daily_challenge_schedule_versions schedule
      on schedule.version = history.schedule_version
    where history.profile_id = v_profile
      and schedule.sport = p_sport
      and history.central_day = v_today
  ) then
    v_expected := v_today;
  else
    v_expected := v_today - 1;
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
    v_expected := v_expected - 1;
  end loop;

  return jsonb_build_object(
    'current_streak', v_current,
    'best_streak', v_best
  );
end;
$$;

create or replace function public.get_my_daily_challenge_streak()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select public.get_my_daily_challenge_streak('ufc');
$$;

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
      rank() over (order by history.normalized_score desc)::integer as score_rank
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

create or replace function public.get_daily_challenge_leaderboard(
  p_day date,
  p_schedule_version text
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select public.get_daily_challenge_leaderboard(p_day, p_schedule_version, 'ufc');
$$;

create or replace function public.get_daily_challenge_standings(p_sport text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_profile uuid := auth.uid();
  v_today date := private.daily_challenge_central_day(now());
  v_week_start date := v_today - (extract(isodow from v_today)::integer - 1);
  v_week_end date := v_week_start + 6;
  v_ufc_championship_start date := date '2026-08-10';
  v_result jsonb;
begin
  if v_profile is null then
    raise exception 'sign in required';
  end if;
  if p_sport is null or p_sport not in ('ufc', 'football') then
    raise exception 'unsupported Daily Challenge sport %', coalesce(p_sport, '<null>');
  end if;

  with history as (
    select
      source.profile_id,
      source.central_day,
      source.game_type,
      source.normalized_score,
      source.central_day - (extract(isodow from source.central_day)::integer - 1) as week_start
    from private.daily_challenge_history source
    join private.daily_challenge_schedule_versions schedule
      on schedule.version = source.schedule_version
    where schedule.sport = p_sport
  ),
  daily_winners as (
    select central_day, max(normalized_score) as winning_score
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
      case when exists (
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
  weekly_stats as (
    select
      history.profile_id,
      history.week_start,
      count(*)::integer as played,
      count(*) filter (
        where history.normalized_score = daily_winners.winning_score
      )::integer as wins,
      round(avg(history.normalized_score)::numeric, 1) as average_score
    from history
    join daily_winners using (central_day)
    group by history.profile_id, history.week_start
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
          and (p_sport <> 'ufc' or week_start >= v_ufc_championship_start)
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
      count(history.central_day) filter (
        where history.normalized_score = daily_winners.winning_score
      )::integer as wins,
      coalesce(round(avg(history.normalized_score)::numeric, 1), 0)::numeric as average_score,
      coalesce(max(history.normalized_score), 0)::integer as best_score,
      jsonb_build_object(
        'find_leader', round((avg(history.normalized_score) filter (where history.game_type = 'find_leader'))::numeric, 1),
        'wavelength', round((avg(history.normalized_score) filter (where history.game_type = 'wavelength'))::numeric, 1),
        'blind_resume', round((avg(history.normalized_score) filter (where history.game_type = 'blind_resume'))::numeric, 1),
        'blind_rank_5', round((avg(history.normalized_score) filter (where history.game_type = 'blind_rank_5'))::numeric, 1),
        'keep_4_cut_4', round((avg(history.normalized_score) filter (where history.game_type = 'keep_4_cut_4'))::numeric, 1),
        'hit_the_number', round((avg(history.normalized_score) filter (where history.game_type = 'hit_the_number'))::numeric, 1)
      ) as game_averages,
      coalesce(streaks.current_streak, 0)::integer as current_streak,
      coalesce(streaks.best_streak, 0)::integer as best_streak,
      coalesce(current_week.wins, 0)::integer as weekly_wins,
      coalesce(current_week.played, 0)::integer as weekly_played,
      coalesce(current_week.average_score, 0)::numeric as weekly_average_score,
      coalesce(titles.weekly_titles, 0)::integer as weekly_titles
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
$$;

create or replace function public.get_daily_challenge_standings()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select public.get_daily_challenge_standings('ufc');
$$;

-- The legacy Find the Leader compatibility projection must remain UFC-only now that Football
-- also has a Find the Leader day.
create or replace function public.list_my_find_leader_history()
returns setof public.find_leader_history
language sql
stable
security definer
set search_path = ''
as $$
  with official as (
    select history.*
    from private.daily_challenge_history history
    join private.daily_challenge_schedule_versions schedule
      on schedule.version = history.schedule_version
    where history.profile_id = auth.uid()
      and history.game_type = 'find_leader'
      and schedule.sport = 'ufc'
  )
  select
    history.profile_id,
    history.central_day as day,
    history.native_score::smallint as official_score,
    greatest(
      history.native_score,
      coalesce(legacy.best_score::integer, history.native_score),
      coalesce((history.public_result->>'best_score')::integer, history.native_score),
      coalesce((
        select max(attempt.native_score)
        from private.daily_challenge_attempts attempt
        where attempt.daily_challenge_id = history.daily_challenge_id
          and attempt.profile_id = history.profile_id
      ), history.native_score)
    )::smallint as best_score,
    greatest(
      1,
      coalesce(legacy.attempts, 1),
      coalesce((history.public_result->>'attempts')::integer, 1),
      coalesce((
        select count(*)::integer
        from private.daily_challenge_attempts attempt
        where attempt.daily_challenge_id = history.daily_challenge_id
          and attempt.profile_id = history.profile_id
      ), 1)
    )::integer as attempts,
    history.completed_at,
    coalesce(
      legacy.updated_at,
      (history.public_result->>'updated_at')::timestamptz,
      history.completed_at
    ) as updated_at
  from official history
  left join public.find_leader_history legacy
    on legacy.profile_id = history.profile_id
   and legacy.day = history.central_day
  order by history.central_day desc
  limit 180;
$$;

revoke all on function public.list_my_daily_challenge_history(text) from public, anon;
grant execute on function public.list_my_daily_challenge_history(text) to authenticated;
revoke all on function public.list_my_daily_challenge_history() from public, anon;
grant execute on function public.list_my_daily_challenge_history() to authenticated;

revoke all on function public.get_my_daily_challenge_streak(text) from public, anon;
grant execute on function public.get_my_daily_challenge_streak(text) to authenticated;
revoke all on function public.get_my_daily_challenge_streak() from public, anon;
grant execute on function public.get_my_daily_challenge_streak() to authenticated;

revoke all on function public.get_daily_challenge_leaderboard(date, text, text) from public, anon;
grant execute on function public.get_daily_challenge_leaderboard(date, text, text) to authenticated;
revoke all on function public.get_daily_challenge_leaderboard(date, text) from public, anon;
grant execute on function public.get_daily_challenge_leaderboard(date, text) to authenticated;

revoke all on function public.get_daily_challenge_standings(text) from public, anon;
grant execute on function public.get_daily_challenge_standings(text) to authenticated;
revoke all on function public.get_daily_challenge_standings() from public, anon;
grant execute on function public.get_daily_challenge_standings() to authenticated;

revoke all on function public.list_my_find_leader_history() from public, anon;
grant execute on function public.list_my_find_leader_history() to authenticated;
