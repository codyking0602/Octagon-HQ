begin;

select set_config('request.jwt.claim.role', 'service_role', true);

update private.auction_catalog_versions
set is_preparation_version = false
where game_id = 'draft-room'
  and is_preparation_version;

update private.auction_catalog_versions
set is_preparation_version = true
where content_version = 'football-draft-room-2026-09-v6';

do $$
declare
  v_admin_a uuid := extensions.gen_random_uuid();
  v_admin_b uuid := extensions.gen_random_uuid();
  v_member uuid := extensions.gen_random_uuid();
  v_game uuid;
  v_revision bigint;
  v_round integer;
  v_code text;
  v_category_a text;
  v_category_b text;
  v_state private.auction_games;
  v_categories text[] := array['Arm','Accuracy','Processing','Mobility'];
begin
  if not exists (
    select 1
    from private.auction_catalog_versions version
    where version.game_id = 'draft-room'
      and version.content_version = 'football-draft-room-2026-09-v6'
      and version.rarity_version = 'football-draft-room-rarity-2026-09-v4'
      and version.grading_version = 'football-build-qb-traits-2026-09-v2'
      and version.is_preparation_version
  ) then
    raise exception 'CFB Draft Room v6 preparation version is missing';
  end if;

  if (
    select count(*)
    from private.auction_catalog catalog
    where catalog.content_version = 'football-draft-room-2026-09-v6'
      and catalog.mode_id = 'build-qb-cfb'
  ) <> 80 then
    raise exception 'CFB Build a QB v6 must retain all 80 audited peak-season QBs';
  end if;

  if exists (
    select 1
    from private.auction_catalog catalog
    where catalog.content_version = 'football-draft-room-2026-09-v6'
      and catalog.mode_id = 'build-qb-cfb'
      and (
        catalog.grading_inputs ? 'Clutch'
        or not (catalog.grading_inputs ?& array['Arm','Accuracy','Processing','Mobility','overall'])
        or (catalog.grading_inputs - 'Arm' - 'Accuracy' - 'Processing' - 'Mobility' - 'overall') <> '{}'::jsonb
        or (catalog.grading_inputs->>'overall')::numeric <> round(
          (
            (catalog.grading_inputs->>'Arm')::numeric
            + (catalog.grading_inputs->>'Accuracy')::numeric
            + (catalog.grading_inputs->>'Processing')::numeric
            + (catalog.grading_inputs->>'Mobility')::numeric
          ) / 4
        )
      )
  ) then
    raise exception 'CFB Build a QB v6 grading packet must contain only the four canonical traits plus their four-trait overall';
  end if;

  insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data)
  values
    (v_admin_a,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','stage12-cfb-v6-admin-a@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','STAGE 12 CFB V6 ADMIN A','historical_unclaimed',true)),
    (v_admin_b,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','stage12-cfb-v6-admin-b@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','STAGE 12 CFB V6 ADMIN B','historical_unclaimed',true)),
    (v_member,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','stage12-cfb-v6-member@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','STAGE 12 CFB V6 MEMBER','historical_unclaimed',true));

  perform public.register_unclaimed_pin_profile(v_admin_a,'Stage 12 CFB V6 Admin A','SA');
  perform public.register_unclaimed_pin_profile(v_admin_b,'Stage 12 CFB V6 Admin B','SB');
  perform public.register_unclaimed_pin_profile(v_member,'Stage 12 CFB V6 Member','SM');
  insert into public.pick_control_owners(profile_id) values (v_admin_a), (v_admin_b);

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_admin_a::text,true);
  v_game := public.prepare_auction(v_admin_b, 'build-qb-cfb');

  select auction.* into v_state from private.auction_games auction where auction.id = v_game;
  if v_state.content_version <> 'football-draft-room-2026-09-v6'
    or v_state.challenger_bankroll <> 40
    or v_state.recipient_bankroll <> 40
    or v_state.current_round <> 1
  then
    raise exception 'prepared CFB Draft Room did not pin the four-trait $40 contract: %', row_to_json(v_state);
  end if;

  if (select count(*) from private.auction_deck_entries deck where deck.auction_id = v_game) <> 8 then
    raise exception 'CFB Build a QB deck must contain exactly eight QBs';
  end if;

  select auction.revision into v_revision from private.auction_games auction where auction.id = v_game;
  begin
    perform public.send_auction_first_bid(v_game, v_revision, 5, 'Clutch');
    raise exception 'Clutch remained a playable CFB Build a QB slot';
  exception when others then
    if sqlerrm not like '%available Build a QB trait is required%' then raise; end if;
  end;

  v_code := public.send_auction_first_bid(v_game, v_revision, 5, 'Arm');
  select auction.revision into v_revision from private.auction_games auction where auction.id = v_game;
  perform set_config('request.jwt.claim.sub',v_admin_b::text,true);
  perform public.submit_auction_bid(v_game, 1, v_revision, 4, 'Arm');

  for v_round in 2..8 loop
    select auction.* into v_state from private.auction_games auction where auction.id = v_game;
    exit when v_state.lifecycle_state = 'completed';

    select category into v_category_a
    from unnest(v_categories) with ordinality candidate(category, ordering)
    where not exists (
      select 1 from private.auction_awards award
      where award.auction_id = v_game and award.awarded_to = v_admin_a and award.visible_category = candidate.category
    ) order by ordering limit 1;

    select category into v_category_b
    from unnest(v_categories) with ordinality candidate(category, ordering)
    where not exists (
      select 1 from private.auction_awards award
      where award.auction_id = v_game and award.awarded_to = v_admin_b and award.visible_category = candidate.category
    ) order by ordering limit 1;

    perform set_config('request.jwt.claim.sub',v_admin_a::text,true);
    perform public.submit_auction_bid(v_game, v_state.current_round, v_state.revision, 1, v_category_a);
    select auction.* into v_state from private.auction_games auction where auction.id = v_game;
    perform set_config('request.jwt.claim.sub',v_admin_b::text,true);
    perform public.submit_auction_bid(v_game, v_state.current_round, v_state.revision, 1, v_category_b);
  end loop;

  select auction.* into v_state from private.auction_games auction where auction.id = v_game;
  if v_state.lifecycle_state <> 'completed'
    or v_state.challenger_selection_count <> 4
    or v_state.recipient_selection_count <> 4
    or v_state.challenger_final_score not between 35 and 99
    or v_state.recipient_final_score not between 35 and 99
  then
    raise exception 'CFB Build a QB did not complete as an eight-round four-trait game: %', row_to_json(v_state);
  end if;

  if exists (
    select 1 from private.auction_awards award
    where award.auction_id = v_game and award.visible_category = 'Clutch'
  ) then
    raise exception 'completed CFB Build a QB unexpectedly awarded Clutch';
  end if;

  if not exists (
    select 1 from public.play_challenges challenge
    where challenge.code = v_code
      and challenge.completed_at is not null
      and (challenge.creator_result->>'overall_score')::numeric = v_state.challenger_final_score
      and (challenge.responder_result->>'overall_score')::numeric = v_state.recipient_final_score
  ) then
    raise exception 'CFB Draft Room completion did not persist through the canonical challenge record';
  end if;
end $$;

rollback;
