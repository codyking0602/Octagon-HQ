-- Stage 12 Build a QB roster refresh.
-- Keeps the shared Auction/Draft Room owner and rotates only the approved NFL/CFB subject membership.
-- Prior catalog versions remain immutable for already-prepared games.

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
  'football-draft-room-2026-09-v4', mode_id, item_reference, display_label, rarity_band,
  display_description, generation_weight, private_generation_class, grading_inputs
from private.auction_catalog
where content_version = 'football-draft-room-2026-09-v3'
  and not (
    (mode_id = 'build-qb' and item_reference in ('build-qb-johnny-unitas', 'build-qb-bob-griese', 'build-qb-dan-fouts', 'build-qb-trent-green', 'build-qb-ken-anderson', 'build-qb-ken-stabler', 'build-qb-sonny-jurgensen', 'build-qb-len-dawson', 'build-qb-rich-gannon', 'build-qb-mark-brunell', 'build-qb-matt-schaub'))
    or
    (mode_id = 'build-qb-cfb' and item_reference in ('cfb-build-qb-danny-wuerffel-1996', 'cfb-build-qb-jim-plunkett-1970', 'cfb-build-qb-hendon-hooker-2022', 'cfb-build-qb-vinny-testaverde-1986', 'cfb-build-qb-ty-detmer-1990', 'cfb-build-qb-gino-torretta-1992', 'cfb-build-qb-andre-ware-1989', 'cfb-build-qb-eric-crouch-2001', 'cfb-build-qb-chris-weinke-2000'))
  );

insert into private.auction_catalog (
  content_version, mode_id, item_reference, display_label, rarity_band,
  display_description, generation_weight, private_generation_class, grading_inputs
) values
  ('football-draft-room-2026-09-v4','build-qb','build-qb-jayden-daniels','Jayden Daniels',5,'Audited multi-source NFL QB profile from Football position-trait model v3',0.18,'qb',jsonb_build_object('Arm',93,'Accuracy',93,'Processing',93,'Mobility',99,'Clutch',93,'overall',94)),
  ('football-draft-room-2026-09-v4','build-qb','build-qb-trevor-lawrence','Trevor Lawrence',4,'Audited multi-source NFL QB profile from Football position-trait model v3',0.70,'qb',jsonb_build_object('Arm',93,'Accuracy',86,'Processing',86,'Mobility',86,'Clutch',78,'overall',86)),
  ('football-draft-room-2026-09-v4','build-qb','build-qb-tua-tagovailoa','Tua Tagovailoa',4,'Audited multi-source NFL QB profile from Football position-trait model v3',0.70,'qb',jsonb_build_object('Arm',78,'Accuracy',99,'Processing',93,'Mobility',69,'Clutch',78,'overall',83)),
  ('football-draft-room-2026-09-v4','build-qb','build-qb-c-j-stroud','C.J. Stroud',4,'Audited multi-source NFL QB profile from Football position-trait model v3',0.70,'qb',jsonb_build_object('Arm',93,'Accuracy',99,'Processing',93,'Mobility',78,'Clutch',86,'overall',90)),
  ('football-draft-room-2026-09-v4','build-qb','build-qb-brock-purdy','Brock Purdy',3,'Audited multi-source NFL QB profile from Football position-trait model v3',1.15,'qb',jsonb_build_object('Arm',78,'Accuracy',93,'Processing',93,'Mobility',78,'Clutch',93,'overall',87)),
  ('football-draft-room-2026-09-v4','build-qb','build-qb-jordan-love','Jordan Love',3,'Audited multi-source NFL QB profile from Football position-trait model v3',1.15,'qb',jsonb_build_object('Arm',99,'Accuracy',86,'Processing',86,'Mobility',86,'Clutch',86,'overall',89)),
  ('football-draft-room-2026-09-v4','build-qb','build-qb-derek-carr','Derek Carr',3,'Audited multi-source NFL QB profile from Football position-trait model v3',1.15,'qb',jsonb_build_object('Arm',93,'Accuracy',86,'Processing',86,'Mobility',60,'Clutch',78,'overall',81)),
  ('football-draft-room-2026-09-v4','build-qb','build-qb-jimmy-garoppolo','Jimmy Garoppolo',3,'Audited multi-source NFL QB profile from Football position-trait model v3',1.15,'qb',jsonb_build_object('Arm',78,'Accuracy',93,'Processing',86,'Mobility',60,'Clutch',86,'overall',81)),
  ('football-draft-room-2026-09-v4','build-qb','build-qb-ryan-tannehill','Ryan Tannehill',2,'Audited multi-source NFL QB profile from Football position-trait model v3',1.25,'qb',jsonb_build_object('Arm',86,'Accuracy',86,'Processing',86,'Mobility',86,'Clutch',69,'overall',83)),
  ('football-draft-room-2026-09-v4','build-qb','build-qb-carson-wentz','Carson Wentz',2,'Audited multi-source NFL QB profile from Football position-trait model v3',1.25,'qb',jsonb_build_object('Arm',93,'Accuracy',78,'Processing',78,'Mobility',86,'Clutch',69,'overall',81)),
  ('football-draft-room-2026-09-v4','build-qb','build-qb-nick-foles','Nick Foles',1,'Audited multi-source NFL QB profile from Football position-trait model v3',1.00,'qb',jsonb_build_object('Arm',86,'Accuracy',78,'Processing',78,'Mobility',50,'Clutch',99,'overall',78)),
  ('football-draft-room-2026-09-v4','build-qb-cfb','cfb-build-qb-andrew-luck-2011','Andrew Luck',4,'2011 Stanford peak-season CFB QB profile · cfb-andrew-luck',0.70,'qb',jsonb_build_object('Arm',93,'Accuracy',99,'Processing',99,'Mobility',86,'Clutch',93,'overall',94)),
  ('football-draft-room-2026-09-v4','build-qb-cfb','cfb-build-qb-russell-wilson-2011','Russell Wilson',4,'2011 Wisconsin peak-season CFB QB profile · cfb-russell-wilson',0.70,'qb',jsonb_build_object('Arm',86,'Accuracy',99,'Processing',99,'Mobility',93,'Clutch',99,'overall',95)),
  ('football-draft-room-2026-09-v4','build-qb-cfb','cfb-build-qb-michael-vick-1999','Michael Vick',4,'1999 Virginia Tech peak-season CFB QB profile · cfb-michael-vick',0.70,'qb',jsonb_build_object('Arm',99,'Accuracy',78,'Processing',78,'Mobility',99,'Clutch',99,'overall',91)),
  ('football-draft-room-2026-09-v4','build-qb-cfb','cfb-build-qb-aaron-rodgers-2004','Aaron Rodgers',3,'2004 California peak-season CFB QB profile · cfb-aaron-rodgers',1.15,'qb',jsonb_build_object('Arm',99,'Accuracy',99,'Processing',99,'Mobility',78,'Clutch',93,'overall',94)),
  ('football-draft-room-2026-09-v4','build-qb-cfb','cfb-build-qb-matt-ryan-2007','Matt Ryan',3,'2007 Boston College peak-season CFB QB profile · cfb-matt-ryan',1.15,'qb',jsonb_build_object('Arm',86,'Accuracy',93,'Processing',99,'Mobility',69,'Clutch',99,'overall',89)),
  ('football-draft-room-2026-09-v4','build-qb-cfb','cfb-build-qb-jimmy-clausen-2009','Jimmy Clausen',3,'2009 Notre Dame peak-season CFB QB profile · cfb-jimmy-clausen',1.15,'qb',jsonb_build_object('Arm',93,'Accuracy',99,'Processing',93,'Mobility',60,'Clutch',86,'overall',86)),
  ('football-draft-room-2026-09-v4','build-qb-cfb','cfb-build-qb-sam-ehlinger-2018','Sam Ehlinger',3,'2018 Texas peak-season CFB QB profile · cfb-sam-ehlinger',1.15,'qb',jsonb_build_object('Arm',86,'Accuracy',86,'Processing',86,'Mobility',99,'Clutch',99,'overall',91)),
  ('football-draft-room-2026-09-v4','build-qb-cfb','cfb-build-qb-teddy-bridgewater-2013','Teddy Bridgewater',3,'2013 Louisville peak-season CFB QB profile · cfb-teddy-bridgewater',1.15,'qb',jsonb_build_object('Arm',86,'Accuracy',99,'Processing',99,'Mobility',86,'Clutch',93,'overall',93)),
  ('football-draft-room-2026-09-v4','build-qb-cfb','cfb-build-qb-marcus-vick-2005','Marcus Vick',2,'2005 Virginia Tech peak-season CFB QB profile · cfb-marcus-vick',1.25,'qb',jsonb_build_object('Arm',93,'Accuracy',93,'Processing',86,'Mobility',99,'Clutch',78,'overall',90));

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
