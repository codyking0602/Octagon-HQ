import { describe, expect, it } from "vitest";
import { hitTheNumberRandomPoolSize, type HitTheNumberStatRow } from "./hitTheNumberEngine";
import { createHitTheNumberFormatPlan, type HitTheNumberFormatPlan } from "./hitTheNumberFormats";
import {
  HIT_THE_NUMBER_RANDOM_POOL_QUALITY,
  createQualityGatedHitTheNumberFormatPlan,
  hitTheNumberRandomPoolQuality,
} from "./hitTheNumberPoolQuality";
import { playFighters } from "./playFighterPool";

function testRows(values: readonly number[]): HitTheNumberStatRow[] {
  return values.map((value, index) => ({
    fighterId: playFighters[index]!.id,
    values: {
      "ufc-wins": value,
      "ufc-ko-tko-wins": value,
      "ufc-submission-wins": value,
      "ufc-finishes": value,
    },
  }));
}

function testPlan(): HitTheNumberFormatPlan {
  return {
    boardType: "random-pool",
    statId: "ufc-wins",
    target: 60,
    pickCount: 4,
    fighterIds: playFighters.slice(0, 8).map((fighter) => fighter.id),
    solutionFighterIds: playFighters.slice(0, 4).map((fighter) => fighter.id),
    format: {
      formatId: "themed-lineup",
      label: "Themed Lineup",
      configurationId: "test-theme",
      configurationLabel: "Test Theme",
      rules: [],
      slots: [],
    },
  };
}

function findThemedRandomSeeds(count: number) {
  const seeds: string[] = [];
  for (let index = 0; index < 2000 && seeds.length < count; index += 1) {
    const seed = `quality-theme-${index}`;
    const plan = createHitTheNumberFormatPlan({ seed, boardType: "random-pool" });
    if (plan.format.formatId === "themed-lineup") seeds.push(seed);
  }
  if (seeds.length !== count) throw new Error(`Only found ${seeds.length} themed Random Pool seeds.`);
  return seeds;
}

describe("Hit the Number Random Pool quality", () => {
  it("rejects clustered pools and recognizes a pool with bad, middle, and bust outcomes", () => {
    const clustered = hitTheNumberRandomPoolQuality(testPlan(), testRows([15, 15, 15, 15, 14, 14, 14, 14]));
    expect(clustered.passes).toBe(false);
    expect(clustered.lowestUnderScore).toBeGreaterThan(HIT_THE_NUMBER_RANDOM_POOL_QUALITY.badUnderMaxScore);
    expect(clustered.lowestBustScore).toBeNull();

    const spread = hitTheNumberRandomPoolQuality(testPlan(), testRows([15, 15, 15, 15, 1, 2, 25, 26]));
    expect(spread.passes).toBe(true);
    expect(spread.lowestUnderScore).toBeLessThanOrEqual(HIT_THE_NUMBER_RANDOM_POOL_QUALITY.badUnderMaxScore);
    expect(spread.lowestBustScore).toBeLessThanOrEqual(HIT_THE_NUMBER_RANDOM_POOL_QUALITY.meaningfulBustMaxScore);
    expect(spread.hasMidScore).toBe(true);
  });

  it("quality-gates generated themed Random Pools while keeping the canonical format type", () => {
    for (const seed of findThemedRandomSeeds(16)) {
      const plan = createQualityGatedHitTheNumberFormatPlan({ seed, boardType: "random-pool" });
      const quality = hitTheNumberRandomPoolQuality(plan);

      expect(plan.format.formatId).toBe("themed-lineup");
      expect(plan.fighterIds).toHaveLength(hitTheNumberRandomPoolSize(plan.pickCount));
      expect(quality.passes).toBe(true);
      expect(quality.lowestUnderScore).toBeLessThanOrEqual(HIT_THE_NUMBER_RANDOM_POOL_QUALITY.badUnderMaxScore);
      expect(quality.lowestBustScore).toBeLessThanOrEqual(HIT_THE_NUMBER_RANDOM_POOL_QUALITY.meaningfulBustMaxScore);
      expect(quality.hasMidScore).toBe(true);
    }
  });

  it("is deterministic and leaves non-themed boards on the existing planner path", () => {
    const themedSeed = findThemedRandomSeeds(1)[0]!;
    expect(createQualityGatedHitTheNumberFormatPlan({ seed: themedSeed, boardType: "random-pool" }))
      .toEqual(createQualityGatedHitTheNumberFormatPlan({ seed: themedSeed, boardType: "random-pool" }));

    for (let index = 0; index < 200; index += 1) {
      const seed = `quality-non-theme-${index}`;
      const raw = createHitTheNumberFormatPlan({ seed, boardType: "random-pool" });
      if (raw.format.formatId === "themed-lineup") continue;
      expect(createQualityGatedHitTheNumberFormatPlan({ seed, boardType: "random-pool" })).toEqual(raw);
      return;
    }
    throw new Error("No non-themed Random Pool seed found.");
  });
});
