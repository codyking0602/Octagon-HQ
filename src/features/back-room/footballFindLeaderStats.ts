export type FootballFindLeaderDomainId = "nfl-qb-career" | "nfl-rb-career" | "cfb-champion-season";
export type FootballFindLeaderLeagueId = "nfl" | "cfb";

export type FootballFindLeaderFamilyId =
  | "qb-volume"
  | "qb-efficiency"
  | "rb-rushing"
  | "rb-receiving"
  | "rb-scrimmage"
  | "cfb-offense"
  | "cfb-defense"
  | "cfb-strength";

export type FootballFindLeaderMetricId =
  | "qb-games"
  | "qb-completions"
  | "qb-attempts"
  | "qb-passing-yards"
  | "qb-passing-touchdowns"
  | "qb-interceptions"
  | "qb-passer-rating"
  | "qb-completion-pct"
  | "qb-yards-per-attempt"
  | "qb-touchdown-pct"
  | "qb-passing-yards-per-game"
  | "qb-passing-touchdowns-per-game"
  | "qb-completions-per-game"
  | "qb-attempts-per-game"
  | "qb-td-int-ratio"
  | "rb-games"
  | "rb-rushing-attempts"
  | "rb-rushing-yards"
  | "rb-rushing-touchdowns"
  | "rb-receptions"
  | "rb-receiving-yards"
  | "rb-receiving-touchdowns"
  | "rb-rush-yards-per-attempt"
  | "rb-rushing-yards-per-game"
  | "rb-rushing-touchdowns-per-game"
  | "rb-receptions-per-game"
  | "rb-receiving-yards-per-game"
  | "rb-scrimmage-yards"
  | "rb-scrimmage-yards-per-game"
  | "rb-scrimmage-touchdowns"
  | "cfb-points-for"
  | "cfb-points-against"
  | "cfb-points-per-game"
  | "cfb-opponent-points-per-game"
  | "cfb-point-differential"
  | "cfb-scoring-margin-per-game"
  | "cfb-points-ratio"
  | "cfb-differential-rate-pct"
  | "cfb-total-points"
  | "cfb-srs"
  | "cfb-sos";

export type FootballFindLeaderUnit = "count" | "yards" | "rating" | "percent" | "per-game" | "per-attempt" | "ratio" | "points";

export interface FootballFindLeaderMetricDefinition {
  id: FootballFindLeaderMetricId;
  domainId: FootballFindLeaderDomainId;
  family: FootballFindLeaderFamilyId;
  label: string;
  shortLabel: string;
  unit: FootballFindLeaderUnit;
  decimals: 0 | 1 | 2;
  questionLead: string;
}

const metric = (
  id: FootballFindLeaderMetricId,
  domainId: FootballFindLeaderDomainId,
  family: FootballFindLeaderFamilyId,
  label: string,
  shortLabel: string,
  unit: FootballFindLeaderUnit,
  decimals: 0 | 1 | 2,
  questionLead: string,
): FootballFindLeaderMetricDefinition => ({ id, domainId, family, label, shortLabel, unit, decimals, questionLead });

export const footballFindLeaderMetricDefinitions: readonly FootballFindLeaderMetricDefinition[] = [
  metric("qb-games", "nfl-qb-career", "qb-volume", "career games", "GAMES", "count", 0, "the most career games"),
  metric("qb-completions", "nfl-qb-career", "qb-volume", "career completions", "COMPLETIONS", "count", 0, "the most career completions"),
  metric("qb-attempts", "nfl-qb-career", "qb-volume", "career pass attempts", "ATTEMPTS", "count", 0, "the most career pass attempts"),
  metric("qb-passing-yards", "nfl-qb-career", "qb-volume", "career passing yards", "PASS YARDS", "yards", 0, "the most career passing yards"),
  metric("qb-passing-touchdowns", "nfl-qb-career", "qb-volume", "career passing touchdowns", "PASS TD", "count", 0, "the most career passing touchdowns"),
  metric("qb-interceptions", "nfl-qb-career", "qb-volume", "career interceptions thrown", "INTERCEPTIONS", "count", 0, "the most career interceptions thrown"),
  metric("qb-passer-rating", "nfl-qb-career", "qb-efficiency", "career passer rating", "PASSER RATING", "rating", 1, "the highest career passer rating"),
  metric("qb-completion-pct", "nfl-qb-career", "qb-efficiency", "career completion percentage", "COMP %", "percent", 1, "the highest career completion percentage"),
  metric("qb-yards-per-attempt", "nfl-qb-career", "qb-efficiency", "career yards per attempt", "Y/A", "per-attempt", 2, "the most career passing yards per attempt"),
  metric("qb-touchdown-pct", "nfl-qb-career", "qb-efficiency", "touchdown rate", "TD %", "percent", 2, "the highest career touchdown rate"),
  metric("qb-passing-yards-per-game", "nfl-qb-career", "qb-efficiency", "passing yards per game", "PASS YDS/G", "per-game", 1, "the most career passing yards per game"),
  metric("qb-passing-touchdowns-per-game", "nfl-qb-career", "qb-efficiency", "passing touchdowns per game", "PASS TD/G", "per-game", 2, "the most career passing touchdowns per game"),
  metric("qb-completions-per-game", "nfl-qb-career", "qb-efficiency", "completions per game", "CMP/G", "per-game", 1, "the most career completions per game"),
  metric("qb-attempts-per-game", "nfl-qb-career", "qb-efficiency", "pass attempts per game", "ATT/G", "per-game", 1, "the most career pass attempts per game"),
  metric("qb-td-int-ratio", "nfl-qb-career", "qb-efficiency", "touchdown-to-interception ratio", "TD:INT", "ratio", 2, "the best career touchdown-to-interception ratio"),
  metric("rb-games", "nfl-rb-career", "rb-rushing", "career games", "GAMES", "count", 0, "the most career games"),
  metric("rb-rushing-attempts", "nfl-rb-career", "rb-rushing", "career rushing attempts", "CARRIES", "count", 0, "the most career rushing attempts"),
  metric("rb-rushing-yards", "nfl-rb-career", "rb-rushing", "career rushing yards", "RUSH YARDS", "yards", 0, "the most career rushing yards"),
  metric("rb-rushing-touchdowns", "nfl-rb-career", "rb-rushing", "career rushing touchdowns", "RUSH TD", "count", 0, "the most career rushing touchdowns"),
  metric("rb-rush-yards-per-attempt", "nfl-rb-career", "rb-rushing", "career rushing yards per attempt", "Y/C", "per-attempt", 2, "the most career rushing yards per attempt"),
  metric("rb-rushing-yards-per-game", "nfl-rb-career", "rb-rushing", "rushing yards per game", "RUSH YDS/G", "per-game", 1, "the most career rushing yards per game"),
  metric("rb-rushing-touchdowns-per-game", "nfl-rb-career", "rb-rushing", "rushing touchdowns per game", "RUSH TD/G", "per-game", 2, "the most career rushing touchdowns per game"),
  metric("rb-receptions", "nfl-rb-career", "rb-receiving", "career receptions", "RECEPTIONS", "count", 0, "the most career receptions"),
  metric("rb-receiving-yards", "nfl-rb-career", "rb-receiving", "career receiving yards", "REC YARDS", "yards", 0, "the most career receiving yards"),
  metric("rb-receiving-touchdowns", "nfl-rb-career", "rb-receiving", "career receiving touchdowns", "REC TD", "count", 0, "the most career receiving touchdowns"),
  metric("rb-receptions-per-game", "nfl-rb-career", "rb-receiving", "receptions per game", "REC/G", "per-game", 1, "the most career receptions per game"),
  metric("rb-receiving-yards-per-game", "nfl-rb-career", "rb-receiving", "receiving yards per game", "REC YDS/G", "per-game", 1, "the most career receiving yards per game"),
  metric("rb-scrimmage-yards", "nfl-rb-career", "rb-scrimmage", "career scrimmage yards", "SCRIMMAGE YDS", "yards", 0, "the most career yards from scrimmage"),
  metric("rb-scrimmage-yards-per-game", "nfl-rb-career", "rb-scrimmage", "scrimmage yards per game", "SCRIM YDS/G", "per-game", 1, "the most career scrimmage yards per game"),
  metric("rb-scrimmage-touchdowns", "nfl-rb-career", "rb-scrimmage", "career scrimmage touchdowns", "SCRIMMAGE TD", "count", 0, "the most career rushing plus receiving touchdowns"),
  metric("cfb-points-for", "cfb-champion-season", "cfb-offense", "season points scored", "POINTS FOR", "points", 0, "the most points scored"),
  metric("cfb-points-per-game", "cfb-champion-season", "cfb-offense", "points per game", "PPG", "per-game", 1, "the most points per game"),
  metric("cfb-point-differential", "cfb-champion-season", "cfb-offense", "season point differential", "POINT DIFF", "points", 0, "the largest total point differential"),
  metric("cfb-differential-rate-pct", "cfb-champion-season", "cfb-offense", "point differential as a share of points scored", "DIFF RATE", "percent", 1, "the highest point-differential rate"),
  metric("cfb-points-against", "cfb-champion-season", "cfb-defense", "season points allowed", "POINTS ALLOWED", "points", 0, "the most points allowed"),
  metric("cfb-opponent-points-per-game", "cfb-champion-season", "cfb-defense", "opponent points per game", "OPP PPG", "per-game", 1, "the most opponent points per game"),
  metric("cfb-scoring-margin-per-game", "cfb-champion-season", "cfb-defense", "scoring margin per game", "MARGIN/G", "per-game", 1, "the largest scoring margin per game"),
  metric("cfb-points-ratio", "cfb-champion-season", "cfb-defense", "points-for to points-against ratio", "PF:PA", "ratio", 2, "the best points-for to points-against ratio"),
  metric("cfb-total-points", "cfb-champion-season", "cfb-strength", "combined points in the season", "TOTAL POINTS", "points", 0, "the most combined points scored and allowed"),
  metric("cfb-srs", "cfb-champion-season", "cfb-strength", "Simple Rating System score", "SRS", "rating", 2, "the highest SRS"),
  metric("cfb-sos", "cfb-champion-season", "cfb-strength", "strength of schedule", "SOS", "rating", 2, "the highest strength of schedule"),
] as const;

export const FOOTBALL_FIND_LEADER_METRIC_COUNT = footballFindLeaderMetricDefinitions.length;

interface QbCareerRow {
  id: string;
  name: string;
  games: number;
  completions: number;
  attempts: number;
  passingYards: number;
  passingTouchdowns: number;
  interceptions: number;
}
interface RbCareerRow {
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
interface CfbChampionRow {
  id: string;
  name: string;
  pointsFor: number;
  pointsAgainst: number;
  pointsPerGame: number;
  opponentPointsPerGame: number;
  srs: number;
  sos: number;
}

const qbRows: readonly QbCareerRow[] = [
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

const rbRows: readonly RbCareerRow[] = [
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

const cfbRows: readonly CfbChampionRow[] = [
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

export interface FootballFindLeaderSubject {
  id: string;
  name: string;
  subtitle: string;
  domainId: FootballFindLeaderDomainId;
}

export const footballFindLeaderSubjects: readonly FootballFindLeaderSubject[] = [
  ...qbRows.map((row) => ({ id: row.id, name: row.name, subtitle: "Retired NFL quarterback", domainId: "nfl-qb-career" as const })),
  ...rbRows.map((row) => ({ id: row.id, name: row.name, subtitle: "Retired NFL running back", domainId: "nfl-rb-career" as const })),
  ...cfbRows.map((row) => ({ id: row.id, name: row.name, subtitle: "National-championship season", domainId: "cfb-champion-season" as const })),
];

export const FOOTBALL_FIND_LEADER_SUBJECT_COUNT = footballFindLeaderSubjects.length;
export const FOOTBALL_FIND_LEADER_DOMAIN_POOL_SIZE = 25;

const qbById = new Map(qbRows.map((row) => [row.id, row]));
const rbById = new Map(rbRows.map((row) => [row.id, row]));
const cfbById = new Map(cfbRows.map((row) => [row.id, row]));
const metricById = new Map(footballFindLeaderMetricDefinitions.map((row) => [row.id, row]));

export const footballFindLeaderSources = [
  {
    id: "pfr-career-stat-lines",
    publisher: "Pro Football Reference",
    title: "NFL retired quarterback and running back career stat lines",
    url: "https://www.pro-football-reference.com/",
    reviewedOn: "2026-08-22",
    coverage: "25 retired quarterbacks and 25 retired running backs used by Football Find the Leader",
  },
  {
    id: "cfr-champion-season-stat-lines",
    publisher: "College Football at Sports-Reference",
    title: "College football national-champion season stat lines",
    url: "https://www.sports-reference.com/cfb/",
    reviewedOn: "2026-08-22",
    coverage: "25 completed national-championship seasons used by Football Find the Leader",
  },
] as const;

function nflPasserRating(row: QbCareerRow) {
  const a = Math.min(2.375, Math.max(0, (row.completions / row.attempts - 0.3) * 5));
  const b = Math.min(2.375, Math.max(0, (row.passingYards / row.attempts - 3) * 0.25));
  const c = Math.min(2.375, Math.max(0, row.passingTouchdowns / row.attempts * 20));
  const d = Math.min(2.375, Math.max(0, 2.375 - row.interceptions / row.attempts * 25));
  return (a + b + c + d) / 6 * 100;
}

function qbValue(row: QbCareerRow, metricId: FootballFindLeaderMetricId): number | null {
  switch (metricId) {
    case "qb-games": return row.games;
    case "qb-completions": return row.completions;
    case "qb-attempts": return row.attempts;
    case "qb-passing-yards": return row.passingYards;
    case "qb-passing-touchdowns": return row.passingTouchdowns;
    case "qb-interceptions": return row.interceptions;
    case "qb-passer-rating": return nflPasserRating(row);
    case "qb-completion-pct": return row.completions / row.attempts * 100;
    case "qb-yards-per-attempt": return row.passingYards / row.attempts;
    case "qb-touchdown-pct": return row.passingTouchdowns / row.attempts * 100;
    case "qb-passing-yards-per-game": return row.passingYards / row.games;
    case "qb-passing-touchdowns-per-game": return row.passingTouchdowns / row.games;
    case "qb-completions-per-game": return row.completions / row.games;
    case "qb-attempts-per-game": return row.attempts / row.games;
    case "qb-td-int-ratio": return row.passingTouchdowns / row.interceptions;
    default: return null;
  }
}

function rbValue(row: RbCareerRow, metricId: FootballFindLeaderMetricId): number | null {
  const scrimmageYards = row.rushingYards + row.receivingYards;
  switch (metricId) {
    case "rb-games": return row.games;
    case "rb-rushing-attempts": return row.rushingAttempts;
    case "rb-rushing-yards": return row.rushingYards;
    case "rb-rushing-touchdowns": return row.rushingTouchdowns;
    case "rb-receptions": return row.receptions;
    case "rb-receiving-yards": return row.receivingYards;
    case "rb-receiving-touchdowns": return row.receivingTouchdowns;
    case "rb-rush-yards-per-attempt": return row.rushingYards / row.rushingAttempts;
    case "rb-rushing-yards-per-game": return row.rushingYards / row.games;
    case "rb-rushing-touchdowns-per-game": return row.rushingTouchdowns / row.games;
    case "rb-receptions-per-game": return row.receptions / row.games;
    case "rb-receiving-yards-per-game": return row.receivingYards / row.games;
    case "rb-scrimmage-yards": return scrimmageYards;
    case "rb-scrimmage-yards-per-game": return scrimmageYards / row.games;
    case "rb-scrimmage-touchdowns": return row.rushingTouchdowns + row.receivingTouchdowns;
    default: return null;
  }
}

function cfbValue(row: CfbChampionRow, metricId: FootballFindLeaderMetricId): number | null {
  switch (metricId) {
    case "cfb-points-for": return row.pointsFor;
    case "cfb-points-against": return row.pointsAgainst;
    case "cfb-points-per-game": return row.pointsPerGame;
    case "cfb-opponent-points-per-game": return row.opponentPointsPerGame;
    case "cfb-point-differential": return row.pointsFor - row.pointsAgainst;
    case "cfb-scoring-margin-per-game": return row.pointsPerGame - row.opponentPointsPerGame;
    case "cfb-points-ratio": return row.pointsFor / row.pointsAgainst;
    case "cfb-differential-rate-pct": return (row.pointsFor - row.pointsAgainst) / row.pointsFor * 100;
    case "cfb-total-points": return row.pointsFor + row.pointsAgainst;
    case "cfb-srs": return row.srs;
    case "cfb-sos": return row.sos;
    default: return null;
  }
}

export function footballFindLeaderLeagueForDomain(domainId: FootballFindLeaderDomainId): FootballFindLeaderLeagueId {
  return domainId === "cfb-champion-season" ? "cfb" : "nfl";
}

export function getFootballFindLeaderFact(subjectId: string, metricId: FootballFindLeaderMetricId) {
  const definition = metricById.get(metricId);
  if (!definition) return null;
  const value = definition.domainId === "nfl-qb-career"
    ? qbById.has(subjectId) ? qbValue(qbById.get(subjectId)!, metricId) : null
    : definition.domainId === "nfl-rb-career"
      ? rbById.has(subjectId) ? rbValue(rbById.get(subjectId)!, metricId) : null
      : cfbById.has(subjectId) ? cfbValue(cfbById.get(subjectId)!, metricId) : null;
  if (value === null || !Number.isFinite(value)) return null;
  const source = definition.domainId === "cfb-champion-season" ? footballFindLeaderSources[1] : footballFindLeaderSources[0];
  return { definition, value, sources: [source] };
}

export function formatFootballFindLeaderFact(metricId: FootballFindLeaderMetricId, value: number) {
  const definition = metricById.get(metricId);
  if (!definition) throw new Error(`Unknown Football Find the Leader metric: ${metricId}`);
  const formatted = value.toLocaleString("en-US", { minimumFractionDigits: definition.decimals, maximumFractionDigits: definition.decimals });
  return definition.unit === "percent" ? `${formatted}%` : formatted;
}
