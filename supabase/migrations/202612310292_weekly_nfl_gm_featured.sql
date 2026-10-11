
-- Official NFL GM Featured competition, October 13–19, 2026.
-- Keep Casual persistence separate; official attempts cannot be rerolled.
create table if not exists private.football_weekly_gm_events (
  week_start date primary key,
  opens_at timestamptz not null,
  closes_at timestamptz not null,
  subject_key text not null default 'nfl-gm-championship',
  constraint football_weekly_gm_valid_window check (closes_at > opens_at)
);
create table if not exists private.football_weekly_gm_attempts (
  week_start date not null references private.football_weekly_gm_events(week_start),
  profile_id uuid not null references public.profiles(id),
  scenario text not null check (scenario in ('elite','young')),
  seed text not null unique,
  state jsonb,
  score numeric(5,1) check (score between 0 and 100),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (week_start, profile_id, scenario),
  constraint football_weekly_gm_state_size check (
    state is null or (jsonb_typeof(state) = 'object' and octet_length(state::text) <= 750000)
  ),
  constraint football_weekly_gm_complete_score check ((completed_at is null and score is null) or (completed_at is not null and score is not null))
);
create index if not exists football_weekly_gm_completed_idx
  on private.football_weekly_gm_attempts (week_start, completed_at)
  where completed_at is not null;
alter table private.football_weekly_gm_events enable row level security;
alter table private.football_weekly_gm_attempts enable row level security;
revoke all on private.football_weekly_gm_events from public, anon, authenticated;
revoke all on private.football_weekly_gm_attempts from public, anon, authenticated;

insert into private.football_weekly_gm_events (week_start,opens_at,closes_at,subject_key)
values (date '2026-10-13', '2026-10-13 00:00:00 America/Chicago'::timestamptz,
        '2026-10-20 00:00:00 America/Chicago'::timestamptz,'nfl-gm-championship')
on conflict (week_start) do nothing;

create or replace function public.get_my_football_weekly_gm()
returns jsonb
language plpgsql stable security definer
set search_path = ''
as $$
declare
  v_profile uuid := auth.uid();
  v_event private.football_weekly_gm_events%rowtype;
begin
  if v_profile is null then raise exception 'sign in required'; end if;
  select * into v_event from private.football_weekly_gm_events
  order by week_start desc limit 1;
  if not found then raise exception 'Weekly GM is not configured'; end if;
  return jsonb_build_object(
    'week_start', v_event.week_start,
    'opens_at', v_event.opens_at,
    'closes_at', v_event.closes_at,
    'status', case when now() < v_event.opens_at then 'upcoming'
               when now() >= v_event.closes_at then 'closed' else 'active' end,
    'attempts', coalesce((
      select jsonb_object_agg(attempt.scenario, jsonb_build_object(
        'seed',attempt.seed,'state',attempt.state,
        'completed',attempt.completed_at is not null,'score',attempt.score
      ))
      from private.football_weekly_gm_attempts attempt
      where attempt.week_start=v_event.week_start and attempt.profile_id=v_profile
    ), '{}'::jsonb),
    'leaderboard', coalesce((
      select jsonb_agg(jsonb_build_object(
        'profile_id', ranked.profile_id, 'display_name',ranked.display_name,
        'elite_score',ranked.elite_score,'young_score',ranked.young_score,
        'total_score',ranked.total_score,'completed_runs',ranked.completed_runs,
        'rank',ranked.rank
      ) order by ranked.rank,ranked.display_name)
      from (
        select rank() over (order by scores.total_score desc)::integer as rank,
          scores.profile_id,profile.display_name,scores.elite_score,scores.young_score,
          scores.total_score,scores.completed_runs
        from (
          select attempt.profile_id,
            max(attempt.score) filter (where attempt.scenario='elite') as elite_score,
            max(attempt.score) filter (where attempt.scenario='young') as young_score,
            sum(attempt.score)::numeric as total_score,
            count(*)::integer as completed_runs
          from private.football_weekly_gm_attempts attempt
          where attempt.week_start=v_event.week_start and attempt.completed_at is not null
          group by attempt.profile_id
        ) scores
        join public.profiles profile on profile.id=scores.profile_id
        where not private.football_weekly_auction_is_reserved_test_profile(scores.profile_id)
      ) ranked
    ),'[]'::jsonb)
  );
end;
$$;

create or replace function public.start_my_football_weekly_gm(p_scenario text)
returns jsonb
language plpgsql volatile security definer
set search_path = ''
as $$
declare
  v_profile uuid := auth.uid();
  v_event private.football_weekly_gm_events%rowtype;
  v_attempt private.football_weekly_gm_attempts%rowtype;
begin
  if v_profile is null then raise exception 'sign in required'; end if;
  if p_scenario not in ('elite','young') or p_scenario is null then raise exception 'invalid Weekly GM scenario'; end if;
  select * into v_event from private.football_weekly_gm_events
    where opens_at <= now() and closes_at > now() order by week_start desc limit 1;
  if not found then raise exception 'Weekly GM is not open'; end if;
  insert into private.football_weekly_gm_attempts (week_start,profile_id,scenario,seed)
  values (v_event.week_start,v_profile,p_scenario,
    'weekly-gm:'||v_event.week_start::text||':'||p_scenario||':'||gen_random_uuid()::text||':gmdev1')
  on conflict (week_start,profile_id,scenario) do nothing;
  select * into v_attempt from private.football_weekly_gm_attempts
    where week_start=v_event.week_start and profile_id=v_profile and scenario=p_scenario;
  return jsonb_build_object(
    'seed',v_attempt.seed,'state',v_attempt.state,
    'completed',v_attempt.completed_at is not null,'score',v_attempt.score
  );
end;
$$;

create or replace function public.save_my_football_weekly_gm(
  p_scenario text, p_seed text, p_state jsonb,
  p_completed boolean default false, p_score numeric default null
)
returns boolean
language plpgsql volatile security definer
set search_path = ''
as $$
declare
  v_profile uuid := auth.uid();
  v_attempt private.football_weekly_gm_attempts%rowtype;
  v_event private.football_weekly_gm_events%rowtype;
  v_spin integer;
  v_previous_spin integer;
begin
  if v_profile is null then raise exception 'sign in required'; end if;
  if p_scenario not in ('elite','young') or p_scenario is null then raise exception 'invalid Weekly GM scenario'; end if;
  select * into v_attempt from private.football_weekly_gm_attempts
    where profile_id=v_profile and scenario=p_scenario and seed=p_seed
    for update;
  if not found then raise exception 'Official attempt not started or seed mismatch'; end if;
  select * into v_event from private.football_weekly_gm_events where week_start=v_attempt.week_start;
  if now() < v_event.opens_at or now() >= v_event.closes_at then raise exception 'Weekly GM entry window closed'; end if;
  if v_attempt.completed_at is not null then return true; end if;
  if p_state is null or jsonb_typeof(p_state)<>'object'
    or octet_length(p_state::text)>750000 then raise exception 'invalid GM state'; end if;
  if p_state->>'seed' is distinct from v_attempt.seed then raise exception 'GM seed mismatch'; end if;
  if p_state->>'version' <> 'football-gm-v11-seeded-development' then raise exception 'GM game version mismatch'; end if;
  if p_state->>'phase' not in ('draft','year1','offseason','years23','final') then raise exception 'Invalid GM phase'; end if;
  if (p_state->>'spinIndex') !~ '^[0-9]+$' then raise exception 'invalid spin count'; end if;
  v_spin := (p_state->>'spinIndex')::integer;
  v_previous_spin := coalesce((v_attempt.state->>'spinIndex')::integer,1);
  if v_attempt.state is null and (
       v_spin <> 1 or p_state->>'phase'<>'draft'
       or jsonb_typeof(p_state->'roster')<>'array'
       or jsonb_array_length(p_state->'roster')<>1
       or p_state->'roster'->0->>'playerId' is distinct from
          case when p_scenario='elite' then 'BUF|QB|joshallen' else 'NYG|QB|jaxsondart' end
     ) then raise exception 'Official draft must begin with the assigned quarterback'; end if;
  if v_spin < v_previous_spin or v_spin < 1 or v_spin > 7 then raise exception 'Official wheel progress cannot rewind'; end if;
  if p_completed then
    if p_state->>'phase'<>'final' or v_spin<>7
      or jsonb_typeof(p_state->'roster')<>'array'
      or jsonb_typeof(p_state->'finalRoster')<>'array'
      or jsonb_typeof(p_state->'resolvedSeasons')<>'array'
      or jsonb_array_length(p_state->'roster')<>7
      or jsonb_array_length(p_state->'finalRoster')<>7
      or jsonb_array_length(p_state->'resolvedSeasons')<>3
      or p_score is null or p_score<0 or p_score>100 then
      raise exception 'Incomplete official GM result';
    end if;
  elsif p_score is not null or p_state->>'phase'='final' then
    raise exception 'Official result must be finalized together';
  end if;
  update private.football_weekly_gm_attempts
  set state=p_state, updated_at=now(),
      score=case when p_completed then round(p_score,1) else null end,
      completed_at=case when p_completed then now() else null end
  where week_start=v_attempt.week_start and profile_id=v_profile and scenario=p_scenario;
  return true;
end;
$$;

create or replace function public.get_football_weekly_gm_result(
  p_scenario text, p_profile_id uuid default null
)
returns jsonb
language plpgsql stable security definer
set search_path = ''
as $$
declare
  v_viewer uuid := auth.uid();
  v_profile uuid := coalesce(p_profile_id,auth.uid());
  v_result jsonb;
begin
  if v_viewer is null then raise exception 'sign in required'; end if;
  if p_scenario not in ('elite','young') then raise exception 'invalid Weekly GM scenario'; end if;
  select jsonb_build_object('display_name',profile.display_name,'score',attempt.score,'state',attempt.state)
  into v_result
  from private.football_weekly_gm_attempts attempt
  join private.football_weekly_gm_events event on event.week_start=attempt.week_start
  join public.profiles profile on profile.id=attempt.profile_id
  where attempt.profile_id=v_profile and attempt.scenario=p_scenario
    and attempt.completed_at is not null
    and now()>=event.opens_at
  order by attempt.week_start desc limit 1;
  if v_result is null then raise exception 'This franchise result is not complete'; end if;
  return v_result;
end;
$$;

revoke all on function public.get_my_football_weekly_gm() from public, anon;
revoke all on function public.start_my_football_weekly_gm(text) from public, anon;
revoke all on function public.save_my_football_weekly_gm(text,text,jsonb,boolean,numeric) from public, anon;
revoke all on function public.get_football_weekly_gm_result(text,uuid) from public, anon;
grant execute on function public.get_my_football_weekly_gm() to authenticated;
grant execute on function public.start_my_football_weekly_gm(text) to authenticated;
grant execute on function public.save_my_football_weekly_gm(text,text,jsonb,boolean,numeric) to authenticated;
grant execute on function public.get_football_weekly_gm_result(text,uuid) to authenticated;

-- Reuse the existing complete Championship projections; add this official Featured event
-- without touching prior Auction results or the 60/30/10 placement ladder.
-- Align all three Championship components to the approved 2026 season windows.
-- Football: 2026-09-15. UFC: 2026-09-07 (first steady Cody/Shane/Troy cohort).
-- Before this fix, Daily/Featured honored start dates but completed Picks did not.
-- No source results, legacy titles, or pre-season pick histories are modified.

create or replace function public.get_sport_championship(
  p_sport text,
  p_season integer default 2026
)
returns jsonb
language plpgsql stable security definer
set search_path = ''
as $$
declare
  v_viewer uuid := auth.uid();
  v_pick_sport text;
  v_daily_start date;
  v_season_end date;
  v_result jsonb;
begin
  if v_viewer is null then
    raise exception 'sign in required';
  end if;
  if p_sport not in ('football', 'ufc') or p_sport is null then
    raise exception 'unsupported Championship sport: %', p_sport;
  end if;
  if p_season is null or p_season not between 2026 and 2100 then
    raise exception 'invalid Championship season: %', p_season;
  end if;

  v_pick_sport := case when p_sport = 'ufc' then 'mma' else 'football' end;
  v_daily_start := case
    when p_season = 2026 and p_sport = 'football' then date '2026-09-15'
    when p_season = 2026 and p_sport = 'ufc' then date '2026-09-07'
    else make_date(p_season, 1, 1)
  end;
  v_season_end := make_date(p_season + 1, 1, 1);

  with
  pick_events as (
    select event_id, starts_at
    from public.pick_events
    where sport = v_pick_sport and season = p_season and status = 'complete'
      and starts_at >= (v_daily_start::timestamp at time zone 'America/Chicago')
  ),
  daily_history as (
    select history.profile_id, history.daily_challenge_id,
           history.central_day, history.game_type,
           history.normalized_score,
           private.daily_challenge_hit_number_distance(
             history.game_type, history.public_result
           ) as hit_number_distance
    from private.daily_challenge_history history
    join private.daily_challenge_schedule_versions schedule
      on schedule.version = history.schedule_version
    where schedule.sport = p_sport
      and history.central_day >= v_daily_start
      and history.central_day < v_season_end
  ),
  daily_events as (
    select distinct daily_challenge_id from daily_history
  ),
  -- The canonical completed Football Featured results can represent successive
  -- formats (CFB team-seasons, NFL Build a QB, etc.). Never subject-key filter.
  featured_events as (
    select week.week_start
    from private.football_weekly_auction_weeks week
    where p_sport = 'football'
      and week.finalized_at is not null
      and not exists (select 1 from private.football_weekly_gm_events gm where gm.week_start=week.week_start)
      and week.week_start >= v_daily_start
      and week.week_start < v_season_end
      and exists (
        select 1 from private.football_weekly_auction_results result
        where result.week_start = week.week_start
          and result.final_rank is not null
          and result.final_score is not null
          and not private.football_weekly_auction_is_reserved_test_profile(result.profile_id)
      )
    union all
    select gm.week_start from private.football_weekly_gm_events gm
    where p_sport='football' and now()>=gm.closes_at
      and gm.week_start >= v_daily_start
      and gm.week_start < v_season_end
      and exists (select 1 from private.football_weekly_gm_attempts attempt
        where attempt.week_start=gm.week_start and attempt.completed_at is not null)
  ),
  -- Only genuine participants are in the Championship field; use the same
  -- eligible field for all three lanes, even on a day some players miss.
  active_profiles as (
    select pick.profile_id
    from public.profile_event_picks pick
    join pick_events event on event.event_id = pick.event_id
    union
    select history.profile_id from daily_history history
    union
    select result.profile_id
    from private.football_weekly_auction_results result
    join featured_events event on event.week_start = result.week_start
    where result.final_score is not null
      and not exists (select 1 from private.football_weekly_gm_events gm where gm.week_start=result.week_start)
    union
    select attempt.profile_id from private.football_weekly_gm_attempts attempt
    join featured_events event on event.week_start=attempt.week_start
    where attempt.completed_at is not null
  ),
  field as (
    select profile.id as profile_id, profile.display_name, profile.initials
    from public.profiles profile
    join active_profiles active on active.profile_id = profile.id
    where not private.football_weekly_auction_is_reserved_test_profile(profile.id)
  ),
  field_count as (
    select count(*)::integer as members from field
  ),
  -- Only players who submitted picks are ranked for the event. A completely
  -- missed card receives the cohort's last-place finish, never zero points.
  pick_entrants as (
    select distinct pick.event_id, pick.profile_id
    from public.profile_event_picks pick
    join pick_events event on event.event_id = pick.event_id
    join field member on member.profile_id = pick.profile_id
  ),
  pick_scores as (
    select entrant.event_id, entrant.profile_id,
      count(*) filter (
        where bout.included_in_picks
          and (
            (p_sport = 'football'
              and selection.fighter_slug is not null
              and public.football_pick_ats_points(
                selection.fighter_slug = bout.home_team_slug,
                bout.home_final_score, bout.away_final_score,
                bout.frozen_spread_home, false
              ) > 0.5)
            or (p_sport = 'ufc'
              and bout.result_status in ('red_win','blue_win')
              and selection.fighter_slug = bout.winner_fighter_slug)
          )
      )::integer as correct,
      case when p_sport = 'football' then
        coalesce(sum(
          case when bout.included_in_picks
            and bout.result_status <> 'cancelled'
            and selection.fighter_slug is not null
          then public.football_pick_ats_points(
            selection.fighter_slug = bout.home_team_slug,
            bout.home_final_score, bout.away_final_score,
            bout.frozen_spread_home, selection.is_lock
          ) else 0 end
        ), 0)::numeric
      else
        (
          4 * count(*) filter (
            where bout.included_in_picks
              and bout.result_status in ('red_win','blue_win')
              and selection.fighter_slug = bout.winner_fighter_slug
          )
          + coalesce(max(public.pick_underdog_bonus(lock.frozen_american_odds))
            filter (
              where bout.included_in_picks
                and lock.fighter_slug = bout.winner_fighter_slug
            ), 0)
        )::numeric
      end as scored_points
    from pick_entrants entrant
    join public.pick_bouts bout on bout.event_id = entrant.event_id
    left join public.profile_event_picks selection
      on selection.profile_id = entrant.profile_id
      and selection.event_id = entrant.event_id
      and selection.bout_id = bout.bout_id
    left join public.profile_event_underdog_locks lock
      on lock.profile_id = entrant.profile_id
      and lock.event_id = entrant.event_id
      and lock.bout_id = bout.bout_id
    group by entrant.event_id, entrant.profile_id
  ),
  pick_ranks as (
    select profile_id, event_id,
      rank() over (partition by event_id
        order by scored_points desc, correct desc)::integer as placement
    from pick_scores
  ),
  daily_ranks as (
    select profile_id, daily_challenge_id,
      rank() over (
        partition by daily_challenge_id
        order by normalized_score desc,
          case when game_type = 'hit_the_number'
            then hit_number_distance else null end asc nulls last
      )::integer as placement
    from daily_history
    where profile_id in (select profile_id from field)
  ),
  featured_ranks as (
    select result.profile_id, result.week_start,
      rank() over (
        partition by result.week_start order by result.final_rank
      )::integer as placement
    from private.football_weekly_auction_results result
    join featured_events event on event.week_start = result.week_start
    join field member on member.profile_id = result.profile_id
    where result.final_score is not null and result.final_rank is not null
      and not exists (select 1 from private.football_weekly_gm_events gm where gm.week_start=result.week_start)
    union all
    select scores.profile_id,scores.week_start,
      rank() over (partition by scores.week_start order by scores.total_score desc)::integer as placement
    from (
      select attempt.profile_id,attempt.week_start,sum(attempt.score) as total_score
      from private.football_weekly_gm_attempts attempt
      where attempt.completed_at is not null
      group by attempt.profile_id,attempt.week_start
    ) scores
    join featured_events event on event.week_start=scores.week_start
    join field member on member.profile_id=scores.profile_id
  ),
  pick_totals as (
    select member.profile_id,
      count(*)::integer as events,
      count(rank.placement)::integer as played,
      coalesce(avg(private.sport_championship_placement_points(
        coalesce(rank.placement, field_count.members)
      )), 0)::numeric as average_points
    from field member
    cross join field_count
    cross join pick_events event
    left join pick_ranks rank
      on rank.profile_id = member.profile_id and rank.event_id = event.event_id
    group by member.profile_id
  ),
  daily_totals as (
    select member.profile_id,
      count(*)::integer as events,
      count(rank.placement)::integer as played,
      coalesce(avg(private.sport_championship_placement_points(
        coalesce(rank.placement, field_count.members)
      )), 0)::numeric as average_points
    from field member
    cross join field_count
    cross join daily_events event
    left join daily_ranks rank
      on rank.profile_id = member.profile_id
      and rank.daily_challenge_id = event.daily_challenge_id
    group by member.profile_id
  ),
  featured_totals as (
    select member.profile_id,
      count(*)::integer as events,
      count(rank.placement)::integer as played,
      coalesce(avg(private.sport_championship_placement_points(
        coalesce(rank.placement, field_count.members)
      )), 0)::numeric as average_points
    from field member
    cross join field_count
    cross join featured_events event
    left join featured_ranks rank
      on rank.profile_id = member.profile_id
      and rank.week_start = event.week_start
    group by member.profile_id
  ),
  counts as (
    select (select count(*)::integer from pick_events) as pick_events,
      (select count(*)::integer from daily_events) as daily_events,
      (select count(*)::integer from featured_events) as featured_events
  ),
  weights as (
    select
      case when pick_events > 0 then 60 else 0 end as picks_weight,
      case when daily_events > 0
        then case when featured_events > 0 then 30 else 40 end
        else 0 end as daily_weight,
      case when featured_events > 0 then
        case when daily_events > 0 then 10 else 40 end
        else 0 end as featured_weight,
      pick_events, daily_events, featured_events
    from counts
  ),
  scored as (
    select member.profile_id, member.display_name, member.initials,
      coalesce(picks.average_points, 0) as picks_rating,
      coalesce(daily.average_points, 0) as daily_rating,
      coalesce(featured.average_points, 0) as featured_rating,
      round(
        (
          coalesce(daily.average_points, 0) * weight.daily_weight
          + coalesce(featured.average_points, 0) * weight.featured_weight
        ) / nullif(weight.daily_weight + weight.featured_weight, 0), 2
      ) as play_rating,
      coalesce(picks.played, 0) as picks_played,
      coalesce(daily.played, 0) as daily_played,
      coalesce(featured.played, 0) as featured_played,
      round(
        (
          coalesce(picks.average_points, 0) * weight.picks_weight
          + coalesce(daily.average_points, 0) * weight.daily_weight
          + coalesce(featured.average_points, 0) * weight.featured_weight
        ) / nullif(
          weight.picks_weight + weight.daily_weight + weight.featured_weight, 0
        ), 2
      ) as championship_rating
    from field member
    cross join weights weight
    left join pick_totals picks on picks.profile_id = member.profile_id
    left join daily_totals daily on daily.profile_id = member.profile_id
    left join featured_totals featured on featured.profile_id = member.profile_id
  ),
  ranked as (
    select scored.*,
      rank() over (order by championship_rating desc)::integer as overall_rank,
      rank() over (order by picks_rating desc)::integer as picks_rank,
      rank() over (order by daily_rating desc)::integer as daily_rank,
      rank() over (order by play_rating desc)::integer as play_rank,
      rank() over (order by featured_rating desc)::integer as featured_rank
    from scored
  ),
  payload as (
    select coalesce(jsonb_agg(jsonb_build_object(
      'profile_id', profile_id,
      'display_name', display_name,
      'initials', initials,
      'is_current_user', profile_id = v_viewer,
      'rank', overall_rank,
      'rating', championship_rating,
      'picks_rating', round(picks_rating, 2),
      'daily_rating', round(daily_rating, 2),
      'featured_rating', round(featured_rating, 2),
      'play_rating', play_rating,
      'picks_rank', picks_rank,
      'daily_rank', daily_rank,
      'featured_rank', featured_rank,
      'play_rank', play_rank,
      'picks_played', picks_played,
      'daily_played', daily_played,
      'featured_played', featured_played,
      'event_results', (
        select coalesce(jsonb_agg(result.item order by result.event_date desc, result.kind), '[]'::jsonb)
        from (
          select ev.starts_at::date as event_date, 'picks' as kind,
            jsonb_build_object(
              'type','picks',
              'date',to_char((ev.starts_at at time zone 'America/Chicago')::date,'YYYY-MM-DD'),
              'label',case when p_sport='football' then 'Football Picks' else 'UFC Picks' end,
              'rank',coalesce(pr.placement,fc.members),
              'points',private.sport_championship_placement_points(coalesce(pr.placement,fc.members)),
              'played',pr.placement is not null,
              'raw_score',ps.scored_points
            ) as item
          from pick_events ev cross join field_count fc
          left join pick_ranks pr on pr.event_id=ev.event_id and pr.profile_id=standing.profile_id
          left join pick_scores ps on ps.event_id=ev.event_id and ps.profile_id=standing.profile_id
          union all
          select d.central_day as event_date, 'daily' as kind,
            jsonb_build_object(
              'type','daily','date',to_char(d.central_day,'YYYY-MM-DD'),
              'label',initcap(replace(d.game_type,'_',' ')),
              'rank',coalesce(dr.placement,fc.members),
              'points',private.sport_championship_placement_points(coalesce(dr.placement,fc.members)),
              'played',dr.placement is not null,
              'raw_score',dh.normalized_score
            ) as item
          from daily_events ev
          cross join field_count fc
          join lateral (
            select anyday.central_day,anyday.game_type
            from daily_history anyday
            where anyday.daily_challenge_id=ev.daily_challenge_id
            limit 1
          ) d on true
          left join daily_ranks dr on dr.daily_challenge_id=ev.daily_challenge_id
            and dr.profile_id=standing.profile_id
          left join daily_history dh on dh.daily_challenge_id=ev.daily_challenge_id
            and dh.profile_id=standing.profile_id
          union all
          select ev.week_start as event_date, 'featured' as kind,
            jsonb_build_object(
              'type','featured','date',to_char(ev.week_start,'YYYY-MM-DD'),
              'label',case when gm_event.week_start is not null then 'NFL GM Championship' else initcap(replace(week.subject_key,'-',' ')) end,
              'rank',coalesce(fr.placement,fc.members),
              'points',private.sport_championship_placement_points(coalesce(fr.placement,fc.members)),
              'played',fr.placement is not null,
              'raw_score',case when gm_event.week_start is not null then gm_total.total_score else ar.final_score end
            ) as item
          from featured_events ev cross join field_count fc
          left join private.football_weekly_auction_weeks week on week.week_start=ev.week_start
          left join private.football_weekly_gm_events gm_event on gm_event.week_start=ev.week_start
          left join featured_ranks fr on fr.week_start=ev.week_start and fr.profile_id=standing.profile_id
          left join private.football_weekly_auction_results ar
            on ar.week_start=ev.week_start and ar.profile_id=standing.profile_id
          left join lateral (
            select sum(attempt.score) as total_score
            from private.football_weekly_gm_attempts attempt
            where attempt.week_start=ev.week_start and attempt.profile_id=standing.profile_id
              and attempt.completed_at is not null
          ) gm_total on true
        ) result
      )
    ) order by overall_rank, display_name, profile_id), '[]'::jsonb) as entries
    from ranked standing
  )
  select jsonb_build_object(
    'sport', p_sport,
    'season', p_season,
    'field_size', (select members from field_count),
    'weights', jsonb_build_object(
      'picks', weights.picks_weight,
      'daily', weights.daily_weight,
      'featured', weights.featured_weight
    ),
    'event_counts', jsonb_build_object(
      'picks', weights.pick_events,
      'daily', weights.daily_events,
      'featured', weights.featured_events
    ),
    'entries', payload.entries,
    'own', (
      select value from jsonb_array_elements(payload.entries) as value
      where value ->> 'profile_id' = v_viewer::text
      limit 1
    )
  ) into v_result
  from payload cross join weights;

  return v_result;
end;
$$;

create or replace function private.sport_championship_week_projection(
  p_sport text,
  p_season integer,
  p_week_start date,
  p_week_end date
)
returns jsonb
language plpgsql stable security definer
set search_path = ''
as $$
declare
  v_viewer uuid := auth.uid();
  v_pick_sport text;
  v_daily_start date;
  v_season_end date;
  v_result jsonb;
begin
  if v_viewer is null then
    raise exception 'sign in required';
  end if;
  if p_sport not in ('football', 'ufc') or p_sport is null then
    raise exception 'unsupported Championship sport: %', p_sport;
  end if;
  if p_season is null or p_season not between 2026 and 2100 then
    raise exception 'invalid Championship season: %', p_season;
  end if;

  v_pick_sport := case when p_sport = 'ufc' then 'mma' else 'football' end;
  v_daily_start := case
    when p_season = 2026 and p_sport = 'football' then date '2026-09-15'
    when p_season = 2026 and p_sport = 'ufc' then date '2026-09-07'
    else make_date(p_season, 1, 1)
  end;
  v_season_end := make_date(p_season + 1, 1, 1);

  with
  pick_events as (
    select event_id, starts_at
    from public.pick_events
    where sport = v_pick_sport and season = p_season and status = 'complete'
      and starts_at >= (greatest(v_daily_start, p_week_start)::timestamp at time zone 'America/Chicago')
      and starts_at < ((p_week_end + 1)::timestamp at time zone 'America/Chicago')
  ),
  daily_history as (
    select history.profile_id, history.daily_challenge_id,
           history.central_day, history.game_type,
           history.normalized_score,
           private.daily_challenge_hit_number_distance(
             history.game_type, history.public_result
           ) as hit_number_distance
    from private.daily_challenge_history history
    join private.daily_challenge_schedule_versions schedule
      on schedule.version = history.schedule_version
    where schedule.sport = p_sport
      and history.central_day >= greatest(v_daily_start, p_week_start)
      and history.central_day <= p_week_end
      and history.central_day < v_season_end
  ),
  daily_events as (
    select distinct daily_challenge_id from daily_history
  ),
  -- The canonical completed Football Featured results can represent successive
  -- formats (CFB team-seasons, NFL Build a QB, etc.). Never subject-key filter.
  featured_events as (
    select week.week_start
    from private.football_weekly_auction_weeks week
    where p_sport = 'football'
      and week.finalized_at is not null
      and not exists (select 1 from private.football_weekly_gm_events gm where gm.week_start=week.week_start)
      and week.week_start >= greatest(v_daily_start, p_week_start)
      and week.week_start <= p_week_end
      and week.week_start < v_season_end
      and exists (
        select 1 from private.football_weekly_auction_results result
        where result.week_start = week.week_start
          and result.final_rank is not null
          and result.final_score is not null
          and not private.football_weekly_auction_is_reserved_test_profile(result.profile_id)
      )
    union all
    select gm.week_start from private.football_weekly_gm_events gm
    where p_sport='football' and now()>=gm.closes_at
      and gm.week_start >= greatest(v_daily_start, p_week_start)
      and gm.week_start <= p_week_end
      and gm.week_start < v_season_end
      and exists (select 1 from private.football_weekly_gm_attempts attempt
        where attempt.week_start=gm.week_start and attempt.completed_at is not null)
  ),
  -- Only genuine participants are in the Championship field; use the same
  -- eligible field for all three lanes, even on a day some players miss.
  active_profiles as (
    -- Freeze the active cohort as of this completed week. A future late joiner
    -- must not retroactively change an already-awarded weekly champion.
    -- Someone who already entered a prior week and misses this one still
    -- receives the cohort's last-place points rather than disappearing.
    select pick.profile_id
    from public.profile_event_picks pick
    join public.pick_events event on event.event_id = pick.event_id
    where event.sport = v_pick_sport and event.season = p_season and event.status = 'complete'
      and event.starts_at >= (v_daily_start::timestamp at time zone 'America/Chicago')
      and event.starts_at < ((p_week_end + 1)::timestamp at time zone 'America/Chicago')
    union
    select history.profile_id
    from private.daily_challenge_history history
    join private.daily_challenge_schedule_versions schedule on schedule.version = history.schedule_version
    where schedule.sport = p_sport
      and history.central_day between v_daily_start and v_season_end - 1
      and history.central_day <= p_week_end
    union
    select result.profile_id
    from private.football_weekly_auction_results result
    join private.football_weekly_auction_weeks week on week.week_start = result.week_start
    where p_sport = 'football'
      and week.finalized_at is not null
      and week.week_start between v_daily_start and v_season_end - 1
      and week.week_start <= p_week_end
      and result.final_score is not null
      and not exists (select 1 from private.football_weekly_gm_events gm where gm.week_start=result.week_start)
    union
    select attempt.profile_id from private.football_weekly_gm_attempts attempt
    join featured_events event on event.week_start=attempt.week_start
    where attempt.completed_at is not null
  ),
  field as (
    select profile.id as profile_id, profile.display_name, profile.initials
    from public.profiles profile
    join active_profiles active on active.profile_id = profile.id
    where not private.football_weekly_auction_is_reserved_test_profile(profile.id)
  ),
  field_count as (
    select count(*)::integer as members from field
  ),
  -- Only players who submitted picks are ranked for the event. A completely
  -- missed card receives the cohort's last-place finish, never zero points.
  pick_entrants as (
    select distinct pick.event_id, pick.profile_id
    from public.profile_event_picks pick
    join pick_events event on event.event_id = pick.event_id
    join field member on member.profile_id = pick.profile_id
  ),
  pick_scores as (
    select entrant.event_id, entrant.profile_id,
      count(*) filter (
        where bout.included_in_picks
          and (
            (p_sport = 'football'
              and selection.fighter_slug is not null
              and public.football_pick_ats_points(
                selection.fighter_slug = bout.home_team_slug,
                bout.home_final_score, bout.away_final_score,
                bout.frozen_spread_home, false
              ) > 0.5)
            or (p_sport = 'ufc'
              and bout.result_status in ('red_win','blue_win')
              and selection.fighter_slug = bout.winner_fighter_slug)
          )
      )::integer as correct,
      case when p_sport = 'football' then
        coalesce(sum(
          case when bout.included_in_picks
            and bout.result_status <> 'cancelled'
            and selection.fighter_slug is not null
          then public.football_pick_ats_points(
            selection.fighter_slug = bout.home_team_slug,
            bout.home_final_score, bout.away_final_score,
            bout.frozen_spread_home, selection.is_lock
          ) else 0 end
        ), 0)::numeric
      else
        (
          4 * count(*) filter (
            where bout.included_in_picks
              and bout.result_status in ('red_win','blue_win')
              and selection.fighter_slug = bout.winner_fighter_slug
          )
          + coalesce(max(public.pick_underdog_bonus(lock.frozen_american_odds))
            filter (
              where bout.included_in_picks
                and lock.fighter_slug = bout.winner_fighter_slug
            ), 0)
        )::numeric
      end as scored_points
    from pick_entrants entrant
    join public.pick_bouts bout on bout.event_id = entrant.event_id
    left join public.profile_event_picks selection
      on selection.profile_id = entrant.profile_id
      and selection.event_id = entrant.event_id
      and selection.bout_id = bout.bout_id
    left join public.profile_event_underdog_locks lock
      on lock.profile_id = entrant.profile_id
      and lock.event_id = entrant.event_id
      and lock.bout_id = bout.bout_id
    group by entrant.event_id, entrant.profile_id
  ),
  pick_ranks as (
    select profile_id, event_id,
      rank() over (partition by event_id
        order by scored_points desc, correct desc)::integer as placement
    from pick_scores
  ),
  daily_ranks as (
    select profile_id, daily_challenge_id,
      rank() over (
        partition by daily_challenge_id
        order by normalized_score desc,
          case when game_type = 'hit_the_number'
            then hit_number_distance else null end asc nulls last
      )::integer as placement
    from daily_history
    where profile_id in (select profile_id from field)
  ),
  featured_ranks as (
    select result.profile_id, result.week_start,
      rank() over (
        partition by result.week_start order by result.final_rank
      )::integer as placement
    from private.football_weekly_auction_results result
    join featured_events event on event.week_start = result.week_start
    join field member on member.profile_id = result.profile_id
    where result.final_score is not null and result.final_rank is not null
      and not exists (select 1 from private.football_weekly_gm_events gm where gm.week_start=result.week_start)
    union all
    select scores.profile_id,scores.week_start,
      rank() over (partition by scores.week_start order by scores.total_score desc)::integer as placement
    from (
      select attempt.profile_id,attempt.week_start,sum(attempt.score) as total_score
      from private.football_weekly_gm_attempts attempt
      where attempt.completed_at is not null
      group by attempt.profile_id,attempt.week_start
    ) scores
    join featured_events event on event.week_start=scores.week_start
    join field member on member.profile_id=scores.profile_id
  ),
  pick_totals as (
    select member.profile_id,
      count(*)::integer as events,
      count(rank.placement)::integer as played,
      coalesce(avg(private.sport_championship_placement_points(
        coalesce(rank.placement, field_count.members)
      )), 0)::numeric as average_points
    from field member
    cross join field_count
    cross join pick_events event
    left join pick_ranks rank
      on rank.profile_id = member.profile_id and rank.event_id = event.event_id
    group by member.profile_id
  ),
  daily_totals as (
    select member.profile_id,
      count(*)::integer as events,
      count(rank.placement)::integer as played,
      coalesce(avg(private.sport_championship_placement_points(
        coalesce(rank.placement, field_count.members)
      )), 0)::numeric as average_points
    from field member
    cross join field_count
    cross join daily_events event
    left join daily_ranks rank
      on rank.profile_id = member.profile_id
      and rank.daily_challenge_id = event.daily_challenge_id
    group by member.profile_id
  ),
  featured_totals as (
    select member.profile_id,
      count(*)::integer as events,
      count(rank.placement)::integer as played,
      coalesce(avg(private.sport_championship_placement_points(
        coalesce(rank.placement, field_count.members)
      )), 0)::numeric as average_points
    from field member
    cross join field_count
    cross join featured_events event
    left join featured_ranks rank
      on rank.profile_id = member.profile_id
      and rank.week_start = event.week_start
    group by member.profile_id
  ),
  counts as (
    select (select count(*)::integer from pick_events) as pick_events,
      (select count(*)::integer from daily_events) as daily_events,
      (select count(*)::integer from featured_events) as featured_events
  ),
  weights as (
    select
      case
        when pick_events > 0 then case when daily_events + featured_events > 0 then 60 else 100 end
        else 0 end as picks_weight,
      case
        when daily_events = 0 then 0
        when pick_events = 0 and featured_events = 0 then 100
        when pick_events = 0 then 75
        when featured_events = 0 then 40
        else 30 end as daily_weight,
      case
        when featured_events = 0 then 0
        when pick_events = 0 and daily_events = 0 then 100
        when pick_events = 0 then 25
        when daily_events = 0 then 40
        else 10 end as featured_weight,
      pick_events, daily_events, featured_events
    from counts
  ),
  scored as (
    select member.profile_id, member.display_name, member.initials,
      coalesce(picks.average_points, 0) as picks_rating,
      coalesce(daily.average_points, 0) as daily_rating,
      coalesce(featured.average_points, 0) as featured_rating,
      round(
        (
          coalesce(daily.average_points, 0) * weight.daily_weight
          + coalesce(featured.average_points, 0) * weight.featured_weight
        ) / nullif(weight.daily_weight + weight.featured_weight, 0), 2
      ) as play_rating,
      coalesce(picks.played, 0) as picks_played,
      coalesce(daily.played, 0) as daily_played,
      coalesce(featured.played, 0) as featured_played,
      round(
        (
          coalesce(picks.average_points, 0) * weight.picks_weight
          + coalesce(daily.average_points, 0) * weight.daily_weight
          + coalesce(featured.average_points, 0) * weight.featured_weight
        ) / nullif(
          weight.picks_weight + weight.daily_weight + weight.featured_weight, 0
        ), 2
      ) as championship_rating
    from field member
    cross join weights weight
    left join pick_totals picks on picks.profile_id = member.profile_id
    left join daily_totals daily on daily.profile_id = member.profile_id
    left join featured_totals featured on featured.profile_id = member.profile_id
  ),
  ranked as (
    select scored.*,
      row_number() over (
        order by championship_rating desc, picks_rating desc, play_rating desc nulls last,
        (picks_played + daily_played + featured_played) desc, profile_id
      )::integer as overall_rank,
      rank() over (order by picks_rating desc)::integer as picks_rank,
      rank() over (order by daily_rating desc)::integer as daily_rank,
      rank() over (order by play_rating desc)::integer as play_rank,
      rank() over (order by featured_rating desc)::integer as featured_rank
    from scored
  ),
  payload as (
    select coalesce(jsonb_agg(jsonb_build_object(
      'profile_id', profile_id,
      'display_name', display_name,
      'initials', initials,
      'is_current_user', profile_id = v_viewer,
      'rank', overall_rank,
      'rating', championship_rating,
      'picks_rating', round(picks_rating, 2),
      'daily_rating', round(daily_rating, 2),
      'featured_rating', round(featured_rating, 2),
      'play_rating', play_rating,
      'picks_rank', picks_rank,
      'daily_rank', daily_rank,
      'featured_rank', featured_rank,
      'play_rank', play_rank,
      'picks_played', picks_played,
      'daily_played', daily_played,
      'featured_played', featured_played
    ) order by overall_rank, display_name, profile_id), '[]'::jsonb) as entries
    from ranked
  )
  select jsonb_build_object(
    'sport', p_sport,
    'season', p_season,
    'field_size', (select members from field_count),
    'weights', jsonb_build_object(
      'picks', weights.picks_weight,
      'daily', weights.daily_weight,
      'featured', weights.featured_weight
    ),
    'event_counts', jsonb_build_object(
      'picks', weights.pick_events,
      'daily', weights.daily_events,
      'featured', weights.featured_events
    ),
    'entries', payload.entries,
    'own', (
      select value from jsonb_array_elements(payload.entries) as value
      where value ->> 'profile_id' = v_viewer::text
      limit 1
    )
  ) into v_result
  from payload cross join weights;

  return v_result;
end;
$$;

create or replace function public.get_sport_championship_weekly(
  p_sport text,
  p_season integer default 2026
) returns jsonb
language plpgsql stable security definer
set search_path = ''
as $$
declare
  v_today date := (now() at time zone 'America/Chicago')::date;
  v_first date;
  v_latest_start date;
  v_week date;
  v_projection jsonb;
  v_weeks jsonb := '[]'::jsonb;
  v_row jsonb;
  v_counts jsonb;
begin
  if auth.uid() is null then raise exception 'sign in required'; end if;
  if p_sport is null or p_sport not in ('football', 'ufc') then
    raise exception 'unsupported sport'; end if;
  if p_season is null or p_season not between 2026 and 2100 then
    raise exception 'invalid season'; end if;

  v_first := case
    when p_sport = 'football' and p_season = 2026 then date '2026-09-15'
    when p_sport = 'ufc' and p_season = 2026 then date '2026-09-07'
    when p_sport = 'football' then (date_trunc('week', make_date(p_season,1,1)::timestamp - interval '1 day') + interval '1 day')::date
    else date_trunc('week', make_date(p_season,1,1)::timestamp)::date
  end;
  v_latest_start := case
    when p_sport = 'football'
      then (date_trunc('week', v_today::timestamp - interval '1 day') + interval '1 day')::date - 7
    else date_trunc('week', v_today::timestamp)::date - 7
  end;
  v_latest_start := least(v_latest_start, make_date(p_season + 1,1,1)-7);
  if v_latest_start < v_first then
    return jsonb_build_object('sport',p_sport,'season',p_season,'latest',null,'weeks',v_weeks);
  end if;

  for v_week in
    select gs::date from generate_series(v_latest_start::timestamp, v_first::timestamp, interval '-7 days') gs
    limit 54
  loop
    v_projection := private.sport_championship_week_projection(p_sport,p_season,v_week,v_week+6);
    v_counts := v_projection -> 'event_counts';
    if coalesce((v_counts->>'picks')::integer,0)
      + coalesce((v_counts->>'daily')::integer,0)
      + coalesce((v_counts->>'featured')::integer,0) > 0
      and jsonb_array_length(v_projection->'entries') > 0 then
      v_row := jsonb_build_object(
        'week_start',v_week,'week_end',v_week+6,
        'winner',(v_projection->'entries')->0,
        'entries',v_projection->'entries',
        'weights',v_projection->'weights',
        'event_counts',v_counts
      );
      v_weeks := v_weeks || jsonb_build_array(v_row);
    end if;
  end loop;
  return jsonb_build_object(
    'sport',p_sport,
    'season',p_season,
    'latest',case when jsonb_array_length(v_weeks)>0 then v_weeks->0 else null end,
    'weeks',v_weeks
  );
end;
$$;

notify pgrst, 'reload schema';


-- October 13–19 belongs to Weekly NFL GM, not the previously staged Impostor
-- rotation. Keep the Impostor architecture for a future manually approved date.
create or replace function public.create_hq_impostor_event(p_member_names text[])
returns jsonb language plpgsql security definer set search_path=''
as $$
begin
  raise exception 'HQ Impostor is paused until a future Featured rotation.';
end;
$$;
comment on function public.create_hq_impostor_event(text[]) is
  'HQ Impostor is deferred; the Oct 13-19, 2026 Featured slot is Weekly NFL GM.';

-- No pre-Daily action is required for GM: players have the full Featured week.
create or replace function public.football_weekly_auction_daily_gate(
  p_profile_id uuid,
  p_at timestamptz default now()
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_week_start date;
  v_day integer;
  v_subject text;
  v_required boolean;
  v_field_locked boolean;
  v_capacity integer:=null;
  v_field_size integer:=null;
begin
  if p_profile_id is null then raise exception 'profile required'; end if;

  if (p_at at time zone 'America/Chicago')::date >= date '2026-10-13'
     and (p_at at time zone 'America/Chicago')::date < date '2026-10-20' then
    return jsonb_build_object(
      'required',false,'available',false,
      'featured_challenge','nfl-gm',
      'week_start',date '2026-10-13'
    );
  end if;

  if (p_at at time zone 'America/Chicago')::date<date '2026-09-15' then
    return jsonb_build_object('required',false,'available',false);
  end if;

  perform private.maintain_football_weekly_auction(p_at);
  v_week_start:=private.football_weekly_auction_week_start(p_at);
  v_day:=private.football_weekly_auction_day_index(p_at,v_week_start);
  perform private.ensure_football_weekly_auction_participant(v_week_start,p_profile_id,p_at);

  select field_locked_at is not null,subject_key
  into v_field_locked,v_subject
  from private.football_weekly_auction_weeks
  where week_start=v_week_start;

  if v_subject='cfb-superteam' then
    v_capacity:=private.football_weekly_superteam_join_capacity(v_week_start,p_at);
    select count(*)::integer into v_field_size
    from private.football_weekly_auction_participants
    where week_start=v_week_start;
  end if;

  if not exists(
    select 1 from private.football_weekly_auction_participants
    where week_start=v_week_start and profile_id=p_profile_id
  ) then
    return jsonb_build_object(
      'required',false,'available',false,'field_locked',v_field_locked,
      'capacity_reached',coalesce(v_capacity is not null and v_field_size>=v_capacity,false),
      'week_start',v_week_start,'day_index',v_day,'eligible_week_start',v_week_start+7
    );
  end if;

  if v_subject='nfl-best-team-seasons-since-2000' and v_day>=7 then
    select not exists(
      select 1
      from private.football_weekly_nfl_team_season_wildcard_submissions
      where week_start=v_week_start and profile_id=p_profile_id
    ) into v_required;
  else
    select not exists(
      select 1 from private.football_weekly_auction_daily_entries
      where week_start=v_week_start and day_index=v_day and profile_id=p_profile_id
    ) into v_required;
  end if;

  return jsonb_build_object(
    'required',v_required,'available',true,'field_locked',v_field_locked,
    'week_start',v_week_start,'day_index',least(greatest(v_day,1),7)
  );
end;
$$;
comment on function public.football_weekly_auction_daily_gate(uuid,timestamptz) is
  'Pre-Daily Featured gate: no daily prerequisite during Oct 13-19 Weekly NFL GM; Auction resumes in later weeks.';
