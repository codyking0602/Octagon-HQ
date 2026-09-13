export const DRAFT_ROOM_MODE_IDS = ["build-qb", "build-qb-cfb", "trio-nfl", "trio-cfb"] as const;

export type DraftRoomModeId = (typeof DRAFT_ROOM_MODE_IDS)[number];

export const BUILD_QB_TRAITS = ["Arm", "Accuracy", "Processing", "Mobility"] as const;
export type BuildQbTrait = (typeof BUILD_QB_TRAITS)[number];

export const TRIO_POSITIONS = ["QB", "RB", "WR"] as const;
export type TrioPosition = (typeof TRIO_POSITIONS)[number];

export interface DraftRoomModeDefinition {
  id: DraftRoomModeId;
  displayName: string;
  description: string;
  rounds: number;
  requiredSelectionsPerPlayer: number;
  startingBankroll: number;
  categories: readonly BuildQbTrait[];
  format: "build-qb" | "trio";
}

export const draftRoomModes: readonly DraftRoomModeDefinition[] = [
  {
    id: "build-qb",
    displayName: "NFL Build a QB",
    description: "Win one NFL quarterback for each trait and build the stronger four-part QB.",
    rounds: 8,
    requiredSelectionsPerPlayer: 4,
    startingBankroll: 40,
    categories: BUILD_QB_TRAITS,
    format: "build-qb",
  },
  {
    id: "build-qb-cfb",
    displayName: "CFB Build a QB",
    description: "Win one peak-season college quarterback for each trait and build the stronger four-part QB.",
    rounds: 8,
    requiredSelectionsPerPlayer: 4,
    startingBankroll: 40,
    categories: BUILD_QB_TRAITS,
    format: "build-qb",
  },
  {
    id: "trio-nfl",
    displayName: "NFL QB / RB / WR Trio",
    description: "Bid on complete NFL QB, RB, and WR packages. Win three trios and build the stronger nine-player roster.",
    rounds: 6,
    requiredSelectionsPerPlayer: 3,
    startingBankroll: 30,
    categories: [],
    format: "trio",
  },
  {
    id: "trio-cfb",
    displayName: "CFB QB / RB / WR Trio",
    description: "Bid on complete peak-college QB, RB, and WR packages. Win three trios and build the stronger nine-player roster.",
    rounds: 6,
    requiredSelectionsPerPlayer: 3,
    startingBankroll: 30,
    categories: [],
    format: "trio",
  },
] as const;

export function isDraftRoomModeId(value: string): value is DraftRoomModeId {
  return (DRAFT_ROOM_MODE_IDS as readonly string[]).includes(value);
}

export function isTrioDraftRoomMode(modeId: DraftRoomModeId) {
  return modeId === "trio-nfl" || modeId === "trio-cfb";
}

export function isCfbDraftRoomMode(modeId: DraftRoomModeId) {
  return modeId === "build-qb-cfb" || modeId === "trio-cfb";
}

export function draftRoomModeDefinition(modeId: DraftRoomModeId) {
  const mode = draftRoomModes.find((candidate) => candidate.id === modeId);
  if (!mode) throw new Error(`Unknown Draft Room mode: ${modeId}`);
  return mode;
}
