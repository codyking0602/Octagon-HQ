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
  return [...highEnd, ...weighted.filter(({ profile }) => profile.rarityBand < 4)]
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

function randomCompletedBuildScore(room: readonly (typeof generatedBuildQbCatalog)[number][], random: () => number) {
  const selected = shuffle(room, random).slice(0, BUILD_QB_TRAITS.length);
  const traits = shuffle(BUILD_QB_TRAITS, random);
  return Math.round(selected.reduce((sum, profile, index) => sum + profile.traits[traits[index]!], 0) / BUILD_QB_TRAITS.length);
}

describe("canonical Football Build a QB trait model", () => {
  it("derives exactly 60 playable profiles from canonical Football owners", () => {
    const profiles = buildFootballBuildQbTraitProfiles();
    expect(FOOTBALL_POSITION_TRAIT_MODEL_VERSION).toBe("build-qb-v3");
    expect(profiles).toHaveLength(BUILD_QB_MATURE_POOL_SIZE);
    expect(new Set(profiles.map((profile) => profile.subjectId)).size).toBe(BUILD_QB_MATURE_POOL_SIZE);
    expect(new Set(profiles.map((profile) => profile.name)).size).toBe(BUILD_QB_MATURE_POOL_SIZE);
    expect(BUILD_QB_TRAITS).toEqual(["Arm", "Accuracy", "Processing", "Mobility"]);
    for (const profile of profiles) {
      expect(Object.keys(profile.traits).sort()).toEqual([...BUILD_QB_TRAITS].sort());
      expect(profile.overall).toBe(Math.round(BUILD_QB_TRAITS.reduce((sum, trait) => sum + profile.traits[trait], 0) / BUILD_QB_TRAITS.length));
    }
    const bands = Object.fromEntries(["marquee", "strong", "core", "lower", "wildcard"].map((band) => [band, profiles.filter((profile) => profile.qualityBand === band).length]));
    expect(bands).toEqual({ marquee: 10, strong: 14, core: 18, lower: 10, wildcard: 8 });
  });

  it("keeps every playable grade bounded and evidence-backed", () => {
    expect(FOOTBALL_BUILD_QB_RESEARCH_SOURCES.length).toBeGreaterThanOrEqual(8);
    expect(new Set(FOOTBALL_BUILD_QB_RESEARCH_SOURCES.map((source) => source.evidenceType)).size).toBeGreaterThanOrEqual(4);
    for (const profile of buildFootballBuildQbTraitProfiles()) {
      expect(profile.evidenceMetricIds.length).toBeGreaterThanOrEqual(3);
      for (const trait of BUILD_QB_TRAITS) {
        expect(profile.traits[trait]).toBeGreaterThanOrEqual(35);
        expect(profile.traits[trait]).toBeLessThanOrEqual(99);
      }
    }
  });

  it("keeps trait leadership category-specific and lower-tier specialists meaningful", () => {
    const profiles = buildFootballBuildQbTraitProfiles();
    const leaderSignatures = new Set(BUILD_QB_TRAITS.map((trait) => {
      const maximum = Math.max(...profiles.map((profile) => profile.traits[trait]));
      return profiles.filter((profile) => profile.traits[trait] === maximum).map((profile) => profile.subjectId).sort().join("|");
    }));
    expect(leaderSignatures.size).toBeGreaterThanOrEqual(3);
    const nonPremium = profiles.filter((profile) => profile.qualityBand === "lower" || profile.qualityBand === "wildcard");
    const specialistTraits = new Set(nonPremium.flatMap((profile) => BUILD_QB_TRAITS.filter((trait) => profile.traits[trait] >= 90)));
    expect(specialistTraits.size).toBeGreaterThanOrEqual(3);
    expect(nonPremium.filter((profile) => Math.max(...BUILD_QB_TRAITS.map((trait) => profile.traits[trait])) >= 92).length).toBeGreaterThanOrEqual(6);
    const cutler = nonPremium.find((profile) => profile.name === "Jay Cutler")!;
    expect(cutler.traits.Arm).toBeGreaterThanOrEqual(92);
    expect(cutler.traits.Arm - cutler.traits.Processing).toBeGreaterThanOrEqual(8);
  });

  it("uses the approved modernized 60-QB membership without retired roster cuts", () => {
    const names = new Set(buildFootballBuildQbTraitProfiles().map((profile) => profile.name));
    for (const name of ["Trevor Lawrence", "Tua Tagovailoa", "C.J. Stroud", "Brock Purdy", "Jordan Love", "Jayden Daniels", "Derek Carr", "Ryan Tannehill", "Nick Foles", "Carson Wentz", "Jimmy Garoppolo"]) {
      expect(names.has(name), `missing approved NFL replacement ${name}`).toBe(true);
    }
    for (const name of ["Johnny Unitas", "Bob Griese", "Dan Fouts", "Trent Green", "Ken Anderson", "Ken Stabler", "Sonny Jurgensen", "Len Dawson", "Rich Gannon", "Mark Brunell", "Matt Schaub"]) {
      expect(names.has(name), `retired NFL roster cut still present: ${name}`).toBe(false);
    }
  });

  it("simulates 5,000 rooms with bounded star frequency, specialists and replay diversity", () => {
    const random = seededRandom(12092026);
    const marqueeCounts: number[] = [];
    const signatures = new Set<string>();
    let specialistRooms = 0;
    for (let iteration = 0; iteration < 5_000; iteration += 1) {
      const room = generateBuildQbRoom(random);
      expect(room).toHaveLength(10);
      expect(new Set(room.map((profile) => profile.subjectId)).size).toBe(10);
      marqueeCounts.push(room.filter((profile) => profile.qualityBand === "marquee").length);
      signatures.add(room.map((profile) => profile.subjectId).sort().join("|"));
      if (room.some((profile) => profile.rarityBand <= 2 && Math.max(...BUILD_QB_TRAITS.map((trait) => profile.traits[trait])) >= 90)) specialistRooms += 1;
    }
    const averageMarquee = marqueeCounts.reduce((sum, value) => sum + value, 0) / marqueeCounts.length;
    expect(averageMarquee).toBeGreaterThan(0.15);
    expect(averageMarquee).toBeLessThan(0.8);
    expect(marqueeCounts.filter((value) => value <= 1).length / marqueeCounts.length).toBeGreaterThan(0.85);
    expect(signatures.size).toBeGreaterThan(4_000);
    expect(specialistRooms / 5_000).toBeGreaterThan(0.8);
  });

  it("simulates finite competitive four-part build scores", () => {
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
    expect(scores.every(Number.isFinite)).toBe(true);
    expect(Math.min(...scores)).toBeLessThan(80);
    expect(scores.filter((score) => score >= 80 && score < 90).length).toBeGreaterThan(scores.filter((score) => score >= 90).length);
    expect(scores.filter((score) => score >= 90).length).toBeGreaterThan(0);
    expect(scores.filter((score) => score >= 97).length / scores.length).toBeLessThan(0.02);
    expect(differentials.reduce((sum, value) => sum + value, 0) / differentials.length).toBeGreaterThan(3);
    expect(ties / differentials.length).toBeLessThan(0.12);
  });

  it("keeps the generated deployment view synchronized", () => {
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

  it("keeps one calculated ratings owner and legacy backend projections append-only", () => {
    const modelSource = readFileSync("src/features/back-room/footballPositionTraitRatings.ts", "utf8");
    const migration = readFileSync("supabase/migrations/202612310104_stage12_build_qb_roster_refresh.sql", "utf8");
    expect(modelSource).toContain("buildFootballComparisonCandidatePool");
    expect(modelSource).toContain("getFootballFact");
    expect(modelSource).toContain("getNflQbHistoricalConsensus");
    expect(modelSource).toContain("BUILD_QB_RESEARCH_AUDIT");
    expect(modelSource).toContain("RESEARCH_LEVEL_RATING");
    expect(modelSource).toContain("researchTraitRatings");
    expect(modelSource).not.toContain("AUDITED_QB_PROFILES");
    expect(migration).toContain("football-draft-room-2026-09-v4");
    expect(migration).not.toContain("create or replace function private.generate_auction_deck");
    const catalogLines = migration.split("\n").filter((line) => line.includes("'football-draft-room-2026-09-v4','build-qb'"));
    expect(catalogLines).toHaveLength(11);
    for (const name of ["Trevor Lawrence", "Tua Tagovailoa", "C.J. Stroud", "Brock Purdy", "Jordan Love", "Jayden Daniels", "Derek Carr", "Ryan Tannehill", "Nick Foles", "Carson Wentz", "Jimmy Garoppolo"]) {
      const row = generatedBuildQbCatalog.find((candidate) => candidate.displayName === name)!;
      const line = catalogLines.find((candidate) => candidate.includes(`'${row.displayName}'`));
      expect(line, `missing backend replacement projection for ${row.displayName}`).toBeDefined();
      for (const trait of BUILD_QB_TRAITS) expect(line).toContain(`'${trait}',${row.traits[trait]}`);
    }
  });
});