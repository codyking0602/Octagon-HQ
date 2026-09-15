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


  it("wires the current UFC 331 missing thumbnail and Spotlight portraits without changing Spotlight ownership", () => {
    const thumbnails = readFileSync("src/features/picks/FighterThumbnail.tsx", "utf8");
    expect(thumbnails).toContain('["ryan-gandra", "https://a.espncdn.com/i/headshots/mma/players/full/5291085.png"]');
    expect(thumbnails).toContain('["ozzy-diaz", "https://a.espncdn.com/i/headshots/mma/players/full/4944080.png"]');
    expect(spotlight).toContain('["gable-steveson", "https://gidstats.com/img/fighters/0/0/1-3231.png"]');
    expect(spotlight).toContain('["sean-sharaf", "https://gidstats.com/img/fighters/0/0/1-2418.png"]');
  });

  it("ships dedicated Spotlight cutouts for the Sacramento main event", () => {
    expect(existsSync("public/assets/fighters/anthony-hernandez-spotlight.webp")).toBe(true);
    expect(existsSync("public/assets/fighters/gregory-rodrigues-spotlight.webp")).toBe(true);
  });
});
