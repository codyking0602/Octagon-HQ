-- NBA GM V4: match the NFL one-time 1YR extension model.
-- 3YR deals remain fixed across all 3 seasons. 1YR deals reprice after
-- Season 1, then the actual Year-2 extension is held through Year 3.
-- Avoid Year-3 seeded price drift; independently evolving player ability
-- still applies to Year-3 game simulation. Legacy V2/V3 are untouched.
CREATE OR REPLACE FUNCTION private.nba_gm_v4_salary(p_state jsonb, p_id text, p_year integer)
 RETURNS bigint
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_player private.nba_gm_dev_players%rowtype;
  v_start bigint;
  v_delta numeric; v_factor numeric; v_pct numeric; v_market numeric;
begin
  if p_year not between 1 and 3 then raise exception 'Invalid NBA GM game salary year'; end if;
  -- Economy gate performs 330/330 contract verification before any use.
  perform private.nba_gm_v4_contract(p_state,p_id);
  select * into v_player from private.nba_gm_dev_players where id=p_id;
  if not found then raise exception 'Unknown NBA GM player'; end if;
  select provisional_average_salary into v_start
    from private.nba_gm_contract_candidates_2026_27 where player_id=p_id;
  if v_start is null then raise exception 'NBA GM V4 averaged salary has incomplete sourced schedule'; end if;
  if p_year=1 or private.nba_gm_v4_contract(p_state,p_id)='3YR' then
    return v_start;
  end if;
  -- NFL parity: 1YR reprices ONCE after Game Year 1; Year 3 holds Year 2
  -- salary, even though the Year 3 player grade continues developing.
  -- Same existing conservative draft forecast shape; no seeded future outcome leak.
  -- Before development outcomes are revealed, reserve the fixed Year-2
  -- extension market uplift (6.5%) for both future seasons. This is a
  -- conservative forecast, not a cap-balancing value or a revealed seeded outcome.
  -- Calibration may determine stronger risk-aware future-year reserves.
  if coalesce(p_state->>'phase','draft') in ('draft','year1') then
    return greatest(2500000,
      round(v_start*(1.065)/100000)*100000)::bigint;
  end if;
  -- Realized V4 development grade is still exclusively server-authoritative.
  -- Reuse the existing v4 player-specific odds, seeded grade and market model.
  v_delta:=private.nba_gm_v3_grade(p_state,p_id,2)-v_player.overall;
  v_factor:=greatest(.66,least(2.0,power(1.105::numeric,v_delta)
    *(1.065)));
  if p_state->>'developmentModelVersion'='2' then
    v_pct:=coalesce((v_player.development_profile->>'marketVariancePct')::numeric,0);
    v_market:=(abs(('x'||substr(md5(p_state->>'seed'||':'||p_id||':2:market'),1,8))
      ::bit(32)::int::bigint)%10000)::numeric/10000;
    v_factor:=greatest(.62,least(2,v_factor*(1+(v_market*2-1)*v_pct/100)));
  end if;
  return greatest(2500000,round(v_start*v_factor/100000)*100000)::bigint;
end;
$function$;

revoke all on function private.nba_gm_v4_salary(jsonb,text,integer) from public,anon,authenticated;
