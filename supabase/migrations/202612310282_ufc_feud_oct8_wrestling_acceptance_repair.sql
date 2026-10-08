-- UFC Sports Feud Oct. 8: accept legitimate wrestlers on the published
-- main board without changing ranked answers or the immutable scoring scale.
-- Historical Cody run earned four accepted slots and 88 total points already.
-- Original attempt/evidence remains untouched: do not invent answer ordering.
do $repair_oct8_ufc_wrestling$
declare
  v_daily uuid;
  v_setup uuid;
  v_cody uuid;
  v_pack jsonb;
  v_evidence jsonb;
  v_board jsonb;
  v_entities jsonb;
  v_name text;
  v_id text;
  v_code text;
  v_state jsonb;
  v_engine jsonb;
  v_first jsonb;
  v_points integer;
begin
  select daily.id, daily.setup_id
    into v_daily, v_setup
  from private.daily_challenges daily
  join private.daily_challenge_schedule_versions schedule
    on schedule.version = daily.schedule_version
  where daily.central_day = date '2026-10-08'
    and daily.game_type = 'sports_feud'
    and schedule.sport = 'ufc'
  limit 1;

  if v_daily is null then return; end if;

  select private_setup_evidence into v_evidence
  from private.daily_challenge_setups where id = v_setup;
  v_pack := v_evidence->'pack';
  if v_pack->'mainBoards'->0->>'id' <> 'ufc-main-04-1' then
    raise exception 'Unexpected Oct. 8 wrestling board; do not apply repair';
  end if;
  v_board := v_pack->'mainBoards'->0;
  v_entities := v_pack->'entities';

  for v_id, v_name in
    select * from (values
      ('ufc-main-04-1:v7','Khamzat Chimaev'),
      ('ufc-main-04-1:v8','Arman Tsarukyan'),
      ('ufc-main-04-1:v9','Belal Muhammad'),
      ('ufc-main-04-1:v10','Colby Covington'),
      ('ufc-main-04-1:v11','Bo Nickal'),
      ('ufc-main-04-1:v12','Sean Brady')
    ) as additions(id, name)
  loop
    if not exists (
      select 1 from jsonb_array_elements(v_entities) as entity
      where entity->>'id' = v_id
    ) then
      v_entities := v_entities || jsonb_build_array(jsonb_build_object(
        'id', v_id, 'kind','person', 'displayName',v_name, 'aliases','[]'::jsonb
      ));
      v_board := jsonb_set(v_board,'{candidateIds}',
        v_board->'candidateIds' || jsonb_build_array(v_id),false);
      v_board := jsonb_set(v_board,'{alsoAcceptedEntityIds}',
        v_board->'alsoAcceptedEntityIds' || jsonb_build_array(v_id),false);
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

  select id into v_cody from public.profiles
  where normalized_name = 'CODY' limit 1;
  if v_cody is null then return; end if;

  select normalized_score into v_points
  from private.daily_challenge_attempts
  where daily_challenge_id = v_daily and profile_id = v_cody
    and attempt_kind = 'official_first'
  limit 1;
  if v_points is null then return; end if;
  if v_points <> 88 then
    raise exception 'Cody Oct. 8 UFC Feud official result moved: %', v_points;
  end if;

  select public_state, submission_state->'engine_state'
    into v_state, v_engine
  from private.daily_challenge_progress
  where daily_challenge_id = v_daily and profile_id = v_cody;

  if v_state->>'answer_review' = '2026-10-08-khamzat' then return; end if;
  if v_state->'main_boards'->0->>'id' <> 'ufc-main-04-1'
    or (v_state->'main_boards'->0->>'strikes')::integer <> 1
    or (v_state->>'main_points')::integer <> 58
    or (v_state->'fast_money'->>'points')::integer <> 30
    or v_engine->'mainBoards'->0->'submittedUnrecognized'
       <> '["khamzat chimaev"]'::jsonb
    or jsonb_array_length(v_engine->'mainBoards'->0->'revealedEntityIds') <> 4
  then
    raise exception 'Cody Oct. 8 UFC Feud evidence moved; do not guess';
  end if;

  -- The four recorded scoring slots remain unchanged, because the historical
  -- strike's placement relative to those slots was not persisted. Removing
  -- the erroneous strike cannot justify fabricating a fifth scoring slot.
  v_first := v_state->'main_boards'->0
    || jsonb_build_object(
      'strikes',0,
      'reviewed_guesses',jsonb_build_array(jsonb_build_object(
        'submitted_answer','Khamzat Chimaev',
        'matched_answer','Khamzat Chimaev',
        'accepted',true,
        'points',0,
        'reviewed',true
      ))
    );
  v_state := jsonb_set(v_state,'{main_boards,0}',v_first,false);
  v_state := v_state || jsonb_build_object('answer_review','2026-10-08-khamzat');

  v_engine := jsonb_set(v_engine,'{mainBoards,0}',
    v_engine->'mainBoards'->0 || jsonb_build_object(
      'strikes',0,
      'submittedUnrecognized','[]'::jsonb,
      'reviewedRecognized',jsonb_build_array('khamzat chimaev')
    ),false);

  update private.daily_challenge_progress
  set public_state = v_state,
      submission_state = jsonb_set(submission_state,'{engine_state}',v_engine,false)
  where daily_challenge_id = v_daily and profile_id = v_cody;
end
$repair_oct8_ufc_wrestling$;
