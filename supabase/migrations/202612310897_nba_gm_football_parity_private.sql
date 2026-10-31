-- Private NBA GM parity patch; legacy V1 snapshots and prior V2 revisions remain untouched.
-- All transitions still require the existing owner gate and Football GM write guard.
-- These are deliberately fictional 7-man franchise salaries, NOT actual NBA contracts.
-- Source-verified birthdates cover 301 of 330 players. Remaining ages stay
-- unknown, with neutral fallback probabilities rather than invented ages.
-- Development ceilings/risk remain provisional, basketball-informed game models.

-- NBA API CommonPlayerInfo birthdates, matched by exact player ID and editorial identity.
-- PINNED SOURCE EasySportsApps/nba_api_25_26_data@f785bb34415b2bf4c80614dcfa4a305cc9969ee5
-- Matched 301/330 players; 29 missing remain NULL, never fabricated.
alter table private.nba_gm_dev_players add column if not exists verified_birth_date date;
update private.nba_gm_dev_players p set verified_birth_date=s.dob
from (values
  ('nba-gm-draft-aarongordon',date '1995-09-16'),
  ('nba-gm-draft-aaronnesmith',date '1999-10-16'),
  ('nba-gm-draft-aaronwiggins',date '1999-01-02'),
  ('nba-gm-draft-acebailey',date '2006-08-13'),
  ('nba-gm-draft-adembona',date '2003-03-28'),
  ('nba-gm-draft-ajgreen',date '1999-09-27'),
  ('nba-gm-draft-ajaymitchell',date '2002-06-25'),
  ('nba-gm-draft-alhorford',date '1986-06-03'),
  ('nba-gm-draft-alexcaruso',date '1994-02-28'),
  ('nba-gm-draft-alexandresarr',date '2005-04-26'),
  ('nba-gm-draft-alperensengun',date '2002-07-25'),
  ('nba-gm-draft-amenthompson',date '2003-01-30'),
  ('nba-gm-draft-andredrummond',date '1993-08-10'),
  ('nba-gm-draft-andrewnembhard',date '2000-01-16'),
  ('nba-gm-draft-andrewwiggins',date '1995-02-23'),
  ('nba-gm-draft-anferneesimons',date '1999-06-08'),
  ('nba-gm-draft-anthonyblack',date '2004-01-20'),
  ('nba-gm-draft-anthonydavis',date '1993-03-11'),
  ('nba-gm-draft-anthonyedwards',date '2001-08-05'),
  ('nba-gm-draft-asanewell',date '2005-10-05'),
  ('nba-gm-draft-ausarthompson',date '2003-01-30'),
  ('nba-gm-draft-austinreaves',date '1998-05-29'),
  ('nba-gm-draft-ayodosunmu',date '2000-01-17'),
  ('nba-gm-draft-bamadebayo',date '1997-07-18'),
  ('nba-gm-draft-baylorscheierman',date '2000-09-26'),
  ('nba-gm-draft-bensheppard',date '2001-07-16'),
  ('nba-gm-draft-bennedictmathurin',date '2002-06-19'),
  ('nba-gm-draft-bilalcoulibaly',date '2004-07-26'),
  ('nba-gm-draft-bobbyportis',date '1995-02-10'),
  ('nba-gm-draft-bogdanbogdanovic',date '1992-08-18'),
  ('nba-gm-draft-boneshyland',date '2000-09-14'),
  ('nba-gm-draft-brandinpodziemski',date '2003-02-25'),
  ('nba-gm-draft-brandoningram',date '1997-09-02'),
  ('nba-gm-draft-brandonmiller',date '2002-11-22'),
  ('nba-gm-draft-brandonwilliams',date '1999-11-22'),
  ('nba-gm-draft-bricesensabaugh',date '2003-10-30'),
  ('nba-gm-draft-brooklopez',date '1988-04-01'),
  ('nba-gm-draft-bubcarrington',date '2005-07-21'),
  ('nba-gm-draft-buddyhield',date '1992-12-17'),
  ('nba-gm-draft-cjmccollum',date '1991-09-19'),
  ('nba-gm-draft-cadecunningham',date '2001-09-25'),
  ('nba-gm-draft-camspencer',date '2000-04-06'),
  ('nba-gm-draft-camwhitmore',date '2004-07-08'),
  ('nba-gm-draft-cameronjohnson',date '1996-03-03'),
  ('nba-gm-draft-carterbryant',date '2005-11-26'),
  ('nba-gm-draft-casonwallace',date '2003-11-07'),
  ('nba-gm-draft-cedriccoward',date '2003-09-11'),
  ('nba-gm-draft-chetholmgren',date '2002-05-01'),
  ('nba-gm-draft-christianbraun',date '2001-04-17'),
  ('nba-gm-draft-clintcapela',date '1994-05-18'),
  ('nba-gm-draft-collingillespie',date '1999-06-25'),
  ('nba-gm-draft-collinmurrayboyles',date '2005-06-10'),
  ('nba-gm-draft-collinsexton',date '1999-01-04'),
  ('nba-gm-draft-cooperflagg',date '2006-12-21'),
  ('nba-gm-draft-coreykispert',date '1999-03-03'),
  ('nba-gm-draft-craigporter',date '2000-02-26'),
  ('nba-gm-draft-danielgafford',date '1998-10-01'),
  ('nba-gm-draft-danissjenkins',date '2001-08-17'),
  ('nba-gm-draft-dariusgarland',date '2000-01-26'),
  ('nba-gm-draft-davionmitchell',date '1998-09-05'),
  ('nba-gm-draft-dayronsharpe',date '2001-11-06'),
  ('nba-gm-draft-deaaronfox',date '1997-12-20'),
  ('nba-gm-draft-deandrehunter',date '1997-12-02'),
  ('nba-gm-draft-deanthonymelton',date '1998-05-28'),
  ('nba-gm-draft-deanwade',date '1996-11-20'),
  ('nba-gm-draft-deandreayton',date '1998-07-23'),
  ('nba-gm-draft-dejountemurray',date '1996-09-19'),
  ('nba-gm-draft-demarderozan',date '1989-08-07'),
  ('nba-gm-draft-deniavdija',date '2001-01-03'),
  ('nba-gm-draft-dennisschroder',date '1993-09-15'),
  ('nba-gm-draft-derecklively',date '2004-02-12'),
  ('nba-gm-draft-derikqueen',date '2004-12-27'),
  ('nba-gm-draft-derrickjones',date '1997-02-15'),
  ('nba-gm-draft-derrickwhite',date '1994-07-02'),
  ('nba-gm-draft-desmondbane',date '1998-06-25'),
  ('nba-gm-draft-devinbooker',date '1996-10-30'),
  ('nba-gm-draft-devinvassell',date '2000-08-23'),
  ('nba-gm-draft-dillonbrooks',date '1996-01-22'),
  ('nba-gm-draft-domantassabonis',date '1996-05-03'),
  ('nba-gm-draft-donovanclingan',date '2004-02-23'),
  ('nba-gm-draft-donovanmitchell',date '1996-09-07'),
  ('nba-gm-draft-dontedivincenzo',date '1997-01-31'),
  ('nba-gm-draft-dorianfinneysmith',date '1993-05-04'),
  ('nba-gm-draft-draymondgreen',date '1990-03-04'),
  ('nba-gm-draft-drusmith',date '1997-12-30'),
  ('nba-gm-draft-duncanrobinson',date '1994-04-22'),
  ('nba-gm-draft-dylanharper',date '2006-03-02'),
  ('nba-gm-draft-dysondaniels',date '2003-03-17'),
  ('nba-gm-draft-egordemin',date '2006-03-03'),
  ('nba-gm-draft-evanmobley',date '2001-06-18'),
  ('nba-gm-draft-franzwagner',date '2001-08-27'),
  ('nba-gm-draft-garypayton',date '1992-12-01'),
  ('nba-gm-draft-ggjackson',date '2004-12-17'),
  ('nba-gm-draft-giannisantetokounmpo',date '1994-12-06'),
  ('nba-gm-draft-gogabitadze',date '1999-07-20'),
  ('nba-gm-draft-gradeydick',date '2003-11-20'),
  ('nba-gm-draft-graysonallen',date '1995-10-08'),
  ('nba-gm-draft-guisantos',date '2002-06-22'),
  ('nba-gm-draft-harrisonbarnes',date '1992-05-30'),
  ('nba-gm-draft-herbjones',date '1998-10-06'),
  ('nba-gm-draft-hugogonzalez',date '2006-02-05'),
  ('nba-gm-draft-immanuelquickley',date '1999-06-17'),
  ('nba-gm-draft-isaacokoro',date '2001-01-26'),
  ('nba-gm-draft-isaiahcollier',date '2004-10-08'),
  ('nba-gm-draft-isaiahhartenstein',date '1998-05-05'),
  ('nba-gm-draft-isaiahjackson',date '2002-01-10'),
  ('nba-gm-draft-isaiahjoe',date '1999-07-02'),
  ('nba-gm-draft-isaiahstewart',date '2001-05-22'),
  ('nba-gm-draft-ivicazubac',date '1997-03-18'),
  ('nba-gm-draft-jamorant',date '1999-08-10'),
  ('nba-gm-draft-jakobewalter',date '2004-09-04'),
  ('nba-gm-draft-jabarismith',date '2003-05-13'),
  ('nba-gm-draft-jabariwalker',date '2002-07-30'),
  ('nba-gm-draft-jadenmcdaniels',date '2000-09-29'),
  ('nba-gm-draft-jaimejaquez',date '2001-02-18'),
  ('nba-gm-draft-jakelaravia',date '2001-11-03'),
  ('nba-gm-draft-jakobpoeltl',date '1995-10-15'),
  ('nba-gm-draft-jalenbrunson',date '1996-08-31'),
  ('nba-gm-draft-jalenduren',date '2003-11-18'),
  ('nba-gm-draft-jalengreen',date '2002-02-09'),
  ('nba-gm-draft-jalenjohnson',date '2001-12-18'),
  ('nba-gm-draft-jalensmith',date '2000-03-16'),
  ('nba-gm-draft-jalensuggs',date '2001-06-03'),
  ('nba-gm-draft-jalenwilliams',date '2001-04-14'),
  ('nba-gm-draft-jamalmurray',date '1997-02-23'),
  ('nba-gm-draft-jamalshead',date '2002-07-24'),
  ('nba-gm-draft-jamesharden',date '1989-08-26'),
  ('nba-gm-draft-jamisonbattle',date '2001-05-10'),
  ('nba-gm-draft-jaracewalker',date '2003-09-04'),
  ('nba-gm-draft-jaredmccain',date '2004-02-20'),
  ('nba-gm-draft-jarenjackson',date '1999-09-15'),
  ('nba-gm-draft-jarredvanderbilt',date '1999-04-03'),
  ('nba-gm-draft-jarrettallen',date '1998-04-21'),
  ('nba-gm-draft-jaserichardson',date '2005-10-16'),
  ('nba-gm-draft-javontegreen',date '1993-07-23'),
  ('nba-gm-draft-jaxsonhayes',date '2000-05-23'),
  ('nba-gm-draft-jaylenbrown',date '1996-10-24'),
  ('nba-gm-draft-jaylenclark',date '2001-10-13'),
  ('nba-gm-draft-jaylenwells',date '2003-08-26'),
  ('nba-gm-draft-jaylinwilliams',date '2002-06-29'),
  ('nba-gm-draft-jaylontyson',date '2002-12-02'),
  ('nba-gm-draft-jaysontatum',date '1998-03-03'),
  ('nba-gm-draft-jeramigrant',date '1994-03-12'),
  ('nba-gm-draft-jeremiahfears',date '2006-10-14'),
  ('nba-gm-draft-jevoncarter',date '1995-09-14'),
  ('nba-gm-draft-jimmybutler',date '1989-09-14'),
  ('nba-gm-draft-joanberinger',date '2006-11-11'),
  ('nba-gm-draft-jocklandale',date '1995-10-25'),
  ('nba-gm-draft-joelembiid',date '1994-03-16'),
  ('nba-gm-draft-johncollins',date '1997-09-23'),
  ('nba-gm-draft-jonathankuminga',date '2002-10-06'),
  ('nba-gm-draft-jordangoodwin',date '1998-10-23'),
  ('nba-gm-draft-jordanpoole',date '1999-06-19'),
  ('nba-gm-draft-jordanwalsh',date '2004-03-03'),
  ('nba-gm-draft-josealvarado',date '1998-04-12'),
  ('nba-gm-draft-joshgiddey',date '2002-10-10'),
  ('nba-gm-draft-joshgreen',date '2000-11-16'),
  ('nba-gm-draft-joshhart',date '1995-03-06'),
  ('nba-gm-draft-joshokogie',date '1998-09-01'),
  ('nba-gm-draft-jrueholiday',date '1990-06-12'),
  ('nba-gm-draft-julianchampagnie',date '2001-06-29'),
  ('nba-gm-draft-julianstrawther',date '2002-04-18'),
  ('nba-gm-draft-juliusrandle',date '1994-11-29'),
  ('nba-gm-draft-justinchampagnie',date '2001-06-29'),
  ('nba-gm-draft-jusufnurkic',date '1994-08-23'),
  ('nba-gm-draft-karlanthonytowns',date '1995-11-15'),
  ('nba-gm-draft-kasparasjakucionis',date '2006-05-29'),
  ('nba-gm-draft-kawhileonard',date '1991-06-29'),
  ('nba-gm-draft-keeganmurray',date '2000-08-19'),
  ('nba-gm-draft-kelelware',date '2004-04-20'),
  ('nba-gm-draft-keldonjohnson',date '1999-10-11'),
  ('nba-gm-draft-kellyoubre',date '1995-12-09'),
  ('nba-gm-draft-kenrichwilliams',date '1994-12-02'),
  ('nba-gm-draft-kentaviouscaldwellpope',date '1993-02-18'),
  ('nba-gm-draft-keonellis',date '2000-01-08'),
  ('nba-gm-draft-kevindurant',date '1988-09-29'),
  ('nba-gm-draft-kevinhuerter',date '1998-08-27'),
  ('nba-gm-draft-keyontegeorge',date '2003-11-08'),
  ('nba-gm-draft-khamanmaluach',date '2006-09-14'),
  ('nba-gm-draft-khrismiddleton',date '1991-08-12'),
  ('nba-gm-draft-klaythompson',date '1990-02-08'),
  ('nba-gm-draft-konknueppel',date '2005-08-03'),
  ('nba-gm-draft-krisdunn',date '1994-03-18'),
  ('nba-gm-draft-kristapsporzingis',date '1995-08-02'),
  ('nba-gm-draft-kylekuzma',date '1995-07-24'),
  ('nba-gm-draft-kyshawngeorge',date '2003-12-12'),
  ('nba-gm-draft-lameloball',date '2001-08-22'),
  ('nba-gm-draft-landryshamet',date '1997-03-13'),
  ('nba-gm-draft-laurimarkkanen',date '1997-05-22'),
  ('nba-gm-draft-lebronjames',date '1984-12-30'),
  ('nba-gm-draft-leonardmiller',date '2003-11-26'),
  ('nba-gm-draft-luguentzdort',date '1999-04-19'),
  ('nba-gm-draft-lukadoncic',date '1999-02-28'),
  ('nba-gm-draft-lukagarza',date '1998-12-27'),
  ('nba-gm-draft-lukekennard',date '1996-06-24'),
  ('nba-gm-draft-lukekornet',date '1995-07-15'),
  ('nba-gm-draft-malikmonk',date '1998-02-04'),
  ('nba-gm-draft-marcussasser',date '2000-09-21'),
  ('nba-gm-draft-marcussmart',date '1994-03-06'),
  ('nba-gm-draft-markwilliams',date '2001-12-16'),
  ('nba-gm-draft-marvinbagley',date '1999-03-14'),
  ('nba-gm-draft-matasbuzelis',date '2004-10-13'),
  ('nba-gm-draft-matissethybulle',date '1997-03-04'),
  ('nba-gm-draft-maxchristie',date '2003-02-10'),
  ('nba-gm-draft-maximeraynaud',date '2003-04-07'),
  ('nba-gm-draft-micahpotter',date '1998-04-06'),
  ('nba-gm-draft-michaelporter',date '1998-06-29'),
  ('nba-gm-draft-mikalbridges',date '1996-08-30'),
  ('nba-gm-draft-mikeconley',date '1987-10-11'),
  ('nba-gm-draft-milesbridges',date '1998-03-21'),
  ('nba-gm-draft-milesmcbride',date '2000-09-08'),
  ('nba-gm-draft-mitchellrobinson',date '1998-04-01'),
  ('nba-gm-draft-mobamba',date '1998-05-12'),
  ('nba-gm-draft-moritzwagner',date '1997-04-26'),
  ('nba-gm-draft-mosesmoody',date '2002-05-31'),
  ('nba-gm-draft-moussadiabate',date '2002-01-21'),
  ('nba-gm-draft-mylesturner',date '1996-03-24'),
  ('nba-gm-draft-najimarshall',date '1998-01-24'),
  ('nba-gm-draft-nazreid',date '1999-08-26'),
  ('nba-gm-draft-neemiasqueta',date '1999-07-13'),
  ('nba-gm-draft-nickeilalexanderwalker',date '1998-09-02'),
  ('nba-gm-draft-nikolajokic',date '1995-02-19'),
  ('nba-gm-draft-niqueclifford',date '2002-02-09'),
  ('nba-gm-draft-noaessengue',date '2006-12-18'),
  ('nba-gm-draft-noahclowney',date '2004-07-14'),
  ('nba-gm-draft-nolantraore',date '2006-05-28'),
  ('nba-gm-draft-normanpowell',date '1993-05-25'),
  ('nba-gm-draft-obitoppin',date '1998-03-04'),
  ('nba-gm-draft-oganunoby',date '1997-07-17'),
  ('nba-gm-draft-onyekaokongwu',date '2000-12-11'),
  ('nba-gm-draft-oscartshiebwe',date '1999-11-27'),
  ('nba-gm-draft-osoighodaro',date '2002-07-14'),
  ('nba-gm-draft-pjwashington',date '1998-08-23'),
  ('nba-gm-draft-paolobanchero',date '2002-11-12'),
  ('nba-gm-draft-pascalsiakam',date '1994-04-02'),
  ('nba-gm-draft-paulgeorge',date '1990-05-02'),
  ('nba-gm-draft-paulreed',date '1999-06-14'),
  ('nba-gm-draft-paytonpritchard',date '1998-01-28'),
  ('nba-gm-draft-pellelarsson',date '2001-02-23'),
  ('nba-gm-draft-peytonwatson',date '2002-09-11'),
  ('nba-gm-draft-preciousachiuwa',date '1999-09-19'),
  ('nba-gm-draft-quentingrimes',date '2000-05-08'),
  ('nba-gm-draft-quentonjackson',date '1998-09-15'),
  ('nba-gm-draft-reedsheppard',date '2004-06-24'),
  ('nba-gm-draft-rjbarrett',date '2000-06-14'),
  ('nba-gm-draft-robertwilliams',date '1997-10-17'),
  ('nba-gm-draft-ronaldholland',date '2005-07-07'),
  ('nba-gm-draft-royceoneale',date '1993-06-05'),
  ('nba-gm-draft-rudygobert',date '1992-06-26'),
  ('nba-gm-draft-ruihachimura',date '1998-02-08'),
  ('nba-gm-draft-ryankalkbrenner',date '2002-01-17'),
  ('nba-gm-draft-ryanrollins',date '2002-07-03'),
  ('nba-gm-draft-saddiqbey',date '1999-04-09'),
  ('nba-gm-draft-samhauser',date '1997-12-08'),
  ('nba-gm-draft-sammerrill',date '1996-05-15'),
  ('nba-gm-draft-sandromamukelashvili',date '1999-05-23'),
  ('nba-gm-draft-santialdama',date '2001-01-10'),
  ('nba-gm-draft-scoothenderson',date '2004-02-03'),
  ('nba-gm-draft-scottiebarnes',date '2001-08-01'),
  ('nba-gm-draft-scottypippen',date '2000-11-10'),
  ('nba-gm-draft-shaedonsharpe',date '2003-05-30'),
  ('nba-gm-draft-shaigilgeousalexander',date '1998-07-12'),
  ('nba-gm-draft-sidycissoko',date '2004-04-02'),
  ('nba-gm-draft-sionjames',date '2002-12-04'),
  ('nba-gm-draft-stephencurry',date '1988-03-14'),
  ('nba-gm-draft-stephoncastle',date '2004-11-01'),
  ('nba-gm-draft-stevenadams',date '1993-07-20'),
  ('nba-gm-draft-tjmcconnell',date '1992-03-25'),
  ('nba-gm-draft-tarieason',date '2001-05-10'),
  ('nba-gm-draft-terrenceshannon',date '2000-07-30'),
  ('nba-gm-draft-tidjanesalaun',date '2005-08-10'),
  ('nba-gm-draft-timhardaway',date '1992-03-16'),
  ('nba-gm-draft-tobiasharris',date '1992-07-15'),
  ('nba-gm-draft-toumanicamara',date '2000-05-08'),
  ('nba-gm-draft-traeyoung',date '1998-09-19'),
  ('nba-gm-draft-traycejacksondavis',date '2000-02-22'),
  ('nba-gm-draft-trejohnson',date '2006-03-07'),
  ('nba-gm-draft-trejones',date '2000-01-08'),
  ('nba-gm-draft-tremann',date '2001-02-03'),
  ('nba-gm-draft-treymurphy',date '2000-06-18'),
  ('nba-gm-draft-tristandasilva',date '2001-05-15'),
  ('nba-gm-draft-tyjerome',date '1997-07-08'),
  ('nba-gm-draft-tylerherro',date '2000-01-20'),
  ('nba-gm-draft-tylerkolek',date '2001-03-27'),
  ('nba-gm-draft-tyresemaxey',date '2000-11-04'),
  ('nba-gm-draft-tyreseproctor',date '2004-04-01'),
  ('nba-gm-draft-tyusjones',date '1996-05-10'),
  ('nba-gm-draft-victorwembanyama',date '2004-01-04'),
  ('nba-gm-draft-vitkrejci',date '2000-06-19'),
  ('nba-gm-draft-vjedgecombe',date '2005-07-30'),
  ('nba-gm-draft-walkerkessler',date '2001-07-26'),
  ('nba-gm-draft-wendellcarter',date '1999-04-16'),
  ('nba-gm-draft-willrichard',date '2002-12-24'),
  ('nba-gm-draft-yanghansen',date '2005-06-26'),
  ('nba-gm-draft-yvesmissi',date '2004-05-14'),
  ('nba-gm-draft-zaccharierisacher',date '2005-04-08'),
  ('nba-gm-draft-zachedey',date '2002-05-14'),
  ('nba-gm-draft-zachlavine',date '1995-03-10'),
  ('nba-gm-draft-zekennaji',date '2001-01-09'),
  ('nba-gm-draft-ziairewilliams',date '2001-09-12'),
  ('nba-gm-draft-zionwilliamson',date '2000-07-06')
) s(player_id,dob) where p.id=s.player_id;

-- Intentional contract tiers replace opaque MD5 assignment. High-salary stars
-- receive repricing exposure; established impact players can secure a 3YR lock;
-- rotation/depth contracts alternate by graded game role (not real NBA terms).
create or replace function private.nba_gm_v3_contract(p_id text)
returns text language sql stable security definer set search_path='' as $$
  select case when p.overall >=95 then '1YR'
    when p.overall between 88 and 94 then '3YR'
    when p.overall between 81 and 87 then '1YR'
    when p.overall<=78 then '1YR' else '3YR' end
  from private.nba_gm_dev_players p where p.id=p_id;
$$;
revoke all on function private.nba_gm_v3_contract(text) from public,anon,authenticated;

-- Earlier V2 saves retain their original MD5-term agreements and cap.
create or replace function private.nba_gm_v3_contract_for_state(p_state jsonb,p_id text)
returns text language sql stable security definer set search_path='' as $$
  select case when p_state->>'economyVersion'='3' then private.nba_gm_v3_contract(p_id)
    else private.nba_gm_v2_contract(p_id) end;
$$;
revoke all on function private.nba_gm_v3_contract_for_state(jsonb,text) from public,anon,authenticated;

create or replace function private.nba_gm_v3_grade(p_state jsonb,p_id text,p_year integer)
returns numeric language plpgsql stable security definer set search_path='' as $$
declare
  v_player private.nba_gm_dev_players%rowtype;
  v_grade numeric;v_roll numeric;v_magnitude numeric;v_delta numeric;
  v_step integer;v_up numeric;v_down numeric;v_risk numeric;v_breakout numeric;
  v_prior numeric;v_age integer;v_ceiling numeric;
begin
  select * into v_player from private.nba_gm_dev_players where id=p_id;
  if not found then raise exception 'Unknown NBA GM player'; end if;
  v_grade:=v_player.overall;
  if p_year<=1 or p_state->>'economyVersion' is distinct from '3' then return v_grade; end if;
  for v_step in 2..least(3,p_year) loop
    v_roll:=(abs(('x'||substr(md5(p_state->>'seed'||':'||p_id||':'||v_step||':outcome'),1,8))::bit(32)::int::bigint)%10000)::numeric/10000;
    v_magnitude:=(abs(('x'||substr(md5(p_state->>'seed'||':'||p_id||':'||v_step||':size'),1,8))::bit(32)::int::bigint)%10000)::numeric/10000;
    v_prior:=v_grade-v_player.overall;
    v_age:=case when v_player.verified_birth_date is not null then
      extract(year from age(date '2026-10-30',v_player.verified_birth_date))::integer+v_step-1
      else null end;
    -- High skill outliers have specialist upside; elite grade headroom is narrow.
    v_up:=least(5.8,greatest(1.5,(99-v_grade)*0.36)
      +case when greatest((v_player.skills->>'scoring')::integer,
        (v_player.skills->>'shooting')::integer,
        (v_player.skills->>'playmaking')::integer,
        (v_player.skills->>'perimeterDefense')::integer,
        (v_player.skills->>'interiorDefense')::integer,
        (v_player.skills->>'rebounding')::integer)>v_player.overall+7 then 0.6 else 0 end);
    -- Age-aware NBA upside and aging pressure. Unknown ages remain neutral.
    v_ceiling:=least(99,v_player.overall
      +case when v_age is null then 6 when v_age<=23 then 10
        when v_age<=26 then 7 when v_age<=29 then 4
        when v_age<=32 then 2 else .8 end
      +case when greatest((v_player.skills->>'scoring')::integer,
          (v_player.skills->>'shooting')::integer,
          (v_player.skills->>'playmaking')::integer,
          (v_player.skills->>'perimeterDefense')::integer,
          (v_player.skills->>'interiorDefense')::integer,
          (v_player.skills->>'rebounding')::integer)>v_player.overall+7
        then .7 else 0 end);
    v_up:=least(v_up,greatest(0,v_ceiling-v_grade));
    v_down:=case when v_player.overall>=92 then 3.1 else 4.6 end;
    v_breakout:=least(.3,(case when v_grade>=94 then .025 when v_grade>=87 then .075 else .13 end
      +case when v_age is null then 0 when v_age<=22 then .12
        when v_age<=25 then .07 when v_age<=28 then .02 else 0 end)
      *case when v_prior>3 then .42 else 1 end);
    v_risk:=least(.56,case when v_player.overall>=94 then .16 when v_player.overall>=84 then .26 else .33 end
      +case when v_age is null then 0 when v_age>=35 then .23
        when v_age>=32 then .13 when v_age>=29 then .04 else -.035 end
      +case when v_prior>3 then .07 else 0 end
      +case when 'availability-separate'=any(v_player.review_flags) then .035 else 0 end);
    if v_roll < v_breakout then
      v_delta:=v_up*(.67+.33*v_magnitude);
    elsif v_roll < v_breakout+.32 then
      v_delta:=least(v_up*.7,.85+1.5*v_magnitude);
    elsif v_roll < 1-v_risk then
      v_delta:=(v_magnitude-.5)*.95;
    elsif v_roll < 1-v_risk*.27 then
      v_delta:=-(.9+1.3*v_magnitude);
    else
      v_delta:=-(2.6+(v_down-2.6)*v_magnitude);
    end if;
    v_grade:=round(greatest(58,least(99,v_grade+v_delta)),2);
  end loop;
  return v_grade;
end;
$$;
revoke all on function private.nba_gm_v3_grade(jsonb,text,integer) from public,anon,authenticated;

-- Repricing follows resolved grade change; 3YR stays EXACTLY locked.
-- Values are game contracts. Failure/markup behavior can be revised with
-- sourced evidence without rewriting immutable past run snapshots.
create or replace function private.nba_gm_v3_salary(p_state jsonb,p_id text,p_year integer)
returns bigint language plpgsql stable security definer set search_path='' as $$
declare v_player private.nba_gm_dev_players%rowtype;v_delta numeric;v_factor numeric;
begin
  select * into v_player from private.nba_gm_dev_players where id=p_id;
  if not found then raise exception 'Unknown NBA GM player'; end if;
  if p_state->>'economyVersion' is distinct from '3' then
    return private.nba_gm_v2_salary(p_id,p_year); end if;
  if p_year<=1 or private.nba_gm_v3_contract(p_id)='3YR' then return v_player.salaries[1]; end if;
  if coalesce(p_state->>'phase','draft') in ('draft','year1') then
    return v_player.salaries[greatest(1,least(3,p_year))]; end if;
  v_delta:=private.nba_gm_v3_grade(p_state,p_id,p_year)-v_player.overall;
  v_factor:=greatest(.66,least(2.0,power(1.105::numeric,v_delta)
    *(case when p_year=2 then 1.065 else 1.12 end)));
  return greatest(2500000,round(v_player.salaries[1]*v_factor/100000)*100000)::bigint;
end;
$$;
revoke all on function private.nba_gm_v3_salary(jsonb,text,integer) from public,anon,authenticated;

create or replace function private.nba_gm_v3_development_report(p_state jsonb,p_picks jsonb)
returns jsonb language sql stable security definer set search_path='' as $$
  select coalesce(jsonb_object_agg(pick->>'playerId',jsonb_build_object(
    'year2Grade',private.nba_gm_v3_grade(p_state,pick->>'playerId',2),
    'year3Grade',private.nba_gm_v3_grade(p_state,pick->>'playerId',3),
    'year2Salary',private.nba_gm_v3_salary(p_state,pick->>'playerId',2),
    'year3Salary',private.nba_gm_v3_salary(p_state,pick->>'playerId',3),
    'startingGrade',p.overall
  )),'{}'::jsonb)
  from jsonb_array_elements(p_picks) pick
  join private.nba_gm_dev_players p on p.id=pick->>'playerId';
$$;
revoke all on function private.nba_gm_v3_development_report(jsonb,jsonb) from public,anon,authenticated;

-- NBA playoff outcomes and 82-game records; current simulation uncertainty is
-- provisional; grade-to-skill mapping is NOT a historically fitted lineup model.
create or replace function private.nba_gm_v2_can_add(p_state jsonb,p_id text)
returns boolean language plpgsql stable security definer set search_path='' as $$
declare
  v_arranged jsonb;
  v_year integer;
  v_spend bigint;
  v_reserve bigint;
  v_min bigint;
  v_slot text;
  v_reserved_ids text[]:=array[]::text[];
  v_filler_id text;
  v_open text[]:=array['PG','SG','SF','PF','C','GUARD','BIG'];
  v_phase text:=p_state->>'phase';
begin
  v_arranged:=private.nba_gm_v2_assign(p_state->'picks',p_id);
  if v_arranged is null then return false; end if;
  -- A separate eligible player must backstop every open roster role. Reserve
  -- the maximum salary for each chosen filler across all three game years.
  -- Previously, per-role minima reused the same cheap wing/big multiple times.
  v_reserve:=0;
  if v_phase='draft' then
    foreach v_slot in array v_open loop
      if exists(select 1 from jsonb_array_elements(v_arranged) pick where pick->>'slot'=v_slot)
        then continue; end if;
      select p.id,case when private.nba_gm_v3_contract_for_state(p_state,p.id)='3YR'
        then p.salaries[1] else greatest(p.salaries[1],p.salaries[2],p.salaries[3]) end
      into v_filler_id,v_min
      from private.nba_gm_dev_players p
      where p.id not in (select pick->>'playerId' from jsonb_array_elements(v_arranged) pick)
        and not (p.id=any(v_reserved_ids))
        and (v_slot=any(p.positions)
          or (v_slot='GUARD' and p.positions && array['PG','SG'])
          or (v_slot='BIG' and p.positions && array['PF','C']))
      order by case when private.nba_gm_v3_contract_for_state(p_state,p.id)='3YR'
        then p.salaries[1] else greatest(p.salaries[1],p.salaries[2],p.salaries[3]) end,p.id
      limit 1;
      if v_filler_id is null then return false; end if;
      v_reserved_ids:=array_append(v_reserved_ids,v_filler_id);
      v_reserve:=v_reserve+v_min;
    end loop;
  end if;
  for v_year in 1..3 loop
    if v_phase='offseason' and v_year=1 then continue; end if;
    select coalesce(sum(private.nba_gm_v3_salary(p_state,pick->>'playerId',v_year)),0)
      into v_spend from jsonb_array_elements(v_arranged) pick;
    if v_spend+v_reserve > (p_state->'caps'->>(v_year-1))::bigint then return false; end if;
  end loop;
  return true;
end;
$$;
revoke all on function private.nba_gm_v2_can_add(jsonb,text) from public,anon,authenticated;


create or replace function private.nba_gm_v2_season(p_state jsonb,p_year integer)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare
  v_off numeric;v_def numeric;v_fit numeric;v_floor numeric;
  v_noise integer;v_wins integer;v_finish text;v_estimated_net numeric;
  v_roll integer;v_cutoff integer;v_round integer;
  v_turnover integer:=coalesce(jsonb_array_length(p_state->'releasedIds'),0)
     +coalesce((p_state->>'tradesUsed')::integer,0);
begin
  select
    sum((((p.skills->>'scoring')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall)*.33+((p.skills->>'shooting')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall)*.25
        +((p.skills->>'playmaking')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall)*.27+((p.skills->>'rebounding')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall)*.10
        +((p.skills->>'interiorDefense')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall)*.05)
      *case when pick->>'slot' in ('GUARD','BIG') then .55 else 1 end)/6.1,
    sum((((p.skills->>'perimeterDefense')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall)
        *case when pick->>'slot' in ('PG','SG','SF','GUARD') then .57 else .30 end
      +((p.skills->>'interiorDefense')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall)
        *case when pick->>'slot' in ('C','PF','BIG') then .55 else .23 end
      +((p.skills->>'rebounding')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall)*.18)
      /case when pick->>'slot' in ('PG','SG','SF','GUARD') then .98 else 1.03 end
      *case when pick->>'slot' in ('GUARD','BIG') then .55 else 1 end)/6.1,
    sum(case when pick->>'slot'='PG' then ((p.skills->>'playmaking')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall)*.35
      when pick->>'slot'='C' then (((p.skills->>'interiorDefense')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall)
        +((p.skills->>'rebounding')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall))*.175
      when pick->>'slot' in ('SG','SF') then (((p.skills->>'shooting')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall)
        +((p.skills->>'perimeterDefense')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall))*.175
      when pick->>'slot'='PF' then (((p.skills->>'interiorDefense')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall)
        +((p.skills->>'rebounding')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall))*.175 else 0 end)/5,
    min(case when pick->>'slot' in ('PG','SG','SF','PF','C')
      then least(((p.skills->>'scoring')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall),((p.skills->>'perimeterDefense')::numeric + private.nba_gm_v3_grade(p_state,p.id,p_year) - p.overall)+10)
      else 99 end)
  into v_off,v_def,v_fit,v_floor
  from jsonb_array_elements(p_state->'picks') pick
  join private.nba_gm_dev_players p on p.id=pick->>'playerId';
  if v_off is null or v_def is null
     or jsonb_array_length(p_state->'picks')<>7 then raise exception 'NBA rotation incomplete'; end if;
  v_noise:=(abs(('x'||substr(md5(p_state->>'seed'||':'||p_year),1,8))::bit(32)::int::bigint)%11)::integer-5;
  -- The 150 historical team-seasons establish W = 40.9983 + 2.2684
  -- times OBSERVED net rating on a 2025–26 walk-forward holdout.
  -- The seven-athlete skill -> estimated net rating mapping below remains
  -- an explicitly PROVISIONAL game assumption, not a fitted lineup forecast.
  v_estimated_net:=(v_off-78)*.529+(v_def-78)*.463
    +(v_fit-27)*.154+least(0,(v_floor-65))*.088
    -case when p_year=1 then 0 else greatest(0,v_turnover-2)*.353 end;
  v_wins:=greatest(8,least(74,round(
    40.9983+2.2684*v_estimated_net+v_noise
  )::integer));
  -- A 53-win Denver team won in 2023; a 64+ win season must not
  -- guarantee a title. This PRIVATE playoff model is a deterministic,
  -- seed-driven variance fixture, NOT a fitted 150-team NBA estimate.
  -- Each advancement roll is independent of the regular-season win noise.
  v_finish:='Missed Playoffs';
  v_roll:=(abs(('x'||substr(md5(p_state->>'seed'||':'||p_year||':entry'),1,8))
    ::bit(32)::int::bigint)%1000)::integer;
  if v_wins>=47 or (v_wins>=36 and
    v_roll<greatest(0,least(950,(v_wins-34)*80))) then
    v_finish:='First Round';
    for v_round in 1..4 loop
      v_roll:=(abs(('x'||substr(md5(p_state->>'seed'||':'||p_year||':playoff:'||v_round),1,8))
        ::bit(32)::int::bigint)%1000)::integer;
      v_cutoff:=greatest(75,least(890,470+(v_wins-47)*15-(v_round-1)*25));
      exit when v_roll>=v_cutoff;
      v_finish:=case v_round when 1 then 'Conference Semifinals'
        when 2 then 'Conference Finals' when 3 then 'Finals' else 'Champion' end;
    end loop;
  end if;
  return jsonb_build_object('season',p_year,'wins',v_wins,'losses',82-v_wins,
    'offense',round(v_off,1),'defense',round(v_def,1),
    'positionalFit',round(v_fit,1),'finish',v_finish);
end;
$$;
revoke all on function private.nba_gm_v2_season(jsonb,integer) from public,anon,authenticated;


-- Mirror the approved Football 90/3/7 roster, record and playoff philosophy.
-- A 7-player, 82-game NBA model has its own grade ladder; no dynasty bonus.
create or replace function private.nba_gm_v3_final_score(p_state jsonb)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare
 v_roster numeric:=0;v_record numeric:=0;v_playoff numeric:=0;
 v_grade numeric;v_year integer;v_finish text;v_ovr numeric;
 v_team numeric;v_score numeric;
begin
 if jsonb_array_length(p_state->'results')<>3
   or jsonb_array_length(p_state->'picks')<>7 then
   raise exception 'Final score requires a complete 3-season franchise';
 end if;
 for v_year in 1..3 loop
   select avg(private.nba_gm_v3_grade(p_state,pick->>'playerId',v_year)*
     case when pick->>'slot' in ('GUARD','BIG') then .84 else 1 end)
     /avg(case when pick->>'slot' in ('GUARD','BIG') then .84 else 1 end)
     into v_grade from jsonb_array_elements(
       case when v_year=1 then p_state->'yearOnePicks' else p_state->'picks' end) pick;
   -- NFL-like grade-to-OVR compression; exact grades never revealed.
   v_ovr:=greatest(60,least(99,round(70+(v_grade-76)*1.5)));
   v_roster:=v_roster+v_ovr;
   v_record:=v_record+(p_state->'results'->(v_year-1)->>'wins')::numeric;
   v_finish:=p_state->'results'->(v_year-1)->>'finish';
   v_playoff:=v_playoff+case v_finish when 'Champion' then 100
     when 'Finals' then 96 when 'Conference Finals' then 92
     when 'Conference Semifinals' then 86 when 'First Round' then 80
     when 'Missed Playoffs' then 70 else 0 end;
 end loop;
 v_roster:=round(v_roster/3,1);
 v_record:=round(60+40*v_record/(82*3),1);
 v_playoff:=round(v_playoff/3,1);
 v_score:=round(v_roster*.90+v_record*.03+v_playoff*.07,1);
 return jsonb_build_object('score',v_score,'roster',v_roster,
   'regularSeason',v_record,'playoffs',v_playoff,
   'weights',jsonb_build_array(.90,.03,.07));
end;
$$;
revoke all on function private.nba_gm_v3_final_score(jsonb) from public,anon,authenticated;

create or replace function public.nba_gm_dev_action(
  p_action text,p_slot text default null,p_player_id text default null
) returns jsonb language plpgsql security definer set search_path='' as $$
declare
  v_profile uuid:=auth.uid();v_run_id uuid;v_state jsonb;v_next jsonb;
  v_player private.nba_gm_dev_players%rowtype;
  v_old private.nba_gm_dev_players%rowtype;
  v_picks jsonb;v_team text;v_revision integer;v_year integer;v_spend bigint;
  v_old_id text;v_result jsonb;v_attempts integer;v_count integer;
  v_chip_grade numeric;v_offer_value numeric;v_ask numeric;v_chip_id text;
begin
  if not private.nba_gm_dev_owner() then raise exception 'NBA GM playtest access required'; end if;
  if (select count(*) from private.nba_gm_dev_players)<>330 then
    raise exception 'NBA GM private player bank unavailable'; end if;
  if p_action='start' then
    v_state:=jsonb_build_object('version','nba-gm-dev-v2',
      'seed','nba-gm-'||extensions.gen_random_uuid()::text,
      'economyVersion',3,'phase','draft','picks','[]'::jsonb,'yearOnePicks','[]'::jsonb,'pendingTeam',null,
      'pendingSlot',null,'spinIndex',0,'caps',jsonb_build_array(155000000,155000000,155000000),
      'results','[]'::jsonb,'shopPlayerId',null,'tradeTeam',null,
      'tradeAttempts',0,'tradesUsed',0,'freeAgencyTeam',null,
      'freeAgencyVisits',0,'releasedIds','[]'::jsonb);
    perform set_config('octagon.nba_gm_dev_authorized_write','yes',true);
    insert into private.football_gm_runs(profile_id,seed,game_version,state)
      values(v_profile,v_state->>'seed','nba-gm-dev-v2',v_state) returning id into v_run_id;
    insert into private.football_gm_run_snapshots(run_id,revision,state) values(v_run_id,1,v_state);
    perform set_config('octagon.nba_gm_dev_authorized_write','',true);
    return v_state;
  end if;
  select r.id,r.state into v_run_id,v_state from private.football_gm_runs r
  where r.profile_id=v_profile and r.game_version='nba-gm-dev-v2'
  order by (r.completed_at is null) desc,r.updated_at desc
  limit 1 for update;
  if v_run_id is null then
    if p_action='load' then return null; end if;
    raise exception 'Start an NBA GM franchise'; end if;
  if p_action='load' then return v_state; end if;
  if v_state->>'version'<>'nba-gm-dev-v2'
    or jsonb_typeof(v_state->'picks')<>'array'
    or v_state->>'phase'='final' then raise exception 'NBA GM session is closed'; end if;
  v_picks:=v_state->'picks';
  v_next:=v_state;
  if p_action='spin' then
    if v_state->>'phase'<>'draft' or v_state->>'pendingTeam' is not null
      then raise exception 'Finish the existing team spin first'; end if;
    -- Randomize teams first; stop on the FIRST team with legal candidates.
    -- Avoid 330 expensive recursive matching calls before the wheel responds.
    v_team:=null;
    for v_team in select x.team_code from (select distinct team_code
        from private.nba_gm_dev_players) x order by random() loop
      if exists(select 1 from private.nba_gm_dev_players p
        where p.team_code=v_team and private.nba_gm_v2_can_add(v_state,p.id)) then exit; end if;
      v_team:=null;
    end loop;
    if v_team is null then raise exception 'No legal NBA teams remain'; end if;
    v_next:=jsonb_set(jsonb_set(v_state,'{pendingTeam}',to_jsonb(v_team)),
      '{spinIndex}',to_jsonb((v_state->>'spinIndex')::integer+1));
  elsif p_action='pick' then
    if v_state->>'phase'<>'draft' or v_state->>'pendingTeam' is null
      then raise exception 'Spin a team before selecting a player'; end if;
    select * into v_player from private.nba_gm_dev_players where id=p_player_id;
    if not found or v_player.team_code<>v_state->>'pendingTeam'
      or not private.nba_gm_v2_can_add(v_state,p_player_id)
      then raise exception 'Player cannot fit the roster and cap'; end if;
    v_picks:=private.nba_gm_v2_assign(v_picks,p_player_id);
    v_next:=jsonb_set(jsonb_set(v_state,'{picks}',v_picks),'{pendingTeam}','null'::jsonb);
    if jsonb_array_length(v_picks)=7 then
      v_next:=jsonb_set(v_next,'{yearOnePicks}',v_picks);
      v_result:=private.nba_gm_v2_season(v_next,1);
      v_next:=jsonb_set(jsonb_set(v_next,'{results}',jsonb_build_array(v_result)),
        '{phase}','"year1"'::jsonb);
    end if;
  elsif p_action='offseason' then
    if v_state->>'phase'<>'year1' then raise exception 'Complete Season 1 first'; end if;
    v_next:=jsonb_set(v_state,'{phase}','"offseason"'::jsonb);
    v_next:=jsonb_set(v_next,'{development}',
      private.nba_gm_v3_development_report(v_next,v_picks));
  elsif p_action='shop' then
    if v_state->>'phase'<>'offseason' or (v_state->>'tradesUsed')::integer>=1
      or v_state->>'tradeTeam' is not null
      or not exists(select 1 from jsonb_array_elements(v_picks) pick
        where pick->>'playerId'=p_player_id)
      then raise exception 'Choose one rostered player to shop'; end if;
    v_next:=jsonb_set(jsonb_set(v_state,'{shopPlayerId}',to_jsonb(p_player_id)),
      '{tradeAttempts}','0'::jsonb);
  elsif p_action='trade-spin' then
    v_old_id:=v_state->>'shopPlayerId';
    if v_state->>'phase'<>'offseason' or v_old_id is null
      or v_state->>'tradeTeam' is not null then raise exception 'Choose a trade asset first'; end if;
    select * into v_old from private.nba_gm_dev_players where id=v_old_id;
    select coalesce(jsonb_agg(pick),'[]'::jsonb) into v_picks
      from jsonb_array_elements(v_picks) pick where pick->>'playerId'<>v_old_id;
    v_next:=jsonb_set(v_state,'{picks}',v_picks);
    -- All potential partners are visible, not only one-for-one legal swaps.
    select team_code into v_team from (
      select distinct team_code from private.nba_gm_dev_players
      where team_code<>v_old.team_code
    ) possible order by random() limit 1;
    if v_team is null then raise exception 'No legal trade partners'; end if;
    v_next:=jsonb_set(v_state,'{tradeTeam}',to_jsonb(v_team));
  elsif p_action='trade' then
    v_old_id:=v_state->>'shopPlayerId';
    if v_state->>'phase'<>'offseason' or v_old_id is null
      or v_state->>'tradeTeam' is null or (v_state->>'tradeAttempts')::integer>=2
      then raise exception 'No active trade offers'; end if;
    select * into v_old from private.nba_gm_dev_players where id=v_old_id;
    select * into v_player from private.nba_gm_dev_players where id=p_player_id;
    if not found or v_player.team_code<>v_state->>'tradeTeam'
      or exists(select 1 from jsonb_array_elements(v_picks) x where x->>'playerId'=p_player_id)
      then raise exception 'Target is not an available player from your trade partner'; end if;
    -- Optional second outgoing asset through the existing p_slot argument.
    -- Never trust a client-owned slot or arbitrary extra player.
    v_chip_id:=nullif(p_slot,'');
    if v_chip_id is not null and (v_chip_id=v_old_id or
       not exists(select 1 from jsonb_array_elements(v_picks) x
          where x->>'playerId'=v_chip_id)) then
      raise exception 'Additional trade chip must be another rostered player';
    end if;
    select coalesce(jsonb_agg(pick),'[]'::jsonb) into v_picks
      from jsonb_array_elements(v_picks) pick
      where pick->>'playerId'<>v_old_id
        and (v_chip_id is null or pick->>'playerId'<>v_chip_id);
    v_result:=jsonb_set(v_state,'{picks}',v_picks);
    -- All targets remain visible; impossible packages get explicit feedback.
    if not private.nba_gm_v2_can_add(v_result,p_player_id) then
      raise exception 'Trade target needs different outgoing assets or more cap room'; end if;
    v_offer_value:=private.nba_gm_v3_grade(v_state,v_old_id,2);
    if v_chip_id is not null then
      v_chip_grade:=private.nba_gm_v3_grade(v_state,v_chip_id,2);
      v_offer_value:=v_offer_value+greatest(0,(v_chip_grade-69)*.32);
    end if;
    v_ask:=private.nba_gm_v3_grade(v_state,p_player_id,2)
      +case when v_player.overall>=95 then 4
            when v_player.overall>=89 then 2.5 else 1 end;
    v_attempts:=(v_state->>'tradeAttempts')::integer+1;
    v_next:=jsonb_set(v_state,'{tradeAttempts}',to_jsonb(v_attempts));
    if v_offer_value>=v_ask then
      v_picks:=private.nba_gm_v2_assign(v_picks,p_player_id);
      v_next:=jsonb_set(jsonb_set(jsonb_set(jsonb_set(v_next,'{picks}',v_picks),
        '{shopPlayerId}','null'::jsonb),'{tradeTeam}','null'::jsonb),
        '{tradesUsed}',to_jsonb((v_state->>'tradesUsed')::integer+1));
      -- Two-for-one deals create a vacancy. Guarantee one legal affordable
      -- replacement before finalizing that structural transaction.
      if v_chip_id is not null and not exists(
        select 1 from private.nba_gm_dev_players p
        where private.nba_gm_v3_contract_for_state(v_state,p.id)='1YR' and p.overall<=81
          and not exists(select 1 from jsonb_array_elements(v_picks) x
            where x->>'playerId'=p.id)
          and private.nba_gm_v2_can_add(v_next,p.id)) then
        raise exception 'Trade package leaves no affordable 1YR roster completion';
      end if;
    elsif v_attempts>=2 then
      v_next:=jsonb_set(jsonb_set(v_next,'{shopPlayerId}','null'::jsonb),
        '{tradeTeam}','null'::jsonb);
    end if;
  elsif p_action='cancel-trade' then
    if v_state->>'phase'<>'offseason' then raise exception 'Offseason only'; end if;
    v_next:=jsonb_set(jsonb_set(v_state,'{shopPlayerId}','null'::jsonb),
      '{tradeTeam}','null'::jsonb);
  elsif p_action='release' then
    if v_state->>'phase'<>'offseason' or
      (jsonb_array_length(v_state->'releasedIds')>=1 and not exists(
        select 1 from generate_series(2,3) yr where
          (select coalesce(sum(private.nba_gm_v3_salary(v_state,x->>'playerId',yr)),0)
            from jsonb_array_elements(v_picks) x) > (v_state->'caps'->>(yr-1))::bigint))
      or v_state->>'shopPlayerId' is not null or v_state->>'freeAgencyTeam' is not null
      or not exists(select 1 from jsonb_array_elements(v_picks) pick where pick->>'playerId'=p_player_id)
      then raise exception 'You can release one player in this offseason'; end if;
    select coalesce(jsonb_agg(pick),'[]'::jsonb) into v_picks
      from jsonb_array_elements(v_picks) pick where pick->>'playerId'<>p_player_id;
    v_next:=jsonb_set(jsonb_set(v_state,'{picks}',v_picks),
      '{releasedIds}',(v_state->'releasedIds')||jsonb_build_array(p_player_id));
    -- Never finalize a cut unless at least one legal, affordable 1YR replacement exists.
    if not exists(select 1 from private.nba_gm_dev_players p
      where private.nba_gm_v3_contract_for_state(v_state,p.id)='1YR'
        and p.id not in(select x.id from jsonb_array_elements_text(v_next->'releasedIds') x(id))
        and private.nba_gm_v2_can_add(v_next,p.id)) then
      raise exception 'No affordable 1YR replacement; keep this player';
    end if;
  -- NFL-style emergency market: never strand a franchise after a release.
  elsif p_action='fa-spin' then
    if v_state->>'phase'<>'offseason' or jsonb_array_length(v_picks)>=7
      or (v_state->>'freeAgencyVisits')::integer>=3
      or v_state->>'freeAgencyTeam' is not null
      or v_state->>'shopPlayerId' is not null
      then raise exception 'No free-agent market visit available'; end if;
    select teams.team_code into v_team from (
      select distinct team_code from private.nba_gm_dev_players
    ) teams where exists(select 1 from private.nba_gm_dev_players p
      where p.team_code=teams.team_code and private.nba_gm_v3_contract_for_state(v_state,p.id)='1YR'
        and p.id not in(select x.id from jsonb_array_elements_text(v_state->'releasedIds') x(id))
        and private.nba_gm_v2_can_add(v_state,p.id))
    order by random() limit 1;
    if v_team is null then raise exception 'No affordable free agents available'; end if;
    v_next:=jsonb_set(jsonb_set(v_state,'{freeAgencyTeam}',to_jsonb(v_team)),
      '{freeAgencyVisits}',to_jsonb((v_state->>'freeAgencyVisits')::integer+1));
  elsif p_action='sign' then
    if v_state->>'phase'<>'offseason' or v_state->>'freeAgencyTeam' is null
      then raise exception 'Spin the free-agent wheel first'; end if;
    select * into v_player from private.nba_gm_dev_players where id=p_player_id;
    if not found or v_player.team_code<>v_state->>'freeAgencyTeam'
      or private.nba_gm_v3_contract_for_state(v_state,p_player_id)<>'1YR'
      or p_player_id in(select x.id from jsonb_array_elements_text(v_state->'releasedIds') x(id))
      or not private.nba_gm_v2_can_add(v_state,p_player_id)
      then raise exception 'Free agent is not eligible'; end if;
    v_picks:=private.nba_gm_v2_assign(v_picks,p_player_id);
    v_next:=jsonb_set(jsonb_set(v_state,'{picks}',v_picks),
      '{freeAgencyTeam}','null'::jsonb);
  elsif p_action='pass-fa' then
    if v_state->>'phase'<>'offseason' or v_state->>'freeAgencyTeam' is null
      then raise exception 'No market visit to pass'; end if;
    v_next:=jsonb_set(v_state,'{freeAgencyTeam}','null'::jsonb);
  elsif p_action='emergency-sign' then
    if v_state->>'phase'<>'offseason' or jsonb_array_length(v_picks)>=7
      or (v_state->>'freeAgencyVisits')::integer<3
      or v_state->>'freeAgencyTeam' is not null or v_state->>'shopPlayerId' is not null
      then raise exception 'Emergency signings require exhausted visits and an open slot'; end if;
    select * into v_player from private.nba_gm_dev_players where id=p_player_id;
    if not found or v_player.overall>78 or private.nba_gm_v3_contract_for_state(v_state,p_player_id)<>'1YR'
      or p_player_id in(select x.id from jsonb_array_elements_text(v_state->'releasedIds') x(id))
      or not private.nba_gm_v2_can_add(v_state,p_player_id)
      then raise exception 'Only affordable depth free agents can fill an emergency vacancy'; end if;
    v_picks:=private.nba_gm_v2_assign(v_picks,p_player_id);
    v_next:=jsonb_set(v_state,'{picks}',v_picks);
  elsif p_action='advance' then
    if v_state->>'phase'<>'offseason'
      or jsonb_array_length(v_picks)<>7 or v_state->>'shopPlayerId' is not null
      or v_state->>'freeAgencyTeam' is not null
      then raise exception 'Complete the seven-player offseason roster first'; end if;
    if private.nba_gm_v2_assign(v_picks) is null then raise exception 'Invalid positions'; end if;
    for v_year in 2..3 loop
      select coalesce(sum(private.nba_gm_v3_salary(v_state,pick->>'playerId',v_year)),0)
        into v_spend from jsonb_array_elements(v_picks) pick;
      if v_spend>(v_state->'caps'->>(v_year-1))::bigint then raise exception 'Future salary cap exceeded'; end if;
    end loop;
    v_next:=jsonb_set(jsonb_set(v_state,'{results}',
      (v_state->'results')||jsonb_build_array(
        private.nba_gm_v2_season(v_state,2),private.nba_gm_v2_season(v_state,3))),
        '{phase}','"final"'::jsonb);
    v_next:=jsonb_set(v_next,'{development}',
      private.nba_gm_v3_development_report(v_next,v_picks));
    v_next:=jsonb_set(v_next,'{scoreBreakdown}',private.nba_gm_v3_final_score(v_next));
  else
    raise exception 'Unsupported NBA GM action';
  end if;

  perform set_config('octagon.nba_gm_dev_authorized_write','yes',true);
  update private.football_gm_runs set state=v_next,updated_at=now(),
    completed_at=case when v_next->>'phase'='final' then now() else null end
    where id=v_run_id;
  select coalesce(max(revision),0)+1 into v_revision
    from private.football_gm_run_snapshots where run_id=v_run_id;
  insert into private.football_gm_run_snapshots(run_id,revision,state)
    values(v_run_id,v_revision,v_next);
  perform set_config('octagon.nba_gm_dev_authorized_write','',true);
  return v_next;
end;
$$;
revoke all on function public.nba_gm_dev_action(text,text,text) from public,anon;
grant execute on function public.nba_gm_dev_action(text,text,text) to authenticated;

create or replace function public.nba_gm_dev_catalog()
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare v_state jsonb;
begin
  if not private.nba_gm_dev_owner() then raise exception 'NBA GM playtest access required'; end if;
  select r.state into v_state from private.football_gm_runs r
   where r.profile_id=auth.uid() and r.game_version='nba-gm-dev-v2'
   order by (r.completed_at is null) desc,r.updated_at desc limit 1;
  return coalesce((select jsonb_agg(jsonb_build_object(
    'id',p.id,'name',p.name,'teamCode',p.team_code,'positions',p.positions,
    'currentGrade',p.overall,'skills',p.skills,
    'ageAtStart',case when p.verified_birth_date is null then null else
      extract(year from age(date '2026-10-30',p.verified_birth_date))::integer end,
    'salaries',case when v_state->>'phase' in ('offseason','final') then jsonb_build_array(private.nba_gm_v3_salary(v_state,p.id,1),private.nba_gm_v3_salary(v_state,p.id,2),private.nba_gm_v3_salary(v_state,p.id,3)) else to_jsonb(p.salaries) end,
    'gameContract',private.nba_gm_v3_contract_for_state(v_state,p.id),
    'pricingKind',p.pricing_kind,'eligibilityKind',p.eligibility_kind,
    'officialNbaPlayerId',p.official_nba_player_id,
    'officialRosterPosition',p.official_roster_position,
    'positionReview',p.position_review,'reviewFlags',p.review_flags
  ) order by p.overall desc,p.name) from private.nba_gm_dev_players p),'[]'::jsonb);
end;
$$;
revoke all on function public.nba_gm_dev_catalog() from public,anon;
grant execute on function public.nba_gm_dev_catalog() to authenticated;

