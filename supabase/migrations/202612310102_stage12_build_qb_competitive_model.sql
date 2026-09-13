-- Stage 12 competitive-model rotation for Build a QB.
-- The shared sealed-bid engine remains the only runtime owner; this migration only
-- rotates the Draft Room catalog, hidden composition inputs and audited trait grades.

update private.auction_catalog_versions
set is_preparation_version = false
where game_id = 'draft-room'
  and is_preparation_version;

insert into private.auction_catalog_versions (
  content_version,
  rarity_version,
  grading_version,
  is_preparation_version,
  game_id
) values (
  'football-draft-room-2026-09-v2',
  'football-draft-room-rarity-2026-09-v2',
  'football-build-qb-traits-2026-09-v1',
  true,
  'draft-room'
);

insert into private.auction_catalog (
  content_version,
  mode_id,
  item_reference,
  display_label,
  rarity_band,
  display_description,
  generation_weight,
  private_generation_class,
  grading_inputs
) values
  ('football-draft-room-2026-09-v2','build-qb','build-qb-tom-brady','Tom Brady',5,'Audited multi-source NFL QB profile from Football position-trait model v2',0.18,'qb',jsonb_build_object('Arm',78,'Accuracy',93,'Processing',99,'Mobility',42,'Clutch',99,'overall',82)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-peyton-manning','Peyton Manning',5,'Audited multi-source NFL QB profile from Football position-trait model v2',0.18,'qb',jsonb_build_object('Arm',86,'Accuracy',93,'Processing',99,'Mobility',42,'Clutch',93,'overall',83)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-joe-montana','Joe Montana',5,'Audited multi-source NFL QB profile from Football position-trait model v2',0.18,'qb',jsonb_build_object('Arm',78,'Accuracy',93,'Processing',99,'Mobility',69,'Clutch',99,'overall',88)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-patrick-mahomes','Patrick Mahomes',5,'Audited multi-source NFL QB profile from Football position-trait model v2',0.18,'qb',jsonb_build_object('Arm',99,'Accuracy',93,'Processing',93,'Mobility',93,'Clutch',99,'overall',95)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-aaron-rodgers','Aaron Rodgers',5,'Audited multi-source NFL QB profile from Football position-trait model v2',0.18,'qb',jsonb_build_object('Arm',93,'Accuracy',99,'Processing',99,'Mobility',86,'Clutch',86,'overall',93)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-dan-marino','Dan Marino',5,'Audited multi-source NFL QB profile from Football position-trait model v2',0.18,'qb',jsonb_build_object('Arm',99,'Accuracy',93,'Processing',99,'Mobility',42,'Clutch',78,'overall',82)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-drew-brees','Drew Brees',5,'Audited multi-source NFL QB profile from Football position-trait model v2',0.18,'qb',jsonb_build_object('Arm',69,'Accuracy',99,'Processing',93,'Mobility',50,'Clutch',93,'overall',81)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-brett-favre','Brett Favre',5,'Audited multi-source NFL QB profile from Football position-trait model v2',0.18,'qb',jsonb_build_object('Arm',99,'Accuracy',78,'Processing',69,'Mobility',78,'Clutch',86,'overall',82)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-johnny-unitas','Johnny Unitas',5,'Audited multi-source NFL QB profile from Football position-trait model v2',0.18,'qb',jsonb_build_object('Arm',86,'Accuracy',86,'Processing',93,'Mobility',60,'Clutch',93,'overall',84)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-john-elway','John Elway',5,'Audited multi-source NFL QB profile from Football position-trait model v2',0.18,'qb',jsonb_build_object('Arm',99,'Accuracy',78,'Processing',86,'Mobility',86,'Clutch',99,'overall',90)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-steve-young','Steve Young',4,'Audited multi-source NFL QB profile from Football position-trait model v2',0.70,'qb',jsonb_build_object('Arm',86,'Accuracy',93,'Processing',93,'Mobility',93,'Clutch',93,'overall',92)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-roger-staubach','Roger Staubach',4,'Audited multi-source NFL QB profile from Football position-trait model v2',0.70,'qb',jsonb_build_object('Arm',86,'Accuracy',86,'Processing',93,'Mobility',93,'Clutch',99,'overall',91)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-terry-bradshaw','Terry Bradshaw',4,'Audited multi-source NFL QB profile from Football position-trait model v2',0.70,'qb',jsonb_build_object('Arm',93,'Accuracy',69,'Processing',78,'Mobility',78,'Clutch',99,'overall',83)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-fran-tarkenton','Fran Tarkenton',4,'Audited multi-source NFL QB profile from Football position-trait model v2',0.70,'qb',jsonb_build_object('Arm',78,'Accuracy',86,'Processing',86,'Mobility',93,'Clutch',86,'overall',86)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-dan-fouts','Dan Fouts',4,'Audited multi-source NFL QB profile from Football position-trait model v2',0.70,'qb',jsonb_build_object('Arm',93,'Accuracy',86,'Processing',93,'Mobility',50,'Clutch',78,'overall',80)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-kurt-warner','Kurt Warner',4,'Audited multi-source NFL QB profile from Football position-trait model v2',0.70,'qb',jsonb_build_object('Arm',86,'Accuracy',93,'Processing',93,'Mobility',42,'Clutch',99,'overall',83)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-warren-moon','Warren Moon',4,'Audited multi-source NFL QB profile from Football position-trait model v2',0.70,'qb',jsonb_build_object('Arm',99,'Accuracy',86,'Processing',86,'Mobility',78,'Clutch',78,'overall',85)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-jim-kelly','Jim Kelly',4,'Audited multi-source NFL QB profile from Football position-trait model v2',0.70,'qb',jsonb_build_object('Arm',93,'Accuracy',86,'Processing',93,'Mobility',60,'Clutch',86,'overall',84)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-troy-aikman','Troy Aikman',4,'Audited multi-source NFL QB profile from Football position-trait model v2',0.70,'qb',jsonb_build_object('Arm',86,'Accuracy',99,'Processing',93,'Mobility',50,'Clutch',99,'overall',85)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-ben-roethlisberger','Ben Roethlisberger',4,'Audited multi-source NFL QB profile from Football position-trait model v2',0.70,'qb',jsonb_build_object('Arm',93,'Accuracy',86,'Processing',86,'Mobility',86,'Clutch',99,'overall',90)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-philip-rivers','Philip Rivers',4,'Audited multi-source NFL QB profile from Football position-trait model v2',0.70,'qb',jsonb_build_object('Arm',86,'Accuracy',93,'Processing',93,'Mobility',35,'Clutch',78,'overall',77)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-matthew-stafford','Matthew Stafford',4,'Audited multi-source NFL QB profile from Football position-trait model v2',0.70,'qb',jsonb_build_object('Arm',99,'Accuracy',93,'Processing',93,'Mobility',69,'Clutch',93,'overall',89)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-lamar-jackson','Lamar Jackson',4,'Audited multi-source NFL QB profile from Football position-trait model v2',0.70,'qb',jsonb_build_object('Arm',86,'Accuracy',86,'Processing',93,'Mobility',99,'Clutch',93,'overall',91)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-josh-allen','Josh Allen',4,'Audited multi-source NFL QB profile from Football position-trait model v2',0.70,'qb',jsonb_build_object('Arm',99,'Accuracy',86,'Processing',86,'Mobility',99,'Clutch',93,'overall',93)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-eli-manning','Eli Manning',3,'Audited multi-source NFL QB profile from Football position-trait model v2',1.15,'qb',jsonb_build_object('Arm',86,'Accuracy',78,'Processing',78,'Mobility',42,'Clutch',99,'overall',77)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-matt-ryan','Matt Ryan',3,'Audited multi-source NFL QB profile from Football position-trait model v2',1.15,'qb',jsonb_build_object('Arm',78,'Accuracy',93,'Processing',93,'Mobility',50,'Clutch',86,'overall',80)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-russell-wilson','Russell Wilson',3,'Audited multi-source NFL QB profile from Football position-trait model v2',1.15,'qb',jsonb_build_object('Arm',93,'Accuracy',93,'Processing',78,'Mobility',93,'Clutch',93,'overall',90)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-joe-burrow','Joe Burrow',3,'Audited multi-source NFL QB profile from Football position-trait model v2',1.15,'qb',jsonb_build_object('Arm',86,'Accuracy',99,'Processing',99,'Mobility',69,'Clutch',93,'overall',89)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-andrew-luck','Andrew Luck',3,'Audited multi-source NFL QB profile from Football position-trait model v2',1.15,'qb',jsonb_build_object('Arm',93,'Accuracy',86,'Processing',93,'Mobility',93,'Clutch',86,'overall',90)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-cam-newton','Cam Newton',3,'Audited multi-source NFL QB profile from Football position-trait model v2',1.15,'qb',jsonb_build_object('Arm',93,'Accuracy',69,'Processing',78,'Mobility',99,'Clutch',86,'overall',85)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-michael-vick','Michael Vick',3,'Audited multi-source NFL QB profile from Football position-trait model v2',1.15,'qb',jsonb_build_object('Arm',99,'Accuracy',69,'Processing',69,'Mobility',99,'Clutch',69,'overall',81)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-randall-cunningham','Randall Cunningham',3,'Audited multi-source NFL QB profile from Football position-trait model v2',1.15,'qb',jsonb_build_object('Arm',93,'Accuracy',78,'Processing',78,'Mobility',99,'Clutch',78,'overall',85)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-donovan-mcnabb','Donovan McNabb',3,'Audited multi-source NFL QB profile from Football position-trait model v2',1.15,'qb',jsonb_build_object('Arm',86,'Accuracy',78,'Processing',86,'Mobility',93,'Clutch',86,'overall',86)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-steve-mcnair','Steve McNair',3,'Audited multi-source NFL QB profile from Football position-trait model v2',1.15,'qb',jsonb_build_object('Arm',86,'Accuracy',86,'Processing',86,'Mobility',93,'Clutch',93,'overall',89)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-tony-romo','Tony Romo',3,'Audited multi-source NFL QB profile from Football position-trait model v2',1.15,'qb',jsonb_build_object('Arm',78,'Accuracy',93,'Processing',93,'Mobility',78,'Clutch',78,'overall',84)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-carson-palmer','Carson Palmer',3,'Audited multi-source NFL QB profile from Football position-trait model v2',1.15,'qb',jsonb_build_object('Arm',93,'Accuracy',86,'Processing',86,'Mobility',50,'Clutch',69,'overall',77)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-boomer-esiason','Boomer Esiason',3,'Audited multi-source NFL QB profile from Football position-trait model v2',1.15,'qb',jsonb_build_object('Arm',86,'Accuracy',86,'Processing',86,'Mobility',60,'Clutch',86,'overall',81)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-ken-anderson','Ken Anderson',3,'Audited multi-source NFL QB profile from Football position-trait model v2',1.15,'qb',jsonb_build_object('Arm',78,'Accuracy',99,'Processing',93,'Mobility',69,'Clutch',86,'overall',85)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-ken-stabler','Ken Stabler',3,'Audited multi-source NFL QB profile from Football position-trait model v2',1.15,'qb',jsonb_build_object('Arm',78,'Accuracy',86,'Processing',86,'Mobility',69,'Clutch',99,'overall',84)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-joe-namath','Joe Namath',3,'Audited multi-source NFL QB profile from Football position-trait model v2',1.15,'qb',jsonb_build_object('Arm',99,'Accuracy',78,'Processing',78,'Mobility',60,'Clutch',99,'overall',83)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-sonny-jurgensen','Sonny Jurgensen',3,'Audited multi-source NFL QB profile from Football position-trait model v2',1.15,'qb',jsonb_build_object('Arm',93,'Accuracy',93,'Processing',93,'Mobility',50,'Clutch',78,'overall',81)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-len-dawson','Len Dawson',3,'Audited multi-source NFL QB profile from Football position-trait model v2',1.15,'qb',jsonb_build_object('Arm',78,'Accuracy',93,'Processing',93,'Mobility',60,'Clutch',93,'overall',83)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-rich-gannon','Rich Gannon',2,'Audited multi-source NFL QB profile from Football position-trait model v2',1.25,'qb',jsonb_build_object('Arm',69,'Accuracy',93,'Processing',93,'Mobility',78,'Clutch',78,'overall',82)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-joe-flacco','Joe Flacco',2,'Audited multi-source NFL QB profile from Football position-trait model v2',1.25,'qb',jsonb_build_object('Arm',99,'Accuracy',78,'Processing',78,'Mobility',50,'Clutch',99,'overall',81)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-drew-bledsoe','Drew Bledsoe',2,'Audited multi-source NFL QB profile from Football position-trait model v2',1.25,'qb',jsonb_build_object('Arm',99,'Accuracy',78,'Processing',78,'Mobility',35,'Clutch',78,'overall',74)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-daunte-culpepper','Daunte Culpepper',2,'Audited multi-source NFL QB profile from Football position-trait model v2',1.25,'qb',jsonb_build_object('Arm',99,'Accuracy',78,'Processing',69,'Mobility',93,'Clutch',69,'overall',82)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-vinny-testaverde','Vinny Testaverde',2,'Audited multi-source NFL QB profile from Football position-trait model v2',1.25,'qb',jsonb_build_object('Arm',93,'Accuracy',69,'Processing',69,'Mobility',60,'Clutch',78,'overall',74)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-mark-brunell','Mark Brunell',2,'Audited multi-source NFL QB profile from Football position-trait model v2',1.25,'qb',jsonb_build_object('Arm',78,'Accuracy',86,'Processing',86,'Mobility',86,'Clutch',78,'overall',83)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-jim-everett','Jim Everett',2,'Audited multi-source NFL QB profile from Football position-trait model v2',1.25,'qb',jsonb_build_object('Arm',86,'Accuracy',86,'Processing',78,'Mobility',60,'Clutch',69,'overall',76)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-matt-hasselbeck','Matt Hasselbeck',2,'Audited multi-source NFL QB profile from Football position-trait model v2',1.25,'qb',jsonb_build_object('Arm',69,'Accuracy',86,'Processing',93,'Mobility',60,'Clutch',86,'overall',79)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-kirk-cousins','Kirk Cousins',2,'Audited multi-source NFL QB profile from Football position-trait model v2',1.25,'qb',jsonb_build_object('Arm',78,'Accuracy',93,'Processing',93,'Mobility',50,'Clutch',78,'overall',78)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-dak-prescott','Dak Prescott',2,'Audited multi-source NFL QB profile from Football position-trait model v2',1.25,'qb',jsonb_build_object('Arm',93,'Accuracy',86,'Processing',86,'Mobility',86,'Clutch',78,'overall',86)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-jay-cutler','Jay Cutler',1,'Audited multi-source NFL QB profile from Football position-trait model v2',1.00,'qb',jsonb_build_object('Arm',99,'Accuracy',78,'Processing',60,'Mobility',78,'Clutch',69,'overall',77)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-jeff-george','Jeff George',1,'Audited multi-source NFL QB profile from Football position-trait model v2',1.00,'qb',jsonb_build_object('Arm',99,'Accuracy',69,'Processing',50,'Mobility',60,'Clutch',50,'overall',66)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-justin-herbert','Justin Herbert',1,'Audited multi-source NFL QB profile from Football position-trait model v2',1.00,'qb',jsonb_build_object('Arm',99,'Accuracy',93,'Processing',86,'Mobility',86,'Clutch',69,'overall',87)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-jalen-hurts','Jalen Hurts',1,'Audited multi-source NFL QB profile from Football position-trait model v2',1.00,'qb',jsonb_build_object('Arm',86,'Accuracy',78,'Processing',86,'Mobility',99,'Clutch',93,'overall',88)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-kyler-murray','Kyler Murray',1,'Audited multi-source NFL QB profile from Football position-trait model v2',1.00,'qb',jsonb_build_object('Arm',93,'Accuracy',86,'Processing',78,'Mobility',99,'Clutch',69,'overall',85)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-jared-goff','Jared Goff',1,'Audited multi-source NFL QB profile from Football position-trait model v2',1.00,'qb',jsonb_build_object('Arm',86,'Accuracy',93,'Processing',93,'Mobility',42,'Clutch',86,'overall',80)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-baker-mayfield','Baker Mayfield',1,'Audited multi-source NFL QB profile from Football position-trait model v2',1.00,'qb',jsonb_build_object('Arm',93,'Accuracy',86,'Processing',78,'Mobility',78,'Clutch',86,'overall',84)),
  ('football-draft-room-2026-09-v2','build-qb','build-qb-matt-schaub','Matt Schaub',1,'Audited multi-source NFL QB profile from Football position-trait model v2',1.00,'qb',jsonb_build_object('Arm',78,'Accuracy',86,'Processing',86,'Mobility',50,'Clutch',69,'overall',74));

-- Keep one grading owner; extend its version allowlist to the v2 catalog only.
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
    or (v_game.content_version in ('football-draft-room-2026-09-v1', 'football-draft-room-2026-09-v2')
      and v_game.rarity_version in ('football-draft-room-rarity-2026-09-v1', 'football-draft-room-rarity-2026-09-v2')
      and v_game.grading_version = 'football-build-qb-traits-2026-09-v1')
  ) then
    raise exception 'Auction grading version is unsupported';
  end if;

  v_required := case
    when v_game.mode_id = 'build-qb' then 5
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
  v_category_builder := v_game.mode_id in ('ultimate-fighter', 'build-qb');

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
