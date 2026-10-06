-- Re-rank the UFC Sports Feud "defines an era" board around era impact,
-- add Royce Gracie as the top answer, and repair Cody's Oct. 6 run.
-- Existing entity IDs are preserved where possible so completed result evidence
-- remains readable; Royce is added as v12 for the already-published setup.

do $oct6_ufc_era_setup$
declare
  v_setup uuid;
  v_evidence jsonb;
  v_pack jsonb;
  v_entities jsonb;
  v_board jsonb;
  v_board_index integer;
  v_reveal jsonb;
  v_reveal_index integer;
  v_old_proof text;
  v_new_proof text;
begin
  select setup.id, setup.private_setup_evidence, setup.reveal_setup
  into v_setup, v_evidence, v_reveal
  from private.daily_challenges daily
  join private.daily_challenge_schedule_versions schedule
    on schedule.version = daily.schedule_version
  join private.daily_challenge_setups setup
    on setup.id = daily.setup_id
  where daily.central_day = date '2026-10-06'
    and schedule.sport = 'ufc'
    and daily.game_type = 'sports_feud'
  limit 1;

  if v_setup is null then
    return;
  end if;

  v_pack := v_evidence->'pack';
  v_entities := v_pack->'entities';

  select (board.ordinality - 1)::integer
  into v_board_index
  from jsonb_array_elements(v_pack->'mainBoards') with ordinality board(value, ordinality)
  where board.value->>'id' = 'ufc-main-01-2'
  limit 1;

  if v_board_index is null then
    raise exception 'Oct. 6 UFC era board is missing';
  end if;

  if not exists (
    select 1
    from jsonb_array_elements(v_entities) entity
    where entity->>'id' = 'ufc-main-01-2:v12'
  ) then
    v_entities := v_entities || jsonb_build_array(
      jsonb_build_object(
        'id', 'ufc-main-01-2:v12',
        'kind', 'person',
        'aliases', '[]'::jsonb,
        'displayName', 'Royce Gracie'
      )
    );
  end if;

  v_board := v_pack->'mainBoards'->v_board_index;
  v_board := jsonb_set(
    v_board,
    '{answers}',
    jsonb_build_array(
      jsonb_build_object('points',10,'entityId','ufc-main-01-2:v12'),
      jsonb_build_object('points',8,'entityId','ufc-main-01-2:a8'),
      jsonb_build_object('points',7,'entityId','ufc-main-01-2:a2'),
      jsonb_build_object('points',5,'entityId','ufc-main-01-2:a1'),
      jsonb_build_object('points',5,'entityId','ufc-main-01-2:a3'),
      jsonb_build_object('points',4,'entityId','ufc-main-01-2:v8'),
      jsonb_build_object('points',4,'entityId','ufc-main-01-2:a6'),
      jsonb_build_object('points',3,'entityId','ufc-main-01-2:a7')
    ),
    false
  );
  v_board := jsonb_set(
    v_board,
    '{candidateIds}',
    jsonb_build_array(
      'ufc-main-01-2:v12',
      'ufc-main-01-2:a8',
      'ufc-main-01-2:a2',
      'ufc-main-01-2:a1',
      'ufc-main-01-2:a3',
      'ufc-main-01-2:v8',
      'ufc-main-01-2:a6',
      'ufc-main-01-2:a7',
      'ufc-main-01-2:a4',
      'ufc-main-01-2:a5',
      'ufc-main-01-2:v1',
      'ufc-main-01-2:v2',
      'ufc-main-01-2:v3',
      'ufc-main-01-2:v4',
      'ufc-main-01-2:v5',
      'ufc-main-01-2:v6',
      'ufc-main-01-2:v7',
      'ufc-main-01-2:v9',
      'ufc-main-01-2:v10',
      'ufc-main-01-2:v11'
    ),
    false
  );
  v_board := jsonb_set(
    v_board,
    '{alsoAcceptedEntityIds}',
    jsonb_build_array(
      'ufc-main-01-2:a4',
      'ufc-main-01-2:a5',
      'ufc-main-01-2:v1',
      'ufc-main-01-2:v2',
      'ufc-main-01-2:v3',
      'ufc-main-01-2:v4',
      'ufc-main-01-2:v5',
      'ufc-main-01-2:v6',
      'ufc-main-01-2:v7',
      'ufc-main-01-2:v9',
      'ufc-main-01-2:v10',
      'ufc-main-01-2:v11'
    ),
    false
  );

  v_pack := jsonb_set(v_pack, '{entities}', v_entities, false);
  v_pack := jsonb_set(v_pack, array['mainBoards',v_board_index::text], v_board, false);
  v_evidence := jsonb_set(v_evidence, '{pack}', v_pack, false);

  v_old_proof := 'ufc-main-01-2:ufc-main-01-2:a1=10,ufc-main-01-2:a2=8,ufc-main-01-2:a3=7,ufc-main-01-2:a4=5,ufc-main-01-2:a5=5,ufc-main-01-2:a6=4,ufc-main-01-2:a7=4,ufc-main-01-2:a8=3';
  v_new_proof := 'ufc-main-01-2:ufc-main-01-2:v12=10,ufc-main-01-2:a8=8,ufc-main-01-2:a2=7,ufc-main-01-2:a1=5,ufc-main-01-2:a3=5,ufc-main-01-2:v8=4,ufc-main-01-2:a6=4,ufc-main-01-2:a7=3';
  if position(v_old_proof in coalesce(v_evidence->>'proof','')) = 0 then
    raise exception 'Oct. 6 UFC era proof changed before repair';
  end if;
  v_evidence := jsonb_set(
    v_evidence,
    '{proof}',
    to_jsonb(replace(v_evidence->>'proof', v_old_proof, v_new_proof)),
    false
  );

  select (board.ordinality - 1)::integer
  into v_reveal_index
  from jsonb_array_elements(v_reveal->'main_boards') with ordinality board(value, ordinality)
  where board.value->>'id' = 'ufc-main-01-2'
  limit 1;

  if v_reveal_index is null then
    raise exception 'Oct. 6 UFC era reveal board is missing';
  end if;

  v_reveal := jsonb_set(
    v_reveal,
    array['main_boards',v_reveal_index::text,'accepted_answers'],
    jsonb_build_array(
      jsonb_build_object('rank',1,'entity',jsonb_build_object('id','ufc-main-01-2:v12','display_name','Royce Gracie'),'points',10),
      jsonb_build_object('rank',2,'entity',jsonb_build_object('id','ufc-main-01-2:a8','display_name','Conor McGregor'),'points',8),
      jsonb_build_object('rank',3,'entity',jsonb_build_object('id','ufc-main-01-2:a2','display_name','Georges St-Pierre'),'points',7),
      jsonb_build_object('rank',4,'entity',jsonb_build_object('id','ufc-main-01-2:a1','display_name','Anderson Silva'),'points',5),
      jsonb_build_object('rank',5,'entity',jsonb_build_object('id','ufc-main-01-2:a3','display_name','Jon Jones'),'points',5),
      jsonb_build_object('rank',6,'entity',jsonb_build_object('id','ufc-main-01-2:v8','display_name','Chuck Liddell'),'points',4),
      jsonb_build_object('rank',7,'entity',jsonb_build_object('id','ufc-main-01-2:a6','display_name','Ronda Rousey'),'points',4),
      jsonb_build_object('rank',8,'entity',jsonb_build_object('id','ufc-main-01-2:a7','display_name','Khabib Nurmagomedov'),'points',3)
    ),
    false
  );

  execute 'alter table private.daily_challenge_setups disable trigger daily_challenge_setups_immutable';
  begin
    update private.daily_challenge_setups
    set private_setup_evidence = v_evidence,
        reveal_setup = v_reveal
    where id = v_setup;
  exception when others then
    execute 'alter table private.daily_challenge_setups enable trigger daily_challenge_setups_immutable';
    raise;
  end;
  execute 'alter table private.daily_challenge_setups enable trigger daily_challenge_setups_immutable';
end
$oct6_ufc_era_setup$;

do $oct6_cody_ufc_feud$
declare
  v_profile uuid;
  v_daily uuid;
  v_attempt uuid;
  v_score integer;
  v_state jsonb;
  v_submission jsonb;
  v_first_board jsonb;
  v_second_board jsonb;
  v_engine jsonb;
begin
  select id into v_profile
  from public.profiles
  where normalized_name = 'CODY'
  limit 1;

  if v_profile is null then
    return;
  end if;

  select daily.id into v_daily
  from private.daily_challenges daily
  join private.daily_challenge_schedule_versions schedule
    on schedule.version = daily.schedule_version
  where daily.central_day = date '2026-10-06'
    and schedule.sport = 'ufc'
    and daily.game_type = 'sports_feud'
  limit 1;

  if v_daily is null then
    return;
  end if;

  select attempt.id, attempt.normalized_score
  into v_attempt, v_score
  from private.daily_challenge_attempts attempt
  where attempt.daily_challenge_id = v_daily
    and attempt.profile_id = v_profile
    and attempt.attempt_kind = 'official_first'
  limit 1;

  if v_attempt is null then
    return;
  end if;

  if v_score not in (81,86) then
    raise exception 'Oct. 6 Cody UFC Sports Feud score changed before correction: %', v_score;
  end if;

  if v_score = 86 then
    return;
  end if;

  select progress.public_state, progress.submission_state->'engine_state'
  into v_state, v_engine
  from private.daily_challenge_progress progress
  where progress.daily_challenge_id = v_daily
    and progress.profile_id = v_profile;

  if v_state is null
    or v_state->'main_boards'->0->>'id' <> 'ufc-main-01-2'
    or v_state->'main_boards'->0->>'strikes' <> '2'
    or v_engine->'mainBoards'->0->'submittedUnrecognized' <> jsonb_build_array('royce gracie','gracie')
    or v_state->'main_boards'->1->>'id' <> 'ufc-main-08-4'
    or (v_state->'main_boards'->1->>'strikes')::integer <> 0
    or (v_state->'fast_money'->>'points')::integer <> 30
  then
    raise exception 'Oct. 6 Cody UFC Sports Feud correction evidence changed';
  end if;

  v_first_board := (v_state->'main_boards'->0)
    || jsonb_build_object(
      'strikes',0,
      'settled',true,
      'slots',jsonb_build_array(
        jsonb_build_object(
          'found',true,
          'entity',jsonb_build_object('id','ufc-main-01-2:a8','display_name','Conor McGregor'),
          'points',8,
          'revealed',true,
          'slot_index',0
        ),
        jsonb_build_object(
          'found',true,
          'entity',jsonb_build_object('id','ufc-main-01-2:v12','display_name','Royce Gracie'),
          'points',10,
          'revealed',true,
          'slot_index',1
        ),
        jsonb_build_object(
          'found',true,
          'entity',jsonb_build_object('id','ufc-main-01-2:a3','display_name','Jon Jones'),
          'points',5,
          'revealed',true,
          'slot_index',2
        ),
        jsonb_build_object(
          'found',true,
          'entity',jsonb_build_object('id','ufc-main-01-2:v8','display_name','Chuck Liddell'),
          'points',4,
          'revealed',true,
          'slot_index',3
        )
      ),
      'answer_reveal',jsonb_build_array(
        jsonb_build_object('found',true,'entity',jsonb_build_object('id','ufc-main-01-2:v12','display_name','Royce Gracie'),'points',10),
        jsonb_build_object('found',true,'entity',jsonb_build_object('id','ufc-main-01-2:a8','display_name','Conor McGregor'),'points',8),
        jsonb_build_object('found',false,'entity',jsonb_build_object('id','ufc-main-01-2:a2','display_name','Georges St-Pierre'),'points',7),
        jsonb_build_object('found',false,'entity',jsonb_build_object('id','ufc-main-01-2:a1','display_name','Anderson Silva'),'points',5),
        jsonb_build_object('found',true,'entity',jsonb_build_object('id','ufc-main-01-2:a3','display_name','Jon Jones'),'points',5),
        jsonb_build_object('found',true,'entity',jsonb_build_object('id','ufc-main-01-2:v8','display_name','Chuck Liddell'),'points',4),
        jsonb_build_object('found',false,'entity',jsonb_build_object('id','ufc-main-01-2:a6','display_name','Ronda Rousey'),'points',4),
        jsonb_build_object('found',false,'entity',jsonb_build_object('id','ufc-main-01-2:a7','display_name','Khabib Nurmagomedov'),'points',3)
      )
    );

  v_second_board := v_state->'main_boards'->1;

  v_submission := jsonb_build_object(
    'main_points',56,
    'fast_money_points',30,
    'native_score',86,
    'normalized_score',86
  );

  execute 'alter table private.daily_challenge_attempts disable trigger daily_challenge_attempts_immutable';
  begin
    update private.daily_challenge_attempts
    set native_score = 86,
        normalized_score = 86,
        public_result = public_result
          || jsonb_build_object(
            'score',86,
            'main_points',56,
            'fast_money_points',30,
            'score_correction','2026-10-06-ufc-era-gracie-repair'
          ),
        submission_evidence = submission_evidence
          || v_submission
          || jsonb_build_object(
            'score_correction','2026-10-06-ufc-era-gracie-repair'
          ),
        grading_evidence_snapshot = grading_evidence_snapshot
          || jsonb_build_object(
            'score_correction',
            jsonb_build_object(
              'reason','Royce Gracie is the top era-defining answer; duplicate Gracie is not a strike',
              'original_score',81,
              'corrected_score',86,
              'corrected_main_points',56,
              'fast_money_points',30,
              'royce_gracie_points',10,
              'conor_mcgregor_points',8,
              'jon_jones_points',5,
              'chuck_liddell_points',4,
              'corrected_first_board_points',27,
              'corrected_first_board_strikes',0
            )
          )
    where id = v_attempt
      and normalized_score = 81;
  exception when others then
    execute 'alter table private.daily_challenge_attempts enable trigger daily_challenge_attempts_immutable';
    raise;
  end;
  execute 'alter table private.daily_challenge_attempts enable trigger daily_challenge_attempts_immutable';

  v_engine := jsonb_set(
    v_engine,
    '{mainBoards,0}',
    (v_engine->'mainBoards'->0)
      || jsonb_build_object(
        'strikes',0,
        'revealedEntityIds',jsonb_build_array(
          'ufc-main-01-2:a8',
          'ufc-main-01-2:v12',
          'ufc-main-01-2:a3',
          'ufc-main-01-2:v8'
        ),
        'submittedEntityIds',jsonb_build_array(
          'ufc-main-01-2:a8',
          'ufc-main-01-2:v12',
          'ufc-main-01-2:a3',
          'ufc-main-01-2:v8'
        ),
        'submittedUnrecognized','[]'::jsonb
      ),
    false
  );

  update private.daily_challenge_progress
  set public_state = v_state
      || jsonb_build_object(
        'hq_score',86,
        'raw_points',86,
        'main_points',56,
        'main_boards',jsonb_build_array(v_first_board,v_second_board),
        'score_correction','2026-10-06-ufc-era-gracie-repair'
      ),
      submission_state = jsonb_set(
        jsonb_set(
          submission_state,
          '{engine_state}',
          v_engine,
          false
        ),
        '{final_submission}',
        coalesce(submission_state->'final_submission','{}'::jsonb)
          || v_submission
          || jsonb_build_object(
            'score_correction','2026-10-06-ufc-era-gracie-repair'
          ),
        true
      )
  where daily_challenge_id = v_daily
    and profile_id = v_profile;

  update private.daily_challenge_history
  set native_score = 86,
      normalized_score = 86,
      public_result = public_result
        || jsonb_build_object(
          'score',86,
          'main_points',56,
          'fast_money_points',30,
          'score_correction','2026-10-06-ufc-era-gracie-repair'
        )
  where daily_challenge_id = v_daily
    and profile_id = v_profile
    and normalized_score = 81;
end
$oct6_cody_ufc_feud$;
