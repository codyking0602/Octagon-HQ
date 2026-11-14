import { existsSync, readFileSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { canonicalRankingInputs } from "../rankings/data/rankingInputs";
import { UFC_HOME_PORTRAIT_SLUGS } from "./ufcHomePortraitSlugs";

type PortraitRegistry = {
  rankedTotal: number;
  sources: Record<string, {
    name: string;
    espnName: string;
    espnId: string;
    url: string;
    sourceDimensions: number[];
  }>;
  blocked: { name: string; slug: string; reason: string }[];
};
const manifest = JSON.parse(
  readFileSync("src/features/home/ufcHomeEspnSources.json", "utf8"),
) as PortraitRegistry;

function dimensions(file: Buffer) {
  const type = file.toString("ascii", 12, 16);
  if (type === "VP8X") {
    return [1 + file.readUIntLE(24, 3), 1 + file.readUIntLE(27, 3)];
  }
  if (type === "VP8 ") {
    return [file.readUInt16LE(26) & 0x3fff, file.readUInt16LE(28) & 0x3fff];
  }
  if (type === "VP8L") {
    const encoded = file.readUInt32LE(21);
    return [1 + (encoded & 0x3fff), 1 + ((encoded >> 14) & 0x3fff)];
  }
  throw new Error("Unknown WebP codec " + type);
}

describe("UFC Home portraits from independently sourced ESPN originals", () => {
  it("preserves the first three owner-approved source IDs and forbids thumbnail upscaling", () => {
    const original = readFileSync("scripts/generate-ufc-home-from-espn.py", "utf8");
    for (const id of ["4426000.png", "4332765.png", "2516131.png"]) {
      expect(original).toContain(id);
    }
    expect(original).toContain("Source was a thumbnail, not a genuine source");
    expect(existsSync("scripts/generate-ufc-home-portrait-proofs.py")).toBe(false);
    const expanded = readFileSync("scripts/generate-ufc-home-ranked-espn.py", "utf8");
    expect(expanded).toContain("no exact verified");
    expect(expanded).not.toContain("DnnSuperResImpl");
  });

  it("covers every canonical HQ-ranked fighter with an official photo or documented fallback", () => {
    const fighters = new Map(canonicalRankingInputs.fighters.map((f) =>
      [f.presentation.slug, f.fighter],
    ));
    const sourceSlugs = Object.keys(manifest.sources);
    const blockedSlugs = manifest.blocked.map((x) => x.slug);
    expect(manifest.rankedTotal).toBe(fighters.size);
    expect([...sourceSlugs].sort()).toEqual([...UFC_HOME_PORTRAIT_SLUGS].sort());
    expect(sourceSlugs.length).toBeGreaterThan(35);
    expect(new Set([...sourceSlugs, ...blockedSlugs])).toEqual(new Set(fighters.keys()));
    expect(new Set(sourceSlugs).size).toBe(sourceSlugs.length);
    expect(new Set(blockedSlugs).size).toBe(blockedSlugs.length);
    expect(sourceSlugs.filter((x) => blockedSlugs.includes(x))).toEqual([]);
    for (const missing of manifest.blocked) {
      expect(missing.name).toBe(fighters.get(missing.slug));
      expect(missing.reason.length).toBeGreaterThan(8);
    }
  });

  it.each(Object.keys(manifest.sources))(
    "%s ships a genuine ESPN-source 640x640 Home-only WebP and preserves its compact thumb",
    (slug) => {
      const path = "public/assets/fighters/" + slug;
      const source = manifest.sources[slug];
      const fighter = canonicalRankingInputs.fighters.find((f) => f.presentation.slug === slug);
      expect(source.name).toBe(fighter?.fighter);
      expect(source.url).toBe(
        "https://a.espncdn.com/i/headshots/mma/players/full/" + source.espnId + ".png",
      );
      expect(source.sourceDimensions[0]).toBeGreaterThanOrEqual(550);
      expect(source.sourceDimensions[1]).toBeGreaterThanOrEqual(400);
      const home = readFileSync(path + ".home.webp");
      const thumb = readFileSync(path + "-thumb.webp");
      for (const image of [home, thumb]) {
        expect(image.toString("ascii", 0, 4)).toBe("RIFF");
        expect(image.toString("ascii", 8, 12)).toBe("WEBP");
      }
      expect(dimensions(home)).toEqual([640, 640]);
      expect(dimensions(thumb)).toEqual([160, 160]);
      expect(home.byteLength).toBeGreaterThan(12000);
      expect(home.byteLength).toBeLessThan(250_000);
      expect(statSync(path + ".home.webp").size).toBe(home.byteLength);
    },
  );
});
