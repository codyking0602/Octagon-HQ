-- October 19 NFL Sports Feud: regrade only actual affected submissions.
-- Repair Kansas City/Chiefs shorthand, rank Maxx Crosby at 5 without
-- lowering existing Raider answers, and accept Steve Wisniewski/Jared Cook.
-- Replays the FOUR-answer limit; original action history/proof stay preserved.
do $oct19_regrade$
declare
  v_day uuid;
  v_setup uuid;
  v_old_frag constant text := 'nfl-fast2-09-1:nfl-fast2-09-1:a1=8,nfl-fast2-09-1:a2=7,nfl-fast2-09-1:a3=6,nfl-fast2-09-1:a4=5,nfl-fast2-09-1:a5=4,nfl-fast2-09-1:a6=3,nfl-fast2-09-1:a7=2,nfl-fast2-09-1:a8=1';
  v_new_frag constant text := 'nfl-fast2-09-1:nfl-fast2-09-1:a1=8,nfl-fast2-09-1:a2=7,nfl-fast2-09-1:a3=6,nfl-fast2-09-1:a4=5,nfl-fast2-09-1:v9=5,nfl-fast2-09-1:a5=4,nfl-fast2-09-1:a6=3,nfl-fast2-09-1:a7=2';
  v_kc constant text := 'nfl-oct19-multiple-sb-winners:a5';
  v_maxx constant text := 'nfl-fast2-09-1:v9';
  v_tag constant text := '2026-10-19-nfl-feud-chiefs-raiders-regrade';
  v_pack jsonb;
  v_entities jsonb;
  v_q jsonb;
  v_s record;
  v_new_reveal jsonb;
  v_public_fast_answers jsonb;
  v_new_proof text;
  v_rows integer;
  v_attempt record;
  v_public jsonb;
  v_submission jsonb;
  v_engine jsonb;
  v_board jsonb;
  v_fast jsonb;
  v_answer jsonb;
  v_main integer;
  v_fast_score integer;
  v_score integer;
  v_delta integer;
  v_has_chiefs boolean;
  v_is_maxx boolean;
  v_has_howie boolean;
begin
  select d.id,d.setup_id into v_day,v_setup
  from private.daily_challenges d
  join private.daily_challenge_schedule_versions v on v.version=d.schedule_version
  where d.central_day=date '2026-10-19'
    and d.game_type='sports_feud' and v.sport='football';
  if v_day is null then return; end if;
  if v_day<>'b8e50eb4-4136-4414-b44c-6facfbf1b921'::uuid or
     v_setup<>'f8c7eb82-ad36-4f89-b242-2cc3bd823f79'::uuid then
    raise exception 'Unexpected October 19 NFL Feud publication identity';
  end if;
  select * into strict v_s
  from private.daily_challenge_setups where id=v_setup for update;
  v_pack:=v_s.private_setup_evidence->'pack';
  if v_pack#>>'{mainBoards,1,id}'<>'nfl-oct19-multiple-sb-winners'
    or v_pack#>>'{fastMoney,3,id}'<>'nfl-fast2-09-1'
    or v_s.private_setup_evidence->>'proof' is distinct from v_s.private_grading_evidence->>'proof'
  then raise exception 'October 19 NFL Feud publication/proof changed'; end if;
  if v_pack#>>'{fastMoney,3,answers,4,entityId}'=v_maxx then
    if not ((v_pack->'entities') @> '[{"id":"nfl-fast2-09-1:v22","displayName":"Steve Wisniewski"},{"id":"nfl-fast2-09-1:v23","displayName":"Jared Cook"}]'::jsonb)
      or v_pack#>>'{fastMoney,3,answers,4,points}'<>'5'
      or not (v_pack#>'{mainBoards,1,candidateIds}' ? v_kc)
      or position(v_new_frag in v_s.private_setup_evidence->>'proof')=0
    then raise exception 'Previously corrected Oct 19 NFL board is inconsistent'; end if;
    return; -- Safe rerun after deployment.
  end if;
  if v_pack#>>'{fastMoney,3,answers,7,entityId}'<>'nfl-fast2-09-1:a8'
    or v_pack#>>'{fastMoney,3,answers,4,entityId}'<>'nfl-fast2-09-1:a5'
    or not (v_pack#>'{fastMoney,3,alsoAcceptedEntityIds}' ? v_maxx)
    or (v_pack->'entities') @> '[{"id":"nfl-fast2-09-1:v22"}]'::jsonb
    or position(v_old_frag in v_s.private_setup_evidence->>'proof')=0
  then raise exception 'Pre-regrade Raiders board differs from audited version'; end if;

  -- Correct the Chiefs alias in the published, immutable answer snapshot.
  select jsonb_agg(case when e.value->>'id'=v_kc then
    jsonb_set(e.value,'{aliases}',(e.value->'aliases')||'["Kansas City","Cheifs"]'::jsonb,false)
    else e.value end order by e.ordinality)
  into v_entities
  from jsonb_array_elements(v_pack->'entities') with ordinality e(value,ordinality);
  v_entities:=v_entities||jsonb_build_array(
    jsonb_build_object('id','nfl-fast2-09-1:v22','displayName','Steve Wisniewski','kind','person','aliases','[]'::jsonb),
    jsonb_build_object('id','nfl-fast2-09-1:v23','displayName','Jared Cook','kind','person','aliases','[]'::jsonb));
  v_pack:=jsonb_set(v_pack,'{entities}',v_entities,false);

  -- Maxx was a published 1-point accepted alternate. Promote that stable ID
  -- into the ranked list at 5; Gene's former rank-eight ID stays valid at 1.
  v_q:=v_pack#>'{fastMoney,3}';
  v_q:=jsonb_set(v_q,'{answers}',
    (select jsonb_agg(z.a order by z.n) from (
      select a.value a, a.ordinality::numeric n
        from jsonb_array_elements(v_q->'answers') with ordinality a(value,ordinality)
        where a.ordinality<=7
      union all select jsonb_build_object('entityId',v_maxx,'points',5), 4.5::numeric
    ) z),false);
  v_q:=jsonb_set(v_q,'{alsoAcceptedEntityIds}',
    (select coalesce(jsonb_agg(e.value order by e.ordinality),'[]'::jsonb)
     from jsonb_array_elements(v_q->'alsoAcceptedEntityIds') with ordinality e(value,ordinality)
     where e.value #>> '{}' <> v_maxx)
     ||'["nfl-fast2-09-1:a8","nfl-fast2-09-1:v22","nfl-fast2-09-1:v23"]'::jsonb,false);
  v_q:=jsonb_set(v_q,'{candidateIds}',
    (v_q->'candidateIds')||'["nfl-fast2-09-1:v22","nfl-fast2-09-1:v23"]'::jsonb,false);
  v_pack:=jsonb_set(v_pack,'{fastMoney,3}',v_q,false);
  select jsonb_agg(jsonb_build_object(
      'rank',a.ordinality,'entity',jsonb_build_object('id',a.value->>'entityId',
          'display_name',e.entity->>'displayName'),
      'points',(a.value->>'points')::integer) order by a.ordinality)
    into v_new_reveal
  from jsonb_array_elements(v_q->'answers') with ordinality a(value,ordinality)
  join lateral (
    select item.value entity from jsonb_array_elements(v_entities) item
    where item.value->>'id'=a.value->>'entityId'
  ) e on true;
  if jsonb_array_length(v_new_reveal)<>8
    or v_new_reveal#>>'{4,entity,display_name}'<>'Maxx Crosby'
    or v_new_reveal#>>'{5,entity,display_name}'<>'Howie Long'
  then raise exception 'Raiders rank reconstruction failed'; end if;
  select jsonb_agg(jsonb_build_object('entity',a.value->'entity','points',a.value->'points')
    order by a.ordinality) into v_public_fast_answers
  from jsonb_array_elements(v_new_reveal) with ordinality a(value,ordinality);
  v_new_proof:=replace(v_s.private_setup_evidence->>'proof',v_old_frag,v_new_frag);
  if v_new_proof=v_s.private_setup_evidence->>'proof' then
    raise exception 'Proof signature did not change for promoted Maxx'; end if;

  -- Setups are immutable during normal play. Scope trigger exemption to this
  -- one audited publication; restore it on success and failure.
  execute 'alter table private.daily_challenge_setups disable trigger daily_challenge_setups_immutable';
  begin
    update private.daily_challenge_setups set
      private_setup_evidence=jsonb_set(private_setup_evidence,'{pack}',v_pack,false)
          ||jsonb_build_object('proof',v_new_proof),
      private_grading_evidence=private_grading_evidence||jsonb_build_object('proof',v_new_proof),
      reveal_setup=jsonb_set(reveal_setup,'{fast_money,3,accepted_answers}',v_new_reveal,false)
    where id=v_setup;
    get diagnostics v_rows=row_count;
    if v_rows<>1 then raise exception 'Expected one Oct 19 setup update'; end if;
  exception when others then
    execute 'alter table private.daily_challenge_setups enable trigger daily_challenge_setups_immutable';
    raise;
  end;
  execute 'alter table private.daily_challenge_setups enable trigger daily_challenge_setups_immutable';

  execute 'alter table private.daily_challenge_attempts disable trigger daily_challenge_attempts_immutable';
  begin
    for v_attempt in
      select a.* from private.daily_challenge_attempts a
      where a.daily_challenge_id=v_day and a.attempt_kind='official_first'
      order by a.completed_at for update
    loop
      select p.public_state,p.submission_state into strict v_public,v_submission
      from private.daily_challenge_progress p
      where p.daily_challenge_id=v_day and p.profile_id=v_attempt.profile_id for update;
      v_engine:=v_submission->'engine_state';
      if v_attempt.normalized_score is distinct from (v_public->>'hq_score')::integer
        or v_public#>>'{fast_money,results,3,question_id}'<>'nfl-fast2-09-1'
      then raise exception 'Original Oct 19 score or Fast Money snapshot out of sync'; end if;

      v_is_maxx:=v_engine#>>'{fastMoneyResults,3,entityId}'=v_maxx;
      v_has_howie:=v_engine#>>'{fastMoneyResults,3,entityId}'='nfl-fast2-09-1:a5';
      v_has_chiefs:=v_engine#>>'{mainBoards,1,attempts,2,submittedText}'='Kansas City'
        and v_engine#>>'{mainBoards,1,attempts,2,status}'='rejected';
      if v_is_maxx and v_engine#>>'{fastMoneyResults,3,points}'<>'1' then
        raise exception 'Maxx score no longer matches original 1 point'; end if;
      if v_has_chiefs and (
        v_attempt.normalized_score<>64
        or v_engine#>>'{mainBoards,1,attempts,3,submittedText}'<>'Cheifs'
        or v_engine#>>'{mainBoards,1,attempts,4,submittedText}'<>'Eagles'
        or v_engine#>>'{mainBoards,1,attempts,5,submittedText}'<>'Giants'
        or v_public#>>'{main_boards,1,strikes}'<>'2'
      ) then raise exception 'Chiefs player sequence changed; manual regrade required'; end if;

      v_main:=(v_public->>'main_points')::integer;
      v_fast_score:=(v_public#>>'{fast_money,points}')::integer;
      v_score:=v_attempt.normalized_score;
      v_delta:=0;
      v_fast:=v_public->'fast_money';
      v_answer:=v_fast#>'{results,3}';
      v_answer:=jsonb_set(v_answer,'{accepted_answers}',v_public_fast_answers,false);
      if v_is_maxx then
        v_delta:=4;
        v_fast_score:=v_fast_score+4;
        v_engine:=jsonb_set(v_engine,'{fastMoneyResults,3,points}','5'::jsonb,false);
        v_answer:=v_answer||jsonb_build_object('points',5,'board_rank',5,'accepted_as','Maxx Crosby');
      elsif v_has_howie then
        v_answer:=v_answer||jsonb_build_object('board_rank',6);
      end if;
      v_fast:=jsonb_set(v_fast,'{results,3}',v_answer,false)
        ||jsonb_build_object('points',v_fast_score);

      if v_has_chiefs then
        -- Canonical replay: Cowboys (7), Patriots (10), Chiefs (5), Eagles (2).
        -- "Cheifs" is the duplicate Chiefs guess, not another strike.
        -- Giants was typed after the newly-valid fourth answer; preserve the
        -- original complete action history in the immutable correction audit.
        v_board:=v_public#>'{main_boards,1}';
        v_board:=v_board||jsonb_build_object(
          'strikes',0,
          'slots',jsonb_build_array(
            v_board#>'{slots,0}',v_board#>'{slots,1}',
            jsonb_build_object('slot_index',2,'revealed',true,'found',true,
              'points',5,'entity',jsonb_build_object('id',v_kc,'display_name','Kansas City Chiefs')),
            (v_board#>'{slots,2}')||jsonb_build_object('slot_index',3)),
          'recorded_guesses',jsonb_build_array(
            v_board#>'{recorded_guesses,0}',v_board#>'{recorded_guesses,1}',
            (v_board#>'{recorded_guesses,2}')||
              jsonb_build_object('points',5,'accepted',true,'matched_answer','Kansas City Chiefs'),
            v_board#>'{recorded_guesses,4}'),
          'answer_reveal',(select jsonb_agg(
              case when e.value#>>'{entity,id}'=v_kc then jsonb_set(e.value,'{found}','true'::jsonb,false)
                   when e.value#>>'{entity,id}'='nfl-oct19-multiple-sb-winners:a7' then jsonb_set(e.value,'{found}','false'::jsonb,false)
                   else e.value end order by e.ordinality)
            from jsonb_array_elements(v_board->'answer_reveal') with ordinality e(value,ordinality))
        );
        v_public:=jsonb_set(v_public,'{main_boards,1}',v_board,false);
        v_engine:=jsonb_set(v_engine,'{mainBoards,1}',
          (v_engine#>'{mainBoards,1}')||jsonb_build_object(
            'strikes',0,'attempts',jsonb_build_array(
              v_engine#>'{mainBoards,1,attempts,0}',
              v_engine#>'{mainBoards,1,attempts,1}',
              (v_engine#>'{mainBoards,1,attempts,2}')||
                jsonb_build_object('entityId',v_kc,'status','accepted','points',5),
              v_engine#>'{mainBoards,1,attempts,4}'),
            'revealedEntityIds',jsonb_build_array(
              'nfl-oct19-multiple-sb-winners:a3','nfl-oct19-multiple-sb-winners:a1',
              v_kc,'nfl-oct19-multiple-sb-winners:v7'),
            'submittedEntityIds',jsonb_build_array(
              'nfl-oct19-multiple-sb-winners:a3','nfl-oct19-multiple-sb-winners:a1',
              v_kc,'nfl-oct19-multiple-sb-winners:v7'),
            'submittedUnrecognized','[]'::jsonb
          ),false);
        v_main:=v_main+1;
        v_delta:=v_delta+1;
      end if;
      v_score:=v_score+v_delta;
      v_public:=v_public||jsonb_build_object(
        'main_points',v_main,'fast_money',v_fast,'hq_score',v_score,'raw_points',v_score);
      if v_delta<>0 then
        v_public:=v_public||jsonb_build_object('score_correction',v_tag);
      end if;
      update private.daily_challenge_progress set
        revision=revision+1,
        public_state=v_public,
        submission_state=jsonb_set(
          jsonb_set(v_submission,'{engine_state}',v_engine,false),
          '{final_submission}',coalesce(v_submission->'final_submission','{}'::jsonb)||
            jsonb_build_object('main_points',v_main,'fast_money_points',v_fast_score,
              'native_score',v_score,'normalized_score',v_score,
              'score_correction',case when v_delta>0 then v_tag else null end),true)
      where daily_challenge_id=v_day and profile_id=v_attempt.profile_id;
      get diagnostics v_rows=row_count;
      if v_rows<>1 then raise exception 'Progress regrade affected % rows',v_rows; end if;

      if v_delta<>0 then
        update private.daily_challenge_attempts set
          native_score=v_score,normalized_score=v_score,
          public_result=public_result||jsonb_build_object('score',v_score,
            'main_points',v_main,'fast_money_points',v_fast_score,'score_correction',v_tag),
          submission_evidence=submission_evidence||jsonb_build_object(
            'native_score',v_score,'normalized_score',v_score,'main_points',v_main,
            'fast_money_points',v_fast_score,'score_correction',v_tag),
          grading_evidence_snapshot=grading_evidence_snapshot||jsonb_build_object(
            'score_correction',jsonb_build_object(
              'tag',v_tag,'original_score',v_attempt.normalized_score,
              'corrected_score',v_score,'original_main',v_attempt.public_result->'main_points',
              'corrected_main',v_main,'original_fast',v_attempt.public_result->'fast_money_points',
              'corrected_fast',v_fast_score,'chiefs_replayed',v_has_chiefs,
              'maxx_promoted',v_is_maxx,'original_proof_preserved',true,
              'raw_action_history_preserved',true))
        where id=v_attempt.id and normalized_score=v_attempt.normalized_score;
        get diagnostics v_rows=row_count;
        if v_rows<>1 then raise exception 'Official attempt regrade affected % rows',v_rows; end if;
        -- private.daily_challenge_history is a UNION ALL view over official attempts;
        -- correcting this official row updates leaderboards automatically.
      end if;
    end loop;
  exception when others then
    execute 'alter table private.daily_challenge_attempts enable trigger daily_challenge_attempts_immutable';
    raise;
  end;
  execute 'alter table private.daily_challenge_attempts enable trigger daily_challenge_attempts_immutable';
end
$oct19_regrade$;
