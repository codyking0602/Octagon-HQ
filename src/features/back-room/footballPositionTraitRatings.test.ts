import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BUILD_QB_TRAITS } from "../play/draftRoomContract";
import {
  FOOTBALL_BUILD_QB_CATALOG_VERSION,
  FOOTBALL_BUILD_QB_RARITY_VERSION,
  generatedBuildQbCatalog,
} from "../play/generated/buildQbCatalog";
import {
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

function generateRoom(random: () => number) {
  const candidates = generatedBuildQbCatalog.map((profile) => ({
    profile,
    weightedKey: -Math.log(Math.max(0.0000001, Math.min(0.9999999, random()))) / profile.generationWeight,
  }));
  const highEnd = candidates
    .filter(({ profile }) => profile.rarityBand >= 4)
    .sort((left, right) => left.weightedKey - right.weightedKey || left.profile.catalogId.localeCompare(right.profile.catalogId))
    .slice(0, 4);
  const lower = candidates.filter(({ profile }) => profile.rarityBand < 4);
  return [...highEnd, ...lower]
    .sort((left, right) => left.weightedKey - right.weightedKey || left.profile.catalogId.localeCompare(right.profile.catalogId))
    .slice(0, 10)
    .map(({ profile }) => profile);
}

function randomBuildScore(room: readonly (typeof generatedBuildQbCatalog)[number][], random: () => number) {
  const shuffled = [...room].sort(() => random() - 0.5).slice(0, 5);
  const traitOrder = [...BUILD_QB_TRAITS].sort(() => random() - 0.5);
  return Math.round(
    shuffled.reduce((sum, profile, index) => sum + profile.traits[traitOrder[index]!], 0)
      / BUILD_QB_TRAITS.length,
  );
}

describe("canonical Football Build a QB trait model", () => {
  it("derives the mature 60-QB catalog from canonical Football identities and the audited research model", () => {
    const profiles = buildFootballBuildQbTraitProfiles();
    expect(FOOTBALL_POSITION_TRAIT_MODEL_VERSION).toBe("build-qb-v2");
    expect(FOOTBALL_BUILD_QB_CATALOG_VERSION).toBe("football-draft-room-2026-09-v2");
    expect(FOOTBALL_BUILD_QB_RARITY_VERSION).toBe("football-draft-room-rarity-2026-09-v2");
    expect(profiles).toHaveLength(60);
    expect(new Set(profiles.map((profile) => profile.canonicalSubjectId)).size).toBe(60);
    expect(new Set(profiles.map((profile) => profile.catalogId)).size).toBe(60);

    const actual = profiles.map((profile) => ({
      catalogId: profile.catalogId,
      displayName: profile.name,
      rarityBand: profile.rarityBand,
      generationWeight: profile.generationWeight,
      overall: profile.overall,
      traits: profile.traits,
    }));

    expect(actual).toEqual(generatedBuildQbCatalog);
  });

  it("keeps every profile multi-source and every hidden trait grade bounded", () => {
    expect(FOOTBALL_BUILD_QB_RESEARCH_SOURCES.length).toBeGreaterThanOrEqual(8);
    expect(new Set(FOOTBALL_BUILD_QB_RESEARCH_SOURCES.map((source) => source.evidenceType)).size).toBeGreaterThanOrEqual(4);

    for (const profile of buildFootballBuildQbTraitProfiles()) {
      expect(profile.evidenceMetricIds.length).toBeGreaterThanOrEqual(3);
      expect(profile.historicalConsensusScore).toBeGreaterThanOrEqual(0);
      expect(profile.historicalConsensusScore).toBeLessThanOrEqual(100);
      for (const trait of BUILD_QB_TRAITS) {
        expect(profile.traits[trait]).toBeGreaterThanOrEqual(35);
        expect(profile.traits[trait]).toBeLessThanOrEqual(99);
      }
    }
  });

  it("keeps rarity separate from trait ceiling so lower-band specialists remain dangerous", () => {
    const lower = generatedBuildQbCatalog.filter((profile) => profile.rarityBand <= 2);
    const wildcards = generatedBuildQbCatalog.filter((profile) => profile.rarityBand === 1);
    expect(lower.filter((profile) => BUILD_QB_TRAITS.some((trait) => profile.traits[trait] === 99)).length).toBeGreaterThanOrEqual(6);
    expect(wildcards.filter((profile) => BUILD_QB_TRAITS.some((trait) => profile.traits[trait] === 99)).length).toBeGreaterThanOrEqual(4);

    const cutler = generatedBuildQbCatalog.find((profile) => profile.displayName === "Jay Cutler");
    expect(cutler?.rarityBand).toBe(1);
    expect(cutler?.traits.Arm).toBe(99);
    expect(cutler?.traits.Processing).toBeLessThan(cutler?.traits.Arm ?? 0);
  });

  it("simulates 5,000 shared-generator rooms with healthy star frequency, strength and replay diversity", () => {
    const random = seededRandom(12092026);
    const eliteCounts: number[] = [];
    const highEndCounts: number[] = [];
    const roomAverages: number[] = [];
    const signatures = new Set<string>();

    for (let iteration = 0; iteration < 5_000; iteration += 1) {
      const room = generateRoom(random);
      expect(room).toHaveLength(10);
      expect(new Set(room.map((profile) => profile.catalogId)).size).toBe(10);
      eliteCounts.push(room.filter((profile) => profile.rarityBand === 5).length);
      highEndCounts.push(room.filter((profile) => profile.rarityBand >= 4).length);
      roomAverages.push(room.reduce((sum, profile) => sum + profile.overall, 0) / room.length);
      signatures.add(room.map((profile) => profile.catalogId).sort().join("|"));
    }

    const eliteAverage = eliteCounts.reduce((sum, value) => sum + value, 0) / eliteCounts.length;
    const highEndAverage = highEndCounts.reduce((sum, value) => sum + value, 0) / highEndCounts.length;
    expect(eliteAverage).toBeGreaterThan(0.15);
    expect(eliteAverage).toBeLessThan(0.8);
    expect(eliteCounts.filter((value) => value <= 1).length / eliteCounts.length).toBeGreaterThan(0.85);
    expect(Math.max(...highEndCounts)).toBeLessThanOrEqual(4);
    expect(highEndAverage).toBeGreaterThan(1.4);
    expect(highEndAverage).toBeLessThan(3.2);
    expect(Math.min(...roomAverages)).toBeGreaterThanOrEqual(72);
    expect(signatures.size).toBeGreaterThan(4_000);
  });

  it("simulates completed builds with real 70s, a broad 80s band and rare near-ceiling scores", () => {
    const random = seededRandom(5122026);
    const scores: number[] = [];

    for (let iteration = 0; iteration < 10_000; iteration += 1) {
      const room = generateRoom(random);
      scores.push(randomBuildScore(room, random));
      scores.push(randomBuildScore(room, random));
    }

    const share = (minimum: number, maximum: number) =>
      scores.filter((score) => score >= minimum && score <= maximum).length / scores.length;

    expect(scores.some((score) => score >= 70 && score <= 79)).toBe(true);
    expect(scores.some((score) => score >= 80 && score <= 89)).toBe(true);
    expect(scores.some((score) => score >= 90)).toBe(true);
    expect(share(70, 79)).toBeGreaterThan(0.15);
    expect(share(80, 89)).toBeGreaterThan(0.4);
    expect(share(90, 100)).toBeLessThan(0.3);
    expect(scores.filter((score) => score >= 95).length / scores.length).toBeLessThan(0.05);
  });

  it("keeps the generated catalog synchronized into the Stage 12 competitive-model migration", () => {
    const migration = readFileSync(
      "supabase/migrations/202612310102_stage12_build_qb_competitive_model.sql",
      "utf8",
    );
    expect(migration).toContain("football-draft-room-2026-09-v2");
    expect(migration).toContain("football-draft-room-rarity-2026-09-v2");

    for (const row of generatedBuildQbCatalog) {
      expect(migration).toContain(row.catalogId);
      expect(migration).toContain(row.displayName);
      expect(migration).toContain(`,${row.rarityBand},`);
      expect(migration).toContain(`,${row.generationWeight.toFixed(2)},'qb',`);
      for (const trait of BUILD_QB_TRAITS) {
        expect(migration).toContain(`'${trait}',${row.traits[trait]}`);
      }
    }
  });
});
