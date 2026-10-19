/**
 * Frozen NBA comparison supplements, through the completed 2025–26 season.
 * All-Star counts mean SELECTIONS (including selected injury absences), not appearances.
 * All-NBA counts combine first, second and third teams.
 * Sources:
 * https://www.basketball-reference.com/awards/all_star_by_player.html
 * https://www.nba.com/news/players-with-most-all-nba-selections-ever (May 2026)
 * https://www.nba.com/news/history-draft (June 2026)
 * https://hoopsjunkie.io/stats/2024-25/players/traditional/three-pointers-made
 * 3PM is per 2024–25 regular-season GAME, not a career cumulative total.
 * Do not fill unknown values with zero. Every row is explicitly verified.
 */
export const NBA_HIGHER_LOWER_2025_THREES = [
  ["Stephen Curry",4.4],["Anthony Edwards",4.1],["Jayson Tatum",3.5],
  ["Damian Lillard",3.4],["Donovan Mitchell",3.3],["Zach LaVine",3.2],
  ["James Harden",3.0],["Klay Thompson",3.0],["Tyrese Haliburton",3.0],
  ["Trae Young",2.9],["Kevin Durant",2.6],["Devin Booker",2.4],
  ["Jalen Brunson",2.3],["Jamal Murray",2.3],["Darius Garland",2.8],
] as const;

export const NBA_HIGHER_LOWER_ALL_STAR_SELECTIONS = [
  ["LeBron James",22],["Kareem Abdul-Jabbar",19],["Kobe Bryant",18],
  ["Kevin Durant",16],["Tim Duncan",15],["Kevin Garnett",15],
  ["Shaquille O'Neal",15],["Michael Jordan",14],["Karl Malone",14],
  ["Dirk Nowitzki",14],["Jerry West",14],["Wilt Chamberlain",13],
  ["John Havlicek",13],["Dwyane Wade",13],["Stephen Curry",12],
  ["Magic Johnson",12],["Hakeem Olajuwon",12],["Chris Paul",12],
  ["Oscar Robertson",12],["Bill Russell",12],["Isiah Thomas",12],
  ["Larry Bird",12],["Charles Barkley",11],["Chris Bosh",11],
  ["Patrick Ewing",11],["Allen Iverson",11],["Ray Allen",10],
  ["Carmelo Anthony",10],["Clyde Drexler",10],["David Robinson",10],
  ["John Stockton",10],["Paul Pierce",10],["Anthony Davis",10],
  ["Giannis Antetokounmpo",10],["James Harden",11],
] as const;

export const NBA_HIGHER_LOWER_ALL_NBA = [
  ["LeBron James",21],["Kareem Abdul-Jabbar",15],["Kobe Bryant",15],
  ["Tim Duncan",15],["Karl Malone",14],["Shaquille O'Neal",14],
  ["Kevin Durant",12],["Dirk Nowitzki",12],["Hakeem Olajuwon",12],
  ["Jerry West",12],["Charles Barkley",11],["Stephen Curry",11],
  ["John Havlicek",11],["Michael Jordan",11],["Chris Paul",11],
  ["Oscar Robertson",11],["Bill Russell",11],["John Stockton",11],
  ["Larry Bird",10],["Wilt Chamberlain",10],["Magic Johnson",10],
  ["David Robinson",10],
] as const;

/** Year and overall NBA draft slot. Undrafted athletes are NOT represented as pick 0. */
export const NBA_HIGHER_LOWER_DRAFT = [
  ["LeBron James",2003,1],["Michael Jordan",1984,3],
  ["Kobe Bryant",1996,13],["Stephen Curry",2009,7],
  ["Kevin Durant",2007,2],["Nikola Jokić",2014,41],
  ["Giannis Antetokounmpo",2013,15],["Luka Dončić",2018,3],
  ["Jayson Tatum",2017,3],["Anthony Edwards",2020,1],
  ["Shai Gilgeous-Alexander",2018,11],["Russell Westbrook",2008,4],
  ["James Harden",2009,3],["Chris Paul",2005,4],
  ["Kyrie Irving",2011,1],["Magic Johnson",1979,1],
  ["Larry Bird",1978,6],["Shaquille O'Neal",1992,1],
  ["Tim Duncan",1997,1],["Dirk Nowitzki",1998,9],
  ["Kevin Garnett",1995,5],["Hakeem Olajuwon",1984,1],
  ["Dwyane Wade",2003,5],["Carmelo Anthony",2003,3],
  ["Kawhi Leonard",2011,15],["Damian Lillard",2012,6],
  ["Jalen Brunson",2018,33],["Draymond Green",2012,35],
  ["Devin Booker",2015,13],["Donovan Mitchell",2017,13],
  ["Bam Adebayo",2017,14],["Domantas Sabonis",2016,11],
  ["John Stockton",1984,16],["Steve Nash",1996,15],
  ["Anthony Davis",2012,1],["Karl-Anthony Towns",2015,1],
  ["Cade Cunningham",2021,1],["Victor Wembanyama",2023,1],
  ["Paolo Banchero",2022,1],["Jrue Holiday",2009,17],
  ["Paul George",2010,10],["DeMar DeRozan",2009,9],
  ["Ray Allen",1996,5],["Allen Iverson",1996,1],
  ["Patrick Ewing",1985,1],["Charles Barkley",1984,5],
  ["Vince Carter",1998,5],["Tracy McGrady",1997,9],
  ["Isiah Thomas",1981,2],["Dwight Howard",2004,1],
] as const;
