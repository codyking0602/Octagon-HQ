-- Private, opt-in ONLY: NBA GM V4 2026-27 real-salary math, FAIL CLOSED pending verification.
-- This migration does not change current game data, RPCs, routes, saved runs, cap or scores.
-- Never change the V2/V3 economyVersion routers until every candidate is certified
-- and the owner approves a three-season simulated salary cap.
create or replace function private.nba_gm_v4_salary_certified()
returns boolean language sql stable security definer set search_path='' as $$
  select (select count(*) from private.nba_gm_contract_candidates_2026_27)=330
    and (select count(*) from private.nba_gm_contract_candidates_2026_27
      where independently_verified and candidate_contract in ('1YR','3YR')
        and candidate_salary>0 and actual_end_season is not null
        and source_url ~ '^https://')=330;
$$;
revoke all on function private.nba_gm_v4_salary_certified()
  from public, anon, authenticated;

create or replace function private.nba_gm_v4_contract(p_state jsonb,p_id text)
returns text language plpgsql stable security definer set search_path='' as $$
declare v_row private.nba_gm_contract_candidates_2026_27%rowtype;
begin
  if p_state->>'economyVersion' is distinct from '4' then
    raise exception 'NBA GM V4 contract requested from a legacy franchise';
  end if;
  if not private.nba_gm_v4_salary_certified() then
    raise exception 'NBA GM V4 contract economy is not source certified';
  end if;
  select * into v_row from private.nba_gm_contract_candidates_2026_27 where player_id=p_id;
  if not found or not v_row.independently_verified or v_row.candidate_contract is null then
    raise exception 'NBA GM V4 contract not verified';
  end if;
  return v_row.candidate_contract;
end;
$$;
revoke all on function private.nba_gm_v4_contract(jsonb,text)
  from public, anon, authenticated;

create or replace function private.nba_gm_v4_salary(p_state jsonb,p_id text,p_year integer)
returns bigint language plpgsql stable security definer set search_path='' as $$
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
  select candidate_salary into v_start
    from private.nba_gm_contract_candidates_2026_27 where player_id=p_id;
  if p_year=1 or private.nba_gm_v4_contract(p_state,p_id)='3YR' then
    return v_start;
  end if;
  -- Same existing conservative draft forecast shape; no seeded future outcome leak.
  -- Before development outcomes are revealed, reserve the existing V3 annual
  -- market uplift (6.5%/12%). This is a known-model baseline, not a
  -- made-up cap-balancing salary or the actual outcome from seeded repricing.
  -- Calibration may determine stronger risk-aware future-year reserves.
  if coalesce(p_state->>'phase','draft') in ('draft','year1') then
    return greatest(2500000,
      round(v_start*(case when p_year=2 then 1.065 else 1.12 end)/100000)*100000)::bigint;
  end if;
  -- Realized V4 development grade is still exclusively server-authoritative.
  -- Reuse the existing v4 player-specific odds, seeded grade and market model.
  v_delta:=private.nba_gm_v3_grade(p_state,p_id,p_year)-v_player.overall;
  v_factor:=greatest(.66,least(2.0,power(1.105::numeric,v_delta)
    *(case when p_year=2 then 1.065 else 1.12 end)));
  if p_state->>'developmentModelVersion'='2' then
    v_pct:=coalesce((v_player.development_profile->>'marketVariancePct')::numeric,0);
    v_market:=(abs(('x'||substr(md5(p_state->>'seed'||':'||p_id||':'||p_year||':market'),1,8))
      ::bit(32)::int::bigint)%10000)::numeric/10000;
    v_factor:=greatest(.62,least(2,v_factor*(1+(v_market*2-1)*v_pct/100)));
  end if;
  return greatest(2500000,round(v_start*v_factor/100000)*100000)::bigint;
end;
$$;
revoke all on function private.nba_gm_v4_salary(jsonb,text,integer)
  from public, anon, authenticated;

comment on function private.nba_gm_v4_salary(jsonb,text,integer) is
  'Isolated NBA GM salary prototype for future owner-approved V4; refuses all calls until 330 contracts certified. NOT routed into live RPC or saved runs.';
