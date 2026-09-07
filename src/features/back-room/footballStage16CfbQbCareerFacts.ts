import type {
  FootballFactMetricId,
  FootballFactValue,
  FootballFactualRecord,
} from "./footballFactualStatsCore";

const SOURCE_ID = "cfr-player-stat-lines";

const reported = (metricId: FootballFactMetricId, value: number): FootballFactValue => ({
  metricId,
  value,
  evidence: { sourceIds: [SOURCE_ID], kind: "reported" },
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

const facts = (
  subjectId: string,
  values: readonly (readonly [FootballFactMetricId, number])[],
): FootballFactualRecord => ({
  subjectId,
  scope: "cfb-player-career",
  facts: values.map(([metricId, value]) => reported(metricId, value)),
});

/**
 * Reviewed CFB career evidence from College Football at Sports-Reference. These rows
 * extend the canonical factual ledger where generated cfbfastR coverage is incomplete,
 * especially for recognizable historical players.
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
  qbCareer("cfb-johnny-manziel", 26, 595, 863, 7820, 63, 22, 345, 2169, 30),
  qbCareer("cfb-robert-griffin-iii", 41, 800, 1192, 10366, 78, 17, 528, 2254, 33),
  qbCareer("cfb-marcus-mariota", 41, 779, 1167, 10796, 105, 14, 337, 2237, 29),
  qbCareer("cfb-jameis-winston", 27, 562, 851, 7964, 65, 28, 145, 284, 7),
  qbCareer("cfb-colt-mccoy", 53, 1157, 1645, 13253, 112, 45, 447, 1571, 20),
  qbCareer("cfb-troy-smith", 43, 420, 670, 5720, 54, 13, 293, 1168, 14),
  qbCareer("cfb-brady-quinn", 49, 929, 1602, 11762, 95, 39, 254, 182, 6),

  facts("cfb-archie-griffin", [
    ["cfb-career-games", 42], ["cfb-career-rushing-attempts", 845], ["cfb-career-rushing-yards", 5177],
    ["cfb-career-rushing-touchdowns", 25], ["cfb-career-receptions", 25], ["cfb-career-receiving-yards", 286],
    ["cfb-career-receiving-touchdowns", 1], ["cfb-career-total-touchdowns", 26],
    ["cfb-best-season-rushing-yards", 1620], ["cfb-best-season-rushing-touchdowns", 12], ["cfb-heisman-awards", 2],
  ]),
  facts("cfb-tony-dorsett", [
    ["cfb-career-games", 44], ["cfb-career-rushing-attempts", 1074], ["cfb-career-rushing-yards", 6082],
    ["cfb-career-rushing-touchdowns", 55], ["cfb-career-receptions", 38], ["cfb-career-receiving-yards", 404],
    ["cfb-career-receiving-touchdowns", 4], ["cfb-career-total-touchdowns", 59],
    ["cfb-best-season-rushing-yards", 1948], ["cfb-best-season-rushing-touchdowns", 21], ["cfb-heisman-awards", 1],
  ]),
  facts("cfb-billy-sims", [
    ["cfb-career-games", 55], ["cfb-career-rushing-attempts", 538], ["cfb-career-rushing-yards", 3813],
    ["cfb-career-rushing-touchdowns", 50], ["cfb-career-receptions", 2], ["cfb-career-receiving-yards", 77],
    ["cfb-career-receiving-touchdowns", 0], ["cfb-career-total-touchdowns", 50],
    ["cfb-best-season-rushing-yards", 1762], ["cfb-best-season-rushing-touchdowns", 22], ["cfb-heisman-awards", 1],
  ]),
  facts("cfb-george-rogers", [
    ["cfb-career-games", 45], ["cfb-career-rushing-attempts", 902], ["cfb-career-rushing-yards", 4958],
    ["cfb-career-rushing-touchdowns", 31], ["cfb-career-receptions", 40], ["cfb-career-receiving-yards", 371],
    ["cfb-career-receiving-touchdowns", 2], ["cfb-career-total-touchdowns", 33],
    ["cfb-best-season-rushing-yards", 1781], ["cfb-best-season-rushing-touchdowns", 14], ["cfb-heisman-awards", 1],
  ]),
  facts("cfb-marcus-allen", [
    ["cfb-career-games", 45], ["cfb-career-rushing-attempts", 893], ["cfb-career-rushing-yards", 4682],
    ["cfb-career-rushing-touchdowns", 45], ["cfb-career-receptions", 79], ["cfb-career-receiving-yards", 721],
    ["cfb-career-receiving-touchdowns", 2], ["cfb-career-total-touchdowns", 47],
    ["cfb-best-season-rushing-yards", 2342], ["cfb-best-season-rushing-touchdowns", 22], ["cfb-heisman-awards", 1],
  ]),
  facts("cfb-herschel-walker", [
    ["cfb-career-games", 33], ["cfb-career-rushing-attempts", 994], ["cfb-career-rushing-yards", 5259],
    ["cfb-career-rushing-touchdowns", 49], ["cfb-career-receptions", 26], ["cfb-career-receiving-yards", 243],
    ["cfb-career-receiving-touchdowns", 3], ["cfb-career-total-touchdowns", 52],
    ["cfb-best-season-rushing-yards", 1891], ["cfb-best-season-rushing-touchdowns", 18], ["cfb-heisman-awards", 1],
  ]),
  facts("cfb-mike-rozier", [
    ["cfb-career-games", 35], ["cfb-career-rushing-attempts", 668], ["cfb-career-rushing-yards", 4780],
    ["cfb-career-rushing-touchdowns", 49], ["cfb-career-receptions", 20], ["cfb-career-receiving-yards", 216],
    ["cfb-career-receiving-touchdowns", 2], ["cfb-career-total-touchdowns", 52],
    ["cfb-best-season-rushing-yards", 2148], ["cfb-best-season-rushing-touchdowns", 29], ["cfb-heisman-awards", 1],
  ]),
  facts("cfb-bo-jackson", [
    ["cfb-career-games", 45], ["cfb-career-rushing-attempts", 650], ["cfb-career-rushing-yards", 4303],
    ["cfb-career-rushing-touchdowns", 43], ["cfb-career-receptions", 26], ["cfb-career-receiving-yards", 272],
    ["cfb-career-receiving-touchdowns", 2], ["cfb-career-total-touchdowns", 45],
    ["cfb-best-season-rushing-yards", 1786], ["cfb-best-season-rushing-touchdowns", 17], ["cfb-heisman-awards", 1],
  ]),
  facts("cfb-earl-campbell", [
    ["cfb-career-games", 40], ["cfb-career-rushing-attempts", 765], ["cfb-career-rushing-yards", 4443],
    ["cfb-career-rushing-touchdowns", 40], ["cfb-career-receptions", 6], ["cfb-career-receiving-yards", 128],
    ["cfb-career-receiving-touchdowns", 1], ["cfb-career-total-touchdowns", 41],
    ["cfb-best-season-rushing-yards", 1744], ["cfb-best-season-rushing-touchdowns", 18], ["cfb-heisman-awards", 1],
  ]),
  facts("cfb-barry-sanders", [
    ["cfb-career-games", 30], ["cfb-career-rushing-attempts", 523], ["cfb-career-rushing-yards", 3556],
    ["cfb-career-rushing-touchdowns", 48], ["cfb-career-receptions", 23], ["cfb-career-receiving-yards", 381],
    ["cfb-career-receiving-touchdowns", 3], ["cfb-career-total-touchdowns", 55],
    ["cfb-best-season-receptions", 19], ["cfb-best-season-receiving-yards", 106],
    ["cfb-best-season-receiving-touchdowns", 1],
  ]),
  facts("cfb-ricky-williams", [
    ["cfb-career-games", 46], ["cfb-career-rushing-attempts", 1011], ["cfb-career-rushing-yards", 6279],
    ["cfb-career-rushing-touchdowns", 72], ["cfb-career-receptions", 85], ["cfb-career-receiving-yards", 927],
    ["cfb-career-receiving-touchdowns", 3], ["cfb-career-total-touchdowns", 75],
    ["cfb-best-season-receptions", 25], ["cfb-best-season-receiving-yards", 291],
    ["cfb-best-season-receiving-touchdowns", 2],
  ]),
  facts("cfb-o-j-simpson", [
    ["cfb-career-games", 20], ["cfb-career-rushing-attempts", 621], ["cfb-career-rushing-yards", 3124],
    ["cfb-career-rushing-touchdowns", 33], ["cfb-career-receptions", 28], ["cfb-career-receiving-yards", 235],
    ["cfb-career-receiving-touchdowns", 0], ["cfb-career-total-touchdowns", 33],
    ["cfb-best-season-rushing-yards", 1709], ["cfb-best-season-rushing-touchdowns", 22], ["cfb-heisman-awards", 1],
  ]),
  facts("cfb-reggie-bush", [
    ["cfb-career-games", 39], ["cfb-career-rushing-attempts", 433], ["cfb-career-rushing-yards", 3169],
    ["cfb-career-rushing-touchdowns", 25], ["cfb-career-receptions", 95], ["cfb-career-receiving-yards", 1301],
    ["cfb-career-receiving-touchdowns", 13], ["cfb-career-total-touchdowns", 42],
  ]),
  facts("cfb-adrian-peterson", [
    ["cfb-career-games", 31], ["cfb-career-rushing-attempts", 748], ["cfb-career-rushing-yards", 4041],
    ["cfb-career-rushing-touchdowns", 41], ["cfb-career-receptions", 24], ["cfb-career-receiving-yards", 198],
    ["cfb-career-receiving-touchdowns", 1], ["cfb-career-total-touchdowns", 42],
  ]),
  facts("cfb-derrick-henry", [
    ["cfb-career-games", 39], ["cfb-career-rushing-attempts", 602], ["cfb-career-rushing-yards", 3591],
    ["cfb-career-rushing-touchdowns", 42], ["cfb-career-receptions", 17], ["cfb-career-receiving-yards", 285],
    ["cfb-career-receiving-touchdowns", 3], ["cfb-career-total-touchdowns", 45],
  ]),
  facts("cfb-mark-ingram-ii", [
    ["cfb-career-games", 39], ["cfb-career-rushing-attempts", 572], ["cfb-career-rushing-yards", 3261],
    ["cfb-career-rushing-touchdowns", 42], ["cfb-career-receptions", 60], ["cfb-career-receiving-yards", 670],
    ["cfb-career-receiving-touchdowns", 4], ["cfb-career-total-touchdowns", 46],
  ]),
  facts("cfb-darren-mcfadden", [
    ["cfb-career-games", 38], ["cfb-career-rushing-attempts", 785], ["cfb-career-rushing-yards", 4590],
    ["cfb-career-rushing-touchdowns", 41], ["cfb-career-receptions", 46], ["cfb-career-receiving-yards", 365],
    ["cfb-career-receiving-touchdowns", 2], ["cfb-career-total-touchdowns", 43],
  ]),

  facts("cfb-larry-fitzgerald", [
    ["cfb-career-games", 26], ["cfb-career-receptions", 161], ["cfb-career-receiving-yards", 2677],
    ["cfb-career-receiving-touchdowns", 34], ["cfb-career-rushing-attempts", 1], ["cfb-career-rushing-yards", 7],
    ["cfb-career-rushing-touchdowns", 0], ["cfb-career-total-touchdowns", 34],
  ]),
  facts("cfb-calvin-johnson", [
    ["cfb-career-games", 38], ["cfb-career-receptions", 178], ["cfb-career-receiving-yards", 2927],
    ["cfb-career-receiving-touchdowns", 28], ["cfb-career-rushing-attempts", 10], ["cfb-career-rushing-yards", 40],
    ["cfb-career-rushing-touchdowns", 1], ["cfb-career-total-touchdowns", 29],
  ]),
  facts("cfb-michael-crabtree", [
    ["cfb-career-games", 26], ["cfb-career-receptions", 231], ["cfb-career-receiving-yards", 3127],
    ["cfb-career-receiving-touchdowns", 41], ["cfb-career-rushing-attempts", 2], ["cfb-career-rushing-yards", 1],
    ["cfb-career-rushing-touchdowns", 0], ["cfb-career-total-touchdowns", 41],
  ]),

  facts("cfb-billy-cannon", [
    ["cfb-career-games", 30], ["cfb-career-rushing-attempts", 359], ["cfb-career-rushing-yards", 1867],
    ["cfb-career-rushing-touchdowns", 19], ["cfb-career-receptions", 31], ["cfb-career-receiving-yards", 522],
    ["cfb-career-receiving-touchdowns", 2], ["cfb-career-total-touchdowns", 21],
    ["cfb-best-season-rushing-yards", 686], ["cfb-best-season-rushing-touchdowns", 10],
    ["cfb-best-season-receptions", 11], ["cfb-best-season-receiving-yards", 199],
    ["cfb-best-season-receiving-touchdowns", 1], ["cfb-heisman-awards", 1],
  ]),
  facts("cfb-doak-walker", [["cfb-heisman-awards", 1]]),
  facts("cfb-tim-brown", [
    ["cfb-career-games", 43], ["cfb-career-receptions", 137], ["cfb-career-receiving-yards", 2493],
    ["cfb-career-receiving-touchdowns", 12], ["cfb-career-rushing-attempts", 98], ["cfb-career-rushing-yards", 442],
    ["cfb-career-rushing-touchdowns", 4], ["cfb-career-total-touchdowns", 16],
    ["cfb-best-season-receptions", 45], ["cfb-best-season-receiving-yards", 910],
    ["cfb-best-season-receiving-touchdowns", 5], ["cfb-best-season-rushing-yards", 254],
    ["cfb-best-season-rushing-touchdowns", 2], ["cfb-heisman-awards", 1],
  ]),
  facts("cfb-ernie-davis", [
    ["cfb-career-games", 29], ["cfb-career-rushing-attempts", 360], ["cfb-career-rushing-yards", 2386],
    ["cfb-career-rushing-touchdowns", 20], ["cfb-career-receptions", 38], ["cfb-career-receiving-yards", 392],
    ["cfb-career-receiving-touchdowns", 4], ["cfb-career-total-touchdowns", 24],
    ["cfb-best-season-rushing-yards", 877], ["cfb-best-season-rushing-touchdowns", 12],
    ["cfb-best-season-receptions", 16], ["cfb-best-season-receiving-yards", 157],
    ["cfb-best-season-receiving-touchdowns", 2], ["cfb-heisman-awards", 1],
  ]),
  facts("cfb-davey-obrien", [["cfb-heisman-awards", 1]]),
  facts("cfb-keith-jackson", [
    ["cfb-career-games", 44], ["cfb-career-receptions", 62], ["cfb-career-receiving-yards", 1470],
    ["cfb-career-receiving-touchdowns", 14], ["cfb-career-rushing-attempts", 20], ["cfb-career-rushing-yards", 289],
    ["cfb-career-rushing-touchdowns", 4], ["cfb-career-total-touchdowns", 18],
    ["cfb-best-season-receptions", 20], ["cfb-best-season-receiving-yards", 486],
    ["cfb-best-season-receiving-touchdowns", 5], ["cfb-best-season-rushing-yards", 153],
    ["cfb-best-season-rushing-touchdowns", 3],
  ]),
  facts("cfb-deion-sanders", [
    ["cfb-career-games", 44], ["cfb-career-defensive-interceptions", 14], ["cfb-best-season-defensive-interceptions", 5],
  ]),
  facts("cfb-charles-woodson", [
    ["cfb-career-games", 34], ["cfb-career-defensive-interceptions", 16], ["cfb-career-receptions", 21],
    ["cfb-career-receiving-yards", 370], ["cfb-career-receiving-touchdowns", 3], ["cfb-career-rushing-attempts", 9],
    ["cfb-career-rushing-yards", 167], ["cfb-career-rushing-touchdowns", 2], ["cfb-heisman-awards", 1],
  ]),
  facts("cfb-desmond-howard", [
    ["cfb-career-games", 33], ["cfb-career-receptions", 127], ["cfb-career-receiving-yards", 1944],
    ["cfb-career-receiving-touchdowns", 30], ["cfb-career-rushing-attempts", 21], ["cfb-career-rushing-yards", 215],
    ["cfb-career-rushing-touchdowns", 2], ["cfb-career-total-touchdowns", 32], ["cfb-heisman-awards", 1],
  ]),
  facts("cfb-eddie-george", [
    ["cfb-career-games", 44], ["cfb-career-rushing-attempts", 643], ["cfb-career-rushing-yards", 3578],
    ["cfb-career-rushing-touchdowns", 43], ["cfb-career-receptions", 60], ["cfb-career-receiving-yards", 516],
    ["cfb-career-receiving-touchdowns", 1], ["cfb-career-total-touchdowns", 44], ["cfb-heisman-awards", 1],
  ]),
  facts("cfb-rashaan-salaam", [
    ["cfb-career-games", 27], ["cfb-career-rushing-attempts", 486], ["cfb-career-rushing-yards", 3057],
    ["cfb-career-rushing-touchdowns", 33], ["cfb-career-receptions", 38], ["cfb-career-receiving-yards", 412],
    ["cfb-career-receiving-touchdowns", 0], ["cfb-career-total-touchdowns", 33], ["cfb-heisman-awards", 1],
  ]),
  facts("cfb-derrick-thomas", [["cfb-career-games", 34]]),
  facts("cfb-nndamukong-suh", [
    ["cfb-career-games", 54], ["cfb-career-sacks", 24], ["cfb-career-defensive-interceptions", 4],
    ["cfb-career-forced-fumbles", 3], ["cfb-career-fumble-recoveries", 0],
  ]),
  facts("cfb-patrick-peterson", [
    ["cfb-career-games", 39], ["cfb-career-defensive-interceptions", 7],
    ["cfb-career-forced-fumbles", 1], ["cfb-career-fumble-recoveries", 0],
  ]),
];