import type { DraftRoomModeId } from "../play/draftRoomContract";
import { BUILD_QB_HERO_IMAGE } from "./buildQbVisualIdentity";
import { CFB_BUILD_QB_HERO_IMAGE } from "./cfbBuildQbVisualIdentity";

export interface DraftRoomModeArtwork {
  src: string;
  objectPosition: string;
}

function artwork(src: string, objectPosition: string): DraftRoomModeArtwork {
  return { src, objectPosition };
}

export const draftRoomModeArtworks = {
  "build-qb": artwork(BUILD_QB_HERO_IMAGE, "50% 36%"),
  "build-qb-cfb": artwork(CFB_BUILD_QB_HERO_IMAGE, "50% 36%"),
  "trio-nfl": artwork("/assets/football/draft-room-trio-nfl.webp", "50% 50%"),
  "trio-cfb": artwork("/assets/football/draft-room-trio-cfb-ohio-state.webp", "50% 50%"),
} as const satisfies Readonly<Record<DraftRoomModeId, DraftRoomModeArtwork>>;

export function draftRoomModeArtwork(modeId: DraftRoomModeId): DraftRoomModeArtwork {
  return draftRoomModeArtworks[modeId];
}
