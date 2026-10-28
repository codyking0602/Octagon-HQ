import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const spotlightSlugs = [
  "dan-hooker",
  "salahdine-parnasse",
  "daniil-donchenko",
  "punahele-soriano",
] as const;

function readSpotlightWebp(slug: string) {
  const path = `public/assets/fighters/${slug}-spotlight.webp`;
  expect(existsSync(path), `${path} should exist`).toBe(true);
  return readFileSync(path);
}

describe("UFC Paris Fight Spotlight assets", () => {
  it.each(spotlightSlugs)("keeps %s as an 800px transparent WebP cutout", (slug) => {
    const image = readSpotlightWebp(slug);

    expect(image.subarray(0, 4).toString("ascii")).toBe("RIFF");
    expect(image.subarray(8, 12).toString("ascii")).toBe("WEBP");
    expect(image.subarray(12, 16).toString("ascii")).toBe("VP8X");
    expect(image[20] & 0x10, "WebP alpha flag should be present").toBe(0x10);

    const height = image.readUIntLE(27, 3) + 1;
    expect(height).toBe(800);
  });
});
