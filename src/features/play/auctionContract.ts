export const AUCTION_MODE_IDS = [
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
] as const;

export type AuctionModeId = (typeof AUCTION_MODE_IDS)[number];

export type AuctionFamily =
  | "fighter-auction"
  | "career-performance-auction"
  | "historical-collection-auction"
  | "card-building-auction"
  | "nickname-auction";

export const ULTIMATE_FIGHTER_CATEGORIES = [
  "Striking",
  "Grappling",
  "Frame",
  "Power",
  "Heart",
] as const;

export type UltimateFighterCategory = (typeof ULTIMATE_FIGHTER_CATEGORIES)[number];

export interface PublicAuctionMode {
  id: AuctionModeId;
  displayName: string;
  family: AuctionFamily;
  rounds: number;
  requiredSelectionsPerPlayer: number;
  startingBankroll: number;
  usesUltimateFighterPlacement: boolean;
  categories: readonly UltimateFighterCategory[];
}

const modes: readonly [AuctionModeId, string, AuctionFamily][] = [
  ["ultimate-fighter", "Build the Ultimate Fighter", "fighter-auction"],
  ["jon-jones-performances", "Best Jon Jones Performances", "career-performance-auction"],
  ["conor-mcgregor-performances", "Best Conor McGregor Performances", "career-performance-auction"],
  ["charles-oliveira-performances", "Best Charles Oliveira Performances", "career-performance-auction"],
  ["fighter-performances", "Best Fighter Performances", "historical-collection-auction"],
  ["strikers", "Best Strikers", "fighter-auction"],
  ["grapplers", "Best Grapplers", "fighter-auction"],
  ["knockout-artists", "Best Knockout Artists", "fighter-auction"],
  ["greatest-ufc-card", "Build the Greatest UFC Card", "card-building-auction"],
  ["championship-performances", "Best Championship Performances", "historical-collection-auction"],
  ["finishes", "Best Finishes", "historical-collection-auction"],
  ["dominant-performances", "Most Dominant Performances", "historical-collection-auction"],
  ["wars", "Best Wars", "historical-collection-auction"],
  ["rivalries", "Best Rivalries", "historical-collection-auction"],
  ["iconic-moments", "Most Iconic UFC Moments", "historical-collection-auction"],
  ["nicknames", "Best Nicknames", "nickname-auction"],
];

export const auctionModes: readonly PublicAuctionMode[] = modes.map(([id, displayName, family]) => {
  const ultimateFighter = id === "ultimate-fighter";
  return {
    id,
    displayName,
    family,
    rounds: ultimateFighter ? 10 : 6,
    requiredSelectionsPerPlayer: ultimateFighter ? 5 : 3,
    startingBankroll: ultimateFighter ? 50 : 30,
    usesUltimateFighterPlacement: ultimateFighter,
    categories: ultimateFighter ? ULTIMATE_FIGHTER_CATEGORIES : [],
  };
});

export type AuctionModeGroupId = "fighters" | "skills" | "performances" | "history";

export interface AuctionModeGroup {
  id: AuctionModeGroupId;
  label: string;
  modeIds: readonly AuctionModeId[];
}

export const auctionModeGroups: readonly AuctionModeGroup[] = [
  {
    id: "fighters",
    label: "Fighters",
    modeIds: [
      "ultimate-fighter",
      "jon-jones-performances",
      "conor-mcgregor-performances",
      "charles-oliveira-performances",
    ],
  },
  {
    id: "skills",
    label: "Skills",
    modeIds: ["strikers", "grapplers", "knockout-artists"],
  },
  {
    id: "performances",
    label: "Performances",
    modeIds: [
      "fighter-performances",
      "championship-performances",
      "finishes",
      "dominant-performances",
    ],
  },
  {
    id: "history",
    label: "UFC History",
    modeIds: ["greatest-ufc-card", "wars", "rivalries", "iconic-moments", "nicknames"],
  },
];

const auctionModeById = new Map(auctionModes.map((mode) => [mode.id, mode]));
const auctionModeGroupById = new Map(auctionModeGroups.map((group) => [group.id, group]));

export function isAuctionModeId(value: string): value is AuctionModeId {
  return auctionModeById.has(value as AuctionModeId);
}

export function parseAuctionModeId(value: string): AuctionModeId | null {
  return isAuctionModeId(value) ? value : null;
}

export function auctionModeDefinition(id: AuctionModeId): PublicAuctionMode {
  return auctionModeById.get(id)!;
}

export function auctionModesForGroup(groupId: AuctionModeGroupId | "all") {
  if (groupId === "all") return auctionModes;
  const group = auctionModeGroupById.get(groupId);
  return group?.modeIds.map(auctionModeDefinition) ?? [];
}

export function usesUltimateFighterPlacement(id: AuctionModeId): boolean {
  return auctionModeDefinition(id).usesUltimateFighterPlacement;
}
