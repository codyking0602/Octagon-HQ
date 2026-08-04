begin;

select set_config('request.jwt.claim.role', 'service_role', true);

-- Keep the fresh-database proof local while preserving the real production trigger.
alter table private.notification_groups disable trigger notification_groups_push_delivery;

create or replace function pg_temp.set_notification_actor(p_actor uuid)
returns void
language plpgsql
as $$
begin
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', p_actor::text, true);
end;
$$;

do $$
declare
  v_push_profile constant uuid := '00000000-0000-4000-8000-0000000007a1';
  v_in_app_profile_a constant uuid := '00000000-0000-4000-8000-0000000007a2';
  v_in_app_profile_b constant uuid := '00000000-0000-4000-8000-0000000007a3';
  v_future_profile constant uuid := '00000000-0000-4000-8000-0000000007a4';
  v_targeted integer;
  v_push_group uuid;
  v_in_app_group uuid;
  v_claim jsonb;
  v_push_owner text;
begin
  if private.notification_priority_for_kind('new_game_available') <> 'push_candidate' then
    raise exception 'new_game_available was not promoted to push_candidate';
  end if;

  if exists (
    select 1
    from private.notification_events event
    where event.source_key = 'new-game:auction'
  ) then
    raise exception 'fresh database unexpectedly contained an Auction launch source event';
  end if;

  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, raw_user_meta_data
  ) values
    (v_push_profile, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'auction-launch-push@login.octagon-hq.app', '', now(), now(), now(), '{}'::jsonb),
    (v_in_app_profile_a, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'auction-launch-a@login.octagon-hq.app', '', now(), now(), now(), '{}'::jsonb),
    (v_in_app_profile_b, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'auction-launch-b@login.octagon-hq.app', '', now(), now(), now(), '{}'::jsonb);

  insert into public.profiles (id, display_name, normalized_name, initials) values
    (v_push_profile, 'Auction Push Profile', 'AUCTION PUSH PROFILE', 'AP'),
    (v_in_app_profile_a, 'Auction Inbox A', 'AUCTION INBOX A', 'AA'),
    (v_in_app_profile_b, 'Auction Inbox B', 'AUCTION INBOX B', 'AB');

  perform pg_temp.set_notification_actor(v_push_profile);
  perform public.register_my_notification_push_subscription(
    'https://push.example.test/subscriptions/auction-launch',
    repeat('A', 65),
    repeat('B', 24),
    'Auction launch fresh-database proof'
  );

  perform set_config('request.jwt.claim.role', 'service_role', true);
  perform set_config('request.jwt.claim.sub', '', true);
  select private.publish_auction_launch_notification_once() into v_targeted;

  if v_targeted <> 3 then
    raise exception 'Auction launch targeted %, expected all three existing profiles', v_targeted;
  end if;

  if (
    select count(*)
    from private.notification_events event
    where event.source_key = 'new-game:auction'
  ) <> 3 or (
    select count(distinct event.recipient_profile_id)
    from private.notification_events event
    where event.source_key = 'new-game:auction'
  ) <> 3 then
    raise exception 'Auction launch did not create exactly one source event per existing profile';
  end if;

  if (
    select count(*)
    from private.notification_groups notification
    where notification.aggregation_key = 'new-game:auction'
      and notification.kind = 'new_game_available'
      and notification.category = 'games'
      and notification.priority = 'push_candidate'
      and notification.title = 'Auction is live'
      and notification.summary = 'Build your collection through sealed bids and challenge another Octagon HQ member.'
      and notification.route = '/play/auction'
      and notification.action_label = 'PLAY NOW'
      and notification.aggregate_count = 1
      and notification.read_at is null
  ) <> 3 then
    raise exception 'Auction launch groups did not preserve the exact canonical content and priority';
  end if;

  if exists (
    select 1
    from private.notification_events event
    left join private.notification_groups notification on notification.id = event.group_id
    where event.source_key = 'new-game:auction'
      and (
        notification.id is null
        or notification.recipient_profile_id <> event.recipient_profile_id
        or notification.aggregation_key <> 'new-game:auction'
      )
  ) then
    raise exception 'Auction launch source events did not resolve through their canonical groups';
  end if;

  select notification.id into v_push_group
  from private.notification_groups notification
  where notification.recipient_profile_id = v_push_profile
    and notification.aggregation_key = 'new-game:auction';

  v_claim := public.claim_notification_push_delivery(v_push_group);
  if v_claim->'notification'->>'kind' <> 'new_game_available'
    or v_claim->'notification'->>'route' <> '/play/auction'
    or jsonb_array_length(v_claim->'deliveries') <> 1
  then
    raise exception 'push-enabled profile did not use the canonical push claim path: %', v_claim;
  end if;

  select notification.id into v_in_app_group
  from private.notification_groups notification
  where notification.recipient_profile_id = v_in_app_profile_a
    and notification.aggregation_key = 'new-game:auction';

  v_claim := public.claim_notification_push_delivery(v_in_app_group);
  if v_claim->'notification'->>'kind' <> 'new_game_available'
    or jsonb_array_length(v_claim->'deliveries') <> 0
  then
    raise exception 'profile without push did not retain in-app delivery without a device claim: %', v_claim;
  end if;

  select private.publish_auction_launch_notification_once() into v_targeted;
  if v_targeted <> 0
    or (select count(*) from private.notification_events where source_key = 'new-game:auction') <> 3
    or (select count(*) from private.notification_groups where aggregation_key = 'new-game:auction') <> 3
  then
    raise exception 'Auction launch rerun was not globally idempotent';
  end if;

  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, raw_user_meta_data
  ) values (
    v_future_profile,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'auction-launch-future@login.octagon-hq.app',
    '',
    now(),
    now(),
    now(),
    '{}'::jsonb
  );
  insert into public.profiles (id, display_name, normalized_name, initials) values
    (v_future_profile, 'Auction Future Profile', 'AUCTION FUTURE PROFILE', 'AF');

  select private.publish_auction_launch_notification_once() into v_targeted;
  if v_targeted <> 0 or exists (
    select 1
    from private.notification_events event
    where event.recipient_profile_id = v_future_profile
      and event.source_key = 'new-game:auction'
  ) then
    raise exception 'profile created after the one-time campaign incorrectly received the launch';
  end if;

  if not exists (
    select 1
    from pg_trigger trigger
    join pg_proc procedure on procedure.oid = trigger.tgfoid
    join pg_namespace namespace on namespace.oid = procedure.pronamespace
    where trigger.tgrelid = 'private.notification_groups'::regclass
      and trigger.tgname = 'notification_groups_push_delivery'
      and not trigger.tgisinternal
      and namespace.nspname = 'private'
      and procedure.proname = 'enqueue_notification_push_delivery'
  ) then
    raise exception 'canonical notification push trigger is no longer the delivery owner';
  end if;

  select pg_get_functiondef('private.enqueue_notification_push_delivery()'::regprocedure)
    into v_push_owner;
  if position('net.http_post' in v_push_owner) = 0
    or position('deliver-notification-push' in v_push_owner) = 0
  then
    raise exception 'canonical push trigger no longer delegates to deliver-notification-push';
  end if;
end;
$$;

rollback;
