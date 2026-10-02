-- Best NFL Team-Seasons Since 2000 Weekly Auction runtime.
-- Days 1-6 reuse the shared Weekly Auction bid/award lifecycle. Day 7 is the
-- authoritative literal-ticket Wildcard/Reaping engine from 202612310224.
-- Hidden reserve authority is prebuilt server-side; only a day's exposed prefix
-- is copied to the shared board and exposed rows are never rerolled.

create table if not exists private.nfl_best_team_seasons_v1_authority (
  item_reference text primary key,
  season_year integer not null check (season_year between 2000 and 2025),
  franchise_id text not null,
  team_name text not null,
  display_label text not null,
  division text not null,
  record text not null,
  postseason_finish text not null,
  card_tag text not null,
  hidden_grade numeric(4,1) not null check (
    hidden_grade between 74.0 and 100.0
    and hidden_grade * 2 = trunc(hidden_grade * 2)
  )
);
revoke all on private.nfl_best_team_seasons_v1_authority from public,anon,authenticated;

insert into private.nfl_best_team_seasons_v1_authority(
  item_reference,season_year,franchise_id,team_name,display_label,division,
  record,postseason_finish,card_tag,hidden_grade
) values
  ('nfl-best-bal-2000',2000,'BAL','Baltimore Ravens','Baltimore Ravens · 2000','AFC North','12-4','Super Bowl Champion','12-4 · Super Bowl Champion',98.0),
  ('nfl-best-lar-2000',2000,'LAR','St. Louis Rams','St. Louis Rams · 2000','NFC West','10-6','Playoff Team','10-6 · Playoff Team',82.0),
  ('nfl-best-lv-2000',2000,'LV','Oakland Raiders','Oakland Raiders · 2000','AFC West','12-4','Conference Championship Game','12-4 · Conference Championship Game',91.5),
  ('nfl-best-min-2000',2000,'MIN','Minnesota Vikings','Minnesota Vikings · 2000','NFC North','11-5','Conference Championship Game','11-5 · Conference Championship Game',83.5),
  ('nfl-best-nyg-2000',2000,'NYG','New York Giants','New York Giants · 2000','NFC East','12-4','Super Bowl Runner-Up','12-4 · Super Bowl Runner-Up',90.5),
  ('nfl-best-ten-2000',2000,'TEN','Tennessee Titans','Tennessee Titans · 2000','AFC South','13-3','Playoff Team','13-3 · Playoff Team',90.5),
  ('nfl-best-chi-2001',2001,'CHI','Chicago Bears','Chicago Bears · 2001','NFC North','13-3','Playoff Team','13-3 · Playoff Team',90.0),
  ('nfl-best-lar-2001',2001,'LAR','St. Louis Rams','St. Louis Rams · 2001','NFC West','14-2','Super Bowl Runner-Up','14-2 · Super Bowl Runner-Up',97.0),
  ('nfl-best-lv-2001',2001,'LV','Oakland Raiders','Oakland Raiders · 2001','AFC West','10-6','Won Playoff Game','10-6 · Won Playoff Game',83.0),
  ('nfl-best-ne-2001',2001,'NE','New England Patriots','New England Patriots · 2001','AFC East','11-5','Super Bowl Champion','11-5 · Super Bowl Champion',91.5),
  ('nfl-best-phi-2001',2001,'PHI','Philadelphia Eagles','Philadelphia Eagles · 2001','NFC East','11-5','Conference Championship Game','11-5 · Conference Championship Game',88.5),
  ('nfl-best-pit-2001',2001,'PIT','Pittsburgh Steelers','Pittsburgh Steelers · 2001','AFC North','13-3','Conference Championship Game','13-3 · Conference Championship Game',92.0),
  ('nfl-best-atl-2002',2002,'ATL','Atlanta Falcons','Atlanta Falcons · 2002','NFC South','9-6-1','Won Playoff Game','9-6-1 · Won Playoff Game',82.5),
  ('nfl-best-lv-2002',2002,'LV','Oakland Raiders','Oakland Raiders · 2002','AFC West','11-5','Super Bowl Runner-Up','11-5 · Super Bowl Runner-Up',90.0),
  ('nfl-best-phi-2002',2002,'PHI','Philadelphia Eagles','Philadelphia Eagles · 2002','NFC East','12-4','Conference Championship Game','12-4 · Conference Championship Game',91.0),
  ('nfl-best-sf-2002',2002,'SF','San Francisco 49ers','San Francisco 49ers · 2002','NFC West','10-6','Won Playoff Game','10-6 · Won Playoff Game',80.5),
  ('nfl-best-tb-2002',2002,'TB','Tampa Bay Buccaneers','Tampa Bay Buccaneers · 2002','NFC South','12-4','Super Bowl Champion','12-4 · Super Bowl Champion',97.5),
  ('nfl-best-ten-2002',2002,'TEN','Tennessee Titans','Tennessee Titans · 2002','AFC South','11-5','Conference Championship Game','11-5 · Conference Championship Game',84.5),
  ('nfl-best-car-2003',2003,'CAR','Carolina Panthers','Carolina Panthers · 2003','NFC South','11-5','Super Bowl Runner-Up','11-5 · Super Bowl Runner-Up',86.5),
  ('nfl-best-gb-2003',2003,'GB','Green Bay Packers','Green Bay Packers · 2003','NFC North','10-6','Won Playoff Game','10-6 · Won Playoff Game',85.0),
  ('nfl-best-ind-2003',2003,'IND','Indianapolis Colts','Indianapolis Colts · 2003','AFC South','12-4','Conference Championship Game','12-4 · Conference Championship Game',90.0),
  ('nfl-best-kc-2003',2003,'KC','Kansas City Chiefs','Kansas City Chiefs · 2003','AFC West','13-3','Playoff Team','13-3 · Playoff Team',90.5),
  ('nfl-best-ne-2003',2003,'NE','New England Patriots','New England Patriots · 2003','AFC East','14-2','Super Bowl Champion','14-2 · Super Bowl Champion',97.0),
  ('nfl-best-phi-2003',2003,'PHI','Philadelphia Eagles','Philadelphia Eagles · 2003','NFC East','12-4','Conference Championship Game','12-4 · Conference Championship Game',88.0),
  ('nfl-best-atl-2004',2004,'ATL','Atlanta Falcons','Atlanta Falcons · 2004','NFC South','11-5','Conference Championship Game','11-5 · Conference Championship Game',84.0),
  ('nfl-best-ind-2004',2004,'IND','Indianapolis Colts','Indianapolis Colts · 2004','AFC South','12-4','Won Playoff Game','12-4 · Won Playoff Game',90.0),
  ('nfl-best-lac-2004',2004,'LAC','San Diego Chargers','San Diego Chargers · 2004','AFC West','12-4','Playoff Team','12-4 · Playoff Team',88.0),
  ('nfl-best-ne-2004',2004,'NE','New England Patriots','New England Patriots · 2004','AFC East','14-2','Super Bowl Champion','14-2 · Super Bowl Champion',99.5),
  ('nfl-best-phi-2004',2004,'PHI','Philadelphia Eagles','Philadelphia Eagles · 2004','NFC East','13-3','Super Bowl Runner-Up','13-3 · Super Bowl Runner-Up',94.0),
  ('nfl-best-pit-2004',2004,'PIT','Pittsburgh Steelers','Pittsburgh Steelers · 2004','AFC North','15-1','Conference Championship Game','15-1 · Conference Championship Game',94.0),
  ('nfl-best-car-2005',2005,'CAR','Carolina Panthers','Carolina Panthers · 2005','NFC South','11-5','Conference Championship Game','11-5 · Conference Championship Game',88.0),
  ('nfl-best-den-2005',2005,'DEN','Denver Broncos','Denver Broncos · 2005','AFC West','13-3','Conference Championship Game','13-3 · Conference Championship Game',91.5),
  ('nfl-best-ind-2005',2005,'IND','Indianapolis Colts','Indianapolis Colts · 2005','AFC South','14-2','Playoff Team','14-2 · Playoff Team',93.5),
  ('nfl-best-jax-2005',2005,'JAX','Jacksonville Jaguars','Jacksonville Jaguars · 2005','AFC South','12-4','Playoff Team','12-4 · Playoff Team',86.0),
  ('nfl-best-nyg-2005',2005,'NYG','New York Giants','New York Giants · 2005','NFC East','11-5','Playoff Team','11-5 · Playoff Team',84.5),
  ('nfl-best-pit-2005',2005,'PIT','Pittsburgh Steelers','Pittsburgh Steelers · 2005','AFC North','11-5','Super Bowl Champion','11-5 · Super Bowl Champion',93.5),
  ('nfl-best-sea-2005',2005,'SEA','Seattle Seahawks','Seattle Seahawks · 2005','NFC West','13-3','Super Bowl Runner-Up','13-3 · Super Bowl Runner-Up',95.0),
  ('nfl-best-bal-2006',2006,'BAL','Baltimore Ravens','Baltimore Ravens · 2006','AFC North','13-3','Playoff Team','13-3 · Playoff Team',90.5),
  ('nfl-best-chi-2006',2006,'CHI','Chicago Bears','Chicago Bears · 2006','NFC North','13-3','Super Bowl Runner-Up','13-3 · Super Bowl Runner-Up',95.0),
  ('nfl-best-ind-2006',2006,'IND','Indianapolis Colts','Indianapolis Colts · 2006','AFC South','12-4','Super Bowl Champion','12-4 · Super Bowl Champion',93.5),
  ('nfl-best-lac-2006',2006,'LAC','San Diego Chargers','San Diego Chargers · 2006','AFC West','14-2','Playoff Team','14-2 · Playoff Team',93.5),
  ('nfl-best-ne-2006',2006,'NE','New England Patriots','New England Patriots · 2006','AFC East','12-4','Conference Championship Game','12-4 · Conference Championship Game',91.0),
  ('nfl-best-no-2006',2006,'NO','New Orleans Saints','New Orleans Saints · 2006','NFC South','10-6','Conference Championship Game','10-6 · Conference Championship Game',83.5),
  ('nfl-best-phi-2006',2006,'PHI','Philadelphia Eagles','Philadelphia Eagles · 2006','NFC East','10-6','Won Playoff Game','10-6 · Won Playoff Game',82.5),
  ('nfl-best-dal-2007',2007,'DAL','Dallas Cowboys','Dallas Cowboys · 2007','NFC East','13-3','Playoff Team','13-3 · Playoff Team',90.0),
  ('nfl-best-gb-2007',2007,'GB','Green Bay Packers','Green Bay Packers · 2007','NFC North','13-3','Conference Championship Game','13-3 · Conference Championship Game',92.5),
  ('nfl-best-ind-2007',2007,'IND','Indianapolis Colts','Indianapolis Colts · 2007','AFC South','13-3','Playoff Team','13-3 · Playoff Team',92.0),
  ('nfl-best-jax-2007',2007,'JAX','Jacksonville Jaguars','Jacksonville Jaguars · 2007','AFC South','11-5','Won Playoff Game','11-5 · Won Playoff Game',85.5),
  ('nfl-best-lac-2007',2007,'LAC','San Diego Chargers','San Diego Chargers · 2007','AFC West','11-5','Conference Championship Game','11-5 · Conference Championship Game',87.5),
  ('nfl-best-ne-2007',2007,'NE','New England Patriots','New England Patriots · 2007','AFC East','16-0','Super Bowl Runner-Up','16-0 · Super Bowl Runner-Up',100.0),
  ('nfl-best-nyg-2007',2007,'NYG','New York Giants','New York Giants · 2007','NFC East','10-6','Super Bowl Champion','10-6 · Super Bowl Champion',88.5),
  ('nfl-best-ari-2008',2008,'ARI','Arizona Cardinals','Arizona Cardinals · 2008','NFC West','9-7','Super Bowl Runner-Up','9-7 · Super Bowl Runner-Up',84.5),
  ('nfl-best-bal-2008',2008,'BAL','Baltimore Ravens','Baltimore Ravens · 2008','AFC North','11-5','Conference Championship Game','11-5 · Conference Championship Game',88.5),
  ('nfl-best-ne-2008',2008,'NE','New England Patriots','New England Patriots · 2008','AFC East','11-5','Missed Playoffs','11-5 · Missed Playoffs',85.0),
  ('nfl-best-nyg-2008',2008,'NYG','New York Giants','New York Giants · 2008','NFC East','12-4','Playoff Team','12-4 · Playoff Team',88.0),
  ('nfl-best-phi-2008',2008,'PHI','Philadelphia Eagles','Philadelphia Eagles · 2008','NFC East','9-6-1','Conference Championship Game','9-6-1 · Conference Championship Game',85.0),
  ('nfl-best-pit-2008',2008,'PIT','Pittsburgh Steelers','Pittsburgh Steelers · 2008','AFC North','12-4','Super Bowl Champion','12-4 · Super Bowl Champion',95.5),
  ('nfl-best-ten-2008',2008,'TEN','Tennessee Titans','Tennessee Titans · 2008','AFC South','13-3','Playoff Team','13-3 · Playoff Team',90.5),
  ('nfl-best-dal-2009',2009,'DAL','Dallas Cowboys','Dallas Cowboys · 2009','NFC East','11-5','Won Playoff Game','11-5 · Won Playoff Game',85.5),
  ('nfl-best-gb-2009',2009,'GB','Green Bay Packers','Green Bay Packers · 2009','NFC North','11-5','Playoff Team','11-5 · Playoff Team',87.0),
  ('nfl-best-ind-2009',2009,'IND','Indianapolis Colts','Indianapolis Colts · 2009','AFC South','14-2','Super Bowl Runner-Up','14-2 · Super Bowl Runner-Up',95.0),
  ('nfl-best-lac-2009',2009,'LAC','San Diego Chargers','San Diego Chargers · 2009','AFC West','13-3','Playoff Team','13-3 · Playoff Team',90.0),
  ('nfl-best-min-2009',2009,'MIN','Minnesota Vikings','Minnesota Vikings · 2009','NFC North','12-4','Conference Championship Game','12-4 · Conference Championship Game',91.5),
  ('nfl-best-no-2009',2009,'NO','New Orleans Saints','New Orleans Saints · 2009','NFC South','13-3','Super Bowl Champion','13-3 · Super Bowl Champion',97.5),
  ('nfl-best-nyj-2009',2009,'NYJ','New York Jets','New York Jets · 2009','AFC East','9-7','Conference Championship Game','9-7 · Conference Championship Game',83.0),
  ('nfl-best-atl-2010',2010,'ATL','Atlanta Falcons','Atlanta Falcons · 2010','NFC South','13-3','Playoff Team','13-3 · Playoff Team',89.0),
  ('nfl-best-bal-2010',2010,'BAL','Baltimore Ravens','Baltimore Ravens · 2010','AFC North','12-4','Won Playoff Game','12-4 · Won Playoff Game',87.5),
  ('nfl-best-chi-2010',2010,'CHI','Chicago Bears','Chicago Bears · 2010','NFC North','11-5','Conference Championship Game','11-5 · Conference Championship Game',85.0),
  ('nfl-best-gb-2010',2010,'GB','Green Bay Packers','Green Bay Packers · 2010','NFC North','10-6','Super Bowl Champion','10-6 · Super Bowl Champion',94.5),
  ('nfl-best-ne-2010',2010,'NE','New England Patriots','New England Patriots · 2010','AFC East','14-2','Playoff Team','14-2 · Playoff Team',93.5),
  ('nfl-best-nyj-2010',2010,'NYJ','New York Jets','New York Jets · 2010','AFC East','11-5','Conference Championship Game','11-5 · Conference Championship Game',85.5),
  ('nfl-best-pit-2010',2010,'PIT','Pittsburgh Steelers','Pittsburgh Steelers · 2010','AFC North','12-4','Super Bowl Runner-Up','12-4 · Super Bowl Runner-Up',91.5),
  ('nfl-best-sea-2010',2010,'SEA','Seattle Seahawks','Seattle Seahawks · 2010','NFC West','7-9','Won Playoff Game','7-9 · Won Playoff Game',74.0),
  ('nfl-best-bal-2011',2011,'BAL','Baltimore Ravens','Baltimore Ravens · 2011','AFC North','12-4','Conference Championship Game','12-4 · Conference Championship Game',89.0),
  ('nfl-best-den-2011',2011,'DEN','Denver Broncos','Denver Broncos · 2011','AFC West','8-8','Won Playoff Game','8-8 · Won Playoff Game',74.0),
  ('nfl-best-gb-2011',2011,'GB','Green Bay Packers','Green Bay Packers · 2011','NFC North','15-1','Playoff Team','15-1 · Playoff Team',94.5),
  ('nfl-best-ne-2011',2011,'NE','New England Patriots','New England Patriots · 2011','AFC East','13-3','Super Bowl Runner-Up','13-3 · Super Bowl Runner-Up',95.0),
  ('nfl-best-no-2011',2011,'NO','New Orleans Saints','New Orleans Saints · 2011','NFC South','13-3','Won Playoff Game','13-3 · Won Playoff Game',92.5),
  ('nfl-best-nyg-2011',2011,'NYG','New York Giants','New York Giants · 2011','NFC East','9-7','Super Bowl Champion','9-7 · Super Bowl Champion',86.0),
  ('nfl-best-pit-2011',2011,'PIT','Pittsburgh Steelers','Pittsburgh Steelers · 2011','AFC North','12-4','Playoff Team','12-4 · Playoff Team',87.0),
  ('nfl-best-sf-2011',2011,'SF','San Francisco 49ers','San Francisco 49ers · 2011','NFC West','13-3','Conference Championship Game','13-3 · Conference Championship Game',92.5),
  ('nfl-best-atl-2012',2012,'ATL','Atlanta Falcons','Atlanta Falcons · 2012','NFC South','13-3','Conference Championship Game','13-3 · Conference Championship Game',91.0),
  ('nfl-best-bal-2012',2012,'BAL','Baltimore Ravens','Baltimore Ravens · 2012','AFC North','10-6','Super Bowl Champion','10-6 · Super Bowl Champion',89.5),
  ('nfl-best-den-2012',2012,'DEN','Denver Broncos','Denver Broncos · 2012','AFC West','13-3','Playoff Team','13-3 · Playoff Team',92.0),
  ('nfl-best-hou-2012',2012,'HOU','Houston Texans','Houston Texans · 2012','AFC South','12-4','Won Playoff Game','12-4 · Won Playoff Game',87.0),
  ('nfl-best-ne-2012',2012,'NE','New England Patriots','New England Patriots · 2012','AFC East','12-4','Conference Championship Game','12-4 · Conference Championship Game',91.5),
  ('nfl-best-sea-2012',2012,'SEA','Seattle Seahawks','Seattle Seahawks · 2012','NFC West','11-5','Won Playoff Game','11-5 · Won Playoff Game',88.0),
  ('nfl-best-sf-2012',2012,'SF','San Francisco 49ers','San Francisco 49ers · 2012','NFC West','11-4-1','Super Bowl Runner-Up','11-4-1 · Super Bowl Runner-Up',90.5),
  ('nfl-best-was-2012',2012,'WAS','Washington Redskins','Washington Redskins · 2012','NFC East','10-6','Playoff Team','10-6 · Playoff Team',81.0),
  ('nfl-best-car-2013',2013,'CAR','Carolina Panthers','Carolina Panthers · 2013','NFC South','12-4','Playoff Team','12-4 · Playoff Team',87.5),
  ('nfl-best-cin-2013',2013,'CIN','Cincinnati Bengals','Cincinnati Bengals · 2013','AFC North','11-5','Playoff Team','11-5 · Playoff Team',85.5),
  ('nfl-best-den-2013',2013,'DEN','Denver Broncos','Denver Broncos · 2013','AFC West','13-3','Super Bowl Runner-Up','13-3 · Super Bowl Runner-Up',95.0),
  ('nfl-best-kc-2013',2013,'KC','Kansas City Chiefs','Kansas City Chiefs · 2013','AFC West','11-5','Playoff Team','11-5 · Playoff Team',86.0),
  ('nfl-best-ne-2013',2013,'NE','New England Patriots','New England Patriots · 2013','AFC East','12-4','Conference Championship Game','12-4 · Conference Championship Game',89.0),
  ('nfl-best-no-2013',2013,'NO','New Orleans Saints','New Orleans Saints · 2013','NFC South','11-5','Won Playoff Game','11-5 · Won Playoff Game',86.0),
  ('nfl-best-sea-2013',2013,'SEA','Seattle Seahawks','Seattle Seahawks · 2013','NFC West','13-3','Super Bowl Champion','13-3 · Super Bowl Champion',99.0),
  ('nfl-best-sf-2013',2013,'SF','San Francisco 49ers','San Francisco 49ers · 2013','NFC West','12-4','Conference Championship Game','12-4 · Conference Championship Game',90.0),
  ('nfl-best-bal-2014',2014,'BAL','Baltimore Ravens','Baltimore Ravens · 2014','AFC North','10-6','Won Playoff Game','10-6 · Won Playoff Game',84.0),
  ('nfl-best-dal-2014',2014,'DAL','Dallas Cowboys','Dallas Cowboys · 2014','NFC East','12-4','Won Playoff Game','12-4 · Won Playoff Game',88.0),
  ('nfl-best-den-2014',2014,'DEN','Denver Broncos','Denver Broncos · 2014','AFC West','12-4','Playoff Team','12-4 · Playoff Team',87.5),
  ('nfl-best-gb-2014',2014,'GB','Green Bay Packers','Green Bay Packers · 2014','NFC North','12-4','Conference Championship Game','12-4 · Conference Championship Game',90.0),
  ('nfl-best-ind-2014',2014,'IND','Indianapolis Colts','Indianapolis Colts · 2014','AFC South','11-5','Conference Championship Game','11-5 · Conference Championship Game',86.0),
  ('nfl-best-ne-2014',2014,'NE','New England Patriots','New England Patriots · 2014','AFC East','12-4','Super Bowl Champion','12-4 · Super Bowl Champion',96.0),
  ('nfl-best-pit-2014',2014,'PIT','Pittsburgh Steelers','Pittsburgh Steelers · 2014','AFC North','11-5','Playoff Team','11-5 · Playoff Team',83.5),
  ('nfl-best-sea-2014',2014,'SEA','Seattle Seahawks','Seattle Seahawks · 2014','NFC West','12-4','Super Bowl Runner-Up','12-4 · Super Bowl Runner-Up',92.0),
  ('nfl-best-ari-2015',2015,'ARI','Arizona Cardinals','Arizona Cardinals · 2015','NFC West','13-3','Conference Championship Game','13-3 · Conference Championship Game',92.0),
  ('nfl-best-car-2015',2015,'CAR','Carolina Panthers','Carolina Panthers · 2015','NFC South','15-1','Super Bowl Runner-Up','15-1 · Super Bowl Runner-Up',97.0),
  ('nfl-best-cin-2015',2015,'CIN','Cincinnati Bengals','Cincinnati Bengals · 2015','AFC North','12-4','Playoff Team','12-4 · Playoff Team',88.5),
  ('nfl-best-den-2015',2015,'DEN','Denver Broncos','Denver Broncos · 2015','AFC West','12-4','Super Bowl Champion','12-4 · Super Bowl Champion',94.0),
  ('nfl-best-kc-2015',2015,'KC','Kansas City Chiefs','Kansas City Chiefs · 2015','AFC West','11-5','Won Playoff Game','11-5 · Won Playoff Game',87.0),
  ('nfl-best-min-2015',2015,'MIN','Minnesota Vikings','Minnesota Vikings · 2015','NFC North','11-5','Playoff Team','11-5 · Playoff Team',84.0),
  ('nfl-best-ne-2015',2015,'NE','New England Patriots','New England Patriots · 2015','AFC East','12-4','Conference Championship Game','12-4 · Conference Championship Game',90.5),
  ('nfl-best-sea-2015',2015,'SEA','Seattle Seahawks','Seattle Seahawks · 2015','NFC West','10-6','Won Playoff Game','10-6 · Won Playoff Game',85.0),
  ('nfl-best-atl-2016',2016,'ATL','Atlanta Falcons','Atlanta Falcons · 2016','NFC South','11-5','Super Bowl Runner-Up','11-5 · Super Bowl Runner-Up',90.0),
  ('nfl-best-dal-2016',2016,'DAL','Dallas Cowboys','Dallas Cowboys · 2016','NFC East','13-3','Playoff Team','13-3 · Playoff Team',89.5),
  ('nfl-best-gb-2016',2016,'GB','Green Bay Packers','Green Bay Packers · 2016','NFC North','10-6','Conference Championship Game','10-6 · Conference Championship Game',83.0),
  ('nfl-best-kc-2016',2016,'KC','Kansas City Chiefs','Kansas City Chiefs · 2016','AFC West','12-4','Playoff Team','12-4 · Playoff Team',86.5),
  ('nfl-best-lv-2016',2016,'LV','Oakland Raiders','Oakland Raiders · 2016','AFC West','12-4','Playoff Team','12-4 · Playoff Team',84.5),
  ('nfl-best-ne-2016',2016,'NE','New England Patriots','New England Patriots · 2016','AFC East','14-2','Super Bowl Champion','14-2 · Super Bowl Champion',99.0),
  ('nfl-best-pit-2016',2016,'PIT','Pittsburgh Steelers','Pittsburgh Steelers · 2016','AFC North','11-5','Conference Championship Game','11-5 · Conference Championship Game',86.0),
  ('nfl-best-sea-2016',2016,'SEA','Seattle Seahawks','Seattle Seahawks · 2016','NFC West','10-5-1','Won Playoff Game','10-5-1 · Won Playoff Game',83.5),
  ('nfl-best-car-2017',2017,'CAR','Carolina Panthers','Carolina Panthers · 2017','NFC South','11-5','Playoff Team','11-5 · Playoff Team',83.0),
  ('nfl-best-jax-2017',2017,'JAX','Jacksonville Jaguars','Jacksonville Jaguars · 2017','AFC South','10-6','Conference Championship Game','10-6 · Conference Championship Game',86.5),
  ('nfl-best-lar-2017',2017,'LAR','Los Angeles Rams','Los Angeles Rams · 2017','NFC West','11-5','Playoff Team','11-5 · Playoff Team',86.5),
  ('nfl-best-min-2017',2017,'MIN','Minnesota Vikings','Minnesota Vikings · 2017','NFC North','13-3','Conference Championship Game','13-3 · Conference Championship Game',91.0),
  ('nfl-best-ne-2017',2017,'NE','New England Patriots','New England Patriots · 2017','AFC East','13-3','Super Bowl Runner-Up','13-3 · Super Bowl Runner-Up',94.5),
  ('nfl-best-no-2017',2017,'NO','New Orleans Saints','New Orleans Saints · 2017','NFC South','11-5','Won Playoff Game','11-5 · Won Playoff Game',86.5),
  ('nfl-best-phi-2017',2017,'PHI','Philadelphia Eagles','Philadelphia Eagles · 2017','NFC East','13-3','Super Bowl Champion','13-3 · Super Bowl Champion',97.5),
  ('nfl-best-pit-2017',2017,'PIT','Pittsburgh Steelers','Pittsburgh Steelers · 2017','AFC North','13-3','Playoff Team','13-3 · Playoff Team',89.0),
  ('nfl-best-bal-2018',2018,'BAL','Baltimore Ravens','Baltimore Ravens · 2018','AFC North','10-6','Playoff Team','10-6 · Playoff Team',83.0),
  ('nfl-best-chi-2018',2018,'CHI','Chicago Bears','Chicago Bears · 2018','NFC North','12-4','Playoff Team','12-4 · Playoff Team',88.5),
  ('nfl-best-hou-2018',2018,'HOU','Houston Texans','Houston Texans · 2018','AFC South','11-5','Playoff Team','11-5 · Playoff Team',84.5),
  ('nfl-best-kc-2018',2018,'KC','Kansas City Chiefs','Kansas City Chiefs · 2018','AFC West','12-4','Conference Championship Game','12-4 · Conference Championship Game',90.5),
  ('nfl-best-lac-2018',2018,'LAC','Los Angeles Chargers','Los Angeles Chargers · 2018','AFC West','12-4','Won Playoff Game','12-4 · Won Playoff Game',87.5),
  ('nfl-best-lar-2018',2018,'LAR','Los Angeles Rams','Los Angeles Rams · 2018','NFC West','13-3','Super Bowl Runner-Up','13-3 · Super Bowl Runner-Up',93.5),
  ('nfl-best-ne-2018',2018,'NE','New England Patriots','New England Patriots · 2018','AFC East','11-5','Super Bowl Champion','11-5 · Super Bowl Champion',93.0),
  ('nfl-best-no-2018',2018,'NO','New Orleans Saints','New Orleans Saints · 2018','NFC South','13-3','Conference Championship Game','13-3 · Conference Championship Game',92.5),
  ('nfl-best-bal-2019',2019,'BAL','Baltimore Ravens','Baltimore Ravens · 2019','AFC North','14-2','Playoff Team','14-2 · Playoff Team',93.5),
  ('nfl-best-gb-2019',2019,'GB','Green Bay Packers','Green Bay Packers · 2019','NFC North','13-3','Conference Championship Game','13-3 · Conference Championship Game',89.0),
  ('nfl-best-kc-2019',2019,'KC','Kansas City Chiefs','Kansas City Chiefs · 2019','AFC West','12-4','Super Bowl Champion','12-4 · Super Bowl Champion',96.0),
  ('nfl-best-min-2019',2019,'MIN','Minnesota Vikings','Minnesota Vikings · 2019','NFC North','10-6','Won Playoff Game','10-6 · Won Playoff Game',83.5),
  ('nfl-best-ne-2019',2019,'NE','New England Patriots','New England Patriots · 2019','AFC East','12-4','Playoff Team','12-4 · Playoff Team',90.0),
  ('nfl-best-no-2019',2019,'NO','New Orleans Saints','New Orleans Saints · 2019','NFC South','13-3','Playoff Team','13-3 · Playoff Team',89.5),
  ('nfl-best-sf-2019',2019,'SF','San Francisco 49ers','San Francisco 49ers · 2019','NFC West','13-3','Super Bowl Runner-Up','13-3 · Super Bowl Runner-Up',95.0),
  ('nfl-best-ten-2019',2019,'TEN','Tennessee Titans','Tennessee Titans · 2019','AFC South','9-7','Conference Championship Game','9-7 · Conference Championship Game',82.0),
  ('nfl-best-bal-2020',2020,'BAL','Baltimore Ravens','Baltimore Ravens · 2020','AFC North','11-5','Won Playoff Game','11-5 · Won Playoff Game',87.5),
  ('nfl-best-buf-2020',2020,'BUF','Buffalo Bills','Buffalo Bills · 2020','AFC East','13-3','Conference Championship Game','13-3 · Conference Championship Game',91.5),
  ('nfl-best-cle-2020',2020,'CLE','Cleveland Browns','Cleveland Browns · 2020','AFC North','11-5','Won Playoff Game','11-5 · Won Playoff Game',82.5),
  ('nfl-best-gb-2020',2020,'GB','Green Bay Packers','Green Bay Packers · 2020','NFC North','13-3','Conference Championship Game','13-3 · Conference Championship Game',92.0),
  ('nfl-best-kc-2020',2020,'KC','Kansas City Chiefs','Kansas City Chiefs · 2020','AFC West','14-2','Super Bowl Runner-Up','14-2 · Super Bowl Runner-Up',94.5),
  ('nfl-best-no-2020',2020,'NO','New Orleans Saints','New Orleans Saints · 2020','NFC South','12-4','Won Playoff Game','12-4 · Won Playoff Game',89.0),
  ('nfl-best-pit-2020',2020,'PIT','Pittsburgh Steelers','Pittsburgh Steelers · 2020','AFC North','12-4','Playoff Team','12-4 · Playoff Team',87.0),
  ('nfl-best-sea-2020',2020,'SEA','Seattle Seahawks','Seattle Seahawks · 2020','NFC West','12-4','Playoff Team','12-4 · Playoff Team',86.5),
  ('nfl-best-tb-2020',2020,'TB','Tampa Bay Buccaneers','Tampa Bay Buccaneers · 2020','NFC South','11-5','Super Bowl Champion','11-5 · Super Bowl Champion',94.5),
  ('nfl-best-buf-2021',2021,'BUF','Buffalo Bills','Buffalo Bills · 2021','AFC East','11-6','Won Playoff Game','11-6 · Won Playoff Game',87.0),
  ('nfl-best-cin-2021',2021,'CIN','Cincinnati Bengals','Cincinnati Bengals · 2021','AFC North','10-7','Super Bowl Runner-Up','10-7 · Super Bowl Runner-Up',84.5),
  ('nfl-best-dal-2021',2021,'DAL','Dallas Cowboys','Dallas Cowboys · 2021','NFC East','12-5','Playoff Team','12-5 · Playoff Team',87.5),
  ('nfl-best-gb-2021',2021,'GB','Green Bay Packers','Green Bay Packers · 2021','NFC North','13-4','Playoff Team','13-4 · Playoff Team',86.5),
  ('nfl-best-kc-2021',2021,'KC','Kansas City Chiefs','Kansas City Chiefs · 2021','AFC West','12-5','Conference Championship Game','12-5 · Conference Championship Game',88.0),
  ('nfl-best-lar-2021',2021,'LAR','Los Angeles Rams','Los Angeles Rams · 2021','NFC West','12-5','Super Bowl Champion','12-5 · Super Bowl Champion',93.5),
  ('nfl-best-sf-2021',2021,'SF','San Francisco 49ers','San Francisco 49ers · 2021','NFC West','10-7','Conference Championship Game','10-7 · Conference Championship Game',82.5),
  ('nfl-best-tb-2021',2021,'TB','Tampa Bay Buccaneers','Tampa Bay Buccaneers · 2021','NFC South','13-4','Won Playoff Game','13-4 · Won Playoff Game',90.0),
  ('nfl-best-ten-2021',2021,'TEN','Tennessee Titans','Tennessee Titans · 2021','AFC South','12-5','Playoff Team','12-5 · Playoff Team',84.5),
  ('nfl-best-bal-2022',2022,'BAL','Baltimore Ravens','Baltimore Ravens · 2022','AFC North','10-7','Playoff Team','10-7 · Playoff Team',79.5),
  ('nfl-best-buf-2022',2022,'BUF','Buffalo Bills','Buffalo Bills · 2022','AFC East','13-3','Won Playoff Game','13-3 · Won Playoff Game',91.5),
  ('nfl-best-cin-2022',2022,'CIN','Cincinnati Bengals','Cincinnati Bengals · 2022','AFC North','12-4','Conference Championship Game','12-4 · Conference Championship Game',89.0),
  ('nfl-best-dal-2022',2022,'DAL','Dallas Cowboys','Dallas Cowboys · 2022','NFC East','12-5','Won Playoff Game','12-5 · Won Playoff Game',87.0),
  ('nfl-best-jax-2022',2022,'JAX','Jacksonville Jaguars','Jacksonville Jaguars · 2022','AFC South','9-8','Won Playoff Game','9-8 · Won Playoff Game',79.0),
  ('nfl-best-kc-2022',2022,'KC','Kansas City Chiefs','Kansas City Chiefs · 2022','AFC West','14-3','Super Bowl Champion','14-3 · Super Bowl Champion',96.5),
  ('nfl-best-min-2022',2022,'MIN','Minnesota Vikings','Minnesota Vikings · 2022','NFC North','13-4','Playoff Team','13-4 · Playoff Team',84.0),
  ('nfl-best-phi-2022',2022,'PHI','Philadelphia Eagles','Philadelphia Eagles · 2022','NFC East','14-3','Super Bowl Runner-Up','14-3 · Super Bowl Runner-Up',95.0),
  ('nfl-best-sf-2022',2022,'SF','San Francisco 49ers','San Francisco 49ers · 2022','NFC West','13-4','Conference Championship Game','13-4 · Conference Championship Game',91.0),
  ('nfl-best-bal-2023',2023,'BAL','Baltimore Ravens','Baltimore Ravens · 2023','AFC North','13-4','Conference Championship Game','13-4 · Conference Championship Game',93.5),
  ('nfl-best-buf-2023',2023,'BUF','Buffalo Bills','Buffalo Bills · 2023','AFC East','11-6','Won Playoff Game','11-6 · Won Playoff Game',85.5),
  ('nfl-best-cle-2023',2023,'CLE','Cleveland Browns','Cleveland Browns · 2023','AFC North','11-6','Playoff Team','11-6 · Playoff Team',81.0),
  ('nfl-best-dal-2023',2023,'DAL','Dallas Cowboys','Dallas Cowboys · 2023','NFC East','12-5','Playoff Team','12-5 · Playoff Team',88.0),
  ('nfl-best-det-2023',2023,'DET','Detroit Lions','Detroit Lions · 2023','NFC North','12-5','Conference Championship Game','12-5 · Conference Championship Game',86.0),
  ('nfl-best-gb-2023',2023,'GB','Green Bay Packers','Green Bay Packers · 2023','NFC North','9-8','Won Playoff Game','9-8 · Won Playoff Game',79.0),
  ('nfl-best-kc-2023',2023,'KC','Kansas City Chiefs','Kansas City Chiefs · 2023','AFC West','11-6','Super Bowl Champion','11-6 · Super Bowl Champion',91.0),
  ('nfl-best-mia-2023',2023,'MIA','Miami Dolphins','Miami Dolphins · 2023','AFC East','11-6','Playoff Team','11-6 · Playoff Team',83.0),
  ('nfl-best-sf-2023',2023,'SF','San Francisco 49ers','San Francisco 49ers · 2023','NFC West','12-5','Super Bowl Runner-Up','12-5 · Super Bowl Runner-Up',93.5),
  ('nfl-best-bal-2024',2024,'BAL','Baltimore Ravens','Baltimore Ravens · 2024','AFC North','12-5','Won Playoff Game','12-5 · Won Playoff Game',88.0),
  ('nfl-best-buf-2024',2024,'BUF','Buffalo Bills','Buffalo Bills · 2024','AFC East','13-4','Conference Championship Game','13-4 · Conference Championship Game',92.5),
  ('nfl-best-det-2024',2024,'DET','Detroit Lions','Detroit Lions · 2024','NFC North','15-2','Playoff Team','15-2 · Playoff Team',93.0),
  ('nfl-best-gb-2024',2024,'GB','Green Bay Packers','Green Bay Packers · 2024','NFC North','11-6','Playoff Team','11-6 · Playoff Team',84.0),
  ('nfl-best-kc-2024',2024,'KC','Kansas City Chiefs','Kansas City Chiefs · 2024','AFC West','15-2','Super Bowl Runner-Up','15-2 · Super Bowl Runner-Up',92.5),
  ('nfl-best-lac-2024',2024,'LAC','Los Angeles Chargers','Los Angeles Chargers · 2024','AFC West','11-6','Playoff Team','11-6 · Playoff Team',83.0),
  ('nfl-best-min-2024',2024,'MIN','Minnesota Vikings','Minnesota Vikings · 2024','NFC North','14-3','Playoff Team','14-3 · Playoff Team',89.0),
  ('nfl-best-phi-2024',2024,'PHI','Philadelphia Eagles','Philadelphia Eagles · 2024','NFC East','14-3','Super Bowl Champion','14-3 · Super Bowl Champion',98.5),
  ('nfl-best-was-2024',2024,'WAS','Washington Commanders','Washington Commanders · 2024','NFC East','12-5','Conference Championship Game','12-5 · Conference Championship Game',86.5),
  ('nfl-best-buf-2025',2025,'BUF','Buffalo Bills','Buffalo Bills · 2025','AFC East','12-5','Won Playoff Game','12-5 · Won Playoff Game',86.5),
  ('nfl-best-chi-2025',2025,'CHI','Chicago Bears','Chicago Bears · 2025','NFC North','11-6','Won Playoff Game','11-6 · Won Playoff Game',82.0),
  ('nfl-best-den-2025',2025,'DEN','Denver Broncos','Denver Broncos · 2025','AFC West','14-3','Conference Championship Game','14-3 · Conference Championship Game',90.5),
  ('nfl-best-hou-2025',2025,'HOU','Houston Texans','Houston Texans · 2025','AFC South','12-5','Won Playoff Game','12-5 · Won Playoff Game',86.5),
  ('nfl-best-jax-2025',2025,'JAX','Jacksonville Jaguars','Jacksonville Jaguars · 2025','AFC South','13-4','Playoff Team','13-4 · Playoff Team',88.5),
  ('nfl-best-lar-2025',2025,'LAR','Los Angeles Rams','Los Angeles Rams · 2025','NFC West','12-5','Conference Championship Game','12-5 · Conference Championship Game',89.0),
  ('nfl-best-ne-2025',2025,'NE','New England Patriots','New England Patriots · 2025','AFC East','14-3','Super Bowl Runner-Up','14-3 · Super Bowl Runner-Up',94.5),
  ('nfl-best-phi-2025',2025,'PHI','Philadelphia Eagles','Philadelphia Eagles · 2025','NFC East','11-6','Playoff Team','11-6 · Playoff Team',82.0),
  ('nfl-best-sea-2025',2025,'SEA','Seattle Seahawks','Seattle Seahawks · 2025','NFC West','14-3','Super Bowl Champion','14-3 · Super Bowl Champion',98.5),
  ('nfl-best-sf-2025',2025,'SF','San Francisco 49ers','San Francisco 49ers · 2025','NFC West','12-5','Won Playoff Game','12-5 · Won Playoff Game',84.0)
on conflict(item_reference) do update set
  season_year=excluded.season_year,
  franchise_id=excluded.franchise_id,
  team_name=excluded.team_name,
  display_label=excluded.display_label,
  division=excluded.division,
  record=excluded.record,
  postseason_finish=excluded.postseason_finish,
  card_tag=excluded.card_tag,
  hidden_grade=excluded.hidden_grade;

insert into private.football_weekly_auction_subjects(
  subject_key,display_name,short_label,competition_level,item_kind,
  rotation_order,eligible_from,is_active
) values (
  'nfl-best-team-seasons-since-2000',
  'Best NFL Team-Seasons Since 2000',
  'NFL Team-Seasons',
  'NFL',
  'team-season',
  3,
  date '2026-10-06',
  true
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
  'nfl-best-team-seasons-since-2000',
  authority.season_year,
  authority.team_name,
  authority.record,
  authority.franchise_id,
  authority.division,
  authority.franchise_id,
  authority.display_label,
  authority.hidden_grade,
  null,
  jsonb_build_object(
    'record',authority.record,
    'postseason_finish',authority.postseason_finish,
    'card_tag',authority.card_tag
  )
from private.nfl_best_team_seasons_v1_authority authority
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

-- NFL public theme labels are intentionally descriptive rather than a fixed
-- small enum. Hidden shape remains neutral: NFL days do not force grade shapes.
alter table private.football_weekly_auction_board
  drop constraint if exists football_weekly_auction_board_theme_check,
  add constraint football_weekly_auction_board_theme_check check (
    length(btrim(theme)) between 1 and 80
  ),
  drop constraint if exists football_weekly_auction_board_hidden_shape_check,
  add constraint football_weekly_auction_board_hidden_shape_check check (
    hidden_shape in (
      'Wide','Compressed','TopHeavy','MiddleHeavy','Trap','Chaotic',
      'Premium','Standard','Grinder','Chaos','Natural'
    )
  );

create table if not exists private.football_weekly_nfl_team_season_theme_options (
  option_key text primary key,
  family text not null check (family in (
    'division','season','era','rivalry','franchise_history',
    'fell_short','conference_clash','open_field'
  )),
  weight numeric(4,2) not null check (weight>0),
  weekly_cap integer not null check (weekly_cap between 1 and 6),
  public_label text not null,
  variant_a text,
  variant_b text,
  season_min integer,
  season_max integer
);
revoke all on private.football_weekly_nfl_team_season_theme_options from public,anon,authenticated;

delete from private.football_weekly_nfl_team_season_theme_options;
insert into private.football_weekly_nfl_team_season_theme_options(
  option_key,family,weight,weekly_cap,public_label,variant_a,variant_b,season_min,season_max
) values
  ('division-1','division',1.35,2,'AFC East Spotlight','AFC East',null,null,null),
  ('division-2','division',1.35,2,'AFC North Spotlight','AFC North',null,null,null),
  ('division-3','division',1.35,2,'AFC South Spotlight','AFC South',null,null,null),
  ('division-4','division',1.35,2,'AFC West Spotlight','AFC West',null,null,null),
  ('division-5','division',1.35,2,'NFC East Spotlight','NFC East',null,null,null),
  ('division-6','division',1.35,2,'NFC North Spotlight','NFC North',null,null,null),
  ('division-7','division',1.35,2,'NFC South Spotlight','NFC South',null,null,null),
  ('division-8','division',1.35,2,'NFC West Spotlight','NFC West',null,null,null),
  ('season-2010','season',1.10,1,'2010 Season Spotlight','2010',null,2010,2010),
  ('season-2011','season',1.10,1,'2011 Season Spotlight','2011',null,2011,2011),
  ('season-2012','season',1.10,1,'2012 Season Spotlight','2012',null,2012,2012),
  ('season-2013','season',1.10,1,'2013 Season Spotlight','2013',null,2013,2013),
  ('season-2014','season',1.10,1,'2014 Season Spotlight','2014',null,2014,2014),
  ('season-2015','season',1.10,1,'2015 Season Spotlight','2015',null,2015,2015),
  ('season-2016','season',1.10,1,'2016 Season Spotlight','2016',null,2016,2016),
  ('season-2017','season',1.10,1,'2017 Season Spotlight','2017',null,2017,2017),
  ('season-2018','season',1.10,1,'2018 Season Spotlight','2018',null,2018,2018),
  ('season-2019','season',1.10,1,'2019 Season Spotlight','2019',null,2019,2019),
  ('season-2020','season',1.10,1,'2020 Season Spotlight','2020',null,2020,2020),
  ('season-2021','season',1.10,1,'2021 Season Spotlight','2021',null,2021,2021),
  ('season-2022','season',1.10,1,'2022 Season Spotlight','2022',null,2022,2022),
  ('season-2023','season',1.10,1,'2023 Season Spotlight','2023',null,2023,2023),
  ('season-2024','season',1.10,1,'2024 Season Spotlight','2024',null,2024,2024),
  ('season-2025','season',1.10,1,'2025 Season Spotlight','2025',null,2025,2025),
  ('era-2000s','era',1.00,1,'2000s Spotlight',null,null,2000,2009),
  ('era-2010s','era',1.00,1,'2010s Spotlight',null,null,2010,2019),
  ('era-2020s','era',1.00,1,'2020s Spotlight',null,null,2020,2025),
  ('rivalry-1','rivalry',1.15,1,'Cowboys vs Eagles','DAL','PHI',null,null),
  ('rivalry-2','rivalry',1.15,1,'Packers vs Bears','GB','CHI',null,null),
  ('rivalry-3','rivalry',1.15,1,'Ravens vs Steelers','BAL','PIT',null,null),
  ('rivalry-4','rivalry',1.15,1,'Chiefs vs Raiders','KC','LV',null,null),
  ('rivalry-5','rivalry',1.15,1,'Patriots vs Jets','NE','NYJ',null,null),
  ('rivalry-6','rivalry',1.15,1,'49ers vs Rams','SF','LAR',null,null),
  ('rivalry-7','rivalry',1.15,1,'Falcons vs Saints','ATL','NO',null,null),
  ('rivalry-8','rivalry',1.15,1,'Broncos vs Chiefs','DEN','KC',null,null),
  ('rivalry-9','rivalry',1.15,1,'Giants vs Eagles','NYG','PHI',null,null),
  ('rivalry-10','rivalry',1.15,1,'Seahawks vs 49ers','SEA','SF',null,null),
  ('rivalry-11','rivalry',1.15,1,'Browns vs Steelers','CLE','PIT',null,null),
  ('rivalry-12','rivalry',1.15,1,'Vikings vs Packers','MIN','GB',null,null),
  ('franchise-bal','franchise_history',0.90,1,'Ravens Through the Years','BAL',null,null,null),
  ('franchise-dal','franchise_history',0.90,1,'Cowboys Through the Years','DAL',null,null,null),
  ('franchise-den','franchise_history',0.90,1,'Broncos Through the Years','DEN',null,null,null),
  ('franchise-gb','franchise_history',0.90,1,'Packers Through the Years','GB',null,null,null),
  ('franchise-ind','franchise_history',0.90,1,'Colts Through the Years','IND',null,null,null),
  ('franchise-kc','franchise_history',0.90,1,'Chiefs Through the Years','KC',null,null,null),
  ('franchise-min','franchise_history',0.90,1,'Vikings Through the Years','MIN',null,null,null),
  ('franchise-ne','franchise_history',0.90,1,'Patriots Through the Years','NE',null,null,null),
  ('franchise-no','franchise_history',0.90,1,'Saints Through the Years','NO',null,null,null),
  ('franchise-phi','franchise_history',0.90,1,'Eagles Through the Years','PHI',null,null,null),
  ('franchise-pit','franchise_history',0.90,1,'Steelers Through the Years','PIT',null,null,null),
  ('franchise-sea','franchise_history',0.90,1,'Seahawks Through the Years','SEA',null,null,null),
  ('franchise-sf','franchise_history',0.90,1,'49ers Through the Years','SF',null,null,null),
  ('fell-short','fell_short',1.00,1,'Great Teams That Fell Short',null,null,null,null),
  ('conference-clash','conference_clash',1.00,1,'AFC vs NFC',null,null,null,null),
  ('open-field','open_field',1.50,2,'Open Field',null,null,null,null);

create table if not exists private.football_weekly_nfl_team_season_week_authority (
  week_start date not null
    references private.football_weekly_auction_weeks(week_start) on delete cascade,
  day_index integer not null check (day_index between 1 and 6),
  reserve_slot integer not null check (reserve_slot between 1 and 7),
  theme_family text not null,
  theme text not null,
  item_reference text not null
    references private.football_weekly_auction_items(item_reference) on delete restrict,
  created_at timestamptz not null default now(),
  primary key(week_start,day_index,reserve_slot),
  unique(week_start,item_reference)
);
revoke all on private.football_weekly_nfl_team_season_week_authority from public,anon,authenticated;

create or replace function private.football_weekly_nfl_team_season_cards_for_field(
  p_players integer
)
returns integer
language sql
immutable
set search_path=''
as $$
  select case
    when coalesce(p_players,0)<=4 then 3
    when p_players=5 then 4
    when p_players=6 then 5
    when p_players=7 then 6
    else 7
  end;
$$;
revoke all on function private.football_weekly_nfl_team_season_cards_for_field(integer)
  from public,anon,authenticated;

create or replace function private.football_weekly_nfl_team_season_active_players(
  p_week_start date,p_day_index integer
)
returns integer
language sql
stable security definer
set search_path=''
as $$
  select case
    when p_day_index<=2 then (
      select count(*)::integer
      from private.football_weekly_auction_participants participant
      where participant.week_start=p_week_start
    )
    else (
      select count(*)::integer
      from private.football_weekly_auction_participants participant
      where participant.week_start=p_week_start
        and exists(
          select 1
          from private.football_weekly_auction_daily_entries entry
          where entry.week_start=p_week_start
            and entry.profile_id=participant.profile_id
            and entry.day_index between p_day_index-2 and p_day_index-1
        )
    )
  end;
$$;
revoke all on function private.football_weekly_nfl_team_season_active_players(date,integer)
  from public,anon,authenticated;

create or replace function private.generate_football_weekly_nfl_team_season_authority(
  p_week_start date
)
returns void
language plpgsql
security definer
set search_path=''
as $$
declare
  v_existing integer;
  v_attempt integer;
  v_day integer;
  v_slot integer;
  v_family text;
  v_family_counts jsonb;
  v_labels text[];
  v_option private.football_weekly_nfl_team_season_theme_options%rowtype;
  v_pick private.nfl_best_team_seasons_v1_authority%rowtype;
begin
  select count(*)::integer into v_existing
  from private.football_weekly_nfl_team_season_week_authority authority
  where authority.week_start=p_week_start;

  if v_existing=42 then return; end if;
  if v_existing<>0 then
    raise exception 'NFL team-season hidden reserve authority is partial; refusing to reroll it';
  end if;

  <<attempt_loop>>
  for v_attempt in 1..500 loop
    delete from private.football_weekly_nfl_team_season_week_authority
    where week_start=p_week_start;

    v_family_counts:='{}'::jsonb;
    v_labels:=array[]::text[];

    for v_day in 1..6 loop
      select family into v_family
      from (
        values
          ('division'::text,1.35::numeric,2),
          ('season',1.10::numeric,1),
          ('era',1.00::numeric,1),
          ('rivalry',1.15::numeric,1),
          ('franchise_history',0.90::numeric,1),
          ('fell_short',1.00::numeric,1),
          ('conference_clash',1.00::numeric,1),
          ('open_field',1.50::numeric,2)
      ) family(family,weight,weekly_cap)
      where coalesce((v_family_counts->>family.family)::integer,0)<family.weekly_cap
      order by -ln(greatest(random(),0.000000001))/family.weight
      limit 1;

      select option.* into v_option
      from private.football_weekly_nfl_team_season_theme_options option
      where option.family=v_family
        and not (option.public_label=any(v_labels))
      order by random()
      limit 1;

      if v_option.option_key is null then
        continue attempt_loop;
      end if;

      for v_slot in 1..7 loop
        v_pick:=null;

        select candidate.* into v_pick
        from private.nfl_best_team_seasons_v1_authority candidate
        where not exists(
            select 1
            from private.football_weekly_nfl_team_season_week_authority used
            where used.week_start=p_week_start
              and used.item_reference=candidate.item_reference
          )
          and (
            (v_family='division' and candidate.division=v_option.variant_a)
            or (v_family='season' and candidate.season_year=v_option.season_min)
            or (v_family='era' and candidate.season_year between v_option.season_min and v_option.season_max)
            or (v_family='rivalry' and candidate.franchise_id in (v_option.variant_a,v_option.variant_b))
            or (v_family='franchise_history' and candidate.franchise_id=v_option.variant_a)
            or (v_family='fell_short' and candidate.postseason_finish<>'Super Bowl Champion')
            or (v_family='conference_clash')
            or (v_family='open_field')
          )
          and (
            v_family not in ('rivalry','franchise_history')
            or v_slot>2
            or (v_family='franchise_history')
            or (v_slot=1 and candidate.franchise_id=v_option.variant_a)
            or (v_slot=2 and candidate.franchise_id=v_option.variant_b)
          )
          and (
            v_family<>'conference_clash'
            or v_slot>2
            or (v_slot=1 and candidate.division like 'AFC %')
            or (v_slot=2 and candidate.division like 'NFC %')
          )
          and (
            v_family in ('rivalry','franchise_history')
            or (
              select count(*)
              from private.football_weekly_nfl_team_season_week_authority prior
              join private.nfl_best_team_seasons_v1_authority prior_item
                on prior_item.item_reference=prior.item_reference
              where prior.week_start=p_week_start
                and prior_item.franchise_id=candidate.franchise_id
            )<3
          )
        order by random(),candidate.item_reference
        limit 1;

        if v_pick.item_reference is null then
          continue attempt_loop;
        end if;

        insert into private.football_weekly_nfl_team_season_week_authority(
          week_start,day_index,reserve_slot,theme_family,theme,item_reference
        ) values (
          p_week_start,v_day,v_slot,v_family,v_option.public_label,v_pick.item_reference
        );
      end loop;

      v_labels:=array_append(v_labels,v_option.public_label);
      v_family_counts:=jsonb_set(
        v_family_counts,
        array[v_family],
        to_jsonb(coalesce((v_family_counts->>v_family)::integer,0)+1),
        true
      );
    end loop;

    if (
      select count(*)
      from private.football_weekly_nfl_team_season_week_authority authority
      where authority.week_start=p_week_start
    )=42 then
      return;
    end if;
  end loop;

  raise exception 'Unable to materialize a valid NFL team-season hidden reserve authority';
end;
$$;
revoke all on function private.generate_football_weekly_nfl_team_season_authority(date)
  from public,anon,authenticated;

create or replace function private.materialize_football_weekly_nfl_team_season_day(
  p_week_start date,p_day_index integer,p_at timestamptz default now()
)
returns void
language plpgsql
security definer
set search_path=''
as $$
declare
  v_subject text;
  v_day_start timestamptz;
  v_lock_at timestamptz;
  v_existing integer;
  v_players integer;
  v_cards integer;
begin
  if p_day_index not between 1 and 6 then
    raise exception 'NFL team-season normal day must be between 1 and 6';
  end if;

  select subject_key into v_subject
  from private.football_weekly_auction_weeks
  where week_start=p_week_start;
  if v_subject is distinct from 'nfl-best-team-seasons-since-2000' then
    raise exception 'NFL team-season day materializer requires its subject week';
  end if;

  v_day_start:=((p_week_start+(p_day_index-1))::timestamp at time zone 'America/Chicago');
  if p_at<v_day_start then return; end if;

  select count(*)::integer into v_existing
  from private.football_weekly_auction_board board
  where board.week_start=p_week_start and board.day_index=p_day_index;

  if v_existing>0 then return; end if;

  if p_day_index=1 then
    -- The opening board is calibrated around the expected five-player field.
    -- Later unrevealed days adapt to participation without ever changing Day 1.
    v_cards:=4;
  else
    v_players:=private.football_weekly_nfl_team_season_active_players(
      p_week_start,p_day_index
    );
    v_cards:=private.football_weekly_nfl_team_season_cards_for_field(v_players);
  end if;

  v_lock_at:=((p_week_start+p_day_index)::timestamp at time zone 'America/Chicago');

  insert into private.football_weekly_auction_board(
    week_start,day_index,theme,hidden_shape,slot,season_reference,lock_at,trait
  )
  select
    authority.week_start,
    authority.day_index,
    authority.theme,
    'Natural',
    authority.reserve_slot,
    authority.item_reference,
    v_lock_at,
    null
  from private.football_weekly_nfl_team_season_week_authority authority
  where authority.week_start=p_week_start
    and authority.day_index=p_day_index
    and authority.reserve_slot<=v_cards
  order by authority.reserve_slot;

  if (
    select count(*)
    from private.football_weekly_auction_board board
    where board.week_start=p_week_start and board.day_index=p_day_index
  )<>v_cards then
    raise exception 'NFL team-season exposed board did not match its locked supply';
  end if;
end;
$$;
revoke all on function private.materialize_football_weekly_nfl_team_season_day(date,integer,timestamptz)
  from public,anon,authenticated;

create or replace function private.materialize_football_weekly_nfl_team_season_week(
  p_week_start date
)
returns void
language plpgsql
security definer
set search_path=''
as $$
declare v_subject text;
begin
  if extract(isodow from p_week_start)<>2 then
    raise exception 'Football Weekly Auction week must start Tuesday';
  end if;

  insert into private.football_weekly_auction_weeks(week_start,subject_key)
  values(p_week_start,'nfl-best-team-seasons-since-2000')
  on conflict(week_start) do nothing;

  select subject_key into v_subject
  from private.football_weekly_auction_weeks
  where week_start=p_week_start;

  if v_subject<>'nfl-best-team-seasons-since-2000' then
    raise exception 'NFL team-season materializer requires its subject week';
  end if;

  perform private.generate_football_weekly_nfl_team_season_authority(p_week_start);
  perform private.materialize_football_weekly_nfl_team_season_day(
    p_week_start,1,(p_week_start::timestamp at time zone 'America/Chicago')
  );
end;
$$;
revoke all on function private.materialize_football_weekly_nfl_team_season_week(date)
  from public,anon,authenticated;

-- Extend the existing server-side authority trigger without weakening any
-- existing CFB Superteam, Build-a-QB, or CFB team-season validation.
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

  if v_subject='nfl-best-team-seasons-since-2000' then
    if new.trait is not null
      or new.hidden_shape<>'Natural'
      or new.day_index not between 1 and 6
      or not exists(
        select 1
        from private.football_weekly_nfl_team_season_week_authority authority
        where authority.week_start=new.week_start
          and authority.day_index=new.day_index
          and authority.reserve_slot=new.slot
          and authority.theme=new.theme
          and authority.item_reference=new.season_reference
      )
    then
      raise exception 'NFL team-season board row is outside the hidden reserve authority';
    end if;
  elsif v_subject='cfb-superteam' then
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

create or replace function private.football_weekly_auction_cards_per_day(p_week_start date)
returns integer
language sql
stable security definer
set search_path=''
as $$
  select case week.subject_key
    when 'cfb-superteam' then 8
    when 'nfl-build-qb' then 4
    when 'nfl-best-team-seasons-since-2000' then 4
    else 3
  end
  from private.football_weekly_auction_weeks week
  where week.week_start=p_week_start;
$$;
revoke all on function private.football_weekly_auction_cards_per_day(date)
  from public,anon,authenticated;

create or replace function private.football_weekly_auction_cards_for_day(
  p_week_start date,p_day_index integer
)
returns integer
language plpgsql
stable security definer
set search_path=''
as $$
declare
  v_subject text;
  v_day_start timestamptz;
  v_players integer;
  v_exposed integer;
begin
  if p_day_index not between 1 and 7 then
    raise exception 'Football Weekly Auction day must be between 1 and 7';
  end if;

  select subject_key into v_subject
  from private.football_weekly_auction_weeks
  where week_start=p_week_start;

  if v_subject='nfl-best-team-seasons-since-2000' then
    if p_day_index=7 then return 0; end if;
    select count(*)::integer into v_exposed
    from private.football_weekly_auction_board board
    where board.week_start=p_week_start and board.day_index=p_day_index;
    return v_exposed;
  end if;

  if v_subject<>'cfb-superteam' then
    return private.football_weekly_auction_cards_per_day(p_week_start);
  end if;

  if exists(
    select 1
    from private.football_weekly_superteam_lab_runs lab
    where lab.lab_week_start=p_week_start
  ) then
    if p_day_index=1 then return 10; end if;
    select count(*)::integer into v_players
    from private.football_weekly_auction_participants participant
    where participant.week_start=p_week_start;
    return private.football_weekly_superteam_cards_for_field(v_players);
  end if;

  if p_week_start=date '2026-09-29' and p_day_index=1 then return 10; end if;

  v_day_start:=((p_week_start+(p_day_index-1))::timestamp at time zone 'America/Chicago');
  select count(*)::integer into v_players
  from private.football_weekly_auction_participants participant
  where participant.week_start=p_week_start
    and participant.locked_at<v_day_start;

  return private.football_weekly_superteam_cards_for_field(v_players);
end;
$$;
revoke all on function private.football_weekly_auction_cards_for_day(date,integer)
  from public,anon,authenticated;

create or replace function private.football_weekly_auction_cards_per_week(p_week_start date)
returns integer
language plpgsql
stable security definer
set search_path=''
as $$
declare
  v_subject text;
  v_day integer;
  v_total integer:=0;
begin
  select subject_key into v_subject
  from private.football_weekly_auction_weeks
  where week_start=p_week_start;

  if v_subject='nfl-best-team-seasons-since-2000' then
    select count(*)::integer into v_total
    from private.football_weekly_auction_board board
    where board.week_start=p_week_start and board.day_index between 1 and 6;
    return v_total;
  end if;

  if v_subject='cfb-superteam' then
    for v_day in 1..7 loop
      v_total:=v_total+private.football_weekly_auction_cards_for_day(p_week_start,v_day);
    end loop;
    return v_total;
  end if;

  return private.football_weekly_auction_cards_per_day(p_week_start)*7;
end;
$$;
revoke all on function private.football_weekly_auction_cards_per_week(date)
  from public,anon,authenticated;

create or replace function private.submit_football_weekly_nfl_team_season_bids_for_profile(
  p_week_start date,p_day_index integer,p_profile_id uuid,p_bids jsonb,p_at timestamptz
)
returns void
language plpgsql
security definer
set search_path=''
as $$
declare
  v_card_count integer;
  v_lock_at timestamptz;
  v_starting integer;
  v_spent integer;
  v_bankroll integer;
  v_owned integer;
  v_max_wins integer;
  v_slot integer;
  v_bid integer;
  v_amounts integer[]:=array[]::integer[];
  v_top_commit integer;
begin
  if p_profile_id is null then raise exception 'profile required'; end if;
  if p_day_index not between 1 and 6 then
    raise exception 'Normal bidding is only available on NFL team-season Days 1-6';
  end if;
  if jsonb_typeof(p_bids)<>'object' then raise exception 'bids must be an object'; end if;

  if not exists(
    select 1 from private.football_weekly_auction_participants participant
    where participant.week_start=p_week_start and participant.profile_id=p_profile_id
  ) then
    raise exception 'Weekly Auction participant is unavailable for this week';
  end if;

  v_card_count:=private.football_weekly_auction_cards_for_day(p_week_start,p_day_index);
  if v_card_count<1 then raise exception 'NFL team-season board is not exposed yet'; end if;

  select min(board.lock_at) into v_lock_at
  from private.football_weekly_auction_board board
  where board.week_start=p_week_start and board.day_index=p_day_index;

  if v_lock_at is null or p_at>=v_lock_at then
    raise exception 'Today''s Weekly Auction bids are locked';
  end if;

  v_starting:=private.football_weekly_auction_starting_bankroll(
    p_week_start,p_profile_id,50
  );

  select
    coalesce(sum(award.winning_bid),0)::integer,
    count(*)::integer
  into v_spent,v_owned
  from private.football_weekly_auction_awards award
  where award.week_start=p_week_start
    and award.profile_id=p_profile_id
    and award.day_index between 1 and 6;

  v_bankroll:=greatest(v_starting-v_spent,0);
  v_max_wins:=least(2,greatest(5-v_owned,0));

  for v_slot in 1..v_card_count loop
    begin
      v_bid:=coalesce((p_bids->>v_slot::text)::integer,0);
    exception when others then
      raise exception 'Weekly Auction bids must be whole-dollar integers';
    end;
    if v_bid<0 or v_bid>50 then
      raise exception 'NFL team-season bids must be between $0 and $50';
    end if;
    if v_max_wins=0 and v_bid<>0 then
      raise exception 'You already own the maximum five normal team-seasons';
    end if;
    v_amounts:=array_append(v_amounts,v_bid);
  end loop;

  if exists(
    select 1
    from jsonb_object_keys(p_bids) as keys(key)
    where keys.key ~ '^[0-9]+$'
      and keys.key::integer>v_card_count
      and coalesce((p_bids->>keys.key)::integer,0)<>0
  ) then
    raise exception 'A bid targets a card that is not on today''s board';
  end if;

  select coalesce(sum(value),0)::integer into v_top_commit
  from (
    select value
    from unnest(v_amounts) value
    order by value desc
    limit v_max_wins
  ) possible_wins;

  if v_top_commit>v_bankroll then
    raise exception 'Your highest possible wins exceed the $% remaining bankroll',v_bankroll;
  end if;

  insert into private.football_weekly_auction_daily_entries(
    week_start,day_index,profile_id,submitted_at,updated_at
  ) values (
    p_week_start,p_day_index,p_profile_id,p_at,p_at
  )
  on conflict(week_start,day_index,profile_id)
  do update set updated_at=excluded.updated_at;

  for v_slot in 1..v_card_count loop
    v_bid:=coalesce((p_bids->>v_slot::text)::integer,0);
    insert into private.football_weekly_auction_bids(
      week_start,day_index,profile_id,slot,amount,updated_at
    ) values (
      p_week_start,p_day_index,p_profile_id,v_slot,v_bid,p_at
    )
    on conflict(week_start,day_index,profile_id,slot)
    do update set amount=excluded.amount,updated_at=excluded.updated_at;
  end loop;
end;
$$;
revoke all on function private.submit_football_weekly_nfl_team_season_bids_for_profile(
  date,integer,uuid,jsonb,timestamptz
) from public,anon,authenticated;

create or replace function private.resolve_football_weekly_nfl_team_season_day(
  p_week_start date,p_day_index integer,p_at timestamptz default now()
)
returns void
language plpgsql
security definer
set search_path=''
as $$
declare
  v_card_count integer;
  v_slot integer;
  v_winner uuid;
  v_amount integer;
  v_lock_at timestamptz;
begin
  if p_day_index not between 1 and 6 then
    raise exception 'NFL team-season normal resolver only owns Days 1-6';
  end if;

  v_card_count:=private.football_weekly_auction_cards_for_day(p_week_start,p_day_index);
  select min(lock_at) into v_lock_at
  from private.football_weekly_auction_board
  where week_start=p_week_start and day_index=p_day_index;

  if v_lock_at is null then raise exception 'NFL team-season day is not materialized'; end if;
  if p_at<v_lock_at then return; end if;

  for v_slot in 1..v_card_count loop
    if exists(
      select 1 from private.football_weekly_auction_awards
      where week_start=p_week_start and day_index=p_day_index and slot=v_slot
    ) then continue; end if;

    v_winner:=null;
    v_amount:=0;

    select bid.profile_id,bid.amount
    into v_winner,v_amount
    from private.football_weekly_auction_bids bid
    where bid.week_start=p_week_start
      and bid.day_index=p_day_index
      and bid.slot=v_slot
      and bid.amount>0
      and (
        select count(*)
        from private.football_weekly_auction_awards award
        where award.week_start=p_week_start
          and award.profile_id=bid.profile_id
          and award.day_index between 1 and 6
      )<5
      and (
        select count(*)
        from private.football_weekly_auction_awards award
        where award.week_start=p_week_start
          and award.day_index=p_day_index
          and award.profile_id=bid.profile_id
      )<2
      and (
        coalesce((
          select sum(award.winning_bid)
          from private.football_weekly_auction_awards award
          where award.week_start=p_week_start
            and award.profile_id=bid.profile_id
            and award.day_index between 1 and 6
        ),0)+bid.amount
      )<=private.football_weekly_auction_starting_bankroll(
        p_week_start,bid.profile_id,50
      )
    order by
      bid.amount desc,
      (
        select count(*)
        from private.football_weekly_auction_awards award
        where award.week_start=p_week_start
          and award.profile_id=bid.profile_id
          and award.day_index<p_day_index
      ) asc,
      (
        select coalesce(sum(award.winning_bid),0)
        from private.football_weekly_auction_awards award
        where award.week_start=p_week_start
          and award.profile_id=bid.profile_id
          and award.day_index<p_day_index
      ) asc,
      random()
    limit 1;

    insert into private.football_weekly_auction_awards(
      week_start,day_index,slot,profile_id,winning_bid,resolved_at
    ) values (
      p_week_start,p_day_index,v_slot,v_winner,coalesce(v_amount,0),p_at
    );
  end loop;
end;
$$;
revoke all on function private.resolve_football_weekly_nfl_team_season_day(date,integer,timestamptz)
  from public,anon,authenticated;

create or replace function private.football_weekly_nfl_team_season_collection_rows(
  p_week_start date
)
returns table(
  profile_id uuid,
  item_reference text,
  winning_bid integer,
  acquisition text
)
language sql
stable security definer
set search_path=''
as $$
  with normal_owned as (
    select
      award.profile_id,
      board.season_reference as item_reference,
      award.winning_bid,
      'normal'::text as acquisition
    from private.football_weekly_auction_awards award
    join private.football_weekly_auction_board board
      on board.week_start=award.week_start
     and board.day_index=award.day_index
     and board.slot=award.slot
    where award.week_start=p_week_start
      and award.day_index between 1 and 6
      and award.profile_id is not null
      and not exists(
        select 1
        from private.football_weekly_nfl_team_season_wildcard_claims claim
        where claim.week_start=p_week_start
          and claim.profile_id=award.profile_id
          and claim.replaced_item_reference=board.season_reference
      )
  ),
  wildcard_owned as (
    select
      claim.profile_id,
      claim.item_reference,
      0::integer as winning_bid,
      'wildcard'::text as acquisition
    from private.football_weekly_nfl_team_season_wildcard_claims claim
    where claim.week_start=p_week_start
  ),
  autofill_owned as (
    select
      fill.profile_id,
      fill.item_reference,
      0::integer as winning_bid,
      'autofill'::text as acquisition
    from private.football_weekly_nfl_team_season_autofill fill
    where fill.week_start=p_week_start
  )
  select * from normal_owned
  union all select * from wildcard_owned
  union all select * from autofill_owned;
$$;
revoke all on function private.football_weekly_nfl_team_season_collection_rows(date)
  from public,anon,authenticated;

create or replace function private.finalize_football_weekly_nfl_team_season_week(
  p_week_start date,p_at timestamptz default now()
)
returns void
language plpgsql
security definer
set search_path=''
as $$
begin
  if exists(
    select 1 from private.football_weekly_auction_weeks
    where week_start=p_week_start and finalized_at is not null
  ) then return; end if;

  if not exists(
    select 1
    from private.football_weekly_nfl_team_season_wildcard_resolutions resolution
    where resolution.week_start=p_week_start
  ) then return; end if;

  if exists(
    select 1
    from private.football_weekly_auction_participants participant
    where participant.week_start=p_week_start
      and (
        select count(*)
        from private.football_weekly_nfl_team_season_collection_rows(p_week_start) owned
        where owned.profile_id=participant.profile_id
      )<4
  ) then
    raise exception 'NFL team-season completion contract failed before final scoring';
  end if;

  delete from private.football_weekly_auction_results
  where week_start=p_week_start;

  insert into private.football_weekly_auction_results(
    week_start,profile_id,owned_count,final_score,scoring_cost,scoring_refs,tie_random
  )
  with owned as (
    select
      collection.profile_id,
      collection.item_reference,
      collection.winning_bid,
      item.hidden_grade,
      row_number() over(
        partition by collection.profile_id
        order by item.hidden_grade desc,collection.winning_bid asc,collection.item_reference
      ) as scoring_order
    from private.football_weekly_nfl_team_season_collection_rows(p_week_start) collection
    join private.football_weekly_auction_items item
      on item.item_reference=collection.item_reference
  ),
  summarized as (
    select
      participant.profile_id,
      count(owned.item_reference)::integer as owned_count,
      round(avg(owned.hidden_grade) filter(where owned.scoring_order<=4),2) as final_score,
      coalesce(sum(owned.winning_bid) filter(where owned.scoring_order<=4),0)::integer as scoring_cost,
      coalesce(
        array_agg(owned.item_reference order by owned.scoring_order)
          filter(where owned.scoring_order<=4),
        array[]::text[]
      ) as scoring_refs
    from private.football_weekly_auction_participants participant
    left join owned on owned.profile_id=participant.profile_id
    where participant.week_start=p_week_start
    group by participant.profile_id
  )
  select
    p_week_start,profile_id,owned_count,final_score,scoring_cost,scoring_refs,random()
  from summarized;

  with ranked as (
    select
      profile_id,
      row_number() over(
        order by final_score desc,scoring_cost asc,tie_random,profile_id
      )::integer as final_rank
    from private.football_weekly_auction_results
    where week_start=p_week_start
  )
  update private.football_weekly_auction_results result
  set final_rank=ranked.final_rank,
      is_winner=ranked.final_rank=1
  from ranked
  where result.week_start=p_week_start
    and result.profile_id=ranked.profile_id;

  update private.football_weekly_auction_weeks
  set finalized_at=p_at
  where week_start=p_week_start;
end;
$$;
revoke all on function private.finalize_football_weekly_nfl_team_season_week(date,timestamptz)
  from public,anon,authenticated;

create or replace function private.football_weekly_nfl_team_season_final_payload(
  p_week_start date,p_profile_id uuid
)
returns jsonb
language plpgsql
stable security definer
set search_path=''
as $$
declare
  v_standings jsonb;
  v_collections jsonb;
  v_collection jsonb;
  v_all_teams jsonb;
  v_mine jsonb;
  v_wildcard jsonb;
begin
  select coalesce(jsonb_agg(jsonb_build_object(
    'rank',result.final_rank,
    'profile_id',result.profile_id,
    'display_name',profile.display_name,
    'final_score',result.final_score,
    'scoring_cost',result.scoring_cost,
    'owned_count',result.owned_count,
    'is_winner',result.is_winner,
    'is_current_user',result.profile_id=p_profile_id
  ) order by result.final_rank,profile.display_name),'[]'::jsonb)
  into v_standings
  from private.football_weekly_auction_results result
  join public.profiles profile on profile.id=result.profile_id
  where result.week_start=p_week_start;

  with enriched as (
    select
      owned.profile_id,
      profile.display_name,
      owned.item_reference,
      item.primary_name as team_name,
      item.team_code,
      item.season_year,
      item.display_label,
      item.hidden_grade as grade,
      owned.winning_bid,
      owned.acquisition,
      result.scoring_refs
    from private.football_weekly_nfl_team_season_collection_rows(p_week_start) owned
    join private.football_weekly_auction_items item on item.item_reference=owned.item_reference
    join public.profiles profile on profile.id=owned.profile_id
    join private.football_weekly_auction_results result
      on result.week_start=p_week_start and result.profile_id=owned.profile_id
  ),
  grouped as (
    select
      profile_id,
      display_name,
      jsonb_agg(jsonb_build_object(
        'item_reference',item_reference,
        'team_name',team_name,
        'team_code',team_code,
        'season_year',season_year,
        'display_label',display_label,
        'grade',grade,
        'winning_bid',winning_bid,
        'acquisition',acquisition,
        'counts',item_reference=any(scoring_refs)
      ) order by grade desc,winning_bid,item_reference) as items
    from enriched
    group by profile_id,display_name
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'profile_id',profile_id,
    'display_name',display_name,
    'items',items
  ) order by display_name),'[]'::jsonb)
  into v_collections
  from grouped;

  select coalesce(entry.value->'items','[]'::jsonb)
  into v_collection
  from jsonb_array_elements(v_collections) as entry(value)
  where entry.value->>'profile_id'=p_profile_id::text
  limit 1;
  v_collection:=coalesce(v_collection,'[]'::jsonb);

  with normal as (
    select
      board.day_index,
      board.slot,
      board.theme,
      board.season_reference as item_reference,
      item.primary_name as team_name,
      item.team_code,
      item.season_year,
      item.display_label,
      item.hidden_grade as grade,
      award.winning_bid,
      award.profile_id as auction_winner_profile_id,
      winner.display_name as auction_winner_display_name,
      case
        when claim.replaced_item_reference is not null then null
        else coalesce(award.profile_id,fill.profile_id)
      end as final_owner_profile_id,
      case
        when claim.replaced_item_reference is not null then null
        else coalesce(winner.display_name,fill_profile.display_name)
      end as final_owner_display_name,
      case when fill.profile_id is not null then 'autofill' else 'normal' end as acquisition,
      claim.replaced_item_reference is not null as was_replaced
    from private.football_weekly_auction_board board
    join private.football_weekly_auction_items item on item.item_reference=board.season_reference
    left join private.football_weekly_auction_awards award
      on award.week_start=board.week_start and award.day_index=board.day_index and award.slot=board.slot
    left join public.profiles winner on winner.id=award.profile_id
    left join private.football_weekly_nfl_team_season_autofill fill
      on fill.week_start=board.week_start and fill.item_reference=board.season_reference
    left join public.profiles fill_profile on fill_profile.id=fill.profile_id
    left join private.football_weekly_nfl_team_season_wildcard_claims claim
      on claim.week_start=board.week_start
     and claim.profile_id=award.profile_id
     and claim.replaced_item_reference=board.season_reference
    where board.week_start=p_week_start and board.day_index between 1 and 6
  ),
  wildcard as (
    select
      7 as day_index,
      board.slot,
      'Wildcard'::text as theme,
      board.item_reference,
      item.primary_name as team_name,
      item.team_code,
      item.season_year,
      item.display_label,
      item.hidden_grade as grade,
      0::integer as winning_bid,
      claim.profile_id as auction_winner_profile_id,
      profile.display_name as auction_winner_display_name,
      claim.profile_id as final_owner_profile_id,
      profile.display_name as final_owner_display_name,
      'wildcard'::text as acquisition,
      false as was_replaced
    from private.football_weekly_nfl_team_season_wildcard_board board
    join private.football_weekly_auction_items item on item.item_reference=board.item_reference
    left join private.football_weekly_nfl_team_season_wildcard_claims claim
      on claim.week_start=board.week_start and claim.item_reference=board.item_reference
    left join public.profiles profile on profile.id=claim.profile_id
    where board.week_start=p_week_start
  ),
  combined as (
    select * from normal
    union all
    select * from wildcard
  )
  select coalesce(jsonb_agg(to_jsonb(combined) order by day_index,slot),'[]'::jsonb)
  into v_all_teams
  from combined;

  select to_jsonb(result) into v_mine
  from private.football_weekly_auction_results result
  where result.week_start=p_week_start and result.profile_id=p_profile_id;

  v_wildcard:=private.football_weekly_nfl_team_season_wildcard_state(
    p_week_start,p_profile_id,
    ((p_week_start+6)::date+time '12:00') at time zone 'America/Chicago'
  );

  return jsonb_build_object(
    'subject_key','nfl-best-team-seasons-since-2000',
    'week_start',p_week_start,
    'standings',v_standings,
    'collections',v_collections,
    'collection',v_collection,
    'all_teams',v_all_teams,
    'wildcard',v_wildcard,
    'my_result',coalesce(v_mine,'{}'::jsonb)
  );
end;
$$;
revoke all on function private.football_weekly_nfl_team_season_final_payload(date,uuid)
  from public,anon,authenticated;

create or replace function private.get_football_weekly_nfl_team_season_state(
  p_week_start date,p_profile_id uuid,p_at timestamptz
)
returns jsonb
language plpgsql
stable security definer
set search_path=''
as $$
declare
  v_day integer;
  v_starting integer;
  v_spent integer;
  v_bankroll integer;
  v_owned integer;
  v_submitted boolean;
  v_show_intro boolean;
  v_theme text;
  v_cards jsonb:='[]'::jsonb;
  v_bids jsonb:='{}'::jsonb;
  v_prior_results jsonb:='[]'::jsonb;
  v_collection jsonb:='[]'::jsonb;
  v_wildcard jsonb:=null;
begin
  v_day:=private.football_weekly_auction_day_index(p_at,p_week_start);

  if not exists(
    select 1 from private.football_weekly_auction_participants participant
    where participant.week_start=p_week_start and participant.profile_id=p_profile_id
  ) then
    return jsonb_build_object(
      'available',false,
      'subject_key','nfl-best-team-seasons-since-2000',
      'locked_this_week',true,
      'week_start',p_week_start,
      'eligible_week_start',p_week_start+7
    );
  end if;

  v_starting:=private.football_weekly_auction_starting_bankroll(
    p_week_start,p_profile_id,50
  );

  select
    coalesce(sum(award.winning_bid),0)::integer,
    count(*)::integer
  into v_spent,v_owned
  from private.football_weekly_auction_awards award
  where award.week_start=p_week_start
    and award.profile_id=p_profile_id
    and award.day_index between 1 and 6;

  v_bankroll:=greatest(v_starting-v_spent,0);

  select not exists(
    select 1 from private.football_weekly_auction_daily_entries entry
    where entry.week_start=p_week_start and entry.profile_id=p_profile_id
  ) and not exists(
    select 1
    from private.football_weekly_nfl_team_season_wildcard_submissions submission
    where submission.week_start=p_week_start and submission.profile_id=p_profile_id
  ) into v_show_intro;

  if v_day between 1 and 6 then
    select min(board.theme),
      coalesce(jsonb_agg(jsonb_build_object(
        'slot',board.slot,
        'item_reference',item.item_reference,
        'team_name',item.primary_name,
        'team_code',item.team_code,
        'season_year',item.season_year,
        'display_label',item.display_label,
        'record',item.grading_inputs->>'record',
        'postseason_finish',item.grading_inputs->>'postseason_finish',
        'card_tag',item.grading_inputs->>'card_tag',
        'lock_at',board.lock_at
      ) order by board.slot),'[]'::jsonb)
    into v_theme,v_cards
    from private.football_weekly_auction_board board
    join private.football_weekly_auction_items item on item.item_reference=board.season_reference
    where board.week_start=p_week_start and board.day_index=v_day;

    select exists(
      select 1 from private.football_weekly_auction_daily_entries entry
      where entry.week_start=p_week_start and entry.day_index=v_day and entry.profile_id=p_profile_id
    ) into v_submitted;

    select coalesce(jsonb_object_agg(bid.slot::text,bid.amount),'{}'::jsonb)
    into v_bids
    from private.football_weekly_auction_bids bid
    where bid.week_start=p_week_start and bid.day_index=v_day and bid.profile_id=p_profile_id;
  else
    v_theme:='Wildcard';
    v_wildcard:=private.football_weekly_nfl_team_season_wildcard_state(
      p_week_start,p_profile_id,p_at
    );
    v_submitted:=coalesce((v_wildcard->>'submitted')::boolean,false);
  end if;

  if v_day>1 then
    with target as (
      select least(v_day-1,6) as day_index
    )
    select coalesce(jsonb_agg(result_row.payload order by result_row.slot),'[]'::jsonb)
    into v_prior_results
    from (
      select
        board.slot,
        jsonb_build_object(
          'slot',board.slot,
          'item_reference',item.item_reference,
          'team_name',item.primary_name,
          'team_code',item.team_code,
          'season_year',item.season_year,
          'display_label',item.display_label,
          'record',item.grading_inputs->>'record',
          'postseason_finish',item.grading_inputs->>'postseason_finish',
          'winning_bid',award.winning_bid,
          'winner_profile_id',award.profile_id,
          'winner_display_name',winner.display_name,
          'bids',coalesce((
            select jsonb_agg(jsonb_build_object(
              'profile_id',entry.profile_id,
              'display_name',bidder.display_name,
              'amount',coalesce(bid.amount,0)
            ) order by coalesce(bid.amount,0) desc,bidder.display_name)
            from private.football_weekly_auction_daily_entries entry
            join public.profiles bidder on bidder.id=entry.profile_id
            left join private.football_weekly_auction_bids bid
              on bid.week_start=entry.week_start
             and bid.day_index=entry.day_index
             and bid.profile_id=entry.profile_id
             and bid.slot=board.slot
            where entry.week_start=p_week_start
              and entry.day_index=(select day_index from target)
          ),'[]'::jsonb)
        ) as payload
      from private.football_weekly_auction_board board
      join private.football_weekly_auction_items item on item.item_reference=board.season_reference
      join private.football_weekly_auction_awards award
        on award.week_start=board.week_start and award.day_index=board.day_index and award.slot=board.slot
      left join public.profiles winner on winner.id=award.profile_id
      where board.week_start=p_week_start
        and board.day_index=(select day_index from target)
    ) result_row;
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'item_reference',item.item_reference,
    'team_name',item.primary_name,
    'team_code',item.team_code,
    'season_year',item.season_year,
    'display_label',item.display_label,
    'record',item.grading_inputs->>'record',
    'postseason_finish',item.grading_inputs->>'postseason_finish',
    'winning_bid',award.winning_bid
  ) order by award.day_index,award.slot),'[]'::jsonb)
  into v_collection
  from private.football_weekly_auction_awards award
  join private.football_weekly_auction_board board
    on board.week_start=award.week_start and board.day_index=award.day_index and board.slot=award.slot
  join private.football_weekly_auction_items item on item.item_reference=board.season_reference
  where award.week_start=p_week_start
    and award.profile_id=p_profile_id
    and award.day_index between 1 and 6;

  return jsonb_build_object(
    'available',true,
    'subject_key','nfl-best-team-seasons-since-2000',
    'week_start',p_week_start,
    'week_end',p_week_start+6,
    'day_index',v_day,
    'phase',case when v_day=7 then 'wildcard' else 'normal' end,
    'starting_bankroll',v_starting,
    'bankroll',v_bankroll,
    'owned_count',v_owned,
    'reserve_floor',0,
    'max_commit',v_bankroll,
    'submitted_today',v_submitted,
    'show_intro',v_show_intro,
    'theme',v_theme,
    'teams',v_cards,
    'bids',v_bids,
    'prior_results',v_prior_results,
    'collection',v_collection,
    'wildcard',v_wildcard,
    'previous_final',null
  );
end;
$$;
revoke all on function private.get_football_weekly_nfl_team_season_state(date,uuid,timestamptz)
  from public,anon,authenticated;

create or replace function private.get_my_football_weekly_nfl_team_season(
  p_at timestamptz default now()
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_profile uuid:=auth.uid();
  v_week_start date;
  v_previous_week date;
  v_state jsonb;
  v_previous_final jsonb:=null;
begin
  if v_profile is null then raise exception 'sign in required'; end if;

  perform private.maintain_football_weekly_auction(p_at);
  v_week_start:=private.football_weekly_auction_week_start(p_at);
  v_previous_week:=v_week_start-7;

  if private.football_weekly_auction_day_index(p_at,v_week_start)=7 then
    perform private.materialize_football_weekly_nfl_team_season_wildcard(v_week_start);
  end if;

  v_state:=private.get_football_weekly_nfl_team_season_state(
    v_week_start,v_profile,p_at
  );

  if exists(
    select 1 from private.football_weekly_auction_results result
    where result.week_start=v_previous_week and result.profile_id=v_profile
  ) and not exists(
    select 1 from private.football_weekly_auction_final_views view_row
    where view_row.week_start=v_previous_week and view_row.profile_id=v_profile
  ) then
    v_previous_final:=private.football_weekly_auction_final_payload(v_previous_week,v_profile);
  end if;

  return v_state || jsonb_build_object('previous_final',v_previous_final);
end;
$$;
revoke all on function private.get_my_football_weekly_nfl_team_season(timestamptz)
  from public,anon,authenticated;

create or replace function private.submit_my_football_weekly_nfl_team_season_bids(
  p_bids jsonb,p_at timestamptz default now()
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_profile uuid:=auth.uid();
  v_week_start date;
  v_day integer;
begin
  if v_profile is null then raise exception 'sign in required'; end if;
  perform private.maintain_football_weekly_auction(p_at);
  v_week_start:=private.football_weekly_auction_week_start(p_at);
  v_day:=private.football_weekly_auction_day_index(p_at,v_week_start);

  perform private.submit_football_weekly_nfl_team_season_bids_for_profile(
    v_week_start,v_day,v_profile,p_bids,p_at
  );

  return private.get_my_football_weekly_nfl_team_season(p_at);
end;
$$;
revoke all on function private.submit_my_football_weekly_nfl_team_season_bids(jsonb,timestamptz)
  from public,anon,authenticated;

-- Route the shared lifecycle by subject.
create or replace function private.materialize_football_weekly_auction_week(p_week_start date)
returns void
language plpgsql
security definer
set search_path=''
as $$
declare v_subject text;
begin
  if p_week_start<date '2026-09-15' then return; end if;
  if extract(isodow from p_week_start)<>2 then
    raise exception 'Football Weekly Auction week must start Tuesday';
  end if;

  select subject_key into v_subject
  from private.football_weekly_auction_weeks
  where week_start=p_week_start;

  if v_subject is null then
    v_subject:=private.football_weekly_auction_subject_for_week(p_week_start);
    if v_subject is null then raise exception 'Football Weekly Auction has no eligible subject'; end if;
    insert into private.football_weekly_auction_weeks(week_start,subject_key)
    values(p_week_start,v_subject)
    on conflict(week_start) do nothing;
    select subject_key into v_subject
    from private.football_weekly_auction_weeks
    where week_start=p_week_start;
  end if;

  if v_subject='nfl-best-team-seasons-since-2000' then
    perform private.materialize_football_weekly_nfl_team_season_week(p_week_start);
  elsif v_subject='cfb-superteam' then
    perform private.materialize_football_weekly_superteam_week(p_week_start);
  elsif v_subject='nfl-build-qb' then
    perform private.materialize_football_weekly_build_qb_week(p_week_start);
  else
    perform private.materialize_football_weekly_auction_week_cfb(p_week_start);
  end if;
end;
$$;
revoke all on function private.materialize_football_weekly_auction_week(date)
  from public,anon,authenticated;

create or replace function private.resolve_football_weekly_auction_day(
  p_week_start date,p_day_index integer,p_at timestamptz default now()
)
returns void
language plpgsql
security definer
set search_path=''
as $$
declare v_subject text;
begin
  select subject_key into v_subject
  from private.football_weekly_auction_weeks
  where week_start=p_week_start;

  if v_subject='nfl-best-team-seasons-since-2000' then
    perform private.resolve_football_weekly_nfl_team_season_day(p_week_start,p_day_index,p_at);
  elsif v_subject='cfb-superteam' then
    perform private.resolve_football_weekly_superteam_day(p_week_start,p_day_index,p_at);
  elsif v_subject='nfl-build-qb' then
    perform private.resolve_football_weekly_build_qb_day(p_week_start,p_day_index,p_at);
  else
    perform private.resolve_football_weekly_auction_day_cfb(p_week_start,p_day_index,p_at);
  end if;
end;
$$;
revoke all on function private.resolve_football_weekly_auction_day(date,integer,timestamptz)
  from public,anon,authenticated;

create or replace function private.finalize_football_weekly_auction_week(
  p_week_start date,p_at timestamptz default now()
)
returns void
language plpgsql
security definer
set search_path=''
as $$
declare v_subject text;
begin
  select subject_key into v_subject
  from private.football_weekly_auction_weeks
  where week_start=p_week_start;

  if v_subject='nfl-best-team-seasons-since-2000' then
    perform private.finalize_football_weekly_nfl_team_season_week(p_week_start,p_at);
  elsif v_subject='cfb-superteam' then
    perform private.finalize_football_weekly_superteam_week(p_week_start,p_at);
  elsif v_subject='nfl-build-qb' then
    perform private.finalize_football_weekly_build_qb_week(p_week_start,p_at);
  else
    perform private.finalize_football_weekly_auction_week_cfb(p_week_start,p_at);
  end if;
end;
$$;
revoke all on function private.finalize_football_weekly_auction_week(date,timestamptz)
  from public,anon,authenticated;

create or replace function private.football_weekly_auction_final_payload(
  p_week_start date,p_profile_id uuid
)
returns jsonb
language plpgsql
stable security definer
set search_path=''
as $$
declare v_subject text;
begin
  select subject_key into v_subject
  from private.football_weekly_auction_weeks
  where week_start=p_week_start;

  if v_subject='nfl-best-team-seasons-since-2000' then
    return private.football_weekly_nfl_team_season_final_payload(p_week_start,p_profile_id);
  elsif v_subject='cfb-superteam' then
    return private.football_weekly_superteam_final_payload(p_week_start,p_profile_id);
  elsif v_subject='nfl-build-qb' then
    return private.football_weekly_build_qb_final_payload(p_week_start,p_profile_id);
  end if;

  return private.football_weekly_auction_final_payload_cfb(p_week_start,p_profile_id)
    || jsonb_build_object('subject_key',coalesce(v_subject,'cfb-best-teams-since-2000'));
end;
$$;
revoke all on function private.football_weekly_auction_final_payload(date,uuid)
  from public,anon,authenticated;

create or replace function private.maintain_football_weekly_auction(
  p_at timestamptz default now()
)
returns void
language plpgsql
security definer
set search_path=''
as $$
declare
  v_week_start date;
  v_subject text;
  v_day_index integer;
  v_join_lock_at timestamptz;
  v_due record;
  v_week record;
  v_day integer;
  v_wc_lock timestamptz;
begin
  if (p_at at time zone 'America/Chicago')::date<date '2026-09-15' then return; end if;

  v_week_start:=private.football_weekly_auction_week_start(p_at);
  perform private.materialize_football_weekly_auction_week(v_week_start);
  perform private.materialize_football_weekly_auction_participants(v_week_start);

  select subject_key into v_subject
  from private.football_weekly_auction_weeks
  where week_start=v_week_start;

  -- Keep every unresolved production NFL week complete even if nobody opened
  -- the app on a particular day. Hidden future supply becomes exposed only once
  -- its day boundary has actually arrived.
  for v_week in
    select week.week_start
    from private.football_weekly_auction_weeks week
    where week.subject_key='nfl-best-team-seasons-since-2000'
      and week.week_start>=date '2026-09-15'
      and week.finalized_at is null
      and week.week_start<=v_week_start
    order by week.week_start
  loop
    for v_day in 1..6 loop
      if p_at>=((v_week.week_start+(v_day-1))::timestamp at time zone 'America/Chicago') then
        perform private.materialize_football_weekly_nfl_team_season_day(
          v_week.week_start,v_day,p_at
        );
      end if;
    end loop;

    if p_at>=((v_week.week_start+6)::timestamp at time zone 'America/Chicago') then
      perform private.materialize_football_weekly_nfl_team_season_wildcard(v_week.week_start);
    end if;
  end loop;

  select min(board.lock_at) into v_join_lock_at
  from private.football_weekly_auction_board board
  where board.week_start=v_week_start
    and board.day_index=case when v_subject='cfb-superteam' then 4 else 1 end;

  if v_join_lock_at is null then
    raise exception 'Weekly Auction join boundary is incomplete';
  end if;

  if p_at>=v_join_lock_at then
    update private.football_weekly_auction_weeks week
    set field_locked_at=coalesce(week.field_locked_at,v_join_lock_at)
    where week.week_start=v_week_start;
  end if;

  for v_due in
    select board.week_start,board.day_index
    from private.football_weekly_auction_board board
    where not exists(
      select 1
      from private.football_weekly_superteam_lab_runs lab
      where lab.lab_week_start=board.week_start
    )
    group by board.week_start,board.day_index
    having min(board.lock_at)<=p_at
       and (
         select count(*)
         from private.football_weekly_auction_awards award
         where award.week_start=board.week_start
           and award.day_index=board.day_index
       )<private.football_weekly_auction_cards_for_day(board.week_start,board.day_index)
    order by board.week_start,board.day_index
  loop
    perform private.resolve_football_weekly_auction_day(
      v_due.week_start,v_due.day_index,p_at
    );
  end loop;

  for v_week in
    select week.week_start
    from private.football_weekly_auction_weeks week
    where week.subject_key='nfl-best-team-seasons-since-2000'
      and week.week_start>=date '2026-09-15'
      and week.finalized_at is null
      and exists(
        select 1
        from private.football_weekly_nfl_team_season_wildcard_board wildcard
        where wildcard.week_start=week.week_start
        having max(wildcard.lock_at)<=p_at
      )
    order by week.week_start
  loop
    select max(wildcard.lock_at) into v_wc_lock
    from private.football_weekly_nfl_team_season_wildcard_board wildcard
    where wildcard.week_start=v_week.week_start;

    perform private.resolve_football_weekly_nfl_team_season_wildcard(
      v_week.week_start,greatest(p_at,v_wc_lock)
    );
    perform private.finalize_football_weekly_nfl_team_season_week(
      v_week.week_start,greatest(p_at,v_wc_lock)
    );
  end loop;

  for v_week in
    select week.week_start
    from private.football_weekly_auction_weeks week
    where week.finalized_at is null
      and week.subject_key<>'nfl-best-team-seasons-since-2000'
      and not exists(
        select 1
        from private.football_weekly_superteam_lab_runs lab
        where lab.lab_week_start=week.week_start
      )
      and (
        select count(*)
        from private.football_weekly_auction_awards award
        where award.week_start=week.week_start
      )=private.football_weekly_auction_cards_per_week(week.week_start)
  loop
    perform private.finalize_football_weekly_auction_week(v_week.week_start,p_at);
  end loop;
end;
$$;
revoke all on function private.maintain_football_weekly_auction(timestamptz)
  from public,anon,authenticated;

create or replace function public.get_my_football_weekly_auction(
  p_at timestamptz default now()
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_profile uuid:=auth.uid();
  v_week_start date;
  v_subject text;
begin
  if v_profile is null then raise exception 'sign in required'; end if;

  perform private.maintain_football_weekly_auction(p_at);
  v_week_start:=private.football_weekly_auction_week_start(p_at);
  perform private.ensure_football_weekly_auction_participant(v_week_start,v_profile,p_at);

  select subject_key into v_subject
  from private.football_weekly_auction_weeks
  where week_start=v_week_start;

  if v_subject='nfl-best-team-seasons-since-2000' then
    return private.get_my_football_weekly_nfl_team_season(p_at);
  elsif v_subject='cfb-superteam' then
    return private.get_my_football_weekly_superteam(p_at);
  elsif v_subject='nfl-build-qb' then
    return private.get_my_football_weekly_build_qb(p_at);
  end if;

  return private.get_my_football_weekly_auction_cfb(p_at)
    || jsonb_build_object('subject_key',coalesce(v_subject,'cfb-best-teams-since-2000'));
end;
$$;
revoke all on function public.get_my_football_weekly_auction(timestamptz)
  from public,anon;
grant execute on function public.get_my_football_weekly_auction(timestamptz)
  to authenticated;

create or replace function public.submit_my_football_weekly_auction_bids(
  p_bids jsonb,p_at timestamptz default now()
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_profile uuid:=auth.uid();
  v_week_start date;
  v_subject text;
begin
  if v_profile is null then raise exception 'sign in required'; end if;

  perform private.maintain_football_weekly_auction(p_at);
  v_week_start:=private.football_weekly_auction_week_start(p_at);
  perform private.ensure_football_weekly_auction_participant(v_week_start,v_profile,p_at);

  select subject_key into v_subject
  from private.football_weekly_auction_weeks
  where week_start=v_week_start;

  if v_subject='nfl-best-team-seasons-since-2000' then
    return private.submit_my_football_weekly_nfl_team_season_bids(p_bids,p_at);
  elsif v_subject='cfb-superteam' then
    return private.submit_my_football_weekly_superteam_bids(p_bids,p_at);
  elsif v_subject='nfl-build-qb' then
    return private.submit_my_football_weekly_build_qb_bids(p_bids,p_at);
  end if;

  return private.submit_my_football_weekly_auction_bids_cfb(p_bids,p_at);
end;
$$;
revoke all on function public.submit_my_football_weekly_auction_bids(jsonb,timestamptz)
  from public,anon;
grant execute on function public.submit_my_football_weekly_auction_bids(jsonb,timestamptz)
  to authenticated;

-- Reaping follows the player into the next calendar Weekly Auction regardless
-- of which subject rotates next. Patch the existing subject getters/submission
-- functions to use the shared starting-bankroll adjustment without changing
-- any subject's normal default bankroll.
do $apply_shared_reaping_bankroll$
declare
  d text;
  n text;
begin
  d:=pg_get_functiondef('private.get_my_football_weekly_auction_cfb(timestamptz)'::regprocedure);
  n:=replace(d,'40 - coalesce(sum(award.winning_bid),0)::integer',
    'private.football_weekly_auction_starting_bankroll(v_week_start,v_profile,40) - coalesce(sum(award.winning_bid),0)::integer');
  if n=d then raise exception 'CFB Weekly getter bankroll patch drifted'; end if;
  execute n;

  d:=pg_get_functiondef('private.submit_my_football_weekly_auction_bids_cfb(jsonb,timestamptz)'::regprocedure);
  n:=replace(d,'40 - coalesce(sum(award.winning_bid),0)::integer',
    'private.football_weekly_auction_starting_bankroll(v_week_start,v_profile,40) - coalesce(sum(award.winning_bid),0)::integer');
  if n=d then raise exception 'CFB Weekly submit bankroll patch drifted'; end if;
  execute n;

  d:=pg_get_functiondef('private.get_my_football_weekly_build_qb(timestamptz)'::regprocedure);
  n:=replace(d,'40-coalesce(sum(award.winning_bid),0)::integer',
    'private.football_weekly_auction_starting_bankroll(v_week_start,v_profile,40)-coalesce(sum(award.winning_bid),0)::integer');
  if n=d then raise exception 'Build a QB getter bankroll patch drifted'; end if;
  execute n;

  d:=pg_get_functiondef('private.submit_my_football_weekly_build_qb_bids(jsonb,timestamptz)'::regprocedure);
  n:=replace(d,'40-coalesce(sum(award.winning_bid),0)::integer',
    'private.football_weekly_auction_starting_bankroll(v_week_start,v_profile,40)-coalesce(sum(award.winning_bid),0)::integer');
  if n=d then raise exception 'Build a QB submit bankroll patch drifted'; end if;
  execute n;

  d:=pg_get_functiondef('private.get_my_football_weekly_superteam(timestamptz)'::regprocedure);
  n:=replace(d,'50-coalesce(sum(award.winning_bid),0)::integer',
    'private.football_weekly_auction_starting_bankroll(v_week_start,v_profile,50)-coalesce(sum(award.winning_bid),0)::integer');
  if n=d then raise exception 'CFB Superteam getter bankroll patch drifted'; end if;
  execute n;

  d:=pg_get_functiondef('private.submit_football_weekly_superteam_bids_for_profile(date,integer,uuid,jsonb,timestamptz)'::regprocedure);
  n:=replace(d,'50-coalesce(sum(award.winning_bid),0)::integer',
    'private.football_weekly_auction_starting_bankroll(p_week_start,p_profile_id,50)-coalesce(sum(award.winning_bid),0)::integer');
  if n=d then raise exception 'CFB Superteam submit bankroll patch drifted'; end if;
  execute n;
end
$apply_shared_reaping_bankroll$;

-- Runtime contracts: no hidden-grade leakage is asserted in frontend/RPC tests;
-- these database checks lock the canonical population and rotation authority.
do $nfl_team_season_runtime_contract$
declare
  v_count integer;
begin
  select count(*)::integer into v_count
  from private.nfl_best_team_seasons_v1_authority;
  if v_count<>200 then
    raise exception 'NFL team-season authority must contain exactly 200 seasons';
  end if;

  if (
    select min(hidden_grade) from private.nfl_best_team_seasons_v1_authority
  )<>74.0 or (
    select max(hidden_grade) from private.nfl_best_team_seasons_v1_authority
  )<>100.0 then
    raise exception 'NFL team-season authority grade range drifted';
  end if;

  if (select hidden_grade from private.nfl_best_team_seasons_v1_authority where item_reference='nfl-best-ne-2007')<>100.0
    or (select hidden_grade from private.nfl_best_team_seasons_v1_authority where item_reference='nfl-best-sea-2013')<>99.0
    or (select hidden_grade from private.nfl_best_team_seasons_v1_authority where item_reference='nfl-best-sea-2010')<>74.0
  then
    raise exception 'NFL team-season anchor grades drifted';
  end if;

  if private.football_weekly_nfl_team_season_cards_for_field(3)<>3
    or private.football_weekly_nfl_team_season_cards_for_field(4)<>3
    or private.football_weekly_nfl_team_season_cards_for_field(5)<>4
    or private.football_weekly_nfl_team_season_cards_for_field(6)<>5
    or private.football_weekly_nfl_team_season_cards_for_field(7)<>6
    or private.football_weekly_nfl_team_season_cards_for_field(8)<>7
  then
    raise exception 'NFL team-season elastic supply contract drifted';
  end if;

  if private.football_weekly_auction_subject_for_week(date '2026-10-06')
    <>'nfl-best-team-seasons-since-2000'
  then
    raise exception 'NFL team-season rotation slot drifted';
  end if;
end
$nfl_team_season_runtime_contract$;
