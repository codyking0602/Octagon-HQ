import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { AUCTION_MODE_IDS } from "./auctionContract";
import { auctionModeArtworks } from "./auctionModeArtwork";

const page = readFileSync("src/features/play/AuctionPage.tsx", "utf8");

function webpDimensions(webp: Buffer): readonly [number, number] {
  let offset = 12;
  while (offset + 8 <= webp.length) {
    const type = webp.subarray(offset, offset + 4).toString("ascii");
    const size = webp.readUInt32LE(offset + 4);
    const data = offset + 8;

    if (type === "VP8X" && data + 10 <= webp.length) {
      const width = 1 + webp.readUIntLE(data + 4, 3);
      const height = 1 + webp.readUIntLE(data + 7, 3);
      return [width, height];
    }
    if (type === "VP8 " && data + 10 <= webp.length) {
      expect(webp.subarray(data + 3, data + 6)).toEqual(Buffer.from([0x9d, 0x01, 0x2a]));
      return [webp.readUInt16LE(data + 6) & 0x3fff, webp.readUInt16LE(data + 8) & 0x3fff];
    }
    if (type === "VP8L" && data + 5 <= webp.length) {
      expect(webp[data]).toBe(0x2f);
      const b1 = webp[data + 1];
      const b2 = webp[data + 2];
      const b3 = webp[data + 3];
      const b4 = webp[data + 4];
      return [1 + b1 + ((b2 & 0x3f) << 8), 1 + (b2 >> 6) + (b3 << 2) + ((b4 & 0x0f) << 10)];
    }

    offset = data + size + (size % 2);
  }
  throw new Error("WebP dimensions were unavailable.");
}

describe("Auction mode artwork", () => {
  it("maps every canonical mode exactly once to a unique release-quality local WebP", () => {
    const entries = Object.entries(auctionModeArtworks);
    const mappedIds = entries.map(([modeId]) => modeId);
    const mappedAssets = entries.map(([, artwork]) => artwork.src);

    expect(mappedIds).toEqual(AUCTION_MODE_IDS);
    expect(new Set(mappedIds).size).toBe(16);
    expect(new Set(mappedAssets).size).toBe(16);

    for (const asset of mappedAssets) {
      expect(asset).toMatch(/^\/auction\/[a-z0-9-]+\.webp$/);
      expect(asset).not.toMatch(/^https?:\/\//);
      const path = resolve("public", asset.slice(1));
      expect(existsSync(path)).toBe(true);
      const webp = readFileSync(path);
      expect(webp.subarray(0, 4).toString("ascii")).toBe("RIFF");
      expect(webp.subarray(8, 12).toString("ascii")).toBe("WEBP");
      expect(webp.readUInt32LE(4) + 8).toBe(webp.length);
      expect(webp.length).toBeGreaterThan(20_000);
      expect(webpDimensions(webp)).toEqual([720, 405]);
    }
  });

  it("uses the one artwork mapping in all three approved Auction placements", () => {
    expect(page).toContain("auctionModeArtwork");
    expect(page).toContain("auction-catalog__image");
    expect(page).toContain("auction-opponents__image");
    expect(page).toContain("auction-board__image");
    expect(page).not.toContain("auction-format-sprite");
    expect(page.match(/<AuctionArtworkImage/g)).toHaveLength(3);
  });
});
