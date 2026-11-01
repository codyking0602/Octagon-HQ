-- PRIVATE NBA GM owner release: stronger starters, consistent bench value,
-- meaningful postseason outcome, tighter new-run variance and action diagnostics.
-- Completed snapshots are untouched; new playthroughs receive these rules.
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
    select e.ordinality::integer as n,p.id,p.positions,p.overall
    from jsonb_array_elements_text(v_ids) with ordinality e(id,ordinality)
    join private.nba_gm_dev_players p on p.id=e.id
  ), arrangements as (
    select 0::integer as n,'[]'::jsonb as picks,array[]::text[] as used,
      0::integer as bench_cost,0::integer as off_role_cost,0::integer as starter_power
    union all
    select a.n+1,a.picks||jsonb_build_array(jsonb_build_object('slot',s.slot,'playerId',p.id)),
      array_append(a.used,s.slot),
      a.bench_cost+case when s.slot in ('GUARD','BIG') then 1 else 0 end,
      a.off_role_cost+case when s.slot=p.positions[1] then 0 else 1 end,
      a.starter_power+case when s.slot in ('GUARD','BIG') then 0 else p.overall end
    from arrangements a join ordered p on p.n=a.n+1
    cross join lateral unnest(array['PG','SG','SF','PF','C','GUARD','BIG']) s(slot)
    where not s.slot=any(a.used)
      and (s.slot=any(p.positions)
        or (s.slot='GUARD' and p.positions && array['PG','SG'])
        or (s.slot='BIG' and p.positions && array['PF','C']))
  )
  select a.picks into v_out from arrangements a where a.n=v_count
  order by a.bench_cost,a.starter_power desc,a.off_role_cost,a.picks::text limit 1;
  return v_out;
end;
$$;
revoke all on function private.nba_gm_v2_assign(jsonb,text) from public,anon,authenticated;

create or replace function private.nba_gm_v2_season(p_state jsonb,p_year integer)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare
  v_off numeric;v_def numeric;v_fit numeric;v_floor numeric;
  v_best_creator numeric:=0;v_second_creator numeric:=0;v_star_bonus numeric:=0;
  v_noise integer;v_wins integer;v_finish text;v_estimated_net numeric;
  v_roll integer;v_cutoff integer;v_round integer;
  v_turnover integer:=coalesce(jsonb_array_length(p_state->'releasedIds'),0)
     +coalesce((p_state->>'tradesUsed')::integer,0);
begin
  select
    sum((((p.skills->>'scoring')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall)*.33+((p.skills->>'shooting')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall)*.25
        +((p.skills->>'playmaking')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall)*.27+((p.skills->>'rebounding')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall)*.10
        +((p.skills->>'interiorDefense')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall)*.05)
      *case when pick->>'slot' in ('GUARD','BIG') then .55 else 1 end)/6.1,
    sum((((p.skills->>'perimeterDefense')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall)
        *case when pick->>'slot' in ('PG','SG','SF','GUARD') then .57 else .30 end
      +((p.skills->>'interiorDefense')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall)
        *case when pick->>'slot' in ('C','PF','BIG') then .55 else .23 end
      +((p.skills->>'rebounding')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall)*.18)
      /case when pick->>'slot' in ('PG','SG','SF','GUARD') then .98 else 1.03 end
      *case when pick->>'slot' in ('GUARD','BIG') then .55 else 1 end)/6.1,
    sum(case when pick->>'slot'='PG' then ((p.skills->>'playmaking')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall)*.35
      when pick->>'slot'='C' then (((p.skills->>'interiorDefense')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall)
        +((p.skills->>'rebounding')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall))*.175
      when pick->>'slot' in ('SG','SF') then (((p.skills->>'shooting')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall)
        +((p.skills->>'perimeterDefense')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall))*.175
      when pick->>'slot'='PF' then (((p.skills->>'interiorDefense')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall)
        +((p.skills->>'rebounding')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall))*.175 else 0 end)/5,
    min(case when pick->>'slot' in ('PG','SG','SF','PF','C')
      then least(((p.skills->>'scoring')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall),((p.skills->>'perimeterDefense')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall)+10)
      else 99 end)
  into v_off,v_def,v_fit,v_floor
  from jsonb_array_elements(p_state->'picks') pick
  join private.nba_gm_dev_players p on p.id=pick->>'playerId';
  if v_off is null or v_def is null
     or jsonb_array_length(p_state->'picks')<>7 then raise exception 'NBA rotation incomplete'; end if;

  -- NBA-only 7-man calibration: five starters can be carried offensively
  -- by two elite creators, but a bad defense still materially hurts.
  -- Never use this correction for original V2/V3 save models.
  if p_state->>'economyVersion'='3'
     and p_state->>'developmentModelVersion'='2' then
    select coalesce(max(creator) filter (where rank=1),0),
           coalesce(max(creator) filter (where rank=2),0)
      into v_best_creator,v_second_creator
    from (
      select ((p.skills->>'scoring')::numeric*.65
             +(p.skills->>'playmaking')::numeric*.35
             +private.nba_gm_v3_grade(p_state,p.id,p_year)-p.overall) creator,
         row_number() over(order by
             ((p.skills->>'scoring')::numeric*.65
             +(p.skills->>'playmaking')::numeric*.35
             +private.nba_gm_v3_grade(p_state,p.id,p_year)-p.overall) desc) rank
      from jsonb_array_elements(p_state->'picks') pick
      join private.nba_gm_dev_players p on p.id=pick->>'playerId'
      where pick->>'slot' in ('PG','SG','SF','PF','C')
    ) starters;
    v_star_bonus:=least(3.75,
      greatest(0,v_best_creator-86)*.22
      +greatest(0,v_second_creator-84)*.12);
  end if;
  -- Only new V4-development franchises use the tighter +/-3 win variance.
  -- Legacy seeds and completed saves keep their original +/-5 calculation.
  v_noise:=(abs(('x'||substr(md5(p_state->>'seed'||':'||p_year),1,8))::bit(32)::int::bigint)%11)::integer-5;
  -- Clamp the SAME old seed roll, rather than changing the modulo and
  -- making a formerly unlucky franchise suddenly lucky (or vice versa).
  if p_state->>'economyVersion'='3' and p_state->>'developmentModelVersion'='2'
    then v_noise:=greatest(-3,least(3,v_noise)); end if;
  -- The 150 historical team-seasons establish W = 40.9983 + 2.2684
  -- times OBSERVED net rating on a 2025–26 walk-forward holdout.
  -- The seven-athlete skill -> estimated net rating mapping below remains
  -- an explicitly PROVISIONAL game assumption, not a fitted lineup forecast.
  if p_state->>'economyVersion' is distinct from '3' then
    -- Exact legacy V2 win conversion, preserving preexisting save behavior.
    v_wins:=greatest(8,least(74,round(
      41+(v_off-78)*1.2+(v_def-78)*1.05+(v_fit-27)*.35
        +least(0,(v_floor-65))*.2
        -case when p_year=1 then 0 else greatest(0,v_turnover-2)*.8 end+v_noise
    )::integer));
  else
    v_estimated_net:=(v_off-78)*.529+(v_def-78)*.463
      +(v_fit-27)*.154+least(0,(v_floor-65))*.088
      -case when p_year=1 then 0 else greatest(0,v_turnover-2)*.353 end
      +case when p_state->>'developmentModelVersion'='2' then 3.0+v_star_bonus else 0 end;
    v_wins:=greatest(8,least(74,round(
      40.9983+2.2684*v_estimated_net+v_noise
    )::integer));
  end if;
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

create or replace function private.nba_gm_v3_final_score(p_state jsonb)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare
 v_roster numeric:=0;v_record numeric:=0;v_playoff numeric:=0;
 v_grade numeric;v_year integer;v_finish text;v_ovr numeric;
 v_team numeric;v_score numeric;
begin
 if jsonb_array_length(p_state->'results')<>3
   or jsonb_array_length(p_state->'picks')<>7 then
   raise exception 'Final score requires a complete 3-season franchise';
 end if;
 for v_year in 1..3 loop
   select avg(private.nba_gm_v3_grade(p_state,pick->>'playerId',v_year)*
     case when pick->>'slot' in ('GUARD','BIG') then .55 else 1 end)
     /avg(case when pick->>'slot' in ('GUARD','BIG') then .55 else 1 end)
     into v_grade from jsonb_array_elements(
       case when v_year=1 then p_state->'yearOnePicks' else p_state->'picks' end) pick;
   -- NFL-like grade-to-OVR compression; exact grades never revealed.
   v_ovr:=greatest(60,least(99,round(70+(v_grade-76)*1.5)));
   v_roster:=v_roster+v_ovr;
   v_record:=v_record+(p_state->'results'->(v_year-1)->>'wins')::numeric;
   v_finish:=p_state->'results'->(v_year-1)->>'finish';
   v_playoff:=v_playoff+case v_finish when 'Champion' then 100
     when 'Finals' then 95 when 'Conference Finals' then 89
     when 'Conference Semifinals' then 80 when 'First Round' then 68
     when 'Missed Playoffs' then 25 else 0 end;
 end loop;
 v_roster:=round(v_roster/3,1);
 v_record:=round(60+40*v_record/(82*3),1);
 v_playoff:=round(v_playoff/3,1);
 v_score:=round(v_roster*.90+v_record*.03+v_playoff*.07,1);
 return jsonb_build_object('score',v_score,'roster',v_roster,
   'regularSeason',v_record,'playoffs',v_playoff,
   'weights',jsonb_build_array(.90,.03,.07));
end;
$$;
revoke all on function private.nba_gm_v3_final_score(jsonb) from public,anon,authenticated;

create table if not exists private.nba_gm_dev_action_events (
  run_id uuid not null references private.football_gm_runs(id) on delete cascade,
  revision integer not null check (revision>0),
  action text not null,
  player_id text,
  trade_chip_id text,
  team_code text,
  phase text not null,
  accepted boolean,
  created_at timestamptz not null default now(),
  primary key(run_id,revision)
);
revoke all on private.nba_gm_dev_action_events from public,anon,authenticated;
alter table private.nba_gm_dev_action_events enable row level security;

create or replace function public.nba_gm_dev_action(
  p_action text,p_slot text default null,p_player_id text default null
) returns jsonb language plpgsql security definer set search_path='' as $$
declare
  v_profile uuid:=auth.uid();v_run_id uuid;v_state jsonb;v_next jsonb;
  v_player private.nba_gm_dev_players%rowtype;
  v_old private.nba_gm_dev_players%rowtype;
  v_picks jsonb;v_team text;v_revision integer;v_year integer;v_spend bigint;
  v_old_id text;v_result jsonb;v_attempts integer;v_count integer;
  v_chip_grade numeric;v_offer_value numeric;v_ask numeric;v_chip_id text;
begin
  if not private.nba_gm_dev_owner() then raise exception 'NBA GM playtest access required'; end if;
  if (select count(*) from private.nba_gm_dev_players)<>330 then
    raise exception 'NBA GM private player bank unavailable'; end if;
  if p_action='start' then
    v_state:=jsonb_build_object('version','nba-gm-dev-v2',
      'seed','nba-gm-'||extensions.gen_random_uuid()::text,
      'economyVersion',3,'developmentModelVersion',2,'phase','draft','picks','[]'::jsonb,'yearOnePicks','[]'::jsonb,'pendingTeam',null,
      'pendingSlot',null,'spinIndex',0,'caps',jsonb_build_array(155000000,155000000,155000000),
      'results','[]'::jsonb,'shopPlayerId',null,'tradeTeam',null,
      'tradeAttempts',0,'tradesUsed',0,'freeAgencyTeam',null,
      'freeAgencyVisits',0,'releasedIds','[]'::jsonb);
    perform set_config('octagon.nba_gm_dev_authorized_write','yes',true);
    insert into private.football_gm_runs(profile_id,seed,game_version,state)
      values(v_profile,v_state->>'seed','nba-gm-dev-v2',v_state) returning id into v_run_id;
    insert into private.football_gm_run_snapshots(run_id,revision,state) values(v_run_id,1,v_state);
    insert into private.nba_gm_dev_action_events(run_id,revision,action,phase)
      values(v_run_id,1,'start','draft');
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
    -- Randomize teams first; stop on the FIRST team with legal candidates.
    -- Avoid 330 expensive recursive matching calls before the wheel responds.
    v_team:=null;
    for v_team in select x.team_code from (select distinct team_code
        from private.nba_gm_dev_players) x order by random() loop
      if exists(select 1 from private.nba_gm_dev_players p
        where p.team_code=v_team and private.nba_gm_v2_can_add(v_state,p.id)) then exit; end if;
      v_team:=null;
    end loop;
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
    v_next:=jsonb_set(v_next,'{development}',
      private.nba_gm_v3_development_report(v_next,v_picks));
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
    -- All potential partners are visible, not only one-for-one legal swaps.
    select team_code into v_team from (
      select distinct team_code from private.nba_gm_dev_players
      where team_code<>v_old.team_code
    ) possible order by random() limit 1;
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
      or exists(select 1 from jsonb_array_elements(v_picks) x where x->>'playerId'=p_player_id)
      then raise exception 'Target is not an available player from your trade partner'; end if;
    -- Optional second outgoing asset through the existing p_slot argument.
    -- Never trust a client-owned slot or arbitrary extra player.
    v_chip_id:=nullif(p_slot,'');
    if v_chip_id is not null and (v_chip_id=v_old_id or
       not exists(select 1 from jsonb_array_elements(v_picks) x
          where x->>'playerId'=v_chip_id)) then
      raise exception 'Additional trade chip must be another rostered player';
    end if;
    select coalesce(jsonb_agg(pick),'[]'::jsonb) into v_picks
      from jsonb_array_elements(v_picks) pick
      where pick->>'playerId'<>v_old_id
        and (v_chip_id is null or pick->>'playerId'<>v_chip_id);
    v_result:=jsonb_set(v_state,'{picks}',v_picks);
    -- All targets remain visible; impossible packages get explicit feedback.
    if not private.nba_gm_v2_can_add(v_result,p_player_id) then
      raise exception 'Trade target needs different outgoing assets or more cap room'; end if;
    v_offer_value:=private.nba_gm_v3_grade(v_state,v_old_id,2);
    if v_chip_id is not null then
      v_chip_grade:=private.nba_gm_v3_grade(v_state,v_chip_id,2);
      v_offer_value:=v_offer_value+greatest(0,(v_chip_grade-69)*.32);
    end if;
    v_ask:=private.nba_gm_v3_grade(v_state,p_player_id,2)
      +case when v_player.overall>=95 then 4
            when v_player.overall>=89 then 2.5 else 1 end;
    v_attempts:=(v_state->>'tradeAttempts')::integer+1;
    v_next:=jsonb_set(v_state,'{tradeAttempts}',to_jsonb(v_attempts));
    if v_offer_value>=v_ask then
      v_picks:=private.nba_gm_v2_assign(v_picks,p_player_id);
      v_next:=jsonb_set(jsonb_set(jsonb_set(jsonb_set(v_next,'{picks}',v_picks),
        '{shopPlayerId}','null'::jsonb),'{tradeTeam}','null'::jsonb),
        '{tradesUsed}',to_jsonb((v_state->>'tradesUsed')::integer+1));
      -- Two-for-one deals create a vacancy. Guarantee one legal affordable
      -- replacement before finalizing that structural transaction.
      if v_chip_id is not null and not exists(
        select 1 from private.nba_gm_dev_players p
        where private.nba_gm_v3_contract_for_state(v_state,p.id)='1YR' and p.overall<=81
          and not exists(select 1 from jsonb_array_elements(v_picks) x
            where x->>'playerId'=p.id)
          and private.nba_gm_v2_can_add(v_next,p.id)) then
        raise exception 'Trade package leaves no affordable 1YR roster completion';
      end if;
    elsif v_attempts>=2 then
      v_next:=jsonb_set(jsonb_set(v_next,'{shopPlayerId}','null'::jsonb),
        '{tradeTeam}','null'::jsonb);
    end if;
  elsif p_action='cancel-trade' then
    if v_state->>'phase'<>'offseason' then raise exception 'Offseason only'; end if;
    v_next:=jsonb_set(jsonb_set(v_state,'{shopPlayerId}','null'::jsonb),
      '{tradeTeam}','null'::jsonb);
  elsif p_action='release' then
    if v_state->>'phase'<>'offseason' or
      (jsonb_array_length(v_state->'releasedIds')>=1 and not exists(
        select 1 from generate_series(2,3) yr where
          (select coalesce(sum(private.nba_gm_v3_salary(v_state,x->>'playerId',yr)),0)
            from jsonb_array_elements(v_picks) x) > (v_state->'caps'->>(yr-1))::bigint))
      or v_state->>'shopPlayerId' is not null or v_state->>'freeAgencyTeam' is not null
      or not exists(select 1 from jsonb_array_elements(v_picks) pick where pick->>'playerId'=p_player_id)
      then raise exception 'You can release one player in this offseason'; end if;
    select coalesce(jsonb_agg(pick),'[]'::jsonb) into v_picks
      from jsonb_array_elements(v_picks) pick where pick->>'playerId'<>p_player_id;
    v_next:=jsonb_set(jsonb_set(v_state,'{picks}',v_picks),
      '{releasedIds}',(v_state->'releasedIds')||jsonb_build_array(p_player_id));
    -- Never finalize a cut unless at least one legal, affordable 1YR replacement exists.
    if not exists(select 1 from private.nba_gm_dev_players p
      where private.nba_gm_v3_contract_for_state(v_state,p.id)='1YR'
        and p.id not in(select x.id from jsonb_array_elements_text(v_next->'releasedIds') x(id))
        and private.nba_gm_v2_can_add(v_next,p.id)) then
      raise exception 'No affordable 1YR replacement; keep this player';
    end if;
  -- NFL-style emergency market: never strand a franchise after a release.
  elsif p_action='fa-spin' then
    if v_state->>'phase'<>'offseason' or jsonb_array_length(v_picks)>=7
      or (v_state->>'freeAgencyVisits')::integer>=3
      or v_state->>'freeAgencyTeam' is not null
      or v_state->>'shopPlayerId' is not null
      then raise exception 'No free-agent market visit available'; end if;
    select teams.team_code into v_team from (
      select distinct team_code from private.nba_gm_dev_players
    ) teams where exists(select 1 from private.nba_gm_dev_players p
      where p.team_code=teams.team_code and private.nba_gm_v3_contract_for_state(v_state,p.id)='1YR'
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
      or private.nba_gm_v3_contract_for_state(v_state,p_player_id)<>'1YR'
      or p_player_id in(select x.id from jsonb_array_elements_text(v_state->'releasedIds') x(id))
      or not private.nba_gm_v2_can_add(v_state,p_player_id)
      then raise exception 'Free agent is not eligible'; end if;
    v_picks:=private.nba_gm_v2_assign(v_picks,p_player_id);
    v_next:=jsonb_set(jsonb_set(v_state,'{picks}',v_picks),
      '{freeAgencyTeam}','null'::jsonb);
  elsif p_action='pass-fa' then
    if v_state->>'phase'<>'offseason' or v_state->>'freeAgencyTeam' is null
      then raise exception 'No market visit to pass'; end if;
    v_next:=jsonb_set(v_state,'{freeAgencyTeam}','null'::jsonb);
  elsif p_action='emergency-sign' then
    if v_state->>'phase'<>'offseason' or jsonb_array_length(v_picks)>=7
      or (v_state->>'freeAgencyVisits')::integer<3
      or v_state->>'freeAgencyTeam' is not null or v_state->>'shopPlayerId' is not null
      then raise exception 'Emergency signings require exhausted visits and an open slot'; end if;
    select * into v_player from private.nba_gm_dev_players where id=p_player_id;
    if not found or v_player.overall>78 or private.nba_gm_v3_contract_for_state(v_state,p_player_id)<>'1YR'
      or p_player_id in(select x.id from jsonb_array_elements_text(v_state->'releasedIds') x(id))
      or not private.nba_gm_v2_can_add(v_state,p_player_id)
      then raise exception 'Only affordable depth free agents can fill an emergency vacancy'; end if;
    v_picks:=private.nba_gm_v2_assign(v_picks,p_player_id);
    v_next:=jsonb_set(v_state,'{picks}',v_picks);
  elsif p_action='advance' then
    if v_state->>'phase'<>'offseason'
      or jsonb_array_length(v_picks)<>7 or v_state->>'shopPlayerId' is not null
      or v_state->>'freeAgencyTeam' is not null
      then raise exception 'Complete the seven-player offseason roster first'; end if;
    if private.nba_gm_v2_assign(v_picks) is null then raise exception 'Invalid positions'; end if;
    for v_year in 2..3 loop
      select coalesce(sum(private.nba_gm_v3_salary(v_state,pick->>'playerId',v_year)),0)
        into v_spend from jsonb_array_elements(v_picks) pick;
      if v_spend>(v_state->'caps'->>(v_year-1))::bigint then raise exception 'Future salary cap exceeded'; end if;
    end loop;
    v_next:=jsonb_set(jsonb_set(v_state,'{results}',
      (v_state->'results')||jsonb_build_array(
        private.nba_gm_v2_season(v_state,2),private.nba_gm_v2_season(v_state,3))),
        '{phase}','"final"'::jsonb);
    v_next:=jsonb_set(v_next,'{development}',
      private.nba_gm_v3_development_report(v_next,v_picks));
    v_next:=jsonb_set(v_next,'{scoreBreakdown}',private.nba_gm_v3_final_score(v_next));
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
  -- Attach the real owner action to the canonical snapshot. Failed RPCs roll
  -- back and cannot forge successful actions; declined trade offers are kept.
  insert into private.nba_gm_dev_action_events
    (run_id,revision,action,player_id,trade_chip_id,team_code,phase,accepted)
  values(v_run_id,v_revision,p_action,p_player_id,
    case when p_action='trade' then p_slot else null end,
    case when p_action='spin' then v_next->>'pendingTeam'
         when p_action='trade-spin' then v_next->>'tradeTeam'
         when p_action='fa-spin' then v_next->>'freeAgencyTeam'
         else coalesce(v_state->>'tradeTeam',v_state->>'freeAgencyTeam') end,
    v_next->>'phase',
    case when p_action='trade' then (v_next->>'tradesUsed')::integer>(v_state->>'tradesUsed')::integer else null end);
  perform set_config('octagon.nba_gm_dev_authorized_write','',true);
  return v_next;
end;
$$;
revoke all on function public.nba_gm_dev_action(text,text,text) from public,anon;
grant execute on function public.nba_gm_dev_action(text,text,text) to authenticated;
