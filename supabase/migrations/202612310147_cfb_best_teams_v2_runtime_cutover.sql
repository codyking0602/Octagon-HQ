-- CFB Best Teams Auction v2 runtime cutover.
-- Legacy Casual rooms and the already-materialized 2026-09-15 Weekly board remain on v1.
-- New Casual rooms use the locked 257-team authority immediately; Weekly switches 2026-09-22.

create table private.cfb_best_teams_v2_authority (
  season_reference text primary key,
  season_year integer not null check (season_year between 2000 and 2025),
  school text not null,
  conference_bucket text not null check (conference_bucket in ('SEC','Big Ten','Big 12','ACC','Notre Dame','Wildcard')),
  display_label text not null unique,
  hidden_grade numeric(5,2) not null check (hidden_grade between 74 and 100 and hidden_grade * 2 = trunc(hidden_grade * 2)),
  unique(school,season_year)
);
revoke all on private.cfb_best_teams_v2_authority from public,anon,authenticated;

insert into private.cfb_best_teams_v2_authority(season_reference,season_year,school,conference_bucket,display_label,hidden_grade) values
  ('cfb-best-florida-state-2000', 2000, 'Florida State', 'ACC', 'Florida State · 2000', 86.0),
  ('cfb-best-miami-2000', 2000, 'Miami', 'ACC', 'Miami · 2000', 89.0),
  ('cfb-best-oklahoma-2000', 2000, 'Oklahoma', 'SEC', 'Oklahoma · 2000', 93.0),
  ('cfb-v2-oregon-state-2000', 2000, 'Oregon State', 'Wildcard', 'Oregon State · 2000', 87.5),
  ('weekly-cfb-virginia-tech-2000', 2000, 'Virginia Tech', 'ACC', 'Virginia Tech · 2000', 85.0),
  ('cfb-best-colorado-2001', 2001, 'Colorado', 'Big 12', 'Colorado · 2001', 78.5),
  ('weekly-cfb-florida-2001', 2001, 'Florida', 'SEC', 'Florida · 2001', 88.0),
  ('cfb-best-miami-2001', 2001, 'Miami', 'ACC', 'Miami · 2001', 100.0),
  ('cfb-best-nebraska-2001', 2001, 'Nebraska', 'Big Ten', 'Nebraska · 2001', 83.5),
  ('weekly-cfb-oregon-2001', 2001, 'Oregon', 'Big Ten', 'Oregon · 2001', 87.0),
  ('weekly-cfb-georgia-2002', 2002, 'Georgia', 'SEC', 'Georgia · 2002', 88.0),
  ('cfb-v2-iowa-2002', 2002, 'Iowa', 'Big Ten', 'Iowa · 2002', 85.0),
  ('cfb-best-miami-2002', 2002, 'Miami', 'ACC', 'Miami · 2002', 92.5),
  ('cfb-best-nc-state-2002', 2002, 'NC State', 'ACC', 'NC State · 2002', 77.0),
  ('cfb-best-ohio-state-2002', 2002, 'Ohio State', 'Big Ten', 'Ohio State · 2002', 92.0),
  ('weekly-cfb-oklahoma-2002', 2002, 'Oklahoma', 'SEC', 'Oklahoma · 2002', 86.0),
  ('weekly-cfb-usc-2002', 2002, 'USC', 'Big Ten', 'USC · 2002', 88.0),
  ('cfb-v2-kansas-state-2003', 2003, 'Kansas State', 'Big 12', 'Kansas State · 2003', 80.5),
  ('cfb-best-lsu-2003', 2003, 'LSU', 'SEC', 'LSU · 2003', 92.0),
  ('cfb-v2-miami-oh-2003', 2003, 'Miami (OH)', 'Wildcard', 'Miami (OH) · 2003', 82.0),
  ('weekly-cfb-oklahoma-2003', 2003, 'Oklahoma', 'SEC', 'Oklahoma · 2003', 88.0),
  ('cfb-best-usc-2003', 2003, 'USC', 'Big Ten', 'USC · 2003', 90.5),
  ('cfb-best-auburn-2004', 2004, 'Auburn', 'SEC', 'Auburn · 2004', 91.5),
  ('cfb-best-california-2004', 2004, 'California', 'ACC', 'California · 2004', 81.5),
  ('weekly-cfb-oklahoma-2004', 2004, 'Oklahoma', 'SEC', 'Oklahoma · 2004', 89.0),
  ('cfb-best-usc-2004', 2004, 'USC', 'Big Ten', 'USC · 2004', 97.5),
  ('cfb-best-utah-2004', 2004, 'Utah', 'Big 12', 'Utah · 2004', 86.0),
  ('weekly-cfb-notre-dame-2005', 2005, 'Notre Dame', 'Notre Dame', 'Notre Dame · 2005', 80.5),
  ('cfb-best-penn-state-2005', 2005, 'Penn State', 'Big Ten', 'Penn State · 2005', 87.0),
  ('cfb-best-texas-2005', 2005, 'Texas', 'SEC', 'Texas · 2005', 98.0),
  ('cfb-best-usc-2005', 2005, 'USC', 'Big Ten', 'USC · 2005', 93.5),
  ('cfb-best-virginia-tech-2005', 2005, 'Virginia Tech', 'ACC', 'Virginia Tech · 2005', 81.5),
  ('cfb-best-west-virginia-2005', 2005, 'West Virginia', 'Big 12', 'West Virginia · 2005', 85.0),
  ('weekly-cfb-boise-state-2006', 2006, 'Boise State', 'Wildcard', 'Boise State · 2006', 85.5),
  ('cfb-best-florida-2006', 2006, 'Florida', 'SEC', 'Florida · 2006', 92.0),
  ('cfb-best-louisville-2006', 2006, 'Louisville', 'ACC', 'Louisville · 2006', 85.0),
  ('weekly-cfb-lsu-2006', 2006, 'LSU', 'SEC', 'LSU · 2006', 87.0),
  ('cfb-v2-michigan-2006', 2006, 'Michigan', 'Big Ten', 'Michigan · 2006', 86.0),
  ('weekly-cfb-notre-dame-2006', 2006, 'Notre Dame', 'Notre Dame', 'Notre Dame · 2006', 77.5),
  ('cfb-best-ohio-state-2006', 2006, 'Ohio State', 'Big Ten', 'Ohio State · 2006', 88.0),
  ('cfb-v2-rutgers-2006', 2006, 'Rutgers', 'Big Ten', 'Rutgers · 2006', 81.5),
  ('weekly-cfb-usc-2006', 2006, 'USC', 'Big Ten', 'USC · 2006', 87.0),
  ('cfb-best-wake-forest-2006', 2006, 'Wake Forest', 'ACC', 'Wake Forest · 2006', 76.0),
  ('cfb-best-boston-college-2007', 2007, 'Boston College', 'ACC', 'Boston College · 2007', 80.0),
  ('weekly-cfb-florida-2007', 2007, 'Florida', 'SEC', 'Florida · 2007', 80.0),
  ('weekly-cfb-hawaii-2007', 2007, 'Hawaii', 'Wildcard', 'Hawaii · 2007', 76.0),
  ('cfb-best-kansas-2007', 2007, 'Kansas', 'Big 12', 'Kansas · 2007', 81.5),
  ('cfb-best-lsu-2007', 2007, 'LSU', 'SEC', 'LSU · 2007', 90.5),
  ('cfb-v2-missouri-2007', 2007, 'Missouri', 'SEC', 'Missouri · 2007', 86.0),
  ('cfb-v2-oklahoma-2007', 2007, 'Oklahoma', 'SEC', 'Oklahoma · 2007', 84.0),
  ('weekly-cfb-oregon-2007', 2007, 'Oregon', 'Big Ten', 'Oregon · 2007', 77.0),
  ('weekly-cfb-usc-2007', 2007, 'USC', 'Big Ten', 'USC · 2007', 85.0),
  ('cfb-best-west-virginia-2007', 2007, 'West Virginia', 'Big 12', 'West Virginia · 2007', 84.5),
  ('cfb-v2-alabama-2008', 2008, 'Alabama', 'SEC', 'Alabama · 2008', 85.5),
  ('cfb-v2-boise-state-2008', 2008, 'Boise State', 'Wildcard', 'Boise State · 2008', 82.0),
  ('cfb-best-florida-2008', 2008, 'Florida', 'SEC', 'Florida · 2008', 96.0),
  ('cfb-best-oklahoma-2008', 2008, 'Oklahoma', 'SEC', 'Oklahoma · 2008', 89.0),
  ('weekly-cfb-texas-2008', 2008, 'Texas', 'SEC', 'Texas · 2008', 90.5),
  ('cfb-best-texas-tech-2008', 2008, 'Texas Tech', 'Big 12', 'Texas Tech · 2008', 81.5),
  ('cfb-best-usc-2008', 2008, 'USC', 'Big Ten', 'USC · 2008', 88.0),
  ('cfb-best-utah-2008', 2008, 'Utah', 'Big 12', 'Utah · 2008', 86.0),
  ('cfb-best-alabama-2009', 2009, 'Alabama', 'SEC', 'Alabama · 2009', 95.0),
  ('weekly-cfb-boise-state-2009', 2009, 'Boise State', 'Wildcard', 'Boise State · 2009', 87.0),
  ('cfb-best-cincinnati-2009', 2009, 'Cincinnati', 'Big 12', 'Cincinnati · 2009', 84.0),
  ('weekly-cfb-florida-2009', 2009, 'Florida', 'SEC', 'Florida · 2009', 90.5),
  ('cfb-best-iowa-2009', 2009, 'Iowa', 'Big Ten', 'Iowa · 2009', 83.5),
  ('cfb-v2-oregon-2009', 2009, 'Oregon', 'Big Ten', 'Oregon · 2009', 81.0),
  ('weekly-cfb-tcu-2009', 2009, 'TCU', 'Big 12', 'TCU · 2009', 84.0),
  ('weekly-cfb-texas-2009', 2009, 'Texas', 'SEC', 'Texas · 2009', 90.0),
  ('weekly-cfb-alabama-2010', 2010, 'Alabama', 'SEC', 'Alabama · 2010', 82.5),
  ('cfb-best-auburn-2010', 2010, 'Auburn', 'SEC', 'Auburn · 2010', 93.0),
  ('weekly-cfb-boise-state-2010', 2010, 'Boise State', 'Wildcard', 'Boise State · 2010', 84.0),
  ('cfb-v2-michigan-state-2010', 2010, 'Michigan State', 'Big Ten', 'Michigan State · 2010', 81.5),
  ('cfb-v2-nevada-2010', 2010, 'Nevada', 'Wildcard', 'Nevada · 2010', 83.0),
  ('weekly-cfb-oklahoma-state-2010', 2010, 'Oklahoma State', 'Big 12', 'Oklahoma State · 2010', 80.5),
  ('cfb-best-oregon-2010', 2010, 'Oregon', 'Big Ten', 'Oregon · 2010', 88.0),
  ('cfb-best-stanford-2010', 2010, 'Stanford', 'ACC', 'Stanford · 2010', 85.0),
  ('cfb-best-tcu-2010', 2010, 'TCU', 'Big 12', 'TCU · 2010', 89.0),
  ('cfb-best-virginia-tech-2010', 2010, 'Virginia Tech', 'ACC', 'Virginia Tech · 2010', 80.5),
  ('cfb-best-wisconsin-2010', 2010, 'Wisconsin', 'Big Ten', 'Wisconsin · 2010', 80.5),
  ('cfb-best-alabama-2011', 2011, 'Alabama', 'SEC', 'Alabama · 2011', 96.0),
  ('cfb-best-arkansas-2011', 2011, 'Arkansas', 'SEC', 'Arkansas · 2011', 85.0),
  ('weekly-cfb-boise-state-2011', 2011, 'Boise State', 'Wildcard', 'Boise State · 2011', 82.5),
  ('cfb-best-houston-2011', 2011, 'Houston', 'Big 12', 'Houston · 2011', 78.5),
  ('cfb-best-lsu-2011', 2011, 'LSU', 'SEC', 'LSU · 2011', 92.5),
  ('cfb-v2-michigan-2011', 2011, 'Michigan', 'Big Ten', 'Michigan · 2011', 82.0),
  ('weekly-cfb-oklahoma-2011', 2011, 'Oklahoma', 'SEC', 'Oklahoma · 2011', 80.5),
  ('cfb-best-oklahoma-state-2011', 2011, 'Oklahoma State', 'Big 12', 'Oklahoma State · 2011', 87.0),
  ('weekly-cfb-oregon-2011', 2011, 'Oregon', 'Big Ten', 'Oregon · 2011', 85.0),
  ('cfb-best-stanford-2011', 2011, 'Stanford', 'ACC', 'Stanford · 2011', 81.5),
  ('cfb-best-wisconsin-2011', 2011, 'Wisconsin', 'Big Ten', 'Wisconsin · 2011', 82.5),
  ('cfb-best-alabama-2012', 2012, 'Alabama', 'SEC', 'Alabama · 2012', 94.0),
  ('weekly-cfb-florida-2012', 2012, 'Florida', 'SEC', 'Florida · 2012', 84.0),
  ('cfb-best-florida-state-2012', 2012, 'Florida State', 'ACC', 'Florida State · 2012', 84.0),
  ('weekly-cfb-georgia-2012', 2012, 'Georgia', 'SEC', 'Georgia · 2012', 86.0),
  ('cfb-best-kansas-state-2012', 2012, 'Kansas State', 'Big 12', 'Kansas State · 2012', 83.0),
  ('weekly-cfb-northern-illinois-2012', 2012, 'Northern Illinois', 'Wildcard', 'Northern Illinois · 2012', 74.0),
  ('cfb-best-notre-dame-2012', 2012, 'Notre Dame', 'Notre Dame', 'Notre Dame · 2012', 86.0),
  ('cfb-v2-ohio-state-2012', 2012, 'Ohio State', 'Big Ten', 'Ohio State · 2012', 88.5),
  ('cfb-best-oregon-2012', 2012, 'Oregon', 'Big Ten', 'Oregon · 2012', 87.0),
  ('cfb-best-stanford-2012', 2012, 'Stanford', 'ACC', 'Stanford · 2012', 85.0),
  ('cfb-best-texas-aandm-2012', 2012, 'Texas A&M', 'SEC', 'Texas A&M · 2012', 83.5),
  ('weekly-cfb-alabama-2013', 2013, 'Alabama', 'SEC', 'Alabama · 2013', 84.5),
  ('cfb-best-auburn-2013', 2013, 'Auburn', 'SEC', 'Auburn · 2013', 87.5),
  ('cfb-best-baylor-2013', 2013, 'Baylor', 'Big 12', 'Baylor · 2013', 83.5),
  ('cfb-v2-clemson-2013', 2013, 'Clemson', 'ACC', 'Clemson · 2013', 84.5),
  ('cfb-best-duke-2013', 2013, 'Duke', 'ACC', 'Duke · 2013', 75.0),
  ('cfb-best-florida-state-2013', 2013, 'Florida State', 'ACC', 'Florida State · 2013', 98.5),
  ('weekly-cfb-fresno-state-2013', 2013, 'Fresno State', 'Wildcard', 'Fresno State · 2013', 77.0),
  ('cfb-best-louisville-2013', 2013, 'Louisville', 'ACC', 'Louisville · 2013', 82.5),
  ('cfb-best-michigan-state-2013', 2013, 'Michigan State', 'Big Ten', 'Michigan State · 2013', 86.0),
  ('cfb-best-missouri-2013', 2013, 'Missouri', 'SEC', 'Missouri · 2013', 84.0),
  ('cfb-v2-ohio-state-2013', 2013, 'Ohio State', 'Big Ten', 'Ohio State · 2013', 83.0),
  ('weekly-cfb-oregon-2013', 2013, 'Oregon', 'Big Ten', 'Oregon · 2013', 83.5),
  ('cfb-best-south-carolina-2013', 2013, 'South Carolina', 'SEC', 'South Carolina · 2013', 85.0),
  ('weekly-cfb-stanford-2013', 2013, 'Stanford', 'ACC', 'Stanford · 2013', 81.5),
  ('cfb-best-ucf-2013', 2013, 'UCF', 'Big 12', 'UCF · 2013', 83.5),
  ('weekly-cfb-alabama-2014', 2014, 'Alabama', 'SEC', 'Alabama · 2014', 86.0),
  ('cfb-best-arizona-2014', 2014, 'Arizona', 'Big 12', 'Arizona · 2014', 77.0),
  ('cfb-best-baylor-2014', 2014, 'Baylor', 'Big 12', 'Baylor · 2014', 84.0),
  ('cfb-v2-boise-state-2014', 2014, 'Boise State', 'Wildcard', 'Boise State · 2014', 82.5),
  ('cfb-best-florida-state-2014', 2014, 'Florida State', 'ACC', 'Florida State · 2014', 86.0),
  ('weekly-cfb-georgia-2014', 2014, 'Georgia', 'SEC', 'Georgia · 2014', 80.5),
  ('cfb-best-georgia-tech-2014', 2014, 'Georgia Tech', 'ACC', 'Georgia Tech · 2014', 83.5),
  ('cfb-v2-michigan-state-2014', 2014, 'Michigan State', 'Big Ten', 'Michigan State · 2014', 86.0),
  ('cfb-best-mississippi-state-2014', 2014, 'Mississippi State', 'SEC', 'Mississippi State · 2014', 78.5),
  ('cfb-best-ohio-state-2014', 2014, 'Ohio State', 'Big Ten', 'Ohio State · 2014', 94.0),
  ('cfb-best-oregon-2014', 2014, 'Oregon', 'Big Ten', 'Oregon · 2014', 89.0),
  ('cfb-best-tcu-2014', 2014, 'TCU', 'Big 12', 'TCU · 2014', 88.0),
  ('cfb-best-alabama-2015', 2015, 'Alabama', 'SEC', 'Alabama · 2015', 93.0),
  ('weekly-cfb-baylor-2015', 2015, 'Baylor', 'Big 12', 'Baylor · 2015', 79.5),
  ('cfb-best-clemson-2015', 2015, 'Clemson', 'ACC', 'Clemson · 2015', 90.0),
  ('cfb-best-houston-2015', 2015, 'Houston', 'Big 12', 'Houston · 2015', 83.0),
  ('cfb-best-iowa-2015', 2015, 'Iowa', 'Big Ten', 'Iowa · 2015', 79.5),
  ('cfb-best-michigan-state-2015', 2015, 'Michigan State', 'Big Ten', 'Michigan State · 2015', 84.0),
  ('cfb-best-north-carolina-2015', 2015, 'North Carolina', 'ACC', 'North Carolina · 2015', 78.5),
  ('weekly-cfb-notre-dame-2015', 2015, 'Notre Dame', 'Notre Dame', 'Notre Dame · 2015', 81.5),
  ('weekly-cfb-ohio-state-2015', 2015, 'Ohio State', 'Big Ten', 'Ohio State · 2015', 87.0),
  ('weekly-cfb-oklahoma-2015', 2015, 'Oklahoma', 'SEC', 'Oklahoma · 2015', 85.0),
  ('cfb-best-stanford-2015', 2015, 'Stanford', 'ACC', 'Stanford · 2015', 85.0),
  ('weekly-cfb-tcu-2015', 2015, 'TCU', 'Big 12', 'TCU · 2015', 83.5),
  ('cfb-best-alabama-2016', 2016, 'Alabama', 'SEC', 'Alabama · 2016', 92.5),
  ('cfb-best-clemson-2016', 2016, 'Clemson', 'ACC', 'Clemson · 2016', 94.0),
  ('weekly-cfb-michigan-2016', 2016, 'Michigan', 'Big Ten', 'Michigan · 2016', 82.0),
  ('weekly-cfb-ohio-state-2016', 2016, 'Ohio State', 'Big Ten', 'Ohio State · 2016', 86.0),
  ('cfb-best-penn-state-2016', 2016, 'Penn State', 'Big Ten', 'Penn State · 2016', 84.0),
  ('cfb-v2-usc-2016', 2016, 'USC', 'Big Ten', 'USC · 2016', 84.5),
  ('cfb-best-washington-2016', 2016, 'Washington', 'Big Ten', 'Washington · 2016', 85.0),
  ('weekly-cfb-west-virginia-2016', 2016, 'West Virginia', 'Big 12', 'West Virginia · 2016', 78.5),
  ('weekly-cfb-western-michigan-2016', 2016, 'Western Michigan', 'Wildcard', 'Western Michigan · 2016', 78.5),
  ('weekly-cfb-alabama-2017', 2017, 'Alabama', 'SEC', 'Alabama · 2017', 93.0),
  ('weekly-cfb-clemson-2017', 2017, 'Clemson', 'ACC', 'Clemson · 2017', 85.0),
  ('cfb-best-georgia-2017', 2017, 'Georgia', 'SEC', 'Georgia · 2017', 89.0),
  ('weekly-cfb-ohio-state-2017', 2017, 'Ohio State', 'Big Ten', 'Ohio State · 2017', 85.0),
  ('cfb-v2-oklahoma-2017', 2017, 'Oklahoma', 'SEC', 'Oklahoma · 2017', 88.5),
  ('weekly-cfb-penn-state-2017', 2017, 'Penn State', 'Big Ten', 'Penn State · 2017', 84.0),
  ('weekly-cfb-tcu-2017', 2017, 'TCU', 'Big 12', 'TCU · 2017', 81.5),
  ('cfb-best-ucf-2017', 2017, 'UCF', 'Big 12', 'UCF · 2017', 87.0),
  ('cfb-best-wisconsin-2017', 2017, 'Wisconsin', 'Big Ten', 'Wisconsin · 2017', 84.5),
  ('weekly-cfb-alabama-2018', 2018, 'Alabama', 'SEC', 'Alabama · 2018', 92.5),
  ('cfb-best-clemson-2018', 2018, 'Clemson', 'ACC', 'Clemson · 2018', 98.5),
  ('weekly-cfb-georgia-2018', 2018, 'Georgia', 'SEC', 'Georgia · 2018', 86.0),
  ('cfb-best-kentucky-2018', 2018, 'Kentucky', 'SEC', 'Kentucky · 2018', 74.0),
  ('weekly-cfb-michigan-2018', 2018, 'Michigan', 'Big Ten', 'Michigan · 2018', 79.5),
  ('cfb-best-notre-dame-2018', 2018, 'Notre Dame', 'Notre Dame', 'Notre Dame · 2018', 86.0),
  ('weekly-cfb-ohio-state-2018', 2018, 'Ohio State', 'Big Ten', 'Ohio State · 2018', 86.0),
  ('weekly-cfb-oklahoma-2018', 2018, 'Oklahoma', 'SEC', 'Oklahoma · 2018', 86.0),
  ('weekly-cfb-ucf-2018', 2018, 'UCF', 'Big 12', 'UCF · 2018', 81.5),
  ('cfb-v2-washington-state-2018', 2018, 'Washington State', 'Wildcard', 'Washington State · 2018', 83.5),
  ('weekly-cfb-alabama-2019', 2019, 'Alabama', 'SEC', 'Alabama · 2019', 84.5),
  ('cfb-v2-baylor-2019', 2019, 'Baylor', 'Big 12', 'Baylor · 2019', 82.5),
  ('cfb-best-clemson-2019', 2019, 'Clemson', 'ACC', 'Clemson · 2019', 90.0),
  ('weekly-cfb-georgia-2019', 2019, 'Georgia', 'SEC', 'Georgia · 2019', 85.0),
  ('cfb-best-lsu-2019', 2019, 'LSU', 'SEC', 'LSU · 2019', 100.0),
  ('cfb-v2-memphis-2019', 2019, 'Memphis', 'Wildcard', 'Memphis · 2019', 80.5),
  ('cfb-best-minnesota-2019', 2019, 'Minnesota', 'Big Ten', 'Minnesota · 2019', 79.0),
  ('cfb-best-ohio-state-2019', 2019, 'Ohio State', 'Big Ten', 'Ohio State · 2019', 90.5),
  ('cfb-v2-oregon-2019', 2019, 'Oregon', 'Big Ten', 'Oregon · 2019', 87.0),
  ('weekly-cfb-wisconsin-2019', 2019, 'Wisconsin', 'Big Ten', 'Wisconsin · 2019', 80.5),
  ('cfb-best-alabama-2020', 2020, 'Alabama', 'SEC', 'Alabama · 2020', 98.5),
  ('cfb-best-byu-2020', 2020, 'BYU', 'Big 12', 'BYU · 2020', 82.0),
  ('weekly-cfb-cincinnati-2020', 2020, 'Cincinnati', 'Big 12', 'Cincinnati · 2020', 83.5),
  ('weekly-cfb-clemson-2020', 2020, 'Clemson', 'ACC', 'Clemson · 2020', 85.0),
  ('weekly-cfb-coastal-carolina-2020', 2020, 'Coastal Carolina', 'Wildcard', 'Coastal Carolina · 2020', 78.5),
  ('weekly-cfb-georgia-2020', 2020, 'Georgia', 'SEC', 'Georgia · 2020', 82.5),
  ('cfb-best-iowa-state-2020', 2020, 'Iowa State', 'Big 12', 'Iowa State · 2020', 81.0),
  ('weekly-cfb-liberty-2020', 2020, 'Liberty', 'Wildcard', 'Liberty · 2020', 74.0),
  ('weekly-cfb-north-carolina-2020', 2020, 'North Carolina', 'ACC', 'North Carolina · 2020', 77.0),
  ('cfb-best-notre-dame-2020', 2020, 'Notre Dame', 'Notre Dame', 'Notre Dame · 2020', 84.0),
  ('cfb-best-ohio-state-2020', 2020, 'Ohio State', 'Big Ten', 'Ohio State · 2020', 86.0),
  ('cfb-v2-texas-aandm-2020', 2020, 'Texas A&M', 'SEC', 'Texas A&M · 2020', 87.0),
  ('weekly-cfb-alabama-2021', 2021, 'Alabama', 'SEC', 'Alabama · 2021', 89.0),
  ('cfb-best-baylor-2021', 2021, 'Baylor', 'Big 12', 'Baylor · 2021', 84.0),
  ('cfb-best-cincinnati-2021', 2021, 'Cincinnati', 'Big 12', 'Cincinnati · 2021', 86.0),
  ('cfb-best-georgia-2021', 2021, 'Georgia', 'SEC', 'Georgia · 2021', 94.0),
  ('cfb-best-michigan-2021', 2021, 'Michigan', 'Big Ten', 'Michigan · 2021', 84.5),
  ('cfb-v2-michigan-state-2021', 2021, 'Michigan State', 'Big Ten', 'Michigan State · 2021', 84.0),
  ('weekly-cfb-notre-dame-2021', 2021, 'Notre Dame', 'Notre Dame', 'Notre Dame · 2021', 84.0),
  ('weekly-cfb-ohio-state-2021', 2021, 'Ohio State', 'Big Ten', 'Ohio State · 2021', 85.5),
  ('cfb-best-oklahoma-state-2021', 2021, 'Oklahoma State', 'Big 12', 'Oklahoma State · 2021', 84.0),
  ('cfb-best-pitt-2021', 2021, 'Pitt', 'ACC', 'Pitt · 2021', 82.0),
  ('cfb-v2-utah-2021', 2021, 'Utah', 'Big 12', 'Utah · 2021', 82.0),
  ('cfb-v2-alabama-2022', 2022, 'Alabama', 'SEC', 'Alabama · 2022', 86.5),
  ('weekly-cfb-clemson-2022', 2022, 'Clemson', 'ACC', 'Clemson · 2022', 82.0),
  ('cfb-best-georgia-2022', 2022, 'Georgia', 'SEC', 'Georgia · 2022', 97.5),
  ('cfb-best-kansas-state-2022', 2022, 'Kansas State', 'Big 12', 'Kansas State · 2022', 78.5),
  ('cfb-best-michigan-2022', 2022, 'Michigan', 'Big Ten', 'Michigan · 2022', 85.0),
  ('weekly-cfb-ohio-state-2022', 2022, 'Ohio State', 'Big Ten', 'Ohio State · 2022', 86.0),
  ('weekly-cfb-penn-state-2022', 2022, 'Penn State', 'Big Ten', 'Penn State · 2022', 82.5),
  ('cfb-best-tcu-2022', 2022, 'TCU', 'Big 12', 'TCU · 2022', 87.5),
  ('cfb-best-tennessee-2022', 2022, 'Tennessee', 'SEC', 'Tennessee · 2022', 85.5),
  ('weekly-cfb-tulane-2022', 2022, 'Tulane', 'Wildcard', 'Tulane · 2022', 82.5),
  ('cfb-v2-usc-2022', 2022, 'USC', 'Big Ten', 'USC · 2022', 82.5),
  ('cfb-v2-utah-2022', 2022, 'Utah', 'Big 12', 'Utah · 2022', 82.5),
  ('cfb-v2-alabama-2023', 2023, 'Alabama', 'SEC', 'Alabama · 2023', 88.5),
  ('cfb-best-arizona-2023', 2023, 'Arizona', 'Big 12', 'Arizona · 2023', 81.0),
  ('cfb-best-florida-state-2023', 2023, 'Florida State', 'ACC', 'Florida State · 2023', 85.0),
  ('cfb-best-georgia-2023', 2023, 'Georgia', 'SEC', 'Georgia · 2023', 89.0),
  ('weekly-cfb-kansas-2023', 2023, 'Kansas', 'Big 12', 'Kansas · 2023', 77.0),
  ('weekly-cfb-liberty-2023', 2023, 'Liberty', 'Wildcard', 'Liberty · 2023', 74.0),
  ('weekly-cfb-louisville-2023', 2023, 'Louisville', 'ACC', 'Louisville · 2023', 77.5),
  ('cfb-best-michigan-2023', 2023, 'Michigan', 'Big Ten', 'Michigan · 2023', 96.0),
  ('cfb-v2-missouri-2023', 2023, 'Missouri', 'SEC', 'Missouri · 2023', 84.0),
  ('weekly-cfb-notre-dame-2023', 2023, 'Notre Dame', 'Notre Dame', 'Notre Dame · 2023', 79.5),
  ('weekly-cfb-ohio-state-2023', 2023, 'Ohio State', 'Big Ten', 'Ohio State · 2023', 82.5),
  ('cfb-best-ole-miss-2023', 2023, 'Ole Miss', 'SEC', 'Ole Miss · 2023', 83.5),
  ('weekly-cfb-oregon-2023', 2023, 'Oregon', 'Big Ten', 'Oregon · 2023', 85.0),
  ('cfb-best-texas-2023', 2023, 'Texas', 'SEC', 'Texas · 2023', 87.0),
  ('cfb-best-washington-2023', 2023, 'Washington', 'Big Ten', 'Washington · 2023', 89.0),
  ('cfb-best-arizona-state-2024', 2024, 'Arizona State', 'Big 12', 'Arizona State · 2024', 85.0),
  ('cfb-v2-army-2024', 2024, 'Army', 'Wildcard', 'Army · 2024', 81.0),
  ('weekly-cfb-boise-state-2024', 2024, 'Boise State', 'Wildcard', 'Boise State · 2024', 83.5),
  ('cfb-best-byu-2024', 2024, 'BYU', 'Big 12', 'BYU · 2024', 82.0),
  ('weekly-cfb-colorado-2024', 2024, 'Colorado', 'Big 12', 'Colorado · 2024', 76.0),
  ('cfb-v2-georgia-2024', 2024, 'Georgia', 'SEC', 'Georgia · 2024', 86.0),
  ('cfb-v2-indiana-2024', 2024, 'Indiana', 'Big Ten', 'Indiana · 2024', 85.0),
  ('cfb-best-iowa-state-2024', 2024, 'Iowa State', 'Big 12', 'Iowa State · 2024', 81.0),
  ('weekly-cfb-miami-2024', 2024, 'Miami', 'ACC', 'Miami · 2024', 78.5),
  ('cfb-best-notre-dame-2024', 2024, 'Notre Dame', 'Notre Dame', 'Notre Dame · 2024', 89.0),
  ('cfb-best-ohio-state-2024', 2024, 'Ohio State', 'Big Ten', 'Ohio State · 2024', 93.0),
  ('weekly-cfb-ole-miss-2024', 2024, 'Ole Miss', 'SEC', 'Ole Miss · 2024', 80.5),
  ('cfb-best-oregon-2024', 2024, 'Oregon', 'Big Ten', 'Oregon · 2024', 89.0),
  ('cfb-best-penn-state-2024', 2024, 'Penn State', 'Big Ten', 'Penn State · 2024', 86.5),
  ('cfb-best-smu-2024', 2024, 'SMU', 'ACC', 'SMU · 2024', 83.0),
  ('weekly-cfb-texas-2024', 2024, 'Texas', 'SEC', 'Texas · 2024', 86.0),
  ('cfb-best-byu-2025', 2025, 'BYU', 'Big 12', 'BYU · 2025', 83.0),
  ('cfb-v2-georgia-2025', 2025, 'Georgia', 'SEC', 'Georgia · 2025', 87.0),
  ('cfb-best-indiana-2025', 2025, 'Indiana', 'Big Ten', 'Indiana · 2025', 98.0),
  ('cfb-best-miami-2025', 2025, 'Miami', 'ACC', 'Miami · 2025', 87.5),
  ('weekly-cfb-notre-dame-2025', 2025, 'Notre Dame', 'Notre Dame', 'Notre Dame · 2025', 83.0),
  ('weekly-cfb-ohio-state-2025', 2025, 'Ohio State', 'Big Ten', 'Ohio State · 2025', 86.0),
  ('cfb-v2-ole-miss-2025', 2025, 'Ole Miss', 'SEC', 'Ole Miss · 2025', 89.0),
  ('weekly-cfb-oregon-2025', 2025, 'Oregon', 'Big Ten', 'Oregon · 2025', 87.0),
  ('cfb-v2-texas-aandm-2025', 2025, 'Texas A&M', 'SEC', 'Texas A&M · 2025', 82.5),
  ('cfb-best-texas-tech-2025', 2025, 'Texas Tech', 'Big 12', 'Texas Tech · 2025', 84.5),
  ('cfb-v2-utah-2025', 2025, 'Utah', 'Big 12', 'Utah · 2025', 84.0),
  ('cfb-best-vanderbilt-2025', 2025, 'Vanderbilt', 'SEC', 'Vanderbilt · 2025', 77.0);

create or replace function private.protect_cfb_best_teams_v2_authority()
returns trigger language plpgsql set search_path='' as $$
begin raise exception 'CFB Best Teams v2 authority is immutable'; end;
$$;
create trigger cfb_best_teams_v2_authority_immutable before update or delete on private.cfb_best_teams_v2_authority
for each statement execute function private.protect_cfb_best_teams_v2_authority();
revoke all on function private.protect_cfb_best_teams_v2_authority() from public,anon,authenticated;

insert into private.auction_catalog_versions(content_version,rarity_version,grading_version,is_preparation_version,game_id)
values ('football-draft-room-cfb-best-teams-2026-09-v2','football-draft-room-cfb-best-teams-board-2026-09-v2','football-draft-room-cfb-best-teams-grading-2026-09-v2',true,'draft-room-cfb-best-teams');
update private.auction_catalog_versions
set is_preparation_version=false
where game_id='draft-room-cfb-best-teams'
  and content_version<>'football-draft-room-cfb-best-teams-2026-09-v2';

alter table private.draft_room_cfb_best_teams_board_entries
  drop constraint if exists draft_room_cfb_best_teams_board_entries_season_reference_fkey;

alter table private.draft_room_cfb_best_teams_board_entries
  drop constraint if exists draft_room_cfb_best_teams_board_entries_conference_one_check;
alter table private.draft_room_cfb_best_teams_board_entries
  add constraint draft_room_cfb_best_teams_board_entries_conference_one_check
  check (conference_one in ('SEC','Big Ten','Big 12','ACC','Wildcard'));

create or replace function private.validate_cfb_best_teams_board_authority()
returns trigger language plpgsql set search_path='' as $$
declare v_grading text;
begin
  select grading_version into v_grading from private.auction_games where id=new.auction_id;
  if v_grading='football-draft-room-cfb-best-teams-grading-2026-09-v2' then
    if not exists(select 1 from private.cfb_best_teams_v2_authority where season_reference=new.season_reference) then
      raise exception 'Best CFB Teams v2 board reference is outside the v2 authority';
    end if;
  elsif not exists(select 1 from private.draft_room_cfb_best_teams_pool where season_reference=new.season_reference) then
    raise exception 'Best CFB Teams legacy board reference is outside the legacy authority';
  end if;
  return new;
end;
$$;
drop trigger if exists validate_cfb_best_teams_board_authority on private.draft_room_cfb_best_teams_board_entries;
create trigger validate_cfb_best_teams_board_authority before insert or update of season_reference
on private.draft_room_cfb_best_teams_board_entries for each row execute function private.validate_cfb_best_teams_board_authority();
revoke all on function private.validate_cfb_best_teams_board_authority() from public,anon,authenticated;

create or replace function private.generate_draft_room_cfb_best_teams_deck_v2(p_auction_id uuid)
returns void language plpgsql security definer set search_path='' as $$
declare
  v_game private.auction_games; v_kind text; v_one text; v_two text; v_nd boolean:=false; v_nd_slot integer:=null;
  v_shape text; v_shape_roll double precision; v_variant integer; v_targets numeric[]; v_slot integer; v_context text;
  v_target numeric; v_pick private.cfb_best_teams_v2_authority; v_refs text[]:=array[]::text[]; v_shuffled text[];
  v_position integer; v_board_token text; v_item_reference text;
begin
  select * into v_game from private.auction_games where id=p_auction_id for update;
  if v_game.id is null or v_game.mode_id<>'cfb-best-teams'
    or v_game.grading_version<>'football-draft-room-cfb-best-teams-grading-2026-09-v2'
  then raise exception 'Best CFB Teams v2 deck generation requires a matching v2 room'; end if;
  if exists(select 1 from private.auction_deck_entries where auction_id=p_auction_id)
    or exists(select 1 from private.draft_room_cfb_best_teams_board_entries where auction_id=p_auction_id)
  then raise exception 'Best CFB Teams deck is already fixed'; end if;
  v_kind:=case when random()<0.60 then 'single' else 'split' end;
  select conference_bucket into v_one from (
    select distinct conference_bucket from private.cfb_best_teams_v2_authority where conference_bucket<>'Notre Dame'
  ) c order by random(),conference_bucket limit 1;
  if v_kind='split' then
    select conference_bucket into v_two from (
      select distinct conference_bucket from private.cfb_best_teams_v2_authority where conference_bucket not in ('Notre Dame',v_one)
    ) c order by random(),conference_bucket limit 1;
    v_nd:=random()<0.40; if v_nd then v_nd_slot:=floor(random()*8)::integer+1; end if;
  end if;
  v_shape_roll:=random();
  select shape into v_shape from private.draft_room_cfb_best_teams_board_shapes
  where v_shape_roll>=roll_start and v_shape_roll<roll_end order by roll_start limit 1;
  v_variant:=floor(random()*4)::integer+1;
  select target_percentiles into v_targets from private.draft_room_cfb_best_teams_board_variants where shape=v_shape and variant=v_variant;
  for v_slot in 1..8 loop
    if v_kind='single' then v_context:=v_one;
    elsif v_nd and v_slot=v_nd_slot then v_context:='Notre Dame';
    else v_context:=case when mod(v_slot,2)=1 then v_one else v_two end; end if;
    v_target:=v_targets[v_slot];
    with ranked as (
      select season.*,percent_rank() over(order by hidden_grade,season_reference) pct
      from private.cfb_best_teams_v2_authority season
      where season.conference_bucket=v_context and not(season.season_reference=any(v_refs))
    )
    select season_reference,season_year,school,conference_bucket,display_label,hidden_grade into v_pick
    from ranked where abs(pct-v_target)<=0.14 order by random(),season_reference limit 1;
    if v_pick.season_reference is null then
      with ranked as (
        select season.*,percent_rank() over(order by hidden_grade,season_reference) pct
        from private.cfb_best_teams_v2_authority season
        where season.conference_bucket=v_context and not(season.season_reference=any(v_refs))
      )
      select season_reference,season_year,school,conference_bucket,display_label,hidden_grade into v_pick
      from ranked order by abs(pct-v_target),random(),season_reference limit 1;
    end if;
    if v_pick.season_reference is null then raise exception 'Best CFB Teams v2 board underfilled %',v_context; end if;
    v_refs:=array_append(v_refs,v_pick.season_reference);
  end loop;
  select array_agg(x order by random()) into v_shuffled from unnest(v_refs) x;
  v_board_token:=v_kind||'__'||replace(v_one,' ','%20')||'__'||coalesce(replace(v_two,' ','%20'),'none')||'__'||case when v_nd then 'nd' else 'no' end;
  for v_position in 1..8 loop
    select * into v_pick from private.cfb_best_teams_v2_authority where season_reference=v_shuffled[v_position];
    v_item_reference:=v_pick.season_reference||'--board--'||v_board_token;
    insert into private.draft_room_cfb_best_teams_board_entries(
      auction_id,deck_position,item_reference,board_kind,conference_one,conference_two,notre_dame_wildcard,
      board_shape,board_variant,strength_slot,season_reference,display_label
    ) values (
      p_auction_id,v_position,v_item_reference,v_kind,v_one,v_two,v_nd,
      v_shape,v_variant,array_position(v_refs,v_pick.season_reference),v_pick.season_reference,v_pick.display_label
    );
    insert into private.auction_deck_entries(auction_id,deck_position,private_item_reference)
    values(p_auction_id,v_position,v_item_reference);
  end loop;
end;
$$;
revoke all on function private.generate_draft_room_cfb_best_teams_deck_v2(uuid) from public,anon,authenticated;

create or replace function private.generate_draft_room_cfb_best_teams_deck_router(p_auction_id uuid)
returns void language plpgsql security definer set search_path='' as $$
declare v_grading text;
begin
  select grading_version into v_grading from private.auction_games where id=p_auction_id;
  if v_grading='football-draft-room-cfb-best-teams-grading-2026-09-v2' then
    perform private.generate_draft_room_cfb_best_teams_deck_v2(p_auction_id);
  else
    perform private.generate_draft_room_cfb_best_teams_deck(p_auction_id);
  end if;
end;
$$;
revoke all on function private.generate_draft_room_cfb_best_teams_deck_router(uuid) from public,anon,authenticated;

create or replace function private.grade_draft_room_cfb_best_teams_v2(p_auction_id uuid)
returns void language plpgsql security definer set search_path='' as $$
declare v_game private.auction_games; v_a numeric(5,2); v_b numeric(5,2); v_a_count integer; v_b_count integer; v_winner uuid;
begin
  select * into v_game from private.auction_games where id=p_auction_id for update;
  if v_game.id is null or v_game.mode_id<>'cfb-best-teams' or v_game.grading_version<>'football-draft-room-cfb-best-teams-grading-2026-09-v2'
  then raise exception 'Best CFB Teams v2 grading requires a matching v2 room'; end if;
  select count(*),round(avg(season.hidden_grade),2) into v_a_count,v_a
  from private.auction_awards award join private.auction_deck_entries deck on deck.id=award.deck_entry_id and deck.auction_id=award.auction_id
  join private.draft_room_cfb_best_teams_board_entries entry on entry.auction_id=deck.auction_id and entry.item_reference=deck.private_item_reference
  join private.cfb_best_teams_v2_authority season on season.season_reference=entry.season_reference
  where award.auction_id=p_auction_id and award.awarded_to=v_game.challenger_id;
  select count(*),round(avg(season.hidden_grade),2) into v_b_count,v_b
  from private.auction_awards award join private.auction_deck_entries deck on deck.id=award.deck_entry_id and deck.auction_id=award.auction_id
  join private.draft_room_cfb_best_teams_board_entries entry on entry.auction_id=deck.auction_id and entry.item_reference=deck.private_item_reference
  join private.cfb_best_teams_v2_authority season on season.season_reference=entry.season_reference
  where award.auction_id=p_auction_id and award.awarded_to=v_game.recipient_id;
  if v_a_count<>4 or v_b_count<>4 then raise exception 'Best CFB Teams v2 grading requires four won seasons per player'; end if;
  v_winner:=case when v_a>v_b then v_game.challenger_id when v_b>v_a then v_game.recipient_id else null end;
  update private.auction_games set lifecycle_state='completed',challenger_final_score=v_a,recipient_final_score=v_b,winner_profile_id=v_winner,revision=revision+1,updated_at=now() where id=p_auction_id;
  update public.play_challenges set completed_at=coalesce(completed_at,now()),
    creator_result=jsonb_build_object('overall_score',v_a),responder_result=jsonb_build_object('overall_score',v_b)
  where id=v_game.challenge_id;
end;
$$;
revoke all on function private.grade_draft_room_cfb_best_teams_v2(uuid) from public,anon,authenticated;

do $route_casual_v2$
declare d text; n text;
begin
 d:=pg_get_functiondef('private.generate_auction_deck(uuid,text,text,integer,double precision[])'::regprocedure);
 n:=replace(d,'perform private.generate_draft_room_cfb_best_teams_deck(p_auction_id);','perform private.generate_draft_room_cfb_best_teams_deck_router(p_auction_id);');
 if n=d then raise exception 'Best CFB Teams generator router patch drifted'; end if; execute n;
 d:=pg_get_functiondef('private.grade_auction(uuid)'::regprocedure);
 n:=replace(d,
$$  if v_game.mode_id = 'cfb-best-teams'
    and v_game.grading_version = 'football-draft-room-cfb-best-teams-grading-2026-09-v1'
  then
    perform private.grade_draft_room_cfb_best_teams(p_auction_id);
    return;
  end if;$$,
$$  if v_game.mode_id = 'cfb-best-teams'
    and v_game.grading_version = 'football-draft-room-cfb-best-teams-grading-2026-09-v2'
  then
    perform private.grade_draft_room_cfb_best_teams_v2(p_auction_id);
    return;
  end if;

  if v_game.mode_id = 'cfb-best-teams'
    and v_game.grading_version = 'football-draft-room-cfb-best-teams-grading-2026-09-v1'
  then
    perform private.grade_draft_room_cfb_best_teams(p_auction_id);
    return;
  end if;$$);
 if n=d then raise exception 'Best CFB Teams grader router patch drifted'; end if; execute n;
end
$route_casual_v2$;

alter table private.football_weekly_auction_items drop constraint if exists football_weekly_auction_items_hidden_grade_check;
alter table private.football_weekly_auction_items add constraint football_weekly_auction_items_hidden_grade_check
check (hidden_grade between 0 and 100 and hidden_grade * 2 = trunc(hidden_grade * 2));

insert into private.football_weekly_auction_items(item_reference,subject_key,season_year,primary_name,secondary_name,team_code,board_bucket,identity_group,display_label,hidden_grade,source_url)
select season_reference,'cfb-best-teams-since-2000',season_year,school,null,null,conference_bucket,school,display_label,hidden_grade,null
from private.cfb_best_teams_v2_authority
on conflict(item_reference) do update set subject_key=excluded.subject_key,season_year=excluded.season_year,primary_name=excluded.primary_name,
board_bucket=excluded.board_bucket,identity_group=excluded.identity_group,display_label=excluded.display_label,hidden_grade=excluded.hidden_grade;

create or replace function private.cfb_best_teams_weekly_pool(p_week_start date)
returns table(season_reference text,season_year integer,school text,conference_bucket text,display_label text,hidden_grade numeric)
language sql stable security definer set search_path='' as $$
  select p.season_reference,p.season_year,p.school,p.conference_bucket,p.display_label,p.hidden_grade
  from private.draft_room_cfb_best_teams_pool p where p_week_start < date '2026-09-22'
  union all
  select p.season_reference,p.season_year,p.school,p.conference_bucket,p.display_label,p.hidden_grade
  from private.cfb_best_teams_v2_authority p where p_week_start >= date '2026-09-22';
$$;
revoke all on function private.cfb_best_teams_weekly_pool(date) from public,anon,authenticated;

CREATE OR REPLACE FUNCTION private.materialize_football_weekly_auction_week(p_week_start date)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_themes text[];
  v_theme text;
  v_day integer;
  v_slot integer;
  v_attempt integer;
  v_shape_attempt integer;
  v_shape text;
  v_shape_roll double precision;
  v_prev_shape text;
  v_two_back_shape text;
  v_targets numeric[];
  v_target numeric;
  v_high numeric;
  v_center numeric;
  v_pick private.cfb_best_teams_v2_authority;
  v_used_refs text[];
  v_used_schools text[];
  v_forced_refs text[];
  v_trap_blue_ref text;
  v_trap_other_ref text;
  v_elites integer;
  v_lock_at timestamptz;
begin
  if p_week_start < date '2026-09-22' then
    if (select count(*) from private.football_weekly_auction_board where week_start = p_week_start) = 21 then
      return;
    end if;
    raise exception 'Legacy Football Weekly Auction weeks cannot be regenerated by the v2 materializer';
  end if;
  if extract(isodow from p_week_start) <> 2 then
    raise exception 'Football Weekly Auction week must start Tuesday';
  end if;

  insert into private.football_weekly_auction_weeks(week_start)
  values (p_week_start)
  on conflict (week_start) do nothing;

  if (select count(*) from private.football_weekly_auction_board where week_start = p_week_start) = 21 then
    return;
  end if;

  <<attempt_loop>>
  for v_attempt in 1..500 loop
    delete from private.football_weekly_auction_board where week_start = p_week_start;
    v_used_refs := array[]::text[];
    v_used_schools := array[]::text[];
    v_elites := 0;
    v_prev_shape := null;
    v_two_back_shape := null;

    select array_agg(theme order by random())
    into v_themes
    from unnest(array['SEC','SEC','Big Ten','Big Ten','Big 12','ACC','Wildcard']::text[]) as theme;

    for v_day in 1..7 loop
      v_theme := v_themes[v_day];

      for v_shape_attempt in 1..30 loop
        v_shape_roll := random() * 100;
        v_shape := case
          when v_shape_roll < 19 then 'Wide'
          when v_shape_roll < 37 then 'Compressed'
          when v_shape_roll < 54 then 'TopHeavy'
          when v_shape_roll < 74 then 'MiddleHeavy'
          when v_shape_roll < 88 then 'Trap'
          else 'Chaotic'
        end;
        exit when not (v_shape = v_prev_shape and v_shape = v_two_back_shape);
      end loop;
      if v_shape = v_prev_shape and v_shape = v_two_back_shape then
        continue attempt_loop;
      end if;

      v_forced_refs := array[]::text[];
      v_targets := null;

      if v_shape = 'Wide' then
        v_high := 92 + floor(random() * 17) * 0.5;
        v_targets := array[
          v_high,
          v_high - (5 + random() * 3),
          v_high - (10 + random() * 4)
        ]::numeric[];
      elsif v_shape = 'Compressed' then
        v_center := 82 + floor(random() * 25) * 0.5;
        v_targets := array[v_center - 0.5, v_center, v_center + 0.5]::numeric[];
      elsif v_shape = 'TopHeavy' then
        v_high := 92 + floor(random() * 17) * 0.5;
        v_targets := array[
          v_high,
          v_high - (0.5 + random()),
          v_high - (6 + random() * 4)
        ]::numeric[];
      elsif v_shape = 'MiddleHeavy' then
        v_center := 82 + floor(random() * 17) * 0.5;
        v_targets := array[
          v_center - (1.5 + random()),
          v_center + (random() - 0.5) * 0.5,
          v_center + (1.5 + random())
        ]::numeric[];
      elsif v_shape = 'Trap' then
        v_trap_blue_ref := null;
        v_trap_other_ref := null;

        select blue.season_reference, other.season_reference
        into v_trap_blue_ref, v_trap_other_ref
        from private.cfb_best_teams_v2_authority blue
        cross join private.cfb_best_teams_v2_authority other
        where (
            (v_theme = 'Wildcard' and blue.conference_bucket in ('Notre Dame','Wildcard'))
            or blue.conference_bucket = v_theme
          )
          and (
            (v_theme = 'Wildcard' and other.conference_bucket in ('Notre Dame','Wildcard'))
            or other.conference_bucket = v_theme
          )
          and blue.school in (
            'Alabama','Ohio State','USC','Texas','Oklahoma','Michigan','Notre Dame',
            'Georgia','LSU','Florida','Florida State','Clemson','Miami','Penn State',
            'Nebraska','Oregon','Auburn'
          )
          and other.school not in (
            'Alabama','Ohio State','USC','Texas','Oklahoma','Michigan','Notre Dame',
            'Georgia','LSU','Florida','Florida State','Clemson','Miami','Penn State',
            'Nebraska','Oregon','Auburn'
          )
          and other.school <> blue.school
          and other.hidden_grade >= blue.hidden_grade + 1.5
          and other.hidden_grade <= blue.hidden_grade + 4.5
          and not (blue.school = any(v_used_schools))
          and not (other.school = any(v_used_schools))
          and not exists (
            select 1 from private.football_weekly_auction_board prior
            where prior.week_start >= p_week_start - 28
              and prior.week_start < p_week_start
              and prior.season_reference = blue.season_reference
          )
          and not exists (
            select 1 from private.football_weekly_auction_board prior
            where prior.week_start >= p_week_start - 28
              and prior.week_start < p_week_start
              and prior.season_reference = other.season_reference
          )
        order by random()
        limit 1;

        if v_trap_blue_ref is not null and v_trap_other_ref is not null then
          v_forced_refs := array[v_trap_blue_ref, v_trap_other_ref];
          select array[null::numeric, null::numeric, avg(pool.hidden_grade)]::numeric[]
          into v_targets
          from private.cfb_best_teams_v2_authority pool
          where pool.season_reference = any(v_forced_refs);
        else
          v_targets := array[
            82 + random() * 8,
            84 + random() * 8,
            80 + random() * 8
          ]::numeric[];
        end if;
      else
        v_targets := array[
          74 + random() * 26,
          74 + random() * 26,
          74 + random() * 26
        ]::numeric[];
      end if;

      for v_slot in 1..3 loop
        v_pick := null;

        if array_length(v_forced_refs, 1) is not null
          and v_slot <= array_length(v_forced_refs, 1)
        then
          select pool.*
          into v_pick
          from private.cfb_best_teams_v2_authority pool
          where pool.season_reference = v_forced_refs[v_slot];
        else
          v_target := v_targets[v_slot];

          select pool.*
          into v_pick
          from private.cfb_best_teams_v2_authority pool
          where (
              (v_theme = 'Wildcard' and pool.conference_bucket in ('Notre Dame','Wildcard'))
              or pool.conference_bucket = v_theme
            )
            and not (pool.season_reference = any(v_used_refs))
            and not (pool.school = any(v_used_schools))
            and not exists (
              select 1
              from private.football_weekly_auction_board prior
              where prior.week_start >= p_week_start - 28
                and prior.week_start < p_week_start
                and prior.season_reference = pool.season_reference
            )
          order by abs(pool.hidden_grade - v_target) + random() * 0.3, pool.season_reference
          limit 1;

          if v_pick.season_reference is null then
            select pool.*
            into v_pick
            from private.cfb_best_teams_v2_authority pool
            where (
                (v_theme = 'Wildcard' and pool.conference_bucket in ('Notre Dame','Wildcard'))
                or pool.conference_bucket = v_theme
              )
              and not (pool.season_reference = any(v_used_refs))
              and not (pool.school = any(v_used_schools))
            order by abs(pool.hidden_grade - v_target) + random() * 0.3, pool.season_reference
            limit 1;
          end if;
        end if;

        if v_pick.season_reference is null then
          continue attempt_loop;
        end if;

        v_used_refs := array_append(v_used_refs, v_pick.season_reference);
        v_used_schools := array_append(v_used_schools, v_pick.school);
        if v_pick.hidden_grade >= 95 then
          v_elites := v_elites + 1;
        end if;

        v_lock_at := ((p_week_start + v_day)::timestamp at time zone 'America/Chicago');
        insert into private.football_weekly_auction_board(
          week_start, day_index, theme, hidden_shape, slot, season_reference, lock_at
        ) values (
          p_week_start, v_day, v_theme, v_shape, v_slot, v_pick.season_reference, v_lock_at
        );
      end loop;

      v_two_back_shape := v_prev_shape;
      v_prev_shape := v_shape;
    end loop;

    if (select count(*) from private.football_weekly_auction_board where week_start = p_week_start) = 21
      and v_elites between 1 and 6
      and (
        select count(distinct pool.school)
        from private.football_weekly_auction_board board
        join private.cfb_best_teams_v2_authority pool using (season_reference)
        where board.week_start = p_week_start
      ) = 21
    then
      return;
    end if;
  end loop;

  raise exception 'Unable to materialize a valid Football Weekly Auction board';
end;
$function$
;

do $route_weekly_v2$
declare d text; n text;
begin
 d:=pg_get_functiondef('private.finalize_football_weekly_auction_week(date,timestamptz)'::regprocedure);
 n:=replace(d,'join private.draft_room_cfb_best_teams_pool pool','join private.cfb_best_teams_weekly_pool(p_week_start) pool');
 if n=d then raise exception 'Weekly finalizer authority patch drifted'; end if; execute n;
 d:=pg_get_functiondef('private.football_weekly_auction_final_payload(date,uuid)'::regprocedure);
 n:=replace(d,'join private.draft_room_cfb_best_teams_pool pool','join private.cfb_best_teams_weekly_pool(p_week_start) pool');
 if n=d then raise exception 'Weekly final payload authority patch drifted'; end if; execute n;
 d:=pg_get_functiondef('public.get_my_football_weekly_auction(timestamptz)'::regprocedure);
 n:=replace(d,'join private.draft_room_cfb_best_teams_pool pool','join private.cfb_best_teams_weekly_pool(v_week_start) pool');
 if n=d then raise exception 'Weekly public payload authority patch drifted'; end if; execute n;
end
$route_weekly_v2$;

do $contracts$
begin
 if (select count(*) from private.cfb_best_teams_v2_authority)<>257 then raise exception 'CFB v2 authority must contain 257 seasons'; end if;
 if (select min(hidden_grade) from private.cfb_best_teams_v2_authority)<>74 or (select max(hidden_grade) from private.cfb_best_teams_v2_authority)<>100
 then raise exception 'CFB v2 grade scale must be 74-100'; end if;
 if (select percentile_disc(0.5) within group(order by hidden_grade) from private.cfb_best_teams_v2_authority)<>85
 then raise exception 'CFB v2 median must be 85'; end if;
 if not exists(select 1 from private.cfb_best_teams_v2_authority where school='Auburn' and season_year=2013 and hidden_grade=87.5)
 or not exists(select 1 from private.cfb_best_teams_v2_authority where school='Florida' and season_year=2007 and hidden_grade=80)
 or not exists(select 1 from private.cfb_best_teams_v2_authority where school='Kansas State' and season_year=2003 and hidden_grade=80.5)
 or not exists(select 1 from private.cfb_best_teams_v2_authority where school='Indiana' and season_year=2024 and hidden_grade=85)
 then raise exception 'CFB v2 final corrections drifted'; end if;
 if (select count(*) from private.cfb_best_teams_v2_authority where conference_bucket='Wildcard') < 8
 then raise exception 'CFB v2 Wildcard pool is too small for Casual board generation'; end if;
end
$contracts$;
