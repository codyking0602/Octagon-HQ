-- Keep the full 330/330 source census at V4 franchise creation.
-- During a game, validate the specific player row rather than rescan the entire
-- verified 330-player source table on every salary lookup and draft candidate.
-- Critical for responsive owner-only wheel spins (no changes to V2/V3).
create or replace function private.nba_gm_v4_contract(p_state jsonb,p_id text)
returns text language plpgsql stable security definer set search_path='' as $$
declare v_row private.nba_gm_contract_candidates_2026_27%rowtype;
begin
  if p_state->>'economyVersion' is distinct from '4' then
    raise exception 'NBA GM V4 contract requested from a legacy franchise';
  end if;
  select * into v_row from private.nba_gm_contract_candidates_2026_27 where player_id=p_id;
  if not found or not v_row.independently_verified
     or not v_row.salary_schedule_verified
     or v_row.candidate_contract not in ('1YR','3YR')
     or v_row.provisional_average_salary is null
     or v_row.provisional_average_salary<=0
     or v_row.source_url !~ '^https://'
     or v_row.salary_schedule_url !~ '^https://' then
    raise exception 'NBA GM V4 contract not verified';
  end if;
  return v_row.candidate_contract;
end;
$$;
revoke all on function private.nba_gm_v4_contract(jsonb,text) from public,anon,authenticated;
