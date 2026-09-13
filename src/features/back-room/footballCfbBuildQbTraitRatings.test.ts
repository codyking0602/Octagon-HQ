import { describe, expect, it } from "vitest";
import { BUILD_QB_TRAITS, draftRoomModeDefinition } from "../play/draftRoomContract";
import {
  CFB_BUILD_QB_GENERATION_WEIGHT_BY_RARITY,
  CFB_BUILD_QB_MATURE_POOL_SIZE,
  buildFootballCfbBuildQbTraitProfiles,
  cfbBuildQbProfileForItemReference,
} from "./footballCfbBuildQbTraitRatings";

describe("CFB Build a QB peak-season model", () => {
  const profiles = buildFootballCfbBuildQbTraitProfiles();

  it("locks an 80-QB pool to one exact peak college season and school per player", () => {
    expect(profiles).toHaveLength(CFB_BUILD_QB_MATURE_POOL_SIZE);
    expect(new Set(profiles.map((profile) => profile.canonicalPlayerId)).size).toBe(80);
    expect(new Set(profiles.map((profile) => profile.peakSeasonIdentityId)).size).toBe(80);
    expect(profiles.every((profile) => Number.isInteger(profile.peakSeason) && profile.school.length > 0)).toBe(true);
  });

  it("uses the same five traits and a calculated overall", () => {
    expect(draftRoomModeDefinition("build-qb-cfb").categories).toEqual(BUILD_QB_TRAITS);
    for (const profile of profiles) {
      expect(Object.keys(profile.traits)).toEqual(BUILD_QB_TRAITS);
      expect(profile.overall).toBe(Math.round(BUILD_QB_TRAITS.reduce((sum, trait) => sum + profile.traits[trait], 0) / 5));
    }
  });

  it("pins transfer identities to the selected peak-season school", () => {
    const hurts = profiles.find((profile) => profile.name === "Jalen Hurts");
    expect(hurts).toMatchObject({
      peakSeason: 2019,
      school: "Oklahoma",
      canonicalPlayerId: "cfbfast-r-player-4040715-jalen-hurts",
    });
    expect(hurts?.peakSeasonIdentityId).toContain("@2019:oklahoma");
  });

  it("keeps item identity exact instead of inferring from rendered player names", () => {
    const burrow = profiles.find((profile) => profile.name === "Joe Burrow")!;
    expect(cfbBuildQbProfileForItemReference(burrow.catalogId)?.school).toBe("LSU");
    expect(cfbBuildQbProfileForItemReference("Joe Burrow")).toBeNull();
  });

  it("keeps rarity separate from trait ceilings so lower and wildcard specialists matter", () => {
    const lowSpecialists = profiles.filter((profile) => profile.qualityBand <= 2 && BUILD_QB_TRAITS.some((trait) => profile.traits[trait] === 99));
    expect(lowSpecialists.length).toBeGreaterThanOrEqual(8);
    expect(profiles.find((profile) => profile.name === "Josh Allen")?.traits.Arm).toBe(99);
    expect(profiles.find((profile) => profile.name === "Malik Willis")?.traits.Mobility).toBe(99);
    expect(profiles.some((profile) => BUILD_QB_TRAITS.every((trait) => profile.traits[trait] === 99))).toBe(false);
  });

  it("matches the audited rarity mix and keeps marquee generation genuinely uncommon", () => {
    const counts = Object.fromEntries([1,2,3,4,5].map((band) => [band, profiles.filter((profile) => profile.qualityBand === band).length]));
    expect(counts).toEqual({1:11,2:13,3:24,4:19,5:13});

    const weighted = profiles.reduce((sum, profile) => sum + profile.generationWeight, 0);
    const marqueeShare = profiles.filter((profile) => profile.qualityBand === 5)
      .reduce((sum, profile) => sum + profile.generationWeight, 0) / weighted;
    expect(marqueeShare).toBeLessThan(0.04);
    expect(CFB_BUILD_QB_GENERATION_WEIGHT_BY_RARITY[5]).toBeLessThan(CFB_BUILD_QB_GENERATION_WEIGHT_BY_RARITY[3]);
  });
});
