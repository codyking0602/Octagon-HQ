-- Transactional proof: no provider HTTP requests and no persistent test member.
begin;
select set_config('request.jwt.claim.role', 'service_role', true);
alter table private.notification_groups disable trigger notification_groups_push_delivery;

do $$
declare
  v_member uuid := extensions.gen_random_uuid();
  v_endpoint text := 'https://push.example.test/subscriptions/sport-selection-proof';
  v_default jsonb;
  v_saved jsonb;
  v_ufc jsonb;
  v_football jsonb;
  v_nba jsonb;
  v_mixed jsonb;
  v_social jsonb;
  v_claim jsonb;
begin
  insert into auth.users(
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, raw_user_meta_data
  ) values (
    v_member, '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'notification-sports-' || v_member || '@login.octagon-hq.app',
    '', now(), now(), now(),
    jsonb_build_object('display_name', 'NOTIFICATION SPORT PROOF', 'historical_unclaimed', true)
  );
  perform public.register_unclaimed_pin_profile(v_member, 'Notification Sport Proof', 'NS');

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_member::text, true);
  v_default := public.get_my_notification_push_sports();
  if v_default <> '{"ufc":true,"football":true,"mlb":true,"nba":false}'::jsonb then
    raise exception 'legacy sport push defaults changed: %', v_default;
  end if;
  v_saved := public.set_my_notification_push_sports(false,true,false,false);
  if v_saved <> '{"ufc":false,"football":true,"mlb":false,"nba":false}'::jsonb
    or public.get_my_notification_push_sports() <> v_saved then
    raise exception 'account-specific sport push choices were not persisted: %', v_saved;
  end if;
  perform public.register_my_notification_push_subscription(
    v_endpoint, repeat('A',65), repeat('B',24), 'Sport notification test device'
  );

  perform set_config('request.jwt.claim.role', 'service_role', true);
  perform set_config('request.jwt.claim.sub', '', true);
  v_ufc := public.publish_notification(v_member,
    'sport-proof:ufc', 'sport-proof:ufc', 'ufc_event_starting',
    'UFC event starting', 'The UFC event starts tonight.', '/picks', 'OPEN PICKS', now());
  v_claim := public.claim_notification_push_delivery((v_ufc->>'id')::uuid);
  if v_claim->'notification' <> 'null'::jsonb
    or jsonb_array_length(v_claim->'deliveries') <> 0
    or not exists (select 1 from private.notification_groups where id=(v_ufc->>'id')::uuid) then
    raise exception 'muting UFC push incorrectly removed the in-app group or claimed a device: %', v_claim;
  end if;

  v_football := public.publish_notification(v_member,
    'sport-proof:football', 'sport-proof:football', 'football_picks_open',
    'Football Picks are open', 'NFL week is live.', '/football/picks', 'PICK NOW', now());
  v_claim := public.claim_notification_push_delivery((v_football->>'id')::uuid);
  if jsonb_array_length(v_claim->'deliveries') <> 1
    or v_claim->'notification'->>'title' <> 'Football Picks are open' then
    raise exception 'enabled Football push did not deliver: %', v_claim;
  end if;
  if jsonb_array_length(public.claim_notification_push_delivery((v_football->>'id')::uuid)->'deliveries') <> 0 then
    raise exception 'Football push was not idempotent';
  end if;

  v_mixed := public.publish_notification(v_member,
    'sport-proof:combined', 'daily-closing-combined', 'daily_challenge_four_hours',
    'Daily challenges close soon',
    'Your UFC, Football and MLB challenges close at midnight Central.',
    '/', 'PLAY TODAY', now());
  v_claim := public.claim_notification_push_delivery((v_mixed->>'id')::uuid);
  if jsonb_array_length(v_claim->'deliveries') <> 1
    or v_claim->'notification'->>'summary' like '%UFC%'
    or v_claim->'notification'->>'summary' like '%MLB%'
    or v_claim->'notification'->>'summary' not like '%Football%'
    or not exists (select 1 from private.notification_groups
      where id=(v_mixed->>'id')::uuid and summary like '%UFC%') then
    raise exception 'combined push leaked muted sports or modified the inbox: %', v_claim;
  end if;

  v_nba := public.publish_notification(v_member,
    'sport-proof:nba', 'sport-proof:nba', 'nba_daily_available',
    'NBA Daily is live', 'Play NBA Daily now.', '/nba/daily', 'PLAY DAILY', now());
  v_claim := public.claim_notification_push_delivery((v_nba->>'id')::uuid);
  if v_claim->'notification' <> 'null'::jsonb or jsonb_array_length(v_claim->'deliveries') <> 0 then
    raise exception 'future NBA push opted in without user approval: %', v_claim;
  end if;

  v_social := public.publish_notification(v_member,
    'sport-proof:social', 'sport-proof:social', 'war_room_mention',
    'You were mentioned', 'Your War Room needs attention.', '/war-room', 'OPEN', now());
  v_claim := public.claim_notification_push_delivery((v_social->>'id')::uuid);
  if jsonb_array_length(v_claim->'deliveries') <> 1 then
    raise exception 'universal social push was muted with a sport: %', v_claim;
  end if;

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_member::text, true);
  v_saved := public.set_my_notification_push_sports(false,true,false,true);
  if (v_saved->>'nba')::boolean is distinct from true then
    raise exception 'NBA preference did not opt in: %', v_saved;
  end if;
  perform set_config('request.jwt.claim.role', 'service_role', true);
  perform set_config('request.jwt.claim.sub', '', true);

  -- New NBA events can send after an explicit opt-in; already-suppressed claims do
  -- not later replay automatically because there is no new canonical source event.
  v_nba := public.publish_notification(v_member,
    'sport-proof:nba:after-optin', 'sport-proof:nba:after-optin',
    'nba_daily_available', 'NBA Daily is live',
    'A new NBA challenge is available.', '/nba/daily', 'PLAY DAILY', now());
  v_claim := public.claim_notification_push_delivery((v_nba->>'id')::uuid);
  if jsonb_array_length(v_claim->'deliveries') <> 1 then
    raise exception 'NBA push not eligible after explicit opt in: %', v_claim;
  end if;

  if has_table_privilege('authenticated', 'private.notification_push_sport_preferences', 'select')
    or has_table_privilege('authenticated', 'private.notification_push_sport_preferences', 'update')
    or has_function_privilege('anon', 'public.set_my_notification_push_sports(boolean,boolean,boolean,boolean)', 'EXECUTE')
  then
    raise exception 'sport push settings were exposed beyond authenticated RPCs';
  end if;
end;
$$;

rollback;
