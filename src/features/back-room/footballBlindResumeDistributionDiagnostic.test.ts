import { describe, it } from "vitest";
import { getFootballFact, type FootballFactMetricId } from "./footballFactualStatsCore";
import {
  buildFootballBlindResumeRounds,
  footballBlindResumeCandidatesForPack,
  footballBlindResumeMatchups,
  footballBlindResumeSubjectIdentityId,
} from "./footballBlindResumeModel";
import {
  queryFootballSubjects,
  type FootballSubjectQuery,
} from "./footballSubjectRegistry";

function increment(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

const CFB_QB_RESUME_METRICS: readonly FootballFactMetricId[] = [
  "cfb-best-season-passing-yards",
  "cfb-best-season-passing-touchdowns",
  "cfb-best-season-interceptions",
  "cfb-best-season-passer-rating",
  "cfb-best-season-rushing-yards",
  "cfb-best-season-rushing-touchdowns",
  "cfb-heisman-awards",
];

interface PoolAuditSpec {
  query: FootballSubjectQuery;
  metrics: readonly FootballFactMetricId[];
}

const POOL_AUDIT_SPECS: Readonly<Record<string, PoolAuditSpec>> = {
  "nfl-qb": {
    query: { kind: "player-career", league: "NFL", position: "QB" },
    metrics: [
      "nfl-career-games",
      "nfl-career-passing-yards",
      "nfl-career-passing-touchdowns",
      "nfl-career-interceptions-thrown",
      "nfl-career-passer-rating",
      "nfl-career-completion-percentage",
      "nfl-career-passing-yards-per-attempt",
      "nfl-career-passing-yards-per-game",
      "nfl-career-passing-touchdown-interception-ratio",
    ],
  },
  "nfl-rb": {
    query: { kind: "player-career", league: "NFL", position: "RB" },
    metrics: [
      "nfl-career-games",
      "nfl-career-rushing-attempts",
      "nfl-career-rushing-yards",
      "nfl-career-rushing-touchdowns",
      "nfl-career-rushing-yards-per-attempt",
      "nfl-career-rushing-yards-per-game",
      "nfl-career-receptions-per-game",
      "nfl-career-receiving-yards-per-game",
      "nfl-career-scrimmage-yards",
      "nfl-career-scrimmage-touchdowns",
    ],
  },
  "nfl-wr": {
    query: { kind: "player-career", league: "NFL", position: "WR" },
    metrics: [
      "nfl-career-games",
      "nfl-career-receptions",
      "nfl-career-receiving-yards",
      "nfl-career-receiving-touchdowns",
      "nfl-career-receptions-per-game",
      "nfl-career-receiving-yards-per-game",
    ],
  },
  "nfl-te": {
    query: { kind: "player-career", league: "NFL", position: "TE" },
    metrics: [
      "nfl-career-games",
      "nfl-career-receptions",
      "nfl-career-receiving-yards",
      "nfl-career-receiving-touchdowns",
      "nfl-career-receptions-per-game",
      "nfl-career-receiving-yards-per-game",
    ],
  },
  "nfl-defense": {
    query: { kind: "player-career", league: "NFL", positions: ["DL", "LB", "DB"] },
    metrics: [
      "nfl-career-sacks",
      "nfl-career-interceptions",
      "nfl-defensive-player-of-year-awards",
      "nfl-first-team-all-pros",
    ],
  },
  "nfl-team-seasons": {
    query: { kind: "team-season", league: "NFL" },
    metrics: [
      "nfl-team-overall-wins",
      "nfl-team-overall-losses",
      "nfl-team-points-per-game",
      "nfl-team-opponent-points-per-game",
      "nfl-super-bowl-title",
    ],
  },
  "nfl-head-coaches": {
    query: { kind: "coach", league: "NFL" },
    metrics: [],
  },
  "cfb-qb": {
    query: { kind: "player-career", league: "CFB", position: "QB" },
    metrics: CFB_QB_RESUME_METRICS,
  },
  "cfb-rb": {
    query: { kind: "player-career", league: "CFB", position: "RB" },
    metrics: [
      "cfb-best-season-rushing-yards",
      "cfb-best-season-rushing-touchdowns",
      "cfb-best-season-receptions",
      "cfb-best-season-receiving-yards",
      "cfb-best-season-receiving-touchdowns",
      "cfb-heisman-awards",
    ],
  },
  "cfb-wr": {
    query: { kind: "player-career", league: "CFB", position: "WR" },
    metrics: [
      "cfb-best-season-receptions",
      "cfb-best-season-receiving-yards",
      "cfb-best-season-receiving-touchdowns",
      "cfb-heisman-awards",
    ],
  },
  "cfb-te": {
    query: { kind: "player-career", league: "CFB", position: "TE" },
    metrics: [
      "cfb-best-season-receptions",
      "cfb-best-season-receiving-yards",
      "cfb-best-season-receiving-touchdowns",
    ],
  },
  "cfb-defense": {
    query: { kind: "player-career", league: "CFB", positions: ["DL", "LB", "DB"] },
    metrics: [
      "cfb-best-season-sacks",
      "cfb-best-season-tackles-for-loss",
      "cfb-best-season-defensive-interceptions",
    ],
  },
  "cfb-team-seasons": {
    query: { kind: "team-season", league: "CFB" },
    metrics: [
      "cfb-team-wins",
      "cfb-team-losses",
      "cfb-team-points-for",
      "cfb-team-points-against",
      "cfb-team-points-per-game",
      "cfb-team-opponent-points-per-game",
      "cfb-team-srs",
      "cfb-team-sos",
      "cfb-national-title",
    ],
  },
  "cfb-head-coaches": {
    query: { kind: "coach", league: "CFB" },
    metrics: [
      "cfb-coach-career-wins",
      "cfb-coach-career-losses",
      "cfb-coach-career-ties",
      "cfb-coach-national-titles",
      "cfb-coach-conference-titles",
    ],
  },
  "cfb-programs": {
    query: { kind: "program", league: "CFB" },
    metrics: [
      "cfb-program-wins-since-2000",
      "cfb-program-losses-since-2000",
      "cfb-program-national-titles-since-2000",
      "cfb-program-conference-titles-since-2000",
      "cfb-program-cfp-appearances",
      "cfb-program-title-game-appearances-since-2000",
    ],
  },
  "cfb-program-eras": {
    query: { kind: "program-era", league: "CFB" },
    metrics: [
      "cfb-era-wins",
      "cfb-era-losses",
      "cfb-era-national-titles",
      "cfb-era-conference-titles",
      "cfb-era-cfp-appearances",
      "cfb-era-title-game-appearances",
    ],
  },
};

function auditPool(spec: PoolAuditSpec) {
  const subjects = queryFootballSubjects({
    ...spec.query,
    includeProjectedSourceSubjects: true,
    includeProjectedCanonicalRecognition: true,
  });
  const byTier = Object.fromEntries(["A", "B", "C", "D"].map((tier) => [
    tier,
    subjects.filter((subject) => subject.recognizabilityTier === tier).length,
  ]));
  const productSubjects = subjects.filter((subject) => subject.recognizabilityTier !== "D");
  const metricCoverage = Object.fromEntries(spec.metrics.map((metricId) => [
    metricId,
    productSubjects.filter((subject) => getFootballFact(subject.id, metricId)).length,
  ]));
  const productFactCounts = productSubjects.map((subject) => spec.metrics.filter((metricId) => getFootballFact(subject.id, metricId)).length);
  const dSubjects = subjects.filter((subject) => subject.recognizabilityTier === "D");
  const dFactCounts = dSubjects.map((subject) => spec.metrics.filter((metricId) => getFootballFact(subject.id, metricId)).length);
  return {
    total: subjects.length,
    byTier,
    productABC: productSubjects.length,
    productWithAnyTrackedFact: productFactCounts.filter((count) => count > 0).length,
    productAverageTrackedFacts: productFactCounts.length
      ? Number((productFactCounts.reduce((sum, count) => sum + count, 0) / productFactCounts.length).toFixed(2))
      : 0,
    dWithAnyTrackedFact: dFactCounts.filter((count) => count > 0).length,
    metricCoverage,
  };
}

describe("Football Blind Resume distribution diagnostic", () => {
  it("reports the exact matchup, subject, family, tier, and fact inventory driving exposure", () => {
    const matchupCounts = new Map<string, number>();
    const subjectCounts = new Map<string, number>();
    const subjectDegrees = new Map<string, number>();
    const familyInventory = new Map<string, number>();
    const familyAppearances = new Map<string, number>();

    for (const matchup of footballBlindResumeMatchups) {
      increment(familyInventory, matchup.packId);
      increment(subjectDegrees, footballBlindResumeSubjectIdentityId(matchup.leftId));
      increment(subjectDegrees, footballBlindResumeSubjectIdentityId(matchup.rightId));
    }
    for (let index = 0; index < 8_000; index += 1) {
      for (const round of buildFootballBlindResumeRounds(`pr10-blind-resume-${index}`)) {
        increment(matchupCounts, round.id);
        increment(familyAppearances, round.packId);
        increment(subjectCounts, footballBlindResumeSubjectIdentityId(round.leftId));
        increment(subjectCounts, footballBlindResumeSubjectIdentityId(round.rightId));
      }
    }

    const topMatchups = [...matchupCounts.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 12)
      .map(([id, count]) => ({
        id,
        count,
        packId: footballBlindResumeMatchups.find((matchup) => matchup.id === id)?.packId ?? "missing",
      }));
    const topSubjects = [...subjectCounts.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 16)
      .map(([id, count]) => ({ id, count, degree: subjectDegrees.get(id) ?? 0 }));

    const cfbQbMatchupSubjects = new Set(
      footballBlindResumeMatchups
        .filter((matchup) => matchup.packId === "college-quarterbacks")
        .flatMap((matchup) => [matchup.leftId, matchup.rightId]),
    );
    const cfbQbFactSignatures = new Map<string, { candidates: number; playable: number; examples: string[] }>();
    for (const candidate of footballBlindResumeCandidatesForPack("college-quarterbacks")) {
      const known = CFB_QB_RESUME_METRICS.filter((metricId) => getFootballFact(candidate.canonicalSubjectId, metricId));
      const signature = known.join("|") || "no-resume-facts";
      const row = cfbQbFactSignatures.get(signature) ?? { candidates: 0, playable: 0, examples: [] };
      row.candidates += 1;
      if (cfbQbMatchupSubjects.has(candidate.id)) row.playable += 1;
      if (row.examples.length < 5) row.examples.push(`${candidate.id}->${candidate.canonicalSubjectId}`);
      cfbQbFactSignatures.set(signature, row);
    }

    const poolAudit = Object.fromEntries(
      Object.entries(POOL_AUDIT_SPECS).map(([poolId, spec]) => [poolId, auditPool(spec)]),
    );

    throw new Error(`BLIND_RESUME_DISTRIBUTION_DIAGNOSTIC ${JSON.stringify({
      catalogSize: footballBlindResumeMatchups.length,
      familyInventory: Object.fromEntries([...familyInventory.entries()].sort()),
      familyAppearances: Object.fromEntries([...familyAppearances.entries()].sort()),
      poolAudit,
      cfbQbCandidates: footballBlindResumeCandidatesForPack("college-quarterbacks").length,
      cfbQbPlayableSubjects: cfbQbMatchupSubjects.size,
      cfbQbFactSignatures: [...cfbQbFactSignatures.entries()]
        .sort((left, right) => right[1].candidates - left[1].candidates)
        .map(([signature, detail]) => ({ signature, ...detail })),
      topMatchups,
      topSubjects,
    })}`);
  });
});
