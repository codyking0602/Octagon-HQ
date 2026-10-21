import ownerHeaders from "./footballWeeklyHeaderOverrides.json";

/** An owner image is an immutable, revisioned asset, not a replacement for
 * the canonical published Game of the Week or its SeatGeek source. */
export interface FootballOwnerHeader {
  week_of: string;
  sport: "cfb" | "nfl";
  away_team: string;
  home_team: string;
  asset_path: string;
}
export interface FootballHeaderArtwork {
  primary: string | null;
  fallback: string | null;
  ownerProvided: boolean;
}

const normalize = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
const ownerEntries = ownerHeaders as FootballOwnerHeader[];

export function resolveFootballWeeklyHeaderArtwork(
  game: { id: string; teams: readonly { name: string }[]; headerAssetPath?: string },
  entries: readonly FootballOwnerHeader[] = ownerEntries,
): FootballHeaderArtwork {
  const seatGeek = game.headerAssetPath ?? null;
  const match = /^weekly-(\d{4}-\d{2}-\d{2})-(cfb|nfl)$/.exec(game.id);
  if (!match || game.teams.length !== 2) return { primary: seatGeek, fallback: null, ownerProvided: false };
  const [, week, sport] = match;
  const owner = entries.find((item) =>
    item.week_of === week && item.sport === sport
    && normalize(item.away_team) === normalize(game.teams[0]!.name)
    && normalize(item.home_team) === normalize(game.teams[1]!.name)
    && item.asset_path.startsWith(`/assets/football/weekly/${week}/${sport}/`)
    && /^owner-header-[a-z0-9-]+\.webp$/.test(item.asset_path.split("/").at(-1) ?? "")
  );
  if (!owner) return { primary: seatGeek, fallback: null, ownerProvided: false };
  return { primary: owner.asset_path, fallback: seatGeek, ownerProvided: true };
}

/** Broken/missing custom art must never prevent a published weekly header from
 * showing its existing verified SeatGeek artwork, then the CSS matchup. */
export function usableFootballWeeklyHeaderArtwork(
  artwork: FootballHeaderArtwork,
  failedSources: readonly string[],
): string | null {
  if (artwork.primary && !failedSources.includes(artwork.primary)) return artwork.primary;
  return artwork.fallback && !failedSources.includes(artwork.fallback) ? artwork.fallback : null;
}
