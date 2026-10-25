import { mkdirSync, writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  FOOTBALL_HIGHER_LOWER_APPROVED_DAILY_WEIGHT,
  auditFootballHigherLowerDailyDates,
} from "./footballHigherLowerSixMonthAudit";
import { FOOTBALL_LOCKED_WEIGHTED_CYCLE } from "./dailyChallengeRotation";
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

  it("simulates fourteen distinct 10-question official Daily boards using real seeded publisher and canonical source records", () => {
    const result = auditFootballHigherLowerDailyDates(
      provisionalDates(), "football-higher-lower-provisional-certification-v1",
    );
    const s = result.summary;
    expect(s.generatedBoards).toBe(14);
    expect(s.totalComparisons).toBe(140);
    expect(s.nflComparisons).toBe(70);
    expect(s.cfbComparisons).toBe(70);
    expect(s.exactRepeats).toBe(0);
    expect(s.semanticRepeats).toBe(0);
    expect(s.repeatedSubjectMetrics).toBe(0);
    expect(s.invalidBindings).toBe(0);
    expect(s.incorrectGrading).toBe(0);
    expect(s.duplicateBoards).toBe(0);
    expect(s.difficultyCounts).toEqual({ approachable: 42, competitive: 70, tough: 28 });
    expect(result.boards.every(board => board.questions.length === 10)).toBe(true);
    expect(auditFootballHigherLowerDailyDates(
      provisionalDates(), "football-higher-lower-provisional-certification-v1",
    ).boards).toEqual(result.boards);
    console.info("FOOTBALL_HIGHER_LOWER_PROVISIONAL_AUDIT", JSON.stringify(s));
    if (process.env.OCTAGON_WRITE_HL_AUDIT === "1") {
      mkdirSync("artifacts", { recursive: true });
      writeFileSync("artifacts/football-higher-lower-provisional-six-month-boards.json",
        JSON.stringify({ ...result, WARNING: "PROVISIONAL: NOT A CERTIFIED PRODUCTION CALENDAR. FINAL ROTATION AND SEED NOT YET MERGED." }, null, 2) + "\n");
    }
  }, 180_000);
});
