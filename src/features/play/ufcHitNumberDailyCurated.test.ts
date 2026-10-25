import { describe, expect, it } from "vitest";
import { hitTheNumberStatRows } from "./hitTheNumberEngine";
import {
  UFC_CURATED_DAILY_CHOICES,
  UFC_CURATED_DAILY_SUPPORTED_METRICS,
  createUfcCuratedDailyHitNumberPlan,
  ufcCuratedHitNumberFingerprint,
} from "./ufcHitNumberDailyCurated";
import { hitTheNumberRandomPoolQuality } from "./hitTheNumberPoolQuality";

const FIRST_DAY = Date.UTC(2026, 9, 25);
function centralDay(offset: number) {
  return new Date(FIRST_DAY + offset * 86_400_000).toISOString().slice(0, 10);
}
const PREVIEW_HIT_NUMBER_DATES = [18, 44, 78, 104, 138, 164]; // exact staged PR #2103 prospective dates; final Part 1 seeds still pending

describe("UFC Hit the Number curated Daily-only six-month foundation (not activated)", () => {
  it("generates distinct, exact, challenging, 4/5/6-pick boards with 12/14/16 choices", () => {
    const seen = new Set<string>();
    const metrics = new Set<string>();
    const counts: Record<number, number> = {};
    const rows = new Map(hitTheNumberStatRows.map((row) => [row.fighterId, row.values]));
    const failures: string[] = [];

    for (const [index, dayIndex] of PREVIEW_HIT_NUMBER_DATES.entries()) {
      for (let game = 0; game < 2; game++) {
        const seed = ["ufc-daily-six-month", centralDay(dayIndex), game].join(":");
        try {
          const plan = createUfcCuratedDailyHitNumberPlan(seed, seen);
          const key = ufcCuratedHitNumberFingerprint(plan);
          expect(seen.has(key)).toBe(false);
          seen.add(key);
          counts[plan.pickCount] = (counts[plan.pickCount] ?? 0) + 1;
          metrics.add(plan.statId);
          expect([4, 5, 6]).toContain(plan.pickCount);
          expect(plan.fighterIds).toHaveLength(
            UFC_CURATED_DAILY_CHOICES[plan.pickCount as 4 | 5 | 6]);
          expect(new Set(plan.fighterIds).size).toBe(plan.fighterIds.length);
          expect(plan.solutionFighterIds).toHaveLength(plan.pickCount);
          expect(plan.solutionFighterIds.reduce(
            (sum, id) => sum + Number(rows.get(id)?.[plan.statId] ?? NaN), 0))
            .toBe(plan.target);
          expect(hitTheNumberRandomPoolQuality(plan).passes).toBe(true);
          expect(UFC_CURATED_DAILY_SUPPORTED_METRICS).toContain(plan.statId);
          expect(createUfcCuratedDailyHitNumberPlan(seed).fighterIds)
            .toEqual(plan.fighterIds);
        } catch (error) {
          failures.push(seed + ": " + String(error));
        }
      }
    }
    console.info("UFC_CURATED_DAILY_SIX_MONTH", JSON.stringify({
      appearances: PREVIEW_HIT_NUMBER_DATES.length,
      boards: 2 * PREVIEW_HIT_NUMBER_DATES.length,
      uniqueBoards: seen.size,
      metrics: [...metrics], picks: counts,
      inventoryStatRows: hitTheNumberStatRows.length,
      failures,
      status: failures.length ? "BLOCKED" : "GENERATED_WITH_SOURCE_REVIEW_PENDING",
    }));
    expect(failures).toEqual([]);
    expect(seen.size).toBe(12);
  }, 180_000);

  it("does not mutate the legacy Casual generator's historical 7-pick policy", async () => {
    const { HIT_THE_NUMBER_MAX_PICKS, HIT_THE_NUMBER_DEFAULT_RANDOM_POOL_SIZE } =
      await import("./hitTheNumberEngine");
    expect(HIT_THE_NUMBER_MAX_PICKS).toBe(7);
    expect(HIT_THE_NUMBER_DEFAULT_RANDOM_POOL_SIZE).toBe(12);
  }, 180_000);
});
