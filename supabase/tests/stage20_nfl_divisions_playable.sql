begin;

select set_config('request.jwt.claim.role', 'service_role', true);

update private.auction_catalog_versions
set is_preparation_version = true
where content_version = 'football-draft-room-nfl-divisions-2026-09-v1';

do $nfl_divisions_playable$
declare
  v_admin_a uuid := extensions.gen_random_uuid();
  v_admin_b uuid := extensions.gen_random_uuid();
  v_member uuid := extensions.gen_random_uuid();
  v_game uuid;
  v_revision bigint;
  v_state private.auction_games;
  v_kind text;
  v_expected_a numeric(5,2);
  v_expected_b numeric(5,2);
  v_projection jsonb;
begin
  if private.auction_game_id_for_mode('nfl-divisions') <> 'draft-room'
    or private.auction_catalog_game_id_for_mode('nfl-divisions') <> 'draft-room-nfl-divisions'
  then
    raise exception 'NFL Divisions lost shared Draft Room ownership or private catalog ownership';
  end if;

  if (select count(*) from private.draft_room_nfl_divisions_pool) <> 128 then
    raise exception 'NFL Divisions pool lost a team-season';
  end if;

  insert into auth.users(
    id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data
  ) values
    (v_admin_a,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','stage20-nfl-divisions-a@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','STAGE 20 NFL DIVISIONS A','historical_unclaimed',true)),
    (v_admin_b,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','stage20-nfl-divisions-b@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','STAGE 20 NFL DIVISIONS B','historical_unclaimed',true)),
    (v_member,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','stage20-nfl-divisions-member@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','STAGE 20 NFL DIVISIONS MEMBER','historical_unclaimed',true));

  perform public.register_unclaimed_pin_profile(v_admin_a,'Stage20 NFL Div A','NA');
  perform public.register_unclaimed_pin_profile(v_admin_b,'Stage20 NFL Div B','NB');
  perform public.register_unclaimed_pin_profile(v_member,'Stage20 NFL Div Member','NM');
  insert into public.pick_control_owners(profile_id) values (v_admin_a), (v_admin_b);

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform setseed(0.1818);
  perform set_config('request.jwt.claim.sub',v_admin_a::text,true);
  v_game := public.prepare_auction(v_admin_b, 'nfl-divisions');

  select auction.* into v_state
  from private.auction_games auction
  where auction.id = v_game;

  if v_state.mode_id <> 'nfl-divisions'
    or v_state.content_version <> 'football-draft-room-nfl-divisions-2026-09-v1'
    or v_state.grading_version <> 'football-draft-room-nfl-divisions-grading-2026-09-v1'
    or v_state.challenger_bankroll <> 40
    or v_state.recipient_bankroll <> 40
    or v_state.current_round <> 1
  then
    raise exception 'NFL Divisions room did not prepare the locked eight-round $40 contract: %', row_to_json(v_state);
  end if;

  if (select count(*) from private.auction_deck_entries where auction_id = v_game) <> 8
    or (select count(*) from private.draft_room_nfl_divisions_board_entries where auction_id = v_game) <> 8
    or (select count(distinct subject_reference) from private.draft_room_nfl_divisions_board_entries where auction_id = v_game) <> 8
  then
    raise exception 'NFL Divisions room must contain exactly eight unique team-seasons';
  end if;

  select min(board_kind) into v_kind
  from private.draft_room_nfl_divisions_board_entries
  where auction_id = v_game;

  if v_kind = 'single' then
    if (select count(distinct division_one) from private.draft_room_nfl_divisions_board_entries where auction_id = v_game) <> 1
      or (select count(distinct division_two) from private.draft_room_nfl_divisions_board_entries where auction_id = v_game) <> 0
      or exists (
        select 1 from private.draft_room_nfl_divisions_board_entries
        where auction_id = v_game
        group by team_code
        having count(*) <> 2
      )
    then
      raise exception 'single NFL Divisions board drifted from two seasons per franchise';
    end if;
  elsif v_kind = 'split' then
    if (select count(distinct division_one) from private.draft_room_nfl_divisions_board_entries where auction_id = v_game) <> 1
      or (select count(distinct division_two) from private.draft_room_nfl_divisions_board_entries where auction_id = v_game) <> 1
      or exists (
        select 1 from private.draft_room_nfl_divisions_board_entries
        where auction_id = v_game
        group by team_code
        having count(*) <> 1
      )
    then
      raise exception 'split NFL Divisions board drifted from one season per franchise';
    end if;
  else
    raise exception 'NFL Divisions board kind is invalid: %', v_kind;
  end if;

  if exists (
    select 1
    from private.draft_room_nfl_divisions_board_entries
    where auction_id = v_game
      and item_reference not like subject_reference || '--board--%'
  ) then
    raise exception 'NFL Divisions item references lost board context';
  end if;

  select to_jsonb(state) into v_projection
  from public.get_auction_participant_state(v_game) state;

  if v_projection::text ~* 'hidden_grade|board_kind|division_one|division_two|subject_reference'
    or v_projection->'current_item' is null
    or nullif(v_projection->'current_item'->>'display_label','') is null
    or (v_projection->'current_item'->>'item_reference') not like '%--board--%'
  then
    raise exception 'NFL Divisions participant projection leaked private data or lost visible subject context';
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
    or (select count(*) from private.auction_awards where auction_id = v_game) <> 8
  then
    raise exception 'NFL Divisions room did not complete through the shared 4-v-4 lifecycle: %', row_to_json(v_state);
  end if;

  select round(avg(pool.hidden_grade), 2)
  into v_expected_a
  from private.auction_awards award
  join private.auction_deck_entries deck
    on deck.id = award.deck_entry_id and deck.auction_id = award.auction_id
  join private.draft_room_nfl_divisions_board_entries entry
    on entry.auction_id = award.auction_id and entry.item_reference = deck.private_item_reference
  join private.draft_room_nfl_divisions_pool pool
    on pool.season_reference = entry.subject_reference
  where award.auction_id = v_game and award.awarded_to = v_admin_a;

  select round(avg(pool.hidden_grade), 2)
  into v_expected_b
  from private.auction_awards award
  join private.auction_deck_entries deck
    on deck.id = award.deck_entry_id and deck.auction_id = award.auction_id
  join private.draft_room_nfl_divisions_board_entries entry
    on entry.auction_id = award.auction_id and entry.item_reference = deck.private_item_reference
  join private.draft_room_nfl_divisions_pool pool
    on pool.season_reference = entry.subject_reference
  where award.auction_id = v_game and award.awarded_to = v_admin_b;

  if v_state.challenger_final_score <> v_expected_a
    or v_state.recipient_final_score <> v_expected_b
  then
    raise exception 'NFL Divisions final score is not the exact average of each four-season roster';
  end if;
end $nfl_divisions_playable$;

rollback;
