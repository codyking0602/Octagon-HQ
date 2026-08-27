import { describe, it } from "vitest";
import { getFootballFact, type FootballFactMetricId } from "./footballFactualStatsCore";
import {
  buildFootballBlindResumeRounds,
  footballBlindResumeCandidatesForPack,
  footballBlindResumeMatchups,
  footballBlindResumeSubjectIdentityId,
} from "./footballBlindResumeModel";

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

describe("Football Blind Resume distribution diagnostic", () => {
  it("reports the exact matchup, subject, and family inventory driving exposure", () => {
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
      const known = CFB_QB_RESUME_METRICS.filter((metricId) => getFootballFact(candidate.id, metricId));
      const signature = known.join("|") || "no-resume-facts";
      const row = cfbQbFactSignatures.get(signature) ?? { candidates: 0, playable: 0, examples: [] };
      row.candidates += 1;
      if (cfbQbMatchupSubjects.has(candidate.id)) row.playable += 1;
      if (row.examples.length < 5) row.examples.push(candidate.id);
      cfbQbFactSignatures.set(signature, row);
    }

    throw new Error(`BLIND_RESUME_DISTRIBUTION_DIAGNOSTIC ${JSON.stringify({
      catalogSize: footballBlindResumeMatchups.length,
      familyInventory: Object.fromEntries([...familyInventory.entries()].sort()),
      familyAppearances: Object.fromEntries([...familyAppearances.entries()].sort()),
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