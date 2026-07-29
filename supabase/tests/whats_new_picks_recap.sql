begin;
select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_owner_id uuid := extensions.gen_random_uuid();
  v_completed_at timestamptz;
  v_published_at timestamptz;
  v_item private.whats_new_items;
begin
  insert into auth.users(
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, raw_user_meta_data
  )
  values (
    v_owner_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'whats-new-picks-owner@login.octagon-hq.app',
    '',
    now(),
    now(),
    now(),
    jsonb_build_object('display_name', 'WHATS NEW PICKS OWNER', 'historical_unclaimed', true)
  );

  perform public.register_unclaimed_pin_profile(v_owner_id, 'Whats New Picks Owner', 'WP');
  insert into public.pick_control_owners(profile_id) values (v_owner_id);

  delete from private.whats_new_items
  where source_key = 'picks:recap:whats-new-picks-recap-test';

  insert into public.pick_events(
    event_id, name, subtitle, venue, location, starts_at, locks_at, season, status
  )
  values (
    'whats-new-picks-recap-test',
    'UFC Picks Recap Test',
    'Red vs. Blue',
    'Test Arena',
    'Dallas, Texas',
    now() + interval '1 hour',
    now() - interval '1 minute',
    2199,
    'upcoming'
  );

  insert into public.pick_bouts(
    event_id, bout_id, position, weight_class,
    red_fighter_slug, red_fighter_name,
    blue_fighter_slug, blue_fighter_name
  )
  values (
    'whats-new-picks-recap-test',
    'whats-new-main',
    1,
    'Lightweight',
    'whats-new-red',
    'Whats New Red',
    'whats-new-blue',
    'Whats New Blue'
  );

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_owner_id::text, true);

  perform public.transition_pick_event('whats-new-picks-recap-test', 'locked');

  if exists (
    select 1 from private.whats_new_items
    where source_key = 'picks:recap:whats-new-picks-recap-test'
  ) then
    raise exception 'locking a Picks event published a recap before completion';
  end if;

  perform public.record_official_pick_bout_result(
    'whats-new-picks-recap-test',
    'whats-new-main',
    'red_win'
  );
  perform public.transition_pick_event('whats-new-picks-recap-test', 'complete');

  select event.completed_at
    into v_completed_at
  from public.pick_events event
  where event.event_id = 'whats-new-picks-recap-test';

  select item.*
    into v_item
  from private.whats_new_items item
  where item.source_key = 'picks:recap:whats-new-picks-recap-test';

  if not found then
    raise exception 'completed Picks event did not publish a What''s New recap item';
  end if;

  if v_item.kind <> 'new_recap'
    or v_item.category <> 'picks'
    or v_item.origin <> 'automatic'
    or v_item.title <> 'UFC Picks Recap Test recap is ready'
    or v_item.route <> '/picks?view=latest-recap'
    or v_item.action_label <> 'OPEN RECAP'
  then
    raise exception 'completed Picks recap item is incorrect: %', to_jsonb(v_item);
  end if;

  if v_item.published_at is distinct from v_completed_at then
    raise exception 'Picks recap publication did not use the canonical completion timestamp';
  end if;

  v_published_at := v_item.published_at;
  perform public.transition_pick_event('whats-new-picks-recap-test', 'complete');

  if (
    select count(*)
    from private.whats_new_items item
    where item.source_key = 'picks:recap:whats-new-picks-recap-test'
  ) <> 1 then
    raise exception 'repeated completion created a duplicate Picks recap item';
  end if;

  if (
    select item.published_at
    from private.whats_new_items item
    where item.source_key = 'picks:recap:whats-new-picks-recap-test'
  ) is distinct from v_published_at then
    raise exception 'repeated completion changed the Picks recap publication position';
  end if;

  if has_function_privilege(
    'authenticated',
    'private.upsert_whats_new_item(text,text,text,text,text,text,text,text,timestamptz)',
    'EXECUTE'
  ) then
    raise exception 'authenticated role can execute the private What''s New storage owner';
  end if;

  if has_function_privilege(
    'authenticated',
    'public.publish_whats_new_item(text,text,text,text,text,text,text,text,timestamptz)',
    'EXECUTE'
  ) then
    raise exception 'authenticated role can execute the public What''s New publisher';
  end if;
end $$;

rollback;
