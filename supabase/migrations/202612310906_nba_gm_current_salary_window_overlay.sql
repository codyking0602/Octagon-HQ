-- Owner-approved salary average window research; not yet independently verified.
-- 81 current-source corrections to private staged 330-player candidate economy.
-- New salary averages do not activate V4: all independent review flags remain false.
-- No existing game catalog, existing saves, legacy pricing or public RPC changes.
update private.nba_gm_contract_candidates_2026_27 as c
set candidate_salary=s.y1,
    signed_salary_2027_28=s.y2,
    signed_salary_2028_29=s.y3,
    provisional_average_salary=s.annual_avg,
    average_window_years=s.window_count,
    candidate_contract=s.game_term,
    actual_end_season=s.real_end,
    salary_schedule_url=s.source_url,
    salary_schedule_status=s.source_status,
    verification_status=s.source_status,
    independently_verified=false,
    salary_schedule_verified=false
from (values
('nba-gm-draft-stephencurry',62587158::bigint,55700000::bigint,60156000::bigint,59481053::bigint,3::integer,'2028-29','3YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-kawhileonard',50300000::bigint,56097561::bigint,58902439::bigint,55100000::bigint,3::integer,'2028-29','3YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-brandonmiller',15104626::bigint,36034483::bigint,38917241::bigint,30018783::bigint,3::integer,'2031-32','3YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-amenthompson',12258609::bigint,35862069::bigint,38731034::bigint,28950571::bigint,3::integer,'2031-32','3YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-ausarthompson',11117925::bigint,26724138::bigint,28862069::bigint,22234711::bigint,3::integer,'2031-32','3YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-keyontegeorge',6563925::bigint,28700000::bigint,29848000::bigint,21703975::bigint,3::integer,'2031-32','3YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-lebronjames',3876529::bigint,4070355::bigint,null::bigint,3973442::bigint,2::integer,'2027-28','1YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-austinreaves',41240250::bigint,44539470::bigint,47838690::bigint,44539470::bigint,3::integer,'2029-30','3YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-jamesharden',30647619::bigint,32180000::bigint,33712381::bigint,32180000::bigint,3::integer,'2028-29','3YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-jalenduren',40160643::bigint,36947792::bigint,38955824::bigint,38688086::bigint,3::integer,'2030-31','3YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-walkerkessler',30232558::bigint,31744186::bigint,33255814::bigint,31744186::bigint,3::integer,'2029-30','3YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-cameronboozer',11849760::bigint,12441840::bigint,13034880::bigint,12442160::bigint,3::integer,'2029-30','3YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-ajdybantsa',14748000::bigint,15485760::bigint,16223040::bigint,15485600::bigint,3::integer,'2029-30','3YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-herbjones',14898786::bigint,20858300::bigint,22526964::bigint,19428017::bigint,3::integer,'2029-30','3YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-tarieason',14051724::bigint,15175862::bigint,16300000::bigint,15175862::bigint,3::integer,'2030-31','3YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-darrynpeterson',13195320::bigint,13855320::bigint,14515320::bigint,13855320::bigint,3::integer,'2029-30','3YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-jusufnurkic',10576923::bigint,11423077::bigint,null::bigint,11000000::bigint,2::integer,'2027-28','1YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-mobamba',3286399::bigint,3681991::bigint,null::bigint,3484195::bigint,2::integer,'2027-28','1YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-normanpowell',21500000::bigint,22575000::bigint,null::bigint,22037500::bigint,2::integer,'2027-28','1YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-julianchampagnie',13888889::bigint,15000000::bigint,16111111::bigint,15000000::bigint,3::integer,'2028-29','3YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-sandromamukelashvili',13000000::bigint,12350000::bigint,13000000::bigint,12783333::bigint,3::integer,'2029-30','3YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-lukekennard',6064000::bigint,6367200::bigint,null::bigint,6215600::bigint,2::integer,'2027-28','1YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-kellyoubre',8050000::bigint,8450000::bigint,null::bigint,8250000::bigint,2::integer,'2027-28','1YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-mitchellrobinson',15044000::bigint,15796200::bigint,16548400::bigint,15796200::bigint,3::integer,'2028-29','3YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-moritzwagner',9268293::bigint,9731707::bigint,null::bigint,9500000::bigint,2::integer,'2027-28','1YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-calebwilson',10683720::bigint,11217960::bigint,11752320::bigint,11218000::bigint,3::integer,'2029-30','3YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-morezjohnson',6754800::bigint,7093080::bigint,7430640::bigint,7092840::bigint,3::integer,'2029-30','3YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-keatonwagler',9674760::bigint,10158240::bigint,10641960::bigint,10158320::bigint,3::integer,'2029-30','3YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-dariusacuff',8021640::bigint,8422920::bigint,8823600::bigint,8422720::bigint,3::integer,'2029-30','3YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-nateament',5502000::bigint,5777280::bigint,6052200::bigint,5777160::bigint,3::integer,'2029-30','3YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-allengraves',4065720::bigint,4268880::bigint,4472640::bigint,4269080::bigint,3::integer,'2029-30','3YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-tarrisreed',3076920::bigint,3230520::bigint,3384480::bigint,3230640::bigint,3::integer,'2029-30','3YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-alhorford',6822000::bigint,7163100::bigint,null::bigint,6992550::bigint,2::integer,'2027-28','1YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-deanthonymelton',5477000::bigint,5750850::bigint,null::bigint,5613925::bigint,2::integer,'2027-28','1YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-khrismiddleton',5591122::bigint,5870678::bigint,6150234::bigint,5870678::bigint,3::integer,'2028-29','3YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-preciousachiuwa',5477000::bigint,5750850::bigint,null::bigint,5613925::bigint,2::integer,'2027-28','1YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-landryshamet',5357143::bigint,5785714::bigint,6214286::bigint,5785714::bigint,3::integer,'2029-30','3YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-jaylenclark',3086420::bigint,3333334::bigint,3580246::bigint,3333333::bigint,3::integer,'2028-29','3YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-collingillespie',10714286::bigint,11571429::bigint,12428571::bigint,11571429::bigint,3::integer,'2029-30','3YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-collinsexton',9366000::bigint,9834300::bigint,null::bigint,9600150::bigint,2::integer,'2027-28','1YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-joshokogie',6000000::bigint,6000000::bigint,null::bigint,6000000::bigint,2::integer,'2027-28','1YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-jaxsonhayes',6000000::bigint,6000000::bigint,null::bigint,6000000::bigint,2::integer,'2027-28','1YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-anferneesimons',6000000::bigint,6300000::bigint,null::bigint,6150000::bigint,2::integer,'2027-28','1YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-dayronsharpe',10000000::bigint,10000000::bigint,null::bigint,10000000::bigint,2::integer,'2027-28','1YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-johncollins',17000000::bigint,17000000::bigint,17000000::bigint,17000000::bigint,3::integer,'2028-29','3YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-ruihachimura',14000000::bigint,14000000::bigint,null::bigint,14000000::bigint,2::integer,'2027-28','1YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-quentingrimes',13953489::bigint,14651163::bigint,15348837::bigint,14651163::bigint,3::integer,'2029-30','3YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-josealvarado',4500000::bigint,4860000::bigint,5220000::bigint,4860000::bigint,3::integer,'2028-29','3YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-braydenburries',6417360::bigint,6738000::bigint,7058520::bigint,6737960::bigint,3::integer,'2029-30','3YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-babamiller',1705630::bigint,2294370::bigint,2694363::bigint,2231454::bigint,3::integer,'2029-30','3YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-meleekthomas',1357763::bigint,2294370::bigint,2694363::bigint,2115499::bigint,3::integer,'2029-30','3YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-brucethornton',1357763::bigint,2294370::bigint,2694363::bigint,2115499::bigint,3::integer,'2029-30','3YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-trevonbrazile',1357763::bigint,null::bigint,null::bigint,1357763::bigint,1::integer,'2026-27','1YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-egordemin',7233720::bigint,7578240::bigint,9639522::bigint,8150494::bigint,3::integer,'2028-29','3YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-robertwilliams',13968254::bigint,14666667::bigint,15365079::bigint,14666667::bigint,3::integer,'2028-29','3YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-traeyoung',49488300::bigint,50478066::bigint,54437130::bigint,51467832::bigint,3::integer,'2029-30','3YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-tyresemaxey',40770520::bigint,43582280::bigint,46394040::bigint,43582280::bigint,3::integer,'2028-29','3YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-victorwembanyama',16868246::bigint,43500000::bigint,46980000::bigint,35782749::bigint,3::integer,'2031-32','3YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-joelembiid',58100000::bigint,62748000::bigint,67396000::bigint,62748000::bigint,3::integer,'2028-29','3YR','CURRENT_BREF_SINGLE_SOURCE_NEEDS_SECOND_CHECK','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-damianlillard',35915403::bigint,36620603::bigint,22516603::bigint,31684203::bigint,3::integer,'2029-30','3YR','BREF_DUPLICATE_WAIVED_CONTRACT_ACCOUNTS_REVIEW','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-isaiahhartenstein',23148148::bigint,25000000::bigint,26851852::bigint,25000000::bigint,3::integer,'2028-29','3YR','CURRENT_BREF_OR_SALARYSWISH_SECOND_SOURCE_REVIEW_REQUIRED','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-ayodosunmu',19310345::bigint,20855173::bigint,22400001::bigint,20855173::bigint,3::integer,'2030-31','3YR','CURRENT_BREF_OR_SALARYSWISH_SECOND_SOURCE_REVIEW_REQUIRED','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-peytonwatson',20465116::bigint,21488372::bigint,22511628::bigint,21488372::bigint,3::integer,'2029-30','3YR','CURRENT_BREF_OR_SALARYSWISH_SECOND_SOURCE_REVIEW_REQUIRED','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-tobiasharris',15044000::bigint,15796200::bigint,null::bigint,15420100::bigint,2::integer,'2027-28','1YR','CURRENT_BREF_OR_SALARYSWISH_SECOND_SOURCE_REVIEW_REQUIRED','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-alexandresarr',12370680::bigint,15611798::bigint,null::bigint,13991239::bigint,2::integer,'2027-28','1YR','CURRENT_BREF_OR_SALARYSWISH_SECOND_SOURCE_REVIEW_REQUIRED','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-jonathankuminga',6064000::bigint,6367200::bigint,null::bigint,6215600::bigint,2::integer,'2027-28','1YR','CURRENT_BREF_OR_SALARYSWISH_SECOND_SOURCE_REVIEW_REQUIRED','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-adaymara',5791680::bigint,6081480::bigint,6371160::bigint,6081440::bigint,3::integer,'2029-30','3YR','CURRENT_BREF_OR_SALARYSWISH_SECOND_SOURCE_REVIEW_REQUIRED','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-kingstonflemings',7348680::bigint,7716120::bigint,8083680::bigint,7716160::bigint,3::integer,'2029-30','3YR','CURRENT_BREF_OR_SALARYSWISH_SECOND_SOURCE_REVIEW_REQUIRED','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-keonellis',8780488::bigint,9219512::bigint,null::bigint,9000000::bigint,2::integer,'2027-28','1YR','CURRENT_BREF_OR_SALARYSWISH_SECOND_SOURCE_REVIEW_REQUIRED','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-mikelbrown',8787000::bigint,9226440::bigint,9666000::bigint,9226480::bigint,3::integer,'2029-30','3YR','CURRENT_BREF_OR_SALARYSWISH_SECOND_SOURCE_REVIEW_REQUIRED','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-hannessteinbach',5227200::bigint,5488560::bigint,5750160::bigint,5488640::bigint,3::integer,'2029-30','3YR','CURRENT_BREF_OR_SALARYSWISH_SECOND_SOURCE_REVIEW_REQUIRED','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-kevinhuerter',8333333::bigint,9000000::bigint,9666667::bigint,9000000::bigint,3::integer,'2028-29','3YR','CURRENT_BREF_OR_SALARYSWISH_SECOND_SOURCE_REVIEW_REQUIRED','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-quentonjackson',2584539::bigint,2934742::bigint,null::bigint,2759641::bigint,2::integer,'2027-28','1YR','CURRENT_BREF_OR_SALARYSWISH_SECOND_SOURCE_REVIEW_REQUIRED','https://www.salaryswish.com/players/quenton-jackson'),
('nba-gm-draft-bobbyportis',14521414::bigint,15597074::bigint,null::bigint,15059244::bigint,2::integer,'2027-28','1YR','CURRENT_BREF_OR_SALARYSWISH_SECOND_SOURCE_REVIEW_REQUIRED','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-labaronphilon',3597120::bigint,3776760::bigint,3956760::bigint,3776880::bigint,3::integer,'2029-30','3YR','CURRENT_BREF_OR_SALARYSWISH_SECOND_SOURCE_REVIEW_REQUIRED','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-deanwade',9000000::bigint,9450000::bigint,9900000::bigint,9450000::bigint,3::integer,'2029-30','3YR','CURRENT_BREF_OR_SALARYSWISH_SECOND_SOURCE_REVIEW_REQUIRED','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-kristapsporzingis',19512195::bigint,20487805::bigint,null::bigint,20000000::bigint,2::integer,'2027-28','1YR','CURRENT_BREF_OR_SALARYSWISH_SECOND_SOURCE_REVIEW_REQUIRED','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-marcussmart',6064000::bigint,6367200::bigint,null::bigint,6215600::bigint,2::integer,'2027-28','1YR','CURRENT_BREF_OR_SALARYSWISH_SECOND_SOURCE_REVIEW_REQUIRED','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-bennedictmathurin',7804878::bigint,8195122::bigint,null::bigint,8000000::bigint,2::integer,'2027-28','1YR','CURRENT_BREF_OR_SALARYSWISH_SECOND_SOURCE_REVIEW_REQUIRED','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-jordangoodwin',5864198::bigint,6333333::bigint,6802469::bigint,6333333::bigint,3::integer,'2028-29','3YR','CURRENT_BREF_OR_SALARYSWISH_SECOND_SOURCE_REVIEW_REQUIRED','https://www.basketball-reference.com/contracts/players.html'),
('nba-gm-draft-markwilliams',11728395::bigint,12666667::bigint,13604938::bigint,12666667::bigint,3::integer,'2028-29','3YR','CURRENT_BREF_OR_SALARYSWISH_SECOND_SOURCE_REVIEW_REQUIRED','https://www.basketball-reference.com/contracts/players.html')
) as s(player_id,y1,y2,y3,annual_avg,window_count,real_end,game_term,source_status,source_url)
where c.player_id=s.player_id;

-- Enforce complete real salary schedule and independently approved evidence
-- for every record before any owner-only game V4 read can be enabled.
create or replace function private.nba_gm_v4_salary_certified()
returns boolean language sql stable security definer set search_path='' as $$
  select (select count(*) from private.nba_gm_contract_candidates_2026_27)=330
   and (select count(*) from private.nba_gm_contract_candidates_2026_27
     where independently_verified and salary_schedule_verified
       and candidate_salary>0 and provisional_average_salary>0
       and candidate_contract in ('1YR','3YR')
       and actual_end_season is not null and source_url ~ '^https://'
       and salary_schedule_url ~ '^https://'
       and average_window_years=least(3,greatest(1,split_part(actual_end_season,'-',1)::integer-2026+1))
       and candidate_contract=case when split_part(actual_end_season,'-',1)::integer>=2028 then '3YR' else '1YR' end
       and (average_window_years=1 or signed_salary_2027_28>0)
       and (average_window_years<3 or signed_salary_2028_29>0)
       and provisional_average_salary=round((candidate_salary
         +case when average_window_years>=2 then signed_salary_2027_28 else 0 end
         +case when average_window_years=3 then signed_salary_2028_29 else 0 end
         )::numeric/average_window_years)::bigint
     )=330;
$$;
revoke all on function private.nba_gm_v4_salary_certified() from public,anon,authenticated;
