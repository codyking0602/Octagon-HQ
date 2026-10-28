import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const page = readFileSync("src/features/back-room/FootballWeeklyGmPage.tsx", "utf8");
const solo = readFileSync("src/features/back-room/FootballGmModePage.tsx", "utf8");
const engine = readFileSync("src/features/back-room/footballGmEngine.ts", "utf8");
const migration = readFileSync("supabase/migrations/202612310314_weekly_gm_oct20_dak_penix.sql", "utf8");
const playHome = readFileSync("src/features/play/PlayV2Page.tsx", "utf8");
const auctionCenter = readFileSync("src/features/back-room/FootballWeeklyAuctionCenterPage.tsx", "utf8");

describe("October 20 official Weekly GM rollover", () => {
  it("names the current matchup and retains original historical/owner preview labels", () => {
    expect(page).toContain('weekStart === "2026-10-20"');
    expect(page).toContain('quarterback: "Dak Prescott"');
    expect(page).toContain('quarterback: "Michael Penix Jr."');
    expect(page).toContain('quarterback: "Josh Allen"');
    expect(page).toContain('quarterback: "Jaxson Dart"');
    expect(page).toContain("formatWeek(state.week_start)");
    expect(page).toContain("new Date(state.closes_at)");
    expect(page).toContain("repository.archivedResult(archive.week_start");
  });

  it("prefills the exact week-specific starting QB and never changes other weeks", () => {
    expect(solo).toContain('weeklyRun.seed.startsWith("weekly-gm:2026-10-20:")');
    expect(solo).toContain('"DAL|QB|dakprescott"');
    expect(solo).toContain('"ATL|QB|michaelpenix"');
    expect(solo).toContain('"BUF|QB|joshallen"');
    expect(solo).toContain('"NYG|QB|jaxsondart"');
    expect(engine).toContain('seed?.startsWith("weekly-gm:2026-10-13:young:")');
    expect(engine).toContain('seed?.startsWith("weekly-gm:2026-10-20:elite:")');
    expect(engine).toContain('seed?.startsWith("weekly-gm:2026-10-20:young:")');
  });

  it("links the October 20–26 Featured card to Weekly GM instead of the auction", () => {
    expect(playHome).toContain('Date.parse("2026-10-27T05:00:00Z")');
    expect(playHome).toContain("Dak Prescott + Michael Penix Jr.");
    expect(playHome).toContain('gmWeek ? "/football/weekly-gm" : "/football/weekly-auction"');
    expect(auctionCenter).toContain('Date.parse("2026-10-27T05:00:00Z")');
  });

  it("creates the exact Central-time event and enforces Dak/Penix on the server", () => {
    expect(migration).toContain("date '2026-10-20'");
    expect(migration).toContain("'2026-10-20 00:00:00 America/Chicago'");
    expect(migration).toContain("'2026-10-27 00:00:00 America/Chicago'");
    expect(migration).toContain("already has official attempts");
    expect(migration).toContain("v_attempt.week_start = date '2026-10-20'");
    expect(migration).toContain("'DAL|QB|dakprescott'");
    expect(migration).toContain("'ATL|QB|michaelpenix'");
    expect(migration).toContain("'BUF|QB|joshallen'");
    expect(migration).toContain("'NYG|QB|jaxsondart'");
    expect(migration).toContain("private.football_weekly_gm_verified_score(p_state)");
  });
});
