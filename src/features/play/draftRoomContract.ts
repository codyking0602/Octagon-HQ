export const DRAFT_ROOM_MODE_IDS = ["build-qb"] as const;

export type DraftRoomModeId = (typeof DRAFT_ROOM_MODE_IDS)[number];

export const BUILD_QB_TRAITS = [
  "Arm",
  "Accuracy",
  "Processing",
  "Mobility",
  "Clutch",
] as const;

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
    displayName: "Build a QB",
    description: "Win one quarterback for each trait and build the stronger five-part QB.",
    rounds: 10,
    requiredSelectionsPerPlayer: 5,
    startingBankroll: 50,
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
