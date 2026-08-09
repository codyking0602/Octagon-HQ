begin;

select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_owner_id uuid := extensions.gen_random_uuid();
  v_draft_id uuid;
  v_starts_at timestamptz := now() + interval '10 days';
  v_setup jsonb;
  v_current jsonb;
begin
  update public.pick_events
  set status = 'complete',
      completed_at = coalesce(completed_at, now())
  where status in ('upcoming', 'locked');

  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, raw_user_meta_data
  ) values (
    v_owner_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'spotlight-owner@login.octagon-hq.app',
    '', now(), now(), now(),
    jsonb_build_object('display_name', 'SPOTLIGHT OWNER', 'historical_unclaimed', true)
  );

  perform public.register_unclaimed_pin_profile(v_owner_id, 'Spotlight Owner', 'SO');
  insert into public.pick_control_owners(profile_id) values (v_owner_id);

  v_draft_id := public.stage_pick_event_draft(jsonb_build_object(
    'source', 'MMA Mania',
    'source_event_key', 'spotlight-test-source',
    'source_url', 'https://www.mmamania.com/spotlight-test',
    'event_id', 'pick-spotlight-test',
    'name', 'UFC Spotlight Test',
    'subtitle', 'Spotlight Red vs. Spotlight Blue',
    'venue', 'Test Arena',
    'location', 'Dallas, Texas',
    'starts_at', v_starts_at,
    'locks_at', v_starts_at - interval '1 hour',
    'season', 2199,
    'bouts', jsonb_build_array(jsonb_build_object(
      'bout_id', 'main-event-spotlight-red-spotlight-blue',
      'position', 1,
      'weight_class', 'Lightweight',
      'red_fighter_slug', 'spotlight-red',
      'red_fighter_name', 'Spotlight Red',
      'blue_fighter_slug', 'spotlight-blue',
      'blue_fighter_name', 'Spotlight Blue',
      'included', true
    ))
  ));

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_owner_id::text, true);

  begin
    perform public.set_pick_event_draft_spotlight(
      v_draft_id,
      jsonb_build_object(
        'bout_id', 'main-event-spotlight-red-spotlight-blue',
        'watch_spotlights', jsonb_build_array(jsonb_build_object(
          'fighter_slug', 'not-in-this-fight',
          'url', 'https://youtu.be/not-current'
        ))
      )
    );
    raise exception 'invalid Spotlight fighter was accepted';
  exception when others then
    if sqlerrm not like '%Spotlight must reference one included fight%' then
      raise;
    end if;
  end;

  perform public.set_pick_event_draft_spotlight(
    v_draft_id,
    jsonb_build_object(
      'bout_id', 'main-event-spotlight-red-spotlight-blue',
      'watch_spotlights', jsonb_build_array(
        jsonb_build_object(
          'fighter_slug', 'spotlight-red',
          'url', 'https://youtu.be/spotlight-red'
        ),
        jsonb_build_object(
          'fighter_slug', 'spotlight-blue',
          'url', 'https://youtu.be/spotlight-blue'
        )
      )
    )
  );

  v_setup := public.get_pick_event_setup();
  if v_setup #>> '{spotlight,bout_id}' <> 'main-event-spotlight-red-spotlight-blue'
    or v_setup #>> '{spotlight,watch_spotlights,0,fighter_slug}' <> 'spotlight-red'
    or v_setup #>> '{spotlight,watch_spotlights,1,fighter_slug}' <> 'spotlight-blue'
    or v_setup #>> '{can_publish}' <> 'true' then
    raise exception 'owner setup projection did not preserve the reviewed Spotlight: %', v_setup;
  end if;

  perform public.publish_pick_event_draft(v_draft_id);

  v_current := public.get_current_pick_event();
  if v_current #>> '{event_id}' <> 'pick-spotlight-test'
    or v_current #>> '{spotlight,bout_id}' <> 'main-event-spotlight-red-spotlight-blue'
    or v_current #>> '{spotlight,watch_spotlights,0,url}' <> 'https://youtu.be/spotlight-red'
    or v_current #>> '{spotlight,watch_spotlights,1,url}' <> 'https://youtu.be/spotlight-blue' then
    raise exception 'published current-event projection did not expose the reviewed Spotlight: %', v_current;
  end if;

  perform set_config('request.jwt.claim.role', 'service_role', true);
  perform set_config('request.jwt.claim.sub', '', true);

  update public.pick_bouts
  set red_fighter_slug = 'replacement-red',
      red_fighter_name = 'Replacement Red'
  where event_id = 'pick-spotlight-test'
    and bout_id = 'main-event-spotlight-red-spotlight-blue';

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_owner_id::text, true);

  v_current := public.get_current_pick_event();
  if coalesce(v_current->'spotlight', 'null'::jsonb) <> 'null'::jsonb then
    raise exception 'stale Spotlight links remained visible after the selected fighter changed: %', v_current;
  end if;

  if has_function_privilege(
    'anon',
    'public.set_pick_event_draft_spotlight(uuid,jsonb)',
    'EXECUTE'
  ) then
    raise exception 'anonymous role inherited Spotlight setup mutation access';
  end if;
end;
$$;

rollback;
