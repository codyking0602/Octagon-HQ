begin;

select set_config('request.jwt.claim.role', 'service_role', true);

-- Restore only the Longhorns preparation version if an earlier lifecycle proof rotated preparation flags.
update private.auction_catalog_versions
set is_preparation_version = true
where content_version = 'football-draft-room-longhorns-2005-2026-09-v1';

do $longhorns_playable$
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
begin
  if not exists (
    select 1
    from private.auction_catalog_versions version
    where version.game_id = 'draft-room-longhorns'
      and version.content_version = 'football-draft-room-longhorns-2005-2026-09-v1'
      and version.rarity_version = 'football-draft-room-longhorns-2005-rarity-2026-09-v1'
      and version.grading_version = 'football-draft-room-longhorns-2005-grading-2026-09-v1'
      and version.is_preparation_version
  ) then
    raise exception 'Longhorns Since 2005 playable catalog version is missing';
  end if;

  if private.auction_game_id_for_mode('longhorns-2005') <> 'draft-room'
    or private.auction_catalog_game_id_for_mode('longhorns-2005') <> 'draft-room-longhorns'
  then
    raise exception 'Longhorns mode lost shared Draft Room challenge ownership or private catalog ownership';
  end if;

  if (select count(*) from private.draft_room_longhorns_player_pool) <> 70 then
    raise exception 'Longhorns Since 2003 playable pool must contain 70 approved players';
  end if;

  if not exists (
    select 1 from private.draft_room_longhorns_player_pool
    where display_name = 'Derrick Johnson' and hidden_grade = 99
  ) or not exists (
    select 1 from private.draft_room_longhorns_player_pool
    where display_name = 'Cedric Benson' and hidden_grade = 97
  ) or not exists (
    select 1 from private.draft_room_longhorns_player_pool
    where display_name = 'Roy Williams' and hidden_grade = 95
  ) or not exists (
    select 1 from private.draft_room_longhorns_player_pool
    where display_name = 'Nathan Vasher' and hidden_grade = 94
  ) or not exists (
    select 1 from private.draft_room_longhorns_player_pool
    where display_name = 'Marcus Tubbs' and hidden_grade = 92
  ) or not exists (
    select 1 from private.draft_room_longhorns_player_pool
    where display_name = 'Bo Scaife' and hidden_grade = 87
  ) then
    raise exception 'Longhorns Since 2003 playable pool lost an approved 2003/2004 player';
  end if;

  insert into auth.users(
    id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data
  ) values
    (v_admin_a,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','stage14-longhorns-admin-a@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','STAGE 14 LONGHORNS ADMIN A','historical_unclaimed',true)),
    (v_admin_b,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','stage14-longhorns-admin-b@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','STAGE 14 LONGHORNS ADMIN B','historical_unclaimed',true)),
    (v_member,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','stage14-longhorns-member@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','STAGE 14 LONGHORNS MEMBER','historical_unclaimed',true));

  perform public.register_unclaimed_pin_profile(v_admin_a,'Stage 14 Longhorns Admin A','LA');
  perform public.register_unclaimed_pin_profile(v_admin_b,'Stage 14 Longhorns Admin B','LB');
  perform public.register_unclaimed_pin_profile(v_member,'Stage 14 Longhorns Member','LM');
  insert into public.pick_control_owners(profile_id) values (v_admin_a), (v_admin_b);

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform setseed(0.2005);
  perform set_config('request.jwt.claim.sub',v_admin_a::text,true);
  v_game := public.prepare_auction(v_admin_b, 'longhorns-2005');

  select auction.* into v_state
  from private.auction_games auction
  where auction.id = v_game;

  if v_state.mode_id <> 'longhorns-2005'
    or v_state.content_version <> 'football-draft-room-longhorns-2005-2026-09-v1'
    or v_state.grading_version <> 'football-draft-room-longhorns-2005-grading-2026-09-v1'
    or v_state.challenger_bankroll <> 40
    or v_state.recipient_bankroll <> 40
    or v_state.current_round <> 1
  then
    raise exception 'Longhorns room did not prepare the locked eight-round $40 contract: %', row_to_json(v_state);
  end if;

  if (select count(*) from private.auction_deck_entries where auction_id = v_game) <> 8
    or (select count(*) from private.draft_room_longhorns_board_entries where auction_id = v_game) <> 8
    or (select count(distinct player_reference) from private.draft_room_longhorns_board_entries where auction_id = v_game) <> 8
    or (select count(distinct strength_slot) from private.draft_room_longhorns_board_entries where auction_id = v_game) <> 8
  then
    raise exception 'Longhorns room must contain exactly eight unique calibrated players';
  end if;

  if (select count(distinct board_shape) from private.draft_room_longhorns_board_entries where auction_id = v_game) <> 1
    or (select count(distinct board_variant) from private.draft_room_longhorns_board_entries where auction_id = v_game) <> 1
  then
    raise exception 'Longhorns room did not keep one hidden board shape and variant';
  end if;

  if exists (
    select 1
    from private.draft_room_longhorns_board_entries entry
    join private.draft_room_longhorns_player_pool player
      on player.player_reference = entry.player_reference
    where entry.auction_id = v_game
      and (
        entry.display_name <> player.display_name
        or entry.position_group <> player.position_group
        or entry.grade_band <> player.grade_band
        or entry.grade_band <> private.draft_room_longhorns_grade_band(
          entry.board_shape,
          entry.board_variant,
          entry.strength_slot
        )
      )
  ) then
    raise exception 'Longhorns board entry drifted from the locked player pool or calibrated board shape';
  end if;

  select to_jsonb(state) into v_projection
  from public.get_auction_participant_state(v_game) state;

  if v_projection::text ~* 'hidden_grade|grade_band|board_shape|board_variant|strength_slot|position_group' then
    raise exception 'Longhorns participant projection leaked private calibration data';
  end if;

  if v_projection->'current_item' is null
    or nullif(v_projection->'current_item'->>'display_label','') is null
  then
    raise exception 'Longhorns participant projection did not expose the current player name';
  end if;

  select auction.revision into v_revision
  from private.auction_games auction
  where auction.id = v_game;

  perform public.send_auction_first_bid(v_game, v_revision, 5, null);

  select auction.revision into v_revision
  from private.auction_games auction
  where auction.id = v_game;

  perform set_config('request.jwt.claim.sub',v_admin_b::text,true);
  perform public.submit_auction_bid(v_game, 1, v_revision, 1, null);

  for i in 2..4 loop
    select auction.* into v_state
    from private.auction_games auction
    where auction.id = v_game;

    perform set_config('request.jwt.claim.sub',v_admin_a::text,true);
    perform public.submit_auction_bid(v_game, i, v_state.revision, 5, null);

    select auction.* into v_state
    from private.auction_games auction
    where auction.id = v_game;

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
    raise exception 'Longhorns room did not finish 4-v-4 with the shared forced-remainder architecture: %', row_to_json(v_state);
  end if;

  if (select count(*) from private.auction_awards where auction_id = v_game) <> 8 then
    raise exception 'Longhorns completion must record exactly eight awards';
  end if;

  if (
    select count(*)
    from private.auction_awards award
    left join private.auction_pending_bids challenger_bid
      on challenger_bid.auction_id = award.auction_id
      and challenger_bid.round_number = award.resolved_round
      and challenger_bid.bidder_id = v_admin_a
    left join private.auction_pending_bids recipient_bid
      on recipient_bid.auction_id = award.auction_id
      and recipient_bid.round_number = award.resolved_round
      and recipient_bid.bidder_id = v_admin_b
    where award.auction_id = v_game
      and award.resolved_round between 5 and 8
      and challenger_bid.amount is null
      and recipient_bid.amount is null
      and award.awarded_to = v_admin_b
  ) <> 4 then
    raise exception 'Longhorns remaining four players were not automatically assigned to the opponent';
  end if;

  select round(avg(player.hidden_grade), 2)
  into v_expected_a
  from private.auction_awards award
  join private.auction_deck_entries deck
    on deck.id = award.deck_entry_id and deck.auction_id = award.auction_id
  join private.draft_room_longhorns_board_entries entry
    on entry.auction_id = award.auction_id and entry.item_reference = deck.private_item_reference
  join private.draft_room_longhorns_player_pool player
    on player.player_reference = entry.player_reference
  where award.auction_id = v_game
    and award.awarded_to = v_admin_a;

  select round(avg(player.hidden_grade), 2)
  into v_expected_b
  from private.auction_awards award
  join private.auction_deck_entries deck
    on deck.id = award.deck_entry_id and deck.auction_id = award.auction_id
  join private.draft_room_longhorns_board_entries entry
    on entry.auction_id = award.auction_id and entry.item_reference = deck.private_item_reference
  join private.draft_room_longhorns_player_pool player
    on player.player_reference = entry.player_reference
  where award.auction_id = v_game
    and award.awarded_to = v_admin_b;

  if v_state.challenger_final_score <> v_expected_a
    or v_state.recipient_final_score <> v_expected_b
  then
    raise exception 'Longhorns final score is not the exact average of each four-player roster';
  end if;

  perform set_config('request.jwt.claim.sub',v_admin_a::text,true);
  select to_jsonb(state) into v_projection
  from public.get_auction_participant_state(v_game) state;

  if jsonb_array_length(v_projection->'awarded_collections') <> 8
    or v_projection::text ~* 'hidden_grade|grade_band|board_shape|board_variant|strength_slot|position_group'
  then
    raise exception 'Completed Longhorns projection is missing awards or leaks private grading metadata';
  end if;
end $longhorns_playable$;

rollback;
