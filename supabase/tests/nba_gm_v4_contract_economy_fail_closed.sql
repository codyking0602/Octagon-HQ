-- NBA GM V4 approved signed salary window: authorized new runs only, rollback-only.
begin;
do $test$
declare
  v_state jsonb:=jsonb_build_object('economyVersion',4,'developmentModelVersion',2,
     'phase','draft','seed','nba-gm-real-source-guard');
  v_old jsonb:=jsonb_build_object('economyVersion',3,'developmentModelVersion',2,
     'phase','draft','seed','nba-gm-legacy-source-guard');
  v_error text;v_initial bigint;
begin
 if not private.nba_gm_v4_salary_certified() then
   raise exception 'Approved NBA GM V4 source audit must certify 330 complete real contract windows';
 end if;
 if private.nba_gm_v4_contract(v_state,'nba-gm-draft-victorwembanyama')<>'3YR' then
   raise exception 'Wembanyama must be signed through 2028-29';
 end if;
 for yr in 1..3 loop
   if private.nba_gm_v4_salary(v_state,'nba-gm-draft-victorwembanyama',yr)<>35782749
   then raise exception 'Locked Wembanyama salary not real 3-season mean';end if;
 end loop;
 if private.nba_gm_v4_salary(v_state,'nba-gm-draft-nikolajokic',1)<>60937408 then
   raise exception 'Jokic two signed seasons not averaged';end if;
 if private.nba_gm_v3_contract_for_state(v_old,'nba-gm-draft-victorwembanyama')
     is distinct from private.nba_gm_v3_contract('nba-gm-draft-victorwembanyama')
   or private.nba_gm_v3_salary(v_old,'nba-gm-draft-victorwembanyama',1)<>60500000 then
   raise exception 'Legacy V3 economics changed when V4 was enabled';end if;
 begin
   perform private.nba_gm_v4_salary(v_old,'nba-gm-draft-victorwembanyama',1);
   raise exception 'NO_LEGACY_GUARD';
 exception when others then
   get stacked diagnostics v_error=message_text;
   if v_error='NO_LEGACY_GUARD' or v_error not like '%legacy franchise%'
     then raise exception 'V4 illegally prices legacy V3 franchise: %',v_error;end if;
 end;
 update private.nba_gm_contract_candidates_2026_27
   set salary_schedule_verified=false where player_id='nba-gm-draft-victorwembanyama';
 if private.nba_gm_v4_salary_certified() then
   raise exception 'Missing one source approval must close the V4 economy';end if;
 begin
   perform private.nba_gm_v4_salary(v_state,'nba-gm-draft-victorwembanyama',1);
   raise exception 'NO_MISSING_SOURCE_GUARD';
 exception when others then
   get stacked diagnostics v_error=message_text;
   if v_error='NO_MISSING_SOURCE_GUARD' or v_error not like '%not source certified%'
     then raise exception 'Incomplete source was improperly accepted: %',v_error;end if;
 end;
end $test$;
rollback;
