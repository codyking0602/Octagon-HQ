import { footballCfbChampionSeasonRows, footballQbCareerRows, footballRbCareerRows } from "./footballFactualStatsCoverage";
import { footballComparisonCanonicalSubjects } from "./footballCanonicalSubjectExpansion";

export type FootballFindLeaderDomainId =
  | "nfl-qb-career"
  | "nfl-rb-career"
  | "nfl-qb-season"
  | "nfl-team-season"
  | "cfb-champion-season"
  | "cfb-team-season";
export type FootballFindLeaderLeagueId = "nfl" | "cfb";

export type FootballFindLeaderFamilyId =
  | "qb-volume"
  | "qb-efficiency"
  | "rb-rushing"
  | "rb-receiving"
  | "rb-scrimmage"
  | "qb-season"
  | "nfl-team-season"
  | "cfb-team-season"
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
  | "qb-season-passing-yards"
  | "qb-season-passing-touchdowns"
  | "qb-season-interceptions"
  | "qb-season-passer-rating"
  | "nfl-team-wins"
  | "nfl-team-losses"
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
  | "cfb-sos"
  | "cfb-team-season-wins";

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
  metric("qb-season-passing-yards", "nfl-qb-season", "qb-season", "season passing yards", "PASS YARDS", "yards", 0, "the most passing yards in the season"),
  metric("qb-season-passing-touchdowns", "nfl-qb-season", "qb-season", "season passing touchdowns", "PASS TD", "count", 0, "the most passing touchdowns in the season"),
  metric("qb-season-interceptions", "nfl-qb-season", "qb-season", "season interceptions thrown", "INTERCEPTIONS", "count", 0, "the most interceptions thrown in the season"),
  metric("qb-season-passer-rating", "nfl-qb-season", "qb-season", "season passer rating", "PASSER RATING", "rating", 1, "the highest passer rating in the season"),
  metric("nfl-team-wins", "nfl-team-season", "nfl-team-season", "overall wins", "WINS", "count", 0, "the most overall wins"),
  metric("nfl-team-losses", "nfl-team-season", "nfl-team-season", "overall losses", "LOSSES", "count", 0, "the most overall losses"),
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
  metric("cfb-team-season-wins", "cfb-team-season", "cfb-team-season", "season wins", "WINS", "count", 0, "the most wins in the season"),
] as const;

export const FOOTBALL_FIND_LEADER_METRIC_COUNT = footballFindLeaderMetricDefinitions.length;

const qbRows = footballQbCareerRows;
const rbRows = footballRbCareerRows;
const cfbRows = footballCfbChampionSeasonRows;

export type FootballCanonicalSubjectKind = "player-career" | "player-season" | "team-season" | "program" | "program-era" | "coach";
export type FootballCanonicalLeague = "NFL" | "CFB";
export type FootballCanonicalPosition = "QB" | "RB" | "WR" | "TE" | "OL" | "DL" | "LB" | "DB" | "K" | "P";

export interface FootballCanonicalSubject {
  id: string;
  name: string;
  kind: FootballCanonicalSubjectKind;
  league: FootballCanonicalLeague;
  /** Every level represented by this identity; a two-level player remains one subject. */
  leagues?: readonly FootballCanonicalLeague[];
  aliases?: readonly string[];
  position?: FootballCanonicalPosition;
  season?: number;
  startSeason?: number;
  endSeason?: number;
  activeDecades?: readonly number[];
  school?: string;
  conference?: string;
  /** Season whose alignment the conference value describes. */
  conferenceSeason?: number;
  franchises?: readonly string[];
  draftYear?: number;
  draftRound?: number;
  draftPick?: number;
  firstRoundPick?: boolean;
  firstOverallPick?: boolean;
  undrafted?: boolean;
  heismanWinner?: boolean;
  nationalChampion?: boolean;
}

const program = (id: string, name: string, conference: string): FootballCanonicalSubject => ({
  id: `program-${id}`, name, kind: "program", league: "CFB", conference, conferenceSeason: 2025,
});
const collegePlayer = (id: string, name: string, position: FootballCanonicalPosition, school: string, decade: number, heismanWinner: boolean): FootballCanonicalSubject => ({
  id, name, kind: "player-career", league: "CFB", position, school, activeDecades: [decade], heismanWinner,
});
const nflPlayer = (id: string, name: string, position: FootballCanonicalPosition, college: string, franchises: readonly string[], draftYear: number, draftRound: number, draftPick: number, activeDecades: readonly number[]): FootballCanonicalSubject => ({
  id, name, kind: "player-career", league: "NFL", position, school: college, franchises, draftYear, draftRound, draftPick,
  firstRoundPick: draftRound === 1, firstOverallPick: draftPick === 1, undrafted: false, activeDecades,
});

const footballProgramSubjects: readonly FootballCanonicalSubject[] = [
  program("alabama", "Alabama", "SEC"),
  program("auburn", "Auburn", "SEC"),
  program("arkansas", "Arkansas", "SEC"),
  program("florida", "Florida", "SEC"),
  program("georgia", "Georgia", "SEC"),
  program("kentucky", "Kentucky", "SEC"),
  program("lsu", "LSU", "SEC"),
  program("mississippi-state", "Mississippi State", "SEC"),
  program("missouri", "Missouri", "SEC"),
  program("ole-miss", "Ole Miss", "SEC"),
  program("oklahoma", "Oklahoma", "SEC"),
  program("south-carolina", "South Carolina", "SEC"),
  program("tennessee", "Tennessee", "SEC"),
  program("texas", "Texas", "SEC"),
  program("texas-a-m", "Texas A&M", "SEC"),
  program("vanderbilt", "Vanderbilt", "SEC"),
  program("illinois", "Illinois", "Big Ten"),
  program("indiana", "Indiana", "Big Ten"),
  program("iowa", "Iowa", "Big Ten"),
  program("maryland", "Maryland", "Big Ten"),
  program("michigan", "Michigan", "Big Ten"),
  program("michigan-state", "Michigan State", "Big Ten"),
  program("minnesota", "Minnesota", "Big Ten"),
  program("nebraska", "Nebraska", "Big Ten"),
  program("northwestern", "Northwestern", "Big Ten"),
  program("ohio-state", "Ohio State", "Big Ten"),
  program("oregon", "Oregon", "Big Ten"),
  program("penn-state", "Penn State", "Big Ten"),
  program("purdue", "Purdue", "Big Ten"),
  program("rutgers", "Rutgers", "Big Ten"),
  program("ucla", "UCLA", "Big Ten"),
  program("usc", "USC", "Big Ten"),
  program("washington", "Washington", "Big Ten"),
  program("wisconsin", "Wisconsin", "Big Ten"),
  program("arizona", "Arizona", "Big 12"),
  program("arizona-state", "Arizona State", "Big 12"),
  program("baylor", "Baylor", "Big 12"),
  program("byu", "BYU", "Big 12"),
  program("cincinnati", "Cincinnati", "Big 12"),
  program("colorado", "Colorado", "Big 12"),
  program("houston", "Houston", "Big 12"),
  program("iowa-state", "Iowa State", "Big 12"),
  program("kansas", "Kansas", "Big 12"),
  program("kansas-state", "Kansas State", "Big 12"),
  program("oklahoma-state", "Oklahoma State", "Big 12"),
  program("tcu", "TCU", "Big 12"),
  program("texas-tech", "Texas Tech", "Big 12"),
  program("ucf", "UCF", "Big 12"),
  program("utah", "Utah", "Big 12"),
  program("west-virginia", "West Virginia", "Big 12"),
  program("boston-college", "Boston College", "ACC"),
  program("california", "California", "ACC"),
  program("clemson", "Clemson", "ACC"),
  program("duke", "Duke", "ACC"),
  program("florida-state", "Florida State", "ACC"),
  program("georgia-tech", "Georgia Tech", "ACC"),
  program("louisville", "Louisville", "ACC"),
  program("miami", "Miami", "ACC"),
  program("nc-state", "NC State", "ACC"),
  program("north-carolina", "North Carolina", "ACC"),
  program("pittsburgh", "Pittsburgh", "ACC"),
  program("smu", "SMU", "ACC"),
  program("stanford", "Stanford", "ACC"),
  program("syracuse", "Syracuse", "ACC"),
  program("virginia", "Virginia", "ACC"),
  program("virginia-tech", "Virginia Tech", "ACC"),
  program("wake-forest", "Wake Forest", "ACC"),
  program("army", "Army", "American"),
  program("charlotte", "Charlotte", "American"),
  program("east-carolina", "East Carolina", "American"),
  program("fau", "FAU", "American"),
  program("memphis", "Memphis", "American"),
  program("navy", "Navy", "American"),
  program("north-texas", "North Texas", "American"),
  program("rice", "Rice", "American"),
  program("south-florida", "South Florida", "American"),
  program("temple", "Temple", "American"),
  program("tulane", "Tulane", "American"),
  program("tulsa", "Tulsa", "American"),
  program("uab", "UAB", "American"),
  program("utsa", "UTSA", "American"),
  program("boise-state", "Boise State", "Mountain West"),
  program("colorado-state", "Colorado State", "Mountain West"),
  program("fresno-state", "Fresno State", "Mountain West"),
  program("hawaii", "Hawaii", "Mountain West"),
  program("nevada", "Nevada", "Mountain West"),
  program("new-mexico", "New Mexico", "Mountain West"),
  program("san-diego-state", "San Diego State", "Mountain West"),
  program("san-jose-state", "San Jose State", "Mountain West"),
  program("unlv", "UNLV", "Mountain West"),
  program("wyoming", "Wyoming", "Mountain West"),
  program("appalachian-state", "Appalachian State", "Sun Belt"),
  program("arkansas-state", "Arkansas State", "Sun Belt"),
  program("coastal-carolina", "Coastal Carolina", "Sun Belt"),
  program("georgia-southern", "Georgia Southern", "Sun Belt"),
  program("georgia-state", "Georgia State", "Sun Belt"),
  program("james-madison", "James Madison", "Sun Belt"),
  program("louisiana", "Louisiana", "Sun Belt"),
  program("louisiana-monroe", "Louisiana-Monroe", "Sun Belt"),
  program("marshall", "Marshall", "Sun Belt"),
  program("old-dominion", "Old Dominion", "Sun Belt"),
  program("south-alabama", "South Alabama", "Sun Belt"),
  program("southern-miss", "Southern Miss", "Sun Belt"),
  program("texas-state", "Texas State", "Sun Belt"),
  program("troy", "Troy", "Sun Belt"),
  program("notre-dame", "Notre Dame", "Independent"),
];
const footballCollegePlayerSubjects: readonly FootballCanonicalSubject[] = [
  collegePlayer("cfb-joe-burrow", "Joe Burrow", "QB", "LSU", 2010, true),
  collegePlayer("cfb-lamar-jackson", "Lamar Jackson", "QB", "Louisville", 2010, true),
  collegePlayer("cfb-baker-mayfield", "Baker Mayfield", "QB", "Oklahoma", 2010, true),
  collegePlayer("cfb-kyler-murray", "Kyler Murray", "QB", "Oklahoma", 2010, true),
  collegePlayer("cfb-marcus-mariota", "Marcus Mariota", "QB", "Oregon", 2010, true),
  collegePlayer("cfb-jameis-winston", "Jameis Winston", "QB", "Florida State", 2010, true),
  collegePlayer("cfb-johnny-manziel", "Johnny Manziel", "QB", "Texas A&M", 2010, true),
  collegePlayer("cfb-robert-griffin-iii", "Robert Griffin III", "QB", "Baylor", 2010, true),
  collegePlayer("cfb-cam-newton", "Cam Newton", "QB", "Auburn", 2010, true),
  collegePlayer("cfb-mark-ingram-ii", "Mark Ingram II", "RB", "Alabama", 2000, true),
  collegePlayer("cfb-tim-tebow", "Tim Tebow", "QB", "Florida", 2000, true),
  collegePlayer("cfb-troy-smith", "Troy Smith", "QB", "Ohio State", 2000, true),
  collegePlayer("cfb-reggie-bush", "Reggie Bush", "RB", "USC", 2000, true),
  collegePlayer("cfb-matt-leinart", "Matt Leinart", "QB", "USC", 2000, true),
  collegePlayer("cfb-jason-white", "Jason White", "QB", "Oklahoma", 2000, true),
  collegePlayer("cfb-carson-palmer", "Carson Palmer", "QB", "USC", 2000, true),
  collegePlayer("cfb-eric-crouch", "Eric Crouch", "QB", "Nebraska", 2000, true),
  collegePlayer("cfb-chris-weinke", "Chris Weinke", "QB", "Florida State", 2000, true),
  collegePlayer("cfb-derrick-henry", "Derrick Henry", "RB", "Alabama", 2010, true),
  collegePlayer("cfb-devonta-smith", "DeVonta Smith", "WR", "Alabama", 2020, true),
  collegePlayer("cfb-bryce-young", "Bryce Young", "QB", "Alabama", 2020, true),
  collegePlayer("cfb-caleb-williams", "Caleb Williams", "QB", "USC", 2020, true),
  collegePlayer("cfb-jayden-daniels", "Jayden Daniels", "QB", "LSU", 2020, true),
  collegePlayer("cfb-travis-hunter", "Travis Hunter", "DB", "Colorado", 2020, true),
  collegePlayer("cfb-charles-woodson", "Charles Woodson", "DB", "Michigan", 1990, true),
  collegePlayer("cfb-eddie-george", "Eddie George", "RB", "Ohio State", 1990, true),
  collegePlayer("cfb-danny-wuerffel", "Danny Wuerffel", "QB", "Florida", 1990, true),
  collegePlayer("cfb-ricky-williams", "Ricky Williams", "RB", "Texas", 1990, true),
  collegePlayer("cfb-ron-dayne", "Ron Dayne", "RB", "Wisconsin", 1990, true),
  collegePlayer("cfb-desmond-howard", "Desmond Howard", "WR", "Michigan", 1990, true),
  collegePlayer("cfb-gino-torretta", "Gino Torretta", "QB", "Miami", 1990, true),
  collegePlayer("cfb-rashaan-salaam", "Rashaan Salaam", "RB", "Colorado", 1990, true),
  collegePlayer("cfb-ty-detmer", "Ty Detmer", "QB", "BYU", 1990, true),
  collegePlayer("cfb-barry-sanders", "Barry Sanders", "RB", "Oklahoma State", 1980, true),
  collegePlayer("cfb-bo-jackson", "Bo Jackson", "RB", "Auburn", 1980, true),
  collegePlayer("cfb-doug-flutie", "Doug Flutie", "QB", "Boston College", 1980, true),
  collegePlayer("cfb-herschel-walker", "Herschel Walker", "RB", "Georgia", 1980, true),
  collegePlayer("cfb-marcus-allen", "Marcus Allen", "RB", "USC", 1980, true),
  collegePlayer("cfb-archie-griffin", "Archie Griffin", "RB", "Ohio State", 1970, true),
  collegePlayer("cfb-tony-dorsett", "Tony Dorsett", "RB", "Pittsburgh", 1970, true),
  collegePlayer("cfb-earl-campbell", "Earl Campbell", "RB", "Texas", 1970, true),
  collegePlayer("cfb-jim-plunkett", "Jim Plunkett", "QB", "Stanford", 1970, true),
  collegePlayer("cfb-o-j-simpson", "O. J. Simpson", "RB", "USC", 1960, true),
  collegePlayer("cfb-roger-staubach", "Roger Staubach", "QB", "Navy", 1960, true),
  collegePlayer("cfb-ernie-davis", "Ernie Davis", "RB", "Syracuse", 1960, true),
  collegePlayer("cfb-vince-young", "Vince Young", "QB", "Texas", 2000, false),
  collegePlayer("cfb-adrian-peterson", "Adrian Peterson", "RB", "Oklahoma", 2000, false),
  collegePlayer("cfb-larry-fitzgerald", "Larry Fitzgerald", "WR", "Pittsburgh", 2000, false),
  collegePlayer("cfb-calvin-johnson", "Calvin Johnson", "WR", "Georgia Tech", 2000, false),
  collegePlayer("cfb-darren-mcfadden", "Darren McFadden", "RB", "Arkansas", 2000, false),
  collegePlayer("cfb-colt-mccoy", "Colt McCoy", "QB", "Texas", 2000, false),
  collegePlayer("cfb-nndamukong-suh", "Ndamukong Suh", "DL", "Nebraska", 2000, false),
  collegePlayer("cfb-michael-crabtree", "Michael Crabtree", "WR", "Texas Tech", 2000, false),
  collegePlayer("cfb-patrick-peterson", "Patrick Peterson", "DB", "LSU", 2000, false),
  collegePlayer("cfb-brady-quinn", "Brady Quinn", "QB", "Notre Dame", 2000, false),
  collegePlayer("cfb-deshaun-watson", "Deshaun Watson", "QB", "Clemson", 2010, false),
  collegePlayer("cfb-christian-mccaffrey", "Christian McCaffrey", "RB", "Stanford", 2010, false),
  collegePlayer("cfb-saquon-barkley", "Saquon Barkley", "RB", "Penn State", 2010, false),
  collegePlayer("cfb-tua-tagovailoa", "Tua Tagovailoa", "QB", "Alabama", 2010, false),
  collegePlayer("cfb-trevor-lawrence", "Trevor Lawrence", "QB", "Clemson", 2010, false),
  collegePlayer("cfb-justin-fields", "Justin Fields", "QB", "Ohio State", 2010, false),
  collegePlayer("cfb-derrick-brown", "Derrick Brown", "DL", "Auburn", 2010, false),
  collegePlayer("cfb-minkah-fitzpatrick", "Minkah Fitzpatrick", "DB", "Alabama", 2010, false),
  collegePlayer("cfb-joey-bosa", "Joey Bosa", "DL", "Ohio State", 2010, false),
  collegePlayer("cfb-ezekiel-elliott", "Ezekiel Elliott", "RB", "Ohio State", 2010, false),
  collegePlayer("cfb-amari-cooper", "Amari Cooper", "WR", "Alabama", 2010, false),
  collegePlayer("cfb-keenan-reynolds", "Keenan Reynolds", "QB", "Navy", 2010, false),
  collegePlayer("cfb-shedeur-sanders", "Shedeur Sanders", "QB", "Colorado", 2020, false),
  collegePlayer("cfb-ashton-jeanty", "Ashton Jeanty", "RB", "Boise State", 2020, false),
  collegePlayer("cfb-quinn-ewers", "Quinn Ewers", "QB", "Texas", 2020, false),
  collegePlayer("cfb-michael-penix-jr", "Michael Penix Jr.", "QB", "Washington", 2020, false),
  collegePlayer("cfb-bo-nix", "Bo Nix", "QB", "Oregon", 2020, false),
  collegePlayer("cfb-marvin-harrison-jr", "Marvin Harrison Jr.", "WR", "Ohio State", 2020, false),
  collegePlayer("cfb-brock-bowers", "Brock Bowers", "TE", "Georgia", 2020, false),
  collegePlayer("cfb-bijan-robinson", "Bijan Robinson", "RB", "Texas", 2020, false),
  collegePlayer("cfb-will-anderson-jr", "Will Anderson Jr.", "DL", "Alabama", 2020, false),
  collegePlayer("cfb-sauce-gardner", "Sauce Gardner", "DB", "Cincinnati", 2020, false),
  collegePlayer("cfb-braelon-allen", "Braelon Allen", "RB", "Wisconsin", 2020, false),
  collegePlayer("cfb-kyle-hamilton", "Kyle Hamilton", "DB", "Notre Dame", 2020, false),
];
const footballNflExpansionSubjects: readonly FootballCanonicalSubject[] = [
  nflPlayer("nfl-patrick-mahomes", "Patrick Mahomes", "QB", "Texas Tech", ["Kansas City Chiefs"], 2017, 1, 10, [2010,2020]),
  nflPlayer("nfl-josh-allen", "Josh Allen", "QB", "Wyoming", ["Buffalo Bills"], 2018, 1, 7, [2010,2020]),
  nflPlayer("nfl-lamar-jackson", "Lamar Jackson", "QB", "Louisville", ["Baltimore Ravens"], 2018, 1, 32, [2010,2020]),
  nflPlayer("nfl-joe-burrow", "Joe Burrow", "QB", "LSU", ["Cincinnati Bengals"], 2020, 1, 1, [2020]),
  nflPlayer("nfl-jalen-hurts", "Jalen Hurts", "QB", "Oklahoma", ["Philadelphia Eagles"], 2020, 2, 53, [2020]),
  nflPlayer("nfl-aaron-rodgers", "Aaron Rodgers", "QB", "California", ["Green Bay Packers", "New York Jets"], 2005, 1, 24, [2000,2010,2020]),
  nflPlayer("nfl-matthew-stafford", "Matthew Stafford", "QB", "Georgia", ["Detroit Lions", "Los Angeles Rams"], 2009, 1, 1, [2000,2010,2020]),
  nflPlayer("nfl-philip-rivers", "Philip Rivers", "QB", "NC State", ["San Diego Chargers", "Los Angeles Chargers", "Indianapolis Colts"], 2004, 1, 4, [2000,2010,2020]),
  nflPlayer("nfl-calvin-johnson", "Calvin Johnson", "WR", "Georgia Tech", ["Detroit Lions"], 2007, 1, 2, [2000,2010]),
  nflPlayer("nfl-larry-fitzgerald", "Larry Fitzgerald", "WR", "Pittsburgh", ["Arizona Cardinals"], 2004, 1, 3, [2000,2010,2020]),
  nflPlayer("nfl-julio-jones", "Julio Jones", "WR", "Alabama", ["Atlanta Falcons", "Tennessee Titans", "Tampa Bay Buccaneers", "Philadelphia Eagles"], 2011, 1, 6, [2010,2020]),
  nflPlayer("nfl-randy-moss", "Randy Moss", "WR", "Marshall", ["Minnesota Vikings", "Oakland Raiders", "New England Patriots", "Tennessee Titans", "San Francisco 49ers"], 1998, 1, 21, [1990,2000,2010]),
  nflPlayer("nfl-jerry-rice", "Jerry Rice", "WR", "Mississippi Valley State", ["San Francisco 49ers", "Oakland Raiders", "Seattle Seahawks"], 1985, 1, 16, [1980,1990,2000]),
  nflPlayer("nfl-tony-gonzalez", "Tony Gonzalez", "TE", "California", ["Kansas City Chiefs", "Atlanta Falcons"], 1997, 1, 13, [1990,2000,2010]),
  nflPlayer("nfl-rob-gronkowski", "Rob Gronkowski", "TE", "Arizona", ["New England Patriots", "Tampa Bay Buccaneers"], 2010, 2, 42, [2010,2020]),
  nflPlayer("nfl-travis-kelce", "Travis Kelce", "TE", "Cincinnati", ["Kansas City Chiefs"], 2013, 3, 63, [2010,2020]),
  nflPlayer("nfl-j-j-watt", "J. J. Watt", "DL", "Wisconsin", ["Houston Texans", "Arizona Cardinals"], 2011, 1, 11, [2010,2020]),
  nflPlayer("nfl-aaron-donald", "Aaron Donald", "DL", "Pittsburgh", ["St. Louis Rams", "Los Angeles Rams"], 2014, 1, 13, [2010,2020]),
  nflPlayer("nfl-ray-lewis", "Ray Lewis", "LB", "Miami", ["Baltimore Ravens"], 1996, 1, 26, [1990,2000,2010]),
  nflPlayer("nfl-brian-urlacher", "Brian Urlacher", "LB", "New Mexico", ["Chicago Bears"], 2000, 1, 9, [2000,2010]),
  nflPlayer("nfl-ed-reed", "Ed Reed", "DB", "Miami", ["Baltimore Ravens", "Houston Texans", "New York Jets"], 2002, 1, 24, [2000,2010]),
  nflPlayer("nfl-troy-polamalu", "Troy Polamalu", "DB", "USC", ["Pittsburgh Steelers"], 2003, 1, 16, [2000,2010]),
  nflPlayer("nfl-darrelle-revis", "Darrelle Revis", "DB", "Pittsburgh", ["New York Jets", "Tampa Bay Buccaneers", "New England Patriots", "Kansas City Chiefs"], 2007, 1, 14, [2000,2010]),
  nflPlayer("nfl-peyton-manning", "Peyton Manning", "QB", "Tennessee", ["Indianapolis Colts", "Denver Broncos"], 1998, 1, 1, [1990,2000,2010]),
  nflPlayer("nfl-eli-manning", "Eli Manning", "QB", "Ole Miss", ["New York Giants"], 2004, 1, 1, [2000,2010]),
  nflPlayer("nfl-adrian-peterson", "Adrian Peterson", "RB", "Oklahoma", ["Minnesota Vikings", "New Orleans Saints", "Arizona Cardinals", "Washington", "Detroit Lions", "Tennessee Titans", "Seattle Seahawks"], 2007, 1, 7, [2000,2010,2020]),
  nflPlayer("nfl-marshawn-lynch", "Marshawn Lynch", "RB", "California", ["Buffalo Bills", "Seattle Seahawks", "Oakland Raiders"], 2007, 1, 12, [2000,2010,2020]),
  nflPlayer("nfl-christian-mccaffrey", "Christian McCaffrey", "RB", "Stanford", ["Carolina Panthers", "San Francisco 49ers"], 2017, 1, 8, [2010,2020]),
  nflPlayer("nfl-saquon-barkley", "Saquon Barkley", "RB", "Penn State", ["New York Giants", "Philadelphia Eagles"], 2018, 1, 2, [2010,2020]),
  nflPlayer("nfl-derrick-henry", "Derrick Henry", "RB", "Alabama", ["Tennessee Titans", "Baltimore Ravens"], 2016, 2, 45, [2010,2020]),
];

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

const findLeaderCanonicalSubjects: readonly FootballCanonicalSubject[] = footballFindLeaderSubjects.map((subject) => {
  const seasonMatch = /^(\d{4})-/.exec(subject.id);
  if (subject.domainId === "cfb-champion-season") {
    const season = seasonMatch ? Number(seasonMatch[1]) : undefined;
    return { id: subject.id, name: subject.name, kind: "team-season", league: "CFB", season,
      activeDecades: season == null ? undefined : [Math.floor(season / 10) * 10], nationalChampion: true };
  }
  return { id: subject.id, name: subject.name, kind: "player-career", league: "NFL",
    position: subject.domainId === "nfl-qb-career" ? "QB" : "RB" };
});

function mergeCanonicalSubjects(subjects: readonly FootballCanonicalSubject[]) {
  const byName = new Map<string, FootballCanonicalSubject>();
  for (const subject of subjects) {
    const key = subject.kind === "player-career" ? subject.name.toLowerCase().replace(/[^a-z0-9]/g, "") : subject.id;
    const current = byName.get(key);
    if (!current) {
      byName.set(key, { ...subject, leagues: subject.leagues ?? [subject.league] });
      continue;
    }
    const aliases = new Set([...(current.aliases ?? []), ...(subject.aliases ?? [])]);
    if (subject.id !== current.id) aliases.add(subject.id);
    const activeDecades = [...new Set([...(current.activeDecades ?? []), ...(subject.activeDecades ?? [])])];
    const leagues = [...new Set([...(current.leagues ?? [current.league]), ...(subject.leagues ?? [subject.league])])];
    byName.set(key, {
      ...current,
      ...subject,
      id: current.id,
      name: current.name,
      league: current.league,
      leagues,
      ...(aliases.size === 0 ? {} : { aliases: [...aliases] }),
      ...(activeDecades.length === 0 ? {} : { activeDecades }),
    });
  }
  return [...byName.values()];
}

/** The single canonical identity and reusable metadata ledger for Football. */
export const footballCanonicalSubjects: readonly FootballCanonicalSubject[] = mergeCanonicalSubjects([
  ...findLeaderCanonicalSubjects,
  ...footballProgramSubjects,
  ...footballCollegePlayerSubjects,
  ...footballNflExpansionSubjects,
  ...footballComparisonCanonicalSubjects,
]);

export const FOOTBALL_FIND_LEADER_SUBJECT_COUNT = footballFindLeaderSubjects.length;
export const FOOTBALL_FIND_LEADER_DOMAIN_POOL_SIZE = 25;

export function footballFindLeaderLeagueForDomain(domainId: FootballFindLeaderDomainId): FootballFindLeaderLeagueId {
  return domainId.startsWith("cfb-") ? "cfb" : "nfl";
}
