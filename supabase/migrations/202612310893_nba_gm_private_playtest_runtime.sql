-- NBA GM owner-only development runtime. Deliberately shares Football GM's
-- private run + revision history; no second franchise persistence service.
-- No public player catalog, no public route, no claims about real contracts.
create table if not exists private.nba_gm_dev_players (
  id text primary key,
  name text not null,
  team_code text not null,
  positions text[] not null,
  overall integer not null check (overall between 0 and 99),
  skills jsonb not null,
  salaries bigint[] not null check (array_length(salaries, 1) = 3),
  pricing_kind text not null default 'GAME_FIXTURE_NOT_REAL_CONTRACT'
    check (pricing_kind = 'GAME_FIXTURE_NOT_REAL_CONTRACT'),
  eligibility_kind text not null default 'PROVISIONAL_EDITORIAL'
    check (eligibility_kind = 'PROVISIONAL_EDITORIAL')
);
revoke all on private.nba_gm_dev_players from public, anon, authenticated;
alter table private.nba_gm_dev_players enable row level security;

create or replace function private.nba_gm_dev_owner()
returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists (
    select 1 from public.profiles p
    join public.pick_control_owners o on o.profile_id = p.id
    where p.id = auth.uid() and upper(trim(p.display_name)) in ('CODY', 'TEST')
  );
$$;
revoke all on function private.nba_gm_dev_owner() from public, anon, authenticated;

-- Current Football GM save RPC must never overwrite NBA's server-authoritative state.
create or replace function private.nba_gm_dev_write_guard()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if current_setting('octagon.nba_gm_dev_authorized_write', true) is distinct from 'yes' then
    if new.game_version like 'nba-gm-dev-%' then
      raise exception 'NBA GM development runs are server-owned';
    end if;
    if tg_op = 'UPDATE' then
      if old.game_version like 'nba-gm-dev-%' then
        raise exception 'NBA GM development runs are server-owned';
      end if;
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists nba_gm_dev_write_guard on private.football_gm_runs;
create trigger nba_gm_dev_write_guard
before insert or update on private.football_gm_runs
for each row execute function private.nba_gm_dev_write_guard();

-- All 330 player values come from the already-reviewed JSON baseline, but are
-- inaccessible outside owner-only RPC. The three prices are explicitly
-- fictional GAME fixtures, NOT actual salaries or guaranteed contract years.
create or replace function public.nba_gm_dev_catalog()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if not private.nba_gm_dev_owner() then raise exception 'NBA GM playtest access required'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', p.id, 'name', p.name, 'teamCode', p.team_code,
      'positions', p.positions, 'currentGrade', p.overall,
      'skills', p.skills, 'salaries', p.salaries,
      'pricingKind', p.pricing_kind, 'eligibilityKind', p.eligibility_kind
    ) order by p.overall desc, p.name)
    from private.nba_gm_dev_players p
  ), '[]'::jsonb);
end;
$$;
revoke all on function public.nba_gm_dev_catalog() from public, anon;
grant execute on function public.nba_gm_dev_catalog() to authenticated;

-- Server-side affordability AND cheapest remaining slot reserves on all years.
-- It is a lower-bound safety check: the full roster is revalidated at confirm.
create or replace function private.nba_gm_dev_can_pick(
  p_state jsonb, p_slot text, p_player_id text
) returns boolean language plpgsql stable security definer set search_path = '' as $$
declare
  v_candidate private.nba_gm_dev_players%rowtype;
  v_picks jsonb := coalesce(p_state->'picks', '[]'::jsonb);
  v_slots text[] := array['PG','SG','SF','PF','C','SIXTH','FLEX'];
  v_open text;
  v_year integer;
  v_spend bigint;
  v_reserve bigint;
  v_low bigint;
begin
  if p_slot is null or p_slot <> all(v_slots) or jsonb_typeof(v_picks) <> 'array'
    or jsonb_array_length(v_picks) >= 7 then return false; end if;
  select * into v_candidate from private.nba_gm_dev_players where id = p_player_id;
  if not found or (p_slot not in ('SIXTH','FLEX') and not p_slot = any(v_candidate.positions))
    or exists (select 1 from jsonb_array_elements(v_picks) pick
      where pick->>'slot' = p_slot or pick->>'playerId' = p_player_id)
    then return false;
  end if;
  for v_year in 1..3 loop
    select coalesce(sum(player.salaries[v_year]),0)
    into v_spend from jsonb_array_elements(v_picks) pick
    join private.nba_gm_dev_players player on player.id = pick->>'playerId';
    v_spend := v_spend + v_candidate.salaries[v_year];
    v_reserve := 0;
    foreach v_open in array v_slots loop
      if v_open = p_slot
        or exists (select 1 from jsonb_array_elements(v_picks) pick where pick->>'slot'=v_open)
        then continue;
      end if;
      select min(player.salaries[v_year]) into v_low
      from private.nba_gm_dev_players player
      where (v_open in ('SIXTH','FLEX') or v_open = any(player.positions))
        and player.id <> p_player_id
        and not exists (
          select 1 from jsonb_array_elements(v_picks) pick
          where pick->>'playerId'=player.id
        );
      if v_low is null then return false; end if;
      v_reserve := v_reserve + v_low;
    end loop;
    if v_spend + v_reserve > 192500000 then return false; end if;
  end loop;
  return true;
end;
$$;
revoke all on function private.nba_gm_dev_can_pick(jsonb,text,text) from public, anon, authenticated;

-- The prototype has its own basketball simulation, never a repackaged NFL
-- overall average. Offensive creation, spacing, guard containment, rim defense,
-- size/rebounding and positional fit affect 82-game records separately.
create or replace function private.nba_gm_dev_simulate(p_state jsonb)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  v_year integer;
  v_off numeric;
  v_def numeric;
  v_fit numeric;
  v_floor numeric;
  v_wins integer;
  v_noise integer;
  v_finish text;
  v_results jsonb := '[]'::jsonb;
begin
  select
    sum((coalesce((p.skills->>'scoring')::numeric,0)*0.33
      + (p.skills->>'shooting')::numeric*0.25
      + (p.skills->>'playmaking')::numeric*0.27
      + (p.skills->>'rebounding')::numeric*0.10
      + (p.skills->>'interiorDefense')::numeric*0.05)
      * case when pick->>'slot'='SIXTH' then 0.65
        when pick->>'slot'='FLEX' then 0.55 else 1 end) / 6.2,
    sum(((p.skills->>'perimeterDefense')::numeric
      * case when pick->>'slot' in ('PG','SG','SF') then 0.57 else 0.30 end
      + (p.skills->>'interiorDefense')::numeric
      * case when pick->>'slot' in ('C','PF') then 0.55 else 0.23 end
      + (p.skills->>'rebounding')::numeric*0.18)
      / case when pick->>'slot' in ('PG','SG','SF') then 0.98 else 1.03 end)
      * case when pick->>'slot'='SIXTH' then 0.65
        when pick->>'slot'='FLEX' then 0.55 else 1 end) / 6.2,
    sum(case
      when pick->>'slot'='PG' then (p.skills->>'playmaking')::numeric * 0.35
      when pick->>'slot'='C' then ((p.skills->>'interiorDefense')::numeric
        + (p.skills->>'rebounding')::numeric)*0.175
      when pick->>'slot' in ('SG','SF') then ((p.skills->>'shooting')::numeric
        + (p.skills->>'perimeterDefense')::numeric)*0.175
      when pick->>'slot'='PF' then ((p.skills->>'interiorDefense')::numeric
        + (p.skills->>'rebounding')::numeric)*0.175
      else 0 end) / 5,
    min(case when pick->>'slot' in ('PG','SG','SF','PF','C')
      then least((p.skills->>'scoring')::numeric,
                 (p.skills->>'perimeterDefense')::numeric + 10) else 99 end)
  into v_off,v_def,v_fit,v_floor
  from jsonb_array_elements(p_state->'picks') pick
  join private.nba_gm_dev_players p on p.id=pick->>'playerId';
  if v_off is null or v_def is null then raise exception 'invalid NBA starting five'; end if;

  for v_year in 1..3 loop
    v_noise := (abs(('x'||substr(md5(p_state->>'seed'||':'||v_year),1,8))::bit(32)::int::bigint) % 11)::integer - 5;
    v_wins := greatest(8,least(74,round(
      41 + (v_off-78)*1.20 + (v_def-78)*1.05 +
      (v_fit-27)*0.35 + least(0,(v_floor-65))*0.20 + v_noise
    )::integer));
    v_finish := case when v_wins < 40 then 'Missed Playoffs'
      when v_wins < 47 then 'First Round'
      when v_wins < 53 then 'Conference Semifinals'
      when v_wins < 58 then 'Conference Finals'
      when v_wins < 64 then 'Finals'
      else 'Champion' end;
    v_results := v_results || jsonb_build_array(jsonb_build_object(
      'season',v_year, 'wins',v_wins, 'losses',82-v_wins,
      'offense',round(v_off,1),'defense',round(v_def,1),
      'positionalFit',round(v_fit,1),'finish',v_finish));
  end loop;
  return v_results;
end;
$$;
revoke all on function private.nba_gm_dev_simulate(jsonb) from public, anon, authenticated;

-- Atomic, owner-only state transition API. The client never supplies a team
-- spin, salary, grade, candidate list, simulation result or arbitrary run JSON.
create or replace function public.nba_gm_dev_action(
  p_action text, p_slot text default null, p_player_id text default null
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_profile uuid := auth.uid();
  v_run_id uuid;
  v_state jsonb;
  v_picks jsonb;
  v_team text;
  v_next jsonb;
  v_row private.nba_gm_dev_players%rowtype;
  v_slot text;
  v_year integer;
  v_spend bigint;
  v_revision integer;
begin
  if not private.nba_gm_dev_owner() then raise exception 'NBA GM playtest access required'; end if;
  if (select count(*) from private.nba_gm_dev_players) <> 330 then
    raise exception 'NBA GM development catalog is unavailable';
  end if;

  if p_action = 'start' then
    v_state := jsonb_build_object(
      'version','nba-gm-dev-v1','seed','nba-gm-'||extensions.gen_random_uuid()::text,
      'phase','draft','picks','[]'::jsonb,'pendingTeam',null,
      'pendingSlot',null,'spinIndex',0,'caps',jsonb_build_array(192500000,192500000,192500000),
      'results','[]'::jsonb);
    perform set_config('octagon.nba_gm_dev_authorized_write','yes',true);
    insert into private.football_gm_runs(profile_id,seed,game_version,state)
      values(v_profile,v_state->>'seed','nba-gm-dev-v1',v_state)
      returning id into v_run_id;
    insert into private.football_gm_run_snapshots(run_id,revision,state)
      values(v_run_id,1,v_state);
    return v_state;
  end if;

  select r.id,r.state into v_run_id,v_state
  from private.football_gm_runs r
  where r.profile_id=v_profile and r.game_version='nba-gm-dev-v1'
  order by (r.completed_at is null) desc,r.updated_at desc
  limit 1 for update;
  if v_run_id is null then
    if p_action='load' then return null; end if;
    raise exception 'Start a new NBA GM franchise';
  end if;
  if p_action='load' then return v_state; end if;
  if v_state->>'version'<>'nba-gm-dev-v1'
    or jsonb_typeof(v_state->'picks')<>'array' then raise exception 'invalid saved GM state'; end if;
  if v_state->>'phase' not in ('draft','review')
    then raise exception 'This NBA GM franchise is already complete'; end if;
  v_picks := v_state->'picks';

  if p_action='spin' then
    if v_state->>'phase'<>'draft' or v_state->>'pendingTeam' is not null
      or p_slot not in ('PG','SG','SF','PF','C','SIXTH','FLEX')
      then raise exception 'Choose an available roster slot'; end if;
    -- random() executes only inside the server action. Never accept a client team.
    select options.team_code into v_team from (
      select distinct p.team_code
      from private.nba_gm_dev_players p
      where private.nba_gm_dev_can_pick(v_state,p_slot,p.id)
    ) options order by random() limit 1;
    if v_team is null then raise exception 'No affordable teams remain; start a new draft'; end if;
    v_next := jsonb_set(jsonb_set(jsonb_set(v_state,
      '{pendingTeam}',to_jsonb(v_team)), '{pendingSlot}',to_jsonb(p_slot)),
      '{spinIndex}',to_jsonb((v_state->>'spinIndex')::integer+1));
  elsif p_action='pick' then
    v_slot := v_state->>'pendingSlot';
    if v_state->>'phase'<>'draft' or v_slot is null or v_slot<>p_slot
      or v_state->>'pendingTeam' is null then raise exception 'Spin for this slot first'; end if;
    select * into v_row from private.nba_gm_dev_players where id=p_player_id;
    if not found or v_row.team_code<>v_state->>'pendingTeam'
      or not private.nba_gm_dev_can_pick(v_state,p_slot,p_player_id)
      then raise exception 'This player is not eligible or affordable'; end if;
    v_picks := v_picks || jsonb_build_array(jsonb_build_object('slot',p_slot,'playerId',p_player_id));
    v_next := jsonb_set(jsonb_set(jsonb_set(v_state,
      '{picks}',v_picks),'{pendingTeam}','null'::jsonb),'{pendingSlot}','null'::jsonb);
    if jsonb_array_length(v_picks)=7 then
      v_next := jsonb_set(v_next,'{phase}','"review"'::jsonb);
    end if;
  elsif p_action='confirm' then
    if v_state->>'phase'<>'review' or jsonb_array_length(v_picks)<>7
      or (select count(distinct pick->>'slot') from jsonb_array_elements(v_picks) pick)<>7
      or (select count(distinct pick->>'playerId') from jsonb_array_elements(v_picks) pick)<>7
      then raise exception 'Complete a legal seven-player rotation first'; end if;
    -- Revalidate the full roster at the trusted boundary, all THREE years.
    for v_year in 1..3 loop
      select coalesce(sum(p.salaries[v_year]),0) into v_spend
      from jsonb_array_elements(v_picks) pick
      join private.nba_gm_dev_players p on p.id=pick->>'playerId'
      where pick->>'slot' in ('PG','SG','SF','PF','C','SIXTH','FLEX')
        and (pick->>'slot' in ('SIXTH','FLEX') or pick->>'slot'=any(p.positions));
      if v_spend>192500000 then raise exception 'Season salary cap exceeded'; end if;
    end loop;
    v_next := jsonb_set(jsonb_set(v_state,'{results}',
      private.nba_gm_dev_simulate(v_state)),'{phase}','"final"'::jsonb);
  else
    raise exception 'Unsupported NBA GM action';
  end if;

  perform set_config('octagon.nba_gm_dev_authorized_write','yes',true);
  update private.football_gm_runs
    set state=v_next,updated_at=now(),
        completed_at=case when v_next->>'phase'='final' then now() else null end
    where id=v_run_id;
  select coalesce(max(revision),0)+1 into v_revision
    from private.football_gm_run_snapshots where run_id=v_run_id;
  insert into private.football_gm_run_snapshots(run_id,revision,state)
    values(v_run_id,v_revision,v_next);
  return v_next;
end;
$$;
revoke all on function public.nba_gm_dev_action(text,text,text) from public, anon;
grant execute on function public.nba_gm_dev_action(text,text,text) to authenticated;
