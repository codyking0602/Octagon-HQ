-- October 9 Football Daily Sports Feud: narrow, idempotent fairness correction.
-- Preserve ranked boards, official proof, original action_history and completion times.
-- Frozen historical plays are adjudicated from inputs actually entered; no replayed guesses.
do $oct9_lib_tyler_setup$
declare
  v_setup uuid; v_evidence jsonb; v_pack jsonb; v_board jsonb; v_entities jsonb;
begin
  select d.setup_id into strict v_setup
  from private.daily_challenges d
  join private.daily_challenge_schedule_versions s on s.version=d.schedule_version
  where d.central_day=date '2026-10-09' and s.sport='football' and d.game_type='sports_feud';

  select private_setup_evidence into v_evidence from private.daily_challenge_setups where id=v_setup;
  v_pack:=v_evidence->'pack';
  v_board:=v_pack->'mainBoards'->0;
  v_entities:=v_pack->'entities';
  if v_board->>'id'<>'nfl-main-19-5'
    or not (v_board->'candidateIds' ? 'nfl-main-19-5:v9')
    or not (v_board->'candidateIds' ? 'nfl-main-19-5:a4')
    or not (v_board->'candidateIds' ? 'nfl-main-19-5:a6')
    or not (v_pack->'fastMoney'->1->'candidateIds' ? 'nfl-fast3-08-2:a2')
    then raise exception 'Oct 9 published defensive board/fast-money identities changed';
  end if;

  if exists (select 1 from jsonb_array_elements(v_entities) e
    where e->>'id'='nfl-main-19-5:v10' and e->>'displayName'<>'Agility')
    then raise exception 'Oct 9 Agility ID already belongs to another answer'; end if;

  if not exists (select 1 from jsonb_array_elements(v_entities) e
    where e->>'id'='nfl-main-19-5:v10') then
    v_entities:=v_entities || jsonb_build_array(
      jsonb_build_object('id','nfl-main-19-5:v10','kind','other','displayName','Agility','aliases','[]'::jsonb));
  end if;
  if not (v_board->'candidateIds' ? 'nfl-main-19-5:v10') then
    v_board:=jsonb_set(v_board,'{candidateIds}',v_board->'candidateIds'||to_jsonb('nfl-main-19-5:v10'::text),false);
  end if;
  if not (v_board->'alsoAcceptedEntityIds' ? 'nfl-main-19-5:v10') then
    v_board:=jsonb_set(v_board,'{alsoAcceptedEntityIds}',
      v_board->'alsoAcceptedEntityIds'||to_jsonb('nfl-main-19-5:v10'::text),false);
  end if;

  -- The same narrow aliases are hydrated by the runtime for previously
  -- published packs. Also embed them in the stored Oct 9 pack for durability.
  select jsonb_agg(
    case
      when e.value->>'id'='nfl-main-19-5:a6'
        then e.value||jsonb_build_object('aliases',
          '["Force Turnovers","Forced Turnovers","Interception","Interceptions","Takeaway","Takeaways"]'::jsonb)
      when e.value->>'id'='nfl-main-19-5:a4'
        then e.value||jsonb_build_object('aliases',
          '["Pass Defense","Pass Coverage","Man Coverage","Sticky Man Coverage"]'::jsonb)
      when e.value->>'id'='nfl-fast3-08-2:a2'
        then e.value||jsonb_build_object('aliases','["Gronk"]'::jsonb)
      else e.value
    end order by e.ordinality
  ) into v_entities from jsonb_array_elements(v_entities) with ordinality e(value,ordinality);

  v_pack:=jsonb_set(jsonb_set(v_pack,'{entities}',v_entities,false),'{mainBoards,0}',v_board,false);
  v_evidence:=jsonb_set(v_evidence,'{pack}',v_pack,false);
  execute 'alter table private.daily_challenge_setups disable trigger daily_challenge_setups_immutable';
  begin
    update private.daily_challenge_setups set private_setup_evidence=v_evidence where id=v_setup;
  exception when others then
    execute 'alter table private.daily_challenge_setups enable trigger daily_challenge_setups_immutable';
    raise;
  end;
  execute 'alter table private.daily_challenge_setups enable trigger daily_challenge_setups_immutable';
end
$oct9_lib_tyler_setup$;

do $oct9_lib_tyler_regrade$
declare
  v_who text; v_profile uuid; v_daily uuid; v_attempt uuid;
  v_old integer; v_score integer; v_main integer; v_fast_points integer;
  v_public jsonb; v_submission jsonb; v_engine jsonb;
  v_board jsonb; v_engine_board jsonb; v_reveal jsonb; v_slots jsonb;
  v_guesses jsonb; v_attempts jsonb; v_revealed jsonb; v_submitted jsonb;
  v_fast jsonb; v_reason text;
begin
  select d.id into strict v_daily
  from private.daily_challenges d
  join private.daily_challenge_schedule_versions s on s.version=d.schedule_version
  where d.central_day=date '2026-10-09' and s.sport='football' and d.game_type='sports_feud';

  for v_who in select unnest(array['LIB','TYLER']) loop
    select id into strict v_profile from public.profiles where normalized_name=v_who;
    select id,normalized_score into strict v_attempt,v_old
      from private.daily_challenge_attempts
      where daily_challenge_id=v_daily and profile_id=v_profile and attempt_kind='official_first';
    v_score:=case when v_who='LIB' then 39 else 81 end;
    if v_old=v_score then continue; end if;
    if v_old<>case when v_who='LIB' then 26 else 72 end
      then raise exception 'Oct 9 % score changed unexpectedly from %',v_who,v_old; end if;

    select public_state,submission_state into strict v_public,v_submission
      from private.daily_challenge_progress
      where daily_challenge_id=v_daily and profile_id=v_profile;
    v_engine:=v_submission->'engine_state';
    v_board:=v_public->'main_boards'->0;
    v_engine_board:=v_engine->'mainBoards'->0;
    if v_board->>'id'<>'nfl-main-19-5'
      or v_public->'main_boards'->1->>'id'<>'nfl-main-07-2'
      or v_board->>'strikes'<>'3'
      or v_submission->'action_history'->0->>'type'<>'answer'
      then raise exception 'Oct 9 % published run no longer matches audited board',v_who; end if;

    if v_who='LIB' then
      if v_submission->'action_history'->1->>'answer'<>'Agility'
        or v_submission->'action_history'->2->>'answer'<>'Blocking'
        or v_submission->'action_history'->3->>'answer'<>'Interception'
        or v_submission->'action_history'->9->>'answer'<>'Gronk'
        or (v_public->>'main_points')::integer<>4
        or (v_public->'fast_money'->>'points')::integer<>22
        then raise exception 'Oct 9 Lib answer sequence/score changed'; end if;

      v_main:=10; v_fast_points:=29;
      v_slots:=jsonb_build_array(
        v_board->'slots'->0,
        jsonb_build_object('slot_index',1,'found',true,'revealed',true,'points',2,
          'entity',jsonb_build_object('id','nfl-main-19-5:v10','display_name','Agility')),
        jsonb_build_object('slot_index',2,'found',true,'revealed',true,'points',4,
          'entity',jsonb_build_object('id','nfl-main-19-5:a6','display_name','Turnovers')),
        v_board->'slots'->3);
      v_guesses:=jsonb_build_array(
        v_board->'recorded_guesses'->0,
        jsonb_build_object('submitted_answer','Agility','matched_answer','Agility','accepted',true,'points',2),
        v_board->'recorded_guesses'->2,
        jsonb_build_object('submitted_answer','Interception','matched_answer','Turnovers','accepted',true,'points',4));
      v_attempts:=jsonb_build_array(
        v_engine_board->'attempts'->0,
        jsonb_build_object('submittedText','Agility','entityId','nfl-main-19-5:v10','points',2,'status','accepted'),
        v_engine_board->'attempts'->2,
        jsonb_build_object('submittedText','Interception','entityId','nfl-main-19-5:a6','points',4,'status','accepted'));
      v_revealed:='["nfl-main-19-5:v2","nfl-main-19-5:v10","nfl-main-19-5:a6"]'::jsonb;
      v_submitted:=v_revealed;
      v_reason:='Agility +2, Interception/Turnovers +4, Gronk/Rob Gronkowski +7. Published play stopped after three incorrect rulings; do not invent any additional guesses.';
      v_fast:=v_public->'fast_money';
      v_fast:=jsonb_set(v_fast,'{results,1}',
        (v_fast->'results'->1)||jsonb_build_object(
          'points',7,'counted',true,'board_rank',2,'submitted_answer','Rob Gronkowski'),false);
      v_fast:=v_fast||jsonb_build_object('points',29);
      v_engine:=jsonb_set(v_engine,'{fastMoneyResults,1}',
        (v_engine->'fastMoneyResults'->1)||jsonb_build_object(
          'entityId','nfl-fast3-08-2:a2','points',7,'matchKind','alias'),false);
      v_public:=v_public||jsonb_build_object('fast_money',v_fast,
        'historical_board_note','First board closed prematurely under invalid answer grading; only submitted answers credited.');
    else
      -- Pass Defense is Tyler's fourth successful input. Later Interceptions
      -- would be duplicate Turnovers and Sticky Man Coverage a valid Coverage
      -- alias, but neither is scored after the four-slot board completes.
      if v_submission->'action_history'->2->>'answer'<>'Force Turnovers'
        or v_submission->'action_history'->3->>'answer'<>'Pass Defense'
        or v_submission->'action_history'->4->>'answer'<>'Interceptions'
        or v_submission->'action_history'->5->>'answer'<>'Sticky Man Coverage'
        or (v_public->>'main_points')::integer<>36
        or (v_public->'fast_money'->>'points')::integer<>36
        then raise exception 'Oct 9 Tyler answer sequence/score changed'; end if;

      v_main:=45; v_fast_points:=36;
      v_slots:=jsonb_build_array(
        v_board->'slots'->0,v_board->'slots'->1,
        jsonb_build_object('slot_index',2,'found',true,'revealed',true,'points',4,
          'entity',jsonb_build_object('id','nfl-main-19-5:a6','display_name','Turnovers')),
        jsonb_build_object('slot_index',3,'found',true,'revealed',true,'points',5,
          'entity',jsonb_build_object('id','nfl-main-19-5:a4','display_name','Coverage')));
      v_guesses:=jsonb_build_array(
        v_board->'recorded_guesses'->0,v_board->'recorded_guesses'->1,
        jsonb_build_object('submitted_answer','Force Turnovers','matched_answer','Turnovers','accepted',true,'points',4),
        jsonb_build_object('submitted_answer','Pass Defense','matched_answer','Coverage','accepted',true,'points',5));
      v_attempts:=jsonb_build_array(
        v_engine_board->'attempts'->0,v_engine_board->'attempts'->1,
        jsonb_build_object('submittedText','Force Turnovers','entityId','nfl-main-19-5:a6','points',4,'status','accepted'),
        jsonb_build_object('submittedText','Pass Defense','entityId','nfl-main-19-5:a4','points',5,'status','accepted'));
      v_revealed:='["nfl-main-19-5:a2","nfl-main-19-5:a3","nfl-main-19-5:a6","nfl-main-19-5:a4"]'::jsonb;
      v_submitted:=v_revealed;
      v_reason:='Force Turnovers +4 and Pass Defense +5. Four answers complete first board; later recorded inputs preserved in original action history.';
    end if;

    select coalesce(jsonb_agg(
      case when row.value->'entity'->>'id' in ('nfl-main-19-5:a6','nfl-main-19-5:a4')
        and (v_who='TYLER' or row.value->'entity'->>'id'='nfl-main-19-5:a6')
      then row.value||jsonb_build_object('found',true) else row.value end
      order by row.ordinality),'[]'::jsonb)
      into v_reveal
      from jsonb_array_elements(v_board->'answer_reveal') with ordinality row(value,ordinality);

    v_board:=v_board||jsonb_build_object(
      'slots',v_slots,'recorded_guesses',v_guesses,'answer_reveal',v_reveal,
      'strikes',case when v_who='LIB' then 1 else 0 end,'settled',true);
    v_engine_board:=v_engine_board||jsonb_build_object(
      'attempts',v_attempts,'revealedEntityIds',v_revealed,'submittedEntityIds',v_submitted,
      'submittedUnrecognized',case when v_who='LIB' then '["blocking"]'::jsonb else '[]'::jsonb end,
      'strikes',case when v_who='LIB' then 1 else 0 end);
    v_engine:=jsonb_set(v_engine,'{mainBoards,0}',v_engine_board,false);

    execute 'alter table private.daily_challenge_attempts disable trigger daily_challenge_attempts_immutable';
    begin
      update private.daily_challenge_attempts set
        native_score=v_score,normalized_score=v_score,
        public_result=public_result||jsonb_build_object(
          'score',v_score,'main_points',v_main,'fast_money_points',v_fast_points,
          'score_correction','2026-10-09-nfl-lib-tyler-fair-answers'),
        submission_evidence=submission_evidence||jsonb_build_object(
          'native_score',v_score,'normalized_score',v_score,
          'main_points',v_main,'fast_money_points',v_fast_points,
          'score_correction','2026-10-09-nfl-lib-tyler-fair-answers'),
        grading_evidence_snapshot=grading_evidence_snapshot||jsonb_build_object(
          'score_correction',jsonb_build_object(
            'original_score',v_old,'corrected_score',v_score,
            'reason',v_reason,'main_points',v_main,'fast_money_points',v_fast_points,
            'immutable_proof_preserved',true))
      where id=v_attempt and normalized_score=v_old;
    exception when others then
      execute 'alter table private.daily_challenge_attempts enable trigger daily_challenge_attempts_immutable';
      raise;
    end;
    execute 'alter table private.daily_challenge_attempts enable trigger daily_challenge_attempts_immutable';

    update private.daily_challenge_progress set
      public_state=v_public||jsonb_build_object(
        'main_boards',jsonb_build_array(v_board,v_public->'main_boards'->1),
        'main_points',v_main,'raw_points',v_score,'hq_score',v_score,
        'score_correction','2026-10-09-nfl-lib-tyler-fair-answers'),
      submission_state=jsonb_set(
        jsonb_set(v_submission,'{engine_state}',v_engine,false),
        '{final_submission}',(v_submission->'final_submission')||jsonb_build_object(
          'native_score',v_score,'normalized_score',v_score,
          'main_points',v_main,'fast_money_points',v_fast_points,
          'score_correction','2026-10-09-nfl-lib-tyler-fair-answers'),false)
      where daily_challenge_id=v_daily and profile_id=v_profile;
  end loop;
end
$oct9_lib_tyler_regrade$;
