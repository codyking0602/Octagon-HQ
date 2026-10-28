begin;
select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_owner uuid := extensions.gen_random_uuid();
  v_affected uuid := extensions.gen_random_uuid();
  v_unaffected uuid := extensions.gen_random_uuid();
  v_snapshot jsonb;
  v_group jsonb;
begin
  insert into auth.users(
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, raw_user_meta_data
  )
  values
    (
      v_owner,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'notification-repick-owner@login.octagon-hq.app',
      '', now(), now(), now(),
      jsonb_build_object('display_name', 'REPICK OWNER', 'historical_unclaimed', true)
    ),
    (
      v_affected,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'notification-repick-affected@login.octagon-hq.app',
      '', now(), now(), now(),
      jsonb_build_object('display_name', 'REPICK AFFECTED', 'historical_unclaimed', true)
    ),
    (
      v_unaffected,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'notification-repick-unaffected@login.octagon-hq.app',
      '', now(), now(), now(),
      jsonb_build_object('display_name', 'REPICK UNAFFECTED', 'historical_unclaimed', true)
    );

  perform public.register_unclaimed_pin_profile(v_owner, 'Repick Owner', 'RO');
  perform public.register_unclaimed_pin_profile(v_affected, 'Repick Affected', 'RA');
  perform public.register_unclaimed_pin_profile(v_unaffected, 'Repick Unaffected', 'RU');
  insert into public.pick_control_owners(profile_id) values (v_owner);

  insert into public.pick_events(
    event_id, name, subtitle, venue, location,
    starts_at, locks_at, season, status, completed_at
  ) values (
    'notification-repick-test',
    'UFC Repick Notification Test',
    'Old Red vs. Old Blue',
    'Test Arena',
    'Dallas, Texas',
    now() + interval '2 days',
    now() + interval '1 day',
    2199,
    'upcoming',
    null
  );

  insert into public.pick_bouts(
    event_id, bout_id, position, weight_class,
    red_fighter_slug, red_fighter_name,
    blue_fighter_slug, blue_fighter_name,
    red_american_odds, blue_american_odds, odds_source, odds_updated_at
  ) values
    (
      'notification-repick-test', 'repick-target', 1, 'Lightweight',
      'old-red', 'Old Red', 'old-blue', 'Old Blue',
      145, -165, 'Test Sportsbook', now()
    ),
    (
      'notification-repick-test', 'unaffected-bout', 2, 'Welterweight',
      'other-red', 'Other Red', 'other-blue', 'Other Blue',
      210, -250, 'Test Sportsbook', now()
    );

  insert into public.profile_event_picks(profile_id, event_id, bout_id, fighter_slug)
  values
    (v_affected, 'notification-repick-test', 'repick-target', 'old-red'),
    (v_unaffected, 'notification-repick-test', 'unaffected-bout', 'other-blue');

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_owner::text, true);

  perform public.approve_pick_fighter_replacement(
    'notification-repick-test',
    'repick-target',
    'red',
    'old-red',
    'old-blue',
    'new-red',
    'New Red',
    'Official opponent withdrew'
  );

  if exists (
    select 1
    from public.profile_event_picks
    where profile_id = v_affected
      and event_id = 'notification-repick-test'
      and bout_id = 'repick-target'
  ) then
    raise exception 'Affected selection survived the canonical replacement transition';
  end if;

  perform set_config('request.jwt.claim.sub', v_affected::text, true);
  v_snapshot := public.get_notification_snapshot(50);

  if (v_snapshot->>'unread_count')::integer <> 1 then
    raise exception 'Affected profile did not receive one repick notification group: %', v_snapshot;
  end if;

  select item
    into v_group
  from jsonb_array_elements(v_snapshot->'items') item
  where item->>'kind' = 'picks_repick_required';

  if v_group is null
    or v_group->>'title' <> 'Repick required'
    or v_group->>'route' <> '/picks'
    or v_group->>'action_label' <> 'REPICK'
    or (v_group->>'aggregate_count')::integer <> 1
    or v_group->>'summary' not like '%Old Red vs. Old Blue changed to New Red vs. Old Blue%'
  then
    raise exception 'Repick notification did not preserve the exact changed matchup and action: %', v_snapshot;
  end if;

  perform set_config('request.jwt.claim.sub', v_unaffected::text, true);
  v_snapshot := public.get_notification_snapshot(50);

  if (v_snapshot->>'unread_count')::integer <> 0
    or jsonb_array_length(v_snapshot->'items') <> 0
  then
    raise exception 'A profile without an invalidated pick received repick noise: %', v_snapshot;
  end if;

  perform set_config('request.jwt.claim.sub', v_owner::text, true);
  begin
    perform public.approve_pick_fighter_replacement(
      'notification-repick-test',
      'repick-target',
      'red',
      'old-red',
      'old-blue',
      'stale-red',
      'Stale Red',
      'Stale replay attempt'
    );
    raise exception 'Stale replacement replay was accepted';
  exception when others then
    if sqlerrm not like '%matchup changed; reload Fight Night Control%' then raise; end if;
  end;

  perform set_config('request.jwt.claim.sub', v_affected::text, true);
  v_snapshot := public.get_notification_snapshot(50);
  select item
    into v_group
  from jsonb_array_elements(v_snapshot->'items') item
  where item->>'kind' = 'picks_repick_required';

  if (v_group->>'aggregate_count')::integer <> 1 then
    raise exception 'Rejected replacement replay increased the notification count: %', v_snapshot;
  end if;

  perform public.save_my_event_pick(
    'notification-repick-test',
    'repick-target',
    'new-red'
  );

  perform set_config('request.jwt.claim.sub', v_owner::text, true);
  perform public.approve_pick_fighter_replacement(
    'notification-repick-test',
    'repick-target',
    'red',
    'new-red',
    'old-blue',
    'newest-red',
    'Newest Red',
    'Second official replacement'
  );

  perform set_config('request.jwt.claim.sub', v_affected::text, true);
  v_snapshot := public.get_notification_snapshot(50);
  select item
    into v_group
  from jsonb_array_elements(v_snapshot->'items') item
  where item->>'kind' = 'picks_repick_required';

  if (v_snapshot->>'unread_count')::integer <> 1
    or (v_group->>'aggregate_count')::integer <> 2
    or v_group->>'summary' not like '%New Red vs. Old Blue changed to Newest Red vs. Old Blue%'
  then
    raise exception 'Repeated repick requirements did not aggregate to the latest matchup: %', v_snapshot;
  end if;

  if (select count(*) from public.pick_card_change_actions
      where event_id = 'notification-repick-test'
        and bout_id = 'repick-target'
        and action_type = 'replace_fighter') <> 2 then
    raise exception 'Notification delivery created or replaced the canonical audit owner';
  end if;

  if has_function_privilege(
    'authenticated',
    'private.publish_notification_to_profile(uuid,text,text,text,text,text,text,text,timestamptz)',
    'EXECUTE'
  ) then
    raise exception 'Authenticated Picks clients can bypass the canonical notification producer';
  end if;
end $$;

rollback;
