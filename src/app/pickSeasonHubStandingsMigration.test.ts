import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  "supabase/migrations/202608170001_pick_season_hub_standings.sql",
  "utf8",
);
const repository = readFileSync("src/features/picks/picksRepository.ts", "utf8");
const seasonHub = readFileSync("src/features/picks/PicksSeasonHub.tsx", "utf8");

describe("Picks season hub standings projection", () => {
  it("extends the existing history projection rather than adding another browser read owner", () => {
    expect(sql).toContain("create or replace function public.get_my_pick_history");
    expect(sql).not.toContain("create or replace function public.get_pick_season_standings");
    expect(repository).toContain('client.rpc("get_my_pick_history"');
    expect(repository).not.toContain("get_pick_season_standings");
  });

  it("uses stable member identity and automatically aggregates every completed-event entrant", () => {
    expect(sql).toContain("entrant.profile_id");
    expect(sql).toContain("'profile_id', profile_id");
    expect(sql).toContain("count(*)::integer events_entered");
    expect(sql).toContain("from group_scores");
    expect(sql).toContain("group by profile_id, display_name");
  });

  it("ranks the season only by total points so equal totals remain tied", () => {
    expect(sql).toContain("rank() over (order by base_points + lock_bonus desc)::integer rank");
    expect(sql).not.toContain("rank() over (order by base_points + lock_bonus desc, correct desc)");
    expect(sql).toContain("'season_standings', standings.items");
  });

  it("keeps win percentage presentational and excludes undecided or excluded outcomes", () => {
    expect(seasonHub).toContain("pickWinPercentage(correct, incorrect)");
    expect(seasonHub).toContain("WIN");
    expect(seasonHub).not.toContain("excluded / ");
    expect(seasonHub).not.toContain("missing / ");
  });
});
