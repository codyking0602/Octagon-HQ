-- CFB Superteam authority + shared Weekly Auction storage envelope.
-- Exact owner-reviewed pool: QB 50, RB 50, WR 50, TE 24, Front Seven 60,
-- Secondary 60, Head Coach 35. Player grades are peak single CFB seasons.

alter table private.football_weekly_auction_subjects
  drop constraint if exists football_weekly_auction_subjects_item_kind_check;
alter table private.football_weekly_auction_subjects
  add constraint football_weekly_auction_subjects_item_kind_check
  check (item_kind in ('team-season','player-season','player-career','mixed'));

insert into private.football_weekly_auction_subjects(
  subject_key,display_name,short_label,competition_level,item_kind,
  rotation_order,eligible_from,is_active
) values (
  'cfb-superteam','CFB Superteam','CFB Superteam','CFB','mixed',
  2,date '2026-09-29',true
)
on conflict(subject_key) do update
set display_name=excluded.display_name,
    short_label=excluded.short_label,
    competition_level=excluded.competition_level,
    item_kind=excluded.item_kind,
    rotation_order=excluded.rotation_order,
    eligible_from=excluded.eligible_from,
    is_active=excluded.is_active;

alter table private.football_weekly_auction_board
  drop constraint if exists football_weekly_auction_board_slot_check;
alter table private.football_weekly_auction_board
  add constraint football_weekly_auction_board_slot_check check(slot between 1 and 8);

alter table private.football_weekly_auction_board
  drop constraint if exists football_weekly_auction_board_theme_check;
alter table private.football_weekly_auction_board
  add constraint football_weekly_auction_board_theme_check
  check(theme in ('SEC','Big Ten','Big 12','ACC','Wildcard','NFL','CFB'));

alter table private.football_weekly_auction_bids
  drop constraint if exists football_weekly_auction_bids_slot_check;
alter table private.football_weekly_auction_bids
  add constraint football_weekly_auction_bids_slot_check check(slot between 1 and 8);

alter table private.football_weekly_auction_bids
  drop constraint if exists football_weekly_auction_bids_amount_check;
alter table private.football_weekly_auction_bids
  add constraint football_weekly_auction_bids_amount_check check(amount between 0 and 50);

alter table private.football_weekly_auction_awards
  drop constraint if exists football_weekly_auction_awards_winning_bid_check;
alter table private.football_weekly_auction_awards
  add constraint football_weekly_auction_awards_winning_bid_check check(winning_bid between 0 and 50);

alter table private.football_weekly_auction_bids
  add column if not exists claim_priority integer;
alter table private.football_weekly_auction_bids
  drop constraint if exists football_weekly_auction_bids_claim_priority_check;
alter table private.football_weekly_auction_bids
  add constraint football_weekly_auction_bids_claim_priority_check
  check(claim_priority is null or claim_priority between 1 and 8);

alter table private.football_weekly_auction_awards
  add column if not exists roster_slot text;
alter table private.football_weekly_auction_awards
  drop constraint if exists football_weekly_auction_awards_roster_slot_check;
alter table private.football_weekly_auction_awards
  add constraint football_weekly_auction_awards_roster_slot_check
  check(roster_slot is null or roster_slot in (
    'QB','RB','WR','Flex','Front Seven','Secondary','Head Coach'
  ));

alter table private.football_weekly_auction_awards
  add column if not exists award_source text not null default 'auction';
alter table private.football_weekly_auction_awards
  drop constraint if exists football_weekly_auction_awards_source_check;
alter table private.football_weekly_auction_awards
  add constraint football_weekly_auction_awards_source_check
  check(award_source in ('auction','autofill'));

insert into private.football_weekly_auction_items(
  item_reference,subject_key,season_year,primary_name,secondary_name,team_code,
  board_bucket,identity_group,display_label,hidden_grade,source_url,grading_inputs
)
select
  source.item_reference,
  'cfb-superteam',
  source.peak_season,
  source.display_name,
  source.school,
  null,
  source.candidate_group,
  'cfb-superteam',
  source.display_name || ' · ' || source.school || ' ' || source.peak_season::text,
  source.hidden_grade,
  null,
  jsonb_build_object(
    'group',source.candidate_group,
    'grading_semantic','peak-single-college-season',
    'pool_version','cfb-superteam-2026-09-v1',
    'eligible_slots',
      case source.candidate_group
        when 'QB' then jsonb_build_array('QB')
        when 'RB' then jsonb_build_array('RB','Flex')
        when 'WR' then jsonb_build_array('WR','Flex')
        when 'TE' then jsonb_build_array('Flex')
        when 'Front Seven' then jsonb_build_array('Front Seven')
        when 'Secondary' then jsonb_build_array('Secondary')
        else jsonb_build_array('Head Coach')
      end
  )
from (
  values
    ('cfb-superteam-qb-cam-newton-2010','QB','Cam Newton','Auburn',2010,100),
    ('cfb-superteam-qb-joe-burrow-2019','QB','Joe Burrow','LSU',2019,100),
    ('cfb-superteam-qb-vince-young-2005','QB','Vince Young','Texas',2005,99),
    ('cfb-superteam-qb-marcus-mariota-2014','QB','Marcus Mariota','Oregon',2014,98),
    ('cfb-superteam-qb-lamar-jackson-2016','QB','Lamar Jackson','Louisville',2016,98),
    ('cfb-superteam-qb-jayden-daniels-2023','QB','Jayden Daniels','LSU',2023,98),
    ('cfb-superteam-qb-fernando-mendoza-2025','QB','Fernando Mendoza','Indiana',2025,98),
    ('cfb-superteam-qb-jameis-winston-2013','QB','Jameis Winston','Florida State',2013,97),
    ('cfb-superteam-qb-baker-mayfield-2017','QB','Baker Mayfield','Oklahoma',2017,97),
    ('cfb-superteam-qb-mac-jones-2020','QB','Mac Jones','Alabama',2020,97),
    ('cfb-superteam-qb-sam-bradford-2008','QB','Sam Bradford','Oklahoma',2008,96),
    ('cfb-superteam-qb-robert-griffin-iii-2011','QB','Robert Griffin III','Baylor',2011,96),
    ('cfb-superteam-qb-tua-tagovailoa-2018','QB','Tua Tagovailoa','Alabama',2018,96),
    ('cfb-superteam-qb-kyler-murray-2018','QB','Kyler Murray','Oklahoma',2018,96),
    ('cfb-superteam-qb-bryce-young-2021','QB','Bryce Young','Alabama',2021,96),
    ('cfb-superteam-qb-caleb-williams-2022','QB','Caleb Williams','USC',2022,96),
    ('cfb-superteam-qb-matt-leinart-2004','QB','Matt Leinart','USC',2004,95),
    ('cfb-superteam-qb-andrew-luck-2011','QB','Andrew Luck','Stanford',2011,95),
    ('cfb-superteam-qb-johnny-manziel-2012','QB','Johnny Manziel','Texas A&M',2012,95),
    ('cfb-superteam-qb-deshaun-watson-2016','QB','Deshaun Watson','Clemson',2016,95),
    ('cfb-superteam-qb-justin-fields-2019','QB','Justin Fields','Ohio State',2019,95),
    ('cfb-superteam-qb-alex-smith-2004','QB','Alex Smith','Utah',2004,94),
    ('cfb-superteam-qb-tim-tebow-2007','QB','Tim Tebow','Florida',2007,94),
    ('cfb-superteam-qb-trevor-lawrence-2018','QB','Trevor Lawrence','Clemson',2018,94),
    ('cfb-superteam-qb-cj-stroud-2022','QB','C.J. Stroud','Ohio State',2022,94),
    ('cfb-superteam-qb-bo-nix-2023','QB','Bo Nix','Oregon',2023,94),
    ('cfb-superteam-qb-troy-smith-2006','QB','Troy Smith','Ohio State',2006,93),
    ('cfb-superteam-qb-colt-mccoy-2008','QB','Colt McCoy','Texas',2008,93),
    ('cfb-superteam-qb-russell-wilson-2011','QB','Russell Wilson','Wisconsin',2011,93),
    ('cfb-superteam-qb-dwayne-haskins-2018','QB','Dwayne Haskins','Ohio State',2018,93),
    ('cfb-superteam-qb-jalen-hurts-2019','QB','Jalen Hurts','Oklahoma',2019,93),
    ('cfb-superteam-qb-michael-penix-jr-2023','QB','Michael Penix Jr.','Washington',2023,93),
    ('cfb-superteam-qb-carson-palmer-2002','QB','Carson Palmer','USC',2002,92),
    ('cfb-superteam-qb-jason-white-2003','QB','Jason White','Oklahoma',2003,92),
    ('cfb-superteam-qb-cam-ward-2024','QB','Cam Ward','Miami',2024,92),
    ('cfb-superteam-qb-diego-pavia-2025','QB','Diego Pavia','Vanderbilt',2025,92),
    ('cfb-superteam-qb-colt-brennan-2006','QB','Colt Brennan','Hawaii',2006,91),
    ('cfb-superteam-qb-kellen-moore-2010','QB','Kellen Moore','Boise State',2010,91),
    ('cfb-superteam-qb-teddy-bridgewater-2013','QB','Teddy Bridgewater','Louisville',2013,91),
    ('cfb-superteam-qb-max-duggan-2022','QB','Max Duggan','TCU',2022,91),
    ('cfb-superteam-qb-hendon-hooker-2022','QB','Hendon Hooker','Tennessee',2022,91),
    ('cfb-superteam-qb-pat-white-2007','QB','Pat White','West Virginia',2007,90),
    ('cfb-superteam-qb-chase-daniel-2007','QB','Chase Daniel','Missouri',2007,90),
    ('cfb-superteam-qb-dak-prescott-2014','QB','Dak Prescott','Mississippi State',2014,90),
    ('cfb-superteam-qb-mckenzie-milton-2017','QB','McKenzie Milton','UCF',2017,90),
    ('cfb-superteam-qb-josh-heupel-2000','QB','Josh Heupel','Oklahoma',2000,89),
    ('cfb-superteam-qb-eli-manning-2003','QB','Eli Manning','Ole Miss',2003,89),
    ('cfb-superteam-qb-graham-harrell-2008','QB','Graham Harrell','Texas Tech',2008,89),
    ('cfb-superteam-qb-patrick-mahomes-2016','QB','Patrick Mahomes','Texas Tech',2016,89),
    ('cfb-superteam-qb-eric-crouch-2001','QB','Eric Crouch','Nebraska',2001,88),
    ('cfb-superteam-rb-reggie-bush-2005','RB','Reggie Bush','USC',2005,100),
    ('cfb-superteam-rb-derrick-henry-2015','RB','Derrick Henry','Alabama',2015,99),
    ('cfb-superteam-rb-darren-mcfadden-2007','RB','Darren McFadden','Arkansas',2007,98),
    ('cfb-superteam-rb-melvin-gordon-2014','RB','Melvin Gordon','Wisconsin',2014,98),
    ('cfb-superteam-rb-christian-mccaffrey-2015','RB','Christian McCaffrey','Stanford',2015,98),
    ('cfb-superteam-rb-ladainian-tomlinson-2000','RB','LaDainian Tomlinson','TCU',2000,97),
    ('cfb-superteam-rb-ezekiel-elliott-2014','RB','Ezekiel Elliott','Ohio State',2014,97),
    ('cfb-superteam-rb-ashton-jeanty-2024','RB','Ashton Jeanty','Boise State',2024,97),
    ('cfb-superteam-rb-adrian-peterson-2004','RB','Adrian Peterson','Oklahoma',2004,96),
    ('cfb-superteam-rb-jonathan-taylor-2019','RB','Jonathan Taylor','Wisconsin',2019,96),
    ('cfb-superteam-rb-montee-ball-2011','RB','Montee Ball','Wisconsin',2011,96),
    ('cfb-superteam-rb-mark-ingram-2009','RB','Mark Ingram','Alabama',2009,95),
    ('cfb-superteam-rb-trent-richardson-2011','RB','Trent Richardson','Alabama',2011,95),
    ('cfb-superteam-rb-lamichael-james-2010','RB','LaMichael James','Oregon',2010,95),
    ('cfb-superteam-rb-bryce-love-2017','RB','Bryce Love','Stanford',2017,95),
    ('cfb-superteam-rb-kenneth-walker-iii-2021','RB','Kenneth Walker III','Michigan State',2021,95),
    ('cfb-superteam-rb-najee-harris-2020','RB','Najee Harris','Alabama',2020,95),
    ('cfb-superteam-rb-willis-mcgahee-2002','RB','Willis McGahee','Miami',2002,94),
    ('cfb-superteam-rb-deangelo-williams-2005','RB','DeAngelo Williams','Memphis',2005,94),
    ('cfb-superteam-rb-leonard-fournette-2015','RB','Leonard Fournette','LSU',2015,94),
    ('cfb-superteam-rb-dalvin-cook-2016','RB','Dalvin Cook','Florida State',2016,94),
    ('cfb-superteam-rb-nick-chubb-2014','RB','Nick Chubb','Georgia',2014,94),
    ('cfb-superteam-rb-cameron-skattebo-2024','RB','Cameron Skattebo','Arizona State',2024,94),
    ('cfb-superteam-rb-donta-foreman-2016','RB','D’Onta Foreman','Texas',2016,94),
    ('cfb-superteam-rb-saquon-barkley-2017','RB','Saquon Barkley','Penn State',2017,93),
    ('cfb-superteam-rb-bijan-robinson-2022','RB','Bijan Robinson','Texas',2022,93),
    ('cfb-superteam-rb-darren-sproles-2003','RB','Darren Sproles','Kansas State',2003,93),
    ('cfb-superteam-rb-tre-mason-2013','RB','Tre Mason','Auburn',2013,93),
    ('cfb-superteam-rb-jk-dobbins-2019','RB','J.K. Dobbins','Ohio State',2019,93),
    ('cfb-superteam-rb-cj-spiller-2009','RB','C.J. Spiller','Clemson',2009,93),
    ('cfb-superteam-rb-travis-etienne-2018','RB','Travis Etienne','Clemson',2018,92),
    ('cfb-superteam-rb-breece-hall-2020','RB','Breece Hall','Iowa State',2020,92),
    ('cfb-superteam-rb-jamaal-charles-2007','RB','Jamaal Charles','Texas',2007,92),
    ('cfb-superteam-rb-ray-rice-2007','RB','Ray Rice','Rutgers',2007,92),
    ('cfb-superteam-rb-jeremiyah-love-2025','RB','Jeremiyah Love','Notre Dame',2025,92),
    ('cfb-superteam-rb-maurice-clarett-2002','RB','Maurice Clarett','Ohio State',2002,91),
    ('cfb-superteam-rb-steve-slaton-2006','RB','Steve Slaton','West Virginia',2006,91),
    ('cfb-superteam-rb-toby-gerhart-2009','RB','Toby Gerhart','Stanford',2009,91),
    ('cfb-superteam-rb-ollie-gordon-ii-2023','RB','Ollie Gordon II','Oklahoma State',2023,91),
    ('cfb-superteam-rb-lesean-mccoy-2008','RB','LeSean McCoy','Pitt',2008,91),
    ('cfb-superteam-rb-knowshon-moreno-2008','RB','Knowshon Moreno','Georgia',2008,91),
    ('cfb-superteam-rb-todd-gurley-2012','RB','Todd Gurley','Georgia',2012,90),
    ('cfb-superteam-rb-marshawn-lynch-2006','RB','Marshawn Lynch','California',2006,90),
    ('cfb-superteam-rb-jahmyr-gibbs-2022','RB','Jahmyr Gibbs','Alabama',2022,90),
    ('cfb-superteam-rb-quinshon-judkins-2022','RB','Quinshon Judkins','Ole Miss',2022,90),
    ('cfb-superteam-rb-demarco-murray-2010','RB','DeMarco Murray','Oklahoma',2010,90),
    ('cfb-superteam-rb-omarion-hampton-2024','RB','Omarion Hampton','North Carolina',2024,89),
    ('cfb-superteam-rb-deuce-vaughn-2021','RB','Deuce Vaughn','Kansas State',2021,89),
    ('cfb-superteam-rb-ameer-abdullah-2014','RB','Ameer Abdullah','Nebraska',2014,89),
    ('cfb-superteam-rb-dylan-sampson-2024','RB','Dylan Sampson','Tennessee',2024,88),
    ('cfb-superteam-wr-devonta-smith-2020','WR','DeVonta Smith','Alabama',2020,100),
    ('cfb-superteam-wr-larry-fitzgerald-2003','WR','Larry Fitzgerald','Pitt',2003,99),
    ('cfb-superteam-wr-michael-crabtree-2007','WR','Michael Crabtree','Texas Tech',2007,99),
    ('cfb-superteam-wr-jamarr-chase-2019','WR','Ja’Marr Chase','LSU',2019,98),
    ('cfb-superteam-wr-justin-blackmon-2010','WR','Justin Blackmon','Oklahoma State',2010,98),
    ('cfb-superteam-wr-amari-cooper-2014','WR','Amari Cooper','Alabama',2014,97),
    ('cfb-superteam-wr-calvin-johnson-2006','WR','Calvin Johnson','Georgia Tech',2006,96),
    ('cfb-superteam-wr-marqise-lee-2012','WR','Marqise Lee','USC',2012,96),
    ('cfb-superteam-wr-justin-jefferson-2019','WR','Justin Jefferson','LSU',2019,96),
    ('cfb-superteam-wr-rome-odunze-2023','WR','Rome Odunze','Washington',2023,96),
    ('cfb-superteam-wr-jeremiah-smith-2024','WR','Jeremiah Smith','Ohio State',2024,96),
    ('cfb-superteam-wr-malik-nabers-2023','WR','Malik Nabers','LSU',2023,95),
    ('cfb-superteam-wr-ceedee-lamb-2019','WR','CeeDee Lamb','Oklahoma',2019,95),
    ('cfb-superteam-wr-dez-bryant-2008','WR','Dez Bryant','Oklahoma State',2008,95),
    ('cfb-superteam-wr-braylon-edwards-2004','WR','Braylon Edwards','Michigan',2004,95),
    ('cfb-superteam-wr-sammy-watkins-2013','WR','Sammy Watkins','Clemson',2013,95),
    ('cfb-superteam-wr-jaxon-smith-njigba-2021','WR','Jaxon Smith-Njigba','Ohio State',2021,95),
    ('cfb-superteam-wr-marvin-harrison-jr-2023','WR','Marvin Harrison Jr.','Ohio State',2023,94),
    ('cfb-superteam-wr-jordan-addison-2021','WR','Jordan Addison','Pitt',2021,94),
    ('cfb-superteam-wr-mike-evans-2013','WR','Mike Evans','Texas A&M',2013,94),
    ('cfb-superteam-wr-golden-tate-2009','WR','Golden Tate','Notre Dame',2009,94),
    ('cfb-superteam-wr-roy-williams-2002','WR','Roy Williams','Texas',2002,94),
    ('cfb-superteam-wr-dwayne-jarrett-2005','WR','Dwayne Jarrett','USC',2005,94),
    ('cfb-superteam-wr-percy-harvin-2008','WR','Percy Harvin','Florida',2008,94),
    ('cfb-superteam-wr-corey-coleman-2015','WR','Corey Coleman','Baylor',2015,94),
    ('cfb-superteam-wr-jerry-jeudy-2018','WR','Jerry Jeudy','Alabama',2018,94),
    ('cfb-superteam-wr-dede-westbrook-2016','WR','Dede Westbrook','Oklahoma',2016,94),
    ('cfb-superteam-wr-tavon-austin-2012','WR','Tavon Austin','West Virginia',2012,93),
    ('cfb-superteam-wr-jordan-shipley-2009','WR','Jordan Shipley','Texas',2009,93),
    ('cfb-superteam-wr-brandin-cooks-2013','WR','Brandin Cooks','Oregon State',2013,93),
    ('cfb-superteam-wr-jameson-williams-2021','WR','Jameson Williams','Alabama',2021,93),
    ('cfb-superteam-wr-alshon-jeffery-2010','WR','Alshon Jeffery','South Carolina',2010,93),
    ('cfb-superteam-wr-brian-thomas-jr-2023','WR','Brian Thomas Jr.','LSU',2023,93),
    ('cfb-superteam-wr-tetairoa-mcmillan-2023','WR','Tetairoa McMillan','Arizona',2023,92),
    ('cfb-superteam-wr-mike-williams-2016','WR','Mike Williams','Clemson',2016,92),
    ('cfb-superteam-wr-jeremy-maclin-2008','WR','Jeremy Maclin','Missouri',2008,92),
    ('cfb-superteam-wr-julio-jones-2010','WR','Julio Jones','Alabama',2010,92),
    ('cfb-superteam-wr-robert-woods-2011','WR','Robert Woods','USC',2011,92),
    ('cfb-superteam-wr-drake-london-2021','WR','Drake London','USC',2021,92),
    ('cfb-superteam-wr-tank-dell-2022','WR','Tank Dell','Houston',2022,92),
    ('cfb-superteam-wr-tyler-lockett-2014','WR','Tyler Lockett','Kansas State',2014,91),
    ('cfb-superteam-wr-jalin-hyatt-2022','WR','Jalin Hyatt','Tennessee',2022,91),
    ('cfb-superteam-wr-aj-green-2010','WR','A.J. Green','Georgia',2010,91),
    ('cfb-superteam-wr-garrett-wilson-2021','WR','Garrett Wilson','Ohio State',2021,91),
    ('cfb-superteam-wr-luther-burden-iii-2023','WR','Luther Burden III','Missouri',2023,91),
    ('cfb-superteam-wr-emeka-egbuka-2022','WR','Emeka Egbuka','Ohio State',2022,91),
    ('cfb-superteam-wr-michael-floyd-2011','WR','Michael Floyd','Notre Dame',2011,90),
    ('cfb-superteam-wr-quentin-johnston-2022','WR','Quentin Johnston','TCU',2022,90),
    ('cfb-superteam-wr-xavier-worthy-2023','WR','Xavier Worthy','Texas',2023,90),
    ('cfb-superteam-wr-rashod-bateman-2019','WR','Rashod Bateman','Minnesota',2019,90),
    ('cfb-superteam-te-kyle-pitts-2020','TE','Kyle Pitts','Florida',2020,99),
    ('cfb-superteam-te-tyler-warren-2024','TE','Tyler Warren','Penn State',2024,99),
    ('cfb-superteam-te-brock-bowers-2021','TE','Brock Bowers','Georgia',2021,98),
    ('cfb-superteam-te-jace-amaro-2013','TE','Jace Amaro','Texas Tech',2013,96),
    ('cfb-superteam-te-mark-andrews-2017','TE','Mark Andrews','Oklahoma',2017,96),
    ('cfb-superteam-te-vernon-davis-2005','TE','Vernon Davis','Maryland',2005,95),
    ('cfb-superteam-te-kellen-winslow-ii-2002','TE','Kellen Winslow II','Miami',2002,95),
    ('cfb-superteam-te-michael-mayer-2022','TE','Michael Mayer','Notre Dame',2022,94),
    ('cfb-superteam-te-zach-ertz-2012','TE','Zach Ertz','Stanford',2012,94),
    ('cfb-superteam-te-dalton-kincaid-2022','TE','Dalton Kincaid','Utah',2022,94),
    ('cfb-superteam-te-evan-engram-2016','TE','Evan Engram','Ole Miss',2016,93),
    ('cfb-superteam-te-trey-mcbride-2021','TE','Trey McBride','Colorado State',2021,93),
    ('cfb-superteam-te-tyler-eifert-2012','TE','Tyler Eifert','Notre Dame',2012,93),
    ('cfb-superteam-te-rob-gronkowski-2008','TE','Rob Gronkowski','Arizona',2008,92),
    ('cfb-superteam-te-dallas-clark-2002','TE','Dallas Clark','Iowa',2002,92),
    ('cfb-superteam-te-tj-hockenson-2018','TE','T.J. Hockenson','Iowa',2018,92),
    ('cfb-superteam-te-marcedes-lewis-2005','TE','Marcedes Lewis','UCLA',2005,92),
    ('cfb-superteam-te-travis-kelce-2012','TE','Travis Kelce','Cincinnati',2012,91),
    ('cfb-superteam-te-oj-howard-2015','TE','O.J. Howard','Alabama',2015,91),
    ('cfb-superteam-te-hunter-henry-2015','TE','Hunter Henry','Arkansas',2015,90),
    ('cfb-superteam-te-heath-miller-2003','TE','Heath Miller','Virginia',2003,90),
    ('cfb-superteam-te-colston-loveland-2024','TE','Colston Loveland','Michigan',2024,89),
    ('cfb-superteam-te-jake-butt-2015','TE','Jake Butt','Michigan',2015,89),
    ('cfb-superteam-te-noah-fant-2017','TE','Noah Fant','Iowa',2017,89),
    ('cfb-superteam-front-seven-ndamukong-suh-2009','Front Seven','Ndamukong Suh','Nebraska',2009,100),
    ('cfb-superteam-front-seven-aaron-donald-2013','Front Seven','Aaron Donald','Pitt',2013,99),
    ('cfb-superteam-front-seven-will-anderson-jr-2021','Front Seven','Will Anderson Jr.','Alabama',2021,98),
    ('cfb-superteam-front-seven-luke-kuechly-2011','Front Seven','Luke Kuechly','Boston College',2011,98),
    ('cfb-superteam-front-seven-derrick-johnson-2004','Front Seven','Derrick Johnson','Texas',2004,98),
    ('cfb-superteam-front-seven-jacob-rodriguez-2025','Front Seven','Jacob Rodriguez','Texas Tech',2025,98),
    ('cfb-superteam-front-seven-chase-young-2019','Front Seven','Chase Young','Ohio State',2019,97),
    ('cfb-superteam-front-seven-von-miller-2010','Front Seven','Von Miller','Texas A&M',2010,97),
    ('cfb-superteam-front-seven-aidan-hutchinson-2021','Front Seven','Aidan Hutchinson','Michigan',2021,97),
    ('cfb-superteam-front-seven-manti-teo-2012','Front Seven','Manti Te’o','Notre Dame',2012,97),
    ('cfb-superteam-front-seven-jadeveon-clowney-2012','Front Seven','Jadeveon Clowney','South Carolina',2012,96),
    ('cfb-superteam-front-seven-david-pollack-2004','Front Seven','David Pollack','Georgia',2004,96),
    ('cfb-superteam-front-seven-quinnen-williams-2018','Front Seven','Quinnen Williams','Alabama',2018,96),
    ('cfb-superteam-front-seven-abdul-carter-2024','Front Seven','Abdul Carter','Penn State',2024,96),
    ('cfb-superteam-front-seven-patrick-willis-2006','Front Seven','Patrick Willis','Ole Miss',2006,95),
    ('cfb-superteam-front-seven-aj-hawk-2005','Front Seven','A.J. Hawk','Ohio State',2005,95),
    ('cfb-superteam-front-seven-roquan-smith-2017','Front Seven','Roquan Smith','Georgia',2017,95),
    ('cfb-superteam-front-seven-joey-bosa-2014','Front Seven','Joey Bosa','Ohio State',2014,95),
    ('cfb-superteam-front-seven-julius-peppers-2001','Front Seven','Julius Peppers','North Carolina',2001,95),
    ('cfb-superteam-front-seven-josh-allen-2018','Front Seven','Josh Allen','Kentucky',2018,95),
    ('cfb-superteam-front-seven-isaiah-simmons-2019','Front Seven','Isaiah Simmons','Clemson',2019,95),
    ('cfb-superteam-front-seven-james-laurinaitis-2006','Front Seven','James Laurinaitis','Ohio State',2006,95),
    ('cfb-superteam-front-seven-jj-watt-2010','Front Seven','J.J. Watt','Wisconsin',2010,94),
    ('cfb-superteam-front-seven-myles-garrett-2015','Front Seven','Myles Garrett','Texas A&M',2015,94),
    ('cfb-superteam-front-seven-khalil-mack-2013','Front Seven','Khalil Mack','Buffalo',2013,94),
    ('cfb-superteam-front-seven-jonathan-allen-2016','Front Seven','Jonathan Allen','Alabama',2016,94),
    ('cfb-superteam-front-seven-jordan-davis-2021','Front Seven','Jordan Davis','Georgia',2021,94),
    ('cfb-superteam-front-seven-rolando-mcclain-2009','Front Seven','Rolando McClain','Alabama',2009,94),
    ('cfb-superteam-front-seven-devin-white-2018','Front Seven','Devin White','LSU',2018,93),
    ('cfb-superteam-front-seven-nakobe-dean-2021','Front Seven','Nakobe Dean','Georgia',2021,93),
    ('cfb-superteam-front-seven-rey-maualuga-2008','Front Seven','Rey Maualuga','USC',2008,93),
    ('cfb-superteam-front-seven-cj-mosley-2013','Front Seven','C.J. Mosley','Alabama',2013,93),
    ('cfb-superteam-front-seven-jeremiah-owusu-koramoah-2020','Front Seven','Jeremiah Owusu-Koramoah','Notre Dame',2020,93),
    ('cfb-superteam-front-seven-tj-watt-2016','Front Seven','T.J. Watt','Wisconsin',2016,93),
    ('cfb-superteam-front-seven-christian-wilkins-2018','Front Seven','Christian Wilkins','Clemson',2018,93),
    ('cfb-superteam-front-seven-brian-orakpo-2008','Front Seven','Brian Orakpo','Texas',2008,93),
    ('cfb-superteam-front-seven-mason-graham-2024','Front Seven','Mason Graham','Michigan',2024,93),
    ('cfb-superteam-front-seven-jack-sawyer-2024','Front Seven','Jack Sawyer','Ohio State',2024,93),
    ('cfb-superteam-front-seven-micah-parsons-2019','Front Seven','Micah Parsons','Penn State',2019,92),
    ('cfb-superteam-front-seven-nick-bosa-2017','Front Seven','Nick Bosa','Ohio State',2017,92),
    ('cfb-superteam-front-seven-jaylon-smith-2015','Front Seven','Jaylon Smith','Notre Dame',2015,92),
    ('cfb-superteam-front-seven-dexter-lawrence-2018','Front Seven','Dexter Lawrence','Clemson',2018,92),
    ('cfb-superteam-front-seven-vita-vea-2017','Front Seven','Vita Vea','Washington',2017,92),
    ('cfb-superteam-front-seven-kayvon-thibodeaux-2021','Front Seven','Kayvon Thibodeaux','Oregon',2021,92),
    ('cfb-superteam-front-seven-dallas-turner-2023','Front Seven','Dallas Turner','Alabama',2023,92),
    ('cfb-superteam-front-seven-brian-cushing-2008','Front Seven','Brian Cushing','USC',2008,91),
    ('cfb-superteam-front-seven-daron-payne-2017','Front Seven','Daron Payne','Alabama',2017,91),
    ('cfb-superteam-front-seven-montez-sweat-2018','Front Seven','Montez Sweat','Mississippi State',2018,91),
    ('cfb-superteam-front-seven-devin-bush-2018','Front Seven','Devin Bush','Michigan',2018,91),
    ('cfb-superteam-front-seven-gerald-mccoy-2009','Front Seven','Gerald McCoy','Oklahoma',2009,91),
    ('cfb-superteam-front-seven-donta-hightower-2011','Front Seven','Dont’a Hightower','Alabama',2011,91),
    ('cfb-superteam-front-seven-ryan-shazier-2013','Front Seven','Ryan Shazier','Ohio State',2013,91),
    ('cfb-superteam-front-seven-jalon-walker-2024','Front Seven','Jalon Walker','Georgia',2024,91),
    ('cfb-superteam-front-seven-myles-jack-2013','Front Seven','Myles Jack','UCLA',2013,90),
    ('cfb-superteam-front-seven-patrick-queen-2019','Front Seven','Patrick Queen','LSU',2019,90),
    ('cfb-superteam-front-seven-leonard-williams-2014','Front Seven','Leonard Williams','USC',2014,90),
    ('cfb-superteam-front-seven-brian-burns-2018','Front Seven','Brian Burns','Florida State',2018,89),
    ('cfb-superteam-front-seven-travon-walker-2021','Front Seven','Travon Walker','Georgia',2021,89),
    ('cfb-superteam-front-seven-clay-matthews-2008','Front Seven','Clay Matthews','USC',2008,88),
    ('cfb-superteam-front-seven-rashan-gary-2018','Front Seven','Rashan Gary','Michigan',2018,88),
    ('cfb-superteam-secondary-ed-reed-2001','Secondary','Ed Reed','Miami',2001,100),
    ('cfb-superteam-secondary-sean-taylor-2003','Secondary','Sean Taylor','Miami',2003,99),
    ('cfb-superteam-secondary-tyrann-mathieu-2011','Secondary','Tyrann Mathieu','LSU',2011,99),
    ('cfb-superteam-secondary-eric-berry-2008','Secondary','Eric Berry','Tennessee',2008,98),
    ('cfb-superteam-secondary-patrick-peterson-2010','Secondary','Patrick Peterson','LSU',2010,98),
    ('cfb-superteam-secondary-travis-hunter-2024','Secondary','Travis Hunter','Colorado',2024,98),
    ('cfb-superteam-secondary-caleb-downs-2025','Secondary','Caleb Downs','Ohio State',2025,97),
    ('cfb-superteam-secondary-earl-thomas-2009','Secondary','Earl Thomas','Texas',2009,97),
    ('cfb-superteam-secondary-minkah-fitzpatrick-2017','Secondary','Minkah Fitzpatrick','Alabama',2017,97),
    ('cfb-superteam-secondary-derek-stingley-jr-2019','Secondary','Derek Stingley Jr.','LSU',2019,96),
    ('cfb-superteam-secondary-michael-huff-2005','Secondary','Michael Huff','Texas',2005,96),
    ('cfb-superteam-secondary-patrick-surtain-ii-2020','Secondary','Patrick Surtain II','Alabama',2020,96),
    ('cfb-superteam-secondary-sauce-gardner-2021','Secondary','Sauce Gardner','Cincinnati',2021,96),
    ('cfb-superteam-secondary-aaron-ross-2006','Secondary','Aaron Ross','Texas',2006,95),
    ('cfb-superteam-secondary-adoree-jackson-2016','Secondary','Adoree’ Jackson','USC',2016,95),
    ('cfb-superteam-secondary-desmond-king-2015','Secondary','Desmond King','Iowa',2015,95),
    ('cfb-superteam-secondary-malcolm-jenkins-2008','Secondary','Malcolm Jenkins','Ohio State',2008,95),
    ('cfb-superteam-secondary-morris-claiborne-2011','Secondary','Morris Claiborne','LSU',2011,95),
    ('cfb-superteam-secondary-roy-williams-2001','Secondary','Roy Williams','Oklahoma',2001,95),
    ('cfb-superteam-secondary-antrel-rolle-2004','Secondary','Antrel Rolle','Miami',2004,94),
    ('cfb-superteam-secondary-antoine-winfield-jr-2019','Secondary','Antoine Winfield Jr.','Minnesota',2019,94),
    ('cfb-superteam-secondary-eric-weddle-2006','Secondary','Eric Weddle','Utah',2006,94),
    ('cfb-superteam-secondary-jahdae-barron-2024','Secondary','Jahdae Barron','Texas',2024,94),
    ('cfb-superteam-secondary-jalen-ramsey-2014','Secondary','Jalen Ramsey','Florida State',2014,94),
    ('cfb-superteam-secondary-reggie-nelson-2006','Secondary','Reggie Nelson','Florida',2006,94),
    ('cfb-superteam-secondary-will-johnson-2023','Secondary','Will Johnson','Michigan',2023,94),
    ('cfb-superteam-secondary-xavier-watts-2023','Secondary','Xavier Watts','Notre Dame',2023,94),
    ('cfb-superteam-secondary-aqib-talib-2007','Secondary','Aqib Talib','Kansas',2007,93),
    ('cfb-superteam-secondary-budda-baker-2016','Secondary','Budda Baker','Washington',2016,93),
    ('cfb-superteam-secondary-cooper-dejean-2023','Secondary','Cooper DeJean','Iowa',2023,93),
    ('cfb-superteam-secondary-grant-delpit-2019','Secondary','Grant Delpit','LSU',2019,93),
    ('cfb-superteam-secondary-kyle-hamilton-2021','Secondary','Kyle Hamilton','Notre Dame',2021,93),
    ('cfb-superteam-secondary-landon-collins-2014','Secondary','Landon Collins','Alabama',2014,93),
    ('cfb-superteam-secondary-malik-hooker-2016','Secondary','Malik Hooker','Ohio State',2016,93),
    ('cfb-superteam-secondary-mike-sainristil-2023','Secondary','Mike Sainristil','Michigan',2023,93),
    ('cfb-superteam-secondary-quentin-jammer-2001','Secondary','Quentin Jammer','Texas',2001,93),
    ('cfb-superteam-secondary-darrelle-revis-2006','Secondary','Darrelle Revis','Pitt',2006,92),
    ('cfb-superteam-secondary-deangelo-hall-2003','Secondary','DeAngelo Hall','Virginia Tech',2003,92),
    ('cfb-superteam-secondary-derwin-james-2015','Secondary','Derwin James','Florida State',2015,92),
    ('cfb-superteam-secondary-ha-ha-clinton-dix-2012','Secondary','Ha Ha Clinton-Dix','Alabama',2012,92),
    ('cfb-superteam-secondary-jaire-alexander-2016','Secondary','Jaire Alexander','Louisville',2016,92),
    ('cfb-superteam-secondary-jeff-okudah-2019','Secondary','Jeff Okudah','Ohio State',2019,92),
    ('cfb-superteam-secondary-joe-haden-2009','Secondary','Joe Haden','Florida',2009,92),
    ('cfb-superteam-secondary-malaki-starks-2022','Secondary','Malaki Starks','Georgia',2022,92),
    ('cfb-superteam-secondary-prince-amukamara-2010','Secondary','Prince Amukamara','Nebraska',2010,92),
    ('cfb-superteam-secondary-aj-terrell-2018','Secondary','A.J. Terrell','Clemson',2018,91),
    ('cfb-superteam-secondary-emmanuel-forbes-2022','Secondary','Emmanuel Forbes','Mississippi State',2022,91),
    ('cfb-superteam-secondary-jamal-adams-2016','Secondary','Jamal Adams','LSU',2016,91),
    ('cfb-superteam-secondary-terrion-arnold-2023','Secondary','Terrion Arnold','Alabama',2023,91),
    ('cfb-superteam-secondary-trevon-moehrig-2020','Secondary','Trevon Moehrig','TCU',2020,91),
    ('cfb-superteam-secondary-xavier-mckinney-2019','Secondary','Xavier McKinney','Alabama',2019,91),
    ('cfb-superteam-secondary-deshon-elliott-2017','Secondary','DeShon Elliott','Texas',2017,90),
    ('cfb-superteam-secondary-denzel-ward-2017','Secondary','Denzel Ward','Ohio State',2017,90),
    ('cfb-superteam-secondary-kenny-vaccaro-2012','Secondary','Kenny Vaccaro','Texas',2012,90),
    ('cfb-superteam-secondary-kool-aid-mckinstry-2023','Secondary','Kool-Aid McKinstry','Alabama',2023,90),
    ('cfb-superteam-secondary-trevon-diggs-2019','Secondary','Trevon Diggs','Alabama',2019,90),
    ('cfb-superteam-secondary-marshon-lattimore-2016','Secondary','Marshon Lattimore','Ohio State',2016,89),
    ('cfb-superteam-secondary-stephon-gilmore-2011','Secondary','Stephon Gilmore','South Carolina',2011,89),
    ('cfb-superteam-secondary-taylor-mays-2008','Secondary','Taylor Mays','USC',2008,89),
    ('cfb-superteam-secondary-adam-pacman-jones-2004','Secondary','Adam “Pacman” Jones','West Virginia',2004,88),
    ('cfb-superteam-head-coach-curt-cignetti-2025','Head Coach','Curt Cignetti','Indiana',2025,100),
    ('cfb-superteam-head-coach-nick-saban-2020','Head Coach','Nick Saban','Alabama',2020,100),
    ('cfb-superteam-head-coach-dabo-swinney-2018','Head Coach','Dabo Swinney','Clemson',2018,99),
    ('cfb-superteam-head-coach-pete-carroll-2004','Head Coach','Pete Carroll','USC',2004,99),
    ('cfb-superteam-head-coach-mack-brown-2005','Head Coach','Mack Brown','Texas',2005,98),
    ('cfb-superteam-head-coach-kirby-smart-2022','Head Coach','Kirby Smart','Georgia',2022,98),
    ('cfb-superteam-head-coach-bob-stoops-2000','Head Coach','Bob Stoops','Oklahoma',2000,98),
    ('cfb-superteam-head-coach-urban-meyer-2008','Head Coach','Urban Meyer','Florida',2008,97),
    ('cfb-superteam-head-coach-jim-harbaugh-2023','Head Coach','Jim Harbaugh','Michigan',2023,97),
    ('cfb-superteam-head-coach-chris-petersen-2006','Head Coach','Chris Petersen','Boise State',2006,97),
    ('cfb-superteam-head-coach-jimbo-fisher-2013','Head Coach','Jimbo Fisher','Florida State',2013,96),
    ('cfb-superteam-head-coach-gary-patterson-2010','Head Coach','Gary Patterson','TCU',2010,96),
    ('cfb-superteam-head-coach-jim-tressel-2002','Head Coach','Jim Tressel','Ohio State',2002,96),
    ('cfb-superteam-head-coach-ed-orgeron-2019','Head Coach','Ed Orgeron','LSU',2019,96),
    ('cfb-superteam-head-coach-ryan-day-2024','Head Coach','Ryan Day','Ohio State',2024,96),
    ('cfb-superteam-head-coach-kalen-deboer-2023','Head Coach','Kalen DeBoer','Washington',2023,96),
    ('cfb-superteam-head-coach-scott-frost-2017','Head Coach','Scott Frost','UCF',2017,96),
    ('cfb-superteam-head-coach-les-miles-2011','Head Coach','Les Miles','LSU',2011,95),
    ('cfb-superteam-head-coach-mark-dantonio-2013','Head Coach','Mark Dantonio','Michigan State',2013,95),
    ('cfb-superteam-head-coach-sonny-dykes-2022','Head Coach','Sonny Dykes','TCU',2022,95),
    ('cfb-superteam-head-coach-chip-kelly-2010','Head Coach','Chip Kelly','Oregon',2010,95),
    ('cfb-superteam-head-coach-marcus-freeman-2024','Head Coach','Marcus Freeman','Notre Dame',2024,95),
    ('cfb-superteam-head-coach-kyle-whittingham-2008','Head Coach','Kyle Whittingham','Utah',2008,95),
    ('cfb-superteam-head-coach-mike-gundy-2011','Head Coach','Mike Gundy','Oklahoma State',2011,94),
    ('cfb-superteam-head-coach-gus-malzahn-2013','Head Coach','Gus Malzahn','Auburn',2013,94),
    ('cfb-superteam-head-coach-brian-kelly-2012','Head Coach','Brian Kelly','Notre Dame',2012,94),
    ('cfb-superteam-head-coach-dan-lanning-2024','Head Coach','Dan Lanning','Oregon',2024,94),
    ('cfb-superteam-head-coach-steve-sarkisian-2023','Head Coach','Steve Sarkisian','Texas',2023,94),
    ('cfb-superteam-head-coach-lincoln-riley-2017','Head Coach','Lincoln Riley','Oklahoma',2017,93),
    ('cfb-superteam-head-coach-dave-aranda-2021','Head Coach','Dave Aranda','Baylor',2021,93),
    ('cfb-superteam-head-coach-josh-heupel-2022','Head Coach','Josh Heupel','Tennessee',2022,92),
    ('cfb-superteam-head-coach-mark-richt-2002','Head Coach','Mark Richt','Georgia',2002,92),
    ('cfb-superteam-head-coach-mike-leach-2008','Head Coach','Mike Leach','Texas Tech',2008,91),
    ('cfb-superteam-head-coach-lane-kiffin-2023','Head Coach','Lane Kiffin','Ole Miss',2023,90),
    ('cfb-superteam-head-coach-deion-sanders-2024','Head Coach','Deion Sanders','Colorado',2024,88)
) as source(
  item_reference,candidate_group,display_name,school,peak_season,hidden_grade
)
on conflict(item_reference) do update
set subject_key=excluded.subject_key,
    season_year=excluded.season_year,
    primary_name=excluded.primary_name,
    secondary_name=excluded.secondary_name,
    board_bucket=excluded.board_bucket,
    identity_group=excluded.identity_group,
    display_label=excluded.display_label,
    hidden_grade=excluded.hidden_grade,
    grading_inputs=excluded.grading_inputs;

do $cfb_superteam_authority_contract$
begin
  if (select count(*) from private.football_weekly_auction_items where subject_key='cfb-superteam')<>329 then
    raise exception 'CFB Superteam authority must contain 329 candidates';
  end if;
  if (select count(*) from private.football_weekly_auction_items where subject_key='cfb-superteam' and board_bucket='QB')<>50
    or (select count(*) from private.football_weekly_auction_items where subject_key='cfb-superteam' and board_bucket='RB')<>50
    or (select count(*) from private.football_weekly_auction_items where subject_key='cfb-superteam' and board_bucket='WR')<>50
    or (select count(*) from private.football_weekly_auction_items where subject_key='cfb-superteam' and board_bucket='TE')<>24
    or (select count(*) from private.football_weekly_auction_items where subject_key='cfb-superteam' and board_bucket='Front Seven')<>60
    or (select count(*) from private.football_weekly_auction_items where subject_key='cfb-superteam' and board_bucket='Secondary')<>60
    or (select count(*) from private.football_weekly_auction_items where subject_key='cfb-superteam' and board_bucket='Head Coach')<>35
  then
    raise exception 'CFB Superteam positional pool counts drifted';
  end if;
end;
$cfb_superteam_authority_contract$;
