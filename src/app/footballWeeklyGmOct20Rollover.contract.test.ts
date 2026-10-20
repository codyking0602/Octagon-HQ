import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const page = readFileSync("src/features/back-room/FootballWeeklyGmPage.tsx", "utf8");
const solo = readFileSync("src/features/back-room/FootballGmModePage.tsx", "utf8");
const engine = readFileSync("src/features/back-room/footballGmEngine.ts", "utf8");
const migration = readFileSync("supabase/migrations/202612310314_weekly_gm_oct20_dak_penix.sql", "utf8");

describe("October 20 official Weekly GM rollover", () => {
  it("names the current matchup and retains original historical/owner preview labels", () => {
    expect(page).toContain('week_start === "2026-10-20"');
    expect(page).toContain('quarterback: "Dak Prescott"');
    expect(page).toContain('quarterback: "Michael Penix Jr."');
    expect(page).toContain('quarterback: "Josh Allen"');
    expect(page).toContain('quarterback: "Jaxson Dart"');
    expect(page).toContain("October 20–26");
    expect(page).toContain("October 26 at 11:59 PM Central");
    expect(page).toContain('state.week_start === "2026-10-13" && showAuctionReveal');
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
