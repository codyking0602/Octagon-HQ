-- Runtime integration for Best NFL Team-Seasons Since 2000 Weekly Auction.
-- Uses the shared Weekly Auction tables/lifecycle and the separately-audited Day 7 engine.
-- Days 1-6 are sealed-bid normal auctions. Day 7 is Wildcard/Reaping only.

create table if not exists private.nfl_best_team_seasons_v1_authority (
  item_reference text primary key,
  season_year integer not null check (season_year between 2000 and 2025),
  franchise_id text not null,
  team_name text not null,
  display_label text not null,
  record text not null,
  postseason_finish text not null,
  card_tag text not null,
  conference text not null check (conference in ('AFC','NFC')),
  division text not null,
  super_bowl_champion boolean not null,
  fell_short boolean not null,
  hidden_grade numeric(4,1) not null check (
    hidden_grade between 74 and 100
    and hidden_grade*2=trunc(hidden_grade*2)
  )
);
revoke all on private.nfl_best_team_seasons_v1_authority from public,anon,authenticated;

alter table private.football_weekly_auction_items
  add column if not exists grading_inputs jsonb not null default '{}'::jsonb,
  drop constraint if exists football_weekly_auction_items_hidden_grade_check,
  add constraint football_weekly_auction_items_hidden_grade_check check (
    hidden_grade between 70.0 and 100.0
    and hidden_grade * 2 = trunc(hidden_grade * 2)
  );

insert into private.nfl_best_team_seasons_v1_authority(
  item_reference,season_year,franchise_id,team_name,display_label,record,
  postseason_finish,card_tag,conference,division,super_bowl_champion,fell_short,hidden_grade
) values
('nfl-best-bal-2000',2000,'BAL','Baltimore Ravens','Baltimore Ravens · 2000','12-4','Super Bowl Champion','12-4 · Super Bowl Champion','AFC','AFC North',true,false,98.0),
('nfl-best-lar-2000',2000,'LAR','St. Louis Rams','St. Louis Rams · 2000','10-6','Playoff Team','10-6 · Playoff Team','NFC','NFC West',false,false,82.0),
('nfl-best-lv-2000',2000,'LV','Oakland Raiders','Oakland Raiders · 2000','12-4','Conference Championship Game','12-4 · Conference Championship Game','AFC','AFC West',false,true,91.5),
('nfl-best-min-2000',2000,'MIN','Minnesota Vikings','Minnesota Vikings · 2000','11-5','Conference Championship Game','11-5 · Conference Championship Game','NFC','NFC North',false,true,83.5),
('nfl-best-nyg-2000',2000,'NYG','New York Giants','New York Giants · 2000','12-4','Super Bowl Runner-Up','12-4 · Super Bowl Runner-Up','NFC','NFC East',false,true,90.5),
('nfl-best-ten-2000',2000,'TEN','Tennessee Titans','Tennessee Titans · 2000','13-3','Playoff Team','13-3 · Playoff Team','AFC','AFC South',false,true,90.5),
('nfl-best-chi-2001',2001,'CHI','Chicago Bears','Chicago Bears · 2001','13-3','Playoff Team','13-3 · Playoff Team','NFC','NFC North',false,true,90.0),
('nfl-best-lar-2001',2001,'LAR','St. Louis Rams','St. Louis Rams · 2001','14-2','Super Bowl Runner-Up','14-2 · Super Bowl Runner-Up','NFC','NFC West',false,true,97.0),
('nfl-best-lv-2001',2001,'LV','Oakland Raiders','Oakland Raiders · 2001','10-6','Won Playoff Game','10-6 · Won Playoff Game','AFC','AFC West',false,false,83.0),
('nfl-best-ne-2001',2001,'NE','New England Patriots','New England Patriots · 2001','11-5','Super Bowl Champion','11-5 · Super Bowl Champion','AFC','AFC East',true,false,91.5),
('nfl-best-phi-2001',2001,'PHI','Philadelphia Eagles','Philadelphia Eagles · 2001','11-5','Conference Championship Game','11-5 · Conference Championship Game','NFC','NFC East',false,true,88.5),
('nfl-best-pit-2001',2001,'PIT','Pittsburgh Steelers','Pittsburgh Steelers · 2001','13-3','Conference Championship Game','13-3 · Conference Championship Game','AFC','AFC North',false,true,92.0),
('nfl-best-atl-2002',2002,'ATL','Atlanta Falcons','Atlanta Falcons · 2002','9-6-1','Won Playoff Game','9-6-1 · Won Playoff Game','NFC','NFC South',false,false,82.5),
('nfl-best-lv-2002',2002,'LV','Oakland Raiders','Oakland Raiders · 2002','11-5','Super Bowl Runner-Up','11-5 · Super Bowl Runner-Up','AFC','AFC West',false,true,90.0),
('nfl-best-phi-2002',2002,'PHI','Philadelphia Eagles','Philadelphia Eagles · 2002','12-4','Conference Championship Game','12-4 · Conference Championship Game','NFC','NFC East',false,true,91.0),
('nfl-best-sf-2002',2002,'SF','San Francisco 49ers','San Francisco 49ers · 2002','10-6','Won Playoff Game','10-6 · Won Playoff Game','NFC','NFC West',false,false,80.5),
('nfl-best-tb-2002',2002,'TB','Tampa Bay Buccaneers','Tampa Bay Buccaneers · 2002','12-4','Super Bowl Champion','12-4 · Super Bowl Champion','NFC','NFC South',true,false,97.5),
('nfl-best-ten-2002',2002,'TEN','Tennessee Titans','Tennessee Titans · 2002','11-5','Conference Championship Game','11-5 · Conference Championship Game','AFC','AFC South',false,true,84.5),
('nfl-best-car-2003',2003,'CAR','Carolina Panthers','Carolina Panthers · 2003','11-5','Super Bowl Runner-Up','11-5 · Super Bowl Runner-Up','NFC','NFC South',false,true,86.5),
('nfl-best-gb-2003',2003,'GB','Green Bay Packers','Green Bay Packers · 2003','10-6','Won Playoff Game','10-6 · Won Playoff Game','NFC','NFC North',false,false,85.0),
('nfl-best-ind-2003',2003,'IND','Indianapolis Colts','Indianapolis Colts · 2003','12-4','Conference Championship Game','12-4 · Conference Championship Game','AFC','AFC South',false,true,90.0),
('nfl-best-kc-2003',2003,'KC','Kansas City Chiefs','Kansas City Chiefs · 2003','13-3','Playoff Team','13-3 · Playoff Team','AFC','AFC West',false,true,90.5),
('nfl-best-ne-2003',2003,'NE','New England Patriots','New England Patriots · 2003','14-2','Super Bowl Champion','14-2 · Super Bowl Champion','AFC','AFC East',true,false,97.0),
('nfl-best-phi-2003',2003,'PHI','Philadelphia Eagles','Philadelphia Eagles · 2003','12-4','Conference Championship Game','12-4 · Conference Championship Game','NFC','NFC East',false,true,88.0),
('nfl-best-atl-2004',2004,'ATL','Atlanta Falcons','Atlanta Falcons · 2004','11-5','Conference Championship Game','11-5 · Conference Championship Game','NFC','NFC South',false,true,84.0),
('nfl-best-ind-2004',2004,'IND','Indianapolis Colts','Indianapolis Colts · 2004','12-4','Won Playoff Game','12-4 · Won Playoff Game','AFC','AFC South',false,true,90.0),
('nfl-best-lac-2004',2004,'LAC','San Diego Chargers','San Diego Chargers · 2004','12-4','Playoff Team','12-4 · Playoff Team','AFC','AFC West',false,true,88.0),
('nfl-best-ne-2004',2004,'NE','New England Patriots','New England Patriots · 2004','14-2','Super Bowl Champion','14-2 · Super Bowl Champion','AFC','AFC East',true,false,99.5),
('nfl-best-phi-2004',2004,'PHI','Philadelphia Eagles','Philadelphia Eagles · 2004','13-3','Super Bowl Runner-Up','13-3 · Super Bowl Runner-Up','NFC','NFC East',false,true,94.0),
('nfl-best-pit-2004',2004,'PIT','Pittsburgh Steelers','Pittsburgh Steelers · 2004','15-1','Conference Championship Game','15-1 · Conference Championship Game','AFC','AFC North',false,true,94.0),
('nfl-best-car-2005',2005,'CAR','Carolina Panthers','Carolina Panthers · 2005','11-5','Conference Championship Game','11-5 · Conference Championship Game','NFC','NFC South',false,true,88.0),
('nfl-best-den-2005',2005,'DEN','Denver Broncos','Denver Broncos · 2005','13-3','Conference Championship Game','13-3 · Conference Championship Game','AFC','AFC West',false,true,91.5),
('nfl-best-ind-2005',2005,'IND','Indianapolis Colts','Indianapolis Colts · 2005','14-2','Playoff Team','14-2 · Playoff Team','AFC','AFC South',false,true,93.5),
('nfl-best-jax-2005',2005,'JAX','Jacksonville Jaguars','Jacksonville Jaguars · 2005','12-4','Playoff Team','12-4 · Playoff Team','AFC','AFC South',false,true,86.0),
('nfl-best-nyg-2005',2005,'NYG','New York Giants','New York Giants · 2005','11-5','Playoff Team','11-5 · Playoff Team','NFC','NFC East',false,false,84.5),
('nfl-best-pit-2005',2005,'PIT','Pittsburgh Steelers','Pittsburgh Steelers · 2005','11-5','Super Bowl Champion','11-5 · Super Bowl Champion','AFC','AFC North',true,false,93.5),
('nfl-best-sea-2005',2005,'SEA','Seattle Seahawks','Seattle Seahawks · 2005','13-3','Super Bowl Runner-Up','13-3 · Super Bowl Runner-Up','NFC','NFC West',false,true,95.0),
('nfl-best-bal-2006',2006,'BAL','Baltimore Ravens','Baltimore Ravens · 2006','13-3','Playoff Team','13-3 · Playoff Team','AFC','AFC North',false,true,90.5),
('nfl-best-chi-2006',2006,'CHI','Chicago Bears','Chicago Bears · 2006','13-3','Super Bowl Runner-Up','13-3 · Super Bowl Runner-Up','NFC','NFC North',false,true,95.0),
('nfl-best-ind-2006',2006,'IND','Indianapolis Colts','Indianapolis Colts · 2006','12-4','Super Bowl Champion','12-4 · Super Bowl Champion','AFC','AFC South',true,false,93.5),
('nfl-best-lac-2006',2006,'LAC','San Diego Chargers','San Diego Chargers · 2006','14-2','Playoff Team','14-2 · Playoff Team','AFC','AFC West',false,true,93.5),
('nfl-best-ne-2006',2006,'NE','New England Patriots','New England Patriots · 2006','12-4','Conference Championship Game','12-4 · Conference Championship Game','AFC','AFC East',false,true,91.0),
('nfl-best-no-2006',2006,'NO','New Orleans Saints','New Orleans Saints · 2006','10-6','Conference Championship Game','10-6 · Conference Championship Game','NFC','NFC South',false,true,83.5),
('nfl-best-phi-2006',2006,'PHI','Philadelphia Eagles','Philadelphia Eagles · 2006','10-6','Won Playoff Game','10-6 · Won Playoff Game','NFC','NFC East',false,false,82.5),
('nfl-best-dal-2007',2007,'DAL','Dallas Cowboys','Dallas Cowboys · 2007','13-3','Playoff Team','13-3 · Playoff Team','NFC','NFC East',false,true,90.0),
('nfl-best-gb-2007',2007,'GB','Green Bay Packers','Green Bay Packers · 2007','13-3','Conference Championship Game','13-3 · Conference Championship Game','NFC','NFC North',false,true,92.5),
('nfl-best-ind-2007',2007,'IND','Indianapolis Colts','Indianapolis Colts · 2007','13-3','Playoff Team','13-3 · Playoff Team','AFC','AFC South',false,true,92.0),
('nfl-best-jax-2007',2007,'JAX','Jacksonville Jaguars','Jacksonville Jaguars · 2007','11-5','Won Playoff Game','11-5 · Won Playoff Game','AFC','AFC South',false,false,85.5),
('nfl-best-lac-2007',2007,'LAC','San Diego Chargers','San Diego Chargers · 2007','11-5','Conference Championship Game','11-5 · Conference Championship Game','AFC','AFC West',false,true,87.5),
('nfl-best-ne-2007',2007,'NE','New England Patriots','New England Patriots · 2007','16-0','Super Bowl Runner-Up','16-0 · Super Bowl Runner-Up','AFC','AFC East',false,true,100.0),
('nfl-best-nyg-2007',2007,'NYG','New York Giants','New York Giants · 2007','10-6','Super Bowl Champion','10-6 · Super Bowl Champion','NFC','NFC East',true,false,88.5),
('nfl-best-ari-2008',2008,'ARI','Arizona Cardinals','Arizona Cardinals · 2008','9-7','Super Bowl Runner-Up','9-7 · Super Bowl Runner-Up','NFC','NFC West',false,true,84.5),
('nfl-best-bal-2008',2008,'BAL','Baltimore Ravens','Baltimore Ravens · 2008','11-5','Conference Championship Game','11-5 · Conference Championship Game','AFC','AFC North',false,true,88.5),
('nfl-best-ne-2008',2008,'NE','New England Patriots','New England Patriots · 2008','11-5','Missed Playoffs','11-5 · Missed Playoffs','AFC','AFC East',false,false,85.0),
('nfl-best-nyg-2008',2008,'NYG','New York Giants','New York Giants · 2008','12-4','Playoff Team','12-4 · Playoff Team','NFC','NFC East',false,true,88.0),
('nfl-best-phi-2008',2008,'PHI','Philadelphia Eagles','Philadelphia Eagles · 2008','9-6-1','Conference Championship Game','9-6-1 · Conference Championship Game','NFC','NFC East',false,true,85.0),
('nfl-best-pit-2008',2008,'PIT','Pittsburgh Steelers','Pittsburgh Steelers · 2008','12-4','Super Bowl Champion','12-4 · Super Bowl Champion','AFC','AFC North',true,false,95.5),
('nfl-best-ten-2008',2008,'TEN','Tennessee Titans','Tennessee Titans · 2008','13-3','Playoff Team','13-3 · Playoff Team','AFC','AFC South',false,true,90.5),
('nfl-best-dal-2009',2009,'DAL','Dallas Cowboys','Dallas Cowboys · 2009','11-5','Won Playoff Game','11-5 · Won Playoff Game','NFC','NFC East',false,false,85.5),
('nfl-best-gb-2009',2009,'GB','Green Bay Packers','Green Bay Packers · 2009','11-5','Playoff Team','11-5 · Playoff Team','NFC','NFC North',false,false,87.0),
('nfl-best-ind-2009',2009,'IND','Indianapolis Colts','Indianapolis Colts · 2009','14-2','Super Bowl Runner-Up','14-2 · Super Bowl Runner-Up','AFC','AFC South',false,true,95.0),
('nfl-best-lac-2009',2009,'LAC','San Diego Chargers','San Diego Chargers · 2009','13-3','Playoff Team','13-3 · Playoff Team','AFC','AFC West',false,true,90.0),
('nfl-best-min-2009',2009,'MIN','Minnesota Vikings','Minnesota Vikings · 2009','12-4','Conference Championship Game','12-4 · Conference Championship Game','NFC','NFC North',false,true,91.5),
('nfl-best-no-2009',2009,'NO','New Orleans Saints','New Orleans Saints · 2009','13-3','Super Bowl Champion','13-3 · Super Bowl Champion','NFC','NFC South',true,false,97.5),
('nfl-best-nyj-2009',2009,'NYJ','New York Jets','New York Jets · 2009','9-7','Conference Championship Game','9-7 · Conference Championship Game','AFC','AFC East',false,true,83.0),
('nfl-best-atl-2010',2010,'ATL','Atlanta Falcons','Atlanta Falcons · 2010','13-3','Playoff Team','13-3 · Playoff Team','NFC','NFC South',false,true,89.0),
('nfl-best-bal-2010',2010,'BAL','Baltimore Ravens','Baltimore Ravens · 2010','12-4','Won Playoff Game','12-4 · Won Playoff Game','AFC','AFC North',false,true,87.5),
('nfl-best-chi-2010',2010,'CHI','Chicago Bears','Chicago Bears · 2010','11-5','Conference Championship Game','11-5 · Conference Championship Game','NFC','NFC North',false,true,85.0),
('nfl-best-gb-2010',2010,'GB','Green Bay Packers','Green Bay Packers · 2010','10-6','Super Bowl Champion','10-6 · Super Bowl Champion','NFC','NFC North',true,false,94.5),
('nfl-best-ne-2010',2010,'NE','New England Patriots','New England Patriots · 2010','14-2','Playoff Team','14-2 · Playoff Team','AFC','AFC East',false,true,93.5),
('nfl-best-nyj-2010',2010,'NYJ','New York Jets','New York Jets · 2010','11-5','Conference Championship Game','11-5 · Conference Championship Game','AFC','AFC East',false,true,85.5),
('nfl-best-pit-2010',2010,'PIT','Pittsburgh Steelers','Pittsburgh Steelers · 2010','12-4','Super Bowl Runner-Up','12-4 · Super Bowl Runner-Up','AFC','AFC North',false,true,91.5),
('nfl-best-sea-2010',2010,'SEA','Seattle Seahawks','Seattle Seahawks · 2010','7-9','Won Playoff Game','7-9 · Won Playoff Game','NFC','NFC West',false,false,74.0),
('nfl-best-bal-2011',2011,'BAL','Baltimore Ravens','Baltimore Ravens · 2011','12-4','Conference Championship Game','12-4 · Conference Championship Game','AFC','AFC North',false,true,89.0),
('nfl-best-den-2011',2011,'DEN','Denver Broncos','Denver Broncos · 2011','8-8','Won Playoff Game','8-8 · Won Playoff Game','AFC','AFC West',false,false,74.0),
('nfl-best-gb-2011',2011,'GB','Green Bay Packers','Green Bay Packers · 2011','15-1','Playoff Team','15-1 · Playoff Team','NFC','NFC North',false,true,94.5),
('nfl-best-ne-2011',2011,'NE','New England Patriots','New England Patriots · 2011','13-3','Super Bowl Runner-Up','13-3 · Super Bowl Runner-Up','AFC','AFC East',false,true,95.0),
('nfl-best-no-2011',2011,'NO','New Orleans Saints','New Orleans Saints · 2011','13-3','Won Playoff Game','13-3 · Won Playoff Game','NFC','NFC South',false,true,92.5),
('nfl-best-nyg-2011',2011,'NYG','New York Giants','New York Giants · 2011','9-7','Super Bowl Champion','9-7 · Super Bowl Champion','NFC','NFC East',true,false,86.0),
('nfl-best-pit-2011',2011,'PIT','Pittsburgh Steelers','Pittsburgh Steelers · 2011','12-4','Playoff Team','12-4 · Playoff Team','AFC','AFC North',false,true,87.0),
('nfl-best-sf-2011',2011,'SF','San Francisco 49ers','San Francisco 49ers · 2011','13-3','Conference Championship Game','13-3 · Conference Championship Game','NFC','NFC West',false,true,92.5),
('nfl-best-atl-2012',2012,'ATL','Atlanta Falcons','Atlanta Falcons · 2012','13-3','Conference Championship Game','13-3 · Conference Championship Game','NFC','NFC South',false,true,91.0),
('nfl-best-bal-2012',2012,'BAL','Baltimore Ravens','Baltimore Ravens · 2012','10-6','Super Bowl Champion','10-6 · Super Bowl Champion','AFC','AFC North',true,false,89.5),
('nfl-best-den-2012',2012,'DEN','Denver Broncos','Denver Broncos · 2012','13-3','Playoff Team','13-3 · Playoff Team','AFC','AFC West',false,true,92.0),
('nfl-best-hou-2012',2012,'HOU','Houston Texans','Houston Texans · 2012','12-4','Won Playoff Game','12-4 · Won Playoff Game','AFC','AFC South',false,true,87.0),
('nfl-best-ne-2012',2012,'NE','New England Patriots','New England Patriots · 2012','12-4','Conference Championship Game','12-4 · Conference Championship Game','AFC','AFC East',false,true,91.5),
('nfl-best-sea-2012',2012,'SEA','Seattle Seahawks','Seattle Seahawks · 2012','11-5','Won Playoff Game','11-5 · Won Playoff Game','NFC','NFC West',false,false,88.0),
('nfl-best-sf-2012',2012,'SF','San Francisco 49ers','San Francisco 49ers · 2012','11-4-1','Super Bowl Runner-Up','11-4-1 · Super Bowl Runner-Up','NFC','NFC West',false,true,90.5),
('nfl-best-was-2012',2012,'WAS','Washington Redskins','Washington Redskins · 2012','10-6','Playoff Team','10-6 · Playoff Team','NFC','NFC East',false,false,81.0),
('nfl-best-car-2013',2013,'CAR','Carolina Panthers','Carolina Panthers · 2013','12-4','Playoff Team','12-4 · Playoff Team','NFC','NFC South',false,true,87.5),
('nfl-best-cin-2013',2013,'CIN','Cincinnati Bengals','Cincinnati Bengals · 2013','11-5','Playoff Team','11-5 · Playoff Team','AFC','AFC North',false,false,85.5),
('nfl-best-den-2013',2013,'DEN','Denver Broncos','Denver Broncos · 2013','13-3','Super Bowl Runner-Up','13-3 · Super Bowl Runner-Up','AFC','AFC West',false,true,95.0),
('nfl-best-kc-2013',2013,'KC','Kansas City Chiefs','Kansas City Chiefs · 2013','11-5','Playoff Team','11-5 · Playoff Team','AFC','AFC West',false,false,86.0),
('nfl-best-ne-2013',2013,'NE','New England Patriots','New England Patriots · 2013','12-4','Conference Championship Game','12-4 · Conference Championship Game','AFC','AFC East',false,true,89.0),
('nfl-best-no-2013',2013,'NO','New Orleans Saints','New Orleans Saints · 2013','11-5','Won Playoff Game','11-5 · Won Playoff Game','NFC','NFC South',false,false,86.0),
('nfl-best-sea-2013',2013,'SEA','Seattle Seahawks','Seattle Seahawks · 2013','13-3','Super Bowl Champion','13-3 · Super Bowl Champion','NFC','NFC West',true,false,99.0),
('nfl-best-sf-2013',2013,'SF','San Francisco 49ers','San Francisco 49ers · 2013','12-4','Conference Championship Game','12-4 · Conference Championship Game','NFC','NFC West',false,true,90.0),
('nfl-best-bal-2014',2014,'BAL','Baltimore Ravens','Baltimore Ravens · 2014','10-6','Won Playoff Game','10-6 · Won Playoff Game','AFC','AFC North',false,false,84.0),
('nfl-best-dal-2014',2014,'DAL','Dallas Cowboys','Dallas Cowboys · 2014','12-4','Won Playoff Game','12-4 · Won Playoff Game','NFC','NFC East',false,true,88.0),
('nfl-best-den-2014',2014,'DEN','Denver Broncos','Denver Broncos · 2014','12-4','Playoff Team','12-4 · Playoff Team','AFC','AFC West',false,true,87.5),
('nfl-best-gb-2014',2014,'GB','Green Bay Packers','Green Bay Packers · 2014','12-4','Conference Championship Game','12-4 · Conference Championship Game','NFC','NFC North',false,true,90.0),
('nfl-best-ind-2014',2014,'IND','Indianapolis Colts','Indianapolis Colts · 2014','11-5','Conference Championship Game','11-5 · Conference Championship Game','AFC','AFC South',false,true,86.0),
('nfl-best-ne-2014',2014,'NE','New England Patriots','New England Patriots · 2014','12-4','Super Bowl Champion','12-4 · Super Bowl Champion','AFC','AFC East',true,false,96.0),
('nfl-best-pit-2014',2014,'PIT','Pittsburgh Steelers','Pittsburgh Steelers · 2014','11-5','Playoff Team','11-5 · Playoff Team','AFC','AFC North',false,false,83.5),
('nfl-best-sea-2014',2014,'SEA','Seattle Seahawks','Seattle Seahawks · 2014','12-4','Super Bowl Runner-Up','12-4 · Super Bowl Runner-Up','NFC','NFC West',false,true,92.0),
('nfl-best-ari-2015',2015,'ARI','Arizona Cardinals','Arizona Cardinals · 2015','13-3','Conference Championship Game','13-3 · Conference Championship Game','NFC','NFC West',false,true,92.0),
('nfl-best-car-2015',2015,'CAR','Carolina Panthers','Carolina Panthers · 2015','15-1','Super Bowl Runner-Up','15-1 · Super Bowl Runner-Up','NFC','NFC South',false,true,97.0),
('nfl-best-cin-2015',2015,'CIN','Cincinnati Bengals','Cincinnati Bengals · 2015','12-4','Playoff Team','12-4 · Playoff Team','AFC','AFC North',false,true,88.5),
('nfl-best-den-2015',2015,'DEN','Denver Broncos','Denver Broncos · 2015','12-4','Super Bowl Champion','12-4 · Super Bowl Champion','AFC','AFC West',true,false,94.0),
('nfl-best-kc-2015',2015,'KC','Kansas City Chiefs','Kansas City Chiefs · 2015','11-5','Won Playoff Game','11-5 · Won Playoff Game','AFC','AFC West',false,false,87.0),
('nfl-best-min-2015',2015,'MIN','Minnesota Vikings','Minnesota Vikings · 2015','11-5','Playoff Team','11-5 · Playoff Team','NFC','NFC North',false,false,84.0),
('nfl-best-ne-2015',2015,'NE','New England Patriots','New England Patriots · 2015','12-4','Conference Championship Game','12-4 · Conference Championship Game','AFC','AFC East',false,true,90.5),
('nfl-best-sea-2015',2015,'SEA','Seattle Seahawks','Seattle Seahawks · 2015','10-6','Won Playoff Game','10-6 · Won Playoff Game','NFC','NFC West',false,false,85.0),
('nfl-best-atl-2016',2016,'ATL','Atlanta Falcons','Atlanta Falcons · 2016','11-5','Super Bowl Runner-Up','11-5 · Super Bowl Runner-Up','NFC','NFC South',false,true,90.0),
('nfl-best-dal-2016',2016,'DAL','Dallas Cowboys','Dallas Cowboys · 2016','13-3','Playoff Team','13-3 · Playoff Team','NFC','NFC East',false,true,89.5),
('nfl-best-gb-2016',2016,'GB','Green Bay Packers','Green Bay Packers · 2016','10-6','Conference Championship Game','10-6 · Conference Championship Game','NFC','NFC North',false,true,83.0),
('nfl-best-kc-2016',2016,'KC','Kansas City Chiefs','Kansas City Chiefs · 2016','12-4','Playoff Team','12-4 · Playoff Team','AFC','AFC West',false,true,86.5),
('nfl-best-lv-2016',2016,'LV','Oakland Raiders','Oakland Raiders · 2016','12-4','Playoff Team','12-4 · Playoff Team','AFC','AFC West',false,true,84.5),
('nfl-best-ne-2016',2016,'NE','New England Patriots','New England Patriots · 2016','14-2','Super Bowl Champion','14-2 · Super Bowl Champion','AFC','AFC East',true,false,99.0),
('nfl-best-pit-2016',2016,'PIT','Pittsburgh Steelers','Pittsburgh Steelers · 2016','11-5','Conference Championship Game','11-5 · Conference Championship Game','AFC','AFC North',false,true,86.0),
('nfl-best-sea-2016',2016,'SEA','Seattle Seahawks','Seattle Seahawks · 2016','10-5-1','Won Playoff Game','10-5-1 · Won Playoff Game','NFC','NFC West',false,false,83.5),
('nfl-best-car-2017',2017,'CAR','Carolina Panthers','Carolina Panthers · 2017','11-5','Playoff Team','11-5 · Playoff Team','NFC','NFC South',false,false,83.0),
('nfl-best-jax-2017',2017,'JAX','Jacksonville Jaguars','Jacksonville Jaguars · 2017','10-6','Conference Championship Game','10-6 · Conference Championship Game','AFC','AFC South',false,true,86.5),
('nfl-best-lar-2017',2017,'LAR','Los Angeles Rams','Los Angeles Rams · 2017','11-5','Playoff Team','11-5 · Playoff Team','NFC','NFC West',false,false,86.5),
('nfl-best-min-2017',2017,'MIN','Minnesota Vikings','Minnesota Vikings · 2017','13-3','Conference Championship Game','13-3 · Conference Championship Game','NFC','NFC North',false,true,91.0),
('nfl-best-ne-2017',2017,'NE','New England Patriots','New England Patriots · 2017','13-3','Super Bowl Runner-Up','13-3 · Super Bowl Runner-Up','AFC','AFC East',false,true,94.5),
('nfl-best-no-2017',2017,'NO','New Orleans Saints','New Orleans Saints · 2017','11-5','Won Playoff Game','11-5 · Won Playoff Game','NFC','NFC South',false,false,86.5),
('nfl-best-phi-2017',2017,'PHI','Philadelphia Eagles','Philadelphia Eagles · 2017','13-3','Super Bowl Champion','13-3 · Super Bowl Champion','NFC','NFC East',true,false,97.5),
('nfl-best-pit-2017',2017,'PIT','Pittsburgh Steelers','Pittsburgh Steelers · 2017','13-3','Playoff Team','13-3 · Playoff Team','AFC','AFC North',false,true,89.0),
('nfl-best-bal-2018',2018,'BAL','Baltimore Ravens','Baltimore Ravens · 2018','10-6','Playoff Team','10-6 · Playoff Team','AFC','AFC North',false,false,83.0),
('nfl-best-chi-2018',2018,'CHI','Chicago Bears','Chicago Bears · 2018','12-4','Playoff Team','12-4 · Playoff Team','NFC','NFC North',false,true,88.5),
('nfl-best-hou-2018',2018,'HOU','Houston Texans','Houston Texans · 2018','11-5','Playoff Team','11-5 · Playoff Team','AFC','AFC South',false,false,84.5),
('nfl-best-kc-2018',2018,'KC','Kansas City Chiefs','Kansas City Chiefs · 2018','12-4','Conference Championship Game','12-4 · Conference Championship Game','AFC','AFC West',false,true,90.5),
('nfl-best-lac-2018',2018,'LAC','Los Angeles Chargers','Los Angeles Chargers · 2018','12-4','Won Playoff Game','12-4 · Won Playoff Game','AFC','AFC West',false,true,87.5),
('nfl-best-lar-2018',2018,'LAR','Los Angeles Rams','Los Angeles Rams · 2018','13-3','Super Bowl Runner-Up','13-3 · Super Bowl Runner-Up','NFC','NFC West',false,true,93.5),
('nfl-best-ne-2018',2018,'NE','New England Patriots','New England Patriots · 2018','11-5','Super Bowl Champion','11-5 · Super Bowl Champion','AFC','AFC East',true,false,93.0),
('nfl-best-no-2018',2018,'NO','New Orleans Saints','New Orleans Saints · 2018','13-3','Conference Championship Game','13-3 · Conference Championship Game','NFC','NFC South',false,true,92.5),
('nfl-best-bal-2019',2019,'BAL','Baltimore Ravens','Baltimore Ravens · 2019','14-2','Playoff Team','14-2 · Playoff Team','AFC','AFC North',false,true,93.5),
('nfl-best-gb-2019',2019,'GB','Green Bay Packers','Green Bay Packers · 2019','13-3','Conference Championship Game','13-3 · Conference Championship Game','NFC','NFC North',false,true,89.0),
('nfl-best-kc-2019',2019,'KC','Kansas City Chiefs','Kansas City Chiefs · 2019','12-4','Super Bowl Champion','12-4 · Super Bowl Champion','AFC','AFC West',true,false,96.0),
('nfl-best-min-2019',2019,'MIN','Minnesota Vikings','Minnesota Vikings · 2019','10-6','Won Playoff Game','10-6 · Won Playoff Game','NFC','NFC North',false,false,83.5),
('nfl-best-ne-2019',2019,'NE','New England Patriots','New England Patriots · 2019','12-4','Playoff Team','12-4 · Playoff Team','AFC','AFC East',false,true,90.0),
('nfl-best-no-2019',2019,'NO','New Orleans Saints','New Orleans Saints · 2019','13-3','Playoff Team','13-3 · Playoff Team','NFC','NFC South',false,true,89.5),
('nfl-best-sf-2019',2019,'SF','San Francisco 49ers','San Francisco 49ers · 2019','13-3','Super Bowl Runner-Up','13-3 · Super Bowl Runner-Up','NFC','NFC West',false,true,95.0),
('nfl-best-ten-2019',2019,'TEN','Tennessee Titans','Tennessee Titans · 2019','9-7','Conference Championship Game','9-7 · Conference Championship Game','AFC','AFC South',false,true,82.0),
('nfl-best-bal-2020',2020,'BAL','Baltimore Ravens','Baltimore Ravens · 2020','11-5','Won Playoff Game','11-5 · Won Playoff Game','AFC','AFC North',false,false,87.5),
('nfl-best-buf-2020',2020,'BUF','Buffalo Bills','Buffalo Bills · 2020','13-3','Conference Championship Game','13-3 · Conference Championship Game','AFC','AFC East',false,true,91.5),
('nfl-best-cle-2020',2020,'CLE','Cleveland Browns','Cleveland Browns · 2020','11-5','Won Playoff Game','11-5 · Won Playoff Game','AFC','AFC North',false,false,82.5),
('nfl-best-gb-2020',2020,'GB','Green Bay Packers','Green Bay Packers · 2020','13-3','Conference Championship Game','13-3 · Conference Championship Game','NFC','NFC North',false,true,92.0),
('nfl-best-kc-2020',2020,'KC','Kansas City Chiefs','Kansas City Chiefs · 2020','14-2','Super Bowl Runner-Up','14-2 · Super Bowl Runner-Up','AFC','AFC West',false,true,94.5),
('nfl-best-no-2020',2020,'NO','New Orleans Saints','New Orleans Saints · 2020','12-4','Won Playoff Game','12-4 · Won Playoff Game','NFC','NFC South',false,true,89.0),
('nfl-best-pit-2020',2020,'PIT','Pittsburgh Steelers','Pittsburgh Steelers · 2020','12-4','Playoff Team','12-4 · Playoff Team','AFC','AFC North',false,true,87.0),
('nfl-best-sea-2020',2020,'SEA','Seattle Seahawks','Seattle Seahawks · 2020','12-4','Playoff Team','12-4 · Playoff Team','NFC','NFC West',false,true,86.5),
('nfl-best-tb-2020',2020,'TB','Tampa Bay Buccaneers','Tampa Bay Buccaneers · 2020','11-5','Super Bowl Champion','11-5 · Super Bowl Champion','NFC','NFC South',true,false,94.5),
('nfl-best-buf-2021',2021,'BUF','Buffalo Bills','Buffalo Bills · 2021','11-6','Won Playoff Game','11-6 · Won Playoff Game','AFC','AFC East',false,false,87.0),
('nfl-best-cin-2021',2021,'CIN','Cincinnati Bengals','Cincinnati Bengals · 2021','10-7','Super Bowl Runner-Up','10-7 · Super Bowl Runner-Up','AFC','AFC North',false,true,84.5),
('nfl-best-dal-2021',2021,'DAL','Dallas Cowboys','Dallas Cowboys · 2021','12-5','Playoff Team','12-5 · Playoff Team','NFC','NFC East',false,false,87.5),
('nfl-best-gb-2021',2021,'GB','Green Bay Packers','Green Bay Packers · 2021','13-4','Playoff Team','13-4 · Playoff Team','NFC','NFC North',false,true,86.5),
('nfl-best-kc-2021',2021,'KC','Kansas City Chiefs','Kansas City Chiefs · 2021','12-5','Conference Championship Game','12-5 · Conference Championship Game','AFC','AFC West',false,true,88.0),
('nfl-best-lar-2021',2021,'LAR','Los Angeles Rams','Los Angeles Rams · 2021','12-5','Super Bowl Champion','12-5 · Super Bowl Champion','NFC','NFC West',true,false,93.5),
('nfl-best-sf-2021',2021,'SF','San Francisco 49ers','San Francisco 49ers · 2021','10-7','Conference Championship Game','10-7 · Conference Championship Game','NFC','NFC West',false,true,82.5),
('nfl-best-tb-2021',2021,'TB','Tampa Bay Buccaneers','Tampa Bay Buccaneers · 2021','13-4','Won Playoff Game','13-4 · Won Playoff Game','NFC','NFC South',false,true,90.0),
('nfl-best-ten-2021',2021,'TEN','Tennessee Titans','Tennessee Titans · 2021','12-5','Playoff Team','12-5 · Playoff Team','AFC','AFC South',false,false,84.5),
('nfl-best-bal-2022',2022,'BAL','Baltimore Ravens','Baltimore Ravens · 2022','10-7','Playoff Team','10-7 · Playoff Team','AFC','AFC North',false,false,79.5),
('nfl-best-buf-2022',2022,'BUF','Buffalo Bills','Buffalo Bills · 2022','13-3','Won Playoff Game','13-3 · Won Playoff Game','AFC','AFC East',false,true,91.5),
('nfl-best-cin-2022',2022,'CIN','Cincinnati Bengals','Cincinnati Bengals · 2022','12-4','Conference Championship Game','12-4 · Conference Championship Game','AFC','AFC North',false,true,89.0),
('nfl-best-dal-2022',2022,'DAL','Dallas Cowboys','Dallas Cowboys · 2022','12-5','Won Playoff Game','12-5 · Won Playoff Game','NFC','NFC East',false,false,87.0),
('nfl-best-jax-2022',2022,'JAX','Jacksonville Jaguars','Jacksonville Jaguars · 2022','9-8','Won Playoff Game','9-8 · Won Playoff Game','AFC','AFC South',false,false,79.0),
('nfl-best-kc-2022',2022,'KC','Kansas City Chiefs','Kansas City Chiefs · 2022','14-3','Super Bowl Champion','14-3 · Super Bowl Champion','AFC','AFC West',true,false,96.5),
('nfl-best-min-2022',2022,'MIN','Minnesota Vikings','Minnesota Vikings · 2022','13-4','Playoff Team','13-4 · Playoff Team','NFC','NFC North',false,true,84.0),
('nfl-best-phi-2022',2022,'PHI','Philadelphia Eagles','Philadelphia Eagles · 2022','14-3','Super Bowl Runner-Up','14-3 · Super Bowl Runner-Up','NFC','NFC East',false,true,95.0),
('nfl-best-sf-2022',2022,'SF','San Francisco 49ers','San Francisco 49ers · 2022','13-4','Conference Championship Game','13-4 · Conference Championship Game','NFC','NFC West',false,true,91.0),
('nfl-best-bal-2023',2023,'BAL','Baltimore Ravens','Baltimore Ravens · 2023','13-4','Conference Championship Game','13-4 · Conference Championship Game','AFC','AFC North',false,true,93.5),
('nfl-best-buf-2023',2023,'BUF','Buffalo Bills','Buffalo Bills · 2023','11-6','Won Playoff Game','11-6 · Won Playoff Game','AFC','AFC East',false,false,85.5),
('nfl-best-cle-2023',2023,'CLE','Cleveland Browns','Cleveland Browns · 2023','11-6','Playoff Team','11-6 · Playoff Team','AFC','AFC North',false,false,81.0),
('nfl-best-dal-2023',2023,'DAL','Dallas Cowboys','Dallas Cowboys · 2023','12-5','Playoff Team','12-5 · Playoff Team','NFC','NFC East',false,false,88.0),
('nfl-best-det-2023',2023,'DET','Detroit Lions','Detroit Lions · 2023','12-5','Conference Championship Game','12-5 · Conference Championship Game','NFC','NFC North',false,true,86.0),
('nfl-best-gb-2023',2023,'GB','Green Bay Packers','Green Bay Packers · 2023','9-8','Won Playoff Game','9-8 · Won Playoff Game','NFC','NFC North',false,false,79.0),
('nfl-best-kc-2023',2023,'KC','Kansas City Chiefs','Kansas City Chiefs · 2023','11-6','Super Bowl Champion','11-6 · Super Bowl Champion','AFC','AFC West',true,false,91.0),
('nfl-best-mia-2023',2023,'MIA','Miami Dolphins','Miami Dolphins · 2023','11-6','Playoff Team','11-6 · Playoff Team','AFC','AFC East',false,false,83.0),
('nfl-best-sf-2023',2023,'SF','San Francisco 49ers','San Francisco 49ers · 2023','12-5','Super Bowl Runner-Up','12-5 · Super Bowl Runner-Up','NFC','NFC West',false,true,93.5),
('nfl-best-bal-2024',2024,'BAL','Baltimore Ravens','Baltimore Ravens · 2024','12-5','Won Playoff Game','12-5 · Won Playoff Game','AFC','AFC North',false,false,88.0),
('nfl-best-buf-2024',2024,'BUF','Buffalo Bills','Buffalo Bills · 2024','13-4','Conference Championship Game','13-4 · Conference Championship Game','AFC','AFC East',false,true,92.5),
('nfl-best-det-2024',2024,'DET','Detroit Lions','Detroit Lions · 2024','15-2','Playoff Team','15-2 · Playoff Team','NFC','NFC North',false,true,93.0),
('nfl-best-gb-2024',2024,'GB','Green Bay Packers','Green Bay Packers · 2024','11-6','Playoff Team','11-6 · Playoff Team','NFC','NFC North',false,false,84.0),
('nfl-best-kc-2024',2024,'KC','Kansas City Chiefs','Kansas City Chiefs · 2024','15-2','Super Bowl Runner-Up','15-2 · Super Bowl Runner-Up','AFC','AFC West',false,true,92.5),
('nfl-best-lac-2024',2024,'LAC','Los Angeles Chargers','Los Angeles Chargers · 2024','11-6','Playoff Team','11-6 · Playoff Team','AFC','AFC West',false,false,83.0),
('nfl-best-min-2024',2024,'MIN','Minnesota Vikings','Minnesota Vikings · 2024','14-3','Playoff Team','14-3 · Playoff Team','NFC','NFC North',false,true,89.0),
('nfl-best-phi-2024',2024,'PHI','Philadelphia Eagles','Philadelphia Eagles · 2024','14-3','Super Bowl Champion','14-3 · Super Bowl Champion','NFC','NFC East',true,false,98.5),
('nfl-best-was-2024',2024,'WAS','Washington Commanders','Washington Commanders · 2024','12-5','Conference Championship Game','12-5 · Conference Championship Game','NFC','NFC East',false,true,86.5),
('nfl-best-buf-2025',2025,'BUF','Buffalo Bills','Buffalo Bills · 2025','12-5','Won Playoff Game','12-5 · Won Playoff Game','AFC','AFC East',false,false,86.5),
('nfl-best-chi-2025',2025,'CHI','Chicago Bears','Chicago Bears · 2025','11-6','Won Playoff Game','11-6 · Won Playoff Game','NFC','NFC North',false,false,82.0),
('nfl-best-den-2025',2025,'DEN','Denver Broncos','Denver Broncos · 2025','14-3','Conference Championship Game','14-3 · Conference Championship Game','AFC','AFC West',false,true,90.5),
('nfl-best-hou-2025',2025,'HOU','Houston Texans','Houston Texans · 2025','12-5','Won Playoff Game','12-5 · Won Playoff Game','AFC','AFC South',false,false,86.5),
('nfl-best-jax-2025',2025,'JAX','Jacksonville Jaguars','Jacksonville Jaguars · 2025','13-4','Playoff Team','13-4 · Playoff Team','AFC','AFC South',false,true,88.5),
('nfl-best-lar-2025',2025,'LAR','Los Angeles Rams','Los Angeles Rams · 2025','12-5','Conference Championship Game','12-5 · Conference Championship Game','NFC','NFC West',false,true,89.0),
('nfl-best-ne-2025',2025,'NE','New England Patriots','New England Patriots · 2025','14-3','Super Bowl Runner-Up','14-3 · Super Bowl Runner-Up','AFC','AFC East',false,true,94.5),
('nfl-best-phi-2025',2025,'PHI','Philadelphia Eagles','Philadelphia Eagles · 2025','11-6','Playoff Team','11-6 · Playoff Team','NFC','NFC East',false,false,82.0),
('nfl-best-sea-2025',2025,'SEA','Seattle Seahawks','Seattle Seahawks · 2025','14-3','Super Bowl Champion','14-3 · Super Bowl Champion','NFC','NFC West',true,false,98.5),
('nfl-best-sf-2025',2025,'SF','San Francisco 49ers','San Francisco 49ers · 2025','12-5','Won Playoff Game','12-5 · Won Playoff Game','NFC','NFC West',false,false,84.0)
on conflict(item_reference) do update set
  season_year=excluded.season_year,
  franchise_id=excluded.franchise_id,
  team_name=excluded.team_name,
  display_label=excluded.display_label,
  record=excluded.record,
  postseason_finish=excluded.postseason_finish,
  card_tag=excluded.card_tag,
  conference=excluded.conference,
  division=excluded.division,
  super_bowl_champion=excluded.super_bowl_champion,
  fell_short=excluded.fell_short,
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
  authority.card_tag,
  authority.franchise_id,
  authority.division,
  authority.franchise_id,
  authority.display_label,
  authority.hidden_grade,
  null,
  jsonb_build_object(
    'record',authority.record,
    'postseason_finish',authority.postseason_finish,
    'card_tag',authority.card_tag,
    'conference',authority.conference,
    'division',authority.division,
    'fell_short',authority.fell_short,
    'super_bowl_champion',authority.super_bowl_champion
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

do $nfl_population_contract$
begin
  if (select count(*) from private.nfl_best_team_seasons_v1_authority)<>200 then
    raise exception 'NFL Team-Seasons authority must contain exactly 200 seasons';
  end if;
  if (select count(*) from private.football_weekly_auction_items where subject_key='nfl-best-team-seasons-since-2000')<>200 then
    raise exception 'NFL Team-Seasons catalog must mirror all 200 authority rows';
  end if;
end
$nfl_population_contract$;

alter table private.football_weekly_auction_board
  drop constraint if exists football_weekly_auction_board_theme_check,
  drop constraint if exists football_weekly_auction_board_hidden_shape_check,
  add constraint football_weekly_auction_board_theme_check check (
    char_length(theme) between 1 and 80
  ),
  add constraint football_weekly_auction_board_hidden_shape_check check (
    hidden_shape in (
      'Wide','Compressed','TopHeavy','MiddleHeavy','Trap','Chaotic',
      'Premium','Standard','Grinder','Chaos','Natural'
    )
  );

create table if not exists private.football_weekly_nfl_team_season_themes (
  week_start date not null references private.football_weekly_auction_weeks(week_start) on delete cascade,
  day_index integer not null check (day_index between 1 and 6),
  family text not null check (family in (
    'division','season','era','rivalry','franchise_history',
    'fell_short','conference_clash','open_field'
  )),
  variant text,
  public_theme text,
  primary key(week_start,day_index),
  unique(week_start,public_theme)
);
revoke all on private.football_weekly_nfl_team_season_themes from public,anon,authenticated;

create or replace function private.football_weekly_nfl_team_short_name(p_franchise text)
returns text
language sql immutable
set search_path=''
as $$
  select case p_franchise
    when 'ARI' then 'Cardinals' when 'ATL' then 'Falcons' when 'BAL' then 'Ravens'
    when 'BUF' then 'Bills' when 'CAR' then 'Panthers' when 'CHI' then 'Bears'
    when 'CIN' then 'Bengals' when 'CLE' then 'Browns' when 'DAL' then 'Cowboys'
    when 'DEN' then 'Broncos' when 'DET' then 'Lions' when 'GB' then 'Packers'
    when 'HOU' then 'Texans' when 'IND' then 'Colts' when 'JAX' then 'Jaguars'
    when 'KC' then 'Chiefs' when 'LAC' then 'Chargers' when 'LAR' then 'Rams'
    when 'LV' then 'Raiders' when 'MIA' then 'Dolphins' when 'MIN' then 'Vikings'
    when 'NE' then 'Patriots' when 'NO' then 'Saints' when 'NYG' then 'Giants'
    when 'NYJ' then 'Jets' when 'PHI' then 'Eagles' when 'PIT' then 'Steelers'
    when 'SEA' then 'Seahawks' when 'SF' then '49ers' when 'TB' then 'Buccaneers'
    when 'TEN' then 'Titans' when 'WAS' then 'Washington'
    else p_franchise end;
$$;
revoke all on function private.football_weekly_nfl_team_short_name(text) from public,anon,authenticated;

create or replace function private.football_weekly_nfl_team_season_cards_for_field(p_players integer)
returns integer
language sql immutable
set search_path=''
as $$
  select case
    when greatest(coalesce(p_players,0),0)<=3 then 3
    when p_players=4 then 3
    when p_players=5 then 4
    when p_players=6 then 5
    when p_players=7 then 6
    else 7
  end;
$$;
revoke all on function private.football_weekly_nfl_team_season_cards_for_field(integer)
  from public,anon,authenticated;

create or replace function private.materialize_football_weekly_nfl_team_season_week(p_week_start date)
returns void
language plpgsql
security definer
set search_path=''
as $$
declare
  v_existing integer;
  v_day integer;
  v_slot integer;
  v_family text;
  v_variant text;
  v_theme text;
  v_ref text;
  v_rivalry text;
begin
  if extract(isodow from p_week_start)<>2 then
    raise exception 'Football Weekly Auction week must start Tuesday';
  end if;

  insert into private.football_weekly_auction_weeks(week_start,subject_key)
  values(p_week_start,'nfl-best-team-seasons-since-2000')
  on conflict(week_start) do nothing;

  if (select subject_key from private.football_weekly_auction_weeks where week_start=p_week_start)
    <>'nfl-best-team-seasons-since-2000'
  then
    raise exception 'NFL Team-Seasons materializer requires its subject week';
  end if;

  select count(*)::integer into v_existing
  from private.football_weekly_auction_board
  where week_start=p_week_start;

  if v_existing>=24 then return; end if;
  if v_existing<>0 then
    raise exception 'NFL Team-Seasons normal board is partial; refusing to reroll exposed cards';
  end if;

  -- The audited JS generator remains the calibration authority. Runtime uses the
  -- same eight approved families/eligibility rules, with a deterministic hash
  -- permutation so future themes are server-owned and do not require a fixed schedule.
  insert into private.football_weekly_nfl_team_season_themes(
    week_start,day_index,family,variant,public_theme
  )
  with families(family) as (
    values
      ('division'),('season'),('era'),('rivalry'),('franchise_history'),
      ('fell_short'),('conference_clash'),('open_field')
  ),
  ranked as (
    select family,row_number() over(
      order by md5(p_week_start::text||':family:'||family)
    )::integer as day_index
    from families
  )
  select p_week_start,day_index,family,null,null
  from ranked
  where day_index<=6
  on conflict(week_start,day_index) do nothing;

  for v_day in 1..6 loop
    select family into v_family
    from private.football_weekly_nfl_team_season_themes
    where week_start=p_week_start and day_index=v_day;

    if v_family='division' then
      select division into v_variant
      from (select distinct division from private.nfl_best_team_seasons_v1_authority) d
      order by md5(p_week_start::text||':division:'||d.division)
      limit 1;
      v_theme:=v_variant||' Spotlight';
    elsif v_family='season' then
      v_variant:=(2010+mod(abs(hashtext(p_week_start::text||':season')),16))::text;
      v_theme:=v_variant||' Season Spotlight';
    elsif v_family='era' then
      v_variant:=(array['2000s','2010s','2020s'])[1+mod(abs(hashtext(p_week_start::text||':era')),3)];
      v_theme:=v_variant||' Spotlight';
    elsif v_family='rivalry' then
      v_rivalry:=(array[
        'DAL|PHI','GB|CHI','BAL|PIT','KC|LV','NE|NYJ','SF|LAR',
        'ATL|NO','DEN|KC','NYG|PHI','SEA|SF','CLE|PIT','MIN|GB'
      ])[1+mod(abs(hashtext(p_week_start::text||':rivalry')),12)];
      v_variant:=v_rivalry;
      v_theme:=private.football_weekly_nfl_team_short_name(split_part(v_rivalry,'|',1))
        ||' vs '||
        private.football_weekly_nfl_team_short_name(split_part(v_rivalry,'|',2));
    elsif v_family='franchise_history' then
      select franchise_id into v_variant
      from private.nfl_best_team_seasons_v1_authority
      group by franchise_id
      having count(*)>=7
      order by md5(p_week_start::text||':franchise:'||franchise_id)
      limit 1;
      v_theme:=private.football_weekly_nfl_team_short_name(v_variant)||' Through the Years';
    elsif v_family='fell_short' then
      v_variant:=null;
      v_theme:='Great Teams That Fell Short';
    elsif v_family='conference_clash' then
      v_variant:=null;
      v_theme:='AFC vs NFC';
    else
      v_variant:=null;
      v_theme:='Open Field';
    end if;

    update private.football_weekly_nfl_team_season_themes
    set variant=v_variant,public_theme=v_theme
    where week_start=p_week_start and day_index=v_day;

    for v_slot in 1..7 loop
      v_ref:=null;

      select candidate.item_reference into v_ref
      from private.nfl_best_team_seasons_v1_authority candidate
      where not exists(
          select 1 from private.football_weekly_auction_board used
          where used.week_start=p_week_start
            and used.season_reference=candidate.item_reference
        )
        and (
          (v_family='division' and candidate.division=v_variant)
          or (v_family='season' and candidate.season_year=v_variant::integer)
          or (v_family='era' and (
            (v_variant='2000s' and candidate.season_year between 2000 and 2009)
            or (v_variant='2010s' and candidate.season_year between 2010 and 2019)
            or (v_variant='2020s' and candidate.season_year between 2020 and 2025)
          ))
          or (v_family='rivalry' and candidate.franchise_id in (
            split_part(v_variant,'|',1),split_part(v_variant,'|',2)
          ))
          or (v_family='franchise_history' and candidate.franchise_id=v_variant)
          or (v_family='fell_short' and candidate.fell_short)
          or (v_family='conference_clash')
          or (v_family='open_field')
        )
        and (
          v_slot>4
          or v_family='franchise_history'
          or (
            v_family='rivalry'
            and (
              select count(*)
              from private.football_weekly_auction_board prior
              join private.nfl_best_team_seasons_v1_authority prior_item
                on prior_item.item_reference=prior.season_reference
              where prior.week_start=p_week_start
                and prior.day_index=v_day
                and prior_item.franchise_id=candidate.franchise_id
            )<2
          )
          or (
            v_family='conference_clash'
            and (
              select count(*)
              from private.football_weekly_auction_board prior
              join private.nfl_best_team_seasons_v1_authority prior_item
                on prior_item.item_reference=prior.season_reference
              where prior.week_start=p_week_start
                and prior.day_index=v_day
                and prior_item.conference=candidate.conference
            )<2
          )
          or (
            v_family not in ('rivalry','conference_clash','franchise_history')
            and not exists(
              select 1
              from private.football_weekly_auction_board prior
              join private.nfl_best_team_seasons_v1_authority prior_item
                on prior_item.item_reference=prior.season_reference
              where prior.week_start=p_week_start
                and prior.day_index=v_day
                and prior_item.franchise_id=candidate.franchise_id
            )
          )
        )
      order by
        (
          select count(*)
          from private.football_weekly_auction_board weekly
          join private.nfl_best_team_seasons_v1_authority weekly_item
            on weekly_item.item_reference=weekly.season_reference
          where weekly.week_start=p_week_start
            and weekly_item.franchise_id=candidate.franchise_id
        ),
        md5(p_week_start::text||':'||v_day::text||':'||v_slot::text||':'||candidate.item_reference)
      limit 1;

      if v_ref is null then
        -- Reserve supply may relax same-day franchise balance, but never theme
        -- eligibility or exact team-season uniqueness.
        select candidate.item_reference into v_ref
        from private.nfl_best_team_seasons_v1_authority candidate
        where not exists(
            select 1 from private.football_weekly_auction_board used
            where used.week_start=p_week_start
              and used.season_reference=candidate.item_reference
          )
          and (
            (v_family='division' and candidate.division=v_variant)
            or (v_family='season' and candidate.season_year=v_variant::integer)
            or (v_family='era' and (
              (v_variant='2000s' and candidate.season_year between 2000 and 2009)
              or (v_variant='2010s' and candidate.season_year between 2010 and 2019)
              or (v_variant='2020s' and candidate.season_year between 2020 and 2025)
            ))
            or (v_family='rivalry' and candidate.franchise_id in (
              split_part(v_variant,'|',1),split_part(v_variant,'|',2)
            ))
            or (v_family='franchise_history' and candidate.franchise_id=v_variant)
            or (v_family='fell_short' and candidate.fell_short)
            or (v_family in ('conference_clash','open_field'))
          )
        order by
          (
            select count(*)
            from private.football_weekly_auction_board weekly
            join private.nfl_best_team_seasons_v1_authority weekly_item
              on weekly_item.item_reference=weekly.season_reference
            where weekly.week_start=p_week_start
              and weekly_item.franchise_id=candidate.franchise_id
          ),
          md5(p_week_start::text||':reserve:'||v_day::text||':'||v_slot::text||':'||candidate.item_reference)
        limit 1;
      end if;

      if v_ref is null then
        exit;
      end if;

      insert into private.football_weekly_auction_board(
        week_start,day_index,theme,hidden_shape,slot,season_reference,lock_at,trait
      ) values (
        p_week_start,v_day,v_theme,'Natural',v_slot,v_ref,
        ((p_week_start+v_day)::timestamp at time zone 'America/Chicago'),
        null
      );
    end loop;

    if (select count(*) from private.football_weekly_auction_board where week_start=p_week_start and day_index=v_day)<4 then
      raise exception 'NFL Team-Seasons theme % could not materialize its four-card base board',v_theme;
    end if;
  end loop;

  if exists(
    select 1
    from private.football_weekly_nfl_team_season_themes
    where week_start=p_week_start
      and (public_theme is null or char_length(public_theme)=0)
  ) then
    raise exception 'NFL Team-Seasons generated incomplete theme metadata';
  end if;

  if exists(
    select season_reference
    from private.football_weekly_auction_board
    where week_start=p_week_start and day_index between 1 and 6
    group by season_reference
    having count(*)>1
  ) then
    raise exception 'NFL Team-Seasons repeated an exact team-season within the week';
  end if;
end;
$$;
revoke all on function private.materialize_football_weekly_nfl_team_season_week(date)
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
  v_base integer;
  v_needed integer;
  v_remaining_days integer;
  v_completion_floor integer;
  v_available integer;
begin
  if p_day_index not between 1 and 7 then
    raise exception 'Football Weekly Auction day must be between 1 and 7';
  end if;

  select subject_key into v_subject
  from private.football_weekly_auction_weeks
  where week_start=p_week_start;

  if v_subject='nfl-best-team-seasons-since-2000' then
    if p_day_index=7 then return 0; end if;

    select count(*)::integer into v_available
    from private.football_weekly_auction_board board
    where board.week_start=p_week_start and board.day_index=p_day_index;

    -- Day 1 is exposed before the join window freezes. Keep that visible board
    -- immutable at the expected five-player four-card launch shape; only later
    -- unrevealed days may expand or contract with the frozen field.
    if p_day_index=1 then
      return least(v_available,4);
    end if;

    v_day_start:=((p_week_start+(p_day_index-1))::timestamp at time zone 'America/Chicago');
    select count(*)::integer into v_players
    from private.football_weekly_auction_participants participant
    where participant.week_start=p_week_start
      and participant.locked_at<v_day_start;

    if v_players=0 then
      select count(*)::integer into v_players
      from private.football_weekly_auction_participants participant
      where participant.week_start=p_week_start;
    end if;

    v_base:=private.football_weekly_nfl_team_season_cards_for_field(v_players);
    v_remaining_days:=7-p_day_index;

    select coalesce(sum(greatest(4-owned.owned_count,0)),0)::integer into v_needed
    from (
      select
        participant.profile_id,
        count(award.profile_id)::integer as owned_count
      from private.football_weekly_auction_participants participant
      left join private.football_weekly_auction_awards award
        on award.week_start=participant.week_start
       and award.profile_id=participant.profile_id
       and award.day_index between 1 and greatest(p_day_index-1,0)
      where participant.week_start=p_week_start
      group by participant.profile_id
    ) owned;

    v_completion_floor:=case
      when v_remaining_days<=0 then v_base
      else ceil(v_needed::numeric/v_remaining_days)::integer
    end;

    return least(v_available,greatest(v_base,v_completion_floor));
  end if;

  if v_subject='cfb-superteam' then
    if exists(
      select 1 from private.football_weekly_superteam_lab_runs lab
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
  end if;

  return private.football_weekly_auction_cards_per_day(p_week_start);
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
    for v_day in 1..6 loop
      v_total:=v_total+private.football_weekly_auction_cards_for_day(p_week_start,v_day);
    end loop;
    return v_total;
  elsif v_subject='cfb-superteam' then
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
    from private.football_weekly_auction_weeks where week_start=p_week_start;
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
    if new.day_index not between 1 and 6
      or new.slot not between 1 and 7
      or new.hidden_shape<>'Natural'
      or new.trait is not null
      or not exists(
        select 1 from private.nfl_best_team_seasons_v1_authority authority
        where authority.item_reference=new.season_reference
      )
    then
      raise exception 'NFL Team-Seasons board row is outside its audited authority';
    end if;
  elsif v_subject='cfb-superteam' then
    if new.trait is not null
      or new.theme<>'CFB Superteam'
      or new.hidden_shape<>'Standard'
      or not exists(
        select 1
        from private.cfb_superteam_week_authority authority
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
  v_lock_at timestamptz;
  v_slot integer;
  v_winner uuid;
  v_amount integer;
begin
  if p_day_index not between 1 and 6 then
    raise exception 'NFL Team-Seasons normal auction day must be 1-6';
  end if;

  v_card_count:=private.football_weekly_auction_cards_for_day(p_week_start,p_day_index);
  select min(lock_at) into v_lock_at
  from private.football_weekly_auction_board
  where week_start=p_week_start and day_index=p_day_index and slot<=v_card_count;

  if v_lock_at is null or p_at<v_lock_at then return; end if;

  if (
    select count(*) from private.football_weekly_auction_awards
    where week_start=p_week_start and day_index=p_day_index
  )=v_card_count then return; end if;

  insert into private.football_weekly_auction_daily_entries(
    week_start,day_index,profile_id,submitted_at,updated_at
  )
  select p_week_start,p_day_index,participant.profile_id,p_at,p_at
  from private.football_weekly_auction_participants participant
  where participant.week_start=p_week_start
  on conflict(week_start,day_index,profile_id) do nothing;

  for v_slot in
    select board.slot
    from private.football_weekly_auction_board board
    where board.week_start=p_week_start
      and board.day_index=p_day_index
      and board.slot<=v_card_count
    order by coalesce((
      select max(bid.amount)
      from private.football_weekly_auction_bids bid
      where bid.week_start=board.week_start
        and bid.day_index=board.day_index
        and bid.slot=board.slot
    ),0) desc,board.slot
  loop
    v_winner:=null;
    v_amount:=0;

    select candidate.profile_id,candidate.amount
    into v_winner,v_amount
    from (
      select
        participant.profile_id,
        coalesce(bid.amount,0)::integer as amount,
        (
          select count(*)
          from private.football_weekly_auction_awards won
          where won.week_start=p_week_start
            and won.profile_id=participant.profile_id
            and won.day_index between 1 and 6
        )::integer as weekly_wins,
        (
          select count(*)
          from private.football_weekly_auction_awards won
          where won.week_start=p_week_start
            and won.profile_id=participant.profile_id
            and won.day_index=p_day_index
        )::integer as daily_wins,
        (
          select coalesce(sum(won.winning_bid),0)
          from private.football_weekly_auction_awards won
          where won.week_start=p_week_start
            and won.profile_id=participant.profile_id
        )::integer as spent
      from private.football_weekly_auction_participants participant
      left join private.football_weekly_auction_bids bid
        on bid.week_start=p_week_start
       and bid.day_index=p_day_index
       and bid.slot=v_slot
       and bid.profile_id=participant.profile_id
      where participant.week_start=p_week_start
    ) candidate
    where candidate.amount>0
      and candidate.weekly_wins<5
      and candidate.daily_wins<2
    order by
      candidate.amount desc,
      candidate.weekly_wins asc,
      candidate.spent asc,
      md5(p_week_start::text||':'||p_day_index::text||':'||v_slot::text||':'||candidate.profile_id::text)
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
  v_bankroll integer;
  v_owned integer;
  v_max_wins integer;
  v_slot integer;
  v_bid integer;
  v_top_commit integer;
begin
  if p_day_index not between 1 and 6 then
    raise exception 'Normal sealed bids are only open on Days 1-6';
  end if;
  if jsonb_typeof(p_bids)<>'object' then raise exception 'bids must be an object'; end if;

  v_card_count:=private.football_weekly_auction_cards_for_day(p_week_start,p_day_index);
  select min(lock_at) into v_lock_at
  from private.football_weekly_auction_board
  where week_start=p_week_start and day_index=p_day_index and slot<=v_card_count;
  if v_lock_at is null or p_at>=v_lock_at then raise exception 'Today''s Weekly Auction bids are locked'; end if;

  if not exists(
    select 1 from private.football_weekly_auction_participants
    where week_start=p_week_start and profile_id=p_profile_id
  ) then raise exception 'Weekly Auction field is locked for this week'; end if;

  v_starting:=private.football_weekly_auction_starting_bankroll(p_week_start,p_profile_id,50);
  select
    v_starting-coalesce(sum(award.winning_bid),0)::integer,
    count(award.profile_id)::integer
  into v_bankroll,v_owned
  from private.football_weekly_auction_awards award
  where award.week_start=p_week_start
    and award.day_index between 1 and 6
    and award.profile_id=p_profile_id;

  v_max_wins:=least(2,greatest(5-v_owned,0));

  for v_slot in 1..v_card_count loop
    begin
      v_bid:=coalesce((p_bids->>v_slot::text)::integer,0);
    exception when others then
      raise exception 'NFL Team-Seasons bids must be whole dollars';
    end;
    if v_bid<0 or v_bid>v_bankroll then
      raise exception 'NFL Team-Seasons bids must be between $0 and your remaining bankroll';
    end if;
  end loop;

  select coalesce(sum(value),0)::integer into v_top_commit
  from (
    select value
    from (
      select coalesce((p_bids->>slot::text)::integer,0) as value
      from generate_series(1,v_card_count) slot
    ) bids
    order by value desc
    limit v_max_wins
  ) top_bids;

  if v_top_commit>v_bankroll then
    raise exception 'Your two highest possible wins exceed your remaining bankroll';
  end if;

  insert into private.football_weekly_auction_daily_entries(
    week_start,day_index,profile_id,submitted_at,updated_at
  ) values (p_week_start,p_day_index,p_profile_id,p_at,p_at)
  on conflict(week_start,day_index,profile_id)
  do update set updated_at=excluded.updated_at;

  delete from private.football_weekly_auction_bids
  where week_start=p_week_start and day_index=p_day_index and profile_id=p_profile_id;

  for v_slot in 1..v_card_count loop
    v_bid:=coalesce((p_bids->>v_slot::text)::integer,0);
    insert into private.football_weekly_auction_bids(
      week_start,day_index,profile_id,slot,amount,updated_at
    ) values (
      p_week_start,p_day_index,p_profile_id,v_slot,v_bid,p_at
    );
  end loop;
end;
$$;
revoke all on function private.submit_football_weekly_nfl_team_season_bids_for_profile(date,integer,uuid,jsonb,timestamptz)
  from public,anon,authenticated;

create or replace function private.football_weekly_nfl_team_season_effective_collection(
  p_week_start date,p_profile_id uuid
)
returns table(item_reference text,winning_bid integer,source text)
language sql
stable security definer
set search_path=''
as $$
  select board.season_reference,award.winning_bid,'normal'::text
  from private.football_weekly_auction_awards award
  join private.football_weekly_auction_board board
    on board.week_start=award.week_start
   and board.day_index=award.day_index
   and board.slot=award.slot
  where award.week_start=p_week_start
    and award.day_index between 1 and 6
    and award.profile_id=p_profile_id
    and not exists(
      select 1
      from private.football_weekly_nfl_team_season_wildcard_claims claim
      where claim.week_start=p_week_start
        and claim.profile_id=p_profile_id
        and claim.replaced_item_reference=board.season_reference
    )
  union all
  select claim.item_reference,0,'wildcard'::text
  from private.football_weekly_nfl_team_season_wildcard_claims claim
  where claim.week_start=p_week_start and claim.profile_id=p_profile_id
  union all
  select fill.item_reference,0,'autofill'::text
  from private.football_weekly_nfl_team_season_autofill fill
  where fill.week_start=p_week_start and fill.profile_id=p_profile_id;
$$;
revoke all on function private.football_weekly_nfl_team_season_effective_collection(date,uuid)
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
    select 1 from private.football_weekly_nfl_team_season_wildcard_resolutions
    where week_start=p_week_start
  ) then return; end if;

  delete from private.football_weekly_auction_results where week_start=p_week_start;

  insert into private.football_weekly_auction_results(
    week_start,profile_id,owned_count,final_score,scoring_cost,scoring_refs,tie_random
  )
  with effective as (
    select
      participant.profile_id,
      collection.item_reference,
      collection.winning_bid,
      item.hidden_grade,
      row_number() over(
        partition by participant.profile_id
        order by item.hidden_grade desc,collection.winning_bid asc,collection.item_reference
      ) as scoring_order
    from private.football_weekly_auction_participants participant
    left join lateral private.football_weekly_nfl_team_season_effective_collection(
      p_week_start,participant.profile_id
    ) collection on true
    left join private.football_weekly_auction_items item
      on item.item_reference=collection.item_reference
    where participant.week_start=p_week_start
  ),
  summarized as (
    select
      profile_id,
      count(item_reference)::integer as owned_count,
      case when count(item_reference)>=4
        then round(avg(hidden_grade) filter(where scoring_order<=4),2)
        else null end as final_score,
      case when count(item_reference)>=4
        then coalesce(sum(winning_bid) filter(where scoring_order<=4),0)::integer
        else null end as scoring_cost,
      coalesce(
        array_agg(item_reference order by scoring_order)
          filter(where item_reference is not null and scoring_order<=4),
        array[]::text[]
      ) as scoring_refs
    from effective
    group by profile_id
  )
  select p_week_start,profile_id,owned_count,final_score,scoring_cost,scoring_refs,random()
  from summarized;

  if exists(
    select 1 from private.football_weekly_auction_results
    where week_start=p_week_start and owned_count<4
  ) then
    raise exception 'NFL Team-Seasons finalization found an incomplete collection after autofill';
  end if;

  with ranked as (
    select profile_id,row_number() over(
      order by final_score desc nulls last,scoring_cost asc nulls last,tie_random,profile_id
    )::integer as final_rank
    from private.football_weekly_auction_results
    where week_start=p_week_start
  )
  update private.football_weekly_auction_results result
  set final_rank=ranked.final_rank,is_winner=ranked.final_rank=1
  from ranked
  where result.week_start=p_week_start and result.profile_id=ranked.profile_id;

  update private.football_weekly_auction_weeks
  set finalized_at=p_at
  where week_start=p_week_start;
end;
$$;
revoke all on function private.finalize_football_weekly_nfl_team_season_week(date,timestamptz)
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
  v_join_lock_at timestamptz;
  v_due record;
  v_week record;
  v_wild_lock timestamptz;
begin
  if (p_at at time zone 'America/Chicago')::date<date '2026-09-15' then return; end if;

  v_week_start:=private.football_weekly_auction_week_start(p_at);
  perform private.materialize_football_weekly_auction_week(v_week_start);
  perform private.materialize_football_weekly_auction_participants(v_week_start);

  select subject_key into v_subject
  from private.football_weekly_auction_weeks
  where week_start=v_week_start;

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
    where not (
      v_subject='nfl-best-team-seasons-since-2000'
      and board.day_index=7
    )
    group by board.week_start,board.day_index
    having min(board.lock_at)<=p_at
       and (
         select count(*)
         from private.football_weekly_auction_awards award
         where award.week_start=board.week_start
           and award.day_index=board.day_index
       ) < private.football_weekly_auction_cards_for_day(board.week_start,board.day_index)
    order by board.week_start,board.day_index
  loop
    perform private.resolve_football_weekly_auction_day(v_due.week_start,v_due.day_index,p_at);
  end loop;

  -- Sweep every unresolved NFL Team-Seasons finale whose Day 7 has begun.
  -- This deliberately includes the prior calendar week so a first request just
  -- after Tuesday rollover still resolves/persists Monday's Wildcard/Reaping
  -- exactly once instead of stranding the completed week.
  for v_week in
    select week.week_start
    from private.football_weekly_auction_weeks week
    where week.finalized_at is null
      and week.subject_key='nfl-best-team-seasons-since-2000'
      and p_at>=((week.week_start+6)::timestamp at time zone 'America/Chicago')
    order by week.week_start
  loop
    perform private.materialize_football_weekly_nfl_team_season_wildcard(v_week.week_start);

    select max(lock_at) into v_wild_lock
    from private.football_weekly_nfl_team_season_wildcard_board
    where week_start=v_week.week_start;

    if v_wild_lock is not null and p_at>=v_wild_lock then
      perform private.resolve_football_weekly_nfl_team_season_wildcard(
        v_week.week_start,p_at
      );
      perform private.finalize_football_weekly_nfl_team_season_week(
        v_week.week_start,p_at
      );
    end if;
  end loop;

  for v_week in
    select week.week_start
    from private.football_weekly_auction_weeks week
    where week.finalized_at is null
      and week.subject_key<>'nfl-best-team-seasons-since-2000'
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

create or replace function private.football_weekly_nfl_team_season_final_payload(
  p_week_start date,p_profile_id uuid
)
returns jsonb
language sql
stable security definer
set search_path=''
as $$
  with standings as (
    select coalesce(jsonb_agg(jsonb_build_object(
      'rank',result.final_rank,
      'profile_id',result.profile_id,
      'display_name',profile.display_name,
      'final_score',result.final_score,
      'scoring_cost',result.scoring_cost,
      'owned_count',result.owned_count,
      'is_winner',result.is_winner,
      'is_current_user',result.profile_id=p_profile_id
    ) order by result.final_rank,profile.display_name),'[]'::jsonb) as payload
    from private.football_weekly_auction_results result
    join public.profiles profile on profile.id=result.profile_id
    where result.week_start=p_week_start
  ),
  collection as (
    select coalesce(jsonb_agg(jsonb_build_object(
      'item_reference',item.item_reference,
      'team_name',item.primary_name,
      'team_code',item.team_code,
      'season_year',item.season_year,
      'display_label',item.display_label,
      'grade',item.hidden_grade,
      'winning_bid',effective.winning_bid,
      'source',effective.source,
      'counts',item.item_reference=any(coalesce(result.scoring_refs,array[]::text[]))
    ) order by
      (item.item_reference=any(coalesce(result.scoring_refs,array[]::text[]))) desc,
      item.hidden_grade desc,item.season_year desc),'[]'::jsonb) as payload
    from private.football_weekly_nfl_team_season_effective_collection(p_week_start,p_profile_id) effective
    join private.football_weekly_auction_items item
      on item.item_reference=effective.item_reference
    left join private.football_weekly_auction_results result
      on result.week_start=p_week_start and result.profile_id=p_profile_id
  ),
  all_items as (
    select coalesce(jsonb_agg(jsonb_build_object(
      'day_index',board.day_index,
      'slot',board.slot,
      'item_reference',item.item_reference,
      'team_name',item.primary_name,
      'team_code',item.team_code,
      'season_year',item.season_year,
      'display_label',item.display_label,
      'grade',item.hidden_grade,
      'winning_bid',coalesce(award.winning_bid,0),
      'winner_profile_id',award.profile_id,
      'winner_display_name',profile.display_name
    ) order by board.day_index,board.slot),'[]'::jsonb) as payload
    from private.football_weekly_auction_board board
    join private.football_weekly_auction_items item
      on item.item_reference=board.season_reference
    left join private.football_weekly_auction_awards award
      on award.week_start=board.week_start
     and award.day_index=board.day_index
     and award.slot=board.slot
    left join public.profiles profile on profile.id=award.profile_id
    where board.week_start=p_week_start
      and board.day_index between 1 and 6
      and board.slot<=private.football_weekly_auction_cards_for_day(board.week_start,board.day_index)
  ),
  mine as (
    select to_jsonb(result) as payload
    from private.football_weekly_auction_results result
    where result.week_start=p_week_start and result.profile_id=p_profile_id
  ),
  wildcard as (
    select private.football_weekly_nfl_team_season_wildcard_state(
      p_week_start,p_profile_id,(p_week_start+7)::timestamp at time zone 'America/Chicago'
    ) as payload
  )
  select jsonb_build_object(
    'subject_key','nfl-best-team-seasons-since-2000',
    'week_start',p_week_start,
    'standings',standings.payload,
    'collection',collection.payload,
    'all_teams',all_items.payload,
    'wildcard',wildcard.payload,
    'my_result',coalesce(mine.payload,'{}'::jsonb)
  )
  from standings,collection,all_items,wildcard
  left join mine on true;
$$;
revoke all on function private.football_weekly_nfl_team_season_final_payload(date,uuid)
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
  v_day integer;
  v_previous date;
  v_starting integer;
  v_bankroll integer;
  v_owned integer;
  v_card_count integer;
  v_submitted boolean;
  v_show_intro boolean;
  v_theme text;
  v_cards jsonb:='[]'::jsonb;
  v_bids jsonb:='{}'::jsonb;
  v_prior jsonb:='[]'::jsonb;
  v_collection jsonb:='[]'::jsonb;
  v_wildcard jsonb:=null;
  v_previous_final jsonb:=null;
begin
  if v_profile is null then raise exception 'sign in required'; end if;

  perform private.maintain_football_weekly_auction(p_at);
  v_week_start:=private.football_weekly_auction_week_start(p_at);
  v_day:=private.football_weekly_auction_day_index(p_at,v_week_start);
  v_previous:=v_week_start-7;

  if not exists(
    select 1 from private.football_weekly_auction_participants
    where week_start=v_week_start and profile_id=v_profile
  ) then
    return jsonb_build_object(
      'available',false,
      'subject_key','nfl-best-team-seasons-since-2000',
      'locked_this_week',true,
      'week_start',v_week_start,
      'eligible_week_start',v_week_start+7
    );
  end if;

  if exists(
    select 1 from private.football_weekly_auction_results
    where week_start=v_previous and profile_id=v_profile
  ) and not exists(
    select 1 from private.football_weekly_auction_final_views
    where week_start=v_previous and profile_id=v_profile
  ) then
    v_previous_final:=private.football_weekly_auction_final_payload(v_previous,v_profile);
  end if;

  v_starting:=private.football_weekly_auction_starting_bankroll(v_week_start,v_profile,50);
  select
    v_starting-coalesce(sum(award.winning_bid),0)::integer,
    count(award.profile_id)::integer
  into v_bankroll,v_owned
  from private.football_weekly_auction_awards award
  where award.week_start=v_week_start
    and award.day_index between 1 and 6
    and award.profile_id=v_profile;

  if v_day between 1 and 6 then
    v_card_count:=private.football_weekly_auction_cards_for_day(v_week_start,v_day);
    select min(theme) into v_theme
    from private.football_weekly_auction_board
    where week_start=v_week_start and day_index=v_day and slot<=v_card_count;

    select coalesce(jsonb_agg(jsonb_build_object(
      'slot',board.slot,
      'item_reference',item.item_reference,
      'team_name',item.primary_name,
      'team_code',item.team_code,
      'season_year',item.season_year,
      'display_label',item.display_label,
      'card_tag',item.grading_inputs->>'card_tag',
      'lock_at',board.lock_at
    ) order by board.slot),'[]'::jsonb)
    into v_cards
    from private.football_weekly_auction_board board
    join private.football_weekly_auction_items item
      on item.item_reference=board.season_reference
    where board.week_start=v_week_start
      and board.day_index=v_day
      and board.slot<=v_card_count;

    select coalesce(jsonb_object_agg(bid.slot::text,bid.amount),'{}'::jsonb)
    into v_bids
    from private.football_weekly_auction_bids bid
    where bid.week_start=v_week_start
      and bid.day_index=v_day
      and bid.profile_id=v_profile
      and bid.slot<=v_card_count;

    select exists(
      select 1 from private.football_weekly_auction_daily_entries
      where week_start=v_week_start and day_index=v_day and profile_id=v_profile
    ) into v_submitted;
  else
    v_theme:='Wildcard Finale';
    perform private.materialize_football_weekly_nfl_team_season_wildcard(v_week_start);
    v_wildcard:=private.football_weekly_nfl_team_season_wildcard_state(v_week_start,v_profile,p_at);
    select exists(
      select 1 from private.football_weekly_nfl_team_season_wildcard_submissions
      where week_start=v_week_start and profile_id=v_profile
    ) into v_submitted;
  end if;

  select not exists(
    select 1 from private.football_weekly_auction_daily_entries
    where week_start=v_week_start and profile_id=v_profile
  ) into v_show_intro;

  if v_day>1 then
    select coalesce(jsonb_agg(result_row.payload order by result_row.slot),'[]'::jsonb)
    into v_prior
    from (
      select board.slot,jsonb_build_object(
        'slot',board.slot,
        'item_reference',item.item_reference,
        'team_name',item.primary_name,
        'team_code',item.team_code,
        'season_year',item.season_year,
        'display_label',item.display_label,
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
          where entry.week_start=v_week_start
            and entry.day_index=least(v_day-1,6)
        ),'[]'::jsonb)
      ) as payload
      from private.football_weekly_auction_board board
      join private.football_weekly_auction_items item
        on item.item_reference=board.season_reference
      join private.football_weekly_auction_awards award
        on award.week_start=board.week_start
       and award.day_index=board.day_index
       and award.slot=board.slot
      left join public.profiles winner on winner.id=award.profile_id
      where board.week_start=v_week_start
        and board.day_index=least(v_day-1,6)
        and board.slot<=private.football_weekly_auction_cards_for_day(v_week_start,least(v_day-1,6))
    ) result_row;
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'item_reference',item.item_reference,
    'team_name',item.primary_name,
    'team_code',item.team_code,
    'season_year',item.season_year,
    'display_label',item.display_label,
    'winning_bid',effective.winning_bid,
    'source',effective.source
  ) order by item.season_year desc,item.primary_name),'[]'::jsonb)
  into v_collection
  from private.football_weekly_nfl_team_season_effective_collection(v_week_start,v_profile) effective
  join private.football_weekly_auction_items item
    on item.item_reference=effective.item_reference;

  return jsonb_build_object(
    'available',true,
    'subject_key','nfl-best-team-seasons-since-2000',
    'week_start',v_week_start,
    'week_end',v_week_start+6,
    'day_index',least(greatest(v_day,1),7),
    'starting_bankroll',v_starting,
    'bankroll',v_bankroll,
    'owned_count',jsonb_array_length(v_collection),
    'reserve_floor',0,
    'max_commit',v_bankroll,
    'submitted_today',coalesce(v_submitted,false),
    'show_intro',v_show_intro,
    'theme',v_theme,
    'teams',v_cards,
    'bids',v_bids,
    'prior_results',v_prior,
    'collection',v_collection,
    'wildcard',v_wildcard,
    'previous_final',v_previous_final
  );
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

create or replace function public.submit_my_football_weekly_nfl_team_season_wildcard(
  p_entries integer,
  p_rankings jsonb,
  p_at timestamptz default now()
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $nfl_wildcard_submit$
declare
  v_profile uuid:=auth.uid();
  v_week_start date;
  v_subject text;
  v_rankings text[];
begin
  if v_profile is null then
    raise exception 'sign in required';
  end if;
  if p_rankings is null or jsonb_typeof(p_rankings)<>'array' then
    raise exception 'Wildcard rankings must be an array';
  end if;

  perform private.maintain_football_weekly_auction(p_at);
  v_week_start:=private.football_weekly_auction_week_start(p_at);

  select subject_key into v_subject
  from private.football_weekly_auction_weeks
  where week_start=v_week_start;

  if v_subject<>'nfl-best-team-seasons-since-2000'
    or private.football_weekly_auction_day_index(p_at,v_week_start)<>7
  then
    raise exception 'NFL Team-Seasons Wildcard is only available on its Day 7';
  end if;

  select coalesce(array_agg(value order by ordinal),array[]::text[])
  into v_rankings
  from jsonb_array_elements_text(p_rankings) with ordinality ranked(value,ordinal);

  perform private.submit_football_weekly_nfl_team_season_wildcard(
    v_week_start,v_profile,p_entries,v_rankings,p_at
  );

  -- Idempotent before the deadline; once the lock has passed, the shared
  -- maintainer or this submit path can persist the exact same resolution.
  perform private.resolve_football_weekly_nfl_team_season_wildcard(
    v_week_start,p_at
  );

  -- Return the complete Weekly Auction state expected by the shared frontend,
  -- not only the nested Wildcard fragment.
  return private.get_my_football_weekly_nfl_team_season(p_at);
end;
$nfl_wildcard_submit$;
revoke all on function public.submit_my_football_weekly_nfl_team_season_wildcard(integer,jsonb,timestamptz)
  from public,anon;
grant execute on function public.submit_my_football_weekly_nfl_team_season_wildcard(integer,jsonb,timestamptz)
  to authenticated;

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
  v_payload jsonb;
  v_default_bankroll integer;
  v_adjusted_start integer;
  v_adjusted_bankroll integer;
  v_adjusted_max integer;
  v_reserve_floor integer;
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
    v_payload:=private.get_my_football_weekly_superteam(p_at);
    v_default_bankroll:=50;
  elsif v_subject='nfl-build-qb' then
    v_payload:=private.get_my_football_weekly_build_qb(p_at);
    v_default_bankroll:=40;
  else
    v_payload:=private.get_my_football_weekly_auction_cfb(p_at)
      || jsonb_build_object('subject_key',coalesce(v_subject,'cfb-best-teams-since-2000'));
    v_default_bankroll:=40;
  end if;

  if coalesce((v_payload->>'available')::boolean,false) is not true then
    return v_payload;
  end if;

  v_adjusted_start:=private.football_weekly_auction_starting_bankroll(
    v_week_start,v_profile,v_default_bankroll
  );

  if v_adjusted_start=v_default_bankroll then
    return v_payload;
  end if;

  v_adjusted_bankroll:=greatest(
    coalesce((v_payload->>'bankroll')::integer,0)
      +(v_adjusted_start-v_default_bankroll),
    0
  );

  if v_subject='cfb-superteam' then
    v_reserve_floor:=coalesce((v_payload->>'reserve_floor')::integer,0);
    v_adjusted_max:=greatest(
      v_adjusted_bankroll-greatest(v_reserve_floor-2,0),
      0
    );
  else
    v_adjusted_max:=v_adjusted_bankroll;
  end if;

  return v_payload||jsonb_build_object(
    'bankroll',v_adjusted_bankroll,
    'max_commit',v_adjusted_max
  );
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
  v_default_bankroll integer;
  v_starting_bankroll integer;
  v_bankroll integer;
  v_owned integer;
  v_card_count integer;
  v_slot integer;
  v_bid integer;
  v_entry jsonb;
  v_amounts integer[]:=array[]::integer[];
  v_total integer:=0;
  v_open_slots integer;
  v_max_wins integer;
  v_single_commit integer;
  v_top_commit integer;
  v_reserve_after integer;
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
  end if;

  v_default_bankroll:=case when v_subject='cfb-superteam' then 50 else 40 end;
  v_starting_bankroll:=private.football_weekly_auction_starting_bankroll(
    v_week_start,v_profile,v_default_bankroll
  );

  -- Existing subject engines keep their original bankroll logic. Reaping is
  -- enforced one layer above them only when this player's next-week bankroll
  -- was actually reduced.
  if v_starting_bankroll<v_default_bankroll then
    if jsonb_typeof(p_bids)<>'object' then
      raise exception 'bids must be an object';
    end if;

    select
      greatest(v_starting_bankroll-coalesce(sum(award.winning_bid),0)::integer,0),
      count(*)::integer
    into v_bankroll,v_owned
    from private.football_weekly_auction_awards award
    where award.week_start=v_week_start
      and award.profile_id=v_profile;

    if v_subject='cfb-superteam' then
      v_card_count:=private.football_weekly_auction_cards_for_day(
        v_week_start,
        private.football_weekly_auction_day_index(p_at,v_week_start)
      );
      v_amounts:=array[]::integer[];

      for v_slot in 1..v_card_count loop
        v_entry:=p_bids->v_slot::text;
        if v_entry is null or jsonb_typeof(v_entry)<>'object' then
          raise exception 'Each CFB Superteam bid needs an amount and priority';
        end if;
        begin
          v_bid:=coalesce((v_entry->>'amount')::integer,0);
        exception when others then
          raise exception 'CFB Superteam bids and priorities must be whole numbers';
        end;
        v_amounts:=array_append(v_amounts,v_bid);
      end loop;

      select count(award.roster_slot)::integer into v_owned
      from private.football_weekly_auction_awards award
      where award.week_start=v_week_start
        and award.profile_id=v_profile
        and award.roster_slot is not null;

      v_open_slots:=greatest(7-v_owned,0);
      v_max_wins:=least(2,v_open_slots);

      select coalesce(max(value),0)::integer into v_single_commit
      from unnest(v_amounts) value;

      if v_single_commit>v_bankroll-greatest(v_open_slots-1,0) then
        raise exception 'Any single CFB Superteam win must leave $1 for every roster spot still open after it';
      end if;

      select coalesce(sum(value),0)::integer into v_top_commit
      from (
        select value
        from unnest(v_amounts) value
        order by value desc
        limit v_max_wins
      ) top_values;

      v_reserve_after:=greatest(v_open_slots-v_max_wins,0);
      if v_top_commit>v_bankroll-v_reserve_after then
        raise exception 'Your two highest possible wins must leave $1 for every remaining open roster slot';
      end if;

    elsif v_subject='nfl-build-qb' then
      v_amounts:=array[]::integer[];
      for v_slot in 1..4 loop
        begin
          v_bid:=coalesce((p_bids->>v_slot::text)::integer,0);
        exception when others then
          raise exception 'Weekly Auction bids must be whole-dollar integers';
        end;
        v_amounts:=array_append(v_amounts,v_bid);
      end loop;

      if not private.football_weekly_auction_bids_preserve_required_completion(
        v_bankroll,4,v_owned,v_amounts
      ) then
        raise exception 'Today''s bids must leave at least $1 for every Build a QB trait you could still need';
      end if;

    else
      v_total:=0;
      for v_slot in 1..3 loop
        begin
          v_bid:=coalesce((p_bids->>v_slot::text)::integer,0);
        exception when others then
          raise exception 'Weekly Auction bids must be whole-dollar integers';
        end;
        v_total:=v_total+v_bid;
      end loop;

      if v_total>v_bankroll then
        raise exception 'Today''s bids exceed the available Weekly Auction commitment of $%',v_bankroll;
      end if;
    end if;
  end if;

  if v_subject='cfb-superteam' then
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
create or replace function public.football_weekly_auction_daily_gate(
  p_profile_id uuid,p_at timestamptz default now()
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_week_start date;
  v_day integer;
  v_subject text;
  v_required boolean;
  v_field_locked boolean;
  v_capacity integer:=null;
  v_field_size integer:=null;
begin
  if p_profile_id is null then raise exception 'profile required'; end if;
  if (p_at at time zone 'America/Chicago')::date<date '2026-09-15' then
    return jsonb_build_object('required',false,'available',false);
  end if;

  perform private.maintain_football_weekly_auction(p_at);
  v_week_start:=private.football_weekly_auction_week_start(p_at);
  v_day:=private.football_weekly_auction_day_index(p_at,v_week_start);
  perform private.ensure_football_weekly_auction_participant(v_week_start,p_profile_id,p_at);

  select field_locked_at is not null,subject_key
  into v_field_locked,v_subject
  from private.football_weekly_auction_weeks
  where week_start=v_week_start;

  if v_subject='cfb-superteam' then
    v_capacity:=private.football_weekly_superteam_join_capacity(v_week_start,p_at);
    select count(*)::integer into v_field_size
    from private.football_weekly_auction_participants
    where week_start=v_week_start;
  end if;

  if not exists(
    select 1 from private.football_weekly_auction_participants
    where week_start=v_week_start and profile_id=p_profile_id
  ) then
    return jsonb_build_object(
      'required',false,'available',false,'field_locked',v_field_locked,
      'capacity_reached',coalesce(v_capacity is not null and v_field_size>=v_capacity,false),
      'week_start',v_week_start,'day_index',v_day,'eligible_week_start',v_week_start+7
    );
  end if;

  if v_subject='nfl-best-team-seasons-since-2000' and v_day>=7 then
    select not exists(
      select 1
      from private.football_weekly_nfl_team_season_wildcard_submissions
      where week_start=v_week_start and profile_id=p_profile_id
    ) into v_required;
  else
    select not exists(
      select 1 from private.football_weekly_auction_daily_entries
      where week_start=v_week_start and day_index=v_day and profile_id=p_profile_id
    ) into v_required;
  end if;

  return jsonb_build_object(
    'required',v_required,'available',true,'field_locked',v_field_locked,
    'week_start',v_week_start,'day_index',least(greatest(v_day,1),7)
  );
end;
$$;
revoke all on function public.football_weekly_auction_daily_gate(uuid,timestamptz)
  from public,anon;
grant execute on function public.football_weekly_auction_daily_gate(uuid,timestamptz)
  to authenticated;

create or replace function public.get_football_weekly_auction_table(p_at timestamptz default now())
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_profile uuid:=auth.uid();
  v_week_start date;
  v_subject text;
  v_default_bankroll integer;
  v_table jsonb:='[]'::jsonb;
begin
  if v_profile is null then raise exception 'sign in required'; end if;
  if (p_at at time zone 'America/Chicago')::date<date '2026-09-15' then return '[]'::jsonb; end if;

  perform private.maintain_football_weekly_auction(p_at);
  v_week_start:=private.football_weekly_auction_week_start(p_at);
  select subject_key into v_subject
  from private.football_weekly_auction_weeks where week_start=v_week_start;

  if v_subject<>'nfl-best-team-seasons-since-2000' then
    -- Preserve the existing generic CFB table only for CFB best-team weeks.
    -- Build-a-QB and Superteam own their dedicated table presentations.
    if v_subject<>'cfb-best-teams-since-2000' then return '[]'::jsonb; end if;
    v_default_bankroll:=40;
  else
    v_default_bankroll:=50;
  end if;

  with participants as (
    select participant.profile_id
    from private.football_weekly_auction_participants participant
    where participant.week_start=v_week_start
  ), summaries as (
    select
      participant.profile_id,
      coalesce(profile.display_name,'Player') as display_name,
      participant.profile_id=v_profile as is_current_user,
      private.football_weekly_auction_starting_bankroll(
        v_week_start,participant.profile_id,v_default_bankroll
      )-coalesce(sum(award.winning_bid),0)::integer as bankroll,
      count(award.profile_id)::integer as owned_count,
      coalesce(jsonb_agg(jsonb_build_object(
        'season_reference',board.season_reference,
        'school',coalesce(item.primary_name,pool.school),
        'team_code',item.team_code,
        'season_year',coalesce(item.season_year,pool.season_year),
        'display_label',coalesce(item.display_label,pool.display_label),
        'price_paid',award.winning_bid
      ) order by award.day_index,award.slot)
        filter(where award.profile_id is not null),'[]'::jsonb) as teams
    from participants participant
    join public.profiles profile on profile.id=participant.profile_id
    left join private.football_weekly_auction_awards award
      on award.week_start=v_week_start and award.profile_id=participant.profile_id
    left join private.football_weekly_auction_board board
      on board.week_start=award.week_start
     and board.day_index=award.day_index
     and board.slot=award.slot
    left join private.football_weekly_auction_items item
      on item.item_reference=board.season_reference
    left join private.draft_room_cfb_best_teams_pool pool
      on pool.season_reference=board.season_reference
    group by participant.profile_id,profile.display_name
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'profile_id',summary.profile_id,
    'display_name',summary.display_name,
    'is_current_user',summary.is_current_user,
    'bankroll',summary.bankroll,
    'owned_count',summary.owned_count,
    'teams',summary.teams
  ) order by summary.is_current_user desc,lower(summary.display_name),summary.profile_id),'[]'::jsonb)
  into v_table
  from summaries summary;

  return v_table;
end;
$$;
revoke all on function public.get_football_weekly_auction_table(timestamptz)
  from public,anon;
grant execute on function public.get_football_weekly_auction_table(timestamptz)
  to authenticated;

-- Reaping bankroll adjustments for legacy subjects are applied by the public
-- Weekly Auction getter/submit router above. Their private engines remain unchanged.

do $nfl_runtime_contract$
declare v_subject text;
begin
  v_subject:=private.football_weekly_auction_subject_for_week(date '2026-10-06');
  if v_subject<>'nfl-best-team-seasons-since-2000' then
    raise exception 'Oct. 6 Weekly Auction must rotate to NFL Team-Seasons, got %',v_subject;
  end if;
end
$nfl_runtime_contract$;
