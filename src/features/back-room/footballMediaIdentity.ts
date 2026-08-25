import type { FootballComparisonDepthAssetSpec } from "./footballComparisonDepthCatalog";

export type FootballTeamMediaId = `nfl:${string}` | `cfb:${string}`;

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function footballNflTeamMediaId(teamCode: string): FootballTeamMediaId {
  return `nfl:${teamCode.toLowerCase()}`;
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
