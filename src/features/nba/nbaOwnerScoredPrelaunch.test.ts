import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { nbaOwnerPreviewDaily, NBA_OFFICIAL_GAMES_RELEASE_READY } from "./nbaDailySchedule";
import { createTodayChallengeRepository } from "../play/todayChallengeRepository";
import { buildNbaServerDailyPublication } from "./nbaDailyServerPublication";

const migration = readFileSync("supabase/migrations/202612310324_nba_owner_scored_prelaunch.sql", "utf8");
const edge = readFileSync("supabase/functions/daily-challenge-runtime/index.ts", "utf8");
const page = readFileSync("src/features/nba/NbaOfficialDailyPage.tsx", "utf8");
const play = readFileSync("src/features/nba/NbaPlayPage.tsx", "utf8");

describe("NBA owner-only scored Oct 23–31 prelaunch", () => {
  it("keeps all public release flags closed and separates preview from public season standings", () => {
    expect(NBA_OFFICIAL_GAMES_RELEASE_READY).toBe(false);
    expect(edge).toContain("const NBA_DAILY_EDGE_RELEASE_READY = false;");
    expect(migration).toContain("'nba-owner-prelaunch-v1'");
    expect(migration).toContain("'nba_preview'");
    expect(migration).toContain("get_nba_owner_prelaunch_materialization_request");
    expect(migration).toContain("NBA prelaunch tests are restricted to the HQ owner");
    expect(migration).toContain("NBA prelaunch attempts are owner-only");
    expect(edge).toContain('identity.data?.normalized_name !== "CODY"');
    expect(edge).toContain('"NBA_OWNER_TEST_FORBIDDEN"');
    expect(edge).toContain('admin.rpc("is_pick_control_owner"');
  });

  it("publishes only the daily game for each of the nine distinct preview dates", () => {
    const dates = Array.from({ length: 9 }, (_, i) =>
      new Date(Date.UTC(2026, 9, 23 + i)).toISOString().slice(0, 10));
    expect(new Set(dates.map(d => nbaOwnerPreviewDaily(d))).size).toBe(9);
    for (const day of dates) {
      const game = nbaOwnerPreviewDaily(day)!;
      const published = buildNbaServerDailyPublication(day, "nba-owner-prelaunch-v1", game);
      expect(published.gameType).toBe(game);
      expect(published.scheduleVersion).toBe("nba-owner-prelaunch-v1");
      expect(published.publicSetup).toBeTruthy();
      expect(published.privateGradingEvidence).toBeTruthy();
    }
    expect(() => buildNbaServerDailyPublication("2026-11-01", "nba-owner-prelaunch-v1", "average_fan")).toThrow();
  });

  it("persists through the same signed-in Edge path but reads isolated test leaderboards", async () => {
    const invoke = vi.fn().mockResolvedValue({ data: null, error: null });
    const rpc = vi.fn().mockResolvedValue({ data: [], error: null });
    const repository = createTodayChallengeRepository({ functions: { invoke }, rpc } as never, "nba_preview")!;
    await expect(repository.loadToday()).rejects.toThrow();
    expect(invoke).toHaveBeenCalledWith("daily-challenge-runtime", {
      body: { mode: "get-today", sport: "nba", preview: true },
    });
    await repository.loadHistory();
    expect(rpc).toHaveBeenCalledWith("list_my_daily_challenge_history", { p_sport: "nba_preview" });
    expect(page).toContain('sport: ownerTest ? "nba_preview" : "nba"');
    expect(play).toContain('<TodayChallengeHub sport={ownerTest ? "nba_preview" : "nba"} />');
  });
});
