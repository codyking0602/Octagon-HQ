-- Stage 12 Build a QB recognizability refresh.
-- Rotates the shared Draft Room catalog without changing Auction ownership,
-- lifecycle, bankroll, grading contract, or private release gate.
-- NFL remains 60 unique QBs; CFB remains 80 unique peak-season QBs.

update private.auction_catalog_versions
set is_preparation_version = false
where game_id = 'draft-room'
  and is_preparation_version;

insert into private.auction_catalog_versions (
  content_version, rarity_version, grading_version, is_preparation_version, game_id
) values (
  'football-draft-room-2026-09-v4',
  'football-draft-room-rarity-2026-09-v4',
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

-- NFL: user-approved recognizability replacements. Rarity-band counts stay unchanged.
update private.auction_catalog
set item_reference = 'build-qb-c-j-stroud',
    display_label = 'C.J. Stroud',
    display_description = 'Audited multi-source NFL QB profile from Football position-trait model v3',
    grading_inputs = jsonb_build_object('Arm',93,'Accuracy',93,'Processing',93,'Mobility',78,'Clutch',86,'overall',89)
where content_version = 'football-draft-room-2026-09-v4' and mode_id = 'build-qb' and item_reference = 'build-qb-johnny-unitas';

update private.auction_catalog
set item_reference = 'build-qb-trevor-lawrence',
    display_label = 'Trevor Lawrence',
    display_description = 'Audited multi-source NFL QB profile from Football position-trait model v3',
    grading_inputs = jsonb_build_object('Arm',93,'Accuracy',86,'Processing',86,'Mobility',86,'Clutch',78,'overall',86)
where content_version = 'football-draft-room-2026-09-v4' and mode_id = 'build-qb' and item_reference = 'build-qb-bob-griese';

update private.auction_catalog
set item_reference = 'build-qb-tua-tagovailoa',
    display_label = 'Tua Tagovailoa',
    display_description = 'Audited multi-source NFL QB profile from Football position-trait model v3',
    grading_inputs = jsonb_build_object('Arm',86,'Accuracy',99,'Processing',93,'Mobility',69,'Clutch',78,'overall',85)
where content_version = 'football-draft-room-2026-09-v4' and mode_id = 'build-qb' and item_reference = 'build-qb-dan-fouts';

update private.auction_catalog
set item_reference = 'build-qb-jayden-daniels',
    display_label = 'Jayden Daniels',
    display_description = 'Audited multi-source NFL QB profile from Football position-trait model v3',
    grading_inputs = jsonb_build_object('Arm',93,'Accuracy',93,'Processing',86,'Mobility',99,'Clutch',93,'overall',93)
where content_version = 'football-draft-room-2026-09-v4' and mode_id = 'build-qb' and item_reference = 'build-qb-trent-green';

update private.auction_catalog
set item_reference = 'build-qb-brock-purdy',
    display_label = 'Brock Purdy',
    display_description = 'Audited multi-source NFL QB profile from Football position-trait model v3',
    grading_inputs = jsonb_build_object('Arm',78,'Accuracy',93,'Processing',93,'Mobility',78,'Clutch',93,'overall',87)
where content_version = 'football-draft-room-2026-09-v4' and mode_id = 'build-qb' and item_reference = 'build-qb-ken-anderson';

update private.auction_catalog
set item_reference = 'build-qb-jordan-love',
    display_label = 'Jordan Love',
    display_description = 'Audited multi-source NFL QB profile from Football position-trait model v3',
    grading_inputs = jsonb_build_object('Arm',99,'Accuracy',86,'Processing',86,'Mobility',86,'Clutch',78,'overall',87)
where content_version = 'football-draft-room-2026-09-v4' and mode_id = 'build-qb' and item_reference = 'build-qb-ken-stabler';

update private.auction_catalog
set item_reference = 'build-qb-derek-carr',
    display_label = 'Derek Carr',
    display_description = 'Audited multi-source NFL QB profile from Football position-trait model v3',
    grading_inputs = jsonb_build_object('Arm',93,'Accuracy',86,'Processing',86,'Mobility',69,'Clutch',69,'overall',81)
where content_version = 'football-draft-room-2026-09-v4' and mode_id = 'build-qb' and item_reference = 'build-qb-sonny-jurgensen';

update private.auction_catalog
set item_reference = 'build-qb-ryan-tannehill',
    display_label = 'Ryan Tannehill',
    display_description = 'Audited multi-source NFL QB profile from Football position-trait model v3',
    grading_inputs = jsonb_build_object('Arm',86,'Accuracy',86,'Processing',86,'Mobility',86,'Clutch',69,'overall',83)
where content_version = 'football-draft-room-2026-09-v4' and mode_id = 'build-qb' and item_reference = 'build-qb-len-dawson';

update private.auction_catalog
set item_reference = 'build-qb-nick-foles',
    display_label = 'Nick Foles',
    display_description = 'Audited multi-source NFL QB profile from Football position-trait model v3',
    grading_inputs = jsonb_build_object('Arm',86,'Accuracy',86,'Processing',78,'Mobility',50,'Clutch',99,'overall',80)
where content_version = 'football-draft-room-2026-09-v4' and mode_id = 'build-qb' and item_reference = 'build-qb-rich-gannon';

update private.auction_catalog
set item_reference = 'build-qb-carson-wentz',
    display_label = 'Carson Wentz',
    display_description = 'Audited multi-source NFL QB profile from Football position-trait model v3',
    grading_inputs = jsonb_build_object('Arm',93,'Accuracy',78,'Processing',69,'Mobility',86,'Clutch',78,'overall',81)
where content_version = 'football-draft-room-2026-09-v4' and mode_id = 'build-qb' and item_reference = 'build-qb-mark-brunell';

update private.auction_catalog
set item_reference = 'build-qb-jimmy-garoppolo',
    display_label = 'Jimmy Garoppolo',
    display_description = 'Audited multi-source NFL QB profile from Football position-trait model v3',
    grading_inputs = jsonb_build_object('Arm',69,'Accuracy',93,'Processing',86,'Mobility',50,'Clutch',86,'overall',77)
where content_version = 'football-draft-room-2026-09-v4' and mode_id = 'build-qb' and item_reference = 'build-qb-matt-schaub';

-- CFB: user-approved modern replacements. Each row is one exact college peak season.
update private.auction_catalog
set item_reference = 'cfb-build-qb-andrew-luck-2011',
    display_label = 'Andrew Luck',
    display_description = '2011 Stanford peak-season CFB QB profile · cfb-andrew-luck',
    grading_inputs = jsonb_build_object('Arm',99,'Accuracy',93,'Processing',99,'Mobility',93,'Clutch',99,'overall',97)
where content_version = 'football-draft-room-2026-09-v4' and mode_id = 'build-qb-cfb' and item_reference = 'cfb-build-qb-danny-wuerffel-1996';

update private.auction_catalog
set item_reference = 'cfb-build-qb-russell-wilson-2011',
    display_label = 'Russell Wilson',
    display_description = '2011 Wisconsin peak-season CFB QB profile · cfb-russell-wilson',
    grading_inputs = jsonb_build_object('Arm',93,'Accuracy',99,'Processing',93,'Mobility',99,'Clutch',99,'overall',97)
where content_version = 'football-draft-room-2026-09-v4' and mode_id = 'build-qb-cfb' and item_reference = 'cfb-build-qb-jim-plunkett-1970';

update private.auction_catalog
set item_reference = 'cfb-build-qb-michael-vick-1999',
    display_label = 'Michael Vick',
    display_description = '1999 Virginia Tech peak-season CFB QB profile · cfb-michael-vick',
    grading_inputs = jsonb_build_object('Arm',93,'Accuracy',86,'Processing',78,'Mobility',99,'Clutch',99,'overall',91)
where content_version = 'football-draft-room-2026-09-v4' and mode_id = 'build-qb-cfb' and item_reference = 'cfb-build-qb-hendon-hooker-2022';

update private.auction_catalog
set item_reference = 'cfb-build-qb-aaron-rodgers-2004',
    display_label = 'Aaron Rodgers',
    display_description = '2004 California peak-season CFB QB profile · cfb-aaron-rodgers',
    grading_inputs = jsonb_build_object('Arm',99,'Accuracy',99,'Processing',99,'Mobility',78,'Clutch',86,'overall',92)
where content_version = 'football-draft-room-2026-09-v4' and mode_id = 'build-qb-cfb' and item_reference = 'cfb-build-qb-vinny-testaverde-1986';

update private.auction_catalog
set item_reference = 'cfb-build-qb-matt-ryan-2007',
    display_label = 'Matt Ryan',
    display_description = '2007 Boston College peak-season CFB QB profile · cfb-matt-ryan',
    grading_inputs = jsonb_build_object('Arm',93,'Accuracy',93,'Processing',99,'Mobility',69,'Clutch',99,'overall',91)
where content_version = 'football-draft-room-2026-09-v4' and mode_id = 'build-qb-cfb' and item_reference = 'cfb-build-qb-ty-detmer-1990';

update private.auction_catalog
set item_reference = 'cfb-build-qb-jimmy-clausen-2009',
    display_label = 'Jimmy Clausen',
    display_description = '2009 Notre Dame peak-season CFB QB profile · cfb-jimmy-clausen',
    grading_inputs = jsonb_build_object('Arm',93,'Accuracy',99,'Processing',93,'Mobility',69,'Clutch',86,'overall',88)
where content_version = 'football-draft-room-2026-09-v4' and mode_id = 'build-qb-cfb' and item_reference = 'cfb-build-qb-gino-torretta-1992';

update private.auction_catalog
set item_reference = 'cfb-build-qb-sam-ehlinger-2018',
    display_label = 'Sam Ehlinger',
    display_description = '2018 Texas peak-season CFB QB profile · cfb-sam-ehlinger',
    grading_inputs = jsonb_build_object('Arm',86,'Accuracy',93,'Processing',93,'Mobility',93,'Clutch',99,'overall',93)
where content_version = 'football-draft-room-2026-09-v4' and mode_id = 'build-qb-cfb' and item_reference = 'cfb-build-qb-andre-ware-1989';

update private.auction_catalog
set item_reference = 'cfb-build-qb-teddy-bridgewater-2013',
    display_label = 'Teddy Bridgewater',
    display_description = '2013 Louisville peak-season CFB QB profile · cfb-teddy-bridgewater',
    grading_inputs = jsonb_build_object('Arm',86,'Accuracy',99,'Processing',99,'Mobility',86,'Clutch',93,'overall',93)
where content_version = 'football-draft-room-2026-09-v4' and mode_id = 'build-qb-cfb' and item_reference = 'cfb-build-qb-eric-crouch-2001';

update private.auction_catalog
set item_reference = 'cfb-build-qb-marcus-vick-2005',
    display_label = 'Marcus Vick',
    display_description = '2005 Virginia Tech peak-season CFB QB profile · cfb-marcus-vick',
    grading_inputs = jsonb_build_object('Arm',93,'Accuracy',86,'Processing',86,'Mobility',99,'Clutch',78,'overall',88)
where content_version = 'football-draft-room-2026-09-v4' and mode_id = 'build-qb-cfb' and item_reference = 'cfb-build-qb-chris-weinke-2000';

do $$
begin
  if (
    select count(*) from private.auction_catalog
    where content_version = 'football-draft-room-2026-09-v4' and mode_id = 'build-qb'
  ) <> 60 then
    raise exception 'NFL Build a QB v4 must contain exactly 60 QBs';
  end if;

  if (
    select count(*) from private.auction_catalog
    where content_version = 'football-draft-room-2026-09-v4' and mode_id = 'build-qb-cfb'
  ) <> 80 then
    raise exception 'CFB Build a QB v4 must contain exactly 80 QBs';
  end if;

  if exists (
    select 1 from private.auction_catalog
    where content_version = 'football-draft-room-2026-09-v4'
      and display_label in (
        'Johnny Unitas','Bob Griese','Dan Fouts','Trent Green','Ken Anderson','Ken Stabler',
        'Sonny Jurgensen','Len Dawson','Rich Gannon','Mark Brunell','Matt Schaub',
        'Danny Wuerffel','Jim Plunkett','Hendon Hooker','Vinny Testaverde','Ty Detmer',
        'Gino Torretta','Andre Ware','Eric Crouch','Chris Weinke'
      )
  ) then
    raise exception 'Build a QB v4 still contains a user-removed QB';
  end if;
end;
$$;


-- Keep the existing shared grader owner and extend its immutable-version allowlist to v4.
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
