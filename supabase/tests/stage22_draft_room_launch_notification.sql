begin;

select set_config('request.jwt.claim.role', 'service_role', true);

-- Keep the fresh-database proof local while preserving the real production trigger.
alter table private.notification_groups disable trigger notification_groups_push_delivery;

-- Reset only this campaign inside the test transaction. This makes the proof
-- independent of whether a prior migration happened to create a fixture profile.
delete from private.notification_events
where source_key = 'new-game:football-draft-room';

delete from private.notification_groups
where aggregation_key = 'new-game:football-draft-room';

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
  v_push_profile constant uuid := '00000000-0000-4000-8000-0000000022a1';
  v_in_app_profile constant uuid := '00000000-0000-4000-8000-0000000022a2';
  v_targeted integer;
  v_expected integer;
  v_push_group uuid;
  v_claim jsonb;
begin
  if private.notification_priority_for_kind('new_game_available') <> 'push_candidate' then
    raise exception 'new_game_available is not a push candidate';
  end if;

  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, raw_user_meta_data
  ) values
    (v_push_profile, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'draft-room-launch-push@login.octagon-hq.app', '', now(), now(), now(), '{}'::jsonb),
    (v_in_app_profile, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'draft-room-launch-in-app@login.octagon-hq.app', '', now(), now(), now(), '{}'::jsonb);

  insert into public.profiles (id, display_name, normalized_name, initials) values
    (v_push_profile, 'Draft Room Push Profile', 'DRAFT ROOM PUSH PROFILE', 'DP'),
    (v_in_app_profile, 'Draft Room Inbox Profile', 'DRAFT ROOM INBOX PROFILE', 'DI');

  perform pg_temp.set_notification_actor(v_push_profile);
  perform public.register_my_notification_push_subscription(
    'https://push.example.test/subscriptions/draft-room-launch',
    repeat('A', 65),
    repeat('B', 24),
    'Draft Room launch fresh-database proof'
  );

  perform set_config('request.jwt.claim.role', 'service_role', true);
  perform set_config('request.jwt.claim.sub', '', true);

  select count(*)::integer into v_expected from public.profiles;
  select private.publish_draft_room_launch_notification_once() into v_targeted;

  if v_targeted <> v_expected then
    raise exception 'Draft Room launch targeted %, expected % existing profiles', v_targeted, v_expected;
  end if;

  if (
    select count(*)
    from private.notification_events event
    where event.source_key = 'new-game:football-draft-room'
  ) <> v_expected then
    raise exception 'Draft Room launch did not create one source event per existing profile';
  end if;

  if (
    select count(*)
    from private.notification_groups notification
    where notification.aggregation_key = 'new-game:football-draft-room'
      and notification.kind = 'new_game_available'
      and notification.category = 'games'
      and notification.priority = 'push_candidate'
      and notification.title = 'NFL Draft Room is live'
      and notification.summary = 'Challenge another member in sealed-bid NFL and CFB formats.'
      and notification.route = '/football/draft-room'
      and notification.action_label = 'PLAY NOW'
      and notification.aggregate_count = 1
      and notification.read_at is null
  ) <> v_expected then
    raise exception 'Draft Room launch groups did not preserve the canonical content and push priority';
  end if;

  select notification.id into v_push_group
  from private.notification_groups notification
  where notification.recipient_profile_id = v_push_profile
    and notification.aggregation_key = 'new-game:football-draft-room';

  v_claim := public.claim_notification_push_delivery(v_push_group);
  if v_claim->'notification'->>'kind' <> 'new_game_available'
    or v_claim->'notification'->>'route' <> '/football/draft-room'
    or jsonb_array_length(v_claim->'deliveries') <> 1
  then
    raise exception 'push-enabled profile did not use the canonical push claim path: %', v_claim;
  end if;

  select private.publish_draft_room_launch_notification_once() into v_targeted;
  if v_targeted <> 0
    or (select count(*) from private.notification_events where source_key = 'new-game:football-draft-room') <> v_expected
  then
    raise exception 'Draft Room launch rerun was not globally idempotent';
  end if;
end;
$$;

rollback;
