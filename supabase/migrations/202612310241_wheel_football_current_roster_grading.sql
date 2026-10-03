-- Wheel of Football hidden current-NFL grading authority.
-- Applied on top of the live challenge-only Wheel implementation with forfeit support and tightened candidate pools.
-- Player ratings are position-normalized current-ability baselines reconstructed
-- from EA Madden NFL 27 launch ratings plus every Week 3 ratings mover available
-- on 2026-10-02. Head coaches are manually audited for current coaching quality.
-- Hidden grades never leave the server before a matchup is complete.

create table if not exists private.wheel_football_grade_authority (
  authority_key text primary key,
  display_name text not null,
  name_key text not null,
  position_family text not null check (
    position_family in ('QB','RB','WR','TE','Front Seven','Secondary','Head Coach')
  ),
  team_code text not null references private.wheel_football_teams(code) on delete restrict,
  source_rating numeric(4,1),
  hidden_grade numeric(4,1) not null check (
    hidden_grade between 0.0 and 100.0
    and hidden_grade * 2 = trunc(hidden_grade * 2)
  ),
  grade_version text not null,
  source_note text not null,
  source_reference text,
  unique (authority_key, grade_version)
);

revoke all on private.wheel_football_grade_authority from public, anon, authenticated;

create or replace function private.wheel_football_name_key(p_name text)
returns text
language sql
immutable
set search_path = ''
as $$
  select lower(
    regexp_replace(
      regexp_replace(
        translate(
          trim(coalesce(p_name,'')),
          'ÀÁÂÃÄÅàáâãäåÈÉÊËèéêëÌÍÎÏìíîïÒÓÔÕÖòóôõöÙÚÛÜùúûüÑñÇç',
          'AAAAAAaaaaaaEEEEeeeeIIIIiiiiOOOOOoooooUUUUuuuuNnCc'
        ),
        '\s+(jr\.?|sr\.?|ii|iii|iv|v)$',
        '',
        'i'
      ),
      '[^a-zA-Z0-9]',
      '',
      'g'
    )
  );
$$;

revoke all on function private.wheel_football_name_key(text) from public, anon, authenticated;

insert into private.wheel_football_grade_authority (
  authority_key,
  display_name,
  name_key,
  position_family,
  team_code,
  source_rating,
  hidden_grade,
  grade_version,
  source_note,
  source_reference
)
select
  seed.authority_key,
  seed.display_name,
  private.wheel_football_name_key(seed.display_name),
  seed.position_family,
  seed.team_code,
  seed.source_rating,
  seed.hidden_grade,
  seed.grade_version,
  seed.source_note,
  seed.source_reference
from (values
  ('wheel-current:ARI:qb:jacobybrissett','Jacoby Brissett','QB','ARI',72.0,72.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:17566'),
  ('wheel-current:ARI:rb:jeremiyahlove','Jeremiyah Love','RB','ARI',82.0,82.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:16370'),
  ('wheel-current:ARI:rb:tylerallgeier','Tyler Allgeier','RB','ARI',81.0,81.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22315'),
  ('wheel-current:ARI:rb:jamesconner','James Conner','RB','ARI',80.0,80.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:12664'),
  ('wheel-current:ARI:wr:marvinharrison','Marvin Harrison Jr.','WR','ARI',80.0,80.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14643'),
  ('wheel-current:ARI:wr:michaelwilson','Michael Wilson','WR','ARI',81.0,81.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22810'),
  ('wheel-current:ARI:wr:kendrickbourne','Kendrick Bourne','WR','ARI',76.0,76.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:12998'),
  ('wheel-current:ARI:te:treymcbride','Trey McBride','TE','ARI',99.0,99.0,'wheel-current-roster-2026-10-03','2025 AP first-team TE','ea:22093'),
  ('wheel-current:ARI:front-seven:joshsweat','Josh Sweat','Front Seven','ARI',85.0,85.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:13259'),
  ('wheel-current:ARI:front-seven:walternolen','Walter Nolen III','Front Seven','ARI',78.0,78.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15235'),
  ('wheel-current:ARI:front-seven:mackwilson','Mack Wilson Sr.','Front Seven','ARI',80.0,80.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:20582'),
  ('wheel-current:ARI:front-seven:jackgibbens','Jack Gibbens','Front Seven','ARI',72.0,72.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22678'),
  ('wheel-current:ARI:front-seven:zavencollins','Zaven Collins','Front Seven','ARI',76.0,76.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21495'),
  ('wheel-current:ARI:front-seven:dantestills','Dante Stills','Front Seven','ARI',71.0,71.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22960'),
  ('wheel-current:ARI:secondary:buddabaker','Budda Baker','Secondary','ARI',90.0,90.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:12549'),
  ('wheel-current:ARI:secondary:willjohnson','Will Johnson','Secondary','ARI',77.0,77.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15267'),
  ('wheel-current:ARI:secondary:andrewwingard','Andrew Wingard','Secondary','ARI',76.0,76.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:20631'),
  ('wheel-current:ARI:secondary:garrettwilliams','Garrett Williams','Secondary','ARI',78.0,78.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:23028'),
  ('wheel-current:ARI:secondary:maxmelton','Max Melton','Secondary','ARI',74.0,74.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14953'),
  ('wheel-current:ARI:secondary:denzelburke','Denzel Burke','Secondary','ARI',71.0,71.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15297'),
  ('wheel-current:ATL:qb:michaelpenix','Michael Penix Jr.','QB','ATL',73.0,73.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14608'),
  ('wheel-current:ATL:rb:bijanrobinson','Bijan Robinson','RB','ATL',97.0,99.0,'wheel-current-roster-2026-10-03','2025 AP first-team RB','ea:22690'),
  ('wheel-current:ATL:rb:brianrobinson','Brian Robinson','RB','ATL',78.0,78.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22055'),
  ('wheel-current:ATL:wr:drakelondon','Drake London','WR','ATL',92.0,91.0,'wheel-current-roster-2026-10-03','High-end current-ability calibration','ea:22068'),
  ('wheel-current:ATL:wr:jahandotson','Jahan Dotson','WR','ATL',73.0,73.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22073'),
  ('wheel-current:ATL:wr:olamidezaccheaus','Olamide Zaccheaus','WR','ATL',73.0,73.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:20802'),
  ('wheel-current:ATL:te:kylepitts','Kyle Pitts Sr.','TE','ATL',81.0,95.0,'wheel-current-roster-2026-10-03','2025 AP second-team TE','ea:21565'),
  ('wheel-current:ATL:front-seven:jamespearce','James Pearce Jr.','Front Seven','ATL',79.0,79.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15202'),
  ('wheel-current:ATL:front-seven:gervondexter','Gervon Dexter Sr.','Front Seven','ATL',80.0,80.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22921'),
  ('wheel-current:ATL:front-seven:zadariussmith','Za''Darius Smith','Front Seven','ATL',76.0,76.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea-current-2026-10-03'),
  ('wheel-current:ATL:front-seven:jalonwalker','Jalon Walker','Front Seven','ATL',79.0,79.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15265'),
  ('wheel-current:ATL:front-seven:divinedeablo','Divine Deablo','Front Seven','ATL',81.0,81.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21667'),
  ('wheel-current:ATL:front-seven:maasonsmith','Maason Smith','Front Seven','ATL',69.0,69.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14859'),
  ('wheel-current:ATL:secondary:jessiebates','Jessie Bates III','Secondary','ATL',94.0,94.0,'wheel-current-roster-2026-10-03','2025 AP second-team safety','ea:13202'),
  ('wheel-current:ATL:secondary:ajterrell','A.J. Terrell Jr.','Secondary','ATL',88.0,88.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21002'),
  ('wheel-current:ATL:secondary:xavierwatts','Xavier Watts','Secondary','ATL',79.0,79.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15331'),
  ('wheel-current:ATL:secondary:mikehughes','Mike Hughes','Secondary','ATL',75.0,75.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:13148'),
  ('wheel-current:ATL:secondary:cjhenderson','C.J. Henderson','Secondary','ATL',73.0,73.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21004'),
  ('wheel-current:ATL:secondary:billybowman','Billy Bowman Jr.','Secondary','ATL',73.0,73.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15332'),
  ('wheel-current:BAL:qb:lamarjackson','Lamar Jackson','QB','BAL',94.0,96.0,'wheel-current-roster-2026-10-03','Recent MVP/All-Pro caliber','ea:13092'),
  ('wheel-current:BAL:rb:derrickhenry','Derrick Henry','RB','BAL',93.0,93.0,'wheel-current-roster-2026-10-03','Elite current-ability calibration','ea:17557'),
  ('wheel-current:BAL:rb:justicehill','Justice Hill','RB','BAL',77.0,77.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:20490'),
  ('wheel-current:BAL:wr:zayflowers','Zay Flowers','WR','BAL',88.0,88.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22768'),
  ('wheel-current:BAL:wr:rashodbateman','Rashod Bateman','WR','BAL',77.0,77.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21584'),
  ('wheel-current:BAL:wr:jakobilane','Ja''Kobi Lane','WR','BAL',71.0,71.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:10170'),
  ('wheel-current:BAL:te:markandrews','Mark Andrews','TE','BAL',90.0,89.0,'wheel-current-roster-2026-10-03','Current-ability calibration','ea:13112'),
  ('wheel-current:BAL:front-seven:treyhendrickson','Trey Hendrickson','Front Seven','BAL',90.0,90.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:12692'),
  ('wheel-current:BAL:front-seven:roquansmith','Roquan Smith','Front Seven','BAL',93.0,93.0,'wheel-current-roster-2026-10-03','High-end current-ability calibration','ea:13082'),
  ('wheel-current:BAL:front-seven:nnamdimadubuike','Nnamdi Madubuike','Front Seven','BAL',90.0,90.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:20982'),
  ('wheel-current:BAL:front-seven:taviusrobinson','Tavius Robinson','Front Seven','BAL',74.0,74.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:23142'),
  ('wheel-current:BAL:front-seven:calaiscampbell','Calais Campbell','Front Seven','BAL',82.0,82.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:28363'),
  ('wheel-current:BAL:front-seven:trentonsimpson','Trenton Simpson','Front Seven','BAL',78.0,78.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22704'),
  ('wheel-current:BAL:secondary:kylehamilton','Kyle Hamilton','Secondary','BAL',92.0,98.0,'wheel-current-roster-2026-10-03','2025 AP first-team safety','ea:22226'),
  ('wheel-current:BAL:secondary:marlonhumphrey','Marlon Humphrey','Secondary','BAL',85.0,85.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:12544'),
  ('wheel-current:BAL:secondary:natewiggins','Nate Wiggins','Secondary','BAL',83.0,83.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14924'),
  ('wheel-current:BAL:secondary:malakistarks','Malaki Starks','Secondary','BAL',78.0,78.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15357'),
  ('wheel-current:BAL:secondary:jaylinnhawkins','Jaylinn Hawkins','Secondary','BAL',78.0,78.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21272'),
  ('wheel-current:BUF:qb:joshallen','Josh Allen','QB','BUF',99.0,97.0,'wheel-current-roster-2026-10-03','Recent MVP/All-Pro caliber','ea:13197'),
  ('wheel-current:BUF:rb:jamescook','James Cook III','RB','BUF',94.0,96.0,'wheel-current-roster-2026-10-03','2025 AP second-team RB','ea:22054'),
  ('wheel-current:BUF:rb:tyjohnson','Ty Johnson','RB','BUF',75.0,75.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:20734'),
  ('wheel-current:BUF:wr:djmoore','DJ Moore','WR','BUF',84.0,84.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:13184'),
  ('wheel-current:BUF:wr:khalilshakir','Khalil Shakir','WR','BUF',83.0,83.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22074'),
  ('wheel-current:BUF:wr:keoncoleman','Keon Coleman','WR','BUF',75.0,75.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14646'),
  ('wheel-current:BUF:te:daltonkincaid','Dalton Kincaid','TE','BUF',81.0,81.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22823'),
  ('wheel-current:BUF:front-seven:gregrousseau','Greg Rousseau','Front Seven','BUF',90.0,90.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21517'),
  ('wheel-current:BUF:front-seven:bradleychubb','Bradley Chubb','Front Seven','BUF',78.0,78.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:13079'),
  ('wheel-current:BUF:front-seven:edoliver','Ed Oliver','Front Seven','BUF',82.0,82.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:20548'),
  ('wheel-current:BUF:front-seven:terrelbernard','Terrel Bernard','Front Seven','BUF',83.0,83.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22192'),
  ('wheel-current:BUF:front-seven:dorianwilliams','Dorian Williams','Front Seven','BUF',74.0,74.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:23015'),
  ('wheel-current:BUF:front-seven:tjsanders','T.J. Sanders','Front Seven','BUF',73.0,73.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15241'),
  ('wheel-current:BUF:secondary:christianbenford','Christian Benford','Secondary','BUF',80.0,80.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22487'),
  ('wheel-current:BUF:secondary:cjgardnerjohnson','C.J. Gardner-Johnson','Secondary','BUF',76.0,76.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:20621'),
  ('wheel-current:BUF:secondary:maxwellhairston','Maxwell Hairston','Secondary','BUF',78.0,78.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15328'),
  ('wheel-current:BUF:secondary:colebishop','Cole Bishop','Secondary','BUF',80.0,80.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14958'),
  ('wheel-current:BUF:secondary:deealford','Dee Alford','Secondary','BUF',76.0,76.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22628'),
  ('wheel-current:CAR:qb:bryceyoung','Bryce Young','QB','CAR',78.0,78.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22686'),
  ('wheel-current:CAR:rb:chubahubbard','Chuba Hubbard','RB','CAR',82.0,82.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21574'),
  ('wheel-current:CAR:rb:jonathonbrooks','Jonathon Brooks','RB','CAR',76.0,76.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14621'),
  ('wheel-current:CAR:wr:tetairoamcmillan','Tetairoa McMillan','WR','CAR',85.0,85.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15097'),
  ('wheel-current:CAR:wr:jalencoker','Jalen Coker','WR','CAR',76.0,76.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:1325'),
  ('wheel-current:CAR:wr:xavierlegette','Xavier Legette','WR','CAR',74.0,74.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14652'),
  ('wheel-current:CAR:te:tommytremble','Tommy Tremble','TE','CAR',72.0,72.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21777'),
  ('wheel-current:CAR:front-seven:derrickbrown','Derrick Brown','Front Seven','CAR',96.0,96.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21286'),
  ('wheel-current:CAR:front-seven:devinlloyd','Devin Lloyd','Front Seven','CAR',86.0,92.0,'wheel-current-roster-2026-10-03','2025 AP second-team LB','ea:22183'),
  ('wheel-current:CAR:front-seven:jaelanphillips','Jaelan Phillips','Front Seven','CAR',81.0,81.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21512'),
  ('wheel-current:CAR:front-seven:bobbyokereke','Bobby Okereke','Front Seven','CAR',82.0,82.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea-current-2026-10-03'),
  ('wheel-current:CAR:front-seven:princelyumanmielen','Princely Umanmielen','Front Seven','CAR',72.0,72.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15177'),
  ('wheel-current:CAR:front-seven:leehunter','Lee Hunter','Front Seven','CAR',74.0,74.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:1857'),
  ('wheel-current:CAR:secondary:jayceehorn','Jaycee Horn','Secondary','CAR',87.0,87.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21451'),
  ('wheel-current:CAR:secondary:trevonmoehrig','Tre''von Moehrig','Secondary','CAR',81.0,81.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21490'),
  ('wheel-current:CAR:secondary:lathanransom','Lathan Ransom','Secondary','CAR',70.0,70.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15334'),
  ('wheel-current:CAR:secondary:willlee','Will Lee III','Secondary','CAR',70.0,70.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:16315'),
  ('wheel-current:CAR:secondary:nickscott','Nick Scott','Secondary','CAR',75.0,75.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:20747'),
  ('wheel-current:CAR:secondary:akaylebevans','Akayleb Evans','Secondary','CAR',71.0,71.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22208'),
  ('wheel-current:CAR:te:darrenwaller','Darren Waller','TE','CAR',81.0,81.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea-current-2026-10-03'),
  ('wheel-current:CHI:qb:calebwilliams','Caleb Williams','QB','CHI',90.0,88.0,'wheel-current-roster-2026-10-03','Current-ability calibration','ea:14500'),
  ('wheel-current:CHI:rb:dandreswift','D''Andre Swift','RB','CHI',85.0,85.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:20920'),
  ('wheel-current:CHI:rb:kylemonangai','Kyle Monangai','RB','CHI',78.0,78.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15035'),
  ('wheel-current:CHI:wr:romeodunze','Rome Odunze','WR','CHI',82.0,82.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14645'),
  ('wheel-current:CHI:wr:lutherburden','Luther Burden III','WR','CHI',79.0,79.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15095'),
  ('wheel-current:CHI:wr:kalifraymond','Kalif Raymond','WR','CHI',75.0,75.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:12493'),
  ('wheel-current:CHI:te:colstonloveland','Colston Loveland','TE','CHI',84.0,84.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15117'),
  ('wheel-current:CHI:front-seven:montezsweat','Montez Sweat','Front Seven','CHI',82.0,82.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:20411'),
  ('wheel-current:CHI:front-seven:gradyjarrett','Grady Jarrett','Front Seven','CHI',81.0,81.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:2549'),
  ('wheel-current:CHI:front-seven:tjedwards','T.J. Edwards','Front Seven','CHI',81.0,81.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:20591'),
  ('wheel-current:CHI:front-seven:austinbooker','Austin Booker','Front Seven','CHI',73.0,73.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14875'),
  ('wheel-current:CHI:front-seven:devinbush','Devin Bush','Front Seven','CHI',86.0,86.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:20583'),
  ('wheel-current:CHI:front-seven:dayoodeyingbo','Dayo Odeyingbo','Front Seven','CHI',73.0,73.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21692'),
  ('wheel-current:CHI:secondary:jaylonjohnson','Jaylon Johnson','Secondary','CHI',90.0,90.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21009'),
  ('wheel-current:CHI:secondary:kylergordon','Kyler Gordon','Secondary','CHI',83.0,83.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22261'),
  ('wheel-current:CHI:secondary:dillonthieneman','Dillon Thieneman','Secondary','CHI',77.0,77.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:10193'),
  ('wheel-current:CHI:secondary:tyriquestevenson','Tyrique Stevenson Sr.','Secondary','CHI',75.0,75.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:23038'),
  ('wheel-current:CHI:secondary:xavierwoods','Xavier Woods','Secondary','CHI',78.0,78.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea-current-2026-10-03'),
  ('wheel-current:CHI:secondary:malikmuhammad','Malik Muhammad II','Secondary','CHI',70.0,70.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:1867'),
  ('wheel-current:CIN:qb:joeburrow','Joe Burrow','QB','CIN',97.0,95.0,'wheel-current-roster-2026-10-03','Elite current-ability calibration','ea:20948'),
  ('wheel-current:CIN:rb:chasebrown','Chase Brown','RB','CIN',82.0,82.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22740'),
  ('wheel-current:CIN:rb:samajeperine','Samaje Perine','RB','CIN',75.0,75.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:12627'),
  ('wheel-current:CIN:wr:jamarrchase','Ja''Marr Chase','WR','CIN',99.0,98.0,'wheel-current-roster-2026-10-03','2025 AP first-team WR','ea:21586'),
  ('wheel-current:CIN:wr:teehiggins','Tee Higgins','WR','CIN',87.0,92.0,'wheel-current-roster-2026-10-03','High-end current-ability calibration','ea:20962'),
  ('wheel-current:CIN:wr:andreiiosivas','Andrei Iosivas','WR','CIN',73.0,73.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22778'),
  ('wheel-current:CIN:te:drewsample','Drew Sample','TE','CIN',68.0,68.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:20395'),
  ('wheel-current:CIN:front-seven:dexterlawrence','Dexter Lawrence II','Front Seven','CIN',93.0,95.0,'wheel-current-roster-2026-10-03','Elite current-ability calibration','ea:20552'),
  ('wheel-current:CIN:front-seven:jonathanallen','Jonathan Allen','Front Seven','CIN',87.0,87.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:12521'),
  ('wheel-current:CIN:front-seven:boyemafe','Boye Mafe','Front Seven','CIN',78.0,78.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22153'),
  ('wheel-current:CIN:front-seven:mylesmurphy','Myles Murphy','Front Seven','CIN',73.0,73.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22914'),
  ('wheel-current:CIN:front-seven:demetriusknight','Demetrius Knight Jr.','Front Seven','CIN',73.0,73.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15245'),
  ('wheel-current:CIN:front-seven:barrettcarter','Barrett Carter','Front Seven','CIN',69.0,69.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15246'),
  ('wheel-current:CIN:secondary:daxhill','Dax Hill','Secondary','CIN',78.0,78.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22263'),
  ('wheel-current:CIN:secondary:djturner','DJ Turner II','Secondary','CIN',83.0,83.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:23031'),
  ('wheel-current:CIN:secondary:jordanbattle','Jordan Battle','Secondary','CIN',76.0,76.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:23025'),
  ('wheel-current:CIN:secondary:bryancook','Bryan Cook','Secondary','CIN',80.0,80.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22234'),
  ('wheel-current:CIN:secondary:tacariodavis','Tacario Davis','Secondary','CIN',71.0,71.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:16230'),
  ('wheel-current:CIN:te:mikegesicki','Mike Gesicki','TE','CIN',79.0,79.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:13192'),
  ('wheel-current:CLE:qb:deshaunwatson','Deshaun Watson','QB','CLE',69.0,69.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:12561'),
  ('wheel-current:CLE:rb:quinshonjudkins','Quinshon Judkins','RB','CLE',82.0,82.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14811'),
  ('wheel-current:CLE:rb:dylansampson','Dylan Sampson','RB','CLE',75.0,75.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15044'),
  ('wheel-current:CLE:wr:jerryjeudy','Jerry Jeudy','WR','CLE',80.0,80.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:20940'),
  ('wheel-current:CLE:wr:kcconcepcion','KC Concepcion Jr.','WR','CLE',75.0,75.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:16347'),
  ('wheel-current:CLE:wr:denzelboston','Denzel Boston','WR','CLE',74.0,74.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:1833'),
  ('wheel-current:CLE:te:haroldfannin','Harold Fannin Jr.','TE','CLE',80.0,80.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15120'),
  ('wheel-current:CLE:front-seven:jaredverse','Jared Verse','Front Seven','CLE',88.0,88.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14752'),
  ('wheel-current:CLE:front-seven:masongraham','Mason Graham','Front Seven','CLE',81.0,81.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15237'),
  ('wheel-current:CLE:front-seven:jeremiahowusukoramoah','Jeremiah Owusu-Koramoah','Front Seven','CLE',82.0,82.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21500'),
  ('wheel-current:CLE:front-seven:quincywilliams','Quincy Williams','Front Seven','CLE',79.0,79.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:20728'),
  ('wheel-current:CLE:front-seven:carsonschwesinger','Carson Schwesinger','Front Seven','CLE',83.0,83.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15266'),
  ('wheel-current:CLE:front-seven:isaiahmcguire','Isaiah McGuire','Front Seven','CLE',72.0,72.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22971'),
  ('wheel-current:CLE:secondary:denzelward','Denzel Ward','Secondary','CLE',93.0,93.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:13101'),
  ('wheel-current:CLE:secondary:tysoncampbell','Tyson Campbell','Secondary','CLE',79.0,79.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21696'),
  ('wheel-current:CLE:secondary:grantdelpit','Grant Delpit','Secondary','CLE',82.0,82.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21019'),
  ('wheel-current:CLE:secondary:ronniehickman','Ronnie Hickman','Secondary','CLE',76.0,76.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22710'),
  ('wheel-current:CLE:secondary:mylesharden','Myles Harden','Secondary','CLE',68.0,68.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:1142'),
  ('wheel-current:DAL:qb:dakprescott','Dak Prescott','QB','DAL',91.0,90.0,'wheel-current-roster-2026-10-03','High-end current-ability calibration','ea:17567'),
  ('wheel-current:DAL:rb:javontewilliams','Javonte Williams','RB','DAL',86.0,86.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21581'),
  ('wheel-current:DAL:rb:tylergoodson','Tyler Goodson','RB','DAL',68.0,68.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22325'),
  ('wheel-current:DAL:wr:ceedeelamb','CeeDee Lamb','WR','DAL',93.0,95.0,'wheel-current-roster-2026-10-03','Elite current-ability calibration','ea:20932'),
  ('wheel-current:DAL:wr:georgepickens','George Pickens','WR','DAL',89.0,96.0,'wheel-current-roster-2026-10-03','2025 AP second-team WR','ea:22365'),
  ('wheel-current:DAL:wr:ryanflournoy','Ryan Flournoy','WR','DAL',76.0,76.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:1124'),
  ('wheel-current:DAL:te:jakeferguson','Jake Ferguson','TE','DAL',82.0,82.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22094'),
  ('wheel-current:DAL:front-seven:quinnenwilliams','Quinnen Williams','Front Seven','DAL',92.0,92.0,'wheel-current-roster-2026-10-03','High-end current-ability calibration','ea:20547'),
  ('wheel-current:DAL:front-seven:rashangary','Rashan Gary','Front Seven','DAL',83.0,83.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:20551'),
  ('wheel-current:DAL:front-seven:kennyclark','Kenny Clark','Front Seven','DAL',79.0,79.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:17661'),
  ('wheel-current:DAL:front-seven:demarvionovershown','DeMarvion Overshown','Front Seven','DAL',77.0,77.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22997'),
  ('wheel-current:DAL:front-seven:donovanezeiruaku','Donovan Ezeiruaku','Front Seven','DAL',76.0,76.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15171'),
  ('wheel-current:DAL:front-seven:deewinters','Dee Winters','Front Seven','DAL',77.0,77.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:23001'),
  ('wheel-current:DAL:secondary:daronbland','DaRon Bland','Secondary','DAL',82.0,82.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22485'),
  ('wheel-current:DAL:secondary:joeyporter','Joey Porter Jr.','Secondary','DAL',85.0,85.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22706'),
  ('wheel-current:DAL:secondary:calebdowns','Caleb Downs','Secondary','DAL',82.0,82.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:16198'),
  ('wheel-current:DAL:secondary:malikhooker','Malik Hooker','Secondary','DAL',78.0,78.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:12527'),
  ('wheel-current:DAL:secondary:markquesebell','Markquese Bell','Secondary','DAL',72.0,72.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22229'),
  ('wheel-current:DEN:qb:bonix','Bo Nix','QB','DEN',81.0,90.0,'wheel-current-roster-2026-10-03','High-end current-ability calibration','ea:14609'),
  ('wheel-current:DEN:rb:jkdobbins','J.K. Dobbins','RB','DEN',81.0,81.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:20926'),
  ('wheel-current:DEN:rb:rjharvey','RJ Harvey','RB','DEN',80.0,80.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15037'),
  ('wheel-current:DEN:wr:courtlandsutton','Courtland Sutton','WR','DEN',86.0,86.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:13087'),
  ('wheel-current:DEN:wr:jaylenwaddle','Jaylen Waddle','WR','DEN',86.0,86.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21760'),
  ('wheel-current:DEN:wr:marvinmims','Marvin Mims Jr.','WR','DEN',78.0,78.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22767'),
  ('wheel-current:DEN:wr:patbryant','Pat Bryant','WR','DEN',72.0,72.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15074'),
  ('wheel-current:DEN:te:evanengram','Evan Engram','TE','DEN',78.0,78.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:12589'),
  ('wheel-current:DEN:front-seven:nikbonitto','Nik Bonitto','Front Seven','DEN',91.0,91.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22142'),
  ('wheel-current:DEN:front-seven:zachallen','Zach Allen','Front Seven','DEN',88.0,96.0,'wheel-current-roster-2026-10-03','2025 AP first-team interior DL','ea:20419'),
  ('wheel-current:DEN:front-seven:alexsingleton','Alex Singleton','Front Seven','DEN',85.0,85.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:20881'),
  ('wheel-current:DEN:front-seven:jonahelliss','Jonah Elliss','Front Seven','DEN',73.0,73.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14764'),
  ('wheel-current:DEN:front-seven:djjones','D.J. Jones','Front Seven','DEN',77.0,77.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:12824'),
  ('wheel-current:DEN:front-seven:justinstrnad','Justin Strnad','Front Seven','DEN',74.0,74.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21273'),
  ('wheel-current:DEN:secondary:patsurtain','Pat Surtain II','Secondary','DEN',97.0,97.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3 / reviewed elite anchor','ea-current-2026-10-03'),
  ('wheel-current:DEN:secondary:talanoahufanga','Talanoa Hufanga','Secondary','DEN',89.0,91.0,'wheel-current-roster-2026-10-03','2025 AP second-team safety','ea:21488'),
  ('wheel-current:DEN:secondary:brandonjones','Brandon Jones','Secondary','DEN',83.0,83.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21267'),
  ('wheel-current:DEN:secondary:rileymoss','Riley Moss','Secondary','DEN',77.0,77.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22218'),
  ('wheel-current:DEN:secondary:jaquanmcmillian','Ja''Quan McMillian','Secondary','DEN',79.0,79.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22267'),
  ('wheel-current:DET:qb:jaredgoff','Jared Goff','QB','DET',88.0,91.0,'wheel-current-roster-2026-10-03','High-end current-ability calibration','ea:17540'),
  ('wheel-current:DET:rb:jahmyrgibbs','Jahmyr Gibbs','RB','DET',98.0,95.0,'wheel-current-roster-2026-10-03','Elite current-ability calibration','ea:22691'),
  ('wheel-current:DET:rb:isiahpacheco','Isiah Pacheco','RB','DET',76.0,76.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22334'),
  ('wheel-current:DET:wr:amonrastbrown','Amon-Ra St. Brown','WR','DET',95.0,95.0,'wheel-current-roster-2026-10-03','2025 AP second-team WR','ea:21606'),
  ('wheel-current:DET:wr:jamesonwilliams','Jameson Williams','WR','DET',85.0,85.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22375'),
  ('wheel-current:DET:wr:isaacteslaa','Isaac TeSlaa','WR','DET',73.0,73.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15067'),
  ('wheel-current:DET:te:samlaporta','Sam LaPorta','TE','DET',88.0,91.0,'wheel-current-roster-2026-10-03','High-end current-ability calibration','ea:22826'),
  ('wheel-current:DET:front-seven:aidanhutchinson','Aidan Hutchinson','Front Seven','DET',93.0,94.0,'wheel-current-roster-2026-10-03','2025 AP second-team edge','ea:22145'),
  ('wheel-current:DET:front-seven:alimmcneill','Alim McNeill','Front Seven','DET',83.0,83.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21522'),
  ('wheel-current:DET:front-seven:jackcampbell','Jack Campbell','Front Seven','DET',87.0,96.0,'wheel-current-roster-2026-10-03','2025 AP first-team LB','ea:22705'),
  ('wheel-current:DET:front-seven:derrickbarnes','Derrick Barnes','Front Seven','DET',74.0,74.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21674'),
  ('wheel-current:DET:front-seven:tyleikwilliams','Tyleik Williams','Front Seven','DET',78.0,78.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15204'),
  ('wheel-current:DET:front-seven:djwonnum','DJ Wonnum','Front Seven','DET',76.0,76.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21141'),
  ('wheel-current:DET:secondary:brianbranch','Brian Branch','Secondary','DET',91.0,93.0,'wheel-current-roster-2026-10-03','High-end current-ability calibration','ea:23024'),
  ('wheel-current:DET:secondary:kerbyjoseph','Kerby Joseph','Secondary','DET',91.0,91.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22227'),
  ('wheel-current:DET:secondary:djreed','D.J. Reed','Secondary','DET',82.0,82.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:13159'),
  ('wheel-current:DET:secondary:rogermccreary','Roger McCreary','Secondary','DET',76.0,76.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22206'),
  ('wheel-current:DET:secondary:ennisrakestraw','Ennis Rakestraw Jr.','Secondary','DET',72.0,72.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14934'),
  ('wheel-current:GB:qb:jordanlove','Jordan Love','QB','GB',86.0,89.0,'wheel-current-roster-2026-10-03','Current-ability calibration','ea:20915'),
  ('wheel-current:GB:rb:joshjacobs','Josh Jacobs','RB','GB',89.0,90.0,'wheel-current-roster-2026-10-03','High-end current-ability calibration','ea:20488'),
  ('wheel-current:GB:rb:marshawnlloyd','MarShawn Lloyd','RB','GB',72.0,72.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14628'),
  ('wheel-current:GB:wr:christianwatson','Christian Watson','WR','GB',78.0,78.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22373'),
  ('wheel-current:GB:wr:jaydenreed','Jayden Reed','WR','GB',80.0,80.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22786'),
  ('wheel-current:GB:wr:matthewgolden','Matthew Golden','WR','GB',79.0,79.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15096'),
  ('wheel-current:GB:te:tuckerkraft','Tucker Kraft','TE','GB',85.0,85.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22828'),
  ('wheel-current:GB:front-seven:micahparsons','Micah Parsons','Front Seven','GB',98.0,98.0,'wheel-current-roster-2026-10-03','2025 AP first-team edge','ea:21476'),
  ('wheel-current:GB:front-seven:edgerrincooper','Edgerrin Cooper','Front Seven','GB',80.0,80.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14902'),
  ('wheel-current:GB:front-seven:zairefranklin','Zaire Franklin','Front Seven','GB',79.0,79.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:13480'),
  ('wheel-current:GB:front-seven:javonhargrave','Javon Hargrave','Front Seven','GB',80.0,80.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:17670'),
  ('wheel-current:GB:front-seven:devontewyatt','Devonte Wyatt','Front Seven','GB',78.0,78.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22166'),
  ('wheel-current:GB:front-seven:lukasvanness','Lukas Van Ness','Front Seven','GB',79.0,79.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22926'),
  ('wheel-current:GB:secondary:xaviermckinney','Xavier McKinney','Secondary','GB',92.0,93.0,'wheel-current-roster-2026-10-03','2025 AP second-team safety','ea:21023'),
  ('wheel-current:GB:secondary:evanwilliams','Evan Williams','Secondary','GB',77.0,77.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:1080'),
  ('wheel-current:GB:secondary:keiseannixon','Keisean Nixon','Secondary','GB',78.0,78.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:20723'),
  ('wheel-current:GB:secondary:javonbullard','Javon Bullard','Secondary','GB',78.0,78.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14944'),
  ('wheel-current:GB:secondary:brandoncisse','Brandon Cisse','Secondary','GB',72.0,72.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:16349'),
  ('wheel-current:HOU:qb:cjstroud','C.J. Stroud','QB','HOU',76.0,89.0,'wheel-current-roster-2026-10-03','Current-ability calibration','ea:22688'),
  ('wheel-current:HOU:rb:davidmontgomery','David Montgomery','RB','HOU',83.0,83.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:20489'),
  ('wheel-current:HOU:rb:woodymarks','Woody Marks','RB','HOU',80.0,80.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14809'),
  ('wheel-current:HOU:wr:nicocollins','Nico Collins','WR','HOU',90.0,94.0,'wheel-current-roster-2026-10-03','High-end current-ability calibration','ea:21587'),
  ('wheel-current:HOU:wr:tankdell','Tank Dell','WR','HOU',79.0,79.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22764'),
  ('wheel-current:HOU:wr:kayshonboutte','Kayshon Boutte','WR','HOU',80.0,80.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22901'),
  ('wheel-current:HOU:wr:xavierhutchinson','Xavier Hutchinson','WR','HOU',73.0,73.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22769'),
  ('wheel-current:HOU:te:daltonschultz','Dalton Schultz','TE','HOU',84.0,84.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:13435'),
  ('wheel-current:HOU:front-seven:willanderson','Will Anderson Jr.','Front Seven','HOU',95.0,98.0,'wheel-current-roster-2026-10-03','2025 AP first-team edge','ea:22702'),
  ('wheel-current:HOU:front-seven:daniellehunter','Danielle Hunter','Front Seven','HOU',92.0,94.0,'wheel-current-roster-2026-10-03','2025 AP second-team edge','ea:2540'),
  ('wheel-current:HOU:front-seven:azeezalshaair','Azeez Al-Shaair','Front Seven','HOU',83.0,83.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:20688'),
  ('wheel-current:HOU:front-seven:jadeveonclowney','Jadeveon Clowney','Front Seven','HOU',80.0,80.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea-current-2026-10-03'),
  ('wheel-current:HOU:front-seven:sheldonrankins','Sheldon Rankins','Front Seven','HOU',81.0,81.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:17550'),
  ('wheel-current:HOU:front-seven:henrytootoo','Henry To''oTo''o','Front Seven','HOU',75.0,75.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22998'),
  ('wheel-current:HOU:secondary:derekstingley','Derek Stingley Jr.','Secondary','HOU',92.0,99.0,'wheel-current-roster-2026-10-03','2025 AP first-team CB','ea:22269'),
  ('wheel-current:HOU:secondary:jalenpitre','Jalen Pitre','Secondary','HOU',86.0,86.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22230'),
  ('wheel-current:HOU:secondary:calenbullock','Calen Bullock','Secondary','HOU',83.0,83.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14939'),
  ('wheel-current:HOU:secondary:kamarilassiter','Kamari Lassiter','Secondary','HOU',87.0,87.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14929'),
  ('wheel-current:HOU:secondary:reedblankenship','Reed Blankenship','Secondary','HOU',79.0,79.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21792'),
  ('wheel-current:IND:qb:danieljones','Daniel Jones','QB','IND',78.0,78.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:20427'),
  ('wheel-current:IND:rb:jonathantaylor','Jonathan Taylor','RB','IND',96.0,93.0,'wheel-current-roster-2026-10-03','Elite current-ability calibration','ea:20928'),
  ('wheel-current:IND:rb:sethmcgowan','Seth McGowan','RB','IND',65.0,65.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:10173'),
  ('wheel-current:IND:wr:keenanallen','Keenan Allen','WR','IND',82.0,82.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea-current-2026-10-03'),
  ('wheel-current:IND:wr:joshdowns','Josh Downs','WR','IND',81.0,81.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22763'),
  ('wheel-current:IND:wr:alecpierce','Alec Pierce','WR','IND',84.0,84.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22085'),
  ('wheel-current:IND:wr:dariusslayton','Darius Slayton','WR','IND',78.0,78.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:20655'),
  ('wheel-current:IND:te:tylerwarren','Tyler Warren','TE','IND',83.0,83.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15102'),
  ('wheel-current:IND:front-seven:deforestbuckner','DeForest Buckner','Front Seven','IND',91.0,91.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:17542'),
  ('wheel-current:IND:front-seven:laiatulatu','Laiatu Latu','Front Seven','IND',82.0,82.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14750'),
  ('wheel-current:IND:front-seven:groverstewart','Grover Stewart','Front Seven','IND',84.0,84.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:12835'),
  ('wheel-current:IND:front-seven:ardenkey','Arden Key','Front Seven','IND',74.0,74.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:13120'),
  ('wheel-current:IND:front-seven:jayloncarlies','Jaylon Carlies','Front Seven','IND',70.0,70.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:1089'),
  ('wheel-current:IND:front-seven:akeemdavisgaither','Akeem Davis-Gaither','Front Seven','IND',73.0,73.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21160'),
  ('wheel-current:IND:secondary:saucegardner','Sauce Gardner','Secondary','IND',90.0,92.0,'wheel-current-roster-2026-10-03','High-end current-ability calibration','ea:22260'),
  ('wheel-current:IND:secondary:charvariusward','Charvarius Ward','Secondary','IND',88.0,88.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:13507'),
  ('wheel-current:IND:secondary:cambynum','Cam Bynum','Secondary','IND',84.0,84.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3 alias match','ea-current-2026-10-03'),
  ('wheel-current:IND:secondary:ajhaulcy','AJ Haulcy','Secondary','IND',74.0,74.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:10191'),
  ('wheel-current:IND:secondary:justinwalley','Justin Walley','Secondary','IND',71.0,71.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15320'),
  ('wheel-current:JAX:qb:trevorlawrence','Trevor Lawrence','QB','JAX',86.0,86.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21553'),
  ('wheel-current:JAX:rb:bhayshultuten','Bhayshul Tuten','RB','JAX',79.0,79.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14812'),
  ('wheel-current:JAX:rb:chrisrodriguez','Chris Rodriguez Jr.','RB','JAX',72.0,72.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22737'),
  ('wheel-current:JAX:wr:brianthomas','Brian Thomas Jr.','WR','JAX',81.0,91.0,'wheel-current-roster-2026-10-03','High-end current-ability calibration','ea:14648'),
  ('wheel-current:JAX:wr:travishunter','Travis Hunter','WR','JAX',84.0,84.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3 two-way current ability','ea-current-2026-10-03'),
  ('wheel-current:JAX:wr:jakobimeyers','Jakobi Meyers','WR','JAX',82.0,82.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:20433'),
  ('wheel-current:JAX:wr:parkerwashington','Parker Washington','WR','JAX',81.0,81.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22766'),
  ('wheel-current:JAX:te:brentonstrange','Brenton Strange','TE','JAX',77.0,77.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22842'),
  ('wheel-current:JAX:front-seven:joshhinesallen','Josh Hines-Allen','Front Seven','JAX',89.0,89.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:20410'),
  ('wheel-current:JAX:front-seven:travonwalker','Travon Walker','Front Seven','JAX',80.0,80.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22305'),
  ('wheel-current:JAX:front-seven:foyesadeoluokun','Foyesade Oluokun','Front Seven','JAX',86.0,86.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:13468'),
  ('wheel-current:JAX:front-seven:arikarmstead','Arik Armstead','Front Seven','JAX',76.0,76.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:2533'),
  ('wheel-current:JAX:front-seven:davonhamilton','DaVon Hamilton','Front Seven','JAX',74.0,74.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21122'),
  ('wheel-current:JAX:front-seven:ventrellmiller','Ventrell Miller','Front Seven','JAX',71.0,71.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22202'),
  ('wheel-current:JAX:secondary:travishunter','Travis Hunter','Secondary','JAX',84.0,84.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15101'),
  ('wheel-current:JAX:secondary:jourdanlewis','Jourdan Lewis','Secondary','JAX',83.0,83.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:12555'),
  ('wheel-current:JAX:secondary:ericmurray','Eric Murray','Secondary','JAX',74.0,74.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:17713'),
  ('wheel-current:JAX:secondary:antoniojohnson','Antonio Johnson','Secondary','JAX',81.0,81.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22709'),
  ('wheel-current:JAX:secondary:montaricbrown','Montaric Brown','Secondary','JAX',74.0,74.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22256'),
  ('wheel-current:KC:qb:patrickmahomes','Patrick Mahomes','QB','KC',93.0,95.0,'wheel-current-roster-2026-10-03','Elite current-ability calibration','ea:12635'),
  ('wheel-current:KC:rb:kennethwalker','Kenneth Walker','RB','KC',90.0,90.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22338'),
  ('wheel-current:KC:rb:emmettjohnson','Emmett Johnson','RB','KC',68.0,68.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:16352'),
  ('wheel-current:KC:wr:rasheerice','Rashee Rice','WR','KC',85.0,85.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22765'),
  ('wheel-current:KC:wr:xavierworthy','Xavier Worthy','WR','KC',79.0,79.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14650'),
  ('wheel-current:KC:wr:tyquanthornton','Tyquan Thornton','WR','KC',75.0,75.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22371'),
  ('wheel-current:KC:te:traviskelce','Travis Kelce','TE','KC',93.0,90.0,'wheel-current-roster-2026-10-03','High-end current-ability calibration','ea:890'),
  ('wheel-current:KC:front-seven:chrisjones','Chris Jones','Front Seven','KC',94.0,96.0,'wheel-current-roster-2026-10-03','Elite current-ability calibration','ea:17676'),
  ('wheel-current:KC:front-seven:georgekarlaftis','George Karlaftis','Front Seven','KC',81.0,81.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22140'),
  ('wheel-current:KC:front-seven:nickbolton','Nick Bolton','Front Seven','KC',81.0,81.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21474'),
  ('wheel-current:KC:front-seven:druetranquill','Drue Tranquill','Front Seven','KC',89.0,89.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:20444'),
  ('wheel-current:KC:front-seven:peterwoods','Peter Woods','Front Seven','KC',76.0,76.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:16269'),
  ('wheel-current:KC:front-seven:felixanudikeuzomah','Felix Anudike-Uzomah','Front Seven','KC',73.0,73.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22916'),
  ('wheel-current:KC:secondary:ljariussneed','L''Jarius Sneed','Secondary','KC',80.0,80.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21351'),
  ('wheel-current:KC:secondary:mansoordelane','Mansoor Delane','Secondary','KC',80.0,80.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:1827'),
  ('wheel-current:KC:secondary:chamarriconner','Chamarri Conner','Secondary','KC',76.0,76.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:23060'),
  ('wheel-current:KC:secondary:nohlwilliams','Nohl Williams','Secondary','KC',76.0,76.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15293'),
  ('wheel-current:KC:secondary:alohigilman','Alohi Gilman','Secondary','KC',80.0,80.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21016'),
  ('wheel-current:LAC:qb:justinherbert','Justin Herbert','QB','LAC',85.0,94.0,'wheel-current-roster-2026-10-03','High-end current-ability calibration','ea:21034'),
  ('wheel-current:LAC:rb:omarionhampton','Omarion Hampton','RB','LAC',81.0,81.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15045'),
  ('wheel-current:LAC:rb:keatonmitchell','Keaton Mitchell','RB','LAC',75.0,75.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:23134'),
  ('wheel-current:LAC:wr:laddmcconkey','Ladd McConkey','WR','LAC',84.0,91.0,'wheel-current-roster-2026-10-03','High-end current-ability calibration','ea:14651'),
  ('wheel-current:LAC:wr:quentinjohnston','Quentin Johnston','WR','LAC',80.0,80.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22695'),
  ('wheel-current:LAC:wr:treharris','Tre'' Harris','WR','LAC',73.0,73.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15058'),
  ('wheel-current:LAC:te:charliekolar','Charlie Kolar','TE','LAC',68.0,68.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22096'),
  ('wheel-current:LAC:te:davidnjoku','David Njoku','TE','LAC',78.0,78.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:12532'),
  ('wheel-current:LAC:front-seven:khalilmack','Khalil Mack','Front Seven','LAC',86.0,86.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:12344'),
  ('wheel-current:LAC:front-seven:tulituipulotu','Tuli Tuipulotu','Front Seven','LAC',78.0,78.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22922'),
  ('wheel-current:LAC:front-seven:daiyanhenley','Daiyan Henley','Front Seven','LAC',82.0,82.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:23000'),
  ('wheel-current:LAC:front-seven:denzelperryman','Denzel Perryman','Front Seven','LAC',76.0,76.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:2560'),
  ('wheel-current:LAC:front-seven:dalvintomlinson','Dalvin Tomlinson','Front Seven','LAC',75.0,75.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:12595'),
  ('wheel-current:LAC:front-seven:teairtart','Teair Tart','Front Seven','LAC',77.0,77.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21435'),
  ('wheel-current:LAC:secondary:derwinjames','Derwin James Jr.','Secondary','LAC',93.0,94.0,'wheel-current-roster-2026-10-03','2025 AP second-team slot CB','ea:13080'),
  ('wheel-current:LAC:secondary:tarheebstill','Tarheeb Still','Secondary','LAC',81.0,81.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:1087'),
  ('wheel-current:LAC:secondary:elijahmolden','Elijah Molden','Secondary','LAC',79.0,79.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21660'),
  ('wheel-current:LAC:secondary:camhart','Cam Hart','Secondary','LAC',73.0,73.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14960'),
  ('wheel-current:LAC:secondary:tonyjefferson','Tony Jefferson','Secondary','LAC',81.0,81.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:9879'),
  ('wheel-current:LAR:qb:matthewstafford','Matthew Stafford','QB','LAR',99.0,97.0,'wheel-current-roster-2026-10-03','2025 AP first-team QB','ea:20051'),
  ('wheel-current:LAR:rb:kyrenwilliams','Kyren Williams','RB','LAR',89.0,90.0,'wheel-current-roster-2026-10-03','High-end current-ability calibration','ea:22051'),
  ('wheel-current:LAR:rb:blakecorum','Blake Corum','RB','LAR',78.0,78.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14623'),
  ('wheel-current:LAR:wr:pukanacua','Puka Nacua','WR','LAR',98.0,99.0,'wheel-current-roster-2026-10-03','2025 unanimous AP first-team WR','ea:22811'),
  ('wheel-current:LAR:wr:davanteadams','Davante Adams','WR','LAR',91.0,91.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:10823'),
  ('wheel-current:LAR:wr:konatamumpfield','Konata Mumpfield','WR','LAR',71.0,71.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15085'),
  ('wheel-current:LAR:te:colbyparkinson','Colby Parkinson','TE','LAR',73.0,73.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:20951'),
  ('wheel-current:LAR:front-seven:mylesgarrett','Myles Garrett','Front Seven','LAR',99.0,100.0,'wheel-current-roster-2026-10-03','2025 unanimous AP first-team edge','ea:12520'),
  ('wheel-current:LAR:front-seven:aarondonald','Aaron Donald','Front Seven','LAR',95.0,95.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea-current-2026-10-03'),
  ('wheel-current:LAR:front-seven:kobieturner','Kobie Turner','Front Seven','LAR',85.0,85.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22933'),
  ('wheel-current:LAR:front-seven:bradenfiske','Braden Fiske','Front Seven','LAR',79.0,79.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14855'),
  ('wheel-current:LAR:front-seven:byronyoung','Byron Young','Front Seven','LAR',84.0,84.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22938'),
  ('wheel-current:LAR:front-seven:natelandman','Nate Landman','Front Seven','LAR',86.0,86.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22409'),
  ('wheel-current:LAR:secondary:trentmcduffie','Trent McDuffie','Secondary','LAR',95.0,95.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22265'),
  ('wheel-current:LAR:secondary:quentinlake','Quentin Lake','Secondary','LAR',83.0,83.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22243'),
  ('wheel-current:LAR:secondary:kamcurl','Kam Curl','Secondary','LAR',83.0,83.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21012'),
  ('wheel-current:LAR:secondary:jaylenwatson','Jaylen Watson','Secondary','LAR',79.0,79.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22242'),
  ('wheel-current:LAR:secondary:kamrenkinchens','Kamren Kinchens','Secondary','LAR',81.0,81.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14935'),
  ('wheel-current:LV:qb:kirkcousins','Kirk Cousins','QB','LV',76.0,76.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:11215'),
  ('wheel-current:LV:qb:fernandomendoza','Fernando Mendoza','QB','LV',74.0,74.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:16261'),
  ('wheel-current:LV:rb:ashtonjeanty','Ashton Jeanty','RB','LV',85.0,85.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14793'),
  ('wheel-current:LV:rb:mikewashington','Mike Washington Jr.','RB','LV',70.0,70.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:1868'),
  ('wheel-current:LV:wr:tretucker','Tre Tucker','WR','LV',78.0,78.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22806'),
  ('wheel-current:LV:wr:jackbech','Jack Bech','WR','LV',72.0,72.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15055'),
  ('wheel-current:LV:wr:jalennailor','Jalen Nailor','WR','LV',77.0,77.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22363'),
  ('wheel-current:LV:te:brockbowers','Brock Bowers','TE','LV',94.0,96.0,'wheel-current-roster-2026-10-03','Elite current-ability calibration','ea:14678'),
  ('wheel-current:LV:front-seven:maxxcrosby','Maxx Crosby','Front Seven','LV',97.0,95.0,'wheel-current-roster-2026-10-03','Elite current-ability calibration','ea:20571'),
  ('wheel-current:LV:front-seven:kwitypaye','Kwity Paye','Front Seven','LV',77.0,77.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21884'),
  ('wheel-current:LV:front-seven:nakobedean','Nakobe Dean','Front Seven','LV',78.0,78.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22402'),
  ('wheel-current:LV:front-seven:quaywalker','Quay Walker','Front Seven','LV',80.0,80.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22187'),
  ('wheel-current:LV:front-seven:adambutler','Adam Butler','Front Seven','LV',73.0,73.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:12950'),
  ('wheel-current:LV:front-seven:tonkahemingway','Tonka Hemingway','Front Seven','LV',68.0,68.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15223'),
  ('wheel-current:LV:secondary:taronjohnson','Taron Johnson','Secondary','LV',83.0,83.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:13348'),
  ('wheel-current:LV:secondary:jeremychinn','Jeremy Chinn','Secondary','LV',82.0,82.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21151'),
  ('wheel-current:LV:secondary:ericstokes','Eric Stokes','Secondary','LV',77.0,77.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21705'),
  ('wheel-current:LV:secondary:hezekiahmasses','Hezekiah Masses','Secondary','LV',72.0,72.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:16281'),
  ('wheel-current:LV:secondary:treydanstukes','Treydan Stukes','Secondary','LV',76.0,76.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:1865'),
  ('wheel-current:MIA:qb:malikwillis','Malik Willis','QB','MIA',74.0,74.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22048'),
  ('wheel-current:MIA:rb:devonachane','De''Von Achane','RB','MIA',88.0,92.0,'wheel-current-roster-2026-10-03','High-end current-ability calibration','ea:22692'),
  ('wheel-current:MIA:rb:jaylenwright','Jaylen Wright','RB','MIA',73.0,73.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14632'),
  ('wheel-current:MIA:wr:malikwashington','Malik Washington','WR','MIA',73.0,73.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14665'),
  ('wheel-current:MIA:wr:calebdouglas','Caleb Douglas','WR','MIA',71.0,71.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:16285'),
  ('wheel-current:MIA:wr:chrisbell','Chris Bell','WR','MIA',71.0,71.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:16327'),
  ('wheel-current:MIA:te:gregdulcich','Greg Dulcich','TE','MIA',70.0,70.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22344'),
  ('wheel-current:MIA:front-seven:jordynbrooks','Jordyn Brooks','Front Seven','MIA',86.0,95.0,'wheel-current-roster-2026-10-03','2025 AP first-team LB','ea:21316'),
  ('wheel-current:MIA:front-seven:zachsieler','Zach Sieler','Front Seven','MIA',83.0,83.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:13481'),
  ('wheel-current:MIA:front-seven:choprobinson','Chop Robinson','Front Seven','MIA',75.0,75.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14753'),
  ('wheel-current:MIA:front-seven:joshuche','Josh Uche','Front Seven','MIA',75.0,75.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3 alias match','ea-current-2026-10-03'),
  ('wheel-current:MIA:front-seven:jacobrodriguez','Jacob Rodriguez','Front Seven','MIA',79.0,79.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:1806'),
  ('wheel-current:MIA:front-seven:williegay','Willie Gay Jr.','Front Seven','MIA',72.0,72.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21001'),
  ('wheel-current:MIA:secondary:chrisjohnson','Chris Johnson','Secondary','MIA',76.0,76.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:16394'),
  ('wheel-current:MIA:secondary:jujubrents','JuJu Brents','Secondary','MIA',72.0,72.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:23062'),
  ('wheel-current:MIA:secondary:dantetrader','Dante Trader Jr.','Secondary','MIA',67.0,67.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15344'),
  ('wheel-current:MIA:secondary:michaeltaaffe','Michael Taaffe','Secondary','MIA',71.0,71.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:16225'),
  ('wheel-current:MIA:secondary:jasonmarshall','Jason Marshall Jr.','Secondary','MIA',69.0,69.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15322'),
  ('wheel-current:MIN:qb:kylermurray','Kyler Murray','QB','MIN',75.0,75.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:20430'),
  ('wheel-current:MIN:rb:aaronjones','Aaron Jones Sr.','RB','MIN',80.0,80.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:12748'),
  ('wheel-current:MIN:rb:jordanmason','Jordan Mason','RB','MIN',81.0,81.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22332'),
  ('wheel-current:MIN:wr:justinjefferson','Justin Jefferson','WR','MIN',94.0,97.0,'wheel-current-roster-2026-10-03','Elite current-ability calibration','ea:20961'),
  ('wheel-current:MIN:wr:jordanaddison','Jordan Addison','WR','MIN',84.0,84.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22693'),
  ('wheel-current:MIN:wr:jauanjennings','Jauan Jennings','WR','MIN',81.0,81.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21073'),
  ('wheel-current:MIN:te:tjhockenson','T.J. Hockenson','TE','MIN',83.0,83.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:20518'),
  ('wheel-current:MIN:front-seven:dallasturner','Dallas Turner','Front Seven','MIN',82.0,82.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14894'),
  ('wheel-current:MIN:front-seven:andrewvanginkel','Andrew Van Ginkel','Front Seven','MIN',84.0,84.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:20699'),
  ('wheel-current:MIN:front-seven:blakecashman','Blake Cashman','Front Seven','MIN',84.0,84.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:20693'),
  ('wheel-current:MIN:front-seven:jalenredmond','Jalen Redmond','Front Seven','MIN',84.0,84.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22951'),
  ('wheel-current:MIN:front-seven:ericwilson','Eric Wilson','Front Seven','MIN',78.0,78.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:12885'),
  ('wheel-current:MIN:front-seven:tyrioningramdawkins','Tyrion Ingram-Dawkins','Front Seven','MIN',69.0,69.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15243'),
  ('wheel-current:MIN:secondary:byronmurphy','Byron Murphy Jr.','Secondary','MIN',84.0,84.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:20599'),
  ('wheel-current:MIN:secondary:joshuametellus','Joshua Metellus','Secondary','MIN',82.0,82.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3 alias match','ea-current-2026-10-03'),
  ('wheel-current:MIN:secondary:harrisonsmith','Harrison Smith','Secondary','MIN',87.0,87.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea-current-2026-10-03'),
  ('wheel-current:MIN:secondary:isaiahrodgers','Isaiah Rodgers','Secondary','MIN',84.0,84.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:24432'),
  ('wheel-current:MIN:secondary:jayward','Jay Ward','Secondary','MIN',71.0,71.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:23047'),
  ('wheel-current:NE:qb:drakemaye','Drake Maye','QB','NE',88.0,98.0,'wheel-current-roster-2026-10-03','2025 AP second team / NFL NGS first-team QB','ea:14501'),
  ('wheel-current:NE:rb:rhamondrestevenson','Rhamondre Stevenson','RB','NE',77.0,77.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21632'),
  ('wheel-current:NE:rb:treveyonhenderson','TreVeyon Henderson','RB','NE',82.0,82.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14810'),
  ('wheel-current:NE:wr:ajbrown','A.J. Brown','WR','NE',89.0,94.0,'wheel-current-roster-2026-10-03','High-end current-ability calibration','ea:20495'),
  ('wheel-current:NE:wr:romeodoubs','Romeo Doubs','WR','NE',79.0,79.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22076'),
  ('wheel-current:NE:wr:demariodouglas','DeMario Douglas','WR','NE',77.0,77.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22797'),
  ('wheel-current:NE:wr:mackhollins','Mack Hollins','WR','NE',77.0,77.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:12665'),
  ('wheel-current:NE:te:hunterhenry','Hunter Henry','TE','NE',86.0,86.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:17643'),
  ('wheel-current:NE:front-seven:christianbarmore','Christian Barmore','Front Seven','NE',80.0,80.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21765'),
  ('wheel-current:NE:front-seven:haroldlandry','Harold Landry III','Front Seven','NE',82.0,82.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:13172'),
  ('wheel-current:NE:front-seven:miltonwilliams','Milton Williams','Front Seven','NE',86.0,86.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21920'),
  ('wheel-current:NE:front-seven:dremontjones','Dre''Mont Jones','Front Seven','NE',77.0,77.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:20553'),
  ('wheel-current:NE:front-seven:robertspillane','Robert Spillane','Front Seven','NE',85.0,85.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:13875'),
  ('wheel-current:NE:secondary:christiangonzalez','Christian Gonzalez','Secondary','NE',98.0,98.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:23026'),
  ('wheel-current:NE:secondary:carltondavis','Carlton Davis III','Secondary','NE',85.0,85.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:13171'),
  ('wheel-current:NE:secondary:kevinbyard','Kevin Byard III','Secondary','NE',86.0,95.0,'wheel-current-roster-2026-10-03','2025 AP first-team safety','ea:17752'),
  ('wheel-current:NE:secondary:marcusjones','Marcus Jones','Secondary','NE',82.0,82.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22224'),
  ('wheel-current:NE:secondary:craigwoodson','Craig Woodson','Secondary','NE',83.0,83.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15346'),
  ('wheel-current:NO:qb:tylershough','Tyler Shough','QB','NO',80.0,80.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14788'),
  ('wheel-current:NO:rb:travisetienne','Travis Etienne Jr.','RB','NO',87.0,87.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21721'),
  ('wheel-current:NO:rb:alvinkamara','Alvin Kamara','RB','NO',78.0,78.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:12551'),
  ('wheel-current:NO:wr:chrisolave','Chris Olave','WR','NO',87.0,94.0,'wheel-current-roster-2026-10-03','2025 AP second-team WR','ea:22072'),
  ('wheel-current:NO:wr:devaughnvele','Devaughn Vele','WR','NO',74.0,74.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:1160'),
  ('wheel-current:NO:wr:brycelance','Bryce Lance','WR','NO',70.0,70.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:5003'),
  ('wheel-current:NO:te:juwanjohnson','Juwan Johnson','TE','NO',79.0,79.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21058'),
  ('wheel-current:NO:front-seven:chaseyoung','Chase Young','Front Seven','NO',81.0,81.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:20985'),
  ('wheel-current:NO:front-seven:cameronjordan','Cameron Jordan','Front Seven','NO',79.0,79.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:10697'),
  ('wheel-current:NO:front-seven:carlgranderson','Carl Granderson','Front Seven','NO',79.0,79.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:20417'),
  ('wheel-current:NO:front-seven:kadenelliss','Kaden Elliss','Front Seven','NO',83.0,83.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:20749'),
  ('wheel-current:NO:front-seven:bryanbresee','Bryan Bresee','Front Seven','NO',75.0,75.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22915'),
  ('wheel-current:NO:front-seven:petewerner','Pete Werner','Front Seven','NO',75.0,75.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21910'),
  ('wheel-current:NO:secondary:justinreid','Justin Reid','Secondary','NO',84.0,84.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:13167'),
  ('wheel-current:NO:secondary:koolaidmckinstry','Kool-Aid McKinstry','Secondary','NO',76.0,76.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14925'),
  ('wheel-current:NO:secondary:julianblackmon','Julian Blackmon','Secondary','NO',78.0,78.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21269'),
  ('wheel-current:NO:secondary:jonassanker','Jonas Sanker','Secondary','NO',77.0,77.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15337'),
  ('wheel-current:NO:secondary:quincyriley','Quincy Riley','Secondary','NO',73.0,73.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15313'),
  ('wheel-current:NYG:qb:jaxsondart','Jaxson Dart','QB','NYG',77.0,77.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14796'),
  ('wheel-current:NYG:qb:jameiswinston','Jameis Winston','QB','NYG',71.0,71.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:19982'),
  ('wheel-current:NYG:rb:camskattebo','Cam Skattebo','RB','NYG',81.0,81.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14807'),
  ('wheel-current:NYG:rb:najeeharris','Najee Harris','RB','NYG',77.0,77.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea-current-2026-10-03'),
  ('wheel-current:NYG:wr:maliknabers','Malik Nabers','WR','NYG',86.0,93.0,'wheel-current-roster-2026-10-03','High-end current-ability calibration','ea:14644'),
  ('wheel-current:NYG:wr:darnellmooney','Darnell Mooney','WR','NYG',76.0,76.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21324'),
  ('wheel-current:NYG:wr:malachifields','Malachi Fields','WR','NYG',73.0,73.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:1826'),
  ('wheel-current:NYG:te:isaiahlikely','Isaiah Likely','TE','NYG',75.0,75.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22092'),
  ('wheel-current:NYG:front-seven:brianburns','Brian Burns','Front Seven','NYG',89.0,94.0,'wheel-current-roster-2026-10-03','2025 AP second-team edge','ea:20566'),
  ('wheel-current:NYG:front-seven:abdulcarter','Abdul Carter','Front Seven','NYG',81.0,81.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15198'),
  ('wheel-current:NYG:front-seven:kayvonthibodeaux','Kayvon Thibodeaux','Front Seven','NYG',78.0,78.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22139'),
  ('wheel-current:NYG:front-seven:tremaineedmunds','Tremaine Edmunds','Front Seven','NYG',83.0,83.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:13119'),
  ('wheel-current:NYG:front-seven:arvellreese','Arvell Reese','Front Seven','NYG',79.0,79.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:16183'),
  ('wheel-current:NYG:front-seven:djreader','D.J. Reader','Front Seven','NYG',84.0,84.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:17746'),
  ('wheel-current:NYG:secondary:paulsonadebo','Paulson Adebo','Secondary','NYG',79.0,79.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21445'),
  ('wheel-current:NYG:secondary:deontebanks','Deonte Banks','Secondary','NYG',75.0,75.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:23052'),
  ('wheel-current:NYG:secondary:tylernubin','Tyler Nubin','Secondary','NYG',75.0,75.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14931'),
  ('wheel-current:NYG:secondary:jevonholland','Jevón Holland','Secondary','NYG',83.0,83.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21470'),
  ('wheel-current:NYG:secondary:gregnewsome','Greg Newsome II','Secondary','NYG',79.0,79.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21457'),
  ('wheel-current:NYG:secondary:druphillips','Dru Phillips','Secondary','NYG',78.0,78.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14968'),
  ('wheel-current:NYJ:qb:genosmith','Geno Smith','QB','NYJ',72.0,72.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:112'),
  ('wheel-current:NYJ:rb:breecehall','Breece Hall','RB','NYJ',87.0,89.0,'wheel-current-roster-2026-10-03','Current-ability calibration','ea:22326'),
  ('wheel-current:NYJ:rb:braelonallen','Braelon Allen','RB','NYJ',72.0,72.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14631'),
  ('wheel-current:NYJ:wr:garrettwilson','Garrett Wilson','WR','NYJ',87.0,92.0,'wheel-current-roster-2026-10-03','High-end current-ability calibration','ea:22376'),
  ('wheel-current:NYJ:wr:adonaimitchell','Adonai Mitchell','WR','NYJ',75.0,75.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14649'),
  ('wheel-current:NYJ:wr:isaiahwilliams','Isaiah Williams','WR','NYJ',67.0,67.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14669'),
  ('wheel-current:NYJ:te:masontaylor','Mason Taylor','TE','NYJ',74.0,74.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15118'),
  ('wheel-current:NYJ:front-seven:davidbailey','David Bailey','Front Seven','NYJ',81.0,81.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:1887'),
  ('wheel-current:NYJ:front-seven:willmcdonald','Will McDonald IV','Front Seven','NYJ',78.0,78.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22919'),
  ('wheel-current:NYJ:front-seven:jamiensherwood','Jamien Sherwood','Front Seven','NYJ',76.0,76.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21924'),
  ('wheel-current:NYJ:front-seven:demariodavis','Demario Davis','Front Seven','NYJ',90.0,90.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:11555'),
  ('wheel-current:NYJ:front-seven:tvondresweat','T''Vondre Sweat','Front Seven','NYJ',79.0,79.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14760'),
  ('wheel-current:NYJ:front-seven:harrisonphillips','Harrison Phillips','Front Seven','NYJ',77.0,77.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:13115'),
  ('wheel-current:NYJ:secondary:minkahfitzpatrick','Minkah Fitzpatrick','Secondary','NYJ',88.0,88.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:13084'),
  ('wheel-current:NYJ:secondary:azareyehthomas','Azareye''h Thomas','Secondary','NYJ',74.0,74.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15329'),
  ('wheel-current:NYJ:secondary:brandonstephens','Brandon Stephens','Secondary','NYJ',77.0,77.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21790'),
  ('wheel-current:NYJ:secondary:danebelton','Dane Belton','Secondary','NYJ',76.0,76.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22396'),
  ('wheel-current:NYJ:secondary:jarvisbrownlee','Jarvis Brownlee Jr.','Secondary','NYJ',75.0,75.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14984'),
  ('wheel-current:PHI:qb:jalenhurts','Jalen Hurts','QB','PHI',81.0,92.0,'wheel-current-roster-2026-10-03','High-end current-ability calibration','ea:21033'),
  ('wheel-current:PHI:rb:saquonbarkley','Saquon Barkley','RB','PHI',92.0,94.0,'wheel-current-roster-2026-10-03','Elite current-ability calibration','ea:13085'),
  ('wheel-current:PHI:rb:tankbigsby','Tank Bigsby','RB','PHI',77.0,77.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22733'),
  ('wheel-current:PHI:wr:devontasmith','DeVonta Smith','WR','PHI',92.0,92.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21761'),
  ('wheel-current:PHI:wr:dontayvionwicks','Dontayvion Wicks','WR','PHI',76.0,76.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22772'),
  ('wheel-current:PHI:wr:makailemon','Makai Lemon','WR','PHI',76.0,76.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:1883'),
  ('wheel-current:PHI:te:dallasgoedert','Dallas Goedert','TE','PHI',89.0,89.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:13128'),
  ('wheel-current:PHI:front-seven:jalencarter','Jalen Carter','Front Seven','PHI',89.0,89.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22703'),
  ('wheel-current:PHI:front-seven:zackbaun','Zack Baun','Front Seven','PHI',92.0,92.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21142'),
  ('wheel-current:PHI:front-seven:jonathangreenard','Jonathan Greenard','Front Seven','PHI',85.0,85.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21131'),
  ('wheel-current:PHI:front-seven:jalyxhunt','Jalyx Hunt','Front Seven','PHI',74.0,74.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:1076'),
  ('wheel-current:PHI:front-seven:jihaadcampbell','Jihaad Campbell','Front Seven','PHI',79.0,79.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15268'),
  ('wheel-current:PHI:front-seven:jordandavis','Jordan Davis','Front Seven','PHI',82.0,82.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22164'),
  ('wheel-current:PHI:secondary:quinyonmitchell','Quinyon Mitchell','Secondary','PHI',89.0,97.0,'wheel-current-roster-2026-10-03','2025 AP first-team CB','ea:14932'),
  ('wheel-current:PHI:secondary:cooperdejean','Cooper DeJean','Secondary','PHI',89.0,96.0,'wheel-current-roster-2026-10-03','2025 AP first-team slot CB','ea:14923'),
  ('wheel-current:PHI:secondary:riqwoolen','Riq Woolen','Secondary','PHI',82.0,82.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22247'),
  ('wheel-current:PHI:secondary:andrewmukuba','Andrew Mukuba','Secondary','PHI',74.0,74.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15335'),
  ('wheel-current:PHI:secondary:marcusepps','Marcus Epps','Secondary','PHI',75.0,75.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:20737'),
  ('wheel-current:PIT:qb:aaronrodgers','Aaron Rodgers','QB','PIT',79.0,79.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:26668'),
  ('wheel-current:PIT:rb:jaylenwarren','Jaylen Warren','RB','PIT',84.0,84.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22471'),
  ('wheel-current:PIT:rb:ricodowdle','Rico Dowdle','RB','PIT',84.0,84.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21039'),
  ('wheel-current:PIT:wr:dkmetcalf','DK Metcalf','WR','PIT',85.0,85.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:20353'),
  ('wheel-current:PIT:wr:michaelpittman','Michael Pittman Jr.','WR','PIT',83.0,83.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21081'),
  ('wheel-current:PIT:wr:romanwilson','Roman Wilson','WR','PIT',71.0,71.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14661'),
  ('wheel-current:PIT:te:patfreiermuth','Pat Freiermuth','TE','PIT',79.0,79.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21561'),
  ('wheel-current:PIT:front-seven:tjwatt','T.J. Watt','Front Seven','PIT',93.0,96.0,'wheel-current-roster-2026-10-03','Elite current-ability calibration','ea:12562'),
  ('wheel-current:PIT:front-seven:cameronheyward','Cameron Heyward','Front Seven','PIT',95.0,92.0,'wheel-current-roster-2026-10-03','2025 AP second-team interior DL','ea-current-2026-10-03'),
  ('wheel-current:PIT:front-seven:alexhighsmith','Alex Highsmith','Front Seven','PIT',87.0,87.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21234'),
  ('wheel-current:PIT:front-seven:patrickqueen','Patrick Queen','Front Seven','PIT',80.0,80.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:20999'),
  ('wheel-current:PIT:front-seven:paytonwilson','Payton Wilson','Front Seven','PIT',75.0,75.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14904'),
  ('wheel-current:PIT:front-seven:derrickharmon','Derrick Harmon','Front Seven','PIT',78.0,78.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15239'),
  ('wheel-current:PIT:secondary:jalenramsey','Jalen Ramsey','Secondary','PIT',90.0,90.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:17538'),
  ('wheel-current:PIT:secondary:jameldean','Jamel Dean','Secondary','PIT',86.0,86.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:20703'),
  ('wheel-current:PIT:secondary:asantesamuel','Asante Samuel Jr.','Secondary','PIT',75.0,75.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21459'),
  ('wheel-current:PIT:secondary:deshonelliott','DeShon Elliott','Secondary','PIT',80.0,80.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:13154'),
  ('wheel-current:PIT:secondary:jaquanbrisker','Jaquan Brisker','Secondary','PIT',81.0,81.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22228'),
  ('wheel-current:SEA:qb:samdarnold','Sam Darnold','QB','SEA',87.0,87.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:13097'),
  ('wheel-current:SEA:rb:jadarianprice','Jadarian Price','RB','SEA',75.0,75.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:16368'),
  ('wheel-current:SEA:rb:zachcharbonnet','Zach Charbonnet','RB','SEA',83.0,83.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22732'),
  ('wheel-current:SEA:wr:jaxonsmithnjigba','Jaxon Smith-Njigba','WR','SEA',99.0,99.0,'wheel-current-roster-2026-10-03','2025 unanimous AP first-team WR','ea:22694'),
  ('wheel-current:SEA:wr:cooperkupp','Cooper Kupp','WR','SEA',83.0,83.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:12558'),
  ('wheel-current:SEA:wr:rashidshaheed','Rashid Shaheed','WR','SEA',79.0,79.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22666'),
  ('wheel-current:SEA:te:ajbarner','AJ Barner','TE','SEA',75.0,75.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14687'),
  ('wheel-current:SEA:front-seven:leonardwilliams','Leonard Williams','Front Seven','SEA',89.0,93.0,'wheel-current-roster-2026-10-03','2025 AP second-team interior DL','ea:2527'),
  ('wheel-current:SEA:front-seven:ernestjones','Ernest Jones IV','Front Seven','SEA',84.0,91.0,'wheel-current-roster-2026-10-03','2025 AP second-team LB','ea:21921'),
  ('wheel-current:SEA:front-seven:byronmurphy','Byron Murphy II','Front Seven','SEA',85.0,85.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14758'),
  ('wheel-current:SEA:front-seven:demarcuslawrence','Demarcus Lawrence','Front Seven','SEA',87.0,87.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:11079'),
  ('wheel-current:SEA:front-seven:derickhall','Derick Hall','Front Seven','SEA',77.0,77.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22974'),
  ('wheel-current:SEA:front-seven:drakethomas','Drake Thomas','Front Seven','SEA',75.0,75.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:23011'),
  ('wheel-current:SEA:secondary:devonwitherspoon','Devon Witherspoon','Secondary','SEA',91.0,94.0,'wheel-current-roster-2026-10-03','2025 AP second-team CB','ea:23023'),
  ('wheel-current:SEA:secondary:julianlove','Julian Love','Secondary','SEA',85.0,85.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:20602'),
  ('wheel-current:SEA:secondary:terrionarnold','Terrion Arnold','Secondary','SEA',76.0,76.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea-current-2026-10-03'),
  ('wheel-current:SEA:secondary:nickemmanwori','Nick Emmanwori','Secondary','SEA',86.0,86.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15359'),
  ('wheel-current:SEA:secondary:joshjobe','Josh Jobe','Secondary','SEA',77.0,77.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22212'),
  ('wheel-current:SEA:secondary:tyokada','Ty Okada','Secondary','SEA',75.0,75.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:23381'),
  ('wheel-current:SF:qb:brockpurdy','Brock Purdy','QB','SF',90.0,90.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22383'),
  ('wheel-current:SF:rb:christianmccaffrey','Christian McCaffrey','RB','SF',97.0,97.0,'wheel-current-roster-2026-10-03','2025 AP first-team all-purpose','ea:12556'),
  ('wheel-current:SF:rb:isaacguerendo','Isaac Guerendo','RB','SF',72.0,72.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15012'),
  ('wheel-current:SF:wr:mikeevans','Mike Evans','WR','SF',91.0,89.0,'wheel-current-roster-2026-10-03','Current-ability calibration','ea:10857'),
  ('wheel-current:SF:wr:deebosamuel','Deebo Samuel Sr.','WR','SF',77.0,77.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea-current-2026-10-03'),
  ('wheel-current:SF:wr:rickypearsall','Ricky Pearsall','WR','SF',80.0,80.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14657'),
  ('wheel-current:SF:wr:jacobcowing','Jacob Cowing','WR','SF',71.0,71.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14663'),
  ('wheel-current:SF:te:georgekittle','George Kittle','TE','SF',96.0,94.0,'wheel-current-roster-2026-10-03','Elite current-ability calibration','ea:12836'),
  ('wheel-current:SF:front-seven:nickbosa','Nick Bosa','Front Seven','SF',94.0,94.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:20565'),
  ('wheel-current:SF:front-seven:fredwarner','Fred Warner','Front Seven','SF',97.0,97.0,'wheel-current-roster-2026-10-03','Elite current-ability calibration','ea:13203'),
  ('wheel-current:SF:front-seven:dregreenlaw','Dre Greenlaw','Front Seven','SF',87.0,87.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:20475'),
  ('wheel-current:SF:front-seven:osaodighizuwa','Osa Odighizuwa','Front Seven','SF',77.0,77.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21508'),
  ('wheel-current:SF:front-seven:keionwhite','Keion White','Front Seven','SF',73.0,73.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22937'),
  ('wheel-current:SF:front-seven:mykelwilliams','Mykel Williams','Front Seven','SF',77.0,77.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15199'),
  ('wheel-current:SF:secondary:deommodorelenoir','Deommodore Lenoir','Secondary','SF',83.0,83.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21454'),
  ('wheel-current:SF:secondary:renardogreen','Renardo Green','Secondary','SF',77.0,77.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14985'),
  ('wheel-current:SF:secondary:malikmustapha','Malik Mustapha','Secondary','SF',74.0,74.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14962'),
  ('wheel-current:SF:secondary:jiayirbrown','Ji''Ayir Brown','Secondary','SF',74.0,74.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:23058'),
  ('wheel-current:SF:secondary:marquessigle','Marques Sigle','Secondary','SF',75.0,75.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15350'),
  ('wheel-current:SF:secondary:uptonstout','Upton Stout','Secondary','SF',75.0,75.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15327'),
  ('wheel-current:TB:qb:bakermayfield','Baker Mayfield','QB','TB',82.0,91.0,'wheel-current-roster-2026-10-03','High-end current-ability calibration','ea:13117'),
  ('wheel-current:TB:rb:buckyirving','Bucky Irving','RB','TB',86.0,86.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14624'),
  ('wheel-current:TB:rb:kennygainwell','Kenny Gainwell','RB','TB',79.0,79.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21571'),
  ('wheel-current:TB:wr:emekaegbuka','Emeka Egbuka','WR','TB',81.0,81.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15054'),
  ('wheel-current:TB:wr:chrisgodwin','Chris Godwin Jr.','WR','TB',82.0,82.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:12614'),
  ('wheel-current:TB:wr:jalenmcmillan','Jalen McMillan','WR','TB',74.0,74.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14660'),
  ('wheel-current:TB:wr:tedhurst','Ted Hurst III','WR','TB',72.0,72.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:1894'),
  ('wheel-current:TB:te:cadeotton','Cade Otton','TE','TB',75.0,75.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22091'),
  ('wheel-current:TB:front-seven:vitavea','Vita Vea','Front Seven','TB',94.0,94.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:13091'),
  ('wheel-current:TB:front-seven:calijahkancey','Calijah Kancey','Front Seven','TB',76.0,76.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22924'),
  ('wheel-current:TB:front-seven:yayadiaby','Yaya Diaby','Front Seven','TB',79.0,79.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22952'),
  ('wheel-current:TB:front-seven:ruebenbain','Rueben Bain Jr.','Front Seven','TB',80.0,80.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:16334'),
  ('wheel-current:TB:front-seven:alexanzalone','Alex Anzalone','Front Seven','TB',81.0,81.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:12613'),
  ('wheel-current:TB:front-seven:josiahtrotter','Josiah Trotter','Front Seven','TB',75.0,75.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:1839'),
  ('wheel-current:TB:secondary:antoinewinfield','Antoine Winfield Jr.','Secondary','TB',93.0,93.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21017'),
  ('wheel-current:TB:secondary:zyonmccollum','Zyon McCollum','Secondary','TB',81.0,81.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22285'),
  ('wheel-current:TB:secondary:tykeesmith','Tykee Smith','Secondary','TB',79.0,79.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14949'),
  ('wheel-current:TB:secondary:jacobparrish','Jacob Parrish','Secondary','TB',79.0,79.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15284'),
  ('wheel-current:TB:secondary:keiontescott','Keionte Scott','Secondary','TB',73.0,73.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:16242'),
  ('wheel-current:TEN:qb:camward','Cam Ward','QB','TEN',75.0,75.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14778'),
  ('wheel-current:TEN:rb:tonypollard','Tony Pollard','RB','TEN',83.0,83.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:20473'),
  ('wheel-current:TEN:rb:tyjaespears','Tyjae Spears','RB','TEN',77.0,77.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22749'),
  ('wheel-current:TEN:wr:calvinridley','Calvin Ridley','WR','TEN',78.0,78.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:13113'),
  ('wheel-current:TEN:wr:carnelltate','Carnell Tate','WR','TEN',77.0,77.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:16186'),
  ('wheel-current:TEN:wr:wandalerobinson','Wan''Dale Robinson','WR','TEN',83.0,83.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22368'),
  ('wheel-current:TEN:te:gunnarhelm','Gunnar Helm','TE','TEN',71.0,71.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15116'),
  ('wheel-current:TEN:front-seven:jefferysimmons','Jeffery Simmons','Front Seven','TEN',96.0,97.0,'wheel-current-roster-2026-10-03','2025 AP first-team interior DL','ea:20549'),
  ('wheel-current:TEN:front-seven:jermainejohnson','Jermaine Johnson II','Front Seven','TEN',77.0,77.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22141'),
  ('wheel-current:TEN:front-seven:johnfranklinmyers','John Franklin-Myers','Front Seven','TEN',78.0,78.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:13356'),
  ('wheel-current:TEN:front-seven:keldricfaulk','Keldric Faulk','Front Seven','TEN',78.0,78.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:16238'),
  ('wheel-current:TEN:front-seven:anthonyhill','Anthony Hill Jr.','Front Seven','TEN',72.0,72.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:16224'),
  ('wheel-current:TEN:front-seven:cedricgray','Cedric Gray','Front Seven','TEN',78.0,78.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14909'),
  ('wheel-current:TEN:secondary:amanihooker','Amani Hooker','Secondary','TEN',79.0,79.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:20629'),
  ('wheel-current:TEN:secondary:alontaetaylor','Alontae Taylor','Secondary','TEN',79.0,79.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22209'),
  ('wheel-current:TEN:secondary:kevinwinston','Kevin Winston Jr.','Secondary','TEN',73.0,73.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15361'),
  ('wheel-current:TEN:secondary:cordaleflott','Cor''Dale Flott','Secondary','TEN',81.0,81.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22259'),
  ('wheel-current:TEN:secondary:marcusharris','Marcus Harris','Secondary','TEN',71.0,71.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15311'),
  ('wheel-current:WSH:qb:jaydendaniels','Jayden Daniels','QB','WSH',79.0,93.0,'wheel-current-roster-2026-10-03','High-end current-ability calibration','ea:14579'),
  ('wheel-current:WSH:rb:jacorycroskeymerritt','Jacory Croskey-Merritt','RB','WSH',79.0,79.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:16152'),
  ('wheel-current:WSH:rb:rachaadwhite','Rachaad White','RB','WSH',78.0,78.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22056'),
  ('wheel-current:WSH:wr:terrymclaurin','Terry McLaurin','WR','WSH',91.0,91.0,'wheel-current-roster-2026-10-03','High-end current-ability calibration','ea:20435'),
  ('wheel-current:WSH:wr:stefondiggs','Stefon Diggs','WR','WSH',86.0,86.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea-current-2026-10-03'),
  ('wheel-current:WSH:wr:dyamibrown','Dyami Brown','WR','WSH',74.0,74.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21585'),
  ('wheel-current:WSH:te:chigokonkwo','Chig Okonkwo','TE','WSH',74.0,74.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3 alias match','ea-current-2026-10-03'),
  ('wheel-current:WSH:front-seven:daronpayne','Daron Payne','Front Seven','WSH',84.0,84.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:13104'),
  ('wheel-current:WSH:front-seven:frankieluvu','Frankie Luvu','Front Seven','WSH',79.0,79.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:13628'),
  ('wheel-current:WSH:front-seven:odafeoweh','Odafe Oweh','Front Seven','WSH',80.0,80.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21511'),
  ('wheel-current:WSH:front-seven:sonnystyles','Sonny Styles','Front Seven','WSH',79.0,79.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:16185'),
  ('wheel-current:WSH:front-seven:javonkinlaw','Javon Kinlaw','Front Seven','WSH',73.0,73.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21133'),
  ('wheel-current:WSH:front-seven:klavonchaisson','K''Lavon Chaisson','Front Seven','WSH',75.0,75.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:20991'),
  ('wheel-current:WSH:secondary:mikesainristil','Mike Sainristil','Secondary','WSH',77.0,77.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:14947'),
  ('wheel-current:WSH:secondary:treyamos','Trey Amos','Secondary','WSH',77.0,77.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:15287'),
  ('wheel-current:WSH:secondary:amikrobertson','Amik Robertson','Secondary','WSH',77.0,77.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:21003'),
  ('wheel-current:WSH:secondary:rasuldouglas','Rasul Douglas','Secondary','WSH',77.0,77.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea-current-2026-10-03'),
  ('wheel-current:WSH:secondary:quanmartin','Quan Martin','Secondary','WSH',77.0,77.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:23053'),
  ('wheel-current:WSH:secondary:nickcross','Nick Cross','Secondary','WSH',81.0,81.0,'wheel-current-roster-2026-10-03','EA Madden NFL 27 Week 3','ea:22398'),
  ('coach:ARI','Mike LaFleur','Head Coach','ARI',null,79.0,'wheel-coach-audit-2026-10-03','Octagon HQ current-head-coach audit',null),
  ('coach:ATL','Kevin Stefanski','Head Coach','ATL',null,84.0,'wheel-coach-audit-2026-10-03','Octagon HQ current-head-coach audit',null),
  ('coach:BAL','Jesse Minter','Head Coach','BAL',null,85.0,'wheel-coach-audit-2026-10-03','Octagon HQ current-head-coach audit',null),
  ('coach:BUF','Joe Brady','Head Coach','BUF',null,88.0,'wheel-coach-audit-2026-10-03','Octagon HQ current-head-coach audit',null),
  ('coach:CAR','Dave Canales','Head Coach','CAR',null,80.0,'wheel-coach-audit-2026-10-03','Octagon HQ current-head-coach audit',null),
  ('coach:CHI','Ben Johnson','Head Coach','CHI',null,90.0,'wheel-coach-audit-2026-10-03','Octagon HQ current-head-coach audit',null),
  ('coach:CIN','Zac Taylor','Head Coach','CIN',null,88.0,'wheel-coach-audit-2026-10-03','Octagon HQ current-head-coach audit',null),
  ('coach:CLE','Todd Monken','Head Coach','CLE',null,86.0,'wheel-coach-audit-2026-10-03','Octagon HQ current-head-coach audit',null),
  ('coach:DAL','Brian Schottenheimer','Head Coach','DAL',null,80.0,'wheel-coach-audit-2026-10-03','Octagon HQ current-head-coach audit',null),
  ('coach:DEN','Sean Payton','Head Coach','DEN',null,96.0,'wheel-coach-audit-2026-10-03','Octagon HQ current-head-coach audit',null),
  ('coach:DET','Dan Campbell','Head Coach','DET',null,94.0,'wheel-coach-audit-2026-10-03','Octagon HQ current-head-coach audit',null),
  ('coach:GB','Matt LaFleur','Head Coach','GB',null,94.0,'wheel-coach-audit-2026-10-03','Octagon HQ current-head-coach audit',null),
  ('coach:HOU','DeMeco Ryans','Head Coach','HOU',null,91.0,'wheel-coach-audit-2026-10-03','Octagon HQ current-head-coach audit',null),
  ('coach:IND','Shane Steichen','Head Coach','IND',null,85.0,'wheel-coach-audit-2026-10-03','Octagon HQ current-head-coach audit',null),
  ('coach:JAX','Liam Coen','Head Coach','JAX',null,91.0,'wheel-coach-audit-2026-10-03','Octagon HQ current-head-coach audit',null),
  ('coach:KC','Andy Reid','Head Coach','KC',null,100.0,'wheel-coach-audit-2026-10-03','Octagon HQ current-head-coach audit',null),
  ('coach:LAC','Jim Harbaugh','Head Coach','LAC',null,94.0,'wheel-coach-audit-2026-10-03','Octagon HQ current-head-coach audit',null),
  ('coach:LAR','Sean McVay','Head Coach','LAR',null,99.0,'wheel-coach-audit-2026-10-03','Octagon HQ current-head-coach audit',null),
  ('coach:LV','Klint Kubiak','Head Coach','LV',null,86.0,'wheel-coach-audit-2026-10-03','Octagon HQ current-head-coach audit',null),
  ('coach:MIA','Jeff Hafley','Head Coach','MIA',null,77.0,'wheel-coach-audit-2026-10-03','Octagon HQ current-head-coach audit',null),
  ('coach:MIN','Kevin O''Connell','Head Coach','MIN',null,94.0,'wheel-coach-audit-2026-10-03','Octagon HQ current-head-coach audit',null),
  ('coach:NE','Mike Vrabel','Head Coach','NE',null,92.0,'wheel-coach-audit-2026-10-03','Octagon HQ current-head-coach audit',null),
  ('coach:NO','Kellen Moore','Head Coach','NO',null,79.0,'wheel-coach-audit-2026-10-03','Octagon HQ current-head-coach audit',null),
  ('coach:NYG','John Harbaugh','Head Coach','NYG',null,96.0,'wheel-coach-audit-2026-10-03','Octagon HQ current-head-coach audit',null),
  ('coach:NYJ','Aaron Glenn','Head Coach','NYJ',null,76.0,'wheel-coach-audit-2026-10-03','Octagon HQ current-head-coach audit',null),
  ('coach:PHI','Nick Sirianni','Head Coach','PHI',null,96.0,'wheel-coach-audit-2026-10-03','Octagon HQ current-head-coach audit',null),
  ('coach:PIT','Mike McCarthy','Head Coach','PIT',null,92.0,'wheel-coach-audit-2026-10-03','Octagon HQ current-head-coach audit',null),
  ('coach:SEA','Mike Macdonald','Head Coach','SEA',null,93.0,'wheel-coach-audit-2026-10-03','Octagon HQ current-head-coach audit',null),
  ('coach:SF','Kyle Shanahan','Head Coach','SF',null,97.0,'wheel-coach-audit-2026-10-03','Octagon HQ current-head-coach audit',null),
  ('coach:TB','Todd Bowles','Head Coach','TB',null,86.0,'wheel-coach-audit-2026-10-03','Octagon HQ current-head-coach audit',null),
  ('coach:TEN','Robert Saleh','Head Coach','TEN',null,79.0,'wheel-coach-audit-2026-10-03','Octagon HQ current-head-coach audit',null),
  ('coach:WSH','Dan Quinn','Head Coach','WSH',null,89.0,'wheel-coach-audit-2026-10-03','Octagon HQ current-head-coach audit',null)
) as seed(
  authority_key,
  display_name,
  position_family,
  team_code,
  source_rating,
  hidden_grade,
  grade_version,
  source_note,
  source_reference
)
on conflict (authority_key) do update
set display_name = excluded.display_name,
    name_key = excluded.name_key,
    position_family = excluded.position_family,
    team_code = excluded.team_code,
    source_rating = excluded.source_rating,
    hidden_grade = excluded.hidden_grade,
    grade_version = excluded.grade_version,
    source_note = excluded.source_note,
    source_reference = excluded.source_reference;

create index if not exists wheel_football_grade_lookup_idx
  on private.wheel_football_grade_authority (name_key, position_family, team_code);

create or replace function private.wheel_football_position_family(p_position_abbreviation text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case upper(trim(coalesce(p_position_abbreviation,'')))
    when 'QB' then 'QB'
    when 'RB' then 'RB'
    when 'HB' then 'RB'
    when 'WR' then 'WR'
    when 'TE' then 'TE'
    when 'DE' then 'Front Seven'
    when 'DT' then 'Front Seven'
    when 'NT' then 'Front Seven'
    when 'DL' then 'Front Seven'
    when 'LB' then 'Front Seven'
    when 'ILB' then 'Front Seven'
    when 'OLB' then 'Front Seven'
    when 'EDGE' then 'Front Seven'
    when 'LEDG' then 'Front Seven'
    when 'REDG' then 'Front Seven'
    when 'MIKE' then 'Front Seven'
    when 'SAM' then 'Front Seven'
    when 'WILL' then 'Front Seven'
    when 'CB' then 'Secondary'
    when 'S' then 'Secondary'
    when 'FS' then 'Secondary'
    when 'SS' then 'Secondary'
    when 'DB' then 'Secondary'
    when 'HC' then 'Head Coach'
    else null
  end;
$$;

revoke all on function private.wheel_football_position_family(text) from public, anon, authenticated;

create or replace function private.wheel_football_resolve_grade(
  p_team_code text,
  p_display_name text,
  p_position_abbreviation text
)
returns table(hidden_grade numeric, grade_version text)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_family text := private.wheel_football_position_family(p_position_abbreviation);
  v_name_key text := private.wheel_football_name_key(p_display_name);
  v_count integer;
begin
  if v_family is null then
    return;
  end if;

  if v_family = 'Head Coach' then
    return query
    select authority.hidden_grade, authority.grade_version
    from private.wheel_football_grade_authority authority
    where authority.position_family = 'Head Coach'
      and authority.team_code = upper(trim(p_team_code))
    order by authority.hidden_grade desc
    limit 1;
    return;
  end if;

  select count(*)
    into v_count
  from private.wheel_football_grade_authority authority
  where authority.name_key = v_name_key
    and authority.position_family = v_family;

  if v_count = 1 then
    return query
    select authority.hidden_grade, authority.grade_version
    from private.wheel_football_grade_authority authority
    where authority.name_key = v_name_key
      and authority.position_family = v_family
    limit 1;
    return;
  end if;

  if v_count > 1 then
    return query
    select authority.hidden_grade, authority.grade_version
    from private.wheel_football_grade_authority authority
    where authority.name_key = v_name_key
      and authority.position_family = v_family
      and authority.team_code = upper(trim(p_team_code))
    order by authority.hidden_grade desc
    limit 1;
    if found then
      return;
    end if;
  end if;

  -- Rare current-roster additions, or a same-name player who moved after the
  -- rating snapshot, remain
  -- playable. The conservative fallback is intentionally server-owned and
  -- conspicuous in grade_version so it can be audited/replaced.
  hidden_grade := 70.0;
  grade_version := 'fallback-unmatched-current-roster';
  return next;
end;
$$;

revoke all on function private.wheel_football_resolve_grade(text,text,text)
  from public, anon, authenticated;

alter table private.wheel_football_picks
  add column if not exists hidden_grade numeric(4,1),
  add column if not exists grade_version text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'wheel_football_pick_hidden_grade_valid'
  ) then
    alter table private.wheel_football_picks
      add constraint wheel_football_pick_hidden_grade_valid check (
        hidden_grade is null
        or (
          hidden_grade between 0.0 and 100.0
          and hidden_grade * 2 = trunc(hidden_grade * 2)
        )
      );
  end if;
end;
$$;

create or replace function private.grade_wheel_football_pick()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_grade numeric;
  v_version text;
begin
  select grade.hidden_grade, grade.grade_version
    into v_grade, v_version
  from private.wheel_football_resolve_grade(
    new.team_code,
    new.display_name,
    new.position_abbreviation
  ) grade
  limit 1;

  if v_grade is null or v_version is null then
    raise exception 'Wheel of Football grade could not be resolved';
  end if;

  new.hidden_grade := v_grade;
  new.grade_version := v_version;
  return new;
end;
$$;

revoke all on function private.grade_wheel_football_pick()
  from public, anon, authenticated;

drop trigger if exists wheel_football_pick_hidden_grade on private.wheel_football_picks;
create trigger wheel_football_pick_hidden_grade
before insert or update of team_code, display_name, position_abbreviation
on private.wheel_football_picks
for each row execute function private.grade_wheel_football_pick();

update private.wheel_football_picks pick
set hidden_grade = coalesce(
      (
        select grade.hidden_grade
        from private.wheel_football_resolve_grade(
          pick.team_code,
          pick.display_name,
          pick.position_abbreviation
        ) grade
        limit 1
      ),
      70.0
    ),
    grade_version = coalesce(
      (
        select grade.grade_version
        from private.wheel_football_resolve_grade(
          pick.team_code,
          pick.display_name,
          pick.position_abbreviation
        ) grade
        limit 1
      ),
      'fallback-unmatched-current-roster'
    )
where pick.hidden_grade is null
   or pick.grade_version is null;

create or replace function private.wheel_football_raw_grade(
  p_challenge_id uuid,
  p_profile_id uuid
)
returns numeric
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when count(*) = 7 and count(pick.hidden_grade) = 7
      then round(avg(pick.hidden_grade), 1)
    else null
  end
  from private.wheel_football_picks pick
  where pick.challenge_id = p_challenge_id
    and pick.profile_id = p_profile_id;
$$;

revoke all on function private.wheel_football_raw_grade(uuid,uuid)
  from public, anon, authenticated;

create or replace function private.wheel_football_display_score(p_raw_grade numeric)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case
    when p_raw_grade is null then null
    else greatest(0, least(100, round((p_raw_grade * 2) - 100)::integer))
  end;
$$;

revoke all on function private.wheel_football_display_score(numeric)
  from public, anon, authenticated;

create or replace function private.wheel_football_state_json(p_challenge_id uuid)
returns jsonb
language sql
security definer
set search_path = ''
stable
as $$
  select jsonb_strip_nulls(jsonb_build_object(
    'code', challenge.code,
    'pool_scope', match.pool_scope,
    'division', match.division,
    'phase', match.phase,
    'turn_count', match.turn_count,
    'current_turn_profile_id', match.current_turn_profile_id,
    'pending_team', case when pending.code is null then null else jsonb_build_object(
      'code', pending.code,
      'name', pending.name,
      'conference', pending.conference,
      'division', pending.division
    ) end,
    'creator', jsonb_build_object(
      'id', challenge.creator_id,
      'display_name', creator.display_name
    ),
    'recipient', jsonb_build_object(
      'id', challenge.recipient_id,
      'display_name', recipient.display_name
    ),
    'creator_roster', coalesce((
      select jsonb_agg(
        jsonb_strip_nulls(jsonb_build_object(
          'turn_number', pick.turn_number,
          'team_code', pick.team_code,
          'team_name', team.name,
          'roster_slot', pick.roster_slot,
          'athlete_id', pick.athlete_id,
          'display_name', pick.display_name,
          'position_label', pick.position_label,
          'position_abbreviation', pick.position_abbreviation,
          'headshot_url', pick.headshot_url,
          'hidden_grade', case when match.phase = 'complete' and match.forfeited_at is null then pick.hidden_grade else null end
        ))
        order by pick.turn_number
      )
      from private.wheel_football_picks pick
      join private.wheel_football_teams team on team.code = pick.team_code
      where pick.challenge_id = challenge.id
        and pick.profile_id = challenge.creator_id
    ), '[]'::jsonb),
    'recipient_roster', coalesce((
      select jsonb_agg(
        jsonb_strip_nulls(jsonb_build_object(
          'turn_number', pick.turn_number,
          'team_code', pick.team_code,
          'team_name', team.name,
          'roster_slot', pick.roster_slot,
          'athlete_id', pick.athlete_id,
          'display_name', pick.display_name,
          'position_label', pick.position_label,
          'position_abbreviation', pick.position_abbreviation,
          'headshot_url', pick.headshot_url,
          'hidden_grade', case when match.phase = 'complete' and match.forfeited_at is null then pick.hidden_grade else null end
        ))
        order by pick.turn_number
      )
      from private.wheel_football_picks pick
      join private.wheel_football_teams team on team.code = pick.team_code
      where pick.challenge_id = challenge.id
        and pick.profile_id = challenge.recipient_id
    ), '[]'::jsonb),
    'result', case when match.phase = 'complete' and match.forfeited_at is null then jsonb_build_object(
      'creator_raw_grade', private.wheel_football_raw_grade(challenge.id, challenge.creator_id),
      'recipient_raw_grade', private.wheel_football_raw_grade(challenge.id, challenge.recipient_id),
      'creator_score', private.wheel_football_display_score(
        private.wheel_football_raw_grade(challenge.id, challenge.creator_id)
      ),
      'recipient_score', private.wheel_football_display_score(
        private.wheel_football_raw_grade(challenge.id, challenge.recipient_id)
      ),
      'winner_profile_id', case
        when private.wheel_football_raw_grade(challenge.id, challenge.creator_id)
           > private.wheel_football_raw_grade(challenge.id, challenge.recipient_id)
          then challenge.creator_id
        when private.wheel_football_raw_grade(challenge.id, challenge.recipient_id)
           > private.wheel_football_raw_grade(challenge.id, challenge.creator_id)
          then challenge.recipient_id
        else null
      end,
      'is_tie',
        private.wheel_football_raw_grade(challenge.id, challenge.creator_id)
        = private.wheel_football_raw_grade(challenge.id, challenge.recipient_id)
    ) else null end,
    'opened_at', challenge.opened_at,
    'completed_at', challenge.completed_at,
    'forfeited_by_profile_id', match.forfeited_by_profile_id,
    'forfeited_at', match.forfeited_at
  ))
  from public.play_challenges challenge
  join private.wheel_football_matches match on match.challenge_id = challenge.id
  join public.profiles creator on creator.id = challenge.creator_id
  join public.profiles recipient on recipient.id = challenge.recipient_id
  left join private.wheel_football_teams pending on pending.code = match.pending_team_code
  where challenge.id = p_challenge_id;
$$;

comment on table private.wheel_football_grade_authority is
  'Private current-roster Wheel authority: exactly the audited selectable player-position rows plus all 32 current head coaches. No non-Wheel NFL players are stored. Never expose before natural match completion.';
comment on function private.wheel_football_display_score(numeric) is
  'Presentation-only Wheel score for the wider current-NFL grade scale: raw 75/80/85/90/95/100 maps to 50/60/70/80/90/100. Raw seven-slot average remains winner source of truth.';
