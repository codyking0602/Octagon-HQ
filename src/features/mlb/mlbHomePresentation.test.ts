import { describe, expect, it } from "vitest";
import { mlbPostseasonPickRecord, mlbCompactSeriesStatus } from "./mlbHomePresentation";
import type { MlbPlayoffSeries } from "./mlbPlayoffsRepository";

function game(id: string, round: MlbPlayoffSeries["round"], winner: string | null, status = "complete"): MlbPlayoffSeries {
  return {
    series_id: id, round, league: "AL", label: id, team_a_id: "a", team_a_name: "Tampa Bay Rays",
    team_b_id: "b", team_b_name: "Milwaukee Brewers", starts_at: "2026-10-23T19:00:00-05:00",
    status, winner_team_id: winner, series_score: winner ? "4-2" : null, schedule: [],
    team_a_moneyline: null, team_b_moneyline: null, odds_source: null, odds_updated_at: null,
  };
}
describe("Owner compact MLB postseason presentation", () => {
  it("counts settled picks across past and current rounds without counting pending games", () => {
    const series = [game("wc", "wild_card", "a"), game("ds", "division_series", "b"),
      game("cs", "championship_series", "a"), game("ws", "world_series", null, "scheduled")];
    const picks = [
      { series_id: "wc", winner_team_id: "a", picked_at: "2026-09-01" },
      { series_id: "ds", winner_team_id: "a", picked_at: "2026-09-01" },
      { series_id: "cs", winner_team_id: "a", picked_at: "2026-09-01" },
      { series_id: "ws", winner_team_id: "b", picked_at: "2026-09-01" },
    ];
    expect(mlbPostseasonPickRecord(series, picks)).toEqual({ wins: 2, losses: 1, settled: 3 });
  });
  it("does not invent results when a series is past its scheduled start", () => {
    expect(mlbCompactSeriesStatus(game("ws", "world_series", null, "scheduled"), new Date("2026-10-24T12:00:00Z")))
      .toBe("SERIES UPDATE PENDING");
    expect(mlbCompactSeriesStatus(game("ws", "world_series", "b"), new Date("2026-10-24T12:00:00Z")))
      .toBe("FINAL · Milwaukee Brewers · 4-2");
    expect(mlbCompactSeriesStatus(game("ws", "world_series", null, "active")))
      .toBe("SERIES IN PROGRESS");
  });
});
