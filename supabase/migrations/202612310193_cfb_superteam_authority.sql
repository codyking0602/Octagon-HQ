-- CFB Superteam Weekly Auction authority and subject catalog.
-- Locked product: seven roster spots, peak-season identities, $50 bankroll,
-- five-player calibration, eight candidates per day, and server-owned grades.

create table if not exists private.cfb_superteam_authority (
  item_reference text primary key,
  candidate_group text not null check (
    candidate_group in ('QB','RB','WR','TE','Front Seven','Secondary','Head Coach')
  ),
  display_name text not null,
  school text not null,
  season_year integer not null check (season_year between 1900 and 2100),
  hidden_grade numeric(4,1) not null check (
    hidden_grade between 88.0 and 100.0
    and hidden_grade * 2 = trunc(hidden_grade * 2)
  ),
  flex_eligible boolean not null default false,
  source_reference text,
  unique(candidate_group,display_name,season_year)
);
revoke all on private.cfb_superteam_authority from public,anon,authenticated;

insert into private.cfb_superteam_authority(
  item_reference,candidate_group,display_name,school,season_year,hidden_grade,flex_eligible,source_reference
) values
  ('cfb-superteam-qb-cam-newton-2010','QB','Cam Newton','Auburn',2010,100.0,false,null),
  ('cfb-superteam-qb-joe-burrow-2019','QB','Joe Burrow','LSU',2019,100.0,false,null),
  ('cfb-superteam-qb-vince-young-2005','QB','Vince Young','Texas',2005,99.0,false,null),
  ('cfb-superteam-qb-marcus-mariota-2014','QB','Marcus Mariota','Oregon',2014,98.0,false,null),
  ('cfb-superteam-qb-lamar-jackson-2016','QB','Lamar Jackson','Louisville',2016,98.0,false,null),
  ('cfb-superteam-qb-jayden-daniels-2023','QB','Jayden Daniels','LSU',2023,98.0,false,null),
  ('cfb-superteam-qb-fernando-mendoza-2025','QB','Fernando Mendoza','Indiana',2025,98.0,false,null),
  ('cfb-superteam-qb-jameis-winston-2013','QB','Jameis Winston','Florida State',2013,97.0,false,null),
  ('cfb-superteam-qb-baker-mayfield-2017','QB','Baker Mayfield','Oklahoma',2017,97.0,false,null),
  ('cfb-superteam-qb-mac-jones-2020','QB','Mac Jones','Alabama',2020,97.0,false,null),
  ('cfb-superteam-qb-sam-bradford-2008','QB','Sam Bradford','Oklahoma',2008,96.0,false,null),
  ('cfb-superteam-qb-robert-griffin-iii-2011','QB','Robert Griffin III','Baylor',2011,96.0,false,null),
  ('cfb-superteam-qb-tua-tagovailoa-2018','QB','Tua Tagovailoa','Alabama',2018,96.0,false,null),
  ('cfb-superteam-qb-kyler-murray-2018','QB','Kyler Murray','Oklahoma',2018,96.0,false,null),
  ('cfb-superteam-qb-bryce-young-2021','QB','Bryce Young','Alabama',2021,96.0,false,null),
  ('cfb-superteam-qb-caleb-williams-2022','QB','Caleb Williams','USC',2022,96.0,false,null),
  ('cfb-superteam-qb-matt-leinart-2004','QB','Matt Leinart','USC',2004,95.0,false,null),
  ('cfb-superteam-qb-andrew-luck-2011','QB','Andrew Luck','Stanford',2011,95.0,false,null),
  ('cfb-superteam-qb-johnny-manziel-2012','QB','Johnny Manziel','Texas A&M',2012,95.0,false,null),
  ('cfb-superteam-qb-deshaun-watson-2016','QB','Deshaun Watson','Clemson',2016,95.0,false,null),
  ('cfb-superteam-qb-justin-fields-2019','QB','Justin Fields','Ohio State',2019,95.0,false,null),
  ('cfb-superteam-qb-alex-smith-2004','QB','Alex Smith','Utah',2004,94.0,false,null),
  ('cfb-superteam-qb-tim-tebow-2007','QB','Tim Tebow','Florida',2007,94.0,false,null),
  ('cfb-superteam-qb-trevor-lawrence-2018','QB','Trevor Lawrence','Clemson',2018,94.0,false,null),
  ('cfb-superteam-qb-c-j-stroud-2022','QB','C.J. Stroud','Ohio State',2022,94.0,false,null),
  ('cfb-superteam-qb-bo-nix-2023','QB','Bo Nix','Oregon',2023,94.0,false,null),
  ('cfb-superteam-qb-troy-smith-2006','QB','Troy Smith','Ohio State',2006,93.0,false,null),
  ('cfb-superteam-qb-colt-mccoy-2008','QB','Colt McCoy','Texas',2008,93.0,false,null),
  ('cfb-superteam-qb-russell-wilson-2011','QB','Russell Wilson','Wisconsin',2011,93.0,false,null),
  ('cfb-superteam-qb-dwayne-haskins-2018','QB','Dwayne Haskins','Ohio State',2018,93.0,false,null),
  ('cfb-superteam-qb-jalen-hurts-2019','QB','Jalen Hurts','Oklahoma',2019,93.0,false,null),
  ('cfb-superteam-qb-michael-penix-jr-2023','QB','Michael Penix Jr.','Washington',2023,93.0,false,null),
  ('cfb-superteam-qb-carson-palmer-2002','QB','Carson Palmer','USC',2002,92.0,false,null),
  ('cfb-superteam-qb-jason-white-2003','QB','Jason White','Oklahoma',2003,92.0,false,null),
  ('cfb-superteam-qb-cam-ward-2024','QB','Cam Ward','Miami',2024,92.0,false,null),
  ('cfb-superteam-qb-diego-pavia-2025','QB','Diego Pavia','Vanderbilt',2025,92.0,false,null),
  ('cfb-superteam-qb-colt-brennan-2006','QB','Colt Brennan','Hawaii',2006,91.0,false,null),
  ('cfb-superteam-qb-kellen-moore-2010','QB','Kellen Moore','Boise State',2010,91.0,false,null),
  ('cfb-superteam-qb-teddy-bridgewater-2013','QB','Teddy Bridgewater','Louisville',2013,91.0,false,null),
  ('cfb-superteam-qb-max-duggan-2022','QB','Max Duggan','TCU',2022,91.0,false,null),
  ('cfb-superteam-qb-hendon-hooker-2022','QB','Hendon Hooker','Tennessee',2022,91.0,false,null),
  ('cfb-superteam-qb-pat-white-2007','QB','Pat White','West Virginia',2007,90.0,false,null),
  ('cfb-superteam-qb-chase-daniel-2007','QB','Chase Daniel','Missouri',2007,90.0,false,null),
  ('cfb-superteam-qb-dak-prescott-2014','QB','Dak Prescott','Mississippi State',2014,90.0,false,null),
  ('cfb-superteam-qb-mckenzie-milton-2017','QB','McKenzie Milton','UCF',2017,90.0,false,null),
  ('cfb-superteam-qb-josh-heupel-2000','QB','Josh Heupel','Oklahoma',2000,89.0,false,null),
  ('cfb-superteam-qb-eli-manning-2003','QB','Eli Manning','Ole Miss',2003,89.0,false,null),
  ('cfb-superteam-qb-graham-harrell-2008','QB','Graham Harrell','Texas Tech',2008,89.0,false,null),
  ('cfb-superteam-qb-patrick-mahomes-2016','QB','Patrick Mahomes','Texas Tech',2016,89.0,false,null),
  ('cfb-superteam-qb-eric-crouch-2001','QB','Eric Crouch','Nebraska',2001,88.0,false,null),
  ('cfb-superteam-wr-devonta-smith-2020','WR','DeVonta Smith','Alabama',2020,100.0,true,null),
  ('cfb-superteam-wr-larry-fitzgerald-2003','WR','Larry Fitzgerald','Pittsburgh',2003,99.0,true,null),
  ('cfb-superteam-wr-michael-crabtree-2007','WR','Michael Crabtree','Texas Tech',2007,99.0,true,null),
  ('cfb-superteam-wr-jamarr-chase-2019','WR','Ja’Marr Chase','LSU',2019,98.0,true,null),
  ('cfb-superteam-wr-justin-blackmon-2010','WR','Justin Blackmon','Oklahoma State',2010,98.0,true,null),
  ('cfb-superteam-wr-amari-cooper-2014','WR','Amari Cooper','Alabama',2014,97.0,true,null),
  ('cfb-superteam-wr-calvin-johnson-2006','WR','Calvin Johnson','Georgia Tech',2006,96.0,true,null),
  ('cfb-superteam-wr-marqise-lee-2012','WR','Marqise Lee','USC',2012,96.0,true,null),
  ('cfb-superteam-wr-justin-jefferson-2019','WR','Justin Jefferson','LSU',2019,96.0,true,null),
  ('cfb-superteam-wr-rome-odunze-2023','WR','Rome Odunze','Washington',2023,96.0,true,null),
  ('cfb-superteam-wr-jeremiah-smith-2024','WR','Jeremiah Smith','Ohio State',2024,96.0,true,null),
  ('cfb-superteam-wr-malik-nabers-2023','WR','Malik Nabers','LSU',2023,95.0,true,null),
  ('cfb-superteam-wr-ceedee-lamb-2019','WR','CeeDee Lamb','Oklahoma',2019,95.0,true,null),
  ('cfb-superteam-wr-dez-bryant-2008','WR','Dez Bryant','Oklahoma State',2008,95.0,true,null),
  ('cfb-superteam-wr-braylon-edwards-2004','WR','Braylon Edwards','Michigan',2004,95.0,true,null),
  ('cfb-superteam-wr-sammy-watkins-2013','WR','Sammy Watkins','Clemson',2013,95.0,true,null),
  ('cfb-superteam-wr-jaxon-smith-njigba-2021','WR','Jaxon Smith-Njigba','Ohio State',2021,95.0,true,null),
  ('cfb-superteam-wr-marvin-harrison-jr-2023','WR','Marvin Harrison Jr.','Ohio State',2023,94.0,true,null),
  ('cfb-superteam-wr-jordan-addison-2021','WR','Jordan Addison','Pittsburgh',2021,94.0,true,null),
  ('cfb-superteam-wr-mike-evans-2013','WR','Mike Evans','Texas A&M',2013,94.0,true,null),
  ('cfb-superteam-wr-golden-tate-2009','WR','Golden Tate','Notre Dame',2009,94.0,true,null),
  ('cfb-superteam-wr-roy-williams-2002','WR','Roy Williams','Texas',2002,94.0,true,null),
  ('cfb-superteam-wr-dwayne-jarrett-2005','WR','Dwayne Jarrett','USC',2005,94.0,true,null),
  ('cfb-superteam-wr-percy-harvin-2008','WR','Percy Harvin','Florida',2008,94.0,true,null),
  ('cfb-superteam-wr-corey-coleman-2015','WR','Corey Coleman','Baylor',2015,94.0,true,null),
  ('cfb-superteam-wr-jerry-jeudy-2018','WR','Jerry Jeudy','Alabama',2018,94.0,true,null),
  ('cfb-superteam-wr-dede-westbrook-2016','WR','Dede Westbrook','Oklahoma',2016,94.0,true,null),
  ('cfb-superteam-wr-tavon-austin-2012','WR','Tavon Austin','West Virginia',2012,93.0,true,null),
  ('cfb-superteam-wr-jordan-shipley-2009','WR','Jordan Shipley','Texas',2009,93.0,true,null),
  ('cfb-superteam-wr-brandin-cooks-2013','WR','Brandin Cooks','Oregon State',2013,93.0,true,null),
  ('cfb-superteam-wr-jameson-williams-2021','WR','Jameson Williams','Alabama',2021,93.0,true,null),
  ('cfb-superteam-wr-alshon-jeffery-2010','WR','Alshon Jeffery','South Carolina',2010,93.0,true,null),
  ('cfb-superteam-wr-brian-thomas-jr-2023','WR','Brian Thomas Jr.','LSU',2023,93.0,true,null),
  ('cfb-superteam-wr-tetairoa-mcmillan-2023','WR','Tetairoa McMillan','Arizona',2023,92.0,true,null),
  ('cfb-superteam-wr-mike-williams-2016','WR','Mike Williams','Clemson',2016,92.0,true,null),
  ('cfb-superteam-wr-jeremy-maclin-2008','WR','Jeremy Maclin','Missouri',2008,92.0,true,null),
  ('cfb-superteam-wr-julio-jones-2010','WR','Julio Jones','Alabama',2010,92.0,true,null),
  ('cfb-superteam-wr-robert-woods-2011','WR','Robert Woods','USC',2011,92.0,true,null),
  ('cfb-superteam-wr-drake-london-2021','WR','Drake London','USC',2021,92.0,true,null),
  ('cfb-superteam-wr-tank-dell-2022','WR','Tank Dell','Houston',2022,92.0,true,null),
  ('cfb-superteam-wr-tyler-lockett-2014','WR','Tyler Lockett','Kansas State',2014,91.0,true,null),
  ('cfb-superteam-wr-jalin-hyatt-2022','WR','Jalin Hyatt','Tennessee',2022,91.0,true,null),
  ('cfb-superteam-wr-a-j-green-2010','WR','A.J. Green','Georgia',2010,91.0,true,null),
  ('cfb-superteam-wr-garrett-wilson-2021','WR','Garrett Wilson','Ohio State',2021,91.0,true,null),
  ('cfb-superteam-wr-luther-burden-iii-2023','WR','Luther Burden III','Missouri',2023,91.0,true,null),
  ('cfb-superteam-wr-emeka-egbuka-2022','WR','Emeka Egbuka','Ohio State',2022,91.0,true,null),
  ('cfb-superteam-wr-michael-floyd-2011','WR','Michael Floyd','Notre Dame',2011,91.0,true,null),
  ('cfb-superteam-wr-quentin-johnston-2022','WR','Quentin Johnston','TCU',2022,90.0,true,null),
  ('cfb-superteam-wr-xavier-worthy-2023','WR','Xavier Worthy','Texas',2023,90.0,true,null),
  ('cfb-superteam-wr-rashod-bateman-2019','WR','Rashod Bateman','Minnesota',2019,90.0,true,null),
  ('cfb-superteam-te-kyle-pitts-2020','TE','Kyle Pitts','Florida',2020,99.0,true,null),
  ('cfb-superteam-te-tyler-warren-2024','TE','Tyler Warren','Penn State',2024,99.0,true,null),
  ('cfb-superteam-te-brock-bowers-2021','TE','Brock Bowers','Georgia',2021,98.0,true,null),
  ('cfb-superteam-te-jace-amaro-2013','TE','Jace Amaro','Texas Tech',2013,96.0,true,null),
  ('cfb-superteam-te-mark-andrews-2017','TE','Mark Andrews','Oklahoma',2017,96.0,true,null),
  ('cfb-superteam-te-vernon-davis-2005','TE','Vernon Davis','Maryland',2005,95.0,true,null),
  ('cfb-superteam-te-kellen-winslow-ii-2002','TE','Kellen Winslow II','Miami',2002,95.0,true,null),
  ('cfb-superteam-te-michael-mayer-2022','TE','Michael Mayer','Notre Dame',2022,94.0,true,null),
  ('cfb-superteam-te-zach-ertz-2012','TE','Zach Ertz','Stanford',2012,94.0,true,null),
  ('cfb-superteam-te-dalton-kincaid-2022','TE','Dalton Kincaid','Utah',2022,94.0,true,null),
  ('cfb-superteam-te-evan-engram-2016','TE','Evan Engram','Ole Miss',2016,93.0,true,null),
  ('cfb-superteam-te-trey-mcbride-2021','TE','Trey McBride','Colorado State',2021,93.0,true,null),
  ('cfb-superteam-te-tyler-eifert-2012','TE','Tyler Eifert','Notre Dame',2012,93.0,true,null),
  ('cfb-superteam-te-rob-gronkowski-2008','TE','Rob Gronkowski','Arizona',2008,92.0,true,null),
  ('cfb-superteam-te-dallas-clark-2002','TE','Dallas Clark','Iowa',2002,92.0,true,null),
  ('cfb-superteam-te-t-j-hockenson-2018','TE','T.J. Hockenson','Iowa',2018,92.0,true,null),
  ('cfb-superteam-te-marcedes-lewis-2005','TE','Marcedes Lewis','UCLA',2005,92.0,true,null),
  ('cfb-superteam-te-travis-kelce-2012','TE','Travis Kelce','Cincinnati',2012,91.0,true,null),
  ('cfb-superteam-te-o-j-howard-2015','TE','O.J. Howard','Alabama',2015,91.0,true,null),
  ('cfb-superteam-te-hunter-henry-2015','TE','Hunter Henry','Arkansas',2015,90.0,true,null),
  ('cfb-superteam-te-heath-miller-2003','TE','Heath Miller','Virginia',2003,90.0,true,null),
  ('cfb-superteam-te-noah-fant-2017','TE','Noah Fant','Iowa',2017,89.0,true,null),
  ('cfb-superteam-te-colston-loveland-2024','TE','Colston Loveland','Michigan',2024,89.0,true,null),
  ('cfb-superteam-te-jake-butt-2015','TE','Jake Butt','Michigan',2015,89.0,true,null),
  ('cfb-superteam-front-seven-ndamukong-suh-2009','Front Seven','Ndamukong Suh','Nebraska',2009,100.0,false,null),
  ('cfb-superteam-front-seven-aaron-donald-2013','Front Seven','Aaron Donald','Pittsburgh',2013,99.0,false,null),
  ('cfb-superteam-front-seven-will-anderson-jr-2021','Front Seven','Will Anderson Jr.','Alabama',2021,98.0,false,null),
  ('cfb-superteam-front-seven-luke-kuechly-2011','Front Seven','Luke Kuechly','Boston College',2011,98.0,false,null),
  ('cfb-superteam-front-seven-derrick-johnson-2004','Front Seven','Derrick Johnson','Texas',2004,98.0,false,null),
  ('cfb-superteam-front-seven-jacob-rodriguez-2025','Front Seven','Jacob Rodriguez','Texas Tech',2025,98.0,false,null),
  ('cfb-superteam-front-seven-chase-young-2019','Front Seven','Chase Young','Ohio State',2019,97.0,false,null),
  ('cfb-superteam-front-seven-von-miller-2010','Front Seven','Von Miller','Texas A&M',2010,97.0,false,null),
  ('cfb-superteam-front-seven-aidan-hutchinson-2021','Front Seven','Aidan Hutchinson','Michigan',2021,97.0,false,null),
  ('cfb-superteam-front-seven-manti-teo-2012','Front Seven','Manti Te''o','Notre Dame',2012,97.0,false,null),
  ('cfb-superteam-front-seven-jadeveon-clowney-2012','Front Seven','Jadeveon Clowney','South Carolina',2012,96.0,false,null),
  ('cfb-superteam-front-seven-david-pollack-2004','Front Seven','David Pollack','Georgia',2004,96.0,false,null),
  ('cfb-superteam-front-seven-quinnen-williams-2018','Front Seven','Quinnen Williams','Alabama',2018,96.0,false,null),
  ('cfb-superteam-front-seven-abdul-carter-2024','Front Seven','Abdul Carter','Penn State',2024,96.0,false,null),
  ('cfb-superteam-front-seven-patrick-willis-2006','Front Seven','Patrick Willis','Ole Miss',2006,95.0,false,null),
  ('cfb-superteam-front-seven-a-j-hawk-2005','Front Seven','A.J. Hawk','Ohio State',2005,95.0,false,null),
  ('cfb-superteam-front-seven-roquan-smith-2017','Front Seven','Roquan Smith','Georgia',2017,95.0,false,null),
  ('cfb-superteam-front-seven-joey-bosa-2014','Front Seven','Joey Bosa','Ohio State',2014,95.0,false,null),
  ('cfb-superteam-front-seven-julius-peppers-2001','Front Seven','Julius Peppers','North Carolina',2001,95.0,false,null),
  ('cfb-superteam-front-seven-josh-allen-2018','Front Seven','Josh Allen','Kentucky',2018,95.0,false,null),
  ('cfb-superteam-front-seven-isaiah-simmons-2019','Front Seven','Isaiah Simmons','Clemson',2019,95.0,false,null),
  ('cfb-superteam-front-seven-james-laurinaitis-2006','Front Seven','James Laurinaitis','Ohio State',2006,95.0,false,null),
  ('cfb-superteam-front-seven-j-j-watt-2010','Front Seven','J.J. Watt','Wisconsin',2010,94.0,false,null),
  ('cfb-superteam-front-seven-myles-garrett-2015','Front Seven','Myles Garrett','Texas A&M',2015,94.0,false,null),
  ('cfb-superteam-front-seven-khalil-mack-2013','Front Seven','Khalil Mack','Buffalo',2013,94.0,false,null),
  ('cfb-superteam-front-seven-jonathan-allen-2016','Front Seven','Jonathan Allen','Alabama',2016,94.0,false,null),
  ('cfb-superteam-front-seven-jordan-davis-2021','Front Seven','Jordan Davis','Georgia',2021,94.0,false,null),
  ('cfb-superteam-front-seven-rolando-mcclain-2009','Front Seven','Rolando McClain','Alabama',2009,94.0,false,null),
  ('cfb-superteam-front-seven-devin-white-2018','Front Seven','Devin White','LSU',2018,93.0,false,null),
  ('cfb-superteam-front-seven-nakobe-dean-2021','Front Seven','Nakobe Dean','Georgia',2021,93.0,false,null),
  ('cfb-superteam-front-seven-rey-maualuga-2008','Front Seven','Rey Maualuga','USC',2008,93.0,false,null),
  ('cfb-superteam-front-seven-c-j-mosley-2013','Front Seven','C.J. Mosley','Alabama',2013,93.0,false,null),
  ('cfb-superteam-front-seven-jeremiah-owusu-koramoah-2020','Front Seven','Jeremiah Owusu-Koramoah','Notre Dame',2020,93.0,false,null),
  ('cfb-superteam-front-seven-t-j-watt-2016','Front Seven','T.J. Watt','Wisconsin',2016,93.0,false,null),
  ('cfb-superteam-front-seven-christian-wilkins-2018','Front Seven','Christian Wilkins','Clemson',2018,93.0,false,null),
  ('cfb-superteam-front-seven-brian-orakpo-2008','Front Seven','Brian Orakpo','Texas',2008,93.0,false,null),
  ('cfb-superteam-front-seven-mason-graham-2024','Front Seven','Mason Graham','Michigan',2024,93.0,false,null),
  ('cfb-superteam-front-seven-jack-sawyer-2024','Front Seven','Jack Sawyer','Ohio State',2024,93.0,false,null),
  ('cfb-superteam-front-seven-micah-parsons-2019','Front Seven','Micah Parsons','Penn State',2019,92.0,false,null),
  ('cfb-superteam-front-seven-nick-bosa-2017','Front Seven','Nick Bosa','Ohio State',2017,92.0,false,null),
  ('cfb-superteam-front-seven-jaylon-smith-2015','Front Seven','Jaylon Smith','Notre Dame',2015,92.0,false,null),
  ('cfb-superteam-front-seven-dexter-lawrence-2018','Front Seven','Dexter Lawrence','Clemson',2018,92.0,false,null),
  ('cfb-superteam-front-seven-vita-vea-2017','Front Seven','Vita Vea','Washington',2017,92.0,false,null),
  ('cfb-superteam-front-seven-kayvon-thibodeaux-2021','Front Seven','Kayvon Thibodeaux','Oregon',2021,92.0,false,null),
  ('cfb-superteam-front-seven-dallas-turner-2023','Front Seven','Dallas Turner','Alabama',2023,92.0,false,null),
  ('cfb-superteam-front-seven-brian-cushing-2008','Front Seven','Brian Cushing','USC',2008,91.0,false,null),
  ('cfb-superteam-front-seven-daron-payne-2017','Front Seven','Daron Payne','Alabama',2017,91.0,false,null),
  ('cfb-superteam-front-seven-montez-sweat-2018','Front Seven','Montez Sweat','Mississippi State',2018,91.0,false,null),
  ('cfb-superteam-front-seven-devin-bush-2018','Front Seven','Devin Bush','Michigan',2018,91.0,false,null),
  ('cfb-superteam-front-seven-gerald-mccoy-2009','Front Seven','Gerald McCoy','Oklahoma',2009,91.0,false,null),
  ('cfb-superteam-front-seven-donta-hightower-2011','Front Seven','Dont’a Hightower','Alabama',2011,91.0,false,null),
  ('cfb-superteam-front-seven-ryan-shazier-2013','Front Seven','Ryan Shazier','Ohio State',2013,91.0,false,null),
  ('cfb-superteam-front-seven-jalon-walker-2024','Front Seven','Jalon Walker','Georgia',2024,91.0,false,null),
  ('cfb-superteam-front-seven-myles-jack-2013','Front Seven','Myles Jack','UCLA',2013,90.0,false,null),
  ('cfb-superteam-front-seven-patrick-queen-2019','Front Seven','Patrick Queen','LSU',2019,90.0,false,null),
  ('cfb-superteam-front-seven-leonard-williams-2014','Front Seven','Leonard Williams','USC',2014,90.0,false,null),
  ('cfb-superteam-front-seven-brian-burns-2018','Front Seven','Brian Burns','Florida State',2018,89.0,false,null),
  ('cfb-superteam-front-seven-travon-walker-2021','Front Seven','Travon Walker','Georgia',2021,89.0,false,null),
  ('cfb-superteam-front-seven-clay-matthews-2008','Front Seven','Clay Matthews','USC',2008,88.0,false,null),
  ('cfb-superteam-front-seven-rashan-gary-2018','Front Seven','Rashan Gary','Michigan',2018,88.0,false,null),
  ('cfb-superteam-secondary-ed-reed-2001','Secondary','Ed Reed','Miami',2001,100.0,false,null),
  ('cfb-superteam-secondary-sean-taylor-2003','Secondary','Sean Taylor','Miami',2003,99.0,false,null),
  ('cfb-superteam-secondary-tyrann-mathieu-2011','Secondary','Tyrann Mathieu','LSU',2011,99.0,false,null),
  ('cfb-superteam-secondary-eric-berry-2008','Secondary','Eric Berry','Tennessee',2008,98.0,false,null),
  ('cfb-superteam-secondary-patrick-peterson-2010','Secondary','Patrick Peterson','LSU',2010,98.0,false,null),
  ('cfb-superteam-secondary-travis-hunter-2024','Secondary','Travis Hunter','Colorado',2024,98.0,false,null),
  ('cfb-superteam-secondary-caleb-downs-2025','Secondary','Caleb Downs','Ohio State',2025,97.0,false,null),
  ('cfb-superteam-secondary-earl-thomas-2009','Secondary','Earl Thomas','Texas',2009,97.0,false,null),
  ('cfb-superteam-secondary-minkah-fitzpatrick-2017','Secondary','Minkah Fitzpatrick','Alabama',2017,97.0,false,null),
  ('cfb-superteam-secondary-derek-stingley-jr-2019','Secondary','Derek Stingley Jr.','LSU',2019,96.0,false,null),
  ('cfb-superteam-secondary-michael-huff-2005','Secondary','Michael Huff','Texas',2005,96.0,false,null),
  ('cfb-superteam-secondary-patrick-surtain-ii-2020','Secondary','Patrick Surtain II','Alabama',2020,96.0,false,null),
  ('cfb-superteam-secondary-sauce-gardner-2021','Secondary','Sauce Gardner','Cincinnati',2021,96.0,false,null),
  ('cfb-superteam-secondary-aaron-ross-2006','Secondary','Aaron Ross','Texas',2006,95.0,false,null),
  ('cfb-superteam-secondary-adoree-jackson-2016','Secondary','Adoree'' Jackson','USC',2016,95.0,false,null),
  ('cfb-superteam-secondary-desmond-king-2015','Secondary','Desmond King','Iowa',2015,95.0,false,null),
  ('cfb-superteam-secondary-malcolm-jenkins-2008','Secondary','Malcolm Jenkins','Ohio State',2008,95.0,false,null),
  ('cfb-superteam-secondary-morris-claiborne-2011','Secondary','Morris Claiborne','LSU',2011,95.0,false,null),
  ('cfb-superteam-secondary-roy-williams-2001','Secondary','Roy Williams','Oklahoma',2001,95.0,false,null),
  ('cfb-superteam-secondary-antrel-rolle-2004','Secondary','Antrel Rolle','Miami',2004,94.0,false,null),
  ('cfb-superteam-secondary-antoine-winfield-jr-2019','Secondary','Antoine Winfield Jr.','Minnesota',2019,94.0,false,null),
  ('cfb-superteam-secondary-eric-weddle-2006','Secondary','Eric Weddle','Utah',2006,94.0,false,null),
  ('cfb-superteam-secondary-jahdae-barron-2024','Secondary','Jahdae Barron','Texas',2024,94.0,false,null),
  ('cfb-superteam-secondary-jalen-ramsey-2014','Secondary','Jalen Ramsey','Florida State',2014,94.0,false,null),
  ('cfb-superteam-secondary-reggie-nelson-2006','Secondary','Reggie Nelson','Florida',2006,94.0,false,null),
  ('cfb-superteam-secondary-will-johnson-2023','Secondary','Will Johnson','Michigan',2023,94.0,false,null),
  ('cfb-superteam-secondary-xavier-watts-2023','Secondary','Xavier Watts','Notre Dame',2023,94.0,false,null),
  ('cfb-superteam-secondary-aqib-talib-2007','Secondary','Aqib Talib','Kansas',2007,93.0,false,null),
  ('cfb-superteam-secondary-budda-baker-2016','Secondary','Budda Baker','Washington',2016,93.0,false,null),
  ('cfb-superteam-secondary-cooper-dejean-2023','Secondary','Cooper DeJean','Iowa',2023,93.0,false,null),
  ('cfb-superteam-secondary-grant-delpit-2019','Secondary','Grant Delpit','LSU',2019,93.0,false,null),
  ('cfb-superteam-secondary-kyle-hamilton-2021','Secondary','Kyle Hamilton','Notre Dame',2021,93.0,false,null),
  ('cfb-superteam-secondary-landon-collins-2014','Secondary','Landon Collins','Alabama',2014,93.0,false,null),
  ('cfb-superteam-secondary-malik-hooker-2016','Secondary','Malik Hooker','Ohio State',2016,93.0,false,null),
  ('cfb-superteam-secondary-mike-sainristil-2023','Secondary','Mike Sainristil','Michigan',2023,93.0,false,null),
  ('cfb-superteam-secondary-quentin-jammer-2001','Secondary','Quentin Jammer','Texas',2001,93.0,false,null),
  ('cfb-superteam-secondary-darrelle-revis-2006','Secondary','Darrelle Revis','Pittsburgh',2006,92.0,false,null),
  ('cfb-superteam-secondary-deangelo-hall-2003','Secondary','DeAngelo Hall','Virginia Tech',2003,92.0,false,null),
  ('cfb-superteam-secondary-derwin-james-2015','Secondary','Derwin James','Florida State',2015,92.0,false,null),
  ('cfb-superteam-secondary-ha-ha-clinton-dix-2012','Secondary','Ha Ha Clinton-Dix','Alabama',2012,92.0,false,null),
  ('cfb-superteam-secondary-jaire-alexander-2016','Secondary','Jaire Alexander','Louisville',2016,92.0,false,null),
  ('cfb-superteam-secondary-jeff-okudah-2019','Secondary','Jeff Okudah','Ohio State',2019,92.0,false,null),
  ('cfb-superteam-secondary-joe-haden-2009','Secondary','Joe Haden','Florida',2009,92.0,false,null),
  ('cfb-superteam-secondary-malaki-starks-2022','Secondary','Malaki Starks','Georgia',2022,92.0,false,null),
  ('cfb-superteam-secondary-prince-amukamara-2010','Secondary','Prince Amukamara','Nebraska',2010,92.0,false,null),
  ('cfb-superteam-secondary-a-j-terrell-2018','Secondary','A.J. Terrell','Clemson',2018,91.0,false,null),
  ('cfb-superteam-secondary-emmanuel-forbes-2022','Secondary','Emmanuel Forbes','Mississippi State',2022,91.0,false,null),
  ('cfb-superteam-secondary-jamal-adams-2016','Secondary','Jamal Adams','LSU',2016,91.0,false,null),
  ('cfb-superteam-secondary-terrion-arnold-2023','Secondary','Terrion Arnold','Alabama',2023,91.0,false,null),
  ('cfb-superteam-secondary-trevon-moehrig-2020','Secondary','Trevon Moehrig','TCU',2020,91.0,false,null),
  ('cfb-superteam-secondary-xavier-mckinney-2019','Secondary','Xavier McKinney','Alabama',2019,91.0,false,null),
  ('cfb-superteam-secondary-deshon-elliott-2017','Secondary','DeShon Elliott','Texas',2017,90.0,false,null),
  ('cfb-superteam-secondary-denzel-ward-2017','Secondary','Denzel Ward','Ohio State',2017,90.0,false,null),
  ('cfb-superteam-secondary-kenny-vaccaro-2012','Secondary','Kenny Vaccaro','Texas',2012,90.0,false,null),
  ('cfb-superteam-secondary-kool-aid-mckinstry-2023','Secondary','Kool-Aid McKinstry','Alabama',2023,90.0,false,null),
  ('cfb-superteam-secondary-trevon-diggs-2019','Secondary','Trevon Diggs','Alabama',2019,90.0,false,null),
  ('cfb-superteam-secondary-marshon-lattimore-2016','Secondary','Marshon Lattimore','Ohio State',2016,89.0,false,null),
  ('cfb-superteam-secondary-stephon-gilmore-2011','Secondary','Stephon Gilmore','South Carolina',2011,89.0,false,null),
  ('cfb-superteam-secondary-taylor-mays-2008','Secondary','Taylor Mays','USC',2008,89.0,false,null),
  ('cfb-superteam-secondary-adam-jones-2004','Secondary','Adam Jones','West Virginia',2004,88.0,false,null),
  ('cfb-superteam-head-coach-curt-cignetti-2025','Head Coach','Curt Cignetti','Indiana',2025,100.0,false,null),
  ('cfb-superteam-head-coach-nick-saban-2020','Head Coach','Nick Saban','Alabama',2020,100.0,false,null),
  ('cfb-superteam-head-coach-dabo-swinney-2018','Head Coach','Dabo Swinney','Clemson',2018,99.0,false,null),
  ('cfb-superteam-head-coach-pete-carroll-2004','Head Coach','Pete Carroll','USC',2004,99.0,false,null),
  ('cfb-superteam-head-coach-mack-brown-2005','Head Coach','Mack Brown','Texas',2005,98.0,false,null),
  ('cfb-superteam-head-coach-kirby-smart-2022','Head Coach','Kirby Smart','Georgia',2022,98.0,false,null),
  ('cfb-superteam-head-coach-bob-stoops-2000','Head Coach','Bob Stoops','Oklahoma',2000,98.0,false,null),
  ('cfb-superteam-head-coach-urban-meyer-2008','Head Coach','Urban Meyer','Florida',2008,97.0,false,null),
  ('cfb-superteam-head-coach-jim-harbaugh-2023','Head Coach','Jim Harbaugh','Michigan',2023,97.0,false,null),
  ('cfb-superteam-head-coach-chris-petersen-2006','Head Coach','Chris Petersen','Boise State',2006,97.0,false,null),
  ('cfb-superteam-head-coach-jimbo-fisher-2013','Head Coach','Jimbo Fisher','Florida State',2013,96.0,false,null),
  ('cfb-superteam-head-coach-gary-patterson-2010','Head Coach','Gary Patterson','TCU',2010,96.0,false,null),
  ('cfb-superteam-head-coach-jim-tressel-2002','Head Coach','Jim Tressel','Ohio State',2002,96.0,false,null),
  ('cfb-superteam-head-coach-ed-orgeron-2019','Head Coach','Ed Orgeron','LSU',2019,96.0,false,null),
  ('cfb-superteam-head-coach-ryan-day-2024','Head Coach','Ryan Day','Ohio State',2024,96.0,false,null),
  ('cfb-superteam-head-coach-kalen-deboer-2023','Head Coach','Kalen DeBoer','Washington',2023,96.0,false,null),
  ('cfb-superteam-head-coach-scott-frost-2017','Head Coach','Scott Frost','UCF',2017,96.0,false,null),
  ('cfb-superteam-head-coach-les-miles-2011','Head Coach','Les Miles','LSU',2011,95.0,false,null),
  ('cfb-superteam-head-coach-mark-dantonio-2013','Head Coach','Mark Dantonio','Michigan State',2013,95.0,false,null),
  ('cfb-superteam-head-coach-sonny-dykes-2022','Head Coach','Sonny Dykes','TCU',2022,95.0,false,null),
  ('cfb-superteam-head-coach-chip-kelly-2010','Head Coach','Chip Kelly','Oregon',2010,95.0,false,null),
  ('cfb-superteam-head-coach-marcus-freeman-2024','Head Coach','Marcus Freeman','Notre Dame',2024,95.0,false,null),
  ('cfb-superteam-head-coach-kyle-whittingham-2008','Head Coach','Kyle Whittingham','Utah',2008,95.0,false,null),
  ('cfb-superteam-head-coach-mike-gundy-2011','Head Coach','Mike Gundy','Oklahoma State',2011,94.0,false,null),
  ('cfb-superteam-head-coach-gus-malzahn-2013','Head Coach','Gus Malzahn','Auburn',2013,94.0,false,null),
  ('cfb-superteam-head-coach-brian-kelly-2012','Head Coach','Brian Kelly','Notre Dame',2012,94.0,false,null),
  ('cfb-superteam-head-coach-dan-lanning-2024','Head Coach','Dan Lanning','Oregon',2024,94.0,false,null),
  ('cfb-superteam-head-coach-steve-sarkisian-2023','Head Coach','Steve Sarkisian','Texas',2023,94.0,false,null),
  ('cfb-superteam-head-coach-lincoln-riley-2017','Head Coach','Lincoln Riley','Oklahoma',2017,93.0,false,null),
  ('cfb-superteam-head-coach-dave-aranda-2021','Head Coach','Dave Aranda','Baylor',2021,93.0,false,null),
  ('cfb-superteam-head-coach-josh-heupel-2022','Head Coach','Josh Heupel','Tennessee',2022,92.0,false,null),
  ('cfb-superteam-head-coach-mark-richt-2002','Head Coach','Mark Richt','Georgia',2002,92.0,false,null),
  ('cfb-superteam-head-coach-mike-leach-2008','Head Coach','Mike Leach','Texas Tech',2008,91.0,false,null),
  ('cfb-superteam-head-coach-lane-kiffin-2023','Head Coach','Lane Kiffin','Ole Miss',2023,90.0,false,null),
  ('cfb-superteam-head-coach-deion-sanders-2024','Head Coach','Deion Sanders','Colorado',2024,88.0,false,null)
on conflict(item_reference) do update set
  candidate_group=excluded.candidate_group,
  display_name=excluded.display_name,
  school=excluded.school,
  season_year=excluded.season_year,
  hidden_grade=excluded.hidden_grade,
  flex_eligible=excluded.flex_eligible,
  source_reference=excluded.source_reference;

-- Reuse the already-audited CFB Trio RB population rather than creating a
-- second 50-player RB identity owner. The Superteam scale is normalized to
-- the locked 88–100 weekly range while preserving the Trio ordering.
insert into private.cfb_superteam_authority(
  item_reference,candidate_group,display_name,school,season_year,hidden_grade,flex_eligible,source_reference
)
select
  'cfb-superteam-rb-' ||
    trim(both '-' from regexp_replace(lower(translate(pool.display_name,'’''','')), '[^a-z0-9]+', '-', 'g')) ||
    '-' || pool.peak_season::text,
  'RB',
  pool.display_name,
  pool.peak_team,
  pool.peak_season,
  round((88 + ((pool.hidden_grade - 81.0) / 17.0) * 12.0)::numeric,0),
  true,
  pool.player_reference
from private.draft_room_trio_player_pool pool
where pool.mode_id='trio-cfb'
  and pool.position='RB'
on conflict(item_reference) do update set
  candidate_group=excluded.candidate_group,
  display_name=excluded.display_name,
  school=excluded.school,
  season_year=excluded.season_year,
  hidden_grade=excluded.hidden_grade,
  flex_eligible=excluded.flex_eligible,
  source_reference=excluded.source_reference;

do $superteam_authority_counts$
declare
  v_qb integer; v_rb integer; v_wr integer; v_te integer;
  v_f7 integer; v_secondary integer; v_coach integer;
begin
  select count(*) filter(where candidate_group='QB'),
         count(*) filter(where candidate_group='RB'),
         count(*) filter(where candidate_group='WR'),
         count(*) filter(where candidate_group='TE'),
         count(*) filter(where candidate_group='Front Seven'),
         count(*) filter(where candidate_group='Secondary'),
         count(*) filter(where candidate_group='Head Coach')
  into v_qb,v_rb,v_wr,v_te,v_f7,v_secondary,v_coach
  from private.cfb_superteam_authority;

  if v_qb<>50 or v_rb<>50 or v_wr<>50 or v_te<>24
    or v_f7<>60 or v_secondary<>60 or v_coach<>35
  then
    raise exception
      'CFB Superteam authority count drift: QB %, RB %, WR %, TE %, F7 %, Secondary %, Coach %',
      v_qb,v_rb,v_wr,v_te,v_f7,v_secondary,v_coach;
  end if;
end;
$superteam_authority_counts$;

alter table private.football_weekly_auction_subjects
  drop constraint if exists football_weekly_auction_subjects_item_kind_check;
alter table private.football_weekly_auction_subjects
  add constraint football_weekly_auction_subjects_item_kind_check
  check (item_kind in ('team-season','player-season','player-career','mixed-roster'));

-- Preserve the completed Sep. 15 CFB Teams week for history, but retire that
-- subject from future rotation. Superteam takes its CFB rotation position.
update private.football_weekly_auction_subjects
set rotation_order=2,is_active=false
where subject_key='cfb-best-teams-since-2000';

insert into private.football_weekly_auction_subjects(
  subject_key,display_name,short_label,competition_level,item_kind,
  rotation_order,eligible_from,is_active
) values (
  'cfb-superteam','CFB Superteam','Superteam','CFB','mixed-roster',
  0,date '2026-09-29',true
)
on conflict(subject_key) do update set
  display_name=excluded.display_name,
  short_label=excluded.short_label,
  competition_level=excluded.competition_level,
  item_kind=excluded.item_kind,
  rotation_order=excluded.rotation_order,
  eligible_from=excluded.eligible_from,
  is_active=excluded.is_active;

insert into private.football_weekly_auction_items(
  item_reference,subject_key,season_year,primary_name,secondary_name,team_code,
  board_bucket,identity_group,display_label,hidden_grade,source_url,grading_inputs
)
select
  authority.item_reference,
  'cfb-superteam',
  authority.season_year,
  authority.display_name,
  authority.school,
  null,
  authority.candidate_group,
  authority.display_name,
  authority.display_name || ' · ' || authority.school || ' · ' || authority.season_year::text,
  authority.hidden_grade,
  null,
  jsonb_build_object(
    'candidate_group',authority.candidate_group,
    'school',authority.school,
    'season_year',authority.season_year,
    'flex_eligible',authority.flex_eligible,
    'source_reference',authority.source_reference
  )
from private.cfb_superteam_authority authority
on conflict(item_reference) do update set
  subject_key=excluded.subject_key,
  season_year=excluded.season_year,
  primary_name=excluded.primary_name,
  secondary_name=excluded.secondary_name,
  team_code=excluded.team_code,
  board_bucket=excluded.board_bucket,
  identity_group=excluded.identity_group,
  display_label=excluded.display_label,
  hidden_grade=excluded.hidden_grade,
  source_url=excluded.source_url,
  grading_inputs=excluded.grading_inputs;

do $superteam_catalog_contract$
declare v_authority integer; v_catalog integer;
begin
  select count(*) into v_authority from private.cfb_superteam_authority;
  select count(*) into v_catalog
  from private.football_weekly_auction_items
  where subject_key='cfb-superteam';

  if v_authority<>329 or v_catalog<>329 then
    raise exception 'CFB Superteam catalog must contain 329 authority items (authority %, catalog %)',v_authority,v_catalog;
  end if;

  if private.football_weekly_auction_subject_for_week(date '2026-09-29') <> 'cfb-superteam' then
    raise exception 'Sep. 29 Weekly Auction must resolve to CFB Superteam';
  end if;
end;
$superteam_catalog_contract$;
