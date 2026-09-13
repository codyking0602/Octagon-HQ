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
  source.mode_id,
  case source.item_reference
    when 'build-qb-johnny-unitas' then 'build-qb-c-j-stroud'
    when 'build-qb-bob-griese' then 'build-qb-trevor-lawrence'
    when 'build-qb-dan-fouts' then 'build-qb-tua-tagovailoa'
    when 'build-qb-trent-green' then 'build-qb-jayden-daniels'
    when 'build-qb-ken-anderson' then 'build-qb-brock-purdy'
    when 'build-qb-ken-stabler' then 'build-qb-jordan-love'
    when 'build-qb-sonny-jurgensen' then 'build-qb-derek-carr'
    when 'build-qb-len-dawson' then 'build-qb-ryan-tannehill'
    when 'build-qb-rich-gannon' then 'build-qb-nick-foles'
    when 'build-qb-mark-brunell' then 'build-qb-carson-wentz'
    when 'build-qb-matt-schaub' then 'build-qb-jimmy-garoppolo'
    when 'cfb-build-qb-danny-wuerffel-1996' then 'cfb-build-qb-andrew-luck-2011'
    when 'cfb-build-qb-jim-plunkett-1970' then 'cfb-build-qb-russell-wilson-2011'
    when 'cfb-build-qb-hendon-hooker-2022' then 'cfb-build-qb-michael-vick-1999'
    when 'cfb-build-qb-vinny-testaverde-1986' then 'cfb-build-qb-aaron-rodgers-2004'
    when 'cfb-build-qb-ty-detmer-1990' then 'cfb-build-qb-matt-ryan-2007'
    when 'cfb-build-qb-gino-torretta-1992' then 'cfb-build-qb-jimmy-clausen-2009'
    when 'cfb-build-qb-andre-ware-1989' then 'cfb-build-qb-sam-ehlinger-2018'
    when 'cfb-build-qb-eric-crouch-2001' then 'cfb-build-qb-teddy-bridgewater-2013'
    when 'cfb-build-qb-chris-weinke-2000' then 'cfb-build-qb-marcus-vick-2005'
    else source.item_reference
  end,
  case source.item_reference
    when 'build-qb-johnny-unitas' then 'C.J. Stroud'
    when 'build-qb-bob-griese' then 'Trevor Lawrence'
    when 'build-qb-dan-fouts' then 'Tua Tagovailoa'
    when 'build-qb-trent-green' then 'Jayden Daniels'
    when 'build-qb-ken-anderson' then 'Brock Purdy'
    when 'build-qb-ken-stabler' then 'Jordan Love'
    when 'build-qb-sonny-jurgensen' then 'Derek Carr'
    when 'build-qb-len-dawson' then 'Ryan Tannehill'
    when 'build-qb-rich-gannon' then 'Nick Foles'
    when 'build-qb-mark-brunell' then 'Carson Wentz'
    when 'build-qb-matt-schaub' then 'Jimmy Garoppolo'
    when 'cfb-build-qb-danny-wuerffel-1996' then 'Andrew Luck'
    when 'cfb-build-qb-jim-plunkett-1970' then 'Russell Wilson'
    when 'cfb-build-qb-hendon-hooker-2022' then 'Michael Vick'
    when 'cfb-build-qb-vinny-testaverde-1986' then 'Aaron Rodgers'
    when 'cfb-build-qb-ty-detmer-1990' then 'Matt Ryan'
    when 'cfb-build-qb-gino-torretta-1992' then 'Jimmy Clausen'
    when 'cfb-build-qb-andre-ware-1989' then 'Sam Ehlinger'
    when 'cfb-build-qb-eric-crouch-2001' then 'Teddy Bridgewater'
    when 'cfb-build-qb-chris-weinke-2000' then 'Marcus Vick'
    else source.display_label
  end,
  source.rarity_band,
  case source.item_reference
    when 'build-qb-johnny-unitas' then 'Audited multi-source NFL QB profile from Football position-trait model v3'
    when 'build-qb-bob-griese' then 'Audited multi-source NFL QB profile from Football position-trait model v3'
    when 'build-qb-dan-fouts' then 'Audited multi-source NFL QB profile from Football position-trait model v3'
    when 'build-qb-trent-green' then 'Audited multi-source NFL QB profile from Football position-trait model v3'
    when 'build-qb-ken-anderson' then 'Audited multi-source NFL QB profile from Football position-trait model v3'
    when 'build-qb-ken-stabler' then 'Audited multi-source NFL QB profile from Football position-trait model v3'
    when 'build-qb-sonny-jurgensen' then 'Audited multi-source NFL QB profile from Football position-trait model v3'
    when 'build-qb-len-dawson' then 'Audited multi-source NFL QB profile from Football position-trait model v3'
    when 'build-qb-rich-gannon' then 'Audited multi-source NFL QB profile from Football position-trait model v3'
    when 'build-qb-mark-brunell' then 'Audited multi-source NFL QB profile from Football position-trait model v3'
    when 'build-qb-matt-schaub' then 'Audited multi-source NFL QB profile from Football position-trait model v3'
    when 'cfb-build-qb-danny-wuerffel-1996' then '2011 Stanford peak-season CFB QB profile · cfb-andrew-luck'
    when 'cfb-build-qb-jim-plunkett-1970' then '2011 Wisconsin peak-season CFB QB profile · cfb-russell-wilson'
    when 'cfb-build-qb-hendon-hooker-2022' then '1999 Virginia Tech peak-season CFB QB profile · cfb-michael-vick'
    when 'cfb-build-qb-vinny-testaverde-1986' then '2004 California peak-season CFB QB profile · cfb-aaron-rodgers'
    when 'cfb-build-qb-ty-detmer-1990' then '2007 Boston College peak-season CFB QB profile · cfb-matt-ryan'
    when 'cfb-build-qb-gino-torretta-1992' then '2009 Notre Dame peak-season CFB QB profile · cfb-jimmy-clausen'
    when 'cfb-build-qb-andre-ware-1989' then '2018 Texas peak-season CFB QB profile · cfb-sam-ehlinger'
    when 'cfb-build-qb-eric-crouch-2001' then '2013 Louisville peak-season CFB QB profile · cfb-teddy-bridgewater'
    when 'cfb-build-qb-chris-weinke-2000' then '2005 Virginia Tech peak-season CFB QB profile · cfb-marcus-vick'
    else source.display_description
  end,
  source.generation_weight,
  source.private_generation_class,
  case source.item_reference
    when 'build-qb-johnny-unitas' then jsonb_build_object('Arm',93,'Accuracy',93,'Processing',93,'Mobility',78,'Clutch',86,'overall',89)
    when 'build-qb-bob-griese' then jsonb_build_object('Arm',93,'Accuracy',86,'Processing',86,'Mobility',86,'Clutch',78,'overall',86)
    when 'build-qb-dan-fouts' then jsonb_build_object('Arm',86,'Accuracy',99,'Processing',93,'Mobility',69,'Clutch',78,'overall',85)
    when 'build-qb-trent-green' then jsonb_build_object('Arm',93,'Accuracy',93,'Processing',86,'Mobility',99,'Clutch',93,'overall',93)
    when 'build-qb-ken-anderson' then jsonb_build_object('Arm',78,'Accuracy',93,'Processing',93,'Mobility',78,'Clutch',93,'overall',87)
    when 'build-qb-ken-stabler' then jsonb_build_object('Arm',99,'Accuracy',86,'Processing',86,'Mobility',86,'Clutch',78,'overall',87)
    when 'build-qb-sonny-jurgensen' then jsonb_build_object('Arm',93,'Accuracy',86,'Processing',86,'Mobility',69,'Clutch',69,'overall',81)
    when 'build-qb-len-dawson' then jsonb_build_object('Arm',86,'Accuracy',86,'Processing',86,'Mobility',86,'Clutch',69,'overall',83)
    when 'build-qb-rich-gannon' then jsonb_build_object('Arm',86,'Accuracy',86,'Processing',78,'Mobility',50,'Clutch',99,'overall',80)
    when 'build-qb-mark-brunell' then jsonb_build_object('Arm',93,'Accuracy',78,'Processing',69,'Mobility',86,'Clutch',78,'overall',81)
    when 'build-qb-matt-schaub' then jsonb_build_object('Arm',69,'Accuracy',93,'Processing',86,'Mobility',50,'Clutch',86,'overall',77)
    when 'cfb-build-qb-danny-wuerffel-1996' then jsonb_build_object('Arm',99,'Accuracy',93,'Processing',99,'Mobility',93,'Clutch',99,'overall',97)
    when 'cfb-build-qb-jim-plunkett-1970' then jsonb_build_object('Arm',93,'Accuracy',99,'Processing',93,'Mobility',99,'Clutch',99,'overall',97)
    when 'cfb-build-qb-hendon-hooker-2022' then jsonb_build_object('Arm',93,'Accuracy',86,'Processing',78,'Mobility',99,'Clutch',99,'overall',91)
    when 'cfb-build-qb-vinny-testaverde-1986' then jsonb_build_object('Arm',99,'Accuracy',99,'Processing',99,'Mobility',78,'Clutch',86,'overall',92)
    when 'cfb-build-qb-ty-detmer-1990' then jsonb_build_object('Arm',93,'Accuracy',93,'Processing',99,'Mobility',69,'Clutch',99,'overall',91)
    when 'cfb-build-qb-gino-torretta-1992' then jsonb_build_object('Arm',93,'Accuracy',99,'Processing',93,'Mobility',69,'Clutch',86,'overall',88)
    when 'cfb-build-qb-andre-ware-1989' then jsonb_build_object('Arm',86,'Accuracy',93,'Processing',93,'Mobility',93,'Clutch',99,'overall',93)
    when 'cfb-build-qb-eric-crouch-2001' then jsonb_build_object('Arm',86,'Accuracy',99,'Processing',99,'Mobility',86,'Clutch',93,'overall',93)
    when 'cfb-build-qb-chris-weinke-2000' then jsonb_build_object('Arm',93,'Accuracy',86,'Processing',86,'Mobility',99,'Clutch',78,'overall',88)
    else source.grading_inputs
  end
from private.auction_catalog source
where source.content_version = 'football-draft-room-2026-09-v3'
  and source.mode_id in ('build-qb', 'build-qb-cfb');

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
      and mode_id = 'build-qb'
      and display_label in (
        'Johnny Unitas','Bob Griese','Dan Fouts','Trent Green','Ken Anderson','Ken Stabler',
        'Sonny Jurgensen','Len Dawson','Rich Gannon','Mark Brunell','Matt Schaub'
      )
  ) then
    raise exception 'NFL Build a QB v4 still contains a user-removed QB';
  end if;

  if exists (
    select 1 from private.auction_catalog
    where content_version = 'football-draft-room-2026-09-v4'
      and mode_id = 'build-qb-cfb'
      and display_label in (
        'Danny Wuerffel','Jim Plunkett','Hendon Hooker','Vinny Testaverde','Ty Detmer',
        'Gino Torretta','Andre Ware','Eric Crouch','Chris Weinke'
      )
  ) then
    raise exception 'CFB Build a QB v4 still contains a user-removed QB';
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
