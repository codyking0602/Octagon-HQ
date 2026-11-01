-- Ronald Holland II is named "Ron Holland" in the BRef 2026-27 contract table.
-- 2026-27 $9,069,600; 2027-28 $11,491,183; game annual average $10,280,392.
-- Source corroboration: https://www.basketball-reference.com/contracts/players.html
-- https://www.salaryswish.com/players/ron-holland-ii
-- This fixes a stale source-status flag; it does not alter any salary or game term.
do $ron_holland_evidence$
begin
  if not exists (
    select 1 from private.nba_gm_contract_candidates_2026_27
    where player_id='nba-gm-draft-ronaldholland'
      and candidate_salary=9069600
      and signed_salary_2027_28=11491183
      and provisional_average_salary=10280392
      and candidate_contract='1YR'
      and actual_end_season='2027-28'
  ) then raise exception 'Ron Holland live contracted salary schedule mismatch'; end if;
  update private.nba_gm_contract_candidates_2026_27
  set salary_schedule_status='CURRENT_BREF_AND_SALARYSWISH_CROSSCHECKED',
      salary_schedule_url='https://www.salaryswish.com/players/ron-holland-ii'
  where player_id='nba-gm-draft-ronaldholland';
end $ron_holland_evidence$;
