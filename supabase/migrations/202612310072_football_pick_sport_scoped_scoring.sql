drop function if exists public.get_my_pick_summary(integer);
create function public.get_my_pick_summary(
  p_season integer default null,
  p_sport text default 'mma'
)
returns table(
  correct integer,
  incorrect integer,
  pending integer,
  events_entered integer,
  base_points numeric,
  lock_bonus numeric,
  total_points numeric
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if p_sport not in ('mma','football') then
    raise exception 'unsupported Picks sport';
  end if;

  return query
  with scored as (
    select
      event.event_id,
      bout.result_status,
      bout.winner_fighter_slug,
      pick.fighter_slug,
      lock.bout_id = pick.bout_id
        and lock.fighter_slug = pick.fighter_slug
        and lock.fighter_slug = bout.winner_fighter_slug as ufc_lock_won,
      lock.frozen_american_odds,
      case when p_sport = 'football' then
        public.football_pick_ats_points(
          pick.fighter_slug = bout.home_team_slug,
          bout.home_final_score,
          bout.away_final_score,
          bout.frozen_spread_home,
          false
        )
      end as football_base_points,
      case when p_sport = 'football' then
        public.football_pick_ats_points(
          pick.fighter_slug = bout.home_team_slug,
          bout.home_final_score,
          bout.away_final_score,
          bout.frozen_spread_home,
          pick.is_lock
        )
      end as football_points
    from public.profile_event_picks pick
    join public.pick_events event on event.event_id = pick.event_id
    join public.pick_bouts bout
      on bout.event_id = pick.event_id
     and bout.bout_id = pick.bout_id
    left join public.profile_event_underdog_locks lock
      on lock.profile_id = pick.profile_id
     and lock.event_id = pick.event_id
    where pick.profile_id = auth.uid()
      and event.sport = p_sport
      and bout.included_in_picks
      and (p_season is null or event.season = p_season)
  ),
  totals as (
    select
      case when p_sport = 'football' then
        count(*) filter (where football_base_points > 0.5)::integer
      else
        count(*) filter (
          where result_status in ('red_win','blue_win')
            and winner_fighter_slug = fighter_slug
        )::integer
      end as correct,
      case when p_sport = 'football' then
        count(*) filter (where football_base_points = 0)::integer
      else
        count(*) filter (
          where result_status in ('red_win','blue_win')
            and winner_fighter_slug <> fighter_slug
        )::integer
      end as incorrect,
      case when p_sport = 'football' then
        count(*) filter (where football_base_points is null and result_status <> 'cancelled')::integer
      else
        count(*) filter (where result_status = 'pending')::integer
      end as pending,
      count(distinct event_id)::integer as events_entered,
      case when p_sport = 'football' then
        coalesce(sum(football_base_points), 0)::numeric
      else
        (4 * count(*) filter (
          where result_status in ('red_win','blue_win')
            and winner_fighter_slug = fighter_slug
        ))::numeric
      end as base_points,
      case when p_sport = 'football' then
        coalesce(sum(football_points - football_base_points), 0)::numeric
      else
        coalesce(
          sum(public.pick_underdog_bonus(frozen_american_odds)) filter (where ufc_lock_won),
          0
        )::numeric
      end as lock_bonus
    from scored
  )
  select totals.correct, totals.incorrect, totals.pending, totals.events_entered,
    totals.base_points, totals.lock_bonus, totals.base_points + totals.lock_bonus
  from totals;
end;
$$;

revoke all on function public.get_my_pick_summary(integer,text) from public, anon;
grant execute on function public.get_my_pick_summary(integer,text) to authenticated, service_role;

drop function if exists public.get_my_pick_history(integer);
drop function if exists private.get_my_pick_history_core(integer);

create function private.get_my_pick_history_core(
  p_season integer default null,
  p_sport text default 'mma'
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
with personal_bouts as (
  select
    event.*,
    bout.bout_id,
    bout.position,
    bout.weight_class,
    bout.red_fighter_slug,
    bout.red_fighter_name,
    bout.blue_fighter_slug,
    bout.blue_fighter_name,
    bout.result_status,
    bout.winner_fighter_slug,
    bout.included_in_picks,
    pick.fighter_slug picked_fighter_slug,
    pick.is_lock,
    case when p_sport = 'football' and pick.fighter_slug is not null then
      public.football_pick_ats_points(
        pick.fighter_slug = bout.home_team_slug,
        bout.home_final_score,
        bout.away_final_score,
        bout.frozen_spread_home,
        false
      )
    end as football_base_points,
    case when p_sport = 'football' and pick.fighter_slug is not null then
      public.football_pick_ats_points(
        pick.fighter_slug = bout.home_team_slug,
        bout.home_final_score,
        bout.away_final_score,
        bout.frozen_spread_home,
        pick.is_lock
      )
    end as football_points,
    case
      when not bout.included_in_picks then 'excluded'
      when p_sport = 'football' and bout.result_status = 'cancelled' then 'excluded'
      when p_sport = 'football' and (bout.home_final_score is null or bout.away_final_score is null) then 'pending'
      when p_sport = 'football' and pick.fighter_slug is null then 'missing'
      when p_sport = 'football' and public.football_pick_ats_points(
        pick.fighter_slug = bout.home_team_slug,
        bout.home_final_score,
        bout.away_final_score,
        bout.frozen_spread_home,
        false
      ) = 0.5 then 'push'
      when p_sport = 'football' and public.football_pick_ats_points(
        pick.fighter_slug = bout.home_team_slug,
        bout.home_final_score,
        bout.away_final_score,
        bout.frozen_spread_home,
        false
      ) > 0.5 then 'correct'
      when p_sport = 'football' then 'incorrect'
      when bout.result_status in ('draw','no_contest','cancelled') then 'excluded'
      when bout.result_status = 'pending' then 'pending'
      when pick.fighter_slug is null then 'missing'
      when pick.fighter_slug = bout.winner_fighter_slug then 'correct'
      else 'incorrect'
    end verdict
  from public.pick_events event
  join public.pick_bouts bout on bout.event_id = event.event_id
  left join public.profile_event_picks pick
    on pick.profile_id = auth.uid()
   and pick.event_id = bout.event_id
   and pick.bout_id = bout.bout_id
  where auth.uid() is not null
    and event.status = 'complete'
    and event.sport = p_sport
    and (p_season is null or event.season = p_season)
),
personal_events as (
  select
    b.event_id,b.name,b.subtitle,b.venue,b.location,b.starts_at,b.season,b.completed_at,b.sport,
    count(*) filter (where verdict = 'correct')::integer correct,
    count(*) filter (where verdict = 'incorrect')::integer incorrect,
    count(*) filter (where verdict = 'push')::integer pushes,
    count(*) filter (where verdict = 'missing')::integer missing,
    count(*) filter (where verdict = 'excluded')::integer excluded,
    case when b.sport = 'football' then coalesce(sum(b.football_base_points), 0)::numeric
      else (4 * count(*) filter (where verdict = 'correct'))::numeric end base_points,
    case when b.sport = 'football' then
      coalesce(sum(b.football_points - b.football_base_points), 0)::numeric
      else coalesce(max(public.pick_underdog_bonus(lock.frozen_american_odds)) filter (
        where b.included_in_picks and lock.bout_id = b.bout_id and lock.fighter_slug = b.winner_fighter_slug
      ), 0)::numeric end lock_bonus,
    bool_or(b.included_in_picks and b.picked_fighter_slug is not null) entered,
    case when b.sport = 'football' or lock.event_id is null then null else jsonb_build_object(
      'event_id',lock.event_id,'bout_id',lock.bout_id,'fighter_slug',lock.fighter_slug,
      'selected_at',lock.selected_at,'frozen_american_odds',lock.frozen_american_odds
    ) end underdog_lock,
    jsonb_agg(jsonb_build_object(
      'bout_id',b.bout_id,'position',b.position,'weight_class',b.weight_class,
      'red_fighter_slug',b.red_fighter_slug,'red_fighter_name',b.red_fighter_name,
      'blue_fighter_slug',b.blue_fighter_slug,'blue_fighter_name',b.blue_fighter_name,
      'result_status',b.result_status,'winner_fighter_slug',b.winner_fighter_slug,
      'picked_fighter_slug',b.picked_fighter_slug,'verdict',b.verdict,
      'included_in_picks',b.included_in_picks,'group_picks',public.resolved_bout_group_picks(b.event_id,b.bout_id)
    ) order by b.position) bouts
  from personal_bouts b
  left join public.profile_event_underdog_locks lock
    on lock.profile_id = auth.uid() and lock.event_id = b.event_id
  group by b.event_id,b.name,b.subtitle,b.venue,b.location,b.starts_at,b.season,b.completed_at,b.sport,
    lock.event_id,lock.bout_id,lock.fighter_slug,lock.selected_at,lock.frozen_american_odds
),
entered_profiles as (
  select distinct pick.profile_id
  from public.profile_event_picks pick
  join public.pick_events event on event.event_id = pick.event_id
  where event.sport = p_sport and (p_season is null or event.season = p_season)
),
entrants as (
  select distinct pick.event_id,pick.profile_id
  from public.profile_event_picks pick
  join public.pick_events event on event.event_id = pick.event_id
  where event.status = 'complete' and event.sport = p_sport
    and (p_season is null or event.season = p_season)
  union
  select event.event_id,member.profile_id
  from entered_profiles member
  join public.pick_events event on event.status = 'complete' and event.sport = 'football'
    and (p_season is null or event.season = p_season)
  where p_sport = 'football'
),
group_scores as (
  select
    entrant.event_id,entrant.profile_id,profile.display_name,event.name event_name,event.starts_at,
    count(*) filter (where bout.included_in_picks and (
      (p_sport = 'football' and pick.fighter_slug is not null and public.football_pick_ats_points(
        pick.fighter_slug = bout.home_team_slug,bout.home_final_score,bout.away_final_score,bout.frozen_spread_home,false
      ) > 0.5)
      or (p_sport = 'mma' and bout.result_status in ('red_win','blue_win') and pick.fighter_slug = bout.winner_fighter_slug)
    ))::integer correct,
    count(*) filter (where bout.included_in_picks and (
      (p_sport = 'football' and pick.fighter_slug is not null and public.football_pick_ats_points(
        pick.fighter_slug = bout.home_team_slug,bout.home_final_score,bout.away_final_score,bout.frozen_spread_home,false
      ) = 0)
      or (p_sport = 'mma' and bout.result_status in ('red_win','blue_win') and pick.fighter_slug is not null and pick.fighter_slug <> bout.winner_fighter_slug)
    ))::integer incorrect,
    count(*) filter (where p_sport = 'football' and bout.included_in_picks and pick.fighter_slug is not null
      and public.football_pick_ats_points(
        pick.fighter_slug = bout.home_team_slug,bout.home_final_score,bout.away_final_score,bout.frozen_spread_home,false
      ) = 0.5)::integer pushes,
    count(*) filter (where bout.included_in_picks and (
      (p_sport = 'football' and bout.result_status <> 'cancelled' and bout.home_final_score is not null
        and bout.away_final_score is not null and pick.fighter_slug is null)
      or (p_sport = 'mma' and bout.result_status in ('red_win','blue_win') and pick.fighter_slug is null)
    ))::integer missing,
    count(*) filter (where not bout.included_in_picks
      or (p_sport = 'football' and bout.result_status = 'cancelled')
      or (p_sport = 'mma' and bout.result_status in ('draw','no_contest','cancelled')))::integer excluded,
    case when p_sport = 'football' then coalesce(sum(case
      when bout.included_in_picks and bout.result_status <> 'cancelled' and pick.fighter_slug is not null then
        public.football_pick_ats_points(
          pick.fighter_slug = bout.home_team_slug,bout.home_final_score,bout.away_final_score,bout.frozen_spread_home,false
        ) else 0 end),0)::numeric
      else (4 * count(*) filter (where bout.included_in_picks and bout.result_status in ('red_win','blue_win')
        and pick.fighter_slug = bout.winner_fighter_slug))::numeric end base_points,
    case when p_sport = 'football' then coalesce(sum(case
      when bout.included_in_picks and bout.result_status <> 'cancelled' and pick.fighter_slug is not null then
        public.football_pick_ats_points(
          pick.fighter_slug = bout.home_team_slug,bout.home_final_score,bout.away_final_score,bout.frozen_spread_home,pick.is_lock
        ) - public.football_pick_ats_points(
          pick.fighter_slug = bout.home_team_slug,bout.home_final_score,bout.away_final_score,bout.frozen_spread_home,false
        ) else 0 end),0)::numeric
      else coalesce(max(public.pick_underdog_bonus(lock.frozen_american_odds)) filter (
        where bout.included_in_picks and lock.fighter_slug = bout.winner_fighter_slug
      ),0)::numeric end lock_bonus,
    bool_or(bout.included_in_picks and pick.fighter_slug is not null) entered
  from entrants entrant
  join public.profiles profile on profile.id = entrant.profile_id
  join public.pick_events event on event.event_id = entrant.event_id
  join public.pick_bouts bout on bout.event_id = entrant.event_id
  left join public.profile_event_picks pick
    on pick.profile_id = entrant.profile_id and pick.event_id = entrant.event_id and pick.bout_id = bout.bout_id
  left join public.profile_event_underdog_locks lock
    on lock.profile_id = entrant.profile_id and lock.event_id = entrant.event_id and lock.bout_id = bout.bout_id
  group by entrant.event_id,entrant.profile_id,profile.display_name,event.name,event.starts_at
),
group_totals as (select *,base_points + lock_bonus total_points from group_scores),
ranked as (
  select *,rank() over (partition by event_id order by total_points desc,correct desc)::integer rank
  from group_totals
),
event_standings as (
  select event_id,jsonb_agg(jsonb_build_object(
    'rank',rank,'profile_id',profile_id,'display_name',display_name,'correct',correct,'incorrect',incorrect,
    'missing',missing,'excluded',excluded,'base_points',base_points,'lock_bonus',lock_bonus,
    'total_points',total_points,'is_current_user',profile_id = auth.uid()
  ) order by rank,display_name) items
  from ranked group by event_id
),
season_scores as (
  select profile_id,display_name,count(*) filter (where entered)::integer events_entered,
    coalesce(sum(correct),0)::integer correct,coalesce(sum(incorrect),0)::integer incorrect,
    coalesce(sum(pushes),0)::integer pushes,coalesce(sum(missing),0)::integer missing,
    coalesce(sum(excluded),0)::integer excluded,coalesce(sum(base_points),0)::numeric base_points,
    coalesce(sum(lock_bonus),0)::numeric lock_bonus
  from group_totals group by profile_id,display_name
),
drop_candidates as (
  select profile_id,event_id,event_name,total_points,
    row_number() over (partition by profile_id order by total_points asc,starts_at asc,event_id asc) rn
  from group_totals where p_sport = 'football'
),
season_rank_input as (
  select score.*,score.base_points + score.lock_bonus raw_points,
    case when p_sport = 'football' then score.base_points + score.lock_bonus - coalesce(drop_week.total_points,0)
      else score.base_points + score.lock_bonus end adjusted_points,
    case when p_sport = 'football' then drop_week.event_name else null end dropped_week_label
  from season_scores score
  left join drop_candidates drop_week on drop_week.profile_id = score.profile_id and drop_week.rn = 1
),
season_ranked as (
  select *,rank() over (order by adjusted_points desc)::integer rank from season_rank_input
),
season_standings as (
  select coalesce(jsonb_agg(jsonb_build_object(
    'rank',rank,'profile_id',profile_id,'display_name',display_name,'correct',correct,'incorrect',incorrect,
    'pushes',pushes,'missing',missing,'excluded',excluded,'events_entered',events_entered,
    'base_points',base_points,'lock_bonus',lock_bonus,'total_points',raw_points,
    'adjusted_points',adjusted_points,'dropped_week_label',dropped_week_label,
    'is_current_user',profile_id = auth.uid()
  ) order by rank,display_name),'[]'::jsonb) items
  from season_ranked
),
season as (
  select coalesce(sum(correct),0)::integer correct,coalesce(sum(incorrect),0)::integer incorrect,
    coalesce(sum(missing),0)::integer missing,coalesce(sum(excluded),0)::integer excluded,
    count(*) filter (where entered)::integer events_entered,coalesce(sum(base_points),0)::numeric base_points,
    coalesce(sum(lock_bonus),0)::numeric lock_bonus
  from personal_events
),
events as (
  select coalesce(jsonb_agg(jsonb_build_object(
    'event_id',event.event_id,'name',event.name,'subtitle',event.subtitle,'venue',event.venue,
    'location',event.location,'starts_at',event.starts_at,'season',event.season,'completed_at',event.completed_at,
    'record',jsonb_build_object('correct',event.correct,'incorrect',event.incorrect,'missing',event.missing,
      'excluded',event.excluded,'base_points',event.base_points,'lock_bonus',event.lock_bonus,
      'total_points',event.base_points + event.lock_bonus),
    'underdog_lock',event.underdog_lock,'bouts',event.bouts,
    'group_results',coalesce(standing.items,'[]'::jsonb)
  ) order by event.starts_at desc),'[]'::jsonb) items
  from personal_events event left join event_standings standing on standing.event_id = event.event_id
)
select jsonb_build_object(
  'season',p_season,
  'summary',jsonb_build_object('correct',season.correct,'incorrect',season.incorrect,'missing',season.missing,
    'excluded',season.excluded,'events_entered',season.events_entered,'base_points',season.base_points,
    'lock_bonus',season.lock_bonus,'total_points',season.base_points + season.lock_bonus),
  'season_standings',standings.items,'events',events.items
)
from season cross join season_standings standings cross join events;
$$;

revoke all on function private.get_my_pick_history_core(integer,text) from public, anon, authenticated;
grant execute on function private.get_my_pick_history_core(integer,text) to service_role;

create function public.get_my_pick_history(
  p_season integer default null,
  p_sport text default 'mma'
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare v_history jsonb; v_events jsonb;
begin
  if p_sport not in ('mma','football') then raise exception 'unsupported Picks sport'; end if;
  v_history := private.get_my_pick_history_core(p_season,p_sport);
  select coalesce(jsonb_agg(
    item.value || jsonb_build_object(
      'watch_moments',case when p_sport = 'mma' then coalesce(event.watch_moments,'[]'::jsonb) else '[]'::jsonb end,
      'header_storage_path',event.header_storage_path,'header_natural_width',event.header_natural_width,
      'header_natural_height',event.header_natural_height
    ) order by item.ordinality
  ),'[]'::jsonb)
  into v_events
  from jsonb_array_elements(coalesce(v_history->'events','[]'::jsonb)) with ordinality as item(value,ordinality)
  left join public.pick_events event on event.event_id = item.value->>'event_id';
  return jsonb_set(v_history,'{events}',v_events,true);
end;
$$;

revoke all on function public.get_my_pick_history(integer,text) from public, anon;
grant execute on function public.get_my_pick_history(integer,text) to authenticated, service_role;

notify pgrst, 'reload schema';
