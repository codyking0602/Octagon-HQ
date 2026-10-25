import { describe, expect, it } from "vitest";
import { buildBarTriviaDailySetup } from "./barTriviaDailyRuntime";
import {
  footballBarTriviaLeagueForDay,
  lockedWeightedGameForDay,
  isUfcPublicationDay,
} from "./dailyChallengeRotation";

describe("cross-day Bar Trivia recency protection for future Daily publication", () => {
  it("is deterministic and avoids all ten question IDs from the prior three league appearances", () => {
    const prior: Record<"nfl" | "cfb" | "ufc", string[][]> = {
      nfl: [], cfb: [], ufc: [],
    };
    const appearances: Record<"nfl" | "cfb" | "ufc", number> = {
      nfl: 0, cfb: 0, ufc: 0,
    };

    for (let offset = 0; offset < 150; offset += 1) {
      const day = new Date(Date.UTC(2026, 9, 1 + offset)).toISOString().slice(0, 10);
      for (const scope of ["football", "ufc"] as const) {
        if (lockedWeightedGameForDay(scope, day) !== "bar_trivia") continue;
        // A UFC board stays available for 48 hours; the carryover date is not a second appearance.
        if (scope === "ufc" && !isUfcPublicationDay(day)) continue;
        const league = scope === "ufc" ? "ufc" : footballBarTriviaLeagueForDay(day);
        const first = buildBarTriviaDailySetup(league, day, "recency-regression-v1");
        const second = buildBarTriviaDailySetup(league, day, "recency-regression-v1");
        expect(first, day).toEqual(second);
        const questions = first.revealSetup.questions as Array<{ id: string; contentType: string }>;
        const ids = questions.map((q) => q.id);
        expect(ids, day).toHaveLength(10);
        expect(new Set(ids).size, day).toBe(10);

        const previousIds = new Set(prior[league].flat());
        for (const id of ids) {
          expect(previousIds.has(id), league + " " + day + " repeated recent question " + id).toBe(false);
        }
        prior[league].unshift(ids);
        if (prior[league].length > 3) prior[league].pop();
        appearances[league] += 1;
      }
    }

    expect(appearances.nfl).toBeGreaterThanOrEqual(5);
    expect(appearances.cfb).toBeGreaterThanOrEqual(5);
    expect(appearances.ufc).toBeGreaterThanOrEqual(12);
  });

  it("does not invent fresh current-event slots when eligible stories are exhausted", () => {
    const a = buildBarTriviaDailySetup("nfl", "2026-12-15", "recency-regression-v1");
    const questions = a.revealSetup.questions as Array<{ id: string; contentType: string }>;
    expect(questions).toHaveLength(10);
    expect(questions.every((q) => q.contentType === "evergreen")).toBe(true);
  });
});
