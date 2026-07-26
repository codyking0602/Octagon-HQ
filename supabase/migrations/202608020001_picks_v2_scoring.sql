-- Picks V2 scoring: service-owned odds, one mutable pre-lock underdog selection,
-- immutable lock-time odds, and authoritative point projections.
alter table public.pick_bouts
  add column if not exists red_american_odds integer,
  add column if not exists blue_american_odds integer,
  add column if not exists odds_source text,
  add column if not exists odds_updated_at timestamptz;

alter table public.pick_bouts drop constraint if exists pick_bout_red_american_odds;
alter table public.pick_bouts add constraint pick_bout_red_american_odds
  check (red_american_odds is null or red_american_odds <= -100 or red_american_odds >= 100);
alter table public.pick_bouts drop constraint if exists pick_bout_blue_american_odds;
alter table public.pick_bouts add constraint pick_bout_blue_american_odds
  check (blue_american_odds is null or blue_american_odds <= -100 or blue_american_odds >= 100);
alter table public.pick_bouts drop constraint if exists pick_bout_odds_provenance;
alter table public.pick_bouts add constraint pick_bout_odds_provenance check (
  (red_american_odds is null and blue_american_odds is null and odds_source is null and odds_updated_at is null)
  or (odds_source is not null and length(trim(odds_source)) > 0 and odds_updated_at is not null)
);

create table if not exists public.profile_event_underdog_locks (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  event_id text not null references public.pick_events(event_id) on delete cascade,
  bout_id text not null,
  fighter_slug text not null,
  selected_at timestamptz not null default now(),
  frozen_american_odds integer,
  frozen_at timestamptz,
  primary key (profile_id, event_id),
  foreign key (profile_id, event_id, bout_id)
    references public.profile_event_picks(profile_id, event_id, bout_id) on delete cascade,
  foreign key (event_id, bout_id)
    references public.pick_bouts(event_id, bout_id) on delete cascade,
  constraint underdog_lock_frozen_odds check (frozen_american_odds is null or frozen_american_odds >= 100),
  constraint underdog_lock_freeze_shape check ((frozen_american_odds is null) = (frozen_at is null))
);

alter table public.profile_event_underdog_locks enable row level security;
revoke all on table public.profile_event_underdog_locks from public, anon, authenticated;

create or replace function public.get_my_event_underdog_lock(p_event_id text)
returns table (event_id text, bout_id text, fighter_slug text, selected_at timestamptz, frozen_american_odds integer)
language sql stable security definer set search_path = '' as $$
  select lock.event_id, lock.bout_id, lock.fighter_slug, lock.selected_at, lock.frozen_american_odds
  from public.profile_event_underdog_locks lock
  where lock.profile_id = auth.uid() and lock.event_id = lower(trim(p_event_id));
$$;
revoke all on function public.get_my_event_underdog_lock(text) from public, anon;
grant execute on function public.get_my_event_underdog_lock(text) to authenticated;

create or replace function public.set_my_event_underdog_lock(p_event_id text, p_bout_id text, p_fighter_slug text)
returns public.profile_event_underdog_locks
language plpgsql security definer set search_path = '' as $$
declare
  v_profile_id uuid := auth.uid();
  v_event public.pick_events;
  v_bout public.pick_bouts;
  v_pick public.profile_event_picks;
  v_odds integer;
  v_row public.profile_event_underdog_locks;
begin
  if v_profile_id is null then raise exception 'authentication required'; end if;
  select * into v_event from public.pick_events where event_id = lower(trim(p_event_id)) for update;
  if not found then raise exception 'event not found'; end if;
  if v_event.status <> 'upcoming' or now() >= v_event.locks_at then raise exception 'underdog lock is closed'; end if;
  select * into v_bout from public.pick_bouts
    where event_id = v_event.event_id and bout_id = lower(trim(p_bout_id));
  if not found then raise exception 'bout not found'; end if;
  select * into v_pick from public.profile_event_picks
    where profile_id = v_profile_id and event_id = v_event.event_id and bout_id = v_bout.bout_id;
  if not found or v_pick.fighter_slug <> lower(trim(p_fighter_slug)) then
    raise exception 'underdog lock must match your current pick';
  end if;
  v_odds := case v_pick.fighter_slug
    when v_bout.red_fighter_slug then v_bout.red_american_odds
    when v_bout.blue_fighter_slug then v_bout.blue_american_odds
  end;
  if v_odds is null or v_odds < 100 then raise exception 'underdog lock requires positive American odds'; end if;
  insert into public.profile_event_underdog_locks(profile_id,event_id,bout_id,fighter_slug,selected_at)
  values(v_profile_id,v_event.event_id,v_bout.bout_id,v_pick.fighter_slug,now())
  on conflict(profile_id,event_id) do update set
    bout_id=excluded.bout_id, fighter_slug=excluded.fighter_slug, selected_at=now(),
    frozen_american_odds=null, frozen_at=null
  returning * into v_row;
  return v_row;
end $$;
revoke all on function public.set_my_event_underdog_lock(text,text,text) from public, anon;
grant execute on function public.set_my_event_underdog_lock(text,text,text) to authenticated;

create or replace function public.clear_my_event_underdog_lock(p_event_id text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_event public.pick_events;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  select * into v_event from public.pick_events where event_id=lower(trim(p_event_id)) for update;
  if not found then raise exception 'event not found'; end if;
  if v_event.status <> 'upcoming' or now() >= v_event.locks_at then raise exception 'underdog lock is closed'; end if;
  delete from public.profile_event_underdog_locks where profile_id=auth.uid() and event_id=v_event.event_id;
end $$;
revoke all on function public.clear_my_event_underdog_lock(text) from public, anon;
grant execute on function public.clear_my_event_underdog_lock(text) to authenticated;

-- Updating a pick away from the selected lock removes the now-invalid lock.
create or replace function public.clear_mismatched_underdog_lock()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  delete from public.profile_event_underdog_locks
  where profile_id=new.profile_id and event_id=new.event_id and bout_id=new.bout_id
    and fighter_slug <> new.fighter_slug and frozen_at is null;
  return new;
end $$;
drop trigger if exists clear_mismatched_underdog_lock on public.profile_event_picks;
create trigger clear_mismatched_underdog_lock after update of fighter_slug on public.profile_event_picks
for each row execute function public.clear_mismatched_underdog_lock();
revoke all on function public.clear_mismatched_underdog_lock() from public, anon, authenticated;

-- The clock, not a later status update, is the odds mutation boundary. This
-- preserves the final pre-lock line even when the trusted event transition runs late.
create or replace function public.prevent_locked_pick_bout_odds_changes()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_event public.pick_events;
begin
  select * into v_event from public.pick_events where event_id = old.event_id;
  if not found then raise exception 'event not found'; end if;
  if (v_event.status <> 'upcoming' or now() >= v_event.locks_at)
    and (
      new.red_american_odds is distinct from old.red_american_odds
      or new.blue_american_odds is distinct from old.blue_american_odds
      or new.odds_source is distinct from old.odds_source
      or new.odds_updated_at is distinct from old.odds_updated_at
    ) then
    raise exception 'odds are locked for this event';
  end if;
  return new;
end $$;
drop trigger if exists prevent_locked_pick_bout_odds_changes on public.pick_bouts;
create trigger prevent_locked_pick_bout_odds_changes
before update of red_american_odds, blue_american_odds, odds_source, odds_updated_at on public.pick_bouts
for each row execute function public.prevent_locked_pick_bout_odds_changes();
revoke all on function public.prevent_locked_pick_bout_odds_changes() from public, anon, authenticated;

-- The canonical transition copies the final line that was allowed before
-- locks_at. A selected fighter that is no longer a positive-odds underdog keeps
-- the selection for history but receives no frozen odds and therefore no bonus.
create or replace function public.freeze_pick_event_underdog_odds()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if old.status='upcoming' and new.status='locked' then
    update public.profile_event_underdog_locks lock set
      frozen_american_odds = case
        when lock.fighter_slug = bout.red_fighter_slug and bout.red_american_odds >= 100 then bout.red_american_odds
        when lock.fighter_slug = bout.blue_fighter_slug and bout.blue_american_odds >= 100 then bout.blue_american_odds
        else null
      end,
      frozen_at = case
        when lock.fighter_slug = bout.red_fighter_slug and bout.red_american_odds >= 100 then new.locks_at
        when lock.fighter_slug = bout.blue_fighter_slug and bout.blue_american_odds >= 100 then new.locks_at
        else null
      end
    from public.pick_bouts bout
    where lock.event_id=new.event_id and bout.event_id=lock.event_id and bout.bout_id=lock.bout_id
      and lock.frozen_at is null;
  end if;
  return new;
end $$;
drop trigger if exists freeze_pick_event_underdog_odds on public.pick_events;
create trigger freeze_pick_event_underdog_odds after update of status on public.pick_events
for each row execute function public.freeze_pick_event_underdog_odds();
revoke all on function public.freeze_pick_event_underdog_odds() from public, anon, authenticated;

create or replace function public.pick_underdog_bonus(p_odds integer)
returns integer language sql immutable parallel safe set search_path = '' as $$
  select case when p_odds < 100 or p_odds is null then 0
    else least(7, ((p_odds - 100) / 50) + 1) end;
$$;
revoke all on function public.pick_underdog_bonus(integer) from public, anon, authenticated;

create or replace function public.get_current_pick_event()
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'event_id',event.event_id,'name',event.name,'subtitle',event.subtitle,'venue',event.venue,
    'location',event.location,'starts_at',event.starts_at,'locks_at',event.locks_at,'season',event.season,
    'status',case when now()>=event.locks_at then 'locked' else event.status end,
    'bouts',coalesce((select jsonb_agg(jsonb_build_object(
      'bout_id',bout.bout_id,'position',bout.position,'weight_class',bout.weight_class,
      'red_fighter_slug',bout.red_fighter_slug,'red_fighter_name',bout.red_fighter_name,
      'blue_fighter_slug',bout.blue_fighter_slug,'blue_fighter_name',bout.blue_fighter_name,
      'red_american_odds',bout.red_american_odds,'blue_american_odds',bout.blue_american_odds,
      'winner_fighter_slug',bout.winner_fighter_slug,'result_status',bout.result_status,
      'result_recorded_at',bout.result_recorded_at) order by bout.position)
      from public.pick_bouts bout where bout.event_id=event.event_id),'[]'::jsonb))
  from public.pick_events event where event.status in ('upcoming','locked') order by event.starts_at limit 1;
$$;
revoke all on function public.get_current_pick_event() from public;
grant execute on function public.get_current_pick_event() to anon, authenticated;

create or replace function public.get_my_pick_summary(p_season integer default null)
returns table(correct integer,incorrect integer,pending integer,events_entered integer,base_points integer,lock_bonus integer,total_points integer)
language sql stable security definer set search_path = '' as $$
  with scored as (
    select event.event_id,bout.result_status,bout.winner_fighter_slug,pick.fighter_slug,
      lock.bout_id=pick.bout_id and lock.fighter_slug=pick.fighter_slug and lock.fighter_slug=bout.winner_fighter_slug as lock_won,
      lock.frozen_american_odds
    from public.profile_event_picks pick join public.pick_events event on event.event_id=pick.event_id
    join public.pick_bouts bout on bout.event_id=pick.event_id and bout.bout_id=pick.bout_id
    left join public.profile_event_underdog_locks lock on lock.profile_id=pick.profile_id and lock.event_id=pick.event_id
    where pick.profile_id=auth.uid() and (p_season is null or event.season=p_season)
  ), totals as (select
    count(*) filter(where result_status in('red_win','blue_win') and winner_fighter_slug=fighter_slug)::integer correct,
    count(*) filter(where result_status in('red_win','blue_win') and winner_fighter_slug<>fighter_slug)::integer incorrect,
    count(*) filter(where result_status='pending')::integer pending,
    count(distinct event_id)::integer events_entered,
    (4*count(*) filter(where result_status in('red_win','blue_win') and winner_fighter_slug=fighter_slug))::integer base_points,
    coalesce(sum(public.pick_underdog_bonus(frozen_american_odds)) filter(where lock_won),0)::integer lock_bonus from scored)
  select correct,incorrect,pending,events_entered,base_points,lock_bonus,base_points+lock_bonus from totals;
$$;
revoke all on function public.get_my_pick_summary(integer) from public, anon;
grant execute on function public.get_my_pick_summary(integer) to authenticated;

create or replace function public.get_my_pick_history(p_season integer default null)
returns jsonb language sql stable security definer set search_path = '' as $$
with personal_bouts as (
  select event.*,bout.bout_id,bout.position,bout.weight_class,bout.red_fighter_slug,bout.red_fighter_name,
    bout.blue_fighter_slug,bout.blue_fighter_name,bout.result_status,bout.winner_fighter_slug,
    pick.fighter_slug picked_fighter_slug,
    case when bout.result_status in('draw','no_contest','cancelled') then 'excluded'
      when bout.result_status='pending' then 'pending' when pick.fighter_slug is null then 'missing'
      when pick.fighter_slug=bout.winner_fighter_slug then 'correct' else 'incorrect' end verdict
  from public.pick_events event join public.pick_bouts bout on bout.event_id=event.event_id
  left join public.profile_event_picks pick on pick.profile_id=auth.uid() and pick.event_id=bout.event_id and pick.bout_id=bout.bout_id
  where auth.uid() is not null and event.status='complete' and (p_season is null or event.season=p_season)
), personal_events as (
  select b.event_id,b.name,b.subtitle,b.venue,b.location,b.starts_at,b.season,b.completed_at,
    count(*) filter(where verdict='correct')::integer correct,count(*) filter(where verdict='incorrect')::integer incorrect,
    count(*) filter(where verdict='missing')::integer missing,count(*) filter(where verdict='excluded')::integer excluded,
    (4*count(*) filter(where verdict='correct'))::integer base_points,
    coalesce(max(public.pick_underdog_bonus(lock.frozen_american_odds)) filter(
      where lock.bout_id=b.bout_id and lock.fighter_slug=b.winner_fighter_slug
    ),0)::integer lock_bonus,
    bool_or(b.picked_fighter_slug is not null) entered,
    case when lock.event_id is null then null else jsonb_build_object('event_id',lock.event_id,'bout_id',lock.bout_id,
      'fighter_slug',lock.fighter_slug,'selected_at',lock.selected_at,'frozen_american_odds',lock.frozen_american_odds) end underdog_lock,
    jsonb_agg(jsonb_build_object('bout_id',b.bout_id,'position',b.position,'weight_class',b.weight_class,
      'red_fighter_slug',b.red_fighter_slug,'red_fighter_name',b.red_fighter_name,
      'blue_fighter_slug',b.blue_fighter_slug,'blue_fighter_name',b.blue_fighter_name,
      'result_status',b.result_status,'winner_fighter_slug',b.winner_fighter_slug,
      'picked_fighter_slug',b.picked_fighter_slug,'verdict',b.verdict) order by b.position) bouts
  from personal_bouts b left join public.profile_event_underdog_locks lock
    on lock.profile_id=auth.uid() and lock.event_id=b.event_id
  group by b.event_id,b.name,b.subtitle,b.venue,b.location,b.starts_at,b.season,b.completed_at,
    lock.event_id,lock.bout_id,lock.fighter_slug,lock.selected_at,lock.frozen_american_odds
), entrants as (
  select distinct pick.event_id,pick.profile_id from public.profile_event_picks pick
  join public.pick_events event on event.event_id=pick.event_id
  where event.status='complete' and (p_season is null or event.season=p_season)
), group_scores as (
  select entrant.event_id,entrant.profile_id,profile.display_name,
    count(*) filter(where bout.result_status in('red_win','blue_win') and pick.fighter_slug=bout.winner_fighter_slug)::integer correct,
    count(*) filter(where bout.result_status in('red_win','blue_win') and pick.fighter_slug is not null and pick.fighter_slug<>bout.winner_fighter_slug)::integer incorrect,
    count(*) filter(where bout.result_status in('red_win','blue_win') and pick.fighter_slug is null)::integer missing,
    count(*) filter(where bout.result_status in('draw','no_contest','cancelled'))::integer excluded,
    (4*count(*) filter(where bout.result_status in('red_win','blue_win') and pick.fighter_slug=bout.winner_fighter_slug))::integer base_points,
    coalesce(max(public.pick_underdog_bonus(lock.frozen_american_odds)) filter(where lock.fighter_slug=bout.winner_fighter_slug),0)::integer lock_bonus
  from entrants entrant join public.profiles profile on profile.id=entrant.profile_id
  join public.pick_bouts bout on bout.event_id=entrant.event_id
  left join public.profile_event_picks pick on pick.profile_id=entrant.profile_id and pick.event_id=entrant.event_id and pick.bout_id=bout.bout_id
  left join public.profile_event_underdog_locks lock on lock.profile_id=entrant.profile_id and lock.event_id=entrant.event_id and lock.bout_id=bout.bout_id
  group by entrant.event_id,entrant.profile_id,profile.display_name
), ranked as (
  select *,base_points+lock_bonus total_points,
    rank() over(partition by event_id order by base_points+lock_bonus desc,correct desc)::integer rank
  from group_scores
), event_standings as (
  select event_id,jsonb_agg(jsonb_build_object('rank',rank,'display_name',display_name,'correct',correct,
    'incorrect',incorrect,'missing',missing,'excluded',excluded,'base_points',base_points,
    'lock_bonus',lock_bonus,'total_points',total_points,'is_current_user',profile_id=auth.uid())
    order by rank,display_name) items from ranked group by event_id
), season as (
  select coalesce(sum(correct),0)::integer correct,coalesce(sum(incorrect),0)::integer incorrect,
    coalesce(sum(missing),0)::integer missing,coalesce(sum(excluded),0)::integer excluded,
    count(*) filter(where entered)::integer events_entered,coalesce(sum(base_points),0)::integer base_points,
    coalesce(sum(lock_bonus),0)::integer lock_bonus from personal_events
), events as (
  select coalesce(jsonb_agg(jsonb_build_object('event_id',event.event_id,'name',event.name,'subtitle',event.subtitle,
    'venue',event.venue,'location',event.location,'starts_at',event.starts_at,'season',event.season,
    'completed_at',event.completed_at,'record',jsonb_build_object('correct',event.correct,'incorrect',event.incorrect,
      'missing',event.missing,'excluded',event.excluded,'base_points',event.base_points,'lock_bonus',event.lock_bonus,
      'total_points',event.base_points+event.lock_bonus),'underdog_lock',event.underdog_lock,'bouts',event.bouts,
      'group_results',coalesce(standing.items,'[]'::jsonb)) order by event.starts_at desc),'[]'::jsonb) items
  from personal_events event left join event_standings standing on standing.event_id=event.event_id
)
select jsonb_build_object('season',p_season,'summary',jsonb_build_object('correct',season.correct,'incorrect',season.incorrect,
  'missing',season.missing,'excluded',season.excluded,'events_entered',season.events_entered,
  'base_points',season.base_points,'lock_bonus',season.lock_bonus,'total_points',season.base_points+season.lock_bonus),
  'events',events.items) from season cross join events;
$$;
revoke all on function public.get_my_pick_history(integer) from public, anon;
grant execute on function public.get_my_pick_history(integer) to authenticated;
