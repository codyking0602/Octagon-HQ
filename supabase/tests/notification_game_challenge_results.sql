begin;
select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_creator uuid := extensions.gen_random_uuid();
  v_recipient uuid := extensions.gen_random_uuid();
  v_code_one text;
  v_code_two text;
  v_snapshot jsonb;
  v_group jsonb;
begin
  insert into auth.users(
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, raw_user_meta_data
  )
  values
    (
      v_creator,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'notification-result-creator@login.octagon-hq.app',
      '', now(), now(), now(),
      jsonb_build_object('display_name', 'RESULT CREATOR', 'historical_unclaimed', true)
    ),
    (
      v_recipient,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'notification-result-recipient@login.octagon-hq.app',
      '', now(), now(), now(),
      jsonb_build_object('display_name', 'RESULT RECIPIENT', 'historical_unclaimed', true)
    );

  perform public.register_unclaimed_pin_profile(v_creator, 'Result Creator', 'RC');
  perform public.register_unclaimed_pin_profile(v_recipient, 'Result Recipient', 'RR');

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_creator::text, true);

  v_code_one := public.create_play_challenge(
    v_recipient,
    'find-leader',
    'v1',
    'Find the Leader',
    'First result challenge',
    '/play/find-leader',
    '{}'::jsonb,
    jsonb_build_object('score', 5)
  );

  v_code_two := public.create_play_challenge(
    v_recipient,
    'wavelength',
    'v1',
    'Wavelength',
    'Second result challenge',
    '/play/wavelength',
    '{}'::jsonb,
    jsonb_build_object('score', 7)
  );

  perform set_config('request.jwt.claim.sub', v_recipient::text, true);

  if not public.complete_play_challenge(v_code_one, jsonb_build_object('score', 4)) then
    raise exception 'Recipient could not complete the first challenge';
  end if;

  if public.complete_play_challenge(v_code_one, jsonb_build_object('score', 4)) then
    raise exception 'Completed challenge replay unexpectedly mutated the challenge';
  end if;

  perform set_config('request.jwt.claim.sub', v_creator::text, true);
  v_snapshot := public.get_notification_snapshot(50);

  select item
    into v_group
  from jsonb_array_elements(v_snapshot->'items') item
  where item->>'kind' = 'game_challenge_result_ready';

  if v_group is null
    or (v_group->>'aggregate_count')::integer <> 1
    or v_group->>'title' <> 'Challenge result is ready'
    or v_group->>'route' <> '/play/find-leader?challenge=' || v_code_one
    or v_group->>'action_label' <> 'VIEW RESULT'
  then
    raise exception 'Challenge result-ready notification was missing or duplicated on replay: %', v_snapshot;
  end if;

  if exists (
    select 1
    from jsonb_array_elements(v_snapshot->'items') item
    where item->>'kind' = 'game_opponent_finished'
  ) then
    raise exception 'Challenge completion created an overlapping opponent-finished notification';
  end if;

  perform set_config('request.jwt.claim.sub', v_recipient::text, true);
  if not public.complete_play_challenge(v_code_two, jsonb_build_object('score', 8)) then
    raise exception 'Recipient could not complete the second challenge';
  end if;

  perform set_config('request.jwt.claim.sub', v_creator::text, true);
  v_snapshot := public.get_notification_snapshot(50);

  select item
    into v_group
  from jsonb_array_elements(v_snapshot->'items') item
  where item->>'kind' = 'game_challenge_result_ready';

  if v_group is null
    or (v_group->>'aggregate_count')::integer <> 2
    or v_group->>'route' <> '/play/wavelength?match=' || v_code_two
    or position('RESULT RECIPIENT finished your Wavelength challenge' in v_group->>'summary') <> 1
  then
    raise exception 'Multiple completed challenges did not aggregate to the latest exact result: %', v_snapshot;
  end if;

  perform set_config('request.jwt.claim.sub', v_recipient::text, true);
  v_snapshot := public.get_notification_snapshot(50);

  if exists (
    select 1
    from jsonb_array_elements(v_snapshot->'items') item
    where item->>'kind' = 'game_challenge_result_ready'
  ) then
    raise exception 'Result-ready notification leaked to the player already completing the challenge';
  end if;

  if not exists (
    select 1
    from public.list_my_play_challenges() challenge
    where challenge.code = v_code_two
      and challenge.completed_at is not null
      and challenge.creator_result = jsonb_build_object('score', 7)
      and challenge.responder_result = jsonb_build_object('score', 8)
  ) then
    raise exception 'Completing the challenge did not preserve the canonical unlocked result';
  end if;

  if has_function_privilege(
    'authenticated',
    'private.publish_notification_to_profile(uuid,text,text,text,text,text,text,text,timestamptz)',
    'EXECUTE'
  ) then
    raise exception 'Authenticated challenge clients can bypass the canonical result notification producer';
  end if;
end $$;

rollback;
