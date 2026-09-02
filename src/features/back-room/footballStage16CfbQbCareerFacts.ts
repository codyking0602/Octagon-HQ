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

/**
 * Stage 16 reviewed CFB quarterback career totals. These rows extend the existing
 * College Football at Sports-Reference factual owner before generated cfbfastR gap-fill,
 * so pre-2014 seasons and transfer careers are not silently truncated by projection coverage.
 */
export const footballStage16CfbQbCareerFactualRecords: readonly FootballFactualRecord[] = [
  qbCareer("cfb-cam-newton", 20, 191, 292, 2908, 30, 7, 285, 1586, 24),
  qbCareer("cfb-joe-burrow", 39, 650, 945, 8852, 78, 11, 258, 820, 13),
  qbCareer("cfb-vince-young", 37, 444, 718, 6040, 44, 28, 457, 3127, 37),
  qbCareer("cfb-tim-tebow", 55, 661, 995, 9285, 88, 16, 692, 2947, 57),
  qbCareer("cfb-baker-mayfield", 48, 1026, 1497, 14607, 131, 30, 404, 1083, 21),
];
