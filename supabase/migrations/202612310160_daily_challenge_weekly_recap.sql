-- One-time, per-member weekly championship recap for UFC and Football Daily.
-- The recap is derived from canonical official history and appears only for the
-- immediately completed competition week when that member played at least one Daily.

create table if not exists private.daily_challenge_weekly_recap_views (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  sport text not null check (sport in ('ufc', 'football')),
  week_start date not null,
  seen_at timestamptz not null default now(),
  primary key (profile_id, sport, week_start)
);

revoke all on table private.daily_challenge_weekly_recap_views
  from public, anon, authenticated;

create or replace function private.daily_challenge_week_start(
  p_day date,
  p_sport text
)
returns date
language sql
immutable
set search_path = ''
as $$
  select p_day - case
    when p_sport = 'football'
      then ((extract(isodow from p_day)::integer + 5) % 7)
    else (extract(isodow from p_day)::integer - 1)
  end;
$$;

revoke all on function private.daily_challenge_week_start(date, text)
  from public, anon, authenticated;

create or replace function public.get_my_daily_challenge_weekly_recap(
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
  v_today date := private.daily_challenge_central_day(now());
  v_current_week_start date;
  v_week_start date;
  v_week_end date;
  v_eligible_start date;
  v_auction_bonus jsonb := null;
  v_result jsonb;
begin
  if v_profile is null then
    raise exception 'sign in required';
  end if;
  if p_sport is null or p_sport not in ('ufc', 'football') then
    raise exception 'unsupported Daily Challenge sport %', coalesce(p_sport, '<null>');
  end if;

  v_current_week_start := private.daily_challenge_week_start(v_today, p_sport);
  v_week_start := v_current_week_start - 7;
  v_week_end := v_week_start + 6;
  v_eligible_start := case
    when p_sport = 'football' then date '2026-09-15'
    else date '2026-08-10'
  end;

  if v_week_start < v_eligible_start then
    return null;
  end if;

  -- Football's existing weekly owner finalizes the just-completed Auction.
  -- Do that before projecting the recap so the +1 Daily win cannot race the
  -- first Play-tab visit after Monday midnight.
  if p_sport = 'football' then
    perform private.maintain_football_weekly_auction(now());
  end if;

  if exists (
    select 1
    from private.daily_challenge_weekly_recap_views view_row
    where view_row.profile_id = v_profile
      and view_row.sport = p_sport
      and view_row.week_start = v_week_start
  ) then
    return null;
  end if;

  if not exists (
    select 1
    from private.daily_challenge_history history
    join private.daily_challenge_schedule_versions schedule
      on schedule.version = history.schedule_version
    where history.profile_id = v_profile
      and schedule.sport = p_sport
      and history.central_day between v_week_start and v_week_end
  ) then
    return null;
  end if;

  if p_sport = 'football' then
    select jsonb_build_object(
      'profile_id', result.profile_id,
      'display_name', profile.display_name,
      'subject_key', week.subject_key,
      'subject_label', case week.subject_key
        when 'cfb-best-teams-since-2000' then 'Best CFB Teams Since 2000'
        when 'nfl-build-qb' then 'NFL Build a QB'
        else 'Weekly Auction'
      end
    )
    into v_auction_bonus
    from private.football_weekly_auction_results result
    join private.football_weekly_auction_weeks week
      on week.week_start = result.week_start
    join public.profiles profile
      on profile.id = result.profile_id
    where result.week_start = v_week_start
      and result.is_winner
      and week.subject_key = 'cfb-best-teams-since-2000'
    order by lower(profile.display_name), profile.id
    limit 1;
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
      ) as hit_number_distance
    from private.daily_challenge_history source
    join private.daily_challenge_schedule_versions schedule
      on schedule.version = source.schedule_version
    where schedule.sport = p_sport
      and source.central_day between v_week_start and v_week_end
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
  weekly_stats as (
    select
      history.profile_id,
      count(*)::integer as played,
      (
        count(*) filter (
          where history.normalized_score = daily_winners.winning_score
            and (
              history.game_type <> 'hit_the_number'
              or history.hit_number_distance = daily_winners.winning_hit_number_distance
            )
        )
        + case when p_sport = 'football' then coalesce((
          select adjustment.weekly_wins_bonus
          from private.football_daily_transition_adjustments adjustment
          where adjustment.profile_id = history.profile_id
            and adjustment.carry_week_start = v_week_start
        ), 0) else 0 end
        + case when p_sport = 'football' then (
          select count(*)
          from private.football_weekly_auction_results auction_result
          join private.football_weekly_auction_weeks auction_week
            on auction_week.week_start = auction_result.week_start
          where auction_result.profile_id = history.profile_id
            and auction_result.week_start = v_week_start
            and auction_result.is_winner
            and auction_week.subject_key = 'cfb-best-teams-since-2000'
        ) else 0 end
      )::integer as wins,
      round(avg(history.normalized_score)::numeric, 1) as average_score
    from history
    join daily_winners using (central_day)
    group by history.profile_id
  ),
  ranked as (
    select
      rank() over (
        order by stats.wins desc, stats.average_score desc, stats.played desc
      )::integer as weekly_rank,
      stats.*
    from weekly_stats stats
    where stats.played > 0
  ),
  projected as (
    select
      ranked.weekly_rank,
      ranked.profile_id,
      profile.display_name,
      profile.initials,
      preference.avatar_photo_data,
      ranked.wins,
      ranked.played,
      ranked.average_score,
      ranked.profile_id = v_profile as is_current_user
    from ranked
    join public.profiles profile
      on profile.id = ranked.profile_id
    left join public.profile_preferences preference
      on preference.profile_id = ranked.profile_id
  )
  select jsonb_build_object(
    'sport', p_sport,
    'week_start', v_week_start,
    'week_end', v_week_end,
    'entries', coalesce(jsonb_agg(jsonb_build_object(
      'rank', weekly_rank,
      'profile_id', profile_id,
      'display_name', display_name,
      'initials', initials,
      'avatar_photo_data', avatar_photo_data,
      'wins', wins,
      'played', played,
      'average_score', average_score,
      'is_current_user', is_current_user
    ) order by weekly_rank, wins desc, average_score desc, played desc, lower(display_name), profile_id), '[]'::jsonb),
    'auction_bonus', v_auction_bonus
  )
  into v_result
  from projected;

  return v_result;
end;
$$;

create or replace function public.acknowledge_my_daily_challenge_weekly_recap(
  p_sport text,
  p_week_start date
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile uuid := auth.uid();
  v_today date := private.daily_challenge_central_day(now());
  v_expected_week_start date;
  v_eligible_start date;
begin
  if v_profile is null then
    raise exception 'sign in required';
  end if;
  if p_sport is null or p_sport not in ('ufc', 'football') then
    raise exception 'unsupported Daily Challenge sport %', coalesce(p_sport, '<null>');
  end if;

  v_expected_week_start := private.daily_challenge_week_start(v_today, p_sport) - 7;
  v_eligible_start := case
    when p_sport = 'football' then date '2026-09-15'
    else date '2026-08-10'
  end;

  if p_week_start is distinct from v_expected_week_start
    or p_week_start < v_eligible_start then
    raise exception 'weekly championship recap is not current';
  end if;

  if not exists (
    select 1
    from private.daily_challenge_history history
    join private.daily_challenge_schedule_versions schedule
      on schedule.version = history.schedule_version
    where history.profile_id = v_profile
      and schedule.sport = p_sport
      and history.central_day between p_week_start and p_week_start + 6
  ) then
    raise exception 'weekly championship recap is unavailable';
  end if;

  insert into private.daily_challenge_weekly_recap_views(
    profile_id,
    sport,
    week_start,
    seen_at
  ) values (
    v_profile,
    p_sport,
    p_week_start,
    now()
  )
  on conflict (profile_id, sport, week_start) do nothing;

  return true;
end;
$$;

revoke all on function public.get_my_daily_challenge_weekly_recap(text)
  from public, anon;
grant execute on function public.get_my_daily_challenge_weekly_recap(text)
  to authenticated;

revoke all on function public.acknowledge_my_daily_challenge_weekly_recap(text, date)
  from public, anon;
grant execute on function public.acknowledge_my_daily_challenge_weekly_recap(text, date)
  to authenticated;

notify pgrst, 'reload schema';
