-- NFL Wheel of Football locked grading runtime.
-- Source of truth: the seven machine-readable Octagon HQ grade artifacts dated 2026-10-03.
-- Individual grades remain private forever. Only the completed Superteam final grade is exposed.
-- Each pick snapshots its effective grade/version/date so later authority updates cannot rewrite history.

create table if not exists private.wheel_football_grade_authority (
  team_code text not null references private.wheel_football_teams(code) on delete restrict,
  position_group text not null check (
    position_group in ('QB','RB','WR','TE','Front Seven','Secondary','Head Coach')
  ),
  name_key text not null,
  display_name text not null,
  hidden_grade numeric(4,1) not null check (hidden_grade between 0 and 100),
  effective_date date not null,
  grade_version text not null,
  source_artifact text not null,
  primary key (team_code, position_group, name_key, effective_date)
);

alter table private.wheel_football_grade_authority enable row level security;
revoke all on private.wheel_football_grade_authority from public, anon, authenticated;

create or replace function private.wheel_football_grade_name_key(p_name text)
returns text
language sql
immutable
set search_path = ''
as $$
  select regexp_replace(
    translate(
      lower(coalesce(p_name, '')),
      'áàâäãåéèêëíìîïóòôöõúùûüñçýÿ',
      'aaaaaaeeeeiiiiooooouuuuncyy'
    ),
    '[^a-z0-9]+',
    '',
    'g'
  );
$$;

insert into private.wheel_football_grade_authority (
  team_code,
  position_group,
  name_key,
  display_name,
  hidden_grade,
  effective_date,
  grade_version,
  source_artifact
) values
  ('BUF','QB','joshallen','Josh Allen',99.0,'2026-10-03','nfl-wheel-qb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('KC','QB','patrickmahomes','Patrick Mahomes',97.0,'2026-10-03','nfl-wheel-qb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('BAL','QB','lamarjackson','Lamar Jackson',96.0,'2026-10-03','nfl-wheel-qb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('LAR','QB','matthewstafford','Matthew Stafford',95.0,'2026-10-03','nfl-wheel-qb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('CIN','QB','joeburrow','Joe Burrow',95.0,'2026-10-03','nfl-wheel-qb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('DAL','QB','dakprescott','Dak Prescott',92.0,'2026-10-03','nfl-wheel-qb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('NE','QB','drakemaye','Drake Maye',88.0,'2026-10-03','nfl-wheel-qb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('PHI','QB','jalenhurts','Jalen Hurts',85.0,'2026-10-03','nfl-wheel-qb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('SF','QB','brockpurdy','Brock Purdy',89.0,'2026-10-03','nfl-wheel-qb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('DET','QB','jaredgoff','Jared Goff',89.0,'2026-10-03','nfl-wheel-qb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('LAC','QB','justinherbert','Justin Herbert',88.0,'2026-10-03','nfl-wheel-qb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('JAX','QB','trevorlawrence','Trevor Lawrence',87.0,'2026-10-03','nfl-wheel-qb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('WSH','QB','jaydendaniels','Jayden Daniels',84.0,'2026-10-03','nfl-wheel-qb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('GB','QB','jordanlove','Jordan Love',85.0,'2026-10-03','nfl-wheel-qb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('TB','QB','bakermayfield','Baker Mayfield',86.0,'2026-10-03','nfl-wheel-qb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('HOU','QB','cjstroud','C.J. Stroud',82.0,'2026-10-03','nfl-wheel-qb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('SEA','QB','samdarnold','Sam Darnold',88.0,'2026-10-03','nfl-wheel-qb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('NYJ','QB','genosmith','Geno Smith',82.0,'2026-10-03','nfl-wheel-qb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('CHI','QB','calebwilliams','Caleb Williams',87.0,'2026-10-03','nfl-wheel-qb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('MIN','QB','kylermurray','Kyler Murray',80.0,'2026-10-03','nfl-wheel-qb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('IND','QB','danieljones','Daniel Jones',80.0,'2026-10-03','nfl-wheel-qb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('LV','QB','kirkcousins','Kirk Cousins',80.0,'2026-10-03','nfl-wheel-qb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('NYG','QB','jaxsondart','Jaxson Dart',82.0,'2026-10-03','nfl-wheel-qb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('ARI','QB','jacobybrissett','Jacoby Brissett',80.0,'2026-10-03','nfl-wheel-qb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('NO','QB','tylershough','Tyler Shough',82.0,'2026-10-03','nfl-wheel-qb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('CAR','QB','bryceyoung','Bryce Young',82.0,'2026-10-03','nfl-wheel-qb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('DEN','QB','bonix','Bo Nix',79.0,'2026-10-03','nfl-wheel-qb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('CLE','QB','deshaunwatson','Deshaun Watson',78.0,'2026-10-03','nfl-wheel-qb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('PIT','QB','aaronrodgers','Aaron Rodgers',79.0,'2026-10-03','nfl-wheel-qb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('ATL','QB','michaelpenixjr','Michael Penix Jr.',78.0,'2026-10-03','nfl-wheel-qb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('MIA','QB','malikwillis','Malik Willis',76.0,'2026-10-03','nfl-wheel-qb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('TEN','QB','camward','Cam Ward',75.0,'2026-10-03','nfl-wheel-qb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('LV','QB','fernandomendoza','Fernando Mendoza',73.0,'2026-10-03','nfl-wheel-qb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('NYG','QB','jameiswinston','Jameis Winston',72.0,'2026-10-03','nfl-wheel-qb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('ARI','RB','jeremiyahlove','Jeremiyah Love',82.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('ARI','RB','tylerallgeier','Tyler Allgeier',82.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('ARI','RB','jamesconner','James Conner',83.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('ATL','RB','bijanrobinson','Bijan Robinson',99.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('ATL','RB','brianrobinson','Brian Robinson',82.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('BAL','RB','derrickhenry','Derrick Henry',94.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('BAL','RB','justicehill','Justice Hill',78.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('BUF','RB','jamescookiii','James Cook III',94.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('BUF','RB','tyjohnson','Ty Johnson',77.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('CAR','RB','chubahubbard','Chuba Hubbard',84.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('CAR','RB','jonathonbrooks','Jonathon Brooks',76.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('CHI','RB','dandreswift','D''Andre Swift',83.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('CHI','RB','kylemonangai','Kyle Monangai',82.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('CIN','RB','chasebrown','Chase Brown',85.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('CIN','RB','samajeperine','Samaje Perine',78.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('CLE','RB','quinshonjudkins','Quinshon Judkins',80.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('CLE','RB','dylansampson','Dylan Sampson',77.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('DAL','RB','javontewilliams','Javonte Williams',83.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('DAL','RB','tylergoodson','Tyler Goodson',74.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('DEN','RB','jkdobbins','J.K. Dobbins',84.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('DEN','RB','rjharvey','RJ Harvey',78.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('DET','RB','jahmyrgibbs','Jahmyr Gibbs',98.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('DET','RB','isiahpacheco','Isiah Pacheco',82.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('GB','RB','joshjacobs','Josh Jacobs',86.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('GB','RB','marshawnlloyd','MarShawn Lloyd',76.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('HOU','RB','davidmontgomery','David Montgomery',82.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('HOU','RB','woodymarks','Woody Marks',79.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('IND','RB','jonathantaylor','Jonathan Taylor',95.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('IND','RB','sethmcgowan','Seth McGowan',72.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('JAX','RB','bhayshultuten','Bhayshul Tuten',83.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('JAX','RB','chrisrodriguezjr','Chris Rodriguez Jr.',77.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('KC','RB','kennethwalker','Kenneth Walker',89.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('KC','RB','emmettjohnson','Emmett Johnson',75.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('LAC','RB','omarionhampton','Omarion Hampton',83.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('LAC','RB','keatonmitchell','Keaton Mitchell',81.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('LAR','RB','kyrenwilliams','Kyren Williams',88.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('LAR','RB','blakecorum','Blake Corum',81.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('LV','RB','ashtonjeanty','Ashton Jeanty',83.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('LV','RB','mikewashingtonjr','Mike Washington Jr.',76.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('MIA','RB','devonachane','De''Von Achane',91.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('MIA','RB','jaylenwright','Jaylen Wright',79.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('MIN','RB','aaronjonessr','Aaron Jones Sr.',82.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('MIN','RB','jordanmason','Jordan Mason',82.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('NE','RB','rhamondrestevenson','Rhamondre Stevenson',82.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('NE','RB','treveyonhenderson','TreVeyon Henderson',86.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('NO','RB','travisetiennejr','Travis Etienne Jr.',84.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('NO','RB','alvinkamara','Alvin Kamara',80.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('NYG','RB','camskattebo','Cam Skattebo',82.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('NYG','RB','najeeharris','Najee Harris',80.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('NYJ','RB','breecehall','Breece Hall',86.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('NYJ','RB','braelonallen','Braelon Allen',78.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('PHI','RB','saquonbarkley','Saquon Barkley',94.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('PHI','RB','tankbigsby','Tank Bigsby',79.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('PIT','RB','jaylenwarren','Jaylen Warren',88.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('PIT','RB','ricodowdle','Rico Dowdle',80.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('SEA','RB','jadarianprice','Jadarian Price',78.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('SEA','RB','zachcharbonnet','Zach Charbonnet',82.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('SF','RB','christianmccaffrey','Christian McCaffrey',96.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('SF','RB','isaacguerendo','Isaac Guerendo',77.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('TB','RB','buckyirving','Bucky Irving',87.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('TB','RB','kennygainwell','Kenny Gainwell',79.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('TEN','RB','tonypollard','Tony Pollard',82.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('TEN','RB','tyjaespears','Tyjae Spears',81.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('WSH','RB','jacorycroskeymerritt','Jacory Croskey-Merritt',81.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('WSH','RB','rachaadwhite','Rachaad White',82.0,'2026-10-03','nfl-wheel-rb-grades-2026-10-03-v1','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('ARI','WR','marvinharrisonjr','Marvin Harrison Jr.',85.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('ARI','WR','michaelwilson','Michael Wilson',85.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('ARI','WR','kendrickbourne','Kendrick Bourne',79.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('ATL','WR','drakelondon','Drake London',91.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('ATL','WR','jahandotson','Jahan Dotson',78.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('ATL','WR','olamidezaccheaus','Olamide Zaccheaus',78.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('BAL','WR','zayflowers','Zay Flowers',90.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('BAL','WR','rashodbateman','Rashod Bateman',83.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('BAL','WR','jakobilane','Ja''Kobi Lane',76.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('BUF','WR','djmoore','DJ Moore',86.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('BUF','WR','khalilshakir','Khalil Shakir',84.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('BUF','WR','keoncoleman','Keon Coleman',81.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('CAR','WR','tetairoamcmillan','Tetairoa McMillan',90.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('CAR','WR','jalencoker','Jalen Coker',82.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('CAR','WR','xavierlegette','Xavier Legette',80.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('CHI','WR','romeodunze','Rome Odunze',88.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('CHI','WR','lutherburdeniii','Luther Burden III',84.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('CHI','WR','kalifraymond','Kalif Raymond',81.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('CIN','WR','jamarrchase','Ja''Marr Chase',99.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('CIN','WR','teehiggins','Tee Higgins',88.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('CIN','WR','andreiiosivas','Andrei Iosivas',79.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('CLE','WR','jerryjeudy','Jerry Jeudy',84.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('CLE','WR','kcconcepcionjr','KC Concepcion Jr.',80.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('CLE','WR','denzelboston','Denzel Boston',76.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('DAL','WR','ceedeelamb','CeeDee Lamb',96.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('DAL','WR','georgepickens','George Pickens',93.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('DAL','WR','ryanflournoy','Ryan Flournoy',79.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('DEN','WR','courtlandsutton','Courtland Sutton',84.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('DEN','WR','jaylenwaddle','Jaylen Waddle',86.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('DEN','WR','marvinmimsjr','Marvin Mims Jr.',82.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('DEN','WR','patbryant','Pat Bryant',76.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('DET','WR','amonrastbrown','Amon-Ra St. Brown',96.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('DET','WR','jamesonwilliams','Jameson Williams',87.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('DET','WR','isaacteslaa','Isaac TeSlaa',79.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('GB','WR','christianwatson','Christian Watson',85.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('GB','WR','jaydenreed','Jayden Reed',84.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('GB','WR','matthewgolden','Matthew Golden',81.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('HOU','WR','nicocollins','Nico Collins',92.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('HOU','WR','tankdell','Tank Dell',84.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('HOU','WR','kayshonboutte','Kayshon Boutte',83.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('HOU','WR','xavierhutchinson','Xavier Hutchinson',78.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('IND','WR','keenanallen','Keenan Allen',83.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('IND','WR','joshdowns','Josh Downs',84.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('IND','WR','alecpierce','Alec Pierce',84.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('IND','WR','dariusslayton','Darius Slayton',81.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('JAX','WR','brianthomasjr','Brian Thomas Jr.',86.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('JAX','WR','travishunter','Travis Hunter',77.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('JAX','WR','jakobimeyers','Jakobi Meyers',82.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('JAX','WR','parkerwashington','Parker Washington',80.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('KC','WR','rasheerice','Rashee Rice',90.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('KC','WR','xavierworthy','Xavier Worthy',85.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('KC','WR','tyquanthornton','Tyquan Thornton',79.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('LAC','WR','laddmcconkey','Ladd McConkey',85.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('LAC','WR','quentinjohnston','Quentin Johnston',83.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('LAC','WR','treharris','Tre'' Harris',78.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('LAR','WR','pukanacua','Puka Nacua',98.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('LAR','WR','davanteadams','Davante Adams',87.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('LAR','WR','konatamumpfield','Konata Mumpfield',76.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('LV','WR','tretucker','Tre Tucker',82.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('LV','WR','jackbech','Jack Bech',76.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('LV','WR','jalennailor','Jalen Nailor',81.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('MIA','WR','malikwashington','Malik Washington',78.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('MIA','WR','calebdouglas','Caleb Douglas',75.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('MIA','WR','chrisbell','Chris Bell',75.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('MIN','WR','justinjefferson','Justin Jefferson',97.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('MIN','WR','jordanaddison','Jordan Addison',86.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('MIN','WR','jauanjennings','Jauan Jennings',84.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('NE','WR','ajbrown','A.J. Brown',92.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('NE','WR','romeodoubs','Romeo Doubs',83.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('NE','WR','demariodouglas','DeMario Douglas',81.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('NE','WR','mackhollins','Mack Hollins',76.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('NO','WR','chrisolave','Chris Olave',90.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('NO','WR','devaughnvele','Devaughn Vele',80.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('NO','WR','brycelance','Bryce Lance',75.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('NYG','WR','maliknabers','Malik Nabers',89.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('NYG','WR','darnellmooney','Darnell Mooney',82.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('NYG','WR','malachifields','Malachi Fields',78.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('NYJ','WR','garrettwilson','Garrett Wilson',91.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('NYJ','WR','adonaimitchell','Adonai Mitchell',81.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('NYJ','WR','isaiahwilliams','Isaiah Williams',72.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('PHI','WR','devontasmith','DeVonta Smith',88.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('PHI','WR','dontayvionwicks','Dontayvion Wicks',82.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('PHI','WR','makailemon','Makai Lemon',77.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('PIT','WR','dkmetcalf','DK Metcalf',88.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('PIT','WR','michaelpittmanjr','Michael Pittman Jr.',83.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('PIT','WR','romanwilson','Roman Wilson',77.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('SEA','WR','jaxonsmithnjigba','Jaxon Smith-Njigba',99.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('SEA','WR','cooperkupp','Cooper Kupp',82.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('SEA','WR','rashidshaheed','Rashid Shaheed',84.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('SF','WR','mikeevans','Mike Evans',87.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('SF','WR','deebosamuelsr','Deebo Samuel Sr.',84.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('SF','WR','rickypearsall','Ricky Pearsall',84.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('SF','WR','jacobcowing','Jacob Cowing',75.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('TB','WR','emekaegbuka','Emeka Egbuka',87.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('TB','WR','chrisgodwinjr','Chris Godwin Jr.',85.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('TB','WR','jalenmcmillan','Jalen McMillan',79.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('TB','WR','tedhurstiii','Ted Hurst III',78.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('TEN','WR','calvinridley','Calvin Ridley',83.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('TEN','WR','carnelltate','Carnell Tate',79.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('TEN','WR','wandalerobinson','Wan''Dale Robinson',84.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('WSH','WR','terrymclaurin','Terry McLaurin',87.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('WSH','WR','stefondiggs','Stefon Diggs',86.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('WSH','WR','dyamibrown','Dyami Brown',80.0,'2026-10-03','nfl-wheel-wr-grades-2026-10-03-v1','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('ARI','TE','treymcbride','Trey McBride',99.0,'2026-10-03','nfl-wheel-te-grades-2026-10-03-v1','data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('ATL','TE','kylepittssr','Kyle Pitts Sr.',84.0,'2026-10-03','nfl-wheel-te-grades-2026-10-03-v1','data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('BAL','TE','markandrews','Mark Andrews',82.0,'2026-10-03','nfl-wheel-te-grades-2026-10-03-v1','data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('BUF','TE','daltonkincaid','Dalton Kincaid',91.0,'2026-10-03','nfl-wheel-te-grades-2026-10-03-v1','data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('CAR','TE','tommytremble','Tommy Tremble',76.0,'2026-10-03','nfl-wheel-te-grades-2026-10-03-v1','data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('CHI','TE','colstonloveland','Colston Loveland',87.0,'2026-10-03','nfl-wheel-te-grades-2026-10-03-v1','data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('CIN','TE','drewsample','Drew Sample',72.0,'2026-10-03','nfl-wheel-te-grades-2026-10-03-v1','data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('CLE','TE','haroldfanninjr','Harold Fannin Jr.',84.0,'2026-10-03','nfl-wheel-te-grades-2026-10-03-v1','data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('DAL','TE','jakeferguson','Jake Ferguson',82.0,'2026-10-03','nfl-wheel-te-grades-2026-10-03-v1','data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('DEN','TE','evanengram','Evan Engram',78.0,'2026-10-03','nfl-wheel-te-grades-2026-10-03-v1','data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('DET','TE','samlaporta','Sam LaPorta',94.0,'2026-10-03','nfl-wheel-te-grades-2026-10-03-v1','data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('GB','TE','tuckerkraft','Tucker Kraft',87.0,'2026-10-03','nfl-wheel-te-grades-2026-10-03-v1','data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('HOU','TE','daltonschultz','Dalton Schultz',83.0,'2026-10-03','nfl-wheel-te-grades-2026-10-03-v1','data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('IND','TE','tylerwarren','Tyler Warren',86.0,'2026-10-03','nfl-wheel-te-grades-2026-10-03-v1','data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('JAX','TE','brentonstrange','Brenton Strange',80.0,'2026-10-03','nfl-wheel-te-grades-2026-10-03-v1','data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('KC','TE','traviskelce','Travis Kelce',88.0,'2026-10-03','nfl-wheel-te-grades-2026-10-03-v1','data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('LAC','TE','charliekolar','Charlie Kolar',73.0,'2026-10-03','nfl-wheel-te-grades-2026-10-03-v1','data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('LAC','TE','davidnjoku','David Njoku',81.0,'2026-10-03','nfl-wheel-te-grades-2026-10-03-v1','data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('LAR','TE','colbyparkinson','Colby Parkinson',79.0,'2026-10-03','nfl-wheel-te-grades-2026-10-03-v1','data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('LV','TE','brockbowers','Brock Bowers',98.0,'2026-10-03','nfl-wheel-te-grades-2026-10-03-v1','data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('MIA','TE','gregdulcich','Greg Dulcich',75.0,'2026-10-03','nfl-wheel-te-grades-2026-10-03-v1','data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('MIN','TE','tjhockenson','T.J. Hockenson',80.0,'2026-10-03','nfl-wheel-te-grades-2026-10-03-v1','data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('NE','TE','hunterhenry','Hunter Henry',82.0,'2026-10-03','nfl-wheel-te-grades-2026-10-03-v1','data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('NO','TE','juwanjohnson','Juwan Johnson',86.0,'2026-10-03','nfl-wheel-te-grades-2026-10-03-v1','data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('NYG','TE','isaiahlikely','Isaiah Likely',83.0,'2026-10-03','nfl-wheel-te-grades-2026-10-03-v1','data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('NYJ','TE','masontaylor','Mason Taylor',76.0,'2026-10-03','nfl-wheel-te-grades-2026-10-03-v1','data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('PHI','TE','dallasgoedert','Dallas Goedert',82.0,'2026-10-03','nfl-wheel-te-grades-2026-10-03-v1','data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('PIT','TE','patfreiermuth','Pat Freiermuth',82.0,'2026-10-03','nfl-wheel-te-grades-2026-10-03-v1','data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('SEA','TE','ajbarner','AJ Barner',81.0,'2026-10-03','nfl-wheel-te-grades-2026-10-03-v1','data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('SF','TE','georgekittle','George Kittle',98.0,'2026-10-03','nfl-wheel-te-grades-2026-10-03-v1','data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('TB','TE','cadeotton','Cade Otton',79.0,'2026-10-03','nfl-wheel-te-grades-2026-10-03-v1','data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('TEN','TE','gunnarhelm','Gunnar Helm',76.0,'2026-10-03','nfl-wheel-te-grades-2026-10-03-v1','data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('WSH','TE','chigokonkwo','Chig Okonkwo',78.0,'2026-10-03','nfl-wheel-te-grades-2026-10-03-v1','data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('ARI','Front Seven','joshsweat','Josh Sweat',88.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('ARI','Front Seven','walternoleniii','Walter Nolen III',82.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('ARI','Front Seven','mackwilsonsr','Mack Wilson Sr.',80.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('ARI','Front Seven','jackgibbens','Jack Gibbens',78.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('ARI','Front Seven','zavencollins','Zaven Collins',76.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('ARI','Front Seven','dantestills','Dante Stills',74.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('ATL','Front Seven','jamespearcejr','James Pearce Jr.',84.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('ATL','Front Seven','gervondextersr','Gervon Dexter Sr.',82.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('ATL','Front Seven','zadariussmith','Za''Darius Smith',78.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('ATL','Front Seven','jalonwalker','Jalon Walker',83.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('ATL','Front Seven','divinedeablo','Divine Deablo',80.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('ATL','Front Seven','maasonsmith','Maason Smith',74.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('BAL','Front Seven','treyhendrickson','Trey Hendrickson',91.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('BAL','Front Seven','roquansmith','Roquan Smith',90.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('BAL','Front Seven','nnamdimadubuike','Nnamdi Madubuike',88.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('BAL','Front Seven','taviusrobinson','Tavius Robinson',75.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('BAL','Front Seven','calaiscampbell','Calais Campbell',81.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('BAL','Front Seven','trentonsimpson','Trenton Simpson',78.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('BUF','Front Seven','gregrousseau','Greg Rousseau',90.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('BUF','Front Seven','bradleychubb','Bradley Chubb',79.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('BUF','Front Seven','edoliver','Ed Oliver',85.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('BUF','Front Seven','terrelbernard','Terrel Bernard',84.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('BUF','Front Seven','dorianwilliams','Dorian Williams',76.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('BUF','Front Seven','tjsanders','T.J. Sanders',75.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('CAR','Front Seven','derrickbrown','Derrick Brown',94.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('CAR','Front Seven','devinlloyd','Devin Lloyd',92.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('CAR','Front Seven','jaelanphillips','Jaelan Phillips',86.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('CAR','Front Seven','bobbyokereke','Bobby Okereke',82.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('CAR','Front Seven','princelyumanmielen','Princely Umanmielen',77.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('CAR','Front Seven','leehunter','Lee Hunter',75.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('CHI','Front Seven','montezsweat','Montez Sweat',84.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('CHI','Front Seven','gradyjarrett','Grady Jarrett',80.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('CHI','Front Seven','tjedwards','T.J. Edwards',84.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('CHI','Front Seven','austinbooker','Austin Booker',78.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('CHI','Front Seven','devinbush','Devin Bush',88.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('CHI','Front Seven','dayoodeyingbo','Dayo Odeyingbo',77.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('CIN','Front Seven','dexterlawrenceii','Dexter Lawrence II',92.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('CIN','Front Seven','jonathanallen','Jonathan Allen',88.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('CIN','Front Seven','boyemafe','Boye Mafe',82.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('CIN','Front Seven','mylesmurphy','Myles Murphy',77.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('CIN','Front Seven','demetriusknightjr','Demetrius Knight Jr.',80.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('CIN','Front Seven','barrettcarter','Barrett Carter',75.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('CLE','Front Seven','jaredverse','Jared Verse',89.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('CLE','Front Seven','masongraham','Mason Graham',85.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('CLE','Front Seven','jeremiahowusukoramoah','Jeremiah Owusu-Koramoah',86.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('CLE','Front Seven','quincywilliams','Quincy Williams',84.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('CLE','Front Seven','carsonschwesinger','Carson Schwesinger',86.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('CLE','Front Seven','isaiahmcguire','Isaiah McGuire',75.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('DAL','Front Seven','quinnenwilliams','Quinnen Williams',93.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('DAL','Front Seven','rashangary','Rashan Gary',87.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('DAL','Front Seven','kennyclark','Kenny Clark',80.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('DAL','Front Seven','demarvionovershown','DeMarvion Overshown',82.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('DAL','Front Seven','donovanezeiruaku','Donovan Ezeiruaku',80.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('DAL','Front Seven','deewinters','Dee Winters',79.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('DEN','Front Seven','nikbonitto','Nik Bonitto',92.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('DEN','Front Seven','zachallen','Zach Allen',90.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('DEN','Front Seven','alexsingleton','Alex Singleton',82.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('DEN','Front Seven','jonahelliss','Jonah Elliss',79.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('DEN','Front Seven','djjones','D.J. Jones',82.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('DEN','Front Seven','justinstrnad','Justin Strnad',76.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('DET','Front Seven','aidanhutchinson','Aidan Hutchinson',98.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('DET','Front Seven','alimmcneill','Alim McNeill',86.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('DET','Front Seven','jackcampbell','Jack Campbell',91.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('DET','Front Seven','derrickbarnes','Derrick Barnes',79.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('DET','Front Seven','tyleikwilliams','Tyleik Williams',80.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('DET','Front Seven','djwonnum','DJ Wonnum',78.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('GB','Front Seven','micahparsons','Micah Parsons',96.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('GB','Front Seven','edgerrincooper','Edgerrin Cooper',84.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('GB','Front Seven','zairefranklin','Zaire Franklin',82.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('GB','Front Seven','javonhargrave','Javon Hargrave',80.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('GB','Front Seven','devontewyatt','Devonte Wyatt',81.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('GB','Front Seven','lukasvanness','Lukas Van Ness',76.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('HOU','Front Seven','willandersonjr','Will Anderson Jr.',99.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('HOU','Front Seven','daniellehunter','Danielle Hunter',95.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('HOU','Front Seven','azeezalshaair','Azeez Al-Shaair',83.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('HOU','Front Seven','jadeveonclowney','Jadeveon Clowney',85.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('HOU','Front Seven','sheldonrankins','Sheldon Rankins',81.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('HOU','Front Seven','henrytootoo','Henry To''oTo''o',76.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('IND','Front Seven','deforestbuckner','DeForest Buckner',88.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('IND','Front Seven','laiatulatu','Laiatu Latu',87.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('IND','Front Seven','groverstewart','Grover Stewart',86.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('IND','Front Seven','ardenkey','Arden Key',79.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('IND','Front Seven','jayloncarlies','Jaylon Carlies',74.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('IND','Front Seven','akeemdavisgaither','Akeem Davis-Gaither',76.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('JAX','Front Seven','joshhinesallen','Josh Hines-Allen',92.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('JAX','Front Seven','travonwalker','Travon Walker',83.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('JAX','Front Seven','foyesadeoluokun','Foyesade Oluokun',86.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('JAX','Front Seven','arikarmstead','Arik Armstead',80.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('JAX','Front Seven','davonhamilton','DaVon Hamilton',76.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('JAX','Front Seven','ventrellmiller','Ventrell Miller',74.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('KC','Front Seven','chrisjones','Chris Jones',94.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('KC','Front Seven','georgekarlaftis','George Karlaftis',86.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('KC','Front Seven','nickbolton','Nick Bolton',87.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('KC','Front Seven','druetranquill','Drue Tranquill',82.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('KC','Front Seven','peterwoods','Peter Woods',80.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('KC','Front Seven','felixanudikeuzomah','Felix Anudike-Uzomah',75.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('LAC','Front Seven','khalilmack','Khalil Mack',87.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('LAC','Front Seven','tulituipulotu','Tuli Tuipulotu',83.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('LAC','Front Seven','daiyanhenley','Daiyan Henley',86.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('LAC','Front Seven','denzelperryman','Denzel Perryman',76.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('LAC','Front Seven','dalvintomlinson','Dalvin Tomlinson',79.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('LAC','Front Seven','teairtart','Teair Tart',80.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('LAR','Front Seven','mylesgarrett','Myles Garrett',99.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('LAR','Front Seven','aarondonald','Aaron Donald',87.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('LAR','Front Seven','kobieturner','Kobie Turner',90.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('LAR','Front Seven','bradenfiske','Braden Fiske',85.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('LAR','Front Seven','byronyoung','Byron Young',88.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('LAR','Front Seven','natelandman','Nate Landman',84.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('LV','Front Seven','maxxcrosby','Maxx Crosby',96.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('LV','Front Seven','kwitypaye','Kwity Paye',82.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('LV','Front Seven','nakobedean','Nakobe Dean',84.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('LV','Front Seven','quaywalker','Quay Walker',84.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('LV','Front Seven','adambutler','Adam Butler',78.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('LV','Front Seven','tonkahemingway','Tonka Hemingway',72.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('MIA','Front Seven','jordynbrooks','Jordyn Brooks',84.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('MIA','Front Seven','zachsieler','Zach Sieler',88.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('MIA','Front Seven','choprobinson','Chop Robinson',80.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('MIA','Front Seven','joshuche','Josh Uche',78.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('MIA','Front Seven','jacobrodriguez','Jacob Rodriguez',76.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('MIA','Front Seven','williegayjr','Willie Gay Jr.',77.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('MIN','Front Seven','dallasturner','Dallas Turner',85.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('MIN','Front Seven','andrewvanginkel','Andrew Van Ginkel',89.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('MIN','Front Seven','blakecashman','Blake Cashman',85.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('MIN','Front Seven','jalenredmond','Jalen Redmond',83.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('MIN','Front Seven','ericwilson','Eric Wilson',79.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('MIN','Front Seven','tyrioningramdawkins','Tyrion Ingram-Dawkins',73.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('NE','Front Seven','christianbarmore','Christian Barmore',85.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('NE','Front Seven','haroldlandryiii','Harold Landry III',85.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('NE','Front Seven','miltonwilliams','Milton Williams',90.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('NE','Front Seven','dremontjones','Dre''Mont Jones',80.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('NE','Front Seven','robertspillane','Robert Spillane',84.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('NO','Front Seven','chaseyoung','Chase Young',86.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('NO','Front Seven','cameronjordan','Cameron Jordan',79.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('NO','Front Seven','carlgranderson','Carl Granderson',82.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('NO','Front Seven','kadenelliss','Kaden Elliss',86.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('NO','Front Seven','bryanbresee','Bryan Bresee',80.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('NO','Front Seven','petewerner','Pete Werner',78.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('NYG','Front Seven','brianburns','Brian Burns',90.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('NYG','Front Seven','abdulcarter','Abdul Carter',87.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('NYG','Front Seven','kayvonthibodeaux','Kayvon Thibodeaux',83.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('NYG','Front Seven','tremaineedmunds','Tremaine Edmunds',84.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('NYG','Front Seven','arvellreese','Arvell Reese',80.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('NYG','Front Seven','djreader','D.J. Reader',83.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('NYJ','Front Seven','davidbailey','David Bailey',83.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('NYJ','Front Seven','willmcdonaldiv','Will McDonald IV',83.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('NYJ','Front Seven','jamiensherwood','Jamien Sherwood',82.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('NYJ','Front Seven','demariodavis','Demario Davis',89.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('NYJ','Front Seven','tvondresweat','T''Vondre Sweat',85.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('NYJ','Front Seven','harrisonphillips','Harrison Phillips',80.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('PHI','Front Seven','jalencarter','Jalen Carter',93.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('PHI','Front Seven','zackbaun','Zack Baun',95.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('PHI','Front Seven','jonathangreenard','Jonathan Greenard',89.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('PHI','Front Seven','jalyxhunt','Jalyx Hunt',81.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('PHI','Front Seven','jihaadcampbell','Jihaad Campbell',85.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('PHI','Front Seven','jordandavis','Jordan Davis',86.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('PIT','Front Seven','tjwatt','T.J. Watt',93.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('PIT','Front Seven','cameronheyward','Cameron Heyward',95.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('PIT','Front Seven','alexhighsmith','Alex Highsmith',89.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('PIT','Front Seven','patrickqueen','Patrick Queen',82.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('PIT','Front Seven','paytonwilson','Payton Wilson',81.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('PIT','Front Seven','derrickharmon','Derrick Harmon',82.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('SEA','Front Seven','leonardwilliams','Leonard Williams',90.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('SEA','Front Seven','ernestjonesiv','Ernest Jones IV',85.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('SEA','Front Seven','byronmurphyii','Byron Murphy II',89.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('SEA','Front Seven','demarcuslawrence','Demarcus Lawrence',88.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('SEA','Front Seven','derickhall','Derick Hall',80.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('SEA','Front Seven','drakethomas','Drake Thomas',79.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('SF','Front Seven','nickbosa','Nick Bosa',94.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('SF','Front Seven','fredwarner','Fred Warner',97.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('SF','Front Seven','dregreenlaw','Dre Greenlaw',87.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('SF','Front Seven','osaodighizuwa','Osa Odighizuwa',82.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('SF','Front Seven','keionwhite','Keion White',77.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('SF','Front Seven','mykelwilliams','Mykel Williams',82.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('TB','Front Seven','vitavea','Vita Vea',90.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('TB','Front Seven','calijahkancey','Calijah Kancey',82.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('TB','Front Seven','yayadiaby','Yaya Diaby',83.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('TB','Front Seven','ruebenbainjr','Rueben Bain Jr.',82.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('TB','Front Seven','alexanzalone','Alex Anzalone',81.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('TB','Front Seven','josiahtrotter','Josiah Trotter',75.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('TEN','Front Seven','jefferysimmons','Jeffery Simmons',95.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('TEN','Front Seven','jermainejohnsonii','Jermaine Johnson II',82.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('TEN','Front Seven','johnfranklinmyers','John Franklin-Myers',82.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('TEN','Front Seven','keldricfaulk','Keldric Faulk',80.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('TEN','Front Seven','anthonyhilljr','Anthony Hill Jr.',79.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('TEN','Front Seven','cedricgray','Cedric Gray',84.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('WSH','Front Seven','daronpayne','Daron Payne',85.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('WSH','Front Seven','frankieluvu','Frankie Luvu',82.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('WSH','Front Seven','odafeoweh','Odafe Oweh',83.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('WSH','Front Seven','sonnystyles','Sonny Styles',80.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('WSH','Front Seven','javonkinlaw','Javon Kinlaw',75.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('WSH','Front Seven','klavonchaisson','K''Lavon Chaisson',77.0,'2026-10-03','nfl-wheel-front-seven-grades-2026-10-03-v1','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('ARI','Secondary','buddabaker','Budda Baker',82.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('ARI','Secondary','willjohnson','Will Johnson',82.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('ARI','Secondary','andrewwingard','Andrew Wingard',77.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('ARI','Secondary','garrettwilliams','Garrett Williams',82.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('ARI','Secondary','maxmelton','Max Melton',78.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('ARI','Secondary','denzelburke','Denzel Burke',74.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('ATL','Secondary','jessiebatesiii','Jessie Bates III',86.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('ATL','Secondary','ajterrelljr','A.J. Terrell Jr.',84.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('ATL','Secondary','xavierwatts','Xavier Watts',83.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('ATL','Secondary','mikehughes','Mike Hughes',78.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('ATL','Secondary','cjhenderson','C.J. Henderson',73.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('ATL','Secondary','billybowmanjr','Billy Bowman Jr.',76.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('BAL','Secondary','kylehamilton','Kyle Hamilton',99.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('BAL','Secondary','marlonhumphrey','Marlon Humphrey',87.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('BAL','Secondary','natewiggins','Nate Wiggins',87.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('BAL','Secondary','malakistarks','Malaki Starks',84.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('BAL','Secondary','jaylinnhawkins','Jaylinn Hawkins',84.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('BUF','Secondary','christianbenford','Christian Benford',82.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('BUF','Secondary','cjgardnerjohnson','C.J. Gardner-Johnson',80.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('BUF','Secondary','maxwellhairston','Maxwell Hairston',81.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('BUF','Secondary','colebishop','Cole Bishop',82.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('BUF','Secondary','deealford','Dee Alford',77.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('CAR','Secondary','jayceehorn','Jaycee Horn',84.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('CAR','Secondary','trevonmoehrig','Tre''von Moehrig',83.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('CAR','Secondary','lathanransom','Lathan Ransom',76.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('CAR','Secondary','willleeiii','Will Lee III',76.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('CAR','Secondary','nickscott','Nick Scott',75.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('CAR','Secondary','akaylebevans','Akayleb Evans',74.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('CHI','Secondary','jaylonjohnson','Jaylon Johnson',85.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('CHI','Secondary','kylergordon','Kyler Gordon',84.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('CHI','Secondary','dillonthieneman','Dillon Thieneman',82.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('CHI','Secondary','tyriquestevensonsr','Tyrique Stevenson Sr.',78.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('CHI','Secondary','xavierwoods','Xavier Woods',80.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('CHI','Secondary','malikmuhammadii','Malik Muhammad II',76.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('CIN','Secondary','daxhill','Dax Hill',81.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('CIN','Secondary','djturnerii','DJ Turner II',84.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('CIN','Secondary','jordanbattle','Jordan Battle',80.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('CIN','Secondary','bryancook','Bryan Cook',86.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('CIN','Secondary','tacariodavis','Tacario Davis',76.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('CLE','Secondary','denzelward','Denzel Ward',94.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('CLE','Secondary','tysoncampbell','Tyson Campbell',82.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('CLE','Secondary','grantdelpit','Grant Delpit',83.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('CLE','Secondary','ronniehickman','Ronnie Hickman',79.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('CLE','Secondary','mylesharden','Myles Harden',73.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('DAL','Secondary','daronbland','DaRon Bland',85.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('DAL','Secondary','joeyporterjr','Joey Porter Jr.',87.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('DAL','Secondary','calebdowns','Caleb Downs',84.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('DAL','Secondary','malikhooker','Malik Hooker',80.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('DAL','Secondary','markquesebell','Markquese Bell',75.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('DEN','Secondary','patsurtainii','Pat Surtain II',96.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('DEN','Secondary','talanoahufanga','Talanoa Hufanga',86.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('DEN','Secondary','brandonjones','Brandon Jones',82.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('DEN','Secondary','rileymoss','Riley Moss',80.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('DEN','Secondary','jaquanmcmillian','Ja''Quan McMillian',82.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('DET','Secondary','brianbranch','Brian Branch',94.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('DET','Secondary','kerbyjoseph','Kerby Joseph',88.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('DET','Secondary','djreed','D.J. Reed',83.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('DET','Secondary','rogermccreary','Roger McCreary',80.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('DET','Secondary','ennisrakestrawjr','Ennis Rakestraw Jr.',76.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('GB','Secondary','xaviermckinney','Xavier McKinney',88.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('GB','Secondary','evanwilliams','Evan Williams',83.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('GB','Secondary','keiseannixon','Keisean Nixon',83.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('GB','Secondary','javonbullard','Javon Bullard',81.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('GB','Secondary','brandoncisse','Brandon Cisse',76.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('HOU','Secondary','derekstingleyjr','Derek Stingley Jr.',95.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('HOU','Secondary','jalenpitre','Jalen Pitre',94.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('HOU','Secondary','calenbullock','Calen Bullock',84.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('HOU','Secondary','kamarilassiter','Kamari Lassiter',89.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('HOU','Secondary','reedblankenship','Reed Blankenship',83.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('IND','Secondary','saucegardner','Sauce Gardner',91.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('IND','Secondary','charvariusward','Charvarius Ward',86.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('IND','Secondary','cambynum','Cam Bynum',83.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('IND','Secondary','ajhaulcy','AJ Haulcy',77.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('IND','Secondary','justinwalley','Justin Walley',75.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('JAX','Secondary','travishunter','Travis Hunter',82.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('JAX','Secondary','jourdanlewis','Jourdan Lewis',84.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('JAX','Secondary','ericmurray','Eric Murray',78.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('JAX','Secondary','antoniojohnson','Antonio Johnson',84.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('JAX','Secondary','montaricbrown','Montaric Brown',76.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('KC','Secondary','ljariussneed','L''Jarius Sneed',82.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('KC','Secondary','mansoordelane','Mansoor Delane',85.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('KC','Secondary','chamarriconner','Chamarri Conner',79.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('KC','Secondary','nohlwilliams','Nohl Williams',80.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('KC','Secondary','alohigilman','Alohi Gilman',82.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('LAC','Secondary','derwinjamesjr','Derwin James Jr.',89.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('LAC','Secondary','tarheebstill','Tarheeb Still',84.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('LAC','Secondary','elijahmolden','Elijah Molden',82.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('LAC','Secondary','camhart','Cam Hart',78.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('LAC','Secondary','tonyjefferson','Tony Jefferson',78.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('LAR','Secondary','trentmcduffie','Trent McDuffie',98.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('LAR','Secondary','quentinlake','Quentin Lake',84.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('LAR','Secondary','kamcurl','Kam Curl',87.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('LAR','Secondary','jaylenwatson','Jaylen Watson',84.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('LAR','Secondary','kamrenkinchens','Kamren Kinchens',84.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('LV','Secondary','taronjohnson','Taron Johnson',84.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('LV','Secondary','jeremychinn','Jeremy Chinn',82.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('LV','Secondary','ericstokes','Eric Stokes',82.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('LV','Secondary','hezekiahmasses','Hezekiah Masses',74.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('LV','Secondary','treydanstukes','Treydan Stukes',77.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('MIA','Secondary','chrisjohnson','Chris Johnson',78.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('MIA','Secondary','jujubrents','JuJu Brents',76.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('MIA','Secondary','dantetraderjr','Dante Trader Jr.',73.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('MIA','Secondary','michaeltaaffe','Michael Taaffe',74.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('MIA','Secondary','jasonmarshalljr','Jason Marshall Jr.',74.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('MIN','Secondary','byronmurphyjr','Byron Murphy Jr.',86.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('MIN','Secondary','joshuametellus','Joshua Metellus',87.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('MIN','Secondary','harrisonsmith','Harrison Smith',83.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('MIN','Secondary','isaiahrodgers','Isaiah Rodgers',84.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('MIN','Secondary','jayward','Jay Ward',75.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('NE','Secondary','christiangonzalez','Christian Gonzalez',97.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('NE','Secondary','carltondavisiii','Carlton Davis III',87.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('NE','Secondary','kevinbyardiii','Kevin Byard III',86.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('NE','Secondary','marcusjones','Marcus Jones',85.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('NE','Secondary','craigwoodson','Craig Woodson',84.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('NO','Secondary','justinreid','Justin Reid',82.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('NO','Secondary','koolaidmckinstry','Kool-Aid McKinstry',82.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('NO','Secondary','julianblackmon','Julian Blackmon',80.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('NO','Secondary','jonassanker','Jonas Sanker',78.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('NO','Secondary','quincyriley','Quincy Riley',75.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('NYG','Secondary','paulsonadebo','Paulson Adebo',82.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('NYG','Secondary','deontebanks','Deonte Banks',77.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('NYG','Secondary','tylernubin','Tyler Nubin',80.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('NYG','Secondary','jevonholland','Jevón Holland',85.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('NYG','Secondary','gregnewsomeii','Greg Newsome II',82.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('NYG','Secondary','druphillips','Dru Phillips',83.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('NYJ','Secondary','minkahfitzpatrick','Minkah Fitzpatrick',90.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('NYJ','Secondary','azareyehthomas','Azareye''h Thomas',79.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('NYJ','Secondary','brandonstephens','Brandon Stephens',78.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('NYJ','Secondary','danebelton','Dane Belton',79.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('NYJ','Secondary','jarvisbrownleejr','Jarvis Brownlee Jr.',78.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('PHI','Secondary','quinyonmitchell','Quinyon Mitchell',93.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('PHI','Secondary','cooperdejean','Cooper DeJean',92.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('PHI','Secondary','riqwoolen','Riq Woolen',84.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('PHI','Secondary','andrewmukuba','Andrew Mukuba',80.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('PHI','Secondary','marcusepps','Marcus Epps',76.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('PIT','Secondary','jalenramsey','Jalen Ramsey',84.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('PIT','Secondary','jameldean','Jamel Dean',87.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('PIT','Secondary','asantesamueljr','Asante Samuel Jr.',79.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('PIT','Secondary','deshonelliott','DeShon Elliott',83.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('PIT','Secondary','jaquanbrisker','Jaquan Brisker',83.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('SEA','Secondary','devonwitherspoon','Devon Witherspoon',97.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('SEA','Secondary','julianlove','Julian Love',87.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('SEA','Secondary','terrionarnold','Terrion Arnold',82.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('SEA','Secondary','nickemmanwori','Nick Emmanwori',86.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('SEA','Secondary','joshjobe','Josh Jobe',79.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('SEA','Secondary','tyokada','Ty Okada',77.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('SF','Secondary','deommodorelenoir','Deommodore Lenoir',84.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('SF','Secondary','renardogreen','Renardo Green',81.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('SF','Secondary','malikmustapha','Malik Mustapha',80.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('SF','Secondary','jiayirbrown','Ji''Ayir Brown',78.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('SF','Secondary','marquessigle','Marques Sigle',76.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('SF','Secondary','uptonstout','Upton Stout',78.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('TB','Secondary','antoinewinfieldjr','Antoine Winfield Jr.',86.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('TB','Secondary','zyonmccollum','Zyon McCollum',83.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('TB','Secondary','tykeesmith','Tykee Smith',84.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('TB','Secondary','jacobparrish','Jacob Parrish',82.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('TB','Secondary','keiontescott','Keionte Scott',79.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('TEN','Secondary','amanihooker','Amani Hooker',84.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('TEN','Secondary','alontaetaylor','Alontae Taylor',82.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('TEN','Secondary','kevinwinstonjr','Kevin Winston Jr.',78.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('TEN','Secondary','cordaleflott','Cor''Dale Flott',80.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('TEN','Secondary','marcusharris','Marcus Harris',75.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('WSH','Secondary','mikesainristil','Mike Sainristil',78.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('WSH','Secondary','treyamos','Trey Amos',82.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('WSH','Secondary','amikrobertson','Amik Robertson',80.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('WSH','Secondary','rasuldouglas','Rasul Douglas',83.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('WSH','Secondary','quanmartin','Quan Martin',80.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('WSH','Secondary','nickcross','Nick Cross',82.0,'2026-10-03','nfl-wheel-secondary-grades-2026-10-03-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('ARI','Head Coach','mikelafleur','Mike LaFleur',76.0,'2026-10-03','nfl-wheel-head-coach-grades-2026-10-03-v1','data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('ATL','Head Coach','kevinstefanski','Kevin Stefanski',84.0,'2026-10-03','nfl-wheel-head-coach-grades-2026-10-03-v1','data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('BAL','Head Coach','jesseminter','Jesse Minter',83.0,'2026-10-03','nfl-wheel-head-coach-grades-2026-10-03-v1','data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('BUF','Head Coach','joebrady','Joe Brady',84.0,'2026-10-03','nfl-wheel-head-coach-grades-2026-10-03-v1','data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('CAR','Head Coach','davecanales','Dave Canales',79.0,'2026-10-03','nfl-wheel-head-coach-grades-2026-10-03-v1','data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('CHI','Head Coach','benjohnson','Ben Johnson',92.0,'2026-10-03','nfl-wheel-head-coach-grades-2026-10-03-v1','data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('CIN','Head Coach','zactaylor','Zac Taylor',79.0,'2026-10-03','nfl-wheel-head-coach-grades-2026-10-03-v1','data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('CLE','Head Coach','toddmonken','Todd Monken',80.0,'2026-10-03','nfl-wheel-head-coach-grades-2026-10-03-v1','data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('DAL','Head Coach','brianschottenheimer','Brian Schottenheimer',81.0,'2026-10-03','nfl-wheel-head-coach-grades-2026-10-03-v1','data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('DEN','Head Coach','seanpayton','Sean Payton',94.0,'2026-10-03','nfl-wheel-head-coach-grades-2026-10-03-v1','data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('DET','Head Coach','dancampbell','Dan Campbell',91.0,'2026-10-03','nfl-wheel-head-coach-grades-2026-10-03-v1','data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('GB','Head Coach','mattlafleur','Matt LaFleur',87.0,'2026-10-03','nfl-wheel-head-coach-grades-2026-10-03-v1','data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('HOU','Head Coach','demecoryans','DeMeco Ryans',88.0,'2026-10-03','nfl-wheel-head-coach-grades-2026-10-03-v1','data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('IND','Head Coach','shanesteichen','Shane Steichen',81.0,'2026-10-03','nfl-wheel-head-coach-grades-2026-10-03-v1','data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('JAX','Head Coach','liamcoen','Liam Coen',85.0,'2026-10-03','nfl-wheel-head-coach-grades-2026-10-03-v1','data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('KC','Head Coach','andyreid','Andy Reid',96.0,'2026-10-03','nfl-wheel-head-coach-grades-2026-10-03-v1','data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('LAC','Head Coach','jimharbaugh','Jim Harbaugh',90.0,'2026-10-03','nfl-wheel-head-coach-grades-2026-10-03-v1','data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('LAR','Head Coach','seanmcvay','Sean McVay',99.0,'2026-10-03','nfl-wheel-head-coach-grades-2026-10-03-v1','data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('LV','Head Coach','klintkubiak','Klint Kubiak',84.0,'2026-10-03','nfl-wheel-head-coach-grades-2026-10-03-v1','data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('MIA','Head Coach','jeffhafley','Jeff Hafley',77.0,'2026-10-03','nfl-wheel-head-coach-grades-2026-10-03-v1','data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('MIN','Head Coach','kevinoconnell','Kevin O''Connell',89.0,'2026-10-03','nfl-wheel-head-coach-grades-2026-10-03-v1','data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('NE','Head Coach','mikevrabel','Mike Vrabel',93.0,'2026-10-03','nfl-wheel-head-coach-grades-2026-10-03-v1','data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('NO','Head Coach','kellenmoore','Kellen Moore',82.0,'2026-10-03','nfl-wheel-head-coach-grades-2026-10-03-v1','data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('NYG','Head Coach','johnharbaugh','John Harbaugh',88.0,'2026-10-03','nfl-wheel-head-coach-grades-2026-10-03-v1','data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('NYJ','Head Coach','aaronglenn','Aaron Glenn',74.0,'2026-10-03','nfl-wheel-head-coach-grades-2026-10-03-v1','data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('PHI','Head Coach','nicksirianni','Nick Sirianni',83.0,'2026-10-03','nfl-wheel-head-coach-grades-2026-10-03-v1','data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('PIT','Head Coach','mikemccarthy','Mike McCarthy',84.0,'2026-10-03','nfl-wheel-head-coach-grades-2026-10-03-v1','data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('SEA','Head Coach','mikemacdonald','Mike Macdonald',98.0,'2026-10-03','nfl-wheel-head-coach-grades-2026-10-03-v1','data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('SF','Head Coach','kyleshanahan','Kyle Shanahan',97.0,'2026-10-03','nfl-wheel-head-coach-grades-2026-10-03-v1','data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('TB','Head Coach','toddbowles','Todd Bowles',80.0,'2026-10-03','nfl-wheel-head-coach-grades-2026-10-03-v1','data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('TEN','Head Coach','robertsaleh','Robert Saleh',78.0,'2026-10-03','nfl-wheel-head-coach-grades-2026-10-03-v1','data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('WSH','Head Coach','danquinn','Dan Quinn',82.0,'2026-10-03','nfl-wheel-head-coach-grades-2026-10-03-v1','data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json')
on conflict (team_code, position_group, name_key, effective_date) do update
set display_name = excluded.display_name,
    hidden_grade = excluded.hidden_grade,
    effective_date = excluded.effective_date,
    grade_version = excluded.grade_version,
    source_artifact = excluded.source_artifact;

create or replace function private.wheel_football_position_group(
  p_roster_slot text,
  p_position_abbreviation text
)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_slot text := trim(coalesce(p_roster_slot, ''));
  v_position text := upper(trim(coalesce(p_position_abbreviation, '')));
begin
  if v_slot = 'QB' then return 'QB'; end if;
  if v_slot = 'RB' then return 'RB'; end if;
  if v_slot = 'WR' then return 'WR'; end if;
  if v_slot = 'Front Seven' then return 'Front Seven'; end if;
  if v_slot = 'Secondary' then return 'Secondary'; end if;
  if v_slot = 'Head Coach' then return 'Head Coach'; end if;
  if v_slot = 'Flex' and v_position in ('RB','WR','TE') then return v_position; end if;
  raise exception 'Unsupported Wheel grade identity: slot %, position %', v_slot, v_position;
end;
$$;

create or replace function private.resolve_wheel_football_grade_snapshot(
  p_team_code text,
  p_display_name text,
  p_roster_slot text,
  p_position_abbreviation text
)
returns table (
  hidden_grade numeric,
  grade_version text,
  effective_date date
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_team text := upper(trim(coalesce(p_team_code, '')));
  v_group text := private.wheel_football_position_group(p_roster_slot, p_position_abbreviation);
  v_key text := private.wheel_football_grade_name_key(p_display_name);
begin
  return query
  select authority.hidden_grade, authority.grade_version, authority.effective_date
  from private.wheel_football_grade_authority authority
  where authority.team_code = v_team
    and authority.position_group = v_group
    and authority.name_key = v_key
    and authority.effective_date <= current_date
  order by authority.effective_date desc
  limit 1;

  if not found then
    raise exception
      'Missing locked Wheel grade for team %, group %, player %',
      v_team,
      v_group,
      trim(coalesce(p_display_name, ''));
  end if;
end;
$$;

alter table private.wheel_football_picks
  add column if not exists hidden_grade numeric(4,1),
  add column if not exists hidden_grade_version text,
  add column if not exists hidden_grade_effective_date date;

alter table private.wheel_football_picks
  drop constraint if exists wheel_football_pick_hidden_grade_range;

alter table private.wheel_football_picks
  add constraint wheel_football_pick_hidden_grade_range
  check (hidden_grade is null or hidden_grade between 0 and 100);

create or replace function private.assign_wheel_football_grade_snapshot()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_grade numeric;
  v_version text;
  v_effective_date date;
begin
  select snapshot.hidden_grade, snapshot.grade_version, snapshot.effective_date
    into v_grade, v_version, v_effective_date
  from private.resolve_wheel_football_grade_snapshot(
    new.team_code,
    new.display_name,
    new.roster_slot,
    new.position_abbreviation
  ) snapshot;

  new.hidden_grade := v_grade;
  new.hidden_grade_version := v_version;
  new.hidden_grade_effective_date := v_effective_date;
  return new;
end;
$$;

drop trigger if exists wheel_football_assign_grade_snapshot on private.wheel_football_picks;
create trigger wheel_football_assign_grade_snapshot
before insert on private.wheel_football_picks
for each row execute function private.assign_wheel_football_grade_snapshot();

-- Preserve already-finished v1 history exactly as it was, but bring any match that
-- is still live at rollout onto the locked grading runtime. Existing live picks are
-- snapshotted once here; later authority revisions never rewrite them.
do $wheel_active_backfill$
declare
  v_pick record;
  v_grade record;
begin
  for v_pick in
    select pick.id,
           pick.team_code,
           pick.display_name,
           pick.roster_slot,
           pick.position_abbreviation
    from private.wheel_football_picks pick
    join private.wheel_football_matches match
      on match.challenge_id = pick.challenge_id
    where match.phase <> 'complete'
      and pick.hidden_grade is null
  loop
    select *
      into v_grade
    from private.resolve_wheel_football_grade_snapshot(
      v_pick.team_code,
      v_pick.display_name,
      v_pick.roster_slot,
      v_pick.position_abbreviation
    );

    update private.wheel_football_picks pick
    set hidden_grade = v_grade.hidden_grade,
        hidden_grade_version = v_grade.grade_version,
        hidden_grade_effective_date = v_grade.effective_date
    where pick.id = v_pick.id
      and pick.hidden_grade is null;
  end loop;
end;
$wheel_active_backfill$;

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
      then round(avg(pick.hidden_grade)::numeric, 1)
    else null
  end
  from private.wheel_football_picks pick
  where pick.challenge_id = p_challenge_id
    and pick.profile_id = p_profile_id;
$$;

create or replace function private.wheel_football_final_grade(p_raw_grade numeric)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case
    when p_raw_grade is null then null
    else greatest(0, least(100, round((p_raw_grade * 5) - 380)::integer))
  end;
$$;

create or replace function private.enrich_completed_wheel_football_result()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_forfeited_at timestamptz;
  v_creator_raw numeric;
  v_recipient_raw numeric;
  v_creator_final integer;
  v_recipient_final integer;
begin
  if new.game_id <> 'wheel-football' or new.completed_at is null then
    return new;
  end if;

  if coalesce(new.creator_result ? 'finalGrade', false)
    and coalesce(new.responder_result ? 'finalGrade', false) then
    return new;
  end if;

  select match.forfeited_at
    into v_forfeited_at
  from private.wheel_football_matches match
  where match.challenge_id = new.id;

  if v_forfeited_at is not null then
    return new;
  end if;

  v_creator_raw := private.wheel_football_raw_grade(new.id, new.creator_id);
  v_recipient_raw := private.wheel_football_raw_grade(new.id, new.recipient_id);

  -- Pre-runtime historical matches keep their original v1 result instead of being
  -- retroactively graded. Only seven fully snapshotted picks produce a final grade.
  if v_creator_raw is null or v_recipient_raw is null then
    return new;
  end if;

  v_creator_final := private.wheel_football_final_grade(v_creator_raw);
  v_recipient_final := private.wheel_football_final_grade(v_recipient_raw);

  update public.play_challenges challenge
  set creator_result = coalesce(challenge.creator_result, '{}'::jsonb) || jsonb_build_object(
        'finalGrade', v_creator_final,
        'wheelGradeRuntimeVersion', 'nfl-wheel-locked-grades-v1'
      ),
      responder_result = coalesce(challenge.responder_result, '{}'::jsonb) || jsonb_build_object(
        'finalGrade', v_recipient_final,
        'wheelGradeRuntimeVersion', 'nfl-wheel-locked-grades-v1'
      )
  where challenge.id = new.id;

  return new;
end;
$$;

drop trigger if exists wheel_football_enrich_completed_result on public.play_challenges;
create trigger wheel_football_enrich_completed_result
after update of completed_at on public.play_challenges
for each row
when (new.game_id = 'wheel-football' and new.completed_at is not null)
execute function private.enrich_completed_wheel_football_result();

create or replace function private.wheel_football_state_json(p_challenge_id uuid)
returns jsonb
language sql
security definer
set search_path = ''
stable
as $$
  select jsonb_build_object(
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
        jsonb_build_object(
          'turn_number', pick.turn_number,
          'team_code', pick.team_code,
          'team_name', team.name,
          'roster_slot', pick.roster_slot,
          'athlete_id', pick.athlete_id,
          'display_name', pick.display_name,
          'position_label', pick.position_label,
          'position_abbreviation', pick.position_abbreviation,
          'headshot_url', pick.headshot_url
        )
        order by pick.turn_number
      )
      from private.wheel_football_picks pick
      join private.wheel_football_teams team on team.code = pick.team_code
      where pick.challenge_id = challenge.id
        and pick.profile_id = challenge.creator_id
    ), '[]'::jsonb),
    'recipient_roster', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'turn_number', pick.turn_number,
          'team_code', pick.team_code,
          'team_name', team.name,
          'roster_slot', pick.roster_slot,
          'athlete_id', pick.athlete_id,
          'display_name', pick.display_name,
          'position_label', pick.position_label,
          'position_abbreviation', pick.position_abbreviation,
          'headshot_url', pick.headshot_url
        )
        order by pick.turn_number
      )
      from private.wheel_football_picks pick
      join private.wheel_football_teams team on team.code = pick.team_code
      where pick.challenge_id = challenge.id
        and pick.profile_id = challenge.recipient_id
    ), '[]'::jsonb),
    'result', case
      when match.phase = 'complete'
        and match.forfeited_at is null
        and coalesce(challenge.creator_result ? 'finalGrade', false)
        and coalesce(challenge.responder_result ? 'finalGrade', false)
      then jsonb_build_object(
        'creator_final_grade', (challenge.creator_result ->> 'finalGrade')::integer,
        'recipient_final_grade', (challenge.responder_result ->> 'finalGrade')::integer,
        'winner_profile_id', case
          when (challenge.creator_result ->> 'finalGrade')::integer > (challenge.responder_result ->> 'finalGrade')::integer
            then challenge.creator_id
          when (challenge.responder_result ->> 'finalGrade')::integer > (challenge.creator_result ->> 'finalGrade')::integer
            then challenge.recipient_id
          else null
        end,
        'is_tie', (challenge.creator_result ->> 'finalGrade')::integer = (challenge.responder_result ->> 'finalGrade')::integer
      )
      else null
    end,
    'opened_at', challenge.opened_at,
    'completed_at', challenge.completed_at,
    'forfeited_by_profile_id', match.forfeited_by_profile_id,
    'forfeited_at', match.forfeited_at
  )
  from public.play_challenges challenge
  join private.wheel_football_matches match on match.challenge_id = challenge.id
  join public.profiles creator on creator.id = challenge.creator_id
  join public.profiles recipient on recipient.id = challenge.recipient_id
  left join private.wheel_football_teams pending on pending.code = match.pending_team_code
  where challenge.id = p_challenge_id;
$$;

revoke all on function private.wheel_football_grade_name_key(text) from public, anon, authenticated;
revoke all on function private.wheel_football_position_group(text,text) from public, anon, authenticated;
revoke all on function private.resolve_wheel_football_grade_snapshot(text,text,text,text) from public, anon, authenticated;
revoke all on function private.assign_wheel_football_grade_snapshot() from public, anon, authenticated;
revoke all on function private.wheel_football_raw_grade(uuid,uuid) from public, anon, authenticated;
revoke all on function private.wheel_football_final_grade(numeric) from public, anon, authenticated;
revoke all on function private.enrich_completed_wheel_football_result() from public, anon, authenticated;

comment on table private.wheel_football_grade_authority is
  'Private 626-entry NFL Wheel authority generated from the locked 2026-10-03 grade artifacts.';
comment on column private.wheel_football_picks.hidden_grade is
  'Frozen private grade snapshot taken when the pick is inserted; never returned by Wheel state/results.';
comment on function private.wheel_football_final_grade(numeric) is
  'Final-only presentation grade using the Weekly Superteam 5x separation curve with a 0-100 clamp.';
