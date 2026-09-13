export const DRAFT_ROOM_MODE_IDS = ["build-qb", "build-qb-cfb"] as const;

export type DraftRoomModeId = (typeof DRAFT_ROOM_MODE_IDS)[number];

export const BUILD_QB_TRAITS = ["Arm", "Accuracy", "Processing", "Mobility"] as const;
export type BuildQbTrait = (typeof BUILD_QB_TRAITS)[number];

export interface DraftRoomModeDefinition {
  id: DraftRoomModeId;
  displayName: string;
  description: string;
  rounds: number;
  requiredSelectionsPerPlayer: number;
  startingBankroll: number;
  categories: readonly BuildQbTrait[];
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
  },
  {
    id: "build-qb-cfb",
    displayName: "CFB Build a QB",
    description: "Win one peak-season college quarterback for each trait and build the stronger four-part QB.",
    rounds: 8,
    requiredSelectionsPerPlayer: 4,
    startingBankroll: 40,
    categories: BUILD_QB_TRAITS,
  },
] as const;

export function isDraftRoomModeId(value: string): value is DraftRoomModeId {
  return (DRAFT_ROOM_MODE_IDS as readonly string[]).includes(value);
}

export function draftRoomModeDefinition(modeId: DraftRoomModeId) {
  const mode = draftRoomModes.find((candidate) => candidate.id === modeId);
  if (!mode) throw new Error(`Unknown Draft Room mode: ${modeId}`);
  return mode;
}
