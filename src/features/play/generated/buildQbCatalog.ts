import type { BuildQbTrait } from "../draftRoomContract";

export const FOOTBALL_BUILD_QB_CATALOG_VERSION = "football-draft-room-2026-09-v2" as const;
export const FOOTBALL_BUILD_QB_RARITY_VERSION = "football-draft-room-rarity-2026-09-v2" as const;
export const FOOTBALL_BUILD_QB_GRADING_VERSION = "football-build-qb-traits-2026-09-v1" as const;

export interface GeneratedBuildQbCatalogRow {
  catalogId: string;
  displayName: string;
  rarityBand: 1 | 2 | 3 | 4 | 5;
  generationWeight: number;
  overall: number;
  traits: Readonly<Record<BuildQbTrait, number>>;
}

// Generated deployment output from the canonical Football position-trait model.
// Do not hand-edit ratings here; footballPositionTraitRatings.ts owns the model.
export const generatedBuildQbCatalog: readonly GeneratedBuildQbCatalogRow[] = [
  { catalogId: "build-qb-tom-brady", displayName: "Tom Brady", rarityBand: 5, generationWeight: 0.18, overall: 82, traits: { Arm: 78, Accuracy: 93, Processing: 99, Mobility: 42, Clutch: 99 } },
  { catalogId: "build-qb-peyton-manning", displayName: "Peyton Manning", rarityBand: 5, generationWeight: 0.18, overall: 83, traits: { Arm: 86, Accuracy: 93, Processing: 99, Mobility: 42, Clutch: 93 } },
  { catalogId: "build-qb-joe-montana", displayName: "Joe Montana", rarityBand: 5, generationWeight: 0.18, overall: 88, traits: { Arm: 78, Accuracy: 93, Processing: 99, Mobility: 69, Clutch: 99 } },
  { catalogId: "build-qb-patrick-mahomes", displayName: "Patrick Mahomes", rarityBand: 5, generationWeight: 0.18, overall: 95, traits: { Arm: 99, Accuracy: 93, Processing: 93, Mobility: 93, Clutch: 99 } },
  { catalogId: "build-qb-aaron-rodgers", displayName: "Aaron Rodgers", rarityBand: 5, generationWeight: 0.18, overall: 93, traits: { Arm: 93, Accuracy: 99, Processing: 99, Mobility: 86, Clutch: 86 } },
  { catalogId: "build-qb-dan-marino", displayName: "Dan Marino", rarityBand: 5, generationWeight: 0.18, overall: 82, traits: { Arm: 99, Accuracy: 93, Processing: 99, Mobility: 42, Clutch: 78 } },
  { catalogId: "build-qb-drew-brees", displayName: "Drew Brees", rarityBand: 5, generationWeight: 0.18, overall: 81, traits: { Arm: 69, Accuracy: 99, Processing: 93, Mobility: 50, Clutch: 93 } },
  { catalogId: "build-qb-brett-favre", displayName: "Brett Favre", rarityBand: 5, generationWeight: 0.18, overall: 82, traits: { Arm: 99, Accuracy: 78, Processing: 69, Mobility: 78, Clutch: 86 } },
  { catalogId: "build-qb-johnny-unitas", displayName: "Johnny Unitas", rarityBand: 5, generationWeight: 0.18, overall: 84, traits: { Arm: 86, Accuracy: 86, Processing: 93, Mobility: 60, Clutch: 93 } },
  { catalogId: "build-qb-john-elway", displayName: "John Elway", rarityBand: 5, generationWeight: 0.18, overall: 90, traits: { Arm: 99, Accuracy: 78, Processing: 86, Mobility: 86, Clutch: 99 } },
  { catalogId: "build-qb-steve-young", displayName: "Steve Young", rarityBand: 4, generationWeight: 0.70, overall: 92, traits: { Arm: 86, Accuracy: 93, Processing: 93, Mobility: 93, Clutch: 93 } },
  { catalogId: "build-qb-roger-staubach", displayName: "Roger Staubach", rarityBand: 4, generationWeight: 0.70, overall: 91, traits: { Arm: 86, Accuracy: 86, Processing: 93, Mobility: 93, Clutch: 99 } },
  { catalogId: "build-qb-terry-bradshaw", displayName: "Terry Bradshaw", rarityBand: 4, generationWeight: 0.70, overall: 83, traits: { Arm: 93, Accuracy: 69, Processing: 78, Mobility: 78, Clutch: 99 } },
  { catalogId: "build-qb-fran-tarkenton", displayName: "Fran Tarkenton", rarityBand: 4, generationWeight: 0.70, overall: 86, traits: { Arm: 78, Accuracy: 86, Processing: 86, Mobility: 93, Clutch: 86 } },
  { catalogId: "build-qb-dan-fouts", displayName: "Dan Fouts", rarityBand: 4, generationWeight: 0.70, overall: 80, traits: { Arm: 93, Accuracy: 86, Processing: 93, Mobility: 50, Clutch: 78 } },
  { catalogId: "build-qb-kurt-warner", displayName: "Kurt Warner", rarityBand: 4, generationWeight: 0.70, overall: 83, traits: { Arm: 86, Accuracy: 93, Processing: 93, Mobility: 42, Clutch: 99 } },
  { catalogId: "build-qb-warren-moon", displayName: "Warren Moon", rarityBand: 4, generationWeight: 0.70, overall: 85, traits: { Arm: 99, Accuracy: 86, Processing: 86, Mobility: 78, Clutch: 78 } },
  { catalogId: "build-qb-jim-kelly", displayName: "Jim Kelly", rarityBand: 4, generationWeight: 0.70, overall: 84, traits: { Arm: 93, Accuracy: 86, Processing: 93, Mobility: 60, Clutch: 86 } },
  { catalogId: "build-qb-troy-aikman", displayName: "Troy Aikman", rarityBand: 4, generationWeight: 0.70, overall: 85, traits: { Arm: 86, Accuracy: 99, Processing: 93, Mobility: 50, Clutch: 99 } },
  { catalogId: "build-qb-ben-roethlisberger", displayName: "Ben Roethlisberger", rarityBand: 4, generationWeight: 0.70, overall: 90, traits: { Arm: 93, Accuracy: 86, Processing: 86, Mobility: 86, Clutch: 99 } },
  { catalogId: "build-qb-philip-rivers", displayName: "Philip Rivers", rarityBand: 4, generationWeight: 0.70, overall: 78, traits: { Arm: 86, Accuracy: 93, Processing: 93, Mobility: 35, Clutch: 78 } },
  { catalogId: "build-qb-matthew-stafford", displayName: "Matthew Stafford", rarityBand: 4, generationWeight: 0.70, overall: 89, traits: { Arm: 99, Accuracy: 93, Processing: 93, Mobility: 69, Clutch: 93 } },
  { catalogId: "build-qb-lamar-jackson", displayName: "Lamar Jackson", rarityBand: 4, generationWeight: 0.70, overall: 92, traits: { Arm: 86, Accuracy: 86, Processing: 93, Mobility: 99, Clutch: 93 } },
  { catalogId: "build-qb-josh-allen", displayName: "Josh Allen", rarityBand: 4, generationWeight: 0.70, overall: 93, traits: { Arm: 99, Accuracy: 86, Processing: 86, Mobility: 99, Clutch: 93 } },
  { catalogId: "build-qb-eli-manning", displayName: "Eli Manning", rarityBand: 3, generationWeight: 1.15, overall: 77, traits: { Arm: 86, Accuracy: 78, Processing: 78, Mobility: 42, Clutch: 99 } },
  { catalogId: "build-qb-matt-ryan", displayName: "Matt Ryan", rarityBand: 3, generationWeight: 1.15, overall: 80, traits: { Arm: 78, Accuracy: 93, Processing: 93, Mobility: 50, Clutch: 86 } },
  { catalogId: "build-qb-russell-wilson", displayName: "Russell Wilson", rarityBand: 3, generationWeight: 1.15, overall: 89, traits: { Arm: 93, Accuracy: 93, Processing: 78, Mobility: 93, Clutch: 93 } },
  { catalogId: "build-qb-joe-burrow", displayName: "Joe Burrow", rarityBand: 3, generationWeight: 1.15, overall: 89, traits: { Arm: 86, Accuracy: 99, Processing: 99, Mobility: 69, Clutch: 93 } },
  { catalogId: "build-qb-andrew-luck", displayName: "Andrew Luck", rarityBand: 3, generationWeight: 1.15, overall: 90, traits: { Arm: 93, Accuracy: 86, Processing: 93, Mobility: 93, Clutch: 86 } },
  { catalogId: "build-qb-cam-newton", displayName: "Cam Newton", rarityBand: 3, generationWeight: 1.15, overall: 85, traits: { Arm: 93, Accuracy: 69, Processing: 78, Mobility: 99, Clutch: 86 } },
  { catalogId: "build-qb-michael-vick", displayName: "Michael Vick", rarityBand: 3, generationWeight: 1.15, overall: 77, traits: { Arm: 99, Accuracy: 69, Processing: 69, Mobility: 99, Clutch: 69 } },
  { catalogId: "build-qb-randall-cunningham", displayName: "Randall Cunningham", rarityBand: 3, generationWeight: 1.15, overall: 82, traits: { Arm: 93, Accuracy: 78, Processing: 78, Mobility: 99, Clutch: 78 } },
  { catalogId: "build-qb-donovan-mcnabb", displayName: "Donovan McNabb", rarityBand: 3, generationWeight: 1.15, overall: 85, traits: { Arm: 86, Accuracy: 78, Processing: 86, Mobility: 93, Clutch: 86 } },
  { catalogId: "build-qb-steve-mcnair", displayName: "Steve McNair", rarityBand: 3, generationWeight: 1.15, overall: 89, traits: { Arm: 86, Accuracy: 86, Processing: 86, Mobility: 93, Clutch: 93 } },
  { catalogId: "build-qb-tony-romo", displayName: "Tony Romo", rarityBand: 3, generationWeight: 1.15, overall: 86, traits: { Arm: 78, Accuracy: 93, Processing: 93, Mobility: 78, Clutch: 78 } },
  { catalogId: "build-qb-carson-palmer", displayName: "Carson Palmer", rarityBand: 3, generationWeight: 1.15, overall: 77, traits: { Arm: 93, Accuracy: 86, Processing: 86, Mobility: 50, Clutch: 69 } },
  { catalogId: "build-qb-boomer-esiason", displayName: "Boomer Esiason", rarityBand: 3, generationWeight: 1.15, overall: 81, traits: { Arm: 86, Accuracy: 86, Processing: 86, Mobility: 60, Clutch: 86 } },
  { catalogId: "build-qb-ken-anderson", displayName: "Ken Anderson", rarityBand: 3, generationWeight: 1.15, overall: 84, traits: { Arm: 78, Accuracy: 99, Processing: 93, Mobility: 69, Clutch: 86 } },
  { catalogId: "build-qb-ken-stabler", displayName: "Ken Stabler", rarityBand: 3, generationWeight: 1.15, overall: 82, traits: { Arm: 78, Accuracy: 86, Processing: 86, Mobility: 69, Clutch: 99 } },
  { catalogId: "build-qb-joe-namath", displayName: "Joe Namath", rarityBand: 3, generationWeight: 1.15, overall: 84, traits: { Arm: 99, Accuracy: 78, Processing: 78, Mobility: 60, Clutch: 99 } },
  { catalogId: "build-qb-sonny-jurgensen", displayName: "Sonny Jurgensen", rarityBand: 3, generationWeight: 1.15, overall: 81, traits: { Arm: 93, Accuracy: 93, Processing: 93, Mobility: 50, Clutch: 78 } },
  { catalogId: "build-qb-len-dawson", displayName: "Len Dawson", rarityBand: 3, generationWeight: 1.15, overall: 82, traits: { Arm: 78, Accuracy: 93, Processing: 93, Mobility: 60, Clutch: 93 } },
  { catalogId: "build-qb-rich-gannon", displayName: "Rich Gannon", rarityBand: 2, generationWeight: 1.25, overall: 82, traits: { Arm: 69, Accuracy: 93, Processing: 93, Mobility: 78, Clutch: 78 } },
  { catalogId: "build-qb-joe-flacco", displayName: "Joe Flacco", rarityBand: 2, generationWeight: 1.25, overall: 79, traits: { Arm: 99, Accuracy: 78, Processing: 78, Mobility: 50, Clutch: 99 } },
  { catalogId: "build-qb-drew-bledsoe", displayName: "Drew Bledsoe", rarityBand: 2, generationWeight: 1.25, overall: 66, traits: { Arm: 99, Accuracy: 78, Processing: 78, Mobility: 35, Clutch: 78 } },
  { catalogId: "build-qb-daunte-culpepper", displayName: "Daunte Culpepper", rarityBand: 2, generationWeight: 1.25, overall: 82, traits: { Arm: 99, Accuracy: 78, Processing: 69, Mobility: 93, Clutch: 69 } },
  { catalogId: "build-qb-vinny-testaverde", displayName: "Vinny Testaverde", rarityBand: 2, generationWeight: 1.25, overall: 71, traits: { Arm: 93, Accuracy: 69, Processing: 69, Mobility: 60, Clutch: 78 } },
  { catalogId: "build-qb-mark-brunell", displayName: "Mark Brunell", rarityBand: 2, generationWeight: 1.25, overall: 82, traits: { Arm: 78, Accuracy: 86, Processing: 86, Mobility: 86, Clutch: 78 } },
  { catalogId: "build-qb-jim-everett", displayName: "Jim Everett", rarityBand: 2, generationWeight: 1.25, overall: 72, traits: { Arm: 86, Accuracy: 86, Processing: 78, Mobility: 60, Clutch: 69 } },
  { catalogId: "build-qb-matt-hasselbeck", displayName: "Matt Hasselbeck", rarityBand: 2, generationWeight: 1.25, overall: 79, traits: { Arm: 69, Accuracy: 86, Processing: 93, Mobility: 60, Clutch: 86 } },
  { catalogId: "build-qb-kirk-cousins", displayName: "Kirk Cousins", rarityBand: 2, generationWeight: 1.25, overall: 78, traits: { Arm: 78, Accuracy: 93, Processing: 93, Mobility: 50, Clutch: 78 } },
  { catalogId: "build-qb-dak-prescott", displayName: "Dak Prescott", rarityBand: 2, generationWeight: 1.25, overall: 86, traits: { Arm: 93, Accuracy: 86, Processing: 86, Mobility: 86, Clutch: 78 } },
  { catalogId: "build-qb-jay-cutler", displayName: "Jay Cutler", rarityBand: 1, generationWeight: 1.00, overall: 77, traits: { Arm: 99, Accuracy: 78, Processing: 60, Mobility: 78, Clutch: 69 } },
  { catalogId: "build-qb-jeff-george", displayName: "Jeff George", rarityBand: 1, generationWeight: 1.00, overall: 65, traits: { Arm: 99, Accuracy: 69, Processing: 50, Mobility: 60, Clutch: 50 } },
  { catalogId: "build-qb-justin-herbert", displayName: "Justin Herbert", rarityBand: 1, generationWeight: 1.00, overall: 85, traits: { Arm: 99, Accuracy: 93, Processing: 86, Mobility: 86, Clutch: 69 } },
  { catalogId: "build-qb-jalen-hurts", displayName: "Jalen Hurts", rarityBand: 1, generationWeight: 1.00, overall: 88, traits: { Arm: 86, Accuracy: 78, Processing: 86, Mobility: 99, Clutch: 93 } },
  { catalogId: "build-qb-kyler-murray", displayName: "Kyler Murray", rarityBand: 1, generationWeight: 1.00, overall: 83, traits: { Arm: 93, Accuracy: 86, Processing: 78, Mobility: 99, Clutch: 69 } },
  { catalogId: "build-qb-jared-goff", displayName: "Jared Goff", rarityBand: 1, generationWeight: 1.00, overall: 80, traits: { Arm: 86, Accuracy: 93, Processing: 93, Mobility: 42, Clutch: 86 } },
  { catalogId: "build-qb-baker-mayfield", displayName: "Baker Mayfield", rarityBand: 1, generationWeight: 1.00, overall: 84, traits: { Arm: 93, Accuracy: 86, Processing: 78, Mobility: 78, Clutch: 86 } },
  { catalogId: "build-qb-matt-schaub", displayName: "Matt Schaub", rarityBand: 1, generationWeight: 1.00, overall: 74, traits: { Arm: 78, Accuracy: 86, Processing: 86, Mobility: 50, Clutch: 69 } },
] as const;
