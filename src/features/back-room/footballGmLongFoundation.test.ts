import { describe, expect, it } from "vitest";
import { FOOTBALL_GM_CAP, FOOTBALL_GM_ROSTER_SLOTS, FOOTBALL_GM_TEAMS } from "./footballGmEngine";
import {
  NFL_GM_LONG_CAP, NFL_GM_LONG_POSITION_WEIGHTS, NFL_GM_LONG_SLOTS, NFL_GM_LONG_VERSION,
  nflGmLongOlAuditErrors, nflGmLongOverall, nflGmLongSpend,
  nflGmLongValidRoster, type NflGmLongOlRow, type NflGmLongPlayerFit,
} from "./footballGmLongFoundation";
import {
  NFL_GM_LONG_COACHES, NFL_GM_LONG_COACH_BUCKETS,
  nflGmLongCoachEffects, nflGmLongCoachesInBucket, nflGmLongSpinCoach,
  type NflGmLongCoachingRosterEntry,
} from "./footballGmLongCoaches";

const teamPool = FOOTBALL_GM_TEAMS;
const olFixture = Array.from({ length: 179 }, (_, i): NflGmLongOlRow => ({
  team: teamPool[i % teamPool.length]!,
  name: `Synthetic Test OL ${i}`,
  role: (["T", "G", "C"] as const)[i % 3]!,
  age: 25,
  currentGrade: 82,
  salaryApy: 8_000_000,
  realContractEndSeason: 2028,
  gameContract: "3YR",
  development: {
    breakoutPct: 10, improvePct: 35, steadyPct: 35,
    declinePct: 20, maxAnnualGain: 6, maxAnnualLoss: 5,
  },
  sourceUrls: ["https://example.org/fixture-only"],
}));

describe("NFL GM Long isolated configuration", () => {
  it("does not mutate Short GM's locked seven roster spots or $150M cap", () => {
    expect(FOOTBALL_GM_CAP).toBe(150_000_000);
    expect(FOOTBALL_GM_ROSTER_SLOTS).toHaveLength(7);
    expect(NFL_GM_LONG_VERSION).not.toBe("");
    expect(NFL_GM_LONG_CAP).toBe(205_000_000);
    expect(NFL_GM_LONG_SLOTS).toEqual(["QB", "RB", "WR", "FLEX", "OL", "DL", "LB", "DB", "DB2"]);
    expect(Object.values(NFL_GM_LONG_POSITION_WEIGHTS).reduce((a, b) => a + b, 0)).toBeCloseTo(1, 10);
    expect(NFL_GM_LONG_POSITION_WEIGHTS.QB).toBeGreaterThan(
      Math.max(...Object.entries(NFL_GM_LONG_POSITION_WEIGHTS).filter(([slot]) => slot !== "QB").map(([, weight]) => weight)),
    );
  });

  it("fails closed on missing, duplicate, unsupported or unsourced OL research", () => {
    expect(teamPool).toHaveLength(32);
    expect(nflGmLongOlAuditErrors(olFixture, teamPool)).toEqual([]);
    expect(nflGmLongOlAuditErrors(olFixture.slice(1), teamPool)).toContain("OL research requires 179 reconciled players; received 178.");
    const duplicate = [...olFixture];
    duplicate[1] = { ...duplicate[0]! };
    expect(nflGmLongOlAuditErrors(duplicate, teamPool).some(error => error.includes("Duplicate OL identity"))).toBe(true);
    const missingSource = [...olFixture];
    missingSource[0] = { ...missingSource[0]!, sourceUrls: [] };
    expect(nflGmLongOlAuditErrors(missingSource, teamPool).some(error => error.includes("Missing OL evidence"))).toBe(true);
    const badContract = [...olFixture];
    badContract[0] = { ...badContract[0]!, gameContract: "1YR" };
    expect(nflGmLongOlAuditErrors(badContract, teamPool).some(error => error.includes("contract classification"))).toBe(true);
  });

  it("requires exactly nine distinct eligible players, within $205M, without losing Year 2 prices", () => {
    const catalog = new Map<string, NflGmLongPlayerFit>();
    const picks = NFL_GM_LONG_SLOTS.map((slot, i) => {
      catalog.set(String(i), { id: String(i), eligibleSlots: [slot], currentGrade: 90, salaryWindow: [20_000_000, 30_000_000, 30_000_000] });
      return { slot, playerId: String(i) };
    });
    expect(nflGmLongValidRoster(picks, catalog)).toBe(true);
    expect(nflGmLongSpend(picks, catalog, 1)).toBe(180_000_000);
    expect(nflGmLongSpend(picks, catalog, 2)).toBe(270_000_000);
    expect(nflGmLongOverall(picks, catalog)).toBe(90);
    expect(nflGmLongOverall(picks.slice(1), catalog)).toBeNull();
    expect(nflGmLongValidRoster([...picks.slice(0, 8), picks[0]!], catalog)).toBe(false);
    catalog.set("0", { ...catalog.get("0")!, salaryWindow: [50_000_000, 50_000_000, 50_000_000] });
    expect(nflGmLongValidRoster(picks, catalog)).toBe(false);
  });
});

const allStrong: readonly NflGmLongCoachingRosterEntry[] = NFL_GM_LONG_SLOTS.map((slot) => ({ slot, grade: 92, age: 28 }));
const rushing: readonly NflGmLongCoachingRosterEntry[] = NFL_GM_LONG_SLOTS.map((slot) =>
  ({ slot, grade: slot === "RB" || slot === "OL" ? 95 : slot === "QB" || slot === "WR" || slot === "FLEX" ? 79 : 85, age: 24 }));
const passing: readonly NflGmLongCoachingRosterEntry[] = NFL_GM_LONG_SLOTS.map((slot) =>
  ({ slot, grade: ["QB", "WR", "FLEX", "OL"].includes(slot) ? 96 : 79, age: 30 }));
const coverage: readonly NflGmLongCoachingRosterEntry[] = NFL_GM_LONG_SLOTS.map((slot) =>
  ({ slot, grade: slot === "DB" || slot === "DB2" ? 97 : slot === "DL" || slot === "LB" ? 78 : 84, age: 25 }));
const pressure: readonly NflGmLongCoachingRosterEntry[] = NFL_GM_LONG_SLOTS.map((slot) =>
  ({ slot, grade: slot === "DL" || slot === "LB" ? 97 : slot === "DB" || slot === "DB2" ? 78 : 84, age: 30 }));

describe("NFL GM Long coaching wheel", () => {
  it("includes every current club and the locked 12/7/5/8 categories", () => {
    expect(NFL_GM_LONG_COACHES).toHaveLength(32);
    expect(new Set(NFL_GM_LONG_COACHES.map(coach => coach.team))).toEqual(new Set(teamPool));
    expect(NFL_GM_LONG_COACH_BUCKETS.map(bucket => nflGmLongCoachesInBucket(bucket).length)).toEqual([12, 7, 5, 8]);
    expect(NFL_GM_LONG_COACHES.every(coach => coach.strengths.length > 10 && coach.limitation.length > 10)).toBe(true);
  });

  it("gives every eligible coach exactly one equal sector", () => {
    for (const bucket of NFL_GM_LONG_COACH_BUCKETS) {
      const options = nflGmLongCoachesInBucket(bucket);
      for (let index = 0; index < options.length; index++) {
        expect(nflGmLongSpinCoach(bucket, (index + 0.5) / options.length)).toEqual(options[index]);
      }
    }
    expect(() => nflGmLongSpinCoach("offensive", 1)).toThrow();
  });

  it("creates coach-specific matchups without altering player OVR or salary", () => {
    const shanahan = NFL_GM_LONG_COACHES.find(coach => coach.name === "Kyle Shanahan")!;
    const mcvay = NFL_GM_LONG_COACHES.find(coach => coach.name === "Sean McVay")!;
    const macdonald = NFL_GM_LONG_COACHES.find(coach => coach.name === "Mike Macdonald")!;
    const ryans = NFL_GM_LONG_COACHES.find(coach => coach.name === "DeMeco Ryans")!;
    expect(nflGmLongCoachEffects(shanahan, rushing).rushingMatchupPct)
      .toBeGreaterThan(nflGmLongCoachEffects(mcvay, rushing).rushingMatchupPct);
    expect(nflGmLongCoachEffects(mcvay, passing).passingMatchupPct)
      .toBeGreaterThan(nflGmLongCoachEffects(shanahan, passing).passingMatchupPct);
    expect(nflGmLongCoachEffects(macdonald, coverage).coveragePct)
      .toBeGreaterThan(nflGmLongCoachEffects(ryans, coverage).coveragePct);
    expect(nflGmLongCoachEffects(ryans, pressure).pressurePct)
      .toBeGreaterThan(nflGmLongCoachEffects(macdonald, pressure).pressurePct);
    const before = JSON.stringify(allStrong);
    NFL_GM_LONG_COACHES.forEach(coach => nflGmLongCoachEffects(coach, allStrong));
    expect(JSON.stringify(allStrong)).toBe(before);
  });

  it("gives each philosophy a useful matchup, development or chemistry benefit", () => {
    for (const bucket of NFL_GM_LONG_COACH_BUCKETS) {
      const benefits = nflGmLongCoachesInBucket(bucket).map(coach =>
        Object.values(nflGmLongCoachEffects(coach, allStrong)));
      expect(benefits.every(values => values.some(value => value > 0))).toBe(true);
    }
  });
});
