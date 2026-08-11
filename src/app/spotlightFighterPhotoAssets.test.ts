import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const spotlight = readFileSync("src/features/picks/MainEventSpotlight.tsx", "utf8");

describe("Fight Spotlight fighter photo assets", () => {
  it("reserves -spotlight files for Spotlight without replacing profile or thumbnail assets", () => {
    expect(spotlight).toContain("const spotlightPhotoBySlug = new Map(");
    expect(spotlight).toContain("/-spotlight\\.(webp|png|jpe?g)$/i");
    expect(spotlight).toContain('.replace(/-spotlight$/i, "")');
    expect(spotlight).toContain("!/-(?:thumb|spotlight)\\.(webp|png|jpe?g)$/i");
  });

  it("prefers the dedicated Spotlight photo while preserving the existing profile and thumbnail chain", () => {
    const spotlightIndex = spotlight.indexOf("spotlightPhotoBySlug.get(slug)");
    const profileIndex = spotlight.indexOf("profilePhotoBySlug.get(slug)");
    const thumbnailIndex = spotlight.indexOf("fighterThumbnailPath(slug)");

    expect(spotlightIndex).toBeGreaterThan(-1);
    expect(profileIndex).toBeGreaterThan(spotlightIndex);
    expect(thumbnailIndex).toBeGreaterThan(profileIndex);
  });

  it("resolves the uploaded Garry Spotlight asset to the canonical Machado Garry fighter slug", () => {
    expect(existsSync("public/assets/fighters/ian-garry-spotlight.webp")).toBe(true);
    expect(spotlight).toContain('["ian-garry", "ian-machado-garry"]');
  });
});
