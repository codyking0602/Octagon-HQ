-- NBA GM offseason position integrity: new franchises only.
-- Existing completed and in-progress runs retain their persisted semantics.
-- Opt-in rosterQualityVersion=1 blocks offered players that would strand an
-- elite eligible starter on the bench behind a much weaker starter.
create or replace function private.nba_gm_v14_unfair_bench(
 p_state jsonb,p_picks jsonb,p_year integer)
returns boolean language sql stable security definer set search_path='' as $body$
 select exists(
  select 1
  from jsonb_array_elements(p_picks) b
  join private.nba_gm_dev_players bp on bp.id=b->>'playerId'
  cross join lateral jsonb_array_elements(p_picks) s
  join private.nba_gm_dev_players sp on sp.id=s->>'playerId'
  where b->>'slot' in ('GUARD','BIG') and s->>'slot' not in ('GUARD','BIG')
    and (s->>'slot')=any(bp.positions)
    and private.nba_gm_v3_grade(p_state,bp.id,p_year)>=88
    and private.nba_gm_v3_grade(p_state,bp.id,p_year)
      >=private.nba_gm_v3_grade(p_state,sp.id,p_year)+8
 );
$body$;
revoke all on function private.nba_gm_v14_unfair_bench(jsonb,jsonb,integer)
 from public,anon,authenticated;

create or replace function private.nba_gm_v14_lineup_strength(
 p_state jsonb,p_year integer,p_picks jsonb)
returns numeric language sql stable security definer set search_path='' as $body$
 select .75*(v.component->>'off')::numeric
      + .75*(v.component->>'def')::numeric
      + (v.component->>'offFit')::numeric+(v.component->>'defFit')::numeric
 from (select private.nba_gm_v13_components(p_state,p_year,p_picks) component) v;
$body$;
revoke all on function private.nba_gm_v14_lineup_strength(jsonb,integer,jsonb)
 from public,anon,authenticated;

-- Keep the existing exhaustive legal-position matcher. Replace V12's
-- overall+fit proxy with actual V13 net strength and a primary-role tie credit.
-- When a valid alternative exists, never bench a star behind a much weaker
-- starter at a position the star can itself play.
do $install_v14_lineup$
declare d text; needle text; replacement text;
begin
 select pg_get_functiondef('private.nba_gm_v12_season_lineup(jsonb,integer)'::regprocedure) into d;
 needle:=$old$order by a.bench_cost,
    (a.starter_power + 2*(
      (private.nba_gm_v12_components(p_state,p_year,a.picks)->>'lineupFit')::numeric
    )) desc,
    a.starter_power desc,a.off_role_cost,a.picks::text limit 1;$old$;
 replacement:=$new$order by a.bench_cost,
    case when private.nba_gm_v14_unfair_bench(p_state,a.picks,p_year) then 1 else 0 end,
    (private.nba_gm_v14_lineup_strength(p_state,p_year,a.picks)
       - a.off_role_cost * .02) desc,
    a.starter_power desc,a.picks::text limit 1;$new$;
 if d is null or position(needle in d)=0
   or position('FUNCTION private.nba_gm_v12_season_lineup(' in d)=0
   then raise exception 'NBA V14 lineup source drift'; end if;
 d:=replace(d,'FUNCTION private.nba_gm_v12_season_lineup(',
   'FUNCTION private.nba_gm_v14_season_lineup(');
 execute replace(d,needle,replacement);
end $install_v14_lineup$;
revoke all on function private.nba_gm_v14_season_lineup(jsonb,integer)
 from public,anon,authenticated;

create or replace function private.nba_gm_v14_roster_ok(
 p_state jsonb,p_picks jsonb)
returns boolean language plpgsql stable security definer set search_path='' as $body$
declare st jsonb; y integer; lineup jsonb;
begin
 if p_state->>'rosterQualityVersion' is distinct from '1'
    or jsonb_array_length(p_picks)<7 then return true; end if;
 st:=jsonb_set(p_state,'{picks}',p_picks);
 if st->>'phase'='draft' then
   return not private.nba_gm_v14_unfair_bench(st,p_picks,1);
 end if;
 for y in 2..3 loop
   lineup:=private.nba_gm_v14_season_lineup(st,y);
   if private.nba_gm_v14_unfair_bench(st,lineup,y) then return false;end if;
 end loop;
 return true;
end;
$body$;
revoke all on function private.nba_gm_v14_roster_ok(jsonb,jsonb)
 from public,anon,authenticated;

-- Every NBA candidate path (draft, free agency, emergency) already calls
-- this authoritative function. Its quality filter must happen before reveal.
do $patch_can_add$
declare d text; needle text;
begin
 select pg_get_functiondef('private.nba_gm_v2_can_add(jsonb,text)'::regprocedure) into d;
 needle:=$old$  return true;
end;$old$;
 if d is null or position(needle in d)=0
   or position('v_arranged:=private.nba_gm_v2_assign(' in d)=0
   or position('nba_gm_v14_roster_ok' in d)>0 then
   raise exception 'NBA V14 candidate baseline drift';end if;
 execute replace(d,needle,
 $new$  if not private.nba_gm_v14_roster_ok(p_state,v_arranged) then return false; end if;
  return true;
end;$new$);
end $patch_can_add$;

-- Trade offers are validated and filtered BEFORE the UI can offer a target.
-- The authoritative accept action re-fetches these same filtered offers.
do $patch_offers$
declare d text; needle text;
begin
 select pg_get_functiondef('private.nba_gm_v8_trade_offers(jsonb,text)'::regprocedure) into d;
 needle:=$old$      v_candidates:=v_candidates||jsonb_build_array(v_candidate);$old$;
 if d is null or position(needle in d)=0 or position('nba_gm_v14_roster_ok' in d)>0
   then raise exception 'NBA V14 trade source drift';end if;
 execute replace(d,needle,
 $new$      if not private.nba_gm_v14_roster_ok(p_state,v_active) then continue;end if;
      v_candidates:=v_candidates||jsonb_build_array(v_candidate);$new$);
end $patch_offers$;

-- Existing V13 outcomes remain untouched. Only new quality-v1 runs use the
-- improved V13 lineup in future-year simulation.
do $patch_v13_season$
declare d text;needle text;
begin
 select pg_get_functiondef('private.nba_gm_v13_season(jsonb,integer)'::regprocedure) into d;
 needle:='then private.nba_gm_v12_season_lineup(p_state,p_year)';
 if d is null or (length(d)-length(replace(d,needle,'')))/length(needle)<>2
   or position('nba_gm_v14_season_lineup' in d)>0
   then raise exception 'NBA V13 lineup dispatch drift';end if;
 execute replace(d,needle,
 $new$then case when p_state->>'rosterQualityVersion'='1'
        then private.nba_gm_v14_season_lineup(p_state,p_year)
        else private.nba_gm_v12_season_lineup(p_state,p_year) end$new$);
end $patch_v13_season$;

-- Keep all older saves on V12 lineup; apply V14 only to newly started runs.
do $patch_action$
declare d text; needle text; replacement text;
begin
 select pg_get_functiondef('public.nba_gm_dev_action(text,text,text)'::regprocedure) into d;
 needle:=$old$'simulationModelVersion',13,'lineupModelVersion',2$old$;
 if d is null or position(needle in d)=0
   then raise exception 'NBA V14 new-run baseline drift';end if;
 d:=replace(d,needle,$new$'simulationModelVersion',13,'lineupModelVersion',2,'rosterQualityVersion',1$new$);
 needle:='v_picks:=private.nba_gm_v12_season_lineup(v_next,3);';
 if (length(d)-length(replace(d,needle,'')))/length(needle)<>2
   then raise exception 'NBA V14 offseason/advance baseline drift';end if;
 d:=replace(d,needle,
 $new$v_picks:=case when v_state->>'rosterQualityVersion'='1'
        then private.nba_gm_v14_season_lineup(v_next,3)
        else private.nba_gm_v12_season_lineup(v_next,3) end;$new$);
 needle:=$old$  perform set_config('octagon.nba_gm_dev_authorized_write','yes',true);$old$;
 if position(needle in d)=0 then raise exception 'NBA V14 commit guard drift';end if;
 d:=replace(d,needle,$new$  if v_state->>'rosterQualityVersion'='1'
     and p_action in ('trade','promote-displaced','sign','emergency-sign','advance')
     and jsonb_array_length(v_next->'picks')=7
     and not private.nba_gm_v14_roster_ok(v_next,v_next->'picks') then
    raise exception 'This move would force an elite starter onto the bench; select another player';
  end if;
  perform set_config('octagon.nba_gm_dev_authorized_write','yes',true);$new$);
 execute d;
end $patch_action$;

-- Authoritative position-filtered picker (never show candidates that the
-- backend rejects). Preview matches the same server-owned Year 2 lineup.
create or replace function public.nba_gm_dev_legal_candidates()
returns jsonb language plpgsql stable security definer set search_path='' as $body$
declare st jsonb; team text; p record; ids jsonb; projected jsonb; out_rows jsonb:='[]'::jsonb;
begin
 if auth.uid() is null then raise exception 'NBA GM sign-in required';end if;
 select r.state into st from private.football_gm_runs r
 where r.profile_id=auth.uid() and r.game_version='nba-gm-dev-v2'
   and r.completed_at is null order by r.updated_at desc limit 1;
 if st is null or st->>'rosterQualityVersion' is distinct from '1'
   or st->>'phase' not in ('draft','offseason') then return '[]'::jsonb;end if;
 team:=case when st->>'phase'='draft' then st->>'pendingTeam'
            else st->>'freeAgencyTeam' end;
 if team is null then return '[]'::jsonb;end if;
 for p in select id from private.nba_gm_dev_players where team_code=team order by overall desc,name loop
   if st->>'phase'='offseason' and
     (private.nba_gm_v3_contract_for_state(st,p.id)<>'1YR'
       or coalesce(st->'releasedIds','[]'::jsonb) ? p.id) then continue;end if;
   if not private.nba_gm_v2_can_add(st,p.id) then continue;end if;
   projected:=private.nba_gm_v2_assign(st->'picks',p.id);
   if jsonb_array_length(projected)=7 and st->>'phase'='offseason' then
     projected:=private.nba_gm_v14_season_lineup(
       jsonb_set(st,'{picks}',projected),2);
   end if;
   out_rows:=out_rows||jsonb_build_array(
     jsonb_build_object('playerId',p.id,'projectedPicks',projected));
 end loop;
 return out_rows;
end;
$body$;
revoke all on function public.nba_gm_dev_legal_candidates() from public,anon;
grant execute on function public.nba_gm_dev_legal_candidates() to authenticated;

-- Filter trade partner targets with no acceptable legal packages.
create or replace function public.nba_gm_dev_legal_trade_targets()
returns jsonb language plpgsql stable security definer set search_path='' as $body$
declare st jsonb; p record; out_rows jsonb:='[]'::jsonb;
begin
 if auth.uid() is null then raise exception 'NBA GM sign-in required';end if;
 select r.state into st from private.football_gm_runs r
 where r.profile_id=auth.uid() and r.game_version='nba-gm-dev-v2'
   and r.completed_at is null order by r.updated_at desc limit 1;
 if st is null or st->>'rosterQualityVersion' is distinct from '1'
   or st->>'phase'<>'offseason' or st->>'shopPlayerId' is null
   or st->>'tradeTeam' is null then return '[]'::jsonb;end if;
 for p in select id from private.nba_gm_dev_players
   where team_code=st->>'tradeTeam' order by overall desc,name loop
   if jsonb_array_length(private.nba_gm_v8_trade_offers(st,p.id))>0 then
     out_rows:=out_rows||jsonb_build_array(p.id);
   end if;
 end loop;
 return out_rows;
end;
$body$;
revoke all on function public.nba_gm_dev_legal_trade_targets() from public,anon;
grant execute on function public.nba_gm_dev_legal_trade_targets() to authenticated;

-- Expose only position/name preview; salaries and actual offer acceptance
-- stay server-owned. Active roster remains private in old RPC shape.
do $patch_public_offers$
declare d text; needle text;
begin
 select pg_get_functiondef('public.nba_gm_dev_trade_offers(text)'::regprocedure) into d;
 needle:=$old$x.value-'activePicks'-'displacedAssets'-'acceptanceSlack'$old$;
 if d is null or position(needle in d)=0
    then raise exception 'NBA V14 public offers drift';end if;
 d:=replace(d,needle,
 $new$(x.value-'activePicks'-'displacedAssets'-'acceptanceSlack') ||
     jsonb_build_object('projectedPicks',
       case when v_state->>'rosterQualityVersion'='1'
         and jsonb_array_length(x.value->'activePicks')=7
       then private.nba_gm_v14_season_lineup(
         jsonb_set(v_state,'{picks}',x.value->'activePicks'),2)
       else x.value->'activePicks' end)$new$);
 execute d;
end $patch_public_offers$;
