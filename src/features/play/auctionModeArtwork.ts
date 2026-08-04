import type { AuctionModeId } from "./auctionContract";

export interface AuctionModeArtwork {
  src: string;
  objectPosition: string;
}

function artwork(src: string, objectPosition: string): AuctionModeArtwork {
  return { src, objectPosition };
}

export const auctionModeArtworks = {
  "ultimate-fighter": artwork("/auction/ultimate-fighter.webp", "50% 50%"),
  "jon-jones-performances": artwork("/auction/jon-jones-performances.webp", "50% 42%"),
  "conor-mcgregor-performances": artwork("/auction/conor-mcgregor-performances.webp", "50% 45%"),
  "charles-oliveira-performances": artwork("/auction/charles-oliveira-performances.webp", "50% 38%"),
  "fighter-performances": artwork("/auction/fighter-performances.webp", "50% 50%"),
  strikers: artwork("/auction/strikers.webp", "50% 50%"),
  grapplers: artwork("/auction/grapplers.webp", "50% 54%"),
  "knockout-artists": artwork("/auction/knockout-artists.webp", "50% 50%"),
  "greatest-ufc-card": artwork("/auction/greatest-ufc-card.webp", "50% 50%"),
  "championship-performances": artwork("/auction/championship-performances.webp", "50% 50%"),
  finishes: artwork("/auction/finishes.webp", "50% 50%"),
  "dominant-performances": artwork("/auction/dominant-performances.webp", "50% 50%"),
  wars: artwork("/auction/wars.webp", "50% 50%"),
  rivalries: artwork("/auction/rivalries.webp", "50% 50%"),
  "iconic-moments": artwork("/auction/iconic-moments.webp", "50% 50%"),
  nicknames: artwork("/auction/nicknames.webp", "50% 42%"),
} as const satisfies Readonly<Record<AuctionModeId, AuctionModeArtwork>>;

export function auctionModeArtwork(modeId: AuctionModeId): AuctionModeArtwork {
  return auctionModeArtworks[modeId];
}
