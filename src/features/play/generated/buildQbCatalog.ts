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
  { subjectId: "nfl-patrick-mahomes", displayName: "Patrick Mahomes", rarityBand: 4, overall: 89, traits: { Arm: 95, Accuracy: 88, Processing: 87, Mobility: 83, Clutch: 94 } },
  { subjectId: "nfl-aaron-rodgers", displayName: "Aaron Rodgers", rarityBand: 4, overall: 87, traits: { Arm: 74, Accuracy: 89, Processing: 99, Mobility: 75, Clutch: 98 } },
  { subjectId: "nfl-lamar-jackson", displayName: "Lamar Jackson", rarityBand: 4, overall: 86, traits: { Arm: 67, Accuracy: 82, Processing: 90, Mobility: 96, Clutch: 93 } },
  { subjectId: "nfl-joe-burrow", displayName: "Joe Burrow", rarityBand: 4, overall: 83, traits: { Arm: 79, Accuracy: 95, Processing: 88, Mobility: 74, Clutch: 77 } },
  { subjectId: "drew-brees", displayName: "Drew Brees", rarityBand: 3, overall: 78, traits: { Arm: 88, Accuracy: 88, Processing: 73, Mobility: 50, Clutch: 89 } },
  { subjectId: "tom-brady", displayName: "Tom Brady", rarityBand: 3, overall: 73, traits: { Arm: 69, Accuracy: 69, Processing: 84, Mobility: 52, Clutch: 92 } },
  { subjectId: "nfl-josh-allen", displayName: "Josh Allen", rarityBand: 3, overall: 72, traits: { Arm: 55, Accuracy: 62, Processing: 69, Mobility: 93, Clutch: 83 } },
  { subjectId: "matt-ryan", displayName: "Matt Ryan", rarityBand: 2, overall: 70, traits: { Arm: 68, Accuracy: 75, Processing: 67, Mobility: 57, Clutch: 83 } },
  { subjectId: "nfl-matthew-stafford", displayName: "Matthew Stafford", rarityBand: 2, overall: 65, traits: { Arm: 68, Accuracy: 53, Processing: 65, Mobility: 56, Clutch: 81 } },
  { subjectId: "nfl-philip-rivers", displayName: "Philip Rivers", rarityBand: 2, overall: 65, traits: { Arm: 78, Accuracy: 74, Processing: 56, Mobility: 38, Clutch: 80 } },
  { subjectId: "andrew-luck", displayName: "Andrew Luck", rarityBand: 2, overall: 64, traits: { Arm: 67, Accuracy: 46, Processing: 54, Mobility: 82, Clutch: 72 } },
  { subjectId: "ben-roethlisberger", displayName: "Ben Roethlisberger", rarityBand: 2, overall: 64, traits: { Arm: 70, Accuracy: 63, Processing: 54, Mobility: 55, Clutch: 78 } },
  { subjectId: "cam-newton", displayName: "Cam Newton", rarityBand: 1, overall: 57, traits: { Arm: 43, Accuracy: 37, Processing: 43, Mobility: 93, Clutch: 68 } },
  { subjectId: "jay-cutler", displayName: "Jay Cutler", rarityBand: 1, overall: 50, traits: { Arm: 41, Accuracy: 47, Processing: 37, Mobility: 62, Clutch: 65 } },
  { subjectId: "eli-manning", displayName: "Eli Manning", rarityBand: 1, overall: 45, traits: { Arm: 43, Accuracy: 38, Processing: 38, Mobility: 38, Clutch: 69 } },
] as const;
