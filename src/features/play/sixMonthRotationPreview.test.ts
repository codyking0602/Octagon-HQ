import { describe, expect, it } from "vitest";
import {
  PREVIEW_WEIGHTS, SIX_MONTH_AUDIT_END, SIX_MONTH_AUDIT_START,
  buildMaskedLegacyComparison, buildSixMonthRotationPreview,
  previewCollisions, previewCounts, previewDays, previewGaps,
  previewPublicationDates,
} from "./sixMonthRotationPreview";

describe("nonpublishing six-month Daily rotation preview", () => {
  const planned = buildSixMonthRotationPreview();

  it("respects the Part 1 date masks and preserves NBA's existing regular-season end", () => {
    expect(previewDays()).toHaveLength(183);
    expect(previewDays()[0]).toBe(SIX_MONTH_AUDIT_START);
    expect(previewDays().at(-1)).toBe(SIX_MONTH_AUDIT_END);
    expect(planned.football).toHaveLength(183);
    expect(planned.ufc).toHaveLength(92);
    expect(planned.nba).toHaveLength(88);
    expect(planned.nba[0]?.day).toBe("2026-11-01");
    expect(planned.nba.at(-1)?.day).toBe("2027-04-25");
    expect(planned.nba.every((row) => !planned.ufc.some((other) => row.day === other.day))).toBe(true);
    expect(new Set(previewPublicationDates("football")).size).toBe(183);
    for (const sport of ["football", "ufc", "nba"] as const) {
      expect(new Set(planned[sport].map(({ day }) => day)).size).toBe(planned[sport].length);
    }
  });

  it("uses exact approved quotas in every complete weighted cycle", () => {
    for (const sport of ["football", "ufc", "nba"] as const) {
      const weights = PREVIEW_WEIGHTS[sport];
      const cycleLength = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
      expect(cycleLength).toBe(sport === "football" ? 28 : sport === "ufc" ? 30 : 28);
      const completeCycles = Math.floor(planned[sport].length / cycleLength);
      for (let cycle = 0; cycle < completeCycles; cycle++) {
        const segment = planned[sport].slice(cycle * cycleLength, (cycle + 1) * cycleLength);
        expect(previewCounts(segment)).toEqual(weights);
      }
      const appearances = previewCounts(planned[sport]);
      for (const [game, weight] of Object.entries(weights)) {
        expect(Math.abs((appearances[game] ?? 0) - planned[sport].length * weight / cycleLength))
          .toBeLessThanOrEqual(1);
      }
    }
  });

  it("avoids excessive same-game clustering without changing approved frequencies", () => {
    for (const sport of ["football", "ufc", "nba"] as const) {
      const gaps = previewGaps(planned[sport]);
      for (const [game, gap] of Object.entries(gaps)) {
        expect(gap.minDays, sport + " " + game + " near-consecutive appearance").toBeGreaterThanOrEqual(
          sport === "football" ? 4 : sport === "nba" ? 6 : 8);
        expect(gap.maxDays, sport + " " + game + " excessive absence").toBeLessThanOrEqual(
          sport === "football" ? 20 : sport === "ufc" ? 36 : 36);
      }
    }
  });

  it("measures cross-sport improvement against the same Part 1 cadence mask", () => {
    const before = previewCollisions(buildMaskedLegacyComparison());
    const after = previewCollisions(planned);
    expect(after.ufcNba).toHaveLength(0);
    expect(after.total).toBeLessThan(before.total);
    expect(after.total).toBeLessThanOrEqual(6);
    // This is deliberately logged so the audit report never confuses a
    // proposed schedule with an already-deployed production schedule.
    console.info("SIX_MONTH_ROTATION_COMPARISON", JSON.stringify({
      from: SIX_MONTH_AUDIT_START,
      through: SIX_MONTH_AUDIT_END,
      beforeCollisions: before.total,
      afterCollisions: after.total,
      counts: Object.fromEntries(["football", "ufc", "nba"].map((sport) => [
        sport, previewCounts(planned[sport as keyof typeof planned]),
      ])),
      remainingDates: [...after.ufcFootball, ...after.nbaFootball],
    }));
  });

  it("is independent of execution order and does not change current production helpers", () => {
    expect(buildSixMonthRotationPreview()).toEqual(planned);
    expect(buildMaskedLegacyComparison().football[0]?.game).toBeTruthy();
    expect(buildMaskedLegacyComparison().nba[0]?.game).toBe("average_fan");
  });
});
