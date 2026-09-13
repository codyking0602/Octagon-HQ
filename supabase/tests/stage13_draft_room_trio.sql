begin;

select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_admin_a uuid := extensions.gen_random_uuid();
  v_admin_b uuid := extensions.gen_random_uuid();
  v_member uuid := extensions.gen_random_uuid();
  v_nfl_game uuid;
  v_cfb_game uuid;
  v_revision bigint;
  v_state private.auction_games;
  v_expected_a numeric(5,2);
  v_expected_b numeric(5,2);
  v_projection jsonb;
  v_loaded_strength numeric;
  v_strong_strength numeric;
  v_balanced_strength numeric;
  v_gritty_strength numeric;
begin
  if private.draft_room_public_release_enabled() then
    raise exception 'Stage 13 Draft Room unexpectedly has its public release switch enabled';
  end if;

  if not exists (
    select 1
    from private.auction_catalog_versions version
    where version.game_id = 'draft-room-trio'
      and version.content_version = 'football-draft-room-trio-2026-09-v1'
      and version.rarity_version = 'football-draft-room-trio-rarity-2026-09-v1'
      and version.grading_version = 'football-draft-room-trio-grading-2026-09-v1'
      and version.is_preparation_version
  ) then
    raise exception 'Stage 13 Trio preparation version is missing';
  end if;

  if (select count(*) from private.draft_room_trio_player_pool) <> 300 then
    raise exception 'Stage 13 Trio pool must contain exactly 300 players';
  end if;

  if exists (
    select 1
    from (
      select mode_id, position, count(*) as player_count
      from private.draft_room_trio_player_pool
      group by mode_id, position
    ) counts
    where counts.player_count <> 50
  ) then
    raise exception 'Each Stage 13 sport/position pool must contain exactly 50 players';
  end if;

  if exists (
    select 1
    from (
      select mode_id, position, tier, count(*) as player_count
      from private.draft_room_trio_player_pool
      group by mode_id, position, tier
    ) counts
    where counts.player_count <> case counts.tier
      when 'Elite' then 8
      when 'Great' then 12
      when 'Good' then 16
      when 'Average' then 14
      else -1
    end
  ) then
    raise exception 'Stage 13 Trio tier counts must stay 8/12/16/14';
  end if;

  if (
    select md5(string_agg(
      mode_id || '|' || position || '|' || tier || '|' || display_name || '|' || coalesce(peak_team, '') || '|' || coalesce(peak_season::text, ''),
      E'\n'
      order by player_reference
    ))
    from private.draft_room_trio_player_pool
  ) <> 'fe45cc452d1c61a3ab667beb9c74ba42' then
    raise exception 'Stage 13 locked Trio names or CFB peak identities drifted';
  end if;

  if exists (
    select 1
    from private.draft_room_trio_player_pool
    where mode_id = 'trio-cfb'
      and (peak_season < 2005 or peak_team is null)
  ) then
    raise exception 'CFB Trio contains a pre-2005 or unbound peak-college identity';
  end if;

  if (
    select jsonb_object_agg(profile, profile_count)
    from (
      select profile, count(*) profile_count
      from (
        select private.draft_room_trio_room_profile(i / 100.0) profile
        from generate_series(0, 99) i
      ) rolls
      group by profile
    ) counts
  ) <> '{"Loaded":20,"Strong":30,"Balanced":30,"Gritty":20}'::jsonb then
    raise exception 'Trio room profile distribution is not locked to 20/30/30/20';
  end if;

  if exists (
    select 1
    from (values ('Loaded'),('Strong'),('Balanced'),('Gritty')) profiles(profile)
    cross join generate_series(0,99) i
    where private.draft_room_trio_tier_combo(profiles.profile, i / 100.0)
      = array['Average','Average','Average']::text[]
  ) then
    raise exception 'Average/Average/Average is reachable in the Trio generator';
  end if;

  with sampled as (
    select
      profiles.profile,
      avg(case tier
        when 'Elite' then 4
        when 'Great' then 3
        when 'Good' then 2
        when 'Average' then 1
      end) as average_tier_strength
    from (values ('Loaded'),('Strong'),('Balanced'),('Gritty')) profiles(profile)
    cross join generate_series(0,999) i
    cross join lateral unnest(
      private.draft_room_trio_tier_combo(profiles.profile, (i + 0.5) / 1000.0)
    ) tier
    group by profiles.profile
  )
  select
    max(average_tier_strength) filter (where profile = 'Loaded'),
    max(average_tier_strength) filter (where profile = 'Strong'),
    max(average_tier_strength) filter (where profile = 'Balanced'),
    max(average_tier_strength) filter (where profile = 'Gritty')
  into v_loaded_strength, v_strong_strength, v_balanced_strength, v_gritty_strength
  from sampled;

  if not (
    v_loaded_strength > v_strong_strength
    and v_strong_strength > v_balanced_strength
    and v_balanced_strength > v_gritty_strength
  ) then
    raise exception 'Trio room-strength profiles do not produce materially ordered game strength';
  end if;

  insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data)
  values
    (v_admin_a,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','stage13-trio-admin-a@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','STAGE 13 TRIO ADMIN A','historical_unclaimed',true)),
    (v_admin_b,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','stage13-trio-admin-b@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','STAGE 13 TRIO ADMIN B','historical_unclaimed',true)),
    (v_member,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','stage13-trio-member@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','STAGE 13 TRIO MEMBER','historical_unclaimed',true));

  perform public.register_unclaimed_pin_profile(v_admin_a,'Stage 13 Trio Admin A','TA');
  perform public.register_unclaimed_pin_profile(v_admin_b,'Stage 13 Trio Admin B','TB');
  perform public.register_unclaimed_pin_profile(v_member,'Stage 13 Trio Member','TM');
  insert into public.pick_control_owners(profile_id) values (v_admin_a), (v_admin_b);

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_member::text,true);
  begin
    perform public.prepare_auction(v_admin_a, 'trio-nfl');
    raise exception 'regular member prepared an admin-only Trio room';
  exception when others then
    if sqlerrm not like '%Draft Room admin preview access required for both players%' then raise; end if;
  end;

  perform setseed(0.314159);
  perform set_config('request.jwt.claim.sub',v_admin_a::text,true);
  v_nfl_game := public.prepare_auction(v_admin_b, 'trio-nfl');

  select auction.* into v_state from private.auction_games auction where auction.id = v_nfl_game;
  if v_state.content_version <> 'football-draft-room-trio-2026-09-v1'
    or v_state.challenger_bankroll <> 30
    or v_state.recipient_bankroll <> 30
    or v_state.current_round <> 1
  then
    raise exception 'NFL Trio did not prepare the six-round $30 contract: %', row_to_json(v_state);
  end if;

  if (select count(*) from private.auction_deck_entries deck where deck.auction_id = v_nfl_game) <> 6
    or (select count(*) from private.draft_room_trio_packages package where package.auction_id = v_nfl_game) <> 6
  then
    raise exception 'NFL Trio deck must contain exactly six packages';
  end if;

  if (
    select count(distinct package.room_profile)
    from private.draft_room_trio_packages package
    where package.auction_id = v_nfl_game
  ) <> 1 then
    raise exception 'NFL Trio did not keep one room-strength profile across all six auctions';
  end if;

  if exists (
    select 1
    from private.draft_room_trio_packages package
    where package.auction_id = v_nfl_game
      and package.qb_tier = 'Average'
      and package.rb_tier = 'Average'
      and package.wr_tier = 'Average'
  ) then
    raise exception 'NFL Trio generated an Average/Average/Average package';
  end if;

  if (select count(distinct qb_reference) from private.draft_room_trio_packages where auction_id = v_nfl_game) <> 6
    or (select count(distinct rb_reference) from private.draft_room_trio_packages where auction_id = v_nfl_game) <> 6
    or (select count(distinct wr_reference) from private.draft_room_trio_packages where auction_id = v_nfl_game) <> 6
  then
    raise exception 'NFL Trio repeated a player inside one six-package room';
  end if;

  select auction.revision into v_revision from private.auction_games auction where auction.id = v_nfl_game;
  perform public.send_auction_first_bid(v_nfl_game, v_revision, 5, null);
  select auction.revision into v_revision from private.auction_games auction where auction.id = v_nfl_game;
  perform set_config('request.jwt.claim.sub',v_admin_b::text,true);
  perform public.submit_auction_bid(v_nfl_game, 1, v_revision, 1, null);

  for i in 2..3 loop
    select auction.* into v_state from private.auction_games auction where auction.id = v_nfl_game;
    perform set_config('request.jwt.claim.sub',v_admin_a::text,true);
    perform public.submit_auction_bid(v_nfl_game, i, v_state.revision, 5, null);
    select auction.* into v_state from private.auction_games auction where auction.id = v_nfl_game;
    perform set_config('request.jwt.claim.sub',v_admin_b::text,true);
    perform public.submit_auction_bid(v_nfl_game, i, v_state.revision, 1, null);
  end loop;

  select auction.* into v_state from private.auction_games auction where auction.id = v_nfl_game;
  if v_state.lifecycle_state <> 'completed'
    or v_state.challenger_selection_count <> 3
    or v_state.recipient_selection_count <> 3
    or v_state.challenger_bankroll <> 15
    or v_state.recipient_bankroll <> 27
  then
    raise exception 'NFL Trio did not finish 3-v-3 after the third win with $1 forced remainder: %', row_to_json(v_state);
  end if;

  if (select count(*) from private.auction_awards where auction_id = v_nfl_game) <> 6 then
    raise exception 'NFL Trio completion must record exactly six awards';
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
    where award.auction_id = v_nfl_game
      and award.resolved_round between 4 and 6
      and challenger_bid.amount is null
      and recipient_bid.amount is null
      and award.awarded_to = v_admin_b
  ) <> 3 then
    raise exception 'NFL Trio remaining packages were not automatically assigned to the opponent';
  end if;

  select round(sum(qb.hidden_grade + rb.hidden_grade + wr.hidden_grade) / 9.0, 2)
  into v_expected_a
  from private.auction_awards award
  join private.auction_deck_entries deck
    on deck.id = award.deck_entry_id and deck.auction_id = award.auction_id
  join private.draft_room_trio_packages package
    on package.auction_id = award.auction_id and package.item_reference = deck.private_item_reference
  join private.draft_room_trio_player_pool qb
    on qb.mode_id = 'trio-nfl' and qb.position = 'QB' and qb.player_reference = package.qb_reference
  join private.draft_room_trio_player_pool rb
    on rb.mode_id = 'trio-nfl' and rb.position = 'RB' and rb.player_reference = package.rb_reference
  join private.draft_room_trio_player_pool wr
    on wr.mode_id = 'trio-nfl' and wr.position = 'WR' and wr.player_reference = package.wr_reference
  where award.auction_id = v_nfl_game and award.awarded_to = v_admin_a;

  select round(sum(qb.hidden_grade + rb.hidden_grade + wr.hidden_grade) / 9.0, 2)
  into v_expected_b
  from private.auction_awards award
  join private.auction_deck_entries deck
    on deck.id = award.deck_entry_id and deck.auction_id = award.auction_id
  join private.draft_room_trio_packages package
    on package.auction_id = award.auction_id and package.item_reference = deck.private_item_reference
  join private.draft_room_trio_player_pool qb
    on qb.mode_id = 'trio-nfl' and qb.position = 'QB' and qb.player_reference = package.qb_reference
  join private.draft_room_trio_player_pool rb
    on rb.mode_id = 'trio-nfl' and rb.position = 'RB' and rb.player_reference = package.rb_reference
  join private.draft_room_trio_player_pool wr
    on wr.mode_id = 'trio-nfl' and wr.position = 'WR' and wr.player_reference = package.wr_reference
  where award.auction_id = v_nfl_game and award.awarded_to = v_admin_b;

  if v_state.challenger_final_score <> v_expected_a
    or v_state.recipient_final_score <> v_expected_b
  then
    raise exception 'NFL Trio final score is not the exact average of all nine won players';
  end if;

  perform set_config('request.jwt.claim.sub',v_admin_a::text,true);
  select to_jsonb(state) into v_projection
  from public.get_auction_participant_state(v_nfl_game) state;

  if v_projection::text ~* 'hidden_grade|room_profile|qb_tier|rb_tier|wr_tier|grading_inputs' then
    raise exception 'Trio participant projection leaked private grading or generation metadata';
  end if;

  if jsonb_array_length(v_projection->'awarded_collections') <> 6
    or exists (
      select 1
      from jsonb_array_elements(v_projection->'awarded_collections') award
      where award->>'display_label' is null
        or array_length(string_to_array(award->>'display_label', ' | '), 1) <> 3
    )
  then
    raise exception 'Trio participant projection did not expose exactly six three-player display packages';
  end if;

  perform setseed(0.271828);
  v_cfb_game := public.prepare_auction(v_admin_b, 'trio-cfb');

  select auction.* into v_state from private.auction_games auction where auction.id = v_cfb_game;
  if v_state.challenger_bankroll <> 30
    or v_state.recipient_bankroll <> 30
    or (select count(*) from private.auction_deck_entries where auction_id = v_cfb_game) <> 6
  then
    raise exception 'CFB Trio did not prepare the same six-round $30 contract';
  end if;

  if exists (
    select 1
    from private.draft_room_trio_packages package
    where package.auction_id = v_cfb_game
      and (
        package.qb_peak_season < 2005
        or package.rb_peak_season < 2005
        or package.wr_peak_season < 2005
        or package.qb_peak_team is null
        or package.rb_peak_team is null
        or package.wr_peak_team is null
      )
  ) then
    raise exception 'CFB Trio package lost peak college season/team identity';
  end if;

  if exists (
    select 1
    from private.draft_room_trio_packages package
    where package.auction_id = v_cfb_game
      and package.qb_tier = 'Average'
      and package.rb_tier = 'Average'
      and package.wr_tier = 'Average'
  ) then
    raise exception 'CFB Trio generated an Average/Average/Average package';
  end if;
end $$;

rollback;
