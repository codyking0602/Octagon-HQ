-- Oct 15 CFB Feud: review-only correction for two actually-entered sophomore Heisman winners.
-- Heisman Trust: https://www.heisman.com/heisman-winners/lamar-jackson/
--                https://www.heisman.com/heisman-winners/tim-tebow/
-- The prior scored attempts and original source proofs remain in audit metadata.
-- Re-rank the published first Fast Money board to match the corrected authored
-- pool: Lamar is #4 (5 points), while the displaced Clowney remains accepted
-- off-board (1 point); Tebow becomes a 1-point accepted alternate.
-- Do not change any unrelated player score, answer order, or main-board result.
do $oct15_cfb_feud$
declare
  v_daily uuid;
  v_setup uuid;
  v_setup_evidence jsonb;
  v_grading jsonb;
  v_reveal jsonb;
  v_pack jsonb;
  v_question jsonb;
  v_entities jsonb;
  v_old_proof text;
  v_new_proof text;
  v_old_fragment constant text := 'cfb-fast5-08-4:cfb-fast5-08-4:a1=8,cfb-fast5-08-4:a2=7,cfb-fast5-08-4:a3=6,cfb-fast5-08-4:a4=5,cfb-fast5-08-4:a5=4,cfb-fast5-08-4:a6=3,cfb-fast5-08-4:a7=2,cfb-fast5-08-4:a8=1';
  v_new_fragment constant text := 'cfb-fast5-08-4:cfb-fast5-08-4:a1=8,cfb-fast5-08-4:a2=7,cfb-fast5-08-4:a3=6,cfb-fast5-08-4:v8=5,cfb-fast5-08-4:a5=4,cfb-fast5-08-4:a6=3,cfb-fast5-08-4:a7=2,cfb-fast5-08-4:a8=1';
  v_lamar constant text := 'cfb-fast5-08-4:v8';
  v_tebow constant text := 'cfb-fast5-08-4:v9';
  v_tag constant text := '2026-10-15-cfb-young-stars-lamar-tebow-editorial-regrade';
  v_name text;
  v_profile uuid;
  v_attempt uuid;
  v_current_score integer;
  v_old integer;
  v_new integer;
  v_main integer;
  v_old_fast integer;
  v_new_fast integer;
  v_award integer;
  v_answer text;
  v_person_id text;
  v_rank integer;
  v_public jsonb;
  v_submission jsonb;
  v_fast jsonb;
  v_first jsonb;
  v_engine jsonb;
  v_evidence jsonb;
  v_result jsonb;
  v_rows integer;
begin
  select d.id,d.setup_id into strict v_daily,v_setup
  from private.daily_challenges d
  join private.daily_challenge_schedule_versions v on v.version=d.schedule_version
  where d.central_day=date '2026-10-15' and v.sport='football' and d.game_type='sports_feud';

  select private_setup_evidence,private_grading_evidence,reveal_setup
    into strict v_setup_evidence,v_grading,v_reveal
  from private.daily_challenge_setups where id=v_setup for update;

  v_pack:=v_setup_evidence->'pack';
  v_question:=v_pack->'fastMoney'->0;
  if v_question->>'id'<>'cfb-fast5-08-4'
    or v_pack#>>'{mainBoards,0,id}'<>'cfb-main-06-1'
    or v_pack#>>'{mainBoards,1,id}'<>'cfb-main-13-3'
  then raise exception 'Oct 15 CFB Feud daily question identity changed'; end if;

  if v_question#>>'{answers,3,entityId}'='cfb-fast5-08-4:a4' then
    -- Idempotent when the migration has already run.
    if v_question#>>'{answers,3,points}'<>'5'
      or v_question->'candidateIds' ? v_lamar
      or v_question->'candidateIds' ? v_tebow
      or position(v_old_fragment in coalesce(v_setup_evidence->>'proof',''))=0
      or position(v_old_fragment in coalesce(v_grading->>'proof',''))=0
      or v_reveal#>>'{fast_money,0,accepted_answers,3,entity,display_name}'<>'Jadeveon Clowney'
    then raise exception 'Unexpected published Oct 15 CFB board before correction'; end if;

    v_entities:=v_pack->'entities';
    v_entities:=v_entities||jsonb_build_array(
      jsonb_build_object('id',v_lamar,'kind','person','displayName','Lamar Jackson','aliases','[]'::jsonb),
      jsonb_build_object('id',v_tebow,'kind','person','displayName','Tim Tebow','aliases',jsonb_build_array('Tebow'))
    );
    v_question:=jsonb_set(v_question,'{answers,3,entityId}',to_jsonb(v_lamar),false);
    v_question:=jsonb_set(v_question,'{candidateIds}',
      (v_question->'candidateIds')||jsonb_build_array(v_lamar,v_tebow),false);
    v_question:=jsonb_set(v_question,'{alsoAcceptedEntityIds}',
      (v_question->'alsoAcceptedEntityIds')||jsonb_build_array('cfb-fast5-08-4:a4',v_tebow),false);
    v_pack:=jsonb_set(jsonb_set(v_pack,'{entities}',v_entities,false),
      '{fastMoney,0}',v_question,false);
    v_old_proof:=v_setup_evidence->>'proof';
    v_new_proof:=replace(v_old_proof,v_old_fragment,v_new_fragment);
    v_setup_evidence:=jsonb_set(v_setup_evidence,'{pack}',v_pack,false)
      ||jsonb_build_object('proof',v_new_proof);
    v_grading:=v_grading||jsonb_build_object('proof',replace(v_grading->>'proof',v_old_fragment,v_new_fragment));
    v_reveal:=jsonb_set(v_reveal,'{fast_money,0,accepted_answers,3,entity}',
      jsonb_build_object('id',v_lamar,'display_name','Lamar Jackson'),false);

    execute 'alter table private.daily_challenge_setups disable trigger daily_challenge_setups_immutable';
    begin
      update private.daily_challenge_setups set
        private_setup_evidence=v_setup_evidence,
        private_grading_evidence=v_grading,
        reveal_setup=v_reveal
      where id=v_setup;
      get diagnostics v_rows=row_count;
      if v_rows<>1 then raise exception 'Oct 15 setup repair not unique'; end if;
    exception when others then
      execute 'alter table private.daily_challenge_setups enable trigger daily_challenge_setups_immutable';
      raise;
    end;
    execute 'alter table private.daily_challenge_setups enable trigger daily_challenge_setups_immutable';
  elsif v_question#>>'{answers,3,entityId}'<>v_lamar
    or not (v_question->'alsoAcceptedEntityIds' ? v_tebow)
    or position(v_new_fragment in coalesce(v_setup_evidence->>'proof',''))=0
  then
    raise exception 'Oct 15 CFB board is neither original nor previously corrected';
  end if;

  for v_name in select unnest(array['CODY','LIB']) loop
    select id into strict v_profile from public.profiles where normalized_name=v_name;
    select a.id,a.normalized_score into strict v_attempt,v_current_score
      from private.daily_challenge_attempts a
      where a.daily_challenge_id=v_daily and a.profile_id=v_profile
        and a.attempt_kind='official_first' for update;

    v_old:=case when v_name='CODY' then 59 else 28 end;
    v_new:=case when v_name='CODY' then 64 else 29 end;
    v_old_fast:=case when v_name='CODY' then 3 else 12 end;
    v_new_fast:=case when v_name='CODY' then 8 else 13 end;
    v_main:=case when v_name='CODY' then 56 else 16 end;
    v_award:=case when v_name='CODY' then 5 else 1 end;
    v_answer:=case when v_name='CODY' then 'Lamar Jackson' else 'Tebow' end;
    v_person_id:=case when v_name='CODY' then v_lamar else v_tebow end;
    v_rank:=case when v_name='CODY' then 4 else null end;

    if v_current_score=v_new then continue; end if;
    if v_current_score<>v_old then
      raise exception 'Oct 15 % score changed: % (expected %)',v_name,v_current_score,v_old; end if;

    select public_state,submission_state into strict v_public,v_submission
      from private.daily_challenge_progress
      where daily_challenge_id=v_daily and profile_id=v_profile for update;
    v_engine:=v_submission->'engine_state';
    v_first:=v_public#>'{fast_money,results,0}';
    if (v_public->>'main_points')::integer<>v_main
      or (v_public#>>'{fast_money,points}')::integer<>v_old_fast
      or (v_public->>'hq_score')::integer<>v_old
      or v_first->>'question_id'<>'cfb-fast5-08-4'
      or v_first->>'submitted_answer'<>v_answer
      or v_first->>'points'<>'0'
      or v_first->>'counted'<>'false'
      or v_engine#>>'{fastMoneyResults,0,submittedText}'<>v_answer
      or v_engine#>>'{fastMoneyResults,0,questionId}'<>'cfb-fast5-08-4'
      or v_engine#>>'{fastMoneyResults,0,points}'<>'0'
      or jsonb_array_length(v_public#>'{fast_money,results}')<>5
    then raise exception 'Oct 15 % original fast-money evidence changed',v_name; end if;

    -- Preserve all other answers. Only the first Fast Money question is regraded.
    v_first:=v_first||jsonb_build_object(
      'points',v_award,'counted',true,'board_rank',v_rank,
      'accepted_as',case when v_name='CODY' then 'Lamar Jackson' else 'Tim Tebow' end,
      'accepted_answers',v_reveal#>'{fast_money,0,accepted_answers}'
    );
    v_fast:=jsonb_set(v_public->'fast_money','{results,0}',v_first,false)
      ||jsonb_build_object('points',v_new_fast);
    v_public:=v_public||jsonb_build_object(
      'fast_money',v_fast,'hq_score',v_new,'raw_points',v_new,
      'score_correction',v_tag);
    v_engine:=jsonb_set(v_engine,'{fastMoneyResults,0}',
      (v_engine#>'{fastMoneyResults,0}')||
      jsonb_build_object('entityId',v_person_id,'points',v_award,
        'matchKind',case when v_name='CODY' then 'exact' else 'surname' end),false);
    v_evidence:=jsonb_build_object(
      'tag',v_tag,
      'reason','2016 and 2007 sophomore Heisman winners legitimately broke out before upperclassman status',
      'original_score',v_old,'corrected_score',v_new,
      'original_fast_money_points',v_old_fast,'corrected_fast_money_points',v_new_fast,
      'awarded_answer',v_answer,'awarded_points',v_award,'board_rank',v_rank,
      'original_question_id','cfb-fast5-08-4',
      'original_question_prompt','Name a player fans knew was special before he was an upperclassman.',
      'original_answer_result',v_public#>'{fast_money,results,0}',
      'heisman_evidence',jsonb_build_array(
        'https://www.heisman.com/heisman-winners/lamar-jackson/',
        'https://www.heisman.com/heisman-winners/tim-tebow/'),
      'original_proof_preserved',true);

    execute 'alter table private.daily_challenge_attempts disable trigger daily_challenge_attempts_immutable';
    begin
      update private.daily_challenge_attempts set
        native_score=v_new,normalized_score=v_new,
        public_result=public_result||jsonb_build_object('score',v_new,'main_points',v_main,
          'fast_money_points',v_new_fast,'score_correction',v_tag),
        submission_evidence=submission_evidence||jsonb_build_object('native_score',v_new,
          'normalized_score',v_new,'main_points',v_main,
          'fast_money_points',v_new_fast,'score_correction',v_tag),
        grading_evidence_snapshot=grading_evidence_snapshot||
          jsonb_build_object('score_correction',v_evidence)
      where id=v_attempt and normalized_score=v_old;
      get diagnostics v_rows=row_count;
      if v_rows<>1 then raise exception 'Oct 15 % attempt update not unique',v_name; end if;
    exception when others then
      execute 'alter table private.daily_challenge_attempts enable trigger daily_challenge_attempts_immutable';
      raise;
    end;
    execute 'alter table private.daily_challenge_attempts enable trigger daily_challenge_attempts_immutable';

    update private.daily_challenge_progress set
      public_state=v_public,
      submission_state=jsonb_set(
        jsonb_set(v_submission,'{engine_state}',v_engine,false),
        '{final_submission}',(v_submission->'final_submission')||
          jsonb_build_object('native_score',v_new,'normalized_score',v_new,
            'main_points',v_main,'fast_money_points',v_new_fast,'score_correction',v_tag),false)
    where daily_challenge_id=v_daily and profile_id=v_profile;
    get diagnostics v_rows=row_count;
    if v_rows<>1 then raise exception 'Oct 15 % progress update not unique',v_name; end if;
  end loop;
end
$oct15_cfb_feud$;
