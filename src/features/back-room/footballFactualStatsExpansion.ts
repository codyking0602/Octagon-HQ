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
  // NFL receivers and tight ends: real career counting stats, not comparison ratings.
  wr("nfl-jerry-rice", 1549, 22895, 197),
  wr("nfl-randy-moss", 982, 15292, 156),
  wr("nfl-calvin-johnson", 731, 11619, 83),
  wr("nfl-larry-fitzgerald", 1432, 17492, 121),
  wr("nfl-julio-jones", 914, 13703, 66),
  wr("nfl-tony-gonzalez", 1325, 15127, 111),
  wr("nfl-rob-gronkowski", 621, 9286, 92),
  wr("antonio-gates", 955, 11841, 116),
  wr("shannon-sharpe", 815, 10060, 62),
  wr("travis-kelce", 1080, 13002, 82),
  wr("george-kittle", 595, 8008, 52),
  wr("jason-witten", 1228, 13046, 74),
  wr("kellen-winslow-sr", 541, 6741, 45),
  wr("ozzie-newsome", 662, 7980, 47),
  wr("greg-olsen", 742, 8683, 60),
  wr("jimmy-graham", 719, 8545, 89),
  wr("vernon-davis", 583, 7562, 63),

  // NFL defenders: use position-appropriate objective production and award counts.
  defender("lawrence-taylor", [
    ["nfl-career-sacks", 132.5],
    ["nfl-defensive-player-of-year-awards", 3],
    ["nfl-first-team-all-pros", 8],
  ]),
  defender("reggie-white", [
    ["nfl-career-sacks", 198],
    ["nfl-defensive-player-of-year-awards", 2],
    ["nfl-first-team-all-pros", 8],
  ]),
  defender("nfl-ray-lewis", [
    ["nfl-career-sacks", 41.5],
    ["nfl-career-interceptions", 31],
    ["nfl-defensive-player-of-year-awards", 2],
    ["nfl-first-team-all-pros", 7],
  ]),
  defender("nfl-j-j-watt", [
    ["nfl-career-sacks", 114.5],
    ["nfl-defensive-player-of-year-awards", 3],
    ["nfl-first-team-all-pros", 5],
  ]),
  defender("nfl-aaron-donald", [
    ["nfl-career-sacks", 111],
    ["nfl-defensive-player-of-year-awards", 3],
    ["nfl-first-team-all-pros", 8],
  ]),
  defender("nfl-ed-reed", [
    ["nfl-career-interceptions", 64],
    ["nfl-defensive-player-of-year-awards", 1],
  ]),
  defender("bruce-smith", [
    ["nfl-career-sacks", 200],
    ["nfl-defensive-player-of-year-awards", 2],
  ]),
  defender("rod-woodson", [
    ["nfl-career-interceptions", 71],
    ["nfl-defensive-player-of-year-awards", 1],
  ]),
  defender("michael-strahan", [
    ["nfl-career-sacks", 141.5],
    ["nfl-defensive-player-of-year-awards", 1],
  ]),
  defender("myles-garrett", [
    ["nfl-career-sacks", 125.5],
    ["nfl-defensive-player-of-year-awards", 2],
  ]),
  defender("tj-watt", [
    ["nfl-career-sacks", 115],
    ["nfl-defensive-player-of-year-awards", 1],
    ["nfl-first-team-all-pros", 4],
  ]),
  defender("terrell-suggs", [
    ["nfl-career-sacks", 139],
    ["nfl-defensive-player-of-year-awards", 1],
    ["nfl-first-team-all-pros", 1],
  ]),
  defender("von-miller", [
    ["nfl-career-sacks", 138.5],
  ]),
  defender("clay-matthews", [
    ["nfl-career-sacks", 91.5],
  ]),
  defender("deion-sanders", [
    ["nfl-career-interceptions", 53],
  ]),
  defender("ronnie-lott", [
    ["nfl-career-interceptions", 63],
    ["nfl-first-team-all-pros", 6],
  ]),
  defender("champ-bailey", [
    ["nfl-career-interceptions", 52],
    ["nfl-first-team-all-pros", 3],
  ]),
  defender("brian-dawkins", [
    ["nfl-career-interceptions", 37],
  ]),
  defender("troy-polamalu", [
    ["nfl-career-interceptions", 32],
    ["nfl-defensive-player-of-year-awards", 1],
    ["nfl-first-team-all-pros", 4],
  ]),
  defender("darrelle-revis", [
    ["nfl-career-interceptions", 29],
  ]),
  defender("richard-sherman", [
    ["nfl-career-interceptions", 37],
    ["nfl-first-team-all-pros", 3],
  ]),
  defender("luke-kuechly", [
    ["nfl-career-interceptions", 18],
    ["nfl-defensive-player-of-year-awards", 1],
  ]),
  defender("derrick-brooks", [
    ["nfl-career-interceptions", 25],
  ]),

  // NFL player seasons retained here are the currently enabled compatibility pool; PR3 owns expansion/rebalance.
  qbSeason("tom-brady-2007", 4806, 50, 8, 117.2),
  qbSeason("peyton-manning-2013", 5477, 55, 10, 115.1),
  qbSeason("dan-marino-1984", 5084, 48, 17, 108.9),
  qbSeason("aaron-rodgers-2011", 4643, 45, 6, 122.5),
  qbSeason("patrick-mahomes-2022", 5250, 41, 12, 105.2),
  qbSeason("steve-young-1994", 3969, 35, 10, 112.8),
  qbSeason("lamar-jackson-2019", 3127, 36, 6, 113.3),
  qbSeason("drew-brees-2011", 5476, 46, 14, 110.6),
  qbSeason("jameis-winston-2019", 5109, 33, 30, 84.3),
  qbSeason("zach-wilson-2022", 1688, 6, 7, 72.8),
  qbSeason("jamarcus-russell-2009", 1287, 3, 11, 50.0),

  // NFL team seasons: championship and failure cases share one objective numerical shape.
  nflTeam("1972-miami-dolphins", 17, 0, true, 27.5, 12.2),
  nflTeam("1985-chicago-bears", 18, 1, true, 28.5, 12.4),
  nflTeam("1989-san-francisco-49ers", 17, 2, true),
  nflTeam("1991-washington", 17, 2, true, 30.3, 14.0),
  nflTeam("2007-new-england-patriots", 18, 1, false),
  nflTeam("1996-green-bay-packers", 16, 3, true, 28.5, 13.1),
  nflTeam("1998-denver-broncos", 17, 2, true),
  nflTeam("1999-st-louis-rams", 16, 3, true),
  nflTeam("2004-new-england-patriots", 17, 2, true),
  nflTeam("2013-seattle-seahawks", 16, 3, true),
  nflTeam("2024-philadelphia-eagles", 18, 3, true),
  nflTeam("2025-seattle-seahawks", 17, 3, true),
  nflTeam("2016-new-england-patriots", 17, 2, true),
  nflTeam("2015-carolina-panthers", 17, 2, false),
  nflTeam("2011-philadelphia-eagles", 8, 8, false),
  nflTeam("2022-denver-broncos", 5, 12, false),
  nflTeam("2020-jacksonville-jaguars", 1, 15, false),
  nflTeam("2017-cleveland-browns", 0, 16, false),

  // CFB player identities own objective best-season facts. Gameplay can only surface canonical CFB subjects,
  // so deeper numerical coverage does not admit obscure database-only players into casual boards.
  cfbPlayer("cfb-cam-newton", [
    ["cfb-best-season-passing-yards", 2854],
    ["cfb-best-season-passing-touchdowns", 30],
    ["cfb-best-season-interceptions", 7],
    ["cfb-best-season-passer-rating", 182.0],
    ["cfb-best-season-rushing-yards", 1473],
    ["cfb-best-season-rushing-touchdowns", 20],
    ["cfb-heisman-awards", 1],
  ]),
  cfbPlayer("cfb-joe-burrow", [
    ["cfb-best-season-passing-yards", 5671],
    ["cfb-best-season-passing-touchdowns", 60],
    ["cfb-best-season-interceptions", 6],
    ["cfb-best-season-passer-rating", 202.0],
    ["cfb-heisman-awards", 1],
  ]),
  cfbPlayer("cfb-vince-young", [
    ["cfb-best-season-passing-yards", 3036],
    ["cfb-best-season-passing-touchdowns", 26],
    ["cfb-best-season-interceptions", 10],
    ["cfb-best-season-passer-rating", 163.9],
    ["cfb-best-season-rushing-yards", 1050],
    ["cfb-best-season-rushing-touchdowns", 12],
    ["cfb-heisman-awards", 0],
  ]),
  cfbPlayer("cfb-tim-tebow", [
    ["cfb-best-season-passing-yards", 3286],
    ["cfb-best-season-passing-touchdowns", 32],
    ["cfb-best-season-interceptions", 6],
    ["cfb-best-season-passer-rating", 172.5],
    ["cfb-best-season-rushing-yards", 895],
    ["cfb-best-season-rushing-touchdowns", 23],
    ["cfb-heisman-awards", 1],
  ]),
  cfbPlayer("cfb-lamar-jackson", [
    ["cfb-best-season-rushing-yards", 1571],
    ["cfb-best-season-rushing-touchdowns", 21],
    ["cfb-heisman-awards", 1],
  ]),
  cfbPlayer("cfb-derrick-henry", [
    ["cfb-best-season-rushing-yards", 2219],
    ["cfb-best-season-rushing-touchdowns", 28],
    ["cfb-heisman-awards", 1],
  ]),
  cfbPlayer("cfb-barry-sanders", [
    ["cfb-best-season-rushing-yards", 2628],
    ["cfb-best-season-rushing-touchdowns", 37],
    ["cfb-heisman-awards", 1],
  ]),
  cfbPlayer("cfb-adrian-peterson", [
    ["cfb-best-season-rushing-yards", 1925],
    ["cfb-best-season-rushing-touchdowns", 15],
    ["cfb-heisman-awards", 0],
  ]),
  cfbPlayer("cfb-bijan-robinson", [
    ["cfb-best-season-rushing-yards", 1580],
    ["cfb-best-season-rushing-touchdowns", 18],
    ["cfb-best-season-receptions", 26],
    ["cfb-best-season-receiving-yards", 314],
    ["cfb-best-season-receiving-touchdowns", 4],
  ]),
  cfbPlayer("cfb-ricky-williams", [
    ["cfb-best-season-rushing-yards", 2124],
    ["cfb-best-season-rushing-touchdowns", 27],
    ["cfb-heisman-awards", 1],
  ]),
  cfbPlayer("cfb-reggie-bush", [
    ["cfb-best-season-rushing-yards", 1740],
    ["cfb-best-season-rushing-touchdowns", 16],
    ["cfb-best-season-receptions", 37],
    ["cfb-best-season-receiving-yards", 478],
    ["cfb-best-season-receiving-touchdowns", 2],
    ["cfb-heisman-awards", 1],
  ]),
  cfbPlayer("cfb-darren-mcfadden", [
    ["cfb-best-season-rushing-yards", 1830],
    ["cfb-best-season-rushing-touchdowns", 16],
    ["cfb-heisman-awards", 0],
  ]),
  cfbPlayer("cfb-mark-ingram-ii", [
    ["cfb-best-season-rushing-yards", 1658],
    ["cfb-best-season-rushing-touchdowns", 17],
    ["cfb-heisman-awards", 1],
  ]),
  cfbPlayer("cfb-ezekiel-elliott", [
    ["cfb-best-season-rushing-yards", 1821],
    ["cfb-best-season-rushing-touchdowns", 23],
  ]),
  cfbPlayer("cfb-keenan-reynolds", [
    ["cfb-best-season-rushing-yards", 1373],
    ["cfb-best-season-rushing-touchdowns", 31],
  ]),
  cfbPlayer("cfb-ashton-jeanty", [
    ["cfb-best-season-rushing-yards", 2601],
    ["cfb-best-season-rushing-touchdowns", 29],
  ]),
  cfbPlayer("cfb-ron-dayne", [
    ["cfb-best-season-rushing-yards", 1863],
    ["cfb-best-season-rushing-touchdowns", 19],
    ["cfb-heisman-awards", 1],
  ]),
  cfbPlayer("cfb-eddie-george", [
    ["cfb-best-season-rushing-yards", 1826],
    ["cfb-best-season-rushing-touchdowns", 23],
    ["cfb-heisman-awards", 1],
  ]),
  cfbPlayer("cfb-rashaan-salaam", [
    ["cfb-best-season-rushing-yards", 2055],
    ["cfb-best-season-rushing-touchdowns", 24],
    ["cfb-heisman-awards", 1],
  ]),
  cfbPlayer("cfb-braelon-allen", [
    ["cfb-best-season-rushing-yards", 1268],
    ["cfb-best-season-rushing-touchdowns", 12],
  ]),
  cfbPlayer("cfb-devonta-smith", [
    ["cfb-best-season-receptions", 117],
    ["cfb-best-season-receiving-yards", 1856],
    ["cfb-best-season-receiving-touchdowns", 23],
    ["cfb-heisman-awards", 1],
  ]),
  cfbPlayer("cfb-larry-fitzgerald", [
    ["cfb-best-season-receptions", 92],
    ["cfb-best-season-receiving-yards", 1672],
    ["cfb-best-season-receiving-touchdowns", 22],
  ]),
  cfbPlayer("cfb-calvin-johnson", [
    ["cfb-best-season-receptions", 76],
    ["cfb-best-season-receiving-yards", 1202],
    ["cfb-best-season-receiving-touchdowns", 15],
  ]),
  cfbPlayer("cfb-michael-crabtree", [
    ["cfb-best-season-receptions", 134],
    ["cfb-best-season-receiving-yards", 1962],
    ["cfb-best-season-receiving-touchdowns", 22],
  ]),
  cfbPlayer("cfb-marvin-harrison-jr", [
    ["cfb-best-season-receptions", 77],
    ["cfb-best-season-receiving-yards", 1263],
    ["cfb-best-season-receiving-touchdowns", 14],
  ]),
  cfbPlayer("cfb-brock-bowers", [
    ["cfb-best-season-receptions", 63],
    ["cfb-best-season-receiving-yards", 942],
    ["cfb-best-season-receiving-touchdowns", 13],
  ]),
  cfbPlayer("cfb-amari-cooper", [
    ["cfb-best-season-receptions", 124],
    ["cfb-best-season-receiving-yards", 1727],
    ["cfb-best-season-receiving-touchdowns", 16],
  ]),
  cfbPlayer("cfb-christian-mccaffrey", [
    ["cfb-best-season-rushing-yards", 2019],
    ["cfb-best-season-rushing-touchdowns", 13],
    ["cfb-best-season-receptions", 45],
    ["cfb-best-season-receiving-yards", 645],
    ["cfb-best-season-receiving-touchdowns", 5],
  ]),
  cfbPlayer("cfb-desmond-howard", [
    ["cfb-best-season-receptions", 61],
    ["cfb-best-season-receiving-yards", 950],
    ["cfb-best-season-receiving-touchdowns", 19],
    ["cfb-heisman-awards", 1],
  ]),
  cfbPlayer("cfb-saquon-barkley", [
    ["cfb-best-season-rushing-yards", 1496],
    ["cfb-best-season-rushing-touchdowns", 18],
    ["cfb-best-season-receptions", 54],
    ["cfb-best-season-receiving-yards", 632],
    ["cfb-best-season-receiving-touchdowns", 4],
  ]),
  cfbPlayer("cfb-will-anderson-jr", [
    ["cfb-best-season-sacks", 17.5],
    ["cfb-best-season-tackles-for-loss", 34.5],
  ]),
  cfbPlayer("cfb-nndamukong-suh", [
    ["cfb-best-season-sacks", 12],
    ["cfb-best-season-tackles-for-loss", 20.5],
  ]),
  cfbPlayer("cfb-joey-bosa", [
    ["cfb-best-season-sacks", 13.5],
    ["cfb-best-season-tackles-for-loss", 21],
  ]),
  cfbPlayer("cfb-charles-woodson", [
    ["cfb-best-season-defensive-interceptions", 7],
    ["cfb-heisman-awards", 1],
  ]),
  cfbPlayer("cfb-minkah-fitzpatrick", [
    ["cfb-best-season-defensive-interceptions", 6],
  ]),
  cfbPlayer("cfb-travis-hunter", [
    ["cfb-best-season-receptions", 96],
    ["cfb-best-season-receiving-yards", 1258],
    ["cfb-best-season-receiving-touchdowns", 15],
    ["cfb-best-season-defensive-interceptions", 4],
    ["cfb-heisman-awards", 1],
  ]),

  // College coaches.
  cfbCoach("nick-saban-cfb", [
    ["cfb-coach-career-wins", 297],
    ["cfb-coach-career-losses", 71],
    ["cfb-coach-career-ties", 1],
    ["cfb-coach-national-titles", 7],
    ["cfb-coach-conference-titles", 9],
  ]),
  cfbCoach("urban-meyer-cfb", [
    ["cfb-coach-career-wins", 187],
    ["cfb-coach-career-losses", 32],
    ["cfb-coach-career-ties", 0],
    ["cfb-coach-national-titles", 3],
    ["cfb-coach-conference-titles", 7],
  ]),
  cfbCoach("kirby-smart-cfb", [
    ["cfb-coach-career-wins", 117],
    ["cfb-coach-career-losses", 21],
    ["cfb-coach-career-ties", 0],
    ["cfb-coach-national-titles", 2],
    ["cfb-coach-conference-titles", 3],
  ]),
  cfbCoach("bob-stoops-cfb", [
    ["cfb-coach-career-wins", 191],
    ["cfb-coach-career-losses", 48],
    ["cfb-coach-career-ties", 0],
    ["cfb-coach-national-titles", 1],
    ["cfb-coach-conference-titles", 10],
  ]),
  cfbCoach("dabo-swinney-cfb", [
    ["cfb-coach-career-wins", 187],
    ["cfb-coach-career-losses", 53],
    ["cfb-coach-career-ties", 0],
  ]),
  cfbCoach("pete-carroll-cfb", [
    ["cfb-coach-career-wins", 97],
    ["cfb-coach-career-losses", 19],
    ["cfb-coach-career-ties", 0],
  ]),
  cfbCoach("mack-brown-cfb", [
    ["cfb-coach-career-wins", 282],
    ["cfb-coach-career-losses", 150],
    ["cfb-coach-career-ties", 1],
  ]),
  cfbCoach("jim-tressel-cfb", [
    ["cfb-coach-career-wins", 106],
    ["cfb-coach-career-losses", 22],
    ["cfb-coach-career-ties", 0],
  ]),
  cfbCoach("jim-harbaugh-cfb", [
    ["cfb-coach-career-wins", 115],
    ["cfb-coach-career-losses", 46],
    ["cfb-coach-career-ties", 0],
  ]),
  cfbCoach("chris-petersen-cfb", [
    ["cfb-coach-career-wins", 147],
    ["cfb-coach-career-losses", 38],
    ["cfb-coach-career-ties", 0],
  ]),
  cfbCoach("gary-patterson-cfb", [
    ["cfb-coach-career-wins", 181],
    ["cfb-coach-career-losses", 79],
    ["cfb-coach-career-ties", 0],
  ]),

  // Programs use a fixed 2000-through-2025 window rather than a subjective greatness score.
  cfbProgram("program-alabama", [
    ["cfb-program-wins-since-2000", 271],
    ["cfb-program-losses-since-2000", 77],
    ["cfb-program-national-titles-since-2000", 6],
    ["cfb-program-conference-titles-since-2000", 8],
    ["cfb-program-title-game-appearances-since-2000", 9],
  ]),
  cfbProgram("program-ohio-state", [
    ["cfb-program-wins-since-2000", 285],
    ["cfb-program-losses-since-2000", 52],
    ["cfb-program-national-titles-since-2000", 3],
    ["cfb-program-cfp-appearances", 6],
  ]),
  cfbProgram("program-georgia", [
    ["cfb-program-wins-since-2000", 270],
    ["cfb-program-losses-since-2000", 75],
    ["cfb-program-national-titles-since-2000", 2],
    ["cfb-program-conference-titles-since-2000", 5],
    ["cfb-program-cfp-appearances", 4],
  ]),
  cfbProgram("program-lsu", [
    ["cfb-program-wins-since-2000", 247],
    ["cfb-program-losses-since-2000", 88],
    ["cfb-program-national-titles-since-2000", 3],
    ["cfb-program-conference-titles-since-2000", 5],
    ["cfb-program-title-game-appearances-since-2000", 4],
  ]),

  // Explicit program eras make dynasties/countable eras reusable without a subjective dynasty flag.
  cfbEra("alabama-2009-2020", [
    ["cfb-era-wins", 151],
    ["cfb-era-losses", 15],
    ["cfb-era-national-titles", 6],
    ["cfb-era-conference-titles", 7],
    ["cfb-era-title-game-appearances", 8],
  ]),
  cfbEra("georgia-2021-2024", [
    ["cfb-era-wins", 53],
    ["cfb-era-losses", 5],
    ["cfb-era-national-titles", 2],
    ["cfb-era-conference-titles", 2],
    ["cfb-era-cfp-appearances", 3],
  ]),
  cfbEra("usc-2002-2008", [
    ["cfb-era-wins", 82],
    ["cfb-era-losses", 9],
    ["cfb-era-national-titles", 2],
    ["cfb-era-conference-titles", 7],
  ]),
  cfbEra("clemson-2015-2020", [
    ["cfb-era-wins", 79],
    ["cfb-era-losses", 7],
    ["cfb-era-national-titles", 2],
    ["cfb-era-conference-titles", 6],
    ["cfb-era-cfp-appearances", 6],
    ["cfb-era-title-game-appearances", 4],
  ]),

  // CFB team seasons beyond champions: strong, disappointing and bottom-end seasons all become factual candidates.
  cfbTeam("2025-indiana", 16, 0, true),
  cfbTeam("2022-tcu", 13, 2, false),
  cfbTeam("2014-florida-state", 13, 1, false),
  cfbTeam("2012-usc", 7, 6, false),
  cfbTeam("2010-texas", 5, 7, false),
  cfbTeam("2022-texas-am", 5, 7, false),
] as const;
