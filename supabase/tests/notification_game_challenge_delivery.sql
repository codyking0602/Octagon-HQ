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
      'notification-challenge-creator@login.octagon-hq.app',
      '', now(), now(), now(),
      jsonb_build_object('display_name', 'CHALLENGE CREATOR', 'historical_unclaimed', true)
    ),
    (
      v_recipient,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'notification-challenge-recipient@login.octagon-hq.app',
      '', now(), now(), now(),
      jsonb_build_object('display_name', 'CHALLENGE RECIPIENT', 'historical_unclaimed', true)
    );

  perform public.register_unclaimed_pin_profile(v_creator, 'Challenge Creator', 'CC');
  perform public.register_unclaimed_pin_profile(v_recipient, 'Challenge Recipient', 'CR');

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_creator::text, true);

  v_code_one := public.create_play_challenge(
    v_recipient,
    'find-leader',
    'v1',
    'Find the Leader',
    'First locked challenge',
    '/play/find-leader',
    '{}'::jsonb,
    '{}'::jsonb
  );

  v_code_two := public.create_play_challenge(
    v_recipient,
    'wavelength',
    'v1',
    'Wavelength',
    'Second locked challenge',
    '/play/wavelength',
    '{}'::jsonb,
    '{}'::jsonb
  );

  perform set_config('request.jwt.claim.sub', v_recipient::text, true);
  v_snapshot := public.get_notification_snapshot(50);

  if (v_snapshot->>'unread_count')::integer <> 1 then
    raise exception 'Challenge deliveries created more than one unread notification group: %', v_snapshot;
  end if;

  select item
    into v_group
  from jsonb_array_elements(v_snapshot->'items') item
  where item->>'kind' = 'game_challenge_received';

  if v_group is null
    or (v_group->>'aggregate_count')::integer <> 2
    or v_group->>'title' <> 'You were challenged'
    or v_group->>'route' <> '/play/wavelength?match=' || v_code_two
  then
    raise exception 'Received challenges did not aggregate with the latest exact deep link: %', v_snapshot;
  end if;

  if not public.open_play_challenge(v_code_one) then
    raise exception 'Recipient could not open the first challenge';
  end if;

  if not public.open_play_challenge(v_code_one) then
    raise exception 'Idempotent challenge reopen unexpectedly failed';
  end if;

  perform set_config('request.jwt.claim.sub', v_creator::text, true);
  v_snapshot := public.get_notification_snapshot(50);

  select item
    into v_group
  from jsonb_array_elements(v_snapshot->'items') item
  where item->>'kind' = 'game_challenge_accepted';

  if v_group is null
    or (v_group->>'aggregate_count')::integer <> 1
    or v_group->>'title' <> 'Your challenge was accepted'
    or v_group->>'route' <> '/play/find-leader?challenge=' || v_code_one
  then
    raise exception 'Challenge acceptance notification was missing or duplicated on reopen: %', v_snapshot;
  end if;

  perform set_config('request.jwt.claim.sub', v_recipient::text, true);
  if not public.open_play_challenge(v_code_two) then
    raise exception 'Recipient could not open the second challenge';
  end if;

  perform set_config('request.jwt.claim.sub', v_creator::text, true);
  v_snapshot := public.get_notification_snapshot(50);

  select item
    into v_group
  from jsonb_array_elements(v_snapshot->'items') item
  where item->>'kind' = 'game_challenge_accepted';

  if v_group is null
    or (v_group->>'aggregate_count')::integer <> 2
    or v_group->>'route' <> '/play/wavelength?match=' || v_code_two
  then
    raise exception 'Multiple accepted challenges did not aggregate to the latest matchup: %', v_snapshot;
  end if;

  perform set_config('request.jwt.claim.sub', v_recipient::text, true);
  v_snapshot := public.get_notification_snapshot(50);

  if exists (
    select 1
    from jsonb_array_elements(v_snapshot->'items') item
    where item->>'kind' = 'game_challenge_accepted'
  ) then
    raise exception 'Challenge acceptance notification leaked to the recipient profile';
  end if;

  if has_function_privilege(
    'authenticated',
    'private.publish_notification_to_profile(uuid,text,text,text,text,text,text,text,timestamptz)',
    'EXECUTE'
  ) then
    raise exception 'Authenticated challenge clients can bypass the canonical notification producer';
  end if;
end $$;

rollback;
