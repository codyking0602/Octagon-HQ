-- One-time, cross-device weekly Play championship recap for UFC and Football.
-- It is generated from canonical Daily Challenge history and requires no weekly setup.
create table if not exists private.daily_challenge_weekly_recap_views (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  sport text not null check (sport in ('ufc', 'football')),
  week_start date not null,
  acknowledged_at timestamptz not null default now(),
  primary key (profile_id, sport, week_start)
);
revoke all on table private.daily_challenge_weekly_recap_views from public, anon, authenticated;

create or replace function public.get_my_daily_challenge_weekly_recap(
  p_sport text,
  p_at timestamptz default now()
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile uuid := auth.uid();
  v_today date := private.daily_challenge_central_day(p_at);
  v_current_week_start date;
  v_week_start date;
  v_week_end date;
  v_entries jsonb;
  v_auction_bonus jsonb := null;
begin
  if v_profile is null then raise exception 'sign in required'; end if;
  if p_sport is null or p_sport not in ('ufc', 'football') then
    raise exception 'unsupported Daily Challenge sport %', coalesce(p_sport, '<null>');
  end if;

  v_current_week_start := v_today - case
    when p_sport = 'football' then ((extract(isodow from v_today)::integer + 5) % 7)
    else (extract(isodow from v_today)::integer - 1)
  end;
  v_week_start := v_current_week_start - 7;
  v_week_end := v_week_start + 6;

  if (p_sport = 'ufc' and v_week_start < date '2026-08-10')
    or (p_sport = 'football' and v_week_start < date '2026-09-15') then
    return jsonb_build_object('available', false);
  end if;

  -- Only members who completed at least one Daily in this sport/week receive a recap.
  if not exists (
    select 1
    from private.daily_challenge_history history
    join private.daily_challenge_schedule_versions schedule on schedule.version = history.schedule_version
    where history.profile_id = v_profile
      and schedule.sport = p_sport
      and history.central_day between v_week_start and v_week_end
  ) then
    return jsonb_build_object('available', false);
  end if;

  if exists (
    select 1 from private.daily_challenge_weekly_recap_views view
    where view.profile_id = v_profile
      and view.sport = p_sport
      and view.week_start = v_week_start
  ) then
    return jsonb_build_object('available', false);
  end if;

  -- First Football Play read after rollover finalizes due Weekly Auction work,
  -- so the CFB +1 bonus is present without a manual weekly job.
  if p_sport = 'football' then
    perform private.maintain_football_weekly_auction(p_at);
    if not exists (
      select 1 from private.football_weekly_auction_weeks week
      where week.week_start = v_week_start and week.finalized_at is not null
    ) then
      return jsonb_build_object('available', false);
    end if;
  end if;

  with history as (
    select
      source.profile_id,
      source.central_day,
      source.game_type,
      source.normalized_score,
      private.daily_challenge_hit_number_distance(source.game_type, source.public_result) as hit_number_distance
    from private.daily_challenge_history source
    join private.daily_challenge_schedule_versions schedule on schedule.version = source.schedule_version
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
  weekly_stats_base as (
    select
      history.profile_id,
      count(*)::integer as played,
      count(*) filter (
        where history.normalized_score = daily_winners.winning_score
          and (
            history.game_type <> 'hit_the_number'
            or history.hit_number_distance = daily_winners.winning_hit_number_distance
          )
      )::integer as daily_wins,
      round(avg(history.normalized_score)::numeric, 1) as average_score
    from history
    join daily_winners using (central_day)
    group by history.profile_id
  ),
  weekly_stats as (
    select
      base.profile_id,
      base.played,
      (
        base.daily_wins
        + case when p_sport = 'football' and exists (
          select 1
          from private.football_weekly_auction_results auction_result
          join private.football_weekly_auction_weeks auction_week
            on auction_week.week_start = auction_result.week_start
          where auction_result.profile_id = base.profile_id
            and auction_result.week_start = v_week_start
            and auction_result.is_winner
            and auction_week.subject_key = 'cfb-best-teams-since-2000'
        ) then 1 else 0 end
        + case when p_sport = 'football' then coalesce((
          select adjustment.weekly_wins_bonus
          from private.football_daily_transition_adjustments adjustment
          where adjustment.profile_id = base.profile_id
            and adjustment.carry_week_start = v_week_start
        ), 0) else 0 end
      )::integer as wins,
      base.average_score
    from weekly_stats_base base
  ),
  ranked as (
    select
      stats.*,
      rank() over (
        order by stats.wins desc, stats.average_score desc, stats.played desc
      )::integer as weekly_rank
    from weekly_stats stats
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'rank', ranked.weekly_rank,
    'profile_id', ranked.profile_id,
    'display_name', profile.display_name,
    'initials', profile.initials,
    'avatar_photo_data', preference.avatar_photo_data,
    'wins', ranked.wins,
    'played', ranked.played,
    'average_score', ranked.average_score,
    'is_champion', ranked.weekly_rank = 1,
    'is_current_user', ranked.profile_id = v_profile
  ) order by ranked.weekly_rank, profile.display_name, ranked.profile_id), '[]'::jsonb)
  into v_entries
  from ranked
  join public.profiles profile on profile.id = ranked.profile_id
  left join public.profile_preferences preference on preference.profile_id = ranked.profile_id;

  if jsonb_array_length(v_entries) = 0 then
    return jsonb_build_object('available', false);
  end if;

  if p_sport = 'football' then
    select jsonb_build_object(
      'profile_id', result.profile_id,
      'display_name', profile.display_name,
      'wins', 1,
      'label', 'Best CFB Teams Since 2000 Champion'
    )
    into v_auction_bonus
    from private.football_weekly_auction_results result
    join private.football_weekly_auction_weeks week on week.week_start = result.week_start
    join public.profiles profile on profile.id = result.profile_id
    where result.week_start = v_week_start
      and result.is_winner
      and week.subject_key = 'cfb-best-teams-since-2000'
    order by result.final_rank, profile.display_name
    limit 1;
  end if;

  return jsonb_build_object(
    'available', true,
    'sport', p_sport,
    'week_start', v_week_start,
    'week_end', v_week_end,
    'entries', v_entries,
    'auction_bonus', v_auction_bonus
  );
end;
$$;

create or replace function public.acknowledge_my_daily_challenge_weekly_recap(
  p_sport text,
  p_week_start date,
  p_at timestamptz default now()
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile uuid := auth.uid();
  v_payload jsonb;
begin
  if v_profile is null then raise exception 'sign in required'; end if;
  if p_sport is null or p_sport not in ('ufc', 'football') then
    raise exception 'unsupported Daily Challenge sport %', coalesce(p_sport, '<null>');
  end if;

  if exists (
    select 1 from private.daily_challenge_weekly_recap_views view
    where view.profile_id = v_profile
      and view.sport = p_sport
      and view.week_start = p_week_start
  ) then
    return jsonb_build_object('available', false);
  end if;

  v_payload := public.get_my_daily_challenge_weekly_recap(p_sport, p_at);
  if coalesce((v_payload ->> 'available')::boolean, false) is not true
    or (v_payload ->> 'week_start')::date is distinct from p_week_start then
    raise exception 'weekly championship recap is unavailable';
  end if;

  insert into private.daily_challenge_weekly_recap_views(profile_id, sport, week_start, acknowledged_at)
  values (v_profile, p_sport, p_week_start, p_at)
  on conflict (profile_id, sport, week_start)
  do update set acknowledged_at = excluded.acknowledged_at;

  return jsonb_build_object('available', false);
end;
$$;

revoke all on function public.get_my_daily_challenge_weekly_recap(text,timestamptz) from public, anon;
grant execute on function public.get_my_daily_challenge_weekly_recap(text,timestamptz) to authenticated;
revoke all on function public.acknowledge_my_daily_challenge_weekly_recap(text,date,timestamptz) from public, anon;
grant execute on function public.acknowledge_my_daily_challenge_weekly_recap(text,date,timestamptz) to authenticated;

do $weekly_recap_contract$
declare v_definition text;
begin
  select pg_get_functiondef('public.get_my_daily_challenge_weekly_recap(text,timestamptz)'::regprocedure)
  into v_definition;
  if position('private.daily_challenge_hit_number_distance' in v_definition) = 0
    or position('private.football_daily_transition_adjustments' in v_definition) = 0
    or position('private.football_weekly_auction_results' in v_definition) = 0
    or position('auction_week.subject_key = ''cfb-best-teams-since-2000''' in v_definition) = 0
    or position('private.daily_challenge_weekly_recap_views' in v_definition) = 0 then
    raise exception 'Weekly Play championship recap canonical scoring contract drifted';
  end if;
end
$weekly_recap_contract$;

notify pgrst, 'reload schema';
