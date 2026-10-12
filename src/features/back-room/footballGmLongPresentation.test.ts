import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { NFL_GM_LONG_CAP, NFL_GM_LONG_SLOTS } from "./footballGmLongFoundation";
import {
  NFL_GM_LONG_COACHES,
  NFL_GM_LONG_COACH_BUCKETS,
  nflGmLongCoachEffects,
  nflGmLongCoachesInBucket,
} from "./footballGmLongCoaches";
import {
  nflGmLongCoachFit,
  nflGmLongCoachPointerRotation,
  nflGmLongYearTwoCapOverage,
  type NflGmLongFitPlayer,
} from "./footballGmLongPresentation";

const lineup: NflGmLongFitPlayer[] = [
  { slot: "QB", name: "Lamar Jackson", age: 29, grade: 95 },
  { slot: "RB", name: "B. Tuten", age: 23, grade: 82 },
  { slot: "WR", name: "CeeDee Lamb", age: 27, grade: 95 },
  { slot: "FLEX", name: "E. Egbuka", age: 23, grade: 86 },
  { slot: "OL", name: "Robert Hainsey", age: null, grade: 82 },
  { slot: "DL", name: "David Bailey", age: 23, grade: 84 },
  { slot: "LB", name: "Leonard Williams", age: 32, grade: 92 },
  { slot: "DB", name: "Cooper DeJean", age: 23, grade: 88 },
  { slot: "DB2", name: "Pat Surtain II", age: 26, grade: 95 },
];

describe("Long owner playtest mobile and coach presentation", () => {
  it("places the chosen coach sector's center under a stationary top pointer for all 32 coaches", () => {
    expect(NFL_GM_LONG_COACH_BUCKETS.map(bucket => nflGmLongCoachesInBucket(bucket).length)).toEqual([12, 7, 5, 8]);
    for (const bucket of NFL_GM_LONG_COACH_BUCKETS) {
      const count = nflGmLongCoachesInBucket(bucket).length;
      for (let index = 0; index < count; index++) {
        const degrees = nflGmLongCoachPointerRotation(27, index, count);
        const winningCenter = ((degrees + (index + 0.5) * 360 / count) % 360 + 360) % 360;
        expect(Math.min(winningCenter, 360 - winningCenter)).toBeLessThan(1e-7);
        expect(degrees).toBeGreaterThan(27 + 3 * 360);
        const resumed = nflGmLongCoachPointerRotation(0, index, count, 0);
        const resumedCenter = ((resumed + (index + 0.5) * 360 / count) % 360 + 360) % 360;
        expect(Math.min(resumedCenter, 360 - resumedCenter)).toBeLessThan(1e-7);
      }
    }
    expect(() => nflGmLongCoachPointerRotation(0, -1, 5)).toThrow();
    expect(() => nflGmLongCoachPointerRotation(0, 5, 5)).toThrow();
  });

  it("converts coach effects into identity-specific, roster-grounded explanations", () => {
    const monken = NFL_GM_LONG_COACHES.find(coach => coach.name === "Todd Monken")!;
    const ryans = NFL_GM_LONG_COACHES.find(coach => coach.name === "DeMeco Ryans")!;
    const macdonald = NFL_GM_LONG_COACHES.find(coach => coach.name === "Mike Macdonald")!;
    const toEffects = (coach: typeof monken) => nflGmLongCoachEffects(coach, lineup);
    const monkenFit = nflGmLongCoachFit(monken, lineup, toEffects(monken));
    const ryansFit = nflGmLongCoachFit(ryans, lineup, toEffects(ryans));
    const macdonaldFit = nflGmLongCoachFit(macdonald, lineup, toEffects(macdonald));
    expect(monkenFit.headline).toContain("development");
    expect(monkenFit.explanation).toMatch(/Egbuka|Bailey|Tuten|DeJean|Surtain/);
    expect(ryansFit.explanation).toMatch(/Leonard Williams|David Bailey/);
    expect(macdonaldFit.explanation).toMatch(/Pat Surtain II|Cooper DeJean/);
    expect(monkenFit.limitation).toBe(monken.limitation);
    expect(monkenFit.influences.length).toBeGreaterThan(0);
    for (const fit of [monkenFit, ryansFit, macdonaldFit]) {
      expect(JSON.stringify(fit)).not.toMatch(/(\d+(?:\.\d+)?)\s*pp\b/);
    }
  });

  it("flags a projected Year 2 overspend without changing the $205M cap", () => {
    expect(NFL_GM_LONG_CAP).toBe(205_000_000);
    expect(NFL_GM_LONG_SLOTS).toHaveLength(9);
    expect(nflGmLongYearTwoCapOverage(207_500_000, NFL_GM_LONG_CAP)).toBe(2_500_000);
    expect(nflGmLongYearTwoCapOverage(205_000_000, NFL_GM_LONG_CAP)).toBe(0);
    expect(nflGmLongYearTwoCapOverage(190_000_000, NFL_GM_LONG_CAP)).toBe(0);
  });

  it("scopes the one-column phone roster, flowing chips and wheel pointer to Long only", () => {
    const css = readFileSync(new URL("../../styles/football-gm-long.css", import.meta.url), "utf8");
    expect(css).toContain(".gm-long .football-gm__roster-grid");
    expect(css).toContain("grid-template-columns: minmax(0,1fr);");
    expect(css).toContain(".gm-long .football-gm__picker-candidates > button");
    expect(css).toContain('grid-template-areas: "photo player" ". action"');
    expect(css).toContain(".gm-long__coach-wheel-frame::before");
    expect(css).toContain(".gm-long__cap-alert");
    expect(css).not.toContain(".football-gm-page:not(.gm-long)");
  });
});
