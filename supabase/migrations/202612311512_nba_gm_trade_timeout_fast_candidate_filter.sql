-- NBA GM V15: bounded trade discovery. Preserve seven-player positional integrity
-- and every existing trade/package price; replace repeated full V13 lineup scans
-- in candidate eligibility with an exact, early-exit legal-role feasibility test.
--
-- A lineup is "fair" iff the V14 unfair-bench predicate is false. V14's
-- authoritative optimizer prioritizes that predicate before lineup strength,
-- so existence of one fair eligible assignment is equivalent to V14 acceptance.
-- Cache seven seasonal grades once and prune invalid assignments immediately.
create or replace function private.nba_gm_v15_fair_lineup_exists(
  p_state jsonb,p_picks jsonb,p_year integer
) returns boolean
language sql stable security definer set search_path='' as $v15$
 with recursive roster as materialized (
   select row_number() over(order by p.id)::integer n,
     p.id,p.positions,private.nba_gm_v3_grade(p_state,p.id,p_year) grade
   from jsonb_array_elements(p_picks) x
   join private.nba_gm_dev_players p on p.id=x->>'playerId'
 ), arrangements(n,used,picks) as (
   select 0::integer,array[]::text[],'[]'::jsonb
   union all
   select a.n+1,array_append(a.used,s.slot),
     a.picks||jsonb_build_array(jsonb_build_object(
       'playerId',p.id,'slot',s.slot,'grade',p.grade,
       'positions',to_jsonb(p.positions)))
   from arrangements a
   join roster p on p.n=a.n+1
   cross join lateral unnest(array['PG','SG','SF','PF','C','GUARD','BIG']) s(slot)
   where not s.slot=any(a.used)
     and (s.slot=any(p.positions)
       or (s.slot='GUARD' and p.positions && array['PG','SG'])
       or (s.slot='BIG' and p.positions && array['PF','C']))
     -- A new bench player cannot eclipse an already assigned eligible starter.
     -- A new starter cannot sit above a much better eligible existing bench player.
     and not exists (
       select 1 from jsonb_array_elements(a.picks) e(value)
       where (
         s.slot in ('GUARD','BIG') and e.value->>'slot' not in ('GUARD','BIG')
         and (e.value->>'slot')=any(p.positions)
         and p.grade>=88
         and p.grade >= (e.value->>'grade')::numeric+8
       ) or (
         s.slot not in ('GUARD','BIG') and e.value->>'slot' in ('GUARD','BIG')
         and (e.value->'positions' ? s.slot)
         and (e.value->>'grade')::numeric>=88
         and (e.value->>'grade')::numeric>=p.grade+8
       )
     )
 )
 select exists (
   select 1 from arrangements where n=7
     and (select count(*) from roster)=7
 );
$v15$;
revoke all on function private.nba_gm_v15_fair_lineup_exists(jsonb,jsonb,integer)
 from public,anon,authenticated;

-- Call the fast exact feasibility check only while presenting candidates.
-- Existing completed/in-progress legacy saves never opt in.
create or replace function private.nba_gm_v14_roster_ok(
 p_state jsonb,p_picks jsonb)
returns boolean language plpgsql stable security definer set search_path='' as $body$
declare st jsonb; y integer;
begin
 if p_state->>'rosterQualityVersion' is distinct from '1'
    or jsonb_array_length(p_picks)<7 then return true; end if;
 st:=jsonb_set(p_state,'{picks}',p_picks);
 if st->>'phase'='draft' then
   return not private.nba_gm_v14_unfair_bench(st,p_picks,1);
 end if;
 for y in 2..3 loop
   if not private.nba_gm_v15_fair_lineup_exists(st,p_picks,y)
     then return false; end if;
 end loop;
 return true;
end;
$body$;
revoke all on function private.nba_gm_v14_roster_ok(jsonb,jsonb)
 from public,anon,authenticated;

-- A trade *target* is an inquiry, not an accepted trade. Avoid calculating
-- every possible 1/2-for-1/2 package for every player in a team on page load.
-- Exact trade package availability and fairness remain server-enforced by
-- nba_gm_dev_trade_offers and the authoritative accept action.
create or replace function public.nba_gm_dev_legal_trade_targets()
returns jsonb language plpgsql stable security definer set search_path='' as $body$
declare st jsonb; out_rows jsonb;
begin
 if auth.uid() is null then raise exception 'NBA GM sign-in required';end if;
 select r.state into st from private.football_gm_runs r
 where r.profile_id=auth.uid() and r.game_version='nba-gm-dev-v2'
   and r.completed_at is null order by r.updated_at desc limit 1;
 if st is null or st->>'rosterQualityVersion' is distinct from '1'
   or st->>'phase'<>'offseason' or st->>'shopPlayerId' is null
   or st->>'tradeTeam' is null then return '[]'::jsonb;end if;
 select coalesce(jsonb_agg(p.id order by p.overall desc,p.name),'[]'::jsonb)
   into out_rows
 from private.nba_gm_dev_players p
 where p.team_code=st->>'tradeTeam'
   and not exists(select 1 from jsonb_array_elements(st->'picks') x
      where x->>'playerId'=p.id)
   and not exists(select 1 from jsonb_array_elements(
       coalesce(st->'releasedIds','[]'::jsonb)) x where x#>>'{}'=p.id);
 return out_rows;
end;
$body$;
revoke all on function public.nba_gm_dev_legal_trade_targets() from public,anon;
grant execute on function public.nba_gm_dev_legal_trade_targets() to authenticated;
