begin;

select set_config('request.jwt.claim.role','service_role',true);

do $best_cfb_playable$
declare
  v_legacy_a uuid:=extensions.gen_random_uuid();
  v_legacy_b uuid:=extensions.gen_random_uuid();
  v_v2_a uuid:=extensions.gen_random_uuid();
  v_v2_b uuid:=extensions.gen_random_uuid();
  v_game uuid;
  v_state private.auction_games;
  v_revision bigint;
  v_expected_a numeric(5,2);
  v_expected_b numeric(5,2);
begin
  insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data) values
    (v_legacy_a,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','stage19-legacy-a@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','STAGE 19 LEGACY A','historical_unclaimed',true)),
    (v_legacy_b,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','stage19-legacy-b@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','STAGE 19 LEGACY B','historical_unclaimed',true)),
    (v_v2_a,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','stage19-v2-a@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','STAGE 19 V2 A','historical_unclaimed',true)),
    (v_v2_b,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','stage19-v2-b@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','STAGE 19 V2 B','historical_unclaimed',true));

  perform public.register_unclaimed_pin_profile(v_legacy_a,'Stage 19 Legacy A','LA');
  perform public.register_unclaimed_pin_profile(v_legacy_b,'Stage 19 Legacy B','LB');
  perform public.register_unclaimed_pin_profile(v_v2_a,'Stage 19 V2 A','VA');
  perform public.register_unclaimed_pin_profile(v_v2_b,'Stage 19 V2 B','VB');
  insert into public.pick_control_owners(profile_id) values(v_legacy_a),(v_legacy_b),(v_v2_a),(v_v2_b);

  -- Prepare a v1 room, then rotate preparation back to v2. The pinned v1 room must still finish on v1.
  update private.auction_catalog_versions set is_preparation_version=false where game_id='draft-room-cfb-best-teams';
  update private.auction_catalog_versions set is_preparation_version=true
  where content_version='football-draft-room-cfb-best-teams-2026-09-v1';

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_legacy_a::text,true);
  perform setseed(0.1919);
  v_game:=public.prepare_auction(v_legacy_b,'cfb-best-teams');

  select * into v_state from private.auction_games where id=v_game;
  if v_state.grading_version<>'football-draft-room-cfb-best-teams-grading-2026-09-v1'
    or exists(
      select 1 from private.draft_room_cfb_best_teams_board_entries e
      where e.auction_id=v_game and e.season_reference not like 'cfb-best-%'
    )
  then raise exception 'Pinned Best CFB Teams v1 room lost the legacy authority'; end if;

  update private.auction_catalog_versions set is_preparation_version=false where game_id='draft-room-cfb-best-teams';
  update private.auction_catalog_versions set is_preparation_version=true
  where content_version='football-draft-room-cfb-best-teams-2026-09-v2';

  select revision into v_revision from private.auction_games where id=v_game;
  perform public.send_auction_first_bid(v_game,v_revision,5,null);
  select revision into v_revision from private.auction_games where id=v_game;
  perform set_config('request.jwt.claim.sub',v_legacy_b::text,true);
  perform public.submit_auction_bid(v_game,1,v_revision,1,null);
  for i in 2..4 loop
    select revision into v_revision from private.auction_games where id=v_game;
    perform set_config('request.jwt.claim.sub',v_legacy_a::text,true);
    perform public.submit_auction_bid(v_game,i,v_revision,5,null);
    select revision into v_revision from private.auction_games where id=v_game;
    perform set_config('request.jwt.claim.sub',v_legacy_b::text,true);
    perform public.submit_auction_bid(v_game,i,v_revision,1,null);
  end loop;

  select * into v_state from private.auction_games where id=v_game;
  if v_state.lifecycle_state<>'completed' then raise exception 'Pinned Best CFB Teams v1 room no longer completes'; end if;

  -- A newly prepared room must use v2, draw only from the 257-team authority, and grade from v2.
  perform set_config('request.jwt.claim.sub',v_v2_a::text,true);
  perform setseed(0.2022);
  v_game:=public.prepare_auction(v_v2_b,'cfb-best-teams');

  select * into v_state from private.auction_games where id=v_game;
  if v_state.content_version<>'football-draft-room-cfb-best-teams-2026-09-v2'
    or v_state.grading_version<>'football-draft-room-cfb-best-teams-grading-2026-09-v2'
    or v_state.challenger_bankroll<>40 or v_state.recipient_bankroll<>40 or v_state.current_round<>1
  then raise exception 'New Best CFB Teams room did not prepare on v2'; end if;

  if (select count(*) from private.draft_room_cfb_best_teams_board_entries where auction_id=v_game)<>8
    or (select count(distinct season_reference) from private.draft_room_cfb_best_teams_board_entries where auction_id=v_game)<>8
    or exists(
      select 1
      from private.draft_room_cfb_best_teams_board_entries e
      left join private.cfb_best_teams_v2_authority p on p.season_reference=e.season_reference
      where e.auction_id=v_game and p.season_reference is null
    )
  then raise exception 'New Best CFB Teams room did not draw eight unique v2 seasons'; end if;

  select revision into v_revision from private.auction_games where id=v_game;
  perform public.send_auction_first_bid(v_game,v_revision,5,null);
  select revision into v_revision from private.auction_games where id=v_game;
  perform set_config('request.jwt.claim.sub',v_v2_b::text,true);
  perform public.submit_auction_bid(v_game,1,v_revision,1,null);
  for i in 2..4 loop
    select revision into v_revision from private.auction_games where id=v_game;
    perform set_config('request.jwt.claim.sub',v_v2_a::text,true);
    perform public.submit_auction_bid(v_game,i,v_revision,5,null);
    select revision into v_revision from private.auction_games where id=v_game;
    perform set_config('request.jwt.claim.sub',v_v2_b::text,true);
    perform public.submit_auction_bid(v_game,i,v_revision,1,null);
  end loop;

  select * into v_state from private.auction_games where id=v_game;
  if v_state.lifecycle_state<>'completed' or v_state.challenger_selection_count<>4 or v_state.recipient_selection_count<>4
  then raise exception 'Best CFB Teams v2 did not complete 4-v-4'; end if;

  select round(avg(p.hidden_grade),2) into v_expected_a
  from private.auction_awards a
  join private.auction_deck_entries d on d.id=a.deck_entry_id and d.auction_id=a.auction_id
  join private.draft_room_cfb_best_teams_board_entries e on e.auction_id=a.auction_id and e.item_reference=d.private_item_reference
  join private.cfb_best_teams_v2_authority p on p.season_reference=e.season_reference
  where a.auction_id=v_game and a.awarded_to=v_v2_a;

  select round(avg(p.hidden_grade),2) into v_expected_b
  from private.auction_awards a
  join private.auction_deck_entries d on d.id=a.deck_entry_id and d.auction_id=a.auction_id
  join private.draft_room_cfb_best_teams_board_entries e on e.auction_id=a.auction_id and e.item_reference=d.private_item_reference
  join private.cfb_best_teams_v2_authority p on p.season_reference=e.season_reference
  where a.auction_id=v_game and a.awarded_to=v_v2_b;

  if v_state.challenger_final_score<>v_expected_a or v_state.recipient_final_score<>v_expected_b
  then raise exception 'Best CFB Teams v2 final score is not the exact four-season average'; end if;
end;
$best_cfb_playable$;

rollback;
