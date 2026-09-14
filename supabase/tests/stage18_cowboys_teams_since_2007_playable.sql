begin;

select set_config('request.jwt.claim.role', 'service_role', true);

update private.auction_catalog_versions
set is_preparation_version = true
where content_version = 'football-draft-room-cowboys-teams-2007-2026-09-v1';

do $cowboys_teams_playable$
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
  if private.draft_room_public_release_enabled() then
    raise exception 'Cowboys Teams wiring unexpectedly enabled the public Draft Room release switch';
  end if;

  if not exists (
    select 1 from private.auction_catalog_versions version
    where version.game_id = 'draft-room-cowboys-teams'
      and version.content_version = 'football-draft-room-cowboys-teams-2007-2026-09-v1'
      and version.rarity_version = 'football-draft-room-cowboys-teams-2007-board-2026-09-v1'
      and version.grading_version = 'football-draft-room-cowboys-teams-2007-grading-2026-09-v1'
      and version.is_preparation_version
  ) then
    raise exception 'Cowboys Teams playable catalog version is missing';
  end if;

  if private.auction_game_id_for_mode('cowboys-teams-2007') <> 'draft-room'
    or private.auction_catalog_game_id_for_mode('cowboys-teams-2007') <> 'draft-room-cowboys-teams'
  then
    raise exception 'Cowboys Teams lost shared Draft Room ownership or private catalog ownership';
  end if;

  if (select count(*) from private.draft_room_cowboys_teams_pool) <> 19
    or exists (
      select 1 from private.draft_room_cowboys_teams_pool
      where season_year < 2007 or season_year > 2025
    )
    or exists (
      select 1 from private.draft_room_cowboys_teams_pool where season_year = 2026
    )
  then
    raise exception 'Cowboys Teams eligibility must be completed 2007-2025 seasons only';
  end if;

  if not exists (
    select 1 from private.draft_room_cowboys_teams_pool
    where season_year = 2007 and hidden_grade = 97 and quality_band = 'A'
  ) or not exists (
    select 1 from private.draft_room_cowboys_teams_pool
    where season_year = 2014 and hidden_grade = 95 and quality_band = 'A'
  ) or not exists (
    select 1 from private.draft_room_cowboys_teams_pool
    where season_year = 2018 and hidden_grade = 86 and quality_band = 'B'
  ) or not exists (
    select 1 from private.draft_room_cowboys_teams_pool
    where season_year = 2015 and hidden_grade = 58 and quality_band = 'E'
  ) then
    raise exception 'Cowboys Teams approved grading anchors drifted';
  end if;

  insert into auth.users(
    id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data
  ) values
    (v_admin_a,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','stage18-cowboys-teams-admin-a@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','STAGE 18 COWBOYS TEAMS ADMIN A','historical_unclaimed',true)),
    (v_admin_b,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','stage18-cowboys-teams-admin-b@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','STAGE 18 COWBOYS TEAMS ADMIN B','historical_unclaimed',true)),
    (v_member,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','stage18-cowboys-teams-member@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','STAGE 18 COWBOYS TEAMS MEMBER','historical_unclaimed',true));

  perform public.register_unclaimed_pin_profile(v_admin_a,'Stage 18 Cowboys Teams Admin A','CA');
  perform public.register_unclaimed_pin_profile(v_admin_b,'Stage 18 Cowboys Teams Admin B','CB');
  perform public.register_unclaimed_pin_profile(v_member,'Stage 18 Cowboys Teams Member','CM');
  insert into public.pick_control_owners(profile_id) values (v_admin_a), (v_admin_b);

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_member::text,true);
  begin
    perform public.prepare_auction(v_admin_a, 'cowboys-teams-2007');
    raise exception 'regular member prepared an admin-only Cowboys Teams room';
  exception when others then
    if sqlerrm not like '%Draft Room admin preview access required for both players%' then raise; end if;
  end;

  perform setseed(0.2007);
  perform set_config('request.jwt.claim.sub',v_admin_a::text,true);
  v_game := public.prepare_auction(v_admin_b, 'cowboys-teams-2007');

  select auction.* into v_state from private.auction_games auction where auction.id = v_game;

  if v_state.mode_id <> 'cowboys-teams-2007'
    or v_state.content_version <> 'football-draft-room-cowboys-teams-2007-2026-09-v1'
    or v_state.grading_version <> 'football-draft-room-cowboys-teams-2007-grading-2026-09-v1'
    or v_state.challenger_bankroll <> 40
    or v_state.recipient_bankroll <> 40
    or v_state.current_round <> 1
  then
    raise exception 'Cowboys Teams room did not prepare the locked eight-round $40 contract: %', row_to_json(v_state);
  end if;

  if (select count(*) from private.auction_deck_entries where auction_id = v_game) <> 8
    or (select count(*) from private.draft_room_cowboys_teams_board_entries where auction_id = v_game) <> 8
    or (select count(distinct season_reference) from private.draft_room_cowboys_teams_board_entries where auction_id = v_game) <> 8
    or (select count(distinct strength_slot) from private.draft_room_cowboys_teams_board_entries where auction_id = v_game) <> 8
  then
    raise exception 'Cowboys Teams room must contain exactly eight unique calibrated seasons';
  end if;

  if exists (
    select 1
    from private.draft_room_cowboys_teams_board_entries entry
    join private.draft_room_cowboys_teams_pool season on season.season_reference = entry.season_reference
    where entry.auction_id = v_game
      and (
        entry.display_label <> season.display_label
        or entry.season_year <> season.season_year
        or entry.quality_band <> season.quality_band
        or entry.quality_band <> private.draft_room_cowboys_teams_quality_band(entry.board_shape, entry.board_variant, entry.strength_slot)
        or entry.display_label !~ '^[0-9]{4} Cowboys$'
      )
  ) then
    raise exception 'Cowboys Teams board entry drifted from the locked season pool or lost the visible year';
  end if;

  select to_jsonb(state) into v_projection from public.get_auction_participant_state(v_game) state;
  if v_projection::text ~* 'hidden_grade|quality_band|board_shape|board_variant|strength_slot' then
    raise exception 'Cowboys Teams participant projection leaked private calibration data';
  end if;
  if v_projection->'current_item' is null
    or coalesce(v_projection->'current_item'->>'display_label','') !~ '^[0-9]{4} Cowboys$'
  then
    raise exception 'Cowboys Teams participant projection did not preserve the season year';
  end if;

  select auction.revision into v_revision from private.auction_games auction where auction.id = v_game;
  perform public.send_auction_first_bid(v_game, v_revision, 5, null);

  select auction.revision into v_revision from private.auction_games auction where auction.id = v_game;
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

  select auction.* into v_state from private.auction_games auction where auction.id = v_game;
  if v_state.lifecycle_state <> 'completed'
    or v_state.challenger_selection_count <> 4
    or v_state.recipient_selection_count <> 4
    or v_state.challenger_bankroll <> 20
    or v_state.recipient_bankroll <> 36
  then
    raise exception 'Cowboys Teams room did not finish 4-v-4 with forced remainder: %', row_to_json(v_state);
  end if;

  if (select count(*) from private.auction_awards where auction_id = v_game) <> 8 then
    raise exception 'Cowboys Teams completion must record exactly eight awards';
  end if;

  select round(avg(season.hidden_grade), 2) into v_expected_a
  from private.auction_awards award
  join private.auction_deck_entries deck on deck.id = award.deck_entry_id and deck.auction_id = award.auction_id
  join private.draft_room_cowboys_teams_board_entries entry on entry.auction_id = award.auction_id and entry.item_reference = deck.private_item_reference
  join private.draft_room_cowboys_teams_pool season on season.season_reference = entry.season_reference
  where award.auction_id = v_game and award.awarded_to = v_admin_a;

  select round(avg(season.hidden_grade), 2) into v_expected_b
  from private.auction_awards award
  join private.auction_deck_entries deck on deck.id = award.deck_entry_id and deck.auction_id = award.auction_id
  join private.draft_room_cowboys_teams_board_entries entry on entry.auction_id = award.auction_id and entry.item_reference = deck.private_item_reference
  join private.draft_room_cowboys_teams_pool season on season.season_reference = entry.season_reference
  where award.auction_id = v_game and award.awarded_to = v_admin_b;

  if v_state.challenger_final_score <> v_expected_a or v_state.recipient_final_score <> v_expected_b then
    raise exception 'Cowboys Teams final score is not the exact average of each four-season group';
  end if;

  perform set_config('request.jwt.claim.sub',v_admin_a::text,true);
  select to_jsonb(state) into v_projection from public.get_auction_participant_state(v_game) state;
  if jsonb_array_length(v_projection->'awarded_collections') <> 8
    or v_projection::text ~* 'hidden_grade|quality_band|board_shape|board_variant|strength_slot'
    or exists (
      select 1 from jsonb_array_elements(v_projection->'awarded_collections') item
      where coalesce(item->>'display_label','') !~ '^[0-9]{4} Cowboys$'
    )
  then
    raise exception 'Completed Cowboys Teams result is incomplete, leaks grades, or hides the season year';
  end if;
end $cowboys_teams_playable$;

rollback;
