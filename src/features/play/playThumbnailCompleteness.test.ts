import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { playFighters } from "./playFighterPool";

const publicRoot = resolve(process.cwd(), "public");
const reframedFighterIds = new Set([
  "al-iaquinta",
  "anthony-smith",
  "bo-nickal",
  "brian-ortega",
  "calvin-kattar",
  "cat-zingano",
  "ciryl-gane",
  "claudia-gadelha",
  "curtis-blaydes",
  "cynthia-calvillo",
  "dan-hardy",
  "dan-ige",
  "derek-brunson",
  "dominick-reyes",
  "edmen-shahbazyan",
  "felice-herrig",
  "gilbert-burns",
  "james-vick",
  "jared-vanderaa",
  "johnny-walker",
  "joseph-benavidez",
  "josh-emmett",
  "joshua-culibao",
  "katlyn-chookagian",
  "kenny-florian",
  "kris-moutinho",
  "lauren-murphy",
  "marlon-moraes",
  "marvin-vettori",
  "megan-anderson",
  "michael-johnson",
  "mickey-gall",
  "mike-jackson",
  "ovince-saint-preux",
  "patrick-cummins",
  "randa-markos",
  "raul-rosas-jr",
  "roy-nelson",
  "ryan-bader",
  "sara-mcmann",
  "sean-sherk",
  "stefan-struve",
  "tony-kelley",
  "uriah-hall",
  "volkan-oezdemir",
  "yair-rodriguez",
]);

function read24BitLittleEndian(buffer: Buffer, offset: number) {
  return buffer[offset] | (buffer[offset + 1] << 8) | (buffer[offset + 2] << 16);
}

function readWebPDimensions(buffer: Buffer) {
  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const chunk = buffer.subarray(offset, offset + 4).toString("ascii");
    const chunkSize = buffer.readUInt32LE(offset + 4);
    const dataOffset = offset + 8;

    if (chunk === "VP8X" && dataOffset + 10 <= buffer.length) {
      return {
        width: read24BitLittleEndian(buffer, dataOffset + 4) + 1,
        height: read24BitLittleEndian(buffer, dataOffset + 7) + 1,
      };
    }

    if (chunk === "VP8 " && dataOffset + 10 <= buffer.length) {
      return {
        width: buffer.readUInt16LE(dataOffset + 6) & 0x3fff,
        height: buffer.readUInt16LE(dataOffset + 8) & 0x3fff,
      };
    }

    if (chunk === "VP8L" && dataOffset + 5 <= buffer.length) {
      const bits = buffer.readUInt32LE(dataOffset + 1);
      return {
        width: (bits & 0x3fff) + 1,
        height: ((bits >> 14) & 0x3fff) + 1,
      };
    }

    offset = dataOffset + chunkSize + (chunkSize % 2);
  }

  throw new Error("WebP dimensions were not found");
}

describe("Play fighter thumbnail completeness", () => {
  it("keeps one valid local WebP thumbnail for every eligible fighter", () => {
    const missing: string[] = [];
    const invalid: string[] = [];

    for (const fighter of playFighters) {
      const relativePath = fighter.thumbUrl.replace(/^\//, "");
      const absolutePath = resolve(publicRoot, relativePath);
      if (!existsSync(absolutePath)) {
        missing.push(`${fighter.id}: ${relativePath}`);
        continue;
      }

      const file = readFileSync(absolutePath);
      const isWebP = file.subarray(0, 4).toString("ascii") === "RIFF"
        && file.subarray(8, 12).toString("ascii") === "WEBP";
      if (!isWebP) invalid.push(`${fighter.id}: ${relativePath}`);
    }

    expect(missing).toEqual([]);
    expect(invalid).toEqual([]);
  });

  it("keeps the repaired Play thumbnails full-size, substantial, and unique", () => {
    const repaired = playFighters.filter((fighter) => reframedFighterIds.has(fighter.id));
    const hashes = new Set<string>();

    expect(repaired).toHaveLength(46);
    for (const fighter of repaired) {
      const file = readFileSync(resolve(publicRoot, fighter.thumbUrl.replace(/^\//, "")));
      expect(readWebPDimensions(file), fighter.id).toEqual({ width: 160, height: 160 });
      expect(file.byteLength, `${fighter.id} encoded quality`).toBeGreaterThanOrEqual(7_000);
      hashes.add(createHash("sha256").update(file).digest("hex"));
    }

    expect(hashes.size).toBe(repaired.length);
  });
});
