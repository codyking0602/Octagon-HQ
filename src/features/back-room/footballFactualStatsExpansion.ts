import type {
  FootballFactMetricId,
  FootballFactSource,
  FootballFactSourceId,
  FootballFactValue,
  FootballFactualRecord,
} from "./footballFactualStatsCore";

const evidence = (sourceId: FootballFactSourceId) => ({ sourceIds: [sourceId] as const, kind: "reported" as const });
const fact = (sourceId: FootballFactSourceId, metricId: FootballFactMetricId, value: number): FootballFactValue => ({
  metricId,
  value,
  evidence: evidence(sourceId),
});
const record = (
  subjectId: string,
  scope: FootballFactualRecord["scope"],
  sourceId: FootballFactSourceId,
  values: readonly (readonly [FootballFactMetricId, number])[],
): FootballFactualRecord => ({
  subjectId,
  scope,
  facts: values.map(([metricId, value]) => fact(sourceId, metricId, value)),
});

export const expandedFootballFactSources: readonly FootballFactSource[] = [
  {
    id: "pfr-receiving-career",
    publisher: "Pro Football Reference",
    title: "NFL receiving career records",
    url: "https://www.pro-football-reference.com/leaders/rec_yds_career.htm",
    reviewedOn: "2026-08-25",
    coverage: "Completed NFL receiver and tight-end career production used by the canonical Football factual ledger",
  },
  {
    id: "pfr-specialist-career",
    publisher: "Pro Football Reference",
    title: "NFL kicker and punter career records",
    url: "https://www.pro-football-reference.com/players/",
    reviewedOn: "2026-08-25",
    coverage: "Completed NFL kicker and punter career production used by the canonical Football factual ledger",
  },
  {
    id: "pfr-defensive-career",
    publisher: "Pro Football Reference",
    title: "NFL defensive career records",
    url: "https://www.pro-football-reference.com/leaders/sacks_career.htm",
    reviewedOn: "2026-08-25",
    coverage: "Completed NFL defensive careers, including sacks, interceptions and major award counts",
  },
  {
    id: "pfr-player-season-stat-lines",
    publisher: "Pro Football Reference",
    title: "NFL player season stat lines",
    url: "https://www.pro-football-reference.com/years/",
    reviewedOn: "2026-08-25",
    coverage: "Completed notable NFL quarterback seasons with passing production and efficiency",
  },
  {
    id: "pfr-team-season-records",
    publisher: "Pro Football Reference",
    title: "NFL team season records",
    url: "https://www.pro-football-reference.com/years/",
    reviewedOn: "2026-08-25",
    coverage: "Completed notable NFL team seasons across championship, contender and losing-team outcomes",
  },
  {
    id: "cfr-player-stat-lines",
    publisher: "College Football at Sports-Reference",
    title: "College player stat lines",
    url: "https://www.sports-reference.com/cfb/players/",
    reviewedOn: "2026-08-25",
    coverage: "Completed college player seasons across quarterback, running back, receiver, tight end and defensive roles",
  },
  {
    id: "cfr-coach-records",
    publisher: "College Football at Sports-Reference",
    title: "College head-coach records",
    url: "https://www.sports-reference.com/cfb/coaches/",
    reviewedOn: "2026-08-25",
    coverage: "Completed college head-coaching records, championships and conference-title counts",
  },
  {
    id: "cfr-program-records",
    publisher: "College Football at Sports-Reference",
    title: "College program historical records",
    url: "https://www.sports-reference.com/cfb/schools/",
    reviewedOn: "2026-08-25",
    coverage: "Program-level results from 2000 through the completed 2025 season and explicit multi-season program eras",
  },
  {
    id: "cfr-team-season-records",
    publisher: "College Football at Sports-Reference",
    title: "College team season records",
    url: "https://www.sports-reference.com/cfb/schools/",
    reviewedOn: "2026-08-25",
    coverage: "Completed college team seasons beyond the national-champion-only compatibility pool",
  },
] as const;

const wr = (
  subjectId: string,
  receptions: number,
  yards: number,
  touchdowns: number,
) => record(subjectId, "nfl-player-career", "pfr-receiving-career", [
  ["nfl-career-receptions", receptions],
  ["nfl-career-receiving-yards", yards],
  ["nfl-career-receiving-touchdowns", touchdowns],
]);

const kicker = (subjectId: string, made: number, attempted: number, percentage: number) =>
  record(subjectId, "nfl-player-career", "pfr-specialist-career", [
    ["nfl-career-field-goals-made", made],
    ["nfl-career-field-goals-attempted", attempted],
    ["nfl-career-field-goal-percentage", percentage],
  ]);

const punter = (subjectId: string, punts: number, yards: number, average: number) =>
  record(subjectId, "nfl-player-career", "pfr-specialist-career", [
    ["nfl-career-punts", punts],
    ["nfl-career-punting-yards", yards],
    ["nfl-career-punting-average", average],
  ]);

const defender = (
  subjectId: string,
  values: readonly (readonly [FootballFactMetricId, number])[],
) => record(subjectId, "nfl-player-career", "pfr-defensive-career", values);

const qbSeason = (
  subjectId: string,
  passingYards: number,
  passingTouchdowns: number,
  interceptions: number,
  passerRating?: number,
) => record(subjectId, "nfl-player-season", "pfr-player-season-stat-lines", [
  ["nfl-season-passing-yards", passingYards],
  ["nfl-season-passing-touchdowns", passingTouchdowns],
  ["nfl-season-interceptions", interceptions],
  ...(passerRating == null ? [] : [["nfl-season-passer-rating", passerRating] as const]),
]);

const nflTeam = (subjectId: string, wins: number, losses: number, champion: boolean, pointsPerGame?: number, opponentPointsPerGame?: number) =>
  record(subjectId, "nfl-team-season", "pfr-team-season-records", [
    ["nfl-team-overall-wins", wins],
    ["nfl-team-overall-losses", losses],
    ["nfl-super-bowl-title", champion ? 1 : 0],
    ...(pointsPerGame == null ? [] : [["nfl-team-points-per-game", pointsPerGame] as const]),
    ...(opponentPointsPerGame == null ? [] : [["nfl-team-opponent-points-per-game", opponentPointsPerGame] as const]),
  ]);

const cfbPlayer = (subjectId: string, values: readonly (readonly [FootballFactMetricId, number])[]) =>
  record(subjectId, "cfb-player-career", "cfr-player-stat-lines", values);

const cfbCoach = (subjectId: string, values: readonly (readonly [FootballFactMetricId, number])[]) =>
  record(subjectId, "cfb-coach-career", "cfr-coach-records", values);

const cfbProgram = (subjectId: string, values: readonly (readonly [FootballFactMetricId, number])[]) =>
  record(subjectId, "cfb-program", "cfr-program-records", values);

const cfbEra = (subjectId: string, values: readonly (readonly [FootballFactMetricId, number])[]) =>
  record(subjectId, "cfb-program-era", "cfr-program-records", values);

const cfbTeam = (subjectId: string, wins: number, losses: number, nationalChampion: boolean) =>
  record(subjectId, "cfb-team-season", "cfr-team-season-records", [
    ["cfb-team-wins", wins],
    ["cfb-team-losses", losses],
    ["cfb-national-title", nationalChampion ? 1 : 0],
  ]);

export const expandedFootballFactualRecords: readonly FootballFactualRecord[] = [
  // NFL specialists: reviewed career kicking and punting facts.
  kicker("nfl-jan-stenerud", 373, 558, 66.8),
  kicker("nfl-mark-moseley", 300, 457, 65.6),
  punter("nfl-ray-guy", 1049, 44493, 42.4),
  punter("nfl-pat-mcafee", 575, 26653, 46.4),
  // NFL receivers and tight ends: real career counting stats, not comparison ratings.
  wr("nfl-john-mackey", 331, 5236, 38),
  wr("nfl-charlie-sanders", 336, 4817, 31),
  wr("nfl-dave-casper", 378, 5216, 52),
  wr("nfl-jackie-smith", 480, 7918, 40),
  wr("mike-ditka", 427, 5812, 43),
  wr("nfl-don-hutson", 488, 7991, 99),
  wr("nfl-raymond-berry", 631, 9275, 68),
  wr("nfl-art-monk", 940, 12721, 68),
  wr("nfl-bob-hayes", 371, 7414, 71),
  wr("nfl-charley-taylor", 649, 9110, 79),
  wr("nfl-charlie-joiner", 750, 12146, 65),
  wr("nfl-cliff-branch", 501, 8685, 67),
  wr("nfl-don-maynard", 633, 11834, 88),
  wr("nfl-drew-pearson", 489, 7822, 48),
  wr("nfl-fred-biletnikoff", 589, 8974, 76),
  wr("nfl-harold-carmichael", 590, 8985, 79),
wr("nfl-james-lofton", 764, 14004, 75),
wr("nfl-john-stallworth", 537, 8723, 63),
wr("nfl-lance-alworth", 542, 10266, 85),
wr("nfl-lynn-swann", 336, 5462, 51),
wr("nfl-paul-warfield", 427, 8565, 85),
wr("nfl-sterling-sharpe", 595, 8134, 65),
wr("nfl-steve-largent", 819, 13089, 100),
  wr("nfl-jerry-rice", 1549, 22895, 197),
  wr("nfl-randy-moss", 982, 15292, 156),
  wr("nfl-calvin-johnson", 731, 11619, 83),
  wr("nfl-larry-fitzgerald", 1432, 17492, 121),
  wr("nfl-julio-jones", 914, 13703, 66),
  wr("nfl-tony-gonzalez", 1325, 15127, 111),
  wr("nfl-rob-gronkowski", 621, 9286, 92),
  wr("nfl-travis-kelce", 1004, 12329, 80),
  wr("nfl-antonio-gates", 955, 11841, 116),
  wr("nfl-shannon-sharpe", 815, 10060, 62),
  wr("nfl-jason-witten", 1228, 13046, 74),
  wr("nfl-kellen-winslow-sr", 541, 6741, 45),
  wr("nfl-ozzie-newsome", 662, 7980, 47),
  wr("nfl-george-kittle", 538, 7380, 45),
  wr("nfl-greg-olsen", 742, 8683, 60),
  wr("nfl-jimmy-graham", 719, 8545, 89),
  wr("nfl-mark-andrews", 440, 5448, 51),
  wr("nfl-vernon-davis", 583, 7562, 63),
  wr("nfl-zach-ertz", 775, 8088, 48),
  wr("nfl-eric-ebron", 351, 4767, 36),
  wr("nfl-oj-howard", 129, 2011, 17),
  // NFL defenders: real career production and awards.
  defender("nfl-lawrence-taylor", [["nfl-career-sacks", 142], ["nfl-defensive-player-of-year-awards", 3]]),
  defender("nfl-reggie-white", [["nfl-career-sacks", 198], ["nfl-defensive-player-of-year-awards", 2]]),
  defender("nfl-aaron-donald", [["nfl-career-sacks", 111], ["nfl-defensive-player-of-year-awards", 3]]),
  defender("nfl-ray-lewis", [["nfl-career-tackles", 1568], ["nfl-career-interceptions", 31], ["nfl-defensive-player-of-year-awards", 2]]),
  defender("nfl-jj-watt", [["nfl-career-sacks", 114.5], ["nfl-defensive-player-of-year-awards", 3]]),
  defender("nfl-deion-sanders", [["nfl-career-interceptions", 53], ["nfl-defensive-player-of-year-awards", 1]]),
  defender("nfl-ed-reed", [["nfl-career-interceptions", 64], ["nfl-defensive-player-of-year-awards", 1]]),
  defender("nfl-bruce-smith", [["nfl-career-sacks", 200], ["nfl-defensive-player-of-year-awards", 2]]),
  defender("nfl-myles-garrett", [["nfl-career-sacks", 125.5], ["nfl-defensive-player-of-year-awards", 2]]),
  defender("nfl-ronnie-lott", [["nfl-career-interceptions", 63]]),
  defender("nfl-joe-greene", [["nfl-defensive-player-of-year-awards", 2]]),
  defender("nfl-dick-butkus", [["nfl-career-interceptions", 22]]),
  defender("nfl-tj-watt", [["nfl-career-sacks", 121.5], ["nfl-defensive-player-of-year-awards", 1]]),
  defender("nfl-rod-woodson", [["nfl-career-interceptions", 71], ["nfl-defensive-player-of-year-awards", 1]]),
  defender("nfl-derrick-brooks", [["nfl-career-tackles", 1715], ["nfl-career-interceptions", 25], ["nfl-defensive-player-of-year-awards", 1]]),
  defender("nfl-junior-seau", [["nfl-career-tackles", 1849]]),
  defender("nfl-champ-bailey", [["nfl-career-interceptions", 52]]),
  defender("nfl-brian-dawkins", [["nfl-career-interceptions", 37]]),
  defender("nfl-troy-polamalu", [["nfl-career-interceptions", 32], ["nfl-defensive-player-of-year-awards", 1]]),
  defender("nfl-darrelle-revis", [["nfl-career-interceptions", 29]]),
  defender("nfl-michael-strahan", [["nfl-career-sacks", 141.5], ["nfl-defensive-player-of-year-awards", 1]]),
  defender("nfl-terrell-suggs", [["nfl-career-sacks", 139], ["nfl-defensive-player-of-year-awards", 1]]),
  defender("nfl-von-miller", [["nfl-career-sacks", 137.5]]),
  defender("nfl-patrick-willis", [["nfl-career-tackles", 950]]),
  defender("nfl-luke-kuechly", [["nfl-career-tackles", 1092], ["nfl-career-interceptions", 18], ["nfl-defensive-player-of-year-awards", 1]]),
  defender("nfl-richard-sherman", [["nfl-career-interceptions", 37]]),
  defender("nfl-ndamukong-suh", [["nfl-career-sacks", 71.5]]),
  defender("nfl-clay-matthews", [["nfl-career-sacks", 91.5]]),
  defender("nfl-jadeveon-clowney", [["nfl-career-sacks", 58]]),
  defender("nfl-morris-claiborne", [["nfl-career-interceptions", 7]]),
  defender("nfl-dion-jordan", [["nfl-career-sacks", 13.5]]),
  defender("nfl-vernon-gholston", [["nfl-career-sacks", 0]]),
  // NFL player seasons: real season stat lines.
  qbSeason("nfl-tom-brady-2007", 4806, 50, 8, 117.2),
  qbSeason("nfl-peyton-manning-2013", 5477, 55, 10, 115.1),
  qbSeason("nfl-dan-marino-1984", 5084, 48, 17, 108.9),
  qbSeason("nfl-aaron-rodgers-2011", 4643, 45, 6, 122.5),
  qbSeason("nfl-patrick-mahomes-2022", 5250, 41, 12, 105.2),
  qbSeason("nfl-steve-young-1994", 3969, 35, 10, 112.8),
  qbSeason("nfl-peyton-manning-2004", 4557, 49, 10, 121.1),
  qbSeason("nfl-lamar-jackson-2019", 3127, 36, 6, 113.3),
  qbSeason("nfl-cam-newton-2015", 3837, 35, 10, 99.4),
  qbSeason("nfl-kurt-warner-1999", 4353, 41, 13, 109.2),
  qbSeason("nfl-matthew-stafford-2025", 4707, 46, 8, 109.2),
  qbSeason("nfl-matt-ryan-2016", 4944, 38, 7, 117.1),
  qbSeason("nfl-drew-brees-2011", 5476, 46, 14, 110.6),
  qbSeason("nfl-tom-brady-2010", 3900, 36, 4, 111.0),
  qbSeason("nfl-aaron-rodgers-2020", 4299, 48, 5, 121.5),
  qbSeason("nfl-tom-brady-2009", 4398, 28, 13, 96.2),
  qbSeason("nfl-cj-stroud-2023", 4108, 23, 5, 100.8),
  qbSeason("nfl-brock-purdy-2022", 1374, 13, 4, 107.3),
  qbSeason("nfl-josh-allen-2024", 3731, 28, 6, 101.4),
  qbSeason("nfl-sam-darnold-2024", 4319, 35, 12, 102.5),
  qbSeason("nfl-baker-mayfield-2020", 3563, 26, 8, 95.9),
  qbSeason("nfl-aaron-rodgers-2018", 4442, 25, 2, 97.6),
  qbSeason("nfl-daniel-jones-2022", 3205, 15, 5, 92.5),
  qbSeason("nfl-carson-wentz-2020", 2620, 16, 15, 72.8),
  qbSeason("nfl-zach-wilson-2023", 2271, 8, 7, 77.2),
  qbSeason("nfl-jamarcus-russell-2009", 1287, 3, 11, 50.0),
  // NFL team seasons: overall records and championship outcome.
  nflTeam("nfl-2007-patriots", 18, 1, false, 36.8, 17.1),
  nflTeam("nfl-1985-bears", 18, 1, true, 28.5, 12.4),
  nflTeam("nfl-1972-dolphins", 17, 0, true, 27.5, 12.2),
  nflTeam("nfl-1991-washington", 17, 2, true, 30.3, 14.0),
  nflTeam("nfl-2013-seahawks", 16, 3, true, 26.1, 14.4),
  nflTeam("nfl-1984-49ers", 18, 1, true, 29.7, 14.2),
  nflTeam("nfl-2020-buccaneers", 15, 5, true, 30.8, 22.2),
  nflTeam("nfl-2000-ravens", 16, 4, true, 20.8, 10.3),
  nflTeam("nfl-1999-rams", 16, 3, true, 32.9, 15.1),
  nflTeam("nfl-2015-panthers", 17, 2, false, 31.3, 19.3),
  nflTeam("nfl-2022-eagles", 16, 4, false, 28.1, 20.2),
  nflTeam("nfl-2016-browns", 1, 15, false),
  nflTeam("nfl-2008-lions", 0, 16, false),
  nflTeam("nfl-2017-browns", 0, 16, false),
  nflTeam("nfl-2020-jets", 2, 14, false),
  nflTeam("nfl-2023-panthers", 2, 15, false),
  // CFB player careers: real college production.
  cfbPlayer("cfb-tim-tebow", [["cfb-career-passing-yards", 9285], ["cfb-career-passing-touchdowns", 88], ["cfb-career-interceptions", 16], ["cfb-career-rushing-yards", 2947], ["cfb-career-rushing-touchdowns", 57]]),
  cfbPlayer("cfb-vince-young", [["cfb-career-passing-yards", 6040], ["cfb-career-passing-touchdowns", 44], ["cfb-career-interceptions", 28], ["cfb-career-rushing-yards", 3127], ["cfb-career-rushing-touchdowns", 37]]),
  cfbPlayer("cfb-cam-newton", [["cfb-career-passing-yards", 2908], ["cfb-career-passing-touchdowns", 30], ["cfb-career-interceptions", 7], ["cfb-career-rushing-yards", 1741], ["cfb-career-rushing-touchdowns", 24]]),
  cfbPlayer("cfb-reggie-bush", [["cfb-career-rushing-yards", 3169], ["cfb-career-rushing-touchdowns", 25], ["cfb-career-scrimmage-yards", 4470]]),
  cfbPlayer("cfb-adrian-peterson", [["cfb-career-rushing-yards", 4041], ["cfb-career-rushing-touchdowns", 41]]),
  cfbPlayer("cfb-tim-brown", [["cfb-career-receptions", 137], ["cfb-career-receiving-yards", 2493], ["cfb-career-receiving-touchdowns", 22]]),
  cfbPlayer("cfb-randy-moss", [["cfb-career-receptions", 168], ["cfb-career-receiving-yards", 3467], ["cfb-career-receiving-touchdowns", 53]]),
  cfbPlayer("cfb-larry-fitzgerald", [["cfb-career-receptions", 161], ["cfb-career-receiving-yards", 2677], ["cfb-career-receiving-touchdowns", 34]]),
  cfbPlayer("cfb-aaron-donald", [["cfb-career-sacks", 11], ["cfb-career-tackles-for-loss", 28.5]]),
  cfbPlayer("cfb-jadeveon-clowney", [["cfb-career-sacks", 13], ["cfb-career-tackles-for-loss", 23.5]]),
  cfbPlayer("cfb-manti-teo", [["cfb-career-tackles", 437], ["cfb-career-interceptions", 7]]),
  cfbPlayer("cfb-charles-woodson", [["cfb-career-interceptions", 18]]),
  cfbPlayer("cfb-champ-bailey", [["cfb-career-interceptions", 8]]),
  cfbPlayer("cfb-ed-reed", [["cfb-career-interceptions", 21]]),
  cfbCoach("cfb-nick-saban", [["cfb-coach-wins", 297], ["cfb-coach-losses", 71], ["cfb-coach-national-titles", 7], ["cfb-coach-conference-titles", 11]]),
  cfbCoach("cfb-bobby-bowden", [["cfb-coach-wins", 377], ["cfb-coach-losses", 129], ["cfb-coach-national-titles", 2], ["cfb-coach-conference-titles", 12]]),
  cfbCoach("cfb-bear-bryant", [["cfb-coach-wins", 323], ["cfb-coach-losses", 85], ["cfb-coach-national-titles", 6], ["cfb-coach-conference-titles", 15]]),
  cfbCoach("cfb-woody-hayes", [["cfb-coach-wins", 238], ["cfb-coach-losses", 72], ["cfb-coach-national-titles", 5], ["cfb-coach-conference-titles", 13]]),
  cfbCoach("cfb-tom-osborne", [["cfb-coach-wins", 255], ["cfb-coach-losses", 49], ["cfb-coach-national-titles", 3], ["cfb-coach-conference-titles", 13]]),
  cfbCoach("cfb-barry-switzer", [["cfb-coach-wins", 157], ["cfb-coach-losses", 29], ["cfb-coach-national-titles", 3], ["cfb-coach-conference-titles", 12]]),
  cfbProgram("cfb-program-alabama", [["cfb-program-wins-since-2000", 283], ["cfb-program-losses-since-2000", 66], ["cfb-program-national-titles-since-2000", 6]]),
  cfbProgram("cfb-program-ohio-state", [["cfb-program-wins-since-2000", 284], ["cfb-program-losses-since-2000", 57], ["cfb-program-national-titles-since-2000", 2]]),
  cfbProgram("cfb-program-georgia", [["cfb-program-wins-since-2000", 269], ["cfb-program-losses-since-2000", 84], ["cfb-program-national-titles-since-2000", 2]]),
  cfbProgram("cfb-program-oklahoma", [["cfb-program-wins-since-2000", 260], ["cfb-program-losses-since-2000", 87], ["cfb-program-national-titles-since-2000", 1]]),
  cfbProgram("cfb-program-clemson", [["cfb-program-wins-since-2000", 247], ["cfb-program-losses-since-2000", 101], ["cfb-program-national-titles-since-2000", 2]]),
  cfbProgram("cfb-program-texas", [["cfb-program-wins-since-2000", 247], ["cfb-program-losses-since-2000", 104], ["cfb-program-national-titles-since-2000", 1]]),
  cfbEra("cfb-era-alabama-2008-2023", [["cfb-era-wins", 206], ["cfb-era-losses", 29], ["cfb-era-national-titles", 6], ["cfb-era-conference-titles", 9], ["cfb-era-cfp-appearances", 8], ["cfb-era-title-game-appearances", 6]]),
  cfbEra("cfb-era-georgia-2017-2025", [["cfb-era-wins", 111], ["cfb-era-losses", 20], ["cfb-era-national-titles", 2], ["cfb-era-conference-titles", 3], ["cfb-era-cfp-appearances", 5], ["cfb-era-title-game-appearances", 3]]),
  cfbTeam("2023-florida-state", 13, 1, false),
  cfbTeam("2015-ohio-state", 12, 1, false),
  cfbTeam("2008-utah", 13, 0, false),
  cfbTeam("2017-ucf", 13, 0, false),
  cfbTeam("2012-usc", 7, 6, false),
  cfbTeam("2010-texas", 5, 7, false),
  cfbTeam("2022-texas-am", 5, 7, false),
] as const;
