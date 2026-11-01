-- NBA GM signed-season averaging stage regression: private/opt-in, never public.
begin;
do $test$
declare
  v_record private.nba_gm_contract_candidates_2026_27%rowtype;
  v_complete integer;
  v_missing integer;
  v_bad integer;
begin
  select * into v_record from private.nba_gm_contract_candidates_2026_27
    where player_id='nba-gm-draft-victorwembanyama';
  if not found
    or v_record.candidate_contract<>'3YR'
    or v_record.candidate_salary<>16868246
    or v_record.signed_salary_2027_28<>43500000
    or v_record.signed_salary_2028_29<>46980000
    or v_record.provisional_average_salary<>35782749
    or v_record.average_window_years<>3
    or v_record.salary_schedule_verified then
    raise exception 'Wembanyama must lock real 2026-27 through 2028-29 average only; staging not verified';
  end if;

  select count(*) filter (where provisional_average_salary is not null),
         count(*) filter (where provisional_average_salary is null)
    into v_complete,v_missing
    from private.nba_gm_contract_candidates_2026_27;
  if v_complete+v_missing<>330 or v_complete<1 or v_missing<1 then
    raise exception 'All 330 staged, missing future salaries must remain unpriced: % / %',v_complete,v_missing;
  end if;

  select count(*) into v_bad
  from private.nba_gm_contract_candidates_2026_27
  where provisional_average_salary is distinct from
    case
      when average_window_years=1 then candidate_salary
      when average_window_years=2 and signed_salary_2027_28 is not null
        then round((candidate_salary+signed_salary_2027_28)::numeric/2)::bigint
      when average_window_years=3 and signed_salary_2027_28 is not null
           and signed_salary_2028_29 is not null
        then round((candidate_salary+signed_salary_2027_28+signed_salary_2028_29)::numeric/3)::bigint
      else null
    end;
  if v_bad<>0 then raise exception 'Staged averages do not match real signed seasons: %',v_bad;end if;

  if private.nba_gm_v4_salary_certified() then
    raise exception 'Unverified annual salaries unexpectedly opened owner-only V4';
  end if;
end $test$;
rollback;
