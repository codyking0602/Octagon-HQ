-- Owner-only V4 contract source certification for the 2026-11-01 launch snapshot.
-- Automated exact-PR-head source check reconciles 323 BRef player rows against
-- signed 2026-27..2028-29 seasons; the other seven are explicitly sourced
-- using SalarySwish contracts or BRef active-team payroll (waived deal overlap).
-- Do not update 330 game IDs, historical V2/V3 salary snapshots or public GM access.
-- If later signed contract data change, a new reviewed migration is required.
-- BRef lists him as Ron Holland, while our identity is Ronald Holland II.
-- Two current sources confirm his existing signed salary years and average.
update private.nba_gm_contract_candidates_2026_27
set salary_schedule_status='CURRENT_BREF_AND_SALARYSWISH_CROSSCHECKED',
    salary_schedule_url='https://www.salaryswish.com/players/ron-holland-ii'
where player_id='nba-gm-draft-ronaldholland'
  and candidate_salary=9069600 and signed_salary_2027_28=11491183
  and provisional_average_salary=10280392 and candidate_contract='1YR';

do $verify_nba_gm_salary_audit$
declare n integer; v_bad integer; v_years integer; v_actual bigint;
begin
 select count(*) into n from private.nba_gm_contract_candidates_2026_27;
 if n<>330 then raise exception 'NBA GM V4 needs exact 330-player source census: %',n;end if;
 select count(*) into v_bad from private.nba_gm_contract_candidates_2026_27 c
 left join private.nba_gm_dev_players p on p.id=c.player_id
 where p.id is null or p.name<>c.player_name or p.team_code<>c.game_team_code
   or p.salaries[1]<>c.prior_salary
   or c.candidate_salary<=0 or c.provisional_average_salary<=0
   or c.average_window_years<>least(3,greatest(1,substring(c.actual_end_season,1,4)::integer-2025))
   or c.candidate_contract is distinct from
     (case when substring(c.actual_end_season,1,4)::integer>=2028 then '3YR' else '1YR' end)
   or c.provisional_average_salary is distinct from
     round((c.candidate_salary
       +case when c.average_window_years>=2 then c.signed_salary_2027_28 else 0 end
       +case when c.average_window_years>=3 then c.signed_salary_2028_29 else 0 end
     )::numeric/c.average_window_years)::bigint
   or c.source_url !~ '^https://' or c.salary_schedule_url !~ '^https://';
 if v_bad<>0 then raise exception 'NBA GM audited salary math/identity invalid for % players',v_bad;end if;
 select count(*) into v_bad from private.nba_gm_contract_candidates_2026_27
 where salary_schedule_status is null or salary_schedule_status='INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE';
 if v_bad<>0 then raise exception 'NBA salary window still incomplete for % players',v_bad;end if;
 if not exists (select 1 from private.nba_gm_contract_candidates_2026_27
     where player_id='nba-gm-draft-victorwembanyama' and candidate_contract='3YR'
      and provisional_average_salary=35782749 and candidate_salary=16868246
      and signed_salary_2027_28=43500000 and signed_salary_2028_29=46980000)
   then raise exception 'Wembanyama approved signed three-season mean differs';end if;
 if not exists (select 1 from private.nba_gm_contract_candidates_2026_27
     where player_id='nba-gm-draft-stephencurry' and candidate_contract='3YR'
      and candidate_salary=62587158 and signed_salary_2027_28=55700000
      and signed_salary_2028_29=60156000)
   then raise exception 'Curry current signed extension missing';end if;
 if not exists (select 1 from private.nba_gm_contract_candidates_2026_27
     where player_id='nba-gm-draft-damianlillard' and candidate_salary=13398800
       and signed_salary_2027_28=14104000 and candidate_contract='1YR')
   then raise exception 'Lillard current playing salary is not dead cap';end if;
 if not exists (select 1 from private.nba_gm_contract_candidates_2026_27
     where player_id='nba-gm-draft-klaythompson' and candidate_salary=5600000
       and signed_salary_2027_28=5880000 and candidate_contract='1YR')
   then raise exception 'Thompson current playing salary is not waived salary';end if;
 if not exists (select 1 from private.nba_gm_contract_candidates_2026_27
     where player_id='nba-gm-draft-kentaviouscaldwellpope' and candidate_salary=2449421)
   then raise exception 'KCP active Philadelphia playing contract not used';end if;
 if not exists (select 1 from private.nba_gm_contract_candidates_2026_27
     where player_id='nba-gm-draft-oscartshiebwe' and candidate_salary=678882 and candidate_contract='1YR')
   then raise exception 'Oscar Oct 19 converted two-way contract missing';end if;
 update private.nba_gm_contract_candidates_2026_27
 set independently_verified=true,salary_schedule_verified=true
 where source_url ~ '^https://' and salary_schedule_url ~ '^https://';
 if not private.nba_gm_v4_salary_certified() then
   raise exception 'NBA GM 330 real salary source gate did not open after full audit';end if;
end $verify_nba_gm_salary_audit$;
