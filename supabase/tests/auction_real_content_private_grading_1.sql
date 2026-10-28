select set_config('request.jwt.claim.role', 'service_role', true);

create or replace function pg_temp.set_actor(p_actor uuid)
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
  v_challenger constant uuid := '00000000-0000-0000-0000-0000000000b1';
  v_recipient constant uuid := '00000000-0000-0000-0000-0000000000b2';
begin
  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, raw_user_meta_data
  ) values
    (v_challenger, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'auction-pr5-b1@login.octagon-hq.app', '', now(), now(), now(), '{}'::jsonb),
    (v_recipient, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'auction-pr5-b2@login.octagon-hq.app', '', now(), now(), now(), '{}'::jsonb);

  insert into public.profiles (id, display_name, normalized_name, initials) values
    (v_challenger, 'Auction PR5 Challenger', 'AUCTION PR5 CHALLENGER', 'PC'),
    (v_recipient, 'Auction PR5 Recipient', 'AUCTION PR5 RECIPIENT', 'PR');
end;
$$;

do $$
declare
  v_expected jsonb := '{
    "ultimate-fighter": 30,
    "jon-jones-performances": 12,
    "conor-mcgregor-performances": 10,
    "charles-oliveira-performances": 12,
    "fighter-performances": 24,
    "strikers": 16,
    "grapplers": 16,
    "knockout-artists": 16,
    "greatest-ufc-card": 24,
    "championship-performances": 24,
    "finishes": 24,
    "dominant-performances": 24,
    "wars": 24,
    "rivalries": 24,
    "iconic-moments": 24,
    "nicknames": 24
  }'::jsonb;
  v_mode text;
  v_count integer;
begin
  if (
    select count(*)
    from private.auction_catalog_versions
    where is_preparation_version
  ) <> 1
    or not exists (
      select 1
      from private.auction_catalog_versions
      where content_version = 'ufc-auction-2026-08-v1'
        and rarity_version = 'balanced-rarity-2026-08-v1'
        and grading_version = 'ufc-private-grader-2026-08-v1'
        and is_preparation_version
    )
  then
    raise exception 'PR5 preparation versions are not the single active tuple';
  end if;

  if (
    select count(*)
    from private.auction_catalog
    where content_version = 'ufc-auction-2026-08-v1'
  ) <> 328 then
    raise exception 'PR5 catalog does not contain the reviewed 328-item snapshot';
  end if;

  for v_mode, v_count in
    select key, value::integer
    from jsonb_each_text(v_expected)
  loop
    if (
      select count(*)
      from private.auction_catalog
      where content_version = 'ufc-auction-2026-08-v1'
        and mode_id = v_mode
    ) <> v_count then
      raise exception 'PR5 catalog count is wrong for %', v_mode;
    end if;
  end loop;

  if exists (
    select 1
    from private.auction_catalog
    where content_version = 'ufc-auction-2026-08-v1'
    group by mode_id, item_reference
    having count(*) <> 1
  ) or exists (
    select 1
    from private.auction_catalog
    where content_version = 'ufc-auction-2026-08-v1'
    group by mode_id, lower(display_label)
    having count(*) <> 1
  ) then
    raise exception 'PR5 catalog contains duplicate references or labels';
  end if;

  if exists (
    select 1
    from private.auction_catalog catalog
    cross join lateral jsonb_each_text(catalog.grading_inputs) grade
    where catalog.content_version = 'ufc-auction-2026-08-v1'
      and grade.value::numeric not between 0 and 100
  ) then
    raise exception 'PR5 catalog contains an out-of-range private grade';
  end if;

  if exists (
    select 1
    from private.auction_catalog catalog
    where catalog.content_version = 'ufc-auction-2026-08-v1'
      and catalog.mode_id <> 'ultimate-fighter'
      and (
        not catalog.grading_inputs ? 'overall'
        or (select count(*) from jsonb_object_keys(catalog.grading_inputs)) <> 1
      )
  ) then
    raise exception 'ordinary Auction modes contain non-scalar grading inputs';
  end if;

  if exists (
    select 1
    from private.auction_catalog catalog
    where catalog.content_version = 'ufc-auction-2026-08-v1'
      and catalog.mode_id = 'ultimate-fighter'
      and not (catalog.grading_inputs ?& array['overall', 'Striking', 'Grappling', 'Frame', 'Power', 'Heart'])
  ) then
    raise exception 'Ultimate Fighter grading inputs are incomplete';
  end if;

  if not exists (
    select 1
    from private.auction_catalog
    where content_version = 'ufc-auction-2026-08-v1'
      and mode_id = 'ultimate-fighter'
      and display_label = 'Jon Jones'
      and private_generation_class = 'mythic'
      and grading_inputs->>'overall' = '99'
  ) then
    raise exception 'Jon Jones is not the 99 OVR mythic benchmark';
  end if;

  if exists (
    select 1
    from private.auction_catalog
    where content_version = 'ufc-auction-2026-08-v1'
      and display_label ~* '(Pride|Strikeforce|WEC|Bellator|ONE Championship|regional)'
  ) then
    raise exception 'non-UFC content entered the PR5 catalog';
  end if;

  if has_table_privilege('authenticated', 'private.auction_catalog', 'SELECT')
    or has_table_privilege('authenticated', 'private.auction_catalog_versions', 'SELECT')
    or has_function_privilege('authenticated', 'private.grade_auction(uuid)', 'EXECUTE')
    or has_function_privilege('authenticated', 'private.generate_auction_deck(uuid,text,text,integer,double precision[])', 'EXECUTE')
  then
    raise exception 'private Auction content or grading ownership leaked to browser roles';
  end if;
end;
$$;

do $$
declare
  v_challenger constant uuid := '00000000-0000-0000-0000-0000000000b1';
  v_recipient constant uuid := '00000000-0000-0000-0000-0000000000b2';
  v_one constant uuid := '00000000-0000-0000-0000-0000000000d3';
  v_two constant uuid := '00000000-0000-0000-0000-0000000000d4';
  v_order double precision[];
  v_deck_one text[];
  v_deck_two text[];
begin
  insert into private.auction_games (
    id, challenger_id, recipient_id, mode_id, lifecycle_state,
    content_version, rarity_version, grading_version,
    tie_priority_profile_id, challenger_bankroll, recipient_bankroll
  ) values
    (v_one, v_challenger, v_recipient, 'ultimate-fighter', 'abandoned',
      'ufc-auction-2026-08-v1', 'balanced-rarity-2026-08-v1', 'ufc-private-grader-2026-08-v1',
      v_challenger, 50, 50),
    (v_two, v_challenger, v_recipient, 'ultimate-fighter', 'abandoned',
      'ufc-auction-2026-08-v1', 'balanced-rarity-2026-08-v1', 'ufc-private-grader-2026-08-v1',
      v_challenger, 50, 50);

  select array_agg(series.value::double precision order by series.value)
    into v_order
  from generate_series(1, 30) series(value);

  perform private.generate_auction_deck(v_one, 'ufc-auction-2026-08-v1', 'ultimate-fighter', 10, v_order);
  perform private.generate_auction_deck(v_two, 'ufc-auction-2026-08-v1', 'ultimate-fighter', 10, v_order);

  select array_agg(private_item_reference order by deck_position)
    into v_deck_one
  from private.auction_deck_entries
  where auction_id = v_one;

  select array_agg(private_item_reference order by deck_position)
    into v_deck_two
  from private.auction_deck_entries
  where auction_id = v_two;

  if v_deck_one is distinct from v_deck_two
    or cardinality(v_deck_one) <> 10
    or (select count(distinct item) from unnest(v_deck_one) item) <> 10
  then
    raise exception 'PR5 deterministic weighted generation is not reproducible and unique';
  end if;

  if (
    select count(*)
    from private.auction_deck_entries deck
    join private.auction_catalog catalog
      on catalog.content_version = 'ufc-auction-2026-08-v1'
      and catalog.mode_id = 'ultimate-fighter'
      and catalog.item_reference = deck.private_item_reference
    where deck.auction_id = v_one
      and catalog.private_generation_class in ('mythic', 'crown')
  ) > 2 or (
    select count(*)
    from private.auction_deck_entries deck
    join private.auction_catalog catalog
      on catalog.content_version = 'ufc-auction-2026-08-v1'
      and catalog.mode_id = 'ultimate-fighter'
      and catalog.item_reference = deck.private_item_reference
    where deck.auction_id = v_one
      and catalog.rarity_band >= 4
  ) > 4 then
    raise exception 'PR5 Ultimate Fighter deck exceeded its high-end safeguards';
  end if;
end;
$$;
