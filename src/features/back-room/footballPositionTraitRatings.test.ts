import { readFileSync } from "node:fs";
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
    for (const profile of profiles) {
      expect(Object.keys(profile.traits).sort()).toEqual([...BUILD_QB_TRAITS].sort());
    }

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
    const profiles = buildFootballBuildQbTraitProfiles();
    expect(profiles.some((profile) => profile.evidenceMetricIds.length < 6)).toBe(true);
    for (const profile of profiles) {
      expect(profile.evidenceMetricIds.length).toBeGreaterThanOrEqual(3);
      expect(profile.overall).toBe(
        Math.round(BUILD_QB_TRAITS.reduce((sum, trait) => sum + profile.traits[trait], 0) / BUILD_QB_TRAITS.length),
      );
      for (const trait of BUILD_QB_TRAITS) {
        expect(profile.traits[trait]).toBeGreaterThanOrEqual(35);
        expect(profile.traits[trait]).toBeLessThanOrEqual(99);
      }
    }
  });

  it("keeps trait leadership category-specific and preserves the original Stage 12 core", () => {
    const profiles = buildFootballBuildQbTraitProfiles();
    const leaderSignatures = new Set(
      BUILD_QB_TRAITS.map((trait) => {
        const maximum = Math.max(...profiles.map((profile) => profile.traits[trait]));
        return profiles
          .filter((profile) => profile.traits[trait] === maximum)
          .map((profile) => profile.subjectId)
          .sort()
          .join("|");
      }),
    );
    expect(leaderSignatures.size).toBeGreaterThanOrEqual(3);
    expect(
      profiles.some((profile) => BUILD_QB_TRAITS.every((trait) => (
        profile.traits[trait] === Math.max(...profiles.map((candidate) => candidate.traits[trait]))
      ))),
    ).toBe(false);

    const names = new Set(profiles.map((profile) => profile.name));
    for (const name of [
      "Patrick Mahomes",
      "Aaron Rodgers",
      "Lamar Jackson",
      "Joe Burrow",
      "Drew Brees",
      "Tom Brady",
      "Josh Allen",
      "Matt Ryan",
      "Matthew Stafford",
      "Philip Rivers",
      "Andrew Luck",
      "Ben Roethlisberger",
      "Cam Newton",
      "Jay Cutler",
      "Eli Manning",
    ]) {
      expect(names.has(name), `missing original Stage 12 QB ${name}`).toBe(true);
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
    expect(specialistTraits.size).toBeGreaterThanOrEqual(3);
    expect(nonPremium.filter((profile) => Math.max(...BUILD_QB_TRAITS.map((trait) => profile.traits[trait])) >= 92).length)
      .toBeGreaterThanOrEqual(6);

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
    const appearances = new Map(generatedBuildQbCatalog.map((profile) => [profile.subjectId, 0]));
    let specialistRooms = 0;

    for (let iteration = 0; iteration < 5_000; iteration += 1) {
      const room = generateBuildQbRoom(random);
      expect(room).toHaveLength(10);
      expect(new Set(room.map((profile) => profile.subjectId)).size).toBe(10);
      marqueeCounts.push(room.filter((profile) => profile.qualityBand === "marquee").length);
      highEndCounts.push(room.filter((profile) => profile.rarityBand >= 4).length);
      roomAverages.push(room.reduce((sum, profile) => sum + profile.overall, 0) / room.length);
      signatures.add(room.map((profile) => profile.subjectId).sort().join("|"));
      if (room.some((profile) => profile.rarityBand <= 2 && Math.max(...BUILD_QB_TRAITS.map((trait) => profile.traits[trait])) >= 90)) {
        specialistRooms += 1;
      }
      for (const profile of room) appearances.set(profile.subjectId, (appearances.get(profile.subjectId) ?? 0) + 1);
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
    expect(specialistRooms / 5_000).toBeGreaterThan(0.8);
    expect(Math.min(...appearances.values())).toBeGreaterThan(100);
  });

  it("simulates completed builds with real 70s, a broad 80s band and rare near-ceiling scores", () => {
    const random = seededRandom(5122026);
    const scores: number[] = [];
    const differentials: number[] = [];
    let ties = 0;

    for (let iteration = 0; iteration < 10_000; iteration += 1) {
      const room = generateBuildQbRoom(random);
      const challenger = randomCompletedBuildScore(room, random);
      const recipient = randomCompletedBuildScore(room, random);
      scores.push(challenger, recipient);
      differentials.push(Math.abs(challenger - recipient));
      if (challenger === recipient) ties += 1;
    }

    const share = (minimum: number, maximum: number) =>
      scores.filter((score) => score >= minimum && score <= maximum).length / scores.length;
    const sorted = [...scores].sort((left, right) => left - right);
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const median = sorted[Math.floor(sorted.length / 2)]!;
    const lowerTail = sorted[Math.floor(sorted.length * 0.10)]!;
    const upperTail = sorted[Math.floor(sorted.length * 0.90)]!;
    const averageDifferential = differentials.reduce((sum, value) => sum + value, 0) / differentials.length;

    expect(mean).toBeGreaterThan(80);
    expect(mean).toBeLessThan(86);
    expect(median).toBeGreaterThanOrEqual(81);
    expect(median).toBeLessThanOrEqual(85);
    expect(lowerTail).toBeLessThanOrEqual(78);
    expect(upperTail).toBeGreaterThanOrEqual(89);
    expect(share(70, 79)).toBeGreaterThan(0.12);
    expect(share(80, 89)).toBeGreaterThan(0.35);
    expect(share(90, 99)).toBeGreaterThan(0.05);
    expect(share(90, 99)).toBeLessThan(0.25);
    expect(share(97, 99)).toBeLessThan(0.01);
    expect(averageDifferential).toBeGreaterThan(4);
    expect(averageDifferential).toBeLessThan(9);
    expect(ties / differentials.length).toBeLessThan(0.10);
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
  });
  it("keeps one calculated ratings owner and synchronizes the append-only backend projection", () => {
    const modelSource = readFileSync("src/features/back-room/footballPositionTraitRatings.ts", "utf8");
    const migration = readFileSync(
      "supabase/migrations/202612310102_stage12_build_qb_competitive_model.sql",
      "utf8",
    );

    expect(modelSource).toContain("buildFootballComparisonCandidatePool");
    expect(modelSource).toContain("getFootballFact");
    expect(modelSource).toContain("getNflQbHistoricalConsensus");
    expect(modelSource).toContain("BUILD_QB_RESEARCH_AUDIT");
    expect(modelSource).toContain("RESEARCH_LEVEL_RATING");
    expect(modelSource).toContain("researchTraitRatings");
    expect(modelSource).toContain("candidateById");
    expect(modelSource).not.toContain("normalizedSurname");
    expect(modelSource).not.toContain("candidatesByName");
    expect(modelSource).not.toContain("AUDITED_QB_PROFILES");

    expect(migration).toContain("football-draft-room-2026-09-v2");
    expect(migration).toContain("football-draft-room-rarity-2026-09-v2");
    expect(migration).toContain("football-build-qb-traits-2026-09-v1");
    expect(migration).not.toContain("football-build-qb-traits-2026-09-v2");
    expect(migration).not.toContain("create or replace function private.generate_auction_deck");

    const catalogLines = migration
      .split("\n")
      .filter((line) => line.includes("'football-draft-room-2026-09-v2','build-qb'"));
    expect(catalogLines).toHaveLength(BUILD_QB_MATURE_POOL_SIZE);

    for (const row of generatedBuildQbCatalog) {
      const line = catalogLines.find((candidate) => candidate.includes(`'${row.displayName}'`));
      expect(line, `missing backend projection for ${row.displayName}`).toBeDefined();
      expect(line).toContain(`,${row.rarityBand},`);
      expect(line).toContain(`,${row.generationWeight.toFixed(2)},`);
      for (const trait of BUILD_QB_TRAITS) {
        expect(line).toContain(`'${trait}',${row.traits[trait]}`);
      }
      expect(line).toContain(`'overall',${row.overall}`);
    }
  });

});
