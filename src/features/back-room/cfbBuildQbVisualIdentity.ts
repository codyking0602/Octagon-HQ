import { footballCfbTeamMediaId } from "./footballMediaIdentity";
import { footballTeamAssets } from "./footballSubjectAssets";
import { buildFootballCfbBuildQbTraitProfiles } from "./footballCfbBuildQbTraitRatings";
import type { BuildQbVisualIdentity } from "./buildQbVisualIdentity";

export const CFB_BUILD_QB_HERO_IMAGE = "/assets/football/build-qb-trevor-lawrence-clemson-hero.webp";

const CFB_BUILD_QB_SCHOOL_COLORS: Readonly<Record<string, readonly [string, string]>> = {
  "Auburn": ["#0C2340", "#F26522"],
  "Texas": ["#BF5700", "#FFFFFF"],
  "Florida": ["#0021A5", "#FA4616"],
  "USC": ["#990000", "#FFC72C"],
  "Texas A&M": ["#500000", "#FFFFFF"],
  "Oklahoma": ["#841617", "#FDF9D8"],
  "Florida State": ["#782F40", "#CEB888"],
  "Baylor": ["#154734", "#FFB81C"],
  "Boston College": ["#8A100B", "#B29D6C"],
  "Miami": ["#F47321", "#005030"],
  "BYU": ["#002E5D", "#FFFFFF"],
  "Houston": ["#C8102E", "#FFFFFF"],
  "Nebraska": ["#E41C38", "#FFFFFF"],
  "Stanford": ["#8C1515", "#FFFFFF"],
  "Navy": ["#000000", "#C5B783"],
  "Ohio State": ["#BB0000", "#666666"],
  "Notre Dame": ["#0C2340", "#C99700"],
  "Oregon": ["#154733", "#FEE123"],
  "Mississippi State": ["#5D1725", "#FFFFFF"],
  "California": ["#003262", "#FDB515"],
  "Texas Tech": ["#CC0000", "#000000"],
  "Clemson": ["#F56600", "#522D80"],
  "Louisville": ["#AD0000", "#000000"],
  "Wyoming": ["#492F24", "#FFC425"],
  "Missouri": ["#000000", "#F1B82D"],
  "Oklahoma State": ["#FF7300", "#000000"],
  "Washington State": ["#981E32", "#5E6A71"],
  "Alabama": ["#9E1B32", "#FFFFFF"],
  "LSU": ["#461D7C", "#FDD023"],
  "Utah State": ["#0F2439", "#FFFFFF"],
  "Iowa State": ["#C8102E", "#F1BE48"],
  "Pittsburgh": ["#003594", "#FFB81C"],
  "Western Kentucky": ["#C60C30", "#FFFFFF"],
  "Ole Miss": ["#CE1126", "#14213D"],
  "Liberty": ["#002D62", "#C41230"],
  "Wake Forest": ["#9E7E38", "#000000"],
  "North Carolina": ["#7BAFD4", "#FFFFFF"],
  "TCU": ["#4D1979", "#FFFFFF"],
  "Tennessee": ["#FF8200", "#FFFFFF"],
  "Georgia": ["#BA0C2F", "#000000"],
  "Washington": ["#4B2E83", "#B7A57A"],
  "Michigan": ["#00274C", "#FFCB05"],
  "Colorado": ["#CFB87C", "#000000"],
  "Syracuse": ["#D44500", "#FFFFFF"],
  "Coastal Carolina": ["#006F71", "#A27752"],
};

function rgbChannels(hex: string) {
  const value = hex.replace("#", "");
  const number = Number.parseInt(value, 16);
  return `${(number >> 16) & 255}, ${(number >> 8) & 255}, ${number & 255}`;
}

function schoolCode(school: string) {
  const words = school.replace(/[^A-Za-z0-9 ]/g, " ").split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0]!.slice(0, 3).toUpperCase();
  return words.map((word) => word[0]).join("").slice(0, 4).toUpperCase();
}

export const CFB_BUILD_QB_SCHOOL_BY_ITEM_REFERENCE: Readonly<Record<string, string>> = Object.freeze(
  Object.fromEntries(buildFootballCfbBuildQbTraitProfiles().map((profile) => [profile.catalogId, profile.school])),
);

const identityByItemReference = new Map<string, BuildQbVisualIdentity>(
  buildFootballCfbBuildQbTraitProfiles().map((profile) => {
    const colors = CFB_BUILD_QB_SCHOOL_COLORS[profile.school];
    if (!colors) throw new Error(`Missing CFB Build a QB school colors for ${profile.school}`);
    const asset = footballTeamAssets[footballCfbTeamMediaId(profile.school)];
    if (!asset) throw new Error(`Missing canonical Football school mark for ${profile.school}`);
    return [profile.catalogId, {
      teamCode: schoolCode(profile.school),
      teamName: `${profile.school} · ${profile.peakSeason}`,
      primary: colors[0],
      primaryRgb: rgbChannels(colors[0]),
      secondary: colors[1],
      logoSrc: asset.src,
    }];
  }),
);

/** Exact catalog-reference visual projection. Player display names never select a school. */
export function cfbBuildQbVisualIdentity(itemReference: string | null | undefined) {
  if (!itemReference) return null;
  return identityByItemReference.get(itemReference) ?? null;
}
