import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { brand, fighterAsset } from "../../config/brand";
import { allTime } from "./rankingModel";

const publicRoot = path.resolve(process.cwd(), "public");
const fighterDirectory = path.join(publicRoot, "assets", "fighters");

function fileHeader(filePath: string, length: number) {
  const descriptor = fs.openSync(filePath, "r");
  try {
    const buffer = Buffer.alloc(length);
    fs.readSync(descriptor, buffer, 0, length, 0);
    return buffer;
  } finally {
    fs.closeSync(descriptor);
  }
}

function expectWebP(filePath: string) {
  expect(fs.existsSync(filePath), filePath).toBe(true);
  const header = fileHeader(filePath, 12);
  expect(header.subarray(0, 4).toString("ascii")).toBe("RIFF");
  expect(header.subarray(8, 12).toString("ascii")).toBe("WEBP");
}

describe("local V2 fighter assets", () => {
  it("owns the brand logo and fighter asset base locally", () => {
    expect(brand.logoUrl).toBe("/assets/app-icon.png");
    expect(brand.fighterAssetBase).toBe("/assets/fighters");
    expect(brand.logoUrl).not.toContain("ufc-goat-rankings");

    const logoPath = path.join(publicRoot, "assets", "app-icon.png");
    expect(fs.existsSync(logoPath)).toBe(true);
    const header = fileHeader(logoPath, 4);
    expect([...header]).toEqual([0x89, 0x50, 0x4e, 0x47]);
  });

  it("reconciles all 80 ranked fighters to valid local WebP files", () => {
    expect(allTime).toHaveLength(80);
    const expectedFiles = new Set<string>();

    allTime.forEach((fighter) => {
      const expectedThumb = fighterAsset(fighter.slug, "thumb");
      const expectedProfile = fighterAsset(fighter.slug, "profile");

      expect(fighter.thumbUrl).toBe(expectedThumb);
      expect(fighter.profileUrl).toBe(expectedProfile);
      expect(fighter.thumbUrl.startsWith("/assets/fighters/")).toBe(true);
      expect(fighter.profileUrl.startsWith("/assets/fighters/")).toBe(true);
      expect(fighter.thumbUrl).not.toMatch(/^https?:\/\//i);
      expect(fighter.profileUrl).not.toMatch(/^https?:\/\//i);
      expect(fighter.thumbUrl).not.toContain("ufc-goat-rankings");
      expect(fighter.profileUrl).not.toContain("ufc-goat-rankings");

      const thumbName = `${fighter.slug}-thumb.webp`;
      const profileName = `${fighter.slug}.webp`;
      expectedFiles.add(thumbName);
      expectedFiles.add(profileName);
      expectWebP(path.join(fighterDirectory, thumbName));
      expectWebP(path.join(fighterDirectory, profileName));
    });

    const actualFiles = new Set(
      fs.readdirSync(fighterDirectory).filter((name) => name.endsWith(".webp")),
    );
    expectedFiles.forEach((name) => expect(actualFiles.has(name), name).toBe(true));
    expect(actualFiles.size).toBeGreaterThanOrEqual(160);
  });
});
