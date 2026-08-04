import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { AUCTION_MODE_IDS } from "./auctionContract";
import { auctionModeArtworks } from "./auctionModeArtwork";

const page = readFileSync("src/features/play/AuctionPage.tsx", "utf8");
const spritePath = resolve("public/auction/auction-format-sprite.svg");

describe("Auction mode artwork", () => {
  it("maps every canonical mode exactly once to a unique local sprite view", () => {
    const entries = Object.entries(auctionModeArtworks);
    const mappedIds = entries.map(([modeId]) => modeId);
    const mappedAssets = entries.map(([, artwork]) => artwork.src);

    expect(mappedIds).toEqual(AUCTION_MODE_IDS);
    expect(new Set(mappedIds).size).toBe(16);
    expect(new Set(mappedAssets).size).toBe(16);

    for (const asset of mappedAssets) {
      expect(asset).toMatch(
        /^\/auction\/auction-format-sprite\.svg#svgView\(viewBox\(\d+,\d+,180,101\)\)$/,
      );
      expect(asset).not.toMatch(/^https?:\/\//);
      const [assetPath] = asset.split("#");
      expect(existsSync(resolve("public", assetPath.slice(1)))).toBe(true);
    }
  });

  it("embeds a complete local WebP made from the supplied photos", () => {
    const sprite = readFileSync(spritePath, "utf8");
    const encoded = sprite.match(/href="data:image\/webp;base64,([^"]+)"/)?.[1];
    expect(encoded).toBeTruthy();
    expect(sprite).not.toMatch(/href="https?:\/\//);

    const webp = Buffer.from(encoded!, "base64");
    expect(webp.subarray(0, 4).toString("ascii")).toBe("RIFF");
    expect(webp.subarray(8, 12).toString("ascii")).toBe("WEBP");
    expect(webp.readUInt32LE(4) + 8).toBe(webp.length);
    expect(webp.length).toBeGreaterThan(15_000);
  });

  it("uses the one artwork mapping in all three approved Auction placements", () => {
    expect(page).toContain("auctionModeArtwork");
    expect(page).toContain("auction-catalog__image");
    expect(page).toContain("auction-opponents__image");
    expect(page).toContain("auction-board__image");
    expect(page.match(/<AuctionArtworkImage/g)).toHaveLength(3);
  });
});
