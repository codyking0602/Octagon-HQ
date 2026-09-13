/** Canonical source rows for the retired-player and champion-season factual coverage. */
export interface FootballQbCareerRow {
  id: string;
  name: string;
  games: number;
  completions: number;
  attempts: number;
  passingYards: number;
  passingTouchdowns: number;
  interceptions: number;
}
export interface FootballRbCareerRow {
  id: string;
  name: string;
  games: number;
  rushingAttempts: number;
  rushingYards: number;
  rushingTouchdowns: number;
  receptions: number;
  receivingYards: number;
  receivingTouchdowns: number;
}
export interface FootballCfbChampionSeasonRow {
  id: string;
  name: string;
  pointsFor: number;
  pointsAgainst: number;
  pointsPerGame: number;
  opponentPointsPerGame: number;
  srs: number;
  sos: number;
}

export const footballQbCareerRows: readonly FootballQbCareerRow[] = [
  { id: "tom-brady", name: "Tom Brady", games: 335, completions: 7753, attempts: 12050, passingYards: 89214, passingTouchdowns: 649, interceptions: 212 },
  { id: "peyton-manning", name: "Peyton Manning", games: 266, completions: 6125, attempts: 9380, passingYards: 71940, passingTouchdowns: 539, interceptions: 251 },
  { id: "brett-favre", name: "Brett Favre", games: 302, completions: 6300, attempts: 10169, passingYards: 71838, passingTouchdowns: 508, interceptions: 336 },
  { id: "johnny-unitas", name: "Johnny Unitas", games: 211, completions: 2830, attempts: 5186, passingYards: 40239, passingTouchdowns: 290, interceptions: 253 },
  { id: "joe-montana", name: "Joe Montana", games: 192, completions: 3409, attempts: 5391, passingYards: 40551, passingTouchdowns: 273, interceptions: 139 },
  { id: "drew-brees", name: "Drew Brees", games: 287, completions: 7142, attempts: 10551, passingYards: 80358, passingTouchdowns: 571, interceptions: 243 },
  { id: "john-elway", name: "John Elway", games: 234, completions: 4123, attempts: 7250, passingYards: 51475, passingTouchdowns: 300, interceptions: 226 },
  { id: "dan-marino", name: "Dan Marino", games: 242, completions: 4967, attempts: 8358, passingYards: 61361, passingTouchdowns: 420, interceptions: 252 },
  { id: "dan-fouts", name: "Dan Fouts", games: 181, completions: 3297, attempts: 5604, passingYards: 43040, passingTouchdowns: 254, interceptions: 242 },
  { id: "kurt-warner", name: "Kurt Warner", games: 124, completions: 2666, attempts: 4070, passingYards: 32344, passingTouchdowns: 208, interceptions: 128 },
  { id: "eli-manning", name: "Eli Manning", games: 236, completions: 4895, attempts: 8119, passingYards: 57023, passingTouchdowns: 366, interceptions: 244 },
  { id: "ken-anderson", name: "Ken Anderson", games: 192, completions: 2654, attempts: 4475, passingYards: 32838, passingTouchdowns: 197, interceptions: 160 },
  { id: "ken-stabler", name: "Ken Stabler", games: 184, completions: 2270, attempts: 3793, passingYards: 27938, passingTouchdowns: 194, interceptions: 222 },
  { id: "sonny-jurgensen", name: "Sonny Jurgensen", games: 218, completions: 2433, attempts: 4262, passingYards: 32224, passingTouchdowns: 255, interceptions: 189 },
  { id: "bob-griese", name: "Bob Griese", games: 161, completions: 1926, attempts: 3429, passingYards: 25092, passingTouchdowns: 192, interceptions: 172 },
  { id: "warren-moon", name: "Warren Moon", games: 208, completions: 3988, attempts: 6823, passingYards: 49325, passingTouchdowns: 291, interceptions: 233 },
  { id: "cam-newton", name: "Cam Newton", games: 148, completions: 2682, attempts: 4474, passingYards: 32382, passingTouchdowns: 194, interceptions: 123 },
  { id: "joe-namath", name: "Joe Namath", games: 140, completions: 1886, attempts: 3762, passingYards: 27663, passingTouchdowns: 173, interceptions: 220 },
  { id: "len-dawson", name: "Len Dawson", games: 211, completions: 2136, attempts: 3741, passingYards: 28711, passingTouchdowns: 239, interceptions: 183 },
  { id: "ben-roethlisberger", name: "Ben Roethlisberger", games: 249, completions: 5440, attempts: 8443, passingYards: 64088, passingTouchdowns: 418, interceptions: 211 },
  { id: "jay-cutler", name: "Jay Cutler", games: 153, completions: 3048, attempts: 4920, passingYards: 35133, passingTouchdowns: 227, interceptions: 160 },
  { id: "matt-ryan", name: "Matt Ryan", games: 234, completions: 5551, attempts: 8464, passingYards: 62792, passingTouchdowns: 381, interceptions: 183 },
  { id: "steve-young", name: "Steve Young", games: 169, completions: 2667, attempts: 4149, passingYards: 33124, passingTouchdowns: 232, interceptions: 107 },
  { id: "troy-aikman", name: "Troy Aikman", games: 165, completions: 2898, attempts: 4715, passingYards: 32942, passingTouchdowns: 165, interceptions: 141 },
  { id: "andrew-luck", name: "Andrew Luck", games: 86, completions: 2000, attempts: 3290, passingYards: 23671, passingTouchdowns: 171, interceptions: 83 },
] as const;

export const footballRbCareerRows: readonly FootballRbCareerRow[] = [
  { id: "emmitt-smith", name: "Emmitt Smith", games: 226, rushingAttempts: 4409, rushingYards: 18355, rushingTouchdowns: 164, receptions: 515, receivingYards: 3224, receivingTouchdowns: 11 },
  { id: "walter-payton", name: "Walter Payton", games: 190, rushingAttempts: 3838, rushingYards: 16726, rushingTouchdowns: 110, receptions: 492, receivingYards: 4538, receivingTouchdowns: 15 },
  { id: "frank-gore", name: "Frank Gore", games: 241, rushingAttempts: 3735, rushingYards: 16000, rushingTouchdowns: 81, receptions: 484, receivingYards: 3985, receivingTouchdowns: 18 },
  { id: "barry-sanders", name: "Barry Sanders", games: 153, rushingAttempts: 3062, rushingYards: 15269, rushingTouchdowns: 99, receptions: 352, receivingYards: 2921, receivingTouchdowns: 10 },
  { id: "adrian-peterson", name: "Adrian Peterson", games: 184, rushingAttempts: 3230, rushingYards: 14918, rushingTouchdowns: 120, receptions: 305, receivingYards: 2474, receivingTouchdowns: 6 },
  { id: "curtis-martin", name: "Curtis Martin", games: 168, rushingAttempts: 3518, rushingYards: 14101, rushingTouchdowns: 90, receptions: 484, receivingYards: 3329, receivingTouchdowns: 10 },
  { id: "ladainian-tomlinson", name: "LaDainian Tomlinson", games: 170, rushingAttempts: 3174, rushingYards: 13684, rushingTouchdowns: 145, receptions: 624, receivingYards: 4772, receivingTouchdowns: 17 },
  { id: "jerome-bettis", name: "Jerome Bettis", games: 192, rushingAttempts: 3479, rushingYards: 13662, rushingTouchdowns: 91, receptions: 200, receivingYards: 1449, receivingTouchdowns: 3 },
  { id: "eric-dickerson", name: "Eric Dickerson", games: 146, rushingAttempts: 2996, rushingYards: 13259, rushingTouchdowns: 90, receptions: 281, receivingYards: 2137, receivingTouchdowns: 6 },
  { id: "tony-dorsett", name: "Tony Dorsett", games: 173, rushingAttempts: 2936, rushingYards: 12739, rushingTouchdowns: 77, receptions: 398, receivingYards: 3554, receivingTouchdowns: 13 },
  { id: "jim-brown", name: "Jim Brown", games: 118, rushingAttempts: 2359, rushingYards: 12312, rushingTouchdowns: 106, receptions: 262, receivingYards: 2499, receivingTouchdowns: 20 },
  { id: "marshall-faulk", name: "Marshall Faulk", games: 176, rushingAttempts: 2836, rushingYards: 12279, rushingTouchdowns: 100, receptions: 767, receivingYards: 6875, receivingTouchdowns: 36 },
  { id: "roger-craig", name: "Roger Craig", games: 165, rushingAttempts: 1991, rushingYards: 8189, rushingTouchdowns: 56, receptions: 566, receivingYards: 4911, receivingTouchdowns: 17 },
  { id: "terrell-davis", name: "Terrell Davis", games: 78, rushingAttempts: 1655, rushingYards: 7607, rushingTouchdowns: 60, receptions: 169, receivingYards: 1280, receivingTouchdowns: 5 },
  { id: "edgerrin-james", name: "Edgerrin James", games: 148, rushingAttempts: 3028, rushingYards: 12246, rushingTouchdowns: 80, receptions: 433, receivingYards: 3364, receivingTouchdowns: 11 },
  { id: "thurman-thomas", name: "Thurman Thomas", games: 182, rushingAttempts: 2877, rushingYards: 12074, rushingTouchdowns: 65, receptions: 472, receivingYards: 4458, receivingTouchdowns: 23 },
  { id: "marcus-allen", name: "Marcus Allen", games: 222, rushingAttempts: 3022, rushingYards: 12243, rushingTouchdowns: 123, receptions: 587, receivingYards: 5411, receivingTouchdowns: 21 },
  { id: "john-riggins", name: "John Riggins", games: 175, rushingAttempts: 2916, rushingYards: 11352, rushingTouchdowns: 104, receptions: 250, receivingYards: 2090, receivingTouchdowns: 12 },
  { id: "earl-campbell", name: "Earl Campbell", games: 115, rushingAttempts: 2187, rushingYards: 9407, rushingTouchdowns: 74, receptions: 121, receivingYards: 806, receivingTouchdowns: 0 },
  { id: "franco-harris", name: "Franco Harris", games: 173, rushingAttempts: 2949, rushingYards: 12120, rushingTouchdowns: 91, receptions: 307, receivingYards: 2287, receivingTouchdowns: 9 },
  { id: "gale-sayers", name: "Gale Sayers", games: 68, rushingAttempts: 991, rushingYards: 4956, rushingTouchdowns: 39, receptions: 112, receivingYards: 1307, receivingTouchdowns: 9 },
  { id: "jim-taylor", name: "Jim Taylor", games: 133, rushingAttempts: 1941, rushingYards: 8597, rushingTouchdowns: 83, receptions: 225, receivingYards: 1756, receivingTouchdowns: 10 },
  { id: "lenny-moore", name: "Lenny Moore", games: 143, rushingAttempts: 1069, rushingYards: 5174, rushingTouchdowns: 63, receptions: 363, receivingYards: 6039, receivingTouchdowns: 48 },
  { id: "lesean-mccoy", name: "LeSean McCoy", games: 170, rushingAttempts: 2457, rushingYards: 11102, rushingTouchdowns: 73, receptions: 518, receivingYards: 3898, receivingTouchdowns: 16 },
  { id: "leroy-kelly", name: "Leroy Kelly", games: 136, rushingAttempts: 1727, rushingYards: 7274, rushingTouchdowns: 74, receptions: 190, receivingYards: 2281, receivingTouchdowns: 13 },
] as const;

export const footballCfbChampionSeasonRows: readonly FootballCfbChampionSeasonRow[] = [
  { id: "1995-nebraska", name: "1995 Nebraska", pointsFor: 576, pointsAgainst: 150, pointsPerGame: 52.4, opponentPointsPerGame: 13.6, srs: 26.86, sos: 3.78 },
  { id: "1998-tennessee", name: "1998 Tennessee", pointsFor: 408, pointsAgainst: 173, pointsPerGame: 34.0, opponentPointsPerGame: 14.4, srs: 19.95, sos: 4.42 },
  { id: "1999-florida-state", name: "1999 Florida State", pointsFor: 412, pointsAgainst: 174, pointsPerGame: 37.5, opponentPointsPerGame: 15.8, srs: 23.50, sos: 5.58 },
  { id: "2000-oklahoma", name: "2000 Oklahoma", pointsFor: 468, pointsAgainst: 192, pointsPerGame: 39.0, opponentPointsPerGame: 16.0, srs: 21.55, sos: 5.32 },
  { id: "2001-miami", name: "2001 Miami", pointsFor: 475, pointsAgainst: 103, pointsPerGame: 43.2, opponentPointsPerGame: 9.4, srs: 26.17, sos: 5.08 },
  { id: "2002-ohio-state", name: "2002 Ohio State", pointsFor: 410, pointsAgainst: 183, pointsPerGame: 29.3, opponentPointsPerGame: 13.1, srs: 18.13, sos: 3.99 },
  { id: "2003-lsu", name: "2003 LSU", pointsFor: 475, pointsAgainst: 154, pointsPerGame: 33.9, opponentPointsPerGame: 11.0, srs: 20.85, sos: 3.28 },
  { id: "2004-usc", name: "2004 USC", pointsFor: 496, pointsAgainst: 169, pointsPerGame: 38.2, opponentPointsPerGame: 13.0, srs: 26.06, sos: 8.22 },
  { id: "2005-texas", name: "2005 Texas", pointsFor: 652, pointsAgainst: 213, pointsPerGame: 50.2, opponentPointsPerGame: 16.4, srs: 24.98, sos: 4.98 },
  { id: "2006-florida", name: "2006 Florida", pointsFor: 416, pointsAgainst: 189, pointsPerGame: 29.7, opponentPointsPerGame: 13.5, srs: 19.66, sos: 6.95 },
  { id: "2007-lsu", name: "2007 LSU", pointsFor: 541, pointsAgainst: 279, pointsPerGame: 38.6, opponentPointsPerGame: 19.9, srs: 18.41, sos: 5.77 },
  { id: "2008-florida", name: "2008 Florida", pointsFor: 611, pointsAgainst: 181, pointsPerGame: 43.6, opponentPointsPerGame: 12.9, srs: 25.37, sos: 5.58 },
  { id: "2009-alabama", name: "2009 Alabama", pointsFor: 449, pointsAgainst: 164, pointsPerGame: 32.1, opponentPointsPerGame: 11.7, srs: 23.69, sos: 6.62 },
  { id: "2010-auburn", name: "2010 Auburn", pointsFor: 577, pointsAgainst: 337, pointsPerGame: 41.2, opponentPointsPerGame: 24.1, srs: 20.66, sos: 5.95 },
  { id: "2011-alabama", name: "2011 Alabama", pointsFor: 453, pointsAgainst: 106, pointsPerGame: 34.8, opponentPointsPerGame: 8.2, srs: 24.44, sos: 4.21 },
  { id: "2012-alabama", name: "2012 Alabama", pointsFor: 542, pointsAgainst: 153, pointsPerGame: 38.7, opponentPointsPerGame: 10.9, srs: 24.51, sos: 5.51 },
  { id: "2013-florida-state", name: "2013 Florida State", pointsFor: 723, pointsAgainst: 170, pointsPerGame: 51.6, opponentPointsPerGame: 12.1, srs: 23.36, sos: 1.29 },
  { id: "2014-ohio-state", name: "2014 Ohio State", pointsFor: 672, pointsAgainst: 330, pointsPerGame: 44.8, opponentPointsPerGame: 22.0, srs: 20.43, sos: 5.17 },
  { id: "2015-alabama", name: "2015 Alabama", pointsFor: 526, pointsAgainst: 227, pointsPerGame: 35.1, opponentPointsPerGame: 15.1, srs: 23.72, sos: 7.46 },
  { id: "2017-alabama", name: "2017 Alabama", pointsFor: 519, pointsAgainst: 167, pointsPerGame: 37.1, opponentPointsPerGame: 11.9, srs: 21.25, sos: 5.46 },
  { id: "2018-clemson", name: "2018 Clemson", pointsFor: 664, pointsAgainst: 197, pointsPerGame: 44.3, opponentPointsPerGame: 13.1, srs: 26.45, sos: 5.19 },
  { id: "2019-lsu", name: "2019 LSU", pointsFor: 726, pointsAgainst: 328, pointsPerGame: 48.4, opponentPointsPerGame: 21.9, srs: 25.80, sos: 6.60 },
  { id: "2020-alabama", name: "2020 Alabama", pointsFor: 630, pointsAgainst: 252, pointsPerGame: 48.5, opponentPointsPerGame: 19.4, srs: 30.26, sos: 9.72 },
  { id: "2021-georgia", name: "2021 Georgia", pointsFor: 579, pointsAgainst: 153, pointsPerGame: 38.6, opponentPointsPerGame: 10.2, srs: 24.62, sos: 5.62 },
  { id: "2022-georgia", name: "2022 Georgia", pointsFor: 616, pointsAgainst: 214, pointsPerGame: 41.1, opponentPointsPerGame: 14.3, srs: 25.48, sos: 6.28 },
] as const;
