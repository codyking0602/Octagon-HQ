begin;
select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_profile uuid := extensions.gen_random_uuid();
  v_active jsonb;
  v_active_repeat jsonb;
  v_archive jsonb;
  v_expired jsonb;
  v_newer jsonb;
  v_snapshot jsonb;
  v_receipt jsonb;
  v_original_published_at timestamptz;
begin
  insert into auth.users(
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, raw_user_meta_data
  )
  values (
    v_profile,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'whats-new-foundation@login.octagon-hq.app',
    '',
    now(),
    now(),
    now(),
    jsonb_build_object('display_name', 'WHATS NEW TEST', 'historical_unclaimed', true)
  );

  perform public.register_unclaimed_pin_profile(v_profile, 'Whats New Test', 'WN');

  delete from private.whats_new_read_states;
  delete from private.whats_new_items;

  v_active := public.publish_whats_new_item(
    'test:active',
    'new_fighter',
    'fighters',
    'automatic',
    'Active fighter update',
    'This item should remain in the active feed.',
    '/fighters/test-active',
    'VIEW FIGHTER',
    now() - interval '1 day'
  );

  v_archive := public.publish_whats_new_item(
    'test:archive',
    'weekly_summary',
    'app',
    'manual',
    'Archived weekly update',
    'This item should appear in the 8–15 day archive.',
    '/whats-new',
    'OPEN FEED',
    now() - interval '8 days'
  );

  v_expired := public.publish_whats_new_item(
    'test:expired',
    'temporary_notice',
    'app',
    'manual',
    'Expired temporary update',
    'This item should no longer appear in the feed.',
    null,
    null,
    now() - interval '16 days'
  );

  select item.published_at
    into v_original_published_at
  from private.whats_new_items item
  where item.id = (v_active->>'id')::uuid;

  v_active_repeat := public.publish_whats_new_item(
    'test:active',
    'new_fighter',
    'fighters',
    'automatic',
    'Updated active fighter copy',
    'The same source key must update copy without republishing.',
    '/fighters/test-active',
    'VIEW FIGHTER',
    now()
  );

  if v_active_repeat->>'id' <> v_active->>'id' then
    raise exception 'source-key idempotency created a duplicate What''s New item';
  end if;

  if not exists (
    select 1
    from private.whats_new_items item
    where item.id = (v_active->>'id')::uuid
      and item.published_at = v_original_published_at
      and item.title = 'Updated active fighter copy'
  ) then
    raise exception 'idempotent publishing changed the original publication position';
  end if;

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_profile::text, true);

  v_snapshot := public.get_whats_new_snapshot(50);

  if jsonb_array_length(v_snapshot->'items') <> 2
    or (v_snapshot->>'unread_count')::integer <> 2
  then
    raise exception 'What''s New snapshot did not enforce visible lifecycle and unread state: %', v_snapshot;
  end if;

  if not exists (
    select 1
    from jsonb_array_elements(v_snapshot->'items') item
    where item->>'id' = v_active->>'id'
      and item->>'lifecycle' = 'active'
      and not (item->>'is_read')::boolean
  ) then
    raise exception 'active What''s New item was not classified correctly: %', v_snapshot;
  end if;

  if not exists (
    select 1
    from jsonb_array_elements(v_snapshot->'items') item
    where item->>'id' = v_archive->>'id'
      and item->>'lifecycle' = 'archive'
  ) then
    raise exception 'archived What''s New item was not classified correctly: %', v_snapshot;
  end if;

  if exists (
    select 1
    from jsonb_array_elements(v_snapshot->'items') item
    where item->>'id' = v_expired->>'id'
  ) then
    raise exception 'expired What''s New item remained visible after 15 days';
  end if;

  v_receipt := public.mark_whats_new_read((v_active->>'id')::uuid);
  if (v_receipt->>'unread_count')::integer <> 0 then
    raise exception 'marking the latest What''s New item did not clear unread state: %', v_receipt;
  end if;

  perform set_config('request.jwt.claim.role', 'service_role', true);
  v_newer := public.publish_whats_new_item(
    'test:newer',
    'new_game',
    'games',
    'automatic',
    'New replayable game',
    'A later meaningful update should create one unread item.',
    '/play',
    'PLAY NOW',
    now()
  );

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_profile::text, true);

  v_snapshot := public.get_whats_new_snapshot(50);
  if (v_snapshot->>'unread_count')::integer <> 1
    or v_snapshot->>'latest_item_id' <> v_newer->>'id'
  then
    raise exception 'a later What''s New item did not advance unread state: %', v_snapshot;
  end if;

  v_receipt := public.mark_whats_new_read((v_archive->>'id')::uuid);
  if (v_receipt->>'unread_count')::integer <> 1
    or v_receipt->>'last_seen_item_id' <> v_active->>'id'
  then
    raise exception 'What''s New read cursor moved backward: %', v_receipt;
  end if;

  perform set_config('request.jwt.claim.role', 'anon', true);
  perform set_config('request.jwt.claim.sub', '', true);
  v_snapshot := public.get_whats_new_snapshot(50);
  if (v_snapshot->>'unread_count')::integer <> 0
    or jsonb_array_length(v_snapshot->'items') <> 3
  then
    raise exception 'signed-out What''s New visibility or badge behavior is incorrect: %', v_snapshot;
  end if;

  if has_table_privilege('authenticated', 'private.whats_new_items', 'SELECT')
    or has_table_privilege('authenticated', 'private.whats_new_read_states', 'SELECT')
  then
    raise exception 'authenticated role can read private What''s New tables directly';
  end if;

  if has_function_privilege(
    'authenticated',
    'public.publish_whats_new_item(text,text,text,text,text,text,text,text,timestamptz)',
    'EXECUTE'
  ) then
    raise exception 'authenticated role can publish What''s New items';
  end if;

  if has_function_privilege('anon', 'public.mark_whats_new_read(uuid)', 'EXECUTE') then
    raise exception 'anonymous role can update What''s New read state';
  end if;

  if not has_function_privilege('anon', 'public.get_whats_new_snapshot(integer)', 'EXECUTE')
    or not has_function_privilege('authenticated', 'public.mark_whats_new_read(uuid)', 'EXECUTE')
  then
    raise exception 'required What''s New RPC privileges are missing';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'realtime'
      and tablename = 'messages'
      and policyname = 'whats_new_members_receive_broadcast'
  ) then
    raise exception 'What''s New private Realtime policy is missing';
  end if;

  if not exists (
    select 1
    from pg_trigger
    where tgrelid = 'private.whats_new_items'::regclass
      and tgname = 'whats_new_items_broadcast'
      and not tgisinternal
  ) then
    raise exception 'What''s New Broadcast trigger is missing';
  end if;
end $$;

rollback;
