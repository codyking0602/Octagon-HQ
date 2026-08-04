import type { AuctionModeId } from "./auctionContract";

export interface AuctionModeArtwork {
  src: string;
  objectPosition: string;
}

const sprite = "/auction/auction-format-sprite.svg";

function spriteView(x: number, y: number): AuctionModeArtwork {
  return {
    src: `${sprite}#svgView(viewBox(${x},${y},180,101))`,
    objectPosition: "50% 50%",
  };
}

export const auctionModeArtworks = {
  "ultimate-fighter": spriteView(0, 0),
  "jon-jones-performances": spriteView(180, 0),
  "conor-mcgregor-performances": spriteView(360, 0),
  "charles-oliveira-performances": spriteView(540, 0),
  "fighter-performances": spriteView(0, 101),
  strikers: spriteView(180, 101),
  grapplers: spriteView(360, 101),
  "knockout-artists": spriteView(540, 101),
  "greatest-ufc-card": spriteView(0, 202),
  "championship-performances": spriteView(180, 202),
  finishes: spriteView(360, 202),
  "dominant-performances": spriteView(540, 202),
  wars: spriteView(0, 303),
  rivalries: spriteView(180, 303),
  "iconic-moments": spriteView(360, 303),
  nicknames: spriteView(540, 303),
} as const satisfies Readonly<Record<AuctionModeId, AuctionModeArtwork>>;

export function auctionModeArtwork(modeId: AuctionModeId): AuctionModeArtwork {
  return auctionModeArtworks[modeId];
}
