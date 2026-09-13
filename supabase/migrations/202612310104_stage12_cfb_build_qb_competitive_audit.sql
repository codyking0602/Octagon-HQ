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


with exact_identity (
  item_reference, peak_season, school, canonical_player_id
) as (
  values
    ('cfb-build-qb-cam-newton-2010', 2010, 'Auburn', 'cfb-cam-newton'),
    ('cfb-build-qb-vince-young-2005', 2005, 'Texas', 'cfb-vince-young'),
    ('cfb-build-qb-tim-tebow-2007', 2007, 'Florida', 'cfb-tim-tebow'),
    ('cfb-build-qb-matt-leinart-2004', 2004, 'USC', 'cfb-matt-leinart'),
    ('cfb-build-qb-johnny-manziel-2012', 2012, 'Texas A&M', 'cfb-johnny-manziel'),
    ('cfb-build-qb-colt-mccoy-2008', 2008, 'Texas', 'cfb-colt-mccoy'),
    ('cfb-build-qb-sam-bradford-2008', 2008, 'Oklahoma', 'cfb-sam-bradford'),
    ('cfb-build-qb-jameis-winston-2013', 2013, 'Florida State', 'cfb-jameis-winston'),
    ('cfb-build-qb-robert-griffin-iii-2011', 2011, 'Baylor', 'cfb-robert-griffin-iii'),
    ('cfb-build-qb-doug-flutie-1984', 1984, 'Boston College', 'cfb-doug-flutie'),
    ('cfb-build-qb-vinny-testaverde-1986', 1986, 'Miami', 'cfb-vinny-testaverde'),
    ('cfb-build-qb-charlie-ward-1993', 1993, 'Florida State', 'cfb-charlie-ward'),
    ('cfb-build-qb-danny-wuerffel-1996', 1996, 'Florida', 'cfb-danny-wuerffel'),
    ('cfb-build-qb-ty-detmer-1990', 1990, 'BYU', 'cfb-ty-detmer'),
    ('cfb-build-qb-gino-torretta-1992', 1992, 'Miami', 'cfb-gino-torretta'),
    ('cfb-build-qb-andre-ware-1989', 1989, 'Houston', 'cfb-andre-ware'),
    ('cfb-build-qb-eric-crouch-2001', 2001, 'Nebraska', 'cfb-eric-crouch'),
    ('cfb-build-qb-jim-plunkett-1970', 1970, 'Stanford', 'cfb-jim-plunkett'),
    ('cfb-build-qb-roger-staubach-1963', 1963, 'Navy', 'cfb-roger-staubach'),
    ('cfb-build-qb-troy-smith-2006', 2006, 'Ohio State', 'cfb-troy-smith'),
    ('cfb-build-qb-brady-quinn-2005', 2005, 'Notre Dame', 'cfb-brady-quinn'),
    ('cfb-build-qb-carson-palmer-2002', 2002, 'USC', 'cfb-carson-palmer'),
    ('cfb-build-qb-chris-weinke-2000', 2000, 'Florida State', 'cfb-chris-weinke'),
    ('cfb-build-qb-jason-white-2003', 2003, 'Oklahoma', 'cfb-jason-white'),
    ('cfb-build-qb-marcus-mariota-2014', 2014, 'Oregon', 'cfbfast-r-player-511459-marcus-mariota'),
    ('cfb-build-qb-dak-prescott-2014', 2014, 'Mississippi State', 'cfbfast-r-player-512030-dak-prescott'),
    ('cfb-build-qb-jared-goff-2015', 2015, 'California', 'cfbfast-r-player-547401-jared-goff'),
    ('cfb-build-qb-patrick-mahomes-2016', 2016, 'Texas Tech', 'cfbfast-r-player-3139477-patrick-mahomes'),
    ('cfb-build-qb-deshaun-watson-2016', 2016, 'Clemson', 'cfbfast-r-player-3122840-deshaun-watson'),
    ('cfb-build-qb-lamar-jackson-2016', 2016, 'Louisville', 'cfbfast-r-player-3916387-lamar-jackson'),
    ('cfb-build-qb-baker-mayfield-2017', 2017, 'Oklahoma', 'cfbfast-r-player-550373-baker-mayfield'),
    ('cfb-build-qb-josh-allen-2016', 2016, 'Wyoming', 'cfbfast-r-player-3918298-josh-allen'),
    ('cfb-build-qb-drew-lock-2017', 2017, 'Missouri', 'cfbfast-r-player-3924327-drew-lock'),
    ('cfb-build-qb-mason-rudolph-2017', 2017, 'Oklahoma State', 'cfbfast-r-player-3116407-mason-rudolph'),
    ('cfb-build-qb-sam-darnold-2016', 2016, 'USC', 'cfbfast-r-player-3912547-sam-darnold'),
    ('cfb-build-qb-gardner-minshew-2018', 2018, 'Washington State', 'cfbfast-r-player-4038524-gardner-minshew'),
    ('cfb-build-qb-kyler-murray-2018', 2018, 'Oklahoma', 'cfbfast-r-player-3917315-kyler-murray'),
    ('cfb-build-qb-tua-tagovailoa-2018', 2018, 'Alabama', 'cfbfast-r-player-4241479-tua-tagovailoa'),
    ('cfb-build-qb-trevor-lawrence-2019', 2019, 'Clemson', 'cfbfast-r-player-4360310-trevor-lawrence'),
    ('cfb-build-qb-joe-burrow-2019', 2019, 'LSU', 'cfbfast-r-player-3915511-joe-burrow'),
    ('cfb-build-qb-jalen-hurts-2019', 2019, 'Oklahoma', 'cfbfast-r-player-4040715-jalen-hurts'),
    ('cfb-build-qb-justin-fields-2019', 2019, 'Ohio State', 'cfbfast-r-player-4362887-justin-fields'),
    ('cfb-build-qb-justin-herbert-2019', 2019, 'Oregon', 'cfbfast-r-player-4038941-justin-herbert'),
    ('cfb-build-qb-jordan-love-2018', 2018, 'Utah State', 'cfbfast-r-player-4036378-jordan-love'),
    ('cfb-build-qb-mac-jones-2020', 2020, 'Alabama', 'cfbfast-r-player-4241464-mac-jones'),
    ('cfb-build-qb-kyle-trask-2020', 2020, 'Florida', 'cfbfast-r-player-4034946-kyle-trask'),
    ('cfb-build-qb-zach-wilson-2020', 2020, 'BYU', 'cfbfast-r-player-4361259-zach-wilson'),
    ('cfb-build-qb-sam-howell-2020', 2020, 'North Carolina', 'cfbfast-r-player-4426875-sam-howell'),
    ('cfb-build-qb-spencer-rattler-2020', 2020, 'Oklahoma', 'cfbfast-r-player-4426339-spencer-rattler'),
    ('cfb-build-qb-brock-purdy-2020', 2020, 'Iowa State', 'cfbfast-r-player-4361741-brock-purdy'),
    ('cfb-build-qb-bryce-young-2021', 2021, 'Alabama', 'cfbfast-r-player-4685720-bryce-young'),
    ('cfb-build-qb-c-j-stroud-2021', 2021, 'Ohio State', 'cfbfast-r-player-4432577-c-j-stroud'),
    ('cfb-build-qb-kenny-pickett-2021', 2021, 'Pittsburgh', 'cfbfast-r-player-4240703-kenny-pickett'),
    ('cfb-build-qb-bailey-zappe-2021', 2021, 'Western Kentucky', 'cfbfast-r-player-4250360-bailey-zappe'),
    ('cfb-build-qb-matt-corral-2021', 2021, 'Ole Miss', 'cfbfast-r-player-4362874-matt-corral'),
    ('cfb-build-qb-malik-willis-2021', 2021, 'Liberty', 'cfbfast-r-player-4242512-malik-willis'),
    ('cfb-build-qb-sam-hartman-2021', 2021, 'Wake Forest', 'cfbfast-r-player-4361994-sam-hartman'),
    ('cfb-build-qb-caleb-williams-2022', 2022, 'USC', 'cfbfast-r-player-4431611-caleb-williams'),
    ('cfb-build-qb-max-duggan-2022', 2022, 'TCU', 'cfbfast-r-player-4427105-max-duggan'),
    ('cfb-build-qb-drake-maye-2022', 2022, 'North Carolina', 'cfbfast-r-player-4431452-drake-maye'),
    ('cfb-build-qb-hendon-hooker-2022', 2022, 'Tennessee', 'cfbfast-r-player-4240858-hendon-hooker'),
    ('cfb-build-qb-stetson-bennett-2022', 2022, 'Georgia', 'cfbfast-r-player-4259553-stetson-bennett'),
    ('cfb-build-qb-michael-penix-jr-2023', 2023, 'Washington', 'cfbfast-r-player-4360423-michael-penix-jr'),
    ('cfb-build-qb-bo-nix-2023', 2023, 'Oregon', 'cfbfast-r-player-4426338-bo-nix'),
    ('cfb-build-qb-jayden-daniels-2023', 2023, 'LSU', 'cfbfast-r-player-4426348-jayden-daniels'),
    ('cfb-build-qb-j-j-mccarthy-2023', 2023, 'Michigan', 'cfbfast-r-player-4433970-j-j-mccarthy'),
    ('cfb-build-qb-jordan-travis-2023', 2023, 'Florida State', 'cfbfast-r-player-4360799-jordan-travis'),
    ('cfb-build-qb-quinn-ewers-2023', 2023, 'Texas', 'cfbfast-r-player-4889929-quinn-ewers'),
    ('cfb-build-qb-dillon-gabriel-2024', 2024, 'Oregon', 'cfbfast-r-player-4427238-dillon-gabriel'),
    ('cfb-build-qb-shedeur-sanders-2024', 2024, 'Colorado', 'cfbfast-r-player-4432762-shedeur-sanders'),
    ('cfb-build-qb-cameron-ward-2024', 2024, 'Miami', 'cfbfast-r-player-4688380-cameron-ward'),
    ('cfb-build-qb-jaxson-dart-2024', 2024, 'Ole Miss', 'cfbfast-r-player-4689114-jaxson-dart'),
    ('cfb-build-qb-will-howard-2024', 2024, 'Ohio State', 'cfbfast-r-player-4429955-will-howard'),
    ('cfb-build-qb-kyle-mccord-2024', 2024, 'Syracuse', 'cfbfast-r-player-4433971-kyle-mccord'),
    ('cfb-build-qb-jalen-milroe-2023', 2023, 'Alabama', 'cfbfast-r-player-4432734-jalen-milroe'),
    ('cfb-build-qb-carson-beck-2023', 2023, 'Georgia', 'cfbfast-r-player-4430841-carson-beck'),
    ('cfb-build-qb-riley-leonard-2024', 2024, 'Notre Dame', 'cfbfast-r-player-4683423-riley-leonard'),
    ('cfb-build-qb-kaidon-salter-2023', 2023, 'Liberty', 'cfbfast-r-player-4432803-kaidon-salter'),
    ('cfb-build-qb-grayson-mccall-2021', 2021, 'Coastal Carolina', 'cfbfast-r-player-4427936-grayson-mccall'),
    ('cfb-build-qb-deriq-king-2018', 2018, 'Houston', 'cfbfast-r-player-4039300-d-eriq-king')
)
update private.auction_catalog as catalog
set display_description =
  exact_identity.peak_season::text || ' ' || exact_identity.school
  || ' peak-season CFB QB profile · ' || exact_identity.canonical_player_id
from exact_identity
where catalog.content_version = 'football-draft-room-2026-09-v4'
  and catalog.mode_id = 'build-qb-cfb'
  and catalog.item_reference = exact_identity.item_reference;
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
