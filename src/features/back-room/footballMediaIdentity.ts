import type { FootballComparisonDepthAssetSpec } from "./footballComparisonDepthCatalog";

export type FootballTeamMediaId = `nfl:${string}` | `cfb:${string}`;

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/a\s*&\s*m/g, "am")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const NFL_TEAM_MEDIA_CODE_ALIASES: Readonly<Record<string, string>> = {
  la: "lar",
  was: "wsh",
};

export function footballNflTeamMediaCode(teamCode: string): string {
  const normalized = teamCode.trim().toLowerCase();
  return NFL_TEAM_MEDIA_CODE_ALIASES[normalized] ?? normalized;
}

export function footballNflTeamMediaId(teamCode: string): FootballTeamMediaId {
  return `nfl:${footballNflTeamMediaCode(teamCode)}`;
}

export function footballCfbTeamMediaId(teamId: string): FootballTeamMediaId {
  return `cfb:${slugify(teamId)}`;
}

export function footballTeamMediaIdFromComparisonAsset(asset: FootballComparisonDepthAssetSpec): FootballTeamMediaId {
  return asset.kind === "nfl"
    ? footballNflTeamMediaId(asset.team)
    : footballCfbTeamMediaId(asset.label);
}

export function footballCfbTeamMediaIdFromSeasonSubjectId(subjectId: string): FootballTeamMediaId | null {
  const match = /^\d{4}-(.+)$/.exec(subjectId);
  return match ? footballCfbTeamMediaId(match[1]) : null;
}
