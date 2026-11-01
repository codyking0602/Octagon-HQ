-- NBA GM private current-source corrections, no runtime game activation.
-- Preserves original 330 game IDs and prior saved V2/V3 economics.
-- Current BRef annual salary comparison exposed 2026 extensions and dead-money
-- confusion. 330 player rows remain independently unverified until source audit.
update private.nba_gm_contract_candidates_2026_27 c
set candidate_salary=s.y1,
 signed_salary_2027_28=s.y2,
 signed_salary_2028_29=s.y3,
 provisional_average_salary=s.average_salary,
 average_window_years=s.window_seasons,
 actual_end_season=s.signed_through,
 candidate_contract=s.game_term,
 salary_schedule_status=s.status,
 salary_schedule_url=s.schedule_url,
 independently_verified=false,
 salary_schedule_verified=false
from (values
('nba-gm-draft-donovanmitchell',50105628::bigint,60911900::bigint,65784852::bigint,58934127::bigint,3::integer,'2028-29','3YR','CURRENT_BREF_SIGNED_EXTENSION_TERM_UPDATED_PENDING_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-damianlillard',13398800::bigint,14104000::bigint,null::bigint,13751400::bigint,2::integer,'2027-28','1YR','CURRENT_ACTIVE_TEAM_CONTRACT_EXCLUDES_DEAD_MONEY_PENDING_SECOND_CHECK','https://www.basketball-reference.com/contracts/POR.html'),
('nba-gm-draft-dillonbrooks',19992727::bigint,22530864::bigint,24333333::bigint,22285641::bigint,3::integer,'2028-29','3YR','CURRENT_BREF_SIGNED_EXTENSION_TERM_UPDATED_PENDING_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-paytonpritchard',7767857::bigint,8303571::bigint,21228200::bigint,12433209::bigint,3::integer,'2028-29','3YR','CURRENT_BREF_SIGNED_EXTENSION_TERM_UPDATED_PENDING_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-casonwallace',7420806::bigint,23965517::bigint,25882759::bigint,19089694::bigint,3::integer,'2028-29','3YR','CURRENT_BREF_SIGNED_EXTENSION_TERM_UPDATED_PENDING_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-demarderozan',2449421::bigint,null::bigint,null::bigint,2449421::bigint,1::integer,'2026-27','1YR','CURRENT_BREF_YEAR_MISMATCH_CORRECTED_PENDING_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-osoighodaro',2296271::bigint,2486995::bigint,8950617::bigint,4577961::bigint,3::integer,'2028-29','3YR','CURRENT_BREF_SIGNED_EXTENSION_TERM_UPDATED_PENDING_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-neemiasqueta',2667944::bigint,12500000::bigint,13500000::bigint,9555981::bigint,3::integer,'2028-29','3YR','CURRENT_BREF_SIGNED_EXTENSION_TERM_UPDATED_PENDING_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-najimarshall',9428571::bigint,18195600::bigint,17285820::bigint,14969997::bigint,3::integer,'2028-29','3YR','CURRENT_BREF_SIGNED_EXTENSION_TERM_UPDATED_PENDING_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-klaythompson',5600000::bigint,5880000::bigint,null::bigint,5740000::bigint,2::integer,'2027-28','1YR','CURRENT_ACTIVE_TEAM_CONTRACT_EXCLUDES_DEAD_MONEY_PENDING_SECOND_CHECK','https://www.basketball-reference.com/contracts/MIA.html'),
('nba-gm-draft-brandinpodziemski',5679459::bigint,18965517::bigint,20482759::bigint,15042578::bigint,3::integer,'2028-29','3YR','CURRENT_BREF_SIGNED_EXTENSION_TERM_UPDATED_PENDING_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-jocklandale',14100000::bigint,null::bigint,null::bigint,14100000::bigint,1::integer,'2026-27','1YR','CURRENT_BREF_YEAR_MISMATCH_CORRECTED_PENDING_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-jordanwalsh',2406205::bigint,4629630::bigint,5000000::bigint,4011945::bigint,3::integer,'2028-29','3YR','CURRENT_BREF_SIGNED_EXTENSION_TERM_UPDATED_PENDING_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-mikeconley',2449421::bigint,null::bigint,null::bigint,2449421::bigint,1::integer,'2026-27','1YR','CURRENT_BREF_YEAR_MISMATCH_CORRECTED_PENDING_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-mariohezonja',2449421::bigint,null::bigint,null::bigint,2449421::bigint,1::integer,'2026-27','1YR','CURRENT_BREF_YEAR_MISMATCH_CORRECTED_PENDING_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-pellelarsson',2296271::bigint,13392857::bigint,14464286::bigint,10051138::bigint,3::integer,'2028-29','3YR','CURRENT_BREF_SIGNED_EXTENSION_TERM_UPDATED_PENDING_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-andrewwiggins',30169644::bigint,16346154::bigint,17653846::bigint,21389881::bigint,3::integer,'2028-29','3YR','CURRENT_BREF_SIGNED_EXTENSION_TERM_UPDATED_PENDING_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-andredrummond',2449421::bigint,null::bigint,null::bigint,2449421::bigint,1::integer,'2026-27','1YR','CURRENT_BREF_YEAR_MISMATCH_CORRECTED_PENDING_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-jevoncarter',2449421::bigint,null::bigint,null::bigint,2449421::bigint,1::integer,'2026-27','1YR','CURRENT_BREF_YEAR_MISMATCH_CORRECTED_PENDING_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-kentaviouscaldwellpope',2449421::bigint,null::bigint,null::bigint,2449421::bigint,1::integer,'2026-27','1YR','CURRENT_ACTIVE_TEAM_CONTRACT_EXCLUDES_DEAD_MONEY_PENDING_SECOND_CHECK','https://www.basketball-reference.com/contracts/PHI.html'),
('nba-gm-draft-jamalshead',2296271::bigint,7407407::bigint,8000000::bigint,5901226::bigint,3::integer,'2028-29','3YR','CURRENT_BREF_SIGNED_EXTENSION_TERM_UPDATED_PENDING_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-tyusjones',2449421::bigint,null::bigint,null::bigint,2449421::bigint,1::integer,'2026-27','1YR','CURRENT_BREF_YEAR_MISMATCH_CORRECTED_PENDING_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-marvinbagley',2449421::bigint,null::bigint,null::bigint,2449421::bigint,1::integer,'2026-27','1YR','CURRENT_BREF_YEAR_MISMATCH_CORRECTED_PENDING_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-camwhitmore',1819437::bigint,1819437::bigint,1819437::bigint,1819437::bigint,3::integer,'2028-29','3YR','CURRENT_BREF_SIGNED_EXTENSION_TERM_UPDATED_PENDING_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-brandonwilliams',2449421::bigint,null::bigint,null::bigint,2449421::bigint,1::integer,'2026-27','1YR','CURRENT_BREF_YEAR_MISMATCH_CORRECTED_PENDING_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-garypayton',2449421::bigint,null::bigint,null::bigint,2449421::bigint,1::integer,'2026-27','1YR','CURRENT_BREF_YEAR_MISMATCH_CORRECTED_PENDING_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-bogdanbogdanovic',2449421::bigint,null::bigint,null::bigint,2449421::bigint,1::integer,'2026-27','1YR','CURRENT_BREF_YEAR_MISMATCH_CORRECTED_PENDING_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-matissethybulle',2449421::bigint,null::bigint,null::bigint,2449421::bigint,1::integer,'2026-27','1YR','CURRENT_BREF_YEAR_MISMATCH_CORRECTED_PENDING_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-ziairewilliams',2449421::bigint,null::bigint,null::bigint,2449421::bigint,1::integer,'2026-27','1YR','CURRENT_BREF_YEAR_MISMATCH_CORRECTED_PENDING_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-treylyles',2449421::bigint,null::bigint,null::bigint,2449421::bigint,1::integer,'2026-27','1YR','CURRENT_BREF_YEAR_MISMATCH_CORRECTED_PENDING_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-saddiqbey',6440678::bigint,17129630::bigint,18500000::bigint,14023436::bigint,3::integer,'2028-29','3YR','CURRENT_BREF_SIGNED_EXTENSION_TERM_UPDATED_PENDING_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html')
) as s(player_id,y1,y2,y3,average_salary,window_seasons,signed_through,game_term,status,schedule_url)
where c.player_id=s.player_id;
