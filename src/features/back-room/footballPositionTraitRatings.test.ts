import { describe, expect, it } from "vitest";
import { BUILD_QB_TRAITS } from "../play/draftRoomContract";
import { generatedBuildQbCatalog } from "../play/generated/buildQbCatalog";
import {
  BUILD_QB_MATURE_POOL_SIZE,
  FOOTBALL_BUILD_QB_RESEARCH_SOURCES,
  FOOTBALL_POSITION_TRAIT_MODEL_VERSION,
  buildFootballBuildQbTraitProfiles,
} from "./footballPositionTraitRatings";


function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function generateBuildQbRoom(random: () => number) {
  const weighted = generatedBuildQbCatalog.map((profile) => ({
    profile,
    weightedKey: -Math.log(Math.max(0.0000001, Math.min(0.9999999, random()))) / profile.generationWeight,
  }));
  const highEnd = [...weighted]
    .filter(({ profile }) => profile.rarityBand >= 4)
    .sort((left, right) => left.weightedKey - right.weightedKey || left.profile.subjectId.localeCompare(right.profile.subjectId))
    .slice(0, 4);
  const eligible = [
    ...highEnd,
    ...weighted.filter(({ profile }) => profile.rarityBand < 4),
  ];
  return eligible
    .sort((left, right) => left.weightedKey - right.weightedKey || left.profile.subjectId.localeCompare(right.profile.subjectId))
    .slice(0, 10)
    .map(({ profile }) => profile);
}

function shuffle<T>(values: readonly T[], random: () => number) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [result[index], result[swap]] = [result[swap]!, result[index]!];
  }
  return result;
}

function randomCompletedBuildScore(
  room: readonly (typeof generatedBuildQbCatalog)[number][],
  random: () => number,
) {
  const selected = shuffle(room, random).slice(0, 5);
  const traits = shuffle(BUILD_QB_TRAITS, random);
  return Math.round(
    selected.reduce((sum, profile, index) => sum + profile.traits[traits[index]!], 0)
      / BUILD_QB_TRAITS.length,
  );
}

describe("canonical Football Build a QB trait model", () => {
  it("derives exactly 60 playable profiles from canonical Football owners", () => {
    const profiles = buildFootballBuildQbTraitProfiles();
    expect(FOOTBALL_POSITION_TRAIT_MODEL_VERSION).toBe("build-qb-v2");
    expect(profiles).toHaveLength(BUILD_QB_MATURE_POOL_SIZE);
    expect(new Set(profiles.map((profile) => profile.subjectId)).size).toBe(BUILD_QB_MATURE_POOL_SIZE);
    expect(new Set(profiles.map((profile) => profile.name)).size).toBe(BUILD_QB_MATURE_POOL_SIZE);

    const bands = Object.fromEntries(
      ["marquee", "strong", "core", "lower", "wildcard"].map((band) => [
        band,
        profiles.filter((profile) => profile.qualityBand === band).length,
      ]),
    );
    expect(bands).toEqual({ marquee: 10, strong: 14, core: 18, lower: 10, wildcard: 8 });
  });

  it("keeps every grade calculated, bounded and evidence-backed", () => {
    expect(FOOTBALL_BUILD_QB_RESEARCH_SOURCES.length).toBeGreaterThanOrEqual(8);
    expect(new Set(FOOTBALL_BUILD_QB_RESEARCH_SOURCES.map((source) => source.evidenceType)).size).toBeGreaterThanOrEqual(4);
    for (const profile of buildFootballBuildQbTraitProfiles()) {
      expect(profile.evidenceMetricIds.length).toBeGreaterThanOrEqual(6);
      expect(profile.overall).toBe(
        Math.round(BUILD_QB_TRAITS.reduce((sum, trait) => sum + profile.traits[trait], 0) / BUILD_QB_TRAITS.length),
      );
      for (const trait of BUILD_QB_TRAITS) {
        expect(profile.traits[trait]).toBeGreaterThanOrEqual(59);
        expect(profile.traits[trait]).toBeLessThanOrEqual(99);
      }
    }
  });

  it("keeps subject quality independent from trait ceiling", () => {
    const nonPremium = buildFootballBuildQbTraitProfiles()
      .filter((profile) => profile.qualityBand === "lower" || profile.qualityBand === "wildcard");
    const specialistTraits = new Set(
      nonPremium.flatMap((profile) =>
        BUILD_QB_TRAITS.filter((trait) => profile.traits[trait] >= 90),
      ),
    );
    expect(nonPremium.some((profile) => Math.max(...BUILD_QB_TRAITS.map((trait) => profile.traits[trait])) >= 92)).toBe(true);
    expect(specialistTraits.size).toBeGreaterThanOrEqual(2);

    const cutler = nonPremium.find((profile) => profile.name === "Jay Cutler");
    expect(cutler).toBeDefined();
    expect(cutler!.traits.Arm).toBeGreaterThanOrEqual(92);
    expect(cutler!.traits.Arm - cutler!.traits.Processing).toBeGreaterThanOrEqual(8);
  });

  it("simulates 5,000 rooms with bounded star frequency, usable strength and replay diversity", () => {
    const random = seededRandom(12092026);
    const marqueeCounts: number[] = [];
    const highEndCounts: number[] = [];
    const roomAverages: number[] = [];
    const signatures = new Set<string>();

    for (let iteration = 0; iteration < 5_000; iteration += 1) {
      const room = generateBuildQbRoom(random);
      expect(room).toHaveLength(10);
      expect(new Set(room.map((profile) => profile.subjectId)).size).toBe(10);
      marqueeCounts.push(room.filter((profile) => profile.qualityBand === "marquee").length);
      highEndCounts.push(room.filter((profile) => profile.rarityBand >= 4).length);
      roomAverages.push(room.reduce((sum, profile) => sum + profile.overall, 0) / room.length);
      signatures.add(room.map((profile) => profile.subjectId).sort().join("|"));
    }

    const averageMarquee = marqueeCounts.reduce((sum, value) => sum + value, 0) / marqueeCounts.length;
    const averageHighEnd = highEndCounts.reduce((sum, value) => sum + value, 0) / highEndCounts.length;
    expect(averageMarquee).toBeGreaterThan(0.15);
    expect(averageMarquee).toBeLessThan(0.8);
    expect(marqueeCounts.filter((value) => value <= 1).length / marqueeCounts.length).toBeGreaterThan(0.85);
    expect(Math.max(...highEndCounts)).toBeLessThanOrEqual(4);
    expect(averageHighEnd).toBeGreaterThan(1.4);
    expect(averageHighEnd).toBeLessThan(3.2);
    expect(Math.min(...roomAverages)).toBeGreaterThanOrEqual(70);
    expect(signatures.size).toBeGreaterThan(4_000);
  });

  it("simulates completed builds with real 70s, a broad 80s band and rare near-ceiling scores", () => {
    const random = seededRandom(5122026);
    const scores: number[] = [];

    for (let iteration = 0; iteration < 10_000; iteration += 1) {
      const room = generateBuildQbRoom(random);
      scores.push(randomCompletedBuildScore(room, random));
      scores.push(randomCompletedBuildScore(room, random));
    }

    const share = (minimum: number, maximum: number) =>
      scores.filter((score) => score >= minimum && score <= maximum).length / scores.length;

    expect(scores.some((score) => score >= 70 && score <= 79)).toBe(true);
    expect(scores.some((score) => score >= 80 && score <= 89)).toBe(true);
    expect(scores.some((score) => score >= 90)).toBe(true);
    expect(share(70, 79)).toBeGreaterThan(0.12);
    expect(share(80, 89)).toBeGreaterThan(0.35);
    expect(share(90, 100)).toBeLessThan(0.35);
    expect(scores.filter((score) => score >= 95).length / scores.length).toBeLessThan(0.05);
  });

  it("keeps the generated deployment view synchronized while the audit is being frozen", () => {
    const actual = buildFootballBuildQbTraitProfiles().map((profile) => ({
      subjectId: profile.subjectId,
      displayName: profile.name,
      qualityBand: profile.qualityBand,
      generationClass: profile.generationClass,
      generationWeight: profile.generationWeight,
      rarityBand: profile.rarityBand,
      overall: profile.overall,
      traits: profile.traits,
    }));
    expect(actual).toEqual(generatedBuildQbCatalog);
    console.log("BUILD_QB_CATALOG_DUMP=" + JSON.stringify(actual));
  });
});
