begin;

select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_owner_id uuid := extensions.gen_random_uuid();
  v_draft_id uuid;
  v_starts_at timestamptz := now() + interval '10 days';
  v_setup jsonb;
  v_current jsonb;
  v_spotlights jsonb;
begin
  update public.pick_events
  set status = 'complete', completed_at = coalesce(completed_at, now())
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
    'bouts', jsonb_build_array(
      jsonb_build_object(
        'bout_id', 'main-event-spotlight-red-spotlight-blue',
        'position', 1,
        'weight_class', 'Lightweight',
        'red_fighter_slug', 'spotlight-red',
        'red_fighter_name', 'Spotlight Red',
        'blue_fighter_slug', 'spotlight-blue',
        'blue_fighter_name', 'Spotlight Blue',
        'included', true
      ),
      jsonb_build_object(
        'bout_id', 'main-second-red-second-blue',
        'position', 2,
        'weight_class', 'Welterweight',
        'red_fighter_slug', 'second-red',
        'red_fighter_name', 'Second Red',
        'blue_fighter_slug', 'second-blue',
        'blue_fighter_name', 'Second Blue',
        'included', true
      )
    )
  ));

  v_spotlights := jsonb_build_array(
    jsonb_build_object(
      'bout_id', 'main-event-spotlight-red-spotlight-blue',
      'preview', 'Spotlight Red has the stronger striking volume while Spotlight Blue answers with a higher wrestling rate.',
      'red', jsonb_build_object(
        'fighter_slug', 'spotlight-red', 'record', '8-1-0', 'age', '28', 'height', '6'' 0"', 'reach', '75"', 'stance', 'Orthodox',
        'edges', jsonb_build_array('5.0 significant strikes landed/min', '78% takedown defense')
      ),
      'blue', jsonb_build_object(
        'fighter_slug', 'spotlight-blue', 'record', '10-2-0', 'age', '30', 'height', '5'' 11"', 'reach', '73"', 'stance', 'Southpaw',
        'edges', jsonb_build_array('3.0 takedowns per 15 min')
      ),
      'watch_spotlights', jsonb_build_array(
        jsonb_build_object('fighter_slug', 'spotlight-red', 'url', 'https://youtu.be/spotlight-red'),
        jsonb_build_object('fighter_slug', 'spotlight-blue', 'url', 'https://youtu.be/spotlight-blue')
      ),
      'source', 'UFCStats',
      'generated_at', now()
    ),
    jsonb_build_object(
      'bout_id', 'main-second-red-second-blue',
      'preview', 'Second Red carries the longer reach while Second Blue brings the stronger takedown and submission rates.',
      'red', jsonb_build_object(
        'fighter_slug', 'second-red', 'record', '7-2-0', 'age', '27', 'height', '6'' 1"', 'reach', '76"', 'stance', 'Orthodox',
        'edges', jsonb_build_array('4.8 significant strikes landed/min')
      ),
      'blue', jsonb_build_object(
        'fighter_slug', 'second-blue', 'record', '9-3-0', 'age', '31', 'height', '5'' 10"', 'reach', '72"', 'stance', 'Southpaw',
        'edges', jsonb_build_array('3.4 takedowns per 15 min', '1.1 submission attempts per 15 min')
      ),
      'watch_spotlights', '[]'::jsonb,
      'source', 'UFCStats',
      'generated_at', now()
    )
  );

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_owner_id::text, true);

  begin
    perform public.set_pick_event_draft_spotlight(
      v_draft_id,
      v_spotlights || jsonb_build_array(v_spotlights->0)
    );
    raise exception 'duplicate Spotlight fight was accepted';
  exception when others then
    if sqlerrm not like '%Fight Spotlights must be complete, unique%' then raise; end if;
  end;

  begin
    perform public.set_pick_event_draft_spotlight(
      v_draft_id,
      jsonb_set(v_spotlights, '{0,red,fighter_slug}', '"not-current"'::jsonb)
    );
    raise exception 'invalid Spotlight fighter was accepted';
  exception when others then
    if sqlerrm not like '%Fight Spotlights must be complete, unique%' then raise; end if;
  end;

  perform public.set_pick_event_draft_spotlight(v_draft_id, v_spotlights);

  v_setup := public.get_pick_event_setup();
  if jsonb_array_length(v_setup->'spotlights') <> 2
    or v_setup #>> '{spotlights,0,bout_id}' <> 'main-event-spotlight-red-spotlight-blue'
    or v_setup #>> '{spotlights,1,bout_id}' <> 'main-second-red-second-blue'
    or v_setup #>> '{spotlights,0,preview}' not like '%Spotlight Red%'
    or v_setup #>> '{can_publish}' <> 'true' then
    raise exception 'owner setup projection did not preserve both reviewed Spotlights: %', v_setup;
  end if;

  perform public.publish_pick_event_draft(v_draft_id);

  v_current := public.get_current_pick_event();
  if v_current #>> '{event_id}' <> 'pick-spotlight-test'
    or jsonb_array_length(v_current->'spotlights') <> 2
    or v_current #>> '{spotlights,0,watch_spotlights,0,url}' <> 'https://youtu.be/spotlight-red'
    or v_current #>> '{spotlights,1,red,record}' <> '7-2-0' then
    raise exception 'published current-event projection did not expose both Spotlights: %', v_current;
  end if;

  perform set_config('request.jwt.claim.sub', extensions.gen_random_uuid()::text, true);
  begin
    perform public.set_pick_event_spotlights('pick-spotlight-test', v_spotlights);
    raise exception 'non-owner updated published Spotlights';
  exception when others then
    if sqlerrm not like '%pick control owner required%' then raise; end if;
  end;
  perform set_config('request.jwt.claim.sub', v_owner_id::text, true);

  v_spotlights := jsonb_set(
    jsonb_set(
      v_spotlights,
      '{0,preview}',
      to_jsonb('Updated after publication without republishing the Picks card or touching submitted picks.'::text)
    ),
    '{0,watch_spotlights,0,url}',
    to_jsonb('https://youtu.be/spotlight-red-updated'::text)
  );
  perform public.set_pick_event_spotlights('pick-spotlight-test', v_spotlights);

  v_current := public.get_pick_control_event('pick-spotlight-test');
  if jsonb_array_length(v_current->'spotlights') <> 2
    or v_current #>> '{spotlights,0,preview}' not like 'Updated after publication%'
    or v_current #>> '{spotlights,0,watch_spotlights,0,url}' <> 'https://youtu.be/spotlight-red-updated' then
    raise exception 'Fight Night Control did not expose the updated published Spotlights: %', v_current;
  end if;

  perform set_config('request.jwt.claim.role', 'service_role', true);
  perform set_config('request.jwt.claim.sub', '', true);
  update public.pick_bouts
  set red_fighter_slug = 'replacement-red', red_fighter_name = 'Replacement Red'
  where event_id = 'pick-spotlight-test'
    and bout_id = 'main-event-spotlight-red-spotlight-blue';

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_owner_id::text, true);
  v_current := public.get_current_pick_event();
  if jsonb_array_length(v_current->'spotlights') <> 1
    or v_current #>> '{spotlights,0,bout_id}' <> 'main-second-red-second-blue' then
    raise exception 'one stale fight Spotlight did not fail closed independently: %', v_current;
  end if;

  perform set_config('request.jwt.claim.role', 'service_role', true);
  perform set_config('request.jwt.claim.sub', '', true);
  update public.pick_events set status = 'locked' where event_id = 'pick-spotlight-test';
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_owner_id::text, true);
  begin
    perform public.set_pick_event_spotlights('pick-spotlight-test', v_spotlights);
    raise exception 'locked event accepted a published Spotlight update';
  exception when others then
    if sqlerrm not like '%upcoming published Picks event not found%' then raise; end if;
  end;

  if has_function_privilege('anon', 'public.set_pick_event_draft_spotlight(uuid,jsonb)', 'EXECUTE') then
    raise exception 'anonymous role inherited Spotlight setup mutation access';
  end if;
  if has_function_privilege('anon', 'public.set_pick_event_spotlights(text,jsonb)', 'EXECUTE') then
    raise exception 'anonymous role inherited published Spotlight mutation access';
  end if;
end;
$$;

rollback;
