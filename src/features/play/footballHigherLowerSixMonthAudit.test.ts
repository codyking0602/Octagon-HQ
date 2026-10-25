import { mkdirSync, writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  FOOTBALL_HIGHER_LOWER_APPROVED_DAILY_WEIGHT,
  auditFootballHigherLowerDailyDates,
} from "./footballHigherLowerSixMonthAudit";
import { FOOTBALL_LOCKED_WEIGHTED_CYCLE } from "./dailyChallengeRotation";
import { FOOTBALL_HIGHER_LOWER_OFFICIAL_SUBJECT_REUSE_CAP } from "../back-room/footballHigherLowerModel";
import { NBA_OFFICIAL_GAMES_RELEASE_READY } from "../nba/nbaDailySchedule";

/**
 * Capacity stress fixture only: the coordinated six-month schedule is not merged.
 * Never present these provisional dates as live Daily publication slots.
 * Rerun with the real Part 1/2 calendar and its exact schedule version.
 */
function provisionalDates() {
  const first = Date.UTC(2026, 9, 26);
  return Array.from({ length: 14 }, (_, i) =>
    new Date(first + i * 13 * 86_400_000).toISOString().slice(0, 10));
}

describe("Football Higher or Lower six-month readiness / integration gate", () => {
  it("does not independently activate the unmerged coordinated scheduler", () => {
    expect(FOOTBALL_HIGHER_LOWER_APPROVED_DAILY_WEIGHT).toBe(2);
    expect(FOOTBALL_LOCKED_WEIGHTED_CYCLE).not.toContain("higher_lower");
    expect(NBA_OFFICIAL_GAMES_RELEASE_READY).toBe(false);
  });

  it("simulates 14 appearances with 28 independent source-bound 10-question boards", () => {
    const result = auditFootballHigherLowerDailyDates(
      provisionalDates(), "football-higher-lower-provisional-certification-v1",
    );
    const s = result.summary;
    expect(s.generatedBoards).toBe(28);
    expect(s.comparisonsPerAppearance).toBe(20);
    expect(s.totalComparisons).toBe(280);
    expect(s.nflComparisons).toBe(140);
    expect(s.cfbComparisons).toBe(140);
    expect(s.exactRepeats).toBe(0);
    expect(s.semanticRepeats).toBe(0);
    expect(s.repeatedSubjectMetrics).toBe(0);
    expect(s.invalidBindings).toBe(0);
    expect(s.metadataOnlyDraftFacts).toBe(0);
    expect(s.incorrectGrading).toBe(0);
    expect(s.duplicateBoards).toBe(0);
    expect(s.mostRepeatedSubjects[0]?.appearances ?? 0).toBeLessThanOrEqual(
      FOOTBALL_HIGHER_LOWER_OFFICIAL_SUBJECT_REUSE_CAP,
    );
    expect(s.uniqueSubjectSeasons).toBeGreaterThanOrEqual(130);
    expect(Object.keys(s.categoryCounts).length).toBeGreaterThanOrEqual(6);
    const franchiseSubjects = result.boards.flatMap(board => board.questions.flatMap(q =>
      [q.known, q.hidden].filter(side => side.evidence.kind === "franchise")));
    expect(franchiseSubjects.length).toBeGreaterThan(0);
    expect(franchiseSubjects.every(side => !/^[A-Z]{2,4}$/.test(side.name))).toBe(true);
    expect(s.difficultyCounts).toEqual({ approachable: 84, competitive: 140, tough: 56 });
    expect(result.boards.every(board => board.questions.length === 10)).toBe(true);
    for (let i = 0; i < result.boards.length; i += 2) {
      expect(result.boards[i]?.day).toBe(result.boards[i + 1]?.day);
      expect(result.boards[i]?.gameNumber).toBe(1);
      expect(result.boards[i + 1]?.gameNumber).toBe(2);
    }
    expect(auditFootballHigherLowerDailyDates(
      provisionalDates(), "football-higher-lower-provisional-certification-v1",
    ).boards).toEqual(result.boards);
    console.info("FOOTBALL_HIGHER_LOWER_PROVISIONAL_AUDIT", JSON.stringify(s));
    if (process.env.OCTAGON_WRITE_HL_AUDIT === "1") {
      mkdirSync("artifacts", { recursive: true });
      writeFileSync("artifacts/football-higher-lower-provisional-six-month-boards.json",
        JSON.stringify({ ...result, WARNING: "PROVISIONAL: 14 stress appearances, 28 boards; Football Higher or Lower not yet scheduled by canonical v21 calendar." }, null, 2) + "\n");
    }
  }, 180_000);
});
