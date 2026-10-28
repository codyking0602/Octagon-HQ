import type { MlbPlayoffSeries, MlbPlayoffsHub } from "./mlbPlayoffsRepository";

/** Use all rounds of the official postseason, not just the currently featured round. */
export function mlbPostseasonPickRecord(
  series: readonly MlbPlayoffSeries[],
  ownPicks: MlbPlayoffsHub["ownRoundPicks"],
) {
  const settledWinners = new Map(
    series.filter((game) => game.winner_team_id).map((game) => [game.series_id, game.winner_team_id]),
  );
  let wins = 0;
  let losses = 0;
  for (const pick of ownPicks) {
    const winner = settledWinners.get(pick.series_id);
    if (!winner) continue;
    if (pick.winner_team_id === winner) wins += 1;
    else losses += 1;
  }
  return { wins, losses, settled: wins + losses };
}

/** A past start time is not an upcoming game. Only the official result settles a series. */
export function mlbCompactSeriesStatus(series: MlbPlayoffSeries, now = new Date()) {
  if (series.status === "complete" && series.winner_team_id) {
    const winner = series.winner_team_id === series.team_a_id
      ? series.team_a_name
      : series.winner_team_id === series.team_b_id
        ? series.team_b_name : null;
    return winner ? `FINAL · ${winner}${series.series_score ? ` · ${series.series_score}` : ""}` : "FINAL";
  }
  if (series.status === "active") {
    return series.series_score ? `SERIES IN PROGRESS · ${series.series_score}` : "SERIES IN PROGRESS";
  }
  if (!series.starts_at || !Number.isFinite(Date.parse(series.starts_at))) return "START TIME TBD";
  const startsAt = new Date(series.starts_at);
  if (startsAt.getTime() <= now.getTime()) return "SERIES UPDATE PENDING";
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  }).format(startsAt);
}
