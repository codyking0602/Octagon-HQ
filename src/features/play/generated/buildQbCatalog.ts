import { buildFootballBuildQbTraitProfiles } from "../../back-room/footballPositionTraitRatings";
import type { BuildQbTrait } from "../draftRoomContract";

export const FOOTBALL_BUILD_QB_CATALOG_VERSION = "football-draft-room-2026-09-v2" as const;
export const FOOTBALL_BUILD_QB_RARITY_VERSION = "football-draft-room-rarity-2026-09-v2" as const;
export const FOOTBALL_BUILD_QB_GRADING_VERSION = "football-build-qb-traits-2026-09-v2" as const;

export interface GeneratedBuildQbCatalogRow {
  subjectId: string;
  displayName: string;
  rarityBand: 1 | 2 | 3 | 4 | 5;
  overall: number;
  traits: Readonly<Record<BuildQbTrait, number>>;
}

// Generated deployment projection. The canonical audited model is the only ratings owner.
export const generatedBuildQbCatalog: readonly GeneratedBuildQbCatalogRow[] =
  buildFootballBuildQbTraitProfiles().map(({ subjectId, name, rarityBand, overall, traits }) => ({
    subjectId, displayName: name, rarityBand, overall, traits,
  }));
