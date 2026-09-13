-- Stage 12 Build a QB v2: append-only audited catalog rotation. Public release remains off.

update private.auction_catalog_versions set is_preparation_version = false where game_id = 'draft-room';
insert into private.auction_catalog_versions (content_version, rarity_version, grading_version, is_preparation_version, game_id)
values ('football-draft-room-2026-09-v2','football-draft-room-rarity-2026-09-v2','football-build-qb-traits-2026-09-v2',true,'draft-room');

insert into private.auction_catalog (content_version, mode_id, item_reference, display_label, rarity_band, display_description, generation_weight, private_generation_class, grading_inputs) values
  ('football-draft-room-2026-09-v2','build-qb','nfl-patrick-mahomes','Patrick Mahomes',5,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',99,'Accuracy',94,'Processing',96,'Mobility',93,'Clutch',98,'overall',96)),
  ('football-draft-room-2026-09-v2','build-qb','tom-brady','Tom Brady',5,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',88,'Accuracy',94,'Processing',99,'Mobility',55,'Clutch',99,'overall',87)),
  ('football-draft-room-2026-09-v2','build-qb','peyton-manning','Peyton Manning',5,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',87,'Accuracy',96,'Processing',99,'Mobility',48,'Clutch',94,'overall',85)),
  ('football-draft-room-2026-09-v2','build-qb','nfl-aaron-rodgers','Aaron Rodgers',5,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',96,'Accuracy',97,'Processing',98,'Mobility',84,'Clutch',94,'overall',94)),
  ('football-draft-room-2026-09-v2','build-qb','joe-montana','Joe Montana',5,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',84,'Accuracy',95,'Processing',97,'Mobility',72,'Clutch',99,'overall',89)),
  ('football-draft-room-2026-09-v2','build-qb','dan-marino','Dan Marino',4,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',97,'Accuracy',94,'Processing',96,'Mobility',52,'Clutch',91,'overall',86)),
  ('football-draft-room-2026-09-v2','build-qb','john-elway','John Elway',4,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',98,'Accuracy',86,'Processing',91,'Mobility',86,'Clutch',97,'overall',92)),
  ('football-draft-room-2026-09-v2','build-qb','steve-young','Steve Young',4,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',91,'Accuracy',94,'Processing',95,'Mobility',94,'Clutch',96,'overall',94)),
  ('football-draft-room-2026-09-v2','build-qb','drew-brees','Drew Brees',4,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',84,'Accuracy',98,'Processing',97,'Mobility',58,'Clutch',94,'overall',86)),
  ('football-draft-room-2026-09-v2','build-qb','brett-favre','Brett Favre',4,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',98,'Accuracy',87,'Processing',86,'Mobility',82,'Clutch',93,'overall',89)),
  ('football-draft-room-2026-09-v2','build-qb','nfl-josh-allen','Josh Allen',4,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',99,'Accuracy',88,'Processing',89,'Mobility',96,'Clutch',91,'overall',93)),
  ('football-draft-room-2026-09-v2','build-qb','nfl-lamar-jackson','Lamar Jackson',4,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',88,'Accuracy',87,'Processing',90,'Mobility',99,'Clutch',88,'overall',90)),
  ('football-draft-room-2026-09-v2','build-qb','nfl-joe-burrow','Joe Burrow',4,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',88,'Accuracy',96,'Processing',95,'Mobility',78,'Clutch',96,'overall',91)),
  ('football-draft-room-2026-09-v2','build-qb','nfl-matthew-stafford','Matthew Stafford',4,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',97,'Accuracy',91,'Processing',91,'Mobility',72,'Clutch',95,'overall',89)),
  ('football-draft-room-2026-09-v2','build-qb','ben-roethlisberger','Ben Roethlisberger',4,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',94,'Accuracy',88,'Processing',88,'Mobility',87,'Clutch',96,'overall',91)),
  ('football-draft-room-2026-09-v2','build-qb','kurt-warner','Kurt Warner',3,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',89,'Accuracy',95,'Processing',94,'Mobility',52,'Clutch',97,'overall',85)),
  ('football-draft-room-2026-09-v2','build-qb','andrew-luck','Andrew Luck',3,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',94,'Accuracy',90,'Processing',93,'Mobility',88,'Clutch',89,'overall',91)),
  ('football-draft-room-2026-09-v2','build-qb','russell-wilson','Russell Wilson',3,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',93,'Accuracy',91,'Processing',88,'Mobility',94,'Clutch',96,'overall',92)),
  ('football-draft-room-2026-09-v2','build-qb','nfl-philip-rivers','Philip Rivers',3,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',89,'Accuracy',92,'Processing',94,'Mobility',52,'Clutch',87,'overall',83)),
  ('football-draft-room-2026-09-v2','build-qb','matt-ryan','Matt Ryan',3,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',88,'Accuracy',93,'Processing',94,'Mobility',63,'Clutch',89,'overall',85)),
  ('football-draft-room-2026-09-v2','build-qb','cam-newton','Cam Newton',3,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',95,'Accuracy',82,'Processing',84,'Mobility',98,'Clutch',88,'overall',89)),
  ('football-draft-room-2026-09-v2','build-qb','donovan-mcnabb','Donovan McNabb',3,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',91,'Accuracy',85,'Processing',88,'Mobility',91,'Clutch',89,'overall',89)),
  ('football-draft-room-2026-09-v2','build-qb','steve-mcnair','Steve McNair',3,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',90,'Accuracy',87,'Processing',88,'Mobility',92,'Clutch',95,'overall',90)),
  ('football-draft-room-2026-09-v2','build-qb','fran-tarkenton','Fran Tarkenton',3,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',85,'Accuracy',89,'Processing',93,'Mobility',96,'Clutch',93,'overall',91)),
  ('football-draft-room-2026-09-v2','build-qb','roger-staubach','Roger Staubach',3,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',88,'Accuracy',91,'Processing',94,'Mobility',89,'Clutch',98,'overall',92)),
  ('football-draft-room-2026-09-v2','build-qb','troy-aikman','Troy Aikman',3,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',89,'Accuracy',95,'Processing',94,'Mobility',55,'Clutch',97,'overall',86)),
  ('football-draft-room-2026-09-v2','build-qb','jim-kelly','Jim Kelly',3,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',92,'Accuracy',88,'Processing',92,'Mobility',67,'Clutch',92,'overall',86)),
  ('football-draft-room-2026-09-v2','build-qb','warren-moon','Warren Moon',3,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',94,'Accuracy',91,'Processing',92,'Mobility',72,'Clutch',88,'overall',87)),
  ('football-draft-room-2026-09-v2','build-qb','ken-anderson','Ken Anderson',3,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',82,'Accuracy',96,'Processing',95,'Mobility',65,'Clutch',87,'overall',85)),
  ('football-draft-room-2026-09-v2','build-qb','brock-purdy','Brock Purdy',3,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',85,'Accuracy',93,'Processing',92,'Mobility',78,'Clutch',90,'overall',88)),
  ('football-draft-room-2026-09-v2','build-qb','eli-manning','Eli Manning',2,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',89,'Accuracy',84,'Processing',86,'Mobility',52,'Clutch',98,'overall',82)),
  ('football-draft-room-2026-09-v2','build-qb','tony-romo','Tony Romo',2,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',88,'Accuracy',92,'Processing',91,'Mobility',76,'Clutch',84,'overall',86)),
  ('football-draft-room-2026-09-v2','build-qb','dak-prescott','Dak Prescott',2,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',89,'Accuracy',91,'Processing',91,'Mobility',80,'Clutch',86,'overall',87)),
  ('football-draft-room-2026-09-v2','build-qb','jalen-hurts','Jalen Hurts',2,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',87,'Accuracy',84,'Processing',86,'Mobility',96,'Clutch',91,'overall',89)),
  ('football-draft-room-2026-09-v2','build-qb','justin-herbert','Justin Herbert',2,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',97,'Accuracy',90,'Processing',89,'Mobility',84,'Clutch',84,'overall',89)),
  ('football-draft-room-2026-09-v2','build-qb','baker-mayfield','Baker Mayfield',2,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',91,'Accuracy',87,'Processing',86,'Mobility',76,'Clutch',90,'overall',86)),
  ('football-draft-room-2026-09-v2','build-qb','jared-goff','Jared Goff',2,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',88,'Accuracy',92,'Processing',91,'Mobility',57,'Clutch',87,'overall',83)),
  ('football-draft-room-2026-09-v2','build-qb','kirk-cousins','Kirk Cousins',2,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',87,'Accuracy',93,'Processing',92,'Mobility',59,'Clutch',82,'overall',83)),
  ('football-draft-room-2026-09-v2','build-qb','carson-palmer','Carson Palmer',2,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',94,'Accuracy',89,'Processing',88,'Mobility',61,'Clutch',82,'overall',83)),
  ('football-draft-room-2026-09-v2','build-qb','rich-gannon','Rich Gannon',2,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',84,'Accuracy',92,'Processing',94,'Mobility',81,'Clutch',86,'overall',87)),
  ('football-draft-room-2026-09-v2','build-qb','randall-cunningham','Randall Cunningham',2,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',95,'Accuracy',81,'Processing',82,'Mobility',99,'Clutch',86,'overall',89)),
  ('football-draft-room-2026-09-v2','build-qb','daunte-culpepper','Daunte Culpepper',2,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',96,'Accuracy',85,'Processing',82,'Mobility',94,'Clutch',84,'overall',88)),
  ('football-draft-room-2026-09-v2','build-qb','michael-vick','Michael Vick',2,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',98,'Accuracy',77,'Processing',78,'Mobility',99,'Clutch',86,'overall',88)),
  ('football-draft-room-2026-09-v2','build-qb','boomer-esiason','Boomer Esiason',2,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',90,'Accuracy',88,'Processing',90,'Mobility',70,'Clutch',89,'overall',85)),
  ('football-draft-room-2026-09-v2','build-qb','mark-brunell','Mark Brunell',2,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',86,'Accuracy',90,'Processing',89,'Mobility',87,'Clutch',88,'overall',88)),
  ('football-draft-room-2026-09-v2','build-qb','jay-cutler','Jay Cutler',1,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',98,'Accuracy',82,'Processing',75,'Mobility',77,'Clutch',74,'overall',81)),
  ('football-draft-room-2026-09-v2','build-qb','joe-flacco','Joe Flacco',1,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',95,'Accuracy',82,'Processing',81,'Mobility',54,'Clutch',94,'overall',81)),
  ('football-draft-room-2026-09-v2','build-qb','nick-foles','Nick Foles',1,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',87,'Accuracy',86,'Processing',82,'Mobility',61,'Clutch',97,'overall',83)),
  ('football-draft-room-2026-09-v2','build-qb','jeff-garcia','Jeff Garcia',1,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',79,'Accuracy',89,'Processing',90,'Mobility',88,'Clutch',87,'overall',87)),
  ('football-draft-room-2026-09-v2','build-qb','chad-pennington','Chad Pennington',1,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',72,'Accuracy',96,'Processing',93,'Mobility',58,'Clutch',83,'overall',80)),
  ('football-draft-room-2026-09-v2','build-qb','ryan-fitzpatrick','Ryan Fitzpatrick',1,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',88,'Accuracy',82,'Processing',80,'Mobility',82,'Clutch',82,'overall',83)),
  ('football-draft-room-2026-09-v2','build-qb','vinny-testaverde','Vinny Testaverde',1,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',94,'Accuracy',80,'Processing',80,'Mobility',61,'Clutch',81,'overall',79)),
  ('football-draft-room-2026-09-v2','build-qb','jeff-george','Jeff George',1,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',99,'Accuracy',79,'Processing',72,'Mobility',62,'Clutch',68,'overall',76)),
  ('football-draft-room-2026-09-v2','build-qb','doug-flutie','Doug Flutie',1,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',79,'Accuracy',84,'Processing',87,'Mobility',94,'Clutch',88,'overall',86)),
  ('football-draft-room-2026-09-v2','build-qb','kordell-stewart','Kordell Stewart',1,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',88,'Accuracy',73,'Processing',76,'Mobility',97,'Clutch',79,'overall',83)),
  ('football-draft-room-2026-09-v2','build-qb','jake-delhomme','Jake Delhomme',1,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',83,'Accuracy',82,'Processing',81,'Mobility',66,'Clutch',90,'overall',80)),
  ('football-draft-room-2026-09-v2','build-qb','trent-green','Trent Green',1,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',85,'Accuracy',91,'Processing',91,'Mobility',61,'Clutch',84,'overall',82)),
  ('football-draft-room-2026-09-v2','build-qb','derek-carr','Derek Carr',1,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',91,'Accuracy',88,'Processing',87,'Mobility',72,'Clutch',78,'overall',83)),
  ('football-draft-room-2026-09-v2','build-qb','kyler-murray','Kyler Murray',1,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',92,'Accuracy',85,'Processing',84,'Mobility',97,'Clutch',79,'overall',87)),
  ('football-draft-room-2026-09-v2','build-qb','tua-tagovailoa','Tua Tagovailoa',1,'Audited Football Build a QB profile v2',1.0,'qb',jsonb_build_object('Arm',80,'Accuracy',94,'Processing',92,'Mobility',73,'Clutch',78,'overall',83));

create or replace function private.generate_auction_deck(
  p_auction_id uuid, p_content_version text, p_mode_id text, p_count integer,
  p_random_order double precision[] default null
) returns void language plpgsql security definer set search_path = '' as $$
declare v_available integer; v_inserted integer;
begin
  if p_count < 1 then raise exception 'Auction deck size must be positive'; end if;
  if exists (select 1 from private.auction_deck_entries where auction_id = p_auction_id) then raise exception 'Auction deck is already fixed'; end if;
  select count(*) into v_available from private.auction_catalog where content_version=p_content_version and mode_id=p_mode_id;
  if v_available < p_count then raise exception 'Auction catalog does not contain enough unique items'; end if;
  if p_random_order is not null and cardinality(p_random_order) <> v_available then raise exception 'Injected Auction random order has the wrong size'; end if;

  if p_mode_id = 'build-qb' then
    if p_count <> 10 then raise exception 'Build a QB rooms require exactly 10 players'; end if;
    with candidates as (
      select catalog.item_reference, catalog.rarity_band,
        case when p_random_order is null then random()
          else 1.0/(1.0+exp(-p_random_order[(row_number() over(order by catalog.item_reference))::integer])) end as key
      from private.auction_catalog catalog where catalog.content_version=p_content_version and catalog.mode_id=p_mode_id
    ), banded as (
      select *, row_number() over(partition by rarity_band order by key,item_reference) as band_rank from candidates
    ), selected as (
      select item_reference, row_number() over(order by key,item_reference) as deck_position from banded
      where (rarity_band=5 and band_rank<=1) or (rarity_band=4 and band_rank<=2)
        or (rarity_band=3 and band_rank<=4) or (rarity_band=2 and band_rank<=2)
        or (rarity_band=1 and band_rank<=1)
    ) insert into private.auction_deck_entries(auction_id,deck_position,private_item_reference)
      select p_auction_id,deck_position,item_reference from selected;
  else
    with candidates as (
           select catalog.item_reference,catalog.rarity_band,catalog.private_generation_class,
        -ln(greatest(0.0000001,least(0.9999999,case when p_random_order is null then random() else 1.0/(1.0+exp(-p_random_order[(row_number() over(order by catalog.item_reference))::integer])) end)))/catalog.generation_weight as weighted_key
           from private.auction_catalog catalog where catalog.content_version=p_content_version and catalog.mode_id=p_mode_id
    ), ranked as (
      select candidates.*,
        row_number() over(partition by (private_generation_class in ('mythic','crown')) order by weighted_key,item_reference) mythic_crown_rank,
        row_number() over(partition by (private_generation_class in ('ace','headliner','signature')) order by weighted_key,item_reference) featured_rank,
        row_number() over(partition by (rarity_band>=4) order by weighted_key,item_reference) high_end_rank from candidates
    ), eligible as (
      select * from ranked where (private_generation_class not in ('mythic','crown') or mythic_crown_rank<=2)
        and (private_generation_class not in ('ace','headliner','signature') or featured_rank<=2)
        and (rarity_band<4 or high_end_rank<=4)
    ), selected as (
           select item_reference,row_number() over(order by weighted_key,item_reference) deck_position from eligible order by weighted_key,item_reference limit p_count
    ) insert into private.auction_deck_entries(auction_id,deck_position,private_item_reference)
      select p_auction_id,deck_position,item_reference from selected;
  end if;
  get diagnostics v_inserted = row_count;
  if v_inserted <> p_count then raise exception 'Auction generation safeguards underfilled the deck'; end if;
end; $$;

-- The release gate is deliberately retained during private playtesting.
create or replace function private.draft_room_public_release_enabled() returns boolean
language sql immutable set search_path = '' as $$ select false $$;
