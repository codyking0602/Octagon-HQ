begin;

select set_config('request.jwt.claim.role', 'service_role', true);

do $longhorns_runtime$
declare
  v_admin_a uuid := extensions.gen_random_uuid();
  v_admin_b uuid := extensions.gen_random_uuid();
  v_member uuid := extensions.gen_random_uuid();
  v_game uuid;
  v_revision bigint;
  v_state private.auction_games;
  v_expected_a numeric(5,2);
  v_expected_b numeric(5,2);
  v_projection jsonb;
  v_board private.draft_room_longhorns_boards;
  v_actual_bands jsonb;
  v_expected_bands jsonb;
  v_code text;
begin
  if private.draft_room_public_release_enabled() then
    raise exception 'Longhorns Draft Room unexpectedly has public release enabled';
  end if;

  if not exists (
    select 1
    from private.auction_catalog_versions version
    where version.game_id = 'draft-room-longhorns'
      and version.content_version = 'football-draft-room-longhorns-2005-2026-09-v1'
      and version.rarity_version = 'football-draft-room-longhorns-rarity-2026-09-v1'
      and version.grading_version = 'football-draft-room-longhorns-grading-2026-09-v1'
      and version.is_preparation_version
  ) then
    raise exception 'Longhorns runtime preparation version is missing';
  end if;

  if (select count(*) from private.draft_room_longhorns_player_pool) <> 64
    or (
      select count(*)
      from private.auction_catalog
      where content_version = 'football-draft-room-longhorns-2005-2026-09-v1'
        and mode_id = 'longhorns-2005'
    ) <> 64
  then
    raise exception 'Longhorns runtime did not preserve the 64-player approved population';
  end if;

  insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data)
  values
    (v_admin_a,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','stage14-longhorns-admin-a@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','STAGE 14 LONGHORNS ADMIN A','historical_unclaimed',true)),
    (v_admin_b,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','stage14-longhorns-admin-b@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','STAGE 14 LONGHORNS ADMIN B','historical_unclaimed',true)),
    (v_member,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','stage14-longhorns-member@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','STAGE 14 LONGHORNS MEMBER','historical_unclaimed',true));

  perform public.register_unclaimed_pin_profile(v_admin_a,'Stage 14 Longhorns Admin A','LA');
  perform public.register_unclaimed_pin_profile(v_admin_b,'Stage 14 Longhorns Admin B','LB');
  perform public.register_unclaimed_pin_profile(v_member,'Stage 14 Longhorns Member','LM');
  insert into public.pick_control_owners(profile_id) values (v_admin_a), (v_admin_b);

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_member::text,true);
  begin
    perform public.prepare_auction(v_admin_a, 'longhorns-2005');
    raise exception 'regular member prepared an admin-only Longhorns room';
  exception when others then
    if sqlerrm not like '%Draft Room admin preview access required for both players%' then raise; end if;
  end;

  perform setseed(0.2005);
  perform set_config('request.jwt.claim.sub',v_admin_a::text,true);
  v_game := public.prepare_auction(v_admin_b, 'longhorns-2005');

  select auction.* into v_state
  from private.auction_games auction
  where auction.id = v_game;

  if v_state.content_version <> 'football-draft-room-longhorns-2005-2026-09-v1'
    or v_state.mode_id <> 'longhorns-2005'
    or v_state.challenger_bankroll <> 40
    or v_state.recipient_bankroll <> 40
    or v_state.current_round <> 1
  then
    raise exception 'Longhorns did not prepare the locked 8-round $40 contract: %', row_to_json(v_state);
  end if;

  if (select count(*) from private.auction_deck_entries where auction_id = v_game) <> 8
    or (select count(distinct private_item_reference) from private.auction_deck_entries where auction_id = v_game) <> 8
  then
    raise exception 'Longhorns room must contain eight distinct players';
  end if;

  if exists (
    select 1
    from private.auction_deck_entries deck
    where deck.auction_id = v_game
      and not exists (
        select 1
        from private.draft_room_longhorns_player_pool player
        where player.player_reference = deck.private_item_reference
      )
  ) then
    raise exception 'Longhorns runtime deck escaped the approved player pool';
  end if;

  select board.* into v_board
  from private.draft_room_longhorns_boards board
  where board.auction_id = v_game;

  if v_board.auction_id is null then
    raise exception 'Longhorns runtime did not persist its private board identity';
  end if;

  select jsonb_object_agg(grade_band, player_count)
  into v_actual_bands
  from (
    select player.grade_band, count(*) player_count
    from private.auction_deck_entries deck
    join private.draft_room_longhorns_player_pool player
      on player.player_reference = deck.private_item_reference
    where deck.auction_id = v_game
    group by player.grade_band
  ) counts;

  select jsonb_object_agg(grade_band, band_count)
  into v_expected_bands
  from (
    select grade_band, count(*) band_count
    from private.draft_room_longhorns_board_variants variant,
      unnest(variant.grade_bands) grade_band
    where variant.shape = v_board.shape
      and variant.variant = v_board.variant
    group by grade_band
  ) counts;

  if v_actual_bands <> v_expected_bands then
    raise exception 'Longhorns generated deck does not match its hidden board variant: actual %, expected %',
      v_actual_bands, v_expected_bands;
  end if;

  select auction.revision into v_revision
  from private.auction_games auction
  where auction.id = v_game;

  v_code := public.send_auction_first_bid(v_game, v_revision, 5, null);

  if not exists (
    select 1
    from public.play_challenges challenge
    where challenge.code = v_code
      and challenge.game_id = 'draft-room'
      and challenge.summary = 'Longhorns Since 2005'
      and challenge.play_url = '/football/draft-room?auction=' || v_game::text
  ) then
    raise exception 'Longhorns challenge did not use the shared Draft Room identity';
  end if;

  select auction.revision into v_revision
  from private.auction_games auction
  where auction.id = v_game;

  perform set_config('request.jwt.claim.sub',v_admin_b::text,true);
  perform public.submit_auction_bid(v_game, 1, v_revision, 1, null);

  for i in 2..4 loop
    select auction.* into v_state from private.auction_games auction where auction.id = v_game;
    perform set_config('request.jwt.claim.sub',v_admin_a::text,true);
    perform public.submit_auction_bid(v_game, i, v_state.revision, 5, null);

    select auction.* into v_state from private.auction_games auction where auction.id = v_game;
    perform set_config('request.jwt.claim.sub',v_admin_b::text,true);
    perform public.submit_auction_bid(v_game, i, v_state.revision, 1, null);
  end loop;

  select auction.* into v_state
  from private.auction_games auction
  where auction.id = v_game;

  if v_state.lifecycle_state <> 'completed'
    or v_state.challenger_selection_count <> 4
    or v_state.recipient_selection_count <> 4
    or v_state.challenger_bankroll <> 20
    or v_state.recipient_bankroll <> 36
  then
    raise exception 'Longhorns did not finish 4-v-4 with the forced remainder: %', row_to_json(v_state);
  end if;

  if (select count(*) from private.auction_awards where auction_id = v_game) <> 8 then
    raise exception 'Longhorns completion must record exactly eight awards';
  end if;

  select round(avg(player.hidden_grade), 2)
  into v_expected_a
  from private.auction_awards award
  join private.auction_deck_entries deck
    on deck.id = award.deck_entry_id and deck.auction_id = award.auction_id
  join private.draft_room_longhorns_player_pool player
    on player.player_reference = deck.private_item_reference
  where award.auction_id = v_game
    and award.awarded_to = v_admin_a;

  select round(avg(player.hidden_grade), 2)
  into v_expected_b
  from private.auction_awards award
  join private.auction_deck_entries deck
    on deck.id = award.deck_entry_id and deck.auction_id = award.auction_id
  join private.draft_room_longhorns_player_pool player
    on player.player_reference = deck.private_item_reference
  where award.auction_id = v_game
    and award.awarded_to = v_admin_b;

  if v_state.challenger_final_score <> v_expected_a
    or v_state.recipient_final_score <> v_expected_b
  then
    raise exception 'Longhorns final score is not the exact average of the four players won';
  end if;

  perform set_config('request.jwt.claim.sub',v_admin_a::text,true);
  select to_jsonb(state) into v_projection
  from public.get_auction_participant_state(v_game) state;

  if v_projection::text ~* 'hidden_grade|grade_band|shape|variant|grading_inputs' then
    raise exception 'Longhorns participant projection leaked private grading or generation metadata';
  end if;

  if jsonb_array_length(v_projection->'awarded_collections') <> 8
    or exists (
      select 1
      from jsonb_array_elements(v_projection->'awarded_collections') award
      where nullif(award->>'display_label', '') is null
    )
  then
    raise exception 'Longhorns participant projection did not expose all eight player labels';
  end if;
end $longhorns_runtime$;

rollback;
