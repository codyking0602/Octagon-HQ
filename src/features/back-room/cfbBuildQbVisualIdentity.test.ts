import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  CFB_BUILD_QB_HERO_IMAGE,
  CFB_BUILD_QB_SCHOOL_BY_ITEM_REFERENCE,
  cfbBuildQbVisualIdentity,
} from "./cfbBuildQbVisualIdentity";
import { buildFootballCfbBuildQbTraitProfiles } from "./footballCfbBuildQbTraitRatings";

describe("CFB Build a QB visual identity", () => {
  const profiles = buildFootballCfbBuildQbTraitProfiles();

  it("covers every mature catalog item through exact item references", () => {
    const references = profiles.map((profile) => profile.catalogId).sort();
    expect(Object.keys(CFB_BUILD_QB_SCHOOL_BY_ITEM_REFERENCE).sort()).toEqual(references);
    expect(references.every((reference) => {
      const identity = cfbBuildQbVisualIdentity(reference);
      return identity?.logoSrc && identity.primary.startsWith("#") && identity.secondary.startsWith("#");
    })).toBe(true);
    expect(cfbBuildQbVisualIdentity("Joe Burrow")).toBeNull();
  });

  it("uses the exact selected peak-season school for transfers", () => {
    const hurts = profiles.find((profile) => profile.name === "Jalen Hurts")!;
    expect(CFB_BUILD_QB_SCHOOL_BY_ITEM_REFERENCE[hurts.catalogId]).toBe("Oklahoma");
    expect(cfbBuildQbVisualIdentity(hurts.catalogId)?.teamName).toBe("Oklahoma · 2019");
  });

  it("ships the dedicated Trevor Lawrence Clemson hero asset", () => {
    expect(CFB_BUILD_QB_HERO_IMAGE).toBe("/assets/football/build-qb-trevor-lawrence-clemson-hero.webp");
    expect(existsSync("public/assets/football/build-qb-trevor-lawrence-clemson-hero.webp")).toBe(true);
  });
});
