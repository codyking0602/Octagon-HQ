import { buildFootballCfbBuildQbTraitProfiles, type CfbBuildQbQualityBand } from "../../back-room/footballCfbBuildQbTraitRatings";
import type { BuildQbTrait } from "../draftRoomContract";

export const FOOTBALL_CFB_BUILD_QB_CATALOG_VERSION = "football-draft-room-2026-09-v4";
export const FOOTBALL_CFB_BUILD_QB_RARITY_VERSION = "football-draft-room-rarity-2026-09-v3";
export const FOOTBALL_CFB_BUILD_QB_GRADING_VERSION = "football-build-qb-traits-2026-09-v1";

export interface GeneratedCfbBuildQbCatalogEntry {
  itemReference: string;
  displayLabel: string;
  peakSeason: number;
  school: string;
  canonicalPlayerId: string;
  rarityBand: CfbBuildQbQualityBand;
  generationWeight: number;
  gradingInputs: Readonly<Record<BuildQbTrait, number>> & { overall: number };
}

export const generatedCfbBuildQbCatalog: readonly GeneratedCfbBuildQbCatalogEntry[] =
  buildFootballCfbBuildQbTraitProfiles().map((profile) => ({
    itemReference: profile.catalogId,
    displayLabel: profile.name,
    peakSeason: profile.peakSeason,
    school: profile.school,
    canonicalPlayerId: profile.canonicalPlayerId,
    rarityBand: profile.qualityBand,
    generationWeight: profile.generationWeight,
    gradingInputs: { ...profile.traits, overall: profile.overall },
  }));
