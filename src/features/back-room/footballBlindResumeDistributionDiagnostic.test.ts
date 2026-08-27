import { describe, it } from "vitest";
import {
  buildFootballBlindResumeRounds,
  footballBlindResumeMatchups,
  footballBlindResumeSubjectIdentityId,
} from "./footballBlindResumeModel";

function increment(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

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

    throw new Error(`BLIND_RESUME_DISTRIBUTION_DIAGNOSTIC ${JSON.stringify({
      catalogSize: footballBlindResumeMatchups.length,
      familyInventory: Object.fromEntries([...familyInventory.entries()].sort()),
      familyAppearances: Object.fromEntries([...familyAppearances.entries()].sort()),
      topMatchups,
      topSubjects,
    })}`);
  });
});
