-- Stage 12 CFB Build a QB competitive audit.
-- Append-only rotation from the already-shipped v3 catalog. NFL rows are copied byte-for-byte
-- at the catalog level; only CFB trait grading inputs are recalibrated. Shared Auction ownership,
-- rarity weights, private access, and the canonical grading function remain unchanged.

update private.auction_catalog_versions
set is_preparation_version = false
where game_id = 'draft-room'
  and is_preparation_version;

insert into private.auction_catalog_versions (
  content_version, rarity_version, grading_version, is_preparation_version, game_id
) values (
  'football-draft-room-2026-09-v4',
  'football-draft-room-rarity-2026-09-v3',
  'football-build-qb-traits-2026-09-v1',
  true,
  'draft-room'
);

insert into private.auction_catalog (
  content_version, mode_id, item_reference, display_label, rarity_band,
  display_description, generation_weight, private_generation_class, grading_inputs
)
select
  'football-draft-room-2026-09-v4',
  mode_id,
  item_reference,
  display_label,
  rarity_band,
  display_description,
  generation_weight,
  private_generation_class,
  grading_inputs
from private.auction_catalog
where content_version = 'football-draft-room-2026-09-v3'
  and mode_id in ('build-qb', 'build-qb-cfb');

with calibrated (
  item_reference, arm, accuracy, processing, mobility, clutch, overall
) as (
  values
    ('cfb-build-qb-cam-newton-2010', 93, 86, 86, 99, 99, 93),
    ('cfb-build-qb-vince-young-2005', 86, 86, 86, 99, 99, 91),
    ('cfb-build-qb-tim-tebow-2007', 78, 78, 78, 99, 86, 84),
    ('cfb-build-qb-matt-leinart-2004', 86, 93, 93, 60, 99, 86),
    ('cfb-build-qb-johnny-manziel-2012', 86, 86, 78, 99, 93, 88),
    ('cfb-build-qb-colt-mccoy-2008', 69, 99, 86, 78, 86, 84),
    ('cfb-build-qb-sam-bradford-2008', 93, 99, 93, 69, 86, 88),
    ('cfb-build-qb-jameis-winston-2013', 93, 93, 86, 78, 99, 90),
    ('cfb-build-qb-robert-griffin-iii-2011', 93, 99, 93, 99, 93, 95),
    ('cfb-build-qb-doug-flutie-1984', 78, 78, 78, 86, 99, 84),
    ('cfb-build-qb-vinny-testaverde-1986', 99, 78, 78, 69, 69, 79),
    ('cfb-build-qb-charlie-ward-1993', 86, 93, 93, 93, 99, 93),
    ('cfb-build-qb-danny-wuerffel-1996', 69, 93, 99, 60, 99, 84),
    ('cfb-build-qb-ty-detmer-1990', 60, 99, 99, 60, 86, 81),
    ('cfb-build-qb-gino-torretta-1992', 69, 78, 86, 50, 86, 74),
    ('cfb-build-qb-andre-ware-1989', 99, 78, 78, 69, 69, 79),
    ('cfb-build-qb-eric-crouch-2001', 60, 60, 69, 99, 86, 75),
    ('cfb-build-qb-jim-plunkett-1970', 99, 86, 86, 78, 93, 88),
    ('cfb-build-qb-roger-staubach-1963', 86, 93, 99, 99, 99, 95),
    ('cfb-build-qb-troy-smith-2006', 86, 86, 86, 86, 78, 84),
    ('cfb-build-qb-brady-quinn-2005', 86, 78, 86, 60, 69, 76),
    ('cfb-build-qb-carson-palmer-2002', 99, 86, 86, 60, 86, 83),
    ('cfb-build-qb-chris-weinke-2000', 86, 78, 86, 50, 86, 77),
    ('cfb-build-qb-jason-white-2003', 86, 86, 86, 50, 69, 75),
    ('cfb-build-qb-marcus-mariota-2014', 86, 99, 93, 99, 93, 94),
    ('cfb-build-qb-dak-prescott-2014', 78, 78, 78, 99, 78, 82),
    ('cfb-build-qb-jared-goff-2015', 86, 86, 86, 50, 69, 75),
    ('cfb-build-qb-patrick-mahomes-2016', 99, 78, 78, 86, 69, 82),
    ('cfb-build-qb-deshaun-watson-2016', 93, 93, 93, 93, 99, 94),
    ('cfb-build-qb-lamar-jackson-2016', 86, 86, 78, 99, 86, 87),
    ('cfb-build-qb-baker-mayfield-2017', 93, 99, 99, 86, 93, 94),
    ('cfb-build-qb-josh-allen-2016', 99, 50, 50, 78, 60, 67),
    ('cfb-build-qb-drew-lock-2017', 99, 60, 60, 50, 50, 64),
    ('cfb-build-qb-mason-rudolph-2017', 86, 86, 78, 60, 69, 76),
    ('cfb-build-qb-sam-darnold-2016', 86, 78, 78, 78, 86, 81),
    ('cfb-build-qb-gardner-minshew-2018', 69, 86, 86, 69, 86, 79),
    ('cfb-build-qb-kyler-murray-2018', 99, 93, 93, 99, 86, 94),
    ('cfb-build-qb-tua-tagovailoa-2018', 86, 99, 93, 86, 93, 91),
    ('cfb-build-qb-trevor-lawrence-2019', 99, 93, 93, 93, 93, 94),
    ('cfb-build-qb-joe-burrow-2019', 93, 99, 99, 86, 99, 95),
    ('cfb-build-qb-jalen-hurts-2019', 86, 86, 86, 99, 93, 90),
    ('cfb-build-qb-justin-fields-2019', 93, 93, 93, 99, 93, 94),
    ('cfb-build-qb-justin-herbert-2019', 99, 78, 78, 78, 86, 84),
    ('cfb-build-qb-jordan-love-2018', 99, 69, 60, 69, 60, 71),
    ('cfb-build-qb-mac-jones-2020', 86, 99, 99, 60, 99, 89),
    ('cfb-build-qb-kyle-trask-2020', 78, 86, 86, 50, 69, 74),
    ('cfb-build-qb-zach-wilson-2020', 99, 78, 69, 78, 69, 79),
    ('cfb-build-qb-sam-howell-2020', 86, 86, 78, 78, 69, 79),
    ('cfb-build-qb-spencer-rattler-2020', 99, 78, 60, 69, 60, 73),
    ('cfb-build-qb-brock-purdy-2020', 69, 78, 78, 78, 78, 76),
    ('cfb-build-qb-bryce-young-2021', 86, 99, 99, 93, 99, 95),
    ('cfb-build-qb-c-j-stroud-2021', 99, 99, 93, 69, 86, 89),
    ('cfb-build-qb-kenny-pickett-2021', 78, 86, 86, 78, 86, 83),
    ('cfb-build-qb-bailey-zappe-2021', 60, 78, 78, 50, 69, 67),
    ('cfb-build-qb-matt-corral-2021', 86, 86, 78, 86, 78, 83),
    ('cfb-build-qb-malik-willis-2021', 99, 50, 50, 99, 50, 70),
    ('cfb-build-qb-sam-hartman-2021', 78, 78, 78, 69, 69, 74),
    ('cfb-build-qb-caleb-williams-2022', 99, 93, 86, 99, 93, 94),
    ('cfb-build-qb-max-duggan-2022', 78, 78, 78, 86, 99, 84),
    ('cfb-build-qb-drake-maye-2022', 99, 93, 93, 93, 86, 93),
    ('cfb-build-qb-hendon-hooker-2022', 93, 99, 93, 93, 93, 94),
    ('cfb-build-qb-stetson-bennett-2022', 69, 86, 86, 78, 99, 84),
    ('cfb-build-qb-michael-penix-jr-2023', 99, 93, 93, 60, 99, 89),
    ('cfb-build-qb-bo-nix-2023', 86, 99, 99, 86, 86, 91),
    ('cfb-build-qb-jayden-daniels-2023', 93, 99, 93, 99, 93, 95),
    ('cfb-build-qb-j-j-mccarthy-2023', 86, 86, 86, 78, 86, 84),
    ('cfb-build-qb-jordan-travis-2023', 78, 86, 86, 86, 86, 84),
    ('cfb-build-qb-quinn-ewers-2023', 86, 86, 78, 60, 86, 79),
    ('cfb-build-qb-dillon-gabriel-2024', 78, 86, 99, 78, 86, 85),
    ('cfb-build-qb-shedeur-sanders-2024', 86, 99, 86, 69, 78, 84),
    ('cfb-build-qb-cameron-ward-2024', 99, 86, 78, 86, 78, 85),
    ('cfb-build-qb-jaxson-dart-2024', 86, 86, 86, 78, 78, 83),
    ('cfb-build-qb-will-howard-2024', 93, 93, 93, 86, 99, 93),
    ('cfb-build-qb-kyle-mccord-2024', 78, 78, 69, 50, 69, 69),
    ('cfb-build-qb-jalen-milroe-2023', 99, 69, 69, 99, 86, 84),
    ('cfb-build-qb-carson-beck-2023', 86, 99, 86, 60, 78, 82),
    ('cfb-build-qb-riley-leonard-2024', 69, 78, 86, 99, 99, 86),
    ('cfb-build-qb-kaidon-salter-2023', 78, 69, 60, 99, 69, 75),
    ('cfb-build-qb-grayson-mccall-2021', 60, 99, 78, 69, 69, 75),
    ('cfb-build-qb-deriq-king-2018', 69, 69, 69, 99, 60, 73)
)
update private.auction_catalog as catalog
set grading_inputs = jsonb_build_object(
  'Arm', calibrated.arm,
  'Accuracy', calibrated.accuracy,
  'Processing', calibrated.processing,
  'Mobility', calibrated.mobility,
  'Clutch', calibrated.clutch,
  'overall', calibrated.overall
)
from calibrated
where catalog.content_version = 'football-draft-room-2026-09-v4'
  and catalog.mode_id = 'build-qb-cfb'
  and catalog.item_reference = calibrated.item_reference;

create or replace function private.grade_auction(p_auction_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_game private.auction_games;
  v_required integer;
  v_challenger_count integer;
  v_recipient_count integer;
  v_challenger_scored integer;
  v_recipient_scored integer;
  v_challenger_score numeric(5,2);
  v_recipient_score numeric(5,2);
  v_winner uuid;
  v_category_builder boolean;
begin
  select auction.* into v_game
  from private.auction_games auction
  where auction.id = p_auction_id
  for update;

  if v_game.id is null then
    raise exception 'Auction not found';
  end if;

  if v_game.lifecycle_state = 'completed' then
    return;
  end if;

  if v_game.lifecycle_state <> 'active' then
    raise exception 'Auction grading boundary is invalid';
  end if;

  if v_game.grading_version = 'grader-contract-v1' then
    update private.auction_games
    set lifecycle_state = 'completed',
        challenger_final_score = 0,
        recipient_final_score = 0,
        winner_profile_id = null,
        revision = revision + 1,
        updated_at = now()
    where id = v_game.id;

    update public.play_challenges
    set completed_at = coalesce(completed_at, now()),
        creator_result = jsonb_build_object('overall_score', 0),
        responder_result = jsonb_build_object('overall_score', 0)
    where id = v_game.challenge_id;
    return;
  end if;

  if not (
    (v_game.content_version = 'ufc-auction-2026-08-v1'
      and v_game.rarity_version = 'balanced-rarity-2026-08-v1'
      and v_game.grading_version = 'ufc-private-grader-2026-08-v1')
    or (v_game.content_version in (
        'ufc-auction-2026-08-v2',
        'ufc-auction-2026-08-v3',
        'ufc-auction-2026-08-v4',
        'ufc-auction-2026-08-v5',
        'ufc-auction-2026-08-v6'
      )
      and v_game.rarity_version = 'balanced-rarity-2026-08-v2'
      and v_game.grading_version = 'ufc-private-grader-2026-08-v2')
    or (v_game.content_version in ('ufc-auction-2026-08-v7', 'ufc-auction-2026-08-v8')
      and v_game.rarity_version = 'balanced-rarity-2026-08-v2'
      and v_game.grading_version = 'ufc-private-grader-2026-08-v3')
    or (v_game.content_version in ('football-draft-room-2026-09-v1', 'football-draft-room-2026-09-v2', 'football-draft-room-2026-09-v3', 'football-draft-room-2026-09-v4')
      and v_game.rarity_version in ('football-draft-room-rarity-2026-09-v1', 'football-draft-room-rarity-2026-09-v2', 'football-draft-room-rarity-2026-09-v3')
      and v_game.grading_version = 'football-build-qb-traits-2026-09-v1')
  ) then
    raise exception 'Auction grading version is unsupported';
  end if;

  v_required := case
    when v_game.mode_id in ('build-qb', 'build-qb-cfb') then 5
    when v_game.mode_id = 'ultimate-fighter' then 5
    when v_game.content_version in (
      'ufc-auction-2026-08-v3',
      'ufc-auction-2026-08-v4',
      'ufc-auction-2026-08-v5',
      'ufc-auction-2026-08-v6',
      'ufc-auction-2026-08-v7',
      'ufc-auction-2026-08-v8'
    ) then 3 else 4
  end;
  v_category_builder := v_game.mode_id in ('ultimate-fighter', 'build-qb', 'build-qb-cfb');

  select
    count(*),
    count(score_value),
    case
      when v_game.grading_version in ('ufc-private-grader-2026-08-v3', 'football-build-qb-traits-2026-09-v1')
        then round(avg(score_value))
      else round(avg(score_value), 2)
    end
  into v_challenger_count, v_challenger_scored, v_challenger_score
  from (
    select case
      when v_category_builder then (catalog.grading_inputs ->> award.visible_category)::numeric
      else (catalog.grading_inputs ->> 'overall')::numeric
    end as score_value
    from private.auction_awards award
    join private.auction_deck_entries deck
      on deck.id = award.deck_entry_id and deck.auction_id = award.auction_id
    join private.auction_catalog catalog
      on catalog.content_version = v_game.content_version
      and catalog.mode_id = v_game.mode_id
      and catalog.item_reference = deck.private_item_reference
    where award.auction_id = v_game.id
      and award.awarded_to = v_game.challenger_id
  ) scored;

  select
    count(*),
    count(score_value),
    case
      when v_game.grading_version in ('ufc-private-grader-2026-08-v3', 'football-build-qb-traits-2026-09-v1')
        then round(avg(score_value))
      else round(avg(score_value), 2)
    end
  into v_recipient_count, v_recipient_scored, v_recipient_score
  from (
    select case
      when v_category_builder then (catalog.grading_inputs ->> award.visible_category)::numeric
      else (catalog.grading_inputs ->> 'overall')::numeric
    end as score_value
    from private.auction_awards award
    join private.auction_deck_entries deck
      on deck.id = award.deck_entry_id and deck.auction_id = award.auction_id
    join private.auction_catalog catalog
      on catalog.content_version = v_game.content_version
      and catalog.mode_id = v_game.mode_id
      and catalog.item_reference = deck.private_item_reference
    where award.auction_id = v_game.id
      and award.awarded_to = v_game.recipient_id
  ) scored;

  if v_challenger_count <> v_required
    or v_recipient_count <> v_required
    or v_challenger_scored <> v_required
    or v_recipient_scored <> v_required
    or v_challenger_score not between 0 and 100
    or v_recipient_score not between 0 and 100
  then
    raise exception 'Auction grading inputs are incomplete or invalid';
  end if;

  v_winner := case
    when v_challenger_score > v_recipient_score then v_game.challenger_id
    when v_recipient_score > v_challenger_score then v_game.recipient_id
    else null
  end;

  update private.auction_games
  set lifecycle_state = 'completed',
      challenger_final_score = v_challenger_score,
      recipient_final_score = v_recipient_score,
      winner_profile_id = v_winner,
      revision = revision + 1,
      updated_at = now()
  where id = v_game.id;

  update public.play_challenges
  set completed_at = coalesce(completed_at, now()),
      creator_result = jsonb_build_object('overall_score', v_challenger_score),
      responder_result = jsonb_build_object('overall_score', v_recipient_score)
  where id = v_game.challenge_id;
end;
$$;
