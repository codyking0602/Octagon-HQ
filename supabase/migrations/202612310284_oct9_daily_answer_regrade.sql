-- October 9, 2026 Daily answer-integrity repair.
-- Keep the original MLB Blind Resume and UFC identity clue difficulty.
-- Add valid non-ranked NFL defensive answers to the *already published*
-- immutable board and reconcile the owner's recorded official runs.
-- Preserve original guess histories, ranked answers and proof strings.
-- Only the explicitly checked October 9 owner results can be amended.

do $oct9_defense_setup$
declare
  v_setup uuid;
  v_pack jsonb;
  v_evidence jsonb;
  v_board jsonb;
  v_entities jsonb;
  v_name text;
  v_id text;
begin
  select daily.setup_id into v_setup
  from private.daily_challenges daily
  join private.daily_challenge_schedule_versions schedule
    on schedule.version = daily.schedule_version
  where daily.central_day = date '2026-10-09'
    and schedule.sport = 'football'
    and daily.game_type = 'sports_feud'
  limit 1;

  if v_setup is null then return; end if;

  select private_setup_evidence into v_evidence
  from private.daily_challenge_setups where id = v_setup;
  v_pack := v_evidence->'pack';
  v_board := v_pack->'mainBoards'->0;
  v_entities := v_pack->'entities';

  if v_board->>'id' <> 'nfl-main-19-5'
    or not (v_board->'candidateIds' ? 'nfl-main-19-5:a5')
    or not (v_board->'candidateIds' ? 'nfl-main-19-5:v7') then
    raise exception 'Oct 9 NFL defensive board does not match published identity';
  end if;

  for v_id, v_name in
    select * from (values
      ('nfl-main-19-5:v8','Awareness'),
      ('nfl-main-19-5:v9','Aggressiveness')
    ) as pairs(id, name)
  loop
    if exists (
      select 1 from jsonb_array_elements(v_entities) e
      where e->>'id' = v_id and e->>'displayName' <> v_name
    ) then
      raise exception 'Oct 9 defensive off-board id collision: %', v_id;
    end if;

    if not exists (
      select 1 from jsonb_array_elements(v_entities) e
      where e->>'id' = v_id
    ) then
      v_entities := v_entities || jsonb_build_array(jsonb_build_object(
        'id',v_id,'kind','other','displayName',v_name,'aliases','[]'::jsonb
      ));
    end if;

    if not (v_board->'candidateIds' ? v_id) then
      v_board := jsonb_set(v_board,'{candidateIds}',
        v_board->'candidateIds' || to_jsonb(v_id), false);
    end if;
    if not (v_board->'alsoAcceptedEntityIds' ? v_id) then
      v_board := jsonb_set(v_board,'{alsoAcceptedEntityIds}',
        v_board->'alsoAcceptedEntityIds' || to_jsonb(v_id), false);
    end if;
  end loop;

  v_pack := jsonb_set(v_pack,'{entities}',v_entities,false);
  v_pack := jsonb_set(v_pack,'{mainBoards,0}',v_board,false);
  v_evidence := jsonb_set(v_evidence,'{pack}',v_pack,false);

  execute 'alter table private.daily_challenge_setups disable trigger daily_challenge_setups_immutable';
  begin
    update private.daily_challenge_setups
    set private_setup_evidence = v_evidence
    where id = v_setup;
  exception when others then
    execute 'alter table private.daily_challenge_setups enable trigger daily_challenge_setups_immutable';
    raise;
  end;
  execute 'alter table private.daily_challenge_setups enable trigger daily_challenge_setups_immutable';
end
$oct9_defense_setup$;

do $oct9_football_regrade$
declare
  v_profile uuid;
  v_daily uuid;
  v_attempt uuid;
  v_old_score integer;
  v_public jsonb;
  v_submission jsonb;
  v_engine jsonb;
  v_board jsonb;
  v_reveal jsonb;
  v_actions jsonb;
begin
  select id into v_profile from public.profiles
  where normalized_name = 'CODY' limit 1;
  if v_profile is null then return; end if;

  select daily.id into v_daily
  from private.daily_challenges daily
  join private.daily_challenge_schedule_versions schedule
    on schedule.version = daily.schedule_version
  where daily.central_day = date '2026-10-09'
    and schedule.sport = 'football'
    and daily.game_type = 'sports_feud'
  limit 1;
  if v_daily is null then return; end if;

  select id,normalized_score into v_attempt,v_old_score
  from private.daily_challenge_attempts
  where daily_challenge_id = v_daily
    and profile_id = v_profile
    and attempt_kind = 'official_first'
  limit 1;
  if v_attempt is null then return; end if;
  if v_old_score = 80 then return; end if;
  if v_old_score <> 75 then
    raise exception 'Oct 9 Football official score changed: %',v_old_score;
  end if;

  select public_state,submission_state
    into v_public,v_submission
  from private.daily_challenge_progress
  where daily_challenge_id = v_daily and profile_id = v_profile;
  v_engine := v_submission->'engine_state';
  v_actions := v_submission->'action_history';

  if v_public->'main_boards'->0->>'id' <> 'nfl-main-19-5'
    or (v_public->>'main_points')::integer <> 36
    or (v_public->'fast_money'->>'points')::integer <> 39
    or (v_public->'main_boards'->0->>'strikes')::integer <> 3
    or v_actions->0->>'answer' <> 'Tackling'
    or v_actions->1->>'answer' <> 'Aggresiveness'
    or v_actions->2->>'answer' <> 'Turnovers'
    or v_actions->3->>'answer' <> 'Physical'
    or v_actions->4->>'answer' <> 'Communication'
    or v_actions->5->>'answer' <> 'Awareness'
    or (v_public->'main_boards'->1->>'id') <> 'nfl-main-07-2' then
    raise exception 'Oct 9 Football owner attempt differs from audited answer sequence';
  end if;

  -- Preserve the four-slot game. In order: Tackling 7, Aggressiveness
  -- (valid off-board) 2, Turnovers 4, Physicality 5 = 18 on board one.
  -- The later Communication/Awareness entries remain in original
  -- action_history but are after the correctly completed four-slot board.
  select coalesce(jsonb_agg(
    case when item.value->'entity'->>'id' = 'nfl-main-19-5:a5'
      then item.value || jsonb_build_object('found',true)
      else item.value end order by item.ordinality),'[]'::jsonb)
  into v_reveal
  from jsonb_array_elements(v_public->'main_boards'->0->'answer_reveal')
    with ordinality as item(value,ordinality);

  v_board := (v_public->'main_boards'->0) || jsonb_build_object(
    'strikes',0,
    'settled',true,
    'slots',jsonb_build_array(
      jsonb_build_object('found',true,'entity',jsonb_build_object('id','nfl-main-19-5:a3','display_name','Tackling'),'points',7,'revealed',true,'slot_index',0),
      jsonb_build_object('found',true,'entity',jsonb_build_object('id','nfl-main-19-5:v9','display_name','Aggressiveness'),'points',2,'revealed',true,'slot_index',1),
      jsonb_build_object('found',true,'entity',jsonb_build_object('id','nfl-main-19-5:a6','display_name','Turnovers'),'points',4,'revealed',true,'slot_index',2),
      jsonb_build_object('found',true,'entity',jsonb_build_object('id','nfl-main-19-5:a5','display_name','Physicality'),'points',5,'revealed',true,'slot_index',3)
    ),
    'answer_reveal',v_reveal,
    'recorded_guesses',jsonb_build_array(
      jsonb_build_object('submitted_answer','Tackling','matched_answer','Tackling','accepted',true,'points',7),
      jsonb_build_object('submitted_answer','Aggresiveness','matched_answer','Aggressiveness','accepted',true,'points',2),
      jsonb_build_object('submitted_answer','Turnovers','matched_answer','Turnovers','accepted',true,'points',4),
      jsonb_build_object('submitted_answer','Physical','matched_answer','Physicality','accepted',true,'points',5)
    )
  );

  v_engine := jsonb_set(v_engine,'{mainBoards,0}',
    (v_engine->'mainBoards'->0) || jsonb_build_object(
      'strikes',0,
      'revealedEntityIds','["nfl-main-19-5:a3","nfl-main-19-5:v9","nfl-main-19-5:a6","nfl-main-19-5:a5"]'::jsonb,
      'submittedEntityIds','["nfl-main-19-5:a3","nfl-main-19-5:v9","nfl-main-19-5:a6","nfl-main-19-5:a5"]'::jsonb,
      'submittedUnrecognized','[]'::jsonb,
      'attempts',jsonb_build_array(
        jsonb_build_object('submittedText','Tackling','entityId','nfl-main-19-5:a3','points',7,'status','accepted'),
        jsonb_build_object('submittedText','Aggresiveness','entityId','nfl-main-19-5:v9','points',2,'status','accepted'),
        jsonb_build_object('submittedText','Turnovers','entityId','nfl-main-19-5:a6','points',4,'status','accepted'),
        jsonb_build_object('submittedText','Physical','entityId','nfl-main-19-5:a5','points',5,'status','accepted')
      )
    ),false);

  execute 'alter table private.daily_challenge_attempts disable trigger daily_challenge_attempts_immutable';
  begin
    update private.daily_challenge_attempts
    set native_score = 80,
        normalized_score = 80,
        public_result = public_result || jsonb_build_object(
          'score',80,'main_points',41,'fast_money_points',39,
          'score_correction','2026-10-09-nfl-defensive-fair-answers'
        ),
        submission_evidence = submission_evidence || jsonb_build_object(
          'native_score',80,'normalized_score',80,'main_points',41,
          'score_correction','2026-10-09-nfl-defensive-fair-answers'
        ),
        grading_evidence_snapshot = grading_evidence_snapshot || jsonb_build_object(
          'score_correction',jsonb_build_object(
            'original_score',75,'corrected_score',80,
            'reason','Aggresiveness and Physical are valid defensive answers; four-slot ordered replay',
            'board_one_points',18,'board_two_points',23,'fast_money_points',39
          )
        )
    where id=v_attempt and normalized_score=75;
  exception when others then
    execute 'alter table private.daily_challenge_attempts enable trigger daily_challenge_attempts_immutable';
    raise;
  end;
  execute 'alter table private.daily_challenge_attempts enable trigger daily_challenge_attempts_immutable';

  update private.daily_challenge_progress
  set public_state = v_public || jsonb_build_object(
      'main_boards',jsonb_build_array(v_board,v_public->'main_boards'->1),
      'main_points',41,'raw_points',80,'hq_score',80,
      'score_correction','2026-10-09-nfl-defensive-fair-answers'
    ),
    submission_state = jsonb_set(
      jsonb_set(v_submission,'{engine_state}',v_engine,false),
      '{final_submission}',
      (v_submission->'final_submission') || jsonb_build_object(
        'main_points',41,'fast_money_points',39,
        'native_score',80,'normalized_score',80,
        'score_correction','2026-10-09-nfl-defensive-fair-answers'
      ),false
    )
  where daily_challenge_id=v_daily and profile_id=v_profile;
end
$oct9_football_regrade$;

do $oct9_ufc_answer_repair$
declare
  v_profile uuid;
  v_daily uuid;
  v_attempt uuid;
  v_old_score integer;
  v_public jsonb;
  v_submission jsonb;
  v_resolved jsonb;
begin
  select id into v_profile from public.profiles
  where normalized_name='CODY' limit 1;
  if v_profile is null then return; end if;

  select daily.id into v_daily
  from private.daily_challenges daily
  join private.daily_challenge_schedule_versions schedule
    on schedule.version = daily.schedule_version
  where daily.central_day=date '2026-10-09'
    and schedule.sport='ufc'
    and daily.game_type='average_fan'
  limit 1;
  if v_daily is null then return; end if;

  select id,normalized_score into v_attempt,v_old_score
  from private.daily_challenge_attempts
  where daily_challenge_id=v_daily
    and profile_id=v_profile
    and attempt_kind='official_first'
  limit 1;
  if v_attempt is null then return; end if;
  if v_old_score<>74 then
    raise exception 'Oct 9 UFC official score unexpectedly changed: %',v_old_score;
  end if;

  select public_state,submission_state into v_public,v_submission
  from private.daily_challenge_progress
  where daily_challenge_id=v_daily and profile_id=v_profile;

  if v_public->>'answer_review'='2026-10-09-round-ordinal' then return; end if;
  v_resolved:=v_public->'resolved';
  if jsonb_array_length(v_resolved)<>8
    or v_resolved->5->'question'->>'id' <> 'average-fan:ufc:authored-history:edwards-usman-round:short'
    or v_resolved->5->>'player_answer' <> '5th'
    or v_resolved->5->>'fan_answer' <> 'Round 5'
    or v_resolved->5->>'saved' <> 'true'
    or v_resolved->7->>'player_answer' <> 'Max Holloway'
    or v_resolved->7->>'fan_answer' <> 'Max Holloway'
    or (v_public->>'board_score')::integer <> 84
    or v_public->>'final_outcome' <> 'wrong' then
    raise exception 'Oct 9 UFC ordinal correction source answers have changed';
  end if;

  -- The original Save was needlessly consumed by correct "5th".
  -- The Save becomes available for question 8, but the classmate ALSO
  -- missed question 8. Therefore the canonical score stays 84 - 10 = 74.
  v_resolved:=jsonb_set(v_resolved,'{5}',
    v_resolved->5 || jsonb_build_object(
      'correct',true,'saved',false,'save_consumed',false
    ),false);
  v_resolved:=jsonb_set(v_resolved,'{7}',
    v_resolved->7 || jsonb_build_object('save_consumed',true),false);

  execute 'alter table private.daily_challenge_attempts disable trigger daily_challenge_attempts_immutable';
  begin
    update private.daily_challenge_attempts
    set public_result=public_result || jsonb_build_object(
          'saves',0,'answer_review','2026-10-09-round-ordinal'
        ),
        submission_evidence=submission_evidence || jsonb_build_object(
          'saves',0,'answer_review','2026-10-09-round-ordinal'
        ),
        grading_evidence_snapshot=grading_evidence_snapshot || jsonb_build_object(
          'answer_review',jsonb_build_object(
            'reason','5th is Round 5; classmate Save does not change final score due to later shared miss',
            'original_score',74,'corrected_score',74,
            'corrected_question',6,'later_unsaved_miss',8
          )
        )
    where id=v_attempt and normalized_score=74;
  exception when others then
    execute 'alter table private.daily_challenge_attempts enable trigger daily_challenge_attempts_immutable';
    raise;
  end;
  execute 'alter table private.daily_challenge_attempts enable trigger daily_challenge_attempts_immutable';

  update private.daily_challenge_progress
  set public_state=v_public || jsonb_build_object(
      'resolved',v_resolved,'save_used',true,
      'answer_review','2026-10-09-round-ordinal'
    ),
      submission_state=jsonb_set(
        v_submission,'{final_submission}',
        (v_submission->'final_submission') || jsonb_build_object(
          'saves',0,'answer_review','2026-10-09-round-ordinal'
        ),false
      )
  where daily_challenge_id=v_daily and profile_id=v_profile;
end
$oct9_ufc_answer_repair$;
