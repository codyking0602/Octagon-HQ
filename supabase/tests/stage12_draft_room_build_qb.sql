begin;

select set_config('request.jwt.claim.role', 'service_role', true);

-- Frozen Auction fixture proofs rotate the UFC preparation pointer broadly.
-- Restore the independent Draft Room pointer inside this rollback-only proof.
update private.auction_catalog_versions
set is_preparation_version = true
where content_version = 'football-draft-room-2026-09-v1';

do $$
declare
  v_admin_a uuid := extensions.gen_random_uuid();
  v_admin_b uuid := extensions.gen_random_uuid();
  v_member uuid := extensions.gen_random_uuid();
  v_preview uuid;
  v_game uuid;
  v_revision bigint;
  v_round integer;
  v_code text;
  v_category_a text;
  v_category_b text;
  v_state private.auction_games;
  v_categories text[] := array['Arm','Accuracy','Processing','Mobility','Clutch'];
begin
  if private.draft_room_public_release_enabled() then
    raise exception 'Stage 12 Draft Room unexpectedly has its public release switch enabled';
  end if;

  if not exists (
    select 1
    from private.auction_catalog_versions version
    where version.game_id = 'draft-room'
      and version.content_version = 'football-draft-room-2026-09-v1'
      and version.rarity_version = 'football-draft-room-rarity-2026-09-v1'
      and version.grading_version = 'football-build-qb-traits-2026-09-v1'
      and version.is_preparation_version
  ) then
    raise exception 'Draft Room preparation version is missing';
  end if;

  if (
    select count(*)
    from private.auction_catalog catalog
    where catalog.content_version = 'football-draft-room-2026-09-v1'
      and catalog.mode_id = 'build-qb'
  ) <> 15 then
    raise exception 'Build a QB catalog must contain exactly 15 generated QB profiles';
  end if;

  if exists (
    select 1
    from private.auction_catalog catalog
    where catalog.content_version = 'football-draft-room-2026-09-v1'
      and catalog.mode_id = 'build-qb'
      and (
        not (catalog.grading_inputs ?& array['Arm','Accuracy','Processing','Mobility','Clutch','overall'])
        or (catalog.grading_inputs->>'Arm')::numeric not between 35 and 99
        or (catalog.grading_inputs->>'Accuracy')::numeric not between 35 and 99
        or (catalog.grading_inputs->>'Processing')::numeric not between 35 and 99
        or (catalog.grading_inputs->>'Mobility')::numeric not between 35 and 99
        or (catalog.grading_inputs->>'Clutch')::numeric not between 35 and 99
      )
  ) then
    raise exception 'Build a QB catalog contains invalid canonical trait grades';
  end if;

  insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data)
  values
    (v_admin_a,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'stage12-admin-a@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','STAGE 12 ADMIN A','historical_unclaimed',true)),
    (v_admin_b,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'stage12-admin-b@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','STAGE 12 ADMIN B','historical_unclaimed',true)),
    (v_member,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'stage12-member@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','STAGE 12 MEMBER','historical_unclaimed',true));

  perform public.register_unclaimed_pin_profile(v_admin_a,'Stage 12 Admin A','SA');
  perform public.register_unclaimed_pin_profile(v_admin_b,'Stage 12 Admin B','SB');
  perform public.register_unclaimed_pin_profile(v_member,'Stage 12 Member','SM');

  insert into public.pick_control_owners(profile_id) values (v_admin_a), (v_admin_b);

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_member::text,true);

  begin
    perform public.prepare_auction(v_admin_a, 'build-qb');
    raise exception 'regular member prepared an admin-only Draft Room';
  exception
    when others then
      if sqlerrm not like '%Draft Room admin preview access required for both players%' then
        raise;
      end if;
  end;

  perform set_config('request.jwt.claim.sub',v_admin_a::text,true);

  begin
    perform public.prepare_auction(v_member, 'build-qb');
    raise exception 'admin prepared Draft Room against a non-admin';
  exception
    when others then
      if sqlerrm not like '%Draft Room admin preview access required for both players%' then
        raise;
      end if;
  end;

  v_game := public.prepare_auction(v_admin_b, 'build-qb');

  select auction.* into v_state
  from private.auction_games auction
  where auction.id = v_game;

  if v_state.content_version <> 'football-draft-room-2026-09-v1'
    or v_state.challenger_bankroll <> 50
    or v_state.recipient_bankroll <> 50
    or v_state.current_round <> 1
  then
    raise exception 'prepared Draft Room did not pin the Stage 12 contract: %', row_to_json(v_state);
  end if;

  if (
    select count(*)
    from private.auction_deck_entries deck
    where deck.auction_id = v_game
  ) <> 10 then
    raise exception 'Build a QB deck must contain exactly ten QBs';
  end if;

  if (
    select count(distinct deck.private_item_reference)
    from private.auction_deck_entries deck
    where deck.auction_id = v_game
  ) <> 10 then
    raise exception 'Build a QB deck rerolled or duplicated QB identities';
  end if;

  select auction.revision into v_revision
  from private.auction_games auction
  where auction.id = v_game;

  v_code := public.send_auction_first_bid(v_game, v_revision, 5, 'Arm');

  if not exists (
    select 1
    from public.play_challenges challenge
    where challenge.code = v_code
      and challenge.game_id = 'draft-room'
      and challenge.game_version = 'football-draft-room-server-v1'
      and challenge.game_title = 'Draft Room'
      and challenge.summary = 'Build a QB'
      and challenge.play_url = '/football/draft-room?auction=' || v_game::text
  ) then
    raise exception 'Draft Room challenge did not use the canonical Football destination';
  end if;

  select auction.revision into v_revision
  from private.auction_games auction
  where auction.id = v_game;

  perform set_config('request.jwt.claim.sub',v_admin_b::text,true);
  perform public.submit_auction_bid(v_game, 1, v_revision, 4, 'Arm');

  for v_round in 2..10 loop
    select auction.* into v_state
    from private.auction_games auction
    where auction.id = v_game;

    exit when v_state.lifecycle_state = 'completed';

    select category into v_category_a
    from unnest(v_categories) with ordinality candidate(category, ordering)
    where not exists (
      select 1 from private.auction_awards award
      where award.auction_id = v_game
        and award.awarded_to = v_admin_a
        and award.visible_category = candidate.category
    )
    order by ordering
    limit 1;

    select category into v_category_b
    from unnest(v_categories) with ordinality candidate(category, ordering)
    where not exists (
      select 1 from private.auction_awards award
      where award.auction_id = v_game
        and award.awarded_to = v_admin_b
        and award.visible_category = candidate.category
    )
    order by ordering
    limit 1;

    if v_category_a is null or v_category_b is null then
      raise exception 'Build a QB category assignment exhausted before completion';
    end if;

    perform set_config('request.jwt.claim.sub',v_admin_a::text,true);
    perform public.submit_auction_bid(v_game, v_state.current_round, v_state.revision, 1, v_category_a);

    select auction.* into v_state
    from private.auction_games auction
    where auction.id = v_game;

    perform set_config('request.jwt.claim.sub',v_admin_b::text,true);
    perform public.submit_auction_bid(v_game, v_state.current_round, v_state.revision, 1, v_category_b);
  end loop;

  select auction.* into v_state
  from private.auction_games auction
  where auction.id = v_game;

  if v_state.lifecycle_state <> 'completed'
    or v_state.challenger_selection_count <> 5
    or v_state.recipient_selection_count <> 5
    or v_state.challenger_final_score not between 35 and 99
    or v_state.recipient_final_score not between 35 and 99
  then
    raise exception 'Build a QB did not complete through the shared sealed-bid lifecycle: %', row_to_json(v_state);
  end if;

  if exists (
    select 1
    from (
      select award.awarded_to, count(*) as total, count(distinct award.visible_category) as categories
      from private.auction_awards award
      where award.auction_id = v_game
      group by award.awarded_to
    ) result
    where result.total <> 5 or result.categories <> 5
  ) then
    raise exception 'completed Build a QB did not assign five unique traits per player';
  end if;

  if not exists (
    select 1
    from public.play_challenges challenge
    where challenge.code = v_code
      and challenge.completed_at is not null
      and (challenge.creator_result->>'overall_score')::numeric = v_state.challenger_final_score
      and (challenge.responder_result->>'overall_score')::numeric = v_state.recipient_final_score
  ) then
    raise exception 'Draft Room completion did not persist through the canonical challenge record';
  end if;
end $$;

rollback;
