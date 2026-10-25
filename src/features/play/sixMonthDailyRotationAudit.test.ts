import { describe, expect, it } from "vitest";
import { APPROVED_DAILY_ROTATION_WEIGHTS } from "./dailyContentQualityPolicy";
import { NBA_DAILY_WEIGHTS, NBA_DAILY_WEIGHTED_CYCLE } from "../nba/nbaDailySchedule";
import {
  SIX_MONTH_AUDIT_DAYS,
  auditCurrentMainBaseline,
  auditMergedPartOneCalendar,
  previewApprovedDailyRotation,
  summarizeRotation,
} from "./sixMonthDailyRotationAudit";

describe("six-month future Daily planning (NON-PUBLISHING, Part 1 owns cutover)", () => {
  const future = previewApprovedDailyRotation();
  const report = summarizeRotation(future.slots);

  it("audits actual Part 1 dates, content-cycle truth and the NBA season boundary", () => {
    const calendar = auditMergedPartOneCalendar();
    const actual = summarizeRotation(calendar);
    expect(actual.totals).toEqual({ football: 182, ufc: 91, nba: 81 });
    expect(actual.collisions.total).toBe(0);
    expect(actual.games.football.higher_lower?.count).toBe(13);
    expect(actual.games.ufc.higher_lower?.count).toBe(6);
    const first = calendar.filter(slot => slot.day === "2026-10-25");
    expect(first.map(slot => slot.sport).sort()).toEqual(["football", "ufc"]);
    const lastNba = calendar.filter(slot => slot.sport === "nba").at(-1);
    expect(lastNba?.day).toBe("2027-04-10");
    expect(calendar.some(slot => slot.sport === "nba" && slot.day > "2027-04-10")).toBe(false);
  });

  it("preserves every approved frequency and does not change the live rotation", () => {
    expect(future.live).toBe(false);
    expect(future.requiresGameCertification).toContain("ufc:higher_lower");
    expect(future.requiresGameCertification).toContain("football:higher_lower");
    const expectedWeights = {
      football: { ...APPROVED_DAILY_ROTATION_WEIGHTS.football, higher_lower: 2 },
      ufc: { ...APPROVED_DAILY_ROTATION_WEIGHTS.ufc, higher_lower: 2 },
      nba: NBA_DAILY_WEIGHTS,
    };
    delete (expectedWeights.football as Record<string, number>).higher_or_lower;
    delete (expectedWeights.ufc as Record<string, number>).higher_or_lower;
    for (const sport of ["football", "ufc", "nba"] as const) {
      const cycle = future.cycles[sport];
      expect(cycle).toHaveLength(Object.values(expectedWeights[sport]).reduce((sum, count) => sum + count, 0));
      for (const [game, weight] of Object.entries(expectedWeights[sport])) {
        expect(cycle.filter(entry => entry === game)).toHaveLength(weight);
      }
    }
    expect(future.cycles.nba).toEqual([...NBA_DAILY_WEIGHTED_CYCLE]);
  });

  it("models the exact approved three-sport cadence without co-publishing UFC and NBA", () => {
    expect(report.totals).toEqual({ football: SIX_MONTH_AUDIT_DAYS, ufc: 90, nba: 91 });
    const byDay = new Map<string, string[]>();
    for (const slot of future.slots) {
      const sports = byDay.get(slot.day) ?? [];
      sports.push(slot.sport);
      byDay.set(slot.day, sports);
    }
    expect(byDay.size).toBe(SIX_MONTH_AUDIT_DAYS);
    for (const [date, sports] of byDay) {
      expect(sports).toHaveLength(2);
      expect(sports).toContain("football");
      expect(sports).toContain(new Date(date + "T00:00:00Z").getTime() % (2 * 86400000)
        === new Date("2026-11-01T00:00:00Z").getTime() % (2 * 86400000) ? "nba" : "ufc");
    }
    expect(report.collisions.byPair["nba+ufc"]).toBeUndefined();
  });

  it("distributes certified-eligible candidate weights without adjacent repeats or multiweek gaps", () => {
    for (const sport of ["football", "ufc", "nba"] as const) {
      for (const [game, stats] of Object.entries(report.games[sport])) {
        expect(stats.consecutiveAppearances, sport + ":" + game).toBe(0);
        expect(stats.minimumGapDays, sport + ":" + game).toBeGreaterThan(2);
        // At 2x, alternate-day games naturally recur roughly every 30 days;
        // do not impose a 14-day global gap guard on UFC or NBA.
        expect(stats.maximumGapDays, sport + ":" + game).toBeLessThanOrEqual(sport === "football" ? 22 : 40);
        expect(Math.abs(stats.count - stats.expected), sport + ":" + game)
          .toBeLessThanOrEqual(2);
      }
    }
  });

  it("reports baseline anomalies and makes a measurable cross-sport comparison", () => {
    const current = summarizeRotation(auditCurrentMainBaseline());
    expect(current.totals).toEqual({ football: 181, ufc: 181, nba: 81 });
    // This must not silently be described as the current production schedule.
    expect(future.live).toBe(false);
    expect(report.collisions.total).toBeLessThan(current.collisions.total);
    expect(report.collisions.total).toBeGreaterThanOrEqual(0);
  });

  it("is deterministic and refuses invalid dates without creating or publishing a board", () => {
    expect(previewApprovedDailyRotation()).toEqual(future);
    expect(() => previewApprovedDailyRotation("2026-02-30")).toThrow("Invalid");
  });
});
