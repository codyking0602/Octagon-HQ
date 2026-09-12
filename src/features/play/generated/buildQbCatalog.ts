import type { BuildQbTrait } from "../draftRoomContract";

export const FOOTBALL_BUILD_QB_CATALOG_VERSION = "football-draft-room-2026-09-v1" as const;
export const FOOTBALL_BUILD_QB_RARITY_VERSION = "football-draft-room-rarity-2026-09-v1" as const;
export const FOOTBALL_BUILD_QB_GRADING_VERSION = "football-build-qb-traits-2026-09-v1" as const;

export interface GeneratedBuildQbCatalogRow {
  subjectId: string;
  displayName: string;
  rarityBand: 1 | 2 | 3 | 4 | 5;
  overall: number;
  traits: Readonly<Record<BuildQbTrait, number>>;
}

// Generated deployment output from the canonical Football position-trait model.
// Do not hand-edit ratings here; footballPositionTraitRatings.ts owns the model.
export const generatedBuildQbCatalog: readonly GeneratedBuildQbCatalogRow[] = [
  { subjectId: "nfl-patrick-mahomes", displayName: "Patrick Mahomes", rarityBand: 5, overall: 92, traits: { Arm: 95, Accuracy: 90, Processing: 92, Mobility: 85, Clutch: 96 } },
  { subjectId: "nfl-aaron-rodgers", displayName: "Aaron Rodgers", rarityBand: 4, overall: 88, traits: { Arm: 82, Accuracy: 89, Processing: 99, Mobility: 74, Clutch: 98 } },
  { subjectId: "nflverse-player-00-0034796", displayName: "Lamar Jackson", rarityBand: 4, overall: 88, traits: { Arm: 72, Accuracy: 83, Processing: 92, Mobility: 98, Clutch: 94 } },
  { subjectId: "nflverse-player-00-0029263", displayName: "Russell Wilson", rarityBand: 4, overall: 85, traits: { Arm: 76, Accuracy: 78, Processing: 90, Mobility: 88, Clutch: 93 } },
  { subjectId: "nflverse-player-00-0036442", displayName: "Joe Burrow", rarityBand: 4, overall: 84, traits: { Arm: 86, Accuracy: 96, Processing: 91, Mobility: 69, Clutch: 78 } },
  { subjectId: "nflverse-player-00-0033077", displayName: "Dak Prescott", rarityBand: 4, overall: 83, traits: { Arm: 80, Accuracy: 91, Processing: 85, Mobility: 81, Clutch: 79 } },
  { subjectId: "nfl-josh-allen", displayName: "Josh Allen", rarityBand: 3, overall: 78, traits: { Arm: 71, Accuracy: 67, Processing: 72, Mobility: 97, Clutch: 84 } },
  { subjectId: "nflverse-player-00-0029604", displayName: "Kirk Cousins", rarityBand: 3, overall: 74, traits: { Arm: 77, Accuracy: 87, Processing: 74, Mobility: 54, Clutch: 77 } },
  { subjectId: "nflverse-player-00-0033106", displayName: "Jared Goff", rarityBand: 3, overall: 73, traits: { Arm: 83, Accuracy: 82, Processing: 79, Mobility: 44, Clutch: 77 } },
  { subjectId: "nflverse-player-00-0021678", displayName: "Tony Romo", rarityBand: 3, overall: 73, traits: { Arm: 92, Accuracy: 83, Processing: 64, Mobility: 45, Clutch: 79 } },
  { subjectId: "nfl-matthew-stafford", displayName: "Matthew Stafford", rarityBand: 2, overall: 69, traits: { Arm: 81, Accuracy: 61, Processing: 68, Mobility: 53, Clutch: 84 } },
  { subjectId: "nfl-philip-rivers", displayName: "Philip Rivers", rarityBand: 2, overall: 68, traits: { Arm: 87, Accuracy: 74, Processing: 63, Mobility: 35, Clutch: 82 } },
  { subjectId: "nflverse-player-00-0031280", displayName: "Derek Carr", rarityBand: 2, overall: 66, traits: { Arm: 60, Accuracy: 73, Processing: 76, Mobility: 50, Clutch: 71 } },
  { subjectId: "nflverse-player-00-0029701", displayName: "Ryan Tannehill", rarityBand: 2, overall: 65, traits: { Arm: 56, Accuracy: 64, Processing: 59, Mobility: 76, Clutch: 72 } },
  { subjectId: "nflverse-player-00-0034855", displayName: "Baker Mayfield", rarityBand: 2, overall: 62, traits: { Arm: 61, Accuracy: 60, Processing: 59, Mobility: 65, Clutch: 65 } },
  { subjectId: "nflverse-player-00-0036971", displayName: "Trevor Lawrence", rarityBand: 1, overall: 59, traits: { Arm: 48, Accuracy: 51, Processing: 55, Mobility: 86, Clutch: 55 } },
  { subjectId: "nflverse-player-00-0023436", displayName: "Alex Smith", rarityBand: 1, overall: 57, traits: { Arm: 42, Accuracy: 48, Processing: 60, Mobility: 70, Clutch: 66 } },
  { subjectId: "nflverse-player-00-0027973", displayName: "Andy Dalton", rarityBand: 1, overall: 56, traits: { Arm: 52, Accuracy: 52, Processing: 49, Mobility: 61, Clutch: 65 } },
  { subjectId: "nflverse-player-00-0021429", displayName: "Carson Palmer", rarityBand: 1, overall: 56, traits: { Arm: 68, Accuracy: 49, Processing: 46, Mobility: 41, Clutch: 75 } },
  { subjectId: "nflverse-player-00-0023682", displayName: "Ryan Fitzpatrick", rarityBand: 1, overall: 53, traits: { Arm: 49, Accuracy: 39, Processing: 40, Mobility: 77, Clutch: 62 } },
  { subjectId: "nflverse-player-00-0026158", displayName: "Joe Flacco", rarityBand: 1, overall: 51, traits: { Arm: 47, Accuracy: 42, Processing: 50, Mobility: 47, Clutch: 67 } },
  { subjectId: "nflverse-player-00-0024218", displayName: "Vince Young", rarityBand: 1, overall: 50, traits: { Arm: 42, Accuracy: 35, Processing: 35, Mobility: 89, Clutch: 48 } },
  { subjectId: "nflverse-player-00-0027688", displayName: "Colt McCoy", rarityBand: 1, overall: 42, traits: { Arm: 35, Accuracy: 44, Processing: 41, Mobility: 54, Clutch: 38 } },
] as const;
