begin;

select set_config('request.jwt.claim.role','service_role',true);

update private.auction_catalog_versions
set is_preparation_version=true
where content_version='football-draft-room-cfb-best-teams-2026-09-v1';

do $best_cfb_playable$
declare
  v_admin_a uuid:=extensions.gen_random_uuid();
  v_admin_b uuid:=extensions.gen_random_uuid();
  v_game uuid;
  v_state private.auction_games;
  v_revision bigint;
  v_projection jsonb;
  v_expected_a numeric(5,2);
  v_expected_b numeric(5,2);
  v_kind text;
  v_nd boolean;
begin
  insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data) values
    (v_admin_a,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','stage19-best-cfb-a@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','STAGE 19 BEST CFB A','historical_unclaimed',true)),
    (v_admin_b,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','stage19-best-cfb-b@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','STAGE 19 BEST CFB B','historical_unclaimed',true));

  perform public.register_unclaimed_pin_profile(v_admin_a,'Stage 19 Best CFB A','BA');
  perform public.register_unclaimed_pin_profile(v_admin_b,'Stage 19 Best CFB B','BB');
  insert into public.pick_control_owners(profile_id) values(v_admin_a),(v_admin_b);

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_admin_a::text,true);
  perform setseed(0.1919);
  v_game:=public.prepare_auction(v_admin_b,'cfb-best-teams');

  select * into v_state from private.auction_games where id=v_game;
  if v_state.mode_id<>'cfb-best-teams'
    or v_state.content_version<>'football-draft-room-cfb-best-teams-2026-09-v1'
    or v_state.challenger_bankroll<>40 or v_state.recipient_bankroll<>40 or v_state.current_round<>1
  then raise exception 'Best CFB Teams did not prepare the locked 8-round $40 room'; end if;

  if (select count(*) from private.draft_room_cfb_best_teams_board_entries where auction_id=v_game)<>8
    or (select count(distinct season_reference) from private.draft_room_cfb_best_teams_board_entries where auction_id=v_game)<>8
    or (select count(distinct board_shape) from private.draft_room_cfb_best_teams_board_entries where auction_id=v_game)<>1
    or (select count(distinct board_variant) from private.draft_room_cfb_best_teams_board_entries where auction_id=v_game)<>1
  then raise exception 'Best CFB Teams prepared board lost its eight-season calibrated contract'; end if;

  select min(board_kind),bool_or(notre_dame_wildcard) into v_kind,v_nd
  from private.draft_room_cfb_best_teams_board_entries where auction_id=v_game;

  if v_kind='single' and (
      (select count(distinct p.conference_bucket)
       from private.draft_room_cfb_best_teams_board_entries e
       join private.draft_room_cfb_best_teams_pool p on p.season_reference=e.season_reference
       where e.auction_id=v_game)<>1
      or v_nd
    )
  then raise exception 'Single Best CFB Teams board mixed conference context'; end if;

  if v_kind='split' and (
      (select count(*) from private.draft_room_cfb_best_teams_board_entries e
       join private.draft_room_cfb_best_teams_pool p on p.season_reference=e.season_reference
       where e.auction_id=v_game and p.conference_bucket='Notre Dame') <> case when v_nd then 1 else 0 end
    )
  then raise exception 'Split Best CFB Teams board lost the Notre Dame wildcard contract'; end if;

  select to_jsonb(state) into v_projection from public.get_auction_participant_state(v_game) state;
  if v_projection::text ~* 'hidden_grade|target_percentiles|board_shape|board_variant|strength_slot'
    or coalesce(v_projection->'current_item'->>'display_label','') !~ ' · 20[0-2][0-9]$'
  then raise exception 'Best CFB Teams projection leaked private calibration or hid the season year'; end if;

  select revision into v_revision from private.auction_games where id=v_game;
  perform public.send_auction_first_bid(v_game,v_revision,5,null);
  select revision into v_revision from private.auction_games where id=v_game;
  perform set_config('request.jwt.claim.sub',v_admin_b::text,true);
  perform public.submit_auction_bid(v_game,1,v_revision,1,null);

  for i in 2..4 loop
    select * into v_state from private.auction_games where id=v_game;
    perform set_config('request.jwt.claim.sub',v_admin_a::text,true);
    perform public.submit_auction_bid(v_game,i,v_state.revision,5,null);
    select * into v_state from private.auction_games where id=v_game;
    perform set_config('request.jwt.claim.sub',v_admin_b::text,true);
    perform public.submit_auction_bid(v_game,i,v_state.revision,1,null);
  end loop;

  select * into v_state from private.auction_games where id=v_game;
  if v_state.lifecycle_state<>'completed' or v_state.challenger_selection_count<>4 or v_state.recipient_selection_count<>4
  then raise exception 'Best CFB Teams did not complete 4-v-4'; end if;

  select round(avg(p.hidden_grade),2) into v_expected_a
  from private.auction_awards a
  join private.auction_deck_entries d on d.id=a.deck_entry_id and d.auction_id=a.auction_id
  join private.draft_room_cfb_best_teams_board_entries e on e.auction_id=a.auction_id and e.item_reference=d.private_item_reference
  join private.draft_room_cfb_best_teams_pool p on p.season_reference=e.season_reference
  where a.auction_id=v_game and a.awarded_to=v_admin_a;

  select round(avg(p.hidden_grade),2) into v_expected_b
  from private.auction_awards a
  join private.auction_deck_entries d on d.id=a.deck_entry_id and d.auction_id=a.auction_id
  join private.draft_room_cfb_best_teams_board_entries e on e.auction_id=a.auction_id and e.item_reference=d.private_item_reference
  join private.draft_room_cfb_best_teams_pool p on p.season_reference=e.season_reference
  where a.auction_id=v_game and a.awarded_to=v_admin_b;

  if v_state.challenger_final_score<>v_expected_a or v_state.recipient_final_score<>v_expected_b
  then raise exception 'Best CFB Teams final score is not the exact four-season average'; end if;
end;
$best_cfb_playable$;

rollback;
