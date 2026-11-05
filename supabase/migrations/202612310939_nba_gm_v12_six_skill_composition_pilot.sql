-- NBA GM V12 experimental six-skill composition model. NOT a public release.
-- Existing V11/new franchises stay at $175M; old versions and saved runs stay unchanged.
-- This migration installs an isolated versioned comparison engine and future-season
-- lineup optimizer. Do not switch the action RPC to 12 until matched simulations pass.
-- Calibration intercept (6.01 net) is a provisional matched-fixture median estimate:
-- 984 $175M position-legal seven-player cores sampled from the live 330-player pool.
-- Those samples are not NBA historical player-minute regressions.

create or replace function private.nba_gm_v12_components(
  p_state jsonb,p_year integer,p_picks jsonb)
returns jsonb language plpgsql stable security definer set search_path='' as $components$
declare
  v_pick jsonb;v_player private.nba_gm_dev_players%rowtype;
  v_slot text;v_dev numeric;v_sc numeric;v_sh numeric;v_pm numeric;
  v_pd numeric;v_id numeric;v_reb numeric;v_oi numeric;v_di numeric;
  v_obo numeric;v_dbo numeric;v_weight numeric;
  v_off numeric:=0;v_def numeric:=0;v_off_fit numeric;v_def_fit numeric;
  v_sh_good numeric:=0;v_sh_bad numeric:=0;
  v_score_top numeric:=0;v_score_second numeric:=0;
  v_pass_top numeric:=0;v_pass_second numeric:=0;
  v_rim_top numeric:=0;v_rim_second numeric:=0;
  v_reb_pf numeric:=70;v_reb_c numeric:=70;
  v_poor_perim numeric:=0;v_spacing numeric;v_scoring numeric;
  v_big_creator numeric:=0;
  v_playmaking numeric;v_rebounding numeric;v_interior numeric;v_perimeter numeric;
  v_count integer:=0;v_starters integer:=0;
  v_scorer_ranks numeric[];v_creator_ranks numeric[];
  v_sc_weight numeric;v_pm_weight numeric;v_sc_base numeric;v_pm_base numeric;
  v_sc_elastic numeric;v_pm_elastic numeric;
begin
  if p_year not between 1 and 3
     or jsonb_typeof(p_picks)<>'array'
     or jsonb_array_length(p_picks)<>7 then
    raise exception 'V12 components require a legal seven-player season';
  end if;

  -- Rank the five starters before applying individual contributions: the
  -- marginal value of another high-usage scorer or creator is not constant
  -- when two strong primary/secondary options already share the floor.
  select array_agg((p.skills->>'scoring')::numeric
                   order by (p.skills->>'scoring')::numeric desc),
         array_agg((p.skills->>'playmaking')::numeric
                   order by (p.skills->>'playmaking')::numeric desc)
    into v_scorer_ranks,v_creator_ranks
    from jsonb_array_elements(p_picks) e(value)
    join private.nba_gm_dev_players p on p.id=e.value->>'playerId'
    where e.value->>'slot' not in ('GUARD','BIG');
  if coalesce(array_length(v_scorer_ranks,1),0)<>5
    or coalesce(array_length(v_creator_ranks,1),0)<>5 then
      raise exception 'V12 requires five known starters';
  end if;

  for v_pick in select value from jsonb_array_elements(p_picks) loop
    v_slot:=v_pick->>'slot';
    if v_slot not in ('PG','SG','SF','PF','C','GUARD','BIG') then
      raise exception 'V12 components received an unknown position';
    end if;
    select * into v_player from private.nba_gm_dev_players
      where id=v_pick->>'playerId';
    if not found then raise exception 'V12 components received an unknown player';end if;
    v_dev:=private.nba_gm_v3_grade(p_state,v_player.id,p_year)-v_player.overall;
    v_sc:=(v_player.skills->>'scoring')::numeric;
    v_sh:=(v_player.skills->>'shooting')::numeric;
    v_pm:=(v_player.skills->>'playmaking')::numeric;
    v_pd:=(v_player.skills->>'perimeterDefense')::numeric;
    v_id:=(v_player.skills->>'interiorDefense')::numeric;
    v_reb:=(v_player.skills->>'rebounding')::numeric;

    -- Scoring still rewards excellent finishers, but centers and forwards
    -- need not provide the same shooting/passing balance as ball handlers.
    v_oi:=case v_slot
      when 'PG' then .36*v_sc+.24*v_sh+.40*v_pm
      when 'SG' then .48*v_sc+.34*v_sh+.18*v_pm
      when 'SF' then .46*v_sc+.34*v_sh+.20*v_pm
      when 'PF' then .54*v_sc+.24*v_sh+.22*v_pm
      when 'C' then .65*v_sc+.20*v_sh+.15*v_pm
      when 'GUARD' then .43*v_sc+.26*v_sh+.31*v_pm
      else .60*v_sc+.22*v_sh+.18*v_pm end+v_dev;

    -- Smoothly taper tertiary scoring/creation value, rather than imposing
    -- a discontinuity at 80 or blindly valuing a fourth creator like a first.
    -- Recenter only the marginal deviation from this role's normal skill;
    -- a weak third scorer should not be double-punished for not being Luka.
    v_sc_weight:=case v_slot when 'PG' then .36 when 'SG' then .48
      when 'SF' then .46 when 'PF' then .54 when 'C' then .65
      when 'GUARD' then .43 else .60 end;
    v_pm_weight:=case v_slot when 'PG' then .40 when 'SG' then .18
      when 'SF' then .20 when 'PF' then .22 when 'C' then .15
      when 'GUARD' then .31 else .18 end;
    v_sc_base:=case v_slot when 'PG' then 77 when 'SG' then 74
      when 'SF' then 72 when 'PF' then 70 when 'C' then 64
      when 'GUARD' then 74 else 65 end;
    v_pm_base:=case v_slot when 'PG' then 78 when 'SG' then 69
      when 'SF' then 68 when 'PF' then 65 when 'C' then 58
      when 'GUARD' then 75 else 60 end;
    v_sc_elastic:=1-.40
      *greatest(0,least(1,(v_scorer_ranks[2]-85)/7))
      *greatest(0,least(1,(v_scorer_ranks[2]-v_sc+8)/16));
    v_pm_elastic:=1-.40
      *greatest(0,least(1,(v_creator_ranks[2]-81)/7))
      *greatest(0,least(1,(v_creator_ranks[2]-v_pm+8)/16));
    v_oi:=v_oi-v_sc_weight*(1-v_sc_elastic)*(v_sc-v_sc_base)
      -v_pm_weight*(1-v_pm_elastic)*(v_pm-v_pm_base);
    -- Reuse the sport-appropriate defensive role mix, changing its comparison
    -- baseline by assigned slot instead of treating a PG like a rim protector.
    v_di:=case v_slot
      when 'PG' then .80*v_pd+.20*v_reb
      when 'SG' then .85*v_pd+.15*v_reb
      when 'SF' then .65*v_pd+.20*v_id+.15*v_reb
      when 'PF' then .50*v_id+.25*v_pd+.25*v_reb
      when 'C' then .70*v_id+.30*v_reb
      when 'GUARD' then .80*v_pd+.20*v_reb
      else .70*v_id+.30*v_reb end+v_dev;
    v_obo:=case v_slot when 'PG' then 79 when 'SG' then 73
      when 'SF' then 72 when 'PF' then 72 when 'C' then 65
      when 'GUARD' then 75 else 69 end;
    v_dbo:=case v_slot when 'PG' then 68 when 'SG' then 69
      when 'SF' then 72 when 'PF' then 76 when 'C' then 80
      when 'GUARD' then 70 else 77 end;
    v_weight:=case when v_slot in ('GUARD','BIG') then .50 else .63 end;
    -- Preserve diminishing returns and caps, but avoid the 41/61-center
    -- floor saturation caused by the common 75 offensive comparison.
    v_off:=v_off+v_weight*greatest(-5.5,least(8,.45*(v_oi-v_obo)));
    v_def:=v_def+v_weight*greatest(-4.5,least(6.5,.23*(v_di-v_dbo)));

    if v_slot not in ('GUARD','BIG') then
      v_starters:=v_starters+1;
      -- Smooth, five-man spacing; one rim-running center is affordable,
      -- but a second/third severe non-shooter compounds the problem.
      v_sh_good:=v_sh_good+greatest(0,least(1,(v_sh-55)/25));
      v_sh_bad:=v_sh_bad+(case v_slot
        when 'PG' then 1.05 when 'SG' then 1.05 when 'SF' then .90
        when 'PF' then .90 else .35 end)
        *greatest(0,least(1,(60-v_sh)/40));
      if v_sc>=v_score_top then
        v_score_second:=v_score_top;v_score_top:=v_sc;
      elsif v_sc>v_score_second then v_score_second:=v_sc;end if;
      if v_pm>=v_pass_top then
        v_pass_second:=v_pass_top;v_pass_top:=v_pm;
      elsif v_pm>v_pass_second then v_pass_second:=v_pm;end if;
      if v_slot in ('PF','C') then
        -- Exceptional passing bigs can act as offensive hubs without requiring
        -- every conventional center to create like a point guard. A small
        -- uncapped lineup bonus preserves elite 95+ passing when the usual
        -- individual offensive rating is already at its role-specific cap.
        v_big_creator:=greatest(v_big_creator,greatest(0,least(.90,
          (v_pm-83)*(case when v_slot='C' then .060 else .035 end))));
        if v_id>=v_rim_top then
          v_rim_second:=v_rim_top;v_rim_top:=v_id;
        elsif v_id>v_rim_second then v_rim_second:=v_id;end if;
      end if;
      if v_slot='PF' then v_reb_pf:=v_reb;end if;
      if v_slot='C' then v_reb_c:=v_reb;end if;
      if v_slot in ('PG','SG','SF') and v_pd<65 then
        v_poor_perim:=v_poor_perim+power((65-v_pd)/25,1.2);
      end if;
    end if;
    v_count:=v_count+1;
  end loop;
  if v_count<>7 or v_starters<>5 then
    raise exception 'V12 components require five starters and two reserves';
  end if;

  v_spacing:=greatest(-.4,least(.28,(v_sh_good-3.35)*.18))
    -greatest(0,least(3,
      greatest(0,v_sh_bad-.42)*1.05+greatest(0,v_sh_bad-1.25)*.60));
  v_scoring:=greatest(-.6,least(.25,(v_score_top-85)*.024))
    +greatest(-.22,least(.23,(v_score_second-77)*.014));
  v_playmaking:=greatest(-.55,least(.24,(v_pass_top-83)*.024))
    +greatest(-.16,least(.16,(v_pass_second-72)*.012));
  -- Frontcourt rebounds produce both extra possessions and defensive stops.
  v_rebounding:=greatest(-.38,least(.30,
    (v_reb_pf+v_reb_c-145)*.011));
  -- A single rim anchor is valuable; the second contributes less.
  v_interior:=greatest(-.65,least(.4,(v_rim_top-84)*.034))
    +greatest(-.08,least(.13,(v_rim_second-80)*.011));
  -- Multi-weak-link exposure, on top of individual perimeter grade, remains
  -- small and bounded; it is not V9's flat extra defensive tax.
  v_perimeter:=-greatest(0,least(.70,greatest(0,v_poor_perim-.45)*.32));
  v_off_fit:=v_spacing+v_scoring+v_playmaking+v_big_creator+.35*v_rebounding;
  v_def_fit:=v_interior+v_perimeter+.65*v_rebounding;
  return jsonb_build_object(
    'off',v_off,'def',greatest(-9,least(6.25,v_def)),
    'offFit',v_off_fit,'defFit',v_def_fit,
    'spacing',v_spacing,'scoring',v_scoring,'playmaking',v_playmaking,
    'eliteBigCreation',v_big_creator,
    'perimeterDefense',v_perimeter,'interiorDefense',v_interior,
    'rebounding',v_rebounding,'severeNonShooterLoad',v_sh_bad,
    'lineupFit',greatest(-1.5,least(1.5,v_off_fit+v_def_fit)));
end;
$components$;

revoke all on function private.nba_gm_v12_components(jsonb,integer,jsonb)
  from public,anon,authenticated;

-- Clone the already-audited legal seven-slot exhaustive optimizer. Within
-- equal bench count, a small cohesion credit can promote a better five
-- instead of blindly taking the five highest developed overalls.
do $v12_lineup$
declare v_def text;v_old text;v_new text;
begin
 select pg_get_functiondef('private.nba_gm_v10_season_lineup(jsonb,integer)'::regprocedure)
  into v_def;
 v_old:='order by a.bench_cost,a.starter_power desc,a.off_role_cost,a.picks::text limit 1;';
 v_new:='order by a.bench_cost,
    (a.starter_power + 2*(
      (private.nba_gm_v12_components(p_state,p_year,a.picks)->>''lineupFit'')::numeric
    )) desc,
    a.starter_power desc,a.off_role_cost,a.picks::text limit 1;';
 if v_def is null
    or position('FUNCTION private.nba_gm_v10_season_lineup(' in v_def)=0
    or position(v_old in v_def)=0
    or position('private.nba_gm_v3_grade(p_state,p.id,p_year)' in v_def)=0
    then raise exception 'V10 lineup optimizer drifted: refuse V12 pilot';end if;
 v_def:=replace(v_def,'FUNCTION private.nba_gm_v10_season_lineup(',
   'FUNCTION private.nba_gm_v12_season_lineup(');
 v_def:=replace(v_def,v_old,v_new);
 execute v_def;
end;
$v12_lineup$;
revoke all on function private.nba_gm_v12_season_lineup(jsonb,integer)
  from public,anon,authenticated;

-- Clone the complete, existing V11 engine. Keep its win anchors, real opponent
-- pool, seeded playoffs, title-odds mapping and 90/3/7 score intact.
do $v12_pilot$
declare v_def text;v_old text;v_new text;
begin
 select pg_get_functiondef('private.nba_gm_v11_season(jsonb,integer)'::regprocedure)
   into v_def;
 if v_def is null
  or position('FUNCTION private.nba_gm_v11_season(' in v_def)=0
  or position($needle$simulationModelVersion' is distinct from '11'$needle$ in v_def)=0
  or position('private.nba_gm_v10_season_lineup(p_state,p_year)' in v_def)=0
  or position('private.nba_gm_v9_overall(v_net)' in v_def)=0
  or position('private.nba_gm_v7_outcome_odds(v_strength)' in v_def)=0
  then raise exception 'V11 baseline drifted: refuse V12 pilot';end if;
 v_def:=replace(v_def,'FUNCTION private.nba_gm_v11_season(',
   'FUNCTION private.nba_gm_v12_season(');
 v_def:=replace(v_def,
   $needle$simulationModelVersion' is distinct from '11'$needle$,
   $needle$simulationModelVersion' is distinct from '12'$needle$);
 v_old:=$needle$p_year>1 and p_state->>'lineupModelVersion'='1'
      then private.nba_gm_v10_season_lineup(p_state,p_year)$needle$;
 v_new:=$needle$p_year>1 and p_state->>'lineupModelVersion'='2'
      then private.nba_gm_v12_season_lineup(p_state,p_year)$needle$;
 if position(v_old in v_def)=0 then
   raise exception 'V11 season lineup source drifted';end if;
 v_def:=replace(v_def,v_old,v_new);
 v_def:=replace(v_def,
   'v_finish text:=''Missed Playoffs'';',
   'v_finish text:=''Missed Playoffs'';v_v12 jsonb;');
 v_old:='v_fit:=greatest(-1.0,least(1.0,v_fit));';
 v_new:='v_v12:=private.nba_gm_v12_components(p_state,p_year,
     case when p_year>1 and p_state->>''lineupModelVersion''=''2''
       then private.nba_gm_v12_season_lineup(p_state,p_year)
       else p_state->''picks'' end);
   v_off:=(v_v12->>''off'')::numeric;
   v_def:=(v_v12->>''def'')::numeric;
   v_fit:=(v_v12->>''offFit'')::numeric+(v_v12->>''defFit'')::numeric;';
 if position(v_old in v_def)=0 then
   raise exception 'V11 fit source drifted';end if;
 v_def:=replace(v_def,v_old,v_new);
 v_old:='(.75*v_off)+(.75*v_def)+v_fit-.6-least(1.7,greatest(0,89-v_creator_top)*.20)';
 v_new:='(.75*v_off)+(.75*v_def)+v_fit-6.01';
 if position(v_old in v_def)=0 then
   raise exception 'V11 net formula drifted';end if;
 v_def:=replace(v_def,v_old,v_new);
 v_old:='v_off_grade:=greatest(60,least(99,round(85+1.75*(.75*v_off-.6-least(1.7,greatest(0,89-v_creator_top)*.20)))::integer));';
 v_new:='v_off_grade:=greatest(60,least(99,round(85+1.75*(.75*v_off+(v_v12->>''offFit'')::numeric-4.8))::integer));';
 if position(v_old in v_def)=0 then
   raise exception 'V11 offense grade drifted';end if;
 v_def:=replace(v_def,v_old,v_new);
 v_old:='v_def_grade:=greatest(60,least(99,round(85+1.75*(.75*v_def))::integer));';
 v_new:='v_def_grade:=greatest(60,least(99,round(85+1.75*(.75*v_def+(v_v12->>''defFit'')::numeric-1.21))::integer));';
 if position(v_old in v_def)=0 then
   raise exception 'V11 defense grade drifted';end if;
 v_def:=replace(v_def,v_old,v_new);
 -- Keep UI's positional fit readout in its historic bounded display range.
 v_def:=replace(v_def,'round(27+v_fit*2,1)',
   'round(27+greatest(-2,least(2,v_fit))*2,1)');
 if position('v_fit-.6-least(' in v_def)>0
    or position('85+1.75*(.75*v_off-.6' in v_def)>0
    then raise exception 'V12 composition scoring replacement incomplete';end if;
 execute v_def;

 -- Read-only simulation and score dispatch; no new-start action alteration.
 select pg_get_functiondef('private.nba_gm_v11_final_score(jsonb)'::regprocedure)
   into v_def;
 if position('FUNCTION private.nba_gm_v11_final_score(' in v_def)=0
  or position($needle$simulationModelVersion'<>'11'$needle$ in v_def)=0
  or position('v_roster*.90+v_record*.03+v_playoff*.07' in v_def)=0
  then raise exception 'V11 final-score drifted';end if;
 v_def:=replace(v_def,'FUNCTION private.nba_gm_v11_final_score(',
   'FUNCTION private.nba_gm_v12_final_score(');
 v_def:=replace(v_def,
   $needle$simulationModelVersion'<>'11'$needle$,
   $needle$simulationModelVersion'<>'12'$needle$);
 execute v_def;

 select pg_get_functiondef('private.nba_gm_v2_season(jsonb,integer)'::regprocedure)
   into v_def;
 v_old:=$needle$if p_state->>'economyVersion'='4' and p_state->>'simulationModelVersion'='11' then$needle$;
 v_new:=$needle$if p_state->>'economyVersion'='4' and p_state->>'simulationModelVersion'='12' then
    return private.nba_gm_v12_season(p_state,p_year);
  end if;
  $needle$||v_old;
 if position(v_old in v_def)=0
  or position('return private.nba_gm_v12_season(p_state,p_year)' in v_def)>0
  then raise exception 'V11 season dispatcher drifted';end if;
 execute replace(v_def,v_old,v_new);

 select pg_get_functiondef('private.nba_gm_v3_final_score(jsonb)'::regprocedure)
   into v_def;
 v_old:=$needle$if p_state->>'simulationModelVersion'='11' then$needle$;
 v_new:=$needle$if p_state->>'simulationModelVersion'='12' then
   return private.nba_gm_v12_final_score(p_state);
 end if;
 $needle$||v_old;
 if position(v_old in v_def)=0
  or position('return private.nba_gm_v12_final_score(p_state)' in v_def)>0
  then raise exception 'V11 score dispatcher drifted';end if;
 execute replace(v_def,v_old,v_new);
end;
$v12_pilot$;
revoke all on function private.nba_gm_v12_season(jsonb,integer)
  from public,anon,authenticated;
revoke all on function private.nba_gm_v12_final_score(jsonb)
  from public,anon,authenticated;
