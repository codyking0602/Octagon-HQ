import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { loadUfcMonthlyChampionship } from "./sportChampionshipRepository";

const migration = readFileSync("supabase/migrations/202612310410_ufc_monthly_championship.sql", "utf8");
const profileId = "11111111-1111-4111-8111-111111111111";
const entry = {
  profile_id: profileId, display_name: "TEST", initials: "TE",
  is_current_user: true, rank: 1, rating: 92,
  picks_rating: 90, daily_rating: 95, featured_rating: 0,
  play_rating: 95, picks_rank: 1, daily_rank: 1, featured_rank: 1, play_rank: 1,
  picks_played: 4, daily_played: 15, featured_played: 0, event_results: [],
};
const month = {
  month_start: "2026-11-01", month_end: "2026-11-30",
  winner: entry, entries: [entry],
  weights: { picks: 60, daily: 40, featured: 0 },
  event_counts: { picks: 4, daily: 15, featured: 0 },
};

describe("UFC monthly championship cutover", () => {
  it("shares the original placement/weight authority and guards incomplete boards and Picks", () => {
    expect(migration).toContain("private.sport_championship_week_projection(");
    expect(migration).toContain("'ufc', p_season, v_month, v_month_end");
    expect(migration).toContain("private.daily_challenge_active_day");
    expect(migration).toContain("private.ufc_monthly_championship_release_day(v_month)");
    expect(migration).toContain("challenge.fallback_reason is null");
    expect(migration).toContain("event.status <> 'complete'");
    expect(migration).toContain("date '2026-12-02'");
    expect(migration).toContain("date '2027-01-01'");
    expect(migration).toContain("date '2026-10-19'");
    expect(migration).toContain("date ''2026-10-12''");
    expect(migration).toContain("return null; end if");
    expect(migration).not.toContain("delete from private.daily_challenge_history");
    expect(migration).toContain("grant execute on function public.get_ufc_monthly_championship(integer) to authenticated");
  });

  it("accepts a completed November 60/40 award and rejects premature/malformed awards", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: { sport: "ufc", season: 2026, latest: month, months: [month] },
      error: null,
    });
    const value = await loadUfcMonthlyChampionship(2026, { rpc });
    expect(value.latest?.month_start).toBe("2026-11-01");
    expect(value.latest?.month_end).toBe("2026-11-30");
    expect(value.latest?.winner.display_name).toBe("TEST");
    expect(value.latest?.weights).toEqual({ picks: 60, daily: 40, featured: 0 });
    expect(rpc).toHaveBeenCalledWith("get_ufc_monthly_championship", { p_season: 2026 });

    rpc.mockResolvedValueOnce({
      data: { sport: "ufc", season: 2026, latest: null, months: [] },
      error: null,
    });
    expect((await loadUfcMonthlyChampionship(2026, { rpc })).latest).toBeNull();

    rpc.mockResolvedValueOnce({
      data: { sport: "ufc", season: 2026, latest: { ...month, winner: { ...entry, rank: -1 } }, months: [month] },
      error: null,
    });
    await expect(loadUfcMonthlyChampionship(2026, { rpc })).rejects.toThrow();
  });
});
