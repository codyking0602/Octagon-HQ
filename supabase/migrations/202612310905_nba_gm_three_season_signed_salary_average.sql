-- Owner-approved NBA GM contract math: use a three-season window of actual signed salaries.
-- The game window is 2026-27, 2027-28, 2028-29.
-- 3YR => charge the rounded average of all three confirmed scheduled salaries,
-- locked in each game season. 1YR => charge average of the one/two real signed
-- seasons available in the same window, then retain server-owned future repricing.
-- Never divide by 3 when a real contract ends early. Missing schedule != zero.
-- Includes signed extensions not yet in effect and player/team options where signed.
-- All these staged source figures are UNVERIFIED until separately cross-checked.
-- No current V2/V3 route, saved run, live cap, or game player catalog is changed.
alter table private.nba_gm_contract_candidates_2026_27
  add column if not exists signed_salary_2027_28 bigint check (signed_salary_2027_28>0),
  add column if not exists signed_salary_2028_29 bigint check (signed_salary_2028_29>0),
  add column if not exists provisional_average_salary bigint check (provisional_average_salary>0),
  add column if not exists average_window_years integer check (average_window_years between 1 and 3),
  add column if not exists salary_schedule_status text,
  add column if not exists salary_schedule_url text,
  add column if not exists salary_schedule_verified boolean not null default false;

update private.nba_gm_contract_candidates_2026_27 c
set
 signed_salary_2027_28=s.y2,
 signed_salary_2028_29=s.y3,
 salary_schedule_status=s.status,
 salary_schedule_url=s.url,
 salary_schedule_verified=false,
 average_window_years=least(3,greatest(1,split_part(c.actual_end_season,'-',1)::integer-2026+1)),
 provisional_average_salary=case
   when split_part(c.actual_end_season,'-',1)::integer=2026 then c.candidate_salary
   when split_part(c.actual_end_season,'-',1)::integer=2027 and s.y2 is not null
     then round((c.candidate_salary+s.y2)::numeric/2)::bigint
   when split_part(c.actual_end_season,'-',1)::integer>=2028
     and s.y2 is not null and s.y3 is not null
     then round((c.candidate_salary+s.y2+s.y3)::numeric/3)::bigint
   else null
 end
from (values
  ('nba-gm-draft-victorwembanyama', 43500000::bigint, 46980000::bigint, 'WEMBANYAMA_SCHEDULE_CROSSCHECK_REVERIFY', 'https://www.basketball-reference.com/contracts/SAS.html'),
  ('nba-gm-draft-nikolajokic', 62841702::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-shaigilgeousalexander', 61005000::bigint, 65885400::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-lukadoncic', 53784000::bigint, 57768000::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-giannisantetokounmpo', 62786682::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-jalenbrunson', 40535041::bigint, 43330561::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-anthonyedwards', 52298736::bigint, 55672848::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-kawhileonard', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-cadecunningham', 53817156::bigint, 57528684::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-jaysontatum', 62786682::bigint, 67116798::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-stephencurry', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-donovanmitchell', 53817156::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-karlanthonytowns', 61015192::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-tyresemaxey', 43582280::bigint, 46394040::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-kevindurant', 46097561::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-jaylenbrown', 61015192::bigint, 64951656::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-tyresehaliburton', 52298736::bigint, 55672848::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-scottiebarnes', 44847630::bigint, 47940570::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-devinbooker', 61015192::bigint, 64065952::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-oganunoby', 45431034::bigint, 48362068::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-lebronjames', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.basketball-reference.com/contracts/PHI.html'),
  ('nba-gm-draft-jalenjohnson', 30000000::bigint, 30000000::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-jamalmurray', 53817156::bigint, 57528684::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-evanmobley', 53817156::bigint, 57528684::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-jalenwilliams', 44820000::bigint, 48140000::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-bamadebayo', 53784000::bigint, 57768000::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-deniavdija', 11875000::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-chetholmgren', 44820000::bigint, 48140000::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-stephoncastle', 12670139::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-pascalsiakam', 52298736::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-cooperflagg', 15208680::bigint, 19178146::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-paolobanchero', 44820000::bigint, 48140000::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-lameloball', 43582280::bigint, 46394040::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-laurimarkkanen', 49824681::bigint, 53536209::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-alperensengun', 37339450::bigint, 39036697::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-austinreaves', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.salaryswish.com/players/austin-reaves'),
  ('nba-gm-draft-jamesharden', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.salaryswish.com/players/james-harden'),
  ('nba-gm-draft-anthonydavis', 62786682::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-joelembiid', 62748000::bigint, 67396000::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-amenthompson', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-kyrieirving', 42416562::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-franzwagner', 44847630::bigint, 47940570::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-derrickwhite', 32596000::bigint, 34844000::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-jarenjackson', 50500000::bigint, 52000000::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-rudygobert', 38000000::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-jalenduren', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.salaryswish.com/browse/active'),
  ('nba-gm-draft-dylanharper', 13607760::bigint, 17172994::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-konknueppel', 11017560::bigint, 13937214::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-desmondbane', 42166510::bigint, 44886930::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-jadenmcdaniels', 28006898::bigint, 29813790::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-brandonmiller', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-aarongordon', 36350680::bigint, 39043323::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-treymurphy', 29000000::bigint, 31000000::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-zionwilliamson', 44886930::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-ivicazubac', 21790300::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-deaaronfox', 53784000::bigint, 57768000::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-keyontegeorge', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-nickeilalexanderwalker', 15161800::bigint, 15919890::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-dariusgarland', 44886930::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-domantassabonis', 48608000::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-ausarthompson', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-michaelporter', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-juliusrandle', 35802468::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-traeyoung', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.salaryswish.com/players/trae-young'),
  ('nba-gm-draft-paulgeorge', 56586670::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-damianlillard', null::bigint, null::bigint, 'INCOMPLETE_AMBIGUOUS_HISTORICAL_MATCH', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-mikalbridges', 36160714::bigint, 38839285::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-alexcaruso', 20998320::bigint, 22446480::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-dillonbrooks', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-jarrettallen', 30240000::bigint, 32480000::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-paytonpritchard', 8303571::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-tylerherro', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-casonwallace', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-ajaymitchell', 2850000::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-isaiahhartenstein', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.salaryswish.com/players/isaiah-hartenstein'),
  ('nba-gm-draft-joshhart', 22375280::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-normanpowell', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.salaryswish.com/players/norman-powell'),
  ('nba-gm-draft-fredvanvleet', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-jrueholiday', 37200000::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-vjedgecombe', 12219720::bigint, 15445727::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-andrewnembhard', 20998320::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-nazreid', 25000000::bigint, 26724138::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-joshgiddey', 25000000::bigint, 25000000::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-devinvassell', 24652174::bigint, 27000000::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-donovanclingan', 9550298::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-ayodosunmu', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.salaryswish.com/players/ayo-dosunmu'),
  ('nba-gm-draft-jalensuggs', 29600000::bigint, 26800000::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-peytonwatson', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.salaryswish.com/players/peyton-watson'),
  ('nba-gm-draft-dysondaniels', 25000000::bigint, 25000000::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-walkerkessler', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.salaryswish.com/players/walker-kessler'),
  ('nba-gm-draft-cameronboozer', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://hoopsmatic.com/salary-season-finder/draft/2026/'),
  ('nba-gm-draft-collinmurrayboyles', 6966000::bigint, 8874684::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-toumanicamara', 19526786::bigint, 20973214::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-tobiasharris', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.salaryswish.com/players/tobias-harris'),
  ('nba-gm-draft-rjbarrett', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-onyekaokongwu', 16880000::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-jamorant', 44886930::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-dejountemurray', 30751504::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-matasbuzelis', 7584283::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-ajdybantsa', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://hoopsmatic.com/salary-season-finder/draft/2026/'),
  ('nba-gm-draft-brandoningram', 41904762::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-demarderozan', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://www.salaryswish.com/players/demar-derozan'),
  ('nba-gm-draft-zachlavine', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-cjmccollum', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-alexandresarr', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.salaryswish.com/players/alexandre-sarr'),
  ('nba-gm-draft-immanuelquickley', 32500000::bigint, 32500000::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-shaedonsharpe', 21696429::bigint, 23303571::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-mylesturner', 27850077::bigint, 29115990::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-draymondgreen', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-jimmybutler', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-herbjones', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.salaryswish.com/players/herbert-jones'),
  ('nba-gm-draft-duncanrobinson', 15151222::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-julianchampagnie', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.salaryswish.com/players/julian-champagnie'),
  ('nba-gm-draft-isaiahjoe', 11323006::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-camspencer', 2616754::bigint, 2830685::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-osoighodaro', 2486995::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-sandromamukelashvili', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.salaryswish.com/players/sandro-mamukelashvili'),
  ('nba-gm-draft-samhauser', 11651785::bigint, 12455356::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-neemiasqueta', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://www.salaryswish.com/players/neemias-queta'),
  ('nba-gm-draft-lukekennard', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.salaryswish.com/players/luke-kennard'),
  ('nba-gm-draft-mosesmoody', 13425925::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-trejohnson', 9061680::bigint, 11490211::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-kellyoubre', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.salaryswish.com/players/kelly-oubrejr'),
  ('nba-gm-draft-dontedivincenzo', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-cameronjohnson', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-kelelware', 7135992::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-reedsheppard', 14041625::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-jabarismith', 21751940::bigint, 23643411::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-tarieason', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.salaryswish.com/players/tari-eason'),
  ('nba-gm-draft-pjwashington', 21398088::bigint, 22983132::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-najimarshall', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-graysonallen', 19375000::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-tyjerome', 9659100::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-santialdama', 17007043::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-klaythompson', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-brandinpodziemski', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-keeganmurray', 26068965::bigint, 27999999::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-jonathankuminga', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.salaryswish.com/players/jonathan-kuminga'),
  ('nba-gm-draft-brucethornton', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.basketball-reference.com/contracts/players.html'),
  ('nba-gm-draft-bradensmith', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://www.salaryswish.com/players/braden-smith'),
  ('nba-gm-draft-babamiller', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.basketball-reference.com/contracts/players.html'),
  ('nba-gm-draft-meleekthomas', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.basketball-reference.com/contracts/players.html'),
  ('nba-gm-draft-adaymara', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://hoopsmatic.com/salary-season-finder/draft/2026/'),
  ('nba-gm-draft-trevonbrazile', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.salaryswish.com/players/trevon-brazile'),
  ('nba-gm-draft-aaronwiggins', 8345797::bigint, 8345797::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-luguentzdort', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-jocklandale', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-coreykispert', 13050000::bigint, 13050000::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-kingstonflemings', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://hoopsmatic.com/salary-season-finder/draft/2026/'),
  ('nba-gm-draft-asanewell', 3560880::bigint, 6042814::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-dorianfinneysmith', 13335000::bigint, 13335000::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-jordanwalsh', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-baylorscheierman', 4952993::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-hugogonzalez', 3062640::bigint, 5528065::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-mikeconley', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://www.salaryswish.com/players/mike-conley'),
  ('nba-gm-draft-mitchellrobinson', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.salaryswish.com/players/mitchell-robinson'),
  ('nba-gm-draft-lukagarza', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-keonellis', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.salaryswish.com/players/keon-ellis'),
  ('nba-gm-draft-mikelbrown', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://hoopsmatic.com/salary-season-finder/draft/2026/'),
  ('nba-gm-draft-egordemin', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.salaryswish.com/players/egor-demin'),
  ('nba-gm-draft-dayronsharpe', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.salaryswish.com/players/dayron-sharpe'),
  ('nba-gm-draft-noahclowney', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-nolantraore', 4193040::bigint, 6457282::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-moritzwagner', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.salaryswish.com/players/moritz-wagner'),
  ('nba-gm-draft-calebwilson', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://hoopsmatic.com/salary-season-finder/draft/2026/'),
  ('nba-gm-draft-jalensmith', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-trejones', 8000000::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-isaacokoro', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-noaessengue', 5972760::bigint, 8230464::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-leonardmiller', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-buddyhield', 10097560::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-dennisschroder', 15514400::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-sionjames', 2525901::bigint, 2735698::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-moussadiabate', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-royceoneale', 11625000::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-tidjanesalaun', 10445633::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-hannessteinbach', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://hoopsmatic.com/salary-season-finder/draft/2026/'),
  ('nba-gm-draft-ryankalkbrenner', 2525901::bigint, 2735698::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-sammerrill', 9839285::bigint, 10517856::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-jaylontyson', 5641500::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-mariohezonja', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://www.salaryswish.com/players/mario-hezonja'),
  ('nba-gm-draft-tyreseproctor', 2525901::bigint, 2735698::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-craigporter', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-danissjenkins', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-kevinhuerter', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.salaryswish.com/players/kevin-huerter'),
  ('nba-gm-draft-javontegreen', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://www.salaryswish.com/players/javonte-green'),
  ('nba-gm-draft-johncollins', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.salaryswish.com/players/john-collins'),
  ('nba-gm-draft-paulreed', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-ronaldholland', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.salaryswish.com/players/ron-holland-ii'),
  ('nba-gm-draft-aaronnesmith', 19418000::bigint, 20971440::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-quentonjackson', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.salaryswish.com/players/quenton-jackson'),
  ('nba-gm-draft-bensheppard', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-tjmcconnell', 11800000::bigint, 11800000::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-obitoppin', 16025000::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-jaracewalker', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-davionmitchell', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-pellelarsson', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-timhardaway', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-drusmith', 2934742::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-andrewwiggins', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-bobbyportis', 15597074::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-jaimejaquez', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-ryanrollins', 4000000::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-kasparasjakucionis', 4024440::bigint, 6205687::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-ajgreen', 10848215::bigint, 11651786::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-braydenburries', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://hoopsmatic.com/salary-season-finder/draft/2026/'),
  ('nba-gm-draft-kylekuzma', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-nateament', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://hoopsmatic.com/salary-season-finder/draft/2026/'),
  ('nba-gm-draft-landryshamet', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.salaryswish.com/players/landry-shamet'),
  ('nba-gm-draft-milesmcbride', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-tylerkolek', 2486995::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-josealvarado', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.salaryswish.com/players/jose-alvarado'),
  ('nba-gm-draft-andredrummond', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://www.salaryswish.com/players/andre-drummond'),
  ('nba-gm-draft-anthonyblack', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-jevoncarter', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://www.salaryswish.com/players/jevon-carter'),
  ('nba-gm-draft-jaserichardson', 3282000::bigint, 5910882::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-tristandasilva', 6138466::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-wendellcarter', 19550160::bigint, 20998320::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-gogabitadze', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-kentaviouscaldwellpope', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://www.basketball-reference.com/contracts/PHI.html'),
  ('nba-gm-draft-anferneesimons', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.basketball-reference.com/contracts/PHI.html'),
  ('nba-gm-draft-labaronphilon', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://hoopsmatic.com/salary-season-finder/draft/2026/'),
  ('nba-gm-draft-deanwade', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.basketball-reference.com/contracts/PHI.html'),
  ('nba-gm-draft-adembona', 2486995::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-jabariwalker', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://www.basketball-reference.com/contracts/PHI.html'),
  ('nba-gm-draft-jakobewalter', 5870172::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-jamalshead', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-allengraves', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://hoopsmatic.com/salary-season-finder/draft/2026/'),
  ('nba-gm-draft-jamisonbattle', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-traycejacksondavis', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-jakobpoeltl', 27300000::bigint, 29484000::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-bilalcoulibaly', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-kyshawngeorge', 5435892::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-bubcarrington', 7257730::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-justinchampagnie', 3005085::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-khrismiddleton', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.salaryswish.com/players/khris-middleton'),
  ('nba-gm-draft-tremann', 8000000::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-deandreayton', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-maxchristie', 8857143::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-marcussasser', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-zaccharierisacher', 17434637::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-danielgafford', 18126763::bigint, 18989942::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-morezjohnson', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://hoopsmatic.com/salary-season-finder/draft/2026/'),
  ('nba-gm-draft-derecklively', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-christianbraun', 23275863::bigint, 25000000::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-tyusjones', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://www.salaryswish.com/players/tyus-jones'),
  ('nba-gm-draft-julianstrawther', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-marvinbagley', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://www.salaryswish.com/players/marvin-bagleyiii'),
  ('nba-gm-draft-camwhitmore', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-zekennaji', 7466667::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-deanthonymelton', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.salaryswish.com/players/deanthony-melton'),
  ('nba-gm-draft-willrichard', 2525901::bigint, 2735698::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-brandonwilliams', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://www.salaryswish.com/players/brandon-williams'),
  ('nba-gm-draft-garypayton', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://www.salaryswish.com/players/gary-paytonii'),
  ('nba-gm-draft-guisantos', 5000000::bigint, 5370370::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-kristapsporzingis', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.salaryswish.com/players/kristaps-porzingis'),
  ('nba-gm-draft-alhorford', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.salaryswish.com/players/al-horford'),
  ('nba-gm-draft-marcussmart', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.salaryswish.com/players/marcus-smart'),
  ('nba-gm-draft-bogdanbogdanovic', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://www.salaryswish.com/players/bogdan-bogdanovic'),
  ('nba-gm-draft-clintcapela', 7370000::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-stevenadams', 11869566::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-oscartshiebwe', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://www.salaryswish.com/players/oscar-tshiebwe'),
  ('nba-gm-draft-krisdunn', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-keatonwagler', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://hoopsmatic.com/salary-season-finder/draft/2026/'),
  ('nba-gm-draft-gradeydick', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-ruihachimura', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.salaryswish.com/players/rui-hachimura'),
  ('nba-gm-draft-derrickjones', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-isaiahjackson', 6400000::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-brooklopez', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-quentingrimes', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.salaryswish.com/players/quentin-grimes'),
  ('nba-gm-draft-matissethybulle', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://www.salaryswish.com/players/matisse-thybulle'),
  ('nba-gm-draft-collinsexton', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.salaryswish.com/players/collin-sexton'),
  ('nba-gm-draft-ziairewilliams', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://www.salaryswish.com/players/ziaire-williams'),
  ('nba-gm-draft-jakelaravia', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-jarredvanderbilt', 13285714::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-cedriccoward', 6286920::bigint, 8342743::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-jaylenwells', 2486995::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-jeramigrant', 36413790::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-isaiahstewart', 15000000::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-zachedey', 8067937::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-scottypippen', 2789215::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-ggjackson', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-terrenceshannon', 5054159::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-treylyles', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://www.salaryswish.com/players/trey-lyles'),
  ('nba-gm-draft-joanberinger', 4621200::bigint, 7098163::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-boneshyland', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://www.salaryswish.com/players/nahshon-bones-hyland'),
  ('nba-gm-draft-jaylenclark', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.salaryswish.com/players/jaylen-clark'),
  ('nba-gm-draft-jeremiahfears', 8271960::bigint, 10505389::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-bennedictmathurin', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.salaryswish.com/players/bennedict-mathurin'),
  ('nba-gm-draft-jordanpoole', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-saddiqbey', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-derikqueen', 5673840::bigint, 8107918::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-yvesmissi', 5595827::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-jaredmccain', 6784268::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-joshdix', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://hoops-hype-us-west1-664912083968.us-west1.run.app/salaries/teams/oklahoma-city-thunder/25/'),
  ('nba-gm-draft-kenrichwilliams', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://www.salaryswish.com/players/kenrich-williams'),
  ('nba-gm-draft-jaylinwilliams', 7774648::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-thomassorber', 5120400::bigint, 7849573::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-milesbridges', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-jalengreen', 36000000::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-collingillespie', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.salaryswish.com/players/collin-gillespie'),
  ('nba-gm-draft-jordangoodwin', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.salaryswish.com/players/jordan-goodwin'),
  ('nba-gm-draft-khamanmaluach', 6617160::bigint, 8436880::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-markwilliams', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.salaryswish.com/players/mark-williams'),
  ('nba-gm-draft-sidycissoko', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-scoothenderson', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-robertwilliams', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.salaryswish.com/players/robert-williamsiii'),
  ('nba-gm-draft-micahpotter', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-yanghansen', 4864920::bigint, 7462788::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-vitkrejci', 3005085::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-dariusacuff', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://hoopsmatic.com/salary-season-finder/draft/2026/'),
  ('nba-gm-draft-preciousachiuwa', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.salaryswish.com/players/precious-achiuwa'),
  ('nba-gm-draft-deandrehunter', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-malikmonk', 21582451::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-niqueclifford', 3418800::bigint, 5979481::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-maximeraynaud', 2525901::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-keldonjohnson', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-lukekornet', 9900000::bigint, 9350000::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-carterbryant', 5390640::bigint, 7983539::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-harrisonbarnes', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-tarrisreed', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.basketball-reference.com/contracts/SAS.html'),
  ('nba-gm-draft-darrynpeterson', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://hoopsmatic.com/salary-season-finder/draft/2026/'),
  ('nba-gm-draft-acebailey', 9976560::bigint, 12640302::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-isaiahcollier', 4988948::bigint, null::bigint, 'JULY_2026_SCHEDULE_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-joshgreen', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-joshokogie', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.salaryswish.com/players/josh-okogie'),
  ('nba-gm-draft-bricesensabaugh', null::bigint, null::bigint, 'FIRST_YEAR_ONLY_REVERIFY', 'https://github.com/mjllkzy/Basketball-Savant/blob/main/data/raw/player_contracts_2025_2031.json'),
  ('nba-gm-draft-jaxsonhayes', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.salaryswish.com/players/jaxson-hayes'),
  ('nba-gm-draft-jusufnurkic', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.salaryswish.com/players/jusuf-nurkic'),
  ('nba-gm-draft-mobamba', null::bigint, null::bigint, 'INCOMPLETE_NO_MATCHING_FUTURE_SCHEDULE', 'https://www.salaryswish.com/players/mo-bamba')
) as s(player_id,y2,y3,status,url)
where c.player_id=s.player_id;

comment on column private.nba_gm_contract_candidates_2026_27.provisional_average_salary is
  'Average of real signed seasonal salary within 2026-27..2028-29, truncated at actual agreement expiry, NULL on unsourced future salaries. Not approved or live.';

-- Activation requires 330 independently certified signed salary schedules,
-- not merely 330 single-year salary snapshots and end dates.
create or replace function private.nba_gm_v4_salary_certified()
returns boolean language sql stable security definer set search_path='' as $$
  select (select count(*) from private.nba_gm_contract_candidates_2026_27)=330
    and (select count(*) from private.nba_gm_contract_candidates_2026_27
      where independently_verified and salary_schedule_verified
        and candidate_contract in ('1YR','3YR') and candidate_salary>0
        and actual_end_season is not null and source_url ~ '^https://'
        and salary_schedule_url ~ '^https://'
        and provisional_average_salary>0
        and average_window_years=least(3,greatest(1,split_part(actual_end_season,'-',1)::integer-2026+1))
        and (average_window_years=1 or signed_salary_2027_28>0)
        and (average_window_years<3 or signed_salary_2028_29>0)
     )=330;
$$;
revoke all on function private.nba_gm_v4_salary_certified()
  from public, anon, authenticated;

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
  select provisional_average_salary into v_start
    from private.nba_gm_contract_candidates_2026_27 where player_id=p_id;
  if v_start is null then raise exception 'NBA GM V4 averaged salary has incomplete sourced schedule'; end if;
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
  'Opt-in NBA GM V4 uses documented signed-year average of 2026-27, 2027-28, and 2028-29 as applicable; all 330 schedules must be independently source-verified. NOT live.';

