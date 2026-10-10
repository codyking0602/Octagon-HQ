-- One-day UFC Sports Feud content correction; preserve Fast Money and other sports.
-- Guard immutable publication and owner-only reset; fail closed if anyone else finished.
begin;
select set_config('octagon.daily_two_game_cutover', 'on', true);
do $repair$
declare
  v_challenge uuid;
  v_setup private.daily_challenge_setups%rowtype;
  v_owner uuid;
  v_count integer;
  v_public jsonb;
  v_reveal jsonb;
  v_private jsonb;
  v_pack jsonb;
  v_grade jsonb;
  v_entities jsonb;
  v_proof text;
  v_old_pack text := 'sports-feud-bank-v1-ufc-2026-10-10-ufc-main-06-5-ufc-main-14-2';
  v_new_pack text := 'sports-feud-bank-v1-ufc-2026-10-10-ufc-main-06-5-ufc-main-19-1';
  v_old_sig text := 'ufc-main-14-2:ufc-main-14-2:a1=10,ufc-main-14-2:a2=8,ufc-main-14-2:a3=7,ufc-main-14-2:a4=5,ufc-main-14-2:a5=5,ufc-main-14-2:a6=4,ufc-main-14-2:a7=4,ufc-main-14-2:a8=3';
  v_new_sig text := 'ufc-main-19-1:ufc-main-19-1:a1=10,ufc-main-19-1:a2=8,ufc-main-19-1:a3=7,ufc-main-19-1:a4=5,ufc-main-19-1:a5=5,ufc-main-19-1:a6=4,ufc-main-19-1:a7=4,ufc-main-19-1:a8=3';
begin
  select d.id, s.* into v_challenge, v_setup
    from private.daily_challenges d
    join private.daily_challenge_schedule_versions schedule
      on schedule.version = d.schedule_version
    join private.daily_challenge_setups s on s.id = d.setup_id
    where schedule.sport = 'ufc'
      and d.central_day = date '2026-10-10'
      and d.game_type = 'sports_feud'
    order by d.published_at desc limit 1;
  if v_challenge is null then raise exception 'Oct 10 UFC Sports Feud publication missing'; end if;
  if v_setup.public_setup->>'pack_id' = v_new_pack then return; end if;
  if v_setup.public_setup->>'pack_id' is distinct from v_old_pack
     or v_setup.public_setup#>>'{main_boards,0,id}' <> 'ufc-main-06-5'
     or v_setup.public_setup#>>'{main_boards,1,id}' <> 'ufc-main-14-2'
  then raise exception 'Unexpected original UFC Sports Feud pack; refused repair'; end if;
  if v_setup.private_grading_evidence->>'proof' not like '%' || v_old_sig || '%'
  then raise exception 'Original UFC Feud proof does not match'; end if;
  select p.id into strict v_owner from public.profiles p
    where upper(p.display_name) = 'CODY'
      and exists(select 1 from private.daily_challenge_attempts a
         where a.profile_id=p.id and a.daily_challenge_id=v_challenge);
  select count(*) into v_count from private.daily_challenge_attempts
    where daily_challenge_id=v_challenge and profile_id<>v_owner;
  if v_count<>0 then raise exception 'Other players completed Oct 10 UFC; require fair multi-user migration'; end if;
  v_proof := replace(replace(v_setup.private_grading_evidence->>'proof',
     v_old_pack, v_new_pack), v_old_sig, v_new_sig);
  if v_proof = v_setup.private_grading_evidence->>'proof' or v_proof like '%ufc-main-14-2%'
  then raise exception 'UFC proof replacement incomplete'; end if;

  v_public := v_setup.public_setup;
  v_public := jsonb_set(v_public, '{pack_id}', to_jsonb(v_new_pack));
  v_public := jsonb_set(v_public, '{main_boards,1}', '{"id":"ufc-main-19-1","prompt":"Name a technique you might see finish a UFC fight."}'::jsonb);
  v_public := jsonb_set(v_public, '{initial_state,main_boards,1,id}', to_jsonb('ufc-main-19-1'::text));
  v_public := jsonb_set(v_public, '{initial_state,main_boards,1,prompt}', to_jsonb('Name a technique you might see finish a UFC fight.'::text));
  v_reveal := jsonb_set(v_setup.reveal_setup, '{main_boards,1}', '{"id":"ufc-main-19-1","accepted_answers":[{"rank":1,"entity":{"id":"ufc-main-19-1:a1","display_name":"Rear-naked choke"},"points":10},{"rank":2,"entity":{"id":"ufc-main-19-1:a2","display_name":"Guillotine"},"points":8},{"rank":3,"entity":{"id":"ufc-main-19-1:a3","display_name":"Armbar"},"points":7},{"rank":4,"entity":{"id":"ufc-main-19-1:a4","display_name":"Head kick"},"points":5},{"rank":5,"entity":{"id":"ufc-main-19-1:a5","display_name":"Ground-and-pound"},"points":5},{"rank":6,"entity":{"id":"ufc-main-19-1:a6","display_name":"Triangle choke"},"points":4},{"rank":7,"entity":{"id":"ufc-main-19-1:a7","display_name":"Knee"},"points":4},{"rank":8,"entity":{"id":"ufc-main-19-1:a8","display_name":"Elbow"},"points":3}]}'::jsonb);
  v_pack := v_setup.private_setup_evidence->'pack';
  v_pack := jsonb_set(v_pack, '{id}', to_jsonb(v_new_pack));
  v_pack := jsonb_set(v_pack, '{mainBoards,0,candidateIds}',
    v_pack#>'{mainBoards,0,candidateIds}' || '["ufc-main-06-5:v7","ufc-main-06-5:v8"]'::jsonb);
  v_pack := jsonb_set(v_pack, '{mainBoards,0,alsoAcceptedEntityIds}',
    v_pack#>'{mainBoards,0,alsoAcceptedEntityIds}' || '["ufc-main-06-5:v7","ufc-main-06-5:v8"]'::jsonb);
  v_pack := jsonb_set(v_pack, '{mainBoards,1}', '{"id":"ufc-main-19-1","prompt":"Name a technique you might see finish a UFC fight.","candidateIds":["ufc-main-19-1:a1","ufc-main-19-1:a2","ufc-main-19-1:a3","ufc-main-19-1:a4","ufc-main-19-1:a5","ufc-main-19-1:a6","ufc-main-19-1:a7","ufc-main-19-1:a8","ufc-main-19-1:v1","ufc-main-19-1:v2","ufc-main-19-1:v3","ufc-main-19-1:v4","ufc-main-19-1:v5","ufc-main-19-1:v6"],"answers":[{"entityId":"ufc-main-19-1:a1","points":10},{"entityId":"ufc-main-19-1:a2","points":8},{"entityId":"ufc-main-19-1:a3","points":7},{"entityId":"ufc-main-19-1:a4","points":5},{"entityId":"ufc-main-19-1:a5","points":5},{"entityId":"ufc-main-19-1:a6","points":4},{"entityId":"ufc-main-19-1:a7","points":4},{"entityId":"ufc-main-19-1:a8","points":3}],"alsoAcceptedEntityIds":["ufc-main-19-1:v1","ufc-main-19-1:v2","ufc-main-19-1:v3","ufc-main-19-1:v4","ufc-main-19-1:v5","ufc-main-19-1:v6"]}'::jsonb);
  select coalesce(jsonb_agg(item.value), '[]'::jsonb) into v_entities
  from jsonb_array_elements(v_pack->'entities') as item(value)
  where item.value->>'id' not like 'ufc-main-14-2:%';
  v_pack := jsonb_set(v_pack, '{entities}', v_entities || '[{"id":"ufc-main-19-1:a1","kind":"other","displayName":"Rear-naked choke","aliases":["RNC","Rear naked choke"]},{"id":"ufc-main-19-1:a2","kind":"other","displayName":"Guillotine","aliases":["Guillotine choke"]},{"id":"ufc-main-19-1:a3","kind":"other","displayName":"Armbar","aliases":["Arm bar"]},{"id":"ufc-main-19-1:a4","kind":"other","displayName":"Head kick","aliases":["High kick"]},{"id":"ufc-main-19-1:a5","kind":"other","displayName":"Ground-and-pound","aliases":["GNP","Ground and pound","Ground pound"]},{"id":"ufc-main-19-1:a6","kind":"other","displayName":"Triangle choke","aliases":["Triangle"]},{"id":"ufc-main-19-1:a7","kind":"other","displayName":"Knee","aliases":["Knee strike"]},{"id":"ufc-main-19-1:a8","kind":"other","displayName":"Elbow","aliases":["Elbow strike"]},{"id":"ufc-main-19-1:v1","kind":"other","displayName":"Left hook","aliases":["Hook"]},{"id":"ufc-main-19-1:v2","kind":"other","displayName":"Body shot","aliases":["Body punch","Shot to body"]},{"id":"ufc-main-19-1:v3","kind":"other","displayName":"Arm-triangle choke","aliases":["Arm triangle"]},{"id":"ufc-main-19-1:v4","kind":"other","displayName":"Kimura","aliases":[]},{"id":"ufc-main-19-1:v5","kind":"other","displayName":"Uppercut","aliases":["Upper cut"]},{"id":"ufc-main-19-1:v6","kind":"other","displayName":"Heel hook","aliases":["Heelhook"]},{"id":"ufc-main-06-5:v7","kind":"person","displayName":"Jon Jones","aliases":["Bones","Jon"]},{"id":"ufc-main-06-5:v8","kind":"person","displayName":"Brock Lesnar","aliases":["Brock"]}]'::jsonb);
  v_private := jsonb_set(v_setup.private_setup_evidence, '{pack}', v_pack);
  v_private := jsonb_set(v_private, '{proof}', to_jsonb(v_proof));
  v_grade := jsonb_set(v_setup.private_grading_evidence, '{proof}', to_jsonb(v_proof));

  update private.daily_challenge_setups
    set setup_key = replace(v_setup.setup_key, v_old_pack, v_new_pack),
      public_setup = v_public, reveal_setup = v_reveal,
      private_setup_evidence = v_private, private_grading_evidence = v_grade
    where id = v_setup.id and setup_key = v_setup.setup_key;
  get diagnostics v_count = row_count;
  if v_count <> 1 then raise exception 'UFC Feud setup changed concurrently'; end if;

  -- Owner requested a fresh playthrough. Other users' history is never reset.
  delete from private.daily_challenge_progress
    where daily_challenge_id=v_challenge and profile_id=v_owner;
  delete from private.daily_challenge_attempts
    where daily_challenge_id=v_challenge and profile_id=v_owner;
end
$repair$;
commit;
