-- Stage 12 CFB Build a QB grading-only audit.
-- Keeps the user-approved NFL 60 and CFB 80 memberships, exact CFB peak-season
-- identities, rarity bands, generation weights, Auction lifecycle and private gate.
-- Only CFB grading inputs and their audited evidence owner advance.

update private.auction_catalog_versions
set is_preparation_version = false
where game_id = 'draft-room'
  and is_preparation_version;

insert into private.auction_catalog_versions (
  content_version, rarity_version, grading_version, is_preparation_version, game_id
) values (
  'football-draft-room-2026-09-v5',
  'football-draft-room-rarity-2026-09-v4',
  'football-build-qb-traits-2026-09-v1',
  true,
  'draft-room'
);

-- NFL membership, rarity and grades are copied byte-for-byte into the shared v5 content version.
insert into private.auction_catalog (
  content_version, mode_id, item_reference, display_label, rarity_band,
  display_description, generation_weight, private_generation_class, grading_inputs
)
select
  'football-draft-room-2026-09-v5',
  source.mode_id,
  source.item_reference,
  source.display_label,
  source.rarity_band,
  source.display_description,
  source.generation_weight,
  source.private_generation_class,
  source.grading_inputs
from private.auction_catalog source
where source.content_version = 'football-draft-room-2026-09-v4'
  and source.mode_id = 'build-qb';

-- CFB membership/identity/rarity stay fixed; only the 80 audited grading packets advance.
insert into private.auction_catalog (
  content_version, mode_id, item_reference, display_label, rarity_band,
  display_description, generation_weight, private_generation_class, grading_inputs
)
select
  'football-draft-room-2026-09-v5',
  source.mode_id,
  source.item_reference,
  source.display_label,
  source.rarity_band,
  source.display_description,
  source.generation_weight,
  source.private_generation_class,
  case source.item_reference
    when 'cfb-build-qb-cam-newton-2010' then jsonb_build_object('Arm',93,'Accuracy',93,'Processing',86,'Mobility',99,'Clutch',99,'overall',94)
    when 'cfb-build-qb-vince-young-2005' then jsonb_build_object('Arm',93,'Accuracy',86,'Processing',86,'Mobility',99,'Clutch',99,'overall',93)
    when 'cfb-build-qb-tim-tebow-2007' then jsonb_build_object('Arm',86,'Accuracy',86,'Processing',86,'Mobility',99,'Clutch',93,'overall',90)
    when 'cfb-build-qb-matt-leinart-2004' then jsonb_build_object('Arm',86,'Accuracy',93,'Processing',93,'Mobility',69,'Clutch',99,'overall',88)
    when 'cfb-build-qb-johnny-manziel-2012' then jsonb_build_object('Arm',86,'Accuracy',86,'Processing',78,'Mobility',99,'Clutch',93,'overall',88)
    when 'cfb-build-qb-colt-mccoy-2008' then jsonb_build_object('Arm',78,'Accuracy',99,'Processing',93,'Mobility',86,'Clutch',93,'overall',90)
    when 'cfb-build-qb-sam-bradford-2008' then jsonb_build_object('Arm',93,'Accuracy',99,'Processing',93,'Mobility',69,'Clutch',93,'overall',89)
    when 'cfb-build-qb-jameis-winston-2013' then jsonb_build_object('Arm',93,'Accuracy',93,'Processing',86,'Mobility',78,'Clutch',99,'overall',90)
    when 'cfb-build-qb-robert-griffin-iii-2011' then jsonb_build_object('Arm',93,'Accuracy',99,'Processing',93,'Mobility',99,'Clutch',93,'overall',95)
    when 'cfb-build-qb-doug-flutie-1984' then jsonb_build_object('Arm',86,'Accuracy',86,'Processing',86,'Mobility',93,'Clutch',99,'overall',90)
    when 'cfb-build-qb-aaron-rodgers-2004' then jsonb_build_object('Arm',93,'Accuracy',99,'Processing',93,'Mobility',78,'Clutch',86,'overall',90)
    when 'cfb-build-qb-charlie-ward-1993' then jsonb_build_object('Arm',86,'Accuracy',93,'Processing',93,'Mobility',93,'Clutch',99,'overall',93)
    when 'cfb-build-qb-andrew-luck-2011' then jsonb_build_object('Arm',93,'Accuracy',99,'Processing',99,'Mobility',86,'Clutch',93,'overall',94)
    when 'cfb-build-qb-matt-ryan-2007' then jsonb_build_object('Arm',86,'Accuracy',86,'Processing',93,'Mobility',69,'Clutch',99,'overall',87)
    when 'cfb-build-qb-jimmy-clausen-2009' then jsonb_build_object('Arm',93,'Accuracy',99,'Processing',93,'Mobility',60,'Clutch',78,'overall',85)
    when 'cfb-build-qb-sam-ehlinger-2018' then jsonb_build_object('Arm',86,'Accuracy',86,'Processing',86,'Mobility',99,'Clutch',99,'overall',91)
    when 'cfb-build-qb-teddy-bridgewater-2013' then jsonb_build_object('Arm',86,'Accuracy',99,'Processing',99,'Mobility',86,'Clutch',93,'overall',93)
    when 'cfb-build-qb-russell-wilson-2011' then jsonb_build_object('Arm',93,'Accuracy',99,'Processing',99,'Mobility',93,'Clutch',99,'overall',97)
    when 'cfb-build-qb-roger-staubach-1963' then jsonb_build_object('Arm',86,'Accuracy',93,'Processing',99,'Mobility',99,'Clutch',99,'overall',95)
    when 'cfb-build-qb-troy-smith-2006' then jsonb_build_object('Arm',93,'Accuracy',93,'Processing',93,'Mobility',93,'Clutch',93,'overall',93)
    when 'cfb-build-qb-brady-quinn-2005' then jsonb_build_object('Arm',93,'Accuracy',86,'Processing',93,'Mobility',69,'Clutch',78,'overall',84)
    when 'cfb-build-qb-carson-palmer-2002' then jsonb_build_object('Arm',99,'Accuracy',93,'Processing',93,'Mobility',69,'Clutch',93,'overall',89)
    when 'cfb-build-qb-marcus-vick-2005' then jsonb_build_object('Arm',93,'Accuracy',86,'Processing',78,'Mobility',99,'Clutch',78,'overall',87)
    when 'cfb-build-qb-jason-white-2003' then jsonb_build_object('Arm',93,'Accuracy',93,'Processing',93,'Mobility',50,'Clutch',86,'overall',83)
    when 'cfb-build-qb-marcus-mariota-2014' then jsonb_build_object('Arm',86,'Accuracy',99,'Processing',99,'Mobility',99,'Clutch',93,'overall',95)
    when 'cfb-build-qb-dak-prescott-2014' then jsonb_build_object('Arm',86,'Accuracy',86,'Processing',86,'Mobility',99,'Clutch',93,'overall',90)
    when 'cfb-build-qb-jared-goff-2015' then jsonb_build_object('Arm',93,'Accuracy',93,'Processing',93,'Mobility',60,'Clutch',78,'overall',83)
    when 'cfb-build-qb-patrick-mahomes-2016' then jsonb_build_object('Arm',99,'Accuracy',93,'Processing',86,'Mobility',93,'Clutch',86,'overall',91)
    when 'cfb-build-qb-deshaun-watson-2016' then jsonb_build_object('Arm',93,'Accuracy',93,'Processing',93,'Mobility',93,'Clutch',99,'overall',94)
    when 'cfb-build-qb-lamar-jackson-2016' then jsonb_build_object('Arm',86,'Accuracy',86,'Processing',86,'Mobility',99,'Clutch',86,'overall',89)
    when 'cfb-build-qb-baker-mayfield-2017' then jsonb_build_object('Arm',93,'Accuracy',99,'Processing',99,'Mobility',86,'Clutch',93,'overall',94)
    when 'cfb-build-qb-josh-allen-2016' then jsonb_build_object('Arm',99,'Accuracy',69,'Processing',69,'Mobility',93,'Clutch',78,'overall',82)
    when 'cfb-build-qb-drew-lock-2017' then jsonb_build_object('Arm',99,'Accuracy',78,'Processing',78,'Mobility',69,'Clutch',69,'overall',79)
    when 'cfb-build-qb-mason-rudolph-2017' then jsonb_build_object('Arm',93,'Accuracy',93,'Processing',86,'Mobility',69,'Clutch',78,'overall',84)
    when 'cfb-build-qb-sam-darnold-2016' then jsonb_build_object('Arm',93,'Accuracy',86,'Processing',86,'Mobility',86,'Clutch',93,'overall',89)
    when 'cfb-build-qb-gardner-minshew-2018' then jsonb_build_object('Arm',78,'Accuracy',93,'Processing',93,'Mobility',78,'Clutch',93,'overall',87)
    when 'cfb-build-qb-kyler-murray-2018' then jsonb_build_object('Arm',99,'Accuracy',93,'Processing',93,'Mobility',99,'Clutch',93,'overall',95)
    when 'cfb-build-qb-tua-tagovailoa-2018' then jsonb_build_object('Arm',86,'Accuracy',99,'Processing',99,'Mobility',86,'Clutch',93,'overall',93)
    when 'cfb-build-qb-trevor-lawrence-2019' then jsonb_build_object('Arm',99,'Accuracy',93,'Processing',93,'Mobility',93,'Clutch',93,'overall',94)
    when 'cfb-build-qb-joe-burrow-2019' then jsonb_build_object('Arm',93,'Accuracy',99,'Processing',99,'Mobility',86,'Clutch',99,'overall',95)
    when 'cfb-build-qb-jalen-hurts-2019' then jsonb_build_object('Arm',86,'Accuracy',93,'Processing',93,'Mobility',99,'Clutch',99,'overall',94)
    when 'cfb-build-qb-justin-fields-2019' then jsonb_build_object('Arm',93,'Accuracy',99,'Processing',93,'Mobility',99,'Clutch',93,'overall',95)
    when 'cfb-build-qb-justin-herbert-2019' then jsonb_build_object('Arm',99,'Accuracy',86,'Processing',86,'Mobility',86,'Clutch',93,'overall',90)
    when 'cfb-build-qb-jordan-love-2018' then jsonb_build_object('Arm',99,'Accuracy',86,'Processing',78,'Mobility',86,'Clutch',78,'overall',85)
    when 'cfb-build-qb-mac-jones-2020' then jsonb_build_object('Arm',86,'Accuracy',99,'Processing',99,'Mobility',60,'Clutch',99,'overall',89)
    when 'cfb-build-qb-kyle-trask-2020' then jsonb_build_object('Arm',86,'Accuracy',93,'Processing',93,'Mobility',60,'Clutch',86,'overall',84)
    when 'cfb-build-qb-zach-wilson-2020' then jsonb_build_object('Arm',99,'Accuracy',99,'Processing',93,'Mobility',93,'Clutch',86,'overall',94)
    when 'cfb-build-qb-sam-howell-2020' then jsonb_build_object('Arm',93,'Accuracy',93,'Processing',86,'Mobility',93,'Clutch',86,'overall',90)
    when 'cfb-build-qb-spencer-rattler-2020' then jsonb_build_object('Arm',99,'Accuracy',93,'Processing',86,'Mobility',86,'Clutch',78,'overall',88)
    when 'cfb-build-qb-brock-purdy-2020' then jsonb_build_object('Arm',78,'Accuracy',86,'Processing',86,'Mobility',86,'Clutch',86,'overall',84)
    when 'cfb-build-qb-bryce-young-2021' then jsonb_build_object('Arm',86,'Accuracy',99,'Processing',99,'Mobility',93,'Clutch',99,'overall',95)
    when 'cfb-build-qb-c-j-stroud-2021' then jsonb_build_object('Arm',99,'Accuracy',99,'Processing',93,'Mobility',69,'Clutch',86,'overall',89)
    when 'cfb-build-qb-kenny-pickett-2021' then jsonb_build_object('Arm',86,'Accuracy',93,'Processing',93,'Mobility',86,'Clutch',93,'overall',90)
    when 'cfb-build-qb-bailey-zappe-2021' then jsonb_build_object('Arm',78,'Accuracy',93,'Processing',93,'Mobility',50,'Clutch',86,'overall',80)
    when 'cfb-build-qb-matt-corral-2021' then jsonb_build_object('Arm',93,'Accuracy',93,'Processing',86,'Mobility',93,'Clutch',86,'overall',90)
    when 'cfb-build-qb-malik-willis-2021' then jsonb_build_object('Arm',99,'Accuracy',69,'Processing',69,'Mobility',99,'Clutch',69,'overall',81)
    when 'cfb-build-qb-sam-hartman-2021' then jsonb_build_object('Arm',86,'Accuracy',86,'Processing',86,'Mobility',78,'Clutch',78,'overall',83)
    when 'cfb-build-qb-caleb-williams-2022' then jsonb_build_object('Arm',99,'Accuracy',93,'Processing',93,'Mobility',99,'Clutch',93,'overall',95)
    when 'cfb-build-qb-max-duggan-2022' then jsonb_build_object('Arm',86,'Accuracy',86,'Processing',86,'Mobility',93,'Clutch',99,'overall',90)
    when 'cfb-build-qb-drake-maye-2022' then jsonb_build_object('Arm',99,'Accuracy',93,'Processing',93,'Mobility',93,'Clutch',86,'overall',93)
    when 'cfb-build-qb-michael-vick-1999' then jsonb_build_object('Arm',99,'Accuracy',78,'Processing',78,'Mobility',99,'Clutch',99,'overall',91)
    when 'cfb-build-qb-stetson-bennett-2022' then jsonb_build_object('Arm',78,'Accuracy',93,'Processing',93,'Mobility',86,'Clutch',99,'overall',90)
    when 'cfb-build-qb-michael-penix-jr-2023' then jsonb_build_object('Arm',99,'Accuracy',93,'Processing',93,'Mobility',60,'Clutch',99,'overall',89)
    when 'cfb-build-qb-bo-nix-2023' then jsonb_build_object('Arm',86,'Accuracy',99,'Processing',99,'Mobility',86,'Clutch',93,'overall',93)
    when 'cfb-build-qb-jayden-daniels-2023' then jsonb_build_object('Arm',93,'Accuracy',99,'Processing',99,'Mobility',99,'Clutch',93,'overall',97)
    when 'cfb-build-qb-j-j-mccarthy-2023' then jsonb_build_object('Arm',93,'Accuracy',93,'Processing',93,'Mobility',86,'Clutch',99,'overall',93)
    when 'cfb-build-qb-jordan-travis-2023' then jsonb_build_object('Arm',86,'Accuracy',93,'Processing',93,'Mobility',93,'Clutch',99,'overall',93)
    when 'cfb-build-qb-quinn-ewers-2023' then jsonb_build_object('Arm',93,'Accuracy',93,'Processing',86,'Mobility',69,'Clutch',93,'overall',87)
    when 'cfb-build-qb-dillon-gabriel-2024' then jsonb_build_object('Arm',86,'Accuracy',93,'Processing',99,'Mobility',86,'Clutch',93,'overall',91)
    when 'cfb-build-qb-shedeur-sanders-2024' then jsonb_build_object('Arm',93,'Accuracy',99,'Processing',93,'Mobility',78,'Clutch',86,'overall',90)
    when 'cfb-build-qb-cameron-ward-2024' then jsonb_build_object('Arm',99,'Accuracy',93,'Processing',93,'Mobility',93,'Clutch',86,'overall',93)
    when 'cfb-build-qb-jaxson-dart-2024' then jsonb_build_object('Arm',93,'Accuracy',93,'Processing',93,'Mobility',86,'Clutch',86,'overall',90)
    when 'cfb-build-qb-will-howard-2024' then jsonb_build_object('Arm',93,'Accuracy',93,'Processing',93,'Mobility',86,'Clutch',99,'overall',93)
    when 'cfb-build-qb-kyle-mccord-2024' then jsonb_build_object('Arm',93,'Accuracy',93,'Processing',86,'Mobility',60,'Clutch',86,'overall',84)
    when 'cfb-build-qb-jalen-milroe-2023' then jsonb_build_object('Arm',99,'Accuracy',78,'Processing',78,'Mobility',99,'Clutch',93,'overall',89)
    when 'cfb-build-qb-carson-beck-2023' then jsonb_build_object('Arm',93,'Accuracy',93,'Processing',93,'Mobility',69,'Clutch',86,'overall',87)
    when 'cfb-build-qb-riley-leonard-2024' then jsonb_build_object('Arm',78,'Accuracy',86,'Processing',93,'Mobility',99,'Clutch',99,'overall',91)
    when 'cfb-build-qb-kaidon-salter-2023' then jsonb_build_object('Arm',93,'Accuracy',86,'Processing',78,'Mobility',99,'Clutch',86,'overall',88)
    when 'cfb-build-qb-grayson-mccall-2021' then jsonb_build_object('Arm',78,'Accuracy',99,'Processing',93,'Mobility',86,'Clutch',93,'overall',90)
    when 'cfb-build-qb-deriq-king-2018' then jsonb_build_object('Arm',86,'Accuracy',86,'Processing',86,'Mobility',99,'Clutch',78,'overall',87)
    else source.grading_inputs
  end
from private.auction_catalog source
where source.content_version = 'football-draft-room-2026-09-v4'
  and source.mode_id = 'build-qb-cfb';

do $$
begin
  if (select count(*) from private.auction_catalog where content_version='football-draft-room-2026-09-v5' and mode_id='build-qb') <> 60 then
    raise exception 'NFL Build a QB v5 must contain exactly 60 QBs';
  end if;

  if (select count(*) from private.auction_catalog where content_version='football-draft-room-2026-09-v5' and mode_id='build-qb-cfb') <> 80 then
    raise exception 'CFB Build a QB v5 must contain exactly 80 QBs';
  end if;

  if exists (
    (select item_reference, display_label, rarity_band, display_description, generation_weight, private_generation_class, grading_inputs
     from private.auction_catalog where content_version='football-draft-room-2026-09-v5' and mode_id='build-qb')
    except
    (select item_reference, display_label, rarity_band, display_description, generation_weight, private_generation_class, grading_inputs
     from private.auction_catalog where content_version='football-draft-room-2026-09-v4' and mode_id='build-qb')
  ) or exists (
    (select item_reference, display_label, rarity_band, display_description, generation_weight, private_generation_class, grading_inputs
     from private.auction_catalog where content_version='football-draft-room-2026-09-v4' and mode_id='build-qb')
    except
    (select item_reference, display_label, rarity_band, display_description, generation_weight, private_generation_class, grading_inputs
     from private.auction_catalog where content_version='football-draft-room-2026-09-v5' and mode_id='build-qb')
  ) then
    raise exception 'CFB grading audit must not change NFL Build a QB';
  end if;

  if exists (
    (select item_reference, display_label, rarity_band, display_description, generation_weight, private_generation_class
     from private.auction_catalog where content_version='football-draft-room-2026-09-v5' and mode_id='build-qb-cfb')
    except
    (select item_reference, display_label, rarity_band, display_description, generation_weight, private_generation_class
     from private.auction_catalog where content_version='football-draft-room-2026-09-v4' and mode_id='build-qb-cfb')
  ) or exists (
    (select item_reference, display_label, rarity_band, display_description, generation_weight, private_generation_class
     from private.auction_catalog where content_version='football-draft-room-2026-09-v4' and mode_id='build-qb-cfb')
    except
    (select item_reference, display_label, rarity_band, display_description, generation_weight, private_generation_class
     from private.auction_catalog where content_version='football-draft-room-2026-09-v5' and mode_id='build-qb-cfb')
  ) then
    raise exception 'CFB grading audit changed membership, identity, rarity or generation';
  end if;

  if not exists (
    select 1
    from private.auction_catalog audited
    join private.auction_catalog prior
      on prior.content_version='football-draft-room-2026-09-v4'
     and prior.mode_id=audited.mode_id
     and prior.item_reference=audited.item_reference
    where audited.content_version='football-draft-room-2026-09-v5'
      and audited.mode_id='build-qb-cfb'
      and audited.grading_inputs is distinct from prior.grading_inputs
  ) then
    raise exception 'CFB grading audit did not change any grading inputs';
  end if;

  if exists (
    select 1
    from private.auction_catalog catalog
    where catalog.content_version='football-draft-room-2026-09-v5'
      and catalog.mode_id='build-qb-cfb'
      and (
        not (catalog.grading_inputs ?& array['Arm','Accuracy','Processing','Mobility','Clutch','overall'])
        or (catalog.grading_inputs ->> 'Arm')::numeric not between 35 and 99
        or (catalog.grading_inputs ->> 'Accuracy')::numeric not between 35 and 99
        or (catalog.grading_inputs ->> 'Processing')::numeric not between 35 and 99
        or (catalog.grading_inputs ->> 'Mobility')::numeric not between 35 and 99
        or (catalog.grading_inputs ->> 'Clutch')::numeric not between 35 and 99
      )
  ) then
    raise exception 'CFB grading audit produced invalid trait inputs';
  end if;
end;
$$;

-- Same canonical grader owner; only its immutable content-version allowlist advances.
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
    or (v_game.content_version in ('football-draft-room-2026-09-v1', 'football-draft-room-2026-09-v2', 'football-draft-room-2026-09-v3', 'football-draft-room-2026-09-v4', 'football-draft-room-2026-09-v5')
      and v_game.rarity_version in ('football-draft-room-rarity-2026-09-v1', 'football-draft-room-rarity-2026-09-v2', 'football-draft-room-rarity-2026-09-v3', 'football-draft-room-rarity-2026-09-v4')
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

