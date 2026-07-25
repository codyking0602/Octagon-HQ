import type { RankingFighter } from "../rankings/rankingModel";

export function dailyRankingSpotlight(
  fighters: readonly RankingFighter[],
  day: string,
) {
  if (!fighters.length) return null;
  const timestamp = Date.parse(`${day}T12:00:00Z`);
  const dayNumber = Number.isFinite(timestamp)
    ? Math.floor(timestamp / 86_400_000)
    : 0;
  const index = ((dayNumber % fighters.length) + fighters.length) % fighters.length;
  return fighters[index] ?? null;
}
