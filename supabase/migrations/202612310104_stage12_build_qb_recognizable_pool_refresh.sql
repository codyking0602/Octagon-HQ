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
