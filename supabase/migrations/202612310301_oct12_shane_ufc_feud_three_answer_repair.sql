-- Repair Shane's Oct. 12 UFC Sports Feud using the canonical four-correct main-board rule.
-- Conor at 170 lb: 2-point alternate; corner "Advice": 8-point #1 answer;
-- historic champion Conor: 1-point Fast Money alternate.
-- The corrected fourth accepted main-board answer is Kamaru Usman,
-- so Leon Edwards (entered afterward in the original run) is not scored.
-- First board 22 (was 25), second board 26, Fast Money 31 (was 22): 79.
-- Do not reset any official attempts or change other players' results.

do $oct12_shane_feud$
declare
  v_daily uuid;
  v_setup uuid;
  v_profile uuid;
  v_attempt uuid;
  v_score integer;
  v_pack jsonb;
  v_setup_evidence jsonb;
  v_entities jsonb;
  v_main jsonb;
  v_fast jsonb;
  v_public jsonb;
  v_engine jsonb;
  v_first jsonb;
  v_second jsonb;
  v_fast_public jsonb;
  v_fast_engine jsonb;
  v_reveal jsonb;
  v_corner_idx integer;
  v_conor_main constant text := 'ufc-main-09-4:v11';
  v_conor_fast constant text := 'ufc-fast3-01-5:v7';
  v_tag constant text := '2026-10-12-shane-ufc-three-answer-fairness';
  v_rows integer;
begin
  select d.id, d.setup_id into v_daily,v_setup
  from private.daily_challenges d
  join private.daily_challenge_schedule_versions s on s.version=d.schedule_version
  where d.central_day=date '2026-10-12' and s.sport='ufc' and d.game_type='sports_feud';
  if v_daily is null then return; end if;

  select id into v_profile from public.profiles where normalized_name='SHANE';
  if v_profile is null then return; end if;
  select a.id,a.normalized_score into v_attempt,v_score
  from private.daily_challenge_attempts a
  where a.daily_challenge_id=v_daily and a.profile_id=v_profile
    and a.attempt_kind='official_first';
  if v_attempt is null then return; end if;

  if v_score=79 then
    return; -- Already corrected by this exact release.
  end if;
  if v_score<>73 then
    raise exception 'Unexpected Shane UFC Feud score before correction: %',v_score;
  end if;

  select s.private_setup_evidence into strict v_setup_evidence
  from private.daily_challenge_setups s where s.id=v_setup for update;
  v_pack:=v_setup_evidence->'pack';
  if v_pack#>>'{mainBoards,0,id}' <> 'ufc-main-09-4'
    or v_pack#>>'{mainBoards,1,id}' <> 'ufc-main-17-1'
    or v_pack#>>'{fastMoney,0,id}' <> 'ufc-fast3-01-5'
    or v_pack#>>'{fastMoney,2,id}' <> 'ufc-fast4-10-4'
  then raise exception 'Oct 12 UFC Feud question identity changed'; end if;
  if v_pack#>>'{mainBoards,0,answers,0,points}' <> '10'
    or v_pack#>>'{mainBoards,0,answers,1,points}' <> '8'
    or v_pack#>>'{fastMoney,2,answers,0,points}' <> '8'
  then raise exception 'Oct 12 UFC Feud ranking changed'; end if;

  v_entities:=v_pack->'entities';
  if v_entities @> jsonb_build_array(jsonb_build_object('id',v_conor_main))
    or v_entities @> jsonb_build_array(jsonb_build_object('id',v_conor_fast))
  then raise exception 'Conor alternate identities already present; inspect before retry'; end if;
  v_entities:=v_entities||jsonb_build_array(
    jsonb_build_object('id',v_conor_main,'kind','person','displayName','Conor McGregor','aliases',jsonb_build_array('Conor','Notorious')),
    jsonb_build_object('id',v_conor_fast,'kind','person','displayName','Conor McGregor','aliases',jsonb_build_array('Conor','Notorious'))
  );
  v_pack:=jsonb_set(v_pack,'{entities}',v_entities,false);
  v_main:=v_pack->'mainBoards'->0;
  v_main:=jsonb_set(v_main,'{candidateIds}',(v_main->'candidateIds')||to_jsonb(v_conor_main),false);
  v_main:=jsonb_set(v_main,'{alsoAcceptedEntityIds}',(v_main->'alsoAcceptedEntityIds')||to_jsonb(v_conor_main),false);
  v_pack:=jsonb_set(v_pack,'{mainBoards,0}',v_main,false);
  v_fast:=v_pack->'fastMoney'->0;
  v_fast:=jsonb_set(v_fast,'{candidateIds}',(v_fast->'candidateIds')||to_jsonb(v_conor_fast),false);
  v_fast:=jsonb_set(v_fast,'{alsoAcceptedEntityIds}',(v_fast->'alsoAcceptedEntityIds')||to_jsonb(v_conor_fast),false);
  v_pack:=jsonb_set(v_pack,'{fastMoney,0}',v_fast,false);

  select (entity.ordinality-1)::integer into strict v_corner_idx
  from jsonb_array_elements(v_pack->'entities') with ordinality entity(value,ordinality)
  where entity.value->>'id'='ufc-fast4-10-4:a1'
    and entity.value->>'displayName'='Give instructions';
  v_pack:=jsonb_set(
    v_pack,array['entities',v_corner_idx::text,'aliases'],
    (v_pack#>array['entities',v_corner_idx::text,'aliases'])||to_jsonb('Advice'::text),
    false
  );
  v_setup_evidence:=jsonb_set(v_setup_evidence,'{pack}',v_pack,false);

  select p.public_state,p.submission_state->'engine_state'
    into strict v_public,v_engine
  from private.daily_challenge_progress p
  where p.daily_challenge_id=v_daily and p.profile_id=v_profile for update;

  if (v_public->>'hq_score')::integer<>73
    or (v_public->>'main_points')::integer<>51
    or (v_public#>>'{fast_money,points}')::integer<>22
    or (v_public#>>'{main_boards,0,strikes}')::integer<>1
    or (v_public#>>'{main_boards,1,strikes}')::integer<>0
    or jsonb_array_length(v_engine#>'{mainBoards,0,attempts}')<>5
    or v_engine#>>'{mainBoards,0,attempts,2,submittedText}'<>'Conor McGregor'
    or v_engine#>>'{mainBoards,0,attempts,4,submittedText}'<>'Leon Edwards'
    or v_engine#>>'{fastMoneyResults,0,submittedText}'<>'Conor Mcgregor'
    or v_engine#>>'{fastMoneyResults,2,submittedText}'<>'Advice'
    or v_public#>>'{main_boards,0,id}'<>'ufc-main-09-4'
  then raise exception 'Shane original Oct 12 guess/score evidence mismatch'; end if;

  -- Reconstruct the first four valid main-board guesses in their actual order.
  v_first:=v_public->'main_boards'->0;
  v_first:=v_first||jsonb_build_object(
    'strikes',0,
    'recorded_guesses',jsonb_build_array(
      v_first#>'{recorded_guesses,0}',
      v_first#>'{recorded_guesses,1}',
      (v_first#>'{recorded_guesses,2}')||
        jsonb_build_object('accepted',true,'matched_answer','Conor McGregor','points',2),
      v_first#>'{recorded_guesses,3}'
    ),
    'slots',jsonb_build_array(
      v_first#>'{slots,0}',
      v_first#>'{slots,1}',
      jsonb_build_object('slot_index',2,'revealed',true,'found',true,'points',2,
        'entity',jsonb_build_object('id',v_conor_main,'display_name','Conor McGregor')),
      (v_first#>'{slots,2}')||jsonb_build_object('slot_index',3)
    )
  );
  select jsonb_agg(
    case when answer.value#>>'{entity,display_name}'='Leon Edwards'
      then jsonb_set(answer.value,'{found}','false'::jsonb,false)
      else answer.value end order by answer.ordinality
  ) into v_reveal
  from jsonb_array_elements(v_first->'answer_reveal') with ordinality answer(value,ordinality);
  v_first:=jsonb_set(v_first,'{answer_reveal}',v_reveal,false);
  v_second:=v_public->'main_boards'->1;

  -- Fast Money: historic Conor is a one-point alternate; Advice means instructions.
  select jsonb_agg(
    case
      when item.ordinality=1 then item.value||jsonb_build_object(
        'points',1,'counted',true,'board_rank',null,'accepted_as','Conor McGregor')
      when item.ordinality=3 then item.value||jsonb_build_object(
        'points',8,'counted',true,'board_rank',1,'accepted_as','Give instructions')
      else item.value
    end order by item.ordinality
  ) into v_fast_public
  from jsonb_array_elements(v_public#>'{fast_money,results}') with ordinality item(value,ordinality);

  select jsonb_agg(
    case
      when item.ordinality=1 then item.value||jsonb_build_object(
        'points',1,'entityId',v_conor_fast,'matchKind','exact')
      when item.ordinality=3 then item.value||jsonb_build_object(
        'points',8,'entityId','ufc-fast4-10-4:a1','matchKind','alias')
      else item.value end order by item.ordinality
  ) into v_fast_engine
  from jsonb_array_elements(v_engine->'fastMoneyResults') with ordinality item(value,ordinality);
  if jsonb_array_length(v_fast_public)<>5 or jsonb_array_length(v_fast_engine)<>5 then
    raise exception 'Shane Fast Money result count changed'; end if;

  v_engine:=jsonb_set(v_engine,'{mainBoards,0}',
    (v_engine#>'{mainBoards,0}')||jsonb_build_object(
      'strikes',0,
      'attempts',jsonb_build_array(
        v_engine#>'{mainBoards,0,attempts,0}',
        v_engine#>'{mainBoards,0,attempts,1}',
        (v_engine#>'{mainBoards,0,attempts,2}')||
          jsonb_build_object('status','accepted','entityId',v_conor_main,'points',2),
        v_engine#>'{mainBoards,0,attempts,3}'
      ),
      'revealedEntityIds',jsonb_build_array('ufc-main-09-4:a1','ufc-main-09-4:v6',v_conor_main,'ufc-main-09-4:a2'),
      'submittedEntityIds',jsonb_build_array('ufc-main-09-4:a1','ufc-main-09-4:v6',v_conor_main,'ufc-main-09-4:a2'),
      'submittedUnrecognized','[]'::jsonb
    ),false);
  v_engine:=jsonb_set(v_engine,'{fastMoneyResults}',v_fast_engine,false);

  -- First board 22 + second board 26 = 48; Fast Money 1+7+8+7+8 = 31.
  -- This respects the four-correct stopping rule; adding 11 to 73 would not.
  execute 'alter table private.daily_challenge_setups disable trigger daily_challenge_setups_immutable';
  execute 'alter table private.daily_challenge_attempts disable trigger daily_challenge_attempts_immutable';
  begin
    update private.daily_challenge_setups
      set private_setup_evidence=v_setup_evidence where id=v_setup;
    get diagnostics v_rows=row_count;
    if v_rows<>1 then raise exception 'Oct12 setup update did not touch exactly one row'; end if;

    update private.daily_challenge_attempts
    set native_score=79,normalized_score=79,
      public_result=public_result||jsonb_build_object(
        'score',79,'main_points',48,'fast_money_points',31,'score_correction',v_tag),
      submission_evidence=submission_evidence||jsonb_build_object(
        'native_score',79,'normalized_score',79,'main_points',48,
        'fast_money_points',31,'score_correction',v_tag),
      grading_evidence_snapshot=grading_evidence_snapshot||jsonb_build_object(
        'score_correction',jsonb_build_object(
          'reason','Three fair answers, replayed through four-correct main-board limit',
          'original_score',73,'corrected_score',79,
          'original_main_points',51,'corrected_main_points',48,
          'original_fast_money_points',22,'corrected_fast_money_points',31,
          'conor_welterweight_points',2,'conor_legacy_points',1,
          'advice_corner_points',8,'fifth_original_leon_not_replayed',true))
    where id=v_attempt and normalized_score=73;
    get diagnostics v_rows=row_count;
    if v_rows<>1 then raise exception 'Shane official attempt update was not unique'; end if;
  exception when others then
    execute 'alter table private.daily_challenge_attempts enable trigger daily_challenge_attempts_immutable';
    execute 'alter table private.daily_challenge_setups enable trigger daily_challenge_setups_immutable';
    raise;
  end;
  execute 'alter table private.daily_challenge_attempts enable trigger daily_challenge_attempts_immutable';
  execute 'alter table private.daily_challenge_setups enable trigger daily_challenge_setups_immutable';

  update private.daily_challenge_progress p set
    public_state=v_public||jsonb_build_object(
      'hq_score',79,'raw_points',79,'main_points',48,
      'main_boards',jsonb_build_array(v_first,v_second),
      'fast_money',(v_public->'fast_money')||jsonb_build_object(
        'points',31,'results',v_fast_public),
      'score_correction',v_tag),
    submission_state=jsonb_set(
      jsonb_set(p.submission_state,'{engine_state}',v_engine,false),
      '{final_submission}',
      coalesce(p.submission_state->'final_submission','{}'::jsonb)||
        jsonb_build_object('native_score',79,'normalized_score',79,
          'main_points',48,'fast_money_points',31,'score_correction',v_tag),true)
  where p.daily_challenge_id=v_daily and p.profile_id=v_profile;
  get diagnostics v_rows=row_count;
  if v_rows<>1 then raise exception 'Shane progress correction was not unique'; end if;
end
$oct12_shane_feud$;
