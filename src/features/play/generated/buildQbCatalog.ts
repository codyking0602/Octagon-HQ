import type { BuildQbTrait } from "../draftRoomContract";
import { buildFootballBuildQbTraitProfiles, type BuildQbQualityBand } from "../../back-room/footballPositionTraitRatings";

export const FOOTBALL_BUILD_QB_CATALOG_VERSION = "football-draft-room-2026-09-v2" as const;
export const FOOTBALL_BUILD_QB_RARITY_VERSION = "football-draft-room-rarity-2026-09-v2" as const;
export const FOOTBALL_BUILD_QB_GRADING_VERSION = "football-build-qb-traits-2026-09-v1" as const;

export interface GeneratedBuildQbCatalogRow {
  subjectId: string;
  displayName: string;
  qualityBand: BuildQbQualityBand;
  generationClass: `qb-${BuildQbQualityBand}`;
  generationWeight: number;
  rarityBand: 1 | 2 | 3 | 4 | 5;
  overall: number;
  traits: Readonly<Record<BuildQbTrait, number>>;
}

// Generated deployment view from the canonical Football position-trait model.
// This temporary calculated view is replaced by the checked-in generated output
// after the competitive-model audit is frozen for backend deployment.
export const generatedBuildQbCatalog: readonly GeneratedBuildQbCatalogRow[] =
  buildFootballBuildQbTraitProfiles().map((profile) => ({
    subjectId: profile.subjectId,
    displayName: profile.name,
    qualityBand: profile.qualityBand,
    generationClass: profile.generationClass,
    generationWeight: profile.generationWeight,
    rarityBand: profile.rarityBand,
    overall: profile.overall,
    traits: profile.traits,
  }));
