-- Isolated 2026-27 NBA GM contract economy must be impossible to activate with uncertified inputs.
begin;
do $test$
declare v_state jsonb:=jsonb_build_object(
 'economyVersion',4,'developmentModelVersion',2,'phase','draft','seed','nba-gm-source-test');
 v_error text;
begin
 if private.nba_gm_v4_salary_certified() then
   raise exception 'NBA GM V4 incorrectly claims 330 certified contracts';
 end if;
 begin
   perform private.nba_gm_v4_contract(v_state,'nba-gm-draft-victorwembanyama');
   raise exception 'NO_GUARD_CONTRACT';
 exception when others then
   get stacked diagnostics v_error=message_text;
   if v_error='NO_GUARD_CONTRACT' then raise exception 'Unverified real contracts were used'; end if;
   if v_error not like '%not source certified%' then raise exception 'Unexpected V4 guard: %',v_error;end if;
 end;
 begin
   perform private.nba_gm_v4_salary(v_state,'nba-gm-draft-victorwembanyama',1);
   raise exception 'NO_GUARD_SALARY';
 exception when others then
   get stacked diagnostics v_error=message_text;
   if v_error='NO_GUARD_SALARY' then raise exception 'Unverified real salaries were used'; end if;
   if v_error not like '%not source certified%' then raise exception 'Unexpected V4 salary guard: %',v_error;end if;
 end;
 begin
   perform private.nba_gm_v4_salary(jsonb_build_object('economyVersion',3), 
      'nba-gm-draft-victorwembanyama',1);
   raise exception 'NO_LEGACY_GUARD';
 exception when others then
   get stacked diagnostics v_error=message_text;
   if v_error='NO_LEGACY_GUARD' then raise exception 'V4 illegally prices legacy V3 save'; end if;
   if v_error not like '%legacy franchise%' then raise exception 'Unexpected legacy guard: %',v_error;end if;
 end;
end
$test$;
rollback;
