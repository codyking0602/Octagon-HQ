-- Restore the locked CFB Superteam deep pools and Standard-first board generator.
-- The Sep. 29 launch runtime stays intact: 7 roster spots, $50 bankroll, max 2 wins/day,
-- ranked conditional claims, rotating ties, $1/open-slot reserve, and worst-eligible autofill.
-- This migration fixes the content layer: the 56-card compressed launch snapshot becomes a
-- reusable 329-candidate authority, and every Superteam week is generated as a balanced
-- Standard board with small natural variance rather than named Wide/Compressed/Trap shapes.

alter table private.cfb_superteam_v1_authority
  alter column launch_day drop not null,
  alter column launch_slot drop not null;

update private.cfb_superteam_v1_authority
set launch_day=null, launch_slot=null;

insert into private.cfb_superteam_v1_authority(
  item_reference,display_name,school,season_year,group_key,eligible_slots,hidden_grade,launch_day,launch_slot
) values
  ('cfb-superteam-cam-newton-2010','Cam Newton','Auburn',2010,'QB',array['QB'],100,null,null),
  ('cfb-superteam-joe-burrow-2019','Joe Burrow','LSU',2019,'QB',array['QB'],100,null,null),
  ('cfb-superteam-vince-young-2005','Vince Young','Texas',2005,'QB',array['QB'],99,null,null),
  ('cfb-superteam-marcus-mariota-2014','Marcus Mariota','Oregon',2014,'QB',array['QB'],98,null,null),
  ('cfb-superteam-lamar-jackson-2016','Lamar Jackson','Louisville',2016,'QB',array['QB'],98,null,null),
  ('cfb-superteam-jayden-daniels-2023','Jayden Daniels','LSU',2023,'QB',array['QB'],98,null,null),
  ('cfb-superteam-fernando-mendoza-2025','Fernando Mendoza','Indiana',2025,'QB',array['QB'],98,null,null),
  ('cfb-superteam-jameis-winston-2013','Jameis Winston','Florida State',2013,'QB',array['QB'],97,null,null),
  ('cfb-superteam-baker-mayfield-2017','Baker Mayfield','Oklahoma',2017,'QB',array['QB'],97,null,null),
  ('cfb-superteam-mac-jones-2020','Mac Jones','Alabama',2020,'QB',array['QB'],97,null,null),
  ('cfb-superteam-sam-bradford-2008','Sam Bradford','Oklahoma',2008,'QB',array['QB'],96,null,null),
  ('cfb-superteam-robert-griffin-iii-2011','Robert Griffin III','Baylor',2011,'QB',array['QB'],96,null,null),
  ('cfb-superteam-tua-tagovailoa-2018','Tua Tagovailoa','Alabama',2018,'QB',array['QB'],96,null,null),
  ('cfb-superteam-kyler-murray-2018','Kyler Murray','Oklahoma',2018,'QB',array['QB'],96,null,null),
  ('cfb-superteam-bryce-young-2021','Bryce Young','Alabama',2021,'QB',array['QB'],96,null,null),
  ('cfb-superteam-caleb-williams-2022','Caleb Williams','USC',2022,'QB',array['QB'],96,null,null),
  ('cfb-superteam-matt-leinart-2004','Matt Leinart','USC',2004,'QB',array['QB'],95,null,null),
  ('cfb-superteam-andrew-luck-2011','Andrew Luck','Stanford',2011,'QB',array['QB'],95,null,null),
  ('cfb-superteam-johnny-manziel-2012','Johnny Manziel','Texas A&M',2012,'QB',array['QB'],95,null,null),
  ('cfb-superteam-deshaun-watson-2016','Deshaun Watson','Clemson',2016,'QB',array['QB'],95,null,null),
  ('cfb-superteam-justin-fields-2019','Justin Fields','Ohio State',2019,'QB',array['QB'],95,null,null),
  ('cfb-superteam-alex-smith-2004','Alex Smith','Utah',2004,'QB',array['QB'],94,null,null),
  ('cfb-superteam-tim-tebow-2007','Tim Tebow','Florida',2007,'QB',array['QB'],94,null,null),
  ('cfb-superteam-trevor-lawrence-2018','Trevor Lawrence','Clemson',2018,'QB',array['QB'],94,null,null),
  ('cfb-superteam-c-j-stroud-2022','C.J. Stroud','Ohio State',2022,'QB',array['QB'],94,null,null),
  ('cfb-superteam-bo-nix-2023','Bo Nix','Oregon',2023,'QB',array['QB'],94,null,null),
  ('cfb-superteam-troy-smith-2006','Troy Smith','Ohio State',2006,'QB',array['QB'],93,null,null),
  ('cfb-superteam-colt-mccoy-2008','Colt McCoy','Texas',2008,'QB',array['QB'],93,null,null),
  ('cfb-superteam-russell-wilson-2011','Russell Wilson','Wisconsin',2011,'QB',array['QB'],93,null,null),
  ('cfb-superteam-dwayne-haskins-2018','Dwayne Haskins','Ohio State',2018,'QB',array['QB'],93,null,null),
  ('cfb-superteam-jalen-hurts-2019','Jalen Hurts','Oklahoma',2019,'QB',array['QB'],93,null,null),
  ('cfb-superteam-michael-penix-jr-2023','Michael Penix Jr.','Washington',2023,'QB',array['QB'],93,null,null),
  ('cfb-superteam-carson-palmer-2002','Carson Palmer','USC',2002,'QB',array['QB'],92,null,null),
  ('cfb-superteam-jason-white-2003','Jason White','Oklahoma',2003,'QB',array['QB'],92,null,null),
  ('cfb-superteam-cam-ward-2024','Cam Ward','Miami',2024,'QB',array['QB'],92,null,null),
  ('cfb-superteam-diego-pavia-2025','Diego Pavia','Vanderbilt',2025,'QB',array['QB'],92,null,null),
  ('cfb-superteam-colt-brennan-2006','Colt Brennan','Hawaii',2006,'QB',array['QB'],91,null,null),
  ('cfb-superteam-kellen-moore-2010','Kellen Moore','Boise State',2010,'QB',array['QB'],91,null,null),
  ('cfb-superteam-teddy-bridgewater-2013','Teddy Bridgewater','Louisville',2013,'QB',array['QB'],91,null,null),
  ('cfb-superteam-max-duggan-2022','Max Duggan','TCU',2022,'QB',array['QB'],91,null,null),
  ('cfb-superteam-hendon-hooker-2022','Hendon Hooker','Tennessee',2022,'QB',array['QB'],91,null,null),
  ('cfb-superteam-pat-white-2007','Pat White','West Virginia',2007,'QB',array['QB'],90,null,null),
  ('cfb-superteam-chase-daniel-2007','Chase Daniel','Missouri',2007,'QB',array['QB'],90,null,null),
  ('cfb-superteam-dak-prescott-2014','Dak Prescott','Mississippi State',2014,'QB',array['QB'],90,null,null),
  ('cfb-superteam-mckenzie-milton-2017','McKenzie Milton','UCF',2017,'QB',array['QB'],90,null,null),
  ('cfb-superteam-josh-heupel-2000','Josh Heupel','Oklahoma',2000,'QB',array['QB'],89,null,null),
  ('cfb-superteam-eli-manning-2003','Eli Manning','Ole Miss',2003,'QB',array['QB'],89,null,null),
  ('cfb-superteam-graham-harrell-2008','Graham Harrell','Texas Tech',2008,'QB',array['QB'],89,null,null),
  ('cfb-superteam-patrick-mahomes-2016','Patrick Mahomes','Texas Tech',2016,'QB',array['QB'],89,null,null),
  ('cfb-superteam-eric-crouch-2001','Eric Crouch','Nebraska',2001,'QB',array['QB'],88,null,null),
  ('cfb-superteam-reggie-bush-2005','Reggie Bush','USC',2005,'RB',array['RB','Flex'],100,null,null),
  ('cfb-superteam-derrick-henry-2015','Derrick Henry','Alabama',2015,'RB',array['RB','Flex'],99,null,null),
  ('cfb-superteam-darren-mcfadden-2007','Darren McFadden','Arkansas',2007,'RB',array['RB','Flex'],98,null,null),
  ('cfb-superteam-melvin-gordon-2014','Melvin Gordon','Wisconsin',2014,'RB',array['RB','Flex'],98,null,null),
  ('cfb-superteam-christian-mccaffrey-2015','Christian McCaffrey','Stanford',2015,'RB',array['RB','Flex'],98,null,null),
  ('cfb-superteam-ladainian-tomlinson-2000','LaDainian Tomlinson','TCU',2000,'RB',array['RB','Flex'],97,null,null),
  ('cfb-superteam-ezekiel-elliott-2014','Ezekiel Elliott','Ohio State',2014,'RB',array['RB','Flex'],97,null,null),
  ('cfb-superteam-ashton-jeanty-2024','Ashton Jeanty','Boise State',2024,'RB',array['RB','Flex'],97,null,null),
  ('cfb-superteam-adrian-peterson-2004','Adrian Peterson','Oklahoma',2004,'RB',array['RB','Flex'],96,null,null),
  ('cfb-superteam-jonathan-taylor-2019','Jonathan Taylor','Wisconsin',2019,'RB',array['RB','Flex'],96,null,null),
  ('cfb-superteam-montee-ball-2011','Montee Ball','Wisconsin',2011,'RB',array['RB','Flex'],96,null,null),
  ('cfb-superteam-mark-ingram-2009','Mark Ingram','Alabama',2009,'RB',array['RB','Flex'],95,null,null),
  ('cfb-superteam-trent-richardson-2011','Trent Richardson','Alabama',2011,'RB',array['RB','Flex'],95,null,null),
  ('cfb-superteam-lamichael-james-2010','LaMichael James','Oregon',2010,'RB',array['RB','Flex'],95,null,null),
  ('cfb-superteam-bryce-love-2017','Bryce Love','Stanford',2017,'RB',array['RB','Flex'],95,null,null),
  ('cfb-superteam-kenneth-walker-iii-2021','Kenneth Walker III','Michigan State',2021,'RB',array['RB','Flex'],95,null,null),
  ('cfb-superteam-najee-harris-2020','Najee Harris','Alabama',2020,'RB',array['RB','Flex'],95,null,null),
  ('cfb-superteam-willis-mcgahee-2002','Willis McGahee','Miami',2002,'RB',array['RB','Flex'],94,null,null),
  ('cfb-superteam-deangelo-williams-2005','DeAngelo Williams','Memphis',2005,'RB',array['RB','Flex'],94,null,null),
  ('cfb-superteam-leonard-fournette-2015','Leonard Fournette','LSU',2015,'RB',array['RB','Flex'],94,null,null),
  ('cfb-superteam-dalvin-cook-2016','Dalvin Cook','Florida State',2016,'RB',array['RB','Flex'],94,null,null),
  ('cfb-superteam-nick-chubb-2014','Nick Chubb','Georgia',2014,'RB',array['RB','Flex'],94,null,null),
  ('cfb-superteam-cameron-skattebo-2024','Cameron Skattebo','Arizona State',2024,'RB',array['RB','Flex'],94,null,null),
  ('cfb-superteam-saquon-barkley-2017','Saquon Barkley','Penn State',2017,'RB',array['RB','Flex'],93,null,null),
  ('cfb-superteam-bijan-robinson-2022','Bijan Robinson','Texas',2022,'RB',array['RB','Flex'],93,null,null),
  ('cfb-superteam-darren-sproles-2003','Darren Sproles','Kansas State',2003,'RB',array['RB','Flex'],93,null,null),
  ('cfb-superteam-tre-mason-2013','Tre Mason','Auburn',2013,'RB',array['RB','Flex'],93,null,null),
  ('cfb-superteam-j-k-dobbins-2019','J.K. Dobbins','Ohio State',2019,'RB',array['RB','Flex'],93,null,null),
  ('cfb-superteam-c-j-spiller-2009','C.J. Spiller','Clemson',2009,'RB',array['RB','Flex'],93,null,null),
  ('cfb-superteam-travis-etienne-2018','Travis Etienne','Clemson',2018,'RB',array['RB','Flex'],92,null,null),
  ('cfb-superteam-breece-hall-2020','Breece Hall','Iowa State',2020,'RB',array['RB','Flex'],92,null,null),
  ('cfb-superteam-jamaal-charles-2007','Jamaal Charles','Texas',2007,'RB',array['RB','Flex'],92,null,null),
  ('cfb-superteam-ray-rice-2007','Ray Rice','Rutgers',2007,'RB',array['RB','Flex'],92,null,null),
  ('cfb-superteam-jeremiyah-love-2025','Jeremiyah Love','Notre Dame',2025,'RB',array['RB','Flex'],92,null,null),
  ('cfb-superteam-maurice-clarett-2002','Maurice Clarett','Ohio State',2002,'RB',array['RB','Flex'],91,null,null),
  ('cfb-superteam-steve-slaton-2006','Steve Slaton','West Virginia',2006,'RB',array['RB','Flex'],91,null,null),
  ('cfb-superteam-toby-gerhart-2009','Toby Gerhart','Stanford',2009,'RB',array['RB','Flex'],91,null,null),
  ('cfb-superteam-ollie-gordon-ii-2023','Ollie Gordon II','Oklahoma State',2023,'RB',array['RB','Flex'],91,null,null),
  ('cfb-superteam-todd-gurley-2012','Todd Gurley','Georgia',2012,'RB',array['RB','Flex'],90,null,null),
  ('cfb-superteam-marshawn-lynch-2006','Marshawn Lynch','California',2006,'RB',array['RB','Flex'],90,null,null),
  ('cfb-superteam-jahmyr-gibbs-2022','Jahmyr Gibbs','Alabama',2022,'RB',array['RB','Flex'],90,null,null),
  ('cfb-superteam-quinshon-judkins-2022','Quinshon Judkins','Ole Miss',2022,'RB',array['RB','Flex'],90,null,null),
  ('cfb-superteam-omarion-hampton-2024','Omarion Hampton','North Carolina',2024,'RB',array['RB','Flex'],89,null,null),
  ('cfb-superteam-deuce-vaughn-2021','Deuce Vaughn','Kansas State',2021,'RB',array['RB','Flex'],89,null,null),
  ('cfb-superteam-ameer-abdullah-2014','Ameer Abdullah','Nebraska',2014,'RB',array['RB','Flex'],89,null,null),
  ('cfb-superteam-dylan-sampson-2024','Dylan Sampson','Tennessee',2024,'RB',array['RB','Flex'],88,null,null),
  ('cfb-superteam-donta-foreman-2016','D''Onta Foreman','Texas',2016,'RB',array['RB','Flex'],94,null,null),
  ('cfb-superteam-lesean-mccoy-2008','LeSean McCoy','Pittsburgh',2008,'RB',array['RB','Flex'],91,null,null),
  ('cfb-superteam-knowshon-moreno-2008','Knowshon Moreno','Georgia',2008,'RB',array['RB','Flex'],91,null,null),
  ('cfb-superteam-demarco-murray-2010','DeMarco Murray','Oklahoma',2010,'RB',array['RB','Flex'],90,null,null),
  ('cfb-superteam-devonta-smith-2020','DeVonta Smith','Alabama',2020,'WR',array['WR','Flex'],100,null,null),
  ('cfb-superteam-larry-fitzgerald-2003','Larry Fitzgerald','Pittsburgh',2003,'WR',array['WR','Flex'],99,null,null),
  ('cfb-superteam-michael-crabtree-2007','Michael Crabtree','Texas Tech',2007,'WR',array['WR','Flex'],99,null,null),
  ('cfb-superteam-jamarr-chase-2019','Ja''Marr Chase','LSU',2019,'WR',array['WR','Flex'],98,null,null),
  ('cfb-superteam-justin-blackmon-2010','Justin Blackmon','Oklahoma State',2010,'WR',array['WR','Flex'],98,null,null),
  ('cfb-superteam-amari-cooper-2014','Amari Cooper','Alabama',2014,'WR',array['WR','Flex'],97,null,null),
  ('cfb-superteam-calvin-johnson-2006','Calvin Johnson','Georgia Tech',2006,'WR',array['WR','Flex'],96,null,null),
  ('cfb-superteam-marqise-lee-2012','Marqise Lee','USC',2012,'WR',array['WR','Flex'],96,null,null),
  ('cfb-superteam-justin-jefferson-2019','Justin Jefferson','LSU',2019,'WR',array['WR','Flex'],96,null,null),
  ('cfb-superteam-rome-odunze-2023','Rome Odunze','Washington',2023,'WR',array['WR','Flex'],96,null,null),
  ('cfb-superteam-jeremiah-smith-2024','Jeremiah Smith','Ohio State',2024,'WR',array['WR','Flex'],96,null,null),
  ('cfb-superteam-malik-nabers-2023','Malik Nabers','LSU',2023,'WR',array['WR','Flex'],95,null,null),
  ('cfb-superteam-ceedee-lamb-2019','CeeDee Lamb','Oklahoma',2019,'WR',array['WR','Flex'],95,null,null),
  ('cfb-superteam-dez-bryant-2008','Dez Bryant','Oklahoma State',2008,'WR',array['WR','Flex'],95,null,null),
  ('cfb-superteam-braylon-edwards-2004','Braylon Edwards','Michigan',2004,'WR',array['WR','Flex'],95,null,null),
  ('cfb-superteam-sammy-watkins-2013','Sammy Watkins','Clemson',2013,'WR',array['WR','Flex'],95,null,null),
  ('cfb-superteam-jaxon-smith-njigba-2021','Jaxon Smith-Njigba','Ohio State',2021,'WR',array['WR','Flex'],95,null,null),
  ('cfb-superteam-marvin-harrison-jr-2023','Marvin Harrison Jr.','Ohio State',2023,'WR',array['WR','Flex'],94,null,null),
  ('cfb-superteam-jordan-addison-2021','Jordan Addison','Pittsburgh',2021,'WR',array['WR','Flex'],94,null,null),
  ('cfb-superteam-mike-evans-2013','Mike Evans','Texas A&M',2013,'WR',array['WR','Flex'],94,null,null),
  ('cfb-superteam-golden-tate-2009','Golden Tate','Notre Dame',2009,'WR',array['WR','Flex'],94,null,null),
  ('cfb-superteam-roy-williams-2002','Roy Williams','Texas',2002,'WR',array['WR','Flex'],94,null,null),
  ('cfb-superteam-dwayne-jarrett-2005','Dwayne Jarrett','USC',2005,'WR',array['WR','Flex'],94,null,null),
  ('cfb-superteam-percy-harvin-2008','Percy Harvin','Florida',2008,'WR',array['WR','Flex'],94,null,null),
  ('cfb-superteam-corey-coleman-2015','Corey Coleman','Baylor',2015,'WR',array['WR','Flex'],94,null,null),
  ('cfb-superteam-jerry-jeudy-2018','Jerry Jeudy','Alabama',2018,'WR',array['WR','Flex'],94,null,null),
  ('cfb-superteam-dede-westbrook-2016','Dede Westbrook','Oklahoma',2016,'WR',array['WR','Flex'],94,null,null),
  ('cfb-superteam-tavon-austin-2012','Tavon Austin','West Virginia',2012,'WR',array['WR','Flex'],93,null,null),
  ('cfb-superteam-jordan-shipley-2009','Jordan Shipley','Texas',2009,'WR',array['WR','Flex'],93,null,null),
  ('cfb-superteam-brandin-cooks-2013','Brandin Cooks','Oregon State',2013,'WR',array['WR','Flex'],93,null,null),
  ('cfb-superteam-jameson-williams-2021','Jameson Williams','Alabama',2021,'WR',array['WR','Flex'],93,null,null),
  ('cfb-superteam-alshon-jeffery-2010','Alshon Jeffery','South Carolina',2010,'WR',array['WR','Flex'],93,null,null),
  ('cfb-superteam-brian-thomas-jr-2023','Brian Thomas Jr.','LSU',2023,'WR',array['WR','Flex'],93,null,null),
  ('cfb-superteam-tetairoa-mcmillan-2023','Tetairoa McMillan','Arizona',2023,'WR',array['WR','Flex'],92,null,null),
  ('cfb-superteam-mike-williams-2016','Mike Williams','Clemson',2016,'WR',array['WR','Flex'],92,null,null),
  ('cfb-superteam-jeremy-maclin-2008','Jeremy Maclin','Missouri',2008,'WR',array['WR','Flex'],92,null,null),
  ('cfb-superteam-julio-jones-2010','Julio Jones','Alabama',2010,'WR',array['WR','Flex'],92,null,null),
  ('cfb-superteam-robert-woods-2011','Robert Woods','USC',2011,'WR',array['WR','Flex'],92,null,null),
  ('cfb-superteam-drake-london-2021','Drake London','USC',2021,'WR',array['WR','Flex'],92,null,null),
  ('cfb-superteam-tyler-lockett-2014','Tyler Lockett','Kansas State',2014,'WR',array['WR','Flex'],91,null,null),
  ('cfb-superteam-jalin-hyatt-2022','Jalin Hyatt','Tennessee',2022,'WR',array['WR','Flex'],91,null,null),
  ('cfb-superteam-a-j-green-2010','A.J. Green','Georgia',2010,'WR',array['WR','Flex'],91,null,null),
  ('cfb-superteam-garrett-wilson-2021','Garrett Wilson','Ohio State',2021,'WR',array['WR','Flex'],91,null,null),
  ('cfb-superteam-luther-burden-iii-2023','Luther Burden III','Missouri',2023,'WR',array['WR','Flex'],91,null,null),
  ('cfb-superteam-emeka-egbuka-2022','Emeka Egbuka','Ohio State',2022,'WR',array['WR','Flex'],91,null,null),
  ('cfb-superteam-michael-floyd-2011','Michael Floyd','Notre Dame',2011,'WR',array['WR','Flex'],90,null,null),
  ('cfb-superteam-quentin-johnston-2022','Quentin Johnston','TCU',2022,'WR',array['WR','Flex'],90,null,null),
  ('cfb-superteam-xavier-worthy-2023','Xavier Worthy','Texas',2023,'WR',array['WR','Flex'],90,null,null),
  ('cfb-superteam-rashod-bateman-2019','Rashod Bateman','Minnesota',2019,'WR',array['WR','Flex'],90,null,null),
  ('cfb-superteam-tee-higgins-2019','Tee Higgins','Clemson',2019,'WR',array['WR','Flex'],90,null,null),
  ('cfb-superteam-kyle-pitts-2020','Kyle Pitts','Florida',2020,'TE',array['Flex'],99,null,null),
  ('cfb-superteam-tyler-warren-2024','Tyler Warren','Penn State',2024,'TE',array['Flex'],99,null,null),
  ('cfb-superteam-brock-bowers-2021','Brock Bowers','Georgia',2021,'TE',array['Flex'],98,null,null),
  ('cfb-superteam-jace-amaro-2013','Jace Amaro','Texas Tech',2013,'TE',array['Flex'],96,null,null),
  ('cfb-superteam-mark-andrews-2017','Mark Andrews','Oklahoma',2017,'TE',array['Flex'],96,null,null),
  ('cfb-superteam-vernon-davis-2005','Vernon Davis','Maryland',2005,'TE',array['Flex'],95,null,null),
  ('cfb-superteam-kellen-winslow-ii-2002','Kellen Winslow II','Miami',2002,'TE',array['Flex'],95,null,null),
  ('cfb-superteam-michael-mayer-2022','Michael Mayer','Notre Dame',2022,'TE',array['Flex'],94,null,null),
  ('cfb-superteam-zach-ertz-2012','Zach Ertz','Stanford',2012,'TE',array['Flex'],94,null,null),
  ('cfb-superteam-dalton-kincaid-2022','Dalton Kincaid','Utah',2022,'TE',array['Flex'],94,null,null),
  ('cfb-superteam-evan-engram-2016','Evan Engram','Ole Miss',2016,'TE',array['Flex'],93,null,null),
  ('cfb-superteam-trey-mcbride-2021','Trey McBride','Colorado State',2021,'TE',array['Flex'],93,null,null),
  ('cfb-superteam-tyler-eifert-2012','Tyler Eifert','Notre Dame',2012,'TE',array['Flex'],93,null,null),
  ('cfb-superteam-rob-gronkowski-2008','Rob Gronkowski','Arizona',2008,'TE',array['Flex'],92,null,null),
  ('cfb-superteam-dallas-clark-2002','Dallas Clark','Iowa',2002,'TE',array['Flex'],92,null,null),
  ('cfb-superteam-t-j-hockenson-2018','T.J. Hockenson','Iowa',2018,'TE',array['Flex'],92,null,null),
  ('cfb-superteam-marcedes-lewis-2005','Marcedes Lewis','UCLA',2005,'TE',array['Flex'],92,null,null),
  ('cfb-superteam-travis-kelce-2012','Travis Kelce','Cincinnati',2012,'TE',array['Flex'],91,null,null),
  ('cfb-superteam-o-j-howard-2015','O.J. Howard','Alabama',2015,'TE',array['Flex'],91,null,null),
  ('cfb-superteam-hunter-henry-2015','Hunter Henry','Arkansas',2015,'TE',array['Flex'],90,null,null),
  ('cfb-superteam-heath-miller-2003','Heath Miller','Virginia',2003,'TE',array['Flex'],90,null,null),
  ('cfb-superteam-colston-loveland-2024','Colston Loveland','Michigan',2024,'TE',array['Flex'],89,null,null),
  ('cfb-superteam-jake-butt-2015','Jake Butt','Michigan',2015,'TE',array['Flex'],89,null,null),
  ('cfb-superteam-noah-fant-2017','Noah Fant','Iowa',2017,'TE',array['Flex'],89,null,null),
  ('cfb-superteam-ndamukong-suh-2009','Ndamukong Suh','Nebraska',2009,'Front Seven',array['Front Seven'],100,null,null),
  ('cfb-superteam-aaron-donald-2013','Aaron Donald','Pittsburgh',2013,'Front Seven',array['Front Seven'],99,null,null),
  ('cfb-superteam-will-anderson-jr-2021','Will Anderson Jr.','Alabama',2021,'Front Seven',array['Front Seven'],98,null,null),
  ('cfb-superteam-luke-kuechly-2011','Luke Kuechly','Boston College',2011,'Front Seven',array['Front Seven'],98,null,null),
  ('cfb-superteam-derrick-johnson-2004','Derrick Johnson','Texas',2004,'Front Seven',array['Front Seven'],98,null,null),
  ('cfb-superteam-chase-young-2019','Chase Young','Ohio State',2019,'Front Seven',array['Front Seven'],97,null,null),
  ('cfb-superteam-von-miller-2010','Von Miller','Texas A&M',2010,'Front Seven',array['Front Seven'],97,null,null),
  ('cfb-superteam-aidan-hutchinson-2021','Aidan Hutchinson','Michigan',2021,'Front Seven',array['Front Seven'],97,null,null),
  ('cfb-superteam-manti-teo-2012','Manti Te''o','Notre Dame',2012,'Front Seven',array['Front Seven'],97,null,null),
  ('cfb-superteam-jadeveon-clowney-2012','Jadeveon Clowney','South Carolina',2012,'Front Seven',array['Front Seven'],96,null,null),
  ('cfb-superteam-david-pollack-2004','David Pollack','Georgia',2004,'Front Seven',array['Front Seven'],96,null,null),
  ('cfb-superteam-quinnen-williams-2018','Quinnen Williams','Alabama',2018,'Front Seven',array['Front Seven'],96,null,null),
  ('cfb-superteam-abdul-carter-2024','Abdul Carter','Penn State',2024,'Front Seven',array['Front Seven'],96,null,null),
  ('cfb-superteam-patrick-willis-2006','Patrick Willis','Ole Miss',2006,'Front Seven',array['Front Seven'],95,null,null),
  ('cfb-superteam-a-j-hawk-2005','A.J. Hawk','Ohio State',2005,'Front Seven',array['Front Seven'],95,null,null),
  ('cfb-superteam-roquan-smith-2017','Roquan Smith','Georgia',2017,'Front Seven',array['Front Seven'],95,null,null),
  ('cfb-superteam-joey-bosa-2014','Joey Bosa','Ohio State',2014,'Front Seven',array['Front Seven'],95,null,null),
  ('cfb-superteam-julius-peppers-2001','Julius Peppers','North Carolina',2001,'Front Seven',array['Front Seven'],95,null,null),
  ('cfb-superteam-josh-allen-2018','Josh Allen','Kentucky',2018,'Front Seven',array['Front Seven'],95,null,null),
  ('cfb-superteam-isaiah-simmons-2019','Isaiah Simmons','Clemson',2019,'Front Seven',array['Front Seven'],95,null,null),
  ('cfb-superteam-j-j-watt-2010','J.J. Watt','Wisconsin',2010,'Front Seven',array['Front Seven'],94,null,null),
  ('cfb-superteam-myles-garrett-2015','Myles Garrett','Texas A&M',2015,'Front Seven',array['Front Seven'],94,null,null),
  ('cfb-superteam-khalil-mack-2013','Khalil Mack','Buffalo',2013,'Front Seven',array['Front Seven'],94,null,null),
  ('cfb-superteam-jonathan-allen-2016','Jonathan Allen','Alabama',2016,'Front Seven',array['Front Seven'],94,null,null),
  ('cfb-superteam-jordan-davis-2021','Jordan Davis','Georgia',2021,'Front Seven',array['Front Seven'],94,null,null),
  ('cfb-superteam-rolando-mcclain-2009','Rolando McClain','Alabama',2009,'Front Seven',array['Front Seven'],94,null,null),
  ('cfb-superteam-devin-white-2018','Devin White','LSU',2018,'Front Seven',array['Front Seven'],93,null,null),
  ('cfb-superteam-nakobe-dean-2021','Nakobe Dean','Georgia',2021,'Front Seven',array['Front Seven'],93,null,null),
  ('cfb-superteam-rey-maualuga-2008','Rey Maualuga','USC',2008,'Front Seven',array['Front Seven'],93,null,null),
  ('cfb-superteam-c-j-mosley-2013','C.J. Mosley','Alabama',2013,'Front Seven',array['Front Seven'],93,null,null),
  ('cfb-superteam-jeremiah-owusu-koramoah-2020','Jeremiah Owusu-Koramoah','Notre Dame',2020,'Front Seven',array['Front Seven'],93,null,null),
  ('cfb-superteam-t-j-watt-2016','T.J. Watt','Wisconsin',2016,'Front Seven',array['Front Seven'],93,null,null),
  ('cfb-superteam-christian-wilkins-2018','Christian Wilkins','Clemson',2018,'Front Seven',array['Front Seven'],93,null,null),
  ('cfb-superteam-brian-orakpo-2008','Brian Orakpo','Texas',2008,'Front Seven',array['Front Seven'],93,null,null),
  ('cfb-superteam-mason-graham-2024','Mason Graham','Michigan',2024,'Front Seven',array['Front Seven'],93,null,null),
  ('cfb-superteam-micah-parsons-2019','Micah Parsons','Penn State',2019,'Front Seven',array['Front Seven'],92,null,null),
  ('cfb-superteam-nick-bosa-2017','Nick Bosa','Ohio State',2017,'Front Seven',array['Front Seven'],92,null,null),
  ('cfb-superteam-jaylon-smith-2015','Jaylon Smith','Notre Dame',2015,'Front Seven',array['Front Seven'],92,null,null),
  ('cfb-superteam-dexter-lawrence-2018','Dexter Lawrence','Clemson',2018,'Front Seven',array['Front Seven'],92,null,null),
  ('cfb-superteam-vita-vea-2017','Vita Vea','Washington',2017,'Front Seven',array['Front Seven'],92,null,null),
  ('cfb-superteam-kayvon-thibodeaux-2021','Kayvon Thibodeaux','Oregon',2021,'Front Seven',array['Front Seven'],92,null,null),
  ('cfb-superteam-dallas-turner-2023','Dallas Turner','Alabama',2023,'Front Seven',array['Front Seven'],92,null,null),
  ('cfb-superteam-james-laurinaitis-2006','James Laurinaitis','Ohio State',2006,'Front Seven',array['Front Seven'],95,null,null),
  ('cfb-superteam-brian-cushing-2008','Brian Cushing','USC',2008,'Front Seven',array['Front Seven'],91,null,null),
  ('cfb-superteam-daron-payne-2017','Daron Payne','Alabama',2017,'Front Seven',array['Front Seven'],91,null,null),
  ('cfb-superteam-montez-sweat-2018','Montez Sweat','Mississippi State',2018,'Front Seven',array['Front Seven'],91,null,null),
  ('cfb-superteam-devin-bush-2018','Devin Bush','Michigan',2018,'Front Seven',array['Front Seven'],91,null,null),
  ('cfb-superteam-gerald-mccoy-2009','Gerald McCoy','Oklahoma',2009,'Front Seven',array['Front Seven'],91,null,null),
  ('cfb-superteam-donta-hightower-2011','Dont''a Hightower','Alabama',2011,'Front Seven',array['Front Seven'],91,null,null),
  ('cfb-superteam-ryan-shazier-2013','Ryan Shazier','Ohio State',2013,'Front Seven',array['Front Seven'],91,null,null),
  ('cfb-superteam-jalon-walker-2024','Jalon Walker','Georgia',2024,'Front Seven',array['Front Seven'],91,null,null),
  ('cfb-superteam-myles-jack-2013','Myles Jack','UCLA',2013,'Front Seven',array['Front Seven'],90,null,null),
  ('cfb-superteam-patrick-queen-2019','Patrick Queen','LSU',2019,'Front Seven',array['Front Seven'],90,null,null),
  ('cfb-superteam-leonard-williams-2014','Leonard Williams','USC',2014,'Front Seven',array['Front Seven'],90,null,null),
  ('cfb-superteam-brian-burns-2018','Brian Burns','Florida State',2018,'Front Seven',array['Front Seven'],89,null,null),
  ('cfb-superteam-travon-walker-2021','Travon Walker','Georgia',2021,'Front Seven',array['Front Seven'],89,null,null),
  ('cfb-superteam-clay-matthews-2008','Clay Matthews','USC',2008,'Front Seven',array['Front Seven'],88,null,null),
  ('cfb-superteam-rashan-gary-2018','Rashan Gary','Michigan',2018,'Front Seven',array['Front Seven'],88,null,null),
  ('cfb-superteam-jacob-rodriguez-2025','Jacob Rodriguez','Texas Tech',2025,'Front Seven',array['Front Seven'],98,null,null),
  ('cfb-superteam-jack-sawyer-2024','Jack Sawyer','Ohio State',2024,'Front Seven',array['Front Seven'],93,null,null),
  ('cfb-superteam-ed-reed-2001','Ed Reed','Miami',2001,'Secondary',array['Secondary'],100,null,null),
  ('cfb-superteam-sean-taylor-2003','Sean Taylor','Miami',2003,'Secondary',array['Secondary'],99,null,null),
  ('cfb-superteam-tyrann-mathieu-2011','Tyrann Mathieu','LSU',2011,'Secondary',array['Secondary'],99,null,null),
  ('cfb-superteam-eric-berry-2008','Eric Berry','Tennessee',2008,'Secondary',array['Secondary'],98,null,null),
  ('cfb-superteam-patrick-peterson-2010','Patrick Peterson','LSU',2010,'Secondary',array['Secondary'],98,null,null),
  ('cfb-superteam-travis-hunter-2024','Travis Hunter','Colorado',2024,'Secondary',array['Secondary'],98,null,null),
  ('cfb-superteam-caleb-downs-2025','Caleb Downs','Ohio State',2025,'Secondary',array['Secondary'],97,null,null),
  ('cfb-superteam-earl-thomas-2009','Earl Thomas','Texas',2009,'Secondary',array['Secondary'],97,null,null),
  ('cfb-superteam-minkah-fitzpatrick-2017','Minkah Fitzpatrick','Alabama',2017,'Secondary',array['Secondary'],97,null,null),
  ('cfb-superteam-derek-stingley-jr-2019','Derek Stingley Jr.','LSU',2019,'Secondary',array['Secondary'],96,null,null),
  ('cfb-superteam-michael-huff-2005','Michael Huff','Texas',2005,'Secondary',array['Secondary'],96,null,null),
  ('cfb-superteam-patrick-surtain-ii-2020','Patrick Surtain II','Alabama',2020,'Secondary',array['Secondary'],96,null,null),
  ('cfb-superteam-sauce-gardner-2021','Sauce Gardner','Cincinnati',2021,'Secondary',array['Secondary'],96,null,null),
  ('cfb-superteam-aaron-ross-2006','Aaron Ross','Texas',2006,'Secondary',array['Secondary'],95,null,null),
  ('cfb-superteam-adoree-jackson-2016','Adoree'' Jackson','USC',2016,'Secondary',array['Secondary'],95,null,null),
  ('cfb-superteam-desmond-king-2015','Desmond King','Iowa',2015,'Secondary',array['Secondary'],95,null,null),
  ('cfb-superteam-malcolm-jenkins-2008','Malcolm Jenkins','Ohio State',2008,'Secondary',array['Secondary'],95,null,null),
  ('cfb-superteam-morris-claiborne-2011','Morris Claiborne','LSU',2011,'Secondary',array['Secondary'],95,null,null),
  ('cfb-superteam-roy-williams-2001','Roy Williams','Oklahoma',2001,'Secondary',array['Secondary'],95,null,null),
  ('cfb-superteam-antrel-rolle-2004','Antrel Rolle','Miami',2004,'Secondary',array['Secondary'],94,null,null),
  ('cfb-superteam-antoine-winfield-jr-2019','Antoine Winfield Jr.','Minnesota',2019,'Secondary',array['Secondary'],94,null,null),
  ('cfb-superteam-eric-weddle-2006','Eric Weddle','Utah',2006,'Secondary',array['Secondary'],94,null,null),
  ('cfb-superteam-jahdae-barron-2024','Jahdae Barron','Texas',2024,'Secondary',array['Secondary'],94,null,null),
  ('cfb-superteam-jalen-ramsey-2014','Jalen Ramsey','Florida State',2014,'Secondary',array['Secondary'],94,null,null),
  ('cfb-superteam-reggie-nelson-2006','Reggie Nelson','Florida',2006,'Secondary',array['Secondary'],94,null,null),
  ('cfb-superteam-will-johnson-2023','Will Johnson','Michigan',2023,'Secondary',array['Secondary'],94,null,null),
  ('cfb-superteam-xavier-watts-2023','Xavier Watts','Notre Dame',2023,'Secondary',array['Secondary'],94,null,null),
  ('cfb-superteam-aqib-talib-2007','Aqib Talib','Kansas',2007,'Secondary',array['Secondary'],93,null,null),
  ('cfb-superteam-budda-baker-2016','Budda Baker','Washington',2016,'Secondary',array['Secondary'],93,null,null),
  ('cfb-superteam-cooper-dejean-2023','Cooper DeJean','Iowa',2023,'Secondary',array['Secondary'],93,null,null),
  ('cfb-superteam-grant-delpit-2019','Grant Delpit','LSU',2019,'Secondary',array['Secondary'],93,null,null),
  ('cfb-superteam-kyle-hamilton-2021','Kyle Hamilton','Notre Dame',2021,'Secondary',array['Secondary'],93,null,null),
  ('cfb-superteam-landon-collins-2014','Landon Collins','Alabama',2014,'Secondary',array['Secondary'],93,null,null),
  ('cfb-superteam-malik-hooker-2016','Malik Hooker','Ohio State',2016,'Secondary',array['Secondary'],93,null,null),
  ('cfb-superteam-mike-sainristil-2023','Mike Sainristil','Michigan',2023,'Secondary',array['Secondary'],93,null,null),
  ('cfb-superteam-quentin-jammer-2001','Quentin Jammer','Texas',2001,'Secondary',array['Secondary'],93,null,null),
  ('cfb-superteam-darrelle-revis-2006','Darrelle Revis','Pittsburgh',2006,'Secondary',array['Secondary'],92,null,null),
  ('cfb-superteam-deangelo-hall-2003','DeAngelo Hall','Virginia Tech',2003,'Secondary',array['Secondary'],92,null,null),
  ('cfb-superteam-derwin-james-2015','Derwin James','Florida State',2015,'Secondary',array['Secondary'],92,null,null),
  ('cfb-superteam-ha-ha-clinton-dix-2012','Ha Ha Clinton-Dix','Alabama',2012,'Secondary',array['Secondary'],92,null,null),
  ('cfb-superteam-jaire-alexander-2016','Jaire Alexander','Louisville',2016,'Secondary',array['Secondary'],92,null,null),
  ('cfb-superteam-jeff-okudah-2019','Jeff Okudah','Ohio State',2019,'Secondary',array['Secondary'],92,null,null),
  ('cfb-superteam-joe-haden-2009','Joe Haden','Florida',2009,'Secondary',array['Secondary'],92,null,null),
  ('cfb-superteam-malaki-starks-2022','Malaki Starks','Georgia',2022,'Secondary',array['Secondary'],92,null,null),
  ('cfb-superteam-prince-amukamara-2010','Prince Amukamara','Nebraska',2010,'Secondary',array['Secondary'],92,null,null),
  ('cfb-superteam-a-j-terrell-2018','A.J. Terrell','Clemson',2018,'Secondary',array['Secondary'],91,null,null),
  ('cfb-superteam-emmanuel-forbes-2022','Emmanuel Forbes','Mississippi State',2022,'Secondary',array['Secondary'],91,null,null),
  ('cfb-superteam-jamal-adams-2016','Jamal Adams','LSU',2016,'Secondary',array['Secondary'],91,null,null),
  ('cfb-superteam-terrion-arnold-2023','Terrion Arnold','Alabama',2023,'Secondary',array['Secondary'],91,null,null),
  ('cfb-superteam-trevon-moehrig-2020','Trevon Moehrig','TCU',2020,'Secondary',array['Secondary'],91,null,null),
  ('cfb-superteam-xavier-mckinney-2019','Xavier McKinney','Alabama',2019,'Secondary',array['Secondary'],91,null,null),
  ('cfb-superteam-deshon-elliott-2017','DeShon Elliott','Texas',2017,'Secondary',array['Secondary'],90,null,null),
  ('cfb-superteam-denzel-ward-2017','Denzel Ward','Ohio State',2017,'Secondary',array['Secondary'],90,null,null),
  ('cfb-superteam-kenny-vaccaro-2012','Kenny Vaccaro','Texas',2012,'Secondary',array['Secondary'],90,null,null),
  ('cfb-superteam-kool-aid-mckinstry-2023','Kool-Aid McKinstry','Alabama',2023,'Secondary',array['Secondary'],90,null,null),
  ('cfb-superteam-trevon-diggs-2019','Trevon Diggs','Alabama',2019,'Secondary',array['Secondary'],90,null,null),
  ('cfb-superteam-marshon-lattimore-2016','Marshon Lattimore','Ohio State',2016,'Secondary',array['Secondary'],89,null,null),
  ('cfb-superteam-stephon-gilmore-2011','Stephon Gilmore','South Carolina',2011,'Secondary',array['Secondary'],89,null,null),
  ('cfb-superteam-taylor-mays-2008','Taylor Mays','USC',2008,'Secondary',array['Secondary'],89,null,null),
  ('cfb-superteam-adam-pacman-jones-2004','Adam "Pacman" Jones','West Virginia',2004,'Secondary',array['Secondary'],88,null,null),
  ('cfb-superteam-curt-cignetti-2025','Curt Cignetti','Indiana',2025,'Head Coach',array['Head Coach'],100,null,null),
  ('cfb-superteam-nick-saban-2020','Nick Saban','Alabama',2020,'Head Coach',array['Head Coach'],100,null,null),
  ('cfb-superteam-dabo-swinney-2018','Dabo Swinney','Clemson',2018,'Head Coach',array['Head Coach'],99,null,null),
  ('cfb-superteam-pete-carroll-2004','Pete Carroll','USC',2004,'Head Coach',array['Head Coach'],99,null,null),
  ('cfb-superteam-mack-brown-2005','Mack Brown','Texas',2005,'Head Coach',array['Head Coach'],98,null,null),
  ('cfb-superteam-kirby-smart-2022','Kirby Smart','Georgia',2022,'Head Coach',array['Head Coach'],98,null,null),
  ('cfb-superteam-bob-stoops-2000','Bob Stoops','Oklahoma',2000,'Head Coach',array['Head Coach'],98,null,null),
  ('cfb-superteam-urban-meyer-2008','Urban Meyer','Florida',2008,'Head Coach',array['Head Coach'],97,null,null),
  ('cfb-superteam-jim-harbaugh-2023','Jim Harbaugh','Michigan',2023,'Head Coach',array['Head Coach'],97,null,null),
  ('cfb-superteam-chris-petersen-2006','Chris Petersen','Boise State',2006,'Head Coach',array['Head Coach'],97,null,null),
  ('cfb-superteam-jimbo-fisher-2013','Jimbo Fisher','Florida State',2013,'Head Coach',array['Head Coach'],96,null,null),
  ('cfb-superteam-gary-patterson-2010','Gary Patterson','TCU',2010,'Head Coach',array['Head Coach'],96,null,null),
  ('cfb-superteam-jim-tressel-2002','Jim Tressel','Ohio State',2002,'Head Coach',array['Head Coach'],96,null,null),
  ('cfb-superteam-ed-orgeron-2019','Ed Orgeron','LSU',2019,'Head Coach',array['Head Coach'],96,null,null),
  ('cfb-superteam-ryan-day-2024','Ryan Day','Ohio State',2024,'Head Coach',array['Head Coach'],96,null,null),
  ('cfb-superteam-kalen-deboer-2023','Kalen DeBoer','Washington',2023,'Head Coach',array['Head Coach'],96,null,null),
  ('cfb-superteam-scott-frost-2017','Scott Frost','UCF',2017,'Head Coach',array['Head Coach'],96,null,null),
  ('cfb-superteam-les-miles-2011','Les Miles','LSU',2011,'Head Coach',array['Head Coach'],95,null,null),
  ('cfb-superteam-mark-dantonio-2013','Mark Dantonio','Michigan State',2013,'Head Coach',array['Head Coach'],95,null,null),
  ('cfb-superteam-sonny-dykes-2022','Sonny Dykes','TCU',2022,'Head Coach',array['Head Coach'],95,null,null),
  ('cfb-superteam-chip-kelly-2010','Chip Kelly','Oregon',2010,'Head Coach',array['Head Coach'],95,null,null),
  ('cfb-superteam-marcus-freeman-2024','Marcus Freeman','Notre Dame',2024,'Head Coach',array['Head Coach'],95,null,null),
  ('cfb-superteam-kyle-whittingham-2008','Kyle Whittingham','Utah',2008,'Head Coach',array['Head Coach'],95,null,null),
  ('cfb-superteam-mike-gundy-2011','Mike Gundy','Oklahoma State',2011,'Head Coach',array['Head Coach'],94,null,null),
  ('cfb-superteam-gus-malzahn-2013','Gus Malzahn','Auburn',2013,'Head Coach',array['Head Coach'],94,null,null),
  ('cfb-superteam-brian-kelly-2012','Brian Kelly','Notre Dame',2012,'Head Coach',array['Head Coach'],94,null,null),
  ('cfb-superteam-dan-lanning-2024','Dan Lanning','Oregon',2024,'Head Coach',array['Head Coach'],94,null,null),
  ('cfb-superteam-steve-sarkisian-2023','Steve Sarkisian','Texas',2023,'Head Coach',array['Head Coach'],94,null,null),
  ('cfb-superteam-lincoln-riley-2017','Lincoln Riley','Oklahoma',2017,'Head Coach',array['Head Coach'],93,null,null),
  ('cfb-superteam-dave-aranda-2021','Dave Aranda','Baylor',2021,'Head Coach',array['Head Coach'],93,null,null),
  ('cfb-superteam-josh-heupel-2022','Josh Heupel','Tennessee',2022,'Head Coach',array['Head Coach'],92,null,null),
  ('cfb-superteam-mark-richt-2002','Mark Richt','Georgia',2002,'Head Coach',array['Head Coach'],92,null,null),
  ('cfb-superteam-mike-leach-2008','Mike Leach','Texas Tech',2008,'Head Coach',array['Head Coach'],91,null,null),
  ('cfb-superteam-lane-kiffin-2023','Lane Kiffin','Ole Miss',2023,'Head Coach',array['Head Coach'],90,null,null),
  ('cfb-superteam-deion-sanders-2024','Deion Sanders','Colorado',2024,'Head Coach',array['Head Coach'],88,null,null)
on conflict(item_reference) do update set
  display_name=excluded.display_name,
  school=excluded.school,
  season_year=excluded.season_year,
  group_key=excluded.group_key,
  eligible_slots=excluded.eligible_slots,
  hidden_grade=excluded.hidden_grade,
  launch_day=null,
  launch_slot=null;

comment on table private.cfb_superteam_v1_authority is
  'Canonical reusable CFB Superteam peak-season pool. launch_day/launch_slot are legacy nullable columns; weekly assignments live in cfb_superteam_week_authority.';

do $cfb_superteam_pool_contract$
declare
  v_total integer;
begin
  select count(*)::integer into v_total from private.cfb_superteam_v1_authority;
  if v_total<>329 then
    raise exception 'CFB Superteam canonical pool must contain 329 candidates, found %',v_total;
  end if;

  if (select count(*) from private.cfb_superteam_v1_authority where group_key='QB')<>50
    or (select count(*) from private.cfb_superteam_v1_authority where group_key='RB')<>50
    or (select count(*) from private.cfb_superteam_v1_authority where group_key='WR')<>50
    or (select count(*) from private.cfb_superteam_v1_authority where group_key='TE')<>24
    or (select count(*) from private.cfb_superteam_v1_authority where group_key='Front Seven')<>60
    or (select count(*) from private.cfb_superteam_v1_authority where group_key='Secondary')<>60
    or (select count(*) from private.cfb_superteam_v1_authority where group_key='Head Coach')<>35
  then
    raise exception 'CFB Superteam canonical positional counts drifted';
  end if;

  if exists(
    select display_name,season_year,group_key
    from private.cfb_superteam_v1_authority
    group by display_name,season_year,group_key
    having count(*)>1
  ) then
    raise exception 'CFB Superteam canonical pool contains duplicate candidate seasons';
  end if;
end;
$cfb_superteam_pool_contract$;

-- Mirror the entire private authority into the generic item catalog. The board still
-- references the shared Weekly Auction catalog while grades remain private.
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
  authority.group_key,
  authority.display_name,
  authority.display_name || ' · ' || authority.school || ' · ' || authority.season_year::text,
  authority.hidden_grade,
  null,
  jsonb_build_object(
    'school',authority.school,
    'season_year',authority.season_year,
    'group_key',authority.group_key,
    'eligible_slots',authority.eligible_slots
  )
from private.cfb_superteam_v1_authority authority
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

create table if not exists private.cfb_superteam_week_authority (
  week_start date not null check(extract(isodow from week_start)=2),
  item_reference text not null references private.cfb_superteam_v1_authority(item_reference) on delete restrict,
  launch_day integer not null check(launch_day between 1 and 7),
  launch_slot integer not null check(launch_slot between 1 and 8),
  target_grade numeric(5,1) not null check(target_grade between 0 and 100),
  primary key(week_start,item_reference),
  unique(week_start,launch_day,launch_slot)
);
revoke all on private.cfb_superteam_week_authority from public,anon,authenticated;

create or replace function private.generate_cfb_superteam_standard_authority(p_week_start date)
returns void
language plpgsql
security definer
set search_path=''
as $$
declare
  v_day integer;
  v_pick integer;
  v_mode integer;
  v_group_shift integer;
  v_target_shift integer;
  v_groups text[];
  v_targets integer[];
  v_group text;
  v_target integer;
  v_item_reference text;
begin
  if extract(isodow from p_week_start)<>2 then
    raise exception 'CFB Superteam week must start Tuesday';
  end if;

  if exists(
    select 1 from private.cfb_superteam_week_authority
    where week_start=p_week_start
  ) then
    if (select count(*) from private.cfb_superteam_week_authority where week_start=p_week_start)<>56 then
      raise exception 'CFB Superteam week authority is partial';
    end if;
    return;
  end if;

  for v_day in 1..7 loop
    v_groups:=case v_day
      when 1 then array['QB','RB','WR','Front Seven','Secondary','Head Coach','TE','RB']
      when 2 then array['QB','RB','WR','Front Seven','Secondary','Head Coach','WR','Front Seven']
      when 3 then array['QB','RB','WR','Front Seven','Secondary','Head Coach','TE','Secondary']
      when 4 then array['QB','RB','WR','Front Seven','Secondary','Head Coach','QB','WR']
      when 5 then array['QB','RB','WR','Front Seven','Secondary','Head Coach','TE','Head Coach']
      when 6 then array['QB','RB','WR','Front Seven','Secondary','Head Coach','RB','Front Seven']
      else array['QB','RB','WR','Front Seven','Secondary','Head Coach','TE','Secondary']
    end;

    v_mode:=1+mod(
      hashtext(p_week_start::text||':standard-mode:'||v_day::text)::bigint+2147483648,
      3
    )::integer;
    v_group_shift:=mod(
      hashtext(p_week_start::text||':group-shift:'||v_day::text)::bigint+2147483648,
      8
    )::integer;
    v_target_shift:=mod(
      hashtext(p_week_start::text||':target-shift:'||v_day::text)::bigint+2147483648,
      8
    )::integer;

    v_targets:=case v_mode
      when 1 then array[97,95,94,92,91,90,89,88]
      when 2 then array[100,96,94,93,91,90,89,88]
      else array[98,95,93,92,91,90,89,88]
    end;

    for v_pick in 1..8 loop
      v_group:=v_groups[1+mod(v_pick-1+v_group_shift,8)];
      v_target:=v_targets[1+mod(v_pick-1+v_target_shift,8)];
      v_item_reference:=null;

      select candidate.item_reference
      into v_item_reference
      from private.cfb_superteam_v1_authority candidate
      where candidate.group_key=v_group
        and not exists(
          select 1 from private.cfb_superteam_week_authority used
          where used.week_start=p_week_start
            and used.item_reference=candidate.item_reference
        )
        and not exists(
          select 1
          from private.cfb_superteam_week_authority used
          join private.cfb_superteam_v1_authority prior
            on prior.item_reference=used.item_reference
          where used.week_start=p_week_start
            and prior.display_name=candidate.display_name
        )
        and not exists(
          select 1
          from private.cfb_superteam_week_authority used
          join private.cfb_superteam_v1_authority prior
            on prior.item_reference=used.item_reference
          where used.week_start=p_week_start
            and used.launch_day=v_day
            and prior.school=candidate.school
        )
      order by
        abs(candidate.hidden_grade-v_target),
        md5(p_week_start::text||':'||v_day::text||':'||v_pick::text||':'||candidate.item_reference)
      limit 1;

      -- Defensive fallback: preserve candidate uniqueness and Standard grade targeting
      -- even if a future pool edit makes eight distinct schools impossible on a day.
      if v_item_reference is null then
        select candidate.item_reference
        into v_item_reference
        from private.cfb_superteam_v1_authority candidate
        where candidate.group_key=v_group
          and not exists(
            select 1 from private.cfb_superteam_week_authority used
            where used.week_start=p_week_start
              and used.item_reference=candidate.item_reference
          )
          and not exists(
            select 1
            from private.cfb_superteam_week_authority used
            join private.cfb_superteam_v1_authority prior
              on prior.item_reference=used.item_reference
            where used.week_start=p_week_start
              and prior.display_name=candidate.display_name
          )
        order by
          abs(candidate.hidden_grade-v_target),
          md5(p_week_start::text||':'||v_day::text||':'||v_pick::text||':'||candidate.item_reference)
        limit 1;
      end if;

      if v_item_reference is null then
        raise exception 'CFB Superteam Standard generator exhausted % on day %',v_group,v_day;
      end if;

      insert into private.cfb_superteam_week_authority(
        week_start,item_reference,launch_day,launch_slot,target_grade
      ) values (
        p_week_start,v_item_reference,v_day,v_pick,v_target
      );
    end loop;
  end loop;

  if (select count(*) from private.cfb_superteam_week_authority where week_start=p_week_start)<>56 then
    raise exception 'CFB Superteam Standard generator did not create 56 candidates';
  end if;

  if (
    select count(distinct authority.display_name)
    from private.cfb_superteam_week_authority weekly
    join private.cfb_superteam_v1_authority authority
      on authority.item_reference=weekly.item_reference
    where weekly.week_start=p_week_start
  )<>56 then
    raise exception 'CFB Superteam Standard generator repeated a person within the week';
  end if;

  if exists(
    select weekly.launch_day
    from private.cfb_superteam_week_authority weekly
    join private.cfb_superteam_v1_authority authority
      on authority.item_reference=weekly.item_reference
    where weekly.week_start=p_week_start
    group by weekly.launch_day
    having count(*)<>8
      or max(authority.hidden_grade)-min(authority.hidden_grade)<7
      or max(authority.hidden_grade)<95
      or min(authority.hidden_grade)>92
      or count(*) filter(where authority.hidden_grade>=96)>3
  ) then
    raise exception 'CFB Superteam Standard generator produced a compressed or unbalanced day';
  end if;

  if exists(
    select weekly.launch_day
    from private.cfb_superteam_week_authority weekly
    join private.cfb_superteam_v1_authority authority
      on authority.item_reference=weekly.item_reference
    where weekly.week_start=p_week_start
    group by weekly.launch_day
    having count(distinct authority.school)<>8
  ) then
    raise exception 'CFB Superteam Standard generator repeated a school on a daily board';
  end if;

  if (select count(*) from private.cfb_superteam_week_authority weekly
      join private.cfb_superteam_v1_authority authority on authority.item_reference=weekly.item_reference
      where weekly.week_start=p_week_start and authority.group_key='QB')<>8
    or (select count(*) from private.cfb_superteam_week_authority weekly
      join private.cfb_superteam_v1_authority authority on authority.item_reference=weekly.item_reference
      where weekly.week_start=p_week_start and authority.group_key='RB')<>9
    or (select count(*) from private.cfb_superteam_week_authority weekly
      join private.cfb_superteam_v1_authority authority on authority.item_reference=weekly.item_reference
      where weekly.week_start=p_week_start and authority.group_key='WR')<>9
    or (select count(*) from private.cfb_superteam_week_authority weekly
      join private.cfb_superteam_v1_authority authority on authority.item_reference=weekly.item_reference
      where weekly.week_start=p_week_start and authority.group_key='TE')<>4
    or (select count(*) from private.cfb_superteam_week_authority weekly
      join private.cfb_superteam_v1_authority authority on authority.item_reference=weekly.item_reference
      where weekly.week_start=p_week_start and authority.group_key='Front Seven')<>9
    or (select count(*) from private.cfb_superteam_week_authority weekly
      join private.cfb_superteam_v1_authority authority on authority.item_reference=weekly.item_reference
      where weekly.week_start=p_week_start and authority.group_key='Secondary')<>9
    or (select count(*) from private.cfb_superteam_week_authority weekly
      join private.cfb_superteam_v1_authority authority on authority.item_reference=weekly.item_reference
      where weekly.week_start=p_week_start and authority.group_key='Head Coach')<>8
  then
    raise exception 'CFB Superteam Standard generator positional mix drifted';
  end if;
end;
$$;
revoke all on function private.generate_cfb_superteam_standard_authority(date)
  from public,anon,authenticated;

create or replace function private.materialize_football_weekly_superteam_week(p_week_start date)
returns void
language plpgsql
security definer
set search_path=''
as $$
declare v_existing integer;
begin
  if extract(isodow from p_week_start)<>2 then
    raise exception 'Football Weekly Auction week must start Tuesday';
  end if;

  insert into private.football_weekly_auction_weeks(week_start,subject_key)
  values(p_week_start,'cfb-superteam')
  on conflict(week_start) do nothing;

  if (select subject_key from private.football_weekly_auction_weeks where week_start=p_week_start)<>'cfb-superteam' then
    raise exception 'CFB Superteam materializer requires a CFB Superteam week';
  end if;

  select count(*) into v_existing
  from private.football_weekly_auction_board
  where week_start=p_week_start;

  if v_existing=56 then return; end if;
  if v_existing<>0 then raise exception 'CFB Superteam week already has a partial board'; end if;

  perform private.generate_cfb_superteam_standard_authority(p_week_start);

  insert into private.football_weekly_auction_board(
    week_start,day_index,theme,hidden_shape,slot,season_reference,lock_at,trait
  )
  select
    p_week_start,
    authority.launch_day,
    'CFB Superteam',
    'Standard',
    authority.launch_slot,
    authority.item_reference,
    ((p_week_start+authority.launch_day)::timestamp at time zone 'America/Chicago'),
    null
  from private.cfb_superteam_week_authority authority
  where authority.week_start=p_week_start
  order by authority.launch_day,authority.launch_slot;

  if (select count(*) from private.football_weekly_auction_board where week_start=p_week_start)<>56 then
    raise exception 'CFB Superteam board did not materialize 56 candidates';
  end if;
end;
$$;
revoke all on function private.materialize_football_weekly_superteam_week(date)
  from public,anon,authenticated;

create or replace function private.validate_football_weekly_auction_board_authority()
returns trigger
language plpgsql
set search_path=''
as $$
declare v_subject text;
begin
  select subject_key into v_subject
  from private.football_weekly_auction_weeks
  where week_start=new.week_start;

  if v_subject='cfb-superteam' then
    if new.trait is not null
      or new.theme<>'CFB Superteam'
      or new.hidden_shape<>'Standard'
      or not exists(
        select 1 from private.cfb_superteam_week_authority authority
        where authority.week_start=new.week_start
          and authority.item_reference=new.season_reference
          and authority.launch_day=new.day_index
          and authority.launch_slot=new.slot
      )
    then
      raise exception 'CFB Superteam board row is outside the generated Standard authority';
    end if;
  elsif v_subject='nfl-build-qb' then
    if new.trait not in ('Arm','Accuracy','Processing','Mobility')
      or new.theme<>'NFL'
      or new.slot<>(case new.trait when 'Arm' then 1 when 'Accuracy' then 2 when 'Processing' then 3 else 4 end)
      or not exists(
        select 1 from private.nfl_build_qb_v2_authority qb
        where qb.item_reference=new.season_reference
      )
    then
      raise exception 'NFL Build a QB Weekly board row is outside the v2 authority';
    end if;
  else
    if new.trait is not null then
      raise exception 'CFB Weekly board rows cannot carry an NFL QB trait';
    end if;
    if new.week_start>=date '2026-09-22' then
      if not exists(
        select 1 from private.cfb_best_teams_v2_authority
        where season_reference=new.season_reference
      ) then
        raise exception 'Weekly Auction v2 board reference is outside the v2 authority';
      end if;
    elsif not exists(
      select 1 from private.draft_room_cfb_best_teams_pool
      where season_reference=new.season_reference
    ) then
      raise exception 'Weekly Auction legacy board reference is outside the legacy authority';
    end if;
  end if;
  return new;
end;
$$;
revoke all on function private.validate_football_weekly_auction_board_authority()
  from public,anon,authenticated;

-- The Sep. 29 week was preview-materialized before this correction. It is still future
-- and cannot have legitimate entries/bids/awards yet. Refuse to rewrite it if that assumption
-- ever stops being true; otherwise replace only its generated content.
do $reroll_sep29_superteam$
begin
  if exists(select 1 from private.football_weekly_auction_daily_entries where week_start=date '2026-09-29')
    or exists(select 1 from private.football_weekly_auction_bids where week_start=date '2026-09-29')
    or exists(select 1 from private.football_weekly_auction_awards where week_start=date '2026-09-29')
  then
    raise exception 'Sep. 29 CFB Superteam cannot be regenerated after member activity exists';
  end if;

  delete from private.football_weekly_auction_board
  where week_start=date '2026-09-29';

  delete from private.cfb_superteam_week_authority
  where week_start=date '2026-09-29';

  perform private.materialize_football_weekly_superteam_week(date '2026-09-29');
end;
$reroll_sep29_superteam$;

do $cfb_superteam_standard_launch_contract$
declare
  v_count integer;
begin
  select count(*)::integer into v_count
  from private.football_weekly_auction_board
  where week_start=date '2026-09-29';

  if v_count<>56 then
    raise exception 'Sep. 29 CFB Superteam Standard board must contain 56 candidates';
  end if;

  if exists(
    select board.day_index
    from private.football_weekly_auction_board board
    join private.cfb_superteam_v1_authority authority
      on authority.item_reference=board.season_reference
    where board.week_start=date '2026-09-29'
    group by board.day_index
    having count(*)<>8
      or max(authority.hidden_grade)-min(authority.hidden_grade)<7
      or max(authority.hidden_grade)<95
      or min(authority.hidden_grade)>92
      or count(*) filter(where authority.hidden_grade>=96)>3
  ) then
    raise exception 'Sep. 29 CFB Superteam is not a true Standard board';
  end if;
end;
$cfb_superteam_standard_launch_contract$;
