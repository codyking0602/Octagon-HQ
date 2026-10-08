import { describe, expect, it } from "vitest";
import {
  FOOTBALL_GM_DEVELOPMENT_SEED_TAG,
  projectWheelFootballGmExtensionApy,
  projectWheelFootballGmGrade,
  wheelFootballGmSalaryWindow,
} from "./wheelFootballGmEconomy";
import {
  FOOTBALL_GM_CAP,
  FOOTBALL_GM_PLAYER_POOL,
  FOOTBALL_GM_ROSTER_SLOTS,
  footballGmProjectedExtensionForPlayer,
  footballGmProjectedGradeForPlayer,
  type FootballGmRosterEntry,
} from "./footballGmEngine";
import {
  footballGmAdjustedSalaryForPlayer,
  footballGmAdjustedRosterCap,
  footballGmIsOffseasonCompliantV2,
  footballGmSeasonResultV2,
} from "./footballGmStrategy";

const key = (id: number) => `offseason-test-${id}${FOOTBALL_GM_DEVELOPMENT_SEED_TAG}`;
const prospect = {
  playerId: "Bears|QB|calebwilliams",
  currentGrade: 84,
  age: 24,
  position: "QB" as const,
  draftYear: 2024,
  draftOverall: 1,
};

function cheapestRoster(): FootballGmRosterEntry[] {
  const used = new Set<string>();
  return FOOTBALL_GM_ROSTER_SLOTS.map((slot) => {
    const player = [...FOOTBALL_GM_PLAYER_POOL]
      .filter((item) => item.eligibleSlots.includes(slot) && !used.has(item.id))
      .sort((a, b) => a.salaryWindow[1] - b.salaryWindow[1])[0]!;
    used.add(player.id);
    return { slot, playerId: player.id, acquired: "draft" as const };
  });
}

describe("GM seeded offseason development", () => {
  it("preserves legacy untagged projections and locks existing save behavior", () => {
    const baseline = projectWheelFootballGmGrade({ ...prospect, yearsAhead: 1 });
    expect(projectWheelFootballGmGrade({ ...prospect, yearsAhead: 1, seed: "legacy", playerId: prospect.playerId })).toBe(baseline);
    const baselinePrice = projectWheelFootballGmExtensionApy(prospect);
    expect(projectWheelFootballGmExtensionApy({ ...prospect, seed: "legacy" })).toBe(baselinePrice);
  });

  it("replays the same run exactly, but allows breakouts, stability and regression across runs", () => {
    const grades = Array.from({ length: 120 }, (_, i) =>
      projectWheelFootballGmGrade({ ...prospect, yearsAhead: 1, seed: key(i) }));
    for (let i = 0; i < 120; i += 1) {
      expect(projectWheelFootballGmGrade({ ...prospect, yearsAhead: 1, seed: key(i) })).toBe(grades[i]);
    }
    expect(new Set(grades).size).toBeGreaterThan(15);
    expect(Math.max(...grades)).toBeGreaterThanOrEqual(90);
    expect(Math.min(...grades)).toBeLessThanOrEqual(82);
  });

  it("gives established prime stars a much narrower downside range than prospects", () => {
    const established = { ...prospect, currentGrade: 96, age: 28, draftYear: 2018, draftOverall: 7 };
    const starDeltas = Array.from({ length: 250 }, (_, i) =>
      projectWheelFootballGmGrade({ ...established, yearsAhead: 1, seed: key(i) }) - 96);
    const prospectDeltas = Array.from({ length: 250 }, (_, i) =>
      projectWheelFootballGmGrade({ ...prospect, yearsAhead: 1, seed: key(i) }) - 84);
    expect(Math.min(...starDeltas)).toBeGreaterThanOrEqual(-1.5);
    expect(Math.max(...prospectDeltas)).toBeGreaterThan(5);
    expect(Math.min(...prospectDeltas)).toBeLessThan(-2);
  });

  it("links a 1YR market offer to realized development, with independently seeded market variance", () => {
    const sample = Array.from({ length: 120 }, (_, i) => ({
      grade: projectWheelFootballGmGrade({ ...prospect, yearsAhead: 1, seed: key(i) }),
      price: projectWheelFootballGmExtensionApy({ ...prospect, seed: key(i) }),
    }));
    const breakout = sample.find((item) => item.grade >= 90)!;
    const setback = sample.find((item) => item.grade <= 82)!;
    expect(breakout.price).toBeGreaterThan(setback.price);
    expect(new Set(sample.map((item) => item.price)).size).toBeGreaterThan(8);
    const window = wheelFootballGmSalaryWindow({
      gameContract: "1YR", salaryApy: 5_000_000, projectedExtensionApy: breakout.price,
    });
    expect(window).toEqual([5_000_000, breakout.price, breakout.price]);
  });

  it("never reprices 3YR contracts, even when their grades develop", () => {
    const player = FOOTBALL_GM_PLAYER_POOL.find((row) => row.gameContract === "3YR")!;
    expect(footballGmAdjustedSalaryForPlayer(player, 1, key(12), {})).toBe(player.salaryApy);
    expect(footballGmAdjustedSalaryForPlayer(player, 2, key(12), {})).toBe(player.salaryApy);
    expect(footballGmAdjustedSalaryForPlayer(player, 3, key(12), {})).toBe(player.salaryApy);
    expect(footballGmProjectedExtensionForPlayer(player, key(12))).toBe(player.salaryApy);
  });

  it("applies the same single extension price to years two and three and keeps cap tests authoritative", () => {
    const roster = cheapestRoster();
    for (let i = 0; i < 30; i += 1) {
      const seed = key(i);
      expect(footballGmAdjustedRosterCap(roster, 1, seed, {})).toBeLessThanOrEqual(FOOTBALL_GM_CAP);
      expect(footballGmAdjustedRosterCap(roster, 2, seed, {})).toBe(footballGmAdjustedRosterCap(roster, 3, seed, {}));
      expect(footballGmIsOffseasonCompliantV2(roster, seed, {}, [])).toBe(true);
    }
    const run = footballGmSeasonResultV2({ seed: key(4), yearOneRoster: roster, roster, year: 2 });
    const replay = footballGmSeasonResultV2({ seed: key(4), yearOneRoster: roster, roster, year: 2 });
    expect(run).toEqual(replay);
    expect(Number.isFinite(run.teamGrade)).toBe(true);
    expect(run.teamGrade).toBeGreaterThan(65);
  });

  it("uses different per-player identities for rolls even at the same baseline", () => {
    const first = Array.from({ length: 30 }, (_, i) =>
      projectWheelFootballGmGrade({ ...prospect, yearsAhead: 1, seed: key(i) }));
    const second = Array.from({ length: 30 }, (_, i) =>
      projectWheelFootballGmGrade({ ...prospect, playerId: "Bears|QB|anotherplayer", yearsAhead: 1, seed: key(i) }));
    expect(first).not.toEqual(second);
  });

  it("preserves grade/extension resolution against the live canonical player authority", () => {
    const player = FOOTBALL_GM_PLAYER_POOL.find((row) => row.gameContract === "1YR")!;
    const seed = key(22);
    expect(footballGmProjectedGradeForPlayer(player, 2, seed)).toBe(footballGmProjectedGradeForPlayer(player, 2, seed));
    expect(footballGmAdjustedSalaryForPlayer(player, 2, seed, {})).toBe(footballGmAdjustedSalaryForPlayer(player, 3, seed, {}));
    expect(footballGmAdjustedSalaryForPlayer(player, 2, seed, {})).toBe(footballGmProjectedExtensionForPlayer(player, seed));
  });
});
