-- Stage 12 CFB Build a QB.
-- Extends the existing Draft Room/Auction owner with one college mode.
-- The CFB catalog is one-player/one-peak-season; NFL v2 rows are copied unchanged
-- into the shared v3 preparation version so NFL Build a QB does not regress.

update private.auction_catalog_versions
set is_preparation_version = false
where game_id = 'draft-room'
  and is_preparation_version;

insert into private.auction_catalog_versions (
  content_version, rarity_version, grading_version, is_preparation_version, game_id
) values (
  'football-draft-room-2026-09-v3',
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
  'football-draft-room-2026-09-v3', mode_id, item_reference, display_label, rarity_band,
  display_description, generation_weight, private_generation_class, grading_inputs
from private.auction_catalog
where content_version = 'football-draft-room-2026-09-v2'
  and mode_id = 'build-qb';

insert into private.auction_catalog (
  content_version, mode_id, item_reference, display_label, rarity_band,
  display_description, generation_weight, private_generation_class, grading_inputs
) values
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-cam-newton-2010','Cam Newton',5,'2010 Auburn peak-season CFB QB profile · cfb-cam-newton',0.18,'qb',jsonb_build_object('Arm',93,'Accuracy',86,'Processing',86,'Mobility',99,'Clutch',99,'overall',93)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-vince-young-2005','Vince Young',5,'2005 Texas peak-season CFB QB profile · cfb-vince-young',0.18,'qb',jsonb_build_object('Arm',86,'Accuracy',86,'Processing',86,'Mobility',99,'Clutch',99,'overall',91)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-tim-tebow-2007','Tim Tebow',4,'2007 Florida peak-season CFB QB profile · cfb-tim-tebow',0.70,'qb',jsonb_build_object('Arm',78,'Accuracy',78,'Processing',78,'Mobility',99,'Clutch',86,'overall',84)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-matt-leinart-2004','Matt Leinart',4,'2004 USC peak-season CFB QB profile · cfb-matt-leinart',0.70,'qb',jsonb_build_object('Arm',86,'Accuracy',93,'Processing',93,'Mobility',60,'Clutch',99,'overall',86)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-johnny-manziel-2012','Johnny Manziel',4,'2012 Texas A&M peak-season CFB QB profile · cfb-johnny-manziel',0.70,'qb',jsonb_build_object('Arm',86,'Accuracy',86,'Processing',78,'Mobility',99,'Clutch',93,'overall',88)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-colt-mccoy-2008','Colt McCoy',3,'2008 Texas peak-season CFB QB profile · cfb-colt-mccoy',1.15,'qb',jsonb_build_object('Arm',78,'Accuracy',99,'Processing',93,'Mobility',86,'Clutch',93,'overall',90)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-sam-bradford-2008','Sam Bradford',4,'2008 Oklahoma peak-season CFB QB profile · cfb-sam-bradford',0.70,'qb',jsonb_build_object('Arm',93,'Accuracy',99,'Processing',93,'Mobility',69,'Clutch',86,'overall',88)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-jameis-winston-2013','Jameis Winston',5,'2013 Florida State peak-season CFB QB profile · cfb-jameis-winston',0.18,'qb',jsonb_build_object('Arm',93,'Accuracy',93,'Processing',86,'Mobility',78,'Clutch',99,'overall',90)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-robert-griffin-iii-2011','Robert Griffin III',5,'2011 Baylor peak-season CFB QB profile · cfb-robert-griffin-iii',0.18,'qb',jsonb_build_object('Arm',93,'Accuracy',99,'Processing',93,'Mobility',99,'Clutch',93,'overall',95)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-doug-flutie-1984','Doug Flutie',3,'1984 Boston College peak-season CFB QB profile · cfb-doug-flutie',1.15,'qb',jsonb_build_object('Arm',86,'Accuracy',86,'Processing',86,'Mobility',93,'Clutch',99,'overall',90)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-vinny-testaverde-1986','Vinny Testaverde',3,'1986 Miami peak-season CFB QB profile · cfb-vinny-testaverde',1.15,'qb',jsonb_build_object('Arm',99,'Accuracy',86,'Processing',86,'Mobility',78,'Clutch',78,'overall',85)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-charlie-ward-1993','Charlie Ward',4,'1993 Florida State peak-season CFB QB profile · cfb-charlie-ward',0.70,'qb',jsonb_build_object('Arm',86,'Accuracy',93,'Processing',93,'Mobility',93,'Clutch',99,'overall',93)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-danny-wuerffel-1996','Danny Wuerffel',4,'1996 Florida peak-season CFB QB profile · cfb-danny-wuerffel',0.70,'qb',jsonb_build_object('Arm',69,'Accuracy',93,'Processing',99,'Mobility',60,'Clutch',99,'overall',84)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-ty-detmer-1990','Ty Detmer',3,'1990 BYU peak-season CFB QB profile · cfb-ty-detmer',1.15,'qb',jsonb_build_object('Arm',69,'Accuracy',99,'Processing',99,'Mobility',69,'Clutch',93,'overall',86)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-gino-torretta-1992','Gino Torretta',3,'1992 Miami peak-season CFB QB profile · cfb-gino-torretta',1.15,'qb',jsonb_build_object('Arm',78,'Accuracy',86,'Processing',93,'Mobility',60,'Clutch',93,'overall',82)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-andre-ware-1989','Andre Ware',3,'1989 Houston peak-season CFB QB profile · cfb-andre-ware',1.15,'qb',jsonb_build_object('Arm',99,'Accuracy',86,'Processing',86,'Mobility',78,'Clutch',78,'overall',85)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-eric-crouch-2001','Eric Crouch',3,'2001 Nebraska peak-season CFB QB profile · cfb-eric-crouch',1.15,'qb',jsonb_build_object('Arm',69,'Accuracy',69,'Processing',78,'Mobility',99,'Clutch',93,'overall',82)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-jim-plunkett-1970','Jim Plunkett',4,'1970 Stanford peak-season CFB QB profile · cfb-jim-plunkett',0.70,'qb',jsonb_build_object('Arm',99,'Accuracy',86,'Processing',86,'Mobility',78,'Clutch',93,'overall',88)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-roger-staubach-1963','Roger Staubach',4,'1963 Navy peak-season CFB QB profile · cfb-roger-staubach',0.70,'qb',jsonb_build_object('Arm',86,'Accuracy',93,'Processing',99,'Mobility',99,'Clutch',99,'overall',95)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-troy-smith-2006','Troy Smith',3,'2006 Ohio State peak-season CFB QB profile · cfb-troy-smith',1.15,'qb',jsonb_build_object('Arm',93,'Accuracy',93,'Processing',93,'Mobility',93,'Clutch',86,'overall',92)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-brady-quinn-2005','Brady Quinn',2,'2005 Notre Dame peak-season CFB QB profile · cfb-brady-quinn',1.25,'qb',jsonb_build_object('Arm',93,'Accuracy',86,'Processing',93,'Mobility',69,'Clutch',78,'overall',84)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-carson-palmer-2002','Carson Palmer',3,'2002 USC peak-season CFB QB profile · cfb-carson-palmer',1.15,'qb',jsonb_build_object('Arm',99,'Accuracy',93,'Processing',93,'Mobility',69,'Clutch',93,'overall',89)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-chris-weinke-2000','Chris Weinke',2,'2000 Florida State peak-season CFB QB profile · cfb-chris-weinke',1.25,'qb',jsonb_build_object('Arm',93,'Accuracy',86,'Processing',93,'Mobility',50,'Clutch',93,'overall',83)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-jason-white-2003','Jason White',3,'2003 Oklahoma peak-season CFB QB profile · cfb-jason-white',1.15,'qb',jsonb_build_object('Arm',93,'Accuracy',93,'Processing',93,'Mobility',50,'Clutch',78,'overall',81)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-marcus-mariota-2014','Marcus Mariota',5,'2014 Oregon peak-season CFB QB profile · cfbfast-r-player-511459-marcus-mariota',0.18,'qb',jsonb_build_object('Arm',86,'Accuracy',99,'Processing',93,'Mobility',99,'Clutch',93,'overall',94)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-dak-prescott-2014','Dak Prescott',3,'2014 Mississippi State peak-season CFB QB profile · cfbfast-r-player-512030-dak-prescott',1.15,'qb',jsonb_build_object('Arm',86,'Accuracy',86,'Processing',86,'Mobility',99,'Clutch',86,'overall',89)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-jared-goff-2015','Jared Goff',2,'2015 California peak-season CFB QB profile · cfbfast-r-player-547401-jared-goff',1.25,'qb',jsonb_build_object('Arm',93,'Accuracy',93,'Processing',93,'Mobility',60,'Clutch',78,'overall',83)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-patrick-mahomes-2016','Patrick Mahomes',3,'2016 Texas Tech peak-season CFB QB profile · cfbfast-r-player-3139477-patrick-mahomes',1.15,'qb',jsonb_build_object('Arm',99,'Accuracy',86,'Processing',86,'Mobility',93,'Clutch',78,'overall',88)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-deshaun-watson-2016','Deshaun Watson',5,'2016 Clemson peak-season CFB QB profile · cfb-deshaun-watson',0.18,'qb',jsonb_build_object('Arm',93,'Accuracy',93,'Processing',93,'Mobility',93,'Clutch',99,'overall',94)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-lamar-jackson-2016','Lamar Jackson',5,'2016 Louisville peak-season CFB QB profile · cfb-lamar-jackson',0.18,'qb',jsonb_build_object('Arm',86,'Accuracy',86,'Processing',78,'Mobility',99,'Clutch',86,'overall',87)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-baker-mayfield-2017','Baker Mayfield',5,'2017 Oklahoma peak-season CFB QB profile · cfb-baker-mayfield',0.18,'qb',jsonb_build_object('Arm',93,'Accuracy',99,'Processing',99,'Mobility',86,'Clutch',93,'overall',94)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-josh-allen-2016','Josh Allen',1,'2016 Wyoming peak-season CFB QB profile · cfbfast-r-player-3918298-josh-allen',1.00,'qb',jsonb_build_object('Arm',99,'Accuracy',69,'Processing',69,'Mobility',93,'Clutch',78,'overall',82)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-drew-lock-2017','Drew Lock',1,'2017 Missouri peak-season CFB QB profile · cfbfast-r-player-3924327-drew-lock',1.00,'qb',jsonb_build_object('Arm',99,'Accuracy',78,'Processing',78,'Mobility',69,'Clutch',69,'overall',79)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-mason-rudolph-2017','Mason Rudolph',2,'2017 Oklahoma State peak-season CFB QB profile · cfbfast-r-player-3116407-mason-rudolph',1.25,'qb',jsonb_build_object('Arm',93,'Accuracy',93,'Processing',86,'Mobility',69,'Clutch',78,'overall',84)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-sam-darnold-2016','Sam Darnold',2,'2016 USC peak-season CFB QB profile · cfbfast-r-player-3912547-sam-darnold',1.25,'qb',jsonb_build_object('Arm',93,'Accuracy',86,'Processing',86,'Mobility',86,'Clutch',93,'overall',89)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-gardner-minshew-2018','Gardner Minshew',2,'2018 Washington State peak-season CFB QB profile · cfbfast-r-player-4038524-gardner-minshew',1.25,'qb',jsonb_build_object('Arm',78,'Accuracy',93,'Processing',93,'Mobility',78,'Clutch',93,'overall',87)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-kyler-murray-2018','Kyler Murray',5,'2018 Oklahoma peak-season CFB QB profile · cfb-kyler-murray',0.18,'qb',jsonb_build_object('Arm',99,'Accuracy',93,'Processing',93,'Mobility',99,'Clutch',86,'overall',94)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-tua-tagovailoa-2018','Tua Tagovailoa',4,'2018 Alabama peak-season CFB QB profile · cfb-tua-tagovailoa',0.70,'qb',jsonb_build_object('Arm',86,'Accuracy',99,'Processing',93,'Mobility',86,'Clutch',93,'overall',91)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-trevor-lawrence-2019','Trevor Lawrence',4,'2019 Clemson peak-season CFB QB profile · cfb-trevor-lawrence',0.70,'qb',jsonb_build_object('Arm',99,'Accuracy',93,'Processing',93,'Mobility',93,'Clutch',93,'overall',94)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-joe-burrow-2019','Joe Burrow',5,'2019 LSU peak-season CFB QB profile · cfb-joe-burrow',0.18,'qb',jsonb_build_object('Arm',93,'Accuracy',99,'Processing',99,'Mobility',86,'Clutch',99,'overall',95)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-jalen-hurts-2019','Jalen Hurts',4,'2019 Oklahoma peak-season CFB QB profile · cfbfast-r-player-4040715-jalen-hurts',0.70,'qb',jsonb_build_object('Arm',86,'Accuracy',86,'Processing',86,'Mobility',99,'Clutch',93,'overall',90)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-justin-fields-2019','Justin Fields',4,'2019 Ohio State peak-season CFB QB profile · cfb-justin-fields',0.70,'qb',jsonb_build_object('Arm',93,'Accuracy',93,'Processing',93,'Mobility',99,'Clutch',93,'overall',94)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-justin-herbert-2019','Justin Herbert',3,'2019 Oregon peak-season CFB QB profile · cfbfast-r-player-4038941-justin-herbert',1.15,'qb',jsonb_build_object('Arm',99,'Accuracy',86,'Processing',86,'Mobility',86,'Clutch',93,'overall',90)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-jordan-love-2018','Jordan Love',1,'2018 Utah State peak-season CFB QB profile · cfbfast-r-player-4036378-jordan-love',1.00,'qb',jsonb_build_object('Arm',99,'Accuracy',86,'Processing',78,'Mobility',86,'Clutch',78,'overall',85)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-mac-jones-2020','Mac Jones',4,'2020 Alabama peak-season CFB QB profile · cfbfast-r-player-4241464-mac-jones',0.70,'qb',jsonb_build_object('Arm',86,'Accuracy',99,'Processing',99,'Mobility',60,'Clutch',99,'overall',89)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-kyle-trask-2020','Kyle Trask',2,'2020 Florida peak-season CFB QB profile · cfbfast-r-player-4034946-kyle-trask',1.25,'qb',jsonb_build_object('Arm',86,'Accuracy',93,'Processing',93,'Mobility',60,'Clutch',78,'overall',82)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-zach-wilson-2020','Zach Wilson',1,'2020 BYU peak-season CFB QB profile · cfbfast-r-player-4361259-zach-wilson',1.00,'qb',jsonb_build_object('Arm',99,'Accuracy',93,'Processing',86,'Mobility',93,'Clutch',86,'overall',91)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-sam-howell-2020','Sam Howell',2,'2020 North Carolina peak-season CFB QB profile · cfbfast-r-player-4426875-sam-howell',1.25,'qb',jsonb_build_object('Arm',93,'Accuracy',93,'Processing',86,'Mobility',86,'Clutch',78,'overall',87)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-spencer-rattler-2020','Spencer Rattler',1,'2020 Oklahoma peak-season CFB QB profile · cfbfast-r-player-4426339-spencer-rattler',1.00,'qb',jsonb_build_object('Arm',99,'Accuracy',93,'Processing',78,'Mobility',86,'Clutch',78,'overall',87)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-brock-purdy-2020','Brock Purdy',2,'2020 Iowa State peak-season CFB QB profile · cfbfast-r-player-4361741-brock-purdy',1.25,'qb',jsonb_build_object('Arm',78,'Accuracy',86,'Processing',86,'Mobility',86,'Clutch',86,'overall',84)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-bryce-young-2021','Bryce Young',5,'2021 Alabama peak-season CFB QB profile · cfb-bryce-young',0.18,'qb',jsonb_build_object('Arm',86,'Accuracy',99,'Processing',99,'Mobility',93,'Clutch',99,'overall',95)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-c-j-stroud-2021','C.J. Stroud',4,'2021 Ohio State peak-season CFB QB profile · cfbfast-r-player-4432577-c-j-stroud',0.70,'qb',jsonb_build_object('Arm',99,'Accuracy',99,'Processing',93,'Mobility',69,'Clutch',86,'overall',89)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-kenny-pickett-2021','Kenny Pickett',3,'2021 Pittsburgh peak-season CFB QB profile · cfbfast-r-player-4240703-kenny-pickett',1.15,'qb',jsonb_build_object('Arm',86,'Accuracy',93,'Processing',93,'Mobility',86,'Clutch',93,'overall',90)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-bailey-zappe-2021','Bailey Zappe',1,'2021 Western Kentucky peak-season CFB QB profile · cfbfast-r-player-4250360-bailey-zappe',1.00,'qb',jsonb_build_object('Arm',78,'Accuracy',93,'Processing',93,'Mobility',50,'Clutch',86,'overall',80)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-matt-corral-2021','Matt Corral',2,'2021 Ole Miss peak-season CFB QB profile · cfbfast-r-player-4362874-matt-corral',1.25,'qb',jsonb_build_object('Arm',93,'Accuracy',93,'Processing',86,'Mobility',93,'Clutch',86,'overall',90)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-malik-willis-2021','Malik Willis',1,'2021 Liberty peak-season CFB QB profile · cfbfast-r-player-4242512-malik-willis',1.00,'qb',jsonb_build_object('Arm',99,'Accuracy',69,'Processing',69,'Mobility',99,'Clutch',69,'overall',81)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-sam-hartman-2021','Sam Hartman',2,'2021 Wake Forest peak-season CFB QB profile · cfbfast-r-player-4361994-sam-hartman',1.25,'qb',jsonb_build_object('Arm',86,'Accuracy',86,'Processing',86,'Mobility',78,'Clutch',78,'overall',83)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-caleb-williams-2022','Caleb Williams',5,'2022 USC peak-season CFB QB profile · cfb-caleb-williams',0.18,'qb',jsonb_build_object('Arm',99,'Accuracy',93,'Processing',86,'Mobility',99,'Clutch',93,'overall',94)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-max-duggan-2022','Max Duggan',3,'2022 TCU peak-season CFB QB profile · cfbfast-r-player-4427105-max-duggan',1.15,'qb',jsonb_build_object('Arm',86,'Accuracy',86,'Processing',86,'Mobility',93,'Clutch',99,'overall',90)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-drake-maye-2022','Drake Maye',4,'2022 North Carolina peak-season CFB QB profile · cfbfast-r-player-4431452-drake-maye',0.70,'qb',jsonb_build_object('Arm',99,'Accuracy',93,'Processing',93,'Mobility',93,'Clutch',86,'overall',93)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-hendon-hooker-2022','Hendon Hooker',4,'2022 Tennessee peak-season CFB QB profile · cfbfast-r-player-4240858-hendon-hooker',0.70,'qb',jsonb_build_object('Arm',93,'Accuracy',99,'Processing',93,'Mobility',93,'Clutch',93,'overall',94)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-stetson-bennett-2022','Stetson Bennett',3,'2022 Georgia peak-season CFB QB profile · cfbfast-r-player-4259553-stetson-bennett',1.15,'qb',jsonb_build_object('Arm',78,'Accuracy',93,'Processing',93,'Mobility',86,'Clutch',99,'overall',90)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-michael-penix-jr-2023','Michael Penix Jr.',4,'2023 Washington peak-season CFB QB profile · cfb-michael-penix-jr',0.70,'qb',jsonb_build_object('Arm',99,'Accuracy',93,'Processing',93,'Mobility',60,'Clutch',99,'overall',89)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-bo-nix-2023','Bo Nix',4,'2023 Oregon peak-season CFB QB profile · cfb-bo-nix',0.70,'qb',jsonb_build_object('Arm',86,'Accuracy',99,'Processing',99,'Mobility',86,'Clutch',86,'overall',91)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-jayden-daniels-2023','Jayden Daniels',5,'2023 LSU peak-season CFB QB profile · cfb-jayden-daniels',0.18,'qb',jsonb_build_object('Arm',93,'Accuracy',99,'Processing',93,'Mobility',99,'Clutch',93,'overall',95)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-j-j-mccarthy-2023','J.J. McCarthy',3,'2023 Michigan peak-season CFB QB profile · cfbfast-r-player-4433970-j-j-mccarthy',1.15,'qb',jsonb_build_object('Arm',93,'Accuracy',93,'Processing',93,'Mobility',86,'Clutch',93,'overall',92)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-jordan-travis-2023','Jordan Travis',3,'2023 Florida State peak-season CFB QB profile · cfbfast-r-player-4360799-jordan-travis',1.15,'qb',jsonb_build_object('Arm',86,'Accuracy',93,'Processing',93,'Mobility',93,'Clutch',93,'overall',92)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-quinn-ewers-2023','Quinn Ewers',2,'2023 Texas peak-season CFB QB profile · cfb-quinn-ewers',1.25,'qb',jsonb_build_object('Arm',93,'Accuracy',93,'Processing',86,'Mobility',69,'Clutch',93,'overall',87)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-dillon-gabriel-2024','Dillon Gabriel',3,'2024 Oregon peak-season CFB QB profile · cfbfast-r-player-4427238-dillon-gabriel',1.15,'qb',jsonb_build_object('Arm',86,'Accuracy',93,'Processing',99,'Mobility',86,'Clutch',93,'overall',91)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-shedeur-sanders-2024','Shedeur Sanders',3,'2024 Colorado peak-season CFB QB profile · cfb-shedeur-sanders',1.15,'qb',jsonb_build_object('Arm',93,'Accuracy',99,'Processing',93,'Mobility',78,'Clutch',86,'overall',90)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-cameron-ward-2024','Cameron Ward',3,'2024 Miami peak-season CFB QB profile · cfbfast-r-player-4688380-cameron-ward',1.15,'qb',jsonb_build_object('Arm',99,'Accuracy',93,'Processing',86,'Mobility',93,'Clutch',86,'overall',91)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-jaxson-dart-2024','Jaxson Dart',3,'2024 Ole Miss peak-season CFB QB profile · cfbfast-r-player-4689114-jaxson-dart',1.15,'qb',jsonb_build_object('Arm',93,'Accuracy',93,'Processing',93,'Mobility',86,'Clutch',86,'overall',90)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-will-howard-2024','Will Howard',4,'2024 Ohio State peak-season CFB QB profile · cfbfast-r-player-4429955-will-howard',0.70,'qb',jsonb_build_object('Arm',93,'Accuracy',93,'Processing',93,'Mobility',86,'Clutch',99,'overall',93)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-kyle-mccord-2024','Kyle McCord',1,'2024 Syracuse peak-season CFB QB profile · cfbfast-r-player-4433971-kyle-mccord',1.00,'qb',jsonb_build_object('Arm',93,'Accuracy',93,'Processing',86,'Mobility',60,'Clutch',86,'overall',84)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-jalen-milroe-2023','Jalen Milroe',3,'2023 Alabama peak-season CFB QB profile · cfbfast-r-player-4432734-jalen-milroe',1.15,'qb',jsonb_build_object('Arm',99,'Accuracy',78,'Processing',78,'Mobility',99,'Clutch',93,'overall',89)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-carson-beck-2023','Carson Beck',2,'2023 Georgia peak-season CFB QB profile · cfbfast-r-player-4430841-carson-beck',1.25,'qb',jsonb_build_object('Arm',93,'Accuracy',99,'Processing',93,'Mobility',69,'Clutch',86,'overall',88)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-riley-leonard-2024','Riley Leonard',3,'2024 Notre Dame peak-season CFB QB profile · cfbfast-r-player-4683423-riley-leonard',1.15,'qb',jsonb_build_object('Arm',78,'Accuracy',86,'Processing',93,'Mobility',99,'Clutch',99,'overall',91)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-kaidon-salter-2023','Kaidon Salter',1,'2023 Liberty peak-season CFB QB profile · cfbfast-r-player-4432803-kaidon-salter',1.00,'qb',jsonb_build_object('Arm',93,'Accuracy',86,'Processing',78,'Mobility',99,'Clutch',86,'overall',88)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-grayson-mccall-2021','Grayson McCall',1,'2021 Coastal Carolina peak-season CFB QB profile · cfbfast-r-player-4427936-grayson-mccall',1.00,'qb',jsonb_build_object('Arm',78,'Accuracy',99,'Processing',93,'Mobility',86,'Clutch',86,'overall',88)),
  ('football-draft-room-2026-09-v3','build-qb-cfb','cfb-build-qb-deriq-king-2018','D''Eriq King',1,'2018 Houston peak-season CFB QB profile · cfbfast-r-player-4039300-d-eriq-king',1.00,'qb',jsonb_build_object('Arm',86,'Accuracy',86,'Processing',86,'Mobility',99,'Clutch',78,'overall',87));


alter table private.auction_games
  drop constraint auction_games_mode_valid,
  drop constraint auction_games_round_valid,
  drop constraint auction_games_selection_counts_valid,
  drop constraint auction_games_bankroll_ceiling,
  add constraint auction_games_mode_valid check (mode_id in (
    'ultimate-fighter',
    'jon-jones-performances',
    'conor-mcgregor-performances',
    'charles-oliveira-performances',
    'fighter-performances',
    'strikers',
    'grapplers',
    'knockout-artists',
    'greatest-ufc-card',
    'championship-performances',
    'finishes',
    'dominant-performances',
    'wars',
    'rivalries',
    'iconic-moments',
    'nicknames',
    'build-qb',
    'build-qb-cfb'
  )),
  add constraint auction_games_round_valid check (
    current_round >= 1
    and current_round <= case
      when mode_id in ('ultimate-fighter', 'build-qb', 'build-qb-cfb') then 10
      when lifecycle_state in ('completed', 'cancelled', 'abandoned') then 8
      when content_version in (
        'ufc-auction-2026-08-v3','ufc-auction-2026-08-v4','ufc-auction-2026-08-v5',
        'ufc-auction-2026-08-v6','ufc-auction-2026-08-v7','ufc-auction-2026-08-v8'
      ) then 6
      else 8
    end
  ),
  add constraint auction_games_selection_counts_valid check (
    challenger_selection_count between 0 and case
      when mode_id in ('ultimate-fighter', 'build-qb', 'build-qb-cfb') then 5
      when lifecycle_state in ('completed', 'cancelled', 'abandoned') then 4
      when content_version in (
        'ufc-auction-2026-08-v3','ufc-auction-2026-08-v4','ufc-auction-2026-08-v5',
        'ufc-auction-2026-08-v6','ufc-auction-2026-08-v7','ufc-auction-2026-08-v8'
      ) then 3
      else 4
    end
    and recipient_selection_count between 0 and case
      when mode_id in ('ultimate-fighter', 'build-qb', 'build-qb-cfb') then 5
      when lifecycle_state in ('completed', 'cancelled', 'abandoned') then 4
      when content_version in (
        'ufc-auction-2026-08-v3','ufc-auction-2026-08-v4','ufc-auction-2026-08-v5',
        'ufc-auction-2026-08-v6','ufc-auction-2026-08-v7','ufc-auction-2026-08-v8'
      ) then 3
      else 4
    end
  ),
  add constraint auction_games_bankroll_ceiling check (
    challenger_bankroll <= case
      when mode_id in ('ultimate-fighter', 'build-qb', 'build-qb-cfb') then 50
      when lifecycle_state in ('completed', 'cancelled', 'abandoned') then 40
      when content_version in (
        'ufc-auction-2026-08-v3','ufc-auction-2026-08-v4','ufc-auction-2026-08-v5',
        'ufc-auction-2026-08-v6','ufc-auction-2026-08-v7','ufc-auction-2026-08-v8'
      ) then 30
      else 40
    end
    and recipient_bankroll <= case
      when mode_id in ('ultimate-fighter', 'build-qb', 'build-qb-cfb') then 50
      when lifecycle_state in ('completed', 'cancelled', 'abandoned') then 40
      when content_version in (
        'ufc-auction-2026-08-v3','ufc-auction-2026-08-v4','ufc-auction-2026-08-v5',
        'ufc-auction-2026-08-v6','ufc-auction-2026-08-v7','ufc-auction-2026-08-v8'
      ) then 30
      else 40
    end
  );


create or replace function private.auction_game_id_for_mode(p_mode_id text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case when p_mode_id in ('build-qb', 'build-qb-cfb') then 'draft-room' else 'auction' end;
$$;

create or replace function private.validate_auction_private_row()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_auction private.auction_games;
  v_deck_position integer;
begin
  select auction.*
    into v_auction
  from private.auction_games auction
  where auction.id = new.auction_id;

  if v_auction.id is null then
    raise exception 'Auction private row requires an Auction';
  end if;

  if tg_table_name = 'auction_deck_entries' then
    if new.deck_position > (
      case
        when v_auction.mode_id in ('ultimate-fighter', 'build-qb', 'build-qb-cfb') then 10
        when v_auction.content_version in (
          'ufc-auction-2026-08-v3',
          'ufc-auction-2026-08-v4',
          'ufc-auction-2026-08-v5',
          'ufc-auction-2026-08-v6',
          'ufc-auction-2026-08-v7',
          'ufc-auction-2026-08-v8'
        ) then 6
        else 8
      end
    ) then
      raise exception 'Auction deck position exceeds the selected mode';
    end if;
    return new;
  end if;

  if tg_table_name = 'auction_pending_bids' then
    if new.bidder_id not in (v_auction.challenger_id, v_auction.recipient_id) then
      raise exception 'Auction private row must belong to a participant';
    end if;
    if new.round_number > (
      case
        when v_auction.mode_id in ('ultimate-fighter', 'build-qb', 'build-qb-cfb') then 10
        when v_auction.content_version in (
          'ufc-auction-2026-08-v3',
          'ufc-auction-2026-08-v4',
          'ufc-auction-2026-08-v5',
          'ufc-auction-2026-08-v6',
          'ufc-auction-2026-08-v7',
          'ufc-auction-2026-08-v8'
        ) then 6
        else 8
      end
    ) then
      raise exception 'Auction round exceeds the selected mode';
    end if;

    if v_auction.mode_id = 'ultimate-fighter'
      and (
        new.ultimate_fighter_category is null
        or new.ultimate_fighter_category not in ('Striking', 'Grappling', 'Frame', 'Power', 'Heart')
      )
    then
      raise exception 'Ultimate Fighter bids require valid category intent';
    end if;

    if v_auction.mode_id in ('build-qb', 'build-qb-cfb')
      and (
        new.ultimate_fighter_category is null
        or new.ultimate_fighter_category not in ('Arm', 'Accuracy', 'Processing', 'Mobility', 'Clutch')
      )
    then
      raise exception 'Build a QB bids require valid trait intent';
    end if;

    if v_auction.mode_id not in ('ultimate-fighter', 'build-qb', 'build-qb-cfb')
      and new.ultimate_fighter_category is not null
    then
      raise exception 'Category intent is only valid for category-builder modes';
    end if;
  else
    if new.awarded_to not in (v_auction.challenger_id, v_auction.recipient_id) then
      raise exception 'Auction private row must belong to a participant';
    end if;
    if new.resolved_round > (
      case
        when v_auction.mode_id in ('ultimate-fighter', 'build-qb', 'build-qb-cfb') then 10
        when v_auction.content_version in (
          'ufc-auction-2026-08-v3',
          'ufc-auction-2026-08-v4',
          'ufc-auction-2026-08-v5',
          'ufc-auction-2026-08-v6',
          'ufc-auction-2026-08-v7',
          'ufc-auction-2026-08-v8'
        ) then 6
        else 8
      end
    ) then
      raise exception 'Auction round exceeds the selected mode';
    end if;

    select deck.deck_position
      into v_deck_position
    from private.auction_deck_entries deck
    where deck.id = new.deck_entry_id
      and deck.auction_id = new.auction_id;

    if v_deck_position is distinct from new.resolved_round then
      raise exception 'Auction award must match its deck round';
    end if;

    if v_auction.mode_id = 'ultimate-fighter'
      and (
        new.visible_category is null
        or new.visible_category not in ('Striking', 'Grappling', 'Frame', 'Power', 'Heart')
      )
    then
      raise exception 'Ultimate Fighter awards require a valid visible category';
    end if;

    if v_auction.mode_id in ('build-qb', 'build-qb-cfb')
      and (
        new.visible_category is null
        or new.visible_category not in ('Arm', 'Accuracy', 'Processing', 'Mobility', 'Clutch')
      )
    then
      raise exception 'Build a QB awards require a valid visible trait';
    end if;

    if v_auction.mode_id not in ('ultimate-fighter', 'build-qb', 'build-qb-cfb')
      and new.visible_category is not null
    then
      raise exception 'Visible category is only valid for category-builder modes';
    end if;
  end if;

  return new;
end;
$$;

create or replace function private.sync_auction_challenge_decline()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_auction private.auction_games;
  v_recipient_name text;
  v_is_draft boolean;
begin
  if old.declined_at is null and new.declined_at is not null then
    update private.auction_games
    set lifecycle_state = 'declined',
        revision = revision + 1,
        updated_at = now()
    where challenge_id = new.id
      and lifecycle_state = 'sent'
    returning * into v_auction;

    if found then
      select profile.display_name
        into v_recipient_name
      from public.profiles profile
      where profile.id = v_auction.recipient_id;

      v_is_draft := v_auction.mode_id in ('build-qb', 'build-qb-cfb');

      perform private.publish_notification_to_profile(
        v_auction.challenger_id,
        case when v_is_draft then 'draft-room:declined:' else 'auction:declined:' end || v_auction.id::text,
        case when v_is_draft then 'draft-room:' else 'auction:' end || v_auction.id::text,
        'auction_result_ready',
        case when v_is_draft then 'Draft Room declined' else 'Auction declined' end,
        v_recipient_name || ' declined your '
          || case when v_is_draft then 'Draft Room' else 'Auction' end
          || ' challenge. No result was recorded.',
        case
          when v_is_draft then '/football/draft-room?auction=' || v_auction.id::text
          else '/play/auction?auction=' || v_auction.id::text
        end,
        case when v_is_draft then 'VIEW DRAFT ROOM' else 'VIEW AUCTION' end,
        now()
      );
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.prepare_auction(p_recipient_id uuid, p_mode_id text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_id uuid;
  v_rounds integer;
  v_bankroll integer;
  v_content_version text;
  v_rarity_version text;
  v_grading_version text;
  v_tie_priority uuid;
  v_game_id text;
begin
  if v_actor is null then
    raise exception 'sign in required';
  end if;

  if p_recipient_id is null
    or not exists (select 1 from public.profiles profile where profile.id = p_recipient_id)
  then
    raise exception 'opponent not found';
  end if;

  if p_recipient_id = v_actor then
    raise exception 'self-challenges are not allowed';
  end if;

  if p_mode_id not in (
    'ultimate-fighter',
    'jon-jones-performances',
    'conor-mcgregor-performances',
    'charles-oliveira-performances',
    'fighter-performances',
    'strikers',
    'grapplers',
    'knockout-artists',
    'greatest-ufc-card',
    'finishes',
    'wars',
    'rivalries',
    'iconic-moments',
    'nicknames',
    'build-qb',
    'build-qb-cfb'
  ) then
    raise exception 'invalid sealed-bid mode';
  end if;

  if p_mode_id in ('build-qb', 'build-qb-cfb')
    and not private.draft_room_public_release_enabled()
    and not (
      public.is_pick_control_owner(v_actor)
      and public.is_pick_control_owner(p_recipient_id)
    )
  then
    raise exception 'Draft Room admin preview access required for both players';
  end if;

  select auction.id
    into v_id
  from private.auction_games auction
  where auction.challenger_id = v_actor
    and auction.recipient_id = p_recipient_id
    and auction.mode_id = p_mode_id
    and auction.lifecycle_state = 'prepared'
  for update;

  if found then
    return v_id;
  end if;

  v_game_id := private.auction_game_id_for_mode(p_mode_id);

  select
    version.content_version,
    version.rarity_version,
    version.grading_version
  into
    v_content_version,
    v_rarity_version,
    v_grading_version
  from private.auction_catalog_versions version
  where version.is_preparation_version
    and version.game_id = v_game_id;

  if v_content_version is null then
    raise exception 'Auction catalog version is unavailable';
  end if;

  v_rounds := case
    when p_mode_id in ('build-qb', 'build-qb-cfb') then 10
    when p_mode_id = 'ultimate-fighter' then 10
    when v_content_version in (
      'ufc-auction-2026-08-v3',
      'ufc-auction-2026-08-v4',
      'ufc-auction-2026-08-v5',
      'ufc-auction-2026-08-v6',
      'ufc-auction-2026-08-v7',
      'ufc-auction-2026-08-v8'
    ) then 6 else 8
  end;
  v_bankroll := case
    when p_mode_id in ('build-qb', 'build-qb-cfb') then 50
    when p_mode_id = 'ultimate-fighter' then 50
    when v_content_version in (
      'ufc-auction-2026-08-v3',
      'ufc-auction-2026-08-v4',
      'ufc-auction-2026-08-v5',
      'ufc-auction-2026-08-v6',
      'ufc-auction-2026-08-v7',
      'ufc-auction-2026-08-v8'
    ) then 30 else 40
  end;
  v_tie_priority := case
    when get_byte(extensions.gen_random_bytes(1), 0) < 128 then v_actor
    else p_recipient_id
  end;

  begin
    insert into private.auction_games (
      challenger_id,
      recipient_id,
      mode_id,
      content_version,
      rarity_version,
      grading_version,
      tie_priority_profile_id,
      challenger_bankroll,
      recipient_bankroll
    ) values (
      v_actor,
      p_recipient_id,
      p_mode_id,
      v_content_version,
      v_rarity_version,
      v_grading_version,
      v_tie_priority,
      v_bankroll,
      v_bankroll
    )
    returning id into v_id;
  exception when unique_violation then
    select auction.id
      into v_id
    from private.auction_games auction
    where auction.challenger_id = v_actor
      and auction.recipient_id = p_recipient_id
      and auction.mode_id = p_mode_id
      and auction.lifecycle_state = 'prepared';
    return v_id;
  end;

  perform private.generate_auction_deck(
    v_id,
    v_content_version,
    p_mode_id,
    v_rounds,
    null
  );

  return v_id;
end;
$$;

create or replace function private.validate_auction_bid(
  p_game private.auction_games,
  p_actor uuid,
  p_amount numeric,
  p_category text
)
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_bankroll integer;
  v_count integer;
  v_required integer;
  v_maximum integer;
  v_categories text[];
begin
  if p_amount is null
    or p_amount <> trunc(p_amount)
    or p_amount < 1
  then
    raise exception 'bid must be a whole dollar amount of at least $1';
  end if;

  v_required := case
    when p_game.mode_id in ('build-qb', 'build-qb-cfb') then 5
    when p_game.mode_id = 'ultimate-fighter' then 5
    when p_game.content_version in (
      'ufc-auction-2026-08-v3',
      'ufc-auction-2026-08-v4',
      'ufc-auction-2026-08-v5',
      'ufc-auction-2026-08-v6',
      'ufc-auction-2026-08-v7',
      'ufc-auction-2026-08-v8'
    ) then 3 else 4
  end;

  if p_actor = p_game.challenger_id then
    v_bankroll := p_game.challenger_bankroll;
    v_count := p_game.challenger_selection_count;
  elsif p_actor = p_game.recipient_id then
    v_bankroll := p_game.recipient_bankroll;
    v_count := p_game.recipient_selection_count;
  else
    raise exception 'not an Auction participant';
  end if;

  if v_count >= v_required then
    raise exception 'collection is already full';
  end if;

  v_maximum := v_bankroll - (v_required - (v_count + 1));
  if p_amount > v_maximum then
    raise exception 'bid exceeds reserve maximum of $%', v_maximum;
  end if;

  if p_game.mode_id = 'ultimate-fighter' then
    if p_category not in ('Striking', 'Grappling', 'Frame', 'Power', 'Heart') then
      raise exception 'an available Ultimate Fighter category is required';
    end if;
    if exists (
      select 1
      from private.auction_awards award
      where award.auction_id = p_game.id
        and award.awarded_to = p_actor
        and award.visible_category = p_category
    ) then
      raise exception 'Ultimate Fighter category is already filled';
    end if;
  elsif p_game.mode_id in ('build-qb', 'build-qb-cfb') then
    if p_category not in ('Arm', 'Accuracy', 'Processing', 'Mobility', 'Clutch') then
      raise exception 'an available Build a QB trait is required';
    end if;
    if exists (
      select 1
      from private.auction_awards award
      where award.auction_id = p_game.id
        and award.awarded_to = p_actor
        and award.visible_category = p_category
    ) then
      raise exception 'Build a QB trait is already filled';
    end if;
  elsif p_category is not null then
    raise exception 'category intent is only valid for Ultimate Fighter';
  end if;
end;
$$;

create or replace function private.resolve_auction_round(p_auction_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_game private.auction_games;
  v_challenger_bid private.auction_pending_bids;
  v_recipient_bid private.auction_pending_bids;
  v_deck private.auction_deck_entries;
  v_winner uuid;
  v_winning_amount integer;
  v_category text;
  v_required integer;
  v_rounds integer;
  v_other_id uuid;
  v_position integer;
  v_forced_category text;
  v_categories text[];
begin
  select auction.* into v_game
  from private.auction_games auction
  where auction.id = p_auction_id
  for update;

  if v_game.id is null then
    raise exception 'Auction not found';
  end if;

  if v_game.lifecycle_state not in ('sent', 'active') then
    raise exception 'Auction is not resolvable';
  end if;

  if exists (
    select 1 from private.auction_awards award
    where award.auction_id = p_auction_id
      and award.resolved_round = v_game.current_round
  ) then
    return;
  end if;

  select bid.* into v_challenger_bid
  from private.auction_pending_bids bid
  where bid.auction_id = p_auction_id
    and bid.round_number = v_game.current_round
    and bid.bidder_id = v_game.challenger_id;

  select bid.* into v_recipient_bid
  from private.auction_pending_bids bid
  where bid.auction_id = p_auction_id
    and bid.round_number = v_game.current_round
    and bid.bidder_id = v_game.recipient_id;

  if v_challenger_bid.auction_id is null
    or v_recipient_bid.auction_id is null
  then
    return;
  end if;

  select deck.* into v_deck
  from private.auction_deck_entries deck
  where deck.auction_id = p_auction_id
    and deck.deck_position = v_game.current_round;

  if v_deck.id is null then
    raise exception 'Auction current item is unavailable';
  end if;

  if v_challenger_bid.amount > v_recipient_bid.amount then
    v_winner := v_game.challenger_id;
    v_winning_amount := v_challenger_bid.amount;
    v_category := v_challenger_bid.ultimate_fighter_category;
  elsif v_recipient_bid.amount > v_challenger_bid.amount then
    v_winner := v_game.recipient_id;
    v_winning_amount := v_recipient_bid.amount;
    v_category := v_recipient_bid.ultimate_fighter_category;
  else
    v_winner := v_game.tie_priority_profile_id;
    v_winning_amount := v_challenger_bid.amount;
    v_category := case
      when v_winner = v_game.challenger_id then v_challenger_bid.ultimate_fighter_category
      else v_recipient_bid.ultimate_fighter_category
    end;
  end if;

  insert into private.auction_awards (
    auction_id, deck_entry_id, awarded_to, resolved_round, visible_category
  ) values (
    p_auction_id, v_deck.id, v_winner, v_game.current_round, v_category
  );

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
  v_rounds := case
    when v_game.mode_id in ('build-qb', 'build-qb-cfb') then 10
    when v_game.mode_id = 'ultimate-fighter' then 10
    when v_game.content_version in (
      'ufc-auction-2026-08-v3',
      'ufc-auction-2026-08-v4',
      'ufc-auction-2026-08-v5',
      'ufc-auction-2026-08-v6',
      'ufc-auction-2026-08-v7',
      'ufc-auction-2026-08-v8'
    ) then 6 else 8
  end;

  update private.auction_games
  set lifecycle_state = 'active',
      challenger_bankroll = challenger_bankroll - case when v_winner = challenger_id then v_winning_amount else 0 end,
      recipient_bankroll = recipient_bankroll - case when v_winner = recipient_id then v_winning_amount else 0 end,
      challenger_selection_count = challenger_selection_count + case when v_winner = challenger_id then 1 else 0 end,
      recipient_selection_count = recipient_selection_count + case when v_winner = recipient_id then 1 else 0 end,
      tie_priority_profile_id = case
        when v_challenger_bid.amount = v_recipient_bid.amount then case
          when tie_priority_profile_id = challenger_id then recipient_id
          else challenger_id
        end
        else tie_priority_profile_id
      end,
      current_round = least(current_round + 1, v_rounds),
      revision = revision + 1,
      updated_at = now()
  where id = p_auction_id
  returning * into v_game;

  if v_game.challenger_selection_count = v_required
    or v_game.recipient_selection_count = v_required
  then
    v_other_id := case
      when v_game.challenger_selection_count = v_required then v_game.recipient_id
      else v_game.challenger_id
    end;

    v_categories := case
      when v_game.mode_id = 'ultimate-fighter'
        then array['Striking','Grappling','Frame','Power','Heart']::text[]
      when v_game.mode_id in ('build-qb', 'build-qb-cfb')
        then array['Arm','Accuracy','Processing','Mobility','Clutch']::text[]
      else '{}'::text[]
    end;

    for v_position in v_game.current_round..v_rounds loop
      exit when (
        select count(*) from private.auction_awards award
        where award.auction_id = p_auction_id
          and award.awarded_to = v_other_id
      ) >= v_required;

      select deck.* into v_deck
      from private.auction_deck_entries deck
      where deck.auction_id = p_auction_id
        and deck.deck_position = v_position;

      if v_deck.id is null then
        raise exception 'Auction forced item is unavailable';
      end if;

      if cardinality(v_categories) > 0 then
        select category.name into v_forced_category
        from unnest(v_categories) with ordinality category(name, ordering)
        where not exists (
          select 1
          from private.auction_awards award
          where award.auction_id = p_auction_id
            and award.awarded_to = v_other_id
            and award.visible_category = category.name
        )
        order by category.ordering
        limit 1;
      else
        v_forced_category := null;
      end if;

      insert into private.auction_awards (
        auction_id, deck_entry_id, awarded_to, resolved_round, visible_category
      ) values (
        p_auction_id, v_deck.id, v_other_id, v_position, v_forced_category
      );

      update private.auction_games
      set challenger_bankroll = challenger_bankroll - case when v_other_id = challenger_id then 1 else 0 end,
          recipient_bankroll = recipient_bankroll - case when v_other_id = recipient_id then 1 else 0 end,
          challenger_selection_count = challenger_selection_count + case when v_other_id = challenger_id then 1 else 0 end,
          recipient_selection_count = recipient_selection_count + case when v_other_id = recipient_id then 1 else 0 end,
          current_round = least(v_position + 1, v_rounds),
          revision = revision + 1,
          updated_at = now()
      where id = p_auction_id
      returning * into v_game;
    end loop;
  end if;

  select auction.* into v_game
  from private.auction_games auction
  where auction.id = p_auction_id;

  if v_game.challenger_selection_count = v_required
    and v_game.recipient_selection_count = v_required
  then
    perform private.complete_auction_placeholder(p_auction_id);
  end if;
end;
$$;

create or replace function public.send_auction_first_bid(
  p_auction_id uuid,
  p_expected_revision bigint,
  p_amount numeric,
  p_category text default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_game private.auction_games;
  v_code text;
  v_attempt integer := 0;
  v_creator_name text;
  v_created_at timestamptz;
  v_is_draft boolean;
  v_game_id text;
  v_game_version text;
  v_game_title text;
  v_summary text;
  v_play_url text;
  v_notification_title text;
  v_notification_body text;
  v_notification_action text;
begin
  if v_actor is null then
    raise exception 'sign in required';
  end if;

  select auction.* into v_game
  from private.auction_games auction
  where auction.id = p_auction_id
  for update;

  if v_game.id is null or v_game.challenger_id <> v_actor then
    raise exception 'challenger only';
  end if;

  if v_game.lifecycle_state <> 'prepared' then
    raise exception 'Auction already sent';
  end if;

  if v_game.revision <> p_expected_revision then
    raise exception 'stale revision';
  end if;

  v_is_draft := v_game.mode_id in ('build-qb', 'build-qb-cfb');

  if v_is_draft
    and not private.draft_room_public_release_enabled()
    and not (
      public.is_pick_control_owner(v_game.challenger_id)
      and public.is_pick_control_owner(v_game.recipient_id)
    )
  then
    raise exception 'Draft Room is admin-only until public release';
  end if;

  perform private.validate_auction_bid(v_game, v_actor, p_amount, p_category);

  insert into private.auction_pending_bids (
    auction_id, round_number, bidder_id, amount, ultimate_fighter_category
  ) values (
    v_game.id, 1, v_actor, p_amount::integer, p_category
  );

  v_game_id := case when v_is_draft then 'draft-room' else 'auction' end;
  v_game_version := case when v_is_draft then 'football-draft-room-server-v1' else 'auction-server-v3' end;
  v_game_title := case when v_is_draft then 'Draft Room' else 'Auction' end;
  v_summary := case when v_is_draft then 'Build a QB' else v_game.mode_id end;
  v_play_url := case
    when v_is_draft then '/football/draft-room?auction=' || v_game.id::text
    else '/play/auction?auction=' || v_game.id::text
  end;

  loop
    v_attempt := v_attempt + 1;
    v_code := upper(substr(replace(extensions.gen_random_uuid()::text, '-', ''), 1, 8));
    begin
      insert into public.play_challenges (
        code, game_id, game_version, game_title, summary,
        creator_id, recipient_id, play_url, setup, creator_result
      ) values (
        v_code, v_game_id, v_game_version, v_game_title, v_summary,
        v_game.challenger_id, v_game.recipient_id, v_play_url, '{}'::jsonb, '{}'::jsonb
      )
      returning created_at into v_created_at;
      exit;
    exception when unique_violation then
      if v_attempt >= 5 then raise; end if;
    end;
  end loop;

  update private.auction_games
  set challenge_id = (select challenge.id from public.play_challenges challenge where challenge.code = v_code),
      lifecycle_state = 'sent',
      revision = revision + 1,
      updated_at = now()
  where id = v_game.id;

  select profile.display_name into v_creator_name
  from public.profiles profile
  where profile.id = v_game.challenger_id;

  v_notification_title := case when v_is_draft then 'Draft Room challenge received' else 'Auction challenge received' end;
  v_notification_body := case
    when v_is_draft then v_creator_name || ' challenged you to Build a QB.'
    else v_creator_name || ' challenged you to Auction.'
  end;
  v_notification_action := case when v_is_draft then 'VIEW DRAFT ROOM' else 'VIEW AUCTION' end;

  perform private.publish_notification_to_profile(
    v_game.recipient_id,
    case when v_is_draft then 'draft-room:received:' else 'auction:received:' end || v_game.id::text,
    case when v_is_draft then 'draft-room:' else 'auction:' end || v_game.id::text,
    'game_challenge_received',
    v_notification_title,
    v_notification_body,
    v_play_url,
    v_notification_action,
    v_created_at
  );

  return v_code;
end;
$$;

create or replace function public.submit_auction_bid(
  p_auction_id uuid,
  p_round integer,
  p_expected_revision bigint,
  p_amount numeric,
  p_category text default null
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_game private.auction_games;
  v_actor uuid := auth.uid();
  v_opponent uuid;
  v_was_sent boolean;
  v_actor_name text;
  v_challenger_name text;
  v_recipient_name text;
  v_challenger_score text;
  v_recipient_score text;
  v_resolved_round integer;
  v_round_resolved boolean;
  v_is_draft boolean;
  v_play_url text;
  v_prefix text;
  v_game_title text;
begin
  if v_actor is null then
    raise exception 'sign in required';
  end if;

  select auction.* into v_game
  from private.auction_games auction
  where auction.id = p_auction_id
  for update;

  if v_game.id is null
    or v_actor not in (v_game.challenger_id, v_game.recipient_id)
  then
    raise exception 'not an Auction participant';
  end if;

  v_is_draft := v_game.mode_id in ('build-qb', 'build-qb-cfb');

  if v_is_draft
    and not private.draft_room_public_release_enabled()
    and not (
      public.is_pick_control_owner(v_game.challenger_id)
      and public.is_pick_control_owner(v_game.recipient_id)
    )
  then
    raise exception 'Draft Room is admin-only until public release';
  end if;

  if v_game.lifecycle_state not in ('sent', 'active') then
    raise exception 'Auction is not accepting bids';
  end if;

  v_was_sent := v_game.lifecycle_state = 'sent';

  if v_was_sent and v_actor <> v_game.recipient_id then
    raise exception 'recipient must accept with the first bid';
  end if;

  if v_game.current_round <> p_round then
    raise exception 'wrong round';
  end if;

  if v_game.revision <> p_expected_revision then
    raise exception 'stale revision';
  end if;

  perform private.validate_auction_bid(v_game, v_actor, p_amount, p_category);

  begin
    insert into private.auction_pending_bids (
      auction_id, round_number, bidder_id, amount, ultimate_fighter_category
    ) values (
      v_game.id, p_round, v_actor, p_amount::integer, p_category
    );
  exception when unique_violation then
    raise exception 'bid is locked and cannot be edited';
  end;

  if v_was_sent then
    update public.play_challenges
    set opened_at = coalesce(opened_at, now())
    where id = v_game.challenge_id;

    select profile.display_name into v_actor_name
    from public.profiles profile where profile.id = v_actor;
  end if;

  v_resolved_round := v_game.current_round;
  perform private.resolve_auction_round(v_game.id);

  select auction.* into v_game
  from private.auction_games auction
  where auction.id = p_auction_id;

  select challenger.display_name, recipient.display_name
    into v_challenger_name, v_recipient_name
  from public.profiles challenger
  join public.profiles recipient on recipient.id = v_game.recipient_id
  where challenger.id = v_game.challenger_id;

  select exists (
    select 1 from private.auction_awards award
    where award.auction_id = p_auction_id
      and award.resolved_round = v_resolved_round
  ) into v_round_resolved;

  v_play_url := case
    when v_is_draft then '/football/draft-room?auction=' || v_game.id::text
    else '/play/auction?auction=' || v_game.id::text
  end;
  v_prefix := case when v_is_draft then 'draft-room:' else 'auction:' end;
  v_game_title := case when v_is_draft then 'Draft Room' else 'Auction' end;

  if v_round_resolved and v_game.lifecycle_state = 'active' then
    if v_was_sent then
      perform private.publish_notification_to_profile(
        v_game.challenger_id,
        v_prefix || 'accepted:' || v_game.id::text,
        v_prefix || v_game.id::text,
        'auction_action_required',
        v_game_title || ' accepted · bid now',
        v_actor_name || ' accepted your ' || v_game_title || ' challenge. Round 1 resolved and your next sealed bid is ready.',
        v_play_url,
        'PLACE BID',
        now()
      );
    else
      v_opponent := case
        when v_actor = v_game.challenger_id then v_game.recipient_id
        else v_game.challenger_id
      end;

      perform private.publish_notification_to_profile(
        v_opponent,
        v_prefix || 'round:' || v_game.id::text || ':' || v_resolved_round::text,
        v_prefix || v_game.id::text,
        'auction_action_required',
        v_game_title || ' action required',
        'Round ' || v_resolved_round::text || ' resolved. Your next sealed bid is ready.',
        v_play_url,
        'PLACE BID',
        now()
      );
    end if;
  elsif v_game.lifecycle_state = 'completed' then
    v_challenger_score := pg_catalog.regexp_replace(
      pg_catalog.regexp_replace(pg_catalog.to_char(v_game.challenger_final_score, 'FM990.00'), '0+$', ''),
      '\.$',
      ''
    );
    v_recipient_score := pg_catalog.regexp_replace(
      pg_catalog.regexp_replace(pg_catalog.to_char(v_game.recipient_final_score, 'FM990.00'), '0+$', ''),
      '\.$',
      ''
    );

    perform private.publish_notification_to_profile(
      v_game.challenger_id,
      v_prefix || 'completed:' || v_game.id::text,
      v_prefix || v_game.id::text,
      'auction_result_ready',
      case
        when v_game.winner_profile_id is null then v_game_title || ' result · True tie'
        when v_game.winner_profile_id = v_game.challenger_id then v_game_title || ' result · You won'
        else v_game_title || ' result · ' || v_recipient_name || ' won'
      end,
      'Final score: ' || v_challenger_name || ' ' || v_challenger_score
        || ' · ' || v_recipient_name || ' ' || v_recipient_score || '.',
      v_play_url,
      'VIEW RESULT',
      now()
    );

    perform private.publish_notification_to_profile(
      v_game.recipient_id,
      v_prefix || 'completed:' || v_game.id::text,
      v_prefix || v_game.id::text,
      'auction_result_ready',
      case
        when v_game.winner_profile_id is null then v_game_title || ' result · True tie'
        when v_game.winner_profile_id = v_game.recipient_id then v_game_title || ' result · You won'
        else v_game_title || ' result · ' || v_challenger_name || ' won'
      end,
      'Final score: ' || v_challenger_name || ' ' || v_challenger_score
        || ' · ' || v_recipient_name || ' ' || v_recipient_score || '.',
      v_play_url,
      'VIEW RESULT',
      now()
    );
  end if;

  return v_game.revision;
end;
$$;

create or replace function public.cancel_auction(p_auction_id uuid, p_expected_revision bigint)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_game private.auction_games;
  v_opponent uuid;
  v_actor_name text;
  v_challenge_opened_at timestamptz;
  v_is_draft boolean;
  v_play_url text;
  v_title text;
begin
  if v_actor is null then
    raise exception 'sign in required';
  end if;

  select auction.* into v_game
  from private.auction_games auction
  where auction.id = p_auction_id
  for update;

  if v_game.id is null
    or v_actor not in (v_game.challenger_id, v_game.recipient_id)
  then
    raise exception 'not an Auction participant';
  end if;

  if v_game.lifecycle_state = 'cancelled' then
    return v_game.revision;
  end if;

  if v_game.lifecycle_state = 'sent' then
    if v_actor <> v_game.challenger_id then
      raise exception 'only the challenger can cancel a pending Auction';
    end if;

    select challenge.opened_at into v_challenge_opened_at
    from public.play_challenges challenge
    where challenge.id = v_game.challenge_id;

    if v_challenge_opened_at is not null then
      raise exception 'pending Auction has already been opened';
    end if;
  elsif v_game.lifecycle_state <> 'active' then
    raise exception 'only a pending or active Auction can be cancelled';
  end if;

  if v_game.revision <> p_expected_revision then
    raise exception 'stale revision';
  end if;

  update private.auction_games
  set lifecycle_state = 'cancelled',
      cancelled_by = v_actor,
      cancelled_at = now(),
      revision = revision + 1,
      updated_at = now()
  where id = p_auction_id
  returning * into v_game;

  update public.play_challenges
  set creator_hidden_at = coalesce(creator_hidden_at, now()),
      recipient_hidden_at = coalesce(recipient_hidden_at, now())
  where id = v_game.challenge_id;

  select profile.display_name into v_actor_name
  from public.profiles profile where profile.id = v_actor;

  v_opponent := case
    when v_actor = v_game.challenger_id then v_game.recipient_id
    else v_game.challenger_id
  end;
  v_is_draft := v_game.mode_id in ('build-qb', 'build-qb-cfb');
  v_play_url := case
    when v_is_draft then '/football/draft-room?auction=' || v_game.id::text
    else '/play/auction?auction=' || v_game.id::text
  end;
  v_title := case when v_is_draft then 'Draft Room' else 'Auction' end;

  perform private.publish_notification_to_profile(
    v_opponent,
    case when v_is_draft then 'draft-room:cancelled:' else 'auction:cancelled:' end || v_game.id::text,
    case when v_is_draft then 'draft-room:' else 'auction:' end || v_game.id::text,
    'auction_result_ready',
    v_title || ' cancelled',
    v_actor_name || ' cancelled this ' || v_title || '. No winner, score, loss, or forfeit was recorded.',
    v_play_url,
    case when v_is_draft then 'VIEW DRAFT ROOM' else 'VIEW AUCTION' end,
    now()
  );

  return v_game.revision;
end;
$$;

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
    or (v_game.content_version in ('football-draft-room-2026-09-v1', 'football-draft-room-2026-09-v2', 'football-draft-room-2026-09-v3')
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
