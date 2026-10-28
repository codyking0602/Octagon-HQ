begin;

select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  required_procedure text;
  required_relation text;
  fixture_profile_id uuid := extensions.gen_random_uuid();
  member_row record;
begin
  if to_regprocedure('public.import_v1_history_atomic(jsonb)') is not null then
    raise exception 'atomic V1 history import RPC still resolves';
  end if;

  if to_regprocedure('public.import_v1_history_atomic_reconciled(jsonb)') is not null then
    raise exception 'reconciled V1 history import RPC still resolves';
  end if;

  foreach required_procedure in array array[
    'public.claim_unclaimed_pin_profile(text,text)',
    'public.verify_profile_pin(text,text)',
    'public.list_member_cards()',
    'public.get_member_profile(text)',
    'public.record_my_find_leader_attempt(date,integer,timestamp with time zone)',
    'public.set_my_avatar_photo(text)'
  ] loop
    if to_regprocedure(required_procedure) is null then
      raise exception 'required durable procedure is missing: %', required_procedure;
    end if;
  end loop;

  foreach required_relation in array array[
    'public.profiles',
    'public.profile_preferences',
    'public.pick_events',
    'public.pick_bouts',
    'public.profile_event_picks',
    'public.find_leader_history'
  ] loop
    if to_regclass(required_relation) is null then
      raise exception 'required durable relation is missing: %', required_relation;
    end if;
  end loop;

  insert into auth.users(
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at
  ) values (
    fixture_profile_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'retired-import-history-fixture@login.octagon-hq.app',
    '',
    now(),
    now(),
    now()
  );

  insert into public.profiles(id, display_name, normalized_name, initials)
  values(fixture_profile_id, 'HISTORY FIXTURE', 'HISTORY FIXTURE', 'HF');

  insert into public.find_leader_history(
    profile_id,
    day,
    official_score,
    best_score,
    attempts,
    completed_at,
    updated_at
  ) values (
    fixture_profile_id,
    '2026-07-01',
    10,
    10,
    1,
    '2026-07-01T12:00:00Z',
    now()
  );

  insert into public.pick_events(
    event_id,
    name,
    subtitle,
    venue,
    location,
    starts_at,
    locks_at,
    season,
    status,
    updated_at
  ) values (
    'retired-import-history-fixture',
    'Retired import history fixture',
    '',
    '',
    '',
    '2026-07-01T00:00:00Z',
    '2026-07-01T00:00:00Z',
    2026,
    'complete',
    now()
  );

  insert into public.pick_bouts(
    event_id,
    bout_id,
    position,
    weight_class,
    red_fighter_slug,
    red_fighter_name,
    blue_fighter_slug,
    blue_fighter_name,
    winner_fighter_slug
  ) values (
    'retired-import-history-fixture',
    'retired-import-history-fixture-1',
    1,
    'Test',
    'alpha',
    'Alpha',
    'beta',
    'Beta',
    'alpha'
  );

  insert into public.profile_event_picks(
    profile_id,
    event_id,
    bout_id,
    fighter_slug,
    picked_at,
    updated_at
  ) values (
    fixture_profile_id,
    'retired-import-history-fixture',
    'retired-import-history-fixture-1',
    'alpha',
    '2026-07-01T00:00:00Z',
    '2026-07-01T00:00:00Z'
  );

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', fixture_profile_id::text, true);

  select * into member_row
  from public.get_member_profile('history fixture');

  if member_row.display_name <> 'HISTORY FIXTURE'
     or member_row.recorded_days <> 1
     or member_row.best_find_leader_score <> 10
     or member_row.picks_correct <> 1
     or member_row.picks_incorrect <> 0
     or member_row.picks_events_entered <> 1 then
    raise exception 'durable imported-style history is not readable through the member profile projection';
  end if;
end $$;

rollback;
