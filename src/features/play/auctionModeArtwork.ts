import type { AuctionModeId } from "./auctionContract";

export interface AuctionModeArtwork {
  src: string;
  objectPosition: string;
}

export const auctionModeArtworks = {
  "ultimate-fighter": {
    src: "/auction/ultimate-fighter.svg",
    objectPosition: "50% 50%",
  },
  "jon-jones-performances": {
    src: "/auction/jon-jones-performances.svg",
    objectPosition: "50% 42%",
  },
  "conor-mcgregor-performances": {
    src: "/auction/conor-mcgregor-performances.svg",
    objectPosition: "50% 45%",
  },
  "charles-oliveira-performances": {
    src: "/auction/charles-oliveira-performances.svg",
    objectPosition: "50% 38%",
  },
  "fighter-performances": {
    src: "/auction/fighter-performances.svg",
    objectPosition: "50% 50%",
  },
  strikers: {
    src: "/auction/strikers.svg",
    objectPosition: "50% 50%",
  },
  grapplers: {
    src: "/auction/grapplers.svg",
    objectPosition: "50% 54%",
  },
  "knockout-artists": {
    src: "/auction/knockout-artists.svg",
    objectPosition: "50% 50%",
  },
  "greatest-ufc-card": {
    src: "/auction/greatest-ufc-card.svg",
    objectPosition: "50% 50%",
  },
  "championship-performances": {
    src: "/auction/championship-performances.svg",
    objectPosition: "50% 50%",
  },
  finishes: {
    src: "/auction/finishes.svg",
    objectPosition: "50% 50%",
  },
  "dominant-performances": {
    src: "/auction/dominant-performances.svg",
    objectPosition: "50% 50%",
  },
  wars: {
    src: "/auction/wars.svg",
    objectPosition: "50% 50%",
  },
  rivalries: {
    src: "/auction/rivalries.svg",
    objectPosition: "50% 50%",
  },
  "iconic-moments": {
    src: "/auction/iconic-moments.svg",
    objectPosition: "50% 50%",
  },
  nicknames: {
    src: "/auction/nicknames.svg",
    objectPosition: "50% 42%",
  },
} as const satisfies Readonly<Record<AuctionModeId, AuctionModeArtwork>>;

export function auctionModeArtwork(modeId: AuctionModeId): AuctionModeArtwork {
  return auctionModeArtworks[modeId];
}
