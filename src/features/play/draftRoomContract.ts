export const DRAFT_ROOM_MODE_IDS = ["build-qb", "build-qb-cfb", "trio-nfl", "trio-cfb", "longhorns-2005", "longhorns-teams-2005", "cowboys-2007", "cowboys-teams-2007", "cfb-best-teams"] as const;

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
  format: "build-qb" | "trio" | "open-roster";
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
  {
    id: "cfb-best-teams",
    displayName: "Best CFB Teams",
    description: "Bid on elite college team-seasons from randomized conference boards. Win four seasons and build the stronger group.",
    rounds: 8,
    requiredSelectionsPerPlayer: 4,
    startingBankroll: 40,
    categories: [],
    format: "open-roster",
  },
  {
    id: "longhorns-2005",
    displayName: "Longhorns Since 2003",
    description: "Bid on Texas Longhorns from 2003 forward. Win four players and build the stronger four-player group.",
    rounds: 8,
    requiredSelectionsPerPlayer: 4,
    startingBankroll: 40,
    categories: [],
    format: "open-roster",
  },
  {
    id: "longhorns-teams-2005",
    displayName: "Longhorns Teams Since 2003",
    description: "Bid on completed Texas seasons from 2003 forward. Win four teams and build the stronger four-season group.",
    rounds: 8,
    requiredSelectionsPerPlayer: 4,
    startingBankroll: 40,
    categories: [],
    format: "open-roster",
  },
  {
    id: "cowboys-2007",
    displayName: "Cowboys Since 2007",
    description: "Bid on Dallas Cowboys from 2007 forward. Win four players and build the stronger four-player group.",
    rounds: 8,
    requiredSelectionsPerPlayer: 4,
    startingBankroll: 40,
    categories: [],
    format: "open-roster",
  },
  {
    id: "cowboys-teams-2007",
    displayName: "Cowboys Teams Since 2007",
    description: "Bid on completed Dallas Cowboys seasons from 2007 forward. Win four teams and build the stronger four-season group.",
    rounds: 8,
    requiredSelectionsPerPlayer: 4,
    startingBankroll: 40,
    categories: [],
    format: "open-roster",
  },
] as const;

export function isDraftRoomModeId(value: string): value is DraftRoomModeId {
  return (DRAFT_ROOM_MODE_IDS as readonly string[]).includes(value);
}

export function isTrioDraftRoomMode(modeId: DraftRoomModeId) {
  return modeId === "trio-nfl" || modeId === "trio-cfb";
}

export function isLonghornsDraftRoomMode(modeId: DraftRoomModeId) {
  return modeId === "longhorns-2005";
}

export function isLonghornsTeamsDraftRoomMode(modeId: DraftRoomModeId) {
  return modeId === "longhorns-teams-2005";
}

export function isCowboysDraftRoomMode(modeId: DraftRoomModeId) {
  return modeId === "cowboys-2007";
}

export function isCowboysTeamsDraftRoomMode(modeId: DraftRoomModeId) {
  return modeId === "cowboys-teams-2007";
}

export function isCfbBestTeamsDraftRoomMode(modeId: DraftRoomModeId) {
  return modeId === "cfb-best-teams";
}

export function isCfbDraftRoomMode(modeId: DraftRoomModeId) {
  return modeId === "build-qb-cfb"
    || modeId === "trio-cfb"
    || isCfbBestTeamsDraftRoomMode(modeId)
    || isLonghornsDraftRoomMode(modeId)
    || isLonghornsTeamsDraftRoomMode(modeId);
}

export function draftRoomModeDefinition(modeId: DraftRoomModeId) {
  const mode = draftRoomModes.find((candidate) => candidate.id === modeId);
  if (!mode) throw new Error(`Unknown Draft Room mode: ${modeId}`);
  return mode;
}
