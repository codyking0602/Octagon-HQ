import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildFootballWeekPreview, footballWeekRange, rankCollegeFootballCandidates, summarizeFootballWeekEvents } from "./week";

function event(id: string, kickoff: string, homeRank: number | null, awayRank: number | null, seasonType = 2) {
  const competitor = (homeAway: "home" | "away", name: string, rank: number | null) => ({
    homeAway,
    team: { displayName: name },
    ...(rank ? { curatedRank: { current: rank } } : {}),
  });
  return {
    id,
    date: kickoff,
    season: { type: seasonType },
    competitions: [{
      date: kickoff,
      competitors: [competitor("home", `Home ${id}`, homeRank), competitor("away", `Away ${id}`, awayRank)],
    }],
  };
}

describe("Football weekly owner discovery", () => {
  it("uses an exact Tuesday-Monday boundary", () => {
    expect(footballWeekRange("2026-09-08")).toEqual({
      weekStart: "2026-09-08",
      weekEnd: "2026-09-14",
      dates: ["2026-09-08", "2026-09-09", "2026-09-10", "2026-09-11", "2026-09-12", "2026-09-13", "2026-09-14"],
    });
    expect(() => footballWeekRange("2026-09-09")).toThrow(/Tuesday/);
  });

  it("fetches each ESPN weekly schedule as one Tuesday-Monday range request", () => {
    const source = readFileSync("supabase/functions/sync-next-football-event/index.ts", "utf8");

    expect(source).toContain('const dateRange = `${range.weekStart.replaceAll("-", "")}-${range.weekEnd.replaceAll("-", "")}`;');
    expect(source).toContain("scoreboard?dates=${dateRange}&limit=1000${group}");
    expect(source).not.toContain("Promise.all(range.dates.map");
  });

  it("keeps every eligible NFL game and excludes preseason games", () => {
    const games = summarizeFootballWeekEvents([
      event("101", "2026-09-10T00:00:00Z", null, null),
      event("102", "2026-09-13T17:00:00Z", null, null),
      event("999", "2026-09-12T17:00:00Z", null, null, 1),
    ], "nfl");
    expect(games.map((game) => game.espn_event_id)).toEqual(["101", "102"]);
  });

  it("ranks ranked-on-ranked college games ahead of one-ranked and unranked games", () => {
    const candidates = rankCollegeFootballCandidates([
      event("201", "2026-09-12T19:30:00Z", null, null),
      event("202", "2026-09-12T16:00:00Z", 2, null),
      event("203", "2026-09-12T23:30:00Z", 10, 20),
    ]);
    expect(candidates.map((game) => game.espn_event_id)).toEqual(["203", "202", "201"]);
    expect(candidates.map((game) => game.candidate_rank)).toEqual([1, 2, 3]);
  });

  it("caps the college pool at 12 and requires eight when available", () => {
    const college = Array.from({ length: 14 }, (_, index) => event(String(300 + index), `2026-09-12T${String(10 + index).padStart(2, "0")}:00:00Z`, index < 10 ? index + 1 : null, null));
    const preview = buildFootballWeekPreview("2026-09-08", [event("401", "2026-09-10T00:00:00Z", null, null)], college);
    expect(preview.nfl_games).toHaveLength(1);
    expect(preview.college_candidates).toHaveLength(12);
    expect(preview.required_college_count).toBe(8);
  });
});
