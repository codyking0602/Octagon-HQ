-- Season-specific NBA GM starter selection: player development can promote a bench player.
-- Preserve legacy saved runs and all existing draft/offseason roster assignment rules.
-- Only newly started line-up-model V1 franchises receive automatic Year 2/3 optimization.

create or replace function private.nba_gm_v10_season_lineup(p_state jsonb,p_year integer)
returns jsonb language plpgsql stable security definer set search_path='' as $season_lineup$
declare
  v_ids jsonb;
  v_count integer;
  v_out jsonb;
begin
  if p_year not between 1 and 3
    or jsonb_typeof(p_state->'picks')<>'array' then
    raise exception 'NBA season lineup requires valid season and picks';
  end if;
  select coalesce(jsonb_agg(e.value->>'playerId' order by e.ordinality),'[]'::jsonb)
    into v_ids from jsonb_array_elements(p_state->'picks') with ordinality e(value,ordinality);
  v_count:=jsonb_array_length(v_ids);
  if v_count<>7
    or (select count(distinct x.id) from jsonb_array_elements_text(v_ids) x(id))<>v_count
    or (select count(*) from jsonb_array_elements_text(v_ids) x(id)
        join private.nba_gm_dev_players p on p.id=x.id)<>v_count then
    raise exception 'NBA season lineup requires seven distinct known players';
  end if;

  -- Reuse the existing exhaustive legal-slot optimizer, except use that
  -- specific season's authoritative, unrounded developed overall for starters.
  -- Player identity order makes assignments insensitive to draft/trade ordering.
  with recursive ordered as (
    select row_number() over(order by p.id)::integer as n,
      p.id,p.positions,private.nba_gm_v3_grade(p_state,p.id,p_year) as grade
      from jsonb_array_elements_text(v_ids) e(id)
      join private.nba_gm_dev_players p on p.id=e.id
  ), arrangements as (
    select 0::integer as n,'[]'::jsonb as picks,array[]::text[] as used,
      0::integer as bench_cost,0::integer as off_role_cost,
      0::numeric as starter_power
    union all
    select a.n+1,
      a.picks||jsonb_build_array(jsonb_build_object('slot',s.slot,'playerId',p.id)),
      array_append(a.used,s.slot),
      a.bench_cost+case when s.slot in ('GUARD','BIG') then 1 else 0 end,
      a.off_role_cost+case when s.slot=p.positions[1] then 0 else 1 end,
      a.starter_power+case when s.slot in ('GUARD','BIG') then 0 else p.grade end
    from arrangements a join ordered p on p.n=a.n+1
    cross join lateral unnest(array['PG','SG','SF','PF','C','GUARD','BIG']) s(slot)
    where not s.slot=any(a.used)
      and (s.slot=any(p.positions)
        or (s.slot='GUARD' and p.positions && array['PG','SG'])
        or (s.slot='BIG' and p.positions && array['PF','C']))
  )
  select a.picks into v_out from arrangements a where a.n=v_count
    order by a.bench_cost,a.starter_power desc,a.off_role_cost,a.picks::text limit 1;

  if v_out is null then raise exception 'NBA season lineup has no legal seven-player assignment';end if;
  select coalesce(jsonb_agg(e.value order by array_position(
      array['PG','SG','SF','PF','C','GUARD','BIG'],e.value->>'slot')),'[]'::jsonb)
    into v_out from jsonb_array_elements(v_out) e(value);
  return v_out;
end;
$season_lineup$;

revoke all on function private.nba_gm_v10_season_lineup(jsonb,integer)
  from public,anon,authenticated;

do $developed_lineup_patch$
declare
  v_def text;
  v_old text;
  v_new text;
  v_old2 text;
  v_new2 text;
begin
  -- Existing V9 season simulator must evaluate the actual best five in each
  -- future season, not the fixed Year 1 slots. Year 1 and legacy saves remain intact.
  select pg_get_functiondef('private.nba_gm_v9_season(jsonb,integer)'::regprocedure)
    into v_def;
  v_old:=$old$for v_pick in select value from jsonb_array_elements(p_state->'picks') loop$old$;
  v_new:=$new$for v_pick in select value from jsonb_array_elements(
    case when p_year>1 and p_state->>'lineupModelVersion'='1'
      then private.nba_gm_v10_season_lineup(p_state,p_year)
      else p_state->'picks' end) loop$new$;
  if position(v_old in v_def)=0
    or position('nba_gm_v10_season_lineup' in v_def)>0
    or position('v_net:=greatest(-13.0' in v_def)=0 then
    raise exception 'NBA V9 season simulator drifted; refuse lineup patch';
  end if;
  execute replace(v_def,v_old,v_new);

  -- Opt-in only NEW starts. At advance, snapshot the Year 3 developed lineup
  -- for the final roster; the season simulator separately determines Year 2.
  select pg_get_functiondef('public.nba_gm_dev_action(text,text,text)'::regprocedure)
    into v_def;
  v_old:=$old$'simulationModelVersion',9,'playoffScoringVersion',2$old$;
  v_new:=$new$'simulationModelVersion',9,'lineupModelVersion',1,'playoffScoringVersion',2$new$;
  v_old2:=$old$v_next:=jsonb_set(v_next,'{development}',
      private.nba_gm_v3_development_report(v_next,v_picks));$old$;
  v_new2:=$new$if v_state->>'lineupModelVersion'='1' then
      v_picks:=private.nba_gm_v10_season_lineup(v_next,3);
      v_next:=jsonb_set(v_next,'{picks}',v_picks);
    end if;
    v_next:=jsonb_set(v_next,'{development}',
      private.nba_gm_v3_development_report(v_next,v_picks));$new$;
  if position(v_old in v_def)=0 or position(v_old2 in v_def)=0
    or position('nba_gm_v10_season_lineup' in v_def)>0
    or position('nba_gm_v3_final_score(v_next)' in v_def)=0 then
    raise exception 'NBA GM authoritative action drifted; refuse lineup patch';
  end if;
  v_def:=replace(v_def,v_old,v_new);
  v_def:=replace(v_def,v_old2,v_new2);
  execute v_def;
end;
$developed_lineup_patch$;
