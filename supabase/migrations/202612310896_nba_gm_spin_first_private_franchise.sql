-- NBA GM private V2. Reuses existing Football GM run/snapshot ownership and guards.
-- Historical V1 sessions are immutable and remain separately queryable.
-- GAME contract terms and prices are dev fixtures, NOT verified NBA agreements.

-- Three focused, source-verified positional corrections to the 330-player
-- PRIVATE catalog. No overall, skill, salary, or team identity is changed.
-- 2026 NBA official player listings: Naz Reid C-F (#1629675), Cameron Boozer
-- F-C (#1643409); 2025-26 Basketball-Reference: Collin Murray-Boyles PF.
-- The original provisional rating-board position flags remain open for audit.
update private.nba_gm_dev_players set positions=array['PF','C']::text[]
  where id='nba-gm-draft-nazreid';
update private.nba_gm_dev_players set positions=array['PF','C']::text[]
  where id='nba-gm-draft-cameronboozer';
update private.nba_gm_dev_players set positions=array['PF']::text[]
  where id='nba-gm-draft-collinmurrayboyles';

-- 2025-26 position checks: Basketball-Reference individual player histories
-- list Aldama/Clowney/Wade/Washington as PF; Jaylin Williams as PF with
-- recorded center seasons; Thompson/Moody/Caldwell-Pope as SG.
-- These corrections fix backup guard / big eligibility, NOT skill ratings.
update private.nba_gm_dev_players set positions=array['PF']::text[]
  where id in ('nba-gm-draft-santialdama','nba-gm-draft-noahclowney',
    'nba-gm-draft-deanwade','nba-gm-draft-pjwashington');
update private.nba_gm_dev_players set positions=array['PF','C']::text[]
  where id='nba-gm-draft-jaylinwilliams';
update private.nba_gm_dev_players set positions=array['SG','SF']::text[]
  where id='nba-gm-draft-klaythompson';
update private.nba_gm_dev_players set positions=array['SG']::text[]
  where id in ('nba-gm-draft-mosesmoody','nba-gm-draft-kentaviouscaldwellpope');

create or replace function private.nba_gm_v2_contract(p_id text)
returns text language sql stable security definer set search_path='' as $$
  select case when right(md5(p_id),1) in ('0','1','2','3','4','5') then '1YR' else '3YR' end;
$$;
revoke all on function private.nba_gm_v2_contract(text) from public,anon,authenticated;

create or replace function private.nba_gm_v2_salary(p_id text,p_year integer)
returns bigint language sql stable security definer set search_path='' as $$
  select case when private.nba_gm_v2_contract(p_id)='3YR'
    then p.salaries[1] else p.salaries[greatest(1,least(3,p_year))] end
  from private.nba_gm_dev_players p where p.id=p_id;
$$;
revoke all on function private.nba_gm_v2_salary(text,integer) from public,anon,authenticated;

create or replace function public.nba_gm_dev_catalog()
returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
  if not private.nba_gm_dev_owner() then raise exception 'NBA GM playtest access required'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object(
    'id',p.id,'name',p.name,'teamCode',p.team_code,'positions',p.positions,
    'currentGrade',p.overall,'skills',p.skills,'salaries',p.salaries,
    'gameContract',private.nba_gm_v2_contract(p.id),
    'pricingKind',p.pricing_kind,'eligibilityKind',p.eligibility_kind,
    'officialNbaPlayerId',p.official_nba_player_id,
    'officialRosterPosition',p.official_roster_position,
    'positionReview',p.position_review,'reviewFlags',p.review_flags
  ) order by p.overall desc,p.name) from private.nba_gm_dev_players p),'[]'::jsonb);
end;
$$;
revoke all on function public.nba_gm_dev_catalog() from public,anon;
grant execute on function public.nba_gm_dev_catalog() to authenticated;

-- Backtracking exact-position matcher. Assigns players AFTER the team has spun,
-- so no slot is reserved before the user sees the team or chooses a player.
-- SF/SG wings can play GUARD; SF/PF wings can play BIG; pure SF stays at SF.
create or replace function private.nba_gm_v2_assign(p_picks jsonb,p_new_id text default null)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare
  v_ids jsonb;
  v_count integer;
  v_out jsonb;
begin
  if jsonb_typeof(p_picks) <> 'array' then return null; end if;
   select coalesce(jsonb_agg(e.value->>'playerId' order by e.ordinality),'[]'::jsonb)
    into v_ids from jsonb_array_elements(p_picks) with ordinality e(value,ordinality);
  if p_new_id is not null then v_ids:=v_ids||jsonb_build_array(p_new_id); end if;
  v_count:=jsonb_array_length(v_ids);
  if v_count>7 or
    (select count(distinct x.id) from jsonb_array_elements_text(v_ids) x(id))<>v_count
    or (select count(*) from jsonb_array_elements_text(v_ids) x(id)
        join private.nba_gm_dev_players p on p.id=x.id)<>v_count
    then return null; end if;
  with recursive ordered as (
    select e.ordinality::integer as n,p.id,p.positions
    from jsonb_array_elements_text(v_ids) with ordinality e(id,ordinality)
    join private.nba_gm_dev_players p on p.id=e.id
  ), arrangements as (
    select 0::integer as n,'[]'::jsonb as picks,array[]::text[] as used,
      0::integer as bench_cost,0::integer as off_role_cost
    union all
    select a.n+1,a.picks||jsonb_build_array(jsonb_build_object('slot',s.slot,'playerId',p.id)),
      array_append(a.used,s.slot),
      a.bench_cost+case when s.slot in ('GUARD','BIG') then 1 else 0 end,
      a.off_role_cost+case when s.slot=p.positions[1] then 0 else 1 end
    from arrangements a join ordered p on p.n=a.n+1
    cross join lateral unnest(array['PG','SG','SF','PF','C','GUARD','BIG']) s(slot)
    where not s.slot=any(a.used)
      and (s.slot=any(p.positions)
        or (s.slot='GUARD' and p.positions && array['PG','SG'])
        or (s.slot='BIG' and p.positions && array['PF','C']))
  )
  select a.picks into v_out from arrangements a where a.n=v_count
  order by a.bench_cost,a.off_role_cost,a.picks::text limit 1;
  return v_out;
end;
$$;
revoke all on function private.nba_gm_v2_assign(jsonb,text) from public,anon,authenticated;

create or replace function private.nba_gm_v2_can_add(p_state jsonb,p_id text)
returns boolean language plpgsql stable security definer set search_path='' as $$
declare
  v_arranged jsonb;
  v_year integer;
  v_spend bigint;
  v_reserve bigint;
  v_min bigint;
  v_slot text;
  v_reserved_ids text[]:=array[]::text[];
  v_filler_id text;
  v_open text[]:=array['PG','SG','SF','PF','C','GUARD','BIG'];
  v_phase text:=p_state->>'phase';
begin
  v_arranged:=private.nba_gm_v2_assign(p_state->'picks',p_id);
  if v_arranged is null then return false; end if;
  -- A separate eligible player must backstop every open roster role. Reserve
  -- the maximum salary for each chosen filler across all three game years.
  -- Previously, per-role minima reused the same cheap wing/big multiple times.
  v_reserve:=0;
  if v_phase='draft' then
    foreach v_slot in array v_open loop
      if exists(select 1 from jsonb_array_elements(v_arranged) pick where pick->>'slot'=v_slot)
        then continue; end if;
      select p.id,case when private.nba_gm_v2_contract(p.id)='3YR'
        then p.salaries[1] else greatest(p.salaries[1],p.salaries[2],p.salaries[3]) end
      into v_filler_id,v_min
      from private.nba_gm_dev_players p
      where p.id not in (select pick->>'playerId' from jsonb_array_elements(v_arranged) pick)
        and not (p.id=any(v_reserved_ids))
        and (v_slot=any(p.positions)
          or (v_slot='GUARD' and p.positions && array['PG','SG'])
          or (v_slot='BIG' and p.positions && array['PF','C']))
      order by case when private.nba_gm_v2_contract(p.id)='3YR'
        then p.salaries[1] else greatest(p.salaries[1],p.salaries[2],p.salaries[3]) end,p.id
      limit 1;
      if v_filler_id is null then return false; end if;
      v_reserved_ids:=array_append(v_reserved_ids,v_filler_id);
      v_reserve:=v_reserve+v_min;
    end loop;
  end if;
  for v_year in 1..3 loop
    if v_phase='offseason' and v_year=1 then continue; end if;
    select coalesce(sum(private.nba_gm_v2_salary(pick->>'playerId',v_year)),0)
      into v_spend from jsonb_array_elements(v_arranged) pick;
    if v_spend+v_reserve > 192500000 then return false; end if;
  end loop;
  return true;
end;
$$;
revoke all on function private.nba_gm_v2_can_add(jsonb,text) from public,anon,authenticated;

-- Private prototype only: team efficiency coefficients below are provisional.
-- Do not call this a historically calibrated model until the 150 team-season
-- study is fitted and validated; results are locked after each phase.
create or replace function private.nba_gm_v2_season(p_state jsonb,p_year integer)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare
  v_off numeric;v_def numeric;v_fit numeric;v_floor numeric;
  v_noise integer;v_wins integer;v_finish text;
  v_roll integer;v_cutoff integer;v_round integer;
  v_turnover integer:=coalesce(jsonb_array_length(p_state->'releasedIds'),0)
     +coalesce((p_state->>'tradesUsed')::integer,0);
begin
  select
    sum(((p.skills->>'scoring')::numeric*.33+(p.skills->>'shooting')::numeric*.25
        +(p.skills->>'playmaking')::numeric*.27+(p.skills->>'rebounding')::numeric*.10
        +(p.skills->>'interiorDefense')::numeric*.05)
      *case when pick->>'slot' in ('GUARD','BIG') then .55 else 1 end)/6.1,
    sum(((p.skills->>'perimeterDefense')::numeric
        *case when pick->>'slot' in ('PG','SG','SF','GUARD') then .57 else .30 end
      +(p.skills->>'interiorDefense')::numeric
        *case when pick->>'slot' in ('C','PF','BIG') then .55 else .23 end
      +(p.skills->>'rebounding')::numeric*.18)
      /case when pick->>'slot' in ('PG','SG','SF','GUARD') then .98 else 1.03 end
      *case when pick->>'slot' in ('GUARD','BIG') then .55 else 1 end)/6.1,
    sum(case when pick->>'slot'='PG' then (p.skills->>'playmaking')::numeric*.35
      when pick->>'slot'='C' then ((p.skills->>'interiorDefense')::numeric
        +(p.skills->>'rebounding')::numeric)*.175
      when pick->>'slot' in ('SG','SF') then ((p.skills->>'shooting')::numeric
        +(p.skills->>'perimeterDefense')::numeric)*.175
      when pick->>'slot'='PF' then ((p.skills->>'interiorDefense')::numeric
        +(p.skills->>'rebounding')::numeric)*.175 else 0 end)/5,
    min(case when pick->>'slot' in ('PG','SG','SF','PF','C')
      then least((p.skills->>'scoring')::numeric,(p.skills->>'perimeterDefense')::numeric+10)
      else 99 end)
  into v_off,v_def,v_fit,v_floor
  from jsonb_array_elements(p_state->'picks') pick
  join private.nba_gm_dev_players p on p.id=pick->>'playerId';
  if v_off is null or v_def is null
     or jsonb_array_length(p_state->'picks')<>7 then raise exception 'NBA rotation incomplete'; end if;
  v_noise:=(abs(('x'||substr(md5(p_state->>'seed'||':'||p_year),1,8))::bit(32)::int::bigint)%11)::integer-5;
  v_wins:=greatest(8,least(74,round(
    41+(v_off-78)*1.2+(v_def-78)*1.05+(v_fit-27)*.35
      +least(0,(v_floor-65))*.2
      -case when p_year=1 then 0 else greatest(0,v_turnover-2)*.8 end+v_noise
  )::integer));
  -- A 53-win Denver team won in 2023; a 64+ win season must not
  -- guarantee a title. This PRIVATE playoff model is a deterministic,
  -- seed-driven variance fixture, NOT a fitted 150-team NBA estimate.
  -- Each advancement roll is independent of the regular-season win noise.
  v_finish:='Missed Playoffs';
  v_roll:=(abs(('x'||substr(md5(p_state->>'seed'||':'||p_year||':entry'),1,8))
    ::bit(32)::int::bigint)%1000)::integer;
  if v_wins>=47 or (v_wins>=36 and
    v_roll<greatest(0,least(950,(v_wins-34)*80))) then
    v_finish:='First Round';
    for v_round in 1..4 loop
      v_roll:=(abs(('x'||substr(md5(p_state->>'seed'||':'||p_year||':playoff:'||v_round),1,8))
        ::bit(32)::int::bigint)%1000)::integer;
      v_cutoff:=greatest(75,least(890,470+(v_wins-47)*15-(v_round-1)*25));
      exit when v_roll>=v_cutoff;
      v_finish:=case v_round when 1 then 'Conference Semifinals'
        when 2 then 'Conference Finals' when 3 then 'Finals' else 'Champion' end;
    end loop;
  end if;
  return jsonb_build_object('season',p_year,'wins',v_wins,'losses',82-v_wins,
    'offense',round(v_off,1),'defense',round(v_def,1),
    'positionalFit',round(v_fit,1),'finish',v_finish);
end;
$$;
revoke all on function private.nba_gm_v2_season(jsonb,integer) from public,anon,authenticated;

create or replace function public.nba_gm_dev_action(
  p_action text,p_slot text default null,p_player_id text default null
) returns jsonb language plpgsql security definer set search_path='' as $$
declare
  v_profile uuid:=auth.uid();v_run_id uuid;v_state jsonb;v_next jsonb;
  v_player private.nba_gm_dev_players%rowtype;
  v_old private.nba_gm_dev_players%rowtype;
  v_picks jsonb;v_team text;v_revision integer;v_year integer;v_spend bigint;
  v_old_id text;v_result jsonb;v_attempts integer;v_count integer;
begin
  if not private.nba_gm_dev_owner() then raise exception 'NBA GM playtest access required'; end if;
  if (select count(*) from private.nba_gm_dev_players)<>330 then
    raise exception 'NBA GM private player bank unavailable'; end if;
  if p_action='start' then
    v_state:=jsonb_build_object('version','nba-gm-dev-v2',
      'seed','nba-gm-'||extensions.gen_random_uuid()::text,
      'phase','draft','picks','[]'::jsonb,'yearOnePicks','[]'::jsonb,'pendingTeam',null,
      'pendingSlot',null,'spinIndex',0,'caps',jsonb_build_array(192500000,192500000,192500000),
      'results','[]'::jsonb,'shopPlayerId',null,'tradeTeam',null,
      'tradeAttempts',0,'tradesUsed',0,'freeAgencyTeam',null,
      'freeAgencyVisits',0,'releasedIds','[]'::jsonb);
    perform set_config('octagon.nba_gm_dev_authorized_write','yes',true);
    insert into private.football_gm_runs(profile_id,seed,game_version,state)
      values(v_profile,v_state->>'seed','nba-gm-dev-v2',v_state) returning id into v_run_id;
    insert into private.football_gm_run_snapshots(run_id,revision,state) values(v_run_id,1,v_state);
    perform set_config('octagon.nba_gm_dev_authorized_write','',true);
    return v_state;
  end if;
  select r.id,r.state into v_run_id,v_state from private.football_gm_runs r
  where r.profile_id=v_profile and r.game_version='nba-gm-dev-v2'
  order by (r.completed_at is null) desc,r.updated_at desc
  limit 1 for update;
  if v_run_id is null then
    if p_action='load' then return null; end if;
    raise exception 'Start an NBA GM franchise'; end if;
  if p_action='load' then return v_state; end if;
  if v_state->>'version'<>'nba-gm-dev-v2'
    or jsonb_typeof(v_state->'picks')<>'array'
    or v_state->>'phase'='final' then raise exception 'NBA GM session is closed'; end if;
  v_picks:=v_state->'picks';
  v_next:=v_state;
  if p_action='spin' then
    if v_state->>'phase'<>'draft' or v_state->>'pendingTeam' is not null
      then raise exception 'Finish the existing team spin first'; end if;
    select teams.team_code into v_team from (
      select distinct p.team_code from private.nba_gm_dev_players p order by p.team_code
    ) teams
    where exists(select 1 from private.nba_gm_dev_players p
      where p.team_code=teams.team_code and private.nba_gm_v2_can_add(v_state,p.id))
    order by random() limit 1;
    if v_team is null then raise exception 'No legal NBA teams remain'; end if;
    v_next:=jsonb_set(jsonb_set(v_state,'{pendingTeam}',to_jsonb(v_team)),
      '{spinIndex}',to_jsonb((v_state->>'spinIndex')::integer+1));
  elsif p_action='pick' then
    if v_state->>'phase'<>'draft' or v_state->>'pendingTeam' is null
      then raise exception 'Spin a team before selecting a player'; end if;
    select * into v_player from private.nba_gm_dev_players where id=p_player_id;
    if not found or v_player.team_code<>v_state->>'pendingTeam'
      or not private.nba_gm_v2_can_add(v_state,p_player_id)
      then raise exception 'Player cannot fit the roster and cap'; end if;
    v_picks:=private.nba_gm_v2_assign(v_picks,p_player_id);
    v_next:=jsonb_set(jsonb_set(v_state,'{picks}',v_picks),'{pendingTeam}','null'::jsonb);
    if jsonb_array_length(v_picks)=7 then
      v_next:=jsonb_set(v_next,'{yearOnePicks}',v_picks);
      v_result:=private.nba_gm_v2_season(v_next,1);
      v_next:=jsonb_set(jsonb_set(v_next,'{results}',jsonb_build_array(v_result)),
        '{phase}','"year1"'::jsonb);
    end if;
  elsif p_action='offseason' then
    if v_state->>'phase'<>'year1' then raise exception 'Complete Season 1 first'; end if;
    v_next:=jsonb_set(v_state,'{phase}','"offseason"'::jsonb);
  elsif p_action='shop' then
    if v_state->>'phase'<>'offseason' or (v_state->>'tradesUsed')::integer>=1
      or v_state->>'tradeTeam' is not null
      or not exists(select 1 from jsonb_array_elements(v_picks) pick
        where pick->>'playerId'=p_player_id)
      then raise exception 'Choose one rostered player to shop'; end if;
    v_next:=jsonb_set(jsonb_set(v_state,'{shopPlayerId}',to_jsonb(p_player_id)),
      '{tradeAttempts}','0'::jsonb);
  elsif p_action='trade-spin' then
    v_old_id:=v_state->>'shopPlayerId';
    if v_state->>'phase'<>'offseason' or v_old_id is null
      or v_state->>'tradeTeam' is not null then raise exception 'Choose a trade asset first'; end if;
    select * into v_old from private.nba_gm_dev_players where id=v_old_id;
    select coalesce(jsonb_agg(pick),'[]'::jsonb) into v_picks
      from jsonb_array_elements(v_picks) pick where pick->>'playerId'<>v_old_id;
    v_next:=jsonb_set(v_state,'{picks}',v_picks);
    select teams.team_code into v_team from (
      select distinct team_code from private.nba_gm_dev_players
    ) teams where teams.team_code<>v_old.team_code
      and exists(select 1 from private.nba_gm_dev_players p
        where p.team_code=teams.team_code
          and p.id not in(select x->>'playerId' from jsonb_array_elements(v_picks) x)
          and p.id not in(select x.id from jsonb_array_elements_text(v_state->'releasedIds') x(id))
          and p.overall<=v_old.overall+4
          and private.nba_gm_v2_can_add(v_next,p.id))
    order by random() limit 1;
    if v_team is null then raise exception 'No legal trade partners'; end if;
    v_next:=jsonb_set(v_state,'{tradeTeam}',to_jsonb(v_team));
  elsif p_action='trade' then
    v_old_id:=v_state->>'shopPlayerId';
    if v_state->>'phase'<>'offseason' or v_old_id is null
      or v_state->>'tradeTeam' is null or (v_state->>'tradeAttempts')::integer>=2
      then raise exception 'No active trade offers'; end if;
    select * into v_old from private.nba_gm_dev_players where id=v_old_id;
    select * into v_player from private.nba_gm_dev_players where id=p_player_id;
    if not found or v_player.team_code<>v_state->>'tradeTeam'
      then raise exception 'Not a player from your trade partner'; end if;
    select coalesce(jsonb_agg(pick),'[]'::jsonb) into v_picks
      from jsonb_array_elements(v_picks) pick where pick->>'playerId'<>v_old_id;
    v_result:=jsonb_set(v_state,'{picks}',v_picks);
    if not private.nba_gm_v2_can_add(v_result,p_player_id) then
      raise exception 'Trade would break the roster or salary cap'; end if;
    v_attempts:=(v_state->>'tradeAttempts')::integer+1;
    v_next:=jsonb_set(v_state,'{tradeAttempts}',to_jsonb(v_attempts));
    -- Private negotiation mock: do NOT imply live NBA trade value.
    if v_player.overall <= v_old.overall+4 then
      v_picks:=private.nba_gm_v2_assign(v_picks,p_player_id);
      v_next:=jsonb_set(jsonb_set(jsonb_set(jsonb_set(v_next,'{picks}',v_picks),
        '{shopPlayerId}','null'::jsonb),'{tradeTeam}','null'::jsonb),
        '{tradesUsed}',to_jsonb((v_state->>'tradesUsed')::integer+1));
    elsif v_attempts>=2 then
      v_next:=jsonb_set(jsonb_set(v_next,'{shopPlayerId}','null'::jsonb),
        '{tradeTeam}','null'::jsonb);
    end if;
  elsif p_action='cancel-trade' then
    if v_state->>'phase'<>'offseason' then raise exception 'Offseason only'; end if;
    v_next:=jsonb_set(jsonb_set(v_state,'{shopPlayerId}','null'::jsonb),
      '{tradeTeam}','null'::jsonb);
  elsif p_action='release' then
    if v_state->>'phase'<>'offseason' or jsonb_array_length(v_state->'releasedIds')>=1
      or v_state->>'shopPlayerId' is not null or v_state->>'freeAgencyTeam' is not null
      or not exists(select 1 from jsonb_array_elements(v_picks) pick where pick->>'playerId'=p_player_id)
      then raise exception 'You can release one player in this offseason'; end if;
    select coalesce(jsonb_agg(pick),'[]'::jsonb) into v_picks
      from jsonb_array_elements(v_picks) pick where pick->>'playerId'<>p_player_id;
    v_next:=jsonb_set(jsonb_set(v_state,'{picks}',v_picks),
      '{releasedIds}',(v_state->'releasedIds')||jsonb_build_array(p_player_id));
    -- Never finalize a cut unless at least one legal, affordable 1YR replacement exists.
    if not exists(select 1 from private.nba_gm_dev_players p
      where private.nba_gm_v2_contract(p.id)='1YR'
        and p.id not in(select x.id from jsonb_array_elements_text(v_next->'releasedIds') x(id))
        and private.nba_gm_v2_can_add(v_next,p.id)) then
      raise exception 'No affordable 1YR replacement; keep this player';
    end if;
  -- NFL-style emergency market: never strand a franchise after a release.
  elsif p_action='fa-spin' then
    if v_state->>'phase'<>'offseason' or jsonb_array_length(v_picks)>=7
      or v_state->>'freeAgencyTeam' is not null
      or v_state->>'shopPlayerId' is not null
      then raise exception 'No free-agent market visit available'; end if;
    select teams.team_code into v_team from (
      select distinct team_code from private.nba_gm_dev_players
    ) teams where exists(select 1 from private.nba_gm_dev_players p
      where p.team_code=teams.team_code and private.nba_gm_v2_contract(p.id)='1YR'
        and p.id not in(select x.id from jsonb_array_elements_text(v_state->'releasedIds') x(id))
        and private.nba_gm_v2_can_add(v_state,p.id))
    order by random() limit 1;
    if v_team is null then raise exception 'No affordable free agents available'; end if;
    v_next:=jsonb_set(jsonb_set(v_state,'{freeAgencyTeam}',to_jsonb(v_team)),
      '{freeAgencyVisits}',to_jsonb((v_state->>'freeAgencyVisits')::integer+1));
  elsif p_action='sign' then
    if v_state->>'phase'<>'offseason' or v_state->>'freeAgencyTeam' is null
      then raise exception 'Spin the free-agent wheel first'; end if;
    select * into v_player from private.nba_gm_dev_players where id=p_player_id;
    if not found or v_player.team_code<>v_state->>'freeAgencyTeam'
      or private.nba_gm_v2_contract(p_player_id)<>'1YR'
      or p_player_id in(select x.id from jsonb_array_elements_text(v_state->'releasedIds') x(id))
      or not private.nba_gm_v2_can_add(v_state,p_player_id)
      then raise exception 'Free agent is not eligible'; end if;
    v_picks:=private.nba_gm_v2_assign(v_picks,p_player_id);
    v_next:=jsonb_set(jsonb_set(v_state,'{picks}',v_picks),
      '{freeAgencyTeam}','null'::jsonb);
  elsif p_action='pass-fa' then
    if v_state->>'phase'<>'offseason' then raise exception 'Offseason only'; end if;
    v_next:=jsonb_set(v_state,'{freeAgencyTeam}','null'::jsonb);
  elsif p_action='advance' then
    if v_state->>'phase'<>'offseason'
      or jsonb_array_length(v_picks)<>7 or v_state->>'shopPlayerId' is not null
      or v_state->>'freeAgencyTeam' is not null
      then raise exception 'Complete the seven-player offseason roster first'; end if;
    if private.nba_gm_v2_assign(v_picks) is null then raise exception 'Invalid positions'; end if;
    for v_year in 2..3 loop
      select coalesce(sum(private.nba_gm_v2_salary(pick->>'playerId',v_year)),0)
        into v_spend from jsonb_array_elements(v_picks) pick;
      if v_spend>192500000 then raise exception 'Future salary cap exceeded'; end if;
    end loop;
    v_next:=jsonb_set(jsonb_set(v_state,'{results}',
      (v_state->'results')||jsonb_build_array(
        private.nba_gm_v2_season(v_state,2),private.nba_gm_v2_season(v_state,3))),
        '{phase}','"final"'::jsonb);
  else
    raise exception 'Unsupported NBA GM action';
  end if;

  perform set_config('octagon.nba_gm_dev_authorized_write','yes',true);
  update private.football_gm_runs set state=v_next,updated_at=now(),
    completed_at=case when v_next->>'phase'='final' then now() else null end
    where id=v_run_id;
  select coalesce(max(revision),0)+1 into v_revision
    from private.football_gm_run_snapshots where run_id=v_run_id;
  insert into private.football_gm_run_snapshots(run_id,revision,state)
    values(v_run_id,v_revision,v_next);
  perform set_config('octagon.nba_gm_dev_authorized_write','',true);
  return v_next;
end;
$$;
revoke all on function public.nba_gm_dev_action(text,text,text) from public,anon;
grant execute on function public.nba_gm_dev_action(text,text,text) to authenticated;
