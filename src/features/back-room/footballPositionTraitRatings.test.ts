import { describe, expect, it } from "vitest";
import { BUILD_QB_TRAITS } from "../play/draftRoomContract";
import { generatedBuildQbCatalog } from "../play/generated/buildQbCatalog";
import {
  BUILD_QB_MATURE_POOL_SIZE,
  FOOTBALL_BUILD_QB_RESEARCH_SOURCES,
  FOOTBALL_POSITION_TRAIT_MODEL_VERSION,
  buildFootballBuildQbTraitProfiles,
} from "./footballPositionTraitRatings";

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
