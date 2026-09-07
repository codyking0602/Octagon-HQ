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

  historicalRusher("cfb-archie-griffin", 1620, 12, 2),
  historicalRusher("cfb-tony-dorsett", 1948, 21, 1),
  historicalRusher("cfb-billy-sims", 1762, 22, 1),
  historicalRusher("cfb-george-rogers", 1781, 14, 1),
  historicalRusher("cfb-marcus-allen", 2342, 22, 1),
  historicalRusher("cfb-herschel-walker", 1891, 18, 1),
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
];
