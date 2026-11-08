-- NBA GM Year 2 offseason display, bench fairness, and targeted roster strength.
-- Versioned: previous NBA GM V13 saves retain their recorded seasons and scores.
-- Only newly started franchises opt into the bounded creation-balance calibration.

-- An 87.95 developed starter must not miss the fairness check by .05 OVR.
-- Use the same 85 / 8-point gap in both the optimizer and candidate legality.
do $bench_fairness$
declare d text;
begin
 select pg_get_functiondef('private.nba_gm_v14_unfair_bench(jsonb,jsonb,integer)'::regprocedure) into d;
 if d is null or position('private.nba_gm_v3_grade(p_state,bp.id,p_year)>=88' in d)=0
    then raise exception 'NBA GM bench fairness source drift';end if;
 execute replace(d,
   'private.nba_gm_v3_grade(p_state,bp.id,p_year)>=88',
   'private.nba_gm_v3_grade(p_state,bp.id,p_year)>=85');

 select pg_get_functiondef('private.nba_gm_v15_fair_lineup_exists(jsonb,jsonb,integer)'::regprocedure) into d;
 if d is null or position('and p.grade>=88' in d)=0
    or position('and (e.value->>''grade'')::numeric>=88' in d)=0
    then raise exception 'NBA GM forward roster fairness source drift';end if;
 d:=replace(d,'and p.grade>=88','and p.grade>=85');
 d:=replace(d,'and (e.value->>''grade'')::numeric>=88',
               'and (e.value->>''grade'')::numeric>=85');
 execute d;
end $bench_fairness$;

-- The existing V13 composition engine remains intact. New games receive a
-- modest, bounded adjustment for weak lead-guard offense and multiple weak
-- starting positions. A secondary elite scorer/creator prevents a flat tax
-- on real two-star championship constructions; elite non-guard playmaking
-- (e.g. a point center) mitigates the need for lead-guard creation.
-- Seasonal development already affects the underlying skill model: do not
-- double-charge a player's regression as a separate decline modifier.
do $calibrate_new_runs$
declare d text; needle text;
begin
 select pg_get_functiondef('private.nba_gm_v13_season(jsonb,integer)'::regprocedure) into d;
 needle:=$old$ v_finish text:='Missed Playoffs';v_v12 jsonb;v_v12_lineup jsonb;$old$;
 if d is null or position(needle in d)=0
    or position('strengthCalibrationVersion' in d)>0
    then raise exception 'NBA GM V13 calibration baseline drift';end if;
 d:=replace(d,needle,
 $new$ v_finish text:='Missed Playoffs';v_v12 jsonb;v_v12_lineup jsonb;
 v_guard_play numeric;v_guard_score numeric;v_team_play numeric;
 v_weak_starters integer;v_star_count integer;v_creation_drag numeric;$new$);
 needle:=$old$ -- 150/150 cohort walk-forward 2025-26 calibration:$old$;
 if position(needle in d)=0 then raise exception 'NBA GM V13 net-rating location drift';end if;
 d:=replace(d,needle,
 $new$ -- New-run reliability calibration; preserve saved V13 seeds exactly.
 if p_state->>'strengthCalibrationVersion'='1' then
   select max((p.skills->>'playmaking')::numeric)
             filter(where pick.value->>'slot' in ('PG','SG')),
          max((p.skills->>'scoring')::numeric)
             filter(where pick.value->>'slot' in ('PG','SG')),
          max((p.skills->>'playmaking')::numeric)
             filter(where pick.value->>'slot' not in ('GUARD','BIG')),
          count(*) filter(where pick.value->>'slot' not in ('GUARD','BIG')
             and private.nba_gm_v3_grade(p_state,p.id,p_year)<80),
          count(*) filter(where pick.value->>'slot' not in ('GUARD','BIG')
             and private.nba_gm_v3_grade(p_state,p.id,p_year)>=90)
     into v_guard_play,v_guard_score,v_team_play,v_weak_starters,v_star_count
     from jsonb_array_elements(v_v12_lineup) pick(value)
     join private.nba_gm_dev_players p on p.id=pick.value->>'playerId';
   v_creation_drag:=least(1.35,
       greatest(0,(85-coalesce(v_guard_play,85))*.075)
       +greatest(0,(83-coalesce(v_guard_score,83))*.060)
       +greatest(0,v_weak_starters-1)*.18)
       *case when v_star_count>=2 then .35 else 1 end
       *greatest(.25,1-greatest(0,coalesce(v_team_play,85)-87)*.08);
   v_net:=greatest(-13.0,least(14.0,v_net-v_creation_drag));
 end if;
 -- 150/150 cohort walk-forward 2025-26 calibration:$new$);
 execute d;
end $calibrate_new_runs$;

-- Store the upcoming season's actual server-optimized positions while the
-- user is in the offseason. The final simulation still independently owns
-- Year 2 and Year 3 results and saves immutable seasonPicks snapshots.
do $offseason_year_two$
declare d text; needle text; p_start integer;p_end integer; segment text;
begin
 select pg_get_functiondef('public.nba_gm_dev_action(text,text,text)'::regprocedure) into d;
 if d is null or position('strengthCalibrationVersion' in d)>0
    then raise exception 'NBA GM action source drift';end if;
 needle:=$old$'rosterQualityVersion',1,'playoffScoringVersion',2$old$;
 if position(needle in d)=0 then raise exception 'NBA GM new-start options drift';end if;
 d:=replace(d,needle,
    $new$'rosterQualityVersion',1,'strengthCalibrationVersion',1,'playoffScoringVersion',2$new$);
 p_start:=position('elsif p_action=''offseason'' then' in d);
 p_end:=position('elsif p_action=''shop'' then' in d);
 if p_start=0 or p_end<=p_start then raise exception 'NBA GM offseason branch drift';end if;
 segment:=substring(d from p_start for p_end-p_start);
 needle:='private.nba_gm_v14_season_lineup(v_next,3)';
 if (length(segment)-length(replace(segment,needle,'')))/length(needle)<>1
    then raise exception 'NBA GM Year 3 offseason target drift';end if;
 segment:=replace(segment,needle,'private.nba_gm_v14_season_lineup(v_next,2)');
 d:=substring(d from 1 for p_start-1)||segment||substring(d from p_end);
 needle:=$old$  if v_state->>'rosterQualityVersion'='1'
     and p_action in ('trade','promote-displaced','sign','emergency-sign','advance')
     and jsonb_array_length(v_next->'picks')=7
     and not private.nba_gm_v14_roster_ok(v_next,v_next->'picks') then$old$;
 if position(needle in d)=0 then raise exception 'NBA GM roster-quality guard drift';end if;
 d:=replace(d,needle,
 $new$  -- Re-optimise each complete offseason rotation for the upcoming Year 2,
  -- including after a signing/trade. Leave incomplete rosters and pending
  -- negotiations untouched. No changes to Year 1 saved assignments.
  if v_state->>'rosterQualityVersion'='1'
     and v_next->>'phase'='offseason'
     and p_action in ('offseason','trade','sign','emergency-sign',
                      'promote-displaced','release-displaced','cancel-trade')
     and jsonb_array_length(v_next->'picks')=7
     and v_next->>'shopPlayerId' is null and v_next->>'tradeTeam' is null
     and jsonb_array_length(coalesce(v_next->'displacedAssets','[]'::jsonb))=0 then
    v_next:=jsonb_set(v_next,'{picks}',
       private.nba_gm_v14_season_lineup(v_next,2));
  end if;
  if v_state->>'rosterQualityVersion'='1'
     and p_action in ('trade','promote-displaced','sign','emergency-sign','advance')
     and jsonb_array_length(v_next->'picks')=7
     and not private.nba_gm_v14_roster_ok(v_next,v_next->'picks') then$new$);
 execute d;
end $offseason_year_two$;

-- All private helper access remains revoked (the public action RPC is the
-- existing authenticated boundary; no new public functions are introduced).
revoke all on function private.nba_gm_v14_unfair_bench(jsonb,jsonb,integer) from public,anon,authenticated;
revoke all on function private.nba_gm_v15_fair_lineup_exists(jsonb,jsonb,integer) from public,anon,authenticated;
revoke all on function private.nba_gm_v13_season(jsonb,integer) from public,anon,authenticated;
