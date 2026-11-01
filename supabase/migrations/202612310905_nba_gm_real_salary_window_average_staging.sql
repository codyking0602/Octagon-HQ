-- PRIVATE, NOT RELEASE READY. 330 rows of as-of-2026-11-01 proposed NBA GM salaries
-- averaged over actual signed seasons INSIDE the 2026-27 through 2028-29 game window.
-- Do not project missing salaries, invent a future contract, change game term rules,
-- or route this into live NBA GM before source review and full three-season tests.
-- Source-by-source workbook: docs/nba-gm-contract-averages-2026-11-01.csv
create table if not exists private.nba_gm_three_season_salary_window_2026_27 (
  player_id text primary key references private.nba_gm_contract_candidates_2026_27(player_id),
  real_salary_2027_28 bigint check (real_salary_2027_28 > 0),
  real_salary_2028_29 bigint check (real_salary_2028_29 > 0),
  signed_seasons_in_game_window integer not null check (signed_seasons_in_game_window between 1 and 3),
  average_game_salary bigint check (average_game_salary > 0),
  average_status text not null check (average_status in (
    'PROVISIONAL_CURRENT_EXTENSION','PROVISIONAL_SINGLE_SIGNED_SEASON',
    'PROVISIONAL_JULY_HISTORICAL','UNRESOLVED_FUTURE_SALARY')),
  source_url text not null check (source_url ~ '^https://'),
  independently_verified boolean not null default false,
  snapshot_date date not null default date '2026-11-01',
  constraint nba_gm_average_requires_complete_future_seasons check (
    (average_game_salary is null and average_status='UNRESOLVED_FUTURE_SALARY') or
    (average_game_salary is not null and average_status<>'UNRESOLVED_FUTURE_SALARY'
       and (signed_seasons_in_game_window=1 or real_salary_2027_28 is not null)
       and (signed_seasons_in_game_window<3 or real_salary_2028_29 is not null))
  )
);
revoke all on private.nba_gm_three_season_salary_window_2026_27 from public, anon, authenticated;
alter table private.nba_gm_three_season_salary_window_2026_27 enable row level security;
comment on table private.nba_gm_three_season_salary_window_2026_27 is
  'Unverified private NBA GM real season-salary audit; no live runtime reads this table';
insert into private.nba_gm_three_season_salary_window_2026_27
(player_id,real_salary_2027_28,real_salary_2028_29,signed_seasons_in_game_window,
 average_game_salary,average_status,source_url,independently_verified)
values
  ('nba-gm-draft-victorwembanyama',43500000,46980000,3,35782749,'PROVISIONAL_CURRENT_EXTENSION','https://www.salaryswish.com/players/victor-wembanyama',false),
  ('nba-gm-draft-nikolajokic',62841702,null,2,60937408,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-shaigilgeousalexander',61005000,65885400,3,55898850,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-lukadoncic',53784000,57768000,3,53784000,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-giannisantetokounmpo',62786682,null,2,60621624,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-jalenbrunson',40535041,43330561,3,40535041,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-anthonyedwards',52298736,55672848,3,52298736,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-kawhileonard',null,null,1,50300000,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-cadecunningham',53817156,57528684,3,53817156,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-jaysontatum',62786682,67116798,3,62786682,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-stephencurry',null,null,1,62587158,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-donovanmitchell',53817156,null,2,51961392,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-karlanthonytowns',61015192,null,2,59046960,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-tyresemaxey',43582280,46394040,3,43582280,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-kevindurant',46097561,null,2,45000000,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-jaylenbrown',61015192,64951656,3,61015192,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-tyresehaliburton',52298736,55672848,3,52298736,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-scottiebarnes',44847630,47940570,3,44847630,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-devinbooker',61015192,64065952,3,60719957,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-oganunoby',45431034,48362068,3,45431034,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-lebronjames',null,null,2,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-jalenjohnson',30000000,30000000,3,30000000,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-jamalmurray',53817156,57528684,3,53817156,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-evanmobley',53817156,57528684,3,53817156,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-jalenwilliams',44820000,48140000,3,44820000,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-bamadebayo',53784000,57768000,3,53784000,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-deniavdija',11875000,null,2,12500000,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-chetholmgren',44820000,48140000,3,44820000,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-stephoncastle',12670139,null,2,11343030,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-pascalsiakam',52298736,null,2,50611680,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-cooperflagg',15208680,19178146,3,16301435,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-paolobanchero',44820000,48140000,3,44820000,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-lameloball',43582280,46394040,3,43582280,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-laurimarkkanen',49824681,53536209,3,49824681,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-alperensengun',37339450,39036697,3,37339450,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-austinreaves',null,null,3,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-jamesharden',null,null,3,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-anthonydavis',62786682,null,2,60621624,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-joelembiid',62748000,67396000,3,62748000,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-amenthompson',null,null,1,12258609,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-kyrieirving',42416562,null,2,40953922,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-franzwagner',44847630,47940570,3,44847630,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-derrickwhite',32596000,34844000,3,32596000,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-jarenjackson',50500000,52000000,3,50500000,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-rudygobert',38000000,null,2,37250000,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-jalenduren',null,null,3,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-dylanharper',13607760,17172994,3,14589931,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-konknueppel',11017560,13937214,3,11823778,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-desmondbane',42166510,44886930,3,42166510,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-jadenmcdaniels',28006898,29813790,3,28006896,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-brandonmiller',null,null,1,15104626,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-aarongordon',36350680,39043323,3,36350680,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-treymurphy',29000000,31000000,3,29000000,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-zionwilliamson',44886930,null,2,43526720,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-ivicazubac',21790300,null,2,21066220,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-deaaronfox',53784000,57768000,3,53784000,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-keyontegeorge',null,null,1,6563925,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-nickeilalexanderwalker',15161800,15919890,3,15161800,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-dariusgarland',44886930,null,2,43526720,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-domantassabonis',48608000,null,2,47040000,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-ausarthompson',null,null,1,11117925,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-michaelporter',null,null,1,40806150,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-juliusrandle',35802468,null,2,34567901,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-traeyoung',null,null,3,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-paulgeorge',56586670,null,2,55356525,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-damianlillard',null,null,3,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-mikalbridges',36160714,38839285,3,36160715,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-alexcaruso',20998320,22446480,3,20998320,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-dillonbrooks',null,null,1,19992727,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-jarrettallen',30240000,32480000,3,30240000,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-paytonpritchard',8303571,null,2,8035714,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-tylerherro',null,null,1,33000000,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-casonwallace',null,null,1,7420806,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-ajaymitchell',2850000,null,2,2850000,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-isaiahhartenstein',null,null,3,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-joshhart',22375280,null,2,21649520,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-normanpowell',null,null,2,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-fredvanvleet',null,null,1,25000000,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-jrueholiday',37200000,null,2,36000000,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-vjedgecombe',12219720,15445727,3,13109776,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-andrewnembhard',20998320,null,2,20274240,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-nazreid',25000000,26724138,3,25000000,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-joshgiddey',25000000,25000000,3,25000000,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-devinvassell',24652174,27000000,3,26217391,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-donovanclingan',9550298,null,2,8535109,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-ayodosunmu',null,null,3,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-jalensuggs',29600000,26800000,3,29600000,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-peytonwatson',null,null,3,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-dysondaniels',25000000,25000000,3,25000000,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-walkerkessler',null,null,3,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-cameronboozer',null,null,3,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-collinmurrayboyles',6966000,8874684,3,7496748,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-toumanicamara',19526786,20973214,3,19526786,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-tobiasharris',null,null,2,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-rjbarrett',null,null,1,29616071,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-onyekaokongwu',16880000,null,2,16500000,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-jamorant',44886930,null,2,43526720,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-dejountemurray',30751504,null,2,31768288,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-matasbuzelis',7584283,null,2,6649822,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-ajdybantsa',null,null,3,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-brandoningram',41904762,null,2,40952381,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-demarderozan',null,null,1,3876528,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://www.salaryswish.com/players/demar-derozan',false),
  ('nba-gm-draft-zachlavine',null,null,1,48967380,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-cjmccollum',null,null,1,21000000,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-alexandresarr',null,null,2,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-immanuelquickley',32500000,32500000,3,32500000,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-shaedonsharpe',21696429,23303571,3,21696429,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-mylesturner',27850077,29115990,3,27850077,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-draymondgreen',null,null,1,27678571,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-jimmybutler',null,null,1,56832773,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-herbjones',null,null,3,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-duncanrobinson',15151222,null,2,15572090,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-julianchampagnie',null,null,3,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-isaiahjoe',11323006,null,2,11323006,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-camspencer',2616754,2830685,3,2619510,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-osoighodaro',2486995,null,2,2391633,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-sandromamukelashvili',null,null,3,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-samhauser',11651785,12455356,3,11651785,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-neemiasqueta',null,null,1,2667944,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://www.salaryswish.com/players/neemias-queta',false),
  ('nba-gm-draft-lukekennard',null,null,2,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-mosesmoody',13425925,null,2,12962963,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-trejohnson',9061680,11490211,3,9733830,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-kellyoubre',null,null,2,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-dontedivincenzo',null,null,1,12535000,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-cameronjohnson',null,null,1,23062500,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-kelelware',7135992,null,2,5895456,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-reedsheppard',14041625,null,2,12575253,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-jabarismith',21751940,23643411,3,23012921,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-tarieason',null,null,3,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-pjwashington',21398088,22983132,3,21398088,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-najimarshall',null,null,1,9428571,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-graysonallen',19375000,null,2,18750000,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-tyjerome',9659100,null,2,9439575,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-santialdama',17007043,null,2,17007043,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-klaythompson',null,null,1,17460317,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-brandinpodziemski',null,null,1,5679459,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-keeganmurray',26068965,27999999,3,26068967,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-jonathankuminga',null,null,2,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-brucethornton',null,null,3,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-bradensmith',null,null,1,678882,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://www.salaryswish.com/players/braden-smith',false),
  ('nba-gm-draft-babamiller',null,null,3,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-meleekthomas',null,null,3,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-adaymara',null,null,3,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-trevonbrazile',null,null,3,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-aaronwiggins',8345797,8345797,3,8638631,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-luguentzdort',null,null,1,18222222,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-jocklandale',null,null,1,14000000,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-coreykispert',13050000,13050000,3,13358333,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-kingstonflemings',null,null,3,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-asanewell',3560880,6042814,3,4334391,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-dorianfinneysmith',13335000,13335000,3,13335000,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-jordanwalsh',null,null,1,2406205,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-baylorscheierman',4952993,null,2,3848517,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-hugogonzalez',3062640,5528065,3,3838088,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-mikeconley',null,null,1,3876529,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://www.salaryswish.com/players/mike-conley',false),
  ('nba-gm-draft-mitchellrobinson',null,null,3,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-lukagarza',null,null,1,2801346,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-keonellis',null,null,2,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-mikelbrown',null,null,3,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-egordemin',null,null,3,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-dayronsharpe',null,null,2,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-noahclowney',null,null,1,5414034,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-nolantraore',4193040,6457282,3,4884107,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-moritzwagner',null,null,2,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-calebwilson',null,null,3,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-jalensmith',null,null,1,9428571,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-trejones',8000000,null,2,8000000,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-isaacokoro',null,null,1,11814814,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-noaessengue',5972760,8230464,3,6634808,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-leonardmiller',null,null,1,2406205,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-buddyhield',10097560,null,2,9878048,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-dennisschroder',15514400,null,2,15161800,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-sionjames',2525901,2735698,3,2557563,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-moussadiabate',null,null,1,2461462,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-royceoneale',11625000,null,2,11250000,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-tidjanesalaun',10445633,null,2,9341757,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-hannessteinbach',null,null,3,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-ryankalkbrenner',2525901,2735698,3,2557563,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-sammerrill',9839285,10517856,3,9839285,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-jaylontyson',5641500,null,2,4650030,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-mariohezonja',null,null,1,2845883,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://www.salaryswish.com/players/mario-hezonja',false),
  ('nba-gm-draft-tyreseproctor',2525901,2735698,3,2470839,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-craigporter',null,null,1,2406205,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-danissjenkins',null,null,1,4000000,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-kevinhuerter',null,null,3,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-javontegreen',null,null,1,3943679,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://www.salaryswish.com/players/javonte-green',false),
  ('nba-gm-draft-johncollins',null,null,3,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-paulreed',null,null,1,5602689,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-ronaldholland',11491183,null,2,10280392,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-aaronnesmith',19418000,20971440,3,17129813,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-quentonjackson',null,null,2,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-bensheppard',null,null,1,5031669,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-tjmcconnell',11800000,11800000,3,11533333,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-obitoppin',16025000,null,2,15512500,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-jaracewalker',null,null,1,8478542,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-davionmitchell',null,null,1,12400000,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-pellelarsson',null,null,1,2296271,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-timhardaway',null,null,1,6500000,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-drusmith',2934742,null,2,2759641,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-andrewwiggins',null,null,1,30169644,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-bobbyportis',null,null,2,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-jaimejaquez',null,null,1,5939141,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-ryanrollins',4000000,null,2,4000000,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-kasparasjakucionis',4024440,6205687,3,4690602,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-ajgreen',10848215,11651786,3,10848215,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-braydenburries',null,null,3,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-kylekuzma',null,null,1,20345152,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-nateament',null,null,3,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-landryshamet',null,null,3,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-milesmcbride',null,null,1,3956523,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-tylerkolek',2486995,null,2,2391633,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-josealvarado',null,null,3,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-andredrummond',null,null,1,3876529,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://www.salaryswish.com/players/andre-drummond',false),
  ('nba-gm-draft-anthonyblack',null,null,1,10106316,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-jevoncarter',null,null,1,3506659,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://www.salaryswish.com/players/jevon-carter',false),
  ('nba-gm-draft-jaserichardson',3282000,5910882,3,4108414,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-tristandasilva',6138466,null,2,5064833,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-wendellcarter',19550160,20998320,3,19550160,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-gogabitadze',null,null,1,7608696,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-kentaviouscaldwellpope',null,null,1,3876529,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://www.basketball-reference.com/contracts/PHI.html',false),
  ('nba-gm-draft-anferneesimons',null,null,2,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-labaronphilon',null,null,3,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-deanwade',null,null,3,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-adembona',2486995,null,2,2391633,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-jabariwalker',null,null,1,2584539,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://www.basketball-reference.com/contracts/PHI.html',false),
  ('nba-gm-draft-jakobewalter',5870172,null,2,4840986,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-jamalshead',null,null,1,2296271,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-allengraves',null,null,3,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-jamisonbattle',null,null,1,2296271,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-traycejacksondavis',null,null,1,2406205,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-jakobpoeltl',27300000,29484000,3,25428000,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-bilalcoulibaly',null,null,1,9240012,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-kyshawngeorge',5435892,null,2,4271946,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-bubcarrington',7257730,null,2,6079145,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-justinchampagnie',3005085,null,2,2836515,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-khrismiddleton',null,null,3,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-tremann',8000000,null,2,8000000,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-deandreayton',null,null,1,8104000,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-maxchristie',8857143,null,2,8571429,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-marcussasser',null,null,1,5198983,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-zaccharierisacher',17434637,null,2,15630339,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-danielgafford',18126763,18989942,3,18126763,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-morezjohnson',null,null,3,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-derecklively',null,null,1,7239131,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-christianbraun',23275863,25000000,3,23275863,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-tyusjones',null,null,1,3876529,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://www.salaryswish.com/players/tyus-jones',false),
  ('nba-gm-draft-julianstrawther',null,null,1,4826931,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-marvinbagley',null,null,1,3506659,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://www.salaryswish.com/players/marvin-bagleyiii',false),
  ('nba-gm-draft-camwhitmore',null,null,1,5458310,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-zekennaji',7466667,null,2,7466667,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-deanthonymelton',null,null,2,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-willrichard',2525901,2735698,3,2470839,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-brandonwilliams',null,null,1,2625627,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://www.salaryswish.com/players/brandon-williams',false),
  ('nba-gm-draft-garypayton',null,null,1,3876529,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://www.salaryswish.com/players/gary-paytonii',false),
  ('nba-gm-draft-guisantos',5000000,5370370,3,5000000,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-kristapsporzingis',null,null,2,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-alhorford',null,null,2,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-marcussmart',null,null,2,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-bogdanbogdanovic',null,null,1,3524115,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://www.salaryswish.com/players/bogdan-bogdanovic',false),
  ('nba-gm-draft-clintcapela',7370000,null,2,7202500,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-stevenadams',11869566,null,2,12434783,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-oscartshiebwe',null,null,1,678882,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://www.salaryswish.com/players/oscar-tshiebwe',false),
  ('nba-gm-draft-krisdunn',null,null,1,5684800,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-keatonwagler',null,null,3,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-gradeydick',null,null,1,7131511,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-ruihachimura',null,null,2,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-derrickjones',null,null,1,10476190,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-isaiahjackson',6400000,null,2,6700000,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-brooklopez',null,null,1,9187500,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-quentingrimes',null,null,3,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-matissethybulle',null,null,1,3286399,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://www.salaryswish.com/players/matisse-thybulle',false),
  ('nba-gm-draft-collinsexton',null,null,2,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-ziairewilliams',null,null,1,2845883,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://www.salaryswish.com/players/ziaire-williams',false),
  ('nba-gm-draft-jakelaravia',null,null,1,6000000,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-jarredvanderbilt',13285714,null,2,12857143,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-cedriccoward',6286920,8342743,3,6876914,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-jaylenwells',2486995,null,2,2391633,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-jeramigrant',36413790,null,2,35310344,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-isaiahstewart',15000000,null,2,15000000,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-zachedey',8067937,null,2,7200349,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-scottypippen',2789215,null,2,2625339,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-ggjackson',null,null,1,2406205,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-terrenceshannon',5054159,null,2,3927900,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-treylyles',null,null,1,3876529,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://www.salaryswish.com/players/trey-lyles',false),
  ('nba-gm-draft-joanberinger',4621200,7098163,3,5376854,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-boneshyland',null,null,1,2845883,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://www.salaryswish.com/players/nahshon-bones-hyland',false),
  ('nba-gm-draft-jaylenclark',null,null,3,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-jeremiahfears',8271960,10505389,3,8891196,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-bennedictmathurin',null,null,2,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-jordanpoole',null,null,1,34044642,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-saddiqbey',null,null,1,6440678,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-derikqueen',5673840,8107918,3,6399279,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-yvesmissi',5595827,null,2,4554294,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-jaredmccain',6784268,null,2,5603434,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-joshdix',null,null,1,678882,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://hoops-hype-us-west1-664912083968.us-west1.run.app/salaries/teams/oklahoma-city-thunder/25/',false),
  ('nba-gm-draft-kenrichwilliams',null,null,1,5000000,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://www.salaryswish.com/players/kenrich-williams',false),
  ('nba-gm-draft-jaylinwilliams',7774648,null,2,7774648,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-thomassorber',5120400,7849573,3,5952564,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-milesbridges',null,null,1,22826087,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-jalengreen',36000000,null,2,36125583,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-collingillespie',null,null,3,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-jordangoodwin',null,null,3,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-khamanmaluach',6617160,8436880,3,7123573,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-markwilliams',null,null,3,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-sidycissoko',null,null,1,2497812,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-scoothenderson',null,null,1,13585523,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-robertwilliams',null,null,3,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-micahpotter',null,null,1,2801346,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-yanghansen',4864920,7462788,3,5657076,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-vitkrejci',3005085,null,2,2836515,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-dariusacuff',null,null,3,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-preciousachiuwa',null,null,2,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-deandrehunter',null,null,1,24910714,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-malikmonk',21582451,null,2,20886243,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-niqueclifford',3418800,5979481,3,4220560,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-maximeraynaud',2525901,null,2,2338409,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-keldonjohnson',null,null,1,17500000,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-lukekornet',9900000,9350000,3,9900000,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-carterbryant',5390640,7983539,3,6173180,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-harrisonbarnes',null,null,1,8000000,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-tarrisreed',null,null,3,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-darrynpeterson',null,null,3,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-acebailey',9976560,12640302,3,10713314,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-isaiahcollier',4988948,null,2,3876454,'PROVISIONAL_JULY_HISTORICAL','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-joshgreen',null,null,1,14679012,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-joshokogie',null,null,2,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-bricesensabaugh',null,null,1,4862237,'PROVISIONAL_SINGLE_SIGNED_SEASON','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-jaxsonhayes',null,null,2,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-jusufnurkic',null,null,2,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false),
  ('nba-gm-draft-mobamba',null,null,2,null,'UNRESOLVED_FUTURE_SALARY','https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json',false)
;

-- Source gate: both real-contract identity/term AND fully sourced salary window
-- must have independent review on all 330 records. The 72 unresolved average
-- values keep the entire prototype fail-closed, in addition to source flags.
create or replace function private.nba_gm_v4_salary_certified()
returns boolean language sql stable security definer set search_path='' as $$
  select (select count(*) from private.nba_gm_contract_candidates_2026_27)=330
    and (select count(*) from private.nba_gm_contract_candidates_2026_27
      where independently_verified and candidate_contract in ('1YR','3YR')
        and candidate_salary>0 and actual_end_season is not null
        and source_url ~ '^https://')=330
    and (select count(*) from private.nba_gm_three_season_salary_window_2026_27)=330
    and (select count(*) from private.nba_gm_three_season_salary_window_2026_27 a
      join private.nba_gm_contract_candidates_2026_27 c on c.player_id=a.player_id
      where a.independently_verified and a.average_game_salary>0
        and a.signed_seasons_in_game_window=least(3,greatest(1,substring(c.actual_end_season,1,4)::int-2025))
        and a.average_game_salary=round((c.candidate_salary
          +coalesce(a.real_salary_2027_28,0)+coalesce(a.real_salary_2028_29,0))::numeric
          /a.signed_seasons_in_game_window)::bigint
        and (a.signed_seasons_in_game_window=1 or a.real_salary_2027_28 is not null)
        and (a.signed_seasons_in_game_window<3 or a.real_salary_2028_29 is not null)
        and a.source_url ~ '^https://')=330;
$$;
revoke all on function private.nba_gm_v4_salary_certified() from public, anon, authenticated;

-- Unused by current owner-only runtime: future explicit economyVersion=4 ONLY.
-- Preserve existing 1YR realized market repricing; 3YR locks the real salary
-- WINDOW average, never the unusually cheap first rookie-contract season.
create or replace function private.nba_gm_v4_salary(p_state jsonb,p_id text,p_year integer)
returns bigint language plpgsql stable security definer set search_path='' as $$
declare
  v_player private.nba_gm_dev_players%rowtype;
  v_start bigint;
  v_delta numeric; v_factor numeric; v_pct numeric; v_market numeric;
begin
  if p_year not between 1 and 3 then raise exception 'Invalid NBA GM game salary year'; end if;
  -- Economy gate performs 330/330 contract verification before any use.
  perform private.nba_gm_v4_contract(p_state,p_id);
  select * into v_player from private.nba_gm_dev_players where id=p_id;
  if not found then raise exception 'Unknown NBA GM player'; end if;
  select average_game_salary into v_start
    from private.nba_gm_three_season_salary_window_2026_27 where player_id=p_id;
  if v_start is null or v_start <= 0 then
    raise exception 'NBA GM V4 real salary window not fully sourced';
  end if;
  if p_year=1 or private.nba_gm_v4_contract(p_state,p_id)='3YR' then
    return v_start;
  end if;
  -- Same existing conservative draft forecast shape; no seeded future outcome leak.
  -- Before development outcomes are revealed, reserve the existing V3 annual
  -- market uplift (6.5%/12%). This is a known-model baseline, not a
  -- made-up cap-balancing salary or the actual outcome from seeded repricing.
  -- Calibration may determine stronger risk-aware future-year reserves.
  if coalesce(p_state->>'phase','draft') in ('draft','year1') then
    return greatest(2500000,
      round(v_start*(case when p_year=2 then 1.065 else 1.12 end)/100000)*100000)::bigint;
  end if;
  -- Realized V4 development grade is still exclusively server-authoritative.
  -- Reuse the existing v4 player-specific odds, seeded grade and market model.
  v_delta:=private.nba_gm_v3_grade(p_state,p_id,p_year)-v_player.overall;
  v_factor:=greatest(.66,least(2.0,power(1.105::numeric,v_delta)
    *(case when p_year=2 then 1.065 else 1.12 end)));
  if p_state->>'developmentModelVersion'='2' then
    v_pct:=coalesce((v_player.development_profile->>'marketVariancePct')::numeric,0);
    v_market:=(abs(('x'||substr(md5(p_state->>'seed'||':'||p_id||':'||p_year||':market'),1,8))
      ::bit(32)::int::bigint)%10000)::numeric/10000;
    v_factor:=greatest(.62,least(2,v_factor*(1+(v_market*2-1)*v_pct/100)));
  end if;
  return greatest(2500000,round(v_start*v_factor/100000)*100000)::bigint;
end;
$$;
revoke all on function private.nba_gm_v4_salary(jsonb,text,integer)
  from public, anon, authenticated;


comment on function private.nba_gm_v4_salary(jsonb,text,integer) is
  'PRIVATE V4 prototype: true signed-season-window average (2026-27 through 2028-29), fail-closed until all 330 source verified; not deployed or routed';
