import { BUILD_QB_TRAITS, type BuildQbTrait } from "../play/draftRoomContract";

export const CFB_BUILD_QB_TRAIT_MODEL_VERSION = "cfb-build-qb-peak-season-v1" as const;
export const CFB_BUILD_QB_MATURE_POOL_SIZE = 80 as const;
export const CFB_BUILD_QB_RESEARCH_SNAPSHOT_DATE = "2026-09-13" as const;

export const CFB_BUILD_QB_RESEARCH_SOURCES = [
  { id: "canonical-cfb-source", evidenceType: "statistics", source: "Pinned cfbfastR player-season-team corpus in data/generated/football/cfb/player-seasons-2014-2025.json" },
  { id: "canonical-cfb-recognition", evidenceType: "identity", source: "Octagon HQ canonical CFB player-season recognition and subject registry" },
  { id: "canonical-cfb-history", evidenceType: "historical", source: "Octagon HQ reviewed CFB historical facts and comparison evidence" },
  { id: "film-audit", evidenceType: "film-scouting", source: "Reviewed college-season arm talent, placement, processing, movement and high-leverage tape" },
] as const;

type CfbBuildQbResearchLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type CfbBuildQbQualityBand = 1 | 2 | 3 | 4 | 5;

export const CFB_BUILD_QB_TRAIT_RATING_BY_LEVEL: Readonly<Record<CfbBuildQbResearchLevel, number>> = {
  1: 35, 2: 42, 3: 50, 4: 60, 5: 69, 6: 78, 7: 86, 8: 93, 9: 99,
};

export const CFB_BUILD_QB_GENERATION_WEIGHT_BY_RARITY: Readonly<Record<CfbBuildQbQualityBand, number>> = {
  1: 1.00,
  2: 1.25,
  3: 1.15,
  4: 0.70,
  5: 0.18,
};

interface CfbBuildQbPeakAuditRow {
  name: string;
  peakSeason: number;
  school: string;
  canonicalPlayerId: string;
  sourceProvider: "octagon-hq" | "cfbfastR";
  qualityBand: CfbBuildQbQualityBand;
  researchLevels: Readonly<Record<BuildQbTrait, CfbBuildQbResearchLevel>>;
}

export interface CfbBuildQbTraitProfile {
  catalogId: string;
  peakSeasonIdentityId: string;
  canonicalPlayerId: string;
  sourceProvider: "octagon-hq" | "cfbfastR";
  name: string;
  peakSeason: number;
  school: string;
  qualityBand: CfbBuildQbQualityBand;
  generationWeight: number;
  traits: Readonly<Record<BuildQbTrait, number>>;
  overall: number;
}

function buildSlug(value: string) {
  return value.toLowerCase().normalize("NFKD")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function peak(
  name: string,
  peakSeason: number,
  school: string,
  canonicalPlayerId: string,
  qualityBand: CfbBuildQbQualityBand,
  levels: readonly CfbBuildQbResearchLevel[],
): CfbBuildQbPeakAuditRow {
  if (levels.length !== BUILD_QB_TRAITS.length) throw new Error(`Invalid CFB Build a QB research row for ${name}`);
  return {
    name,
    peakSeason,
    school,
    canonicalPlayerId,
    sourceProvider: canonicalPlayerId.startsWith("cfbfast-r-player-") ? "cfbfastR" : "octagon-hq",
    qualityBand,
    researchLevels: Object.fromEntries(BUILD_QB_TRAITS.map((trait, index) => [trait, levels[index]!])) as Readonly<Record<BuildQbTrait, CfbBuildQbResearchLevel>>,
  };
}

/**
 * Canonical Build a QB peak-season owner.
 * Every row owns exactly one college season and school; all five research inputs
 * describe that same season. NFL performance and cross-season best-trait mixing are prohibited.
 */
export const CFB_BUILD_QB_PEAK_SEASON_AUDIT: readonly CfbBuildQbPeakAuditRow[] = [
  peak("Cam Newton", 2010, "Auburn", "cfb-cam-newton", 5, [8, 7, 7, 9, 9]),
  peak("Vince Young", 2005, "Texas", "cfb-vince-young", 5, [7, 7, 7, 9, 9]),
  peak("Tim Tebow", 2007, "Florida", "cfb-tim-tebow", 4, [6, 6, 6, 9, 7]),
  peak("Matt Leinart", 2004, "USC", "cfb-matt-leinart", 4, [7, 8, 8, 4, 9]),
  peak("Johnny Manziel", 2012, "Texas A&M", "cfb-johnny-manziel", 4, [7, 7, 6, 9, 8]),
  peak("Colt McCoy", 2008, "Texas", "cfb-colt-mccoy", 3, [6, 9, 8, 7, 8]),
  peak("Sam Bradford", 2008, "Oklahoma", "cfb-sam-bradford", 4, [8, 9, 8, 5, 7]),
  peak("Jameis Winston", 2013, "Florida State", "cfb-jameis-winston", 5, [8, 8, 7, 6, 9]),
  peak("Robert Griffin III", 2011, "Baylor", "cfb-robert-griffin-iii", 5, [8, 9, 8, 9, 8]),
  peak("Doug Flutie", 1984, "Boston College", "cfb-doug-flutie", 3, [7, 7, 7, 8, 9]),
  peak("Vinny Testaverde", 1986, "Miami", "cfb-vinny-testaverde", 3, [9, 7, 7, 6, 6]),
  peak("Charlie Ward", 1993, "Florida State", "cfb-charlie-ward", 4, [7, 8, 8, 8, 9]),
  peak("Danny Wuerffel", 1996, "Florida", "cfb-danny-wuerffel", 4, [5, 8, 9, 4, 9]),
  peak("Ty Detmer", 1990, "BYU", "cfb-ty-detmer", 3, [5, 9, 9, 5, 8]),
  peak("Gino Torretta", 1992, "Miami", "cfb-gino-torretta", 3, [6, 7, 8, 4, 8]),
  peak("Andre Ware", 1989, "Houston", "cfb-andre-ware", 3, [9, 7, 7, 6, 6]),
  peak("Eric Crouch", 2001, "Nebraska", "cfb-eric-crouch", 3, [5, 5, 6, 9, 8]),
  peak("Jim Plunkett", 1970, "Stanford", "cfb-jim-plunkett", 4, [9, 7, 7, 6, 8]),
  peak("Roger Staubach", 1963, "Navy", "cfb-roger-staubach", 4, [7, 8, 9, 9, 9]),
  peak("Troy Smith", 2006, "Ohio State", "cfb-troy-smith", 3, [8, 8, 8, 8, 7]),
  peak("Brady Quinn", 2005, "Notre Dame", "cfb-brady-quinn", 2, [8, 7, 8, 5, 6]),
  peak("Carson Palmer", 2002, "USC", "cfb-carson-palmer", 3, [9, 8, 8, 5, 8]),
  peak("Chris Weinke", 2000, "Florida State", "cfb-chris-weinke", 2, [8, 7, 8, 3, 8]),
  peak("Jason White", 2003, "Oklahoma", "cfb-jason-white", 3, [8, 8, 8, 3, 6]),
  peak("Marcus Mariota", 2014, "Oregon", "cfbfast-r-player-511459-marcus-mariota", 5, [7, 9, 8, 9, 8]),
  peak("Dak Prescott", 2014, "Mississippi State", "cfbfast-r-player-512030-dak-prescott", 3, [7, 7, 7, 9, 7]),
  peak("Jared Goff", 2015, "California", "cfbfast-r-player-547401-jared-goff", 2, [8, 8, 8, 4, 6]),
  peak("Patrick Mahomes", 2016, "Texas Tech", "cfbfast-r-player-3139477-patrick-mahomes", 3, [9, 7, 7, 8, 6]),
  peak("Deshaun Watson", 2016, "Clemson", "cfb-deshaun-watson", 5, [8, 8, 8, 8, 9]),
  peak("Lamar Jackson", 2016, "Louisville", "cfb-lamar-jackson", 5, [7, 7, 6, 9, 7]),
  peak("Baker Mayfield", 2017, "Oklahoma", "cfb-baker-mayfield", 5, [8, 9, 9, 7, 8]),
  peak("Josh Allen", 2016, "Wyoming", "cfbfast-r-player-3918298-josh-allen", 1, [9, 5, 5, 8, 6]),
  peak("Drew Lock", 2017, "Missouri", "cfbfast-r-player-3924327-drew-lock", 1, [9, 6, 6, 5, 5]),
  peak("Mason Rudolph", 2017, "Oklahoma State", "cfbfast-r-player-3116407-mason-rudolph", 2, [8, 8, 7, 5, 6]),
  peak("Sam Darnold", 2016, "USC", "cfbfast-r-player-3912547-sam-darnold", 2, [8, 7, 7, 7, 8]),
  peak("Gardner Minshew", 2018, "Washington State", "cfbfast-r-player-4038524-gardner-minshew", 2, [6, 8, 8, 6, 8]),
  peak("Kyler Murray", 2018, "Oklahoma", "cfb-kyler-murray", 5, [9, 8, 8, 9, 7]),
  peak("Tua Tagovailoa", 2018, "Alabama", "cfb-tua-tagovailoa", 4, [7, 9, 8, 7, 8]),
  peak("Trevor Lawrence", 2019, "Clemson", "cfb-trevor-lawrence", 4, [9, 8, 8, 8, 8]),
  peak("Joe Burrow", 2019, "LSU", "cfb-joe-burrow", 5, [8, 9, 9, 7, 9]),
  peak("Jalen Hurts", 2019, "Oklahoma", "cfbfast-r-player-4040715-jalen-hurts", 4, [7, 7, 7, 9, 8]),
  peak("Justin Fields", 2019, "Ohio State", "cfb-justin-fields", 4, [8, 8, 8, 9, 8]),
  peak("Justin Herbert", 2019, "Oregon", "cfbfast-r-player-4038941-justin-herbert", 3, [9, 7, 7, 7, 8]),
  peak("Jordan Love", 2018, "Utah State", "cfbfast-r-player-4036378-jordan-love", 1, [9, 7, 6, 7, 6]),
  peak("Mac Jones", 2020, "Alabama", "cfbfast-r-player-4241464-mac-jones", 4, [7, 9, 9, 4, 9]),
  peak("Kyle Trask", 2020, "Florida", "cfbfast-r-player-4034946-kyle-trask", 2, [7, 8, 8, 4, 6]),
  peak("Zach Wilson", 2020, "BYU", "cfbfast-r-player-4361259-zach-wilson", 1, [9, 8, 7, 8, 7]),
  peak("Sam Howell", 2020, "North Carolina", "cfbfast-r-player-4426875-sam-howell", 2, [8, 8, 7, 7, 6]),
  peak("Spencer Rattler", 2020, "Oklahoma", "cfbfast-r-player-4426339-spencer-rattler", 1, [9, 8, 6, 7, 6]),
  peak("Brock Purdy", 2020, "Iowa State", "cfbfast-r-player-4361741-brock-purdy", 2, [6, 7, 7, 7, 7]),
  peak("Bryce Young", 2021, "Alabama", "cfb-bryce-young", 5, [7, 9, 9, 8, 9]),
  peak("C.J. Stroud", 2021, "Ohio State", "cfbfast-r-player-4432577-c-j-stroud", 4, [9, 9, 8, 5, 7]),
  peak("Kenny Pickett", 2021, "Pittsburgh", "cfbfast-r-player-4240703-kenny-pickett", 3, [7, 8, 8, 7, 8]),
  peak("Bailey Zappe", 2021, "Western Kentucky", "cfbfast-r-player-4250360-bailey-zappe", 1, [6, 8, 8, 3, 7]),
  peak("Matt Corral", 2021, "Ole Miss", "cfbfast-r-player-4362874-matt-corral", 2, [8, 8, 7, 8, 7]),
  peak("Malik Willis", 2021, "Liberty", "cfbfast-r-player-4242512-malik-willis", 1, [9, 5, 5, 9, 5]),
  peak("Sam Hartman", 2021, "Wake Forest", "cfbfast-r-player-4361994-sam-hartman", 2, [7, 7, 7, 6, 6]),
  peak("Caleb Williams", 2022, "USC", "cfb-caleb-williams", 5, [9, 8, 7, 9, 8]),
  peak("Max Duggan", 2022, "TCU", "cfbfast-r-player-4427105-max-duggan", 3, [7, 7, 7, 8, 9]),
  peak("Drake Maye", 2022, "North Carolina", "cfbfast-r-player-4431452-drake-maye", 4, [9, 8, 8, 8, 7]),
  peak("Hendon Hooker", 2022, "Tennessee", "cfbfast-r-player-4240858-hendon-hooker", 4, [8, 9, 8, 8, 8]),
  peak("Stetson Bennett", 2022, "Georgia", "cfbfast-r-player-4259553-stetson-bennett", 3, [6, 8, 8, 7, 9]),
  peak("Michael Penix Jr.", 2023, "Washington", "cfb-michael-penix-jr", 4, [9, 8, 8, 4, 9]),
  peak("Bo Nix", 2023, "Oregon", "cfb-bo-nix", 4, [7, 9, 9, 7, 7]),
  peak("Jayden Daniels", 2023, "LSU", "cfb-jayden-daniels", 5, [8, 9, 8, 9, 8]),
  peak("J.J. McCarthy", 2023, "Michigan", "cfbfast-r-player-4433970-j-j-mccarthy", 3, [8, 8, 8, 7, 8]),
  peak("Jordan Travis", 2023, "Florida State", "cfbfast-r-player-4360799-jordan-travis", 3, [7, 8, 8, 8, 8]),
  peak("Quinn Ewers", 2023, "Texas", "cfb-quinn-ewers", 2, [8, 8, 7, 5, 8]),
  peak("Dillon Gabriel", 2024, "Oregon", "cfbfast-r-player-4427238-dillon-gabriel", 3, [7, 8, 9, 7, 8]),
  peak("Shedeur Sanders", 2024, "Colorado", "cfb-shedeur-sanders", 3, [8, 9, 8, 6, 7]),
  peak("Cameron Ward", 2024, "Miami", "cfbfast-r-player-4688380-cameron-ward", 3, [9, 8, 7, 8, 7]),
  peak("Jaxson Dart", 2024, "Ole Miss", "cfbfast-r-player-4689114-jaxson-dart", 3, [8, 8, 8, 7, 7]),
  peak("Will Howard", 2024, "Ohio State", "cfbfast-r-player-4429955-will-howard", 4, [8, 8, 8, 7, 9]),
  peak("Kyle McCord", 2024, "Syracuse", "cfbfast-r-player-4433971-kyle-mccord", 1, [8, 8, 7, 4, 7]),
  peak("Jalen Milroe", 2023, "Alabama", "cfbfast-r-player-4432734-jalen-milroe", 3, [9, 6, 6, 9, 8]),
  peak("Carson Beck", 2023, "Georgia", "cfbfast-r-player-4430841-carson-beck", 2, [8, 9, 8, 5, 7]),
  peak("Riley Leonard", 2024, "Notre Dame", "cfbfast-r-player-4683423-riley-leonard", 3, [6, 7, 8, 9, 9]),
  peak("Kaidon Salter", 2023, "Liberty", "cfbfast-r-player-4432803-kaidon-salter", 1, [8, 7, 6, 9, 7]),
  peak("Grayson McCall", 2021, "Coastal Carolina", "cfbfast-r-player-4427936-grayson-mccall", 1, [6, 9, 8, 7, 7]),
  peak("D'Eriq King", 2018, "Houston", "cfbfast-r-player-4039300-d-eriq-king", 1, [7, 7, 7, 9, 6]),
] as const;

export function buildFootballCfbBuildQbTraitProfiles(): readonly CfbBuildQbTraitProfile[] {
  if (CFB_BUILD_QB_PEAK_SEASON_AUDIT.length !== CFB_BUILD_QB_MATURE_POOL_SIZE) {
    throw new Error(`CFB Build a QB requires exactly ${CFB_BUILD_QB_MATURE_POOL_SIZE} audited peak seasons.`);
  }

  const canonicalPlayers = new Set<string>();
  const catalogIds = new Set<string>();

  return CFB_BUILD_QB_PEAK_SEASON_AUDIT.map((row) => {
    if (canonicalPlayers.has(row.canonicalPlayerId)) {
      throw new Error(`Duplicate canonical CFB Build a QB player identity: ${row.canonicalPlayerId}`);
    }
    canonicalPlayers.add(row.canonicalPlayerId);

    const catalogId = `cfb-build-qb-${buildSlug(row.name)}-${row.peakSeason}`;
    if (catalogIds.has(catalogId)) throw new Error(`Duplicate CFB Build a QB catalog identity: ${catalogId}`);
    catalogIds.add(catalogId);

    const traits = Object.fromEntries(BUILD_QB_TRAITS.map((trait) => [
      trait,
      CFB_BUILD_QB_TRAIT_RATING_BY_LEVEL[row.researchLevels[trait]],
    ])) as Readonly<Record<BuildQbTrait, number>>;
    const overall = Math.round(BUILD_QB_TRAITS.reduce((sum, trait) => sum + traits[trait], 0) / BUILD_QB_TRAITS.length);

    return {
      catalogId,
      peakSeasonIdentityId: `${row.canonicalPlayerId}@${row.peakSeason}:${buildSlug(row.school)}`,
      canonicalPlayerId: row.canonicalPlayerId,
      sourceProvider: row.sourceProvider,
      name: row.name,
      peakSeason: row.peakSeason,
      school: row.school,
      qualityBand: row.qualityBand,
      generationWeight: CFB_BUILD_QB_GENERATION_WEIGHT_BY_RARITY[row.qualityBand],
      traits,
      overall,
    };
  });
}

const CFB_BUILD_QB_PROFILE_BY_CATALOG_ID = new Map(
  buildFootballCfbBuildQbTraitProfiles().map((profile) => [profile.catalogId, profile]),
);

/** Exact catalog-reference lookup only. Rendered player names never own identity. */
export function cfbBuildQbProfileForItemReference(itemReference: string | null | undefined) {
  if (!itemReference) return null;
  return CFB_BUILD_QB_PROFILE_BY_CATALOG_ID.get(itemReference) ?? null;
}
