import type {
  FootballFactMetricId,
  FootballFactValue,
  FootballFactualRecord,
} from "./footballFactualStatsCore";

const SOURCE_ID = "cfr-player-stat-lines";

const reported = (metricId: FootballFactMetricId, value: number): FootballFactValue => ({
  metricId,
  value,
  evidence: {
    sourceIds: [SOURCE_ID],
    kind: "reported",
  },
});

const qbCareer = (
  subjectId: string,
  games: number,
  completions: number,
  attempts: number,
  passingYards: number,
  passingTouchdowns: number,
  interceptions: number,
  rushingAttempts: number,
  rushingYards: number,
  rushingTouchdowns: number,
): FootballFactualRecord => ({
  subjectId,
  scope: "cfb-player-career",
  facts: [
    reported("cfb-career-games", games),
    reported("cfb-career-passing-completions", completions),
    reported("cfb-career-passing-attempts", attempts),
    reported("cfb-career-passing-yards", passingYards),
    reported("cfb-career-passing-touchdowns", passingTouchdowns),
    reported("cfb-career-interceptions-thrown", interceptions),
    reported("cfb-career-rushing-attempts", rushingAttempts),
    reported("cfb-career-rushing-yards", rushingYards),
    reported("cfb-career-rushing-touchdowns", rushingTouchdowns),
  ],
});

const historicalRusher = (
  subjectId: string,
  bestSeasonRushingYards: number,
  bestSeasonRushingTouchdowns: number,
  heismanAwards: number,
): FootballFactualRecord => ({
  subjectId,
  scope: "cfb-player-career",
  facts: [
    reported("cfb-best-season-rushing-yards", bestSeasonRushingYards),
    reported("cfb-best-season-rushing-touchdowns", bestSeasonRushingTouchdowns),
    reported("cfb-heisman-awards", heismanAwards),
  ],
});

const historicalSkillPlayer = (
  subjectId: string,
  facts: readonly (readonly [FootballFactMetricId, number])[],
): FootballFactualRecord => ({
  subjectId,
  scope: "cfb-player-career",
  facts: facts.map(([metricId, value]) => reported(metricId, value)),
});

/**
 * Stage 16 reviewed CFB player facts. Quarterback rows contain complete Sports-Reference
 * career passing/rushing totals; historical skill-player rows preserve source-backed
 * production and Heisman counts for recognizable pre-cfbfastR subjects.
 */
export const footballStage16CfbQbCareerFactualRecords: readonly FootballFactualRecord[] = [
  qbCareer("cfb-cam-newton", 20, 191, 292, 2908, 30, 7, 285, 1586, 24),
  qbCareer("cfb-joe-burrow", 39, 650, 945, 8852, 78, 11, 258, 820, 13),
  qbCareer("cfb-vince-young", 37, 444, 718, 6040, 44, 28, 457, 3127, 37),
  qbCareer("cfb-tim-tebow", 55, 661, 995, 9285, 88, 16, 692, 2947, 57),
  qbCareer("cfb-baker-mayfield", 48, 1026, 1497, 14607, 131, 30, 404, 1083, 21),
  qbCareer("cfb-doug-flutie", 44, 677, 1271, 10579, 67, 54, 287, 739, 7),
  qbCareer("cfb-vinny-testaverde", 45, 413, 674, 6058, 48, 25, 125, -320, 8),
  qbCareer("cfb-charlie-ward", 45, 473, 759, 5747, 49, 22, 172, 889, 10),
  qbCareer("cfb-danny-wuerffel", 46, 708, 1170, 10875, 114, 42, 185, -375, 8),
  qbCareer("cfb-ty-detmer", 48, 958, 1530, 15031, 121, 65, 265, -366, 14),
  qbCareer("cfb-gino-torretta", 44, 555, 991, 7690, 47, 24, 110, 32, 2),
  qbCareer("cfb-andre-ware", 27, 660, 1074, 8202, 75, 28, 120, -144, 6),
  qbCareer("cfb-eric-crouch", 43, 312, 606, 4481, 29, 25, 648, 3434, 59),
  qbCareer("cfb-matt-leinart", 39, 807, 1245, 10693, 99, 23, 132, -70, 9),
  qbCareer("cfb-jim-plunkett", 31, 530, 962, 7544, 52, 47, 211, 343, 10),
  qbCareer("cfb-roger-staubach", 30, 293, 463, 3571, 18, 19, 345, 682, 17),
  qbCareer("cfb-paul-hornung", 30, 110, 233, 1696, 12, 23, 209, 1051, 6),

  historicalSkillPlayer("cfb-archie-griffin", [
    ["cfb-career-games", 42],
    ["cfb-career-rushing-attempts", 845],
    ["cfb-career-rushing-yards", 5177],
    ["cfb-career-rushing-touchdowns", 25],
    ["cfb-career-receptions", 25],
    ["cfb-career-receiving-yards", 286],
    ["cfb-career-receiving-touchdowns", 1],
    ["cfb-career-total-touchdowns", 26],
    ["cfb-best-season-rushing-yards", 1620],
    ["cfb-best-season-rushing-touchdowns", 12],
    ["cfb-heisman-awards", 2],
  ]),
  historicalSkillPlayer("cfb-tony-dorsett", [
    ["cfb-career-games", 44],
    ["cfb-career-rushing-attempts", 1074],
    ["cfb-career-rushing-yards", 6082],
    ["cfb-career-rushing-touchdowns", 55],
    ["cfb-career-receptions", 38],
    ["cfb-career-receiving-yards", 404],
    ["cfb-career-receiving-touchdowns", 4],
    ["cfb-career-total-touchdowns", 59],
    ["cfb-best-season-rushing-yards", 1948],
    ["cfb-best-season-rushing-touchdowns", 21],
    ["cfb-heisman-awards", 1],
  ]),
  historicalRusher("cfb-billy-sims", 1762, 22, 1),
  historicalRusher("cfb-george-rogers", 1781, 14, 1),
  historicalSkillPlayer("cfb-marcus-allen", [
    ["cfb-career-games", 45],
    ["cfb-career-rushing-attempts", 893],
    ["cfb-career-rushing-yards", 4682],
    ["cfb-career-rushing-touchdowns", 45],
    ["cfb-career-receptions", 79],
    ["cfb-career-receiving-yards", 721],
    ["cfb-career-receiving-touchdowns", 2],
    ["cfb-career-total-touchdowns", 47],
    ["cfb-best-season-rushing-yards", 2342],
    ["cfb-best-season-rushing-touchdowns", 22],
    ["cfb-heisman-awards", 1],
  ]),
  historicalSkillPlayer("cfb-herschel-walker", [
    ["cfb-career-games", 33],
    ["cfb-career-rushing-attempts", 994],
    ["cfb-career-rushing-yards", 5259],
    ["cfb-career-rushing-touchdowns", 49],
    ["cfb-career-receptions", 26],
    ["cfb-career-receiving-yards", 243],
    ["cfb-career-receiving-touchdowns", 3],
    ["cfb-career-total-touchdowns", 52],
    ["cfb-best-season-rushing-yards", 1891],
    ["cfb-best-season-rushing-touchdowns", 18],
    ["cfb-heisman-awards", 1],
  ]),
  historicalRusher("cfb-mike-rozier", 2148, 29, 1),
  historicalRusher("cfb-bo-jackson", 1786, 17, 1),
  historicalRusher("cfb-earl-campbell", 1744, 18, 1),
  historicalRusher("cfb-o-j-simpson", 1709, 22, 1),

  historicalSkillPlayer("cfb-billy-cannon", [
    ["cfb-best-season-rushing-yards", 686],
    ["cfb-best-season-rushing-touchdowns", 10],
    ["cfb-best-season-receptions", 11],
    ["cfb-best-season-receiving-yards", 199],
    ["cfb-best-season-receiving-touchdowns", 1],
    ["cfb-heisman-awards", 1],
  ]),
  historicalSkillPlayer("cfb-doak-walker", [
    ["cfb-heisman-awards", 1],
  ]),
  historicalSkillPlayer("cfb-tim-brown", [
    ["cfb-best-season-receptions", 45],
    ["cfb-best-season-receiving-yards", 910],
    ["cfb-best-season-receiving-touchdowns", 5],
    ["cfb-best-season-rushing-yards", 254],
    ["cfb-best-season-rushing-touchdowns", 2],
    ["cfb-heisman-awards", 1],
  ]),
  historicalSkillPlayer("cfb-ernie-davis", [
    ["cfb-best-season-rushing-yards", 877],
    ["cfb-best-season-rushing-touchdowns", 12],
    ["cfb-best-season-receptions", 16],
    ["cfb-best-season-receiving-yards", 157],
    ["cfb-best-season-receiving-touchdowns", 2],
    ["cfb-heisman-awards", 1],
  ]),
  historicalSkillPlayer("cfb-davey-obrien", [
    ["cfb-heisman-awards", 1],
  ]),
  historicalSkillPlayer("cfb-keith-jackson", [
    ["cfb-career-games", 44],
    ["cfb-best-season-receptions", 20],
    ["cfb-best-season-receiving-yards", 486],
    ["cfb-best-season-receiving-touchdowns", 5],
    ["cfb-best-season-rushing-yards", 153],
    ["cfb-best-season-rushing-touchdowns", 3],
  ]),
  historicalSkillPlayer("cfb-deion-sanders", [
    ["cfb-career-games", 44],
    ["cfb-best-season-defensive-interceptions", 5],
  ]),
  historicalSkillPlayer("cfb-charles-woodson", [
    ["cfb-career-games", 34],
    ["cfb-career-defensive-interceptions", 16],
    ["cfb-career-receptions", 21],
    ["cfb-career-receiving-yards", 370],
    ["cfb-career-receiving-touchdowns", 3],
    ["cfb-career-rushing-attempts", 9],
    ["cfb-career-rushing-yards", 167],
    ["cfb-career-rushing-touchdowns", 2],
    ["cfb-heisman-awards", 1],
  ]),
  historicalSkillPlayer("cfb-desmond-howard", [
    ["cfb-career-games", 33],
    ["cfb-career-receptions", 127],
    ["cfb-career-receiving-yards", 1944],
    ["cfb-career-receiving-touchdowns", 30],
    ["cfb-career-rushing-attempts", 21],
    ["cfb-career-rushing-yards", 215],
    ["cfb-career-rushing-touchdowns", 2],
    ["cfb-career-total-touchdowns", 32],
    ["cfb-heisman-awards", 1],
  ]),
  historicalSkillPlayer("cfb-eddie-george", [
    ["cfb-career-games", 44],
    ["cfb-career-rushing-attempts", 643],
    ["cfb-career-rushing-yards", 3578],
    ["cfb-career-rushing-touchdowns", 43],
    ["cfb-career-receptions", 60],
    ["cfb-career-receiving-yards", 516],
    ["cfb-career-receiving-touchdowns", 1],
    ["cfb-career-total-touchdowns", 44],
    ["cfb-heisman-awards", 1],
  ]),
  historicalSkillPlayer("cfb-rashaan-salaam", [
    ["cfb-career-games", 27],
    ["cfb-career-rushing-attempts", 486],
    ["cfb-career-rushing-yards", 3057],
    ["cfb-career-rushing-touchdowns", 33],
    ["cfb-career-receptions", 38],
    ["cfb-career-receiving-yards", 412],
    ["cfb-career-receiving-touchdowns", 0],
    ["cfb-career-total-touchdowns", 33],
    ["cfb-heisman-awards", 1],
  ]),
  historicalSkillPlayer("cfb-derrick-thomas", [
    ["cfb-career-games", 34],
  ]),
];
