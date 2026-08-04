from __future__ import annotations

import re
from pathlib import Path

MODES = [
    "ultimate-fighter",
    "jon-jones-performances",
    "conor-mcgregor-performances",
    "charles-oliveira-performances",
    "fighter-performances",
    "strikers",
    "grapplers",
    "knockout-artists",
    "greatest-ufc-card",
    "championship-performances",
    "finishes",
    "dominant-performances",
    "wars",
    "rivalries",
    "iconic-moments",
    "nicknames",
]

POSITIONS = {
    "ultimate-fighter": "50% 50%",
    "jon-jones-performances": "50% 42%",
    "conor-mcgregor-performances": "50% 45%",
    "charles-oliveira-performances": "50% 38%",
    "fighter-performances": "50% 50%",
    "strikers": "50% 50%",
    "grapplers": "50% 54%",
    "knockout-artists": "50% 50%",
    "greatest-ufc-card": "50% 50%",
    "championship-performances": "50% 50%",
    "finishes": "50% 50%",
    "dominant-performances": "50% 50%",
    "wars": "50% 50%",
    "rivalries": "50% 50%",
    "iconic-moments": "50% 50%",
    "nicknames": "50% 42%",
}

mapping_lines = []
for mode in MODES:
    key = mode if mode.isidentifier() else f'"{mode}"'
    mapping_lines.append(
        f'  {key}: artwork("/auction/{mode}.webp", "{POSITIONS[mode]}"),'
    )

mapping = '''import type { AuctionModeId } from "./auctionContract";

export interface AuctionModeArtwork {
  src: string;
  objectPosition: string;
}

function artwork(src: string, objectPosition: string): AuctionModeArtwork {
  return { src, objectPosition };
}

export const auctionModeArtworks = {
%s
} as const satisfies Readonly<Record<AuctionModeId, AuctionModeArtwork>>;

export function auctionModeArtwork(modeId: AuctionModeId): AuctionModeArtwork {
  return auctionModeArtworks[modeId];
}
''' % "\n".join(mapping_lines)
Path("src/features/play/auctionModeArtwork.ts").write_text(mapping, encoding="utf-8")

test = '''import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { AUCTION_MODE_IDS } from "./auctionContract";
import { auctionModeArtworks } from "./auctionModeArtwork";

const page = readFileSync("src/features/play/AuctionPage.tsx", "utf8");

describe("Auction mode artwork", () => {
  it("maps every canonical mode exactly once to a unique local WebP", () => {
    const entries = Object.entries(auctionModeArtworks);
    const mappedIds = entries.map(([modeId]) => modeId);
    const mappedAssets = entries.map(([, artwork]) => artwork.src);

    expect(mappedIds).toEqual(AUCTION_MODE_IDS);
    expect(new Set(mappedIds).size).toBe(16);
    expect(new Set(mappedAssets).size).toBe(16);

    for (const asset of mappedAssets) {
      expect(asset).toMatch(/^\\/auction\\/[a-z0-9-]+\\.webp$/);
      expect(asset).not.toMatch(/^https?:\\/\\//);
      const path = resolve("public", asset.slice(1));
      expect(existsSync(path)).toBe(true);
      const webp = readFileSync(path);
      expect(webp.subarray(0, 4).toString("ascii")).toBe("RIFF");
      expect(webp.subarray(8, 12).toString("ascii")).toBe("WEBP");
      expect(webp.readUInt32LE(4) + 8).toBe(webp.length);
      expect(webp.length).toBeGreaterThan(5_000);
    }
  });

  it("uses the one artwork mapping in all three approved Auction placements", () => {
    expect(page).toContain("auctionModeArtwork");
    expect(page).toContain("auction-catalog__image");
    expect(page).toContain("auction-opponents__image");
    expect(page).toContain("auction-board__image");
    expect(page.match(/<AuctionArtworkImage/g)).toHaveLength(3);
  });
});
'''
Path("src/features/play/auctionModeArtwork.test.ts").write_text(test, encoding="utf-8")

verifier_path = Path("scripts/verify-live-frontend-delivery.mjs")
verifier = verifier_path.read_text(encoding="utf-8")
asset_array = "const AUCTION_FORMAT_ASSET_PATHS = [\n" + "\n".join(
    f'  "/auction/{mode}.webp",' for mode in MODES
) + "\n];"
verifier = verifier.replace(
    'const AUCTION_FORMAT_SPRITE_PATH = "/auction/auction-format-sprite.svg";',
    asset_array,
)
verifier = re.sub(
    r'\nexport function verifyAuctionFormatSpriteSource\(source\) \{.*?\n\}\n\nasync function verifyAttempt',
    '\nasync function verifyAttempt',
    verifier,
    flags=re.S,
)
asset_proof = '''  let auctionFormatAssets = 0;
  if (liveJavascript.includes(AUCTION_FORMAT_ASSET_PATHS[0])) {
    for (const path of AUCTION_FORMAT_ASSET_PATHS) {
      const assetUrl = new URL(path, `${origin}/`);
      assetUrl.searchParams.set("delivery", expectedSha);
      assetUrl.searchParams.set("attempt", String(attempt));
      const response = await fetchNoCache(assetUrl, fetchFn);
      if (!response.ok) throw new Error(`Live Auction asset ${path} returned HTTP ${response.status}.`);
      const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
      if (!contentType.includes("image/webp")) {
        throw new Error(`Live Auction asset ${path} returned ${contentType || "no content type"}.`);
      }
      const bytes = Buffer.from(await response.arrayBuffer());
      if (bytes.length < 5_000) throw new Error(`Live Auction asset ${path} is unexpectedly small.`);
      if (bytes.subarray(0, 4).toString("ascii") !== "RIFF"
        || bytes.subarray(8, 12).toString("ascii") !== "WEBP") {
        throw new Error(`Live Auction asset ${path} is not a valid WebP container.`);
      }
      auctionFormatAssets += 1;
    }
    for (const markerValue of [
      ".auction-catalog__image",
      ".auction-opponents__image",
      ".auction-board__image",
    ]) {
      if (!liveCss.includes(markerValue)) {
        throw new Error(`The live CSS is missing ${markerValue}.`);
      }
    }
  }'''
verifier = re.sub(
    r'  let auctionFormatSpriteBytes = 0;.*?\n\n  return \{',
    asset_proof + '\n\n  return {',
    verifier,
    flags=re.S,
)
verifier = verifier.replace("    auctionFormatSpriteBytes,", "    auctionFormatAssets,")
verifier = re.sub(
    r'  const auctionProof = result\.auctionFormatSpriteBytes.*?\n  \);\n\}',
    '''  const auctionProof = result.auctionFormatAssets
    ? `; verified ${result.auctionFormatAssets} Auction format WebPs`
    : "";
  console.log(
    `PASS: live shell loads deployment ${result.expectedSha} through ${result.javascriptAssets} JavaScript and ${result.stylesheetAssets} CSS assets${auctionProof}.`,
  );
}''',
    verifier,
    flags=re.S,
)
if "AUCTION_FORMAT_SPRITE" in verifier or "auctionFormatSprite" in verifier:
    raise SystemExit("Sprite verifier references remain after finalization.")
verifier_path.write_text(verifier, encoding="utf-8")

for path in [
    Path("public/auction/auction-format-sprite.svg"),
    Path("scripts/materialize-auction-assets.py"),
    Path(".github/workflows/materialize-auction-assets.yml"),
    Path("scripts/finalize-auction-assets.py"),
    Path(".github/workflows/finalize-auction-assets.yml"),
]:
    path.unlink(missing_ok=True)

print("Finalized sixteen individual Auction WebP assets and removed temporary tooling.")
